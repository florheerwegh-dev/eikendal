/* ================= Westkaap: a fishing village at the sea, and life under the waves =================
   A harbour with a long pier, a docked ship and rowing boats, fishermen, a fish market and an inn.
   Out in the bay: a shallow coral reef with a sunken ruin, merfolk who swim, surface and leap,
   glowing jellyfish that sting, and a whale that comes up to breathe far out at sea. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a;
const HB={x:-785,z:185};WD.harbor=HB;
SITES.push(SITE.harbor={id:'harbor',name:'Westkaap',x:HB.x,z:HB.z,r:46,h:2.4,blend:1.7});
MAPICON.harbor='⚓';MAPICON.reef='🐚';
ROADS.push({w:2.2,pts:[[-604,162],[-680,170],[-735,178],[-768,184]]});
WAYDEF.push(['harbor','Reissteen Westkaap',HB.x+24,HB.z+40]);
RUMORS.push({t:'In het westen ligt het vissersdorp Westkaap, met een haven en een oude bakentoren op een eilandje. De vissers zeggen dat er meermensen bij het koraalrif in de baai zwemmen.',h:'harbor'});
LINES.fisher=['De vangst was goed vandaag.','Zie je dat vuur op de bakentoren? Dat brengt ons veilig thuis.','Bij het koraalrif zingen de meermensen.','Pas op voor de kwallen, ze prikken!','Soms zie je een walvis spuiten, ver op zee.','In de diepte woont De Kraak. Daar vaar ik niet heen.'];
JOBN.fisher='visser';
/* the reef: a shallow, clear lagoon in the bay */
const REEF={x:-905,z:205,r:42};WD.reef=REEF;
const _bhS=baseH;baseH=function(x,z){let h=_bhS(x,z);const d=Math.hypot(x-REEF.x,z-REEF.z);if(d<REEF.r+34&&h<-1.4)h=lerp(h,-1.75+(fbm(x*.08,z*.08,2)-.5)*.9,1-smooth(REEF.r-6,REEF.r+34,d));return h};

/* ---------- boats ---------- */
function hullGeo(L,W,H){const g=new T.BoxGeometry(W,H,L,2,1,6),p=g.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i),y=p.getY(i);let k=1;if(z>L*.18)k=1-(z-L*.18)/(L*.32)*.9;if(z<-L*.32)k=1-(-L*.32-z)/(L*.18)*.3;p.setX(i,p.getX(i)*Math.max(.08,k)*(y<0?.72:1));if(z>L*.32)p.setY(i,y+(z-L*.32)*.22)}g.computeVertexNormals();return g}
function rowboat(col=0x6a4a2a){const g=new T.Group();g.add(mesh(hullGeo(3.8,1.4,.6),mm(col),0,.1,0));g.add(mesh(new T.BoxGeometry(1.2,.06,.3),MAT.wood,0,.36,.3));g.add(mesh(new T.BoxGeometry(1.2,.06,.3),MAT.wood,0,.36,-.6));
  for(const s of[-1,1]){const o=mesh(new T.CylinderGeometry(.03,.03,2.4,5),MAT.wood,s*.8,.4,-.1);o.rotation.z=s*1.25;o.rotation.x=.2;g.add(o)}return g}
function bigShip(){const g=new T.Group(),wd=mm(0x5a3a22),dk=mm(0x3a2414);g.add(mesh(hullGeo(14,4,2.2),wd,0,.6,0));g.add(mesh(new T.BoxGeometry(3.6,.14,10),dk,0,1.6,-.4));g.add(mesh(new T.BoxGeometry(3.2,1.6,2.8),wd,0,2.4,-5.2));
  const st=canvasTex(64,64,(c,w,h)=>{c.fillStyle='#ece2c8';c.fillRect(0,0,w,h);c.fillStyle='#2f6a8a';c.fillRect(0,h/2-7,w,14)});
  for(const [mz,mh] of[[1.5,13],[-2.8,9]]){g.add(mesh(new T.CylinderGeometry(.16,.2,mh,6),dk,0,1.2+mh/2,mz));const sl=new T.Mesh(new T.PlaneGeometry(5.2,mh*.5,4,4),new T.MeshStandardMaterial({map:st,side:T.DoubleSide,roughness:.9}));
    const pp=sl.geometry.attributes.position;for(let i=0;i<pp.count;i++)pp.setZ(i,(1-Math.pow(pp.getX(i)/2.6,2))*.6);sl.geometry.computeVertexNormals();sl.position.set(0,2.6+mh*.5,mz+.3);g.add(sl)}
  return g}
const FLOAT=[];
function floatIt(o,amp=.06,sp=1){o.userData.dyn=true;o.userData.f={y:o.position.y,p:Math.random()*6,amp,sp,r:o.rotation.z};FLOAT.push(o);scene.add(o)}
ANIMS.push(()=>{for(const o of FLOAT){if(Math.abs(o.position.x-PL.x)>320||Math.abs(o.position.z-PL.z)>320)continue;const f=o.userData.f;o.position.y=f.y+Math.sin(PL.t*f.sp+f.p)*f.amp;o.rotation.z=f.r+Math.sin(PL.t*f.sp*.8+f.p)*f.amp*.5}});

/* ---------- the village ---------- */
function netTex(){return canvasTex(64,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(60,50,35,.95)';c.lineWidth=2;for(let i=0;i<=8;i++){c.beginPath();c.moveTo(i*8,0);c.lineTo(i*8,h);c.stroke();c.beginPath();c.moveTo(0,i*8);c.lineTo(w,i*8);c.stroke()}})}
WD.harborB=[];
function buildHarbor(){
  let sx=HB.x;for(let x=HB.x;x>HB.x-160;x-=1){if(terrainH(x,HB.z)<.3){sx=x;break}}
  const pz=HB.z,deckY=1.8,len=48,x0=sx+7,x1=sx-len;HB.shore=sx;HB.pierEnd=x1;
  bridges.push({x:(x0+x1)/2,z:pz,hx:(x0-x1)/2,hz:1.8,y:deckY});bridges.push({x:x1-1,z:pz,hx:3.5,hz:11,y:deckY});
  const deck=(cx,cz,lx,lz)=>{scene.add(mesh(new T.BoxGeometry(lx,.24,lz),MAT.wood,cx,deckY-.12,cz));const n=Math.floor((lx>lz?lx:lz)/1.2);for(let i=0;i<n;i++){const t=-.5+(i+.5)/n;scene.add(mesh(lx>lz?new T.BoxGeometry(.06,.05,lz):new T.BoxGeometry(lx,.05,.06),MAT.dark,lx>lz?cx+t*lx:cx,deckY+.005,lx>lz?cz:cz+t*lz,false))}};
  deck((x0+x1)/2,pz,x0-x1,3.4);deck(x1-1,pz,7,22);
  const post=(x,z)=>{const hh=deckY+5;scene.add(mesh(new T.CylinderGeometry(.16,.19,hh,6),MAT.bark,x,deckY-hh/2+.4,z))};
  for(let x=x0-2;x>x1;x-=3.6){post(x,pz-1.6);post(x,pz+1.6)}for(let z=-10;z<=10;z+=4){post(x1-4.3,pz+z);post(x1+2.3,pz+z)}
  for(const [x,z] of[[x1-4,pz-10.5],[x1-4,pz+10.5],[x1+2,pz-10.5],[x0-12,pz+1.7],[x0-30,pz-1.7]]){scene.add(mesh(new T.CylinderGeometry(.22,.26,.7,8),MAT.dark,x,deckY+.35,z))}
  lamp(x1-4,deckY+2.6,pz-10.5,true);lamp(x1-4,deckY+2.6,pz+10.5,true);lamp(x0-20,deckY+2.4,pz+1.7);scene.add(mesh(new T.CylinderGeometry(.06,.08,2.6,6),MAT.dark,x1-4,deckY+1.3,pz-10.5));scene.add(mesh(new T.CylinderGeometry(.06,.08,2.6,6),MAT.dark,x1-4,deckY+1.3,pz+10.5));
  /* the ship at the end of the pier, rowing boats along it */
  const sh=bigShip();sh.position.set(x1-9.5,-.25,pz-4);sh.rotation.y=0;floatIt(sh,.12,.7);addBox(x1-12,pz-11,x1-7,pz+3);
  for(let i=0;i<4;i++){const b=rowboat(i%2?0x6a4a2a:0x4a5a6a);b.position.set(x0-12-i*8.5,.02,pz+(i%2?4:-4));b.rotation.y=Math.PI/2+rr(.25);floatIt(b,.07,1.1)}
  {const b=rowboat(0x7a3a2a);b.position.set(sx+3,HB.z+12,0);b.position.set(sx+2,terrainH(sx+2,pz+14)+.25,pz+14);b.rotation.set(0,.4,.25);scene.add(b)}
  /* houses on the slope, all looking at the sea */
  const spots=[[24,-34,'home'],[26,-11,'inn'],[24,14,'shop'],[25,37,'home'],[45,-48,'home'],[46,-24,'home'],[47,2,'home'],[45,26,'home']];
  spots.forEach(([dx,dz,k],i)=>{try{const b=makeHouse({x:sx+dx,z:HB.z+dz,w:k==='inn'?9:7,d:k==='inn'?8:6,rot:3,style:i%3===0?'wood':i%3===1?'plaster':'stone',roof:'tile',name:k==='inn'?'Herberg De Zoute Haring':k==='shop'?'Netten en Touw':'Vissershuis',kind:k,h:k==='inn'?6:3.2});WD.harborB.push(b)}catch(e){console.warn('harbor house',e)}});
  /* fish market, nets, crates and barrels */
  stall(sx+15,pz+8,3,0x2f6a8a);stall(sx+15,pz-8,3,0x8a2a2a);
  const nm=new T.MeshStandardMaterial({map:netTex(),transparent:true,alphaTest:.3,side:T.DoubleSide,roughness:1});
  for(const [dx,dz] of[[6,22],[8,-22],[10,46]]){const x=sx+dx,z=pz+dz,y=groundH(x,z);for(const s of[-1,1])scene.add(mesh(new T.CylinderGeometry(.07,.08,2.6,5),MAT.wood,x,y+1.3,z+s*2));scene.add(mesh(new T.BoxGeometry(.08,.08,4.2),MAT.wood,x,y+2.55,z));
    const n=new T.Mesh(new T.PlaneGeometry(4,2.1,6,4),nm);const p=n.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin((p.getX(i)+2)/4*Math.PI)*.18);n.position.set(x,y+1.5,z);n.rotation.y=Math.PI/2;scene.add(n);addCircle(x,z+2,.15);addCircle(x,z-2,.15)}
  for(const [dx,dz] of[[10,4],[11,-3],[12,12],[13,-14],[9,-6]])crate(sx+dx,pz+dz);for(const [dx,dz] of[[9,12],[10,14],[12,-17],[8,18]])barrelW(sx+dx,pz+dz);
  for(const [dx,dz] of[[16,0],[18,-24],[18,26],[36,-12],[36,14]])lampPost(sx+dx,pz+dz);
  if(WD.banner){WD.banner(sx+64,HB.z-5,'#2f5a7a','tower',Math.PI/2);WD.banner(sx+64,HB.z+5,'#2f5a7a','tower',Math.PI/2)}
  signpost(-612,172,-1.5,[{t:'Westkaap ⚓',dir:1}]);
  /* fishermen rowing out in the bay */
  WD.rowers=[];for(const [cx,cz,r,sp] of[[-875,140,34,.12],[-870,285,28,-.15]]){const b=rowboat(0x5a4a3a),fig=new T.Group();fig.add(mesh(new T.CylinderGeometry(.22,.28,.8,8),mm(0x3a5a7a),0,.75,0));fig.add(mesh(new T.SphereGeometry(.18,8,6),mm(0xe0b090),0,1.35,0));fig.add(mesh(new T.CylinderGeometry(.24,.24,.12,8),mm(0xc7a94d),0,1.5,0));b.add(fig);b.userData.dyn=true;scene.add(b);WD.rowers.push({b,cx,cz,r,sp,a:Math.random()*6})}
}
ANIMS.push(dt=>{for(const R of WD.rowers||[]){R.a+=dt*R.sp;R.b.position.set(R.cx+Math.cos(R.a)*R.r,.05+Math.sin(PL.t*1.2+R.cx)*.06,R.cz+Math.sin(R.a)*R.r);R.b.rotation.y=Math.atan2(-Math.sin(R.a)*Math.sign(R.sp),Math.cos(R.a)*Math.sign(R.sp));R.b.rotation.z=Math.sin(PL.t*1.4)*.04}});

/* ---------- the reef: corals, seaweed and a sunken temple ---------- */
function buildReef(){
  const cols=[0xff6a8a,0xff9a3a,0xb06aff,0xffd84a,0x4ad8c8,0xff4a6a],N=150,cm=new T.MeshStandardMaterial({roughness:.6,emissive:0x221018}),cone=new T.ConeGeometry(.35,1.6,6),ball=new T.SphereGeometry(.7,10,7);
  const ic=new T.InstancedMesh(cone,cm,N),ib=new T.InstancedMesh(ball,cm,70),dm=new T.Object3D(),col=new T.Color();let k=0,kb=0;
  for(let i=0;i<500&&(k<N||kb<70);i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*REEF.r,x=REEF.x+Math.cos(a)*r,z=REEF.z+Math.sin(a)*r,y=terrainH(x,z);if(y>-.6)continue;
    if(k<N&&Math.random()<.7){for(let j=0;j<3&&k<N;j++){dm.position.set(x+rr(.6),y+.6,z+rr(.6));dm.rotation.set(rr(.4),Math.random()*6,rr(.4));const s=.5+Math.random()*.7;dm.scale.set(s,s*(.8+Math.random()*.6),s);dm.updateMatrix();ic.setMatrixAt(k,dm.matrix);col.setHex(cols[(i+j)%cols.length]);ic.setColorAt(k,col);k++}}
    else if(kb<70){dm.position.set(x,y+.1,z);dm.rotation.set(0,Math.random()*6,0);const s=.5+Math.random()*.8;dm.scale.set(s,s*.55,s);dm.updateMatrix();ib.setMatrixAt(kb,dm.matrix);col.setHex(cols[(i+2)%cols.length]);ib.setColorAt(kb,col);kb++}}
  ic.count=k;ib.count=kb;scene.add(ic,ib);
  const wm=new T.MeshStandardMaterial({color:0x2f8a4a,side:T.DoubleSide,roughness:.8});addWind(wm,.25);const weed=new T.PlaneGeometry(.35,1.3,1,4);weed.translate(0,.65,0);const iw=new T.InstancedMesh(weed,wm,120);let kw=0;
  for(let i=0;i<400&&kw<120;i++){const a=Math.random()*6.283,r=REEF.r*(.4+Math.random()*.8),x=REEF.x+Math.cos(a)*r,z=REEF.z+Math.sin(a)*r,y=terrainH(x,z);if(y>-.8)continue;dm.position.set(x,y,z);dm.rotation.set(0,Math.random()*6,0);dm.scale.set(1,.55+Math.random()*.35,1);dm.updateMatrix();iw.setMatrixAt(kw++,dm.matrix)}
  iw.count=kw;scene.add(iw);
  /* the sunken temple of the merfolk */
  const st=mm(0x8a9a9a,{roughness:.9}),cx=REEF.x-6,cz=REEF.z-8,y0=terrainH(cx,cz);
  for(let i=0;i<8;i++){const a=i/8*6.283,x=cx+Math.cos(a)*9,z=cz+Math.sin(a)*9,h=i===0?2.8:.7+(i%3)*.45;const c=mesh(new T.CylinderGeometry(.55,.62,h,10),st,x,terrainH(x,z)+h/2,z);c.rotation.z=(i%4===1)?.25:0;scene.add(c)}
  const arch=mesh(new T.TorusGeometry(3,.45,8,18,Math.PI),st,cx+2,y0+.25,cz+3);arch.rotation.set(-1.5,.6,0);scene.add(arch);
  const fl=mesh(new T.CylinderGeometry(7,7,.25,24),mm(0x7a8a8a),cx,y0+.05,cz,false);scene.add(fl);
  const gl=new T.Mesh(new T.CircleGeometry(4,32),new T.MeshBasicMaterial({map:WD.tx('circle_space.png'),color:0x6ad8ff,transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false}));gl.rotation.x=-Math.PI/2;gl.position.set(cx,y0+.25,cz);gl.userData.dyn=true;scene.add(gl);WD.reefGlow=gl;
  HIDDEN.push({id:'reef',name:'Koraalrif van de Meermensen',x:REEF.x,z:REEF.z,found:false})}
ANIMS.push(dt=>{if(WD.reefGlow)WD.reefGlow.rotation.z+=dt*.2});

/* ---------- merfolk ---------- */
const MER=[];WD.mer=MER;
function merperson(o){const g=new T.Group(),b=new T.Group();g.add(b);
  const sk=mm(o.skin,{roughness:.6}),sc=new T.MeshStandardMaterial({color:o.col,metalness:.5,roughness:.3,emissive:o.col,emissiveIntensity:.15}),hr=mm(o.hair,{roughness:.7}),fin=new T.MeshStandardMaterial({color:o.fin,transparent:true,opacity:.85,side:T.DoubleSide,emissive:o.fin,emissiveIntensity:.25});
  const tor=mesh(new T.CylinderGeometry(.17,.22,.62,10),sk,0,0,.42);tor.rotation.x=Math.PI/2;b.add(tor);
  const top=mesh(new T.CylinderGeometry(.2,.2,.14,10),sc,0,0,.58);top.rotation.x=Math.PI/2;b.add(top);
  const head=new T.Group();head.position.set(0,.04,.86);b.add(head);head.add(mesh(new T.SphereGeometry(.14,12,10),sk,0,0,0));
  head.add(mesh(new T.SphereGeometry(.16,12,10),hr,0,.04,-.04));for(let i=0;i<5;i++){const h2=mesh(new T.ConeGeometry(.06,.7,6),hr,(i-2)*.06,.05,-.36);h2.rotation.x=-Math.PI/2+.25;head.add(h2)}
  for(const s of[-1,1]){const e=mesh(new T.SphereGeometry(.025,6,5),mm(0x103040),s*.05,.03,.13,false);head.add(e)}
  const arms=[];for(const s of[-1,1]){const a=new T.Group();a.position.set(s*.2,0,.68);const m=mesh(new T.CylinderGeometry(.045,.04,.55,6),sk,0,0,-.27);m.rotation.x=Math.PI/2;a.add(m);a.rotation.y=s*.4;b.add(a);arms.push(a)}
  const segs=[];let par=b,z0=.12;for(let i=0;i<5;i++){const s=new T.Group();s.position.set(0,0,i?-.3:z0);par.add(s);const r0=.22*(1-i*.16),r1=.22*(1-(i+1)*.16),m=mesh(new T.CylinderGeometry(r0,r1,.32,10),sc,0,0,-.15);m.rotation.x=Math.PI/2;s.add(m);segs.push(s);par=s}
  const fs=new T.Shape();fs.moveTo(0,0);fs.quadraticCurveTo(.35,-.2,.6,-.55);fs.quadraticCurveTo(.2,-.35,0,-.25);fs.quadraticCurveTo(-.2,-.35,-.6,-.55);fs.quadraticCurveTo(-.35,-.2,0,0);
  const f=new T.Mesh(new T.ShapeGeometry(fs),fin);f.rotation.x=-Math.PI/2;f.position.z=-.28;par.add(f);
  g.traverse(m=>{if(m.isMesh)m.castShadow=false});return{g,b,segs,arms,head}}
/* merfolk made from the same people as the villages: the skinned body, real face and hair, the legs hidden,
   and a hand-made tail on the pelvis: shimmering scales, a big two-lobed fluke, side fins, a veil fin and a pearl belt */
const MERLOOK=[
  {name:'Nerys',fem:1,hair:0xb0502a,hairStyle:'long3d',skin:0,top:0x1f8a86,c1:0x24c8b0,c2:0x10467a,rim:0xff8ad8,fin:0x8af4e6},
  {name:'Maris',fem:0,hair:0x15110d,hairStyle:'parted',beard:'stubble',skin:2,top:0x24407a,c1:0x3a6aff,c2:0x2a1466,rim:0x7affe0,fin:0xa8c0ff},
  {name:'Coralie',fem:1,hair:0xe8c070,hairStyle:'long3d',skin:1,top:0xd8647a,c1:0xff6a8a,c2:0xffa83a,rim:0x8affff,fin:0xffc4dc},
  {name:'Thalassos',fem:0,hair:0xb8b8b8,hairStyle:'parted',beard:'beard3d',skin:3,top:0x1e5a40,c1:0x2aa060,c2:0x123a3a,rim:0xffd86a,fin:0xa8f0b0}];
let MSC=null,FNT=null,FLK=null,PFG=null;
function merScaleTex(){if(MSC)return MSC;MSC=canvasTex(120,64,(c,w,h)=>{c.fillStyle='#bdbdbd';c.fillRect(0,0,w,h);
  for(let row=-1;row<=h/8+1;row++)for(let col=-1;col<=w/10+1;col++){const x=col*10+(row%2?5:0),y=row*8,g=c.createRadialGradient(x,y-3.5,.5,x,y-1,7);g.addColorStop(0,'#ffffff');g.addColorStop(.6,'#d6d6d6');g.addColorStop(1,'#7a7a82');
    c.fillStyle=g;c.beginPath();c.arc(x,y,6.3,Math.PI,0);c.fill();c.strokeStyle='rgba(50,50,64,.5)';c.lineWidth=1;c.beginPath();c.arc(x,y,6.3,Math.PI,0);c.stroke()}});return MSC}
function finTex(){if(FNT)return FNT;FNT=canvasTex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);const g=c.createLinearGradient(0,h,0,0);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.55,'rgba(255,255,255,.72)');g.addColorStop(1,'rgba(255,255,255,.3)');c.fillStyle=g;c.fillRect(0,0,w,h);
  for(const [col,lw,o] of[['rgba(80,80,110,.5)',1.6,0],['rgba(255,255,255,.55)',.8,1.6]]){c.strokeStyle=col;c.lineWidth=lw;for(let i=0;i<=16;i++){c.beginPath();c.moveTo(w/2+(i-8)*3+o,h);c.quadraticCurveTo(w/2+(i-8)*6+o,h*.5,i*w/16+o,0);c.stroke()}}});FNT.wrapS=FNT.wrapT=T.ClampToEdgeWrapping;return FNT}
function shimmer(m,rim){const col=new T.Color(rim);m.onBeforeCompile=sh=>{sh.uniforms.uRim={value:col};sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uRim;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat frs=pow(1.0-abs(dot(normal,normalize(vViewPosition))),2.2);totalEmissiveRadiance+=uRim*frs*.75;')};return m}
function flukeGeo(){if(FLK)return FLK;const s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(.12,.05,.3,.1,.46,.34);s.quadraticCurveTo(.53,.48,.45,.59);s.bezierCurveTo(.36,.45,.2,.41,.1,.43);s.quadraticCurveTo(.04,.41,0,.31);
  s.quadraticCurveTo(-.04,.41,-.1,.43);s.bezierCurveTo(-.2,.41,-.36,.45,-.45,.59);s.quadraticCurveTo(-.53,.48,-.46,.34);s.bezierCurveTo(-.3,.1,-.12,.05,0,0);
  const g=new T.ShapeGeometry(s,20),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);uv.setXY(i,x+.5,y/.6);p.setZ(i,.16*x*x+.05*y*y)}g.computeVertexNormals();return FLK=g}
function pfinGeo(){if(PFG)return PFG;const s=new T.Shape();s.moveTo(0,0);s.quadraticCurveTo(.17,.03,.21,.2);s.quadraticCurveTo(.13,.18,.09,.29);s.quadraticCurveTo(.03,.16,0,.12);s.lineTo(0,0);
  const g=new T.ShapeGeometry(s,8),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/.21,p.getY(i)/.29);return PFG=g}
function makeTail(h,L){const A=AS.anchor[h.kind];if(!A||!A.pelvis||!WD.Tube||!T.BufferGeometryUtils)return null;
  const an=asAnchor(h.model,A.pelvis),male=h.kind==='male',k=male?1.08:1,c1=new T.Color(L.c1),c2=new T.Color(L.c2);
  const tm=shimmer(new T.MeshStandardMaterial({map:merScaleTex(),vertexColors:true,roughness:.3,metalness:.35}),L.rim);
  const prof=[[0,.165],[.08,.2],[.25,.188],[.45,.152],[.62,.122],[.8,.078],[.93,.046],[1,.04]],rf=s=>{for(let i=1;i<prof.length;i++)if(s<=prof[i][0]){const a=prof[i-1],b=prof[i],q=(s-a[0])/(b[0]-a[0]);return(a[1]+(b[1]-a[1])*q*q*(3-2*q))*k}return .04*k};
  const N=26,len=male?1.38:1.3,tb=WD.Tube(N,14,rf,tm,len,.45,s=>[1.12-.1*s,.88-.2*s]),R=tb.R,col=new Float32Array((N+1)*(R+1)*3),c=new T.Color();
  for(let j=0;j<=N;j++){c.copy(c1).lerp(c2,smooth(.12,1,j/N));for(let q=0;q<=R;q++)col.set([c.r,c.g,c.b],(j*(R+1)+q)*3)}
  tb.m.geometry.setAttribute('color',new T.BufferAttribute(col,3));an.add(tb.m);
  const fm=new T.MeshStandardMaterial({color:L.fin,map:finTex(),transparent:true,side:T.DoubleSide,depthWrite:false,roughness:.25,metalness:.15,emissive:L.fin,emissiveIntensity:.3});
  const fl=new T.Mesh(flukeGeo(),fm);fl.scale.setScalar(male?1.5:1.35);an.add(fl);
  const pf=[-1,1].map(sx=>{const m=new T.Mesh(pfinGeo(),fm);an.add(m);return{m,sx}});
  const VM=14,vp=new Float32Array((VM+1)*6),vu=new Float32Array((VM+1)*4),vi=[];for(let i=0;i<=VM;i++){vu.set([i/VM,0,i/VM,1],i*4);if(i<VM){const a=i*2;vi.push(a,a+2,a+1,a+1,a+2,a+3)}}
  const vg=new T.BufferGeometry();vg.setAttribute('position',new T.BufferAttribute(vp,3));vg.setAttribute('uv',new T.BufferAttribute(vu,2));vg.setIndex(vi);const veil=new T.Mesh(vg,fm);veil.frustumCulled=false;an.add(veil);
  /* a skirt of scales and a string of pearls hide where the shirt meets the tail */
  const by=male?0:.1,rx=.19*k,rz=.155*k,gs=[],ps=[],m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),one=new T.Vector3(1,1,1);
  for(let i=0;i<18;i++){const a=i/18*6.283,g=new T.CircleGeometry(.05,10);g.scale(1,1.45,1);g.translate(0,-.045,0);e.set(-.25,a,0,'YXZ');q.setFromEuler(e);m4.compose(new T.Vector3(Math.sin(a)*rx,by+.02,Math.cos(a)*rz),q,one);g.applyMatrix4(m4);gs.push(g)}
  for(let i=0;i<28;i++){const a=i/28*6.283,g=new T.SphereGeometry(.014,8,6);g.translate(Math.sin(a)*rx*.98,by+.035,Math.cos(a)*rz*.98);ps.push(g)}
  const bm=shimmer(new T.MeshStandardMaterial({map:merScaleTex(),color:L.c1,roughness:.3,metalness:.35,side:T.DoubleSide}),L.rim);
  an.add(new T.Mesh(T.BufferGeometryUtils.mergeBufferGeometries(gs),bm));an.add(new T.Mesh(T.BufferGeometryUtils.mergeBufferGeometries(ps),new T.MeshStandardMaterial({color:0xf6f0e6,roughness:.12,metalness:.25,emissive:0x302a24})));
  return{an,tb,fl,pf,veil,vp,VM,len,N,y0:male?.06:.11,D:new T.Vector3(0,-1,0)}}
const XV=new T.Vector3(1,0,0),_nu=new T.Vector3(),_m4=new T.Matrix4(),_qa=new T.Quaternion(),_dv=new T.Vector3(),_pv=new T.Vector3(),_uv=new T.Vector3();
function poseTail(TL,t,amp,freq,curve){const tb=TL.tb,N=tb.N,seg=TL.len/N;let y=TL.y0,z=0;
  for(let j=0;j<=N;j++){const s=j/N,th=curve*s*s+amp*Math.pow(s,1.2)*Math.sin(t*freq-s*3.6),c=Math.cos(th),sn=Math.sin(th);
    tb.P[j].set(0,y,z);tb.S[j].set(1,0,0);tb.U[j].set(0,-sn,c);if(j===N)TL.D.set(0,-c,-sn);y-=c*seg;z-=sn*seg}
  WD.tubeWrite(tb);
  const P=tb.P[N],D=TL.D;_nu.copy(tb.U[N]).negate();_m4.makeBasis(XV,D,_nu);TL.fl.quaternion.setFromRotationMatrix(_m4);_qa.setFromAxisAngle(XV,amp*.9*Math.sin(t*freq-4.4));TL.fl.quaternion.multiply(_qa);TL.fl.position.copy(P).addScaledVector(D,-.03);
  const k=Math.round(N*.3);_dv.subVectors(tb.P[k+1],tb.P[k]).normalize();_nu.copy(tb.U[k]).negate();_m4.makeBasis(XV,_dv,_nu);
  for(const F of TL.pf){F.m.quaternion.setFromRotationMatrix(_m4);_qa.setFromAxisAngle(_dv.set(0,1,0),F.sx*(.45+.18*Math.sin(t*2.6+F.sx)));F.m.quaternion.multiply(_qa);F.m.scale.set(F.sx,1,1);F.m.position.copy(tb.P[k]).addScaledVector(XV,F.sx*tb.rad[k]*tb.ex[k]*.9);_dv.subVectors(tb.P[k+1],tb.P[k]).normalize()}
  const vp=TL.vp,VM=TL.VM;for(let i=0;i<=VM;i++){const s=.34+.54*i/VM,f=s*N,j=Math.min(N-1,Math.floor(f)),fr=f-j;_pv.copy(tb.P[j]).lerp(tb.P[j+1],fr);_uv.copy(tb.U[j]).lerp(tb.U[j+1],fr).normalize();
    const r=(tb.rad[j]*(1-fr)+tb.rad[j+1]*fr)*tb.ey[j]*.9,hh=.15*Math.sin(Math.PI*i/VM)*(1+.14*Math.sin(t*3.5-i*.9));vp.set([_pv.x-_uv.x*r,_pv.y-_uv.y*r,_pv.z-_uv.z*r,_pv.x-_uv.x*(r+hh),_pv.y-_uv.y*(r+hh)-hh*.12,_pv.z-_uv.z*(r+hh)],i*6)}
  TL.veil.geometry.attributes.position.needsUpdate=true;TL.veil.geometry.computeVertexNormals()}
function buildMerfolk(){
  MERLOOK.forEach((L,i)=>{let h=null,tail=null;
    if(window.AS&&AS.ok&&typeof asAnchor==='function'){try{h=makeHuman({fem:!!L.fem,skin:SKINS[L.skin],hair:L.hair,hairStyle:L.hairStyle,beard:L.fem?'none':L.beard,eye:0x3f6fa5,face:i,tunic:L.top,tint:.6,outfit:'peasant',ovar:0,scale:L.fem?.95:1.02});
      if(h&&h.sk){h.model.traverse(p=>{if(!p.isBone&&/_(Legs|Feet)/.test(p.name))p.visible=false});tail=makeTail(h,L)}if(!tail)h=null}catch(e){console.warn('merfolk',e);h=null}}
    const o={name:L.name,col:L.c1,fin:L.fin,hair:L.hair,skin:SKINS[L.skin]},m=h?{g:h.g}:merperson(o);m.g.userData.dyn=true;scene.add(m.g);
    const M={...o,m,h,tail,a:i/MERLOOK.length*6.283,r:14+i*6,sp:(2.4+i*.3)/(14+i*6),ph:Math.random()*20,leap:0,x:0,z:0,y:-.9,i};M.x=REEF.x+Math.cos(M.a)*M.r;M.z=REEF.z+Math.sin(M.a)*M.r;MER.push(M);
    const it={x:REEF.x,z:REEF.z,r:7,txt:()=>PL.fx['mer'+i]?'Praat met '+o.name+' (meermens)':'Praat met '+o.name+' de meermens',fn:()=>merTalk(M)};INTER.push(it);M.it=it})}
const MTALK=['Welkom bij ons rif, landmens! Hier, een parel uit de diepte.','Diep in zee woont De Kraak. Wees voorzichtig als je daar zwemt.','Het vuur op de bakentoren is ons baken. Wij zwemmen er elke nacht omheen.','Onze tempel zonk lang geleden. Het licht in het midden brandt nog steeds.','De kwallen zijn mooi, maar raak ze niet aan!','Zie je de walvis soms? Hij heet Oude Bram. Hij is ouder dan het dorp.'];
function merTalk(M){M.talk=4;const first=!PL.fx['mer'+M.i];PL.fx['mer'+M.i]=1;
  if(first){giveItem('pearl',1);giveXp(30);addLog(M.name+': "'+MTALK[0]+'"','#7af0e0');sfx('quest')}else addLog(M.name+': "'+MTALK[1+Math.floor(Math.random()*(MTALK.length-1))]+'"','#7af0e0')}
let splashPS=null;
ANIMS.push(dt=>{if(!MER.length)return;for(const M of MER){const m=M.m,dP=Math.hypot(PL.x-M.x,PL.z-M.z)||1,near=Math.abs(PL.x-REEF.x)<(M.h?200:400)&&Math.abs(PL.z-REEF.z)<(M.h?200:400);m.g.visible=near;if(!near)continue;
  M.ph+=dt;const t=PL.t+M.i*2.3;if(M.talk>0)M.talk-=dt;
  /* curious: when you swim close they come up, look at you and wait to talk */
  const up=M.talk>0||(dP<16&&!(M.leap>0)&&!PL.dead);if(!up)M.a+=dt*M.sp*(M.leap>0?2.2:1);
  const tx=REEF.x+Math.cos(M.a)*M.r,tz=REEF.z+Math.sin(M.a)*M.r;
  if(up){const want=M.talk>0?3.5:6;if(dP>want){const k=Math.min(1,dt*(M.talk>0?1.2:.4))*(dP-want)/dP;M.x+=(PL.x-M.x)*k;M.z+=(PL.z-M.z)*k}}else{const k=Math.min(1,dt*1.5);M.x+=(tx-M.x)*k;M.z+=(tz-M.z)*k}
  /* every so often a merperson leaps out of the water */
  const cyc=M.ph%16,sy=M.h?-.2:-.34,uy=M.h?-.14:-.5;
  if(!up&&cyc>12.5&&cyc<14.2){M.leap=(cyc-12.5)/1.7;M.y=sy-.3+Math.sin(M.leap*Math.PI)*2.6;if(!M.splashed&&M.leap<.1){M.splashed=1;splash(M.x,M.z)}if(M.leap>.9&&!M.splashed2){M.splashed2=1;splash(M.x,M.z)}}
  else{M.leap=0;M.splashed=M.splashed2=0;M.y+=((up?uy:sy+Math.sin(t*.8)*.08)-M.y)*Math.min(1,dt*2)}
  m.g.position.set(M.x,M.y,M.z);
  const hd=up?Math.atan2(PL.x-M.x,PL.z-M.z):Math.atan2(-Math.sin(M.a)*Math.sign(M.sp),Math.cos(M.a)*Math.sign(M.sp));m.g.rotation.y+=angDiff(m.g.rotation.y,hd)*Math.min(1,dt*3);
  M.it.x=M.x;M.it.z=M.z;
  if(M.h){const h=M.h;if(dP>160)continue;
    /* the people's own swim clips: forward crawl along the reef, treading water when curious, talking with the upper body */
    skBase(h,up?'Swim_Idle_Loop':'Swim_Fwd_Loop',up?1:1.1);if(M.talk>0&&h.upName!=='Idle_Talking_Loop')skUpper(h,'Idle_Talking_Loop',false,1,.25);else if(M.talk<=0&&h.upName)skUpperStop(h,.3);
    h.mixer.update(dt);const pitch=M.leap>0?-Math.cos(M.leap*Math.PI)*.85:0;m.g.rotation.x+=(pitch-m.g.rotation.x)*Math.min(1,dt*5);
    M.kick=(M.kick||0)+dt*(up?1.5:M.leap>0?2.2:3.3);poseTail(M.tail,M.kick,up?.16:M.leap>0?.22:.4,1,up?.4:M.leap>0?.25:.1);continue}
  const pitch=up?-1.35:M.leap>0?-Math.cos(M.leap*Math.PI)*.9:Math.sin(t*1.5)*.12;m.b.rotation.x+=(pitch-m.b.rotation.x)*Math.min(1,dt*4);
  const sw=up?2:5;m.segs.forEach((s,i)=>s.rotation.x=Math.sin(t*sw-i*.8)*(.22+i*.05));m.arms.forEach((a,i)=>{a.rotation.x=up&&i===1?-1.2+Math.sin(t*(M.talk>0?6:3))*.4:Math.sin(t*2.5+i*Math.PI)*.4})}});
function splash(x,z){if(!window.PW||!PW.ps)return;pwBurst(PW.ps,x,.1,z,26,3.2,.8,.35,.08,[.9,.97,1],[.6,.8,.95],2.2,6,1,.6);try{if(Math.hypot(PL.x-x,PL.z-z)<60)sfx('splash')}catch(e){}}

/* ---------- jellyfish ---------- */
const JELLY=[];
function buildJellyfish(){const geo=new T.SphereGeometry(.55,14,8,0,6.283,0,Math.PI/2);
  for(let i=0;i<22;i++){const a=Math.random()*6.283,r=REEF.r+8+Math.random()*60,x=REEF.x+Math.cos(a)*r,z=REEF.z+Math.sin(a)*r;if(terrainH(x,z)>-1.2)continue;
    const c=[0xff7ad8,0x7ad8ff,0xb08aff,0xffb07a][i%4],g=new T.Group();const dome=new T.Mesh(geo,new T.MeshBasicMaterial({color:c,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));g.add(dome);
    const core=new T.Mesh(new T.SphereGeometry(.18,8,6),new T.MeshBasicMaterial({color:c,transparent:true,opacity:.45,blending:T.AdditiveBlending,depthWrite:false}));core.position.y=.15;g.add(core);
    const tm=new T.LineBasicMaterial({color:c,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false});const tents=[];
    for(let k=0;k<7;k++){const a2=k/7*6.283,pts=[];for(let s=0;s<6;s++)pts.push(new T.Vector3(Math.cos(a2)*.35,-s*.32,Math.sin(a2)*.35));const ge=new T.BufferGeometry().setFromPoints(pts);const l=new T.Line(ge,tm);g.add(l);tents.push({l,a2})}
    g.position.set(x,-.6,z);g.userData.dyn=true;scene.add(g);JELLY.push({g,dome,tents,x,z,p:Math.random()*6,mat:dome.material,base:.55})}}
let stingT=0;
ANIMS.push(dt=>{if(!JELLY.length)return;stingT-=dt;const near=Math.abs(PL.x-REEF.x)<300&&Math.abs(PL.z-REEF.z)<300;
  for(const J of JELLY){J.g.visible=near;if(!near)continue;const t=PL.t+J.p,pul=Math.sin(t*2.2);J.dome.scale.set(1+pul*.12,1-pul*.18,1+pul*.12);J.g.position.x=J.x+Math.sin(t*.13)*6;J.g.position.z=J.z+Math.cos(t*.11)*6;J.g.position.y=-.8+Math.sin(t*.5)*.2;
    J.mat.opacity=J.base+.35*ENV.night;for(const T2 of J.tents){const p=T2.l.geometry.attributes.position;for(let s=1;s<6;s++){p.setX(s,Math.cos(T2.a2)*.35+Math.sin(t*2+s*.7)*.08*s);p.setZ(s,Math.sin(T2.a2)*.35+Math.cos(t*1.7+s*.6)*.08*s)}p.needsUpdate=true}
    if(PL.swim&&stingT<=0&&Math.hypot(PL.x-J.g.position.x,PL.z-J.g.position.z)<1.5){stingT=1.2;damagePlayer(4,{name:'een kwal',type:'jelly'});addLog('Au! Een kwal prikt je.','#ff9ad8')}}});

/* ---------- the whale ---------- */
function buildWhale(){const g=new T.Group(),b=new T.Group();g.add(b);const sk=mm(0x2a3a4a,{roughness:.5}),bl=mm(0xc8ccd0,{roughness:.6});
  const body=mesh(new T.SphereGeometry(1,20,14),sk,0,0,0);body.scale.set(2.3,2,8);b.add(body);const belly=mesh(new T.SphereGeometry(1,16,10),bl,0,-.55,.8);belly.scale.set(1.9,1.4,6.6);b.add(belly);
  for(const s of[-1,1]){const f=mesh(new T.BoxGeometry(3,.18,1.2),sk,s*2.6,-.8,3);f.rotation.z=s*.4;f.rotation.y=s*.3;b.add(f);b.add(mesh(new T.SphereGeometry(.16,8,6),mm(0x0a0a0a),s*1.7,.3,6.6,false))}
  const tail=new T.Group();tail.position.z=-7.4;b.add(tail);const st=mesh(new T.CylinderGeometry(.5,1.2,4,10),sk,0,0,-1.6);st.rotation.x=Math.PI/2;tail.add(st);
  const fl=new T.Shape();fl.moveTo(0,0);fl.quadraticCurveTo(2,-.4,3.4,-1.6);fl.quadraticCurveTo(1.6,-1,0,-1.3);fl.quadraticCurveTo(-1.6,-1,-3.4,-1.6);fl.quadraticCurveTo(-2,-.4,0,0);
  const flk=new T.Mesh(new T.ShapeGeometry(fl),new T.MeshStandardMaterial({color:0x2a3a4a,side:T.DoubleSide}));flk.rotation.x=-Math.PI/2;flk.position.z=-3.4;tail.add(flk);
  g.userData.dyn=true;scene.add(g);WD.whale={g,b,tail,a:Math.random()*6,cx:-1010,cz:420,r:70,ph:0}}
ANIMS.push(dt=>{const W=WD.whale;if(!W)return;const near=Math.abs(PL.x-W.cx)<700&&Math.abs(PL.z-W.cz)<700;W.g.visible=near;if(!near)return;
  W.a+=dt*.035;W.ph=(W.ph+dt)%30;const x=W.cx+Math.cos(W.a)*W.r,z=W.cz+Math.sin(W.a)*W.r,ph=W.ph;
  let y=-7;if(ph<4)y=-7+ph/4*5.4;else if(ph<11)y=-1.6+Math.sin(PL.t*.6)*.15;else if(ph<14)y=-1.6-(ph-11)/3*5.4;
  W.g.position.set(x,y,z);W.g.rotation.y=Math.atan2(-Math.sin(W.a),Math.cos(W.a));W.b.rotation.x=ph>10.5&&ph<14?.35*Math.sin((ph-10.5)/3.5*Math.PI):ph<4?-.15:0;
  W.tail.rotation.x=Math.sin(PL.t*.9)*.25+(ph>11&&ph<14?-.6*Math.sin((ph-11)/3*Math.PI):0);
  if(ph>4&&ph<11&&window.PW&&PW.ps&&(ph%3)<dt*1.5){const hx=x+Math.sin(W.g.rotation.y)*5,hz=z+Math.cos(W.g.rotation.y)*5;for(let i=0;i<40;i++)pwEm(PW.ps,hx+rr(.3),.6,hz+rr(.3),rr(.8),7+Math.random()*4,rr(.8),1.4,.35,.15,[.95,.98,1],[.75,.85,.95],.9,9,.4)}});

/* ---------- build and populate ---------- */
const _bfS=buildFantasy;buildFantasy=function(){_bfS();for(const [n,f] of[['haven',buildHarbor],['rif',buildReef],['meermensen',buildMerfolk],['kwallen',buildJellyfish],['walvis',buildWhale]]){try{f()}catch(e){console.warn('sea '+n,e)}}};
const _pfS=populateFantasy;populateFantasy=function(){_pfS();try{
  const sx=HB.shore||HB.x-40,hs=homesIn('harbor');
  spawnNPC('merchant',sx+15,HB.z+5.6,{name:'Vishandelaar Marit',ai:'stay',shop:['fish','eel','golden_fish','pearl','rod','bread'],face:-Math.PI/2,line:'merchant'});
  spawnNPC('merchant',sx+15,HB.z-10.4,{name:'Touwslager Gerrit',ai:'stay',shop:['rod','arrow','leatherm','wool','potion'],face:-Math.PI/2,line:'merchant'});
  const inn=WD.harborB.find(b=>b.kind==='inn');if(inn)keeper(inn,'innkeeper','Herbergierster Wiep',FOOD,.9);
  for(let i=0;i<6;i++){const a=Math.random()*6.283,r=10+Math.random()*28,p={x:sx+30+Math.cos(a)*r*.7,z:HB.z+Math.sin(a)*r};collide(p,.5);const n=spawnNPC('fisher',p.x,p.z,{name:pick(FIRST)+' de visser',roam:{x:sx+30,z:HB.z},radius:30});if(hs.length)n.homeB=pick(hs)}
  for(const [x,z] of[[sx+20,HB.z],[sx+30,HB.z+30]])spawnNPC('guard',x,z,{name:'Havenwacht',ai:'guard',patrol:[[sx+18,HB.z-20],[sx+18,HB.z+20],[HB.x+30,HB.z+30],[HB.x+30,HB.z-30]],livery:0x2f5a7a});
}catch(e){console.warn('harbor folk',e)}};
})();
