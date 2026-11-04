/* ================= Zilverhaven: the great trading city on the south-east coast =================
   A walled city of stone and plaster: three gates with towers, cobbled streets in a cross, and in the middle a great
   market square with a fountain, a bell tower and a ring of stalls. Around it some thirty-five houses, the guild hall
   of the merchants, an inn, an exchange and warehouses. Towards the sea the walls open onto the harbour: a stone
   quay, wooden piers, merchant cogs at anchor and a treadwheel crane. Merchants sell spices, silk, wine, jewels,
   weapons and armour; guards walk the walls, citizens fill the streets and sailors work the quay. */
(function(){
const C={x:730,z:545},H=5,HW=78,rr=(a=1)=>(Math.random()*2-1)*a;
SITES.push(SITE.zilverhaven={id:'zilverhaven',name:'Zilverhaven',x:C.x,z:C.z,r:86,h:H,blend:1.25});MAPICON.zilverhaven='⚓';
/* the streets, and a road from the west gate to the nearest road of Eikendal (all laid down before the land is built) */
{const near=(x,z)=>{let best=null,bd=1e9;for(const r of ROADS){const p=r.pts;for(let i=0;i<p.length-1;i++){const ax=p[i][0],az=p[i][1],dx=p[i+1][0]-ax,dz=p[i+1][1]-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1))),qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(x-qx,z-qz);if(d<bd){bd=d;best=[qx,qz]}}}return best};
  const link=(x,z)=>{const p=near(x,z);if(!p)return;const pts=[p];const n=Math.ceil(Math.hypot(x-p[0],z-p[1])/45);for(let i=1;i<n;i++){const t=i/n,px=p[0]+(x-p[0])*t,pz=p[1]+(z-p[1])*t;if(!(WD.inSea&&WD.inSea(px,pz)))pts.push([px,pz])}pts.push([x,z]);if(pts.length>1)ROADS.push({w:2.6,pts})};
  link(C.x-HW-6,C.z);link(C.x,C.z-HW-6);
  for(const p of[[[C.x,C.z-HW-6],[C.x,C.z-22]],[[C.x,C.z+22],[C.x,C.z+HW-6]],[[C.x-HW-6,C.z],[C.x-22,C.z]],[[C.x+22,C.z],[C.x+HW+6,C.z]],[[C.x+18,C.z+18],[C.x+70,C.z+70]]])ROADS.push({w:3.4,pts:p})}
Object.assign(ITEMS,{spice:{n:'Specerijen',g:'mat',price:60,ico:'❀',rar:'r'},silk:{n:'Zijde',g:'mat',price:95,ico:'❖',rar:'r'},wine:{n:'Wijn van de Zuidkust',g:'food',heal:25,stam:30,price:35,ico:'🍷'}});
LINES.zilverhaven=['Welkom in Zilverhaven, de rijkste stad van het land!','Hier komen schepen van over de hele zee. Specerijen, zijde, wijn... alles is te koop.','Heb je de markt al gezien? Op marktdag kun je er geen voet meer verzetten.',
  'De Handelsprinses woont in het Gildehuis. Zij bepaalt de prijzen in de hele stad.','Pas op voor zakkenrollers bij de haven.','De klok in de toren slaat elk uur. Dan weten de schippers wanneer het tij keert.','Mijn neef vaart op de Zilvermeeuw. Volgende maand komt hij terug met zijde.'];
RUMORS.push({t:'In het zuidoosten, aan de zee, ligt Zilverhaven: de grootste handelsstad van het land, met een haven vol schepen.'});

/* ---------- building ---------- */
const CITY={};WD.city=CITY;
function bag(){const L=new Map();return{add(geo,mat,m){let g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);g.clearGroups();if(!L.has(mat))L.set(mat,[]);L.get(mat).push(g)},
  build(){for(const [mat,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const g of mg?[mg]:gs){const me=new T.Mesh(g,mat);me.castShadow=me.receiveShadow=true;scene.add(me)}}}}}
const MX=(x,y,z,ry=0,sx=1,sy=1,sz=1,rx=0,rz=0)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
const DECK=[];   /* walkable decks of the harbour: oriented rectangles */
function buildCity(){const B=bag(),st=MAT.stone,roof=new T.MeshStandardMaterial({map:TEX.tile,color:0xc06a4a,roughness:.8}),wood=MAT.wood,y0=x=>x;
  const gy=(x,z)=>groundH(x,z);
  /* --- walls, towers and gates --- */
  const wallSeg=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/6)),dx=(x1-x0)/L,dz=(z1-z0)/L,ry=Math.atan2(-dz,dx);
    for(let i=0;i<n;i++){const a=i*L/n,b=(i+1)*L/n,m=(a+b)/2,x=x0+dx*m,z=z0+dz*m,y=gy(x,z),l=b-a+.05;B.add(boxGeo(l,11,2.6,4),st,MX(x,y+4,z,ry));B.add(boxGeo(l,.4,3.2,4),st,MX(x,y+9.6,z,ry));
      for(let k=0;k<Math.floor(l/2.2);k++){const t=a+(k+.5)*l/Math.floor(l/2.2),xx=x0+dx*t,zz=z0+dz*t;for(const s of[-1,1])B.add(boxGeo(1.2,1.4,.7),st,MX(xx-dz*s*1.25,y+10.5,zz+dx*s*1.25,ry))}
      for(let t=a;t<=b;t+=2)addCircle(x0+dx*t,z0+dz*t,1.6)}};
  const tower=(x,z,r=3.6,h=15)=>{const y=gy(x,z);B.add(new T.CylinderGeometry(r,r*1.1,h+3,14),st,MX(x,y+h/2-1.5,z));B.add(new T.CylinderGeometry(r+.6,r,1.2,14),st,MX(x,y+h+.6,z));B.add(new T.ConeGeometry(r+1,r*2.2,14),roof,MX(x,y+h+1.2+r*1.1,z));addCircle(x,z,r+.4);
    for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;B.add(boxGeo(.5,1.4,.3),MAT.dark,MX(x+Math.sin(a)*r*1.02,y+h*.6,z+Math.cos(a)*r*1.02,a))}};
  const X0=C.x-HW,X1=C.x+HW,Z0=C.z-HW,Z1=C.z+HW,g=7;
  wallSeg(X0,Z0,C.x-g,Z0);wallSeg(C.x+g,Z0,X1,Z0);            /* north, gate in the middle */
  wallSeg(X0,Z0,X0,C.z-g);wallSeg(X0,C.z+g,X0,Z1);            /* west, gate in the middle */
  wallSeg(X1,Z0,X1,C.z-g);wallSeg(X1,C.z+g,X1,C.z+24);        /* east, gate; then the harbour opens */
  wallSeg(X0,Z1,C.x+24,Z1);                                    /* south */
  for(const [x,z] of[[X0,Z0],[X1,Z0],[X0,Z1],[C.x,Z0-0],[X0,C.z],[X1,C.z+24],[C.x+24,Z1],[X1,C.z-40],[C.x-40,Z0],[X0,C.z+40],[C.x-40,Z1]])tower(x,z);
  for(const [x,z,ry] of[[C.x,Z0,0],[X0,C.z,Math.PI/2],[X1,C.z,Math.PI/2]]){const fx=Math.cos(ry),fz=-Math.sin(ry),y=gy(x,z);for(const s of[-1,1])tower(x+fx*s*(g+2.5),z+fz*s*(g+2.5),3.4,17);B.add(boxGeo(2*g+3,3.2,3.4,4),st,MX(x,y+12.4,z,ry));
    for(let k=-3;k<=3;k++)B.add(boxGeo(1.2,1.4,.7),st,MX(x+fx*k*2.4,y+14.7,z+fz*k*2.4,ry))}
  /* --- the market square --- */
  try{asPave(C.x,C.z,22,22,'Floor_Brick')}catch(e){}
  {const y=gy(C.x,C.z);B.add(new T.CylinderGeometry(6,6.3,1,28),st,MX(C.x,y+.5,C.z));const w=new T.Mesh(new T.CircleGeometry(5.6,28),new T.MeshStandardMaterial({color:0x3a7aa8,roughness:.05,metalness:.3,transparent:true,opacity:.85}));w.rotation.x=-Math.PI/2;w.position.set(C.x,y+.95,C.z);scene.add(w);
    B.add(new T.CylinderGeometry(.9,1.2,3.4,12),st,MX(C.x,y+2.4,C.z));B.add(new T.CylinderGeometry(2.4,1,.6,16),st,MX(C.x,y+4.2,C.z));B.add(new T.SphereGeometry(1,16,12),MAT.gold,MX(C.x,y+5.6,C.z));addCircle(C.x,C.z,6.4);CITY.fountain=[C.x,y+4.6,C.z]}
  /* bell tower */
  {const x=C.x+27,z=C.z-27,y=gy(x,z);B.add(boxGeo(7,26,7,4),st,MX(x,y+13,z));B.add(boxGeo(8,1,8,4),st,MX(x,y+26.5,z));for(const [a,b] of[[-3.2,-3.2],[3.2,-3.2],[-3.2,3.2],[3.2,3.2]])B.add(boxGeo(.9,6,.9),st,MX(x+a,y+30,z+b));
    B.add(new T.ConeGeometry(6.2,7,4),roof,MX(x,y+36.5,z,Math.PI/4));B.add(new T.CylinderGeometry(.8,1.5,2,12,1,true),MAT.gold,MX(x,y+29.4,z));const cl=new T.Mesh(new T.CircleGeometry(1.8,24),new T.MeshStandardMaterial({color:0xf0e8d0}));cl.position.set(x,y+21,z+3.52);scene.add(cl);
    for(const r of[0,Math.PI/2])B.add(boxGeo(.12,1.4,.05),MAT.dark,MX(x,y+21.4,z+3.56,0,1,1,1,0,r*.0+(r?1.2:0)));addCircle(x,z,4.6);CITY.bell=[x,y+29,z]}
  /* stalls around the square */
  const cols=[0xa82a22,0x2a5a9a,0xd8a83a,0x3a7a3a,0x7a3a8a,0xc85a2a,0x2a7a7a,0x9a2a5a];let si=0;
  for(const [x,z,rot] of[[-14,-19,0],[-4,-19,0],[8,-19,0],[-19,-8,1],[-19,6,1],[19,-6,3],[19,8,3],[-12,19,2],[2,19,2],[14,19,2]]){try{stall(C.x+x,C.z+z,rot,cols[si++%cols.length])}catch(e){}addCircle(C.x+x,C.z+z,1.6)}
  for(let i=0;i<10;i++){try{barrelW(C.x+rr(17),C.z+rr(17))}catch(e){}}
  /* --- houses along the streets --- */
  const HS=[];const house=(x,z,rot,o={})=>{try{const b=makeHouse({x,z,w:o.w||(Math.random()<.5?7:9),d:o.d||6,rot,style:o.style||pick(['stone','plaster','plaster','wood']),h:o.h||(Math.random()<.5?6.4:3.2),name:o.name||pick(['Koopmanshuis','Woonhuis','Herenhuis','Huis']),kind:o.kind||'home'});HS.push(b);return b}catch(e){console.warn('zilverhaven house',e)}};
  for(const z of[-31,-42,-53,-64]){house(C.x-12,C.z+z,1);house(C.x+12,C.z+z,3)}
  for(const x of[-31,-42,-53,-64]){house(C.x+x,C.z-12,0);house(C.x+x,C.z+12,2)}
  for(const x of[31,42,53,64])house(C.x+x,C.z-12,0);
  for(const z of[31,42,53,64])house(C.x-12,C.z+z,1);
  house(C.x+33,C.z+12,2,{w:14,d:8,h:3.2,style:'wood',name:'Pakhuis van de Zilvermeeuw',kind:'shop'});house(C.x+12,C.z+33,3,{w:14,d:8,h:3.2,style:'wood',name:'Pakhuis van de Oostzee',kind:'shop'});
  CITY.guild=house(C.x+44,C.z-44,0,{w:16,d:11,h:6.4,style:'stone',name:'Gildehuis der Kooplieden',kind:'hall'});
  CITY.inn=house(C.x-44,C.z-44,0,{w:13,d:9,h:6.4,style:'plaster',name:'Herberg De Gouden Schaal',kind:'inn'});
  CITY.bank=house(C.x-44,C.z+44,2,{w:12,d:9,h:6.4,style:'stone',name:'Wisselkantoor',kind:'shop'});
  /* banners along the main streets */
  try{if(WD.banner)for(const [x,z] of[[C.x-4.2,C.z-30],[C.x+4.2,C.z-30],[C.x-30,C.z-4.2],[C.x-30,C.z+4.2],[C.x+30,C.z-4.2]])WD.banner(x,z,'#c8a032','tower',0)}catch(e){}
  for(const [x,z] of[[C.x-4.5,C.z-48],[C.x+4.5,C.z-60],[C.x-48,C.z-4.5],[C.x-60,C.z+4.5],[C.x+48,C.z+4.5],[C.x+4.5,C.z+48],[C.x+22.5,C.z-4],[C.x-22.5,C.z+4]]){const y=gy(x,z);B.add(new T.CylinderGeometry(.09,.12,3.2,6),MAT.iron,MX(x,y+1.6,z));try{lamp(x,y+3.3,z)}catch(e){}addCircle(x,z,.3)}
  /* --- the harbour --- */
  buildHarbour(B,wood,st,roof);
  B.build();CITY.built=true}
function buildHarbour(B,wood,st,roof){const ux=Math.SQRT1_2,uz=Math.SQRT1_2;let e=null;for(let d=40;d<220;d+=1){const x=C.x+ux*d,z=C.z+uz*d;if(terrainH(x,z)<2.4){e={x,z,d};break}}if(!e)return;
  const tx=-uz,tz=ux,ry=Math.atan2(ux,uz),Q={x:e.x,z:e.z};CITY.quay=Q;clearHarbour(Q);
  /* the quay: a stone platform along the shore */
  const qy=Math.max(1.6,Math.min(3.4,terrainH(Q.x,Q.z)+.35)),QL=74;B.add(boxGeo(7,qy+3,QL,4),st,MX(Q.x,qy-(qy+3)/2,Q.z,ry+Math.PI/2));DECK.push({x:Q.x,z:Q.z,ax:tx,az:tz,hl:QL/2,hw:3.5,y:qy});
  for(let i=-QL/2;i<=QL/2;i+=3)B.add(boxGeo(.5,.6,.5),st,MX(Q.x+tx*i+ux*3.2,qy+.3,Q.z+tz*i+uz*3.2));
  /* the piers, and a merchant ship at each */
  CITY.ships=[];for(const off of[-24,0,24]){const px=Q.x+tx*off+ux*13,pz=Q.z+tz*off+uz*13,py=qy-.2;B.add(boxGeo(3.4,.3,20,3),wood,MX(px,py-.15,pz,ry));DECK.push({x:px,z:pz,ax:ux,az:uz,hl:10,hw:1.7,y:py});
    for(let k=-9;k<=9;k+=3)for(const s of[-1,1])B.add(new T.CylinderGeometry(.16,.16,py+4,6),wood,MX(px+ux*k+tx*s*1.6,py/2-2,pz+uz*k+tz*s*1.6));
    CITY.ships.push(ship(px+tx*6.2+ux*2,pz+tz*6.2+uz*2,ry,off===0))}
  /* treadwheel crane and goods on the quay */
  {const cx=Q.x+tx*12+ux*1,cz=Q.z+tz*12+uz*1,y=qy;for(const s of[-1,1])B.add(boxGeo(.4,6,.4),wood,MX(cx+tx*s*1.4,y+3,cz+tz*s*1.4,ry));const wh=new T.TorusGeometry(2.4,.18,6,24);B.add(wh,wood,MX(cx,y+3,cz,ry+Math.PI/2));
    for(let i=0;i<8;i++)B.add(boxGeo(.12,4.6,.12),wood,MX(cx,y+3,cz,ry+Math.PI/2,1,1,1,0,i*Math.PI/8));B.add(boxGeo(.4,.4,9),wood,MX(cx+ux*3.4,y+6.6,cz+uz*3.4,ry,1,1,1,-.35,0));
    B.add(boxGeo(1.2,1,1.2),wood,MX(cx+ux*7.6,y+2.6,cz+uz*7.6,ry))}
  for(let i=0;i<14;i++){const t=rr(QL/2-4),x=Q.x+tx*t+ux*rr(2),z=Q.z+tz*t+uz*rr(2);try{asPropW(pick(['Crate_Wooden','Barrel','Crate_Wooden','Bag']),x,z,rr(3),1)}catch(e){}}
  for(const t of[-30,-12,12,30]){const x=Q.x+tx*t-ux*2.6,z=Q.z+tz*t-uz*2.6;B.add(new T.CylinderGeometry(.09,.12,3.2,6),MAT.iron,MX(x,qy+1.6,z));try{lamp(x,qy+3.3,z)}catch(e){}}
  HIDDEN.push({id:'zh_harbour',name:'Haven van Zilverhaven',x:Q.x,z:Q.z,found:false});MAPICON.zh_harbour='⛵'}
/* no forest between the city and the quay */
function clearHarbour(Q){const segD=(x,z)=>{const ax=C.x+20,az=C.z+20,dx=Q.x-ax,dz=Q.z-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz))),qx=ax+dx*t,qz=az+dz*t;return Math.hypot(x-qx,z-qz)};
  const gone=(x,z)=>Math.hypot(x-Q.x,z-Q.z)<46||segD(x,z)<26;
  for(const t of TREES.oak.concat(TREES.pine))if(!t.cut&&gone(t.x,t.z)){t.cut=true;t.gone=true;if(t.col)t.col.off=true;try{if(t.lodM)asLow(t,false);else setInst(t.ii||[],false,[])}catch(e){}}
  for(const q of ROCKS)if(!q.cut&&gone(q.x,q.z)){q.cut=true;if(q.col)q.col.off=true;try{q.inst.setMatrixAt(q.i,new T.Matrix4().makeScale(0,0,0));q.inst.instanceMatrix.needsUpdate=true}catch(e){}}
  try{asTreesUpdate(true)}catch(e){}}
/* a merchant cog: hull, castle at the stern, mast with a big square sail */
let sailT=null;
function ship(x,z,ry,big){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);const L=big?16:13,W=big?5:4.2,hull=new T.MeshStandardMaterial({map:TEX.wood,color:0x8a5a3a,roughness:.8});
  const s=new T.Shape();s.moveTo(0,L/2);s.quadraticCurveTo(W*.55,L*.3,W/2,0);s.lineTo(W/2,-L/2+1);s.quadraticCurveTo(W/2,-L/2,0,-L/2);s.quadraticCurveTo(-W/2,-L/2,-W/2,-L/2+1);s.lineTo(-W/2,0);s.quadraticCurveTo(-W*.55,L*.3,0,L/2);
  const hg=new T.ExtrudeGeometry(s,{depth:2.6,bevelEnabled:false});hg.rotateX(-Math.PI/2);hg.translate(0,-1,0);const hm=new T.Mesh(hg,hull);hm.scale.set(1,1,1);g.add(hm);
  g.add(mesh(new T.BoxGeometry(W*.9,1.6,3.2),hull,0,2.3,-L/2+2.2));g.add(mesh(new T.CylinderGeometry(.22,.3,big?15:12,8),MAT.wood,0,(big?15:12)/2+1.4,1));g.add(mesh(new T.BoxGeometry(W*1.6,.25,.25),MAT.wood,0,(big?13:10.5),1));
  if(!sailT)sailT=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#efe4cc';c.fillRect(0,0,w,h);c.fillStyle='#a82a22';for(let i=0;i<w;i+=32)c.fillRect(i,0,16,h);c.fillStyle='#c8a032';c.beginPath();c.arc(64,64,22,0,6.283);c.fill()});
  const sg=new T.PlaneGeometry(W*1.5,big?8:6.5,8,6),p=sg.attributes.position;for(let i=0;i<p.count;i++){const xx=p.getX(i)/(W*.75);p.setZ(i,(1-xx*xx)*.9)}sg.computeVertexNormals();const sail=new T.Mesh(sg,new T.MeshStandardMaterial({map:sailT,side:T.DoubleSide,roughness:.9}));sail.position.set(0,(big?13:10.5)-(big?4:3.25),1.25);g.add(sail);
  const fl=new T.Mesh(new T.PlaneGeometry(1.6,.9),new T.MeshStandardMaterial({color:0xc8a032,side:T.DoubleSide}));fl.position.set(.8,(big?15:12)+1.6,1);g.add(fl);g.userData.dyn=true;g.traverse(o=>{if(o.isMesh){o.castShadow=true}});return{g,ry,ph:Math.random()*6}}
/* harbour decks are walkable */
const _ghZ=groundH;groundH=function(x,z){let h=_ghZ(x,z);if(DECK.length&&Math.abs(x-C.x-90)<80&&Math.abs(z-C.z-90)<80)for(const d of DECK){const dx=x-d.x,dz=z-d.z,a=dx*d.ax+dz*d.az,b=dx*d.az-dz*d.ax;if(Math.abs(a)<d.hl&&Math.abs(b)<d.hw)h=Math.max(h,d.y)}return h};

/* ---------- the people of Zilverhaven ---------- */
function populateCity(){if(!CITY.built)return;const P=(x,z)=>[C.x+x,C.z+z],sp=(job,x,z,o)=>{try{return spawnNPC(job,C.x+x,C.z+z,{line:'zilverhaven',...o})}catch(e){console.warn('zh npc',e)}};
  sp('merchant',-14,-16,{name:'Specerijenhandelaar Zahir',ai:'stay',shop:['spice','silk','wine','apple','bread']});
  sp('merchant',-4,-16,{name:'Juwelier Ophelia',ai:'stay',shop:['ring_gold','amu_life','amu_wise','amu_stone','gem','pearl']});
  sp('smith',8,-16,{name:'Wapenhandelaar Gunther',ai:'stay',shop:WEAPONS_HIGH.concat(WEAPONS_KNIGHT||[])});
  sp('merchant',-16,-8,{name:'Pantsersmid Hilde',ai:'stay',shop:['chain','plate','helm_iron','boots_iron','shield_kite','shield_heater','shield_tower']});
  sp('merchant',-16,6,{name:'Alchemist Mirella',ai:'stay',shop:['potion','elixir','wine']});
  sp('merchant',16,-6,{name:'Lakenhandelaar Pieter',ai:'stay',shop:['cloak_blue','silk','travel','merchant','noble']});
  sp('merchant',16,8,{name:'Visvrouw Grietje',ai:'stay',shop:['fish','bread','cheese','stew']});
  sp('lord',C.guild?44-C.x+C.guild.x:44,-38,{name:'Handelsprinses Isolde',ai:'stay'});
  sp('innkeeper',-44,-40,{name:'Waard Hendrik',ai:'stay',shop:typeof FOOD!=='undefined'?FOOD:['bread','stew']});
  for(let i=0;i<16;i++){const a=Math.random()*6.283,r=10+Math.random()*55;sp('villager',Math.cos(a)*r,Math.sin(a)*r,{roam:{x:C.x,z:C.z},radius:60})}
  const pat=[P(-60,-3),P(60,-3),P(3,-60),P(3,60)];for(let i=0;i<6;i++)sp('guard',rr(30),rr(30),{name:'Stadswacht van Zilverhaven',ai:'guard',patrol:pat,livery:0x7a1f2a});
  if(CITY.quay){const Q=CITY.quay;for(let i=0;i<4;i++){try{spawnNPC('villager',Q.x+rr(14),Q.z+rr(14),{name:pick(['Matroos Joris','Matroos Bas','Stuurvrouw Anouk','Matroos Kees']),line:'zilverhaven',roam:{x:Q.x,z:Q.z},radius:12})}catch(e){}}
    try{spawnNPC('villager',Q.x,Q.z,{name:'Havenmeester Klaas',ai:'stay',line:'zilverhaven'})}catch(e){}}
  try{makeChest(C.x-48,C.z+40,'zh_bank',0,'Kluis van het Wisselkantoor')}catch(e){}}
Object.assign(CHEST_LOOT,{zh_bank:{gold:1200,items:[['ring_gold',1],['gem',4],['silk',3]]}});

/* ---------- life in the city: the fountain, the bell, the ships, and a welcome ---------- */
let bellT=0;
ANIMS.push(dt=>{if(!CITY.built)return;const d=Math.hypot(PL.x-C.x,PL.z-C.z);if(d>420||PL.inCave)return;const t=PL.t;
  for(const s of CITY.ships||[]){s.g.position.y=Math.sin(t*.8+s.ph)*.15-.2;s.g.rotation.set(Math.sin(t*.6+s.ph)*.025,s.ry,Math.sin(t*.7+s.ph)*.04)}
  if(d<160&&window.PW&&PW.ps&&CITY.fountain&&Math.random()<dt*25){const [x,y,z]=CITY.fountain;pwEm(PW.ps,x+rr(.3),y,z+rr(.3),rr(1.2),2.5+Math.random(),rr(1.2),.9,.18,.04,[.7,.85,1],[.4,.6,.9],.7,-9,1)}
  const hr=Math.floor(ENV.time);if(hr!==bellT){bellT=hr;if(d<160)try{sfx('quest')}catch(e){}}
  if(!PL.fx)return;if(!PL.fx.seenZilver&&d<95){PL.fx.seenZilver=1;giveXp(150);addLog('Je komt aan in Zilverhaven, de grote handelsstad aan de zee!','#e0b04a');
    if(window.cinematic&&!CIN.on){const V=(a,b,c)=>new T.Vector3(a,b,c),y=groundH(C.x,C.z);cinematic([{d:3.4,from:V(C.x-120,y+60,C.z-90),to:V(C.x-50,y+38,C.z-40),lf:V(C.x,y+6,C.z),lt:V(C.x+20,y+6,C.z+20)},
      {d:3.2,from:V(C.x+40,y+22,C.z-10),to:V(C.x+110,y+14,C.z+50),lf:V(C.x+80,y+2,C.z+80),lt:V(C.x+100,y+2,C.z+100)}],'Zilverhaven','De grote handelsstad aan de zee')}}});

const _bfZ=buildFantasy;buildFantasy=function(){_bfZ();try{buildCity()}catch(e){console.warn('zilverhaven',e)}};
const _pfZ=populateFantasy;populateFantasy=function(){_pfZ();try{populateCity()}catch(e){console.warn('zilverhaven pop',e)}};
})();
