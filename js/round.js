/* round.js - Round state machine, timers, bomb countdown, economy & win conditions */
(function () {
  CS.round = {
    state: 'FREEZE', // FREEZE | LIVE | ROUND_END | MATCH_END
    timer: 0,
    bombTimer: 0,
    scoreCT: 0,
    scoreT: 0,
    num: 1,
    msgText: '',
    msgTimer: 0,

    startMatch() {
      this.scoreCT = 0;
      this.scoreT = 0;
      this.num = 1;
      CS.units._persist = null;
      CS.units.spawnAll(true);
      this.beginRound();
    },

    beginRound() {
      this.state = 'FREEZE';
      this.timer = CS.cfg.freezeTime;
      this.bombTimer = 0;
      CS.world.clearBomb();
      CS.combat.defuseProgress = 0;
      CS.combat.plantProgress = 0;
      this.announce(`Round ${this.num} - Freeze Time`, 2.5);
    },

    announce(txt, dur = 3.5) {
      this.msgText = txt;
      this.msgTimer = dur;
    },

    update(dt) {
      if (this.msgTimer > 0) {
        this.msgTimer -= dt;
        if (this.msgTimer <= 0) this.msgText = '';
      }

      if (this.state === 'FREEZE') {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.state = 'LIVE';
          this.timer = CS.cfg.roundTime;
          this.announce('GO! GO! GO!', 1.8);
          CS.sfx.tone(880, 0.12, 0.12);
        }
      } else if (this.state === 'LIVE') {
        if (CS.world.bombPlanted) {
          this.bombTimer -= dt;
          if (this.bombTimer <= 0) {
            this.onBombExploded();
          }
        } else {
          this.timer -= dt;
          if (this.timer <= 0) {
            this.endRound('CT', 'Time Expired - Counter-Terrorists Win!');
          }
        }
      } else if (this.state === 'ROUND_END') {
        this.timer -= dt;
        if (this.timer <= 0) {
          if (this.scoreCT >= CS.cfg.winLimit || this.scoreT >= CS.cfg.winLimit) {
            this.state = 'MATCH_END';
            const winTeam = this.scoreCT >= CS.cfg.winLimit ? 'Counter-Terrorists' : 'Terrorists';
            this.announce(`${winTeam} Win the Match!`, 6);
            this.timer = 5;
          } else {
            this.num++;
            CS.units.resetForNewRound();
            this.beginRound();
          }
        }
      } else if (this.state === 'MATCH_END') {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.startMatch();
        }
      }
    },

    onBombPlanted(siteId) {
      this.bombTimer = CS.cfg.bombTime;
      this.announce(`The Bomb has been planted at Site ${siteId}!`, 3.5);
      CS.sfx.tone(520, 0.2, 0.14);
    },

    onBombDefused(defuser) {
      CS.world.clearBomb();
      defuser.money = Math.min(16000, defuser.money + 300);
      this.endRound('CT', 'Bomb has been defused - Counter-Terrorists Win!');
    },

    onBombExploded() {
      CS.sfx.explode();
      if (CS.world.bombPos) {
        for (const u of CS.units.list) {
          if (!u.alive) continue;
          const d = u.pos.distanceTo(CS.world.bombPos);
          if (d < 22) CS.combat.applyDamage(u, Math.round((1 - d / 22) * 180), null, 'C4', false);
        }
      }
      CS.world.clearBomb();
      this.endRound('T', 'Target Destroyed - Terrorists Win!');
    },

    checkEnd() {
      if (this.state !== 'LIVE') return;
      const aliveCT = CS.units.list.some(u => u.team === 'CT' && u.alive);
      const aliveT  = CS.units.list.some(u => u.team === 'T' && u.alive);

      if (!aliveCT) {
        this.endRound('T', 'Terrorists Win!');
      } else if (!aliveT && !CS.world.bombPlanted) {
        this.endRound('CT', 'Counter-Terrorists Win!');
      }
    },

    endRound(winner, msg) {
      if (this.state !== 'LIVE') return;
      this.state = 'ROUND_END';
      this.timer = 4.0;
      if (winner === 'CT') this.scoreCT++;
      else this.scoreT++;
      this.announce(msg, 3.8);

      // Economy payout
      for (const u of CS.units.list) {
        const reward = u.team === winner ? 3250 : 1900;
        u.money = Math.min(16000, u.money + reward);
      }
    }
  };
})();
