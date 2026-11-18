/* smg.js - MP5 Navy submachine gun 3D model */
(function () {
  CS.WeaponModels.mp5 = function () {
    const g = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: 0x25282e, metalness: 0.55, roughness: 0.4 });
    const polymer = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.8 });

    // Receiver
    const rec = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.062, 0.32), metal);
    rec.position.set(0, 0.01, -0.08);
    g.add(rec);

    // Foregrip
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.055, 0.16), polymer);
    handguard.position.set(0, 0.0, -0.25);
    g.add(handguard);

    // Barrel + sight hood
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.18, 8), metal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.015, -0.36);
    g.add(barrel);

    // Grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.11, 0.045), polymer);
    grip.position.set(0, -0.06, 0.02);
    grip.rotation.x = 0.25;
    g.add(grip);

    // Curved MP5 magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.17, 0.036), metal);
    mag.position.set(0, -0.09, -0.13);
    mag.rotation.x = -0.25;
    g.add(mag);

    // Retractable stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.075, 0.18), polymer);
    stock.position.set(0, 0.0, 0.15);
    g.add(stock);

    return g;
  };
})();
