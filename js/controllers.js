/* controllers.js - Human input binding + Bot AI (waypoint BFS, site plant/defuse, combat) */
(function () {
  CS.controllers = {
    getLocalInput() {
      const inp = CS.input;
      return {
        forward: inp.keys['KeyW'],
        back: inp.keys['KeyS'],
        left: inp.keys['KeyA'],
        right: inp.keys['KeyD'],
        walk: inp.keys['ShiftLeft'] || inp.keys['ShiftRight'],
        crouch: inp.keys['ControlLeft'] || inp.keys['ControlRight'],
        jump: inp.keys['Space'] || inp.wheelJump,
        fire: inp.mouseDown && !inp.buyOpen,
        reload: inp.keys['KeyR'],
        use: inp.keys['KeyE']
      };
    },

    updateBot(u, dt) {
      if (!u.alive) return;
      if (!u.ai) {
        u.ai = {
          path: [],
          targetWp: null,
          repathTimer: Math.random() * 0.5,
          fireBurst: 0,
          strafeDir: Math.random() < 0.5 ? 1 : -1,
          strafeTimer: 1.0,
          reactTimer: 0
        };
      }

      const ai = u.ai;
      const skill = CS.cfg.botSkill; // 0 Easy, 1 Normal, 2 Hard
      const input = { forward: false, back: false, left: false, right: false, walk: false, crouch: false, jump: false, fire: false, reload: false, use: false };

      // 1. Scan for visible enemies
      const eye = CS.units.getEyePos(u);
      let enemy = null, bestDist = 55;
      for (const other of CS.units.list) {
        if (!other.alive || other.team === u.team) continue;
        const d = eye.distanceTo(CS.units.getEyePos(other));
        if (d < bestDist) {
          const toOther = CS.units.getEyePos(other).sub(eye).normalize();
          const wall = CS.world.raycastMap(eye, toOther, d);
          if (!wall) {
            bestDist = d;
            enemy = other;
          }
        }
      }

      // Ensure bot equips best weapon
      if (u.slots[1] && u.activeSlot !== 1 && (u.slots[1].mag > 0 || u.slots[1].res > 0)) {
        CS.weapons.switchSlot(u, 1);
      } else if (u.activeSlot === 1 && u.slots[1].mag === 0 && u.slots[1].res === 0) {
        CS.weapons.switchSlot(u, 2);
      }

      // 2. Combat mode
      if (enemy) {
        const targetEye = CS.units.getEyePos(enemy);
        targetEye.y -= skill === 2 ? 0.05 : 0.25; // Hard bots aim closer to head
        const diff = targetEye.sub(eye);
        const targetYaw = Math.atan2(-diff.x, -diff.z);
        const targetPitch = Math.atan2(diff.y, Math.hypot(diff.x, diff.z));

        const turnSpeed = 5 + skill * 4;
        u.yaw = this._lerpAngle(u.yaw, targetYaw, Math.min(1, dt * turnSpeed));
        u.pitch += (targetPitch - u.pitch) * Math.min(1, dt * turnSpeed);

        // Slight aim jitter based on skill
        const aimErr = (2 - skill) * 0.045;
        if (Math.abs(this._angleDiff(u.yaw, targetYaw)) < 0.16 + aimErr) {
          ai.reactTimer += dt;
          const reqReact = (2 - skill) * 0.22;
          if (ai.reactTimer >= reqReact) {
            input.fire = true;
          }
        }

        // Strafe during gunfight
        ai.strafeTimer -= dt;
        if (ai.strafeTimer <= 0) {
          ai.strafeTimer = 0.6 + Math.random() * 0.9;
          ai.strafeDir *= -1;
        }
        if (ai.strafeDir > 0) input.right = true;
        else input.left = true;
        if (bestDist > 18) input.forward = true;

        CS.movement.step(u, input, dt);
        CS.weapons.update(u, input, dt);
        return;
      }

      ai.reactTimer = 0;

      // 3. Objective & Navigation mode
      if (CS.round.state === 'LIVE') {
        // CTs rush planted bomb & defuse
        if (u.team === 'CT' && CS.world.bombPlanted && CS.world.bombPos) {
          const distToBomb = u.pos.distanceTo(CS.world.bombPos);
          if (distToBomb < 2.0) {
            input.use = true;
            u.crouching = true;
            CS.combat.handleUseAction(u, true, dt);
            CS.movement.step(u, input, dt);
            return;
          }
        }

        // T carrying C4 plants on site
        if (u.team === 'T' && !CS.world.bombPlanted && u.slots[4] && CS.world.inSite(u.pos)) {
          input.use = true;
          CS.combat.handleUseAction(u, true, dt);
          CS.movement.step(u, input, dt);
          return;
        }
      }

      // Waypoint pathing
      ai.repathTimer -= dt;
      if (ai.repathTimer <= 0 || ai.path.length === 0) {
        ai.repathTimer = 2.0 + Math.random() * 1.5;
        const goalWp = this._pickGoalWaypoint(u);
        const startWp = this._nearestWaypoint(u.pos);
        ai.path = this._bfs(startWp, goalWp);
      }

      if (ai.path.length > 0) {
        const wp = CS.world.map.waypoints[ai.path[0]];
        const dx = wp.x - u.pos.x;
        const dz = wp.z - u.pos.z;
        const d = Math.hypot(dx, dz);
        if (d < 1.8) {
          ai.path.shift();
        } else {
          const moveYaw = Math.atan2(-dx, -dz);
          u.yaw = this._lerpAngle(u.yaw, moveYaw, Math.min(1, dt * 6));
          u.pitch *= Math.pow(0.05, dt);
          input.forward = true;
        }
      }

      // Reload when idle & low ammo
      const item = u.activeItem;
      const w = CS.WEAPONS[u.activeId];
      if (w && w.mag > 0 && item.mag < w.mag * 0.4 && item.res > 0) input.reload = true;

      CS.movement.step(u, input, dt);
      CS.weapons.update(u, input, dt);
    },

    _pickGoalWaypoint(u) {
      const wps = CS.world.map.waypoints;
      if (u.team === 'CT' && CS.world.bombPlanted && CS.world.bombPos) {
        return this._nearestWaypoint(CS.world.bombPos);
      }
      if (u.team === 'T' && !CS.world.bombPlanted) {
        return Math.random() < 0.5 ? 8 : 10; // Site A or Site B
      }
      return Math.floor(Math.random() * wps.length);
    },

    _nearestWaypoint(pos) {
      let best = 0, bestD = 1e9;
      CS.world.map.waypoints.forEach((w, i) => {
        const d = Math.hypot(w.x - pos.x, w.z - pos.z);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    },

    _bfs(start, goal) {
      const wps = CS.world.map.waypoints;
      const q = [[start]];
      const seen = new Set([start]);
      while (q.length) {
        const path = q.shift();
        const cur = path[path.length - 1];
        if (cur === goal) return path;
        for (const nb of wps[cur].n) {
          if (!seen.has(nb)) {
            seen.add(nb);
            q.push([...path, nb]);
          }
        }
      }
      return [goal];
    },

    _angleDiff(a, b) {
      let d = b - a;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      return d;
    },

    _lerpAngle(a, b, t) {
      return a + this._angleDiff(a, b) * t;
    }
  };
})();
