/* ================= Goblin tribes and other creatures =================
   Twelve new kinds of goblin, each with its own colour and trick, living in goblin camps (tents and campfires) all
   over the land, in the swamp, the tunnels, the Demon Realm and Noordheim:
     Goblinsluiper (very fast), Goblinboogschutter (arrows), Goblinbommengooier (throws bombs: watch the circle),
     Rotsgoblin (stone skin, takes less damage), Moerasgoblin (poisons you), Vuurgoblin (sets you on fire),
     IJsgoblin (slows you down), Goblindief (steals gold and runs), Goblinmijnwerker (iron and gems, in the tunnels),
     Goblinkrijger (blocks with his shield), Goblintrommelaar (makes the goblins around him faster) and the
     Goblinhoofdman (a mini boss who calls for help).
   And other creatures: slimes that split in two, will-o'-the-wisps in the swamp, bats in the caves, giant rats in the
   tunnels and crabs on the beaches. All of them go into the monster and animal index of the journal. */
(function(){
const GOB={
  goblin_sneak:{n:'Goblinsluiper',hp:45,dmg:9,speed:7.6,aggro:24,range:1.6,xp:20,v:1,h:1.15,tint:0x2a3a30,lore:'Snel als de wind en altijd van achteren. Je hoort hem pas als het te laat is.',ico:'👺'},
  goblin_archer:{n:'Goblinboogschutter',hp:48,dmg:10,speed:5,aggro:30,range:1.8,xp:24,v:1,h:1.2,tint:0x4a6a2a,ranged:true,lore:'Schiet vanaf een afstand met een kromme boog. Ren op hem af.',ico:'🏹'},
  goblin_bomber:{n:'Goblinbommengooier',hp:55,dmg:8,speed:4.6,aggro:26,range:1.8,xp:30,v:2,h:1.25,tint:0x7a5a2a,lore:'Gooit sissende bommen. Ren weg uit de rode cirkel!',ico:'💣'},
  goblin_stone:{n:'Rotsgoblin',hp:170,dmg:15,speed:3.6,aggro:20,range:2,xp:45,v:3,h:1.6,tint:0x8a8a86,lore:'Zijn huid is hard als steen: je slagen doen hem maar half zoveel pijn.',ico:'🪨'},
  goblin_swamp:{n:'Moerasgoblin',hp:70,dmg:9,speed:5,aggro:22,range:1.7,xp:28,v:2,h:1.3,tint:0x5a6a3a,glow:0x9aff4a,lore:'Leeft in het moeras. Zijn mes is in gif gedoopt.',ico:'🧪'},
  goblin_fire:{n:'Vuurgoblin',hp:130,dmg:20,speed:5.4,aggro:26,range:1.8,xp:60,v:2,h:1.35,tint:0xb04020,glow:0xff6a1a,cave:true,lore:'Een goblin uit het Demonenrijk. Zijn klappen zetten je in brand.',ico:'🔥'},
  goblin_ice:{n:'IJsgoblin',hp:120,dmg:16,speed:5,aggro:24,range:1.8,xp:55,v:2,h:1.3,tint:0x9ac8e8,glow:0xbfe8ff,cave:true,lore:'Woont in de sneeuw van Noordheim. Zijn ijzige klauwen maken je traag.',ico:'❄'},
  goblin_thief:{n:'Goblindief',hp:50,dmg:6,speed:7,aggro:24,range:1.5,xp:30,v:1,h:1.15,tint:0xa09030,lore:'Grijpt je goud en rent weg. Versla hem en je krijgt alles terug, en meer.',ico:'💰'},
  goblin_miner:{n:'Goblinmijnwerker',hp:85,dmg:12,speed:4.4,aggro:20,range:1.8,xp:34,v:3,h:1.3,tint:0x7a5a3a,cave:true,lore:'Hakt diep onder de grond naar ijzer en edelstenen.',ico:'⛏'},
  goblin_warrior:{n:'Goblinkrijger',hp:100,dmg:13,speed:4.8,aggro:22,range:1.9,xp:36,v:3,h:1.4,tint:0x5a7a3a,lore:'Draagt een schild en blokt soms je klap.',ico:'🛡'},
  goblin_drummer:{n:'Goblintrommelaar',hp:65,dmg:7,speed:4.2,aggro:22,range:1.8,xp:40,v:2,h:1.25,tint:0x7a3a3a,lore:'Zolang hij trommelt, rennen de goblins om hem heen sneller. Versla hem eerst!',ico:'🥁'},
  goblin_chief:{n:'Goblinhoofdman',hp:650,dmg:26,speed:4.6,aggro:28,range:2.4,xp:260,v:3,h:2.3,tint:0x3f6a22,glow:0xffd040,boss:'goblinchief',lore:'De baas van een goblinkamp. Als het slecht gaat, roept hij zijn hele stam.',ico:'👑'}};
for(const [k,d] of Object.entries(GOB))MON[k]={n:d.n,hp:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,xp:d.xp,loot:k,rad:.4+d.h*.1,hh:d.h+.3,ranged:d.ranged,boss:d.boss,respawn:d.boss?1800:400};
Object.assign(MON,{slime:{n:'Slijmkruiper',hp:55,dmg:7,speed:3,aggro:16,range:1.3,xp:16,loot:'slime',rad:.6,hh:1.1},slime_small:{n:'Slijmpje',hp:18,dmg:4,speed:3.6,aggro:16,range:1,xp:6,loot:'slime',rad:.35,hh:.6},
  wisp:{n:'Dwaallicht',hp:16,dmg:0,speed:6,aggro:.001,range:.001,xp:25,loot:'wisp',rad:.3,hh:1.8},bat:{n:'Vleermuis',hp:20,dmg:4,speed:7,aggro:18,range:1.2,xp:8,loot:'bat',rad:.3,hh:2.6},
  rat:{n:'Reuzenrat',hp:28,dmg:5,speed:6,aggro:16,range:1.3,xp:9,loot:'rat',rad:.35,hh:.6},crab:{n:'Strandkrab',hp:32,dmg:6,speed:3.4,aggro:10,range:1.2,xp:10,loot:'crab',rad:.4,hh:.5}});
Object.assign(ITEMS,{slime_gel:{n:'Slijmgel',g:'mat',price:12,ico:'●'},wisp_dust:{n:'Dwaallichtstof',g:'mat',price:70,ico:'✧'},crab_claw:{n:'Krabbenschaar',g:'food',heal:16,price:9,ico:'●'}});
for(const k of Object.keys(GOB))LOOTX[k]=()=>{const L={gold:Math.floor(rnd(6,22)*(k==='goblin_thief'?6:k==='goblin_chief'?10:1)),items:[]};if(Math.random()<.6)L.items.push(['goblin_ear',1]);
  if(k==='goblin_miner'){L.items.push(['iron',1+Math.floor(Math.random()*2)]);if(Math.random()<.3)L.items.push(['gem',1])}if(k==='goblin_chief')L.items.push(['gem',2],[pick(['sword_knight','helm_iron','ring_gold'].filter(i=>ITEMS[i])),1]);
  if(k==='goblin_archer')L.items.push(['arrow',3+Math.floor(Math.random()*5)]);return L};
LOOTX.slime=()=>({gold:0,items:[['slime_gel',1]]});LOOTX.wisp=()=>({gold:0,items:[['wisp_dust',1]]});LOOTX.bat=()=>({gold:Math.floor(rnd(0,4)),items:[]});LOOTX.rat=()=>({gold:Math.floor(rnd(0,6)),items:[]});LOOTX.crab=()=>({gold:0,items:[['crab_claw',1]]});
try{const F=WD.fun;Object.assign(F.ICO,{slime:'🟢',slime_small:'🟢',wisp:'✨',bat:'🦇',rat:'🐀',crab:'🦀',goblinshaman:'🔮'});for(const [k,d] of Object.entries(GOB))F.ICO[k]=d.ico;
  Object.assign(F.LORE,{slime:'Een kruipende klodder slijm. Sla hem stuk en er komen twee kleintjes uit.',slime_small:'Een klein slijmpje, overgebleven van een grote.',wisp:'Een zwevend lichtje in het moeras. Het lokt reizigers het water in. Het vlucht als je dichtbij komt.',
    bat:'Fladdert in donkere grotten en bijt in je oren.',rat:'Een rat zo groot als een hond. Woont in de goblintunnels.',crab:'Kruipt zijwaarts over het strand en knijpt hard.',goblinshaman:'Een goblin met toverkrachten. Hij schiet groen vuur.'});for(const [k,d] of Object.entries(GOB))F.LORE[k]=d.lore}catch(e){}

/* ---------- models ---------- */
function goblinModel(type){const d=GOB[type];let h;try{EX.beast={kind:'puglin',v:d.v,h:d.h,tint:d.tint,glow:d.glow};h=makeHuman({skin:d.tint,tunic:0x4a3a28,pants:0x2a2418,hair:0x2a3a1a,hairStyle:'bald',beard:'none',face:5,scale:d.h/1.75})}finally{EX.beast=null}
  try{setHeld(h,d.ranged?'bow':type==='goblin_miner'?'pickaxe':type==='goblin_chief'?'axe_war':'dagger',type==='goblin_warrior'?'shield_wood':null)}catch(e){}return h}
const cm2=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.6,...o});
function slimeModel(small){const g=new T.Group(),body=new T.Mesh(new T.SphereGeometry(small?.35:.62,18,12),cm2(0x6ad04a,{transparent:true,opacity:.78,roughness:.15,emissive:0x1a4a10}));body.position.y=small?.32:.55;g.add(body);
  for(const sx of[-1,1]){const e=new T.Mesh(new T.SphereGeometry(small?.05:.08,8,6),cm2(0x111111));e.position.set(sx*(small?.1:.17),small?.42:.72,small?.3:.52);g.add(e)}
  return{g,anim(dt,v){const t=performance.now()/1000*(v>.2?7:3);body.scale.set(1+Math.sin(t)*.08,1-Math.sin(t)*.12,1+Math.sin(t)*.08);body.position.y=(small?.32:.55)*(1-Math.sin(t)*.12)+(v>.2?Math.max(0,Math.sin(t))*.2:0)}}}
function wispModel(){const g=new T.Group(),core=new T.Mesh(new T.SphereGeometry(.14,10,8),new T.MeshBasicMaterial({color:0xcfffe0}));core.position.y=1.6;g.add(core);
  const gl=new T.Sprite(new T.SpriteMaterial({map:WD.tx?WD.tx('glare.png'):null,color:0x7affc0,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false}));gl.scale.set(2.2,2.2,1);gl.position.y=1.6;g.add(gl);
  return{g,anim(dt){const t=performance.now()/1000;core.position.y=gl.position.y=1.5+Math.sin(t*2)*.3;gl.material.opacity=.6+.3*Math.sin(t*5)}}}
function batModel(){const g=new T.Group(),b=new T.Group();b.position.y=2.4;g.add(b);const m=cm2(0x1a1416);b.add(new T.Mesh(new T.SphereGeometry(.13,8,6),m));const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute([0,0,0,.55,.05,-.12,.3,0,.18],3));wg.computeVertexNormals();
  const wl=new T.Mesh(wg,new T.MeshStandardMaterial({color:0x2a2024,side:T.DoubleSide})),wr=wl.clone();wr.scale.x=-1;b.add(wl);b.add(wr);
  return{g,anim(dt){const t=performance.now()/1000;const f=Math.sin(t*22)*.9;wl.rotation.z=f;wr.rotation.z=-f;b.position.y=2.2+Math.sin(t*3)*.35}}}
function crabModel(){const g=new T.Group(),m=cm2(0xc0402a);const body=new T.Mesh(new T.SphereGeometry(.32,12,8),m);body.scale.set(1.2,.45,.9);body.position.y=.25;g.add(body);const legs=[];
  for(const sx of[-1,1])for(let i=0;i<3;i++){const l=new T.Mesh(new T.BoxGeometry(.32,.04,.04),m);l.position.set(sx*.42,.15,-.12+i*.12);l.rotation.z=sx*-.5;g.add(l);legs.push(l)}
  for(const sx of[-1,1]){const c=new T.Mesh(new T.SphereGeometry(.1,8,6),m);c.scale.set(1.4,.7,1);c.position.set(sx*.3,.3,.38);g.add(c)}
  for(const sx of[-1,1]){const e=new T.Mesh(new T.SphereGeometry(.035,6,5),cm2(0x111111));e.position.set(sx*.08,.42,.22);g.add(e)}
  return{g,anim(dt,v){const t=performance.now()/1000*(v>.2?18:4);legs.forEach((l,i)=>l.rotation.x=Math.sin(t+i)*.4)}}}
const _ah=animHorse;animHorse=function(h,dt,sp){if(h&&h.anim)return h.anim(dt,sp);return _ah(h,dt,sp)};
function spawnX(type,x,z,o={}){const d=MON[type];let h=null,m=null;
  if(GOB[type])h=goblinModel(type);else if(type==='slime'||type==='slime_small')m=slimeModel(type==='slime_small');else if(type==='wisp')m=wispModel();else if(type==='bat')m=batModel();else if(type==='crab')m=crabModel();
  else if(type==='rat'){m=makeWolf(0x6a5a4a);m.g.scale.setScalar(.48)}if(!h&&!m)return null;
  const a=baseActor({kind:'enemy',type,name:d.n,h,model:m,root:(h||m).g,x,z,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:d.loot,ranged:d.ranged,boss:d.boss,respawn:d.respawn||300,cave:!!(GOB[type]&&GOB[type].cave),...o});
  scene.add(a.root);placeActor(a);return a}
const _sm=spawnMonster;spawnMonster=function(type,x,z,o={}){if(GOB[type]||['slime','slime_small','wisp','bat','rat','crab'].includes(type))return spawnX(type,x,z,o);return _sm(type,x,z,o)};
WD.goblins={spawn:spawnX,GOB};

/* ---------- their tricks ---------- */
const BOMBS=[];
const _ue=updateEnemy;updateEnemy=function(a,dt){const t=a.type;
  if(t==='wisp'){const d=Math.hypot(PL.x-a.x,PL.z-a.z);a.wander=(a.wander||0)-dt;if(d<10){const an=Math.atan2(a.x-PL.x,a.z-PL.z);stepTo(a,dt,a.x+Math.sin(an)*6,a.z+Math.cos(an)*6,6,.1)}else{if(a.wander<=0){a.wander=rnd(3,6);a.wp=[a.spawn.x+rnd(-12,12),a.spawn.z+rnd(-12,12)]}if(a.wp&&stepTo(a,dt,a.wp[0],a.wp[1],1.2,.5))a.wp=null}if(a.model)a.model.anim(dt,a.vel);return}
  if(a.fleeT>0){a.fleeT-=dt;const an=Math.atan2(a.x-PL.x,a.z-PL.z);stepTo(a,dt,a.x+Math.sin(an)*8,a.z+Math.cos(an)*8,(a.speed||5)*1.15,.1);if(a.h)animHuman(a.h,dt,a.vel,{});return}
  const sp0=a.speed;if(a.drumBuff>0){a.drumBuff-=dt;a.speed=sp0*1.35}
  _ue(a,dt);a.speed=sp0;
  if(a.dead)return;
  if(t==='goblin_bomber'&&a.state==='chase'){a.bombT=(a.bombT??2)-dt;const d=Math.hypot(PL.x-a.x,PL.z-a.z);if(a.bombT<=0&&d>4&&d<20){a.bombT=3.5;const x=PL.x+rnd(-1.5,1.5),z=PL.z+rnd(-1.5,1.5);
    giantWarn(x,z,3.2,1.3,0xff7a2a,()=>{if(!a.dead&&Math.hypot(PL.x-x,PL.z-z)<3.2&&PL.inCave===!!a.cave)damagePlayer(24+PL.lvl*1.2,a);try{WD.sounds&&WD.sounds.at('boom',x,z,.5,1.5,60)}catch(e){}if(window.PW)PW.shake=Math.max(PW.shake||0,.3)})}}
  if(t==='goblin_drummer'){a.drumT=(a.drumT||0)-dt;if(a.drumT<=0){a.drumT=1;for(const g of actors)if(g!==a&&!g.dead&&/^goblin/.test(g.type||'')&&Math.hypot(g.x-a.x,g.z-a.z)<16)g.drumBuff=1.3;if(a.state==='chase'&&Math.random()<.4)floatText(a.x,a.y+1.8,a.z,'♪ Boem boem!','#e0b04a')}}
  if(t==='goblin_chief'&&!a.called&&a.hp<a.hpMax*.5){a.called=true;saySomething(a,'Stam! Help mij!',3);for(let i=0;i<4;i++){const an=Math.random()*6.283;const g=spawnX(pick(['goblin_warrior','goblin_sneak','goblin_archer']),a.x+Math.cos(an)*8,a.z+Math.sin(an)*8,{cave:a.cave});if(g){g.respawn=1e12;g.provoked=true}}}};
const _dp=damagePlayer;damagePlayer=function(d,src){const hp0=PL.hp;const r=_dp(d,src);if(!src||PL.hp>=hp0)return r;const t=src.type;
  if(t==='goblin_thief'){const n=Math.min(PL.gold,Math.floor(rnd(8,25)));if(n>0){PL.gold-=n;src.stolen=(src.stolen||0)+n;floatText(PL.x,PL.y+2.6,PL.z,'-'+n+' goud!','#e0b04a');addLog('De Goblindief grist '+n+' goud uit je buidel en rent weg!','#e5766a');src.fleeT=7}}
  else if(t==='goblin_swamp')PL.poisonT=5;else if(t==='goblin_fire')PL.burnT=3.5;else if(t==='goblin_ice')PL.frostT=Math.max(PL.frostT||0,1.6);return r};
ANIMS.push(dt=>{if(!started||PL.dead)return;
  if(PL.poisonT>0){PL.poisonT-=dt;PL.hp-=dt*3;if(Math.random()<dt*2)floatText(PL.x,PL.y+2.2,PL.z,'gif','#9aff4a');if(PL.hp<=0){PL.hp=0;playerDie()}}
  if(PL.burnT>0){PL.burnT-=dt;PL.hp-=dt*5;if(Math.random()<dt*3)floatText(PL.x,PL.y+2.2,PL.z,'🔥','#ff8a3a');if(PL.hp<=0){PL.hp=0;playerDie()}}
  if(PL.frostT>0&&PL.x>-30000){PL.frostT-=dt;PL.slow=.5;if(PL.frostT<=0)PL.slow=1}});
const _hit=hitActor;hitActor=function(a,dmg,by,dir){if(a&&!a.dead){if(a.type==='goblin_stone')dmg*=.5;else if(a.type==='goblin_warrior'&&Math.random()<.25){floatText(a.x,a.y+1.8,a.z,'Geblokt!','#cfd8e0');try{sfx('block')}catch(e){}return}}return _hit(a,dmg,by,dir)};
const _ka=killActor;killActor=function(a,by){_ka(a,by);try{if(a.type==='slime'){for(let i=0;i<2;i++){const s=spawnX('slime_small',a.x+rnd(-1,1),a.z+rnd(-1,1),{cave:a.cave});if(s){s.respawn=1e12;s.provoked=true}}}
  if(a.type==='goblin_thief'&&a.stolen){dropLoot(a.x,a.z,{gold:a.stolen*2,items:[]});a.stolen=0}}catch(e){}};

/* ---------- where they live ---------- */
function camp(x,z,kinds,n,chief){const y=groundH(x,z),G=new T.Group();G.position.set(x,y,z);scene.add(G);
  for(let i=0;i<3;i++){const an=i/3*6.283+.4,tx=Math.cos(an)*6,tz=Math.sin(an)*6,t=new T.Mesh(new T.ConeGeometry(1.8,2.6,6,1,true),cm2(pick([0x6a5a3a,0x5a4a2a,0x7a6a42]),{side:T.DoubleSide,roughness:.95}));t.position.set(tx,1.3,tz);G.add(t)}
  for(let i=0;i<5;i++){const l=new T.Mesh(new T.CylinderGeometry(.12,.12,1.1,6),MAT.wood);l.rotation.z=Math.PI/2;l.rotation.y=i*1.26;l.position.y=.12;G.add(l)}
  const fl=new T.Sprite(new T.SpriteMaterial({map:WD.tx?WD.tx('glare.png'):null,color:0xff8a3a,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false}));fl.scale.set(2.2,2.6,1);fl.position.y=.8;G.add(fl);
  try{LAMPS.push({x,y:y+.8,z,fire:true,flame:fl})}catch(e){}
  for(let i=0;i<n;i++){const an=Math.random()*6.283,r=3+Math.random()*8;spawnX(pick(kinds),x+Math.cos(an)*r,z+Math.sin(an)*r)}
  if(chief)spawnX('goblin_chief',x+2,z+2)}
function land(x,z){const h=terrainH(x,z);return h>.8&&h<40&&!siteAt(x,z)&&roadDist(x,z)>8}
function find(minD,maxD,ok){for(let i=0;i<300;i++){const a=Math.random()*6.283,d=minD+Math.random()*(maxD-minD),x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.abs(x)<HALF-70&&Math.abs(z)<HALF-70&&ok(x,z))return[x,z]}return null}
let done=false,doneN=false;
ANIMS.push(()=>{if(done||!started||!worldReady)return;done=true;try{
  const forest=['goblin_sneak','goblin_archer','goblin_warrior','goblin_drummer','goblin_bomber','goblin_thief','goblin_stone'];
  for(let i=0;i<8;i++){const p=find(260,1000,land);if(p)camp(p[0],p[1],forest,5,i<3)}
  const sw=SITE.swamp;if(sw){for(let i=0;i<7;i++){const a=Math.random()*6.283,r=sw.r*(.6+Math.random()*.6);spawnX('goblin_swamp',sw.x+Math.cos(a)*r,sw.z+Math.sin(a)*r)}
    for(let i=0;i<6;i++){const a=Math.random()*6.283,r=sw.r*Math.random();spawnX('wisp',sw.x+Math.cos(a)*r,sw.z+Math.sin(a)*r)}for(let i=0;i<5;i++){const a=Math.random()*6.283,r=sw.r*(.5+Math.random()*.8);spawnX('slime',sw.x+Math.cos(a)*r,sw.z+Math.sin(a)*r)}}
  for(let i=0;i<8;i++){const p=find(200,1000,land);if(p)spawnX('slime',p[0],p[1])}
  let crabs=0;for(let i=0;i<4000&&crabs<14;i++){const x=rnd(-HALF+80,HALF-80),z=rnd(-HALF+80,HALF-80),h=terrainH(x,z);if(h<.15||h>1.4)continue;if(terrainH(x+6,z)>-1&&terrainH(x-6,z)>-1&&terrainH(x,z+6)>-1&&terrainH(x,z-6)>-1)continue;spawnX('crab',x,z);crabs++}
  /* the goblin tunnels and the caves */
  if(typeof GT!=='undefined'&&typeof GTN!=='undefined'){const nodes=Object.values(GTN);for(let i=0;i<6;i++){const n=pick(nodes);spawnX('goblin_miner',GT.X0+n[0]+rnd(-2,2),n[1]+rnd(-2,2),{cave:true})}for(let i=0;i<6;i++){const n=pick(nodes);spawnX('rat',GT.X0+n[0]+rnd(-2,2),n[1]+rnd(-2,2),{cave:true})}
    for(let i=0;i<5;i++){const n=pick(nodes);spawnX('bat',GT.X0+n[0]+rnd(-2,2),n[1]+rnd(-2,2),{cave:true})}}
  if(typeof CAVE!=='undefined'&&CAVE.center){for(let i=0;i<5;i++)spawnX('bat',CAVE.center[0]+rnd(-CAVE.r*.6,CAVE.r*.6),CAVE.center[1]+rnd(-CAVE.r*.6,CAVE.r*.6),{cave:true})}
  /* the Demon Realm */
  if(typeof DW!=='undefined')for(let i=0;i<7;i++){const a=Math.random()*6.283,r=60+Math.random()*(DW.R-100);spawnX('goblin_fire',DW.X+Math.cos(a)*r,DW.Z+Math.sin(a)*r,{cave:true})}
}catch(e){console.warn('goblins',e)}});
/* Noordheim is built later */
ANIMS.push(()=>{if(doneN||!started||!WD.north||!WD.north.built)return;doneN=true;try{for(let i=0;i<9;i++){const a=Math.random()*6.283,r=200+Math.random()*450,x=-40000+Math.cos(a)*r,z=Math.sin(a)*r;spawnX('goblin_ice',x,z)}}catch(e){console.warn('ice goblins',e)}});
})();

/* ================= De Gifvallei: a poisoned valley under the Trollenmoeras =================
   Long ago the alchemists of the swamp poured their failed potions into a cave. The poison seeped into a hidden valley
   and turned it green and rotten. A stinking tunnel at the edge of the Trollenmoeras leads there. The air is poisonous:
   buy a gas mask (or an antidote) from the alchemist Vira at the tunnel mouth. Inside wait lakes of acid, dead and
   twisted trees, giant mushrooms, old poison barrels, poison spiders, acid orcs, slimes and swamp goblins, the ruin of
   the old poison brewery with its chest, and in the crater in the middle the poison dragon Virulax. (x 140000) */
(function(){
const TX=140000,TZ=0,RT=560,inT=x=>x>130000&&x<160000,rr=(a=1)=>(Math.random()*2-1)*a;
const TV={built:false,X:TX,Z:TZ};WD.gif=TV;
WD.regions=WD.regions||[];WD.regions.push({x0:130000,x1:160000,name:'De Gifvallei',in:'in de Gifvallei',adv:'de Gifvallei'});
const CR={x:60,z:-120,r:90},LK=[{x:-200,z:60,r:70},{x:150,z:170,r:55},{x:-70,z:-300,r:48},{x:270,z:-60,r:40}],ARR={x:0,z:430},BREW={x:-250,z:-160};
function tH(x,z){const u=x-TX,v=z-TZ,r=Math.hypot(u,v);let h=(fbm(u*.005+11,v*.005-7,4)-.5)*16+6;
  const dc=Math.hypot(u-CR.x,v-CR.z);if(dc<CR.r*1.7){h+=Math.exp(-Math.pow((dc-CR.r)/26,2))*16;if(dc<CR.r)h=lerp(h,1.5,1-smooth(CR.r*.45,CR.r,dc))}
  for(const L of LK){const d=Math.hypot(u-L.x,v-L.z)+(fbm(u*.02,v*.02,2)-.5)*22;if(d<L.r+34)h=lerp(h,-3,1-smooth(L.r-18,L.r+34,d))}
  h+=smooth(RT-160,RT-10,r+(fbm(u*.01,v*.01,2)-.5)*70)*(110+fbm(u*.012,v*.012,3)*70);
  for(const [P,R0,H0] of[[ARR,52,5],[BREW,34,7]]){const d=Math.hypot(u-P.x,v-P.z);if(d<R0)h=lerp(h,H0,1-smooth(R0*.5,R0,d))}return h}
TV.h=tH;
const _gT=groundH;groundH=function(x,z){return inT(x)?tH(x,z):_gT(x,z)};
const _tT=terrainH;terrainH=function(x,z){return inT(x)?tH(x,z):_tT(x,z)};
const _cT=gtClamp;gtClamp=function(P){if(inT(P.x)){const dx=P.x-TX,dz=P.z-TZ,d=Math.hypot(dx,dz);if(d>RT-80){P.x=TX+dx/d*(RT-80);P.z=TZ+dz/d*(RT-80)}return}return _cT(P)};
/* a sickly green haze */
const _ueT=updateEnv,HZ=new T.Color(0xa4b06a),HZN=new T.Color(0x1a2410);
updateEnv=function(dt,pp){if(pp===PL&&inT(PL.x)){const q=Object.create(PL,{inCave:{value:false,writable:true}});_ueT(dt,q);scene.fog.color.lerp((ENV.night||0)>.5?HZN:HZ,.6);scene.fog.density=Math.max(scene.fog.density,.0052);return}return _ueT(dt,pp)};
/* ---------- things to buy, find and win ---------- */
Object.assign(ITEMS,{
  gifmasker:{n:'Gifmasker',g:'mat',price:900,ico:'😷',rar:'e',desc:'Zolang je dit masker bij je hebt, doet de giflucht van de Gifvallei je niets. Zuur blijft wel zuur!'},
  tegengif:{n:'Tegengif',g:'food',heal:25,buff:{tox:1},dur:180,price:45,ico:'🧪',rar:'r',desc:'Geneest gif en beschermt je 3 minuten tegen de giflucht.'},
  gifkristal:{n:'Gifkristal',g:'mat',price:220,ico:'💚',rar:'e',desc:'Een groen gloeiend kristal uit de Gifvallei. Alchemisten betalen er goed voor.'},
  zuurzwaard:{n:'Zuurzwaard van Virulax',g:'weapon',kind:'sword',dmg:150,spd:.46,rng:3.3,fx:{dmg:.2},col:0x7aff2a,price:16000,ico:'⚔',rar:'m'},
  gifschild:{n:'Gifschubschild',g:'shield',kind:'shield',def:.95,fx:{hp:80,regen:2},col:0x4a8a1a,price:14000,ico:'◔',rar:'m'},
  gifpantser:{n:'Gifschubpantser',g:'armor',def:46,tunic:0x3a5a1a,pants:0x1a2a0a,armor:1,fx:{hp:160,regen:4},price:15000,ico:'🛡',rar:'m'},
  amu_virulax:{n:'Gifhart van Virulax',g:'amulet',fx:{dmg:4,hp:120,regen:5},col:0x8aff3a,price:20000,ico:'💚',rar:'m',desc:'Het hart van de gifdraak. Je slaat vijf keer zo hard.'}});
Object.assign(MON,{gifspin:{n:'Gifspin',hp:260,dmg:22,speed:6,aggro:24,range:1.8,xp:120,loot:'gifspin',rad:.8,hh:1.4,respawn:500},
  gifork:{n:'Zuurork',hp:900,dmg:40,speed:4.6,aggro:26,range:3,xp:420,loot:'gifork',rad:1.2,hh:3.4,respawn:700}});
LOOTX.gifspin=()=>({gold:Math.floor(rnd(30,80)),items:Math.random()<.35?[['gifkristal',1]]:[]});
LOOTX.gifork=()=>({gold:Math.floor(rnd(150,320)),items:[['gifkristal',1+Math.floor(Math.random()*2)]].concat(Math.random()<.25?[['tegengif',1]]:[])});
CHEST_LOOT.gif_brew={gold:2500,items:[['gifpantser',1],['tegengif',3],['gifkristal',3],['gem',3]]};
addEventListener('load',()=>{try{const F=WD.fun;Object.assign(F.ICO,{gifspin:'🕷',gifork:'👹'});Object.assign(F.LORE,{gifspin:'Een spin uit de Gifvallei. Haar beet is giftig.',gifork:'Een ork die te lang in de Gifvallei woonde. Zijn huid is groen van het zuur en zijn slagen vergiftigen je.'})}catch(e){}});
/* the antidote also cures poison */
const _uiT=useItem;useItem=function(id){const r=_uiT.apply(this,arguments);if(id==='tegengif'){PL.poisonT=0;TV.air=0}return r};
/* poison creatures poison you */
const _dpT=damagePlayer;damagePlayer=function(d,src){const hp0=PL.hp,r=_dpT(d,src);if(src&&src.tox&&PL.hp<hp0&&!PL.dead)PL.poisonT=Math.max(PL.poisonT||0,4);return r};
/* a tunnel mouth: two upright boulders, one across the top and a dark opening between them; (ox,oz) points into the tunnel */
function mouth(B,par,x,z,ox,oz,gy){const px=-oz,pz=ox,y=gy(x,z);for(const s of[-1,1]){const X=x+px*s*3+ox*1.2,Z=z+pz*s*3+oz*1.2;B.model('Rock_Medium_'+(s>0?1:3),X,gy(X,Z)+2.4,Z,Math.atan2(ox,oz),1.9,{tint:0x8a8778,rz:Math.PI/2*s,sy:1.3});addCircle(X,Z,1.9)}
  {const X=x+ox*1.4,Z=z+oz*1.4;B.model('Rock_Medium_2',X,y+5.2,Z,Math.atan2(px,pz),1.8,{tint:0x7a776a})}
  for(const s of[-1,1])for(let k=0;k<3;k++){const X=x+px*s*(4.2+k*1.6)+ox*(1.5+k),Z=z+pz*s*(4.2+k*1.6)+oz*(1.5+k);B.model('Rock_Medium_'+(1+k%3),X,gy(X,Z)-.6,Z,Math.random()*6,1.4+Math.random()*.8,{tint:0x8a8676});addCircle(X,Z,2)}
  const sh=new T.Shape();sh.moveTo(-2.3,0);sh.lineTo(-2.3,3);sh.quadraticCurveTo(-2.2,5.3,0,5.4);sh.quadraticCurveTo(2.2,5.3,2.3,3);sh.lineTo(2.3,0);sh.lineTo(-2.3,0);const h=new T.Mesh(new T.ShapeGeometry(sh),new T.MeshBasicMaterial({color:0x020201}));h.position.set(x+ox*2.4,y-.3,z+oz*2.4);h.rotation.y=Math.atan2(-ox,-oz);par.add(h);
  const f=new T.Mesh(new T.PlaneGeometry(4.6,3),new T.MeshBasicMaterial({color:0x040402}));f.rotation.x=-Math.PI/2;f.rotation.z=-Math.atan2(ox,oz);f.position.set(x+ox*1.4,y+.06,z+oz*1.4);par.add(f)}
function spawnTX(type,k,x,z,opt){const d=MON[type];let m=null;try{m=EX.makeCX(k,opt)}catch(e){}if(!m)return spawnMonster('slime',x,z,{cave:true});
  const a=baseActor({kind:'enemy',type,name:d.n,model:m,root:m.g,x,z,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:d.loot,respawn:d.respawn,cave:true,tox:true});scene.add(a.root);placeActor(a);return a}
/* ---------- building the valley ---------- */
const G=new T.Group();
function build(){if(TV.built)return;TV.built=true;const t0=performance.now();scene.add(G);
  const mat=new T.MeshStandardMaterial({vertexColors:true,map:TEX.dirt||TEX.grass||null,roughness:1}),CH=160;
  for(let cx=-4;cx<4;cx++)for(let cz=-4;cz<4;cz++){const ox=TX+cx*CH+CH/2,oz=TZ+cz*CH+CH/2,SEG=36,g=new T.PlaneGeometry(CH,CH,SEG,SEG);g.rotateX(-Math.PI/2);const p=g.attributes.position,n=p.count,cols=new Float32Array(n*3),uv=new Float32Array(n*2);
    for(let i=0;i<n;i++){const x=p.getX(i)+ox,z=p.getZ(i)+oz,h=tH(x,z);p.setXYZ(i,x,h,z);uv[i*2]=x/8;uv[i*2+1]=z/8;const nn=fbm(x*.05,z*.05,3);
      let r=.42+.08*nn,gg=.44+.1*nn,b=.16+.04*nn;const mud=1-smooth(-1,2.5,h);r=lerp(r,.26,mud);gg=lerp(gg,.3,mud);b=lerp(b,.1,mud);
      const shore=Math.max(0,1-Math.abs(h-.4)/1.4);r=lerp(r,.62,shore*.6);gg=lerp(gg,.7,shore*.6);b=lerp(b,.3,shore*.6);
      const rock=smooth(30,80,h);r=lerp(r,.36,rock);gg=lerp(gg,.36,rock);b=lerp(b,.28,rock);cols[i*3]=r;cols[i*3+1]=gg;cols[i*3+2]=b}
    g.setAttribute('color',new T.BufferAttribute(cols,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingSphere();const me=new T.Mesh(g,mat);me.receiveShadow=true;G.add(me)}
  /* acid: the lakes and the pool in the crater */
  const acid=new T.MeshStandardMaterial({color:0x7ae02a,map:TEX.water?(()=>{const t=TEX.water.clone();t.needsUpdate=true;return t})():null,emissive:0x2a6a0a,emissiveIntensity:.4,roughness:.2,metalness:.15,transparent:true,opacity:.86});TV.acid=acid;
  for(const L of LK){const m=new T.Mesh(new T.CircleGeometry(L.r+36,40),acid);m.rotation.x=-Math.PI/2;m.position.set(TX+L.x,-.3,TZ+L.z);G.add(m)}
  const ok=(x,z,h)=>{const u=x-TX,v=z-TZ;if(Math.hypot(u,v)>RT-190||h<.8||h>45)return false;if(Math.hypot(u-ARR.x,v-ARR.z)<60||Math.hypot(u-BREW.x,v-BREW.z)<36)return false;if(Math.hypot(u-CR.x,v-CR.z)<CR.r*1.1)return false;return true};
  const spot=(R0=RT-200,cx=0,cz=0)=>{for(let t=0;t<60;t++){const x=TX+cx+rr(R0),z=TZ+cz+rr(R0),h=tH(x,z);if(ok(x,z,h))return[x,z,h]}return null};
  const K=window.KIT;
  if(K&&K.Bag&&AS.lib&&AS.lib.DeadTree_1){const B=K.Bag(),M=(n,x,z,ry,s,o={},dy=0)=>B.model(n,x,tH(x,z)+dy,z,ry,s,o);
    for(let i=0;i<90;i++){const p=spot();if(p){M('DeadTree_'+(1+i%5),p[0],p[1],Math.random()*6.3,.6+Math.random()*.5,{tint:0x6a6a48},-.2);addCircle(p[0],p[1],.6)}}
    for(let i=0;i<50;i++){const p=spot();if(p){M('TwistedTree_'+(1+i%5),p[0],p[1],Math.random()*6.3,.8+Math.random()*.5,{tint:0x9ab040},-.2);addCircle(p[0],p[1],.7)}}
    for(let i=0;i<45;i++){const p=spot();if(p){const s=3+Math.random()*5;M(i%3?'Mushroom_Common':'Mushroom_Laetiporus',p[0],p[1],Math.random()*6.3,s,{tint:i%2?0xb8ff5a:0xd8e86a});if(s>5)addCircle(p[0],p[1],s*.18)}}
    for(let i=0;i<70;i++){const p=spot();if(p)M('Bush_Common',p[0],p[1],Math.random()*6.3,.8+Math.random()*.8,{tint:0x8a9a30})}
    for(let i=0;i<50;i++){const p=spot();if(p){const s=.6+Math.random()*1.6;M('Rock_Medium_'+(1+i%3),p[0],p[1],Math.random()*6.3,s,{tint:0x6a6a52},-.3*s);addCircle(p[0],p[1],s*1.2)}}
    /* the old poison barrels the alchemists dumped here */
    for(let i=0;i<14;i++){const p=spot();if(!p)continue;for(let k=0;k<3+Math.floor(Math.random()*4);k++){const x=p[0]+rr(3),z=p[1]+rr(3),tip=Math.random()<.4;M('Barrel',x,z,Math.random()*6.3,1,{tint:0x8ad83a,rz:tip?Math.PI/2:0},tip?.35:0)}addCircle(p[0],p[1],2)}
    for(let i=0;i<4;i++){const p=spot();if(p){M('Prop_Wagon',p[0],p[1],Math.random()*6.3,1.1,{rz:.3,tint:0x6a6a50},.2);addCircle(p[0],p[1],2)}}
    /* the ruin of the old poison brewery, with cauldrons and its chest */
    {const bx=TX+BREW.x,bz=TZ+BREW.z,y=tH(bx,bz);K.kitHouse(B,bx,y,bz,3,3,{q:0,floors:2,wall:'UnevenBrick',tint:0x7a7a60,roofTint:0x3a4a2a,floor:'Floor_WoodDark',chimney:'2',win:'Wide_Flat'});addCircle(bx,bz,4.6);
      for(const [dx,dz] of[[-5,8],[0,9],[5,8]]){M('Cauldron',bx+dx,bz+dz,Math.random()*6,1.8,{tint:0x6a8a4a});addCircle(bx+dx,bz+dz,1.1)}
      for(let k=0;k<6;k++)M('Barrel',bx+7+rr(1.5),bz+3+rr(3),Math.random()*6,1,{tint:0x8ad83a});try{makeChest(bx,bz+11.5,'gif_brew',0,'Kist van de oude gifbrouwers')}catch(e){}}
    /* Vira's camp at the end of the tunnel: her cart, a cauldron, crates and torches */
    {const ax=TX+ARR.x,az=TZ+ARR.z;M('Stall_Cart_Empty',ax-6,az-2,.4,1.3,{});addCircle(ax-6,az-2,1.8);M('Cauldron',ax-2,az-5,0,1.5,{});addCircle(ax-2,az-5,.9);
      for(const [dx,dz] of[[-9,-5],[-9.9,-4],[-8.6,-6.2]])M('Crate_Wooden',ax+dx,az+dz,Math.random(),1,{});addCircle(ax-9.2,az-5,1.4);
      for(const [dx,dz] of[[4,-3],[-12,1]]){M('Torch_Metal',ax+dx,az+dz,0,2.2,{},1.2)}}
    /* the tunnel back: a mouth of boulders against the mountains */
    {const ex=TX+ARR.x,ez=TZ+ARR.z+30;mouth(B,G,ex,ez,0,1,tH);TV.exit={x:ex+0,z:ez+1}}
    B.build(G)}
  /* Vira the alchemist */
  try{const a=spawnNPC('merchant',TX+ARR.x-3,TZ+ARR.z-1,{name:'Alchemist Vira',ai:'stay',cave:true,line:'gif',shop:['gifmasker','tegengif','potion','elixir'].filter(i=>ITEMS[i])});TV.vira=a}catch(e){console.warn('vira',e)}
  /* the creatures of the valley */
  for(let i=0;i<14;i++){const p=spot();if(p)try{spawnMonster('slime',p[0],p[1],{cave:true})}catch(e){}}
  for(let i=0;i<4;i++){const p=spot();if(p)for(let k=0;k<3;k++)try{spawnMonster('goblin_swamp',p[0]+rr(4),p[1]+rr(4),{cave:true,tox:true})}catch(e){}}
  for(let i=0;i<10;i++){const p=spot();if(p)spawnTX('gifspin','spider',p[0],p[1],{h:1.6,tint:0x8aff3a})}
  for(let i=0;i<6;i++){const p=spot(RT-220);if(p)spawnTX('gifork','orc1',p[0],p[1],{h:3.3,tint:0x9ad84a})}
  {const p=spot(60,BREW.x,BREW.z+30);if(p)for(let k=0;k<2;k++)spawnTX('gifork','orc1',p[0]+rr(4),p[1]+rr(4),{h:3.3,tint:0x9ad84a})}
  /* green crystals to find */
  for(let i=0;i<12;i++){const p=spot();if(p)try{makePickup(p[0],p[1],'gifkristal',1)}catch(e){}}
  /* the poison dragon in the crater */
  try{const md=makeDragon;makeDragon=()=>md(0x4a8a1a,0x22400c);try{TV.dragon=spawnMonster('dragon',TX+CR.x,TZ+CR.z,{cave:true,tox:true,name:'Gifdraak Virulax',sub:'Heerser van de Gifvallei',boss:'virulax',hp:9000,hpMax:9000,dmg:58,xp:6000})}finally{makeDragon=md}}catch(e){console.warn('virulax',e)}
  if(TV.dragon)drakeLook(TV.dragon);
  console.log('Gifvallei built in',Math.round(performance.now()-t0),'ms')}
TV.build=build;
/* Virulax is the Ashwing Drake of Literock Studios: a wyvern that walks on its wing-hands, painted poison green */
function drakeLook(a){if(!window.EX||!EX.loadLR||(a.model&&a.model.drake))return;EX.loadLR('drake').then(g=>{if(!g||a.drake)return;const c=T.SkeletonUtils.clone(g.scene),tc=new T.Color(0xa8f070),done=new Map();
    c.traverse(m=>{if(!m.isMesh)return;m.frustumCulled=false;const f=x=>{if(!done.has(x)){const y=x.clone();y.color.multiply(tc);if(y.emissive)y.emissive.setHex(0x0c2a04);done.set(x,y)}return done.get(x)};m.material=Array.isArray(m.material)?m.material.map(f):f(m.material)});
    c.scale.setScalar(1.5);a.root.traverse(o=>{if(o.isMesh||o.isSprite)o.visible=false});a.root.add(c);if(a._sp&&a._sp.hid)for(const [o,mk] of a._sp.list)o.layers.mask=mk;a._sp=null;a.root.userData.cullHid=false;
    const mx=new T.AnimationMixer(c),acts={};for(const cl of g.animations)acts[cl.name]=mx.clipAction(cl);a.drake={c,mx,acts,cur:null,one:0};drakePlay(a.drake,'idle_loop')})}
function drakePlay(z,n,once){const A=z.acts[n];if(!A||z.cur===n)return;A.reset();if(once){A.setLoop(T.LoopOnce,1);A.clampWhenFinished=false;z.one=A.getClip().duration*.9}A.fadeIn(.25).play();if(z.cur&&z.acts[z.cur])z.acts[z.cur].fadeOut(.25);z.cur=n}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;const D=TV.dragon;if(!D||!D.drake||D.dead||!inT(PL.x))return;const z=D.drake;
  if(z.one>0){z.one-=dt}else{const air=D.aq!==undefined&&D.aq-groundH(D.x,D.z)>2;let want=air?'fly_loop':(D.brT>0?'roar':(D.vel||0)>.6?'walk_loop':'idle_loop');
    if(!air&&D.state==='chase'&&!z.met){z.met=1;want='roar';drakePlay(z,'roar',true)}else if(!air&&D.state==='chase'&&Math.hypot(PL.x-D.x,PL.z-D.z)<7&&(D.cd||0)>0&&Math.random()<dt*2)drakePlay(z,'bite',true);else drakePlay(z,want)}
  z.mx.update(dt*((D.vel||0)>4?1.3:1))});
LINES.gif=['Zonder masker hou je het hier niet lang vol.','Mijn tegengif is het beste van het hele moeras.','Blijf uit het zuur! Daar helpt geen masker tegen.','Diep in de krater slaapt Virulax, de gifdraak.','Breng me gifkristallen, ik betaal goed.','De oude brouwerij in het westen... daar ligt nog een kist.'];
{const _ka=killActor;killActor=function(a,by){const was=a&&!a.dead;_ka(a,by);try{if(was&&by&&a===TV.dragon){const first=!PL.fx.virulax;PL.fx.virulax=1;dropLoot(a.x,a.z+3,{gold:first?12000:5000,items:first?[['amu_virulax',1],['zuurzwaard',1],['gifschild',1],['gifkristal',4]]:[[pick(['amu_virulax','zuurzwaard','gifschild']),1],['gifkristal',3]]});
  if(first)setTimeout(()=>{try{WD.kingdom.card('💚 Virulax is verslagen!','De gifdraak zakt neer in zijn krater. Het zuur borrelt minder fel. Hij liet zijn gifhart, zijn zuurzwaard en een schild van zijn schubben achter.')}catch(e){}},1200)}}catch(e){}}}
/* ---------- in and out: a stinking tunnel at the edge of the Trollenmoeras ---------- */
let ENT=null;
function entrance(){const S=SITE.swamp;if(!S)return;let best=null;for(let i=0;i<36&&!best;i++){const a=i/36*6.283+.4;for(const r of[S.r*.95,S.r*1.1,S.r*1.25]){const x=S.x+Math.cos(a)*r,z=S.z+Math.sin(a)*r;if(groundH(x,z)>.8&&!inBuilding(x,z,3)){best={x,z,a};break}}}if(!best)return;
  const K=window.KIT,y=groundH(best.x,best.z),G2=new T.Group();scene.add(G2);const ox=Math.cos(best.a),oz=Math.sin(best.a),px=-oz,pz=ox;
  if(K&&K.Bag){const B=K.Bag();mouth(B,G2,best.x,best.z,ox,oz,groundH);
    for(let k=0;k<5;k++){const x=best.x-ox*(3+Math.random()*3)+px*rr(6),z=best.z-oz*(3+Math.random()*3)+pz*rr(6);B.model('Barrel',x,groundH(x,z),z,Math.random()*6,1,{tint:0x8ad83a,rz:Math.random()<.5?Math.PI/2:0})}
    for(const s of[-1,1]){const x=best.x+px*s*8-ox*2,z=best.z+pz*s*8-oz*2;B.model('DeadTree_'+(s>0?2:4),x,groundH(x,z)-.2,z,Math.random()*6,.7,{tint:0x6a6a48})}B.build(G2)}
  ENT={x:best.x+ox*1.3,z:best.z+oz*1.3,ox,oz};TV.ent=ENT}
const _bfT=buildFantasy;buildFantasy=function(){_bfT();try{entrance()}catch(e){console.warn('gif entrance',e)}};
function go(x,z){if(PL.mounted)try{dismount()}catch(e){}PL.x=x;PL.z=z;PL.y=groundH(x,z)+.2;PL.vy=0}
function tunnel(fn){const f=WD.fadeGo;if(f)f(fn);else fn()}
let busy=0;
ANIMS.push(dt=>{if(!started||PL.dead||busy)return;
  if(ENT&&!PL.inCave&&!PL.mounted&&Math.abs(PL.x-ENT.x)<1.6&&Math.abs(PL.z-ENT.z)<1.6){busy=1;tunnel(()=>{build();go(TX+ARR.x+2,TZ+ARR.z+18);PL.fx=PL.fx||{};if(!PL.fx.seenGif){PL.fx.seenGif=1;giveXp(600);try{WD.kingdom.card('💚 De Gifvallei','Een stinkende tunnel brengt je in een vergiftigde vallei. De lucht is giftig! Koop een gifmasker of tegengif bij Alchemist Vira, hier vlak bij. Blijf uit het groene zuur.',null,12)}catch(e){}}});setTimeout(()=>busy=0,3000);return}
  if(TV.exit&&inT(PL.x)&&Math.abs(PL.x-TV.exit.x)<1.6&&Math.abs(PL.z-TV.exit.z)<1.6&&ENT){busy=1;tunnel(()=>go(ENT.x-ENT.ox*5,ENT.z-ENT.oz*5));setTimeout(()=>busy=0,3000)}});
/* ---------- the poison: the air, and the acid ---------- */
TV.air=0;let warned=false,tick=0;
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!started)return;if(inT(PL.x)&&!TV.built&&!TV.loading){TV.loading=true;build()}if(!TV.built)return;
  const here=inT(camera.position.x);G.visible=here;if(!here||PL.dead)return;if(TV.acid){TV.acid.emissiveIntensity=.35+Math.sin(PL.t*1.7)*.1;if(TV.acid.map){TV.acid.map.offset.x=PL.t*.01;TV.acid.map.offset.y=PL.t*.006}}
  const safe=Math.hypot(PL.x-TX-ARR.x,PL.z-TZ-ARR.z)<48,mask=(PL.inv.gifmasker||0)>0,anti=PL.buff&&PL.buff.fx&&PL.buff.fx.tox&&PL.buff.t>0;
  tick-=dt;if(tick>0)return;tick=1;
  if(!safe&&!mask&&!anti){TV.air++;const d=Math.max(2,PL.hpMax*.02)*(TV.air>40?1.6:1);PL.hp-=d;floatText(PL.x,PL.y+2.2,PL.z,'gif -'+Math.round(d),'#9aff4a');
    if(!warned){warned=true;addLog('Je ademt giflucht in! Koop een gifmasker of tegengif bij Alchemist Vira.','#9aff4a')}if(PL.hp<=0){PL.hp=0;playerDie()}}
  else TV.air=0;
  /* acid burns, mask or not */
  if(groundH(PL.x,PL.z)<-.6&&PL.y<.4){PL.hp-=12;PL.poisonT=Math.max(PL.poisonT||0,3);floatText(PL.x,PL.y+2.2,PL.z,'zuur!','#c8ff4a');if(PL.hp<=0){PL.hp=0;playerDie()}}});
/* ---------- the little map ---------- */
const _dmT=drawMini;drawMini=function(){if(!inT(PL.x))return _dmT();const c=$('mini'),g=c.getContext('2d'),S=150,k=S/220;g.fillStyle='#2a3418';g.fillRect(0,0,S,S);
  g.fillStyle='rgba(140,255,50,.55)';for(const L of LK){g.beginPath();g.arc(S/2+(TX+L.x-PL.x)*k,S/2+(TZ+L.z-PL.z)*k,L.r*k,0,7);g.fill()}
  for(const a of actors){if(a.dead||a.kind!=='enemy'||!inT(a.x))continue;const dx=(a.x-PL.x)*k,dz=(a.z-PL.z)*k;if(Math.abs(dx)<75&&Math.abs(dz)<75){g.fillStyle=a.boss?'#ff4a2a':'#e5913f';g.fillRect(S/2+dx-2,S/2+dz-2,4,4)}}
  g.fillStyle='#ffd27a';g.beginPath();g.arc(S/2,S/2,3.5,0,7);g.fill();g.fillStyle='#d8ff9a';g.font='bold 12px serif';g.textAlign='center';g.fillText('De Gifvallei',S/2,14)};
})();
