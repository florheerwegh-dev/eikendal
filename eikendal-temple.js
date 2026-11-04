/* ================= De Zonnetempel =================
   A medieval temple of the sun on a hill east of the village: a stone church with buttresses and stained-glass windows,
   a bell tower with a slate spire and a rose window, an apse behind a golden altar with a floating sun disc, pews,
   candles and banners inside, two stone knights at the door, a well and a churchyard. Praying at the altar heals you. */
(function(){
/* a fixed spot: the highest gentle hill in the east that is free of other places and roads */
const TP=(()=>{let best=null,bs=-1e9;for(let gx=-23;gx<=23;gx++)for(let gz=-23;gz<=23;gz++){const x=380+gx*10,z=330+gz*10;if(Math.hypot(gx,gz)>23)continue;const h=terrainH(x,z);if(h<4||h>45)continue;
  let sl=0;for(const [dx,dz] of[[16,0],[-16,0],[0,16],[0,-16],[12,12],[-12,-12],[12,-12],[-12,12]])sl=Math.max(sl,Math.abs(terrainH(x+dx,z+dz)-h));if(sl>6)continue;
  if(SITES.some(s=>s.id!=='bridge'&&Math.hypot(s.x-x,s.z-z)<s.r+75))continue;if(roadDist(x,z)<20)continue;const sc=h*.3-sl*3;if(sc>bs){bs=sc;best={x,z,h}}}
  return best||{x:420,z:300,h:Math.max(4,terrainH(420,300))}})();
const ROT=Math.round(Math.atan2(-TP.x,-TP.z)/(Math.PI/2))*(Math.PI/2),C=Math.cos(ROT),S=Math.sin(ROT),Y=TP.h;
SITES.push(SITE.temple={id:'temple',name:'Zonnetempel',x:TP.x,z:TP.z,r:46,h:Y,blend:2.2});MAPICON.temple='🏛';WD.temple=TP;
RUMORS.push({t:'Op een heuvel in het oosten staat de oude Zonnetempel. Wie bij het altaar bidt, voelt zich weer sterk, zeggen de priesters.',h:'temple'});
LINES.sunpriest=['De zon ziet alles, reiziger.','Bid bij het altaar als je moe bent.','Deze tempel is ouder dan Eikendal zelf.','De stenen wachters slapen. Hopelijk blijft dat zo.','Wees welkom in het licht.'];
/* local temple coordinates (entrance at +z) to world */
const W=(lx,lz)=>[TP.x+lx*C+lz*S,TP.z-lx*S+lz*C];
const box=(cx,cz,hx,hz)=>{const [x,z]=W(cx,cz),sw=Math.abs(S)>.5;return sw?{x,z,hx:hz,hz:hx}:{x,z,hx,hz}};
const walk=(cx,cz,hx,hz,y)=>{const b=box(cx,cz,hx,hz);bridges.push({x:b.x,z:b.z,hx:b.hx,hz:b.hz,y})};
const block=(cx,cz,hx,hz)=>{const b=box(cx,cz,hx,hz);addBox(b.x-b.hx,b.z-b.hz,b.x+b.hx,b.z+b.hz,{})};
const col=(lx,lz,r)=>{const [x,z]=W(lx,lz);addCircle(x,z,r)};
/* stained glass: lead lines and coloured panes in a pointed window */
function glassTex(){return canvasTex(64,160,(c,w,h)=>{c.clearRect(0,0,w,h);c.save();c.beginPath();c.moveTo(0,h);c.lineTo(0,46);c.quadraticCurveTo(0,8,w/2,0);c.quadraticCurveTo(w,8,w,46);c.lineTo(w,h);c.closePath();c.clip();
  const cols=['#2a5ac8','#c8302a','#e8b030','#3a9a4a','#7a3ac8','#2a8ac8'];for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=16){c.fillStyle=cols[(x/16+y/16*3)%cols.length|0];c.fillRect(x,y,16,16)}
  c.fillStyle='#ffd860';c.beginPath();c.arc(w/2,52,13,0,6.283);c.fill();c.strokeStyle='#1a140c';c.lineWidth=3;for(let y=0;y<=h;y+=16){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}for(let x=0;x<=w;x+=16){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}
  c.beginPath();c.arc(w/2,52,13,0,6.283);c.stroke();c.restore()})}
function roseTex(){return canvasTex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const k=128;c.fillStyle='#1a140c';c.beginPath();c.arc(k,k,126,0,6.283);c.fill();
  const cols=['#2a5ac8','#c8302a','#3a9a4a','#7a3ac8'];for(let i=0;i<16;i++){const a=i/16*6.283;c.fillStyle=cols[i%4];c.beginPath();c.moveTo(k,k);c.arc(k,k,118,a+.04,a+6.283/16-.04);c.closePath();c.fill()}
  for(let i=0;i<16;i++){const a=(i+.5)/16*6.283;c.fillStyle='#e8b030';c.beginPath();c.arc(k+Math.cos(a)*92,k+Math.sin(a)*92,14,0,6.283);c.fill()}
  const g=c.createRadialGradient(k,k,4,k,k,46);g.addColorStop(0,'#fff6c0');g.addColorStop(1,'#ffb020');c.fillStyle=g;c.beginPath();c.arc(k,k,46,0,6.283);c.fill();
  c.strokeStyle='#1a140c';c.lineWidth=5;for(const r of[46,118])c.beginPath(),c.arc(k,k,r,0,6.283),c.stroke()})}
const arch=(w,h)=>{const s=new T.Shape(),r=w/2;s.moveTo(-r,0);s.lineTo(-r,h-r*1.2);s.quadraticCurveTo(-r,h-r*.2,0,h);s.quadraticCurveTo(r,h-r*.2,r,h-r*1.2);s.lineTo(r,0);s.lineTo(-r,0);return new T.ShapeGeometry(s,8)};
function build(){
  const G=new T.Group();G.position.set(TP.x,Y,TP.z);G.rotation.y=ROT;scene.add(G);
  const stone=MAT.stone,dk=new T.MeshStandardMaterial({color:0x6a645c,roughness:.9}),slate=new T.MeshStandardMaterial({color:0x4a4e58,roughness:.75,side:T.DoubleSide}),wood=MAT.wood;
  const B=(w,h,d,m,x,y,z)=>{const o=mapBox(w,h,d,m,x,y,z);o.castShadow=true;o.receiveShadow=true;G.add(o);return o};
  const P0=.45;/* a low stone plinth with two steps in front */
  B(16,P0,42,stone,0,P0/2,0);walk(0,0,8,21,Y+P0);for(let k=1;k<=2;k++){B(6,P0*k/2,.7,stone,0,P0*k/4,21+(2-k)*.7+.35);walk(0,21+(2-k)*.7+.35,3,.35,Y+P0*k/2)}
  const top=P0,WH=9;
  /* the nave: thick walls, buttresses and tall stained-glass windows */
  for(const s of[-1,1]){B(.9,WH,28,stone,s*6,top+WH/2,-1);block(s*6,-1,.6,14.2);
    for(let z=-12;z<=10;z+=5.5){const bt=B(1.2,6.5,1.6,stone,s*6.9,top+3.25,z);B(.9,2.4,1.3,stone,s*6.75,top+7.4,z)}
    for(let z=-9.25;z<=7.5;z+=5.5){const g=new T.Mesh(new T.PlaneGeometry(1.6,4),new T.MeshStandardMaterial({map:glassTex(),transparent:true,alphaTest:.3,side:T.DoubleSide,emissive:0xffffff,emissiveMap:glassTex(),emissiveIntensity:.25}));g.position.set(s*6.47,top+5.2,z);g.rotation.y=s*Math.PI/2;G.add(g);(WD.templeGlass=WD.templeGlass||[]).push(g.material)}}
  B(12.9,WH,.9,stone,0,top+WH/2,-15);block(0,-15,6.4,.6);
  /* the apse behind the altar */
  {const ap=new T.Mesh(new T.CylinderGeometry(4.8,4.8,WH,20,1,true,Math.PI/2,Math.PI),stone);ap.material=stone.clone();ap.material.side=T.DoubleSide;ap.position.set(0,top+WH/2,-15);ap.castShadow=true;G.add(ap);
    const ar=new T.Mesh(new T.SphereGeometry(4.9,20,10,Math.PI/2,Math.PI,0,Math.PI/2),slate);ar.position.set(0,top+WH,-15);G.add(ar);for(let i=0;i<5;i++){const a=Math.PI/2+(i+.5)/5*Math.PI;const [x,z]=W(Math.sin(a)*4.9,-15+Math.cos(a)*4.9);addCircle(x,z,1)}}
  /* the roof: steep slate over the nave */
  {const sh=new T.Shape();sh.moveTo(-7.2,0);sh.lineTo(7.2,0);sh.lineTo(0,7);sh.lineTo(-7.2,0);const g=new T.ExtrudeGeometry(sh,{depth:29.6,bevelEnabled:false});g.translate(0,0,-15.8);const roof=new T.Mesh(g,[stone,slate]);roof.position.y=top+WH;roof.castShadow=true;G.add(roof)}
  /* the bell tower over the entrance, with a spire and the golden sun on top */
  const TH=24;for(const s of[-1,1]){B(2.7,TH,.9,stone,s*2.45,top+TH/2,20.1);B(2.65,WH,.9,stone,s*4.7,top+WH/2,13.3);block(s*4.7,13.3,1.3,.5)}B(2.3,TH-5.4,.9,stone,0,top+5.4+(TH-5.4)/2,20.1);for(const s of[-1,1])B(.9,TH,7.6,stone,s*3.35,top+TH/2,16.7);B(7.6,TH-9,.9,stone,0,top+9+(TH-9)/2,13.3);
  for(const s of[-1,1]){block(s*3.35,16.7,.55,3.8);block(s*2.4,20.1,1.4,.55);block(s*2.4,13.3,1.4,.55)}
  for(const [x,z] of[[-3.8,20.5],[3.8,20.5],[-3.8,12.9],[3.8,12.9]])B(1.3,TH*.75,1.3,stone,x,top+TH*.375,z);
  B(8.6,.6,8.6,stone,0,top+TH+.3,16.7);for(let i=0;i<4;i++){const a=i*Math.PI/2;for(const t of[-2.6,0,2.6]){const x=Math.cos(a)*4+Math.sin(a)*t,z=16.7+Math.sin(a)*4-Math.cos(a)*t;B(1.1,1.1,1.1,stone,x,top+TH+1.15,z)}}
  {const sp=new T.Mesh(new T.ConeGeometry(4.6,11,4),slate);sp.rotation.y=Math.PI/4;sp.position.set(0,top+TH+.6+5.5,16.7);sp.castShadow=true;G.add(sp);
    const sun=new T.Mesh(new T.CircleGeometry(.9,24),new T.MeshStandardMaterial({color:0xffd060,emissive:0xffa020,emissiveIntensity:.6,metalness:.8,roughness:.3,side:T.DoubleSide}));sun.position.set(0,top+TH+12.6,16.7);sun.userData.dyn=true;G.add(sun);WD.templeSun=sun;G.add(mesh(new T.CylinderGeometry(.06,.06,1.2,6),MAT.gold,0,top+TH+11.6,16.7))}
  for(const s of[-1,1])for(const f of[[0,20.56,0],[0,12.84,Math.PI]]){const o=new T.Mesh(arch(1.6,3.2),new T.MeshBasicMaterial({color:0x0c0a08,side:T.DoubleSide}));o.position.set(f[0]+s*1.4,top+TH-6,f[1]);o.rotation.y=f[2];G.add(o)}
  for(const s of[-1,1]){const o=new T.Mesh(arch(1.6,3.2),new T.MeshBasicMaterial({color:0x0c0a08,side:T.DoubleSide}));o.position.set(s*3.81,top+TH-6,16.7);o.rotation.y=s*Math.PI/2;G.add(o)}
  {const rw=new T.Mesh(new T.CircleGeometry(2.2,40),new T.MeshStandardMaterial({map:roseTex(),emissive:0xffffff,emissiveMap:roseTex(),emissiveIntensity:.3,side:T.DoubleSide}));rw.position.set(0,top+11,20.57);G.add(rw);(WD.templeGlass=WD.templeGlass||[]).push(rw.material)}
  /* the doorway: a pointed arch with open oak doors */
  {const d=new T.Mesh(arch(3.4,5.4),new T.MeshBasicMaterial({color:0x0e0b08,side:T.DoubleSide}));d.position.set(0,top+.01,20.57);G.add(d);
    for(const s of[-1,1]){const lf=B(1.7,4.6,.15,wood,0,0,0);lf.position.set(s*2.4,top+2.3,21.2);lf.rotation.y=s*1.2}
    const [lx,lz]=W(-2.6,21.4),[rx,rz]=W(2.6,21.4);lamp(lx,Y+top+3.6,lz,true);lamp(rx,Y+top+3.6,rz,true)}
  /* inside: pews, banners, candles and the altar of the sun at the back */
  for(let z=-7;z<=8;z+=2.2)for(const s of[-1,1]){B(3.6,.12,.5,wood,s*2.6,top+.55,z);B(3.6,.55,.12,wood,s*2.6,top+.9,z-.25);for(const e of[-1,1])B(.12,.55,.5,wood,s*2.6+e*1.7,top+.27,z);const [x,z2]=W(s*2.6,z);addBox(...(()=>{const b=box(s*2.6,z,1.8,.3);return[b.x-b.hx,b.z-b.hz,b.x+b.hx,b.z+b.hz]})(),{})}
  const banner=new T.MeshStandardMaterial({color:0xb08020,side:T.DoubleSide});for(const s of[-1,1])for(const z of[-6,1,7]){const b=new T.Mesh(new T.PlaneGeometry(1.2,3),banner);b.position.set(s*5.5,top+6.4,z);b.rotation.y=s*Math.PI/2;G.add(b)}
  B(3.2,1.1,1.6,stone,0,top+.55,-12.4);B(3.5,.12,1.9,MAT.gold,0,top+1.16,-12.4);block(0,-12.4,1.7,.9);
  for(const x of[-1.2,-.4,.4,1.2]){G.add(mesh(new T.CylinderGeometry(.05,.05,.35,6),mm(0xf4ecd8),x,top+1.4,-12.6,false))}
  {const [cx,cz]=W(0,-12.4);lamp(cx,Y+top+1.7,cz,false)}for(const [x,z] of[[-4.6,-11],[4.6,-11],[-4.6,4],[4.6,4]]){const [wx,wz]=W(x,z);lamp(wx,Y+top+3.2,wz,false);G.add(mesh(new T.CylinderGeometry(.08,.1,3,6),MAT.iron,x,top+1.5,z))}
  const sunM=new T.MeshBasicMaterial({map:WD.tx('ins_sun.png'),color:0xffd27a,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  const disc=new T.Mesh(new T.CircleGeometry(1.4,40),sunM);disc.position.set(0,top+4,-12.4);disc.userData.dyn=true;G.add(disc);WD.templeDisc=disc;
  const beam=new T.Sprite(new T.SpriteMaterial({map:WD.tx('rise_white.png'),color:0xffd890,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false}));beam.scale.set(3,7,1);beam.position.set(0,top+4.3,-12.4);G.add(beam);
  /* two stone knights guard the door */
  for(const s of[-1,1]){B(1.8,1.2,1.8,stone,s*5.6,.6,23.2);col(s*5.6,23.2,1.1);
    try{const h=makeHuman({fem:false,skin:0xb8b0a0,tunic:0xb8b0a0,hairStyle:'bald',beard:'full',hat:'helm',hatc:0xb8b0a0,armor:true,scale:1.9});
      if(h&&h.sk){setHeld(h,'sword_knight','shield_iron');const st=new T.MeshStandardMaterial({color:0xa8a090,roughness:.9,skinning:true}),st2=new T.MeshStandardMaterial({color:0xa8a090,roughness:.9});
        h.g.traverse(m=>{if(m.isMesh)m.material=m.isSkinnedMesh?st:st2});skBase(h,'Sword_Idle',0);h.mixer.update(.4);h.g.position.set(s*5.6,1.2,23.2);G.add(h.g)}}catch(e){console.warn('temple statue',e)}}
  /* a well in front and a path of flagstones */
  {const wx=-7,wz=31;G.add(mesh(new T.CylinderGeometry(1.3,1.4,.9,16,1,true),stone,wx,.45,wz));const wt=new T.Mesh(new T.CircleGeometry(1.2,16),new T.MeshStandardMaterial({color:0x2a4a5a,roughness:.1}));wt.rotation.x=-Math.PI/2;wt.position.set(wx,.6,wz);G.add(wt);
    for(const s of[-1,1])B(.2,2.4,.2,wood,wx+s*1.2,1.2,wz);B(2.8,.2,.2,wood,wx,2.4,wz);const rf=new T.Mesh(new T.ConeGeometry(2,1.2,4),slate);rf.rotation.y=Math.PI/4;rf.position.set(wx,3.1,wz);G.add(rf);col(wx,wz,1.5)}
  for(let z=23;z<=46;z+=1.9){const f=mapBox(2.6,.1,1.6,dk,(z%3.8<1.9?.15:-.15),.05,z);f.receiveShadow=true;G.add(f)}
  /* a churchyard with old gravestones */
  for(let i=0;i<14;i++){const x=10+(i%4)*2.6+hash2(i,81)*.6,z=-12+Math.floor(i/4)*4.2+hash2(i,82),gs=new T.Group();gs.position.set(x,0,z);gs.rotation.set((hash2(i,83)-.5)*.25,(hash2(i,84)-.5)*.3,(hash2(i,85)-.5)*.2);
    gs.add(mapBox(.9,1,.22,dk,0,.5,0));const cap=new T.Mesh(new T.CylinderGeometry(.45,.45,.22,12,1,false,0,Math.PI),dk);cap.rotation.set(Math.PI/2,0,Math.PI/2);cap.position.y=1;gs.add(cap);G.add(gs);col(x,z,.45)}
  G.updateMatrixWorld(true);
  {const [dx,dz]=W(15,-16);try{deadTree(dx,dz,1.3)}catch(e){}}
  const [ax,az]=W(0,-9.8);addInter(ax,az,3.2,()=>PL.t-(PL.fx.prayAt||-1e9)<240?'Het altaar gloeit nog na...':'Bid bij het altaar van de zon',()=>{
    if(PL.t-(PL.fx.prayAt||-1e9)<240){addLog('Het licht van het altaar moet zich eerst herstellen.','#ffd27a');return}PL.fx.prayAt=PL.t;
    PL.hp=PL.hpMax;PL.st=PL.stMax;if(PL.mpMax)PL.mp=PL.mpMax;if(!PL.fx.prayed){PL.fx.prayed=1;giveXp(80)}addLog('De zon zegent je: je bent weer helemaal sterk.','#ffd27a');sfx('level');
    if(window.PW&&PW.ps)pwBurst(PW.ps,PL.x,PL.y+1,PL.z,60,4,1.2,.4,.06,[1,.9,.5],[1,.7,.3],2.5,0,1,1)});
  HIDDEN.push({id:'templealtar',name:'Altaar van de Zon',x:ax,z:az,found:false})}
ANIMS.push(dt=>{const d=WD.templeDisc;if(!d||Math.abs(PL.x-TP.x)>220||Math.abs(PL.z-TP.z)>220)return;d.rotation.z+=dt*.4;d.position.y=.45+4+Math.sin(PL.t*1.2)*.15;if(WD.templeSun)WD.templeSun.rotation.y+=dt*.5;
  const n=ENV.night||0;for(const m of WD.templeGlass||[])m.emissiveIntensity=.2+n*1.1});
const _bfT=buildFantasy;buildFantasy=function(){_bfT();try{build()}catch(e){console.warn('temple',e)}};
const _pfT=populateFantasy;populateFantasy=function(){_pfT();try{
  const [kx,kz]=W(0,-10.4);spawnNPC('priest',kx,kz,{name:'Hogepriesteres Solenne',ai:'stay',shop:['potion','elixir','bread','apple'],face:ROT,line:'sunpriest'});
  for(const [lx,lz] of[[-1,-3],[1,6],[3,30]]){const [x,z]=W(lx,lz);spawnNPC('priest',x,z,{name:'Zonnepriester '+pick(FIRST),roam:{x:TP.x,z:TP.z},radius:16,line:'sunpriest'})}
}catch(e){console.warn('temple folk',e)}};
})();
