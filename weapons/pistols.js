/* pistols.js - Glock-18, USP .45 Tactical (silencer optional) and Desert Eagle .50AE */
(function () {
  function pistol(o) {
    const gfx = CS.gfx, S = gfx.skin, g = new THREE.Group(), slide = new THREE.Group(), mag = new THREE.Group();
    g.add(slide, mag);
    const L = o.len, W = o.w, H = o.h, zc = -L / 2 + .05, dark = S('blk'), steel = S('steel');
    const sm = S(o.slideSkin), fm = S(o.frameSkin), gm = S(o.gripSkin || o.frameSkin);
    // slide, serrations, ejection port, sights, hammer
    gfx.box(slide, W, H, L, sm, 0, .03 + H / 2, zc);
    for (let i = 0; i < 6; i++) gfx.box(slide, W + .002, H * .62, .0035, dark, 0, .03 + H * .5, .04 - i * .0085);
    if (o.frontSerr) for (let i = 0; i < 4; i++) gfx.box(slide, W + .002, H * .62, .0035, dark, 0, .03 + H * .5, zc - L / 2 + .03 + i * .0085);
    gfx.box(slide, .004, H * .5, L * .28, dark, W / 2, .03 + H * .62, zc + L * .1);
    gfx.box(slide, .006, .012, .01, dark, 0, .03 + H + .006, zc - L / 2 + .012);
    gfx.box(slide, W * .7, .012, .012, dark, 0, .03 + H + .006, .035);
    gfx.box(slide, .009, .014, .014, steel, 0, .03 + H * .85, .062);
    if (o.rail) for (let i = 0; i < 7; i++) gfx.box(slide, .012, .006, .012, dark, 0, .03 + H + .003, zc - L * .35 + i * L * .1);
    gfx.cyl(slide, .0105, .0105, .02, steel, 0, .03 + H * .5, zc - L / 2 - .004);
    // frame, dust cover, trigger guard, trigger
    gfx.box(g, W * .96, .03, L * .82, fm, 0, .012, zc + L * .08);
    gfx.box(g, W * .96, .022, L * .30, fm, 0, .004, zc - L * .38);
    gfx.box(g, W * .86, .006, .07, fm, 0, -.016, zc + L * .02); gfx.box(g, W * .86, .026, .008, fm, 0, -.03, zc - L * .12);
    gfx.box(g, .007, .02, .008, dark, 0, -.008, zc + L * .12);
    // grip (tilted), side panels, magazine floor plate
    gfx.box(g, W * .95, o.gh, o.gw, gm, 0, -o.gh / 2, .043, o.gt);
    gfx.box(g, W * .97, o.gh * .6, o.gw * .7, dark, 0, -o.gh * .5, .043, o.gt);
    gfx.box(mag, W, .01, o.gw * 1.06, dark, 0, -o.gh - .004, .043 + Math.sin(-o.gt) * o.gh / 2, o.gt);
    if (o.sil) { gfx.cyl(g, .0165, .0165, .17, S('slide'), 0, .03 + H * .5, zc - L / 2 - .09, 12); gfx.cyl(g, .013, .013, .02, dark, 0, .03 + H * .5, zc - L / 2 - .02, 12); }
    g.userData = { vp: [.11, -.10, -.40], grip: { r: [0, -o.gh * .45, .043], l: null }, mz: [0, .03 + H * .5, zc - L / 2 - (o.sil ? .18 : .012)], ej: [W / 2, .03 + H * .8, .02], parts: { slide, mag }, sil: !!o.sil };
    return g;
  }
  // Glock-18: dark polymer frame, matte slide, boxy front serrations
  CS.WeaponModels.glock = () => pistol({ len: .19, w: .030, h: .034, gh: .105, gw: .05, gt: -.12, slideSkin: 'slide', frameSkin: 'blk', frontSerr: 1 });
  // USP .45: gunmetal slide, black frame, exposed hammer; suppressor only when attached with right-click
  CS.WeaponModels.usp = (opts) => pistol({ len: .205, w: .032, h: .040, gh: .11, gw: .052, gt: -.22, slideSkin: 'slide', frameSkin: 'blk', frontSerr: 1, sil: !!(opts && opts.sil) });
  // Desert Eagle: chrome slide + frame, ribbed rail, black grip
  CS.WeaponModels.deagle = () => pistol({ len: .26, w: .040, h: .056, gh: .125, gw: .06, gt: -.25, slideSkin: 'chrome', frameSkin: 'chrome', gripSkin: 'blk', rail: 1 });
})();
