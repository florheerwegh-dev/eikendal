/* ================= Titans: the Reuzen-Vierhand, De Kraak and the Yeti as real end bosses =================
   At level 20 these bosses used to die in seconds. Now they are a real challenge, even at level 30:
   - they have tens of thousands of hit points, and grow stronger the higher your level is (above level 20);
   - no single blow takes off more than a sliver of their life, so no power or weapon kills them in one go;
   - at 75%, 50% and 25% they become untouchable behind a shield, linked to four cores that you must break first
     (De Kraak dives under water meanwhile), and they call helpers;
   - big telegraphed attacks hit for half of your life: watch the red circles and roll (X) or run;
   - the Vierhand and the Yeti send out a shock wave you have to jump over; De Kraak spits ink that blinds you;
   - below 20% they rage, and after six minutes of fighting they go berserk.
   De Kraak also drops the Schelp van de Diepte: wear it in the gear slot "Heerschap" and every living thing of the
   sea and the rivers obeys you (Fenrik's whistle commands the wolves, the Seal of the Dead the skeletons).
   Y switches their order: follow me, attack, or stay. */
(function(){
const TT={
  fourhands:{n:'Reuzen-Vierhand',hp:16000,dmg:70,xp:9000,easy:true,next:[.5],cap:.03,coreK:.4,slamK:.22,waveK:.15,lvlK:.03,lvlD:.02,col:0xff5a1a,pal:'fire',core:'Vuurkern',adds:['lavaturtle','skeleton','skeleton'],wave:true,coreR:[22,30]},
  kraken:{n:'De Kraak',hp:55000,dmg:135,xp:8000,col:0x2affc0,pal:'ice',core:'Inktkristal',adds:['serpent','piranha','piranha','piranha'],ink:true,dive:true,coreR:[16,26]},
  yeti:{n:'Yeti Ysgrauw',hp:62000,dmg:160,xp:8500,col:0x9ad8ff,pal:'ice',core:'IJskern',adds:['wolf','wolf','skeleton'],wave:true,coreR:[18,26]}};
WD.titans=TT;
const lv=()=>Math.max(0,(PL.lvl||1)-20);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
/* warning circles and their effects also run for players without a superpower */
const _pwu=pwUpdate;pwUpdate=function(dt){if(!PW.on&&started){try{if(PW.ps)pwPSUpdate(PW.ps,dt);if(PW.smoke)pwPSUpdate(PW.smoke,dt)}catch(e){}
  for(let i=PW.zones.length-1;i>=0;i--)if(PW.zones[i].u(dt))PW.zones.splice(i,1)}return _pwu(dt)};

/* ---------- the boss bar ---------- */
const bar=document.createElement('div');bar.id='tbar';
bar.innerHTML='<div class="t"><span id="tbn"></span> <small id="tbp"></small></div><div class="b"><i></i><u></u></div><div class="s" id="tbs"></div>';
const sty=document.createElement('style');sty.textContent=`#tbar{position:fixed;top:calc(64px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);width:min(600px,72vw);z-index:6;text-align:center;font-family:var(--f-display);color:#f3d9b0;text-shadow:0 2px 4px #000;pointer-events:none;opacity:0;transition:opacity .4s}
#tbar .t{font-size:20px;letter-spacing:.05em}#tbar small{font-size:13px;color:#e8c890}#tbar .b{position:relative;height:16px;border:2px solid #6a2a1a;background:#1a0c08;border-radius:3px;overflow:hidden;margin-top:3px}
#tbar .b i{position:absolute;inset:0 auto 0 0;background:linear-gradient(#e0503a,#8e1c10);display:block}#tbar .b u{position:absolute;inset:0;display:none;background:repeating-linear-gradient(45deg,rgba(140,220,255,.55) 0 8px,rgba(60,140,220,.35) 8px 16px)}
#tbar.sh .b u{display:block}#tbar .s{font:13px var(--f-ui,sans-serif);color:#9ad8ff;margin-top:3px;min-height:16px}
body.touch #tbar{top:calc(92px + env(safe-area-inset-top,0px))}`;document.body.appendChild(sty);document.body.appendChild(bar);
let barA=null;
function drawBar(){const a=barA;if(!a||a.dead||!a.titan||!a.titan.on){bar.style.opacity=0;return}const T0=a.titan;bar.style.opacity=1;
  $('tbn').textContent=T0.D.n+(T0.enr?' — woedend':'')+(T0.mad?' — razernij':'');$('tbp').textContent=Math.ceil(a.hp).toLocaleString('nl-NL')+' / '+a.hpMax.toLocaleString('nl-NL');
  bar.querySelector('i').style.width=Math.max(0,a.hp/a.hpMax*100)+'%';bar.classList.toggle('sh',!!a.shield);
  $('tbs').textContent=a.shield?'Onkwetsbaar! Vernietig de '+T0.cores.filter(c=>!c.dead).length+' '+T0.D.core.toLowerCase()+(T0.cores.filter(c=>!c.dead).length===1?'':'en')+'.':T0.stun>0?'Het schild is gebroken: sla nu toe!':''}
setInterval(drawBar,250);
/* the old bar of the Vierhand gives way to the new one */
try{giantBar=function(){};}catch(e){}setTimeout(()=>{const g=$('gbar');if(g)g.remove()},3000);

/* ---------- strength that grows with your level ---------- */
function scale(a){const D=a.titan.D,L=lv();a.hpMax=Math.round(D.hp*(1+L*(D.lvlK||.07)));a.hp=a.hpMax;a.dmg=D.dmg*(1+L*(D.lvlD||.05));a.xp=Math.round(D.xp*(1+L*.04));a.titan.lvl=PL.lvl}
function setup(a){const D=TT[a.type];a.titan={D,on:false,cores:[],next:(D.next||[.75,.5,.25]).slice(),cd:{slam:6,wave:14,ink:16,add:0},enr:false,mad:false,fightT:0,stun:0,hitMsg:0};scale(a)}
function reset(a){const T0=a.titan;for(const c of T0.cores)killCore(c,true);T0.cores=[];a.shield=false;T0.on=false;T0.next=(T0.D.next||[.75,.5,.25]).slice();T0.enr=T0.mad=false;T0.fightT=0;T0.stun=0;
  if(a.type==='kraken')a.aq=-.5;scale(a)}

/* ---------- cores: the shield holds while they stand ---------- */
const coreGeo=new T.OctahedronGeometry(1.1,0),beamGeo=new T.CylinderGeometry(.09,.09,1,6,1,true);beamGeo.rotateX(Math.PI/2);
function spot(a,r0,r1){const wet=a.type==='kraken';for(let i=0;i<60;i++){const an=Math.random()*6.283,r=r0+Math.random()*(r1-r0),x=a.x+Math.cos(an)*r,z=a.z+Math.sin(an)*r,g=groundH(x,z);
    if(wet?g<-1.5:(g>-.6&&Math.abs(g-groundH(a.x,a.z))<6))return[x,z]}const an=Math.random()*6.283;return[a.x+Math.cos(an)*r0,a.z+Math.sin(an)*r0]}
function makeCore(a,x,z){const D=a.titan.D,g=new T.Group();
  const m=new T.Mesh(coreGeo,new T.MeshStandardMaterial({color:D.col,emissive:D.col,emissiveIntensity:1.3,roughness:.15,metalness:.3}));m.position.y=2.4;m.scale.set(1,1.7,1);g.add(m);
  const ped=new T.Mesh(new T.CylinderGeometry(.9,1.3,1.2,7),new T.MeshStandardMaterial({color:0x2a2a30,roughness:.8}));ped.position.y=.6;g.add(ped);
  const glow=new T.Sprite(new T.SpriteMaterial({map:WD.tx?WD.tx('glare.png'):null,color:D.col,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false}));glow.scale.set(5,5,1);glow.position.y=2.4;g.add(glow);
  const beam=new T.Mesh(beamGeo,new T.MeshBasicMaterial({color:D.col,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false}));scene.add(beam);
  const H=Math.round(2600*(a.titan.D.coreK||1)*(1+lv()*.07));
  const c=baseActor({kind:'enemy',type:'titancore',name:D.core,root:g,x,z,hp:H,hpMax:H,dmg:0,speed:.0001,aggro:.001,range:.001,rad:1.3,hh:4,xp:250,respawn:1e12,cave:!!a.cave});
  if(a.type==='kraken')c.aq=-.2;c.coreOf=a;c.gem=m;c.beam=beam;scene.add(g);placeActor(c);return c}
function killCore(c,silent){if(c.beam){scene.remove(c.beam);c.beam=null}if(!c.dead){c.dead=true;c.hp=0;c.respawn=1e12}c.root.visible=false;c.gone=true}
function startShield(a){const T0=a.titan,D=T0.D;a.shield=true;T0.cores=[];
  for(let i=0;i<4;i++){const [x,z]=spot(a,D.coreR[0],D.coreR[1]);T0.cores.push(makeCore(a,x,z))}
  for(const t of D.adds){const [x,z]=spot(a,10,20);let e=null;try{e=t==='wolf'?spawnEnemy('wolf',x,z,{cave:!!a.cave}):spawnMonster(t,x,z,{cave:!!a.cave})}catch(err){}
    if(e){e.respawn=1e12;e.temp=true;e.provoked=true;e.hp=e.hpMax=Math.round(e.hpMax*(1.6+lv()*.08));e.dmg=(e.dmg||10)*(1.4+lv()*.05)}}
  if(window.PW)PW.shake=Math.max(PW.shake||0,1.2);sfx('thunder');
  addLog(D.n+' wordt onkwetsbaar! Vernietig de vier '+D.core.toLowerCase()+'en om het schild te breken.','#9ad8ff')}
function breakShield(a){const T0=a.titan;a.shield=false;T0.stun=6;T0.cores=[];if(a.type==='kraken')a.aq=-.5;
  if(window.PW)PW.shake=Math.max(PW.shake||0,1);sfx('level');addLog('Het schild van '+T0.D.n+' is gebroken! Hij is even verdoofd.','#ffd27a');
  floatText(a.x,a.y+(a.hh||5),a.z,'SCHILD GEBROKEN','#ffd27a')}

/* ---------- hits: a cap per blow, nothing gets through the shield ---------- */
const _hit=hitActor;hitActor=function(a,dmg,by,dir){
  if(a&&a.seaAlly&&by)return;                                   /* your own sea creatures */
  if(a&&a.titan){if(!a.titan.on&&by)a.provoked=true;
    if(a.shield){if(PL.t-a.titan.hitMsg>.6){a.titan.hitMsg=PL.t;floatText(a.x,a.y+(a.hh||5)*.8,a.z,'Immuun','#9ad8ff')}return}
    dmg=Math.min(dmg*(a.titan.stun>0?1.5:1),a.hpMax*(a.titan.D.cap||.006))}
  return _hit(a,dmg,by,dir)};
const _kill=killActor;killActor=function(a,by){
  if(a&&a.titan){for(const c of a.titan.cores)killCore(c,true);a.titan.cores=[];a.shield=false;a.titan.on=false;
    _kill(a,by);addLog(a.titan.D.n+' is verslagen! Wat een gevecht!','#ffd27a');sfx('level');setTimeout(()=>{if(a.dead){a.titan.next=(a.titan.D.next||[.75,.5,.25]).slice();scale(a);a.hp=0}},100);return}
  _kill(a,by);
  if(a&&a.coreOf){killCore(a);const b=a.coreOf;if(b.titan&&b.shield&&!b.titan.cores.some(c=>!c.dead))breakShield(b)}};

/* ---------- the fight ---------- */
const ring=new T.TorusGeometry(1,.35,6,72);ring.rotateX(Math.PI/2);
function wave(a){const T0=a.titan,col=T0.D.col,m=new T.Mesh(ring,new T.MeshBasicMaterial({color:col,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));
  const y0=groundH(a.x,a.z)+.4;m.position.set(a.x,y0,a.z);scene.add(m);let r=3,hit=false;const ox=a.x,oz=a.z;sfx('thunder');addLog('Spring over de schokgolf!','#ffb86a');
  PW.zones.push({u(dt){r+=dt*15;m.scale.set(r,1.4,r);m.material.opacity=.85*(1-r/75);
    const d=Math.hypot(PL.x-ox,PL.z-oz),air=PL.y-groundH(PL.x,PL.z)>.75;if(!hit&&!a.dead&&Math.abs(d-r)<1.7&&!air&&PL.inCave===!!a.cave){hit=true;damagePlayer(PL.hpMax*(a.titan.D.waveK||.35)+a.dmg*.15,a)}
    if(r>75){scene.remove(m);return true}}})}
let inkEl=null;
function ink(a){if(!inkEl){inkEl=document.createElement('div');inkEl.style.cssText='position:fixed;inset:0;z-index:5;pointer-events:none;background:radial-gradient(circle at 50% 55%,rgba(5,10,20,.25) 0,rgba(4,8,16,.94) 38%);opacity:0;transition:opacity .6s';document.body.appendChild(inkEl)}
  inkEl.style.opacity=1;addLog('De Kraak spuit inkt! Je ziet bijna niets.','#9ad8ff');setTimeout(()=>{inkEl.style.opacity=0},6500)}
function slam(a){const T0=a.titan,x=PL.x,z=PL.z,R=6.5;sfx('hit');
  giantWarn(x,z,R,1.5,T0.D.col,()=>{const y=groundH(x,z);try{pwBurst(PW.ps,x,y+.6,z,40,R*1.4,.7,.8,.1,PC[T0.D.pal][0],PC[T0.D.pal][1],1.5,2,1,1.6)}catch(e){}if(window.PW)PW.shake=Math.max(PW.shake||0,.8);
    if(!a.dead&&Math.hypot(PL.x-x,PL.z-z)<R&&PL.inCave===!!a.cave)damagePlayer(PL.hpMax*(a.titan.D.slamK||.45)+a.dmg*.2,a)})}
function titan(a,dt){const T0=a.titan,D=T0.D,d=dist(PL,a),near=d<(a.type==='kraken'?95:115)&&!PL.dead&&PL.inCave===!!a.cave;
  if(!T0.on){if(a.hp>=a.hpMax&&T0.lvl!==PL.lvl)scale(a);if(near&&(a.provoked||d<55)&&!a.krSleep){T0.on=true;T0.fightT=0;barA=a;addLog(D.n+' (niveau '+(20+lv())+'+) valt aan. Dit wordt zwaar!','#e5766a')}return}
  if(!near&&d>160||PL.dead){reset(a);if(barA===a)barA=null;return}
  barA=a;T0.fightT+=dt;
  if(!a.shield&&T0.next.length&&a.hp/a.hpMax<=T0.next[0]){T0.next.shift();startShield(a)}
  if(a.shield){a.hp=Math.min(a.hpMax,a.hp+a.hpMax*.0025*dt);for(const c of T0.cores){if(c.dead||!c.beam)continue;const p1=new T.Vector3(c.x,c.y+2.4,c.z),p2=new T.Vector3(a.x,a.y+(a.hh||5)*.6,a.z);c.beam.position.copy(p1).add(p2).multiplyScalar(.5);c.beam.scale.set(1,1,p1.distanceTo(p2));c.beam.lookAt(p2)}}
  if(T0.stun>0){T0.stun-=dt;a.vel=0;a.wind=0;a.cd=Math.max(a.cd||0,.5)}
  if(!T0.enr&&a.hp/a.hpMax<.2){T0.enr=true;a.speed=(a.speed||3)*1.25;addLog(D.n+' raakt in woede!','#e5766a');sfx('thunder')}
  if(!T0.mad&&!D.easy&&T0.fightT>360){T0.mad=true;a.dmg*=2;addLog(D.n+' is in razernij! Maak het snel af.','#e5766a')}
  if(T0.stun>0)return;
  const k=T0.enr?.6:1;for(const key in T0.cd)T0.cd[key]-=dt;
  if(T0.cd.slam<=0&&d<60){T0.cd.slam=(a.shield?6:8)*k;slam(a)}
  if(D.wave&&T0.cd.wave<=0&&a.hp/a.hpMax<.75&&d<70){T0.cd.wave=15*k;wave(a)}
  if(D.ink&&T0.cd.ink<=0&&a.hp/a.hpMax<.75){T0.cd.ink=22*k;ink(a)}}
const _ue=updateEnemy;updateEnemy=function(a,dt){
  if(a.type==='titancore'){if(a.gem){a.gem.rotation.y+=dt*1.6;a.gem.position.y=2.4+Math.sin(PL.t*2+a.id)*.25}a.vel=0;return}
  if(a.seaAlly)return seaAI(a,dt);
  if(!TT[a.type]||a.dead)return _ue(a,dt);if(!a.titan)setup(a);
  if(a.shield&&a.titan.D.dive){a.aq+=(-9-a.aq)*Math.min(1,dt*1.5);a.y=a.aq;a.vel=0;titan(a,dt);return}
  if(a.titan.stun>0){titan(a,dt);a.y=a.aq!==undefined?a.aq:a.y;return}
  _ue(a,dt);if(!a.dead)titan(a,dt)};

/* ---------- loot: richer, and the shell of the deep ---------- */
Object.assign(ITEMS,{
  seal_sea:{n:'Schelp van de Diepte',g:'seal',def:4,fx:{regen:2,hp:40},price:5000,ico:'🐚',rar:'m',cmd:'sea'},
  seal_wolf:{n:'Wolvenfluit van Fenrik',g:'seal',def:2,fx:{spd:.06,stam:30},price:3600,ico:'🐺',rar:'l',cmd:'wolf'},
  seal_dead:{n:'Zegel der Doden',g:'seal',def:3,fx:{hp:30,dmg:.06},price:3800,ico:'💀',rar:'l',cmd:'dead'},
  amu_kraken:{n:'Amulet van de Diepte',g:'amulet',def:4,fx:{regen:2,hp:40},price:5000,ico:'🐙',rar:'m',cmd:'sea'}});
{const k=LOOTX.kraken;LOOTX.kraken=()=>{const L=k?k():{gold:0,items:[]};L.gold=(L.gold||0)+1500;if(!PL.fx.amuKraken||Math.random()<.35){PL.fx.amuKraken=1;L.items.push(['seal_sea',1])}L.items.push(['pearl',4],['gem',3]);return L}}
{const f=LOOTX.fourhands;LOOTX.fourhands=()=>{const L=f?f():{gold:0,items:[]};L.gold=(L.gold||0)+100000;L.items.push(['gem',4]);if(Math.random()<.5)L.items.push(['amu_fireheart',1]);return L}}
/* Fenrik's whistle and the seal of the dead fall from the bosses of Noordheim */
{const _k=killActor;killActor=function(a,by){_k(a,by);try{if(!a||!by)return;let id=null;if(a.boss==='fenrik')id='seal_wolf';else if(a.loot==='rimeking'||a.name==='De Rijpkoning')id='seal_dead';
  if(id&&(!PL.fx['got_'+id]||Math.random()<.3)){PL.fx['got_'+id]=1;dropLoot(a.x,a.z,{items:[[id,1]]})}}catch(e){}}}

/* ---------- commanding creatures: wear a shell, a whistle or a seal in the slot "Heerschap" ----------
   Schelp van de Diepte: every living thing of the sea and the rivers, De Kraak too.
   Wolvenfluit van Fenrik: the wolves.   Zegel der Doden: skeletons and ghosts.
   Y (or the button on the left) switches the order: follow me, attack, or stay. */
const SEA={mode:'volg',t:0,grp:null};WD.sea=SEA;const MODES={volg:'Volg mij',aanval:'Val aan',blijf:'Blijf hier'};
const GRP={sea:{n:'zeewezens',ico:'🐚',col:'#2affc0',has:a=>!!a.swim,wake:'Alle wezens van de zee en het water gehoorzamen je!'},
  wolf:{n:'wolven',ico:'🐺',col:'#cfe0ff',has:a=>a.type==='wolf'||a.type==='shadowwolf',wake:'Je blaast op de fluit. De wolven luisteren naar jou!'},
  dead:{n:'doden',ico:'💀',col:'#c9a8ff',has:a=>(a.type==='skeleton'||a.type==='wraith')&&!a.boss,wake:'Het zegel gloeit paars. De doden staan op om jou te dienen!'}};
const group=()=>{const e=PL.eq||{},it=ITEMS[e.seal];if(it&&it.cmd)return it.cmd;return e.amulet==='amu_kraken'?'sea':null};
const isAlly=a=>{const g=group();return!!g&&a.kind==='enemy'&&GRP[g].has(a)};
const wearing=()=>!!group();
const _htp=hostileToPlayer;hostileToPlayer=function(a){if(isAlly(a))return false;return _htp(a)};
let lastHit=null;const _hit2=hitActor;hitActor=function(a,dmg,by,dir){if(by&&a&&a.kind==='enemy'&&!a.seaAlly)lastHit=a;return _hit2(a,dmg,by,dir)};
function foeFor(a){if(lastHit&&!lastHit.dead&&!lastHit.seaAlly&&dist(lastHit,PL)<45)return lastHit;let b=null,bd=SEA.mode==='aanval'?40:22;
  for(const e of actors){if(e.kind!=='enemy'||e.dead||e.seaAlly||e.type==='titancore'||Math.abs(e.x-PL.x)>bd)continue;const dd=dist(e,PL);if(dd<bd&&hostileToPlayer(e)){bd=dd;b=e}}return b}
function seaAI(a,dt){if(!isAlly(a)||a.dead){a.seaAlly=false;return}
  if(a.krSleep||a.krRise<1)return _ue(a,dt);
  if(!!a.cave!==!!PL.inCave){a.vel=0;if(a.h)animHuman(a.h,dt,0,{});else if(a.model)animHorse(a.model,dt,0);return}
  const ox=a.x,oz=a.z,e=SEA.mode==='blijf'?null:foeFor(a);
  if(e){const d=dist(a,e);meleeAI(a,dt,e.x,e.z,d,()=>{hitActor(e,(a.dmg||10)*(a.type==='kraken'?1.5:1.2),false);if(a.type==='kraken'&&window.PW)PW.shake=Math.max(PW.shake||0,.3)})}
  else if(SEA.mode==='blijf'){a.vel=0}
  else{const i=a.id%8,an=i/8*6.283,r=a.type==='kraken'?14:3+i%3*1.8,tx=PL.x+Math.cos(an)*r,tz=PL.z+Math.sin(an)*r,dd=dist(a,{x:tx,z:tz});
    if(dd>90&&!a.swim){a.x=PL.x-Math.sin(PL.rot)*8+Math.cos(an)*3;a.z=PL.z-Math.cos(PL.rot)*8+Math.sin(an)*3}
    else if(dd>2.5)stepTo(a,dt,tx,tz,(a.speed||4)*(dd>12?1.4:1),2);else a.vel=0}
  if(a.swim&&groundH(a.x,a.z)>-.8){a.x=ox;a.z=oz;a.vel=0}
  if(a.model&&a.model.kr)a.y=a.aq+Math.sin(PL.t*.8+a.id)*.12;
  if(a.h)animHuman(a.h,dt,a.vel,{});else if(a.model)animHorse(a.model,dt,a.vel)}
/* allies far behind you are not updated by the game: keep them coming */
{const _uA=updateActors;updateActors=function(dt){_uA(dt);if(!wearing())return;for(const a of actors){if(!a.seaAlly||a.dead)continue;const dd=Math.abs(a.x-PL.x)+Math.abs(a.z-PL.z);if(dd>170){seaAI(a,dt);placeActor(a);a.root.visible=dd<230}}}}
ANIMS.push(dt=>{const g=group();if(g!==SEA.grp){const old=SEA.grp;SEA.grp=g;for(const a of actors)if(a.seaAlly){a.seaAlly=false;a.provoked=false}
    if(g){addLog(GRP[g].wake+' Y = bevel ('+MODES[SEA.mode]+').',GRP[g].col);sfx('level');try{WD.kingdom&&WD.kingdom.card&&WD.kingdom.card(GRP[g].ico+' Je beveelt de '+GRP[g].n,GRP[g].wake+' Ze volgen je en vallen je vijanden aan. Druk Y (of de knop links) om te wisselen tussen volgen, aanvallen en blijven.',null,8)}catch(e){}}
    seaLabel()}
  seaBtn.style.display=g&&started&&!document.body.classList.contains('cine')?'block':'none';if(!g)return;
  SEA.t-=dt;if(SEA.t>0)return;SEA.t=1;let n=0;
  for(const a of actors){if(a.dead||a.kind!=='enemy'||!GRP[g].has(a))continue;const d=dist(a,PL);
    if(!a.seaAlly&&d<(a.type==='kraken'?160:90)&&!!a.cave===!!PL.inCave){a.seaAlly=true;a.provoked=false;a.state='ally';n++;if(a.type==='kraken')addLog('De Kraak buigt voor de schelp en volgt jouw bevelen.','#2affc0')}
    else if(a.seaAlly&&d>300&&a.swim){a.seaAlly=false}}
  if(n)floatText(PL.x,PL.y+2.4,PL.z,n+' '+GRP[g].n+' volgen je',GRP[g].col)});
const seaBtn=document.createElement('button');seaBtn.className='btn';seaBtn.id='seabtn';seaBtn.style.cssText='position:fixed;left:max(12px,env(safe-area-inset-left,0px));top:calc(152px + env(safe-area-inset-top,0px));z-index:16;display:none;pointer-events:auto;font-size:14px;padding:6px 10px;border-color:#2affc0';
document.body.appendChild(seaBtn);function seaLabel(){const g=SEA.grp;seaBtn.innerHTML=(g?GRP[g].ico+' '+GRP[g].n+': ':'')+MODES[SEA.mode]+' <kbd style="font-size:11px">Y</kbd>'}seaLabel();
seaBtn.addEventListener('mousedown',e=>e.stopPropagation());seaBtn.addEventListener('pointerdown',e=>e.stopPropagation());seaBtn.addEventListener('click',()=>cycle());
function cycle(){const k=Object.keys(MODES);SEA.mode=k[(k.indexOf(SEA.mode)+1)%k.length];seaLabel();if(SEA.mode==='blijf')lastHit=null;
  addLog((SEA.grp?GRP[SEA.grp].n[0].toUpperCase()+GRP[SEA.grp].n.slice(1):'Dieren')+': '+MODES[SEA.mode]+'.',SEA.grp?GRP[SEA.grp].col:'#fff');for(const a of actors)if(a.seaAlly&&dist(a,PL)<60){floatText(a.x,(a.y||0)+2,a.z,MODES[SEA.mode],'#2affc0');break}}
addEventListener('keydown',e=>{if(e.code!=='KeyY'||!started||PL.dead||!wearing()||(e.target&&e.target.tagName==='INPUT')||anyModal())return;cycle()});
})();
