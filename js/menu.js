/* menu.js - Main menu VGUI window handling, options sync, server connect & boot */
(function () {
  const el = id => document.getElementById(id);

  function showWin(key) {
    document.querySelectorAll('#menu .w').forEach(w => (w.style.display = 'none'));
    const target = el('w-' + key);
    if (target) target.style.display = 'block';
  }

  document.querySelectorAll('#nav div').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.k;
      if (k === 'quit') {
        alert('Thanks for playing Counter-Strike: Web Edition!');
        return;
      }
      showWin(k);
    });
  });

  // Server browser row selection
  document.querySelectorAll('#w-find tbody tr').forEach(tr => {
    tr.addEventListener('click', () => {
      document.querySelectorAll('#w-find tbody tr').forEach(r => r.classList.remove('s'));
      tr.classList.add('s');
    });
  });

  function applySettings() {
    CS.cfg.name = el('o-name').value.trim() || 'Player';
    CS.cfg.sens = parseFloat(el('o-sens').value) || 1.0;
    CS.cfg.xhColor = el('o-xh').value;
    CS.cfg.botSkill = parseInt(el('s-skill').value, 10);
    CS.cfg.winLimit = Math.max(1, parseInt(el('s-win').value, 10) || 8);
    CS.cfg.roundTime = Math.max(20, parseInt(el('s-rt').value, 10) || 115);
    CS.cfg.startMoney = Math.max(0, parseInt(el('s-money').value, 10) || 800);
  }

  el('go').addEventListener('click', () => {
    applySettings();
    CS.game.start();
  });

  el('conn').addEventListener('click', () => {
    applySettings();
    CS.game.start();
  });

  el('dc').addEventListener('click', () => {
    CS.game.stop();
  });

  // Boot Three.js renderer
  window.addEventListener('DOMContentLoaded', () => {
    CS.game.init();
  });
})();
