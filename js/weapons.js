/* js/weapons.js - CS 1.6-style weapons: extruded gun models, first-person viewmodel (draw / reload / fire anims),
 * muzzle flash, brass, impacts, recoil + accuracy model, synthesized sounds, scope.
 * Gun space: barrel points to -z, +y is up, +x is the right-hand side. Silhouettes are authored in [forward, up] metres. */
const _gm={},_tx={};

// ---------- procedural textures (128px, tiled every 10 cm) ----------
function tex(k){if(_tx[k])return _tx[k];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');let s=k.length*7919+13;
 const r=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const base={wood:'#9a5522',wooddk:'#5a3018',steeldk:'#202328',steel:'#6a7078',poly:'#1a1b1d',polylt:'#383b40',green:'#3e5b40',chrome:'#b9bec6',blade:'#c4c9cf',grip:'#17181a'}[k]||'#444';
 g.fillStyle=base;g.fillRect(0,0,128,128);
 const lines=(n,a,col,w)=>{for(let i=0;i<n;i++){g.strokeStyle=col.replace('A',(r()*a).toFixed(3));g.lineWidth=w*(.5+r());const y=r()*128,x=r()*128,l=30+r()*98;g.beginPath();g.moveTo(x,y);g.lineTo(x+l,y+(r()-.5)*3);g.stroke()}};
 const dots=(n,col,sz)=>{for(let i=0;i<n;i++){g.fillStyle=col.replace('A',(r()*.5).toFixed(3));g.fillRect(r()*128,r()*128,sz*(.5+r()),sz*(.5+r()))}};
 if(k=='wood'||k=='wooddk'){lines(70,.35,'rgba(40,15,0,A)',1.6);lines(40,.25,'rgba(255,190,110,A)',1.2);for(let i=0;i<2;i++){g.fillStyle='rgba(50,20,5,.35)';g.beginPath();g.ellipse(r()*128,r()*128,6+r()*5,2+r()*2,0,0,7);g.fill()}}
 else if(k=='steeldk'||k=='steel'||k=='blade'){lines(60,.22,'rgba(255,255,255,A)',.8);lines(30,.25,'rgba(0,0,0,A)',.8);dots(160,'rgba(255,255,255,A)',1.2);if(k!='blade')dots(40,'rgba(0,0,0,A)',2.5)}
 else if(k=='chrome'){lines(50,.25,'rgba(255,255,255,A)',1);lines(30,.2,'rgba(60,70,90,A)',1);dots(90,'rgba(255,255,255,A)',1)}
 else if(k=='green'){for(let i=0;i<90;i++){g.fillStyle=`rgba(${r()<.5?'20,40,22':'110,140,100'},${(r()*.4).toFixed(2)})`;g.beginPath();g.ellipse(r()*128,r()*128,1+r()*3,1+r()*3,0,0,7);g.fill()}}
 else{dots(300,'rgba(255,255,255,A)',1);dots(160,'rgba(0,0,0,A)',1.5)}
 const t=new T3.CanvasTexture(c);t.wrapS=t.wrapT=T3.RepeatWrapping;t.repeat.set(10,10);return _tx[k]=t}
const MAT={polylt:['polylt',14],wood:['wood',18],woodDk:['wooddk',26],steel:['steel',75],steelDk:['steeldk',55],poly:['poly',14],green:['green',12],chrome:['chrome',110],blade:['blade',120],grip:['grip',10]};
const FLAT={rubber:[0x0f0f10,6],brass:[0xc9a227,90],lens:[0x2a5f8a,140],black:[0x0b0b0c,30],sight:[0x0a0a0a,10],cuff:[0x5d6b86,6],white:[0xe8e8e8,40]};
function wmat(k){if(_gm[k])return _gm[k];const t=MAT[k];return _gm[k]=t?new T3.MeshPhongMaterial({map:tex(t[0]),color:0xffffff,shininess:t[1],specular:0x333333}):new T3.MeshPhongMaterial({color:FLAT[k][0],shininess:FLAT[k][1],specular:0x222222})}
const gmat=(c,sh=35)=>typeof c=='string'?wmat(c):_gm[c+'_'+sh]||(_gm[c+'_'+sh]=new T3.MeshPhongMaterial({color:c,shininess:sh,specular:0x222222}));

// ---------- geometry helpers ----------
function bx(p,w,h,d,c,x,y,z,rx=0,sh){const m=new T3.Mesh(new T3.BoxGeometry(w,h,d),gmat(c,sh));m.position.set(x,y,z);m.rotation.x=rx;p.add(m);return m}
// cylinder along the barrel axis (z); r = rear radius, r1 = front radius
function cy(p,r,len,c,x,y,z,sh,r1){const geo=new T3.CylinderGeometry(r,r1==null?r:r1,len,16);geo.rotateX(Math.PI/2);const m=new T3.Mesh(geo,gmat(c,sh));m.position.set(x,y,z);p.add(m);return m}
// vertical cylinder (turrets, pins)
function cv(p,r,h,c,x,y,z,sh){const m=new T3.Mesh(new T3.CylinderGeometry(r,r,h,14),gmat(c,sh));m.position.set(x,y,z);p.add(m);return m}
// extruded side silhouette: pts = [[forward, up], ...], w = thickness (x), k = material key, x = lateral offset
function pf(p,pts,w,k,x=0,holes){const s=new T3.Shape();pts.forEach((q,i)=>i?s.lineTo(q[0],q[1]):s.moveTo(q[0],q[1]));
 if(holes)for(const h of holes){const hp=new T3.Path();h.forEach((q,i)=>i?hp.lineTo(q[0],q[1]):hp.moveTo(q[0],q[1]));s.holes.push(hp)}
 const geo=new T3.ExtrudeGeometry(s,{depth:w,bevelEnabled:false});geo.translate(0,0,-w/2);geo.rotateY(Math.PI/2);   // shape x -> -z (forward), extrusion -> x
 const m=new T3.Mesh(geo,gmat(k));m.position.x=x;p.add(m);return m}
// curved magazine silhouette: centre line starts at (a0,b0) and runs down/forward while the angle sweeps ang0 -> ang1
function curve(p,a0,b0,w,th,len,ang0,ang1,k,n=8){const Lf=[],R=[];let a=a0,b=b0;
 for(let i=0;i<=n;i++){const ph=ang0+(ang1-ang0)*i/n,pa=Math.cos(ph),pb=Math.sin(ph);Lf.push([a-pa*w/2,b-pb*w/2]);R.push([a+pa*w/2,b+pb*w/2]);a+=Math.sin(ph)*len/n;b-=Math.cos(ph)*len/n}
 return pf(p,Lf.concat(R.reverse()),th,k)}
// trigger guard: ring outline with a hole, top edge at b, hanging h below
function guard(p,a,b,l,h,k,th=.007){const o=[[a+l/2,b],[a-l/2,b],[a-l/2,b-h*.45],[a-l*.18,b-h],[a+l*.22,b-h],[a+l/2,b-h*.55]],cx=a,cz=b-h*.5,t=.0065;
 const inn=o.map(q=>{const dx=cx-q[0],dz=cz-q[1],d=Math.hypot(dx,dz);return[q[0]+dx/d*t,q[1]+dz/d*t]});return pf(p,o,th,k,0,[inn])}
const tag=(g,x,y,z)=>{const o=new T3.Object3D();o.position.set(x,y,z);g.add(o);return o};

// ---------- pistols ----------
function pistol(o){const g=new T3.Group(),sl=new T3.Group(),mag=new T3.Group();g.add(sl,mag);
 const L=o.sl,sh=o.sh,sw=o.sw,b0=.02,aR=-.15*L-.03,aF=.85*L-.03,lean=Math.tan(-o.gt)*o.gh,top=b0+sh,gw=o.gw;
 pf(sl,[[aR,b0],[aF,b0],[aF,b0+sh*.78],[aF-(o.ch||.014),top],[aR+.012,top],[aR,b0+sh*.86]],sw,o.sk);                   // slide
 for(let i=0;i<6;i++)bx(sl,sw+.002,sh*.62,.0028,'sight',0,b0+sh*.5,-(aR+.02+i*.0085));                               // rear serrations
 bx(sl,.007,.011,.012,'sight',0,top+.004,-(aF-.014));bx(sl,sw*.7,.011,.011,'sight',0,top+.004,-(aR+.022));            // front / rear sight
 bx(sl,sw*.5,.004,.03,'black',sw*.28,top-.004,-(aR+.1*L+.03));                                                          // ejection port
 if(o.ham)bx(sl,.008,.013,.014,'sight',0,b0+sh*.88,-(aR-.004));
 if(o.rail)for(let i=0;i<5;i++)bx(sl,sw*.72,.004,.01,'sight',0,top+.002,-(aR+.06+i*.04));
 cy(sl,.0085,.022,'black',0,b0+sh*.5,-(aF+.008));
 if(o.sup){cy(sl,.0165,o.sup,'steelDk',0,b0+sh*.5,-(aF+o.sup/2+.01));cy(sl,.0175,.01,'steel',0,b0+sh*.5,-(aF+o.sup-.004))}   // suppressor
 pf(g,[[aR+.012,b0],[aF-.012,b0],[aF-.012,b0-.016],[.03,b0-.019],[.0,b0-.022],[aR+.02,b0-.016]],sw*.96,o.fk);          // frame / dust cover
 pf(g,[[.006,b0-.004],[aR+.012,b0-.004],[aR+.012-lean,b0-o.gh],[.006-lean,b0-o.gh]],gw?sw*.98:sw,o.gk||'poly');        // grip
 for(let i=0;i<4;i++){const dy=.03+i*.016,f=dy/o.gh;bx(g,sw*1.02,.003,gw*.7,'sight',0,b0-dy,-((.006+aR+.012)/2-lean*f))}                          // grip checkering
 guard(g,.016,b0-.012,.085,.044,o.fk);pf(g,[[.0,b0-.018],[.008,b0-.018],[-.003,b0-.046],[-.011,b0-.044]],.007,'black');  // guard + trigger
 const mz=(.006+aR+.012)/2-lean;
 pf(mag,[[.0,b0-.01],[aR+.022,b0-.01],[aR+.022-lean,b0-o.gh],[.0-lean,b0-o.gh]],sw*.78,'steelDk');
 bx(mag,sw*.98,.012,gw*1.08,'rubber',0,b0-o.gh-.004,-mz);                                                               // magazine base plate
 return{g,type:'pistol',mz:tag(g,0,b0+sh*.5,-(aF+(o.sup||0)+.03)),ej:tag(g,sw/2,b0+sh*.8,-(aR+.06)),parts:{slide:sl,mag},
  hr:[0,-o.gh*.45,.035],hl:[0,-o.gh-.045,.05],hlr:1,vp:o.vp||[.12,-.105,-.4],sh:o.shell||.019}}

// ---------- AK-47 ----------
function mkAK(){const g=new T3.Group(),mag=new T3.Group(),bolt=new T3.Group();g.add(mag,bolt);
 pf(g,[[-.115,-.034],[.19,-.034],[.19,.040],[.16,.048],[-.04,.052],[-.115,.048]],.048,'steelDk');                         // stamped receiver
 pf(g,[[-.10,.044],[.17,.044],[.165,.058],[.05,.064],[-.09,.058]],.044,'steel');                                          // dust cover
 pf(g,[[.17,-.040],[.26,-.047],[.38,-.043],[.43,-.030],[.43,.028],[.17,.028]],.056,'wood');                              // lower handguard
 pf(g,[[.20,.028],[.425,.028],[.425,.046],[.20,.046]],.05,'wood');pf(g,[[.19,.046],[.43,.046],[.43,.056],[.19,.056]],.046,'steelDk');   // upper handguard + heat shield
 for(let i=0;i<5;i++)bx(g,.058,.052,.004,'steelDk',0,.0,-(.21+i*.04));                                                   // handguard retainer ribs
 cy(g,.0105,.30,0x111111,0,.025,-.575);cy(g,.011,.17,0x1a1a1a,0,.052,-.47);cy(g,.0045,.2,'steel',0,-.002,-.52);          // barrel, gas tube, cleaning rod
 pf(g,[[.55,.005],[.60,.005],[.60,.058],[.58,.072],[.56,.072],[.55,.060]],.03,'steelDk');pf(g,[[.585,.07],[.597,.07],[.597,.098],[.585,.098]],.008,'black');   // gas block + front sight
 cy(g,.0165,.07,'steelDk',0,.025,-.715,60);cy(g,.018,.008,'black',0,.025,-.752);                                          // slant muzzle brake
 pf(g,[[.14,.058],[.205,.058],[.205,.071],[.17,.075],[.14,.069]],.03,'steelDk');bx(g,.012,.004,.02,'sight',0,.077,-.17);   // rear sight leaf
 curve(mag,.06,-.034,.05,.036,.215,.02,.78,'steelDk',10);                                                                 // banana magazine
 pf(g,[[-.06,-.030],[-.12,-.030],[-.158,-.14],[-.10,-.152]],.032,'woodDk');                                               // pistol grip
 guard(g,-.01,-.034,.115,.046,'steelDk',.008);pf(g,[[.0,-.036],[.008,-.036],[-.004,-.064],[-.012,-.062]],.006,'black');   // guard + trigger
 pf(g,[[-.11,.046],[-.20,.043],[-.30,.036],[-.375,.014],[-.385,-.075],[-.37,-.078],[-.30,-.030],[-.20,-.026],[-.11,-.030]],.042,'wood');   // stock
 pf(g,[[-.375,.016],[-.387,.016],[-.397,-.078],[-.384,-.081]],.044,'rubber');                                             // butt plate
 bx(g,.006,.012,.1,'steel',.027,.022,-.0);bx(g,.004,.03,.05,'black',.026,.032,-.07);                                      // selector + ejection port
 bx(bolt,.012,.012,.03,'steelDk',.03,.03,-.02);
 return{g,type:'rifle',mz:tag(g,0,.025,-.76),ej:tag(g,.03,.03,-.03),parts:{mag,bolt},hr:[0,-.095,.095],hl:[0,-.045,-.31],vp:[.15,-.1,-.52],sh:.039}}

// ---------- M4A1 (silenced, like the 1.6 viewmodel) ----------
function mkM4(){const g=new T3.Group(),mag=new T3.Group(),bolt=new T3.Group();g.add(mag,bolt);
 pf(g,[[-.07,.0],[.24,.0],[.24,.050],[.20,.056],[-.07,.056]],.044,'poly');pf(g,[[-.09,-.066],[.18,-.066],[.20,-.04],[.20,.0],[-.09,.0]],.040,'poly');   // upper + lower receiver
 pf(g,[[-.065,.056],[.15,.056],[.15,.084],[.12,.094],[-.02,.098],[-.065,.090]],.028,'poly',0,[[[-.04,.064],[.11,.064],[.11,.080],[-.04,.080]]]);   // carry handle
 bx(g,.02,.02,.025,'poly',0,.08,.055);                                                                                      // rear aperture
 cy(g,.032,.26,'poly',0,0,-.36,14);for(const a of[.26,.33,.40,.46])cy(g,.034,.012,'steelDk',0,0,-a,40);                  // round handguard + rings
 pf(g,[[.34,.0],[.38,.0],[.38,.06],[.365,.082],[.35,.082],[.34,.064]],.014,'steelDk');                                    // front sight tower
 cy(g,.026,.30,'steel',0,0,-.64,70);for(const a of[.52,.60,.68,.76])cy(g,.0275,.008,'steelDk',0,0,-a,40);cy(g,.02,.01,'black',0,0,-.787);   // suppressor
 curve(mag,.045,-.066,.036,.032,.15,.02,.2,'poly',4);bx(mag,.036,.01,.05,'rubber',0,-.218,-.064,.18);
 pf(g,[[-.035,-.06],[-.075,-.06],[-.102,-.15],[-.06,-.158]],.034,'poly');guard(g,.03,-.066,.095,.044,'poly',.008);       // grip + guard
 pf(g,[[.0,-.068],[.008,-.068],[-.004,-.094],[-.012,-.092]],.006,'black');
 cy(g,.02,.18,'steelDk',0,0,.16);pf(g,[[-.14,.03],[-.24,.034],[-.33,.02],[-.335,-.08],[-.30,-.082],[-.22,-.045],[-.14,-.05]],.04,'poly');   // buffer tube + stock
 pf(g,[[-.33,.022],[-.34,.022],[-.345,-.082],[-.33,-.084]],.042,'rubber');
 bx(g,.004,.018,.04,0x333333,.024,.02,.07);bx(bolt,.022,.012,.035,'poly',0,.058,.1);                                       // ejection port cover, charging handle
 return{g,type:'rifle',mz:tag(g,0,0,-.80),ej:tag(g,.025,.02,.07),parts:{mag,bolt},hr:[0,-.095,.06],hl:[0,-.03,-.36],vp:[.15,-.1,-.52],sh:.045}}

// ---------- AWP ----------
function mkAWP(){const g=new T3.Group(),mag=new T3.Group(),bolt=new T3.Group();g.add(mag,bolt);
 pf(g,[[-.465,.055],[-.35,.07],[-.20,.064],[-.08,.04],[-.04,.0],[.38,-.004],[.38,-.056],[-.02,-.056],[-.045,-.06],[-.055,-.15],[-.115,-.16],[-.14,-.085],[-.25,-.055],[-.35,-.066],[-.465,-.11]],.046,'green');   // thumb-hole style stock
 pf(g,[[-.468,.05],[-.478,.05],[-.488,-.11],[-.468,-.112]],.048,'rubber');                                               // butt pad
 cy(g,.03,.34,'steelDk',0,.024,-.02,60);cy(g,.034,.07,'steelDk',0,.024,-.2,60);                                          // receiver + barrel shroud
 cy(g,.014,.8,'black',0,.024,-.55,70);cy(g,.019,.02,'steelDk',0,.024,-.305);cy(g,.017,.04,'steelDk',0,.024,-.17)                                              // barrel + collar
 cy(g,.022,.085,'steelDk',0,.024,-.97,70);for(const z of[-.94,-.97,-.995])cy(g,.0235,.006,'black',0,.024,z);              // muzzle brake
 cy(g,.028,.30,'black',0,.092,-.1,70);cy(g,.03,.07,'black',0,.092,-.27,70,.044);cy(g,.033,.06,'black',0,.092,.08,70);cy(g,.0345,.004,'lens',0,.092,-.306,140);   // scope tube + bell + eyepiece + lens
 cv(g,.014,.026,'steelDk',0,.13,-.1,60);cv(g,.011,.018,'steelDk',.034,.092,-.1,60);                                      // turrets
 pf(g,[[.0,.052],[.04,.052],[.036,.07],[.004,.07]],.03,'steelDk');pf(g,[[-.20,.052],[-.16,.052],[-.164,.07],[-.196,.07]],.03,'steelDk');   // scope mounts (rear / front)
 bx(bolt,.062,.011,.011,'steelDk',.045,.03,.06);const k=new T3.Mesh(new T3.SphereGeometry(.018,10,8),gmat(0x0b0b0c,60));k.position.set(.082,.03,.06);bolt.add(k);   // bolt handle + knob
 cy(bolt,.011,.07,'steel',0,.03,.04);
 pf(mag,[[-.06,-.03],[.04,-.03],[.04,-.085],[-.06,-.085]],.04,'steelDk');
 guard(g,.0,-.056,.11,.05,'steelDk',.008);pf(g,[[-.01,-.058],[-.002,-.058],[-.014,-.088],[-.022,-.086]],.006,'black');
 return{g,type:'awp',mz:tag(g,0,.024,-1.02),ej:tag(g,.03,.03,.02),parts:{mag,bolt},hr:[0,-.095,.085],hl:[0,-.04,-.3],vp:[.14,-.1,-.56],sh:.065}}

// ---------- knife ----------
function mkKnife(){const g=new T3.Group();
 cy(g,.0135,.13,'rubber',0,0,.03);for(let i=0;i<4;i++)cy(g,.0145,.006,'black',0,0,.0+i*.025);cy(g,.012,.014,'steel',0,0,.098);   // grip rings + pommel
 bx(g,.064,.014,.014,'steel',0,0,-.04);                                                                                    // cross guard
 pf(g,[[.05,.021],[.17,.024],[.26,.014],[.295,-.004],[.17,-.013],[.05,-.013]],.0045,'blade');                              // blade (drop point)
 pf(g,[[.07,.0],[.2,.004],[.2,.0],[.07,-.003]],.0052,'black');                                                              // fuller
 for(let i=0;i<5;i++)bx(g,.0055,.004,.008,'black',0,.026,-(.09+i*.012));                                                   // spine serrations
 g.rotation.x=.4;
 return{g,type:'knife',mz:tag(g,0,0,-.3),ej:tag(g,0,0,0),parts:{},hr:[0,0,.03],hl:null,vp:[.14,-.12,-.4]}}

const GUNS={
 usp:()=>pistol({sw:.03,sh:.042,sl:.2,sk:'steel',fk:'poly',gh:.11,gw:.052,gt:-.22,ch:.016,ham:1,sup:.13,vp:[.11,-.1,-.4]}),
 glock:()=>pistol({sw:.03,sh:.038,sl:.19,sk:'steelDk',fk:'polylt',gk:'polylt',gh:.11,gw:.05,gt:-.12,ch:.01,vp:[.11,-.1,-.4]}),
 deagle:()=>pistol({sw:.04,sh:.058,sl:.26,sk:'chrome',fk:'chrome',gk:'grip',gh:.125,gw:.06,gt:-.25,ch:.03,rail:1,shell:.03,vp:[.12,-.105,-.42]}),
 ak:mkAK,m4:mkM4,awp:mkAWP,knife:mkKnife};

// ---------- first-person arms ----------
function arm(p,a,b,sc,gc){a=V(a[0],a[1],a[2]);b=V(b[0],b[1],b[2]);const d=b.clone().sub(a),L=d.length(),q=new T3.Quaternion().setFromUnitVectors(V(0,1,0),d.clone().normalize()),g=new T3.Group();
 const sl=new T3.Mesh(new T3.CylinderGeometry(.04,.054,L,14),gmat(sc,8));sl.position.copy(a).addScaledVector(d,.5);sl.quaternion.copy(q);g.add(sl);
 const cf=new T3.Mesh(new T3.CylinderGeometry(.045,.045,.035,14),gmat('cuff'));cf.position.copy(b).addScaledVector(d,-.5/L*.05);cf.quaternion.copy(q);g.add(cf);   // cuff at the wrist
 const h=new T3.Group();h.position.copy(b);h.quaternion.copy(q);g.add(h);
 bx(h,.072,.08,.036,gc,0,.05,0,0,10);                                                                                      // palm
 for(let i=0;i<4;i++)bx(h,.016,.056,.02,gc,-.027+i*.018,.115,.014,.55,10);                                                 // curled fingers
 const th=bx(h,.02,.05,.022,gc,.045,.06,.012,0,10);th.rotation.z=-.5;                                                      // thumb
 p.add(g);return g}

// ---------- viewmodel (own render pass, so it never clips into walls) ----------
let vmScene,vmCam,vmRoot,vm=null,vmId=null,vmT=0,vmDrawT=0,vmDrawD=1,vk=0,vsw=0,vsd=1,flash,flashL,flashW,flashT=0,flashS=0,scopeEl,_sg,_ft=[];
const vmCache={},shells=[],fx=[];
const DRAW={usp:.9,glock:.9,deagle:1,ak:1,m4:1,awp:1.45,knife:.9};                    // deploy time (can't fire while drawing)
const REL={ak:2.45,m4:3.05,awp:2.5,usp:2.7,glock:2.2,deagle:2.2};                      // reload time, CS 1.6
const CUE={ak:[[.2,'clipout'],[.56,'clipin'],[.8,'bolt']],m4:[[.22,'clipout'],[.56,'clipin'],[.82,'bolt']],awp:[[.18,'clipout'],[.5,'clipin'],[.66,'bolt'],[.8,'bolt']],
 usp:[[.2,'clipout'],[.5,'clipin'],[.78,'slide']],glock:[[.2,'clipout'],[.5,'clipin'],[.78,'slide']],deagle:[[.2,'clipout'],[.52,'clipin'],[.78,'slide']]};
const KICK={ak:[.034,.045,14],m4:[.022,.03,16],awp:[.085,.12,4],usp:[.03,.06,12],glock:[.028,.055,12],deagle:[.06,.12,8]};   // [back, pitch up, decay/s]
const FLASH={usp:.035,glock:.1,deagle:.2,ak:.2,m4:.05,awp:.28,knife:0};                                              // silenced guns barely flash
const sm=x=>x*x*(3-2*x),ease=(p,a,b)=>sm(Math.max(0,Math.min(1,(p-a)/(b-a))));

function starTex(n){const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');c.translate(64,64);
 const gr=c.createRadialGradient(0,0,2,0,0,64);gr.addColorStop(0,'#fff');gr.addColorStop(.25,'#ffe9a0');gr.addColorStop(.6,'rgba(255,160,40,.5)');gr.addColorStop(1,'rgba(255,100,0,0)');
 c.fillStyle=gr;c.beginPath();const sp=7+n*2;for(let i=0;i<sp*2;i++){const a=i/(sp*2)*Math.PI*2,r=i%2?18+(i*37%11):52+(i*53%13);c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill();
 c.beginPath();c.arc(0,0,22,0,7);c.fill();return new T3.CanvasTexture(cv)}
function softTex(col){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,1,32,32,32);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,64,64);return new T3.CanvasTexture(cv)}
function holeTex(){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.arc(32,32,20,0,7);c.fill();c.fillStyle='rgba(10,8,6,.95)';c.beginPath();c.arc(32,32,8,0,7);c.fill();return new T3.CanvasTexture(cv)}

function initViewmodel(){vmScene=new T3.Scene();vmCam=new T3.PerspectiveCamera(68,1,.01,10);
 vmScene.add(new T3.HemisphereLight(0xffffff,0x8a7a60,1.05));const dl=new T3.DirectionalLight(0xfff0d8,.9);dl.position.set(.4,1,.6);vmScene.add(dl);
 vmRoot=new T3.Group();vmScene.add(vmRoot);flashL=new T3.PointLight(0xffb050,0,1.4);vmScene.add(flashL);
 for(let i=0;i<3;i++)_ft.push(starTex(i));
 flash=new T3.Sprite(new T3.SpriteMaterial({map:_ft[0],blending:T3.AdditiveBlending,transparent:true,depthWrite:false}));flash.visible=false;
 flashW=new T3.PointLight(0xffc070,0,16);scene.add(flashW);                      // the flash also lights up the map
 _fxT={smoke:softTex('rgba(200,195,185,.7)'),blood:softTex('rgba(150,10,10,.9)'),spark:softTex('rgba(255,220,120,1)'),hole:holeTex()};
 scopeEl=document.createElement('div');scopeEl.id='scope';$('hud').appendChild(scopeEl)}
let _fxT;
function getVM(id){if(vmCache[id])return vmCache[id];const b=GUNS[id](),r=new T3.Group(),fz=-.14-b.vp[2],sc=P.team=='T'?0x3a3a28:0x26365c,gc=P.team=='T'?0x1c1a16:0x151517;r.add(b.g);
 b.rh=arm(b.g,[b.hr[0]+.07,b.hr[1]-.12,fz],b.hr,sc,gc);if(b.hl)b.lh=arm(b.g,[b.hl[0]-.1,b.hl[1]-.12,fz],b.hl,sc,gc);
 r.visible=false;b.root=r;b.cf=0;vmRoot.add(r);return vmCache[id]=b}

// reload choreography: returns pose offsets for progress p in 0..1
function rlPose(type,p){const o={dn:ease(p,0,.12)-ease(p,.88,1),lx:0,ly:0,lz:0,mag:0,mv:1,bolt:0,slide:0,lv:1,hand:0};
 if(type=='pistol'){o.hand=ease(p,.08,.22)-ease(p,.72,.86);o.lv=p>.05&&p<.9?1:0;o.ly=-.22*(1-o.hand);
  o.mag=-.24*ease(p,.2,.3);if(p>.3&&p<.46){o.mv=0}if(p>=.46)o.mag=-.24*(1-ease(p,.46,.6));
  const s=ease(p,.74,.8)-ease(p,.8,.9);o.slide=.04*s}
 else{const k=ease(p,.06,.2)-ease(p,.66,.8);let mp=p<.44?-.24*ease(p,.2,.32):-.24*(1-ease(p,.44,.58));if(p>=.34&&p<.44)o.mv=0;o.mag=mp;o.hand=k;
  o.lx=0;o.ly=(-.1+mp)*k;o.lz=.2*k;
  if(type=='awp'){const b=ease(p,.62,.72)-ease(p,.74,.84);o.bolt=b}else{const b=ease(p,.76,.84)-ease(p,.84,.92);o.bolt=b*.05}}
 return o}

function vmUpdate(dt){
 const id=P.inv[P.cur],scoped=zoom&&id=='awp';
 scopeEl.style.display=P.alive&&scoped?'block':'none';
 if(!P.alive||scoped){if(vm)vm.root.visible=false;if(!P.alive)vmId=null;return}
 if(id!==vmId){if(vm){vm.root.visible=false;vm.mz.remove(flash)}vm=getVM(id);vmId=id;vmDrawD=DRAW[id]||1;vmDrawT=vmDrawD;vm.mz.add(flash);vsw=0;if(typeof mech=='function')setTimeout(()=>mech('deploy',.8),120)}
 vm.root.visible=true;vmT+=dt;vmDrawT=Math.max(0,vmDrawT-dt);
 const w=WP[id],a=P.ammo[id],r=vm.root,pr=vm.parts,air=P.y>0,rt=P.relT||REL[id]||2.2;
 // HL V_CalcViewModel: weapon follows the view bob (up/down + a degree or so of tilt), no mouse lag in GoldSrc
 const bob=P.bob||0,bu=bob/U,d2r=Math.PI/180,dr=vmDrawT/vmDrawD,de=dr*dr;
 let rl=null,p=0;if(P.rel>0&&w.mag){p=1-P.rel/rt;rl=rlPose(vm.type,p)}
 const kk=KICK[id]||[0,0,10];vk=Math.max(0,vk-dt*kk[2]);
 const dn=rl?rl.dn:0;
 r.position.set(vm.vp[0]+(rl?-.02*dn:0),vm.vp[1]+bob-de*.32-dn*.11-(air?.012:0),vm.vp[2]-bob*.4+vk*kk[0]+dn*.03);
 r.rotation.set(vk*kk[1]-de*.85+dn*.12-bu*.3*d2r,-bu*.5*d2r+de*.25,-bu*d2r+dn*.5+de*.15);
 if(vm.type=='knife'){if(vsw>0){vsw=Math.max(0,vsw-dt*3.2);const s=1-vsw,e=Math.sin(Math.PI*s)*vsd;r.rotation.y+=(.9*vsd*(.5-s));r.rotation.x-=Math.sin(Math.PI*s)*.5;r.rotation.z+=e*.55;r.position.x-=(s-.5)*vsd*.22;r.position.z-=Math.sin(Math.PI*s)*.12}}
 // left arm: rests on the handguard (rifles) or only appears to feed the magazine (pistols)
 if(vm.lh){if(vm.hlr){vm.lh.visible=!!(rl&&rl.lv);vm.lh.position.set(0,rl?rl.ly:-.3,0)}else{vm.lh.visible=true;vm.lh.position.set(0,rl?rl.ly:0,rl?rl.lz:0)}}
 if(pr.mag){pr.mag.visible=rl?rl.mv:1;pr.mag.position.y=rl?rl.mag:0}
 if(pr.slide)pr.slide.position.z=rl&&rl.slide?rl.slide:(a&&a.m<=0&&!(P.rel>0))?.04:vk*.04;                       // slide locks back when empty
 if(pr.bolt){if(vm.type=='awp'){const q=1-P.cd/w.rof,cyc=P.cd>0&&P.cd<w.rof&&q>.12&&q<.9;let bz=0,br=0;
   if(cyc){const u=(q-.12)/.78;br=Math.sin(Math.PI*Math.min(1,u*2.2))*1.2*(u<.55?1:0)+(u>=.55?Math.max(0,1-(u-.55)/.2)*1.2:0);bz=.07*Math.sin(Math.PI*Math.min(1,Math.max(0,(u-.2)/.5)))}
   if(rl){bz=.07*rl.bolt;br=1.2*Math.min(1,rl.bolt*3)}
   pr.bolt.position.z=bz;pr.bolt.rotation.z=-br;
   if(cyc&&q>.35&&!vm.ejd){vm.ejd=1;ejectShell(id)}if(!cyc||q<.2)vm.ejd=0}
  else pr.bolt.position.z=rl?rl.bolt:vk*.02}
 // sound cues on the reload timeline
 if(rl){const cs=CUE[id]||[];cs.forEach((c,i)=>{if(p>=c[0]&&!(vm.cf>>i&1)){vm.cf|=1<<i;if(typeof mech=='function')mech(c[1])}})}else vm.cf=0;
 flashT-=dt;const fo=flashT>0&&flashS>0;flash.visible=fo;flashL.intensity=fo?1.6:0;flashW.intensity=fo?1.4:0;
 if(fo){flash.scale.setScalar(flashS*(.75+rnd()*.5));flash.material.rotation=rnd()*6.28;vm.mz.getWorldPosition(flashL.position);flashW.position.copy(cam.position).addScaledVector(dirOf(P),1.2)}}

function onShot(id){if(!vm)return;vk=1;flashT=.045;flashS=FLASH[id]||.1;if(flashS>0)flash.material.map=_ft[(rnd()*3)|0];
 if(id=='knife'){vsd=-vsd;vsw=1;return}
 if(id!='awp')ejectShell(id)}
function ejectShell(id){if(!vm)return;if(shells.length>40){const o=shells.shift();scene.remove(o.m)}
 const m=new T3.Mesh(_sg||(_sg=new T3.CylinderGeometry(.0042,.0042,1,8)),gmat('brass'));m.scale.set(1,vm.sh||.03,1);m.rotation.x=Math.PI/2;
 const p=V(0,0,0);vm.ej.getWorldPosition(p);cam.updateMatrixWorld();cam.localToWorld(p);m.position.copy(p);
 const rgt=V(Math.cos(P.yaw),0,-Math.sin(P.yaw)),fw=V(-Math.sin(P.yaw),0,-Math.cos(P.yaw)),v=rgt.multiplyScalar(1.7+rnd()*.9).add(fw.multiplyScalar(-.25+rnd()*.3)).add(V(P.vx||0,1.5+rnd()*.8,P.vz||0));
 m.rotation.set(rnd()*6,rnd()*6,rnd()*6);scene.add(m);shells.push({m,v,s:V(rnd()*30-15,rnd()*30-15,rnd()*30-15),t:0,b:0})}
function fxSprite(tx,x,y,z,sz,life,o){const s=new T3.Sprite(new T3.SpriteMaterial({map:tx,transparent:true,depthWrite:false,opacity:o.op==null?1:o.op}));s.position.set(x,y,z);s.scale.setScalar(sz);scene.add(s);fx.push(Object.assign({s,sz,life,t:0},o));return s}
// bullet impact: dust + sparks + a lingering bullet hole on walls, blood puffs on players
function impact(p,d,flesh){if(!_fxT)return;
 if(flesh){for(let i=0;i<4;i++)fxSprite(_fxT.blood,p.x,p.y,p.z,.12+rnd()*.12,.4,{v:V((rnd()-.5)*1.2-d.x*.5,rnd()*.9,(rnd()-.5)*1.2-d.z*.5),g:3,grow:2.2});return}
 const q=p.clone().addScaledVector(d,-.03);
 const holes=fx.filter(f=>f.hole);if(holes.length>36){const o=holes[0];scene.remove(o.s);fx.splice(fx.indexOf(o),1)}
 fxSprite(_fxT.hole,q.x,q.y,q.z,.11,25,{hole:1,fade:6});
 fxSprite(_fxT.smoke,q.x,q.y,q.z,.08,.5,{v:V(-d.x*.25,.15,-d.z*.25),grow:3.2,op:.55});
 for(let i=0;i<3;i++)fxSprite(_fxT.spark,q.x,q.y,q.z,.04,.18,{v:V((rnd()-.5)*2.6-d.x*1.2,rnd()*1.6,(rnd()-.5)*2.6-d.z*1.2),g:6,add:1})}
function shellsUpdate(dt){
 for(let i=shells.length-1;i>=0;i--){const o=shells[i];o.v.y-=9.8*dt;o.m.position.addScaledVector(o.v,dt);o.m.rotation.x+=o.s.x*dt;o.m.rotation.z+=o.s.z*dt;
  if(o.m.position.y<.012){o.m.position.y=.012;if(!o.b){o.b=1;if(typeof mech=='function')mech('shell',.4/(1+Math.hypot(o.m.position.x-P.x,o.m.position.z-P.z)*.5))}o.v.y=Math.abs(o.v.y)*.3;o.v.x*=.5;o.v.z*=.5;o.s.multiplyScalar(.5)}
  o.t+=dt;if(o.t>1.6){scene.remove(o.m);shells.splice(i,1)}}
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;if(f.v){f.s.position.addScaledVector(f.v,dt);if(f.g)f.v.y-=f.g*dt}
  if(f.grow)f.s.scale.setScalar(f.sz*(1+f.grow*f.t/f.life));
  const u=f.t/f.life;if(f.hole){f.s.material.opacity=f.t>f.life-f.fade?(f.life-f.t)/f.fade:1}else f.s.material.opacity=(f.op==null?1:f.op)*(1-u);
  if(f.t>=f.life){scene.remove(f.s);fx.splice(i,1)}}}
function renderAll(){ren.autoClear=true;ren.render(scene,cam);
 if(vm&&vm.root.visible){if(vmCam.aspect!==cam.aspect){vmCam.aspect=cam.aspect;vmCam.updateProjectionMatrix()}ren.autoClear=false;ren.clearDepth();ren.render(vmScene,vmCam);ren.autoClear=true}}

// ---------- third-person: bots carry the same models ----------
function botGunTick(u,dt){const id=u.inv[u.cur];if(!id)return;
 if(u.gid!==id){if(u.gm)u.body.torso.remove(u.gm);u.gm=GUNS[id]().g;u.gid=id;u.body.torso.add(u.gm)}
 const t=u.aimT||0;u.gm.position.set(.3-.18*t,.33+.13*t,-.1-.2*t);u.gm.rotation.set(-.9*(1-t),(1-t)*.15,0)}

// ---------- recoil + accuracy (view punch like GoldSrc: the camera and the bullet both follow the punch angle) ----------
// [pitch punch deg per shot, yaw swing deg, cap deg] - AK pulls up then snakes left/right, pistols recover fast
const RC={ak:[1.6,1.1,9],m4:[1.0,.7,6.5],awp:[3.4,.3,7],usp:[1.3,.25,4],glock:[1.1,.3,3.6],deagle:[3.2,.5,6]};
function recoilKick(id,n){const c=RC[id];if(!c)return;const d2r=Math.PI/180,first=n==0?.75:1,s=Math.sin(n*.62)*Math.min(1,n/7)*c[1]+(rnd()-.5)*.25*c[1];
 P.pun=Math.min(c[2]*d2r,(P.pun||0)+c[0]*first*d2r*(.9+rnd()*.2));P.pyaw=(P.pyaw||0)+s*d2r*.6}
// accuracy cone (tangent): first shot is exact when standing still, running / jumping / spraying open it up
const ACC={ak:[.003,.065,.11,.0035],m4:[.003,.055,.1,.0028],awp:[.0008,.14,.2,0],usp:[.003,.045,.09,.006],glock:[.004,.05,.09,.006],deagle:[.004,.07,.12,.014]};
function spreadOf(u,id){const c=ACC[id];if(!c)return 0;const mv=Math.max(0,Math.min(1,((u.vel||0)-.3)/5.5)),air=u.y>0?1:0,duck=u.cr?.7:1;
 if(id=='awp'){if(!zoom)return .08+mv*.06+air*.1;return(c[0]+mv*c[1]+air*c[2])}
 return(c[0]+mv*c[1]*duck+air*c[2]+Math.min(u.burst||0,10)*c[3])*(u.cr&&!mv?.75:1)}
function aimDir(u){return dirOf({yaw:u.yaw+(u.pyaw||0),pitch:u.pitch+(u.pun||0)})}
function onSwitch(){const id=P.inv[P.cur];P.cd=Math.max(P.cd,DRAW[id]||1);P.rel=0;zoom=0;P.burst=0}   // weapon can't fire while it's being drawn

// ---------- sounds: layered noise bursts + sine thumps, all synthesized ----------
let _nb;const noise=()=>{if(!_nb){ac=ac||new AudioContext();_nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=_nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return _nb};
// layer: ['n', delay, dur, filterType, freq, q, gain]  noise burst   |   ['o', delay, dur, f0, f1, wave, gain]  pitch-dropping oscillator
function play(layers,vol,rate=1,dst){const t0=ac.currentTime;for(const L of layers){const t=t0+L[1],d=L[2];const g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(L[0]=='n'?L[6]*vol:L[6]*vol,t+.002);g.gain.exponentialRampToValueAtTime(.0008,t+d);g.connect(dst||ac.destination);
  if(L[0]=='n'){const s=ac.createBufferSource(),f=ac.createBiquadFilter();s.buffer=noise();s.playbackRate.value=rate;f.type=L[3];f.frequency.value=L[4]*rate;f.Q.value=L[5];s.connect(f).connect(g);s.start(t,Math.random()*.4);s.stop(t+d+.02)}
  else{const o=ac.createOscillator();o.type=L[5];o.frequency.setValueAtTime(L[3]*rate,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,L[4]*rate),t+d);o.connect(g);o.start(t);o.stop(t+d+.02)}}}
const SND={
 ak:[['n',0,.03,'bandpass',2800,.9,1],['n',0,.16,'lowpass',950,.5,.9],['o',0,.14,170,45,'sine',1],['n',.02,.38,'lowpass',520,.4,.22]],
 m4:[['n',0,.05,'bandpass',4300,1.2,.5],['n',0,.09,'lowpass',1300,.6,.32],['o',0,.08,125,60,'sine',.5],['n',0,.012,'highpass',6500,.5,.35]],
 usp:[['n',0,.045,'bandpass',3900,1.4,.42],['n',0,.07,'lowpass',1600,.6,.2],['o',0,.06,150,70,'sine',.35]],
 glock:[['n',0,.03,'bandpass',3100,.9,.9],['n',0,.1,'lowpass',1150,.5,.6],['o',0,.09,200,60,'sine',.6],['n',.015,.22,'lowpass',700,.4,.15]],
 deagle:[['n',0,.04,'bandpass',2000,.8,1],['n',0,.22,'lowpass',720,.5,1],['o',0,.25,115,35,'sine',1.2],['n',.03,.5,'lowpass',400,.4,.35]],
 awp:[['n',0,.05,'bandpass',1700,.7,1],['n',0,.35,'lowpass',520,.5,1.1],['o',0,.45,95,28,'sine',1.4],['n',.05,.9,'lowpass',300,.4,.4]]};
const MECH={
 clipout:[['n',0,.03,'bandpass',2200,3,.5],['o',0,.05,430,300,'square',.1],['n',.045,.03,'highpass',4200,1,.18]],
 clipin:[['o',0,.06,210,110,'sine',.5],['n',0,.03,'bandpass',1800,2.5,.6],['n',.06,.025,'bandpass',3500,3,.4]],
 bolt:[['n',0,.04,'bandpass',1500,2,.6],['n',.075,.05,'bandpass',2600,2.5,.5],['o',.075,.04,320,200,'square',.07]],
 slide:[['n',0,.09,'bandpass',2100,1.5,.4],['n',.1,.035,'bandpass',3100,3,.5]],
 deploy:[['n',0,.07,'bandpass',1800,2,.45],['n',.2,.03,'bandpass',3300,3,.4]],
 empty:[['n',0,.015,'bandpass',3500,4,.5],['o',0,.02,800,500,'square',.09]],
 shell:[['o',0,.12,5200,4300,'sine',.12],['o',.02,.1,7100,6000,'sine',.07]],
 step:[['n',0,.075,'lowpass',520,.7,.55],['o',0,.05,95,50,'sine',.3]],
 jump:[['n',0,.06,'lowpass',650,.6,.35],['o',0,.05,110,60,'sine',.2]],
 land:[['n',0,.1,'lowpass',420,.7,.7],['o',0,.09,85,40,'sine',.5]],
 knifeair:[['n',0,.16,'bandpass',2400,.9,.22],['n',.03,.12,'highpass',5000,.5,.12]],
 knifehit:[['n',0,.07,'lowpass',900,.7,.8],['o',0,.07,160,70,'sine',.5]],
 knifewall:[['n',0,.04,'bandpass',4200,4,.7],['o',0,.12,3100,2600,'sine',.1]]};
function gunSnd(id,dist=0){try{ac=ac||new AudioContext();const L=SND[id];if(!L)return;play(L,.55/(1+dist*.06),dist>25?.85:1)}catch(e){}}
function mech(k,v=1){try{ac=ac||new AudioContext();const L=MECH[k];if(L)play(L,v*.8,k=='step'?.85+Math.random()*.35:1)}catch(e){}}
function knifeSnd(kind){mech(kind)}
function clickSnd(){mech('empty')}
