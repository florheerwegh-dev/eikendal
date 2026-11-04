/* ================= Big armies stay smooth =================
   Every knight stays a full 3D character, near or far. But knights and soldiers far from the camera think and walk a
   little less often (every 2nd frame beyond 70 m, every 4th beyond 180 m, with the time added up so they still move
   at the right speed), which keeps the game playable with hundreds of knights. */
(function(){
const KG=WD.kingdom;
const _uNC=updateNPC;updateNPC=function(a,dt){if(a&&a.guard&&a.kind==='npc'&&!a.prot&&!(KG&&KG.spec&&KG.spec.a===a)){const d=Math.abs(a.x-camera.position.x)+Math.abs(a.z-camera.position.z);
    if(d>70){a._acc=(a._acc||0)+dt;a._cnt=(a._cnt||0)+1;if(a._cnt<(d>180?4:2))return;a._cnt=0;dt=Math.min(.25,a._acc);a._acc=0}}
  return _uNC(a,dt)};
})();

/* ================= Far-away fights are silent =================
   Your knights fighting far away used to fill your ears with clangs and your screen with damage numbers. Now hits,
   deaths and damage numbers further than about 70 m from the camera make no sound and show no number. */
(function(){
const near=(x,z,r)=>Math.abs(x-camera.position.x)+Math.abs(z-camera.position.z)<r;
let QUIET=0;
const _ftQ=floatText;floatText=function(x,y,z,t,c){if(typeof x==='number'&&!near(x,z,75))return;return _ftQ.apply(this,arguments)};
const _hAQ=hitActor;hitActor=function(a,dmg,byPlayer,dir){if(a&&!byPlayer&&!near(a.x,a.z,75)){QUIET++;try{return _hAQ(a,dmg,byPlayer,dir)}finally{QUIET--}}return _hAQ(a,dmg,byPlayer,dir)};
const _kAQ=killActor;killActor=function(a,b){if(a&&!b&&!near(a.x,a.z,75)){QUIET++;try{return _kAQ(a,b)}finally{QUIET--}}return _kAQ(a,b)};
/* the sound wrapper goes on last, over every other sound script */
addEventListener('load',()=>{const _s=sfx;sfx=function(){if(QUIET)return;return _s.apply(this,arguments)};
  try{if(WD.sounds&&WD.sounds.play){const _p=WD.sounds.play.bind(WD.sounds);WD.sounds.play=function(){if(QUIET)return;return _p.apply(null,arguments)}}}catch(e){}});
})();
