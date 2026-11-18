/* hands.js - First-person viewmodel rig (gloved arms + active weapon + walk bob/recoil/reload anim) */
(function () {
  CS.hands = {
    rig: null,
    weaponPivot: null,
    kickZ: 0,
    kickRot: 0,
    drawT: 0,
    bobT: 0,
    curId: null,

    init(camera) {
      this.rig = new THREE.Group();
      camera.add(this.rig);

      this.weaponPivot = new THREE.Group();
      this.rig.add(this.weaponPivot);
      this.rebuild();
    },

    rebuild() {
      if (!this.weaponPivot) return;
      const u = CS.units.local;
      if (!u) return;

      while (this.weaponPivot.children.length) {
        this.weaponPivot.remove(this.weaponPivot.children[0]);
      }

      const wid = u.activeId;
      this.curId = wid;
      this.drawT = 1.0;

      // Weapon model
      const builder = CS.WeaponModels[wid];
      if (builder) {
        const wm = builder();
        this.weaponPivot.add(wm);
      }

      // First-person sleeves & gloved hands
      const isCT = u.team === 'CT';
      const sleeveMat = new THREE.MeshStandardMaterial({ color: isCT ? 0x263b5c : 0x6b6043, roughness: 0.85 });
      const gloveMat = new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.8 });

      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.36), sleeveMat);
      armR.position.set(0.05, -0.09, 0.24);
      armR.rotation.set(0.15, -0.15, 0);
      this.weaponPivot.add(armR);

      const handR = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.10), gloveMat);
      handR.position.set(0.01, -0.05, 0.05);
      this.weaponPivot.add(handR);

      if (wid !== 'knife') {
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.35), sleeveMat);
        armL.position.set(-0.14, -0.11, 0.05);
        armL.rotation.set(0.25, 0.45, 0);
        this.weaponPivot.add(armL);

        const handL = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.09), gloveMat);
        handL.position.set(-0.04, -0.04, -0.14);
        this.weaponPivot.add(handL);
      }
    },

    kick(amount) {
      this.kickZ = Math.min(0.12, this.kickZ + 0.03 * amount);
      this.kickRot = Math.min(0.25, this.kickRot + 0.06 * amount);
    },

    update(dt) {
      const u = CS.units.local;
      if (!this.rig || !u) return;

      this.rig.visible = u.alive && u.scopeLevel === 0;
      if (!this.rig.visible) return;

      if (this.curId !== u.activeId) this.rebuild();

      // Walk bob
      const spd = u.onGround ? Math.hypot(u.vel.x, u.vel.z) : 0;
      if (spd > 0.5) this.bobT += dt * spd * 1.6;
      const bobX = Math.cos(this.bobT) * 0.012 * Math.min(1, spd / 7);
      const bobY = Math.abs(Math.sin(this.bobT)) * 0.014 * Math.min(1, spd / 7);

      // Recoil & draw recovery
      this.kickZ *= Math.pow(0.001, dt);
      this.kickRot *= Math.pow(0.001, dt);
      this.drawT = Math.max(0, this.drawT - dt * 4.5);

      // Reload dip
      const rel = u.reloadTimer > 0 ? Math.sin((u.reloadTimer / (CS.WEAPONS[u.activeId].reload || 2)) * Math.PI) * 0.18 : 0;

      this.weaponPivot.position.set(0.24 + bobX, -0.22 - bobY - rel - this.drawT * 0.14, -0.40 + this.kickZ);
      this.weaponPivot.rotation.set(this.kickRot - rel * 1.4 - this.drawT * 0.4, -0.03, 0);
    }
  };
})();
