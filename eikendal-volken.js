/* ================= The dwarves under the mountain and the elves in the forest =================
   - Khazad... no: Diepsteen, the dwarf city. Beside the copper mine of Hoogmark a great stone gate stands in the
     mountain; walk in and a dark tunnel brings you into a cavern as big as a town: a stone hall with the throne of
     Dwergenkoning Thorgrim, forges glowing with lava, a mine with rails and carts, an underground river with a stone
     bridge, houses carved into the rock, and bearded dwarves. The dwarf smith sells dwarf axes and mithril.
   - Het Elfenbos: deep in an old forest live the elves in houses high in giant trees, joined by rope bridges, lit by
     lanterns. Queen Sylvara, elf archers, an elf merchant (elf bows, elf bread), a white stag, fairies by day and
     will-o'-the-wisps at night. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}},chron=t=>{try{WD.chron.add(t)}catch(e){}},FX=()=>{PL.fx=PL.fx||{};return PL.fx};
Object.assign(ITEMS,{dwergenbijl:{n:'Dwergenbijl',g:'weapon',kind:'axe',dmg:70,spd:.62,rng:2.6,price:2600,ico:'🪓',col:0xb8c0c8,rar:'e'},
  mithril:{n:'Mithrilpantser',g:'armor',def:22,fx:{hp:40},col:0xd8e4f0,price:4800,ico:'🛡',rar:'l'},
  elfenmantel:{n:'Elfenmantel',g:'amulet',fx:{spd:.15,regen:1,xp:.1},col:0x3f8a6a,price:2200,ico:'🍃',rar:'e',desc:'Licht als een blad: je loopt sneller en geneest vanzelf.'}});
function bag(){const L=new Map();return{add(geo,mat,m){let g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);g.clearGroups();if(!L.has(mat))L.set(mat,[]);L.get(mat).push(g)},
  build(par){for(const [mat,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const g of mg?[mg]:gs){const me=new T.Mesh(g,mat);me.castShadow=me.receiveShadow=true;par.add(me)}}}}}
const MX=(x,y,z,ry=0,sx=1,sy,sz)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(0,ry,0)),new T.Vector3(sx,sy??sx,sz??sx));
/* dwarves: short, broad, with big beards (the random look of new people is bent for a moment) */
function dwarf(job,x,z,o){const _rl=randomLook;randomLook=f=>({..._rl(false),beard:'full',hairStyle:pick(['bald','parted','buzzed']),hair:pick([0x8a4a1a,0x4a2a1a,0xb08040,0x9a9a9a,0x2a1a10])});let a;try{a=spawnNPC(job,x,z,{cave:true,...o})}finally{randomLook=_rl}a.cave=true;try{a.root.scale.set(.86,.74,.86)}catch(e){}a.hh=1.6;return a}
/* ---------- Diepsteen (x 100000) ---------- */
const DX=100000,DZ=0,R0=105,inD2=x=>x>90000&&x<110000;
WD.regions=WD.regions||[];WD.regions.push({x0:90000,x1:110000,name:'Diepsteen, de Dwergenstad',in:'in Diepsteen',adv:'de dwergenstad Diepsteen'});
const RIV={v0:-8,v1:4};
function dH(x,z){const u=x-DX,v=z-DZ;if(v>RIV.v0&&v<RIV.v1&&Math.abs(u)<R0&&!(Math.abs(u)<5))return -.4;return 0}
const _gD=groundH;groundH=function(x,z){return inD2(x)?dH(x,z):_gD(x,z)};
const _tD=terrainH;terrainH=function(x,z){return inD2(x)?dH(x,z):_tD(x,z)};
const _cD=gtClamp;gtClamp=function(P){if(!inD2(P.x))return _cD(P);const u=P.x-DX,v=P.z-DZ,d=Math.hypot(u,v);if(d>R0-3){P.x=DX+u/d*(R0-3);P.z=DZ+v/d*(R0-3)}};
/* a warm light of forges and lanterns fills the cavern, and the cave mist is thinner here */
const AMB=new T.AmbientLight(0xffc890,.75);AMB.visible=false;scene.add(AMB);
const _ueD=updateEnv;updateEnv=function(dt,pp){_ueD(dt,pp);if(pp!==PL)return;const on=inD2(PL.x);AMB.visible=on;if(on){scene.fog.color.setHex(0x2a1c10);scene.fog.density=Math.min(scene.fog.density,.007)}};
const _dmD=drawMini;drawMini=function(){if(!inD2(PL.x))return _dmD();const c=$('mini'),g=c.getContext('2d'),S=150,k=S/240;g.fillStyle='#0e0a06';g.fillRect(0,0,S,S);g.fillStyle='#3a2e22';g.beginPath();g.arc(S/2-(PL.x-DX)*k,S/2-(PL.z-DZ)*k,R0*k,0,6.283);g.fill();
  g.fillStyle='#2a5a8a';g.fillRect(0,S/2+(RIV.v0-(PL.z-DZ))*k,S,(RIV.v1-RIV.v0)*k);g.fillStyle='#ffd27a';g.beginPath();g.arc(S/2,S/2,3,0,6.283);g.fill();g.fillStyle='#c9a46a';g.font='bold 13px serif';g.textAlign='center';g.fillText('Diepsteen',S/2,14)};
const DW={built:false,gate:null};
function buildDwarves(){if(DW.built)return;DW.built=true;const G=new T.Group();scene.add(G);const B=bag();
  const rock=new T.MeshStandardMaterial({color:0x4a4038,roughness:1,side:T.DoubleSide}),cut=new T.MeshStandardMaterial({color:0x7a6e60,roughness:.85}),dark=new T.MeshStandardMaterial({color:0x1a1410,roughness:1}),
    lava=new T.MeshBasicMaterial({color:0xff6a1a}),gold=new T.MeshStandardMaterial({color:0xd8a83a,metalness:.6,roughness:.35,emissive:0x3a2008}),iron=new T.MeshStandardMaterial({color:0x5a5a60,metalness:.7,roughness:.5});
  {const f=new T.Mesh(new T.CircleGeometry(R0,64),cut);f.rotation.x=-Math.PI/2;f.position.set(DX,.01,DZ);f.receiveShadow=true;G.add(f)}
  B.add(new T.CylinderGeometry(R0,R0,46,64,1,true),rock,MX(DX,23,DZ));B.add(new T.SphereGeometry(R0,48,16,0,6.283,0,Math.PI/2),rock,MX(DX,46,DZ,0,1,.35,1));
  for(let i=0;i<72;i++){const a=i/72*6.283;addCircle(DX+Math.cos(a)*(R0+1),DZ+Math.sin(a)*(R0+1),5)}
  /* great pillars */
  for(let i=0;i<10;i++){const a=i/10*6.283+.2,r=62,x=DX+Math.cos(a)*r,z=DZ+Math.sin(a)*r;B.add(new T.CylinderGeometry(3.2,4,46,12),cut,MX(x,23,z));B.add(new T.BoxGeometry(9,2,9),cut,MX(x,1,z));addCircle(x,z,4.2)}
  /* the underground river with a stone bridge */
  {const w=new T.Mesh(new T.PlaneGeometry(R0*2,RIV.v1-RIV.v0),new T.MeshStandardMaterial({color:0x2a5a8a,roughness:.2,metalness:.2,transparent:true,opacity:.85}));w.rotation.x=-Math.PI/2;w.position.set(DX,.08,DZ+(RIV.v0+RIV.v1)/2);G.add(w);DW.river=w;
    B.add(new T.BoxGeometry(10,.5,RIV.v1-RIV.v0+2),cut,MX(DX,.1,DZ+(RIV.v0+RIV.v1)/2));for(const s of[-1,1])B.add(new T.BoxGeometry(.6,1.2,RIV.v1-RIV.v0+2),cut,MX(DX+s*5,.6,DZ+(RIV.v0+RIV.v1)/2))}
  /* the throne hall: a raised dais with a stone throne and golden braziers */
  {const z=DZ-60;B.add(new T.CylinderGeometry(14,15,1.6,32),cut,MX(DX,.8,z));B.add(new T.BoxGeometry(4,5,2),cut,MX(DX,3.6,z-4));B.add(new T.BoxGeometry(3,1.2,2.4),gold,MX(DX,2.2,z-2.6));
    for(const s of[-1,1]){B.add(new T.CylinderGeometry(.8,.5,1.6,10),gold,MX(DX+s*7,2.4,z-2));const f=new T.Mesh(new T.SphereGeometry(.7,10,8),lava);f.position.set(DX+s*7,3.6,z-2);G.add(f)}DW.throne={x:DX,z:z-1}}
  /* the forges with lava channels and anvils */
  for(let i=0;i<4;i++){const x=DX+40+i*9,z=DZ+30;B.add(new T.BoxGeometry(6,4,4),cut,MX(x,2,z-3));const l=new T.Mesh(new T.PlaneGeometry(1.4,10),lava);l.rotation.x=-Math.PI/2;l.position.set(x+3.6,.05,z+3);G.add(l);B.add(new T.BoxGeometry(1.2,.9,.6),iron,MX(x,.45,z+2));addBox(x-3,z-5,x+3,z-1)}
  {const L=new T.PointLight(0xff7a2a,1.6,60,1.5);L.position.set(DX+54,8,DZ+32);G.add(L);const L2=new T.PointLight(0xffb060,1.4,70,1.4);L2.position.set(DX,12,DZ-55);G.add(L2);const L3=new T.PointLight(0xffa050,1.2,70,1.4);L3.position.set(DX-40,10,DZ+30);G.add(L3)}
  /* the mine: rails and carts into a tunnel in the wall */
  {const z0=DZ+40;for(let i=0;i<20;i++){const x=DX-30-i*3;B.add(new T.BoxGeometry(.3,.15,2.6),MAT.wood,MX(x,.08,z0));}for(const s of[-1,1])B.add(new T.BoxGeometry(60,.12,.12),iron,MX(DX-58,.2,z0+s*.9));
    for(const x of[DX-40,DX-62]){B.add(new T.BoxGeometry(2,1.2,1.6),MAT.wood,MX(x,.9,z0));B.add(new T.BoxGeometry(1.6,.5,1.2),new T.MeshStandardMaterial({color:0xb87333,metalness:.4}),MX(x,1.6,z0))}
    const t=new T.Mesh(new T.CircleGeometry(4,20,0,Math.PI),dark);t.position.set(DX-R0+1.5,0,z0);t.rotation.y=Math.PI/2;G.add(t)}
  /* houses carved in the rock wall */
  for(let i=0;i<14;i++){const a=Math.PI*.9+i/14*Math.PI*.9,r=R0-5,x=DX+Math.cos(a)*r,z=DZ+Math.sin(a)*r,ry=-a-Math.PI/2;B.add(new T.BoxGeometry(7,5,5),cut,MX(x,2.5,z,ry));const d=new T.Mesh(new T.CircleGeometry(1.2,16),gold);d.position.set(x-Math.cos(a)*2.6,1.2,z-Math.sin(a)*2.6);d.rotation.y=ry+Math.PI;G.add(d);addCircle(x,z,3.4)}
  /* the way out */
  {const t=new T.Mesh(new T.PlaneGeometry(7,8),dark);t.position.set(DX,4,DZ+R0-1);t.rotation.y=Math.PI;G.add(t);INTER.push({x:DX,z:DZ+R0-6,r:4,cave:true,txt:'Loop door de tunnel naar buiten',fn:()=>WD.fadeGo(()=>{const p=DW.gate;go(p.x+p.fx*5,p.z+p.fz*5)})})}
  B.build(G);
  /* the dwarves */
  const k=dwarf('lord',DW.throne.x,DW.throne.z,{name:'Dwergenkoning Thorgrim Steenhart',ai:'stay',line:'grootland'});k.face=0;
  dwarf('smith',DX+46,DZ+33,{name:'Meestersmid Brokk',ai:'stay',shop:['dwergenbijl','mithril','pickaxe_iron','iron'].filter(id=>ITEMS[id])});
  dwarf('merchant',DX+10,DZ+20,{name:'Handelaar Durin Goudbaard',ai:'stay',shop:['iron','crystal','gem','pickaxe_iron'].filter(id=>ITEMS[id])});
  const DN=['Balin','Gimbo','Thrar','Bofur','Dwalin','Nori','Gloin','Hurin','Brakk','Ruddo'];for(let i=0;i<10;i++){const a=Math.random()*6.283,r=15+Math.random()*60,x=DX+Math.cos(a)*r,z=DZ+Math.sin(a)*r;if(z>DZ+RIV.v0-2&&z<DZ+RIV.v1+2)continue;const w=dwarf(i<4?'farmer':'villager',x,z,{name:DN[i]+' de Dwerg',line:'grootland'});w.roam={x,z};w.radius=20}}
function go(x,z){if(PL.mounted)try{dismount()}catch(e){}PL.x=x;PL.z=z;PL.y=groundH(x,z)+.2;PL.vy=0}
/* the gate in the mountain beside the copper mine */
function gate(){const S=(WD.great&&WD.great.places&&WD.great.places.mijn)||{x:690,z:-1354};let best=null;
  for(let i=0;i<16;i++){const a=i/16*6.283,x=S.x+Math.cos(a)*42,z=S.z+Math.sin(a)*42,h=terrainH(x,z);if(!best||h>best.h)best={x,z,h,a}}
  const fx=-Math.cos(best.a),fz=-Math.sin(best.a),x=S.x+Math.cos(best.a)*32,z=S.z+Math.sin(best.a)*32,y=groundH(x,z),ry=Math.atan2(fx,fz);DW.gate={x,z,fx,fz};
  const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;const st=new T.MeshStandardMaterial({color:0x6a625a,roughness:1});
  for(const s of[-1,1]){g.add(mesh(new T.BoxGeometry(2,10,2.4),st,s*4.5,5,0));const d=mesh(new T.BoxGeometry(1.6,4,1.6),st,s*7.4,2,1.4);g.add(d);g.add(mesh(new T.SphereGeometry(.8,10,8),st,s*7.4,4.6,1.4))}
  g.add(mesh(new T.BoxGeometry(11,2.2,2.6),st,0,10.8,0));g.add(mesh(new T.BoxGeometry(14,30,6),st,0,6,-4));const hole=new T.Mesh(new T.PlaneGeometry(7,9),new T.MeshBasicMaterial({color:0x050302}));hole.position.set(0,4.5,1.25);g.add(hole);scene.add(g);
  DW.gateG=g;SITES.push(SITE.diepsteen={id:'diepsteen',name:'Poort van Diepsteen',x,z,r:10,h:y,blend:1.4,great:true});MAPICON.diepsteen='⛰️'}
ANIMS.push(()=>{const p=DW.gate;if(!p||!started||PL.inCave||PL.mounted||WD._dFade)return;const dx=PL.x-p.x,dz=PL.z-p.z;if(Math.hypot(dx,dz)<2.4&&dx*p.fx+dz*p.fz<1.2){WD._dFade=1;WD.fadeGo(()=>{buildDwarves();go(DX,DZ+R0-8);if(!FX().seenDwarf){FX().seenDwarf=1;giveXp(800);chron('Vond Diepsteen, de stad van de dwergen.');card('⛏ Diepsteen','Een grot zo groot als een stad! Dwergen met lange baarden hameren in hun smidsen. Dwergenkoning Thorgrim zit op zijn stenen troon.',null,10)}});setTimeout(()=>WD._dFade=0,3000)}});
/* ---------- Het Elfenbos ---------- */
const EF={c:null,lan:[],wisps:[],fairies:[]};
function findForest(){let best=null;for(let i=0;i<700;i++){const x=rr(1300),z=rr(1300);if(x<-1900||Math.hypot(x,z)<250)continue;const h=terrainH(x,z);if(h<3||h>40||siteAt(x,z)||inBuilding(x,z,20))continue;let f=0;for(let k=0;k<8;k++)f+=forestDensity(x+rr(40),z+rr(40));if(!best||f>best.f)best={x,z,f}}return best}
function buildElves(){const p=findForest();if(!p)return;EF.c=p;const gone=(x,z)=>Math.hypot(x-p.x,z-p.z)<46;
  try{for(const t of TREES.oak.concat(TREES.pine))if(!t.cut&&gone(t.x,t.z)){t.cut=true;t.gone=true;if(t.col)t.col.off=true;try{if(t.lodM)asLow(t,false);else setInst(t.ii||[],false,[])}catch(e){}}}catch(e){}
  const B=bag(),bark=new T.MeshStandardMaterial({color:0x6a5a48,roughness:1}),leaf=new T.MeshStandardMaterial({color:0x6aa84a,roughness:.8,emissive:0x0a1a08}),wood=new T.MeshStandardMaterial({color:0xb08a5a,roughness:.8}),roof=new T.MeshStandardMaterial({color:0x3f8a6a,roughness:.8});
  const blob=new T.IcosahedronGeometry(1,1),trees=[];
  for(let i=0;i<6;i++){const a=i/6*6.283+.3,r=24+(i%2)*8,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r,y=groundH(x,z),H=26;trees.push({x,z,y});
    B.add(new T.CylinderGeometry(1.6,2.6,H,12),bark,MX(x,y+H/2,z));for(let k=0;k<7;k++)B.add(blob,leaf,MX(x+rr(5),y+H+rr(2),z+rr(5),Math.random()*3,6+Math.random()*3,4.5,6+Math.random()*3));
    B.add(new T.CylinderGeometry(5,5,.4,20),wood,MX(x,y+13,z));for(let k=0;k<14;k++){const b=k/14*6.283;B.add(new T.CylinderGeometry(.06,.06,1,4),wood,MX(x+Math.cos(b)*4.9,y+13.7,z+Math.sin(b)*4.9))}
    B.add(new T.CylinderGeometry(2.6,2.6,2.6,10),wood,MX(x+1.4,y+14.5,z));B.add(new T.ConeGeometry(3.2,3,10),roof,MX(x+1.4,y+17.3,z));addCircle(x,z,2.8);
    for(let k=0;k<5;k++){const b=k*1.3+i,l=new T.Mesh(new T.SphereGeometry(.22,8,6),new T.MeshBasicMaterial({color:0xfff2a8}));l.position.set(x+Math.cos(b)*5.2,y+12.6,z+Math.sin(b)*5.2);scene.add(l);EF.lan.push(l)}}
  /* rope bridges between the trees */
  for(let i=0;i<trees.length;i++){const a=trees[i],b=trees[(i+1)%trees.length],A=new T.Vector3(a.x,a.y+13.2,a.z),Bv=new T.Vector3(b.x,b.y+13.2,b.z),dir=Bv.clone().sub(A),L=dir.length(),n=Math.ceil(L/1.1);
    for(let k=1;k<n;k++){const t=k/n,P=A.clone().lerp(Bv,t);P.y-=Math.sin(t*Math.PI)*1.6;const m=MX(P.x,P.y,P.z,Math.atan2(dir.x,dir.z),1);B.add(new T.BoxGeometry(1.4,.08,.5),wood,m)}}
  const g=new T.Group();B.build(g);scene.add(g);EF.g=g;
  /* the elves */
  const q=spawnNPC('elf',p.x+2,p.z+2,{name:'Elfenkoningin Sylvara',ai:'stay',line:'grootland'});q.queen=true;
  spawnNPC('elf',p.x-6,p.z+4,{name:'Elfenhandelaar Faelan',ai:'stay',shop:['bow_elven','elf_bread','elfenmantel','arrow'].filter(id=>ITEMS[id])});
  for(let i=0;i<4;i++){const a=i/4*6.283,x=p.x+Math.cos(a)*36,z=p.z+Math.sin(a)*36;const w=spawnNPC('guard',x,z,{name:'Elfenboogschutter',ai:'guard',livery:0x3f8a6a,patrol:[[x,z],[x+rr(8),z+rr(8)]]});try{setHeld(w.h,'bow_elven')}catch(e){}}
  for(let i=0;i<5;i++){const e=spawnNPC('elf',p.x+rr(20),p.z+rr(20),{name:pick(['Aerin','Thalia','Eryndor','Liora','Caelum','Nimriel','Fenwick'])+' de Elf',line:'grootland'});e.roam={x:p.x,z:p.z};e.radius=22}
  try{const s=spawnAnimal('deer',p.x+15,p.z-12);s.name='Witte Hert';s.root.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();o.material.color.setHex(0xf4f4f0);if(o.material.emissive)o.material.emissive.setHex(0x333333)}});EF.stag=s}catch(e){}
  for(let i=0;i<10;i++){const m=new T.Mesh(new T.SphereGeometry(.07,6,5),new T.MeshBasicMaterial({color:0xfff6c0}));scene.add(m);EF.fairies.push({m,a:Math.random()*6.283,r:3+Math.random()*16,h:1+Math.random()*4,s:.4+Math.random()*.8})}
  for(let i=0;i<8;i++){const m=new T.Mesh(new T.SphereGeometry(.18,8,6),new T.MeshBasicMaterial({color:0x7ac8ff,transparent:true,opacity:.8}));scene.add(m);EF.wisps.push({m,x:p.x+rr(40),z:p.z+rr(40),ph:Math.random()*6})}
  SITES.push(SITE.elfenbos={id:'elfenbos',name:'Het Elfenbos',x:p.x,z:p.z,r:14,h:groundH(p.x,p.z),blend:1.3,great:true});MAPICON.elfenbos='🧝';
  RUMORS.push({t:'Diep in het oude bos wonen elfen, hoog in de bomen. Wie vriendelijk is, mag bij koningin Sylvara op bezoek.'})}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;const p=EF.c;if(!p)return;const near=Math.hypot(PL.x-p.x,PL.z-p.z)<160&&!PL.inCave;const t=PL.t,day=ENV.time>=6.5&&ENV.time<20.5;
  for(const f of EF.fairies){f.m.visible=near&&day;if(!f.m.visible)continue;f.a+=dt*f.s;f.m.position.set(p.x+Math.cos(f.a)*f.r,groundH(p.x,p.z)+f.h+Math.sin(t*3+f.r)*.4,p.z+Math.sin(f.a)*f.r)}
  for(const w of EF.wisps){w.m.visible=near&&!day;if(!w.m.visible)continue;w.m.position.set(w.x+Math.sin(t*.4+w.ph)*3,groundH(w.x,w.z)+1.2+Math.sin(t*1.3+w.ph)*.5,w.z+Math.cos(t*.3+w.ph)*3);w.m.material.opacity=.5+Math.sin(t*2+w.ph)*.3}
  if(near&&!FX().seenElves&&Math.hypot(PL.x-p.x,PL.z-p.z)<40){FX().seenElves=1;giveXp(600);chron('Vond het Elfenbos van koningin Sylvara.');card('🧝 Het Elfenbos','Hoog in reusachtige bomen wonen de elfen, in huisjes met hangbruggen ertussen. Lantaarns gloeien tussen de bladeren.',null,9)}});
const _dmV=dlgMain;dlgMain=function(a,text){_dmV(a,text);try{if(!a.queen)return;const box=document.querySelector('#dlg #dopts');if(!box)return;const b=document.createElement('button');b.className='btn pri';
  if(FX().elfGift){b.textContent='🍃 Dank voor de Elfenmantel, Majesteit';b.onclick=()=>{closeModals();card('Elfenkoningin Sylvara','"Het bos waakt over je, vriend van de elfen."',null,6)}}
  else{b.textContent='🍃 Mag ik een vriend van de elfen zijn?';b.onclick=()=>{closeModals();if(PL.rep<20){card('Elfenkoningin Sylvara','"Elfen vertrouwen alleen wie goed doet in de wereld. Kom terug als je reputatie beter is."',null,8);return}FX().elfGift=1;giveItem('elfenmantel',1,true);giveXp(800);sfx('level');
    card('🍃 Vriend van de elfen','Sylvara legt een mantel van bladeren om je schouders. "Draag de Elfenmantel, en het bos zal je dragen."',null,9);chron('Werd een vriend van de elfen.')}}box.insertBefore(b,box.firstChild)}catch(e){console.warn('elf dlg',e)}};
const _bfV=buildFantasy;buildFantasy=function(){_bfV();try{gate()}catch(e){console.warn('diepsteen poort',e)}};
const _pfV=populateFantasy;populateFantasy=function(){_pfV();try{buildElves()}catch(e){console.warn('elfenbos',e)}};
const _sgV=startGame;startGame=function(...a){_sgV(...a);try{if(inD2(PL.x)){buildDwarves();PL.y=groundH(PL.x,PL.z)}}catch(e){console.warn('diepsteen load',e)}};
})();
