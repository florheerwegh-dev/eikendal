/* ================= Daily life of the villagers =================
   The people of the towns now live their day:
   - around noon they eat: on the benches by the square or inside the inn, with a loaf of bread in their hand;
   - in the afternoon they go shopping: they walk to a merchant and haggle ("Hoeveel voor die appels?");
   - they fetch water at the well, and sit on the benches for a chat;
   - in the evening many go to the inn for a drink: they sit inside with a mug, toast and laugh;
   - at night they sleep at home (you may hear them snore when you walk in).
   Only for the townsfolk near you; guards, shopkeepers and travellers keep their own jobs. */
(function(){
const L={benches:[],ready:false};WD.life=L;
const can=a=>a.kind==='npc'&&!a.dead&&!a.guard&&!a.shop&&a.job!=='lord'&&a.ai!=='stay'&&a.ai!=='travel'&&a.ai!=='escort'&&!a.prot&&!a.order&&!a.quest&&!a.ruler&&!a.bought;
const inns=()=>Object.values(SHOP).filter(b=>b&&b.kind==='inn');
const sellers=()=>actors.filter(a=>a.kind==='npc'&&!a.dead&&a.shop&&a.ai==='stay'&&!a.cave);
/* benches round the squares */
function benches(){const spots=[[2,-4,11],[300,-214,12],[730,545,14]];for(const [cx,cz,r] of spots){for(let i=0;i<6;i++){const a=i/6*6.283+.3,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(terrainH(x,z)<.3)continue;const y=groundH(x,z),g=new T.Group();g.position.set(x,y,z);g.rotation.y=Math.atan2(cx-x,cz-z);
  g.add(mesh(new T.BoxGeometry(1.7,.1,.45),MAT.wood,0,.46,0));g.add(mesh(new T.BoxGeometry(1.7,.42,.08),MAT.wood,0,.72,-.22));for(const sx of[-.7,.7])g.add(mesh(new T.BoxGeometry(.1,.46,.4),MAT.wood,sx,.23,0));scene.add(g);
  L.benches.push({x,z,y,face:g.rotation.y,taken:null});addCircle(x,z,.5)}}}
const freeBench=a=>{let b=null,bd=90;for(const q of L.benches){if(q.taken&&q.taken!==a&&!q.taken.dead&&q.taken.life)continue;const d=Math.hypot(q.x-a.x,q.z-a.z);if(d<bd){bd=d;b=q}}return b};
/* props in the hand */
const loafG=new T.CylinderGeometry(.07,.08,.2,8),mugG=new T.CylinderGeometry(.06,.05,.14,10);
function prop(a,kind){drop(a);const hand=a.h&&(a.h.hand||a.h.armR);if(!hand)return;const m=kind==='mug'?new T.Mesh(mugG,new T.MeshStandardMaterial({color:0x8a6a3a,roughness:.7})):new T.Mesh(loafG,new T.MeshStandardMaterial({color:0xc8924a,roughness:.9}));
  if(kind==='loaf')m.rotation.z=Math.PI/2;const s=a.h.scale||1;m.scale.setScalar(1/Math.max(.3,s));hand.add(m);a.lifeProp=m}
function drop(a){if(a.lifeProp){a.lifeProp.parent&&a.lifeProp.parent.remove(a.lifeProp);a.lifeProp=null}}
const LINES={eat:['Mmm, vers brood!','Heerlijk...','Dit smaakt naar meer.','De bakker kan er wat van.'],drink:['Proost!','Nog een bier, Gerrit!','Op Eikendal!','Haha, die is goed!','Proost op de held!','Wie zingt er mee?'],
  buy:['Hoeveel voor die appels?','Heb je ook iets goedkopers?','Dat is te duur!','Afgesproken, ik neem er twee.'],sell:['Twee goud, vriend!','Voor jou maak ik een prijsje.','Beste waar van het land!','Kom morgen terug, dan heb ik meer.'],
  well:['Zo, een emmer vol.','Fris water!'],sit:['Wat een mooie dag.','Even uitrusten...','Heb je het nieuws gehoord?','Mijn voeten doen pijn.']};
/* picking what to do at this hour */
function choose(a){const h=ENV.time,r=Math.random();
  if(h>=11.3&&h<13.5&&r<.5)return r<.3?inn(a,'eat'):bench(a,'eat');
  if(h>=13.5&&h<17.5){if(r<.3)return trade(a);if(r<.45)return bench(a,'sit');if(r<.55)return well(a)}
  if(h>=18&&h<22.5&&r<.55)return inn(a,'drink');
  if(h>=7&&h<11.3&&r<.15)return well(a);return null}
function bench(a,what){const b=freeBench(a);if(!b)return null;b.taken=a;return{k:what,to:[b.x+Math.sin(b.face)*.25,b.z+Math.cos(b.face)*.25],face:b.face+Math.PI,sit:true,dur:rnd(25,55),bench:b}}
function inn(a,what){let best=null,bd=170;for(const b of inns()){const d=Math.hypot(b.x-a.x,b.z-a.z);if(d<bd){bd=d;best=b}}if(!best)return null;const b=best,sp=l2w(b,rnd(-b.w/2+1.4,b.w/2-1.4),rnd(-b.d/2+1.5,b.d/2-2.6));
  return{k:what,route:[b.doorPos,l2w(b,b.doorX,b.d/2-1.3),sp],out:[l2w(b,b.doorX,b.d/2-1.3),b.doorPos],sit:true,dur:what==='drink'?rnd(60,140):rnd(30,60),b}}
function trade(a){let s=null,bd=150;for(const m of sellers()){const d=Math.hypot(m.x-a.x,m.z-a.z);if(d<bd){bd=d;s=m}}if(!s)return null;const fx=Math.sin(s.rot),fz=Math.cos(s.rot);return{k:'buy',to:[s.x+fx*1.6+rnd(-.4,.4),s.z+fz*1.6+rnd(-.4,.4)],seller:s,dur:rnd(10,18)}}
function well(a){const w=(window.WELLS||[]).concat(L.wells||[]);let p=null,bd=120;for(const q of w){const d=Math.hypot(q.x-a.x,q.z-a.z);if(d<bd){bd=d;p=q}}if(!p)return null;return{k:'well',to:[p.x+rnd(-1.2,1.2),p.z+1.4],dur:rnd(5,8),work:true}}
/* doing it */
function life(a,dt){const A=a.life;if(a.sayT>0){a.sayT-=dt;if(a.sayT<=0)a.say=''}
  if(A.ph==='go'){let arrived=false;if(A.route){if(!a.route){a.route=A.route;a.ri=0}followRoute(a,dt,2.4,()=>{A.ph='do';A.t=A.dur;a.inHome=false});if(a.route===null&&A.ph==='do')arrived=true}
    else if(stepTo(a,dt,A.to[0],A.to[1],2.2,.6)||a.stuck>4){a.stuck=0;A.ph='do';A.t=A.dur;arrived=true}
    if(arrived){if(A.k==='eat')prop(a,'loaf');if(A.k==='drink')prop(a,'mug');a.h&&(a.h.sitTalk=true)}
    if(A.t0===undefined)A.t0=PL.t;if(PL.t-A.t0>70){end(a);return}
    if(a.h)animHuman(a.h,dt,a.vel,{});return}
  if(A.ph==='do'){A.t-=dt;a.vel=0;if(A.face!==undefined)a.rot+=angDiff(a.rot,A.face)*Math.min(1,dt*4);
    if(A.k==='buy'&&A.seller){a.rot+=angDiff(a.rot,Math.atan2(A.seller.x-a.x,A.seller.z-a.z))*Math.min(1,dt*5)}
    A.n=(A.n||rnd(1,4))-dt;if(A.n<=0){A.n=rnd(5,10);const near=Math.hypot(PL.x-a.x,PL.z-a.z)<30;
      if(A.k==='buy'){saySomething(a,pick(LINES.buy),3);if(A.seller)setTimeout(()=>{try{saySomething(A.seller,pick(LINES.sell),3)}catch(e){}},1600);if(near&&Math.random()<.5)try{WD.sounds&&WD.sounds.at('coin',a.x,a.z,.3,1.1,25)}catch(e){}}
      else if(A.k==='drink'){saySomething(a,pick(LINES.drink),3);if(near&&Math.random()<.3)try{WD.sounds&&WD.sounds.at('glass',a.x,a.z,.3,1,25)}catch(e){}}
      else if(A.k==='eat'){if(Math.random()<.5)saySomething(a,pick(LINES.eat),2.6)}
      else if(A.k==='well')saySomething(a,pick(LINES.well),2.4);else if(A.k==='sit'&&Math.random()<.5)saySomething(a,pick(LINES.sit),3)}
    if(a.lifeProp){const k=Math.sin(PL.t*2+a.id);a.lifeProp.rotation.x=k>.7?-1.2:0}
    if(a.h)animHuman(a.h,dt,0,A.sit?{sit:true}:A.work?{work:true}:{});
    if(A.t<=0){if(A.out){A.ph='out';a.route=A.out;a.ri=0}else end(a)}return}
  if(A.ph==='out'){followRoute(a,dt,2.4,()=>end(a));if(a.h)animHuman(a.h,dt,a.vel,{});return}}
function end(a){const A=a.life;if(A&&A.bench&&A.bench.taken===a)A.bench.taken=null;drop(a);if(a.h)a.h.sitTalk=false;a.life=null;a.lifeCd=PL.t+rnd(40,120);a.route=null;a.wp=null;a.t=0}
const _uN=updateNPC;updateNPC=function(a,dt){
  if(a.life){if(!can(a)&&!a.life.keep||a.state==='flee'||a.angry){end(a);return _uN(a,dt)}return life(a,dt)}
  if(L.ready&&can(a)&&!a.inHome&&!a.route&&(!a.talk||a.talk.t<=0)&&PL.t>(a.lifeCd||0)&&Math.random()<dt*.08){a.lifeCd=PL.t+rnd(20,60);const A=choose(a);if(A){A.ph='go';a.life=A;a.wp=null;return life(a,dt)}}
  _uN(a,dt);
  /* snoring at home */
  if(a.inHome&&(ENV.night||0)>.6&&PL.inside===a.homeB&&Math.random()<dt*.12)floatText(a.x,a.y+1.6,a.z,'Zzz','#cfd8ff')};
let started0=false;ANIMS.push(()=>{if(started0||!started||!worldReady)return;started0=true;try{benches();L.wells=[];for(const b of BUILDINGS)if(b.kind==='well')L.wells.push({x:b.x,z:b.z});{const wl=HIDDEN.find(q=>q.id==='well');if(wl)L.wells.push({x:wl.x,z:wl.z})}
  L.ready=true}catch(e){console.warn('life',e)}});
})();
