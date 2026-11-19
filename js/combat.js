/* combat.js - Raycast ballistics, hitboxes, damage, kill feed, C4 plant & defuse */
(function () {
  CS.combat = {
    defuseProgress: 0,
    plantProgress: 0,

    fireShot(shooter) {
      const w = CS.WEAPONS[shooter.activeId];
      if (!w) return;

      if (w.id === 'knife') {
        this._knifeAttack(shooter, w);
        return;
      }

      const eye = CS.units.getEyePos(shooter);
      const fwd = CS.units.getForward(shooter);

      // Compute dynamic spread
      const speed = Math.hypot(shooter.vel.x, shooter.vel.z);
      let spread = w.spread;
      if (!shooter.onGround) spread += w.moveSpread * 1.8;
      else if (speed > 1.0) spread += w.moveSpread * (speed / CS.phys.speedRun);
      if (shooter.crouching) spread *= 0.65;
      if (w.scope && shooter.scopeLevel === 0) spread += 0.065; // AWP noscope inaccuracy

      // Apply spread & accumulated recoil
      const dir = fwd.clone();
      dir.x += (Math.random() - 0.5) * spread * 2;
      dir.y += (Math.random() - 0.5) * spread * 2 + shooter.recoilPitch * 0.02;
      dir.z += (Math.random() - 0.5) * spread * 2;
      dir.normalize();

      // Map intersection distance
      const mapHit = CS.world.raycastMap(eye, dir, w.range);
      const maxDist = mapHit ? mapHit.distance : w.range;

      // Unit hitbox intersection
      const targets = [];
      for (const u of CS.units.list) {
        if (!u.alive || u === shooter || u.team === shooter.team) continue;
        targets.push(...u.model.hitMeshes);
      }

      const rc = new THREE.Raycaster(eye, dir, 0.1, maxDist);
      const hits = rc.intersectObjects(targets, false);

      let endPoint = mapHit ? mapHit.point : eye.clone().addScaledVector(dir, w.range);
      let hitWall = !!mapHit;

      if (hits.length > 0) {
        const hit = hits[0];
        endPoint = hit.point;
        hitWall = false;

        const { unit: victim, zone } = hit.object.userData;
        let dmg = w.dmg;
        if (zone === 'head') dmg *= 4;
        else if (zone === 'legs') dmg *= 0.75;

        // CS 1.6 armor: the armor soaks (1 - penetration) of the hit at 50% efficiency; legs are unprotected
        if (victim.armor > 0 && zone !== 'legs') {
          const pen = w.pen != null ? w.pen : 0.75;
          let toHp = dmg * pen;
          let toArmor = (dmg - toHp) * 0.5;
          if (toArmor > victim.armor) { toArmor = victim.armor; toHp = dmg - toArmor / 0.5; }
          victim.armor = Math.max(0, Math.round(victim.armor - toArmor));
          dmg = toHp;
        }

        if (shooter.isLocal) CS.sfx.hit(zone === 'head');
        this.applyDamage(victim, Math.round(dmg), shooter, w.name, zone === 'head');
      }

      // Visual tracer from slight weapon offset
      const startTracer = eye.clone().add(new THREE.Vector3(0, -0.08, 0));
      CS.world.addTracer(startTracer, endPoint, hitWall);
    },

    _knifeAttack(shooter, w, stab) {
      const eye = CS.units.getEyePos(shooter);
      const dir = CS.units.getForward(shooter);
      const range = stab ? (w.stabRange || 1.7) : w.range;
      const targets = [];
      for (const u of CS.units.list) {
        if (!u.alive || u === shooter || u.team === shooter.team) continue;
        targets.push(...u.model.hitMeshes);
      }
      const rc = new THREE.Raycaster(eye, dir, 0.1, range);
      const hits = rc.intersectObjects(targets, false);
      if (hits.length) {
        const { unit: victim } = hits[0].object.userData;
        // 1.6 knife: slash 15 / stab 65, and 39 / 180 from behind
        const vf = CS.units.getForward(victim); vf.y = 0; vf.normalize();
        const toV = victim.pos.clone().sub(shooter.pos); toV.y = 0; toV.normalize();
        const back = vf.dot(toV) > 0.45;
        const dmg = stab ? (back ? 180 : w.stabDmg) : (back ? 39 : w.dmg);
        CS.sfx.hit(false);
        this.applyDamage(victim, dmg, shooter, 'Knife', false);
      }
    },

    applyDamage(victim, dmg, attacker, weaponName, isHeadshot) {
      if (!victim.alive) return;
      victim.hp -= dmg;

      if (victim.isLocal) {
        CS.hud.flashHurt();
      }

      if (victim.hp <= 0) {
        victim.hp = 0;
        victim.alive = false;
        victim.deaths++;

        if (attacker && attacker !== victim) {
          attacker.kills++;
          attacker.money = Math.min(16000, attacker.money + (weaponName === 'Knife' ? 1500 : 300));
        }

        // Drop C4 at death location if T dies holding it? Simply transfer/drop near site or give to surviving T
        if (victim.slots[4]) {
          victim.slots[4] = null;
          const nextT = CS.units.list.find(u => u.alive && u.team === 'T');
          if (nextT) nextT.slots[4] = { id: 'c4', mag: 0, res: 0 };
        }

        CS.hud.addKillFeed(attacker ? attacker.name : 'World', attacker?.team, victim.name, victim.team, weaponName, isHeadshot);
        CS.round.checkEnd();
      }
    },

    handleUseAction(u, holdingE, dt) {
      // Progress is tracked per unit (a single shared counter was zeroed every frame by the local player, so bots could never plant/defuse).
      // CS.combat.plantProgress / defuseProgress only mirror the local player's values for the HUD.
      const mirror = (p, d) => { if (u.isLocal) { this.plantProgress = p; this.defuseProgress = d; } };
      if (!u.alive || CS.round.state !== 'LIVE' || !holdingE) {
        u.plantProg = 0; u.defuseProg = 0; mirror(0, 0);
        return;
      }

      // CT Defusing planted bomb
      if (u.team === 'CT' && CS.world.bombPlanted && CS.world.bombPos) {
        const dist = u.pos.distanceTo(CS.world.bombPos);
        if (dist <= 2.3) {
          u.defuseProg = (u.defuseProg || 0) + dt;
          mirror(0, u.defuseProg);
          if (u.defuseProg >= CS.cfg.defuseTime) {
            u.defuseProg = 0; mirror(0, 0);
            CS.round.onBombDefused(u);
          }
          return;
        }
      }

      // T Planting C4 on site A or B
      if (u.team === 'T' && !CS.world.bombPlanted && u.slots[4]) {
        const site = CS.world.inSite(u.pos);
        if (site) {
          u.plantProg = (u.plantProg || 0) + dt;
          mirror(u.plantProg, 0);
          if (u.plantProg >= 2.6) {
            u.plantProg = 0; mirror(0, 0);
            u.slots[4] = null;
            if (u.activeSlot === 4) CS.weapons.switchSlot(u, u.slots[1] ? 1 : 2);
            CS.world.plantBomb(u.pos);
            CS.round.onBombPlanted(site.id);
          }
          return;
        }
      }

      u.plantProg = 0; u.defuseProg = 0; mirror(0, 0);
    }
  };
})();
