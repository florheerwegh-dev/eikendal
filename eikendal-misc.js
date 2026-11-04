/* ================= Light in the dark, and blue waystones you build yourself =================
   At night and underground you carry a lantern: a warm light follows you and a small lantern hangs in your left
   hand when that hand is free. You can also build your own blue waystone, a monument that joins the network of
   waystones, but it costs a lot: stone, iron and gems, and above all the legendary spoils of the great bosses. */
(function(){
/* ---------- your own light ---------- */
const PLL=new T.PointLight(0xffb060,0,20,1.6);scene.add(PLL);
let lan=null;function lantern(){const g=new T.Group(),fr=new T.MeshStandardMaterial({color:0x2a2420,metalness:.6,roughness:.5}),gl=new T.MeshStandardMaterial({color:0xffd27a,emissive:0xffa23a,emissiveIntensity:1.4,transparent:true,opacity:.9});
  g.add(mesh(new T.BoxGeometry(.13,.17,.13),gl,0,-.14,0,false));g.add(mesh(new T.CylinderGeometry(.09,.09,.03,8),fr,0,-.04,0,false));g.add(mesh(new T.CylinderGeometry(.09,.09,.03,8),fr,0,-.24,0,false));
  g.add(mesh(new T.TorusGeometry(.05,.01,4,10),fr,0,.03,0,false));return g}
ANIMS.push(dt=>{const inDW=PL.x<-9000&&PL.x>-30000,cave=(PL.inCave&&!inDW&&PL.x>-30000)||(WD.spider&&WD.spider.inside&&WD.spider.inside());
  const k=cave?1:Math.min(1,Math.max(0,(ENV.night-.45)/.4));const t=PL.t;
  PL.light=k;PLL.intensity=k*(1.5+Math.sin(t*9)*.08+Math.sin(t*23)*.05);PLL.position.set(PL.x+Math.sin(PL.rot)*.6,PL.y+2.1,PL.z+Math.cos(PL.rot)*.6);
  if(typeof pm==='undefined'||!pm||!pm.off)return;if(!lan){lan=lantern();pm.off.add(lan)}
  if(lan.parent!==pm.off){pm.off.add(lan)}lan.visible=k>.25&&!PL.eq.shield&&!PL.mounted&&!PL.swim;lan.rotation.set(0,0,0)});

/* ---------- blue waystones you build ---------- */
const COST={stone:40,iron:15,gem:8,pearl:4,dragon_heart:1,kraken_eye:1,queen_eye:1,lava_core:1,frost_heart:1};
BUILDS.waystone={n:'Blauwe reissteen',cost:COST,fp:[2.6,2.6],d:'Een eigen reissteen voor het reisnetwerk. Vraagt de legendarische buit van de grote bazen.'};
const runeM=new T.MeshBasicMaterial({color:0x74c0ff}),crystM=new T.MeshStandardMaterial({color:0x8ad8ff,emissive:0x2a8aff,emissiveIntensity:1.2,roughness:.15,transparent:true,opacity:.92});
const OWN=[];
const _bsM=buildStruct;buildStruct=function(rec){if(rec.t!=='waystone')return _bsM(rec);
  const{x,z}=rec,y=groundH(x,z),g=new T.Group();g.position.set(x,y,z);scene.add(g);const S={rec,g,cols:[],inter:[]};rec.d=rec.d||{};
  const st=MAT.stone;g.add(mesh(new T.CylinderGeometry(2,2.3,.5,8),st,0,.25,0));g.add(mesh(new T.CylinderGeometry(1.5,1.7,.4,8),st,0,.7,0));
  const ob=mesh(new T.CylinderGeometry(.32,.62,4.6,4),st,0,3.2,0);ob.rotation.y=Math.PI/4;g.add(ob);
  for(let i=0;i<4;i++){const a=i*Math.PI/2,r=mesh(new T.BoxGeometry(.18,3,.04),runeM,Math.sin(a)*.47,3,Math.cos(a)*.47,false);r.rotation.y=a;g.add(r)}
  const cr=mesh(new T.OctahedronGeometry(.55,0),crystM,0,6.2,0,false);cr.scale.y=1.6;cr.userData.dyn=true;g.add(cr);
  const dc=new T.Mesh(new T.CircleGeometry(2.6,40),new T.MeshBasicMaterial({map:WD.tx('rune_magic.png'),color:0x74c0ff,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false}));dc.rotation.x=-Math.PI/2;dc.position.y=.52;dc.userData.dyn=true;g.add(dc);
  const bm=new T.Sprite(new T.SpriteMaterial({map:WD.tx('rise_blue.png'),color:0x8ad0ff,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false}));bm.scale.set(3.4,9,1);bm.position.y=4.6;g.add(bm);
  lamp(x,y+6.2,z,true);S.cols.push(addCircle(x,z,1.9));
  if(!rec.d.id){rec.d.id='own'+Date.now().toString(36);rec.d.name='Jouw reissteen '+(OWN.length+1)}
  let w=WAYS.find(q=>q.id===rec.d.id);if(!w){w={id:rec.d.id,name:rec.d.name,x,z,on:true};WAYS.push(w)}w.on=true;if(!PL.ways.includes(w.id))PL.ways.push(w.id);
  const e={x,z,r:3.4,txt:'Jouw reissteen: kies bestemming',fn:()=>{if(WAYS.filter(q=>q.on).length<2)addLog('Activeer eerst een tweede reissteen.');else waystoneMenu(w)},owner:S};INTER.push(e);S.inter.push(e);
  OWN.push({cr,dc,S});STRUCTS.push(S);
  if(started&&!rec.d.done){rec.d.done=1;addLog('Je blauwe reissteen staat! Hij hoort nu bij het reisnetwerk.','#74c0ff');sfx('level');giveXp(200);if(window.PW&&PW.ps)pwBurst(PW.ps,x,y+3,z,80,5,1.4,.5,.08,[.6,.85,1],[.3,.6,1],3,0,1,1)}
  return S};
/* a built waystone cannot be broken down again by accident */
const _rsM=removeStruct;removeStruct=function(S){if(S&&S.rec&&S.rec.t==='waystone')return false;return _rsM(S)};
ANIMS.push(dt=>{for(const o of OWN){o.cr.rotation.y+=dt*.8;o.cr.position.y=6.2+Math.sin(PL.t*1.4)*.15;o.dc.rotation.z+=dt*.3}});
})();
/* ---------- superpowers a little less overpowered: less damage, longer cooldowns, a bit more energy ---------- */
(function(){const _pdN=pwDmg;pwDmg=function(a,dmg,fx,fz,kb){return _pdN(a,dmg*.62,fx,fz,kb)};
  for(const k in PWR)for(const ab of PWR[k].ab||[]){if(typeof ab.cd==='number')ab.cd=+(ab.cd*1.3).toFixed(2);if(typeof ab.cost==='number')ab.cost=Math.round(ab.cost*1.15)}})();
/* ---------- foliage cards (far trees, wheat) are lit the same on both sides, so they never turn black from behind ---------- */
(function(){function frontLit(m){if(!m||!m.isMeshLambertMaterial||m.side!==T.DoubleSide||m.userData.frontLit)return;m.userData.frontLit=1;const ob=m.onBeforeCompile;
    m.onBeforeCompile=function(sh,r){if(ob)ob.call(this,sh,r);sh.fragmentShader=sh.fragmentShader.replace(/\(\s*gl_FrontFacing\s*\)\s*\?\s*vLightFront\s*:\s*vLightBack/g,'vLightFront').replace(/\(\s*gl_FrontFacing\s*\)\s*\?\s*vIndirectFront\s*:\s*vIndirectBack/g,'vIndirectFront')};
    const k=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):null;m.customProgramCacheKey=()=>(k?k():'')+'|frontlit';m.needsUpdate=true}
  const _pfL=populateFantasy;populateFantasy=function(){_pfL();scene.traverse(o=>{if(o.isMesh&&o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(frontLit)})}})();

/* ---------- no flickering where surfaces overlap ----------
   1) The camera's near plane moves out with the camera boom, so the depth buffer stays sharp far away and house
      corners, roofs and windows no longer flicker in the distance. Close to a wall or in first person it stays small.
   2) Flat pieces lying on the ground (squares, snow and scorch patches, rune circles, rugs) are drawn just in front
      of the ground below them instead of fighting with it. */
(function(){
const _ucZ=updateCamera;updateCamera=function(dt){_ucZ(dt);let n=.15;
  if(!PL.fp){const d=Math.hypot(camera.position.x-PL.x,camera.position.y-PL.y-1.5,camera.position.z-PL.z);n=Math.min(.5,Math.max(.15,d*.1))}
  if(Math.abs(camera.near-n)>.01){camera.near=n;camera.updateProjectionMatrix()}};
const FLAT=/^(Plane|Circle|Ring)(Buffer)?Geometry$/,nv=new T.Vector3(),wq=new T.Quaternion(),ws=new T.Vector3();
function flatOverlays(root){root.updateMatrixWorld(true);const users=new Map(),list=[];
  root.traverse(o=>{if(!o.isMesh||!o.material)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats)users.set(m,(users.get(m)||0)+1);
    const g=o.geometry;if(!g||!FLAT.test(g.type)||!g.attributes.normal||o.userData.flatDone)return;if(!g.boundingSphere)g.computeBoundingSphere();
    if(g.boundingSphere.radius*o.getWorldScale(ws).x>40)return;   /* the terrain, the sea and lakes stay as they are */
    const na=g.attributes.normal;nv.set(na.getX(0),na.getY(0),na.getZ(0)).applyQuaternion(o.getWorldQuaternion(wq));if(Math.abs(nv.y)<.9)return;list.push(o)});
  const own=new Map(),onFlat=new Map();for(const o of list)for(const m of(Array.isArray(o.material)?o.material:[o.material]))onFlat.set(m,(onFlat.get(m)||0)+1);
  const fix=m=>{if(!m||m.polygonOffset)return m;let c=m;if((users.get(m)||0)>(onFlat.get(m)||0)){c=own.get(m);if(!c){c=m.clone();if(m.onBeforeCompile)c.onBeforeCompile=m.onBeforeCompile;if(m.customProgramCacheKey)c.customProgramCacheKey=m.customProgramCacheKey;own.set(m,c)}}
    c.polygonOffset=true;c.polygonOffsetFactor=-1;c.polygonOffsetUnits=-4;c.needsUpdate=true;return c};
  for(const o of list){o.userData.flatDone=1;o.material=Array.isArray(o.material)?o.material.map(fix):fix(o.material)}
  return list.length}
WD.flatOverlays=flatOverlays;
let ovDone=false;ANIMS.push(()=>{if(ovDone||typeof worldReady==='undefined'||!worldReady||!started)return;ovDone=true;try{flatOverlays(scene)}catch(e){console.warn('overlays',e)}});
})();

/* ---------- green bushes ----------
   The common bush of the nature pack uses the leaves of the twisted tree, which are autumn red. It gets the green
   leaves of the normal tree instead (same kind of leaf cards). */
(function(){
const _bflG=buildFlora;buildFlora=function(){try{if(AS.ok&&AS.lib.Bush_Common){let green=null;const src=AS.lib.Bush_Common_Flowers||AS.lib.CommonTree_1;
  if(src)src.traverse(o=>{if(!o.isMesh||green)return;for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(/^Leaves/.test(m.name||'')&&!/Twisted/.test(m.name))green=m});
  if(green)AS.lib.Bush_Common.traverse(o=>{if(!o.isMesh)return;if(Array.isArray(o.material))o.material=o.material.map(x=>/Twisted/.test(x.name||'')?green:x);else if(/Twisted/.test(o.material.name||''))o.material=green})}}catch(e){console.warn('bushes',e)}
  return _bflG.apply(this,arguments)};
})();

/* ---------- no hair poking through hoods and helmets ----------
   Under a hood or helmet the 3D hair stuck out and flickered through it while moving. With head gear on, the hair
   above the face is hidden; eyebrows and beards stay. */
(function(){
function hideHair(h,o){if(!h||!h.g||!o||!/^(hood|helm|horned|dragonhelm)$/.test(o.hat||''))return;h.g.updateMatrixWorld(true);let face=null;const hair=[];
  h.g.traverse(m=>{if(!m.isMesh)return;const mt=Array.isArray(m.material)?m.material[0]:m.material,im=mt&&mt.map&&mt.map.image,src=(im&&(im.currentSrc||im.src))||'';
    if(/faces\/skin/.test(src))face=new T.Box3().setFromObject(m);else if(/\/hair\//.test(src))hair.push([m,new T.Box3().setFromObject(m)])});
  if(!face||!hair.length)return;const fc=(face.min.y+face.max.y)/2,fh=face.max.y-face.min.y;
  for(const [m,b] of hair)if((b.min.y+b.max.y)/2>fc&&b.max.y-b.min.y>fh*.25)m.visible=false}
/* the coarse sun shadow crawled over moving bodies like moving skin: characters still cast shadows but do not receive them */
const _mhH=makeHuman;makeHuman=function(o){const h=_mhH.apply(this,arguments);try{hideHair(h,o)}catch(e){}try{if(h&&h.g)h.g.traverse(m=>{if(m.isMesh)m.receiveShadow=false})}catch(e){}return h};
})();

/* ---------- the stone paths count as small roads: a gravel bed under the flagstones and no grass on them ---------- */
(function(){const P=window.STONE_PATHS||[];if(!P.length||typeof roadDist!=='function')return;
  const seg=(x,z,[x0,z0,x1,z1])=>{const dx=x1-x0,dz=z1-z0,t=Math.max(0,Math.min(1,((x-x0)*dx+(z-z0)*dz)/(dx*dx+dz*dz))),qx=x0+dx*t,qz=z0+dz*t;return Math.hypot(x-qx,z-qz)};
  const _rdS=roadDist;roadDist=function(x,z){let d=_rdS(x,z);if(x>-400&&x<60&&z>-120&&z<60)for(const s of P){const e=Math.max(0,seg(x,z,s)-.6);if(e<d)d=e}return d}})();

/* ---------- living stones: golems made of real rock ----------
   Every block of the old golem is replaced by a real rock of the nature pack at the same place and size (the moving
   limbs stay the same, so the golem still walks and strikes). The lava golem gets dark, glowing rock. The eyes glow. */
(function(){
const MATS=new Map(),V3=new T.Vector3();
const _mgR=makeGolem;makeGolem=function(c1,c2,eyeC){const G=_mgR(c1,c2,eyeC);try{
  if(!AS.ok)return G;const R=[1,2,3].map(i=>AS.lib['Rock_Medium_'+i]).filter(Boolean);if(!R.length)return G;
  const lava=c1!==undefined&&c1!==0x7a766c,key=lava?'lava':'stone';
  const mat=src=>{const k=key+src.uuid;if(!MATS.has(k)){const m=src.clone();if(lava){m.color=new T.Color(0x6a4a40);m.emissive=new T.Color(0xff4a10);m.emissiveMap=m.map;m.emissiveIntensity=.45}else m.color=new T.Color(0xd8d4cc);MATS.set(k,m)}return MATS.get(k)};
  const parts=[];G.rig.traverse(m=>{if(m.isMesh&&!G.eyes.includes(m))parts.push(m)});let i=0;
  for(const m of parts){m.geometry.computeBoundingBox();const s=m.geometry.boundingBox.getSize(V3).multiply(m.scale);m.visible=false;
    const src=R[i++%R.length],sb=new T.Box3().setFromObject(src),ss=sb.getSize(new T.Vector3()),sc=sb.getCenter(new T.Vector3());
    const holder=new T.Group();holder.position.copy(m.position);holder.rotation.set(rr0(.3),Math.random()*6.28,rr0(.3));holder.scale.set(s.x/ss.x*1.2,s.y/ss.y*1.2,s.z/ss.z*1.2);
    const rk=src.clone();rk.position.sub(sc);rk.traverse(o=>{if(o.isMesh){o.material=mat(o.material);o.castShadow=true;o.receiveShadow=true}});holder.add(rk);m.parent.add(holder)}
  for(const e of G.eyes){const gl=new T.Sprite(new T.SpriteMaterial({map:WD.tx('glare.png'),color:eyeC||0x6affd8,transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false}));gl.scale.set(.7,.7,1);e.add(gl);e.scale.set(1.2,1.4,2)}
  }catch(e){console.warn('rock golem',e)}return G};
const rr0=a=>(Math.random()*2-1)*a;
})();
