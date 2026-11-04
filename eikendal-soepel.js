/* ================= Soepel: draw only what is near =================
   The game was slow even on the lowest settings because it drew everything in the world every frame: thousands of
   trees, rocks, houses and plants kilometres away (most of the time went into drawing, not into the game itself).
   Now everything that stands still and lies farther than a few hundred metres is simply not drawn; the ground, the
   sky and the sea always are. The distance adapts by itself: when the game gets slow it draws less far (with a little
   more haze so you do not see things pop up), and when it runs smoothly again it draws farther. It can be switched off
   in the pause menu (H): "Automatisch soepel". */
(function(){
const S={on:true,D:300,cands:[],meta:new WeakMap(),i:0,t:0,frames:0,ft:0,fps:60,lowT:0,highT:0,collectT:2};WD.soepel=S;
try{const v=localStorage.getItem('eikendal_soepel');if(v==='0')S.on=false}catch(e){}
const v3=new T.Vector3();
function sphere(o,m){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const bs=g.boundingSphere;
  if(o.isInstancedMesh){const a=o.instanceMatrix.array;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y=0;for(let i=0;i<o.count;i++){const x=a[i*16+12],z=a[i*16+14];if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z;y=a[i*16+13]}
    if(!o.count){m.r=-1;return}v3.set((x0+x1)/2,y,(z0+z1)/2).applyMatrix4(o.matrixWorld);m.x=v3.x;m.z=v3.z;m.r=Math.hypot(x1-x0,z1-z0)/2*o.matrixWorld.getMaxScaleOnAxis()+bs.radius;m.ver=o.instanceMatrix.version;m.cnt=o.count}
  else{v3.copy(bs.center).applyMatrix4(o.matrixWorld);m.x=v3.x;m.z=v3.z;m.r=bs.radius*o.matrixWorld.getMaxScaleOnAxis()}}
/* gather what may be hidden: still things, not people, animals, players, the ground, the sky or the sea */
function collect(){const keep=new Set();for(const a of actors)if(a.root)keep.add(a.root);if(window.pm&&pm.g)keep.add(pm.g);
  const ground=new Set();try{for(const c of WD.chunks||[])ground.add(c.m)}catch(e){}
  const list=[];scene.updateMatrixWorld();
  scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||ground.has(o)||(o.userData&&o.userData.noCull))return;let top=o;while(top.parent&&top.parent!==scene)top=top.parent;if(keep.has(top)||(top.userData&&top.userData.dyn))return;
    let m=S.meta.get(o);if(!m){m={top,tx:top.position.x,tz:top.position.z,mask:o.layers.mask,dyn:false,hid:false,small:o.isInstancedMesh&&/grass|flower|clover|fern|plant|mushroom|pebble|bush|petal|weed/i.test((o.material&&o.material.name)||'')};try{sphere(o,m)}catch(e){return}if(m.r<0||m.r>300)return;S.meta.set(o,m)}if(!m.dyn)list.push(o)});
  S.cands=list;S.i=0}
function show(o,m,v){if(v===!m.hid)return;m.hid=!v;o.layers.mask=v?m.mask:0}
/* check a slice of them each frame, so there are no hitches */
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;S.frames++;S.ft+=dt;if(S.ft>=1){S.fps=S.frames/S.ft;S.frames=0;S.ft=0;adapt()}
  if(!started)return;S.collectT-=dt;if(S.collectT<=0){S.collectT=25;collect()}
  const L=S.cands,n=L.length;if(!n)return;const cam=camera.position,per=Math.max(400,Math.ceil(n/12));
  for(let k=0;k<per&&k<n;k++){S.i=(S.i+1)%n;const o=L[S.i],m=S.meta.get(o);if(!m||m.dyn)continue;
    if(!S.on){show(o,m,true);continue}
    if(Math.abs(m.top.position.x-m.tx)>.5||Math.abs(m.top.position.z-m.tz)>.5){m.dyn=true;show(o,m,true);continue}
    /* plants that are moved around you all the time are always drawn (they are near anyway) */
    if(o.isInstancedMesh&&(o.instanceMatrix.version!==m.ver||o.count!==m.cnt)){m.chg=(m.chg||0)+1;if(m.chg>3){m.dyn=true;show(o,m,true);continue}try{sphere(o,m)}catch(e){}if(m.r>300){m.dyn=true;show(o,m,true);continue}}
    const d=Math.hypot(m.x-cam.x,m.z-cam.z)-m.r;show(o,m,d<S.D*(m.small?.3:m.r>25?1.6:1))}
  /* people and animals: their moving 3D bodies are the costliest things to draw, so only the ones near you are drawn */
  const A=actors,na=A.length,pa=Math.max(150,Math.ceil(na/8)),CH=Math.min(90,S.D*.35);
  for(let k=0;k<pa&&k<na;k++){S.ai=((S.ai||0)+1)%na;const a=A[S.ai];if(!a||!a.root)continue;let q=a._sp;if(!q){q=a._sp={list:[],hid:false};a.root.traverse(o=>{if(o.isMesh)q.list.push([o,o.layers.mask])})}
    const big=a.boss||a.titan||(a.hh||0)>4||a.flyM,want=!S.on||a===PL.mounted||Math.hypot(a.x-cam.x,a.z-cam.z)<CH*(big?3:1);if(want===!q.hid)continue;q.hid=!want;for(const [o,mk] of q.list)o.layers.mask=want?mk:0}});
/* the distance follows how smoothly the game runs */
function adapt(){if(!started||!S.on||paused)return;if(S.fps<24){S.lowT++;S.highT=0}else if(S.fps>45){S.highT++;S.lowT=0}else{S.lowT=0;S.highT=0}
  if(S.lowT>=2&&S.D>110){S.D=Math.max(110,S.D-50);S.lowT=0}else if(S.highT>=4&&S.D<340){S.D=Math.min(340,S.D+30);S.highT=0}}
/* a little more haze when it draws less far, so things do not pop up at the edge */
const _ueS=updateEnv;updateEnv=function(dt,pp){_ueS(dt,pp);if(pp!==PL||!S.on||PL.inCave||!scene.fog||scene.fog.density===undefined)return;const want=.7/(S.D*1.2);if(scene.fog.density<want)scene.fog.density=want};
/* the switch in the pause menu */
const _rpS=renderPause;renderPause=function(){_rpS();try{const c=$('pset');if(!c||c.querySelector('#soepel'))return;const l=document.createElement('label');l.innerHTML='<span>Automatisch soepel</span><input type="checkbox" id="soepel">';const cb=l.querySelector('input');cb.checked=S.on;
  cb.onchange=()=>{S.on=cb.checked;try{localStorage.setItem('eikendal_soepel',S.on?'1':'0')}catch(e){}};const h3=c.querySelector('h3');c.insertBefore(l,h3?h3.nextSibling:c.firstChild)}catch(e){}};
})();
