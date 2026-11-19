/* buymenu.js - Classic CS 1.6 VGUI text buy menu & bot economy purchasing */
(function () {
  CS.buymenu = {
    open: false,

    toggle() {
      const u = CS.units.local;
      if (!u || !u.alive) return;
      this.open = !this.open;
      CS.input.buyOpen = this.open;
      this.render();
    },

    close() {
      this.open = false;
      CS.input.buyOpen = false;
      const el = document.getElementById('buy');
      if (el) el.style.display = 'none';
    },

    render() {
      const el = document.getElementById('buy');
      const u = CS.units.local;
      if (!this.open || !u) { el.style.display = 'none'; return; }

      el.style.display = 'block';
      const items = CS.BUY_MENU.filter(it => !it.team || it.team === u.team);
      el.innerHTML = items.map((it, idx) => {
        const can = u.money >= it.price;
        return `<div class="it ${can ? '' : 'off'}"><b>${idx + 1}</b>${it.label}<span>$${it.price}</span></div>`;
      }).join('') + `<div class="it" style="border-top:1px solid #444;margin-top:4px"><b>0</b>Close</div>`;
    },

    handleKey(digit) {
      if (!this.open) return false;
      if (digit === '0') { this.close(); return true; }

      const u = CS.units.local;
      const items = CS.BUY_MENU.filter(it => !it.team || it.team === u.team);
      const item = items[Number(digit) - 1];
      if (!item) return false;

      if (this.buy(u, item)) {
        CS.sfx.tone(660, 0.06, 0.08);
        this.close();
      } else {
        CS.sfx.tone(180, 0.08, 0.08);
      }
      return true;
    },

    buy(u, item) {
      if (u.money < item.price) return false;
      if (item.isArmor) {
        if (u.armor >= 100) return false;
        u.money -= item.price;
        u.armor = 100;
        return true;
      }

      const w = CS.WEAPONS[item.id];
      if (!w) return false;
      u.money -= item.price;
      u.slots[w.slot] = { id: w.id, mag: w.mag, res: w.res };
      CS.weapons.switchSlot(u, w.slot);
      return true;
    },

    botBuy(u) {
      if (u.money >= 1000 && u.armor < 50) {
        this.buy(u, CS.BUY_MENU.find(i => i.isArmor));
      }
      if (!u.slots[1]) {
        const prefs = u.team === 'CT' ? ['m4a1', 'mp5'] : ['ak47', 'mp5'];
        for (const wid of prefs) {
          const entry = CS.BUY_MENU.find(i => i.id === wid);
          if (entry && u.money >= entry.price) {
            this.buy(u, entry);
            break;
          }
        }
      }
    }
  };
})();
