/* js/world.js - map geometry + scene setup */
function box(cx,cz,w,d,h,col){const m=new T3.Mesh(new T3.BoxGeometry(w,h,d),new T3.MeshLambertMaterial({color:col}));m.position.set(cx,h/2,cz);scene.add(m);walls.push({x0:cx-w/2,x1:cx+w/2,z0:cz-d/2,z1:cz+d/2,y0:0,y1:h})}
function init(){if(ren)return;
 ren=new T3.WebGLRenderer({canvas:$('c'),antialias:true});ren.setPixelRatio(Math.min(devicePixelRatio,1.5));
 scene=new T3.Scene();scene.background=new T3.Color(0x8fb6e6);scene.fog=new T3.Fog(0xaec6e0,50,150);
 cam=new T3.PerspectiveCamera(75,1,.1,300);cam.rotation.order='YXZ';scene.add(cam);
 scene.add(new T3.HemisphereLight(0xffffff,0xb89a66,.95));const sn=new T3.DirectionalLight(0xfff1d6,.6);sn.position.set(30,60,20);scene.add(sn);
 const gr=new T3.Mesh(new T3.PlaneGeometry(104,104),new T3.MeshLambertMaterial({color:0xc8a56a}));gr.rotation.x=-Math.PI/2;scene.add(gr);
 const S=0xd2b682,C=0xa8803f;box(0,-51,104,2,8,S);box(0,51,104,2,8,S);box(-51,0,2,104,8,S);box(51,0,2,104,8,S);
 box(-15,5,4,30,6,S);box(15,5,4,30,6,S);box(-30,-10,20,3,6,S);box(30,-10,20,3,6,S);
 [[0,0,6,6],[36,-36,6,6],[-36,-36,6,6],[22,-14,3,3],[-22,-14,3,3],[40,20,5,5],[-40,20,5,5],[0,22,8,2]].forEach(a=>box(a[0],a[1],a[2],a[3],3,C));
 [[30,'A'],[-30,'B']].forEach(([x,l])=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');g.fillStyle='rgba(180,40,30,.35)';g.fillRect(0,0,128,128);g.fillStyle='#fff';g.font='bold 90px Arial';g.textAlign='center';g.fillText(l,64,98);
  const p=new T3.Mesh(new T3.PlaneGeometry(16,16),new T3.MeshBasicMaterial({map:new T3.CanvasTexture(cv),transparent:true}));p.rotation.x=-Math.PI/2;p.position.set(x,.03,-30);scene.add(p)});
 bombM=new T3.Mesh(new T3.BoxGeometry(.5,.3,.3),new T3.MeshBasicMaterial({color:0xff2200}));bombM.visible=false;scene.add(bombM);
 gun=new T3.Mesh(new T3.BoxGeometry(.08,.12,.7),new T3.MeshLambertMaterial({color:0x222222}));gun.position.set(.28,-.26,-.55);cam.add(gun);
 onresize=()=>{ren.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};onresize();requestAnimationFrame(loop)}
