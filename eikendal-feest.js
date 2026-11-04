/* ================= Feest en avontuur: more medieval fun =================
   - Het Grote Toernooi: in the Arena van Aurelia, Arenameester Brutus lets you fight three champions in a row.
     Win all three and you are the champion: gold and the Kampioensbeker.
   - Het drakenei: one lies in the Drakennest (the wizard of the Witte Toren also sells one). Carry it for a while and it
     hatches: Vonkje, a baby dragon that flies with you and breathes fire at monsters that attack you.
   - Volle maan: every fourth night the moon is full and werewolves prowl around the villages until dawn.
   - De brugtrol: Grommel the troll sits at the Steenbrug and asks a riddle. Answer well and get a reward; answer wrong and
     pay, or fight.
   - De kermis: a fair beside Eikendal with a carousel, a strength tester with a bell, and Madame Mira who tells your
     fortune (and gives you a little luck). */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}};
const F={};WD.feest=F;
Object.assign(ITEMS,{kampioensbeker:{n:'Kampioensbeker',g:'mat',price:900,ico:'🏆',rar:'l',desc:'Gewonnen in het Grote Toernooi van Aurelia.'},drakenei:{n:'Drakenei',g:'mat',price:2500,ico:'🥚',rar:'l',desc:'Het is warm en het beweegt soms... Draag het bij je en het komt uit.'},
  weerwolfvacht:{n:'Weerwolfvacht',g:'mat',price:220,ico:'🐺',rar:'e'}});
/* ---------- the tournament ---------- */
const TN={on:false,round:0,cur:null};
const CH=[{n:'Kampioen Brutus de Jongere',hp:320,dmg:16},{n:'Kampioene Valeria met de Twee Zwaarden',hp:520,dmg:22},{n:'De Ongeslagen Gladiator Maximus',hp:850,dmg:30}];
function champion(){const S=SITE.arena;const c=CH[TN.round],k=1+Math.max(0,PL.lvl-5)*.06;let a=null;try{a=spawnEnemy('bandit',S.x+rr(4),S.z-6,{name:c.n,hp:Math.round(c.hp*k),hpMax:Math.round(c.hp*k),dmg:Math.round(c.dmg*k),xp:150+TN.round*150,aggro:40,provoked:true})}catch(e){}
  if(a){a.respawn=1e12;a.champ=true;try{a.root.scale.setScalar(1.08)}catch(e){}}TN.cur=a;card('⚔ Ronde '+(TN.round+1)+' van 3',c.n+' stapt de arena in. Het publiek juicht!',null,4);sfx('quest')}
function startTourney(){if(TN.on)return;if(PL.gold<100){addLog('Inschrijven kost 100 goud.','#e5766a');return}PL.gold-=100;TN.on=true;TN.round=0;closeModals();setTimeout(champion,1500)}
ANIMS.push(()=>{if(!TN.on||!TN.cur)return;const S=SITE.arena;
  if(PL.dead||Math.hypot(PL.x-S.x,PL.z-S.z)>70){TN.on=false;if(!TN.cur.dead){TN.cur.dead=true;TN.cur.gone=true;scene.remove(TN.cur.root)}TN.cur=null;card('Toernooi verloren','Je hebt de arena verlaten of bent gevallen. Probeer het nog eens!',null,6);return}
  if(TN.cur.dead){TN.cur=null;TN.round++;for(let i=0;i<5;i++)setTimeout(()=>floatText(S.x+rr(25),gy(S.x,S.z)+9,S.z+rr(20),pick(['Hoera!','Bravo!','Nog eens!','Kampioen!']),'#ffd27a'),i*250);
    if(TN.round>=3){TN.on=false;PL.gold+=1500;giveItem('kampioensbeker',1,true);giveXp(800);sfx('level');PL.fx=PL.fx||{};PL.fx.champion=(PL.fx.champion||0)+1;card('🏆 Kampioen van Aurelia!','Je hebt alle drie de kampioenen verslagen! Je krijgt 1500 goud en de Kampioensbeker. Heel Aurelia scandeert je naam.',null,10)}
    else setTimeout(champion,4000)}});
const gy=(x,z)=>groundH(x,z);
/* ---------- the dragon egg and Vonkje the baby dragon ---------- */
let egg=null;
function eggPickup(){if(!SITE.dragon||(PL.fx&&(PL.fx.eggFound||PL.fx.babyDragon)))return;const S=SITE.dragon;try{egg=makePickup(S.x+6,S.z+4,'drakenei',1)}catch(e){}}
ANIMS.push(dt=>{if(!started||PL.dead)return;PL.fx=PL.fx||{};if(hasItem('drakenei')){PL.fx.eggFound=1;PL.fx.eggT=(PL.fx.eggT||0)+(typeof dt==='number'?dt:.016);
    if(PL.fx.eggT>240&&!PL.fx.babyDragon){takeItem('drakenei',1);PL.fx.babyDragon={name:'Vonkje',t:PL.t};try{if(WD.spawnPet){const p=WD.spawnPet(PL.x+2,PL.z+2);p.name='Vonkje'}}catch(e){}sfx('level');card('🐉 Je drakenei is uitgekomen!','Krak! Uit het ei kruipt een klein rood draakje. Het kijkt je aan en niest een vonkje. Je noemt het Vonkje. Vonkje vliegt met je mee en spuwt vuur naar monsters die je aanvallen. Als ze groter wordt, kun je op haar rug vliegen!',null,12)}}});
const DR={g:null,cd:0};
function dragonModel(){const g=new T.Group(),red=new T.MeshStandardMaterial({color:0xb02a1a,roughness:.6}),gold=new T.MeshStandardMaterial({color:0xe0b04a,roughness:.5}),dk=new T.MeshStandardMaterial({color:0x1a1210});
  const add=(geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;g.add(o);return o};
  add(new T.SphereGeometry(.28,12,10),red,0,0,0).scale.set(1,.85,1.4);add(new T.SphereGeometry(.2,10,8),gold,0,-.07,.05).scale.set(.9,.7,1.2);
  const head=new T.Group();head.position.set(0,.22,.38);g.add(head);head.add(new T.Mesh(new T.SphereGeometry(.17,10,8),red));const sn=new T.Mesh(new T.BoxGeometry(.16,.12,.22),red);sn.position.z=.17;head.add(sn);
  for(const s of[-1,1]){const e=new T.Mesh(new T.SphereGeometry(.035,6,5),new T.MeshBasicMaterial({color:0xffd040}));e.position.set(s*.08,.06,.12);head.add(e);const h=new T.Mesh(new T.ConeGeometry(.03,.14,6),gold);h.position.set(s*.07,.15,-.05);h.rotation.x=-.5;head.add(h)}
  const tail=add(new T.ConeGeometry(.1,.7,8),red,0,-.02,-.6,-Math.PI/2);const wings=[];for(const s of[-1,1]){const piv=new T.Group();piv.position.set(s*.18,.12,0);const w=new T.Mesh(new T.PlaneGeometry(.6,.4),new T.MeshStandardMaterial({color:0x8a1a12,side:T.DoubleSide}));w.position.x=s*.3;w.rotation.x=-Math.PI/2;piv.add(w);g.add(piv);wings.push({piv,s})}
  scene.add(g);return{g,wings,head,tail}}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;const want=false;/* Vonkje is now the same dragon as Vonk (eikendal-dragon.js): she grows up and you can fly on her */if(!want){if(DR.g)DR.g.g.visible=false;return}if(!DR.g)DR.g=dragonModel();const m=DR.g;m.g.visible=true;const t=PL.t;
  const side=Math.sin(t*.5)*1.2,fx=Math.sin(PL.rot),fz=Math.cos(PL.rot),tx=PL.x-fx*1.6+fz*(1.4+side*.3),tz=PL.z-fz*1.6-fx*(1.4+side*.3),ty=PL.y+2.3+Math.sin(t*2.1)*.25;
  m.g.position.lerp(new T.Vector3(tx,ty,tz),Math.min(1,dt*3.5));for(const w of m.wings)w.piv.rotation.z=w.s*Math.sin(t*12)*.7;m.tail.rotation.y=Math.sin(t*3)*.3;
  /* fire at the nearest monster that is after you */
  DR.cd-=dt;let tg=null,bd=13;for(const a of actors){if(a.dead||a.kind!=='enemy'||a.passive||!(a.state==='chase'||a.provoked))continue;if(Math.abs(a.x-PL.x)>14)continue;const d=Math.hypot(a.x-PL.x,a.z-PL.z);if(d<bd){bd=d;tg=a}}
  const face=tg?Math.atan2(tg.x-m.g.position.x,tg.z-m.g.position.z):PL.rot;m.g.rotation.y+=angDiff(m.g.rotation.y,face)*Math.min(1,dt*6);
  if(tg&&DR.cd<=0){DR.cd=2.6;const p=m.g.position,dx=tg.x-p.x,dz=tg.z-p.z,dy=(tg.y||0)+1-p.y,l=Math.hypot(dx,dy,dz)||1;
    if(window.PW&&PW.ps)for(let i=0;i<28;i++)pwEm(PW.ps,p.x,p.y+.2,p.z,dx/l*12+rr(1.5),dy/l*12+rr(1.5),dz/l*12+rr(1.5),.7,.4,.1,[1,.8,.3],[1,.2,0],1,0,1);
    setTimeout(()=>{if(!tg.dead)hitActor(tg,18+PL.lvl*2.2,true)},250);if(Math.random()<.3)floatText(p.x,p.y+.6,p.z,'Pfffff!','#ffb050')}});
/* ---------- full moon and werewolves ---------- */
let lastT=null,wolves=[];
ANIMS.push(()=>{if(!started||PL.dead||PL.inCave)return;PL.fx=PL.fx||{};const t=ENV.time;if(lastT===null){lastT=t;return}
  if(lastT<21&&t>=21){PL.fx.nights=(PL.fx.nights||0)+1;if(PL.fx.nights%4===0)fullMoon()}
  if(lastT<6&&t>=6&&wolves.length){for(const a of wolves)if(!a.dead){a.dead=true;a.gone=true;a.respawn=1e12;scene.remove(a.root)}wolves=[];addLog('De zon komt op. De weerwolven worden weer gewone mensen...','#e0b04a')}lastT=t});
function fullMoon(){const V=[SITE.village,SITE.hamlet,SITE.farm,SITE.town].filter(Boolean);card('🌕 Volle maan','Het is volle maan! Er worden verhalen gefluisterd over weerwolven rond de dorpen. Blijf binnen... of ga op jacht.',null,9);sfx('quest');
  for(const S of V)for(let k=0;k<2;k++){const a0=Math.random()*6.283,r=60+Math.random()*40,x=S.x+Math.cos(a0)*r,z=S.z+Math.sin(a0)*r;if(groundH(x,z)<1)continue;
    try{const a=spawnEnemy('wolf',x,z,{name:'Weerwolf',hp:420,hpMax:420,dmg:24,xp:300,speed:7.4,aggro:32,hh:2.2});a.were=true;a.respawn=1e12;try{a.root.scale.setScalar(1.7);a.root.traverse(o=>{if(o.isMesh&&o.material&&o.material.color){o.material=o.material.clone();o.material.color.multiplyScalar(.45)}})}catch(e){}wolves.push(a)}catch(e){}}}
F.fullMoon=fullMoon;
const _kaF=killActor;killActor=function(a,by){_kaF(a,by);if(a&&a.were&&by){giveItem('weerwolfvacht',1);PL.gold+=80;floatText(a.x,a.y+2.4,a.z,'+80 goud','#ffd27a')}};
/* peaceful creatures (the troll, the plant-eating dinosaurs) only fight once you hit them */
const _htF=hostileToPlayer;hostileToPlayer=function(a){if(a&&a.passive&&!a.provoked)return false;return _htF(a)};
/* ---------- the riddle troll at the Steenbrug ---------- */
const RID=[['Hoe meer je ervan wegneemt, hoe groter het wordt. Wat is het?',['Een gat','Een berg','Een rivier']],['Het heeft een kop en een staart, maar geen lijf. Wat is het?',['Een munt','Een slang','Een komeet']],
  ['Wat loopt altijd, maar heeft geen benen?',['Een rivier','Een slak','Een paard']],['Wat wordt natter naarmate het meer droogt?',['Een handdoek','Een spons','Een vis']],['Wat is van jou, maar gebruiken anderen meer dan jij?',['Je naam','Je zwaard','Je paard']],
  ['Wat heeft tanden, maar kan niet bijten?',['Een kam','Een draak','Een wolf']],['Ik heb steden maar geen huizen, bossen maar geen bomen, en water maar geen vissen. Wat ben ik?',['Een kaart','Een droom','Een schilderij']],
  ['Wat valt maar breekt nooit, en wat breekt maar valt nooit?',['De nacht en de dag','Regen en glas','Een blad en een tak']],['Hoe meer er van is, hoe minder je ziet. Wat is het?',['Duisternis','Mist','Sneeuw']]];
let troll=null;
function riddle(){if(!troll||troll.dead){addLog('De brugtrol is er niet.');return}if(troll.provoked){addLog('Grommel is veel te boos om te praten!','#e5766a');return}const [q,ans]=pick(RID),opts=ans.map((t,i)=>[t,i===0]).sort(()=>Math.random()-.5);
  card('🧌 Grommel de brugtrol','"Wie over MIJN brug wil, moet eerst een raadsel oplossen! HÈHÈ!" '+q,opts.map(([t,ok])=>[t,()=>{if(ok){giveXp(60);PL.gold+=40;sfx('coin');card('🧌 Grommel','"Grrr... goed geraden. Hier, 40 goud. Ga maar verder."',null,5)}
    else card('🧌 Grommel','"FOUT! HÈHÈHÈ! Betaal 25 goud, of ik plet je!"',[['Betaal 25 goud',()=>{PL.gold=Math.max(0,PL.gold-25);addLog('Je betaalt de trol 25 goud.')}],['Vecht!',()=>{troll.aggro=24;troll.provoked=true;troll.passive=false;floatText(troll.x,troll.y+4,troll.z,'GRAAAH!','#ff7a4a')}]])}]))}
/* ---------- the fair ----------
   A medieval fair beside Eikendal: an entrance arch, striped pavilions, a carousel of wooden horses under a pavilion
   roof, a wooden wheel with hanging gondolas, an archery range, a pig roasting on a spit, a stage with a bard and a
   juggling jester, a strength tester, benches and tables, and strings of lanterns that glow at night. */
const FAIR={};
function findFair(){for(let i=0;i<600;i++){const a=Math.random()*6.283,r=95+Math.random()*80,x=Math.cos(a)*r,z=Math.sin(a)*r;let ok=true;const h0=terrainH(x,z);
  for(let k=0;k<20&&ok;k++){const rr2=k<10?18:30,px=x+Math.cos(k*.63)*rr2,pz=z+Math.sin(k*.63)*rr2,h=terrainH(px,pz);if(h<1.6||h>40||Math.abs(h-h0)>2.6||roadDist(px,pz)<3||inBuilding(px,pz,2)||Math.abs(px-riverX(pz))<22||forestDensity(px,pz)>.3)ok=false}
  if(ok&&!siteAt(x,z))return{x,z}}return{x:60,z:-70}}
const sm=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.85,...o});
function horse(col,saddle){const h=new T.Group(),b=sm(col),dk=sm(0x2a1a10),sd=sm(saddle),gold=MAT.gold||sm(0xd8a83a);
  const add=(geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;h.add(o);return o};
  add(new T.SphereGeometry(.42,12,10),b,0,0,0).scale.set(.75,.8,1.5);add(new T.CylinderGeometry(.14,.2,.7,8),b,0,.38,.52,-.7);add(new T.BoxGeometry(.22,.24,.52),b,0,.66,.86,.35);add(new T.BoxGeometry(.06,.3,.42),dk,0,.62,.62,-.6);
  for(const [x,z,rx] of[[.18,.4,-.6],[-.18,.4,.3],[.18,-.4,.7],[-.18,-.4,-.3]]){add(new T.CylinderGeometry(.06,.05,.62,6),b,x,-.42,z,rx)}add(new T.ConeGeometry(.09,.55,6),dk,0,.02,-.72,-2.3);
  add(new T.BoxGeometry(.5,.08,.55),sd,0,.33,.02);add(new T.CylinderGeometry(.035,.035,3.4,6),gold,0,.9,0);return h}
function buildFair(){const p=findFair(),y=gy(p.x,p.z),cols=[0xc0392b,0xe0b04a,0x2f6fa5,0x3a8a3a,0x8a3aa8];FAIR.x=p.x;FAIR.z=p.z;
  /* no trees or rocks on the fairground */
  {const gone=(x,z)=>Math.hypot(x-p.x,z-p.z)<36;for(const t of TREES.oak.concat(TREES.pine))if(!t.cut&&gone(t.x,t.z)){t.cut=true;t.gone=true;if(t.col)t.col.off=true;try{if(t.lodM)asLow(t,false);else setInst(t.ii||[],false,[])}catch(e){}}
    for(const q of ROCKS)if(!q.cut&&gone(q.x,q.z)){q.cut=true;if(q.col)q.col.off=true;try{q.inst.setMatrixAt(q.i,new T.Matrix4().makeScale(0,0,0));q.inst.instanceMatrix.needsUpdate=true}catch(e){}}try{asTreesUpdate(true)}catch(e){}}
  const P=(dx,dz)=>({x:p.x+dx,z:p.z+dz}),face=(q)=>Math.atan2(p.x-q.x,p.z-q.z);
  /* the carousel: wooden horses on golden poles under a striped pavilion roof */
  {const car=new T.Group();car.position.set(p.x,y,p.z);scene.add(car);if(window.medTent)medTent(p.x,p.z,{r:5.4,walls:false,lift:3.6,hr:3.2,n:20,pal:[0xf2ece0,0xc0392b,0xe0b04a],ropes:false});
    const ride=new T.Group();car.add(ride);ride.add(mesh(new T.CylinderGeometry(4.6,4.7,.35,24),MAT.wood,0,.3,0));ride.add(mesh(new T.CylinderGeometry(.5,.5,3.4,12),sm(0xc0392b),0,2,0));
    const HC=[[0xf2ece0,0xc0392b],[0x8a5a3a,0x2f6fa5],[0x2a2420,0xe0b04a],[0xf2ece0,0x3a8a3a],[0xb08a5a,0x8a3aa8],[0xf2ece0,0x2f6fa5],[0x5a3a28,0xc0392b],[0x2a2420,0x3a8a3a]];
    FAIR.horses=[];for(let i=0;i<8;i++){const a=i/8*6.283,hx=Math.sin(a)*3.5,hz=Math.cos(a)*3.5,h=horse(...HC[i]);h.position.set(hx,1.45,hz);h.rotation.y=a+Math.PI/2;ride.add(h);FAIR.horses.push(h)}
    addCircle(p.x,p.z,4.8);FAIR.ride=ride;addInter(p.x+5.6,p.z,3.4,'Ritje in de draaimolen (2 goud)',()=>rideOn('carousel'))}
  /* the wooden wheel */
  {const q=P(22,-4),yy=gy(q.x,q.z),ry=face(q)+Math.PI/2,W=new T.Group();W.position.set(q.x,yy,q.z);W.rotation.y=ry;scene.add(W);const wood=MAT.wood,R=6.2,H=7.4;
    for(const sx of[-1,1])for(const sz of[-1.2,1.2]){const leg=mesh(new T.BoxGeometry(.3,H*1.08,.3),wood,sx*1.7,H/2,sz*1.6);leg.rotation.z=-sx*.0;leg.rotation.x=-Math.sign(sz)*.21;W.add(leg)}
    {const axle=mesh(new T.CylinderGeometry(.18,.18,4,10),MAT.iron||wood,0,H,0);axle.rotation.z=Math.PI/2;W.add(axle)}
    const wheel=new T.Group();wheel.position.set(0,H,0);W.add(wheel);for(const sx of[-1.3,1.3]){const rim=new T.Mesh(new T.TorusGeometry(R,.12,6,40),wood);rim.position.x=sx;rim.rotation.y=Math.PI/2;wheel.add(rim);
      for(let k=0;k<8;k++){const sp=mesh(new T.BoxGeometry(.1,R*2,.1),wood,sx,0,0);sp.rotation.x=k/8*Math.PI;wheel.add(sp)}}
    FAIR.gond=[];for(let k=0;k<8;k++){const gd=new T.Group();const c=cols[k%cols.length];gd.add(mesh(new T.BoxGeometry(2.2,.8,1.1),sm(c),0,-.9,0));gd.add(mesh(new T.BoxGeometry(2.4,.12,1.3),MAT.wood,0,-.45,0));{const _m=mesh(new T.ConeGeometry(.9,.6,4),sm(0xe0b04a),0,-.05,0);_m.rotation.y=.78;gd.add(_m)};
      W.add(gd);FAIR.gond.push({g:gd,a:k/8*6.283})}FAIR.wheel={wheel,R,H};addBox(q.x-2.2,q.z-2.2,q.x+2.2,q.z+2.2);addInter(q.x,q.z,5,'Ritje in het reuzenrad (3 goud)',()=>rideOn('wheel'))}
  /* pavilions round the edge */
  FAIR.tents={};for(const [k,dx,dz,r,pal] of[['mira',-17,10,3.4,[0x6a2a5a,0xe0b04a,0xf2ece0]],['eten',-8,-20,3.8,[0xf2ece0,0xc0392b,0xe0b04a]],['spel',10,-21,3.2,[0xf2ece0,0x2f5a9a,0xe0b04a]],['wapen',-24,-6,3,[0x3a7a3a,0xf2ece0,0xe0b04a]],['mode',6,20,3,[0xe0b04a,0xc0392b,0x2f5a9a]]]){
    const q=P(dx,dz);if(window.medTent)medTent(q.x,q.z,{r,pal,ry:face(q),lamp:true});FAIR.tents[k]=q}
  /* the archery range */
  {FAIR.targets=[];const base=P(-18,-24);for(let k=0;k<3;k++){const q={x:base.x-6+k*6,z:base.z-12},yy=gy(q.x,q.z),T0=new T.Group();T0.position.set(q.x,yy,q.z);T0.rotation.y=face(q);scene.add(T0);
      {const _m=mesh(new T.CylinderGeometry(.95,.95,.35,20),MAT.hay||sm(0xd8b860),0,1.4,0);_m.rotation.x=Math.PI/2;T0.add(_m)};for(const [rad,c] of[[.85,0xf2ece0],[.66,0x2a2420],[.48,0x2f6fa5],[.3,0xc0392b],[.13,0xe0b04a]]){const ring=new T.Mesh(new T.CircleGeometry(rad,24),sm(c));ring.position.set(0,1.4,.18+(.9-rad)*.01);T0.add(ring)}
      for(const sx of[-.6,.6])T0.add(mesh(new T.BoxGeometry(.12,1.6,.12),MAT.wood,sx,.6,-.3));FAIR.targets.push(T0);addCircle(q.x,q.z,.9)}
    FAIR.shoot=base;scene.add(mesh(new T.BoxGeometry(14,.06,.3),sm(0xf2ece0),base.x,gy(base.x,base.z)+.03,base.z));addInter(base.x,base.z,4,'Boogschieten: drie pijlen (5 goud)',archery)}
  /* a pig on the spit over a fire */
  {const q=P(-8,-13),yy=gy(q.x,q.z);for(let k=0;k<8;k++){const a=k/8*6.283;scene.add(mesh(new T.DodecahedronGeometry(.32),MAT.rock||sm(0x777777),q.x+Math.cos(a)*.95,yy+.2,q.z+Math.sin(a)*.95))}
    for(const s of[-1,1]){const st=mesh(new T.BoxGeometry(.12,1.5,.12),MAT.wood,q.x+s*1.4,yy+.75,q.z);scene.add(st)}const spit=new T.Group();spit.position.set(q.x,yy+1.3,q.z);scene.add(spit);{const _m=mesh(new T.CylinderGeometry(.04,.04,3.2,6),MAT.iron||MAT.wood,0,0,0);_m.rotation.z=Math.PI/2;spit.add(_m)};
    const pig=new T.Group();spit.add(pig);const pk=sm(0xc8805a);{const _m=mesh(new T.SphereGeometry(.45,12,10),pk,0,0,0);_m.scale.set(1.6,.8,.85);pig.add(_m)};pig.add(mesh(new T.SphereGeometry(.24,10,8),pk,.78,.05,0));{const _m=mesh(new T.CylinderGeometry(.1,.12,.16,8),pk,.98,.03,0);_m.rotation.z=Math.PI/2;pig.add(_m)};
    FAIR.spit=spit;FAIR.fire={x:q.x,y:yy+.3,z:q.z};addCircle(q.x,q.z,1.3);try{LAMPS.push({x:q.x,y:yy+.6,z:q.z,flame:null,fire:true})}catch(e){}}
  /* the stage */
  {const q=P(16,14),yy=gy(q.x,q.z),ry=face(q),S0=new T.Group();S0.position.set(q.x,yy,q.z);S0.rotation.y=ry;scene.add(S0);S0.add(mesh(new T.BoxGeometry(7,.9,4.4),MAT.wood,0,.45,0));
    for(const sx of[-3.3,3.3])S0.add(mesh(new T.BoxGeometry(.25,4.6,.25),MAT.wood,sx,2.3,-2));S0.add(mesh(new T.PlaneGeometry(6.6,3.2),sm(0x8a1a22,{side:T.DoubleSide}),0,2.8,-2.05));S0.add(mesh(new T.BoxGeometry(7,.3,.3),MAT.wood,0,4.5,-2));
    for(let k=0;k<7;k++){const f=mesh(new T.PlaneGeometry(.7,.55),sm(cols[k%cols.length],{side:T.DoubleSide}),-3+k,4.15,-2);f.rotation.z=Math.PI;S0.add(f)}
    addBox(q.x-3.6,q.z-3.6,q.x+3.6,q.z+3.6);const fx=Math.sin(ry),fz=Math.cos(ry);FAIR.stage={x:q.x,z:q.z,y:yy+.9,fx,fz};
    FAIR.balls=[];for(let k=0;k<3;k++){const b=mesh(new T.SphereGeometry(.12,10,8),new T.MeshStandardMaterial({color:cols[k],emissive:cols[k],emissiveIntensity:.3}),0,0,0);scene.add(b);FAIR.balls.push(b)}}
  /* the strength tester */
  {const q=P(13,3),x=q.x,z=q.z,yy=gy(x,z);scene.add(mesh(new T.BoxGeometry(.6,6.2,.3),sm(0xf2ece0),x,yy+3.1,z));for(let k=0;k<7;k++)scene.add(mesh(new T.BoxGeometry(.62,.08,.32),sm(cols[k%cols.length]),x,yy+.8+k*.8,z));
    const bell=mesh(new T.SphereGeometry(.34,12,8,0,6.283,0,Math.PI/2),MAT.gold||MAT.wood,x,yy+6.6,z);bell.rotation.x=Math.PI;scene.add(bell);const puck=mesh(new T.BoxGeometry(.3,.25,.4),MAT.iron||MAT.wood,x,yy+.5,z+.2);scene.add(puck);
    scene.add(mesh(new T.BoxGeometry(1.1,.45,1.1),MAT.wood,x,yy+.22,z+.9));const mal=mesh(new T.BoxGeometry(.5,.3,.3),MAT.wood,x+.6,yy+.6,z+1.4);scene.add(mal);addCircle(x,z,.7);FAIR.puck={m:puck,y0:yy+.5,t:0,top:0};addInter(x,z+1.6,3,'Sla op de krachtmeter (5 goud)',strength)}
  /* the entrance arch with its sign */
  {const q=P(0,30),yy=gy(q.x,q.z),ry=face(q),A=new T.Group();A.position.set(q.x,yy,q.z);A.rotation.y=ry;scene.add(A);for(const sx of[-3,3])A.add(mesh(new T.BoxGeometry(.4,5,.4),MAT.wood,sx,2.5,0));
    const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='#6a1a1a';g.fillRect(0,0,512,128);g.strokeStyle='#e0b04a';g.lineWidth=10;g.strokeRect(6,6,500,116);g.fillStyle='#f6e6b8';g.font='bold 64px serif';g.textAlign='center';g.fillText('KERMIS',256,86);
    const sign=new T.Mesh(new T.PlaneGeometry(5.6,1.4),new T.MeshStandardMaterial({map:new T.CanvasTexture(c),side:T.DoubleSide}));sign.position.y=4.6;A.add(sign);for(const sx of[-3,3]){const f=mesh(new T.ConeGeometry(.25,.6,6),MAT.gold||MAT.wood,sx,5.3,0);A.add(f)}
    for(const sx of[-3,3])addCircle(q.x+Math.cos(ry)*sx,q.z-Math.sin(ry)*sx,.35)}
  /* benches, tables, barrels and hay by the food tent */
  for(const [dx,dz,r] of[[-3,-12,0],[0,-16,0],[3,-12,0]]){const q=P(dx,dz);try{if(window.asPropW&&asPropW('Table_Large',q.x,q.z,r,1,.9)){asPropW('Bench',q.x,q.z+1.1,r,1,.4);asPropW('Bench',q.x,q.z-1.1,r+Math.PI,1,.4);continue}}catch(e){}scene.add(mesh(new T.BoxGeometry(2,.12,.9),MAT.wood,q.x,gy(q.x,q.z)+.8,q.z));addCircle(q.x,q.z,.9)}
  for(let k=0;k<6;k++){const a=k/6*6.283+.3,q=P(Math.cos(a)*27,Math.sin(a)*27);try{barrelW(q.x,q.z)}catch(e){}try{hay(q.x+1.6,q.z+.8)}catch(e){}}
  /* strings of lanterns between poles, glowing at night */
  {FAIR.bulbs=[];const bm=new T.MeshStandardMaterial({color:0xffd27a,emissive:0xffb050,emissiveIntensity:.2});const N=8,polesP=[];for(let k=0;k<N;k++){const a=k/N*6.283,q=P(Math.cos(a)*24,Math.sin(a)*24),yy=gy(q.x,q.z);scene.add(mesh(new T.CylinderGeometry(.08,.1,5,6),MAT.wood,q.x,yy+2.5,q.z));addCircle(q.x,q.z,.2);polesP.push([q.x,yy+4.9,q.z])}
    for(let k=0;k<N;k++){const A0=polesP[k],B0=polesP[(k+1)%N];for(let t=1;t<10;t++){const u=t/10,x=A0[0]+(B0[0]-A0[0])*u,z=A0[2]+(B0[2]-A0[2])*u,yy=A0[1]+(B0[1]-A0[1])*u-Math.sin(u*Math.PI)*1.1;const b=mesh(new T.SphereGeometry(.11,6,5),bm,x,yy,z,false);scene.add(b)}}FAIR.bulbM=bm}
  MAPICON.kermis='🎠';SITES.push(SITE.kermis={id:'kermis',name:'De Kermis',x:p.x,z:p.z,r:6,h:y,blend:1,great:true})}
/* riding the carousel or the wheel: the camera takes you round */
function rideOn(what){const cost=what==='wheel'?3:2;if(PL.gold<cost){addLog('Een ritje kost '+cost+' goud.');return}if(!window.cinematic||CIN.on)return;PL.gold-=cost;sfx('coin');const V=(a,b,c)=>new T.Vector3(a,b,c),shots=[];
  if(what==='wheel'){const W=FAIR.wheel,G=W.wheel.parent,c=G.position,ry=G.rotation.y,ax=Math.cos(ry),az=-Math.sin(ry);for(let k=0;k<6;k++){const a0=k/6*6.283,a1=(k+1)/6*6.283,pos=a=>V(c.x+Math.sin(ry)*Math.sin(a)*W.R*1.05-Math.cos(ry)*2.6,c.y+W.H-Math.cos(a)*W.R+.6,c.z+Math.cos(ry)*Math.sin(a)*W.R*1.05+Math.sin(ry)*2.6);
      shots.push({d:1.4,from:pos(a0),to:pos(a1),lf:V(FAIR.x,c.y+2,FAIR.z),lt:V(FAIR.x,c.y+2,FAIR.z)})}}
  else{const yy=gy(FAIR.x,FAIR.z)+2.6;for(let k=0;k<8;k++){const a0=k/8*6.283,a1=(k+1)/8*6.283,pos=a=>V(FAIR.x+Math.sin(a)*3.5,yy+Math.sin(k)*.2,FAIR.z+Math.cos(a)*3.5);shots.push({d:.9,from:pos(a0),to:pos(a1),lf:pos(a0+1.4),lt:pos(a1+1.4)})}}
  cinematic(shots,what==='wheel'?'Het reuzenrad':'De draaimolen',what==='wheel'?'Wat een uitzicht!':'Hop, paardje, hop!');giveXp(10)}
let arrowsN=0;
function archery(){if(PL.gold<5){addLog('Boogschieten kost 5 goud.');return}PL.gold-=5;let tot=0;const T0=pick(FAIR.targets);
  for(let k=0;k<3;k++)setTimeout(()=>{const skill=Math.min(.5,PL.lvl*.025),r=Math.random()*(1-skill),sc=r<.08?10:r<.22?8:r<.42?6:r<.65?4:r<.85?2:0;tot+=sc;sfx('swing');
    if(sc){const ar=mesh(new T.CylinderGeometry(.02,.02,.9,5),MAT.wood,0,0,0);const off=(10-sc)*.07,ang=Math.random()*6.283;ar.position.set(Math.cos(ang)*off,1.4+Math.sin(ang)*off,.6);ar.rotation.x=Math.PI/2;T0.add(ar);arrowsN++;setTimeout(()=>T0.remove(ar),30000)}
    floatText(PL.x,PL.y+2.3,PL.z,sc?sc+' punten':'Mis!',sc>=8?'#ffd27a':'#fff');
    if(k===2)setTimeout(()=>{if(tot>=24){const pr=tot>=30?100:40;PL.gold+=pr;giveXp(40);sfx('level');card('🎯 '+tot+' punten!','Prachtig geschoten! Je wint '+pr+' goud.',null,5)}else card('🎯 '+tot+' punten','Niet slecht! Met 24 punten of meer win je een prijs.',null,4)},500)},k*900)}
function strength(){if(PL.gold<5){addLog('Een slag kost 5 goud.');return}PL.gold-=5;const P=FAIR.puck;const pow=Math.min(1,.35+Math.random()*.55+Math.min(.25,PL.lvl*.012));P.top=pow;P.t=0;sfx('hit');
  setTimeout(()=>{if(pow>=.95){sfx('level');PL.gold+=30;card('🔔 DING!','Je slaat de bel! Het publiek klapt. Je wint 30 goud.',null,4)}else floatText(PL.x,PL.y+2.4,PL.z,Math.round(pow*100)+'%','#ffd27a')},700)}
const FORT=[['Je zult goud vinden waar je het niet verwacht.',{gold:.15}],['Een draak zal je pad kruisen... wees moedig.',{dmg:4}],['De sterren zijn je gunstig gezind: je wordt sneller.',{spd:.12}],['Een oude vriend zal je helpen.',{regen:1}],['Pas op voor mensen die te veel lachen.',{def:3}],['Je hart is sterk, en je zwaard nog sterker.',{hp:30}]];
function fortune(){if(PL.gold<10){addLog('Madame Mira vraagt 10 goud.');return}PL.gold-=10;const [t,fx]=pick(FORT);PL.buff={t:300,fx};card('🔮 Madame Mira','Ze staart in haar glazen bol... "'+t+'" (Je voelt je gelukkig: 5 minuten een klein voordeel.)',null,9)}
const _dmF=dlgMain;dlgMain=function(a,text){_dmF(a,text);try{const box=document.querySelector('#dlg #dopts');if(!box)return;const add=(lab,fn,pri)=>{const b=document.createElement('button');b.className='btn'+(pri?' pri':'');b.textContent=lab;b.onclick=fn;box.insertBefore(b,box.firstChild)};
  if(a.name==='Arenameester Brutus'&&!TN.on)add('⚔ Doe mee aan het Grote Toernooi (100 goud)',startTourney,1);
  if(a.name==='Madame Mira')add('🔮 Laat je toekomst voorspellen (10 goud)',fortune,1);
  if(a.name==='Tovenaar Mirabor'&&!hasItem('drakenei')&&!(PL.fx&&PL.fx.babyDragon))add('🥚 Koop een drakenei (2500 goud)',()=>{if(PL.gold<2500){addLog('Een drakenei kost 2500 goud.','#e5766a');return}PL.gold-=2500;giveItem('drakenei',1);closeModals()})}catch(e){console.warn('feest dlg',e)}};
/* the buff of the fortune teller runs out */
ANIMS.push(dt=>{if(PL.buff&&PL.buff.t>0){PL.buff.t-=typeof dt==='number'?dt:.016;if(PL.buff.t<=0)PL.buff=null}});
/* the fair turns: carousel, wheel, spit, juggling, music, lanterns at night */
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!FAIR.ride||Math.hypot(PL.x-FAIR.x,PL.z-FAIR.z)>260)return;const t=PL.t;
  FAIR.ride.rotation.y+=dt*.55;FAIR.horses.forEach((h,i)=>h.position.y=1.45+Math.sin(t*2.2+i*1.3)*.32);
  if(FAIR.wheel){FAIR.wheel.wheel.rotation.x+=dt*.18;const W=FAIR.wheel;for(const q of FAIR.gond){const a=q.a+W.wheel.rotation.x;q.g.position.set(0,W.H+Math.cos(a)*W.R,Math.sin(a)*W.R)}}
  if(FAIR.spit)FAIR.spit.rotation.x+=dt*.8;
  if(FAIR.stage&&FAIR.balls){const S=FAIR.stage,jx=S.x+S.fz*1.4+S.fx*.6,jz=S.z-S.fx*1.4+S.fz*.6;FAIR.balls.forEach((b,i)=>{const a=t*4+i*2.09;b.position.set(jx+Math.cos(a)*.35*S.fz,S.y+2.1+Math.abs(Math.sin(a))*1.1,jz-Math.cos(a)*.35*S.fx)});if(Math.random()<dt*.6)floatText(S.x-S.fz*1.4,S.y+2.6,S.z+S.fx*1.4,pick(['♪','♫','♪ ♫']),'#ffd27a')}
  if(window.PW&&PW.ps&&FAIR.fire&&Math.random()<dt*20){const f=FAIR.fire;pwEm(PW.ps,f.x+rr(.4),f.y,f.z+rr(.4),rr(.3),1.6+Math.random(),rr(.3),.7,.35,.05,[1,.75,.25],[1,.25,0],1,-1,1);if(Math.random()<.3)pwEm(PW.ps,f.x,f.y+1,f.z,rr(.4),1.2,rr(.4),3,.8,2.4,[.5,.5,.5],[.3,.3,.3],.35,.2,1)}
  if(FAIR.bulbM)FAIR.bulbM.emissiveIntensity=.2+(ENV.night||0)*2.2;
  const P=FAIR.puck;if(P&&P.top>0){P.t+=dt;const k=P.t<.5?Math.sin(P.t/.5*Math.PI/2):Math.max(0,1-(P.t-.5)/.8);P.m.position.y=P.y0+k*P.top*5.8;if(P.t>1.4)P.top=0}});
/* build and people */
const _bfF=buildFantasy;buildFantasy=function(){_bfF();try{buildFair()}catch(e){console.warn('kermis',e)}};
const _pfF=populateFantasy;populateFantasy=function(){_pfF();
  try{const Tn=FAIR.tents||{},at=(q,d=3.6)=>{const a=Math.atan2(FAIR.x-q.x,FAIR.z-q.z);return[q.x+Math.sin(a)*d,q.z+Math.cos(a)*d]};
    if(Tn.mira){const [x,z]=at(Tn.mira,1.5);spawnNPC('witch',x,z,{name:'Madame Mira',ai:'stay',line:'merchant'})}
    if(Tn.eten){const [x,z]=at(Tn.eten,4.4);spawnNPC('innkeeper',x,z,{name:'Kok Gerrit',ai:'stay',line:'merchant',shop:['roast','ale','bread','cheese','apple'].filter(id=>ITEMS[id])})}
    if(Tn.spel){const [x,z]=at(Tn.spel,4.2);spawnNPC('merchant',x,z,{name:'Speelgoedmaker Wim',ai:'stay',line:'merchant',shop:['potion','apple','bread'].filter(id=>ITEMS[id])})}
    if(Tn.wapen){const [x,z]=at(Tn.wapen,4);spawnNPC('smith',x,z,{name:'Wapenmeester Joost',ai:'stay',line:'merchant',shop:(typeof WEAPONS_BASIC!=='undefined'?WEAPONS_BASIC:['sword']).filter(id=>ITEMS[id])})}
    if(Tn.mode){const [x,z]=at(Tn.mode,4);spawnNPC('tailor',x,z,{name:'Kleermaakster Saar',ai:'stay',line:'merchant',shop:['cloak_blue','travel','noble','merchant'].filter(id=>ITEMS[id])})}
    if(FAIR.stage){const S=FAIR.stage;const b=spawnNPC('villager',S.x-S.fz*1.4,S.z+S.fx*1.4,{name:'Bard Lodewijk',ai:'stay',line:'merchant'});const j=spawnNPC('villager',S.x+S.fz*1.4,S.z-S.fx*1.4,{name:'Nar Pim',ai:'stay',line:'merchant'});for(const a of[b,j])if(a){a.face=Math.atan2(S.fx,S.fz)}}
    for(let i=0;i<6;i++){const k=spawnNPC('villager',FAIR.x+rr(16),FAIR.z+rr(16),{name:'Kind',roam:{x:FAIR.x,z:FAIR.z},radius:18});if(k&&k.root)k.root.scale.setScalar(.66)}for(let i=0;i<8;i++)spawnNPC('villager',FAIR.x+rr(14),FAIR.z+rr(14),{roam:{x:FAIR.x,z:FAIR.z},radius:16})}catch(e){console.warn('kermis npc',e)}
  try{const bx=BRX+24,bz=BRZ+4;troll=spawnMonster('troll',bx,bz,{name:'Grommel de brugtrol',aggro:0,hp:900,hpMax:900,dmg:32,xp:400});if(troll){troll.passive=true;troll.respawn=600;addInter(bx,bz,5,'Praat met Grommel de brugtrol',riddle)}}catch(e){console.warn('trol',e)}
  try{eggPickup()}catch(e){}};
})();

/* ================= Giant beetles in the desert =================
   Scarab beetles as big as a cart crawl over the dunes of Al-Qadir, with a shining shell, snapping mandibles and six
   walking legs. Near the pyramid lives the Koningsscarabee, a golden giant; it drops the Gouden Scarabee amulet. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a;
const BK={kever:{n:'Reuzenkever',hp:220,dmg:20,speed:5.2,aggro:22,range:2.3,rad:1.1,hh:1.7,xp:120,s:1.15,col:0x1f4a44,col2:0x3a7a5a,ico:'🪲',lore:'Een scarabee zo groot als een kar. Zijn schild glanst groen en blauw in de zon, en zijn kaken knippen een speer doormidden.'},
  koningskever:{n:'Koningsscarabee',hp:3200,dmg:56,speed:4.6,aggro:30,range:3.8,rad:2.4,hh:3.4,xp:1600,s:2.6,col:0x8a6a1a,col2:0xd8a83a,boss:'scarab',ico:'🪲',lore:'De gouden koning van de woestijnkevers. Hij woont bij de Piramide van Khemet en bewaakt de schat van de farao.'}};
Object.assign(ITEMS,{kevershild:{n:'Keverschild',g:'mat',price:140,ico:'🪲',rar:'r'},amu_scarab:{n:'Gouden Scarabee',g:'amulet',fx:{gold:.2,def:4},col:0xd8a83a,price:3200,ico:'🪲',rar:'l',desc:'Een gouden kever die geluk brengt: je vindt meer goud.'}});
for(const [k,d] of Object.entries(BK))MON[k]={n:d.n,hp:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,xp:d.xp,loot:k,rad:d.rad,hh:d.hh,boss:d.boss};
LOOTX.kever=()=>({gold:Math.floor(rnd(15,45)),items:Math.random()<.55?[['kevershild',1]]:[]});
LOOTX.koningskever=()=>({gold:1200,items:[['amu_scarab',1],['kevershild',3],['gem',2]].filter(([i])=>ITEMS[i])});
addEventListener('load',()=>{try{const F=WD.fun;for(const [k,d] of Object.entries(BK)){if(F&&F.ICO)F.ICO[k]=d.ico;if(F&&F.LORE)F.LORE[k]=d.lore}}catch(e){}});
function beetle(kind,sc){const d=BK[kind],s=sc||d.s,g=new T.Group(),shell=new T.MeshStandardMaterial({color:d.col,metalness:.75,roughness:.22,emissive:d.col2,emissiveIntensity:.08}),dk=new T.MeshStandardMaterial({color:0x14100c,roughness:.6}),legs=[];
  const add=(par,geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;par.add(o);return o};
  const body=new T.Group();body.position.y=.75*s;g.add(body);
  add(body,new T.SphereGeometry(1,20,14),shell,0,.05*s,-.25*s).scale.set(.95*s,.55*s,1.25*s);
  add(body,new T.BoxGeometry(.04*s,.06*s,2.3*s),dk,0,.58*s,-.25*s);
  add(body,new T.SphereGeometry(1,16,12),shell,0,.02*s,.95*s).scale.set(.72*s,.42*s,.45*s);
  const head=new T.Group();head.position.set(0,0,1.35*s);body.add(head);add(head,new T.SphereGeometry(.34*s,12,10),dk,0,0,0).scale.set(1,.7,1);
  const jaws=[];for(const sd of[-1,1]){const j=new T.Group();j.position.set(sd*.16*s,-.05*s,.25*s);head.add(j);add(j,new T.ConeGeometry(.07*s,.5*s,6),dk,sd*.05*s,0,.22*s,Math.PI/2,0,-sd*.5);jaws.push({j,sd});
    add(head,new T.CylinderGeometry(.015*s,.015*s,.8*s,4),dk,sd*.2*s,.3*s,.25*s,-.7,0,sd*.5);add(head,new T.SphereGeometry(.06*s,8,6),new T.MeshStandardMaterial({color:0x1a1a1a,metalness:.6,roughness:.2}),sd*.22*s,.1*s,.18*s)}
  for(let i=0;i<6;i++){const sd=i<3?-1:1,k=i%3,p=new T.Group();p.position.set(sd*.6*s,-.05*s,(.75-k*.65)*s);body.add(p);
    const up=add(p,new T.CylinderGeometry(.06*s,.05*s,.7*s,6),dk,sd*.3*s,.12*s,0,0,0,sd*1.1);const lo=add(p,new T.CylinderGeometry(.045*s,.03*s,.85*s,6),dk,sd*.66*s,-.35*s,0,0,0,sd*.25);legs.push({p,sd,k,i})}
  g.traverse(o=>{if(o.isMesh)o.receiveShadow=true});return{g,body,head,jaws,legs,ph:Math.random()*6,beetle:kind,s}}
const _aHB=animHorse;animHorse=function(m,dt,sp){if(!m||!m.beetle)return _aHB(m,dt,sp);const mv=Math.min(1,sp/3);m.ph+=dt*(3+sp*2.2);
  m.legs.forEach(l=>{const off=((l.i===0||l.i===4||l.i===2)?0:Math.PI);l.p.rotation.y=Math.sin(m.ph+off)*.45*mv;l.p.rotation.z=Math.max(0,Math.sin(m.ph+off+1.57))*.25*mv*l.sd});
  m.body.position.y=.75*m.s+Math.abs(Math.sin(m.ph))*.04*m.s*mv;for(const q of m.jaws)q.j.rotation.y=q.sd*(.15+Math.abs(Math.sin(m.ph*.6))*.35)};
function spawnBeetle(kind,x,z){const d=BK[kind],m=beetle(kind);const a=baseActor({kind:'enemy',type:kind,name:d.n,model:m,root:m.g,x,z,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:kind,boss:d.boss});scene.add(a.root);placeActor(a);return a}
WD.beetle=spawnBeetle;
/* riding beetles: tame ones with a saddle and a blanket; ride them like a horse */
function rideBeetle(x,z,own){const m=beetle('kever',.95),s=.95,cl=pick([0xb02a22,0x2f5a9a,0xe0b04a,0x6a2a5a]);
  const sad=new T.Mesh(new T.BoxGeometry(.62,.16,.75),new T.MeshStandardMaterial({color:0x5a3a22,roughness:.7}));sad.position.set(0,.6*s,.15*s);m.body.add(sad);
  const bl=new T.Mesh(new T.BoxGeometry(1.25*s,.05,1*s),new T.MeshStandardMaterial({color:cl,roughness:.9}));bl.position.set(0,.55*s,.1*s);m.body.add(bl);
  for(const sd of[-1,1]){const tas=new T.Mesh(new T.BoxGeometry(.18,.35,.4),new T.MeshStandardMaterial({color:0x6a4a2a}));tas.position.set(sd*.66*s,.35*s,-.2*s);m.body.add(tas)}
  const a=baseActor({kind:'horse',name:own?'Jouw rijkever':'Rijkever',model:m,root:m.g,x,z,hp:320,hpMax:320,rad:1,speed:5,rider:null,beetle:true,mult:.88});a.home={x,z};a.t=rnd(2,6);scene.add(a.root);placeActor(a);return a}
let myB=null;
const _pfR=populateFantasy;populateFantasy=function(){_pfR();try{const O=SITE.oase;if(O)for(let k=0;k<3;k++){const a=k/3*6.283+.5;rideBeetle(O.x+Math.cos(a)*30,O.z+Math.sin(a)*30)}
  const H=SITE.palmhof;if(H)spawnNPC('farmer',H.x+8,H.z-6,{name:'Keverhoeder Amira',ai:'stay',line:'qadir'})}catch(e){console.warn('rijkevers',e)}};
const _dmB=dlgMain;dlgMain=function(a,text){_dmB(a,text);try{if(a.name!=='Keverhoeder Amira')return;const box=document.querySelector('#dlg #dopts');if(!box)return;const b=document.createElement('button');b.className='btn pri';
  if(PL.fx&&PL.fx.myBeetle&&myB&&!myB.dead){b.textContent='🪲 Roep mijn rijkever';b.onclick=()=>{closeModals();myB.x=PL.x+2;myB.z=PL.z+2;placeActor(myB)}}
  else{b.textContent='🪲 Koop een rijkever (600 goud)';b.onclick=()=>{if(PL.gold<600){addLog('Een rijkever kost 600 goud.','#e5766a');return}PL.gold-=600;sfx('coin');closeModals();PL.fx=PL.fx||{};PL.fx.myBeetle=1;myB=rideBeetle(PL.x+2.5,PL.z+2.5,true);addLog('Je hebt een eigen rijkever! Ga ernaast staan om op te stijgen.','#9cc552')}}
  box.insertBefore(b,box.firstChild)}catch(e){console.warn('kever dlg',e)}};
/* your own riding beetle comes back after loading a game */
ANIMS.push(()=>{if(!started||PL.dead||!PL.fx||!PL.fx.myBeetle||(myB&&!myB.dead))return;if(PL.inCave)return;myB=rideBeetle(PL.x+3,PL.z+3,true)});
const _pfB=populateFantasy;populateFantasy=function(){_pfB();try{const dk=WD.great&&WD.great.desertK;if(!dk)return;let n=0;
  for(let t=0;t<600&&n<12;t++){const x=300+rr(360),z=1430+rr(300),h=terrainH(x,z);if(h<2||dk(x,z)<.6||siteAt(x,z)||roadDist(x,z)<6)continue;spawnBeetle('kever',x,z);n++}
  const P=SITE.piramide;if(P){for(let t=0;t<80;t++){const a=Math.random()*6.283,r=80+Math.random()*30,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;if(terrainH(x,z)>2){spawnBeetle('koningskever',x,z);break}}}}catch(e){console.warn('kevers',e)}};
})();
