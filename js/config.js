/* config.js - Global namespace, weapon specs, physics constants, textures, WebAudio SFX */
window.CS = {
  Maps: {},
  WeaponModels: {},

  cfg: {
    name: 'Player',
    sens: 1.0,
    xhColor: '#00ff00',
    botSkill: 1,
    winLimit: 8,
    roundTime: 115,
    startMoney: 800,
    freezeTime: 4,
    bombTime: 40,
    defuseTime: 6
  },

  phys: {
    gravity: 22.0,
    jumpVel: 8.2,
    speedRun: 7.4,
    speedWalk: 3.9,
    speedCrouch: 3.1,
    accelGround: 12.0,
    accelAir: 4.5,
    friction: 6.0,
    stepHeight: 0.45,
    radius: 0.36,
    heightStand: 1.75,
    heightCrouch: 1.15,
    eyeStand: 1.56,
    eyeCrouch: 0.96
  },

  WEAPONS: {
    knife:  { id: 'knife',  name: 'Knife',       slot: 3, price: 0,    dmg: 45,  rof: 0.45, auto: true,  mag: 0,  res: 0,   reload: 0,   spread: 0.0,   moveSpread: 0.0,  recoil: 0.0,  range: 2.3, speedMul: 1.04 },
    glock:  { id: 'glock',  name: 'Glock-18',    slot: 2, price: 400,  dmg: 22,  rof: 0.16, auto: false, mag: 20, res: 120, reload: 1.9, spread: 0.012, moveSpread: 0.03, recoil: 0.9,  range: 90,  speedMul: 1.00 },
    usp:    { id: 'usp',    name: 'USP .45',     slot: 2, price: 500,  dmg: 28,  rof: 0.18, auto: false, mag: 12, res: 100, reload: 2.0, spread: 0.008, moveSpread: 0.025,recoil: 1.0,  range: 95,  speedMul: 1.00 },
    deagle: { id: 'deagle', name: 'Desert Eagle',slot: 2, price: 650,  dmg: 54,  rof: 0.34, auto: false, mag: 7,  res: 35,  reload: 2.2, spread: 0.007, moveSpread: 0.045,recoil: 2.8,  range: 110, speedMul: 0.98 },
    mp5:    { id: 'mp5',    name: 'MP5 Navy',    slot: 1, price: 1500, dmg: 23,  rof: 0.085,auto: true,  mag: 30, res: 120, reload: 2.3, spread: 0.016, moveSpread: 0.03, recoil: 0.85, range: 85,  speedMul: 0.98 },
    ak47:   { id: 'ak47',   name: 'AK-47',       slot: 1, price: 2500, dmg: 36,  rof: 0.10, auto: true,  mag: 30, res: 90,  reload: 2.4, spread: 0.010, moveSpread: 0.065,recoil: 1.65, range: 130, speedMul: 0.92 },
    m4a1:   { id: 'm4a1',   name: 'M4A1',        slot: 1, price: 3100, dmg: 32,  rof: 0.092,auto: true,  mag: 30, res: 90,  reload: 2.4, spread: 0.008, moveSpread: 0.055,recoil: 1.25, range: 130, speedMul: 0.94 },
    awp:    { id: 'awp',    name: 'AWP',         slot: 1, price: 4750, dmg: 115, rof: 1.45, auto: false, mag: 10, res: 30,  reload: 3.1, spread: 0.001, moveSpread: 0.11, recoil: 4.5,  range: 200, speedMul: 0.85, scope: true },
    c4:     { id: 'c4',     name: 'C4 Explosive',slot: 4, price: 0,    dmg: 0,   rof: 1.0,  auto: false, mag: 0,  res: 0,   reload: 0,   spread: 0,     moveSpread: 0,    recoil: 0,    range: 0,   speedMul: 1.00 }
  },

  BUY_MENU: [
    { key: '1', id: 'glock',  label: 'Glock-18',     price: 400,  team: 'T' },
    { key: '2', id: 'usp',    label: 'USP .45',      price: 500,  team: 'CT' },
    { key: '3', id: 'deagle', label: 'Desert Eagle', price: 650 },
    { key: '4', id: 'mp5',    label: 'MP5 Navy',     price: 1500 },
    { key: '5', id: 'ak47',   label: 'AK-47',        price: 2500, team: 'T' },
    { key: '6', id: 'm4a1',   label: 'M4A1',         price: 3100, team: 'CT' },
    { key: '7', id: 'awp',    label: 'AWP',          price: 4750 },
    { key: '8', id: 'kevlar', label: 'Kevlar + Helm',price: 1000, isArmor: true }
  ],

  tex: {
    _cache: {},
    get(kind) {
      if (this._cache[kind]) return this._cache[kind];
      const cv = document.createElement('canvas');
      cv.width = cv.height = 128;
      const ctx = cv.getContext('2d');

      if (kind === 'sand') {
        ctx.fillStyle = '#c8af80';
        ctx.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 900; i++) {
          ctx.fillStyle = i % 2 ? '#bda270' : '#d5be90';
          ctx.fillRect(Math.random() * 128, Math.random() * 128, 3, 2);
        }
      } else if (kind === 'sandstone' || kind === 'wall') {
        ctx.fillStyle = kind === 'wall' ? '#bfa374' : '#ccb387';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#9b8157';
        ctx.lineWidth = 2;
        for (let y = 0; y < 128; y += 32) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke();
          const off = (y / 32) % 2 ? 32 : 0;
          for (let x = off; x < 128; x += 64) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 32); ctx.stroke();
          }
        }
      } else if (kind === 'crate') {
        ctx.fillStyle = '#8b5e34';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#5c3c1e';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, 120, 120);
        ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(122, 122); ctx.stroke();
        ctx.lineWidth = 2;
        for (let y = 16; y < 120; y += 16) {
          ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(120, y); ctx.stroke();
        }
      }

      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      this._cache[kind] = t;
      return t;
    }
  },

  sfx: {
    ctx: null,
    _init() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    shot(wid, vol = 0.22) {
      const ac = this._init();
      if (!ac) return;
      const now = ac.currentTime;
      const len = wid === 'awp' ? 0.34 : wid === 'deagle' ? 0.22 : 0.14;
      const buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * (wid === 'awp' ? 0.08 : 0.03)));
      }
      const src = ac.createBufferSource();
      src.buffer = buf;

      const flt = ac.createBiquadFilter();
      flt.type = 'lowpass';
      flt.frequency.value = wid === 'usp' || wid === 'm4a1' ? 1100 : wid === 'awp' ? 1800 : 2400;

      const g = ac.createGain();
      g.gain.setValueAtTime(wid === 'usp' || wid === 'm4a1' ? vol * 0.55 : vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + len);

      src.connect(flt); flt.connect(g); g.connect(ac.destination);
      src.start(now);
    },
    tone(freq, dur = 0.1, vol = 0.12, type = 'square') {
      const ac = this._init();
      if (!ac) return;
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(g); g.connect(ac.destination);
      osc.start(now); osc.stop(now + dur);
    },
    hit(hs) {
      this.tone(hs ? 1350 : 620, 0.06, 0.14, 'triangle');
    },
    step() {
      this.tone(110 + Math.random() * 25, 0.04, 0.035, 'sine');
    },
    beep() {
      this.tone(2400, 0.07, 0.09, 'sine');
    },
    explode() {
      this.shot('awp', 0.45);
      this.tone(55, 0.65, 0.35, 'sawtooth');
    }
  }
};
