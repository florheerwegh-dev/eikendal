/* ================= Kaarten: a real map in every world, and zooming =================
   - In caves, the dungeon, the dwarf city, the cloud kingdom, the dinosaur land and Noordheim, the small map (top
     right) used to show just a word. Now it shows the place itself, seen from above: the game draws the world around
     you from high up, cut off just above your head, so walls, rooms, paths and water show like on a drawn map, with
     dark ink lines along the walls. People, monsters and your goal are dots on it.
   - The big map (M) in those worlds is drawn the same way.
   - On every big map you can zoom in: scroll the mouse wheel, pinch on a tablet, or use + and -; drag to move it. */
(function(){
const OUT=x=>x<-30000||(x>30000&&x<90000),OWNBIG=x=>x<-30000||(x>30000&&x<60000);
const regionName=()=>{try{const r=WD.region&&WD.region(PL.x);if(r)return r.name}catch(e){}return PL.x<-30000?'Noordheim':'Onder de grond'};
/* ---------- colours of things, as seen from far above ---------- */
const MC=new WeakMap(),TA=new WeakMap();
function texAvg(t){if(!t)return null;let v=TA.get(t);if(v)return v;const im=t.image;if(!im||!(im.width||im.naturalWidth)||im.complete===false)return null;
  try{const c=document.createElement('canvas');c.width=c.height=4;const g=c.getContext('2d');g.drawImage(im,0,0,4,4);const d=g.getImageData(0,0,4,4).data;let r=0,gg=0,b=0;for(let i=0;i<64;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2]}v=new T.Color(r/4080,gg/4080,b/4080)}catch(e){v=new T.Color(.62,.6,.56)}TA.set(t,v);return v}
function colOf(m){const now=performance.now();let e=MC.get(m);if(e&&now-e.t<8000)return e.c;const c=new T.Color(.62,.6,.56);if(m.color)c.copy(m.color);const ta=texAvg(m.map);if(ta)c.multiply(ta);
  if(m.emissive&&(m.emissiveIntensity||0)>0&&(m.emissive.r+m.emissive.g+m.emissive.b)>.05){const k=Math.min(1,m.emissiveIntensity)*.7;c.r+=m.emissive.r*k;c.g+=m.emissive.g*k;c.b+=m.emissive.b*k}
  MC.set(m,{c,t:now});return c}
const VS=`uniform float uVC;attribute vec3 color;varying vec3 vN;varying vec3 vC;varying float vY;
void main(){vec4 p=vec4(position,1.0);vec3 n=normal;
#ifdef USE_INSTANCING
p=instanceMatrix*p;n=mat3(instanceMatrix)*n;
#endif
vec4 w=modelMatrix*p;vY=w.y;vN=normalize(mat3(modelMatrix)*n);vC=mix(vec3(1.0),color,uVC);gl_Position=projectionMatrix*viewMatrix*w;gl_PointSize=1.0;}`;
const FS=`uniform vec3 uCol;uniform float uPY;uniform float uOut;uniform float uDS;varying vec3 vN;varying vec3 vC;varying float vY;
void main(){bool front=gl_FrontFacing;if(uDS>1.5)front=true;else if(uDS>.5)front=!gl_FrontFacing;
vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;vec3 c=uCol*vC;float l=.55+.5*clamp(dot(n,normalize(vec3(-.45,1.0,-.35))),0.0,1.0);float a=1.0;
if(!front){c*=.3;a=.4;}else{c*=l;if(uOut<.5){float d=vY-uPY;if(d>1.2){c*=.62;a=.6;}else if(d<-2.2){c*=.6;a=.8;}else if(n.y<.45){c*=.78;a=.6;}}}
gl_FragColor=vec4(min(c,vec3(1.0)),a);}`;
const OV=new T.ShaderMaterial({side:T.DoubleSide,uniforms:{uCol:{value:new T.Color()},uVC:{value:0},uPY:{value:0},uOut:{value:0},uDS:{value:0}},vertexShader:VS,fragmentShader:FS});
function hook(r,s,c,geo,mat,grp){if(mat!==OV)return;let m=this.material;if(Array.isArray(m))m=m[(grp&&grp.materialIndex)||0]||m[0];if(!m)return;const U=OV.uniforms;U.uCol.value.copy(colOf(m));U.uVC.value=m.vertexColors?1:0;U.uDS.value=m.side===T.DoubleSide?2:m.side===T.BackSide?1:0;OV.uniformsNeedUpdate=true}
/* ---------- drawing the world from above ---------- */
const RT={},BUF={},cam=new T.OrthographicCamera(-1,1,1,-1,.05,50);cam.up.set(0,0,-1);
let hideL=[],hideT=-1e9;
function collectHide(){hideL=[];scene.traverse(o=>{if(o.isPoints||o.isLine||o.isSprite||o.isSkinnedMesh)hideL.push(o)})}
function topDown(cx,cz,span,n,out){
  if(performance.now()-hideT>6000){collectHide();hideT=performance.now()}
  if(!RT[n]){RT[n]=new T.WebGLRenderTarget(n,n,{minFilter:T.NearestFilter,magFilter:T.NearestFilter});BUF[n]=new Uint8Array(n*n*4)}
  const py=PL.y;cam.left=-span/2;cam.right=span/2;cam.top=span/2;cam.bottom=-span/2;cam.near=.05;cam.far=out?600:45;cam.updateProjectionMatrix();
  cam.position.set(cx,py+(out?200:3),cz);cam.lookAt(cx,py-50,cz);cam.updateMatrixWorld();
  const hid=[];for(const o of hideL)if(o.visible){o.visible=false;hid.push(o)}
  for(const a of actors){const r=a.root;if(r&&r.visible&&Math.abs(a.x-cx)<span&&Math.abs(a.z-cz)<span){r.visible=false;hid.push(r)}}
  if(typeof pm!=='undefined'&&pm&&pm.g&&pm.g.visible){pm.g.visible=false;hid.push(pm.g)}
  const bg=scene.background,ov=scene.overrideMaterial,au=renderer.shadowMap.autoUpdate,cc=renderer.getClearColor(new T.Color()),ca=renderer.getClearAlpha(),prt=renderer.getRenderTarget(),obr=T.Object3D.prototype.onBeforeRender;
  OV.uniforms.uPY.value=py;OV.uniforms.uOut.value=out?1:0;
  try{T.Object3D.prototype.onBeforeRender=hook;scene.background=null;scene.overrideMaterial=OV;renderer.shadowMap.autoUpdate=false;renderer.setClearColor(0,0);
    renderer.setRenderTarget(RT[n]);renderer.clear();renderer.render(scene,cam);renderer.readRenderTargetPixels(RT[n],0,0,n,n,BUF[n])}
  finally{T.Object3D.prototype.onBeforeRender=obr;scene.background=bg;scene.overrideMaterial=ov;renderer.shadowMap.autoUpdate=au;renderer.setClearColor(cc,ca);renderer.setRenderTarget(prt);for(const o of hid)o.visible=true}
  return paint(n)}
/* the picture becomes a drawn map: walkable ground, walls with ink lines along them, and darkness where nothing is */
function paint(n){const b=BUF[n],c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d'),img=g.createImageData(n,n),d=img.data,cls=new Uint8Array(n*n);
  for(let j=0;j<n;j++){const sj=(n-1-j)*n;for(let i=0;i<n;i++){const k=(sj+i)*4,o=(j*n+i)*4,a=b[k+3];let r=b[k],gg=b[k+1],bb=b[k+2],cl;
    if(a>230){cl=3;r=r*.62+226*.38;gg=gg*.62+208*.38;bb=bb*.62+164*.38}else if(a>180){cl=2;r=r*.8+120*.2;gg=gg*.8+105*.2;bb=bb*.8+80*.2}else if(a>60){cl=1;r=r*.55+62*.45;gg=gg*.55+48*.45;bb=bb*.55+34*.45}else{cl=0;r=26;gg=20;bb=14}
    cls[j*n+i]=cl;d[o]=r;d[o+1]=gg;d[o+2]=bb;d[o+3]=255}}
  for(let j=1;j<n-1;j++)for(let i=1;i<n-1;i++){const q=j*n+i;if(cls[q]>=2)continue;if(cls[q-1]>=2||cls[q+1]>=2||cls[q-n]>=2||cls[q+n]>=2){const o=q*4;d[o]=44;d[o+1]=30;d[o+2]=16}}
  g.putImageData(img,0,0);return c}
/* ---------- the small map ---------- */
const MM={c:null,cx:0,cz:0,py:0,t:-1e9,out:false,rs:120};
function dots(g,S,cx,cz,k,big){const R=big?5:2.6;
  for(const a of actors){if(a.dead||a.gone)continue;const dx=(a.x-cx)*k,dz=(a.z-cz)*k;if(Math.abs(dx)>S/2||Math.abs(dz)>S/2)continue;if(a.root&&!a.root.visible&&a.kind!=='enemy')continue;
    const boss=a.kind==='enemy'&&(a.boss||(MON[a.type]&&MON[a.type].boss)),col=a.kind==='enemy'?(boss?'#ff2a6a':'#e5513f'):a.kind==='npc'?'#ffe9a8':a.kind==='animal'?'#b9d48a':null;if(!col)continue;
    g.fillStyle=col;g.beginPath();g.arc(S/2+dx,S/2+dz,boss?R*1.8:R,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;g.stroke()}
  if(window.MP&&MP.peers)for(const a of MP.peers.values()){const dx=(a.x-cx)*k,dz=(a.z-cz)*k;if(Math.abs(dx)>S/2||Math.abs(dz)>S/2)continue;g.fillStyle='#6ab8ff';g.beginPath();g.arc(S/2+dx,S/2+dz,R*1.3,0,7);g.fill()}
  for(const q of PL.quests){let t=null;try{t=q.mark&&q.mark()}catch(e){}if(!t)continue;let dx=(t[0]-cx)*k,dz=(t[1]-cz)*k;const d=Math.hypot(dx,dz),m=S/2-6;if(d>m){dx*=m/d;dz*=m/d}g.fillStyle='#e0b04a';g.strokeStyle='#1b140c';g.lineWidth=1.5;g.beginPath();g.arc(S/2+dx,S/2+dz,big?7:3.8,0,7);g.fill();g.stroke()}}
function caveMini(){const c=$('mini'),g=c.getContext('2d'),S=c.width||150,out=OUT(PL.x),span=out?170:80,rs=out?260:120,n=out?192:160,now=performance.now();
  if(!MM.c||now-MM.t>(out?900:450)||MM.out!==out||Math.hypot(PL.x-MM.cx,PL.z-MM.cz)>rs*.2||Math.abs(PL.y-MM.py)>2.5){try{MM.c=topDown(PL.x,PL.z,rs,n,out);MM.cx=PL.x;MM.cz=PL.z;MM.py=PL.y;MM.out=out;MM.rs=rs;MM.t=now}catch(e){console.warn('kaart',e);MM.t=now+5000}}
  g.fillStyle='#1a140e';g.fillRect(0,0,S,S);if(MM.c){const k=n/MM.rs,w=span*k;g.imageSmoothingEnabled=true;g.drawImage(MM.c,(PL.x-MM.cx+MM.rs/2)*k-w/2,(PL.z-MM.cz+MM.rs/2)*k-w/2,w,w,0,0,S,S)}
  dots(g,S,PL.x,PL.z,S/span,false);
  g.font='bold 11px "IM Fell English",serif';g.textAlign='center';const nm=regionName();g.lineWidth=3;g.strokeStyle='rgba(20,14,6,.85)';g.strokeText(nm,S/2,S-9);g.fillStyle='#f1e4c4';g.fillText(nm,S/2,S-9);
  arrow(g,S/2,S/2,PL.yaw,6)}
const _dmK=drawMini;drawMini=function(){if(!started||!PL.inCave)return _dmK.apply(this,arguments);try{caveMini()}catch(e){console.warn('kaart',e);return _dmK.apply(this,arguments)}};
/* ---------- the big map: zooming and dragging ---------- */
const BZ={z:1,cx:500,cy:500},CB={z:1,ox:0,oz:0};let lastDraw=0,raf=0;window.MAPZ=BZ;
const caveMode=()=>started&&PL.inCave&&!OWNBIG(PL.x);
function clampBZ(S){BZ.z=Math.max(1,Math.min(8,BZ.z));const h=S/(2*BZ.z);BZ.cx=Math.max(h,Math.min(S-h,BZ.cx));BZ.cy=Math.max(h,Math.min(S-h,BZ.cy))}
function playerPx(S){try{if(PL.x<-30000||(PL.x>30000&&PL.x<60000))return[S/2,S/2];return[mpx(PL.x)*S/MAPN,mpx(PL.z)*S/MAPN]}catch(e){return[S/2,S/2]}}
window.mapUnzoom=(px,py)=>{const c=$('bigmap'),S=c?c.width:1000;if(caveMode())return[px,py];return[BZ.cx+(px-S/2)/BZ.z,BZ.cy+(py-S/2)/BZ.z]};
function title(t){const h=document.querySelector('#mapw h2');if(!h)return;if(t){if(!h.dataset.kold)h.dataset.kold=h.textContent;h.textContent=t}else if(h.dataset.kold){h.textContent=h.dataset.kold;delete h.dataset.kold}}
function caveBig(c,g,S){title('Kaart: '+regionName());const out=OUT(PL.x),span=(out?800:240)/CB.z,cx=PL.x+CB.ox,cz=PL.z+CB.oz;g.setTransform(1,0,0,1,0,0);g.fillStyle='#1a140e';g.fillRect(0,0,S,S);
  try{const im=topDown(cx,cz,span,640,out);g.imageSmoothingEnabled=true;g.drawImage(im,0,0,S,S)}catch(e){console.warn('kaart',e)}
  const k=S/span;dots(g,S,cx,cz,k,true);
  const px=S/2+(PL.x-cx)*k,py=S/2+(PL.z-cz)*k;arrow(g,px,py,PL.yaw,13);
  /* scale bar */
  let m=10;while(m*k<S/9)m*=2;if(m*k>S/4)m=Math.max(5,m/2);g.strokeStyle='#f1e4c4';g.lineWidth=3;g.beginPath();g.moveTo(24,S-28);g.lineTo(24+m*k,S-28);g.stroke();g.font='bold 18px "IM Fell English",serif';g.fillStyle='#f1e4c4';g.textAlign='left';g.fillText(m+' passen',24,S-38)}
const _dbK=drawBigMap;drawBigMap=function(){const c=$('bigmap');if(!c)return _dbK.apply(this,arguments);const g=c.getContext('2d'),S=c.width,now=performance.now(),fresh=now-lastDraw>1500;lastDraw=now;
  if(caveMode()){if(fresh){CB.ox=0;CB.oz=0}caveBig(c,g,S);return}
  title(null);if(fresh&&BZ.z>1){const [x,y]=playerPx(S);BZ.cx=x;BZ.cy=y}clampBZ(S);
  g.setTransform(1,0,0,1,0,0);g.fillStyle='#d8c79a';g.fillRect(0,0,S,S);g.setTransform(BZ.z,0,0,BZ.z,S/2-BZ.cx*BZ.z,S/2-BZ.cy*BZ.z);
  try{_dbK.apply(this,arguments)}finally{g.setTransform(1,0,0,1,0,0)}};
const redraw=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;lastDraw=performance.now();try{drawBigMap()}catch(e){}})};
function zoomAt(f,px,py){const c=$('bigmap'),S=c.width;if(caveMode()){const out=OUT(PL.x),span=(out?800:240)/CB.z,wx=CB.ox+(px-S/2)/S*span,wz=CB.oz+(py-S/2)/S*span;CB.z=Math.max(.5,Math.min(8,CB.z*f));const s2=(out?800:240)/CB.z;CB.ox=wx-(px-S/2)/S*s2;CB.oz=wz-(py-S/2)/S*s2}
  else{const wx=BZ.cx+(px-S/2)/BZ.z,wy=BZ.cy+(py-S/2)/BZ.z;BZ.z=Math.max(1,Math.min(8,BZ.z*f));BZ.cx=wx-(px-S/2)/BZ.z;BZ.cy=wy-(py-S/2)/BZ.z;clampBZ(S)}redraw()}
function panBy(dx,dy){const c=$('bigmap'),S=c.width;if(caveMode()){const span=(OUT(PL.x)?800:240)/CB.z;CB.ox-=dx/S*span;CB.oz-=dy/S*span}else{BZ.cx-=dx/BZ.z;BZ.cy-=dy/BZ.z;clampBZ(S)}redraw()}
function setup(){const c=$('bigmap'),w=$('mapw');if(!c||!w||c.dataset.zoom)return;c.dataset.zoom=1;c.style.touchAction='none';c.style.cursor='grab';
  const toCanvas=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)/r.width*c.width,(e.clientY-r.top)/r.height*c.height]};
  c.addEventListener('wheel',e=>{e.preventDefault();const [x,y]=toCanvas(e);zoomAt(e.deltaY<0?1.25:1/1.25,x,y)},{passive:false});
  const P=new Map();let moved=0,pinch=0;
  c.addEventListener('pointerdown',e=>{P.set(e.pointerId,toCanvas(e));moved=0;if(P.size===2){const [a,b]=[...P.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1])}try{c.setPointerCapture(e.pointerId)}catch(_){}c.style.cursor='grabbing'});
  c.addEventListener('pointermove',e=>{if(!P.has(e.pointerId))return;const p=toCanvas(e),o=P.get(e.pointerId);P.set(e.pointerId,p);
    if(P.size===1){const dx=p[0]-o[0],dy=p[1]-o[1];moved+=Math.abs(dx)+Math.abs(dy);if(moved>6)panBy(dx,dy)}
    else if(P.size===2){const [a,b]=[...P.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch>0&&d>0){zoomAt(d/pinch,(a[0]+b[0])/2,(a[1]+b[1])/2);moved=99}pinch=d}});
  const up=e=>{P.delete(e.pointerId);if(P.size<2)pinch=0;c.style.cursor='grab'};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
  c.addEventListener('click',e=>{if(moved>6){e.stopPropagation();e.preventDefault()}moved=0},true);
  const bar=document.createElement('div');bar.id='mapzoom';bar.innerHTML='<button class="btn" data-z="in" title="Inzoomen">＋</button><button class="btn" data-z="out" title="Uitzoomen">－</button><button class="btn" data-z="me" title="Naar mij">◎</button>';
  bar.onclick=e=>{const b=e.target.closest('button');if(!b)return;const S=c.width;if(b.dataset.z==='in')zoomAt(1.5,S/2,S/2);else if(b.dataset.z==='out')zoomAt(1/1.5,S/2,S/2);else{if(caveMode()){CB.ox=0;CB.oz=0}else{if(BZ.z<2.5)BZ.z=3;const [x,y]=playerPx(S);BZ.cx=x;BZ.cy=y;clampBZ(S)}redraw()}};
  c.insertAdjacentElement('beforebegin',bar);
  const hint=c.nextElementSibling;if(hint&&hint.tagName==='DIV'&&!hint.id)hint.textContent='M, K of Tab opent/sluit de kaart · scroll, knijp of + en - om te zoomen · sleep om te schuiven · ◎ = waar ben ik';
  const st=document.createElement('style');st.textContent='#mapzoom{position:absolute;right:20px;margin-top:8px;display:flex;flex-direction:column;gap:5px;z-index:2}#mapzoom .btn{margin:0;min-width:0;width:38px;height:38px;padding:0;font-size:20px;line-height:1;background:rgba(20,14,6,.82)}';document.head.appendChild(st)}
addEventListener('load',setup);setTimeout(setup,3000);
WD.kaart={topDown,BZ,CB,caveMini,span:()=>started&&PL.inCave?(OUT(PL.x)?170:80):210};
})();
