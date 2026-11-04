/* ================= Life in the world: the chronicle, treasure maps, a falcon, alchemy and children =================
   - De Kroniek (button at the bottom): a book of everything you did: monsters and bosses beaten, realms you rule,
     your wedding, the wonders you found, your dragon, your treasure map, and a list of your great moments.
   - Schatkaarten: monsters sometimes drop an old treasure map (bosses often), and merchants sell them. Click it in
     your bag to read the clue ("about 90 paces north of Zilverburg"); close by, a red X shows on the minimap. Dig there.
   - Valkerij: Valkenier Wulfric in Eikendal sells a falcon. It circles over you, hunts rabbits and deer and brings you
     the game, and dives at monsters that attack you.
   - Alchemie: the witch and the wizard brew magic potions from herbs, mushrooms, crystals and troll teeth: become a
     giant, shrink, jump as high as a house, become invisible, breathe fire, or turn into a croaking frog.
   - Kinderen: children play tag in the villages and towns, and when they see you they run after you shouting "Held!". */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}},near=(a,d)=>Math.hypot(a.x-PL.x,a.z-PL.z)<d;
const FX=()=>{PL.fx=PL.fx||{};return PL.fx};
/* ---------- the chronicle ---------- */
WD.chron={add(t){const L=FX().chron=FX().chron||[];L.push({t,m:Math.round((PL.t||0)/60)});if(L.length>80)L.shift()}};
const _kaL=killActor;killActor=function(a,by){const was=a&&a.dead;_kaL(a,by);try{if(!was&&by&&a&&a.kind==='enemy'){if(a.boss)WD.chron.add('Versloeg '+a.name+'.');dropMap(a)}}catch(e){}};
const CHR={el:null};
function chronHTML(){const f=FX(),k=PL.kills||{},nm=t=>(typeof MON!=='undefined'&&MON[t]&&MON[t].n)||t,esc2=s=>String(s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));let tot=0;const types=[];for(const t in k){if(t.startsWith('boss_')||t==='undead')continue;tot+=k[t];types.push([t,k[t]])}types.sort((a,b)=>b[1]-a[1]);
  const bosses=Object.keys(k).filter(t=>t.startsWith('boss_')).length,KG=WD.kingdom,mine=(KG&&KG.realms||[]).filter(R=>KG.isMine(R.id));
  const wonders=[f.worldBlessing&&'Gezegend door het Hart van de Wereld',f.cloudQ>=2&&'Bracht de Zonneharp terug naar het Wolkenrijk',f.champion&&'Kampioen van het Grote Toernooi ('+f.champion+'×)',f.babyDragon&&'Draak: '+f.babyDragon.name+' ('+(WD.petStage?WD.petStage():'babydraak')+')',f.falcon&&'Valk: '+f.falcon.name,f.treasures&&'Schatten opgegraven: '+f.treasures].filter(Boolean);
  const sec=(h,body)=>'<h3 style="font-family:var(--f-display);color:#ffd27a;margin:14px 0 4px">'+h+'</h3>'+body;
  let s='<div style="font-family:var(--f-display);font-size:30px;color:#ffd27a;text-align:center">📖 De Kroniek van '+esc2((PL.look&&PL.look.name)||'de held')+'</div><div style="text-align:center;color:var(--mute)">Niveau '+PL.lvl+' · '+Math.round(PL.gold)+' goud · reputatie '+Math.round(PL.rep)+'</div>';
  s+=sec('⚔ Daden','Monsters verslagen: <b>'+tot+'</b>'+(types.length?' ('+types.slice(0,6).map(([t,n])=>esc2(nm(t))+' '+n).join(', ')+')':'')+'<br>Grote vijanden verslagen: <b>'+bosses+'</b>');
  s+=sec('👑 Rijken',mine.length?mine.map(R=>esc2(KG.title(R.id))+' van '+esc2(R.name)).join('<br>'):'Je heerst nog over geen enkel rijk.');if(f.spouse)s+='<br>Getrouwd met <b>'+esc2(f.spouse.name)+'</b>';
  s+=sec('✨ Wonderen',wonders.length?wonders.map(esc2).join('<br>'):'Nog geen wonderen gevonden. Ga op avontuur!');
  if(f.tmap)s+=sec('📜 Je schatkaart',esc2(f.tmap.clue)+' (Een rode X verschijnt op je minikaart als je dichtbij bent.)');
  const L=(f.chron||[]).slice(-30).reverse();s+=sec('🕯 Grote momenten',L.length?L.map(e=>'<div style="margin:2px 0">• '+esc2(e.t)+' <span style="color:var(--mute);font-size:12px">(na '+e.m+' min.)</span></div>').join(''):'Je verhaal begint nog maar net...');
  return s+'<div style="text-align:center;margin-top:14px"><button class="btn pri" id="chronx">Sluiten</button></div>'}
function toggleChron(){if(!CHR.el){const d=document.createElement('div');d.className='panel';d.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(620px,92vw);max-height:80vh;overflow:auto;z-index:30;padding:18px 22px;display:none;line-height:1.45';document.body.appendChild(d);CHR.el=d}
  const el=CHR.el;if(el.style.display==='block'){el.style.display='none';return}el.innerHTML=chronHTML();el.style.display='block';try{document.exitPointerLock()}catch(e){}el.querySelector('#chronx').onclick=()=>el.style.display='none'}
addEventListener('keydown',e=>{if(e.code==='Escape'&&CHR.el)CHR.el.style.display='none'});
function chronBtn(){const q=$('qbar');if(!q||$('qb_chron'))return;const b=document.createElement('button');b.id='qb_chron';b.textContent='Kroniek';b.onclick=toggleChron;q.appendChild(b)}
addEventListener('load',chronBtn);setTimeout(chronBtn,3000);WD.chron.open=toggleChron;
/* ---------- treasure maps ---------- */
ITEMS.schatkaart={n:'Oude schatkaart',g:'mat',price:120,ico:'📜',rar:'r',desc:'Klik erop in je rugzak om de kaart te lezen.'};
function dropMap(a){if(Math.random()<(a.boss?.5:.03)){giveItem('schatkaart',1,true);addLog('Je vindt een oude schatkaart bij '+a.name+'!','#ffd27a')}}
const DIRS=['oosten','zuidoosten','zuiden','zuidwesten','westen','noordwesten','noorden','noordoosten'];
function newMap(){const L=SITES.filter(s=>s.name&&s.id!=='bridge'&&s.x>-1900&&Math.abs(s.x)<HALF-150&&Math.abs(s.z)<HALF-150);for(let i=0;i<300;i++){const s=pick(L),a=Math.random()*6.283,r=60+Math.random()*90,x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r,h=terrainH(x,z);
  if(h<1.6||h>45||x<-1950||Math.abs(x)>HALF-60||Math.abs(z)>HALF-60||inBuilding(x,z,3)||siteAt(x,z))continue;return{x,z,clue:'Ongeveer '+Math.round(r)+' passen ten '+DIRS[Math.round(a/(Math.PI/4))%8]+' van '+s.name+'.'}}return null}
const _uiL=useItem;useItem=function(id){if(id!=='schatkaart')return _uiL(id);const f=FX();
  if(f.tmap){card('📜 Je schatkaart','Je volgt al een kaart: '+f.tmap.clue+' Graaf die schat eerst op!',null,8);return}
  const m=newMap();if(!m){addLog('De kaart is te vaag om te lezen.');return}takeItem('schatkaart',1);f.tmap=m;addDig();
  card('📜 Een oude schatkaart','Op het vergeelde perkament staat een kruisje en in sierlijke letters: "'+m.clue+'" Als je dichtbij bent, zie je een rode X op je minikaart. Graaf daar!',null,12)};
let DIG=null;function addDig(){const m=FX().tmap;if(!m||DIG)return;DIG={x:m.x,z:m.z,r:3.2,txt:()=>FX().tmap?'Graaf naar de schat':'',fn:dig};INTER.push(DIG)}
function dig(){const f=FX(),m=f.tmap;if(!m||PL.mounted)return;try{if(pm&&pm.sk){pm.onceName='Farm_Harvest';pm.onceT=2}}catch(e){}sfx('step');addLog('Je graaft...');
  setTimeout(()=>{if(!f.tmap)return;f.tmap=null;const i=INTER.indexOf(DIG);if(i>=0)INTER.splice(i,1);DIG=null;const g=Math.round(300+Math.random()*900);PL.gold+=g;const got=[g+' goud'];
    for(const [id,p] of[['gem',.45],['pearl',.35],['elixir',.25],['schatkaart',.12]])if(ITEMS[id]&&Math.random()<p){giveItem(id,1,true);got.push(ITEMS[id].n)}
    f.treasures=(f.treasures||0)+1;sfx('level');giveXp(400);try{const c=new T.Mesh(new T.BoxGeometry(.9,.6,.6),new T.MeshStandardMaterial({color:0x6a4424}));c.position.set(m.x,groundH(m.x,m.z)+.3,m.z);scene.add(c);setTimeout(()=>scene.remove(c),60000)}catch(e){}
    card('💰 Schat gevonden!','Je schop raakt hout: een oude kist! Erin: '+got.join(', ')+'.',null,9);WD.chron.add('Groef een schat op ('+g+' goud).')},2000)}
const _dmL=drawMini;drawMini=function(){_dmL();const m=FX().tmap;if(!m||PL.inCave)return;const S=150,k=S/210,dx=(m.x-PL.x)*k,dz=(m.z-PL.z)*k;if(Math.abs(dx)>70||Math.abs(dz)>70)return;const g=$('mini').getContext('2d'),x=S/2+dx,y=S/2+dz;g.strokeStyle='#ff2a2a';g.lineWidth=3;g.beginPath();g.moveTo(x-5,y-5);g.lineTo(x+5,y+5);g.moveTo(x+5,y-5);g.lineTo(x-5,y+5);g.stroke()};
/* ---------- the falconer and your falcon ---------- */
const FAL={m:null,mode:'circle',tg:null,t:20,cd:0,pos:null};
function falconModel(){const g=new T.Group(),br=new T.MeshStandardMaterial({color:0x6a4a2a,roughness:.8}),lt=new T.MeshStandardMaterial({color:0xd8c8a8}),yl=new T.MeshStandardMaterial({color:0xe0b030});
  const b=new T.Mesh(new T.SphereGeometry(.16,10,8),br);b.scale.set(1,.85,1.6);g.add(b);const c=new T.Mesh(new T.SphereGeometry(.12,8,6),lt);c.position.set(0,-.05,.06);c.scale.set(.9,.8,1.2);g.add(c);
  const h=new T.Mesh(new T.SphereGeometry(.1,8,6),br);h.position.set(0,.08,.24);g.add(h);const bk=new T.Mesh(new T.ConeGeometry(.03,.09,6),yl);bk.rotation.x=Math.PI/2;bk.position.set(0,.06,.35);g.add(bk);
  const tl=new T.Mesh(new T.BoxGeometry(.14,.02,.22),br);tl.position.set(0,0,-.3);g.add(tl);const wings=[];for(const s of[-1,1]){const p=new T.Group();p.position.set(s*.1,.03,0);const w=new T.Mesh(new T.PlaneGeometry(.55,.2),new T.MeshStandardMaterial({color:0x5a3a20,side:T.DoubleSide}));w.rotation.x=-Math.PI/2;w.position.x=s*.28;p.add(w);g.add(p);wings.push({p,s})}
  scene.add(g);return{g,wings}}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;const f=FX().falcon;if(!started||!f||PL.dead){if(FAL.m)FAL.m.g.visible=false;return}if(!FAL.m){FAL.m=falconModel();FAL.pos=new T.Vector3(PL.x,PL.y+10,PL.z)}const m=FAL.m;m.g.visible=!PL.inCave||PL.x>30000;const t=PL.t;
  FAL.cd-=dt;FAL.t-=dt;let tx,ty,tz;
  if(FAL.mode==='circle'){tx=PL.x+Math.cos(t*.7)*7;tz=PL.z+Math.sin(t*.7)*7;ty=PL.y+11+Math.sin(t*1.3);
    /* a monster after you: dive at it */
    if(FAL.cd<=0){let foe=null,bd=18;for(const a of actors){if(a.dead||a.kind!=='enemy'||a.passive||!(a.state==='chase'||a.provoked)||!!a.cave!==!!PL.inCave)continue;const d=Math.hypot(a.x-PL.x,a.z-PL.z);if(d<bd){bd=d;foe=a}}if(foe){FAL.mode='dive';FAL.tg=foe;FAL.hunt=false}}
    /* now and then she hunts a rabbit or a deer */
    if(FAL.mode==='circle'&&FAL.t<=0){FAL.t=25+Math.random()*25;let prey=null,bd=45;for(const a of actors){if(a.dead||a.kind!=='animal'||!/rabbit|deer|hare|fox|bird/.test(a.type||''))continue;const d=Math.hypot(a.x-PL.x,a.z-PL.z);if(d<bd){bd=d;prey=a}}if(prey){FAL.mode='dive';FAL.tg=prey;FAL.hunt=true}}}
  else if(FAL.mode==='dive'){const a=FAL.tg;if(!a||a.dead){FAL.mode='circle'}else{tx=a.x;tz=a.z;ty=(a.y||0)+1;if(FAL.pos.distanceTo(new T.Vector3(tx,ty,tz))<1.2){FAL.cd=4;FAL.mode='back';
      if(FAL.hunt){hitActor(a,9999,true);giveItem('meat',1,true);addLog(f.name+' vangt een '+(a.name||'dier').toLowerCase()+' en brengt je het wild.','#ffd27a')}else{hitActor(a,Math.round(8+PL.lvl*1.5),true,null);try{floatText(a.x,(a.y||0)+2,a.z,'🦅','#fff')}catch(e){}}}}}
  if(FAL.mode==='back'){tx=PL.x;tz=PL.z;ty=PL.y+6;if(Math.hypot(FAL.pos.x-PL.x,FAL.pos.z-PL.z)<3)FAL.mode='circle'}
  if(tx===undefined){tx=PL.x;ty=PL.y+10;tz=PL.z}const tgt=new T.Vector3(tx,ty,tz),sp=FAL.mode==='dive'?26:14,d=FAL.pos.distanceTo(tgt);if(d>200)FAL.pos.copy(tgt);else FAL.pos.lerp(tgt,Math.min(1,sp*dt/Math.max(d,.01)));
  m.g.position.copy(FAL.pos);m.g.lookAt(tgt.x+(tgt.x===FAL.pos.x?.01:0),tgt.y,tgt.z);for(const w of m.wings)w.p.rotation.z=w.s*(FAL.mode==='dive'?.9:Math.sin(t*(FAL.mode==='circle'?3:9))*.5)});
/* ---------- alchemy ---------- */
Object.assign(ITEMS,{
  reuzendrank:{n:'Reuzendrank',g:'food',heal:30,buff:{dmg:15,hp:60},dur:60,price:150,ico:'⚗',rar:'e',desc:'Je wordt een minuut lang een reus.'},
  krimpdrank:{n:'Krimpdrank',g:'food',heal:10,buff:{spd:.45},dur:60,price:90,ico:'⚗',rar:'r',desc:'Je wordt piepklein en heel snel.'},
  veerdrank:{n:'Veerdrank',g:'food',heal:10,buff:{jump:2.4},dur:60,price:110,ico:'⚗',rar:'r',desc:'Je springt zo hoog als een huis.'},
  schimdrank:{n:'Onzichtbaarheidsdrank',g:'food',heal:10,buff:{spd:.1},dur:45,price:180,ico:'⚗',rar:'e',desc:'Monsters zien je 45 seconden niet.'},
  drakendrank:{n:'Drakenadem',g:'food',heal:20,buff:{dmg:10},dur:45,price:160,ico:'⚗',rar:'e',desc:'Je spuwt vuur naar monsters vlak voor je.'},
  kikkerdrank:{n:'Kikkerdrank',g:'food',heal:15,buff:{jump:1.2},dur:60,price:40,ico:'⚗',rar:'r',desc:'Kwaak!'}});
const ALCH=[{n:'Reuzendrank',cost:'1 Trollentand + 3 Kruiden',need:{troll_tooth:1,herb:3},out:'reuzendrank'},{n:'Krimpdrank',cost:'2 Reuzenpaddenstoelen + 2 Kruiden',need:{mushroom:2,herb:2},out:'krimpdrank'},
  {n:'Veerdrank',cost:'1 Kristal + 2 Kruiden',need:{crystal:1,herb:2},out:'veerdrank'},{n:'Onzichtbaarheidsdrank',cost:'2 Gloeipaddenstoelen + 1 Kristal',need:{glow_mushroom:2,crystal:1},out:'schimdrank'},
  {n:'Drakenadem',cost:'1 Gloeipaddenstoel + 1 Trollentand + 2 Kruiden',need:{glow_mushroom:1,troll_tooth:1,herb:2},out:'drakendrank'},{n:'Kikkerdrank',cost:'2 Kruiden + 1 Appel',need:{herb:2,apple:1},out:'kikkerdrank'}].filter(r=>Object.keys(r.need).every(id=>ITEMS[id]));
const POT={kind:null,t:0,tick:0};
const _uiA=useItem;useItem=function(id){const was=(PL.inv[id]||0);_uiA(id);if((PL.inv[id]||0)>=was||!/^(reuzendrank|krimpdrank|veerdrank|schimdrank|drakendrank|kikkerdrank)$/.test(id))return;
  POT.kind=id;POT.t=ITEMS[id].dur||60;POT.tick=0;const msg={reuzendrank:'Je groeit en groeit... je bent een reus!',krimpdrank:'Pfoe! Je krimpt tot je zo klein bent als een kat.',veerdrank:'Je voelt je zo licht als een veertje.',schimdrank:'Je lichaam wordt doorzichtig. Niemand ziet je!',drakendrank:'Je keel brandt... je kunt vuur spuwen!',kikkerdrank:'Je huid wordt groen en... KWAAK!'}[id];addLog(msg,'#c9a0ff')};
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!pm||!pm.g)return;const want=POT.t>0?POT.kind:null;if(POT.t>0){POT.t-=dt;if(POT.t<=0)addLog('De toverdrank is uitgewerkt.','#c9a0ff')}
  /* giant or tiny: scaled from your own size, and back again afterwards */if(want&&POT.base===undefined)POT.base=pm.g.scale.x;if(POT.base!==undefined&&!PL.mounted){const sc=POT.base*(want==='reuzendrank'?1.8:want==='krimpdrank'?.5:1),cur=pm.g.scale.x;pm.g.scale.setScalar(cur+(sc-cur)*Math.min(1,dt*3));if(!want&&Math.abs(cur-POT.base)<.01){pm.g.scale.setScalar(POT.base);POT.base=undefined}}
  pm.g.traverse(o=>{if(o.isMesh&&o.material&&!Array.isArray(o.material)){if(want==='schimdrank'){if(!o.userData.inv){o.userData.inv={t:o.material.transparent,o:o.material.opacity};o.material.transparent=true}o.material.opacity=.25}else if(o.userData.inv){o.material.transparent=o.userData.inv.t;o.material.opacity=o.userData.inv.o;delete o.userData.inv}}});
  if(!want)return;POT.tick-=dt;if(POT.tick>0)return;POT.tick=want==='kikkerdrank'?3:want==='drakendrank'?1.4:9;
  if(want==='kikkerdrank'){try{floatText(PL.x,PL.y+2.4,PL.z,'Kwaak!','#7ad86a');sfx('chirp')}catch(e){}}
  if(want==='drakendrank'){const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot);if(window.PW&&PW.ps)for(let i=0;i<24;i++)pwEm(PW.ps,PL.x+fx*.6,PL.y+1.6,PL.z+fz*.6,fx*9+rr(1.5),rr(1),fz*9+rr(1.5),.6,.35,.08,[1,.8,.3],[1,.25,0],1,0,1);
    for(const a of actors){if(a.dead||a.kind!=='enemy'||a.passive)continue;const dx=a.x-PL.x,dz=a.z-PL.z,d=Math.hypot(dx,dz);if(d<6&&d>.3&&(dx*fx+dz*fz)/d>.6)hitActor(a,Math.round(14+PL.lvl*2),true,{x:dx/d,z:dz/d})}}});
/* invisible: monsters do not see you */
const _htL=hostileToPlayer;hostileToPlayer=function(a){if(POT.t>0&&POT.kind==='schimdrank'&&a&&a.kind==='enemy'&&!a.provoked)return false;return _htL(a)};
/* ---------- people: the falconer, alchemy at the witch and the wizard, merchants sell maps ---------- */
const _dmA=dlgMain;dlgMain=function(a,text){_dmA(a,text);try{const box=document.querySelector('#dlg #dopts');if(!box)return;const add=(l,f,pri)=>{const b=document.createElement('button');b.className='btn'+(pri?' pri':'');b.textContent=l;b.onclick=f;box.insertBefore(b,box.firstChild)};
  if((a.job==='witch'||a.name==='Tovenaar Mirabor')&&ALCH.length)add('⚗ Brouw toverdranken (alchemie)',()=>craftMenu(a,ALCH,dlgMain),1);
  if(a.name==='Valkenier Wulfric'){if(FX().falcon)add('🦅 Hoe gaat het met '+FX().falcon.name+'?',()=>{closeModals();card('Valkenier Wulfric','"Een prachtige vogel. Ze jaagt voor je en verdedigt je. Zorg goed voor haar!"',null,7)});
    else add('🦅 Koop een valk (400 goud)',()=>{if(PL.gold<400){addLog('Een valk kost 400 goud.','#e5766a');return}PL.gold-=400;closeModals();FX().falcon={name:pick(['Scherpklauw','Stormveer','Goudoog','Windjager'])};sfx('level');
      card('🦅 Je eigen valk!','Wulfric zet een prachtige valk op je arm. Ze heet '+FX().falcon.name+'. Ze cirkelt boven je, jaagt op konijnen en herten en brengt je het wild, en ze duikt op monsters die je aanvallen.',null,11);WD.chron.add('Kreeg een valk: '+FX().falcon.name+'.')},1)}}catch(e){console.warn('leven dlg',e)}};
/* ---------- children who play in the villages ---------- */
const KIDN=['Pim','Lotje','Bram','Fien','Tijn','Saar','Mees','Noor','Ties','Lieke','Jip','Roos','Otto','Mila','Kas','Zoë'];
function freeSpot(cx,cz,r){for(let i=0;i<60;i++){const a=Math.random()*6.283,d=Math.random()*r,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,p={x,z};if(!collide(p,.5)&&!inBuilding(x,z,1)&&terrainH(x,z)>1)return{x,z}}return null}
const _pfL=populateFantasy;populateFantasy=function(){_pfL();try{
  for(const a of actors)if(a.kind==='npc'&&a.job==='merchant'&&Array.isArray(a.shop)&&!a.shop.includes('schatkaart'))a.shop.push('schatkaart');
  {const p=freeSpot(14,10,18);if(p){const w=spawnNPC('villager',p.x,p.z,{name:'Valkenier Wulfric',ai:'stay',line:'grootland'});w.falconer=true}}
  const towns=[[2,-4,6],[300,-214,4],[730,545,3]];for(const R of(WD.great&&WD.great.realms)||[]){const S=SITE[R.site];if(S)towns.push([S.x+8,S.z+9,R.mega?5:3])}
  for(const [cx,cz,n] of towns)for(let i=0;i<n;i++){const p=freeSpot(cx,cz,20);if(!p)continue;const k=spawnNPC('villager',p.x,p.z,{name:pick(KIDN),ai:'stay'});k.kid={cx,cz,t:0,wp:null,hero:0,cd:0};k.hh=1.3;try{k.root.scale.setScalar(.62)}catch(e){}}}catch(e){console.warn('leven people',e)}};
const KL={play:['Tikkertje!','Jij bent hem!','Haha, je krijgt me niet!','Nog een keer!','Wie het eerst bij de put is!'],hero:['Held! Held!','Mag ik je zwaard eens zien?','Later word ik ook ridder!','Heb jij echt een draak verslagen?','Mama, kijk! De held!']};
const _uNL=updateNPC;updateNPC=function(a,dt){const k=a&&a.kid;if(!k||a.cheer||a.dead||a.state==='flee')return _uNL(a,dt);
  if(a.sayT>0){a.sayT-=dt;if(a.sayT<=0)a.say=''}const day=ENV.time>=7&&ENV.time<20;if(a.root)a.root.visible=day;if(!day){a.vel=0;return}
  k.cd-=dt;const d=Math.hypot(PL.x-a.x,PL.z-a.z);
  if(k.hero>0){k.hero-=dt;const tx=PL.x-Math.sin(PL.rot)*2.5+rr(.5),tz=PL.z-Math.cos(PL.rot)*2.5;if(stepTo(a,dt,tx,tz,4.6,1.6))a.rot+=angDiff(a.rot,Math.atan2(PL.x-a.x,PL.z-a.z))*Math.min(1,dt*5);if(!(a.sayT>0)&&Math.random()<dt*.5)saySomething(a,pick(KL.hero),2.4);
    if(k.hero<=0||Math.hypot(a.x-k.cx,a.z-k.cz)>45){k.hero=0;k.cd=50}}
  else{if(d<9&&k.cd<=0&&PL.rep>-10&&!PL.mounted){k.hero=10+Math.random()*6;saySomething(a,pick(KL.hero),2.4)}
    if(!k.wp||k.t<=0){k.t=2+Math.random()*3;k.wp=[k.cx+rr(14),k.cz+rr(14)]}k.t-=dt;if(stepTo(a,dt,k.wp[0],k.wp[1],4.2,.8)||a.stuck>1){k.wp=null;a.stuck=0}if(!(a.sayT>0)&&d<25&&Math.random()<dt*.08)saySomething(a,pick(KL.play),2)}
  if(a.h)animHuman(a.h,dt,a.vel,{})};
const _sgL=startGame;startGame=function(...a){_sgL(...a);DIG=null;POT.t=0;setTimeout(addDig,1500)};
WD.leven={newMap,toggleChron,ALCH,POT};
})();
