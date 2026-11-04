/* ================= Het Grote Land: new lands and six mighty realms =================
   The world has grown from 2.2 to 4 km across. Around the old land a new continent curves like a horseshoe:
   - Het Oostland, behind the eastern mountains. You walk there through De Oostpas (east of the Levensbron),
     over De Drakenpas (past the Drakennest), or along the coast east of Zilverhaven.
   - Het Zuidland, across the southern sea. De Zandbank, a long low strip of sand and dunes, runs through the sea
     from the south coast to the mouth of the great river, which flows on through the desert of Al-Qadir.
   - Out in the western sea lies a group of small islands.
   The coasts wander, with bays, capes and beaches; hills and ridges rise inland, and the roads follow the valleys.
   Six realms rule the new land, all far stronger than the old ones, each with a walled capital, a palace,
   an army with an elite guard, villages and its own seal:
     Keizerrijk Aurelia (Keizer Valerian)        Keizerrijk Drakenstein (Keizerin Morgana)
     Sultanaat Al-Qadir (Sultan Rashid)          Koninkrijk Hoogmark (Koning Ottokar)
     Koninkrijk Valdoria (Koning Leopold)        Vorstendom Rozendaal (Vorstin Celestine)
   And many new places: an inn at the crossroads, a fort in the pass, an arena with gladiators, a giant bronze
   statue, a copper mine with stone golems, a monastery, a wizard's white tower, an oasis, a pyramid with its
   pharaoh, a lighthouse, a robbers' stronghold and seven villages. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,D2R=Math.PI/180;
const GL={};WD.great=GL;

/* ---------- the shape of the new land ---------- */
const aOf=(x,z)=>Math.atan2(z,x)/D2R;                     /* 0 east, 90 south, -90 north */
const an=(a,s)=>{const c=Math.cos(a*D2R),n=Math.sin(a*D2R);return fbm(c*s+31,n*s-17,3)};
const rIn=a=>1190+(an(a,2.2)-.5)*330-150*Math.exp(-Math.pow((a-52)/16,2));       /* where the new land begins */
const rOut=a=>{const c=Math.abs(Math.cos(a*D2R)),n=Math.abs(Math.sin(a*D2R));return Math.min(1890/Math.max(c,n),1790+(an(a+40,1.6)-.5)*520+(an(a,5)-.5)*260)};   /* its outer coast */
const mask=a=>smooth(-88,-62,a)*(1-smooth(152,178,a));
const DES={x:300,z:1430,r:360};
const desertK=(x,z)=>z<1000?0:1-smooth(DES.r*.6,DES.r,Math.hypot(x-DES.x,z-DES.z)+(fbm(x*.006+3,z*.006,2)-.5)*150);
GL.desertK=desertK;
function landH(x,z){
  const wx=x+(fbm(x*.002+5,z*.002,3)-.5)*260,wz=z+(fbm(x*.002,z*.002+9,3)-.5)*260;
  let h=(fbm(wx*.0028+71,wz*.0028-33,5)-.5)*38+13;
  const rg=1-Math.abs(fbm(wx*.0019-40,wz*.0019+17,4)*2-1);h+=Math.pow(Math.max(0,rg-.62)*2.6,2)*120*smooth(.45,.6,fbm(x*.0012+3,z*.0012-5,2));
  const dk=desertK(x,z);if(dk>0)h=lerp(h,6+Math.pow(Math.abs(Math.sin(x*.016+z*.007+fbm(x*.01,z*.01,2)*5)),1.6)*4+(fbm(x*.005,z*.005,3)-.5)*10,dk);
  return h}
/* islands in the western sea and in the straits */
const ISL=[[-1330,-240,62],[-1560,-520,78],[-1790,-160,56],[-1520,240,70],[-1800,560,50],[-1290,560,44],[-1640,880,64],[-1830,1300,46],[-1720,1720,70],[1790,1780,66],[-880,820,40],[-560,1100,36]];
GL.isl=ISL;
function isles(x,z,h){for(const [ix,iz,ir] of ISL){const d=Math.hypot(x-ix,z-iz);if(d<ir*1.7){const k=1-smooth(ir*.3,ir,d+(fbm(x*.04,z*.04,2)-.5)*ir*.5);if(k>0)h=Math.max(h,lerp(-8,5+fbm(x*.03+1,z*.03,2)*9,k))}}return h}
function newLand(x,z,r,a){let h=landH(x,z);const u=r-rOut(a)+(fbm(x*.007+3,z*.007-8,3)-.5)*170;
  if(u>-180){let hb=lerp(h,1.3+Math.max(0,h-1.3)*.12,smooth(-180,-30,u));hb=lerp(hb,-2.6,smooth(-30,30,u));hb=lerp(hb,-18,smooth(30,240,u));h=hb}
  return h}
/* the ways in: two mountain passes, the coast road and the sandbank (a flat floor with sloping sides) */
const PASSES=[
 {id:'oostpas',w:22,sad:14,pts:[[620,-30],[720,-8],[860,-30],[1010,-55],[1160,-60],[1320,-55],[1450,-50]]},
 {id:'kustweg',w:20,sad:0,h0:5,pts:[[814,545],[930,560],[1050,590],[1160,630],[1260,660]]},
 {id:'zandbank',w:30,sad:0,h0:3,h1:6,pts:[[-180,760],[-130,880],[-70,1000],[-10,1110],[40,1190],[72,1250]]},
 {id:'drakenpas',w:18,sad:30,h0:42,pts:[[690,-650],[790,-740],[900,-830],[1000,-900],[1100,-950]]},
 {id:'oostdijk',w:20,sad:0,h1:4,pts:[[1700,-10],[1820,30],[1940,80],[2060,120]]}];
for(const P of PASSES){let L=0;P.seg=[];for(let i=0;i<P.pts.length-1;i++){const [ax,az]=P.pts[i],[bx,bz]=P.pts[i+1],l=Math.hypot(bx-ax,bz-az);P.seg.push({ax,az,dx:bx-ax,dz:bz-az,l,l0:L});L+=l}P.L=L;
  const xs=P.pts.map(p=>p[0]),zs=P.pts.map(p=>p[1]);P.bb=[Math.min(...xs)-P.w-80,Math.max(...xs)+P.w+80,Math.min(...zs)-P.w-80,Math.max(...zs)+P.w+80]}
function nearP(P,x,z){let bd=1e9,bt=0;for(const s of P.seg){const t=clamp(((x-s.ax)*s.dx+(z-s.az)*s.dz)/(s.l*s.l),0,1),d=Math.hypot(x-s.ax-s.dx*t,z-s.az-s.dz*t);if(d<bd){bd=d;bt=(s.l0+t*s.l)/P.L}}return[bd,bt]}
const _bhG=baseH;
function land(x,z){let h=_bhG(x,z);const r=Math.hypot(x,z);if(r<1000)return h;const a=aOf(x,z),m=mask(a);if(m<=0)return h;
  const k=smooth(rIn(a)-60,rIn(a)+170,r+(fbm(x*.008,z*.008,3)-.5)*170)*m;if(k<=0)return h;return lerp(h,newLand(x,z,r,a),k)}
function prof(P){if(P.p0!==undefined)return;const [ax,az]=P.pts[0],[bx,bz]=P.pts[P.pts.length-1];P.p0=P.h0!==undefined?P.h0:Math.max(2.4,land(ax,az));P.p1=P.h1!==undefined?P.h1:Math.max(2.4,land(bx,bz))}
baseH=function(x,z){if(Math.abs(x)>HALF+100||Math.abs(z)>HALF+100)return _bhG(x,z);let h=land(x,z);if(h<12&&Math.hypot(x,z)>1000)h=isles(x,z,h);if(x>1550&&GL.westH)h=GL.westH(x,z,h);
  for(const P of PASSES){if(x<P.bb[0]||x>P.bb[1]||z<P.bb[2]||z>P.bb[3])continue;const [d,t]=nearP(P,x,z);const ww=P.w/2+(fbm(x*.02,z*.02,2)-.5)*8,k=1-smooth(ww,ww+60,d);if(k<=0)continue;prof(P);
    const f=Math.max(2.4,lerp(P.p0,P.p1,t)+P.sad*Math.sin(Math.PI*t))+(fbm(x*.03,z*.03,2)-.5)*2;h=lerp(h,f,k)}
  if(GL.extraH)h=GL.extraH(x,z,h);
  return h};
/* the desert: sand-coloured ground and no forest; the new land is no longer "open sea" */
WD.tintAt=(x,z)=>{if(z<1000)return null;const k=desertK(x,z);return k>.01?[.80,.68,.46,k*.92]:null};
const _fdG=forestDensity;forestDensity=function(x,z){const d=_fdG(x,z);if(z<1000||d<=0)return d;const k=desertK(x,z);return k>0?d*(1-k):d};
if(WD.inSea){const _isG=WD.inSea;WD.inSea=(x,z)=>_isG(x,z)&&(Math.hypot(x,z)<1000||terrainH(x,z)<-3)}

/* ---------- places ---------- */
const PLACES={
  aurelia:{n:'Aurelia',x:1495,z:-318,r:186,ico:'🏛️'},drakenstein:{n:'Drakenstein',x:-1082,z:1045,r:104,ico:'🏯'},
  qadir:{n:'Al-Qadir',x:252,z:1430,r:104,ico:'🕌'},hoogmark:{n:'Hoogmark',x:790,z:-1216,r:88,ico:'🏰'},
  valdoria:{n:'Valdoria',x:947,z:1090,r:88,ico:'👑'},rozendaal:{n:'Rozendaal',x:1312,z:727,r:82,ico:'🌹'},
  kruispunt:{n:'Herberg Het Kruispunt',x:1449,z:-51,r:26,ico:'🍺'},oostwacht:{n:'Fort Oostwacht',x:1010,z:-55,r:12,ico:'🛡️'},
  arena:{n:'Arena van Aurelia',x:1421,z:-517,r:40,ico:'🏟️'},kolos:{n:'De Kolos',x:1123,z:-816,r:26,ico:'🗿'},
  mijn:{n:'Kopermijn Diepgrond',x:690,z:-1354,r:30,ico:'⛏️'},klooster:{n:'Klooster Sint-Benedictus',x:1612,z:-28,r:38,ico:'⛪'},
  toren:{n:'De Witte Toren',x:1373,z:926,r:20,ico:'🔮'},oase:{n:'Oase van Zahra',x:520,z:1428,r:38,ico:'🌴'},
  piramide:{n:'Piramide van Khemet',x:420,z:1600,r:50,ico:'🔺'},zandvoort:{n:'Zandvoort',x:-374,z:1395,r:38,ico:'⚓'},
  vuurtoren:{n:'Vuurtoren Zuidkaap',x:-556,z:1615,r:18,ico:'🗼'},rovers:{n:'Roversburcht Zwartwoud',x:-1402,z:684,r:40,ico:'☠️'},
  vinalia:{n:'Vinalia',x:1700,z:-120,r:38,ico:'🍇'},steenwijk:{n:'Steenwijk',x:855,z:-1423,r:36,ico:'🏘️'},
  bloemendaal:{n:'Bloemendaal',x:1509,z:672,r:36,ico:'🌷'},hoekstede:{n:'Hoekstede',x:1112,z:1001,r:36,ico:'🏘️'},
  palmhof:{n:'Palmhof',x:433,z:1331,r:34,ico:'🌴'},weidevelde:{n:'Weidevelde',x:-898,z:1192,r:38,ico:'🐑'}};
GL.places=PLACES;
const autoH=(x,z,r)=>{let s=0,n=0;for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){s+=baseH(x+i*r*.4,z+j*r*.4);n++}return Math.max(2.6,s/n)};
for(const [id,p] of Object.entries(PLACES)){const h=autoH(p.x,p.z,p.r);SITES.push(SITE[id]={id,name:p.n,x:p.x,z:p.z,r:p.r,h,blend:1.6,great:true});MAPICON[id]=p.ico}

/* ---------- roads (they follow the valleys; the bridges over the river build themselves) ---------- */
for(const pts of[
  [[620,-30],[720,-8],[860,-30],[1010,-55],[1160,-60],[1320,-55],[1449,-51]],
  [[814,545],[930,560],[1050,590],[1160,630],[1180,650]],
  [[-198,774],[-130,880],[-70,1000],[-10,1110],[40,1190],[72,1250]],
  [[630,-605],[690,-650],[790,-740],[900,-830],[1000,-900],[1100,-950]],
  [[855,-1423],[840,-1341],[790,-1300],[790,-1216]],[[690,-1354],[740,-1304],[790,-1300]],
  [[790,-1216],[874,-1216],[924,-1134],[1100,-950]],[[1100,-950],[1123,-816]],
  [[1123,-816],[1269,-814],[1317,-862],[1381,-878],[1525,-750],[1525,-718],[1557,-686],[1557,-622],[1477,-526],[1421,-517]],
  [[1421,-517],[1495,-500],[1495,-318]],[[1495,-318],[1495,-150],[1451,-110],[1449,-51]],[[1495,-318],[1662,-318],[1690,-220],[1700,-120]],
  [[1449,-51],[1467,-33],[1612,-28]],
  [[1449,-51],[1522,-33],[1650,95],[1714,95],[1730,111],[1730,223],[1794,287],[1794,319],[1746,367],[1746,463],[1682,527],[1650,527],[1538,639],[1506,639],[1410,703],[1362,703],[1312,649],[1312,727]],
  [[1312,727],[1390,727],[1440,690],[1488,690],[1509,672]],[[1312,727],[1312,805],[1378,887],[1373,926]],[[1312,805],[1112,1001]],
  [[1180,650],[1178,876],[1112,1001]],[[1112,1001],[1031,1090],[947,1090]],
  [[947,1090],[863,1090],[851,1108],[787,1108],[723,1156],[659,1172],[483,1332],[433,1331]],[[433,1331],[520,1428]],[[433,1331],[350,1430],[252,1430]],
  [[252,1430],[252,1528],[420,1600]],[[252,1430],[252,1332],[138,1332],[72,1250]],
  [[72,1250],[60,1444],[76,1508],[44,1540],[-84,1540],[-116,1572],[-244,1588],[-324,1508],[-324,1476],[-372,1428],[-374,1395]],
  [[-374,1395],[-554,1573],[-556,1615]],[[-374,1395],[-400,1370],[-480,1370],[-512,1338],[-736,1322],[-898,1192]],
  [[-898,1192],[-966,1111],[-984,1045],[-1082,1045]],[[-1082,1045],[-1082,947],[-1240,782],[-1402,684]]])ROADS.push({w:2.4,pts,great:true});

/* ---------- the six realms ---------- */
const RLM=[
 {id:'aur',site:'aurelia',name:'Aurelia',desc:'het Grote Keizerrijk Aurelia',title:['Keizer','Keizerin'],ruler:'Keizer Valerian',hp:20000,dmg:110,col:0x9a1a1a,hw:150,wallH:15,wall:'white',roof:'red',dome:true,mega:true,
  n:100,e:20,folk:380,sHp:340,sDmg:34,eHp:750,eDmg:58,sName:'Legionair',eName:'Pretoriaan',aggr:.75,vill:['vinalia'],
  seal:{n:'Keizerszegel van Aurelia',def:12,fx:{gold:.45,hp:100},price:20000},sub:'De grootste stad van de wereld: 500 inwoners'},
 {id:'drk',site:'drakenstein',name:'Drakenstein',desc:'het Keizerrijk Drakenstein',title:['Keizer','Keizerin'],ruler:'Keizerin Morgana',hp:8500,dmg:85,col:0x2a2433,hw:84,wallH:13,wall:'dark',roof:'slate',
  n:38,e:10,sHp:320,sDmg:32,eHp:650,eDmg:50,sName:'Zwarte Ridder',eName:'Drakengarde',aggr:.9,vill:['weidevelde'],
  seal:{n:'Keizerszegel van Drakenstein',def:9,fx:{hp:80,gold:.2},price:9000},sub:'Het duistere keizerrijk van het Zuidwesten'},
 {id:'qad',site:'qadir',name:'Al-Qadir',desc:'het Sultanaat Al-Qadir',title:['Sultan','Sultana'],ruler:'Sultan Rashid',hp:6500,dmg:60,col:0xd8b048,hw:84,wallH:10,wall:'sand',roof:'flat',dome:true,
  n:30,e:8,sHp:260,sDmg:28,eHp:520,eDmg:42,sName:'Janitsaar',eName:'Sultansgarde',aggr:.5,vill:['palmhof','oase'],
  seal:{n:'Zegel van de Sultan',def:5,fx:{gold:.4},price:7000},sub:'De parel van de woestijn'},
 {id:'hgm',site:'hoogmark',name:'Hoogmark',desc:'het Koninkrijk Hoogmark',title:['Koning','Koningin'],ruler:'Koning Ottokar',hp:6000,dmg:62,col:0x2f5a3a,hw:70,wallH:12,wall:'stone',roof:'green',
  n:30,e:8,sHp:280,sDmg:28,eHp:540,eDmg:44,sName:'Bergwachter',eName:'IJzergarde',aggr:.45,vill:['steenwijk','mijn'],
  seal:{n:'Zegel van Hoogmark',def:7,fx:{hp:45,gold:.15},price:6000},sub:'Het bergrijk van de IJzeren Koning'},
 {id:'val',site:'valdoria',name:'Valdoria',desc:'het Koninkrijk Valdoria',title:['Koning','Koningin'],ruler:'Koning Leopold',hp:5200,dmg:55,col:0x2a4aa0,hw:70,wallH:10,wall:'white',roof:'blue',
  n:24,e:6,sHp:240,sDmg:26,eHp:480,eDmg:40,sName:'Valdoriaanse Wacht',eName:'Koningsgarde',aggr:.3,vill:['hoekstede'],
  seal:{n:'Zegel van Valdoria',def:5,fx:{gold:.22,hp:30},price:5000},sub:'Het blauwe koninkrijk aan de zee'},
 {id:'roz',site:'rozendaal',name:'Rozendaal',desc:'het Vorstendom Rozendaal',title:['Vorst','Vorstin'],ruler:'Vorstin Celestine',hp:4500,dmg:50,col:0xb04a72,hw:64,wallH:9,wall:'stone',roof:'red',
  n:20,e:6,sHp:230,sDmg:24,eHp:460,eDmg:38,sName:'Rozenwacht',eName:'Lijfwacht',aggr:.15,vill:['bloemendaal','toren'],
  seal:{n:'Zegel van Rozendaal',def:4,fx:{gold:.25,hp:20},price:4500},sub:'Het vorstendom van de rozen'}];
GL.realms=RLM;
for(const R of RLM){const S=SITE[R.site];
  ITEMS['seal_'+R.id]={n:R.seal.n,g:'seal',def:R.seal.def,fx:R.seal.fx,price:R.seal.price,ico:'⚜',rar:'l',realm:R.id,desc:'Draag dit zegel in je uitrusting (vak Heerschap) om '+R.title[0].toLowerCase()+' van '+R.name+' te worden.'};
  try{WD.kingdom.addRealm({id:R.id,desc:R.desc,name:R.name,crown:'seal_'+R.id,old:'old_'+R.id,find:a=>a.name===R.ruler,title:R.title,rulerName:R.ruler,hp:R.hp,dmg:R.dmg,col:R.col,aggr:R.aggr,great:true,
    areas:()=>[[S.x,S.z,R.hw*1.45]].concat(R.vill.map(v=>[SITE[v].x,SITE[v].z,70])),square:()=>[S.x+8,S.z+9]})}catch(e){console.warn('great realm',e)}}
/* travel stones outside the south gates of the capitals */
for(const R of RLM){const S=SITE[R.site];WAYDEF.push([R.site,'Reissteen '+R.name,S.x+14,S.z+R.hw+20])}

/* ---------- words ---------- */
Object.assign(LINES,{
  aurelia:['Ave! Welkom in Aurelia, de stad van de Keizer.','De legioenen van Aurelia hebben nooit een slag verloren. Nou ja, bijna nooit.','Heb je de Arena al gezien? Daar vechten de beste gladiatoren van het Oostland.','De Keizer woont in het paleis met de gouden koepel.','Ten noorden staat De Kolos, het grootste beeld ter wereld.'],
  drakenstein:['Spreek zacht. Keizerin Morgana heeft overal oren.','De Zwarte Ridders van Drakenstein vrezen niets en niemand.','Ooit was hier een draak. Nu is er de Keizerin.','In het westen ligt de Roversburcht. Blijf daar weg.'],
  qadir:['Salaam, vreemdeling! Welkom in Al-Qadir, de parel van de woestijn.','De rivier geeft ons water, de woestijn geeft ons goud.','In het zuiden staat de Piramide van Khemet. Daar slaapt de farao... zeggen ze.','Heb je de Oase van Zahra gezien? Daar rusten de karavanen.','De Sultan is rijk, maar zijn Janitsaren zijn nog sterker.'],
  hoogmark:['Welkom in Hoogmark, waar de bergen het hoogst zijn.','Onze koning heet de IJzeren Koning. Niet zonder reden.','In de kopermijn wonen stenen golems. De mijnwerkers zijn bang.','Het is koud hier, maar ons bier is warm.'],
  valdoria:['Welkom in Valdoria! Zie je onze blauwe daken?','Koning Leopold is streng maar rechtvaardig.','Langs de kust staat de Witte Toren. Daar woont een tovenaar.'],
  rozendaal:['Ruik je de rozen? Welkom in Rozendaal!','Vorstin Celestine houdt van bloemen, muziek en feesten.','In Bloemendaal kweken ze de mooiste tulpen van het land.'],
  reiziger:['Ik breng zijde en specerijen van Al-Qadir naar Aurelia. Daar betalen ze er goud voor.','Ik verhuis naar Rozendaal. Daar is de belasting lager en het volk vrolijker.','Ik ben een bode van de Keizer. Ik mag niet zeggen wat er in de brief staat!','Op de Zandbank waait het altijd. Hou je hoed vast.','In Hoogmark kopen ze ons graan, wij kopen hun ijzer.','Pas op voor de rovers bij Zwartwoud.','Ik ga op bedevaart naar het Klooster Sint-Benedictus.','Heb je wat te ruilen? Ik heb van alles bij me.'],
  grootland:['Achter de bergen ligt een heel nieuw land, zeggen ze.','De keizers van het Oostland zijn machtiger dan alle koningen hier.','Ik heb gehoord dat er een piramide staat in de woestijn van het zuiden.']});
RUMORS.push({t:'Achter de bergen in het oosten liggen machtige rijken. Ga door De Oostpas, ten oosten van de Levensbron, en je komt bij de herberg Het Kruispunt, vlak bij het Keizerrijk Aurelia.'},
  {t:'Over De Zandbank, een lange strook zand door de zuidzee, kom je in het Zuidland. Daar ligt de woestijnstad Al-Qadir, en verder naar het westen het duistere Keizerrijk Drakenstein.'},
  {t:'In de woestijn van het zuiden staat een piramide. Wie de farao verslaat, vindt een schat.'},
  {t:'Ten westen van de oude wereld liggen eilandjes in zee. Vissers zeggen dat je ze met een boot kunt bereiken.'});

/* ---------- building ---------- */
function bag(){const L=new Map();return{add(geo,mat,m){let g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);g.clearGroups();if(!L.has(mat))L.set(mat,[]);L.get(mat).push(g)},
  build(){for(const [mat,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const g of mg?[mg]:gs){const me=new T.Mesh(g,mat);me.castShadow=me.receiveShadow=true;scene.add(me)}}}}}
const MX=(x,y,z,ry=0,sx=1,sy=1,sz=1,rx=0,rz=0)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
const gy=(x,z)=>groundH(x,z);
const tintM=(m,c)=>{const n=m.clone();n.color=new T.Color(c);return n};
let M=null;
function mats(){if(M)return M;const std=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.85,...o});
  M={stone:MAT.stone,dark:tintM(MAT.stone,0x5a5664),sand:tintM(MAT.stone,0xeed7a2),white:tintM(MAT.stone,0xf6f2ea),wood:MAT.wood,
    red:MAT.tile,slate:tintM(MAT.tile,0x4c5160),blue:tintM(MAT.tile,0x5a7ab8),green:tintM(MAT.tile,0x5f9a7a),flat:tintM(MAT.stone,0xe2c890),
    gold:MAT.gold||std(0xd8a83a,{metalness:.7,roughness:.3}),bronze:std(0x6f8f7c,{metalness:.55,roughness:.45}),door:std(0x2a1a10),dark2:std(0x141210),
    sandF:std(0xd9c08a,{roughness:1}),water:new T.MeshStandardMaterial({color:0x3a7aa8,roughness:.05,metalness:.3,transparent:true,opacity:.85}),
    leaf:std(0x4f7f2c,{side:T.DoubleSide}),palm:std(0x8a6a44),cloth:std(0xe8dcc0,{side:T.DoubleSide}),rose:std(0xc23a5a),vine:std(0x5a2a5a),purple:std(0x5a3a8a),
    lightGlow:new T.MeshBasicMaterial({color:0xfff0b0})};return M}
const WALLM=k=>mats()[k]||M.stone,ROOFM=k=>mats()[k]||M.red;
function wallLine(B,x0,z0,x1,z1,h,mat){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/6)),dx=(x1-x0)/L,dz=(z1-z0)/L,ry=Math.atan2(-dz,dx);
  for(let i=0;i<n;i++){const a=i*L/n,b=(i+1)*L/n,m=(a+b)/2,x=x0+dx*m,z=z0+dz*m,y=gy(x,z),l=b-a+.05;B.add(boxGeo(l,h+3,2.4,4),mat,MX(x,y+h/2-1.5,z,ry));B.add(boxGeo(l,.4,3.1,4),mat,MX(x,y+h+.2,z,ry));
    const k=Math.max(1,Math.floor(l/2.2));for(let q=0;q<k;q++){const t=a+(q+.5)*l/k,xx=x0+dx*t,zz=z0+dz*t;for(const s of[-1,1])B.add(boxGeo(1.1,1.3,.6),mat,MX(xx-dz*s*1.25,y+h+1,zz+dx*s*1.25,ry))}
    for(let t=a;t<=b;t+=2)addCircle(x0+dx*t,z0+dz*t,1.5)}}
function towerB(B,x,z,r,h,mat,roof){const y=gy(x,z);B.add(new T.CylinderGeometry(r,r*1.1,h+3,14),mat,MX(x,y+h/2-1.5,z));B.add(new T.CylinderGeometry(r+.6,r,1.2,14),mat,MX(x,y+h+.6,z));
  if(roof&&roof!==M.flat)B.add(new T.ConeGeometry(r+1,r*2.2,14),roof,MX(x,y+h+1.2+r*1.1,z));else for(let i=0;i<8;i++){const a=i/8*6.283;B.add(boxGeo(1,1.2,1),mat,MX(x+Math.cos(a)*(r+.2),y+h+1.8,z+Math.sin(a)*(r+.2),-a))}
  addCircle(x,z,r+.3)}
function cityWalls(B,C,HW,h,mat,roof){const g=7,X0=C.x-HW,X1=C.x+HW,Z0=C.z-HW,Z1=C.z+HW;
  for(const [a,b,c,d] of[[X0,Z0,C.x-g,Z0],[C.x+g,Z0,X1,Z0],[X0,Z1,C.x-g,Z1],[C.x+g,Z1,X1,Z1],[X0,Z0,X0,C.z-g],[X0,C.z+g,X0,Z1],[X1,Z0,X1,C.z-g],[X1,C.z+g,X1,Z1]])wallLine(B,a,b,c,d,h,mat);
  for(const [x,z] of[[X0,Z0],[X1,Z0],[X0,Z1],[X1,Z1]])towerB(B,x,z,4.6,h+6,mat,roof);
  for(const [x,z,ax] of[[C.x,Z0,1],[C.x,Z1,1],[X0,C.z,0],[X1,C.z,0]]){for(const s of[-1,1])towerB(B,x+(ax?s*(g+2.6):0),z+(ax?0:s*(g+2.6)),3.4,h+5,mat,roof);const y=gy(x,z);B.add(boxGeo(ax?2*g+3:3.4,3,ax?3.4:2*g+3,4),mat,MX(x,y+h+1.4,z))}
  for(const t of[-.55,.55])for(const [x,z] of[[C.x+t*HW,Z0],[C.x+t*HW,Z1],[X0,C.z+t*HW],[X1,C.z+t*HW]])towerB(B,x,z,3.2,h+3,mat,roof)}
function fountain(B,x,z,mat){const y=gy(x,z);B.add(new T.CylinderGeometry(5,5.3,1,24),mat,MX(x,y+.5,z));const w=new T.Mesh(new T.CircleGeometry(4.6,24),M.water);w.rotation.x=-Math.PI/2;w.position.set(x,y+.95,z);scene.add(w);
  B.add(new T.CylinderGeometry(.8,1.1,3,12),mat,MX(x,y+2.2,z));B.add(new T.CylinderGeometry(2,1,.5,16),mat,MX(x,y+3.8,z));B.add(new T.SphereGeometry(.7,12,8),M.gold,MX(x,y+4.6,z));addCircle(x,z,5.4);FOUNT.push([x,y+4.4,z])}
function obelisk(B,x,z,mat){const y=gy(x,z);B.add(boxGeo(4,1.4,4),mat,MX(x,y+.7,z));B.add(new T.CylinderGeometry(.9,1.5,16,4),mat,MX(x,y+9.4,z,Math.PI/4));B.add(new T.ConeGeometry(1.05,1.6,4),M.gold,MX(x,y+18.2,z,Math.PI/4));addCircle(x,z,2.6)}
/* a figure with a raised sword on a pedestal: s=1 is a statue on a square, s=7 the Kolos */
function statue(B,x,z,s,mat,ry=0){const y=gy(x,z),P=(lx,ly,lz)=>{const c=Math.cos(ry),n=Math.sin(ry);return[x+(lx*c+lz*n)*s,y+ly*s,z+(-lx*n+lz*c)*s]};
  const add=(geo,lx,ly,lz,m=mat,rz=0)=>{const [px,py,pz]=P(lx,ly,lz);B.add(geo,m,MX(px,py,pz,ry,s,s,s,0,rz))};
  add(boxGeo(3.2,2,3.2),0,1,0,M.stone);for(const sx of[-.35,.35])add(boxGeo(.5,2.2,.6),sx,3.1,0);add(boxGeo(1.4,1.9,.8),0,5.15,0);add(boxGeo(1.5,.5,.9),0,6.2,0);
  add(new T.SphereGeometry(.42,12,10),0,6.85,0);add(new T.ConeGeometry(.46,.5,12),0,7.3,0);add(boxGeo(.36,1.7,.42),.95,6.6,0);add(boxGeo(.12,3.2,.06),.95,8.9,0,M.bronze===mat?M.gold:mat);
  add(boxGeo(.36,1.5,.42),-.95,5.1,.15);add(new T.CylinderGeometry(.75,.75,.14,16),-1.2,5,.25,mat,Math.PI/2);addBox(x-1.6*s,z-1.6*s,x+1.6*s,z+1.6*s)}
/* a real statue: the realistic hero model in a sword stance, cast in bronze or carved in marble, on a stepped pedestal
   with a cornice and a golden plaque; the blocky figure above is only used when the 3D models are not available */
function heroStatue(B,x,z,s,ry,kind,look){let h=null;try{h=makeHuman({...randomLook(false),beard:'full',hairStyle:'short',tunic:0x777777,armor:1,cape:0x777777,hat:look==='crown'?'crown':'helm',scale:1,build:1.12})}catch(e){}
  if(!h||!h.g||!h.sk){if(h&&h.g)try{scene.remove(h.g)}catch(e){}return false}
  const y=gy(x,z),P=1.6*s+1,Hd=.9*s+1,ped=kind==='dark'?M.dark:kind==='marble'?M.stone:M.white;
  B.add(boxGeo(P+1.4,.5,P+1.4,4),ped,MX(x,y+.15,z));B.add(boxGeo(P+.7,.5,P+.7,4),ped,MX(x,y+.65,z));B.add(boxGeo(P,Hd,P,4),ped,MX(x,y+.9+Hd/2,z));
  B.add(boxGeo(P+.5,.45,P+.5,4),ped,MX(x,y+.9+Hd+.22,z));B.add(boxGeo(P*.82,.3,P*.82,4),ped,MX(x,y+1.57+Hd,z));
  for(const a of[0,1,2,3]){const th=ry+a*Math.PI/2,px=x+Math.sin(th)*(P/2+.03),pz=z+Math.cos(th)*(P/2+.03);B.add(boxGeo(P*.42,Hd*.22,.06),M.gold,MX(px,y+.9+Hd*.62,pz,th))}
  addBox(x-P/2-.7,z-P/2-.7,x+P/2+.7,z+P/2+.7);
  try{setHeld(h,'sword_knight','shield_knight')}catch(e){}
  h.idleClip='Sword_Idle';for(let i=0;i<14;i++)try{animHuman(h,.08,0,{})}catch(e){}
  const mat=kind==='marble'?new T.MeshStandardMaterial({color:0xf1ece2,roughness:.42,metalness:0}):kind==='dark'?new T.MeshStandardMaterial({color:0x2a2630,roughness:.3,metalness:.6}):new T.MeshStandardMaterial({color:0x8a6a38,roughness:.34,metalness:.82});
  h.g.traverse(o=>{if(o.isMesh){const m=mat.clone();if(o.isSkinnedMesh)m.skinning=true;o.material=m;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});
  h.g.scale.setScalar(s);h.g.position.set(x,y+1.72+Hd,z);h.g.rotation.y=ry;h.g.updateMatrixWorld(true);scene.add(h.g);STATUES.push(h);return true}
const STATUES=[];
/* the palace: a platform, a great hall with towers at its corners, columns at the front, a dome or a steep roof */
function palace(B,x,z,o){const y=gy(x,z),w=o.w,d=o.d,h=o.h,m=o.mat,r=o.roof;
  B.add(boxGeo(w+10,1.8,d+12,4),m,MX(x,y+.2,z+1));B.add(boxGeo(w,h,d,4),m,MX(x,y+1.1+h/2,z));B.add(boxGeo(w+.8,.8,d+.8,4),m,MX(x,y+1.1+h,z));
  const up=h*.45;B.add(boxGeo(w*.55,up,d*.55,4),m,MX(x,y+1.5+h+up/2,z));const top=y+1.5+h+up;
  if(o.dome){const R=Math.min(w,d)*.3;B.add(new T.SphereGeometry(R,20,12,0,Math.PI*2,0,Math.PI/2),o.domeM||M.gold,MX(x,top,z));B.add(new T.ConeGeometry(.6,4,8),M.gold,MX(x,top+R+1.6,z))}
  else B.add(new T.ConeGeometry(Math.max(w,d)*.42,h*.7,4),r===M.flat?m:r,MX(x,top+h*.35,z,Math.PI/4));
  for(const sx of[-1,1])for(const sz of[-1,1])towerB(B,x+sx*w/2,z+sz*d/2,3,h+8,m,r===M.flat?null:r);
  const fz=z+d/2+2.6;for(let i=0;i<6;i++){const cx=x-w*.36+i*w*.72/5;B.add(new T.CylinderGeometry(.55,.65,h*.72,10),m,MX(cx,y+1.1+h*.36,fz));addCircle(cx,fz,.7)}
  B.add(boxGeo(w*.82,.8,4.4,4),m,MX(x,y+1.1+h*.72+.4,fz));B.add(boxGeo(3.6,5.4,.3),M.door,MX(x,y+3.8,z+d/2+.12));
  for(let i=0;i<3;i++)B.add(boxGeo(12-i*1.5,.45,2),m,MX(x,y+.2+i*.45,z+d/2+7.2-i*1.1));
  addBox(x-w/2-1,z-d/2-1,x+w/2+1,z+d/2+.4);
  if(o.col){const bm=new T.MeshStandardMaterial({color:o.col,side:T.DoubleSide,roughness:.9});for(const s of[-1,1]){const b=new T.Mesh(new T.PlaneGeometry(2.4,7),bm);b.position.set(x+s*(w/2-4),y+1.1+h*.62,z+d/2+.2);scene.add(b)}}
  return{x,z:z+d/2+10}}
function palm(B,x,z,s=1){const y=gy(x,z),lean=rr(.25);let px=x,pz=z,py=y;const dir=Math.random()*6.283;
  for(let i=0;i<5;i++){const nx=px+Math.cos(dir)*lean*1.2*s,nz=pz+Math.sin(dir)*lean*1.2*s,ny=py+1.6*s;B.add(new T.CylinderGeometry(.18*s,.24*s,1.75*s,7),M.palm,MX((px+nx)/2,(py+ny)/2,(pz+nz)/2,0,1,1,1,Math.sin(dir)*lean*.6,-Math.cos(dir)*lean*.6));px=nx;pz=nz;py=ny}
  for(let i=0;i<8;i++){const a=i/8*6.283+rr(.2);const g=new T.PlaneGeometry(.9*s,3.4*s);g.translate(0,1.7*s,0);B.add(g,M.leaf,new T.Matrix4().compose(new T.Vector3(px,py,pz),new T.Quaternion().setFromEuler(new T.Euler(1.15+rr(.15),a,0,'YXZ')),new T.Vector3(1,1,1)))}
  addCircle(x,z,.35*s)}
function tent(B,x,z,r,col){if(window.medTent){const dark=col===M.dark;medTent(x,z,{r:r*.95,pal:dark?[0x3a3026,0x1e1a16,0x6a4a2a]:pick([[0xf2e6c8,0xc0603a,0xe0b04a],[0xf2e6c8,0x6a2a5a,0xe0b04a],[0xe8d8b0,0x2f6a7a,0xc0603a]]),ry:Math.random()*6.283});return}const y=gy(x,z);B.add(new T.ConeGeometry(r,r*1.3,8),col,MX(x,y+r*.65,z));B.add(new T.CylinderGeometry(.06,.06,r*1.6,5),M.wood,MX(x,y+r*.8,z));addCircle(x,z,r*.8)}
const FOUNT=[];
/* houses: makeHouse, with flat roofs in the desert and coloured roofs elsewhere */
const HN=['Woonhuis','Herenhuis','Huis','Koopmanshuis','Burgerhuis'];
function hs(x,z,rot,o={}){try{const b=makeHouse({x,z,rot,w:o.w||(Math.random()<.5?7.5:9),d:o.d||(Math.random()<.5?6:7),h:o.h||(Math.random()<.5?6.4:3.4),style:o.style||pick(['plaster','stone','plaster','wood']),roof:'tile',name:o.name||pick(HN),kind:o.kind||'home'});restyle(b,o.look);return b}catch(e){console.warn('great house',e)}}
function restyle(b,look){if(!b||!look||!b.roof)return;mats();
  if(look==='flat'){b.roof.children.forEach(c=>c.visible=false);b.roof.add(mapBox(b.w+.3,.45,b.d+.3,M.flat,0,.2,0));for(const s of[-1,1]){b.roof.add(mapBox(b.w+.3,.7,.25,M.flat,0,.75,s*(b.d/2+.05)));b.roof.add(mapBox(.25,.7,b.d+.3,M.flat,s*(b.w/2+.05),.75,0))}return}
  const m=look==='slate'?M.slate:look==='blue'?M.blue:look==='green'?M.green:null;if(m&&b.roof.children[0])b.roof.children[0].material=m}
/* the houses of the new capitals are drawn up to 210 m away (the old towns up to 340 m) */
const GHOUSE=[];
if(typeof updateCulling==='function'){const _ucG=updateCulling;updateCulling=function(dt){_ucG(dt);if(PL.inCave)return;for(const b of GHOUSE)if(b.group.visible&&Math.hypot(b.x-PL.x,b.z-PL.z)>210)b.group.visible=false}}
const faceTo=(x,z,cx,cz)=>((Math.round(Math.atan2(cx-x,cz-z)/(Math.PI/2))%4)+4)%4;
const HOMES={},CAP={};GL.cap=CAP;

/* a capital: walls with four gates, a cross of streets, a square in the middle, the palace in the north-east quarter */
function capital(R){mats();const S=SITE[R.site],C={x:S.x,z:S.z},HW=R.hw,B=bag(),wm=WALLM(R.wall),rm=ROOFM(R.roof),look=R.roof==='red'?null:R.roof,homes=[];
  cityWalls(B,C,HW,R.wallH,wm,rm);
  try{asPave(C.x,C.z,R.mega?24:15,R.mega?24:15,'Floor_Brick')}catch(e){}
  if(R.id==='qad')obelisk(B,C.x,C.z,wm);else fountain(B,C.x,C.z,wm);
  const pal=palace(B,C.x+HW*.5,C.z-HW*.5,{w:Math.round(HW*.42),d:Math.round(HW*.3),h:R.id==='aur'||R.id==='drk'?15:12,mat:wm,roof:rm,dome:R.dome,domeM:R.id==='qad'?M.white:M.gold,col:R.col});
  const style=R.wall==='sand'?'plaster':R.wall==='dark'?'stone':R.wall==='white'?'plaster':null;
  const H=(x,z,rot,o={})=>{const b=hs(x,z,rot,{style:style||undefined,look,...o});if(b){GHOUSE.push(b);if(!o.kind||o.kind==='home')homes.push(b)}return b};
  const steps=[];for(let t=28;t<=(R.mega?60:HW-14);t+=13)steps.push(t);
  for(const t of steps){H(C.x-13,C.z-t,1);H(C.x-13,C.z+t,1);H(C.x+13,C.z+t,3);H(C.x-t,C.z-13,0);H(C.x-t,C.z+13,2);H(C.x+t,C.z+13,2)}
  const sp={};
  sp.inn=H(C.x-HW*.55,C.z+HW*.5,0,{w:13,d:9,h:6.4,kind:'inn',name:'Herberg van '+R.name});
  sp.smith=H(C.x+HW*.55,C.z+HW*.55,2,{w:10,d:8,h:4,kind:'smith',name:'Smederij van '+R.name,style:'stone'});
  sp.shop=H(C.x-HW*.55,C.z-HW*.55,0,{w:11,d:8,h:4,kind:'shop',name:'Handelshuis van '+R.name});
  sp.temple=H(C.x-HW*.3,C.z-HW*.62,0,{w:10,d:18,h:8,kind:'church',name:R.id==='qad'?'Grote Moskee':'Kathedraal van '+R.name,style:'stone'});
  sp.barracks=H(C.x+HW*.78,C.z-HW*.12,3,{w:8,d:16,h:4,kind:'home',name:'Kazerne van '+R.name,style:'stone'});
  /* market stalls and lamps around the square */
  const cols=[0xa82a22,0x2a5a9a,0xd8a83a,0x3a7a3a,0x7a3a8a,0xc85a2a];let si=0;
  for(const [x,z,rot] of[[-10,-17,0],[2,-17,0],[-17,-6,1],[-17,8,1],[17,6,3],[-8,17,2],[6,17,2]]){try{stall(C.x+x,C.z+z,rot,cols[si++%cols.length])}catch(e){}addCircle(C.x+x,C.z+z,1.6)}
  for(const [x,z] of[[-5,-26],[5,-44],[-26,5],[-44,-5],[26,-5],[44,5],[5,26],[-5,44]]){const y=gy(C.x+x,C.z+z);B.add(new T.CylinderGeometry(.09,.12,3.2,6),MAT.iron||M.dark2,MX(C.x+x,y+1.6,C.z+z));try{lamp(C.x+x,y+3.3,C.z+z)}catch(e){}addCircle(C.x+x,C.z+z,.3)}
  {const kind={aur:'marble',drk:'dark',qad:'bronze',hgm:'bronze',val:'marble',roz:'marble'}[R.id];if(!heroStatue(B,C.x-30,C.z-30,2.2,Math.PI*.75,kind,R.id==='aur'||R.id==='drk'?'crown':null))statue(B,C.x-30,C.z-30,1.4,M.bronze,Math.PI/4)}
  if(R.id==='qad')for(let i=0;i<10;i++){const a=i/10*6.283;palm(B,C.x+Math.cos(a)*24,C.z+Math.sin(a)*24,1.1)}
  if(R.id==='roz')for(let i=0;i<16;i++){const x=C.x-HW*.5+rr(16),z=C.z-HW*.15+rr(10),y=gy(x,z);B.add(new T.SphereGeometry(.5,8,6),pick([M.rose,M.leaf]),MX(x,y+.4,z))}
  if(R.mega){/* the quarters are full of tall town houses (simple blocks, merged so they cost little to draw) */
    const avoid=Object.values(sp).filter(Boolean).map(b=>[b.x,b.z]).concat([[C.x-30,C.z-30],[C.x-30,C.z+30],[C.x+30,C.z+30]]),roofG=new T.ConeGeometry(.7071,1,4);roofG.rotateY(Math.PI/4);roofG.translate(0,.5,0);
    /* the quarters are full of town houses, the same house models as in every other town (a little apart, so they stay cheap to draw) */
    for(const qx of[-1,1])for(const qz of[-1,1]){if(qx>0&&qz<0)continue;for(let gx=44;gx<=HW-22;gx+=19)for(let gz=44;gz<=HW-22;gz+=17){const x=C.x+qx*gx,z=C.z+qz*gz;if(avoid.some(([ax,az])=>Math.hypot(ax-x,az-z)<17))continue;
      H(x,z,faceTo(x,z,C.x+qx*gx,C.z),{w:Math.random()<.5?8:9.5,d:Math.random()<.5?7:8,h:Math.random()<.6?6.4:3.4})}}
    for(const [x,z,k] of[[C.x-30,C.z+30,'bronze'],[C.x+30,C.z+30,'bronze']])heroStatue(B,x,z,2,Math.PI*(k==='bronze'?.25:.75),k,null);
    for(const [x,z,rot] of[[-24,-28,0],[-12,-28,0],[0,-28,0],[12,-28,0],[-28,-14,1],[-28,14,1],[28,-14,3],[28,14,3],[-12,28,2],[12,28,2]]){try{stall(C.x+x,C.z+z,rot,pick(cols))}catch(e){}addCircle(C.x+x,C.z+z,1.6)}}
  B.build();CAP[R.id]={R,C,pal,homes,sp};HOMES[R.site]=homes}

/* a village: houses in a ring around a well, fields outside */
function village(id,o={}){mats();const S=SITE[id],C={x:S.x,z:S.z},n=o.n||7,R0=o.r||19,homes=[],B=bag();
  for(let i=0;i<n;i++){const a=i/n*6.283+(o.a0||.3),x=C.x+Math.cos(a)*R0,z=C.z+Math.sin(a)*R0;const b=hs(x,z,faceTo(x,z,C.x,C.z),{style:o.style,look:o.look,h:3.4,w:7,d:6,name:'Huis in '+S.name,kind:i===1&&o.shop?'shop':'home'});if(b)homes.push(b)}
  try{well(C.x,C.z)}catch(e){}
  if(o.fields)for(const [dx,dz,w,d,c] of o.fields)try{field(C.x+dx,C.z+dz,w,d,c)}catch(e){}
  if(o.palms)for(let i=0;i<o.palms;i++){const a=Math.random()*6.283,r=8+Math.random()*(R0+8);palm(B,C.x+Math.cos(a)*r,C.z+Math.sin(a)*r,.9+Math.random()*.4)}
  B.build();HOMES[id]=homes;return homes}

/* the special places */
function buildPlaces(){mats();const B=bag(),P=id=>SITE[id];
  /* Herberg Het Kruispunt */
  {const S=P('kruispunt');const b=hs(S.x+10,S.z-8,faceTo(S.x+10,S.z-8,S.x,S.z),{w:14,d:10,h:6.4,kind:'inn',name:'Herberg Het Kruispunt',style:'wood'});CAP.inn=b;try{well(S.x-6,S.z+6)}catch(e){}
    try{fence(S.x-20,S.z+10,S.x-6,S.z+10);fence(S.x-20,S.z+10,S.x-20,S.z+20);fence(S.x-20,S.z+20,S.x-6,S.z+20)}catch(e){}try{hay(S.x-14,S.z+15)}catch(e){}}
  /* Fort Oostwacht: two towers and a gate across the pass */
  {const S=P('oostwacht'),y=gy(S.x,S.z);for(const s of[-1,1]){towerB(B,S.x+s*1.6,S.z+s*14,3.4,13,M.stone,M.red);wallLine(B,S.x+s*.8,S.z+s*7,S.x+s*2.4,S.z+s*24,8,M.stone)}B.add(boxGeo(3.4,3,14,4),M.stone,MX(S.x,y+9.5,S.z))}
  /* the Arena: an oval of arches around a sand floor */
  {const S=P('arena'),y=gy(S.x,S.z),RA=30,RB=24;const f=new T.Mesh(new T.CircleGeometry(RB-1,40),M.sandF);f.rotation.x=-Math.PI/2;f.scale.set(1,.78,1);f.position.set(S.x,y+.06,S.z);scene.add(f);
    for(let i=0;i<44;i++){const a=i/44*6.283;if(Math.abs(Math.sin(a))>.97&&Math.cos(a)>-.2&&Math.sin(a)>0)continue;const rx=Math.cos(a),rz=Math.sin(a)*.82,x=S.x+rx*RA,z=S.z+rz*RA,ry=-a+Math.PI/2;
      B.add(boxGeo(4.6,13,3,4),M.white,MX(x,y+5.5,z,ry));B.add(boxGeo(2,4,3.2),M.dark2,MX(x,y+2,z,ry));B.add(boxGeo(2,3,3.2),M.dark2,MX(x,y+8,z,ry));for(let k=0;k<3;k++)B.add(boxGeo(4.6,.9,2.2),M.white,MX(S.x+rx*(RA-2.4-k*1.9),y+1+k*1.4,S.z+rz*(RA-2.4-k*1.9),ry));addCircle(x,z,2.2)}}
  /* De Kolos */
  {const S=P('kolos');if(!heroStatue(B,S.x,S.z,8,-Math.PI/5,'bronze','crown'))statue(B,S.x,S.z,6,M.bronze,-Math.PI/5);const y=gy(S.x,S.z);B.add(boxGeo(26,2.4,26,6),M.stone,MX(S.x,y+.4,S.z))}
  /* Kopermijn Diepgrond: a timbered entrance in the rock, carts and ore */
  {const S=P('mijn'),y=gy(S.x,S.z),x=S.x,z=S.z-16;B.add(new T.DodecahedronGeometry(14,1),MAT.rock||M.stone,MX(x,y+2,z-10,0,1.3,.9,1));B.add(boxGeo(5,5.5,.6),M.dark2,MX(x,y+2.75,z+3.6));
    for(const s of[-1,1])B.add(boxGeo(.6,6,.6),M.wood,MX(x+s*2.8,y+3,z+4));B.add(boxGeo(6.8,.7,.8),M.wood,MX(x,y+6.2,z+4));addBox(x-12,z-22,x+12,z+2);
    for(let i=0;i<3;i++){const cx=x-5+i*5,cz=z+12;B.add(boxGeo(1.4,1,2.2),M.wood,MX(cx,y+1,cz));B.add(new T.DodecahedronGeometry(.6,0),M.bronze,MX(cx,y+1.7,cz));addCircle(cx,cz,1.2)}
    for(let i=0;i<10;i++)B.add(new T.DodecahedronGeometry(.4+Math.random()*.5,0),pick([M.bronze,M.stone]),MX(x+rr(10),y+.3,z+16+rr(4)))}
  /* Klooster Sint-Benedictus: a church inside cloister walls, a herb garden */
  {const S=P('klooster'),C={x:S.x,z:S.z},H2=24;CAP.abbey=hs(C.x,C.z-6,0,{w:10,d:20,h:8,kind:'church',name:'Abdijkerk Sint-Benedictus',style:'stone'});
    for(const [a,b,c,d] of[[C.x-H2,C.z-H2,C.x+H2,C.z-H2],[C.x-H2,C.z-H2,C.x-H2,C.z+H2],[C.x+H2,C.z-H2,C.x+H2,C.z+H2],[C.x-H2,C.z+H2,C.x-4,C.z+H2],[C.x+4,C.z+H2,C.x+H2,C.z+H2]])wallLine(B,a,b,c,d,4,M.stone);
    towerB(B,C.x+H2,C.z-H2,3,16,M.stone,M.red);try{field(C.x-12,C.z+12,12,8,'#6a8a3a');field(C.x+12,C.z+12,10,8,'#8a7a9a');well(C.x+12,C.z-14)}catch(e){}}
  /* De Witte Toren */
  {const S=P('toren'),y=gy(S.x,S.z);B.add(new T.CylinderGeometry(4.2,5.2,30,18),M.white,MX(S.x,y+15,S.z));B.add(new T.CylinderGeometry(5.4,4.4,1.6,18),M.white,MX(S.x,y+30.4,S.z));B.add(new T.ConeGeometry(5.8,11,18),M.purple,MX(S.x,y+36.6,S.z));
    B.add(new T.SphereGeometry(.8,12,10),M.lightGlow,MX(S.x,y+42.6,S.z));for(let i=0;i<6;i++){const a=i/6*6.283;B.add(boxGeo(.9,1.6,.2),M.dark2,MX(S.x+Math.cos(a)*4.5,y+8+i*3.6,S.z+Math.sin(a)*4.5,-a+Math.PI/2))}addCircle(S.x,S.z,5.4)}
  /* Oase van Zahra: a pool with palms and the tents of a caravan */
  {const S=P('oase'),y=gy(S.x,S.z);const w=new T.Mesh(new T.CircleGeometry(11,32),M.water);w.rotation.x=-Math.PI/2;w.position.set(S.x,y+.12,S.z);scene.add(w);addCircle(S.x,S.z,10);
    for(let i=0;i<14;i++){const a=i/14*6.283+rr(.15),r=13+Math.random()*5;palm(B,S.x+Math.cos(a)*r,S.z+Math.sin(a)*r,.9+Math.random()*.5)}
    for(const [dx,dz,c] of[[-24,6,M.cloth],[-22,-10,M.rose],[22,12,M.cloth],[24,-8,M.purple]])tent(B,S.x+dx,S.z+dz,3.4,c)}
  /* Piramide van Khemet */
  {const S=P('piramide'),y=gy(S.x,S.z);B.add(new T.ConeGeometry(42,40,4,1),M.sand,MX(S.x,y+19.6,S.z-6,Math.PI/4));B.add(boxGeo(5,6,4),M.dark2,MX(S.x,y+3,S.z-6+28.6));
    for(const s of[-1,1]){B.add(boxGeo(2.4,4,4),M.sand,MX(S.x+s*7,y+2,S.z+30));B.add(new T.SphereGeometry(1.1,10,8),M.sand,MX(S.x+s*7,y+4.8,S.z+30))}addCircle(S.x,S.z-6,30);
    for(const dx of[-16,16])addCircle(S.x+dx,S.z-6+8,14)}
  /* Vuurtoren Zuidkaap: striped tower with a light */
  {const S=P('vuurtoren'),y=gy(S.x,S.z);for(let i=0;i<6;i++)B.add(new T.CylinderGeometry(3.2-i*.25,3.45-i*.25,4.6,16),i%2?M.red:M.white,MX(S.x,y+2.3+i*4.6,S.z));
    B.add(new T.CylinderGeometry(2.6,2.6,.6,16),M.dark2,MX(S.x,y+27.9,S.z));B.add(new T.SphereGeometry(1.3,12,10),M.lightGlow,MX(S.x,y+29.6,S.z));B.add(new T.ConeGeometry(2.4,2.4,16),M.red,MX(S.x,y+31.6,S.z));addCircle(S.x,S.z,3.6);
    try{LAMPS.push({x:S.x,y:y+29.6,z:S.z,flame:null})}catch(e){}hs(S.x+9,S.z+6,faceTo(S.x+9,S.z+6,S.x,S.z),{w:6,d:5,h:3.2,name:'Huis van de vuurtorenwachter',style:'plaster'})}
  /* Roversburcht Zwartwoud: a palisade with watchtowers */
  {const S=P('rovers'),R0=22;for(let i=0;i<40;i++){const a=i/40*6.283;if(a>1.3&&a<1.75)continue;const x=S.x+Math.cos(a)*R0,z=S.z+Math.sin(a)*R0,y=gy(x,z);B.add(new T.CylinderGeometry(.34,.4,6,6),M.wood,MX(x,y+2.6,z));B.add(new T.ConeGeometry(.36,.8,6),M.wood,MX(x,y+6,z));addCircle(x,z,.6)}
    for(const a of[.4,2.4,3.9,5.4]){const x=S.x+Math.cos(a)*(R0-2),z=S.z+Math.sin(a)*(R0-2),y=gy(x,z);for(const [dx,dz] of[[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]])B.add(boxGeo(.3,8,.3),M.wood,MX(x+dx,y+4,z+dz));B.add(boxGeo(3.4,.3,3.4),M.wood,MX(x,y+8,z));B.add(new T.ConeGeometry(2.6,2.2,4),M.wood,MX(x,y+9.4,z,Math.PI/4))}
    for(const [dx,dz] of[[-6,-4],[6,-6],[0,8]])tent(B,S.x+dx,S.z+dz,2.8,M.dark)}
  B.build()}

/* ---------- people ---------- */
const sp=(job,x,z,o)=>{try{return spawnNPC(job,x,z,o)}catch(e){console.warn('great npc',e)}};
const okShop=L=>L.filter(id=>ITEMS[id]);
function soldier(R,x,z,elite,patrol){const a=sp('guard',x,z,{name:(elite?R.eName:R.sName)+' '+pick(FIRST),ai:'guard',livery:R.col,patrol});if(!a)return;a.realm=R.id;
  a.hp=a.hpMax=elite?R.eHp:R.sHp;a.dmg=elite?R.eDmg:R.sDmg;a.speed=elite?4.2:4;a.great=true;if(elite)try{setHeld(a.h,'sword_knight','shield_knight')}catch(e){}return a}
function people(C,R0,n,line,homes,realm){for(let i=0;i<n;i++){const a=Math.random()*6.283,r=6+Math.random()*R0,b=sp('villager',C.x+Math.cos(a)*r,C.z+Math.sin(a)*r,{line,roam:{x:C.x,z:C.z},radius:R0});if(!b)continue;if(homes&&homes.length)b.homeB=pick(homes);if(realm)b.realm=realm}}
function populateRealm(R){const K=CAP[R.id];if(!K)return;const C=K.C,HW=R.hw,line=R.site;
  const ruler=sp('lord',K.pal.x,K.pal.z,{name:R.ruler,ai:'stay',line});if(ruler){ruler.face=0;ruler.realm=R.id}
  const gates=[[C.x,C.z-HW+12],[C.x,C.z+HW-12],[C.x-HW+12,C.z],[C.x+HW-12,C.z]],plaza=[[C.x+12,C.z+12],[C.x-12,C.z-12],[C.x-12,C.z+12]];
  for(let i=0;i<R.n;i++){const g=gates[i%4],pat=[g,pick(plaza),pick(gates),[g[0]+rr(10),g[1]+rr(10)]];soldier(R,g[0]+rr(8),g[1]+rr(8),false,pat)}
  for(let i=0;i<R.e;i++){const p=K.pal,pat=[[p.x-10,p.z],[p.x+10,p.z],[p.x-10,p.z+8],[p.x+10,p.z+8]];soldier(R,p.x+rr(10),p.z+rr(5)+3,true,pat)}
  const sh=K.sp,shop=okShop(['potion','elixir','bread','stew','apple','cheese','spice','silk','wine','gem','ring_gold']);
  if(sh.shop)sp('merchant',sh.shop.counter[0],sh.shop.counter[1],{name:'Koopman '+pick(FIRST),ai:'stay',line,shop});
  if(sh.smith)sp('smith',sh.smith.counter[0],sh.smith.counter[1],{name:'Wapensmid '+pick(FIRST),ai:'stay',line,shop:okShop((typeof WEAPONS_HIGH!=='undefined'?WEAPONS_HIGH:[]).concat(typeof WEAPONS_KNIGHT!=='undefined'?WEAPONS_KNIGHT:[],['plate','helm_iron','shield_kite','shield_tower']))});
  if(sh.inn)sp('innkeeper',sh.inn.counter[0],sh.inn.counter[1],{name:'Waard '+pick(FIRST),ai:'stay',line,shop:okShop(typeof FOOD!=='undefined'?FOOD:['bread','stew'])});
  if(sh.temple)sp('priest',sh.temple.counter[0],sh.temple.counter[1],{name:R.id==='qad'?'Imam Yusuf':'Bisschop '+pick(FIRST),ai:'stay',line});
  people(C,HW-12,R.folk||14,line,K.homes,R.id);
  for(let i=0;i<3;i++){const from=pick(TOWN.filter(t=>t!==R.name)),a=sp(pick(['traveler','merchant','villager']),C.x+rr(18),C.z+rr(18),{name:'Bezoeker uit '+from,line:'reiziger',roam:{x:C.x,z:C.z},radius:26});if(a)a.trav=true}
  for(const v of R.vill){const S=SITE[v];if(!S)continue;for(let i=0;i<3;i++){const a=Math.random()*6.283;soldier(R,S.x+Math.cos(a)*10,S.z+Math.sin(a)*10,false,[[S.x+12,S.z],[S.x-12,S.z],[S.x,S.z+12],[S.x,S.z-12]])}}}
/* the huge city: its people (and, in peace, its soldiers) are only awake near you, so 500 inhabitants cost little */
const POOL=[];GL.pool=POOL;
function poolRealm(R){const KR=WD.kingdom.realm(R.id),S=SITE[R.site];if(!KR)return;KR.pool=KR.pool||[];
  for(const a of actors.slice()){if(a.realm!==R.id||a.kind!=='npc'||a===KR.ruler||a.ruler||!(a.job==='villager'||a.job==='guard')||Math.hypot(a.x-S.x,a.z-S.z)>R.hw*1.5||a.shop)continue;const i=actors.indexOf(a);if(i>=0)actors.splice(i,1);a._pin=false;a.root.visible=false;POOL.push({a,R:KR});KR.pool.push(a)}}
let poolT=0;
const PMAX=36;
ANIMS.push(dt=>{poolT+=typeof dt==='number'?dt:.016;if(poolT<.5||!POOL.length)return;poolT=0;const cx=camera.position.x,cz=camera.position.z,K=WD.kingdom;
  /* awake: the 45 nearest within 75 m (and, at war or once the city is yours, every soldier) */
  const near=[];for(const p of POOL){const a=p.a;p.d=Math.abs(a.x-cx)+Math.abs(a.z-cz);p.want=a.dead?a._pin:(a.guard&&(K.atWar(p.R.id)||K.isMine(p.R.id)))||a.order||a.raid||a.lent;if(!p.want&&p.d<75)near.push(p)}
  near.sort((u,v)=>u.d-v.d);for(let i=0;i<near.length&&i<PMAX;i++)near[i].want=true;
  for(const p of POOL){const a=p.a;if(p.want&&!a._pin){actors.push(a);a._pin=true;a.root.visible=true}
    else if(!p.want&&a._pin&&!a.dead){const i=actors.indexOf(a);if(i>=0)actors.splice(i,1);a._pin=false;a.root.visible=false}}});
function populatePlaces(){const P=id=>SITE[id];
  /* villages */
  const vp=(id,n,line,shop,realm)=>{const S=P(id);people(S,24,n,line,HOMES[id],realm);if(shop){const h=HOMES[id]&&HOMES[id][1];sp('merchant',h?h.counter[0]:S.x+4,h?h.counter[1]:S.z+4,{name:'Koopvrouw '+pick(FIRST),ai:'stay',line,shop:okShop(shop)})}};
  vp('vinalia',6,'aurelia',['wine','bread','cheese','apple'],'aur');vp('steenwijk',6,'hoogmark',['iron','wood','bread','potion'],'hgm');vp('bloemendaal',6,'rozendaal',['apple','bread','potion'],'roz');
  vp('hoekstede',6,'valdoria',['fish','bread','cheese'],'val');vp('palmhof',6,'qadir',['spice','bread','apple'],'qad');vp('weidevelde',6,'drakenstein',['cheese','bread','wool','leather'],'drk');vp('zandvoort',7,'grootland',['fish','bread','rod'],null);
  try{for(let i=0;i<8;i++)spawnAnimal('sheep',P('weidevelde').x+30+rr(12),P('weidevelde').z+rr(14))}catch(e){}
  /* the inn at the crossroads */
  {const S=P('kruispunt'),b=CAP.inn;sp('innkeeper',b?b.counter[0]:S.x,b?b.counter[1]:S.z,{name:'Waardin Margriet',ai:'stay',line:'grootland',shop:okShop(typeof FOOD!=='undefined'?FOOD:['bread'])});people(S,18,4,'grootland',null,null)}
  {const S=P('oostwacht');for(let i=0;i<4;i++)sp('guard',S.x+rr(4),S.z+rr(8),{name:'Grenswacht',ai:'guard',patrol:[[S.x-8,S.z],[S.x+8,S.z],[S.x,S.z-10],[S.x,S.z+10]]})}
  /* gladiators in the arena, and the master of the games */
  {const S=P('arena');sp('merchant',S.x+30,S.z+12,{name:'Arenameester Brutus',ai:'stay',line:'aurelia',shop:okShop(['sword_knight','shield_kite','potion','elixir'])});
    for(let i=0;i<4;i++){try{spawnEnemy(i%2?'archer':'bandit',S.x+rr(10),S.z+rr(8),{name:'Gladiator',hp:180,hpMax:180,dmg:15,xp:60,aggro:14})}catch(e){}}}
  /* the mine: miners and golems */
  {const S=P('mijn');for(let i=0;i<4;i++)sp('smith',S.x+rr(12),S.z+rr(8),{name:'Mijnwerker '+pick(FIRST),line:'hoogmark',roam:{x:S.x,z:S.z},radius:14});for(let i=0;i<3;i++)try{spawnMonster('golem',S.x+rr(22),S.z+16+rr(8))}catch(e){}
    try{makeChest(S.x+8,S.z-6,'gl_mine',0,'Kist van de mijnbaas')}catch(e){}}
  /* monks, a wizard, a lighthouse keeper, caravan traders */
  {const S=P('klooster'),b=CAP.abbey;sp('priest',b?b.counter[0]:S.x,b?b.counter[1]:S.z,{name:'Abt Benedictus',ai:'stay',line:'grootland',shop:okShop(['potion','elixir','salve','wine'])});for(let i=0;i<4;i++)sp('priest',S.x+rr(16),S.z+rr(16),{name:'Broeder '+pick(FIRST),roam:{x:S.x,z:S.z},radius:16})}
  {const S=P('toren');sp('hermit',S.x+6,S.z+6,{name:'Tovenaar Mirabor',ai:'stay',line:'grootland',shop:okShop(['potion','elixir','amu_wise','amu_life','gem'])})}
  {const S=P('vuurtoren');sp('villager',S.x+6,S.z+3,{name:'Vuurtorenwachter Bram',ai:'stay',line:'grootland'})}
  {const S=P('oase');sp('merchant',S.x-20,S.z+4,{name:'Karavaanhandelaar Farid',ai:'stay',line:'qadir',shop:okShop(['spice','silk','wine','gem','pearl'])});sp('merchant',S.x+20,S.z+10,{name:'Waterverkoopster Leila',ai:'stay',line:'qadir',shop:okShop(['potion','apple','bread'])});people(S,26,3,'qadir',null,null)}
  /* the pyramid: mummies and the pharaoh guard the treasure */
  {const S=P('piramide');for(let i=0;i<8;i++){try{spawnEnemy('skeleton',S.x+rr(34),S.z+30+rr(14),{name:'Mummie',hp:90,hpMax:90,dmg:14,xp:40})}catch(e){}}
    try{const f=spawnEnemy('skeleton',S.x,S.z+26,{name:'Farao Khemet',hp:1800,hpMax:1800,dmg:42,xp:900,boss:'farao',aggro:18});if(f&&f.root)f.root.scale.setScalar(1.6)}catch(e){}
    try{makeChest(S.x+4,S.z+29,'gl_pharaoh',0,'Schat van de Farao')}catch(e){}}
  /* the robbers' stronghold */
  {const S=P('rovers');for(let i=0;i<10;i++){try{spawnEnemy(i%3?'bandit':'archer',S.x+rr(14),S.z+rr(14))}catch(e){}}try{spawnEnemy('bandit',S.x,S.z,{name:'Roverhoofdman Zwartbaard',hp:600,hpMax:600,dmg:26,xp:300,boss:'zwartbaard'})}catch(e){}
    try{makeChest(S.x-4,S.z-8,'gl_robbers',0,'Buitkist van Zwartbaard')}catch(e){}}
  /* wild things in the new land */
  const spot=(cx,cz,R,ok)=>{for(let i=0;i<60;i++){const a=Math.random()*6.283,d=Math.sqrt(Math.random())*R,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,h=terrainH(x,z);if(h<1.6||h>55||siteAt(x,z)||roadDist(x,z)<5)continue;if(ok&&!ok(x,z,h))continue;return[x,z]}return null};
  const put=(type,cx,cz,R,n,ok)=>{for(let i=0;i<n;i++){const p=spot(cx,cz,R,ok);if(!p)continue;try{if(type==='wolf'||type==='bandit'||type==='archer')spawnEnemy(type,p[0],p[1]);else spawnMonster(type,p[0],p[1])}catch(e){}}};
  put('wolf',1250,-1000,200,6);put('wolf',1650,250,160,5);put('wolf',-700,1400,200,6);put('wolf',-1300,900,180,5);put('wolf',1050,1250,160,4);
  put('bear',800,-1300,200,3);put('bear',1650,450,150,2);put('bear',-1250,1150,200,3);
  put('boar',1300,-650,200,4);put('boar',1150,850,150,4);put('boar',-500,1500,160,4);put('boar',-1000,1300,200,4);
  put('troll',1000,-1150,150,2);put('troll',-900,1450,150,2);put('troll',1600,500,120,1);
  put('terrorbird',330,1450,260,6,(x,z)=>desertK(x,z)>.5);
  put('goblin',-1250,1350,90,6);put('goblin',1620,-850,80,5);
  for(const [cx,cz] of[[1520,1100],[-650,1250],[900,-1050]]){put('bandit',cx,cz,50,3);put('archer',cx,cz,50,1)}
  try{travellers()}catch(e){console.warn('travellers',e)}
  try{markets()}catch(e){console.warn('markets',e)}}
Object.assign(CHEST_LOOT,{gl_mine:{gold:600,items:[['iron',6],['gem',2],['potion',2]]},gl_pharaoh:{gold:3000,items:[['gem',6],['relic',2],['ring_gold',1],['elixir',2]]},gl_robbers:{gold:1500,items:[['gem',3],['sword_knight',1],['potion',3]]}});
for(const k of Object.keys(CHEST_LOOT))if(/^gl_/.test(k))CHEST_LOOT[k].items=CHEST_LOOT[k].items.filter(([id])=>ITEMS[id]);

/* ---------- build and fill the new land with the rest of the world ---------- */
/* travellers: traders, caravans, people moving house, pilgrims and messengers, on the great roads between the realms */
const TRADE=[
  [[400,58],[520,20],[620,-30],[720,-8],[860,-30],[1010,-55],[1160,-60],[1320,-55],[1449,-51],[1451,-110],[1495,-150],[1495,-318]],
  [[1495,-318],[1495,-500],[1421,-517],[1477,-526],[1557,-622],[1557,-686],[1525,-718],[1525,-750],[1381,-878],[1317,-862],[1269,-814],[1123,-816],[1100,-950],[924,-1134],[874,-1216],[790,-1216]],
  [[1449,-51],[1522,-33],[1650,95],[1714,95],[1730,111],[1730,223],[1794,287],[1794,319],[1746,367],[1746,463],[1682,527],[1650,527],[1538,639],[1506,639],[1410,703],[1362,703],[1312,649],[1312,727],[1312,805],[1112,1001],[1031,1090],[947,1090],[863,1090],[851,1108],[787,1108],[723,1156],[659,1172],[483,1332],[433,1331],[350,1430],[252,1430]],
  [[814,545],[930,560],[1050,590],[1160,630],[1180,650],[1178,876],[1112,1001],[1031,1090],[947,1090]],
  [[-198,774],[-130,880],[-70,1000],[-10,1110],[40,1190],[72,1250],[138,1332],[252,1332],[252,1430]],
  [[252,1430],[252,1332],[138,1332],[72,1250],[60,1444],[76,1508],[44,1540],[-84,1540],[-116,1572],[-244,1588],[-324,1508],[-324,1476],[-372,1428],[-374,1395],[-400,1370],[-480,1370],[-512,1338],[-736,1322],[-898,1192],[-966,1111],[-984,1045],[-1082,1045]]];
const TOWN=['Aurelia','Rozendaal','Valdoria','Al-Qadir','Hoogmark','Drakenstein','Zilverhaven','Eikendal','Zandvoort'];
function travellers(){const kinds=[['merchant','Koopman',['silk','spice','wine','gem','bread','potion']],['merchant','Handelaarster',['cheese','apple','wine','salve','potion']],['traveler','Reiziger',null],['villager','Verhuizer',null],['priest','Pelgrim',null],['traveler','Bode',null]];
  TRADE.forEach((pts,ri)=>{let c;try{c=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p[0],0,p[1])),false,'centripetal');c.len=c.getLength()}catch(e){return}
    const n=3+Math.floor(c.len/700);for(let i=0;i<n;i++){const u=(i+Math.random()*.6)/n,p0=c.getPointAt(u),k=pick(kinds),to=pick(TOWN),grp=k[1]==='Koopman'||k[1]==='Verhuizer'?2:1,dir=Math.random()<.5?1:-1;
      for(let g=0;g<grp;g++){const uu=Math.min(1,Math.max(0,u+g*.004*dir*-1));const q=c.getPointAt(uu);const a=sp(g?(k[1]==='Koopman'?'guard':'villager'):k[0],q.x,q.z,{name:(g?(k[1]==='Koopman'?'Karavaanwacht':'Gezinslid'):k[1])+' '+pick(FIRST)+' (naar '+to+')',ai:'travel',road:c,u:uu,dir,line:'reiziger',shop:!g&&k[2]?okShop(k[2]):undefined});if(a){a.trav=true;if(!g&&k[0]==='merchant')a.trader=true}}}})}

/* ---------- markets: travelling traders set up their own stall and sell goods from far-away lands ----------
   Every region has its own goods, sold by the merchants who live there. Travelling traders bring them elsewhere:
   when one comes to a town, he walks to the square, sets up a stall with a coloured awning and sells there for a few
   minutes things you cannot buy in that region; then he packs up and goes on along the road. In every capital and
   in the old towns a foreign trader already stands at the market when you arrive. */
Object.assign(ITEMS,{
  honing:{n:'Honing uit Eikendal',g:'food',heal:15,stam:10,price:14,ico:'🍯'},cider:{n:'Appelcider uit Rivierhof',g:'food',heal:10,stam:25,price:16,ico:'🍺'},
  bont:{n:'Bont uit Noordheim',g:'mat',price:90,ico:'🧶',rar:'r'},olijfolie:{n:'Olijfolie uit Aurelia',g:'food',heal:12,stam:15,price:30,ico:'🫒'},
  koper:{n:'Koper uit Hoogmark',g:'mat',price:45,ico:'🟠'},rozenwater:{n:'Rozenwater uit Rozendaal',g:'food',heal:60,price:70,ico:'🌹',rar:'r'},
  dadels:{n:'Dadels uit Al-Qadir',g:'food',heal:22,stam:20,price:15,ico:'🌴'},tapijt:{n:'Tapijt uit Al-Qadir',g:'mat',price:220,ico:'🧿',rar:'r'},
  drakenstaal:{n:'Drakenstaal uit Drakenstein',g:'mat',price:320,ico:'⚙',rar:'e'},zeezout:{n:'Zeezout uit Valdoria',g:'food',heal:5,price:20,ico:'🧂'}});
const GOODS={oud:['honing','cider','pearl','cheese'],noord:['bont'],oost:['olijfolie','koper','rozenwater','wine'],zuid:['dadels','tapijt','drakenstaal','zeezout','spice','silk']};
const REGN={oud:'het oude land',noord:'Noordheim',oost:'het Oostland',zuid:'het Zuidland'};
const regionOf=(x,z)=>x<-30000?'noord':Math.hypot(x,z)<1050?'oud':aOf(x,z)<35?'oost':'zuid';
function foreign(x,z,n=6){const here=regionOf(x,z),pool=[];for(const k in GOODS)if(k!==here)pool.push(...GOODS[k]);const out=[];pool.sort(()=>Math.random()-.5);for(const id of pool)if(ITEMS[id]&&!out.includes(id)&&out.length<n)out.push(id);return out}
GL.localGoods=(x,z)=>(GOODS[regionOf(x,z)]||[]).filter(id=>ITEMS[id]);
const MARKETS=[];
/* the stall is the same model as every market stall in the game; its colliders are kept so it can be packed up again */
function stallAt(x,z,ry,col){const sx=x+Math.sin(ry)*1.15,sz=z+Math.cos(ry)*1.15,cols=[],_ab=addBox,_ac=addCircle;let g=null;
  addBox=function(){const c=_ab.apply(this,arguments);cols.push(c);return c};addCircle=function(){const c=_ac.apply(this,arguments);cols.push(c);return c};
  try{g=stall(sx,sz,ry/(Math.PI/2),col)}catch(e){console.warn('stall',e)}finally{addBox=_ab;addCircle=_ac}
  return{g,cols}}
function dropStall(st){if(!st)return;if(st.g)scene.remove(st.g);for(const c of st.cols||[])if(c)c.off=true}
function stallSpot(m){for(let i=0;i<30;i++){const an=Math.random()*6.283,r=m.r0+Math.random()*6,x=m.x+Math.cos(an)*r,z=m.z+Math.sin(an)*r;if(collide({x,z},1.6)||inBuilding(x,z,1.5)||groundH(x,z)<.5)continue;
  if(MARKETS.some(q=>q.used.some(u=>Math.hypot(u[0]-x,u[1]-z)<4)))continue;return[x,z,Math.atan2(m.x-x,m.z-z)]}return null}
const CALLS=['Kom kijken! Spullen van ver weg!','Dit vind je nergens anders!','Vers aangekomen uit verre landen!','Goede prijzen, eerlijke koopman!'];
function openStall(a,m,stay){const p=stallSpot(m);if(!p)return false;const [x,z,ry]=p;m.used.push([x,z]);
  a.mk={m,x,z,ry,phase:stay?'sell':'go',until:stay?1e12:PL.t+rnd(160,280),goods:foreign(m.x,m.z),st:null,spot:[x,z]};a.shop0=a.shop;
  if(stay){a.x=x;a.z=z;a.rot=ry;a.mk.st=stallAt(x,z,ry,pick([0xa82a22,0x2a5a9a,0xd8a83a,0x3a7a3a,0x7a3a8a]));a.shop=a.mk.goods}return true}
function closeStall(a){const k=a.mk;if(!k)return;dropStall(k.st);k.m.used=k.m.used.filter(u=>u!==k.spot&&!(u[0]===k.spot[0]&&u[1]===k.spot[1]));a.shop=a.shop0;k.phase='back'}
function marketAI(a,dt){const k=a.mk;
  if(k.phase==='go'){if(stepTo(a,dt,k.x,k.z,2.2,.5)||a.stuck>4){a.x=k.x;a.z=k.z;k.phase='sell';k.st=stallAt(k.x,k.z,k.ry,pick([0xa82a22,0x2a5a9a,0xd8a83a,0x3a7a3a,0x7a3a8a]));a.shop=k.goods;saySomething(a,'Mijn kraam staat! Spullen uit '+REGN[pick(Object.keys(REGN).filter(r=>r!==regionOf(k.m.x,k.m.z)))]+'!',3.5)}return}
  if(k.phase==='sell'){a.vel=0;const d=Math.hypot(PL.x-a.x,PL.z-a.z),want=d<7?Math.atan2(PL.x-a.x,PL.z-a.z):k.ry;a.rot+=angDiff(a.rot,want)*Math.min(1,dt*4);a.t-=dt;if(a.t<=0){a.t=rnd(10,20);if(d<26)saySomething(a,pick(CALLS),3)}
    if(PL.t>k.until&&d>12)closeStall(a);return}
  const p=a.road?a.road.getPointAt(a.u||0):null;if(!p||stepTo(a,dt,p.x,p.z,2.2,.8)||a.stuck>4){a.mk=null;a.lastMk=PL.t}}
const _tAI=travelAI;travelAI=function(a,dt){if(a.mk)return marketAI(a,dt);
  if(a.trader&&PL.t-(a.lastMk||-1e9)>240){a.mkT=(a.mkT||0)+dt;if(a.mkT>1){a.mkT=0;for(const m of MARKETS)if(Math.abs(a.x-m.x)<50&&Math.abs(a.z-m.z)<50&&m.used.length<4){if(openStall(a,m,false))return}}}
  return _tAI(a,dt)};
function markets(){for(const R of RLM){const S=SITE[R.site];MARKETS.push({n:R.name,x:S.x,z:S.z,r0:22,used:[]})}
  for(const id of['vinalia','steenwijk','bloemendaal','hoekstede','palmhof','weidevelde','zandvoort','kruispunt'])if(SITE[id])MARKETS.push({n:SITE[id].name,x:SITE[id].x,z:SITE[id].z,r0:10,used:[]});
  for(const [n,x,z,r0] of[['Eikendal',0,2,14],['Zilverburg',300,-215,14],['Zilverhaven',730,545,24],['Beukenrode',-260,-90,8],['Rivierhof',432,64,8]])MARKETS.push({n,x,z,r0,used:[]});
  /* in every capital and old town a foreign trader already stands at his stall */
  for(const m of MARKETS){if(m.r0<14)continue;const a=sp('merchant',m.x+m.r0,m.z,{name:'Marktkoopman '+pick(FIRST),ai:'stay',line:'reiziger'});if(a&&!openStall(a,m,true))a.shop=foreign(m.x,m.z)}
  /* the merchants of each region sell its own goods */
  const home=[['oud',0,2],['oost',1495,-318],['oost',1312,727],['oost',790,-1216],['zuid',252,1430],['zuid',947,1090],['zuid',-1082,1045]];
  for(const [r,x,z] of home){const a=sp('merchant',x-6,z+20,{name:'Streekkoopman '+pick(FIRST),ai:'stay',line:'reiziger',shop:okShop(GOODS[r])});if(a)a.face=Math.PI}}
const _bfG=buildFantasy;buildFantasy=function(){_bfG();for(const R of RLM)try{capital(R)}catch(e){console.warn('great capital '+R.id,e)}
  try{village('vinalia',{n:7,look:null,fields:[[-40,0,24,30,'#5a2a5a'],[38,-6,22,26,'#5a2a5a']]})}catch(e){console.warn(e)}
  try{village('steenwijk',{n:7,style:'stone',look:'green',fields:[[36,10,22,16,'#9a8f45']]})}catch(e){console.warn(e)}
  try{village('bloemendaal',{n:6,look:null,fields:[[-38,0,20,30,'#c23a5a'],[36,4,20,26,'#e0c040'],[0,38,26,14,'#8a4ab0']]})}catch(e){console.warn(e)}
  try{village('hoekstede',{n:7,style:'plaster',look:'blue',fields:[[36,0,24,18,'#9a8f45']]})}catch(e){console.warn(e)}
  try{village('palmhof',{n:6,style:'plaster',look:'flat',palms:10,fields:[[-36,6,20,16,'#8a9a3a']]})}catch(e){console.warn(e)}
  try{village('weidevelde',{n:7,style:'stone',look:'slate',fields:[[38,0,30,26,'#7f9a3f']]})}catch(e){console.warn(e)}
  try{village('zandvoort',{n:8,style:'wood',look:null})}catch(e){console.warn(e)}
  try{buildPlaces()}catch(e){console.warn('great places',e)}GL.built=true};
const _pfG=populateFantasy;populateFantasy=function(){_pfG();if(!GL.built)return;for(const R of RLM)try{populateRealm(R)}catch(e){console.warn('great people '+R.id,e)}
  setTimeout(()=>{for(const R of RLM)if(R.mega)try{poolRealm(R)}catch(e){console.warn('pool',e)}},0);try{populatePlaces()}catch(e){console.warn('great places people',e)}};

/* ---------- the desert on the map, and no drawing of land hidden in the fog ---------- */
if(typeof buildMapBase==='function'){const _bmbG=buildMapBase;buildMapBase=async function(){await _bmbG.apply(this,arguments);try{desertMap()}catch(e){console.warn('desert map',e)}}}
function desertMap(){const g=mapBase.getContext('2d'),x0=Math.max(0,Math.floor(mpx(DES.x-DES.r-90))),z0=Math.max(0,Math.floor(mpx(DES.z-DES.r-90))),w=Math.min(MAPN-x0,Math.ceil((DES.r+90)*2*MS)),hh=Math.min(MAPN-z0,w);
  const im=g.getImageData(x0,z0,w,hh),d=im.data;
  for(let j=0;j<hh;j++)for(let i=0;i<w;i++){const x=(x0+i)/MS-HALF,z=(z0+j)/MS-HALF,k=desertK(x,z);if(k<=.02)continue;const q=(j*w+i)*4;if(d[q+2]>d[q]+15)continue;d[q]=lerp(d[q],214,k*.9);d[q+1]=lerp(d[q+1],188,k*.9);d[q+2]=lerp(d[q+2],128,k*.9)}
  g.putImageData(im,x0,z0);g.strokeStyle='#d9c9a0';g.lineWidth=1.3;for(const r of ROADS){g.beginPath();r.pts.forEach((p,i)=>i?g.lineTo(mpx(p[0]),mpx(p[1])):g.moveTo(mpx(p[0]),mpx(p[1])));g.stroke()}}
/* the world is big now: land, walls, roads and props far beyond the haze are not drawn (when you fly high you see further) */
const CULL=[];let cullG=0,scanT=0;
function scanCull(){const seen=new Set(CULL.map(c=>c.o)),ch=new Set((WD.chunks||[]).map(c=>c.m)),v=new T.Vector3();
  for(const o of scene.children){if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||seen.has(o)||ch.has(o)||!o.visible||o.userData.dyn||!o.geometry)continue;const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const b=g.boundingSphere;
    if(!b||!isFinite(b.radius))continue;o.updateMatrixWorld();v.copy(b.center).applyMatrix4(o.matrixWorld);const r=b.radius*Math.max(o.scale.x,o.scale.y,o.scale.z);if(r>900)continue;CULL.push({o,x:v.x,z:v.z,r})}}
ANIMS.push(dt=>{const st=typeof dt==='number'?dt:.016;if(typeof worldReady==='undefined'||!worldReady)return;scanT+=st;if(scanT>6&&scanT<1e8){scanT=1e9;try{scanCull()}catch(e){console.warn('cull',e)}}
  cullG-=st;if(cullG>0)return;cullG=.4;const dens=scene.fog&&scene.fog.density||0,cx=camera.position.x,cz=camera.position.z,high=camera.position.y>150,
    far=Math.min(dens>0?2.4/dens:1e9,high?3200:1500)+150,near=Math.min(dens>0?2.4/dens:1e9,high?2600:1000);
  if(WD.chunks)for(const c of WD.chunks)c.m.visible=Math.hypot(c.x-cx,c.z-cz)<far;
  for(const c of CULL){const o=c.o,show=Math.hypot(c.x-cx,c.z-cz)-c.r<near;if(!show&&o.visible){o.visible=false;o.userData.gcull=true}else if(show&&o.userData.gcull){o.visible=true;o.userData.gcull=false}}});

/* ---------- the goods map: a button on the big map shows what each town and village sells ---------- */
let goodsOn=false,goodsC=null,goodsT=-1e9;
function goodsBySite(){if(goodsC&&performance.now()-goodsT<5000)return goodsC;goodsT=performance.now();const out=[];
  for(const st of SITES){if(st.id==='bridge')continue;const R=Math.max(40,st.r*1.35),L=[];
    for(const a of actors){if(a.kind!=='npc'||a.dead||!a.shop||!a.shop.length||a.trader||a.lent)continue;const sx=a.spawn?a.spawn.x:a.x,sz=a.spawn?a.spawn.z:a.z;if(Math.abs(sx-st.x)>R||Math.abs(sz-st.z)>R)continue;
      for(const id of(a.mk&&a.mk.goods)||a.shop)if(ITEMS[id]&&!L.includes(id))L.push(id)}
    if(L.length){const reg=new Set(Object.values(GOODS).flat());L.sort((p,q)=>(reg.has(q)?1:0)-(reg.has(p)?1:0));out.push({st,L})}}
  return goodsC=out}
/* item icons are little pictures (an <img> with a data URL), so they are drawn as images, not as text */
const ICOIMG={};
function icoDraw(g,id,x,y,sz){const ic=(ITEMS[id]&&ITEMS[id].ico)||'',m=/src="([^"]+)"/.exec(ic);
  if(m){let im=ICOIMG[m[1]];if(!im){im=ICOIMG[m[1]]=new Image();im.onload=()=>{if(goodsOn)try{drawBigMap()}catch(e){}};im.src=m[1]}if(im.complete&&im.naturalWidth)g.drawImage(im,x-sz/2,y-sz/2,sz,sz);return}
  g.fillText(ic&&ic.length<=4?ic:'•',x,y)}
if(typeof drawBigMap==='function'){const _dbmG=drawBigMap;drawBigMap=function(){_dbmG.apply(this,arguments);if(!goodsOn)return;try{
  const c=$('bigmap'),g=c.getContext('2d'),k=c.width/MAPN,reg=new Set(Object.values(GOODS).flat()),SZ=16;g.save();g.textAlign='center';g.textBaseline='middle';g.font='13px sans-serif';
  for(const {st,L} of goodsBySite()){const px=mpx(st.x)*k,py=mpx(st.z)*k+24;if(px<0||py<0||px>c.width||py>c.height)continue;const show=L.slice(0,6),w=show.length*(SZ+2)+8;
    g.fillStyle='rgba(20,14,6,.86)';g.strokeStyle=L.some(id=>reg.has(id))?'#e0b04a':'#8a7a5a';g.lineWidth=1.5;g.beginPath();if(g.roundRect)g.roundRect(px-w/2,py-11,w,22,5);else g.rect(px-w/2,py-11,w,22);g.fill();g.stroke();
    g.fillStyle='#fff';show.forEach((id,i)=>icoDraw(g,id,px-w/2+4+SZ/2+i*(SZ+2),py,SZ));
    if(!PL.discovered[st.id]){g.font='bold 12px "IM Fell English",serif';g.strokeStyle='#1b140c';g.lineWidth=3;g.strokeText(st.name,px,py-19);g.fillStyle='#fff';g.fillText(st.name,px,py-19);g.font='13px sans-serif'}}
  /* the legend: the goods of each region */
  const rows=Object.entries(GOODS).map(([r,L])=>[REGN[r][0].toUpperCase()+REGN[r].slice(1),L.filter(id=>ITEMS[id])]);g.textAlign='left';g.font='13px sans-serif';
  const lw=Math.max(...rows.map(r=>g.measureText(r[0]).width))+14,bw=lw+Math.max(...rows.map(r=>r[1].length))*(SZ+2)+16,bh=rows.length*21+30,bx=8,by=c.height-bh-8;
  g.fillStyle='rgba(20,14,6,.9)';g.fillRect(bx,by,bw,bh);g.strokeStyle='#e0b04a';g.lineWidth=1.5;g.strokeRect(bx,by,bw,bh);g.fillStyle='#ffd27a';g.fillText('Grondstoffen per streek',bx+9,by+14);
  rows.forEach(([n,L],i)=>{const yy=by+36+i*21;g.fillStyle='#f0e6cc';g.textAlign='left';g.fillText(n,bx+9,yy);g.textAlign='center';L.forEach((id,j)=>icoDraw(g,id,bx+lw+8+SZ/2+j*(SZ+2),yy,SZ))});
  g.restore()}catch(e){console.warn('goods map',e)}}}
setInterval(()=>{const w=$('mapw');if(!w||w.querySelector('#glgoods'))return;const h=w.querySelector('h2');if(!h)return;const b=document.createElement('button');b.id='glgoods';b.className='btn';b.style.marginLeft='10px';b.textContent='📦 Grondstoffen';
  b.onclick=e=>{e.stopPropagation();goodsOn=!goodsOn;b.className='btn'+(goodsOn?' pri':'');goodsC=null;try{drawBigMap()}catch(x){}};h.after(b)},900);

/* ---------- fountains, arrivals and the news ---------- */
ANIMS.push(dt=>{if(!GL.built||PL.inCave)return;if(window.PW&&PW.ps)for(const [x,y,z] of FOUNT)if(Math.abs(x-PL.x)<120&&Math.abs(z-PL.z)<120&&Math.random()<dt*20)pwEm(PW.ps,x+rr(.3),y,z+rr(.3),rr(1.1),2.4+Math.random(),rr(1.1),.9,.18,.04,[.7,.85,1],[.4,.6,.9],.7,-9,1)});
let arrT=0;
ANIMS.push(dt=>{arrT+=typeof dt==='number'?dt:.016;if(arrT<1||!started||!GL.built||PL.dead||PL.inCave)return;arrT=0;PL.fx=PL.fx||{};const seen=PL.fx.seenG=PL.fx.seenG||{};
  if(!PL.fx.bigWorld&&!document.body.classList.contains('cine')&&!anyModal()&&PL.t>8){PL.fx.bigWorld=1;try{WD.kingdom.card('🌍 De wereld is veel groter geworden!','Achter de bergen in het oosten (door De Oostpas bij de Levensbron, of over De Drakenpas bij het Drakennest) en over De Zandbank in het zuiden ligt een nieuw land met zes machtige rijken: de keizerrijken Aurelia en Drakenstein, het sultanaat Al-Qadir en de koninkrijken Hoogmark, Valdoria en Rozendaal. Ze zijn veel sterker dan de oude rijken. Verover ze met je leger, maar pas op: sommige rijken vallen jou ook aan!',null,16)}catch(e){}}
  for(const R of RLM){const S=SITE[R.site];if(seen[R.site])continue;const d=Math.hypot(PL.x-S.x,PL.z-S.z);if(d>R.hw+50)continue;seen[R.site]=1;giveXp(250);
    addLog('Je komt aan in '+R.name+': '+R.sub.toLowerCase()+'. Hier heerst '+R.ruler+'.','#e0b04a');
    if(window.cinematic&&!CIN.on&&!PL.mounted){const V=(a,b,c)=>new T.Vector3(a,b,c),y=gy(S.x,S.z),H=R.hw;
      cinematic([{d:3.4,from:V(S.x-H*1.6,y+70,S.z+H*1.5),to:V(S.x-H*.7,y+42,S.z+H*.8),lf:V(S.x,y+8,S.z),lt:V(S.x+H*.3,y+10,S.z-H*.3)},
        {d:3.2,from:V(S.x+H*.1,y+20,S.z),to:V(S.x+H*.3,y+16,S.z-H*.1),lf:V(S.x+H*.5,y+12,S.z-H*.5),lt:V(S.x+H*.5,y+10,S.z-H*.5)}],R.name,R.sub)}}
  for(const [id,p] of Object.entries(PLACES)){if(seen[id]||RLM.some(R=>R.site===id))continue;const d=Math.hypot(PL.x-p.x,PL.z-p.z);if(d>p.r+30)continue;seen[id]=1;giveXp(80);addLog('Ontdekt: '+p.n+'!','#e0b04a')}});
})();
