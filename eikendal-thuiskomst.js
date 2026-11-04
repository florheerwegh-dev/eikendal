/* ================= Coming home from an adventure =================
   When you come back from an adventure (a good while away from the realms, or far places such as the dinosaur world,
   Noordheim, the caves or the World Tree) and walk into a realm that likes you, the news has gone ahead of you: the
   bells ring, people run out to you, cheer, dance and press gifts into your hands (food, the local specialty, gold,
   flowers), a minstrel sings a song about what you did, a friendly ruler sends a present, and the inn throws a
   welcome feast for you. In your own realm a fanfare sounds and the knights salute. At war, or wanted, nobody comes. */
(function(){
const KG=WD.kingdom,GL=WD.great||{},rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{KG.card(t,x,b,s)}catch(e){addLog(t+': '+x)}};
Object.assign(ITEMS,{
  bloemen:{n:'Bos bloemen',g:'mat',price:6,ico:'💐',desc:'Geplukt door een blij kind, speciaal voor jou.'},
  feesttaart:{n:'Feesttaart',g:'food',heal:50,stam:40,price:30,ico:'🎂'},
  erepenning:{n:'Erepenning',g:'mat',price:250,ico:'🏅',rar:'r',desc:'Een gouden penning die het volk liet slaan ter ere van jouw terugkeer.'}});
const me=()=>(PL.look&&PL.look.name)||'Reiziger';
const kills=()=>{let n=0;for(const k in PL.kills||{})n+=PL.kills[k];return n};
const ADV=()=>{PL.fx=PL.fx||{};return PL.fx.adv=PL.fx.adv||{t:0,places:[],k0:kills(),g0:PL.gold}};
const SPECIAL=['het Wolkenrijk','de Oertijd','Noordheim','de diepe grotten','het Eiland van de Wereldboom'];
/* ---------- where am I: in a realm, or out on an adventure? ---------- */
function realmHere(){if(!KG||!KG.ready||!KG.realms)return null;for(const R of KG.realms){if(!R.throne||!R.areas||!!R.cave!==!!PL.inCave)continue;try{if(KG.inArea(R,PL.x,PL.z))return R}catch(e){}}return null}
function placeName(){const rg=WD.region&&WD.region(PL.x);if(rg)return rg.adv;if(PL.x>30000)return'de Oertijd';if(PL.x<-30000)return'Noordheim';if(PL.inCave)return'de diepe grotten';const s=siteAt(PL.x,PL.z);if(s&&s.id==='wereldboom')return'het Eiland van de Wereldboom';return s&&s.name&&s.id!=='bridge'?s.name:null}
const worthy=A=>A.t>=60&&(A.t>=240||A.places.length>=3||(A.places.length>=1&&A.t>=120)||A.places.some(p=>SPECIAL.includes(p)));
function friendly(R){if(KG.isMine(R.id))return true;if(KG.atWar(R.id)||KG.rel(R.id)<=-25)return false;return PL.rep>-20&&!(PL.bounty>0)}
const H={on:false,pending:null,cur:undefined,acc:0};
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;H.acc+=dt;if(H.acc<.5)return;const st=Math.min(2,H.acc);H.acc=0;if(!started||PL.dead)return;
  const R=realmHere(),A=ADV();
  if(!R){A.t+=st;const n=placeName();if(n&&!A.places.includes(n)){A.places.push(n);if(A.places.length>8)A.places.shift()}}
  if(H.cur===undefined){H.cur=R;return}
  if(R!==H.cur){H.cur=R;if(R&&worthy(A)&&friendly(R)&&PL.t-(KG.state(R.id).lastHome||-1e9)>300)H.pending={R,A:{...A,places:[...A.places]}}}
  if(R&&!H.pending){A.t=0;A.places=[];A.k0=kills();A.g0=PL.gold}
  if(H.pending&&!H.on&&!(window.CIN&&CIN.on)){const p=H.pending;H.pending=null;if(realmHere()===p.R)try{welcome(p.R,p.A)}catch(e){console.warn('thuiskomst',e);H.on=false}}});
/* ---------- the story of your adventure, for the card and the minstrel ---------- */
function deeds(A){const pl=A.places.slice(-3),k=Math.max(0,kills()-(A.k0||0)),g=Math.round(PL.gold-(A.g0||PL.gold));
  const list=pl.length>1?pl.slice(0,-1).join(', ')+' en '+pl[pl.length-1]:pl[0]||null;return{list,k,g,min:Math.max(1,Math.round(A.t/60))}}
/* ---------- the sounds of a happy town: church bells, and a fanfare for its own ruler ---------- */
function bell(f,delay){try{if(!AC)sfx('click');const t=AC.currentTime+delay;for(const [m,v] of[[1,.13],[2.01,.06],[2.76,.04],[4.07,.025]]){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f*m;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0005,t+2.4/m+.4);o.connect(g);g.connect(MASTER);o.start(t);o.stop(t+3)}}catch(e){}}
function bells(){[523,440,392,523,440,392,349,392].forEach((f,i)=>bell(f,i*.55))}
function fanfare(){try{if(!AC)sfx('click');const t0=AC.currentTime+.1;[[392,0,.18],[523,.2,.18],[659,.4,.18],[784,.6,.5],[659,1.15,.16],[784,1.33,.8]].forEach(([f,t,d])=>{const o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;o.type='sawtooth';o.frequency.value=f;g.gain.setValueAtTime(0,t0+t);g.gain.linearRampToValueAtTime(.07,t0+t+.03);g.gain.setValueAtTime(.07,t0+t+d*.8);g.gain.exponentialRampToValueAtTime(.0005,t0+t+d+.15);o.connect(lp);lp.connect(g);g.connect(MASTER);o.start(t0+t);o.stop(t0+t+d+.2)})}catch(e){}}
/* confetti and petals thrown over you */
function confetti(sec){if(!(window.PW&&PW.ps))return;const C=[[1,.85,.3],[1,.45,.6],[.6,.85,1],[1,1,1],[.7,1,.5],[1,.6,.2]];let n=0;const iv=setInterval(()=>{if(++n>sec*4){clearInterval(iv);return}
  for(let i=0;i<16;i++){const c=pick(C),a=Math.random()*6.283,r=Math.random()*4;pwEm(PW.ps,PL.x+Math.cos(a)*r,PL.y+4+Math.random()*2,PL.z+Math.sin(a)*r,rr(1.4),.4+Math.random(),rr(1.4),3.2,.16,.12,c,c,1,-1.1,.6)}},250)}
/* ---------- the gifts ---------- */
function gift(R,own){const loc=Object.keys(ITEMS).filter(id=>(ITEMS[id].n||'').endsWith(' uit '+R.name)&&(ITEMS[id].price||0)<=150),
    reg=GL.localGoods?GL.localGoods(R.throne.x,R.throne.z).filter(id=>(ITEMS[id].price||0)<=150):[],here=loc.length?loc:reg,r=Math.random();
  if(r<.22)return{gold:Math.round(own?rnd(20,60):rnd(6,30))};
  if(r<.44&&here.length)return{id:pick(here),n:1};
  if(r<.56)return{id:'bloemen',n:1};
  if(r<.64)return{id:'feesttaart',n:1};
  const food=['bread','apple','cheese','ale','roast','stew','potion'].filter(id=>ITEMS[id]);return{id:pick(food),n:pick([1,1,2])}}
function handOver(a,c){const g=c.gift;if(!g)return;let txt;
  if(g.gold){PL.gold+=g.gold;sfx('coin');txt=g.gold+' goud'}else{giveItem(g.id,g.n,true);sfx('pickup');txt=(g.n>1?g.n+'× ':'')+ITEMS[g.id].n}
  H.got.push(txt);floatText(a.x,(a.y||0)+2.4,a.z,'🎁 '+txt,'#ffd27a');addLog(a.name+' geeft je '+txt+'!','#ffd27a');a.friend=Math.min(100,(a.friend||0)+6);saySomething(a,pick(['Hier, dit is voor jou!','Voor onze held!','Neem maar, je hebt het verdiend!','Een cadeautje, van ons allemaal!']),2.6)}
function dance(a,sec){const h=a.h;if(h&&h.sk){h.onceName='Dance_Loop';h.onceT=sec}}
/* ---------- the welcome ---------- */
function welcome(R,A){H.on=true;H.got=[];const own=KG.isMine(R.id),rel=KG.rel(R.id),st=KG.state(R.id),D=deeds(A),title=own?KG.title(R.id):me(),near=a=>Math.hypot(a.x-PL.x,a.z-PL.z);
  st.lastHome=PL.t;st.homes=(st.homes||0)+1;
  const visible=a=>a.h&&a.root&&a.root.visible!==false&&!a.inHome&&!a.cheer&&!a.dead&&!a.gone;
  let ppl=(KG.citizens(R.id)||[]).filter(a=>visible(a)&&near(a)<80);
  if(ppl.length<6)ppl=ppl.concat(actors.filter(a=>a.kind==='npc'&&!a.guard&&a.job!=='lord'&&visible(a)&&near(a)<60&&!ppl.includes(a)&&a.ai!=='travel'));
  ppl.sort((a,b)=>near(a)-near(b));ppl=ppl.slice(0,own?14:rel>=25?11:8);
  const guards=(KG.knights(R.id)||[]).filter(a=>visible(a)&&near(a)<45&&!(typeof nearEnemy==='function'&&nearEnemy(a))).slice(0,8);
  const cheers=own?['Lang leve '+title+'!','Onze '+R.title[(PL.look&&PL.look.fem)?1:0].toLowerCase()+' is terug!','Hoera! Hoera!','We hebben je zo gemist!','Welkom thuis!']
    :['Hoera! Je bent terug!','Welkom terug, '+me()+'!','We hebben over je avonturen gehoord!','Kijk, daar is '+me()+'!','Wat ben je dapper!','Hoera voor de held!','Vertel, vertel! Hoe was het?'];
  const n=ppl.length,a0=Math.random()*6.283;
  ppl.forEach((a,i)=>{a.cheer={t:24+Math.random()*6,ang:a0+i/Math.max(1,n)*6.283,r:2.4+(i%2)*1.6+Math.random()*.8,delay:.4+i*.3,lines:cheers,gift:gift(R,own)};a.talk=null;a.route=null;a.wp=null});
  guards.forEach((a,i)=>{a.cheer={t:12,salute:true,delay:0,lines:own?['Lang leve '+title+'!','Eer aan '+title+'!']:['Eer aan '+me()+'!','Welkom terug, held!']}});
  bells();if(own)setTimeout(fanfare,600);sfx('quest');confetti(7);if(guards[0]&&own)saySomething(guards[0],'Hoor! Hoor! '+title+' is teruggekeerd!',4);
  const where=D.list?' van je tocht naar '+D.list:'';
  card(own?'🎺 '+R.name+' viert feest!':'🎉 Welkom terug in '+R.name+'!',(own?'Het nieuws'+where+' ging je voor. De klokken luiden en je volk stroomt de straat op om '+title+' te begroeten!':'Het nieuws'+where+' ging je voor. De klokken luiden, de mensen lopen naar buiten, juichen en willen je allemaal iets geven!'),null,7);
  addLog((own?'🎺 ':'🎉 ')+R.name+' ontvangt je als een held!','#ffd27a');try{WD.chron.add('Als een held onthaald in '+R.name+(D.list?', na een tocht naar '+D.list:'')+'.')}catch(e){}
  giveRep(own?3:2,'een warm welkom in '+R.name);try{KG.addRel(R.id,3)}catch(e){}if(own)st.joy=Math.min(100,(st.joy||50)+8);
  /* a minstrel sings about what you did */
  const bard=ppl.find(a=>/villager|farmer|merchant|traveler/.test(a.job||'')&&!/^(Burgemeester|Heer|Vrouwe) /.test(a.name))||ppl[Math.min(1,n-1)];if(bard){const k=D.k,song=['🎵 Hoor het lied van '+me()+'!',D.list?'🎵 Die trok naar '+D.list+'...':'🎵 Die trok '+D.min+' minuten de wijde wereld in...',k>0?'🎵 Versloeg er '+k+' '+(k===1?'monster':'monsters')+', groot en klein...':'🎵 Trotseerde wind en regen, zon en maan...',D.g>40?'🎵 Kwam terug met '+D.g+' goud in de buidel...':'🎵 En kwam heelhuids weer thuis...','🎵 Hoera, hoera, '+me()+' is weer hier!'];
    song.forEach((l,i)=>setTimeout(()=>{if(bard.dead)return;saySomething(bard,l,3.4);addLog(l,'#d7c3ff');if(i===song.length-1)dance(bard,3)},5500+i*3600))}
  setTimeout(()=>{const extra=[];
    if(!own&&rel>=25&&R.rulerName){const g=Math.round(rnd(100,260));PL.gold+=g;extra.push(R.rulerName+' stuurt een bode met '+g+' goud als welkomstgeschenk.')}
    if(st.homes%3===0){giveItem('erepenning',1,true);extra.push('Het volk heeft zelfs een Erepenning voor je laten slaan!')}
    const got=H.got.length?'Je kreeg: '+H.got.join(', ')+'.':'De mensen zwaaien en juichen voor je.';
    card('🎁 Wat een ontvangst!',got+(extra.length?' '+extra.join(' '):'')+' De herbergier roept: "Vanavond is er een welkomstfeest, voor jou!"',[['🍗 Naar het welkomstfeest',()=>feast(R,ppl)],['Bedankt allemaal!',()=>{for(const a of ppl)if(a.cheer)saySomething(a,pick(['Graag gedaan!','Kom snel weer terug!','Tot ziens, held!']),2.5)}]]);
    H.on=false},19000)}
function feast(R,ppl){PL.hp=PL.hpMax;PL.st=PL.stMax;PL.buff={t:600,fx:{hp:30,regen:1.5,stam:20}};try{recalcGear()}catch(e){}sfx('eat');bells();confetti(4);
  for(const a of ppl)if(a.cheer){a.cheer.t=Math.max(a.cheer.t,10);dance(a,4);saySomething(a,pick(['Proost!','Op '+me()+'!','Nog een stukje taart?','Muziek! Dansen!']),3)}
  card('🍗 Het welkomstfeest','Er wordt gegeten, gedronken, gedanst en gezongen tot diep in de nacht. Je buik is rond en je hart is warm: 10 minuten lang heb je meer leven, meer uithouding en genees je vanzelf.',null,8)}
/* ---------- what cheering people do: run to you, stand around you, dance, give, wave ---------- */
const face=(a,dt)=>{a.rot+=angDiff(a.rot,Math.atan2(PL.x-a.x,PL.z-a.z))*Math.min(1,dt*6)};
const _uNH=updateNPC;updateNPC=function(a,dt){const c=a&&a.cheer;if(!c)return _uNH(a,dt);
  c.t-=dt;const d=Math.hypot(PL.x-a.x,PL.z-a.z);
  if(c.t<=0||a.dead||a.state==='flee'||a.state==='fight'||d>60||PL.dead||(c.salute&&typeof nearEnemy==='function'&&nearEnemy(a))){a.cheer=null;a.wp=null;a.vel=0;return _uNH(a,dt)}
  if(a.sayT>0){a.sayT-=dt;if(a.sayT<=0)a.say=''}
  if(c.delay>0){c.delay-=dt;a.vel=0;face(a,dt)}
  else if(c.salute){a.vel=0;face(a,dt)}
  else{const tx=PL.x+Math.sin(c.ang)*c.r,tz=PL.z+Math.cos(c.ang)*c.r;c.run=(c.run||0)+dt;
    const there=Math.hypot(tx-a.x,tz-a.z)<1||(c.run>9&&d<9);
    if(!there)stepTo(a,dt,tx,tz,c.gave?2.4:4.4,.9);
    if(there||a.vel<.3){a.vel=0;face(a,dt);if(!c.gave){c.wait=(c.wait||0)+dt;if(c.wait>.3&&!c.danced){c.danced=true;dance(a,1.8)}if(c.wait>2.2){c.gave=true;handOver(a,c)}}else if(Math.random()<dt*.12)dance(a,2.2)}}
  if(!(a.sayT>0)&&Math.random()<dt*.3)saySomething(a,pick(c.lines),2.4);
  if(a.h)animHuman(a.h,dt,a.vel,{wave:!c.salute&&a.vel<.3})};
WD.homecoming={welcome:R=>welcome(typeof R==='string'?KG.realm(R):R,ADV()),adv:ADV,here:realmHere,bells,fanfare,confetti};
})();
