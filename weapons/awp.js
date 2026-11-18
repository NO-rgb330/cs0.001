/* awp.js - Arctic Warfare Magnum (AWP) sniper rifle 3D model */
(function () {
  CS.WeaponModels.awp = function () {
    const g = new THREE.Group();
    const olive = new THREE.MeshStandardMaterial({ color: 0x455939, roughness: 0.72 });
    const steel = new THREE.MeshStandardMaterial({ color: 0x1b1d20, metalness: 0.65, roughness: 0.35 });
    const lens = new THREE.MeshStandardMaterial({ color: 0x2266aa, metalness: 0.9, roughness: 0.1 });

    // Olive polymer chassis & stock
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.07, 0.48), olive);
    body.position.set(0, 0, -0.12);
    g.add(body);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.10, 0.24), olive);
    stock.position.set(0, -0.015, 0.20);
    g.add(stock);

    // Heavy fluted barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.017, 0.56, 10), steel);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.024, -0.58);
    g.add(barrel);

    // Muzzle brake
    const brake = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.034, 0.06), steel);
    brake.position.set(0, 0.024, -0.87);
    g.add(brake);

    // Scope tube & objective bells
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 12), steel);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.072, -0.12);
    g.add(scope);

    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.022, 0.07, 12), steel);
    bell.rotation.x = Math.PI / 2;
    bell.position.set(0, 0.072, -0.26);
    g.add(bell);

    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.025, 12), lens);
    glass.position.set(0, 0.072, 0.012);
    g.add(glass);

    // Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.09, 0.075), steel);
    mag.position.set(0, -0.05, -0.10);
    g.add(mag);

    return g;
  };
})();
