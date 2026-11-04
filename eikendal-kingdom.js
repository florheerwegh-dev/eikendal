/* ================= Kings and kingdoms =================
   Eikendal (with Burcht Valkenhorst and Beukenrode), Zilverburg, Zilverhaven and Ysdal each have a ruler.
   Defeat the ruler, pick up his seal and wear it in the new gear slot "Heerschap": the realm is yours.
   A card in the middle of the screen says so at every step (ruler fallen, seal picked up, you rule now).
   - The guards and knights of the realm serve you. Buy more in the royal panel (U, or the ⚜ button).
   - Send knights anywhere, let them follow you, or watch through their eyes ("kijk mee").
   - Taxes fill the treasury. The people's mood depends on taxes, safety, feasts and how you answer them.
   - Now and then citizens protest on the square with a demand: give in, ignore them, or send the guards.
     If the mood falls to zero they revolt and someone else takes the seal.
   - You can also hand the seal to a citizen of your choice: they become the new ruler.
   Everything is kept in the save (PL.fx.realms). */
(function(){
const REALMS=[
  {id:'eik',desc:'Eikendal, Burcht Valkenhorst en Beukenrode',name:'Eikendal',crown:'seal_eik',old:'crown_eik',find:a=>/Valkenhorst/.test(a.name),title:['Koning','Koningin'],rulerName:'Koning Aldwin Valkenhorst',hp:1600,
    areas:()=>[[0,0,95],[-330,240,100],[-260,-90,55]],square:()=>[2,-4]},
  {id:'zib',desc:'de stad Zilverburg',name:'Zilverburg',crown:'seal_zib',old:'crown_zib',find:a=>/Roos/.test(a.name),title:['Burgemeester','Burgemeester'],rulerName:'Burgemeester Roos',hp:900,
    areas:()=>[[300,-220,125]],square:()=>[300,-214]},
  {id:'zh',desc:'de handelsstad Zilverhaven',name:'Zilverhaven',crown:'seal_zh',old:'crown_zh',find:a=>/Isolde/.test(a.name),title:['Vorst','Vorstin'],rulerName:'Handelsprinses Isolde',hp:1100,
    areas:()=>[[730,545,105]],square:()=>[730,545]},
  {id:'ysd',desc:'Ysdal in Noordheim',name:'Ysdal',crown:'seal_ysd',old:'crown_ysd',find:a=>/Sigrun/.test(a.name),title:['Jarl','Jarl'],rulerName:'Jarl Sigrun',hp:1200,cave:true,
    areas:R=>[[R.throne.x,R.throne.z,95]],square:R=>[R.throne.x+6,R.throne.z+8]}];
const RB={};for(const R of REALMS)RB[R.id]=R;
/* the sign of power is a seal for the new gear slot "Heerschap" (the old crowns of version 16 are swapped for seals) */
Object.assign(ITEMS,{
  seal_eik:{n:'Zegel van Eikendal',g:'seal',def:4,fx:{gold:.15,hp:20},price:3000,ico:'⚜',rar:'l',realm:'eik',desc:'Draag dit zegel in je uitrusting (vak Heerschap) om koning(in) van Eikendal te worden.'},
  seal_zib:{n:'Zegel van Zilverburg',g:'seal',def:2,fx:{gold:.2},price:2200,ico:'⚜',rar:'e',realm:'zib'},
  seal_zh:{n:'Zegel van Zilverhaven',g:'seal',def:3,fx:{gold:.25},price:2600,ico:'⚜',rar:'l',realm:'zh'},
  seal_ysd:{n:'Zegel van Ysdal',g:'seal',def:5,fx:{hp:30},price:2600,ico:'⚜',rar:'l',realm:'ysd'},
  crown_eik:{n:'Oude kroon van Eikendal',g:'mat',price:300,ico:'♔'},crown_zib:{n:'Oude ambtsketen',g:'mat',price:200,ico:'⚜'},crown_zh:{n:'Oud diadeem',g:'mat',price:250,ico:'♔'},crown_ysd:{n:'Oude jarlskroon',g:'mat',price:250,ico:'♔'}});
const KG={ready:false,spec:null};WD.kingdom=KG;
const fem=()=>!!(PL.look&&PL.look.fem);
const S=R=>{PL.fx=PL.fx||{};const all=PL.fx.realms=PL.fx.realms||{};return all[R.id]=all[R.id]||{mine:false,dead:false,tax:1,joy:55,gold:0,bought:[],heir:null}};
const myTitle=R=>R.title[fem()?1:0]+' '+((PL.look&&PL.look.name)||'Reiziger');
const inArea=(R,x,z)=>R.areas(R).some(([cx,cz,r])=>Math.hypot(x-cx,z-cz)<r);
const mine=R=>R&&S(R).mine;
const realmOfActor=a=>a.realm?RB[a.realm]:null;
const knights=R=>{const L=actors.filter(a=>a.realm===R.id&&a.guard&&a.job==='guard'&&!a.dead&&!a.gone);if(R.pool)for(const a of R.pool)if(!a._pin&&!a.dead&&a.guard)L.push(a);return L};   /* R.pool: soldiers of a huge city who rest while you are far away */
const citizens=R=>actors.filter(a=>a.realm===R.id&&a.kind==='npc'&&!a.guard&&!a.dead&&!a.gone&&a.job!=='lord'&&!a.kid&&!a.spouse);   /* children never become rulers */
const TAX=[{n:'Laag',g:1.5,j:1.4},{n:'Normaal',g:3.2,j:.15},{n:'Hoog',g:5.5,j:-1.8}];
const moodTxt=j=>j>75?'Blij':j>50?'Tevreden':j>30?'Morrend':j>12?'Boos':'Woedend';
const moodCol=j=>j>50?'#9cc552':j>30?'#e0b04a':'#e5766a';
const say=(a,t,d=3)=>{try{saySomething(a,t,d)}catch(e){}};

/* ---------- finding the realms once the world stands ---------- */
function init(){for(const R of REALMS)setupRealm(R);KG.ready=true;refreshBtn()}
/* Noordheim is only built when you first go there, so Ysdal is set up later */
function setupRealm(R){if(R.throne)return;const r=actors.find(a=>a.kind==='npc'&&a.job==='lord'&&R.find(a));if(!r)return;
  R.throne={x:r.x,z:r.z,rot:r.rot};R.orig=r;setRuler(R,r,R.rulerName);r.hp=r.hpMax=R.hp;r.dmg=R.dmg||42;
  for(const a of actors)if(a.kind==='npc'&&a!==r&&!a.realm&&(!!a.cave===!!R.cave)&&inArea(R,(a.spawn||a).x,(a.spawn||a).z))a.realm=R.id;
  const st=S(R);
  if(hasItem(R.old)){for(const k of SLOTS)if(PL.eq[k]===R.old)PL.eq[k]=null;takeItem(R.old,PL.inv[R.old]);giveItem(R.crown,1,true);if(st.mine){PL.eq.seal=R.crown}}
  if(st.dead&&R.orig){hideActor(R.orig);R.ruler=null}
  if(st.heir&&!st.mine){const a=spawnNPC('lord',R.throne.x,R.throne.z,{name:st.heir,ai:'stay',cave:!!R.cave});a.realm=R.id;a.rot=R.throne.rot;setRuler(R,a,st.heir);a.hp=a.hpMax=700}
  for(const b of st.bought||[])buyKnight(R,b,true);
  if(st.mine&&!hasItem(R.crown))giveItem(R.crown,1,true);
  if(st.dead&&!st.mine&&!st.heir&&!hasItem(R.crown))makePickup(R.throne.x+1,R.throne.z+1,R.crown,1)}
setInterval(()=>{if(KG.ready)for(const R of REALMS)if(!R.throne)try{setupRealm(R)}catch(e){console.warn('kingdom',e)}},2000);
function setRuler(R,a,name){R.ruler=a;a.ruler=R.id;a.realm=R.id;a.guard=true;a.ai='stay';a.questOk=a.questOk??true;if(name)a.name=name}
function hideActor(a){a.dead=true;a.gone=true;a.respawn=1e12;a.deadT=1e9;if(a.root)a.root.visible=false}

/* ---------- making it clear: a card in the middle of the screen, a beam of light over a fallen seal ---------- */
const cardEl=document.createElement('div');cardEl.id='kgcard';cardEl.className='panel';
cardEl.style.cssText='position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:27;width:min(560px,calc(100vw - 32px));padding:16px 20px;text-align:center;display:none;pointer-events:auto;border-color:#e0b04a;box-shadow:0 0 40px rgba(224,176,74,.35)';
document.body.appendChild(cardEl);cardEl.addEventListener('mousedown',e=>e.stopPropagation());cardEl.addEventListener('pointerdown',e=>e.stopPropagation());let cardT=null;
function card(title,text,btns,secs){clearTimeout(cardT);cardEl.innerHTML='<div style="font-family:var(--f-display);font-size:28px;color:#ffd27a;margin-bottom:6px">'+esc(title)+'</div><div style="font-size:15px;line-height:1.4;color:var(--parch)">'+esc(text)+'</div>'+(btns?'<div style="margin-top:12px">'+btns.map((b,i)=>'<button class="btn'+(i?'':' pri')+'" data-i="'+i+'">'+esc(b[0])+'</button>').join('')+'</div>':'');
  cardEl.style.display='block';if(btns)cardEl.querySelectorAll('button').forEach(b=>b.onclick=()=>{cardEl.style.display='none';btns[+b.dataset.i][1]()});else cardT=setTimeout(()=>cardEl.style.display='none',(secs||7)*1000);
  if(!btns)cardEl.onclick=()=>cardEl.style.display='none';else cardEl.onclick=null}
KG.card=card;
const BEAMS=[];
function beam(R,x,z){const m=new T.Mesh(new T.CylinderGeometry(.6,.6,60,12,1,true),new T.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.45,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));m.position.set(x,groundH(x,z)+30,z);scene.add(m);BEAMS.push({m,id:R.crown})}
setInterval(()=>{for(let i=BEAMS.length-1;i>=0;i--){const b=BEAMS[i];if(!pickups.some(p=>p.id===b.id&&!p.taken&&!p.dead)){scene.remove(b.m);BEAMS.splice(i,1)}else b.m.material.opacity=.3+.2*Math.sin(performance.now()*.004)}},250);
const _gi=giveItem;giveItem=function(id,n,quiet){const r=_gi(id,n,quiet);const it=ITEMS[id];
  if(it&&it.realm&&!quiet&&KG.ready){const R=RB[it.realm];if(R&&!mine(R))setTimeout(()=>card('⚜ '+it.n,'Dit is het teken van de macht over '+R.desc+'. Doe het aan in je uitrusting, in het vak Heerschap, en je wordt '+R.title[fem()?1:0].toLowerCase()+' van '+R.name+'.',[['Nu aandoen',()=>equipItem(id)],['Later',()=>{}]]),300)}
  return r};

/* ---------- the guards of your realm are yours ---------- */
const _htp=hostileToPlayer;hostileToPlayer=function(a){const R=realmOfActor(a);if(R&&mine(R)&&!R.revolt&&a!==R.ruler)return false;if(R&&a.guard&&atWar(R))return true;return _htp(a)};

/* ---------- the fall of a ruler, and fallen knights ---------- */
const _ka=killActor;killActor=function(a,byPlayer){const R=realmOfActor(a);const foe=byPlayer&&R&&a.kind==='npc'&&a.guard&&atWar(R);let keep=null;if(foe){keep=[PL.rep,PL.bounty,addLog];addLog=()=>{}}
  try{_ka(a,byPlayer)}finally{if(keep){PL.rep=keep[0];PL.bounty=keep[1];addLog=keep[2];const xp=R.ruler===a?800:R.great?45:30;setTimeout(()=>giveXp(xp),0)}}if(!R)return;
  if(R.ruler===a){a.respawn=1e12;a.gone=true;R.ruler=null;const st=S(R);st.dead=true;st.heir=null;
    if(!byPlayer&&atWar(R)&&actors.some(k=>k.realm&&RB[k.realm]&&mine(RB[k.realm])&&k.guard&&!k.dead&&Math.hypot(k.x-a.x,k.z-a.z)<45)){giveItem(R.crown,1,true);sfx('level');
      card('⚔ '+R.name+' is veroverd!','Je leger heeft '+a.name+' verslagen. Je ridders brengen je het '+ITEMS[R.crown].n+'. Doe het aan (vak Heerschap) en '+R.name+' is van jou, met al zijn soldaten!',[['Nu aandoen',()=>equipItem(R.crown)],['Later',()=>{}]]);
      addLog('⚔ Je leger heeft '+R.name+' veroverd! Het '+ITEMS[R.crown].n+' is naar je gebracht.','#ffd27a');for(const g of knights(R)){g.angry=true;g.angryT=90}save()}
    else{makePickup(a.x,a.z,R.crown,1);beam(R,a.x,a.z);card('⚜ '+a.name+' is gevallen','Het '+ITEMS[R.crown].n+' ligt op de grond, waar de gouden lichtstraal is. Raap het op en doe het aan in je uitrusting (vak Heerschap) om over '+R.name+' te heersen.',null,9);
    addLog(a.name+' is gevallen! '+ITEMS[R.crown].n+' ligt op de grond. Raap het op en doe het aan (uitrusting, vak Heerschap) om over '+R.name+' te heersen.','#e0b04a');sfx('level');
    for(const g of knights(R)){g.angry=true;g.angryT=90}save()}}
  else if(a.bought){a.respawn=1e12;a.gone=true;const st=S(R);st.bought=(st.bought||[]).filter(b=>b.n!==a.name);addLog(a.name+' is gesneuveld.','#e5766a');save()}
  if(KG.spec&&KG.spec.a===a)setTimeout(()=>specNext(1),1500)};
const _rv=reviveActor;reviveActor=function(a){if(a.gone)return;_rv(a);if(a.order){a.order=null;restorePost(a)}};

/* ---------- putting on a seal ---------- */
const _eq=equipItem;equipItem=function(id){_eq(id);const it=ITEMS[id];if(it&&it.realm&&SLOTS.some(k=>PL.eq[k]===id))crownMe(RB[it.realm])};
function crownMe(R){const st=S(R);if(st.mine)return;
  if(R.ruler&&!R.ruler.dead){addLog('Zolang '+R.ruler.name+' leeft, aanvaardt niemand je als heerser.','#e5766a');return}
  st.mine=true;st.dead=true;st.heir=null;st.joy=Math.max(30,Math.min(st.joy??55,60));R.revolt=false;PL.bounty=0;delete WARS()[R.id];for(const g of knights(R))if(g.raid){g.raid=null;restorePost(g)}
  for(const g of knights(R)){g.angry=false;g.angryT=0;g.warned=false;say(g,R.title[fem()?1:0]==='Koningin'?'Mijn koningin!':'Mijn heer!',4)}
  for(const c of citizens(R))if(Math.hypot(c.x-PL.x,c.z-PL.z)<80)say(c,pick(['Lang leve '+myTitle(R)+'!','Een nieuwe heerser!','Wat gaat er nu met ons gebeuren?']),4);
  ceremony();sfx('level');addLog('Je bent nu '+myTitle(R)+' van '+R.name+'! Druk U (of tik op ⚜) voor je rijk.','#ffd27a');card(R.title[fem()?1:0]+' van '+R.name,'Je heerst nu over '+R.desc+'. De wachters en ridders luisteren naar jou, en de belasting komt in jouw schatkist. Houd het volk tevreden! Druk U (of tik op ⚜ Mijn rijk) om je rijk te besturen.',null,10);
  floatText(PL.x,PL.y+2.6,PL.z,'Lang leve '+myTitle(R)+'!','#ffd27a');refreshBtn();save()}
function ceremony(){try{window.playSound&&playSound('gong',.7)}catch(e){}const g=new T.Group();const m=new T.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  const c=new T.Mesh(new T.CylinderGeometry(1.4,1.4,40,24,1,true),m);c.position.y=20;g.add(c);const rg=new T.Mesh(new T.RingGeometry(.5,1.6,32),m.clone());rg.rotation.x=-Math.PI/2;rg.position.y=.1;g.add(rg);
  g.position.set(PL.x,PL.y,PL.z);scene.add(g);let t=0;const f=()=>{t+=.016;c.material.opacity=.55*(1-t/3);rg.scale.setScalar(1+t*4);rg.material.opacity=.6*(1-t/3);if(t<3)requestAnimationFrame(f);else scene.remove(g)};f()}

/* ---------- losing or giving away the seal ---------- */
function promote(R,a,how){const st=S(R);st.mine=false;R.revolt=how==='revolt';
  if(hasItem(R.crown))takeItem(R.crown,1);
  if(how==='revolt'){for(const g of knights(R)){g.angry=true;g.angryT=120;g.order=null;restorePost(g)}}
  else for(const g of knights(R)){g.order=null;restorePost(g)}
  const title=R.title[(a.look&&a.look.fem)||/a$|e$/.test(a.name)?1:0];const name=(how==='revolt'?'Volksleider ':title+' ')+a.name.replace(/^(Volksleider|Koning|Koningin|Vorst|Vorstin|Jarl|Burgemeester) /,'');
  setRuler(R,a,name);a.hp=a.hpMax=700;a.dmg=30;a.order={t:'throne'};st.heir=a.name;st.dead=true;
  try{if(a.h&&a.h.headA&&window.buildHat&&!a.crowned){a.crowned=1;const hat=buildHat('crown',0xe0b04a,!!(a.look&&a.look.fem),true);if(hat)a.h.headA.add(hat)}}catch(e){}
  refreshBtn();save()}
function handOver(R,a){promote(R,a,'gift');giveRep(25,'je gaf je zegel aan het volk');closeModals();sfx('level');
  addLog(a.name+' is de nieuwe heerser van '+R.name+'. Het volk juicht!','#ffd27a');for(const c of citizens(R))if(Math.hypot(c.x-a.x,c.z-a.z)<60)say(c,'Lang leve '+a.name+'!',4)}
function revolt(R){const pool=citizens(R).filter(c=>!c.shop);const a=pool.length?pick(pool):null;endProtest(R,null);
  if(a)promote(R,a,'revolt');else{const st=S(R);st.mine=false;if(hasItem(R.crown))takeItem(R.crown,1);R.revolt=true;for(const g of knights(R)){g.angry=true;g.angryT=120}}
  giveRep(-20,'het volk kwam in opstand');sfx('hurt');addLog('Het volk van '+R.name+' is in opstand gekomen! Je bent afgezet en de wachters keren zich tegen je.','#e5766a');refreshBtn()}

/* ---------- knights: buying, orders, following, marching ---------- */
const LIVERY={eik:0x7a1f2a,zib:0x2f4a7a,zh:0x2a6a6a,ysd:0x3a4a5a};
/* realms from other scripts (the six realms of the new land) */
KG.realm=id=>RB[id];KG.isMine=id=>!!(RB[id]&&RB[id].throne&&mine(RB[id]));
/* for the homecoming (eikendal-thuiskomst.js): which realm you are in, what it thinks of you, its people */
KG.realms=REALMS;KG.inArea=inArea;KG.rel=id=>rel(RB[id]);KG.addRel=(id,n)=>addRel(RB[id],n);KG.state=id=>S(RB[id]);KG.citizens=id=>citizens(RB[id]);KG.knights=id=>knights(RB[id]);KG.title=id=>myTitle(RB[id]);
KG.addRealm=R=>{if(RB[R.id])return;REALMS.push(R);RB[R.id]=R;LIVERY[R.id]=R.col||0x5a4a3a;if(KG.ready)try{setupRealm(R)}catch(e){}};
function buyKnight(R,b,silent){const t=R.throne,an=Math.random()*6.283,x=t.x+Math.cos(an)*6,z=t.z+Math.sin(an)*6;
  const a=spawnNPC('guard',x,z,{name:b.n,ai:'guard',livery:LIVERY[R.id],cave:!!R.cave,patrol:ring(x,z,6)});a.realm=R.id;a.bought=true;
  if(b.k==='ridder'){a.hp=a.hpMax=240;a.dmg=26;a.speed=4.2;try{setHeld(a.h,'sword_knight','shield_knight')}catch(e){}}
  savePost(a);if(!silent){say(a,'Tot uw dienst, '+myTitle(R)+'!',4);sfx('coin')}return a}
const ring=(x,z,r)=>[0,1,2,3].map(i=>[x+Math.cos(i*1.57)*r,z+Math.sin(i*1.57)*r]);
function savePost(a){if(!a.post)a.post={ai:a.ai,patrol:a.patrol,x:a.spawn.x,z:a.spawn.z}}
function restorePost(a){if(!a.post)return;a.ai=a.post.ai;a.patrol=a.post.patrol;a.wp=null}
let sayN=0,sayT=0;function order(a,o){savePost(a);a.order=o;a.wp=null;a.stuck=0;a.nav=null;a._wd=null;
  if(performance.now()-sayT>500){sayT=performance.now();sayN=0}if(sayN++>4)return;say(a,o.t==='follow'?'Ik volg u!':o.t==='post'?'Terug naar mijn post.':o.t==='hold'?'Ik wacht hier.':'Op weg naar '+o.label+'!',3)}
/* the castle has walls: knights inside it walk out through the gate first (and come back in through it) */
const CASTLE={x:-330,z:240,r:64,gate:[-272,240]};
const inCastle=(x,z)=>Math.hypot(x-CASTLE.x,z-CASTLE.z)<CASTLE.r;
const via=(a,tx,tz)=>inCastle(a.x,a.z)!==inCastle(tx,tz)?[...CASTLE.gate]:null;
/* formations are squares: as many columns as rows */
function slot(i,n,gap=1.9){const c=Math.max(1,Math.ceil(Math.sqrt(n))),r=Math.ceil(n/c);return[(i%c-(c-1)/2)*gap,(Math.floor(i/c)-(r-1)/2)*gap]}
function sendTo(a,dest,i=0,n=1){const [dx,dz]=slot(i,n);order(a,{t:'goto',x:dest.x+dx,z:dest.z+dz,label:dest.label});a.order.via=via(a,a.order.x,a.order.z);a.order.route=routeVia(a.x,a.z,a.order.x,a.order.z)}
/* every knight of every realm you rule */
function allKnights(){const L=[];for(const R of REALMS)if(R.throne&&mine(R))for(const k of knights(R))L.push(k);return L}
function command(list,what,dest){if(!list.length){addLog('Je hebt nog geen ridders.');return}
  if(what==='goto'){list.forEach((a,i)=>sendTo(a,dest,i,list.length));addLog(list.length+' ridders op weg naar '+dest.label+'.','#9ad8ff')}
  else{list.forEach(a=>order(a,{t:what}));addLog(list.length+' ridders: '+(what==='follow'?'ze volgen je':what==='post'?'terug naar hun post':'ze wachten')+'.','#9ad8ff')}save()}
KG.command=command;KG.allKnights=allKnights;
/* the follow formation is worked out once per frame for everyone */
const FOL={t:-1,idx:new Map(),n:0};
function folSlot(a){if(FOL.t!==PL.t){FOL.t=PL.t;FOL.idx.clear();let i=0;for(const k of actors)if(k.order&&k.order.t==='follow'&&!k.dead)FOL.idx.set(k,i++);FOL.n=i}return[FOL.idx.get(a)||0,FOL.n]}
const _uN=updateNPC;updateNPC=function(a,dt){
  if(a.prot)return protester(a,dt);
  if(a.lent&&!a.dead&&!a.order)return lentAI(a,dt);
  if(a.raid&&!a.dead&&!a.order)return raider(a,dt);
  const o=a.order;if(!o||a.dead)return _uN(a,dt);
  if(o.t==='throne'){if(stepTo(a,dt,RB[a.realm].throne.x,RB[a.realm].throne.z,2.4,.8)||a.stuck>4){a.x=RB[a.realm].throne.x;a.z=RB[a.realm].throne.z;a.order=null;a.face=RB[a.realm].throne.rot}if(a.h)animHuman(a.h,dt,a.vel,{});return}
  const R=realmOfActor(a);if(!R||!mine(R)){a.order=null;restorePost(a);return _uN(a,dt)}
  if(a.sayT>0){a.sayT-=dt;if(a.sayT<=0)a.say=''}
  if(nearEnemy(a)){return _uN(a,dt)}
  {const T0=o.t==='goto'&&!o.done?(o.via||(o.route&&o.route.length?o.route[0]:null)||[o.x,o.z]):o.t==='post'?(o.via||[a.post.x,a.post.z]):null;if(T0)unstick(a,T0[0],T0[1],dt)}
  if(o.t==='follow'){const [i,n]=folSlot(a),[sx,sz]=slot(i,n),c=Math.max(1,Math.ceil(Math.sqrt(n))),sd=sx,bk=3+(sz+(Math.ceil(n/c)-1)/2*1.9);
    const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot),tx=PL.x-fx*bk+fz*sd,tz=PL.z-fz*bk-fx*sd,d=Math.hypot(tx-a.x,tz-a.z);
    if(d>70&&!(KG.spec&&KG.spec.a===a)){a.x=PL.x-fx*14+fz*sd;a.z=PL.z-fz*14-fx*sd;a.y=groundH(a.x,a.z);a.cave=PL.inCave}
    else{stepTo(a,dt,tx,tz,d>14?6.6:d>5?4.4:2.2,.9);if(a.vel<.2)a.rot+=angDiff(a.rot,PL.rot)*Math.min(1,dt*3);if(d>4)unstick(a,tx,tz,dt)}}
  else if(o.t==='goto'&&!o.done&&o.via){if(stepTo(a,dt,o.via[0],o.via[1],5.2,2)||a.stuck>4){o.via=null;a.stuck=0}}
  else if(o.t==='goto'&&!o.done&&o.route&&o.route.length){const p=o.route[0];if(stepTo(a,dt,p[0],p[1],5.2,5)||Math.hypot(p[0]-a.x,p[1]-a.z)<7){o.route.shift();a.stuck=0;a._wd=null}}
  else if(o.t==='goto'&&!o.done){const arr=stepTo(a,dt,o.x,o.z,5.2,1.4);
    if(a.stuck>3){a.stuck=0;const dx=o.x-a.x,dz=o.z-a.z,l=Math.hypot(dx,dz)||1;for(let k=1;k<=20;k++){const nx=a.x+dx/l*k*2,nz=a.z+dz/l*k*2;if(groundH(nx,nz)>-.5){a.x=nx;a.z=nz;break}}}
    if(arr){o.done=true;a.ai='guard';a.patrol=ring(o.x,o.z,3.5);a.wp=null;if(Math.hypot(PL.x-a.x,PL.z-a.z)<300||(KG.spec&&KG.spec.a===a))addLog(a.name+' is aangekomen bij '+o.label+'.','#9ad8ff')}}
  else if(o.t==='hold'){a.vel=0}
  else if(o.t==='post'){if(o.via===undefined)o.via=via(a,a.post.x,a.post.z);if(o.via){if(stepTo(a,dt,o.via[0],o.via[1],4.6,2)||a.stuck>4){o.via=null;a.stuck=0}}else if(stepTo(a,dt,a.post.x,a.post.z,4.6,1.5)||a.stuck>5){a.order=null;restorePost(a)}}
  else return _uN(a,dt);
  if(a.h)animHuman(a.h,dt,a.vel,{})};

/* a knight that stands still for a few seconds without getting closer (stuck in a doorway, behind a wall or a fence)
   hops to the nearest free spot on the way to where he has to go */
function unstick(a,tx,tz,dt){const d=Math.hypot(tx-a.x,tz-a.z),w=a._wd||(a._wd={best:d,t:0});if(d<w.best-.5){w.best=d;w.t=0;return}if((a.vel||0)>1)return;w.t+=dt;if(w.t<3.5||d<2.5)return;w.t=0;w.best=d;
  const dx=(tx-a.x)/d,dz=(tz-a.z)/d;for(let k=2;k<=Math.min(40,d);k+=1.5){const nx=a.x+dx*k,nz=a.z+dz*k;if(groundH(nx,nz)<-.5)continue;if(!collide({x:nx,z:nz},.55)&&!inBuilding(nx,nz,.8)){a.x=nx;a.z=nz;a.y=groundH(nx,nz);a.nav=null;a.stuck=0;return}}}
/* far from you the game normally freezes actors; your marching knights (and whatever they meet) keep going */
const _uA=updateActors;updateActors=function(dt){_uA(dt);if(!KG.ready)return;const sp=KG.spec&&KG.spec.a;
  for(const a of actors){if(a.dead||a.kind!=='npc'||!(a.order||a.raid||a.lent))continue;const dd=Math.abs(a.x-PL.x)+Math.abs(a.z-PL.z);if(dd<=170)continue;
    updateNPC(a,dt);placeActor(a);a.root.visible=!!sp&&Math.hypot(a.x-sp.x,a.z-sp.z)<140}
  if(anyWar()){warLists();if(WAR.army.length)for(const e of WAR.foes){if(e.raid||e.dead)continue;const dd=Math.abs(e.x-PL.x)+Math.abs(e.z-PL.z);if(dd<=170)continue;let near=false;for(const k of WAR.army)if(Math.abs(k.x-e.x)<35&&Math.abs(k.z-e.z)<35){near=true;break}
    if(near){updateNPC(e,dt);placeActor(e);e.root.visible=!!sp&&Math.hypot(e.x-sp.x,e.z-sp.z)<140}}}
  if(!sp)return;
  /* the one you watch is always shown and always moves, even far from you and without orders */
  if(!sp.dead){const dd=Math.abs(sp.x-PL.x)+Math.abs(sp.z-PL.z);if(dd>170&&!sp.order){updateNPC(sp,dt);placeActor(sp)}sp.root.visible=true;sp.root.traverse(o=>{if(o.isMesh&&o.userData&&o.userData.hiddenByDist){o.visible=true}})}
  for(const e of actors){if(e.dead||e===sp)continue;const dd=Math.abs(e.x-PL.x)+Math.abs(e.z-PL.z),ds=Math.hypot(e.x-sp.x,e.z-sp.z);if(dd<=170||ds>140)continue;
    e.root.visible=true;if(e.order)continue;
    if(e.kind==='enemy'){let k=null,kd=18;for(const g of actors)if(g.realm&&g.guard&&!g.dead&&g.order){const d=Math.hypot(g.x-e.x,g.z-e.z);if(d<kd){kd=d;k=g}}
      if(k){meleeAI(e,dt,k.x,k.z,kd,()=>hitActor(k,(e.dmg||8)*(.85+Math.random()*.3),false));if(e.h)animHuman(e.h,dt,e.vel,{});else if(e.model)animHorse(e.model,dt,e.vel)}else updateEnemy(e,dt)}
    else if(e.kind==='npc')updateNPC(e,dt);else if(e.kind==='animal'&&typeof updateAnimal==='function')updateAnimal(e,dt);
    placeActor(e)}};

/* ---------- watching through a knight's eyes ---------- */
const banner=document.createElement('div');banner.id='kgspec';banner.className='panel';
banner.style.cssText='position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:26;display:none;align-items:center;gap:8px;padding:6px 10px;font-size:14px;pointer-events:auto;white-space:nowrap';
banner.innerHTML='<button class="btn" data-s="-1">◀</button><span id="kgspect"></span><button class="btn" data-s="1">▶</button><button class="btn pri" data-s="0">Stop</button>';
document.body.appendChild(banner);banner.addEventListener('mousedown',e=>e.stopPropagation());banner.addEventListener('pointerdown',e=>e.stopPropagation());
banner.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const s=+b.dataset.s;if(s)specNext(s);else stopSpec()});
function spectate(a){if(!a||a.dead)return;closeModals1();KG.spec={a,cam:null};banner.style.display='flex';specLabel();addLog('Je kijkt mee met '+a.name+'. Esc of Stop om terug te gaan.','#9ad8ff')}
function specList(){const R=realmOfActor(KG.spec.a)||REALMS.find(mine);return R?knights(R):[]}
function specNext(s){if(!KG.spec)return;const L=specList();if(!L.length)return stopSpec();let i=L.indexOf(KG.spec.a);i=(i+s+L.length)%L.length;KG.spec.a=L[i];KG.spec.cam=null;specLabel()}
function stopSpec(){KG.spec=null;banner.style.display='none'}
function specLabel(){const a=KG.spec.a,o=a.order;$('kgspect').textContent='👁 '+a.name+' · '+statusOf(a)}
setInterval(()=>{if(KG.spec)specLabel()},700);
addEventListener('keydown',e=>{if(KG.spec&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();stopSpec()}},true);
const _uc=updateCamera;updateCamera=function(dt){_uc(dt);const S0=KG.spec;if(!S0)return;const a=S0.a;if(a.dead){return}
  const pitch=clamp(PL.pitch,-.5,1),dist=8,tx=a.x,ty=a.y+1.6,tz=a.z,cx=tx-Math.sin(PL.yaw)*dist,cz=tz-Math.cos(PL.yaw)*dist,cy=Math.max(ty+1.2+pitch*4.5,groundH(cx,cz)+1.2);
  const want=new T.Vector3(cx,cy,cz);if(!S0.cam)S0.cam=want.clone();else S0.cam.lerp(want,Math.min(1,dt*5));camera.position.copy(S0.cam);camera.lookAt(tx,ty,tz)};
const _uP=updatePlayer;updatePlayer=function(dt){if(!KG.spec)return _uP(dt);const keep={};for(const k of['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight']){keep[k]=KEYS[k];KEYS[k]=false}
  let err=null;try{_uP(dt)}catch(e){err=e}Object.assign(KEYS,keep);if(err)throw err};
const _dp=damagePlayer;damagePlayer=function(d,src){if(KG.spec&&!PL.dead){stopSpec();addLog('Je wordt aangevallen!','#e5766a')}return _dp(d,src)};
const _cul=updateCulling;updateCulling=function(dt){const a=KG.spec&&KG.spec.a;if(!a)return _cul(dt);const x=PL.x,z=PL.z;PL.x=a.x;PL.z=a.z;try{_cul(dt)}finally{PL.x=x;PL.z=z}};

/* ---------- protests ---------- */
const DEMANDS=[
  {id:'tax',t:'Lagere belasting!',sign:'MINDER BELASTING',chant:['Minder belasting!','Ons geld is op!','Wij zijn geen melkkoe!'],desc:'Zet de belasting op Laag.',ok:R=>S(R).tax===0},
  {id:'bread',t:'Brood voor het volk!',sign:'BROOD!',chant:['Wij hebben honger!','Brood! Brood!','Eten voor de kinderen!'],desc:'Geef 6 brood, of betaal 90 goud aan de bakkers.',pay:90,item:['bread',6]},
  {id:'guards',t:'Meer wachters op straat!',sign:'BESCHERM ONS',chant:['Wij zijn niet veilig!','Waar zijn de ridders?','Bescherm ons!'],desc:'Zorg voor één ridder meer op post in het rijk (koop er een of stuur er een terug).',ok:R=>posted(R)>=R.protest.need},
  {id:'wolves',t:'Verjaag de wolven!',sign:'WEG MET DE WOLVEN',chant:['De wolven eten onze schapen!','Doe iets aan die wolven!'],desc:'Dood 4 wolven.',ok:R=>(PL.kills.wolf||0)>=R.protest.k0+4,noCave:true},
  {id:'feast',t:'Wij willen een feest!',sign:'FEEST!',chant:['Feest! Feest!','Wij werken ons krom!','Muziek en bier!'],desc:'Geef een feest.',ok:R=>(S(R).feastAt||0)>R.protest.t0},
  {id:'well',t:'Herstel de waterput!',sign:'SCHOON WATER',chant:['Wij hebben dorst!','De put is kapot!'],desc:'Betaal 120 goud voor de metselaars.',pay:120},
  {id:'church',t:'Een nieuw dak voor de kerk!',sign:'HET DAK LEKT',chant:['Het regent binnen!','Help de kerk!'],desc:'Betaal 160 goud voor de timmerlui.',pay:160},
  {id:'road',t:'Repareer de weg!',sign:'GATEN IN DE WEG',chant:['Onze karren breken!','Maak de weg!'],desc:'Betaal 110 goud voor de wegwerkers.',pay:110}];
const posted=R=>knights(R).filter(k=>!k.order||k.order.t==='post'||(k.order.done&&inArea(R,k.x,k.z))||(k.order.t==='hold'&&inArea(R,k.x,k.z))).length;
const signTex={};
function makeSign(txt){const tex=signTex[txt]||(signTex[txt]=(()=>{const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');g.fillStyle='#e8dcc0';g.fillRect(0,0,256,128);g.strokeStyle='#5a4028';g.lineWidth=8;g.strokeRect(4,4,248,120);
  g.fillStyle='#8a1f14';g.font='bold 34px sans-serif';g.textAlign='center';g.textBaseline='middle';const w=txt.split(' ');const l1=w.slice(0,Math.ceil(w.length/2)).join(' '),l2=w.slice(Math.ceil(w.length/2)).join(' ');
  if(l2){g.fillText(l1,128,44);g.fillText(l2,128,88)}else g.fillText(l1,128,66);const t=new T.CanvasTexture(c);return t})());
  const s=new T.Group();s.add(new T.Mesh(new T.CylinderGeometry(.025,.025,1.5,6),MAT.wood));s.children[0].position.y=.75;
  const b=new T.Mesh(new T.PlaneGeometry(.8,.4),new T.MeshLambertMaterial({map:tex,side:T.DoubleSide}));b.position.y=1.55;s.add(b);s.position.set(.32,.9,.12);return s}
function startProtest(R){const st=S(R);const pool=DEMANDS.filter(d=>!(d.noCave&&R.cave)&&!(d.id==='tax'&&st.tax===0));const d=pick(pool);
  const cs=citizens(R).filter(c=>!c.shop&&c.ai!=='stay'&&!c.quest);if(cs.length<3)return;cs.sort(()=>Math.random()-.5);const crowd=cs.slice(0,Math.min(8,cs.length));
  const [sx,sz]=R.square(R);R.protest={d,t0:PL.t,until:PL.t+300,crowd,need:posted(R)+1,k0:PL.kills.wolf||0};
  crowd.forEach((c,i)=>{const an=i/crowd.length*6.283;c.prot={x:sx+Math.cos(an)*4.5,z:sz+Math.sin(an)*4.5,cx:sx,cz:sz,R};c.wp=null;c.route=null;c.inHome=false;if(c.root.visible===false)c.root.visible=true;if(!c.sign){c.sign=makeSign(d.sign);c.root.add(c.sign)}});
  addLog('📣 In '+R.name+' protesteren burgers: "'+d.t+'" Open je rijk (U) om te antwoorden.','#ffb86a');sfx('quest')}
function endProtest(R,how){const P=R.protest;if(!P)return;R.protest=null;const st=S(R);
  for(const c of P.crowd){c.prot=null;if(c.sign){c.root.remove(c.sign);c.sign=null}
    if(how==='ok')say(c,pick(['Hoera!','Dank u, '+myTitle(R)+'!','Lang leve '+myTitle(R)+'!']),3);else if(how==='force'){c.state='flee';c.fleeT=6;say(c,'Au! Tirannie!',3)}else if(how==='late')say(c,'Wij worden niet gehoord!',3)}
  if(how==='ok'){st.joy=Math.min(100,st.joy+14);addLog('De burgers van '+R.name+' zijn tevreden. Stemming +14.','#9cc552')}
  else if(how==='force'){st.joy=Math.max(0,st.joy-12);addLog('De wachters jagen de betogers weg. Stemming -12.','#e5766a')}
  else if(how==='late'){st.joy=Math.max(0,st.joy-16);addLog('Niemand antwoordde de betogers in '+R.name+'. Stemming -16.','#e5766a')}
  if(KW.style.display==='block')render()}
function protester(a,dt){const p=a.prot;if(a.sayT>0){a.sayT-=dt;if(a.sayT<=0)a.say=''}
  if(stepTo(a,dt,p.x,p.z,2.4,.7)||a.stuck>4){a.vel=0;a.rot+=angDiff(a.rot,Math.atan2(p.cx-a.x,p.cz-a.z))*Math.min(1,dt*4);a.t-=dt;if(a.t<=0){a.t=rnd(3,7);const R=p.R;if(R.protest)say(a,pick(R.protest.d.chant),2.6)}}
  if(a.sign)a.sign.rotation.z=Math.sin(PL.t*3+a.id)*.12;if(a.h)animHuman(a.h,dt,a.vel,{})}
function answer(R,kind){const P=R.protest;if(!P)return;const d=P.d,st=S(R);
  if(kind==='pay'){if(!spend(R,d.pay))return;endProtest(R,'ok')}
  else if(kind==='item'){if(!hasItem(d.item[0],d.item[1])){addLog('Je hebt niet genoeg '+ITEMS[d.item[0]].n.toLowerCase()+'.','#e5766a');return}takeItem(d.item[0],d.item[1]);endProtest(R,'ok')}
  else if(kind==='tax'){st.tax=0;endProtest(R,'ok')}
  else if(kind==='force')endProtest(R,'force');
  else if(kind==='ignore'){R.protest.until=PL.t;endProtest(R,'late')}
  render()}
function spend(R,n){const st=S(R);if(st.gold>=n){st.gold-=n;return true}if(st.gold+PL.gold>=n){PL.gold-=n-st.gold;st.gold=0;return true}addLog('Niet genoeg goud in de schatkist of je buidel ('+n+' nodig).','#e5766a');return false}

/* ---------- the realm's heartbeat: taxes, mood, protests, lost seals ---------- */
let beat=0;
ANIMS.push(dt=>{if(!KG.ready){if(started&&worldReady&&actors.length>50)try{init()}catch(e){console.warn('kingdom',e)}return}
  if(PL.dead||paused)return;beat+=typeof dt==='number'?dt:.016;if(beat<1)return;const step=beat;beat=0;
  for(const R of REALMS){if(!R.throne)continue;const st=S(R);if(!st.mine){if(R.protest)endProtest(R,null);continue}
    if(!hasItem(R.crown)){st.mine=false;addLog('Je bent de '+ITEMS[R.crown].n.toLowerCase()+' kwijt. '+R.name+' kiest een nieuwe heerser.','#e5766a');const c=citizens(R).filter(x=>!x.shop);if(c.length)promote(R,pick(c),'gift');refreshBtn();continue}
    st.acc=(st.acc||0)+step;
    if(st.acc>=30){st.acc=0;const n=citizens(R).length+4,tx=TAX[st.tax];let inc=Math.round(n*tx.g*(.5+st.joy/100));st.gold+=inc;st.last=inc;if(STW()){const w=Math.round(inc*.1);st.gold-=w;st.wage=(st.wage||0)+w}
      let dj=tx.j+Math.min(.8,posted(R)*.1);let foes=0;for(const e of actors)if(e.kind==='enemy'&&!e.dead&&inArea(R,e.x,e.z))foes++;dj-=Math.min(4,foes*.6);if(R.protest)dj-=.6;
      st.joy=clamp(st.joy+dj,0,100);
      if(st.joy<=0){revolt(R);continue}if(st.joy<15&&Math.random()<.5)addLog('Het volk van '+R.name+' morrt luid. Pas op voor een opstand!','#e5766a')}
    try{stewardTick(R,st,step)}catch(e){console.warn('steward',e)}
    if(R.protest){const P=R.protest;if(P.d.ok&&P.d.ok(R))endProtest(R,'ok');else if(PL.t>P.until)endProtest(R,'late')}
    else{st.nextP=st.nextP||PL.t+120;if(PL.t>st.nextP){st.nextP=PL.t+(st.joy<50?150:260)+Math.random()*180;startProtest(R)}}}
  if(KW.style.display==='block'&&document.activeElement&&document.activeElement.tagName!=='SELECT')render()});

/* ---------- the royal panel ---------- */
const KW=document.createElement('div');KW.id='kingw';KW.className='modal panel';KW.style.width='min(900px,calc(100vw - 20px))';document.body.appendChild(KW);
const st2=document.createElement('style');st2.textContent=`#kingw h3{font-size:16px;margin:10px 0 4px}#kingw .kr{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid rgba(107,91,58,.35);font-size:13px}
#kingw .kr b{font-weight:500;color:var(--parch)}#kingw .btn{padding:4px 9px;font-size:13px;margin:2px}#kingw .kl{max-height:min(330px,calc(100vh - 230px));overflow:auto;touch-action:pan-y}
#kingw .kp{border:1px solid #c0703a;background:rgba(160,70,20,.18);padding:6px 8px;border-radius:4px;margin:6px 0;font-size:13px}#kingw select{background:#2a2016;color:var(--parch);border:1px solid #6b5b3a;padding:4px;font:inherit;font-size:13px;max-width:220px}
#kgbtn{position:fixed;left:max(12px,env(safe-area-inset-left,0px));top:calc(112px + env(safe-area-inset-top,0px));z-index:16;display:none;pointer-events:auto;font-size:15px;padding:6px 12px}
body.touch #kgbtn{top:calc(80px + env(safe-area-inset-top,0px));font-size:20px;padding:6px 10px}`;document.body.appendChild(st2);
const kbtn=document.createElement('button');kbtn.id='kgbtn';kbtn.className='btn pri';kbtn.innerHTML='⚜ Mijn rijk <kbd style="font-size:11px">U</kbd>';document.body.appendChild(kbtn);
kbtn.addEventListener('mousedown',e=>e.stopPropagation());kbtn.addEventListener('pointerdown',e=>e.stopPropagation());kbtn.addEventListener('click',()=>toggle());
function refreshBtn(){const M=REALMS.filter(R=>R.throne&&mine(R));kbtn.style.display=M.length&&started?'block':'none';const t=M.length>2?(PL.fx&&PL.fx.emperor?(fem()?'Keizerin':'Keizer')+' van het Grote Rijk':'Heerser van '+M.length+' rijken'):M.map(R=>R.title[fem()?1:0]+' van '+R.name).join(' · ');if(kbtn.dataset.t!==t){kbtn.dataset.t=t;kbtn.innerHTML='⚜ '+(t||'Mijn rijk')+' <kbd style="font-size:11px">U</kbd>'}}
setInterval(()=>{refreshBtn();if(document.body.classList.contains('cine'))kbtn.style.display='none'},1000);
let cur=null;
function toggle(){if(KW.style.display==='block'){KW.style.display='none';if(started&&!PL.dead)lock();return}const M=REALMS.filter(R=>R.throne&&mine(R));if(!M.length){addLog('Je bent nog geen heerser. Versla een heerser, raap zijn zegel op en doe het aan (vak Heerschap).');return}
  if(!cur||!mine(cur))cur=M[0];closeModals1();render();KW.style.display='block';try{document.exitPointerLock()}catch(e){}}
addEventListener('keydown',e=>{if(e.code!=='KeyU'||!started||PL.dead||(e.target&&e.target.tagName==='INPUT'))return;if(anyModal()&&KW.style.display!=='block')return;toggle()});
const _am=anyModal;anyModal=function(){return _am()||KW.style.display==='block'};
const _cm1=closeModals1;closeModals1=function(){KW.style.display='none';return _cm1()};
const _cm=closeModals;closeModals=function(){KW.style.display='none';return _cm()};
function dests(R){const o=[['here','Waar ik nu sta']];if(R.cave)return o;for(const s of SITES)if(s.id!=='bridge')o.push([s.id,s.name]);return o}
function destOf(R,v){if(v==='here')return{x:PL.x,z:PL.z,label:'jouw plek'};const s=SITES.find(s=>s.id===v);return s?{x:s.x,z:s.z,label:s.name}:null}
function statusOf(a){const o=a.order;if(a.dead)return'gesneuveld';if(!o)return'op post';if(o.t==='follow')return'volgt jou';if(o.t==='hold')return'wacht';if(o.t==='post')return'terug naar post';if(o.t==='goto')return(o.done?'bewaakt ':'onderweg naar ')+o.label;return''}
/* the barracks: room for 30 at first, 15 more with every upgrade, up to 150 */
const MAXB=8,capOf=R=>Math.max(30,knights(R).filter(k=>!k.bought).length+10)+(S(R).barracks||0)*15,barCost=l=>400*(l+1);
function render(){const M=REALMS.filter(R=>R.throne&&mine(R));if(!M.length){KW.style.display='none';return}if(!cur||!mine(cur))cur=M[0];const R=cur,st=S(R),ks=knights(R),cs=citizens(R),P=R.protest;
  const keepDest=(KW.querySelector('#kgdest')||{}).value||'here';
  let h='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 style="margin:0">♔ '+esc(R.name)+'</h2><div>'+(M.length>1?M.map(m=>'<button class="btn'+(m===R?' pri':'')+'" data-k="realm" data-v="'+m.id+'">'+esc(m.name)+'</button>').join(''):'')+'<button class="btn" data-k="close">Sluiten</button></div></div>';
  h+='<div class="cols"><div>';
  {const sw=STW();h+='<div class="kp" style="border-color:#7ab0e0;background:rgba(90,140,200,.12)">'+(sw?'<b>🧑‍💼 '+esc(sw.name)+'</b> bestuurt al je rijken terwijl jij op avontuur bent. Hij krijgt een tiende van de belasting'+(sw.wage?' (tot nu toe '+sw.wage+' goud)':'')+'. <button class="btn" data-k="stw" data-v="0">Ontsla</button>':'<b>🧑‍💼 Rentmeester</b>: huur iemand die al het werk doet (protesten, belasting, feesten, ridders kopen, je rijk verdedigen). Jij houdt het bevel over je ridders. <button class="btn pri" data-k="stw" data-v="1">Huur (300 goud)</button>')+'</div>'}
  h+='<div class="kr"><span>Heerser</span><b>'+esc(myTitle(R))+'</b></div>';
  h+='<div class="kr"><span>Schatkist</span><b>'+Math.floor(st.gold)+' goud</b><span><button class="btn" data-k="take">Neem 100</button><button class="btn" data-k="give">Stort 100</button></span></div>';
  h+='<div class="kr"><span>Belasting</span><span>'+TAX.map((t,i)=>'<button class="btn'+(st.tax===i?' pri':'')+'" data-k="tax" data-v="'+i+'">'+t.n+'</button>').join('')+'</span></div>';
  h+='<div class="kr"><span>Stemming van het volk</span><b style="color:'+moodCol(st.joy)+'">'+moodTxt(st.joy)+' ('+Math.round(st.joy)+'%)</b></div><div class="bar" style="margin:3px 0 6px"><i style="width:'+st.joy+'%;background:'+moodCol(st.joy)+'"></i></div>';
  h+='<div class="kr"><span>Inkomsten</span><b>'+(st.last!=null?'+'+st.last+' goud per halve minuut':'volgt zo')+'</b></div><div class="kr"><span>Burgers · ridders op post</span><b>'+cs.length+' · '+posted(R)+'</b></div>';
  if(P){const left=Math.max(0,Math.ceil(P.until-PL.t));h+='<div class="kp"><b>📣 Protest: '+esc(P.d.t)+'</b><br>'+esc(P.d.desc)+' Nog '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0')+'.<br>';
    if(P.d.pay)h+='<button class="btn pri" data-k="ans" data-v="pay">Betaal '+P.d.pay+' goud</button>';if(P.d.item)h+='<button class="btn pri" data-k="ans" data-v="item">Geef '+P.d.item[1]+' '+esc(ITEMS[P.d.item[0]].n.toLowerCase())+'</button>';
    if(P.d.id==='tax')h+='<button class="btn pri" data-k="ans" data-v="tax">Zet de belasting op Laag</button>';
    h+='<button class="btn" data-k="ans" data-v="force">Stuur de wachters (−12)</button><button class="btn" data-k="ans" data-v="ignore">Negeer (−16)</button></div>'}
  else h+='<div class="kr"><span>Geen protest</span><span style="color:var(--mute)">het volk is rustig</span></div>';
  h+='<h3>Besluiten</h3><button class="btn" data-k="feast">🎉 Geef een feest (150)</button><button class="btn" data-k="bread">🍞 Deel brood uit (60)</button><button class="btn" data-k="pardon">⚖ Algemeen pardon (80)</button>';
  {const lvl=st.barracks||0,cap=capOf(R);h+='<div class="kr"><span>Kazerne · niveau '+(lvl+1)+'</span><b>'+ks.length+' / '+cap+' ridders en wachters</b></div>';
    h+='<button class="btn pri" data-k="buy" data-v="wachter">Koop wachter (120)</button><button class="btn pri" data-k="buy" data-v="ridder">Koop ridder (260)</button>';
    if(lvl<MAXB)h+='<button class="btn" data-k="barracks">🏰 Kazerne uitbreiden: +15 plaatsen ('+barCost(lvl)+')</button>';else h+='<span style="font-size:12px;color:var(--mute)"> De kazerne is op zijn grootst.</span>'}
  h+='<p style="font-size:12px;color:var(--mute);margin-top:8px">Wil je je zegel aan iemand anders geven? Praat met een burger van '+esc(R.name)+' en kies "Geef je zegel". Raak je het zegel kwijt of komt het volk in opstand, dan ben je je rijk kwijt.</p>';
  h+=warRows();
  h+='</div><div><h3>Ridders en wachters ('+ks.length+')</h3>';
  {const tot=allKnights().length;h+='<div class="kp" style="border-color:#e0b04a;background:rgba(224,176,74,.1)"><b>Alle ridders van '+(M.length>1?'al je '+M.length+' rijken':'je rijk')+' ('+tot+')</b><br>'+
    '<button class="btn pri" data-k="every" data-v="follow">Volg mij</button><button class="btn pri" data-k="every" data-v="here">Kom naar mij</button><button class="btn" data-k="every" data-v="post">Naar hun post</button><button class="btn" data-k="aim">📍 Wijs een plek aan</button>'+
    '<div style="font-size:12px;color:var(--mute)">Of open de kaart (M) en klik op "Stuur ridders" om een plek op de kaart te kiezen.</div></div>'}
  h+='<div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:4px"><select id="kgdest">'+dests(R).map(([v,n])=>'<option value="'+v+'"'+(v===keepDest?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select><button class="btn pri" data-k="all" data-v="goto">Allen erheen</button><button class="btn" data-k="all" data-v="follow">Allen: volg mij</button><button class="btn" data-k="all" data-v="post">Allen naar post</button></div><div class="kl">';
  ks.forEach((a,i)=>{h+='<div class="kr"><span><b>'+esc(a.name)+'</b> <span style="color:var(--mute)">♥'+Math.ceil(a.hp)+' · '+esc(statusOf(a))+'</span></span><span style="white-space:nowrap"><button class="btn" data-k="one" data-v="goto" data-i="'+i+'">Stuur</button><button class="btn" data-k="one" data-v="follow" data-i="'+i+'">Volg</button><button class="btn" data-k="one" data-v="post" data-i="'+i+'">Post</button><button class="btn" data-k="one" data-v="spec" data-i="'+i+'">👁</button></span></div>'});
  if(!ks.length)h+='<p style="color:var(--mute)">Je hebt nog geen ridders. Koop er een.</p>';
  h+='</div></div></div>';KW.innerHTML=h;KW._ks=ks}
KW.addEventListener('mousedown',e=>e.stopPropagation());
KW.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!cur)return;const R=cur,st=S(R),k=b.dataset.k,v=b.dataset.v,ks=KW._ks||[];
  if(k==='close'){toggle();return}
  if(k==='realm'){cur=RB[v]}
  else if(k==='take'){const n=Math.min(100,Math.floor(st.gold));st.gold-=n;PL.gold+=n;if(n)sfx('coin')}
  else if(k==='give'){const n=Math.min(100,PL.gold);PL.gold-=n;st.gold+=n}
  else if(k==='tax'){st.tax=+v;addLog('Belasting in '+R.name+': '+TAX[st.tax].n+'.')}
  else if(k==='feast'){if(PL.t-(st.feastAt||-1e9)<240){addLog('Het volk is nog moe van het vorige feest.');return}if(spend(R,150)){st.feastAt=PL.t;st.joy=Math.min(100,st.joy+18);feast(R)}}
  else if(k==='bread'){if(PL.t-(st.breadAt||-1e9)<120){addLog('Er is net nog brood uitgedeeld.');return}if(spend(R,60)){st.breadAt=PL.t;st.joy=Math.min(100,st.joy+9);addLog('De bakkers delen brood uit in '+R.name+'. Stemming +9.','#9cc552')}}
  else if(k==='pardon'){if(spend(R,80)){PL.bounty=0;st.joy=Math.min(100,st.joy+4);for(const g of actors)if(g.realm===R.id)g.angry=false;addLog('Je verleent een algemeen pardon. Alle boetes in '+R.name+' zijn kwijtgescholden.','#9cc552')}}
  else if(k==='barracks'){const lvl=st.barracks||0;if(lvl>=MAXB)return;if(spend(R,barCost(lvl))){st.barracks=lvl+1;addLog('De kazerne van '+R.name+' is uitgebreid: nu plaats voor '+capOf(R)+' ridders en wachters.','#9cc552');sfx('level')}}
  else if(k==='buy'){if(ks.length>=capOf(R)){addLog('De kazerne zit vol ('+ks.length+'/'+capOf(R)+'). Breid hem uit om meer ridders te kunnen kopen.','#e5766a');return}const c=v==='ridder'?260:120;if(spend(R,c)){const n=(v==='ridder'?'Ridder ':'Wachter ')+pick(FIRST);st.bought=st.bought||[];st.bought.push({n,k:v});buyKnight(R,{n,k:v});addLog(n+' is in dienst getreden bij '+R.name+'.','#9cc552')}}
  else if(k==='ans')answer(R,v);
  else if(k==='all'||k==='one'){const list=k==='all'?ks:[ks[+b.dataset.i]].filter(Boolean);
    if(v==='spec'){spectate(list[0]);KW.style.display='none';return}
    const dest=v==='goto'?destOf(R,(KW.querySelector('#kgdest')||{}).value):null;
    if(v==='goto'&&dest)command(list,'goto',dest);else if(v==='follow'||v==='post')command(list,v)}
  else if(k==='every'){if(v==='here')command(allKnights(),'goto',{x:PL.x,z:PL.z,label:'jou'});else command(allKnights(),v)}
  else if(k==='aim'){KW.style.display='none';aimStart();return}
  else if(k==='war'){const E=RB[v];if(!E||!E.throne)return;if(!atWar(E))declareWar(E,'you');const list=allKnights();if(list.length)command(list,'goto',{x:E.throne.x,z:E.throne.z+6,label:E.name});KW.style.display='none';try{lock()}catch(e){}return}
  else if(k==='diplo'){KW.style.display='none';diplo(RB[v]);return}
  else if(k==='stw'){if(v==='1')hireSteward();else fireSteward()}
  else if(k==='peace'){const E=RB[v];if(E&&atWar(E)&&spend(R,peaceCost(E)))makePeace(E,true)}
  else if(k==='defend'){const T=RB[v];if(T){const [sx,sz]=T.square(T);command(allKnights(),'goto',{x:sx,z:sz,label:T.name})}}
  save();render()});
function feast(R){const [sx,sz]=R.square(R);addLog('Feest in '+R.name+'! Stemming +18.','#ffd27a');sfx('level');
  for(const c of citizens(R))if(!c.shop&&Math.hypot(c.x-sx,c.z-sz)<120&&!c.prot){c.wp=[sx+rnd(-8,8),sz+rnd(-8,8)];c.t=25;setTimeout(()=>say(c,pick(['Proost!','Op '+myTitle(R)+'!','Wat een feest!','Nog een liedje!']),3),Math.random()*6000)}
  const g=new T.Group();const cols=[0xffd27a,0xff6a5a,0x7ad0ff,0x9cff7a];for(let i=0;i<60;i++){const m=new T.Mesh(new T.PlaneGeometry(.12,.12),new T.MeshBasicMaterial({color:pick(cols),side:T.DoubleSide}));m.position.set(rnd(-6,6),rnd(3,9),rnd(-6,6));m.userData.v=rnd(.6,1.4);g.add(m)}
  g.position.set(sx,groundH(sx,sz),sz);scene.add(g);let t=0;const f=()=>{t+=.016;for(const m of g.children){m.position.y-=m.userData.v*.016;m.rotation.x+=.1;m.rotation.y+=.07;if(m.position.y<0)m.position.y=9}if(t<10)requestAnimationFrame(f);else scene.remove(g)};f()}
function save(){try{saveGame(false)}catch(e){}}

/* ---------- talking ---------- */
const _gr=greeting;greeting=function(a){const R=realmOfActor(a);if(!R||!mine(R))return _gr(a);const j=S(R).joy,t=myTitle(R);
  if(a.guard)return pick(['Tot uw dienst, '+t+'. Wat zijn uw bevelen?','Majesteit! Alles is rustig.','Uw wil is wet, '+t+'.']);
  return j>75?pick(['Lang leve '+t+'!','Wat een eer, '+t+'!']):j>50?pick(['Majesteit.','Goedendag, '+t+'.']):j>25?pick(['De belasting is zwaar, '+t+'...','We hebben het moeilijk, majesteit.']):pick(['Jij bent geen heerser van ons!','Ga weg, tiran.'])};
const _dm=dlgMain;dlgMain=function(a,text){_dm(a,text);try{extra(a)}catch(e){console.warn('kingdom dlg',e)}};
function extra(a){const box=document.querySelector('#dlg #dopts');if(!box||!KG.ready)return;const R=realmOfActor(a);if(!R)return;
  const add=(lab,fn,pri)=>{const b=document.createElement('button');b.className='btn'+(pri?' pri':'');b.textContent=lab;b.onclick=fn;box.insertBefore(b,box.firstChild)};
  if(a===R.ruler&&!mine(R)&&REALMS.some(Q=>Q.throne&&mine(Q)))add('🤝 Laten we praten als heersers (diplomatie)',()=>{closeModals();diplo(R)},1);
  if(a===R.ruler&&!mine(R)){add('Ik wil zelf heersen over '+R.name+'.',()=>showDlg(a,'Ha! Wie over '+esc(R.name)+' heerst, draagt het '+esc(ITEMS[R.crown].n)+'. Dan zul je het van mijn koude lichaam moeten halen, en het daarna zelf aandoen. Mijn wachters staan klaar.',[['Dan vechten we!',()=>{closeModals();a.angry=true;a.angryT=90;for(const g of knights(R)){g.angry=true;g.angryT=90}say(a,'Wachters! Grijp die verrader!',4)}],['Laat maar',()=>dlgMain(a,'Verstandig. Heel verstandig.')]]));return}
  if(!mine(R))return;
  if(a.guard&&a.job==='guard'){add('👁 Kijk mee',()=>{closeModals();spectate(a)});add('Terug naar je post',()=>{order(a,{t:'post'});closeModals()});add('Wacht hier',()=>{order(a,{t:'hold'});closeModals()});add('Volg mij',()=>{order(a,{t:'follow'});closeModals()},1);return}
  if(a.kind==='npc'&&!a.guard&&a.job!=='lord'){
    if(R.protest&&R.protest.crowd.includes(a))add('Wat willen jullie?',()=>showDlg(a,'"'+esc(R.protest.d.t)+'" '+esc(R.protest.d.desc),[['Ik regel het (open je rijk)',()=>{closeModals();setTimeout(toggle,50)}],['Ga naar huis!',()=>{answer(R,'force');closeModals()}],['Terug',()=>dlgMain(a,'Nog iets, majesteit?')]]));
    add('⚜ Geef je zegel aan '+a.name,()=>showDlg(a,'Wil je echt afstand doen van de troon van '+esc(R.name)+' en '+esc(a.name)+' tot nieuwe heerser maken? Je ridders dienen dan de nieuwe heerser.',[['Ja, '+a.name+' wordt heerser',()=>handOver(R,a),1],['Nee',()=>dlgMain(a,'Zoals u wilt, majesteit.')]]))}}

/* ---------- pointing at a place: in the world, or on the map ---------- */
const aimBar=document.createElement('div');aimBar.className='panel';aimBar.style.cssText='position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:26;display:none;padding:8px 14px;font-size:14px;pointer-events:auto';
aimBar.innerHTML='📍 Klik of tik op de plek waar al je ridders heen moeten. <button class="btn" id="kgaimx">Stop</button>';document.body.appendChild(aimBar);
aimBar.addEventListener('mousedown',e=>e.stopPropagation());aimBar.addEventListener('pointerdown',e=>e.stopPropagation());aimBar.querySelector('#kgaimx').onclick=()=>aimStop();
let aiming=false;function aimStart(){aiming=true;aimBar.style.display='block';try{lock()}catch(e){}}
function aimStop(){aiming=false;aimBar.style.display='none'}
function groundAt(cx,cy){const r=new T.Raycaster();r.setFromCamera({x:cx,y:cy},camera);const o=r.ray.origin,d=r.ray.direction;let prev=0;
  for(let t=1;t<600;t+=1.5){const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t;if(y<=groundH(x,z)){let a=prev,b=t;for(let k=0;k<8;k++){const m=(a+b)/2;if(o.y+d.y*m<=groundH(o.x+d.x*m,o.z+d.z*m))b=m;else a=m}return{x:o.x+d.x*b,z:o.z+d.z*b}}prev=t}return null}
function marker(x,z){const m=new T.Mesh(new T.RingGeometry(1.4,2,32),new T.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,groundH(x,z)+.15,z);scene.add(m);
  let t=0;const f=()=>{t+=.016;m.scale.setScalar(1+t*2);m.material.opacity=.9*(1-t/1.5);if(t<1.5)requestAnimationFrame(f);else scene.remove(m)};f()}
addEventListener('pointerdown',e=>{if(!aiming||!started||anyModal())return;if(e.target.closest&&e.target.closest('button,.panel'))return;e.preventDefault();e.stopImmediatePropagation();
  const locked=!!document.pointerLockElement;const cx=locked?0:(e.clientX/innerWidth)*2-1,cy=locked?0:-(e.clientY/innerHeight)*2+1;const p=groundAt(cx,cy);
  if(!p){addLog('Daar kun je niet heen. Kies een plek op de grond.');return}aimStop();marker(p.x,p.z);command(allKnights(),'goto',{x:p.x,z:p.z,label:'de plek die je aanwees'})},true);
addEventListener('mousedown',e=>{if(aiming)e.stopImmediatePropagation()},true);
addEventListener('keydown',e=>{if(aiming&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();aimStop()}},true);
/* on the map: a button switches "send" on, then a click on the map sends everyone there */
let mapSend=false;
function mapButton(){const w=$('mapw');if(!w||w.querySelector('#kgmapbtn'))return;const h=w.querySelector('h2');if(!h)return;const b=document.createElement('button');b.id='kgmapbtn';b.className='btn';b.style.marginLeft='10px';b.textContent='⚔ Stuur ridders';
  b.onclick=e=>{e.stopPropagation();mapSend=!mapSend;b.className='btn'+(mapSend?' pri':'');b.textContent=mapSend?'⚔ Klik nu op de kaart':'⚔ Stuur ridders'};h.after(b)}
setInterval(()=>{const b=document.getElementById('kgmapbtn');const any=REALMS.some(R=>R.throne&&mine(R));if(any)mapButton();if(b)b.style.display=any&&PL.x>-2000?'':'none'},800);
document.addEventListener('click',e=>{const c=e.target;if(!mapSend||!c||c.id!=='bigmap')return;const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*c.width,py=(e.clientY-r.top)/r.height*c.height,k=c.width/MAPN,x=px/k/MS-HALF,z=py/k/MS-HALF;
  if(terrainH(x,z)<-.5){addLog('Daar is water. Kies een plek op het land.');return}mapSend=false;const b=document.getElementById('kgmapbtn');if(b){b.className='btn';b.textContent='⚔ Stuur ridders'}
  command(allKnights(),'goto',{x,z,label:(siteAt(x,z)||{name:'de plek op de kaart'}).name});closeModals();marker(x,z)});

/* ---------- an empty throne: whoever killed the ruler, the seal appears by the throne ---------- */
setInterval(()=>{if(!KG.ready||!started)return;for(const R of REALMS){if(!R.throne)continue;const st=S(R);if(st.mine)continue;const r=R.ruler;
  if(r&&!r.dead)continue;if(hasItem(R.crown))continue;if(pickups.some(p=>p.id===R.crown&&!p.taken&&!p.dead))continue;
  if(!r||r.dead){st.dead=true;st.heir=null;makePickup(R.throne.x+1,R.throne.z+1,R.crown,1);beam(R,R.throne.x+1,R.throne.z+1);
    addLog('De troon van '+R.name+' is leeg! Het '+ITEMS[R.crown].n+' ligt bij de troon. Raap het op en doe het aan (vak Heerschap).','#e0b04a');save()}}},4000);


/* ---------- a steward runs your realms while you are away on adventures ----------
   Hire one in the royal panel. He answers protests (pays for them from the treasury, or lowers the tax when the
   treasury is empty), keeps the people happy with bread and feasts, sets the tax, buys knights when the treasury is
   full, and sends the knights on post to the square when an enemy army plunders the realm. Knights you gave an order
   keep it: you still command them. He keeps a tenth of the taxes. */
const STW=()=>PL.fx&&PL.fx.steward;
function hireSteward(){if(STW())return;if(PL.gold<300){addLog('Een rentmeester kost 300 goud.','#e5766a');return}PL.gold-=300;PL.fx.steward={name:'Rentmeester '+pick(FIRST),t:PL.t,wage:0};sfx('coin');
  card('🧑‍💼 '+PL.fx.steward.name,'Je rentmeester bestuurt nu al je rijken: hij beantwoordt protesten, houdt het volk tevreden, regelt de belasting, koopt ridders als er genoeg goud is en verdedigt je rijk als het wordt aangevallen. Hij krijgt een tiende van de belasting. Jij kunt je ridders nog altijd zelf oproepen en bevelen geven.',null,12);save()}
function fireSteward(){const s=STW();if(!s)return;PL.fx.steward=null;addLog(s.name+' is ontslagen. Je bestuurt je rijken weer zelf.','#e0b04a');save()}
function stewardTick(R,st,step){const s=STW();if(!s)return;
  /* protests: answer after a few seconds */
  if(R.protest){const P=R.protest,d=P.d;if(!P.stw)P.stw=PL.t+6;if(PL.t>P.stw){P.stw=PL.t+45;
    if(d.id==='tax')answer(R,'tax');
    else if(d.pay&&st.gold>=d.pay)answer(R,'pay');
    else if(d.item&&st.gold>=90){st.gold-=90;endProtest(R,'ok')}
    else if(d.id==='feast'&&st.gold>=150&&PL.t-(st.feastAt||-1e9)>=240){st.gold-=150;st.feastAt=PL.t;st.joy=Math.min(100,st.joy+18);feast(R);endProtest(R,'ok')}
    else if(d.id==='guards'&&st.gold>=260&&knights(R).length<capOf(R)){st.gold-=260;const n='Ridder '+pick(FIRST);st.bought=st.bought||[];st.bought.push({n,k:'ridder'});buyKnight(R,{n,k:'ridder'},true)}
    else if(d.id==='wolves'&&st.gold>=100){st.gold-=100;endProtest(R,'ok')}
    else if(st.tax>0){st.tax--;addLog('🧑‍💼 '+s.name+': de schatkist van '+R.name+' is leeg, dus ik verlaag de belasting.','#9ad8ff')}}}
  R.stwT=(R.stwT||0)+step;if(R.stwT<15)return;R.stwT=0;
  /* the mood and the tax */
  if(st.joy<32&&st.gold>=150&&PL.t-(st.feastAt||-1e9)>=240){st.gold-=150;st.feastAt=PL.t;st.joy=Math.min(100,st.joy+18);feast(R)}
  else if(st.joy<55&&st.gold>=60&&PL.t-(st.breadAt||-1e9)>=120){st.gold-=60;st.breadAt=PL.t;st.joy=Math.min(100,st.joy+9)}
  if(st.joy<28&&st.tax>0)st.tax=0;else if(st.joy>75&&st.tax===0)st.tax=1;
  /* more knights when the treasury is full */
  if(st.gold>1600&&knights(R).length<capOf(R)){st.gold-=260;const n='Ridder '+pick(FIRST);st.bought=st.bought||[];st.bought.push({n,k:'ridder'});buyKnight(R,{n,k:'ridder'},true)}
  /* defence: the knights on post go to the square while enemies plunder it */
  const [sx,sz]=R.square(R),foes=actors.some(a=>a.raid&&!a.raid.home&&!a.dead&&a.raid.R===R.id&&Math.hypot(a.x-sx,a.z-sz)<220);
  if(foes&&!R.stwDef){R.stwDef=true;const L=knights(R).filter(k=>!k.order);L.forEach((k,i)=>{sendTo(k,{x:sx,z:sz,label:R.name},i,L.length);k.stwDef=true});if(L.length)addLog('🧑‍💼 '+s.name+' stuurt '+L.length+' wachters om '+R.name+' te verdedigen!','#9ad8ff')}
  else if(!foes&&R.stwDef){R.stwDef=false;for(const k of knights(R))if(k.stwDef){k.stwDef=false;if(k.order&&k.order.t==='goto')order(k,{t:'post'})}}
  /* now and then a short report */
  s.rep=(s.rep||0)+15;if(s.rep>=300){s.rep=0;const M2=REALMS.filter(Q=>Q.throne&&mine(Q));addLog('🧑‍💼 '+s.name+': '+M2.map(Q=>Q.name+' '+moodTxt(S(Q).joy).toLowerCase()+', '+Math.floor(S(Q).gold)+' goud').join(' · '),'#9ad8ff')}}

/* ---------- war: attack other realms and conquer them; and realms that attack you ----------
   In your royal panel every other realm is listed with its strength. "Val aan" declares war and sends all your knights
   to its throne; they fight every soldier on the way. When your army (or you) defeats the ruler, the seal is yours:
   put it on and the realm, with all its soldiers, serves you. At war, soldiers of that realm attack you on sight, and
   the realm strikes back: now and then it sends an army to plunder your nearest realm. Some realms (above all the
   empires) also declare war on you by themselves once you rule a realm. Peace can be bought in the panel.
   Armies walk through the passes and over the sandbank instead of into the sea. */
const WARS=()=>{PL.fx=PL.fx||{};return PL.fx.wars=PL.fx.wars||{}};
const atWar=R=>!!(R&&R.throne!==undefined&&!mine(R)&&WARS()[R.id]);
const anyWar=()=>{const w=WARS();for(const k in w)return true;return false};
KG.atWar=id=>atWar(RB[id]);
const WAR={t:-1,foes:[],mine:[],army:[]};
function warLists(){if(WAR.t===PL.t)return;WAR.t=PL.t;WAR.foes.length=0;WAR.mine.length=0;WAR.army.length=0;
  for(const a of actors){if(a.dead||a.kind!=='npc'||!a.realm||!a.guard)continue;const R=RB[a.realm];if(!R)continue;
    if(mine(R)||a.lent){WAR.mine.push(a);if(a.order&&Math.abs(a.x-PL.x)+Math.abs(a.z-PL.z)>170)WAR.army.push(a)}else if(atWar(R))WAR.foes.push(a)}}
function warFoe(a){const R=RB[a.realm];if(!R)return null;const me=mine(R)||!!a.lent;if(!me&&!atWar(R))return null;warLists();const L=me?WAR.foes:WAR.mine;let b=null,bd=22;
  for(const e of L){if(e.dead||e===a||Math.abs(e.x-a.x)>22||Math.abs(e.z-a.z)>22)continue;const d=Math.hypot(e.x-a.x,e.z-a.z);if(d<bd){bd=d;b=e}}return b}
/* hitting a soldier of a realm you are at war with is war, not a crime */
const _hA=hitActor;hitActor=function(a,dmg,byPlayer,dir){if(!(byPlayer&&a&&a.kind==='npc'&&a.guard&&a.realm&&atWar(RB[a.realm])))return _hA(a,dmg,byPlayer,dir);
  const rep=PL.rep,b=PL.bounty,al=addLog,calm=actors.filter(g=>g.guard&&!g.dead&&!g.angry&&Math.abs(g.x-a.x)<46&&Math.abs(g.z-a.z)<46);addLog=()=>{};
  try{_hA(a,dmg,byPlayer,dir)}finally{addLog=al;PL.rep=rep;PL.bounty=b;if(!a.dead&&a.state==='flee')a.state=null;for(const g of calm)if(!(g.realm&&atWar(RB[g.realm]))){g.angry=false;g.angryT=0}}};
/* the ways between the old land and the new: armies follow these instead of walking into the sea */
const GATES=[[[620,-30],[860,-30],[1160,-60],[1449,-51]],[[814,545],[1050,590],[1180,650]],[[-198,774],[-130,880],[-10,1110],[72,1250]],[[630,-605],[790,-740],[1000,-900],[1100,-950]]];
const dry=(ax,az,bx,bz)=>{const n=Math.ceil(Math.hypot(bx-ax,bz-az)/25);for(let i=1;i<n;i++){const t=i/n;if(terrainH(ax+(bx-ax)*t,az+(bz-az)*t)<.2)return false}return true};
const isNew=(x,z)=>Math.hypot(x,z)>1120;
function routeVia(sx,sz,tx,tz){if(sx<-2000||tx<-2000||dry(sx,sz,tx,tz))return[];const sN=isNew(sx,sz),tN=isNew(tx,tz),D=(a,b,c,d)=>Math.hypot(a-c,b-d);
  const ends=g=>[g[0],g[g.length-1]];
  if(sN===tN&&!sN)return[];
  if(!sN&&tN){let best=null,bd=1e9;for(const g of GATES){const [o,n]=ends(g),d=D(sx,sz,o[0],o[1])+D(n[0],n[1],tx,tz);if(d<bd){bd=d;best=g}}return best.map(p=>p.slice())}
  if(sN&&!tN){let best=null,bd=1e9;for(const g of GATES){const [o,n]=ends(g),d=D(sx,sz,n[0],n[1])+D(o[0],o[1],tx,tz);if(d<bd){bd=d;best=g}}return best.slice().reverse().map(p=>p.slice())}
  let best=null,bd=1e9;for(const a of GATES)for(const b of GATES){if(a===b)continue;const d=D(sx,sz,a[a.length-1][0],a[a.length-1][1])+D(a[0][0],a[0][1],b[0][0],b[0][1])+D(b[b.length-1][0],b[b.length-1][1],tx,tz);if(d<bd){bd=d;best=[a,b]}}
  return best[0].slice().reverse().concat(best[1]).map(p=>p.slice())}
KG.routeVia=routeVia;
const peaceCost=E=>Math.round(300+knights(E).length*45+(E.great?600:0));
function declareWar(E,by){if(!E||mine(E)||WARS()[E.id])return;WARS()[E.id]={t:PL.t,by};addRel(E,-30);if(by==='you'&&PACT()[E.id]){delete PACT()[E.id];addRel(E,-40);addLog('Je verbreekt je verdrag met '+E.name+'. Andere rijken vertrouwen je minder.','#e5766a')}
  for(const a of actors)if(a.lent&&a.realm===E.id){a.lent=null;homeward(a)}E.raidT=PL.t-(by==='you'?40:140);
  const who=E.ruler&&!E.ruler.dead?E.ruler.name:'De heerser van '+E.name;
  if(by==='you')card('⚔ Oorlog met '+E.name,'Je hebt '+E.desc+' de oorlog verklaard. Zijn soldaten vallen jou en je ridders aan, en '+E.name+' zal terugslaan. Versla '+who+' om het rijk te veroveren!',null,9);
  else card('⚔ '+E.name+' verklaart je de oorlog!',who+' wil je rijk veroveren en stuurt een leger! Verdedig je rijk met je ridders, val zelf aan, of koop vrede in je rijksvenster (U).',[['Open mijn rijk',()=>{if(KW.style.display!=='block')toggle()}],['Sluiten',()=>{}]]);
  addLog('⚔ Oorlog met '+E.name+'!','#e5766a');sfx('quest');refreshBtn();save()}
function makePeace(E,paid){delete WARS()[E.id];REL()[E.id]=Math.max(rel(E),-15);for(const g of knights(E)){g.angry=false;g.angryT=0;g.warned=false;if(g.raid&&!g.raid.home)homeward(g)}if(E.ruler){E.ruler.angry=false;E.ruler.angryT=0}
  addLog('🕊 Vrede met '+E.name+'. Hun soldaten keren terug naar huis.','#9cc552');if(paid)card('🕊 Vrede','Je hebt vrede gesloten met '+E.name+'.',null,6);save()}
function homeward(a){savePost(a);const r=a.raid||(a.raid={});r.home=true;r.arr=false;r.x=a.post.x;r.z=a.post.z;r.route=routeVia(a.x,a.z,r.x,r.z)}
function launchRaid(E){const targets=REALMS.filter(R=>R.throne&&mine(R)&&!R.cave);if(!targets.length||!E.throne)return;
  const T0=targets.reduce((b,R)=>Math.hypot(R.throne.x-E.throne.x,R.throne.z-E.throne.z)<Math.hypot(b.throne.x-E.throne.x,b.throne.z-E.throne.z)?R:b);
  const pool=knights(E).filter(k=>!k.raid&&!k.dead&&!k.cave);if(pool.length<4)return;const n=Math.min(16,Math.max(4,Math.round(pool.length*.4)));
  pool.sort(()=>Math.random()-.5);const party=pool.slice(0,n),[sx,sz]=T0.square(T0);E.raidT=PL.t;
  party.forEach((a,i)=>{const [dx,dz]=slot(i,n,2.2);savePost(a);a.raid={x:sx+dx,z:sz+dz,R:T0.id,from:E.id,arr:false,route:routeVia(a.x,a.z,sx+dx,sz+dz)};a.wp=null;a.nav=null;a.stuck=0;a._wd=null;a.angry=true;a.angryT=1e9});
  card('⚔ '+E.name+' valt je aan!','Een leger van '+n+' soldaten uit '+E.name+' marcheert naar '+T0.name+' om het te plunderen. Stuur je ridders om je rijk te verdedigen!',[['Stuur al mijn ridders',()=>command(allKnights(),'goto',{x:sx,z:sz,label:T0.name})],['Sluiten',()=>{}]]);
  addLog('⚔ Het leger van '+E.name+' ('+n+' soldaten) marcheert naar '+T0.name+'!','#e5766a');sfx('quest')}
function raider(a,dt){const r=a.raid;if(a.sayT>0){a.sayT-=dt;if(a.sayT<=0)a.say=''}
  if(!r.home&&!atWar(RB[r.from]))homeward(a);
  if((!r.home&&hostileToPlayer(a)&&!PL.dead&&Math.hypot(PL.x-a.x,PL.z-a.z)<30)||nearEnemy(a))return _uN(a,dt);
  const anim=()=>{if(a.h)animHuman(a.h,dt,a.vel,{})};
  if(r.route&&r.route.length){const p=r.route[0];if(stepTo(a,dt,p[0],p[1],4.8,5)||Math.hypot(p[0]-a.x,p[1]-a.z)<7){r.route.shift();a._wd=null}else unstick(a,p[0],p[1],dt);anim();return}
  if(r.home){if(stepTo(a,dt,r.x,r.z,4.6,1.5)){a.raid=null;a.angry=false;a.angryT=0;restorePost(a)}else unstick(a,r.x,r.z,dt);anim();return}
  if(!r.arr){if(stepTo(a,dt,r.x,r.z,4.8,1.6)){r.arr=true;a.ai='guard';a.patrol=ring(r.x,r.z,4);a.wp=null;if(!r.said){r.said=1;say(a,pick(['Plunderen!','Voor '+RB[r.from].name+'!','Pak alles!']),3)}}else unstick(a,r.x,r.z,dt);anim();return}
  return _uN(a,dt)}
function warRows(){const L=REALMS.filter(R=>R.throne&&!mine(R));if(!L.length)return'';
  let h='<h3>⚔ Oorlog, vrede en diplomatie</h3><div class="kl" style="max-height:230px">';
  for(const R of L){const n=knights(R).length,w=atWar(R),ru=R.ruler&&!R.ruler.dead?R.ruler.name:'geen heerser',d=Math.round(Math.hypot(R.throne.x-PL.x,R.throne.z-PL.z)),
      pow=n>=40?'zeer machtig':n>=28?'machtig':n>=16?'sterk':'zwak';
    const pc=PACT()[R.id],rv=rel(R);h+='<div class="kr"><span><b>'+esc(R.name)+'</b>'+(w?' <b style="color:#e5766a">OORLOG</b>':pc&&pc.ally?' <b style="color:#9cc552">BONDGENOOT</b>':pc&&pc.until>PL.t?' <b style="color:#9ad8ff">VERDRAG</b>':'')+'<br><span style="color:var(--mute)">'+esc(ru)+' · '+n+' soldaten ('+pow+') · '+d+' m · <span style="color:'+(rv>=25?'#9cc552':rv>-25?'#e0b04a':'#e5766a')+'">'+relTxt(rv)+'</span></span></span><span style="white-space:nowrap"><button class="btn" data-k="diplo" data-v="'+R.id+'">🤝 Gezant</button>'+
      (w?'<button class="btn pri" data-k="war" data-v="'+R.id+'">⚔ Stuur leger</button><button class="btn" data-k="peace" data-v="'+R.id+'">🕊 Vrede ('+peaceCost(R)+')</button>':'<button class="btn pri" data-k="war" data-v="'+R.id+'">⚔ Val aan</button>')+'</span></div>'}
  h+='</div>';
  const raids=REALMS.filter(T=>T.throne&&mine(T)&&actors.some(a=>a.raid&&!a.raid.home&&!a.dead&&a.raid.R===T.id));
  for(const T of raids)h+='<div class="kp"><b>🔥 '+esc(T.name)+' wordt aangevallen!</b> <button class="btn pri" data-k="defend" data-v="'+T.id+'">Stuur al mijn ridders</button></div>';
  return h+'<p style="font-size:12px;color:var(--mute)">Val aan: al je ridders marcheren naar de troon (via de passen en de Zandbank). Verslaan jij of je leger de heerser, dan krijg je het zegel: doe het aan en het rijk is van jou, met al zijn soldaten. Hoe groter je leger, hoe beter: de keizerrijken zijn heel sterk.</p>'}

/* ---------- diplomacy: send an envoy, make peace, ask things ----------
   Every realm has a relation with you (from "Haat je" to "Bondgenoot"). Gifts make it better, war makes it worse.
   Through your envoy (the 🤝 button in the royal panel, or by talking to a ruler) you can ask for peace, sign a peace
   treaty (they will not attack you for a long time), become allies, ask for gold, or borrow soldiers who follow you
   on your adventures for a while. Their answer depends on the relation and on how strong your army is. */
const REL=()=>{PL.fx=PL.fx||{};return PL.fx.rel=PL.fx.rel||{}};
const rel=R=>REL()[R.id]||0,addRel=(R,n)=>{REL()[R.id]=clamp(rel(R)+n,-100,100)};
const PACT=()=>{PL.fx=PL.fx||{};return PL.fx.pact=PL.fx.pact||{}};
const relTxt=v=>v>=60?'Bondgenoot':v>=25?'Vriendelijk':v>-25?'Neutraal':v>-60?'Vijandig':'Haat je';
const asked=(E,k,cd)=>{E.ask=E.ask||{};if(PL.t-(E.ask[k]||-1e9)<cd){return Math.ceil((cd-(PL.t-E.ask[k]))/60)}E.ask[k]=PL.t;return 0};
function myPurse(n){const Q=REALMS.find(R=>R.throne&&mine(R));return Q?spend(Q,n):(PL.gold>=n?(PL.gold-=n,true):false)}
function diplo(E){if(!E||!E.throne||mine(E))return;const w=atWar(E),r=rel(E),p=PACT()[E.id],me=allKnights().length,them=knights(E).length,who=E.ruler&&!E.ruler.dead?E.ruler.name:'De raad van '+E.name;
  const txt=who+' ontvangt je gezant. Relatie: '+relTxt(r)+' ('+Math.round(r)+'). '+(w?'Jullie zijn in oorlog. ':p&&p.ally?'Jullie zijn bondgenoten. ':p&&p.until>PL.t?'Er is een vredesverdrag (nog '+Math.ceil((p.until-PL.t)/60)+' min). ':'')+'Jouw leger: '+me+' ridders. Het leger van '+E.name+': '+them+' soldaten.';
  const b=[];
  if(w){b.push(['🕊 Vraag om vrede',()=>askPeace(E)]);b.push(['🎁 Geschenk (200)',()=>gift(E)])}
  else{b.push(['🎁 Geschenk (200)',()=>gift(E)]);if(!(p&&(p.ally||p.until>PL.t)))b.push(['📜 Vredesverdrag',()=>askPact(E)]);if(!(p&&p.ally))b.push(['🤝 Bondgenoten',()=>askAlly(E)]);b.push(['💰 Vraag goud',()=>askGold(E)]);b.push(['⚔ Leen soldaten',()=>askTroops(E)])}
  b.push(['Sluiten',()=>{}]);card('🤝 Gezant naar '+E.name,txt,b)}
const reply=(E,t,ok)=>{card((ok?'✔ ':'✘ ')+E.name,t,[['Terug naar de gezant',()=>diplo(E)],['Sluiten',()=>{}]]);addLog('🤝 '+E.name+': '+t,ok?'#9cc552':'#e5766a');save()};
function gift(E){if(!myPurse(200)){addLog('Je hebt geen 200 goud voor een geschenk.','#e5766a');return}const g=Math.round(14*(1-Math.max(0,rel(E))/130));addRel(E,g);sfx('coin');reply(E,'"Een vorstelijk geschenk! Wij zullen dit niet vergeten." (relatie +'+g+')',true)}
function askPeace(E){const me=allKnights().length,them=knights(E).length;if(me+5>=them*.9||rel(E)>-10||them<8){makePeace(E,false);reply(E,'"Genoeg bloed is vergoten. Laten we vrede sluiten." De oorlog is voorbij.',true)}
  else{addRel(E,-3);card('✘ '+E.name,'"Vrede? Wij winnen deze oorlog! Kom terug met een groter leger." Je kunt ook vrede kopen voor '+peaceCost(E)+' goud.',[['Koop vrede ('+peaceCost(E)+')',()=>{if(myPurse(peaceCost(E)))makePeace(E,true)}],['Sluiten',()=>{}]])}}
function askPact(E){const me=allKnights().length,them=knights(E).length;if(rel(E)>=15||me>=them*1.5){PACT()[E.id]={until:PL.t+1500};addRel(E,5);reply(E,'"Wij zweren: 25 minuten lang zullen wij jou niet aanvallen." Het vredesverdrag is getekend.',true)}
  else reply(E,'"Wij kennen je nog niet goed genoeg. Toon eerst je goede wil." (relatie 15 nodig, of een veel groter leger)',false)}
function askAlly(E){if(rel(E)>=60){PACT()[E.id]={ally:true,until:1e12};addRel(E,5);reply(E,'"Vanaf vandaag zijn wij bondgenoten! Onze legers zijn de jouwe als je ze nodig hebt."',true)}
  else reply(E,'"Bondgenoten? Daarvoor moeten we elkaar echt vertrouwen." (relatie 60 nodig: stuur geschenken)',false)}
function askGold(E){const cd=asked(E,'gold',600);if(cd){reply(E,'"Je hebt al gevraagd! Kom over '+cd+' minuten terug."',false);return}const me=allKnights().length,them=knights(E).length,p=PACT()[E.id];
  if(me>=them*2.2){const g=300+them*12;PL.gold+=g;addRel(E,-15);sfx('coin');reply(E,'"Neem dit goud, en laat ons met rust." Je krijgt '+g+' goud. (Ze vinden je wel minder aardig.)',true)}
  else if(p&&p.ally){const g=150;PL.gold+=g;sfx('coin');reply(E,'"Voor onze bondgenoot: '+g+' goud."',true)}
  else{addRel(E,-5);reply(E,'"Goud? Waarom zouden wij jou goud geven?"',false)}}
function askTroops(E){const p=PACT()[E.id];if(!(p&&p.ally)&&rel(E)<50){reply(E,'"Onze soldaten vechten alleen voor vrienden." (bondgenoten, of relatie 50)',false);return}
  const cd=asked(E,'troops',900);if(cd){reply(E,'"Onze soldaten zijn nog niet terug. Over '+cd+' minuten."',false);return}
  const pool=knights(E).filter(k=>!k.raid&&!k.lent&&!k.dead&&!k.cave&&k!==E.ruler);const n=Math.min(8,Math.floor(pool.length*.25));if(n<1){reply(E,'"We hebben zelf geen soldaten meer over."',false);return}
  pool.sort((a,b)=>Math.hypot(a.x-PL.x,a.z-PL.z)-Math.hypot(b.x-PL.x,b.z-PL.z));const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot);
  pool.slice(0,n).forEach((a,i)=>{savePost(a);a.lent={until:PL.t+600,i};a.raid=null;a.x=PL.x-fx*10+rnd(-4,4);a.z=PL.z-fz*10+rnd(-4,4);a.y=groundH(a.x,a.z);a.cave=PL.inCave;a.angry=false;a.angryT=0;say(a,'Tot uw dienst!',3)});
  reply(E,'"'+n+' van onze beste soldaten zullen je tien minuten lang volgen en voor je vechten." Ze staan achter je.',true)}
function lentAI(a,dt){if(a.sayT>0){a.sayT-=dt;if(a.sayT<=0)a.say=''}
  if(PL.t>a.lent.until){a.lent=null;homeward(a);say(a,'Mijn dienst zit erop. Vaarwel!',3);return}
  if(nearEnemy(a))return _uN(a,dt);
  const i=a.lent.i,fx=Math.sin(PL.rot),fz=Math.cos(PL.rot),side=((i%4)-1.5)*2,back=5+Math.floor(i/4)*2,tx=PL.x-fx*back+fz*side,tz=PL.z-fz*back-fx*side,d=Math.hypot(tx-a.x,tz-a.z);
  if(d>80){a.x=PL.x-fx*12+fz*side;a.z=PL.z-fz*12-fx*side;a.y=groundH(a.x,a.z);a.cave=PL.inCave}else stepTo(a,dt,tx,tz,d>14?6.6:d>5?4.4:2.2,.9);
  if(a.h)animHuman(a.h,dt,a.vel,{})}
KG.diplo=id=>diplo(RB[id]);
let warBeat=0;
ANIMS.push(dt=>{if(!KG.ready||PL.dead||paused)return;warBeat+=typeof dt==='number'?dt:.016;if(warBeat<1)return;const step=warBeat;warBeat=0;PL.fx=PL.fx||{};
  const mineL=REALMS.filter(R=>R.throne&&mine(R));if(mineL.length){if(!PL.fx.ruleT)PL.fx.ruleT=PL.t}else PL.fx.ruleT=0;
  if(mineL.length>=5&&!PL.fx.emperor){PL.fx.emperor=1;ceremony();sfx('level');card('👑 '+(fem()?'Keizerin':'Keizer')+' van het Grote Rijk','Je heerst nu over '+mineL.length+' rijken. Overal buigen de mensen voor je. Kun je ze allemaal veroveren?',null,10);refreshBtn();save()}
  if(!mineL.length)return;
  for(const E of REALMS){if(!E.throne||mine(E)||E.cave)continue;
    if(!WARS()[E.id]){if(!E.ruler||E.ruler.dead||PL.t-PL.fx.ruleT<240)continue;E.warCk=(E.warCk||0)+step;if(E.warCk<60)continue;E.warCk=0;
      const pc=PACT()[E.id];if(pc&&(pc.ally||pc.until>PL.t))continue;
      if(knights(E).length>=8&&Math.random()<(E.aggr??.12)*.035*(1+mineL.length*.25)*Math.max(.1,1-rel(E)/80))declareWar(E,'them');continue}
    if(!actors.some(a=>a.raid&&a.raid.from===E.id&&!a.dead)&&PL.t-(E.raidT||0)>(E.great?200:260))launchRaid(E)}
  for(const R of mineL){const [sx,sz]=R.square(R);let n=0,from=null;for(const a of actors)if(a.raid&&a.raid.arr&&!a.raid.home&&!a.dead&&a.raid.R===R.id&&Math.hypot(a.x-sx,a.z-sz)<30){n++;from=a.raid.from}
    if(!n)continue;R.plT=(R.plT||0)+step;if(R.plT<8)continue;R.plT=0;const st=S(R),g=Math.min(Math.floor(st.gold),n*20);st.gold-=g;st.joy=Math.max(0,st.joy-2);
    if(!R.plLog||PL.t-R.plLog>45){R.plLog=PL.t;addLog('🔥 Soldaten van '+(RB[from]?RB[from].name:'de vijand')+' plunderen '+R.name+'! ('+g+' goud weg, het volk is bang)','#e5766a')}}});

/* ---------- big armies: faster checks for enemies, and less animation work far away ---------- */
const ENE={t:-1,list:[]};
const _ne=nearEnemy;nearEnemy=function(a){let b=null;if(!a||!a.order)b=_ne(a);else{if(ENE.t!==PL.t){ENE.t=PL.t;ENE.list=actors.filter(e=>e.kind==='enemy'&&!e.dead)}let bd=16;for(const e of ENE.list){if(e.dead||Math.abs(e.x-a.x)>16)continue;const d=Math.hypot(e.x-a.x,e.z-a.z);if(d<bd){bd=d;b=e}}}
  if(!b&&a&&a.realm&&a.guard&&anyWar())b=warFoe(a);return b};
const _ah=animHuman;animHuman=function(h,dt,speed,o){if(!h||!h.g||h===pm)return _ah(h,dt,speed,o);const p=h.g.position,dx=p.x-camera.position.x,dz=p.z-camera.position.z,d2=dx*dx+dz*dz;
  if(d2>1225){const skip=d2>8100?6:3;h._lodA=(h._lodA||0)+dt;h._lodN=(h._lodN||0)+1;if(h._lodN<skip)return;h._lodN=0;dt=h._lodA;h._lodA=0}return _ah(h,dt,speed,o)};
/* ---------- rulers are much harder to kill than their knights ----------
   A ruler has three times the life (and at least fifteen knights' worth), wears royal armour (half damage, and no single
   blow takes more than 3% of that life), parries one blow in five, heals again when the fighting stops, and twice (at half
   and at a quarter of its life) raises a golden shield for a few seconds and calls every knight nearby, hitting harder
   after the second time. A golden bar at the top shows the ruler's life while you fight. */
function royal(a){if(!a||a._roy||a.dead)return;const R=RB[a.ruler];if(!R)return;const best=knights(R).reduce((m,k)=>Math.max(m,k.hpMax||0),0);
  a.hpMax=Math.round(Math.max((a.hpMax||700)*3,best*15,2500));a.hp=a.hpMax;a.dmg=Math.round((a.dmg||42)*1.4);a._roy={phase:0,hitT:-99,shieldT:-99,msgT:-99,dmg:a.dmg,shield:null}}
setInterval(()=>{if(KG.ready)for(const R of REALMS)if(R.ruler&&!R.ruler._roy)try{royal(R.ruler)}catch(e){}},1000);
function royalShield(a){const r=a._roy;if(!r.shield&&a.root){r.shield=new T.Mesh(new T.SphereGeometry(1.5,20,14),new T.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.28,depthWrite:false,blending:T.AdditiveBlending}));r.shield.position.y=1.1;a.root.add(r.shield)}
  if(r.shield)r.shield.visible=true;r.shieldT=PL.t+4;try{sfx('block')}catch(e){}}
function rally(a,byPlayer){const R=RB[a.ruler];if(!R)return;say(a,pick(['Wachters! Bescherm uw '+R.title[0].toLowerCase()+'!','Te wapen! Men valt de troon aan!','Ridders, naar mij toe!']),4);
  for(const g of knights(R))if(!g.dead&&Math.hypot(g.x-a.x,g.z-a.z)<90&&byPlayer){g.angry=true;g.angryT=60}}
const _hR=hitActor;hitActor=function(a,dmg,byPlayer,dir){const r=a&&a._roy;if(!r||a.dead)return _hR(a,dmg,byPlayer,dir);r.hitT=PL.t;
  if(PL.t<r.shieldT){if(PL.t-r.msgT>.7){r.msgT=PL.t;floatText(a.x,a.y+2.6,a.z,'Koninklijk schild','#ffd27a')}return}
  if(Math.random()<.2){floatText(a.x,a.y+2.4,a.z,'Gepareerd!','#cfd8e0');try{sfx('block')}catch(e){}return}
  const res=_hR(a,Math.min(dmg*.5,a.hpMax*.03),byPlayer,dir);
  if(!a.dead){const f=a.hp/a.hpMax;if((r.phase<1&&f<.5)||(r.phase<2&&f<.25)){r.phase=f<.25?2:1;royalShield(a);rally(a,byPlayer);if(r.phase===2)a.dmg=Math.round(r.dmg*1.3)}}
  return res};
const RBAR={el:null};
function royalBar(){if(!RBAR.el){const d=document.createElement('div');d.id='royalbar';d.innerHTML='<div class="t"></div><div class="b"><i></i></div>';document.body.appendChild(d);RBAR.el=d;
    const st=document.createElement('style');st.textContent='#royalbar{position:fixed;top:calc(64px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);width:min(520px,70vw);z-index:6;text-align:center;font-family:var(--f-display);color:#ffe9b0;text-shadow:0 2px 4px #000;pointer-events:none;opacity:0;transition:opacity .4s}#royalbar .t{font-size:19px;letter-spacing:.05em}#royalbar .b{height:14px;border:2px solid #b98a2e;background:#140e08;border-radius:8px;overflow:hidden;margin-top:4px;box-shadow:0 0 12px rgba(224,176,74,.35)}#royalbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#8a6a1a,#ffd27a);transition:width .25s}body.cine #royalbar{opacity:0!important}';document.head.appendChild(st)}return RBAR.el}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;let best=null,bd=60;
  for(const R of REALMS){const k=R.ruler,r=k&&k._roy;if(!r||k.dead)continue;
    if(r.shield)r.shield.visible=PL.t<r.shieldT;if(r.shield&&r.shield.visible)r.shield.material.opacity=.2+Math.sin(PL.t*8)*.08;
    if(k.hp<k.hpMax&&PL.t-r.hitT>8){k.hp=Math.min(k.hpMax,k.hp+k.hpMax*.015*dt);if(k.hp>=k.hpMax){r.phase=0;k.dmg=r.dmg}}
    const d=Math.hypot(k.x-PL.x,k.z-PL.z);if(d<bd&&PL.t-r.hitT<12&&!!k.cave===!!PL.inCave){bd=d;best=k}}
  if(!best&&!RBAR.el)return;const el=royalBar();if(!best){el.style.opacity=0;return}const bb=document.getElementById('bossbar');el.style.top=bb&&bb.style.opacity==='1'?'calc(116px + env(safe-area-inset-top,0px))':'';
  el.style.opacity=1;el.querySelector('.t').textContent='👑 '+best.name+(PL.t<best._roy.shieldT?' (schild)':'');el.querySelector('i').style.width=Math.max(0,best.hp/best.hpMax*100)+'%'});
})();
