/* render.js - GoldSrc / CS 1.6 presentation:
   - fixed internal resolution (1024x768 style), no anti-aliasing, bilinear low-res textures
   - world lighting is BAKED into vertex colours like lightmaps (sun + shadows + contact shading), no dynamic PBR
   - flat Lambert models, no specular; painted 128px textures; sky dome; viewmodel drawn in its own depth pass */
(function () {
  const T = THREE;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const rng = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  // ---------- procedural 128px textures, quantised like the 8-bit palette textures GoldSrc used ----------
  function quant(c, w, h, levels) {
    const id = c.getImageData(0, 0, w, h), d = id.data, s = 255 / (levels - 1);
    for (let i = 0; i < d.length; i += 4) { d[i] = Math.round(d[i] / s) * s; d[i + 1] = Math.round(d[i + 1] / s) * s; d[i + 2] = Math.round(d[i + 2] / s) * s; }
    c.putImageData(id, 0, 0);
  }
  function paint(seed, fn, w = 128, h = 128, levels = 32) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d'); fn(c, w, h, rng(seed)); quant(c, w, h, levels);
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
  }
  function blotches(c, s, r, n, cols, rmin, rmax) {
    for (let i = 0; i < n; i++) {
      const x = r() * s, y = r() * s, rad = rmin + r() * (rmax - rmin), g = c.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, cols[(r() * cols.length) | 0]); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  }
  function specks(c, s, r, n, cols, maxSz) {
    for (let i = 0; i < n; i++) { c.fillStyle = cols[(r() * cols.length) | 0]; c.fillRect(r() * s, r() * s, 1 + r() * maxSz, 1 + r() * maxSz * .7); }
  }

  const WORLD = {
    sand: (c, w, h, r) => {
      c.fillStyle = '#c6aa78'; c.fillRect(0, 0, w, h);
      blotches(c, w, r, 26, ['rgba(150,120,80,.35)', 'rgba(228,204,152,.42)'], 10, 30);
      specks(c, w, r, 520, ['rgba(120,95,60,.45)', 'rgba(236,216,172,.5)'], 2);
      specks(c, w, r, 36, ['rgba(95,75,52,.7)'], 1);
    },
    wall: (c, w, h, r) => {   // dust2 plaster / limestone blocks
      c.fillStyle = '#c4a574'; c.fillRect(0, 0, w, h);
      for (let row = 0; row < 3; row++) {
        const y = row * 43, off = row % 2 ? 32 : 0;
        for (let x = -64 + off; x < w; x += 64) {
          const tone = (r() - .5) * 30; c.fillStyle = `rgb(${196 + tone},${165 + tone},${116 + tone})`; c.fillRect(x + 1, y + 1, 62, 41);
        }
      }
      c.strokeStyle = '#95794f'; c.lineWidth = 2;
      for (let row = 0; row <= 3; row++) { c.beginPath(); c.moveTo(0, row * 43); c.lineTo(w, row * 43); c.stroke(); }
      for (let row = 0; row < 3; row++) { const off = row % 2 ? 32 : 0; for (let x = off; x < w + 64; x += 64) { c.beginPath(); c.moveTo(x, row * 43); c.lineTo(x, row * 43 + 43); c.stroke(); } }
      blotches(c, w, r, 14, ['rgba(140,110,70,.28)', 'rgba(225,200,150,.25)'], 8, 22);
      specks(c, w, r, 260, ['rgba(110,86,56,.4)', 'rgba(230,210,165,.4)'], 2);
      c.strokeStyle = 'rgba(100,78,50,.55)'; c.lineWidth = 1;
      for (let i = 0; i < 3; i++) { let x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - .5) * 14; y += 4 + r() * 8; c.lineTo(x, y); } c.stroke(); }
    },
    sandstone: (c, w, h, r) => {
      c.fillStyle = '#d3b98a'; c.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 7 + ((r() * 6) | 0)) { c.fillStyle = `rgba(${150 + r() * 30},${120 + r() * 25},${80},.28)`; c.fillRect(0, y, w, 1 + r() * 2); }
      blotches(c, w, r, 16, ['rgba(150,120,80,.3)', 'rgba(236,214,166,.35)'], 8, 24);
      specks(c, w, r, 300, ['rgba(120,96,64,.4)', 'rgba(240,222,176,.45)'], 2);
    },
    crate: (c, w, h, r) => {
      c.fillStyle = '#8d5d30'; c.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 21) {
        c.fillStyle = `rgba(${60 + r() * 30},${36 + r() * 16},16,.25)`; c.fillRect(x, 0, 2, h);
        for (let k = 0; k < 7; k++) { c.fillStyle = r() < .5 ? 'rgba(70,40,18,.3)' : 'rgba(170,115,60,.3)'; c.fillRect(x + 2 + r() * 17, r() * h, 1, 8 + r() * 30); }
      }
      c.strokeStyle = '#4f3218'; c.lineWidth = 9; c.strokeRect(4, 4, w - 8, h - 8);
      c.lineWidth = 7; c.beginPath(); c.moveTo(6, 6); c.lineTo(w - 6, h - 6); c.stroke();
      c.fillStyle = '#c8a46a'; for (const p of [[8, 8], [w - 9, 8], [8, h - 9], [w - 9, h - 9]]) c.fillRect(p[0] - 1, p[1] - 1, 3, 3);
    }
  };

  // ---------- weapon / glove "skins" ----------
  const SKIN = {
    blued: (c, w, h, r) => { c.fillStyle = '#34373d'; c.fillRect(0, 0, w, h); specks(c, w, r, 800, ['rgba(80,84,92,.45)', 'rgba(18,19,22,.5)'], 1);
      for (let i = 0; i < 22; i++) { c.fillStyle = 'rgba(110,114,122,.22)'; c.fillRect(0, r() * h, w, 1); }
      c.strokeStyle = '#5c6068'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2); },
    anod: (c, w, h, r) => { c.fillStyle = '#3a3b3e'; c.fillRect(0, 0, w, h); specks(c, w, r, 700, ['rgba(82,83,87,.5)', 'rgba(24,24,26,.55)'], 1);
      c.strokeStyle = '#66676b'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2); },
    supp: (c, w, h, r) => { c.fillStyle = '#323335'; c.fillRect(0, 0, w, h); specks(c, w, r, 600, ['rgba(70,71,74,.5)', 'rgba(16,16,18,.5)'], 1);
      for (let y = 8; y < h; y += 24) { c.fillStyle = 'rgba(18,18,20,.6)'; c.fillRect(0, y, w, 3); } },
    pad: (c, w, h, r) => { c.fillStyle = '#111113'; c.fillRect(0, 0, w, h); specks(c, w, r, 400, ['rgba(34,34,38,.6)'], 1);
      for (let x = 6; x < w; x += 12) { c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(x, 0, 3, h); } },
    park: (c, w, h, r) => { c.fillStyle = '#202225'; c.fillRect(0, 0, w, h); specks(c, w, r, 700, ['rgba(52,55,60,.5)', 'rgba(8,8,9,.55)'], 1); },
    steel: (c, w, h, r) => { c.fillStyle = '#2e3035'; c.fillRect(0, 0, w, h); specks(c, w, r, 700, ['rgba(70,74,80,.5)', 'rgba(15,16,18,.5)'], 1);
      for (let i = 0; i < 18; i++) { c.fillStyle = 'rgba(95,99,106,.28)'; c.fillRect(0, r() * h, w, 1); }
      c.strokeStyle = '#575b61'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2); },
    slide: (c, w, h, r) => { c.fillStyle = '#44474d'; c.fillRect(0, 0, w, h); specks(c, w, r, 600, ['rgba(95,99,106,.4)', 'rgba(25,26,30,.4)'], 1);
      c.fillStyle = 'rgba(120,124,132,.25)'; c.fillRect(0, 0, w, 6); c.strokeStyle = '#666a72'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2); },
    blk: (c, w, h, r) => { c.fillStyle = '#1a1b1e'; c.fillRect(0, 0, w, h); specks(c, w, r, 900, ['rgba(44,46,52,.6)', 'rgba(8,8,10,.6)'], 1); },
    grip: (c, w, h, r) => { c.fillStyle = '#2b1b12'; c.fillRect(0, 0, w, h); specks(c, w, r, 500, ['rgba(70,44,28,.5)', 'rgba(14,8,5,.6)'], 1); },
    wood: (c, w, h, r) => { c.fillStyle = '#904f21'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 46; i++) { c.fillStyle = r() < .55 ? `rgba(88,42,14,${.18 + r() * .25})` : `rgba(190,116,52,${.15 + r() * .2})`; c.fillRect(r() * w, 0, 1 + r() * 3, h); }
      for (let i = 0; i < 3; i++) { const x = r() * w, y = r() * h; c.fillStyle = 'rgba(70,32,10,.45)'; c.beginPath(); c.ellipse(x, y, 3 + r() * 3, 8 + r() * 6, 0, 0, 7); c.fill(); } },
    green: (c, w, h, r) => { c.fillStyle = '#3b5636'; c.fillRect(0, 0, w, h); blotches(c, w, r, 22, ['rgba(80,110,72,.45)', 'rgba(26,44,24,.5)'], 6, 20);
      specks(c, w, r, 500, ['rgba(95,125,86,.4)', 'rgba(20,32,18,.5)'], 1); },
    chrome: (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6f9fb'); g.addColorStop(.22, '#b4bcc4'); g.addColorStop(.5, '#6c757d');
      g.addColorStop(.58, '#cdd4da'); g.addColorStop(1, '#8e979e'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.strokeStyle = '#8b949b'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2); },
    blade: (c, w, h, r) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#eef2f5'); g.addColorStop(.45, '#b3bbc3'); g.addColorStop(1, '#6e767e');
      c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(r() * w, 0, 1, h); } },
    kgrip: (c, w, h) => { c.fillStyle = '#131315'; c.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 10) { c.fillStyle = '#2c2d31'; c.fillRect(0, y, w, 2); } },
    glove: (c, w, h, r) => { c.fillStyle = '#17181b'; c.fillRect(0, 0, w, h); specks(c, w, r, 500, ['rgba(40,42,48,.6)', 'rgba(6,6,8,.6)'], 1);
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(48,50,56,.5)'; c.fillRect(0, r() * h, w, 1); } },
    sleeveCT: (c, w, h, r) => { c.fillStyle = '#2b3b58'; c.fillRect(0, 0, w, h); specks(c, w, r, 700, ['rgba(60,78,108,.45)', 'rgba(18,26,42,.5)'], 1);
      for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(16,24,40,.35)'; c.fillRect(0, r() * h, w, 2); } },
    sleeveT: (c, w, h, r) => { c.fillStyle = '#5d5236'; c.fillRect(0, 0, w, h); specks(c, w, r, 700, ['rgba(110,98,64,.45)', 'rgba(34,30,18,.5)'], 1);
      for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(34,30,18,.35)'; c.fillRect(0, r() * h, w, 2); } },
    olive: (c, w, h, r) => { c.fillStyle = '#4d5236'; c.fillRect(0, 0, w, h); specks(c, w, r, 600, ['rgba(96,104,72,.45)', 'rgba(28,30,18,.5)'], 1); },
    screen: (c, w, h) => { c.fillStyle = '#0d2b14'; c.fillRect(0, 0, w, h); c.fillStyle = '#3cff5a'; c.font = 'bold 40px monospace'; c.fillText('0:40', 18, 80); }
  };

  // weapon skins: painted at 128px, then point-sampled down to 64px, 10-level palette, NEAREST filtering, no mipmaps -> crisp low-res GoldSrc texels
  function paintSkin(seed, fn) {
    const big = document.createElement('canvas'); big.width = big.height = 128;
    fn(big.getContext('2d'), 128, 128, rng(seed));
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false; c.drawImage(big, 0, 0, 64, 64); quant(c, 64, 64, 28);
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping;
    t.magFilter = T.NearestFilter; t.minFilter = T.NearestFilter; t.generateMipmaps = false; return t;
  }

  const texCache = {}, skinCache = {};
  const TEXSEED = { sand: 11, wall: 22, sandstone: 33, crate: 44 };

  CS.gfx = {
    lines: 768,                                           // internal render height (1024x768 like the original)
    sun: new T.Vector3(0.52, 0.74, 0.42).normalize(),     // sun direction the "lightmaps" are baked against
    sky: null,

    // ----- renderer -----
    setSize(renderer, camera) {
      const w = window.innerWidth, h = window.innerHeight, k = Math.min(1, this.lines / h);
      renderer.setPixelRatio(1);
      renderer.setSize(Math.max(2, Math.round(w * k)), Math.max(2, Math.round(h * k)), false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      const hd = CS.hands; if (hd && hd.cam) { hd.cam.aspect = w / h; hd.cam.updateProjectionMatrix(); }
    },
    render(renderer, scene, camera) {
      if (this.sky) this.sky.position.copy(camera.position);
      renderer.autoClear = true; renderer.render(scene, camera);
      const hd = CS.hands;                                // viewmodel gets its own depth range so it never clips into walls
      if (hd && hd.scene && hd.rig && hd.rig.visible) { renderer.autoClear = false; renderer.clearDepth(); renderer.render(hd.scene, hd.cam); renderer.autoClear = true; }
    },

    // ----- materials -----
    tex(kind) { return texCache[kind] || (texCache[kind] = paint(TEXSEED[kind] || 7, WORLD[kind] || WORLD.wall)); },
    skin(kind) { return skinCache[kind] || (skinCache[kind] = new T.MeshLambertMaterial({ map: paintSkin(kind.length * 17, SKIN[kind] || SKIN.steel) })); },
    lam(color) { return new T.MeshLambertMaterial({ color }); },
    worldMat(kind, tint) { return new T.MeshBasicMaterial({ map: this.tex(kind), vertexColors: true, color: tint != null ? tint : 0xffffff }); },

    // ----- sky dome (desert haze) -----
    makeSky() {
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const c = cv.getContext('2d'), r = rng(5);
      const g = c.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#5b8fd0'); g.addColorStop(.38, '#8fb6e2'); g.addColorStop(.47, '#dfe3da'); g.addColorStop(.5, '#ece3c8'); g.addColorStop(.52, '#c9b78e'); g.addColorStop(1, '#a8936a');
      c.fillStyle = g; c.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 16; i++) { const x = r() * 512, y = 40 + r() * 70; c.fillStyle = `rgba(255,255,255,${.18 + r() * .22})`; c.beginPath(); c.ellipse(x, y, 30 + r() * 50, 4 + r() * 6, 0, 0, 7); c.fill(); }
      quant(c, 512, 256, 40);
      const mesh = new T.Mesh(new T.SphereGeometry(450, 24, 16), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), side: T.BackSide, fog: false, depthWrite: false }));
      mesh.renderOrder = -10; this.sky = mesh; return mesh;
    },

    // ----- baked world lighting ("lightmaps" stored per vertex) -----
    occluded(ox, oy, oz, occ) {
      const s = this.sun;
      for (const o of occ) {
        let t0 = 0, t1 = 36, ok = true;
        const ax = [[ox, o.minX, o.maxX, s.x], [oy, o.minY, o.maxY, s.y], [oz, o.minZ, o.maxZ, s.z]];
        for (let k = 0; k < 3 && ok; k++) {
          const a = ax[k];
          if (Math.abs(a[3]) < 1e-6) { if (a[0] < a[1] || a[0] > a[2]) ok = false; }
          else { let u = (a[1] - a[0]) / a[3], v = (a[2] - a[0]) / a[3]; if (u > v) { const x = u; u = v; v = x; } t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 > t1) ok = false; }
        }
        if (ok) return true;
      }
      return false;
    },
    light(p, n, occ, self) {
      let direct = Math.max(0, n.dot(this.sun));
      if (direct > 0 && this.occluded(p.x + n.x * .04, p.y + n.y * .04, p.z + n.z * .04, occ)) direct = 0;
      let dm = 3;
      for (const o of occ) {
        if (o === self) continue;
        const d = Math.hypot(Math.max(o.minX - p.x, 0, p.x - o.maxX), Math.max(o.minY - p.y, 0, p.y - o.maxY), Math.max(o.minZ - p.z, 0, p.z - o.maxZ));
        if (d > .02 && d < dm) dm = d;
      }
      let ao = .74 + .26 * smooth(0, 2.4, dm);
      if (n.y < .5) ao *= .86 + .14 * smooth(0, 1.6, p.y);
      let lit = .52 * ao + .66 * direct;
      const h = Math.sin(Math.floor(p.x * .7) * 12.9898 + Math.floor(p.y * .7) * 78.233 + Math.floor(p.z * .7) * 37.719) * 43758.5453;
      lit *= (1 + ((h - Math.floor(h)) - .5) * .07) * 1.12;           // lightmap-texel variance + overbright
      return [lit * (1 + .05 * direct), lit, lit * (1 - .07 * direct + .06 * (1 - direct))];
    },
    bake(mesh, occ, kind, self) {
      mesh.updateMatrixWorld(true);
      const g = mesh.geometry, pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, N = pos.count;
      const col = new Float32Array(N * 3), p = new T.Vector3(), n = new T.Vector3(), nm = new T.Matrix3().getNormalMatrix(mesh.matrixWorld);
      for (let i = 0; i < N; i++) {
        p.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
        const L = this.light(p, n, occ, self); col[i * 3] = L[0]; col[i * 3 + 1] = L[1]; col[i * 3 + 2] = L[2];
        if (kind !== 'crate') {                                        // world-space UVs: constant texel density (3 m per 128px tile)
          const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
          const u = ay >= ax && ay >= az ? [p.x, p.z] : ax >= az ? [p.z, p.y] : [p.x, p.y];
          uv.setXY(i, u[0] / 3, u[1] / 3);
        }
      }
      g.setAttribute('color', new T.BufferAttribute(col, 3));
    },
    makeFloor(m, occ) {
      const n = Math.round(m.size / 1.5), mesh = new T.Mesh(new T.PlaneGeometry(m.size, m.size, n, n), this.worldMat(m.floorTex));
      mesh.rotation.x = -Math.PI / 2; this.bake(mesh, occ, m.floorTex, null); return mesh;
    },
    makeBox(b, occ, self) {
      const geo = new T.BoxGeometry(b.w, b.h, b.d, clamp(Math.ceil(b.w / 2), 1, 34), clamp(Math.ceil(b.h / 2), 1, 4), clamp(Math.ceil(b.d / 2), 1, 34));
      const mesh = new T.Mesh(geo, this.worldMat(b.tex, b.color)); mesh.position.set(b.x, b.y + b.h / 2, b.z);
      this.bake(mesh, occ, b.tex, self); return mesh;
    },

    // ----- weapon-building helpers (barrel axis = z, forward = -z) -----
    box(p, w, h, d, mat, x, y, z, rx, ry, rz) { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); p.add(m); return m; },
    cyl(p, r0, r1, len, mat, x, y, z, seg) { const g = new T.CylinderGeometry(r0, r1, len, seg || 12); g.rotateX(Math.PI / 2); const m = new T.Mesh(g, mat); m.position.set(x || 0, y || 0, z || 0); p.add(m); return m; },
    arc(p, w, d, mat, x, y, z, L, n, a, da) { for (let i = 0; i < n; i++) { this.box(p, w, L, d, mat, x, y - Math.cos(a) * L / 2, z - Math.sin(a) * L / 2, a); y -= Math.cos(a) * L; z -= Math.sin(a) * L; a += da; } }
  };

  CS.tex.get = (kind) => CS.gfx.tex(kind);
})();
