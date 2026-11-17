/* js/input.js - keyboard / mouse input */
onkeydown=e=>{if(state!='play')return;const k=e.code;keys[k]=1;if(k=='KeyR')reload(P);if(k=='KeyB')toggleBuy();if(k=='Tab'){e.preventDefault();$('sb').style.display='block'}
 if(k=='Space')e.preventDefault();if(/^Digit[0-9]$/.test(k)){const n=+k[5];if(buyOpen)buyKey(n);else if(P.inv[n]&&n<4&&n!=P.cur){P.last=P.cur;P.cur=n;onSwitch()}}
 if(k=='KeyQ'&&P.last&&P.inv[P.last]&&!buyOpen){const t=P.cur;P.cur=P.last;P.last=t;onSwitch()}};
onkeyup=e=>{keys[e.code]=0;if(e.code=='Tab')$('sb').style.display='none'};
onmousedown=e=>{if(state!='play'||!locked)return;if(e.button==0){md=1;clk=1}else if(e.button==2&&P.inv[P.cur]=='awp'&&P.rel<=0)zoom=(zoom+1)%3};
onmouseup=e=>{if(e.button==0){md=0;clk=0}};oncontextmenu=e=>e.preventDefault();
onmousemove=e=>{if(state!='play'||!locked||!P.alive)return;const s=.0022*cfg.sens*[1,.42,.13][zoom||0];P.yaw-=e.movementX*s;P.pitch=Math.max(-1.5,Math.min(1.5,P.pitch-e.movementY*s))};
document.onpointerlockchange=()=>{locked=document.pointerLockElement===$('c');$('pause').style.display=state=='play'&&!locked?'flex':'none';if(!locked){md=0;keys={}}};
$('pause').onclick=()=>$('c').requestPointerLock();$('dc').onclick=e=>{e.stopPropagation();exitGame()};

onwheel=e=>{if(state=='play'&&locked){e.preventDefault();wheelJump()}};
