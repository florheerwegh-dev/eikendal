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
