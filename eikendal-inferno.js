/* ================= Het Demonenrijk, deel twee: de Vuurzee en Gloedhaven =================
   Only from level 20 does the portal let you through. The four-handed giant and the lava turtles are much stronger,
   and far from the arrival waits Ouwe Kraterschild, the ancient mother of the lava turtles (a mini boss).
   Behind the giant's arena the realm ends in a sea of lava. A parkour of obsidian pillars leads across it: some bob,
   some sink when you stand on them too long, lava geysers burst up between them, and lava fish leap out of the sea.
   Fall in and you burn. Halfway a fire beacon remembers you; at the end lies Gloedhaven, the village of the lava
   people, with its fire fountain, forge, shops, the shrine of the Fire Heart and a treasure. */
(function(){
const LX=x=>x-DW.X,LZ=z=>z-DW.Z,W2=(lx,lz)=>[DW.X+lx,DW.Z+lz],inDWx=x=>x<-9000&&x>-30000,rr=(a=1)=>(Math.random()*2-1)*a;
const LAVA_Y=-7.5,I={x:0,z:-600,r:62,y:2},PK={plats:[],geys:[],fish:[],cp:false,died:false,built:false};WD.inferno=PK;

/* ---------- stronger: the four-handed giant and the lava turtles ---------- */
Object.assign(MON.fourhands,{hp:6000,dmg:100,xp:2600});Object.assign(MON.lavaturtle,{hp:950,dmg:62,xp:360});

/* ---------- gear of the fire ---------- */
Object.assign(ITEMS,{
  sword_obsidian:{n:'Obsidiaanzwaard',g:'weapon',kind:'sword',dmg:112,spd:.44,rng:3.1,price:7600,ico:'⚔',col:0x2a1a22,rar:'e'},
  axe_obsidian:{n:'Magmahakbijl',g:'weapon',kind:'axe',dmg:128,spd:.64,rng:3,price:8400,ico:'⛏',col:0x3a1a14,rar:'e'},
  shield_magma:{n:'Magmaschild',g:'shield',kind:'shield',def:.9,col:0x4a1a10,price:5200,ico:'◔',rar:'e'},
  armor_magma:{n:'Magmaharnas',g:'armor',def:24,tunic:0x2a1410,pants:0x1a0e0a,fx:{hp:50},price:8800,ico:'▣',rar:'e'},
  helm_magma:{n:'Gehoornde magmahelm',g:'head',def:9,hat:'horned',fx:{dmg:.06},price:4400,ico:'♔',rar:'e'},
  boots_magma:{n:'Sintellaarzen',g:'boots',def:6,fx:{spd:.08,jump:.15},price:3600,ico:'▼',rar:'r'},
  ring_ember:{n:'Gloeiring',g:'ring',fx:{dmg:.14},price:5000,ico:'○',rar:'e'},
  shell_krater:{n:'Schild van Kraterschild',g:'shield',kind:'shield',def:.95,col:0x6a2a12,price:9800,ico:'◔',rar:'l'},
  amu_fireheart:{n:'Vuurhart van Gloedhaven',g:'amulet',fx:{hp:80,regen:1.5,dmg:.08},price:12000,ico:'◈',rar:'l'}});
LOOTX.kraterschild=()=>({gold:1400,items:[['shell_krater',1],['gem',6],['elixir',2],...(Math.random()<.5?[['boots_magma',1]]:[])]});
{const f=LOOTX.fourhands;LOOTX.fourhands=()=>{const L=f();L.gold=(L.gold||0)*2;if(Math.random()<.6)L.items.push(['armor_magma',1]);if(Math.random()<.5)L.items.push(['helm_magma',1]);return L}}
Object.assign(CHEST_LOOT,{gloed:{gold:1600,items:[['armor_magma',1],['sword_obsidian',1],['gem',6],['elixir',3]]},vuurspringer:{gold:500,items:[['ring_ember',1],['potion',3]]}});
LINES.gloed=['Welkom in Gloedhaven, koude vreemdeling. Je bent de eerste die de Vuurzee overstak.','Wij zijn de kinderen van de lava. Ons bloed is vuur, onze botten zijn obsidiaan.',
  'De Reuzen-Vierhand houdt ons al eeuwen gevangen op dit eiland.','Spring nooit in de lava. Alleen wij overleven dat.','Ouwe Kraterschild was ooit de hoedster van onze eieren. Nu is ze woest.',
  'Raak het Vuurhart bij het heiligdom aan. Het kiest wie dapper genoeg is.','Smid Obsidia smeedt de beste wapens van het rijk. Uit lava, wat anders?'];

/* ---------- only from level 20 ---------- */
function gateLevel(){const it=INTER.find(i=>i.txt==='Stap door het portaal naar het Demonenrijk');if(!it)return;const fn=it.fn;
  it.txt=()=>PL.lvl<20?'Demonenrijk (niveau 20 nodig, jij bent niveau '+PL.lvl+')':'Stap door het portaal naar het Demonenrijk';
  it.fn=()=>{if(PL.lvl<20){addLog('De hitte van het portaal duwt je terug. Pas vanaf niveau 20 overleef je het Demonenrijk.','#ff7a4a');try{floatText(PL.x,PL.y+2.2,PL.z,'Niveau 20 nodig','#ff8a4a')}catch(e){}return}fn()}}

/* ---------- the parkour: laid out once, the same for everyone ---------- */
function layout(){let sd=91;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
  let prev={x:0,z:-334,r:4.6,y:0,t:'start'},dir=0;PK.plats.push(prev);
  for(let i=0;i<36;i++){let t='pillar';if(i===17)t='check';else if(i>3&&rn()<.2)t='bob';else if(i>5&&rn()<.18)t='crumble';else if(i>7&&rn()<.12)t='beam';
    dir=Math.max(-.7,Math.min(.7,dir+(rn()-.5)*.9));const ux=Math.sin(dir),uz=-Math.cos(dir),gap=t==='check'?1.6:1.3+rn()*(i<8?1:1.5);
    let y=prev.y+(rn()-.45)*1.1;y=Math.max(-1.6,Math.min(2.6,y));if(y>prev.y+.5)y=prev.y+.5;const pr=prev.t==='beam'?prev.L/2:prev.r;
    if(t==='beam'){const L=8+rn()*3;prev={x:prev.x+ux*(pr+gap+L/2),z:prev.z+uz*(pr+gap+L/2),L,w:1.5,ux,uz,y,t}}
    else{const r=t==='check'?4.2:1.5+rn()*.9;prev={x:prev.x+ux*(pr+gap+r),z:prev.z+uz*(pr+gap+r),r,y,t,ph:rn()*6.28}}
    prev.cy=prev.y;PK.plats.push(prev);
    if(i>2&&i%5===2&&t!=='check'){const a=PK.plats[PK.plats.length-2];PK.geys.push({x:(a.x+prev.x)/2,z:(a.z+prev.z)/2,ph:rn()*5,t:0,hurt:0})}}
  const ux=Math.sin(dir),uz=-Math.cos(dir),pr=prev.t==='beam'?prev.L/2:prev.r;I.x=prev.x+ux*(pr+1.8+I.r);I.z=prev.z+uz*(pr+1.8+I.r);I.y=Math.max(.5,Math.min(2.6,prev.y+.3));I.ux=ux;I.uz=uz;
  PK.plats[0].cy=0}
function pkGround(x,z){const lx=LX(x),lz=LZ(z);let best=-1e9;
  for(const p of PK.plats){if(p.t==='beam'){const dx=lx-p.x,dz=lz-p.z,a=dx*p.ux+dz*p.uz,b=dx*p.uz-dz*p.ux;if(Math.abs(a)<p.L/2&&Math.abs(b)<p.w/2&&p.cy>best)best=p.cy}else if(p.cy>best&&Math.hypot(lx-p.x,lz-p.z)<p.r)best=p.cy}
  if(Math.hypot(lx-I.x,lz-I.z)<I.r-.4)best=Math.max(best,I.y);return best>-1e8?best:LAVA_Y}
const inSea=(x,z)=>{if(!PK.built||!inDWx(x))return false;const lx=LX(x),lz=LZ(z);return lz<-200&&lz>-800&&Math.abs(lx)<300&&Math.hypot(lx,lz)>DW.R-1};
PK.inSea=(x,z)=>inSea(x,z);
const _ghI=groundH;groundH=function(x,z){return inSea(x,z)?pkGround(x,z):_ghI(x,z)};
/* the edge of the realm no longer stops you in the south: there the lava does */
const _gtI=gtClamp;gtClamp=function(P0){if(PK.built&&inDWx(P0.x)){const lx=LX(P0.x),lz=LZ(P0.z);if(lz<-290&&lz>-800&&Math.abs(lx)<300)return}return _gtI(P0)};

/* ---------- building ---------- */
function buildInferno(){if(!DW.built||PK.built)return;layout();const add=o=>{scene.add(o);return o};
  const rockT=dwCanvas('rock');rockT.repeat.set(1.2,1.2);
  const obs=new T.MeshStandardMaterial({map:rockT,emissiveMap:rockT,emissive:0xff6a2a,emissiveIntensity:.6,roughness:.9}),
    hot=new T.MeshStandardMaterial({map:rockT,emissiveMap:rockT,emissive:0xff4a10,emissiveIntensity:1.5,roughness:.9}),
    bobM=new T.MeshStandardMaterial({map:rockT,emissiveMap:rockT,emissive:0xffa040,emissiveIntensity:1,roughness:.9}),
    dark=new T.MeshStandardMaterial({color:0x241a1c,map:rockT,roughness:.95}),glow=new T.MeshBasicMaterial({color:0xff7a2a});
  /* the sea of lava, and the realm rising out of it like a plateau */
  {const t=DW.lavaT.clone();t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(16,15);PK.seaT=t;
    const sea=new T.Mesh(new T.PlaneGeometry(620,560),new T.MeshBasicMaterial({map:t}));sea.rotation.x=-Math.PI/2;sea.position.set(DW.X,LAVA_Y,DW.Z-540);add(sea);
    const sk=new T.Mesh(new T.CylinderGeometry(DW.R,DW.R+14,10.5,96,1,true),dark);sk.position.set(DW.X,-5.2,DW.Z);add(sk)}
  /* the pillars and beams */
  for(const p of PK.plats){const [x,z]=W2(p.x,p.z),h=p.y-LAVA_Y+1.4;let m;
    if(p.t==='beam'){m=new T.Mesh(new T.BoxGeometry(p.w,h,p.L),obs);m.rotation.y=Math.atan2(p.ux,p.uz)}
    else{const mat=p.t==='crumble'?hot:p.t==='bob'?bobM:p.t==='start'||p.t==='check'?dark:obs;m=new T.Mesh(new T.CylinderGeometry(p.r,p.r*1.2,h,p.t==='start'||p.t==='check'?12:6),mat);m.rotation.y=p.ph||0}
    m.position.set(x,p.y-h/2,z);m.castShadow=m.receiveShadow=true;m.userData.dyn=p.t==='bob'||p.t==='crumble';add(m);p.m=m;p.h=h}
  /* the fire beacon halfway */
  {const c=PK.plats.find(p=>p.t==='check');PK.cpP=c;const [x,z]=W2(c.x,c.z),b=new T.Group();b.position.set(x,c.y,z);add(b);
    b.add(mesh(new T.CylinderGeometry(.5,.7,3.2,8),dark,0,1.6,0));b.add(mesh(new T.CylinderGeometry(1.1,.6,.7,10),dark,0,3.4,0));
    const f=new T.Mesh(new T.ConeGeometry(.75,2,8),new T.MeshBasicMaterial({color:0x6a7a8a,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false}));f.position.y=4.6;f.userData.dyn=true;b.add(f);PK.beacon=f;
    makeChest(x+2.6,z+1.2,'vuurspringer',0,'Kist van de Vuurspringer')}
  /* geysers */
  for(const g of PK.geys){const [x,z]=W2(g.x,g.z),c=new T.Mesh(new T.CylinderGeometry(.7,1.2,1,10,1,true),new T.MeshBasicMaterial({color:0xffa03a,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));
    c.position.set(x,LAVA_Y,z);c.scale.y=.01;c.userData.dyn=true;add(c);g.m=c;const ring=new T.Mesh(new T.RingGeometry(.6,1.6,20),new T.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.6,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(x,LAVA_Y+.05,z);add(ring)}
  buildGloed(add,obs,dark,glow);PK.built=true}
/* ---------- Gloedhaven ---------- */
function buildGloed(add,obs,dark,glow){const [cx,cz]=W2(I.x,I.z),Y=I.y,lw=(lx,lz)=>W2(I.x+lx,I.z+lz);PK.gloed={cx,cz};
  const isl=new T.Mesh(new T.CylinderGeometry(I.r,I.r+12,I.y-LAVA_Y+3,56),dark);isl.position.set(cx,(I.y+LAVA_Y-3)/2,cz);isl.receiveShadow=true;add(isl);
  {const tt=dwCanvas('rock');tt.repeat.set(9,9);const top=new T.Mesh(new T.CircleGeometry(I.r,56),new T.MeshStandardMaterial({map:tt,emissiveMap:tt,emissive:0xff6a2a,emissiveIntensity:.5,roughness:.9}));top.rotation.x=-Math.PI/2;top.position.set(cx,Y+.02,cz);top.receiveShadow=true;add(top)}
  /* lava falling down the cliffs */
  {const t=DW.lavaT.clone();t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1,3);PK.fallT=t;const fm=new T.MeshBasicMaterial({map:t,side:T.DoubleSide});
    for(let i=0;i<5;i++){const a=i/5*6.283+.6,f=new T.Mesh(new T.PlaneGeometry(5,I.y-LAVA_Y+1),fm);f.position.set(cx+Math.sin(a)*(I.r+.6),(I.y+LAVA_Y)/2,cz+Math.cos(a)*(I.r+.6));f.rotation.y=a;add(f)}}
  /* the gate at the end of the parkour */
  {const ax=-I.ux*(I.r-3),az=-I.uz*(I.r-3),[gx,gz]=lw(ax,az),g=new T.Group();g.position.set(gx,Y,gz);g.rotation.y=Math.atan2(-I.ux,-I.uz);add(g);
    for(const s of[-1,1]){g.add(mesh(new T.CylinderGeometry(.8,1.1,8,6),dark,s*4.2,4,0));g.add(mesh(new T.SphereGeometry(.6,8,6),glow,s*4.2,8.4,0,false));const [px,pz]=lw(ax+s*4.2*Math.cos(g.rotation.y),az-s*4.2*Math.sin(g.rotation.y));addCircle(px,pz,1.1)}
    const ar=mesh(new T.TorusGeometry(4.2,.55,8,24,Math.PI),dark,0,8,0);g.add(ar);
    const t=canvasTex(256,64,(c,w,h)=>{c.fillStyle='#1a0e0a';c.fillRect(0,0,w,h);c.fillStyle='#ffb050';c.font='bold 34px Georgia,serif';c.textAlign='center';c.fillText('GLOEDHAVEN',w/2,44)});
    const sg=new T.Mesh(new T.PlaneGeometry(5,1.25),new T.MeshBasicMaterial({map:t,side:T.DoubleSide}));sg.position.set(0,10.3,0);g.add(sg)}
  /* the fire fountain in the middle */
  {const [fx,fz]=lw(0,0),lm=new T.MeshBasicMaterial({map:DW.lavaT});add(mesh(new T.TorusGeometry(4.2,.7,10,32),dark,fx,Y+.5,fz)).rotation.x=Math.PI/2;
    const pool=new T.Mesh(new T.CircleGeometry(4,32),lm);pool.rotation.x=-Math.PI/2;pool.position.set(fx,Y+.45,fz);add(pool);add(mesh(new T.CylinderGeometry(.9,1.3,4,10),dark,fx,Y+2,fz));
    add(mesh(new T.CylinderGeometry(2,.9,.8,14),dark,fx,Y+4.2,fz));const top=new T.Mesh(new T.CircleGeometry(1.8,20),lm);top.rotation.x=-Math.PI/2;top.position.set(fx,Y+4.62,fz);add(top);addCircle(fx,fz,4.8);PK.fountain=[fx,Y+4.8,fz]}
  /* huts of obsidian */
  const huts=[];for(let i=0;i<7;i++){const a=i/7*6.283+.3,r=26+(i%2)*5,lx=Math.sin(a)*r,lz=Math.cos(a)*r;if(Math.hypot(lx+I.ux*(I.r-14),lz+I.uz*(I.r-14))<14)continue;huts.push([lx,lz,a])}
  for(const [lx,lz,a] of huts){const [x,z]=lw(lx,lz),hr=4.4,g=new T.Group();g.position.set(x,Y,z);g.rotation.y=a+Math.PI;add(g);
    g.add(mesh(new T.CylinderGeometry(hr,hr*1.08,3.8,10),dark,0,1.9,0));g.add(mesh(new T.ConeGeometry(hr*1.3,3.4,10),dark,0,5.4,0));{const ring=mesh(new T.TorusGeometry(hr*1.02,.12,6,30),glow,0,3.75,0,false);ring.rotation.x=Math.PI/2;g.add(ring)}
    const d=new T.Mesh(new T.PlaneGeometry(1.6,2.4),new T.MeshBasicMaterial({color:0xff7a2a}));d.position.set(0,1.2,hr*1.05);g.add(d);addCircle(x,z,hr+.3)}
  /* the forge */
  {const [x,z]=lw(-17,6),g=new T.Group();g.position.set(x,Y,z);add(g);g.add(mesh(new T.BoxGeometry(4,3,3),dark,0,1.5,0));const op=new T.Mesh(new T.PlaneGeometry(1.6,1.2),new T.MeshBasicMaterial({color:0xffa040}));op.position.set(0,1.2,1.52);g.add(op);
    g.add(mesh(new T.CylinderGeometry(.6,.8,4,8),dark,1.2,4.5,-.6));g.add(mesh(new T.BoxGeometry(1.2,.5,.6),MAT.iron,0,1,3));g.add(mesh(new T.BoxGeometry(.5,.6,.4),dark,0,.5,3));addCircle(x,z,2.8);PK.chimney=[x+1.2,Y+6.6,z-.6]}
  /* the shrine of the Fire Heart */
  {const [x,z]=lw(I.ux*30,I.uz*30);add(mesh(new T.CylinderGeometry(1.6,2.2,2.2,8),dark,x,Y+1.1,z));const h=new T.Mesh(new T.OctahedronGeometry(1.3,0),new T.MeshStandardMaterial({color:0xffa040,emissive:0xff5a10,emissiveIntensity:1.6,roughness:.2}));
    h.scale.y=1.6;h.position.set(x,Y+4.4,z);h.userData.dyn=true;add(h);PK.heart=h;addCircle(x,z,2.2);
    INTER.push({x,z,r:4.2,cave:true,txt:()=>PL.fx&&PL.fx.fireheart?'Het Vuurhart gloeit rustig':'Raak het Vuurhart aan',fn:()=>{PL.fx=PL.fx||{};if(PL.fx.fireheart){addLog('Het Vuurhart heeft je al gekozen.','#ffb070');return}
      PL.fx.fireheart=1;giveItem('amu_fireheart',1);giveXp(500);addLog('Het Vuurhart kiest jou! Je krijgt het Vuurhart van Gloedhaven.','#ffd27a');try{sfx('level')}catch(e){}if(window.PW&&PW.ps)pwBurst(PW.ps,x,Y+4.4,z,90,7,1.2,.8,.12,[1,.8,.3],[1,.3,0],3,3,1,1)}});
    const [tx,tz]=lw(I.ux*30+4,I.uz*30+3);makeChest(tx,tz,'gloed',0,'Schat van Gloedhaven')}
  /* fire wisps */
  PK.wisps=[];for(let i=0;i<14;i++){const s=new T.Sprite(new T.SpriteMaterial({map:WD.tx('glare.png'),color:0xffa040,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false}));s.scale.set(2.2,2.2,1);s.userData={dyn:true,a:Math.random()*6.283,r:8+Math.random()*40,h:3+Math.random()*7,sp:.1+Math.random()*.25};add(s);PK.wisps.push(s)}}
/* ---------- the lava people ---------- */
function lavaPerson(job,lx,lz,o={}){const [x,z]=W2(I.x+lx,I.z+lz),fem=!!o.fem,skin=0x3a1c12;
  const look={fem,skin,tunic:o.tunic||0x1a1210,pants:0x241812,hair:0xff7a1a,hairStyle:o.hairStyle||(fem?'long':'bald'),beard:'none',eye:0xffb030,skirt:fem?0x2a1410:null,apron:job==='smith'?0x3a1a0a:null,scale:o.scale||(fem?.95:1.02),hat:o.hat||null,hatc:o.hatc};
  const h=makeHuman(look),sk=new T.Color(skin);
  h.g.traverse(m=>{if(!m.isMesh)return;const fix=mt=>{const im=mt.map&&mt.map.image,src=(im&&(im.currentSrc||im.src))||'';
      if(/eye/.test(src)){const c=mt.clone();c.emissive=new T.Color(0xffa020);c.emissiveIntensity=1.2;return c}
      if(/\/hair\//.test(src)){const c=mt.clone();c.color.setHex(0xff7a1a);c.emissive=new T.Color(0xff4a00);c.emissiveIntensity=.8;return c}
      if(/faces\/skin/.test(src)||(mt.color&&Math.abs(mt.color.r-sk.r)+Math.abs(mt.color.g-sk.g)+Math.abs(mt.color.b-sk.b)<.08)){const c=mt.clone();c.emissive=new T.Color(0x8a2a06);c.emissiveIntensity=.55;return c}return mt};
    m.material=Array.isArray(m.material)?m.material.map(fix):fix(m.material)});
  const a=baseActor({kind:'npc',job,name:o.name||'Lavamens',h,look,root:h.g,x,z,hp:260,ai:o.ai||'wander',line:'gloed',cave:true,roam:{x,z},radius:o.radius||12,...o});a.hpMax=a.hp;
  if(job==='guard'){try{setHeld(h,'sword_obsidian','shield_magma')}catch(e){}a.dmg=40;a.speed=3.6;a.guard=true}if(job==='smith')try{setHeld(h,'axe_obsidian')}catch(e){}
  scene.add(a.root);placeActor(a);return a}
function populateInferno(){if(!PK.built)return;
  /* Ouwe Kraterschild, far from the arrival */
  {let mx=225,mz=60;for(let t=0;t<80;t++){const x=225+rr(t*1.2),z=60+rr(t*1.2);if(!DW.pools.some(p=>Math.hypot(DW.X+x-p.x,DW.Z+z-p.z)<p.r+9)&&Math.hypot(x,z)<DW.R-25){mx=x;mz=z;break}}
    const [x,z]=W2(mx,mz),a=spawnMonster('lavaturtle',x,z,{cave:true,name:'Ouwe Kraterschild',sub:'Oermoeder van de lavaschildpadden',hp:3000,hpMax:3000,dmg:78,xp:2200,loot:'kraterschild',boss:'kraterschild',rad:5.5,hh:9.5,respawn:3600,aggro:40,speed:3.2});
    if(a&&a.root)a.root.scale.multiplyScalar(2.1);PK.boss=a}
  /* Gloedhaven */
  lavaPerson('lord',0,8,{name:'Oudvader Sintel',ai:'stay',hairStyle:'bald',tunic:0x4a1a0a,scale:1.08});
  lavaPerson('smith',-17,10,{name:'Smid Obsidia',ai:'stay',shop:['sword_obsidian','axe_obsidian','shield_magma','armor_magma','helm_magma','boots_magma']});
  lavaPerson('merchant',12,-6,{name:'Brouwster Asja',fem:true,ai:'stay',shop:['potion','elixir','ring_ember','gem','bread']});
  for(let i=0;i<7;i++){const a=Math.random()*6.283,r=6+Math.random()*16;lavaPerson('villager',Math.sin(a)*r,Math.cos(a)*r,{fem:i%2===0,name:['Gloed','Askra','Vonkel','Magna','Basalt','Sintra','Brand'][i]})}
  for(const s of[-1,1])lavaPerson('guard',-I.ux*(I.r-10)+s*5,-I.uz*(I.r-10)+s*5*0,{name:'Wacht van Gloedhaven',ai:'stay'})}

/* ---------- every frame ---------- */
const lavaFishM=new T.MeshBasicMaterial({color:0xffa040});
function lavaDeath(){PK.died=true;if(window.PW&&PW.ps)pwBurst(PW.ps,PL.x,LAVA_Y+.5,PL.z,80,6,1.4,.9,.15,[1,.8,.3],[.6,.1,0],4,4,1,1);PL.hp=0;try{playerDie()}catch(e){}
  try{const el=$('death');el.querySelector('h1').textContent='Verbrand in de lava';el.querySelector('p').textContent=PK.cp?'Je viel in de Vuurzee. Het vuurbaken brengt je terug naar het midden van het parcours.':'Je viel in de kokende lava van de Vuurzee. Er blijft alleen een wolkje rook over.'}catch(e){}}
ANIMS.push(dt=>{if(!PK.built||!inDWx(PL.x))return;const t=PL.t;
  if(PK.seaT){PK.seaT.offset.x=(PK.seaT.offset.x+dt*.004)%1;PK.seaT.offset.y=(PK.seaT.offset.y+dt*.0025)%1}if(PK.fallT)PK.fallT.offset.y=(PK.fallT.offset.y+dt*.25)%1;
  /* where are you standing */
  const lx=LX(PL.x),lz=LZ(PL.z),sea=inSea(PL.x,PL.z);let on=null;
  if(sea&&Math.abs(PL.y-pkGround(PL.x,PL.z))<.35)for(const p of PK.plats){if(p.t==='beam')continue;if(Math.hypot(lx-p.x,lz-p.z)<p.r&&Math.abs(PL.y-p.cy)<.35){on=p;break}}
  /* bobbing and sinking pillars */
  for(const p of PK.plats){if(p.t==='bob'){p.cy=p.y+Math.sin(t*1.3+p.ph)*.55;p.m.position.y=p.cy-p.h/2}
    else if(p.t==='crumble'){if(p.sink>0){p.sink+=dt*3.5;if(p.sink>11){p.back=(p.back||0)+dt;if(p.back>4.5){p.sink=0;p.tm=0;p.back=0}}}
      else if(on===p){p.tm=(p.tm||0)+dt;if(p.tm>1.15)p.sink=.01}else p.tm=Math.max(0,(p.tm||0)-dt);
      p.cy=p.y-Math.min(11,p.sink||0);p.m.position.set(p.m.position.x,p.cy-p.h/2,p.m.position.z);if(p.tm>.5&&!p.sink){p.m.position.x+=rr(.04);p.m.position.z+=rr(.04)}}}
  /* the fire beacon */
  if(on&&on.t==='check'&&!PK.cp){PK.cp=true;addLog('Het vuurbaken vlamt op voor jou. Val je in de lava, dan begin je hier opnieuw.','#ffb070');try{sfx('quest')}catch(e){}}
  if(PK.beacon){PK.beacon.material.color.setHex(PK.cp?0xff9a3a:0x6a7a8a);PK.beacon.scale.set(1,1+Math.sin(t*9)*.12,1)}
  /* geysers: bubbles, then a column of fire that throws you up */
  for(const g of PK.geys){const c=(t+g.ph)%5,[x,z]=W2(g.x,g.z);g.hurt-=dt;
    if(c<1.2){g.m.scale.y=.01;if(window.PW&&PW.ps&&Math.random()<dt*12)pwEm(PW.ps,x+rr(.8),LAVA_Y+.2,z+rr(.8),rr(.3),2,rr(.3),.6,.3,.04,[1,.8,.3],[1,.3,0],.8,0,1)}
    else if(c<2.6){const k=Math.min(1,(c-1.2)*4)*(c>2.3?(2.6-c)/.3:1);g.m.scale.y=Math.max(.01,k*13);g.m.position.y=LAVA_Y+g.m.scale.y/2;
      if(window.PW&&PW.ps&&Math.random()<dt*30)pwEm(PW.ps,x+rr(.5),LAVA_Y+k*12,z+rr(.5),rr(2),3,rr(2),1,.5,.08,[1,.85,.4],[1,.3,0],1,-1,1);
      if(k>.4&&g.hurt<=0&&Math.hypot(PL.x-x,PL.z-z)<2.2&&PL.y<LAVA_Y+k*13){g.hurt=.8;damagePlayer(22,{type:'geyser'});PL.vy=10;PL.onGround=false;floatText(PL.x,PL.y+2,PL.z,'Geiser!','#ffb050')}}
    else g.m.scale.y=.01}
  /* lava fish leap out of the sea */
  if(sea&&Math.random()<dt*.8&&PK.fish.length<4){const a=Math.random()*6.283,r=10+Math.random()*30,m=new T.Mesh(new T.SphereGeometry(.45,8,6),lavaFishM);m.scale.set(1,1,1.8);
    const x=PL.x+Math.cos(a)*r,z=PL.z+Math.sin(a)*r;scene.add(m);PK.fish.push({m,x,z,dx:rr(1),dz:rr(1),t:0})}
  for(let i=PK.fish.length-1;i>=0;i--){const f=PK.fish[i];f.t+=dt;const k=f.t/1.4;f.m.position.set(f.x+f.dx*k*6,LAVA_Y+Math.sin(Math.min(1,k)*Math.PI)*6,f.z+f.dz*k*6);f.m.rotation.x=-Math.cos(k*Math.PI)*1.2;
    if(window.PW&&PW.ps&&Math.random()<.5)pwEm(PW.ps,f.m.position.x,f.m.position.y,f.m.position.z,0,.5,0,.4,.25,.03,[1,.7,.2],[1,.2,0],.6,0,1);if(k>=1){scene.remove(f.m);PK.fish.splice(i,1)}}
  /* Gloedhaven: fountain, smoke, the Fire Heart, the wisps */
  if(PK.heart){PK.heart.rotation.y+=dt*.6;PK.heart.position.y=I.y+4.4+Math.sin(t*1.4)*.3}
  if(window.PW&&PW.ps&&PK.fountain&&Math.hypot(LX(PL.x)-I.x,LZ(PL.z)-I.z)<I.r+60){const [fx,fy,fz]=PK.fountain;if(Math.random()<dt*20)pwEm(PW.ps,fx+rr(.4),fy,fz+rr(.4),rr(1.4),4+Math.random()*2,rr(1.4),1.2,.35,.06,[1,.8,.3],[1,.3,0],1,-9,1);
    if(PK.chimney&&Math.random()<dt*6)pwEm(PW.ps,PK.chimney[0],PK.chimney[1],PK.chimney[2],rr(.3),1.6,rr(.3),3,.9,.3,[.25,.2,.18],[.08,.06,.05],.5,-.3,.5)}
  for(const s of PK.wisps||[]){const u=s.userData;u.a+=dt*u.sp;const [x,z]=W2(I.x+Math.cos(u.a)*u.r,I.z+Math.sin(u.a)*u.r);s.position.set(x,I.y+u.h+Math.sin(t*2+u.r)*.6,z)}
  /* first arrival in Gloedhaven */
  if(!PL.dead&&Math.hypot(lx-I.x,lz-I.z)<I.r-8&&PL.fx&&!PL.fx.seenGloed){PL.fx.seenGloed=1;giveXp(800);addLog('Je hebt de Vuurzee overgestoken! Welkom in Gloedhaven.','#ffd27a');
    if(window.cinematic&&!CIN.on){const [gx,gz]=W2(I.x,I.z),V=(a,b,c)=>new T.Vector3(a,b,c);cinematic([{d:5,from:V(gx+50,I.y+30,gz+40),to:V(gx+30,I.y+16,gz-30),lf:V(gx,I.y+3,gz),lt:V(gx,I.y+3,gz)}],'Gloedhaven','Het dorp van de lavamensen')}}
  /* no flying or riding over the sea of fire */
  if(sea&&PL.mounted){const F=PL.mounted;try{dismount()}catch(e){}const d=Math.hypot(lx,lz)||1;PL.x=DW.X+lx/d*(DW.R-6);PL.z=DW.Z+lz/d*(DW.R-6);PL.y=groundH(PL.x,PL.z);
    addLog(F&&F.flyM?'Vonk deinst terug: boven de Vuurzee is de hitte te fel om te vliegen. Spring zelf!':'Je rijdier weigert de lava op te gaan.','#ffb070')}
  /* the lava kills: you, and monsters that chase you into it */
  if(sea&&!PL.dead&&PL.y<LAVA_Y+1.6)lavaDeath();
  for(const a of actors)if(!a.dead&&a.kind==='enemy'&&a.cave&&inSea(a.x,a.z)&&pkGround(a.x,a.z)<=LAVA_Y+.01){if(window.PW&&PW.ps)pwBurst(PW.ps,a.x,LAVA_Y+.5,a.z,40,4,1,.8,.1,[1,.8,.3],[.6,.1,0],3,3,1,1);killActor(a,false)}});
/* after burning: back at the fire beacon if you lit it */
{const btn=$('respawn');if(btn){const old=btn.onclick;btn.onclick=function(e){const r=old?old.call(this,e):undefined;if(PK.died&&PK.cp&&PK.cpP){const [x,z]=W2(PK.cpP.x,PK.cpP.z);PL.x=x;PL.z=z;PL.y=PK.cpP.cy+.2;PL.vy=0;PL.inCave=true;addLog('Het vuurbaken brengt je terug.','#ffb070')}PK.died=false;return r}}}

/* ---------- Ouwe Kraterschild: a stamp that sets the ground ablaze, and her young ---------- */
ANIMS.push(dt=>{const a=PK.boss;if(!a||a.dead||!inDWx(PL.x))return;
  if(a.warn){a.warn.t-=dt;a.warn.m.material.opacity=.3+.35*Math.abs(Math.sin(a.warn.t*14));if(a.warn.t<=0){scene.remove(a.warn.m);a.warn=null;const d=Math.hypot(PL.x-a.x,PL.z-a.z);
      if(window.PW){PW.shake=Math.max(PW.shake||0,.6);if(PW.ps)pwBurst(PW.ps,a.x,a.y+.5,a.z,110,11,1.2,.9,.2,[1,.8,.3],[1,.25,0],4,4,1,1)}try{WD.roar(.8)}catch(e){}if(d<11)damagePlayer(48,a)}}
  else if(a.state==='chase'){a.stCd=(a.stCd??5)-dt;if(a.stCd<=0&&Math.hypot(PL.x-a.x,PL.z-a.z)<16){a.stCd=a.hp<a.hpMax*.5?4.5:6.5;
    const m=new T.Mesh(new T.RingGeometry(1,11,40),new T.MeshBasicMaterial({color:0xff4a10,transparent:true,opacity:.5,depthWrite:false,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(a.x,a.y+.15,a.z);scene.add(m);a.warn={m,t:1.2};addLog('Kraterschild stampt... de grond begint te gloeien!','#ff8a4a')}}
  for(const [k,f] of[['b1',.66],['b2',.33]])if(!a[k]&&a.hp<a.hpMax*f){a[k]=1;addLog('Kraterschild roept haar jongen!','#ff8a4a');for(let i=0;i<2;i++)spawnMonster('lavaturtle',a.x+rr(8),a.z+rr(8),{cave:true,provoked:true,respawn:1e9})}});

/* ---------- hooks ---------- */
const _bfI=buildFantasy;buildFantasy=function(){_bfI();try{gateLevel()}catch(e){console.warn('inferno gate',e)}try{buildInferno()}catch(e){console.warn('inferno',e)}};
const _pfI=populateFantasy;populateFantasy=function(){_pfI();try{populateInferno()}catch(e){console.warn('inferno pop',e)}};
RUMORS.push({t:'Achter de arena van de Reuzen-Vierhand ligt een zee van lava. Wie over de zwarte zuilen springt, vindt aan de overkant de lavamensen van Gloedhaven.'});
})();
