/* ================= De Index: things, animals, monsters and people, all in one place =================
   Four parts, each with its own pictures:
   - Spullen: every item in the game with its own icon. What you found shows its name, what it does and its value.
   - Dieren and Monsters: every creature, with a real photo of it, taken in the world (the game points a little
     camera at one that lives somewhere and takes its picture). You see what it is, where you first saw it and how
     many you beat.
   - Mensen: everyone you talked to, with a photo of that very person.
   What you have not found yet is a dark shape with "???", so you can see how much is still out there.
   Open it with the "Index" button at the bottom, or from your backpack. (These indexes used to be in the book.) */
(function(){
const FX=()=>{PL.fx=PL.fx||{};return PL.fx},found=()=>{const f=FX();f.found=f.found||{};return f.found};
const esc2=s=>String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const CATS=[['all','Alles','📚',null],['weapon','Wapens','⚔️',['weapon','ammo']],['armor','Harnas & schilden','🛡️',['armor','shield']],['wear','Kleding','👢',['head','boots','cloak']],['jewel','Sieraden','💍',['ring','amulet']],['food','Eten & drankjes','🍖',['food']],['mat','Materialen & schatten','💎',['mat']],['tool','Gereedschap','🧭',['tool','quest']],['seal','Zegels','⚜️',['seal']]];
const GN={weapon:'Wapen',ammo:'Munitie',armor:'Harnas',shield:'Schild',head:'Hoofddeksel',boots:'Laarzen',cloak:'Mantel',ring:'Ring',amulet:'Amulet',food:'Eten of drankje',mat:'Materiaal',tool:'Gereedschap',quest:'Opdracht',seal:'Zegel'};
const RAR={r:['Zeldzaam','#6ab8ff'],e:['Episch','#c78aff'],l:['Legendarisch','#ffb04a']};
const JOBICO={smith:'⚒️',merchant:'🛒',innkeeper:'🍺',guard:'🛡️',farmer:'🌾',priest:'✝️',lord:'⚜️',villager:'🏠',child:'🧒',fisher:'🎣',elf:'🧝',witch:'🧙',hermit:'🧓',traveler:'🎒',tailor:'🧵'};
const jobName=j=>(typeof JOBN!=='undefined'&&JOBN[j])||({child:'kind',fisher:'visser',elf:'elf',witch:'heks'})[j]||'inwoner';
const catOf=it=>{for(const c of CATS)if(c[3]&&c[3].includes(it.g))return c[0];return'mat'};
function markOwned(){const F=found();for(const id in PL.inv)if(ITEMS[id])F[id]=F[id]||1;try{for(const k of SLOTS)if(PL.eq[k]&&ITEMS[PL.eq[k]])F[PL.eq[k]]=F[PL.eq[k]]||1}catch(e){}}
const _gi=giveItem;giveItem=function(id){const r=_gi.apply(this,arguments);try{const F=found();if(ITEMS[id]&&!F[id]){F[id]=1;if(started)addLog('📚 Nieuw in je index: '+ITEMS[id].n,'#cfe0ff')}}catch(e){}return r};
function stats(id){const it=ITEMS[id],L=[];if(it.dmg)L.push('⚔️ Schade '+it.dmg);if(it.def!==undefined)L.push(it.g==='shield'?'🛡️ Blokt '+Math.round(it.def*100)+'%':'🛡️ Bescherming '+it.def);if(it.heal)L.push('❤️ Herstelt '+it.heal+' leven');if(it.stam)L.push('⚡ Uithouding +'+it.stam);
  if(it.fx)try{L.push('✨ '+fxText(it))}catch(e){}if(it.rng)L.push('📏 Bereik '+it.rng);if(it.price)L.push('🪙 Waarde '+it.price+' goud');return L}
/* ---------- photos of living things ---------- */
const PH={url:{},q:[],busy:false,fail:{}};
function liveOf(key){const [k,v]=[key.slice(0,2),key.slice(2)];let best=null,bd=1e18;for(const a of actors){if(a.dead||a.gone||!(a.root||a.g))continue;
  if(k==='t:'?a.type!==v:(a.kind!=='npc'||(a.name+'|'+a.job)!==v))continue;const d=Math.hypot(a.x-PL.x,a.z-PL.z);if(d<bd){bd=d;best=a}}return best}
function photo(key){if(PH.url[key])return PH.url[key];const a=liveOf(key);let url=null;if(a)url=shoot(a);else if(key.startsWith('t:'))url=tempPhoto(key.slice(2));if(url)PH.url[key]=url;return url}
/* a creature that lives nowhere right now: make one far outside the world, take its picture, and take it away again */
function tempPhoto(t){if(PH.tried&&PH.tried[t])return null;(PH.tried=PH.tried||{})[t]=1;const n0=actors.length,X=-150000-Math.random()*1000;let a=null;
  try{if(ANIMALS[t])a=spawnAnimal(t,X,0);else if(['wolf','bandit','archer','skeleton'].includes(t))a=spawnEnemy(t,X,0);else if(MON[t])a=spawnMonster(t,X,0)}catch(e){a=null}
  const added=actors.slice(n0);if(!a||!(a.root||a.g))a=added.find(b=>b.type===t)||added[0];let url=null;try{if(a&&(a.root||a.g)){a.rot=0;(a.root||a.g).position.set(X,0,0);url=shoot(a)}}catch(e){}
  for(const b of added){try{const r=b.root||b.g;if(r&&r.parent)r.parent.remove(r);b.dead=true;b.gone=true;b.respawn=1e12}catch(e){}const i=actors.indexOf(b);if(i>=0)actors.splice(i,1)}
  return url}
function shoot(a){const root=a.root||a.g;if(!root)return null;
  if(!PH.rt){PH.rt=new T.WebGLRenderTarget(160,160);PH.buf=new Uint8Array(160*160*4);PH.cam=new T.PerspectiveCamera(28,1,.1,400);PH.cam.layers.set(7);const h=new T.HemisphereLight(0xffffff,0x5a4a3a,1.15),d=new T.DirectionalLight(0xffffff,1.25);h.layers.set(7);d.layers.set(7);PH.h=h;PH.d=d}
  const saved=[];root.traverse(o=>{saved.push([o,o.layers.mask]);o.layers.set(7)});const rv=root.visible;root.visible=true;let url=null;
  const bg=scene.background,fog=scene.fog,au=renderer.shadowMap.autoUpdate,cc=renderer.getClearColor(new T.Color()),ca=renderer.getClearAlpha(),prt=renderer.getRenderTarget();
  try{root.updateMatrixWorld(true);const bb=new T.Box3();root.traverse(o=>{if(o.isMesh&&o.visible&&o.geometry){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);bb.union(b)}});
    if(!bb.isEmpty()){const c=bb.getCenter(new T.Vector3()),sz=bb.getSize(new T.Vector3()),H=Math.max(sz.y,sz.x*.75,sz.z*.75,.3),r=a.rot||0,fx=Math.sin(r),fz=Math.cos(r),dist=H/2/Math.tan(14*Math.PI/180)*1.2;
      PH.cam.near=dist*.2;PH.cam.far=dist*4;PH.cam.updateProjectionMatrix();PH.cam.position.set(c.x+fx*dist*.92+fz*dist*.38,c.y+H*.1,c.z+fz*dist*.92-fx*dist*.38);PH.cam.lookAt(c);PH.cam.updateMatrixWorld();
      PH.h.position.set(c.x,c.y+10,c.z);PH.d.position.set(PH.cam.position.x,PH.cam.position.y+H*1.5,PH.cam.position.z);PH.d.target.position.copy(c);scene.add(PH.h,PH.d,PH.d.target);
      scene.background=null;scene.fog=null;renderer.shadowMap.autoUpdate=false;renderer.setClearColor(0,0);renderer.setRenderTarget(PH.rt);renderer.clear();renderer.render(scene,PH.cam);renderer.readRenderTargetPixels(PH.rt,0,0,160,160,PH.buf);
      const cv=document.createElement('canvas');cv.width=cv.height=160;const g=cv.getContext('2d'),img=g.createImageData(160,160);for(let j=0;j<160;j++)img.data.set(PH.buf.subarray((159-j)*640,(160-j)*640),j*640);g.putImageData(img,0,0);
      let n=0;for(let i=3;i<PH.buf.length;i+=16)if(PH.buf[i]>20)n++;if(n>30)url=cv.toDataURL('image/png')}}
  catch(e){console.warn('foto',key,e)}
  finally{scene.remove(PH.h,PH.d,PH.d.target);scene.background=bg;scene.fog=fog;renderer.shadowMap.autoUpdate=au;renderer.setClearColor(cc,ca);renderer.setRenderTarget(prt);root.visible=rv;for(const [o,m] of saved)o.layers.mask=m}
  return url}
const coin=(pic,col)=>{try{return WD.iconen.coin(pic,col,null)}catch(e){return null}};
const COINS={};function fallback(key,pic,col){return COINS[key]||(COINS[key]=coin(pic,col))}
function picHtml(key,pic,col){const u=PH.url[key]||fallback(key,pic,col);if(!PH.url[key]&&!PH.q.includes(key))PH.q.push(key);return'<img class="sxpi" data-ph="'+esc2(key)+'" src="'+u+'" alt="">'}
/* take the photos one by one, a frame apart, so the game does not stutter */
function pump(){if(PH.busy)return;PH.busy=true;const step=()=>{if(!S.el||S.el.style.display!=='block'||!PH.q.length){PH.busy=false;return}const key=PH.q.shift();const u=photo(key);if(!u&&liveOf(key)){PH.fail[key]=(PH.fail[key]||0)+1;if(PH.fail[key]<3)PH.q.push(key)}
    if(u)S.el.querySelectorAll('img[data-ph="'+CSS.escape(key)+'"]').forEach(im=>im.src=u);requestAnimationFrame(step)};requestAnimationFrame(step)}
/* ---------- creatures ---------- */
const FN=()=>WD.fun||{},nameOf=t=>{try{return FN().nameOf(t)}catch(e){return(ANIMALS[t]&&ANIMALS[t].name)||(MON[t]&&MON[t].n)||t}};
const ANIM=()=>new Set([...Object.keys(ANIMALS),'wolf','bear','boar','piranha','shark','terrorbird','shadowwolf']);
function creatures(animals){let L=[];try{L=FN().allTypes()}catch(e){L=[...Object.keys(ANIMALS),...Object.keys(MON)]}const A=ANIM();return L.filter(t=>animals?A.has(t):!A.has(t))}
const seen=()=>{const f=FX();return f.seen||{}},slain=()=>{const f=FX();return f.slain||{}};
const ico=t=>(FN().ICO&&FN().ICO[t])||(ANIMALS[t]?'🐾':'👹');
/* ---------- where to find things you do not have yet ---------- */
const HINT={sword_rust:'⚔️ Je krijgt het als je een nieuwe held begint.',parcel:'📦 Krijg je bij een bezorgopdracht van een dorpeling.',branch:'🪓 Hak bomen om met een bijl.',stone:'⛏️ Hak het uit rotsen met een houweel.',ore:'⛏️ Hak het uit rotsen met een houweel (een ijzeren houweel vindt meer).',
  mushroom:'🍄 Groeit in grotten en in het Paddenstoelenbos. Raap op met F.',salmon:'🎣 Vang je met een hengel in rivieren en meren.',trout:'🎣 Vang je met een hengel in rivieren en meren.',catfish:'🎣 Vang je met een hengel in rustig water.',glowfish:'🎣 Vang je in het gloeiende grotmeer onder de grond.',
  dragon_heart:'🐉 Versla Vyrnax, de draak van het Drakennest.',amu_glacius:'❄️ Versla de ijsdraak in Noordheim.',amu_fireheart:'🔥 Te vinden in Gloedhaven in het Demonenrijk, of bij een vuurtitaan.',amu_powerswap:'📜 Volg de oude legende: vraag dorpelingen naar geruchten.',
  kampioensbeker:'🏟️ Win het Grote Toernooi in de Arena van Aurelia.',drakenei:'🥚 Ligt in het Drakennest. Pas op voor de Draakmoeder!',weerwolfvacht:'🌕 Versla een weerwolf bij volle maan.',gouden_blad:'🌳 Klim in de Wereldboom op het eiland in het zuiden en zoek het nest.',
  bloemen:'💐 Blije mensen geven het je als je thuiskomt van een avontuur.',feesttaart:'🎂 Blije mensen geven het je als je thuiskomt van een avontuur.',erepenning:'🏅 Kom vaak thuis in je rijk na een avontuur: het volk eert je.',
  zonneharp:'⛈️ Versla Stormreus Thoron in het Wolkenrijk (klim via de Wereldboom).',hemelzwaard:'☁️ In de schatkamer van het Wolkenrijk.',wolkenveer:'☁️ Breng de Zonneharp terug naar het Wolkenrijk.',
  reuzendrank:'⚗️ Brouw het bij de alchemist, of koop het bij Kluizenares Ingrid (Valkenland).',krimpdrank:'⚗️ Brouw het bij de alchemist.',veerdrank:'⚗️ Brouw het bij de alchemist, of koop het bij Kluizenares Ingrid.',schimdrank:'⚗️ Brouw het bij de alchemist.',drakendrank:'⚗️ Brouw het bij de alchemist.',kikkerdrank:'⚗️ Brouw het bij de alchemist, of koop het bij Kluizenares Ingrid.',
  zielesteen:'👻 Ligt in de spookruïne van Dornwacht.',spookzwaard:'👻 Verlos de Spookridder in de ruïne van Dornwacht.',zegelring:'🗝️ De schat van de Vergeten Koning, diep in de kerker onder Dornwacht.',piratenkompas:'🏴 In de kist van Kapitein Haaientand op het piratenschip De Zwarte Haai.',
  dwergenbijl:'⚒️ Te koop bij Meestersmid Brokk in Diepsteen, de dwergenstad.',mithril:'⚒️ Te koop bij Meestersmid Brokk in Diepsteen, de dwergenstad.',pompoen:'🌾 Oogst het op de boerderij van Boer Hendrik.',ei:'🐔 Raap eieren bij de kippen op de boerderij.',melk:'🐄 Melk de koe op de boerderij van Boer Hendrik.',
  club_snotgrom:'👺 Valt van Megagoblin Snotgrom in de goblintunnels.',axe_grukk:'🪓 Valt van Orkenkrijgsheer Grukk in de Oude Orkenburcht in Noordheim.',
  gifmasker:'😷 Te koop bij Alchemist Vira in de Gifvallei (een tunnel aan de rand van het Trollenmoeras).',tegengif:'🧪 Te koop bij Alchemist Vira in de Gifvallei (een tunnel aan de rand van het Trollenmoeras).',gifkristal:'💚 Te vinden in de Gifvallei, of bij zuurorks en gifspinnen.',zuurzwaard:'💚 Valt van Gifdraak Virulax in de krater van de Gifvallei.',gifschild:'💚 Valt van Gifdraak Virulax in de krater van de Gifvallei.',amu_virulax:'💚 Valt van Gifdraak Virulax in de krater van de Gifvallei.',gifpantser:'💚 In de kist bij de oude gifbrouwerij in de Gifvallei.',
  moederhart:'🐉 Valt van de Draakmoeder als je haar verslaat wanneer ze landt.',
  oer_klauw:'🦖 Valt van de Oerkoning, de reuzendino bij de Vuurberg in de Oertijd.',oer_schild:'🦖 Valt van de Oerkoning, de reuzendino bij de Vuurberg in de Oertijd.',oer_pantser:'🦖 Valt van de Oerkoning, de reuzendino bij de Vuurberg in de Oertijd.',oer_kroon:'🦖 Valt van de Oerkoning, de reuzendino bij de Vuurberg in de Oertijd.',oer_hart:'🦖 Valt van de Oerkoning, de reuzendino bij de Vuurberg in de Oertijd.',
  sterrenmaterie:'🌠 Te koop bij elke smid, voor 100.000 goud.',sterrenzwaard:'🌠 Laat het smeden bij een smid met 1 Sterrenmaterie.',sterrenschild:'🌠 Laat het smeden bij een smid met 1 Sterrenmaterie.',sterrenharnas:'🌠 Laat het smeden bij een smid met 1 Sterrenmaterie.',
  seal_sea:'🐙 Versla de Kraak in de diepe zee.',seal_wolf:'🐺 Versla Wolvenkoning Fenrik in Noordheim.',seal_dead:'💀 Versla de Rijpkoning in Noordheim.',amu_kraken:'🐙 Versla de Kraak, heerser van de diepte.',star_shard:'🌠 Vang een vallende ster, \'s nachts.',
  cloak_yeti:'🦍 Versla de Yeti diep onder Noordheim.',club_yeti:'🦍 Versla de Yeti diep onder Noordheim.',amu_yeti:'🦍 Versla de Yeti diep onder Noordheim.',yeti_fang:'🦍 Versla de Yeti diep onder Noordheim.',sword_flame:'🔥 Versla een vuurbaas in het Demonenrijk.'};
const CHINT={gifspin:'In de Gifvallei, door de tunnel aan de rand van het Trollenmoeras.',gifork:'In de Gifvallei, door de tunnel aan de rand van het Trollenmoeras.',yeti:'Diep in de ijsgrotten onder Noordheim.',frostgiant:'In de Oude Orkenburcht in Noordheim.',wolfking:'In de wouden van Noordheim.',stormrunner:'Op de besneeuwde vlaktes van Noordheim.',dragon:'In het Drakennest, hoog in de bergen.',kraken:'In de diepe zee, ver van de kust.',serpent:'In de zee.',shark:'In meren en in de zee.',piranha:'In het water.',
  fourhands:'In het Demonenrijk.',demon:'In het Demonenrijk.',imp:'In het Demonenrijk.',lavaturtle:'Bij de lava in het Demonenrijk.',lavagolem:'Bij de lava in het Demonenrijk.',spider:'In donkere grotten.',goblin:'In de goblintunnels onder het land.',goblinking:'Diep in de goblintunnels.',terrorbird:'In de Oertijd.',dragonkin:'Bij het Drakennest.',
  wraith:'In de spookruïne van Dornwacht.',skeleton:'Bij ruïnes en in grotten.',troll:'In het Trollenmoeras.',treant:'In het Woud der Levende Bomen.',golem:'Bij de Levende Stenen en in mijnen.',wolf:'In de bossen, vooral in het Wolvenwoud.',bear:'In de bossen.',boar:'In de bossen.'};
function where(x,z,prep){try{const s=siteAt(x,z);if(s)return prep+s.name;if(x<-30000)return' in Noordheim';if(x<-9000)return' in het Demonenrijk';if(x<-2000)return' in een grot onder de grond';const r=WD.region&&WD.region(x);if(r)return' '+(r.in||'in '+r.name);
  let b=null,bd=600;for(const S2 of SITES){if(!S2.name||S2.id==='bridge')continue;const d=Math.hypot(S2.x-x,S2.z-z);if(d<bd){bd=d;b=S2}}return b?' in de buurt van '+b.name:''}catch(e){return''}}
let SRC=null,SRCt=-1e9;
function sources(){if(SRC&&performance.now()-SRCt<30000)return SRC;const src={},add=(id,t)=>{if(!ITEMS[id])return;const L=src[id]=src[id]||[];if(!L.includes(t)&&L.length<4)L.push(t)};
  for(const a of actors){if(!a.shop||a.dead||a.kind!=='npc')continue;for(const it of a.shop){const id=typeof it==='string'?it:(it&&(it.id||it[0]));add(id,'🛒 Te koop bij '+a.name+where(a.x,a.z,' in '))}}
  try{for(const c of chests){const L=CHEST_LOOT[c.loot];if(L&&L.items)for(const [id] of L.items)add(id,'🧰 In de '+String(c.name||'kist').toLowerCase()+where(c.x,c.z,' bij '))}}catch(e){}
  try{const who={smith:'een smid',healer:'een priester of kluizenaar',cook:'een herbergier'};for(const [k,list] of Object.entries(RECIPES))for(const r of list)add(r.out,'🔨 Laat het maken bij '+(who[k]||'een vakman')+(r.cost?' ('+r.cost+')':''))}catch(e){}
  for(const [t,A] of Object.entries(ANIMALS))if(A.loot)for(const id of Object.keys(A.loot))add(id,'🏹 Van een '+String(A.name).toLowerCase()+' (jagen)');
  try{for(const [k,fn] of Object.entries(LOOTX)){if(typeof fn!=='function')continue;const ids=new Set((fn.toString().match(/'([a-z_]+)'/g)||[]).map(s=>s.slice(1,-1)).filter(i=>ITEMS[i]));if(!ids.size)continue;
    let t=Object.keys(MON).find(m=>MON[m].loot===k)||(MON[k]?k:null);const nm=t?nameOf(t):k,boss=t&&MON[t].boss;for(const id of ids)add(id,'⚔️ '+(boss?'Eindbaas ':'')+nm+' laat het soms vallen')}}catch(e){}
  try{for(const R of WD.kingdom.realms){if(R.crown)add(R.crown,'👑 Word heerser van '+R.name+'.');if(R.old)add(R.old,'📜 Een oude schat van '+R.name+'. De heerser vraagt je soms om hem te zoeken.')}}catch(e){}
  SRC=src;SRCt=performance.now();return src}
function itemHints(id){const L=[];if(HINT[id])L.push(HINT[id]);for(const t of(sources()[id]||[]))if(L.length<4)L.push(t);if(!L.length){const g=ITEMS[id].g;L.push(g==='food'?'🍺 Te koop bij herbergiers en op markten.':g==='mat'?'⚔️ Monsters en kisten laten dit soms vallen.':'🗺️ Ergens in de wereld verstopt. Versla eindbazen en open kisten!')}return L}
function creatureHint(t){const a=liveOf('t:'+t);if(a)return'📍 Leeft'+(where(a.x,a.z,' bij ')||' ergens in de wildernis')+'.';return'📍 '+(CHINT[t]||'Ergens in de wijde wereld. Ga op ontdekking!')}
/* ---------- collections: gold for finding everything of a kind ----------
   Every kind of thing (weapons, clothes, jewellery...) is split by how rare it is: ordinary, rare, epic and
   legendary. Find all of one set and you get gold, more for rarer sets. There are also sets for all animals, all
   monsters, all bosses beaten, and one big prize for finding every item in the game. */
const TIER=[['','Gewone',400],['r','Zeldzame',1500],['e','Epische',4000],['l','Legendarische',12000]];
const CATN={weapon:'wapens',armor:'harnassen en schilden',wear:'kleding',jewel:'sieraden',food:'eten en drankjes',mat:'materialen en schatten',tool:'gereedschappen',seal:'zegels'};
let SETS=null;
function sets(){if(SETS)return SETS;const L=[],all=Object.keys(ITEMS).filter(id=>ITEMS[id]&&ITEMS[id].n&&ITEMS[id].g!=='quest');
  for(const [c,,ic] of CATS){if(c==='all')continue;const ids=all.filter(id=>catOf(ITEMS[id])===c);for(const [r,adj,base] of TIER){const g=ids.filter(id=>(ITEMS[id].rar||'')===r);if(g.length<2)continue;L.push({id:'i_'+c+'_'+(r||'g'),n:adj+' '+CATN[c],ico:ic,kind:'item',ids:g,tier:r,reward:Math.round((base+g.length*150)/50)*50})}}
  const an=creatures(true),mo=creatures(false),bo=mo.filter(t=>MON[t]&&MON[t].boss);
  L.push({id:'c_animals',n:'Alle dieren gezien',ico:'🐾',kind:'seen',ids:an,reward:5000},{id:'c_monsters',n:'Alle monsters gezien',ico:'👹',kind:'seen',ids:mo,reward:15000},{id:'c_bosses',n:'Alle eindbazen verslagen',ico:'💀',kind:'slain',ids:bo,tier:'l',reward:40000},
    {id:'i_all',n:'Alle voorwerpen van de wereld',ico:'🌍',kind:'item',ids:all,tier:'l',reward:100000},{id:'p_all',n:'Alle plaatsen ontdekt',ico:'🗺️',kind:'place',ids:places().map(p=>p.id),tier:'e',reward:25000});
  return SETS=L}
function have(S2,id){if(S2.kind==='place')return disc(id);if(S2.kind==='item')return!!found()[id];if(S2.kind==='seen')return!!seen()[id];const k=slain()[id]||(PL.kills&&PL.kills[id])||0;return k>0}
const claimed=()=>{const f=FX();f.coll=f.coll||{};return f.coll};
function checkSets(){if(!started)return;markOwned();const C=claimed();for(const S2 of sets()){if(C[S2.id])continue;if(!S2.ids.length||!S2.ids.every(id=>have(S2,id)))continue;C[S2.id]=(FX().day||0)+1;PL.gold+=S2.reward;
  try{sfx('level')}catch(e){}addLog('🏆 Verzameling compleet: '+S2.n+'! +'+S2.reward+' goud','#ffd27a');try{WD.kingdom.card('🏆 Verzameling compleet!',S2.n+': je hebt ze allemaal ('+S2.ids.length+')! Je krijgt '+S2.reward.toLocaleString('nl')+' goud.',null,9)}catch(e){}try{WD.chron.add('Verzameling compleet: '+S2.n+'.')}catch(e){}}}
setInterval(()=>{try{checkSets()}catch(e){}},6000);
function setInfo(id){const S2=sets().find(s=>s.id===id);if(!S2)return'<div class="sxe">Kies een verzameling om te zien wat je nog mist.</div>';const miss=S2.ids.filter(i=>!have(S2,i)),done=claimed()[S2.id];
  let h='<div class="sxbig" style="font-size:64px">'+S2.ico+'</div><h3>'+esc2(S2.n)+'</h3><div class="sxt">'+(S2.ids.length-miss.length)+' van '+S2.ids.length+' · beloning <b style="color:#ffd27a">'+S2.reward.toLocaleString('nl')+' goud</b></div>';
  if(done)return h+'<div class="sxh">✅ Compleet! Je kreeg de beloning al.</div>';if(!miss.length)return h+'<div class="sxh">✅ Compleet! De beloning komt zo.</div>';
  h+='<div class="sxw"><b>Je mist nog:</b>';for(const i of miss.slice(0,12)){if(S2.kind==='item')h+='<div>❓ '+esc2(itemHints(i)[0])+'</div>';else h+='<div>❓ '+esc2(creatureHint(i).replace(/^📍 /,''))+'</div>'}if(miss.length>12)h+='<div>... en nog '+(miss.length-12)+' meer.</div>';return h+'</div>'}
/* ---------- places: every place in the world, with a piece of the map as its picture ---------- */
const DIRN=['oosten','zuidoosten','zuiden','zuidwesten','westen','noordwesten','noorden','noordoosten'];
const dirOf=(dx,dz)=>DIRN[((Math.round(Math.atan2(dz,dx)/(Math.PI/4))%8)+8)%8];
const places=()=>SITES.filter(s=>s&&s.name&&s.id!=='bridge'&&Math.abs(s.x)<HALF+50&&Math.abs(s.z)<HALF+50);
const disc=id=>!!(PL.discovered&&PL.discovered[id]);
const PIC={};
function placePic(s){if(PIC[s.id])return PIC[s.id];const ico=(typeof MAPICON!=='undefined'&&MAPICON[s.id])||'📍';let u=null;
  try{if(typeof mapBase!=='undefined'&&mapBase){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),R=Math.max(140,s.r*3.2)*MS;g.save();g.beginPath();g.arc(64,64,60,0,7);g.clip();g.imageSmoothingEnabled=true;
    g.drawImage(mapBase,mpx(s.x)-R,mpx(s.z)-R,R*2,R*2,0,0,128,128);g.restore();g.lineWidth=5;g.strokeStyle='#b98a2e';g.beginPath();g.arc(64,64,60,0,7);g.stroke();
    g.fillStyle='rgba(20,14,6,.82)';g.beginPath();g.arc(64,64,22,0,7);g.fill();g.lineWidth=2.5;g.strokeStyle='#ffd27a';g.stroke();g.font='26px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ico,64,66);u=c.toDataURL('image/png')}}catch(e){}
  if(!u)u=coin(ico,0x4a6a3a);if(u)PIC[s.id]=u;return u}
function placeInfo(id){const s=places().find(p=>p.id===id);if(!s)return'<div class="sxe">Kies een plaats.</div>';const d=Math.round(Math.hypot(s.x-PL.x,s.z-PL.z)),dir=dirOf(s.x-PL.x,s.z-PL.z),ok=disc(s.id);
  if(!ok)return'<div class="sxbig off"><img src="'+placePic(s)+'" alt=""></div><h3>???</h3><p>Deze plaats heb je nog niet ontdekt.</p><div class="sxw"><b>Waar ligt het?</b><div>📍 Ongeveer '+d+' passen naar het '+dir+' van jou. Ga op ontdekking!</div></div>';
  return'<div class="sxbig"><img src="'+placePic(s)+'" alt=""></div><h3>'+esc2(s.name)+'</h3><div class="sxt">✅ Ontdekt</div><div class="sxh">📍 '+d+' passen naar het '+dir+' van jou</div><div style="margin-top:10px"><button class="btn pri" id="sxnav" data-id="'+s.id+'">🧭 Wijs me de weg</button></div>'}
function placesGrid(q){return places().filter(s=>!q||(disc(s.id)&&s.name.toLowerCase().includes(q))).sort((a,b)=>(disc(b.id)?1:0)-(disc(a.id)?1:0)||Math.hypot(a.x-PL.x,a.z-PL.z)-Math.hypot(b.x-PL.x,b.z-PL.z)).map(s=>card(s.id,disc(s.id),'<img src="'+placePic(s)+'" alt="">',s.name)).join('')}
/* ---------- the panel ---------- */
const S={el:null,sec:'items',cat:'all',q:'',sel:{}};
const SECS=[['items','Spullen','🎒'],['animals','Dieren','🐾'],['monsters','Monsters','👹'],['people','Mensen','🧑'],['places','Plaatsen','🗺️'],['sets','Verzamelingen','🏆']];
function setsGrid(q){const C=claimed();return sets().filter(S2=>!q||S2.n.toLowerCase().includes(q)).map(S2=>{const n=S2.ids.filter(i=>have(S2,i)).length,t=S2.ids.length,done=C[S2.id],col=S2.tier==='l'?'#ffb04a':S2.tier==='e'?'#c78aff':S2.tier==='r'?'#6ab8ff':'#e0c890';return'<button class="sxc sxrow'+(done?' done':'')+(S.sel.sets===S2.id?' sel':'')+'" data-id="'+S2.id+'"><span class="sxri">'+S2.ico+'</span><span class="sxrn"><b style="color:'+col+'">'+esc2(S2.n)+'</b><span class="sxrb"><i style="width:'+(n/t*100)+'%;background:'+col+'"></i></span><small>'+n+' / '+t+'</small></span><span class="sxrr">'+(done?'✅':'💰 '+S2.reward.toLocaleString('nl'))+'</span></button>'}).join('')}
function itemList(){const F=found(),q=S.q.toLowerCase();return Object.keys(ITEMS).filter(id=>{const it=ITEMS[id];if(!it||!it.n)return false;if(S.cat!=='all'&&catOf(it)!==S.cat)return false;if(q&&!(F[id]&&it.n.toLowerCase().includes(q)))return false;return true})
  .sort((a,b)=>{const A=ITEMS[a],B=ITEMS[b];return CATS.findIndex(c=>c[0]===catOf(A))-CATS.findIndex(c=>c[0]===catOf(B))||(A.price||0)-(B.price||0)||A.n.localeCompare(B.n)})}
function shapeHtml(id){const h=itemIconHtml(id);let u=null;try{u=WD.iconen.bare(id)}catch(e){}return u?'<img class="ii" alt="" src="'+u+'">':h}
function itemInfo(id){const F=found(),it=ITEMS[id];if(!it)return'<div class="sxe">Kies iets om te zien wat het is.</div>';const has=F[id],n=PL.inv[id]||0,worn=(()=>{try{return SLOTS.some(k=>PL.eq[k]===id)}catch(e){return false}})(),r=RAR[it.rar];
  if(!has)return'<div class="sxbig off">'+shapeHtml(id)+'</div><h3>???</h3><div class="sxt">'+esc2(GN[it.g]||'Voorwerp')+(r?' · <b style="color:'+r[1]+'">'+r[0]+'</b>':'')+'</div><p>Dit heb je nog niet gevonden.</p><div class="sxw"><b>📍 Waar vind je dit?</b>'+itemHints(id).map(t=>'<div>'+esc2(t)+'</div>').join('')+'</div>';
  return'<div class="sxbig">'+itemIconHtml(id)+'</div><h3>'+esc2(it.n)+'</h3><div class="sxt">'+esc2(GN[it.g]||'Voorwerp')+(r?' · <b style="color:'+r[1]+'">'+r[0]+'</b>':' · Gewoon')+'</div><div class="sxs">'+stats(id).map(esc2).join('<br>')+'</div><div class="sxh">'+(worn?'✅ Je draagt dit nu.':n?'🎒 In je rugzak: '+n:'Je had dit ooit, maar nu niet meer.')+'</div>'}
function creatureInfo(t){if(!t)return'<div class="sxe">Kies een dier of monster.</div>';const s=seen()[t],n=slain()[t]||(PL.kills&&PL.kills[t])||0,boss=MON[t]&&MON[t].boss,key='t:'+t;
  if(!s)return'<div class="sxbig off">'+picHtml(key,ico(t),0x4a3a2a)+'</div><h3>???</h3><p>Dit heb je nog niet gezien.</p><div class="sxw"><b>Waar vind je dit?</b><div>'+esc2(creatureHint(t))+'</div></div>';
  const lore=(FN().LORE&&FN().LORE[t])||(ANIMALS[t]?'Een dier van de wilde streken.':'Een gevaarlijk wezen. Wees op je hoede.');
  return'<div class="sxbig">'+picHtml(key,ico(t),ANIMALS[t]?0x4f7a3a:0x7a2a2a)+'</div><h3>'+esc2(nameOf(t))+'</h3><div class="sxt">'+(ANIMALS[t]?'Dier':boss?'<b style="color:#ff6a5a">Eindbaas</b>':'Monster')+'</div><p>'+esc2(lore)+'</p><div class="sxh">👁️ Eerst gezien op dag '+s.d+' in '+esc2(s.w)+(n?'<br>⚔️ Verslagen: '+n:'')+'</div>'}
function personInfo(k){const M=FX().met||{},m=M[k];if(!m)return'<div class="sxe">Kies iemand.</div>';const key='p:'+m.n+'|'+m.job;
  return'<div class="sxbig">'+picHtml(key,JOBICO[m.job]||'🧑',0x3a5a7a)+'</div><h3>'+esc2(m.n)+'</h3><div class="sxt">'+esc2(jobName(m.job))+'</div><div class="sxh">🤝 Ontmoet op dag '+m.d+' in '+esc2(m.w)+'</div>'}
function card(id,has,html,name,extra){return'<button class="sxc'+(has?'':' off')+(S.sel[S.sec]===id?' sel':'')+'" data-id="'+esc2(id)+'" title="'+(has?esc2(name):'???')+'"><span class="sxic">'+html+'</span><span class="sxnm">'+(has?esc2(name):'???')+'</span>'+(extra||'')+'</button>'}
function render(){markOwned();try{checkSets()}catch(e){}const el=S.el,F=found(),all=Object.keys(ITEMS).filter(id=>ITEMS[id]&&ITEMS[id].n),fn=all.filter(id=>F[id]).length,sn=seen(),an=creatures(true),mo=creatures(false),met=FX().met||{};
  const cnt={items:[fn,all.length],animals:[an.filter(t=>sn[t]).length,an.length],monsters:[mo.filter(t=>sn[t]).length,mo.length],people:[Object.keys(met).length,null],sets:[sets().filter(S2=>claimed()[S2.id]).length,sets().length],places:[places().filter(p=>disc(p.id)).length,places().length]};
  const secs=SECS.map(([k,nm,ic])=>'<button class="sxsec'+(S.sec===k?' on':'')+'" data-s="'+k+'">'+ic+' '+nm+' <small>'+cnt[k][0]+(cnt[k][1]!=null?'/'+cnt[k][1]:'')+'</small></button>').join('');
  let sub='',grid='',info='',bar=cnt[S.sec][1]?cnt[S.sec][0]/cnt[S.sec][1]:0;const q=S.q.toLowerCase();
  if(S.sec==='items'){sub='<div class="sxtabs">'+CATS.map(([k,nm,ic])=>{const ids=k==='all'?all:all.filter(id=>catOf(ITEMS[id])===k),f=ids.filter(id=>F[id]).length;return'<button class="sxtab'+(S.cat===k?' on':'')+'" data-c="'+k+'"><span>'+ic+'</span> '+nm+' <small>'+f+'/'+ids.length+'</small></button>'}).join('')+'</div>';
    grid=itemList().map(id=>card(id,F[id],F[id]?itemIconHtml(id):shapeHtml(id),ITEMS[id].n,(PL.inv[id]||0)>1?'<em>×'+PL.inv[id]+'</em>':'')).join('');info=itemInfo(S.sel.items)}
  else if(S.sec==='animals'||S.sec==='monsters'){const L=(S.sec==='animals'?an:mo).filter(t=>!q||(sn[t]&&nameOf(t).toLowerCase().includes(q))).sort((a,b)=>(sn[b]?1:0)-(sn[a]?1:0)||nameOf(a).localeCompare(nameOf(b)));
    grid=L.map(t=>card(t,sn[t],picHtml('t:'+t,ico(t),ANIMALS[t]?0x4f7a3a:0x7a2a2a),nameOf(t),(slain()[t]?'<em>⚔'+slain()[t]+'</em>':'')+(MON[t]&&MON[t].boss?'<em class="b">baas</em>':''))).join('');info=creatureInfo(S.sel[S.sec])}
  else if(S.sec==='sets'){grid=setsGrid(q);info=setInfo(S.sel.sets)}
  else if(S.sec==='places'){grid=placesGrid(q);info=placeInfo(S.sel.places)}
  else{const L=Object.entries(met).filter(([k,m])=>!q||m.n.toLowerCase().includes(q)).sort((a,b)=>a[1].d-b[1].d);grid=L.map(([k,m])=>card(k,true,picHtml('p:'+m.n+'|'+m.job,JOBICO[m.job]||'🧑',0x3a5a7a),m.n)).join('');info=personInfo(S.sel.people);
    if(!L.length)grid='<div class="sxe">Je hebt nog met niemand gepraat. Druk F bij iemand.</div>'}
  el.innerHTML='<div class="sxhd"><div><b>📚 Index</b></div><div class="sxr"><input id="sxq" placeholder="Zoek..." value="'+esc2(S.q)+'"><button class="btn" id="sxx">Sluiten</button></div></div><div class="sxsecs">'+secs+'</div><div class="sxbar"><i style="width:'+(bar*100)+'%"></i></div>'+sub+'<div class="sxbody"><div class="sxgrid">'+(grid||'<div class="sxe">Niets gevonden.</div>')+'</div><div class="sxinfo">'+info+'</div></div>';
  el.querySelector('#sxx').onclick=close;el.querySelectorAll('.sxsec').forEach(b=>b.onclick=()=>{S.sec=b.dataset.s;render()});el.querySelectorAll('.sxtab').forEach(b=>b.onclick=()=>{S.cat=b.dataset.c;render()});
  el.querySelectorAll('.sxc').forEach(b=>b.onclick=()=>{S.sel[S.sec]=b.dataset.id;el.querySelectorAll('.sxc.sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');const id=b.dataset.id;el.querySelector('.sxinfo').innerHTML=S.sec==='items'?itemInfo(id):S.sec==='people'?personInfo(id):S.sec==='sets'?setInfo(id):S.sec==='places'?placeInfo(id):creatureInfo(id);navBtn();pump()});
  const qi=el.querySelector('#sxq');for(const ev of['keydown','keyup','keypress'])qi.addEventListener(ev,e=>{e.stopPropagation();if(ev==='keydown'&&e.key==='Escape')close()});qi.oninput=()=>{S.q=qi.value;const pos=qi.selectionStart;render();const q2=S.el.querySelector('#sxq');q2.focus();try{q2.setSelectionRange(pos,pos)}catch(e){}};
  navBtn();pump()}
function navBtn(){const b=S.el&&S.el.querySelector('#sxnav');if(!b)return;b.onclick=()=>{const p=places().find(x=>x.id===b.dataset.id);if(!p)return;PL.nav={x:p.x,z:p.z,name:p.name};addLog('🧭 Volg de pijl op je kaartje naar '+p.name+'.','#7fd0ff');close()}}
function open(sec){if(!S.el){const d=document.createElement('div');d.className='panel';d.id='spullen';document.body.appendChild(d);S.el=d}if(sec)S.sec=sec;S.el.style.display='block';render();try{document.exitPointerLock()}catch(e){}}
function close(){if(S.el)S.el.style.display='none'}
function toggle(){if(S.el&&S.el.style.display==='block')close();else open()}
addEventListener('keydown',e=>{if(e.code==='Escape'&&S.el&&S.el.style.display==='block')close()});
{const st=document.createElement('style');st.textContent=`#spullen{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(980px,96vw);height:min(720px,92vh);z-index:30;padding:12px 14px;display:none;flex-direction:column}
#spullen[style*="block"]{display:flex!important}
#spullen .sxhd{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}#spullen .sxhd b{font-family:var(--f-display);font-size:24px;color:#ffd27a}
#spullen .sxr{display:flex;gap:6px}#spullen #sxq{padding:6px 10px;border-radius:4px;border:1px solid #5a4b30;background:rgba(20,16,10,.85);color:var(--parch);font:inherit;width:150px}#spullen .sxr .btn{margin:0}
#spullen .sxsecs{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}#spullen .sxsec{flex:1;min-width:110px;background:rgba(40,32,20,.85);border:1px solid #5a4b30;color:var(--parch);border-radius:6px;padding:7px 10px;font:inherit;font-size:16px;cursor:pointer}#spullen .sxsec small{color:var(--mute);font-size:12px}#spullen .sxsec.on{border-color:#ffd27a;background:rgba(224,176,74,.22);color:#fff}
#spullen .sxbar{height:6px;border-radius:3px;background:rgba(255,255,255,.08);margin:8px 0 6px;overflow:hidden;flex:none}#spullen .sxbar i{display:block;height:100%;background:linear-gradient(90deg,#b98a2e,#ffd27a)}
#spullen .sxtabs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;flex:none}#spullen .sxtab{background:rgba(40,32,20,.85);border:1px solid #5a4b30;color:var(--parch);border-radius:14px;padding:3px 9px;font:inherit;font-size:12.5px;cursor:pointer}#spullen .sxtab small{color:var(--mute)}#spullen .sxtab.on{border-color:#e0b04a;background:rgba(224,176,74,.2);color:#fff}
#spullen .sxbody{display:flex;gap:10px;flex:1;min-height:0}#spullen .sxgrid{flex:1;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px;align-content:start;padding-right:4px}
#spullen .sxc{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;background:rgba(30,24,16,.85);border:1px solid #4a3d28;border-radius:6px;color:var(--parch);font:inherit;cursor:pointer}#spullen .sxc:hover{border-color:#b98a2e}#spullen .sxc.sel{border-color:#ffd27a;background:rgba(224,176,74,.18)}
#spullen .sxc .sxic{width:58px;height:58px;display:flex;align-items:center;justify-content:center;font-size:34px}#spullen .sxic img,#spullen .sxbig img{width:100%!important;height:100%!important;object-fit:contain;margin:0;vertical-align:middle}
#spullen .sxc .sxnm{font-size:11.5px;line-height:1.15;text-align:center;max-height:2.4em;overflow:hidden}#spullen .sxc em{position:absolute;top:3px;right:5px;font-style:normal;font-size:11px;color:#ffd27a}#spullen .sxc em.b{top:auto;bottom:22px;right:4px;color:#ff6a5a}
#spullen .sxc.off .sxic,#spullen .sxbig.off{filter:brightness(0) opacity(.35)}#spullen .sxc.off .sxnm{color:var(--mute)}
#spullen .sxinfo{width:270px;flex:none;overflow:auto;background:rgba(20,16,10,.6);border:1px solid #4a3d28;border-radius:6px;padding:12px;text-align:center}#spullen .sxbig{width:150px;height:150px;margin:0 auto;font-size:80px;display:flex;align-items:center;justify-content:center}
#spullen .sxinfo h3{font-family:var(--f-display);color:#ffd27a;margin:6px 0 2px;font-size:20px}#spullen .sxt{color:var(--mute);font-size:13px;margin-bottom:8px}#spullen .sxs{text-align:left;font-size:14px;line-height:1.6}#spullen .sxh{margin-top:10px;font-size:13.5px;color:#cfe0ff;line-height:1.5}#spullen .sxinfo p{font-size:13.5px;text-align:left}#spullen .sxe{color:var(--mute);padding:20px;text-align:center}#spullen .sxrow{grid-column:1/-1;flex-direction:row;align-items:center;gap:10px;padding:7px 10px;text-align:left}#spullen .sxrow .sxri{font-size:28px;width:36px;text-align:center}#spullen .sxrow .sxrn{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}#spullen .sxrow .sxrn small{color:var(--mute);font-size:11.5px}#spullen .sxrb{height:6px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden}#spullen .sxrb i{display:block;height:100%}#spullen .sxrow .sxrr{font-size:13.5px;color:#ffd27a;white-space:nowrap}#spullen .sxrow.done{background:rgba(80,140,60,.18);border-color:#5a8a3a}#spullen .sxw{text-align:left;background:rgba(224,176,74,.1);border:1px solid rgba(224,176,74,.35);border-radius:6px;padding:8px 10px;font-size:13.5px;line-height:1.45;color:#ffe9a8}#spullen .sxw b{display:block;color:#ffd27a;margin-bottom:3px}#spullen .sxw div{margin:3px 0}
@media(max-width:700px){#spullen .sxbody{flex-direction:column}#spullen .sxinfo{width:auto;max-height:38%}#spullen .sxsec{min-width:70px;font-size:14px}}`;document.head.appendChild(st)}
/* the button at the bottom, and one in the backpack */
function btn(){const q=$('qbar');if(!q||$('qb_spullen'))return;const b=document.createElement('button');b.id='qb_spullen';b.textContent='Index';b.onclick=toggle;q.appendChild(b)}
addEventListener('load',btn);setTimeout(btn,3000);
const _ri=renderInv;renderInv=function(){_ri.apply(this,arguments);try{const el=$('inv'),h=el&&el.querySelector('h2');if(h&&!el.querySelector('#inv_sx')){const b=document.createElement('button');b.className='btn';b.id='inv_sx';b.textContent='📚 Index';b.style.marginLeft='10px';b.onclick=()=>{closeModals1();open('items')}; h.insertAdjacentElement('afterend',b)}}catch(e){}};
WD.spullen={open,close,toggle,found,photo};
})();
