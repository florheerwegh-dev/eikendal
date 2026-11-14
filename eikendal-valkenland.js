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
const rr=(a=1)=>(Math.random()*2-1)*a,R2=(a,b)=>a+Math.random()*(b-a),GL=WD.great;
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
const P={ravenshaven:{n:'Reuzenhaven',x:2320,z:-1500,r:92,ico:'🗿',h:3.2},arendsnest:{n:'Burcht Arendsnest',x:2010,z:-1640,r:40,ico:'🏰'},spiegelmeer:{n:'Het Spiegelmeer',x:1650,z:-1905,r:16,ico:'💧',h:4.5},
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
function castle(cx,cz){const HW=24,TW=3.2,g=new T.Group(),m=KIT.Bag(),y=HILL.top,gz=cz+HW;try{WD.addGate&&WD.addGate(cx,gz,0,1,{in:16,n:'Burcht Arendsnest'})}catch(e){}try{wallSeg(cx-HW,cz-HW,cx+HW,cz-HW,8,2);wallSeg(cx-HW,cz-HW,cx-HW,cz+HW,8,2);wallSeg(cx+HW,cz-HW,cx+HW,cz+HW,8,2);wallSeg(cx-HW,gz,cx-4.5,gz,8,2);wallSeg(cx+4.5,gz,cx+HW,gz,8,2);for(const [x,z] of[[-HW,-HW],[HW,-HW],[-HW,HW],[HW,HW],[-5.6,HW],[5.6,HW]])tower(cx+x,cz+z,z===HW&&Math.abs(x)<9?2.2:TW,z===HW&&Math.abs(x)<9?10:13)}catch(e){console.warn(e)}
  m.model('Banner_2',cx-7.6,y+7.6,cz+HW+1.2,0,2.4);m.model('Banner_1',cx+6,y+7.6,cz+HW+1.2,0,2.4);m.model('WeaponStand',cx-16,y,cz+16,0,1.3);m.model('WeaponStand',cx+16,y,cz+16,0,1.3);m.model('Prop_Wagon',cx+19,y,cz-14,.2);for(let i=0;i<4;i++)m.model('Dummy',cx-19+i*3,y,cz-3,Math.PI/2,1.3);m.model('Barrel',cx+19,y,cz+6);m.model('Barrel',cx+20,y,cz+7.2);m.model('Crate_Wooden',cx+18,y,cz+8);m.build(g);scene.add(g);CAST.keep=house(cx,cz-9,cx,cz+20,{w:16,d:11,h:6.4,style:'stone',name:'Burcht Arendsnest'});CAST.smithy=house(cx+15,cz+8,cx,cz+8,{w:7,d:6,h:3.4,style:'stone',name:'Smidse van Arendsnest',kind:'smith'})}
function ruins(cx,cz){const g=new T.Group(),b=KIT.Bag(),y=S('oudvalkenburg').h;g.position.set(cx,0,cz);const wl=(x,z,ry,sy,w)=>b.model(w?'Wall_UnevenBrick_Window_Wide_Round':'Wall_UnevenBrick_Straight',x,y,z,ry,2,{sy});for(let i=0;i<7;i++){wl(-14+i*4,-13,0,R2(.4,1),i%2);if(i%3)wl(-14+i*4,10,Math.PI,R2(.3,.8),false)}for(let i=0;i<5;i++){wl(-16,-10+i*4,-Math.PI/2,R2(.35,1),i%2);if(i!==2)wl(11.6,-10+i*4,Math.PI/2,R2(.3,.7),false)}for(const [x0,z0,x1,z1] of[[-16,-13,12,-13],[-16,-13,-16,10],[12,-13,12,-1],[12,3,12,10]])addBox(cx+Math.min(x0,x1)-.5,cz+Math.min(z0,z1)-.5,cx+Math.max(x0,x1)+.5,cz+Math.max(z0,z1)+.5);
  for(let i=0;i<16;i++)b.model('Prop_Brick'+(1+i%4),rr(14),y,rr(11),i,1.6);for(let i=0;i<5;i++)b.model('Vase_Rubble_Medium',rr(13),y,rr(10),i,1.6);for(let i=0;i<6;i++)b.model('Rock_Medium_'+(1+i%3),18*Math.cos(i),y,16*Math.sin(i),i,.7);for(let i=0;i<5;i++)b.model('DeadTree_'+(1+i),24*Math.cos(i*1.3),y,22*Math.sin(i*1.3),i,.7);b.model('Wall_Arch',-3,y,-13.4,0,3);b.build(g);scene.add(g);try{makeChest(cx-4,cz-4,'vk_ruin',0,'Schatkist van Oud-Valkenburg')}catch(e){}}
function mine(cx,cz){const s=S('noordertand'),y=s.h,g=new T.Group(),b=KIT.Bag();g.position.set(cx,0,cz);for(let i=0;i<5;i++)b.model('Rock_Medium_'+(1+i%3),-8+i*4,y,-15,i,2.2);b.model('Wall_Arch',0,y,-13,0,2.6,{tint:0x5a4630});for(const sd of[-1,1])b.model('Prop_Support',sd*2.6,y,-12.6,0,2.2);b.add(new T.PlaneGeometry(4.6,6),new T.MeshBasicMaterial({color:0x050302}),0,y+3,-13.2);addBox(cx-9,cz-18,cx+9,cz-13.6);b.model('Prop_Wagon',4,y,-5,.3);b.model('Prop_Wagon',-5,y,-3,-.2);for(let i=0;i<4;i++){b.model('Crate_Metal',-9+i*1.6,y,3);b.model('Pickaxe_Bronze',6+i,y,2,i,1.6)}b.model('Anvil',9,y,-3,0,1.2);b.model('Torch_Metal',-3.4,y,-11,0,1.6);b.model('Torch_Metal',3.4,y,-11,0,1.6);b.build(g);scene.add(g);try{makeChest(cx-4,cz-6,'vk_mine',0,'Ertskist van Noordertand')}catch(e){}}
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
const WALLT=[null,0xe8d0b0,0xc8d8e8,0xe8c0b0,0xd8d8c0,null,0xd8c8e0],ROOFT=[null,0x7a8ab0,0xe0c070,0x7ab07a,0xb080b0,0xc06a50,0x9a9a9a];
function gHouse(cx,cz,q,o={}){const v=o.v||0,s=3,y=groundH(cx,cz),G=new T.Group();G.position.set(cx,y,cz);scene.add(G);const b=KIT.Bag(),cols=o.cols||[3,3,5,3,5,3,3][v%7],rows=o.rows||[3,5,3,3,3,5,3][v%7],floors=o.floors||[1,1,1,2,1,1,2][v%7],hs=KIT.kitHouse(b,0,0,0,cols,rows,{s,q,floors,wall:v%3===1?'UnevenBrick':'Plaster',wallTop:v%2?'Plaster':undefined,tint:WALLT[v%7],roofTint:ROOFT[v%7],chimney:v%2?'2':true}),R=hs.R,th=hs.th,W=hs.W,D=hs.D,put=(n,lx,lz,ry=0,sc=3,dy=0,op)=>{const [x,z]=R(lx,lz);b.model(n,x,.1+dy,z,ry+th,sc,op)};
  /* giant furniture: everything three times as big */put('Table_Large',W*.15,-D*.25,0,3);for(const sd of[-1,1]){put('Chair_1',W*.15-3.4,-D*.25+sd*2.2,sd>0?Math.PI:0,3);put('Chair_1',W*.15+3.4,-D*.25+sd*2.2,sd>0?Math.PI:0,3)}put('Mug',W*.15-1.6,-D*.25,0,3.4,2.5);put('Table_Plate',W*.15+1.6,-D*.25,0,3.2,2.5);put('CandleStick_Triple',W*.15,-D*.25,0,2.6,2.5);
  put('Bed_Twin1',-W+4.4,-D+5.2,0,3);put('Nightstand_Shelf',-W+9,-D+1.8,0,3);put('Cabinet',W-1.9,D*.3,-Math.PI/2,3);put('Bookcase_2',W*.2,-D+1.4,0,3);put('Chandelier',0,D*.1,0,3.6,3.12*s-4.6);put('Barrel',W-3,-D+3,0,3);put('Vase_2',-W+2.4,D-2.6,0,3);
  /* outside, a little different each time */{const f=v%4;if(f===0){put('FarmCrate_Apple',-W*.6,D+2,0,3);put('Barrel_Apples',W*.6,D+2,0,3)}if(f===1){put('Prop_Wagon',W+4.5,D*.6,0,2.4)}if(f===2){put('Banner_1',-W*.55,D+.5,0,3,8);put('Banner_2',W*.55-4,D+.5,0,3,8);put('Bench',W*.55,D+3,Math.PI,2.4)}if(f===3){put('Crate_Wooden',W+2.6,-D*.4,.4,3);put('Crate_Wooden',W+2.8,D*.2,0,2.4);put('Bucket_Wooden_1',W+2.8,D*.6,0,3)}}
  b.build(G);KIT.kitWalls(hs,(a,c,e,g)=>addBox(cx+a,cz+c,cx+e,cz+g),cx,cz,4.2);{const [lx,lz]=R(-W+4.4,-D+1.6);void lx;void lz}const B2=(a,c,e,f)=>{const [x0,z0]=R(a,c),[x1,z1]=R(e,f);addBox(cx+Math.min(x0,x1),cz+Math.min(z0,z1),cx+Math.max(x0,x1),cz+Math.max(z0,z1))};B2(-W+1.5,-D+1.5,-W+7.4,-D+8.6);const [iw,iz]=R(0,2.5),[dw,dz]=R(0,D+6);return{inside:[cx+iw,cz+iz],door:[cx+dw,cz+dz],counter:[cx+iw,cz+iz]}}
function gChurch(cx,cz,q){const s=3,y=groundH(cx,cz),G=new T.Group();G.position.set(cx,y,cz);scene.add(G);const b=KIT.Bag(),hs=KIT.kitHouse(b,0,0,0,3,7,{s,q,floors:2,wall:'UnevenBrick',tint:0xc8c4bc,roofTint:0x7a8ab0,win:'Thin_Round',chimney:false}),R=hs.R,W=hs.W,D=hs.D,put=(n,lx,lz,ry=0,sc=3,dy=0,op)=>{const [x,z]=R(lx,lz);b.model(n,x,.1+dy,z,ry,sc,op)};
  /* the tower with a spire, at the back */const tz=-D-6,tw=6,TH=4;for(let f=0;f<TH;f++){const yy=f*9.36;for(const [lx,lz,ry] of[[0,tz+tw,0],[0,tz-tw,Math.PI],[tw,tz,Math.PI/2],[-tw,tz,-Math.PI/2]]){const [x,z]=R(lx,lz);b.model('Wall_UnevenBrick'+(f===TH-1?'_Window_Thin_Round':'_Straight'),x,yy,z,ry,6,{tint:0xc8c4bc,sy:.5})}}{const [x,z]=R(0,tz);b.model('Roof_Tower_RoundTiles',x,TH*9.36,z,0,3,{tint:0x7a8ab0});addCircle(cx+x,cz+z,tw);KIT.zone(cx+x-tw,cz+z-tw,cx+x+tw,cz+z+tw)}
  /* inside: benches, an altar, candles, banners */for(let lz=-D+12;lz<=D-7;lz+=5)for(const sd of[-1,1]){put('Bench',sd*4.6,lz,0,2.4);const [x,z]=R(sd*4.6,lz);addBox(cx+x-3.4,cz+z-.8,cx+x+3.4,cz+z+.8)}put('Table_Large',0,-D+5,0,2.6);for(const sd of[-3,0,3])put('CandleStick_Stand',sd,-D+4.4,0,1.6,2.1);for(const sd of[-1,1]){put('Banner_1',sd*(hs.W-1.2),-D+7,sd>0?-Math.PI/2:Math.PI/2,3,12);put('CandleStick_Stand',sd*6,-D+8,0,3)}put('Chandelier',0,-4,0,4,14);put('Chandelier',0,8,0,4,14);
  b.build(G);KIT.kitWalls(hs,(a,c,e,g)=>addBox(cx+a,cz+c,cx+e,cz+g),cx,cz,4.2);const [ax,az]=R(0,-D+9.5);return{altar:[cx+ax,cz+az]}}
function giantTown(){const s=S('ravenshaven'),C={x:s.x,z:s.z},H=[];for(let i=0;i<8;i++){const a=Math.PI*.3+i*(Math.PI*1.4/7),r=i===0?60:56,x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r,q=face(x,z,C.x,C.z);H.push(gHouse(x,z,q,i===0?{cols:5,rows:5,floors:2,v:3}:{v:i}))}
  /* the market in the middle: real stalls, carts, barrels, all three times as big */const g=new T.Group(),b=KIT.Bag(),y=s.h,m=(n,x,z,ry=0,sc=3,dy=0,o)=>b.model(n,x,y+dy,z,ry,sc,o);g.position.set(C.x,0,C.z);
  m('Stall_Empty',-14,12,0);m('Stall_Cart_Empty',-4,14,0);m('Stall_Empty',8,14,0);m('Stall_Cart_Empty',16,8,-Math.PI/2);for(const [lx,lz] of[[-14,12],[-4,14],[8,14]]){addCircle(C.x+lx,C.z+lz,2.8)}addCircle(C.x+16,C.z+8,2.8);m('FarmCrate_Apple',-16,9.6);m('FarmCrate_Carrot',-11.6,9.6);m('Barrel_Apples',6,10.8);m('Barrel',-20,-6);m('Barrel',-17,-9,0,2.8);m('Barrel',16,16);m('Prop_Wagon',10,-14,.3,2.4);m('Crate_Wooden',-8,-17,.4);m('Crate_Wooden',-11,-16,0,2.6);addCircle(C.x-20,C.z-6,1.4);addCircle(C.x+10,C.z-18,3);
  for(let i=0;i<8;i++){const a=i/8*6.283;m('Pebble_Round_'+(1+i%5),Math.cos(a)*5,Math.sin(a)*5,i,4)}m('Cauldron',0,0,0,5);addCircle(C.x,C.z,3);for(const [lx,lz] of[[-28,-24],[28,-24],[-30,20],[30,22]]){m('CommonTree_'+(1+Math.abs(lx+lz)%5),lx,lz,lx,1.6);addCircle(C.x+lx,C.z+lz,.9)}b.build(g);scene.add(g);CAST.giants=H;try{CAST.church=gChurch(C.x-6,C.z-104,0)}catch(e){console.warn('reuzenkerk',e)}
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
    for(const sz of[-1,1])giant(sp('guard',s.x-64,s.z+sz*6,{name:'Reuzenwacht',ai:'stay',face:-Math.PI/2}));
    {const ch=CAST.church;if(ch)giant(sp('priest',...ch.altar,{name:'Reuzenpriester Bertolf',ai:'stay',face:0}))}}catch(e){console.warn(e)}
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
