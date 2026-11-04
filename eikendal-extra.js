/* Eikendal: extra creatures, real faces, fish and birds.
   Dire Wolf Lite and Giant Spider Lite (Literock Studios), Bestiary Puglin and Imp, Universal Base Characters heads and hair
   (Quaternius, CC0), the 3D Fish Pack (polyy.ai, CC0), two orc packs, a terror bird and a PSX bird.
   Everything falls back to the older models when a file is missing. */
(function(){
'use strict';
const EX={tex:{},cx:{},bx:{},fish:null,faces:null,bird:null};window.EX=EX;
const TL=new T.TextureLoader();
function tex(u,o={}){return new Promise(r=>TL.load(u,t=>{t.anisotropy=4;t.encoding=T.LinearEncoding;if(o.flip===false)t.flipY=false;if(o.rep)t.wrapS=t.wrapT=T.RepeatWrapping;r(t)},undefined,()=>r(null)))}
async function glb(u){const buf=await asFetchBin(u);return await new Promise((res,rej)=>new T.GLTFLoader().parse(buf,'',res,rej))}
function hdr(buf){const dv=new DataView(buf),hl=dv.getUint32(0,true);return{h:JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl))),base:4+hl}}
const dm=()=>new T.Object3D();
function boneMap(root){const b={};root.traverse(o=>{if(o.isBone&&!b[o.name])b[o.name]=o});return b}
/* bounding box of a skinned model in its bind pose */
function bindBox(root){root.updateMatrixWorld(true);const bb=new T.Box3(),b2=new T.Box3();root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();b2.copy(g.boundingBox).applyMatrix4(o.matrixWorld);bb.union(b2)});return bb}

/* ================= real faces: Universal Base Characters heads, eyes, brows and hair ================= */
const FACE={ok:false,parts:{},mat:{},eye:{}};
async function loadFaces(){
  try{const buf=await asFetchBin('assets/faces/faces.bin'),{h,base}=hdr(buf);
    for(const k in h){const e=h[k],g=new T.BufferGeometry();
      g.setAttribute('position',new T.BufferAttribute(new Float32Array(buf.slice(base+e.po,base+e.po+e.v*12)),3));
      const N=new Int8Array(buf,base+e.no,e.v*4),nor=new Float32Array(e.v*3);for(let i=0;i<e.v;i++)for(let j=0;j<3;j++)nor[i*3+j]=N[i*4+j]/127;g.setAttribute('normal',new T.BufferAttribute(nor,3));
      g.setAttribute('uv',new T.BufferAttribute(new Float32Array(buf.slice(base+e.uo,base+e.uo+e.v*8)),2));
      g.setAttribute('skinIndex',new T.BufferAttribute(new Uint16Array(new Uint8Array(buf,base+e.si,e.v*4)),4));
      const W=new Uint8Array(buf,base+e.sw,e.v*4),wf=new Float32Array(e.v*4);for(let i=0;i<e.v*4;i++)wf[i]=W[i]/255;g.setAttribute('skinWeight',new T.BufferAttribute(wf,4));
      if(e.io>=0)g.setIndex(new T.BufferAttribute(new Uint16Array(buf.slice(base+e.io,base+e.io+e.i*2)),1));
      g.computeBoundingSphere();FACE.parts[k]={g,bones:e.bones,inv:e.inv.map(a=>new T.Matrix4().fromArray(a))}}
    const L=n=>tex('assets/faces/'+n,{flip:false});
    const [sM,sMd,sF,sFd,nM,nF,eye,hc,hn,h2c,h2n]=await Promise.all([L('skinM.jpg'),L('skinMd.jpg'),L('skinF.jpg'),L('skinFd.jpg'),L('normM.jpg'),L('normF.jpg'),L('eye.jpg'),tex('assets/hair/hair_color.jpg',{flip:false}),tex('assets/hair/hair_normal.jpg',{flip:false}),tex('assets/hair/hair2_color.jpg',{flip:false}),tex('assets/hair/hair2_normal.jpg',{flip:false})]);
    Object.assign(FACE,{sM,sMd,sF,sFd,nM,nF,eyeT:eye,hc,hn,h2c,h2n});FACE.ok=!!(sM&&FACE.parts.headM);
    if(FACE.ok){FACE.avgM=avgCol(sM.image);FACE.avgF=avgCol(sF.image);FACE.avgMd=avgCol(sMd.image);FACE.avgFd=avgCol(sFd.image)}}
  catch(e){console.warn('faces',e)}}
/* average skin colour of the cheek area, used to tint the texture toward the chosen skin tone */
function avgCol(img){if(!img)return new T.Color(.8,.6,.5);const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.drawImage(img,0,0,64,64);const d=g.getImageData(8,8,24,24).data;let r=0,gg=0,b=0,n=0;
  for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2];n++}return new T.Color(r/n/255,gg/n/255,b/n/255)}
function skinMat(fem,skin){const k=(fem?'f':'m')+skin;if(FACE.mat[k])return FACE.mat[k];
  const c=new T.Color(skin),lum=c.r*.3+c.g*.59+c.b*.11,dark=lum<.42,avg=fem?(dark?FACE.avgFd:FACE.avgF):(dark?FACE.avgMd:FACE.avgM),map=fem?(dark?FACE.sFd:FACE.sF):(dark?FACE.sMd:FACE.sM);
  const t=new T.Color(Math.min(1.35,c.r/Math.max(.05,avg.r)),Math.min(1.35,c.g/Math.max(.05,avg.g)),Math.min(1.35,c.b/Math.max(.05,avg.b)));
  return FACE.mat[k]=new T.MeshStandardMaterial({map,color:t,normalMap:fem?FACE.nF:FACE.nM,normalScale:new T.Vector2(.7,.7),roughness:.62,metalness:0,skinning:true})}
/* eye colour: recolour the iris of the brown eye texture */
function eyeMat(col){const k=col|0;if(FACE.eye[k])return FACE.eye[k];let map=FACE.eyeT;
  if(map&&map.image&&k!==0x3a2a1a){const img=map.image,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,c.width,c.height),p=d.data,tc=new T.Color(k),hsl={};tc.getHSL(hsl);
    for(let i=0;i<p.length;i+=4){const r=p[i]/255,gg=p[i+1]/255,b=p[i+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);if(mx-mn<.12||mx>.92)continue;const L=(mx+mn)/2,o=new T.Color().setHSL(hsl.h,Math.min(1,hsl.s*1.2+.2),Math.min(.85,L*1.15+.05));p[i]=o.r*255;p[i+1]=o.g*255;p[i+2]=o.b*255}
    g.putImageData(d,0,0);map=new T.CanvasTexture(c);map.flipY=false}
  return FACE.eye[k]=new T.MeshStandardMaterial({map,roughness:.15,metalness:0,skinning:true})}
const hairMats={};
function hairMat(col,v,skin){const k=v+'_'+(col|0);if(hairMats[k])return hairMats[k];
  return hairMats[k]=new T.MeshStandardMaterial({color:new T.Color(col|0).multiplyScalar(1.55),map:v===2?FACE.h2c:FACE.hc,normalMap:v===2?FACE.h2n:FACE.hn,normalScale:new T.Vector2(.6,.6),roughness:.72,metalness:0,side:T.DoubleSide,skinning:true})}
const HAIR_UBC={parted:'SimpleParted',short:'SimpleParted',curly:'SimpleParted',buns:'Buns',bun:'Buns',ponytail:'Buns',long3d:'Long',long:'Long',braid:'Long',buzzed:'Buzzed'};
function faceMesh(h,part,mat){const P=FACE.parts[part];if(!P)return null;const B=h.model.userData.bones;let ref=null;h.model.traverse(o=>{if(o.isSkinnedMesh&&!ref)ref=o});if(!ref)return null;
  const bones=P.bones.map(n=>B[n]);if(bones.some(b=>!b))return null;
  const m=new T.SkinnedMesh(P.g,mat);m.frustumCulled=false;m.castShadow=true;ref.parent.add(m);m.bind(new T.Skeleton(bones,P.inv),ref.bindMatrix);return m}
/* ================= hats made for the real head (all sizes in metres, in the space of the head anchor) ================= */
const HAT_TYPES=new Set(['cap','helm','horned','dragonhelm','wizard','crown','straw','scarf','elven']);
const HG={},HM={};
const hg=(k,f)=>HG[k]||(HG[k]=f());
function hm(k,f){return HM[k]||(HM[k]=f())}
const cloth=c=>hm('c'+c,()=>new T.MeshStandardMaterial({color:c,roughness:.92,metalness:0,side:T.DoubleSide}));
const metal=c=>hm('m'+c,()=>new T.MeshStandardMaterial({color:c,roughness:.38,metalness:.5}));
const gold=()=>hm('gold',()=>new T.MeshStandardMaterial({color:0xe0b04a,roughness:.28,metalness:.6,emissive:0x4a3410,emissiveIntensity:.7,side:T.DoubleSide}));
const bone=()=>hm('bone',()=>new T.MeshStandardMaterial({color:0xe8dcc0,roughness:.55,metalness:0}));
const glowM=c=>hm('g'+c,()=>new T.MeshBasicMaterial({color:c}));
function strawTex(){return hm('strawT',()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#d8b868';g.fillRect(0,0,128,128);for(let y=0;y<128;y+=4){g.fillStyle=y%8?'rgba(120,80,20,.25)':'rgba(255,240,180,.25)';g.fillRect(0,y,128,2)}for(let x=0;x<128;x+=8){g.fillStyle='rgba(100,70,20,.18)';g.fillRect(x,0,1,128)}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(6,2);return t})}
const lathe=(pts,seg=28)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg);
/* a tapering tube along a curve, for horns */
function horn(pts,r0,r1,N=14){const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),fr=curve.computeFrenetFrames(N,false),pos=[],idx=[],S=8;
  for(let i=0;i<=N;i++){const P=curve.getPointAt(i/N),n=fr.normals[i],b=fr.binormals[i],r=r0+(r1-r0)*Math.pow(i/N,1.3);for(let j=0;j<S;j++){const a=j/S*6.283;pos.push(P.x+(Math.cos(a)*n.x+Math.sin(a)*b.x)*r,P.y+(Math.cos(a)*n.y+Math.sin(a)*b.y)*r,P.z+(Math.cos(a)*n.z+Math.sin(a)*b.z)*r)}}
  for(let i=0;i<N;i++)for(let j=0;j<S;j++){const a=i*S+j,b2=i*S+(j+1)%S,c=a+S,d=b2+S;idx.push(a,c,b2,b2,c,d)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
function part(g,m,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.castShadow=false;o.receiveShadow=false;return o}
window.buildHat=(...a)=>buildHat(...a);
function buildHat(type,col,fem,hair){const G=new T.Group(),r0=.104+(hair?.012:.004),add=o=>{G.add(o);return o};G.position.z=-.006;
  if(type==='cap'){const c=col||0x6a3a2a,cap=new T.Group();cap.position.y=.19;cap.rotation.set(-.2,0,.09);cap.scale.z=1.06;G.add(cap);
    cap.add(part(hg('cap'+r0,()=>lathe([[r0+.004,0],[r0+.022,.03],[r0+.028,.06],[r0+.012,.094],[.07,.118],[.03,.128],[0,.13]])),cloth(c)));
    cap.add(part(hg('capb'+r0,()=>new T.TorusGeometry(r0+.006,.012,8,32)),cloth(new T.Color(c).multiplyScalar(.6).getHex()),0,.006,0,Math.PI/2));
    const fs=hg('feather',()=>{const s=new T.Shape();s.moveTo(0,0);s.quadraticCurveTo(.035,.09,0,.2);s.quadraticCurveTo(-.03,.09,0,0);return new T.ShapeGeometry(s,8)});
    cap.add(part(fs,cloth(0xf2ece0),r0+.01,.05,-.03,-.5,Math.PI/2,-.5))}
  else if(type==='helm'||type==='horned'||type==='dragonhelm'){const dr=type==='dragonhelm',c=dr?0x7a1a12:0xa8b0ba,m=metal(c),hel=new T.Group();hel.position.y=.178;hel.scale.y=.92;G.add(hel);
    hel.add(part(hg('dome'+r0,()=>new T.SphereGeometry(r0+.022,28,14,0,6.283,0,Math.PI*.52)),m,0,0,0,0,0,0,1,1.08,1.07));
    hel.add(part(hg('rim'+r0,()=>new T.TorusGeometry(r0+.025,.01,8,36)),m,0,.006,0,Math.PI/2,0,0,1,1.07,1));
    hel.add(part(hg('ridge'+r0,()=>new T.TorusGeometry(r0+.023,.007,6,28,Math.PI)),m,0,.004,0,0,Math.PI/2,0,1,1.08,1.07));
    if(!dr)hel.add(part(hg('nasal',()=>new T.BoxGeometry(.02,.09,.012)),m,0,-.035,(r0+.025)*1.07+.003));
    for(let i=0;i<10;i++){const a=i/10*6.283;hel.add(part(hg('rivet',()=>new T.SphereGeometry(.006,6,4)),metal(0xd8d0b0),Math.sin(a)*(r0+.031),.006,Math.cos(a)*(r0+.031)*1.07))}
    if(type==='horned')for(const s of[-1,1])hel.add(part(hg('hornH'+s,()=>horn([[s*.1,.05,0],[s*.16,.08,.01],[s*.21,.15,.035],[s*.21,.24,.07]],.026,.003)),bone()));
    if(dr){for(let i=0;i<5;i++){const a=-.9+i*.45,y=Math.cos(a)*(r0+.03)*1.08,z=Math.sin(a)*(r0+.03)*1.07;hel.add(part(hg('spk',()=>new T.ConeGeometry(.014,.07,6)),metal(0x2a1210),0,y+.02,z,a,0,0,1,1.2-Math.abs(i-2)*.15,1))}
      for(const s of[-1,1]){hel.add(part(hg('hornD'+s,()=>horn([[s*.085,.08,-.03],[s*.14,.12,-.11],[s*.15,.15,-.21],[s*.12,.2,-.29]],.022,.002)),metal(0x2a1210)));
        hel.add(part(hg('cheek',()=>new T.BoxGeometry(.016,.075,.07)),m,s*(r0+.02),-.045,.035,0,0,s*.12))}
      hel.add(part(hg('dgem',()=>new T.OctahedronGeometry(.016,0)),glowM(0xffb020),0,.03,(r0+.03)*1.07))}}
  else if(type==='wizard'){const c=col||0x3a2a7a,w=new T.Group();w.position.y=.218;w.scale.z=1.04;G.add(w);
    w.add(part(hg('brim'+r0,()=>lathe([[r0+.01,.002],[.2,-.008],[.29,-.03],[.3,-.04],[.29,-.044],[.2,-.016],[r0+.01,-.004]],36)),cloth(c)));
    w.add(part(hg('wcone'+r0,()=>{const g=new T.CylinderGeometry(.004,r0+.024,.56,24,14,true),p=g.attributes.position;for(let i=0;i<p.count;i++){const t=Math.min(1,Math.max(0,(p.getY(i)+.28)/.56));p.setZ(i,p.getZ(i)-.24*Math.pow(t,2.4));p.setX(i,p.getX(i)+.05*Math.pow(t,2))}g.computeVertexNormals();return g}),cloth(c),0,.28,0));
    w.add(part(hg('wband'+r0,()=>new T.TorusGeometry(r0+.02,.011,8,32)),gold(),0,.025,0,Math.PI/2));
    for(const [x,y,z] of[[.06,.12,.06],[-.05,.22,.02],[.02,.32,-.06]])w.add(part(hg('star',()=>new T.OctahedronGeometry(.016,0)),gold(),x,y,z))}
  else if(type==='crown'){const cr=new T.Group();cr.position.y=.198;G.add(cr);cr.scale.z=1.06;
    cr.add(part(hg('cband'+r0,()=>new T.CylinderGeometry(r0+.014,r0+.01,.048,32,1,true)),gold(),0,.024,0));
    for(let i=0;i<8;i++){const a=i/8*6.283;cr.add(part(hg('cspk',()=>new T.ConeGeometry(.015,.05,5)),gold(),Math.sin(a)*(r0+.012),.072,Math.cos(a)*(r0+.012)));cr.add(part(hg('cball',()=>new T.SphereGeometry(.008,6,5)),gold(),Math.sin(a)*(r0+.012),.1,Math.cos(a)*(r0+.012)))}
    [[0,0xd02a2a],[1.1,0x2a6ad0],[-1.1,0x2ad06a],[Math.PI,0xd02a2a]].forEach(([a,cc])=>cr.add(part(hg('cgem',()=>new T.OctahedronGeometry(.014,0)),hm('gem'+cc,()=>new T.MeshStandardMaterial({color:cc,emissive:cc,emissiveIntensity:.5,roughness:.1,metalness:.2})),Math.sin(a)*(r0+.016),.024,Math.cos(a)*(r0+.016),0,0,0,1,1.3,.6)))}
  else if(type==='straw'){const c=col||0xd9b866,sm=hm('straw'+c,()=>new T.MeshStandardMaterial({color:c,map:strawTex(),roughness:.95,side:T.DoubleSide})),s=new T.Group();s.position.y=.2;s.scale.z=1.05;s.rotation.x=-.08;G.add(s);
    s.add(part(hg('sbrim'+r0,()=>lathe([[r0+.008,0],[.19,-.012],[.27,-.032],[.29,-.05]],36)),sm));
    s.add(part(hg('scrown'+r0,()=>lathe([[r0+.012,-.002],[r0+.014,.06],[r0+.004,.086],[.06,.1],[0,.104]],28)),sm));
    s.add(part(hg('sband'+r0,()=>new T.TorusGeometry(r0+.015,.013,8,32)),cloth(0x5a2a1a),0,.012,0,Math.PI/2))}
  else if(type==='scarf'){const c=col||0xb85a4a,s=new T.Group();s.position.y=.15;s.rotation.x=-.12;G.add(s);
    s.add(part(hg('scarf'+r0,()=>new T.SphereGeometry(r0+.018,26,14,Math.PI/2+1.25,6.283-2.5,0,Math.PI*.62)),cloth(c),0,0,0,0,0,0,1,1.12,1.1));
    s.add(part(hg('scarfF'+r0,()=>new T.SphereGeometry(r0+.018,26,8,Math.PI/2-1.25,2.5,0,Math.PI*.24)),cloth(c),0,0,0,0,0,0,1,1.12,1.1));
    s.add(part(hg('knot',()=>new T.SphereGeometry(.03,10,8)),cloth(c),0,-.02,-(r0+.02)*1.1,0,0,0,1.3,.9,1));
    for(const sx of[-1,1])s.add(part(hg('tail',()=>new T.BoxGeometry(.045,.15,.012)),cloth(c),sx*.025,-.09,-(r0+.03)*1.1,.25,0,sx*.25))}
  else if(type==='elven'){const e=new T.Group();e.position.y=.196;e.rotation.x=.18;e.scale.z=1.07;G.add(e);
    e.add(part(hg('circ'+r0,()=>new T.TorusGeometry(r0+.008,.0055,6,40)),gold(),0,0,0,Math.PI/2));
    for(const s of[-1,1])e.add(part(hg('leaf',()=>new T.OctahedronGeometry(.02,0)),gold(),s*.04,.008,(r0+.004)*.99,0,s*.6,s*.9,1.6,.6,.4));
    e.add(part(hg('egem',()=>new T.OctahedronGeometry(.017,0)),glowM(0x9ff0c0),0,.012,r0+.014))}
  G.scale.setScalar(.86);G.position.y+=.006;return G}   /* hats sat too big on the head */
function realFace(h,o){
  const fem=h.kind==='female',skin=o.skin??SKINS[1];
  /* keep hats and helmets, drop the old box face, ears, nose and hair */
  const ph=h.head,hairC=o.hair??HAIRS[1],drop=[];
  ph.traverse(m=>{if(!m.isMesh)return;const mt=m.material;if(Array.isArray(mt)){drop.push(m);return}
    const c=mt&&mt.color?mt.color.getHex():-1;
    if(mt.map||c===(skin|0)||c===shadeHex(skin,.88)||mt.side===T.DoubleSide||c===(hairC|0))drop.push(m)});
  /* a hood on a peasant outfit: use the real cloth hood of the outfit instead of the old box hood */
  if(o.hat==='hood'){const hc=(o.hatc||0x333b2a)|0;ph.traverse(m=>{if(m.isMesh&&m.material&&m.material.color&&m.material.color.getHex()===hc)drop.push(m)});
    h.model.traverse(p=>{if(/^Ranger_Hood/.test(p.name)&&!p.isBone){p.visible=true;p.traverse(q=>{if(q.isMesh&&q.material){q.material=q.material.clone();q.material.color=new T.Color(hc).multiplyScalar(2.2)}})}})}
  for(const m of drop)m.parent&&m.parent.remove(m);
  h.face=[];const add=m=>{if(m)h.face.push(m)};
  add(faceMesh(h,fem?'headF':'headM',skinMat(fem,skin)));
  add(faceMesh(h,fem?'eyesF':'eyesM',eyeMat(o.eye??EYES[0])));
  add(faceMesh(h,fem?'browsF':'browsM',hairMat(o.old?0x9a9a9a:hairC,fem?2:1)));
  /* hair: the Quaternius styles are made for exactly this head */
  const hood=o.hat==='hood'||o.hat==='helm'||o.hat==='horned'||o.hat==='dragonhelm'||o.hat==='scarf';
  let st=HAIR_UBC[o.hairStyle||'short'];if(st==='Buzzed'&&fem)st='BuzzedFemale';
  if(st&&o.hairStyle!=='bald'&&!(hood&&(st==='Long'||st==='Buns')&&o.hat!=='scarf'))add(faceMesh(h,st,hairMat(hairC,st==='Buns'||st==='Long'?2:1)));
  else if(st&&hood&&st!=='Buzzed'&&st!=='BuzzedFemale')add(faceMesh(h,fem?'BuzzedFemale':'Buzzed',hairMat(hairC,1)));
  if(!fem&&(o.beard==='beard3d'||o.beard==='full'||o.beard==='mustache'))add(faceMesh(h,'Beard',hairMat(hairC,1)));
  else if(!fem&&o.beard==='stubble'){const bm=hairMat(hairC,1).clone();bm.transparent=true;bm.opacity=.42;bm.depthWrite=false;add(faceMesh(h,'Beard',bm))}
  /* new hats made for the real head; the old box hats go */
  if(o.hat&&HAT_TYPES.has(o.hat)){const old=[];ph.traverse(m=>{if(m.isMesh)old.push(m)});for(const m of old)m.parent&&m.parent.remove(m);
    try{const hat=buildHat(o.hat,o.hatc,fem,o.hairStyle&&o.hairStyle!=='bald');if(hat)h.headA.add(hat)}catch(e){console.warn('hat',e)}}
  else{ph.position.y+=.015;ph.scale.multiplyScalar(1.04)}
  /* the same skin texture on arms and hands */
  const sm=skinMat(fem,skin);h.model.traverse(m=>{if(m.isMesh&&m.material&&String(m.material.name||'').startsWith('MI_Regular'))m.material=sm});
  h.realFace=true}
EX.realFace=realFace;

/* ================= animated creatures (GLB with their own clips) ================= */
const CXD={
  wolf:{file:'creatures/wolf.glb',tx:'creatures/wolf',flip:false,idle:'idle_loop',walk:'walk_loop',run:'run_loop',atk:['bite'],walkSp:1.5,runSp:6.5,runV:3.4},
  spider:{file:'creatures/spider.glb',tx:'creatures/spider',flip:false,idle:'idle_loop',walk:'walk_loop',run:'run_loop',atk:['bite'],walkSp:1.1,runSp:4.6,runV:2.6},
  orc1:{file:'orc/orc1.glb',flip:true,idle:'idle',walk:'walk',run:'run',atk:['atk','atk2','crit'],hit:'hit',die:'die',roar:'roar',walkSp:1.3,runSp:3.6,runV:2.6},
  orc2:{file:'orc/orc2.glb',flip:true,idle:'idle',idle2:'idle2',walk:'walk',run:'run',atk:['atk','atk2','atk3'],hit:'hit',die:'die',roar:'roar',walkSp:1.25,runSp:3.8,runV:2.8},
  tbird:{file:'tbird/tbird.glb',flip:true,idle:'idle1',idle2:'idle2',walk:'walk',run:'run',atk:['attack4','attack5','attack6','attack9'],roar:'mouthclack',walkSp:1.6,runSp:6.5,runV:3.2}};
async function loadCX(k){const D=CXD[k];
  try{const g=await glb('assets/'+D.file);const src=g.scene;src.updateMatrixWorld(true);D.src=src;D.clips={};for(const c of g.animations)D.clips[c.name]=c;D.box=bindBox(src);D.H=D.box.max.y-D.box.min.y;
    if(k==='wolf'||k==='spider'){const [map,nrm,mr]=await Promise.all([tex('assets/'+D.tx+'_color.jpg',{flip:false}),tex('assets/'+D.tx+'_normal.jpg',{flip:false}),tex('assets/'+D.tx+'_mr.jpg',{flip:false})]);D.T={map,nrm,mr}}
    else if(k==='orc1'){const [map,nrm,axe,axn]=await Promise.all(['color','normal','axe','axe_n'].map(n=>tex('assets/orc/orc1_'+n+'.jpg')));D.T={map,nrm,axe,axn}}
    else if(k==='orc2'){const [map,al,nrm,em,axe,axa,axn]=await Promise.all(['color','alpha','normal','emis','axe','axe_a','axe_n'].map(n=>tex('assets/orc/orc2_'+n+'.jpg')));D.T={map,al,nrm,em,axe,axa,axn}}
    else if(k==='tbird'){D.T={map:await tex('assets/tbird/tbird_color.jpg')}}
    D.mats={};D.ok=true}catch(e){console.warn('creature '+k,e);D.ok=false}}
function cxMat(k,mesh,tint){const D=CXD[k],key=(mesh.material&&mesh.material.name||'')+(k==='orc1'&&/^Axe/.test(mesh.name)?'axe':'')+'|'+(tint||0);if(D.mats[key])return D.mats[key];const X=D.T,col=tint?new T.Color(tint):new T.Color(0xffffff);let m;
  if(k==='wolf'||k==='spider')m=new T.MeshStandardMaterial({map:X.map,normalMap:X.nrm,roughnessMap:X.mr,metalnessMap:X.mr,roughness:1,metalness:k==='spider'?.6:.2,color:col,skinning:true});
  else if(k==='orc1')m=/^Axe/.test(mesh.name)?new T.MeshStandardMaterial({map:X.axe,normalMap:X.axn,roughness:.45,metalness:.55,skinning:true}):new T.MeshStandardMaterial({map:X.map,normalMap:X.nrm,roughness:.7,metalness:.05,color:col,skinning:true});
  else if(k==='orc2')m=mesh.material&&mesh.material.name==='lambert2'?new T.MeshStandardMaterial({map:X.axe,alphaMap:X.axa,alphaTest:.5,normalMap:X.axn,roughness:.45,metalness:.5,skinning:true}):new T.MeshStandardMaterial({map:X.map,alphaMap:X.al,alphaTest:.5,normalMap:X.nrm,emissiveMap:X.em,emissive:0xff4a2a,emissiveIntensity:1.4,roughness:.75,metalness:.1,color:col,side:T.DoubleSide,skinning:true});
  else m=new T.MeshStandardMaterial({map:X.map,roughness:.85,metalness:0,color:col,skinning:true});
  return D.mats[key]=m}
function makeCX(k,o={}){const D=CXD[k],model=T.SkeletonUtils.clone(D.src);
  model.traverse(m=>{if(!m.isMesh)return;m.material=cxMat(k,m,o.tint);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false});
  const sc=(o.h||D.H)/Math.max(.01,D.H);model.scale.multiplyScalar(sc);model.position.y=-D.box.min.y*sc;
  const g=new T.Group(),rig=new T.Group(),body=new T.Group();g.add(rig);rig.add(body);body.add(model);
  const m={g,rig,body,model,legs:dummyLegs(),armL:dm(),armR:dm(),eyes:[],phase:0,cx:k,gl:true,sc,mixer:new T.AnimationMixer(model),acts:{},cur:null,cn:'',bones:boneMap(model)};
  if(o.eyes){const head=Object.values(m.bones).find(b=>/^head/i.test(b.name));if(head){const em=new T.MeshBasicMaterial({color:o.eyes});for(const s of[-1,1]){const e=new T.Mesh(new T.SphereGeometry(.035/sc*1.2,6,5),em);e.position.set(s*.06/sc,.06/sc,.16/sc);head.add(e);m.eyes.push(e)}}}
  cxPlay(m,D.idle);m.mixer.update(Math.random()*3);return m}
EX.makeCX=makeCX;
function cxPlay(m,n,once,ts=1){const D=CXD[m.cx];if(m.cn===n){if(m.cur)m.cur.timeScale=ts;return}const c=D.clips[n];if(!c)return;
  const a=m.acts[n]||(m.acts[n]=m.mixer.clipAction(c));a.enabled=true;a.reset();a.setLoop(once?T.LoopOnce:T.LoopRepeat,Infinity);a.clampWhenFinished=!!once;a.timeScale=ts;a.setEffectiveWeight(1);a.fadeIn(.18);a.play();
  if(m.cur&&m.cur!==a)m.cur.fadeOut(.18);m.cur=a;m.cn=n}
function cxAnim(a,dt){const m=a.model;if(!m||!m.cx||a.root.visible===false)return;const D=CXD[m.cx],v=a.vel||0,s=m.sc||1;
  if(a.frz>0&&!a.dead)return;
  if(a.hp<(m.lastHp??a.hp)&&!a.dead){m.hitT=D.hit?.5:.22}m.lastHp=a.hp;if(m.hitT>0)m.hitT-=dt;
  if(a.wind>0&&!m.wasWind)m.atkN=pick(D.atk);m.wasWind=a.wind>0;
  let n=D.idle,ts=1,once=false;
  if(a.dead){if(D.die){n=D.die;once=true}else n=D.idle}
  else if(m.hitT>0&&D.hit){n=D.hit;once=true;ts=1.3}
  else if(a.wind>0){n=m.atkN||D.atk[0];once=true;const c=D.clips[n];ts=c?Math.min(3,Math.max(1,c.duration/.75)):1.5}
  else if(m.roarT>0&&D.roar){m.roarT-=dt;n=D.roar;once=true}
  else if(v>D.runV*s){n=D.run;ts=clamp(v/(D.runSp*s),.6,1.8)}
  else if(v>.3){n=D.walk;ts=clamp(v/(D.walkSp*s),.5,1.8)}
  else if(D.idle2){m.idleT=(m.idleT??rnd(6,14))-dt;if(m.idleT<0){m.alt=!m.alt;m.idleT=m.alt?(D.clips[D.idle2]?D.clips[D.idle2].duration:4):rnd(8,16)}if(m.alt)n=D.idle2}
  cxPlay(m,n,once,ts);
  /* a short flinch for creatures without a hit clip */
  if(!D.hit){const k=m.hitT>0?Math.sin(m.hitT*28)*.12:0;m.body.rotation.x=k;m.body.position.z=-Math.abs(k)*.4}
  if(a.dead&&D.die)a.root.rotation.z=0;
  m.mixer.update(dt)}
EX.cxAnim=cxAnim;

/* ================= Bestiary monsters on the human animation rig (goblins and imps) ================= */
const BXD={puglin:{file:'bestiary/puglin.glb',anims:'bestiary/puglin_anims.bin',H:.93},imp:{file:'bestiary/imp.glb',anims:'bestiary/imp_anims.bin',H:1.68}};
async function loadBX(k){const D=BXD[k];
  try{const [g,ab]=await Promise.all([glb('assets/'+D.file),asFetchBin('assets/'+D.anims)]);D.src=g.scene;D.src.updateMatrixWorld(true);
    const {h,base}=hdr(ab),fps=h.fps,clips={};
    for(const name in h.clips){const c=h.clips[name],n=c.n,times=new Float32Array(n);for(let i=0;i<n;i++)times[i]=Math.min(c.d,i/fps);const Q=new Int16Array(ab,base+c.q,n*4*h.bones.length),tr=[];
      h.bones.forEach((bn,bi)=>{const v=new Float32Array(n*4);for(let i=0;i<n*4;i++)v[i]=Q[bi*n*4+i]/32767;tr.push(new T.QuaternionKeyframeTrack(bn+'.quaternion',times,v))});
      tr.push(new T.VectorKeyframeTrack('pelvis.position',times,new Float32Array(ab.slice(base+c.p,base+c.p+n*12))));clips[name]=new T.AnimationClip(name,c.d,tr)}
    AS.clips[k]=clips;
    const v=[1,2,3].map(i=>tex('assets/bestiary/'+k+'_'+i+'.jpg',{flip:false}));const [t1,t2,t3,nrm,em]=await Promise.all([...v,tex('assets/bestiary/'+k+'_n.jpg',{flip:false}),tex('assets/bestiary/'+k+'_e.jpg',{flip:false})]);
    D.T={v:[t1,t2,t3],nrm,em};D.mats={};D.ok=true}catch(e){console.warn('bestiary '+k,e);D.ok=false}}
function bxMat(k,vi,tint,glow){const D=BXD[k],key=vi+'|'+(tint||0)+'|'+(glow||0);if(D.mats[key])return D.mats[key];
  return D.mats[key]=new T.MeshStandardMaterial({map:D.T.v[vi-1]||D.T.v[0],normalMap:D.T.nrm,emissiveMap:D.T.em,emissive:glow||0xffffff,emissiveIntensity:glow?2.2:1,roughness:.78,metalness:.05,color:tint?new T.Color(tint):new T.Color(0xffffff),skinning:true})}
/* a humanoid built the same way as the skinned villagers, so all their animation code drives it */
function makeBeastH(k,o){const D=BXD[k],model=T.SkeletonUtils.clone(D.src);model.userData.bones=boneMap(model);
  model.traverse(m=>{if(!m.isMesh)return;m.material=bxMat(k,o.v||1,o.tint,o.glow);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false});
  const g=new T.Group(),rig=new T.Group();g.add(rig);rig.add(model);const s=(o.h||D.H)/D.H;rig.scale.setScalar(s);
  const B=model.userData.bones,at=n=>{const x=new T.Group();(B[n]||model).add(x);return x};
  const head=at('Head'),hand=at('hand_r'),off=at('hand_l'),spine=at('spine_03');
  const h={g,rig,model,torso:dm(),legL:dm(),legR:dm(),armL:dm(),armR:dm(),head,headA:head,hand,off,arm:dm(),spine,phase:0,atk:0,draw:0,block:0,tunicMat:null,held:null,held2:null,
    sk:true,kind:k,scale:s,mixer:new T.AnimationMixer(model),acts:{},baseKey:'',baseName:'',upName:null,upAct:null,upOnce:false,upT:0,_atkLast:0,beast:k};
  /* the crouching idle does not suit these bodies: use the normal idle instead */
  Object.defineProperty(h,'idleClip',{get(){return this._ic},set(v){this._ic=v==='Crouch_Idle_Loop'?'Idle_Loop':v},configurable:true});
  try{animHuman(h,0,0,{})}catch(e){}h.mixer.update(Math.random()*2);return h}
EX.makeBeastH=makeBeastH;EX.bx=BXD;EX.cxd=CXD;

/* ================= fish: 25 species in one atlas, swimming with a tail wiggle in the shader ================= */
const FSH={ok:false,geo:{},mat:null,t:{value:0}};
async function loadFish(){try{const [buf,map]=await Promise.all([asFetchBin('assets/fish/fish.bin'),tex('assets/fish/fish.jpg',{flip:false})]);const {h,base}=hdr(buf);
    for(const k in h){const e=h[k],P=new Int16Array(buf,base+e.po,e.v*3),N=new Int8Array(buf,base+e.no,e.v*4),U=new Uint16Array(buf,base+e.uo,e.v*2);
      const pos=new Float32Array(e.v*3),nor=new Float32Array(e.v*3),uv=new Float32Array(e.v*2);for(let i=0;i<e.v;i++){for(let j=0;j<3;j++){pos[i*3+j]=P[i*3+j]*e.s;nor[i*3+j]=N[i*4+j]/127}uv[i*2]=U[i*2]/65535;uv[i*2+1]=U[i*2+1]/65535}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));
      g.setIndex(new T.BufferAttribute(new Uint16Array(buf.slice(base+e.io,base+e.io+e.i*2)),1));g.computeBoundingSphere();FSH.geo[k]={g,bb:e.bb}}
    FSH.mat=fishMat(map,false);FSH.glowMat=fishMat(map,true);FSH.ok=true}catch(e){console.warn('fish',e)}}
function fishMat(map,glow){const m=new T.MeshStandardMaterial({map,roughness:.45,metalness:.15,emissive:glow?0xffd27a:0x000000,emissiveMap:glow?map:null,emissiveIntensity:glow?.9:0});
  m.onBeforeCompile=sh=>{sh.uniforms.fT=FSH.t;sh.vertexShader='uniform float fT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat fw=clamp(.25-position.z*1.6,0.,1.4);transformed.x+=sin(fT*9.+position.z*7.+modelMatrix[3][0]*.7)*.07*fw;')};return m}
function fishMesh(k,len,glow){const F=FSH.geo[k];if(!F)return null;const L=Math.max(F.bb[5]-F.bb[2],F.bb[3]-F.bb[0],F.bb[4]-F.bb[1]);const m=new T.Mesh(F.g,glow?FSH.glowMat:FSH.mat);m.scale.setScalar(len/Math.max(.01,L));m.castShadow=false;return m}
EX.fishMesh=fishMesh;
ANIMS.push(dt=>{FSH.t.value+=dt});

/* ================= birds: flocks of ravens circling over the land ================= */
const BRD={ok:false,list:[]};
async function loadBird(){try{const buf=await asFetchBin('assets/bird/bird.json');BRD.d=JSON.parse(new TextDecoder().decode(new Uint8Array(buf)));BRD.tex=await tex('assets/bird/wings.png');BRD.ok=true}catch(e){console.warn('bird',e)}}
function birdGeo(p){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p.p,3));g.setAttribute('uv',new T.Float32BufferAttribute(p.uv,2));g.computeVertexNormals();return g}
function makeBird(){const d=BRD.d;if(!BRD.mat){BRD.mat=new T.MeshStandardMaterial({map:BRD.tex,color:0x2a2a30,alphaTest:.45,side:T.DoubleSide,roughness:.9});BRD.g={b:birdGeo(d.Bird),r:birdGeo(d.RightWing),l:birdGeo(d.LeftWing)};
    for(const k of['r','l']){const pv=k==='r'?d.pivR:d.pivL;BRD.g[k].translate(-pv[0],-pv[1],-pv[2])}}
  const g=new T.Group(),body=new T.Mesh(BRD.g.b,BRD.mat);g.add(body);const wings=[];
  for(const k of['r','l']){const pv=k==='r'?d.pivR:d.pivL,w=new T.Group();w.position.set(pv[0],pv[1],pv[2]);w.add(new T.Mesh(BRD.g[k],BRD.mat));g.add(w);wings.push(w)}
  g.userData.dyn=true;return{g,wings}}
function spawnBirds(){if(!BRD.ok)return;const centers=[];for(let i=0;i<7;i++){const a=i/7*6.283+rnd(.4),r=rnd(80,800);centers.push([Math.cos(a)*r,Math.sin(a)*r])}
  if(SITE.graveyard)centers.push([SITE.graveyard.x,SITE.graveyard.z]);
  for(const [cx,cz] of centers){const n=3+Math.floor(Math.random()*5),R=rnd(14,34),hgt=rnd(18,34),sp=rnd(.25,.45)*(Math.random()<.5?1:-1);
    for(let i=0;i<n;i++){const b=makeBird();b.g.scale.setScalar(rnd(.75,1.05));scene.add(b.g);BRD.list.push({b,cx,cz,R:R+rnd(-4,4),h:hgt+rnd(-3,3),a:i/n*6.283+rnd(.3),sp,ph:rnd(6),glide:0})}}}
ANIMS.push(dt=>{if(!BRD.list.length)return;const out=PL.inCave;
  for(const q of BRD.list){const g=q.b.g;if(out||Math.abs(q.cx-PL.x)>420||Math.abs(q.cz-PL.z)>420){g.visible=false;continue}g.visible=true;
    q.a+=q.sp*dt;q.ph+=dt;const x=q.cx+Math.cos(q.a)*q.R,z=q.cz+Math.sin(q.a)*q.R,y=groundH(q.cx,q.cz)+q.h+Math.sin(q.ph*.7)*2;
    const dx=-Math.sin(q.a)*Math.sign(q.sp),dz=Math.cos(q.a)*Math.sign(q.sp);g.position.set(x,y,z);g.rotation.set(0,Math.atan2(dx,dz),-.35*Math.sign(q.sp));
    q.glide-=dt;if(q.glide<-3)q.glide=rnd(1,3);const fl=q.glide>0?.08:Math.sin(q.ph*11)*.75;q.b.wings[0].rotation.z=fl;q.b.wings[1].rotation.z=-fl}});

/* ================= loading ================= */
EX.loadChars=async function(){if(EX.charsOk)return;EX.charsOk=true;await loadFaces()};
EX.loadWorld=async function(){if(EX.worldOk)return;EX.worldOk=true;setLoad('wezens laden');
  await Promise.all([...Object.keys(CXD).map(loadCX),...Object.keys(BXD).map(loadBX),loadFish(),loadBird(),EX.loadChars()])};

/* ================= hooks: faces ================= */
const _mhX=makeHuman;
makeHuman=function(o={}){
  if(EX.beast){const b=EX.beast;EX.beast=null;if(BXD[b.kind]&&BXD[b.kind].ok)return makeBeastH(b.kind,b)}
  const h=_mhX(o);if(h&&h.sk&&(h.kind==='male'||h.kind==='female')&&!o.armor&&typeof o.mix==='string'&&o.mix.length>=5)try{mixOutfit(h,o.mix)}catch(e){}
  if(h&&h.sk&&FACE.ok&&!o.skull&&!o.proc&&(h.kind==='male'||h.kind==='female')){try{realFace(h,o)}catch(e){console.warn('face',e)}}return h};
/* mix and match the modular outfit: top, arms, trousers, shoes (p = peasant, r = ranger) and the shoulder piece */
function mixOutfit(h,M){const want={Body:M[0],Arms:M[1],Legs:M[2],Feet:M[3]};
  h.model.traverse(p=>{if(p.isBone)return;const m=/^(Peasant|Ranger)_(Body|Arms|Legs|Feet|Pauldron)/.exec(p.name);if(!m)return;const st=m[1]==='Ranger'?'r':'p';p.visible=m[2]==='Pauldron'?M[4]==='1':want[m[2]]===st})}
const _shX=setHeld;
setHeld=function(h,wid,sid){if(h&&h.beast){h.wid=wid;h.sid=null;return}return _shX(h,wid,sid)};

/* ================= hooks: spawning ================= */
Object.assign(MON,{
  terrorbird:{n:'Schrikvogel',hp:150,dmg:19,speed:7.8,aggro:27,range:2.7,xp:65,loot:'terrorbird',rad:.9,hh:2.6},
  shark:{n:'Meerhaai',hp:220,dmg:26,speed:6,aggro:22,range:3,xp:140,loot:'shark',rad:1.1,hh:1.2,aq:-.9,swim:true}});
Object.assign(ITEMS,{
  feather:{n:'Schrikveer',g:'mat',price:28,ico:'✦'},shark_tooth:{n:'Haaientand',g:'mat',price:60,ico:'▪'},
  salmon:{n:'Zalm',g:'food',heal:26,price:12,ico:'●'},catfish:{n:'Meerval',g:'food',heal:22,price:10,ico:'●'},trout:{n:'Forel',g:'food',heal:18,price:8,ico:'●'},
  glowfish:{n:'Gloeivis',g:'food',heal:45,buff:{regen:2},dur:60,price:120,ico:'●',rar:'r'}});
LOOTX.terrorbird=()=>({gold:Math.floor(rnd(5,25)),items:[['feather',Math.floor(rnd(1,3.9))],['meat',2]]});
LOOTX.shark=()=>({gold:Math.floor(rnd(20,60)),items:[['shark_tooth',Math.floor(rnd(1,3.9))],['fish',2]].concat(Math.random()<.25?[['pearl',1]]:[])});
function spawnCX(type,k,x,z,o,opt){const d=MON[type],m=makeCX(k,opt);
  const a=baseActor({kind:'enemy',type,name:d.n,model:m,root:m.g,x,z,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:d.loot,ranged:d.ranged,dormant:d.dormant,wakeR:d.wakeR,boss:d.boss,aq:d.aq,swim:d.swim,respawn:d.respawn||300,...o});
  if(d.aq!==undefined)a.y=d.aq;scene.add(a.root);placeActor(a);return a}
const BEAST={goblin:['puglin',{v:1,h:1.25}],goblinbrute:['puglin',{v:3,h:1.95}],goblinbig:['puglin',{v:2,h:2.9}],imp:['imp',{v:1,h:1.3,glow:0xffa040}],demon:['imp',{v:3,h:2.55,tint:0xc07070,glow:0xff4a1a}]};
const _smX=spawnMonster;
spawnMonster=function(type,x,z,o={}){
  if(type==='troll'&&CXD.orc1.ok)return spawnCX('troll','orc1',x,z,o,{h:3.35,tint:0xb4c49a});
  if(type==='goblinking'&&CXD.orc2.ok){const a=spawnCX('goblinking','orc2',x,z,o,{h:2.75});a.name=MON.goblinking.n;return a}
  if(type==='spider'&&CXD.spider.ok)return spawnCX('spider','spider',x,z,o,{h:1.25});
  if(type==='shadowwolf'&&CXD.wolf.ok)return spawnCX('shadowwolf','wolf',x,z,o,{h:1.3,tint:0x34323e,eyes:0xff2a2a});
  if(type==='terrorbird'){if(!CXD.tbird.ok)return _smX('spider',x,z,o);return spawnCX('terrorbird','tbird',x,z,o,{h:2.5})}
  if(type==='shark'){if(!FSH.ok)return _smX('serpent',x,z,o);const m=makeSharkModel();const d=MON.shark;
    const a=baseActor({kind:'enemy',type,name:d.n,model:m,root:m.g,x,z,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:d.loot,aq:d.aq,swim:true,respawn:600,...o});a.y=d.aq;scene.add(a.root);placeActor(a);return a}
  if(type==='goblinshaman'){const d=MON.goblinshaman,h=BXD.puglin.ok?makeBeastH('puglin',{v:2,h:1.2,glow:0x7aff4a}):makeHuman({skin:0x6a9a3a,tunic:0x3a5a2a,pants:0x2a2418,hairStyle:'bald',beard:'none',face:5,scale:.75,hat:'hood',hatc:0x2a4a1a});setHeld(h,'dagger');
    const a=baseActor({kind:'enemy',type,name:d.n,h,root:h.g,x,z,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:d.loot,ranged:true,respawn:300,...o});scene.add(a.root);placeActor(a);return a}
  const bz=BEAST[type];if(bz&&BXD[bz[0]].ok){EX.beast={kind:bz[0],...bz[1]};try{return _smX(type,x,z,o)}finally{EX.beast=null}}
  return _smX(type,x,z,o)};
const _seX=spawnEnemy;
const WOLFC={0x6b6b6b:0xd2d2d2,0x5a5048:0xc8a888,0x8a8a8a:0xffffff};
spawnEnemy=function(type,x,z,o={}){
  if(type==='wolf'&&CXD.wolf.ok){const tint=pick([0xd6d6d6,0xc8aa88,0xffffff,0xb0b0b8]),m=makeCX('wolf',{h:1.02,tint});
    const a=baseActor({kind:'enemy',type,name:'Wolf',model:m,root:m.g,x,z,hp:38,hpMax:38,dmg:8,speed:6.4,aggro:24,range:1.8,rad:.5,xp:14,loot:'wolf',...o});scene.add(a.root);placeActor(a);return a}
  return _seX(type,x,z,o)};
function makeSharkModel(){const g=new T.Group(),rig=new T.Group();g.add(rig);const f=fishMesh(Math.random()<.3?'hammerhead_shark':'great_white_shark',3.4);rig.add(f);g.userData.dyn=true;return{g,rig,tail:dm(),legs:dummyLegs(),phase:0,fishy:true}}
/* creature animation runs after the normal enemy update */
const _ahX=animHorse;animHorse=function(h,dt,speed){if(h&&h.cx)return;return _ahX(h,dt,speed)};
const _ueX=updateEnemy;updateEnemy=function(a,dt){_ueX(a,dt);if(a.model&&a.model.cx&&!a.dead)cxAnim(a,dt)};
const _uaX=updateActors;updateActors=function(dt){_uaX(dt);for(const a of actors)if(a.dead&&a.model&&a.model.cx&&a.root.visible)cxAnim(a,dt)};
const _rvX=reviveActor;reviveActor=function(a){_rvX(a);if(a.model&&a.model.cx){a.model.cn='';a.model.lastHp=a.hp;a.model.hitT=0}};
/* a boss roars when it first sees you */
const _ueR=updateEnemy;updateEnemy=function(a,dt){const was=a.state;_ueR(a,dt);if(a.model&&a.model.cx&&a.state==='chase'&&was!=='chase'&&CXD[a.model.cx].roar&&!a.dead&&(a.boss||Math.random()<.35)){a.model.roarT=1.4;if(a.boss){addLog(a.name+' brult!','#e5766a');sfx('thunder')}}};

/* ================= fish in rivers and lakes use the real models ================= */
const FISH_M={Voorn:['silver_arowana',.42],Karper:['koi',.7],Paling:['moray_eel',1.05],'Gouden vis':['fancy_goldfish',.5],Forel:['rainbow_trout',.55],Zalm:['sockeye_salmon',.78],Baars:['largemouth_bass',.5],Meerval:['channel_catfish',.95],Bot:['flounder',.45]};
FTYPES.length=0;
FTYPES.push({n:'Voorn',col:0xa8c0d0,len:.4,thin:.3,spd:1.4,item:'fish',p:.24},{n:'Forel',col:0x9ab08a,len:.55,thin:.3,spd:1.6,item:'trout',p:.16},{n:'Baars',col:0x6a8a4a,len:.5,thin:.3,spd:1.3,item:'fish',p:.12},
  {n:'Karper',col:0xc8964a,len:.75,thin:.34,spd:1,item:'fish',p:.14,n2:2},{n:'Zalm',col:0xd06a4a,len:.78,thin:.3,spd:1.7,item:'salmon',p:.1},{n:'Meerval',col:0x5a5a4a,len:.95,thin:.3,spd:.8,item:'catfish',p:.08},
  {n:'Bot',col:0xa09070,len:.45,thin:.2,spd:.9,item:'fish',p:.05},{n:'Paling',col:0x4a5a3a,len:1.1,thin:.14,spd:1.2,item:'eel',p:.07},{n:'Gouden vis',col:0xffd24a,len:.6,thin:.3,spd:1.8,item:'golden_fish',p:.04,glow:1});
const _mfX=makeFish;
function modelFish(ft){const M=FISH_M[ft.n];if(!FSH.ok||!M)return null;const g=new T.Group(),rig=new T.Group();g.add(rig);const f=fishMesh(M[0],M[1],ft.glow);if(!f)return null;rig.add(f);return{g,rig,tail:dm(),legs:dummyLegs(),phase:0}}
spawnFish=function(x,z){const ft=pickFT(),m=modelFish(ft)||_mfX(ft.col,ft.len,ft.thin);if(ft.glow&&!m.rig.children[0].material.emissiveMap)m.rig.traverse(o=>{if(o.isMesh&&o.material&&o.material.color)o.material=new T.MeshBasicMaterial({color:0xffe27a})});
  m.g.userData.dyn=true;scene.add(m.g);const f={ft,m,x,z,hx:x,hz:z,tx:x,tz:z,rot:rnd(6.28),t:rnd(2),dead:0,dep:rnd(.3,1.2)};FISHES.push(f);return f};
const _mpX=makePiranha;
makePiranha=function(){if(!FSH.ok)return _mpX();const g=new T.Group(),rig=new T.Group();g.add(rig);rig.add(fishMesh('piranha',.55));return{g,rig,tail:dm(),legs:dummyLegs(),phase:0}};

/* ================= new spawns: terror birds on the plains, sharks in deep lakes, birds in the sky, big fish ================= */
const _pfX=populateFantasy;
populateFantasy=function(){_pfX();
  try{const open=(x,z)=>forestDensity(x,z)<.18&&terrainH(x,z)<12;
    for(let i=0;i<7;i++){const p=wildPoint(260,1050,open);if(p){const n=1+Math.floor(Math.random()*2.6);for(let k=0;k<n;k++)spawnMonster('terrorbird',p[0]+rnd(-6,6),p[1]+rnd(-6,6))}}
    const deep=SPOTS.deep||[];deep.slice(1,4).forEach(p=>{spawnMonster('shark',p.x+rnd(-8,8),p.z+rnd(-8,8))});
    if(FSH.ok)deepFauna(deep);spawnBirds();}catch(e){console.warn('extra spawns',e)}};
/* slow giants in the deepest lakes: manta rays, sunfish, tuna and swordfish, just for show */
function deepFauna(deep){const kinds=[['manta_ray',3.2],['ocean_sunfish',2.6],['bluefin_tuna',1.9],['swordfish',2.4],['hammerhead_shark',3]];EX.deep=[];
  deep.slice(0,6).forEach((p,i)=>{const [k,len]=kinds[i%kinds.length],g=new T.Group();const f=fishMesh(k,len);if(!f)return;g.add(f);g.userData.dyn=true;scene.add(g);EX.deep.push({g,x:p.x,z:p.z,r:Math.max(6,p.rad*.6),a:rnd(6.28),sp:rnd(.08,.16),y:-1.8-rnd(0,1.2)})})}
ANIMS.push(dt=>{if(!EX.deep)return;for(const q of EX.deep){const near=Math.abs(q.x-PL.x)<150&&Math.abs(q.z-PL.z)<150;q.g.visible=near&&!PL.inCave;if(!near)continue;q.a+=q.sp*dt;
  const x=q.x+Math.cos(q.a)*q.r,z=q.z+Math.sin(q.a)*q.r,bed=terrainH(x,z);q.g.position.set(x,Math.max(bed+.6,q.y)+Math.sin(q.a*3)*.2,z);q.g.rotation.y=Math.atan2(-Math.sin(q.a),Math.cos(q.a))}});

/* ================= boot: load the creatures before the world is built ================= */
const _bootE=boot;
boot=async function(){try{await EX.loadWorld()}catch(e){console.warn('extra load',e)}return _bootE.apply(this,arguments)};
})();
