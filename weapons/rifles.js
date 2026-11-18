/* rifles.js - AK-47 and M4A1 (CS 1.6 viewmodel proportions: orange wood + banana mag on the AK, black M4A1 with its silencer attached by default) */
(function () {
  CS.WeaponModels.ak47 = function () {
    const gfx = CS.gfx, S = gfx.skin, g = new THREE.Group();
    const b = (w, h, d, m, x, y, z, rx, ry, rz) => gfx.box(g, w, h, d, m, x, y, z, rx, ry, rz);
    const c = (r0, r1, l, m, x, y, z, s) => gfx.cyl(g, r0, r1, l, m, x, y, z, s);
    const steel = S('steel'), wood = S('wood'), grip = S('grip'), dark = S('blk');
    const mag = new THREE.Group(), bolt = new THREE.Group(); g.add(mag, bolt);

    // stamped receiver, dust cover, rear sight, selector lever
    b(.046, .060, .30, steel, 0, .004, -.08);
    b(.044, .022, .27, steel, 0, .046, -.075);
    b(.024, .010, .24, steel, 0, .060, -.075);
    b(.020, .010, .05, steel, 0, .060, -.205); b(.016, .014, .012, dark, 0, .070, -.222);
    b(.004, .012, .16, steel, .0245, .014, -.06);
    // wooden furniture: lower + upper handguard with the metal heat-shield bands
    b(.054, .050, .20, wood, 0, -.012, -.30);
    b(.046, .026, .18, wood, 0, .034, -.30);
    b(.050, .058, .008, dark, 0, .016, -.205); b(.050, .058, .008, dark, 0, .016, -.395);
    // barrel, gas tube + block, hooded front sight, slant muzzle brake, cleaning rod
    c(.0105, .0105, .34, steel, 0, .012, -.55, 10);
    c(.0095, .0095, .12, steel, 0, .043, -.47, 8);
    b(.030, .046, .034, steel, 0, .028, -.47);
    b(.022, .026, .040, steel, 0, .056, -.50); b(.005, .030, .005, dark, 0, .083, -.50);
    b(.004, .026, .016, steel, .011, .079, -.50); b(.004, .026, .016, steel, -.011, .079, -.50);
    c(.0135, .0135, .05, steel, 0, .012, -.715, 10); c(.016, .016, .008, steel, 0, .012, -.685, 10);
    c(.0045, .0045, .26, steel, 0, -.016, -.33, 6);
    // trigger group + dark bakelite pistol grip
    b(.028, .006, .07, steel, 0, -.036, .015); b(.006, .022, .008, dark, 0, -.026, .0);
    b(.034, .098, .044, grip, 0, -.085, .078, -.34);
    // banana magazine with its ribs
    gfx.arc(mag, .04, .06, steel, 0, -.034, -.10, .066, 5, 0, .17);
    for (let i = 0; i < 4; i++) gfx.box(mag, .042, .004, .062, dark, 0, -.06 - i * .05, -.105 - i * .016, .1 + i * .12);
    // stock + buttplate, charging handle
    b(.030, .034, .075, steel, 0, 0, .14); b(.042, .078, .20, wood, 0, -.012, .255, -.1); b(.046, .098, .012, steel, 0, -.03, .357, -.1);
    gfx.box(bolt, .014, .014, .03, steel, .028, .03, -.04);

    g.userData = { vp: [.15, -.10, -.52], grip: { r: [0, -.075, .078], l: [0, -.045, -.30] }, mz: [0, .012, -.745], ej: [.03, .03, -.03], parts: { mag, bolt } };
    return g;
  };

  CS.WeaponModels.m4a1 = function (opts) {
    const sil = !opts || opts.sil === undefined ? true : opts.sil;
    const gfx = CS.gfx, S = gfx.skin, g = new THREE.Group();
    const b = (w, h, d, m, x, y, z, rx, ry, rz) => gfx.box(g, w, h, d, m, x, y, z, rx, ry, rz);
    const c = (r0, r1, l, m, x, y, z, s) => gfx.cyl(g, r0, r1, l, m, x, y, z, s);
    const blk = S('blk'), steel = S('steel'), slide = S('slide');
    const mag = new THREE.Group(), bolt = new THREE.Group(); g.add(mag, bolt);

    // upper + lower receiver, carry handle with rear aperture, ejection port cover
    b(.050, .062, .26, blk, 0, .018, -.07); b(.050, .055, .20, blk, 0, -.032, -.02);
    b(.030, .028, .16, blk, 0, .064, -.04); b(.026, .020, .026, blk, 0, .082, .04); b(.012, .010, .05, steel, 0, .094, -.06);
    b(.004, .020, .045, steel, .026, .022, -.06);
    // round ribbed handguard + front sight tower
    c(.033, .033, .20, blk, 0, .008, -.30); for (const z of [-.23, -.30, -.37]) c(.035, .035, .008, steel, 0, .008, z);
    b(.014, .050, .014, blk, 0, .046, -.40);
    // barrel + (default) silencer, or the bare barrel with a birdcage flash hider
    if (sil) { c(.011, .011, .06, steel, 0, .008, -.43); c(.030, .026, .02, slide, 0, .008, -.445); c(.026, .026, .29, slide, 0, .008, -.60, 14); c(.021, .021, .01, blk, 0, .008, -.752); }
    else { c(.011, .011, .20, steel, 0, .008, -.50); c(.016, .016, .06, steel, 0, .008, -.62); for (const z of [-.60, -.62, -.64]) c(.0175, .0175, .006, blk, 0, .008, z); }
    // magazine (slight forward curve), grip, trigger guard
    gfx.arc(mag, .034, .055, blk, 0, -.058, -.04, .06, 3, .02, .06);
    b(.036, .090, .042, blk, 0, -.09, .05, -.38); b(.028, .008, .06, blk, 0, -.064, -.005); b(.006, .020, .008, steel, 0, -.05, -.005);
    // buffer tube, A2 stock + pad, charging handle
    c(.020, .020, .18, blk, 0, 0, .16); b(.042, .075, .17, blk, 0, -.012, .24, -.05); b(.046, .090, .012, S('grip'), 0, -.016, .325);
    gfx.box(bolt, .022, .012, .035, blk, 0, .056, .09);

    g.userData = { vp: [.15, -.10, -.52], grip: { r: [0, -.08, .05], l: [0, -.02, -.30] }, mz: [0, .008, sil ? -.76 : -.66], ej: [.03, .025, -.06], parts: { mag, bolt }, sil };
    return g;
  };
})();
