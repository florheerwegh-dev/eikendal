/* ================= Making amends: a great gift buys forgiveness =================
   Killed someone, or attacked the townsfolk? Bring a great gift to a priest, a lord or mayor, or an innkeeper.
   The bigger the wrong, the bigger the gift: gold, or precious things (gems, pearls, relics) worth as much.
   After that the guards stop hunting you, the bounty is gone and the people greet you as a friendly citizen again. */
(function(){
const PREC=['gem','pearl','relic','dragon_scale','frost_heart','yeti_fang','fenrik_fang','kraken_eye','lava_core'];
const cost=()=>Math.round(150+Math.max(0,-PL.rep)*10+PL.bounty*2);
const worth=()=>PREC.reduce((s,id)=>s+(ITEMS[id]?(PL.inv[id]||0)*ITEMS[id].price:0),0);
function forgive(a){PL.bounty=0;PL.rep=Math.max(PL.rep,15);
  for(const g of actors){if(g.kind!=='npc')continue;g.angry=false;g.angryT=0;g.warned=false;if(g.state==='flee'||g.state==='fight')g.state=null}
  sfx('coin');try{WD.sounds&&WD.sounds.play('gong',.6)}catch(e){}closeModals();
  addLog(a.name+' neemt je geschenk aan. Je bent vergeven: de wachters laten je met rust en je bent weer een vriendelijke burger.','#9cc552');
  floatText(PL.x,PL.y+2.4,PL.z,'Vergeven','#9cc552');
  try{WD.kingdom&&WD.kingdom.card&&WD.kingdom.card('🕊 Vergeven','Je geschenk is aangenomen. De premie op je hoofd is weg, de wachters jagen niet meer op je en de mensen groeten je weer vriendelijk. Doe het niet nog eens!',null,8)}catch(e){}}
function payItems(n){let left=n;for(const id of PREC){const it=ITEMS[id];if(!it)continue;while(left>0&&(PL.inv[id]||0)>0){takeItem(id,1);left-=it.price}}return left<=0}
const _dm=dlgMain;dlgMain=function(a,text){_dm(a,text);try{
  if(!(a.job==='priest'||a.job==='lord'||a.job==='innkeeper'))return;if(PL.rep>=0&&PL.bounty<=0)return;
  const box=document.querySelector('#dlg #dopts');if(!box)return;const b=document.createElement('button');b.className='btn pri';b.textContent='🕊 Het goedmaken met een groot geschenk';
  b.onclick=()=>{const c=cost(),w=worth(),o=[];
    if(PL.gold>=c)o.push(['Geef '+c+' goud',()=>{PL.gold-=c;forgive(a)},1]);
    if(w>=c)o.push(['Geef kostbaarheden (edelstenen, parels, relieken) ter waarde van '+c,()=>{if(payItems(c))forgive(a)},PL.gold<c]);
    o.push(['Nog niet',()=>dlgMain(a,'Kom terug als je het meent.')]);
    showDlg(a,(PL.bounty>0?'Er staat een premie van '+PL.bounty+' goud op je hoofd. ':'')+'Wat je gedaan hebt, is ernstig. Maar wie oprecht spijt heeft en een groot geschenk geeft aan het dorp, mag op vergeving rekenen. '+
      'Het geschenk: <b>'+c+' goud</b>, of kostbaarheden die zoveel waard zijn.'+(PL.gold<c&&w<c?' <i>Dat heb je nu niet bij je (goud '+PL.gold+', kostbaarheden '+w+').</i>':''),o)};
  box.insertBefore(b,box.firstChild)}catch(e){console.warn('amends',e)}};
/* after a killing, say what can be done */
let hintT=-999;const _ka=killActor;killActor=function(a,by){_ka(a,by);if(by&&a&&a.kind==='npc'&&PL.t-hintT>120){hintT=PL.t;setTimeout(()=>addLog('Wil je het goedmaken? Breng een groot geschenk naar een priester, de heer of burgemeester, of een herbergier.','#e0b04a'),1500)}};

/* ---------- making it clear: a button under your health whenever people fear you ---------- */
const hb=document.createElement('button');hb.className='btn';hb.style.cssText='position:fixed;left:max(12px,env(safe-area-inset-left,0px));top:calc(232px + env(safe-area-inset-top,0px));z-index:16;display:none;pointer-events:auto;font-size:13px;padding:6px 10px;border-color:#e5766a;color:#ffd0c8';
document.body.appendChild(hb);hb.addEventListener('mousedown',e=>e.stopPropagation());hb.addEventListener('pointerdown',e=>e.stopPropagation());
setInterval(()=>{const bad=started&&!PL.dead&&(PL.rep<-20||PL.bounty>0)&&!document.body.classList.contains('cine');hb.style.display=bad?'block':'none';if(bad)hb.textContent='⚠ '+repName()+(PL.bounty?' · premie '+PL.bounty:'')+' · Hoe word ik weer vriendelijk?'},700);
function helpers(){return actors.filter(a=>a.kind==='npc'&&!a.dead&&(a.job==='priest'||a.job==='lord'||a.job==='innkeeper')&&!a.cave)}
function nearestHelper(){let b=null,bd=1e9;for(const a of helpers()){const d=Math.hypot(a.x-PL.x,a.z-PL.z);if(d<bd){bd=d;b=a}}return b}
hb.addEventListener('click',()=>{const c=cost(),w=worth(),mc=Math.round(c*1.2),h=nearestHelper();const card=WD.kingdom&&WD.kingdom.card;if(!card)return;
  const btns=[];if(h)btns.push(['Wijs de weg naar '+h.name,()=>{PL.nav={x:h.x,z:h.z,name:h.name};addLog('Volg de markering op je minikaart naar '+h.name+'.','#9cc552')}]);
  if(PL.gold>=mc)btns.push(['Stuur een boodschapper met '+mc+' goud',()=>{PL.gold-=mc;forgive({name:'De boodschapper'})}]);
  btns.push(['Sluiten',()=>{}]);
  card('🕊 Weer vriendelijk worden','Je bent nu "'+repName()+'"'+(PL.bounty?' en er staat een premie van '+PL.bounty+' goud op je hoofd':'')+'. Zo word je weer een vriendelijke burger: '+
    '1) breng een groot geschenk van '+c+' goud (of kostbaarheden) naar een priester, een heer of burgemeester, of een herbergier, en kies "Het goedmaken"; '+
    '2) of stuur hier meteen een boodschapper met '+mc+' goud, dan hoef je niet langs de wachters. Daarna jagen de wachters niet meer op je. '+
    'Ook opdrachten doen en rovers verslaan maakt je reputatie langzaam beter.'+(PL.gold<mc&&w<c?' (Je hebt nu '+PL.gold+' goud.)':''),btns)});
})();
