/* ================= Seasons, and a farm of your own =================
   - Seizoenen: every two days of the game the season turns. Spring: blossom drifts through the air and the trees are
     fresh and pink-tinted. Summer: green and warm. Autumn: the leaves turn orange and red and fall. Winter: snow falls,
     the land and the trees turn white, and the lakes and the sea freeze to ice. The season shows beside the weather.
   - Je eigen boerderij: Boer Hendrik near Eikendal sells you a farm (1500 gold): a farmhouse, a field of twelve plots,
     cows and chickens. Sow wheat and pumpkins, wait while they grow (not in winter!), harvest them; collect eggs and milk.
   - Het oogstfeest: when autumn comes, Eikendal holds its harvest festival. Go there: bells, dancing people, and the
     village pays you for every harvest you brought in this year. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}},chron=t=>{try{WD.chron.add(t)}catch(e){}},FX=()=>{PL.fx=PL.fx||{};return PL.fx};
const SEAS=[{n:'Lente',ico:'🌸',k:'spring'},{n:'Zomer',ico:'☀',k:'summer'},{n:'Herfst',ico:'🍂',k:'autumn'},{n:'Winter',ico:'❄',k:'winter'}],DAYS=2;
const season=()=>SEAS[Math.floor((FX().day||0)/DAYS)%4];WD.season=season;
Object.assign(ITEMS,{pompoen:{n:'Pompoen',g:'food',heal:25,price:9,ico:'🎃'},ei:{n:'Ei',g:'food',heal:6,price:3,ico:'🥚'},melk:{n:'Melk',g:'food',heal:4,stam:30,price:4,ico:'🥛'}});
/* ---------- counting days ---------- */
const SN={last:-1,cur:null,mats:null,terr:[],k:0,from:null};
ANIMS.push(dt=>{if(!started)return;const t=ENV.time;if(SN.last>=0&&SN.last>23&&t<1)FX().day=(FX().day||0)+1;SN.last=t;const s=season();
  if(SN.cur!==s.k){const first=SN.cur===null;SN.cur=s.k;SN.k=0;if(!first){sfx('quest');card(s.ico+' '+s.n+'!',{spring:'De lente is begonnen! De bomen bloeien en de bloesem dwarrelt door de lucht.',summer:'Het is zomer: warm, groen en lange dagen.',autumn:'De herfst is begonnen. De bladeren kleuren oranje en rood... en in Eikendal is het oogstfeest!',winter:'De winter is gekomen! Sneeuw valt, en de meren en de zee bevriezen.'}[s.k],null,9);if(s.k==='autumn')FX().feast=0}}});
/* the season beside the weather (its own little span: the weather text itself is rewritten by the game) */
setInterval(()=>{const w=$('wx');if(!w||!started)return;let sp=$('seasonx');if(!sp){sp=document.createElement('span');sp.id='seasonx';w.after(sp)}const s=season(),want=' · '+s.ico+' '+s.n;if(sp.textContent!==want)sp.textContent=want},1000);
/* ---------- the look of the seasons: trees, grass, ground and water ---------- */
const PLANT=/^leaves|leaf|grass|bush|fern|plant|clover|flower|hedge|vine/i;
function collect(){SN.mats=[];const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const m=o.material;if(seen.has(m)||!m.color)return;seen.add(m);
    if(m.vertexColors&&m.map&&typeof TEX!=='undefined'&&m.map===TEX.grass){SN.terr.push({m,c:m.color.clone(),e:m.emissive?m.emissive.clone():null,ei:m.emissiveIntensity});return}
    const c=m.color,named=PLANT.test(m.name||''),green=o.isInstancedMesh&&c.g>c.r*1.05&&c.g>c.b*1.05&&c.g>.12;
    if(named||green)SN.mats.push({m,c:c.clone(),e:m.emissive?m.emissive.clone():null,ei:m.emissiveIntensity??1,pine:/pine/i.test(m.name||''),i:SN.mats.length})});
  if(typeof waterMesh!=='undefined'&&waterMesh)SN.water={m:waterMesh.material,c:waterMesh.material.color.clone(),r:waterMesh.material.roughness,o:waterMesh.material.opacity}}
const TG={spring:new T.Color(0xf6c4dc),autumn:new T.Color(0xe08a3a),autumn2:new T.Color(0xc0502a),frost:new T.Color(0x9aa4b0)};
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!started)return;if(!SN.mats){if(PL.t>3)collect();return}if(SN.k>=1)return;SN.k=Math.min(1,SN.k+dt/8);const s=SN.cur,k=SN.k;
  for(const q of SN.mats){let col=q.c;if(!q.pine){if(s==='spring'&&q.i%3===0)col=q.c.clone().lerp(TG.spring,.4);if(s==='autumn')col=q.c.clone().lerp(q.i%2?TG.autumn:TG.autumn2,.7)}q.m.color.lerp(col,k);
    /* snow and frost: a pale glow over leaves and grass */if(q.e){q.m.emissive.lerp(s==='winter'?TG.frost:q.e,k);q.m.emissiveIntensity=s==='winter'?.85:q.ei}}
  for(const q of SN.terr){if(!q.e)continue;const w=s==='winter';q.m.emissive.lerp(w?new T.Color(0x8a929c):q.e,k);q.m.emissiveIntensity=w?.55:q.ei;q.m.color.lerp(s==='autumn'?new T.Color(0xf0dcb8):q.c,k)}
  const W=SN.water;if(W){const w=s==='winter';W.m.color.lerp(w?new T.Color(0xdcecf6):W.c,k);W.m.roughness=w?.15:W.r;W.m.opacity=w?.97:W.o;if(W.m.emissive){if(!W.e)W.e=W.m.emissive.clone();W.m.emissive.lerp(w?new T.Color(0x9ab4c8):W.e,k)}}});
/* falling snow, leaves or blossom around you */
const FALL={pts:null,n:1400,v:null};
function fallInit(){const g=new T.BufferGeometry(),p=new Float32Array(FALL.n*3);for(let i=0;i<FALL.n;i++){p[i*3]=rr(40);p[i*3+1]=Math.random()*30;p[i*3+2]=rr(40)}g.setAttribute('position',new T.BufferAttribute(p,3));
  FALL.pts=new T.Points(g,new T.PointsMaterial({color:0xffffff,size:.22,transparent:true,opacity:.9,depthWrite:false}));FALL.pts.frustumCulled=false;scene.add(FALL.pts)}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!started)return;if(!FALL.pts)fallInit();const s=SN.cur,on=!PL.inCave&&(s==='winter'||s==='autumn'||s==='spring');FALL.pts.visible=on;if(!on)return;
  const m=FALL.pts.material,n=s==='winter'?FALL.n:s==='autumn'?260:320;m.color.setHex(s==='winter'?0xffffff:s==='autumn'?0xd8742a:0xf6c0d8);m.size=s==='winter'?.22:.32;FALL.pts.geometry.setDrawRange(0,n);
  const p=FALL.pts.geometry.attributes.position,a=p.array,c=camera.position,sp=s==='winter'?2.2:1.1,t=PL.t;
  for(let i=0;i<n;i++){let y=a[i*3+1]-dt*sp;a[i*3]+=Math.sin(t+i)*dt*(s==='winter'?.3:.9);if(y<-2){y=26;a[i*3]=rr(40);a[i*3+2]=rr(40)}a[i*3+1]=y}p.needsUpdate=true;FALL.pts.position.set(c.x,c.y-8,c.z)});
/* ---------- the farm ---------- */
const FM={g:null,plots:[],an:[],it:[]};
function field(px,pz){for(let i=0;i<60;i++){const a=Math.random()*6.283,r=90+i*3,x=px+Math.cos(a)*r,z=pz+Math.sin(a)*r;let ok=true;for(let k=0;k<10&&ok;k++){const qx=x+rr(18),qz=z+rr(18),h=terrainH(qx,qz);if(h<1.6||h>40||inBuilding(qx,qz,2)||siteAt(qx,qz)||roadDist(qx,qz)<5||slopeAt(qx,qz)>.3||forestDensity(qx,qz)>.3)ok=false}if(ok)return{x,z}}return null}
function buildFarm(){const F=FX().farm;if(!F||FM.g)return;const g=new T.Group();scene.add(g);FM.g=g;const x=F.x,z=F.z,y=groundH(x,z);
  try{const gone=(tx,tz)=>Math.hypot(tx-x,tz-z)<26;for(const t of TREES.oak.concat(TREES.pine))if(!t.cut&&gone(t.x,t.z)){t.cut=true;t.gone=true;if(t.col)t.col.off=true;try{if(t.lodM)asLow(t,false);else setInst(t.ii||[],false,[])}catch(e){}}}catch(e){}
  const wall=new T.MeshStandardMaterial({color:0xe8dcc0,roughness:.9}),roof=new T.MeshStandardMaterial({color:0x8a3a24,roughness:.9}),soil=new T.MeshStandardMaterial({color:0x5a3a22,roughness:1});
  g.add(mesh(new T.BoxGeometry(8,4,6),wall,x-12,y+2,z-10));const r=mesh(new T.ConeGeometry(6.2,3.4,4),roof,x-12,y+5.7,z-10);r.rotation.y=Math.PI/4;r.scale.set(1,1,.75);g.add(r);addBox(x-16,z-13,x-8,z-7);
  g.add(mesh(new T.BoxGeometry(3,2,2.4),MAT.wood,x+12,y+1,z-11));const cr=mesh(new T.ConeGeometry(2.4,1.4,4),roof,x+12,y+2.7,z-11);cr.rotation.y=Math.PI/4;g.add(cr);addBox(x+10.5,z-12.2,x+13.5,z-9.8);
  for(let i=0;i<24;i++){const a=i/24*6.283;g.add(mesh(new T.BoxGeometry(.15,1,.15),MAT.wood,x+Math.cos(a)*19,groundH(x+Math.cos(a)*19,z+Math.sin(a)*15)+.5,z+Math.sin(a)*15))}
  F.plots=F.plots||Array.from({length:12},(_,i)=>({s:0,t:0,crop:i<6?'tarwe':'pompoen'}));FM.plots=[];
  F.plots.forEach((P,i)=>{const px=x-7.5+(i%6)*3,pz=z+(i<6?0:4);const s=mesh(new T.BoxGeometry(2.6,.2,3.4),soil,px,groundH(px,pz)+.1,pz,false);g.add(s);const crop=new T.Group();crop.position.set(px,groundH(px,pz)+.2,pz);g.add(crop);FM.plots.push({P,crop,x:px,z:pz,shown:-1});
    INTER.push({x:px,z:pz,r:1.5,txt:()=>P.s===0?'Zaai '+P.crop+' (2 goud)':P.s===3?'Oogst de '+P.crop:'',fn:()=>plot(P)})});
  INTER.push({x:x+12,z:z-9,r:2.6,txt:()=>PL.t-(F.eggT||-1e9)>180?'Raap eieren in het kippenhok':'',fn:()=>{F.eggT=PL.t;const n=2+Math.floor(Math.random()*3);giveItem('ei',n,true);sfx('pickup');addLog('Je raapt '+n+' eieren.','#9cc552')}});
  const cows=[];for(let i=0;i<2;i++)try{const c=spawnAnimal('cow',x+6+i*4,z-6);c.name='Jouw koe';cows.push(c)}catch(e){}for(let i=0;i<4;i++)try{spawnAnimal('chicken',x+11+rr(3),z-7+rr(2))}catch(e){}
  if(cows[0])INTER.push({x:0,z:0,r:2.6,get x(){return cows[0].x},get z(){return cows[0].z},txt:()=>PL.t-(F.milkT||-1e9)>180?'Melk je koe':'',fn:()=>{F.milkT=PL.t;giveItem('melk',2,true);sfx('pickup');addLog('Je melkt je koe: 2 flessen melk.','#9cc552')}})}
function plot(P){const F=FX().farm;if(P.s===0){if(season().k==='winter'){addLog('In de winter is de grond bevroren. Wacht tot de lente!','#e5766a');return}if(PL.gold<2){addLog('Zaad kost 2 goud.');return}PL.gold-=2;P.s=1;P.t=0;sfx('step');addLog('Je zaait '+P.crop+'.','#9cc552')}
  else if(P.s===3){P.s=0;const id=P.crop==='tarwe'?'grain':'pompoen',n=P.crop==='tarwe'?3:1+Math.floor(Math.random()*2);giveItem(id,n,true);F.harvests=(F.harvests||0)+1;sfx('pickup');giveXp(25);addLog('Je oogst '+n+' '+ITEMS[id].n.toLowerCase()+'.','#9cc552')}}
/* crops grow (about a minute per stage), but not in winter */
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!FM.g)return;const win=season().k==='winter';for(const q of FM.plots){const P=q.P;if(P.s>0&&P.s<3&&!win){P.t+=dt;if(P.t>60){P.t=0;P.s++}}
  if(q.shown!==P.s){q.shown=P.s;while(q.crop.children.length)q.crop.remove(q.crop.children[0]);if(P.s===0)continue;const ripe=P.s===3;
    if(P.crop==='tarwe'){const m=new T.MeshStandardMaterial({color:ripe?0xd8b040:0x6aa83a});for(let k=0;k<9;k++){const s=mesh(new T.CylinderGeometry(.03,.03,.3+P.s*.25,4),m,rr(1),.15+P.s*.12,rr(1.4),false);q.crop.add(s)}}
    else{const m=new T.MeshStandardMaterial({color:ripe?0xe0761a:0x5a9a3a});for(let k=0;k<3;k++)q.crop.add(mesh(new T.SphereGeometry(.12+P.s*.12,10,8),m,rr(.8),.1+P.s*.08,rr(1.1),false))}}}});
/* Boer Hendrik sells you the farm */
const _dmS=dlgMain;dlgMain=function(a,text){_dmS(a,text);try{if(a.name!=='Boer Hendrik')return;const box=document.querySelector('#dlg #dopts');if(!box)return;const b=document.createElement('button');b.className='btn pri';
  if(FX().farm){b.textContent='🌾 Hoe gaat het met mijn boerderij?';b.onclick=()=>{closeModals();card('Boer Hendrik','"Zaai in de lente en de zomer, oogst voor de winter! En vergeet je koeien en kippen niet."',null,7)}}
  else{b.textContent='🌾 Koop De Oude Hoeve (1500 goud)';b.onclick=()=>{if(PL.gold<1500){addLog('De boerderij kost 1500 goud.','#e5766a');return}const p=field(a.x,a.z);if(!p){addLog('Hendrik vindt geen goed stuk land.');return}PL.gold-=1500;closeModals();
    FX().farm={x:p.x,z:p.z,harvests:0};buildFarm();sfx('level');try{PL.nav={x:p.x,z:p.z,name:'Je boerderij'}}catch(e){}card('🌾 Je eigen boerderij!','De Oude Hoeve is van jou: een boerderij met een akker van twaalf stukjes, twee koeien en een kippenhok. Zaai tarwe en pompoenen en oogst ze als ze rijp zijn!',null,11);chron('Kocht een eigen boerderij: De Oude Hoeve.')}}
  box.insertBefore(b,box.firstChild)}catch(e){console.warn('boer dlg',e)}};
/* the harvest festival in Eikendal, in autumn */
ANIMS.push(()=>{if(!started||season().k!=='autumn'||FX().feast||PL.inCave||Math.hypot(PL.x-2,PL.z+4)>60||CIN.on)return;FX().feast=1;const n=(FX().farm&&FX().farm.harvests)||0,g=n*30;PL.gold+=g;
  try{WD.homecoming.bells();WD.homecoming.confetti(8)}catch(e){}const ppl=actors.filter(a=>a.kind==='npc'&&!a.dead&&!a.guard&&a.h&&!a.cheer&&Math.hypot(a.x-PL.x,a.z-PL.z)<60).slice(0,12),a0=Math.random()*6.283;
  ppl.forEach((a,i)=>{a.cheer={t:24,ang:a0+i/Math.max(1,ppl.length)*6.283,r:4+(i%3)*2,delay:.3+i*.2,lines:['Fijn oogstfeest!','Proost op de oogst!','Pompoensoep voor iedereen!','Dansen!'],gift:i<3?{id:pick(['pompoen','bread','cheese']),n:1}:null}});
  card('🎃 Het oogstfeest!','Eikendal viert de oogst met pompoenen, muziek en dans.'+(n?' De boeren kopen je '+n+' oogsten: je krijgt '+g+' goud!':' (Koop een boerderij bij Boer Hendrik, dan verdien je volgend jaar ook mee!)'),null,10);chron('Vierde het oogstfeest in Eikendal.');if(FX().farm)FX().farm.harvests=0});
const _pfS=populateFantasy;populateFantasy=function(){_pfS();try{for(let i=0;i<40;i++){const x=40+rr(30),z=40+rr(30),p={x,z};if(!collide(p,.6)&&!inBuilding(x,z,2)&&terrainH(x,z)>1.5){spawnNPC('farmer',x,z,{name:'Boer Hendrik',ai:'stay',line:'farmer'});break}}}catch(e){console.warn('boer',e)}};
const _sgS=startGame;startGame=function(...a){_sgS(...a);SN.last=-1;SN.cur=null;SN.k=0;setTimeout(()=>{try{buildFarm()}catch(e){console.warn('boerderij',e)}},1500)};
})();
