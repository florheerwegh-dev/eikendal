/* ================= The court: coronation, audiences and a royal wedding =================
   - Kroning: when a realm becomes yours, the bells ring, a fanfare sounds, the people gather around you and the
     knights salute, and you are crowned king or queen (more joy in the realm, reputation and experience).
   - Audiënties: when you stand near your own throne, now and then one of your people comes to you with a request or
     a quarrel. You decide, and that makes your people happier or angrier, and costs or brings gold.
   - Koninklijk huwelijk: when a realm is your ally, ask its ruler for the hand of their prince or princess. A grand
     wedding, a dowry of 3000 gold, and that realm stays your friend for ever. Your husband or wife lives at your home. */
(function(){
const KG=WD.kingdom,card=(t,x,b,s)=>{try{KG.card(t,x,b,s)}catch(e){addLog(t+': '+x)}},HC=()=>WD.homecoming||{},chron=t=>{try{WD.chron.add(t)}catch(e){}};
const fem=()=>!!(PL.look&&PL.look.fem),near=a=>Math.hypot(a.x-PL.x,a.z-PL.z);
/* the people gather round you and cheer (the cheering itself lives in eikendal-thuiskomst.js) */
function gather(R,lines,n){const ppl=(KG.citizens(R.id)||[]).filter(a=>a.h&&a.root&&a.root.visible!==false&&!a.inHome&&!a.cheer&&!a.dead&&near(a)<90).sort((a,b)=>near(a)-near(b)).slice(0,n);const a0=Math.random()*6.283;
  ppl.forEach((a,i)=>{a.cheer={t:22,ang:a0+i/Math.max(1,ppl.length)*6.283,r:4+(i%3)*1.8,delay:.3+i*.25,lines,gift:null}});
  for(const k of(KG.knights(R.id)||[]).filter(a=>!a.dead&&a.h&&near(a)<50).slice(0,8))k.cheer={t:12,salute:true,delay:0,lines};return ppl}
function party(sec){const h=HC();try{h.bells&&h.bells();setTimeout(()=>h.fanfare&&h.fanfare(),500);h.confetti&&h.confetti(sec)}catch(e){}}
/* ---------- coronation ---------- */
const MINE={};
setInterval(()=>{if(typeof started==='undefined'||!started||!KG||!KG.ready||!KG.realms)return;for(const R of KG.realms){if(!R.throne)continue;const m=KG.isMine(R.id);if(!(R.id in MINE)){MINE[R.id]=m;continue}if(m&&!MINE[R.id])try{crown(R)}catch(e){console.warn('kroning',e)}MINE[R.id]=m}},2000);
function crown(R){const st=KG.state(R.id),t=KG.title(R.id);st.crowned=(st.crowned||0)+1;party(7);
  if(Math.hypot(PL.x-R.throne.x,PL.z-R.throne.z)<70)gather(R,['Lang leve '+t+'!','Hoera! Hoera!','Een nieuwe '+R.title[fem()?1:0].toLowerCase()+' voor '+R.name+'!'],12);
  /* the rewards only the first time (swapping seals must not pay) */if(st.crowned===1){st.joy=Math.min(100,(st.joy||50)+15);giveRep(8,'gekroond in '+R.name);giveXp(1500)}
  if(window.cinematic&&!CIN.on&&Math.hypot(PL.x-R.throne.x,PL.z-R.throne.z)<40){const V=(a,b,c)=>new T.Vector3(a,b,c),y=PL.y;cinematic([{d:3.2,from:V(PL.x+6,y+2,PL.z+6),to:V(PL.x+3.5,y+1.9,PL.z-3.5),lf:V(PL.x,y+1.6,PL.z),lt:V(PL.x,y+1.8,PL.z)},{d:3,from:V(PL.x,y+2.4,PL.z+5),to:V(PL.x,y+6,PL.z+10),lf:V(PL.x,y+1.8,PL.z),lt:V(PL.x,y+1.4,PL.z)}],'Lang leve '+t,R.name+' heeft een nieuwe heerser')}
  card('👑 Kroning in '+R.name,'De klokken luiden. Voor het hele volk wordt de kroon op je hoofd gezet: vanaf vandaag ben je '+t+'. Het volk juicht, de ridders buigen. (Kom naar je troon: je volk zal je om raad vragen.)',null,12);chron('Gekroond tot '+t+'.')}
/* ---------- audiences at your throne ---------- */
const PETS=[
  {t:'"De bakker en de molenaar maken ruzie over een zak meel. Wie heeft gelijk?"',o:[['De bakker heeft gelijk',{joy:1}],['De molenaar heeft gelijk',{joy:1}],['Laat ze het meel eerlijk delen',{joy:4,rep:1}]]},
  {t:'"Wolven vallen ’s nachts onze schapen aan! Help ons, Majesteit!"',o:[['Stuur ridders om de wolven te verjagen (50 goud)',{joy:6,gold:-50}],['Bouw zelf maar hogere hekken',{joy:-3}]]},
  {t:'"Mogen we een groot oogstfeest houden, met muziek en taart voor iedereen?"',o:[['Ja! Ik betaal het feest (200 goud)',{joy:10,gold:-200}],['Daar is geen geld voor',{joy:-4}]]},
  {t:'"We hebben een dief gepakt. Hij stal brood van de markt."',o:[['Gooi hem in de kerker',{joy:2}],['Genade, hij had honger',{joy:1,rep:3}],['Laat hem een maand de straten vegen',{joy:3}]]},
  {t:'"De brug over de beek is ingestort. De boeren kunnen niet naar de markt."',o:[['Herbouw de brug (150 goud)',{joy:7,gold:-150}],['Dat komt later wel',{joy:-4}]]},
  {t:'"Een koopman uit verre landen wil hier handel drijven en betaalt goed."',o:[['Welkom! (+120 goud)',{joy:1,gold:120}],['Nee, we vertrouwen hem niet',{joy:-1}]]},
  {t:'"De kinderen hebben nergens om te spelen. Mogen ze een speelveld?"',o:[['Bouw een speelveld (80 goud)',{joy:6,gold:-80}],['Kinderen moeten werken!',{joy:-6,rep:-3}]]},
  {t:'"Een jonge ridder wil trouwen met de dochter van een boer. Mag dat?"',o:[['Ja, de liefde wint',{joy:5,rep:2}],['Nee, hij moet met een edele trouwen',{joy:-3}]]},
  {t:'"Mensen zeggen dat de oude kruidenvrouw een heks is. Wat doen we met haar?"',o:[['Laat haar met rust, er is geen bewijs',{joy:1,rep:3}],['Verban haar uit het rijk',{joy:2,rep:-2}]]},
  {t:'"De belasting is zo hoog, Majesteit. We kunnen bijna geen brood kopen."',o:[['Deze maand geen belasting (-100 goud)',{joy:8,gold:-100}],['De schatkist moet vol (+100 goud)',{joy:-5,gold:100}]]},
  {t:'"Er is een draak gezien boven de heuvels! Wat moeten we doen?"',o:[['Ik ga er zelf naar kijken',{joy:5,rep:2}],['Iedereen moet binnen blijven',{joy:1}]]},
  {t:'"De schilder wil een groot schilderij van u maken voor in de troonzaal."',o:[['Ja, maar wel mooi! (60 goud)',{joy:3,gold:-60}],['Nee, geen gedoe',{joy:0}]]}];
const AU={t:100,acc:0};
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;AU.acc+=dt;if(AU.acc<1)return;const s=AU.acc;AU.acc=0;if(!started||PL.dead||!KG||!KG.ready||CIN.on||anyModal())return;
  const R=(KG.realms||[]).find(R=>R.throne&&KG.isMine(R.id)&&!!R.cave===!!PL.inCave&&Math.hypot(PL.x-R.throne.x,PL.z-R.throne.z)<14);if(!R)return;
  AU.t-=s;if(AU.t>0)return;AU.t=150+Math.random()*120;audience(R)});
function audience(R){const p=pick(PETS),c=(KG.citizens(R.id)||[]).filter(a=>a.h&&!a.dead&&!a.cheer&&!a.inHome&&near(a)<70).sort((a,b)=>near(a)-near(b))[0];
  if(c)c.cheer={t:16,ang:Math.random()*6.283,r:2.3,delay:0,lines:['Majesteit, mag ik u iets vragen?','Een verzoek, Majesteit!'],gift:null};
  setTimeout(()=>{if(PL.dead)return;card('📜 Audiëntie: '+(c?c.name:'een burger'),p.t,p.o.map(([l,e])=>[l,()=>decide(R,e,c)]))},c?5000:800)}
function decide(R,e,c){const st=KG.state(R.id);if(e.gold<0&&PL.gold<-e.gold){addLog('Je hebt niet genoeg goud. Het volk is teleurgesteld.','#e5766a');st.joy=Math.max(0,(st.joy||50)-2);return}
  if(e.gold)PL.gold+=e.gold;if(e.rep)giveRep(e.rep,'een wijs besluit');st.joy=Math.max(0,Math.min(100,(st.joy||50)+(e.joy||0)));
  addLog(e.joy>0?'Het volk van '+R.name+' is blij met je besluit ('+(e.joy>0?'+':'')+e.joy+').':e.joy<0?'Het volk van '+R.name+' moppert ('+e.joy+').':'Het volk knikt.',e.joy>=0?'#9cc552':'#e5766a');
  if(c&&!c.dead)saySomething(c,e.joy>0?pick(['Dank u, Majesteit!','U bent wijs en goed!','Lang leve de troon!']):e.joy<0?pick(['Hm... zoals u wilt.','Dat is niet eerlijk...']):'Goed, Majesteit.',3)}
/* ---------- a royal wedding ---------- */
const HEIRS={eik:['Prinses Adelheid','Prins Aldric'],zib:['Jonkvrouw Margriet','Jonker Willem'],zh:['Prinses Isadora','Prins Lorenzo'],ysd:['Prinses Freya','Prins Bjorn'],aur:['Prinses Livia','Prins Lucius'],drk:['Prinses Ravenna','Prins Draven'],
  qad:['Prinses Yasmina','Prins Karim'],hgm:['Prinses Brunhilde','Prins Otto'],val:['Prinses Elise','Prins Florian'],roz:['Prinses Rosalind','Prins Roderik']};
Object.assign(LINES,{spouse:['Daar ben je, mijn liefste!','Hoe was je avontuur?','Ik heb je gemist.','Ons rijk is trots op je.','Blijf je vanavond thuis?']});
const _dmH=dlgMain;dlgMain=function(a,text){_dmH(a,text);try{const box=document.querySelector('#dlg #dopts');if(!box||!a.ruler||KG.isMine(a.ruler)||(PL.fx&&PL.fx.spouse))return;const R=KG.realm(a.ruler);if(!R)return;
  const b=document.createElement('button');b.className='btn';const rel=KG.rel(R.id);
  if(rel>=60){b.textContent='💍 Vraag om een koninklijk huwelijk';b.onclick=()=>{closeModals();const [pa,pr]=HEIRS[R.id]||['Prinses '+R.name,'Prins '+R.name];card('💍 Een koninklijk huwelijk','"Ons rijk en het jouwe zijn vrienden," zegt '+a.name+'. "Met wie wil je trouwen?"',[['Trouw met '+pa,()=>wed(R,pa)],['Trouw met '+pr,()=>wed(R,pr)],['Nog niet',()=>{}]])}}
  else if(rel>=25){b.textContent='💍 Over een huwelijk...';b.onclick=()=>{closeModals();card(a.name,'"Een huwelijk? Daarvoor moeten onze rijken eerst echte bondgenoten zijn." (Vraag om een bondgenootschap of geef geschenken.)',null,8)}}else return;box.appendChild(b)}catch(e){console.warn('huwelijk dlg',e)}};
function wed(R,name){PL.fx=PL.fx||{};PL.fx.spouse={name,realm:R.id};try{KG.addRel(R.id,100)}catch(e){}PL.gold+=3000;giveRep(10,'een koninklijk huwelijk');giveXp(1200);party(8);gather(R,['Leve het bruidspaar!','Hoera! Een bruiloft!','Wat een mooi paar!'],12);
  card('💍 Een koninklijke bruiloft!','In de grote zaal van '+R.name+' trouw je met '+name+'. De klokken luiden in heel het land, er wordt gedanst tot de ochtend. Je krijgt een bruidsschat van 3000 goud en '+R.name+' is voor altijd je bondgenoot. '+name+' gaat bij jou thuis wonen.',null,14);
  chron('Trouwde met '+name+' van '+R.name+'.');setTimeout(spawnSpouse,4000)}
let SP=null;
function homePos(){const R=(KG.realms||[]).find(R=>R.throne&&!R.cave&&KG.isMine(R.id));if(R)return{x:R.throne.x+5,z:R.throne.z+4};return{x:6,z:-2}}
function spawnSpouse(){const s=PL.fx&&PL.fx.spouse;if(!s||(SP&&!SP.dead))return;const p=homePos();SP=spawnNPC('lord',p.x,p.z,{name:s.name,ai:'stay',line:'spouse'});SP.spouse=true;SP.friend=100}
const _sgH=startGame;startGame=function(...a){_sgH(...a);SP=null;setTimeout(()=>{try{spawnSpouse()}catch(e){}},5000)};
WD.court={crown,audience,wed,PETS};
})();
