/* js/hands.js - CS 1.6-style first-person hands: gloved right hand that really wraps the grip (thumb on the left of the frame,
 * three fingers curled round the front strap, index finger resting on the trigger), a support hand that cups the forend,
 * a fist for the knife and a slim sleeve + cuff. Everything is authored in gun space (barrel -z, +y up, +x right), so the
 * hands move with the gun (recoil, bob, draw). Fingers are chains of capsules (cylinder + sphere joints).
 *
 * Grip descriptor G (all gun space, metres):
 *   yT / yB       top / bottom of the grip       zF[0], zF[1]  front strap z at the top, extra z at the bottom (lean)
 *   zB[0], zB[1]  back strap, same way           w             grip thickness (x)
 *   guardY        underside of the trigger guard tr {y,z}     trigger height and z of its rear face
 *   th {y}         thumb height (it runs forward along the left of the frame / grip)                */
const _hmat={};
function handMat(team,kind){const k=team+kind;if(_hmat[k])return _hmat[k];const T=team=='T';let m;
 if(kind=='glove')m=new T3.MeshPhongMaterial({map:tex('glove'),color:T?0xe2d2bc:0xffffff,shininess:12,specular:0x2a2a2a});
 else if(kind=='sleeve')m=new T3.MeshPhongMaterial({map:tex(T?'sleeveT':'sleeveCT'),color:0xffffff,shininess:3,specular:0x111111});
 else m=new T3.MeshPhongMaterial({color:T?0x7b6c48:0x3a4e7e,shininess:4,specular:0x111111});          // elastic cuff band
 return _hmat[k]=m}

// capsule chain through the points pts (gun space); rad = radius or one radius per joint
function chain(p,pts,rad,m){const rs=Array.isArray(rad)?rad:pts.map(()=>rad);
 for(let i=0;i<pts.length-1;i++){const a=V(pts[i][0],pts[i][1],pts[i][2]),d=V(pts[i+1][0]-a.x,pts[i+1][1]-a.y,pts[i+1][2]-a.z),L=d.length();if(L<1e-5)continue;
  const s=new T3.Mesh(new T3.CylinderGeometry(rs[i+1],rs[i],L,8),m);s.position.copy(a).addScaledVector(d,.5);s.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());p.add(s)}
 for(let i=0;i<pts.length;i++){const s=new T3.Mesh(new T3.SphereGeometry(rs[i]*1.03,8,6),m);s.position.set(pts[i][0],pts[i][1],pts[i][2]);p.add(s)}}
// slab (palm / back of the hand), tilted about x
function slab(p,m,w,h,d,x,y,z,rx){const s=new T3.Mesh(new T3.BoxGeometry(w,h,d),m);s.position.set(x,y,z);s.rotation.x=rx||0;p.add(s);return s}

// forearm: glove wrist -> elastic cuff -> sleeve that widens towards the (off-screen) elbow. dir points from the wrist to the elbow.
function foreArm(p,W,dir,team,len=.62,gv=.05){const d=V(dir[0],dir[1],dir[2]).normalize(),w=V(W[0],W[1],W[2]),q=new T3.Quaternion().setFromUnitVectors(V(0,1,0),d);
 const at=t=>w.clone().addScaledVector(d,t),seg=(r0,r1,t0,t1,m)=>{const s=new T3.Mesh(new T3.CylinderGeometry(r1,r0,t1-t0,12),m);s.position.copy(at((t0+t1)/2));s.quaternion.copy(q);p.add(s)};
 seg(.029,.031,-.03,gv,handMat(team,'glove'));seg(.040,.042,gv,gv+.035,handMat(team,'cuff'));seg(.041,.056,gv+.035,len,handMat(team,'sleeve'))}

// ---------- right hand on a grip ----------
function rightHand(p,G,team){const h=new T3.Group(),gl=handMat(team,'glove'),R=.0092,hw=G.w/2,span=G.yT-G.yB,f=y=>(G.yT-y)/span,zF=y=>G.zF[0]+G.zF[1]*f(y),zB=y=>G.zB[0]+G.zB[1]*f(y);
 // three curled fingers (middle, ring, pinky): right side -> across the front strap -> tip curled back onto the left side
 const y1=G.guardY-R-.002,sp=Math.max(R*1.5,Math.min(2*R+.001,(y1-(G.yB+.005))/2)),ys=[y1,y1-sp,y1-2*sp];
 ys.forEach((y,i)=>{const zf=zF(y),zb=zB(y);chain(h,[[hw+R*.9,y,zb+.006],[hw+R*.8,y,zf-R*.2],[hw*.45,y,zf-R*1.02],[-hw*.45,y,zf-R*1.02],[-hw-R*.8,y,zf-R*.35],[-hw-R*.95,y-.001*i,zf+R*.5],[-hw-R*.95,y-.002*i,zf+R*.5+.022-.003*i]],R*(1-.04*i),gl)});
 // index finger: along the right of the frame, tip on the trigger
 const ty=G.tr.y,tz=G.tr.z;chain(h,[[hw+R*.95,ty+.016,zB(ty)+.006],[hw+R*.9,ty+.013,tz+.034],[hw*.55,ty+.006,tz+R*2.3],[.003,ty,tz+R*.95]],[R,R*.98,R*.94,R*.88],gl);
 // thumb: from the web, forward along the left of the frame
 const thy=G.th.y,tb=G.zB[0];chain(h,[[-.002,thy+.004,tb+.026],[-hw-R*.95,thy,tb+.002],[-hw-R*1.0,thy+.001,tb-.03],[-hw-R*.95,thy+.002,tb-.062]],[R*1.2,R*1.12,R*1.0,R*.9],gl);
 // dorsum + heel: rounded mass behind / right of the backstrap, tilted with the grip
 const ytop=G.yT+.004,ybot=ys[2]-R*.5,ym=(ytop+ybot)/2,hp=ytop-ybot,tilt=-Math.atan(G.zB[1]/span);
 const blob=(rx,ry,rz,x,y,z,rot)=>{const b=new T3.Mesh(new T3.SphereGeometry(1,12,9),gl);b.scale.set(rx,ry,rz);b.position.set(x,y,z);b.rotation.x=rot||0;h.add(b);return b};
 blob(hw+.024,hp*.5,.03,hw*.35+.004,ym,zB(ym)+.024,tilt);                                                         // back of the hand
 blob(.016,hp*.33,.032,hw+.008,ym-.014,(zF(ym)+zB(ym))/2+.006,tilt);                                                // right side of the palm
 blob(.021,.019,.03,-.002,G.yT+.006,G.zB[0]+.02,0);                                                              // web between thumb and index finger
 blob(.03,.024,.03,hw*.5+.004,ybot+.012,zB(ybot)+.03,tilt);                                                      // heel of the hand
 foreArm(h,[hw*.5+.014,ybot+.014,zB(ybot)+.04],[.42,-.2,.88],team);
 p.add(h);return h}

// ---------- support hand: palm under the object (handguard / magazine), fingers up its right side, thumb up its left ----------
function cupHand(p,C,team){const h=new T3.Group(),gl=handMat(team,'glove'),R=.0092,hw=C.hw,x=C.x,yb=C.yb,z=C.z;
 for(let i=0;i<4;i++){const zi=z+(1.5-i)*.0196,t=R*(1-.03*i);chain(h,[[x-hw*.75,yb-R*1.2,zi+.004],[x+hw*.55,yb-R*1.05,zi],[x+hw+R*.85,yb+R*.05,zi],[x+hw+R*.95,yb+C.hh*(.6-.06*i),zi-.004]],t,gl)}
 chain(h,[[x-hw*.7,yb-R*.9,z+.052],[x-hw-R*.9,yb+R*.5,z+.034],[x-hw-R*1.0,yb+C.hh*.55,z-.012],[x-hw-R*.8,yb+C.hh*.62,z-.032]],[R*1.25,R*1.15,R*1.0,R*.9],gl);
 slab(h,gl,hw*2+.034,.03,.088,x-hw*.1,yb-R*1.7,z+.004,0);
 {const b=new T3.Mesh(new T3.SphereGeometry(1,12,9),gl);b.scale.set(.03,.026,.05);b.position.set(x-hw*.55-.012,yb-R*1.7,z+.018);b.rotation.z=.25;h.add(b)}   // back of the hand, seen from the left / below
 foreArm(h,[x-hw*1.15-.014,yb-R*2.3,z+.056],[-.46,-.24,.85],team,.62,.085);
 p.add(h);return h}

// ---------- fist round a knife handle (axis z, centre z0, radius r) ----------
function fistHand(p,K,team){const h=new T3.Group(),gl=handMat(team,'glove'),R=.0092,rc=K.r+R*.92,z0=K.z0;
 for(let i=0;i<4;i++){const zi=z0-.032+i*.0195,pts=[];for(let a=-.15;a<=3.7;a+=.62)pts.push([Math.cos(a)*rc,-Math.sin(a)*rc,zi]);chain(h,pts,R*(1-.03*i),gl)}
 chain(h,[[-.004,rc+.012,z0+.05],[-.012,rc+.005,z0+.015],[-.014,rc+.002,z0-.03],[-.012,rc+.003,z0-.05]],[R*1.25,R*1.15,R*1.0,R*.9],gl);                           // thumb along the top
 {const b=new T3.Mesh(new T3.SphereGeometry(1,12,9),gl);b.scale.set(.026,.044,.052);b.position.set(rc+.012,0,z0+.012);h.add(b)}                               // back of the hand
 foreArm(h,[rc+.02,-.02,z0+.05],[.4,-.3,.87],team);
 p.add(h);return h}

// per-weapon: build whichever hands the model describes (b.G grip, b.C support grip, b.K knife)
function buildHands(b,team){
 if(b.K)b.rh=fistHand(b.g,b.K,team);else if(b.G)b.rh=rightHand(b.g,b.G,team);
 if(b.C){b.lh=cupHand(b.g,b.C,team);if(b.mkMag){b.spare=b.mkMag();b.spare.visible=false;b.lh.add(b.spare)}}}
