/* units.js - Player and bot entity management, inventory slots, loadouts */
(function () {
  const NAMES_CT = ['Stone', 'Vance', 'Miller', 'Ghost', 'Bishop', 'Hawk'];
  const NAMES_T  = ['Viktor', 'Kuro', 'Dante', 'Reaper', 'Rico', 'Zed'];

  CS.units = {
    list: [],
    local: null,

    spawnAll(resetEconomy = false) {
      // Remove old models
      for (const u of this.list) {
        if (u.model && u.model.root) CS.world.scene.remove(u.model.root);
      }
      this.list = [];

      const totalPerTeam = 5;
      for (let i = 0; i < totalPerTeam; i++) {
        // Local player is CT #0
        const isPlayer = i === 0;
        const ct = this.create({
          id: 'ct_' + i,
          name: isPlayer ? CS.cfg.name : NAMES_CT[i],
          team: 'CT',
          isLocal: isPlayer,
          spawnIdx: i
        }, resetEconomy);
        if (isPlayer) this.local = ct;
        this.list.push(ct);

        const t = this.create({
          id: 't_' + i,
          name: NAMES_T[i],
          team: 'T',
          isLocal: false,
          spawnIdx: i
        }, resetEconomy);
        this.list.push(t);
      }

      // Give C4 to first Terrorist
      const firstT = this.list.find(u => u.team === 'T');
      if (firstT) firstT.slots[4] = { id: 'c4', mag: 0, res: 0 };
    },

    create(opts, resetEconomy) {
      const old = this._persist && this._persist[opts.id];
      const u = {
        id: opts.id,
        name: opts.name,
        team: opts.team,
        isLocal: opts.isLocal,
        spawnIdx: opts.spawnIdx,

        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        yaw: 0,
        pitch: 0,
        onGround: true,
        crouching: false,
        walking: false,
        eyeHeight: CS.phys.eyeStand,

        hp: 100,
        armor: resetEconomy || !old ? 0 : old.armor,
        money: resetEconomy || !old ? CS.cfg.startMoney : old.money,
        kills: resetEconomy || !old ? 0 : old.kills,
        deaths: resetEconomy || !old ? 0 : old.deaths,
        alive: true,

        slots: {
          1: resetEconomy || !old ? null : old.slots[1],
          2: resetEconomy || !old ? { id: opts.team === 'CT' ? 'usp' : 'glock', mag: opts.team === 'CT' ? 12 : 20, res: opts.team === 'CT' ? 48 : 80 } : old.slots[2],
          3: { id: 'knife', mag: 0, res: 0 },
          4: null
        },
        activeSlot: 2,
        lastSlot: 3,
        get activeId() { return this.slots[this.activeSlot]?.id || 'knife'; },
        get activeItem() { return this.slots[this.activeSlot]; },

        fireCooldown: 0,
        reloadTimer: 0,
        recoilPitch: 0,
        recoilYaw: 0,
        scopeLevel: 0,
        stepDist: 0,
        ai: null
      };

      if (u.slots[1]) u.activeSlot = 1;
      u.model = CS.model.create(u);
      this.placeAtSpawn(u);
      return u;
    },

    saveRoundPersist() {
      this._persist = {};
      for (const u of this.list) {
        this._persist[u.id] = {
          money: u.money,
          kills: u.kills,
          deaths: u.deaths,
          armor: u.alive ? u.armor : 0,
          slots: {
            1: u.alive && u.slots[1] ? { ...u.slots[1] } : null,
            2: u.alive && u.slots[2] ? { ...u.slots[2] } : { id: u.team === 'CT' ? 'usp' : 'glock', mag: u.team === 'CT' ? 12 : 20, res: u.team === 'CT' ? 48 : 80 }
          }
        };
      }
    },

    placeAtSpawn(u) {
      const spList = CS.world.map.spawns[u.team === 'CT' ? 'ct' : 't'];
      const sp = spList[u.spawnIdx % spList.length];
      u.pos.set(sp.x, sp.y, sp.z);
      u.vel.set(0, 0, 0);
      u.yaw = sp.yaw;
      u.pitch = 0;
      u.hp = 100;
      u.alive = true;
      u.scopeLevel = 0;
      u.reloadTimer = 0;
      u.recoilPitch = 0;
      u.recoilYaw = 0;
      u.crouching = false;
    },

    resetForNewRound() {
      this.saveRoundPersist();
      // Bot auto-buying based on money
      for (const u of this.list) {
        if (!u.isLocal && u.alive === false) {
          // handled below after restore
        }
      }
      this.spawnAll(false);
      for (const u of this.list) {
        if (!u.isLocal) CS.buymenu.botBuy(u);
      }
    },

    getEyePos(u) {
      return new THREE.Vector3(u.pos.x, u.pos.y + u.eyeHeight, u.pos.z);
    },

    getForward(u) {
      const cp = Math.cos(u.pitch);
      return new THREE.Vector3(
        -Math.sin(u.yaw) * cp,
        Math.sin(u.pitch),
        -Math.cos(u.yaw) * cp
      ).normalize();
    }
  };
})();
