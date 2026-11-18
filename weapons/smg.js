/* smg.js - MP5 Navy: black polymer, round HK handguard, curved magazine, drum rear sight, extended skeleton stock */
(function () {
  CS.WeaponModels.mp5 = function () {
    const gfx = CS.gfx, S = gfx.skin, g = new THREE.Group();
    const b = (w, h, d, m, x, y, z, rx, ry, rz) => gfx.box(g, w, h, d, m, x, y, z, rx, ry, rz);
    const c = (r0, r1, l, m, x, y, z, s) => gfx.cyl(g, r0, r1, l, m, x, y, z, s);
    const blk = S('blk'), steel = S('steel');
    const mag = new THREE.Group(), bolt = new THREE.Group(); g.add(mag, bolt);

    b(.048, .060, .26, blk, 0, .014, -.07);                                     // receiver
    b(.050, .040, .10, blk, 0, -.030, -.02);                                    // trigger housing
    c(.036, .034, .17, blk, 0, .004, -.215, 14); b(.050, .016, .15, blk, 0, -.028, -.215);    // handguard
    c(.018, .018, .06, steel, 0, .012, -.34, 10); c(.021, .021, .012, steel, 0, .012, -.316, 10);   // barrel sleeve + lug ring
    b(.006, .030, .012, steel, 0, .052, -.35); c(.014, .014, .04, steel, 0, .056, -.35, 8);          // hooded front sight
    c(.020, .020, .03, steel, 0, .052, .03, 10); b(.012, .014, .02, blk, 0, .052, -.02);               // drum rear sight
    gfx.arc(mag, .028, .04, steel, 0, -.052, -.10, .06, 4, .08, .10);                                // curved 30-rd magazine
    b(.036, .10, .044, blk, 0, -.08, .02, -.3);                                                      // grip
    b(.028, .008, .06, blk, 0, -.052, -.03); b(.006, .02, .008, steel, 0, -.04, -.03);
    b(.004, .02, .05, steel, .026, .014, -.07);                                                       // ejection port
    b(.008, .010, .16, steel, .014, 0, .21); b(.008, .010, .16, steel, -.014, 0, .21);               // skeleton stock rods
    b(.040, .085, .014, blk, 0, -.02, .295, -.05);
    gfx.box(bolt, .012, .012, .028, steel, -.028, .026, -.05);                                        // cocking handle

    g.userData = { vp: [.15, -.10, -.50], grip: { r: [0, -.07, .02], l: [0, -.03, -.22] }, mz: [0, .012, -.37], ej: [.03, .02, -.06], parts: { mag, bolt } };
    return g;
  };
})();
