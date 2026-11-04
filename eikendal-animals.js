/* ================= Calmer, more natural animals =================
   Up close the animals used to act strangely: they ran straight away from you every frame, shivered against the
   water when they could not go further, and flicked between fleeing and standing still. Now:
   - farm animals (sheep, cows, chickens, pigs) do not flee: they look at you calmly and step aside when you come
     very close;
   - wild animals pick a direction to flee, keep running until they are really far away, speed up and slow down
     gently, and look for another way when they get stuck;
   - when nothing bothers them they graze, stand still a while and wander slowly.
   Better models, close by: deer and elk are the realistic doe, rabbits and hares the realistic hare, both by
   Cestmir Dammer (CC0, see assets/animals2/License.txt). The old models stay
   further away and until the new ones have loaded. */
(function(){
const TAME=new Set(['sheep','cow','chicken','pig']);
function wander(a,dt,sp=1.1){if(a.t<=0){a.t=rnd(4,11);a.wp=Math.random()<.6?[a.home.x+rnd(-10,10),a.home.z+rnd(-10,10)]:null}
  if(a.wp){if(stepTo(a,dt,a.wp[0],a.wp[1],sp,.8)||a.stuck>1.2){a.wp=null;a.stuck=0}}else a.vel=0}
function look(a,dt,k=2){a.rot+=angDiff(a.rot,Math.atan2(PL.x-a.x,PL.z-a.z))*Math.min(1,dt*k)}
updateAnimal=function(a,dt){if(a.frz>0){a.vel=0;return}const d=Math.hypot(PL.x-a.x,PL.z-a.z),fl=a.flee||10;a.t-=dt;
  if(TAME.has(a.type)){
    if(d<2.4&&!a.aside){const an=Math.atan2(a.x-PL.x,a.z-PL.z)+rnd(-.6,.6);a.aside=[a.x+Math.sin(an)*3,a.z+Math.cos(an)*3]}
    if(a.aside){if(stepTo(a,dt,a.aside[0],a.aside[1],1.4,.4)||a.stuck>1){a.aside=null;a.stuck=0;a.t=rnd(2,5);a.wp=null}}
    else if(d<7){a.vel=0;look(a,dt,1.5)}else wander(a,dt,.9)}
  else{
    const scared=a.fleeing?d<fl*1.9:(d<fl&&!PL.mounted)||d<fl*.6;
    if(scared){if(!a.fleeing){a.fleeing=true;a.fdir=Math.atan2(a.x-PL.x,a.z-PL.z)+rnd(-.5,.5);a.fsp=a.speed*.4;a.ft=0}
      a.ft-=dt;if(a.ft<=0){a.ft=.9;const away=Math.atan2(a.x-PL.x,a.z-PL.z);a.fdir+=angDiff(a.fdir,away)*.5}
      if(a.stuck>.5){a.fdir+=(Math.random()<.5?1:-1)*(1.2+Math.random());a.stuck=0}
      a.fsp+=(a.speed-a.fsp)*Math.min(1,dt*2.2);stepTo(a,dt,a.x+Math.sin(a.fdir)*6,a.z+Math.cos(a.fdir)*6,a.fsp,.1)}
    else{if(a.fleeing){a.fleeing=false;a.t=rnd(2,4);a.wp=null}if(d<fl*1.4){a.vel=0;look(a,dt,3)}else wander(a,dt)}}
  animHorse(a.model,dt,a.vel*(a.type==='deer'?.55:.9))};

/* ---------- the new models ---------- */
const A2={ok:false,lib:{}};WD.animals2=A2;
/* the Quaternius farm animals looked odd in motion, so only the realistic doe is used for now */
const MAPA={deer:{k:'doe',h:1.45},elk:{k:'doe',h:1.95,tint:0x8a6a4a},rabbit:{k:'rabbit',h:.34},hare:{k:'rabbit',h:.46,tint:0x9a8060}};
async function loadA2(){const mgr=new T.LoadingManager();mgr.setURLModifier(u=>{const m=/(doe-body|doe-head|Fur-skin|rabbit-skinn)\.png$/i.exec(u);return m?'assets/animals2/'+m[1]+'.jpg':u});
  const fbx=async n=>{const buf=await asFetchBin('assets/animals2/'+n+'.fbx');return new T.FBXLoader(mgr).parse(buf,'assets/animals2/')};
  try{const g=await fbx('rabbit');g.traverse(m=>{if(!m.isMesh)return;for(const x of Array.isArray(m.material)?m.material:[m.material]){x.normalMap=null;x.needsUpdate=true}});A2.lib.rabbit={scene:g,clips:g.animations||[]}}catch(e){console.warn('rabbit model',e)}
  try{const g=await fbx('deer-female-mesh'),idle=await fbx('deer-female-anim-idle'),run=await fbx('deer-female-anim-run');const clips=[];
    if(idle.animations[0]){const c=idle.animations[0].clone();c.name='Idle';clips.push(c)}if(run.animations[0]){const c=run.animations[0].clone();c.name='Run';clips.push(c)}A2.lib.doe={scene:g,clips};
    /* the doe's textures are named differently inside the file: give them by hand */
    const tl=new T.TextureLoader(),tb=tl.load('assets/animals2/doe-body.jpg'),th=tl.load('assets/animals2/doe-head.jpg'),done=new Set();
    g.traverse(m=>{if(!m.isMesh)return;for(const x of Array.isArray(m.material)?m.material:[m.material]){if(done.has(x))continue;done.add(x);const n=(x.name||'').toLowerCase();x.map=n.includes('head')?th:n.includes('body')?tb:null;if(!x.map)x.color.setHex(0x1a1410);else x.color.setHex(0xffffff);x.shininess=6;x.needsUpdate=true}})}catch(e){console.warn('doe model',e)}
  for(const k in A2.lib){const L=A2.lib[k];L.scene.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(L.scene);L.h=Math.max(.01,bb.max.y-bb.min.y);L.y0=bb.min.y;
    /* skinned models can be posed bigger or smaller than their raw mesh: measure the real, posed height */
    let lo=1e9,hi=-1e9;const v=new T.Vector3();L.scene.traverse(m=>{if(!m.isSkinnedMesh)return;m.skeleton.update();const P=m.geometry.attributes.position,st=Math.max(1,Math.floor(P.count/400));for(let i=0;i<P.count;i+=st){v.fromBufferAttribute(P,i);m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);lo=Math.min(lo,v.y);hi=Math.max(hi,v.y)}});
    if(hi>lo&&hi-lo<L.h*4&&hi-lo>L.h/4){L.h=hi-lo;L.y0=lo}
    L.scene.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false}})}
  A2.ok=Object.keys(A2.lib).length>0}
const clipBy=(L,re)=>L.clips.find(c=>re.test(c.name));
function upgrade(a){const M=MAPA[a.type];if(!M)return;const L=A2.lib[M.k];a.up2=true;if(!L||!a.model||!a.model.g)return;
  const c=T.SkeletonUtils.clone(L.scene),s=M.h/L.h;c.scale.multiplyScalar(s);c.position.y=-L.y0*s;
  if(M.tint)c.traverse(m=>{if(m.isMesh&&m.material){m.material=m.material.clone();if(m.material.color)m.material.color.lerp(new T.Color(M.tint),.45)}});
  a.model.g.traverse(m=>{if(m.isMesh)m.visible=false});const holder=new T.Group();holder.add(c);a.model.g.add(holder);
  const mx=new T.AnimationMixer(c),acts={};for(const [k,re] of[['walk',/walk/i],['run',/run|gallop/i],['idle',/idle|stand|basic|sitting/i],['eat',/eat|graz/i]]){const cl=clipBy(L,re);if(cl)acts[k]=mx.clipAction(cl)}
  if(!acts.walk&&acts.run)acts.walk=acts.run;if(!acts.walk){const j=clipBy(L,/jump|hop/i);if(j){acts.walk=mx.clipAction(j);acts.walk.timeScale=.75}}if(!acts.idle)acts.idle=acts.eat||acts.walk;let cur=null;
  const play=k=>{const A=acts[k]||acts.idle;if(!A||A===cur)return;A.reset().fadeIn(.25).play();if(cur)cur.fadeOut(.25);cur=A};play('idle');
  const hopper=!acts.walk&&!acts.run;
  a.model.anim=(dt,v)=>{if(hopper){holder.position.y=v>.25?Math.abs(Math.sin(performance.now()/1000*10))*M.h*.3:0;holder.rotation.x=v>.25?-.15:0}const sp=v/Math.max(.4,s);if(v>3.2&&acts.run){play('run');acts.run.timeScale=Math.min(1.6,v/5)}else if(v>.25){play('walk');if(acts.walk)acts.walk.timeScale=Math.max(.25,Math.min(1.6,v/5))}
    else{a.grazeT=(a.grazeT||0)-dt;if(a.grazeT<=0){a.grazeT=rnd(4,10);a.grazing=!!acts.eat&&Math.random()<.5}play(a.grazing?'eat':'idle')}mx.update(dt)}}
setTimeout(function wait(){if(typeof worldReady==='undefined'||!worldReady||!window.asFetchBin||!T.FBXLoader||!T.SkeletonUtils){setTimeout(wait,1500);return}loadA2().catch(e=>console.warn('animals2',e))},1500);
const _ua=updateAnimal;updateAnimal=function(a,dt){if(A2.ok&&!a.up2&&MAPA[a.type]&&Math.hypot(PL.x-a.x,PL.z-a.z)<120)try{upgrade(a)}catch(e){a.up2=true;console.warn('upgrade animal',e)}return _ua(a,dt)};
})();
