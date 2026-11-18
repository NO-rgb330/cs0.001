/* hands.js - First-person viewmodel (own scene + camera so it never clips into walls, like GoldSrc's depth-range hack):
   gloved arms per weapon, draw / reload / silencer / knife-slash / stab / AWP bolt animations, GoldSrc-style muzzle flash, ejected brass */
(function () {
  const T = THREE;
  const ease = (x) => x * x * (3 - 2 * x);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let flashTex = null;

  function getFlashTex() {                                    // star-shaped muzzle flash sprite (muzzleflash1.spr style)
    if (flashTex) return flashTex;
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); c.translate(32, 32);
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 + .2, len = k % 2 ? 18 : 30;
      c.fillStyle = 'rgba(255,150,30,.85)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - .22) * len * .5, Math.sin(a - .22) * len * .5);
      c.lineTo(Math.cos(a) * len, Math.sin(a) * len); c.lineTo(Math.cos(a + .22) * len * .5, Math.sin(a + .22) * len * .5); c.closePath(); c.fill();
    }
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 15); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#ffe090'); g.addColorStop(1, 'rgba(255,140,20,0)');
    c.fillStyle = g; c.fillRect(-32, -32, 64, 64);
    return (flashTex = new T.CanvasTexture(cv));
  }

  CS.hands = {
    scene: null, cam: null, rig: null, pivot: null, camera: null, ud: null, model: null, mz: null, ej: null, flash: null,
    curKey: '', shells: [],
    kickZ: 0, kickRot: 0, drawT: 0, drawLen: .75, bobT: 0, idleT: 0, landDip: 0, wasAir: false, lastVy: 0,
    swingT: 0, swingDur: .38, swingKind: 0, flashT: 0, sinceFire: 9, cycPrev: 0,
    lagYaw: 0, lagPit: 0, _py: null, _pp: null,

    init(camera) {
      this.camera = camera;
      this.scene = new T.Scene();
      this.cam = new T.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.01, 4);
      this.scene.add(new T.AmbientLight(0xffffff, 0.64));               // flat GoldSrc-style model lighting: strong ambient + one directional
      const dl = new T.DirectionalLight(0xffffff, 0.55); dl.position.set(-0.3, 1, 0.6); this.scene.add(dl);
      this.rig = new T.Group(); this.scene.add(this.rig);
      this.pivot = new T.Group(); this.rig.add(this.pivot);
      this.flash = new T.Sprite(new T.SpriteMaterial({ map: getFlashTex(), blending: T.AdditiveBlending, transparent: true, depthWrite: false }));
      this.flash.visible = false;
      this.shells = []; this.curKey = ''; this._py = null; this.sinceFire = 9;
      this.rebuild();
    },

    hand(p, a, b, sm, gm, left) {                                        // sleeve cylinder from the camera edge to the grip + gloved hand
      const A = new T.Vector3(a[0], a[1], a[2]), B = new T.Vector3(b[0], b[1], b[2]), d = B.clone().sub(A), L = d.length();
      const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize());
      const arm = new T.Mesh(new T.CylinderGeometry(.04, .052, L, 10), sm); arm.position.copy(A).addScaledVector(d, .5); arm.quaternion.copy(q); p.add(arm);
      const h = new T.Group(); h.position.copy(B); h.quaternion.copy(q); p.add(h);
      CS.gfx.box(h, .062, .06, .046, gm, 0, .03, 0);                    // palm (local +y runs along the arm)
      for (let i = 0; i < 4; i++) { CS.gfx.box(h, .013, .03, .014, gm, -.024 + i * .016, .075, 0); CS.gfx.box(h, .013, .014, .028, gm, -.024 + i * .016, .088, -.016); }
      CS.gfx.box(h, .016, .04, .016, gm, left ? -.038 : .038, .04, .012, 0, 0, left ? .5 : -.5);   // thumb
    },

    rebuild() {
      const u = CS.units.local;
      if (!u || !this.pivot) return;
      while (this.pivot.children.length) this.pivot.remove(this.pivot.children[0]);
      const wid = u.activeId, w = CS.WEAPONS[wid], sil = CS.weapons.isSil(u.activeItem);
      this.curKey = wid + (sil ? 's' : '');
      const builder = CS.WeaponModels[wid]; if (!builder) { this.ud = null; return; }
      const wm = builder({ sil }); this.pivot.add(wm); this.model = wm; this.ud = wm.userData;
      const sleeve = CS.gfx.skin(u.team === 'CT' ? 'sleeveCT' : 'sleeveT'), glove = CS.gfx.skin('glove'), gr = this.ud.grip, fz = -.14 - this.ud.vp[2];
      this.hand(wm, [gr.r[0] + .06, gr.r[1] - .12, fz], gr.r, sleeve, glove, false);
      if (gr.l) this.hand(wm, [gr.l[0] - .10, gr.l[1] - .12, fz], gr.l, sleeve, glove, true);
      this.mz = new T.Object3D(); this.mz.position.fromArray(this.ud.mz); wm.add(this.mz); this.mz.add(this.flash); this.flash.visible = false;
      this.ej = new T.Object3D(); this.ej.position.fromArray(this.ud.ej); wm.add(this.ej);
      this.drawT = 1; this.drawLen = (w && w.draw) || .75; this.cycPrev = 0;
    },

    kick(amount) {
      this.kickZ = Math.min(.12, this.kickZ + .03 * amount);
      this.kickRot = Math.min(.25, this.kickRot + .06 * amount);
    },

    onFire(wid, sil) {
      this.sinceFire = 0;
      if (wid === 'knife') return;
      this.kick((CS.WEAPONS[wid].recoil || 1) * (wid === 'awp' ? .7 : 1));
      if (!sil && this.flash) {
        const sz = { glock: .11, usp: .11, deagle: .2, mp5: .13, ak47: .2, m4a1: .15, awp: .3 }[wid] || .12;
        this.flashT = .05; this.flash.scale.setScalar(sz * (.8 + Math.random() * .5)); this.flash.material.rotation = Math.random() * 6.28; this.flash.visible = true;
      }
      if (wid !== 'awp') this.eject();                                    // AWP ejects when the bolt is worked
    },

    knifeSwing(kind) { this.swingKind = kind; this.swingDur = kind === 2 ? .45 : .38; this.swingT = 1; },

    eject() {
      if (!this.ej || !CS.world.scene || !this.camera) return;
      const p = new T.Vector3(); this.rig.updateMatrixWorld(true); this.ej.getWorldPosition(p);
      this.camera.updateMatrixWorld(); this.camera.localToWorld(p);
      const yaw = CS.units.local.yaw, r = 1.8 + Math.random() * .8;
      const m = new T.Mesh(this._sg || (this._sg = new T.BoxGeometry(.012, .012, .042)), this._sm || (this._sm = new T.MeshLambertMaterial({ color: 0xc8a030 })));
      m.position.copy(p); CS.world.scene.add(m);
      this.shells.push({ m, t: 0, v: new T.Vector3(Math.cos(yaw) * r, 1.5 + Math.random() * .8, -Math.sin(yaw) * r), s: new T.Vector3(Math.random() * 25, Math.random() * 25, Math.random() * 25) });
      if (this.shells.length > 40) CS.world.scene.remove(this.shells.shift().m);
    },

    _shells(dt) {
      for (let i = this.shells.length - 1; i >= 0; i--) {
        const o = this.shells[i]; o.v.y -= 9.8 * dt; o.m.position.addScaledVector(o.v, dt); o.m.rotation.x += o.s.x * dt; o.m.rotation.z += o.s.z * dt;
        if (o.m.position.y < .012) { o.m.position.y = .012; o.v.y = Math.abs(o.v.y) * .3; o.v.x *= .5; o.v.z *= .5; o.s.multiplyScalar(.5); }
        o.t += dt; if (o.t > 1.6) { CS.world.scene.remove(o.m); this.shells.splice(i, 1); }
      }
    },

    update(dt) {
      const u = CS.units.local;
      if (!this.rig || !u) return;
      this._shells(dt);
      this.rig.visible = u.alive && u.scopeLevel === 0;
      if (!this.rig.visible) return;

      const sil = CS.weapons.isSil(u.activeItem);
      if (this.curKey !== u.activeId + (sil ? 's' : '')) this.rebuild();
      const w = CS.WEAPONS[u.activeId], ud = this.ud, item = u.activeItem;
      if (!ud || !w) return;
      const P = ud.parts || {}, base = ud.vp;

      // walk bob, idle breathing, landing dip, weapon lag behind the mouse
      const spd = u.onGround ? Math.hypot(u.vel.x, u.vel.z) : 0, k = Math.min(1, spd / 7.4);
      if (spd > .5) this.bobT += dt * spd * 1.6;
      this.idleT += dt;
      if (this.wasAir && u.onGround) this.landDip = Math.min(.05, Math.abs(this.lastVy) * .004);
      this.wasAir = !u.onGround; this.lastVy = u.vel.y || 0; this.landDip *= Math.pow(.002, dt);
      if (this._py == null) { this._py = u.yaw; this._pp = u.pitch; }
      this.lagYaw = clamp(this.lagYaw * Math.pow(.004, dt) + (u.yaw - this._py) * .8, -.12, .12);
      this.lagPit = clamp(this.lagPit * Math.pow(.004, dt) + (u.pitch - this._pp) * .8, -.1, .1);
      this._py = u.yaw; this._pp = u.pitch;
      const bobX = Math.cos(this.bobT) * .008 * k, bobY = -Math.abs(Math.sin(this.bobT)) * .011 * k, sway = Math.sin(this.idleT * 1.1) * .0015;

      this.drawT = Math.max(0, this.drawT - dt / this.drawLen); const de = ease(this.drawT);
      this.kickZ *= Math.pow(.001, dt); this.kickRot *= Math.pow(.001, dt);
      this.sinceFire += dt;
      if (this.flashT > 0) { this.flashT -= dt; if (this.flashT <= 0) this.flash.visible = false; }

      let px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0, mo = 0, magVis = true, act = 0;

      // reload / silencer attach: tilt the weapon, drop the magazine, seat a new one, release the slide / pull the bolt
      let rp = -1;
      if (u.reloadTimer > 0 && w.reload > 0) rp = 1 - u.reloadTimer / w.reload;
      else if (u.attachTimer > 0) rp = 1 - u.attachTimer / 2.2;
      if (rp >= 0) {
        const tilt = rp < .15 ? ease(rp / .15) : rp > .85 ? ease((1 - rp) / .15) : 1;
        py -= .07 * tilt; px -= .03 * tilt; pz += .03 * tilt; rx -= .35 * tilt; rz += .5 * tilt;
        if (u.reloadTimer > 0) {
          mo = rp < .2 ? 0 : rp < .35 ? -(rp - .2) / .15 * .24 : rp < .5 ? -.24 : rp < .68 ? -.24 * (1 - (rp - .5) / .18) : 0;
          magVis = !(rp > .3 && rp < .5);
          act = rp > .72 && rp < .9 ? Math.sin(Math.PI * (rp - .72) / .18) : 0;
        }
      }

      // knife: two alternating slashes and a stab
      if (this.swingT > 0) {
        this.swingT = Math.max(0, this.swingT - dt / this.swingDur);
        const s = 1 - this.swingT, sn = Math.sin(Math.PI * s);
        if (this.swingKind === 2) { pz -= sn * .22; rx += sn * .2; py += sn * .03; }
        else { const a = (ease(s) * 2 - 1) * (this.swingKind ? -1 : 1); ry += a * .9; rz += a * .7; px -= a * .10; rx -= sn * .25; }
      }

      // AWP: bolt works after every shot, ejecting the brass mid-cycle
      let cyc = 0;
      if (u.activeId === 'awp' && this.sinceFire < w.rof) {
        const c = this.sinceFire / w.rof;
        if (c > .18 && c < .82) cyc = Math.sin(Math.PI * (c - .18) / .64);
        if (this.cycPrev < .5 && c >= .5) this.eject();
        this.cycPrev = c;
      } else this.cycPrev = 0;

      if (P.mag) { P.mag.position.y = mo; P.mag.visible = magVis; }
      if (P.slide) P.slide.position.z = (item && w.mag > 0 && item.mag <= 0 && rp < 0) ? .04 : this.kickZ * .5 + act * .04;      // slide locks back on an empty gun
      if (P.bolt) { P.bolt.position.z = u.activeId === 'awp' ? cyc * .07 : this.kickZ * .2 + act * .05; P.bolt.rotation.z = u.activeId === 'awp' ? -cyc * .9 : 0; }

      this.pivot.position.set(base[0] + bobX + px + sway - this.lagYaw * .3, base[1] + bobY + py - this.landDip - de * .32, base[2] + this.kickZ + pz + de * .06);
      this.pivot.rotation.set(this.kickRot + rx - de * .9 - this.lagPit * .6, ry - this.lagYaw * .6, rz + de * .25);
    }
  };
})();
