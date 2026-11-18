/* game.js - WebGLRenderer, camera FOV/positioning, and main fixed-clamped loop */
(function () {
  CS.game = {
    renderer: null,
    camera: null,
    running: false,
    _lastTime: 0,

    init() {
      const canvas = document.getElementById('c');
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 160);

      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });

      CS.input.init();
      requestAnimationFrame((t) => this.loop(t));
    },

    start() {
      CS.world.init('de_sandbox');
      CS.round.startMatch();
      CS.hands.init(this.camera);
      CS.world.scene.add(this.camera);

      this.running = true;
      document.getElementById('menu').style.display = 'none';
      document.getElementById('hud').style.display = 'block';
      document.getElementById('pause').style.display = 'flex';
      document.getElementById('c').requestPointerLock();
    },

    stop() {
      this.running = false;
      CS.buymenu.close();
      if (document.pointerLockElement) document.exitPointerLock();
      document.getElementById('hud').style.display = 'none';
      document.getElementById('pause').style.display = 'none';
      document.getElementById('menu').style.display = 'block';
    },

    loop(now) {
      requestAnimationFrame((t) => this.loop(t));
      const dt = Math.min(0.05, (now - (this._lastTime || now)) / 1000);
      this._lastTime = now;

      if (!this.running) return;

      CS.round.update(dt);
      CS.world.update(dt);

      // Update units
      for (const u of CS.units.list) {
        if (u.isLocal) {
          const inp = CS.controllers.getLocalInput();
          CS.movement.step(u, inp, dt);
          CS.weapons.update(u, inp, dt);
          CS.combat.handleUseAction(u, inp.use, dt);
        } else {
          CS.controllers.updateBot(u, dt);
        }
        u.model.update(dt);
      }

      this._updateCamera();
      CS.hands.update(dt);
      CS.hud.update(dt);
      CS.input.endFrame();

      this.renderer.render(CS.world.scene, this.camera);
    },

    _updateCamera() {
      const u = CS.units.local;
      if (!u) return;

      if (u.alive) {
        this.camera.position.copy(CS.units.getEyePos(u));
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = u.yaw + u.recoilYaw * 0.025;
        this.camera.rotation.x = THREE.MathUtils.clamp(u.pitch + u.recoilPitch * 0.025, -1.5, 1.5);

        const targetFov = u.scopeLevel === 2 ? 15 : u.scopeLevel === 1 ? 40 : 75;
        if (this.camera.fov !== targetFov) {
          this.camera.fov = targetFov;
          this.camera.updateProjectionMatrix();
        }
      } else {
        // Spectate first alive teammate on death
        const spec = CS.units.list.find(o => o.alive && o.team === u.team) || u;
        this.camera.position.set(spec.pos.x, spec.pos.y + 2.4, spec.pos.z + 3.2);
        this.camera.lookAt(spec.pos.x, spec.pos.y + 1.0, spec.pos.z);
        if (this.camera.fov !== 75) {
          this.camera.fov = 75;
          this.camera.updateProjectionMatrix();
        }
      }
    }
  };
})();
