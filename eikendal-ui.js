/* Eikendal: title screen, character first (the world loads afterwards), the superpower ritual,
   living conversations (the world keeps going) and a tidier HUD. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const css=t=>{const s=document.createElement('style');s.textContent=t;document.head.appendChild(s)};
const urnd=(a=0,b=1)=>a+Math.random()*(b-a);

/* ================= HUD layout: nothing on top of anything else ================= */
css(`
#prompt{bottom:calc(140px + env(safe-area-inset-bottom,0px))!important}
#pwbar{bottom:calc(72px + env(safe-area-inset-bottom,0px))!important}
#pwbar #pwr{position:relative!important;left:auto!important;bottom:auto!important;margin-left:10px}
#log{bottom:calc(14px + env(safe-area-inset-bottom,0px))!important;max-height:34vh;overflow:hidden;justify-content:flex-end}
#mpchatlog{bottom:calc(14px + 34vh + 8px)!important;max-height:30vh;overflow:hidden;justify-content:flex-end}
body.mp #log{width:min(300px,calc(100vw - 24px))}
#bossbar,#gbar{top:calc(70px + env(safe-area-inset-top,0px))!important}
@media(max-width:980px){#pwbar .pws{width:48px!important;height:48px!important;font-size:21px!important}#qbar button{padding:6px 8px!important;font-size:12px!important}#qbar kbd{display:none}}
@media(max-width:860px){#topc{top:auto!important;bottom:calc(132px + env(safe-area-inset-bottom,0px))!important;font-size:12px}#prompt{bottom:calc(168px + env(safe-area-inset-bottom,0px))!important}#log{width:220px!important;max-height:24vh}#quest{display:none}}
@media(max-width:640px){#hotbar .slot{width:40px;height:40px}#qbar{bottom:calc(66px + env(safe-area-inset-bottom,0px))!important;right:6px!important}#pwbar{bottom:calc(64px + env(safe-area-inset-bottom,0px))!important;left:12px!important;transform:none!important}}
body.talking #hotbar,body.talking #pwbar,body.talking #qbar,body.talking #prompt,body.talking #log,body.talking #quest,body.talking #cross{opacity:0!important;pointer-events:none!important;transition:opacity .3s}
`);
/* the 'click to lock the mouse' hint sits above the action prompt instead of on top of it */
setTimeout(()=>{for(const d of document.body.children){if(d.tagName==='DIV'&&!d.id&&/^Klik in het spel om de muis/.test(d.textContent||'')){d.style.bottom='calc(196px + env(safe-area-inset-bottom,0px))';d.style.fontSize='14px'}}},0);
/* the R button sits in the power bar instead of floating next to it */
setInterval(()=>{const r=$('pwr'),b=$('pwbar');if(r&&b&&r.parentNode!==b)b.appendChild(r);if(b){const none=!PL.power;b.style.visibility=none?'hidden':'';if(r)r.style.visibility=none?'hidden':'';const m=$('mp');if(m)m.style.display=none?'none':''}},500);

/* ================= title screen ================= */
css(`
#title{position:fixed;inset:0;z-index:90;overflow:hidden;background:#07060a;display:grid;place-items:center;color:#f3e6c4;font-family:var(--f-ui)}
#title .bg{position:absolute;inset:-6%;background:url(assets/title.jpg) center/cover no-repeat,radial-gradient(circle at 50% 35%,#3a3020,#0a0806 75%);animation:tkb 46s ease-in-out infinite alternate;filter:saturate(1.08) contrast(1.04)}
@keyframes tkb{0%{transform:scale(1.03) translate(0,0)}100%{transform:scale(1.15) translate(-2.5%,1.8%)}}
#title .vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,rgba(0,0,0,0) 25%,rgba(6,4,2,.82) 100%),linear-gradient(180deg,rgba(6,4,2,.35),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 55%,rgba(6,4,2,.92))}
#title canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#title .tb{position:relative;text-align:center;padding:16px;max-width:92vw;animation:tin 1.6s ease-out both}
@keyframes tin{0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:none}}
#title h1{font-family:var(--f-display);font-weight:400;font-size:clamp(58px,12vw,138px);line-height:.9;margin:0;color:#f6dc9c;letter-spacing:.03em;text-shadow:0 0 34px rgba(224,176,74,.45),0 6px 22px #000}
#title .sub{font-size:clamp(12px,1.8vw,18px);letter-spacing:.55em;text-transform:uppercase;color:#fff1cc;margin:10px 0 34px;font-weight:700;text-shadow:0 2px 6px #000,0 0 14px #000,0 0 26px rgba(0,0,0,.9)}
#title .tbtn{display:block;margin:10px auto;min-width:min(300px,80vw);font-family:var(--f-display);font-size:clamp(20px,2.6vw,27px);padding:12px 40px;border:1px solid #e0b04a;border-radius:4px;color:#fff;cursor:pointer;background:linear-gradient(rgba(96,70,26,.92),rgba(34,24,10,.94));box-shadow:0 0 22px rgba(224,176,74,.22),inset 0 0 0 1px rgba(255,230,160,.12);transition:transform .15s,box-shadow .15s}
#title .tbtn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 0 34px rgba(255,200,90,.45),inset 0 0 0 1px rgba(255,230,160,.25)}
#title .tbtn.sec{font-size:clamp(16px,2vw,20px);padding:9px 30px;background:rgba(24,18,10,.82);border-color:#8a7648}
#title .tbtn small{display:block;font-family:var(--f-ui);font-size:13px;color:#d9c79a;letter-spacing:.02em;margin-top:2px}
#title #mpbox{background:rgba(10,8,5,.7)!important;border:1px solid #5a4b30;margin:18px auto 0!important}
#title .cr{position:absolute;left:0;right:0;bottom:10px;text-align:center;font-size:11.5px;color:rgba(230,215,180,.6);padding:0 12px}
#title .note{color:#e5a06a;font-size:13px;margin-top:10px;max-width:520px;margin-left:auto;margin-right:auto}
#exload{position:fixed;inset:0;z-index:95;display:none;place-items:center;background:rgba(7,6,4,.82);color:#e8d8b0;font-family:var(--f-display);font-size:24px;text-align:center}
#exload i{display:block;width:46px;height:46px;margin:0 auto 14px;border:3px solid rgba(224,176,74,.25);border-top-color:#e0b04a;border-radius:50%;animation:exsp 1s linear infinite}
@keyframes exsp{to{transform:rotate(360deg)}}
#ldg{background:linear-gradient(rgba(8,7,5,.78),rgba(8,7,5,.9)),url(assets/title.jpg) center/cover!important}
#ldg .tip{display:block;font-family:var(--f-ui);font-size:15px;color:#cdbb92;margin-top:16px;max-width:520px;padding:0 16px;min-height:2.6em}
`);
const TIPS=['Praat met dorpelingen: ze geven opdrachten, routebeschrijvingen en soms een cadeau als ze je mogen.','Onder het land liggen de goblintunnels. Zoek de luiken bij het dorp, het roverskamp en het moeras.','Bij de Oude Wijze Boom kun je alsnog een superkracht krijgen.','Druk X om weg te rollen van een zware klap.','De Reuzen-Vierhand laat mythische schatten vallen. Wie durft?','Vissen doe je aan het water met een hengel, of met je blote handen in de grotten.','In multiplayer delen jullie de tijd, het weer en de monsters.'];
function titleScreen(){
  const st=$('start');if(st)st.style.display='none';
  const t=document.createElement('div');t.id='title';
  t.innerHTML='<div class="bg"></div><div class="vig"></div><canvas></canvas><div class="tb"><h1>Eikendal</h1><div class="sub">Open Wereld</div><button class="tbtn" id="tplay">Spelen<small>Maak je personage</small></button><div id="tcont"></div><div id="tmp"></div><div class="note" id="tnote"></div></div><div class="cr">3D: Quaternius · Kenney · Literock Studios · polyy.ai · Bestiary · eigen werk. Muis = rondkijken, WASD = lopen.</div>';
  document.body.appendChild(t);
  const mp=$('mpbox');if(mp)$('tmp').appendChild(mp);
  const sv=loadSave();if(sv&&sv.PL){const b=document.createElement('button');b.className='tbtn sec';b.innerHTML='Doorgaan<small>Plaats '+SAVES.active+' · '+esc((sv.look&&sv.look.name)||'Reiziger')+' · '+esc(CLASSES[sv.PL.cls]?CLASSES[sv.PL.cls].n:'')+' · niveau '+(sv.PL.lvl||1)+'</small>';b.onclick=()=>continueGame(sv);$('tcont').appendChild(b)}
  $('tplay').innerHTML='Spelen<small>Kies een van je 5 opslagplaatsen</small>';$('tplay').onclick=openSlots;
  const n=$('startnote');if(n&&/niet geladen|mislukt|file/.test(n.textContent))$('tnote').innerHTML=n.innerHTML;
  if(location.protocol==='file:')$('tnote').innerHTML='Open het spel via een webserver (Start Eikendal) of als artifact op claude.ai, anders laden de 3D-modellen niet.';
  embers(t.querySelector('canvas'),()=>document.body.contains(t)&&t.style.display!=='none')}
function embers(cv,alive){const g=cv.getContext('2d');let W,H;const P=[];const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};rs();addEventListener('resize',rs);
  const step=()=>{if(!alive())return;g.clearRect(0,0,W,H);if(P.length<70&&Math.random()<.5)P.push({x:Math.random()*W,y:H+10,v:urnd(18,60),s:urnd(1,2.8),l:urnd(.4,1),w:urnd(0,6)});
    g.globalCompositeOperation='lighter';for(let i=P.length-1;i>=0;i--){const p=P[i];p.y-=p.v*.016;p.x+=Math.sin((p.y+p.w*80)*.012)*.5;p.l-=.0025;if(p.l<=0||p.y<-10){P.splice(i,1);continue}g.fillStyle='rgba(255,'+(150+p.s*30|0)+',70,'+(p.l*.8)+')';g.beginPath();g.arc(p.x,p.y,p.s,0,6.283);g.fill()}
    requestAnimationFrame(step)};step()}
function busy(txt){let d=$('exload');if(!d){d=document.createElement('div');d.id='exload';document.body.appendChild(d)}if(txt===false){d.style.display='none';return}d.innerHTML='<div><i></i>'+esc(txt)+'</div>';d.style.display='grid'}
/* nicer loading screen with tips */
{const l=$('ldg');if(l){const tip=document.createElement('span');tip.className='tip';l.firstElementChild&&l.firstElementChild.appendChild(tip);let k=Math.floor(Math.random()*TIPS.length);const sh=()=>{tip.textContent='Tip: '+TIPS[k++%TIPS.length]};sh();setInterval(sh,6000)}}

/* ---------- the five save slots ---------- */
function slotDate(t){if(!t)return'';const d=new Date(t);return d.toLocaleDateString('nl-BE',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('nl-BE',{hour:'2-digit',minute:'2-digit'})}
function openSlots(){let ov=$('slots');if(ov)ov.remove();ov=document.createElement('div');ov.id='slots';
  ov.style.cssText='position:fixed;inset:0;z-index:62;display:grid;place-items:center;background:rgba(8,6,4,.72)';
  const box=document.createElement('div');box.className='panel';box.style.cssText='width:min(560px,94vw);max-height:90vh;overflow:auto;padding:16px 18px';ov.appendChild(box);$('title').appendChild(ov);
  const draw=()=>{let h='<h2 style="margin:0 0 4px">Opslagplaatsen</h2><p style="margin:0 0 10px;color:var(--mute)">Je hebt 5 plaatsen. Elk personage bewaart zijn eigen spel.</p>';
    for(let i=1;i<=SAVES.n;i++){const sv=readSlot(i),m=sv&&sv.meta||{};
      h+='<div style="display:flex;align-items:center;gap:10px;border:1px solid rgba(224,176,74,.35);border-radius:8px;padding:9px 10px;margin:7px 0;'+(i===SAVES.active&&sv?'background:rgba(224,176,74,.10)':'')+'">'+
        '<div style="font:bold 22px var(--f-display,serif);width:26px;text-align:center;color:#e0b04a">'+i+'</div><div style="flex:1;min-width:0">'+
        (sv&&sv.PL?'<b>'+esc((sv.look&&sv.look.name)||'Reiziger')+'</b> · '+esc(CLASSES[sv.PL.cls]?CLASSES[sv.PL.cls].n:'')+' · niveau '+(sv.PL.lvl||1)+'<br><small style="color:var(--mute)">'+esc(m.where||'')+(m.t?' · '+slotDate(m.t):'')+(sv.PL.power&&window.PWR&&PWR[sv.PL.power]?' · '+esc(PWR[sv.PL.power].n):'')+'</small>':'<span style="color:var(--mute)">Leeg</span>')+'</div>'+
        (sv&&sv.PL?'<button class="btn pri" data-play="'+i+'">Spelen</button><button class="btn" data-new="'+i+'" title="Nieuw spel in deze plaats">Nieuw</button><button class="btn" data-del="'+i+'" title="Wissen">\u2716</button>':'<button class="btn pri" data-new="'+i+'">Nieuw spel</button>')+'</div>'}
    h+='<div style="text-align:center;margin-top:10px"><button class="btn" data-close="1">Terug</button></div>';box.innerHTML=h;
    box.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{const i=+b.dataset.play,sv=readSlot(i);if(!sv)return;SAVES.active=i;try{localStorage.setItem('eikendal_slot_active',String(i))}catch(e){}ov.remove();continueGame(window.loadSave?loadSave():sv)});
    box.querySelectorAll('[data-new]').forEach(b=>b.onclick=()=>{const i=+b.dataset.new;if(readSlot(i)&&b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Overschrijven?';b.classList.add('pri');return}
      clearSlot(i);SAVES.active=i;try{localStorage.setItem('eikendal_slot_active',String(i))}catch(e){}ov.remove();playNew()});
    box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const i=+b.dataset.del;if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Wissen?';b.classList.add('pri');return}clearSlot(i);draw()});
    box.querySelector('[data-close]').onclick=()=>ov.remove()};
  draw()}
async function playNew(){busy('Je personage wordt geladen...');
  try{if(window.loadCharAssets)await loadCharAssets();if(window.EX&&EX.loadChars)await EX.loadChars()}catch(e){console.warn(e)}busy(false);
  $('title').style.display='none';openCust('adventurer')}
async function continueGame(sv){$('title').style.display='none';window.EX_POWER=sv.PL.power&&PWR[sv.PL.power]?sv.PL.power:null;
  busy('Laden...');try{if(window.loadCharAssets)await loadCharAssets();if(window.EX&&EX.loadChars)await EX.loadChars()}catch(e){}busy(false);
  if(!await needWorld())return;startGame(sv.PL.cls,sv)}
async function enterWorld(cls){if(!await needWorld())return;startGame(cls)}
{const _sgS=startGame;startGame=function(...a){const r=_sgS(...a);try{$('psave').textContent='Opslaan (plaats '+SAVES.active+')'}catch(e){}return r}}

/* ================= character screen: role, look, then superpower or not ================= */
css(`
#exroles{display:none!important}   /* the roles are gone from the character screen: you are simply a hero */
#exroles .ob{padding:6px 12px;font-size:14px}
#exroles .ob small{display:block;font-size:11px;color:var(--mute);max-width:190px;white-space:normal;text-align:left}
#cust .cbtns .pw{background:linear-gradient(#6a3ab8,#2a1458);border-color:#c49aff;color:#fff;font-size:16px;padding:9px 18px;box-shadow:0 0 16px rgba(170,110,255,.45)}
#cust .cbtns .pw:hover{box-shadow:0 0 26px rgba(200,150,255,.75)}
#cust .cbtns .np{font-size:15px;padding:9px 16px}
`);
const _oc=openCust;
openCust=function(cls){
  _oc(cls);if(cls)try{$('cclass').textContent='Maak je held'}catch(e){}
  const box=document.querySelector('#cust .cright'),btns=document.querySelector('#cust .cbtns');let roles=$('exroles');
  if(cls){/* new character */
    cust.cls=cls;if(!roles){roles=document.createElement('div');roles.id='exroles';box.insertBefore(roles,box.firstChild)}
    roles.innerHTML='';for(const [id,c] of Object.entries(CLASSES)){const b=document.createElement('button');b.type='button';b.className='ob'+(id===cust.cls?' on':'');b.innerHTML='<b>'+esc(c.n)+'</b><small>'+esc(c.d)+'</small>';b.onclick=()=>pickRole(id);roles.appendChild(b)}
    roles.style.display='';$('cok').style.display='none';
    for(const x of btns.querySelectorAll('.ex'))x.remove();
    const np=document.createElement('button');np.className='btn ex np';np.textContent='Speel zonder superkracht';np.onclick=()=>{closeCust();window.EX_POWER=null;enterWorld(cust.cls)};
    const pw=document.createElement('button');pw.className='btn pri ex pw';pw.textContent='✨ Krijg een superkracht';pw.onclick=async()=>{closeCust();const id=await powerRitual();window.EX_POWER=id;enterWorld(cust.cls)};
    btns.appendChild(np);btns.appendChild(pw);
    $('ccancel').onclick=()=>{closeCust();$('title').style.display='grid'}}
  else{if(roles)roles.style.display='none';$('cok').style.display='';for(const x of btns.querySelectorAll('.ex'))x.remove()}
  try{if(cust.r&&!cust.r._ex){cust.r._ex=1;cust.r.setPixelRatio(Math.min(2,devicePixelRatio||1));cust.r.setSize(280,380,false);const rim=new T.DirectionalLight(0xffd9a0,.9);rim.position.set(-3,3,-4);cust.scene.add(rim)}}catch(e){}};
/* before the world exists the main loop does nothing, so the character preview gets its own */
{let last=performance.now();const tick=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;if(cust.open&&!worldReady){try{updateCust(dt)}catch(e){}}requestAnimationFrame(tick)};requestAnimationFrame(tick)}
/* more clothes: mix the modular outfit parts, extra hats */
MP_LOOK.push('mix');HATS.push(['straw','Strohoed'],['scarf','Hoofddoek'],['helm','Helm']);
const _poX=playerOpts;playerOpts=function(){const o=_poX();if(PL.look.mix&&!o.armor)o.mix=PL.look.mix;return o};
const _rcX=renderCust;renderCust=function(){_rcX();if(custTab!=='kleding')return;const c=$('cctl');const po=_poX(),style=PL.look.outfit||(po.armor||po.cape||['hood','helm','horned','dragonhelm','crown','elven'].includes(po.hat)?'ranger':'peasant'),cur=PL.look.mix||(style==='ranger'?'rrrr0':'pppp0');
  const row=(label,idx,choices)=>{const box=document.createElement('div');box.innerHTML='<label>'+label+'</label>';choices.forEach(([v,n])=>{const b=document.createElement('button');b.type='button';b.className='ob'+(cur[idx]===v?' on':'');b.textContent=n;b.onclick=()=>{const m=cur.split('');m[idx]=v;PL.look.mix=m.join('');renderCust()};box.appendChild(b)});c.appendChild(box)};
  const PR=[['p','Boer'],['r','Woudloper']];row('Bovenstuk',0,PR);row('Mouwen en handschoenen',1,PR);row('Broek',2,PR);row('Schoenen',3,PR);row('Schouderstuk',4,[['0','Geen'],['1','Leren schouderstuk']]);
  const r=document.createElement('button');r.type='button';r.className='ob';r.textContent='Alles volgens kledingstijl';r.onclick=()=>{delete PL.look.mix;renderCust()};const w=document.createElement('div');w.appendChild(r);c.appendChild(w);
  const n=document.createElement('div');n.style.cssText='font-size:12.5px;color:var(--mute)';n.textContent='Combineer de onderdelen van de boeren- en woudloperskleding. Harnassen gaan over je kleding heen.';c.appendChild(n)};
function pickRole(id){const c=CLASSES[id];cust.cls=id;const d=defaultLook(id);Object.assign(PL.look,{tunic:d.tunic,pants:d.pants,cape:d.cape,hat:d.hat});PL.eq={weapon:c.eq.weapon,shield:c.eq.shield||null,armor:c.eq.armor};
  $('cclass').textContent='Rol: '+c.n;document.querySelectorAll('#exroles .ob').forEach((b,i)=>b.classList.toggle('on',Object.keys(CLASSES)[i]===id));renderCust()}

/* the power wrapper: a choice made on the character screen replaces the old wheel */
/* (see startGame in index.html: it reads window.EX_POWER) */

/* ================= the superpower ritual ================= */
css(`
#pwrit{position:fixed;inset:0;z-index:96;background:#000;overflow:hidden;font-family:var(--f-ui);color:#fff}
#pwrit canvas{position:absolute;inset:0;width:100%;height:100%}
#pwrit .lb{position:absolute;left:0;right:0;height:11vh;background:#000;z-index:2;transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
#pwrit .lb.t{top:0;transform:translateY(-100%)}#pwrit .lb.b{bottom:0;transform:translateY(100%)}#pwrit.cine .lb{transform:none}
#pwrit .cap{position:absolute;left:0;right:0;top:calc(11vh + 18px);text-align:center;z-index:3;font-family:var(--f-display);font-size:clamp(20px,3vw,34px);color:#f3e2b8;letter-spacing:.06em;text-shadow:0 2px 10px #000;opacity:0;transition:opacity 1s}
#pwrit .skip{position:absolute;right:18px;bottom:calc(11vh + 12px);z-index:3;font-size:13px;color:rgba(255,255,255,.6);background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:6px 14px;cursor:pointer}
#pwrit .fl{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;background:#fff}
#pwrit .rev{position:absolute;inset:0;z-index:5;pointer-events:none}
#pwrit .rb{position:absolute;inset:calc(11vh + 8px) 0 calc(11vh + 8px);display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center}
#pwrit .rt,#pwrit .rbt{pointer-events:auto;max-width:min(900px,94vw)}
#pwrit .rn{font-family:var(--f-display);font-size:clamp(40px,7vw,96px);line-height:1;color:var(--pc);text-shadow:0 0 30px var(--pc),0 4px 18px #000;opacity:0;transform:scale(2.2);transition:all .9s cubic-bezier(.15,1.4,.3,1)}
#pwrit .rn.on{opacity:1;transform:none}
#pwrit .rd{font-size:clamp(15px,1.8vw,19px);color:#efe2c2;margin:8px 0 16px;opacity:0;transition:opacity .8s .3s;text-shadow:0 2px 6px #000}#pwrit .rd.on{opacity:1}
#pwrit .ab{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
#pwrit .ac{width:min(250px,28vw);min-width:180px;text-align:left;background:rgba(10,8,14,.78);border:1px solid var(--pc);border-radius:8px;padding:10px 12px;box-shadow:0 0 18px color-mix(in srgb,var(--pc) 40%,transparent);opacity:0;transform:translateY(24px);transition:all .6s}
#pwrit .ac.on{opacity:1;transform:none}#pwrit .ac b{color:var(--pc);font-size:16px}#pwrit .ac kbd{float:right;background:var(--pc);color:#111;border-radius:4px;padding:0 6px;font-weight:700}#pwrit .ac p{margin:4px 0 0;font-size:13px;color:#d8ccb0}#pwrit .ac small{color:#9a8f74}
#pwrit .go{margin-top:20px;font-family:var(--f-display);font-size:24px;padding:12px 40px;border-radius:6px;border:2px solid var(--pc);background:rgba(16,12,20,.9);color:#fff;cursor:pointer;opacity:0;transition:opacity .6s,box-shadow .2s}#pwrit .go.on{opacity:1}#pwrit .go:hover{box-shadow:0 0 26px var(--pc)}
`);
const ORB={fire:0xff6a1a,ice:0x6ad6ff,bolt:0x9fb4ff,light:0xffd96a,str:0xe8933a,shadow:0xa46bff};
function powerRitual(){return new Promise(resolve=>{
  const ids=Object.keys(PWR),win=ids[Math.floor(Math.random()*ids.length)],P=PWR[win],pc=new T.Color(P.orb||ORB[win]||0xffffff);
  const ov=document.createElement('div');ov.id='pwrit';ov.style.setProperty('--pc',P.col);
  ov.innerHTML='<canvas></canvas><div class="lb t"></div><div class="lb b"></div><div class="cap">Het lot kiest je kracht...</div><div class="skip">Overslaan (spatie)</div><div class="fl"></div><div class="rev"></div>';document.body.appendChild(ov);
  const cv=ov.querySelector('canvas'),R=new T.WebGLRenderer({canvas:cv,antialias:true});R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.setSize(innerWidth,innerHeight,false);
  const S=new T.Scene();S.fog=new T.FogExp2(0x07050c,.045);S.background=new T.Color(0x05040a);
  const cam=new T.PerspectiveCamera(42,innerWidth/innerHeight,.05,400);const onR=()=>{R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};addEventListener('resize',onR);
  S.add(new T.HemisphereLight(0x8a7aaa,0x1a1008,.55));const key=new T.DirectionalLight(0xffe2b0,.7);key.position.set(3,6,4);S.add(key);
  const glow=new T.PointLight(0xffffff,0,14,1.6);glow.position.set(0,1.5,0);S.add(glow);
  /* sky dome with stars */
  {const sg=new T.BufferGeometry(),n=1600,p=new Float32Array(n*3);for(let i=0;i<n;i++){const th=Math.random()*6.283,ph=Math.acos(Math.random()*.9),r=150;p[i*3]=Math.sin(ph)*Math.cos(th)*r;p[i*3+1]=Math.cos(ph)*r-10;p[i*3+2]=Math.sin(ph)*Math.sin(th)*r}sg.setAttribute('position',new T.BufferAttribute(p,3));S.add(new T.Points(sg,new T.PointsMaterial({color:0xcfd8ff,size:.6,sizeAttenuation:true,fog:false})))}
  /* the stone circle */
  const runeT=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.translate(256,256);g.strokeStyle='#fff';g.fillStyle='#fff';g.lineWidth=5;g.beginPath();g.arc(0,0,236,0,6.283);g.stroke();g.lineWidth=2;g.beginPath();g.arc(0,0,206,0,6.283);g.stroke();g.beginPath();g.arc(0,0,120,0,6.283);g.stroke();
    g.font='bold 30px serif';g.textAlign='center';const gl='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';for(let i=0;i<24;i++){g.save();g.rotate(i/24*6.283);g.fillText(gl[i],0,-213);g.restore()}
    for(let i=0;i<6;i++){g.save();g.rotate(i/6*6.283);g.beginPath();g.moveTo(0,-120);g.lineTo(0,-206);g.stroke();g.restore()}g.lineWidth=3;g.beginPath();for(let i=0;i<=6;i++){const a=i/6*6.283*2;g.lineTo(Math.sin(a)*120,-Math.cos(a)*120)}g.stroke();const t=new T.CanvasTexture(c);return t})();
  const plat=new T.Mesh(new T.CylinderGeometry(5.2,5.6,.6,48),new T.MeshStandardMaterial({color:0x3a3640,roughness:.9}));plat.position.y=-.3;S.add(plat);
  const ground=new T.Mesh(new T.CircleGeometry(80,48),new T.MeshStandardMaterial({color:0x14101a,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.6;S.add(ground);
  const runeM=new T.MeshBasicMaterial({map:runeT,transparent:true,blending:T.AdditiveBlending,depthWrite:false,color:0x8a7aff,opacity:.0}),rune=new T.Mesh(new T.CircleGeometry(5,64),runeM);rune.rotation.x=-Math.PI/2;rune.position.y=.02;S.add(rune);
  /* six pillars, each with the orb of a power */
  const orbs=[];ids.forEach((id,i)=>{const a=i/ids.length*6.283+.5,x=Math.cos(a)*9,z=Math.sin(a)*9;const pil=new T.Mesh(new T.CylinderGeometry(.35,.5,3.2,6),new T.MeshStandardMaterial({color:0x2a2630,roughness:.85,flatShading:true}));pil.position.set(x,1,z);S.add(pil);
    const c=new T.Color(PWR[id].orb||ORB[id]||0xffffff),o=new T.Mesh(new T.SphereGeometry(.32,20,14),new T.MeshBasicMaterial({color:c})),halo=new T.Mesh(new T.SphereGeometry(.6,16,12),new T.MeshBasicMaterial({color:c,transparent:true,opacity:.25,blending:T.AdditiveBlending,depthWrite:false}));o.add(halo);o.position.set(x,2.95,z);S.add(o);
    const ic=document.createElement('canvas');orbs.push({id,o,halo,c,home:new T.Vector3(x,2.95,z),a,alive:true})});
  /* the avatar */
  let h=null;try{h=makeHuman(playerOpts());setHeld(h,PL.eq.weapon,PL.eq.shield);S.add(h.g);h.g.rotation.y=0}catch(e){console.warn(e)}
  /* particles */
  const NP=2500,pg=new T.BufferGeometry(),pp=new Float32Array(NP*3),pcol=new Float32Array(NP*3),ps=new Float32Array(NP),pa=new Float32Array(NP),pv=new Float32Array(NP*3),pl=new Float32Array(NP),pm=new Float32Array(NP),pgr=new Float32Array(NP);let pcur=0;
  pg.setAttribute('position',new T.BufferAttribute(pp,3));pg.setAttribute('pcol',new T.BufferAttribute(pcol,3));pg.setAttribute('size',new T.BufferAttribute(ps,1));pg.setAttribute('alpha',new T.BufferAttribute(pa,1));
  const pmat=new T.ShaderMaterial({uniforms:{sc:{value:innerHeight}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexShader:'attribute vec3 pcol;attribute float size;attribute float alpha;varying vec3 vC;varying float vA;uniform float sc;void main(){vC=pcol;vA=alpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(size*sc/max(.1,-mv.z),1.,220.);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;gl_FragColor=vec4(vC,smoothstep(.5,.0,d)*vA);}'});
  const pts=new T.Points(pg,pmat);pts.frustumCulled=false;S.add(pts);
  const em=(x,y,z,vx,vy,vz,life,size,c,gr=0)=>{const i=pcur;pcur=(pcur+1)%NP;pp[i*3]=x;pp[i*3+1]=y;pp[i*3+2]=z;pv[i*3]=vx;pv[i*3+1]=vy;pv[i*3+2]=vz;pl[i]=pm[i]=life;ps[i]=size;pcol[i*3]=c.r;pcol[i*3+1]=c.g;pcol[i*3+2]=c.b;pgr[i]=gr};
  const burst=(x,y,z,n,sp,life,size,c,gr=0)=>{for(let i=0;i<n;i++){const th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1),v=sp*urnd(.3,1);em(x,y,z,Math.sin(ph)*Math.cos(th)*v,Math.cos(ph)*v,Math.sin(ph)*Math.sin(th)*v,life*urnd(.6,1.2),size,c,gr)}};
  const pUpd=dt=>{for(let i=0;i<NP;i++){if(pl[i]<=0){pa[i]=0;continue}pl[i]-=dt;const t=1-pl[i]/pm[i];pv[i*3+1]-=pgr[i]*dt;pp[i*3]+=pv[i*3]*dt;pp[i*3+1]+=pv[i*3+1]*dt;pp[i*3+2]+=pv[i*3+2]*dt;pa[i]=(t<.15?t/.15:1)*(1-t)}
    pg.attributes.position.needsUpdate=pg.attributes.pcol.needsUpdate=pg.attributes.size.needsUpdate=pg.attributes.alpha.needsUpdate=true;pmat.uniforms.sc.value=innerHeight/(2*Math.tan(cam.fov*Math.PI/360))};
  /* beam and shock ring */
  const beam=new T.Mesh(new T.CylinderGeometry(.9,1.4,60,24,1,true),new T.MeshBasicMaterial({color:pc,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));beam.position.y=30;S.add(beam);
  const ring=new T.Mesh(new T.RingGeometry(.9,1,64),new T.MeshBasicMaterial({color:pc,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;S.add(ring);
  /* the power's own effect around the avatar */
  const fx=[],sig=window.PWRIT&&PWRIT[win]?PWRIT[win](S,{em,burst,urnd}):null;
  const bolts=[];const bolt=(a,b,c)=>{const n=10,arr=new Float32Array((n+1)*3);for(let i=0;i<=n;i++){const t=i/n,j=i===0||i===n?0:.35;arr[i*3]=a.x+(b.x-a.x)*t+urnd(-j,j);arr[i*3+1]=a.y+(b.y-a.y)*t+urnd(-j,j);arr[i*3+2]=a.z+(b.z-a.z)*t+urnd(-j,j)}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(arr,3));const l=new T.Line(g,new T.LineBasicMaterial({color:c,transparent:true,blending:T.AdditiveBlending}));S.add(l);bolts.push({l,t:.18})};
  /* timeline */
  let t=0,last=performance.now(),skipped=false,alive=true,revealed=false,hi=-1,lastHi=-1,sel=null,landT=0;
  const cap=ov.querySelector('.cap'),fl=ov.querySelector('.fl'),flash=(c,o,d)=>{fl.style.transition='none';fl.style.background=c;fl.style.opacity=o;requestAnimationFrame(()=>{fl.style.transition='opacity '+d+'s ease-out';fl.style.opacity=0})};
  const skip=()=>{if(t<6.8){t=6.8;skipped=true}};ov.querySelector('.skip').onclick=skip;const kd=e=>{if(e.code==='Space'||e.code==='Escape'||e.code==='Enter'){e.preventDefault();e.stopPropagation();if(revealed&&e.code==='Enter')finish();else skip()}};addEventListener('keydown',kd,true);
  setTimeout(()=>{ov.classList.add('cine');cap.style.opacity=1},300);try{sfx('quest')}catch(e){}
  const fired={};const once=(k,f)=>{if(!fired[k]){fired[k]=1;f()}};
  function finish(){if(!alive)return;alive=false;removeEventListener('keydown',kd,true);removeEventListener('resize',onR);ov.style.transition='opacity .6s';ov.style.opacity=0;setTimeout(()=>{ov.remove();R.dispose()},650);resolve(win)}
  function reveal(){revealed=true;const rv=ov.querySelector('.rev');rv.innerHTML='<div class="rb"><div class="rt"><div class="rn">'+P.ic+' '+esc(P.n)+'</div><div class="rd">'+esc(P.d)+'</div></div><div class="rbt"><div class="ab">'+P.ab.map((a,i)=>'<div class="ac"><kbd>'+(7+i)+'</kbd><b>'+esc(a.n)+'</b><br><small>vanaf niveau '+PWU[i]+' · energie '+a.cost+'</small><p>'+esc(a.d)+'</p></div>').join('')+'</div><button class="go">Begin het avontuur</button></div></div>';
    const rn=rv.querySelector('.rn'),rd=rv.querySelector('.rd'),cards=[...rv.querySelectorAll('.ac')],go=rv.querySelector('.go');setTimeout(()=>rn.classList.add('on'),50);setTimeout(()=>rd.classList.add('on'),400);cards.forEach((c,i)=>setTimeout(()=>{c.classList.add('on');try{sfx('click')}catch(e){}},900+i*380));setTimeout(()=>go.classList.add('on'),900+cards.length*380);go.onclick=finish;cap.style.opacity=0}
  const loop=now=>{if(!alive)return;const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;const hp=new T.Vector3(0,(h?h.g.position.y:0)+1.25,0);
    /* camera: wide, slow orbit, then pushing in */
    const k=Math.min(1,t/7),ca=.6+t*.18,cr=15-9.5*k*k+(t>8?Math.min(2.5,(t-8)*.8):0),cy=5.2-2.9*k+(t>6.8&&t<7.6?urnd(-.12,.12):0);cam.position.set(Math.cos(ca)*cr,cy,Math.sin(ca)*cr);cam.lookAt(0,1.4+(h?h.g.position.y*.6:0),0);
    if(t>1&&t<2.6)cap.style.opacity=1;
    runeM.opacity=Math.min(.9,t*.35);rune.rotation.z+=dt*(.1+k*1.2);runeM.color.lerp(t>6.8?pc:new T.Color(0x8a7aff),dt*2);
    /* ambient motes rising */
    if(Math.random()<.9)em(urnd(-5,5),0,urnd(-5,5),0,urnd(.4,1.4),0,urnd(2,4),urnd(.04,.09),new T.Color(.7,.6,1));
    /* the avatar rises */
    if(h){const lift=t<2.5?0:t<6.8?Math.min(1.2,(t-2.5)*.4):t<9?1.2:Math.max(0,1.2-(t-9)*1.1);h.g.position.y=lift+(t>2.5&&t<9?Math.sin(t*2)*.06:0);h.idleClip=t>2.2&&t<9.6?'Spell_Simple_Idle_Loop':null;h.g.rotation.y+=(-(ca+Math.PI/2)+Math.PI-h.g.rotation.y)*0;try{animHuman(h,dt,0,{})}catch(e){}
      if(t>9.6&&!landT){landT=1;burst(0,.1,0,60,4,.9,.25,new T.Color(.7,.6,.5),3);try{sfx('hit')}catch(e){}}}
    /* orbs leave their pillars and circle the avatar, faster and faster; the light hops between them and slows down */
    const alive2=orbs.filter(o=>o.alive);
    if(t>2.2){const sp=t<6?.6+Math.pow((t-2.2)/3.8,2)*6:1;orbs.forEach((o,i)=>{if(!o.alive)return;o.a+=dt*sp;const r=t<6.2?2.4:2.4+(t-6.2)*3,tp=new T.Vector3(Math.cos(o.a)*r,hp.y+Math.sin(o.a*2+i)*.3,Math.sin(o.a)*r);o.o.position.lerp(tp,Math.min(1,dt*(t<3?1.5:6)));
      if(Math.random()<.6)em(o.o.position.x,o.o.position.y,o.o.position.z,urnd(-.2,.2),urnd(-.2,.2),urnd(-.2,.2),.6,.18,o.c)})}
    if(t>2.8&&t<6.2){const prog=(t-2.8)/3.4,step=Math.floor(Math.pow(prog,.55)*24);hi=(step+ids.indexOf(win)*1000-24+ids.length*100)%ids.length;if(t>6.0)hi=ids.indexOf(win);
      if(hi!==lastHi){lastHi=hi;try{sfx('click')}catch(e){}}orbs.forEach((o,i)=>{const on=i===hi;o.halo.scale.setScalar(on?2.4:1);o.halo.material.opacity=on?.6:.2})}
    /* the chosen one: the others shatter, it strikes the avatar */
    if(t>=6.2)once('pick',()=>{orbs.forEach(o=>{if(o.id!==win){o.alive=false;burst(o.o.position.x,o.o.position.y,o.o.position.z,70,5,1,.22,o.c,1);S.remove(o.o)}else sel=o});try{sfx('swing')}catch(e){}});
    if(sel&&t>=6.2&&t<6.8){sel.o.position.lerp(hp,Math.min(1,dt*7));sel.halo.scale.setScalar(2.4+(t-6.2)*5)}
    if(t>=6.8)once('hit',()=>{if(sel)S.remove(sel.o);flash(P.col,.95,1.4);burst(0,hp.y,0,420,11,1.4,.32,pc,2);burst(0,hp.y,0,160,5,1.8,.5,new T.Color(1,1,1),0);try{sfx('thunder')}catch(e){}cap.style.opacity=0;
      beam.material.opacity=.85;ring.material.opacity=.9;glow.color.copy(pc);glow.intensity=6;key.color.copy(pc)});
    if(t>6.8){const q=t-6.8;beam.material.opacity=Math.max(0,.85-q*.45);beam.scale.x=beam.scale.z=1+q*.6;ring.scale.setScalar(1+q*18);ring.material.opacity=Math.max(0,.9-q*.7);glow.intensity=Math.max(1.5,6-q*2);
      /* the power's signature */
      if(sig&&sig.u)sig.u(t,dt,hp);
      if(Math.random()<.5)em(urnd(-.5,.5),hp.y,urnd(-.5,.5),urnd(-1,1),urnd(-1,1),urnd(-1,1),.8,.15,pc)}
    for(let i=bolts.length-1;i>=0;i--){bolts[i].t-=dt;if(bolts[i].t<=0){S.remove(bolts[i].l);bolts.splice(i,1)}}
    if(t>8.2&&!revealed)reveal();
    pUpd(dt);R.render(S,cam);requestAnimationFrame(loop)};
  requestAnimationFrame(loop)})}
window.powerRitual=powerRitual;
/* a power can still be received later, at the Wise Old Tree */
const _pfU=populateFantasy;
populateFantasy=function(){_pfU();try{addInter(SPOTS.wise[0],SPOTS.wise[1]+4.5,6,()=>PL.power?'':'Vraag de Oude Wijze Boom om een superkracht',async()=>{if(PL.power)return;closeModals1&&closeModals1();try{document.exitPointerLock()}catch(e){}
  const id=await powerRitual();PL.power=id;try{pwInit(true)}catch(e){console.warn(e)}addLog('De Wijze Boom schenkt je de kracht van '+PWR[id].n.toLowerCase()+'!','#c9a0ff');lock()})}catch(e){}};

/* ================= conversations: the world keeps moving, the camera finds the face ================= */
css(`
#dlg{left:50%!important;bottom:calc(18px + env(safe-area-inset-bottom,0px))!important;top:auto!important;transform:translateX(-50%)!important;width:min(600px,calc(100vw - 24px))!important;padding:8px 12px 7px!important;background:linear-gradient(180deg,rgba(24,19,12,.82),rgba(14,11,7,.9))!important;border-color:#8a7648!important;max-height:38vh!important;overflow:auto!important}
#dlg .dh{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;border-bottom:1px solid rgba(224,176,74,.25);padding-bottom:3px;margin-bottom:3px}
#dlg .dh h3{font-size:17px}#dlg .dh small{color:var(--mute);font-size:11.5px}#dlg .dh .hearts{margin-left:auto;color:#e5766a;letter-spacing:2px;font-size:14px}
#dlg .dt{font-size:14.5px;line-height:1.35;min-height:1.4em;margin:2px 0 6px;color:#f1e4c4}
#dlg .dt .cur{display:inline-block;width:8px;height:16px;background:#e0b04a;margin-left:2px;animation:blink .8s steps(1) infinite;vertical-align:-2px}@keyframes blink{50%{opacity:0}}
#dlg .do{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:4px}
#dlg .do button{text-align:left;background:rgba(40,32,20,.85);border:1px solid #5a4b30;color:var(--parch);padding:3px 7px;border-radius:4px;cursor:pointer;font:inherit;font-size:12.5px;line-height:1.3;transition:all .12s}
#dlg .do button:hover,#dlg .do button:focus{border-color:var(--gold);background:rgba(224,176,74,.16);color:#fff;outline:none}
#dlg .do button.pri{border-color:#b98a2e;color:#ffe9b0}
#dlg .do button kbd{background:#e0b04a;color:#1b140c;border-radius:3px;padding:0 5px;margin-right:5px;font-weight:700;font-size:10.5px}
#dlg .hint{display:none}
#dlgbars:before,#dlgbars:after{content:'';position:fixed;left:0;right:0;height:3.5vh;background:#000;z-index:4;transition:transform .5s;pointer-events:none}
#dlgbars:before{top:0;transform:translateY(-100%)}#dlgbars:after{bottom:0;transform:translateY(100%)}
body.talking #dlgbars:before,body.talking #dlgbars:after{transform:none}
`);
{const d=document.createElement('div');d.id='dlgbars';document.body.appendChild(d)}
const DLG={a:null,typing:false,full:'',n:0,opts:[],cam:null,day:-1};window.DLG=DLG;
const heartStr=f=>{const n=Math.round((f||0)/20);return'♥'.repeat(n)+'♡'.repeat(5-n)};
function tod(){const t=ENV.time;return t<5?'nacht':t<12?'ochtend':t<18?'middag':t<22?'avond':'nacht'}
showDlg=function(a,text,opts){
  const el=$('dlg');DLG.a=a;document.body.classList.add('talking');
  if(opts.length&&opts[opts.length-1][0]==='Vaarwel'&&a.kind==='npc')opts=extraOpts(a,opts);
  DLG.opts=opts;DLG.full=String(text);DLG.n=0;DLG.typing=true;
  el.innerHTML='<div class="dh"><h3>'+esc(a.name)+'</h3><small>'+esc(JOBN[a.job]||'')+'</small><span class="hearts" title="Vriendschap">'+heartStr(a.friend)+'</span></div><div class="dt"></div><div class="do" id="dopts"></div><div class="hint">1-9 kiezen · spatie = tekst overslaan · loop weg of Esc om te stoppen · de tijd loopt door</div>';
  const box=el.querySelector('.do');opts.forEach(([lab,fn,pri],i)=>{const b=document.createElement('button');if(pri)b.className='pri';b.innerHTML='<kbd>'+(i+1)+'</kbd>'+esc(lab);b.onclick=()=>{try{sfx('click')}catch(e){}fn()};box.appendChild(b)});
  box.style.visibility='hidden';el.style.display='block';$('inv').style.display=$('shop').style.display='none';try{document.exitPointerLock()}catch(e){}
  if(a.h)a.sayT=Math.max(a.sayT||0,1.2)};
function typeTick(dt){if(!DLG.typing)return;const el=$('dlg');if(!el||el.style.display!=='block')return;DLG.n+=dt*55;const plain=DLG.full.replace(/<[^>]*>/g,'');
  if(DLG.n>=plain.length){DLG.typing=false;el.querySelector('.dt').innerHTML=DLG.full;const box=el.querySelector('.do');
    /* buttons that other parts of the game added (ferry, sedan chair, diplomacy...) get their number key too, and goodbye stays last */{const bye=[...box.querySelectorAll('button')].find(b=>/Vaarwel$/.test(b.textContent));if(bye)box.appendChild(bye)}box.querySelectorAll('button').forEach((b,i)=>{const k=b.querySelector('kbd');if(k)k.textContent=i+1;else if(i<9)b.insertAdjacentHTML('afterbegin','<kbd>'+(i+1)+'</kbd>')});box.style.visibility='visible';return}
  el.querySelector('.dt').innerHTML=esc(plain.slice(0,Math.floor(DLG.n)))+'<span class="cur"></span>';if(DLG.a&&DLG.a.h)DLG.a.sayT=.4}
function finishType(){if(!DLG.typing)return false;DLG.n=1e9;typeTick(0);return true}
/* extra topics in the main menu */
const LORE={village:'Eikendal is het oudste dorp van de streek. De grote eik op het plein stond er al voor er een huis was.',town:'De stad leeft van de handel. Op de markt hoor je meer nieuws dan in een hele week op het land.',castle:'De burcht van heer Valkenhorst bewaakt de pas. De muren zijn nooit ingenomen, zeggen ze.',hamlet:'Een handvol huizen, maar de mensen hier helpen elkaar altijd.',farm:'Het land hier is vruchtbaar. Alleen de wolven en goblins houden we liever buiten.',camp:'Het roverskamp? Blijf daar weg, tenzij je zelf een rover bent.',ruins:'De ruïnes zijn van een koninkrijk dat niemand meer kent. Ondoden spoken er rond.',cave:'In de Grot van Gruwel woont iets dat je niet wilt ontmoeten.',swamp:'In het Trollenmoeras zakken je laarzen weg en de trollen zijn groot.',giant:'Daar staat het portaal naar het Demonenrijk. Een wereld van lava, met een reus met vier handen.',dragon:'Op de berg broedt de draak Vyrnax op een berg goud.'};
const JOBLINE={smith:['Ik smeed al mijn hele leven. Een goed zwaard zingt als je het slijpt.','Breng me ijzer, dan maak ik iets moois voor je.'],merchant:['Ik koop goedkoop en verkoop eerlijk. Meestal.','Handel is als vissen: geduld en een goed aas.'],innkeeper:['Bij mij krijg je warm eten en een zacht bed.','Wie hier drinkt, vertelt verhalen. Ik hoor alles.'],guard:['Ik bewaak de weg en de mensen. Iemand moet het doen.','Rustig blijven, dan blijven we vrienden.'],farmer:['Van zonsopgang tot zonsondergang op het land.','Regen is goud voor mij, en wolven zijn de dieven.'],priest:['Ik zorg voor de zielen van Eikendal, en soms voor hun wonden.','Licht vind je ook op de donkerste plekken.'],lord:['Ik draag de zorg voor dit land. Het weegt zwaar.','Wie mijn mensen beschermt, kan op mijn dank rekenen.'],tailor:['Een goede mantel houdt je warm en maakt indruk.','Ik naai alles, behalve gebroken harten.'],villager:['Ik woon hier al mijn hele leven.','Niet veel bijzonders aan mij, maar ik ken iedereen.'],traveler:['Ik ben onderweg, altijd onderweg.','De wereld is groot. Ik wil alles zien.'],hermit:['Ik woon alleen, dat bevalt me best.','Het bos fluistert, als je stil genoeg bent.'],elf:['Mijn volk leefde hier lang voor het jouwe.','Het bos onthoudt alles wat je doet.'],witch:['Hihi, ik brouw wat je nodig hebt. Voor een prijs.','De sterren vertellen me dingen. Jou ook?']};
function placesFor(){const L=[];const pushS=(id,nm)=>{const s=SITE[id];if(s)L.push([nm||s.name,s.x,s.z])};
  for(const [id,s] of Object.entries(SITE||{}))if(s&&s.name&&!['bridge'].includes(id))L.push([s.name,s.x,s.z]);
  for(const a of actors)if(a.kind==='npc'&&!a.dead&&(a.job==='smith'||a.job==='innkeeper'||a.job==='priest')){const nm=(a.job==='smith'?'De smid':a.job==='innkeeper'?'De herberg':'De priester')+' ('+a.name+')';if(!L.some(x=>x[0].startsWith(nm.split(' (')[0])))L.push([nm,a.x,a.z])}
  for(const e of (window.GT&&GT.ents)||[])L.push(['Goblintunnels ('+e.nm+')',e.x,e.z]);
  return L.slice(0,14)}
function dirWord(dx,dz){const a=Math.atan2(dx,-dz)*180/Math.PI,dirs=['het noorden','het noordoosten','het oosten','het zuidoosten','het zuiden','het zuidwesten','het westen','het noordwesten'];return dirs[((Math.round(a/45)%8)+8)%8]}
function extraOpts(a,opts){const back=()=>dlgMain(a,pick(['Nog iets?','Wat nog meer?','Zeg het maar.']));const ins=[];
  ins.push(['Wie ben jij?',()=>{const L=JOBLINE[a.job]||JOBLINE.villager;showDlg(a,'Ik ben '+esc(a.name)+'. '+pick(L)+(a.friend>=60?' Voor jou maak ik graag tijd, vriend.':''),[['Aangenaam',back]])}]);
  ins.push(['Vertel me over deze plek',()=>{const s=siteAt(a.x,a.z),t=s&&LORE[s.id]||'Dit is een rustig stukje land. Maar verder weg wonen monsters, en onder de grond goblins.';showDlg(a,esc(t),[['Interessant',back]])}]);
  ins.push(['Waar vind ik...?',()=>{const L=placesFor();showDlg(a,'Waar wil je heen?',L.map(([nm,x,z])=>[nm,()=>{const d=Math.hypot(x-PL.x,z-PL.z),w=d<60?'vlakbij':Math.round(d/10)*10+' passen';PL.nav={x,z,name:nm};
    showDlg(a,esc(nm)+' ligt '+(d<60?'hier vlakbij':'richting '+dirWord(x-PL.x,z-PL.z)+', ongeveer '+w)+'. Ik heb het op je kaart aangewezen.',[['Bedankt!',back]]);addLog('📍 Route naar '+nm+' staat op je kaart.','#7fd0ff')}]).concat([['Laat maar',back]]))}]);
  const gifts=Object.keys(PL.inv).filter(id=>{const it=ITEMS[id];return it&&(it.g==='food'||id==='gem'||id==='herb'||id==='flower'||id==='fur')});
  if(gifts.length)ins.push(['Geef een cadeau',()=>showDlg(a,'Voor mij? Wat lief.',gifts.slice(0,8).map(id=>[ITEMS[id].n,()=>{takeItem(id,1);const v=id==='gem'?18:ITEMS[id].g==='food'?7:5;a.friend=Math.min(100,(a.friend||0)+v);sfx('quest');
    let t=pick(['Dank je wel! Dat waardeer ik echt.','Wat attent van je!','Hier word ik blij van.']);if(a.friend>=60&&!a.gifted){a.gifted=true;const g=pick(['potion','elixir','gem','str_potion']);giveItem(g,1);t+=' Neem dit van mij, als dank.'}showDlg(a,t,[['Graag gedaan',back]])}]).concat([['Toch niet',back]]))]);
  const v=opts.pop();return opts.concat(ins,[v])}
/* greetings that notice the time, the weather, your power and your deeds */
const _gr=greeting;greeting=function(a){let g=_gr(a);const t=tod(),w=ENV.weather,bits=[];
  if(Math.random()<.5)g=(t==='ochtend'?'Goedemorgen! ':t==='middag'?'Goedemiddag! ':t==='avond'?'Goedenavond. ':'Zo laat nog op pad? ')+g;
  if(w==='rain'||w==='storm')bits.push(pick(['Wat een regen, hè.','Kom even uit dat weer.']));
  if(PL.power&&Math.random()<.4){const ln={time:'Soms lijkt de tijd even stil te staan als jij praat.',space:'Er twinkelen sterretjes om je heen. Hoe doe je dat?',rune:'Op je handen gloeien oude runen.',nature:'Waar jij loopt, groeien bloemen.',wind:'Er waait altijd een briesje om je heen.',sun:'Je ogen glanzen als de maan.'}[PL.power];if(ln)bits.push(ln)}
  if(PL.kills&&PL.kills.boss_vierhand)bits.push('Ben jij degene die de Reuzen-Vierhand versloeg? Ongelooflijk!');else if(PL.kills&&PL.kills.boss_grukk&&Math.random()<.6)bits.push('Ze zeggen dat jij Grukk hebt verslagen. Dank je!');
  if((a.friend||0)>=80)bits.push('Fijn je weer te zien, mijn vriend.');
  return g+(bits.length?' '+pick(bits):'')};
const _od=openDialog;openDialog=function(a){const day=Math.floor(PL.t/300);if(a.talkDay!==day){a.talkDay=day;a.friend=Math.min(100,(a.friend||0)+4)}DLG.a=a;_od(a)};
/* closing: bars away, camera back */
const _cm=closeModals;closeModals=function(){_cm();endTalk()};
const _cm1=closeModals1;closeModals1=function(){_cm1();endTalk()};
function endTalk(){if(!DLG.a)return;DLG.a=null;DLG.typing=false;document.body.classList.remove('talking')}
setInterval(()=>{const d=$('dlg'),s=$('shop');if(DLG.a&&d.style.display!=='block'&&s.style.display!=='block')endTalk()},300);
/* the world does not pause while you talk (index.html asks modalLive) */
const _amR=anyModal;anyModal=function(){return _amR()||!!document.getElementById('pwrit')};
window.modalLive=function(){if(cust.open||document.getElementById('pwrit'))return false;const open=['dlg','inv','mapw','shop','pause'].filter(i=>$(i).style.display==='block');if(!open.length)return true;
  if(window.MP&&MP.room)return true;return open.every(i=>i==='dlg'||i==='shop')};
/* NPC: stop, face you, talk with hands; you face them */
const _unD=updateNPC;updateNPC=function(a,dt){if(a!==DLG.a)return _unD(a,dt);a.vel=0;a.talk=null;a.route=null;a.wp=null;a.rot+=angDiff(a.rot,Math.atan2(PL.x-a.x,PL.z-a.z))*Math.min(1,dt*6);if(a.sayT>0)a.sayT-=dt;if(a.h)animHuman(a.h,dt,0,{})};
ANIMS.push(dt=>{typeTick(dt);const a=DLG.a;if(!a)return;const d=Math.hypot(a.x-PL.x,a.z-PL.z);if(d>6.5||a.dead||PL.dead){closeModals();return}
  if((PL.speed||0)<.2){PL.rot+=angDiff(PL.rot,Math.atan2(a.x-PL.x,a.z-PL.z))*Math.min(1,dt*6)}});
const _dpD=damagePlayer;damagePlayer=function(d,s){const h0=PL.hp;_dpD(d,s);if(DLG.a&&PL.hp<h0){closeModals();addLog('Je wordt aangevallen!','#e5766a')}};
/* cinematic camera: over your shoulder onto their face */
const _ucD=updateCamera;updateCamera=function(dt){_ucD(dt);const a=DLG.a;if(!a||PL.fp){DLG.cam=null;return}
  const hh=(a.h&&a.h.scale||1)*1.62,fy=a.y+hh-.05,px=PL.x,pz=PL.z,dx=a.x-px,dz=a.z-pz,l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l,rx=uz,rz=-ux;
  const tx=px-ux*1.25+rx*.85,ty=PL.y+1.85,tz=pz-uz*1.25+rz*.85;if(!DLG.cam)DLG.cam=camera.position.clone();
  DLG.cam.lerp(_v.set(tx,ty,tz),Math.min(1,dt*3.2));camera.position.copy(DLG.cam);camera.lookAt(a.x-ux*.1,fy,a.z-uz*.1)};
const _v=new T.Vector3();
/* keys while talking */
addEventListener('keydown',e=>{if(!DLG.a||$('dlg').style.display!=='block'||(e.target&&e.target.tagName==='INPUT'))return;
  const m=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);
  if(m){e.preventDefault();e.stopImmediatePropagation();if(finishType())return;const b=$('dlg').querySelectorAll('.do button')[+m[1]-1];if(b)b.click();return}
  if(e.code==='Space'||e.code==='Enter'||e.code==='KeyF'){e.preventDefault();e.stopImmediatePropagation();if(!finishType()&&(e.code==='Enter'))$('dlg').querySelector('.do button')?.click()}},true);
/* directions: a marker on the minimap until you arrive */
const _dmN=drawMini;drawMini=function(){_dmN();const n=PL.nav;if(!n||PL.inCave)return;const d=Math.hypot(n.x-PL.x,n.z-PL.z);if(d<18){PL.nav=null;addLog('Je bent bij '+n.name+'.','#7fd0ff');return}
  const c=$('mini'),g=c.getContext('2d'),S=150,k=S/210;let dx=(n.x-PL.x)*k,dz=(n.z-PL.z)*k;const dd=Math.hypot(dx,dz),m=64;if(dd>m){dx*=m/dd;dz*=m/dd}
  g.fillStyle='#7fd0ff';g.strokeStyle='#08263a';g.lineWidth=2;g.beginPath();g.arc(S/2+dx,S/2+dz,5,0,6.283);g.fill();g.stroke();g.fillStyle='#fff';g.font='bold 9px sans-serif';g.textAlign='center';g.fillText(Math.round(d)+'m',S/2+dx,S/2+dz-8)};

/* ================= start ================= */
function boot0(){if(document.getElementById('title'))return;titleScreen()}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot0);else boot0();
})();

/* ================= The character preview: bigger, sharper, lit like a studio portrait =================
   The model used to be drawn small and flat in a corner of the preview box. Now the canvas fills the box at full
   screen sharpness, with a warm key light, a cool fill light, a rim light from behind, a soft shadow on the floor,
   and the camera moves in on the face on the "Hoofd en haar" tab. */
(function(){
const _icp=initCustPreview;initCustPreview=function(){const first=!cust.r;_icp.apply(this,arguments);if(!first||!cust.r||cust.studio)return;cust.studio=true;
  const r=cust.r,S=cust.scene;r.toneMapping=T.NoToneMapping;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
  S.children.filter(o=>o.isLight).forEach(o=>S.remove(o));
  S.add(new T.HemisphereLight(0xcfdcf0,0x3a2f24,.62));
  const key=new T.DirectionalLight(0xffe6cc,1.25);key.position.set(2.4,4.2,3.4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-1.6,right:1.6,top:2.6,bottom:-.6,near:.5,far:14});key.shadow.bias=-.0006;S.add(key);
  const fill=new T.DirectionalLight(0x9ab6ff,.42);fill.position.set(-3.2,2,2.4);S.add(fill);
  const rim=new T.DirectionalLight(0xfff4e0,.95);rim.position.set(-1.4,3.2,-4);S.add(rim);
  const floor=new T.Mesh(new T.CircleGeometry(1.6,48),new T.ShadowMaterial({opacity:.42}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S.add(floor);
  const ring=new T.Mesh(new T.RingGeometry(1.05,1.11,64),new T.MeshBasicMaterial({color:0xe0b04a,transparent:true,opacity:.3}));ring.rotation.x=-Math.PI/2;ring.position.y=.004;S.add(ring);
  cust.cam.fov=24;const cv=$('cpv');cv.style.width='100%';cv.style.height='100%';cv.style.display='block';
};
/* never the blocky stand-in: if the real character models are not loaded yet, load them and redraw the model */
const _oc=openCust;openCust=function(cls){_oc(cls);if(window.loadCharAssets)loadCharAssets().then(ok=>{if(ok&&cust.open)try{rebuildPreview()}catch(e){}}).catch(()=>{})};
const _uc=updateCust;updateCust=function(dt){if(cust.open&&cust.r&&cust.studio){const cv=$('cpv'),w=cv.clientWidth,h=cv.clientHeight,pr=Math.min(2,devicePixelRatio||1);
    if(w>10&&h>10&&(cv.width!==Math.round(w*pr)||cv.height!==Math.round(h*pr))){cust.r.setPixelRatio(pr);cust.r.setSize(w,h,false);cust.cam.aspect=w/h;cust.cam.updateProjectionMatrix()}
    if(cust.model&&cust.model.g)cust.model.g.traverse(o=>{if(o.isMesh&&!o.userData.cs){o.userData.cs=1;o.castShadow=true}});
    const head=/hoofd/i.test(custTab||''),ty=head?1.56:.98,d=head?1.45:1.06/Math.tan(cust.cam.fov*Math.PI/360),k=Math.min(1,(dt||.016)*5);
    cust.camT=cust.camT||{y:ty,d};cust.camT.y+=(ty-cust.camT.y)*k;cust.camT.d+=(d-cust.camT.d)*k;cust.cam.position.set(0,cust.camT.y+(head?.04:.15),cust.camT.d);cust.cam.lookAt(0,cust.camT.y,0)}
  return _uc(dt)};
})();

/* ================= More choices in the character screen, and none that do nothing =================
   The face shapes belonged to the old blocky heads; the real heads have one face, so that row is gone. New: hat colour,
   boots, a necklace, how strong the colours of your clothes are, and more hats (wizard hat, horned helmet, crown...). */
(function(){
for(const h of[['wizard','Tovenaarshoed'],['horned','Hoorns'],['elven','Elfenkap'],['crown','Kroontje']])if(!HATS.some(x=>x[0]===h[0]))HATS.push(h);
const HATC=[0x3a2a1a,0x6a3a2a,0x2f4a7a,0x3a5a2a,0x7a1f2a,0x5a3a7a,0xc9a13a,0xe8e0d0,0x222226],BOOTS=[null,0x2a1f16,0x5a3a22,0x3a3a3e,0x7a5a3a,0x1f2a3a],NECK=[null,0xe0b04a,0xcfd6dc,0xc0392b,0x3f6fa5,0x4f9a4a];
const _poK=playerOpts;playerOpts=function(){const o=_poK(),lk=PL.look,E=PL.eq,hd=ITEMS[E.head],bt=ITEMS[E.boots],am=ITEMS[E.amulet];
  /* the headwear you choose is what you wear, never the hood or cap of your cloak ("Geen" means none); a real helmet of armour or a hat you wear as gear still wins */{const ar=ITEMS[E.armor];if(!(hd&&hd.hat)&&!(ar&&ar.armor))o.hat=lk.hat||null}
  if(lk.hatc!=null&&!(hd&&hd.hatc))o.hatc=lk.hatc;if(lk.bootc&&!(bt&&bt.col))o.boots=lk.bootc;if(lk.neck&&!(am&&am.col))o.amulet=lk.neck;if(lk.tintK!=null&&!o.armor&&!o.magic)o.tint=lk.tintK;return o};
const _rcK=renderCust;renderCust=function(){_rcK();const c=$('cctl');if(!c)return;
  /* fabric colour and clothing style are gone everywhere */const drop=custTab==='basis'?['Kledingstijl','Stofkleur']:['Lichaam','Kledingstijl','Stofkleur'];
  for(const l of c.querySelectorAll('label')){const t=l.textContent.trim();if((/^Gezicht$/i.test(t)||drop.includes(t))&&l.parentElement&&l.parentElement!==c)l.parentElement.remove()}
  if(custTab==='kleur'){c.appendChild(sw('Hoedkleur',HATC,'hatc'));c.appendChild(opts('Kleurkracht van je kleding',[[.2,'Zacht'],[.34,'Normaal'],[.55,'Fel']],'tintK'))}
  /* the clothing tab, written anew in one clear order: a whole outfit (no more mixing loose pieces), then its colours,
     cloak, headwear, boots and necklace */
  if(custTab==='kleding'){c.innerHTML='';const lk=PL.look,mix=lk.mix&&/^(pppp|rrrr)[01]$/.test(lk.mix)?lk.mix:(lk.outfit==='ranger'?'rrrr0':'pppp0');
    const box=document.createElement('div');box.innerHTML='<label>Kleding</label>';[['pppp0','Boerenkleding'],['pppp1','Boer met schouderstuk'],['rrrr0','Woudloper'],['rrrr1','Woudloper met schouderstuk']].forEach(([v,n])=>{const bt=document.createElement('button');bt.type='button';bt.className='ob'+(mix===v?' on':'');bt.textContent=n;bt.onclick=()=>{lk.mix=v;lk.outfit=v[0]==='r'?'ranger':'peasant';renderCust()};box.appendChild(bt)});c.appendChild(box);
    c.appendChild(sw('Kleur van je kleding',COLS_T,'tunic'));c.appendChild(sw('Kleur van je broek',COLS_P,'pants'));c.appendChild(sw('Mantel',COLS_C,'cape'));c.appendChild(opts('Hoofddeksel',HATS,'hat'));
    c.appendChild(opts('Laarzen',BOOTS.map((v,i)=>[v,['Bij je kleding','Donkerbruin','Bruin','IJzergrijs','Zand','Nachtblauw'][i]]),'bootc'));c.appendChild(opts('Ketting',NECK.map((v,i)=>[v,['Geen','Goud','Zilver','Robijn','Saffier','Smaragd'][i]]),'neck'));
    const nt=document.createElement('div');nt.style.cssText='font-size:13px;color:var(--mute);margin-top:6px';nt.textContent='Draag je een harnas, dan zie je het harnas met zijn eigen kleur in plaats van deze kleding.';c.appendChild(nt)}
  try{rebuildPreview()}catch(e){}};
})();
