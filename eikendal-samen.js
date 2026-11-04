/* ================= Samen spelen: multiplayer for everything =================
   On top of the shared world (eikendal-mp.js), through the same presence channel:
   - Vechten tegen elkaar: your sword and your superpower hit other players too (if both of you have it switched on in
     the player list, O). Beat a player and you hear about it; they fall and get up again as usual.
   - Samen heersen: when a friend in your world rules a realm, you rule it together: you get its seal and its throne
     (with a coronation), and when you conquer one, your friends rule it with you.
   - Cadeaus: give a friend gold from the player list.
   - You see each other's dragon (and its size) when someone flies.
   - One season for everyone (the host's), the pirate ship sails at the same place for everyone, and when a friend
     starts a field battle or a siege, you get a call to come and help. */
(function(){
const KG=WD.kingdom,card=(t,x,b,s)=>{try{KG.card(t,x,b,s)}catch(e){addLog(t+': '+x)}},chron=t=>{try{WD.chron.add(t)}catch(e){}},FX=()=>{PL.fx=PL.fx||{};return PL.fx};
const SM={seq:0,pv:[],gf:[],bt:null,sg:null,st:new Map(),hitT:new Map(),lastAtk:0,btOn:false,sgOn:false};WD.samen=SM;
const pvpOn=()=>FX().pvp!==false;
/* ---------- what I add to my presence ---------- */
function extra(){const own=(KG&&KG.realms||[]).filter(R=>R.throne&&KG.isMine(R.id)).map(R=>R.id),o={pv:SM.pv,gf:SM.gf,pvp:pvpOn()?1:0,rl:own,bt:SM.bt,sg:SM.sg};
  const M=PL.mounted;if(M&&M.flyM){o.dr=+((M.root&&M.root.scale.x)||.3).toFixed(2);o.m=0}
  if(window.SYNC&&SYNC.host)o.dy=FX().day||0;return o}
const _mcS=mpConnect;mpConnect=async function(name){const ok=await _mcS(name);if(ok&&MP.room&&!MP.room.__sm){const r=MP.room;MP.room=Object.assign({},r,{__sm:1,presence:p=>r.presence(Object.assign({},p,extra()))})}return ok};
const push=(L,ev)=>{L.push(ev);if(L.length>6)L.shift();MP.t=0};
/* ---------- hitting other players ---------- */
function myDmg(){const w=ITEMS[PL.eq.weapon];let g=0;try{g=gearFx().dmg||0}catch(e){}return Math.round(((w&&w.dmg)||5)+g+PL.lvl*1.5)}
function hitPeer(id,a,dmg){if(!pvpOn()||!(a.pr&&a.pr.pvp)||(a.pr&&a.pr.dd))return;dmg=Math.max(1,Math.round(dmg));push(SM.pv,[++SM.seq,id,dmg]);SM.hitT.set(id,PL.t);try{floatText(a.x,a.y+2.4,a.z,dmg,'#ff9a7a');sfx('hit')}catch(e){}}
/* a sword swing: everyone in front of you within reach */
ANIMS.push(()=>{if(!MP.room||!started||PL.dead||!pm)return;const atk=pm.atk||0,start=atk>0&&SM.lastAtk<=0;SM.lastAtk=atk;if(!start||PL.mounted)return;
  const w=ITEMS[PL.eq.weapon],rng=(w&&w.rng)||2.2,fx=Math.sin(PL.rot),fz=Math.cos(PL.rot);setTimeout(()=>{for(const [id,a] of MP.peers){const dx=a.x-PL.x,dz=a.z-PL.z,d=Math.hypot(dx,dz);if(d>rng+.8||Math.abs(a.y-PL.y)>2.5)continue;if(d>.4&&(dx*fx+dz*fz)/d<.35)continue;hitPeer(id,a,myDmg()*.6)}},180)});
/* a superpower: everyone near where it lands */
if(typeof pwCast==='function'){const o=pwCast;pwCast=function(i){const cd=window.PW?PW.cd[i]:0;const r=o.apply(this,arguments);try{if(MP.room&&window.PW&&PW.cd[i]>cd+.01){let p=null;try{p=pwAim(55)}catch(e){}p=p||PL;for(const [id,a] of MP.peers)if(Math.hypot(a.x-p.x,a.z-p.z)<(i===2?6:3.5))hitPeer(id,a,(20+PL.lvl*2)*(i===2?1.6:1))}}catch(e){}return r}}
/* ---------- gifts ---------- */
SM.give=function(id,n){const a=MP.peers.get(id);if(!a)return;if(PL.gold<n){addLog('Je hebt niet genoeg goud.','#e5766a');return}PL.gold-=n;push(SM.gf,[++SM.seq,id,'gold',null,n]);sfx('coin');addLog('Je geeft '+n+' goud aan '+a.name+'.','#7fd0ff')};
SM.togglePvp=function(){FX().pvp=!pvpOn();addLog('Vechten tegen spelers staat nu '+(pvpOn()?'AAN':'UIT')+'.','#7fd0ff');MP.t=0};
/* ---------- remote presence ---------- */
function apply(id,a,pr){let st=SM.st.get(id);if(!st){st={pv:0,gf:0,bt:0,sg:0,dd:0,first:true};SM.st.set(id,st)}const me=window.SYNC&&SYNC.myPeer;
  if(Array.isArray(pr.pv))for(const ev of pr.pv){if(!Array.isArray(ev))continue;const [q,t,dmg]=ev;if(!(q>st.pv))continue;st.pv=q;if(st.first||t!==me||PL.dead)continue;if(!pvpOn()||!pr.pvp)continue;
    const d=Math.min(400,Math.max(1,+dmg||0));try{damagePlayer(d,{x:a.x,z:a.z})}catch(e){}const dx=PL.x-a.x,dz=PL.z-a.z,l=Math.hypot(dx,dz)||1;const p={x:PL.x+dx/l*.6,z:PL.z+dz/l*.6};try{collide(p,.4)}catch(e){}PL.x=p.x;PL.z=p.z;
    addLog(a.name+' slaat je! (-'+Math.round(d)+')','#ff9a7a');if(PL.dead){card('⚔ Verslagen!',a.name+' heeft je verslagen in een gevecht. Sta op en neem wraak... of sluit vrede!',null,7)}}
  if(Array.isArray(pr.gf))for(const ev of pr.gf){if(!Array.isArray(ev))continue;const [q,t,kind,item,n]=ev;if(!(q>st.gf))continue;st.gf=q;if(st.first||t!==me)continue;
    if(kind==='gold'){const g=Math.max(0,Math.min(100000,+n||0));PL.gold+=g;sfx('coin');card('🎁 Een cadeau!',a.name+' geeft je '+g+' goud!',null,6)}}
  /* you beat them: their presence says they fell just after your hit */
  const dd=pr.dd?1:0;if(dd&&!st.dd&&PL.t-(SM.hitT.get(id)??-99)<4){giveXp(100);sfx('level');card('🏆 Gewonnen!','Je hebt '+a.name+' verslagen!',null,6);chron('Versloeg '+a.name+' in een gevecht.')}st.dd=dd;
  /* ruling together */
  if(Array.isArray(pr.rl)&&KG&&KG.ready)for(const rid of pr.rl){const R=KG.realm(rid);if(R&&R.throne&&!KG.isMine(rid))coRule(R,a.name)}
  /* one season for all: the host's */
  if(typeof pr.dy==='number'&&!(window.SYNC&&SYNC.host))FX().day=pr.dy;
  /* a friend calls for help */
  const call=(arr,k,title,txt)=>{if(!Array.isArray(arr)||!(arr[0]>st[k]))return;st[k]=arr[0];if(st.first)return;const [,nm,x,z]=arr;if(Math.hypot(x-PL.x,z-PL.z)>1500||PL.inCave)return;
    card(title,a.name+' '+txt+' '+nm+'! Ga je helpen?',[['Reis erheen',()=>{if(PL.mounted)try{dismount()}catch(e){}PL.x=x+3;PL.z=z+3;PL.y=groundH(PL.x,PL.z);PL.vy=0;addLog('Je reist naar '+a.name+'.','#7fd0ff')}],['Nee',()=>{}]])};
  call(pr.bt,'bt','⚔ Een vriend vecht!','vecht een veldslag tegen');call(pr.sg,'sg','🏰 Een vriend belegert een stad!','belegert');
  dragonOf(a,pr);st.first=false}
function coRule(R,who){const f=FX();f.coRule=f.coRule||{};if(f.coRule[R.id])return;f.coRule[R.id]=who;const st=KG.state(R.id);
  if(R.ruler&&!R.ruler.dead){const r=R.ruler;r.dead=true;r.gone=true;r.respawn=1e12;r.deadT=1e9;if(r.root)r.root.visible=false;R.ruler=null}
  st.dead=true;st.heir=null;if(R.crown&&!hasItem(R.crown))giveItem(R.crown,1,true);st.mine=true;st.joy=Math.max(st.joy||55,55);
  card('👑 Samen heersen!',who+' heerst over '+R.name+'. Omdat jullie samen spelen, ben jij nu ook heerser van '+R.name+'! Je krijgt het zegel en de troon.',null,10);chron('Heerst samen met '+who+' over '+R.name+'.')}
/* their dragon, under them */
function dragonOf(a,pr){const s=+pr.dr||0;if(!s){if(a.drg){a.drg.root.visible=false}return}
  if(!a.drg){try{const m=makeDragon();m.g.userData.dyn=true;scene.add(m.g);a.drg={root:m.g,model:m}}catch(e){a.drg=null;return}}
  a.drg.root.visible=true;a.drg.root.scale.setScalar(s);if(a.horse&&a.horse.g)a.horse.g.visible=false}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!MP.room)return;for(const a of MP.peers.values()){const d=a.drg;if(!d||!d.root.visible)continue;const s=d.root.scale.x;d.root.position.set(a.x,a.y-.4-s*2.6,a.z);d.root.rotation.y=a.rot||0;try{animHorse(d.model,dt,a.vel||0)}catch(e){}}});
const _mdS=mpDrop;mpDrop=function(a){_mdS(a);if(a&&a.drg)scene.remove(a.drg.root)};
const _msS=mpSync;mpSync=function(){_msS();if(!MP.room)return;let peers=[];try{peers=MP.room.peers()}catch(e){}for(const p of peers){if(p.sameTab||p.kind!=='viewer')continue;const a=MP.peers.get(p.peer);if(a&&p.presence)try{apply(p.peer,a,p.presence)}catch(e){console.warn('samen',e)}}};
/* my battles and sieges, for my friends */
ANIMS.push(()=>{const W=WD.war;if(!W||!MP.room)return;const B=W.BT,S=W.SG;
  if(B.on&&!SM.btOn&&B.R&&B.C){SM.bt=[++SM.seq,B.R.name,Math.round(B.C.x),Math.round(B.C.z)];MP.t=0}SM.btOn=B.on;
  if(S.on&&!SM.sgOn&&S.gt){SM.sg=[++SM.seq,S.on.name,Math.round(S.gt.x),Math.round(S.gt.z+30)];MP.t=0}SM.sgOn=!!S.on});
/* the free Render server sleeps when nobody plays; the first connection can fail while it wakes up, so keep trying for a while */
{const _mcR=mpConnect;let tries=0;mpConnect=async function(name){const ok=await _mcR(name);if(ok){tries=0;return ok}
  if(MP.via==='render'&&MP.mode==='multi'&&started&&tries<15){tries++;addLog('De server wordt wakker... nog even geduld ('+tries+'/15)','#7fd0ff');setTimeout(()=>{if(!MP.room&&MP.mode==='multi')mpConnect(name)},6000)}return ok}}
SM.apply=apply;SM.extra=extra;
})();
