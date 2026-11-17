/* js/game.js - game flow: start, exit, new round */
function startGame(){cfg.skill=+$('s-skill').value;cfg.win=+$('s-win').value||8;cfg.rt=+$('s-rt').value||115;cfg.money=+$('s-money').value||800;cfg.name=$('o-name').value||'Player';cfg.xh=$('o-xh').value;cfg.sens=+$('o-sens').value;
 init();units.forEach(u=>scene.remove(u.g));units=[];sc={CT:0,T:0};round=0;over=0;
 P=mk('CT',0,cfg.name);for(let i=0;i<4;i++)mk('CT',1,NAMES[i]);for(let i=0;i<5;i++)mk('T',1,NAMES[4+i]);
 $('menu').style.display='none';$('hud').style.display='block';$('xh').style.setProperty('--x',cfg.xh);state='play';newRound();ren.domElement.requestPointerLock()}
function exitGame(){state='menu';document.exitPointerLock();$('menu').style.display='block';$('hud').style.display='none';$('pause').style.display='none'}
function newRound(){round++;phase='freeze';pt=5;bomb={planted:0,t:0,def:0,carrier:null};bombM.visible=false;buyOpen=0;$('buy').style.display='none';
 site=rnd()<.5?'A':'B';const kinds=['E','M','E','M',rnd()<.5?'E':'M'];let ci=0,ti=0;
 for(const u of units){if(u.died||!u.alive){loadout(u);u.died=0}u.alive=true;u.hp=100;u.g.visible=!!u.bot;u.g.rotation.set(0,0,0);u.y=0;u.vy=0;u.tgt=null;u.wp=[];u.rel=0;u.cd=0;u.pl=0;
  if(u.bot)botBuy(u);
  
  u.cur=u.inv[1]?1:2;
  if(u.team=='T'){u.x=-8+ti*4;u.z=42;u.yaw=0;if(u.bot){u.wp=route(site,kinds[ti]);if(!ti)bomb.carrier=u}ti++}
  else{u.x=-8+ci*4;u.z=-43;u.yaw=Math.PI;if(u.bot)u.wp=[HOLD[ci-1].slice()];ci++}u.pitch=0}
 toast('Round '+round+' – '+(P.alive?'Defend sites A and B':''),3)}
function toast(s,t=3){$('msg').textContent=s;mt=t}
