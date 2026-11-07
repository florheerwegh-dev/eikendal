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
  const spots=[[-22,-18],[24,-12],[-8,24]];spots.forEach(([dx,dz],i)=>{const x=RU.x+dx,z=RU.z+dz,m=new T.Mesh(new T.OctahedronGeometry(.35,0),new T.MeshBasicMaterial({color:0x7ac8ff}));m.position.set(x,groundH(x,z)+.7,z);m.visible=false;m.userData.dyn=true;scene.add(m);
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
const _cK=gtClamp;gtClamp=function(P){if(!inK(P.x))return _cK(P);const u=P.x-KX,v=P.z-KZ;P.x=KX+Math.max(-11,Math.min(34,u));P.z=KZ+Math.max(-2,Math.min(150,v))};
const _dmK=drawMini;drawMini=function(){if(!inK(PL.x))return _dmK();const c=$('mini'),g=c.getContext('2d'),S=150;g.fillStyle='#120e0a';g.fillRect(0,0,S,S);g.fillStyle='#c9a46a';g.font='bold 13px serif';g.textAlign='center';g.fillText('Kerker',S/2,14);
  const k=S/90,v=PL.z-KZ;g.fillStyle='#3a3024';for(const [u0,v0,u1,v1] of ROOMS)g.fillRect(S/2+(u0-(PL.x-KX))*k,S/2+(v0-v)*k,(u1-u0)*k,(v1-v0)*k);g.fillStyle='#ffd27a';g.beginPath();g.arc(S/2,S/2,3,0,6.283);g.fill()};
/* rooms (u0, v0, u1, v1): hall, boulder corridor, spike hall, lever hall, pit hall, treasure room */
const ROOMS=[[-8,-2,8,20],[-2,20,2,60],[-8,60,8,85],[-8,85,8,110],[-8,110,8,142],[8,110,34,142],[7.5,122,8.5,130]];   /* the last one is the secret passage, closed by the cracked wall */
const NICHES=[30,40,50];
/* rooms that follow each other along v share their edge row, so there is no wall between them */
function inRooms(u,v){return ROOMS.some(([u0,v0,u1,v1])=>u>u0&&u<u1&&v>=v0&&v<=v1)||NICHES.some(n=>Math.abs(v-n)<1.4&&u>1.5&&u<4)}
function buildDungeon(){if(DG.built)return;DG.built=true;const G=new T.Group();scene.add(G);DG.G=G;
  const stone=new T.MeshStandardMaterial({color:0x5a544c,roughness:1}),dark=new T.MeshStandardMaterial({color:0x2a2622,roughness:1}),gold=new T.MeshStandardMaterial({color:0xe0b04a,metalness:.6,roughness:.35,emissive:0x3a2008});
  /* floor and ceiling of every room, and walls on a 1 m grid wherever the rooms end */
  for(const [u0,v0,u1,v1] of ROOMS){const f=new T.Mesh(new T.PlaneGeometry(u1-u0,v1-v0),stone);f.rotation.x=-Math.PI/2;f.position.set(KX+(u0+u1)/2,.01,KZ+(v0+v1)/2);f.receiveShadow=true;G.add(f);const c=f.clone();c.material=dark;c.rotation.x=Math.PI/2;c.position.y=u0===8&&v0===110?11:5.5;G.add(c)}
  const wallGeo=new T.BoxGeometry(1,5.5,1),walls=[];for(let u=-12;u<=35;u++)for(let v=-3;v<=143;v++){if(inRooms(u,v))continue;if(!(inRooms(u+1,v)||inRooms(u-1,v)||inRooms(u,v+1)||inRooms(u,v-1)))continue;walls.push([u,v])}
  {const im=new T.InstancedMesh(wallGeo,stone,walls.length),m=new T.Matrix4();walls.forEach(([u,v],i)=>{m.makeTranslation(KX+u,2.75,KZ+v);im.setMatrixAt(i,m);addBox(KX+u-.5,KZ+v-.5,KX+u+.5,KZ+v+.5)});G.add(im)}
  /* the pit and its crumbling tiles */
  {const p=new T.Mesh(new T.PlaneGeometry(PIT.u1-PIT.u0,PIT.v1-PIT.v0),new T.MeshBasicMaterial({color:0x050302}));p.rotation.x=-Math.PI/2;p.position.set(KX,-.02,KZ+(PIT.v0+PIT.v1)/2);G.add(p);
    for(let v=PIT.v0+1.5;v<PIT.v1;v+=3)for(let u=-4.5;u<=4.5;u+=3){const m=new T.Mesh(new T.BoxGeometry(2.9,.4,2.9),stone);m.position.set(KX+u,-.2,KZ+v);G.add(m);DG.tiles.push({u,v,m,t:-1,gone:false})}}
  /* torches */
  for(const [u,v] of[[-7.4,8],[7.4,8],[-7.4,72],[7.4,72],[-7.4,97],[7.4,97],[-7.4,126]]){const f=new T.Mesh(new T.SphereGeometry(.18,8,6),new T.MeshBasicMaterial({color:0xffb050}));f.position.set(KX+u,3,KZ+v);G.add(f)}
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
  INTER.push({x:KX+27.8,z:KZ+126,r:2.6,cave:true,txt:()=>FX().kerkerSchat?'':'Open de kist van de Vergeten Koning',fn:()=>{if(FX().kerkerSchat)return;if(DG.king&&!DG.king.dead){addLog('De Vergeten Koning bewaakt zijn schat nog!','#e5766a');return}
    FX().kerkerSchat=1;PL.gold+=2500;giveItem('zegelring',1,true);if(ITEMS.gem)giveItem('gem',4,true);giveXp(2000);sfx('level');card('💰 De schat van de Vergeten Koning','2500 goud, vier edelstenen en de Zegelring van de Vergeten Koning! Je hebt de kerker van Dornwacht overwonnen.',null,11);chron('Overwon de kerker van de Vergeten Koning.')}})}
function king(){if(FX().kingBeaten)return;try{const a=spawnEnemy('skeleton',KX+23,KZ+126,{name:'De Vergeten Koning',hp:1800,hpMax:1800,dmg:30,xp:2200,boss:'vergetenkoning',respawn:1e12,cave:true,provoked:true});a.cave=true;try{a.root.scale.setScalar(1.45)}catch(e){}DG.king=a;try{WD.grafkamer&&WD.grafkamer.kingUp(a)}catch(e){}}catch(e){console.warn('king',e)}}
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

/* ================= De Grafkamer van de Vergeten Koning =================
   The secret room behind the cracked wall in the dungeon under Dornwacht is now a great royal tomb: a hall of 26 by 32
   metres and 11 metres high, with a marble floor, giant columns with golden tops, a royal carpet, blue spirit flames,
   skeleton guards in niches, heaps of gold and jewels, floating dust and ghosts circling the tomb. At the far end, on
   a raised platform, stand the sarcophagus, a colossal statue of the king with glowing eyes and an ornate chest whose
   lid really opens.
   The fight is grander too: a short film when the wall opens, the king is bigger with a golden crown and a ghostly
   aura, and at two thirds and one third of his life he calls skeletons out of the niches. The chest also holds his
   crown and his sword now. */
(function(){
const KX=120000,KZ=0,DG=WD.dungeon,FX=()=>{PL.fx=PL.fx||{};return PL.fx},rr=(a=1)=>(Math.random()*2-1)*a,H=11;
Object.assign(ITEMS,{kroon_vk:{n:'Kroon van de Vergeten Koning',g:'head',def:9,fx:{hp:160,regen:1},hat:'crown',price:9000,ico:'👑',col:0xe0b04a,rar:'l'},zwaard_vk:{n:'Zwaard der Vergeten Koningen',g:'weapon',kind:'sword',dmg:64,spd:.5,rng:2.8,price:12000,ico:'⚔',col:0x7ad8ff,rar:'l'}});
try{installItemIcons()}catch(e){}
addEventListener('load',()=>{try{WD.iconen.V.zwaard_vk=['sword_knight',0x7ad8ff,'👻'];WD.iconen.E.kroon_vk=['👑',0x3a2a5a,'💀']}catch(e){}});
/* the raised platform: a gentle slope up, so you can walk onto it */
const _gG=groundH;groundH=function(x,z){if(x>110000&&x<130000){const h=_gG(x,z),u=x-KX,v=z-KZ;if(u>26.4&&u<33.8&&v>119.6&&v<132.4)return Math.max(h,Math.min(1,(u-26.4)/2.2)*.7);return h}return _gG(x,z)};
function Bag(){const L=new Map();const add=(geo,m,x,y,z,ry=0,rx=0,rz=0,sx=1,sy=1,sz=1)=>{const g=geo.index?geo.toNonIndexed():geo.clone();for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);g.clearGroups();
    g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz)));if(!L.has(m))L.set(m,[]);L.get(m).push(g)};
  return{add,box:(w,h,d,m,x,y,z,ry=0,rx=0,rz=0)=>add(new T.BoxGeometry(w,h,d),m,x,y,z,ry,rx,rz),cyl:(a,b,h,m,x,y,z,s=12,rx=0,rz=0)=>add(new T.CylinderGeometry(a,b,h,s),m,x,y,z,0,rx,rz),
    build(G){for(const [m,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const q of mg?[mg]:gs){const me=new T.Mesh(q,m);me.receiveShadow=true;G.add(me)}}}}}
const tex=(w,h,f,rx=1,ry=1)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=4;return t};
const glowT=tex(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const R2=(a,b)=>a+Math.random()*(b-a),FL=[],WISP=[],LID={};let dust=null,done=false;
function glow(G,x,y,z,col,s){const sp=new T.Sprite(new T.SpriteMaterial({map:glowT,color:col,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.85}));sp.position.set(x,y,z);sp.scale.set(s,s,1);sp.userData.dyn=true;G.add(sp);FL.push({s:sp,b:s,p:Math.random()*6});return sp}
function buildHall(){done=true;const G=new T.Group();G.position.set(KX,0,KZ);DG.G.add(G);const b=KIT.Bag(),A=[8,34,110,142],cu=(A[0]+A[1])/2,cv=(A[2]+A[3])/2;
  const M=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:o.r??.8,metalness:o.m||0,...(o.e?{emissive:o.e,emissiveIntensity:o.ei??1}:{}),...(o.side?{side:o.side}:{})});
  const marble=new T.MeshStandardMaterial({map:tex(256,256,(g,w,h)=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){g.fillStyle=(i+j)%2?'#2a2c38':'#3e4250';g.fillRect(i*128,j*128,128,128);g.strokeStyle='rgba(200,210,235,.14)';for(let k=0;k<5;k++){g.beginPath();let x=i*128+Math.random()*128,y=j*128+Math.random()*128;g.moveTo(x,y);for(let q=0;q<4;q++){x+=rr(30);y+=rr(30);g.lineTo(x,y)}g.stroke()}}g.strokeStyle='#c9a24a';g.lineWidth=3;g.strokeRect(0,0,128,128);g.strokeRect(128,128,128,128);g.strokeRect(128,0,128,128);g.strokeRect(0,128,128,128);g.fillStyle='#d8b050';for(const [x,y] of[[128,128],[0,0],[128,0],[0,128]]){g.save();g.translate(x,y);g.rotate(Math.PI/4);g.fillRect(-7,-7,14,14);g.restore()}},7,8),roughness:.28,metalness:.25});
  const wallT=new T.MeshStandardMaterial({map:tex(256,256,(g,w,h)=>{g.fillStyle='#343040';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=42){const o=(y/42)%2?40:0;for(let x=-80;x<w;x+=80){g.fillStyle='hsl(255,10%,'+(24+Math.random()*8)+'%)';g.fillRect(x+o+2,y+2,76,38)}}},4,3),roughness:.9});
  const stone=M(0x565260,{r:.85}),dark=M(0x1e1c24),gold=M(0xe0b04a,{m:.75,r:.3,e:0x3a2408,ei:.5}),red=M(0x6a1420,{r:.95}),redT=M(0x8a1c28,{r:.9}),bone=M(0xd8d0b8,{r:.8}),iron=M(0x2e3034,{m:.6,r:.45}),statue=M(0x6a6672,{r:.7}),blueF=new T.MeshBasicMaterial({color:0x5ad0ff}),whiteF=new T.MeshBasicMaterial({color:0xd8f4ff}),eye=new T.MeshBasicMaterial({color:0x7af0ff}),gems=[0xe03a5a,0x3ac0e0,0x5ae05a,0xb05ae0].map(c=>M(c,{r:.2,m:.3,e:c,ei:.35}));
  /* floor, walls up to the high ceiling, vaulted ribs */
  {const f=new T.Mesh(new T.PlaneGeometry(26,32),marble);f.rotation.x=-Math.PI/2;f.position.set(cu,.03,cv);f.receiveShadow=true;G.add(f)}
  const wp=(w,h,x,y,z,ry)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),wallT);m.position.set(x,y,z);m.rotation.y=ry;G.add(m)};wp(14,H,8.46+.02,H/2,116,Math.PI/2);wp(12,H,8.48,H/2,136,Math.PI/2);wp(8,H-5.5,8.48,8.25,126,Math.PI/2);wp(26,H,33.48,H/2,cv,-Math.PI/2);wp(26,H,cu,H/2,110.52,0);wp(26,H,cu,H/2,141.48,Math.PI);
  /* upper outer shell, so no gap shows above the 5.5 m wall blocks */b.box(1,H-5.5,34,stone,8,(H+5.5)/2,cv);b.box(1,H-5.5,34,stone,34.5,(H+5.5)/2,cv);b.box(27,H-5.5,1,stone,cu,(H+5.5)/2,109.5);b.box(27,H-5.5,1,stone,cu,(H+5.5)/2,142.5);
  for(let u=12;u<=30;u+=6){b.add(new T.TorusGeometry(15,.28,6,20,Math.PI),gold,u,H-13.6+2.2,cv,Math.PI/2,0,0,1,.68,1)}
  /* giant columns with golden tops, and skeleton guards between them */
  for(const v of[116,136])for(const u of[12,18,24,30]){b.cyl(1,1.15,H,statue,u,H/2,v,18);b.cyl(1.5,1.5,.6,stone,u,.3,v,18);b.cyl(1.7,1.05,1,gold,u,H-.5,v,18);b.add(new T.TorusGeometry(1.12,.1,6,20),gold,u,1,v,0,Math.PI/2);addCircle(KX+u,KZ+v,1.3)}
  const guard=(u,v,ry)=>{b.box(1.8,.5,1.8,stone,u,.25,v);b.cyl(.2,.26,.9,bone,u,1,v,8);b.box(.75,1,.4,iron,u,1.9,v,ry);b.add(new T.SphereGeometry(.26,10,8),bone,u,2.7,v);for(const sd of[-1,1]){b.add(new T.SphereGeometry(.06,5,4),eye,u+Math.sin(ry)*.22+Math.cos(ry)*sd*.1,2.72,v+Math.cos(ry)*.22-Math.sin(ry)*sd*.1)}b.box(.1,2.4,.12,M(0xa8b0b8,{m:.8,r:.3}),u+Math.sin(ry)*.5,1.9,v+Math.cos(ry)*.5);b.box(.5,.08,.14,gold,u+Math.sin(ry)*.5,1.5,v+Math.cos(ry)*.5,ry);addCircle(KX+u,KZ+v,.9)};
  const NI=[];for(const u of[15,21,27])for(const [v,ry] of[[112,0],[140,Math.PI]]){guard(u,v,ry);NI.push([u,v+(ry?-3:3)])}G.userData.niches=NI;DG.niches=NI;
  /* the royal carpet from the secret door to the platform */b.box(17.6,.05,4.6,gold,17.6,.07,cv);b.box(17.6,.06,4.2,red,17.6,.08,cv);for(let u=9.5;u<26;u+=2.4)b.add(new T.CircleGeometry(.45,4),gold,u,.12,cv,0,-Math.PI/2);
  /* blue spirit flames along the carpet */const flame=(u,v,y0=0)=>{b.model('CandleStick_Stand',u,y0,v,0,1.6,{tint:0xc8a050});b.add(new T.ConeGeometry(.42,1.2,7),blueF,u,y0+2.45,v);b.add(new T.ConeGeometry(.2,.8,6),whiteF,u,y0+2.35,v);glow(G,u,y0+2.5,v,0x5ac8ff,1.8);addCircle(KX+u,KZ+v,.4)};for(const u of[12,17,22])for(const v of[122.2,129.8])flame(u,v);
  /* chandeliers on long chains */for(const u of[15,24]){b.model('Chandelier',u,H-5.2,cv,0,3.6);glow(G,u,H-3.6,cv,0xffd890,2.4)}
  /* the platform, the sarcophagus and the colossal statue */
  b.box(7.4,.7,12.8,stone,30.1,.35,cv);b.box(7.5,.1,12.9,gold,30.1,.72,cv);for(let i=0;i<8;i++)b.box(.28,.72,12.8,stone,26.6+i*.3,(i+1)*.044,cv);
  b.box(3.4,1.5,6,stone,31,1.45,cv);b.box(3.7,.3,6.3,gold,31,.85,cv);b.box(3,.34,5.6,gold,31,2.34,cv);b.add(new T.CylinderGeometry(.5,.5,3.6,10),statue,31,2.75,cv,0,Math.PI/2);b.add(new T.SphereGeometry(.42,10,8),statue,31,2.85,cv-2.1);b.cyl(.46,.4,.3,gold,31,3.1,cv-2.1,10);b.box(.14,.1,2.6,M(0xa8b0b8,{m:.8,r:.3}),31,3.3,cv+.3);
  for(const sv of[-1,1])for(const su of[-1,1])b.cyl(.2,.26,1.5,gold,31+su*1.7,1.45,cv+sv*3,10);
  addBox(KX+29.2,KZ+cv-3.2,KX+32.8,KZ+cv+3.2);
  /* the great throne of the king against the far wall */b.model('Chair_1',32.2,.7,cv,-Math.PI/2,5.4,{tint:0xd8b050});for(const sd of[-1,1]){b.model('CandleStick_Stand',32,.7,cv+sd*4,0,3);b.model('Banner_2',33.2,8.6,cv+sd*3.4-1.6*0,-Math.PI/2,3)}
  /* banners, shields and gold on the walls */{const ban=(x,z,ry)=>{b.model('Banner_1',x-Math.cos(ry)*2,8.6,z+Math.sin(ry)*2,ry,3)};for(const u of[15,21,27]){ban(u,110.6,0);ban(u,141.4,Math.PI)}ban(33.3,119,-Math.PI/2);ban(33.3,133,-Math.PI/2);for(const v of[113,139])ban(8.6,v,Math.PI/2)}
  /* heaps of gold, jewels, urns, a broken cart of treasure, bones */
  const heap=(u,v,s)=>{for(let i=0;i<s*14;i++){const a=Math.random()*6.283,r=Math.random()*s;b.model(i%2?'Coin_Pile_2':'Coin_Pile',u+Math.cos(a)*r,(1-r/s)*s*.3,v+Math.sin(a)*r,i,R2(10,16))}b.model('Chalice',u,s*.42,v,0,3);for(let i=0;i<s*4;i++){const a=Math.random()*6.283,r=Math.random()*s*.8;b.add(new T.OctahedronGeometry(.16+Math.random()*.1,0),gems[i%4],u+Math.cos(a)*r,.2+(1-r/s)*s*.5,v+Math.sin(a)*r)}addCircle(KX+u,KZ+v,s*.8)};
  for(const [u,v,s] of[[31,114,2.6],[31,138,2.6],[27.5,113.6,1.5],[27.5,138.4,1.5],[11,139,1.3]])heap(u,v,s);
  const urn=(u,v)=>{b.model('Vase_4',u,0,v,0,2.6);addCircle(KX+u,KZ+v,.6)};for(const [u,v] of[[28,119],[28,133],[33,114],[33,138]])urn(u,v);
  for(const [u,v,a] of[[13,119,.4],[20,134,1.2],[25,118,2]]){b.add(new T.SphereGeometry(.22,8,6),bone,u,.2,v);for(let i=0;i<4;i++)b.cyl(.04,.04,.8,bone,u+.4+rr(.4),.08,v+rr(.5),6,Math.PI/2,a+i)}
  /* the arch of the secret door, with words */const ins=new T.MeshBasicMaterial({map:tex(512,96,(g,w,h)=>{g.fillStyle='#1a1620';g.fillRect(0,0,w,h);g.fillStyle='#e0c070';g.font='italic bold 30px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText('Hier rust de Vergeten Koning',w/2,h/2)})});b.add(new T.PlaneGeometry(7.6,1.1),ins,8.56,6.4,cv,Math.PI/2);b.box(.6,.3,9,gold,8.7,5.7,cv);for(const s of[-1,1])b.cyl(.35,.4,5.6,statue,8.9,2.8,cv+s*4.4,12);
  b.build(G);
  /* the ornate chest: its lid opens */{const g=new T.Group();g.position.set(29.3,.7,cv);g.rotation.y=-Math.PI/2;G.add(g);const wood=M(0x5a3220,{r:.7});const add=(geo,m,x,y,z)=>{const q=new T.Mesh(geo,m);q.position.set(x,y,z);g.add(q);return q};add(new T.BoxGeometry(2.4,1.1,1.5),wood,0,.55,0);for(const x of[-1,0,1])add(new T.BoxGeometry(.14,1.14,1.56),gold,x*1.05,.55,0);add(new T.BoxGeometry(2.46,.12,1.56),gold,0,.08,0);const inner=add(new T.BoxGeometry(2.2,.1,1.3),gold,0,1.08,0);for(let i=0;i<14;i++)add(new T.OctahedronGeometry(.12,0),gems[i%4],rr(.9),1.2,rr(.5));
    const lid=new T.Group();lid.position.set(0,1.1,-.75);g.add(lid);const lm=new T.Mesh(new T.CylinderGeometry(.75,.75,2.4,14,1,false,0,Math.PI),wood);lm.rotation.set(0,0,Math.PI/2);lm.rotation.order='ZYX';lm.position.set(0,0,.75);lm.scale.set(.6,1,1);lid.add(lm);for(const x of[-1,0,1]){const st=new T.Mesh(new T.CylinderGeometry(.77,.77,.14,14,1,false,0,Math.PI),gold);st.rotation.set(0,0,Math.PI/2);st.rotation.order='ZYX';st.position.set(x*1.05,0,.75);st.scale.set(.6,1,1);lid.add(st)}LID.g=lid;LID.gl=glow(G,29.3,1.9,cv,0xffd27a,1.6);LID.gl.material.opacity=0;addBox(KX+28.5,KZ+cv-1.3,KX+30.1,KZ+cv+1.3)}
  /* light, floating dust, ghosts circling the tomb */{const l=new T.PointLight(0x9ac4ff,.75,46,1.3);l.position.set(19,8.5,cv);G.add(l);const l2=new T.PointLight(0xffc880,.6,22,1.4);l2.position.set(29,4,cv);G.add(l2)}
  {const N=260,g=new T.BufferGeometry(),p=new Float32Array(N*3);for(let i=0;i<N;i++){p[i*3]=8.5+Math.random()*25;p[i*3+1]=Math.random()*H;p[i*3+2]=110.5+Math.random()*31}g.setAttribute('position',new T.BufferAttribute(p,3));dust=new T.Points(g,new T.PointsMaterial({size:.14,map:glowT,color:0xffe0a0,transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending}));dust.frustumCulled=false;dust.userData.dyn=true;G.add(dust)}
  for(let i=0;i<5;i++){const s=glow(G,31,3,cv,0x9ae0ff,1.8);WISP.push({s,a:i/5*6.283,r:3.4+i*.35,h:2.4+i*.5,sp:.6+i*.08})}
  if(FX().kerkerSchat)openLid(true)}
function openLid(now){if(!LID.g||LID.open)return;LID.open=true;LID.t=now?1:0;if(LID.gl)LID.gl.material.opacity=.8}
/* the king: bigger, crowned, with a ghostly aura; a film when the wall opens; he calls his guards */
let K=null;function kingUp(a){K={a,st:0,ring:null};try{a.root.scale.setScalar(2.1);a.hh=(a.hh||1.8)*2.1;a.rad=.9;a.dmg=38;a.name='De Vergeten Koning'}catch(e){}
  try{const head=a.h&&a.h.head,g=new T.Group(),gm=new T.MeshStandardMaterial({color:0xe0b04a,metalness:.8,roughness:.3,emissive:0x5a3a08});const r=new T.Mesh(new T.CylinderGeometry(.13,.12,.09,10,1,true),gm);r.material.side=T.DoubleSide;g.add(r);for(let i=0;i<6;i++){const q=i/6*6.283,c=new T.Mesh(new T.ConeGeometry(.03,.09,4),gm);c.position.set(Math.cos(q)*.125,.08,Math.sin(q)*.125);g.add(c)}if(head&&head.isObject3D){g.position.set(0,.16,0);head.add(g)}else{g.position.set(0,1.75,0);g.scale.setScalar(1.2);a.root.add(g)}}catch(e){}
  try{const ring=new T.Mesh(new T.RingGeometry(.8,2,32),new T.MeshBasicMaterial({color:0x5ad0ff,transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));ring.rotation.x=-Math.PI/2;ring.userData.dyn=true;DG.G.add(ring);K.ring=ring}catch(e){}
  try{const V=(x,y,z)=>new T.Vector3(x,y,z);cinematic([{d:3,from:V(KX+10,3,KZ+126),to:V(KX+16,3.4,KZ+126),lf:V(KX+30,5,KZ+126),lt:V(KX+30,6,KZ+126)},{d:2.6,from:V(KX+20,1.6,KZ+121),to:V(KX+21,2.2,KZ+123),lf:V(a.x,2.6,a.z),lt:V(a.x,3.6,a.z)}],'De Vergeten Koning','Wie mijn rust verstoort, blijft hier voor eeuwig')}catch(e){}}
function summon(n){const N=(DG.niches||[]).slice().sort(()=>Math.random()-.5).slice(0,n);for(const [u,v] of N){try{const a=spawnEnemy('skeleton',KX+u,KZ+v,{name:'Skeletwacht',hp:220,hpMax:220,dmg:20,xp:60,cave:true,provoked:true,respawn:1e12});a.cave=true}catch(e){console.warn(e)}}try{sfx('thunder')}catch(e){}addLog('💀 De Vergeten Koning roept zijn wachters op!','#9ae0ff')}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!DG.built)return;if(!done){try{buildHall()}catch(e){console.warn('grafkamer',e);done=true}}if(PL.x<110000||PL.x>130000)return;const t=performance.now()*.001;
  for(const f of FL){const s=f.b*(1+Math.sin(t*5+f.p)*.1+Math.sin(t*11+f.p*2)*.05);f.s.scale.set(s,s,1)}
  if(dust){const p=dust.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)+dt*.12;if(y>H)y=0;p.setY(i,y);p.setX(i,p.getX(i)+Math.sin(t*.4+i)*dt*.05)}p.needsUpdate=true}
  for(const w of WISP){w.a+=w.sp*dt;w.s.position.set(31+Math.cos(w.a)*w.r*.8,w.h+Math.sin(t*1.3+w.a)*.6,126+Math.sin(w.a)*w.r*1.4);w.s.visible=!FX().kerkerSchat}
  if(LID.open&&LID.t<1){LID.t=Math.min(1,LID.t+dt*.7)}if(LID.g&&LID.open)LID.g.rotation.x=-LID.t*1.9;if(LID.gl&&LID.open)LID.gl.scale.setScalar(3+Math.sin(t*3)*.3);
  if(K&&K.a){const a=K.a;if(K.ring){K.ring.visible=!a.dead;K.ring.position.set(KX+(a.x-KX),.15,a.z);K.ring.rotation.z=t}if(!a.dead){const f=a.hp/a.hpMax;if(K.st===0&&f<.66){K.st=1;summon(3)}else if(K.st===1&&f<.33){K.st=2;summon(4)}}}
  const f=FX();if(f.kerkerSchat){openLid(false);if(!f.vkExtra){f.vkExtra=1;try{giveItem('kroon_vk',1,true);giveItem('zwaard_vk',1,true);WD.kingdom.card('👑 Nog meer!','In de kist liggen ook de Kroon van de Vergeten Koning en het Zwaard der Vergeten Koningen. Twee legendarische schatten!',null,10)}catch(e){console.warn(e)}}}});
WD.grafkamer={kingUp,LID,summon};
})();
