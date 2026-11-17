/* js/controllers.js - player + bot controllers */
function upP(dt){P.df=false;wtick(P,dt);if(!P.alive)return;const fr=phase!='freeze';
 const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0);P.cr=keys.ControlLeft||keys.KeyC;
 const sp=P.cr?2.5:keys.ShiftLeft?3.2:6.2,l=Math.hypot(f,s)||1;let vx=(-Math.sin(P.yaw)*f+Math.cos(P.yaw)*s)/l*sp,vz=(-Math.cos(P.yaw)*f-Math.sin(P.yaw)*s)/l*sp;if(!fr)vx=vz=0;
 P.vel=Math.hypot(vx,vz);P.x+=vx*dt;P.z+=vz*dt;if(keys.Space&&P.y==0&&fr)P.vy=7.5;P.vy-=24*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0}collide(P);
 P.burst=Math.max(0,P.burst-dt*3);const id=P.inv[P.cur],w=WP[id],a=P.ammo[id];
 if(fr&&md&&P.cd<=0&&P.rel<=0&&(w.auto||clk)){clk=0;if(w.melee||a.m>0){if(!w.melee)a.m--;P.cd=w.rof;
   let sps=w.melee?0:w.sp*(1+P.vel*.4+(P.y>0?5:0)+P.burst*2.5);if(id=='awp'&&!zoom)sps=.09;shootW(P,eye(P),dirOf(P),sps);
   P.pitch+=w.rc;P.yaw+=(rnd()-.5)*w.rc;P.burst++;kick=1}else reload(P)}
 if(keys.KeyE&&bomb.planted&&phase=='live'&&Math.hypot(P.x-bomb.x,P.z-bomb.z)<2.8)P.df=true;
 gun.scale.z=P.cur==2?.6:P.cur==3?.3:1;gun.visible=P.alive;const z=id=='awp'&&zoom;cam.fov=z?25:75;cam.updateProjectionMatrix()}
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
