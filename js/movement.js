/* js/movement.js - GoldSrc / CS 1.6 player movement (pm_shared port) + first-person camera feel.
 *
 * Everything below is expressed in real GoldSrc units and converted to map units with U, so the numbers can be
 * compared 1:1 with the real game (250 u/s run, 800 gravity, 45u jump, sv_friction 4, sv_accelerate 5, sv_airaccelerate 10).
 *
 *  - fixed 100 Hz physics tick (the engine runs pmove in 10 ms slices), camera interpolated between ticks
 *  - PM_Friction / PM_Accelerate / PM_AirAccelerate exactly as in pm_shared.c (air wishspeed capped at 30 u/s,
 *    but the *uncapped* wishspeed is used for the acceleration step -> this is what makes strafe-jumping work)
 *  - PM_Jump: needs a fresh key press (holding space does NOT auto-bhop, scroll wheel does), jumping skips friction,
 *    CS's "no mega bunnyhop" cap (speed clamped to 1.2x the weapon's max speed on take-off)
 *  - half-gravity before + after the move (PM_AddCorrectedGravity)
 *  - weapon dependent max speed (AK 221, M4 230, AWP 210 / 150 scoped, others 250), walk 0.52x, duck 0.333x
 *  - HL view bob (cl_bob .01, cl_bobcycle .8, cl_bobup .5), strafe roll (cl_rollangle 2 / cl_rollspeed 200),
 *    punch-angle decay (10 + 0.5*len deg/s), footstep / jump / land sounds
 */
const U=6.2/250;                                   // map units per GoldSrc unit
const MV={tick:.01,fric:4,stop:75*U,acc:5,aacc:10,airws:30*U,grav:800*U,jump:Math.sqrt(2*800*45)*U,
 bhop:1.2,buf:.11,autohop:false,duck:.333,walk:.52,stand:1.6,crouch:1.2,step:85*U,stepMin:135*U};
// per-weapon max speed in GoldSrc units (what CS 1.6 returns from GetMaxSpeed)
const SPD={ak:221,m4:230,awp:210,deagle:250,usp:250,glock:250,knife:250};
let macc=0,jb=0,jh=0,stepD=0,land=0,roll=0,dead=0,bobT=0,pp=null;

function wheelJump(){jb=MV.buf}                   // mouse wheel = jump (the classic "bind mwheeldown +jump")

// PM_Accelerate (ground)
function pmAcc(wx,wz,ws,dt){const add=ws-(P.vx*wx+P.vz*wz);if(add<=0)return;const as=Math.min(add,MV.acc*dt*ws);P.vx+=wx*as;P.vz+=wz*as}
// PM_AirAccelerate: wishspeed is capped to 30 for the *target*, not for the acceleration step
function pmAir(wx,wz,ws,dt){const wsp=Math.min(ws,MV.airws),add=wsp-(P.vx*wx+P.vz*wz);if(add<=0)return;const as=Math.min(add,MV.aacc*ws*dt);P.vx+=wx*as;P.vz+=wz*as}

function pmTick(dt,live,id){
 const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);
 let wx=-sy*f+cy*s,wz=-cy*f-sy*s;const l=Math.hypot(wx,wz);if(l>0){wx/=l;wz/=l}else wx=wz=0;
 let wm=(SPD[id]||250)*U;if(id=='awp'&&zoom)wm=150*U;                       // weapon max speed (scoped AWP is slower)
 const ws=wm*(P.cr?MV.duck:keys.ShiftLeft?MV.walk:1);
 let g=P.y<=0&&P.vy<=0;
 if(g&&live&&(jb>0||(MV.autohop&&keys.Space))){                             // PM_Jump: happens before friction -> bhop keeps speed
  P.vy=MV.jump;g=false;jb=0;
  const sp=Math.hypot(P.vx,P.vz),cap=wm*MV.bhop;if(sp>cap){P.vx*=cap/sp;P.vz*=cap/sp}   // PM_PreventMegaBunnyJumping
  if(typeof mech=='function')mech('jump',.7)}
 if(g){                                                                      // PM_Friction + PM_WalkMove
  const sp=Math.hypot(P.vx,P.vz);
  if(sp>.0001){const ctl=sp<MV.stop?MV.stop:sp,k=Math.max(0,sp-ctl*MV.fric*dt)/sp;P.vx*=k;P.vz*=k}else P.vx=P.vz=0;
  if(l>0&&live)pmAcc(wx,wz,ws,dt)}
 else if(l>0&&live)pmAir(wx,wz,ws,dt);
 const ox=P.x,oz=P.z;P.x+=P.vx*dt;P.z+=P.vz*dt;
 if(!g)P.vy-=MV.grav*dt*.5;                                                  // half gravity before ...
 const vy0=P.vy;P.y+=P.vy*dt;
 if(!g)P.vy-=MV.grav*dt*.5;                                                  // ... and half after the move
 let landed=false;
 if(P.y<=0){if(!g&&vy0<-2){landed=true;land=Math.min(.07,-vy0*.009);if(typeof mech=='function')mech('land',Math.min(1,-vy0/7))}P.y=0;P.vy=0}
 collide(P);
 const rx=(P.x-ox)/dt,rz=(P.z-oz)/dt;                                       // keep tangential speed when sliding along walls (clip velocity)
 if(Math.abs(rx)<Math.abs(P.vx))P.vx=rx;if(Math.abs(rz)<Math.abs(P.vz))P.vz=rz;
 P.vel=Math.hypot(P.vx,P.vz);
 // footsteps: only when running (not walking / crouched), one every ~85 units travelled
 if(g&&!landed&&!P.cr&&!keys.ShiftLeft&&P.vel>MV.stepMin){stepD+=P.vel*dt;if(stepD>MV.step){stepD=0;if(typeof mech=='function')mech('step',.55)}}else if(P.vel<MV.stepMin)stepD=MV.step*.5}

function moveP(dt,live){
 const id=P.inv[P.cur];P.vx=P.vx||0;P.vz=P.vz||0;P.cr=!!(keys.ControlLeft||keys.KeyC);
 const sp=!!keys.Space;if(sp&&!jh)jb=MV.buf;jh=sp;                          // edge detect: a held key doesn't re-jump
 macc=Math.min(macc+dt,.08);
 while(macc>=MV.tick){pp=[P.x,P.y,P.z];pmTick(MV.tick,live,id);macc-=MV.tick}
 jb=Math.max(0,jb-dt);
 P.eh=(P.eh||MV.stand);P.eh+=((P.cr?MV.crouch:MV.stand)-P.eh)*Math.min(1,dt*14)}   // smooth crouch / stand

function camUpdate(dt){
 if(P.alive){
  // interpolate between the last two physics ticks so 60/144 Hz displays stay smooth
  const al=macc/MV.tick;let ix=P.x,iy=P.y,iz=P.z;
  if(pp&&Math.hypot(P.x-pp[0],P.z-pp[2])<1&&Math.abs(P.y-pp[1])<1){ix=pp[0]+(P.x-pp[0])*al;iy=pp[1]+(P.y-pp[1])*al;iz=pp[2]+(P.z-pp[2])*al}
  // HL V_CalcBob
  bobT+=dt;let cyc=(bobT%.8)/.8;cyc=cyc<.5?Math.PI*cyc/.5:Math.PI+Math.PI*(cyc-.5)/.5;
  let b=Math.hypot(P.vx||0,P.vz||0)/U*.01;b=b*.3+b*.7*Math.sin(cyc);b=Math.max(-7,Math.min(4,b));P.bob=b*U;P.ph=cyc;
  land*=Math.max(0,1-dt*8);
  // HL V_CalcRoll: cl_rollangle 2, cl_rollspeed 200
  const side=(P.vx||0)*Math.cos(P.yaw)-(P.vz||0)*Math.sin(P.yaw),rs=Math.max(-1,Math.min(1,side/(200*U)))*2*Math.PI/180;
  roll+=(-rs-roll)*Math.min(1,dt*20);
  // punch angle decay (PM: len -= (10 + len*0.5) * frametime, in degrees)
  const pa=P.pun||0,py=P.pyaw||0,L=Math.hypot(pa,py)*57.29578;
  if(L>0){const nl=Math.max(0,L-(10+L*.5)*dt),k=nl/L;P.pun=pa*k;P.pyaw=py*k}
  dead=0;cam.position.set(ix,iy+(P.eh||MV.stand)+P.bob-land,iz)}
 else{dead+=(1-dead)*Math.min(1,dt*3);cam.position.set(P.x,P.y+(P.eh||MV.stand)*(1-dead)+.4*dead,P.z);roll=.6*dead}
 cam.rotation.set(P.pitch+(P.pun||0),P.yaw+(P.pyaw||0),roll)}
