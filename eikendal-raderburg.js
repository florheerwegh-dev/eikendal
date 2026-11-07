/* ================= Raderland and Raderburg, the town of machines =================
   Far in the east, beyond the coast of the Oostland, lies Raderland: a long green land with mountains in the north.
   You walk there over De Oostdijk, a dike of sand and stone that starts by the Klooster Sint-Benedictus.
   (Everything west of x -2000 belongs to the caves, so the new land lies in the east.) Its town is Raderburg, where inventors
   build machines: a great clock tower, a factory whose gears turn and whose chimneys smoke, an airship moored at its
   mast (it flies you to the great cities), a steam tram that goes round the square, a weather machine, a shop full of
   gadgets (steam boots, rocket boots, a clockwork heart, a compass that points to undiscovered places, a clockwork
   owl) and the Tijdlab of Professor Tijdwijzer, where the time machine stands. It takes you back to the age of the
   dinosaurs. Around Raderburg: a fossil pit where you can dig, an observatory with a great telescope, a field of
   windmills, a fallen iron giant, and a ghost ship wrecked on the west coast. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,GL=WD.great||(WD.great={});
/* ---------- the land ---------- */
const WC={x:2280,z:40,rx:290,rz:1180};
function westK(x,z){const dx=(x-WC.x)/WC.rx,dz=(z-WC.z)/WC.rz,e=Math.hypot(dx,dz),n=(fbm(x*.004+11,z*.004-5,3)-.5)*.5+(fbm(x*.012,z*.012,2)-.5)*.16;return 1-smooth(-.08,.16,e-1+n)}
function westLand(x,z){let h=(fbm(x*.003-21,z*.003+44,5)-.5)*30+12;const north=smooth(-350,-850,z),rg=1-Math.abs(fbm(x*.004+3,z*.004-9,4)*2-1);return h+north*(30+rg*rg*110)}
GL.westH=(x,z,h)=>{const k=westK(x,z);return k<=0?h:lerp(h,westLand(x,z),k)};
/* two big islands far out at sea (reach them by boat): a treasure island of pirates, and an island of glowing crystals */
if(GL.isl)GL.isl.push([1250,2050,120],[-1000,2160,110]);
/* ---------- places ---------- */
const PL_={raderburg:{n:'Raderburg',x:2260,z:140,r:105,ico:'⚙️'},fossiel:{n:'De Fossielenkuil',x:2300,z:-420,r:40,ico:'🦴'},sterren:{n:'Sterrenwacht Kijkuit',x:2350,z:-700,r:24,ico:'🔭'},
  molens:{n:'Het Molenveld',x:2240,z:620,r:62,ico:'🌬️'},schat:{n:'Schateiland',x:1250,z:2050,r:46,ico:'🏝️'},kristal:{n:'Kristaleiland',x:-1000,z:2160,r:44,ico:'💎'},wrak:{n:'Het Spookschip',x:2520,z:300,r:34,ico:'🏴‍☠️'},reus:{n:'De Houten Reus',x:2170,z:-180,r:34,ico:'🤖'}};
const autoH=(x,z,r)=>{let s=0,n=0;for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){s+=baseH(x+i*r*.4,z+j*r*.4);n++}return Math.max(2.6,s/n)};
for(const [id,p] of Object.entries(PL_)){SITES.push(SITE[id]={id,name:p.n,x:p.x,z:p.z,r:p.r,h:autoH(p.x,p.z,p.r),blend:1.6,great:true});MAPICON[id]=p.ico}
for(const pts of[[[1612,-28],[1700,-10],[1820,30],[1940,80],[2060,120],[2160,140],[2260,140]],
  [[2260,140],[2260,40],[2280,-150],[2300,-420],[2330,-560],[2350,-700]],[[2280,-150],[2170,-180]],
  [[2260,140],[2260,240],[2250,420],[2240,620]],[[2260,140],[2380,180],[2470,260],[2520,300]]])ROADS.push({w:2.4,pts,great:true});
WAYDEF.push(['raderburg','Reissteen Raderburg',2274,262]);
RUMORS.push({t:'Ver in het oosten, over De Oostdijk bij het klooster, ligt Raderburg: een stad vol machines. Ze zeggen dat professor Tijdwijzer daar een machine heeft gebouwd die door de tijd reist!'},
  {t:'Een visser zag ooit een schip met gescheurde zeilen op de oostkust van Raderland liggen. Er spookt iets, zegt hij.'});
Object.assign(LINES,{raderburg:['Hoor je dat getik? Dat is de grote klok. Die loopt nooit achter.','In de fabriek maken ze tandwielen zo groot als een huis.','Het luchtschip vertrekt elk uur. Nou ja, als de motor wil.',
  'Professor Tijdwijzer zegt dat hij in de tijd kan reizen. Ik geloof er niks van... of toch?','Met de weermachine kun je regen bestellen. Handig voor de boeren!','Pas op voor de stoomtram, hij stopt voor niemand.']});
/* ---------- gadgets ---------- */
Object.assign(ITEMS,{
  stoomlaarzen:{n:'Stoomlaarzen',g:'boots',def:2,fx:{spd:.28},price:1400,ico:'👢',rar:'e',desc:'Kleine stoommachines in de hakken: je loopt veel sneller.'},
  raketlaarzen:{n:'Raketlaarzen',g:'boots',def:1,fx:{jump:.9,spd:.08},price:1700,ico:'🚀',rar:'e',desc:'Raketjes onder je zolen: je springt huizenhoog.'},
  klokhart:{n:'Klokwerkhart',g:'amulet',fx:{hp:60,regen:1.6},col:0xd8a83a,price:2200,ico:'⚙',rar:'l',desc:'Een tikkend hart van messing: je herstelt snel.'},
  kompas:{n:'Kompas van Raderburg',g:'tool',price:450,ico:'🧭',rar:'r',desc:'Wijst altijd naar de dichtstbijzijnde plaats die je nog niet hebt ontdekt.'},
  klokuil:{n:'Klokwerkuil',g:'tool',price:900,ico:'🦉',rar:'e',desc:'Een mechanische uil die met je meevliegt.'},
  fossiel:{n:'Fossiel',g:'mat',price:120,ico:'🐚',rar:'r'},barnsteen:{n:'Barnsteen met een mug',g:'mat',price:260,ico:'🟠',rar:'e'}});
/* ---------- building helpers ---------- */
function bag(){const L=new Map();return{add(geo,mat,m){let g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);g.clearGroups();if(!L.has(mat))L.set(mat,[]);L.get(mat).push(g)},
  build(){for(const [mat,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const g of mg?[mg]:gs){const me=new T.Mesh(g,mat);me.castShadow=me.receiveShadow=true;scene.add(me)}}}}}
const MX=(x,y,z,ry=0,sx=1,sy=1,sz=1,rx=0,rz=0)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
const gy=(x,z)=>groundH(x,z),std=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.7,...o});
let M=null;function mats(){return M||(M={brick:std(0x8a4a32,{map:MAT.stone&&MAT.stone.map||null}),brass:std(0xc9a040,{metalness:.85,roughness:.32}),copper:std(0x5f9a86,{metalness:.5,roughness:.45}),iron:std(0x3a3a40,{metalness:.7,roughness:.45}),
  wood:MAT.wood,slate:std(0x3c4250),glow:new T.MeshBasicMaterial({color:0x7ad8ff}),glowO:new T.MeshBasicMaterial({color:0xffb050}),cloth:std(0xc8b48a,{side:T.DoubleSide}),bone:std(0xe8dcc0,{roughness:.9}),dark:std(0x1a1614),
  face:std(0xf2ead8,{roughness:.5}),hull:std(0x4a3626,{roughness:.9}),sail:std(0x8a8678,{side:T.DoubleSide,transparent:true,opacity:.85})})}
const MOV=[];   /* things that move: gears, clock hands, rings, the airship, the tram, windmill sails */
function gear(r,teeth,th,mat){const g=new T.Group();g.add(mesh(new T.CylinderGeometry(r,r,th,24),mat,0,0,0));for(let i=0;i<teeth;i++){const a=i/teeth*6.283,t=mesh(new T.BoxGeometry(r*.28,th,r*.22),mat,Math.cos(a)*r*1.08,0,Math.sin(a)*r*1.08);t.rotation.y=-a;g.add(t)}
  g.add(mesh(new T.CylinderGeometry(r*.25,r*.25,th*1.4,12),mats().iron,0,0,0));g.children.forEach(c=>c.rotation.x=c.rotation.x);return g}
/* ---------- Raderburg ---------- */
const RB={};GL.rader=RB;
function buildRaderburg(){const m=mats(),B=bag(),S=SITE.raderburg,C={x:S.x,z:S.z},y0=gy(C.x,C.z);
  try{asPave(C.x,C.z,22,22,'Floor_Brick')}catch(e){}
  /* the clock tower in the middle of the square */
  {const x=C.x,z=C.z,y=gy(x,z);B.add(boxGeo(9,34,9,4),m.brick,MX(x,y+17,z));B.add(boxGeo(10.4,1.2,10.4,4),m.iron,MX(x,y+34.6,z));B.add(new T.ConeGeometry(7.6,10,4),m.copper,MX(x,y+40.2,z,Math.PI/4));B.add(new T.SphereGeometry(.7,10,8),m.brass,MX(x,y+45.6,z));addBox(x-4.7,z-4.7,x+4.7,z+4.7);
    RB.hands=[];for(let k=0;k<4;k++){const a=k*Math.PI/2,fx=Math.sin(a),fz=Math.cos(a),cx=x+fx*4.56,cz=z+fz*4.56;const face=new T.Mesh(new T.CircleGeometry(3,32),m.face);face.position.set(cx,y+27,cz);face.rotation.y=a;scene.add(face);
      const rim=new T.Mesh(new T.TorusGeometry(3.05,.18,8,32),m.brass);rim.position.set(cx+fx*.02,y+27,cz+fz*.02);rim.rotation.y=a;scene.add(rim);
      for(const [len,w,kind] of[[2.4,.18,'m'],[1.6,.28,'h']]){const pv=new T.Group();pv.position.set(cx+fx*.08,y+27,cz+fz*.08);pv.rotation.y=a;const hand=mesh(new T.BoxGeometry(w,len,.06),m.dark,0,len/2,0);pv.add(hand);scene.add(pv);RB.hands.push({pv,kind})}}}
  /* the factory with gears and smoking chimneys */
  {const x=C.x+46,z=C.z-40,y=gy(x,z);B.add(boxGeo(32,13,18,4),m.brick,MX(x,y+6.5,z));B.add(boxGeo(33,1,19,4),m.iron,MX(x,y+13.4,z));for(let i=-1;i<=1;i++)B.add(new T.ConeGeometry(4.2,3.4,4),m.slate,MX(x+i*10.4,y+15.6,z,Math.PI/4,1.4,1,2.1));
    RB.chim=[];for(const dx of[-11,0,11]){const cx=x+dx,cz=z-4;B.add(new T.CylinderGeometry(1.1,1.5,16,10),m.brick,MX(cx,y+21,cz));B.add(new T.CylinderGeometry(1.4,1.2,1,10),m.iron,MX(cx,y+29.4,cz));RB.chim.push([cx,y+30,cz])}
    for(const [dx,r,sp] of[[-8,3.4,.6],[-2.2,2.1,-1],[5,3.8,.5]]){const g=gear(r,14,.6,m.brass);g.rotation.x=Math.PI/2;g.position.set(x+dx,y+7.5,z+9.4);scene.add(g);MOV.push({o:g,t:'gear',sp})}
    addBox(x-16,z-9,x+16,z+9);B.add(boxGeo(5,6,.4),m.dark,MX(x,y+3,z+9.1))}
  /* the Tijdlab: a domed hall, and the time machine in its courtyard */
  {const x=C.x-44,z=C.z-42,y=gy(x,z);B.add(new T.CylinderGeometry(10,10.5,10,24),m.brick,MX(x,y+5,z));B.add(new T.SphereGeometry(10.4,24,14,0,6.283,0,Math.PI/2),m.copper,MX(x,y+10,z));B.add(new T.CylinderGeometry(1.4,1.4,4,10),m.brass,MX(x,y+21.6,z));addCircle(x,z,10.6);
    const mx=x+2,mz=z+22,my=gy(mx,mz);RB.tm={x:mx,z:mz};B.add(new T.CylinderGeometry(5.2,5.8,.8,32),m.iron,MX(mx,my+.4,mz));B.add(new T.CylinderGeometry(4.4,4.4,.2,32),m.brass,MX(mx,my+.9,mz));
    const core=new T.Mesh(new T.SphereGeometry(1.1,20,14),m.glow);core.position.set(mx,my+3.2,mz);scene.add(core);MOV.push({o:core,t:'pulse'});
    for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(2.4+i*.7,.16,10,48),m.brass);ring.position.set(mx,my+3.2,mz);scene.add(ring);MOV.push({o:ring,t:'ring',ax:i,sp:.6+i*.35})}
    for(let k=0;k<4;k++){const a=k*Math.PI/2+.78;B.add(new T.CylinderGeometry(.22,.3,5.4,8),m.iron,MX(mx+Math.cos(a)*4.6,my+3.4,mz+Math.sin(a)*4.6));B.add(new T.SphereGeometry(.42,10,8),m.brass,MX(mx+Math.cos(a)*4.6,my+6.2,mz+Math.sin(a)*4.6))}
    addCircle(mx,mz,1.4);B.add(boxGeo(3.6,1.1,1.2),m.wood,MX(mx+6.5,my+.55,mz+2.5));}
  /* the airship mast and its airship */
  {const x=C.x+52,z=C.z+46,y=gy(x,z);for(const [a,b] of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])B.add(boxGeo(.4,26,.4),m.iron,MX(x+a*(1-.0),y+13,z+b));for(let k=0;k<6;k++)B.add(boxGeo(3.6,.25,3.6),m.iron,MX(x,y+3+k*4.4,z));addBox(x-2,z-2,x+2,z+2);
    const ship=new T.Group();const bal=mesh(new T.SphereGeometry(4,24,16),m.cloth,0,0,0);bal.scale.set(1,1,2.6);ship.add(bal);for(let i=-2;i<=2;i++){const rib=new T.Mesh(new T.TorusGeometry(4.02,.08,6,32),m.brass);rib.scale.set(1,1,1);rib.position.z=i*3.6;rib.scale.setScalar(Math.sqrt(1-(i*3.6/10.4)**2));ship.add(rib)}
    const gon=mesh(new T.BoxGeometry(2.6,1.6,7),m.hull,0,-5.6,0);ship.add(gon);for(const s of[-1,1])ship.add(mesh(new T.CylinderGeometry(.05,.05,2.2,4),m.iron,s*1.1,-4.3,0));const prop=new T.Group();prop.position.set(0,-5.4,-4.2);for(let k=0;k<3;k++){const bl=mesh(new T.BoxGeometry(.3,2.4,.08),m.wood,0,0,0);bl.rotation.z=k*2.09;prop.add(bl)}ship.add(prop);
    for(const s of[-1,1]){const fin=mesh(new T.BoxGeometry(.12,3,3),m.cloth,s*2.8,0,-8.5);ship.add(fin)}
    ship.position.set(x,y+27,z-10);scene.add(ship);MOV.push({o:ship,t:'ship',y:y+27,prop});RB.mast={x,z}}
  /* the steam tram: rails round the square and a little tram car */
  {const R=34,y=y0;for(let i=0;i<64;i++){const a=i/64*6.283;for(const rr2 of[R-.7,R+.7])B.add(boxGeo(.12,.1,3.4),m.iron,MX(C.x+Math.cos(a)*rr2,gy(C.x+Math.cos(a)*rr2,C.z+Math.sin(a)*rr2)+.08,C.z+Math.sin(a)*rr2,-a))}
    const tram=new T.Group();tram.add(mesh(new T.BoxGeometry(2.2,2.2,5),std(0x7a2a22),0,1.5,0));tram.add(mesh(new T.BoxGeometry(2.4,.2,5.4),m.brass,0,2.7,0));tram.add(mesh(new T.CylinderGeometry(.35,.4,1.4,10),m.iron,0,3.4,1.6));
    for(const s of[-1,1])for(const t of[-1.6,1.6]){const w=mesh(new T.CylinderGeometry(.42,.42,.2,12),m.iron,s*1.05,.42,t);w.rotation.z=Math.PI/2;tram.add(w)}
    for(const s of[-1,1])for(let k=-1;k<=1;k++){const w=mesh(new T.PlaneGeometry(.8,.7),m.glowO,s*1.11,1.9,k*1.4);w.rotation.y=s*Math.PI/2;tram.add(w)}scene.add(tram);MOV.push({o:tram,t:'tram',R,a:0});RB.tram=tram}
  /* the weather machine */
  {const x=C.x-36,z=C.z+30,y=gy(x,z);B.add(boxGeo(5,3,5,4),m.iron,MX(x,y+1.5,z));B.add(new T.CylinderGeometry(.3,.4,7,8),m.brass,MX(x,y+6.5,z));const dish=new T.Mesh(new T.SphereGeometry(2.6,20,10,0,6.283,0,1.1),m.brass);dish.rotation.x=Math.PI;dish.position.set(x,y+11.2,z);dish.material=m.brass;scene.add(dish);MOV.push({o:dish,t:'dish'});
    for(let k=0;k<3;k++)B.add(new T.TorusGeometry(.9,.12,6,16),m.copper,MX(x,y+4.5+k*1.2,z,0,1,1,1,Math.PI/2));addBox(x-2.6,z-2.6,x+2.6,z+2.6);RB.wx={x,z}}
  /* houses and workshops of brick and slate */
  const hs=[];const H=(x,z,rot,o)=>{try{const b=makeHouse({x,z,rot,w:o&&o.w||8.5,d:o&&o.d||7,h:o&&o.h||6.4,style:'stone',roof:'tile',name:o&&o.name||pick(['Werkplaats','Woonhuis','Uitvinderswoning','Smederij van tandwielen']),kind:o&&o.kind||'home'});if(b&&b.roof&&b.roof.children[0])b.roof.children[0].material=m.slate;hs.push(b);return b}catch(e){console.warn('raderburg house',e)}};
  RB.shop=H(C.x-20,C.z+58,2,{w:12,d:9,kind:'shop',name:'Uitvinderij Tandwiel & Zonen'});RB.inn=H(C.x+22,C.z+58,2,{w:13,d:9,kind:'inn',name:'Herberg De Stoomketel'});
  for(const [x,z,rot] of[[-60,-4,1],[-60,14,1],[-60,-22,1],[60,6,3],[60,22,3],[0,-62,0],[-20,-62,0],[20,-64,0],[-40,60,2],[40,62,2],[-70,40,1],[70,-10,3]])H(C.x+x,C.z+z,rot);
  RB.homes=hs.filter(b=>b.kind==='home');
  for(const [x,z] of[[-14,-14],[14,-14],[-14,14],[14,14],[0,-24],[0,24],[-24,0],[24,0]]){try{lampPost(C.x+x,C.z+z,4)}catch(e){}}
  B.build();RB.built=true}
/* ---------- the places around ---------- */
function buildPlaces(){const m=mats(),B=bag();
  /* fossil pit: a dug-out pit with the skeleton of a great dinosaur */
  {const S=SITE.fossiel,x=S.x,z=S.z,y=gy(x,z);const pit=new T.Mesh(new T.CircleGeometry(16,32),std(0x8a7458,{roughness:1}));pit.rotation.x=-Math.PI/2;pit.position.set(x,y+.05,z);scene.add(pit);
    for(let i=0;i<14;i++){const t=i/13,sx=x-11+t*22,sy=y+2.4+Math.sin(t*Math.PI)*1.6;B.add(new T.SphereGeometry(.42-.02*Math.abs(i-6),8,6),m.bone,MX(sx,sy,z));if(i>2&&i<11)for(const s of[-1,1])B.add(new T.TorusGeometry(1.2,.08,5,12,Math.PI),m.bone,MX(sx,sy-.2,z,Math.PI/2,1,1.2,1,0,s>0?0:Math.PI))}
    B.add(boxGeo(1.6,.9,.9),m.bone,MX(x+12,y+2.8,z));for(const dx of[-6,-3.5,4,6.5])B.add(new T.CylinderGeometry(.18,.12,2.6,6),m.bone,MX(x+dx,y+1.2,z+(dx>0?.6:-.6)));
    for(let i=0;i<8;i++){try{crate(x+rr(14),z+rr(14),.8)}catch(e){}}addInter(x,z+4,8,'Graaf naar fossielen',dig);RB.fos={x,z}}
  /* observatory: a white dome with a great telescope */
  {const S=SITE.sterren,x=S.x,z=S.z,y=gy(x,z);B.add(new T.CylinderGeometry(6,6.4,7,24),std(0xe8e4dc),MX(x,y+3.5,z));B.add(new T.SphereGeometry(6.2,24,12,0,6.283,0,Math.PI/2),std(0xd0d4dc,{metalness:.4}),MX(x,y+7,z));
    const tel=mesh(new T.CylinderGeometry(.7,1,9,14),m.brass,x+2,y+11.5,z-2);tel.rotation.x=-.7;scene.add(tel);addCircle(x,z,6.5);addInter(x,z+8,5,'Kijk door de grote telescoop',stargaze)}
  /* the field of windmills */
  {const S=SITE.molens;for(let i=0;i<6;i++){const a=i/6*6.283+.3,x=S.x+Math.cos(a)*40,z=S.z+Math.sin(a)*40,y=gy(x,z);B.add(new T.CylinderGeometry(1.6,2.4,13,10),std(0xe8e0d0),MX(x,y+6.5,z));B.add(new T.ConeGeometry(2.2,2.4,10),m.slate,MX(x,y+14.2,z));addCircle(x,z,2.4);
    const hub=new T.Group();hub.position.set(x,y+11.5,z);hub.rotation.y=Math.atan2(S.x-x,S.z-z);const rot=new T.Group();rot.position.z=2.2;hub.add(rot);for(let k=0;k<4;k++){const bl=new T.Group();bl.rotation.z=k*Math.PI/2;bl.add(mesh(new T.BoxGeometry(.25,7,.1),m.wood,0,3.6,0));bl.add(mesh(new T.PlaneGeometry(1.6,5.6),m.sail,.9,3.9,0));rot.add(bl)}scene.add(hub);MOV.push({o:rot,t:'mill',sp:.8+Math.random()*.5})}}
  /* the fallen wooden giant: see Eikenhart below */
  /* the ghost ship on the beach */
  {const S=SITE.wrak,x=S.x,z=S.z,y=gy(x,z);const g=new T.Group();g.position.set(x,y-.6,z);g.rotation.set(.18,.9,.12);g.add(mesh(new T.BoxGeometry(6,4,22),m.hull,0,1.6,0));g.add(mesh(new T.BoxGeometry(5,1.6,5),m.hull,0,4.2,-8));
    const mast=mesh(new T.CylinderGeometry(.25,.3,16,8),m.hull,0,9,2);mast.rotation.z=.25;g.add(mast);const sl=mesh(new T.PlaneGeometry(6,6),m.sail,1.5,11,2.2);sl.rotation.z=.25;g.add(sl);scene.add(g);addBox(x-8,z-8,x+8,z+8);
    try{makeChest(x+10,z+4,'rb_wreck',0,'Kist van de spookkapitein')}catch(e){}RB.wrak={x,z}}
  /* treasure island: palms, a pirate camp and a chest; crystal island: glowing crystals */
  {const S=SITE.schat,y=gy(S.x,S.z);for(let i=0;i<16;i++){const a=Math.random()*6.283,r=10+Math.random()*50,x=S.x+Math.cos(a)*r,z=S.z+Math.sin(a)*r;if(gy(x,z)<1)continue;const yy=gy(x,z);B.add(new T.CylinderGeometry(.22,.3,7,7),m.wood,MX(x,yy+3.5,z,0,1,1,1,rr(.2),rr(.2)));for(let k=0;k<7;k++){const g2=new T.PlaneGeometry(.8,3);g2.translate(0,1.5,0);B.add(g2,std(0x4f7f2c,{side:T.DoubleSide}),new T.Matrix4().compose(new T.Vector3(x,yy+7,z),new T.Quaternion().setFromEuler(new T.Euler(1.1,k/7*6.283,0,'YXZ')),new T.Vector3(1,1,1)))}addCircle(x,z,.4)}
    for(const [dx,dz] of[[-6,-4],[6,-5]]){if(window.medTent)medTent(S.x+dx,S.z+dz,{r:3,pal:[0xd8ccb0,0x2a2a2a,0x8a2a22],ry:Math.atan2(-dx,-dz)});else{B.add(new T.ConeGeometry(3,3.6,6),m.cloth,MX(S.x+dx,y+1.8,S.z+dz));addCircle(S.x+dx,S.z+dz,2.4)}}try{makeChest(S.x,S.z+6,'rb_treasure',0,'De verborgen schat')}catch(e){}}
  {const S=SITE.kristal,cm=[std(0x8ad8ff,{emissive:0x2a7aa8,emissiveIntensity:.9,metalness:.2,roughness:.15,transparent:true,opacity:.9}),std(0xd08aff,{emissive:0x7a2aa8,emissiveIntensity:.9,metalness:.2,roughness:.15,transparent:true,opacity:.9})];
    for(let i=0;i<34;i++){const a=Math.random()*6.283,r=4+Math.random()*44,x=S.x+Math.cos(a)*r,z=S.z+Math.sin(a)*r;if(gy(x,z)<1)continue;const h=2+Math.random()*7;B.add(new T.ConeGeometry(.6+h*.12,h,6),pick(cm),MX(x,gy(x,z)+h/2-.3,z,Math.random()*3,1,1,1,rr(.3),rr(.3)));if(h>4)addCircle(x,z,.6+h*.1)}}
  B.build()}
Object.assign(CHEST_LOOT,{rb_treasure:{gold:4000,items:[['gem',5],['pearl',3],['ring_gold',1]].filter(([id])=>ITEMS[id])}});
Object.assign(CHEST_LOOT,{rb_wreck:{gold:2200,items:[['pearl',4],['gem',3],['barnsteen',1]].filter(([id])=>ITEMS[id])}});
/* ---------- the people ---------- */
const sp=(job,x,z,o)=>{try{return spawnNPC(job,x,z,o)}catch(e){console.warn('raderburg npc',e)}};
function brass(a){if(!a||!a.h)return;const mt=mats().brass;a.h.g.traverse(o=>{if(o.isMesh&&!/eye/i.test(o.name||'')){const mm=mt.clone();if(o.isSkinnedMesh)mm.skinning=true;o.material=mm}})}
function populate(){const S=SITE.raderburg,C={x:S.x,z:S.z};
  if(RB.tm){const p=sp('hermit',RB.tm.x+7,RB.tm.z+3,{name:'Professor Tijdwijzer',ai:'stay',line:'raderburg'});if(p)p.face=-Math.PI/2}
  const shop=['stoomlaarzen','raketlaarzen','klokhart','kompas','klokuil'].filter(id=>ITEMS[id]);
  if(RB.shop)sp('merchant',RB.shop.counter[0],RB.shop.counter[1],{name:'Uitvinder Tandwiel',ai:'stay',line:'raderburg',shop});
  if(RB.inn)sp('innkeeper',RB.inn.counter[0],RB.inn.counter[1],{name:'Waardin Ketelaar',ai:'stay',line:'raderburg',shop:typeof FOOD!=='undefined'?FOOD.filter(id=>ITEMS[id]):['bread']});
  sp('merchant',C.x+16,C.z+20,{name:'Fossielenkoper Bram',ai:'stay',line:'raderburg',shop:['fossiel','barnsteen','dino_ei','trex_tand','raptorklauw'].filter(id=>ITEMS[id])});
  for(let i=0;i<18;i++){const a=Math.random()*6.283,r=8+Math.random()*60,b=sp('villager',C.x+Math.cos(a)*r,C.z+Math.sin(a)*r,{line:'raderburg',roam:{x:C.x,z:C.z},radius:70});if(b&&RB.homes&&RB.homes.length)b.homeB=pick(RB.homes)}
  for(let i=0;i<8;i++){const a=i/8*6.283,g=sp('guard',C.x+Math.cos(a)*30,C.z+Math.sin(a)*30,{name:'Klokwerkwacht',ai:'guard',livery:0xb08a3a,patrol:[[C.x+30,C.z],[C.x,C.z+30],[C.x-30,C.z],[C.x,C.z-30]]});if(g){g.hp=g.hpMax=420;g.dmg=34;setTimeout(()=>brass(g),50)}}
  {const S2=SITE.fossiel;sp('villager',S2.x+6,S2.z+10,{name:'Paleontologe Fenna',ai:'stay',line:'raderburg'})}
  {const S2=SITE.schat;for(let i=0;i<6;i++)try{spawnEnemy(i%2?'archer':'bandit',S2.x+rr(20),S2.z+rr(20),{name:'Piraat',hp:110,hpMax:110,dmg:15,xp:60})}catch(e){}try{spawnEnemy('bandit',S2.x,S2.z+2,{name:'Kapitein Zwartbaard de Tweede',hp:900,hpMax:900,dmg:30,xp:500,boss:'kapitein'})}catch(e){}}
  {const S2=SITE.kristal;for(let i=0;i<4;i++)try{spawnMonster('golem',S2.x+rr(26),S2.z+rr(26),{name:'Kristalgolem'})}catch(e){}}
  {const S2=SITE.wrak;for(let i=0;i<5;i++)try{spawnEnemy('skeleton',S2.x+rr(12),S2.z+rr(12),{name:'Spookpiraat',hp:120,hpMax:120,dmg:18,xp:70})}catch(e){}}
  addInter(RB.tm.x,RB.tm.z,6.5,'Reis met de tijdmachine naar de tijd van de dinosaurussen (300 goud)',()=>WD.dino&&WD.dino.travel());
  addInter(RB.mast.x,RB.mast.z,5,'Vlieg met het luchtschip (150 goud)',airship);
  addInter(RB.wx.x,RB.wx.z,5,'Gebruik de weermachine (80 goud)',weather)}
const _bfR=buildFantasy;buildFantasy=function(){_bfR();try{buildRaderburg()}catch(e){console.warn('raderburg',e)}try{buildPlaces()}catch(e){console.warn('westland places',e)}};
const _pfR=populateFantasy;populateFantasy=function(){_pfR();if(RB.built)try{populate()}catch(e){console.warn('raderburg people',e)}};
/* ---------- what the places do ---------- */
const card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}};
let digT=-1e9;
function dig(){if(PL.t-digT<45){addLog('De grond is hier al omgewoeld. Probeer het zo meteen opnieuw.');return}digT=PL.t;sfx('chop');const r=Math.random();
  const it=r<.08?'barnsteen':r<.16&&ITEMS.trex_tand?'trex_tand':'fossiel';giveItem(it,1);floatText(PL.x,PL.y+2.2,PL.z,ITEMS[it].n,'#e0b04a');giveXp(25)}
function stargaze(){if(!window.cinematic||CIN.on)return;const V=(a,b,c)=>new T.Vector3(a,b,c),S=SITE.sterren,y=gy(S.x,S.z);giveXp(60);
  cinematic([{d:5,from:V(S.x+2,y+14,S.z-2),to:V(S.x+2.2,y+14.4,S.z-2.4),lf:V(S.x+40,y+200,S.z-300),lt:V(S.x-60,y+240,S.z-280)}],'Door de telescoop','Je ziet de ringen van een verre planeet, en een komeet met een gouden staart.')}
function giant(){giveXp(40);card('🪵 De Houten Reus','Lang geleden bouwden de uitvinders van Raderburg een reus van eikenhout om de stad te beschermen: Eikenhart. Op een dag viel hij om en stond nooit meer op. Zijn hart van klokwerk tikt nog heel zacht... Vraag in Raderburg aan Uitvinder Tandwiel of Professor Tijdwijzer of ze hem kunnen herstellen.',null,12)}
function airship(){const L=Object.values(SITE).filter(s=>s.great&&!['fossiel','sterren','molens','wrak','reus','raderburg'].includes(s.id)&&PL.discovered[s.id]&&/^(aurelia|drakenstein|qadir|hoogmark|valdoria|rozendaal)$/.test(s.id));
  const opts=[['Eikendal',{x:20,z:40}],['Zilverhaven',{x:730,z:600}]].concat(L.map(s=>[s.name,{x:s.x,z:s.z+(s.r||60)*.9}]));
  card('🎈 Het luchtschip','Waar wil je heen? Een vlucht kost 150 goud. (Steden in de nieuwe landen verschijnen hier zodra je ze hebt ontdekt.)',opts.slice(0,6).map(([n,p])=>[n,()=>fly(n,p)]).concat([['Blijf hier',()=>{}]]))}
function fly(name,p){if(PL.gold<150){addLog('Een vlucht kost 150 goud.','#e5766a');return}PL.gold-=150;sfx('coin');if(PL.mounted)dismount();const V=(a,b,c)=>new T.Vector3(a,b,c),a0=V(PL.x,PL.y+30,PL.z),mid=V((PL.x+p.x)/2,320,(PL.z+p.z)/2),b0=V(p.x,gy(p.x,p.z)+40,p.z);
  if(window.cinematic&&!CIN.on)cinematic([{d:3,from:a0,to:mid,lf:V(PL.x,PL.y,PL.z),lt:V(p.x,0,p.z)},{d:3,from:mid,to:b0,lf:V(p.x,0,p.z),lt:V(p.x,gy(p.x,p.z),p.z)}],'Met het luchtschip','Naar '+name,()=>{PL.x=p.x;PL.z=p.z;PL.y=gy(p.x,p.z);PL.vy=0});
  else{PL.x=p.x;PL.z=p.z;PL.y=gy(p.x,p.z)}}
function weather(){const W=[['clear','☀ Zon'],['rain','🌧 Regen'],['fog','🌫 Mist'],['storm','⛈ Onweer']];card('🌦 De weermachine','Welk weer wil je? (80 goud)',W.map(([k,n])=>[n,()=>{if(PL.gold<80){addLog('De weermachine kost 80 goud.','#e5766a');return}PL.gold-=80;ENV.weather=k;ENV.wxT=300;try{$('wx').textContent=WXN[k]}catch(e){}sfx('thunder');addLog('Brrrzzzt! De weermachine maakt '+WXN[k].toLowerCase()+'.','#9ad8ff')}]).concat([['Laat maar',()=>{}]]))}
/* ---------- moving machines, smoke, fireworks over Raderburg at night ---------- */
let fwT=0;
ANIMS.push(dt=>{if(!RB.built||PL.inCave)return;const S=SITE.raderburg,d=Math.hypot(PL.x-S.x,PL.z-S.z);if(d>520)return;const t=PL.t,y0=gy(S.x,S.z);
  for(const q of MOV){const o=q.o;if(q.t==='gear')o.rotation.y+=dt*q.sp;else if(q.t==='ring'){if(q.ax===0)o.rotation.x+=dt*q.sp;else if(q.ax===1)o.rotation.y+=dt*q.sp;else{o.rotation.x+=dt*q.sp*.7;o.rotation.z+=dt*q.sp*.5}}
    else if(q.t==='pulse')o.scale.setScalar(1+Math.sin(t*4)*.12);else if(q.t==='ship'){o.position.y=q.y+Math.sin(t*.6)*.6;o.rotation.y=Math.sin(t*.2)*.15;q.prop.rotation.z+=dt*6}
    else if(q.t==='tram'){q.a+=dt*.12;const x=S.x+Math.cos(q.a)*q.R,z=S.z+Math.sin(q.a)*q.R;o.position.set(x,gy(x,z),z);o.rotation.y=-q.a}else if(q.t==='mill')o.rotation.z+=dt*q.sp;else if(q.t==='dish')o.rotation.y+=dt*.3}
  if(RB.hands){const hr=ENV.time%12,mn=(ENV.time%1)*60;for(const h of RB.hands)h.pv.rotation.z=-(h.kind==='h'?hr/12:mn/60)*6.283}
  if(window.PW&&PW.ps&&d<300){if(RB.chim)for(const [x,y,z] of RB.chim)if(Math.random()<dt*6)pwEm(PW.ps,x+rr(.5),y,z+rr(.5),rr(.6),2+Math.random(),rr(.6),3.5,1.4,4.5,[.55,.55,.55],[.3,.3,.32],.45,.2,1);
    if(RB.tm&&Math.random()<dt*8)pwEm(PW.ps,RB.tm.x+rr(1),gy(RB.tm.x,RB.tm.z)+3.2,RB.tm.z+rr(1),rr(2),rr(2),rr(2),.8,.25,.05,[.6,.9,1],[.2,.5,1],.9,0,1);
    if((ENV.night||0)>.6){fwT-=dt;if(fwT<=0){fwT=1.2+Math.random()*2.5;const x=S.x+rr(60),z=S.z+rr(60),y=y0+60+Math.random()*30,c=pick([[1,.4,.3],[.4,.8,1],[1,.85,.3],[.7,1,.5],[1,.5,1]]);for(let i=0;i<46;i++){const a=Math.random()*6.283,b=Math.acos(rr(1)),v=9+Math.random()*3;pwEm(PW.ps,x,y,z,Math.sin(b)*Math.cos(a)*v,Math.cos(b)*v,Math.sin(b)*Math.sin(a)*v,1.6,.45,.05,c,[c[0]*.5,c[1]*.5,c[2]*.5],1,-4,1)}try{if(d<220)sfx('boom')}catch(e){}}}}});
/* news for everyone: the world grew again */
ANIMS.push(()=>{if(!started||!PL.fx||PL.fx.news28||document.body.classList.contains('cine')||anyModal()||PL.t<14)return;if(!PL.fx.bigWorld)return;PL.fx.news28=1;});
/* arriving in Raderburg */
ANIMS.push(()=>{if(!RB.built||!started||PL.inCave||!PL.fx)return;const S=SITE.raderburg;if(PL.fx.seenRader||Math.hypot(PL.x-S.x,PL.z-S.z)>130)return;PL.fx.seenRader=1;giveXp(300);
  addLog('Je komt aan in Raderburg, de stad van de machines!','#e0b04a');if(window.cinematic&&!CIN.on&&!PL.mounted){const V=(a,b,c)=>new T.Vector3(a,b,c),y=gy(S.x,S.z);
    cinematic([{d:3.4,from:V(S.x+120,y+70,S.z+110),to:V(S.x+50,y+40,S.z+50),lf:V(S.x,y+20,S.z),lt:V(S.x,y+24,S.z)},{d:3.4,from:V(RB.tm.x+18,y+10,RB.tm.z+18),to:V(RB.tm.x+9,y+6,RB.tm.z+10),lf:V(RB.tm.x,y+3,RB.tm.z),lt:V(RB.tm.x,y+3,RB.tm.z)}],'Raderburg','De stad van de machines en de tijdmachine')}});

/* ---------- Eikenhart, the wooden giant ----------
   A giant of oak, seven times as tall as a person, built by the inventors of Raderburg. He lies broken near the
   town until you ask Uitvinder Tandwiel or Professor Tijdwijzer to mend him. Then he stands up again, and he is very
   fast and very strong. Talk to him (F) and choose: climb onto his shoulder and steer him yourself (Shift = run,
   click = punch, R = stamp, Space = jump, F = climb off), or let him go his own way: he follows you and fights
   everything that attacks you. He can also wait, or walk home. */
const RS=7,EK={a:null,h:null,cd:0,tgt:null,saveT:0,fx:null,rise:-1,cols:[]};WD.eikenhart=EK;
const WOOD={};function woodMat(k,skin){const key=k+(skin?'s':'');if(!WOOD[key]){const m=new T.MeshStandardMaterial({map:MAT.wood&&MAT.wood.map||null,color:k==='old'?0x8e8a7c:k==='dark'?0x6a4626:0xd6a46a,roughness:k==='old'?1:.78});m.skinning=!!skin;WOOD[key]=m}return WOOD[key]}
function eyeMat(on,skin){const k='eye'+(on?1:0)+(skin?'s':'');if(!WOOD[k]){const m=new T.MeshStandardMaterial({color:on?0xffc060:0x2a2218,emissive:on?0xff9a30:0x000000,emissiveIntensity:on?1:0,roughness:.4});m.skinning=!!skin;WOOD[k]=m}return WOOD[k]}
function paint(fresh){const h=EK.h;if(!h)return;h.g.traverse(o=>{if(!o.isMesh||o.userData.ekKeep)return;const sk=!!o.isSkinnedMesh;o.material=/eye/i.test(o.name||'')?eyeMat(fresh,sk):woodMat(fresh?(o.userData.ekDark?'dark':'new'):'old',sk);o.castShadow=true});if(EK.eyes)for(const e of EK.eyes)e.material=eyeMat(fresh,false)}
const home=()=>{const S=SITE.reus;return{x:S.x,z:S.z}};
const fixed=()=>!!(PL.fx&&PL.fx.robot&&PL.fx.robot.fixed);
function makeGiant(){let h=null;try{h=makeHuman({...randomLook(false),armor:1,hat:'helm',build:1.25,scale:1})}catch(e){console.warn('eikenhart',e)}if(!h)return null;
  /* two kinds of oak: dark for helmet, boots, belt, gloves and shoulder plates, light for the rest */h.g.traverse(o=>{if(o.isMesh&&(/Feet|Pauldron|Body_1|Arms_1/.test(o.name||'')||(!o.isSkinnedMesh&&!o.name)))o.userData.ekDark=true});
  /* on his back: a great wooden cogwheel and two small ones on the shoulders; his eyes are lanterns */
  const back=new T.Group();back.position.set(0,1.22,-.2);h.g.add(back);const g1=gear(.32,12,.08,woodMat('dark'));g1.rotation.x=Math.PI/2;back.add(g1);g1.traverse(o=>{if(o.isMesh)o.userData.ekKeep=true});
  const small=[];for(const s of[-1,1]){const g2=gear(.12,8,.06,woodMat('dark'));g2.position.set(s*.27,1.43,-.02);g2.rotation.z=Math.PI/2;h.g.add(g2);g2.traverse(o=>{if(o.isMesh)o.userData.ekKeep=true});small.push(g2)}
  EK.eyes=[];for(const s of[-1,1]){const e=mesh(new T.SphereGeometry(.028,10,8),eyeMat(false,false),s*.045,1.69,.115);h.g.add(e);EK.eyes.push(e)}
  EK.gears=[g1,...small];return h}
function spawnGiant(x,z){const h=makeGiant();if(!h)return null;EK.h=h;const a=baseActor({kind:'horse',name:'Eikenhart',model:{g:h.g,h,ekM:true},root:h.g,x,z,hp:1e7,hpMax:1e7,rad:1.2,speed:6,robot:true,mult:2.5,hh:RS*1.8});
  a.t=1e9;a.wp=null;a.rot=0;h.g.scale.setScalar(RS);h.scale=RS;h.actor=null;scene.add(a.root);placeActor(a);EK.a=a;paint(fixed());return a}
/* while he lies broken, he blocks the way like a fallen tree */
function lieCols(on){if(on&&!EK.cols.length){const {x,z}=home();EK.cols.push(addBox(x-2.4,z-6.6,x+2.4,z+6.4))}for(const c of EK.cols)c.off=!on}
/* the giant moves like a person, only seven times bigger */
const _ahE=animHorse;animHorse=function(m,dt,sp){if(!m||!m.ekM)return _ahE(m,dt,sp);const a=EK.a;if(!a)return;
  if(!fixed()&&EK.rise<0){if(!m.posed){animHuman(m.h,.016,0,{});m.posed=true}return}
  const v=PL.mounted===a?sp:(a.mv||0);animHuman(m.h,dt,v,{});if(EK.gears)for(const g of EK.gears)g.rotation.y+=dt*(.6+v*.08)};
/* talking to him, climbing on and off */
function menu(){const a=EK.a;if(!a)return;const f=PL.fx.robot;
  card('🪵 Eikenhart','"Krrrk... Klaar om te helpen!" De houten reus kijkt je aan met zijn lantaarnogen. Wat doen we?',[
    ['🕹️ Klim op zijn schouder en bestuur hem',()=>{if(PL.inCave)return;mount(a)}],
    ['🤖 Laat hem zelf gaan (hij volgt en vecht)',()=>{f.mode='follow';addLog('Eikenhart volgt je en vecht tegen alles wat jou aanvalt.','#9cc552')}],
    ['✋ Wacht hier',()=>{f.mode='wait';a.mv=0;addLog('Eikenhart blijft hier staan.','#e0b04a')}],
    ['🏠 Ga terug naar je plek',()=>{f.mode='home';addLog('Eikenhart stapt terug naar zijn plek bij Raderburg.','#e0b04a')}]])}
const _fiE=findInteract;findInteract=function(){const a=EK.a;if(a&&started){if(PL.mounted===a)return{txt:'Klim van Eikenhart af',fn:dismount};
  if(!PL.mounted&&!PL.inCave){const d=Math.hypot(a.x-PL.x,a.z-PL.z);if(fixed()&&d<6.5)return{txt:'Praat met Eikenhart (de houten reus)',fn:menu};if(!fixed()){const H=home();if(Math.hypot(H.x-PL.x,H.z-PL.z)<11)return{txt:'Onderzoek de houten reus',fn:giant}}}}return _fiE()};
const _mE=mount;mount=function(h){if(!h||!h.robot)return _mE(h);PL.mounted=h;h.rider=true;h.wp=null;PL.vy=0;
  addLog('Je zit op de schouder van Eikenhart! Shift = rennen, klik = vuistslag, R = stampen, Spatie = springen, F = afklimmen.','#9cc552')};
const _dE=dismount;dismount=function(){const h=PL.mounted;if(!h||!h.robot)return _dE();h.rider=false;PL.mounted=null;const p={x:h.x+Math.cos(h.rot)*6,z:h.z-Math.sin(h.rot)*6};collide(p,.4);PL.x=p.x;PL.z=p.z;PL.y=groundH(PL.x,PL.z);PL.vy=0;h.mv=0;try{pm.g.visible=true}catch(e){}
  if(PL.fx.robot.mode!=='follow')PL.fx.robot.mode='wait'};
/* you ride on his shoulder; he never gets tired and takes most of the blows for you */
const _upE=updatePlayer;updatePlayer=function(dt){_upE(dt);const a=EK.a;if(!a||PL.mounted!==a)return;PL.st=PL.stMax;const c=Math.cos(a.rot),s=Math.sin(a.rot),ox=-.3*RS,oy=1.46*RS;
  pm.g.position.set(a.x+ox*c,a.root.position.y+oy-.8,a.z-ox*s);pm.g.rotation.y=a.rot};
const _ucE=updateCamera;updateCamera=function(dt){const a=EK.a;if(!a||PL.mounted!==a||PL.fp)return _ucE(dt);const y0=PL.y,d0=PL.camDist;PL.y+=RS*1.25;PL.camDist=d0*2.7;try{_ucE(dt)}finally{PL.y=y0;PL.camDist=d0}};
const _uhE=updateHUD;updateHUD=function(dt){_uhE(dt);if(EK.a&&PL.mounted===EK.a)try{$('mode').textContent='op Eikenhart'}catch(e){}};
const _dpE=damagePlayer;damagePlayer=function(d,src){if(EK.a&&PL.mounted===EK.a)d*=.2;return _dpE(d,src)};
const _haE=hitActor;hitActor=function(a,dmg,by,dir){if(a&&a.robot)return;return _haE(a,dmg,by,dir)};
/* his blows */
const foes=(x,z,r)=>actors.filter(e=>!e.dead&&e.kind==='enemy'&&!e.passive&&!e.seaAlly&&!!e.cave===!!PL.inCave&&Math.hypot(e.x-x,e.z-z)<r);
function knock(e,dx,dz,k){const p={x:e.x+dx*k,z:e.z+dz*k};collide(p,e.rad||.5);e.x=p.x;e.z=p.z}
function punch(a,auto){if(EK.cd>0)return;EK.cd=auto?1:.7;const h=EK.h;h.atk=.55;h.atkT=.55;h.atkKind='slash';try{sfx('swing')}catch(e){}
  setTimeout(()=>{const fx=Math.sin(a.rot),fz=Math.cos(a.rot),dmg=Math.round(140+PL.lvl*12);let n=0;for(const e of foes(a.x,a.z,11)){const dx=e.x-a.x,dz=e.z-a.z,d=Math.hypot(dx,dz)||1;if((dx*fx+dz*fz)/d<.35&&d>3)continue;hitActor(e,dmg*(.9+Math.random()*.2),true,{x:dx/d,z:dz/d});knock(e,dx/d,dz/d,3);n++}if(n)try{sfx('boom')}catch(e){}},300)}
function stamp(a){if(EK.cd>0)return;EK.cd=2.2;PL.vy=8;try{sfx('swing')}catch(e){}setTimeout(()=>{const dmg=Math.round(90+PL.lvl*8);for(const e of foes(a.x,a.z,14)){const dx=e.x-a.x,dz=e.z-a.z,d=Math.hypot(dx,dz)||1;hitActor(e,dmg,true,{x:dx/d,z:dz/d});knock(e,dx/d,dz/d,5)}try{sfx('boom')}catch(e){}addLog('BOEM! Eikenhart stampt op de grond.','#ffd27a')},600)}
const _saE=startAttack;startAttack=function(){const a=EK.a;if(a&&PL.mounted===a){punch(a,false);return}return _saE()};
addEventListener('keydown',e=>{if(e.code!=='KeyR'||!started||PL.dead||!EK.a||PL.mounted!==EK.a||(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')))return;e.stopImmediatePropagation();e.preventDefault();stamp(EK.a)},true);
/* asking in Raderburg to mend him */
function repair(by){if(fixed()||!EK.a)return;PL.fx.robot={fixed:1,mode:'follow'};giveXp(400);const a=EK.a,{x,z}=home(),y=gy(x,z),V=(p,q,r)=>new T.Vector3(p,q,r);
  try{WD.chron&&WD.chron.add('Eikenhart, de houten reus van Raderburg, werd hersteld.')}catch(e){}
  EK.rise=0;lieCols(false);
  const done=()=>{EK.rise=-1;paint(true);card('🪵 Eikenhart werkt weer!','"Krrrk... Dank je wel!" De houten reus staat weer op zijn benen. Hij is supersnel en supersterk, en hij komt nu naar je toe. Praat met hem (F): klim op zijn schouder en bestuur hem zelf, of laat hem zelf gaan, dan volgt hij je en vecht hij voor je.',null,14)};
  if(window.cinematic&&!CIN.on)cinematic([{d:3.6,from:V(x+16,y+5,z+14),to:V(x+12,y+7,z+12),lf:V(x,y+1.5,z-3),lt:V(x,y+6,z)},{d:3.2,from:V(x+10,y+2,z+16),to:V(x+8,y+3,z+14),lf:V(x,y+11,z),lt:V(x,y+12,z)}],'Eikenhart staat op!',by+' en de leerlingen van Raderburg zetten de houten reus weer in elkaar.',done);else done()}
const _dmE=dlgMain;dlgMain=function(a,text){_dmE(a,text);try{if(!a||!/^(Uitvinder Tandwiel|Professor Tijdwijzer)$/.test(a.name||'')||fixed()||!EK.a)return;const box=document.querySelector('#dlg #dopts');if(!box)return;
  const b=document.createElement('button');b.className='btn pri';b.textContent='🪵 Kunt u de houten reus Eikenhart herstellen?';b.onclick=()=>{closeModals();card('🪵 '+a.name,'"De houten reus? Die heb ik helpen bouwen! Er zit alleen een tandwiel los en zijn klokwerkhart moet opgewonden worden. Mijn leerlingen gaan meteen aan de slag. Kijk maar!"',[['Ja, herstel hem!',()=>repair(a.name)],['Later',()=>{}]])};box.insertBefore(b,box.firstChild)}catch(e){}};
RUMORS.push({t:'Bij Raderburg ligt een omgevallen reus van eikenhout. Ze zeggen dat Uitvinder Tandwiel hem weer kan laten lopen... en dat hij dan sneller is dan een paard!'});
/* what he does by himself */
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!RB.built||!started)return;
  if(!EK.a){const {x,z}=home();spawnGiant(x,z+6);if(!EK.a)return}
  const a=EK.a,f=PL.fx||(PL.fx={});EK.cd-=dt;
  /* a save was loaded: put him where he was */
  if(EK.fx!==f){EK.fx=f;if(PL.mounted===a)dismount();const r=f.robot;if(r&&r.fixed){const p=r.mode==='follow'?{x:PL.x-6,z:PL.z-6}:{x:r.x??home().x,z:r.z??home().z+6};a.x=p.x;a.z=p.z;a.y=groundH(a.x,a.z);lieCols(false);paint(true);a.root.rotation.x=0}else{const H=home();a.x=H.x;a.z=H.z+6;a.rot=0;lieCols(true);paint(false)}}
  const H=home();
  /* broken: he lies on his back; while he is mended he slowly gets up */
  if(!fixed()||EK.rise>=0){if(EK.rise>=0){EK.rise=Math.min(1,EK.rise+dt/4.5);if(EK.rise>.55&&!EK.painted){EK.painted=1;paint(true)}}const k=EK.rise<0?0:EK.rise*EK.rise*(3-2*EK.rise);a.x=H.x;a.z=H.z+6;a.rot=0;a.mv=0;a.root.position.set(a.x,groundH(a.x,a.z)+1.15*(1-k),a.z);a.root.rotation.set(-1.5*(1-k),0,0);return}
  a.root.rotation.x=0;
  const r=f.robot;EK.saveT-=dt;if(EK.saveT<=0){EK.saveT=2;r.x=+a.x.toFixed(1);r.z=+a.z.toFixed(1)}
  if(PL.mounted===a){a.mv=PL.speed;return}
  if(Math.hypot(a.x-PL.x,a.z-PL.z)<600)a.root.visible=true;
  if(PL.inCave||r.mode==='wait'){a.mv=0;return}
  const go=(tx,tz,sp,stop)=>{const ox=a.x,oz=a.z,arrived=stepTo(a,dt,tx,tz,sp,stop);a.mv=arrived?0:sp;
    /* stuck behind a house: he steps round it to a free spot nearer to you */if(!arrived&&Math.hypot(a.x-ox,a.z-oz)<sp*dt*.2){EK.stuck=(EK.stuck||0)+dt;if(EK.stuck>2.5){EK.stuck=0;const p={x:PL.x+rr(14),z:PL.z+rr(14)};collide(p,1.2);a.x=p.x;a.z=p.z;a.y=groundH(a.x,a.z)}}else EK.stuck=0;return arrived};
  if(r.mode==='home'){if(go(H.x,H.z+6,18,2))r.mode='wait';return}
  /* follow: fight what threatens you, otherwise stay close */
  if(EK.tgt&&(EK.tgt.dead||Math.hypot(EK.tgt.x-PL.x,EK.tgt.z-PL.z)>45))EK.tgt=null;
  if(!EK.tgt){let best=null,bd=36;for(const e of foes(PL.x,PL.z,36)){const d=Math.hypot(e.x-PL.x,e.z-PL.z);if(d<bd){bd=d;best=e}}EK.tgt=best}
  const d=Math.hypot(a.x-PL.x,a.z-PL.z);
  if(d>320){const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot),p={x:PL.x-fx*60,z:PL.z-fz*60};collide(p,1.2);a.x=p.x;a.z=p.z;a.y=groundH(a.x,a.z);return}
  if(EK.tgt){const e=EK.tgt,de=Math.hypot(e.x-a.x,e.z-a.z);if(de>(e.rad||.5)+5)go(e.x,e.z,24,(e.rad||.5)+4.5);else{a.mv=0;a.rot+=angDiff(a.rot,Math.atan2(e.x-a.x,e.z-a.z))*Math.min(1,dt*8);punch(a,true)}return}
  const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot),tx=PL.x-fx*7-fz*5,tz=PL.z-fz*7+fx*5;if(d>11)go(tx,tz,Math.min(40,8+d*.9),3);else a.mv=0});
/* ---------- gadgets you carry: the compass and the clockwork owl ---------- */
const hud=document.createElement('div');hud.style.cssText='position:fixed;left:50%;top:calc(46px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:15;display:none;padding:4px 12px;font-size:13px;color:#f0e6cc;background:rgba(20,14,6,.7);border:1px solid #6b5b3a;border-radius:4px;pointer-events:none';document.body.appendChild(hud);
setInterval(()=>{if(!started||PL.dead||!hasItem('kompas')||PL.inCave||document.body.classList.contains('cine')){hud.style.display='none';return}let best=null,bd=1e9;for(const s of SITES){if(s.id==='bridge'||PL.discovered[s.id])continue;const d=Math.hypot(s.x-PL.x,s.z-PL.z);if(d<bd){bd=d;best=s}}
  if(!best){hud.textContent='🧭 Je hebt alles ontdekt!';hud.style.display='block';return}const a=Math.atan2(best.x-PL.x,best.z-PL.z)-PL.yaw,ar=['⬆','↗','➡','↘','⬇','↙','⬅','↖'][((Math.round(-a/(Math.PI/4))%8)+8)%8];hud.textContent='🧭 '+ar+' '+best.name+' · '+Math.round(bd)+' m';hud.style.display='block'},400);
let owl=null;
ANIMS.push(dt=>{const want=started&&!PL.dead&&hasItem('klokuil');if(!want){if(owl)owl.visible=false;return}const m=mats();
  if(!owl){owl=new T.Group();owl.add(mesh(new T.SphereGeometry(.22,12,10),m.brass,0,0,0));owl.add(mesh(new T.SphereGeometry(.15,10,8),m.brass,0,.24,.04));for(const s of[-1,1]){owl.add(mesh(new T.SphereGeometry(.05,8,6),m.glow,s*.06,.27,.17));const w=mesh(new T.BoxGeometry(.32,.03,.18),m.copper,s*.26,.02,0);w.userData.w=s;owl.add(w)}scene.add(owl)}
  owl.visible=true;const t=PL.t,tx=PL.x+Math.sin(t*.8)*1.6,tz=PL.z+Math.cos(t*.8)*1.6,ty=PL.y+2.6+Math.sin(t*2.3)*.25;owl.position.lerp(new T.Vector3(tx,ty,tz),Math.min(1,dt*4));owl.rotation.y=t*.8+Math.PI/2;
  for(const c of owl.children)if(c.userData.w)c.rotation.z=c.userData.w*Math.sin(t*14)*.6;if(Math.random()<dt*.02)floatText(owl.position.x,owl.position.y+.4,owl.position.z,'Oehoe!','#ffd27a')});
})();
