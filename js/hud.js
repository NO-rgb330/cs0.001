/* js/hud.js - radar, HUD, main loop */
function tf(x,z){const dx=x-P.x,dz=z-P.z,f=dx*-Math.sin(P.yaw)+dz*-Math.cos(P.yaw),r=dx*Math.cos(P.yaw)-dz*Math.sin(P.yaw);return[65+r*1.2,65-f*1.2]}
function radar(){const c=$('rad').getContext('2d');c.clearRect(0,0,130,130);c.save();c.beginPath();c.arc(65,65,64,0,7);c.clip();c.fillStyle='rgba(30,110,30,.55)';c.fillRect(0,0,130,130);
 c.fillStyle='rgba(170,255,170,.35)';for(const w of walls){c.beginPath();[[w.x0,w.z0],[w.x1,w.z0],[w.x1,w.z1],[w.x0,w.z1]].forEach((p,i)=>{const q=tf(p[0],p[1]);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])});c.fill()}
 for(const u of units){if(!u.alive||u===P||u.team!='CT')continue;const q=tf(u.x,u.z);c.fillStyle='#4af';c.fillRect(q[0]-2,q[1]-2,5,5)}
 if(bomb.planted&&bomb.t%1<.5){const q=tf(bomb.x,bomb.z);c.fillStyle='#f33';c.fillRect(q[0]-3,q[1]-3,7,7)}
 c.fillStyle='#fff';c.beginPath();c.moveTo(65,59);c.lineTo(70,70);c.lineTo(60,70);c.fill();c.restore()}
function hud(dt){const id=P.inv[P.cur],w=WP[id],a=P.ammo[id];$('hp').textContent=Math.ceil(P.hp);$('ar').textContent=Math.ceil(P.armor);$('mon').textContent='$'+P.money;
 $('am').textContent=w.melee?'':a.m+' | '+a.r;const tm=Math.max(0,Math.ceil(bomb.planted?bomb.t:pt));$('tm').textContent=(bomb.planted?'💣 ':'')+Math.floor(tm/60)+':'+String(tm%60).padStart(2,'0');
 $('tm').style.color=bomb.planted?'#f55':'';$('score').textContent=`CT ${sc.CT}  ·  Round ${round}  ·  ${sc.T} T`;
 mt-=dt;if(mt<=0)$('msg').textContent='';feed.forEach(f=>f.t-=dt);feed=feed.filter(f=>f.t>0);$('feed').innerHTML=feed.map(f=>f.s).join('<br>');
 const h=$('hurt');h.style.opacity=Math.max(0,h.style.opacity-dt*1.5);$('xh').style.setProperty('--gp',(3+P.vel*.6+P.burst*2)+'px');$('xh').style.display=zoom&&id=='awp'?'none':'block';
 $('df').style.display=P.df?'block':'none';$('df').firstChild.style.width=Math.min(100,bomb.def*(P.kit?20:10))+'%';
 if($('sb').style.display=='block'){const row=u=>`<tr><td>${u.name}</td><td>${u.k}</td><td>${u.d}</td><td>${u.alive?'':'dead'}</td></tr>`;
  $('sb').innerHTML=['CT','T'].map(t=>`<table><tr><th>${t=='CT'?'Counter-Terrorists':'Terrorists'} (${sc[t]})</th><th>K</th><th>D</th><th></th></tr>${units.filter(u=>u.team==t).map(row).join('')}</table>`).join('')}
 if(buyOpen&&!canBuy())toggleBuy();radar()}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000||0);last=t;if(state!='play')return;if(locked){update(dt);hud(dt)}renderAll()}
