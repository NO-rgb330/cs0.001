/* wm.js - weapon modelling kit (Milestone 1: modelling foundation). Loaded before every weapons/*.js file.

   CONVENTIONS
   - Units are metres. Local axes: +x right, +y up, -z forward (barrel points to -z). Origin = trigger / grip area of the weapon.
   - Every model is a root THREE.Group named <ID>_ROOT that contains UPPER_SNAKE_CASE assembly groups
     (RECEIVER_ASSEMBLY, FRONT_ASSEMBLY, HANDGUARD_ASSEMBLY, MAGAZINE_ASSEMBLY, STOCK_ASSEMBLY, GRIP_ASSEMBLY, TRIGGER_ASSEMBLY, ATTACHMENTS ...).
     Only the groups a weapon really has are created; moving parts live in PIVOT_* groups, attachment points are ANCHOR_* objects.
   - Geometry is cached by key and shared between instances (viewmodel, bots); materials come from CS.gfx.skin() and are shared too.
   - root.userData follows one schema (see finish()): vp, anchors, pivots, assemblies, optional animate(state) and the legacy keys
     grip / mz / ej / parts that hands.js and weapons.js already read. */
(function () {
  const T = THREE, cache = {};

  CS.WM = {
    geo(key, make) { return cache[key] || (cache[key] = make()); },

    grp(name, parent) { const g = new T.Group(); g.name = name; if (parent) parent.add(g); return g; },

    mesh(parent, geo, mat, x, y, z, rx, ry, rz, name) {
      const m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0);
      if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
      if (name) m.name = name; parent.add(m); return m;
    },

    box(parent, w, h, d, mat, x, y, z, rx, ry, rz, name) {
      return this.mesh(parent, this.geo('box:' + w + ',' + h + ',' + d, () => new T.BoxGeometry(w, h, d)), mat, x, y, z, rx, ry, rz, name);
    },

    // cylinder along the barrel axis; r0 = rear (+z) radius, r1 = front radius
    cyl(parent, r0, r1, len, mat, x, y, z, seg, name, rx, ry, rz) {
      return this.mesh(parent, this.geo('cyl:' + [r0, r1, len, seg || 12], () => { const g = new T.CylinderGeometry(r0, r1, len, seg || 12); g.rotateX(Math.PI / 2); return g; }), mat, x, y, z, rx, ry, rz, name);
    },

    rrect(w, h, r) {                                         // rounded rectangle centred on the origin
      const s = new T.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
    },

    // side profile: pts = [[z, y], ...] (forward is negative z), extruded across x. opt: bevel, uv (texture repeats per metre), holes (arrays of [z,y])
    side(parent, key, pts, width, mat, x, y, z, opt, name) {
      opt = opt || {};
      const geo = this.geo('side:' + key, () => {
        const s = new T.Shape(); pts.forEach((p, i) => i ? s.lineTo(-p[0], p[1]) : s.moveTo(-p[0], p[1]));
        for (const h of opt.holes || []) { const p = new T.Path(); h.forEach((q, i) => i ? p.lineTo(-q[0], q[1]) : p.moveTo(-q[0], q[1])); s.holes.push(p); }
        const b = opt.bevel || 0, depth = width - 2 * b;
        const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 1, curveSegments: 6 });
        g.rotateY(Math.PI / 2); g.translate(-depth / 2, 0, 0);
        if (opt.flare) { const p = g.attributes.position, f = opt.flare; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (1 + f[0] * (p.getZ(i) - f[1]) / f[2])); g.computeVertexNormals(); }   // flare = [amount, z0, length]: width grows linearly with z
        if (opt.uv) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * opt.uv, uv.getY(i) * opt.uv); }
        return g;
      });
      return this.mesh(parent, geo, mat, x, y, z, 0, 0, 0, name);
    },

    // cross-section shape (x, y) extruded along z for len. opt: uv
    section(parent, key, shape, len, mat, x, y, z, opt, name) {
      opt = opt || {};
      const geo = this.geo('sec:' + key, () => {
        const g = new T.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, curveSegments: 8 }); g.translate(0, 0, -len / 2);
        if (opt.uv) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * opt.uv, uv.getY(i) * opt.uv); }
        return g;
      });
      return this.mesh(parent, geo, mat, x, y, z, 0, 0, 0, name);
    },

    ring(parent, key, rOut, rIn, len, mat, x, y, z, name) {   // tube around the z axis (sight hoods, bands)
      const s = new T.Shape(); s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
      const h = new T.Path(); h.absarc(0, 0, rIn, 0, Math.PI * 2, true); s.holes.push(h);
      return this.section(parent, 'ring:' + key, s, len, mat, x, y, z, null, name);
    },

    anchor(parent, name, x, y, z) { const o = new T.Object3D(); o.name = name; o.position.set(x, y, z); parent.add(o); return o; },

    // standard metadata block consumed by hands.js / weapons.js
    finish(root, a) {
      const at = a.attachments || root, an = {};
      an.rHand = this.anchor(at, 'ANCHOR_R_HAND', a.rHand[0], a.rHand[1], a.rHand[2]);
      if (a.lHand) an.lHand = this.anchor(at, 'ANCHOR_L_HAND', a.lHand[0], a.lHand[1], a.lHand[2]);
      an.muzzle = this.anchor(at, 'ANCHOR_MUZZLE', a.muzzle[0], a.muzzle[1], a.muzzle[2]);
      an.eject = this.anchor(at, 'ANCHOR_EJECT', a.eject[0], a.eject[1], a.eject[2]);
      if (a.magPoint) an.mag = this.anchor(at, 'ANCHOR_MAG', a.magPoint[0], a.magPoint[1], a.magPoint[2]);
      const pv = a.pivots || {};
      root.userData = {
        id: a.id, vp: a.vp, anchors: an, pivots: pv, assemblies: a.assemblies || {}, animate: a.animate || null,
        grip: { r: a.rHand, l: a.lHand || null }, mz: a.muzzle, ej: a.eject,
        parts: { mag: pv.mag, bolt: pv.bolt, slide: pv.slide }, sil: !!a.sil
      };
      return root;
    },

    register(id, builder) {
      if (CS.WeaponModels[id]) console.warn('[CS.WM] weapon model "' + id + '" registered twice - the later one wins');
      CS.WeaponModels[id] = builder;
    }
  };
})();
