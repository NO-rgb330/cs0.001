/* js/config.js - constants, weapon data, shared state, bot routes */
const T3=THREE,$=i=>document.getElementById(i),rnd=Math.random,V=(x,y,z)=>new T3.Vector3(x,y,z);
const WP={usp:{n:'USP',dmg:34,rof:.17,mag:12,res:36,sp:.01,rc:.012,slot:2},glock:{n:'Glock-18',dmg:28,rof:.15,mag:20,res:60,sp:.012,rc:.01,slot:2},
deagle:{n:'Desert Eagle',cost:650,dmg:55,rof:.4,mag:7,res:35,sp:.008,rc:.03,slot:2},m4:{n:'M4A1',cost:3100,dmg:33,rof:.09,mag:30,res:90,sp:.012,rc:.008,auto:1,slot:1},
ak:{n:'AK-47',cost:2500,dmg:36,rof:.1,mag:30,res:90,sp:.014,rc:.011,auto:1,slot:1},awp:{n:'AWP',cost:4750,dmg:115,rof:1.4,mag:10,res:30,sp:.002,rc:.04,slot:1},knife:{n:'Knife',dmg:40,rof:.5,melee:1,slot:3}};
const cfg={skill:1,win:8,rt:115,money:800,name:'Player',xh:'#00ff00',sens:1};
let ren,scene,cam,gun,bombM,units=[],walls=[],tr=[],P,state='menu',phase='freeze',pt=0,sc={CT:0,T:0},round=0,bomb={},keys={},locked=0,md=0,clk=0,zoom=0,site='A',buyOpen=0,feed=[],mt=0,over=0,last=0,kick=0;
const RT={E:[[30,36],[45,30],[45,-5],[45,-20],[32,-30],[28,-28]],M:[[8,30],[8,-18],[28,-24],[28,-28]]};
const HOLD=[[26,-22],[-26,-22],[0,-20],[-24,-30]],NAMES=['Rex','Viper','Ghost','Hawk','Wolf','Cobra','Frost','Titan','Blaze'];
function route(s,k){const r=RT[k].map(p=>[p[0]+(rnd()-.5)*2,p[1]+(rnd()-.5)*2]);return s=='A'?r:r.map(p=>[-p[0],p[1]])}
