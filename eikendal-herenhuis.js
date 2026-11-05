/* ================= Landhuis Eikenhof: a huge house with floors you can walk on =================
   Just south of Eikendal stands a great manor, 30 by 20 metres, with three floors, a roof terrace and four corner
   turrets. You walk in through the front door and up the grand staircase:
   - ground floor: the great hall with a chandelier, a dining room with a long table and a fireplace, a kitchen;
   - first floor: a library full of books, a bedroom with a canopy bed, and a balcony above the front door;
   - second floor: a throne room, a treasure room with a chest, and a second balcony;
   - the roof: a terrace with battlements, a telescope and a flag, with a view over the whole land.
   Around it: a walled garden with a gate, trees, roses, a gazebo by a pond, knight statues and a wishing fountain.
   Things to do (F): sleep in the canopy bed, sit on the throne, look through the telescope on the roof, play the harp,
   read in the library, warm up by the fire, throw a coin in the fountain, wave to the people from the balcony.
   When you are inside, the floors above you are hidden, so you can see where you are. The windows glow at night.
   How the floors work: the ground knows which floor you stand on (the highest one just below your feet), and the
   stairs are gentle slopes, so you can simply walk up and down. */
(function(){
const CX=-66,CZ=128,FH=4.5,TOP=13.5,HX=15,HZ=10;
/* local (x,z) of the house -> world: the house is turned around so its front door faces the town */
const W=(lx,lz)=>[CX-lx,CZ-lz],toL=(x,z)=>[CX-x,CZ-z];
const site={id:'herenhuis',name:'Landhuis Eikenhof',x:CX,z:CZ-6,r:36,h:0,blend:1.5};
{let s=0,n=0;for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){s+=baseH(CX+i*12,CZ+j*12);n++}site.h=Math.max(2.6,s/n)}
SITES.push(SITE.herenhuis=site);MAPICON.herenhuis='🏰';
const BY=()=>site.h;
/* a path from the garden gate to the nearest road */
{const [gx,gz]=W(0,34);let best=null,bd=1e9;for(const R of ROADS)for(const p of R.pts){const d=Math.hypot(p[0]-gx,p[1]-gz);if(d<bd){bd=d;best=p}}if(best)ROADS.push({w:2.4,pts:[[gx,gz],[(gx+best[0])/2,(gz+best[1])/2],best]})}
/* ---------- floors and stairs (local coordinates) ---------- */
const FL=[],RP=[],fl=(x0,x1,z0,z1,y)=>FL.push({x0,x1,z0,z1,y}),rp=(x0,x1,z0,z1,ya,yb,k)=>RP.push({x0,x1,z0,z1,ya,yb,k});
rp(-4.5,4.5,-9.4,-7,0,FH,0);rp(-4.5,4.5,-7,-4.6,2*FH,FH,1);rp(-4.5,4.5,-9.4,-7,2*FH,TOP,2);
fl(-14.6,14.6,-7,9.6,FH);fl(-14.6,-4.5,-9.6,-7,FH);fl(4.5,14.6,-9.6,-7,FH);
fl(-14.6,14.6,-4.6,9.6,2*FH);fl(-14.6,14.6,-9.6,-7,2*FH);fl(-14.6,-4.5,-7,-4.6,2*FH);fl(4.5,14.6,-7,-4.6,2*FH);
fl(-15.2,15.2,-7,10.2,TOP);fl(-15.2,-4.5,-10.2,-7,TOP);fl(4.5,15.2,-10.2,-7,TOP);
fl(-4,4,10,12.8,FH);fl(-4,4,10,12.8,2*FH);
const rampY=(r,lx)=>r.ya+(r.yb-r.ya)*((lx-r.x0)/(r.x1-r.x0));
const _ghE=groundH;groundH=function(x,z){const lx=CX-x,lz=CZ-z;if(lx<-16||lx>16||lz<-11||lz>13.5)return _ghE(x,z);const base=_ghE(x,z);
  if(Math.abs(x-PL.x)>2.5||Math.abs(z-PL.z)>2.5)return base;const b=BY(),lim=PL.y+.6;let h=base;
  for(const f of FL)if(lx>=f.x0&&lx<=f.x1&&lz>=f.z0&&lz<=f.z1){const y=b+f.y;if(y<=lim&&y>h)h=y}
  for(const r of RP)if(lx>=r.x0&&lx<=r.x1&&lz>=r.z0&&lz<=r.z1){const y=b+rampY(r,lx);if(y<=lim&&y>h)h=y}
  return h};
/* ---------- materials ---------- */
const M=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:o.r??.85,metalness:o.m||0,...(o.e?{emissive:o.e,emissiveIntensity:o.ei??1}:{}),...(o.side?{side:o.side}:{})});
let MT=null;function mats(){if(MT)return MT;const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.anisotropy=4;return t};
  const books=tex(256,128,(g,w,h)=>{g.fillStyle='#3a2414';g.fillRect(0,0,w,h);for(let row=0;row<2;row++){let x=2;while(x<w-4){const bw=6+Math.random()*10,bh=44+Math.random()*16;g.fillStyle='hsl('+Math.floor(Math.random()*360)+',45%,'+(25+Math.random()*25)+'%)';g.fillRect(x,row*64+62-bh,bw,bh);g.fillStyle='rgba(255,220,140,.5)';g.fillRect(x+1,row*64+62-bh+6,bw-2,2);x+=bw+1}g.fillStyle='#2a180c';g.fillRect(0,row*64+60,w,4)}});
  const paint=(a,b)=>tex(128,96,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,a);gr.addColorStop(1,b);g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='rgba(40,60,30,.8)';g.beginPath();g.moveTo(0,h*.7);for(let x=0;x<=w;x+=8)g.lineTo(x,h*.6+Math.sin(x*.07)*8);g.lineTo(w,h);g.lineTo(0,h);g.fill();g.fillStyle='rgba(255,240,180,.85)';g.beginPath();g.arc(w*.75,h*.25,8,0,7);g.fill()});
  MT={stone:MAT.stone||M(0x8a857a),plaster:MAT.plaster||M(0xe8dcc0),wood:MAT.wood||M(0x7a5434),beam:M(0x3a2614),floor:M(0x8a5a32,{r:.7}),slate:M(0x3a4660,{r:.7}),gold:MAT.gold||M(0xd8a83a,{m:.8,r:.3}),
    glass:M(0x2a3a4a,{r:.2,e:0xffc070,ei:0}),red:M(0x8a1a1a),carpet:M(0x7a1a22,{r:.95}),linen:M(0xf0ece0),green:M(0x3f6a2f),hedge:M(0x2f5a2a),water:M(0x3a7ab8,{r:.1,e:0x103050,ei:.6}),
    fire:new T.MeshBasicMaterial({color:0xff8a2a}),flame:new T.MeshBasicMaterial({color:0xffd27a}),dark:new T.MeshBasicMaterial({color:0x120a06}),books:new T.MeshStandardMaterial({map:books,roughness:.9}),
    p1:new T.MeshStandardMaterial({map:paint('#7ab0e0','#e8c890'),roughness:.8}),p2:new T.MeshStandardMaterial({map:paint('#e08a5a','#3a2a5a'),roughness:.8}),p3:new T.MeshStandardMaterial({map:paint('#9ad0c0','#f0e0b0'),roughness:.8}),
    blue:M(0x1f4a8a),white:M(0xe8e8e8),iron:MAT.iron||M(0x5a5f66,{m:.6,r:.4})};return MT}
/* ---------- a bag of shapes, merged per material so it draws fast ---------- */
function Bag(){const L=new Map();const add=(geo,m,x,y,z,ry=0,rx=0,rz=0,sx=1,sy=1,sz=1)=>{const g=geo.index?geo.toNonIndexed():geo.clone();for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);g.clearGroups();
    g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz)));if(!L.has(m))L.set(m,[]);L.get(m).push(g)};
  return{add,box:(w,h,d,m,x,y,z,ry=0)=>add(new T.BoxGeometry(w,h,d),m,x,y,z,ry),cyl:(r0,r1,h,m,x,y,z,s=10)=>add(new T.CylinderGeometry(r0,r1,h,s),m,x,y,z),
    build(group){for(const [m,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const q of mg?[mg]:gs){const me=new T.Mesh(q,m);me.castShadow=true;me.receiveShadow=true;group.add(me)}}}}}
/* ---------- building it ---------- */
const G=[],CH=[];let ROOT=null;
function wallZ(b,z,x0,x1,y,h,m,gaps,win){/* a wall along x at local z, with door gaps and windows */const segs=[];let s=x0;for(const [g0,g1] of(gaps||[]).sort((a,c)=>a[0]-c[0])){if(g0>s)segs.push([s,g0]);s=g1}if(s<x1)segs.push([s,x1]);
  for(const [a,c] of segs){b.box(c-a,h,.5,m,(a+c)/2,y+h/2,z);if(win)for(let x=a+2;x<c-1.4;x+=4.2){const wx=Math.min(x+.65,c-1.1);for(const sd of[-1,1]){b.box(1.3,1.9,.06,MT.glass,wx,y+2.25,z+sd*.29);b.box(1.5,.12,.1,MT.beam,wx,y+1.25,z+sd*.3);b.box(1.5,.12,.1,MT.beam,wx,y+3.25,z+sd*.3);b.box(.1,1.9,.08,MT.beam,wx,y+2.25,z+sd*.31);b.box(1.3,.08,.08,MT.beam,wx,y+2.3,z+sd*.31)}}}}
function wallX(b,x,z0,z1,y,h,m,gaps,win){const segs=[];let s=z0;for(const [g0,g1] of(gaps||[]).sort((a,c)=>a[0]-c[0])){if(g0>s)segs.push([s,g0]);s=g1}if(s<z1)segs.push([s,z1]);
  for(const [a,c] of segs){b.box(.5,h,c-a,m,x,y+h/2,(a+c)/2);if(win)for(let z=a+2;z<c-1.4;z+=4.2){const wz=Math.min(z+.65,c-1.1);for(const sd of[-1,1]){b.box(.06,1.9,1.3,MT.glass,x+sd*.29,y+2.25,wz);b.box(.1,.12,1.5,MT.beam,x+sd*.3,y+1.25,wz);b.box(.1,.12,1.5,MT.beam,x+sd*.3,y+3.25,wz);b.box(.08,1.9,.1,MT.beam,x+sd*.31,y+2.25,wz);b.box(.08,.08,1.3,MT.beam,x+sd*.31,y+2.3,wz)}}}}
function timber(b,y){/* half-timbering on the upper floors: dark beams on the outside */for(const sd of[-1,1]){for(let x=-15;x<=15;x+=2.5){b.box(.22,FH,.1,MT.beam,x,y+FH/2,sd*(HZ+.28))}for(const yy of[y+.12,y+FH-.12])b.box(30.4,.24,.1,MT.beam,0,yy,sd*(HZ+.28));
  for(let z=-10;z<=10;z+=2.5)b.box(.1,FH,.22,MT.beam,sd*(HX+.28),y+FH/2,z);for(const yy of[y+.12,y+FH-.12])b.box(.1,.24,20.4,MT.beam,sd*(HX+.28),yy,0)}}
function chair(b,x,z,ry,y){b.box(.6,.1,.6,MT.wood,x,y+.5,z,ry);for(const [dx,dz] of[[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]])b.box(.07,.5,.07,MT.wood,x+dx,y+.25,z+dz);b.box(.6,.8,.08,MT.wood,x-Math.sin(ry)*.27,y+.95,z-Math.cos(ry)*.27,ry)}
function table(b,x,z,w,d,y,m){b.box(w,.12,d,m||MT.wood,x,y+.8,z);for(const [dx,dz] of[[-1,-1],[1,-1],[-1,1],[1,1]])b.box(.12,.8,.12,MT.wood,x+dx*(w/2-.2),y+.4,z+dz*(d/2-.2))}
function candle(b,x,y,z){b.cyl(.04,.04,.25,MT.linen,x,y+.12,z,6);b.add(new T.SphereGeometry(.05,6,4),MT.flame,x,y+.3,z)}
function chandelier(b,x,y,z){b.add(new T.TorusGeometry(1.1,.07,6,20),MT.gold,x,y,z,0,Math.PI/2);b.cyl(.03,.03,FH-y+.1,MT.iron,x,(y+FH)/2,z,4);for(let i=0;i<8;i++){const a=i/8*6.283;candle(b,x+Math.cos(a)*1.1,y,z+Math.sin(a)*1.1)}}
function painting(b,x,y,z,ry,m,w=2.2,h=1.6){b.box(w+.2,h+.2,.08,MT.gold,x,y,z,ry);b.add(new T.PlaneGeometry(w,h),m,x+Math.sin(ry)*.05,y,z+Math.cos(ry)*.05,ry)}
function stairs(b,r){const n=16,lowAtX0=r.ya<r.yb,lo=Math.min(r.ya,r.yb),hi=Math.max(r.ya,r.yb),dx=(r.x1-r.x0)/n,zc=(r.z0+r.z1)/2,zw=r.z1-r.z0;
  for(let i=0;i<n;i++){const k=lowAtX0?i:n-1-i,top=lo+(k+1)*(hi-lo)/n,bot=lo-.3;b.box(dx+.02,top-bot,zw,MT.wood,r.x0+dx*(i+.5),(top+bot)/2,zc);b.box(dx+.02,.06,zw-.2,MT.carpet,r.x0+dx*(i+.5),top+.03,zc)}
  /* banister on the open side */const side=r.z1<-6?r.z1-.1:r.z1-.1,len=Math.hypot(r.x1-r.x0,hi-lo),ang=Math.atan2(hi-lo,r.x1-r.x0)*(lowAtX0?1:-1);
  b.add(new T.BoxGeometry(len,.1,.1),MT.gold,(r.x0+r.x1)/2,(lo+hi)/2+1,side,0,0,ang);for(let i=0;i<=n;i+=2){const t=i/n,yy=lo+(lowAtX0?t:1-t)*(hi-lo);b.box(.07,1,.07,MT.wood,r.x0+(r.x1-r.x0)*t,yy+.5,side)}}
function build(){const m=mats(),b0=BY();ROOT=new T.Group();ROOT.position.set(CX,b0,CZ);ROOT.rotation.y=Math.PI;scene.add(ROOT);ROOT.userData.dyn=true;
  for(let k=0;k<4;k++){const g=new T.Group();g.userData.dyn=true;ROOT.add(g);G.push(g)}const B=[Bag(),Bag(),Bag(),Bag()];
  /* ---- the outside and the walls of each floor ---- */
  for(let k=0;k<3;k++){const b=B[k],y=k*FH,wm=k?m.plaster:m.stone,door=[[-1.6,1.6]];
    wallZ(b,-HZ,-HX,HX,y,FH,wm,null,true);wallZ(b,HZ,-HX,HX,y,FH,wm,door,true);wallX(b,-HX,-HZ,HZ,y,FH,wm,null,true);wallX(b,HX,-HZ,HZ,y,FH,wm,null,true);
    if(k)timber(b,y);b.box(31,.35,.35,m.stone,0,y+.17,HZ+.3);b.box(31,.35,.35,m.stone,0,y+.17,-HZ-.3);
    /* inner walls between hall and wings, with doorways */for(const sx of[-6,6])wallX(b,sx,-HZ,HZ,y,FH,m.plaster,[[-1.5,1.5]],false);
    /* door frame */b.box(.3,3.2,.7,m.beam,-1.75,y+1.6,HZ);b.box(.3,3.2,.7,m.beam,1.75,y+1.6,HZ);b.box(3.8,.35,.7,m.beam,0,y+3.3,HZ);
    /* floor slabs: the ground floor gets wooden boards, the others are the floors above */
    if(k===0)b.box(29.4,.08,19.4,m.floor,0,.04,0)}
  for(const f of FL){const k=f.y===FH?1:f.y===2*FH?2:3;B[k].box(f.x1-f.x0,.35,f.z1-f.z0,k===3?m.stone:m.floor,(f.x0+f.x1)/2,f.y-.175,(f.z0+f.z1)/2)}
  for(const r of RP)stairs(B[r.k],r);
  /* the divider and railings by the stairs */B[0].box(9,FH,.25,m.plaster,0,FH/2,-7);B[1].box(9,1,.12,m.wood,0,FH+.5,-4.55);B[2].box(9,1,.12,m.wood,0,2*FH+.5,-4.55);B[1].box(9,FH,.25,m.plaster,0,FH+FH/2,-7);
  /* ---- ground floor ---- */{const b=B[0];b.box(2.4,.05,14,m.carpet,0,.1,3);chandelier(b,0,FH-1.2,3);
    /* front porch: columns and a roof that is the balcony above */for(const x of[-3.6,-1.4,1.4,3.6]){b.cyl(.3,.34,FH,m.white,x,FH/2,12.4,12);b.box(.8,.3,.8,m.stone,x,.15,12.4)}b.box(8.6,.4,3.2,m.stone,0,FH-.2,11.4);
    for(let i=0;i<3;i++)b.box(5.2-i*.6,.15,1.2-i*.25,m.stone,0,.075+i*.15,13.6-i*.3);
    /* dining room */table(b,-10.5,1,2,8,0);for(let i=0;i<5;i++){chair(b,-11.9,-2.4+i*1.7,Math.PI/2,0);chair(b,-9.1,-2.4+i*1.7,-Math.PI/2,0)}for(let i=0;i<3;i++)candle(b,-10.5,.86,-1.5+i*2.5);chandelier(b,-10.5,FH-1.2,1);
    b.box(.9,3.2,3.4,m.stone,-14.3,1.6,-4);b.box(.3,1.4,2,m.dark,-13.85,.8,-4);b.add(new T.ConeGeometry(.35,.9,6),m.fire,-13.9,.5,-4.4);b.add(new T.ConeGeometry(.3,.7,6),m.fire,-13.9,.45,-3.7);b.box(1.4,.2,3.8,m.stone,-14.1,3.2,-4);
    painting(b,-10.5,2.4,-9.7,0,m.p1,3,2);painting(b,-14.7,2.4,4,Math.PI/2,m.p2);
    /* kitchen */b.box(1.6,1.6,3,m.stone,14,.8,-6);b.box(.2,.9,2.2,m.dark,13.15,.6,-6);b.add(new T.ConeGeometry(.4,.8,6),m.fire,13.4,.4,-6);for(let x=7;x<13;x+=1.6)b.box(1.5,.95,1,m.wood,x,.47,-9.3);table(b,10.5,1,2.4,1.4,0);
    for(const [x,z] of[[13.8,7.8],[12.8,8.4],[13.8,6.6]])b.cyl(.5,.45,1.2,m.wood,x,.6,z,10);for(let i=0;i<4;i++)b.cyl(.25,.2,.35,m.iron,7.6+i*1.4,2.6,-9.4,8);
    painting(b,0,2.6,-6.85,0,m.p3,3,2)}
  /* ---- first floor ---- */{const b=B[1],y=FH;
    /* library */for(let z=-8.5;z<=8.5;z+=2.2){b.box(.6,3.2,2.1,m.wood,-14.4,y+1.6,z);b.add(new T.PlaneGeometry(2,3),m.books,-14.08,y+1.6,z,Math.PI/2)}for(let x=-13.2;x<=-7;x+=2.2){b.box(2.1,3.2,.6,m.wood,x,y+1.6,-9.4);b.add(new T.PlaneGeometry(2,3),m.books,x,y+1.6,-9.08)}
    table(b,-10,2,2.4,1.4,y);chair(b,-10,3.4,Math.PI,y);chair(b,-10,.6,0,y);b.add(new T.SphereGeometry(.45,14,10),m.blue,-8,y+1.4,6);b.cyl(.05,.08,.9,m.gold,-8,y+.45,6,6);chandelier(b,-10.5,y+FH-1.2,0);
    /* bedroom */b.box(3.2,.6,4.4,m.wood,11.5,y+.3,-5);b.box(3,.35,4,m.linen,11.5,y+.75,-5);b.box(3,.3,1.2,m.red,11.5,y+.8,-3.5);for(const [dx,dz] of[[-1.5,-2.1],[1.5,-2.1],[-1.5,2.1],[1.5,2.1]])b.cyl(.08,.08,2.8,m.wood,11.5+dx,y+1.4,-5+dz,6);b.box(3.3,.25,4.5,m.red,11.5,y+2.85,-5);
    for(const dz of[-1,1])b.box(.9,.25,.5,m.white,11.5+dz*.7,y+.98,-6.8);b.box(2,2.6,.8,m.wood,8,y+1.3,-9.3);b.box(3.4,.04,2.4,m.carpet,11,y+.03,0);painting(b,14.7,y+2.3,4,-Math.PI/2,m.p1);
    /* hall */for(const x of[-3,3])b.box(2,.5,.6,m.wood,x,y+.25,8.6);painting(b,0,y+2.5,9.7,Math.PI,m.p2,3,2);chandelier(b,0,y+FH-1.2,3);
    /* balcony railing and banner */b.box(8,1,.12,m.white,0,y+.5,12.75);for(const sx of[-1,1])b.box(.12,1,2.8,m.white,sx*3.95,y+.5,11.4);b.add(new T.PlaneGeometry(1.6,3.4),m.red,0,y-1.9,12.86)}
  /* ---- second floor ---- */{const b=B[2],y=2*FH;
    /* throne room */b.box(3,.4,4,m.stone,-13.2,y+.2,0);b.box(1.4,.5,1.2,m.gold,-13.4,y+.65,0);b.box(.25,2.6,1.4,m.gold,-14,y+1.6,0);b.box(1.2,.15,1,m.red,-13.3,y+.95,0);b.box(8,.04,2.2,m.carpet,-9.6,y+.03,0);
    for(const z of[-6,6]){b.add(new T.PlaneGeometry(1.4,3),m.red,-14.7,y+2.4,z,Math.PI/2);b.add(new T.PlaneGeometry(.8,.8),m.gold,-14.68,y+2.8,z,Math.PI/2)}chandelier(b,-10.5,y+FH-1.2,0);
    /* treasure room */for(const [x,z,s] of[[12.5,-7.5,1],[13.5,-5.8,.8],[11.2,-8.6,.7],[13.6,7.8,.9]])b.add(new T.ConeGeometry(s,s*.9,10),m.gold,x,y+s*.45,z);b.box(1,1.2,1,m.stone,9,y+.6,6);b.add(new T.TorusGeometry(.3,.08,6,12),m.gold,9,y+1.35,6,0,Math.PI/2);
    for(let i=0;i<5;i++)b.add(new T.ConeGeometry(.07,.2,4),m.gold,9+Math.cos(i*1.26)*.3,y+1.48,6+Math.sin(i*1.26)*.3);painting(b,14.7,y+2.4,0,-Math.PI/2,m.p3,3,2);
    painting(b,0,y+2.5,9.7,Math.PI,m.p1,3,2);chandelier(b,0,y+FH-1.2,3);b.box(8,1,.12,m.white,0,y+.5,12.75);for(const sx of[-1,1])b.box(.12,1,2.8,m.white,sx*3.95,y+.5,11.4)}
  /* ---- the roof terrace and the turrets ---- */{const b=B[3],y=TOP;for(const sd of[-1,1]){for(let x=-14.5;x<=14.5;x+=1.6)b.box(.8,.9,.5,m.stone,x,y+.45,sd*(HZ+.05));for(let z=-9.5;z<=9.5;z+=1.6)b.box(.5,.9,.8,m.stone,sd*(HX+.05),y+.45,z)}
    b.box(9.2,1,.15,m.stone,0,y+.5,-6.95);for(const [x,z] of[[-HX,-HZ],[HX,-HZ],[-HX,HZ],[HX,HZ]]){b.cyl(2.9,2.9,1.2,m.stone,x,y+.6,z,16);b.add(new T.ConeGeometry(3.4,6,16),m.slate,x,y+4.2,z);b.add(new T.SphereGeometry(.25,8,6),m.gold,x,y+7.3,z)}
    b.cyl(.08,.1,7,m.wood,8,y+3.5,4,6);b.add(new T.PlaneGeometry(2.6,1.6),m.blue,9.3,y+6.2,4,0,0,0);b.cyl(.12,.16,1.6,m.iron,-8,y+1.1,4,8);b.add(new T.CylinderGeometry(.12,.18,1.6,10),m.gold,-8,y+2,4.4,0,1.1);
    for(const x of[-3,3])b.box(2,.45,.6,m.wood,x,y+.22,6);for(const [x,z] of[[-12,7],[12,-4],[-12,-4]]){b.cyl(.5,.4,.7,m.stone,x,y+.35,z,10);b.add(new T.SphereGeometry(.8,10,8),m.hedge,x,y+1.2,z)}
    for(const [x,z] of[[-9,-9.4],[9,9.4]]){b.box(1.2,3,1.2,m.stone,x,y+1.5,z);b.box(1.4,.2,1.4,m.stone,x,y+3.1,z)}}
  /* ---- turret bodies (outside, all the way up) and the garden ---- */{const b=B[0];for(const [x,z] of[[-HX,-HZ],[HX,-HZ],[-HX,HZ],[HX,HZ]]){b.cyl(2.6,2.9,TOP,m.stone,x,TOP/2,z,16);for(let k=1;k<3;k++)for(let a=0;a<4;a++){const an=a*Math.PI/2+.4;b.box(.8,1.6,.2,m.glass,x+Math.cos(an)*2.65,k*FH+2,z+Math.sin(an)*2.65,-an+Math.PI/2)}}
    for(let z=14;z<34;z+=1.6)b.box(3,.08,1.5,m.stone,0,.04,z);for(const sx of[-1,1]){b.box(.9,1,18,m.hedge,sx*3.2,.5,24);for(let z=16;z<33;z+=3)b.add(new T.SphereGeometry(.3,6,4),pick([m.red,m.white,m.blue]),sx*4.4,.3,z)}
    b.cyl(3.2,3.4,.7,m.stone,9,.35,22,20);b.cyl(2.9,2.9,.1,m.water,9,.62,22,20);b.cyl(.35,.45,1.8,m.stone,9,.9,22,10);b.cyl(1,.6,.3,m.stone,9,1.9,22,14);b.cyl(.9,.9,.05,m.water,9,2.03,22,14);
    for(const x of[-5.4,5.4])for(const z of[16,23,30]){b.cyl(.08,.1,2.4,m.iron,x,1.2,z,6);b.add(new T.BoxGeometry(.35,.45,.35),m.glass,x,2.5,z)}}
  try{extras(B,m)}catch(e){console.warn('eikenhof extra',e)}
  for(let k=0;k<4;k++)B[k].build(G[k]);
  /* collisions: outer walls (with the front door), inner walls (with doorways), the stair divider, the turrets */
  const wbox=(lx0,lz0,lx1,lz1)=>{const [ax,az]=W(lx0,lz0),[bx,bz]=W(lx1,lz1);addBox(Math.min(ax,bx),Math.min(az,bz),Math.max(ax,bx),Math.max(az,bz))};
  wbox(-HX-.3,-HZ-.3,HX+.3,-HZ+.3);wbox(-HX-.3,HZ-.3,-1.6,HZ+.3);wbox(1.6,HZ-.3,HX+.3,HZ+.3);wbox(-HX-.3,-HZ,-HX+.3,HZ);wbox(HX-.3,-HZ,HX+.3,HZ);
  for(const sx of[-6,6]){wbox(sx-.25,-HZ,sx+.25,-1.5);wbox(sx-.25,1.5,sx+.25,HZ)}wbox(-4.5,-7.15,4.5,-6.85);wbox(-4.5,-4.7,4.5,-4.4);
  for(const [x,z] of[[-HX,-HZ],[HX,-HZ],[-HX,HZ],[HX,HZ]]){const [wx,wz]=W(x,z);addCircle(wx,wz,2.9)}for(const x of[-3.6,-1.4,1.4,3.6]){const [wx,wz]=W(x,12.4);addCircle(wx,wz,.35)}
  {const [wx,wz]=W(9,22);addCircle(wx,wz,3.3)}
  /* the treasure chest */try{const [wx,wz]=W(13,0);const c=makeChest(wx,wz,'eikenhof',Math.PI/2,'Schatkist van Eikenhof');c.g.position.y=b0+2*FH;c.y=b0+2*FH;CH.push({c,x:wx,z:wz})}catch(e){console.warn('eikenhof kist',e)}
  try{const [wx,wz]=W(-10,4);const c=makeChest(wx,wz,'eikenhof_dak',0,'Kistje op het dak');c.g.position.y=b0+TOP;c.y=b0+TOP;CH.push({c,x:wx,z:wz})}catch(e){}}
Object.assign(CHEST_LOOT,{eikenhof:{gold:2500,items:[['gem',4],['relic',1],['ring_gold',1]].filter(([i])=>ITEMS[i])},eikenhof_dak:{gold:800,items:[['potion',2],['gem',1]].filter(([i])=>ITEMS[i])}});
const _bfE=buildFantasy;buildFantasy=function(){_bfE();try{build()}catch(e){console.warn('herenhuis',e)}try{setupActs()}catch(e){console.warn('eikenhof acties',e)}};
/* ---------- more beauty: the garden, the facade and every room ---------- */
let XM=null;function xmats(){if(XM)return XM;const M=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:o.r??.85,metalness:o.m||0,...(o.e?{emissive:o.e,emissiveIntensity:o.ei??1}:{}),...(o.side?{side:o.side}:{}),...(o.flat?{flatShading:true}:{})});
  const tap=(()=>{const c=document.createElement('canvas');c.width=128;c.height=192;const g=c.getContext('2d');g.fillStyle='#6a1a22';g.fillRect(0,0,128,192);g.strokeStyle='#d8a83a';g.lineWidth=6;g.strokeRect(6,6,116,180);
    g.fillStyle='#d8a83a';g.beginPath();g.moveTo(64,40);g.lineTo(92,96);g.lineTo(64,152);g.lineTo(36,96);g.closePath();g.fill();g.fillStyle='#1f3a6a';g.beginPath();g.arc(64,96,16,0,7);g.fill();for(let y=20;y<192;y+=40){g.fillStyle='#d8a83a';g.fillRect(14,y,8,8);g.fillRect(106,y,8,8)}const t=new T.CanvasTexture(c);return t})();
  XM={ivy:M(0x2f5a26,{r:.95,flat:true}),leaf:M(0x3f7a2f,{r:.95,flat:true}),trunk:M(0x5a3a22,{r:.95}),rose:M(0xc02a3a),pink:M(0xe070a0),yel:M(0xf0c040),white:M(0xeeeae0),marble:M(0xdedad0,{r:.4}),iron:M(0x3a3e44,{m:.7,r:.35}),steel:M(0xb8c0c8,{m:.8,r:.25}),
    tap:new T.MeshStandardMaterial({map:tap,roughness:.95,side:T.DoubleSide}),banner:M(0x8a1a1a,{side:T.DoubleSide}),bannerB:M(0x1f3a6a,{side:T.DoubleSide}),gem:[M(0xe03a5a,{r:.2,m:.3,e:0x401020,ei:.6}),M(0x3ac0e0,{r:.2,m:.3,e:0x103a40,ei:.6}),M(0x5ae05a,{r:.2,m:.3,e:0x104010,ei:.6}),M(0xb05ae0,{r:.2,m:.3,e:0x301040,ei:.6})],
    ham:M(0xb05a4a),bread:M(0xd09a50),sack:M(0xc8b088),water:M(0x3a7ab8,{r:.1,e:0x103050,ei:.6}),lily:M(0x4f9a3a),lamp:new T.MeshBasicMaterial({color:0xffd890}),fire:new T.MeshBasicMaterial({color:0xff8a2a})};return XM}
function tree(b,x,z,s){const X=xmats();b.cyl(.35*s,.5*s,4.2*s,X.trunk,x,2.1*s,z,8);for(const [dx,dy,dz,r] of[[0,5,0,2.2],[1.2,4.3,.6,1.6],[-1.1,4.5,-.7,1.7],[.3,6.2,-.2,1.5]])b.add(new T.IcosahedronGeometry(r*s,1),X.leaf,x+dx*s,dy*s,z+dz*s)}
function knight(b,x,z,ry){const X=xmats();b.box(.9,.4,.9,MT.stone,x,.2,z);b.cyl(.28,.32,1,X.steel,x,.9,z,8);b.box(.75,.9,.45,X.steel,x,1.85,z,ry);b.add(new T.SphereGeometry(.26,10,8),X.steel,x,2.55,z);b.box(.32,.08,.06,X.iron,x+Math.sin(ry)*.22,2.55,z+Math.cos(ry)*.22,ry);
  for(const sd of[-1,1])b.cyl(.11,.1,.9,X.steel,x+Math.cos(ry)*sd*.48,1.75,z-Math.sin(ry)*sd*.48,6);b.box(.08,1.9,.12,X.steel,x+Math.cos(ry)*.62+Math.sin(ry)*.25,1.6,z-Math.sin(ry)*.62+Math.cos(ry)*.25,ry);b.box(.4,.06,.12,MT.gold,x+Math.cos(ry)*.62+Math.sin(ry)*.25,1.15,z-Math.sin(ry)*.62+Math.cos(ry)*.25,ry)}
function sconce(b,x,y,z,ry){const X=xmats();b.box(.12,.4,.12,X.iron,x,y,z,ry);b.cyl(.05,.05,.22,MT.linen,x+Math.sin(ry)*.12,y+.3,z+Math.cos(ry)*.12,6);b.add(new T.SphereGeometry(.06,6,4),MT.flame,x+Math.sin(ry)*.12,y+.46,z+Math.cos(ry)*.12)}
function brazier(b,x,y,z){const X=xmats();b.cyl(.08,.12,1.1,X.iron,x,y+.55,z,6);b.cyl(.5,.3,.35,X.iron,x,y+1.25,z,10);b.add(new T.ConeGeometry(.35,.7,6),X.fire,x,y+1.7,z);b.add(new T.ConeGeometry(.2,.5,6),MT.flame,x,y+1.65,z)}
function rug(b,x,y,z,w,d,m){b.box(w,.04,d,m||MT.carpet,x,y+.03,z);b.box(w-.4,.045,d-.4,MT.gold,x,y+.031,z);b.box(w-.6,.05,d-.6,m||MT.carpet,x,y+.032,z)}
function extras(B,m){const X=xmats();
  /* ---- the garden: a wall with a gate, trees, roses, a gazebo with a pond, statues, a welcome sign ---- */
  {const b=B[0],GX=24,Z0=-15,Z1=36;const wall=(x0,z0,x1,z1)=>{const l=Math.hypot(x1-x0,z1-z0);b.box(x1!==x0?l:.7,1.6,z1!==z0?l:.7,MT.stone,(x0+x1)/2,.8,(z0+z1)/2);for(let t=0;t<=l;t+=2.2){const k=t/l;b.box(.9,.35,.9,MT.stone,x0+(x1-x0)*k,1.75,z0+(z1-z0)*k)}};
    wall(-GX,Z0,GX,Z0);wall(-GX,Z0,-GX,Z1);wall(GX,Z0,GX,Z1);wall(-GX,Z1,-3,Z1);wall(3,Z1,GX,Z1);for(const sx of[-1,1]){b.box(1.3,3.4,1.3,MT.stone,sx*3.4,1.7,Z1);b.add(new T.SphereGeometry(.55,10,8),MT.gold,sx*3.4,3.8,Z1);b.box(.1,2.6,.1,X.iron,sx*2.2,1.3,Z1+.6);}
    for(let i=0;i<9;i++){b.box(.08,2.4,.08,X.iron,-2+i*.5,1.2,Z1+.2)}b.box(4.4,.12,.12,X.iron,0,2.3,Z1+.2);b.box(4.4,.12,.12,X.iron,0,.5,Z1+.2);
    b.box(.2,2,.2,MT.wood,5,1,Z1+2.4);b.box(2.6,1,.15,MT.wood,5,2.2,Z1+2.4);
    for(const [x,z,s] of[[-18,-8,1],[18,-8,1.1],[-19,30,.9],[19,30,1],[-19,12,.8],[19,14,.85]])tree(b,x,z,s);
    for(let x=-21;x<=21;x+=1.5)if(Math.abs(x)>4){for(const z of[Z1-1.2]){b.add(new T.IcosahedronGeometry(.45,0),X.leaf,x,.4,z);b.add(new T.SphereGeometry(.13,6,4),Math.random()<.5?X.rose:X.pink,x+.15,.75,z-.1)}}
    for(let z=-12;z<=33;z+=1.5)for(const sx of[-1,1]){b.add(new T.IcosahedronGeometry(.4,0),X.leaf,sx*(GX-1.2),.35,z);if(Math.random()<.6)b.add(new T.SphereGeometry(.12,6,4),pick([X.rose,X.yel,X.white,X.pink]),sx*(GX-1.2)+.1,.7,z)}
    /* gazebo and pond */const gx=-12,gz=24;b.cyl(3.2,3.3,.3,X.marble,gx,.15,gz,16);for(let i=0;i<6;i++){const a=i/6*6.283;b.cyl(.18,.2,3.2,X.marble,gx+Math.cos(a)*2.8,1.75,gz+Math.sin(a)*2.8,8)}b.cyl(3.3,3.3,.3,X.marble,gx,3.45,gz,16);b.add(new T.SphereGeometry(3.1,16,8,0,6.283,0,Math.PI/2),MT.slate,gx,3.5,gz);b.add(new T.SphereGeometry(.3,8,6),MT.gold,gx,6.7,gz);
    b.box(2.4,.45,.6,MT.wood,gx,.6,gz+1.4);b.cyl(3,3.1,.25,MT.stone,gx,.12,gz-7,18);b.cyl(2.7,2.7,.06,X.water,gx,.24,gz-7,18);for(let i=0;i<6;i++){const a=Math.random()*6.283,r=Math.random()*2;b.cyl(.35,.35,.03,X.lily,gx+Math.cos(a)*r,.29,gz-7+Math.sin(a)*r,8);if(i%2)b.add(new T.SphereGeometry(.1,6,4),X.pink,gx+Math.cos(a)*r,.36,gz-7+Math.sin(a)*r)}
    /* statues by the path, benches */for(const sx of[-1,1]){knight(b,sx*2.6,13.5,0);b.box(2.2,.45,.6,MT.wood,sx*5.6,.45,26);b.box(2.2,.6,.12,MT.wood,sx*5.6,.95,26+sx*0)}
    /* ivy on the walls and flower boxes under the ground floor windows */for(const [x,z,ry] of[[-12.6,10.35,0],[12.6,10.35,0],[-15.35,-7,Math.PI/2],[15.35,6,Math.PI/2]])for(let i=0;i<14;i++)b.add(new T.IcosahedronGeometry(.45+Math.random()*.3,0),X.ivy,x+Math.cos(ry)*(Math.random()*3-1.5),.6+Math.random()*6,z+Math.sin(ry)*(Math.random()*3-1.5));
    for(let x=-12.85;x<=12.85;x+=4.2){if(Math.abs(x)<2)continue;const wx=x+.65;if(Math.abs(wx)>14)continue;b.box(1.6,.35,.45,MT.wood,wx,1.05,10.55);for(let i=0;i<4;i++)b.add(new T.SphereGeometry(.13,6,4),[X.rose,X.yel,X.pink,X.white][i],wx-.5+i*.33,1.3,10.55)}
    /* banners on the facade */for(const sx of[-1,1]){b.add(new T.PlaneGeometry(1.5,4.2),sx<0?X.banner:X.bannerB,sx*8.5,FH+2.4,10.42);b.add(new T.PlaneGeometry(.6,.6),MT.gold,sx*8.5,FH+3.1,10.44)}
    /* garden wall collision (with the gate open) */const wb=(x0,z0,x1,z1)=>{const [ax,az]=W(x0,z0),[bx,bz]=W(x1,z1);addBox(Math.min(ax,bx),Math.min(az,bz),Math.max(ax,bx),Math.max(az,bz))};
    wb(-GX-.4,Z0-.4,GX+.4,Z0+.4);wb(-GX-.4,Z0,-GX+.4,Z1);wb(GX-.4,Z0,GX+.4,Z1);wb(-GX,Z1-.4,-2.7,Z1+.4);wb(2.7,Z1-.4,GX,Z1+.4);{const [a,c]=W(gx,gz);addCircle(a,c,.5)}}
  /* ---- ground floor rooms ---- */{const b=B[0];for(const sx of[-1,1]){knight(b,sx*4.6,8.6,Math.PI);b.cyl(.35,.4,FH,X.marble,sx*4,FH/2,4,12);b.cyl(.35,.4,FH,X.marble,sx*4,FH/2,-2.5,12)}
    b.add(new T.PlaneGeometry(2.6,3.6),X.tap,-5.85,2.4,5,Math.PI/2);b.add(new T.PlaneGeometry(2.6,3.6),X.tap,5.85,2.4,5,-Math.PI/2);
    /* harp */{const hx=3.4,hz=-3.6;b.box(.15,2,.15,MT.gold,hx,1,hz);b.box(1.1,.15,.15,MT.gold,hx+.5,.1,hz);b.add(new T.BoxGeometry(.12,1.4,.12),MT.gold,hx+.55,1.15,hz,0,0,-.55);for(let i=0;i<7;i++)b.box(.015,1.6-i*.2,.015,X.white,hx+.12+i*.13,.9-i*.02,hz)}
    for(const [x,z] of[[-11.6,-2.4],[-9.4,-2.4],[-11.6,.9],[-9.4,.9],[-11.6,4.2],[-9.4,4.2]]){b.cyl(.28,.28,.03,X.white,x,.88,z,12);b.cyl(.07,.04,.25,MT.gold,x+.25,1,z+.2,6)}b.box(1.2,1.1,4,MT.wood,-14.2,.55,5.5);
    for(const [x,z] of[[8,-9.6],[10,-9.6],[12,-9.6]]){b.box(.08,.6,.08,X.iron,x,3.4,z);b.add(new T.SphereGeometry(.35,8,6),X.ham,x,2.9,z)}for(let i=0;i<3;i++)b.add(new T.SphereGeometry(.22,8,6),X.bread,9.8+i*.5,.95,1);for(const [x,z] of[[14,9],[13.2,9.4]])b.cyl(.45,.4,.9,X.sack,x,.45,z,8);
    for(const [x,z,ry] of[[-14.7,-8,Math.PI/2],[-14.7,8,Math.PI/2],[14.7,-2,-Math.PI/2],[14.7,6,-Math.PI/2],[-8,-9.7,0],[8,9.7,Math.PI],[-3,9.7,Math.PI],[3,9.7,Math.PI]])sconce(b,x,2.6,z,ry)}
  /* ---- first floor ---- */{const b=B[1],y=FH;rug(b,-10,y,2,5,3.4);b.box(.12,4,.6,MT.wood,-13.9,y+2,-3.6,0);for(let i=0;i<8;i++)b.box(.06,.06,.6,MT.wood,-13.75,y+.4+i*.45,-3.6);table(b,-8,-6,1.6,1,y);candle(b,-8,y+.86,-6);
    b.box(1.6,1.2,.7,MT.wood,9,y+.6,-9.3);b.box(1.2,1.7,.06,X.steel,9,y+2,-9.62);b.box(2.4,.8,1,MT.wood,11.5,y+.4,-1.9);for(const sx of[-1,1]){b.box(.7,.7,.7,MT.wood,11.5+sx*2.1,y+.35,-7.6);candle(b,11.5+sx*2.1,y+.7,-7.6)}rug(b,11.5,y,1.5,4,3);
    rug(b,0,y,4,2.6,8);for(const sx of[-1,1]){b.cyl(.4,.3,.6,MT.stone,sx*5.2,y+.3,8.5,10);b.add(new T.SphereGeometry(.6,10,8),MT.hedge,sx*5.2,y+1.1,8.5)}
    for(const [x,z,ry] of[[-14.7,-6,Math.PI/2],[-14.7,6,Math.PI/2],[14.7,-8,-Math.PI/2],[14.7,6,-Math.PI/2],[-9,9.7,Math.PI],[9,9.7,Math.PI]])sconce(b,x,y+2.6,z,ry)}
  /* ---- second floor ---- */{const b=B[2],y=2*FH;for(let x=-11.5;x<=-7.5;x+=4)for(const sz of[-1,1])b.cyl(.35,.4,FH,X.marble,x,y+FH/2,sz*2.2,12);brazier(b,-12,y,-2.6);brazier(b,-12,y,2.6);
    for(const z of[-4,4]){b.cyl(.6,.6,.08,X.steel,-14.65,y+2.2,z,16,0,Math.PI/2)}b.add(new T.PlaneGeometry(2.6,3.6),X.tap,-5.85,y+2.4,-2,Math.PI/2);
    for(let i=0;i<12;i++){const x=10+Math.random()*4,z=-9+Math.random()*3;b.add(new T.OctahedronGeometry(.18,0),X.gem[i%4],x,y+.95+Math.random()*.3,z)}for(let i=0;i<3;i++){b.box(.06,1.6,.06,X.steel,13.6,y+.8,2+i*.8);b.box(.3,.05,.12,MT.gold,13.6,y+.45,2+i*.8)}b.box(.2,.2,3,MT.wood,13.7,y+1.2,2.8);
    b.box(1,1.1,1,MT.stone,9,y+.55,-2);b.add(new T.TorusGeometry(.22,.06,6,10),MT.gold,9,y+1.25,-2,0,Math.PI/2);b.add(new T.OctahedronGeometry(.16,0),X.gem[0],9,y+1.3,-2);
    for(const [x,z,ry] of[[-14.7,-8,Math.PI/2],[-14.7,8,Math.PI/2],[14.7,-4,-Math.PI/2],[14.7,8,-Math.PI/2]])sconce(b,x,y+2.6,z,ry)}
  /* ---- the roof: lanterns along the battlements ---- */{const b=B[3],y=TOP;for(let x=-12;x<=12;x+=6)for(const sz of[-1,1]){b.box(.1,1.4,.1,X.iron,x,y+.7,sz*9.4);b.box(.3,.35,.3,X.lamp,x,y+1.55,sz*9.4)}for(let z=-6;z<=6;z+=6)for(const sx of[-1,1]){b.box(.1,1.4,.1,X.iron,sx*14.4,y+.7,z);b.box(.3,.35,.3,X.lamp,sx*14.4,y+1.55,z)}}}
/* ---------- things to do in the house ---------- */
const lvl=()=>{const r=PL.y-BY();return r>TOP-1?3:r>2*FH-1?2:r>FH-1?1:0};
function act(lx,lz,r,L,txt,fn){const [x,z]=W(lx,lz);INTER.push({x,z,r,txt:()=>started&&lvl()===L?txt:null,fn})}
function setupActs(){
  act(11.5,-5,2.6,1,'Slaap in het hemelbed',()=>{ENV.time=7.2;PL.hp=PL.hpMax;PL.st=PL.stMax;addLog('Je slaapt heerlijk in het hemelbed en wordt uitgerust wakker.','#9cc552');try{sfx('quest')}catch(e){}try{saveGame(false)}catch(e){}});
  act(-13.2,0,2.2,2,'Ga op de troon zitten',()=>{try{WD.kingdom.card('👑 Op de troon','Je zit op de troon van Eikenhof. Iedereen buigt voor jou... in je verbeelding!',null,6)}catch(e){addLog('Je zit op de troon. Wat voelt dat koninklijk!')}if(!PL.fx.ekThrone){PL.fx.ekThrone=1;giveXp(50)}});
  act(-8,4,2.2,3,'Kijk door de telescoop',()=>{const V=(x,y,z)=>new T.Vector3(x,y,z),b=BY(),[hx,hz]=W(-8,4),y=b+TOP+2;
    cinematic([{d:4,from:V(hx,y,hz),to:V(hx+(0-hx)*.15,y+2,hz+(0-hz)*.15),lf:V(0,8,0),lt:V(0,6,0)},{d:4,from:V(hx,y,hz),to:V(hx,y+3,hz),lf:V(-135,4,345),lt:V(-135,6,345)},{d:4,from:V(hx,y+4,hz),to:V(hx,y+8,hz),lf:V(300,10,-220),lt:V(700,30,-600)}],'Uitzicht vanaf Eikenhof','Eikendal, het meer en de bergen')});
  act(3.4,-3.6,2,0,'Speel op de harp',()=>{try{sfx('quest')}catch(e){}const [x,z]=W(3.4,-3.6);for(let i=0;i<5;i++)setTimeout(()=>{try{floatText(x+(Math.random()-.5),BY()+2+i*.3,z,pick(['♪','♫','♬']),'#ffd27a')}catch(e){}},i*250);addLog('Je tokkelt een vrolijk liedje op de harp.','#ffd27a')});
  act(-12,-7.5,2.6,1,'Lees een boek',()=>{const left=cooldown('ekBook',60);if(left){addLog('Je hebt net gelezen. Probeer het over '+left+' seconden.');return}let t='';try{t=pick(RUMORS).t}catch(e){t='Een oud verhaal over draken en ridders.'}addLog('📖 Je leest: "'+t+'"','#cfe0ff');giveXp(15)});
  act(-13.6,-4,2.6,0,'Warm je op bij het vuur',()=>{PL.hp=Math.min(PL.hpMax,PL.hp+PL.hpMax*.3);addLog('Lekker warm bij het haardvuur. Je voelt je beter.','#ffb070')});
  act(9,22,4.4,0,'Gooi een munt in de fontein (1 goud)',()=>{if(PL.gold<1){addLog('Je hebt geen munt.');return}PL.gold-=1;const r=Math.random();if(r<.08){PL.gold+=60;addLog('✨ De fontein schenkt je 60 goud terug! Wat een geluk!','#ffd27a')}else if(r<.4){PL.hp=PL.hpMax;addLog('💧 Je wens komt uit: je voelt je helemaal fit.','#9cc552')}else addLog('Plons! Je doet een wens...','#cfe0ff');try{sfx('coin')}catch(e){}});
  act(0,11.8,2.6,1,'Zwaai naar het volk',()=>{let n=0;for(const a of actors){if(a.kind!=='npc'||a.dead||Math.hypot(a.x-PL.x,a.z-PL.z)>45)continue;try{saySomething(a,pick(['Hoera!','Leve Eikenhof!','Hallo daar boven!','👋']),3)}catch(e){}n++}addLog(n?'Iedereen in de tuin zwaait terug!':'Er is niemand om naar te zwaaien.','#ffd27a')})}

const _pfE=populateFantasy;populateFantasy=function(){_pfE();const sp=(job,lx,lz,o)=>{const [x,z]=W(lx,lz);try{return spawnNPC(job,x,z,o)}catch(e){console.warn('eikenhof npc',e)}};
  sp('lord',0,6,{name:'Heer Reinout van Eikenhof',ai:'stay'});sp('innkeeper',10.5,-1.5,{name:'Kok Berta',ai:'stay',shop:['bread','stew','roast','cheese','apple','ale'].filter(i=>ITEMS[i])});sp('villager',-10.5,6.5,{name:'Dienstmeid Aleid',ai:'stay'});
  for(const lx of[-2.2,2.2])sp('guard',lx,15,{name:'Wacht van Eikenhof',ai:'stay',face:0})};
/* ---------- inside: hide the floors above you; railings on the roof and balconies; glowing windows ---------- */
let lv=-1;
ANIMS.push(()=>{if(!ROOT||!started)return;const [lx,lz]=toL(PL.x,PL.z),rel=PL.y-BY(),inside=lx>-HX-.4&&lx<HX+.4&&lz>-HZ-.4&&lz<HZ+.4;
  const L=inside?(rel>TOP-1?3:rel>2*FH-1?2:rel>FH-1?1:0):3;if(L!==lv){lv=L;for(let k=0;k<4;k++)G[k].visible=k<=L}
  /* do not walk off the roof or a balcony */let nx=lx,nz=lz;if(rel>TOP-.6&&Math.abs(lx)<HX+1&&Math.abs(lz)<HZ+1){nx=Math.max(-HX+.6,Math.min(HX-.6,lx));nz=Math.max(-HZ+.6,Math.min(HZ-.6,lz))}
  else if((Math.abs(rel-FH)<.5||Math.abs(rel-2*FH)<.5)&&lz>HZ-.2&&Math.abs(lx)<5){nx=Math.max(-3.6,Math.min(3.6,lx));nz=Math.min(12.4,lz)}
  if(nx!==lx||nz!==lz){const [wx,wz]=W(nx,nz);PL.x=wx;PL.z=wz}
  /* a chest upstairs can only be opened on its own floor */for(const q of CH){const on=Math.abs(PL.y-q.c.y)<1.6;q.c.x=on?q.x:q.x+1e5;q.c.z=on?q.z:q.z+1e5}
  if(MT){const n=ENV.night||0;MT.glass.emissiveIntensity=n>.3?.9*n:0}});
WD.herenhuis={FL,RP,W,toL,site,G};
})();
