/* input.js - Pointer Lock, mouse look (with scope FOV scaling), keyboard & wheel bindings */
(function () {
  CS.input = {
    keys: {},
    mouseDown: false,
    wheelJump: false,
    locked: false,
    buyOpen: false,

    init() {
      const canvas = document.getElementById('c');
      const pause = document.getElementById('pause');

      pause.addEventListener('click', (e) => {
        if (e.target.id === 'dc') return;
        if (CS.game.running) canvas.requestPointerLock();
      });

      document.addEventListener('pointerlockchange', () => {
        this.locked = document.pointerLockElement === canvas;
        if (CS.game.running) {
          pause.style.display = this.locked ? 'none' : 'flex';
        }
        if (!this.locked) {
          this.mouseDown = false;
          this.keys = {};
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.locked || !CS.game.running) return;
        const u = CS.units.local;
        if (!u || !u.alive) return;

        const fovScale = u.scopeLevel === 2 ? 0.22 : u.scopeLevel === 1 ? 0.52 : 1.0;
        const sens = CS.cfg.sens * 0.0022 * fovScale;

        u.yaw -= e.movementX * sens;
        u.pitch = THREE.MathUtils.clamp(u.pitch - e.movementY * sens, -1.48, 1.48);
      });

      document.addEventListener('mousedown', (e) => {
        if (!this.locked || !CS.game.running) return;
        const u = CS.units.local;
        if (!u || !u.alive) return;

        if (e.button === 0) {
          this.mouseDown = true;
        } else if (e.button === 2) {
          CS.weapons.toggleScope(u);
        }
      });

      document.addEventListener('mouseup', (e) => {
        if (e.button === 0) this.mouseDown = false;
      });

      document.addEventListener('contextmenu', (e) => {
        if (CS.game.running) e.preventDefault();
      });

      document.addEventListener('wheel', (e) => {
        if (!this.locked || !CS.game.running) return;
        if (e.deltaY !== 0) this.wheelJump = true;
      }, { passive: true });

      document.addEventListener('keydown', (e) => {
        if (!CS.game.running) return;
        if (e.code === 'Tab') e.preventDefault();
        this.keys[e.code] = true;

        const u = CS.units.local;
        if (!u) return;

        // Buy menu digits
        if (CS.buymenu.open && e.key >= '0' && e.key <= '9') {
          CS.buymenu.handleKey(e.key);
          return;
        }

        if (e.code === 'KeyB') { CS.buymenu.toggle(); return; }
        if (e.code === 'KeyQ') { CS.weapons.lastWeapon(u); return; }
        if (e.code === 'Digit1') CS.weapons.switchSlot(u, 1);
        if (e.code === 'Digit2') CS.weapons.switchSlot(u, 2);
        if (e.code === 'Digit3') CS.weapons.switchSlot(u, 3);
        if (e.code === 'Digit4') CS.weapons.switchSlot(u, 4);
      });

      document.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
      });
    },

    endFrame() {
      this.wheelJump = false;
    }
  };
})();
