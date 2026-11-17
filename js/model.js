/* js/model.js - articulated humanoid body (no weapons yet) */
const _mats={};
const mat=c=>_mats[c]||(_mats[c]=new T3.MeshLambertMaterial({color:c}));
function seg(par,geo,c,x,y,z,sx=1,sy=1,sz=1){const m=new T3.Mesh(geo,mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);par.add(m);return m}
// a limb is a pivot group at a joint with a tapered cylinder hanging below it
function limb(par,x,y,z,r0,r1,len,c){const p=new T3.Group();p.position.set(x,y,z);par.add(p);seg(p,new T3.CylinderGeometry(r0,r1,len,8),c,0,-len/2,0);return p}

function buildBody(team){
 const ct=team=='CT';
 const C=ct?{top:0x2c3e66,vest:0x1d2433,pant:0x2b303b,hat:0x1b2436,boot:0x15130f,glove:0x1a1a1a}
           :{top:0x5a4c38,vest:0x3a3226,pant:0x34322c,hat:0x1e1e1e,boot:0x1a1510,glove:0x222222};
 const skin=[0xe0b394,0xc68e6b,0x8d5a3c][(rnd()*3)|0],g=new T3.Group();g.rotation.order='YXZ';
 // pelvis + torso (chest, tactical vest, neck, shoulders)
 const hips=new T3.Group();hips.position.y=.95;g.add(hips);seg(hips,new T3.BoxGeometry(.34,.2,.21),C.pant,0,0,0);
 const torso=new T3.Group();torso.position.y=.08;hips.add(torso);
 seg(torso,new T3.CylinderGeometry(.22,.18,.56,10),C.top,0,.3,0,1,1,.58);
 seg(torso,new T3.CylinderGeometry(.235,.2,.36,10),C.vest,0,.34,0,1,1,.66);
 seg(torso,new T3.CylinderGeometry(.05,.055,.1,8),skin,0,.64,0);
 for(const s of[-1,1])seg(torso,new T3.SphereGeometry(.075,8,6),C.top,s*.25,.52,0);
 // head: CT helmet + visor strip, T balaclava with eye slit (front is -z)
 const head=new T3.Group();head.position.y=.78;torso.add(head);
 seg(head,new T3.SphereGeometry(.115,12,10),skin,0,0,0,.9,1.12,1);
 if(ct){seg(head,new T3.SphereGeometry(.13,12,8,0,Math.PI*2,0,Math.PI*.55),C.hat,0,.02,0,.95,1.05,1.05);seg(head,new T3.BoxGeometry(.2,.03,.04),0x111111,0,0,-.12)}
 else{seg(head,new T3.SphereGeometry(.122,12,10),C.hat,0,0,0,.93,1.14,1.02);seg(head,new T3.BoxGeometry(.15,.04,.02),skin,0,.03,-.115)}
 // arms: shoulder pivot -> upper arm -> elbow pivot -> forearm + glove
 const arm=s=>{const u=limb(torso,s*.27,.5,0,.052,.042,.3,C.top),f=limb(u,0,-.3,0,.042,.035,.28,C.top);seg(f,new T3.SphereGeometry(.048,8,6),C.glove,0,-.3,0);return{u,f}};
 // legs: hip pivot -> thigh -> knee pivot -> shin + boot
 const leg=s=>{const t=limb(hips,s*.1,-.06,0,.088,.066,.46,C.pant),sh=limb(t,0,-.46,0,.064,.05,.43,C.pant);seg(sh,new T3.BoxGeometry(.1,.09,.27),C.boot,0,-.4,-.04);return{t,s:sh}};
 return{g,hips,torso,head,lA:arm(-1),rA:arm(1),lL:leg(-1),rL:leg(1)}}

// walk cycle driven by actual ground speed; arms raise into an aiming pose when a target is seen
function animBody(u,dt){const b=u.body;if(!u.alive||!b)return;
 const sp=Math.min(7,Math.hypot(u.x-u.px,u.z-u.pz)/Math.max(dt,.001));u.px=u.x;u.pz=u.z;
 u.ph+=sp*dt*1.9;const a=Math.min(1,sp/5),s=Math.sin(u.ph)*a;
 b.lL.t.rotation.x=s*.8;b.rL.t.rotation.x=-s*.8;
 b.lL.s.rotation.x=-Math.max(0,-s);b.rL.s.rotation.x=-Math.max(0,s);
 b.hips.position.y=.95+Math.abs(Math.cos(u.ph))*.03*a;b.torso.rotation.x=-.12*a;
 if(u.tgt){b.lA.u.rotation.x=1.3;b.rA.u.rotation.x=1.2;b.lA.f.rotation.x=.7;b.rA.f.rotation.x=.9}
 else{b.lA.u.rotation.x=-s*.7;b.rA.u.rotation.x=s*.7;b.lA.f.rotation.x=b.rA.f.rotation.x=.2+.4*a}}
