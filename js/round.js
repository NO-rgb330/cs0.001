/* js/round.js - round logic + main update */
function endR(team,msg){phase='end';pt=5;sc[team]++;toast((team=='T'?'Terrorists':'Counter-Terrorists')+' win – '+msg,5);
 units.forEach(u=>u.money=Math.min(16000,u.money+(u.team==team?3250:1400)));snd(500,.4,.2,'triangle');if(sc[team]>=cfg.win)over=team}
function stepRound(dt){pt-=dt;
 if(phase=='freeze'&&pt<=0){phase='live';pt=cfg.rt;toast('Go go go!',2)}
 else if(phase=='live'){
  if(bomb.planted){bomb.t-=dt;const df=units.some(u=>u.alive&&u.team=='CT'&&u.df);bomb.def=df?bomb.def+dt:0;
   if(Math.floor(bomb.t)!=bomb.lb){bomb.lb=Math.floor(bomb.t);snd(900,.08,.1,'square')}
   if(bomb.def>=(units.some(u=>u.alive&&u.df&&u.kit)?5:10))endR('CT','Bomb defused');else if(bomb.t<=0)endR('T','Target bombed')}
  if(phase=='live'){const ta=units.some(u=>u.alive&&u.team=='T'),ca=units.some(u=>u.alive&&u.team=='CT');
   if(!ca)endR('T','Counter-Terrorists eliminated');else if(!ta&&!bomb.planted)endR('CT','Terrorists eliminated');else if(!ta&&bomb.planted&&false);else if(pt<=0&&!bomb.planted)endR('CT','Time expired')}}
 else if(phase=='end'&&pt<=0){if(over){toast('Match over',2);exitGame()}else newRound()}}
function update(dt){stepRound(dt);upP(dt);for(const u of units)if(u.bot)think(u,dt);
 for(let i=tr.length-1;i>=0;i--){tr[i].life-=dt;if(tr[i].life<=0){scene.remove(tr[i]);tr.splice(i,1)}}
 for(const u of units)if(u.bot){u.g.position.x=u.x;u.g.position.z=u.z;if(u.alive)u.g.position.y=u.y;u.g.rotation.y=u.yaw;animBody(u,dt);botGunTick(u,dt)}
 if(bomb.planted)bombM.scale.setScalar(1+.3*(bomb.t%1<.15));
 camUpdate(dt);vmUpdate(dt);shellsUpdate(dt)}
