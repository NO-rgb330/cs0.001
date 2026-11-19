/* knife.js - CS 1.6 combat knife: black ridged handle, steel clip-point blade (real extruded profile), small guard */
(function () {
  CS.WeaponModels.knife = function () {
    const gfx = CS.gfx, S = gfx.skin, g = new THREE.Group();
    const grip = S('kgrip'), steel = S('steel'), blade = S('blade');
    // handle + ridges, pommel, guard
    gfx.box(g, .030, .036, .115, grip, 0, 0, .035);
    for (let i = 0; i < 5; i++) gfx.box(g, .033, .039, .006, S('blk'), 0, 0, -.005 + i * .02);
    gfx.box(g, .034, .040, .014, steel, 0, 0, .10);
    gfx.box(g, .052, .016, .014, steel, 0, 0, -.026); gfx.box(g, .012, .050, .012, steel, 0, 0, -.028);
    // blade: clip-point profile extruded 6mm thick
    const s = new THREE.Shape();
    s.moveTo(0, .020); s.lineTo(.115, .020); s.lineTo(.182, -.002); s.quadraticCurveTo(.150, -.019, .112, -.021); s.lineTo(0, -.021); s.lineTo(0, .020);
    const geo = new THREE.ExtrudeGeometry(s, { depth: .006, bevelEnabled: false });
    geo.rotateY(Math.PI / 2); geo.translate(-.003, 0, -.033);
    g.add(new THREE.Mesh(geo, blade));
    gfx.box(g, .008, .006, .10, steel, 0, .019, -.09);                        // spine
    g.rotation.set(0, 0, 0);
    g.userData = { vp: [.14, -.12, -.42], grip: { r: [0, -.004, .05], l: null }, mz: [0, 0, -.2], ej: [0, 0, 0], parts: {} };
    return g;
  };
})();
