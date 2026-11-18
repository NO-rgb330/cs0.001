/* movement.js - GoldSrc-inspired acceleration, friction, airstrafe, crouch, walk, step-up */
(function () {
  CS.movement = {
    step(u, input, dt) {
      if (!u.alive) return;

      const p = CS.phys;
      const w = CS.WEAPONS[u.activeId];
      const wMul = w ? w.speedMul : 1.0;

      // Freeze time locks horizontal movement
      const frozen = CS.round.state === 'FREEZE';

      u.crouching = !!input.crouch;
      u.walking = !!input.walk;

      // Smooth eye height transition
      const targetEye = u.crouching ? p.eyeCrouch : p.eyeStand;
      u.eyeHeight += (targetEye - u.eyeHeight) * Math.min(1, dt * 14);
      const colHeight = u.crouching ? p.heightCrouch : p.heightStand;

      // Compute wish direction in XZ plane
      const sin = Math.sin(u.yaw);
      const cos = Math.cos(u.yaw);
      let wishX = 0, wishZ = 0;
      if (!frozen) {
        const fwd = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
        const side = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        wishX = -sin * fwd + cos * side;
        wishZ = -cos * fwd - sin * side;
        const len = Math.hypot(wishX, wishZ);
        if (len > 0) { wishX /= len; wishZ /= len; }
      }

      let maxSpd = u.crouching ? p.speedCrouch : u.walking ? p.speedWalk : p.speedRun;
      maxSpd *= wMul;
      if (u.scopeLevel > 0) maxSpd *= 0.65;

      // Ground friction + acceleration or air strafe acceleration
      if (u.onGround) {
        const spd = Math.hypot(u.vel.x, u.vel.z);
        if (spd > 0.001) {
          const drop = Math.max(spd, 1.5) * p.friction * dt;
          const newSpd = Math.max(0, spd - drop) / spd;
          u.vel.x *= newSpd;
          u.vel.z *= newSpd;
        }
        this._accelerate(u, wishX, wishZ, maxSpd, p.accelGround, dt);

        if (!frozen && input.jump) {
          u.vel.y = p.jumpVel;
          u.onGround = false;
        }
      } else {
        // Air strafe allows crisp mid-air turning without capping total speed harshly
        this._accelerate(u, wishX, wishZ, Math.min(maxSpd, 4.2), p.accelAir, dt);
      }

      // Gravity
      u.vel.y -= p.gravity * dt;

      // Horizontal collision & sliding (X then Z)
      const nextX = u.pos.x + u.vel.x * dt;
      if (!CS.world.collidesHoriz(nextX, u.pos.y, u.pos.z, p.radius, colHeight)) {
        u.pos.x = nextX;
      } else {
        u.vel.x = 0;
      }

      const nextZ = u.pos.z + u.vel.z * dt;
      if (!CS.world.collidesHoriz(u.pos.x, u.pos.y, nextZ, p.radius, colHeight)) {
        u.pos.z = nextZ;
      } else {
        u.vel.z = 0;
      }

      // Vertical movement & floor clamping
      u.pos.y += u.vel.y * dt;
      const floorY = CS.world.getFloorY(u.pos.x, u.pos.z, u.pos.y, p.radius);

      if (u.pos.y <= floorY) {
        u.pos.y = floorY;
        u.vel.y = 0;
        u.onGround = true;
      } else if (u.onGround && u.pos.y - floorY < 0.25 && u.vel.y <= 0) {
        // Stick to downward ramps
        u.pos.y = floorY;
        u.vel.y = 0;
      } else {
        u.onGround = false;
      }

      // Footstep sounds
      if (u.isLocal && u.onGround && !u.walking && !u.crouching) {
        const spd = Math.hypot(u.vel.x, u.vel.z);
        if (spd > 4.2) {
          u.stepDist += spd * dt;
          if (u.stepDist > 2.3) {
            u.stepDist = 0;
            CS.sfx.step();
          }
        }
      }
    },

    _accelerate(u, wx, wz, wishSpeed, accel, dt) {
      const curProj = u.vel.x * wx + u.vel.z * wz;
      const addSpeed = wishSpeed - curProj;
      if (addSpeed <= 0) return;
      let accelSpeed = accel * wishSpeed * dt;
      if (accelSpeed > addSpeed) accelSpeed = addSpeed;
      u.vel.x += accelSpeed * wx;
      u.vel.z += accelSpeed * wz;
    }
  };
})();
