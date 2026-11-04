/* Eikendal: the goblin tunnels rebuilt (textured rock, stalactites, crystals, a goblin camp, a mine, a spider nest,
   an underground lake, prisoners and a warlord), boss health bars and new loot for the lava world. */
(function(){
'use strict';
const CV={lights:[],bub:[],glow:[],veins:[],cages:[],webs:[]};window.CV=CV;
const L=n=>(window.AS&&AS.lib&&AS.lib[n])||null;
function prop(n,x,y,z,ry=0,s=1,o={}){const t=L(n);if(!t)return null;const p=t.clone();p.position.set(x,y,z);p.rotation.y=ry;p.scale.multiplyScalar(s);
  p.traverse(m=>{if(!m.isMesh)return;m.castShadow=!!o.shadow;m.receiveShadow=true;if(o.glow){m.material=m.material.clone();m.material.emissive=new T.Color(o.glow);m.material.emissiveIntensity=o.gi||.8}if(o.tint){m.material=m.material.clone();m.material.color.multiply(new T.Color(o.tint))}});
  scene.add(p);if(o.col)addCircle(x,z,o.col);return p}
function canvasTexture(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.anisotropy=4;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping}return t}
/* a spider web drawn once */
let webTex=null;function webT(){return webTex||(webTex=canvasTexture(256,256,(g)=>{g.strokeStyle='rgba(235,235,235,.85)';g.lineWidth=1.4;const c=128;for(let i=0;i<12;i++){const a=i/12*6.283;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*126,c+Math.sin(a)*126);g.stroke()}
  for(let r=10;r<126;r+=9){g.beginPath();for(let i=0;i<=12;i++){const a=i/12*6.283,rr=r+Math.sin(i*2.3+r)*2.5;i?g.lineTo(c+Math.cos(a)*rr,c+Math.sin(a)*rr):g.moveTo(c+Math.cos(a)*rr,c+Math.sin(a)*rr)}g.stroke()}}))}
let hideTex=null;function hideT(){return hideTex||(hideTex=canvasTexture(256,256,(g,w,h)=>{g.fillStyle='#7a5a3a';g.fillRect(0,0,w,h);for(let i=0;i<600;i++){g.fillStyle='rgba('+(Math.random()<.5?'50,30,15':'140,110,70')+','+(.08+Math.random()*.15)+')';g.beginPath();g.arc(Math.random()*w,Math.random()*h,2+Math.random()*14,0,6.283);g.fill()}
  g.strokeStyle='rgba(40,22,10,.7)';g.lineWidth=2;for(let i=0;i<6;i++){g.beginPath();g.moveTo(0,i*45+10);for(let x=0;x<=w;x+=16)g.lineTo(x,i*45+10+Math.sin(x*.08+i)*3);g.stroke();for(let x=8;x<w;x+=16){g.beginPath();g.moveTo(x,i*45+5);g.lineTo(x+4,i*45+15);g.stroke()}}},true))}
const inTunnel=(x,z,m=1)=>gtSd(x,z).sd<-m;

/* ================= build ================= */
buildGoblinTunnels=function(){
  if(GT.built)return;GT.built=true;setLoad('goblintunnels');const X0=GT.X0,tex=(window.AS&&AS.tex)||{};
  const rep=(t,r)=>{if(!t)return null;const c=t.clone();c.needsUpdate=true;c.wrapS=c.wrapT=T.RepeatWrapping;c.repeat.set(r,r);return c};
  /* floor: packed earth and stones, wet dark patches */
  const floorMap=rep(tex.rocks||tex.pathrocks,90),ceilMap=rep(tex.rocks,40);
  const fl=new T.Mesh(new T.PlaneGeometry(420,420),new T.MeshStandardMaterial({color:floorMap?0x6a5e52:0x2c2622,map:floorMap,roughness:.95}));fl.rotation.x=-Math.PI/2;fl.position.set(X0,-.02,-40);fl.receiveShadow=true;scene.add(fl);
  const ce=new T.Mesh(new T.PlaneGeometry(420,420),new T.MeshStandardMaterial({color:ceilMap?0x3a332c:0x1d1916,map:ceilMap,roughness:1}));ce.rotation.x=Math.PI/2;ce.position.set(X0,7.4,-40);scene.add(ce);
  const dirtMap=rep(tex.rocks||tex.cobble,8),dirt=new T.MeshStandardMaterial({color:0x7a6a58,map:dirtMap,roughness:.95});
  for(const c of GT.caps){if(c.ch){const m=new T.Mesh(new T.CircleGeometry(c.hw+.8,28),dirt);m.rotation.x=-Math.PI/2;m.position.set(c.ax,.02,c.az);m.receiveShadow=true;scene.add(m)}
    else{const len=Math.hypot(c.bx-c.ax,c.bz-c.az),m=new T.Mesh(new T.PlaneGeometry(len,(c.hw+.6)*2),dirt);m.rotateX(-Math.PI/2);m.rotateOnWorldAxis(new T.Vector3(0,1,0),-Math.atan2(c.bz-c.az,c.bx-c.ax));m.position.set((c.ax+c.bx)/2,.021,(c.az+c.bz)/2);m.receiveShadow=true;scene.add(m)}}
  /* rock walls: a closed wall of rock all along every corridor and hall, with big boulders in front of it.
     The boulders stand upright and stay out of the walkway, the wall behind them leaves no gaps at the bottom */
  const ring=(off,step)=>{const runs=[];for(const c of GT.caps){
      if(c.ch){const n=Math.ceil(6.283*(c.hw+off)/step),r=[];for(let i=0;i<=n;i++){const a=i/n*6.283;r.push([c.ax+Math.cos(a)*(c.hw+off),c.az+Math.sin(a)*(c.hw+off),c])}runs.push(r)}
      else{const dx=c.bx-c.ax,dz=c.bz-c.az,len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len,n=Math.ceil(len/step);for(const sgn of[-1,1]){const r=[];for(let i=0;i<=n;i++){const t=i/n;r.push([c.ax+dx*t+nx*(c.hw+off)*sgn,c.az+dz*t+nz*(c.hw+off)*sgn,c])}runs.push(r)}}}
    return runs};
  const rockM=new T.MeshStandardMaterial({color:0xffffff,map:rep(tex.rocks,1),roughness:.95,flatShading:true});
  {const wm=new T.MeshStandardMaterial({color:0x5a5048,map:rep(tex.rocks,1),roughness:1}),P=[],U=[],I=[];let u=0;
    for(const run of ring(1.15,1.2)){let prev=null;for(const p of run){const ok=gtSd(p[0],p[1],p[2]).sd>.5;
      if(ok&&prev){const d=Math.hypot(p[0]-prev[0],p[1]-prev[1]);if(d<2.6){const b=P.length/3;
        for(const [q,uu] of[[prev,u],[p,u+d/3]]){P.push(q[0],-.3,q[1],q[0],7.6,q[1]);U.push(uu,0,uu,7.9/3)}I.push(b,b+2,b+1,b+1,b+2,b+3);u+=d/3}}
      prev=ok?p:null}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();
    const wall=new T.Mesh(g,wm);wall.material.side=T.DoubleSide;wall.receiveShadow=true;wall.frustumCulled=false;scene.add(wall)}
  const keep=[];for(const run of ring(1.05,1.35))for(const p of run)if(gtSd(p[0],p[1],p[2]).sd>.75)keep.push(p);
  const geo=new T.DodecahedronGeometry(1,1),inst=new T.InstancedMesh(geo,rockM,keep.length),M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),Sc=new T.Vector3(),col=new T.Color();
  keep.forEach((p,i)=>{const s=.95+hash2(i,41)*.4;E.set((hash2(i,42)-.5)*.3,hash2(i,43)*6,(hash2(i,44)-.5)*.3);Q.setFromEuler(E);V.set(p[0],3,p[1]);Sc.set(s,3.8+hash2(i,45)*.6,s);M.compose(V,Q,Sc);inst.setMatrixAt(i,M);
    const k=.42+hash2(i,46)*.25;col.setRGB(k*1.05,k*.95,k*.85);inst.setColorAt(i,col)});
  inst.frustumCulled=false;scene.add(inst);
  /* stalactites from the ceiling and stalagmites on the floor */
  {const sg=new T.ConeGeometry(1,1,6,1),sm=new T.MeshStandardMaterial({color:0x6a5e52,map:rep(tex.rocks,1),roughness:.9,flatShading:true}),list=[];
    for(let t=0;t<9000&&list.length<520;t++){const x=X0+rnd(-180,180),z=rnd(-150,90);const r=gtSd(x,z);if(r.sd>-.6)continue;const down=Math.random()<.7,edge=r.sd>-2.6;if(!down&&!(edge&&r.c&&r.c.ch&&r.sd>-1.4))continue;list.push([x,z,down,edge])}
    const st=new T.InstancedMesh(sg,sm,list.length);list.forEach(([x,z,down,edge],i)=>{const h=down?rnd(.6,edge?2.6:1.6):rnd(.7,2.2),r=rnd(.15,.45)*(down?1:1.3);E.set(down?Math.PI:0,rnd(6),0);Q.setFromEuler(E);V.set(x,down?7.4-h/2:h/2,z);Sc.set(r,h,r);M.compose(V,Q,Sc);st.setMatrixAt(i,M)});
    st.frustumCulled=false;scene.add(st)}
  /* glowing crystal clusters along the walls */
  {const cg=new T.OctahedronGeometry(1,0),cols=[0x5ae6ff,0xb46aff,0x6affc0],mats=cols.map(c=>new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:1.3,roughness:.2,metalness:.1,transparent:true,opacity:.9}));
    const per=[[],[],[]];for(let t=0;t<6000&&per[0].length+per[1].length+per[2].length<300;t++){const x=X0+rnd(-180,180),z=rnd(-150,90),r=gtSd(x,z);if(r.sd>-.7||r.sd<-2)continue;const ci=Math.floor(hash2(Math.round(x),Math.round(z))*3);for(let k=0;k<4;k++)per[ci].push([x+rnd(-.6,.6),z+rnd(-.6,.6),rnd(.15,.5)])}
    per.forEach((L2,ci)=>{if(!L2.length)return;const im=new T.InstancedMesh(cg,mats[ci],L2.length);L2.forEach(([x,z,s],i)=>{E.set(rnd(-.5,.5),rnd(6),rnd(-.5,.5));Q.setFromEuler(E);V.set(x,s*1.2,z);Sc.set(s*.55,s*1.6,s*.55);M.compose(V,Q,Sc);im.setMatrixAt(i,M)});im.frustumCulled=false;scene.add(im);
      for(let i=0;i<L2.length;i+=24)CV.glow.push({x:L2[i][0],z:L2[i][1],c:cols[ci]})})}
  /* timber supports, lamps and torches along corridors */
  const wood=MAT.wood;
  for(const c of GT.caps){if(c.ch)continue;const dx=c.bx-c.ax,dz=c.bz-c.az,len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,nx=-uz,nz=ux,n=Math.floor(len/12);
    for(let i=1;i<=n;i++){const t=i/(n+1),x=c.ax+dx*t,z=c.az+dz*t,w=c.hw-.35;
      for(const s of[-1,1])scene.add(mapBox(.35,4.6,.35,wood,x+nx*w*s,2.3,z+nz*w*s));
      const beam=mapBox(c.hw*2,.35,.4,wood,x,4.6,z);beam.rotation.y=-Math.atan2(nz,nx);scene.add(beam);
      if(i%2){const tx=x+nx*(c.hw-.7),tz=z+nz*(c.hw-.7);if(!prop('Torch_Metal',tx,1.9,tz,-Math.atan2(nz,nx)+Math.PI/2,1.2))scene.add(mapBox(.1,.6,.1,wood,tx,1.9,tz));lamp(tx,2.65,tz,true)}}}
  const fire=(x,z)=>{const f=mesh(new T.ConeGeometry(.5,1.4,6),new T.MeshBasicMaterial({color:0xff8a2a}),x,.8,z,false);f.userData.dyn=true;scene.add(f);LAMPS.push({x,y:1.4,z,flame:f,fire:true});
    for(let k=0;k<6;k++){const a=k*1.05;const l=mesh(new T.CylinderGeometry(.09,.09,.9,5),wood,x+Math.cos(a)*.6,.2,z+Math.sin(a)*.6);l.rotation.z=1.4;l.rotation.y=a;scene.add(l)}
    for(let k=0;k<8;k++){const a=k/8*6.283;const s=mesh(new T.DodecahedronGeometry(.22,0),MAT.rock||dirt,x+Math.cos(a)*.95,.12,z+Math.sin(a)*.95);scene.add(s)}addCircle(x,z,.8)};
  const W=(k,dx,dz)=>[X0+GTN[k][0]+dx,GTN[k][1]+dz];
  for(const k of['HUB','C1','C2','C3','T','K']){const n=GTN[k],r=n[2];lamp(X0+n[0],3.2,n[1],true);
    for(let i=0;i<5;i++){const a=i/5*6.283+hash2(i,k.length*7)*.6,x=X0+n[0]+Math.cos(a)*(r-2.2),z=n[1]+Math.sin(a)*(r-2.2);if(!prop('Torch_Metal',x,1.6,z,-a+Math.PI/2,1.3))scene.add(mapBox(.25,2.6,.25,wood,x,1.3,z));lamp(x,2.5,z,true)}}
  /* ---------- HUB: the goblin camp ---------- */
  {const [hx,hz]=W('HUB',0,0),hm=new T.MeshStandardMaterial({map:hideT(),roughness:.95,side:T.DoubleSide});
    fire(hx+4,hz+3);fire(hx-6,hz-2);
    for(let i=0;i<5;i++){const a=i/5*6.283+.4,x=hx+Math.cos(a)*11,z=hz+Math.sin(a)*11,tent=new T.Group();tent.position.set(x,0,z);tent.rotation.y=-a;
      const c=mesh(new T.ConeGeometry(2.1,3.4,7,1,true),hm,0,1.7,0);tent.add(c);const pole=mesh(new T.CylinderGeometry(.06,.06,4.2,5),wood,0,2.1,0);tent.add(pole);
      const fl2=mesh(new T.CircleGeometry(1.9,12),new T.MeshStandardMaterial({color:0x3a2a1a,roughness:1}),0,.03,0);fl2.rotation.x=-Math.PI/2;tent.add(fl2);scene.add(tent);addCircle(x,z,1.7)}
    prop('Banner_1',hx+2,0,hz-9,.3,1.4);prop('Banner_2',hx-3,0,hz-9,-.2,1.4);prop('WeaponStand',hx+8,0,hz-4,-1.2,1.2,{col:.7});prop('WeaponStand',hx-9,0,hz+4,1.9,1.2,{col:.7});
    for(let i=0;i<9;i++){const a=rnd(6.28),r=rnd(4,13),x=hx+Math.cos(a)*r,z=hz+Math.sin(a)*r;if(!inTunnel(x,z,2))continue;prop(pick(['Barrel','Crate_Wooden','Crate_Wooden','Barrel_Apples','Bag','Pot_1','Bucket_Wooden_1']),x,0,z,rnd(6),rnd(1.1,1.5),{col:.6})}
    {const [cx,cz]=W('HUB',-3,7),ca=prop('Cauldron',cx,0,cz,0,1.6,{col:1});const liq=mesh(new T.CircleGeometry(.62,16),new T.MeshBasicMaterial({color:0x6aff5a}),cx,.95,cz,false);liq.rotation.x=-Math.PI/2;scene.add(liq);CV.bub.push({x:cx,y:1,z:cz});fire(cx,cz)}
    prop('Table_Large',hx-7,0,hz+8,.5,1.1,{col:1.2});prop('Mug',hx-7,1.03,hz+8,0,1.4);prop('Table_Plate',hx-6.4,1.03,hz+8.3,0,1.3);prop('Bench',hx-7,0,hz+9.4,.5,1.1);prop('Bench',hx-7,0,hz+6.6,.5,1.1)}
  /* ---------- prisoners in cages (C2 and K) ---------- */
  const cage=(k,dx,dz,who)=>{const [x,z]=W(k,dx,dz);let c=prop('Cage_Small',x,0,z,rnd(6),2.6,{col:1.4});if(!c){c=new T.Group();for(let i=0;i<10;i++){const a=i/10*6.283;c.add(mapBox(.06,2.2,.06,MAT.iron,Math.cos(a)*1.1,1.1,Math.sin(a)*1.1))}c.position.set(x,0,z);scene.add(c);addCircle(x,z,1.4)}
    CV.cages.push({x,z,who,g:c,open:false})};
  cage('C2',-6,-6,'Bram de Molenaar');cage('K',14,-8,'Ridder Aldo');
  /* ---------- C1: the mine, rails and ore veins ---------- */
  {const [mx,mz]=W('C1',0,0);
    const rail=(x0,z0,x1,z1)=>{const len=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0);for(const s of[-.5,.5]){const r=mapBox(len,.08,.08,MAT.iron,(x0+x1)/2-Math.sin(a)*s,.06,(z0+z1)/2+Math.cos(a)*s);r.rotation.y=-a;scene.add(r)}
      for(let t=0;t<len;t+=.9){const sx=x0+(x1-x0)*t/len,sz=z0+(z1-z0)*t/len,sl=mapBox(.25,.06,1.4,wood,sx,.03,sz);sl.rotation.y=-a;scene.add(sl)}};
    rail(mx-9,mz-2,mx+9,mz+3);const n=GTN.HUB;rail(mx+9,mz+3,mx+9+(X0+n[0]-mx-9)*.35,mz+3+(n[1]-mz-3)*.35);
    prop('Prop_Wagon',mx+3,0,mz+1.6,.3,.55,{col:1.2});prop('Pickaxe_Bronze',mx-4,.1,mz+3,0,1.4);prop('Bucket_Metal',mx-5,0,mz-4,0,1.4);prop('Rope_2',mx+6,0,mz-5,0,1.4);
    const vm=new T.MeshStandardMaterial({color:0x6a6058,roughness:.9,flatShading:true}),gold=new T.MeshStandardMaterial({color:0xe0b04a,emissive:0x6a4a10,emissiveIntensity:.9,metalness:.7,roughness:.35}),iron=new T.MeshStandardMaterial({color:0xb87a5a,emissive:0x3a1a0a,emissiveIntensity:.6,metalness:.6,roughness:.4});
    for(let i=0;i<7;i++){const a=i/7*6.283+.3,r=GTN.C1[2]-1.6,x=mx+Math.cos(a)*r,z=mz+Math.sin(a)*r,isG=i%3===0,g=new T.Group();g.position.set(x,0,z);
      const rk=mesh(new T.DodecahedronGeometry(1.1,0),vm,0,.8,0);rk.scale.set(1,1.3,1);g.add(rk);for(let k=0;k<9;k++){const o=mesh(new T.OctahedronGeometry(.13,0),isG?gold:iron,rnd(-.7,.7),rnd(.3,1.6),rnd(-.7,.7));g.add(o)}scene.add(g);addCircle(x,z,1);
      CV.veins.push({x,z,gold:isG,t:-999,g})}}
  /* ---------- C2: giant glowing mushrooms ---------- */
  {const [cx,cz]=W('C2',0,0);for(let i=0;i<16;i++){const a=rnd(6.28),r=rnd(3,9),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,s=rnd(2.2,5),glow=i%2?0x2a7aff:0xb04aff;
    if(!prop(i%3?'Mushroom_Common':'Mushroom_Laetiporus',x,0,z,rnd(6),s,{glow,gi:.32,tint:0x9a8aa0,col:.35*s/3})){scene.add(mesh(new T.CylinderGeometry(.2*s/3,.3*s/3,1.6*s/3,7),mm(0xd9d0b8),x,.8*s/3,z));scene.add(mesh(new T.SphereGeometry(.95*s/3,10,6,0,6.283,0,1.6),new T.MeshStandardMaterial({color:glow,emissive:glow,emissiveIntensity:.8}),x,1.6*s/3,z))}}
    CV.glow.push({x:cx,z:cz,c:0x6a7aff})}
  /* ---------- C3: an underground lake with glowing anglerfish ---------- */
  {const [lx,lz]=W('C3',0,-1),R=5.6;const water=new T.Mesh(new T.CircleGeometry(R,40),new T.MeshStandardMaterial({color:0x0a3a40,emissive:0x0a5a6a,emissiveIntensity:.5,roughness:.08,metalness:.4,transparent:true,opacity:.86}));water.rotation.x=-Math.PI/2;water.position.set(lx,.06,lz);scene.add(water);
    const rim=new T.Mesh(new T.RingGeometry(R,R+.6,40),new T.MeshStandardMaterial({color:0x4a4038,roughness:1}));rim.rotation.x=-Math.PI/2;rim.position.set(lx,.07,lz);scene.add(rim);addCircle(lx,lz,R-.4);
    CV.lake={x:lx,z:lz,r:R,t:-999};CV.fish=[];
    if(window.EX&&EX.fishMesh)for(let i=0;i<4;i++){const g=new T.Group(),f=EX.fishMesh(i<2?'anglerfish':'pufferfish_inflated',i<2?.7:.45,true);if(!f)break;g.add(f);if(i<2){const lure=mesh(new T.SphereGeometry(.06,8,6),new T.MeshBasicMaterial({color:0xfff4a0}),0,.33,.38,false);g.add(lure)}g.userData.dyn=true;scene.add(g);CV.fish.push({g,a:rnd(6.28),r:rnd(1.5,R-1.2),sp:rnd(.3,.6)*(i%2?1:-1)})}
    CV.glow.push({x:lx,z:lz,c:0x3affd8})}
  /* ---------- T: the spider nest ---------- */
  {const [sx,sz]=W('T',0,0),wm=new T.MeshBasicMaterial({map:webT(),transparent:true,alphaTest:.15,side:T.DoubleSide,depthWrite:false,opacity:.75});
    for(let i=0;i<14;i++){const a=rnd(6.28),r=rnd(3,8.5),x=sx+Math.cos(a)*r,z=sz+Math.sin(a)*r,s=rnd(2,4.5),w=new T.Mesh(new T.PlaneGeometry(s,s),wm);w.position.set(x,rnd(2,5.5),z);w.rotation.set(rnd(-.4,.4),rnd(6),rnd(6));scene.add(w)}
    const egg=new T.MeshStandardMaterial({color:0xe8e2d0,roughness:.6,emissive:0x2a2a1a});for(let i=0;i<10;i++){const a=rnd(6.28),r=rnd(2,7),e=mesh(new T.SphereGeometry(rnd(.3,.6),10,8),egg,sx+Math.cos(a)*r,.4,sz+Math.sin(a)*r);e.scale.y=1.3;scene.add(e)}
    for(let i=0;i<4;i++){const a=rnd(6.28),r=rnd(3,7),c=mesh(new T.CylinderGeometry(.35,.35,1.6,8),egg,sx+Math.cos(a)*r,3.6,sz+Math.sin(a)*r);c.rotation.z=rnd(-.3,.3);scene.add(c)}}
  /* ---------- K: the warlord's hall ---------- */
  {const [tx,tz]=W('K',0,-17);scene.add(mapBox(6,.7,4,MAT.stone,tx,.35,tz));scene.add(mapBox(1.8,.5,1.6,wood,tx,.95,tz+.2));scene.add(mapBox(2.2,3.2,.4,wood,tx,2.2,tz-.55));
    for(const s of[-1,1]){scene.add(mapBox(.3,3.8,.3,wood,tx+s*1.15,1.9,tz-.55));prop('Banner_1',tx+s*4,0,tz-1,s*.2,1.6);const sk=mesh(new T.SphereGeometry(.22,8,6),mm(0xe8e0c8),tx+s*1.15,3.95,tz-.55);scene.add(sk)}
    addBox(tx-3,tz-2,tx+3,tz+2,{});
    for(let i=0;i<10;i++){const a=rnd(Math.PI)+Math.PI,r=rnd(3,8);prop(pick(['Coin_Pile','Coin_Pile_2','Coin_Pile_2','Chalice','Crate_Metal']),tx+Math.cos(a)*r*.9,0,tz+3+Math.sin(a)*r*.5,rnd(6),rnd(1.3,2))}
    const gold=new T.MeshStandardMaterial({color:0xe0b04a,metalness:.6,roughness:.4,emissive:0x3a2a08});for(let i=0;i<30;i++){const a=rnd(6.28),r=rnd(2.2,6),c=mesh(new T.CylinderGeometry(.22,.22,.06,8),gold,tx+Math.cos(a)*r,.05+Math.random()*.1,tz+3+Math.sin(a)*r*.5);scene.add(c)}
    const [kx,kz]=W('K',0,0);fire(kx-8,kz-4);fire(kx+8,kz-4);fire(kx,kz+8);
    prop('Chain_Coil',kx-12,0,kz+4,0,1.6);prop('Chain_Coil',kx+11,0,kz+6,1,1.6);prop('Dummy',kx+14,0,kz+1,-1.4,1.3)}
  };
/* surface entrances: the old builder made these at the end; it is no longer called, so the entrance maker lives here */
(function defineMk(){const X0=GT.X0,wood=()=>MAT.wood;
  GT.mk=function(id,x,z,nm,node,toward){const [fx,fz]=freeSpot(x,z,3.2),y=groundH(fx,fz);
    const hole=mesh(new T.CircleGeometry(2.4,16),new T.MeshBasicMaterial({color:0x020202}),fx,y+.07,fz,false);hole.rotation.x=-Math.PI/2;scene.add(hole);
    for(let i=0;i<10;i++){const a=i/10*6.283,rx=fx+Math.cos(a)*3.5,rz=fz+Math.sin(a)*3.5,s=.9+hash2(i,id.length)*.9,m=mesh(new T.DodecahedronGeometry(s,0),MAT.rock,rx,y+s*.4,rz);m.rotation.set(rnd(3),rnd(3),rnd(3));scene.add(m);addCircle(rx,rz,s*.8)}
    for(const s of[-1,1]){scene.add(mapBox(.3,2.6,.3,wood(),fx+s*2.6,y+1.3,fz-2.6))}scene.add(mapBox(5.6,.3,.3,wood(),fx,y+2.7,fz-2.6));
    const sign=mapBox(2,.6,.12,wood(),fx,y+2.2,fz-2.45);scene.add(sign);lamp(fx-3,y+2.4,fz-3,true);lamp(fx+3,y+2.4,fz-3,true);
    const n=GTN[node],sx=X0+n[0],sz=n[1],t=GTN[toward],dx=X0+t[0]-sx,dz=t[1]-sz,l=Math.hypot(dx,dz);
    addInter(fx,fz,4.2,'Daal af in de goblintunnels ('+nm+')',()=>{PL.x=sx+dx/l*3;PL.z=sz+dz/l*3;PL.y=0;PL.vy=0;PL.yaw=Math.atan2(dx,dz);addLog('Je klimt een donker, vochtig gat in. Ergens piepen goblins...','#9ccf5a');sfx('drip')});
    INTER.push({x:sx,z:sz,r:3.6,cave:true,txt:'Klim omhoog naar het daglicht',fn:()=>{PL.x=fx;PL.z=fz+4;PL.y=groundH(PL.x,PL.z);PL.vy=0;PL.yaw=0;addLog('Daglicht!')}});
    const ring=mesh(new T.RingGeometry(1.2,1.8,18),new T.MeshBasicMaterial({color:0xffd68a,side:T.DoubleSide}),sx,2.2,sz,false);scene.add(ring);
    GT.ents.push({id,x:fx,z:fz,nm});SPOTS['gt_'+id]=[fx,fz]}})();

/* ================= populate ================= */
Object.assign(MON,{
  goblinshaman:{n:'Goblinsjamaan',hp:70,dmg:13,speed:4.4,aggro:26,range:2,xp:45,loot:'goblinshaman',rad:.45,hh:1.7,ranged:true},
  goblinking:Object.assign(MON.goblinking||{},{n:'Krijgsheer Grukk',hp:1100,dmg:34,speed:4.6,aggro:30,range:3.2,xp:900,loot:'goblinking',rad:1,hh:3,boss:'grukk',respawn:2400})});
LOOTX.goblinshaman=()=>({gold:Math.floor(rnd(10,40)),items:[['goblin_ear',1]].concat(Math.random()<.35?[['crystal',1]]:[]).concat(Math.random()<.2?[['potion',1]]:[])});
const _pgt0=populateGoblinTunnels;
populateGoblinTunnels=function(){_pgt0();
  const X0=GT.X0,sp=(k,type,n,rr,o={})=>{const c=GTN[k],out=[];for(let i=0;i<n;i++){const a=i/n*6.283+rnd(.5),r=rnd(2,rr||c[2]-3);out.push(spawnMonster(type,X0+c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,{cave:true,...o}))}return out};
  sp('HUB','goblinshaman',2,8);sp('K','goblinshaman',2,12);sp('C2','goblinshaman',1,6);
  sp('T','spider',3,7);sp('C1','goblinbrute',1,6);
  /* goblins at rest: dancing round the fire, talking, crouching */
  for(const a of actors){if(!a.cave||a.kind!=='enemy'||!a.h||a.x>-6000||a.x<-8000)continue;if(a.type==='goblin'){a.h.idleClip=pick(['Crouch_Idle_Loop','Idle_Talking_Loop','Dance_Loop','Idle_No_Loop','Crouch_Idle_Loop'])}}
  makeChest(X0+GTN.C1[0]+6,GTN.C1[1]-7,'goblinmine',2.2,'Mijnwerkerskist');makeChest(X0+GTN.C3[0]+7,GTN.C3[1]+3,'goblin',-.6,'Natte kist');
  for(let i=0;i<6;i++){const c=GTN.T,a=rnd(6.28),r=rnd(2,7);makePickup(X0+c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,'spider_silk',1)}
  /* interactions: mining, fishing in the dark lake, freeing prisoners */
  for(const v of CV.veins)INTER.push({x:v.x,z:v.z,r:2.4,cave:true,txt:()=>PL.t-v.t<150?'Deze ader is leeg':'Hak '+(v.gold?'goudader':'ijzererts')+' (F)',fn:()=>mineVein(v)});
  if(CV.lake){const k=CV.lake;INTER.push({x:k.x,z:k.z+k.r+.6,r:2.6,cave:true,txt:()=>PL.t-k.t<90?'De gloeivissen verstoppen zich':'Grijp een gloeivis uit het water',fn:()=>{if(PL.t-k.t<90)return;k.t=PL.t;if(Math.random()<.6){giveItem('glowfish',1);giveXp(12);addLog('Je vangt een gloeiende vis!','#6affd8')}else{giveItem('fish',1);addLog('Je vangt een bleke grotvis.')}sfx('splash')}})}
  for(const c of CV.cages)INTER.push({x:c.x,z:c.z,r:2.6,cave:true,txt:()=>c.open?'':'Bevrijd '+c.who,fn:()=>freePrisoner(c)});
  RUMORS.push({t:'Onder de grond houden de goblins gevangenen in kooien. Wie ze bevrijdt, krijgt vast een beloning.'},{t:'De goblins hebben een krijgsheer, een reusachtige groene ork met twee bijlen. Hij heet Grukk.'},{t:'In de goblintunnels is een mijn. Met een beetje kracht hak je er ijzer en goud uit.'})};
function mineVein(v){if(PL.t-v.t<150){addLog('Deze ader is leeg. Kom later terug.');return}v.t=PL.t;try{swingAnim()}catch(e){}sfx('hit');
  setTimeout(()=>{if(v.gold){PL.gold+=Math.floor(rnd(25,70));addLog('Je hakt goudklompen uit de rots!','#e0b04a');sfx('coin');if(Math.random()<.3)giveItem('gem',1)}else{giveItem('iron',Math.floor(rnd(1,3.9)));if(Math.random()<.12)giveItem('gem',1)}giveXp(6);
    v.g.children.slice(1).forEach(o=>o.visible=false);setTimeout(()=>v.g.children.forEach(o=>o.visible=true),150000)},350)}
function freePrisoner(c){if(c.open)return;const near=actors.some(a=>!a.dead&&a.kind==='enemy'&&a.cave&&Math.hypot(a.x-c.x,a.z-c.z)<12);if(near){addLog('Er staan goblins te dichtbij. Versla ze eerst!','#e5766a');return}
  c.open=true;sfx('quest');if(c.g)c.g.rotation.z=.5,c.g.position.y=-.3;giveXp(80);giveRep(8,'gevangene bevrijd');const g=c.who.startsWith('Ridder');
  addLog(c.who+': "Dank je, redder! Neem dit, ik heb het verstopt voor de goblins."','#9cc552');
  dropLoot(c.x+1.5,c.z,{gold:g?220:90,items:g?[['shield_iron',1],['potion',2]]:[['elixir',1],['bread',3]]})}
Object.assign(CHEST_LOOT,{goblinmine:{gold:180,items:[['iron',6],['gem',2],['potion',2]]},
  goblinking:{gold:1400,items:[['gem',6],['elixir',3],['sword_elven',1],['ring_gold',1],['amu_wind',1],['axe_grukk',1]]}});
Object.assign(ITEMS,{axe_grukk:{n:'Bijl van Grukk',g:'weapon',kind:'axe',dmg:52,spd:.62,rng:2.8,price:1600,ico:'⛏',col:0x7a9a6a,rar:'l'}});
LOOTX.goblinking=()=>({gold:Math.floor(rnd(500,800)),items:[['goblin_ear',4],['gem',4],['elixir',1]].concat(Math.random()<.5?[['axe_grukk',1]]:[['ring_power',1]])});

/* ---------- Grukk: phases, roars and reinforcements ---------- */
const _ueG=updateEnemy;updateEnemy=function(a,dt){_ueG(a,dt);if(a.type!=='goblinking'||a.dead)return;
  if(a.hp>=a.hpMax){a.ph2=a.ph3=false}
  if(!a.ph2&&a.hp<a.hpMax*.55){a.ph2=true;if(a.model)a.model.roarT=1.6;addLog('Grukk brult: "Goblins! Bescherm je krijgsheer!"','#e5766a');sfx('thunder');for(let i=0;i<4;i++){const an=i/4*6.283;spawnMonster(i%2?'goblin':'goblinbrute',a.x+Math.cos(an)*6,a.z+Math.sin(an)*6,{cave:true,temp:true,respawn:1e9})}}
  if(!a.ph3&&a.hp<a.hpMax*.25){a.ph3=true;a.speed*=1.35;a.dmg*=1.25;if(a.model)a.model.roarT=1.6;addLog('Grukk is woedend!','#e5766a');sfx('thunder')}};

/* ---------- goblin shamans throw green fire ---------- */
const _sarC=shootArrow;
shootArrow=function(x,y,z,tx,ty,tz,owner,dmg,speed,by){_sarC(x,y,z,tx,ty,tz,owner,dmg,by&&by.type==='goblinshaman'?26:speed,by);if(!by||by.type!=='goblinshaman')return;const ar=arrows[arrows.length-1];scene.remove(ar.m);
  ar.m=new T.Mesh(new T.SphereGeometry(.28,10,8),new T.MeshBasicMaterial({color:0x7aff4a}));ar.m.add(new T.Mesh(new T.SphereGeometry(.5,10,8),new T.MeshBasicMaterial({color:0x2aff6a,transparent:true,opacity:.35,depthWrite:false})));ar.m.position.copy(ar.p);scene.add(ar.m);ar.v.y-=4;
  if(by.h){by.h.atk=by.h.atkT=.5;by.h.atkKind='slash'}};

/* ---------- per frame: cauldron bubbles, cave lights near crystals, lake fish ---------- */
let cvT=0;
ANIMS.push(dt=>{if(!GT.built)return;const inGT=PL.inCave&&PL.x<-6000&&PL.x>-8000;
  if(!CV.lights.length){for(let i=0;i<2;i++){const l=new T.PointLight(0x6affd8,0,22,1.6);scene.add(l);CV.lights.push(l)}}
  cvT-=dt;if(cvT<=0){cvT=.4;const g=inGT?CV.glow.map(q=>[Math.hypot(q.x-PL.x,q.z-PL.z),q]).sort((a,b)=>a[0]-b[0]):[];CV.lights.forEach((l,i)=>{const e=g[i];if(!e||e[0]>30){l.userData.t=0;return}l.position.set(e[1].x,2.4,e[1].z);l.color.setHex(e[1].c);l.userData.t=1.6})}
  for(const l of CV.lights)l.intensity+=((l.userData.t||0)-l.intensity)*Math.min(1,dt*3);
  if(!inGT)return;
  if(window.PW&&PW.ps)for(const b of CV.bub){if(Math.random()<dt*14)pwEm(PW.ps,b.x+rnd(-.4,.4),b.y,b.z+rnd(-.4,.4),0,rnd(.4,1),0,rnd(.6,1.2),.2,.05,[.5,1,.4],[.1,.6,.1],.8,-.2,.5)}
  if(CV.lake&&CV.fish)for(const f of CV.fish){f.a+=f.sp*dt;const x=CV.lake.x+Math.cos(f.a)*f.r,z=CV.lake.z+Math.sin(f.a)*f.r;f.g.position.set(x,-.25+Math.sin(f.a*3)*.08,z);f.g.rotation.y=Math.atan2(-Math.sin(f.a)*Math.sign(f.sp),Math.cos(f.a)*Math.sign(f.sp))}
  if(Math.random()<dt*.15)sfx('drip')});

/* ---------- caves are dark: no sunlight under the ground (applies to every cave except the Demon Realm) ---------- */
const _ueC=updateEnv;updateEnv=function(dt,pp){_ueC(dt,pp);if(!pp||!pp.inCave||pp.x<-9000)return;
  sun.intensity=.05;sun.color.setHex(0xffb070);moon.intensity=0;hemi.intensity=.34;hemi.color.setHex(0xa08060);if(hemi.groundColor)hemi.groundColor.setHex(0x2a1a10);
  scene.fog.color.setHex(0x0d0a07);scene.fog.density=.026;if(scene.background&&scene.background.setHex)scene.background.setHex(0x0d0a07);
  skyMat.uniforms.top.value.setHex(0x0d0a07);skyMat.uniforms.hor.value.setHex(0x0d0a07);stars.material.opacity=0;for(const c of clouds)c.material.opacity=0};
/* the camera stays close in narrow tunnels instead of ending up inside the rock */
const _ucCv=updateCamera;updateCamera=function(dt){const d0=PL.camDist;if(PL.inCave&&PL.x>-9000)PL.camDist=Math.min(d0,3.6);try{_ucCv(dt)}finally{PL.camDist=d0}};
/* ---------- a minimap inside the goblin tunnels ---------- */
const _dmC=drawMini;
drawMini=function(){_dmC();if(!PL.inCave||!GT.built||PL.x>-6000||PL.x<-8000)return;const c=$('mini'),g=c.getContext('2d'),S=c.width||150,k=S/120;
  g.fillStyle='#14110c';g.fillRect(0,0,S,S);g.save();g.translate(S/2,S/2);g.strokeStyle='#5a4a36';g.lineCap='round';
  for(const cp of GT.caps){g.lineWidth=Math.max(2,cp.hw*2*k);g.beginPath();g.moveTo((cp.ax-PL.x)*k,(cp.az-PL.z)*k);g.lineTo((cp.bx-PL.x)*k,(cp.bz-PL.z)*k);g.stroke()}
  for(const a of actors){if(a.dead||a.kind!=='enemy'||!a.cave)continue;const dx=(a.x-PL.x)*k,dz=(a.z-PL.z)*k;if(Math.abs(dx)<S/2&&Math.abs(dz)<S/2){g.fillStyle=a.boss||a.type==='goblinking'?'#ff3a2a':'#c9a24a';g.fillRect(dx-1.5,dz-1.5,3,3)}}
  for(const ch of chests){if(ch.open||ch.x>-6000||ch.x<-8000)continue;const dx=(ch.x-PL.x)*k,dz=(ch.z-PL.z)*k;if(Math.abs(dx)<S/2&&Math.abs(dz)<S/2){g.fillStyle='#ffd24a';g.fillRect(dx-2,dz-2,4,4)}}
  for(const cg of CV.cages){if(cg.open)continue;const dx=(cg.x-PL.x)*k,dz=(cg.z-PL.z)*k;if(Math.abs(dx)<S/2&&Math.abs(dz)<S/2){g.strokeStyle='#7fd0ff';g.lineWidth=1.5;g.strokeRect(dx-3,dz-3,6,6)}}
  g.restore();g.fillStyle='#fff';g.beginPath();g.moveTo(S/2+Math.sin(PL.yaw)*6,S/2+Math.cos(PL.yaw)*6);g.lineTo(S/2+Math.sin(PL.yaw+2.5)*4,S/2+Math.cos(PL.yaw+2.5)*4);g.lineTo(S/2+Math.sin(PL.yaw-2.5)*4,S/2+Math.cos(PL.yaw-2.5)*4);g.fill();
  g.font='bold 11px sans-serif';g.textAlign='center';g.fillStyle='#e8d8b0';g.fillText('Goblintunnels',S/2,13)};

/* ================= a health bar for every boss ================= */
const BB={el:null,cur:null};
function bossBar(){if(!BB.el){const d=document.createElement('div');d.id='bossbar';d.innerHTML='<div class="t"></div><div class="b"><i></i></div>';document.body.appendChild(d);BB.el=d;
    const st=document.createElement('style');st.textContent='#bossbar{position:fixed;top:calc(64px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);width:min(520px,70vw);z-index:6;text-align:center;font-family:var(--f-display);color:#f3d9b0;text-shadow:0 2px 4px #000;pointer-events:none;opacity:0;transition:opacity .4s}#bossbar .t{font-size:19px;letter-spacing:.05em}#bossbar .b{height:14px;border:2px solid #5a4a2a;background:#140e08;border-radius:8px;overflow:hidden;margin-top:4px;box-shadow:0 0 12px rgba(0,0,0,.6)}#bossbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#6a1010,#e04a2a);transition:width .25s}';document.head.appendChild(st)}return BB.el}
setInterval(()=>{if(typeof started==='undefined'||!started)return;let best=null,bd=55;for(const a of actors){if(a.dead||a.kind!=='enemy'||!(a.boss||a.type==='goblinking')||a.type==='fourhands')continue;if(!!a.cave!==!!PL.inCave)continue;const d=Math.hypot(a.x-PL.x,a.z-PL.z);if(d<bd&&(a.state==='chase'||a.hp<a.hpMax)){bd=d;best=a}}
  const el=bossBar(),gb=document.getElementById('gbar'),giant=gb&&gb.style.opacity!=='0'&&gb.style.opacity!=='';
  if(!best||giant||PL.dead){el.style.opacity=0;return}el.style.opacity=1;el.querySelector('.t').textContent='☠ '+best.name;el.querySelector('i').style.width=Math.max(0,best.hp/best.hpMax*100)+'%'},250);

/* ================= loot: mythic treasure of the four-handed giant, lesser treasure of the lava turtles ================= */
{const st=document.createElement('style');st.textContent='.rar-m{color:#ff6a3a!important;text-shadow:0 0 6px rgba(255,120,40,.75);animation:rarm 2.4s ease-in-out infinite}@keyframes rarm{0%,100%{color:#ff6a3a}50%{color:#ffd24a}}';document.head.appendChild(st)}
Object.assign(ITEMS,{
  /* mythic (rar m): only the Reuzen-Vierhand drops these */
  blade_fourhands:{n:'Vierhand-vuurzwaard',g:'weapon',kind:'sword',dmg:105,spd:.4,rng:3.3,price:9000,ico:'⚔',col:0xff6a2a,rar:'m'},
  axe_fourhands:{n:'Magmasplijter',g:'weapon',kind:'axe',dmg:125,spd:.6,rng:3.1,price:9500,ico:'⛏',col:0xff3a1a,rar:'m'},
  armor_fourhands:{n:'Lavapantser van de Vierhand',g:'armor',def:34,tunic:0x7a1a10,pants:0x2a0a08,armor:1,fx:{hp:90,regen:2.5,dmg:.15},price:12000,ico:'▣',rar:'m'},
  helm_fourhands:{n:'Kroon van Vier Handen',g:'head',def:14,fx:{dmg:.22,xp:.25},hat:'dragonhelm',price:8000,ico:'♔',rar:'m'},
  amu_fourhands:{n:'Hart van de Vierhand',g:'amulet',fx:{hp:140,regen:3.5},col:0xff5a1a,price:10000,ico:'◈',rar:'m'},
  ring_fourhands:{n:'Ring der Vier Handen',g:'ring',fx:{dmg:.32,spd:.15},price:9000,ico:'○',rar:'m'},
  boots_fourhands:{n:'Magmalopers',g:'boots',def:7,fx:{spd:.65,jump:.55},price:7000,ico:'▾',col:0xff6a1a,glow:0xff3a0a,rar:'m'},
  cloak_fourhands:{n:'Vlammenmantel',g:'cloak',def:9,fx:{hp:60,stam:80,spd:.1},col:0xc0200a,price:7500,ico:'❖',rar:'m'},
  shield_fourhands:{n:'Schild van de Vierhand',g:'shield',kind:'shield',def:.95,col:0x9a1a0a,round:1,price:8500,ico:'◔',rar:'m'},
  /* the turtles: good, but nowhere near the giant */
  lava_scale:{n:'Lavaschub',g:'mat',price:110,ico:'◆'},
  shield_turtle:{n:'Schildpadschild',g:'shield',kind:'shield',def:.82,col:0x6a3a1a,round:1,price:950,ico:'◔',rar:'e'},
  ring_ember:{n:'Gloeiring',g:'ring',fx:{dmg:.1,hp:20},price:520,ico:'○',rar:'r'},
  boots_turtle:{n:'Schildpadlaarzen',g:'boots',def:4,fx:{hp:20},price:420,ico:'▾',col:0x6a4a2a,rar:'r'}});
LOOTX.fourhands=()=>{const extra=['helm_fourhands','ring_fourhands','boots_fourhands','cloak_fourhands','shield_fourhands','axe_fourhands'].sort(()=>Math.random()-.5).slice(0,3);
  return{gold:Math.floor(rnd(2500,4000)),items:[['blade_fourhands',1],['armor_fourhands',1],['amu_fourhands',1],...extra.map(i=>[i,1]),['elixir',5],['gem',12],['lava_core',2],['relic',2]]}};
LOOTX.lavaturtle=()=>{const L={gold:Math.floor(rnd(80,170)),items:[['lava_scale',Math.floor(rnd(1,2.9))],['gem',Math.floor(rnd(1,2.9))]]};const r=Math.random();
  if(r<.12)L.items.push(['shield_turtle',1]);else if(r<.24)L.items.push(['ring_ember',1]);else if(r<.36)L.items.push(['boots_turtle',1]);if(Math.random()<.05)L.items.push(['lava_core',1]);return L};
/* the giant's sword burns what it hits; the magma axe sets the ground alight */
const _haF=hitActor;hitActor=function(a,dmg,byPlayer,dir){_haF(a,dmg,byPlayer,dir);const w=PL.eq&&PL.eq.weapon;if(!byPlayer||!a||(w!=='blade_fourhands'&&w!=='axe_fourhands'))return;
  try{if(!a.dead)pwStatus(a,'burn',3,8+PL.lvl);if(window.PW&&PW.ps)pwBurst(PW.ps,a.x,a.y+1.2,a.z,22,3,.5,.6,.1,PC.fire[0],PC.fire[2],1.5,2,1,1.4)}catch(e){}};
/* the lava world gets a boss fanfare when the giant falls */
const _kaF=killActor;killActor=function(a,byPlayer){const was=a.dead;_kaF(a,byPlayer);if(!was&&a.type==='fourhands'){addLog('De Reuzen-Vierhand stort neer! Mythische schatten liggen voor het oprapen.','#ff8a3a');try{sfx('level');pwFlash&&pwFlash('#ff7a2a',.7,1.4)}catch(e){}}};
})();
