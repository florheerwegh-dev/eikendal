/* ================= People who talk about anything, and act more like real people =================
   - Praten: in every conversation there is a box at the bottom: type anything you want to say or ask. In the claude.ai
     version the person really answers (Claude speaks for them, in their role, knowing where they live, the time, the
     weather and what you have done). Elsewhere they answer from what they know: the way to places, the weather, the
     news, their ruler, dragons, treasure, jokes, food, and more.
   - Echter gedrag: when it rains, people go home and come out again when it stops; and they notice you: they react
     when you are hurt, flying a dragon, riding a horse, very rich, or their own king or queen. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,FX=()=>{PL.fx=PL.fx||{};return PL.fx},KG=()=>WD.kingdom,me=()=>(PL.look&&PL.look.name)||'reiziger';
let AI=null;(async()=>{try{if(window.claude&&claude.use)AI=await claude.use('sample')}catch(e){AI=null}})();
const esc2=s=>String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const hhmm=()=>{const h=Math.floor(ENV.time),m=Math.floor((ENV.time-h)*60);return h+':'+String(m).padStart(2,'0')};
const DIRS=['oosten','zuidoosten','zuiden','zuidwesten','westen','noordwesten','noorden','noordoosten'];
const dirTo=(ax,az,bx,bz)=>{const a=Math.atan2(bz-az,bx-ax);return DIRS[((Math.round(a/(Math.PI/4))%8)+8)%8]};
function placeOf(a){try{const R=a.realm&&KG()&&KG().realm(a.realm);if(R)return R.name}catch(e){}const s=siteAt(a.x,a.z);return s?s.name:'deze streek'}
function jobOf(a){try{return(JOBN[a.job]||a.job||'inwoner').toLowerCase()}catch(e){return'inwoner'}}
function weather(){try{return WXN[ENV.weather].toLowerCase()}catch(e){return ENV.weather}}
function worldFacts(a){const f=FX(),k=KG(),mine=(k&&k.realms||[]).filter(R=>R.throne&&k.isMine(R.id)).map(R=>k.title(R.id)+' van '+R.name);
  const deeds=(f.chron||[]).slice(-5).map(e=>e.t).join(' ');let ruler='';try{const R=a.realm&&k.realm(a.realm);if(R)ruler=k.isMine(R.id)?'De speler is zelf de heerser van dit rijk!':R.ruler?'De heerser hier is '+R.ruler.name+'.':''}catch(e){}
  return 'Plaats: '+placeOf(a)+'. Tijd: '+hhmm()+'. Weer: '+weather()+'. Seizoen: '+(WD.season?WD.season().n:'zomer')+'. '+ruler+' De speler heet '+me()+', niveau '+PL.lvl+', heeft '+Math.round(PL.gold)+' goud'+(mine.length?', en is '+mine.join(' en '):'')+(f.spouse?', getrouwd met '+f.spouse.name:'')+'. Wat de speler onlangs deed: '+(deeds||'nog niet veel')+' Geruchten in de wereld: '+(RUMORS.slice(-3).map(r=>r.t).join(' '))}
/* ---------- answers when Claude cannot speak for them ---------- */
const JOKES=['Waarom nam de ridder een ladder mee naar de herberg? Omdat de drankjes van het huis waren!','Wat zegt een draak als hij een ridder in harnas ziet? "Ah, eten in blik!"','Waarom zijn trollen slecht in verstoppertje? Omdat ze altijd onder de brug zitten!','Hoe noem je een tovenaar die op een berg woont? Een hoogleraar!','Waarom gaat de koning nooit zwemmen? Hij is bang dat hij zijn kroon verliest... in de golven!'];
const ALIAS=[[/kerker|vergeten koning|spook/,'Ruïne van Dornwacht','De kerker ligt onder de spookruïne van Dornwacht.'],[/wereldboom|wereldrand/,'Eiland van de Wereldboom','Het Eiland van de Wereldboom ligt ver in het zuiden, neem de veerboot bij de vuurtoren.'],[/wolkenrijk|wolken|stormreus/,'Eiland van de Wereldboom','Het Wolkenrijk? Klim in de Wereldboom en loop over de regenboogbrug!'],[/dwerg|diepsteen/,'Poort van Diepsteen','De dwergenstad Diepsteen ligt achter een poort bij de Kopermijn.'],[/\belf(en)?\b|elfenbos|\bfee/,'Het Elfenbos','Het Elfenbos, waar de feeën dansen.'],[/toernooi|arena/,'Arena van Aurelia','Het toernooi is in de Arena van Aurelia.'],[/draak|draken|nest/,'Drakennest','Het Drakennest, pas op voor de Draakmoeder!'],[/vuurtoren|veerboot|veerman/,'Vuurtoren Zuidkaap','De veerboot vertrekt bij de vuurtoren.'],[/kermis|carrousel/,'De Kermis','De kermis staat vlak bij het stadje.'],[/piraat|piraten|schip/,'Vuurtoren Zuidkaap','Het piratenschip vaart rond op zee. Kijk vanaf de kust bij de vuurtoren!'],[/trol/,'Trollenmoeras','In het Trollenmoeras wonen de trollen.']];
function localAnswer(a,q){const t=q.toLowerCase(),nm=a.name,pl=placeOf(a);
  if(/^(hallo|hoi|hey|dag|goedendag|goeiedag|goedemorgen|goedemiddag|goedenavond|yo)\b/.test(t))return pick(['Goedendag, '+me()+'! Fijn je te zien.','Hallo daar! Wat brengt jou naar '+pl+'?','Dag, '+me()+'. Mooie dag om op avontuur te gaan, niet?']);
  if(/hoe gaat|alles goed|hoe is het/.test(t))return ENV.weather==='rain'||ENV.weather==='storm'?'Mwah, ik word kletsnat van al die regen. En met jou?':pick(['Heel goed, dank je! Het is '+weather()+' en de mensen zijn vrolijk.','Druk, druk, druk! Maar goed. En jij?']);
  if(/wie ben|hoe heet|je naam|wat doe je|wat is je werk/.test(t))return'Ik ben '+nm+', '+jobOf(a)+' hier in '+pl+'. Al mijn hele leven, en ik zou nergens anders willen wonen.';
  if(/weer|regen|zon|sneeuw|onweer/.test(t))return'Het is nu '+weather()+'. '+(WD.season?'Het is '+WD.season().n.toLowerCase()+'. ':'')+(/rain|storm|snow|fog/.test(ENV.weather)||(WD.season&&WD.season().k==='winter')?'Neem een warme mantel mee!':'Geniet ervan zolang het duurt!');
  if(/hoe laat|welke tijd|uur/.test(t))return'Het is ongeveer '+hhmm()+'.'+(ENV.time>20||ENV.time<6?' Laat! Pas op voor wolven in het donker.':'');
  if(/waar|weg naar|hoe kom ik|ligt/.test(t)){let best=null;for(const [re,nmS,extra] of ALIAS)if(re.test(t)){best=SITES.find(s=>s.name===nmS);if(best){const d=Math.round(Math.hypot(best.x-a.x,best.z-a.z));return extra+' Dat ligt ongeveer '+d+' passen naar het '+dirTo(a.x,a.z,best.x,best.z)+' van hier.'}}
    for(const s of SITES){if(!s.name)continue;const w=s.name.toLowerCase().split(/[\s,]+/).filter(x=>x.length>=4);if(w.some(x=>t.includes(x))){best=s;break}}
    if(best){const d=Math.round(Math.hypot(best.x-a.x,best.z-a.z));return best.name+'? Dat ligt ongeveer '+d+' passen naar het '+dirTo(a.x,a.z,best.x,best.z)+' van hier. '+(d>800?'Een flinke reis! Neem een paard.':'Niet zo ver.')}
    return'Waar wil je naartoe? Noem een plaats, dan wijs ik je de weg. Of kijk op je kaart (M).'}
  if(/nieuws|gerucht|verhaal|gehoord/.test(t))return'Ik hoorde dit: '+pick(RUMORS).t;
  if(/koning|keizer|rijk|heerser|burgemeester|kasteel/.test(t)){try{const k=KG(),R=a.realm&&k.realm(a.realm);if(R&&k.isMine(R.id))return'Maar u bent onze '+R.title[0].toLowerCase()+'! Het volk is trots op u.';if(R&&R.ruler)return R.ruler.name+' heerst over '+R.name+'. '+pick(['Een strenge maar eerlijke heerser.','Ik zou het niet hardop zeggen, maar ik denk dat jij het beter zou doen.'])}catch(e){}return'Wij hebben hier geen koning nodig. Wij redden ons wel!'}
  if(/draak|draken/.test(t))return FX().babyDragon?'Ik zag je met '+FX().babyDragon.name+'! Geef haar genoeg vlees, dan wordt ze groot.':'In het Drakennest ligt een gloeiend ei, zeggen ze. Wie het meeneemt, krijgt misschien een eigen draakje!';
  if(/schat|goud|rijk worden|geld/.test(t))return pick(['De Yeti in het noorden schijnt een berg goud te bewaken. Driehonderdduizend goudstukken, zeggen ze!','Monsters laten soms oude schatkaarten vallen. Volg de rode X!','In de kerker onder Dornwacht ligt de schat van de Vergeten Koning.']);
  if(/grap|mop|lachen/.test(t))return pick(JOKES);
  if(/eten|honger|dorst|drinken|bier/.test(t))return'Ga naar de herberg! Daar hebben ze stoofpot en bier. Of koop brood bij de marktkramen.';
  if(/dank|bedankt|merci/.test(t))return pick(['Graag gedaan!','Geen dank, '+me()+'.','Altijd!']);
  if(/liefde|trouwen|verliefd|prinses|prins/.test(t))return'Wil je trouwen? Word eerst bondgenoot van een rijk, dan kun je de heerser vragen om de hand van de prins of prinses.';
  if(/verveel|wat (kan|moet|zal|ga) ik doen|wat nu|tip|help|avontuur|opdracht|quest/.test(t))return'Ga eens naar '+pick(['het Eiland van de Wereldboom in het zuiden','het Wolkenrijk boven de zee','Diepsteen, de stad van de dwergen','het Elfenbos','het toernooi in Aurelia','de kerker onder de ruïne van Dornwacht'])+'. Daar beleef je iets!';
  if(/monster|gevaar|eng|wolf|trol|weerwolf/.test(t))return'Pas op in het bos! Er lopen wolven en trollen. En bij volle maan... weerwolven.';
  if(/doei|tot ziens|dag dag|vaarwel/.test(t))return pick(['Tot ziens, '+me()+'!','Goede reis!']);
  return pick(['Hm, daar weet ik niet veel van. Maar ik hoorde wel: '+pick(RUMORS).t,'Dat is een goede vraag, '+me()+'. Vraag het eens aan de priester, die weet alles.','Ha! Jij stelt rare vragen. Ik ben maar een eenvoudige '+jobOf(a)+'.'])}
/* ---------- asking Claude to speak for them ---------- */
async function aiAnswer(a,q){const hist=a.chatHist=a.chatHist||[];hist.push({role:'user',content:q});while(hist.length>8)hist.shift();if(hist[0].role!=='user')hist.shift();
  const sys='Je speelt '+a.name+', een '+jobOf(a)+' in de fantasy-middeleeuwse wereld van het spel Eikendal. Antwoord ALLEEN als '+a.name+', in het Nederlands, kort (1 tot 3 zinnen), vriendelijk en geschikt voor kinderen. Blijf in de middeleeuwse fantasywereld, verzin gerust kleine details over je leven, en zeg nooit dat je een AI of een spel bent. Wat je weet: '+worldFacts(a);
  const msgs=hist.map((m,i)=>i===0&&m.role==='user'?{role:'user',content:sys+'\n\nDe speler zegt tegen je: '+m.content}:m);
  const r=await AI(msgs,{modelTier:'quick',cache:false});const text=String((r&&r.text)||'').trim().replace(/^["']|["']$/g,'').slice(0,400);hist.push({role:'assistant',content:text});return text}
/* ---------- the box in every conversation ---------- */
{const st=document.createElement('style');st.textContent='#dlg .npcask{display:flex;gap:4px;margin-top:5px}#dlg .npcask input{flex:1;min-width:0;padding:3px 8px;border-radius:4px;border:1px solid #5a4b30;background:rgba(20,16,10,.85);color:var(--parch);font:inherit;font-size:12.5px}#dlg .npcask button{padding:2px 10px;font-size:12.5px}#dlg .npclog{max-height:72px;overflow:auto;font-size:12.5px;margin-top:4px;line-height:1.3}#dlg .npclog .y{color:#9fd0ff}#dlg .npclog .n{color:var(--parch)}#dlg .npclog .w{color:var(--mute);font-style:italic}';document.head.appendChild(st)}
const _dmP=dlgMain;dlgMain=function(a,text){_dmP(a,text);try{if(!a||a.kind!=='npc')return;const d=$('dlg');if(!d||d.querySelector('.npcask'))return;
  const log=document.createElement('div');log.className='npclog';for(const m of(a.chatShow||[]).slice(-6))log.insertAdjacentHTML('beforeend','<div class="'+m[0]+'">'+esc2(m[1])+'</div>');
  const box=document.createElement('div');box.className='npcask';box.innerHTML='<input maxlength="160" placeholder="Zeg of vraag iets aan '+esc2(a.name)+'..."><button class="btn pri">Zeg</button>';
  const hint=d.querySelector('.hint');d.insertBefore(log,hint||null);d.insertBefore(box,hint||null);const inp=box.querySelector('input'),btn=box.querySelector('button');
  for(const ev of['keydown','keyup','keypress'])inp.addEventListener(ev,e=>{e.stopPropagation();if(ev==='keydown'&&e.key==='Enter')send()});
  const add=(c,t)=>{a.chatShow=a.chatShow||[];a.chatShow.push([c,t]);if(a.chatShow.length>12)a.chatShow.shift();const el=document.createElement('div');el.className=c;el.textContent=t;log.appendChild(el);log.scrollTop=1e6;return el};
  let busy=false;async function send(){const q=inp.value.trim();if(!q||busy)return;inp.value='';busy=true;add('y','Jij: '+q);const w=add('w',a.name+' denkt na...');let ans=null;
    if(AI){try{ans=await aiAnswer(a,q)}catch(e){ans=null}}if(!ans)ans=localAnswer(a,q);w.remove();a.chatShow.pop();add('n',a.name+': '+ans);try{saySomething(a,ans.length>70?ans.slice(0,68)+'...':ans,4);a.friend=Math.min(100,(a.friend||0)+1)}catch(e){}busy=false;inp.focus()}
  btn.onclick=send}catch(e){console.warn('praten',e)}};
/* ---------- when it rains, people go home (and come out again after) ---------- */
const _uNP=updateNPC;updateNPC=function(a,dt){if(a&&a.homeB&&!a.guard&&!a.kid&&!a.cheer&&!a.bt&&a.kind==='npc'&&(ENV.weather==='rain'||ENV.weather==='storm')&&!PL.inCave&&(!a.ai||a.ai==='wander'||a.ai==='work')){const t=ENV.time;ENV.time=23;try{return _uNP(a,dt)}finally{ENV.time=t}}return _uNP(a,dt)};
/* ---------- people notice you ---------- */
let noticeT=3;
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;noticeT-=dt;if(noticeT>0||!started||PL.dead)return;noticeT=3.5;
  let a=null,bd=7;for(const o of actors){if(o.kind!=='npc'||o.dead||o.guard&&!o.realm||o.cheer||o.kid||o.bt||o.inHome||(o.sayT>0))continue;const d=Math.hypot(o.x-PL.x,o.z-PL.z);if(d<bd&&PL.t-(o.noticeT||-99)>60){bd=d;a=o}}if(!a)return;
  let L=null;const k=KG();let mineHere=false;try{mineHere=a.realm&&k.isMine(a.realm)}catch(e){}
  if(PL.hp<PL.hpMax*.3)L=['Je bent gewond! Ga snel naar de priester.','Wat is er met jou gebeurd?!'];
  else if(PL.mounted&&PL.mounted.flyM)L=['EEN DRAAK!','Wow! Mag ik ook eens meevliegen?'];
  else if(PL.mounted&&PL.mounted.beetle)L=['Rijd jij op een kever?!','Wat een rare kever!'];
  else if(PL.mounted)L=['Wat een mooi paard!','Rijd voorzichtig door het dorp!'];
  else if(mineHere)L=['Goedendag, Majesteit!','Lang leve de '+(k.realm(a.realm).title[0]||'koning').toLowerCase()+'!','Majesteit! *buigt*'];
  else if(ENV.weather==='rain'||ENV.weather==='storm')L=['Wat een regen, hè?','Ik word kletsnat!'];
  else if(PL.gold>100000)L=['Jij bent rijk, zeg! Leen je me wat?','Wat glimt die buidel van jou!'];
  else if((ENV.night||0)>.6)L=['Laat op pad, hè?','Pas op voor de wolven in het donker.'];
  if(!L)return;a.noticeT=PL.t;saySomething(a,pick(L),3.5);a.rot=Math.atan2(PL.x-a.x,PL.z-a.z)});
WD.praten={localAnswer,worldFacts,ai:()=>!!AI};
})();
