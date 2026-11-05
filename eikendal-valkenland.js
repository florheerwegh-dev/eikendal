/* ================= Valkenland: new land in the north-east =================
   The empty sea in the top right of the map is now land: green hills and woods, the snowy Iron Mountains along the
   north, a quiet lake, a bay in the south and beaches along the east coast. A road runs there from Steenwijk.
   New places:
   - Reuzenhaven: the town of the giants on the east coast. Giants three times as big as you live in huge houses with
     doors seven metres high, tables you can walk under and mugs as big as barrels; with a giant inn, a market and a
     wide pier.
   - Burcht Arendsnest: a castle on a hill in the middle, with walls, four towers, a lord, guards and a smith.
   - Het Spiegelmeer: a lake with a little island; the hermit Ingrid lives on its shore and brews potions.
   - Ruïne van Oud-Valkenburg: the ruins of an old town, haunted by skeletons, with a treasure chest.
   - Jagershut in het Wolvenwoud: a dark, dense wood full of wolves, and the hut of the hunter Bram.
   - Meeuwenklif: a fishing village on the bay, with a pier.
   - Ertsmijn Noordertand: a mine at the foot of the mountains, with miners, stone golems and a chest of ore.
   - De Reuzentrap: giant stone columns rising from the beach like a staircase; climb to the top for a treasure. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,GL=WD.great;
/* ---------- the shape of the land ---------- */
const LK={x:1780,z:-1930,r:115},HILL={x:2010,z:-1640,r:62,top:30};
function inside(x,z){const n1=(fbm(x*.004+11,z*.004-3,3)-.5)*160,n2=(fbm(x*.0035-7,z*.0035+19,3)-.5)*150;return Math.min(2440+n1-x,-1130+n2-z,x-820)}
function newH(x,z){let h=9+(fbm(x*.0032+41,z*.0032-13,5)-.5)*34;const rg=1-Math.abs(fbm(x*.0021-17,z*.0021+29,4)*2-1);h+=Math.pow(Math.max(0,rg-.6)*2.5,2)*70;
  /* the Iron Mountains along the north */
  const mn=smooth(-2180,-2470,z+(fbm(x*.004,z*.004+3,3)-.5)*160);if(mn>0){const r2=1-Math.abs(fbm(x*.0045+5,z*.0045-9,5)*2-1);h+=mn*(110+150*r2*r2)}
  /* the castle hill */
  const d=Math.hypot(x-HILL.x,z-HILL.z);if(d<HILL.r*3.2){const k=1-smooth(HILL.r,HILL.r*3.2,d);h=lerp(h,HILL.top,k*k*(3-2*k))}
  return h}
const _ex=GL.extraH;
GL.extraH=(x,z,h)=>{if(_ex)h=_ex(x,z,h);if(x<760||z>-1000||x>2700||z<-2700)return h;const m=inside(x,z);if(m<-260)return h;
  let hn=newH(x,z);const u=-m;hn=lerp(hn,3.2+(hn-3.2)*.15,1-smooth(60,260,m));let hb=lerp(hn,1.3+Math.max(0,hn-1.3)*.12,smooth(-170,-30,u));hb=lerp(hb,-2.6,smooth(-30,30,u));hb=lerp(hb,-18,smooth(30,240,u));
  const dl=Math.hypot(x-LK.x,z-LK.z);if(dl<LK.r+60){const dn=dl+(fbm(x*.05+7,z*.05,2)-.5)*14;hb=lerp(hb,Math.min(hb,2.2+(dn-LK.r)*.2),smooth(LK.r+60,LK.r+8,dn));hb=lerp(hb,-3.6,1-smooth(LK.r-16,LK.r+2,dn));if(dl<26)hb=lerp(hb,4.2,1-smooth(12,26,dl))}
  return Math.max(h,hb)};
/* the wolf wood is thick and dark */
const WW={x:2180,z:-1960};
const _fdV=forestDensity;forestDensity=function(x,z){const d=_fdV(x,z);if(d<=0)return d;const k=1-smooth(110,230,Math.hypot(x-WW.x,z-WW.z));return k>0?Math.max(d,.9*k):d};
/* ---------- places ---------- */
const P={ravenshaven:{n:'Reuzenhaven',x:2320,z:-1480,r:64,ico:'🗿',h:3.2},arendsnest:{n:'Burcht Arendsnest',x:2010,z:-1640,r:40,ico:'🏰'},spiegelmeer:{n:'Het Spiegelmeer',x:1650,z:-1905,r:16,ico:'💧',h:4.5},
  oudvalkenburg:{n:'Ruïne van Oud-Valkenburg',x:1450,z:-1650,r:34,ico:'🏚️'},wolvenwoud:{n:'Jagershut in het Wolvenwoud',x:2180,z:-1960,r:16,ico:'🐺'},meeuwenklif:{n:'Meeuwenklif',x:1690,z:-1185,r:28,ico:'🐟',h:3},
  noordertand:{n:'Ertsmijn Noordertand',x:1950,z:-2280,r:24,ico:'⛏️'},reuzentrap:{n:'De Reuzentrap',x:2380,z:-2080,r:22,ico:'🪨'}};
const autoH=(x,z,r)=>{let s=0,n=0;for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){s+=baseH(x+i*r*.4,z+j*r*.4);n++}return Math.max(2.6,s/n)};
for(const [id,p] of Object.entries(P)){const h=id==='arendsnest'?HILL.top:p.h||autoH(p.x,p.z,p.r);SITES.push(SITE[id]={id,name:p.n,x:p.x,z:p.z,r:p.r,h,blend:1.6,great:true});MAPICON[id]=p.ico}
for(const pts of[[[855,-1423],[1000,-1460],[1180,-1560],[1330,-1640],[1450,-1650]],[[1450,-1650],[1600,-1620],[1780,-1600],[1900,-1630],[2010,-1640]],[[2010,-1640],[2120,-1600],[2230,-1520],[2320,-1480]],
  [[2010,-1640],[2060,-1760],[2120,-1880],[2180,-1960]],[[2010,-1640],[1900,-1740],[1760,-1800],[1690,-1860],[1650,-1905]],[[1900,-1740],[1940,-1950],[1950,-2150],[1950,-2280]],
  [[1780,-1600],[1740,-1420],[1690,-1185]],[[2320,-1480],[2370,-1700],[2390,-1900],[2380,-2080]]])ROADS.push({w:2.4,pts,great:true});
Object.assign(CHEST_LOOT,{vk_ruin:{gold:450,items:[['gem',3],['relic',1],['potion',2]]},vk_mine:{gold:320,items:[['iron',8],['gem',2]]},vk_trap:{gold:600,items:[['gem',4],['star_shard',1]].filter(([i])=>ITEMS[i])}});
/* ---------- building ---------- */
const S=id=>SITE[id],face=(x,z,cx,cz)=>((Math.round(Math.atan2(cx-x,cz-z)/(Math.PI/2))%4)+4)%4;
const HOMES={},CAST={};
function house(x,z,cx,cz,o={}){try{return makeHouse({x,z,rot:face(x,z,cx,cz),w:o.w||(Math.random()<.5?7.5:8.5),d:o.d||6.5,h:o.h||(Math.random()<.5?6.4:3.4),style:o.style||pick(['plaster','stone','wood']),roof:'tile',name:o.name||'Huis',kind:o.kind||'home'})}catch(e){console.warn('valkenland huis',e);return null}}
function shore(x,z,dx,dz){for(let i=0;i<300;i+=2){if(terrainH(x+dx*i,z+dz*i)<.6)return i}return 0}
function pier(x,z,dx,len,w=3){const g=new T.Group(),y=1.45;for(let i=0;i<len;i+=1.2){const px=x+dx*i;g.add(mesh(new T.BoxGeometry(1.1,.18,w),MAT.wood,px,y,z));if(i%4.8<1.2)for(const s of[-1,1])g.add(mesh(new T.CylinderGeometry(.14,.16,4,6),MAT.wood,px,y-1.8,z+s*(w/2-.2)))}
  scene.add(g);bridges.push({x:x+dx*len/2,z,hx:len/2+1,hz:w/2,y:y+.09})}
function stoneMat(){return MAT.stone||new T.MeshStandardMaterial({color:0x8a857a,roughness:.95})}
function castle(cx,cz){const g=new T.Group(),y=HILL.top,HW=24,WH=8,WT=2,st=stoneMat(),roofM=new T.MeshStandardMaterial({color:0x7a2a22,roughness:.8});g.position.set(cx,y,cz);
  const wall=(x0,z0,x1,z1)=>{const l=Math.hypot(x1-x0,z1-z0),m=mesh(new T.BoxGeometry(l,WH,WT),st,(x0+x1)/2,WH/2,(z0+z1)/2);m.rotation.y=-Math.atan2(z1-z0,x1-x0);g.add(m);
    for(let t=1;t<l;t+=2.2){const k=t/l;const c=mesh(new T.BoxGeometry(1.1,1,WT+.2),st,x0+(x1-x0)*k,WH+.5,z0+(z1-z0)*k);c.rotation.y=m.rotation.y;g.add(c)}
    addBox(cx+Math.min(x0,x1)-WT/2,cz+Math.min(z0,z1)-WT/2,cx+Math.max(x0,x1)+WT/2,cz+Math.max(z0,z1)+WT/2)};
  wall(-HW,-HW,HW,-HW);wall(-HW,-HW,-HW,HW);wall(HW,-HW,HW,HW);wall(-HW,HW,-4,HW);wall(4,HW,HW,HW);
  /* the gate */
  g.add(mesh(new T.BoxGeometry(9.5,3,WT+.6),st,0,WH+1.5,HW));for(const s of[-1,1])g.add(mesh(new T.BoxGeometry(1.4,WH+3,WT+1),st,s*4.6,(WH+3)/2,HW));
  for(const [sx,sz] of[[-1,-1],[1,-1],[-1,1],[1,1]]){const tx=sx*HW,tz=sz*HW;g.add(mesh(new T.CylinderGeometry(3.4,3.9,13,14),st,tx,6.5,tz));g.add(mesh(new T.ConeGeometry(4.3,6.5,14),roofM,tx,16.2,tz));addCircle(cx+tx,cz+tz,3.9);
    const fl=new T.Mesh(new T.PlaneGeometry(2.6,1.5),new T.MeshStandardMaterial({color:0x1f4a8a,side:T.DoubleSide}));fl.position.set(tx+1.4,20.6,tz);g.add(fl);g.add(mesh(new T.CylinderGeometry(.06,.06,3.4,5),MAT.wood,tx,20,tz))}
  scene.add(g);CAST.keep=house(cx,cz-9,cx,cz+20,{w:16,d:11,h:6.4,style:'stone',name:'Burcht Arendsnest'});CAST.smithy=house(cx+15,cz+8,cx,cz+8,{w:7,d:6,h:3.4,style:'stone',name:'Smidse van Arendsnest',kind:'smith'})}
function ruins(cx,cz){const g=new T.Group(),y=S('oudvalkenburg').h,st=stoneMat();g.position.set(cx,y,cz);
  const segs=[[-16,-12,10,0],[-16,-12,-16,6],[8,-14,18,-14],[18,-14,18,-2],[-6,10,6,10],[12,8,18,14]];for(const [x0,z0,x1,z1] of segs){const l=Math.hypot(x1-x0,z1-z0),n=Math.ceil(l/2);for(let i=0;i<n;i++){const k=(i+.5)/n,h=1+Math.random()*4.5;const m=mesh(new T.BoxGeometry(l/n+.05,h,1.4),st,x0+(x1-x0)*k,h/2,z0+(z1-z0)*k);m.rotation.y=-Math.atan2(z1-z0,x1-x0);g.add(m)}addBox(cx+Math.min(x0,x1)-.7,cz+Math.min(z0,z1)-.7,cx+Math.max(x0,x1)+.7,cz+Math.max(z0,z1)+.7)}
  g.add(mesh(new T.CylinderGeometry(4,4.6,7,12,1,true),st,-4,3.5,-4));addCircle(cx-4,cz-4,4.4);
  for(let i=0;i<4;i++){const c=mesh(new T.CylinderGeometry(.55,.6,5.5,10),st,6+i*3,.6,2+rr(1));c.rotation.z=Math.PI/2;c.rotation.y=rr(.5);g.add(c)}
  for(let i=0;i<3;i++){g.add(mesh(new T.CylinderGeometry(.6,.65,3+Math.random()*3,10),st,-10+i*4,2,6))}
  scene.add(g);try{makeChest(cx-4,cz-4,'vk_ruin',0,'Schatkist van Oud-Valkenburg')}catch(e){}}
function mine(cx,cz){const s=S('noordertand'),y=s.h,g=new T.Group();g.position.set(cx,y,cz-14);const st=stoneMat(),dk=new T.MeshBasicMaterial({color:0x050302});
  g.add(mesh(new T.BoxGeometry(14,10,8),st,0,4,-3));g.add(new T.Mesh(new T.PlaneGeometry(5,5.5),dk));g.children[1].position.set(0,2.75,1.05);
  for(const s2 of[-1,1])g.add(mesh(new T.BoxGeometry(.6,6,.6),MAT.wood,s2*2.8,3,1.2));g.add(mesh(new T.BoxGeometry(6.4,.6,.7),MAT.wood,0,6,1.2));addBox(cx-7,cz-21,cx+7,cz-13);
  const ore=new T.MeshStandardMaterial({color:0xc07a3a,emissive:0x3a1a08,roughness:.6}),cry=new T.MeshStandardMaterial({color:0x7ad8ff,emissive:0x1a4a7a,roughness:.3});
  for(let i=0;i<6;i++){const r=mesh(new T.DodecahedronGeometry(1+Math.random()*.8,0),st,rr(10),.6,4+Math.random()*8);g.add(r);g.add(mesh(new T.OctahedronGeometry(.35,0),i%2?ore:cry,r.position.x,1.4,r.position.z))}
  g.add(mesh(new T.BoxGeometry(1.6,1,2.6),MAT.wood,4,.6,8));scene.add(g);try{makeChest(cx-4,cz-6,'vk_mine',0,'Ertskist van Noordertand')}catch(e){}}
function giantsSteps(cx,cz){const g=new T.Group(),bas=new T.MeshStandardMaterial({color:0x3a3a40,roughness:.85,flatShading:true}),bas2=new T.MeshStandardMaterial({color:0x4a4a52,roughness:.85,flatShading:true});scene.add(g);
  const y0=groundH(cx+16,cz);let top=0;
  for(let i=0;i<14;i++){const x=cx+16-i*2.3,h=y0+.55*(i+1);top=h;for(let j=-1;j<=1;j++){const z=cz+j*2.5+(i%2?1.25:0)*.0,m=mesh(new T.CylinderGeometry(1.3,1.35,h+3,6),j?bas2:bas,x,(h-3)/2,z);m.rotation.y=.3*j;g.add(m)}bridges.push({x,z:cz,hx:1.2,hz:3.9,y:h})}
  for(let i=0;i<26;i++){const a=Math.random()*6.283,r=6+Math.random()*12,x=cx-4+Math.cos(a)*r,z=cz+Math.sin(a)*r*1.4;if(Math.abs(z-cz)<5)continue;const h=groundH(x,z)+1+Math.random()*6;g.add(mesh(new T.CylinderGeometry(1.3,1.35,h+4,6),i%2?bas:bas2,x,(h-4)/2,z));addCircle(x,z,1.3)}
  const tx=cx+16-13*2.3;bridges.push({x:tx-2.4,z:cz,hx:2.2,hz:3.9,y:top});g.add(mesh(new T.CylinderGeometry(2.6,2.7,top+3,6),bas,tx-2.4,(top-3)/2,cz));
  try{const c=makeChest(tx-2.6,cz,'vk_trap',Math.PI/2,'Schat van de Reuzen');c.g.position.y=top;c.y=top}catch(e){}}
function village(id,o){const s=S(id),C={x:s.x,z:s.z},homes=[];for(let i=0;i<o.n;i++){const a=(o.a0||0)+i/(o.arc?o.n-1:o.n)*(o.arc||6.283),x=C.x+Math.cos(a)*o.r,z=C.z+Math.sin(a)*o.r;const b=house(x,z,C.x,C.z,{style:o.style,name:'Huis in '+s.name,kind:i===0&&o.inn?'inn':i===1&&o.shop?'shop':'home',w:i===0&&o.inn?12:undefined,h:i===0&&o.inn?6.4:undefined});if(b)homes.push(b)}
  if(o.well)try{well(C.x,C.z)}catch(e){}HOMES[id]=homes;return homes}
function hut(id,dx,dz,o){const s=S(id);return house(s.x+dx,s.z+dz,s.x,s.z,{w:6,d:5,h:3.4,style:'wood',name:o.name})}
/* ---------- Reuzenhaven: the town of the giants (everything three times as big as you) ---------- */
function Bag2(){const L=new Map();const add=(geo,m,x,y,z,ry=0,rx=0,rz=0)=>{const g=geo.index?geo.toNonIndexed():geo.clone();for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);g.clearGroups();
    g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1)));if(!L.has(m))L.set(m,[]);L.get(m).push(g)};
  return{add,box:(w,h,d,m,x,y,z,ry=0,rx=0,rz=0)=>add(new T.BoxGeometry(w,h,d),m,x,y,z,ry,rx,rz),cyl:(r0,r1,h,m,x,y,z,s=12,rx=0,rz=0)=>add(new T.CylinderGeometry(r0,r1,h,s),m,x,y,z,0,rx,rz),
    build(group){for(const [m,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const q of mg?[mg]:gs){const me=new T.Mesh(q,m);me.castShadow=true;me.receiveShadow=true;group.add(me)}}}}}
let GMAT=null;function gm(){if(GMAT)return GMAT;const M=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:o.r??.85,metalness:o.m||0,...(o.e?{emissive:o.e,emissiveIntensity:0}:{}),...(o.side?{side:o.side}:{})});
  GMAT={stone:stoneMat(),plaster:MAT.plaster||M(0xe8dcc0),wood:MAT.wood||M(0x7a5434),beam:M(0x3a2614),roof:M(0x7a3a26,{r:.8}),glass:M(0x2a3a4a,{r:.2,e:0xffc070}),floor:M(0x8a5a32),linen:M(0xf0ece0),red:M(0x9a2a22),white:M(0xf0ece0),
    fire:new T.MeshBasicMaterial({color:0xff8a2a}),flame:new T.MeshBasicMaterial({color:0xffd27a}),dark:new T.MeshBasicMaterial({color:0x120a06}),iron:MAT.iron||M(0x5a5f66,{m:.6,r:.4}),water:M(0x3a7ab8,{r:.1}),gable:M(0xe2d4b4,{side:T.DoubleSide}),
    walls:[MAT.plaster||M(0xe8dcc0),M(0xd8c098),M(0xc8d4dc),M(0xe8c8b8),M(0x8a6a4a,{r:.9}),stoneMat()],roofs:[M(0x7a3a26,{r:.8}),M(0x3a4660,{r:.7}),M(0xb08a4a,{r:.95}),M(0x3f5a3a,{r:.85}),M(0x5a3a5a,{r:.8})]};return GMAT}
function gHouse(cx,cz,q,o={}){const m=gm(),b=Bag2(),th=q*Math.PI/2,co=Math.cos(th),si=Math.sin(th),W2=(lx,lz)=>[cx+lx*co+lz*si,cz-lx*si+lz*co];
  const y=groundH(cx,cz),g=new T.Group();g.position.set(cx,y,cz);g.rotation.y=th;const v=o.v||0,w=o.w||[21,18,24,20,22,19,23][v%7],d=o.d||[18,16,17,19,15,18,16][v%7],h=o.h||[10.5,12,9.5,11,10,13,9.8][v%7],t=1.2,dw=4.4,dh=7.2,rf=[7,9,6,8,7.5,10,6.5][v%7];
  const WM=m.walls[v%m.walls.length],RM=m.roofs[(v*3+1)%m.roofs.length];
  b.box(w-2*t,.15,d-2*t,m.floor,0,.08,0);
  /* walls, with a stone plinth outside and a big doorway in front */
  b.box(w,h,t,WM,0,h/2,-d/2+t/2);for(const sx of[-1,1])b.box(t,h,d,WM,sx*(w/2-t/2),h/2,0);const fw=(w-dw)/2;for(const sx of[-1,1])b.box(fw,h,t,WM,sx*(dw/2+fw/2),h/2,d/2-t/2);b.box(dw,h-dh,t,WM,0,dh+(h-dh)/2,d/2-t/2);
  b.box(w+.4,2.4,.3,m.stone,0,1.2,-d/2-.1);for(const sx of[-1,1]){b.box(.3,2.4,d+.4,m.stone,sx*(w/2+.1),1.2,0);b.box(fw+.2,2.4,.3,m.stone,sx*(dw/2+fw/2),1.2,d/2+.1)}
  /* timber beams outside */for(const sz of[-1,1]){for(let x=-w/2;x<=w/2+.01;x+=3.5){if(sz>0&&Math.abs(x)<dw/2+.4)continue;b.box(.45,h-2.4,.25,m.beam,x,2.4+(h-2.4)/2,sz*(d/2+.12))}b.box(w+.2,.5,.25,m.beam,0,h-.25,sz*(d/2+.12))}
  for(const sx of[-1,1])b.box(.25,.5,d+.2,m.beam,sx*(w/2+.12),h-.25,0);b.box(dw+1.4,.7,.6,m.beam,0,dh+.35,d/2+.1);for(const sx of[-1,1])b.box(.7,dh,.6,m.beam,sx*(dw/2+.35),dh/2,d/2+.1);
  /* windows (glowing at night) */const win=(x,z,ry)=>{for(const k of[-1,1]){const ox=Math.sin(ry)*k*.68,oz=Math.cos(ry)*k*.68;b.box(2.8,4,.1,m.glass,x+ox,5.6,z+oz,ry);b.box(3.4,.4,.3,m.beam,x+ox,3.5,z+oz,ry);b.box(3.4,.4,.3,m.beam,x+ox,7.7,z+oz,ry);b.box(.3,4,.25,m.beam,x+ox,5.6,z+oz,ry)}};
  for(const sx of[-1,1]){win(sx*(w/4+1.2),d/2-t/2,0);win(sx*(w/2-t/2),-2,Math.PI/2);win(sx*(w/4),-d/2+t/2,0)}
  /* the roof: two slopes and two gables */const half=d/2+1.4,sl=Math.hypot(half,rf),ang=Math.atan2(rf,half);for(const sz of[-1,1])b.box(w+2.4,.6,sl,RM,0,h+rf/2,sz*half/2,0,sz*ang);
  {const sh=new T.Shape();sh.moveTo(-d/2,0);sh.lineTo(d/2,0);sh.lineTo(0,rf-.3);sh.lineTo(-d/2,0);const gg=new T.ShapeGeometry(sh);for(const sx of[-1,1])b.add(gg,v%3===2?m.beam:m.gable,sx*(w/2-.05),h,0,Math.PI/2)}
  b.box(2.4,rf+1,2.4,m.stone,(v%2?-1:1)*(w/2-4),h+rf/2,-2.5);
  /* something different on every house */
  if(v%4===1){/* a round tower at one corner */const tx=-w/2,tz=d/2-1;b.cyl(3.2,3.4,h+5,m.stone,tx,(h+5)/2,tz,14);b.add(new T.ConeGeometry(4,6,14),RM,tx,h+8,tz)}
  if(v%4===2){/* an awning over the door */b.box(dw+4,.3,4,m.red,0,dh+1.2,d/2+2,0,-.25);for(const sx of[-1,1])b.box(.4,dh+1,.4,m.wood,sx*(dw/2+1.8),(dh+1)/2,d/2+3.8)}
  if(v%4===3){/* a shed at the side */const sx=w/2+3.2;b.box(5.6,5,8,m.wood,sx,2.5,-2);b.box(6.4,.4,9,RM,sx,5.2,-2,0,0,.2);b.cyl(1.4,1.3,3.4,m.wood,sx+1,1.7,4)}
  if(v%4===0){/* flower boxes under the front windows */for(const sx of[-1,1]){b.box(3.6,.9,1,m.wood,sx*(w/4+1.2),3,d/2+.5);for(let i=0;i<5;i++)b.add(new T.SphereGeometry(.35,6,4),i%2?m.red:m.flame,sx*(w/4+1.2)-1.4+i*.7,3.6,d/2+.5)}}
  /* inside: a table you can walk under, chairs, a bed, a fireplace, a mug as big as a barrel */
  b.box(9,.4,3.6,m.wood,2,2.8,-2);for(const [lx,lz] of[[-2,-3.4],[6,-3.4],[-2,-.6],[6,-.6]])b.box(.6,2.8,.6,m.wood,lx,1.4,lz);b.cyl(.55,.5,1.2,m.wood,0,3.6,-2);b.cyl(.6,.6,.12,m.iron,0,3.05,-2);b.cyl(1.2,1.2,.1,m.white,4,3.05,-2,16);
  b.cyl(.22,.22,1.2,m.linen,5.6,3.6,-2.6,8);b.add(new T.SphereGeometry(.2,6,4),m.flame,5.6,4.35,-2.6);
  for(const sz of[-1,1]){const cz2=-2+sz*3.4;b.box(2.6,.35,2.4,m.wood,2,1.6,cz2);for(const [lx,lz] of[[-1.1,-1],[1.1,-1],[-1.1,1],[1.1,1]])b.box(.3,1.6,.3,m.wood,2+lx,.8,cz2+lz);b.box(2.6,3.2,.35,m.wood,2,3.2,cz2+sz*1.1)}
  const bx=-w/2+4.2,bz=-d/2+5.6;b.box(5.4,1.4,8.4,m.wood,bx,.7,bz);b.box(5,.6,7.8,m.linen,bx,1.7,bz);b.box(5,.7,3.6,m.red,bx,1.8,bz+1.9);b.box(3.6,.7,1.4,m.white,bx,2.2,bz-3.2);b.box(5.4,3.4,.5,m.wood,bx,1.7,bz-4.1);
  b.box(5.6,6,1.8,m.stone,w/2-5,3,-d/2+1.9);b.box(3.4,3.2,.2,m.dark,w/2-5,1.8,-d/2+2.85);b.add(new T.ConeGeometry(.8,2,6),m.fire,w/2-5.6,1,-d/2+2.6);b.add(new T.ConeGeometry(.6,1.5,6),m.fire,w/2-4.3,.8,-d/2+2.5);
  b.build(g);scene.add(g);
  /* walls stop you, the doorway lets you in; table legs and the bed are solid */
  const rect=(x0,z0,x1,z1)=>{const [ax,az]=W2(x0,z0),[bx2,bz2]=W2(x1,z1);addBox(Math.min(ax,bx2),Math.min(az,bz2),Math.max(ax,bx2),Math.max(az,bz2))};
  rect(-w/2,-d/2,w/2,-d/2+t);rect(-w/2,-d/2,-w/2+t,d/2);rect(w/2-t,-d/2,w/2,d/2);rect(-w/2,d/2-t,-dw/2,d/2);rect(dw/2,d/2-t,w/2,d/2);rect(bx-2.7,bz-4.2,bx+2.7,bz+4.2);if(v%4===1){const [x,z]=W2(-w/2,d/2-1);addCircle(x,z,3.4)}if(v%4===3)rect(w/2+.4,-6,w/2+6,2);
  for(const [lx,lz] of[[-2,-3.4],[6,-3.4],[-2,-.6],[6,-.6]]){const [x,z]=W2(lx,lz);addCircle(x,z,.45)}
  return{inside:W2(0,2),door:W2(0,d/2+3),counter:W2(0,2.5)}}
function giantTown(){const s=S('ravenshaven'),C={x:s.x,z:s.z},m=gm(),H=[];
  for(let i=0;i<8;i++){const a=Math.PI*.33+i*(Math.PI*1.34/7),r=i===0?46:44,x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r,q=face(x,z,C.x,C.z);H.push(gHouse(x,z,q,i===0?{w:27,d:21,h:12,v:0}:{v:i}))}
  /* the well, the market stall and giant things lying about */const g=new T.Group(),b=Bag2(),y=s.h;g.position.set(C.x,y,C.z);
  b.cyl(4.2,4.4,2.6,m.stone,0,1.3,0,20);b.cyl(3.6,3.6,.2,m.water,0,2.3,0,20);for(const sx of[-1,1])b.box(.6,7,.6,m.wood,sx*3.6,3.5,0);b.box(8.6,.6,.8,m.wood,0,7,0);b.box(9,.5,6,m.roof,0,7.8,0);addCircle(C.x,C.z,4.5);
  b.box(8,.4,3.6,m.wood,-14,2.8,12);for(const [lx,lz] of[[-17.6,10.4],[-10.4,10.4],[-17.6,13.6],[-10.4,13.6]]){b.box(.5,6.4,.5,m.wood,lx,3.2,lz);addCircle(C.x+lx,C.z+lz,.4)}for(let i=0;i<6;i++)b.box(1.4,.25,4.2,i%2?m.red:m.white,-17.5+i*1.4,6.5,12);
  for(const [lx,lz,r2,h2] of[[-20,-6,1.6,3.8],[-17,-9,1.5,3.6],[16,16,1.6,3.8]]){b.cyl(r2,r2*.9,h2,m.wood,lx,h2/2,lz);addCircle(C.x+lx,C.z+lz,r2)}
  b.box(1.5,1.6,4.2,m.beam,8,.8,-14);b.box(1.5,1.6,4.2,m.beam,10.4,.8,-13.6);b.box(1.5,3.6,1.5,m.beam,8,2.6,-15.4);b.box(1.5,3.6,1.5,m.beam,10.4,2.6,-15);
  b.cyl(2.6,2.6,.6,m.wood,-6,2.6,-18,18,Math.PI/2.3,0);b.cyl(.5,.5,.8,m.iron,-6,2.6,-18,8,Math.PI/2.3,0);
  b.build(g);scene.add(g);CAST.giants=H;
  /* a pier for giants */{const d=shore(C.x,C.z,1,0);CAST.rvPier=C.x+Math.max(46,d-8);pier(CAST.rvPier,C.z,1,50,9)}}
const GLINES=['HO HO! Een kleintje!','Pas op dat ik niet op je stap!','Welkom in Reuzenhaven, kleine vriend!','Wil je een boterham? Hij is groter dan jij!','Mijn kat is groter dan jouw paard.','Ik nies even... HATSJOE!','Kleine mensen zijn zo schattig.'];
try{LINES.reus=GLINES}catch(e){}
function giant(a,k=3){if(!a)return a;try{a.root.scale.multiplyScalar(k);a.hh=(a.hh||1.8)*k;a.rad=.42*k;a.giant=k;a.line='reus'}catch(e){}return a}
const _bfV=buildFantasy;buildFantasy=function(){_bfV();
  try{giantTown()}catch(e){console.warn('ravenshaven',e)}
  try{castle(S('arendsnest').x,S('arendsnest').z)}catch(e){console.warn('arendsnest',e)}
  try{ruins(S('oudvalkenburg').x,S('oudvalkenburg').z)}catch(e){console.warn('oud-valkenburg',e)}
  try{CAST.hermit=hut('spiegelmeer',-6,0,{name:'Hut van Kluizenares Ingrid'})}catch(e){console.warn(e)}
  try{CAST.hunter=hut('wolvenwoud',0,-6,{name:'Jagershut'})}catch(e){console.warn(e)}
  try{village('meeuwenklif',{n:5,r:16,a0:Math.PI*1.1,arc:Math.PI*.8,style:'wood'});{const s=S('meeuwenklif'),d=Math.max(18,shore(s.x,s.z,0,1)-6),g=new T.Group();for(let i=0;i<32;i+=1.2){g.add(mesh(new T.BoxGeometry(3,.18,1.1),MAT.wood,s.x,1.45,s.z+d+i));if(i%4.8<1.2)for(const q of[-1,1])g.add(mesh(new T.CylinderGeometry(.14,.16,4,6),MAT.wood,s.x+q*1.3,-.35,s.z+d+i))}scene.add(g);bridges.push({x:s.x,z:s.z+d+16,hx:1.5,hz:17,y:1.54});CAST.mkPier=s.z+d}}catch(e){console.warn('meeuwenklif',e)}
  try{mine(S('noordertand').x,S('noordertand').z)}catch(e){console.warn('noordertand',e)}
  try{giantsSteps(S('reuzentrap').x,S('reuzentrap').z)}catch(e){console.warn('reuzentrap',e)}};
/* ---------- people, animals and monsters ---------- */
const at=(b,x,z)=>b&&b.counter?[b.counter[0],b.counter[1]]:[x,z];
const sp=(job,x,z,o)=>{try{return spawnNPC(job,x,z,o)}catch(e){console.warn('valkenland npc',e)}};
const shop=L=>L.filter(i=>ITEMS[i]);
function people(id,n,o={}){const s=S(id);for(let i=0;i<n;i++){const a=Math.random()*6.283,r=5+Math.random()*(s.r*.6),b=sp(o.job||'villager',s.x+Math.cos(a)*r,s.z+Math.sin(a)*r,{name:o.names?pick(o.names)+' '+pick(FIRST):undefined,line:o.line,roam:{x:s.x,z:s.z},radius:s.r*.7});if(b&&HOMES[id]&&HOMES[id].length)b.homeB=pick(HOMES[id])}}
const _pfV=populateFantasy;populateFantasy=function(){_pfV();
  try{const s=S('ravenshaven'),H=CAST.giants||[],R=n=>({x:s.x,z:s.z});for(let i=0;i<9;i++){const a=Math.random()*6.283,r=10+Math.random()*24;giant(sp('villager',s.x+Math.cos(a)*r,s.z+Math.sin(a)*r,{name:'Reus '+pick(FIRST),roam:{x:s.x,z:s.z},radius:30}))}
    giant(sp('villager',s.x+8,s.z+8,{name:'Reuzenkind Pim',roam:{x:s.x,z:s.z},radius:18}),1.8);
    const inn=H[0];giant(sp('innkeeper',...(inn?inn.counter:[s.x+4,s.z]),{name:'Herbergier Grom',ai:'stay',shop:shop(['bread','stew','roast','ale','cheese','fish','wine'])}));
    giant(sp('merchant',s.x-14,s.z+16,{name:'Marktreuzin Hilde',ai:'stay',face:Math.PI,shop:shop(['club_troll','axe_war','shield_knight','potion','elixir','iron','wood','bread'])}));
    for(let i=0;i<2;i++)giant(sp('villager',(CAST.rvPier||s.x+46)+12+i*16,s.z+rr(1.5),{name:'Reuzenvisser '+pick(FIRST),line:'reus',ai:'stay',face:Math.PI/2}));
    for(const sz of[-1,1])giant(sp('guard',s.x-64,s.z+sz*6,{name:'Reuzenwacht',ai:'stay',face:-Math.PI/2}))}catch(e){console.warn(e)}
  try{const s=S('arendsnest'),k=CAST.keep;sp('lord',...at(k,s.x,s.z-9),{name:'Heer Albrecht van Arendsnest',ai:'stay'});const m=CAST.smithy;sp('smith',...at(m,s.x+15,s.z+8),{name:'Smid Hildegard',ai:'stay',shop:shop(['sword_knight','axe_war','shield_knight','helm_iron','chain','bow_long','arrow'])});
    for(let i=0;i<5;i++)sp('guard',s.x+rr(14),s.z+rr(14),{name:'Valkenridder',ai:'guard',patrol:[[s.x-18,s.z-18],[s.x+18,s.z-18],[s.x+18,s.z+18],[s.x-18,s.z+18],[s.x,s.z+30]]});people('arendsnest',4)}catch(e){console.warn(e)}
  try{const s=S('spiegelmeer'),h=CAST.hermit;sp('hermit',...at(h,s.x-6,s.z),{name:'Kluizenares Ingrid',ai:'stay',shop:shop(['potion','elixir','salve','spd_potion','str_potion','skin_potion','reuzendrank','veerdrank','kikkerdrank'])});for(let i=0;i<5;i++)spawnAnimal(pick(['deer','deer','rabbit','fox'].filter(t=>ANIMALS[t])),LK.x+Math.cos(i)*(LK.r+20),LK.z+Math.sin(i)*(LK.r+20))}catch(e){console.warn(e)}
  try{for(let i=0;i<5;i++)spawnEnemy('skeleton',S('oudvalkenburg').x+rr(14),S('oudvalkenburg').z+rr(12))}catch(e){console.warn(e)}
  try{const s=S('wolvenwoud'),h=CAST.hunter;sp('villager',...at(h,s.x,s.z-6),{name:'Jager Bram',ai:'stay',shop:shop(['bow','bow_long','arrow','meat','leatherm','fur'])});for(let i=0;i<7;i++){const a=Math.random()*6.283,r=40+Math.random()*90;spawnEnemy('wolf',WW.x+Math.cos(a)*r,WW.z+Math.sin(a)*r)}}catch(e){console.warn(e)}
  try{const s=S('meeuwenklif');people('meeuwenklif',4,{line:'fisher'});for(let i=0;i<2;i++)sp('villager',s.x+rr(1),(CAST.mkPier||s.z+20)+8+i*10,{name:'Visser '+pick(FIRST),line:'fisher',ai:'stay',face:0});sp('merchant',s.x+6,s.z+6,{name:'Visvrouw Marijke',ai:'stay',shop:shop(['fish','salmon','trout','catfish','bread'])})}catch(e){console.warn(e)}
  try{const s=S('noordertand');for(let i=0;i<4;i++)sp('smith',s.x+rr(10),s.z+rr(6),{name:'Mijnwerker '+pick(FIRST),roam:{x:s.x,z:s.z},radius:12});for(let i=0;i<3;i++)spawnMonster('golem',s.x+rr(20),s.z-30+rr(8))}catch(e){console.warn(e)}
  try{for(let i=0;i<6;i++)spawnAnimal(pick(['deer','elk','sheep','boar'].filter(t=>ANIMALS[t])),1500+Math.random()*800,-1300-Math.random()*800)}catch(e){}};
ANIMS.push(()=>{if(GMAT){const n=ENV.night||0;GMAT.glass.emissiveIntensity=n>.3?.9*n:0}});
WD.valkenland={P,LK,HILL,inside};
})();
