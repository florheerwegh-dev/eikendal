/* ================= Giant skeletons =================
   Half-buried skeletons of great beasts instead of plain white rings: a spine of vertebrae with spikes, curved ribs
   that taper and sink into the ground, a skull with eye sockets, teeth and horns, a loose jaw, leg and claw bones,
   wing fingers for a dragon. Weathered bone with cracks and moss. Used beside the dragon's nest (a fallen rival
   of Vyrnax) and at the Reuzenribben. All bones are merged into one mesh. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,_v=new T.Vector3();
let BM=null,DM=null;
function mats(){if(BM)return;const t=canvasTex(256,256,(c,w,h)=>{c.fillStyle='#ddd2b8';c.fillRect(0,0,w,h);
  for(let i=0;i<1400;i++){c.fillStyle=Math.random()<.5?`rgba(120,100,70,${.05+Math.random()*.12})`:`rgba(250,244,228,${.05+Math.random()*.12})`;c.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*7,1+Math.random()*3)}
  c.strokeStyle='rgba(80,64,40,.45)';c.lineWidth=1;for(let i=0;i<40;i++){let x=Math.random()*w,y=Math.random()*h;c.beginPath();c.moveTo(x,y);for(let k=0;k<6;k++){x+=rr(10);y+=rr(10);c.lineTo(x,y)}c.stroke()}
  for(let i=0;i<30;i++){c.fillStyle=`rgba(80,100,50,${.1+Math.random()*.2})`;c.beginPath();c.arc(Math.random()*w,Math.random()*h,4+Math.random()*12,0,6.283);c.fill()}},2,2);
  BM=new T.MeshStandardMaterial({map:t,roughness:.72,metalness:0});DM=new T.MeshStandardMaterial({color:0x140f0a,roughness:1})}
function taper(pts,r0,r1,seg=14,rad=7){const c=new T.CatmullRomCurve3(pts),g=new T.TubeGeometry(c,seg,1,rad,false),p=g.attributes.position;
  for(let j=0;j<=seg;j++){const t=j/seg,ctr=c.getPointAt(t),r=r0+(r1-r0)*t;for(let k=0;k<=rad;k++){const i=j*(rad+1)+k;_v.fromBufferAttribute(p,i).sub(ctr).multiplyScalar(r).add(ctr);p.setXYZ(i,_v.x,_v.y,_v.z)}}g.computeVertexNormals();return g}
const strip=g=>{const n=g.index?g:g;for(const k of Object.keys(n.attributes))if(!['position','normal','uv'].includes(k))n.deleteAttribute(k);return n.index?n:n};
const place=(g,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{const m=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));g.applyMatrix4(m);return g};
/* build a skeleton lying along +x (head at +x); s = size, wings for a dragon, tusks for a beast */
function skeleton(x,z,s,rot,o={}){mats();const bones=[],dark=[];
  const spine=[];const L=o.len||14;for(let i=0;i<=40;i++){const t=i/40,xx=(t-.62)*L*s,yy=(1.05+Math.sin(t*Math.PI)*.45-(t<.25?(.25-t)*2.2:0))*s,zz=Math.sin(t*5)*.6*s;spine.push(new T.Vector3(xx,yy,zz))}
  const sc=new T.CatmullRomCurve3(spine);
  /* vertebrae with spikes */
  const nV=Math.round(L*1.15);for(let i=0;i<nV;i++){const t=i/(nV-1),p=sc.getPointAt(t),tg=sc.getTangentAt(t),k=t<.3?.45+t*1.8:1-(t-.3)*.35,ry=-Math.atan2(tg.z,tg.x);
    bones.push(place(new T.CylinderGeometry(.32*s*k,.32*s*k,.55*s,8),p.x,p.y,p.z,0,ry,Math.PI/2));
    bones.push(place(new T.ConeGeometry(.16*s*k,(.6+.9*k)*s,6),p.x,p.y+(.45+.45*k)*s,p.z,0,ry,-.25));
    for(const sd of[-1,1])bones.push(place(new T.CylinderGeometry(.06*s*k,.1*s*k,.8*s*k,5),p.x+Math.sin(ry)*sd*.35*s,p.y,p.z+Math.cos(ry)*sd*.35*s,Math.PI/2*sd,ry,0))}
  /* ribs: curved, tapering, sinking into the ground */
  for(let i=0;i<9;i++){const t=.42+i*.042,p=sc.getPointAt(t),tg=sc.getTangentAt(t),ry=-Math.atan2(tg.z,tg.x),f=1-Math.abs(i-4)/7,R=(1.6+1.2*f)*s;
    for(const sd of[-1,1]){const pts=[[0,0,.3],[0,.55,.9],[-.15,.2,1.45],[-.3,-.55,1.55],[-.45,-1.3,1.2],[-.55,-1.85,.95]].map(([a,b,c])=>{const lx=a*R,ly=b*R,lz=c*R*sd;return new T.Vector3(p.x+lx*Math.cos(ry)+lz*Math.sin(ry),p.y+ly,p.z-lx*Math.sin(ry)+lz*Math.cos(ry))});
      bones.push(taper(pts,.17*s*(.7+.3*f),.05*s,16,7))}}
  /* the skull */
  {const p=sc.getPointAt(1),tg=sc.getTangentAt(1),ry=-Math.atan2(tg.z,tg.x),hx=p.x+Math.cos(-ry)*1.2*s,hz=p.z+Math.sin(-ry)*1.2*s,hy=Math.max(.7*s,p.y-.2*s);
    const S=s*(o.skull||1);bones.push(place(new T.SphereGeometry(1,14,10),hx,hy,hz,0,ry,0,1.25*S,.95*S,1.05*S));
    const sn=new T.CylinderGeometry(.42,.72,2.4,6);sn.rotateZ(Math.PI/2);bones.push(place(sn,hx+Math.cos(-ry)*1.9*S,hy-.15*S,hz+Math.sin(-ry)*1.9*S,0,ry,0,S,S*.9,S));
    for(const sd of[-1,1]){const ex=hx+Math.cos(-ry)*.55*S-Math.sin(-ry)*sd*.62*S,ez=hz+Math.sin(-ry)*.55*S+Math.cos(-ry)*sd*.62*S;dark.push(place(new T.SphereGeometry(.34,10,8),ex,hy+.25*S,ez,0,0,0,S,S,S));
      const nx=hx+Math.cos(-ry)*2.95*S-Math.sin(-ry)*sd*.18*S,nz=hz+Math.sin(-ry)*2.95*S+Math.cos(-ry)*sd*.18*S;dark.push(place(new T.SphereGeometry(.1,8,6),nx,hy+.05*S,nz,0,0,0,S,S,S));
      const hp=[[0,.5,.5],[-.9,1.2,.9],[-2,1.6,1.1],[-2.9,1.4,1.2]].map(([a,b,c])=>new T.Vector3(hx+(a*Math.cos(-ry)-c*sd*Math.sin(-ry))*S,hy+b*S,hz+(a*Math.sin(-ry)+c*sd*Math.cos(-ry))*S));
      if(o.tusks){const tp=[[2.2,-.3,.45],[2.9,-.7,.8],[3.3,-.2,1.2],[3.4,.4,1.3]].map(([a,b,c])=>new T.Vector3(hx+(a*Math.cos(-ry)-c*sd*Math.sin(-ry))*S,hy+b*S,hz+(a*Math.sin(-ry)+c*sd*Math.cos(-ry))*S));bones.push(taper(tp,.22*S,.04*S,12,7))}
      else bones.push(taper(hp,.2*S,.03*S,12,7));
      for(let k=0;k<7;k++){const tx=hx+Math.cos(-ry)*(1.1+k*.33)*S-Math.sin(-ry)*sd*.4*S,tz=hz+Math.sin(-ry)*(1.1+k*.33)*S+Math.cos(-ry)*sd*.4*S;bones.push(place(new T.ConeGeometry(.07*S,.32*S,5),tx,hy-.55*S,tz,Math.PI,0,0))}}
    /* the lower jaw lies a little open */
    const jw=new T.CylinderGeometry(.22,.4,2.6,6);jw.rotateZ(Math.PI/2);bones.push(place(jw,hx+Math.cos(-ry)*1.5*S,hy-.85*S,hz+Math.sin(-ry)*1.5*S+.3*S,.25,ry+.12,.18,S,S*.7,S))}
  /* legs and claws */
  for(const [t,sd] of[[.48,1],[.78,-1],[.3,1]]){const p=sc.getPointAt(t),ry=-Math.atan2(sc.getTangentAt(t).z,sc.getTangentAt(t).x),bx=p.x-Math.sin(ry)*sd*2*s,bz=p.z-Math.cos(ry)*sd*2*s;
    bones.push(place(new T.CylinderGeometry(.18*s,.24*s,2.6*s,8),bx,.35*s,bz,Math.PI/2*.92,ry+.5*sd,0));for(const e of[-1,1])bones.push(place(new T.SphereGeometry(.32*s,8,6),bx+Math.cos(ry+.5*sd)*e*1.3*s,.35*s,bz-Math.sin(ry+.5*sd)*e*1.3*s));
    const fx=bx+Math.cos(ry+.5*sd)*2.2*s,fz=bz-Math.sin(ry+.5*sd)*2.2*s;for(let k=0;k<3;k++)bones.push(place(new T.ConeGeometry(.1*s,.8*s,5),fx+rr(.3)*s,.15*s,fz+(k-1)*.35*s,0,0,-Math.PI/2.2))}
  /* wing fingers fanned over the ground */
  if(o.wings)for(const sd of[-1,1]){const p=sc.getPointAt(.55),ry=-Math.atan2(sc.getTangentAt(.55).z,sc.getTangentAt(.55).x);for(let k=0;k<4;k++){const a=-.6+k*.45,len=(5.5-k*.6)*s,pts=[];
    for(let j=0;j<=4;j++){const d=j/4*len,lx=-Math.sin(a)*d*.6,lz=sd*(1.5*s+Math.cos(a)*d);pts.push(new T.Vector3(p.x+lx*Math.cos(ry)+lz*Math.sin(ry),.25*s+Math.sin(j/4*Math.PI)*.8*s,p.z-lx*Math.sin(ry)+lz*Math.cos(ry)))}
    bones.push(taper(pts,.13*s,.04*s,14,6))}}
  /* a scatter of small bones */
  for(let i=0;i<14;i++){const a=Math.random()*6.283,r=(2+Math.random()*L*.5)*s;bones.push(place(new T.CylinderGeometry(.06*s,.06*s,(.5+Math.random()*.6)*s,5),Math.cos(a)*r,.08*s,Math.sin(a)*r,Math.PI/2,Math.random()*6,0))}
  const merge=l=>T.BufferGeometryUtils.mergeBufferGeometries(l.map(g=>{const n=g.index?g:g;for(const k of Object.keys(n.attributes))if(!['position','normal','uv'].includes(k))n.deleteAttribute(k);return n.index?n:T.BufferGeometryUtils.mergeVertices?n:n}));
  const G=new T.Group();G.position.set(x,groundH(x,z)-.15*s,z);G.rotation.y=rot;
  const m=new T.Mesh(merge(bones),BM);m.castShadow=true;m.receiveShadow=true;G.add(m);if(dark.length){const d=new T.Mesh(merge(dark),DM);G.add(d)}
  const soil=new T.Mesh(new T.CircleGeometry(L*.55*s,28),new T.MeshStandardMaterial({color:0x3a3024,roughness:1,transparent:true,opacity:.65,depthWrite:false}));soil.rotation.x=-Math.PI/2;soil.position.y=.17*s;soil.scale.set(1.35,1,.75);G.add(soil);
  scene.add(G);G.updateMatrixWorld(true);
  const P=sc.getPointAt(1),wp=P.clone().applyMatrix4(G.matrixWorld);addCircle(wp.x,wp.z,1.8*s);
  return G}
WD.skeleton=skeleton;

/* a fallen knight: a human skeleton sprawled on the ground, with a rusty sword, a dented helmet or a broken shield */
const RUST=new T.MeshStandardMaterial({color:0x6a4a34,roughness:.85,metalness:.35});
function humanBones(x,z,rot,o={}){mats();const b=[],r=[],y0=.12;
  const sk=new T.SphereGeometry(.12,10,8);b.push(place(sk,.86,y0+.02,.05,0,0,0,1,.9,1.1));b.push(place(new T.BoxGeometry(.12,.05,.1),.95,y0-.07,.08,0,0,.3));
  for(let i=0;i<7;i++)b.push(place(new T.CylinderGeometry(.025,.025,.06,6),.66-i*.075,y0-.04,0,0,0,Math.PI/2));
  for(let i=0;i<5;i++){const xx=.62-i*.06,w=.13-i*.006;for(const sd of[-1,1]){const pts=[[0,0,.02],[0,.06,.08],[0,.04,.14],[0,-.04,w+.02],[0,-.08,w]].map(([a,bb,c])=>new T.Vector3(xx+a,y0+bb,c*sd));b.push(taper(pts,.014,.008,8,5))}}
  b.push(place(new T.TorusGeometry(.09,.03,6,10),.2,y0-.02,0,Math.PI/2,0,0,1,1.3,1));
  const lim=(ax,az,len,ang)=>{b.push(place(new T.CylinderGeometry(.022,.026,len,6),ax+Math.cos(ang)*len/2,y0-.06,az+Math.sin(ang)*len/2,Math.PI/2,-ang+Math.PI/2,0));b.push(place(new T.SphereGeometry(.035,6,5),ax+Math.cos(ang)*len,y0-.06,az+Math.sin(ang)*len))};
  const sp=o.sprawl||0;lim(.6,.16,.3,.5+sp);lim(.6+Math.cos(.5+sp)*.3,.16+Math.sin(.5+sp)*.3,.26,.2+sp);lim(.6,-.16,.3,-.9-sp);lim(.6+Math.cos(-.9-sp)*.3,-.16+Math.sin(-.9-sp)*.3,.26,-.4);
  lim(.15,.07,.44,Math.PI+.15);lim(-.29,.13,.4,Math.PI+.05);lim(.15,-.07,.44,Math.PI-.3+sp*.5);lim(-.27,-.2,.4,Math.PI-.2);
  if(o.sword!==false){b;r.push(place(new T.BoxGeometry(.9,.012,.06),.5+Math.random()*.3,.04,.45+Math.random()*.2,0,Math.random()*.6,0));r.push(place(new T.BoxGeometry(.04,.03,.22),.05+Math.random()*.3,.05,.45,0,0,0))}
  if(o.helmet)r.push(place(new T.SphereGeometry(.15,10,8,0,6.283,0,1.6),1.15,.06,-.25,1.2,0,.4));
  if(o.shield)r.push(place(new T.CylinderGeometry(.36,.36,.04,14),-.1,.04,-.55,.15,0,.1));
  const G=new T.Group();G.position.set(x,groundH(x,z),z);G.rotation.y=rot;G.scale.setScalar(1.7);
  const merge=l=>T.BufferGeometryUtils.mergeBufferGeometries(l.map(g=>{for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);return g}));
  const m=new T.Mesh(merge(b),BM);m.castShadow=true;G.add(m);if(r.length)G.add(new T.Mesh(merge(r),RUST));scene.add(G);return G}
WD.humanBones=humanBones;
/* a burnt tree: a charred trunk with broken branches and glowing embers in the cracks */
const CHAR=new T.MeshStandardMaterial({color:0x17120e,roughness:1}),EMB=new T.MeshBasicMaterial({color:0xff6a1a});const SMOKE=[];
function burntTree(x,z,s){const y=groundH(x,z),G=new T.Group();G.position.set(x,y,z);G.rotation.y=Math.random()*6;const parts=[],emb=[];
  const h=(4+Math.random()*3)*s;parts.push(place(new T.CylinderGeometry(.16*s,.42*s,h,7),0,h/2,0,rr(.08),0,rr(.08)));
  for(let i=0;i<4;i++){const a=Math.random()*6.283,by=h*(.45+Math.random()*.45),len=(1+Math.random()*1.6)*s;parts.push(place(new T.CylinderGeometry(.04*s,.1*s,len,5),Math.cos(a)*len*.35,by+len*.3,Math.sin(a)*len*.35,Math.cos(a)*.9,0,-Math.sin(a)*.9))}
  for(let i=0;i<5;i++)emb.push(place(new T.BoxGeometry(.05*s,(.2+Math.random()*.4)*s,.03*s),rr(.25*s),.3*s+Math.random()*h*.5,rr(.25*s)));
  const merge=l=>T.BufferGeometryUtils.mergeBufferGeometries(l.map(g=>{for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);return g}));
  const m=new T.Mesh(merge(parts),CHAR);m.castShadow=true;G.add(m);G.add(new T.Mesh(merge(emb),EMB));scene.add(G);addCircle(x,z,.5*s);SMOKE.push({x,z,y:y+h*.8});
  const sc=new T.Mesh(new T.CircleGeometry(2.6*s,16),new T.MeshBasicMaterial({color:0x0e0b08,transparent:true,opacity:.55,depthWrite:false}));sc.rotation.x=-Math.PI/2;sc.position.set(x,y+.05,z);scene.add(sc)}
ANIMS.push(dt=>{if(!window.PW||!PW.ps)return;for(const S of SMOKE){if(Math.abs(S.x-PL.x)>90||Math.abs(S.z-PL.z)>90)continue;if(Math.random()<dt*1.2)pwEm(PW.ps,S.x+rr(.4),S.y,S.z+rr(.4),rr(.2),.8+Math.random()*.6,rr(.2),3,.5,1.4,[.25,.23,.22],[.08,.08,.08],.45,-.05,.3)}});

/* replace the plain rings with real skeletons */
function remove(test){const kill=[];for(const o of scene.children)if(o.isMesh&&o.geometry&&test(o))kill.push(o);for(const o of kill)scene.remove(o);return kill.length}
function build(){
  /* beside the dragon's nest: the bones of a rival dragon */
  const D=SITE.dragon;if(D){const n=remove(o=>{const p=o.geometry.parameters||{},d=Math.hypot(o.position.x-D.x,o.position.z-D.z);return d<30&&((o.geometry.type==='TorusGeometry'&&p.radius===1.6)||(o.geometry.type==='SphereGeometry'&&p.radius===1.2))});
    /* fallen knights around the nest, burnt trees and scorched ground */
    for(let i=0;i<9;i++){const a=i/9*6.283+rr(.3),r=12+Math.random()*20,x=D.x+Math.cos(a)*r,z=D.z+Math.sin(a)*r;humanBones(x,z,Math.random()*6,{sprawl:rr(.5),helmet:i%2===0,shield:i%3===1,sword:i%4!==3})}
    for(let i=0;i<14;i++){const a=i/14*6.283+rr(.2),r=24+Math.random()*24,x=D.x+Math.cos(a)*r,z=D.z+Math.sin(a)*r;if(Math.abs(groundH(x,z)-groundH(D.x,D.z))>8)continue;burntTree(x,z,.8+Math.random()*.6)}}
  /* the Reuzenribben: a giant tusked beast, on dry land */
  const H=HIDDEN.find(h=>h.id==='ribs');if(H){const x0=H.x,z0=H.z;remove(o=>{const p=o.geometry.parameters||{},d=Math.hypot(o.position.x-x0,o.position.z-z0);return d<30&&(o.geometry.type==='TorusGeometry'||(o.geometry.type==='CylinderGeometry'&&p.height===18)||(o.geometry.type==='SphereGeometry'&&p.radius===3))});
    let x=x0,z=z0;if(terrainH(x,z)<1.5||slopeAt(x,z)>.35){let best=null,bd=1e9;for(let r=10;r<=200&&!best;r+=10)for(let k=0;k<16;k++){const a=k/16*6.283,px=x0+Math.cos(a)*r,pz=z0+Math.sin(a)*r,h=terrainH(px,pz);if(h<2||h>40||slopeAt(px,pz)>.3||siteAt(px,pz))continue;best=[px,pz];break}if(best)[x,z]=best}
    H.x=x;H.z=z;if(H.chest){H.chest.x=x+3;H.chest.z=z+6}skeleton(x,z,1.7,1.1,{tusks:true,len:16,skull:1.15})}}
const _bfB=buildFantasy;buildFantasy=function(){_bfB();try{build()}catch(e){console.warn('skeletons',e)}};
})();
