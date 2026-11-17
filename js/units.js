/* js/units.js - unit creation + loadouts */
function mk(team,bot,name){const body=buildBody(team),g=body.g;if(bot)scene.add(g);
 const u={team,bot,name,g,body,x:0,y:0,z:0,yaw:0,pitch:0,hp:100,armor:0,helmet:0,kit:0,alive:true,money:cfg.money,k:0,d:0,inv:{},ammo:{},cur:2,cd:0,rel:0,vy:0,
  tgt:null,wp:[],react:0,seeT:0,sd:1,st:0,burst:0,vel:0,died:0,pl:0,ph:0,px:0,pz:0};
 loadout(u);units.push(u);return u}
function loadout(u){u.inv={1:null,2:null,3:null};u.ammo={};u.armor=0;u.helmet=0;u.kit=0;give(u,u.team=='T'?'glock':'usp');give(u,'knife');u.cur=2}
function give(u,id){const w=WP[id];u.inv[w.slot]=id;u.ammo[id]={m:w.mag||0,r:u.bot?999:(w.res||0)}}
