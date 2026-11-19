/* m4a1.js - Colt M4A1 carbine with silencer (CS 1.6). Rebuilt from reference renders + real M4 data (837 mm extended, 370 mm barrel, carry handle, A-frame front sight).
   Forward = -z, origin at the trigger group, bore axis y = +0.020.
   Side-view layout (m): buttpad +0.355 | stock +0.355..+0.200 | buffer tube +0.200..+0.092 | upper receiver +0.092..-0.125 | handguard -0.131..-0.296
                         front sight -0.325 | exposed barrel to -0.455 | flash hider -0.455..-0.515 OR silencer -0.477..-0.687
   Assemblies: RECEIVER / BARREL / HANDGUARD / STOCK / MAGAZINE / GRIP / TRIGGER / SILENCER / ATTACHMENTS.
   Moving parts: PIVOT_MAG, PIVOT_BOLT (charging handle), PIVOT_SIL (silencer). Both silencer and flash hider are always built; opts.sil picks the visible one. */
(function () {
  const WM = CS.WM, T = THREE;
  const ease = (x) => x * x * (3 - 2 * x), clamp = (v) => Math.max(0, Math.min(1, v));

  function build(opts) {
    const sil = !opts || opts.sil === undefined ? true : !!opts.sil;
    const S = CS.gfx.skin, anod = S('anod'), steel = S('steel'), dark = S('blk'), supp = S('supp'), pad = S('pad'), park = S('park');
    const root = new T.Group(); root.name = 'M4A1_ROOT';
    const RA = WM.grp('RECEIVER_ASSEMBLY', root), BA = WM.grp('BARREL_ASSEMBLY', root), HA = WM.grp('HANDGUARD_ASSEMBLY', root), SA = WM.grp('STOCK_ASSEMBLY', root);
    const MA = WM.grp('MAGAZINE_ASSEMBLY', root), GA = WM.grp('GRIP_ASSEMBLY', root), TA = WM.grp('TRIGGER_ASSEMBLY', root), SIA = WM.grp('SILENCER_ASSEMBLY', root), AT = WM.grp('ATTACHMENTS', root);
    const BY = .020;                                                                  // bore axis height

    // ---------- receivers ----------
    WM.side(RA, 'm4.upper', [[.094, .040], [.090, .046], [-.120, .046], [-.126, .040], [-.126, .000], [.092, .000], [.096, .006]], .038, anod, 0, 0, 0, { bevel: .0015, uv: 5 }, 'UPPER_RECEIVER');
    WM.side(RA, 'm4.lower', [[.096, -.002], [-.128, -.002], [-.128, -.032], [-.050, -.038], [.030, -.038], [.062, -.034], [.096, -.030]], .038, anod, 0, 0, 0, { bevel: .0015, uv: 5 }, 'LOWER_RECEIVER');
    WM.box(RA, .044, .036, .080, anod, 0, -.048, -.087, 0, 0, 0, 'MAGWELL');
    // carrying handle: tall arch with a big window, integral rear sight at the back
    WM.side(RA, 'm4.handle', [[.090, .046], [.090, .080], [.080, .092], [.020, .092], [-.040, .083], [-.090, .064], [-.116, .050], [-.124, .046]], .022, anod, 0, 0, 0,
      { holes: [[[.064, .052], [.064, .080], [.014, .082], [-.038, .074], [-.080, .060], [-.092, .052]]] }, 'CARRYING_HANDLE');
    WM.box(RA, .028, .016, .034, anod, 0, .088, .068, 0, 0, 0, 'REAR_SIGHT_HOUSING'); WM.box(RA, .008, .008, .036, dark, 0, .090, .068, 0, 0, 0, 'REAR_APERTURE');
    WM.cyl(RA, .008, .008, .012, steel, .016, .090, .068, 10, 'REAR_SIGHT_DRUM', 0, Math.PI / 2, 0);
    // right side: ejection port + spring cover, brass deflector, forward assist, magazine release; left side: bolt catch, fire selector; pins
    WM.box(RA, .003, .020, .050, dark, .0195, .030, -.010, 0, 0, 0, 'EJECTION_PORT'); WM.box(RA, .004, .022, .052, steel, .0205, .031, -.010, 0, 0, 0, 'EJECTION_PORT_COVER');
    WM.box(RA, .006, .016, .012, steel, .022, .030, .032, 0, 0, 0, 'BRASS_DEFLECTOR');
    WM.cyl(RA, .006, .006, .014, steel, .025, .024, .058, 10, 'FORWARD_ASSIST', 0, Math.PI / 2, 0);
    WM.cyl(RA, .006, .006, .010, steel, .024, -.022, -.045, 10, 'MAGAZINE_RELEASE', 0, Math.PI / 2, 0);
    WM.box(RA, .004, .012, .020, steel, -.0205, -.010, -.040, 0, 0, 0, 'BOLT_CATCH'); WM.box(RA, .004, .010, .040, steel, -.0205, -.016, .046, .4, 0, 0, 'FIRE_SELECTOR');
    WM.cyl(RA, .0035, .0035, .042, steel, 0, .006, .082, 8, 'TAKEDOWN_PIN', 0, Math.PI / 2, 0); WM.cyl(RA, .0035, .0035, .042, steel, 0, -.010, -.116, 8, 'PIVOT_PIN', 0, Math.PI / 2, 0);
    const BOLT = WM.grp('PIVOT_BOLT', RA);                                            // T-handle at the rear of the upper
    WM.box(BOLT, .034, .014, .028, anod, 0, .052, .108, 0, 0, 0, 'CHARGING_HANDLE'); WM.box(BOLT, .010, .012, .022, steel, 0, .044, .094, 0, 0, 0, 'CHARGING_HANDLE_LATCH');

    // ---------- handguard: short, round, ribbed; delta ring; barrel; A-frame front sight; sling swivel ----------
    WM.cyl(HA, .031, .031, .170, anod, 0, BY, -.211, 16, 'HANDGUARD');
    for (let i = 0; i < 9; i++) WM.cyl(HA, .0325, .0325, .006, dark, 0, BY, -.150 - i * .0165, 16, 'HANDGUARD_RIB');
    WM.cyl(HA, .036, .036, .010, steel, 0, BY, -.133, 16, 'DELTA_RING'); WM.cyl(HA, .028, .028, .012, steel, 0, BY, -.129, 16, 'BARREL_NUT');
    WM.cyl(BA, .0125, .0125, .070, park, 0, BY, -.330, 12, 'BARREL_THICK');                    // M4A1 heavy profile at the gas block
    WM.cyl(BA, .0105, .0105, .130, park, 0, BY, -.390, 12, 'BARREL');
    WM.cyl(BA, .0135, .0135, .040, anod, 0, BY, -.328, 12, 'FRONT_SIGHT_BASE');
    WM.side(BA, 'm4.fsight', [[-.309, .031], [-.318, .100], [-.332, .100], [-.347, .031]], .006, anod, 0, 0, 0,
      { holes: [[[-.318, .045], [-.322, .088], [-.330, .088], [-.337, .045]]] }, 'FRONT_SIGHT_TOWER');
    WM.box(BA, .003, .045, .016, anod, .0105, .075, -.328, 0, 0, 0, 'FRONT_SIGHT_EAR_R'); WM.box(BA, .003, .045, .016, anod, -.0105, .075, -.328, 0, 0, 0, 'FRONT_SIGHT_EAR_L');
    WM.box(BA, .003, .026, .003, dark, 0, .092, -.325, 0, 0, 0, 'FRONT_SIGHT_POST');
    WM.mesh(BA, WM.geo('m4.swivel', () => new T.TorusGeometry(.008, .0015, 6, 12)), steel, 0, BY - .024, -.300, 0, Math.PI / 2, 0, 'SLING_SWIVEL');
    const FH = WM.grp('FLASH_HIDER', BA); FH.visible = !sil;                          // A2 birdcage
    WM.cyl(FH, .0135, .0135, .060, steel, 0, BY, -.485, 12, 'FLASH_HIDER_BODY');
    for (const z of [-.47, -.485, -.50]) { WM.box(FH, .032, .004, .008, dark, 0, BY, z, 0, 0, 0, 'FLASH_HIDER_SLOT'); WM.box(FH, .004, .032, .008, dark, 0, BY, z, 0, 0, 0, 'FLASH_HIDER_SLOT'); }

    // ---------- silencer (thin, long; own assembly that unscrews along the bore) ----------
    const SIL = WM.grp('PIVOT_SIL', SIA); SIL.position.set(0, BY, -.455); SIL.visible = sil;
    WM.cyl(SIL, .0165, .0165, .024, dark, 0, 0, -.012, 12, 'SILENCER_MOUNT');
    WM.cyl(SIL, .0225, .0225, .208, supp, 0, 0, -.126, 16, 'SILENCER_BODY');
    for (const z of [-.040, -.212]) WM.cyl(SIL, .0235, .0235, .005, steel, 0, 0, z, 16, 'SILENCER_RING');
    WM.cyl(SIL, .019, .019, .008, dark, 0, 0, -.226, 16, 'SILENCER_FRONT_CAP'); WM.cyl(SIL, .008, .008, .002, dark, 0, 0, -.2305, 10, 'SILENCER_MUZZLE_HOLE');

    // ---------- STANAG magazine on a pivot: tall, slight forward curve, ribs ----------
    const MAGZ = -.118, MAGY = -.030, N = 10, drop = .150, pts = [];
    const front = (t) => -.030 * Math.pow(t, 1.5), depth = (t) => .060 + .002 * t;
    for (let i = 0; i <= N; i++) { const t = i / N; pts.push([front(t), -drop * t]); }
    for (let i = N; i >= 0; i--) { const t = i / N; pts.push([front(t) + depth(t), -drop * t]); }
    const MAG = WM.grp('PIVOT_MAG', MA); MAG.position.set(0, MAGY, MAGZ);
    WM.side(MAG, 'm4.mag', pts, .038, anod, 0, 0, 0, { bevel: .001, uv: 6 }, 'MAGAZINE_SHELL');
    for (const t of [.25, .45, .65, .85]) for (const sx of [-1, 1]) WM.box(MAG, .0025, .008, depth(t) * .85, dark, sx * .0195, -drop * t, front(t) + depth(t) / 2, Math.atan(.045 * Math.pow(t, .5) / drop), 0, 0, 'MAGAZINE_RIB');
    WM.box(MAG, .042, .010, .066, steel, 0, -drop - .005, front(1) + depth(1) / 2, .2, 0, 0, 'MAGAZINE_BASEPLATE');

    // ---------- grip, trigger guard, trigger ----------
    WM.side(GA, 'm4.grip', [[.045, -.030], [.098, -.030], [.108, -.075], [.122, -.140], [.086, -.146], [.072, -.110], [.066, -.082], [.050, -.058]], .034, anod, 0, 0, 0, { bevel: .003, uv: 8 }, 'PISTOL_GRIP');
    WM.cyl(GA, .004, .004, .030, steel, 0, -.034, .076, 8, 'GRIP_SCREW', 0, Math.PI / 2, 0);
    WM.side(TA, 'm4.guard', [[.046, -.034], [.046, -.062], [.032, -.070], [-.040, -.070], [-.056, -.056], [-.056, -.034]], .008, anod, 0, 0, 0,
      { holes: [[[.036, -.042], [.036, -.060], [.028, -.064], [-.034, -.064], [-.046, -.054], [-.046, -.042]]] }, 'TRIGGER_GUARD');
    WM.box(TA, .005, .026, .006, dark, 0, -.046, -.002, .3, 0, 0, 'TRIGGER');

    // ---------- buffer tube (visible) + short collapsible stock with slots + rubber pad ----------
    WM.cyl(SA, .0195, .0195, .118, anod, 0, .016, .151, 14, 'BUFFER_TUBE');
    WM.side(SA, 'm4.stock2', [[.200, .043], [.355, .043], [.355, -.066], [.292, -.066], [.262, -.042], [.228, -.042], [.200, -.020]], .042, anod, 0, 0, 0,
      { bevel: .002, uv: 6, holes: [.240, .262, .284].map((z) => [[z, -.006], [z + .010, -.006], [z + .018, -.030], [z + .008, -.030]]) }, 'STOCK_BODY');
    WM.box(SA, .046, .112, .010, pad, 0, -.0115, .360, 0, 0, 0, 'BUTTPAD'); WM.box(SA, .012, .010, .036, steel, 0, -.034, .215, 0, 0, 0, 'STOCK_LATCH');

    const MZ = [0, BY, sil ? -.689 : -.517];
    WM.finish(root, {
      id: 'm4a1', vp: [.15, -.10, -.50], attachments: AT, sil,
      rHand: [0, -.092, .080], lHand: [0, -.030, -.215], muzzle: MZ, eject: [.022, .030, -.010], magPoint: [0, MAGY, MAGZ],
      pivots: { mag: MAG, bolt: BOLT, silencer: SIL },
      assemblies: { receiver: RA, barrel: BA, handguard: HA, stock: SA, magazine: MA, grip: GA, trigger: TA, silencer: SIA },
      animate(s) {
        const rp = s.rp, ap = s.ap;
        let dr = 0, rot = 0, vis = true;
        if (rp >= 0) {                                                               // pull the STANAG mag down, seat a fresh one, slap, work the charging handle
          if (rp < .2) { /* tilt only */ }
          else if (rp < .32) { dr = .04 * (rp - .2) / .12; rot = .10 * (rp - .2) / .12; }
          else if (rp < .46) { dr = .04 + .26 * (rp - .32) / .14; rot = .10; vis = dr < .22; }
          else if (rp < .5) { dr = .30; vis = false; }
          else if (rp < .66) { dr = .30 * (1 - (rp - .5) / .16); rot = .10; }
          else if (rp < .74) rot = .10 * (1 - (rp - .66) / .08);
        }
        MAG.position.set(0, MAGY - dr, MAGZ); MAG.rotation.x = rot; MAG.visible = vis;
        BOLT.position.z = rp >= .78 && rp < .92 ? .06 * Math.sin(Math.PI * (rp - .78) / .14) : 0;
        let sv = sil, fv = !sil, off = 0;
        if (ap >= 0) {                                                               // silencer screws on / off along the bore
          if (s.target) { sv = ap > .2; fv = ap < .35; off = .14 * (1 - ease(clamp((ap - .2) / .6))); }
          else { sv = ap < .75; fv = ap >= .75; off = .14 * ease(clamp(ap / .7)); }
        }
        SIL.position.z = -.455 - off; SIL.rotation.z = -9 * off / .14; SIL.visible = sv; FH.visible = fv;
        return true;
      }
    });
    return root;
  }

  WM.register('m4a1', build);
})();
