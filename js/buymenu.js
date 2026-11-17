/* js/buymenu.js - CS 1.6-style buy menu (player: B key, bots: botBuy at round start) */
// soon:1 = shown greyed out until that gun is implemented
const BUY={
 1:{n:'Handgun',i:[{id:'deagle',n:'Desert Eagle .50AE',cost:650},{n:'P228 Compact',cost:600,soon:1},{n:'Dual Elites',cost:800,soon:1}]},
 2:{n:'Shotgun',i:[{n:'Benelli M3 Super90',cost:1700,soon:1},{n:'Benelli XM1014',cost:3000,soon:1}]},
 3:{n:'Sub-Machine Gun',i:[{n:'MP5 Navy',cost:1500,soon:1},{n:'FN P90',cost:2350,soon:1}]},
 4:{n:'Rifle',i:[{id:'ak',n:'AK-47',cost:2500,team:'T'},{id:'m4',n:'Colt M4A1',cost:3100,team:'CT'},{id:'awp',n:'AWP Magnum Sniper',cost:4750},{n:'Scout',cost:2750,soon:1}]},
 5:{n:'Machine Gun',i:[{n:'FN M249 Para',cost:5750,soon:1}]},
 6:{n:'Primary Ammo ($60)',act:()=>buyAmmo(1,60)},
 7:{n:'Secondary Ammo ($50)',act:()=>buyAmmo(2,50)},
 8:{n:'Equipment',i:[{kind:'armor',n:'Kevlar Vest',cost:650},{kind:'helm',n:'Kevlar + Helmet',cost:1000},{kind:'kit',n:'Defuse Kit',cost:200,team:'CT'}]}};
let buyCat=0;
const canBuy=()=>P.alive&&(phase=='freeze'||(phase=='live'&&cfg.rt-pt<20&&!bomb.planted));

// shared by player and bots; returns true if the purchase went through
function purchase(u,it,ui){
 if(it.soon||(it.team&&it.team!=u.team))return false;
 let c=it.cost;if(it.kind=='helm'&&u.armor>0)c=350;
 if((it.kind=='armor'&&u.armor>=100)||(it.kind=='helm'&&u.armor>=100&&u.helmet)||(it.kind=='kit'&&(u.kit||u.team!='CT')))return false;
 if(u.money<c){if(ui)toast('Not enough money',1.5);return false}
 u.money-=c;
 if(it.kind=='armor')u.armor=100;else if(it.kind=='helm'){u.armor=100;u.helmet=1}else if(it.kind=='kit')u.kit=1;
 else{give(u,it.id);if(ui)u.cur=WP[it.id].slot}
 return true}
function buyAmmo(slot,c){const id=P.inv[slot],w=id&&WP[id];if(!w||!w.mag)return toast('Nothing to refill',1.5);
 if(P.money<c)return toast('Not enough money',1.5);P.money-=c;P.ammo[id].r=w.res;renderBuy()}

function botBuy(u){const rif=u.team=='T'?'ak':'m4',R=BUY[4].i,E=BUY[8].i;
 if(!u.inv[1]){
  if(cfg.skill==2&&u.money>=5400&&rnd()<.25)purchase(u,R[2]);
  else if(u.money>=WP[rif].cost+1000||(u.money>=WP[rif].cost&&rnd()<.5))purchase(u,R.find(x=>x.id==rif));
  else if(u.money>=650&&rnd()<.4)purchase(u,BUY[1].i[0])}
 if(u.money>=1000)purchase(u,E[1]);else if(u.money>=650&&u.armor<50)purchase(u,E[0]);
 if(u.team=='CT'&&rnd()<.5)purchase(u,E[2])}

function renderBuy(){
 const row=(k,n,cost,off)=>`<div class="it${off?' off':''}"><b>${k}</b>${n}${cost!=null?`<span>$${cost}</span>`:''}</div>`;
 let r;
 if(!buyCat)r=Object.keys(BUY).map(k=>row(k,BUY[k].n));
 else r=BUY[buyCat].i.map((it,j)=>row(j+1,it.n,it.cost,it.soon||(it.team&&it.team!=P.team)));
 $('buy').innerHTML=`<h4>${buyCat?BUY[buyCat].n:'Buy'} · $${P.money}</h4><div class="b">${r.join('')}${row(0,buyCat?'Back':'Exit')}</div>`}
function toggleBuy(){buyCat=0;buyOpen=canBuy()&&!buyOpen;$('buy').style.display=buyOpen?'block':'none';if(buyOpen)renderBuy()}
function buyKey(n){
 if(n==0){if(buyCat){buyCat=0;renderBuy()}else toggleBuy();return}
 if(!buyCat){const c=BUY[n];if(!c)return;if(c.act)c.act();else buyCat=n;renderBuy();return}
 const it=BUY[buyCat].i[n-1];if(it&&purchase(P,it,1)){buyCat=0;renderBuy()}}
