/* ================= Real sound effects =================
   Recorded sounds replace the synthesized beeps. They are CC0 packs from OpenGameArt: Kenney's RPG Audio and Interface
   Sounds, rubberduck's RPG/SFX/water packs and the Monster Sound Pack. See assets/sfx/License.txt.
   Covered: sword swings and hits, blocks, arrows, getting hurt, coins, gems, pickups, quests, level-ups, eating, water,
   chests, doors, chopping trees, mining, footsteps (grass and stone, wood indoors, water), monster growls, roars, pain
   and death cries (by kind of monster, louder when close, from the side they are on), spells, boss blasts and the menus.
   The sounds load in the background; until then, or if they fail, the old synthesized sounds play. */
(function(){
const SB={buf:{},ok:false,last:{},t:{},gemT:0,bossT:-99};WD.sounds=SB;
let raw=null;
fetch('assets/sfx/sfx.json.txt').then(r=>r.ok?r.json():null).then(j=>{raw=j}).catch(()=>{});
const b64=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
const decode=ab=>new Promise(res=>{try{const p=AC.decodeAudioData(ab,res,()=>res(null));if(p&&p.catch)p.catch(()=>res(null))}catch(e){res(null)}});
let decoding=false;
async function decodeAll(){decoding=true;let n=0;for(const k in raw){SB.buf[k]=[];for(const s of raw[k]){const b=await decode(b64(s));if(b){SB.buf[k].push(b);n++}}}raw=null;SB.ok=n>0;SB.n=n}
setInterval(()=>{if(raw&&!decoding&&typeof AC!=='undefined'&&AC)decodeAll()},700);

/* play one of the recordings for k; vol 0..1, rate = pitch, pan -1..1 */
function play(k,vol=.6,rate=1,pan=0){const L=SB.buf[k];if(!SB.ok||!L||!L.length||!AC||!MASTER)return false;
  const now=AC.currentTime;if(now-(SB.t[k]||0)<.045)return true;SB.t[k]=now;if(AC.state==='suspended')AC.resume();
  let i=Math.floor(Math.random()*L.length);if(L.length>1&&i===SB.last[k])i=(i+1)%L.length;SB.last[k]=i;
  const s=AC.createBufferSource();s.buffer=L[i];s.playbackRate.value=rate*(.94+Math.random()*.12);const g=AC.createGain();g.gain.value=vol;s.connect(g);
  if(pan&&AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));g.connect(p);p.connect(MASTER)}else g.connect(MASTER);s.start();return true}
SB.play=play;window.playSound=play;
/* a sound at a place in the world: quieter further away, panned to its side */
function at(k,x,z,vol,rate,range=55){const d=Math.hypot(x-PL.x,z-PL.z);if(d>range)return;const v=vol*Math.pow(1-d/range,1.3);
  const a=Math.atan2(x-camera.position.x,z-camera.position.z),f=PL.yaw;const pan=-Math.sin(a-f)*.8;play(k,v,rate,pan)}
SB.at=at;

/* ---------- the old sound names now play recordings ---------- */
const MAP={swing:['swing',.5],hit:['hit',.65],hurt:['hurt',.75],bow:['bow',.55],block:['block',.6],coin:['coin',.55],pickup:['pickup',.5],
  level:['level',.55],quest:['quest',.6],eat:['eat',.6],splash:['splash',.45],drip:['drip',.18],click:['click',.35]};
const _sfx=sfx;sfx=function(k){try{
    if(k==='pickup'&&performance.now()-SB.gemT<80&&play('gem',.55))return;
    if(k==='thunder'&&PL.t-SB.bossT<4)play('boom',.75,.8);
    const m=MAP[k];if(m&&play(m[0],m[1]))return}catch(e){}return _sfx(k)};
const _gi=giveItem;giveItem=function(id,n,q){if(/gem|pearl|crystal|heart|eye|core|amu_|ring_/.test(id))SB.gemT=performance.now();return _gi(id,n,q)};

/* ---------- monsters ---------- */
const BIG=new Set(['troll','goblinbrute','goblinking','golem','lavagolem','treant','yeti','fourhands','demon','dragon','dragonkin','lavaturtle','kraken','orc','giant']);
function voice(a){const t=a.type||'';
  if(t==='wolf'||t==='shadowwolf')return['growl',1.45];if(t==='bear'||t==='boar')return['growl',.95];if(t==='spider')return['slime',.9];
  if(t==='skeleton'||t==='wraith')return['chain',1.25];if(t==='goblin'||t==='imp'||t==='piranha')return['critter',1.1];
  if(t==='serpent'||t==='shark')return['roar',.85];if(BIG.has(t))return['roar',t==='fourhands'||t==='kraken'||t==='yeti'?.62:.8];
  if(t==='bandit'||t==='archer'||t==='titancore')return null;return['growl',1]}
const _ue=updateEnemy;updateEnemy=function(a,dt){const was=a.state;_ue(a,dt);
  if(a.dead||!started)return;const v=voice(a);if(!v)return;
  if(a.state==='chase'&&was!=='chase'&&PL.t-(a.vT||-99)>7){a.vT=PL.t;at(v[0],a.x,a.z,BIG.has(a.type)?.9:.6,v[1],BIG.has(a.type)?110:55)}
  else if(a.state==='chase'&&BIG.has(a.type)&&PL.t-(a.vT||-99)>rnd(9,15)){a.vT=PL.t;at(v[0],a.x,a.z,.85,v[1],120)}
  if(a.state==='chase'&&(a.boss||a.titan)&&Math.hypot(a.x-PL.x,a.z-PL.z)<90)SB.bossT=PL.t};
const _hit=hitActor;hitActor=function(a,dmg,by,dir){const r=_hit(a,dmg,by,dir);try{if(a&&a.kind==='enemy'&&!a.dead&&PL.t-(a.hT||-9)>.9&&Math.random()<.45){const v=voice(a);if(v){a.hT=PL.t;at('mhurt',a.x,a.z,.5,v[1]*1.05,45)}}}catch(e){}return r};
const _ka=killActor;killActor=function(a,by){_ka(a,by);try{if(a&&a.kind==='enemy'){const v=voice(a);if(v)at('mdie',a.x,a.z,BIG.has(a.type)?.9:.55,v[1]*.95,80)}}catch(e){}};

/* ---------- footsteps, doors, water ---------- */
let stepT=0,wasInside=null,wasSwim=false;
ANIMS.push(dt=>{if(!started||PL.dead||!SB.ok)return;
  if(PL.inside!==wasInside){if(PL.inside||wasInside)play('door',.45);wasInside=PL.inside}
  if(PL.swim&&!wasSwim)play('splash',.55);wasSwim=PL.swim;
  const m=PL.mounted;if(m&&m.flyM)return;
  if(!PL.onGround&&!PL.swim||PL.speed<.6||anyModal()){stepT=Math.min(stepT,.1);return}
  stepT-=dt;if(stepT>0)return;
  if(m){stepT=PL.sprint?.2:.34;play('step',.32,.72);return}
  stepT=Math.max(.25,Math.min(.55,1.75/PL.speed));
  if(PL.swim)play('splash',.12,1.3);else if(groundH(PL.x,PL.z)<-.25)play('stepwet',.3);else if(PL.inside)play('stepwood',.32);else play('step',.24)});

/* ---------- chests, trees, rocks, spells ---------- */
try{const _oc=openChest;openChest=function(c){const was=c&&c.open;_oc(c);if(c&&!was)play('chest',.6)}}catch(e){}
try{const _ct=chopTree;chopTree=function(t){const cd=gCd;_ct(t);if(cd<=0&&gCd>0)play('chop',.6)}}catch(e){}
try{const _mr=mineRock;mineRock=function(q){const cd=gCd;_mr(q);if(cd<=0&&gCd>0)play('stone',.6)}}catch(e){}
try{const _pc=pwCast;pwCast=function(i){const cd=PW.cd&&PW.cd[i];_pc(i);if(PW.cd&&PW.cd[i]>(cd||0))play(PL.power==='fire'?'fire':'spell',.55,PL.power==='ice'?1.2:PL.power==='shadow'?.8:1)}}catch(e){}

/* ---------- menus ---------- */
try{const _tm=toggleModal;toggleModal=function(id,render){const el=$(id),open=el&&el.style.display==='block';_tm(id,render);play(open?'close':'open',.35)}}catch(e){}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button,.it,.gs,.ob,.tbtn');if(b)play('click',.28)},true);
})();
