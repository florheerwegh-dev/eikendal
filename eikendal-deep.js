/* ================= The deep: De Kraak and the sea serpents, rebuilt =================
   De Kraak sleeps in a lair off the west coast, under a slow whirlpool between sharp sea stacks and a sunken ship,
   and rises from the deep when you swim close. A tall mottled mantle with glowing spots, two huge golden eyes that
   follow you, eight soft arms that ripple through the waves and two long arms that rise high and slam down.
   The sea serpents are long sea dragons: their humps arch through the waves, they rear up, open their jaws and strike. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,V3=T.Vector3,WL=-.05;
const _q=new T.Quaternion(),_qa=new T.Quaternion(),_v=new V3(),_d=new V3(),_w=new V3(),XA=new V3(1,0,0),YA=new V3(0,1,0),UP=new V3(0,1,0);
const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;

/* ---------- a soft tube whose spine is posed every frame ---------- */
function Tube(N,R,radFn,mat,L,tile,ellFn){
  const nv=(N+1)*(R+1),pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),idx=[],rad=[],ex=[],ey=[];
  let v=0;for(let j=0;j<=N;j++){const r=radFn(j/N),e=ellFn?ellFn(j/N):[1,1];rad.push(r);ex.push(e[0]);ey.push(e[1]);if(j)v+=(L/N)/(6.283*Math.max(.04,(r+rad[j-1])/2)*tile);for(let k=0;k<=R;k++){const i=j*(R+1)+k;uv[i*2]=k/R;uv[i*2+1]=v}}
  for(let j=0;j<N;j++)for(let k=0;k<R;k++){const a=j*(R+1)+k,b=a+R+1;idx.push(a,a+1,b,a+1,b+1,b)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);
  const m=new T.Mesh(g,mat);m.frustumCulled=false;m.castShadow=true;m.receiveShadow=true;m.userData.dyn=true;
  const mk=()=>Array.from({length:N+1},()=>new V3());
  return{m,N,R,L,pos,nor,rad,ex,ey,P:mk(),S:mk(),U:mk()}}
function tubeWrite(t){const {N,R,pos,nor,rad,ex,ey,P,S,U}=t;
  for(let j=0;j<=N;j++){const p=P[j],s=S[j],u=U[j],r=rad[j],a1=ex[j],a2=ey[j];
    for(let k=0;k<=R;k++){const a=k/R*6.283,c=Math.cos(a),sn=Math.sin(a),i=(j*(R+1)+k)*3,ox=(s.x*c*a1+u.x*sn*a2)*r,oy=(s.y*c*a1+u.y*sn*a2)*r,oz=(s.z*c*a1+u.z*sn*a2)*r;
      let nx=s.x*c*a2+u.x*sn*a1,ny=s.y*c*a2+u.y*sn*a1,nz=s.z*c*a2+u.z*sn*a1;const l=Math.hypot(nx,ny,nz)||1;
      nor[i]=nx/l;nor[i+1]=ny/l;nor[i+2]=nz/l;pos[i]=p.x+ox;pos[i+1]=p.y+oy;pos[i+2]=p.z+oz}}
  t.m.geometry.attributes.position.needsUpdate=true;t.m.geometry.attributes.normal.needsUpdate=true}
WD.Tube=Tube;WD.tubeWrite=(t)=>tubeWrite(t);
/* frames for a spine given as points (side = up x along, up = along x side) */
function tubeFrames(t){const {N,P,S,U}=t;for(let j=0;j<=N;j++){_d.subVectors(P[Math.min(N,j+1)],P[Math.max(0,j-1)]).normalize();S[j].crossVectors(UP,_d);if(S[j].lengthSq()<1e-6)S[j].set(1,0,0);S[j].normalize();U[j].crossVectors(_d,S[j]).normalize()}}
/* forward kinematics for a tentacle: every segment bends by lift (up) and yaw (sideways) */
function poseArm(A){const tb=A.tube,n=tb.N,seg=tb.L/n;_q.identity();_v.set(0,0,0);
  for(let j=0;j<=n;j++){if(j<n){_qa.setFromAxisAngle(XA,-A.lift[j]);_q.multiply(_qa);_qa.setFromAxisAngle(YA,A.yaw[j]);_q.multiply(_qa)}
    tb.P[j].copy(_v);tb.S[j].set(1,0,0).applyQuaternion(_q);tb.U[j].set(0,1,0).applyQuaternion(_q);_d.set(0,0,1).applyQuaternion(_q);_v.addScaledVector(_d,seg)}
  tubeWrite(tb)}

/* ---------- textures ---------- */
function dot(c,x,y,r,inner,outer){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,inner);g.addColorStop(1,outer);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
function wrapped(w,h,x,y,r,fn){for(const ox of[-w,0,w])for(const oy of[-h,0,h]){if(x+ox<-r||x+ox>w+r||y+oy<-r||y+oy>h+r)continue;fn(x+ox,y+oy)}}
function krTex(){
  const map=canvasTex(512,256,(c,w,h)=>{const g=c.createLinearGradient(0,h,0,0);g.addColorStop(0,'#c86a72');g.addColorStop(.22,'#9a2c46');g.addColorStop(.65,'#5e1434');g.addColorStop(1,'#3a0a26');c.fillStyle=g;c.fillRect(0,0,w,h);
    for(let i=0;i<1500;i++){const x=Math.random()*w,y=Math.random()*h,r=1.5+Math.random()*7;c.fillStyle=Math.random()<.55?`rgba(30,0,16,${.1+Math.random()*.25})`:`rgba(230,120,130,${.05+Math.random()*.15})`;c.beginPath();c.ellipse(x,y,r*1.3,r,Math.random()*3,0,6.283);c.fill()}
    c.lineWidth=1.6;for(let i=0;i<140;i++){const x=Math.random()*w,y=Math.random()*h,r=3+Math.random()*9;c.strokeStyle=`rgba(25,0,14,${.3+Math.random()*.3})`;c.beginPath();c.arc(x,y,r,0,6.283);c.stroke()}
    c.lineWidth=1;for(let i=0;i<90;i++){let x=Math.random()*w,y=Math.random()*h;c.strokeStyle='rgba(20,0,12,.22)';c.beginPath();c.moveTo(x,y);for(let k=0;k<10;k++){x+=rr(12);y+=rr(9);c.lineTo(x,y)}c.stroke()}});
  const em=canvasTex(512,256,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);
    for(let i=0;i<240;i++){const x=Math.random()*w,y=h*.1+Math.random()*h*.8;dot(c,x,y,2+Math.random()*5,'rgba(150,255,255,1)','rgba(0,60,90,0)')}
    for(let row=0;row<5;row++){const y0=h*(.22+row*.14);for(let x=4;x<w;x+=16){const y=y0+Math.sin(x*.05+row*1.7)*9;dot(c,x,y,5,'rgba(190,255,240,1)','rgba(0,0,0,0)')}}});
  return{map,em}}
function armTex(){
  const map=canvasTex(256,64,(c,w,h)=>{const g=c.createLinearGradient(0,0,128,0);g.addColorStop(0,'#9a2c46');g.addColorStop(.5,'#5a1030');g.addColorStop(1,'#9a2c46');c.fillStyle=g;c.fillRect(0,0,128,h);
    for(let i=0;i<160;i++){const x=Math.random()*128,y=Math.random()*h,r=1+Math.random()*4;wrapped(w,h,x,y,r*1.4,(X,Y)=>{c.fillStyle=Math.random()<.6?'rgba(30,0,16,.25)':'rgba(230,120,130,.14)';c.beginPath();c.ellipse(X,Y,r*1.3,r,0,0,6.283);c.fill()})}
    const g2=c.createLinearGradient(128,0,256,0);g2.addColorStop(0,'#a8445a');g2.addColorStop(.18,'#efc0bc');g2.addColorStop(.82,'#efc0bc');g2.addColorStop(1,'#a8445a');c.fillStyle=g2;c.fillRect(128,0,128,h);
    for(const [cx,cy] of[[166,16],[218,48]])wrapped(w,h,cx,cy,15,(X,Y)=>{c.fillStyle='#f8dcd6';c.beginPath();c.arc(X,Y,14,0,6.283);c.fill();c.fillStyle='#c46a78';c.beginPath();c.arc(X,Y,9,0,6.283);c.fill();c.fillStyle='#5a1a2a';c.beginPath();c.arc(X,Y,4.5,0,6.283);c.fill();c.strokeStyle='rgba(90,20,40,.5)';c.lineWidth=1.5;c.beginPath();c.arc(X,Y,14,0,6.283);c.stroke()})});
  const em=canvasTex(256,64,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);for(const [x,y,r] of[[64,16,7],[64,48,5],[30,32,4],[98,8,4],[98,40,3]])wrapped(w,h,x,y,r,(X,Y)=>dot(c,X,Y,r,'rgba(170,255,250,1)','rgba(0,0,0,0)'))});
  return{map,em}}
function irisTex(c1,c2,c3){return canvasTex(128,128,(c,w,h)=>{c.fillStyle='#120804';c.fillRect(0,0,w,h);const g=c.createRadialGradient(64,64,6,64,64,60);g.addColorStop(0,c1);g.addColorStop(.55,c2);g.addColorStop(.92,c3);g.addColorStop(1,'#140600');c.fillStyle=g;c.beginPath();c.arc(64,64,60,0,6.283);c.fill();
  c.strokeStyle='rgba(90,30,0,.35)';c.lineWidth=1.2;for(let i=0;i<60;i++){const a=i/60*6.283;c.beginPath();c.moveTo(64+Math.cos(a)*14,64+Math.sin(a)*14);c.lineTo(64+Math.cos(a)*58,64+Math.sin(a)*58);c.stroke()}
  c.fillStyle='#050202';c.beginPath();c.ellipse(64,64,38,9,0,0,6.283);c.fill()})}
function foamTex(){return canvasTex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);for(let i=0;i<700;i++){const a=Math.random()*6.283,r=60+Math.random()*64,x=128+Math.cos(a)*r,y=128+Math.sin(a)*r,f=1-Math.abs(r-90)/40;if(f<=0)continue;dot(c,x,y,3+Math.random()*7,`rgba(255,255,255,${.5*f})`,'rgba(255,255,255,0)')}})}
function swirlTex(){return canvasTex(512,512,(c,w,h)=>{c.clearRect(0,0,w,h);c.lineCap='round';for(let arm=0;arm<7;arm++){for(let k=0;k<120;k++){const t=k/120,a=arm/7*6.283+t*9,r=20+t*230,x=256+Math.cos(a)*r,y=256+Math.sin(a)*r;c.strokeStyle=`rgba(235,250,255,${.55*(1-t)*Math.min(1,t*6)})`;c.lineWidth=2+t*6;c.beginPath();c.arc(x,y,1,0,6.283);c.stroke()}}
  const g=c.createRadialGradient(256,256,0,256,256,256);g.addColorStop(0,'rgba(2,10,20,.95)');g.addColorStop(.25,'rgba(4,22,40,.6)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h)})}
function scaleTex(){const scales=(c,x0,x1,h,base,hi,edge)=>{c.fillStyle=base;c.fillRect(x0,0,x1-x0,h);for(let row=0;row<=h/12+1;row++)for(let col=0;col<=(x1-x0)/14+1;col++){const x=x0+col*14+(row%2)*7,y=row*12;if(x>x1+7)continue;const g=c.createLinearGradient(x,y-10,x,y+2);g.addColorStop(0,hi);g.addColorStop(1,base);c.fillStyle=g;c.beginPath();c.arc(x,y,8.5,Math.PI,0);c.fill();c.strokeStyle=edge;c.lineWidth=1.2;c.beginPath();c.arc(x,y,8.5,Math.PI,0);c.stroke()}};
  const map=canvasTex(256,96,(c,w,h)=>{scales(c,0,128,h,'#0f3b37','#2c8a74','rgba(120,240,200,.45)');
    const g=c.createLinearGradient(128,0,256,0);g.addColorStop(0,'#2a5a3a');g.addColorStop(.15,'#d8cf90');g.addColorStop(.85,'#d8cf90');g.addColorStop(1,'#2a5a3a');c.fillStyle=g;c.fillRect(128,0,128,h);
    c.strokeStyle='rgba(90,80,40,.6)';c.lineWidth=2;for(let y=0;y<h;y+=12){c.beginPath();c.moveTo(140,y);c.lineTo(244,y);c.stroke()}
    c.fillStyle='rgba(5,25,22,.55)';for(let y=6;y<h;y+=24){c.beginPath();c.ellipse(64,y,14,6,0,0,6.283);c.fill()}});
  const em=canvasTex(256,96,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);for(let y=6;y<h;y+=24){for(const x of[14,114])dot(c,x,y,7,'rgba(140,255,220,1)','rgba(0,0,0,0)');dot(c,64,y,4,'rgba(140,255,220,.8)','rgba(0,0,0,0)')}});
  const head=canvasTex(256,128,(c,w,h)=>scales(c,0,256,h,'#0f3b37','#2c8a74','rgba(120,240,200,.4)'));head.repeat.set(4,2);
  return{map,em,head}}

/* ---------- De Kraak ---------- */
let KM=null;
function krMats(){if(KM)return KM;const t=krTex(),a=armTex();
  KM={body:new T.MeshPhysicalMaterial({map:t.map,emissiveMap:t.em,emissive:0x66f0ff,emissiveIntensity:.5,roughness:.34,clearcoat:.8,clearcoatRoughness:.28}),
    arm:new T.MeshPhysicalMaterial({map:a.map,emissiveMap:a.em,emissive:0x66f0ff,emissiveIntensity:.5,roughness:.36,clearcoat:.7,clearcoatRoughness:.3}),
    fin:new T.MeshPhysicalMaterial({color:0x8a2a4a,emissive:0x2a0418,roughness:.4,clearcoat:.6,transparent:true,opacity:.93,side:T.DoubleSide}),
    eye:new T.MeshPhysicalMaterial({color:0x060304,roughness:.08,clearcoat:1}),
    iris:new T.MeshBasicMaterial({map:irisTex('#fff6b0','#ffb21e','#8a3a00')})};return KM}
const bz=y=>.032*Math.pow(Math.max(0,y-1.4),2);
function eyeCap(r,mat){const g=new T.SphereGeometry(r,24,8,0,6.283,0,.92),p=g.attributes.position,uv=g.attributes.uv,R=Math.sin(.92)*r;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/(2*R)+.5,p.getZ(i)/(2*R)+.5);g.rotateX(Math.PI/2);return new T.Mesh(g,mat)}
makeKraken=function(){const M=krMats(),g=new T.Group(),rig=new T.Group();g.add(rig);
  const K={g,rig,kr:true,legs:dummyLegs(),phase:0,t:Math.random()*10,raise:0,atk:0,pw:0,after:0,blink:3,lidT:0,arms:[],eyes:[],fins:[]};
  const prof=[[.02,-2.3],[1.5,-2.05],[2.35,-1.35],[2.8,-.2],[2.98,1.0],[2.82,2.2],[2.58,3.2],[2.78,4.5],[2.88,5.7],[2.62,7.0],[2.1,8.2],[1.4,9.25],[.72,10.05],[.02,10.55]];
  const pts=new T.SplineCurve(prof.map(p=>new T.Vector2(p[0],p[1]))).getPoints(46),geo=new T.LatheGeometry(pts,44,Math.PI,6.283),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const k=1+(fbm(x*.55+y*.3+7,z*.55-y*.25+3,3)-.5)*.16;p.setXYZ(i,x*k,y,z*k-bz(y))}
  geo.computeVertexNormals();const mantle=mesh(geo,M.body,0,0,0);rig.add(mantle);K.mantle=mantle;
  /* fins at the tip of the mantle */
  const fs=new T.Shape();fs.moveTo(0,-1.3);fs.quadraticCurveTo(1.7,-1.1,2.8,.3);fs.quadraticCurveTo(1.8,1.5,0,2.3);fs.lineTo(0,-1.3);const fg=new T.ShapeGeometry(fs,10);
  for(const sx of[-1,1]){const y=8.2,piv=new T.Group();piv.position.set(sx*1.5,y,-bz(y));piv.rotation.x=-Math.atan(.064*(y-1.4));const f=new T.Mesh(fg,M.fin);f.scale.x=sx;f.castShadow=true;piv.add(f);rig.add(piv);K.fins.push({piv,sx})}
  /* eyes */
  for(const sx of[-1,1]){const e=new T.Group();e.position.set(sx*1.84,1.75,2.0);rig.add(e);e.add(mesh(new T.SphereGeometry(.62,20,16),M.eye,0,0,0,false));
    const ir=eyeCap(.636,M.iris);e.add(ir);e.add(mesh(new T.SphereGeometry(.07,8,6),new T.MeshBasicMaterial({color:0xffffff}),.2,.22,.6,false));
    const lid=new T.Mesh(new T.SphereGeometry(.7,20,10,0,6.283,0,Math.PI/2),M.body);lid.rotation.x=-.75;e.add(lid);
    const brow=new T.Mesh(new T.TorusGeometry(.72,.17,8,16,Math.PI),M.body);brow.position.set(0,.08,.12);brow.rotation.x=-.45;e.add(brow);
    const glow=new T.Sprite(new T.SpriteMaterial({map:WD.tx('glare.png'),color:0xffb030,transparent:true,opacity:.25,blending:T.AdditiveBlending,depthWrite:false}));glow.scale.set(3.4,3.4,1);glow.position.z=.55;e.add(glow);
    const rest=new T.Quaternion().setFromEuler(new T.Euler(0,sx*.75,0));e.quaternion.copy(rest);K.eyes.push({e,lid,glow,rest})}
  /* eight arms and two long hunting arms with clubs */
  const mkArm=(ang,y,rad0,L,N,feed,ph)=>{const piv=new T.Group(),R0=feed?2.4:2.2;piv.position.set(Math.sin(ang)*R0,y,Math.cos(ang)*R0);piv.rotation.y=ang;rig.add(piv);
    const tb=Tube(N,10,s=>rad0*Math.pow(1-s,.85)+.035+(feed?.2*Math.exp(-Math.pow((s-.86)/.07,2)):0),M.arm,L,.25);piv.add(tb.m);
    const A={piv,tube:tb,feed,ph,ang,lift:new Float32Array(N),yaw:new Float32Array(N)};K.arms.push(A);return A};
  for(let i=0;i<8;i++)mkArm(Math.PI/8+i*Math.PI/4,-1.0,.62,10.5,26,false,i*1.7);
  K.feed=[mkArm(.17,-.45,.42,15,34,true,.3),mkArm(-.17,-.45,.42,15,34,true,2.1)];
  /* foam where the body meets the water */
  const foam=new T.Mesh(new T.RingGeometry(2.3,5.6,48,1),new T.MeshBasicMaterial({map:foamTex(),transparent:true,opacity:.7,depthWrite:false}));foam.rotation.x=-Math.PI/2;foam.userData.dyn=true;g.add(foam);K.foam=foam;
  g.userData.dyn=true;poseKraken(null,K,0);return K};
function poseKraken(a,K,dt){K.t+=dt;const t=K.t,dead=a&&a.dead,chase=a&&!dead&&a.state==='chase'&&!a.krSleep;
  K.raise+=((chase?1:0)-K.raise)*Math.min(1,dt*1.1);const R=K.raise;
  const br=1+Math.sin(t*1.1)*.035;K.mantle.scale.set(br,1+Math.sin(t*1.1+.6)*.012,br);
  K.rig.rotation.z=Math.sin(t*.45)*.05;K.rig.rotation.x=Math.sin(t*.37)*.035-R*.08;
  for(const F of K.fins)F.piv.rotation.y=F.sx*(.15+.32*Math.sin(t*1.4+F.sx))*(dead?.2:1);
  /* attack: the hunting arm rears up while winding up, slams down at the moment the blow lands */
  const w=a&&a.wind>0?a.wind:0;if(w>0&&K.pw<=0)K.atk=(K.atk+1)%2;
  if(K.pw>0&&w<=0){K.after=.7;const A=K.feed[K.atk];A.tube.m.updateMatrixWorld();_w.copy(A.tube.P[Math.floor(A.tube.N*.86)]).applyMatrix4(A.piv.matrixWorld);krSplash(_w.x,_w.z,1.4);if(Math.hypot(PL.x-_w.x,PL.z-_w.z)<20&&window.PW)PW.shake=Math.max(PW.shake||0,.45)}
  K.pw=w;if(K.after>0)K.after-=dt;
  let rear=0,slam=0;if(w>.18)rear=ease((.5-w)/.32);else if(w>0){rear=1-(.18-w)/.18;slam=ease((.18-w)/.18)}else if(K.after>0){slam=K.after/.7}
  /* eyes follow you and blink */
  K.blink-=dt;if(K.blink<0){K.lidT=.18;K.blink=2.5+Math.random()*4}if(K.lidT>0)K.lidT-=dt;
  const night=ENV.night||0;
  for(const E of K.eyes){if(a&&!dead){E.e.lookAt(PL.x,(PL.y||0)+1.2,PL.z);E.e.quaternion.slerp(E.rest,.35)}else E.e.quaternion.slerp(E.rest,Math.min(1,dt*2));
    const shut=dead?1:K.lidT>0?1:w>0?.0:0;E.lid.rotation.x+=((shut?1.25:-.75+(R*-.1))-E.lid.rotation.x)*Math.min(1,dt*(shut?30:8));E.glow.material.opacity=.15+.6*night+(w>0?.4:0)}
  const pulse=(.22+.9*night)*(.75+.25*Math.sin(t*2.3))+(w>0?.6:0);K.mantle.material.emissiveIntensity=dead?0:pulse;
  /* arms */
  const sp=dead?.25:1+R*.5;
  for(const A of K.arms){const n=A.tube.N,ph=A.ph;
    if(!A.feed||R<.01){for(let j=0;j<n;j++){const s=j/n;let l=(j===0?.16+R*.1:0)+.2*Math.sin(t*1.2*sp-j*.33+ph)*(dead?.3:1);if(s>.6)l+=.25*((s-.6)/.4)*(1+Math.sin(t*.6+ph))*.9;if(dead&&j===0)l=-.15;A.lift[j]=l;A.yaw[j]=.05*Math.sin(t*.7*sp-j*.2+ph)+(s>.6?.12*Math.sin(t*.5+ph)*((s-.6)/.4):0)}}
    if(A.feed){const me=A===K.feed[K.atk],rr2=me?rear:0,ss=me?slam:0,side=A===K.feed[0]?1:-1;
      for(let j=0;j<n;j++){const s=j/n,idle=A.lift[j]||0;let l;
        const lr=j===0?1.2+.06*Math.sin(t*.9+ph):-.052+.035*Math.sin(t*1.3-j*.25+ph)+(s>.78?.22:0),lb=j===0?1.7:-.022+(s>.78?.1:0),ls=j===0?.42:-.022;l=lr+(lb-lr)*rr2;l+=(ls-l)*ss;
        A.lift[j]=R<.01?idle:idle+(l-idle)*R;A.yaw[j]=(j===0?-side*.12*R:0)+.05*Math.sin(t*1.1-j*.2+ph)*(1-ss)}}
    poseArm(A)}
  if(K.foam){K.foam.rotation.z+=dt*.15;const s=1+Math.sin(t*1.7)*.05;K.foam.scale.set(s,s,1);if(a){K.foam.position.y=WL+.03-a.y;K.foam.visible=a.y>-3&&!dead}}}
function krSplash(x,z,k=1){if(!window.PW||!PW.ps)return;pwBurst(PW.ps,x,WL+.1,z,Math.round(46*k),5*k,1.1,.55*k,.12,[.92,.97,1],[.6,.8,.95],3.4*k,7,1,.5);pwBurst(PW.ps,x,WL+.1,z,Math.round(20*k),2.2*k,1.6,1.2*k,.3,[.9,.95,1],[.75,.85,.95],.8,1,.7,1.2);try{if(Math.hypot(PL.x-x,PL.z-z)<70)sfx('splash')}catch(e){}}
/* a deep growl, made from detuned saw waves and rumbling noise */
function roar(vol=1){try{sfx('_');if(!AC||!MASTER)return;const t0=AC.currentTime,f=AC.createBiquadFilter(),g=AC.createGain();f.type='lowpass';f.frequency.setValueAtTime(380,t0);f.frequency.linearRampToValueAtTime(700,t0+.6);f.frequency.exponentialRampToValueAtTime(200,t0+2.6);f.Q.value=5;
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.55*vol,t0+.3);g.gain.exponentialRampToValueAtTime(.001,t0+2.8);f.connect(g);g.connect(MASTER);
  for(const [f0,f1,ty] of[[68,40,'sawtooth'],[71,43,'sawtooth'],[51,31,'square']]){const o=AC.createOscillator();o.type=ty;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+2.6);const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=13;lg.gain.value=5;lfo.connect(lg);lg.connect(o.frequency);o.connect(f);o.start(t0);lfo.start(t0);o.stop(t0+2.9);lfo.stop(t0+2.9)}
  if(noiseBuf){const n=AC.createBufferSource();n.buffer=noiseBuf;n.loop=true;const nf=AC.createBiquadFilter();nf.type='lowpass';nf.frequency.value=240;const ng=AC.createGain();ng.gain.setValueAtTime(0,t0);ng.gain.linearRampToValueAtTime(.5*vol,t0+.4);ng.gain.exponentialRampToValueAtTime(.001,t0+2.6);n.connect(nf);nf.connect(ng);ng.connect(MASTER);n.start(t0);n.stop(t0+2.7)}}catch(e){}}
WD.roar=roar;

/* ---------- sea serpent ---------- */
let SM=null;
function serpMats(){if(SM)return SM;const t=scaleTex();
  SM={body:new T.MeshPhysicalMaterial({map:t.map,emissiveMap:t.em,emissive:0x5affd0,emissiveIntensity:.45,roughness:.38,clearcoat:.8,clearcoatRoughness:.3}),
    head:new T.MeshPhysicalMaterial({map:t.head,roughness:.36,clearcoat:.8,clearcoatRoughness:.3}),
    dark:new T.MeshPhysicalMaterial({color:0x0c2a26,roughness:.4,clearcoat:.6}),
    horn:new T.MeshStandardMaterial({color:0xd8cfb0,roughness:.45}),tooth:new T.MeshStandardMaterial({color:0xf6f2e4,roughness:.3}),
    mouth:new T.MeshStandardMaterial({color:0x5a0f1a,roughness:.6}),eye:new T.MeshBasicMaterial({color:0xffc030}),pupil:new T.MeshBasicMaterial({color:0x080404}),
    fin:new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.82,side:T.DoubleSide,depthWrite:false}),
    frill:new T.MeshStandardMaterial({color:0x2fbfa0,emissive:0x0f6a5a,emissiveIntensity:.6,transparent:true,opacity:.85,side:T.DoubleSide,roughness:.4}),
    rib:new T.LineBasicMaterial({color:0x0c3a32})};return SM}
function fanShape(r,a0,a1,n){const s=new T.Shape();s.moveTo(0,0);for(let i=0;i<=n*2;i++){const a=a0+(a1-a0)*i/(n*2),rad=i%2?r*.8:r;s.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}s.lineTo(0,0);return s}
function serpHead(M){const h=new T.Group(),H={h};
  const sk=mesh(new T.SphereGeometry(.5,18,14),M.head,0,0,0);sk.scale.set(.78,.62,1.25);h.add(sk);
  const sn=mesh(new T.SphereGeometry(.4,16,12),M.head,0,-.06,.62);sn.scale.set(.62,.45,1.15);h.add(sn);
  for(const sx of[-1,1]){h.add(mesh(new T.SphereGeometry(.04,6,5),M.pupil,sx*.12,.1,1.06,false));
    const br=mesh(new T.SphereGeometry(.18,10,8),M.dark,sx*.26,.24,.32);br.scale.set(1,.55,2.2);br.rotation.y=sx*.2;h.add(br);
    h.add(mesh(new T.SphereGeometry(.1,12,10),M.eye,sx*.3,.15,.42,false));const pu=mesh(new T.BoxGeometry(.02,.15,.04),M.pupil,sx*.395,.15,.44,false);pu.rotation.y=sx*.5;h.add(pu);
    for(const [hy,hz,len,rx,rz] of[[.3,-.25,1.1,-2.25,.28],[.18,-.42,.65,-2.45,.55]]){const hg=new T.ConeGeometry(.1*len,len,8);hg.translate(0,len/2,0);const ho=mesh(hg,M.horn,sx*.2,hy,hz);ho.rotation.set(rx,0,-sx*rz);h.add(ho)}
    for(let i=0;i<4;i++){const tg=new T.ConeGeometry(.028,.12,5);tg.rotateX(Math.PI);h.add(mesh(tg,M.tooth,sx*(.16-i*.02),-.2,.68+i*.14,false))}
    const fr=new T.Group();fr.position.set(sx*.34,.02,-.2);fr.rotation.y=sx*.6;h.add(fr);const fm=new T.Mesh(new T.ShapeGeometry(fanShape(1,-1.05,1.05,4),4),M.frill);fm.scale.x=sx;fr.add(fm);
    const pts=[];for(let i=0;i<=8;i++){const a=-1.05+2.1*i/8,r=i%2?.8:1;pts.push(new V3(0,0,.005),new V3(sx*Math.cos(a)*r,Math.sin(a)*r,.005))}const rib=new T.LineSegments(new T.BufferGeometry().setFromPoints(pts),M.rib);fr.add(rib);(H.frills=H.frills||[]).push({fr,sx});
    const bc=new T.CatmullRomCurve3([new V3(sx*.14,-.02,1.0),new V3(sx*.3,-.2,1.05),new V3(sx*.45,-.5,.9),new V3(sx*.5,-.85,.75)]);h.add(new T.Mesh(new T.TubeGeometry(bc,10,.022,5),M.dark))}
  for(let i=0;i<5;i++){const c=mesh(new T.ConeGeometry(.06,.28-i*.03,5),M.horn,0,.3-i*.02,.24-i*.16);c.rotation.x=-.5;h.add(c)}
  const jaw=new T.Group();jaw.position.set(0,-.16,-.1);h.add(jaw);const jm=mesh(new T.SphereGeometry(.38,16,10),M.head,0,-.08,.62);jm.scale.set(.6,.28,1.32);jaw.add(jm);
  const mo=mesh(new T.SphereGeometry(.33,12,8),M.mouth,0,-.01,.6,false);mo.scale.set(.5,.12,1.2);jaw.add(mo);
  for(const sx of[-1,1])for(let i=0;i<4;i++)jaw.add(mesh(new T.ConeGeometry(.026,.11,5),M.tooth,sx*(.15-i*.02),.04,.42+i*.15,false));
  H.jaw=jaw;return H}
makeSerpent=function(){const M=serpMats(),g=new T.Group(),rig=new T.Group();g.add(rig);const L=19,N=64;
  const body=Tube(N,12,s=>Math.max(.035,(.34+.3*smooth(0,.14,s))*(1-.93*smooth(.32,1,s))),M.body,L,.5);rig.add(body.m);
  const nf=N-8,fpos=new Float32Array(nf*6),fcol=new Float32Array(nf*6),fidx=[];for(let j=0;j<nf-1;j++){const a=j*2;fidx.push(a,a+1,a+2,a+1,a+3,a+2)}
  for(let j=0;j<nf;j++){fcol.set([.04,.3,.26],j*6);fcol.set([.4,1,.85],j*6+3)}
  const fg=new T.BufferGeometry();fg.setAttribute('position',new T.BufferAttribute(fpos,3));fg.setAttribute('color',new T.BufferAttribute(fcol,3));fg.setIndex(fidx);
  const fin=new T.Mesh(fg,M.fin);fin.frustumCulled=false;fin.userData.dyn=true;rig.add(fin);
  const H=serpHead(M);rig.add(H.h);
  const pecs=[];for(const sx of[-1,1]){const p=new T.Mesh(new T.ShapeGeometry(fanShape(.9,-.5,.9,3),3),M.frill);p.userData.dyn=true;rig.add(p);pecs.push({p,sx})}
  g.userData.dyn=true;
  return{g,rig,sp:true,legs:dummyLegs(),phase:0,t:Math.random()*10,body,fin,fpos,nf,H,pecs,trail:[],raise:0,pw:0,after:0,L,N,amp:1}};
const _m4=new T.Matrix4(),_e=new T.Euler();
function poseSerpent(a,S,dt){S.t+=dt;const t=S.t,dead=a.dead,chase=!dead&&a.state==='chase';
  S.raise+=((chase?1:0)-S.raise)*Math.min(1,dt*1.5);S.amp+=((dead?.15:1)-S.amp)*Math.min(1,dt*.5);
  const w=a.wind>0?a.wind:0;if(S.pw>0&&w<=0){S.after=.45;const hx=a.x+Math.sin(a.rot)*2,hz=a.z+Math.cos(a.rot)*2;krSplash(hx,hz,.6)}S.pw=w;if(S.after>0)S.after-=dt;
  let rear=0,strike=0;if(w>.18)rear=ease((.5-w)/.32);else if(w>0){rear=1-(.18-w)/.18;strike=ease((.18-w)/.18)}else if(S.after>0)strike=S.after/.45;
  const H=S.H,hyW=WL+(dead?-.6:.5+1.0*S.raise+1.1*rear-1.0*strike+Math.sin(t*1.3)*.12),hz=.25+1.5*strike-.5*rear;
  H.h.position.set(0,hyW-a.y,hz);H.h.rotation.set(.22*S.raise-.55*rear+.6*strike+(dead?.5:0),Math.sin(t*.9)*.12*(1-S.raise*.5),dead?.8:0);
  H.jaw.rotation.x=dead?.5:(Math.pow(Math.max(0,Math.sin(t*.55)),12)*.5+.95*rear*(1-strike)+.15*S.raise);
  const fo=.25+.7*Math.max(S.raise*.35,rear);for(const F of H.frills)F.fr.rotation.y=F.sx*(.15+fo*.9+Math.sin(t*3)*.04);
  /* the trail of head positions the body follows */
  const tr=S.trail,dx0=Math.sin(a.rot),dz0=Math.cos(a.rot);
  if(!tr.length||Math.hypot(a.x-tr[0].x,a.z-tr[0].z)>12){tr.length=0;for(let i=0;i<100;i++)tr.push({x:a.x-dx0*i*.3,z:a.z-dz0*i*.3})}
  else if(Math.hypot(a.x-tr[0].x,a.z-tr[0].z)>.3){tr.unshift({x:a.x,z:a.z});if(tr.length>130)tr.length=130}
  const N=S.N,L=S.L,body=S.body,c=Math.cos(a.rot),sn=Math.sin(a.rot);
  let ti=0,acc=0,px=a.x,pz=a.z;
  for(let j=0;j<=N;j++){const s=j/N*L+.35;
    while(ti<tr.length&&acc+Math.hypot(tr[ti].x-px,tr[ti].z-pz)<s){acc+=Math.hypot(tr[ti].x-px,tr[ti].z-pz);px=tr[ti].x;pz=tr[ti].z;ti++}
    let wx,wz,ddx,ddz;if(ti<tr.length){const nx=tr[ti].x,nz=tr[ti].z,sl=Math.hypot(nx-px,nz-pz)||1,f=(s-acc)/sl;wx=px+(nx-px)*f;wz=pz+(nz-pz)*f;ddx=(px-nx)/sl;ddz=(pz-nz)/sl}else{const e=s-acc;wx=px-dx0*e;wz=pz-dz0*e;ddx=dx0;ddz=dz0}
    const bl=smooth(.5,4,s),sx=a.x-dx0*s,sz=a.z-dz0*s;wx=sx+(wx-sx)*bl;wz=sz+(wz-sz)*bl;
    const lat=.3*Math.sin(s*.5-t*2.2)*smooth(1,5,s)*S.amp;wx+=-ddz*lat;wz+=ddx*lat;
    const amp=1.4*smooth(1.5,5,s)*(1-.5*smooth(.7*L,L,s))*S.amp,wy=WL-.5+amp*Math.sin(s*.5-t*2.4)-(dead?.4:0),y=hyW-.05+(wy-(hyW-.05))*smooth(0,3.6,s);
    const lx=wx-a.x,lz=wz-a.z;body.P[j].set(lx*c-lz*sn,y-a.y,lx*sn+lz*c)}
  body.P[0].set(0,hyW-a.y-.05,hz-.35);
  tubeFrames(body);tubeWrite(body);
  /* dorsal fin: a jagged ribbon along the back */
  const fp=S.fpos;for(let j=0;j<S.nf;j++){const k=j+3,P=body.P[k],U=body.U[k],r=body.rad[k]*.85,hh=(.62*(j%2?.5:1))*(1-smooth(.55,1,k/N))+.05;
    fp[j*6]=P.x+U.x*r;fp[j*6+1]=P.y+U.y*r;fp[j*6+2]=P.z+U.z*r;fp[j*6+3]=P.x+U.x*(r+hh);fp[j*6+4]=P.y+U.y*(r+hh);fp[j*6+5]=P.z+U.z*(r+hh)}
  S.fin.geometry.attributes.position.needsUpdate=true;
  /* pectoral fins near the front of the body */
  const k=7,P=body.P[k],Sd=body.S[k],U=body.U[k];_d.crossVectors(Sd,U);
  for(const F of S.pecs){_m4.makeBasis(Sd,U,_d);F.p.quaternion.setFromRotationMatrix(_m4);F.p.position.copy(P).addScaledVector(Sd,F.sx*body.rad[k]*.9);_e.set(0,F.sx*(-.9+.25*Math.sin(t*2.4)),0);_qa.setFromEuler(_e);F.p.quaternion.multiply(_qa);F.p.scale.x=F.sx}
  S.body.m.material.emissiveIntensity=(.2+.8*(ENV.night||0))*(.8+.2*Math.sin(t*2))}

/* ---------- the lair of De Kraak ---------- */
WD.lair=null;
function findLair(){const R=WD.reef||{x:-905,z:205},H=WD.harbor||{x:-785,z:185},tx=R.x-150,tz=R.z-330;let best=null,bd=1e9;
  for(let i=0;i<5000;i++){const x=rr(HALF-60),z=rr(HALF-60);if(terrainH(x,z)>-6)continue;if(Math.hypot(x-R.x,z-R.z)<240||Math.hypot(x-H.x,z-H.z)<260)continue;if(window.WD&&WD.inSea&&WD.inSea(x,z))continue;
    let ok=true;for(let r=12;r<=36&&ok;r+=12)for(let k=0;k<8;k++){const a=k*.785;if(terrainH(x+Math.cos(a)*r,z+Math.sin(a)*r)>-3){ok=false;break}}if(!ok)continue;
    const d=Math.hypot(x-tx,z-tz);if(d<bd){bd=d;best={x,z}}}
  return best}
function buildLair(L){WD.lair=L;const rock=new T.MeshStandardMaterial({color:0x2c3034,roughness:.6,metalness:.05,flatShading:true});
  const fm=new T.MeshBasicMaterial({map:foamTex(),transparent:true,opacity:.55,depthWrite:false});
  for(let i=0;i<11;i++){const a=i/11*6.283+rr(.22),r=26+Math.random()*14,x=L.x+Math.cos(a)*r,z=L.z+Math.sin(a)*r,fl=terrainH(x,z),top=6+Math.random()*13,h=top-fl;
    const geo=new T.DodecahedronGeometry(1,1),p=geo.attributes.position;for(let k=0;k<p.count;k++){const y=p.getY(k),t=Math.max(0,y);const x0=p.getX(k),z0=p.getZ(k),n=fbm(x0*3+i*7,z0*3+y*2,2)-.5;p.setX(k,x0*(1-.7*t*t)+n*.14);p.setZ(k,z0*(1-.7*t*t)-n*.1);p.setY(k,y+(y>.8?n*.4+.1:0))}geo.computeVertexNormals();
    const sc=2+Math.random()*1.8,s=mesh(geo,rock,x,fl+h/2,z);s.scale.set(sc,h/2,sc*(.8+Math.random()*.4));s.rotation.set(rr(.06),Math.random()*6,rr(.06));scene.add(s);
    const fo=new T.Mesh(new T.RingGeometry(.2,1,24),fm);fo.rotation.x=-Math.PI/2;fo.position.set(x,WL+.03,z);fo.scale.setScalar(sc*1.9);scene.add(fo);addCircle(x,z,sc*.8)}
  /* a broken ship, half sunk */
  const wd=MAT.wood,wk=new T.Group();wk.position.set(L.x+16,WL-.9,L.z-12);wk.rotation.set(-.32,.9,.3);scene.add(wk);
  const hull=mesh(new T.BoxGeometry(4.2,2.6,13,2,1,6),wd,0,0,0);const hp=hull.geometry.attributes.position;for(let i=0;i<hp.count;i++){const z=hp.getZ(i),y=hp.getY(i);let k=1;if(z>2)k=1-(z-2)/5.5*.85;hp.setX(i,hp.getX(i)*Math.max(.1,k)*(y<0?.7:1))}hull.geometry.computeVertexNormals();wk.add(hull);
  for(let i=0;i<7;i++){const rb=mesh(new T.BoxGeometry(.25,.25,4.6),MAT.wood,rr(1.6),1.6+Math.random()*.6,-2-i*.7);rb.rotation.set(rr(.3),rr(.4),rr(.5));wk.add(rb)}
  const mast=mesh(new T.CylinderGeometry(.16,.2,11,6),wd,0,5,1.2);mast.rotation.z=.25;wk.add(mast);
  const sail=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#bfb294';c.fillRect(0,0,w,h);c.globalCompositeOperation='destination-out';for(let i=0;i<14;i++){c.beginPath();c.ellipse(Math.random()*w,Math.random()*h,4+Math.random()*16,3+Math.random()*10,Math.random()*3,0,6.283);c.fill()}c.fillRect(0,h-26,w,26);c.globalCompositeOperation='source-over'});
  const sl=new T.Mesh(new T.PlaneGeometry(4.2,4,6,4),new T.MeshStandardMaterial({map:sail,transparent:true,alphaTest:.4,side:T.DoubleSide,roughness:1}));sl.position.set(.5,7.2,1.4);sl.rotation.set(0,.2,.3);addWind(sl.material,.3);wk.add(sl);
  /* the whirlpool above the sleeping beast */
  const wp=new T.Mesh(new T.CircleGeometry(19,48),new T.MeshBasicMaterial({map:swirlTex(),transparent:true,opacity:.75,depthWrite:false}));wp.rotation.x=-Math.PI/2;wp.position.set(L.x,WL+.04,L.z);wp.userData.dyn=true;scene.add(wp);
  const dk=new T.Mesh(new T.CircleGeometry(34,40),new T.MeshBasicMaterial({map:canvasTex(128,128,(c,w,h)=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(2,14,28,.75)');g.addColorStop(.6,'rgba(2,16,30,.45)');g.addColorStop(1,'rgba(2,16,30,0)');c.fillStyle=g;c.fillRect(0,0,w,h)}),transparent:true,depthWrite:false}));dk.rotation.x=-Math.PI/2;dk.position.set(L.x,WL+.02,L.z);scene.add(dk);
  L.wp=wp;L.flot=[];for(let i=0;i<10;i++){const o=Math.random()<.4?mesh(new T.CylinderGeometry(.35,.35,.9,10),mm(0x5a3a22),0,0,0):mesh(new T.BoxGeometry(.3,.12,2.4),mm(0x4a3420),0,0,0);o.userData.dyn=true;o.rotation.set(Math.PI/2*(Math.random()<.4?1:0),Math.random()*6,0);scene.add(o);L.flot.push({o,a:Math.random()*6.283,r:7+Math.random()*13})}
  HIDDEN.push({id:'lair',name:'Het Hol van De Kraak',x:L.x,z:L.z,found:false});MAPICON.lair='🦑';
  RUMORS.push({t:'Ver voorbij het koraalrif draait een draaikolk tussen scherpe rotsen en een gezonken schip. Daar slaapt De Kraak. Wie te dichtbij zwemt, maakt hem wakker.',h:'lair'})}
ANIMS.push(dt=>{const L=WD.lair;if(!L||Math.abs(PL.x-L.x)>400||Math.abs(PL.z-L.z)>400)return;const K=L.kr,sleep=!K||K.krSleep||K.dead;
  L.wp.rotation.z-=dt*(sleep?.35:.12);L.wp.material.opacity+=((sleep?.78:.18)-L.wp.material.opacity)*Math.min(1,dt);
  for(const F of L.flot){F.a+=dt*(sleep?.05:.02)*(14/F.r);F.o.position.set(L.x+Math.cos(F.a)*F.r,WL+.05+Math.sin(PL.t*1.3+F.r)*.06,L.z+Math.sin(F.a)*F.r)}
  if(sleep&&window.PW&&PW.ps&&Math.random()<dt*6)pwEm(PW.ps,L.x+rr(4),WL,L.z+rr(4),rr(.2),.8+Math.random(),rr(.2),1.2,.25,.05,[.85,.95,1],[.7,.85,1],.8,0,.5)});

/* ---------- waking, rising, sinking ---------- */
const SEAM=[];
function krWake(a){if(!a.krSleep)return;a.krSleep=false;a.krRise=0;a.krAway=0;roar(1.2);if(window.PW)PW.shake=Math.max(PW.shake||0,.6);addLog('De Kraak rijst op uit de diepte!','#ff7a9a');krSplash(a.x,a.z,2);
  if(!PL.fx.kraak&&window.cinematic&&!PL.dead){PL.fx.kraak=1;const dx=PL.x-a.x,dz=PL.z-a.z,d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d,V=(x,y,z)=>new T.Vector3(x,y,z);
    cinematic([{d:2.2,from:V(a.x+ux*30-uz*10,2.2,a.z+uz*30+ux*10),to:V(a.x+ux*24-uz*6,1.4,a.z+uz*24+ux*6),lf:V(a.x,1,a.z),lt:V(a.x,5,a.z)},
      {d:2.6,from:V(a.x+ux*18+uz*12,1.2,a.z+uz*18-ux*12),to:V(a.x+ux*15+uz*5,.9,a.z+uz*15-ux*5),lf:V(a.x,6,a.z),lt:V(a.x,8,a.z)}],'De Kraak','Heerser van de diepte',()=>{});
    if(window.CIN)CIN.tick=(CIN.tick||[]).concat([dt=>{krStep(a,dt);placeActor(a);poseKraken(a,a.model,dt)}])}}
function krStep(a,dt){if(a.krRise<1){a.krRise=Math.min(1,a.krRise+dt/3.4);const k=1-Math.pow(1-a.krRise,3);a.aq=-16+15.5*k;if(Math.random()<dt*7){const an=Math.random()*6.283;krSplash(a.x+Math.cos(an)*4,a.z+Math.sin(an)*4,.5)}if(a.krRise>=1){a.aq=-.5;a.provoked=true}}}
const _ahD=animHorse;animHorse=function(h,dt,sp){if(h&&(h.kr||h.sp))return;return _ahD(h,dt,sp)};
const _smD=spawnMonster;spawnMonster=function(type,x,z,o={}){
  if(type==='kraken'&&!WD.lair){const L=findLair();if(L){x=L.x;z=L.z;try{buildLair(L)}catch(e){console.warn('lair',e)}}}
  if((type==='serpent'||type==='piranha')&&WD.reef&&(Math.hypot(x-WD.reef.x,z-WD.reef.z)<170||Math.hypot(x-WD.harbor.x,z-WD.harbor.z)<150)){for(let i=0;i<3000;i++){const nx=rr(HALF-80),nz=rr(HALF-80);if(terrainH(nx,nz)<-3&&Math.hypot(nx-WD.reef.x,nz-WD.reef.z)>260&&!(WD.inSea&&WD.inSea(nx,nz))){x=nx;z=nz;break}}}
  const a=_smD(type,x,z,o);
  if(a&&a.model&&(a.model.kr||a.model.sp)){SEAM.push(a);if(a.model.kr){a.krSleep=true;a.krRise=1;a.aq=-16;a.y=-16;a.rad=3.4;a.range=8;a.hh=5;a.aggro=40;if(WD.lair)WD.lair.kr=a}}
  return a};
const _ueD=updateEnemy;updateEnemy=function(a,dt){
  if(a.model&&a.model.kr){if(a.krSleep){a.vel=0;a.state='idle';const d=Math.hypot(PL.x-a.x,PL.z-a.z);if((d<30&&!PL.dead&&!PL.inCave&&PL.x>-2000)||a.hp<a.hpMax)krWake(a);return}
    if(a.krRise<1){a.vel=0;return}
    const d=Math.hypot(PL.x-a.x,PL.z-a.z);a.krAway=d>75?(a.krAway||0)+dt:0;if(a.krAway>14){a.krSleep=true;a.state='idle';a.hp=a.hpMax;return}}
  _ueD(a,dt);if(a.model&&a.model.kr&&!a.krSleep)a.y=a.aq+Math.sin(PL.t*.8+a.id)*.12};
ANIMS.push(dt=>{for(const a of SEAM){const m=a.model,far=Math.abs(a.x-PL.x)+Math.abs(a.z-PL.z)>230;
  if(a.dead){a.wasDead=true;a.aq+=(-16-a.aq)*Math.min(1,dt*.25);a.root.rotation.z=m.kr?.25*Math.min(1,a.deadT/3):.5*Math.min(1,a.deadT/3)}
  else if(a.wasDead){a.wasDead=false;if(m.kr){a.krSleep=true;a.aq=-16;a.y=-16}else{a.aq=MON.serpent.aq;m.trail.length=0}}
  if(m.kr){if(a.krSleep&&!a.dead)a.aq+=(-16-a.aq)*Math.min(1,dt*.4);else krStep(a,dt)}
  if(m.kr&&a.krSleep&&a.y<-12)a.root.visible=false;
  if(far||!a.root.visible)continue;
  if(m.kr){if(a.y<-14.5&&a.krSleep)continue;poseKraken(a,m,dt)}else poseSerpent(a,m,dt)}});
MON.kraken.range=8;MON.kraken.rad=3.4;
})();
