/* ================= More bridges over the great river =================
   Wherever a road crosses the river there is now a stone arch bridge (with parapets, piers and lanterns), and in
   between, about every 300 m, a wooden footbridge with railings, so you never have to wade or swim across.
   Every bridge lies square across the river and follows the height of both banks, with a little hump in the middle. */
(function(){
const BR=[];WD.bridges2=BR;
const rdx=z=>{const e=.5;return(riverX(z+e)-riverX(z-e))/(2*e)};
function crossings(){const out=[];for(const r of ROADS){const p=r.pts;for(let i=0;i<p.length-1;i++){const [ax,az]=p[i],[bx,bz]=p[i+1],N=Math.max(2,Math.ceil(Math.hypot(bx-ax,bz-az)/2));let prev=null;
  for(let k=0;k<=N;k++){const t=k/N,x=ax+(bx-ax)*t,z=az+(bz-az)*t,f=x-riverX(z);if(prev!==null&&Math.sign(f)!==Math.sign(prev))out.push(z);prev=f}}}return out}
const near=(z,d)=>BR.some(b=>Math.abs(b.cz-z)<d)||bridges.some(b=>Math.abs(b.x-riverX(b.z))<25&&Math.abs(b.z-z)<d);
/* a bridge's frame: s along the bridge (across the river), w along the river */
function plan(z,stone){const cx=riverX(z),d=rdx(z),l=Math.hypot(1,d),ux=1/l,uz=-d/l,L=stone?20:19;
  const e0=[cx-ux*L,z-uz*L],e1=[cx+ux*L,z+uz*L],y0=Math.max(1.3,terrainH(e0[0],e0[1])),y1=Math.max(1.3,terrainH(e1[0],e1[1]));
  if(Math.abs(y0-y1)>7||terrainH(cx,z)>-1)return null;
  /* only where there is real land on both banks: the river runs on under the sea, and no bridge belongs out there */
  if(terrainH(e0[0],e0[1])<.4||terrainH(e1[0],e1[1])<.4)return null;
  const hump=stone?1.4:.6,deck=s=>{const t=(s+L)/(2*L);return y0+(y1-y0)*t+hump*Math.sin(Math.PI*t)};
  return{cx,cz:z,ux,uz,nx:uz,nz:-ux,L,W:stone?2.7:1.5,deck,stone,th:Math.atan2(ux,uz)}}
const at=(b,s,w,y)=>new T.Vector3(b.cx+b.ux*s+b.nx*w,y,b.cz+b.uz*s+b.nz*w);
/* a strip that follows the deck: from w0 to w1 across, between heights given by fy(s) */
function strip(b,w0,w1,fyTop,fyBot,mat,step=1){const pos=[],idx=[],n=Math.ceil(2*b.L/step);
  for(let i=0;i<=n;i++){const s=-b.L+2*b.L*i/n,t=fyTop(s),u=fyBot(s);for(const [w,y] of[[w0,t],[w1,t],[w1,u],[w0,u]]){const p=at(b,s,w,y);pos.push(p.x,p.y,p.z)}}
  for(let i=0;i<n;i++){const a=i*4,c=a+4;for(let k=0;k<4;k++){const k2=(k+1)%4;idx.push(a+k,c+k,a+k2,a+k2,c+k,c+k2)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);
  const uv=[];for(let i=0;i<=n;i++)for(let k=0;k<4;k++)uv.push(i*step/2,k%2);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  const m=new T.Mesh(g,mat);m.castShadow=m.receiveShadow=true;return m}
let SM=null,WM=null;const stoneM=()=>SM||(SM=Object.assign(MAT.stone.clone(),{side:T.DoubleSide})),woodM=()=>WM||(WM=Object.assign(MAT.wood.clone(),{side:T.DoubleSide}));
function build(b){const G=new T.Group();scene.add(G);b.g=G;const D=b.deck,W=b.W;
  if(b.stone){G.add(strip(b,-W,W,s=>D(s),s=>D(s)-.7,stoneM()));
    for(const sd of[-1,1])G.add(strip(b,sd*W,sd*(W-.38),s=>D(s)+.9,s=>D(s)-.1,stoneM()));
    for(const sp of[-7.5,7.5]){const y=D(sp),h=y-.7+3.6,p=at(b,sp,0,-3.6+h/2);const pier=mesh(new T.BoxGeometry(2*W+.4,h,2.2),stoneM(),p.x,p.y,p.z);pier.rotation.y=b.th;G.add(pier)}
    for(const [s0,s1] of[[-7.5,7.5],[-b.L+2,-7.5],[7.5,b.L-2]]){const mid=(s0+s1)/2,r=(s1-s0)/2,y=Math.min(D(s0),D(s1))-.7,geo=new T.CylinderGeometry(r,r,2*W,20,1,true,0,Math.PI);geo.rotateZ(Math.PI/2);
      const arch=new T.Mesh(geo,stoneM());arch.scale.y=.5;arch.position.copy(at(b,mid,0,y-.5*r));arch.rotation.y=b.th;arch.castShadow=true;G.add(arch)}
    for(const sd of[-1,1])for(const se of[-1,1]){const s=se*(b.L-1.2),p=at(b,s,sd*(W-.2),D(s)+.9);const post=mesh(new T.CylinderGeometry(.09,.12,1.8,6),MAT.dark||woodM(),p.x,p.y+.9,p.z);G.add(post);
      const lamp=new T.Mesh(new T.BoxGeometry(.3,.38,.3),new T.MeshStandardMaterial({color:0xffc070,emissive:0xffa040,emissiveIntensity:1.6}));lamp.position.set(p.x,p.y+1.95,p.z);G.add(lamp);
      try{LAMPS.push({x:p.x,y:p.y+1.9,z:p.z,flame:null})}catch(e){}}}
  else{const plank=new T.BoxGeometry(2*W,.09,.42);for(let s=-b.L;s<=b.L;s+=.5){const p=at(b,s,0,D(s));const m=new T.Mesh(plank,woodM());m.position.copy(p);m.rotation.y=b.th;
      const sl=(D(s+.25)-D(s-.25))/.5;m.rotateX(-Math.atan(sl));m.castShadow=m.receiveShadow=true;G.add(m)}
    for(const sd of[-1,1]){G.add(strip(b,sd*(W+.05),sd*(W-.12),s=>D(s)-.02,s=>D(s)-.32,woodM()));G.add(strip(b,sd*(W+.04),sd*(W-.08),s=>D(s)+1.05,s=>D(s)+.93,woodM()));
      for(let s=-b.L+.5;s<=b.L;s+=2.5){const p=at(b,s,sd*(W-.02),D(s));G.add(mesh(new T.BoxGeometry(.12,1.1,.12),woodM(),p.x,p.y+.52,p.z))}}
    for(const sp of[-9,-3,3,9]){const y=D(sp);for(const sd of[-1,1]){const p=at(b,sp,sd*(W-.1),0);G.add(mesh(new T.CylinderGeometry(.16,.2,y+3.4,7),woodM(),p.x,(y-3.4)/2-.2,p.z))}}}
  /* nothing may grow on the bridge heads */
  const gone=(x,z)=>{const dx=x-b.cx,dz=z-b.cz,s=dx*b.ux+dz*b.uz,w=dx*b.nx+dz*b.nz;return Math.abs(s)<b.L+6&&Math.abs(w)<W+3.5};
  try{for(const t of TREES.oak.concat(TREES.pine))if(!t.cut&&gone(t.x,t.z)){t.cut=true;t.gone=true;if(t.col)t.col.off=true;try{if(t.lodM)asLow(t,false);else setInst(t.ii||[],false,[])}catch(e){}}
    for(const q of ROCKS)if(!q.cut&&gone(q.x,q.z)){q.cut=true;if(q.col)q.col.off=true;try{q.inst.setMatrixAt(q.i,new T.Matrix4().makeScale(0,0,0));q.inst.instanceMatrix.needsUpdate=true}catch(e){}}
  }catch(e){}try{asTreesUpdate(true)}catch(e){}}
/* walking on them */
const _gh=groundH;groundH=function(x,z){let h=_gh(x,z);if(x<-2000)return h;for(const b of BR){const dx=x-b.cx,dz=z-b.cz;if(Math.abs(dx)>b.L+3||Math.abs(dz)>b.L+3)continue;
  const s=dx*b.ux+dz*b.uz,w=dx*b.nx+dz*b.nz;if(Math.abs(s)<=b.L&&Math.abs(w)<b.W-.15)h=Math.max(h,b.deck(s))}return h};
/* the railings and parapets keep you on the deck (boats still pass underneath) */
function rails(){}
const _up=updatePlayer;updatePlayer=function(dt){_up(dt);if(PL.x<-2000)return;for(const b of BR){const dx=PL.x-b.cx,dz=PL.z-b.cz;if(Math.abs(dx)>b.L+2||Math.abs(dz)>b.L+2)continue;
  const s=dx*b.ux+dz*b.uz,w=dx*b.nx+dz*b.nz;if(Math.abs(s)<b.L-1.5&&Math.abs(w)<b.W+.8&&PL.y>b.deck(s)-.6){const lim=b.W-.35;if(Math.abs(w)>lim){const nw=Math.sign(w)*lim;PL.x=b.cx+b.ux*s+b.nx*nw;PL.z=b.cz+b.uz*s+b.nz*nw}}}};
let done=false;
ANIMS.push(()=>{if(done||typeof worldReady==='undefined'||!worldReady)return;done=true;
  try{const cz=crossings().sort((a,b)=>a-b);for(const z of cz){if(near(z,40))continue;const b=plan(z,true);if(b){BR.push(b);build(b);rails(b)}}
    for(let z=-HALF+90;z<HALF-90;z+=300){let best=null;for(let dz=0;dz<120&&!best;dz+=10)for(const zz of[z+dz,z-dz]){if(near(zz,150))continue;const b=plan(zz,false);if(b){best=b;break}}if(best){BR.push(best);build(best);rails(best)}}
    console.log('bridges:',BR.length)}catch(e){console.warn('bridges',e)}});
})();
