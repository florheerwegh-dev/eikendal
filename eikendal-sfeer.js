/* ================= Sfeer: a world that lives =================
   Small things that make the world prettier, all cheap to draw and only near you:
   butterflies over the meadows by day, fireflies blinking at night, flocks of birds high in the sky, a warm glow
   around lanterns after dark, a shooting star now and then, morning mist in the early hours, and a rainbow when the
   rain stops while the sun shines. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,day=()=>ENV.time>=6.5&&ENV.time<20,outside=()=>started&&!PL.inCave,wet=()=>ENV.weather==='rain'||ENV.weather==='storm';
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new T.CanvasTexture(c)})();
const land=(x,z)=>{const h=groundH(x,z);return h>1&&h<60};
/* ---------- butterflies ---------- */
const BF=[];const BCOL=[0xffd040,0xff7a2a,0x7ab0ff,0xffffff,0xe060c0,0x9ad86a];
function butterfly(){const g=new T.Group(),c=pick(BCOL),m=new T.MeshBasicMaterial({color:c,side:T.DoubleSide});const ws=[];
  for(const s of[-1,1]){const p=new T.Group();const w=new T.Mesh(new T.PlaneGeometry(.34,.27),m);w.position.x=s*.17;w.rotation.x=-Math.PI/2;p.add(w);g.add(p);ws.push({p,s})}
  g.add(new T.Mesh(new T.BoxGeometry(.03,.03,.12),new T.MeshBasicMaterial({color:0x2a2018})));g.visible=false;scene.add(g);return{g,ws,ph:Math.random()*6,hx:0,hz:0,sp:.6+Math.random()*.6}}
for(let i=0;i<14;i++)BF.push(butterfly());
function placeB(b){for(let k=0;k<12;k++){const x=PL.x+rr(28),z=PL.z+rr(28);if(land(x,z)){b.hx=x;b.hz=z;b.g.position.set(x,groundH(x,z)+.8,z);return true}}return false}
/* ---------- fireflies ---------- */
const FN=110,ffGeo=new T.BufferGeometry(),ffPos=new Float32Array(FN*3),ffCol=new Float32Array(FN*3),ffPh=new Float32Array(FN);
for(let i=0;i<FN;i++){ffPh[i]=Math.random()*6.283}
ffGeo.setAttribute('position',new T.BufferAttribute(ffPos,3));ffGeo.setAttribute('color',new T.BufferAttribute(ffCol,3));
const FF=new T.Points(ffGeo,new T.PointsMaterial({size:.32,map:glowTex,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));FF.frustumCulled=false;FF.visible=false;scene.add(FF);
let ffCx=1e9,ffCz=1e9;
function seedFF(){ffCx=PL.x;ffCz=PL.z;for(let i=0;i<FN;i++){let x=PL.x+rr(32),z=PL.z+rr(32),k=0;while(!land(x,z)&&k++<6){x=PL.x+rr(32);z=PL.z+rr(32)}ffPos[i*3]=x;ffPos[i*3+1]=groundH(x,z)+.4+Math.random()*2.6;ffPos[i*3+2]=z}ffGeo.attributes.position.needsUpdate=true}
/* ---------- birds ---------- */
const FLOCKS=[];
function flock(n){const g=new T.Group(),m=new T.MeshBasicMaterial({color:0x2a2a30,side:T.DoubleSide}),birds=[];
  for(let i=0;i<n;i++){const b=new T.Group(),row=Math.ceil(i/2),side=i%2?1:-1;b.position.set(side*row*2.2,rr(.6),-row*2.4);const ws=[];for(const s of[-1,1]){const p=new T.Group();const w=new T.Mesh(new T.PlaneGeometry(.9,.3),m);w.position.x=s*.45;w.rotation.x=-Math.PI/2;p.add(w);b.add(p);ws.push({p,s})}g.add(b);birds.push({b,ws,ph:Math.random()*6})}
  g.visible=false;scene.add(g);return{g,birds,a:Math.random()*6.283,r:120+Math.random()*120,h:55+Math.random()*35,sp:.05+Math.random()*.04,cx:0,cz:0}}
FLOCKS.push(flock(7),flock(5));
/* ---------- lantern glow ---------- */
const GL=[];for(let i=0;i<28;i++){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffb860,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0}));s.scale.set(3.2,3.2,1);s.visible=false;scene.add(s);GL.push(s)}
let glT=0;
/* ---------- shooting stars ---------- */
const SS={m:null,t:0,wait:15,v:null};
/* ---------- rainbow after rain ---------- */
const RB={m:null,t:0,was:null};
function rainbowMesh(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d'),RO=300,RI=268,gr=g.createRadialGradient(256,256,RI/RO*256,256,256,256);
  [[0,'rgba(140,60,255,0)'],[.12,'rgba(140,60,255,.7)'],[.3,'rgba(60,90,255,.7)'],[.46,'rgba(60,220,120,.7)'],[.62,'rgba(255,240,60,.7)'],[.78,'rgba(255,150,40,.7)'],[.92,'rgba(255,50,40,.7)'],[1,'rgba(255,50,40,0)']].forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,512,512);
  const m=new T.Mesh(new T.RingGeometry(RI,RO,96,1,.15,Math.PI-.3),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,fog:false,blending:T.AdditiveBlending}));m.visible=false;scene.add(m);return m}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;const t=PL.t,out=outside(),d=day(),w=wet();
  /* butterflies: by day, near you, not in the rain */
  for(const b of BF){const want=out&&d&&!w&&ENV.time>8&&ENV.time<18.5;if(!want){b.g.visible=false;continue}
    if(!b.g.visible||Math.hypot(b.hx-PL.x,b.hz-PL.z)>45){if(!placeB(b))continue;b.g.visible=true}
    b.ph+=dt*b.sp;const x=b.hx+Math.sin(b.ph*1.3)*3+Math.sin(b.ph*3.1)*.8,z=b.hz+Math.cos(b.ph*1.1)*3+Math.cos(b.ph*2.7)*.8,y=groundH(x,z)+.7+Math.sin(b.ph*4)*.35+.3;
    const p=b.g.position;b.g.rotation.y=Math.atan2(x-p.x,z-p.z);p.set(x,y,z);for(const wg of b.ws)wg.p.rotation.z=wg.s*(Math.sin(t*18+b.ph)*.9)}
  /* fireflies: at night, near you */
  const ffOn=out&&!d&&!w&&ENV.time<4.5||out&&!w&&ENV.time>=21;FF.visible=ffOn;
  if(ffOn){if(Math.hypot(PL.x-ffCx,PL.z-ffCz)>18)seedFF();for(let i=0;i<FN;i++){const b=Math.max(0,Math.sin(t*1.7+ffPh[i]*3));ffCol[i*3]=b*.85;ffCol[i*3+1]=b;ffCol[i*3+2]=b*.35;ffPos[i*3]+=Math.sin(t*.7+ffPh[i])*dt*.4;ffPos[i*3+1]+=Math.cos(t*.9+ffPh[i])*dt*.2;ffPos[i*3+2]+=Math.cos(t*.6+ffPh[i])*dt*.4}
    ffGeo.attributes.color.needsUpdate=true;ffGeo.attributes.position.needsUpdate=true}
  /* birds: high above you by day */
  for(const f of FLOCKS){const want=out&&d&&!w;f.g.visible=want;if(!want)continue;if(Math.hypot(f.cx-PL.x,f.cz-PL.z)>400){f.cx=PL.x;f.cz=PL.z}f.cx+=(PL.x-f.cx)*dt*.02;f.cz+=(PL.z-f.cz)*dt*.02;
    f.a+=dt*f.sp;const x=f.cx+Math.cos(f.a)*f.r,z=f.cz+Math.sin(f.a)*f.r;f.g.position.set(x,Math.max(groundH(x,z),0)+f.h,z);f.g.rotation.y=Math.atan2(-Math.sin(f.a),Math.cos(f.a));
    for(const b of f.birds){const fl=Math.sin(t*6+b.ph);for(const wg of b.ws)wg.p.rotation.z=wg.s*fl*.6}}
  /* lantern glow after dark */
  glT-=dt;if(glT<=0){glT=.5;const night=ENV.night||0;let k=0;if(out&&night>.25&&typeof LAMPS!=="undefined"){const L=LAMPS.filter(l=>Math.abs(l.x-PL.x)<90&&Math.abs(l.z-PL.z)<90).sort((a,b)=>Math.hypot(a.x-PL.x,a.z-PL.z)-Math.hypot(b.x-PL.x,b.z-PL.z));
      for(const l of L){if(k>=GL.length)break;const s=GL[k++];s.position.set(l.x,l.y,l.z);s.visible=true;s.material.opacity=Math.min(.75,night*.9)}}for(;k<GL.length;k++)GL[k].visible=false}
  for(const s of GL)if(s.visible)s.scale.setScalar(3+Math.sin(t*3+s.position.x)*.15);
  /* a shooting star now and then */
  if(out&&(ENV.night||0)>.7&&!w){SS.wait-=dt;if(SS.wait<=0&&!SS.m){SS.wait=18+Math.random()*30;const a=Math.random()*6.283,p=new T.Vector3(PL.x+Math.cos(a)*400,280+Math.random()*80,PL.z+Math.sin(a)*400),v=new T.Vector3(rr(1),-.35,rr(1)).normalize().multiplyScalar(180);
      SS.m=new T.Line(new T.BufferGeometry().setFromPoints([p,p.clone().sub(v.clone().multiplyScalar(.12))]),new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:1,fog:false}));SS.v=v;SS.t=0;scene.add(SS.m)}}
  if(SS.m){SS.t+=dt;SS.m.position.addScaledVector(SS.v,dt);SS.m.material.opacity=Math.max(0,1-SS.t/1.1);if(SS.t>1.1){scene.remove(SS.m);SS.m.geometry.dispose();SS.m=null}}
  /* a rainbow when the rain stops in daylight */
  const nowWet=w;if(RB.was===true&&!nowWet&&out&&d&&ENV.time<18){if(!RB.m)RB.m=rainbowMesh();RB.t=70;const sd=ENV.sunDir||new T.Vector3(1,1,0),ax=-sd.x,az=-sd.z,l=Math.hypot(ax,az)||1;RB.m.position.set(PL.x+ax/l*420,-60,PL.z+az/l*420);RB.m.lookAt(PL.x,-60,PL.z);RB.m.visible=true}RB.was=nowWet;
  if(RB.m&&RB.m.visible){RB.t-=dt;const k=RB.t>60?(70-RB.t)/10:RB.t<12?RB.t/12:1;RB.m.material.opacity=Math.max(0,k)*.45;if(RB.t<=0||!out)RB.m.visible=false}});
/* morning mist in the early hours */
const _ueF=updateEnv;updateEnv=function(dt,pp){_ueF(dt,pp);if(pp!==PL||PL.inCave||!scene.fog||scene.fog.density===undefined)return;const h=ENV.time;if(h>5&&h<8.5){const k=h<6.5?(h-5)/1.5:(8.5-h)/2;scene.fog.density*=1+Math.max(0,k)*1.2}};
WD.sfeer={BF,FF,FLOCKS,GL,RB,SS};
})();
