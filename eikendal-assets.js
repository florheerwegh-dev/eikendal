/* Eikendal: 3D asset integration.
   Models, animations and textures by Quaternius (CC0, quaternius.com):
   Universal Animation Library 1+2, Modular Character Outfits - Fantasy, Medieval Village MegaKit,
   Stylized Nature MegaKit and Fantasy Props MegaKit, bundled into assets/*.glb.
   This file loads the bundles and swaps the procedural stand-ins for real models: animated people,
   modular houses, trees, rocks, grass, flowers, props, weapons, chests and textures.
   Without the assets (for example when the page is opened straight from disk) the game keeps its
   original procedural look. */
try{
'use strict';
/* ---------- Loading ---------- */
const AS={ok:false,lib:{},raw:{},clips:{},tex:{},anchor:{},rest:{},chest:[],err:'',t0:performance.now()};
const AS_FILES=[['nature','assets/nature.glb'],['village','assets/village.glb'],['props','assets/props.glb'],['male','assets/char_male.glb'],['female','assets/char_female.glb'],['anims','assets/anims.glb'],['horse','assets/horse/warhorse.glb']];
const AS_TEX=['peasant_2','ranger_3','unevenbrick','unevenbrick_n','roundtiles','woodplanks','cobble','noise_terrain','rocks','plaster','brick','redbrick','pathrocks','topwear'];
const AS_FLIP=new Set(['peasant_2','ranger_3']);   // glTF uv convention: no flip
function asMat(m){
  if(!m||m.userData.asFixed)return;m.userData.asFixed=1;
  for(const k of['map','emissiveMap'])if(m[k])m[k].encoding=T.LinearEncoding;
  if(m.map)m.map.anisotropy=4;
  if(m.metalnessMap||m.metalness>.5)m.metalness=Math.min(m.metalness,.3);
  if(m.alphaTest>0){m.transparent=false;m.alphaTest=Math.max(m.alphaTest,.35)}}
function asPrep(root){root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;(Array.isArray(o.material)?o.material:[o.material]).forEach(asMat)})}
/* two phases: 'chars' (people and animations, for the character screen) and 'world' (everything else) */
const AS_CHARS=new Set(['male','female','anims','props']);
async function loadAssets(phase){
  if(!T.GLTFLoader||!T.SkeletonUtils){AS.err='loader';return false}
  if(location.protocol==='file:'){AS.err='file';return false}
  if(AS.failed)return false;
  const want=AS_FILES.filter(([k])=>!AS.raw[k]&&(phase!=='chars'||AS_CHARS.has(k)));
  const ld=new T.GLTFLoader(),prog={},show=()=>{let a=0;for(const [k] of want)a+=prog[k]||0;setLoad((phase==='chars'?'personage laden ':'3D-modellen laden ')+Math.round(a/Math.max(1,want.length)*100)+'%')};
  const get=(k,u)=>asFetchBin(u).then(buf=>new Promise((res,rej)=>ld.parse(buf,'',g=>{prog[k]=1;show();res(g)},rej))).catch(e=>{if(k==='horse'){prog[k]=1;return{scene:new T.Group(),animations:[]}}throw e});
  try{
    show();const res=await Promise.all(want.map(([k,u])=>get(k,u)));
    want.forEach(([k],i)=>{const g=res[i];AS.raw[k]=g;for(const c of g.scene.children.slice()){const n=c.name.replace(/^#/,'');AS.lib[n]=c;asPrep(c)}});
    if(!AS.charsReady&&AS.raw.male&&AS.raw.female&&AS.raw.anims){setLoad('animaties voorbereiden');await tick();asPrepChars();asPrepClips();AS.charsReady=true;AS.ok=true}
    if(phase==='chars')return true;
    const tl=new T.TextureLoader();
    await Promise.all(AS_TEX.map(n=>new Promise(r=>tl.load('assets/tex/'+n+'.jpg',t=>{t.encoding=T.LinearEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(AS_FLIP.has(n))t.flipY=false;AS.tex[n]=t;r()},undefined,()=>r()))));
    AS.chest=AS.raw.props.animations||[];AS.horseClips={};for(const c of (AS.raw.horse?AS.raw.horse.animations:[]))AS.horseClips[c.name]=c;
    try{await asLoadDragon()}catch(e){console.warn('dragon model not loaded',e)}
    AS.ok=true;AS.worldOk=true;console.log('Eikendal assets ready in',Math.round(performance.now()-AS.t0),'ms');return true
  }catch(e){console.warn('Eikendal: assets not loaded, using procedural models',e);AS.err=String(e&&e.message||e);AS.ok=false;AS.failed=true;return false}}
/* the title screen loads only the people first; the world follows after the character screen */
window.loadCharAssets=async function(){if(AS.charsReady)return true;const ok=await loadAssets('chars');if(ok){try{await loadHair3d()}catch(e){}}return ok};

/* binary files, or the same file as base64 text (the artifact host on claude.ai serves no .glb/.fbx) */
async function asFetchBin(url){
  const bin=async()=>{const r=await fetch(url);if(!r.ok)throw new Error(url+' '+r.status);return r.arrayBuffer()};
  const txt=async()=>{const r=await fetch(url+'.txt');if(!r.ok)throw new Error(url+'.txt '+r.status);const b=atob((await r.text()).trim()),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
  /* the .txt copy comes first: that is what ships (the artifact host serves no .glb/.fbx) */
  try{return await txt()}catch(e){return await bin()}}
window.asFetchBin=asFetchBin;
/* ---------- Recolouring: keeps texture detail, shifts its hue toward a colour ---------- */
const AS_TINT=function(sh){sh.uniforms.uTint=this.userData.uTint;sh.uniforms.uTintAmt=this.userData.uTintAmt;
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uTint;uniform float uTintAmt;')
    .replace('#include <map_fragment>','#include <map_fragment>\n{float l=dot(diffuseColor.rgb,vec3(.299,.587,.114));diffuseColor.rgb=mix(diffuseColor.rgb,uTint*l*2.1,uTintAmt);}')};
function asTint(m,col,amt){m.userData.uTint={value:new T.Color(col)};m.userData.uTintAmt={value:amt};m.onBeforeCompile=AS_TINT;m.needsUpdate=true;return m}
const asMatCache=new Map();
function asTinted(src,key,fn){const k=src.uuid+'|'+key;let m=asMatCache.get(k);if(!m){m=src.clone();m.userData={};asMat(m);m.userData.asFixed=1;fn(m);asMatCache.set(k,m)}return m}

/* ---------- Characters ---------- */
const AS_LOWER=new Set(['root','pelvis','thigh_l','calf_l','foot_l','ball_l','thigh_r','calf_r','foot_r','ball_r']);
const AS_FULL=new Set(['Death01','Roll','Sitting_Idle_Loop','Sitting_Talking_Loop','Driving_Loop','Swim_Fwd_Loop','Swim_Idle_Loop','Jump_Loop','Dance_Loop','Farm_Harvest','Farm_PlantSeed','Farm_Watering','Fixing_Kneeling','LayToIdle','Chest_Open','PickUp_Table','Interact','Crouch_Idle_Loop','Crouch_Fwd_Loop']);
const AS_RIG={male:'Male',female:'Female',mann:'Mannequin'};
function asBones(root){const b={};root.traverse(o=>{if(o.isBone)b[o.name]=o});return b}
function asPrepChars(){
  const v=new T.Vector3(),q=new T.Quaternion(),m=new T.Matrix4();
  for(const [kind,name] of Object.entries(AS_RIG)){
    const tpl=AS.lib[name];if(!tpl)continue;tpl.updateMatrixWorld(true);
    const inv=new T.Matrix4().copy(tpl.matrixWorld).invert(),B=asBones(tpl),P=n=>new T.Vector3().setFromMatrixPosition(m.multiplyMatrices(inv,B[n].matrixWorld));
    AS.rest[kind]=B.pelvis.position.clone();
    const frame=(bone,pos,y,z)=>{y.normalize();z.sub(y.clone().multiplyScalar(z.dot(y))).normalize();const x=new T.Vector3().crossVectors(y,z);
      const wq=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));
      const bm=new T.Matrix4().multiplyMatrices(inv,B[bone].matrixWorld),bq=new T.Quaternion(),bp=new T.Vector3(),bs=new T.Vector3();bm.decompose(bp,bq,bs);
      const lp=pos.clone().applyMatrix4(new T.Matrix4().copy(bm).invert());const lq=bq.clone().invert().multiply(wq);
      return{bone,pos:lp,quat:lq,scale:new T.Vector3(1/bs.x,1/bs.y,1/bs.z)}};
    const F=P('ball_l').add(P('ball_r')).sub(P('foot_l')).sub(P('foot_r'));F.y=0;F.normalize();AS.flip=AS.flip||{};AS.flip[kind]=F.z<0?Math.PI:0;
    const up=()=>new T.Vector3(0,1,0),fw=()=>F.clone();
    const head=P('Head');
    AS.anchor[kind]={
      head:frame('Head',head.clone().add(new T.Vector3(0,kind==='mann'?-.02:-.035,0)).addScaledVector(F,.015),up(),fw()),
      spine:frame('spine_03',P('spine_03'),up(),fw()),
      pelvis:frame('pelvis',P('pelvis'),up(),fw()),
      handR:frame('hand_r',P('hand_r').lerp(P('middle_01_r'),.62),P('lowerarm_r').sub(P('hand_r')),P('index_01_r').sub(P('pinky_01_r'))),
      handL:frame('hand_l',P('hand_l').lerp(P('middle_01_l'),.62),P('lowerarm_l').sub(P('hand_l')),P('index_01_l').sub(P('pinky_01_l'))),
      armL:frame('lowerarm_l',P('lowerarm_l').lerp(P('hand_l'),.55),P('lowerarm_l').sub(P('hand_l')),P('index_01_l').sub(P('pinky_01_l')))};
  }}
function asPrepClips(){
  const raw=AS.raw.anims.animations,base=AS.rest.mann||new T.Vector3();
  for(const kind of Object.keys(AS_RIG)){const d=AS.rest[kind]?AS.rest[kind].clone().sub(base):new T.Vector3(),out={};
    for(const c of raw){const tracks=c.tracks.map(t=>{if(t.name!=='pelvis.position'||kind==='mann')return t;const v=t.values.slice();for(let i=0;i<v.length;i+=3){v[i]+=d.x;v[i+1]+=d.y;v[i+2]+=d.z}return new T.VectorKeyframeTrack(t.name,t.times,v)});
      const cl=new T.AnimationClip(c.name,c.duration<.05?1:c.duration,tracks);out[c.name]=cl}
    AS.clips[kind]=out}}
function asClip(kind,key){const set=AS.clips[kind];if(!set)return null;if(set[key])return set[key];
  const [name,part]=key.split('|'),c=set[name];if(!c||!part)return null;
  const cl=new T.AnimationClip(key,c.duration,c.tracks.filter(t=>AS_LOWER.has(t.name.split('.')[0])===(part==='L')));set[key]=cl;return cl}
function asAnchor(model,a){const B=model.userData.bones,g=new T.Group();B[a.bone].add(g);g.position.copy(a.pos);g.quaternion.copy(a.quat);g.scale.copy(a.scale);return g}
const AS_HOODS=new Set(['hood']),AS_RANGER_HATS=new Set(['hood','helm','horned','dragonhelm','crown','elven']);
function asOutfit(o){
  if(o.skull)return{kind:'mann'};
  const fem=!!(o.fem||o.skirt),r=o.outfit||(o.armor||o.cape||AS_RANGER_HATS.has(o.hat)||o.ranger?'ranger':'peasant');
  const seed=((o.tunic||0)*7+(o.hair||0)*3+(o.skin||0))>>>0,vr=o.ovar!==undefined?o.ovar:seed%3===0?1:0;
  return{kind:fem?'female':'male',style:r,vr,hood:r==='ranger'&&o.hat==='hood',paul:!!o.armor}}
function makeSkinned(o){
  const out=asOutfit(o),kind=out.kind,tpl=AS.lib[AS_RIG[kind]];if(!tpl||!AS.clips[kind])return null;
  const model=T.SkeletonUtils.clone(tpl);model.userData.bones=asBones(model);model.rotation.y=AS.flip[kind]||0;
  /* parts and materials */
  if(kind!=='mann'){
    const show=n=>{if(n==='Ranger_Hood')return out.hood;if(n==='Ranger_Pauldron')return out.paul;return n.startsWith(out.style==='ranger'?'Ranger_':'Peasant_')};
    model.traverse(p=>{if(/^(Peasant|Ranger)_/.test(p.name)&&!p.isBone)p.visible=show(p.name.replace(/_\d+$/,''))});
  }
  const armorT=o.armor?(o.tunic||0x8a8f99):null,tint=armorT!==null?armorT:o.tunic,amt=o.armor?.62:o.magic?.55:o.tint!==undefined?o.tint:.34,skin=o.skin??SKINS[1];
  model.traverse(m=>{if(!m.isMesh)return;const src=m.material,n=src.name||'';
    if(kind==='mann'){m.material=asTinted(src,'sk'+(n.includes('Joint')?0:1),mm=>{mm.color.setHex(n.includes('Joint')?0x5a5244:(o.skin||0xdcd6c2));mm.roughness=.8})}
    else if(n.startsWith('MI_Regular')){m.material=asTinted(src,'skin'+skin,mm=>{mm.map=null;mm.color.setHex(skin)})}
    else{const feet=/Feet/.test(m.name||m.parent&&m.parent.name||''),t=feet&&o.boots?o.boots:tint,a2=feet&&o.boots?.6:amt,glow=feet&&o.bootGlow;
      m.material=asTinted(src,out.vr+'|'+t+'|'+a2+'|'+(glow||0),mm=>{if(out.vr&&(n==='MI_Peasant'||n==='MI_Ranger')){const tx=AS.tex[n==='MI_Peasant'?'peasant_2':'ranger_3'];if(tx)mm.map=tx}
        if(t!==undefined&&t!==null&&a2>0)asTint(mm,t,a2);if(glow){mm.emissive=new T.Color(glow);mm.emissiveIntensity=.7}})}
    m.castShadow=true;m.receiveShadow=true});
  const g=new T.Group(),rig=new T.Group();g.add(rig);rig.add(model);const s=o.scale||1;rig.scale.setScalar(s);
  /* procedural head (face, hair, beard, hat) on the head bone */
  const A=AS.anchor[kind],head=asAnchor(model,A.head),hand=asAnchor(model,A.handR),off=asAnchor(model,A.handL),arm=asAnchor(model,A.armL),spine=asAnchor(model,A.spine);
  const ho={...o};if(out.hood)ho.hat=null;const proc=_mh0(ho),ph=proc.head;proc.rig.remove(ph);ph.position.set(0,0,0);head.add(ph);
  if(kind==='mann'){ph.scale.setScalar(1.12)}else ph.scale.setScalar((out.hood?.78:.84)*(kind==='female'?.92:1));
  if(out.hood)ph.traverse(x=>{if(x.isMesh&&x.geometry&&x.geometry.type==='BoxGeometry'&&x.material!==undefined&&x.position.y>.2)x.visible=false});
  asMergeHead(ph);
  if(o.cape&&out.style!=='ranger'||o.cape&&o.hat==='crown'){const cp=mesh(bxg(.46,.9,.04),cm(o.cape),0,-.42,-.17);cp.rotation.x=.08;spine.add(cp)}
  if(o.amulet)spine.add(mesh(new T.SphereGeometry(.045,8,6),new T.MeshBasicMaterial({color:o.amulet}),0,-.04,.15,false));
  const dm=()=>new T.Object3D();
  const h={g,rig,model,torso:dm(),legL:dm(),legR:dm(),armL:dm(),armR:dm(),head:ph,headA:head,hand,off,arm,spine,phase:0,atk:0,draw:0,block:0,tunicMat:null,held:null,held2:null,
    sk:true,kind,scale:s,mixer:new T.AnimationMixer(model),acts:{},baseKey:'',baseName:'',upName:null,upAct:null,upOnce:false,upT:0,_atkLast:0,zombie:!!o.skull};
  g.traverse(m=>{if(m.isMesh)m.castShadow=true});
  skBase(h,'Idle_Loop',1);h.mixer.update(Math.random()*2);
  return h}
/* merge the many small head parts (nose, ears, hair, hat) into one mesh per material */
function asMergeHead(ph){if(!T.BufferGeometryUtils)return;const by=new Map();ph.updateMatrixWorld(true);const inv=new T.Matrix4().copy(ph.matrixWorld).invert();
  ph.traverse(m=>{if(!m.isMesh||!m.visible||Array.isArray(m.material)||m.children.length)return;let l=by.get(m.material);if(!l){l=[];by.set(m.material,l)}l.push(m)});
  for(const [mat,l] of by){if(l.length<2)continue;const gs=[];for(const m of l){const g=m.geometry.index?m.geometry.clone():null;if(!g)return;for(const k of Object.keys(g.attributes))if(!KIT.keep.has(k))g.deleteAttribute(k);if(!g.attributes.uv)continue;g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,m.matrixWorld));gs.push(g)}
    const geo=gs.length>1&&T.BufferGeometryUtils.mergeBufferGeometries(gs,false);if(!geo)continue;for(const m of l)m.parent.remove(m);const me=new T.Mesh(geo,mat);me.castShadow=true;ph.add(me)}}
/* animation layers: a full-body base clip, optionally split so an upper-body action can play on top */
function skAct(h,key){let a=h.acts[key];if(!a){const c=asClip(h.kind,key);if(!c)return null;a=h.acts[key]=h.mixer.clipAction(c)}return a}
function skStart(a,loop,clamp,ts,fade,sync){a.enabled=true;a.reset();a.setLoop(loop?T.LoopRepeat:T.LoopOnce,Infinity);a.clampWhenFinished=clamp;a.timeScale=ts;if(sync!=null)a.time=sync%a.getClip().duration;a.setEffectiveWeight(1);a.fadeIn(fade);a.play();return a}
function skBase(h,name,ts=1,once=false){
  const key=h.upName&&!AS_FULL.has(name)?name+'|L':name;
  if(h.baseKey===key){if(h.baseAct)h.baseAct.timeScale=ts;return}
  const a=skAct(h,key);if(!a)return;const prev=h.baseAct,same=h.baseName===name&&prev;
  skStart(a,!once,once,ts,same?.12:.24,same?prev.time:null);if(prev&&prev!==a)prev.fadeOut(same?.12:.24);
  h.baseAct=a;h.baseKey=key;h.baseName=name}
function skUpper(h,name,once,ts=1,fade=.1){
  const a=skAct(h,name+'|U');if(!a)return;const prev=h.upAct;skStart(a,!once,once,ts,fade,null);if(prev&&prev!==a)prev.fadeOut(fade);
  h.upAct=a;h.upName=name;h.upOnce=once;h.upT=once?a.getClip().duration/Math.max(.01,ts):0;if(h.baseName)skBase(h,h.baseName,h.baseAct?h.baseAct.timeScale:1)}
function skUpperStop(h,fade=.18){if(!h.upAct)return;h.upAct.fadeOut(fade);h.upAct=null;h.upName=null;h.upOnce=false;if(h.baseName)skBase(h,h.baseName,h.baseAct?h.baseAct.timeScale:1)}
function skOnce(h,name,dur){h.onceName=name;h.onceT=dur||((AS.clips[h.kind][name]||{duration:1}).duration)}
function animSkinned(h,dt,speed,o={}){
  const a=h.actor,isP=h===pm;
  h.rig.rotation.x=0;h.rig.position.y=0;
  let st,ts=1,once=false;const sc=h.scale||1,v=speed/sc;
  if(h.onceName&&(v>.4||h.onceT<=0))h.onceName=null;
  if(o.dead){st='Death01';once=true}
  else if(isP&&PL.roll){st='Roll';ts=2.4;once=true}
  else if(isP&&PL.swim||o.swim){st=v>.3?'Swim_Fwd_Loop':'Swim_Idle_Loop';h.rig.position.y=.42}
  else if(o.sit){st=isP&&PL.mounted||o.ride?'Driving_Loop':'Sitting_Idle_Loop';if(isP&&PL.mounted&&!(PL.mounted.model&&PL.mounted.model.gl))h.rig.position.y=.36}
  else if(isP&&!PL.onGround&&(PL.airT||0)>.18){st='Jump_Loop'}
  else if(h.onceName){st=h.onceName;once=true;h.onceT-=dt}
  else if(v>.2){if(h.zombie&&v<3.3){st='Zombie_Walk_Fwd_Loop';ts=clamp(v/1.25,.6,1.8)}else if(v<2.6){st=h.formal?'Walk_Formal_Loop':'Walk_Loop';ts=clamp(v/1.45,.55,1.75)}else if(v<5.4){st='Jog_Fwd_Loop';ts=clamp(v/3.7,.7,1.5)}else{st='Sprint_Loop';ts=clamp(v/6.6,.8,1.6)}}
  else if(o.work){st=h.workClip||'Farm_Harvest'}
  else if(a&&a.sayT>0&&!a.dead){st=h.sitTalk?'Sitting_Talking_Loop':'Idle_Talking_Loop'}
  else if(a&&(a.state==='chase'||a.state==='fight')&&h.wid){st='Sword_Idle'}
  else if(h.zombie){st='Zombie_Idle_Loop'}
  else st=h.idleClip||'Idle_Loop';
  skBase(h,st,ts,once);
  /* upper body: attacks, block, bow, fishing, work loops */
  if(h.atk>0&&(h._atkLast<=0||h.atk>h._atkLast+.01)&&!o.dead){
    const w=h.wid&&ITEMS[h.wid],k=h.atkKind;let c;
    if(k==='chop')c='TreeChopping_Loop';else if(!w)c=h._alt?'Punch_Cross':'Punch_Jab';else if(w.kind==='axe')c=h._alt?'Sword_Attack':'Sword_Regular_B';else if(k==='stab'||w.kind==='dagger')c='Sword_Regular_A';else c=h._alt?'Sword_Regular_B':'Sword_Regular_A';
    h._alt=!h._alt;const cl=asClip(h.kind,c),dur=Math.max(.25,h.atkT||.5);if(cl)skUpper(h,c,true,cl.duration/(dur*(c==='Sword_Attack'?.9:1.25)),.06)}
  h._atkLast=h.atk;if(h.atk>0)h.atk-=dt;
  if(h.upOnce){h.upT-=dt;if(h.upT<=.06)skUpperStop(h,.16)}
  if(!h.upOnce&&!o.dead){let want=null;
    if(h.block>0)want='Idle_Shield_Loop';else if(h.draw>0)want='Pistol_Aim_Neutral';else if(isP&&PL.fishing)want='Spell_Simple_Idle_Loop';
    else if(h.upperLoop&&v<.3&&!(a&&a.sayT>0))want=h.upperLoop;
    if(want&&h.upName!==want)skUpper(h,want,false,1,.15);else if(!want&&h.upName)skUpperStop(h)}
  if(h.g.visible!==false||isP)h.mixer.update(dt)}
function skHit(h){if(h&&h.sk&&!h.upOnce&&h.atk<=0)skUpper(h,Math.random()<.5?'Hit_Chest':'Hit_Head',true,1.3,.05)}

/* ---------- Weapons: bronze sword, axe, pickaxe and wooden shield from the props kit ---------- */
function asWeapon(id){
  const it=ITEMS[id]||{};let n=null,s=1,ry=0,col=it.col,glow=0;
  if(it.kind==='sword'){n='Sword_Bronze';s=.92}else if(it.kind==='dagger'){n='Sword_Bronze';s=.5}else if(it.kind==='axe'){n='Axe_Bronze';s=id==='club_troll'?1.35:id==='axe_war'?1.2:1}
  else if(it.kind==='shield'){n='Shield_Wooden';s=it.round?1.25:1.15}
  if(!n||!AS.lib[n])return null;
  const g=new T.Group(),o=AS.lib[n].clone();
  if(col||id==='sword_flame'||id==='club_troll')o.traverse(m=>{if(!m.isMesh)return;m.material=asTinted(m.material,'w'+id,mm=>{if(col)asTint(mm,col,it.kind==='shield'?.5:.55);if(id==='sword_flame'){mm.emissive=new T.Color(0xff5a10);mm.emissiveIntensity=.55}if(id==='club_troll')asTint(mm,0x6a5a3a,.6)})});
  o.scale.setScalar(s);
  if(it.kind==='shield'){o.rotation.y=Math.PI/2;g.add(o)}
  else{o.rotation.x=Math.PI/2;g.add(o)}
  g.traverse(m=>{if(m.isMesh)m.castShadow=true});return g}

/* ---------- Hooks: characters ---------- */
const _mh0=makeHuman;
makeHuman=function(o={}){if(AS.ok&&!o.proc){try{const h=makeSkinned(o);if(h)return h}catch(e){console.warn('skinned character failed',e)}}return _mh0(o)};
const _ah0=animHuman;
animHuman=function(h,dt,speed,o={}){if(h&&h.sk)return animSkinned(h,dt,speed,o);return _ah0(h,dt,speed,o)};
const _wm0=weaponMesh;
weaponMesh=function(id){if(AS.ok){try{const g=asWeapon(id);if(g)return g}catch(e){console.warn(e)}}return _wm0(id)};
const _sh0=setHeld;
setHeld=function(h,wid,sid){_sh0(h,wid,sid);if(!h.sk)return;if(h.held3)h.held3.position.set(.07,.02,0);if(h.held2){h.held2.position.set(0,0,0);h.held2.rotation.set(0,Math.PI/2,0)}};
const _ba0=baseActor;
baseActor=function(o){const a=_ba0(o),h=a.h;if(h&&h.sk){h.actor=a;asRole(a)}return a};
function asRole(a){const h=a.h,j=a.job,r=Math.random();
  if(a.kind==='npc'){
    if(j==='guard'||j==='lord')h.idleClip=r<.55?'Idle_FoldArms_Loop':'Idle_Loop';
    else if(j==='innkeeper'||j==='merchant'&&a.ai==='stay'&&r<.5)h.idleClip='Idle_Rail_Loop';
    else if(j==='witch')h.idleClip='Spell_Simple_Idle_Loop';
    else if(j==='child'&&r<.35)h.idleClip='Dance_Loop';
    if(j==='smith'&&a.ai==='stay')h.upperLoop='TreeChopping_Loop';
    if(j==='priest'||j==='lord')h.formal=true;
    if(j==='farmer')h.workClip=pick(['Farm_Harvest','Farm_PlantSeed','Farm_Watering']);
  }else if(a.kind==='enemy'){if(a.type==='goblin')h.idleClip='Crouch_Idle_Loop'}}
const _ha0=hitActor;
hitActor=function(a,dmg,byPlayer,dir){const alive=!a.dead;_ha0(a,dmg,byPlayer,dir);if(alive&&!a.dead&&a.h)skHit(a.h)};
const _dp0=damagePlayer;
damagePlayer=function(d,src){const hp=PL.hp;_dp0(d,src);if(PL.hp<hp&&pm&&!PL.dead)skHit(pm)};
const _sa0=swingAnim;
swingAnim=function(){_sa0();if(pm&&pm.sk){pm.atkKind='chop';pm.atkT=.62;pm.atk=.62}};
const _ui0=useItem;
useItem=function(id){const n=PL.inv[id]||0;_ui0(id);const it=ITEMS[id];if(pm&&pm.sk&&it&&it.g==='food'&&(PL.inv[id]||0)<n)skUpper(pm,'Consume',true,1.6,.1)};
const _oc0=openChest;
openChest=function(c){const was=c.open;_oc0(c);if(!was&&c.open){asChestOpen(c);if(pm&&pm.sk)skOnce(pm,'Chest_Open',1.2)}};
const _tp0=takePickup;
takePickup=function(p){_tp0(p);if(pm&&pm.sk)skUpper(pm,'PickUp_Table',true,1.4,.08)};
{const r0=$('respawn').onclick;$('respawn').onclick=e=>{r0(e);if(pm&&pm.sk)skOnce(pm,'LayToIdle',1.5)}}
const _upA=updatePlayer;
updatePlayer=function(dt){_upA(dt);if(!pm)return;PL.airT=PL.onGround?0:(PL.airT||0)+dt;
  if(PL.dead&&pm.sk)animSkinned(pm,dt,0,{dead:true});
  if(pm.sk&&PL.swim)pm.rig.position.y=.42};

/* ---------- Chests (animated lid) ---------- */
function asChestOpen(c){if(!c.mixer||!AS.chest.length)return;const cl=AS.chest.find(x=>x.name==='Chest_Open');if(!cl)return;const a=c.mixer.clipAction(cl);a.setLoop(T.LoopOnce,1);a.clampWhenFinished=true;a.reset().play();c.animT=1.2}
const _mc0=makeChest;
makeChest=function(x,z,loot,rot=0,name='Kist'){
  if(!AS.ok||!AS.lib.Chest_Wood)return _mc0(x,z,loot,rot,name);
  const g=new T.Group(),y=groundH(x,z);g.position.set(x,y,z);g.rotation.y=rot;const o=T.SkeletonUtils.clone(AS.lib.Chest_Wood);o.scale.setScalar(.85);g.add(o);g.userData.dyn=true;scene.add(g);
  const c={x,z,y,g,lid:new T.Object3D(),loot,open:false,name,mixer:new T.AnimationMixer(o),animT:0};chests.push(c);addCircle(x,z,.6);return c};
ANIMS.push(dt=>{for(const c of chests)if(c.animT>0&&c.mixer){c.animT-=dt;c.mixer.update(dt)}});


/* ---------- Houses: Medieval Village MegaKit modules (2 m wide, 3.12 m high walls) ---------- */
const KIT={W:2,H:3.12,keep:new Set(['position','normal','uv'])};
function kitBox(n){if(AS.bbox&&AS.bbox[n])return AS.bbox[n];AS.bbox=AS.bbox||{};const t=AS.lib[n];if(!t)return null;t.updateMatrixWorld(true);return AS.bbox[n]=new T.Box3().setFromObject(t)}
/* collects transformed module geometry per material and merges it into one mesh per material */
function kitBatch(){const B=new Map(),m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),one=new T.Vector3(1,1,1);
  return{add(n,x,y,z,ry=0,sx=1,sy=1,sz=1,matFn){const t=AS.lib[n];if(!t)return false;t.updateMatrixWorld(true);m4.compose(new T.Vector3(x,y,z),q.setFromEuler(e.set(0,ry,0)),new T.Vector3(sx,sy,sz));
      t.traverse(o=>{if(!o.isMesh)return;let mat=o.material;if(matFn)mat=matFn(mat)||mat;let l=B.get(mat);if(!l){l=[];B.set(mat,l)}l.push([o.geometry,new T.Matrix4().multiplyMatrices(m4,o.matrixWorld)])});return true},
    build(parent,shadow=true){for(const [mat,l] of B){const gs=l.map(([g,m])=>{const c=g.clone();for(const k of Object.keys(c.attributes))if(!KIT.keep.has(k))c.deleteAttribute(k);
        if(!c.attributes.uv)c.setAttribute('uv',new T.BufferAttribute(new Float32Array(c.attributes.position.count*2),2));if(!c.index){const ix=[];for(let i=0;i<c.attributes.position.count;i++)ix.push(i);c.setIndex(ix)}c.applyMatrix4(m);return c});
      const geo=T.BufferGeometryUtils.mergeBufferGeometries(gs,false);if(!geo)continue;geo.computeBoundingSphere();const me=new T.Mesh(geo,mat);me.castShadow=shadow;me.receiveShadow=true;parent.add(me)}B.clear()}}}
const KIT_WIN={Wide_Flat:['Window_Wide_Flat1','WindowShutters_Wide_Flat_Open','WindowShutters_Wide_Flat_Closed'],Thin_Round:['Window_Thin_Round1','WindowShutters_Thin_Round_Open','WindowShutters_Thin_Round_Closed'],Wide_Round:['Window_Wide_Round1','WindowShutters_Wide_Round_Open','WindowShutters_Wide_Round_Closed']};
const kitGlass=m=>m&&m.name==='MI_WindowGlass'?MAT.window:null;
function kitHouse(o){
  const R=mulberry(Math.round(o.x*131+o.z*71)|0),rp=a=>a[Math.floor(R()*a.length)];
  const brick=o.style==='stone',grid=o.style==='wood',ruin=o.name==='Verwoeste zaal';
  const nx=Math.max(2,Math.round((o.w||7)/2)),nz=Math.max(2,Math.round((o.d||6)/2)),w=nx*2,d=nz*2,fl=ruin?1:Math.max(1,Math.round((o.h||3.2)/3.1)),h=fl*KIT.H;
  const rot=o.rot||0,th=rot*Math.PI/2,base=.03;let gy=-1e9,gmin=1e9;{const c=Math.cos(th),sn=Math.sin(th);for(const [ax,az] of[[0,0],[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]]){const lx=ax*w/2,lz=az*d/2,hh=_gh0(o.x+lx*c+lz*sn,o.z-lx*sn+lz*c);gy=Math.max(gy,hh);gmin=Math.min(gmin,hh)}}
  const dc=clamp(Math.round(((o.doorX||0)+w/2-1)/2),0,nx-1),doorX=-w/2+1+dc*2;
  const b={x:o.x,z:o.z,w,d,h,th,rot,kind:houseKind(o),name:o.name||'Huis',y:gy,roof:null,inside:false,doorX,kit:true};
  const g=new T.Group();g.position.set(o.x,gy,o.z);g.rotation.y=th;scene.add(g);b.group=g;
  const fh=1.4+(gy-gmin);g.add(mapBox(w+.7,fh,d+.7,MAT.stone,0,.03-fh/2,0));
  const W=brick?'Wall_UnevenBrick_':'Wall_Plaster_',wt=rp(['Wide_Flat','Wide_Flat','Thin_Round','Wide_Round']),round=R()<.5,doorKind=round?'Round':'Flat';
  const plain=f=>grid?'Wall_Plaster_WoodGrid':brick?'Wall_UnevenBrick_Straight':f===0?'Wall_Plaster_Straight_Base':'Wall_Plaster_Straight';
  const shut=rp([1,1,2,0]),bt=kitBatch(),walls=[];
  const side=(n,px,pz,ry,ax,az,front)=>{for(let i=0;i<n;i++){const u=-n+1+i*2,x=px+ax*u,z=pz+az*u,lx=front?u:0;
      for(let f=0;f<fl;f++){const y=base+f*KIT.H;if(ruin&&f===0&&R()<.28&&!(front&&i===dc)){walls.push([x,z,ry,'gap']);continue}
        let n2;const door=front&&f===0&&i===dc;
        if(door)n2=W+'Door_'+doorKind;else if((R()<(f>0?.7:.5))&&!(ruin&&R()<.5))n2=W+'Window_'+wt;else n2=plain(f);
        bt.add(n2,x,y,z,ry,1,1,1,kitGlass);
        if(n2.includes('Window_')&&!ruin){const wn=KIT_WIN[wt];bt.add(wn[0],x,y,z,ry,1,1,1,kitGlass);if(shut&&R()<.75)bt.add(wn[shut],x,y,z,ry)}
        if(door){const dn='Door_'+rp(['1','2','4','8'])+'_'+doorKind,dg=AS.lib[dn];if(dg){const dd=dg.clone();const c=Math.cos(ry),sn=Math.sin(ry);dd.position.set(x+c*-.56+sn*-.06,y,z-sn*-.56+c*-.06);dd.rotation.y=ry+1.75;g.add(dd)}}
        if(f===0)walls.push([x,z,ry,door?'door':'wall'])}}};
  side(nx,0,d/2-.1,0,1,0,true);side(nx,0,-d/2+.1,Math.PI,-1,0,false);side(nz,-w/2+.1,0,-Math.PI/2,0,-1,false);side(nz,w/2-.1,0,Math.PI/2,0,1,false);
  for(const [cx,cz] of[[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]])for(let f=0;f<fl;f++)bt.add(brick?'Corner_Exterior_Brick':'Corner_Exterior_Wood',cx,base+f*KIT.H,cz,0);
  const floorN=b.kind==='church'||b.kind==='hall'?'Floor_Brick':R()<.5?'Floor_WoodDark':'Floor_WoodLight';
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)bt.add(floorN,-w/2+1+i*2,base+.02,-d/2+1+j*2);
  if(ruin){for(let k=0;k<5;k++)bt.add('Prop_Vine'+rp(['1','2','4','5','6']),rnd(-w/2,w/2),2.6,(R()<.5?-1:1)*(d/2+.05),0)}
  bt.build(g);
  /* collisions per ground-floor module */
  for(const [x,z,ry,k] of walls){if(k==='gap')continue;const along=Math.abs(Math.sin(ry))<.5,hw=along?1:.22,hd=along?.22:1;
    if(k==='door'){const o1=.62;if(along){colLocal(b,x-1,z-hd,x-o1,z+hd);colLocal(b,x+o1,z-hd,x+1,z+hd)}else{colLocal(b,x-hw,z-1,x+hw,z-o1);colLocal(b,x-hw,z+o1,x+hw,z+1)}}
    else colLocal(b,x-hw,z-hd,x+hw,z+hd)}
  /* roof with gables */
  const roof=new T.Group();roof.position.y=base+h;g.add(roof);b.roof=roof;
  const RW=w<=5?4:w<=7?6:8,DS={4:[4,6,8],6:[4,6,8,10,12,14],8:[8,10,12,14]}[RW],RD=DS.reduce((a,c)=>Math.abs(c-d)<Math.abs(a-d)?c:a);
  const rn='Roof_RoundTiles_'+RW+'x'+RD,bb=kitBox(rn);let ridge=3;
  if(bb){const sx=w/RW,sz=d/RD,sy=Math.min(1.35,.55+sx*.45),rb=kitBatch(),thatch=o.roof!=='tile';
    const rm=m=>m&&m.name==='MI_RoundTiles'&&thatch?asTinted(m,'thatch',mm=>asTint(mm,0xc2a060,.72)):null;
    rb.add(rn,-(bb.min.x+bb.max.x)/2*sx,0,-(bb.min.z+bb.max.z)/2*sz,0,sx,sy,sz,rm);
    const gn='Roof_Front_Brick'+RW;if(AS.lib[gn]){rb.add(gn,0,0,d/2-.1,0,sx,sy,1);rb.add(gn,0,0,-d/2+.1,Math.PI,sx,sy,1)}
    ridge=bb.max.y*sy;
    if(!ruin&&AS.lib.Prop_Chimney){const cx=w*.24,cz=-d*.18,cy=ridge*.32;rb.add(R()<.5?'Prop_Chimney':'Prop_Chimney2',cx,cy,cz,0);const q=l2w(b,cx,cz);b.chim=[q[0],gy+base+h+cy+3.3,q[1]]}
    rb.build(roof)}
  /* lantern by the door, interior spots, furniture */
  const lx=doorX+(doorX+1.6<w/2?1.05:-1.05),[wx,wz]=l2w(b,lx,d/2+.42);
  if(AS.lib.Lantern_Wall){const ln=AS.lib.Lantern_Wall.clone();ln.scale.setScalar(.55);ln.position.set(lx,1.55,d/2);g.add(ln)}
  lamp(wx,gy+1.95,wz);
  b.spots=[l2w(b,0,0),l2w(b,0,-d/2+1.5),l2w(b,-w/4,0),l2w(b,w/4,0)];
  b.doorPos=l2w(b,doorX,d/2+1.2);b.counter=l2w(b,0,-d/2+2.2);b.doorLocal=[doorX,d/2];
  const inner=new T.Group();g.add(inner);b.inner=inner;
  furnishKit(b,inner);if(b.kind==='shop'||b.kind==='smith'||b.kind==='inn')hangingSign(b,g,b.name);b.fy=gy+base+.04;asFloorAdd(b);BUILDINGS.push(b);return b}

/* ---------- Furniture from the Fantasy Props MegaKit ---------- */
function asPropIn(n,parent,x,y,z,ry,s){const o=asProp(n,parent,x,y,z,ry,s);if(o)o.traverse(m=>{if(m.isMesh)m.castShadow=false});return o}
function asProp(n,parent,x,y,z,ry=0,s=1){const t=AS.lib[n];if(!t)return null;const o=(t.getObjectByProperty('type','SkinnedMesh')?T.SkeletonUtils.clone(t):t.clone());o.position.set(x,y,z);o.rotation.y=ry;if(s!==1)o.scale.setScalar(s);(parent||scene).add(o);return o}
function asPropW(n,x,z,ry=0,s=1,col=0){const o=asProp(n,scene,x,groundH(x,z),z,ry,s);if(o&&col)addCircle(x,z,col);return o}
function furnishKit(b,g){
  const w=b.w,d=b.d,k=b.kind,R=mulberry(Math.round(b.x*7+b.z*3)|0),y=.06,P=(n,x,z,ry=0,s=1,yy=y)=>asPropIn(n,g,x,yy,z,ry,s),C=(x0,z0,x1,z1)=>colLocal(b,x0,z0,x1,z1);
  const table=(x,z,s=.62,stools=true)=>{P('Table_Large',x,z,0,s);C(x-1.42*s,z-.55*s,x+1.42*s,z+.55*s);if(stools){P('Stool',x-.5,z+.75,0,.9);P('Stool',x+.5,z-.75,0,.9)}if(R()<.7)P('Mug',x+.2,z,0,1,y+.81*s);if(R()<.6)P('Table_Plate',x-.3,z+.1,0,1,y+.81*s)};
  const bed=(x,z,ry=0)=>{P(R()<.5?'Bed_Twin1':'Bed_Twin2',x,z,ry,.82);C(x-.8,z-1,x+.8,z+1)};
  if(k==='home'){table(w/4,0);bed(-w/2+1.05,-d/2+1.25);P('Nightstand_Shelf',-w/2+2.25,-d/2+.35,0,.85);P('Chest_Wood',w/2-.9,-d/2+.6,0,.7);C(w/2-1.4,-d/2+.2,w/2-.4,-d/2+1);
    P('Barrel',w/2-.6,d/2-1.2);C(w/2-.95,d/2-1.55,w/2-.25,d/2-.85);if(R()<.6)P('Pot_1_Lid',w/2-.6,d/2-1.2,0,.8,y+.9);if(R()<.7)P('Bucket_Wooden_1',-w/2+.6,d/2-1.1);if(R()<.5)P('Shelf_Simple',-w/2+.25,0,Math.PI/2,1,1.6)}
  if(k==='shop'){const cw=Math.min(w-3,4.5);P('Workbench',-cw/4,-d/2+3,Math.PI,cw/4.04);P('Workbench',cw/4,-d/2+3,Math.PI,cw/4.04);C(-cw/2,-d/2+2.5,cw/2,-d/2+3.5);
    P('Shelf_Small_Bottles',-1.2,-d/2+.32,0,1,1.3);P('Bookcase_2',1.2,-d/2+.3,0,.8);P('Cabinet',-w/2+1,-d/2+.3,0,.8);P('FarmCrate_Apple',-cw/4,-d/2+3,0,1,y+.89);P('FarmCrate_Carrot',cw/4,-d/2+3.05,0,.8,y+.89);
    P('Barrel_Apples',-w/2+.8,-d/2+1.4);P('Barrel',w/2-.8,-d/2+1.2);C(-w/2+.45,-d/2+1.05,-w/2+1.15,-d/2+1.75);C(w/2-1.15,-d/2+.85,w/2-.45,-d/2+1.55);P('Chest_Wood',w/2-1,d/2-1.5,Math.PI,.75);C(w/2-1.5,d/2-1.8,w/2-.5,d/2-1.2);P('Bag',w/2-1.8,d/2-1.2,0,.6)}
  if(k==='smith'){P('Anvil_Log',0,-d/2+3,0,1);C(-.45,-d/2+2.6,.45,-d/2+3.4);P('Whetstone',w/2-1.1,-d/2+1.2,-Math.PI/2,.9);C(w/2-1.6,-d/2+.7,w/2-.6,-d/2+1.7);P('WeaponStand',-w/2+1.2,d/2-1.4,Math.PI,.9);C(-w/2+.5,d/2-1.9,-w/2+1.9,d/2-.9);
    P('Workbench',w/2-1.2,d/2-1.2,Math.PI,.8);C(w/2-2,d/2-1.6,w/2-.4,d/2-.8);P('Bucket_Metal',1.2,-d/2+2.6);P('Barrel',-w/2+.7,-d/2+3);
    add2(g,mapBox(1.4,.9,.8,MAT.stone,-w/2+1.2,.5,-d/2+1.2));C(-w/2+.5,-d/2+.8,-w/2+1.9,-d/2+1.6);const f=mesh(new T.SphereGeometry(.28,8,6),new T.MeshBasicMaterial({color:0xff7a2a}),-w/2+1.2,1.1,-d/2+1.2,false);g.add(f);f.userData.dyn=true;LAMPS.push({x:b.spots[0][0],y:b.y+1.4,z:b.spots[0][1],flame:f,local:true})}
  if(k==='inn'){for(let i=0;i<3;i++){const x=-w/4+i*w/4.5;P('Table_Large',x,1.2,0,.55);C(x-.8,.9,x+.8,1.5);P('Bench',x,1.2+.85,0,.55);P('Bench',x,1.2-.85,Math.PI,.55);P('Mug',x+.2,1.2,0,1,y+.45);P('Mug',x-.3,1.25,1,1,y+.45);if(i===1)P('CandleStick_Triple',x,1.15,0,.8,y+.45)}
    P('Workbench',-1.1,-d/2+1.2,Math.PI,1);P('Workbench',1.1,-d/2+1.2,Math.PI,1);C(-(w-2)/2,-d/2+.85,(w-2)/2,-d/2+1.55);P('Barrel_Holder',0,-d/2+.4,0,.9);P('Barrel',-w/2+.8,-d/2+.8);P('Barrel',w/2-.8,-d/2+.8);
    bed(w/2-1,-d/2+3.5,Math.PI/2);bed(w/2-1,-d/2+6,Math.PI/2);P('Chandelier',0,0,0,.8,b.h-.1)}
  if(k==='hall'){P('Table_Large',0,0,0,1.6);C(-2.3,-.9,2.3,.9);for(const s of[-1,1])for(let i=-1;i<=1;i++)P('Chair_1',i*1.3,s*1.25,s>0?Math.PI:0,1);
    P('Chair_1',0,-d/2+1.6,0,1.5);C(-.5,-d/2+1.2,.5,-d/2+2);for(const s of[-1,1]){P(s<0?'Banner_1':'Banner_2',s*(w/2-.3),-1,s*-Math.PI/2,1.1,3.6);P('CandleStick_Stand',s*2.2,-d/2+1.5,0,1)}
    P('Chandelier',0,0,0,1.1,b.h-.1);P('Bookcase_2',-w/2+1,d/2-.4,Math.PI,.9)}
  if(k==='church'){add2(g,mapBox(3,.3,1.6,MAT.stone,0,.2,-d/2+1.5));add2(g,mapBox(1.4,1.1,.7,MAT.stone,0,.7,-d/2+1.2));P('BookStand',0,-d/2+2.6,Math.PI,.8);for(const s of[-1,1])P('CandleStick_Stand',s*1.8,-d/2+1.2,0,1);
    for(let i=0;i<4;i++)for(const s of[-1,1]){P('Bench',s*2,-d/2+5+i*2.6,0,.62);C(s*2-.86,-d/2+4.85+i*2.6,s*2+.86,-d/2+5.15+i*2.6)}}}
function add2(g,m){g.add(m);return m}
const _mkh0=makeHouse;
makeHouse=function(o){if(AS.ok&&AS.lib.Wall_Plaster_Straight&&T.BufferGeometryUtils){try{return kitHouse(o)}catch(e){console.warn('kit house failed',e)}}return _mkh0(o)};
/* tower roofs */
const _tw0=tower;
tower=function(x,z,r,h,roofOn=true,mat=MAT.stone){if(!AS.ok||!AS.lib.Roof_Tower_RoundTiles||!roofOn)return _tw0(x,z,r,h,roofOn,mat);_tw0(x,z,r,h,false,mat);
  const bb=kitBox('Roof_Tower_RoundTiles'),s=r*2.75/(bb.max.x-bb.min.x);asProp('Roof_Tower_RoundTiles',scene,x,groundH(x,z)+h+.45-bb.min.y*s,z,0,s)};
/* culling: interiors up close, character shadows only near the player, far characters hidden */
let asCullT=0;
ANIMS.push(dt=>{
  const spA=window.WD&&WD.kingdom&&WD.kingdom.spec&&WD.kingdom.spec.a;   /* who you watch (and those around him) stay visible */
  for(const a of actors)if(a.h&&a.h.sk&&a.root.visible&&!a.rider){const dd=Math.abs(a.x-PL.x)+Math.abs(a.z-PL.z);if(dd>150&&!(spA&&Math.abs(a.x-spA.x)+Math.abs(a.z-spA.z)<160))a.root.visible=false}
  asTreesUpdate(false);
  asCullT-=dt;if(asCullT>0)return;asCullT=.5;asChunkCull();
  for(const b of BUILDINGS)if(b.inner)b.inner.visible=Math.abs(b.x-PL.x)<48&&Math.abs(b.z-PL.z)<48&&!PL.inCave;
  for(const a of actors){const h=a.h;if(!h||!h.sk)continue;const near=Math.abs(a.x-PL.x)+Math.abs(a.z-PL.z)<46;if(h.shadowOn!==near){h.shadowOn=near;h.g.traverse(o=>{if(o.isMesh)o.castShadow=near})}}});


/* ---------- Nature: Stylized Nature MegaKit ---------- */
const AS_DET=[{tree:45,dist:.6,grass:22},{tree:75,dist:1,grass:30},{tree:115,dist:1.5,grass:38}];
const asDet=()=>AS_DET[clamp(SET.detail===undefined?1:SET.detail,0,2)];
/* geometry of a model with its node transforms baked in, one entry per material */
function asParts(n){AS.parts=AS.parts||{};if(AS.parts[n])return AS.parts[n];const t=AS.lib[n];if(!t)return null;t.updateMatrixWorld(true);const out=[];
  t.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh)return;const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);for(const k of Object.keys(g.attributes))if(!['position','normal','uv','color'].includes(k))g.deleteAttribute(k);g.computeBoundingSphere();out.push({g,m:o.material})});
  return AS.parts[n]=out}
const AS_WIND=new Map();
function asWindMat(m,amp){const k=m.uuid+amp;let w=AS_WIND.get(k);if(!w){w=addWind(m.clone(),amp);AS_WIND.set(k,w)}return w}
/* scatter many copies as instanced meshes, split in chunks so the renderer can cull them */
const AS_CH=[];
function asScatter(n,items,o={}){
  const parts=asParts(n);if(!parts||!items.length)return[];const CS=o.chunk||220,groups=new Map(),dm=new T.Object3D(),res=[],rad=o.rad||3;
  for(const it of items){const k=Math.floor(it.x/CS)*9999+Math.floor(it.z/CS);let a=groups.get(k);if(!a){a=[];groups.set(k,a)}a.push(it)}
  for(const list of groups.values()){let cx=0,cy=0,cz=0;for(const it of list){cx+=it.x;cy+=it.y;cz+=it.z}cx/=list.length;cy/=list.length;cz/=list.length;let r=0;for(const it of list)r=Math.max(r,Math.hypot(it.x-cx,it.z-cz)+(it.s||1)*rad);
    const meshes=parts.map(p=>{const g=new T.BufferGeometry();for(const [an,at] of Object.entries(p.g.attributes))g.setAttribute(an,at);g.setIndex(p.g.index);g.boundingSphere=new T.Sphere(new T.Vector3(cx,cy,cz),r+12);
      const mat=o.wind&&p.m.alphaTest>0?asWindMat(p.m,o.wind):p.m,im=new T.InstancedMesh(g,mat,list.length);im.castShadow=!!o.shadow;im.receiveShadow=true;scene.add(im);return im});
    list.forEach((it,i)=>{dm.position.set(it.x,it.y,it.z);dm.rotation.set(it.tx||0,it.ry||0,it.tz||0);const s=it.s||1;dm.scale.set(s,s*(it.sy||1),s);dm.updateMatrix();for(const im of meshes)im.setMatrixAt(i,dm.matrix);it.inst=meshes[0];it.i=i});
    const ch={x:cx,z:cz,r,meshes,max:o.maxD||1e9};AS_CH.push(ch);res.push(ch)}
  return res}
function asChunkCull(){const k=asDet().dist;for(const c of AS_CH){const v=Math.hypot(c.x-PL.x,c.z-PL.z)-c.r<c.max*k&&!PL.inCave;if(c.vis!==v){c.vis=v;for(const m of c.meshes)m.visible=v}}}
const pickW=(R,list)=>{let t=0;for(const [,w] of list)t+=w;let x=R*t;for(const [n,w] of list){x-=w;if(x<=0)return n}return list[0][0]};

/* trees: real models near the player, the light procedural trees further away */
const TLOD={on:false,oak:[],pine:[],near:[],last:{x:1e9,z:1e9},t:0};
const _asDm=new T.Object3D();
function asTreesInit(){
  const mk=n=>{const parts=asParts(n);if(!parts)return null;return parts.map(p=>{const mat=p.m.alphaTest>0?asWindMat(p.m,.022):p.m,im=new T.InstancedMesh(p.g,mat,520);im.count=0;im.frustumCulled=false;im.castShadow=true;im.receiveShadow=true;scene.add(im);return im})};
  TLOD.oak=[1,2,3,4,5].map(i=>mk('CommonTree_'+i)).filter(Boolean);TLOD.pine=[1,2,3,4,5].map(i=>mk('Pine_'+i)).filter(Boolean);
  if(!TLOD.oak.length||!TLOD.pine.length)return;
  for(const t of TREES.oak.concat(TREES.pine)){t.lodM=(t.ii||[]).map(([inst,k])=>{const m=new T.Matrix4();inst.getMatrixAt(k,m);return m});t.v=Math.floor(hash2(Math.round(t.x*5),Math.round(t.z*5))*5)}
  TLOD.on=true}
function asLow(t,show){const L=t.ii||[];for(let n=0;n<L.length;n++){const [inst,k]=L[n];inst.setMatrixAt(k,show?t.lodM[n]:ZERO);inst.instanceMatrix.needsUpdate=true}}
window.TLOD=TLOD;window.asLow=(t,v)=>asLow(t,v);window.asParts=n=>asParts(n);window.asTreesUpdate=f=>asTreesUpdate(f);
function asTreesUpdate(force){
  if(!TLOD.on)return;const R=asDet().tree;TLOD.t-=1;if(!force&&TLOD.t>0&&Math.hypot(PL.x-TLOD.last.x,PL.z-TLOD.last.z)<6)return;
  TLOD.t=90;TLOD.last.x=PL.x;TLOD.last.z=PL.z;ensureTreeGrid();const near=[];
  if(!PL.inCave)for(let i=Math.floor((PL.x-R)/24);i<=Math.floor((PL.x+R)/24);i++)for(let j=Math.floor((PL.z-R)/24);j<=Math.floor((PL.z+R)/24);j++){const a=treeGrid.get(i*4096+j);if(!a)continue;for(const t of a)if(!t.cut&&Math.hypot(t.x-PL.x,t.z-PL.z)<R)near.push(t)}
  const set=new Set(near);for(const t of TLOD.near)if(!set.has(t)&&!t.cut)asLow(t,true);
  for(const v of TLOD.oak.concat(TLOD.pine))for(const im of v)im.count=0;
  for(const t of near){const v=(t.pine?TLOD.pine:TLOD.oak)[t.v%5];if(!v){continue}const c=v[0].count;if(c>=520){asLow(t,true);set.delete(t);continue}
    asLow(t,false);_asDm.position.set(t.x,t.y-.12,t.z);_asDm.rotation.set(0,t.r,0);_asDm.scale.setScalar(t.s*(t.pine?.92:.98));_asDm.updateMatrix();for(const im of v){im.setMatrixAt(c,_asDm.matrix);im.count=c+1}}
  for(const v of TLOD.oak.concat(TLOD.pine))for(const im of v)im.instanceMatrix.needsUpdate=true;
  TLOD.near=near.filter(t=>set.has(t))}
const _ct0=chopTree;
chopTree=function(t){if(TLOD.on&&!t.cut&&TLOD.near.includes(t))asLow(t,true);_ct0(t);asTreesUpdate(true)};
const _bfo0=buildForests;
buildForests=function(){_bfo0();if(AS.ok){try{asImpostors()}catch(e){console.warn('tree impostors',e)}try{asTreesInit()}catch(e){console.warn('tree LOD',e)}}};


/* far trees: the same asset trees, pre-rendered from two sides into a texture (impostors) */
function asImpostors(){
  const VAR=[...[1,2,3,4,5].map(i=>'CommonTree_'+i),...[1,2,3,4,5].map(i=>'Pine_'+i)];if(VAR.some(n=>!AS.lib[n]))return false;
  const RS=2048,CW=RS/5,CH=RS/4,rt=new T.WebGLRenderTarget(RS,RS,{format:T.RGBAFormat});rt.texture.generateMipmaps=true;rt.texture.minFilter=T.LinearMipmapLinearFilter;rt.texture.encoding=T.LinearEncoding;
  const sc=new T.Scene();sc.add(new T.AmbientLight(0xffffff,.82));const dl=new T.DirectionalLight(0xffffff,.35);dl.position.set(.4,1,.7);sc.add(dl);
  const prevC=renderer.getClearColor(new T.Color()),prevA=renderer.getClearAlpha(),cam=new T.OrthographicCamera(-1,1,1,-1,-100,100),geos=[];
  renderer.setRenderTarget(rt);rt.scissorTest=true;
  VAR.forEach((n,vi)=>{const o=AS.lib[n].clone();sc.add(o);const bb=new T.Box3().setFromObject(o),sz=bb.getSize(new T.Vector3()),cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2;
    const W=Math.max(sz.x,sz.z,sz.y*.8)*1.04,H=W/.8;const col=vi%5,row=vi<5?0:2,quads=[];
    for(let view=0;view<2;view++){const x=col*CW,y=(row+view)*CH;rt.viewport.set(x,y,CW,CH);rt.scissor.set(x,y,CW,CH);renderer.setRenderTarget(rt);
      renderer.setClearColor(vi<5?0x4d6b2e:0x34502a,0);renderer.clear();
      cam.left=-W/2;cam.right=W/2;cam.bottom=bb.min.y;cam.top=bb.min.y+H;cam.updateProjectionMatrix();
      if(view===0){cam.position.set(cx,0,cz+50);cam.lookAt(cx,0,cz)}else{cam.position.set(cx+50,0,cz);cam.lookAt(cx,0,cz)}
      renderer.render(sc,cam);quads.push({u0:x/RS,v0:y/RS,u1:(x+CW)/RS,v1:(y+CH)/RS})}
    sc.remove(o);
    const pos=[],uv=[],nor=[],idx=[];const quad=(ax,az,q)=>{const b=pos.length/3,h0=bb.min.y,h1=bb.min.y+H;
      for(const [s,t] of[[-1,0],[1,0],[1,1],[-1,1]]){pos.push(cx+ax*s*W/2,t?h1:h0,cz+az*s*W/2);uv.push(s<0?q.u0:q.u1,t?q.v1:q.v0);nor.push(0,1,0)}idx.push(b,b+1,b+2,b,b+2,b+3)};
    quad(1,0,quads[0]);quad(0,-1,quads[1]);
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setIndex(idx);geos.push(g)});
  rt.scissorTest=false;rt.viewport.set(0,0,RS,RS);renderer.setRenderTarget(null);renderer.setClearColor(prevC,prevA);
  const mat=new T.MeshLambertMaterial({map:rt.texture,alphaTest:.5,side:T.DoubleSide,color:0xb8b8b8}),dmat=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:rt.texture,alphaTest:.5});
  const all=TREES.oak.concat(TREES.pine),by=VAR.map(()=>[]);
  for(const t of all){t.v=Math.floor(hash2(Math.round(t.x*5),Math.round(t.z*5))*5);by[(t.pine?5:0)+t.v%5].push(t)}
  const old=new Set();for(const t of all)for(const [inst] of t.ii||[])old.add(inst);for(const m of old){scene.remove(m);m.dispose&&m.dispose()}
  const dm=new T.Object3D();
  by.forEach((list,vi)=>{if(!list.length)return;const im=new T.InstancedMesh(geos[vi],mat,list.length);im.customDepthMaterial=dmat;im.castShadow=true;im.receiveShadow=false;im.frustumCulled=false;
    list.forEach((t,k)=>{dm.position.set(t.x,t.y-.12,t.z);dm.rotation.set(0,t.r,0);dm.scale.setScalar(t.s*(t.pine?.92:.98));dm.updateMatrix();im.setMatrixAt(k,dm.matrix);t.ii=[[im,k]]});scene.add(im)});
  AS.impostorRT=rt;return true}

/* rocks */
const _br0=buildRocks;
buildRocks=function(){if(!AS.ok||!AS.lib.Rock_Medium_1)return _br0();
  const list=[];for(let i=0;i<900*WK;i++){const x=rnd(-HALF+30,HALF-30),z=rnd(-HALF+30,HALF-30);if(siteAt(x,z)||roadDist(x,z)<4)continue;const h=terrainH(x,z);if(h<-.5)continue;list.push({x,z,y:h,s:rnd(.6,2.6)*(h>40?1.6:1)})}
  const by=[[],[],[]];for(const r of list){r.s0=r.s;const v=Math.floor(Math.random()*3);r.v=v;by[v].push({x:r.x,y:r.y-.12*r.s,z:r.z,ry:rnd(6.28),tx:rnd(-.12,.12),tz:rnd(-.12,.12),s:r.s*.72,sy:.85,ref:r})}
  by.forEach((items,v)=>{asScatter('Rock_Medium_'+(v+1),items,{shadow:true,rad:2.5,maxD:700});for(const it of items){it.ref.inst=it.inst;it.ref.i=it.i}});
  for(const r of list)if(r.s>1.1)r.col=addCircle(r.x,r.z,r.s*.9);ROCKS=list};

/* grass, clover and wild flowers around the player */
const GR={v:[],last:{x:1e9,z:1e9}};
const _bg0=buildGrass;
buildGrass=function(){if(!AS.ok||!AS.lib.Grass_Common_Short)return _bg0();
  const defs=[['Grass_Common_Short',.5,.42,.7],['Grass_Wispy_Short',.18,.38,.6],['Grass_Common_Tall',.1,.34,.52],['Clover_1',.07,.5,.8],['Flower_3_Single',.05,.28,.42],['Flower_4_Single',.04,.26,.38],['Clover_2',.06,.5,.8]];
  for(const [n,w,s0,s1] of defs){const parts=asParts(n);if(!parts)continue;const ims=parts.map(p=>{const im=new T.InstancedMesh(p.g,asWindMat(p.m,.1),2600);im.count=0;im.frustumCulled=false;im.receiveShadow=true;scene.add(im);return im});GR.v.push({n,w,s0,s1,ims})}
  grass={visible:true,count:0,instanceMatrix:{needsUpdate:false}}};
const _ug0=updateGrass;
updateGrass=function(px,pz){if(!GR.v.length)return _ug0(px,pz);
  if(Math.hypot(px-GR.last.x,pz-GR.last.z)<5)return;GR.last.x=px;GR.last.z=pz;for(const v of GR.v)for(const im of v.ims)im.count=0;
  if(PL.inCave||grass.visible===false){return}
  const S=1.15,R=asDet().grass,tot=GR.v.reduce((a,v)=>a+v.w,0);
  for(let gx=Math.floor((px-R)/S);gx<=Math.floor((px+R)/S);gx++)for(let gz=Math.floor((pz-R)/S);gz<=Math.floor((pz+R)/S);gz++){
    const hv=hash2(gx,gz);if(hv>.8)continue;const x=(gx+hash2(gz,gx*3))*S,z=(gz+hash2(gx*7,gz))*S;if(Math.hypot(x-px,z-pz)>R)continue;
    const h=terrainH(x,z);if(h<.9||h>58||roadDist(x,z)<1.2||inBuilding(x,z,1)||AS_PAVED.some(q=>Math.abs(x-q.x)<q.hw&&Math.abs(z-q.z)<q.hd))continue;_gp.x=x;_gp.z=z;if(collide(_gp,.3))continue;
    let pk=hash2(gx*13+1,gz*17+5)*tot,v=GR.v[0];for(const q of GR.v){pk-=q.w;if(pk<=0){v=q;break}}const c=v.ims[0].count;if(c>=2600)continue;
    _g.position.set(x,h-.04,z);_g.rotation.set(0,hv*40,0);const sc=v.s0+(v.s1-v.s0)*hash2(gx+5,gz);_g.scale.set(sc,sc*(.85+hv*.4),sc);_g.updateMatrix();for(const im of v.ims){im.setMatrixAt(c,_g.matrix);im.count=c+1}}
  for(const v of GR.v)for(const im of v.ims)im.instanceMatrix.needsUpdate=true};

/* flowers, bushes, ferns, plants, mushrooms, pebbles and petals across the land */
const _bfl0=buildFlora;
buildFlora=function(){if(!AS.ok||!AS.lib.Bush_Common)return _bfl0();setLoad('bloemen, struiken en varens');
  const okLand=(x,z,h)=>h>1.6&&h<48&&!inBuilding(x,z,1.5)&&roadDist(x,z)>2.5&&Math.abs(x-riverX(z))>9&&slopeAt(x,z)<.55&&!SITES.some(s=>s.id!=='bridge'&&Math.hypot(x-s.x,z-s.z)<s.r*.95);
  const B={},put=(n,it)=>{(B[n]||(B[n]=[])).push(it)};
  /* flower meadows */
  const FL=[['Flower_3_Group',.22],['Flower_4_Group',.13],['Flower_3_Single',.35],['Flower_4_Single',.3]];
  for(let t=0,k=0;t<70000*WK&&k<3400*WK;t++){const x=rnd(-HALF+40,HALF-40),z=rnd(-HALF+40,HALF-40);if(fbm(x*.03+7,z*.03-3,2)<.58)continue;const h=terrainH(x,z);if(!okLand(x,z,h)||forestDensity(x,z)>.25)continue;
    put(pickW(Math.random(),FL),{x,y:h-.03,z,ry:rnd(6.28),s:rnd(.28,.42)});k++;if(Math.random()<.25)put('Petal_'+(1+Math.floor(Math.random()*5)),{x:x+rnd(-.8,.8),y:h+.01,z:z+rnd(-.8,.8),ry:rnd(6.28),s:rnd(.5,.9)})}
  /* bushes (also at forest edges) */
  for(let t=0,j=0;t<30000*WK&&j<700*WK;t++){const x=rnd(-HALF+40,HALF-40),z=rnd(-HALF+40,HALF-40),fd=forestDensity(x,z),h=terrainH(x,z);if(h<1.5||h>50||roadDist(x,z)<4||Math.abs(x-riverX(z))<10||slopeAt(x,z)>.6||inBuilding(x,z,2))continue;
    if(SITES.some(s=>s.id!=='bridge'&&Math.hypot(x-s.x,z-s.z)<s.r*1.15)||(fd<.03&&Math.random()>.12))continue;put(Math.random()<.3?'Bush_Common_Flowers':'Bush_Common',{x,y:h-.08,z,ry:rnd(6.28),s:rnd(.75,1.5)});j++}
  /* forest floor */
  const UF=[['Fern_1',.3],['Plant_1',.18],['Plant_1_Big',.07],['Plant_7',.15],['Plant_7_Big',.1],['Clover_1',.1],['Clover_2',.1]];
  for(let t=0,k=0;t<60000*WK&&k<4200*WK;t++){const x=rnd(-HALF+30,HALF-30),z=rnd(-HALF+30,HALF-30),fd=forestDensity(x,z);if(fd<.3)continue;const h=terrainH(x,z);if(h<1.2||h>70||roadDist(x,z)<2||inBuilding(x,z,1.5))continue;
    const n=pickW(Math.random(),UF);put(n,{x,y:h-.04,z,ry:rnd(6.28),s:n==='Fern_1'?rnd(.18,.3):n.endsWith('Big')?rnd(.22,.38):rnd(.6,1.1)});k++;
    if(Math.random()<.07)put(Math.random()<.7?'Mushroom_Common':'Mushroom_Laetiporus',{x:x+rnd(-1,1),y:h-.02,z:z+rnd(-1,1),ry:rnd(6.28),s:rnd(.5,1.1)})}
  /* pebbles along roads and rivers */
  for(const r of ROADS){const p=r.pts;for(let i=0;i<p.length-1;i++){const L=Math.hypot(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1]);for(let d=0;d<L;d+=rnd(3,9)){const u=d/L,sd=Math.random()<.5?-1:1,ax=p[i+1][0]-p[i][0],az=p[i+1][1]-p[i][1],nx=-az/L,nz=ax/L,o=r.w+rnd(.6,2.2);
      const x=p[i][0]+ax*u+nx*o*sd,z=p[i][1]+az*u+nz*o*sd,h=groundH(x,z);if(h<.2)continue;put((Math.random()<.5?'Pebble_Round_':'Pebble_Square_')+(1+Math.floor(Math.random()*5)),{x,y:h-.02,z,ry:rnd(6.28),s:rnd(.8,1.8)})}}}
  for(let t=0,k=0;t<20000*WK&&k<500*WK;t++){const z=rnd(-HALF+40,HALF-40),x=riverX(z)+(Math.random()<.5?-1:1)*rnd(8,13),h=terrainH(x,z);if(h<-.2||h>3)continue;put((Math.random()<.5?'Pebble_Round_':'Pebble_Square_')+(1+Math.floor(Math.random()*5)),{x,y:h-.02,z,ry:rnd(6.28),s:rnd(1,2.4)});k++}
  for(const [n,items] of Object.entries(B)){const big=n.startsWith('Bush');asScatter(n,items,{shadow:big,wind:n.startsWith('Pebble')?0:big?.03:.06,rad:big?1.5:1,maxD:big?420:n.startsWith('Pebble')||n.startsWith('Petal')?70:n.startsWith('Flower')?150:120})}};

/* special trees: elf grove, living forest, swamp */
const _ft0=fTree,_dt0=deadTree;
fTree=function(x,z,s,lm,tm){if(!AS.ok||!AS.lib.TwistedTree_1)return _ft0(x,z,s,lm,tm);const y=groundH(x,z),n='TwistedTree_'+(1+Math.floor(hash2(Math.round(x),Math.round(z))*5)),o=AS.lib[n].clone();
  const glow=lm&&lm.emissive&&lm.emissive.getHex()>0;o.traverse(m=>{if(!m.isMesh)return;if(m.material.alphaTest>0&&glow)m.material=asTinted(m.material,'leaf'+lm.color.getHex(),mm=>{asTint(mm,lm.color.getHex(),.55);mm.emissive=lm.emissive.clone();mm.emissiveIntensity=(lm.emissiveIntensity||.5)*.45})});
  o.position.set(x,y-.15,z);o.rotation.y=hash2(Math.round(z),Math.round(x))*6.28;o.scale.setScalar(s*.5);scene.add(o);addCircle(x,z,.55*s)};
deadTree=function(x,z,s){if(!AS.ok||!AS.lib.DeadTree_1)return _dt0(x,z,s);const y=groundH(x,z),o=AS.lib['DeadTree_'+(1+Math.floor(hash2(Math.round(x*3),Math.round(z*3))*5))].clone();o.position.set(x,y-.2,z);o.rotation.y=rnd(6.28);o.scale.setScalar(s*.42);scene.add(o);addCircle(x,z,.4*s)};

/* herbs and mushrooms you can pick */
const _mp0=makePickup;
makePickup=function(x,z,id,n,kind){if(!AS.ok)return _mp0(x,z,id,n,kind);
  const it=id&&ITEMS[id],nm=kind==='herb'?'Flower_3_Single':kind==='mush'?'Mushroom_Common':kind==='gold'?(n>=40?'Coin_Pile_2':'Coin_Pile'):it&&/potion|elixir|salve/.test(id)?'Potion_2':it&&it.g==='weapon'?(it.kind==='axe'?'Axe_Bronze':it.kind==='bow'?null:'Sword_Bronze'):it&&it.g==='shield'?'Shield_Wooden':id==='branch'?null:'Pouch_Large';
  if(!nm||!AS.lib[nm])return _mp0(x,z,id,n,kind);
  const p=_mp0(x,z,id,n,kind),y=groundH(x,z),g=new T.Group(),o=AS.lib[nm].clone();scene.remove(p.m);
  const sc={Flower_3_Single:.32,Mushroom_Common:.7,Coin_Pile:1.6,Coin_Pile_2:1.6,Potion_2:1.6,Sword_Bronze:.8,Axe_Bronze:.9,Shield_Wooden:.8,Pouch_Large:1.5}[nm]||1;o.scale.setScalar(sc);
  if(nm==='Sword_Bronze'||nm==='Axe_Bronze'){o.rotation.z=Math.PI/2;o.position.y=.05}if(nm==='Shield_Wooden'){o.rotation.x=-Math.PI/2;o.position.y=.03}
  g.add(o);g.position.set(x,y+(kind==='herb'||kind==='mush'?0:.02),z);scene.add(g);p.m=g;p.baseY=g.position.y;if(kind==='gold')p.kind='gold';return p};



/* ---------- Mountains: ridged peaks, crags, rock on steep slopes and snow on high ground ---------- */
const _bh0=baseH;
baseH=function(x,z){let h=_bh0(x,z);if(AS.ok&&h>26){const m=smooth(26,95,h),r=1-Math.abs(fbm(x*.011+31,z*.011-17,4)*2-1);h+=m*(r*r*48-11)+m*(fbm(x*.05+3,z*.05-8,2)-.5)*8}return h};
function asTerrainShader(mat){const U={uRock:{value:AS.tex.rocks},uNoise:{value:AS.tex.noise_terrain}};
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;varying vec3 vWN;').replace('#include <project_vertex>','#include <project_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;varying vec3 vWN;uniform sampler2D uRock;uniform sampler2D uNoise;').replace('#include <color_fragment>',`#include <color_fragment>
      {vec3 wn=normalize(vWN);float slope=1.-wn.y;vec3 bw=pow(abs(wn),vec3(4.));bw/=bw.x+bw.y+bw.z;
       vec3 rk=texture2D(uRock,vWPos.zy*.06).rgb*bw.x+texture2D(uRock,vWPos.xz*.06).rgb*bw.y+texture2D(uRock,vWPos.xy*.06).rgb*bw.z;
       vec3 rk2=texture2D(uRock,vWPos.xz*.013+.3).rgb;float big=texture2D(uNoise,vWPos.xz*.0023).r;
       float wr=clamp(smoothstep(.3,.6,slope+(big-.5)*.3)+smoothstep(60.,110.,vWPos.y)*.45,0.,1.);
       vec3 rockC=mix(rk,rk2,.35)*vec3(.95,.92,.88)*(.72+.55*big);
       diffuseColor.rgb=mix(diffuseColor.rgb*(.86+.28*big),rockC,wr);
       float ws=smoothstep(150.,186.,vWPos.y+(big-.5)*46.)*smoothstep(.2,.55,wn.y);
       diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.94,.96,1.)*(.9+.1*rk.r),ws);}`)};
  mat.needsUpdate=true;return mat}
const _btr0=buildTerrain;
buildTerrain=async function(){if(!AS.ok||!AS.tex.rocks)return _btr0();
  setLoad('terrein en bergen');const mat=asTerrainShader(new T.MeshStandardMaterial({vertexColors:true,map:TEX.grass,roughness:1}));
  const CH=200,N=Math.round(HALF*2/CH);WD.chunks=[];
  for(let cx=0;cx<N;cx++){for(let cz=0;cz<N;cz++){
    const ox=-HALF+cx*CH+CH/2,oz=-HALF+cz*CH+CH/2;let mx=-1e9;for(let i=0;i<=8;i++)for(let j=0;j<=8;j++)mx=Math.max(mx,terrainH(ox-CH/2+i*25,oz-CH/2+j*25));
    /* the old land in full detail; the new land a little coarser, and the outermost ring (sea and cliffs) coarse */
    const ed=Math.max(Math.abs(ox),Math.abs(oz)),SEG=mx<-2?10:(WD.fineChunk&&WD.fineChunk(ox,oz,mx))?36:ed>HALF-150?24:ed>1150?(mx>34?56:36):(mx>34?84:40),g=new T.PlaneGeometry(CH,CH,SEG,SEG);g.rotateX(-Math.PI/2);
    const p=g.attributes.position,n=p.count,cols=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);
    /* every height is worked out once: one grid per chunk with a ring around it, the normals come from the neighbours in that grid */
    const M=SEG+1,M2=M+2,e=CH/SEG,x0=ox-CH/2,z0=oz-CH/2,GH=new Float32Array(M2*M2);for(let j=0;j<M2;j++)for(let i=0;i<M2;i++)GH[j*M2+i]=terrainH(x0+(i-1)*e,z0+(j-1)*e);
    /* only the road pieces near this chunk are looked at */
    const RS=[];for(const r of ROADS){const q=r.pts,mg=r.w+3;for(let i=0;i<q.length-1;i++){const ax=q[i][0],az=q[i][1],bx=q[i+1][0],bz=q[i+1][1];if(Math.max(ax,bx)+mg<x0||Math.min(ax,bx)-mg>x0+CH||Math.max(az,bz)+mg<z0||Math.min(az,bz)-mg>z0+CH)continue;RS.push(ax,az,bx-ax,bz-az,r.w)}}
    const nearRoad=(x,z)=>{let best=1e9;for(let k=0;k<RS.length;k+=5){const ax=RS[k],az=RS[k+1],dx=RS[k+2],dz=RS[k+3],t=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1),d=Math.hypot(x-ax-dx*t,z-az-dz*t)-RS[k+4];if(d<best)best=d}return best};
    for(let i=0;i<n;i++){
      const ix=i%M,iy=(i-ix)/M,gi=(iy+1)*M2+ix+1,x=x0+ix*e,z=z0+iy*e,h=GH[gi];p.setXYZ(i,x,h,z);
      const hx=GH[gi+1]-GH[gi-1],hz=GH[gi+M2]-GH[gi-M2],l=Math.hypot(hx,2*e,hz);
      nor[i*3]=-hx/l;nor[i*3+1]=2*e/l;nor[i*3+2]=-hz/l;uv[i*2]=x/9;uv[i*2+1]=z/9;
      const slope=Math.hypot(hx,hz)/(2*e),nn=fbm(x*.05,z*.05,3),n2=fbm(x*.011+9,z*.011,3);
      let r=.27+.12*nn+.05*n2,gg=.43+.14*nn,b=.16+.05*nn;
      const fd=smooth(.5,.62,fbm(x*.008+200,z*.008+80,3));r=lerp(r,.17,fd*.5);gg=lerp(gg,.30,fd*.5);b=lerp(b,.1,fd*.5);
      const sand=1-smooth(-.6,1.5,h);r=lerp(r,.58,sand);gg=lerp(gg,.52,sand);b=lerp(b,.36,sand);
      const alp=smooth(40,90,h);r=lerp(r,.36,alp*.6);gg=lerp(gg,.40,alp*.6);b=lerp(b,.24,alp*.6);
      const rock=Math.max(smooth(.55,1,slope),smooth(70,110,h)*.6);r=lerp(r,.43+.1*nn,rock);gg=lerp(gg,.41+.1*nn,rock);b=lerp(b,.38+.08*nn,rock);
      if(h<70&&RS.length){const rd=nearRoad(x,z);if(rd<2.5){const t=1-smooth(.2,2.5,rd);r=lerp(r,.58,t);gg=lerp(gg,.49,t);b=lerp(b,.34,t)}}
      for(const q of SITES)if(q.tint){const tt=1-smooth(q.r*.55,q.r*1.25,Math.hypot(x-q.x,z-q.z));if(tt>0){const w=tt*.8;r=lerp(r,q.tint[0],w);gg=lerp(gg,q.tint[1],w);b=lerp(b,q.tint[2],w)}}
      if(WD.tintAt){const tq=WD.tintAt(x,z);if(tq){r=lerp(r,tq[0],tq[3]);gg=lerp(gg,tq[1],tq[3]);b=lerp(b,tq[2],tq[3])}}
      cols[i*3]=r;cols[i*3+1]=gg;cols[i*3+2]=b}
    g.setAttribute('color',new T.BufferAttribute(cols,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.computeBoundingSphere();
    const m=new T.Mesh(g,mat);m.receiveShadow=true;scene.add(m);WD.chunks.push({m,x:ox,z:oz,seg:SEG})}await tick()}
  /* a quick height for whole-world jobs (the map, the water): read from the finished land, nothing is calculated twice */
  WD.hFast=(x,z)=>{const c=WD.chunks,fx=clamp(Math.floor((x+HALF)/CH),0,N-1),fz=clamp(Math.floor((z+HALF)/CH),0,N-1),q=c[fx*N+fz],S=q.seg,st=CH/S,u=clamp((x-q.x+CH/2)/st,0,S-.001),v=clamp((z-q.z+CH/2)/st,0,S-.001),i=Math.floor(u),j=Math.floor(v),a=q.m.geometry.attributes.position.array,M=S+1,tx=u-i,tz=v-j,at=(ii,jj)=>a[(jj*M+ii)*3+1];return lerp(lerp(at(i,j),at(i+1,j),tx),lerp(at(i,j+1),at(i+1,j+1),tx),tz)}};
/* boulders and crags on the mountain sides */
function asCrags(){const items=[[],[],[]];
  for(let t=0,k=0;t<26000*WK&&k<380*WK;t++){const x=rnd(-HALF+20,HALF-20),z=rnd(-HALF+20,HALF-20),h=terrainH(x,z);if(h<30||h>108||siteAt(x,z))continue;const sl=slopeAt(x,z);if(sl<.48||roadDist(x,z)<6)continue;
    const s=rnd(2,5.5),v=Math.floor(Math.random()*3);items[v].push({x,y:h-.45*s,z,ry:rnd(6.28),tx:rnd(-.35,.35),tz:rnd(-.35,.35),s,sy:rnd(.8,1.4)});if(h<120)addCircle(x,z,s*1.1);k++}
  items.forEach((it,v)=>asScatter('Rock_Medium_'+(v+1),it,{shadow:true,rad:3.5,maxD:900}))}

/* ---------- Water: depth colour, transparent shallows, shore foam, layered waves, sky reflection ---------- */
function asWaterDepth(){const N=1000,d=new Uint8Array(N*N),S=HALF*2/N;
  const HF=WD.hFast||terrainH;for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-HALF+(i+.5)*S,z=-HALF+(j+.5)*S;const h=HF(x,z);d[j*N+i]=h>=-.05?0:Math.min(255,Math.round((-.05-h)/8*255))}
  const t=new T.DataTexture(d,N,N,T.LuminanceFormat,T.UnsignedByteType);t.magFilter=t.minFilter=T.LinearFilter;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.needsUpdate=true;return t}
const _uw0=upgradeWater;
upgradeWater=function(){_uw0();if(!AS.ok)return;setLoad('water');const m=waterMesh.material;m.roughness=.14;m.metalness=.1;m.opacity=1;m.transparent=true;m.depthWrite=false;
  const U={uTime:WIND,uDepth:{value:asWaterDepth()},uHalf:{value:HALF},uTop:skyMat.uniforms.top,uHor:skyMat.uniforms.hor,uShallow:{value:new T.Color(0x4fa8a6)},uDeep:{value:new T.Color(0x123f5e)},uNight:skyMat.uniforms.nightF};
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;').replace('#include <project_vertex>','#include <project_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;uniform float uTime;uniform sampler2D uDepth;uniform float uHalf;uniform vec3 uTop;uniform vec3 uHor;uniform vec3 uShallow;uniform vec3 uDeep;uniform float uNight;')
      .replace('#include <map_fragment>',`float dep=texture2D(uDepth,(vWPos.xz+uHalf)/(2.*uHalf)).r*8.;vec4 texelColor=texture2D(map,vUv);
        vec3 wcol=mix(uShallow,uDeep,smoothstep(.1,3.8,dep));diffuseColor.rgb=wcol*(.97+.05*texelColor.r);diffuseColor.a=mix(.42,.93,smoothstep(.05,2.2,dep));`)
      .replace('#include <normal_fragment_maps>',`vec2 wq=vWPos.xz;float tt=uTime;
        vec3 n1=texture2D(normalMap,wq*.031+vec2(tt*.010,tt*.006)).xyz*2.-1.;vec3 n2=texture2D(normalMap,wq*.083+vec2(-tt*.016,tt*.012)).xyz*2.-1.;vec3 n3=texture2D(normalMap,wq*.19+vec2(tt*.028,-tt*.022)).xyz*2.-1.;
        vec2 dn=(n1.xy*.55+n2.xy*.35+n3.xy*.22)*mix(.35,.75,smoothstep(.3,3.,dep));vec3 nW=normalize(vec3(-dn.x,1.,-dn.y));normal=normalize((viewMatrix*vec4(nW,0.)).xyz);`)
      .replace('#include <tonemapping_fragment>',`{vec3 V=normalize(cameraPosition-vWPos);float cv=abs(dot(nW,V));float fr=.04+.9*pow(1.-cv,5.);
        vec3 R=reflect(-V,nW);vec3 sky=mix(uHor,uTop,clamp(R.y*1.6,0.,1.))*(1.-uNight*.4);gl_FragColor.rgb=mix(gl_FragColor.rgb,sky,fr*.85);
        float foam=smoothstep(.55,.03,dep)*(.5+.5*sin(dep*26.-tt*1.8+n2.x*5.))*step(.015,dep);foam=clamp(foam+smoothstep(.12,.02,dep)*.6*step(.015,dep),0.,1.);
        gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.9,.95,.97)*(1.-uNight*.6),foam*.6);gl_FragColor.a=clamp(max(gl_FragColor.a,fr*.9)+foam*.3,0.,1.);}
        #include <tonemapping_fragment>`)};
  m.needsUpdate=true};

/* ---------- Floors: houses stand level above the terrain, with a little ramp at the door ---------- */
const FLOOR=new Map(),FL_C=24;
function asFloorAdd(b){const r=Math.hypot(b.w,b.d)/2+2;for(let i=Math.floor((b.x-r)/FL_C);i<=Math.floor((b.x+r)/FL_C);i++)for(let j=Math.floor((b.z-r)/FL_C);j<=Math.floor((b.z+r)/FL_C);j++){const k=i*4096+j;let a=FLOOR.get(k);if(!a){a=[];FLOOR.set(k,a)}a.push(b)}}
const _gh0=groundH;
groundH=function(x,z){let h=_gh0(x,z);if(!FLOOR.size||x<-2000)return h;const a=FLOOR.get(Math.floor(x/FL_C)*4096+Math.floor(z/FL_C));if(!a)return h;
  for(const b of a){const c=Math.cos(b.th),sn=Math.sin(b.th),dx=x-b.x,dz=z-b.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;
    if(Math.abs(lx)<b.w/2+.05&&Math.abs(lz)<b.d/2+.05)h=Math.max(h,b.fy);
    else if(Math.abs(lx-b.doorX)<.9&&lz>0&&lz<b.d/2+1.7){h=Math.max(h,lerp(b.fy,h,clamp((lz-b.d/2)/1.7,0,1)))}}
  return h};


/* ---------- Warhorse (Literock Studios) and animated dragon ---------- */
async function asLoadDragon(){if(!T.FBXLoader)return;setLoad('draak laden');const tl=new T.TextureLoader(),tx=n=>new Promise(r=>tl.load('assets/dragon/'+n,t=>{t.encoding=T.LinearEncoding;t.anisotropy=4;r(t)},undefined,()=>r(null)));
  const [o,red,blue,nrm]=await Promise.all([asFetchBin('assets/dragon/dragon_anim.fbx').then(buf=>new T.FBXLoader().parse(buf,'assets/dragon/')),tx('dragon_red.jpg'),tx('dragon_blue.jpg'),tx('dragon_n.jpg')]);
  AS.dragon=o;AS.dragonClip=o.animations[0];AS.dragonTex={red,blue,nrm}}
function asHorseAnchor(model){const B=model.userData.bones,head=B.head;if(!head)return new T.Group();model.updateMatrixWorld(true);
  const hp=head.getWorldPosition(new T.Vector3()),F=hp.clone().add(new T.Vector3(0,.2,.16)),wp=F.sub(new T.Vector3(0,2.8,1.55)),a=new T.Group();head.add(a);
  a.position.copy(head.worldToLocal(wp.clone()));const hq=head.getWorldQuaternion(new T.Quaternion());a.quaternion.copy(hq.invert().multiply(new T.Quaternion().setFromEuler(new T.Euler(.45,0,0))));return a}
const _mho0=makeHorse,_ahs0=animHorse,_mdr0=makeDragon;
makeHorse=function(col=0x7a4a2a){if(!AS.ok||!AS.lib.Warhorse)return _mho0(col);
  const model=T.SkeletonUtils.clone(AS.lib.Warhorse);model.userData.bones=asBones(model);const hsl=new T.Color(col).getHSL({});
  model.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;if(col===0x7a4a2a||col===0x5a3a2a)return;
    m.material=asTinted(m.material,'horse'+col,mm=>{if(hsl.l>.85){mm.color.setScalar(2.4);asTint(mm,col,.88)}else if(hsl.l>.45){mm.color.setScalar(1.7);asTint(mm,col,.7)}else asTint(mm,col,.5)})});
  const g=new T.Group();g.add(model);const rig=asHorseAnchor(model);
  const h={g,rig,legs:dummyLegs(),phase:Math.random()*6,gl:true,model,mixer:new T.AnimationMixer(model),acts:{},cur:null,curName:'',saddle:model.userData.bones.saddle_socket,rearT:0};
  _ahs0Prime(h);return h};
function _ahs0Prime(h){animHorse(h,0,0);h.mixer.update(Math.random()*4)}
makeDragon=function(c1=0x7a1f1a,c2=0x4a120f){if(!AS.ok||!AS.dragon||!AS.dragonClip)return _mdr0(c1,c2);
  const mother=c1!==0x7a1f1a,o=T.SkeletonUtils.clone(AS.dragon),tex=mother?AS.dragonTex.blue:AS.dragonTex.red;
  o.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;const src=Array.isArray(m.material)?m.material[0]:m.material;
    if(m.name==='Eye')m.material=new T.MeshBasicMaterial({color:mother?0x9ff6ff:0xffb020});
    else if(src&&src.name==='DragonLPMaterial')m.material=asTinted(src,mother?'drB':'drR',mm=>{mm.map=tex;mm.color.setHex(0xffffff);if(AS.dragonTex.nrm){mm.normalMap=AS.dragonTex.nrm;mm.normalScale=new T.Vector2(.9,.9)}if(mm.shininess!==undefined)mm.shininess=18;mm.specular&&mm.specular.setHex(0x333333)});
    else m.material=new T.MeshStandardMaterial({color:0xe2d6b8,roughness:.6})});
  o.scale.setScalar(.0138);const g=new T.Group(),rig=new T.Group();g.add(rig);rig.add(o);
  /* the source clip holds one wing beat (0-2.67 s) and then keeps the wings still; loop only the beat */
  if(!AS.dragonFlap){const c=AS.dragonClip.clone();for(const t of c.tracks)t.trim(0,2.6667);c.duration=2.6667;AS.dragonFlap=c}
  const mixer=new T.AnimationMixer(o),act=mixer.clipAction(AS.dragonFlap);act.play();mixer.update(Math.random()*2.6);
  return{g,rig,body:o,legs:dummyLegs(),wings:[new T.Object3D(),new T.Object3D()],phase:0,gl:true,dragon:true,mixer,act}};
animHorse=function(h,dt,speed){if(!h||!h.gl)return _ahs0(h,dt,speed);
  if(h.dragon){h.act.timeScale=1+Math.min(1.2,speed*.12);h.rig.position.y=1.2+Math.sin((h.phase+=dt)*1.2)*.35;if(h.g.visible!==false)h.mixer.update(dt);return}
  let n='idle_loop',ts=1,once=false;if(speed>3.6){n='canter_loop';ts=clamp(speed/9,.75,1.8)}else if(speed>.15){n='walk_loop';ts=clamp(speed/1.6,.55,2.2)}
  if(h.rearT>0){h.rearT-=dt;n='rear';once=true}
  if(h.curName!==n){const c=AS.horseClips[n];if(c){const a=h.acts[n]||(h.acts[n]=h.mixer.clipAction(c));a.enabled=true;a.reset();a.setLoop(once?T.LoopOnce:T.LoopRepeat,Infinity);a.clampWhenFinished=once;a.setEffectiveWeight(1);a.fadeIn(.25);a.play();if(h.cur&&h.cur!==a)h.cur.fadeOut(.25);h.cur=a;h.curName=n}}
  if(h.cur)h.cur.timeScale=ts;h.phase+=dt*(speed>.1?4+speed*.9:0);if(h.g.visible!==false||PL.mounted&&PL.mounted.model===h)h.mixer.update(dt)};
/* the rider sits in the saddle */
const _mnt0=mount;
mount=function(h){_mnt0(h);if(h.model&&h.model.gl&&Math.random()<.35)h.model.rearT=2.4};
const _upH=updatePlayer;
updatePlayer=function(dt){_upH(dt);const h=PL.mounted;if(!h||!h.model||!h.model.gl||!h.model.saddle||!pm)return;h.root.updateMatrixWorld(true);
  const v=h.model.saddle.getWorldPosition(new T.Vector3());pm.g.position.set(v.x,v.y-(pm.sk?.5:1.1)+(pm.sk?0:.2),v.z);if(pm.sk)pm.rig.position.y=0};
const _hah0=hitActor;
hitActor=function(a,dmg,byPlayer,dir){_hah0(a,dmg,byPlayer,dir);if(a.kind==='horse'&&!a.dead&&a.model&&a.model.gl&&!a.rider)a.model.rearT=2.4};
/* dragon fire */
const _sar0=shootArrow;
shootArrow=function(x,y,z,tx,ty,tz,owner,dmg,speed,by){_sar0(x,y,z,tx,ty,tz,owner,dmg,speed,by);if(by&&by.type==='dragon'&&AS.ok){const ar=arrows[arrows.length-1];scene.remove(ar.m);
  ar.m=new T.Mesh(new T.SphereGeometry(.55,10,8),new T.MeshBasicMaterial({color:0xff7a1a}));ar.m.add(new T.Mesh(new T.SphereGeometry(.85,10,8),new T.MeshBasicMaterial({color:0xffc04a,transparent:true,opacity:.35,depthWrite:false})));ar.m.position.copy(ar.p);scene.add(ar.m)}};
ANIMS.push(dt=>{if(MOTHER.on&&MOTHER.m&&MOTHER.m.gl)MOTHER.m.mixer.update(dt)});

/* ---------- Sky: gradient, drifting clouds, sun and moon discs, stars (after a Godot sky shader) ---------- */
function asNoise(N,oct,base,seed,pw=1){const d=new Uint8Array(N*N),f=new Float32Array(N*N);let mn=1e9,mx=-1e9;
  for(let o=0;o<oct;o++){const P=base<<o,amp=Math.pow(.5,o),sc=P/N;for(let j=0;j<N;j++){const y=j*sc,yi=Math.floor(y),yf=y-yi,v=yf*yf*yf*(yf*(yf*6-15)+10),y0=yi%P,y1=(yi+1)%P;
    for(let i=0;i<N;i++){const x=i*sc,xi=Math.floor(x),xf=x-xi,u=xf*xf*xf*(xf*(xf*6-15)+10),x0=xi%P,x1=(xi+1)%P;
      const a=hash2(x0+seed*977+o*131,y0),b=hash2(x1+seed*977+o*131,y0),c=hash2(x0+seed*977+o*131,y1),e=hash2(x1+seed*977+o*131,y1);f[j*N+i]+=amp*(a+(b-a)*u+(c-a)*v+(a-b-c+e)*u*v)}}}
  for(let i=0;i<f.length;i++){mn=Math.min(mn,f[i]);mx=Math.max(mx,f[i])}for(let i=0;i<f.length;i++)d[i]=Math.round(Math.pow((f[i]-mn)/(mx-mn),pw)*255);
  const t=new T.DataTexture(d,N,N,T.LuminanceFormat,T.UnsignedByteType);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t}
function asStarTex(){const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,1024,1024);
  for(let i=0;i<2200;i++){const x=Math.random()*1024,y=Math.random()*1024,r=Math.random()<.08?1.9:Math.random()*1.1+.5,b=150+Math.random()*105|0;g.fillStyle='rgb('+b+','+b+','+Math.min(255,b+20)+')';g.beginPath();g.arc(x,y,r,0,7);g.fill()}
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t}
const SKY={dens:{value:.5},ccol:{value:new T.Color(1,1,1)},day:{value:1}};
function asSky(){
  const U=skyMat.uniforms;Object.assign(U,{uTime:WIND,uC1:{value:asNoise(256,6,4,4,1.15)},uC2:{value:asNoise(256,7,3,9,1)},uSt:{value:asStarTex()},uDens:SKY.dens,uCloudCol:SKY.ccol,uDay:SKY.day});
  skyMat.fragmentShader=`uniform vec3 top;uniform vec3 hor;uniform vec3 sunDir;uniform vec3 sunCol;uniform vec3 moonDir;uniform float nightF;uniform float uTime;uniform float uDens;uniform vec3 uCloudCol;uniform float uDay;
    uniform sampler2D uC1;uniform sampler2D uC2;uniform sampler2D uSt;varying vec3 vp;
    float ch(sampler2D t,vec2 uv){float h=texture2D(t,uv).r;h=clamp((h-(1.-uDens))/max(uDens,.01),0.,1.);return pow(h,1.35);}
    void main(){vec3 d=normalize(vp);if(d.y<0.){gl_FragColor=vec4(hor,1.);return;}
      vec3 c=mix(top,hor,pow(1.-d.y,2.4));float cl=0.;
      if(d.y>.005){float t=1./(d.y+.06);vec2 w=vec2(.5,.35)*uTime*.0035;vec2 p=d.xz*t*.16;vec2 p1=p+w,p2=p*1.7+w*.6;
        float h1=ch(uC1,p1),h2=ch(uC2,p2);p1+=d.xz*h1*.035;p2+=d.xz*h2*.035;h1=ch(uC1,p1);h2=ch(uC2,p2);
        cl=clamp(h1*mix(1.,h2,.55)*1.9,0.,1.)*smoothstep(0.,.18,d.y);}
      float sd=clamp(1.-distance(d,sunDir)-pow(cl,1.),0.,1.);float disc=smoothstep(.985,.993,sd);float glow=pow(sd,5.)*.35+pow(sd,60.)*.6;
      vec3 sun=sunCol*(disc*2.6+glow)*uDay;
      float md=clamp(1.-distance(d,moonDir)-pow(cl,.6)*1.5,0.,1.);float mdisc=smoothstep(.9935,.9965,md);vec3 moon=vec3(.82,.86,1.)*(mdisc*1.3+pow(md,30.)*.12)*nightF;
      vec2 suv=d.xz/(d.y+1.1)*1.6;float st=smoothstep(.55,.95,texture2D(uSt,suv).r)*(.65+.35*sin(uTime*2.+suv.x*90.));st*=nightF*clamp(1.-cl*2.5,0.,1.)*smoothstep(.02,.2,d.y);
      vec3 lit=uCloudCol*(1.-.38*cl)+sunCol*pow(sd,6.)*.35*uDay;c=mix(c,lit,pow(cl,.8));
      c+=vec3(st)+sun*clamp(pow(d.y+1.,16.),0.,1.)+moon;gl_FragColor=vec4(c,1.);}`;
  skyMat.needsUpdate=true;for(const c of clouds)c.visible=false;stars.visible=false}
const _envS=updateEnv;
updateEnv=function(dt,pp){_envS(dt,pp);if(!AS.ok||!skyMat.uniforms.uDens)return;const day=1-ENV.night;
  SKY.dens.value=.4+ENV.cloud*.42+ENV.rain*.12;SKY.day.value=Math.max(0,Math.min(1,ENV.sunDir.y*4+.4))*(1-ENV.cloud*.6);
  const warm=Math.exp(-Math.pow(ENV.sunDir.y/.22,2));SKY.ccol.value.setRGB(.96,.95,.95).multiplyScalar(.16+.84*day).lerp(new T.Color(1,.62,.42),warm*.45*day).lerp(new T.Color(.42,.45,.5),ENV.rain*.65)};

/* ---------- Village props: crates, barrels, stalls, fences, lanterns, wells ---------- */
const _cr0=crate,_bw0=barrelW,_st0=stall,_fe0=fence,_lp0=lampPost,_we0=well;
crate=function(x,z,s=.9){if(!AS.ok||!AS.lib.Crate_Wooden)return _cr0(x,z,s);asPropW(Math.random()<.5?'Crate_Wooden':'Prop_Crate',x,z,rnd(6.28),s/.9);addBox(x-s/2,z-s/2,x+s/2,z+s/2)};
barrelW=function(x,z){if(!AS.ok||!AS.lib.Barrel)return _bw0(x,z);asPropW(Math.random()<.3?'Barrel_Apples':'Barrel',x,z,rnd(6.28),1.05);addCircle(x,z,.38)};
stall=function(x,z,rot,col){if(!AS.ok||!AS.lib.Stall_Empty)return _st0(x,z,rot,col);const y=groundH(x,z),g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot*Math.PI/2;scene.add(g);
  const o=AS.lib.Stall_Empty.clone();o.scale.set(1.75,1,1.25);o.traverse(m=>{if(m.isMesh&&m.material.name==='MI_Banner')m.material=asTinted(m.material,'st'+col,mm=>asTint(mm,col,.7))});g.add(o);
  const goods=['FarmCrate_Apple','FarmCrate_Carrot','Barrel_Apples','Bag','Pot_1','Vase_4','Potion_2','Book_Stack_1'];for(let i=0;i<3;i++)asProp(goods[(Math.abs(col)>>(i*3))%goods.length],g,-1+i,.95,.05,rnd(-.3,.3),.8);
  asProp('FarmCrate_Empty',g,1.2,0,.6,.3,1);const b={x,z,th:g.rotation.y};colLocal(b,-1.6,-.6,1.6,.5);return g};
fence=function(x0,z0,x1,z1,gap=-1){if(!AS.ok||!AS.lib.Prop_WoodenFence_Single)return _fe0(x0,z0,x1,z1,gap);
  const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/2.05)),sx=L/n/2.05,ry=-Math.atan2(z1-z0,x1-x0);
  for(let i=0;i<n;i++){const u=(i+.5)/n,x=lerp(x0,x1,u),z=lerp(z0,z1,u),o=asProp(i%3===1?'Prop_WoodenFence_Extension1':'Prop_WoodenFence_Single',scene,x,groundH(x,z),z,ry,1);if(o)o.scale.set(sx,1.35,1)}
  if(Math.abs(x1-x0)>Math.abs(z1-z0))addBox(Math.min(x0,x1),z0-.12,Math.max(x0,x1),z0+.12,{});else addBox(x0-.12,Math.min(z0,z1),x0+.12,Math.max(z0,z1),{})};
lampPost=function(x,z,h=3.2){if(!AS.ok||!AS.lib.Lantern_Wall)return _lp0(x,z,h);const y=groundH(x,z);scene.add(mesh(new T.CylinderGeometry(.07,.1,h,6),MAT.wood,x,y+h/2,z));
  const ry=rnd(6.28),o=asProp('Lantern_Wall',scene,x,y+h-1.25,z,ry,1);const f=lamp(x+Math.sin(ry)*1.02,y+h-.62,z+Math.cos(ry)*1.02);addCircle(x,z,.15);return f};
well=function(x,z){_we0(x,z);if(!AS.ok)return;const y=groundH(x,z);asProp('Bucket_Wooden_1',scene,x+.75,y+.9,z+.2,rnd(6),1);asProp('Rope_1',scene,x-.6,y+.9,z-.3,rnd(6),.8)};
/* paving, carts, crates and decoration around the settlements */
const AS_PAVED=[];
function asPave(cx,cz,hw,hd,n,skip){AS_PAVED.push({x:cx,z:cz,hw:hw+.5,hd:hd+.5});const bt=kitBatch(),y=groundH(cx,cz)+.035;for(let x=-hw;x<hw;x+=2)for(let z=-hd;z<hd;z+=2){const px=cx+x+1,pz=cz+z+1;if(skip&&skip(px,pz))continue;bt.add(n,px,groundH(px,pz)+.035,pz,0)}const g=new T.Group();scene.add(g);bt.build(g,false)}
function asClearInside(){
  for(const t of TREES.oak.concat(TREES.pine))if(!t.cut&&inBuilding(t.x,t.z,1.2)){t.cut=true;t.gone=true;if(t.col)t.col.off=true;if(t.lodM)asLow(t,false);else setInst(t.ii||[],false,[])}
  for(const q of ROCKS)if(!q.cut&&inBuilding(q.x,q.z,q.s*.8)){q.cut=true;if(q.col)q.col.off=true;q.inst.setMatrixAt(q.i,ZERO);q.inst.instanceMatrix.needsUpdate=true}}
function asDecorate(){
  asClearInside();asCrags();
  const V=SITE.village,TW=SITE.town;
  asPave(0,2,13,13,'Floor_UnevenBrick',(x,z)=>Math.hypot(x,z-2)>13.5||Math.hypot(x,z-2)<1.6);
  asPave(300,-220,20,13,'Floor_Brick',(x,z)=>Math.hypot(x-312,z+202)<1.8);
  for(const [x,z,r] of[[48,30,.4],[440,84,2.1],[-250,-104,1.2],[268,-205,-.5],[-312,232,1.6]])if(AS.lib.Prop_Wagon){asPropW('Prop_Wagon',x,z,r,1);const b={x,z,th:r};colLocal(b,-.9,-3.1,.9,.8)}
  const stack=(x,z)=>{asPropW('Crate_Wooden',x,z,rnd(6),1);asPropW('Crate_Wooden',x+.9,z+.1,rnd(6),1);asProp('Crate_Wooden',scene,x+.45,groundH(x,z)+.88,z+.05,rnd(6),.9);addBox(x-.5,z-.5,x+1.4,z+.6)};
  stack(14,-14);stack(-30,26);stack(282,-212);stack(-326,262);stack(444,64);
  for(const [x,z] of[[20,-26],[-27,-20],[262,-190],[330,-182]])barrelW(x,z);
  /* castle yard */
  for(const [x,z,r] of[[-308,226,0],[-308,254,Math.PI],[-352,226,0]])asPropW('WeaponStand',x,z,r,1,.7);
  for(const [x,z] of[[-334,212],[-342,212]])asPropW('Dummy',x,z,0,1,.4);
  for(const z of[-6,6])asProp('Banner_'+(z<0?1:2),scene,-289.2,26+6.2,240+z,Math.PI/2,1.6);
  asPropW('Anvil_Log',-322,258,0,1,.5);asPropW('Barrel_Holder',-316,212,0,1,.8);
  /* bandit camp */
  const C=SITE.camp;for(const [dx,dz,n,s] of[[6,6,'Cage_Small',1.2],[-5,-6,'Chain_Coil',1],[8,-2,'Rope_3',1],[-9,2,'Bag',1],[3,-9,'Crate_Metal',1],[-3,9,'Barrel',1],[10,4,'Sword_Bronze',.9],[-7,-3,'Coin_Pile_2',1.5]])asPropW(n,C.x+dx,C.z+dz,rnd(6),s,n==='Cage_Small'||n==='Crate_Metal'?.6:0);
  /* ruins, wreck, dragon hoard, witch, hermit */
  const RU=SITE.ruins;for(let i=0;i<14;i++)asPropW(pick(['Vase_Rubble_Medium','Vase_2','Vase_4','Prop_Brick1','Prop_Brick2','Prop_Brick3']),RU.x+rnd(-26,26),RU.z+rnd(-26,26),rnd(6),rnd(.9,1.3));
  for(let i=0;i<10;i++)asPropW('Prop_Vine'+pick(['1','2','4','5']),RU.x+rnd(-28,28),RU.z+rnd(-28,28),rnd(6),rnd(1,1.6));
  const wr=HIDDEN.find(q=>q.id==='wreck');if(wr)for(const [dx,dz,n] of[[5,-3,'Barrel'],[6,-2,'Barrel'],[-5,4,'Crate_Wooden'],[3,6,'Rope_2'],[-4,-6,'Chain_Coil'],[7,2,'Crate_Metal']])asPropW(n,wr.x+dx,wr.z+dz,rnd(6),1);
  const D=SITE.dragon;for(let i=0;i<16;i++)asPropW(pick(['Coin_Pile','Coin_Pile_2','Coin_Pile_2','Chalice','Key_Gold','Potion_4']),D.x+8+rnd(-7,7),D.z-8+rnd(-7,7),rnd(6),rnd(2,3.5));
  const wi=HIDDEN.find(q=>q.id==='witch');if(wi&&wi.building){const b=wi.building,[cx,cz]=l2w(b,0,b.d/2+3);asPropW('Cauldron',cx+3,cz,0,1.1,.6);asPropW('Shelf_Small_Bottles',cx-2,cz,0,1);asPropW('Potion_1',cx-1,cz+1,0,2);asPropW('Potion_2',cx-1.4,cz+1.2,0,2)}
  const he=HIDDEN.find(q=>q.id==='hermit');if(he&&he.building&&he.building.inner){const b=he.building;asPropIn('BookGroup_Small_1',b.inner,-b.w/4,.9,0,0,1);asPropIn('CandleStick',b.inner,-b.w/4+.4,.9,.1,0,1);asPropIn('Scroll_1',b.inner,b.w/4,.9,0,0,1.2)}
  /* stone paths through the village and hamlet: flagstones two abreast on a gravel bed (the bed is the road colour of the terrain) */
  {const R=['RockPath_Round_Small_1','RockPath_Round_Small_2','RockPath_Round_Small_3','RockPath_Square_Small_1'],B=R.map(()=>[]);
    for(const [x0,z0,x1,z1] of window.STONE_PATHS){const L=Math.hypot(x1-x0,z1-z0),ux=(x1-x0)/L,uz=(z1-z0)/L;let k=0;
      for(let d=0;d<=L;d+=.62,k++)for(const sd of[-1,1]){const o=sd*.42+(k%2?.11:-.11),x=x0+ux*d-uz*o+rnd(-.07,.07),z=z0+uz*d+ux*o+rnd(-.07,.07);B[Math.floor(Math.random()*R.length)].push({x,y:groundH(x,z)+.015,z,ry:rnd(6.28),s:rnd(.95,1.2)})}}
    R.forEach((n,i)=>asScatter(n,B[i],{shadow:false,rad:1}))}
  /* market goods next to the village stalls */
  for(const [x,z] of[[11,-6],[-11,-6],[12,12]]){asPropW('FarmCrate_Apple',x,z,rnd(6),1);asPropW('FarmCrate_Carrot',x+.8,z+.3,rnd(6),1)}}
window.STONE_PATHS=[[0,14,0,40],[-10,2,-30,-20],[10,2,28,-20],[-260,-90,-270,-76]];
const _bfa0=buildFantasy;
buildFantasy=function(){_bfa0();if(AS.ok)try{asDecorate()}catch(e){console.warn('decorate',e)}};

/* ---------- Things the player builds ---------- */
const AS_BUILD={workbench:['Workbench',1,0],chest:['Chest_Wood',.85,0],table:['Table_Large',.6,0],bench:['Bench',.6,0],bed:['Bed_Twin1',.8,0],banner:['Banner_2',1.3,2.6],scarecrow:['Dummy',1,0]};
const _bs0=buildStruct;
buildStruct=function(rec){const S=_bs0(rec);if(!AS.ok||!S||!S.g)return S;const d=AS_BUILD[rec.t];
  if(d&&AS.lib[d[0]]){for(const c of S.g.children.slice())if(!(c.userData&&c.userData.dyn))S.g.remove(c);if(rec.t==='banner')S.g.add(mesh(cylG(.06,.06,3.2,6),MAT.wood,0,1.6,0));asProp(d[0],S.g,0,d[2],0,rec.t==='banner'?Math.PI/2:0,d[1])}
  if(rec.t==='forge')asProp('Anvil',S.g,1.4,0,.3,0,1);
  if(rec.t==='torch'&&TORCH.geo){for(const c of S.g.children.slice())if(!(c.userData&&c.userData.dyn))S.g.remove(c);const m=new T.Mesh(TORCH.geo,TORCH.mat);m.scale.setScalar(1.6/TORCH.h);m.castShadow=true;m.receiveShadow=true;S.g.add(m)}
  else if(rec.t==='torch'){for(const c of S.g.children.slice())if(c.geometry&&c.geometry.type==='BoxGeometry')S.g.remove(c);S.g.add(mesh(cylG(.06,.08,1.5,6),MAT.wood,0,.75,0));asProp('Torch_Metal',S.g,0,1.45,.02,0,.9)}
  if(rec.t==='fence'&&AS.lib.Prop_WoodenFence_Single){for(const c of S.g.children.slice())S.g.remove(c);const o=asProp('Prop_WoodenFence_Single',S.g,0,0,0,0,1);if(o)o.scale.set(1.46,1.35,1)}
  return S};


/* ---------- Character creator and settings ---------- */
const _po0=playerOpts;
playerOpts=function(){const o=_po0(),lk=PL.look,ar=ITEMS[PL.eq.armor]||{};o.fem=!!lk.fem;if(!ar.armor&&lk.outfit)o.outfit=lk.outfit;o.ovar=lk.ovar||0;if(o.fem&&!o.skirt)o.skirt=null;return o};
const _rc0=renderCust;
renderCust=function(){_rc0();if(!AS.ok)return;const c=$('cctl'),note=c.lastElementChild;
  const add=el=>c.insertBefore(el,note);add(opts('Lichaam',[[false,'Man'],[true,'Vrouw']],'fem'));add(opts('Kledingstijl',[[undefined,'Volgens rol'],['peasant','Boer'],['ranger','Woudloper']],'outfit'));add(opts('Stofkleur',[[0,'Klassiek'],[1,'Anders']],'ovar'));
  for(const b of c.querySelectorAll('.ob'))if(b.textContent==='Man'&&!PL.look.fem)b.classList.add('on')};
const QUAL=[['Laag',{pr:.75,detail:0,shadows:false,sm:1024}],['Midden',{pr:1,detail:1,shadows:true,sm:2048}],['Hoog',{pr:1.5,detail:2,shadows:true,sm:2048}],['Ultra',{pr:2,detail:2,shadows:true,sm:4096}]];
function applyQual(i){const q=QUAL[i][1];SET.q=i;SET.pr=q.pr;SET.detail=q.detail;SET.shadows=q.shadows;if(sun.shadow.mapSize.x!==q.sm){sun.shadow.mapSize.set(q.sm,q.sm);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}applySettings();try{GR.last.x=1e9;asTreesUpdate(true);asChunkCull()}catch(e){}}
try{if(SET.q!==undefined&&QUAL[SET.q]&&AS)setTimeout(()=>{const q=QUAL[SET.q][1];if(sun.shadow.mapSize.x!==q.sm){sun.shadow.mapSize.set(q.sm,q.sm)}},0)}catch(e){}
const _rp0=renderPause;
renderPause=function(){_rp0();
  {const c=$('pset'),l=document.createElement('label');l.innerHTML='<span>Grafische kwaliteit</span><select id="sq">'+QUAL.map((q,i)=>'<option value="'+i+'">'+q[0]+'</option>').join('')+'<option value="-1">Aangepast</option></select>';
    const h3=c.querySelector('h3');c.insertBefore(l,h3?h3.nextSibling:c.firstChild);const sel=l.querySelector('select');sel.value=String(SET.q===undefined?1:SET.q);
    sel.onchange=()=>{if(+sel.value>=0){applyQual(+sel.value);renderPause()}};
    const mark=()=>{SET.q=-1;sel.value='-1';applySettings()};for(const id of['spr','ssh','sdet'])setTimeout(()=>{const e=$(id);if(e)e.addEventListener('change',()=>{SET.q=-1;const q=$('sq');if(q)q.value='-1'})},0)}
  if(!AS.ok)return;const c=$('pset'),l=document.createElement('label');
  l.innerHTML='<span>Detail natuur en bomen</span><select id="sdet"><option value="0">Laag (sneller)</option><option value="1">Normaal</option><option value="2">Hoog</option></select>';c.appendChild(l);
  const sel=l.querySelector('select');sel.value=String(SET.detail===undefined?1:SET.detail);sel.onchange=()=>{SET.detail=+sel.value;applySettings();GR.last.x=1e9;asTreesUpdate(true);asChunkCull()}};

/* ---------- Debug camera (AS.view(x,y,z,dist,angle,height) for screenshots; AS.cam=null to release) ---------- */
const _uc0=updateCamera;
updateCamera=function(dt){const c=AS.cam;if(c){camera.position.set(c.x,c.y,c.z);camera.lookAt(c.tx,c.ty,c.tz);return}_uc0(dt)};
AS.view=(x,y,z,d=3,a=0,hh=1)=>{AS.cam={tx:x,ty:y,tz:z,x:x+Math.sin(a)*d,y:y+hh,z:z+Math.cos(a)*d}};


/* ---------- Animals: EverythingLibrary low-poly models (static meshes + procedural walk) ---------- */
const CR={lib:{},ok:false,mat:null};
async function loadCreatures(){
  try{const buf=await asFetchBin('assets/animals/animals.bin'),dv=new DataView(buf),hl=dv.getUint32(0,true),h=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl))),base=4+hl;
    for(const k in h){const e=h[k],P=new Int16Array(buf,base+e.po,e.v*3),N=new Int8Array(buf,base+e.no,e.v*4),C=new Uint8Array(buf,base+e.co,e.v*4),I=new Uint16Array(buf.slice(base+e.io,base+e.io+e.i*2));
      const pos=new Float32Array(e.v*3),nor=new Float32Array(e.v*3),col=new Float32Array(e.v*3);let zmax=-9;
      for(let i=0;i<e.v;i++)for(let j=0;j<3;j++){pos[i*3+j]=P[i*3+j]*.001;nor[i*3+j]=N[i*4+j]/127;col[i*3+j]=C[i*4+j]/255}
      for(let i=0;i<e.v;i++)if(pos[i*3+2]>zmax)zmax=pos[i*3+2];
      let sy=0,n=0;for(let i=0;i<e.v;i++)if(pos[i*3+2]>zmax-.3){sy+=pos[i*3+1];n++}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setIndex(new T.BufferAttribute(I,1));g.computeBoundingSphere();
      CR.lib[k]={geo:g,h:e.h,l:e.l,eye:[sy/Math.max(1,n)+.04,zmax-.22]}}
    CR.mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0});CR.ok=true}
  catch(e){console.warn('animals',e)}}
function makeCreature(key,sc=1,tint){const e=CR.lib[key],g=new T.Group(),rig=new T.Group();g.add(rig);
  const m=new T.Mesh(e.geo,tint!==undefined?(CR['t'+tint]||(CR['t'+tint]=(()=>{const x=CR.mat.clone();x.color=new T.Color(tint);return x})())):CR.mat);m.scale.setScalar(sc);m.castShadow=true;m.receiveShadow=true;rig.add(m);
  return{g,rig,legs:[0,1,2,3].map(()=>new T.Object3D()),phase:Math.random()*6,seed:Math.random()*6,cr:key,sz:sc,eye:[e.eye[0]*sc,e.eye[1]*sc]}}
const CRM={sheep:['sheep',1.05],cow:['cow|holstein',1],deer:['deer|doe|doe',1],chicken:['rooster|hen|hen',1.3],elk:['deer',1.25],rabbit:['rabbit',1.25],hare:['rabbit',1.4,0xd8c8a8],fox:['fox',1.05],goat:['goat',1],pig:['pig',1]};
for(const t in CRM)if(ANIMALS[t]){ANIMALS[t].m.cr=CRM[t][0];ANIMALS[t].m.cs=CRM[t][1];if(CRM[t][2])ANIMALS[t].m.ct=CRM[t][2]}
ANIMALS.deer.hh=2.1;ANIMALS.cow.hh=1.7;
const _mq0=makeQuad,_mw0=makeWolf;
makeQuad=function(o){if(!CR.ok||!o.cr)return _mq0(o);const opts=o.cr.split('|'),k=opts[Math.floor(Math.random()*opts.length)];if(!CR.lib[k])return _mq0(o);return makeCreature(k,o.cs||1,o.ct)};
makeWolf=function(col=0x6b6b6b){if(!CR.ok)return _mw0(col);
  if(col===0x16161e){const m=makeCreature('panther',1.05);return m}
  const m=makeCreature('wolf',1.18,new T.Color(col).multiplyScalar(2.4).getHex());return m};

/* ---------- Extra 3D hair styles (Quaternius): beard, buns, buzzed, long ---------- */
async function loadHair3d(){
  try{const buf=await asFetchBin('assets/hair/hair3d.bin'),dv=new DataView(buf),hl=dv.getUint32(0,true),h=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl))),base=4+hl;
    for(const k in h){const e=h[k];HAIR3D[k]={tex:(k==='buns'||k==='long3d')?2:1,pos:new Float32Array(buf.slice(base+e.po,base+e.po+e.v*12)),nor:new Float32Array(buf.slice(base+e.no,base+e.no+e.v*12)),uv:new Float32Array(buf.slice(base+e.uo,base+e.uo+e.v*8)),idx:new Uint16Array(buf.slice(base+e.io,base+e.io+e.i*2))}}
    const names={buzzed:'Kortgeschoren',buns:'Knotten',long3d:'Lang (3D)'};
    if(HAIR3D.buzzed)HAIR3D.buzzedf=HAIR3D.buzzed;for(const k in names)if(HAIR3D[k]&&!HAIRSTYLES.some(x=>x[0]===k))HAIRSTYLES.push([k,names[k]]);
    if(HAIR3D.beard&&!HAIR3D.beard.fit){const B=HAIR3D.beard,P=B.pos;B.fit=1;for(let i=0;i<P.length;i+=3){let x=P[i]*.86,y=P[i+1]*.64+.068,z=P[i+2]*.62;const dy=y-.17,n=Math.sqrt((x/.15)**2+(dy/.17)**2+(z/.15)**2);if(n<1.07&&z>-.02){const f=1.07/Math.max(n,.2);x*=f;z*=f;y=.17+dy*f}P[i]=x;P[i+1]=y;P[i+2]=z}}
    if(HAIR3D.beard&&!BEARDS.some(x=>x[0]==='beard3d'))BEARDS.push(['beard3d','Baard (3D)'])}
  catch(e){console.warn('hair3d',e)}}
/* ---------- Torch (Medieval Torch, CC0) ---------- */
const TORCH={geo:null,mat:null,h:3.28};
async function loadTorch(){
  try{const buf=await asFetchBin('assets/torch/torch.bin'),dv=new DataView(buf),hl=dv.getUint32(0,true),e=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl))),base=4+hl;
    const P=new Int16Array(buf.slice(base+e.po,base+e.po+e.v*6)),N=new Int8Array(buf.slice(base+e.no,base+e.no+e.v*4)),C=new Uint8Array(buf.slice(base+e.co,base+e.co+e.v*4)),I=new Uint16Array(buf.slice(base+e.io,base+e.io+e.i*2));
    const pos=new Float32Array(e.v*3),nor=new Float32Array(e.v*3),col=new Float32Array(e.v*3);
    for(let i=0;i<e.v;i++)for(let j=0;j<3;j++){pos[i*3+j]=P[i*3+j]*e.sc;nor[i*3+j]=N[i*4+j]/127;col[i*3+j]=C[i*4+j]/255}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setIndex(new T.BufferAttribute(I,1));g.computeBoundingSphere();
    TORCH.geo=g;TORCH.h=e.h;TORCH.mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:.2,side:T.DoubleSide})}
  catch(e){console.warn('torch',e)}}
/* ---------- Boot ---------- */
const _boot0=boot;
boot=async function(){setLoad('3D-modellen laden');await loadAssets('world');await loadCreatures();if(!HAIR3D.buzzed)await loadHair3d();await loadTorch();await loadSkel();await loadForestMonster();await loadFourHands();await loadLavaTurtle();if(AS.ok)asBeforeWorld();await _boot0();console.log('Eikendal world ready in',Math.round(performance.now()-AS.t0),'ms');
  if(!AS.ok){const n=$('startnote');if(n)n.innerHTML+='<br><b style="color:#e0b04a">De 3D-modellen zijn niet geladen</b>'+(AS.err==='file'?': open het spel met <b>Start Eikendal.command</b> (of via een lokale webserver), niet rechtstreeks als bestand.':' (map assets ontbreekt of internet is nodig voor de 3D-bibliotheek). Je speelt nu met de eenvoudige modellen.')}};
function asBeforeWorld(){
  try{asSky()}catch(e){console.warn('sky',e)}
  const X=AS.tex,set=(m,map,rep)=>{if(!m||!map)return;m.map=map;m.color.setHex(0xffffff);m.needsUpdate=true};
  set(MAT.stone,X.unevenbrick);if(X.unevenbrick_n){MAT.stone.normalMap=X.unevenbrick_n;MAT.stone.normalScale=new T.Vector2(.8,.8)}
  set(MAT.tile,X.roundtiles);set(MAT.wood,X.woodplanks);set(MAT.rock,X.rocks);MAT.rock.color.setHex(0xd8d4cc);
  const bark=AS.lib.CommonTree_1&&AS.lib.CommonTree_1.getObjectByProperty('type','Mesh');if(bark&&bark.material.map){MAT.bark.map=bark.material.map;MAT.bark.needsUpdate=true}
  if(X.cobble){X.cobble.repeat.set(1,1);TEX.cobble=X.cobble}
  if(X.noise_terrain&&X.noise_terrain.image){TEX.grass=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#d6d6d6';g.fillRect(0,0,w,h);g.globalCompositeOperation='multiply';g.globalAlpha=.6;g.drawImage(X.noise_terrain.image,0,0,w,h);g.globalAlpha=1;g.globalCompositeOperation='source-over';speckle(g,w,h,9000,['#fff','#9a9a9a','#c4c4c4','#a8a8a8'],3)},1,1)}}
/* compile all shaders while the loading screen is still up, so the first frames after starting do not stall */
const _pfC=populateFantasy;
populateFantasy=function(){_pfC();if(AS.ok){setLoad('shaders voorbereiden');try{renderer.compile(scene,camera)}catch(e){console.warn('precompile',e)}}};
window.AS=AS;Object.assign(AS,{TLOD,CH:AS_CH,GR});
}catch(e){console.error('eikendal-assets.js failed',e)}
initStart();

/* ---------- skeletten (Bones-pack: LowPoly Skeleton / King) ---------- */
const SK={ok:false,lib:{}};
async function loadSkel(){
  try{const buf=await asFetchBin('assets/skel/skel.bin'),dv=new DataView(buf),hl=dv.getUint32(0,true),h=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl))),base=4+hl;
    for(const key in h){const H=h[key],V={};
      for(const g in H){const e=H[g];if(!e||!e.v)continue;
        const P=new Int16Array(buf.slice(base+e.po,base+e.po+e.v*6)),C=new Uint8Array(buf,base+e.co,e.v*3),pos=new Float32Array(e.v*3),col=new Float32Array(e.v*3);
        for(let i=0;i<e.v*3;i++){pos[i]=P[i]*.001;col[i]=C[i]/255}
        const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('color',new T.BufferAttribute(col,3));geo.computeVertexNormals();geo.computeBoundingSphere();V[g]={geo,p:e.p,par:e.par}}
      V.handR=H.handR;V.handL=H.handL;SK.lib[key]=V}
    SK.mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:.05,flatShading:true});SK.ok=true}
  catch(e){console.warn('skel',e)}}
const _mh0=makeHuman;
makeHuman=function(o={}){
  const h=_mh0((o.skull&&SK.ok)?{...o,proc:true}:o);if(!o.skull||!SK.ok)return h;
  const king=o.hat==='crown',L=SK.lib[king?'king':'skel'],rig=h.rig;
  rig.traverse(m=>{if(m.isMesh)m.visible=false});
  const grp={torso:h.torso,head:h.head,aR:h.armR,aL:h.armL,lR:h.legR,lL:h.legL};
  for(const g of['torso','head','aR','aL','lR','lL'])grp[g].position.set(...L[g].p);
  for(const g of['eR','eL','kR','kL']){const n=new T.Group();n.position.set(...L[g].p);grp[L[g].par].add(n);grp[g]=n}
  for(const g in grp){if(!L[g])continue;const m=new T.Mesh(L[g].geo,SK.mat);m.castShadow=true;grp[g].add(m)}
  /* weapon-hand and shield-hand follow the forearm */
  grp.eR.add(h.hand);h.hand.position.set(...L.handR);grp.eL.add(h.off);h.off.position.set(L.handL[0]+.02,L.handL[1],L.handL[2]+.1);
  if(o.cape){const cp=new T.Mesh(new T.BoxGeometry(.4,.95,.03),cm(o.cape),0,0,0);cp.position.set(0,1.1,-.17);cp.rotation.x=.07;cp.castShadow=true;rig.add(cp)}
  if(o.hat==='horned'){for(const x of[-1,1]){const hn=new T.Mesh(new T.ConeGeometry(.045,.3,6),MAT.iron);hn.position.set(x*.11,.3,0);hn.rotation.z=-x*.5;h.head.add(hn)}}
  h.bn={eR:grp.eR,eL:grp.eL,kR:grp.kR,kL:grp.kL};return h};
const _ah1=animHuman;
animHuman=function(h,dt,speed,o={}){_ah1(h,dt,speed,o);const b=h&&h.bn;if(!b)return;
  const mv=Math.min(1,Math.min(speed,12)/3.5),ph=h.phase;
  const kr=Math.max(0,-Math.cos(ph))*.9*mv,kl=Math.max(0,Math.cos(ph))*.9*mv;
  b.kR.rotation.x+=(kr-b.kR.rotation.x)*.4;b.kL.rotation.x+=(kl-b.kL.rotation.x)*.4;
  const el=-.28-(h.atk>0?.35:0)-(h.draw>0?.7:0)-mv*.15;b.eR.rotation.x+=(el-b.eR.rotation.x)*.3;b.eL.rotation.x+=(-.28-(h.block>0?.9:0)-mv*.15-b.eL.rotation.x)*.3;
  if(o.dead){b.kR.rotation.x=b.kL.rotation.x=.4}};

/* ---------- Boommonster (Forest Monster, CC0) als Levende Boom ---------- */
const FM={ok:false};
async function loadForestMonster(){
  try{const buf=await asFetchBin('assets/monster/monster.bin'),dv=new DataView(buf),hl=dv.getUint32(0,true),h=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl))),base=4+hl;
    const mk=e=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buf.slice(base+e.po,base+e.po+e.v*12)),3));g.setAttribute('uv',new T.BufferAttribute(new Float32Array(buf.slice(base+e.uo,base+e.uo+e.v*8)),2));g.setIndex(new T.BufferAttribute(new Uint16Array(buf.slice(base+e.io,base+e.io+e.i*2)),1));g.computeVertexNormals();g.computeBoundingSphere();return g};
    FM.body=mk(h.body);FM.tree=mk(h.tree);
    const tl=new T.TextureLoader(),tx=(u,lin)=>new Promise(r=>tl.load(u,t=>{t.anisotropy=4;if(lin)t.encoding=T.LinearEncoding;r(t)},undefined,()=>r(null)));
    const [skin,norm,leaf]=await Promise.all([tx('assets/monster/skin.jpg'),tx('assets/monster/norm.jpg',1),tx(h.leaf)]);
    FM.mBody=new T.MeshStandardMaterial({map:skin,normalMap:norm,roughness:.92,metalness:0});
    FM.mTree=new T.MeshStandardMaterial({map:leaf,roughness:.85,alphaTest:.5,side:T.DoubleSide});
    FM.ok=true}catch(e){console.warn('forest monster',e)}}
const _mt0=makeTreant;
makeTreant=function(){
  if(!FM.ok)return _mt0();
  const g=new T.Group(),rig=new T.Group();g.add(rig);const body=new T.Group();rig.add(body);
  const b=new T.Mesh(FM.body,FM.mBody),t=new T.Mesh(FM.tree,FM.mTree);b.castShadow=t.castShadow=true;b.receiveShadow=true;body.add(b);const crown=new T.Group();crown.add(t);body.add(crown);
  return{g,rig,body,crown,legs:[0,1,2,3].map(()=>new T.Object3D()),armL:new T.Object3D(),armR:new T.Object3D(),eyes:[],phase:0,fm:1}};
const _ue9=updateEnemy;
updateEnemy=function(a,dt){_ue9(a,dt);const m=a.model;if(!m||!m.fm||a.dead)return;
  const mv=Math.min(1,(a.vel||0)/3),t=performance.now()/1000,k=Math.min(1,dt*8);
  m.body.rotation.x+=((m.armR.rotation.x*.2)-m.body.rotation.x)*k;
  m.body.rotation.z=Math.sin(m.phase*.9)*.05*mv;m.body.position.y=Math.abs(Math.sin(m.phase*.9))*.12*mv;
  m.crown.rotation.z=Math.sin(t*1.3+a.x)*.025+Math.sin(m.phase*.9)*.05*mv;m.crown.rotation.x=Math.cos(t*1.1+a.z)*.02;
  const br=Math.sin(t*1.6+a.id)*.012,st=Math.sin(m.phase*1.8),sq=1+br+mv*st*.035;m.body.scale.set(1/Math.sqrt(sq),sq,1/Math.sqrt(sq));
  const w=a.wind||0;if(w>0){m.body.rotation.x+=.0;m.body.scale.y*=1+Math.min(.1,w*.1)}};

/* ---------- Vierhandige Verschrikking (rigged FBX, idle-animatie) ---------- */
const FH={ok:false};
async function loadFourHands(){
  if(!T.FBXLoader)return;
  try{setLoad('monster laden');const buf=await asFetchBin('assets/fourhands/monster.fbx');FH.src=new T.FBXLoader().parse(buf,'assets/fourhands/');
    const tl=new T.TextureLoader(),tx=(n,lin)=>new Promise(r=>tl.load('assets/fourhands/'+n,t=>{t.anisotropy=4;if(lin)t.encoding=T.LinearEncoding;r(t)},undefined,()=>r(null)));
    const [map,nrm,rgh,emi,ao]=await Promise.all([tx('color.jpg'),tx('normal.jpg',1),tx('rough.jpg',1),tx('emis.jpg'),tx('ao.jpg',1)]);
    let pm=map;if(!pm){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#5d6650';g.fillRect(0,0,512,512);
      let sd=7;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
      for(let i=0;i<900;i++){const x=rn()*512,y=rn()*512,r=6+rn()*34;g.fillStyle='rgba('+(rn()<.5?'30,36,26':'120,128,96')+','+(.05+rn()*.12)+')';g.beginPath();g.arc(x,y,r,0,6.283);g.fill()}
      g.strokeStyle='rgba(60,25,25,.35)';g.lineWidth=1.2;for(let i=0;i<140;i++){g.beginPath();let x=rn()*512,y=rn()*512;g.moveTo(x,y);for(let k=0;k<6;k++){x+=(rn()-.5)*40;y+=(rn()-.5)*40;g.lineTo(x,y)}g.stroke()}
      pm=new T.CanvasTexture(c);pm.wrapS=pm.wrapT=T.RepeatWrapping;pm.anisotropy=4}
    /* textures of the Big Monster (T_Skin1_BigMonster_*): colour, normal, roughness, glowing eyes and veins, ambient occlusion */
    FH.mat=new T.MeshStandardMaterial({color:0xffffff,map:pm,normalMap:nrm,normalScale:new T.Vector2(1,-1),roughnessMap:rgh,roughness:1,metalness:0,skinning:true,emissiveMap:emi,emissive:emi?0xff8a3a:0x000000,emissiveIntensity:emi?2.6:0,aoMap:ao,aoMapIntensity:.85});
    FH.clip=FH.src.animations[0];
    /* afmetingen en kijkrichting uit het skelet halen */
    FH.src.updateMatrixWorld(true);const bb=new T.Box3(),P=new T.Vector3();let head=null,tail=null;
    FH.src.traverse(o=>{if(o.isBone){o.getWorldPosition(P);bb.expandByPoint(P);if(/golova$/.test(o.name))head=P.clone();if(/hvost$/.test(o.name))tail=P.clone()}});
    FH.box=bb;FH.yaw=0;if(head&&tail){const d=head.sub(tail);FH.yaw=-Math.atan2(d.x,d.z)}
    FH.ok=!!FH.clip}catch(e){console.warn('fourhands',e)}}
function makeFourHands(){
  if(!FH.ok)return makeTreant();
  const o=T.SkeletonUtils.clone(FH.src),H=30,sy=FH.box.max.y-FH.box.min.y,sc=H/Math.max(.01,sy*1.08);
  o.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.material=FH.mat;const g=m.geometry;if(g.attributes.uv&&!g.attributes.uv2)g.setAttribute('uv2',g.attributes.uv)});
  const g=new T.Group(),rig=new T.Group(),body=new T.Group();g.add(rig);rig.add(body);body.add(o);
  o.scale.setScalar(sc);o.rotation.y=FH.yaw;o.position.y=-FH.box.min.y*sc+.04;
  const mixer=new T.AnimationMixer(o),act=mixer.clipAction(FH.clip);act.play();mixer.update(Math.random()*3);
  return{g,rig,body,legs:[0,1,2,3].map(()=>new T.Object3D()),armL:new T.Object3D(),armR:new T.Object3D(),eyes:[],phase:0,fh:1,gl:true,mixer,act}}
const _ahf=animHorse;
animHorse=function(h,dt,speed){if(!h||!h.fh)return _ahf(h,dt,speed);
  h.act.timeScale=1+Math.min(1.6,speed*.25);h.phase+=dt*(speed>.1?3+speed*.8:0);
  if(h.g.visible!==false)h.mixer.update(dt);
  const mv=Math.min(1,speed/3);h.body.position.y=Math.abs(Math.sin(h.phase))*.1*mv;h.body.rotation.z=Math.sin(h.phase)*.04*mv;
  h.body.rotation.x+=((h.armR.rotation.x*.18)-h.body.rotation.x)*Math.min(1,dt*8)};

/* ---------- Lavaschildpad (Giant Galapagos, geriggd FBX + eigen animatieclips) ---------- */
const LT={ok:false};
async function loadLavaTurtle(){
  if(!T.FBXLoader)return;
  try{setLoad('lavaschildpad laden');
    const [fb,cb,cb2]=await Promise.all([asFetchBin('assets/lava/turtle.fbx'),asFetchBin('assets/lava/clips.json'),asFetchBin('assets/lava/clips2.json').catch(()=>null)]);
    LT.src=new T.FBXLoader().parse(fb,'assets/lava/');
    const J=JSON.parse(new TextDecoder().decode(new Uint8Array(cb)));LT.clips={};
    if(cb2)Object.assign(J,JSON.parse(new TextDecoder().decode(new Uint8Array(cb2))));   /* extra clips: stun, knock, idle3, tired */
    for(const k in J){const tr=J[k].tr.map(t=>t.k==='q'?new T.QuaternionKeyframeTrack(t.n,t.t,t.v):new T.VectorKeyframeTrack(t.n,t.t,t.v));LT.clips[k]=new T.AnimationClip(k,J[k].d,tr)}
    const tl=new T.TextureLoader(),tx=u=>new Promise(r=>tl.load(u,t=>{t.anisotropy=4;r(t)},undefined,()=>r(null)));
    const [map,em,nrm,rgh]=await Promise.all([tx('assets/lava/color.jpg'),tx('assets/lava/emis.jpg'),tx('assets/lava/normal.jpg'),tx('assets/lava/rough.jpg')]);
    if(nrm)nrm.encoding=T.LinearEncoding;
    LT.mat=new T.MeshStandardMaterial({color:0xffffff,map,emissiveMap:em,emissive:0xffffff,emissiveIntensity:1.5,normalMap:nrm,roughnessMap:rgh,roughness:1,metalness:0,skinning:true});
    LT.src.updateMatrixWorld(true);const bb=new T.Box3(),P=new T.Vector3();let head=null,tail=null;
    LT.src.traverse(o=>{if(o.isBone){o.getWorldPosition(P);bb.expandByPoint(P);if(o.name==='Skin_Bone001_Head001')head=P.clone();if(o.name==='Bip001_TailNub')tail=P.clone()}});
    LT.box=bb;LT.yaw=0;if(head&&tail){const d=head.sub(tail);LT.yaw=-Math.atan2(d.x,d.z)}
    LT.ok=true}catch(e){console.warn('lavaturtle',e)}}
function makeLavaTurtle(){
  if(!LT.ok)return makeTreant();
  const o=T.SkeletonUtils.clone(LT.src),H=5.4,sc=H/Math.max(.01,LT.box.max.y-LT.box.min.y);
  o.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.material=LT.mat});
  const g=new T.Group(),rig=new T.Group(),body=new T.Group();g.add(rig);rig.add(body);body.add(o);
  o.scale.setScalar(sc);o.rotation.y=LT.yaw;o.position.y=-LT.box.min.y*sc+.02;
  const mixer=new T.AnimationMixer(o);
  const m={g,rig,body,legs:[0,1,2,3].map(()=>new T.Object3D()),armL:new T.Object3D(),armR:new T.Object3D(),eyes:[],phase:0,lt:1,gl:true,mixer,acts:{},cur:null,cn:''};
  ltPlay(m,'idle');mixer.update(Math.random()*5);return m}
function ltPlay(m,n,once){
  if(m.cn===n)return;const c=LT.clips[n];if(!c)return;
  const act=m.acts[n]||(m.acts[n]=m.mixer.clipAction(c));act.enabled=true;act.reset();act.setLoop(once?T.LoopOnce:T.LoopRepeat,Infinity);act.clampWhenFinished=!!once;act.setEffectiveWeight(1);act.fadeIn(.2);act.play();
  if(m.cur&&m.cur!==act)m.cur.fadeOut(.2);m.cur=act;m.cn=n}
function ltAnim(a,dt){
  const m=a.model;if(!m||!m.lt||a.root.visible===false)return;
  const v=a.vel||0;let n='idle',ts=1,once=false;
  /* hit reactions: a heavy blow stuns or knocks the turtle back for a moment */
  if(a.hp<(m.lastHp??a.hp)&&!a.dead){const lost=(m.lastHp-a.hp)/a.hpMax;m.react=lost>.18&&LT.clips.knock?['knock',1.1]:lost>.1&&LT.clips.stun?['stun',.9]:['hit',.45];m.reactT=m.react[1]}m.lastHp=a.hp;
  if(m.reactT>0)m.reactT-=dt;
  if(a.dead){n='die';once=true}else if(m.reactT>0){n=m.react[0];once=true;ts=1.4}else if(a.wind>0){n=m.atk2?'atk2':'atk';ts=m.atk2?3.6:2.4;once=true}else if(v>4.8){n='run';ts=Math.min(1.6,v/6)}else if(v>.4){n='walk';ts=Math.min(1.6,Math.max(.6,v/2.4))}
  else if(LT.clips.idle3){m.idleT=(m.idleT||rnd(8,16))-dt;if(m.idleT<0){m.idleAlt=m.idleAlt?null:pick(['idle3','tired']);m.idleT=m.idleAlt?LT.clips[m.idleAlt].duration:rnd(8,16)}if(m.idleAlt)n=m.idleAlt}
  if(a.wind<=0&&m.wasWind)m.atk2=Math.random()<.35;m.wasWind=a.wind>0;
  ltPlay(m,n,once);if(m.cur)m.cur.timeScale=ts;
  m.phase+=dt;if(a.dead&&a.root)a.root.rotation.z=0;
  m.mixer.update(dt)}
const _ahl=animHorse;animHorse=function(h,dt,speed){if(h&&h.lt)return;return _ahl(h,dt,speed)};
const _uel=updateEnemy;updateEnemy=function(a,dt){_uel(a,dt);if(!a.dead&&a.model&&a.model.lt)ltAnim(a,dt)};
const _uaL=updateActors;updateActors=function(dt){_uaL(dt);for(const a of actors)if(a.dead&&a.model&&a.model.lt)ltAnim(a,dt)};

/* ---------- eenhoorn-hoorn op het voorhoofd (kopbot) ---------- */
window.unicornHorn=function(a){try{const m=a.model;if(!m||!m.gl||!m.model)return false;const B=m.model.userData.bones,head=B&&B.head;if(!head)return false;
  a.root.updateMatrixWorld(true);const M=m.model,hw=head.getWorldPosition(new T.Vector3()),ml=new T.Matrix4().copy(M.matrixWorld).invert(),hm=hw.clone().applyMatrix4(ml),k=hm.y/1.95||1;
  const ptM=new T.Vector3(0,1.99*k,1.52*k),dirM=new T.Vector3(0,.36,.93).normalize();
  const horn=new T.Mesh(new T.ConeGeometry(.045*k,.8*k,8),new T.MeshStandardMaterial({color:0xfff0b8,emissive:0xffe9a0,emissiveIntensity:.55,roughness:.3}));
  const pw=ptM.clone().applyMatrix4(M.matrixWorld);horn.position.copy(head.worldToLocal(pw));
  const qd=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dirM),qm=M.getWorldQuaternion(new T.Quaternion()),qh=head.getWorldQuaternion(new T.Quaternion());
  horn.quaternion.copy(qh.invert().multiply(qm).multiply(qd));horn.castShadow=false;head.add(horn);return true}catch(e){console.warn('horn',e);return false}};
