/* pistols.js - Glock-18, USP Tactical, and Desert Eagle 3D models */
(function () {
  function buildPistol(opts) {
    const g = new THREE.Group();
    const slideMat = new THREE.MeshStandardMaterial({ color: opts.slideColor, metalness: 0.65, roughness: 0.3 });
    const frameMat = new THREE.MeshStandardMaterial({ color: opts.frameColor, roughness: 0.75 });

    // Grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.11, 0.052), frameMat);
    grip.position.set(0, -0.05, 0.045);
    grip.rotation.x = 0.22;
    g.add(grip);

    // Lower receiver
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.028, opts.len), frameMat);
    frame.position.set(0, 0, -opts.len * 0.25);
    g.add(frame);

    // Slide
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.036, opts.len + 0.01), slideMat);
    slide.position.set(0, 0.028, -opts.len * 0.25);
    g.add(slide);

    // Optional USP suppressor
    if (opts.silencer) {
      const sil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.16, 10),
        new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.55, metalness: 0.4 })
      );
      sil.rotation.x = Math.PI / 2;
      sil.position.set(0, 0.026, -opts.len * 0.75 - 0.08);
      g.add(sil);
    }

    return g;
  }

  CS.WeaponModels.glock = () => buildPistol({ slideColor: 0x2a2d34, frameColor: 0x1a1c20, len: 0.20 });
  CS.WeaponModels.usp   = () => buildPistol({ slideColor: 0x2e3238, frameColor: 0x1b1d21, len: 0.21, silencer: true });
  CS.WeaponModels.deagle = () => buildPistol({ slideColor: 0xc8d0d8, frameColor: 0x8e969e, len: 0.26 });
})();
