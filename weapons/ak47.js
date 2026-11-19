/* ak47.js - AK-47 benchmark model (AK-01..AK-04). Real-world length (~0.88 m), forward = -z, origin at the trigger group.
   Silhouette parts (stock, grip, receiver, magazine, handguards, trigger guard) are extruded side / cross-section profiles, not boxes.
   Assemblies: RECEIVER / FRONT / HANDGUARD / MAGAZINE / STOCK / GRIP / TRIGGER / ATTACHMENTS. Moving parts: PIVOT_MAG, PIVOT_BOLT.
   Key z positions (m): buttplate +0.296, receiver +0.066..-0.18, magwell -0.072, handguards -0.172..-0.375, gas block -0.42, front sight -0.535, muzzle -0.598 */
(function () {
  const WM = CS.WM, T = THREE;
  const ease = (x) => x * x * (3 - 2 * x);

  function build() {
    const S = CS.gfx.skin, metal = S('blued'), park = S('park'), wood = S('wood'), bake = S('grip'), dark = S('blk'), steel = S('steel');
    const root = new T.Group(); root.name = 'AK47_ROOT';
    const RA = WM.grp('RECEIVER_ASSEMBLY', root), FA = WM.grp('FRONT_ASSEMBLY', root), HA = WM.grp('HANDGUARD_ASSEMBLY', root);
    const MA = WM.grp('MAGAZINE_ASSEMBLY', root), SA = WM.grp('STOCK_ASSEMBLY', root), GA = WM.grp('GRIP_ASSEMBLY', root);
    const TA = WM.grp('TRIGGER_ASSEMBLY', root), AT = WM.grp('ATTACHMENTS', root);

    // ---------- AK-01 / AK-02: receiver ----------
    WM.side(RA, 'ak.rec', [[.066, .036], [-.17, .036], [-.18, .030], [-.18, -.028], [-.17, -.034], [.04, -.034], [.066, -.028]], .040, metal, 0, 0, 0, { bevel: .0015, uv: 5 }, 'RECEIVER_BODY');
    WM.box(RA, .042, .060, .030, metal, 0, .001, -.165, 0, 0, 0, 'TRUNNION_BLOCK');
    WM.box(RA, .050, .038, .078, metal, 0, -.053, -.072, 0, 0, 0, 'MAGWELL');
    WM.box(RA, .016, .014, .018, steel, 0, -.046, -.026, 0, 0, 0, 'MAGAZINE_CATCH');
    const dust = WM.geo('ak.dust', () => { const g = new T.CylinderGeometry(.0205, .0205, .222, 14, 1, false, Math.PI / 2, Math.PI); g.rotateX(Math.PI / 2); return g; });
    const dc = WM.mesh(RA, dust, metal, 0, .026, -.045, 0, 0, 0, 'DUST_COVER'); dc.scale.y = .9;
    WM.box(RA, .012, .004, .20, metal, 0, .046, -.05, 0, 0, 0, 'DUST_COVER_RIDGE');
    WM.box(RA, .003, .022, .062, dark, .0205, .018, -.072, 0, 0, 0, 'EJECTION_PORT');
    WM.box(RA, .028, .018, .032, metal, 0, .036, -.20, 0, 0, 0, 'REAR_SIGHT_BLOCK');
    WM.box(RA, .022, .003, .095, metal, 0, .049, -.165, -.10, 0, 0, 'REAR_SIGHT_LEAF');
    WM.box(RA, .004, .008, .006, dark, .006, .057, -.119, 0, 0, 0, 'REAR_SIGHT_NOTCH_L'); WM.box(RA, .004, .008, .006, dark, -.006, .057, -.119, 0, 0, 0, 'REAR_SIGHT_NOTCH_R');
    WM.box(RA, .0035, .014, .125, steel, .0215, .004, -.03, 0, 0, 0, 'SELECTOR_LEVER'); WM.box(RA, .007, .018, .014, steel, .024, .008, .032, 0, 0, 0, 'SELECTOR_TAB');
    for (const p of [[.040, -.012], [-.020, -.030], [-.150, .006]]) WM.cyl(RA, .0035, .0035, .046, steel, 0, p[1], p[0], 8, 'RECEIVER_PIN', 0, Math.PI / 2, 0);

    const BOLT = WM.grp('PIVOT_BOLT', RA);                            // charging handle rides on the bolt carrier
    WM.box(BOLT, .020, .010, .014, metal, .0295, .030, -.08, 0, 0, 0, 'CHARGING_HANDLE_ARM');
    WM.cyl(BOLT, .007, .007, .012, steel, .045, .030, -.08, 10, 'CHARGING_HANDLE_KNOB', 0, Math.PI / 2, 0);

    // ---------- front end ----------
    WM.cyl(FA, .0095, .0095, .385, park, 0, .0175, -.3625, 12, 'BARREL');
    WM.cyl(FA, .0125, .0125, .030, metal, 0, .0175, -.185, 12, 'BARREL_COLLAR');
    WM.cyl(FA, .0085, .0085, .24, metal, 0, .0355, -.285, 10, 'GAS_TUBE');
    WM.cyl(FA, .0135, .0135, .036, metal, 0, .0175, -.42, 12, 'GAS_BLOCK');
    WM.box(FA, .016, .014, .034, metal, 0, .0345, -.42, 0, 0, 0, 'GAS_BLOCK_TOP'); WM.box(FA, .010, .014, .018, metal, 0, -.0075, -.41, 0, 0, 0, 'BAYONET_LUG');
    WM.cyl(FA, .0125, .0125, .028, metal, 0, .0175, -.535, 12, 'FRONT_SIGHT_COLLAR');
    WM.box(FA, .020, .022, .028, metal, 0, .0385, -.535, 0, 0, 0, 'FRONT_SIGHT_BASE');
    WM.ring(FA, 'ak.hood', .0125, .0095, .018, metal, 0, .0545, -.549, 'FRONT_SIGHT_HOOD');
    WM.box(FA, .0028, .024, .0028, dark, 0, .054, -.545, 0, 0, 0, 'FRONT_SIGHT_POST');
    WM.cyl(FA, .0105, .0105, .012, metal, 0, .0175, -.552, 12, 'MUZZLE_RING');
    const brake = WM.geo('ak.brake', () => {                          // slant muzzle brake: front face cut at an angle
      const g = new T.CylinderGeometry(.0125, .0125, .044, 14); g.rotateX(Math.PI / 2);
      const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getZ(i) < -.02) p.setZ(i, p.getZ(i) + p.getY(i) * 1.1);
      g.computeVertexNormals(); return g;
    });
    WM.mesh(FA, brake, metal, 0, .0175, -.576, 0, 0, 0, 'MUZZLE_BRAKE');
    WM.box(FA, .006, .004, .012, dark, 0, .0305, -.572, 0, 0, 0, 'MUZZLE_SLOT');
    WM.cyl(FA, .0035, .0035, .335, steel, 0, .002, -.3675, 8, 'CLEANING_ROD');

    // ---------- handguards (wood, cross-section extrusions) + retaining bands ----------
    WM.section(HA, 'ak.hg.low', WM.rrect(.054, .048, .010), .200, wood, 0, -.002, -.272, { uv: 8 }, 'HANDGUARD_LOWER');
    WM.section(HA, 'ak.hg.up', WM.rrect(.046, .034, .016), .170, wood, 0, .033, -.290, { uv: 8 }, 'HANDGUARD_UPPER');
    const bandRing = (key, z) => { const sh = WM.rrect(.058, .082, .012); sh.holes.push(WM.rrect(.052, .076, .010)); return WM.section(HA, 'ak.' + key, sh, .010, steel, 0, .012, z, null, key.toUpperCase()); };
    bandRing('band_front', -.372); bandRing('band_rear', -.205);

    // ---------- magazine: curved banana profile on a rocking pivot ----------
    const MAGZ = -.094, MAGY = -.034, N = 14, pts = [];
    const front = (t) => -.075 * Math.pow(t, 1.6), depth = (t) => .056 + .010 * t, drop = .205;
    for (let i = 0; i <= N; i++) { const t = i / N; pts.push([front(t), -drop * t]); }
    for (let i = N; i >= 0; i--) { const t = i / N; pts.push([front(t) + depth(t), -drop * t]); }
    const MAG = WM.grp('PIVOT_MAG', MA); MAG.position.set(0, MAGY, MAGZ);
    WM.side(MAG, 'ak.mag', pts, .044, metal, 0, 0, 0, { bevel: .001, uv: 6 }, 'MAGAZINE_SHELL');
    for (const t of [.28, .52, .76]) {                                // stamped ribs on both sides
      const a = Math.atan(.12 * Math.pow(t, .6) / drop), zc = front(t) + depth(t) / 2;
      for (const sx of [-1, 1]) WM.box(MAG, .0025, .010, depth(t) * .9, steel, sx * .0225, -drop * t, zc, a, 0, 0, 'MAGAZINE_RIB');
    }
    WM.box(MAG, .048, .008, .072, steel, 0, -drop - .004, front(1) + depth(1) / 2, Math.atan(.12 / drop), 0, 0, 'MAGAZINE_FLOORPLATE');
    WM.box(MAG, .036, .006, .020, steel, 0, .003, -.003, 0, 0, 0, 'MAGAZINE_FRONT_LUG');

    // ---------- stock + buttplate ----------
    // real AK profile: comb slopes down, slim neck, belly that drops to a pronounced toe, stock flares wider toward the butt
    WM.side(SA, 'ak.stock2', [[.066, .036], [.10, .034], [.16, .027], [.22, .017], [.28, .006], [.289, -.003], [.292, -.112], [.282, -.120],
      [.245, -.102], [.19, -.080], [.14, -.060], [.10, -.044], [.066, -.030]], .036, wood, 0, 0, 0, { bevel: .002, uv: 7, flare: [.30, .066, .226] }, 'STOCK_BODY');
    WM.box(SA, .030, .004, .060, steel, 0, -.033, .095, 0, 0, 0, 'STOCK_TANG_STRAP');
    WM.box(SA, .048, .126, .008, steel, 0, -.057, .296, -.06, 0, 0, 'BUTTPLATE');
    for (const y of [-.02, -.10]) WM.cyl(SA, .004, .004, .004, steel, 0, y, .301, 8, 'BUTTPLATE_SCREW');

    // ---------- pistol grip (bakelite) ----------
    WM.side(GA, 'ak.grip', [[.040, -.030], [.098, -.030], [.112, -.078], [.123, -.130], [.090, -.134], [.070, -.100], [.052, -.062]], .034, bake, 0, 0, 0, { bevel: .003, uv: 8 }, 'PISTOL_GRIP');
    WM.cyl(GA, .004, .004, .038, steel, 0, -.100, .075, 8, 'GRIP_SCREW', 0, Math.PI / 2, 0);
    WM.box(GA, .030, .005, .030, steel, 0, -.136, .106, -.28, 0, 0, 'GRIP_CAP');

    // ---------- trigger group ----------
    WM.side(TA, 'ak.guard', [[.046, -.030], [.046, -.066], [-.042, -.066], [-.046, -.062], [-.046, -.030]], .008, metal, 0, 0, 0,
      { holes: [[[.036, -.038], [.036, -.058], [-.036, -.058], [-.036, -.038]]] }, 'TRIGGER_GUARD');
    WM.box(TA, .005, .026, .006, dark, 0, -.045, -.002, .35, 0, 0, 'TRIGGER');

    // ---------- attachments + metadata ----------
    const MZ = [0, .0175, -.598], vp = [.15, -.10, -.50];
    WM.finish(root, {
      id: 'ak47', vp, attachments: AT,
      rHand: [0, -.082, .084], lHand: [0, -.045, -.255], muzzle: MZ, eject: [.026, .024, -.066], magPoint: [0, MAGY, MAGZ],
      pivots: { mag: MAG, bolt: BOLT },
      assemblies: { receiver: RA, front: FA, handguard: HA, magazine: MA, stock: SA, grip: GA, trigger: TA },
      animate(s) {                                                     // AK reload: rock the mag out and down, rock a new one in, pull the charging handle
        const rp = s.rp; let rot = 0, dr = 0, vis = true;
        if (rp >= 0) {
          if (rp < .2) { /* tilt only */ }
          else if (rp < .34) rot = .45 * ease((rp - .2) / .14);
          else if (rp < .46) { rot = .45; dr = .30 * (rp - .34) / .12; vis = dr < .22; }
          else if (rp < .5) { rot = .45; dr = .30; vis = false; }
          else if (rp < .66) { rot = .45; dr = .30 * (1 - (rp - .5) / .16); }
          else if (rp < .74) rot = .45 * (1 - (rp - .66) / .08);
        }
        MAG.position.set(0, MAGY - dr, MAGZ); MAG.rotation.x = rot; MAG.visible = vis;
        let b = 0;
        if (rp >= .78 && rp < .92) b = .07 * Math.sin(Math.PI * (rp - .78) / .14);
        else if (s.sinceFire < .045) b = .065 * Math.sin(Math.PI * s.sinceFire / .045);   // bolt carrier reciprocates while firing
        BOLT.position.z = b;
        return true;
      }
    });
    return root;
  }

  WM.register('ak47', build);
})();
