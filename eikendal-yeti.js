/* ================= Het Yetihol: an ice cave under Noordheim, home of the Yeti =================
   Somewhere in Noordheim a dark tunnel leads into a rocky hill. Walk in: it gets darker and darker and goes down,
   and when it is pitch black you come out deep under the ground, in a huge ice cave (no portal, no button).
   The cave: a dome of ice and rock, hanging icicles, glowing ice crystals, frozen pillars, a frozen waterfall,
   ice wolves and frozen skeletons, and at the back the nest of bones of Yeti Ysgrauw: a huge, shaggy white beast
   with fur over his whole body (ten layers of hair that move with him) and glowing blue eyes.
   He fights as a titan (see eikendal-titans.js): very hard even at level 30. He drops the Yetivacht, the Yetiknots
   and the Hart van de Yeti. The cave lies at x -8200; the way back is the same tunnel. */
(function(){
const YC={x:-8200,z:600},CR=78,TL=40,T0=-CR-TL+6,TE=-CR+8;          /* cave centre, cave radius, tunnel length, tunnel start/end (local z) */
const inY=(x,z)=>Math.abs(x-YC.x)<320&&Math.abs(z-YC.z)<320;
const Y={built:false,g:null,ent:null,A:null,yeti:null};WD.yeti=Y;
const nz=(x,z)=>Math.sin(x*.11+Math.sin(z*.07)*2)*Math.cos(z*.13+Math.sin(x*.05)*1.7);
const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
/* the floor: the tunnel slopes down into the cave, the cave is a shallow bowl with a raised nest at the back */
function yH(x,z){const lx=x-YC.x,lz=z-YC.z;
  if(lz<TE&&Math.abs(lx)<12){const s=Math.max(0,Math.min(1,(lz-T0)/(TE-T0)));return 8.6-7*s+.15*nz(lx*3,lz*3)}
  const r=Math.hypot(lx,lz);let h=1.6-1.1*(1-Math.min(1,(r/CR)**2))+.45*nz(lx,lz)+(r>CR-10?(r-(CR-10))*.55:0);
  const dn=Math.hypot(lx,lz-48);if(dn<14)h+=1.4*(1-dn/14)**2;return h}
/* where you may walk: the cave circle and the tunnel */
function yClamp(P){const lx=P.x-YC.x,lz=P.z-YC.z,r=Math.hypot(lx,lz);if(r<CR-3)return;
  if(lz<TE+6&&lz>T0-2&&Math.abs(lx)<8){if(Math.abs(lx)>3.4)P.x=YC.x+Math.sign(lx)*3.4;if(lz<T0+.3)P.z=YC.z+T0+.3;return}
  const k=(CR-3)/r;P.x=YC.x+lx*k;P.z=YC.z+lz*k}
const _gh=groundH;groundH=function(x,z){return inY(x,z)?yH(x,z):_gh(x,z)};
const _th=terrainH;terrainH=function(x,z){return inY(x,z)?yH(x,z):_th(x,z)};
const _gc=gtClamp;gtClamp=function(P){if(inY(P.x,P.z))return yClamp(P);return _gc(P)};
const _env=updateEnv;updateEnv=function(dt,pp){_env(dt,pp);if(!pp||!inY(pp.x,pp.z))return;
  scene.fog.color.setHex(0x1a2a3a);scene.fog.density=.011;hemi.intensity=1.15;hemi.color.setHex(0x9ad8ff);if(hemi.groundColor)hemi.groundColor.setHex(0x1a2836);sun.intensity=0;moon.intensity=0};

/* ---------- monsters and treasure ---------- */
MON.yeti={n:'Yeti Ysgrauw',hp:62000,dmg:160,speed:5.4,aggro:38,range:4.6,xp:8500,loot:'yeti',rad:2.4,hh:7.5,boss:'yeti',respawn:3600};
try{DEATHV.yeti=['Verscheurd','verscheurde je met zijn ijsklauwen']}catch(e){}
Object.assign(ITEMS,{
  cloak_yeti:{n:'Yetivacht',g:'cloak',def:10,fx:{hp:60,regen:2.5},price:4200,ico:'❄',rar:'m'},
  club_yeti:{n:'Yetiknots',g:'weapon',kind:'axe',dmg:74,spd:.85,rng:3,price:5200,ico:'⛏',rar:'m'},
  amu_yeti:{n:'Hart van de Yeti',g:'amulet',def:3,fx:{dmg:.18,hp:50},price:5600,ico:'❄',rar:'m'},
  yeti_fang:{n:'Yetitand',g:'mat',price:180,ico:'▲'}});
LOOTX.yeti=()=>{const it=[['yeti_fang',3],['gem',4],[pick(['cloak_yeti','club_yeti','amu_yeti']),1]];if(!PL.fx.yetiKill){PL.fx.yetiKill=1;it.push(['cloak_yeti',1])}if(ITEMS.frost_heart&&Math.random()<.5)it.push(['frost_heart',1]);return{gold:2400,items:it}};

/* fur: copies of the body, each pushed a little further out along the skin, with ever fewer, thinner hairs */
const FUR={t:{value:0}};
function furify(root){const bodies=[];root.traverse(m=>{if(m.isSkinnedMesh&&!/axe|weapon|sword/i.test(m.name+(m.material&&m.material.name||'')))bodies.push(m);else if(m.isMesh&&/axe|weapon/i.test(m.name))m.visible=false});
  for(const m of bodies){const base=Array.isArray(m.material)?m.material[0]:m.material;if(!base)continue;
    const white=base.clone();white.skinning=true;white.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{float l=dot(diffuseColor.rgb,vec3(.3,.59,.11));diffuseColor.rgb=vec3(.82,.88,.95)*(.62+.6*l);}')};white.emissive=new T.Color(0x1c2632);m.material=white;
    m.geometry.computeBoundingBox();const H=m.geometry.boundingBox.getSize(new T.Vector3()).length(),N=10;
    for(let i=1;i<=N;i++){const f=i/N,mat=new T.MeshStandardMaterial({color:0xffffff,map:base.map||null,roughness:1,metalness:0,skinning:true,emissive:0x1e2834});
      mat.onBeforeCompile=sh=>{sh.uniforms.uF={value:f};sh.uniforms.uLen={value:H*.03};sh.uniforms.uT=FUR.t;
        sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uF,uLen,uT;')
          .replace('#include <skinning_vertex>','#include <skinning_vertex>\ntransformed+=normalize(objectNormal)*uLen*uF*(1.+.12*sin(uT*2.3+position.y*.05+position.x*.04));');
        sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uF;float fh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}')
          .replace('#include <map_fragment>','#include <map_fragment>\n{float l=dot(diffuseColor.rgb,vec3(.3,.59,.11));diffuseColor.rgb=vec3(.86,.91,.97)*(.7+.45*l)*mix(.6,1.12,uF);'+
            'vec2 g=vUv*700.;float n=fh(floor(g));if(n<uF*.92||length(fract(g)-.5)>.6-uF*.32)discard;}')};
      const s=new T.SkinnedMesh(m.geometry,mat);s.bind(m.skeleton,m.bindMatrix);s.bindMode=m.bindMode;s.frustumCulled=false;s.castShadow=false;s.receiveShadow=false;
      s.position.copy(m.position);s.quaternion.copy(m.quaternion);s.scale.copy(m.scale);m.parent.add(s)}}}
function eyes(root){let head=null;root.traverse(o=>{if(!head&&o.isBone&&/head/i.test(o.name))head=o});if(!head)return;
  for(const sx of[-1,1]){const e=new T.Sprite(new T.SpriteMaterial({map:WD.tx?WD.tx('glare.png'):null,color:0x7ad8ff,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false,depthTest:false}));
    const w=new T.Vector3();head.getWorldScale(w);const k=1/Math.max(1e-4,w.x);e.scale.setScalar(.38*k);e.position.set(sx*.09*k,.07*k,.13*k);head.add(e)}}
function spawnYeti(){const x=YC.x,z=YC.z+48;let a=null;try{a=spawnMonster('troll',x,z,{cave:true})}catch(e){}if(!a)return;
  const d=MON.yeti;Object.assign(a,{type:'yeti',name:d.n,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:'yeti',boss:'yeti',respawn:d.respawn,cave:true});
  a.spawn={x,z};a.home={x,z};a.root.scale.multiplyScalar(7.4/3.35);a.rot=Math.PI;
  try{furify(a.root)}catch(e){console.warn('yeti fur',e)}try{eyes(a.root)}catch(e){}Y.yeti=a;return a}
function spawnGuards(){const P=[[-12,-40],[14,-34],[-30,-6],[32,4],[-8,10],[22,30],[-26,32]];
  P.forEach(([lx,lz],i)=>{const x=YC.x+lx,z=YC.z+lz;let a;
    if(i%2===0){a=spawnEnemy('wolf',x,z,{cave:true});a.name='IJswolf';a.hp=a.hpMax=320;a.dmg=32;a.xp=180;a.root.traverse(m=>{if(m.isMesh&&m.material&&m.material.color){m.material=m.material.clone();m.material.color.setHex(0xe6eef6)}})}
    else{a=spawnEnemy('skeleton',x,z,{cave:true});a.name='Bevroren skelet';a.hp=a.hpMax=280;a.dmg=30;a.xp=160;a.root.traverse(m=>{if(m.isMesh&&m.material&&m.material.color){m.material=m.material.clone();m.material.color.lerp(new T.Color(0x9ad8ff),.45)}})}})}

/* ---------- the cave itself ---------- */
function buildCave(){if(Y.built)return;Y.built=true;const G=new T.Group();G.position.set(YC.x,0,YC.z);scene.add(G);Y.g=G;
  const rockM=new T.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:.05,side:T.DoubleSide});
  const iceM=new T.MeshStandardMaterial({color:0xbfe8ff,emissive:0x2a6a9a,emissiveIntensity:.5,roughness:.1,metalness:.2,transparent:true,opacity:.85});
  const glowM=new T.MeshStandardMaterial({color:0x9ae8ff,emissive:0x4ac8ff,emissiveIntensity:1.6,roughness:.1});
  /* floor */
  {const g=new T.PlaneGeometry(200,212,120,126);g.rotateX(-Math.PI/2);g.translate(0,0,-16);const p=g.attributes.position,c=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,yH(YC.x+x,YC.z+z));const n=nz(x*1.7,z*1.7)*.5+.5,snow=sm(.35,.75,n);
      const r=.22+.6*snow,gg=.27+.62*snow,b=.34+.62*snow;c[i*3]=r;c[i*3+1]=gg;c[i*3+2]=b}g.setAttribute('color',new T.BufferAttribute(c,3));g.computeVertexNormals();
    const f=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.05}));f.receiveShadow=true;G.add(f)}
  /* walls, with an opening where the tunnel comes in */
  {const g=new T.CylinderGeometry(CR+2,CR+6,44,150,16,true).toNonIndexed();g.translate(0,19,0);const p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(x,z),r=Math.hypot(x,z),k=1+(.05*nz(a*30,y*.4)+.03*nz(a*90,y*1.3));p.setX(i,x/r*r*k);p.setZ(i,z/r*r*k)}
    const keep=[],cols=[];for(let i=0;i<p.count;i+=3){let cx=0,cy=0,cz=0;for(let j=0;j<3;j++){cx+=p.getX(i+j);cy+=p.getY(i+j);cz+=p.getZ(i+j)}cx/=3;cy/=3;cz/=3;
      if(cz<0&&Math.abs(cx)<5.8&&cy<11)continue;for(let j=0;j<3;j++){const y=p.getY(i+j),x=p.getX(i+j),z=p.getZ(i+j),n=nz(x*.6+y,z*.6)*.5+.5,ice=sm(.6,.9,n)+sm(30,40,y)*.4;keep.push(x,y,z);
        cols.push(.16+.5*ice,.2+.58*ice,.27+.66*ice)}}
    const w=new T.BufferGeometry();w.setAttribute('position',new T.Float32BufferAttribute(keep,3));w.setAttribute('color',new T.Float32BufferAttribute(cols,3));w.computeVertexNormals();G.add(new T.Mesh(w,rockM))}
  /* the dome */
  {const g=new T.SphereGeometry(CR+8,80,20,0,Math.PI*2,0,Math.PI/2);g.scale(1,.42,1);g.translate(0,36,0);const p=g.attributes.position,c=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),n=nz(x*.5,z*.5);p.setY(i,p.getY(i)+n*2.2);const k=.12+.1*(n*.5+.5);c[i*3]=k;c[i*3+1]=k*1.15;c[i*3+2]=k*1.4}
    g.setAttribute('color',new T.BufferAttribute(c,3));g.computeVertexNormals();G.add(new T.Mesh(g,rockM))}
  const roofY=r=>36+.42*Math.sqrt(Math.max(0,(CR+8)**2-r*r));
  /* the tunnel down from Noordheim */
  {const path=new T.LineCurve3(new T.Vector3(0,10.6,T0-3),new T.Vector3(0,3.6,TE+4)),g=new T.TubeGeometry(path,24,4.8,18,false),p=g.attributes.position,c=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=nz(x*2+z,y*2);p.setX(i,x*(1+.08*n));p.setY(i,y+.25*n);const k=.15+.08*(n*.5+.5);c[i*3]=k;c[i*3+1]=k*1.12;c[i*3+2]=k*1.3}
    g.setAttribute('color',new T.BufferAttribute(c,3));g.computeVertexNormals();G.add(new T.Mesh(g,rockM));
    const cap=new T.Mesh(new T.CircleGeometry(5.2,16),new T.MeshBasicMaterial({color:0x000000}));cap.position.set(0,10.6,T0-3);G.add(cap)}
  /* icicles from the dome */
  {const g=new T.ConeGeometry(.6,1,7);g.translate(0,-.5,0);const im=new T.InstancedMesh(g,iceM,90),M=new T.Matrix4(),q=new T.Quaternion(),s=new T.Vector3(),v=new T.Vector3();
    for(let i=0;i<90;i++){const a=Math.random()*6.283,r=8+Math.random()*(CR-12),x=Math.sin(a)*r,z=Math.cos(a)*r,L=2+Math.random()*7;v.set(x,roofY(r)-.5,z);s.set(.6+Math.random(),L,.6+Math.random());M.compose(v,q,s);im.setMatrixAt(i,M)}G.add(im)}
  /* glowing crystals along the walls, pillars of ice and rock */
  {const cg=new T.OctahedronGeometry(1,0);for(let i=0;i<26;i++){const a=i/26*6.283+.1,r=CR-5-Math.random()*4,x=Math.sin(a)*r,z=Math.cos(a)*r;if(z<-CR+12&&Math.abs(x)<10)continue;const y=yH(YC.x+x,YC.z+z);
    for(let j=0;j<4;j++){const m=new T.Mesh(cg,glowM);m.scale.set(.35+Math.random()*.3,1.4+Math.random()*2.2,.35+Math.random()*.3);m.position.set(x+(Math.random()-.5)*2.4,y+.8,z+(Math.random()-.5)*2.4);m.rotation.set((Math.random()-.5)*.7,Math.random()*3,(Math.random()-.5)*.7);G.add(m)}
    const gl=new T.Sprite(new T.SpriteMaterial({map:WD.tx?WD.tx('glare.png'):null,color:0x4ac8ff,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false}));gl.scale.set(9,9,1);gl.position.set(x,y+2,z);G.add(gl)}}
  for(const [x,z,r] of[[-34,-22,3.2],[36,-14,2.8],[-46,22,3.6],[44,30,3],[-16,58,2.6],[18,-50,2.4]]){const h=roofY(Math.hypot(x,z))+2,g=new T.CylinderGeometry(r*.8,r*1.2,h,14,12),p=g.attributes.position,c=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i),pz=p.getZ(i),n=nz(px*3+py*.3,pz*3);const w=1+.18*n+.25*Math.sin(py*.25);p.setX(i,px*w);p.setZ(i,pz*w);const k=.2+.55*sm(.2,.8,n*.5+.5);c[i*3]=k;c[i*3+1]=k*1.1;c[i*3+2]=k*1.25}
    g.setAttribute('color',new T.BufferAttribute(c,3));g.computeVertexNormals();const m=new T.Mesh(g,rockM);m.position.set(x,h/2-2,z);G.add(m);addCircle(YC.x+x,YC.z+z,r+.4)}
  /* a frozen waterfall at the far wall, with a frozen pool */
  {const w=new T.Mesh(new T.CylinderGeometry(CR-1,CR-1,30,24,1,true,-.14,.28),new T.MeshStandardMaterial({color:0xcff0ff,emissive:0x3a8ac0,emissiveIntensity:.45,roughness:.05,metalness:.1,transparent:true,opacity:.8,side:T.DoubleSide}));w.position.set(0,13,0);w.rotation.y=Math.PI;G.add(w);
    const pool=new T.Mesh(new T.CircleGeometry(9,32),new T.MeshStandardMaterial({color:0xa8dcf0,roughness:.03,metalness:.4}));pool.rotation.x=-Math.PI/2;pool.position.set(0,yH(YC.x,YC.z+CR-12)+.06,CR-12);G.add(pool)}
  /* the nest: bones and old pelts */
  {const bm=new T.MeshStandardMaterial({color:0xe2dccb,roughness:.7}),fm=new T.MeshStandardMaterial({color:0xd8dde6,roughness:1}),y0=yH(YC.x,YC.z+48);
    for(let i=0;i<40;i++){const a=Math.random()*6.283,r=6+Math.random()*6,b=new T.Mesh(new T.CylinderGeometry(.09,.12,1.2+Math.random()*1.4,6),bm);b.position.set(Math.sin(a)*r,y0+.2,48+Math.cos(a)*r);b.rotation.set(Math.PI/2+(Math.random()-.5)*.6,Math.random()*3,0);G.add(b)}
    for(let i=0;i<8;i++){const a=Math.random()*6.283,r=Math.random()*5,s=new T.Mesh(new T.SphereGeometry(1.4,10,6),fm);s.scale.set(1.3,.22,1);s.position.set(Math.sin(a)*r,y0+.15,48+Math.cos(a)*r);s.rotation.y=Math.random()*3;G.add(s)}
    for(let i=0;i<6;i++){const a=Math.random()*6.283,r=7+Math.random()*4,s=new T.Mesh(new T.SphereGeometry(.32,10,8),bm);s.scale.set(1,.9,1.15);s.position.set(Math.sin(a)*r,y0+.3,48+Math.cos(a)*r);G.add(s)}}
  /* drifting frost in the air */
  {const n=500,g=new T.BufferGeometry(),p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*6.283,r=Math.random()*CR;p[i*3]=Math.sin(a)*r;p[i*3+1]=Math.random()*26;p[i*3+2]=Math.cos(a)*r}
    g.setAttribute('position',new T.BufferAttribute(p,3));const pts=new T.Points(g,new T.PointsMaterial({color:0xcfefff,size:.18,transparent:true,opacity:.7,depthWrite:false}));G.add(pts);Y.frost=pts}
  G.traverse(o=>{if(o.isMesh)o.receiveShadow=true});
  spawnGuards();spawnYeti()}

/* ---------- the entrance in Noordheim: a rocky hill with a tunnel into it ---------- */
const X2=-40000,Z2=0,SITESN=[[0,690],[-120,250],[430,280],[-420,-300],[-560,150],[300,-540],[-170,-540],[80,-60]];
function pickSpot(){let best=null,bs=1e9;
  for(let a=0;a<6.283;a+=.2)for(const r of[470,540,610,680]){const lx=Math.cos(a)*r,lz=Math.sin(a)*r;if(SITESN.some(([sx,sz],i)=>Math.hypot(lx-sx,lz-sz)<(i===7?220:120)))continue;
    const x=X2+lx,z=Z2+lz;let lo=1e9,hi=-1e9;for(let i=0;i<12;i++){const b=i/12*6.283;for(const rr of[0,10,22]){const h=groundH(x+Math.cos(b)*rr,z+Math.sin(b)*rr);lo=Math.min(lo,h);hi=Math.max(hi,h)}}
    const s=hi-lo;if(s<bs){bs=s;best={x,z,lx,lz}}}return best}
function buildEntrance(){const S=pickSpot();if(!S)return;const l=Math.hypot(S.lx,S.lz),ux=S.lx/l,uz=S.lz/l;
  const A={ox:S.x-ux*12,oz:S.z-uz*12,ux,uz,nx:uz,nz:-ux,th:Math.atan2(ux,uz),L:26};Y.A=A;const at=(s,w)=>[A.ox+A.ux*s+A.nx*w,A.oz+A.uz*s+A.nz*w];
  const G=new T.Group();scene.add(G);Y.ent=G;const y0=groundH(S.x,S.z);
  /* the hill: rough rock with snow on the flatter parts; the triangles in the way of the tunnel are left out */
  {const g=new T.SphereGeometry(24,72,36),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=nz(x*.35+y*.2,z*.35)*.6+nz(x*.9,z*.9+y*.5)*.3+nz(x*2.2+y,z*2.2)*.12;const k=1+.2*n;p.setXYZ(i,x*k,Math.max(-6,y*.78*k+(y>0?n*2.5:0)),z*k)}
    const idx=g.index.array,keep=[];for(let i=0;i<idx.length;i+=3){let cx=0,cy=0,cz=0;for(let j=0;j<3;j++){cx+=p.getX(idx[i+j]);cy+=p.getY(idx[i+j]);cz+=p.getZ(idx[i+j])}cx/=3;cy/=3;cz/=3;
      const s=(cx*ux+cz*uz)+12,w=cx*uz-cz*ux;if(Math.abs(w)<5&&cy<7&&s<A.L+2)continue;keep.push(idx[i],idx[i+1],idx[i+2])}
    g.setIndex(keep);g.computeVertexNormals();const nr=g.attributes.normal,c=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const ny=nr.getY(i),y=p.getY(i),v=nz(p.getX(i)*1.3,p.getZ(i)*1.3)*.5+.5,snow=sm(.5,.8,ny+v*.15)*sm(-2,3,y);const rk=.25+.12*v;
      c[i*3]=rk*1.02+(.9-rk)*snow;c[i*3+1]=rk*.98+(.93-rk)*snow;c[i*3+2]=rk*.95+(.98-rk)*snow}
    g.setAttribute('color',new T.BufferAttribute(c,3));
    const tx=TEX&&TEX.stone?TEX.stone.clone():null;if(tx){tx.needsUpdate=true;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(6,4)}
    const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,map:tx,roughness:.95,side:T.DoubleSide}));m.position.set(S.x,y0-2,S.z);m.castShadow=m.receiveShadow=true;G.add(m);
    for(let i=0;i<9;i++){const a=Math.random()*6.283;if(Math.cos(a)*-ux+Math.sin(a)*-uz>.8)continue;const r=22+Math.random()*6,bx=S.x+Math.cos(a)*r,bz=S.z+Math.sin(a)*r,bs=1+Math.random()*2.2;
      const bg=new T.DodecahedronGeometry(bs,1),bp=bg.attributes.position;for(let j=0;j<bp.count;j++){const f=1+.18*nz(bp.getX(j)*3,bp.getZ(j)*3+bp.getY(j));bp.setXYZ(j,bp.getX(j)*f,bp.getY(j)*f*.75,bp.getZ(j)*f)}bg.computeVertexNormals();
      const bm=new T.Mesh(bg,new T.MeshStandardMaterial({color:0x5c5a58,map:tx,roughness:.95}));bm.position.set(bx,groundH(bx,bz)+bs*.35,bz);bm.rotation.y=Math.random()*3;bm.castShadow=true;G.add(bm);addCircle(bx,bz,bs*.9)}}
  /* the tunnel inside, following the ground */
  {const pts=[];for(let s=-1;s<=A.L+1;s+=3){const [x,z]=at(s,0);pts.push(new T.Vector3(x,groundH(x,z)+2.6,z))}
    const g=new T.TubeGeometry(new T.CatmullRomCurve3(pts),30,4.6,18,false),p=g.attributes.position,c=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const n=nz(p.getX(i)*2,p.getZ(i)*2+p.getY(i));const k=.13+.07*(n*.5+.5);c[i*3]=k;c[i*3+1]=k*1.1;c[i*3+2]=k*1.25}g.setAttribute('color',new T.BufferAttribute(c,3));g.computeVertexNormals();
    G.add(new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.9,side:T.BackSide})));
    const [ex,ez]=at(A.L+1,0),cap=new T.Mesh(new T.CircleGeometry(5,16),new T.MeshBasicMaterial({color:0}));cap.position.set(ex,groundH(ex,ez)+2.6,ez);cap.lookAt(A.ox,cap.position.y,A.oz);G.add(cap)}
  /* icicles over the mouth, bones and a warning sign */
  {const im=new T.MeshStandardMaterial({color:0xcfefff,emissive:0x2a6a9a,emissiveIntensity:.35,roughness:.1,transparent:true,opacity:.9});for(let i=0;i<14;i++){const w=-4+i*.6,[x,z]=at(-.2,w),L=.6+Math.random()*1.6,c=new T.Mesh(new T.ConeGeometry(.12,L,6),im);c.rotation.x=Math.PI;c.position.set(x,groundH(x,z)+6.6-L/2-Math.abs(w)*.25,z);G.add(c)}
    const bm=new T.MeshStandardMaterial({color:0xe2dccb,roughness:.7});for(let i=0;i<10;i++){const [x,z]=at(-3-Math.random()*6,(Math.random()-.5)*9),b=new T.Mesh(new T.CylinderGeometry(.06,.08,.9+Math.random(),6),bm);b.position.set(x,groundH(x,z)+.08,z);b.rotation.set(Math.PI/2,Math.random()*3,0);G.add(b)}
    const [sx,sz]=at(-6,6.5),sy=groundH(sx,sz),post=new T.Mesh(new T.BoxGeometry(.18,2.2,.18),new T.MeshStandardMaterial({color:0x5a4028}));post.position.set(sx,sy+1.1,sz);G.add(post);
    const c=document.createElement('canvas');c.width=256;c.height=128;const x2=c.getContext('2d');x2.fillStyle='#6a4a2a';x2.fillRect(0,0,256,128);x2.fillStyle='#f0e0c0';x2.font='bold 30px serif';x2.textAlign='center';x2.fillText('HET YETIHOL',128,52);x2.font='22px serif';x2.fillText('Keer om, reiziger!',128,92);
    const board=new T.Mesh(new T.PlaneGeometry(1.6,.8),new T.MeshLambertMaterial({map:new T.CanvasTexture(c),side:T.DoubleSide}));board.position.set(sx,sy+1.9,sz);board.rotation.y=A.th+Math.PI;G.add(board)}
  /* you can only get into the hill through the tunnel */
  for(let a=0;a<6.283;a+=.1){const dx=Math.sin(a),dz=Math.cos(a);if(dx*-ux+dz*-uz>.93)continue;addCircle(S.x+dx*22,S.z+dz*22,2)}
  for(let s=0;s<=A.L+1;s+=1.4)for(const w of[-5.4,5.4]){const [x,z]=at(s,w);addCircle(x,z,.9)}
  addLog('Ergens in Noordheim gaapt een donkere tunnel in een heuvel: het Yetihol.','#9ad8ff')}

/* ---------- walking in and out: it gets pitch black, and on the other side of the dark you are somewhere else ---------- */
const dark=document.createElement('div');dark.style.cssText='position:fixed;inset:0;z-index:5;pointer-events:none;background:#000;opacity:0';document.body.appendChild(dark);
const B={ox:YC.x,oz:YC.z+T0,ux:0,uz:1,nx:1,nz:0,th:0};
const loc=(F,x,z)=>{const dx=x-F.ox,dz=z-F.oz;return[dx*F.ux+dz*F.uz,dx*F.nx+dz*F.nz]};
const wld=(F,s,w)=>[F.ox+F.ux*s+F.nx*w,F.oz+F.uz*s+F.nz*w];
function cross(F1,F2,s,w,inCave){const [x,z]=wld(F2,s,w),dth=F2.th-F1.th;PL.x=x;PL.z=z;PL.y=groundH(x,z);PL.vy=0;PL.rot+=dth;PL.yaw+=dth;PL.inCave=PL.x<-2000;
  try{const pet=WD.pet&&WD.pet();if(pet&&!pet.rider&&Math.hypot(pet.x-wld(F1,s,w)[0],pet.z-wld(F1,s,w)[1])<40){const [px,pz]=wld(F2,s-2.5,w*.5);pet.x=px;pet.z=pz;pet.y=groundH(px,pz);if(pet.rot!==undefined)pet.rot+=dth;if(pet.root)pet.root.position.set(px,pet.y,pz)}}catch(e){}
  try{updateCamera(0)}catch(e){}if(inCave){buildCave();if(!PL.fx.yetihol){PL.fx.yetihol=1;addLog('Je bent diep onder Noordheim, in het Yetihol. Ergens in de kou ademt iets heel groots...','#9ad8ff')}}}
ANIMS.push(dt=>{if(!started||PL.dead){dark.style.opacity=0;return}
  if(!Y.A&&WD.north&&WD.north.built)try{buildEntrance()}catch(e){console.warn('yetihol',e);Y.A={ox:0,oz:0,ux:0,uz:1,nx:1,nz:0,th:0,L:-99}}
  FUR.t.value=PL.t;if(Y.frost)Y.frost.rotation.y+=dt*.02;
  if(Y.g)Y.g.visible=inY(PL.x,PL.z);
  let k=0;const A=Y.A;
  if(A&&A.L>0&&!PL.discovered.n_yeti&&Math.hypot(PL.x-A.ox,PL.z-A.oz)<60){PL.discovered.n_yeti=true;addLog('Ontdekt: Het Yetihol','#9cc552');try{giveXp(60)}catch(e){}}
  if(A&&A.L>0&&PL.x<-30000){const [s,w]=loc(A,PL.x,PL.z);if(s>-2&&s<A.L+2&&Math.abs(w)<6){k=sm(8,22,s);
      if(s>5&&PL.mounted){const p={x:PL.x-A.ux*2,z:PL.z-A.uz*2};if(PL.mounted.x!==undefined){addLog('Je rijdier weigert de donkere tunnel in te gaan. Stijg eerst af.');try{dismount()}catch(e){}}PL.x=p.x;PL.z=p.z}
      else if(s>=23&&!PL.mounted)cross(A,B,3,Math.max(-3,Math.min(3,w)),true)}}
  else if(inY(PL.x,PL.z)){const [s,w]=loc(B,PL.x,PL.z);if(s<18&&Math.abs(w)<6){k=1-sm(3.5,16,s);if(s<1.5&&A&&A.L>0)cross(B,A,21.5,Math.max(-3,Math.min(3,w)),false)}}
  dark.style.opacity=k.toFixed(3)});
/* everything that walks in the cave stays inside it */
const _uA=updateActors;updateActors=function(dt){_uA(dt);if(!Y.built)return;for(const a of actors)if(a.cave&&!a.dead&&inY(a.x,a.z))yClamp(a)};

/* ---------- maps ---------- */
const _dm=drawMini;drawMini=function(){if(!inY(PL.x,PL.z))return _dm();const c=$('mini'),g=c.getContext('2d'),S=150,k=S/(CR*2.6),cx=S/2,cy=S/2;
  g.fillStyle='#0b1622';g.fillRect(0,0,S,S);g.save();g.translate(cx,cy);g.rotate(PL.yaw+Math.PI);
  const P=(x,z)=>[(x-PL.x)*k,(z-PL.z)*k];g.fillStyle='#3a5a74';g.beginPath();const [ox,oz]=P(YC.x,YC.z);g.arc(ox,oz,CR*k,0,6.283);g.fill();
  const [t1x,t1z]=P(YC.x-4,YC.z+T0);g.fillRect(t1x,t1z,8*k,(TE-T0)*k);
  const y=Y.yeti;if(y&&!y.dead){const [yx,yz]=P(y.x,y.z);g.fillStyle='#e5766a';g.beginPath();g.arc(yx,yz,4,0,6.283);g.fill()}
  g.restore();g.fillStyle='#ffd27a';g.beginPath();g.moveTo(cx,cy-6);g.lineTo(cx-4,cy+4);g.lineTo(cx+4,cy+4);g.fill()};
/* the yeti pays out a fortune: a mountain of gold and gems every time you beat it */
{const _kaYG=killActor;killActor=function(a,by){const was=a&&a.dead;_kaYG(a,by);if(!was&&by&&a&&a.type==='yeti'){const g=300000;PL.gold+=g;if(ITEMS.gem)giveItem('gem',10,true);if(ITEMS.pearl)giveItem('pearl',5,true);sfx('level');
  if(window.PW&&PW.ps)for(let i=0;i<80;i++)pwEm(PW.ps,a.x,(a.y||0)+2,a.z,(Math.random()-.5)*8,4+Math.random()*6,(Math.random()-.5)*8,1.6,.25,.1,[1,.85,.3],[1,.7,.1],1,-9,1);
  try{WD.kingdom.card('💰 De schat van de Yeti!','De Yeti valt neer en uit zijn hol rolt een berg goud: '+g+' goud, tien edelstenen en vijf parels!',null,10)}catch(e){addLog('+'+g+' goud van de Yeti!','#ffd27a')}}}}
})();
