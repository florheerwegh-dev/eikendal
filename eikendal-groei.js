/* ================= Your dragon grows up =================
   Vonk (or Vonkje) grows from a baby dragon into a young dragon and then into a great dragon as big as a house. She
   grows by spending time with you, by fighting at your side and by eating: when she is hungry she sniffs in your bag
   and eats raw game, fish or roast meat. A young dragon flies faster and her bite is stronger; a grown dragon flies
   very fast, and while you ride her you press R to breathe a stream of fire at what lies ahead of you. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}};
const ST=[{n:'babydraak',s:.3,top:1.6,pow:1,xp:0},{n:'jonge draak',s:.5,top:2.1,pow:1.8,xp:600},{n:'grote draak',s:.82,top:2.8,pow:3,xp:1500}];
const D=()=>PL.fx&&PL.fx.babyDragon,stage=()=>{const d=D();if(!d)return 0;const x=d.xp||0;return x>=ST[2].xp?2:x>=ST[1].xp?1:0};
WD.petStage=()=>ST[stage()].n;WD.petTop=()=>ST[stage()].top;WD.petPow=()=>ST[stage()].pow;
const G={acc:0,cur:-1,from:0,to:0,t:1,hungry:120,breathCd:0};
/* growing: about 25 minutes together for a grown dragon, faster when she fights and eats */
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;const P=WD.pet&&WD.pet(),d=D();if(!P||!d||!started)return;
  const st=stage();if(G.cur<0){G.cur=st;P.s=ST[st].s;if(P.grow>=1)P.root.scale.setScalar(P.s)}
  if(G.t<1){G.t=Math.min(1,G.t+dt/5);const k=G.from+(G.to-G.from)*(1-Math.pow(1-G.t,3));P.s=k;P.root.scale.setScalar(k);if(window.PW&&PW.ps&&Math.random()<dt*20)pwEm(PW.ps,P.x+rr(2),P.y+1+Math.random()*2,P.z+rr(2),rr(.5),1.5,rr(.5),1.2,.3,.05,[1,.9,.4],[1,.5,.1],1,0,1)}
  G.acc+=dt;if(G.acc<1)return;const s=G.acc;G.acc=0;
  if(Math.hypot(P.x-PL.x,P.z-PL.z)<45&&!(P.sleep>0))d.xp=(d.xp||0)+s;
  /* hungry now and then: she eats from your bag */
  G.hungry-=s;if(G.hungry<=0){const food=['meat','fish','roast','eel'].find(id=>ITEMS[id]&&(PL.inv[id]||0)>0);if(food){takeItem(food,1);d.xp=(d.xp||0)+60;G.hungry=150;addLog(P.name+' snuffelt in je tas en eet '+ITEMS[food].n.toLowerCase()+'. Ze groeit ervan!','#ffd27a');try{floatText(P.x,P.y+2,P.z,'😋','#fff')}catch(e){}}else G.hungry=60}
  const ns=stage();if(ns>G.cur){try{WD.chron.add(P.name+' groeide op tot een '+ST[ns].n+'.')}catch(e){}G.from=P.s;G.to=ST[ns].s;G.t=0;G.cur=ns;sfx('level');try{WD.roar&&WD.roar(.5)}catch(e){}
    card('🐉 '+P.name+' is gegroeid!',ns===1?P.name+' is nu een jonge draak! Ze vliegt sneller en haar vuur is sterker. Blijf samen op avontuur gaan, dan wordt ze nog veel groter.':P.name+' is nu een grote draak, zo groot als een huis! Ze vliegt razendsnel, en als je op haar rug zit, spuwt ze met R een vuurstraal naar alles voor je.',null,11)}});
/* kills she helps with make her grow */
const _kaG=killActor;killActor=function(a,by){const was=a&&a.dead;_kaG(a,by);try{const P=WD.pet&&WD.pet(),d=D();if(!was&&by&&a.kind==='enemy'&&P&&d&&Math.hypot(a.x-P.x,a.z-P.z)<25)d.xp=(d.xp||0)+25}catch(e){}};
/* fire breath while you ride her (R), from a young dragon on; stronger when she is grown */
function breath(){const P=PL.mounted;if(!P||!P.flyM)return false;const st=stage();if(st<1){addLog(P.name+' is nog te klein om vuur te spuwen terwijl je op haar rijdt.');return true}
  if(G.breathCd>0)return true;G.breathCd=st===2?.8:1.3;const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot),hx=PL.x+fx*(2+st*2),hz=PL.z+fz*(2+st*2),hy=PL.y+.6+st*.8,R=st===2?22:15,dmg=Math.round((st===2?55:30)+PL.lvl*(st===2?5:3));
  if(window.PW&&PW.ps)for(let i=0;i<(st===2?70:40);i++){const sp=14+Math.random()*10,dn=-.25-Math.random()*.25;pwEm(PW.ps,hx,hy,hz,fx*sp+rr(2.4),sp*dn+rr(1.5),fz*sp+rr(2.4),.9,.5+st*.25,.12,[1,.85,.3],[1,.25,0],1,-.3,1.2)}
  try{sfx('swing');WD.roar&&WD.roar(.25)}catch(e){}
  setTimeout(()=>{for(const a of actors){if(a.dead||a.kind!=='enemy'||a.passive||a.seaAlly||!!a.cave!==!!PL.inCave)continue;const dx=a.x-PL.x,dz=a.z-PL.z,dd=Math.hypot(dx,dz);if(dd>R||dd<.5)continue;if((dx*fx+dz*fz)/dd<.82)continue;if(PL.y-(a.y||0)>R)continue;
    hitActor(a,dmg,true,{x:dx/dd,z:dz/dd});try{pwStatus(a,'burn',3,6+PL.lvl)}catch(e){}}},200);return true}
addEventListener('keydown',e=>{if(e.code!=='KeyR'||!started||PL.dead||(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')))return;if(PL.mounted&&PL.mounted.flyM&&breath()){e.stopImmediatePropagation();e.preventDefault()}},true);
ANIMS.push(dt=>{G.breathCd-=typeof dt==='number'?dt:.016});
WD.grow={stage,breath,ST};
})();
