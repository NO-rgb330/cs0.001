/* hud.js - Health, armor, timer, money, ammo, dynamic crosshair, radar, killfeed, scoreboard */
(function () {
  const el = id => document.getElementById(id);

  CS.hud = {
    hurtAlpha: 0,
    feedItems: [],

    update(dt) {
      const u = CS.units.local;
      if (!u) return;

      el('hp').textContent = u.alive ? Math.max(0, Math.ceil(u.hp)) : 0;
      el('ar').textContent = u.armor;
      el('mon').textContent = `$${u.money}`;

      const w = CS.WEAPONS[u.activeId];
      const item = u.activeItem;
      el('am').textContent = w && w.mag > 0 ? `${item.mag} | ${item.res}` : w ? w.name : '';

      // Timer
      const sec = Math.max(0, Math.ceil(CS.world.bombPlanted ? CS.round.bombTimer : CS.round.timer));
      const m = Math.floor(sec / 60);
      const s = String(sec % 60).padStart(2, '0');
      const tm = el('tm');
      tm.textContent = CS.world.bombPlanted ? `C4 ${m}:${s}` : `${m}:${s}`;
      tm.style.color = CS.world.bombPlanted ? '#ff3a3a' : '';

      // Score & round msg
      el('score').textContent = `CT ${CS.round.scoreCT}  :  ${CS.round.scoreT} T`;
      el('msg').textContent = CS.round.msgText;

      // Hurt vignette fade
      if (this.hurtAlpha > 0) {
        this.hurtAlpha = Math.max(0, this.hurtAlpha - dt * 2.2);
        el('hurt').style.opacity = this.hurtAlpha.toFixed(2);
      }

      // AWP scope & crosshair
      const scoped = u.alive && u.scopeLevel > 0;
      el('scope').style.display = scoped ? 'block' : 'none';
      el('xh').style.display = scoped || !u.alive ? 'none' : 'block';

      if (!scoped && w) {
        const spd = Math.hypot(u.vel.x, u.vel.z);
        const gap = Math.round(4 + (spd / 7.4) * 10 + u.recoilPitch * 2.5 + (u.onGround ? 0 : 8));
        const xh = el('xh');
        xh.style.setProperty('--gp', `${gap}px`);
        xh.style.setProperty('--x', CS.cfg.xhColor);
      }

      // Plant / Defuse progress bar
      const df = el('df');
      if (CS.combat.defuseProgress > 0) {
        df.style.display = 'block';
        df.firstElementChild.style.width = `${Math.min(100, (CS.combat.defuseProgress / CS.cfg.defuseTime) * 100)}%`;
      } else if (CS.combat.plantProgress > 0) {
        df.style.display = 'block';
        df.firstElementChild.style.width = `${Math.min(100, (CS.combat.plantProgress / 2.6) * 100)}%`;
      } else {
        df.style.display = 'none';
      }

      // Killfeed expiry
      for (let i = this.feedItems.length - 1; i >= 0; i--) {
        this.feedItems[i].t -= dt;
        if (this.feedItems[i].t <= 0) this.feedItems.splice(i, 1);
      }
      this._renderFeed();
      this._renderRadar(u);
      this._renderScoreboard();
    },

    flashHurt() {
      this.hurtAlpha = 0.72;
    },

    addKillFeed(att, attTeam, vic, vicTeam, weapon, hs) {
      const col = t => t === 'CT' ? '#7ab2ff' : t === 'T' ? '#ff9955' : '#ccc';
      const html = `<span style="color:${col(attTeam)}">${att}</span> <span style="color:#ddd">[${weapon}${hs ? ' ⌖' : ''}]</span> <span style="color:${col(vicTeam)}">${vic}</span>`;
      this.feedItems.unshift({ html, t: 5.5 });
      if (this.feedItems.length > 5) this.feedItems.pop();
    },

    _renderFeed() {
      el('feed').innerHTML = this.feedItems.map(f => `<div>${f.html}</div>`).join('');
    },

    _renderRadar(u) {
      const cv = el('rad');
      const ctx = cv.getContext('2d');
      const r = 65;
      ctx.clearRect(0, 0, 130, 130);

      // Circular radar background
      ctx.save();
      ctx.beginPath();
      ctx.arc(r, r, r - 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 30, 15, 0.68)';
      ctx.fill();
      ctx.clip();

      const scale = 2.0;
      const cos = Math.cos(-u.yaw);
      const sin = Math.sin(-u.yaw);
      const toRad = (wx, wz) => {
        const dx = wx - u.pos.x;
        const dz = wz - u.pos.z;
        return [
          r + (dx * cos - dz * sin) * scale,
          r + (dx * sin + dz * cos) * scale
        ];
      };

      // Bombsites A / B
      ctx.font = 'bold 10px Verdana';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const s of CS.world.map.sites) {
        const [sx, sy] = toRad(s.x, s.z);
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(s.id, sx, sy);
      }

      // Teammates
      for (const other of CS.units.list) {
        if (!other.alive || other === u || other.team !== u.team) continue;
        const [px, py] = toRad(other.pos.x, other.pos.z);
        ctx.fillStyle = '#4cff4c';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Planted C4 blip
      if (CS.world.bombPlanted && CS.world.bombPos) {
        const [bx, by] = toRad(CS.world.bombPos.x, CS.world.bombPos.z);
        ctx.fillStyle = (Math.floor(performance.now() / 250) % 2) ? '#ff2222' : '#ffff00';
        ctx.beginPath();
        ctx.arc(bx, by, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Local player center arrow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(r, r - 4);
      ctx.lineTo(r - 3, r + 3);
      ctx.lineTo(r + 3, r + 3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },

    _renderScoreboard() {
      const sb = el('sb');
      if (!CS.input.keys['Tab']) {
        sb.style.display = 'none';
        return;
      }
      sb.style.display = 'block';
      const rows = team => CS.units.list
        .filter(u => u.team === team)
        .sort((a, b) => b.kills - a.kills)
        .map(u => `<tr><td>${u.name}${u.alive ? '' : ' (Dead)'}</td><td>$${u.money}</td><td>${u.kills}</td><td>${u.deaths}</td></tr>`)
        .join('');

      sb.innerHTML = `
        <table>
          <thead><tr><th style="color:#7ab2ff">Counter-Terrorists (${CS.round.scoreCT})</th><th>Money</th><th>K</th><th>D</th></tr></thead>
          <tbody>${rows('CT')}</tbody>
          <thead><tr><th style="color:#ff9955;padding-top:8px">Terrorists (${CS.round.scoreT})</th><th>Money</th><th>K</th><th>D</th></tr></thead>
          <tbody>${rows('T')}</tbody>
        </table>`;
    }
  };
})();
