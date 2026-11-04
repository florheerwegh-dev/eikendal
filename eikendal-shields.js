/* ================= More shields =================
   New shapes and looks: a Norman kite shield, the heater shield of Eikendal with the golden oak, a tall tower shield
   with iron bands, a small spiked buckler, and legendary shields from the great bosses: the web shield of the Spider
   Queen, the kraken shield, the sun shield of the temple and the ice shield of the north. The smiths sell the common
   ones; the legendary ones drop from bosses or are sold at the temple. */
(function(){
Object.assign(ITEMS,{
  shield_buckler:{n:'Beukelaar met punten',g:'shield',kind:'shield',col:0x8a929c,def:.52,price:95,ico:'◔'},
  shield_kite:{n:'Vliegerschild',g:'shield',kind:'shield',col:0xa82a22,def:.72,price:260,ico:'◔'},
  shield_heater:{n:'Wapenschild van Eikendal',g:'shield',kind:'shield',col:0x2f6a3a,def:.76,price:380,ico:'◔'},
  shield_tower:{n:'Torenschild',g:'shield',kind:'shield',col:0x5a4028,def:.86,price:560,ico:'◔'},
  shield_sun:{n:'Zonneschild',g:'shield',kind:'shield',col:0xe0b04a,def:.84,price:1400,ico:'◔',rar:'e'},
  shield_kraken:{n:'Kraakschild',g:'shield',kind:'shield',col:0x1f5a5a,def:.87,price:1600,ico:'◔',rar:'e'},
  shield_spider:{n:'Webschild van Arachnea',g:'shield',kind:'shield',col:0x3a2050,def:.9,price:3600,ico:'◔',rar:'l'},
  shield_frost:{n:'IJsschild van Noordheim',g:'shield',kind:'shield',col:0x9ad8ff,def:.93,price:4200,ico:'◔',rar:'l'}});
WEAPONS_BASIC.push('shield_buckler');WEAPONS_HIGH.push('shield_kite','shield_heater');WEAPONS_KNIGHT.push('shield_tower','shield_heater');
/* legendary shields drop from bosses */
{const k=LOOTX.kraken;LOOTX.kraken=()=>{const L=k();if(Math.random()<.6)L.items.push(['shield_kraken',1]);return L}}
{const q=LOOTX.spiderqueen;if(q)LOOTX.spiderqueen=()=>{const L=q();if(Math.random()<.5)L.items.push(['shield_spider',1]);return L}}

const tx=(fn)=>{const t=canvasTex(256,256,fn);t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.offset.set(.5,.5);return t};
const SH={
  kite:()=>{const s=new T.Shape();s.moveTo(0,.52);s.quadraticCurveTo(.33,.48,.31,.16);s.lineTo(0,-.6);s.lineTo(-.31,.16);s.quadraticCurveTo(-.33,.48,0,.52);return s},
  heater:()=>{const s=new T.Shape();s.moveTo(-.33,.4);s.lineTo(.33,.4);s.lineTo(.33,.06);s.quadraticCurveTo(.31,-.32,0,-.5);s.quadraticCurveTo(-.31,-.32,-.33,.06);s.lineTo(-.33,.4);return s},
  tower:()=>{const s=new T.Shape();s.moveTo(-.33,.62);s.lineTo(.33,.62);s.lineTo(.33,-.58);s.quadraticCurveTo(0,-.66,-.33,-.58);s.lineTo(-.33,.62);return s}};
const FACE={
  kite:c=>{c.fillStyle='#f0e8d8';c.fillRect(0,0,256,256);c.fillStyle='#a82a22';c.fillRect(128,0,128,256);c.fillStyle='#e0b04a';c.fillRect(116,20,24,216);c.fillRect(50,80,156,24)},
  heater:c=>{c.fillStyle='#2f6a3a';c.fillRect(0,0,256,256);c.fillStyle='#e0b04a';c.fillRect(0,0,256,14);c.beginPath();c.arc(128,96,46,0,6.283);c.fill();c.fillRect(120,120,16,70);c.fillRect(96,182,64,10);
    c.fillStyle='#2f6a3a';for(const [x,y] of[[110,80],[146,84],[128,108]]){c.beginPath();c.arc(x,y,8,0,6.283);c.fill()}},
  tower:c=>{c.fillStyle='#5a4028';c.fillRect(0,0,256,256);c.strokeStyle='rgba(30,20,10,.6)';c.lineWidth=3;for(let x=0;x<256;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,256);c.stroke()}
    c.fillStyle='#6a6e74';for(const y of[30,128,226])c.fillRect(0,y-10,256,20);c.fillStyle='#9a9ea4';for(const y of[30,128,226])for(let x=16;x<256;x+=40){c.beginPath();c.arc(x,y,4,0,6.283);c.fill()}},
  sun:c=>{c.fillStyle='#c89428';c.fillRect(0,0,256,256);c.fillStyle='#ffe07a';for(let i=0;i<16;i++){c.save();c.translate(128,128);c.rotate(i/16*6.283);c.beginPath();c.moveTo(-10,30);c.lineTo(0,120);c.lineTo(10,30);c.fill();c.restore()}const g=c.createRadialGradient(128,128,4,128,128,46);g.addColorStop(0,'#fff6c0');g.addColorStop(1,'#ffb020');c.fillStyle=g;c.beginPath();c.arc(128,128,46,0,6.283);c.fill()},
  kraken:c=>{c.fillStyle='#1f5a5a';c.fillRect(0,0,256,256);c.strokeStyle='#9af0d8';c.lineWidth=9;c.lineCap='round';for(let i=0;i<8;i++){c.save();c.translate(128,128);c.rotate(i/8*6.283);c.beginPath();c.moveTo(0,20);c.bezierCurveTo(30,50,-20,80,10,112);c.stroke();c.restore()}c.fillStyle='#ffd060';c.beginPath();c.arc(128,128,18,0,6.283);c.fill()},
  spider:c=>{c.fillStyle='#1a1020';c.fillRect(0,0,256,256);c.strokeStyle='#c890ff';c.lineWidth=2.5;for(let i=0;i<12;i++){const a=i/12*6.283;c.beginPath();c.moveTo(128,128);c.lineTo(128+Math.cos(a)*126,128+Math.sin(a)*126);c.stroke()}for(let r=14;r<126;r+=14){c.beginPath();for(let i=0;i<=12;i++){const a=i/12*6.283;i?c.lineTo(128+Math.cos(a)*r,128+Math.sin(a)*r):c.moveTo(128+Math.cos(a)*r,128+Math.sin(a)*r)}c.stroke()}c.fillStyle='#ff3a3a';for(const [x,y] of[[118,120],[138,120],[112,130],[144,130]]){c.beginPath();c.arc(x,y,4,0,6.283);c.fill()}},
  frost:c=>{const g=c.createLinearGradient(0,0,256,256);g.addColorStop(0,'#e8f8ff');g.addColorStop(1,'#6ab8f0');c.fillStyle=g;c.fillRect(0,0,256,256);c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=4;for(let i=0;i<6;i++){c.save();c.translate(128,128);c.rotate(i/6*6.283);c.beginPath();c.moveTo(0,0);c.lineTo(0,110);for(const d of[40,70])c.moveTo(0,d),c.lineTo(18,d+18),c.moveTo(0,d),c.lineTo(-18,d+18);c.stroke();c.restore()}}};
const MCACHE={};
function faceMat(k,opt={}){if(MCACHE[k])return MCACHE[k];const t=canvasTex(256,256,FACE[k]);t.wrapS=t.wrapT=T.ClampToEdgeWrapping;
  const m=new T.MeshStandardMaterial({map:t,roughness:opt.r??.55,metalness:opt.m??.25,emissive:opt.e||0,emissiveMap:opt.e?t:null,emissiveIntensity:opt.ei||0,transparent:!!opt.op,opacity:opt.op||1});return MCACHE[k]=m}
function flatShield(shape,mat,edge){const g=new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1});
  const uv=g.attributes.uv,p=g.attributes.position;for(let i=0;i<uv.count;i++){uv.setXY(i,p.getX(i)/1.3+.5,p.getY(i)/1.3+.5)}const m=new T.Mesh(g,[mat,edge]);m.position.z=-.02;return m}
const steel=()=>MAT.iron;
function makeShield(id){const g=new T.Group();let face=null;
  if(id==='shield_buckler'){g.add(mesh(new T.CylinderGeometry(.27,.27,.05,18),MAT.iron,0,0,0));g.children[0].rotation.x=Math.PI/2;g.add(mesh(new T.ConeGeometry(.07,.16,8),MAT.gold,0,0,.1));g.children[1].rotation.x=Math.PI/2;
    for(let i=0;i<6;i++){const a=i/6*6.283,s=mesh(new T.ConeGeometry(.025,.12,6),MAT.iron,Math.cos(a)*.2,Math.sin(a)*.2,.06);s.rotation.x=Math.PI/2;g.add(s)}g.add(mesh(new T.TorusGeometry(.27,.02,5,18),MAT.gold,0,0,0))}
  else if(id==='shield_kite')g.add(flatShield(SH.kite(),faceMat('kite'),MAT.wood));
  else if(id==='shield_heater'){g.add(flatShield(SH.heater(),faceMat('heater'),MAT.gold))}
  else if(id==='shield_tower')g.add(flatShield(SH.tower(),faceMat('tower',{r:.8,m:.1}),MAT.iron));
  else{const k=id.slice(7),opt={sun:{m:.7,r:.3,e:0xffa020,ei:.35},kraken:{m:.3,e:0x2affc0,ei:.25},spider:{e:0xb060ff,ei:.6,r:.4},frost:{m:.1,r:.12,e:0x6ad0ff,ei:.35,op:.9}}[k]||{};
    const r=k==='frost'?.46:.44,m=mesh(new T.CylinderGeometry(r,r,.06,24),[MAT.iron,faceMat(k,opt),MAT.iron],0,0,0);m.rotation.x=Math.PI/2;m.rotation.y=Math.PI/2;g.add(m);
    g.add(mesh(new T.TorusGeometry(r,.03,6,24),k==='frost'?new T.MeshStandardMaterial({color:0xcff0ff,roughness:.1,metalness:.2}):k==='sun'?MAT.gold:MAT.iron,0,0,0));
    if(k==='frost')for(let i=0;i<8;i++){const a=i/8*6.283,c=mesh(new T.ConeGeometry(.05,.22,5),new T.MeshStandardMaterial({color:0xbfe8ff,emissive:0x4ab0ff,emissiveIntensity:.5,transparent:true,opacity:.85}),Math.cos(a)*(r+.06),Math.sin(a)*(r+.06),0);c.rotation.z=a-Math.PI/2;g.add(c)}
    if(k==='spider')for(let i=0;i<8;i++){const a=i/8*6.283+.2,l=mesh(new T.CylinderGeometry(.012,.02,.34,5),new T.MeshStandardMaterial({color:0x2a1830}),Math.cos(a)*(r+.08),Math.sin(a)*(r+.08),0);l.rotation.z=a+Math.PI/2;g.add(l)}}
  g.traverse(m=>{if(m.isMesh)m.castShadow=true});g.rotation.y=Math.PI/2;return g}
const _wmS=weaponMesh;weaponMesh=function(id){if(id&&/^shield_(buckler|kite|heater|tower|sun|kraken|spider|frost)$/.test(id)){try{return makeShield(id)}catch(e){console.warn('shield',e)}}return _wmS(id)};
/* the temple sells the sun shield */
const _pfSh=populateFantasy;populateFantasy=function(){_pfSh();try{const k=actors.find(a=>a.name==='Hogepriesteres Solenne');if(k&&k.shop&&!k.shop.includes('shield_sun'))k.shop.push('shield_sun')}catch(e){}};
})();
