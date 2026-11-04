/* ================= Het Eiland van de Wereldboom, at the edge of the world =================
   Far in the south, where the world ends, lies a big green island. On its hill stands De Wereldboom: an ancient tree
   as tall as a tower, with roots like walls and a crown of golden leaves, where lights float in the air. At its foot
   glows Het Hart van de Wereld: touch it once and the tree blesses you (more life, for ever); after that it heals you
   once a day. Druid Eldrin watches over it, and unicorns graze in the meadows. A basket on a rope takes you up into the
   crown: there lies an ancient nest with a treasure, and a giant eagle flies you back to the mainland.
   Behind the island is De Rand van de Wereld: the sea pours over the edge of the world into the stars.
   You get there with the ferryman of the Vuurtoren Zuidkaap (or by boat, or later by the travel stone). */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,GL=WD.great||(WD.great={}),card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}};
const IS={x:250,z:2345,rx:340,rz:235},TREE={x:250,z:2330};
/* ---------- the island ---------- */
function islandK(x,z){const d=Math.hypot((x-IS.x)/IS.rx,(z-IS.z)/IS.rz)+(fbm(x*.006+4,z*.006-2,3)-.5)*.34+(fbm(x*.025,z*.025,2)-.5)*.08;return 1-smooth(.74,1.02,d)}
function islandH(x,z){const d=Math.hypot(x-TREE.x,z-TREE.z);return 4.2+(fbm(x*.01+9,z*.01,4)-.5)*9+(1-smooth(24,170,d))*14+Math.max(0,fbm(x*.006-3,z*.006+7,3)-.55)*40}
const inIsle=(x,z)=>z>1980&&Math.abs(x-IS.x)<IS.rx+130;
const _fc=WD.fineChunk;WD.fineChunk=(x,z,mx)=>(_fc&&_fc(x,z,mx))||(mx>2&&Math.abs(x-IS.x)<IS.rx+100&&Math.abs(z-IS.z)<IS.rz+100);
const _ex=GL.extraH;GL.extraH=(x,z,h)=>{if(_ex)h=_ex(x,z,h);if(!inIsle(x,z))return h;const k=islandK(x,z);return k<=0?h:Math.max(h,lerp(h,islandH(x,z),k))};
/* the old river line runs on under the sea: it must not cut a channel through the island */
const _tW=terrainH;terrainH=function(x,z){const h=_tW(x,z);if(!inIsle(x,z))return h;const k=islandK(x,z);if(k<=0)return h;let b=baseH(x,z);for(const s of SITES){const d=Math.hypot(x-s.x,z-s.z),t=1-smooth(s.r,s.r*(s.blend||1.5),d);if(t>0)b=lerp(b,s.h,t)}return lerp(h,b,smooth(0,.3,k))};
const hAt=(x,z)=>{let s=0;for(const [dx,dz] of[[0,0],[8,0],[-8,0],[0,8],[0,-8]])s+=baseH(x+dx,z+dz);return s/5};
SITES.push(SITE.wereldboom={id:'wereldboom',name:'Eiland van de Wereldboom',x:TREE.x,z:TREE.z,r:44,h:hAt(TREE.x,TREE.z),blend:1.7,great:true});MAPICON.wereldboom='🌳';
/* the north beach (where the ferry lands) and the south shore, found on the real ground */
const shore=(x,z0,dz)=>{let z=z0;for(;Math.abs(z-z0)<400;z+=dz)if(terrainH(x,z)<.9)break;return{x,z:z-dz*7}};let BEACH={x:TREE.x-10,z:TREE.z-200};
WAYDEF.push(['wereldboom','Reissteen Wereldboom',TREE.x+30,TREE.z-40]);
RUMORS.push({t:'Oude vissers vertellen van een eiland aan de rand van de wereld, waar een boom groeit die zo oud is als de wereld zelf. De veerman bij de Vuurtoren Zuidkaap durft er soms heen te varen.'});
Object.assign(ITEMS,{gouden_blad:{n:'Gouden Blad van de Wereldboom',g:'amulet',fx:{hp:40,regen:1.2,xp:.1},col:0xe0b04a,price:6000,ico:'🍂',rar:'l',desc:'Een blad van de Wereldboom, hard als goud. Wie het draagt, groeit sneller en geneest vanzelf.'}});
/* ---------- the World Tree ---------- */
const W={};GL.worldTree=W;
function bag(){const L=new Map();return{add(geo,mat,m){let g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);g.clearGroups();if(!L.has(mat))L.set(mat,[]);L.get(mat).push(g)},
  build(){for(const [mat,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const g of mg?[mg]:gs){const me=new T.Mesh(g,mat);me.castShadow=me.receiveShadow=true;scene.add(me)}}}}}
const UP=new T.Vector3(0,1,0);
function limb(B,mat,a,b,r0,r1){const d=b.clone().sub(a),len=d.length();B.add(new T.CylinderGeometry(r1,r0,len,10),mat,new T.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(UP,d.normalize()),new T.Vector3(1,1,1)))}
function buildTree(){const B=bag(),y=groundH(TREE.x,TREE.z),bark=new T.MeshStandardMaterial({color:0x4a3626,roughness:1,map:MAT.bark&&MAT.bark.map||null}),V=(x,yy,z)=>new T.Vector3(TREE.x+x,y+yy,TREE.z+z),HA=-Math.PI/2,LA=0;
  /* a gnarled, twisting trunk that flares out at the foot */
  {const g=new T.CylinderGeometry(8.5,13,84,32,20);const p=g.attributes.position;for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i),pz=p.getZ(i),a=Math.atan2(pz,px),f=1+Math.pow(Math.max(0,(-py-22)/20),2)*.55,n=(1+.14*Math.sin(a*6+py*.09)+.07*Math.sin(a*13-py*.25))*f,tw=py*.006;p.setXYZ(i,(px*Math.cos(tw)-pz*Math.sin(tw))*n+Math.sin(py*.05)*1.6,py,(px*Math.sin(tw)+pz*Math.cos(tw))*n)}g.computeVertexNormals();B.add(g,bark,new T.Matrix4().makeTranslation(TREE.x,y+38,TREE.z))}
  /* roots like walls, curving down into the ground (leaving the way to the Heart and to the basket free) */
  for(let k=0;k<16;k++){const a=k/16*6.283+.1;if(Math.abs(Math.atan2(Math.sin(a-HA),Math.cos(a-HA)))<.3||Math.abs(Math.atan2(Math.sin(a-LA),Math.cos(a-LA)))<.25)continue;const r1=20+Math.random()*4,r2=30+Math.random()*12,P0=V(Math.cos(a)*9,14,Math.sin(a)*9),P1=V(Math.cos(a+.06)*r1,3.5,Math.sin(a+.06)*r1),P2=V(Math.cos(a+.12)*r2,-1.5,Math.sin(a+.12)*r2);
    limb(B,bark,P0,P1,4.4,2.6);limb(B,bark,P1,P2,2.6,.7);B.add(new T.SphereGeometry(2.6,10,8),bark,new T.Matrix4().makeTranslation(P1.x,P1.y,P1.z));for(const [q,rad] of[[.5,2.4],[.8,1.4]])addCircle(TREE.x+Math.cos(a)*(14+q*(r2-14)),TREE.z+Math.sin(a)*(14+q*(r2-14)),rad)}
  /* great branches with side branches, and the golden crown */
  const gold=new T.MeshStandardMaterial({color:0xd8b040,roughness:.75,emissive:0x5a4010,emissiveIntensity:.35}),gold2=new T.MeshStandardMaterial({color:0xe8c860,roughness:.7,emissive:0x6a5018,emissiveIntensity:.35}),green=new T.MeshStandardMaterial({color:0x6a9a2a,roughness:.8,emissive:0x1a2a08,emissiveIntensity:.2});
  const blob=new T.IcosahedronGeometry(1,2);{const p=blob.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),yy=p.getY(i),z=p.getZ(i),n=1+.16*Math.sin(x*5+z*3)+.1*Math.sin(yy*6+x*2)+.06*Math.sin(z*9);p.setXYZ(i,x*n,yy*n*.8,z*n)}blob.computeVertexNormals()}
  const leaf=(c,r)=>{const m=Math.random();B.add(blob,m<.5?gold:m<.8?gold2:green,new T.Matrix4().compose(c,new T.Quaternion().setFromEuler(new T.Euler(rr(.5),rr(3),rr(.5))),new T.Vector3(r,r*.72,r)))};
  W.ends=[];for(let k=0;k<16;k++){const a=k/16*6.283+Math.random()*.25,h0=56+Math.random()*18,len=34+Math.random()*16,el=.22+Math.random()*.45,s=V(Math.cos(a)*5,h0,Math.sin(a)*5),e=V(Math.cos(a)*(5+len*Math.cos(el)),h0+len*Math.sin(el),Math.sin(a)*(5+len*Math.cos(el)));
    limb(B,bark,s,e,3.2,1);W.ends.push(e);const mid=s.clone().lerp(e,.55);
    for(const sd of[-1,1]){const b=a+sd*(.5+Math.random()*.3),l2=14+Math.random()*8,e2=mid.clone().add(new T.Vector3(Math.cos(b)*l2,6+Math.random()*8,Math.sin(b)*l2));limb(B,bark,mid,e2,1.4,.45);W.ends.push(e2);leaf(e2.clone().add(new T.Vector3(0,3,0)),9+Math.random()*4)}
    for(let q=0;q<3;q++)leaf(e.clone().add(new T.Vector3(rr(7),rr(3)+3,rr(7))),10+Math.random()*5)}
  for(let q=0;q<14;q++){const a=Math.random()*6.283,r=Math.random()*30;leaf(V(Math.cos(a)*r,88+Math.random()*16-r*.2,Math.sin(a)*r),14+Math.random()*7)}
  addCircle(TREE.x,TREE.z,14.6);
  /* the hollow and the Heart of the World in a cradle of roots, facing the beach */
  {const a=HA,hx=TREE.x+Math.cos(a)*19,hz=TREE.z+Math.sin(a)*19,hy=groundH(hx,hz);const arch=new T.Mesh(new T.CircleGeometry(4.2,24,0,Math.PI),new T.MeshBasicMaterial({color:0x0c0806,side:T.DoubleSide}));arch.position.set(TREE.x+Math.cos(a)*15.4,y-.3,TREE.z+Math.sin(a)*15.4);arch.rotation.y=Math.PI;scene.add(arch);
    for(const s of[-1,1]){limb(B,bark,new T.Vector3(hx+s*2.6,hy-.3,hz+1),new T.Vector3(hx+s*.9,hy+3,hz+.4),.7,.3);limb(B,bark,new T.Vector3(hx+s*5,hy+6,hz+4),new T.Vector3(hx+s*2.4,hy-.4,hz+.6),1.6,.9)}
    const heart=new T.Mesh(new T.IcosahedronGeometry(1.1,0),new T.MeshStandardMaterial({color:0x9affc8,emissive:0x2aff9a,emissiveIntensity:1.4,roughness:.2,metalness:.2,transparent:true,opacity:.92}));heart.position.set(hx,hy+2.6,hz);heart.userData.dyn=true;scene.add(heart);
    const ray=new T.Mesh(new T.CylinderGeometry(.7,1.3,16,16,1,true),new T.MeshBasicMaterial({color:0x9affc8,transparent:true,opacity:.1,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));ray.position.set(hx,hy+9,hz);ray.userData.dyn=true;scene.add(ray);
    W.heart={m:heart,ray,x:hx,z:hz,y:hy+2.6};addCircle(hx,hz,1.1);addInter(hx,hz-2,4.5,'Raak het Hart van de Wereld aan',touchHeart)}
  /* a basket on a rope up to the crown */
  {const a=LA,bx=TREE.x+Math.cos(a)*17.5,bz=TREE.z+Math.sin(a)*17.5,by=groundH(bx,bz),top=y+62-by;B.add(new T.CylinderGeometry(.05,.05,top,5),MAT.wood,new T.Matrix4().makeTranslation(bx,by+top/2,bz));B.add(new T.BoxGeometry(1.8,1.1,1.8),MAT.wood,new T.Matrix4().makeTranslation(bx,by+.55,bz));
    B.add(new T.TorusGeometry(1.05,.07,6,16),MAT.wood,new T.Matrix4().compose(new T.Vector3(bx,by+1.15,bz),new T.Quaternion().setFromEuler(new T.Euler(Math.PI/2,0,0)),new T.Vector3(1,1,1)));B.add(new T.CylinderGeometry(.6,.6,.5,10),MAT.wood,new T.Matrix4().makeTranslation(bx,by+top,bz));
    W.lift={x:bx,z:bz};addCircle(bx,bz,1);addInter(bx+2,bz,3.8,'Ga met de mand naar de kroon van de Wereldboom',climb)}
  B.build();W.built=true;W.y=y}
/* ---------- the edge of the world: the sea falls into the stars ---------- */
function buildEdge(){const Z=HALF+249,X0=IS.x-650,X1=IS.x+650;
  /* the sea speeds up and streams to the edge: streaks of foam on the water, brighter towards the lip */
  {const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');for(let i=0;i<70;i++){g.fillStyle='rgba(255,255,255,'+(.15+Math.random()*.5)+')';g.fillRect(Math.random()*128,Math.random()*128,1+Math.random()*2,10+Math.random()*40)}
    const fade=document.createElement('canvas');fade.width=4;fade.height=128;const q=fade.getContext('2d'),gr=q.createLinearGradient(0,128,0,0);gr.addColorStop(0,'#fff');gr.addColorStop(.6,'#595959');gr.addColorStop(1,'#000');q.fillStyle=gr;q.fillRect(0,0,4,128);
    const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(26,2);const m=new T.Mesh(new T.PlaneGeometry(X1-X0,80),new T.MeshBasicMaterial({map:tex,alphaMap:new T.CanvasTexture(fade),color:0xe8f4ff,transparent:true,opacity:.8,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set((X0+X1)/2,.07,Z-40);scene.add(m);W.falls={m,tex}}
  const lip=new T.Mesh(new T.PlaneGeometry(X1-X0,5),new T.MeshBasicMaterial({color:0xf4faff,transparent:true,opacity:.85,depthWrite:false}));lip.rotation.x=-Math.PI/2;lip.position.set((X0+X1)/2,.09,Z-2.5);scene.add(lip);
  /* a rainbow stands over the spray */
  {const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d'),RO=300,RI=262,gr=g.createRadialGradient(256,256,RI/RO*256,256,256,256);
    [[0,'rgba(140,60,255,0)'],[.12,'rgba(140,60,255,.8)'],[.28,'rgba(60,90,255,.8)'],[.44,'rgba(60,220,120,.8)'],[.6,'rgba(255,240,60,.8)'],[.76,'rgba(255,150,40,.8)'],[.9,'rgba(255,50,40,.8)'],[1,'rgba(255,50,40,0)']].forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,512,512);
    const rb=new T.Mesh(new T.RingGeometry(RI,RO,96,1,.44,Math.PI-.88),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,opacity:.32,depthWrite:false,side:T.DoubleSide,fog:false,blending:T.AdditiveBlending}));rb.position.set(IS.x+40,-110,Z+30);scene.add(rb);W.rainbow=rb}
  /* spray and mist rise where the sea pours over the edge */
  {const cv=document.createElement('canvas');cv.width=cv.height=64;const q=cv.getContext('2d'),rg=q.createRadialGradient(32,32,2,32,32,32);rg.addColorStop(0,'rgba(255,255,255,.9)');rg.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=rg;q.fillRect(0,0,64,64);const mt=new T.CanvasTexture(cv);W.mist=[];
    for(let i=0;i<44;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:mt,transparent:true,opacity:.32,depthWrite:false,color:0xeef6ff}));const s=45+Math.random()*60;sp.scale.set(s*1.7,s,1);sp.position.set(X0+(i+.5)/44*(X1-X0)+rr(15),2+Math.random()*24,Z+6+rr(10));sp.userData.dyn=true;scene.add(sp);W.mist.push({sp,y0:sp.position.y,ph:Math.random()*6})}}
  /* a sign on the south beach */
  {W.sign=shore(TREE.x+10,TREE.z+60,2);
    if(W.sign){const yy=groundH(W.sign.x,W.sign.z),cv=document.createElement('canvas');cv.width=512;cv.height=160;const q=cv.getContext('2d');q.fillStyle='#5a4028';q.fillRect(0,0,512,160);q.fillStyle='#f0e0c0';q.font='bold 46px serif';q.textAlign='center';q.fillText('HIER EINDIGT',256,66);q.fillText('DE WERELD',256,124);
      /* it faces the island, so you can read it as you walk to the shore */const b=new T.Mesh(new T.PlaneGeometry(4.4,1.38),new T.MeshStandardMaterial({map:new T.CanvasTexture(cv)}));b.rotation.y=Math.PI;b.position.set(W.sign.x,yy+2.6,W.sign.z-.1);scene.add(b);scene.add(mesh(new T.BoxGeometry(4.6,1.5,.08),MAT.wood,W.sign.x,yy+2.6,W.sign.z+.0));scene.add(mesh(new T.BoxGeometry(.2,2.6,.2),MAT.wood,W.sign.x,yy+1.3,W.sign.z+.1));addCircle(W.sign.x,W.sign.z,.3)}}}
/* ---------- what happens ---------- */
function touchHeart(){PL.fx=PL.fx||{};const day=Math.floor((PL.t||0)/600);
  if(!PL.fx.worldBlessing){PL.fx.worldBlessing=1;PL.hpMax+=50;PL.hp=PL.hpMax;PL.st=PL.stMax;giveXp(1500);sfx('level');burst();card('🌳 De zegen van de Wereldboom','Je legt je hand op het Hart van de Wereld. Het is warm en het klopt, net als jouw hart. Een golf van groen licht stroomt door je heen: je bent voor altijd sterker (50 extra levenspunten).',null,12);return}
  if(PL.fx.heartDay===day){addLog('Het Hart van de Wereld rust. Kom morgen terug.');return}PL.fx.heartDay=day;PL.hp=PL.hpMax;PL.st=PL.stMax;burst();sfx('level');addLog('Het Hart van de Wereld geneest al je wonden.','#9cffc8')}
function burst(){if(!(window.PW&&PW.ps)||!W.heart)return;const h=W.heart;for(let i=0;i<70;i++){const a=Math.random()*6.283,v=3+Math.random()*5;pwEm(PW.ps,h.x,h.y,h.z,Math.cos(a)*v,2+Math.random()*6,Math.sin(a)*v,1.6,.5,.05,[.6,1,.8],[.2,1,.5],1,-2,1)}}
function climb(){if(!window.cinematic||CIN.on)return;const V=(a,b,c)=>new T.Vector3(a,b,c),y=W.y,L=W.lift;
  cinematic([{d:3.4,from:V(L.x+34,y+5,L.z+16),to:V(L.x+38,y+56,L.z+18),lf:V(L.x,y+3,L.z),lt:V(L.x,y+62,L.z)},{d:3.6,from:V(TREE.x+40,y+80,TREE.z+30),to:V(TREE.x-34,y+86,TREE.z+40),lf:V(TREE.x,y+76,TREE.z),lt:V(TREE.x,y+74,TREE.z)},
    {d:3.4,from:V(TREE.x-10,y+104,TREE.z-24),to:V(TREE.x-50,y+130,TREE.z-170),lf:V(TREE.x,y+60,TREE.z),lt:V(TREE.x,0,TREE.z-900)}],'De kroon van de Wereldboom','Van hier zie je de hele wereld',()=>setTimeout(top,200))}
function top(){PL.fx=PL.fx||{};const btn=[['🦅 Vlieg met de arend naar Eikendal',()=>eagle('Eikendal',{x:20,z:40})],['🦅 Vlieg naar de Vuurtoren Zuidkaap',()=>eagle('de Vuurtoren Zuidkaap',SITE.vuurtoren?{x:SITE.vuurtoren.x+8,z:SITE.vuurtoren.z-8}:{x:-540,z:1600})],['Ga weer naar beneden',()=>{}]];if(WD.cloud&&WD.cloud.go)btn.splice(2,0,['🌈 Loop over de regenboogbrug naar het Wolkenrijk',()=>WD.cloud.go()]);
  if(!PL.fx.treeNest){PL.fx.treeNest=1;PL.gold+=3000;giveItem('gouden_blad',1,true);['gem','pearl'].forEach(i=>{if(ITEMS[i])giveItem(i,3,true)});giveXp(1000);sfx('level');
    /* level-ups also show a card, so this one comes just after */setTimeout(()=>card('🪺 Het nest in de kroon','Tussen de gouden takken ligt een eeuwenoud nest. Daarin: 3000 goud, edelstenen, parels en een Gouden Blad van de Wereldboom! Een reuzenarend landt naast je en buigt zijn kop: hij wil je wel ergens heen vliegen.',btn),900)}
  else card('🦅 De reuzenarend','De arend wacht op je in de kroon van de boom. Waar wil je heen?',btn)}
function eagle(name,p){if(!window.cinematic||CIN.on)return;if(PL.mounted)try{dismount()}catch(e){}const V=(a,b,c)=>new T.Vector3(a,b,c),y=W.y;
  cinematic([{d:3,from:V(TREE.x,y+100,TREE.z),to:V((TREE.x+p.x)/2,380,(TREE.z+p.z)/2),lf:V(p.x,0,p.z),lt:V(p.x,0,p.z)},{d:3,from:V((TREE.x+p.x)/2,380,(TREE.z+p.z)/2),to:V(p.x,groundH(p.x,p.z)+30,p.z+30),lf:V(p.x,0,p.z),lt:V(p.x,groundH(p.x,p.z),p.z)}],'Op de rug van de reuzenarend','Naar '+name,()=>{PL.x=p.x;PL.z=p.z;PL.y=groundH(p.x,p.z)+.5;PL.vy=0})}
function ferry(to){const FROM=to==='island'?(SITE.vuurtoren?{x:SITE.vuurtoren.x,z:SITE.vuurtoren.z}:{x:-556,z:1615}):BEACH,DEST=to==='island'?{x:BEACH.x+2,z:BEACH.z+3}:(SITE.vuurtoren?{x:SITE.vuurtoren.x+8,z:SITE.vuurtoren.z-6}:{x:-540,z:1600});
  if(to==='island'){if(PL.gold<60){addLog('De overtocht kost 60 goud.','#e5766a');return}PL.gold-=60;sfx('coin')}closeModals();if(PL.mounted)try{dismount()}catch(e){}
  const V=(a,b,c)=>new T.Vector3(a,b,c),mid={x:(FROM.x+DEST.x)/2,z:(FROM.z+DEST.z)/2};
  const go=()=>{PL.x=DEST.x;PL.z=DEST.z;PL.y=groundH(DEST.x,DEST.z)+.3;PL.vy=0};
  if(window.cinematic&&!CIN.on)cinematic([{d:3,from:V(FROM.x,8,FROM.z),to:V(mid.x,6,mid.z),lf:V(mid.x,2,mid.z),lt:V(DEST.x,2,DEST.z)},{d:3,from:V(mid.x,6,mid.z),to:V(DEST.x,6,DEST.z-14),lf:V(DEST.x,4,DEST.z),lt:V(TREE.x,60,TREE.z)}],'Met de veerman over zee',to==='island'?'Naar het eiland aan de rand van de wereld':'Terug naar de Vuurtoren Zuidkaap',go);else go()}
W.ferry=ferry;
const _dmW=dlgMain;dlgMain=function(a,text){_dmW(a,text);try{const box=document.querySelector('#dlg #dopts');if(!box)return;const add=(l,f)=>{const b=document.createElement('button');b.className='btn pri';b.textContent=l;b.onclick=f;box.insertBefore(b,box.firstChild)};
  if(a.name==='Vuurtorenwachter Bram')add('⛵ Vaar naar het eiland aan de rand van de wereld (60 goud)',()=>ferry('island'));
  if(a.name==='Veerman Tobias')add('⛵ Vaar terug naar de Vuurtoren Zuidkaap',()=>ferry('back'))}catch(e){console.warn('wereldboom dlg',e)}};
/* ---------- build, people, life ---------- */
const _bfW=buildFantasy;buildFantasy=function(){_bfW();try{BEACH=shore(TREE.x-10,TREE.z-60,-2)}catch(e){}try{buildTree()}catch(e){console.warn('wereldboom',e)}try{buildEdge()}catch(e){console.warn('rand',e)}
  try{const bx=BEACH.x,bz=BEACH.z,y=groundH(bx,bz);const boat=new T.Group();boat.position.set(bx-5,.05,bz-13);boat.rotation.y=.6;boat.add(mesh(new T.BoxGeometry(1.6,.6,4.4),MAT.wood,0,.3,0));boat.add(mesh(new T.BoxGeometry(1.2,.1,3.8),MAT.wood,0,.62,0));scene.add(boat)}catch(e){}};
const _pfW=populateFantasy;populateFantasy=function(){_pfW();try{
  if(W.heart)spawnNPC('hermit',W.heart.x+4,W.heart.z-2,{name:'Druïde Eldwyn',ai:'stay',line:'grootland'});
  spawnNPC('villager',BEACH.x+3,BEACH.z+1,{name:'Veerman Tobias',ai:'stay',line:'grootland'});
  for(let i=0;i<3;i++){const a=i/3*6.283+.5,x=TREE.x+Math.cos(a)*95,z=TREE.z+Math.sin(a)*95;const u=spawnHorse(x,z,0xf4f0fa);u.name='Eenhoorn';u.model.mult=1.7;u.mult=1.7;if(!(window.unicornHorn&&window.unicornHorn(u)))try{u.model.rig.add(mesh(new T.ConeGeometry(.07,.8,6),new T.MeshBasicMaterial({color:0xfff0a0}),0,2.8,1.55,false))}catch(e){}}
  for(let i=0;i<5;i++)try{spawnAnimal(pick(['deer','rabbit','deer']),TREE.x+rr(150),TREE.z+rr(150))}catch(e){}}catch(e){console.warn('wereldboom people',e)}};
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!W.built)return;const d=Math.hypot(PL.x-TREE.x,PL.z-TREE.z),t=PL.t;
  if(W.falls&&d<1400){W.falls.tex.offset.y+=dt*.5;for(const m of W.mist||[]){m.sp.position.y=m.y0+Math.sin(t*.4+m.ph)*3;m.sp.material.opacity=.26+Math.sin(t*.3+m.ph)*.08}}
  if(d>600)return;if(W.heart){W.heart.m.rotation.y+=dt*.8;W.heart.m.rotation.x+=dt*.3;const s=1+Math.sin(t*2.4)*.12;W.heart.m.scale.setScalar(s);W.heart.ray.material.opacity=.07+Math.sin(t*2.4)*.03}
  if(window.PW&&PW.ps&&d<320){if(Math.random()<dt*18){const e=pick(W.ends);pwEm(PW.ps,e.x+rr(14),e.y+rr(6),e.z+rr(14),rr(.4),-.6-Math.random()*.6,rr(.4),5,.35,.2,[1,.85,.35],[1,.7,.2],.9,.05,1)}
    if(Math.random()<dt*10){const a=Math.random()*6.283,r=18+Math.random()*40;pwEm(PW.ps,TREE.x+Math.cos(a)*r,W.y+1+Math.random()*4,TREE.z+Math.sin(a)*r,rr(.3),.3+Math.random()*.4,rr(.3),3,.18,.05,[.6,1,.8],[.9,1,.6],1,0,1)}}
  PL.fx=PL.fx||{};if(!PL.fx.seenTree&&d<170&&started&&!PL.inCave){PL.fx.seenTree=1;giveXp(600);addLog('Je staat voor De Wereldboom, aan de rand van de wereld!','#e0b04a');
    if(window.cinematic&&!CIN.on&&!PL.mounted){const V=(a,b,c)=>new T.Vector3(a,b,c),y=W.y;cinematic([{d:3.8,from:V(TREE.x-150,y+14,TREE.z-200),to:V(TREE.x-70,y+46,TREE.z-110),lf:V(TREE.x,y+30,TREE.z),lt:V(TREE.x,y+80,TREE.z)},{d:3.6,from:V(TREE.x+90,y+120,TREE.z+50),to:V(TREE.x+40,y+90,TREE.z+230),lf:V(TREE.x,y+70,TREE.z),lt:V(TREE.x,-40,HALF+250)}],'De Wereldboom','Aan de rand van de wereld')}}});
})();
