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
/* gathering is done a little at a time, a few milliseconds per frame, so the game never stops for it */
function* collectJob(){const keep=new Set();for(const a of actors)if(a.root)keep.add(a.root);if(window.pm&&pm.g)keep.add(pm.g);
  const ground=new Set();try{for(const c of WD.chunks||[])ground.add(c.m)}catch(e){}
  /* (the world matrices are already up to date: the renderer updates them every frame; people, animals and moving things are skipped whole) */
  const list=[];let n=0;for(const c of scene.children.slice()){if(keep.has(c)||(c.userData&&c.userData.dyn))continue;c.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||ground.has(o)||(o.userData&&o.userData.noCull))return;const top=c;
    let m=S.meta.get(o);if(!m){m={top,tx:top.position.x,tz:top.position.z,mask:o.layers.mask,dyn:false,hid:false,small:o.isInstancedMesh&&/grass|flower|clover|fern|plant|mushroom|pebble|bush|petal|weed/i.test((o.material&&o.material.name)||'')};try{sphere(o,m)}catch(e){return}if(m.r<0||m.r>300)return;S.meta.set(o,m)}if(!m.dyn)list.push(o);n++});if(n>=150){n=0;yield}}
  S.cands=list;S.i=0}
function pump(ms){const t0=performance.now();while(S.job&&performance.now()-t0<ms)if(S.job.next().done){S.job=null;S.collectT=25}}
/* the first, biggest gathering is done while you choose your character, when the computer has time to spare */
const pre=setInterval(()=>{if(typeof worldReady==='undefined'||!worldReady)return;if(started&&!S.job){clearInterval(pre);return}if(!S.job&&!S.cands.length)S.job=collectJob();if(!started)pump(30)},40);
function show(o,m,v){if(v===!m.hid)return;m.hid=!v;o.layers.mask=v?m.mask:0}
/* check a slice of them each frame, so there are no hitches */
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;S.frames++;S.ft+=dt;if(S.ft>=1){S.fps=S.frames/S.ft;S.frames=0;S.ft=0;adapt()}
  if(!started)return;S.collectT-=dt;if(S.collectT<=0&&!S.job){S.collectT=25;S.job=collectJob()}if(S.job)pump(S.fps<30?6:3);
  const L=S.cands,n=L.length;if(!n)return;const cam=camera.position,per=Math.max(300,Math.ceil(n/40));
  for(let k=0;k<per&&k<n;k++){S.i=(S.i+1)%n;const o=L[S.i],m=S.meta.get(o);if(!m||m.dyn)continue;
    if(!S.on){show(o,m,true);continue}
    if(Math.abs(m.top.position.x-m.tx)>.5||Math.abs(m.top.position.z-m.tz)>.5){m.dyn=true;show(o,m,true);continue}
    /* plants that are moved around you all the time are always drawn (they are near anyway) */
    if(o.isInstancedMesh&&(o.instanceMatrix.version!==m.ver||o.count!==m.cnt)){m.chg=(m.chg||0)+1;if(m.chg>3){m.dyn=true;show(o,m,true);continue}try{sphere(o,m)}catch(e){}if(m.r>300){m.dyn=true;show(o,m,true);continue}}
    const d=Math.hypot(m.x-cam.x,m.z-cam.z)-m.r;show(o,m,d<S.D*(m.small?.3:m.r>25?1.6:1))}
  /* people and animals: their moving 3D bodies are the costliest things to draw, so only the ones near you are drawn */
  const A=actors,na=A.length,pa=Math.max(150,Math.ceil(na/8)),CH=Math.min(90,S.D*.35);
  for(let k=0;k<pa&&k<na;k++){S.ai=((S.ai||0)+1)%na;const a=A[S.ai];if(!a||!a.root)continue;let q=a._sp;
    /* a body that changed (an animal that got its real model, new gear): show the old parts again and list them anew,
       or the new parts stay drawn with a skeleton that is never moved (that drew a deer a kilometre long at the start) */
    const sig=a.root.children.length*1000+(a.model&&a.model.g&&a.model.g!==a.root?a.model.g.children.length:0);
    if(q&&q.sig!==sig){if(q.hid)for(const [o,mk] of q.list)o.layers.mask=mk;a.root.userData.cullHid=false;q=a._sp=null}
    if(!q){q=a._sp={list:[],hid:false,sig};a.root.traverse(o=>{if(o.isMesh)q.list.push([o,o.layers.mask])})}
    const big=a.boss||a.titan||(a.hh||0)>4||a.flyM,want=!S.on||a===PL.mounted||Math.hypot(a.x-cam.x,a.z-cam.z)<CH*(big?3:1);if(want===!q.hid)continue;q.hid=!want;a.root.userData.cullHid=!want;for(const [o,mk] of q.list)o.layers.mask=want?mk:0}});

/* ---------- less work every frame ----------
   1. Things that are hidden (people and animals far away, houses out of sight) are no longer worked out every frame:
      their position in the world only matters once they are shown again, and then it is worked out at once.
   2. People, animals and monsters far from you are updated a little less often (they are too far to notice it).
   3. Someone who stands still keeps the height of the ground under his feet instead of working it out again. */
{const _umw=T.Object3D.prototype.updateMatrixWorld;T.Object3D.prototype.updateMatrixWorld=function(force){if((this.visible===false||this.userData.cullHid)&&this.parent&&this._mwOk)return;this._mwOk=true;return _umw.call(this,force)}}
let FR=0;{const _uaS=updateActors;updateActors=function(dt){FR++;return _uaS(dt)}}
const slow=(fn,near)=>function(a,dt){if(!a||a.boss||a.titan||a===PL.mounted||a.state==='chase'||a.state==='fight'||a.angry||a.bt||a.cheer)return fn(a,dt);const d=Math.abs(a.x-PL.x)+Math.abs(a.z-PL.z);
  if(d<near){if(a._acc){dt+=a._acc;a._acc=0}return fn(a,Math.min(dt,.25))}a._acc=(a._acc||0)+dt;if((FR+a.id)%3)return;const t=Math.min(a._acc,.25);a._acc=0;return fn(a,t)};
updateNPC=slow(updateNPC,60);updateAnimal=slow(updateAnimal,60);updateEnemy=slow(updateEnemy,90);
placeActor=function(a){let g;if(a.aq!==undefined)g=a.aq;else if(a.x===a._px&&a.z===a._pz&&!a.rider&&a!==PL.mounted)g=a._pg;else{g=groundH(a.x,a.z);a._px=a.x;a._pz=a.z;a._pg=g}a.y+=(g-a.y)*.5;a.root.position.set(a.x,a.y,a.z);a.root.rotation.y=a.rot};
/* the distance follows how smoothly the game runs */
function adapt(){if(!started||!S.on||paused)return;if(S.fps<24){S.lowT++;S.highT=0}else if(S.fps>45){S.highT++;S.lowT=0}else{S.lowT=0;S.highT=0}
  if(S.lowT>=2&&S.D>110){S.D=Math.max(110,S.D-50);S.lowT=0}else{const top=window.EIK_LIGHT&&EIK_LIGHT.on?200:340;if(S.highT>=4&&S.D<top){S.D=Math.min(top,S.D+30);S.highT=0}}}
/* a little more haze when it draws less far, so things do not pop up at the edge */
const _ueS=updateEnv;updateEnv=function(dt,pp){_ueS(dt,pp);if(pp!==PL||!S.on||PL.inCave||!scene.fog||scene.fog.density===undefined)return;const want=.7/(S.D*1.2);if(scene.fog.density<want)scene.fog.density=want};
/* the switch in the pause menu */
const _rpS=renderPause;renderPause=function(){_rpS();try{const c=$('pset');if(!c||c.querySelector('#soepel'))return;const l=document.createElement('label');l.innerHTML='<span>Automatisch soepel</span><input type="checkbox" id="soepel">';const cb=l.querySelector('input');cb.checked=S.on;
  cb.onchange=()=>{S.on=cb.checked;try{localStorage.setItem('eikendal_soepel',S.on?'1':'0')}catch(e){}};const h3=c.querySelector('h3');c.insertBefore(l,h3?h3.nextSibling:c.firstChild);
  /* the light version for iPad and phone (on by itself on those devices); it takes effect after reloading */
  const L=document.createElement('label');L.innerHTML='<span>Lichte versie (iPad/gsm) <small style="color:var(--mute)">herlaad daarna de pagina</small></span><input type="checkbox">';const lb=L.querySelector('input');lb.checked=!!(window.EIK_LIGHT&&EIK_LIGHT.on);lb.onchange=()=>{try{localStorage.setItem('eikendal_licht',lb.checked?'1':'0')}catch(e){}};l.after(L)}catch(e){}};
})();
