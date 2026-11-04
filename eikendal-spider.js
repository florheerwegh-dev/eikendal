/* ================= The cave behind the waterfall: the lair of the Spider Queen =================
   The cave lies inside the mountain right behind the Zilverval. You walk through the falling water into a gap in the
   rock, with no portal and no loading: the terrain gets an arched hole behind the water, the mountain above the cave
   is raised so it covers the rock ceiling, and inside the cave the ground is the cave floor.
   Inside: a hall of webs and cocoons, a chamber of glowing egg sacs and at the back the throne of Arachnea, the Spider
   Queen, almost as strong as the four-handed giant. She spits webs that hold you, her bite poisons, she leaps at you
   and calls her brood when she is hurt. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a;
const F=WD.wf,base=terrainH(F.x,F.z);let zc=F.z-4;for(let z=F.z;z>F.z-70;z-=.5){if(terrainH(F.x,z)>base+5){zc=z;break}}
const MX=F.x,MZ=zc+.8,FY=Math.max(.4,terrainH(F.x,zc+.8)+.05),CEIL=FY+10;
const SP={caps:[],glow:[],eggs:[],shots:[],q:null,ent:{x:MX,z:MZ+6},fy:FY};WD.spider=SP;
const NODES={E:[0,-14,6.5],A:[-10,-36,15],B:[22,-52,12],Q:[0,-92,24],L:[-34,-50,7]};
const PATHS=[[[0,5.5],'E',2.6],['E','A',3.2],['A','B',3],['B','Q',3.6],['A','L',2.4],['A','Q',2.6]];
const pt=n=>typeof n==='string'?NODES[n]:n;
for(const k in NODES){const n=NODES[k];SP.caps.push({ax:MX+n[0],az:MZ+n[1],bx:MX+n[0],bz:MZ+n[1],hw:n[2],ch:true})}
for(const [a,b,w] of PATHS){const p=pt(a),q=pt(b);SP.caps.push({ax:MX+p[0],az:MZ+p[1],bx:MX+q[0],bz:MZ+q[1],hw:w,ch:false,mouth:typeof a!=='string'})}
let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const c of SP.caps){x0=Math.min(x0,c.ax-c.hw,c.bx-c.hw);x1=Math.max(x1,c.ax+c.hw,c.bx+c.hw);z0=Math.min(z0,c.az-c.hw,c.bz-c.hw);z1=Math.max(z1,c.az+c.hw,c.bz+c.hw)}
const near=(x,z,m)=>x>x0-m&&x<x1+m&&z>z0-m&&z<z1+m;
function sd(x,z,skip){let best=1e9,bc=null,bq=null;for(const c of SP.caps){if(c===skip)continue;const dx=c.bx-c.ax,dz=c.bz-c.az,l2=dx*dx+dz*dz;let t=l2?((x-c.ax)*dx+(z-c.az)*dz)/l2:0;t=t<0?0:t>1?1:t;const qx=c.ax+dx*t,qz=c.az+dz*t,d=Math.hypot(x-qx,z-qz),s=d-c.hw;if(s<best){best=s;bc=c;bq=[qx,qz,d]}}return{sd:best,c:bc,q:bq}}
SP.sd=sd;
/* the player is in the cave when below the rock ceiling, behind the face of the cliff, inside the tunnels */
const low=()=>PL.y<CEIL+2;
SP.inside=()=>!PL.inCave&&low()&&PL.z<MZ-2&&near(PL.x,PL.z,2)&&sd(PL.x,PL.z).sd<1;
/* the mountain stays above the cave ceiling everywhere (the cliff face at the mouth keeps its shape) */
const _thS=terrainH;terrainH=function(x,z){let h=_thS(x,z);if(!near(x,z,12)||z>MZ-5)return h;const d=sd(x,z).sd,req=CEIL+6;if(d<12&&h<req)h=lerp(h,req,1-smooth(5,12,d));return h};
/* inside the cave the ground is the cave floor */
/* a slope of rock leads up out of the pool into the mouth; behind the cliff face the ground is the cave floor */
const RL=5,RB=terrainH(F.x,zc+.8+RL),RAMP=z=>lerp(FY,RB,(z-MZ)/RL);
const _ghS=groundH;groundH=function(x,z){if(near(x,z,1)&&z<MZ+RL&&low()){const d=sd(x,z).sd;if(d<.6){if(z<=MZ)return FY;return Math.max(_ghS(x,z),RAMP(z))}}return _ghS(x,z)};
/* keep the player inside the rock walls */
const _upS=updatePlayer;updatePlayer=function(dt){_upS(dt);if(PL.inCave||!low()||PL.z>MZ-.2||!near(PL.x,PL.z,6))return;const r=sd(PL.x,PL.z);if(r.sd>-.8&&r.c&&r.sd<6){const v=r.q[2]||1,k=(r.c.hw-.8)/v;PL.x=r.q[0]+(PL.x-r.q[0])*k;PL.z=r.q[1]+(PL.z-r.q[1])*k}};

/* ---------- an arched gap in the cliff behind the water: the terrain is not drawn there ---------- */
const HOLE={value:new T.Vector4(MX,FY+.6,MZ-2.6,1)},HOLES={value:new T.Vector3(2.5,4.6,3.8)};
function cutTerrain(){scene.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material)||o.material.userData.holed)return;const m=o.material,ob=m.onBeforeCompile;if(!ob||!/uRock/.test(ob.toString()))return;m.userData.holed=1;
  m.onBeforeCompile=(sh,r)=>{ob(sh,r);sh.uniforms.uHole=HOLE;sh.uniforms.uHoleS=HOLES;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec4 uHole;uniform vec3 uHoleS;')
    .replace('void main() {','void main() {\n{vec3 hd=(vWPos-uHole.xyz)/uHoleS;if(hd.y>-1.2&&hd.x*hd.x+max(hd.y,0.)*max(hd.y,0.)<1.&&abs(hd.z)<1.)discard;}')};m.customProgramCacheKey=()=>'holed';m.needsUpdate=true})}

/* ---------- textures ---------- */
const ctex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.anisotropy=4;return t};
let WEB=null;const webTex=()=>WEB||(WEB=ctex(256,256,g=>{g.strokeStyle='rgba(240,240,250,.9)';g.lineWidth=1.3;const c=128;for(let i=0;i<14;i++){const a=i/14*6.283;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*126,c+Math.sin(a)*126);g.stroke()}
  for(let r=8;r<126;r+=8){g.beginPath();for(let i=0;i<=14;i++){const a=i/14*6.283,q=r+Math.sin(i*2.1+r)*2.4;i?g.lineTo(c+Math.cos(a)*q,c+Math.sin(a)*q):g.moveTo(c+Math.cos(a)*q,c+Math.sin(a)*q)}g.stroke()}}));

/* ---------- the cave ---------- */
function buildCave(){const tex=(window.AS&&AS.tex)||{};
  const rep=(t,r)=>{if(!t)return null;const c=t.clone();c.needsUpdate=true;c.wrapS=c.wrapT=T.RepeatWrapping;c.repeat.set(r,r);return c};
  /* floor and rock ceiling only over the tunnels and halls, so nothing shows outside the mountain */
  const flM=new T.MeshStandardMaterial({color:0x5a5460,map:rep(tex.rocks||tex.pathrocks,6),roughness:.95}),ceM=new T.MeshStandardMaterial({color:0x2a2630,map:rep(tex.rocks,4),roughness:1,side:T.DoubleSide});
  for(const c of SP.caps){const mk=(y,m,up,az)=>{const A=az===undefined?c.az:az;let g;if(c.ch)g=new T.CircleGeometry(c.hw+.9,28);else{const len=Math.hypot(c.bx-c.ax,c.bz-A);g=new T.PlaneGeometry(len,(c.hw+.9)*2)}const o=new T.Mesh(g,m);o.rotation.x=up?-Math.PI/2:Math.PI/2;
      if(!c.ch)o.rotateOnWorldAxis(new T.Vector3(0,1,0),-Math.atan2(c.bz-A,c.bx-c.ax));o.position.set((c.ax+c.bx)/2,y,(A+c.bz)/2);o.receiveShadow=true;scene.add(o)};
    if(c.mouth){mk(FY,flM,true,MZ+.6);mk(CEIL,ceM,false,MZ-1.6);const L=Math.hypot(RL,FY-RB),r=mapBox(c.hw*2+.4,.8,L+.6,mm(0x5a5652,{flatShading:true}),0,0,0);r.position.set(MX,(FY+RB)/2-.42,MZ+RL/2);r.rotation.x=Math.atan2(FY-RB,RL);r.receiveShadow=true;scene.add(r)}else{mk(FY,flM,true);mk(CEIL,ceM,false)}}
  /* walls: a closed rock wall with upright boulders in front of it */
  const ring=(off,step)=>{const runs=[];for(const c of SP.caps){if(c.ch){const n=Math.ceil(6.283*(c.hw+off)/step),r=[];for(let i=0;i<=n;i++){const a=i/n*6.283;r.push([c.ax+Math.cos(a)*(c.hw+off),c.az+Math.sin(a)*(c.hw+off),c])}runs.push(r)}
    else{const dx=c.bx-c.ax,dz=c.bz-c.az,len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len,n=Math.ceil(len/step);for(const sg of[-1,1]){const r=[];for(let i=0;i<=n;i++){const t=i/n;r.push([c.ax+dx*t+nx*(c.hw+off)*sg,c.az+dz*t+nz*(c.hw+off)*sg,c])}runs.push(r)}}}return runs};
  const outside=p=>p[1]>MZ-1.6;
  {const P=[],U=[],I=[];let u=0;for(const run of ring(1.15,1.2)){let prev=null;for(const p of run){const ok=sd(p[0],p[1],p[2]).sd>.5&&!outside(p);if(ok&&prev){const d=Math.hypot(p[0]-prev[0],p[1]-prev[1]);if(d<2.6){const b=P.length/3;for(const [q,uu] of[[prev,u],[p,u+d/3]]){P.push(q[0],FY-.6,q[1],q[0],CEIL+.2,q[1]);U.push(uu,0,uu,3.5)}I.push(b,b+2,b+1,b+1,b+2,b+3);u+=d/3}}prev=ok?p:null}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();const w=new T.Mesh(g,new T.MeshStandardMaterial({color:0x3e3844,map:rep(tex.rocks,1),roughness:1,side:T.DoubleSide}));w.frustumCulled=false;scene.add(w)}
  {const keep=[];for(const run of ring(1.05,1.35))for(const p of run)if(sd(p[0],p[1],p[2]).sd>.75&&!outside(p))keep.push(p);
    const inst=new T.InstancedMesh(new T.DodecahedronGeometry(1,1),new T.MeshStandardMaterial({color:0xffffff,map:rep(tex.rocks,1),roughness:.95,flatShading:true}),keep.length),M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),Sc=new T.Vector3(),col=new T.Color();
    keep.forEach((p,i)=>{const s=1+hash2(i,141)*.4;E.set((hash2(i,142)-.5)*.3,hash2(i,143)*6,(hash2(i,144)-.5)*.3);Q.setFromEuler(E);V.set(p[0],FY+3.6,p[1]);Sc.set(s,4.6+hash2(i,145)*.8,s);M.compose(V,Q,Sc);inst.setMatrixAt(i,M);const k=.32+hash2(i,146)*.18;col.setRGB(k,k*.92,k*1.08);inst.setColorAt(i,col)});inst.frustumCulled=false;scene.add(inst)}
  /* stalactites */
  {const sm=new T.MeshStandardMaterial({color:0x4a4452,roughness:.9,flatShading:true}),L=[];for(let t=0;t<4000&&L.length<160;t++){const x=x0+Math.random()*(x1-x0),z=z0+Math.random()*(z1-z0);if(z>MZ-4||sd(x,z).sd>-.6)continue;L.push([x,z])}
    const im=new T.InstancedMesh(new T.ConeGeometry(1,1,6),sm,L.length),M=new T.Matrix4(),Q=new T.Quaternion().setFromEuler(new T.Euler(Math.PI,0,0)),V=new T.Vector3(),Sc=new T.Vector3();L.forEach(([x,z],i)=>{const h=.8+Math.random()*2.4,r=.2+Math.random()*.4;V.set(x,CEIL-h/2,z);Sc.set(r,h,r);M.compose(V,Q,Sc);im.setMatrixAt(i,M)});im.frustumCulled=false;scene.add(im)}
  /* webs, cocoons hanging from the ceiling, bones on the floor */
  const wm=new T.MeshBasicMaterial({map:webTex(),transparent:true,alphaTest:.12,side:T.DoubleSide,depthWrite:false,opacity:.5});
  const W=(k,dx,dz)=>[MX+NODES[k][0]+dx,MZ+NODES[k][1]+dz];
  for(const [k,n] of[['E',4],['A',20],['B',10],['Q',28],['L',5]]){const r0=NODES[k][2];for(let i=0;i<n;i++){const a=Math.random()*6.283,r=r0*(.45+Math.random()*.5),[x,z]=W(k,Math.cos(a)*r,Math.sin(a)*r),s=2.5+Math.random()*(k==='Q'?7:4),w=new T.Mesh(new T.PlaneGeometry(s,s),wm);
    w.position.set(x,FY+3+Math.random()*6,z);w.rotation.set(rr(.5),Math.random()*6,rr(.6));scene.add(w)}}
  const silk=new T.MeshStandardMaterial({color:0xe8e4ec,roughness:.7,emissive:0x1a1820});
  for(const [k,n] of[['A',9],['Q',12],['L',3]])for(let i=0;i<n;i++){const r0=NODES[k][2],a=Math.random()*6.283,r=r0*(.3+Math.random()*.6),[x,z]=W(k,Math.cos(a)*r,Math.sin(a)*r),h=1.4+Math.random()*1.2,y=FY+3.5+Math.random()*4;
    const c=mesh(new T.SphereGeometry(.45,10,8),silk,x,y,z);c.scale.set(1,h/.9,1);scene.add(c);scene.add(mesh(new T.CylinderGeometry(.02,.02,CEIL-y-h/2,4),silk,x,(CEIL+y+h/2)/2,z,false))}
  const bone=mm(0xe8e0c8);for(const [k,n] of[['A',14],['B',8],['Q',26]])for(let i=0;i<n;i++){const r0=NODES[k][2],a=Math.random()*6.283,r=r0*Math.random()*.8,[x,z]=W(k,Math.cos(a)*r,Math.sin(a)*r);
    if(i%4===0)scene.add(mesh(new T.SphereGeometry(.22,8,6),bone,x,FY+.18,z));else{const b=mesh(new T.CylinderGeometry(.05,.05,.7+Math.random()*.5,5),bone,x,FY+.06,z);b.rotation.set(Math.PI/2,Math.random()*6,0);scene.add(b)}}
  /* glowing egg sacs and crystals: the only light in the cave */
  const egg=new T.MeshStandardMaterial({color:0x9aff7a,emissive:0x3aff4a,emissiveIntensity:.8,transparent:true,opacity:.75,roughness:.3});
  for(const [k,n] of[['B',22],['Q',10],['A',5]])for(let i=0;i<n;i++){const r0=NODES[k][2],a=Math.random()*6.283,r=r0*(.35+Math.random()*.55),[x,z]=W(k,Math.cos(a)*r,Math.sin(a)*r),s=.35+Math.random()*.45,e=mesh(new T.SphereGeometry(s,12,10),egg,x,FY+s*.9,z,false);e.scale.y=1.25;e.userData.dyn=true;scene.add(e);SP.eggs.push({e,p:Math.random()*6,s})}
  const cm=new T.MeshStandardMaterial({color:0xb46aff,emissive:0x8a3aff,emissiveIntensity:1.3,roughness:.2,transparent:true,opacity:.9});
  for(const [k,n] of[['E',2],['A',6],['B',4],['Q',10],['L',3]])for(let i=0;i<n;i++){const r0=NODES[k][2],a=Math.random()*6.283,[x,z]=W(k,Math.cos(a)*(r0-1.2),Math.sin(a)*(r0-1.2));for(let j=0;j<4;j++){const c=mesh(new T.OctahedronGeometry(.25+Math.random()*.35,0),cm,x+rr(.5),FY+.4+Math.random()*.6,z+rr(.5),false);c.scale.y=2;c.rotation.set(rr(.4),Math.random()*6,rr(.4));scene.add(c)}SP.glow.push({x,z,c:i%2?0xb46aff:0x7aff6a})}
  /* the mouth: a few old webs and blue light through the falling water */
  {const [x,z]=W('E',0,8);SP.glow.push({x,z:z-3,c:0x8ad8ff})}
  for(const s of[-1,1]){const w=new T.Mesh(new T.PlaneGeometry(2.4,2.4),wm);w.position.set(MX+s*2.4,FY+4.6,MZ-7);w.rotation.set(0,s*.4,s*.6);scene.add(w)}
  /* the queen's throne: a mound of bones and silk under a huge web */
  {const [qx,qz]=W('Q',0,-14);scene.add(mesh(new T.CylinderGeometry(5,6.5,1.2,14),silk,qx,FY+.6,qz));
    for(let i=0;i<30;i++){const a=Math.random()*6.283,r=3+Math.random()*3,b=mesh(new T.CylinderGeometry(.08,.08,1.2,5),bone,qx+Math.cos(a)*r,FY+1.2+Math.random()*.5,qz+Math.sin(a)*r);b.rotation.set(Math.random()*3,0,Math.random()*3);scene.add(b)}
    const big=new T.Mesh(new T.PlaneGeometry(24,16),wm);big.position.set(qx,FY+7,qz-6);scene.add(big);
    makeChest(qx+7,qz+2,'cave',Math.PI,'Schat van de Spinnenkoningin');SP.glow.push({x:qx,z:qz+3,c:0xc070ff},{x:qx,z:qz+12,c:0x9aff7a})}
  {const [cx,cz]=W('L',0,-3);makeChest(cx,cz,'ruins',0,'Kist van een verdwenen avonturier');scene.add(mesh(new T.SphereGeometry(.22,8,6),bone,cx+1.2,FY+.2,cz+.6))}
  HIDDEN.push({id:'spidercave',name:'Grot achter de waterval',x:MX,z:MZ-12,found:false});
  RUMORS.push({t:'Vissers zeggen dat er achter het water van de Zilverval een gat in de rots zit. Er komen geen dieren meer uit terug... alleen spinnen.',h:'falls'});
  cutTerrain()}

/* ---------- the queen and her brood ---------- */
Object.assign(MON,{spiderqueen:{n:'Spinnenkoningin Arachnea',hp:1900,dmg:40,speed:5.4,aggro:30,range:4.4,xp:1000,loot:'spiderqueen',rad:2.6,hh:3.6,boss:'arachnea',respawn:3600}});
Object.assign(ITEMS,{queen_eye:{n:'Oog van de Spinnenkoningin',g:'mat',price:650,ico:'◉',rar:'l'},
  ring_spider:{n:'Ring van de Spinnenkoningin',g:'ring',fx:{dmg:.2,spd:.12,hp:40},price:4200,ico:'◎',rar:'l'}});
LOOTX.spiderqueen=()=>({gold:1200,items:[['gem',6],['elixir',2],['queen_eye',1],['ring_spider',1]]});
function spawnQueen(x,z){const d=MON.spiderqueen;let m=null;try{if(window.EX&&EX.makeCX)m=EX.makeCX('spider',{h:3.4,tint:0xd0a0e0,eyes:0xff2a2a})}catch(e){m=null}
  if(m)m.model.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshStandardMaterial){o.material=o.material.clone();o.material.emissive=new T.Color(0x3a1050);o.material.emissiveIntensity=.6}});
  if(!m)return spawnMonster('spider',x,z,{name:d.n,hp:d.hp,hpMax:d.hp,dmg:d.dmg,boss:d.boss,loot:d.loot,xp:d.xp,rad:d.rad,hh:d.hh,range:d.range,respawn:d.respawn});
  const a=baseActor({kind:'enemy',type:'spiderqueen',name:d.n,model:m,root:m.g,x,z,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:d.loot,boss:d.boss,respawn:d.respawn});
  scene.add(a.root);placeActor(a);return a}
function populateCave(){const W=(k,dx,dz)=>[MX+NODES[k][0]+dx,MZ+NODES[k][1]+dz];
  for(const [k,n] of[['A',5],['B',4],['L',1],['Q',2]])for(let i=0;i<n;i++){const r0=NODES[k][2],a=Math.random()*6.283,[x,z]=W(k,Math.cos(a)*r0*.5,Math.sin(a)*r0*.5);spawnMonster('spider',x,z,{})}
  const [qx,qz]=W('Q',0,-12);SP.q=spawnQueen(qx,qz)}
function brood(q,n){for(let i=0;i<n;i++){const a=Math.random()*6.283;spawnMonster('spider',q.x+Math.cos(a)*4,q.z+Math.sin(a)*4,{respawn:1e9,provoked:true})}}
/* inside the cave it is dark and the camera stays close */
const _ueS=updateEnv;updateEnv=function(dt,pp){_ueS(dt,pp);if(!pp||pp!==PL||!SP.inside())return;
  sun.intensity=.04;moon.intensity=0;hemi.intensity=.6;hemi.color.setHex(0x9a80c0);if(hemi.groundColor)hemi.groundColor.setHex(0x1a1020);
  scene.fog.color.setHex(0x0c0812);scene.fog.density=.02;if(scene.background&&scene.background.setHex)scene.background.setHex(0x0c0812);
  skyMat.uniforms.top.value.setHex(0x0c0812);skyMat.uniforms.hor.value.setHex(0x0c0812);stars.material.opacity=0;for(const c of clouds)c.material.opacity=0};
const _ucS=updateCamera;updateCamera=function(dt){const d0=PL.camDist;if(SP.inside())PL.camDist=Math.min(d0,3.6);try{_ucS(dt)}finally{PL.camDist=d0}};
/* web spit, leaps, poison and the brood */
const webM=new T.MeshBasicMaterial({color:0xf4f0ff,transparent:true,opacity:.9});
ANIMS.push(dt=>{
  const q=SP.q,inside=SP.inside();
  if(inside){if(!SP.lights)SP.lights=[0,1].map(()=>{const l=new T.PointLight(0xb46aff,0,22,1.6);scene.add(l);return l});
    const g=SP.glow.map(o=>[Math.hypot(o.x-PL.x,o.z-PL.z),o]).sort((a,b)=>a[0]-b[0]);SP.lights.forEach((l,i)=>{const e=g[i];if(!e||e[0]>32){l.intensity=0;return}l.position.set(e[1].x,FY+2.6,e[1].z);l.color.setHex(e[1].c);l.intensity=1.6})
    for(const E of SP.eggs){const k=1+Math.sin(PL.t*2+E.p)*.06;E.e.scale.set(k,1.25*k,k)}}
  else if(SP.lights)for(const l of SP.lights)l.intensity=0;
  for(let i=SP.shots.length-1;i>=0;i--){const s=SP.shots[i];s.t+=dt;s.m.position.addScaledVector(s.v,dt);s.v.y-=6*dt;const p=s.m.position;
    if(Math.hypot(p.x-PL.x,p.z-PL.z)<1.1&&Math.abs(p.y-(PL.y+1))<1.4){PL.webT=3;damagePlayer(12,q||{});addLog('Je zit vast in een web!','#e8e4ff');floatText(PL.x,PL.y+2,PL.z,'Web!','#ffffff');s.t=99}
    if(s.t>2.5||p.y<FY){if(window.PW&&PW.ps)pwBurst(PW.ps,p.x,Math.max(FY+.2,p.y),p.z,10,1.6,.6,.25,.05,[1,1,1],[.8,.8,.9],.5,2,.8,1);scene.remove(s.m);SP.shots.splice(i,1)}}
  if(PL.webT>0){PL.webT-=dt;PL.slow=.4;PL.webbed=1}else if(PL.webbed){PL.webbed=0;PL.slow=1}
  if(PL.poisonT>0){PL.poisonT-=dt;PL.poisonTick=(PL.poisonTick||0)-dt;if(PL.poisonTick<=0&&!PL.dead){PL.poisonTick=1;damagePlayer(5,{});floatText(PL.x,PL.y+2.2,PL.z,'gif','#9aff5a')}}
  if(!q||q.dead||!inside)return;
  const d=Math.hypot(PL.x-q.x,PL.z-q.z);
  for(const [k,f] of[['b1',.75],['b2',.5],['b3',.25]])if(!q[k]&&q.hp<q.hpMax*f){q[k]=1;brood(q,f>.3?3:4);try{WD.roar&&WD.roar(.7)}catch(e){}addLog('Arachnea krijst. Haar jongen komen uit de webben!','#c8a0ff');if(q.model)q.model.roarT=1.4}
  if(!q.enraged&&q.hp<q.hpMax*.3){q.enraged=1;q.speed*=1.3;q.dmg*=1.2;addLog('De Spinnenkoningin wordt razend!','#ff7a9a')}
  if(q.state!=='chase')return;
  q.webCd=(q.webCd??3)-dt;if(q.webCd<=0&&d>5&&d<26){q.webCd=q.enraged?3.5:5.5;const m=new T.Mesh(new T.SphereGeometry(.35,10,8),webM),y0=q.y+2.2;m.position.set(q.x,y0,q.z);scene.add(m);
    const tt=Math.max(.5,d/18),v=new T.Vector3((PL.x-q.x)/tt,(PL.y+1-y0)/tt+3*tt,(PL.z-q.z)/tt);SP.shots.push({m,v,t:0})}
  q.leapCd=(q.leapCd??8)-dt;if(q.leapCd<=0&&d>7&&d<20&&!q.leap){q.leapCd=q.enraged?6:9;q.leap={t:0,x0:q.x,z0:q.z,x1:PL.x,z1:PL.z}}
  if(q.leap){const L=q.leap;L.t+=dt/.9;const k=Math.min(1,L.t);q.x=L.x0+(L.x1-L.x0)*k;q.z=L.z0+(L.z1-L.z0)*k;q.root.position.set(q.x,FY+Math.sin(k*Math.PI)*5,q.z);
    if(k>=1){q.leap=null;if(window.PW)PW.shake=Math.max(PW.shake||0,.4);if(window.PW&&PW.ps)pwBurst(PW.ps,q.x,FY+.3,q.z,30,5,.8,.5,.1,[.6,.55,.5],[.3,.28,.25],1,4,1,1.2);if(Math.hypot(PL.x-q.x,PL.z-q.z)<4.5){damagePlayer(26,q);addLog('Arachnea landt boven op je!','#ff7a9a')}}}});
const _dpS=damagePlayer;damagePlayer=function(d,s){const r=_dpS(d,s);if(s&&s.type==='spiderqueen'&&!PL.dead){PL.poisonT=5;addLog('Haar beet is giftig!','#9aff5a')}return r};
/* walking through the falling water */
let wetT=0;ANIMS.push(dt=>{wetT-=dt;if(wetT>0)return;if(Math.abs(PL.x-MX)<6&&Math.abs(PL.z-(MZ+1.6))<1.4&&PL.y<FY+3){wetT=1.2;try{sfx('splash')}catch(e){}if(window.PW&&PW.ps)pwBurst(PW.ps,PL.x,PL.y+1.6,PL.z,24,2.5,.7,.25,.05,[.9,.97,1],[.7,.85,.95],1,6,.9,.6)}});

const _bfS=buildFantasy;buildFantasy=function(){_bfS();try{buildCave()}catch(e){console.warn('spider cave',e)}};
const _pfS=populateFantasy;populateFantasy=function(){_pfS();try{populateCave()}catch(e){console.warn('spider queen',e)}};
})();
