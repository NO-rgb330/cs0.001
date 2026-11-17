/* js/combat.js - combat: raycasts, collision, sound, shooting, death */
function rayBox(o,d,b){let t0=0,t1=1e9;for(const [a,mn,mx,dd] of [[o.x,b.x0,b.x1,d.x],[o.y,b.y0,b.y1,d.y],[o.z,b.z0,b.z1,d.z]]){
 if(Math.abs(dd)<1e-8){if(a<mn||a>mx)return 1e9}else{let u=(mn-a)/dd,v=(mx-a)/dd;if(u>v){const x=u;u=v;v=x}t0=Math.max(t0,u);t1=Math.min(t1,v);if(t0>t1)return 1e9}}return t0}
const boxesOf=e=>[[{x0:e.x-.32,x1:e.x+.32,z0:e.z-.32,z1:e.z+.32,y0:e.y,y1:e.y+1.5},0],[{x0:e.x-.22,x1:e.x+.22,z0:e.z-.22,z1:e.z+.22,y0:e.y+1.5,y1:e.y+1.9},1]];
const eye=u=>V(u.x,u.y+(u.cr?1.2:1.6),u.z),dirOf=u=>V(-Math.sin(u.yaw)*Math.cos(u.pitch),Math.sin(u.pitch),-Math.cos(u.yaw)*Math.cos(u.pitch));
function los(a,b){const o=V(a.x,a.y+1.5,a.z),d=V(b.x-a.x,b.y+1.2-a.y-1.5,b.z-a.z);for(const w of walls)if(rayBox(o,d,w)<1)return false;return true}
function collide(u){for(let k=0;k<2;k++)for(const w of walls){if(u.y>=w.y1-.05)continue;const cx=Math.max(w.x0,Math.min(u.x,w.x1)),cz=Math.max(w.z0,Math.min(u.z,w.z1)),dx=u.x-cx,dz=u.z-cz,d=Math.hypot(dx,dz);
 if(d<.4){if(d<1e-4){u.x+=.4}else{u.x+=dx/d*(.4-d);u.z+=dz/d*(.4-d)}}}}
let ac;function snd(f,d,v=.2,ty='sawtooth',dist=0){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime;o.type=ty;o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(f*.3,n+d);
 g.gain.setValueAtTime(v/(1+dist*.1),n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g).connect(ac.destination);o.start();o.stop(n+d)}catch(e){}}
function tracer(a,b){const l=new T3.Line(new T3.BufferGeometry().setFromPoints([a,b]),new T3.LineBasicMaterial({color:0xffee88}));l.life=.05;scene.add(l);tr.push(l)}
function shootW(u,o,d0,sp){const id=u.inv[u.cur],w=WP[id];const d=V(d0.x+(rnd()-.5)*sp*2,d0.y+(rnd()-.5)*sp*2,d0.z+(rnd()-.5)*sp*2).normalize();
 let best=w.melee?2.4:300,hit=null,hd=0;for(const b of walls){const t=rayBox(o,d,b);if(t<best){best=t;hit=null}}
 for(const e of units){if(!e.alive||e===u||e.team==u.team)continue;for(const [b,h] of boxesOf(e)){const t=rayBox(o,d,b);if(t<best){best=t;hit=e;hd=h}}}
 if(!w.melee)tracer(o.clone().addScaledVector(d,1.2).add(V(0,-.15,0)),o.clone().addScaledVector(d,best));
 snd(w.melee?220:id=='awp'?80:140,.1,.25,'sawtooth',u===P?0:Math.hypot(u.x-P.x,u.z-P.z));
 if(hit){let dm=w.dmg*(hd&&!w.melee?4:1);if(hit.armor>0&&(!hd||hit.helmet)){hit.armor=Math.max(0,hit.armor-dm*.4);dm*=.6}hit.hp-=dm;if(hit===P)$('hurt').style.opacity=.7;if(hit.hp<=0)die(hit,u,id,hd)}}
function die(v,k,id,hs){v.alive=false;v.hp=0;v.died=1;v.g.rotation.x=-1.5;v.g.position.y=.3;v.d++;k.k++;k.money=Math.min(16000,k.money+300);
 feed.push({s:`<span style="color:${k.team=='T'?'#f66':'#6af'}">${k.name}</span> [${WP[id].n}]${hs?' ★':''} <span style="color:${v.team=='T'?'#f66':'#6af'}">${v.name}</span>`,t:5});
 if(v===P)toast('You were killed by '+k.name,3);
 if(bomb.carrier===v)bomb.carrier=units.find(u=>u.alive&&u.team=='T'&&u.bot)||null;snd(300,.3,.15,'square',Math.hypot(v.x-P.x,v.z-P.z))}
function reload(u){const id=u.inv[u.cur],w=WP[id],a=u.ammo[id];if(!w.mag||u.rel>0||a.m>=w.mag||a.r<=0)return;u.rel=id=='awp'?3:2.2}
function wtick(u,dt){u.cd-=dt;if(u.rel>0){u.rel-=dt;if(u.rel<=0){const id=u.inv[u.cur],w=WP[id],a=u.ammo[id],n=Math.min(w.mag-a.m,a.r);a.m+=n;a.r-=n}}}
