/* ================= People who act more like real people =================
   - When it rains, people go home, and they come out again when it stops.
   - They notice you: they react when you are hurt, flying a dragon, riding a horse or a beetle, very rich, out late
     at night, or when you are their own king or queen.
   (The typing box for talking with people was removed at Filip's request.) */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,FX=()=>{PL.fx=PL.fx||{};return PL.fx},KG=()=>WD.kingdom,me=()=>(PL.look&&PL.look.name)||'reiziger';
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
WD.praten={};
})();
