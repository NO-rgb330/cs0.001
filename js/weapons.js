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

      // Silencer attach / detach (right-click on USP and M4A1, like 1.6)
      if (u.attachTimer > 0) {
        u.attachTimer -= dt;
        if (u.attachTimer <= 0 && u.attachItem) { u.attachItem.sil = u.attachTarget; u.attachItem = null; }
        return;
      }

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
        if (w.id === 'knife') { CS.hands.knifeSwing((this._alt = !this._alt) ? 1 : 0); CS.sfx.tone(900, 0.08, 0.07, 'sawtooth'); }
        else { CS.sfx.shot(w.id, undefined, this.isSil(item)); CS.hands.onFire(w.id, this.isSil(item)); }
        // Unscope briefly if desired or stay scoped like CS 1.6 bolt action: reset scope after AWP shot
        if (w.id === 'awp' && u.scopeLevel > 0) u.scopeLevel = 0;
      } else if (CS.units.local) {
        const d = u.pos.distanceTo(CS.units.local.pos);
        if (d < 42) CS.sfx.shot(w.id, Math.max(0.03, 0.22 * (1 - d / 42)), this.isSil(item));
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
      u.fireCooldown = (CS.WEAPONS[u.slots[slot].id] || {}).draw || 0.75;
      u.attachTimer = 0;
      if (u.isLocal) CS.hands.rebuild();
    },

    lastWeapon(u) {
      if (u.slots[u.lastSlot]) this.switchSlot(u, u.lastSlot);
    },

    isSil(item) {
      if (!item) return false;
      return item.sil !== undefined ? !!item.sil : item.id === 'm4a1';
    },

    toggleSil(u) {
      if (u.reloadTimer > 0 || u.fireCooldown > 0 || u.attachTimer > 0 || !u.activeItem) return;
      u.attachItem = u.activeItem;
      u.attachTarget = !this.isSil(u.activeItem);
      u.attachTimer = 2.2;
      u.scopeLevel = 0;
      if (u.isLocal) CS.sfx.tone(520, 0.08, 0.07, 'sine');
    },

    // Right-click with the knife = stab (65 dmg, slower)
    stab(u) {
      if (!u.alive || u.fireCooldown > 0 || CS.round.state === 'FREEZE') return;
      u.fireCooldown = 1.1;
      if (u.isLocal) { CS.hands.knifeSwing(2); CS.sfx.tone(700, 0.1, 0.07, 'sawtooth'); }
      CS.combat._knifeAttack(u, CS.WEAPONS.knife, true);
    },

    toggleScope(u) {
      const w = CS.WEAPONS[u.activeId];
      if (w && w.id === 'knife') { this.stab(u); return; }
      if (w && w.silencer) { this.toggleSil(u); return; }
      if (!w || !w.scope || u.reloadTimer > 0) return;
      u.scopeLevel = (u.scopeLevel + 1) % 3;
      CS.sfx.tone(950, 0.05, 0.08, 'sine');
    }
  };
})();
