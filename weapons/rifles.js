/* rifles.js - AK-47 and M4A1 assault rifle 3D models */
(function () {
  CS.WeaponModels.ak47 = function () {
    const g = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: 0x26282c, metalness: 0.65, roughness: 0.35 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x7c451d, roughness: 0.72 });

    // Receiver
    const rec = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.065, 0.32), metal);
    rec.position.set(0, 0.01, -0.08);
    g.add(rec);

    // Wooden stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.085, 0.24), wood);
    stock.position.set(0, -0.012, 0.19);
    stock.rotation.x = 0.08;
    g.add(stock);

    // Wooden handguard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.055, 0.20), wood);
    guard.position.set(0, 0.012, -0.32);
    g.add(guard);

    // Barrel + gas tube
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.34, 8), metal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.012, -0.50);
    g.add(barrel);

    const gas = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8), metal);
    gas.rotation.x = Math.PI / 2;
    gas.position.set(0, 0.036, -0.34);
    g.add(gas);

    // Grip & banana magazine
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.11, 0.042), wood);
    grip.position.set(0, -0.06, 0.04);
    grip.rotation.x = 0.25;
    g.add(grip);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.18, 0.052), metal);
    mag.position.set(0, -0.10, -0.14);
    mag.rotation.x = -0.35;
    g.add(mag);

    return g;
  };

  CS.WeaponModels.m4a1 = function () {
    const g = new THREE.Group();
    const dark = new THREE.MeshStandardMaterial({ color: 0x1e2024, metalness: 0.5, roughness: 0.45 });
    const matte = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.8 });

    // Upper/Lower Receiver
    const rec = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.072, 0.28), dark);
    rec.position.set(0, 0.01, -0.06);
    g.add(rec);

    // Carry handle
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.035, 0.16), dark);
    handle.position.set(0, 0.062, -0.05);
    g.add(handle);

    // RIS handguard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.055, 0.22), matte);
    guard.position.set(0, 0.015, -0.30);
    g.add(guard);

    // Barrel + suppressor
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.18, 8), dark);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.018, -0.48);
    g.add(barrel);

    const sil = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.18, 10), matte);
    sil.rotation.x = Math.PI / 2;
    sil.position.set(0, 0.018, -0.62);
    g.add(sil);

    // Stock, grip, straight mag
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.22), matte);
    stock.position.set(0, 0.0, 0.18);
    g.add(stock);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.105, 0.044), matte);
    grip.position.set(0, -0.06, 0.03);
    grip.rotation.x = 0.25;
    g.add(grip);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.16, 0.055), dark);
    mag.position.set(0, -0.095, -0.12);
    mag.rotation.x = -0.12;
    g.add(mag);

    return g;
  };
})();
