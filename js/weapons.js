/* weapons.js - Firing cadence, recoil recovery, reloading, AWP 2-level zoom, weapon switching */
(function () {
  CS.weapons = {
    semiLock: false,

    update(u, input, dt) {
      if (!u.alive) return;

      if (u.fireCooldown > 0) u.fireCooldown -= dt;

      // Recoil recovery
      u.recoilPitch = Math.max(0, u.recoilPitch - dt * 6.5);
      u.recoilYaw *= Math.pow(0.02, dt);

      // Reloading progress
      if (u.reloadTimer > 0) {
        u.reloadTimer -= dt;
        if (u.reloadTimer <= 0) {
          u.reloadTimer = 0;
          this._finishReload(u);
        }
        return;
      }

      const item = u.activeItem;
      const w = CS.WEAPONS[u.activeId];
      if (!w) return;

      // Reload trigger
      if (input.reload && w.mag > 0 && item.mag < w.mag && item.res > 0) {
        this.startReload(u);
        return;
      }

      // Firing
      if (CS.round.state === 'FREEZE' || w.id === 'c4') return;

      if (input.fire) {
        if (w.auto || !this.semiLock || !u.isLocal) {
          if (u.fireCooldown <= 0) {
            if (w.mag > 0 && item.mag <= 0) {
              if (item.res > 0) this.startReload(u);
              else if (u.isLocal) CS.sfx.tone(240, 0.04, 0.06);
              if (u.isLocal) this.semiLock = true;
              return;
            }
            this._triggerFire(u, item, w);
            if (u.isLocal && !w.auto) this.semiLock = true;
          }
        }
      } else if (u.isLocal) {
        this.semiLock = false;
      }
    },

    _triggerFire(u, item, w) {
      if (w.mag > 0) item.mag--;
      u.fireCooldown = w.rof;
      u.recoilPitch = Math.min(8, u.recoilPitch + w.recoil);
      u.recoilYaw += (Math.random() - 0.5) * w.recoil * 0.4;

      if (u.isLocal) {
        CS.sfx.shot(w.id);
        CS.hands.kick(w.recoil);
        // Unscope briefly if desired or stay scoped like CS 1.6 bolt action: reset scope after AWP shot
        if (w.id === 'awp' && u.scopeLevel > 0) u.scopeLevel = 0;
      } else if (CS.units.local) {
        const d = u.pos.distanceTo(CS.units.local.pos);
        if (d < 42) CS.sfx.shot(w.id, Math.max(0.03, 0.22 * (1 - d / 42)));
      }

      CS.combat.fireShot(u);

      if (w.mag > 0 && item.mag === 0 && item.res > 0) {
        setTimeout(() => { if (u.alive && u.activeItem === item && item.mag === 0) this.startReload(u); }, 180);
      }
    },

    startReload(u) {
      const w = CS.WEAPONS[u.activeId];
      const item = u.activeItem;
      if (!w || w.mag === 0 || item.mag >= w.mag || item.res <= 0 || u.reloadTimer > 0) return;
      u.reloadTimer = w.reload;
      u.scopeLevel = 0;
      if (u.isLocal) CS.sfx.tone(360, 0.09, 0.08);
    },

    _finishReload(u) {
      const w = CS.WEAPONS[u.activeId];
      const item = u.activeItem;
      if (!w || !item) return;
      const need = w.mag - item.mag;
      const take = Math.min(need, item.res);
      item.mag += take;
      item.res -= take;
    },

    switchSlot(u, slot) {
      if (!u.slots[slot] || slot === u.activeSlot) return;
      u.lastSlot = u.activeSlot;
      u.activeSlot = slot;
      u.reloadTimer = 0;
      u.scopeLevel = 0;
      u.fireCooldown = 0.25;
      if (u.isLocal) CS.hands.rebuild();
    },

    lastWeapon(u) {
      if (u.slots[u.lastSlot]) this.switchSlot(u, u.lastSlot);
    },

    toggleScope(u) {
      const w = CS.WEAPONS[u.activeId];
      if (!w || !w.scope || u.reloadTimer > 0) return;
      u.scopeLevel = (u.scopeLevel + 1) % 3;
      CS.sfx.tone(950, 0.05, 0.08, 'sine');
    }
  };
})();
