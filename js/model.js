/* model.js - 3rd-person CT & T player models with separate hitboxes and procedural animations */
(function () {
  CS.model = {
    create(unit) {
      const root = new THREE.Group();
      const isCT = unit.team === 'CT';

      const uniformMat = new THREE.MeshLambertMaterial({ color: isCT ? 0x263b5c : 0x6b6043 });
      const vestMat = new THREE.MeshLambertMaterial({ color: isCT ? 0x1a2638 : 0x3b3528 });
      const skinMat = new THREE.MeshLambertMaterial({ color: 0xd9ad8b });
      const headMat = new THREE.MeshLambertMaterial({ color: isCT ? 0x1f2836 : 0x222222 });

      const hitMeshes = [];
      const tag = (mesh, zone) => {
        mesh.userData = { unit, zone };
        hitMeshes.push(mesh);
        return mesh;
      };

      // Legs pivot
      const legL = tag(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.18), uniformMat), 'legs');
      legL.position.set(-0.12, 0.375, 0);
      const legR = tag(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.18), uniformMat), 'legs');
      legR.position.set(0.12, 0.375, 0);
      root.add(legL, legR);

      // Torso
      const torso = tag(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.24), vestMat), 'body');
      torso.position.set(0, 1.06, 0);
      root.add(torso);

      // Head + CT helmet / T balaclava
      const head = tag(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), headMat), 'head');
      head.position.set(0, 1.54, 0);
      root.add(head);

      const face = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.04), skinMat);
      face.position.set(0, 0.0, -0.13);
      head.add(face);

      // Arms
      const armL = tag(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, 0.14), uniformMat), 'body');
      armL.position.set(-0.31, 1.06, -0.08);
      armL.rotation.x = 0.6;
      const armR = tag(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, 0.14), uniformMat), 'body');
      armR.position.set(0.31, 1.06, -0.15);
      armR.rotation.x = 1.1;
      root.add(armL, armR);

      // Weapon mount on right hand
      const weaponMount = new THREE.Group();
      weaponMount.position.set(0.24, 1.12, -0.28);
      root.add(weaponMount);

      CS.world.scene.add(root);

      return {
        root, torso, head, legL, legR, armL, armR, weaponMount, hitMeshes,
        curWeaponId: null,
        walkPhase: 0,

        setWeapon(wid) {
          if (this.curWeaponId === wid) return;
          this.curWeaponId = wid;
          while (this.weaponMount.children.length) this.weaponMount.remove(this.weaponMount.children[0]);
          const builder = CS.WeaponModels[wid];
          if (builder) {
            const m = builder();
            m.scale.setScalar(0.85);
            this.weaponMount.add(m);
          }
        },

        update(dt) {
          root.visible = unit.alive && !unit.isLocal;
          if (!root.visible) return;

          root.position.copy(unit.pos);
          root.rotation.y = unit.yaw;
          this.setWeapon(unit.activeId);

          // Crouch compression
          const scaleY = unit.crouching ? 0.72 : 1.0;
          root.scale.set(1, scaleY, 1);

          // Walk animation
          const spd = Math.hypot(unit.vel.x, unit.vel.z);
          if (spd > 0.4 && unit.onGround) {
            this.walkPhase += dt * spd * 2.2;
            const swing = Math.sin(this.walkPhase) * 0.45;
            legL.rotation.x = swing;
            legR.rotation.x = -swing;
          } else {
            legL.rotation.x *= 0.8;
            legR.rotation.x *= 0.8;
          }

          // Pitch head & weapon mount slightly
          head.rotation.x = unit.pitch * 0.6;
          weaponMount.rotation.x = unit.pitch * 0.7;
        }
      };
    }
  };
})();
