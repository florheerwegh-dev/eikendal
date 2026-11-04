/* Eikendal multiplayer, part two: one shared world.
   Everything travels in presence, the one channel every player may use (on claude.ai events are for editors only):
   - the world is generated from the same seed for everyone, so every monster has the same number (sid) on every screen
   - hits and kills on those monsters are shared, with a group bonus for players nearby
   - the first player in the room sets the time of day and the weather for everyone
   - other players show their level and health, their superpower casts and their emotes
   - a player list (O) to see everyone, follow them or travel to them */
(function(){
'use strict';
const $=id=>document.getElementById(id);
/* ---------- the same world for everyone ---------- */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SYNC={byS:new Map(),n0:0,R0:null,seq:0,hits:[],kills:[],cast:null,emote:null,peerSeq:new Map(),host:false,myPeer:null};window.SYNC=SYNC;
const _pop=populate;
populate=function(){SYNC.R0=Math.random;Math.random=mulberry(0x5EED1E);SYNC.n0=NID;try{return _pop.apply(this,arguments)}catch(e){Math.random=SYNC.R0;throw e}};
const _pfM=populateFantasy;
populateFantasy=function(){try{return _pfM.apply(this,arguments)}finally{if(SYNC.R0){Math.random=SYNC.R0;SYNC.R0=null}let s=0;for(const a of actors){if(a.id>SYNC.n0&&(a.kind==='enemy'||a.kind==='animal')){a.sid=++s;SYNC.byS.set(a.sid,a)}}SYNC.count=s}};

/* ---------- local events into presence ---------- */
const _haM=hitActor;
hitActor=function(a,dmg,byPlayer,dir){const alive=a&&!a.dead;_haM(a,dmg,byPlayer,dir);if(!MP.room||!byPlayer||!a||!a.sid||!alive)return;
  SYNC.hits.push([++SYNC.seq,a.sid,Math.max(0,Math.round(a.hp)),Math.round(dmg)]);if(SYNC.hits.length>8)SYNC.hits.shift();MP.t=Math.min(MP.t,.03)};
const _kaM=killActor;
killActor=function(a,byPlayer){const was=a.dead;_kaM(a,byPlayer);if(!was&&byPlayer&&MP.room&&a.sid){SYNC.kills.push([++SYNC.seq,a.sid,a.xp||10]);if(SYNC.kills.length>6)SYNC.kills.shift();MP.t=0}};
const _pcM=window.pwCast;
if(typeof pwCast==='function'){const o=pwCast;pwCast=function(i){const cd=PW.cd[i];const r=o.apply(this,arguments);if(MP.room&&PW.cd[i]>cd+.01){let p=null;try{p=pwAim(55)}catch(e){}SYNC.cast=[++SYNC.seq,i,+(p?p.x:PL.x).toFixed(1),+(p?p.y:PL.y).toFixed(1),+(p?p.z:PL.z).toFixed(1)];MP.t=0}return r}}
if(typeof pwBasic==='function'){const o=pwBasic;pwBasic=function(){const cd=PW.cdB||0;const r=o.apply(this,arguments);if(MP.room&&(PW.cdB||0)>cd+.01){let p=null;try{p=pwAim(55)}catch(e){}SYNC.cast=[++SYNC.seq,-1,+(p?p.x:PL.x).toFixed(1),+(p?p.y:PL.y).toFixed(1),+(p?p.z:PL.z).toFixed(1)]}return r}}
/* everything extra rides along with the existing presence update */
function extraPresence(){const o={lv:PL.lvl|0,hm:Math.round(PL.hpMax),pw:PL.power||null,hx:SYNC.hits,kx:SYNC.kills,cs:SYNC.cast,em:SYNC.emote,ws:SYNC.count||0};
  if(SYNC.host){o.tm=+ENV.time.toFixed(3);o.wx=ENV.weather}else{o.tm=null;o.wx=null}return o}
{const wrapRoom=r=>{if(!r||r.__ex)return r;return{__ex:1,name:r.name,
    presence:patch=>r.presence(Object.assign({},patch,extraPresence())),peers:()=>r.peers(),onPeers:(f,e)=>r.onPeers(f,e),
    emit:(t,d)=>r.emit?r.emit(t,d):Promise.resolve(),on:(t,f,e)=>r.on?r.on(t,f,e):()=>{},connected:()=>r.connected?r.connected():true,leave:()=>r.leave?r.leave():Promise.resolve()}};
  const _mc=mpConnect;mpConnect=async function(name){const ok=await _mc(name);if(ok&&MP.room){MP.room=wrapRoom(MP.room);document.body.classList.add('mp');mpListBtn()}return ok};
  const _ml=mpLeave;mpLeave=function(){_ml();document.body.classList.remove('mp');SYNC.peerSeq.clear()}}

/* ---------- remote events: apply them to our copy of the world ---------- */
const PCOL={fire:0xff6a1a,ice:0x6ad6ff,bolt:0x9fb4ff,light:0xffd96a,str:0xe8933a,shadow:0xa46bff};
function applyPeer(id,a,pr){let st=SYNC.peerSeq.get(id);if(!st){st={h:0,k:0,c:0,e:0,first:true};SYNC.peerSeq.set(id,st)}
  const near=(t,r)=>Math.hypot(t.x-(+pr.x||0),t.z-(+pr.z||0))<r;
  if(Array.isArray(pr.hx))for(const ev of pr.hx){if(!Array.isArray(ev))continue;const [q,sid,hp,dmg]=ev;if(!(q>st.h))continue;st.h=q;if(st.first)continue;const t=SYNC.byS.get(sid);if(!t||t.dead||!near(t,90))continue;
    if(typeof hp==='number'&&hp<t.hp){t.hp=Math.max(0,hp);t.flash=.15;try{floatText(t.x,t.y+(t.hh||2),t.z,Math.round(+dmg||0),'#9fd0ff')}catch(e){}if(t.h&&t.h.sk&&t.h.atk<=0){}}
    if(t.hp<=0&&!t.dead){t.hp=0;killActor(t,false)}}
  if(Array.isArray(pr.kx))for(const ev of pr.kx){if(!Array.isArray(ev))continue;const [q,sid,xp]=ev;if(!(q>st.k))continue;st.k=q;if(st.first)continue;const t=SYNC.byS.get(sid);if(t&&!t.dead&&near(t,90)){t.hp=0;killActor(t,false)}
    if(t&&Math.hypot(t.x-PL.x,t.z-PL.z)<70&&!PL.dead){const g=Math.max(1,Math.round((+xp||10)*.5));giveXp(g);addLog('Groepsbonus: +'+g+' xp ('+a.name+' versloeg '+(t.name||'een vijand')+')','#7fd0ff')}}
  if(Array.isArray(pr.cs)&&pr.cs[0]>st.c){const [q,i,x,y,z]=pr.cs;st.c=q;if(!st.first&&pr.pw&&PWR[pr.pw]&&Math.hypot(x-PL.x,z-PL.z)<160)castFx(a,pr.pw,i,+x,+y,+z)}
  if(Array.isArray(pr.em)&&pr.em[0]>st.e){st.e=pr.em[0];if(!st.first)playEmote(a.h,pr.em[1],a)}
  st.first=false}
function castFx(a,pw,i,x,y,z){if(!window.PW||!PW.ps)return;if(window.pwPeerFx){try{if(pwPeerFx(a,pw,i,x,y,z))return}catch(e){}}const pal=PC[PWR[pw].pal]||PC.fire,col=new T.Color(pal[1][0],pal[1][1],pal[1][2]);
  const hx=a.x,hy=a.y+1.4,hz=a.z;try{
    if(pw==='bolt')pwBolt(hx,hy,hz,x,y+.6,z,pal,i===2?1.6:1);
    else{const n=14;for(let k=0;k<n;k++){const t=k/n;pwEm(PW.ps,hx+(x-hx)*t,hy+(y+.6-hy)*t,hz+(z-hz)*t,0,.3,0,.4,.25,.05,pal[0],pal[2],.9,0,1)}}
    const r=i===2?6:i===1?4:2;pwBurst(PW.ps,x,y+.6,z,Math.round(16+r*6),r*2,.55,.5+r*.1,.05,pal[0],pal[1],1.5,2,1,1.6);
    const rm=pwRingMesh(x,z,.4,col,.9,true);PW.zones.push({u(dt){this.t=(this.t||0)+dt;const k=this.t/.45;rm.set(.9*(1-k),.4+r*k);if(k>=1){rm.kill();return true}}});
    pwLight(col,1.6,x,y+1,z)}catch(e){}}
/* ---------- emotes ---------- */
const EMOTES={dans:['Dance_Loop',4],ja:['Interact',1.6],nee:['Idle_No_Loop',1.8],zit:['Sitting_Idle_Loop',5],juich:['Jump_Loop',1.4],zwaai:['Interact',1.4],knie:['Fixing_Kneeling',4],armen:['Idle_FoldArms_Loop',4],lach:['Idle_Talking_Loop',2.5],tover:['Spell_Simple_Idle_Loop',3]};/* WD only exists once eikendal-world.js has run */addEventListener('load',()=>{if(window.WD)WD.emotes={EMOTES,play:(k)=>doEmote(k)}});
function playEmote(h,k,a){const e=EMOTES[k];if(!h||!e)return;if(h.sk){h.onceName=e[0];h.onceT=e[1]}if(a&&a.g){try{mpBubble(a,{dans:'💃',ja:'👍',nee:'👎',zit:'🪑',juich:'🎉',zwaai:'👋',knie:'🙇',armen:'💪',lach:'😂',tover:'✨'}[k]||'')}catch(x){}}}
function doEmote(k){if(!EMOTES[k])return false;SYNC.emote=[++SYNC.seq,k];MP.t=0;playEmote(pm,k);return true}
/* chat commands: /dans /ja /nee /zit /juich /zwaai, and /spelers */
{const _cp=chatPush;chatPush=function(name,text,self){if(self&&typeof text==='string'&&text[0]==='/'){const k=text.slice(1).trim().toLowerCase();if(k==='spelers'||k==='who'){togglePlayers(true);return}if(doEmote(k))return}return _cp(name,text,self)}}
{const q=CHAT.q;const push=q.push.bind(q);q.push=function(m){if(m&&typeof m.t==='string'&&m.t[0]==='/'&&(EMOTES[m.t.slice(1).trim().toLowerCase()]||/^\/(spelers|who)$/i.test(m.t.trim())))return q.length;return push(m)}}

/* ---------- shared time and weather; host = the first player by peer label ---------- */
let syncT=0;
ANIMS.push(dt=>{if(!MP.room||!started)return;syncT-=dt;if(syncT>0)return;syncT=.5;let peers=[];try{peers=MP.room.peers()||[]}catch(e){}
  const me=peers.find(p=>p.sameTab);SYNC.myPeer=me?me.peer:null;const all=peers.filter(p=>p.kind==='viewer'&&p.presence&&typeof p.presence.x==='number').map(p=>p.peer).concat(SYNC.myPeer?[SYNC.myPeer]:[]).sort();
  SYNC.host=!all.length||all[0]===SYNC.myPeer;
  if(!SYNC.host){const hp=peers.find(p=>p.peer===all[0]);const pr=hp&&hp.presence;if(pr&&typeof pr.tm==='number'){let d=pr.tm-ENV.time;if(d>12)d-=24;if(d<-12)d+=24;if(Math.abs(d)>.6)ENV.time=pr.tm;else ENV.time=(ENV.time+d*.3+24)%24;
    if(pr.wx&&typeof pr.wx==='string'&&WXN[pr.wx]&&ENV.weather!==pr.wx){ENV.weather=pr.wx;ENV.wxT=999;$('wx').textContent=WXN[pr.wx]}}}
  else if(ENV.wxT>500)ENV.wxT=rnd(110,240)});

/* ---------- remote players: level and health above their heads ---------- */
function labelTex(name,lv,hp,hm,pw){const c=document.createElement('canvas');c.width=320;c.height=72;const x=c.getContext('2d');x.fillStyle='rgba(0,0,0,.55)';x.fillRect(8,4,304,64);
  x.font='bold 26px sans-serif';x.textAlign='center';x.fillStyle='#9fd0ff';x.fillText((pw&&PWR[pw]?PWR[pw].ic+' ':'')+String(name).slice(0,16)+'  · '+(lv||1),160,32);
  x.fillStyle='#300';x.fillRect(40,44,240,12);x.fillStyle=hp/hm>.35?'#5ad04a':'#e0442a';x.fillRect(40,44,240*Math.max(0,Math.min(1,hp/Math.max(1,hm))),12);x.strokeStyle='#000';x.strokeRect(40,44,240,12);
  const t=new T.CanvasTexture(c);return t}
function refreshLabel(a){const pr=a.pr||{},k=[pr.lv,pr.hp,pr.hm,pr.pw,a.name].join('|');if(a.lblK===k)return;a.lblK=k;
  let s=a.g.children.find(o=>o.isSprite&&o.userData.lbl);if(!s){s=a.g.children.find(o=>o.isSprite&&!o.userData.bub&&o!==a.bub);if(s)s.userData.lbl=1}
  if(!s)return;const t=labelTex(a.name,pr.lv,+pr.hp||0,+pr.hm||100,pr.pw);if(s.material.map)s.material.map.dispose();s.material.map=t;s.material.needsUpdate=true;s.scale.set(2.8,.63,1);s.position.y=2.55}
/* light aura for players with a power */
ANIMS.push(dt=>{if(!MP.room||!window.PW||!PW.ps)return;for(const a of MP.peers.values()){const pr=a.pr||{};if(!a.g.visible)continue;refreshLabel(a);if(pr.pw&&PWR[pr.pw]&&Math.random()<dt*3){const pal=PC[PWR[pr.pw].pal]||PC.fire;pwEm(PW.ps,a.x+rnd(-.4,.4),a.y+rnd(.2,1.6),a.z+rnd(-.4,.4),0,.6,0,.7,.12,.02,pal[0],pal[2],.7,0,.5)}}});
/* process remote presence every sync */
{const _ms=mpSync;mpSync=function(){_ms();if(!MP.room)return;let peers=[];try{peers=MP.room.peers()}catch(e){}for(const p of peers){if(p.sameTab||p.kind!=='viewer')continue;const a=MP.peers.get(p.peer);if(a&&p.presence)try{applyPeer(p.peer,a,p.presence)}catch(e){console.warn('mp',e)}}}}
/* presence changes arrive through onPeers, but also poll in case a quiet peer only changed hit lists */
setInterval(()=>{if(MP.room&&started)try{mpSync()}catch(e){}},400);

/* ---------- player list (O): follow or travel ---------- */
const css=t=>{const s=document.createElement('style');s.textContent=t;document.head.appendChild(s)};
css('#mplist{position:fixed;z-index:22;left:50%;top:calc(76px + env(safe-area-inset-top,0px));transform:translateX(-50%);width:min(520px,calc(100vw - 24px));display:none;padding:10px 12px}#mplist h3{font-size:20px;margin-bottom:6px}#mplist .pr{display:flex;align-items:center;gap:8px;border-top:1px solid rgba(224,176,74,.18);padding:6px 0;font-size:14px}#mplist .pr b{color:#9fd0ff;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#mplist .pr small{color:var(--mute)}#mplist .btn{padding:3px 9px;font-size:13px;margin:0}#mplist .em{margin-top:8px;display:flex;gap:5px;flex-wrap:wrap}#mpemo .ob{font-size:15px}');
function mpListBtn(){if(MP.el&&!MP.el._ex){MP.el._ex=1;MP.el.style.pointerEvents='auto';MP.el.style.cursor='pointer';MP.el.title='Spelerslijst (O)';MP.el.addEventListener('mousedown',e=>e.stopPropagation());MP.el.onclick=()=>togglePlayers()}}
function togglePlayers(force){let d=$('mplist');if(!d){d=document.createElement('div');d.id='mplist';d.className='panel';document.body.appendChild(d);d.addEventListener('mousedown',e=>e.stopPropagation())}
  const show=force===true||d.style.display!=='block';d.style.display=show?'block':'none';if(show){renderPlayers();try{document.exitPointerLock()}catch(e){}}else if(started&&!anyModal())lock()}
function renderPlayers(){const d=$('mplist');if(!d||d.style.display!=='block')return;
  let h='<h3>Spelers in '+esc(MP.name||'')+'</h3><div class="pr"><b>'+esc(PL.look.name||'Jij')+' (jij)</b><small>niv. '+PL.lvl+(PL.power?' · '+PWR[PL.power].ic:'')+(SYNC.host?' · bepaalt tijd en weer':'')+'</small></div>';
  for(const [k,a] of MP.peers){const pr=a.pr||{},d2=Math.round(Math.hypot(a.x-PL.x,a.z-PL.z));h+='<div class="pr"><b>'+esc(a.name)+'</b><small>niv. '+(pr.lv||1)+(pr.pw&&PWR[pr.pw]?' · '+PWR[pr.pw].ic:'')+' · '+(pr.dd?'gevallen':Math.round(+pr.hp||0)+' hp')+' · '+(d2>2000?'ver weg':d2+' m')+'</small><button class="btn" data-f="'+esc(k)+'">Volg</button><button class="btn" data-g="'+esc(k)+'">🎁 50 goud</button><button class="btn" data-t="'+esc(k)+'">Reis erheen</button></div>'}
  if(!MP.peers.size)h+='<div style="color:var(--mute);font-size:13px;margin-top:6px">Nog niemand anders in deze wereld. Vrienden kiezen dezelfde servernaam.</div>';
  {const on=!(PL.fx&&PL.fx.pvp===false);h+='<div style="margin-top:8px"><button class="btn'+(on?' pri':'')+'" id="pvptog">⚔ Vechten tegen spelers: '+(on?'AAN':'UIT')+'</button> <small style="color:var(--mute)">Je kunt elkaar alleen raken als het bij allebei aan staat.</small></div>'}
  h+='<div class="em" id="mpemo">'+Object.keys(EMOTES).map(k=>'<button class="ob" data-e="'+k+'">/'+k+'</button>').join('')+'</div><div style="font-size:12px;color:var(--mute);margin-top:6px">O = deze lijst · T = chatten · emotes ook via de chat, bijvoorbeeld /dans</div>';
  d.innerHTML=h;
  d.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const a=MP.peers.get(b.dataset.f);if(!a)return;PL.nav={x:a.x,z:a.z,name:a.name,peer:b.dataset.f};addLog('Je volgt '+a.name+' op de kaart.','#7fd0ff');togglePlayers(false)});
  d.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const a=MP.peers.get(b.dataset.t);if(!a)return;if(actors.some(e=>!e.dead&&e.kind==='enemy'&&e.state==='chase'&&Math.hypot(e.x-PL.x,e.z-PL.z)<25)){addLog('Je kunt niet reizen tijdens een gevecht.','#e5766a');return}
    if(PL.mounted)dismount();const an=Math.random()*6.283;PL.x=a.x+Math.cos(an)*2.5;PL.z=a.z+Math.sin(an)*2.5;PL.y=(a.pr&&a.pr.c)?a.y:groundH(PL.x,PL.z);PL.vy=0;try{pwFlash('#9fd0ff',.5,.8)}catch(e){}sfx('quest');addLog('Je reist naar '+a.name+'.','#7fd0ff');togglePlayers(false)});
  d.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>doEmote(b.dataset.e));
  d.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{try{WD.samen.give(b.dataset.g,50)}catch(e){}});{const pv=$('pvptog');if(pv)pv.onclick=()=>{try{WD.samen.togglePvp();renderPlayers()}catch(e){}}}}
setInterval(renderPlayers,1000);
addEventListener('keydown',e=>{if(!started||(e.target&&e.target.tagName==='INPUT')||!MP.room)return;if(e.code==='KeyO'){e.preventDefault();togglePlayers()}});
/* following a player keeps the marker on them */
setInterval(()=>{const n=PL.nav;if(n&&n.peer){const a=MP.peers.get(n.peer);if(!a){PL.nav=null;return}n.x=a.x;n.z=a.z}},300);
/* other players on the big map too */
if(typeof drawBigMap==='function'){const _db=drawBigMap;drawBigMap=function(){_db.apply(this,arguments);if(!MP.room||!MP.peers.size)return;const c=$('bigmap');if(!c)return;const g=c.getContext('2d'),k=c.width/(HALF*2);
  for(const a of MP.peers.values()){const x=(a.x+HALF)*k,z=(a.z+HALF)*k;if(x<0||z<0||x>c.width||z>c.height)continue;g.fillStyle='#7fd0ff';g.strokeStyle='#08263a';g.lineWidth=3;g.beginPath();g.arc(x,z,9,0,6.283);g.fill();g.stroke();g.font='bold 22px sans-serif';g.textAlign='center';g.fillStyle='#fff';g.strokeText(a.name,x,z-14);g.fillText(a.name,x,z-14)}}}
})();
