/* js/menu.js - main menu wiring */
const wins=['find','new','opt'];document.querySelectorAll('#nav div').forEach(d=>d.onclick=()=>wins.forEach(w=>$('w-'+w).style.display=w==d.dataset.k?'block':'none'));
$('go').onclick=startGame;$('conn').onclick=startGame;
