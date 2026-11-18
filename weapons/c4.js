/* c4.js - C4: olive brick with black straps, keypad + LCD (also used as the planted bomb on the ground) */
(function () {
  CS.WeaponModels.c4 = function () {
    const gfx = CS.gfx, S = gfx.skin, g = new THREE.Group();
    const olive = S('olive'), strap = S('blk');
    gfx.box(g, .30, .07, .20, olive, 0, .035, 0);                                           // main brick
    for (const x of [-.09, .09]) gfx.box(g, .03, .078, .205, strap, x, .037, 0);            // straps
    gfx.box(g, .11, .012, .10, strap, 0, .075, .02);                                         // keypad panel
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) gfx.box(g, .014, .004, .014, S('steel'), -.03 + j * .03, .083, .045 + i * .0 - i * .02 + .01);
    gfx.box(g, .08, .006, .03, new THREE.MeshBasicMaterial({ map: S('screen').map }), 0, .083, -.01);   // LCD
    const l = new THREE.Mesh(new THREE.BoxGeometry(.014, .014, .014), new THREE.MeshBasicMaterial({ color: 0xff2020 }));
    l.name = 'c4led'; l.position.set(.04, .085, .06); g.add(l);                              // blinking LED (toggled by world.js)
    g.userData = { vp: [.10, -.14, -.40], grip: { r: [0, -.02, .02], l: null }, mz: [0, 0, 0], ej: [0, 0, 0], parts: {} };
    return g;
  };
})();
