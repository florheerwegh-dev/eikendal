/* ================= De nieuwe superkrachten =================
   Zes krachten die elk iets heel anders doen: Tijd, Ruimte, Runen, Natuur, Wind, Zon en Maan.
   De effecten gebruiken de textures van het Portal-pack: klok- en sterrencirkels, runen, draaikolken,
   lichtzuilen, mist, klokjesbloemen en vuurringen. Toetsen 7, 8, 9 voor de vaardigheden, R voor het krachtschot. */
(function(){
const tx=n=>WD.tx(n);
/* ---------- the six powers ---------- */
for(const k of['fire','ice','bolt','light','str','shadow'])delete PWR[k];
Object.assign(PC,{
  time:[[1,.97,.82],[1,.82,.4],[.55,.4,.16]],
  space:[[1,.8,1],[.85,.38,1],[.22,.05,.42]],
  rune:[[.85,.9,1],[.45,.6,1],[.12,.14,.55]],
  nature:[[.88,1,.62],[.42,.92,.34],[.1,.38,.08]],
  wind:[[.94,1,1],[.6,.95,1],[.25,.55,.7]],
  sun:[[1,.92,.6],[1,.55,.18],[.6,.14,.05]]});
Object.assign(PWR,{
  time:{n:'Tijd',ic:'⏳',col:'#ffd98a',orb:0xffd98a,pal:'time',d:'Vertraag je vijanden, zet de tijd stil en spoel hem terug.',ab:[
    {n:'Tijdschicht',cost:9,cd:1,d:'Een gouden klokschicht die vijanden een tijd lang heel traag maakt.'},
    {n:'Terugspoelen',cost:22,cd:12,d:'Spoel 4 seconden terug: je springt terug naar waar je was, met je levens van toen.'},
    {n:'Tijdstop',cost:50,cd:24,d:'Een reuzenklok verschijnt op de grond. Alle vijanden erop staan stil, en als de tijd weer gaat lopen krijgen ze alle klappen tegelijk.'}]},
  space:{n:'Ruimte',ic:'🌀',col:'#e07aff',orb:0xe07aff,pal:'space',d:'Portalen, sterren en een zwart gat.',ab:[
    {n:'Sterrenschot',cost:9,cd:1,d:'Drie sterren die zelf hun doel zoeken.'},
    {n:'Portaalsprong',cost:18,cd:6,d:'Stap door een portaal en kom uit waar je kijkt. Vijanden daar worden weggeslingerd.'},
    {n:'Zwart gat',cost:50,cd:22,d:'Een draaikolk van sterren zuigt alle vijanden naar zich toe en ontploft dan.'}]},
  rune:{n:'Runen',ic:'🔯',col:'#7aa0ff',orb:0x7aa0ff,pal:'rune',d:'Oude runen als pijlen, vallen en een groot zegel.',ab:[
    {n:'Runepijl',cost:8,cd:.8,d:'Een snelle pijl van runenlicht die dwars door vijanden heen vliegt.'},
    {n:'Runenval',cost:16,cd:4,d:'Leg een gloeiende rune op de grond. Stapt een vijand erop, dan ontploft hij (max. 3).'},
    {n:'Runenzegel',cost:45,cd:26,d:'Een groot pentagram rond je: vijanden vliegen weg, jij geneest en krijgt de helft minder schade zolang je erin staat.'}]},
  nature:{n:'Natuur',ic:'🌿',col:'#6be36a',orb:0x6be36a,pal:'nature',d:'Doorns, wortels en de bloemen van de Wereldboom.',ab:[
    {n:'Doornzaad',cost:8,cd:.9,d:'Een zaad dat in een boog vliegt en openbarst in doorns.'},
    {n:'Wortelgreep',cost:22,cd:9,d:'Wortels schieten uit de grond en houden alle vijanden in het gebied vast.'},
    {n:'Bloemenveld',cost:42,cd:26,d:'Reuzenklokjes groeien rond je. Ze genezen je en verdoven vijanden die te dichtbij komen.'}]},
  wind:{n:'Wind',ic:'🌪️',col:'#8ff0ff',orb:0x8ff0ff,pal:'wind',d:'Windmessen, op een wolk zweven en een wervelstorm.',ab:[
    {n:'Windmes',cost:8,cd:.8,d:'Een snijdende windvlaag die vijanden ver terugduwt.'},
    {n:'Wolkensprong',cost:20,cd:9,d:'Een wolk tilt je hoog de lucht in en je zweeft langzaam en snel weer naar beneden.'},
    {n:'Wervelstorm',cost:48,cd:24,d:'Een tornado die vijanden opzuigt, laat ronddraaien en wegslingert.'}]},
  sun:{n:'Zon en Maan',ic:'🌙',col:'#ffa04a',orb:0xffa04a,pal:'sun',d:'Maansikkels, zonnestralen en een eclips.',ab:[
    {n:'Maansikkel',cost:9,cd:1,d:'Een sikkel die wegvliegt en als een boemerang terugkomt. Hij raakt op de heen- en terugweg.'},
    {n:'Zonnestraal',cost:24,cd:7,d:'Een straal zonlicht valt uit de hemel op je doel en verbrandt alles eromheen.'},
    {n:'Eclips',cost:50,cd:28,d:'Maak het even nacht: de maan draait om je heen, je herstelt snel, slaat harder en vijanden rond je branden weg.'}]}});
/* the abilities unlock much later: the second at level 10, the strongest at level 20 */
PWU[0]=1;PWU[1]=10;PWU[2]=20;
/* old saves: give a new power that fits the old one */
const MIG={fire:'sun',ice:'time',bolt:'wind',light:'rune',str:'nature',shadow:'space'};
const _ls=loadSave;loadSave=function(){const s=_ls();if(s&&s.PL&&s.PL.power&&!PWR[s.PL.power])s.PL.power=MIG[s.PL.power]||null;return s};
if(window.EX_POWER&&!PWR[window.EX_POWER])window.EX_POWER=MIG[window.EX_POWER]||null;

/* ---------- helpers ---------- */
const spr=(map,col=0xffffff,op=1,sx=1,sy)=>{const s=new T.Sprite(new T.SpriteMaterial({map,color:col,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false}));s.scale.set(sx,sy||sx,1);return s};
/* ground circles keep their own colour on grass: the picture's brightness shades the tint, its alpha cuts the shape */
function decalM(map,col,op){const m=new T.MeshBasicMaterial({map,color:col,transparent:true,opacity:op,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','vec4 texelColor=texture2D(map,vUv);diffuseColor.rgb*=min(vec3(1.6),texelColor.rgb*1.45);diffuseColor.a*=texelColor.a;')};m.customProgramCacheKey=()=>'decalM';return m}
function decal(map,col,op,r,x,z,yo=.16){const m=new T.Mesh(new T.PlaneGeometry(r*2,r*2),decalM(map,col,op));m.rotation.x=-Math.PI/2;m.position.set(x,groundH(x,z)+yo,z);m.renderOrder=4;scene.add(m);return m}
function kill(o){if(!o)return;scene.remove(o);o.traverse&&o.traverse(m=>{if(m.material&&m.material.dispose)m.material.dispose();if(m.geometry&&m.geometry.type!=='BufferGeometry'&&m.geometry.dispose)m.geometry.dispose()})}
const zone=u=>PW.zones.push({u});
const C3=a=>new T.Color(a[0],a[1],a[2]);
let CRES=null;function crescent(){if(CRES)return CRES;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,8,64,64,58);
  gr.addColorStop(0,'#fff8d0');gr.addColorStop(.55,'#ffb848');gr.addColorStop(1,'rgba(255,80,20,0)');g.fillStyle=gr;g.beginPath();g.arc(64,64,52,0,6.283);g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(86,50,44,0,6.283);g.fill();return CRES=new T.CanvasTexture(c)}
/* projectiles with a picture on them */
function shootS(o){pwShoot(o);const q=PW.proj[PW.proj.length-1];if(!q)return null;if(o.spr){const s=spr(o.spr,o.sprCol||0xffffff,o.sprOp||1,o.sprS/(o.size||.32));q.m.add(s);q.spr=s}return q}
function burstC(x,y,z,n,sp,pal,life=.6,s0=.4){pwBurst(PW.ps,x,y,z,n,sp,life,s0,.05,pal[0],pal[1],1,0,1,1.5)}
function pillar(x,z,map,col,h=18,w=4.5,life=1.2){const y=groundH(x,z),s=spr(map,col,.9,w,h);s.position.set(x,y+h/2,z);scene.add(s);let t=0;zone(dt=>{t+=dt;s.material.opacity=.9*(1-t/life);s.scale.x=w*(1+t*.6);if(t>=life){kill(s);return true}})}
function ringFlash(map,col,x,z,r0,r1,life=.6){const d=decal(map,col,.95,1,x,z);let t=0;zone(dt=>{t+=dt;const k=t/life,r=r0+(r1-r0)*k;d.scale.set(r,r,1);d.material.opacity=.95*(1-k);d.rotation.z+=dt*2;if(k>=1){kill(d);return true}})}
/* extra buffs that make you stronger or tougher */
const BX={seal:0,sealX:0,sealZ:0,sealR:0,flower:0,flX:0,flZ:0,ecl:0,eclK:0,glide:0,cloud:null};WD.BX=BX;
const inSeal=()=>BX.seal>0&&Math.hypot(PL.x-BX.sealX,PL.z-BX.sealZ)<BX.sealR;
const _dpX=damagePlayer;damagePlayer=function(d,s){let m=1;if(inSeal())m*=.5;if(BX.ecl>0)m*=.6;return _dpX(d*m,s)};
const _paX=playerAtk;playerAtk=function(){return _paX()*(BX.ecl>0?1.6:1)};
const _gsX=gearSpd;gearSpd=function(){return _gsX()*(BX.glide>0?1.45:1)};

/* ---------- R: the quick power shot of each power ---------- */
window.PWB={
  time:(pal,S)=>shootS({pal,speed:44,size:.2,spr:tx('circle_time.png'),sprS:1.2,onHit:p=>pwBoom(p.x,p.y,p.z,1.9+PL.lvl*.03,(14+PL.lvl*1.6)*S,{pal,slow:1.8,light:1.2})}),
  space:(pal,S)=>shootS({pal,speed:48,size:.2,spr:tx('glare.png'),sprS:1.6,sprCol:0xffb0ff,home:1,onHit:p=>pwBoom(p.x,p.y,p.z,1.9+PL.lvl*.03,(15+PL.lvl*1.7)*S,{pal,kb:2,light:1.2})}),
  rune:(pal,S)=>shootS({pal,speed:58,size:.18,spr:tx('rune_magic.png'),sprS:1.1,sprCol:0x9ab8ff,onHit:p=>pwBoom(p.x,p.y,p.z,1.8+PL.lvl*.03,(16+PL.lvl*1.7)*S,{pal,stun:.2,light:1.2})}),
  nature:(pal,S)=>shootS({pal,speed:40,size:.22,grav:6,spr:tx('glare.png'),sprS:.9,sprCol:0x8aff6a,onHit:p=>pwBoom(p.x,p.y,p.z,2+PL.lvl*.03,(15+PL.lvl*1.7)*S,{pal,slow:2,light:1})}),
  wind:(pal,S)=>shootS({pal,speed:56,size:.18,spr:tx('rune_swirl.png'),sprS:1.4,onHit:p=>pwBoom(p.x,p.y,p.z,1.9+PL.lvl*.03,(14+PL.lvl*1.6)*S,{pal,kb:6,light:1})}),
  sun:(pal,S)=>shootS({pal,speed:46,size:.2,spr:crescent(),sprS:1.3,onHit:p=>pwBoom(p.x,p.y,p.z,1.9+PL.lvl*.03,(15+PL.lvl*1.7)*S,{pal,burn:[2.5,2.5*S],light:1.4})})};

/* ---------- custom projectiles: piercing rune arrows and the boomerang crescent ---------- */
const PJ=[];
function pjUpdate(dt){for(let i=PJ.length-1;i>=0;i--){const q=PJ[i];q.life-=dt;q.t+=dt;let done=q.life<=0;
  if(q.boom){/* out, then back to your hand */const h=pwHand();if(q.t>q.out){const dx=h.x-q.p.x,dy=h.y-q.p.y,dz=h.z-q.p.z,l=Math.hypot(dx,dy,dz)||1;if(!q.back){q.back=true;q.hit=new Set()}q.v.set(dx/l*q.sp*1.15,dy/l*q.sp*1.15,dz/l*q.sp*1.15);if(l<1.4)done=true}}
  const steps=Math.max(1,Math.ceil(q.v.length()*dt/.7)),sdt=dt/steps;
  for(let s=0;s<steps&&!done;s++){q.p.addScaledVector(q.v,sdt);
    for(const a of actors){if(!pwFoe(a)||q.hit.has(a))continue;if(Math.abs(a.x-q.p.x)>3||Math.abs(a.z-q.p.z)>3)continue;if(Math.hypot(a.x-q.p.x,a.z-q.p.z)<(a.rad||.5)+.9&&q.p.y>a.y-.5&&q.p.y<a.y+(a.hh||1.8)+.6){q.hit.add(a);q.onHit(a,q.p)}}
    if(!q.boom&&(q.p.y<groundH(q.p.x,q.p.z)+.1||(!PL.inCave&&collide({x:q.p.x,z:q.p.z},.1))))done=true}
  q.s.position.copy(q.p);q.s.material.rotation+=dt*q.spin;for(let k=0;k<2;k++)pwEm(PW.ps,q.p.x+pwR(.15),q.p.y+pwR(.15),q.p.z+pwR(.15),pwR(.5),pwR(.5),pwR(.5),.35,.3,.03,q.pal[0],q.pal[2],.9,0,1);
  if(done){kill(q.s);PJ.splice(i,1)}}}
function shootPJ(o){const h=pwHand(),a=pwAim(o.range||60),dx=a.x-h.x,dy=(a.y+.5)-h.y,dz=a.z-h.z,l=Math.hypot(dx,dy,dz)||1;
  const s=spr(o.map,o.col||0xffffff,1,o.size||1.4);s.position.set(h.x,h.y,h.z);scene.add(s);
  PJ.push({p:new T.Vector3(h.x,h.y,h.z),v:new T.Vector3(dx/l*o.sp,dy/l*o.sp,dz/l*o.sp),sp:o.sp,life:o.life||2,t:0,out:o.out||1e9,boom:!!o.boom,hit:new Set(),s,spin:o.spin||4,pal:o.pal,onHit:o.onHit});sfx('bow')}

/* ---------- Tijd ---------- */
const HIST=[];let histT=0;
function clockFx(x,z,r,life){ringFlash(tx('circle_time.png'),0xffe9a0,x,z,r*.3,r,life)}
/* ---------- the abilities ---------- */
const X={};
X.time=[
  ()=>{const S=pwS();shootS({pal:PC.time,speed:40,size:.3,spr:tx('circle_time.png'),sprS:1.8,onHit:p=>{pwBoom(p.x,p.y,p.z,2.6+pwRank()*.3,20*S,{pal:PC.time,slow:4+PL.lvl*.08,kb:1.5,light:1.6});clockFx(p.x,p.z,3.4,.7)}})},
  ()=>{const old=HIST.find(h=>PL.t-h.t>=3.8)||HIST[0];if(!old||Math.hypot(old.x-PL.x,old.z-PL.z)>140){addLog('De tijd laat zich hier niet terugdraaien.','#ffd98a');PL.mp=Math.min(PL.mpMax,PL.mp+22);BX.refund=1;return}
    for(const h of HIST)if(h.t>=old.t)pwEm(PW.ps,h.x,h.y+1,h.z,0,.4,0,1.3,.4,.05,PC.time[0],PC.time[2],.9,0,.5);
    burstC(PL.x,PL.y+1,PL.z,50,4,PC.time,.8,.45);for(const {a} of pwFoesIn(PL.x,PL.z,6))pwStatus(a,'slw',3);
    PL.x=old.x;PL.z=old.z;PL.y=Math.max(old.y,groundH(old.x,old.z));PL.vy=0;const hp=PL.hp;PL.hp=Math.max(PL.hp,old.hp);PL.iframes=Math.max(PL.iframes||0,1);
    if(PL.hp>hp)floatText(PL.x,PL.y+2.3,PL.z,'+'+Math.round(PL.hp-hp),'#ffe9a0');clockFx(PL.x,PL.z,4,.9);pwFlash('#ffe9a0',.45,.6);sfx('quest');HIST.length=0},
  ()=>{const S=pwS(),R=pwRank(),a=pwAim(40),r=10+R,x=a.x,z=a.z,dur=6+PL.lvl*.12,dc=decal(tx('circle_time.png'),0xffe9a0,0,r,x,z),hand=decal(tx('ring_red.png'),0xffd060,0,r*.55,x,z,.2);let t=0,tick=0;const hit=new Set();
    pwFlash('#fff0b8',.35,.8);sfx('thunder');PW.shake=Math.max(PW.shake,.3);
    zone(dt=>{t+=dt;tick-=dt;const fade=t>dur-.5?Math.max(0,(dur-t)/.5):1;dc.material.opacity=Math.min(.95,t*3)*fade;hand.material.opacity=.5*fade;dc.rotation.z-=dt*(t<dur-.7?.12:4);hand.rotation.z+=dt*.6;
      for(const {a} of pwFoesIn(x,z,r)){pwStatus(a,'stun',.3);hit.add(a)}
      if(tick<=0){tick=1;for(const f of hit)if(!f.dead&&Math.hypot(f.x-x,f.z-z)<r+1){hitActor(f,6*S,true);pwEm(PW.ps,f.x,f.y+(f.hh||1.8)*.6,f.z,0,.6,0,1,.5,.1,PC.time[0],PC.time[1],1,0,.5)}}
      if(Math.random()<.7){const an=Math.random()*6.283,rr=Math.sqrt(Math.random())*r;pwEm(PW.ps,x+Math.cos(an)*rr,groundH(x,z)+.3+Math.random()*2,z+Math.sin(an)*rr,0,.15,0,2.5,.18,.05,PC.time[0],PC.time[1],.9,0,.2)}
      if(t>=dur){for(const f of hit)if(!f.dead)pwDmg(f,24*S,x,z,4);pwRingBurst(PW.ps,x,groundH(x,z)+.5,z,r,90,.6,.7,.1,PC.time[0],PC.time[2]);pwFlash('#fff2c0',.3,.4);sfx('hit');kill(dc);kill(hand);return true}})}];

/* ---------- Ruimte ---------- */
function portalSwirl(x,y,z,size=4.2,life=.9){const s=spr(tx('pool_cel.png'),0xffffff,1,.1);s.position.set(x,y+size*.55,z);scene.add(s);let t=0;
  zone(dt=>{t+=dt;const k=t/life,sc=size*Math.sin(Math.min(1,k)*Math.PI)*1.15;s.scale.set(sc*.75,sc,1);s.material.rotation+=dt*5;if(k>=1){kill(s);return true}})}
X.space=[
  ()=>{const S=pwS();for(let k=0;k<3;k++)setTimeout(()=>{if(PL.dead)return;const q=shootS({pal:PC.space,speed:30,size:.22,spr:tx('glare.png'),sprS:1.9,sprCol:0xffb8ff,home:1,onHit:p=>pwBoom(p.x,p.y,p.z,1.9,11*S,{pal:PC.space,kb:1.5,light:1.1})});
    if(q){/* fly up and out first, then the stars find their target */const sp=q.v.length();q.v.y=Math.max(q.v.y,0)+5+k*1.5;q.v.x+=(k-1)*6;q.v.z+=(k-1)*6*Math.sin(PL.rot);q.v.setLength(sp)}},k*110)},
  ()=>{const S=pwS(),a=pwAim(35),p={x:a.x,z:a.z};collide(p,.5);const sy=PL.y;portalSwirl(PL.x,sy,PL.z);burstC(PL.x,sy+1,PL.z,30,3,PC.space);
    PL.x=p.x;PL.z=p.z;PL.y=groundH(p.x,p.z);PL.vy=0;PL.iframes=Math.max(PL.iframes||0,.6);portalSwirl(PL.x,PL.y,PL.z,5,1);
    pwBoom(PL.x,PL.y+.6,PL.z,3.5+pwRank()*.4,18*S,{pal:PC.space,kb:7,stun:.5,light:2});ringFlash(tx('circle_space.png'),0xffa0ff,PL.x,PL.z,1,5.5,.7);pwFlash('#e07aff',.3,.4);sfx('swing')},
  ()=>{const S=pwS(),R=pwRank(),a=pwAim(45),x=a.x,z=a.z,y=groundH(x,z),r=14+R,dur=4.5+PL.lvl*.08,core=spr(tx('pool_cel.png'),0xffffff,.95,.1),dc=decal(tx('circle_space.png'),0xffa0ff,0,r,x,z),rg=decal(tx('ring_purple.png'),0xffffff,0,r*.6,x,z,.2);
    core.position.set(x,y+2.6,z);scene.add(core);let t=0,tick=0;pwFlash('#3a0a5a',.35,.8);sfx('thunder');
    zone(dt=>{t+=dt;tick-=dt;const sc=Math.min(6,t*9);core.scale.set(sc,sc,1);core.material.rotation+=dt*(3+t);dc.material.opacity=Math.min(.85,t*2);rg.material.opacity=Math.min(.8,t*2);dc.rotation.z+=dt*.8;rg.rotation.z-=dt*2.4;
      for(const {a,d} of pwFoesIn(x,z,r)){if(d>.8){const k=Math.min(d-.6,(7+d*.4)*dt);a.x+=(x-a.x)/d*k;a.z+=(z-a.z)/d*k}if(tick<=0){hitActor(a,6*S,true)}pwStatus(a,'slw',.4)}
      if(tick<=0)tick=.5;
      for(let k=0;k<3;k++){const an=Math.random()*6.283,rr=r*(.5+Math.random()*.5);pwEm(PW.ps,x+Math.cos(an)*rr,y+.5+Math.random()*3,z+Math.sin(an)*rr,(x-(x+Math.cos(an)*rr))*.9-Math.sin(an)*5,0,(z-(z+Math.sin(an)*rr))*.9+Math.cos(an)*5,.9,.28,.05,PC.space[0],PC.space[1],1,0,0)}
      if(t>=dur){pwBoom(x,y+1,z,7+R*.5,45*S,{pal:PC.space,kb:11,stun:.6,light:3});burstC(x,y+2,z,120,9,PC.space,1,.6);PW.shake=Math.max(PW.shake,.6);pwFlash('#ffd0ff',.4,.5);kill(core);kill(dc);kill(rg);return true}})}];

/* ---------- Runen ---------- */
const TRAPS=[];
X.rune=[
  ()=>{const S=pwS();shootPJ({map:tx('rune_magic.png'),col:0xa8c0ff,size:1.5,sp:62,life:1.3,spin:6,pal:PC.rune,onHit:(a,p)=>{pwDmg(a,15*S,PL.x,PL.z,2.5);burstC(p.x,p.y,p.z,14,3,PC.rune,.4,.3)}})},
  ()=>{const S=pwS(),a=pwAim(26);if(TRAPS.length>=3){const o=TRAPS.shift();kill(o.dc)}const dc=decal(tx('rune_magic.png'),0x8ab0ff,.9,2.4,a.x,a.z);TRAPS.push({x:a.x,z:a.z,dc,life:45,S});ringFlash(tx('ring_blue.png'),0xffffff,a.x,a.z,.5,3,.5);sfx('click')},
  ()=>{const S=pwS(),R=pwRank(),r=9+R,x=PL.x,z=PL.z,dur=8+PL.lvl*.15,dc=decal(tx('rune_magic.png'),0x8ab0ff,0,r,x,z),rg=decal(tx('ring_blue.png'),0xffffff,0,r*1.08,x,z,.18);
    Object.assign(BX,{seal:dur,sealX:x,sealZ:z,sealR:r});for(const {a} of pwFoesIn(x,z,r))pwDmg(a,20*S,x,z,10);pwFlash('#a8c0ff',.35,.7);sfx('level');
    for(let i=0;i<5;i++){const an=-Math.PI/2+i*1.2566,px=x+Math.cos(an)*r*.82,pz=z+Math.sin(an)*r*.82;pillar(px,pz,tx('rise_blue.png'),0xffffff,14,3.6,dur)}
    let t=0,tick=1;zone(dt=>{t+=dt;tick-=dt;const fade=t>dur-.6?Math.max(0,(dur-t)/.6):1;dc.material.opacity=Math.min(.95,t*2)*fade;rg.material.opacity=.7*fade;dc.rotation.z+=dt*.25;rg.rotation.z-=dt*.5;
      if(tick<=0){tick=1;for(const {a} of pwFoesIn(x,z,r)){hitActor(a,9*S,true);pwStatus(a,'slw',1.2)}}
      if(inSeal()&&Math.random()<.5)pwEm(PW.ps,PL.x+pwR(.8),PL.y+.2,PL.z+pwR(.8),0,1.5,0,1,.25,.05,PC.rune[0],PC.rune[1],.9,0,.3);
      if(t>=dur){kill(dc);kill(rg);return true}})}];

/* ---------- Natuur ---------- */
const rootM=new T.MeshStandardMaterial({color:0x5a4026,roughness:.9,emissive:0x0a2a06});
function roots(x,z,n,h){const y=groundH(x,z),g=new T.Group();g.position.set(x,y,z);g.scale.y=.01;scene.add(g);
  for(let i=0;i<n;i++){const a0=i/n*6.283+Math.random(),pts=[];for(let k=0;k<5;k++){const a=a0+k*.7,r=(1.1-k*.18)*(.7+Math.random()*.3);pts.push(new T.Vector3(Math.cos(a)*r,k/4*h,Math.sin(a)*r))}
    g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),14,.16*(1-i/n*.3),6),rootM))}
  return g}
const flowerM=()=>new T.MeshStandardMaterial({map:tx('bellflower.png'),alphaTest:.3,side:T.DoubleSide,roughness:.7,emissive:0x5a2a08,emissiveIntensity:.35});
X.nature=[
  ()=>{const S=pwS();shootS({pal:PC.nature,speed:34,size:.28,grav:9,spr:tx('glare.png'),sprS:1.3,sprCol:0x9aff6a,onHit:p=>{pwBoom(p.x,p.y,p.z,2.8,18*S,{pal:PC.nature,slow:2.5,light:1.2});
    const g=roots(p.x,p.z,6,1.6);let t=0;zone(dt=>{t+=dt;g.scale.y=t<.25?t/.25:t>1?Math.max(.01,1-(t-1)/.4):1;if(t>1.4){kill(g);return true}})}})},
  ()=>{const S=pwS(),R=pwRank(),a=pwAim(40),x=a.x,z=a.z,r=7+R*.6,dur=3+PL.lvl*.06,dc=decal(tx('ins_green.png'),0xffffff,0,r,x,z),G=[];
    for(const {a:f} of pwFoesIn(x,z,r)){pwDmg(f,14*S,x,z,0);pwStatus(f,'stun',dur);G.push(roots(f.x,f.z,4,(f.hh||1.8)*.8))}
    for(let i=0;i<8;i++){const an=Math.random()*6.283,rr=Math.sqrt(Math.random())*r;G.push(roots(x+Math.cos(an)*rr,z+Math.sin(an)*rr,3,1+Math.random()*1.4))}
    pwBurst(PW.smoke,x,groundH(x,z)+.3,z,24,r*.6,1,1,1.6,[.45,.36,.24],[.28,.22,.15],.7,-.2,.6,1.2);sfx('hit');let t=0,tick=1;
    zone(dt=>{t+=dt;tick-=dt;const k=t<.3?t/.3:t>dur?Math.max(.01,1-(t-dur)/.5):1;for(const g of G)g.scale.y=k;dc.material.opacity=.9*Math.min(1,t*3)*(t>dur?Math.max(0,1-(t-dur)/.5):1);dc.rotation.z+=dt*.2;
      if(tick<=0&&t<dur){tick=1;for(const {a:f} of pwFoesIn(x,z,r))hitActor(f,5*S,true)}
      if(t>dur+.5){for(const g of G)kill(g);kill(dc);return true}})},
  ()=>{const S=pwS(),x=PL.x,z=PL.z,r=9,dur=10+PL.lvl*.2,fl=[],geo=WD.geo('Flower_Bellflower'),m=flowerM();BX.flower=dur;BX.flX=x;BX.flZ=z;
    for(let i=0;i<14;i++){const an=i/14*6.283+Math.random()*.3,rr=3+Math.random()*(r-3.5),fx=x+Math.cos(an)*rr,fz=z+Math.sin(an)*rr,y=groundH(fx,fz);
      const o=geo?new T.Mesh(geo,m):mesh(new T.ConeGeometry(.5,1.5,6),m);o.position.set(fx,y,fz);o.rotation.y=Math.random()*6.283;o.scale.setScalar(.01);o.userData.s=.45+Math.random()*.3;scene.add(o);fl.push(o)}
    const dc=decal(tx('pool_green.png'),0xffffff,0,r,x,z);pwFlash('#c8ff9a',.25,.6);sfx('level');let t=0,tick=1.5;
    zone(dt=>{t+=dt;tick-=dt;const k=t<.8?t/.8:t>dur-.6?Math.max(.01,(dur-t)/.6):1;for(const o of fl){o.scale.setScalar(o.userData.s*k);o.rotation.y+=dt*.2}dc.material.opacity=.35*k;dc.rotation.z+=dt*.15;
      if(Math.hypot(PL.x-x,PL.z-z)<r&&!PL.dead){const h0=PL.hp;PL.hp=Math.min(PL.hpMax,PL.hp+PL.hpMax*.03*dt);if(Math.random()<.4)pwEm(PW.ps,PL.x+pwR(.6),PL.y+.3,PL.z+pwR(.6),0,1.4,0,1,.22,.04,PC.nature[0],PC.nature[1],.9,0,.3)}
      if(Math.random()<.8){const o=fl[Math.floor(Math.random()*fl.length)];pwEm(PW.ps,o.position.x,o.position.y+1.2*k,o.position.z,pwR(.3),.8,pwR(.3),2,.15,.04,[1,.95,.5],PC.nature[1],.9,0,.3)}
      if(tick<=0){tick=1.5;for(const {a:f} of pwFoesIn(x,z,r)){hitActor(f,6*S,true);pwStatus(f,'stun',.7)}}
      if(t>=dur){for(const o of fl)scene.remove(o);m.dispose();kill(dc);BX.flower=0;return true}})}];

/* ---------- Wind ---------- */
function cloudMesh(){const g=new T.Group(),m=new T.SpriteMaterial({map:tx('mist.png'),color:0xf4f8ff,transparent:true,opacity:.95,depthWrite:false});
  for(const [x,y,z,s] of[[0,0,0,2.6],[1,.15,.4,2],[-1.1,.1,-.3,2.1],[.4,.35,-.9,1.7],[-.4,.3,.9,1.8],[0,-.3,0,2.2]]){const p=new T.Sprite(m);p.position.set(x,y,z);p.scale.set(s,s*.8,1);g.add(p)}scene.add(g);return g}
/* a funnel of wind: two open cones with the swirl picture wrapped around, turning against each other */
function funnelMat(){const t=tx('rune_swirl.png').clone();t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,2);return WD.addM(t,0xe8fbff,0)}
X.wind=[
  ()=>{const S=pwS();shootS({pal:PC.wind,speed:52,size:.24,spr:tx('rune_swirl.png'),sprS:2.2,onHit:p=>pwBoom(p.x,p.y,p.z,2.4,14*S,{pal:PC.wind,kb:11,light:1})})},
  ()=>{const S=pwS();PL.vy=19+Math.min(7,PL.lvl*.3);PL.onGround=false;BX.glide=5+PL.lvl*.1;BX.glideT=0;if(!BX.cloud)BX.cloud=cloudMesh();BX.cloud.visible=true;
    pwBoom(PL.x,PL.y+.4,PL.z,4,10*S,{pal:PC.wind,kb:9});ringFlash(tx('rune_swirl.png'),0xffffff,PL.x,PL.z,1,6,.6);pwBurst(PW.smoke,PL.x,PL.y+.3,PL.z,20,5,1,1,2,[.95,.97,1],[.8,.85,.9],.6,0,.6,1.2);sfx('swing')},
  ()=>{const S=pwS(),R=pwRank(),a=pwAim(40),g=new T.Group(),pl=[],dur=6+PL.lvl*.1,r=4.6+R*.4;g.position.set(a.x,groundH(a.x,a.z),a.z);scene.add(g);
    for(const [rt,rb,h,sp] of[[r*1.15,.7,13,6],[r*.85,.45,11,-8]]){const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,24,6,true),funnelMat());m.position.y=h/2;m.userData.sp=sp;g.add(m);pl.push(m)}
    for(let i=0;i<4;i++){const s=1.3+i*1.1,m=new T.Mesh(new T.PlaneGeometry(s*2,s*2),WD.addM(tx('rune_swirl.png'),0xffffff,0));m.rotation.x=-Math.PI/2;m.position.y=.3+i*3.2;m.userData.sp=5+i;g.add(m);pl.push(m)}
    const caught=new Set();let t=0,tick=0;sfx('thunder');
    zone(dt=>{t+=dt;tick-=dt;const fade=t<.4?t/.4:t>dur-.6?Math.max(0,(dur-t)/.6):1;pl.forEach((m,i)=>{m.material.opacity=(i<2?.75:.5+.25*Math.sin(t*3+i))*fade;if(i<2){m.rotation.y+=dt*m.userData.sp;m.material.map.offset.y-=dt*.6}else m.rotation.z+=dt*m.userData.sp});
      let best=null,bd=22;for(const {a:f,d} of pwFoesIn(g.position.x,g.position.z,22))if(d<bd&&!caught.has(f)){bd=d;best=f}
      if(best){const dx=best.x-g.position.x,dz=best.z-g.position.z,l=Math.hypot(dx,dz)||1;g.position.x+=dx/l*Math.min(l,5*dt);g.position.z+=dz/l*Math.min(l,5*dt)}g.position.y=groundH(g.position.x,g.position.z);
      for(const {a:f,d} of pwFoesIn(g.position.x,g.position.z,r)){caught.add(f);const an=Math.atan2(f.z-g.position.z,f.x-g.position.x)+dt*4,rr=Math.max(.6,d-dt*4);f.x=g.position.x+Math.cos(an)*rr;f.z=g.position.z+Math.sin(an)*rr;pwStatus(f,'stun',.3);if(tick<=0)hitActor(f,7*S,true)}
      if(tick<=0)tick=.35;
      for(let k=0;k<3;k++){const an=Math.random()*6.283,hh=Math.random()*10,rr=1+hh*.4;pwEm(PW.smoke,g.position.x+Math.cos(an)*rr,g.position.y+hh,g.position.z+Math.sin(an)*rr,-Math.sin(an)*6,2,Math.cos(an)*6,.8,.6,1.3,[.9,.93,.95],[.7,.75,.8],.45,0,.5)}
      if(t>=dur){for(const f of caught)if(!f.dead)pwDmg(f,20*S,g.position.x,g.position.z,14);kill(g);return true}})}];

/* ---------- Zon en Maan ---------- */
const ECL={orbs:[]};
X.sun=[
  ()=>{const S=pwS();shootPJ({map:crescent(),size:2.2,sp:36,life:2.6,out:.55,boom:true,spin:-14,pal:PC.sun,onHit:(a,p)=>{pwDmg(a,16*S,PL.x,PL.z,2);pwStatus(a,'burn',2,2*S);burstC(p.x,p.y,p.z,12,3,PC.sun,.4,.3)}})},
  ()=>{const S=pwS(),R=pwRank(),a=pwAim(50),x=a.x,z=a.z,y=groundH(x,z),r=5+R*.5;const w=decal(tx('circle_orange.png'),0xffffff,.0,r,x,z);let t=0,fired=false;sfx('swing');
    zone(dt=>{t+=dt;if(!fired){w.material.opacity=Math.min(.95,t*2.2);w.rotation.z+=dt*3;const k=Math.min(1,t/.55);w.scale.set(.3+.7*k,.3+.7*k,1)}
      if(!fired&&t>=.55){fired=true;pillar(x,z,tx('rise_white.png'),0xffc060,44,r*1.3,1.3);pillar(x,z,tx('rise_white.png'),0xffffff,40,r*.6,.9);
        pwBoom(x,y+.5,z,r,48*S,{pal:PC.sun,burn:[4,6*S],kb:4,light:4,smoke:[[.35,.25,.18],[.12,.1,.08]]});ringFlash(tx('glare.png'),0xffd080,x,z,r*.6,r*2.4,.8);PW.shake=Math.max(PW.shake,.5);pwFlash('#ffe0a0',.35,.5);sfx('thunder')}
      if(fired){w.material.opacity=Math.max(0,.95-(t-.55)*1.2)}if(t>1.5){kill(w);return true}})},
  ()=>{const S=pwS(),dur=10+PL.lvl*.2;BX.ecl=dur;pwFlash('#1a0830',.6,1.2);sfx('thunder');
    if(!ECL.orbs.length)for(let i=0;i<4;i++){const s=spr(crescent(),0xffffff,1,1.2);scene.add(s);ECL.orbs.push(s)}for(const s of ECL.orbs)s.visible=true;
    let tick=0;zone(dt=>{tick-=dt;if(tick<=0){tick=.5;for(const {a} of pwFoesIn(PL.x,PL.z,11)){hitActor(a,7*S,true);pwEm(PW.ps,a.x,a.y+1,a.z,0,1.5,0,.8,.6,.1,[.85,.5,1],PC.sun[1],1,0,.4)}}
      if(BX.ecl<=0||PL.dead){for(const s of ECL.orbs)s.visible=false;return true}})}];
Object.assign(PWX,X);

/* ---------- per frame: history for Terugspoelen, homing stars, traps, glide, eclipse ---------- */
const _puX=pwUpdate;pwUpdate=function(dt){_puX(dt);if(!PW.on)return;if(BX.refund){BX.refund=0;PW.cd[1]=0}
  histT-=dt;if(histT<=0&&!PL.dead){histT=.1;const L=HIST[HIST.length-1];if(L&&Math.hypot(L.x-PL.x,L.z-PL.z)>30)HIST.length=0;HIST.push({x:PL.x,z:PL.z,y:PL.y,hp:PL.hp,t:PL.t});if(HIST.length>60)HIST.shift()}
  for(const q of PW.proj){if(q.spr)q.spr.material.rotation+=dt*5;if(!q.o.home)continue;let best=null,bd=28;for(const a of actors){if(!pwFoe(a))continue;const d=Math.hypot(a.x-q.p.x,a.z-q.p.z);if(d<bd){bd=d;best=a}}
    if(best){const sp=q.v.length(),dx=best.x-q.p.x,dy=best.y+(best.hh||1.8)*.55-q.p.y,dz=best.z-q.p.z,l=Math.hypot(dx,dy,dz)||1;q.v.lerp(new T.Vector3(dx/l*sp,dy/l*sp,dz/l*sp),Math.min(1,dt*7));q.v.setLength(sp)}}
  pjUpdate(dt);
  for(let i=TRAPS.length-1;i>=0;i--){const q=TRAPS[i];q.life-=dt;q.dc.material.opacity=.65+.3*Math.sin(PL.t*4+i);q.dc.rotation.z+=dt*.6;let boom=q.life<=0;
    if(!boom)for(const {a} of pwFoesIn(q.x,q.z,2.6)){boom=true;break}
    if(boom){const S=q.S;if(q.life>0){pwBoom(q.x,groundH(q.x,q.z)+.5,q.z,4.5+pwRank()*.4,34*S,{pal:PC.rune,kb:6,stun:.9,light:3});pillar(q.x,q.z,tx('rise_blue.png'),0xffffff,16,4,.8);PW.shake=Math.max(PW.shake,.35);sfx('hit')}kill(q.dc);TRAPS.splice(i,1)}}
  if(BX.seal>0)BX.seal-=dt;
  if(inSeal()&&!PL.dead)PL.hp=Math.min(PL.hpMax,PL.hp+PL.hpMax*.03*dt);
  if(BX.glide>0){BX.glide-=dt;BX.glideT+=dt;if(PL.vy<-2.6)PL.vy=-2.6;const c=BX.cloud;if(c){c.position.set(PL.x,PL.y-.35,PL.z);c.rotation.y+=dt*.4}
    if(Math.random()<.6)pwEm(PW.smoke,PL.x+pwR(.8),PL.y-.5,PL.z+pwR(.8),0,-.4,0,1,.6,1.2,[.97,.98,1],[.85,.9,.95],.5,0,.4);
    if((PL.onGround&&BX.glideT>.6)||PL.swim||PL.dead){BX.glide=0}}
  if(BX.glide<=0&&BX.cloud&&BX.cloud.visible)BX.cloud.visible=false;
  if(BX.ecl>0){BX.ecl-=dt;if(!PL.dead)PL.hp=Math.min(PL.hpMax,PL.hp+PL.hpMax*.03*dt);ECL.orbs.forEach((s,i)=>{const an=PL.t*2.2+i*1.5708;s.position.set(PL.x+Math.cos(an)*2.3,PL.y+1.3+Math.sin(PL.t*3+i)*.3,PL.z+Math.sin(an)*2.3);s.material.rotation-=dt*6})}
  BX.eclK+=((BX.ecl>0?1:0)-BX.eclK)*Math.min(1,dt*1.5)};
/* the eclipse darkens the sky */
const _ueX=updateEnv;updateEnv=function(dt,pp){_ueX(dt,pp);const k=BX.eclK;if(k<.01||!pp||pp.inCave)return;
  sun.intensity*=1-.85*k;hemi.intensity*=1-.55*k;skyMat.uniforms.top.value.lerp(new T.Color(0x0a0620),k*.9);skyMat.uniforms.hor.value.lerp(new T.Color(0x40204a),k*.8);scene.fog.color.lerp(new T.Color(0x1a1028),k*.8);if(scene.background&&scene.background.lerp)scene.background.lerp(new T.Color(0x1a1028),k*.8)};
const _piX=pwInit;pwInit=function(f){_piX(f);for(const q of TRAPS)kill(q.dc);TRAPS.length=0;HIST.length=0;Object.assign(BX,{seal:0,flower:0,ecl:0,glide:0})};

/* ---------- what other players see when you cast ---------- */
const PEER={time:['circle_time.png',0xffe9a0],space:['circle_space.png',0xffa0ff],rune:['rune_magic.png',0x8ab0ff],nature:['ins_green.png',0xffffff],wind:['rune_swirl.png',0xffffff],sun:['circle_orange.png',0xffffff]};
window.pwPeerFx=function(a,pw,i,x,y,z){const p=PEER[pw];if(!p)return false;ringFlash(tx(p[0]),p[1],x,z,1,i===2?10:i===1?6:2.5,i===2?1.6:.8);if(pw==='sun'&&i===1)pillar(x,z,tx('rise_white.png'),0xffc060,40,6,1.2);if(pw==='rune'&&i===2)pillar(x,z,tx('rise_blue.png'),0xffffff,16,4,1.4);return false};

/* ---------- the ritual: how each power shows itself when you receive it ---------- */
const ritDecal=(S,map,col,r,y=.04)=>{const m=new T.Mesh(new T.PlaneGeometry(r*2,r*2),WD.addM(map,col,0));m.rotation.x=-Math.PI/2;m.position.y=y;S.add(m);return m};
const ritSpr=(S,map,col,s)=>{const o=spr(map,col,0,s);S.add(o);return o};
window.PWRIT={
  time:(S,f)=>{const d=ritDecal(S,tx('circle_time.png'),0xffe9a0,6.5),h=ritDecal(S,tx('ring_red.png'),0xffd060,3.6,.06);return{u(t,dt,hp){d.material.opacity=Math.min(.95,(t-6.8)*1.5);h.material.opacity=d.material.opacity*.6;d.rotation.z-=dt*(t<8?2:.15);h.rotation.z+=dt*.8;
    if(Math.random()<.7)f.em(f.urnd(-5,5),.1,f.urnd(-5,5),0,f.urnd(.2,.6),0,3,.07,new T.Color(1,.88,.5))}}},
  space:(S,f)=>{const v=ritSpr(S,tx('pool_cel.png'),0xffffff,1),d=ritDecal(S,tx('circle_space.png'),0xffa0ff,6);v.position.set(0,2.4,-3.2);return{u(t,dt,hp){const k=Math.min(1,(t-6.8)*1.2);v.material.opacity=k;v.scale.set(4.6*k,5.4*k,1);v.material.rotation+=dt*1.6;d.material.opacity=k*.85;d.rotation.z+=dt*.4;
    for(let i=0;i<3;i++){const a=Math.random()*6.283,r=f.urnd(2,6);f.em(Math.cos(a)*r,hp.y+f.urnd(-1,2),Math.sin(a)*r,-Math.cos(a)*1.5-Math.sin(a)*2,0,-Math.sin(a)*1.5+Math.cos(a)*2,1.2,.1,new T.Color(1,.75,1))}}}},
  rune:(S,f)=>{const d=ritDecal(S,tx('rune_magic.png'),0x8ab0ff,5.6),P=[];for(let i=0;i<5;i++){const a=-Math.PI/2+i*1.2566,s=ritSpr(S,tx('rise_blue.png'),0xffffff,1);s.position.set(Math.cos(a)*4.6,0,Math.sin(a)*4.6);P.push(s)}
    return{u(t,dt,hp){const k=Math.min(1,(t-6.8)*1.3);d.material.opacity=k;d.rotation.z+=dt*.3;P.forEach((s,i)=>{const hh=12*Math.min(1,Math.max(0,(t-6.9-i*.12)*2));s.scale.set(2.6,hh+.01,1);s.position.y=hh/2;s.material.opacity=.8*k})}}},
  nature:(S,f)=>{const d=ritDecal(S,tx('ins_green.png'),0xffffff,6),fl=[];WD.load().then(()=>{const g=WD.geo('Flower_Bellflower'),m=flowerM();for(let i=0;i<10;i++){const a=i/10*6.283,o=g?new T.Mesh(g,m):new T.Mesh(new T.ConeGeometry(.4,1.2,6),m);o.position.set(Math.cos(a)*3.3,0,Math.sin(a)*3.3);o.rotation.y=-a;o.scale.setScalar(.01);S.add(o);fl.push(o)}});
    return{u(t,dt,hp){const k=Math.min(1,(t-6.8)*.9);d.material.opacity=k;d.rotation.z+=dt*.2;for(const o of fl)o.scale.setScalar(.01+.5*k);if(Math.random()<.8)f.em(f.urnd(-3,3),.4,f.urnd(-3,3),0,f.urnd(.4,1),0,2.5,.08,new T.Color(.7,1,.45))}}},
  wind:(S,f)=>{const R=[];for(let i=0;i<5;i++){const m=ritDecal(S,tx('rune_swirl.png'),0xffffff,1.6+i*.7,.4+i*1.1);R.push(m)}return{u(t,dt,hp){const k=Math.min(1,(t-6.8)*1.2);R.forEach((m,i)=>{m.material.opacity=.6*k;m.rotation.z+=dt*(4+i)});
    for(let i=0;i<3;i++){const a=Math.random()*6.283,h=Math.random()*6,r=1+h*.5;f.em(Math.cos(a)*r,h,Math.sin(a)*r,-Math.sin(a)*4,1,Math.cos(a)*4,.9,.12,new T.Color(.9,1,1))}}}},
  sun:(S,f)=>{const C=[];for(let i=0;i<4;i++){const s=ritSpr(S,crescent(),0xffffff,1.3);C.push(s)}const g=ritSpr(S,tx('glare.png'),0xffc070,10);g.position.set(0,9,-6);const d=ritDecal(S,tx('circle_orange.png'),0xffffff,5.2);
    return{u(t,dt,hp){const k=Math.min(1,(t-6.8)*1.2);C.forEach((s,i)=>{const a=t*2+i*1.5708;s.position.set(Math.cos(a)*2.4,hp.y+Math.sin(t*3+i)*.3,Math.sin(a)*2.4);s.material.opacity=k;s.material.rotation-=dt*5});g.material.opacity=.8*k;d.material.opacity=k*.9;d.rotation.z+=dt*.5}}}};
})();
