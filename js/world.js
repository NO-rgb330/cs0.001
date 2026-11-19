/* world.js - Three.js scene, map meshes, collision AABBs & ramps, raycasting, C4 & tracers */
(function () {
  CS.world = {
    scene: null,
    map: null,
    colliders: [],
    ramps: [],
    mapMeshes: [],
    tracers: [],
    bombObj: null,
    bombPos: null,
    bombPlanted: false,
    bombBeepTimer: 0,

    init(mapName) {
      const m = CS.Maps[mapName];
      this.map = m;
      this.colliders = [];
      this.ramps = [];
      this.mapMeshes = [];
      this.tracers = [];
      this.bombPlanted = false;
      this.bombPos = null;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(m.skyColor);
      scene.add(CS.gfx.makeSky());   // desert sky dome; dust2 has no distance fog
      this.scene = scene;

      // Sun & ambient lighting
      const hemi = new THREE.HemisphereLight(0xffffff, 0x9d9078, 0.9);
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xfff2d6, 0.6);
      sun.position.set(22, 38, 18);
      scene.add(sun);

      // Occluders for the baked sun shadows / contact shading
      const occ = m.boxes.map(bx => ({ src: bx, minX: bx.x - bx.w / 2, maxX: bx.x + bx.w / 2, minY: bx.y, maxY: bx.y + bx.h, minZ: bx.z - bx.d / 2, maxZ: bx.z + bx.d / 2 }));

      // Ground plane (lightmapped)
      const floor = CS.gfx.makeFloor(m, occ);
      scene.add(floor);
      this.mapMeshes.push(floor);

      // Boxes
      for (let bi = 0; bi < m.boxes.length; bi++) {
        const b = m.boxes[bi];
        const mesh = CS.gfx.makeBox(b, occ, occ[bi]);
        scene.add(mesh);
        this.mapMeshes.push(mesh);

        this.colliders.push({
          minX: b.x - b.w / 2, maxX: b.x + b.w / 2,
          minY: b.y,           maxY: b.y + b.h,
          minZ: b.z - b.d / 2, maxZ: b.z + b.d / 2
        });
      }

      // Ramps (visual inclined wedges + smooth height function)
      for (const r of m.ramps) {
        const len = r.axis === 'z' ? r.d : r.w;
        const dy = r.y2 - r.y1;
        const hyp = Math.hypot(len, dy);
        const angle = Math.atan2(dy, len);

        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(r.axis === 'x' ? hyp : r.w, 0.25, r.axis === 'z' ? hyp : r.d, 8, 1, 8),
          CS.gfx.worldMat(r.tex)
        );
        slab.position.set(r.x, (r.y1 + r.y2) * 0.5 - 0.12, r.z);
        if (r.axis === 'z') slab.rotation.x = -angle;
        else slab.rotation.z = angle;
        CS.gfx.bake(slab, occ, r.tex, null);
        scene.add(slab);
        this.mapMeshes.push(slab);

        this.ramps.push({
          minX: r.x - r.w / 2, maxX: r.x + r.w / 2,
          minZ: r.z - r.d / 2, maxZ: r.z + r.d / 2,
          y1: r.y1, y2: r.y2, axis: r.axis
        });
      }

      // Painted bombsite markers on floor/platforms
      for (const s of m.sites) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(s.r - 0.18, s.r, 32),
          new THREE.MeshBasicMaterial({ color: 0xcc2222, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(s.x, s.y + 0.02, s.z);
        scene.add(ring);
      }

      // Planted C4 object (hidden until planted)
      this.bombObj = CS.WeaponModels.c4();
      this.bombObj.visible = false;
      scene.add(this.bombObj);
    },

    plantBomb(pos) {
      this.bombPlanted = true;
      this.bombPos = pos.clone();
      this.bombObj.position.set(pos.x, pos.y + 0.035, pos.z);
      this.bombObj.visible = true;
      this.bombBeepTimer = 0;
    },

    clearBomb() {
      this.bombPlanted = false;
      this.bombPos = null;
      if (this.bombObj) this.bombObj.visible = false;
    },

    // Returns floor height at (x, z) considering boxes below curY + step and ramps
    getFloorY(x, z, feetY, radius) {
      let best = 0;
      const step = CS.phys.stepHeight;

      for (const c of this.colliders) {
        if (x + radius > c.minX && x - radius < c.maxX && z + radius > c.minZ && z - radius < c.maxZ) {
          if (c.maxY <= feetY + step && c.maxY > best) best = c.maxY;
        }
      }
      for (const r of this.ramps) {
        if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) {
          const t = r.axis === 'z'
            ? (z - r.minZ) / (r.maxZ - r.minZ)
            : (x - r.minX) / (r.maxX - r.minX);
          const ry = r.y1 + (r.y2 - r.y1) * THREE.MathUtils.clamp(t, 0, 1);
          if (ry <= feetY + step + 0.3 && ry > best) best = ry;
        }
      }
      return best;
    },

    // Check horizontal overlap against walls/tall crates
    collidesHoriz(x, feetY, z, radius, height) {
      const low = feetY + CS.phys.stepHeight;
      const high = feetY + height;
      for (const c of this.colliders) {
        if (high > c.minY && low < c.maxY) {
          if (x + radius > c.minX && x - radius < c.maxX && z + radius > c.minZ && z - radius < c.maxZ) {
            return c;
          }
        }
      }
      return null;
    },

    raycastMap(origin, dir, maxDist = 200) {
      const rc = new THREE.Raycaster(origin, dir, 0.05, maxDist);
      const hits = rc.intersectObjects(this.mapMeshes, false);
      return hits.length ? hits[0] : null;
    },

    addTracer(start, end, isHit) {
      const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
      const mat = new THREE.LineBasicMaterial({ color: 0xffe488, transparent: true, opacity: 0.75 });
      const line = new THREE.Line(geo, mat);
      this.scene.add(line);

      let spark = null;
      if (isHit) {
        spark = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, 0.08),
          new THREE.MeshBasicMaterial({ color: 0xffaa33 })
        );
        spark.position.copy(end);
        this.scene.add(spark);
      }
      this.tracers.push({ line, spark, life: 0.075 });
    },

    update(dt) {
      for (let i = this.tracers.length - 1; i >= 0; i--) {
        const t = this.tracers[i];
        t.life -= dt;
        if (t.life <= 0) {
          this.scene.remove(t.line);
          t.line.geometry.dispose();
          if (t.spark) this.scene.remove(t.spark);
          this.tracers.splice(i, 1);
        }
      }

      if (this.bombPlanted && this.bombObj) {
        this.bombBeepTimer -= dt;
        const led = this.bombObj.getObjectByName('c4led');
        const remainFrac = Math.max(0.12, CS.round.bombTimer / CS.cfg.bombTime);
        if (this.bombBeepTimer <= 0) {
          this.bombBeepTimer = 0.15 + remainFrac * 0.85;
          CS.sfx.beep();
          if (led) led.visible = true;
        } else if (led && this.bombBeepTimer < (0.15 + remainFrac * 0.85) * 0.75) {
          led.visible = false;
        }
      }
    },

    inSite(pos) {
      for (const s of this.map.sites) {
        const d = Math.hypot(pos.x - s.x, pos.z - s.z);
        if (d <= s.r && Math.abs(pos.y - s.y) < 1.5) return s;
      }
      return null;
    }
  };
})();
