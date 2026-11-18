/* c4.js - C4 explosive: carried slab with timer display; also used as the planted bomb on the ground */
(function () {
  CS.WeaponModels.c4 = function () {
    const g = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ color: 0x4b4f3a, roughness: 0.85 });
    const strap = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.7 });
    const screen = new THREE.MeshStandardMaterial({ color: 0x0b2a12, roughness: 0.4, emissive: 0x0b3a18 });
    const led = new THREE.MeshBasicMaterial({ color: 0xff2020 });

    // Main brick of explosive
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.07, 0.20), body);
    slab.position.set(0, 0.035, 0);
    g.add(slab);

    // Black straps
    for (const x of [-0.09, 0.09]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.078, 0.205), strap);
      s.position.set(x, 0.037, 0);
      g.add(s);
    }

    // Keypad / display panel
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.012, 0.10), strap);
    panel.position.set(0, 0.075, 0.02);
    g.add(panel);
    const disp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.006, 0.03), screen);
    disp.position.set(0, 0.083, 0.005);
    g.add(disp);

    // Blinking LED (world.js toggles this by name)
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.014, 0.014), led);
    l.name = 'c4led';
    l.position.set(0.04, 0.085, 0.06);
    g.add(l);

    return g;
  };
})();
