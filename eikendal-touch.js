/* ================= Playing on a phone or tablet =================
   On a touch screen the game gets its own controls:
   - a joystick at the bottom left to walk (push it all the way out to run, or to gallop on a horse);
   - swipe anywhere else to look around, pinch with two fingers to move the camera closer or further;
   - buttons at the bottom right: attack, jump, block, dodge, use (F) and eat; while flying on Vonk, climb and descend;
   - a bar at the top for the map, backpack, gear, quests, building, the menu and more (camera, chat, save, ...);
   - tap the hotbar to use an item, and tap the prompt ("F ...") to do what it says.
   The buttons press the same keys as a keyboard, so everything in the game works the same way. A real keyboard or
   mouse turns the touch controls off again; touching the screen turns them back on. */
(function(){
const TC={on:false,keys:new Set(),stick:null,look:new Map(),pinch:0};WD.touch=TC;
const css=`
#tc{position:fixed;inset:0;z-index:4;pointer-events:none;display:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
body.touch.playing #tc{display:block}
#tc-look{position:absolute;inset:0;pointer-events:auto;touch-action:none}
#tc-stickz{position:absolute;left:0;bottom:0;width:40%;height:62%;pointer-events:auto;touch-action:none;z-index:16}
#tc-base{position:absolute;width:124px;height:124px;margin:-62px;border-radius:50%;border:2px solid rgba(232,216,176,.45);background:radial-gradient(rgba(27,20,12,.25),rgba(27,20,12,.55));display:none}
#tc-knob{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#f4e6c0,#b39a62);box-shadow:0 2px 8px rgba(0,0,0,.6)}
#tc-ghost{position:absolute;left:calc(84px + env(safe-area-inset-left,0px));bottom:84px;width:96px;height:96px;margin:-48px;border-radius:50%;border:2px dashed rgba(232,216,176,.35);pointer-events:none}
.tcb{position:absolute;z-index:16;pointer-events:auto;touch-action:none;border-radius:50%;border:2px solid rgba(224,176,74,.75);background:radial-gradient(circle at 45% 35%,rgba(74,66,52,.92),rgba(27,20,12,.92));color:#f4e6c0;display:grid;place-items:center;font:600 22px/1 sans-serif;box-shadow:0 3px 10px rgba(0,0,0,.55);text-shadow:0 1px 2px #000}
.tcb small{position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);font:600 10px sans-serif;color:#e8d8b0;white-space:nowrap;text-shadow:0 1px 2px #000}
.tcb.on{background:radial-gradient(circle at 45% 35%,#d8b25a,#7c5a1a);color:#fff}
.tcb.big{border-width:3px;font-size:32px}
.tcb.cd{opacity:.45}
#tc-top{position:absolute;left:calc(50% + 24px);top:calc(40px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:flex;gap:5px;pointer-events:auto;z-index:16}
#tc-top button,#tc-more button{min-width:44px;height:40px;padding:0 5px;border-radius:8px;border:1px solid #8a7648;background:rgba(27,20,12,.88);color:#f4e6c0;font:600 19px/1 sans-serif;touch-action:manipulation}
#tc-top button span,#tc-more button span{display:block;font:600 9px sans-serif;color:#cdbb92;margin-top:1px}
#tc-more{position:absolute;left:calc(50% + 24px);top:calc(88px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:none;grid-template-columns:repeat(4,auto);gap:5px;padding:6px;border-radius:8px;background:rgba(18,14,8,.92);border:1px solid #6b5b3a;pointer-events:auto;z-index:17}
#tc-more.open{display:grid}
#tc-more button{font-size:17px;min-width:64px;height:46px}
#tc-close{position:fixed;right:calc(6px + env(safe-area-inset-right,0px));top:calc(6px + env(safe-area-inset-top,0px));z-index:40;width:46px;height:46px;border-radius:50%;border:2px solid #e0b04a;background:rgba(27,20,12,.95);color:#f4e6c0;font:700 22px sans-serif;display:none;touch-action:manipulation}
#tc-skip{position:fixed;right:calc(16px + env(safe-area-inset-right,0px));bottom:20px;z-index:60;padding:10px 18px;border-radius:22px;border:2px solid #e0b04a;background:rgba(27,20,12,.9);color:#f4e6c0;font:600 16px sans-serif;display:none;touch-action:manipulation}
#tc-turn{position:fixed;left:50%;top:calc(92px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:15;padding:6px 12px;border-radius:6px;background:rgba(27,20,12,.88);border:1px solid #6b5b3a;color:#e8d8b0;font:13px sans-serif;display:none;pointer-events:none;white-space:nowrap}
body.touch{touch-action:none;overscroll-behavior:none}
body.touch #qbar{display:none!important}
body.touch #stats{transform:scale(.78);transform-origin:top left}
body.touch #minic{width:108px;height:108px}body.touch #mini{width:108px;height:108px}
body.touch #quest{top:calc(128px + env(safe-area-inset-top,0px));width:190px;font-size:12px;transform:scale(.9);transform-origin:top right}
body.touch #log{bottom:auto;top:calc(150px + env(safe-area-inset-top,0px));width:230px;font-size:12px}
body.touch #hotbar{pointer-events:auto;bottom:6px;transform:translateX(-50%) scale(.82);transform-origin:bottom center;z-index:16}
body.touch #prompt{pointer-events:auto;bottom:62px;font-size:16px;padding:8px 16px;z-index:16}
body.touch .modal{max-height:calc(100vh - 12px)}
body.touch #start{overflow:auto;align-items:start}
@media(max-height:520px){body.touch #quest{display:none}body.touch #log{top:calc(100px + env(safe-area-inset-top,0px))}}
body.cine #tc{display:none!important}
@media(max-height:520px){#cust{padding:4px}#cust .box{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:8px 12px}#cust .cwrap{flex:none;min-height:auto}#cust .cright{min-height:auto}#cust #cctl{overflow:visible;flex:none}#cust .cpv{max-height:320px;position:sticky;top:0}#cust .box h2{font-size:22px}
  .modal{touch-action:pan-y}#title .tb h1{font-size:44px!important}#title .tbtn{margin:6px auto!important;padding:8px 30px!important}#title{overflow:auto!important}}
`;
const st=document.createElement('style');st.textContent=css;document.body.appendChild(st);
const root=document.createElement('div');root.id='tc';root.innerHTML='<div id="tc-look"></div><div id="tc-stickz"><div id="tc-ghost"></div><div id="tc-base"><div id="tc-knob"></div></div></div><div id="tc-top"></div><div id="tc-more"></div>';
document.body.appendChild(root);
const closeB=document.createElement('button');closeB.id='tc-close';closeB.textContent='✕';document.body.appendChild(closeB);
const skipB=document.createElement('button');skipB.id='tc-skip';skipB.textContent='Overslaan ⏭';document.body.appendChild(skipB);
const turn=document.createElement('div');turn.id='tc-turn';turn.textContent='Draai je gsm een kwartslag voor een groter beeld';document.body.appendChild(turn);
const $t=id=>document.getElementById(id);

/* ---------- keys ---------- */
const KEYNAME={Space:' ',Escape:'Escape',ShiftLeft:'Shift'};
function keyEv(type,code){const key=KEYNAME[code]||(code.startsWith('Key')?code.slice(3).toLowerCase():code.startsWith('Digit')?code.slice(5):code);
  try{window.dispatchEvent(new KeyboardEvent(type,{code,key,bubbles:true,cancelable:true}))}catch(e){}}
const tap=code=>{keyEv('keydown',code);keyEv('keyup',code)};
function hold(code,on){if(on){if(TC.keys.has(code))return;TC.keys.add(code);KEYS[code]=true}else{if(!TC.keys.has(code))return;TC.keys.delete(code);KEYS[code]=false}}
function releaseAll(){for(const c of[...TC.keys])hold(c,false);if(TC.blk){TC.blk=false;PL.blocking=false}}
const flying=()=>!!(PL.mounted&&PL.mounted.flyM);
const free=()=>started&&!PL.dead&&!anyModal()&&!(window.CIN&&CIN.on);

/* ---------- looking around and pinching ---------- */
const look=$t('tc-look');
look.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;e.preventDefault();try{look.setPointerCapture(e.pointerId)}catch(_){}TC.look.set(e.pointerId,{x:e.clientX,y:e.clientY});if(TC.look.size===2)TC.pinch=pinchD()});
look.addEventListener('pointermove',e=>{const p=TC.look.get(e.pointerId);if(!p)return;e.preventDefault();
  if(TC.look.size>=2){p.x=e.clientX;p.y=e.clientY;const d=pinchD();if(TC.pinch)PL.camDist=clamp(PL.camDist-(d-TC.pinch)*.025,2.2,10);TC.pinch=d;return}
  const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(free()){mouse.dx+=dx*2.3;mouse.dy+=dy*2.0}});
const endLook=e=>{TC.look.delete(e.pointerId);TC.pinch=TC.look.size>=2?pinchD():0};
look.addEventListener('pointerup',endLook);look.addEventListener('pointercancel',endLook);
function pinchD(){const p=[...TC.look.values()];return p.length<2?0:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}

/* ---------- the joystick ---------- */
const zone=$t('tc-stickz'),base=$t('tc-base'),knob=$t('tc-knob'),ghost=$t('tc-ghost'),R=52;
zone.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||TC.stick)return;e.preventDefault();try{zone.setPointerCapture(e.pointerId)}catch(_){}
  const r=zone.getBoundingClientRect();TC.stick={id:e.pointerId,ox:e.clientX,oy:e.clientY,vx:0,vy:0};base.style.left=(e.clientX-r.left)+'px';base.style.top=(e.clientY-r.top)+'px';base.style.display='block';ghost.style.display='none';knob.style.transform=''});
zone.addEventListener('pointermove',e=>{const S=TC.stick;if(!S||S.id!==e.pointerId)return;e.preventDefault();let dx=e.clientX-S.ox,dy=e.clientY-S.oy;const l=Math.hypot(dx,dy);
  if(l>R){dx*=R/l;dy*=R/l}S.vx=dx/R;S.vy=dy/R;knob.style.transform='translate('+dx+'px,'+dy+'px)'});
const endStick=e=>{const S=TC.stick;if(!S||S.id!==e.pointerId)return;TC.stick=null;base.style.display='none';ghost.style.display='';for(const c of['KeyW','KeyA','KeyS','KeyD'])hold(c,false);if(!TC.down)hold('ShiftLeft',false)};
zone.addEventListener('pointerup',endStick);zone.addEventListener('pointercancel',endStick);
function stickKeys(){const S=TC.stick;if(!S)return;const ok=free(),t=.38,m=Math.hypot(S.vx,S.vy);
  hold('KeyW',ok&&S.vy<-t);hold('KeyS',ok&&S.vy>t);hold('KeyD',ok&&S.vx>t);hold('KeyA',ok&&S.vx<-t);
  if(!flying()&&!TC.down)hold('ShiftLeft',ok&&m>.94)}

/* ---------- buttons ---------- */
const BTN={};
function button(id,ico,label,pos,size,down,up,cls){const b=document.createElement('div');b.className='tcb'+(cls?' '+cls:'');b.innerHTML=ico+(label?'<small>'+label+'</small>':'');
  b.style.cssText+='width:'+size+'px;height:'+size+'px;right:calc('+pos[0]+'px + env(safe-area-inset-right,0px));bottom:'+pos[1]+'px';
  b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add('on');if(down)down()});
  const u=e=>{b.classList.remove('on');if(up)up()};b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u);
  root.appendChild(b);BTN[id]=b;return b}
button('atk','⚔','Aanval',[20,24],80,()=>{if(free())startAttack()},()=>{try{releaseBow()}catch(e){}},'big');
button('jump','⤒','Spring',[114,14],62,()=>hold('Space',true),()=>hold('Space',false));
button('dodge','↯','Ontwijk',[26,124],54,()=>{if(free())tap('KeyX')});
button('block','🛡','Blok',[106,100],54,()=>{if(free()){TC.blk=true;PL.blocking=true}},()=>{TC.blk=false;PL.blocking=false});
button('use','✋','Gebruik',[186,66],56,()=>{if(free())interact()});
button('heal','🍖','Eten',[34,188],46,()=>{if(free())tap('KeyQ')});
button('down','⤓','Dalen',[186,4],56,()=>{TC.down=true;hold('ShiftLeft',true)},()=>{TC.down=false;hold('ShiftLeft',false)});
button('pw','✦','Kracht',[104,176],50,()=>{if(free())tap('KeyR')});
button('pw7','①','',[160,206],40,()=>{if(free())tap('Digit7')});
button('pw8','②','',[206,190],40,()=>{if(free())tap('Digit8')});
button('pw9','③','',[244,156],40,()=>{if(free())tap('Digit9')});
button('storm','⚡','Sprong',[180,134],46,()=>{if(free())tap('KeyL')});

/* ---------- the top bar and the "more" panel ---------- */
const top=$t('tc-top'),more=$t('tc-more');
function bar(el,items){for(const [ico,lab,fn] of items){const b=document.createElement('button');b.innerHTML=ico+'<span>'+lab+'</span>';
  b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fn()});el.appendChild(b)}}
const gear=()=>toggleModal('inv',()=>{invTab='gear';renderInv()});
bar(top,[['🗺','Kaart',()=>tap('KeyM')],['🎒','Rugzak',()=>tap('KeyI')],['🛡','Uitrusting',gear],['☰','Menu',()=>tap('KeyH')],['⋯','Meer',()=>more.classList.toggle('open')]]);
bar(more,[['📜','Taken',()=>tap('KeyJ')],['🔨','Bouwen',()=>tap('KeyB')],['🎥','Camera',()=>tap('KeyV')],['💬','Chat',()=>tap('KeyT')],['👥','Spelers',()=>tap('KeyO')],['💾','Opslaan',()=>tap('KeyP')],
  ['🔄','Draaien',()=>tap('KeyR')],['✖','Stop bouw',()=>tap('KeyN')],['🧺','Laat vallen',()=>tap('KeyK')],['🎭','Uiterlijk',()=>tap('KeyC')],
  ['⛶','Volledig',fullscreen]]);
more.addEventListener('click',()=>setTimeout(()=>more.classList.remove('open'),60));
function fullscreen(){const d=document.documentElement;try{if(document.fullscreenElement||document.webkitFullscreenElement){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else{const f=d.requestFullscreen||d.webkitRequestFullscreen;if(f){const p=f.call(d);if(p&&p.catch)p.catch(()=>addLog('Volledig scherm mag hier niet.'))}else addLog('Volledig scherm werkt niet in deze browser.')}}catch(e){}}
closeB.addEventListener('click',()=>{if(typeof cust!=='undefined'&&cust.open)return;closeModals()});
skipB.addEventListener('click',()=>{try{endCine()}catch(e){}});

/* taps on these must not reach the game as a mouse click (that would swing your weapon) */
for(const el of[top,more,closeB,skipB,$t('hotbar'),$t('prompt')])el.addEventListener('mousedown',e=>{if(TC.on)e.stopPropagation()});
/* the hotbar and the prompt react to a tap */
$t('hotbar').addEventListener('click',e=>{if(!TC.on||!free())return;const s=e.target.closest('.slot');if(!s)return;const i=[...$t('hotbar').querySelectorAll('.slot')].indexOf(s);const id=PL.hot[i];if(id)useItem(id)});
$t('prompt').addEventListener('click',e=>{if(TC.on&&free())interact()});

/* ---------- switching the touch controls on and off ---------- */
function setOn(v){if(TC.on===v)return;TC.on=v;document.body.classList.toggle('touch',v);if(v){PL.noLock=true;try{document.exitPointerLock()}catch(e){}}else{releaseAll();more.classList.remove('open')}}
const coarse=()=>{try{return matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches}catch(e){return false}};
if(coarse()||(navigator.maxTouchPoints>0&&!matchMedia('(hover:hover)').matches))setOn(true);
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.pointerType==='pen')setOn(true);else if(e.pointerType==='mouse'&&e.isTrusted&&!coarse())setOn(false)},true);
addEventListener('keydown',e=>{if(e.isTrusted&&/^Key[WASD]$/.test(e.code)&&TC.on&&!coarse())setOn(false)},true);
/* no locked mouse on a touch screen */
const _lock=lock;lock=function(){if(TC.on){PL.noLock=true;return}return _lock()};
/* no pinch-zooming the whole page */
const vp=document.querySelector('meta[name=viewport]');
let vpOn=null;function vpLock(v){if(vp&&vpOn!==v){vpOn=v;vp.setAttribute('content','width=device-width,initial-scale=1,viewport-fit=cover'+(v?',maximum-scale=1,user-scalable=no':''))}}
document.addEventListener('gesturestart',e=>{if(TC.on)e.preventDefault()});

/* ---------- every frame: the joystick ---------- */
ANIMS.push(()=>{if(!TC.on)return;if(!free()){for(const c of['KeyW','KeyA','KeyS','KeyD'])if(TC.keys.has(c))hold(c,false)}else stickKeys()});
/* ---------- which buttons show (on a timer, because the game loop stops while a window is open) ---------- */
let lastVis='';
setInterval(()=>{const on=TC.on;document.body.classList.toggle('playing',!!started);if(!on){closeB.style.display=skipB.style.display=turn.style.display='none';vpLock(false);return}
  PL.noLock=true;vpLock(true);if(!free()&&TC.keys.size&&anyModal())releaseAll();
  const cr=document.querySelector('#title .cr');if(cr&&!cr.dataset.tc){cr.dataset.tc=1;cr.textContent=cr.textContent.replace('Muis = rondkijken, WASD = lopen.','Veeg = rondkijken, joystick = lopen.')}
  const cine=(window.CIN&&CIN.on)||document.body.classList.contains('cine');
  const modal=started&&anyModal()&&!(typeof cust!=='undefined'&&cust.open)&&!cine;closeB.style.display=modal?'block':'none';
  skipB.style.display=window.CIN&&CIN.on?'block':'none';
  turn.style.display=started&&!modal&&innerHeight>innerWidth*1.1?'block':'none';
  const fl=flying(),pw=typeof PW!=='undefined'&&PW.on,sb=PL.eq&&PL.eq.boots==='storm_boots';
  const vis=[fl,pw,sb].join();if(vis!==lastVis){lastVis=vis;
    BTN.down.style.display=fl?'':'none';BTN.block.style.display=fl?'none':'';BTN.dodge.style.display=fl?'none':'';
    BTN.jump.innerHTML=(fl?'⤒<small>Stijgen</small>':'⤒<small>Spring</small>');
    for(const k of['pw','pw7','pw8','pw9'])BTN[k].style.display=pw&&!fl?'':'none';BTN.storm.style.display=sb&&!fl?'':'none'}
  if(pw)for(const [k,i] of[['pw7',0],['pw8',1],['pw9',2]])BTN[k].classList.toggle('cd',(PW.cd[i]||0)>0)},120);
})();
