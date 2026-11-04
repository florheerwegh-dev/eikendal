/* ================= A wolf as a pet =================
   In the woods near Beukenrode a hungry wolf pup sits alone in a little nest of moss and bones. It growls at first,
   but give it meat (Wild, from hunting) three times and it trusts you: it becomes your wolf, Grijsvacht.
   - It follows you everywhere (into caves and Noordheim too), runs to catch up, and sits when you stand still.
   - It fights with you: it bites whatever you attack, or whatever comes at you.
   - It grows: from a pup to a big grey wolf, stronger as it grows and as you level up. Feeding it makes it grow faster.
   - Z (or the wolf button) switches: follow me, attack, stay. F near it: pet it, feed it, or tell it to stay or come.
   It is kept in the save (PL.fx.wolf). */
(function(){
const WP={a:null,pup:null,mode:'volg',it:null,lastHit:null,howlT:30};WD.wolfPet=WP;
const NEST={x:-232,z:-128};
const MODES={volg:'Volg mij',aanval:'Val aan',blijf:'Blijf'};
const st=()=>{PL.fx=PL.fx||{};return PL.fx.wolf=PL.fx.wolf||{tame:false,trust:0,name:'Grijsvacht',grow:0}};
const grownScale=()=>.5+.55*Math.min(1,st().grow);
function stats(a){const g=Math.min(1,st().grow);a.hpMax=Math.round(160+g*220+PL.lvl*14);a.hp=Math.min(a.hp||a.hpMax,a.hpMax);a.dmg=8+g*16+PL.lvl*1.8;a.speed=6.8;a.range=1.9}
function makeWolfActor(x,z){let a=null;try{a=spawnEnemy('wolf',x,z)}catch(e){}if(!a)return null;
  a.kind='pet';a.name=st().name;a.respawn=1e12;a.provoked=false;a.state='pet';a.root.scale.setScalar(grownScale());
  a.root.traverse(m=>{if(m.isMesh&&m.material&&m.material.color){m.material=m.material.clone();m.material.color.lerp(new T.Color(0x9a9a9e),.35)}});return a}

/* ---------- the pup in its nest ---------- */
function buildNest(){if(WP.pup||st().tame)return;let x=NEST.x,z=NEST.z;for(let i=0;i<40&&terrainH(x,z)<.6;i++){x+=rr(8);z+=rr(8)}
  const g=new T.Group();g.position.set(x,terrainH(x,z),z);const moss=new T.Mesh(new T.CylinderGeometry(1.3,1.5,.25,14),new T.MeshStandardMaterial({color:0x4a5a2a,roughness:1}));moss.position.y=.12;g.add(moss);
  const bm=new T.MeshStandardMaterial({color:0xe2dccb,roughness:.7});for(let i=0;i<6;i++){const b=new T.Mesh(new T.CylinderGeometry(.03,.04,.5,5),bm);const an=Math.random()*6.283;b.position.set(Math.cos(an)*1.1,.28,Math.sin(an)*1.1);b.rotation.set(Math.PI/2,an,0);g.add(b)}
  scene.add(g);WP.nest=g;
  const p=makeWolfActor(x,z);if(!p)return;p.name='Wolvenwelp';p.root.scale.setScalar(.45);WP.pup=p;
  WP.it={x,z,r:3,txt:()=>{const t=st().trust;return hasItem('meat')?'Geef de welp wild ('+t+'/3)':'De welp heeft honger (je hebt wild nodig, '+t+'/3)'},fn:feedPup};INTER.push(WP.it)}
function feedPup(){const s=st(),p=WP.pup;if(!p)return;if(!hasItem('meat')){addLog('De welp kijkt hongerig naar je. Jaag op herten of zwijnen voor wild.','#cfd8e0');return}
  takeItem('meat',1);s.trust++;floatText(p.x,p.y+1.2,p.z,'❤','#ff7a8a');try{WD.sounds&&WD.sounds.play('eat',.5,1.4)}catch(e){}
  if(s.trust<3){addLog(s.trust===1?'De welp schrokt het vlees op en gromt wat minder.':'De welp kwispelt en snuffelt aan je hand.','#cfd8e0');return}
  s.tame=true;s.grow=Math.max(s.grow,.05);const i=INTER.indexOf(WP.it);if(i>=0)INTER.splice(i,1);WP.it=null;
  const a=p;WP.pup=null;a.name=s.name;WP.a=a;stats(a);addPetInter();
  addLog('De welp vertrouwt je! Hij is nu jouw wolf: '+s.name+'. Z = bevel ('+MODES[WP.mode]+'), F bij hem = aaien en voeren.','#ffd27a');sfx('level');
  try{WD.kingdom&&WD.kingdom.card&&WD.kingdom.card('🐺 '+s.name,'De welp is nu jouw wolf. Hij volgt je overal, vecht met je mee en groeit uit tot een grote wolf. Geef hem wild om hem sneller te laten groeien. Druk Z (of de wolfknop) om te wisselen tussen volgen, aanvallen en blijven.',null,9)}catch(e){}}
function addPetInter(){const a=WP.a;if(!a||WP.pit)return;WP.pit={x:a.x,z:a.z,r:2.6,txt:()=>'Praat met '+st().name,fn:petMenu};INTER.push(WP.pit)}
function petMenu(){const a=WP.a,s=st();if(!a)return;const g=Math.round(Math.min(1,s.grow)*100);
  showDlg({name:s.name,job:'',x:a.x,z:a.z},'Je wolf kijkt je trouw aan. Gegroeid: '+g+'%. Levens '+Math.ceil(a.hp)+'/'+a.hpMax+'.',[
    ['Aaien',()=>{floatText(a.x,a.y+1.3,a.z,'❤','#ff7a8a');addLog(s.name+' leunt tegen je been.','#cfd8e0');closeModals()},1],
    ['Geef wild (sneller groeien)',()=>{if(!takeItem('meat',1)){addLog('Je hebt geen wild.');return}s.grow=Math.min(1,s.grow+.12);a.hp=a.hpMax;stats(a);floatText(a.x,a.y+1.3,a.z,'+groei','#9cc552');closeModals()}],
    ['Blijf hier',()=>{WP.mode='blijf';label();closeModals()}],['Volg mij',()=>{WP.mode='volg';label();closeModals()}],['Tot straks',()=>closeModals()]])}

/* ---------- the wolf at your side ---------- */
const _hit=hitActor;hitActor=function(a,dmg,by,dir){if(a&&a.kind==='pet')return;if(by&&a&&a.kind==='enemy')WP.lastHit=a;return _hit(a,dmg,by,dir)};
function foe(a){const L=WP.lastHit;if(L&&!L.dead&&Math.hypot(L.x-PL.x,L.z-PL.z)<30&&!L.seaAlly)return L;let b=null,bd=WP.mode==='aanval'?26:13;
  for(const e of actors){if(e.kind!=='enemy'||e.dead||e.seaAlly||e.type==='titancore'||!!e.cave!==!!PL.inCave||Math.abs(e.x-PL.x)>bd)continue;const d=Math.hypot(e.x-PL.x,e.z-PL.z);if(d<bd&&(e.state==='chase'||WP.mode==='aanval')&&hostileToPlayer(e)){bd=d;b=e}}return b}
function petAI(a,dt){const s=st();a.cave=PL.inCave;const d=Math.hypot(PL.x-a.x,PL.z-a.z);
  if(d>70||PL.x<-2000!==a.x<-2000){const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot);a.x=PL.x-fx*3;a.z=PL.z-fz*3;a.y=groundH(a.x,a.z);a.vel=0}
  const e=WP.mode==='blijf'?null:foe(a);
  if(e&&!PL.dead){const de=Math.hypot(e.x-a.x,e.z-a.z);meleeAI(a,dt,e.x,e.z,de,()=>{hitActor(e,a.dmg*(.85+Math.random()*.3),false);if(Math.random()<.3)try{WD.sounds&&WD.sounds.at('growl',a.x,a.z,.4,1.6)}catch(err){}})}
  else if(WP.mode==='blijf'){a.vel=0}
  else{const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot),tx=PL.x-fx*2.4+fz*1.6,tz=PL.z-fz*2.4-fx*1.6,dt2=Math.hypot(tx-a.x,tz-a.z);
    if(dt2>1.2)stepTo(a,dt,tx,tz,dt2>10?9:dt2>4?6.5:3,1);else{a.vel=0;a.rot+=angDiff(a.rot,PL.rot)*Math.min(1,dt*2)}}
  /* growing up: a little with every minute together */
  s.grow=Math.min(1,s.grow+dt/1500);const sc=grownScale();if(Math.abs(a.root.scale.x-sc)>.01){a.root.scale.setScalar(sc);stats(a)}
  WP.howlT-=dt;if(WP.howlT<=0){WP.howlT=60+Math.random()*90;if((ENV.night||0)>.5&&!e){floatText(a.x,a.y+1.4,a.z,'Auuuuu!','#cfd8e0');try{WD.sounds&&WD.sounds.at('growl',a.x,a.z,.55,1.9)}catch(err){}}}
  if(a.hp<a.hpMax)a.hp=Math.min(a.hpMax,a.hp+dt*3);
  if(a.model)animHorse(a.model,dt,a.vel);placeActor(a);a.root.visible=true;if(WP.pit){WP.pit.x=a.x;WP.pit.z=a.z}}
const _uA=updateActors;updateActors=function(dt){_uA(dt);if(!started)return;
  if(WP.a&&!WP.a.dead)petAI(WP.a,dt);
  const p=WP.pup;if(p){p.vel=0;p.rot+=Math.sin(PL.t*.7)*.002;if(p.model)animHorse(p.model,dt,0);placeActor(p);const d=Math.hypot(PL.x-p.x,PL.z-p.z);p.root.visible=d<230;
    if(d<20&&!WP.heard){WP.heard=1;addLog('Je hoort een zacht gejank. Een wolvenwelp, helemaal alleen...','#cfd8e0')}}};

/* ---------- start and load ---------- */
let ready=false;
ANIMS.push(()=>{if(ready||!started||typeof worldReady==='undefined'||!worldReady)return;ready=true;
  try{const s=st();if(s.tame){const a=makeWolfActor(PL.x-2,PL.z-2);if(a){WP.a=a;a.cave=PL.inCave;stats(a);addPetInter()}}else buildNest()}catch(e){console.warn('wolf pet',e)}});
const btn=document.createElement('button');btn.className='btn';btn.style.cssText='position:fixed;left:max(12px,env(safe-area-inset-left,0px));top:calc(192px + env(safe-area-inset-top,0px));z-index:16;display:none;pointer-events:auto;font-size:14px;padding:6px 10px;border-color:#cfd8e0';
document.body.appendChild(btn);function label(){btn.innerHTML='🐺 '+esc(st().name)+': '+MODES[WP.mode]+' <kbd style="font-size:11px">Z</kbd>'}
btn.addEventListener('mousedown',e=>e.stopPropagation());btn.addEventListener('pointerdown',e=>e.stopPropagation());btn.addEventListener('click',()=>cycle());
function cycle(){const k=Object.keys(MODES);WP.mode=k[(k.indexOf(WP.mode)+1)%k.length];if(WP.mode==='blijf')WP.lastHit=null;label();addLog(st().name+': '+MODES[WP.mode]+'.','#cfd8e0');if(WP.a)floatText(WP.a.x,WP.a.y+1.3,WP.a.z,MODES[WP.mode],'#cfd8e0')}
setInterval(()=>{const on=!!WP.a&&started&&!document.body.classList.contains('cine');btn.style.display=on?'block':'none';if(on&&!btn.dataset.l){btn.dataset.l=1;label()}},500);
addEventListener('keydown',e=>{if(e.code!=='KeyZ'||!WP.a||!started||PL.dead||(e.target&&e.target.tagName==='INPUT')||anyModal())return;cycle()});
const rr=(a=1)=>(Math.random()*2-1)*a;
})();
