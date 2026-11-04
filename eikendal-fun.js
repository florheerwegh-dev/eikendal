/* ================= More to do: achievements, daily challenges, falling stars, treasure maps, and the journal as a real book =================
   - Prestaties: almost thirty goals (from your first victory to ruling three realms), each with a toast and a reward.
   - Uitdagingen van vandaag: every game day three new small tasks with a gold reward.
   - Vallende sterren: at night a star sometimes falls nearby; find the glowing Sterrenscherf where it lands.
   - Schatkaarten: from rovers, chests and merchants. Read one and an X appears on your map and minimap: dig there (F).
   - Het dagboek (J) is now a book you leaf through: title page, contents, your story, quests, today's challenges,
     achievements, an index of every animal and monster you have seen, the places you found and the rumours you heard. */
(function(){
const FN={};WD.fun=FN;
const F=()=>{PL.fx=PL.fx||{};const f=PL.fx;f.ach=f.ach||{};f.seen=f.seen||{};f.slain=f.slain||{};f.st=f.st||{walk:0,earned:0,days:1,dailyDone:0,stars:0,treasures:0};return f};
Object.assign(ITEMS,{star_shard:{n:'Sterrenscherf',g:'mat',price:450,ico:'✦',rar:'e'},treasure_map:{n:'Schatkaart',g:'food',heal:0,price:140,ico:'🗺'}});

/* ---------- counting what you do ---------- */
let lastX=null,lastZ=null,lastGold=null,lastT=null;const gained={};
const _gi=giveItem;giveItem=function(id,n=1,q){gained[id]=(gained[id]||0)+n;return _gi(id,n,q)};
const _ka=killActor;killActor=function(a,by){_ka(a,by);if(by&&a&&a.type){const f=F();f.slain[a.type]=(f.slain[a.type]||0)+1;if(!f.seen[a.type])seeIt(a);if(a.boss&&a.kind==='enemy')note(a.name+' verslagen!')}};
function seeIt(a){const f=F();if(f.seen[a.type])return;const s=typeof siteAt==='function'?siteAt(a.x,a.z):null;
  f.seen[a.type]={d:f.st.days,w:s?s.name:(a.x<-30000?'Noordheim':a.x<-9000?'het Demonenrijk':a.x<-2000?'een grot':'de wildernis')};
  if(Object.keys(f.seen).length>1)toast('📖 Nieuw in je dierenindex: '+nameOf(a.type),'#cfe0ff')}
ANIMS.push(dt=>{if(!started||PL.dead)return;const f=F();
  if(lastX!==null){const d=Math.hypot(PL.x-lastX,PL.z-lastZ);if(d<20&&!PL.mounted)f.st.walk+=d}lastX=PL.x;lastZ=PL.z;
  if(lastGold!==null&&PL.gold>lastGold)f.st.earned+=PL.gold-lastGold;lastGold=PL.gold;
  if(lastT!==null&&ENV.time<lastT-12){endDay();f.st.days++;newDailies()}lastT=ENV.time});
/* ---------- every morning the journal opens on yesterday ---------- */
function snap(){const f=F();return{k:Object.assign({},PL.kills||{}),slain:Object.assign({},f.slain),earned:f.st.earned,walk:f.st.walk,disc:Object.keys(PL.discovered||{}).length,lvl:PL.lvl,ach:Object.keys(f.ach).length,done:f.st.dailyDone}}
function note(t){const f=F();f.today=f.today||{s:snap(),ev:[]};if(f.today.ev.length<14)f.today.ev.push(t)}
FN.note=note;
function endDay(){const f=F();const T0=f.today||{s:snap(),ev:[]},a=T0.s,b=snap();const slain=[];for(const t in f.slain){const n=f.slain[t]-(a.slain[t]||0);if(n>0)slain.push([t,n])}slain.sort((x,y)=>y[1]-x[1]);
  f.yday={day:f.st.days,slain,earned:b.earned-a.earned,walk:b.walk-a.walk,disc:b.disc-a.disc,lvl:[a.lvl,b.lvl],ach:b.ach-a.ach,done:b.done-a.done,ev:T0.ev.slice()};f.today={s:b,ev:[]};f.newDay=true}
setInterval(()=>{const f=F();if(!started)return;if(!f.today)f.today={s:snap(),ev:[]};
  if(!f.newDay||PL.dead||anyModal()||(window.CIN&&CIN.on)||ENV.time<6.3||ENV.time>14)return;if(actors.some(a=>a.kind==='enemy'&&!a.dead&&a.state==='chase'&&Math.hypot(a.x-PL.x,a.z-PL.z)<35))return;
  f.newDay=false;FN.openAt='recap';toggleModal('inv',()=>{invTab='quests';renderInv()});try{document.exitPointerLock()}catch(e){}},1000);
let lastLvl=null,lastDisc=null,lastTame=false,lastRealms=null;
setInterval(()=>{if(!started)return;const f=F();if(lastLvl!==null&&PL.lvl>lastLvl)note('Niveau '+PL.lvl+' bereikt.');lastLvl=PL.lvl;
  const ds=SITES.filter(q=>PL.discovered[q.id]&&q.id!=='bridge').map(q=>q.name);if(lastDisc)for(const n of ds)if(!lastDisc.has(n))note('Ontdekt: '+n+'.');lastDisc=new Set(ds);
  const tame=!!(f.wolf&&f.wolf.tame);if(tame&&!lastTame&&lastRealms!==null)note('Een wolvenwelp getemd: '+f.wolf.name+'.');lastTame=tame;
  const r=realmsMine();if(lastRealms!==null&&r>lastRealms)note('Heerser geworden van een rijk!');lastRealms=r},2000);
setInterval(()=>{if(!started||PL.dead)return;for(const a of actors){if(a.dead||!(a.kind==='enemy'||a.kind==='animal')||a.type==='titancore'||!a.type)continue;if(Math.abs(a.x-PL.x)>28||Math.abs(a.z-PL.z)>28)continue;if(Math.hypot(a.x-PL.x,a.z-PL.z)<26&&a.root&&a.root.visible)seeIt(a)}},1000);

/* ---------- toasts ---------- */
const tst=document.createElement('div');tst.style.cssText='position:fixed;left:50%;top:calc(110px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:28;pointer-events:none;display:flex;flex-direction:column;gap:6px;align-items:center';document.body.appendChild(tst);
function toast(t,col){const d=document.createElement('div');d.className='panel';d.style.cssText='padding:8px 16px;font:600 15px var(--f-ui,sans-serif);color:'+(col||'#ffd27a')+';border-color:'+(col||'#e0b04a')+';opacity:0;transform:translateY(-8px);transition:all .35s;box-shadow:0 0 18px rgba(224,176,74,.3)';d.textContent=t;tst.appendChild(d);
  requestAnimationFrame(()=>{d.style.opacity=1;d.style.transform='none'});setTimeout(()=>{d.style.opacity=0;setTimeout(()=>d.remove(),400)},4200)}
FN.toast=toast;

/* ---------- achievements ---------- */
const K=t=>(PL.kills&&PL.kills[t])||0,anyKill=()=>Object.entries(PL.kills||{}).reduce((s,[k,v])=>k.startsWith('boss_')?s:s+v,0);
const realmsMine=()=>Object.values((PL.fx&&PL.fx.realms)||{}).filter(r=>r.mine).length;
const ACH=[
  ['first','⚔','Eerste bloed','Versla je eerste vijand',()=>anyKill()>0],
  ['wolves','🐺','Wolvenjager','Versla 10 wolven',()=>K('wolf')>=10],
  ['bandits','🗡','Schrik der rovers','Versla 25 rovers',()=>K('bandit')>=25],
  ['undead','💀','Botbreker','Versla 25 ondoden',()=>K('undead')>=25],
  ['lvl10','⭐','Ervaren','Bereik niveau 10',()=>PL.lvl>=10],
  ['lvl20','🌟','Held','Bereik niveau 20',()=>PL.lvl>=20],
  ['lvl30','👑','Legende','Bereik niveau 30',()=>PL.lvl>=30],
  ['gold1k','💰','Spaarpot','Heb 1.000 goud tegelijk',()=>PL.gold>=1000],
  ['gold10k','💎','Schatrijk','Heb 10.000 goud tegelijk',()=>PL.gold>=10000],
  ['exp10','🧭','Ontdekkingsreiziger','Ontdek 10 plaatsen',()=>SITES.filter(s=>PL.discovered[s.id]).length>=10],
  ['expAll','🗺','Cartograaf','Ontdek alle plaatsen van Eikendal',()=>SITES.filter(s=>s.id!=='bridge'&&!s.id.startsWith('n_')&&!PL.discovered[s.id]).length===0],
  ['secrets','🔍','Geheimzoeker','Vind 5 geheime plekken',()=>HIDDEN.filter(h=>h.found).length>=5],
  ['north','❄','Noorderling','Bereik Noordheim',()=>PL.x<-30000||F().ach.north],
  ['demon','🔥','Door het vuur','Betreed het Demonenrijk',()=>PL.x<-9000&&PL.x>-30000],
  ['king','⚜','Heerser','Heers over een rijk',()=>realmsMine()>=1],
  ['emperor','🏰','Keizer','Heers over drie rijken',()=>realmsMine()>=3],
  ['wolfpet','🐾','Wolvenvriend','Tem een wolvenwelp',()=>!!(PL.fx&&PL.fx.wolf&&PL.fx.wolf.tame)],
  ['dragon','🐉','Drakenruiter','Vlieg op je eigen draak',()=>!!(PL.mounted&&PL.mounted.flyM)],
  ['vyrnax','🐲','Drakendoder','Versla draak Vyrnax',()=>K('boss_vyrnax')>0],
  ['kraken','🐙','Diepzeeheld','Versla De Kraak',()=>K('boss_kraak')>0],
  ['giant','👹','Reuzendoder','Versla de Reuzen-Vierhand',()=>K('boss_vierhand')>0],
  ['yeti','❄','Yetijager','Versla Yeti Ysgrauw',()=>K('boss_yeti')>0],
  ['bosses','🏆','Bazenjager','Versla 8 verschillende bazen',()=>Object.keys(PL.kills||{}).filter(k=>k.startsWith('boss_')).length>=8],
  ['sea','🐚','Heer van de zee','Draag de Schelp van de Diepte',()=>PL.eq&&PL.eq.seal==='seal_sea'],
  ['build','🔨','Bouwmeester','Bouw 10 dingen',()=>(PL.built||[]).length>=10],
  ['star','🌠','Sterrenvanger','Vang een vallende ster',()=>F().st.stars>0],
  ['treasure','🗝','Schatgraver','Graaf een schat op',()=>F().st.treasures>0],
  ['forgiven','🕊','Tweede kans','Word vergeven na een misdaad',()=>!!F().forgiven],
  ['daily','☀','IJverig','Voltooi 10 uitdagingen van de dag',()=>F().st.dailyDone>=10],
  ['walk','👣','Wandelaar','Loop 20 kilometer',()=>F().st.walk>=20000],
  ['bestiary','📖','Natuurkenner','Zie 25 soorten dieren en monsters',()=>Object.keys(F().seen).length>=25],
  ['people','🧑','Bekend gezicht','Praat met 20 verschillende mensen',()=>Object.keys(F().met||{}).length>=20],
  ['goblins','👺','Goblinkenner','Zie 10 soorten goblins',()=>Object.keys(F().seen).filter(t=>/^goblin/.test(t)).length>=10]];
setInterval(()=>{if(!started||PL.dead)return;const f=F();for(const [id,ico,n,,test] of ACH){if(f.ach[id])continue;let ok=false;try{ok=test()}catch(e){}
  if(ok){f.ach[id]={d:f.st.days};toast('🏆 Prestatie: '+ico+' '+n);note('Prestatie behaald: '+n+'.');try{giveXp(100)}catch(e){}PL.gold+=50;try{WD.sounds&&WD.sounds.play('level',.5,1.2)}catch(e){}}}},2000);
{const _am=window.amendsHook;}
{const f0=()=>{};}
/* forgiven: noticed when the bounty vanishes after a gift */
let wasBad=false;setInterval(()=>{if(!started)return;const bad=PL.bounty>0||PL.rep<0;if(wasBad&&!bad&&PL.rep>=15)F().forgiven=1;wasBad=bad},1500);

/* ---------- today's challenges ---------- */
const FOOD=['bread','apple','cheese','stew','meat','fish','roast'],FISH=['fish','salmon','trout','catfish','eel'];
const POOL=[
  ()=>({k:'kill',t:'wolf',n:5+r3(),txt:n=>'Versla '+n+' wolven'}),()=>({k:'kill',t:'bandit',n:4+r3(),txt:n=>'Versla '+n+' rovers'}),
  ()=>({k:'kill',t:'undead',n:4+r3(),txt:n=>'Versla '+n+' ondoden'}),()=>({k:'killany',n:10+r3()*2,txt:n=>'Versla '+n+' vijanden'}),
  ()=>({k:'item',ids:['wood'],n:8+r3()*2,txt:n=>'Hak '+n+' hout'}),()=>({k:'item',ids:['stone','iron'],n:6+r3(),txt:n=>'Verzamel '+n+' steen of ijzer'}),
  ()=>({k:'item',ids:FISH,n:3+r3(),txt:n=>'Vang '+n+' vissen'}),()=>({k:'item',ids:['meat'],n:3,txt:n=>'Jaag en verzamel '+n+' keer wild'}),
  ()=>({k:'item',ids:['herb','herbs','flower'],n:4,txt:n=>'Pluk '+n+' kruiden'}),
  ()=>({k:'gold',n:150+r3()*60,txt:n=>'Verdien '+n+' goud'}),()=>({k:'walk',n:1500+r3()*300,txt:n=>'Loop '+(n/1000).toFixed(1)+' km'}),
  ()=>({k:'disc',n:1,txt:()=>'Ontdek een nieuwe plaats'})];
function r3(){return Math.floor(Math.random()*4)}
function base(c){const f=F();if(c.k==='kill')return K(c.t);if(c.k==='killany')return anyKill();if(c.k==='item')return c.ids.reduce((s,id)=>s+(gained[id]||0)+((f.gainBase&&f.gainBase[id])||0),0);
  if(c.k==='gold')return f.st.earned;if(c.k==='walk')return f.st.walk;if(c.k==='disc')return Object.keys(PL.discovered||{}).length;return 0}
function newDailies(){const f=F();const pick3=POOL.slice().sort(()=>Math.random()-.5).slice(0,3).map(g=>g());for(const c of pick3){c.b=base(c);c.g=Math.round(80+c.n*(c.k==='walk'?.06:c.k==='gold'?.5:12));c.xp=60+Math.round(c.g*.6);c.done=false}
  f.daily={day:f.st.days,list:pick3};if(started)toast('☀ Nieuwe uitdagingen voor vandaag! Kijk in je dagboek (J).','#ffe39a')}
function prog(c){if(c.k==='item'){return Math.max(0,c.ids.reduce((s,id)=>s+(gained[id]||0),0)-(c.bi||0))}return Math.max(0,base(c)-c.b)}
setInterval(()=>{if(!started||PL.dead)return;const f=F();if(!f.daily||f.daily.day!==f.st.days)newDailies();
  for(const c of f.daily.list){if(c.k==='item'&&c.bi===undefined)c.bi=c.ids.reduce((s,id)=>s+(gained[id]||0),0);if(c.done)continue;if(prog(c)>=c.n){c.done=true;f.st.dailyDone++;PL.gold+=c.g;try{giveXp(c.xp)}catch(e){}toast('☀ Uitdaging gehaald: '+c.txt(c.n)+'  (+'+c.g+' goud)','#ffe39a');sfx('coin')}}},1500);

/* ---------- falling stars ---------- */
let starT=60;const BEAMS=[];
ANIMS.push(dt=>{if(!started||PL.dead||PL.x<-2000||(ENV.night||0)<.6||anyModal())return;starT-=dt;if(starT>0)return;starT=90+Math.random()*120;
  let x,z;for(let i=0;i<30;i++){const a=Math.random()*6.283,r=45+Math.random()*90;x=PL.x+Math.cos(a)*r;z=PL.z+Math.sin(a)*r;if(Math.abs(x)<HALF-30&&Math.abs(z)<HALF-30&&terrainH(x,z)>.6)break;x=null}if(x===null)return;
  const y=groundH(x,z),from=new T.Vector3(x+rr(80),y+170,z+rr(80)),to=new T.Vector3(x,y+.5,z),head=new T.Sprite(new T.SpriteMaterial({map:WD.tx?WD.tx('glare.png'):null,color:0xbfe8ff,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));head.scale.set(6,6,1);scene.add(head);
  const tg=new T.BufferGeometry();tg.setAttribute('position',new T.Float32BufferAttribute([0,0,0,0,0,0],3));const trail=new T.Line(tg,new T.LineBasicMaterial({color:0xcff0ff,transparent:true,opacity:.9}));scene.add(trail);
  addLog('Een vallende ster! Kijk omhoog... hij valt vlakbij.','#cfe8ff');let t=0;const f=()=>{t+=.016;const k=Math.min(1,t/1.8);const p=from.clone().lerp(to,k*k);head.position.copy(p);const q=from.clone().lerp(to,Math.max(0,k*k-.25));tg.attributes.position.setXYZ(0,q.x,q.y,q.z);tg.attributes.position.setXYZ(1,p.x,p.y,p.z);tg.attributes.position.needsUpdate=true;
    if(k<1)requestAnimationFrame(f);else{scene.remove(trail);head.scale.set(16,16,1);setTimeout(()=>scene.remove(head),500);try{WD.sounds&&WD.sounds.at('boom',x,z,.6,1.6,140)}catch(e){}if(window.PW)PW.shake=Math.max(PW.shake||0,.3);
      makePickup(x,z,'star_shard',1);const b=new T.Mesh(new T.CylinderGeometry(.35,.35,40,8,1,true),new T.MeshBasicMaterial({color:0x9ad8ff,transparent:true,opacity:.4,blending:T.AdditiveBlending,depthWrite:false}));b.position.set(x,y+20,z);scene.add(b);BEAMS.push({b,x,z});PL.nav={x,z,name:'de vallende ster'}}};f()});
setInterval(()=>{for(let i=BEAMS.length-1;i>=0;i--){const B=BEAMS[i];if(!pickups.some(p=>p.id==='star_shard'&&Math.hypot(p.x-B.x,p.z-B.z)<3&&!p.taken&&!p.dead)){scene.remove(B.b);BEAMS.splice(i,1)}}},500);
{const _g2=giveItem;giveItem=function(id,n,q){const r=_g2(id,n,q);if(id==='star_shard'){F().st.stars++;toast('🌠 Je vond een Sterrenscherf!','#cfe8ff');note('Een vallende ster gevangen.')}return r}}

/* ---------- treasure maps ---------- */
function treasureSpot(){for(let i=0;i<200;i++){const x=rr(HALF-120),z=rr(HALF-120),h=terrainH(x,z);if(h<1.5||h>40||siteAt(x,z)||Math.hypot(x-PL.x,z-PL.z)<150)continue;return{x,z}}return{x:200,z:200}}
let digIt=null;function armDig(){const T0=F().treasure;if(!T0||digIt)return;digIt={x:T0.x,z:T0.z,r:4,txt:'Graaf naar de schat',fn:dig};INTER.push(digIt)}
function dig(){const T0=F().treasure;if(!T0)return;try{swingAnim()}catch(e){}sfx('hit');const i=INTER.indexOf(digIt);if(i>=0)INTER.splice(i,1);digIt=null;F().treasure=null;F().st.treasures++;
  const L={gold:Math.floor(300+Math.random()*600),items:[['gem',2+Math.floor(Math.random()*3)]]};if(Math.random()<.4)L.items.push([pick(['ring_gold','helm_iron','cloak_blue','sword_knight','boots_leather'].filter(id=>ITEMS[id])),1]);if(Math.random()<.2)L.items.push(['star_shard',1]);
  setTimeout(()=>{dropLoot(PL.x+1,PL.z+1,L);sfx('coin');toast('🗝 Je groef een schat op!');note('Een schat opgegraven!');try{WD.sounds&&WD.sounds.play('chest',.7)}catch(e){}},400)}
const _use=useItem;useItem=function(id){if(id!=='treasure_map')return _use(id);if(!hasItem(id))return;if(F().treasure){PL.nav={x:F().treasure.x,z:F().treasure.z,name:'de schat'};addLog('Je volgt al een schatkaart. De X staat op je kaart.');return}
  takeItem(id,1);const s=treasureSpot();F().treasure=s;PL.nav={x:s.x,z:s.z,name:'de schat'};armDig();const near=siteAt(s.x+80,s.z)||SITES.reduce((b,q)=>!b||Math.hypot(q.x-s.x,q.z-s.z)<Math.hypot(b.x-s.x,b.z-s.z)?q:b,null);
  addLog('Je vouwt de schatkaart open. Een X, niet ver van '+(near?near.name:'een oude weg')+'. Volg de markering op je kaart en graaf (F).','#e0b04a');try{closeModals()}catch(e){}};
{const _rl=rollLoot;rollLoot=function(t){const L=_rl(t);if((t==='bandit'||t==='skeleton')&&Math.random()<.05)L.items.push(['treasure_map',1]);return L}}
{const _oc=openChest;openChest=function(c){const was=c&&c.open;_oc(c);if(c&&!was&&Math.random()<.35)makePickup(c.x+.8,c.z+1.6,'treasure_map',1)}}
{const _db=drawBigMap;drawBigMap=function(){_db.apply(this,arguments);try{const T0=F().treasure;if(!T0||PL.x<-2000)return;const c=$('bigmap'),g=c.getContext('2d'),k=c.width/MAPN,x=mpx(T0.x)*k,y=mpx(T0.z)*k;
  g.strokeStyle='#b0201a';g.lineWidth=4;g.beginPath();g.moveTo(x-8,y-8);g.lineTo(x+8,y+8);g.moveTo(x+8,y-8);g.lineTo(x-8,y+8);g.stroke();g.font='bold 13px "IM Fell English",serif';g.fillStyle='#b0201a';g.textAlign='center';g.fillText('schat',x,y-12)}catch(e){}}}
let ready=false;ANIMS.push(()=>{if(ready||!started||!worldReady)return;ready=true;armDig();
  for(const a of actors)if(a.shop&&(a.job==='merchant'||a.ai==='travel')&&!a.shop.includes('treasure_map'))a.shop.push('treasure_map');if(!F().daily)newDailies()});
const rr=(a=1)=>(Math.random()*2-1)*a;

/* ================= the journal as a book ================= */
const ICO={wolf:'🐺',shadowwolf:'🐺',bandit:'🗡',archer:'🏹',skeleton:'💀',troll:'👹',goblin:'👺',goblinbrute:'👺',goblinking:'👑',golem:'🗿',lavagolem:'🌋',treant:'🌳',spider:'🕷',wraith:'👻',fourhands:'👹',lavaturtle:'🐢',demon:'😈',imp:'😈',dragon:'🐉',dragonkin:'🦎',terrorbird:'🦤',shark:'🦈',serpent:'🐍',kraken:'🐙',piranha:'🐟',bear:'🐻',boar:'🐗',sheep:'🐑',cow:'🐄',deer:'🦌',chicken:'🐔',rabbit:'🐇',fox:'🦊',elk:'🫎',goat:'🐐',pig:'🐖',hare:'🐇',yeti:'🦍',frostgiant:'🧊',wolfking:'🐺',stormrunner:'🌪'};
const LORE={wolf:'Jaagt in roedels aan de bosranden. Alleen is hij schuw, samen gevaarlijk.',bandit:'Rovers die reizigers beroven op de wegen. Ze dragen soms een schatkaart bij zich.',archer:'Een rover met een boog. Blijf niet stilstaan in zijn schootsveld.',skeleton:'De doden die niet willen rusten. Ze rammelen bij elke stap.',
  troll:'Groot, dom en sterk. Woont in het moeras en slaat met een knots.',goblin:'Klein en vals. Leeft in de tunnels onder het land.',golem:'Levende steen. Langzaam, maar elke klap voelt als een vallende rots.',treant:'Een boom die wakker werd. Beschermt het bos met wortels en takken.',
  spider:'Reuzenspinnen weven hun web in donkere grotten. Pas op voor gif.',wraith:'Een spookgeest die door muren lijkt te glijden.',fourhands:'De Reuzen-Vierhand, heerser van het Demonenrijk. Een titaan van vuur en woede.',lavaturtle:'Een schildpad met een schild van gestolde lava.',
  demon:'Een demon uit het Demonenrijk, heet als een smidse.',dragon:'Vyrnax, de draak van het nest. Spuwt vuur van grote afstand.',serpent:'Een lange zeeslang die door de golven kronkelt.',kraken:'De Kraak, heerser van de diepte. Zijn tentakels trekken schepen naar beneden.',
  piranha:'Kleine vissen met heel grote tanden. Nooit alleen.',shark:'Een meerhaai. Stilte in het water betekent niet dat je veilig bent.',bear:'Een bruine beer. Laat hem met rust en hij laat jou met rust.',boar:'Een wild zwijn met scherpe slagtanden. Valt aan als het bang is.',
  deer:'Een schuw hert. Goed voor wild.',rabbit:'Snel en schichtig.',fox:'Een slimme vos die kippen steelt.',sheep:'Een wollig schaap van de boeren.',cow:'Een koe. Ze geeft melk en loeit naar je.',chicken:'Een kip. Kakelt vrolijk.',elk:'Een machtige eland uit de noordelijke bossen.',goat:'Een berggeit die over rotsen springt.',pig:'Een varken dat in de modder rolt.',hare:'Een haas met lange oren.',
  yeti:'Yeti Ysgrauw, een harig ijsbeest diep onder Noordheim. Een titaan van kou.',frostgiant:'IJsreus Hrimtor, bewaker van de IJsburcht.',wolfking:'Wolvenkoning Fenrik, de witte wolf die zijn roedel roept.',stormrunner:'Zefyr de Stormloper, sneller dan de wind.',terrorbird:'Een schrikvogel: groot, snel en met een vlijmscherpe snavel.',dragonkin:'Drakenmensen die het nest van de draak bewaken.'};
FN.ICO=ICO;FN.LORE=LORE;
function nameOf(t){return(ANIMALS[t]&&ANIMALS[t].name)||(MON[t]&&MON[t].n)||({wolf:'Wolf',bandit:'Rover',archer:'Roverboogschutter',skeleton:'Skelet'})[t]||t}
const allTypes=()=>{const s=new Set(['wolf','bandit','archer','skeleton',...Object.keys(ANIMALS),...Object.keys(MON)]);for(const a of actors)if((a.kind==='enemy'||a.kind==='animal')&&a.type&&a.type!=='titancore')s.add(a.type);return[...s].filter(t=>t!=='titancore')};
let page=0,pages=[],chapters=[],flipping=false;
const JOBICO={smith:'⚒',merchant:'🛒',innkeeper:'🍺',guard:'🛡',farmer:'🌾',priest:'✝',lord:'⚜',villager:'🏠',child:'🧒',fisher:'🎣',elf:'🧝',witch:'🧙',hermit:'🧓',traveler:'🎒',tailor:'🧵'};
const JOBNL=j=>(typeof JOBN!=='undefined'&&JOBN[j])||({child:'kind',fisher:'visser',elf:'elf',witch:'heks'})[j]||'inwoner';
/* meeting people: everyone you talk to goes into the people index */
{const _od=openDialog;openDialog=function(a){try{if(a&&a.name&&a.kind==='npc'){const f=F();f.met=f.met||{};const k=a.name+'|'+a.job;if(!f.met[k]){const s=siteAt(a.x,a.z);f.met[k]={n:a.name,job:a.job,d:f.st.days,w:s?s.name:(a.x<-30000?'Noordheim':'de wildernis')};toast('📖 Nieuw in je mensenindex: '+a.name,'#cfe0ff')}}}catch(e){}return _od(a)}}
const BOOK_CSS=`#jbook{position:relative;display:flex;gap:0;margin-top:6px;perspective:2200px;user-select:none;-webkit-user-select:none}
#jbook .pg{flex:1;min-height:min(560px,calc(100vh - 170px));max-height:calc(100vh - 150px);overflow:auto;padding:22px 26px 34px;color:#3a2a1a;font:15px/1.45 var(--f-ui,serif);
  background:radial-gradient(ellipse at 50% 40%,#f6ecd0,#e8d6ad 70%,#d8c08e);box-shadow:inset 0 0 40px rgba(120,80,30,.35);position:relative}
#jbook .pg.l{border-radius:8px 0 0 8px;box-shadow:inset -18px 0 26px -14px rgba(60,35,10,.55),inset 0 0 40px rgba(120,80,30,.3)}#jbook .pg.r{border-radius:0 8px 8px 0;box-shadow:inset 18px 0 26px -14px rgba(60,35,10,.55),inset 0 0 40px rgba(120,80,30,.3)}
#jbook h3{font-family:var(--f-display);font-size:24px;color:#6a2a14;margin:0 0 8px;border-bottom:1px solid rgba(106,42,20,.35);padding-bottom:4px}#jbook h4{font-family:var(--f-display);font-size:17px;color:#5a3a1a;margin:10px 0 4px}
#jbook .drop::first-letter{float:left;font-family:var(--f-display);font-size:46px;line-height:.9;color:#8a2a14;margin:4px 6px 0 0}
#jbook .pn{position:absolute;bottom:8px;left:0;right:0;text-align:center;font:italic 13px var(--f-display,serif);color:#7a5a3a}
#jbook .card{border:1px solid rgba(90,60,30,.35);background:rgba(255,248,225,.45);border-radius:4px;padding:6px 8px;margin:5px 0}
#jbook .bar{height:7px;background:rgba(90,60,30,.18);border-radius:4px;overflow:hidden;margin-top:4px}#jbook .bar i{display:block;height:100%;background:linear-gradient(90deg,#b8862a,#e0b04a)}
#jbook .ach{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}#jbook .md{display:flex;gap:8px;align-items:center;border-radius:6px;padding:5px 6px;background:rgba(255,248,225,.4);border:1px solid rgba(90,60,30,.25)}
#jbook .md .c{width:38px;height:38px;flex:none;border-radius:50%;display:grid;place-items:center;font-size:20px;background:radial-gradient(circle at 35% 30%,#ffe8a0,#c99a30 60%,#8a6418);box-shadow:0 2px 4px rgba(0,0,0,.35)}
#jbook .md.off{opacity:.55;filter:grayscale(1)}#jbook .md.off .c{background:#9a8a70;color:transparent;text-shadow:0 0 0 #5a4a3a}
#jbook .md b{display:block;font-size:13.5px}#jbook .md span{font-size:12px;color:#6a5034}
#jbook .be{display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px dashed rgba(90,60,30,.3)}#jbook .be .p{width:54px;height:54px;flex:none;border-radius:6px;display:grid;place-items:center;font-size:32px;background:rgba(90,60,30,.12);border:1px solid rgba(90,60,30,.3)}
#jbook .be.off .p{filter:brightness(0) opacity(.35)}#jbook .be b{font-family:var(--f-display);font-size:16px}#jbook .be span{display:block;font-size:12.5px;color:#5a4028}
#jbook .toc a{display:flex;justify-content:space-between;color:#3a2a1a;text-decoration:none;padding:4px 0;border-bottom:1px dotted rgba(90,60,30,.4);cursor:pointer;font-family:var(--f-display);font-size:17px}#jbook .toc a:hover{color:#8a2a14}
#jnav{display:flex;justify-content:space-between;align-items:center;margin-top:6px}#jnav .btn{min-width:90px}
#jflip{position:absolute;top:0;bottom:0;width:50%;transform-style:preserve-3d;transition:transform .55s ease-in-out;pointer-events:none;z-index:3}
#jflip>div{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}#jflip .bk{transform:rotateY(180deg)}
@media(max-width:720px){#jbook .pg.r{display:none}#jbook .pg.l{border-radius:8px}#jflip{width:100%}}`;
{const s=document.createElement('style');s.textContent=BOOK_CSS;document.body.appendChild(s)}
const P0=(h)=>h;
function build(){const f=F(),nm=(PL.look&&PL.look.name)||'Reiziger',cls=CLASSES[PL.cls]?CLASSES[PL.cls].n:'avonturier';pages=[];chapters=[];
  const add=h=>{pages.push(h)},chap=(t,ico)=>chapters.push([t,ico,pages.length]);
  add('<div style="text-align:center;padding-top:40px"><div style="font-size:54px">📖</div><h3 style="border:none;font-size:34px;margin-top:10px">Avonturenboek</h3><div style="font-family:var(--f-display);font-size:22px;color:#5a3a1a">van '+esc(nm)+'</div>'+
    '<p style="margin-top:26px;font-style:italic">'+esc(cls)+' · niveau '+PL.lvl+' · dag '+f.st.days+'</p><p style="margin-top:40px;font-size:13px;color:#7a5a3a">❦ Blader met de pijlen, met ← → of door op de rand van een bladzijde te klikken ❦</p></div>');
  let recapAt=-1;const y=f.yday;if(y){recapAt=pages.length;const top=y.slain.slice(0,6).map(([t,n])=>(ICO[t]||'⚔')+' '+n+'× '+esc(nameOf(t))).join('<br>');
    add('<h3>Terugblik · dag '+y.day+'</h3><p class="drop">Gisteren was een dag om te onthouden. '+(y.walk>200?'Je liep '+(y.walk/1000).toFixed(1)+' kilometer':'Je bleef dicht bij huis')+(y.earned>0?' en verdiende '+y.earned+' goud':'')+'. '+
      (y.slain.length?'Je versloeg '+y.slain.reduce((s,[,n])=>s+n,0)+' tegenstanders.':'Je hoefde niet te vechten.')+(y.lvl[1]>y.lvl[0]?' Je groeide van niveau '+y.lvl[0]+' naar '+y.lvl[1]+'.':'')+'</p>'+
      (top?'<h4>Verslagen</h4><div class="card">'+top+'</div>':'')+(y.ev.length?'<h4>Wat er gebeurde</h4><div class="card">'+y.ev.map(e=>'❦ '+esc(e)).join('<br>')+'</div>':'')+
      '<p style="margin-top:10px;font-style:italic">Een nieuwe dag breekt aan. Kijk bij <b>Vandaag</b> voor nieuwe uitdagingen. Sluit het boek om verder te spelen.</p>')}
  const tocAt=pages.length;add('');
  /* my story */
  chap('Mijn verhaal','📜');const kills=anyKill(),bosses=Object.keys(PL.kills||{}).filter(k=>k.startsWith('boss_')).length,disc=SITES.filter(s=>PL.discovered[s.id]&&s.id!=='bridge').length,realms=Object.entries(f.realms||{}).filter(([,r])=>r.mine).map(([k])=>({eik:'Eikendal',zib:'Zilverburg',zh:'Zilverhaven',ysd:'Ysdal'})[k]);
  const title=realms.length?((PL.look&&PL.look.fem)?'Koningin':'Koning')+' van '+realms[0]:bosses>=5?'Bazenjager':K('wolf')>=30?'Wolvenjager':PL.lvl>=20?'Held van Eikendal':'Reiziger';
  add('<h3>Mijn verhaal</h3><p class="drop">'+esc(nm)+', '+esc(title.toLowerCase())+', begon als '+esc(cls.toLowerCase())+' in het dorp Eikendal. Na '+f.st.days+' dag'+(f.st.days===1?'':'en')+' en '+(f.st.walk/1000).toFixed(1)+' kilometer te voet staat '+(PL.look&&PL.look.fem?'zij':'hij')+' nu op niveau '+PL.lvl+'. '+
    (kills?'Onderweg werden '+kills+' vijanden verslagen'+(bosses?', waaronder '+bosses+' machtige baas'+(bosses===1?'':'sen'):'')+'. ':'Nog geen enkel gevecht werd gestreden. ')+
    (realms.length?'Het volk van '+realms.join(' en ')+' noemt '+(PL.look&&PL.look.fem?'haar':'hem')+' nu heerser. ':'')+
    (f.wolf&&f.wolf.tame?'Trouw aan '+(PL.look&&PL.look.fem?'haar':'zijn')+' zijde loopt de wolf '+esc(f.wolf.name)+'. ':'')+'</p>'+
    '<h4>In cijfers</h4><div class="card">Goud verdiend: <b>'+f.st.earned+'</b><br>Plaatsen ontdekt: <b>'+disc+'</b><br>Geheime plekken: <b>'+HIDDEN.filter(h=>h.found).length+'</b><br>Prestaties: <b>'+Object.keys(f.ach).length+' / '+ACH.length+'</b><br>Uitdagingen gehaald: <b>'+f.st.dailyDone+'</b><br>Vallende sterren gevangen: <b>'+f.st.stars+'</b> · Schatten opgegraven: <b>'+f.st.treasures+'</b><br>Reputatie: <b>'+repName()+'</b>'+(PL.bounty?' · premie '+PL.bounty:'')+'</div>');
  /* quests */
  chap('Opdrachten','📜');const Q=PL.quests.slice();let qh='<h3>Opdrachten</h3>';if(!Q.length)qh+='<p><i>Geen opdrachten. Praat met dorpelingen, wachters en heren om werk te vinden.</i></p>';
  Q.forEach((q,i)=>{const have=Math.min(q.have(),q.need);qh+='<div class="card"><b>🔖 '+esc(q.title)+(have>=q.need?' ✔':'')+'</b><div style="font-size:13px">'+esc(q.desc)+'</div><div class="bar"><i style="width:'+(have/q.need*100)+'%"></i></div><div style="font-size:12px;color:#6a5034">'+have+'/'+q.need+' · beloning '+q.reward.gold+' goud, '+q.reward.xp+' xp</div></div>';if((i+1)%4===0&&i<Q.length-1){add(qh);qh='<h3>Opdrachten (verder)</h3>'}});add(qh);
  /* today */
  chap('Vandaag','☀');let dh='<h3>Uitdagingen van vandaag</h3><p class="drop">Elke dag brengt drie nieuwe uitdagingen. Haal ze voor de dag voorbij is voor goud en ervaring.</p>';
  for(const c of (f.daily&&f.daily.list)||[]){const p=Math.min(prog(c),c.n);dh+='<div class="card"><b>'+(c.done?'✔ ':'☀ ')+esc(c.txt(c.n))+'</b><div class="bar"><i style="width:'+(p/c.n*100)+'%"></i></div><div style="font-size:12px;color:#6a5034">'+(c.k==='walk'?(p/1000).toFixed(1)+' / '+(c.n/1000).toFixed(1)+' km':p+' / '+c.n)+' · beloning '+c.g+' goud</div></div>'}
  const tr=f.treasure;dh+='<h4>Op zoek naar</h4><div class="card">'+(tr?'🗝 Een schat! Volg de X op je kaart en graaf (F).':'Geen schatkaart. Rovers, kisten en handelaars hebben er soms een.')+'<br>🌠 \'s Nachts vallen er soms sterren. Hun scherven zijn veel waard.</div>';add(dh);
  /* achievements */
  chap('Prestaties','🏆');for(let i=0;i<ACH.length;i+=10){let h='<h3>Prestaties '+(i?'(verder)':'· '+Object.keys(f.ach).length+'/'+ACH.length)+'</h3><div class="ach">';
    for(const [id,ico,n,d] of ACH.slice(i,i+10)){const on=f.ach[id];h+='<div class="md'+(on?'':' off')+'"><div class="c">'+ico+'</div><div><b>'+esc(n)+'</b><span>'+esc(d)+(on?' · dag '+on.d:'')+'</span></div></div>'}add(h+'</div>')}
  /* the indexes: animals, monsters and the people you met */
  const ANIM=new Set([...Object.keys(ANIMALS),'wolf','bear','boar','piranha','shark','terrorbird','shadowwolf']);
  const idx=(title,ico,types,intro)=>{chap(title,ico);const sorted=types.sort((a,b)=>(f.seen[b]?1:0)-(f.seen[a]?1:0)||nameOf(a).localeCompare(nameOf(b))),seenN=sorted.filter(t=>f.seen[t]).length;
    for(let i=0;i<Math.max(1,sorted.length);i+=5){let h='<h3>'+title+(i?' (verder)':' · '+seenN+'/'+sorted.length)+'</h3>';if(!i)h+='<p style="font-size:13px;margin:0 0 4px"><i>'+intro+'</i></p>';
      for(const t of sorted.slice(i,i+5)){const s=f.seen[t],n=f.slain[t]||(t==='skeleton'?K('undead'):K(t))||0,boss=MON[t]&&MON[t].boss;
        h+='<div class="be'+(s?'':' off')+'"><div class="p">'+(ICO[t]||(ANIMALS[t]?'🐾':'👹'))+'</div><div><b>'+(s?esc(nameOf(t)):'???')+(s&&boss?' <small style="color:#8a2a14">· baas</small>':'')+'</b><span>'+(s?esc(LORE[t]||(ANIMALS[t]?'Een dier van de wilde streken.':'Een gevaarlijk wezen. Wees op je hoede.')):'Nog niet gezien.')+'</span>'+
          (s?'<span><i>Eerst gezien op dag '+s.d+' in '+esc(s.w)+(n?' · verslagen: '+n:'')+'</i></span>':'')+'</div></div>'}add(h)}};
  const types=allTypes();
  idx('Dierenindex','🐾',types.filter(t=>ANIM.has(t)),'Elk dier dat je van dichtbij zag, komt in deze index.');
  idx('Monsterindex','👹',types.filter(t=>!ANIM.has(t)),'Monsters, rovers, ondoden en bazen: alles wat je ooit aanviel of zag.');
  chap('Mensenindex','🧑');{const M=Object.values(f.met||{}).sort((a,b)=>a.d-b.d);for(let i=0;i<Math.max(1,M.length);i+=6){let h='<h3>Mensenindex'+(i?' (verder)':' · '+M.length)+'</h3>';
    if(!i)h+='<p style="font-size:13px;margin:0 0 4px"><i>Iedereen met wie je een praatje maakte.</i></p>';if(!M.length)h+='<p><i>Je hebt nog met niemand gepraat. Druk F bij iemand.</i></p>';
    for(const m of M.slice(i,i+6))h+='<div class="be"><div class="p">'+(JOBICO[m.job]||'🧑')+'</div><div><b>'+esc(m.n)+'</b><span>'+esc(JOBNL(m.job))+'</span><span><i>Ontmoet op dag '+m.d+' in '+esc(m.w)+'</i></span></div></div>';add(h)}}
  /* discoveries */
  chap('Ontdekkingen','🗺');const all=SITES.filter(s=>s.id!=='bridge'),fd=all.filter(s=>PL.discovered[s.id]);for(let i=0;i<Math.max(1,all.length);i+=16){let h='<h3>Ontdekkingen'+(i?' (verder)':' · '+fd.length+'/'+all.length)+'</h3><div style="columns:2;font-size:14px">';
    for(const s of all.slice(i,i+16))h+='<div style="break-inside:avoid;padding:2px 0">'+(PL.discovered[s.id]?'🗺 '+esc(s.name):'<span style="color:#9a8a70">? ? ?</span>')+'</div>';add(h+'</div>'+(i===0?'<h4>Geheime plekken</h4><div style="font-size:14px">'+(HIDDEN.filter(x=>x.found).map(x=>'✨ '+esc(x.name)).join('<br>')||'<i>Nog geen.</i>')+'</div>':''))}
  /* rumours */
  chap('Geruchten','👂');const hs=RUMORS.filter((r,i)=>PL.hear[i]);for(let i=0;i<Math.max(1,hs.length);i+=5){let h='<h3>Gehoord'+(i?' (verder)':'')+'</h3>';if(!hs.length)h+='<p><i>Vraag dorpelingen naar het nieuws.</i></p>';for(const r of hs.slice(i,i+5))h+='<p style="margin:6px 0">“'+esc(r.t)+'”</p>';add(h)}
  add('<div style="text-align:center;padding-top:120px;font-family:var(--f-display);font-size:24px;color:#6a2a14">❦<br>Wordt vervolgd...<br>❦</div>');
  FN.recapAt=recapAt;pages[tocAt]='<h3>Inhoud</h3><div class="toc">'+chapters.map(([t,ico,p])=>'<a data-go="'+p+'"><span>'+ico+' '+esc(t)+'</span><span>'+(p+1)+'</span></a>').join('')+'</div>'}
const narrow=()=>innerWidth<=720,step=()=>narrow()?1:2;
function spread(){const L=pages[page]||'',R=narrow()?'':pages[page+1]||'';return'<div class="pg l">'+L+'<div class="pn">'+(page+1)+'</div></div>'+(narrow()?'':'<div class="pg r">'+R+(pages[page+1]!==undefined?'<div class="pn">'+(page+2)+'</div>':'')+'</div>')}
function drawBook(){const box=$('jbookw');if(!box)return;box.querySelector('#jbook').innerHTML=spread();box.querySelector('#jpg').textContent='Bladzijde '+(page+1)+(narrow()?'':'–'+Math.min(page+2,pages.length))+' van '+pages.length;
  box.querySelectorAll('[data-go]').forEach(a=>a.onclick=()=>go(+a.dataset.go))}
function go(p,dir){p=Math.max(0,Math.min(pages.length-1,p));if(!narrow())p-=p%2;if(p===page||flipping)return;const bk=$('jbook');if(!bk){page=p;return}
  dir=dir||(p>page?1:-1);flipping=true;try{WD.sounds&&WD.sounds.play('quest',.45,1.15)}catch(e){}
  const old=spread();const fl=document.createElement('div');fl.id='jflip';const nxt=page;page=p;const neu=spread();page=nxt;
  const tmp=document.createElement('div');tmp.innerHTML=old;const tmp2=document.createElement('div');tmp2.innerHTML=neu;const sideOld=dir>0?tmp.lastChild:tmp.firstChild,sideNew=dir>0?tmp2.firstChild:tmp2.lastChild;
  fl.style.left=dir>0&&!narrow()?'50%':'0';fl.style.transformOrigin=dir>0?'left center':'right center';if(narrow()){fl.style.transformOrigin='left center'}
  const fr=document.createElement('div');fr.appendChild(sideOld.cloneNode(true));const bkf=document.createElement('div');bkf.className='bk';bkf.appendChild(sideNew.cloneNode(true));fl.appendChild(fr);fl.appendChild(bkf);
  for(const d of[fr,bkf])d.firstChild.style.height='100%';bk.appendChild(fl);
  page=p;const under=document.createElement('div');under.innerHTML=spread();/* the page below the turning leaf */
  const keep=dir>0?bk.querySelector('.pg.l'):bk.querySelector('.pg.r');const newHalf=dir>0?under.lastChild:under.firstChild;const oldHalf=dir>0?bk.querySelector('.pg.r'):bk.querySelector('.pg.l');
  if(oldHalf&&newHalf&&!narrow())oldHalf.replaceWith(newHalf);
  requestAnimationFrame(()=>{fl.style.transform='rotateY('+(dir>0?-180:180)+'deg)'});
  setTimeout(()=>{flipping=false;drawBook()},560)}
const _ri=renderInv;renderInv=function(){_ri.apply(this,arguments);if(invTab!=='quests')return;const el=$('inv'),hdr=el.firstElementChild;if(!hdr)return;
  while(hdr.nextSibling)hdr.nextSibling.remove();build();if(FN.openAt==='recap'&&FN.recapAt>=0){page=FN.recapAt;FN.openAt=null}page=Math.min(page,Math.max(0,pages.length-1));if(!narrow())page-=page%2;
  const w=document.createElement('div');w.id='jbookw';w.innerHTML='<div id="jbook"></div><div id="jnav"><button class="btn" id="jprev">◀ Terug</button><span id="jpg" style="font-family:var(--f-display);color:var(--parch2)"></span><button class="btn" id="jnext">Verder ▶</button></div>';el.appendChild(w);
  drawBook();$('jprev').onclick=()=>go(page-step(),-1);$('jnext').onclick=()=>go(page+step(),1);
  $('jbook').addEventListener('click',e=>{if(e.target.closest('[data-go]'))return;const r=$('jbook').getBoundingClientRect(),x=(e.clientX-r.left)/r.width;if(x>.82)go(page+step(),1);else if(x<.18)go(page-step(),-1)});
  let sx=null;$('jbook').addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});$('jbook').addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(dx<-50)go(page+step(),1);else if(dx>50)go(page-step(),-1)},{passive:true})};
addEventListener('keydown',e=>{if(!$('jbookw')||$('inv').style.display!=='block'||invTab!=='quests')return;if(e.code==='ArrowRight'){e.preventDefault();go(page+step(),1)}else if(e.code==='ArrowLeft'){e.preventDefault();go(page-step(),-1)}});
})();
