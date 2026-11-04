/* ================= Het Wolkenrijk =================
   High above the sea, beside the World Tree, floats a kingdom on the clouds: you see it hanging in the sky from the
   island, with a rainbow bridge that runs from the crown of the World Tree up to it. Walk over the bridge (from the
   basket in the crown) or fly up on your grown dragon. Up there: white houses with golden roofs, silver trees, a fountain
   of light, the cloud people, Wolkenkoning Aurion on his throne terrace, and the Storm Field where Stormreus Thoron and
   his storm golems keep the stolen Sun Harp. Beat Thoron, bring the harp back, and the storm clears, the king rewards
   you and the treasury of the clouds opens.
   It is a place of its own far east in the world (x 80000, like the Oertijd at x 40000), built the first time you go. */
(function(){
const C3=80000,CZ=0,RX=190,RZ=150,inC=x=>x>60000&&x<90000,rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}};
const CL={built:false};WD.cloud=CL;
/* far-east places of their own, each with a name for the HUD */
WD.regions=WD.regions||[];WD.regions.push({x0:60000,x1:90000,name:'Het Wolkenrijk',in:'in het Wolkenrijk',adv:'het Wolkenrijk'});
WD.region=x=>WD.regions.find(r=>x>r.x0&&x<r.x1)||null;
/* the floating copy in the sky of the world, and where the rainbow bridge ends */
const O={x:830,z:2390,y:235,s:.55};
Object.assign(ITEMS,{
  zonneharp:{n:'Zonneharp',g:'mat',price:0,ico:'🎼',rar:'l',desc:'De gouden harp die de zon laat schijnen boven het Wolkenrijk.'},
  hemelzwaard:{n:'Hemelzwaard',g:'weapon',kind:'sword',dmg:92,spd:.45,rng:3.2,price:8000,ico:'⚔',col:0xcfe8ff,rar:'l'},
  wolkenveer:{n:'Wolkenveer',g:'amulet',fx:{jump:.8,spd:.1,hp:30},col:0xeaf4ff,price:4000,ico:'🪶',rar:'l',desc:'Zo licht als een wolk: je springt hoger en loopt sneller.'}});
/* ---------- the ground of clouds ---------- */
const ell=(u,v)=>Math.hypot(u/RX,v/RZ)+(fbm(u*.02+3,v*.02-1,2)-.5)*.08;
function cH(x,z){const u=x-C3,v=z-CZ,d=ell(u,v);if(d>1.02)return -60;let h=3+(fbm(u*.03,v*.03,3)-.5)*3.2;if(d>.9)h-=(d-.9)*90;return h}
const _gC=groundH;groundH=function(x,z){return inC(x)?cH(x,z):_gC(x,z)};
const _tC=terrainH;terrainH=function(x,z){return inC(x)?cH(x,z):_tC(x,z)};
const _cC=gtClamp;gtClamp=function(P){if(!inC(P.x))return _cC(P);const u=P.x-C3,v=P.z-CZ,d=Math.hypot(u/RX,v/RZ);
  if(P===PL&&PL.mounted&&PL.mounted.flyM){if(d>1.3)leaveByAir();return}
  if(d>.9){P.x=C3+u/d*.9;P.z=CZ+v/d*.9}};
const _ueC=updateEnv,SKY=new T.Color(0xe4f0ff),SKYN=new T.Color(0x1a2240);
updateEnv=function(dt,pp){if(pp===PL&&inC(PL.x)){const q=Object.create(PL,{inCave:{value:false,writable:true}});_ueC(dt,q);scene.fog.color.lerp((ENV.night||0)>.5?SKYN:SKY,.6)}else _ueC(dt,pp)};
const _dmC=drawMini;drawMini=function(){if(!inC(PL.x))return _dmC();const c=$('mini'),g=c.getContext('2d'),S=150,k=S/440;g.fillStyle='#9cc4ec';g.fillRect(0,0,S,S);
  g.fillStyle='#f4f8ff';g.beginPath();g.ellipse(S/2-(PL.x-C3)*k,S/2-(PL.z-CZ)*k,RX*k,RZ*k,0,0,6.283);g.fill();
  for(const a of actors){if(a.dead||!inC(a.x))continue;const dx=(a.x-PL.x)*k,dz=(a.z-PL.z)*k;if(Math.abs(dx)<74&&Math.abs(dz)<74){g.fillStyle=a.kind==='enemy'?(a.boss?'#ff4a2a':'#e5913f'):'#4a7ac8';g.fillRect(S/2+dx-2,S/2+dz-2,4,4)}}
  g.fillStyle='#ffd27a';g.beginPath();g.arc(S/2,S/2,4,0,6.283);g.fill();g.fillStyle='#3a4a6a';g.font='bold 13px serif';g.textAlign='center';g.fillText('Wolkenrijk',S/2,14)};
/* ---------- places on the clouds (u, v from the centre) ---------- */
const P={arr:[-168,0],vill:[-85,0],thr:[25,-70],keep:[25,-104],tre:[32,72],storm:[132,32],fount:[0,0]};
const W=(p,du=0,dv=0)=>({x:C3+p[0]+du,z:CZ+p[1]+dv});
function bag(){const L=new Map();return{add(geo,mat,m){let g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);g.clearGroups();if(!L.has(mat))L.set(mat,[]);L.get(mat).push(g)},
  build(par){for(const [mat,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const g of mg?[mg]:gs){const me=new T.Mesh(g,mat);me.castShadow=me.receiveShadow=true;par.add(me)}}}}}
const MX=(x,y,z,ry=0,s=1,sy)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(0,ry,0)),new T.Vector3(s,sy??s,s));
const M={cloud:new T.MeshStandardMaterial({color:0xd8e0ee,roughness:1,emissive:0x101828,emissiveIntensity:.2}),under:new T.MeshStandardMaterial({color:0xc4cfe2,roughness:1,emissive:0x0c1220,emissiveIntensity:.2}),
  marble:new T.MeshStandardMaterial({color:0xf2efe8,roughness:.45}),gold:new T.MeshStandardMaterial({color:0xe8c050,roughness:.35,metalness:.6,emissive:0x4a3008,emissiveIntensity:.3}),
  silver:new T.MeshStandardMaterial({color:0xcfe0f0,roughness:.6,emissive:0x203040,emissiveIntensity:.25}),trunk:new T.MeshStandardMaterial({color:0xe8e8f0,roughness:.7}),
  storm:new T.MeshStandardMaterial({color:0x3a4250,roughness:1,transparent:true,opacity:.92}),glow:new T.MeshBasicMaterial({color:0xfff2b0})};
const blobGeo=(()=>{const g=new T.IcosahedronGeometry(1,2),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.12*Math.sin(x*4+z*3)+.08*Math.sin(y*5);p.setXYZ(i,x*n,y*n,z*n)}g.computeVertexNormals();return g})();
/* a puffy cloud made of blobs */
function puff(B,mat,x,y,z,r,n=6){for(let i=0;i<n;i++){const s=r*(.5+Math.random()*.5);B.add(blobGeo,mat,MX(x+rr(r*.9),y+rr(r*.25),z+rr(r*.9),Math.random()*6,s,s*.7))}}
/* ---------- the floating copy in the sky of the world, and the rainbow bridge from the World Tree ---------- */
const BR={curve:null};
function buildSky(){const B=bag();for(let i=0;i<46;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random()),u=Math.cos(a)*RX*r*O.s,v=Math.sin(a)*RZ*r*O.s;puff(B,M.cloud,O.x+u,O.y-4-Math.random()*6,O.z+v,14+Math.random()*10,3)}
  for(let i=0;i<20;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*.8;puff(B,M.under,O.x+Math.cos(a)*RX*r*O.s,O.y-16-Math.random()*14,O.z+Math.sin(a)*RZ*r*O.s,12+Math.random()*8,3)}
  /* the castle on top, so you can see it from far */
  const kx=O.x+P.keep[0]*O.s,kz=O.z+P.keep[1]*O.s;B.add(new T.CylinderGeometry(5.5,6,26,16),M.marble,MX(kx,O.y+11,kz));B.add(new T.ConeGeometry(6.6,12,16),M.gold,MX(kx,O.y+30,kz));
  for(const [dx,dz] of[[-12,8],[12,8],[-10,-8],[10,-8]]){B.add(new T.CylinderGeometry(2.4,2.6,16,12),M.marble,MX(kx+dx,O.y+6,kz+dz));B.add(new T.ConeGeometry(3,7,12),M.gold,MX(kx+dx,O.y+17,kz+dz))}
  const g=new T.Group();B.build(g);scene.add(g);CL.sky=g;
  /* the rainbow bridge: a ribbon of colour from the crown of the World Tree up to the clouds */
  const Wt=WD.great&&WD.great.worldTree;if(!Wt||!Wt.built)return;const y0=Wt.y+88,a0=new T.Vector3(250+44,y0,2330+14),a3=new T.Vector3(O.x+P.arr[0]*O.s-8,O.y+2,O.z+P.arr[1]*O.s);
  const curve=new T.CatmullRomCurve3([a0,new T.Vector3(a0.x+150,y0+90,a0.z+40),new T.Vector3(a3.x-140,a3.y+40,a3.z+10),a3]);BR.curve=curve;
  const N=160,W2=3.2,pos=[],uv=[],idx=[];for(let i=0;i<=N;i++){const t=i/N,p=curve.getPoint(t),tg=curve.getTangent(t),side=new T.Vector3(-tg.z,0,tg.x).normalize().multiplyScalar(W2);
    pos.push(p.x-side.x,p.y,p.z-side.z,p.x+side.x,p.y,p.z+side.z);uv.push(0,t*20,1,t*20);if(i<N){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  const cv=document.createElement('canvas');cv.width=64;cv.height=4;const q=cv.getContext('2d');['#ff4a3a','#ff9a2a','#ffe24a','#5ad06a','#4a8aff','#8a5aff'].forEach((c,i)=>{q.fillStyle=c;q.fillRect(i*64/6,0,64/6+1,4)});
  const rb=new T.Mesh(geo,new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,opacity:.78,side:T.DoubleSide,depthWrite:false}));scene.add(rb);CL.bridge=rb}
const _bfC=buildFantasy;buildFantasy=function(){_bfC();try{buildSky()}catch(e){console.warn('wolken sky',e)}};
/* ---------- going up and coming back ---------- */
function go(x,z){if(PL.mounted&&!PL.mounted.flyM)try{dismount()}catch(e){}PL.x=x;PL.z=z;PL.y=groundH(x,z)+.3;PL.vy=0}
function arrive(){build();PL.fx=PL.fx||{};if(!PL.fx.seenCloud){PL.fx.seenCloud=1;giveXp(1000);try{WD.chron.add('Ontdekte het Wolkenrijk boven de zee.')}catch(e){}card('☁ Het Wolkenrijk','Boven de wolken ligt een koninkrijk van licht. Maar boven het Stormveld hangt een donkere storm... Wolkenkoning Aurion wacht op zijn terras.',null,10)}}
CL.go=function(){if(!BR.curve||!window.cinematic||CIN.on){build();const a=W(P.arr,6);go(a.x,a.z);arrive();return}closeModals();const c=BR.curve,p=t=>c.getPoint(t),up=new T.Vector3(0,4,0);
  cinematic([{d:3.4,from:p(0).add(new T.Vector3(-8,6,-10)),to:p(.3).add(up),lf:p(.08),lt:p(.42)},{d:3.4,from:p(.36).add(new T.Vector3(20,10,-25)),to:p(.7).add(new T.Vector3(10,12,-20)),lf:p(.5),lt:p(.85)},{d:3,from:p(.78).add(up),to:p(.98).add(new T.Vector3(-6,5,0)),lf:p(.92),lt:new T.Vector3(O.x,O.y+8,O.z)}],
    'De regenboogbrug','Naar het Wolkenrijk',()=>{build();const a=W(P.arr,6);go(a.x,a.z);arrive()})};
function back(){const Wt=WD.great.worldTree,L=Wt&&Wt.lift,dst=L?{x:L.x+2.5,z:L.z}:{x:240,z:2170};const fin=()=>go(dst.x,dst.z);
  if(!BR.curve||!window.cinematic||CIN.on){fin();return}const c=BR.curve,p=t=>c.getPoint(t),up=new T.Vector3(0,4,0);
  cinematic([{d:3,from:p(1).add(up),to:p(.6).add(up),lf:p(.9),lt:p(.4)},{d:3.4,from:p(.55).add(new T.Vector3(-20,14,25)),to:p(.1).add(new T.Vector3(-10,8,20)),lf:p(.35),lt:p(0)}],'De regenboogbrug','Terug naar de Wereldboom',fin)}
/* on your dragon: fly into the floating clouds to land up there, fly off the edge up there to come back down */
ANIMS.push(()=>{if(!started||!PL.mounted||!PL.mounted.flyM||inC(PL.x)||CIN.on)return;if(Math.hypot((PL.x-O.x)/(RX*O.s),(PL.z-O.z)/(RZ*O.s))<1.05&&PL.y>O.y-30){
  build();PL.x=C3+(PL.x-O.x)/O.s*.8;PL.z=CZ+(PL.z-O.z)/O.s*.8;addLog('Je vliegt door de wolken... en daar ligt het Wolkenrijk!','#cfe8ff');arrive()}});
function leaveByAir(){const u=PL.x-C3,v=PL.z-CZ,d=Math.hypot(u/RX,v/RZ)||1;PL.x=O.x+u/d*1.25*O.s;PL.z=O.z+v/d*1.25*O.s;addLog('Je vliegt van de wolken af, terug naar de wereld.','#cfe8ff')}
/* ---------- building the kingdom on the clouds (the first time you go) ---------- */
const G=new T.Group();
function build(){if(CL.built)return;CL.built=true;scene.add(G);
  /* the cloud floor: soft white, sinking away at the edge, with puffs all round and below */
  {const g=new T.PlaneGeometry(RX*2+40,RZ*2+40,110,90);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+C3,z=p.getZ(i)+CZ;p.setY(i,Math.max(-40,cH(x,z)))}g.computeVertexNormals();const me=new T.Mesh(g,M.cloud);me.position.set(C3,0,CZ);me.receiveShadow=true;G.add(me)}
  const B=bag();
  for(let i=0;i<90;i++){const a=i/90*6.283,u=Math.cos(a)*RX*.97,v=Math.sin(a)*RZ*.97;puff(B,M.cloud,C3+u,-2-Math.random()*6,CZ+v,9+Math.random()*7,3)}
  for(let i=0;i<60;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*.85;puff(B,M.under,C3+Math.cos(a)*RX*r,-22-Math.random()*20,CZ+Math.sin(a)*RZ*r,14+Math.random()*10,3)}
  /* a sea of clouds far below, and soft clouds drifting around */
  {const cv=document.createElement('canvas');cv.width=cv.height=256;const q=cv.getContext('2d');q.fillStyle='#cfdcef';q.fillRect(0,0,256,256);for(let i=0;i<120;i++){const r=10+Math.random()*30,x=Math.random()*256,y=Math.random()*256,gr=q.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.8)');gr.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=gr;q.fillRect(x-r,y-r,r*2,r*2)}
    const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(8,8);const sea=new T.Mesh(new T.PlaneGeometry(3000,3000),new T.MeshBasicMaterial({map:t,fog:true}));sea.rotation.x=-Math.PI/2;sea.position.set(C3,-70,CZ);G.add(sea);CL.sea=t}
  for(let i=0;i<24;i++){const a=Math.random()*6.283,r=260+Math.random()*300;puff(B,M.cloud,C3+Math.cos(a)*r,-30+Math.random()*60,CZ+Math.sin(a)*r,18+Math.random()*16,5)}
  /* walls of cloud stop you at the edge (and keep the monsters on the clouds) */
  for(let i=0;i<150;i++){const a=i/150*6.283;addCircle(C3+Math.cos(a)*RX*.93,CZ+Math.sin(a)*RZ*.93,2.6)}
  /* marble paths between the places */
  const path=(a,b)=>{const ax=C3+a[0],az=CZ+a[1],bx=C3+b[0],bz=CZ+b[1],L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/2.2);for(let i=0;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;B.add(new T.CylinderGeometry(1.5,1.5,.18,8),M.marble,MX(x+rr(.3),cH(x,z)+.06,z+rr(.3),Math.random()))}};
  path(P.arr,P.vill);path(P.vill,P.fount);path(P.fount,P.thr);path(P.fount,P.tre);path(P.fount,P.storm);
  /* the fountain of light in the middle */
  {const f=W(P.fount),y=cH(f.x,f.z);B.add(new T.CylinderGeometry(6,6.4,1,24),M.marble,MX(f.x,y+.5,f.z));B.add(new T.CylinderGeometry(.8,1,6,12),M.marble,MX(f.x,y+3,f.z));B.add(new T.SphereGeometry(1.4,16,12),M.glow,MX(f.x,y+6.8,f.z));
    const w=new T.Mesh(new T.CircleGeometry(5.6,24),new T.MeshBasicMaterial({color:0xbfe8ff,transparent:true,opacity:.8}));w.rotation.x=-Math.PI/2;w.position.set(f.x,y+1.02,f.z);G.add(w);addCircle(f.x,f.z,6.2);CL.fount={x:f.x,y:y+6.8,z:f.z}}
  /* the cloud village: round white houses with golden roofs */
  for(let i=0;i<7;i++){const a=i/7*6.283+.3,x=C3+P.vill[0]+Math.cos(a)*30,z=CZ+P.vill[1]+Math.sin(a)*30,y=cH(x,z),r=3.2+Math.random();
    B.add(new T.CylinderGeometry(r,r*1.05,4.2,16),M.marble,MX(x,y+2.1,z));B.add(new T.ConeGeometry(r*1.25,3.6,16),M.gold,MX(x,y+6,z));B.add(new T.BoxGeometry(1.2,2.2,.2),M.trunk,MX(x-Math.cos(a)*r,y+1.1,z-Math.sin(a)*r,-a+Math.PI/2));addCircle(x,z,r+.2)}
  /* silver trees */
  for(let i=0,n=0;i<300&&n<26;i++){const u=rr(RX*.85),v=rr(RZ*.85);if(ell(u,v)>.82)continue;if(Object.values(P).some(p=>Math.hypot(u-p[0],v-p[1])<26))continue;const x=C3+u,z=CZ+v,y=cH(x,z),h=4+Math.random()*3;n++;
    B.add(new T.CylinderGeometry(.18,.32,h,7),M.trunk,MX(x,y+h/2,z));puff(B,M.silver,x,y+h+1.2,z,2.2,4);addCircle(x,z,.5)}
  /* the throne terrace of the Cloud King: a ring of columns under a golden dome, and the white keep behind it */
  {const t=W(P.thr),y=cH(t.x,t.z);B.add(new T.CylinderGeometry(15,15.6,1.2,32),M.marble,MX(t.x,y+.6,t.z));
    for(let i=0;i<12;i++){const a=i/12*6.283;if(Math.abs(Math.sin(a)-1)<.05)continue;B.add(new T.CylinderGeometry(.6,.7,9,12),M.marble,MX(t.x+Math.cos(a)*13,y+5.7,t.z+Math.sin(a)*13));addCircle(t.x+Math.cos(a)*13,t.z+Math.sin(a)*13,.8)}
    B.add(new T.TorusGeometry(13,.6,8,48),M.gold,new T.Matrix4().compose(new T.Vector3(t.x,y+10.3,t.z),new T.Quaternion().setFromEuler(new T.Euler(Math.PI/2,0,0)),new T.Vector3(1,1,1)));
    B.add(new T.SphereGeometry(13,32,16,0,6.283,0,Math.PI/2),M.gold,MX(t.x,y+10.3,t.z,0,1,.55));
    B.add(new T.BoxGeometry(3.2,1,2.4),M.gold,MX(t.x,y+1.7,t.z-4));B.add(new T.BoxGeometry(3.2,4.4,.6),M.gold,MX(t.x,y+3.4,t.z-5.1));CL.throne={x:t.x,z:t.z-3.2}
    const k=W(P.keep),ky=cH(k.x,k.z);B.add(new T.CylinderGeometry(10,11,46,24),M.marble,MX(k.x,ky+23,k.z));B.add(new T.ConeGeometry(12,20,24),M.gold,MX(k.x,ky+56,k.z));addCircle(k.x,k.z,11.2);
    for(const [dx,dz] of[[-20,12],[20,12],[-18,-12],[18,-12]]){B.add(new T.CylinderGeometry(4,4.4,28,16),M.marble,MX(k.x+dx,ky+14,k.z+dz));B.add(new T.ConeGeometry(5,11,16),M.gold,MX(k.x+dx,ky+33.5,k.z+dz));addCircle(k.x+dx,k.z+dz,4.6)}}
  /* the treasury: a small domed temple with a golden door */
  {const t=W(P.tre),y=cH(t.x,t.z);B.add(new T.CylinderGeometry(7,7.4,7,24),M.marble,MX(t.x,y+3.5,t.z));B.add(new T.SphereGeometry(7.2,24,12,0,6.283,0,Math.PI/2),M.gold,MX(t.x,y+7,t.z));B.add(new T.BoxGeometry(2.6,4,.4),M.gold,MX(t.x,y+2,t.z-7.1));addCircle(t.x,t.z,7.4);
    CL.door={x:t.x,z:t.z-8.6};addInter(CL.door.x,CL.door.z,3.4,()=>PL.fx&&PL.fx.cloudTreasure?'':'Open de schatkamer van de wolken',treasury);INTER[INTER.length-1].cave=true}
  /* the Storm Field: dark clouds and lightning over Thoron's lair */
  {const s=W(P.storm),y=cH(s.x,s.z);const SB=bag();for(let i=0;i<16;i++)puff(SB,M.storm,s.x+rr(34),y+26+rr(4),s.z+rr(30),9+Math.random()*6,3);const sg=new T.Group();SB.build(sg);G.add(sg);CL.stormCloud=sg;
    for(let i=0;i<10;i++){const x=s.x+rr(26),z=s.z+rr(22);B.add(new T.DodecahedronGeometry(1.2+Math.random()*1.4,0),new T.MeshStandardMaterial({color:0x6a7484,roughness:1}),MX(x,cH(x,z)+.6,z,Math.random()*3));addCircle(x,z,1.4)}}
  /* the bridge head where the rainbow lands */
  {const a=W(P.arr),y=cH(a.x,a.z);for(const s of[-1,1]){B.add(new T.CylinderGeometry(.6,.7,7,12),M.marble,MX(a.x-4,y+3.5,a.z+s*4.5));B.add(new T.SphereGeometry(.9,12,10),M.gold,MX(a.x-4,y+7.4,a.z+s*4.5));addCircle(a.x-4,a.z+s*4.5,.8)}
    const cv=document.createElement('canvas');cv.width=64;cv.height=4;const q=cv.getContext('2d');['#ff4a3a','#ff9a2a','#ffe24a','#5ad06a','#4a8aff','#8a5aff'].forEach((c,i)=>{q.fillStyle=c;q.fillRect(i*64/6,0,64/6+1,4)});
    const rb=new T.Mesh(new T.PlaneGeometry(6.4,60),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false}));rb.rotation.set(-Math.PI/2+.5,0,Math.PI/2);rb.position.set(a.x-32,y-12,a.z);G.add(rb);
    addInter(a.x,a.z,4.5,'Loop terug over de regenboogbrug naar de Wereldboom',back);INTER[INTER.length-1].cave=true}
  B.build(G);
  /* the people of the clouds, their king, and Thoron with his golems */
  const npc=(job,p,o)=>{const a=spawnNPC(job,p.x,p.z,{cave:true,...o});a.cave=true;return a};
  const k=npc('lord',{x:CL.throne.x,z:CL.throne.z},{name:'Wolkenkoning Aurion',ai:'stay'});k.rot=0;k.face=0;try{k.root.scale.setScalar(1.35)}catch(e){}CL.king=k;
  for(let i=0;i<7;i++){const a=i/7*6.283,p=W(P.vill,Math.cos(a)*14,Math.sin(a)*14);const v=npc('villager',p,{name:pick(['Nimbus','Stella','Zefier','Lumina','Altair','Celeste','Iris','Sirius','Aura'])+' de Wolkenmens',line:'grootland'});v.roam={x:p.x,z:p.z};v.radius=18}
  spawnStorm()}
function tint(a,col,k){a.root.traverse(o=>{if(o.isMesh&&o.material&&o.material.color){o.material=o.material.clone();o.material.color.lerp(new T.Color(col),k)}})}
function spawnStorm(){if(PL.fx&&PL.fx.cloudQ>=2)return;const s=W(P.storm);
  const h=makeHuman({skin:0xc8d4e6,tunic:0x4a5a7a,pants:0x2a3448,hairStyle:'bald',beard:'full',hair:0xe8eef8,face:2,scale:2.7,eye:0x9ad8ff});try{setHeld(h,'club_troll')}catch(e){}
  const a=baseActor({kind:'enemy',type:'troll',name:'Stormreus Thoron',h,root:h.g,x:s.x+4,z:s.z+4,hp:4200,hpMax:4200,dmg:46,speed:3.6,aggro:26,range:4.4,rad:1.6,hh:6.4,xp:3200,loot:'troll',boss:'stormreus',respawn:1e12,cave:true});scene.add(a.root);placeActor(a);CL.thoron=a;
  for(let i=0;i<3;i++){const an=i/3*6.283;try{const g=spawnMonster('golem',s.x+Math.cos(an)*16,s.z+Math.sin(an)*14,{name:'Stormgolem',hp:700,hpMax:700,dmg:30,xp:400,cave:true,respawn:1e12});tint(g,0xbfd8ff,.6)}catch(e){console.warn('golem',e)}}}
/* lightning over the Storm Field while Thoron has the harp */
const FL={t:3,m:null};
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!CL.built||!inC(PL.x))return;if(CL.sea)CL.sea.offset.x+=dt*.004;if(CL.fount&&window.PW&&PW.ps&&Math.random()<dt*8)pwEm(PW.ps,CL.fount.x+rr(1),CL.fount.y,CL.fount.z+rr(1),rr(.6),2+Math.random(),rr(.6),2,.25,.05,[1,1,.8],[.8,.9,1],1,-1,1);
  if(PL.fx&&PL.fx.cloudQ>=2){if(CL.stormCloud&&CL.stormCloud.visible){CL.stormCloud.visible=false}return}
  FL.t-=dt;if(FL.m){FL.m.material.opacity-=dt*4;if(FL.m.material.opacity<=0){G.remove(FL.m);FL.m=null}}
  if(FL.t<=0){FL.t=2+Math.random()*4;const s=W(P.storm),x=s.x+rr(28),z=s.z+rr(24),y=cH(x,z),pts=[];let px=x,pz=z;for(let i=0;i<=8;i++){pts.push(new T.Vector3(px,y+26-i*3.2,pz));px+=rr(1.6);pz+=rr(1.6)}
    if(FL.m)G.remove(FL.m);FL.m=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xe8f4ff,transparent:true,opacity:1}));G.add(FL.m);if(Math.hypot(PL.x-x,PL.z-z)<140)try{sfx('thunder')}catch(e){}
    if(Math.hypot(PL.x-x,PL.z-z)<3.5&&!PL.dead)try{damagePlayer(25,null)}catch(e){}}});
/* ---------- the story: the stolen Sun Harp ---------- */
const _kaC=killActor;killActor=function(a,by){const was=a&&a.dead;_kaC(a,by);if(!was&&a===CL.thoron){PL.fx=PL.fx||{};giveItem('zonneharp',1,true);PL.fx.cloudQ=Math.max(PL.fx.cloudQ||0,1);sfx('level');
  card('🎼 De Zonneharp!','Stormreus Thoron valt met een donderslag neer. Tussen zijn spullen glanst de gouden Zonneharp. Breng haar terug naar Wolkenkoning Aurion!',null,10)}};
const _dmW=dlgMain;dlgMain=function(a,text){_dmW(a,text);try{if(a!==CL.king)return;const box=document.querySelector('#dlg #dopts');if(!box)return;const q=(PL.fx&&PL.fx.cloudQ)||0;const add=(l,f)=>{const b=document.createElement('button');b.className='btn pri';b.textContent=l;b.onclick=f;box.insertBefore(b,box.firstChild)};
  if(q===0)add('☁ Waarom hangt er een storm boven uw rijk?',()=>{closeModals();card('Wolkenkoning Aurion','"Stormreus Thoron heeft onze Zonneharp gestolen. Zonder haar muziek trekt de storm over ons rijk. Hij woont op het Stormveld, in het oosten, met zijn stormgolems. Breng de harp terug, en de wolken zullen je rijk belonen."',null,12)});
  if(q===1&&hasItem('zonneharp'))add('🎼 Geef de Zonneharp terug',()=>{closeModals();takeItem('zonneharp',1);PL.fx.cloudQ=2;PL.gold+=2000;try{WD.chron.add('Bracht de Zonneharp terug naar het Wolkenrijk.')}catch(e){}giveItem('wolkenveer',1,true);giveXp(2500);sfx('level');try{for(let i=0;i<8;i++)setTimeout(()=>sfx('chirp'),i*200)}catch(e){}
    card('☀ De zon schijnt weer!','Aurion tokkelt op de Zonneharp. De storm lost op en de zon breekt door. "Dank je, held van de wolken! Hier, 2000 goud en de Wolkenveer. En de schatkamer staat nu voor je open."',null,12)})}catch(e){console.warn('wolken dlg',e)}};
function treasury(){PL.fx=PL.fx||{};if(PL.fx.cloudTreasure)return;if((PL.fx.cloudQ||0)<2){addLog('De gouden deur zit op slot. Alleen de Wolkenkoning kan haar openen.','#e5766a');return}
  PL.fx.cloudTreasure=1;PL.gold+=5000;giveItem('hemelzwaard',1,true);if(ITEMS.gem)giveItem('gem',5,true);giveXp(1500);sfx('level');
  card('💰 De schatkamer van de wolken','Achter de gouden deur glinstert het: 5000 goud, vijf edelstenen en het Hemelzwaard, licht als een wolk en scherp als een bliksem!',null,12)}
/* the place name for the HUD and the homecoming */
CL.inside=()=>inC(PL.x);
/* if you saved up there, the kingdom is built again when you load */
const _sgC=startGame;startGame=function(...a){_sgC(...a);try{if(inC(PL.x)){build();PL.y=groundH(PL.x,PL.z)+.3}}catch(e){console.warn('wolken load',e)}};
})();
