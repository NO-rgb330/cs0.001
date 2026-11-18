/* knife.js - Classic CS 1.6 tactical combat knife 3D model */
(function () {
  CS.WeaponModels.knife = function () {
    const g = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: 0xbfc7cf, metalness: 0.75, roughness: 0.25 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.7 });

    // Handle
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.13), dark);
    handle.position.set(0, 0, 0.04);
    g.add(handle);

    // Crossguard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.015), dark);
    guard.position.set(0, 0.005, -0.025);
    g.add(guard);

    // Blade
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.036, 0.17), steel);
    blade.position.set(0, 0.006, -0.115);
    g.add(blade);

    // Tip bevel
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 4), steel);
    tip.rotation.x = -Math.PI / 2;
    tip.rotation.z = Math.PI / 4;
    tip.scale.set(0.35, 1, 1);
    tip.position.set(0, 0.006, -0.22);
    g.add(tip);

    return g;
  };
})();
