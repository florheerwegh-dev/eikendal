/* ================= The haunted ruin of Dornwacht and the dungeon beneath it =================
   - Het spookkasteel: at night the ruin of Dornwacht comes alive. Ghosts drift between the walls and three soul stones
     glow among the stones. Gather them and lay them on the old altar: the Ghost Knight, Heer Morwen, rises. Beat him
     and the curse is lifted: the ghosts find rest and you get his ghost blade.
   - De kerker: a dark stair in the ruin leads down (through a dark tunnel) into the dungeon of the Forgotten King, with
     a corridor where a boulder rolls (hide in the niches), a hall of spikes that rise in turn, three levers and a riddle,
     a floor that crumbles under your feet above a pit, a door that is false, and a cracked wall that is not... and
     behind it the Forgotten King himself and his treasure. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}},chron=t=>{try{WD.chron.add(t)}catch(e){}},FX=()=>{PL.fx=PL.fx||{};return PL.fx};
const RU={x:360,z:330},night=()=>ENV.time<5.5||ENV.time>20.5;
Object.assign(ITEMS,{zielesteen:{n:'Zielesteen',g:'mat',price:0,ico:'🔮',rar:'e',desc:'Een koude, blauw gloeiende steen uit de ruïne van Dornwacht.'},
  spookzwaard:{n:'Spookzwaard van Morwen',g:'weapon',kind:'sword',dmg:78,spd:.5,rng:3,price:5000,ico:'⚔',col:0x9ad8ff,rar:'l'},
  zegelring:{n:'Zegelring van de Vergeten Koning',g:'amulet',fx:{gold:.3,hp:40,dmg:6},col:0xe0b04a,price:6000,ico:'💍',rar:'l',desc:'De ring van een koning die niemand zich herinnert.'}});
/* ---------- the haunted ruin ---------- */
const HA={ghosts:[],stones:[],knight:null,altar:null};
function ghostMat(o){o.traverse(m=>{if(m.isMesh&&m.material){m.material=m.material.clone();m.material.transparent=true;m.material.opacity=.45;if(m.material.emissive)m.material.emissive.setHex(0x3a7aff);if(m.material.color)m.material.color.lerp(new T.Color(0x9ad8ff),.6);m.material.depthWrite=false}})}
function buildHaunt(){const y=groundH(RU.x,RU.z);const al=new T.Group();al.position.set(RU.x+4,y,RU.z+4);al.add(mesh(new T.BoxGeometry(2.4,1,1.4),MAT.stone||new T.MeshStandardMaterial({color:0x7a756a}),0,.5,0));scene.add(al);addBox(RU.x+2.8,RU.z+3.3,RU.x+5.2,RU.z+4.7);HA.altar=al;
  addInter(RU.x+4,RU.z+5.6,3,()=>FX().curseLifted?'':(PL.inv.zielesteen||0)>=3?'Leg de drie zielestenen op het altaar':night()?'Het oude altaar ('+(PL.inv.zielesteen||0)+'/3 zielestenen)':'',altar);
  const spots=[[-22,-18],[24,-12],[-8,24]];spots.forEach(([dx,dz],i)=>{const x=RU.x+dx,z=RU.z+dz,m=new T.Mesh(new T.OctahedronGeometry(.35,0),new T.MeshBasicMaterial({color:0x7ac8ff}));m.position.set(x,groundH(x,z)+.7,z);m.visible=false;scene.add(m);
    const s={m,x,z,i};HA.stones.push(s);INTER.push({x,z,r:2.2,txt:()=>night()&&!FX()['soul'+i]&&!FX().curseLifted?'Pak de gloeiende zielesteen':'',fn:()=>{if(!night()||FX()['soul'+i])return;FX()['soul'+i]=1;giveItem('zielesteen',1,true);sfx('pickup');addLog('Een ijskoude zielesteen... ('+(PL.inv.zielesteen||0)+'/3)','#9ad8ff')}})})}
function altar(){if(FX().curseLifted||(PL.inv.zielesteen||0)<3||HA.knight)return;takeItem('zielesteen',3);sfx('thunder');
  const h=makeHuman({tunic:0x3a4a6a,pants:0x2a3040,armor:1,hat:'helm',hatc:0x6a7a8a,cape:0x1a2a4a,scale:1.35,eye:0x9ad8ff});try{setHeld(h,'sword_knight')}catch(e){}ghostMat(h.g);
  const a=baseActor({kind:'enemy',type:'skeleton',name:'De Spookridder, Heer Morwen',h,root:h.g,x:RU.x+4,z:RU.z+10,hp:2400,hpMax:2400,dmg:34,speed:4.4,aggro:40,range:2.4,rad:.6,hh:2.9,xp:2600,loot:'skeleton',boss:'spookridder',respawn:1e12,provoked:true});scene.add(a.root);placeActor(a);HA.knight=a;
  card('👻 De Spookridder!','De drie zielestenen flitsen op. Uit de grond rijst een ridder van mist en maanlicht: Heer Morwen, die hier al honderd jaar spookt. "Wie verstoort mijn rust?"',null,9)}
const _kaK=killActor;killActor=function(a,by){const was=a&&a.dead;_kaK(a,by);if(was||!a)return;
  if(a===HA.knight){FX().curseLifted=1;giveItem('spookzwaard',1,true);PL.gold+=1500;sfx('level');for(const g of HA.ghosts){g.dead=true;g.gone=true;if(g.root)scene.remove(g.root)}HA.ghosts=[];
    card('🕊 De vloek is opgeheven!','Heer Morwen zakt neer en zucht: "Eindelijk... rust." De geesten van Dornwacht lossen op in het maanlicht. Je krijgt zijn Spookzwaard en 1500 goud.',null,11);chron('Hief de vloek van Dornwacht op.')}
  if(a===DG.king){FX().kingBeaten=1;card('👑 De Vergeten Koning is verslagen','Zijn kroon rolt over de vloer. Achter hem staat een kist vol goud...',null,8)}};
/* ghosts at night */
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!started)return;const n=night()&&!FX().curseLifted,near=Math.hypot(PL.x-RU.x,PL.z-RU.z)<160&&!PL.inCave;
  for(const s of HA.stones){s.m.visible=n&&!FX()['soul'+s.i];if(s.m.visible){s.m.rotation.y+=dt*2;s.m.position.y=groundH(s.x,s.z)+.7+Math.sin(PL.t*2+s.i)*.15}}
  HA.ghosts=HA.ghosts.filter(g=>!g.dead);if(n&&near&&HA.ghosts.length<4&&Math.random()<dt*.5){try{const g=spawnMonster('wraith',RU.x+rr(28),RU.z+rr(28),{name:'Geest van Dornwacht',respawn:1e12});ghostMat(g.root);HA.ghosts.push(g)}catch(e){}}
  if(!n||!near)for(const g of HA.ghosts){if(!g.provoked||!n){g.dead=true;g.gone=true;if(g.root)scene.remove(g.root)}}
  if(n&&near&&Math.random()<dt*.06)try{sfx('chirp')}catch(e){}});
/* ---------- the dungeon (x 120000) ---------- */
const KX=120000,KZ=0,inK=x=>x>110000&&x<130000,W=2.2;
WD.regions=WD.regions||[];WD.regions.push({x0:110000,x1:130000,name:'De Kerker van de Vergeten Koning',in:'in de kerker',adv:'de kerker onder Dornwacht'});
const DG={built:false,tiles:[],levers:[],seq:[],door:null,doorCol:null,boulder:null,spikes:[],king:null,hidden:null,hidCol:null,chestOpen:false};WD.dungeon=DG;
/* the floor: flat, except the pit under the crumbling bridge */
const PIT={u0:-7,u1:7,v0:114,v1:138};
function kH(x,z){const u=x-KX,v=z-KZ;if(u>PIT.u0&&u<PIT.u1&&v>PIT.v0&&v<PIT.v1){for(const t of DG.tiles)if(!t.gone&&Math.abs(u-t.u)<1.5&&Math.abs(v-t.v)<1.5)return 0;return -9}return 0}
const _gK=groundH;groundH=function(x,z){return inK(x)?kH(x,z):_gK(x,z)};
const _tK=terrainH;terrainH=function(x,z){return inK(x)?kH(x,z):_tK(x,z)};
const _cK=gtClamp;gtClamp=function(P){if(!inK(P.x))return _cK(P);const u=P.x-KX,v=P.z-KZ;P.x=KX+Math.max(-11,Math.min(22,u));P.z=KZ+Math.max(-2,Math.min(150,v))};
const _dmK=drawMini;drawMini=function(){if(!inK(PL.x))return _dmK();const c=$('mini'),g=c.getContext('2d'),S=150;g.fillStyle='#120e0a';g.fillRect(0,0,S,S);g.fillStyle='#c9a46a';g.font='bold 13px serif';g.textAlign='center';g.fillText('Kerker',S/2,14);
  const k=S/90,v=PL.z-KZ;g.fillStyle='#3a3024';for(const [u0,v0,u1,v1] of ROOMS)g.fillRect(S/2+(u0-(PL.x-KX))*k,S/2+(v0-v)*k,(u1-u0)*k,(v1-v0)*k);g.fillStyle='#ffd27a';g.beginPath();g.arc(S/2,S/2,3,0,6.283);g.fill()};
/* rooms (u0, v0, u1, v1): hall, boulder corridor, spike hall, lever hall, pit hall, treasure room */
const ROOMS=[[-8,-2,8,20],[-2,20,2,60],[-8,60,8,85],[-8,85,8,110],[-8,110,8,142],[8,118,22,134],[7.5,122,8.5,130]];   /* the last one is the secret passage, closed by the cracked wall */
const NICHES=[30,40,50];
/* rooms that follow each other along v share their edge row, so there is no wall between them */
function inRooms(u,v){return ROOMS.some(([u0,v0,u1,v1])=>u>u0&&u<u1&&v>=v0&&v<=v1)||NICHES.some(n=>Math.abs(v-n)<1.4&&u>1.5&&u<4)}
function buildDungeon(){if(DG.built)return;DG.built=true;const G=new T.Group();scene.add(G);DG.G=G;
  const stone=new T.MeshStandardMaterial({color:0x5a544c,roughness:1}),dark=new T.MeshStandardMaterial({color:0x2a2622,roughness:1}),gold=new T.MeshStandardMaterial({color:0xe0b04a,metalness:.6,roughness:.35,emissive:0x3a2008});
  /* floor and ceiling of every room, and walls on a 1 m grid wherever the rooms end */
  for(const [u0,v0,u1,v1] of ROOMS){const f=new T.Mesh(new T.PlaneGeometry(u1-u0,v1-v0),stone);f.rotation.x=-Math.PI/2;f.position.set(KX+(u0+u1)/2,.01,KZ+(v0+v1)/2);f.receiveShadow=true;G.add(f);const c=f.clone();c.material=dark;c.rotation.x=Math.PI/2;c.position.y=5.5;G.add(c)}
  const wallGeo=new T.BoxGeometry(1,5.5,1),walls=[];for(let u=-12;u<=23;u++)for(let v=-3;v<=143;v++){if(inRooms(u,v))continue;if(!(inRooms(u+1,v)||inRooms(u-1,v)||inRooms(u,v+1)||inRooms(u,v-1)))continue;walls.push([u,v])}
  {const im=new T.InstancedMesh(wallGeo,stone,walls.length),m=new T.Matrix4();walls.forEach(([u,v],i)=>{m.makeTranslation(KX+u,2.75,KZ+v);im.setMatrixAt(i,m);addBox(KX+u-.5,KZ+v-.5,KX+u+.5,KZ+v+.5)});G.add(im)}
  /* the pit and its crumbling tiles */
  {const p=new T.Mesh(new T.PlaneGeometry(PIT.u1-PIT.u0,PIT.v1-PIT.v0),new T.MeshBasicMaterial({color:0x050302}));p.rotation.x=-Math.PI/2;p.position.set(KX,-.02,KZ+(PIT.v0+PIT.v1)/2);G.add(p);
    for(let v=PIT.v0+1.5;v<PIT.v1;v+=3)for(let u=-4.5;u<=4.5;u+=3){const m=new T.Mesh(new T.BoxGeometry(2.9,.4,2.9),stone);m.position.set(KX+u,-.2,KZ+v);G.add(m);DG.tiles.push({u,v,m,t:-1,gone:false})}}
  /* torches */
  for(const [u,v] of[[-7.4,8],[7.4,8],[-7.4,72],[7.4,72],[-7.4,97],[7.4,97],[-7.4,126],[21.4,126]]){const f=new T.Mesh(new T.SphereGeometry(.18,8,6),new T.MeshBasicMaterial({color:0xffb050}));f.position.set(KX+u,3,KZ+v);G.add(f)}
  for(const v of[10,72,98,126]){const l=new T.PointLight(0xffa860,1.2,26,1.6);l.position.set(KX,4,KZ+v);G.add(l)}
  /* the stair up and the way back */
  for(let i=0;i<6;i++)G.add(mesh(new T.BoxGeometry(4,.3,1),stone,KX,i*.35,KZ+.5-i*.4));INTER.push({x:KX,z:KZ+1,r:3,cave:true,txt:'Klim de trap op naar de ruïne',fn:()=>{fade(()=>go(RU.x+10,RU.z+6))}});
  /* the boulder */
  DG.boulder={m:new T.Mesh(new T.SphereGeometry(1.6,16,12),dark),v:-99,cd:3};G.add(DG.boulder.m);DG.boulder.m.visible=false;
  /* spikes in rows that rise in turn */
  for(let v=63;v<84;v+=3){const row=[];for(let u=-6.5;u<=6.5;u+=1.6){const s=new T.Mesh(new T.ConeGeometry(.22,1.1,6),new T.MeshStandardMaterial({color:0x9a9aa0,metalness:.7,roughness:.4}));s.position.set(KX+u,-.6,KZ+v);G.add(s);row.push(s)}DG.spikes.push({v,row,ph:(v-63)/3})}
  /* three levers and the riddle; the door to the pit hall */
  const LV=[['Zon',-6],['Maan',0],['Ster',6]];LV.forEach(([n,u])=>{const g=new T.Group();g.position.set(KX+u,1.2,KZ+86);g.add(mesh(new T.BoxGeometry(.6,.6,.3),dark,0,0,0));const hnd=mesh(new T.CylinderGeometry(.05,.05,.9,6),gold,0,.35,.1);hnd.rotation.x=.6;g.add(hnd);G.add(g);
    const L={n,g,hnd,down:false};DG.levers.push(L);INTER.push({x:KX+u,z:KZ+87.4,r:1.8,cave:true,txt:()=>DG.doorOpen?'':'Trek aan de hendel: '+n,fn:()=>lever(L)})});
  {const cv=document.createElement('canvas');cv.width=512;cv.height=256;const q=cv.getContext('2d');q.fillStyle='#3a3024';q.fillRect(0,0,512,256);q.fillStyle='#e8d4a8';q.font='italic 26px serif';q.textAlign='center';
    ['Wat in de nacht het grootst is, komt eerst.','Wat met duizenden fonkelt, komt daarna.','Wat de dag brengt, komt als laatste.'].forEach((t,i)=>q.fillText(t,256,80+i*48));const p=new T.Mesh(new T.PlaneGeometry(6,3),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv)}));p.position.set(KX,3.2,KZ+85.6);G.add(p)}
  DG.door=new T.Mesh(new T.BoxGeometry(16,5.5,.6),new T.MeshStandardMaterial({color:0x4a3a2a,roughness:.9}));DG.door.position.set(KX,2.75,KZ+110);G.add(DG.door);DG.doorCol=addBox(KX-8,KZ+109.6,KX+8,KZ+110.4);
  /* the false door at the end of the pit hall, and the cracked wall to the treasure room */
  G.add(mesh(new T.BoxGeometry(3,4,.3),new T.MeshStandardMaterial({color:0x5a4030}),KX,2,KZ+141.6));INTER.push({x:KX,z:KZ+140,r:2.5,cave:true,txt:'Open de grote deur',fn:()=>{addLog('De deur is nep: erachter zit massief steen! Er moet een andere weg zijn...','#e5766a');try{damagePlayer(6,null)}catch(e){}}});
  const crack=new T.Mesh(new T.PlaneGeometry(2.2,3),new T.MeshBasicMaterial({color:0x1a1410,transparent:true,opacity:.6}));crack.rotation.y=-Math.PI/2;crack.position.set(KX+7.45,1.6,KZ+126);G.add(crack);
  DG.hidden=new T.Mesh(new T.BoxGeometry(1,5.5,8),stone);DG.hidden.position.set(KX+8,2.75,KZ+126);G.add(DG.hidden);DG.hidCol=addBox(KX+7.5,KZ+122,KX+8.5,KZ+130);
  INTER.push({x:KX+6.2,z:KZ+126,r:2.2,cave:true,txt:()=>DG.hidOpen?'':'Er zit een barst in de muur... duw ertegen',fn:()=>{if(DG.hidOpen)return;DG.hidOpen=true;DG.hidCol.off=true;let t=0;const f=()=>{t+=.02;DG.hidden.position.y=2.75-t*5.6;if(t<1)requestAnimationFrame(f)};f();sfx('thunder');addLog('Met een zware zucht schuift de muur weg. Een geheime gang!','#ffd27a');if(!DG.king)king()}});
  /* the treasure */
  G.add(mesh(new T.BoxGeometry(1.6,1,1),gold,KX+19,.5,KZ+126));INTER.push({x:KX+17.6,z:KZ+126,r:2.4,cave:true,txt:()=>FX().kerkerSchat?'':'Open de kist van de Vergeten Koning',fn:()=>{if(FX().kerkerSchat)return;if(DG.king&&!DG.king.dead){addLog('De Vergeten Koning bewaakt zijn schat nog!','#e5766a');return}
    FX().kerkerSchat=1;PL.gold+=2500;giveItem('zegelring',1,true);if(ITEMS.gem)giveItem('gem',4,true);giveXp(2000);sfx('level');card('💰 De schat van de Vergeten Koning','2500 goud, vier edelstenen en de Zegelring van de Vergeten Koning! Je hebt de kerker van Dornwacht overwonnen.',null,11);chron('Overwon de kerker van de Vergeten Koning.')}})}
function king(){if(FX().kingBeaten)return;try{const a=spawnEnemy('skeleton',KX+15,KZ+126,{name:'De Vergeten Koning',hp:1800,hpMax:1800,dmg:30,xp:2200,boss:'vergetenkoning',respawn:1e12,cave:true,provoked:true});a.cave=true;try{a.root.scale.setScalar(1.45)}catch(e){}DG.king=a}catch(e){console.warn('king',e)}}
function lever(L){if(DG.doorOpen)return;L.down=!L.down;L.hnd.rotation.x=L.down?-.6:.6;sfx('click');if(!L.down){DG.seq=DG.seq.filter(n=>n!==L.n);return}DG.seq.push(L.n);
  const want=['Maan','Ster','Zon'];if(DG.seq.some((n,i)=>want[i]!==n)){addLog('Klik... een pijltje schiet uit de muur! Verkeerde volgorde.','#e5766a');try{damagePlayer(8,null)}catch(e){}DG.seq=[];for(const l of DG.levers){l.down=false;l.hnd.rotation.x=.6}return}
  if(DG.seq.length===3){DG.doorOpen=true;DG.doorCol.off=true;let t=0;const f=()=>{t+=.015;DG.door.position.y=2.75+t*5.4;if(t<1)requestAnimationFrame(f)};f();sfx('level');addLog('Rommelend schuift de zware deur omhoog. Goed geraden!','#9cc552')}}
function fade(fn){const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;background:#000;opacity:0;transition:opacity .6s;z-index:40;pointer-events:none;display:flex;align-items:center;justify-content:center;color:#c9a46a;font-family:var(--f-display);font-size:24px';d.textContent='Je loopt door een donkere tunnel...';document.body.appendChild(d);requestAnimationFrame(()=>d.style.opacity='1');setTimeout(()=>{try{fn()}catch(e){console.warn(e)}d.style.opacity='0';setTimeout(()=>d.remove(),700)},900)}
function go(x,z){if(PL.mounted)try{dismount()}catch(e){}PL.x=x;PL.z=z;PL.y=groundH(x,z)+.2;PL.vy=0}
WD.fadeGo=fade;
/* the traps at work */
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!DG.built||!inK(PL.x))return;const u=PL.x-KX,v=PL.z-KZ;
  /* the boulder rolls down the corridor when you are in it */
  const B=DG.boulder;if(B.v>-50){B.v-=dt*11;B.m.position.set(KX,1.6,KZ+B.v);B.m.rotation.x-=dt*7;if(Math.abs(B.v-v)<1.8&&Math.abs(u)<1.6&&!PL.dead&&!B.hit){B.hit=true;damagePlayer(30,null);PL.z=KZ+B.v-2.5;addLog('Het rotsblok rolt over je heen! Verstop je in een nis.','#e5766a')}if(B.v<20){B.v=-99;B.m.visible=false}}
  else if(v>21&&v<60){B.cd-=dt;if(B.cd<=0){B.cd=6;B.v=60;B.hit=false;B.m.visible=true;try{sfx('thunder')}catch(e){}addLog('Gerommel... er rolt iets aan!','#e5766a')}}
  /* spikes */
  const t=PL.t;for(const r of DG.spikes){const up=Math.sin(t*1.6-r.ph*1.1)>.35;for(const s of r.row)s.position.y+=((up?.5:-.6)-s.position.y)*Math.min(1,dt*12);if(up&&Math.abs(v-r.v)<1.4&&Math.abs(u)<7.5){DG.spT=(DG.spT||0)-dt;if(DG.spT<=0){DG.spT=.6;damagePlayer(14,null)}}}
  /* crumbling tiles */
  for(const T2 of DG.tiles){if(T2.gone){if(T2.t>-1){T2.t+=dt;T2.m.position.y-=dt*9;if(T2.t>6){T2.gone=false;T2.t=-1;T2.m.position.y=-.2}}continue}
    if(T2.t<0&&Math.abs(u-T2.u)<1.5&&Math.abs(v-T2.v)<1.5&&PL.y>-.5)T2.t=0;if(T2.t>=0){T2.t+=dt;T2.m.position.x=KX+T2.u+Math.sin(T2.t*60)*.04;if(T2.t>.8){T2.gone=true;T2.t=0}}}
  if(PL.y<-6&&!PL.dead){damagePlayer(20,null);go(KX,KZ+112);addLog('Je valt in de put! Rennen, de vloer brokkelt af.','#e5766a')}});
/* in and out: the dark stair in the ruin */
let ENT=null;function entrance(){const x=RU.x+10,z=RU.z+4,y=groundH(x,z),g=new T.Group();g.position.set(x,y,z);const dk=new T.MeshBasicMaterial({color:0x050302});const h=new T.Mesh(new T.PlaneGeometry(3,3.4),dk);h.rotation.x=-Math.PI/2;h.position.y=.04;g.add(h);
  for(const s of[-1,1])g.add(mesh(new T.BoxGeometry(.4,1,3.6),MAT.stone||new T.MeshStandardMaterial({color:0x7a756a}),s*1.7,.5,0));scene.add(g);ENT={x,z}}
ANIMS.push(()=>{if(!ENT||!started||PL.inCave||PL.mounted||WD._kFade)return;if(Math.abs(PL.x-ENT.x)<1.3&&Math.abs(PL.z-ENT.z)<1.5){WD._kFade=1;fade(()=>{buildDungeon();go(KX,KZ+4);if(!FX().seenKerker){FX().seenKerker=1;card('🗝 De kerker van de Vergeten Koning','Diep onder Dornwacht. Pas op voor vallen, lees de raadsels, en vertrouw niet elke deur...',null,9)}});setTimeout(()=>WD._kFade=0,3000)}});
/* the dungeon: lit like a dark cave, but not as dark as night */
const AMBK=new T.AmbientLight(0xffb070,.3);AMBK.visible=false;scene.add(AMBK);
const _ueK=updateEnv;updateEnv=function(dt,pp){_ueK(dt,pp);if(pp!==PL)return;const on=inK(PL.x);AMBK.visible=on;if(on){scene.fog.color.setHex(0x0c0a08);scene.fog.density=Math.min(scene.fog.density,.016)}};
const _bfK=buildFantasy;buildFantasy=function(){_bfK();try{buildHaunt();entrance()}catch(e){console.warn('dornwacht',e)}};
const _sgK=startGame;startGame=function(...a){_sgK(...a);try{if(inK(PL.x)){buildDungeon();PL.y=0}}catch(e){console.warn('kerker load',e)}};
})();
