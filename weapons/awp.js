/* awp.js - Arctic Warfare Magnum: dark-green polymer stock, long barrel + brake, large scope, bolt handle with ball knob, folded bipod */
(function () {
  CS.WeaponModels.awp = function () {
    const gfx = CS.gfx, S = gfx.skin, g = new THREE.Group();
    const b = (w, h, d, m, x, y, z, rx, ry, rz) => gfx.box(g, w, h, d, m, x, y, z, rx, ry, rz);
    const c = (r0, r1, l, m, x, y, z, s) => gfx.cyl(g, r0, r1, l, m, x, y, z, s);
    const steel = S('steel'), green = S('green'), dark = S('blk');
    const mag = new THREE.Group(), bolt = new THREE.Group(); g.add(mag, bolt);

    b(.048, .070, .34, steel, 0, 0, -.03);                                           // receiver
    b(.056, .065, .36, green, 0, -.012, -.20);                                       // fore-end chassis
    b(.050, .100, .26, green, 0, -.025, .25, -.08); b(.045, .030, .16, green, 0, .040, .24, -.08);   // rear stock + cheek rest
    b(.044, .040, .06, dark, 0, -.030, .18); b(.052, .110, .016, dark, 0, -.04, .385, -.08);          // thumb-hole + recoil pad
    b(.036, .090, .040, green, 0, -.08, .10, -.3);                                    // grip
    b(.030, .008, .07, steel, 0, -.052, .03);                                         // trigger guard
    c(.0155, .0155, .56, steel, 0, .012, -.62, 12);                                   // barrel
    c(.020, .020, .075, steel, 0, .012, -.945, 12); b(.042, .006, .012, dark, 0, .012, -.935); b(.042, .006, .012, dark, 0, .012, -.955);   // muzzle brake
    // scope: tube, objective + eyepiece bells, lens, turrets, mounts
    c(.027, .027, .30, dark, 0, .088, -.08, 14); c(.030, .042, .075, dark, 0, .088, -.275, 14); c(.036, .028, .06, dark, 0, .088, .10, 14);
    c(.034, .034, .004, new THREE.MeshBasicMaterial({ color: 0x1a3d66 }), 0, .088, -.314, 14);
    b(.018, .024, .018, steel, 0, .12, -.08); b(.018, .018, .024, steel, .034, .088, -.08);
    b(.022, .032, .02, steel, 0, .052, -.17); b(.022, .032, .02, steel, 0, .052, 0);
    // bolt handle + ball knob, magazine, folded bipod legs
    gfx.box(bolt, .06, .011, .011, steel, .04, .03, .06); const k = new THREE.Mesh(new THREE.SphereGeometry(.016, 8, 6), steel); k.position.set(.075, .03, .06); bolt.add(k);
    gfx.box(mag, .034, .07, .09, steel, 0, -.07, -.03);
    b(.008, .008, .16, steel, .02, -.05, -.25); b(.008, .008, .16, steel, -.02, -.05, -.25);

    g.userData = { vp: [.14, -.10, -.56], grip: { r: [0, -.08, .10], l: [0, -.04, -.22] }, mz: [0, .012, -.99], ej: [.03, .02, 0], parts: { mag, bolt } };
    return g;
  };
})();
