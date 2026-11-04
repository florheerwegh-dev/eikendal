/* ================= De Oertijd: the age of the dinosaurs =================
   The time machine of Raderburg sends you millions of years back: to a jungle valley ringed by mountains, with tree
   ferns, monkey-puzzle trees and cycads, two lakes, and a smoking volcano with lava in its crater. Here live
   velociraptors (in packs), triceratops, stegosaurus, peaceful giant brachiosaurus and one great Tyrannosaurus rex;
   pteranodons glide overhead. Dinosaur eggs lie in nests. The time machine stands where you arrive, and brings you
   back to your own time. The valley lies far to the east of the world (x 40000); it is built the first time you go. */
(function(){
const X3=40000,Z3=0,RD=720,inD=x=>x>30000&&x<60000,rr=(a=1)=>(Math.random()*2-1)*a;
const D={built:false,X:X3,Z:Z3};WD.dino=D;
const VOL={x:250,z:-260,r:150,h:150},LAKES=[{x:-210,z:110,r:105},{x:170,z:290,r:66}],LAND={x:0,z:430};
function dH(x,z){const u=x-X3,v=z-Z3,r=Math.hypot(u,v);
  let h=(fbm(u*.004+5,v*.004-3,5)-.5)*24+9;h+=Math.pow(Math.max(0,fbm(u*.006+40,v*.006+2,3)-.55)*3,2)*40;
  const dv=Math.hypot(u-VOL.x,v-VOL.z);if(dv<VOL.r*1.6){const cone=VOL.h*(1-smooth(0,VOL.r*1.5,dv))+(fbm(u*.03,v*.03,2)-.5)*6;h=Math.max(h,dv<24?cone-(24-dv)*1.6:cone)}
  for(const L of LAKES){const d=Math.hypot(u-L.x,v-L.z)+(fbm(u*.02,v*.02,2)-.5)*30;if(d<L.r+40)h=lerp(h,-4,1-smooth(L.r-25,L.r+40,d))}
  h+=smooth(RD-170,RD-20,r+(fbm(u*.01,v*.01,2)-.5)*80)*(120+fbm(u*.01,v*.01,3)*90);
  const ds=Math.hypot(u-LAND.x,v-LAND.z);if(ds<44)h=lerp(h,8,1-smooth(20,44,ds));return h}
D.h=dH;
const _gD=groundH;groundH=function(x,z){return inD(x)?dH(x,z):_gD(x,z)};
const _tD=terrainH;terrainH=function(x,z){return inD(x)?dH(x,z):_tD(x,z)};
const _cD=gtClamp;gtClamp=function(P){if(inD(P.x)){const dx=P.x-X3,dz=P.z-Z3,d=Math.hypot(dx,dz);if(d>RD-80){P.x=X3+dx/d*(RD-80);P.z=Z3+dz/d*(RD-80)}return}return _cD(P)};
/* daylight and a warm, steamy haze (not a dark cave) */
const _ueD=updateEnv,HAZE=new T.Color(0xc8d8b0),HAZEN=new T.Color(0x1a2618);
updateEnv=function(dt,pp){if(pp===PL&&inD(PL.x)){const q=Object.create(PL,{inCave:{value:false,writable:true}});_ueD(dt,q);scene.fog.color.lerp((ENV.night||0)>.5?HAZEN:HAZE,.55);scene.fog.density=Math.max(scene.fog.density,.0032)}else _ueD(dt,pp)};
const _dmD=drawMini;drawMini=function(){if(!inD(PL.x))return _dmD();const c=$('mini'),g=c.getContext('2d'),S=150;g.fillStyle='#2f4a24';g.fillRect(0,0,S,S);g.fillStyle='#ffd27a';g.font='bold 14px serif';g.textAlign='center';g.fillText('Oertijd',S/2,S/2-8);
  const k=S/210;for(const a of actors){if(a.dead||a.kind!=='enemy'||!inD(a.x))continue;const dx=(a.x-PL.x)*k,dz=(a.z-PL.z)*k;if(Math.abs(dx)<70&&Math.abs(dz)<70){g.fillStyle=a.boss?'#ff4a2a':'#e5913f';g.fillRect(S/2+dx-2,S/2+dz-2,4,4)}}arrow(g,S/2,S/2,PL.yaw,6)};
/* ---------- the dinosaurs ---------- */
const DK={raptor:{n:'Velociraptor',hp:150,dmg:16,speed:7.4,aggro:26,range:2.1,rad:.6,hh:1.7,xp:80,bi:1,L:2.8,H:.95,col:0x5e4a26,col2:0x9a8458,ico:'🦖',lore:'Snel, slim en altijd in een groep. Als je er één ziet, zijn er meer.'},
  trex:{n:'Tyrannosaurus rex',hp:6500,dmg:78,speed:6.2,aggro:44,range:5.4,rad:2.4,hh:6.8,xp:3500,bi:1,L:12,H:3.8,col:0x3f3f28,col2:0x6e6446,boss:'trex',ico:'🦖',lore:'De koning van de Oertijd. Zijn brul laat de grond trillen.'},
  trike:{n:'Triceratops',hp:1500,dmg:42,speed:4.4,aggro:9,range:3.6,rad:2,hh:3.3,xp:600,L:8,H:1.9,col:0x4a5a30,col2:0x7a7448,ico:'🦕',lore:'Drie hoorns en een groot schild. Rustig, tot je te dichtbij komt.'},
  stego:{n:'Stegosaurus',hp:1200,dmg:36,speed:3.8,aggro:7,range:3.6,rad:1.9,hh:4.2,xp:500,L:8,H:2.2,col:0x3e5244,col2:0x6e765a,ico:'🦕',lore:'Platen op zijn rug en pinnen aan zijn staart. Blijf uit de buurt van die staart!'},
  para:{n:'Parasaurolophus',hp:900,dmg:28,speed:5,aggro:0,range:3,rad:1.6,hh:4,xp:350,bi:1,L:9,H:2.6,col:0x5a6a3a,col2:0x8a8a5a,ico:'🦕',lore:'Een vredige eendensnavel-dino met een holle kam op zijn kop. Hij toetert als een hoorn.'},
  brachio:{n:'Brachiosaurus',hp:4200,dmg:55,speed:2.6,aggro:0,range:5.5,rad:3.4,hh:13,xp:1500,L:22,H:5.2,col:0x56604a,col2:0x7c7c62,ico:'🦕',lore:'Zo hoog als een toren en zo vredig als een koe. Valt niemand aan, tenzij je hem pijn doet.'}};
for(const [k,d] of Object.entries(DK))MON[k]={n:d.n,hp:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,xp:d.xp,loot:k,rad:d.rad,hh:d.hh,boss:d.boss};
addEventListener('load',()=>{try{const F=WD.fun;for(const [k,d] of Object.entries(DK)){if(F&&F.ICO)F.ICO[k]=d.ico;if(F&&F.LORE)F.LORE[k]=d.lore}}catch(e){}});
Object.assign(ITEMS,{dino_ei:{n:'Dino-ei',g:'food',heal:70,stam:40,price:150,ico:'🥚',rar:'r'},raptorklauw:{n:'Raptorklauw',g:'mat',price:180,ico:'🦴',rar:'r'},trex_tand:{n:'T-rex-tand',g:'mat',price:900,ico:'🦷',rar:'e'},
  amu_trex:{n:'Ketting van de T-rex',g:'amulet',fx:{dmg:9,hp:50},col:0xe8dcc0,price:4000,ico:'🦷',rar:'l',desc:'Een tand van de koning van de Oertijd. Je slaat harder.'}});
LOOTX.raptor=()=>({gold:Math.floor(rnd(10,30)),items:Math.random()<.6?[['raptorklauw',1]]:[]});
LOOTX.trike=()=>({gold:Math.floor(rnd(60,140)),items:[['fossiel',1]].filter(([i])=>ITEMS[i])});LOOTX.stego=LOOTX.trike;
LOOTX.para=()=>({gold:Math.floor(rnd(50,120)),items:Math.random()<.4?[['fossiel',1]].filter(([i])=>ITEMS[i]):[]});
LOOTX.brachio=()=>({gold:Math.floor(rnd(120,260)),items:[['barnsteen',1]].filter(([i])=>ITEMS[i])});
LOOTX.trex=()=>({gold:3000,items:[['trex_tand',2],['amu_trex',1],['barnsteen',2]].filter(([i])=>ITEMS[i])});
const mt=c=>new T.MeshStandardMaterial({color:c,roughness:.9,metalness:0});
function dinoModel(kind){const d=DK[kind],L=d.L,H=d.H,g=new T.Group(),b=mt(d.col),bl=mt(d.col2),dk=mt(0x2a2418),legs=[];
  const add=(par,geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;par.add(o);return o};
  const leg=(x,z,len,th)=>{const p=new T.Group();p.position.set(x,H,z);g.add(p);add(p,new T.CylinderGeometry(th,th*.8,len*.55,8),b,0,-len*.27,0);add(p,new T.CylinderGeometry(th*.7,th*.55,len*.5,8),bl,0,-len*.72,-th*.3);add(p,new T.BoxGeometry(th*1.6,th*.5,th*2.2),dk,0,-len+th*.2,th*.6);legs.push(p);return p};
  let head,tail;
  if(d.bi){const W=L*.11,Hb=L*.12,Lb=L*.24;const body=add(g,new T.SphereGeometry(1,16,12),b,0,H+Hb*.25,0);body.scale.set(W,Hb,Lb);
    add(g,new T.SphereGeometry(1,12,10),bl,0,H+Hb*.05,Lb*.15).scale.set(W*.82,Hb*.7,Lb*.8);
    head=new T.Group();head.position.set(0,H+Hb*.7,Lb*.85);g.add(head);const hs=kind==='trex'?L*.1:L*.075;add(head,new T.CylinderGeometry(W*.45,W*.6,Lb*.6,10),b,0,Hb*.2,0,-.6);
    add(head,new T.BoxGeometry(hs*.9,hs*.8,hs*1.8),b,0,Hb*.55,Lb*.32);add(head,new T.BoxGeometry(hs*.8,hs*.25,hs*1.5),bl,0,Hb*.55-hs*.45,Lb*.3);for(const s of[-1,1])add(head,new T.SphereGeometry(hs*.1,6,5),dk,s*hs*.42,Hb*.55+hs*.22,Lb*.32+hs*.35);
    for(let i=0;i<6;i++)add(head,new T.ConeGeometry(hs*.05,hs*.18,4),mt(0xf0e8d0),(i%2?.3:-.3)*hs,Hb*.55-hs*.42,Lb*.32+hs*(.3+i*.1),Math.PI);
    for(const s of[-1,1])add(g,new T.BoxGeometry(W*.18,Hb*.6,W*.2),b,s*W*.55,H+Hb*.1,Lb*.6,.6);
    leg(-W*.55,0,H,W*.32);leg(W*.55,0,H,W*.32);
    tail=new T.Group();tail.position.set(0,H+Hb*.2,-Lb*.8);g.add(tail);add(tail,new T.ConeGeometry(Hb*.75,L*.5,10),b,0,0,-L*.25,-Math.PI/2);
    if(kind==='raptor')for(let i=0;i<5;i++)add(g,new T.BoxGeometry(W*.05,Hb*.5,Lb*.3),mt(0x3a2a1a),0,H+Hb*1.05,-Lb*.5+i*Lb*.28)}
  else{const W=L*.14,Hb=L*.13,Lb=L*.26;const body=add(g,new T.SphereGeometry(1,18,12),b,0,H+Hb*.3,0);body.scale.set(W,Hb,Lb);add(g,new T.SphereGeometry(1,12,10),bl,0,H,0).scale.set(W*.85,Hb*.6,Lb*.85);
    const th=kind==='brachio'?W*.28:W*.24;leg(-W*.7,Lb*.55,H,th);leg(W*.7,-Lb*.55,H,th);leg(W*.7,Lb*.55,kind==='brachio'?H*1.1:H,th);leg(-W*.7,-Lb*.55,H,th);
    head=new T.Group();g.add(head);
    if(kind==='brachio'){head.position.set(0,H+Hb*.9,Lb*.75);const nl=L*.42;add(head,new T.CylinderGeometry(W*.16,W*.32,nl,10),b,0,nl*.4,nl*.28,.95);const hh=new T.Group();hh.position.set(0,nl*.8,nl*.55);head.add(hh);add(hh,new T.BoxGeometry(W*.3,W*.28,W*.6),b,0,0,W*.15);for(const s of[-1,1])add(hh,new T.SphereGeometry(W*.04,6,5),dk,s*W*.14,W*.06,W*.3)}
    else{head.position.set(0,H+Hb*.2,Lb*.95);const hs=L*.09;add(head,new T.BoxGeometry(hs*1.1,hs,hs*1.8),b,0,0,hs*.6);add(head,new T.ConeGeometry(hs*.35,hs*.7,4),mt(0x4a3a2a),0,-hs*.2,hs*1.6,Math.PI/2);for(const s of[-1,1])add(head,new T.SphereGeometry(hs*.12,6,5),dk,s*hs*.5,hs*.25,hs*.9);
      if(kind==='trike'){add(head,new T.CylinderGeometry(hs*1.5,hs*1.5,hs*.2,20),mt(0xb0603a),0,hs*.5,-hs*.3,-1.1);for(const s of[-1,1])add(head,new T.ConeGeometry(hs*.14,hs*1.6,8),mt(0xf0e8d0),s*hs*.35,hs*.7,hs*1.2,.9);add(head,new T.ConeGeometry(hs*.12,hs*.6,8),mt(0xf0e8d0),0,hs*.2,hs*1.9,1.2)}}
    tail=new T.Group();tail.position.set(0,H+Hb*.2,-Lb*.85);g.add(tail);add(tail,new T.ConeGeometry(Hb*.6,L*(kind==='brachio'?.5:.38),10),b,0,0,-L*(kind==='brachio'?.25:.19),-Math.PI/2);
    if(kind==='stego'){for(let i=0;i<9;i++){const z=Lb*.8-i*Lb*.2,hp=(1-Math.abs(i-4)/5)*Hb*1.1+Hb*.3;add(g,new T.BoxGeometry(W*.06,hp,hp*.9),mt(0xa04a2a),(i%2?.12:-.12)*W,H+Hb*1.1+hp*.35,z,0,0,(i%2?.15:-.15)).rotation.x=.78}
      for(const s of[-1,1])for(const k of[0,1])add(tail,new T.ConeGeometry(W*.06,Hb*.9,6),mt(0xe8dcc0),s*W*.15,Hb*.3,-L*.3-k*W*.4,0,0,s*1.1)}}
  g.traverse(o=>{if(o.isMesh)o.receiveShadow=true});return{g,legs,head,tail,dino:kind,bi:!!d.bi,ph:Math.random()*6,L}}

/* ---------- real models: the Animated LowPoly Dinosaurs of Quaternius (CC0), with idle, walk and run ---------- */
const FBXN={trex:'Trex',raptor:'Velociraptor',trike:'Triceratops',stego:'Stegosaurus',brachio:'Apatosaurus',para:'Parasaurolophus'};
let fbxP=null;
function loadFBX(){if(fbxP)return fbxP;D.fbx={};if(!T.FBXLoader||typeof asFetchBin!=='function')return fbxP=Promise.resolve(D.fbx);
  const ld=new T.FBXLoader();fbxP=Promise.all(Object.entries(FBXN).map(async([k,n])=>{try{const o=ld.parse(await asFetchBin('assets/dinos/'+n+'.fbx'),'');o.updateMatrixWorld(true);
    o.traverse(q=>{if(!q.isMesh)return;q.castShadow=true;q.receiveShadow=true;const conv=m=>{const c=m.color?m.color.clone().convertLinearToSRGB():new T.Color(0x888888);return new T.MeshStandardMaterial({color:c,roughness:.85,metalness:0,skinning:!!q.isSkinnedMesh})};q.material=Array.isArray(q.material)?q.material.map(conv):conv(q.material)});
    const b=new T.Box3().setFromObject(o);D.fbx[k]={o,box:b,size:b.getSize(new T.Vector3())}}catch(e){console.warn('dino model '+n,e)}})).then(()=>D.fbx);return fbxP}
D.loadFBX=loadFBX;
function fbxModel(kind){const F=D.fbx&&D.fbx[kind];if(!F||!T.SkeletonUtils)return null;const g0=T.SkeletonUtils.clone(F.o),s=DK[kind].L/Math.max(F.size.x,F.size.z),g=new T.Group();
  g0.scale.multiplyScalar(s);g0.position.y=-F.box.min.y*s;g0.rotation.y=D.fbxRot||0;g.add(g0);g0.traverse(q=>{if(q.isMesh)q.frustumCulled=false});
  const mixer=new T.AnimationMixer(g0),acts={};for(const c of F.o.animations)acts[c.name]=mixer.clipAction(c);const find=re=>Object.keys(acts).find(n=>re.test(n));
  const m={g,mixer,acts,idle:find(/idle/i),walk:find(/walk/i),run:find(/run/i),atk:find(/attack/i),cur:null,dino:kind,fbx:true,L:DK[kind].L};fplay(m,m.idle);m.mixer.update(Math.random()*2);return m}
function fplay(m,n,fade=.25){if(!n||m.cur===n)return;const a=m.acts[n];a.reset().setEffectiveWeight(1).fadeIn(fade).play();if(m.cur)m.acts[m.cur].fadeOut(fade);m.cur=n}
const _aHD=animHorse;animHorse=function(m,dt,sp){if(!m||!m.dino)return _aHD(m,dt,sp);
  if(m.fbx){const top=DK[m.dino].speed;fplay(m,sp<.35?m.idle:sp<top*.62||!m.run?m.walk:m.run);const a=m.acts[m.cur];if(a&&m.cur!==m.idle)a.timeScale=Math.max(.5,Math.min(1.6,sp/(m.cur===m.run?top:top*.45)));m.mixer.update(dt);return}const v=Math.min(1.4,sp/Math.max(1,DK[m.dino].speed*.6)),amp=.55*Math.min(1,v);m.ph+=dt*(1.2+sp*1.4/Math.max(1,m.L*.25));
  m.legs.forEach((l,i)=>{const off=m.bi?i*Math.PI:[0,Math.PI,0,Math.PI][i];l.rotation.x=Math.sin(m.ph+off)*amp});m.tail.rotation.y=Math.sin(m.ph*.5)*.18;m.head.rotation.x=Math.sin(m.ph*.5)*.05*(1+v);
};
function spawnDino(kind,x,z,o={}){const d=DK[kind],m=fbxModel(kind)||dinoModel(kind);const a=baseActor({kind:'enemy',type:kind,name:d.n,model:m,root:m.g,x,z,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:kind,cave:true,boss:d.boss,passive:d.aggro===0,...o});
  scene.add(a.root);placeActor(a);return a}
D.spawn=spawnDino;
/* the T-rex roars when it sees you */
const _uED=updateEnemy;updateEnemy=function(a,dt){const r=_uED(a,dt);if(a.type==='trex'&&a.state==='chase'&&PL.t-(a.roarT||-1e9)>14){a.roarT=PL.t;floatText(a.x,a.y+7,a.z,'ROOOAAARRR!','#ff7a4a');try{if(window.PW)PW.shake=Math.max(PW.shake||0,.6)}catch(e){}sfx('thunder')}return r};
/* ---------- building the valley ---------- */
const G=new T.Group();
function build(){if(D.built)return;D.built=true;const t0=performance.now();scene.add(G);
  /* the land */
  const mat=new T.MeshStandardMaterial({vertexColors:true,map:TEX.grass||null,roughness:1}),CH=200;
  for(let cx=-4;cx<4;cx++)for(let cz=-4;cz<4;cz++){const ox=X3+cx*CH+CH/2,oz=Z3+cz*CH+CH/2,SEG=40,g=new T.PlaneGeometry(CH,CH,SEG,SEG);g.rotateX(-Math.PI/2);const p=g.attributes.position,n=p.count,cols=new Float32Array(n*3),uv=new Float32Array(n*2);
    for(let i=0;i<n;i++){const x=p.getX(i)+ox,z=p.getZ(i)+oz,h=dH(x,z);p.setXYZ(i,x,h,z);uv[i*2]=x/9;uv[i*2+1]=z/9;const nn=fbm(x*.05,z*.05,3),u=x-X3,v=z-Z3,dv=Math.hypot(u-VOL.x,v-VOL.z);
      let r=.2+.08*nn,gg=.36+.12*nn,b=.1+.04*nn;const sand=1-smooth(-.5,1.6,h);r=lerp(r,.55,sand);gg=lerp(gg,.48,sand);b=lerp(b,.3,sand);
      const rock=smooth(45,90,h)*(1-smooth(VOL.r*.9,VOL.r*1.4,dv));const ash=1-smooth(VOL.r*.8,VOL.r*1.5,dv);r=lerp(r,.16,ash);gg=lerp(gg,.14,ash);b=lerp(b,.13,ash);
      const mtn=smooth(60,120,h)*smooth(VOL.r*1.4,VOL.r*1.8,dv);r=lerp(r,.42,mtn);gg=lerp(gg,.4,mtn);b=lerp(b,.36,mtn);const lava=1-smooth(10,26,dv);r=lerp(r,1,lava);gg=lerp(gg,.35,lava);b=lerp(b,.05,lava);
      cols[i*3]=r;cols[i*3+1]=gg;cols[i*3+2]=b}
    g.setAttribute('color',new T.BufferAttribute(cols,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingSphere();const me=new T.Mesh(g,mat);me.receiveShadow=true;G.add(me)}
  const water=new T.Mesh(new T.PlaneGeometry(1500,1500),new T.MeshStandardMaterial({color:0x2f6a5a,roughness:.15,metalness:.2,transparent:true,opacity:.82}));water.rotation.x=-Math.PI/2;water.position.set(X3,-.3,Z3);G.add(water);
  {const lv=new T.Mesh(new T.CircleGeometry(16,24),new T.MeshBasicMaterial({color:0xff6a1a}));lv.rotation.x=-Math.PI/2;lv.position.set(X3+VOL.x,dH(X3+VOL.x,Z3+VOL.z)+1.5,Z3+VOL.z);G.add(lv);D.lava=lv}
  /* plants: tree ferns, monkey-puzzle trees, cycads and ferns on the ground (instanced) */
  const leaf=new T.MeshStandardMaterial({color:0x3f6a24,roughness:.8,side:T.DoubleSide}),leaf2=new T.MeshStandardMaterial({color:0x2c4f1c,roughness:.8,side:T.DoubleSide}),bark=new T.MeshStandardMaterial({color:0x4a3a28,roughness:1});
  const frond=(()=>{const gs=[];for(let i=0;i<8;i++){const p=new T.PlaneGeometry(.7,3.2,1,3);p.translate(0,1.6,0);const P=p.attributes.position;for(let k=0;k<P.count;k++){const yy=P.getY(k);P.setZ(k,-yy*yy*.08)}p.rotateX(-1.05);p.rotateY(i/8*6.283);gs.push(p)}return T.BufferGeometryUtils.mergeBufferGeometries(gs)})();
  const ok=(x,z,h)=>{const u=x-X3,v=z-Z3;if(Math.hypot(u,v)>RD-190||h<.6||h>70)return false;if(Math.hypot(u-VOL.x,v-VOL.z)<VOL.r*1.1)return false;if(Math.hypot(u-LAND.x,v-LAND.z)<40)return false;return true};
  const place=(n,fn)=>{const L=[];for(let t=0;t<n*6&&L.length<n;t++){const x=X3+rr(RD),z=Z3+rr(RD),h=dH(x,z);if(ok(x,z,h))L.push(fn(x,z,h))}return L};
  const inst=(geo,mat,list,mtx)=>{const im=new T.InstancedMesh(geo,mat,list.length),o=new T.Object3D();list.forEach((q,i)=>{mtx(o,q);o.updateMatrix();im.setMatrixAt(i,o.matrix)});im.castShadow=true;im.receiveShadow=true;G.add(im);return im};
  const ferns=place(900,(x,z,h)=>({x,z,h,s:.8+Math.random()*.7,r:Math.random()*6.3,t:3+Math.random()*4}));
  inst(new T.CylinderGeometry(.22,.3,1,7).translate(0,.5,0),bark,ferns,(o,q)=>{o.position.set(q.x,q.h,q.z);o.scale.set(q.s,q.t*q.s,q.s);o.rotation.set(0,q.r,0)});
  inst(frond,leaf,ferns,(o,q)=>{o.position.set(q.x,q.h+q.t*q.s,q.z);o.scale.setScalar(q.s*1.2);o.rotation.set(0,q.r,0)});
  const pines=place(420,(x,z,h)=>({x,z,h,s:.8+Math.random()*.6,r:Math.random()*6.3}));
  inst(new T.CylinderGeometry(.35,.6,18,8).translate(0,9,0),bark,pines,(o,q)=>{o.position.set(q.x,q.h,q.z);o.scale.setScalar(q.s);o.rotation.set(0,q.r,0)});
  const crown=(()=>{const gs=[];for(let k=0;k<4;k++){const c=new T.ConeGeometry(3.2-k*.6,1.6,10);c.translate(0,14+k*1.6,0);gs.push(c)}return T.BufferGeometryUtils.mergeBufferGeometries(gs)})();
  inst(crown,leaf2,pines,(o,q)=>{o.position.set(q.x,q.h,q.z);o.scale.setScalar(q.s);o.rotation.set(0,q.r,0)});
  const cyc=place(420,(x,z,h)=>({x,z,h,s:.7+Math.random()*.6,r:Math.random()*6.3}));
  inst(new T.CylinderGeometry(.45,.6,1.6,8).translate(0,.8,0),bark,cyc,(o,q)=>{o.position.set(q.x,q.h,q.z);o.scale.setScalar(q.s);o.rotation.set(0,q.r,0)});
  inst(frond,leaf,cyc,(o,q)=>{o.position.set(q.x,q.h+1.5*q.s,q.z);o.scale.setScalar(q.s*.9);o.rotation.set(0,q.r,0)});
  const low=place(1600,(x,z,h)=>({x,z,h,s:.4+Math.random()*.5,r:Math.random()*6.3}));
  inst(frond,leaf2,low,(o,q)=>{o.position.set(q.x,q.h,q.z);o.scale.setScalar(q.s);o.rotation.set(0,q.r,0)});
  for(const q of ferns)addCircle(q.x,q.z,.35*q.s);for(const q of pines)addCircle(q.x,q.z,.6*q.s);for(const q of cyc)addCircle(q.x,q.z,.55*q.s);
  /* nests with eggs */
  D.nests=[];for(let i=0;i<7;i++){for(let t=0;t<40;t++){const x=X3+rr(RD-220),z=Z3+rr(RD-220),h=dH(x,z);if(!ok(x,z,h))continue;D.nests.push([x,z]);const ring=new T.Mesh(new T.TorusGeometry(1.4,.45,6,14),mt(0x6a5236));ring.rotation.x=Math.PI/2;ring.position.set(x,h+.2,z);G.add(ring);
    for(let k=0;k<3;k++)try{makePickup(x+rr(.6),z+rr(.6),'dino_ei',1)}catch(e){}break}}
  /* the time machine, here at the landing place */
  {const x=X3+LAND.x,z=Z3+LAND.z,y=dH(x,z),brass=new T.MeshStandardMaterial({color:0xc9a040,metalness:.85,roughness:.32});const base=new T.Mesh(new T.CylinderGeometry(5.2,5.8,.8,32),new T.MeshStandardMaterial({color:0x3a3a40,metalness:.7,roughness:.45}));base.position.set(x,y+.4,z);G.add(base);
    const core=new T.Mesh(new T.SphereGeometry(1.1,20,14),new T.MeshBasicMaterial({color:0x7ad8ff}));core.position.set(x,y+3.2,z);G.add(core);D.rings=[];for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(2.4+i*.7,.16,10,48),brass);ring.position.set(x,y+3.2,z);G.add(ring);D.rings.push(ring)}D.core=core;
    INTER.push({x,z,r:6.5,txt:'Reis met de tijdmachine terug naar je eigen tijd',fn:back,cave:true});D.tm={x,z}}
  /* the dinosaurs */
  const spot=(R0,cx=0,cz=0,ok2)=>{for(let t=0;t<80;t++){const x=X3+cx+rr(R0),z=Z3+cz+rr(R0),h=dH(x,z);if(!ok(x,z,h)||h>40)continue;if(Math.hypot(x-X3-LAND.x,z-Z3-LAND.z)<90)continue;if(ok2&&!ok2(x,z))continue;return[x,z]}return null};
  for(let p=0;p<6;p++){const c=spot(RD-260);if(!c)continue;for(let k=0;k<3;k++)spawnDino('raptor',c[0]+rr(5),c[1]+rr(5))}
  for(let i=0;i<6;i++){const c=spot(RD-240);if(c)spawnDino('trike',c[0],c[1])}
  for(let i=0;i<5;i++){const c=spot(RD-240);if(c)spawnDino('stego',c[0],c[1])}
  for(let i=0;i<5;i++){const c=spot(RD-260,-210,110);if(c)spawnDino('brachio',c[0],c[1])}
  for(let h=0;h<2;h++){const c=spot(160,h?150:-200,h?250:60);if(c)for(let k=0;k<4;k++)spawnDino('para',c[0]+rr(10),c[1]+rr(10))}
  {const c=spot(140,60,-60);if(c)spawnDino('trex',c[0],c[1])}
  /* pteranodons gliding overhead */
  D.ptera=[];const pm2=mt(0x7a5a4a);for(let i=0;i<12;i++){const g=new T.Group();g.add(new T.Mesh(new T.CylinderGeometry(.18,.1,1.6,6),pm2).rotateX(Math.PI/2));const hd=new T.Mesh(new T.ConeGeometry(.12,1.1,5),pm2);hd.rotation.x=Math.PI/2;hd.position.z=1.2;g.add(hd);
    const wl=[];for(const s of[-1,1]){const w=new T.Mesh(new T.PlaneGeometry(2.6,1),new T.MeshStandardMaterial({color:0x8a6a5a,side:T.DoubleSide}));w.rotation.x=-Math.PI/2;w.position.x=s*1.35;const piv=new T.Group();piv.add(w);g.add(piv);wl.push({piv,s})}
    G.add(g);D.ptera.push({g,wl,cx:X3+rr(400),cz:Z3+rr(400),r:60+Math.random()*120,y:70+Math.random()*60,sp:(.15+Math.random()*.15)*(Math.random()<.5?1:-1),a:Math.random()*6.3})}
  console.log('Oertijd built in',Math.round(performance.now()-t0),'ms')}
D.build=build;

/* ---------- the map of the Oertijd (M): its own painted map, with the volcano, the lakes, the nests, the time machine
   and every dinosaur nearby ---------- */
let MB=null;
function dinoMapBase(){if(MB)return MB;const N=512,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),im=g.createImageData(N,N),E=RD+40;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const u=(i/N*2-1)*E,v=(j/N*2-1)*E,h=dH(X3+u,Z3+v),k=(j*N+i)*4,dv=Math.hypot(u-VOL.x,v-VOL.z),n=fbm(u*.02,v*.02,2);let r,gg,b;
    if(h<-.2){const d=Math.min(1,-h/4);r=60-20*d;gg=120-30*d;b=130-10*d}else if(h<1.4){r=200;gg=186;b=130}
    else if(dv<20){r=255;gg=110;b=30}else if(dv<VOL.r*1.2&&h>12){const a=Math.min(1,h/VOL.h);r=70+40*(1-a);gg=60+30*(1-a);b=55+20*(1-a)}
    else if(h>95){r=225;gg=228;b=232}else if(h>55){r=125;gg=118;b=105}
    else{const f=.75+.35*n,l=Math.min(1,h/40);r=(46+30*l)*f;gg=(92+40*l)*f;b=(34+16*l)*f}
    im.data[k]=r;im.data[k+1]=gg;im.data[k+2]=b;im.data[k+3]=255}
  g.putImageData(im,0,0);return MB={c,E}}
const _dbmD=drawBigMap;drawBigMap=function(){const w=$('mapw'),h2=w&&w.querySelector('h2');
  if(!inD(PL.x)){if(h2&&h2.dataset.old){h2.textContent=h2.dataset.old;delete h2.dataset.old}return _dbmD.apply(this,arguments)}
  if(h2&&!h2.dataset.old){h2.dataset.old=h2.textContent;h2.textContent='Kaart van de Oertijd'}
  try{if(!D.built&&!D.loading){D.loading=true;loadFBX().then(build)}const c=$('bigmap'),g=c.getContext('2d'),S=c.width,B=dinoMapBase(),k=S/(2*B.E),P=(x,z)=>[(x-X3+B.E)*k,(z-Z3+B.E)*k];
    g.fillStyle='#2a3a20';g.fillRect(0,0,S,S);g.drawImage(B.c,0,0,S,S);
    g.strokeStyle='rgba(30,20,10,.5)';g.lineWidth=1;for(let i=1;i<8;i++){g.beginPath();g.moveTo(i*S/8,0);g.lineTo(i*S/8,S);g.moveTo(0,i*S/8);g.lineTo(S,i*S/8);g.stroke()}
    const sym=(x,z,ico,name,col)=>{const [px,py]=P(x,z);g.fillStyle='rgba(20,14,6,.85)';g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.arc(px,py,13,0,7);g.fill();g.stroke();g.font='15px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(ico,px,py+1);
      if(name){g.textBaseline='alphabetic';g.font='bold 13px "IM Fell English",serif';g.strokeStyle='#1b140c';g.lineWidth=3;g.strokeText(name,px,py-18);g.fillStyle='#fff';g.fillText(name,px,py-18)}};
    sym(X3+VOL.x,Z3+VOL.z,'🌋','De Vuurberg','#ff7a2a');for(const [i,L] of LAKES.entries())sym(X3+L.x,Z3+L.z,'💧',i?'Het Kleine Meer':'Het Oermeer','#7ad8ff');
    if(D.tm)sym(D.tm.x,D.tm.z,'🕰️','Tijdmachine','#9ad8ff');for(const [x,z] of D.nests||[])sym(x,z,'🥚',null,'#e0b04a');
    for(const a of actors){if(a.dead||!(a.kind==='enemy')||!inD(a.x)||!DK[a.type])continue;const [px,py]=P(a.x,a.z),near=Math.hypot(a.x-PL.x,a.z-PL.z)<260||a.boss;if(!near)continue;
      g.fillStyle=a.boss?'#ff3a2a':a.aggro?'#e5913f':'#9cc552';g.beginPath();g.arc(px,py,a.boss?6:a.type==='raptor'?2.5:4.5,0,7);g.fill();if(a.boss){g.font='bold 12px sans-serif';g.textAlign='center';g.fillStyle='#ffb0a0';g.fillText('T-rex',px,py-9)}}
    const [qx,qy]=P(PL.x,PL.z);arrow(g,qx,qy,PL.yaw,10);
    g.textAlign='left';g.textBaseline='alphabetic';const rows=[['Legenda',null],['● Vleeseters (raptors, T-rex)','#e5913f'],['● Planteneters (vredig tot je ze aanvalt)','#9cc552'],['🥚 Nest met eieren',null],['🕰️ Tijdmachine terug naar Raderburg',null]];
    g.font='13px sans-serif';const bw=Math.max(...rows.map(r=>g.measureText(r[0]).width))+20,bh=rows.length*19+10;g.fillStyle='rgba(20,14,6,.88)';g.fillRect(8,S-bh-8,bw,bh);g.strokeStyle='#e0b04a';g.strokeRect(8,S-bh-8,bw,bh);
    rows.forEach(([t,col],i)=>{g.fillStyle=i?(col||'#f0e6cc'):'#ffd27a';g.fillText(t,17,S-bh-8+17+i*19)})}catch(e){console.warn('dino map',e)}};
/* ---------- travelling through time ---------- */
const flash=document.createElement('div');flash.style.cssText='position:fixed;inset:0;z-index:60;background:radial-gradient(circle,#ffffff,#8ad8ff 60%,#1a3a6a);opacity:0;pointer-events:none;transition:opacity .5s';document.body.appendChild(flash);
function timeJump(fn,label){flash.style.opacity='1';try{sfx('thunder');if(window.PW)PW.shake=Math.max(PW.shake||0,1)}catch(e){}addLog(label,'#9ad8ff');setTimeout(()=>{Promise.resolve().then(fn).catch(e=>console.warn('time',e)).finally(()=>setTimeout(()=>flash.style.opacity='0',250))},700)}
function go(x,z){if(PL.mounted)try{dismount()}catch(e){}PL.x=x;PL.z=z;PL.y=groundH(x,z)+.2;PL.vy=0}
D.travel=function(){if(PL.gold<300){addLog('De tijdmachine heeft 300 goud aan brandstof nodig.','#e5766a');return}PL.gold-=300;
  timeJump(async()=>{await loadFBX();build();go(X3+LAND.x+7,Z3+LAND.z+2);PL.fx=PL.fx||{};if(!PL.fx.seenDino){PL.fx.seenDino=1;giveXp(800);try{WD.kingdom.card('🦖 De Oertijd','Je bent miljoenen jaren terug in de tijd! Hier leven dinosaurussen: pas op voor de velociraptors en de grote T-rex bij de vulkaan. De brachiosaurussen zijn vredig. Zoek dino-eieren in de nesten. De tijdmachine brengt je terug naar Raderburg.',null,14)}catch(e){}}},'Zzzzwoeeeesh! De tijdmachine schiet terug in de tijd...')};
function back(){const R=WD.great&&WD.great.rader&&WD.great.rader.tm;timeJump(()=>{if(R)go(R.x+7,R.z+3);else go(2,30)},'De tijdmachine brengt je terug naar je eigen tijd.')}
/* after loading a game saved in the Oertijd, the valley must exist */
ANIMS.push(dt=>{if(!started)return;if(inD(PL.x)&&!D.built&&!D.loading){D.loading=true;loadFBX().then(build)}if(!D.built)return;const here=inD(camera.position.x);G.visible=here;if(!here)return;const t=PL.t;
  if(D.rings)D.rings.forEach((r,i)=>{if(i===0)r.rotation.x+=dt*.6;else if(i===1)r.rotation.y+=dt*.95;else{r.rotation.x+=dt*.9;r.rotation.z+=dt*.6}});if(D.core)D.core.scale.setScalar(1+Math.sin(t*4)*.12);
  for(const p of D.ptera){p.a+=dt*p.sp;p.g.position.set(p.cx+Math.cos(p.a)*p.r,p.y+Math.sin(t*.7+p.r)*4,p.cz+Math.sin(p.a)*p.r);p.g.rotation.y=-p.a+(p.sp>0?0:Math.PI);for(const w of p.wl)w.piv.rotation.z=w.s*Math.sin(t*5+p.r)*.35}
  if(window.PW&&PW.ps&&Math.random()<dt*12){const x=X3+VOL.x+rr(8),z=Z3+VOL.z+rr(8),y=dH(X3+VOL.x,Z3+VOL.z)+4;pwEm(PW.ps,x,y,z,rr(1.5),4+Math.random()*3,rr(1.5),5,3,10,[.35,.32,.3],[.15,.14,.14],.5,.3,1);if(Math.random()<.3)pwEm(PW.ps,x,y,z,rr(3),7+Math.random()*4,rr(3),1.6,.4,.1,[1,.6,.2],[1,.2,0],1,-9,1)}
  if(D.lava)D.lava.material.color.setHSL(.05+Math.sin(t*2)*.01,1,.5+Math.sin(t*3)*.06)});
})();
