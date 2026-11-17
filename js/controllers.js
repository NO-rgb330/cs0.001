/* js/controllers.js - player + bot controllers */
function upP(dt){P.df=false;wtick(P,dt);if(!P.alive)return;const fr=phase!='freeze';
 moveP(dt,fr);                                                                 // GoldSrc-style movement (js/movement.js)
 P.burst=Math.max(0,P.burst-dt*(P.inv[P.cur]=='awp'?1:3.2));const id=P.inv[P.cur],w=WP[id],a=P.ammo[id];
 if(fr&&md&&P.cd<=0&&P.rel<=0&&(w.auto||clk)){clk=0;
  if(w.melee){P.cd=w.rof;shootW(P,eye(P),aimDir(P),0);onShot(id);mech('knifeair')}
  else if(a.m>0){a.m--;P.cd=w.rof;shootW(P,eye(P),aimDir(P),spreadOf(P,id));recoilKick(id,P.burst);onShot(id);P.burst++;if(id=='awp')zoom=0}   // AWP un-scopes after every shot
  else{mech('empty');P.cd=.25;reload(P)}}
 if(keys.KeyE&&bomb.planted&&phase=='live'&&Math.hypot(P.x-bomb.x,P.z-bomb.z)<2.8)P.df=true;
 const z=id=='awp'&&zoom;cam.fov=[75,33,10][z?zoom:0]||75;cam.updateProjectionMatrix()}
function think(b,dt){wtick(b,dt);b.df=false;if(!b.alive)return;if(phase!='live')return;let mx=0,mz=0,sp=5.8;b.seeT-=dt;
 if(b.seeT<=0){b.seeT=.25;let best=null,bd=55;for(const e of units){if(!e.alive||e.team==b.team)continue;const d=Math.hypot(e.x-b.x,e.z-b.z);if(d<bd&&los(b,e)){best=e;bd=d}}
  if(best&&best!==b.tgt)b.react=[.8,.45,.22][cfg.skill]*(.7+rnd()*.6);b.tgt=best}
 const t=b.tgt;
 if(t&&t.alive){const dx=t.x-b.x,dz=t.z-b.z,d=Math.hypot(dx,dz);b.yaw=Math.atan2(-dx,-dz);b.st-=dt;if(b.st<=0){b.st=.5+rnd()*.8;b.sd=rnd()<.5?-1:1;b.still=rnd()<.5}
  if(!b.still){mx=Math.cos(b.yaw)*b.sd;mz=-Math.sin(b.yaw)*b.sd;sp=3}b.react-=dt;const id=b.inv[b.cur],w=WP[id],a=b.ammo[id];
  if(b.react<=0&&b.cd<=0&&b.rel<=0){if(a.m<=0)reload(b);else{a.m--;b.cd=w.rof*1.8+rnd()*.15;const o=eye(b),hs=rnd()<[.1,.2,.35][cfg.skill];
   shootW(b,o,V(t.x,t.y+(hs?1.65:1.1),t.z).sub(o).normalize(),(.012+d*.0013)*[2,1.3,.8][cfg.skill]*(b.still?1:1.5))}}}
 else if(b.wp.length){const w=b.wp[0],dx=w[0]-b.x,dz=w[1]-b.z,d=Math.hypot(dx,dz);if(d<1)b.wp.shift();else{mx=dx/d;mz=dz/d;b.yaw=Math.atan2(-mx,-mz)}}
 else if(b.team=='T'&&b===bomb.carrier&&!bomb.planted){b.pl+=dt;if(b.pl>=3){bomb={planted:1,t:40,def:0,x:b.x,z:b.z,lb:0};bombM.position.set(b.x,.15,b.z);bombM.visible=true;toast('The bomb has been planted',3);
  units.forEach(u=>{if(u.bot&&u.alive&&u.team=='CT')u.wp=[[bomb.x+rnd()-.5,bomb.z+rnd()-.5]]})}}
 else if(b.team=='CT'&&bomb.planted&&Math.hypot(b.x-bomb.x,b.z-bomb.z)<3)b.df=true;
 b.x+=mx*sp*dt;b.z+=mz*sp*dt;collide(b)}
