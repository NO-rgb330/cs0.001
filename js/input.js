/* js/input.js - keyboard / mouse input */
onkeydown=e=>{if(state!='play')return;const k=e.code;keys[k]=1;if(k=='KeyR')reload(P);if(k=='KeyB')toggleBuy();if(k=='Tab'){e.preventDefault();$('sb').style.display='block'}
 if(k=='Space')e.preventDefault();if(/^Digit[0-9]$/.test(k)){const n=+k[5];if(buyOpen)buyKey(n);else if(P.inv[n]&&n<4){P.cur=n;zoom=0}}};
onkeyup=e=>{keys[e.code]=0;if(e.code=='Tab')$('sb').style.display='none'};
onmousedown=e=>{if(state!='play'||!locked)return;if(e.button==0){md=1;clk=1}else if(e.button==2&&P.inv[P.cur]=='awp')zoom=!zoom};
onmouseup=e=>{if(e.button==0){md=0;clk=0}};oncontextmenu=e=>e.preventDefault();
onmousemove=e=>{if(state!='play'||!locked||!P.alive)return;const s=.0022*cfg.sens*(zoom?.4:1);P.yaw-=e.movementX*s;P.pitch=Math.max(-1.5,Math.min(1.5,P.pitch-e.movementY*s))};
document.onpointerlockchange=()=>{locked=document.pointerLockElement===$('c');$('pause').style.display=state=='play'&&!locked?'flex':'none';if(!locked){md=0;keys={}}};
$('pause').onclick=()=>$('c').requestPointerLock();$('dc').onclick=e=>{e.stopPropagation();exitGame()};
