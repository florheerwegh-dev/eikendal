/* ================= Emotes =================
   Press N (or the Emotes button at the bottom) for a little menu: dance, wave, cheer, yes, no, sit, kneel, fold your
   arms, laugh or do a magic trick. Your hero plays it until you walk away; people nearby react (they wave back, dance
   along or laugh with you), and in multiplayer the other players see it too. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a;
const EM=[['dans','💃','Dansen','Dance_Loop',30],['zwaai','👋','Zwaaien','Interact',1.6],['juich','🎉','Juichen','Jump_Loop',1.6],['ja','👍','Ja','Interact',1.4],['nee','👎','Nee','Idle_No_Loop',1.8],
  ['zit','🪑','Zitten','Sitting_Idle_Loop',60],['knie','🙇','Knielen','Fixing_Kneeling',8],['armen','💪','Armen over elkaar','Idle_FoldArms_Loop',30],['lach','😂','Lachen','Idle_Talking_Loop',2.5],['tover','✨','Toveren','Spell_Simple_Idle_Loop',3]];
const REACT={dans:['Wat een danser!','Ik dans mee!','Haha, leuk!'],zwaai:['Hallo!','Goedendag!','Hoi!'],juich:['Hoera!','Jippie!'],lach:['Hahaha!','Hihi!'],knie:['Sta op, held!','Wat beleefd!'],tover:['Ooh, magie!','Hoe doe je dat?!'],zit:['Even rusten?'],armen:['Hmpf.']};
function play(k){const e=EM.find(x=>x[0]===k);if(!e||!started||PL.dead||PL.mounted)return;
  if(window.MP&&MP.room&&WD.emotes&&WD.emotes.play){WD.emotes.play(k)}
  if(pm&&pm.sk){pm.onceName=e[3];pm.onceT=e[4]}try{floatText(PL.x,PL.y+2.5,PL.z,e[1],'#fff')}catch(x){}
  if(k==='juich'&&window.PW&&PW.ps)for(let i=0;i<30;i++)pwEm(PW.ps,PL.x,PL.y+2.2,PL.z,rr(3),3+Math.random()*3,rr(3),1.4,.15,.1,[1,.85,.3],[.4,.8,1],1,-6,1);
  if(k==='tover'&&window.PW&&PW.ps)for(let i=0;i<40;i++){const a=Math.random()*6.283;pwEm(PW.ps,PL.x+Math.cos(a)*.8,PL.y+1.2,PL.z+Math.sin(a)*.8,Math.cos(a)*1.5,1+Math.random()*2,Math.sin(a)*1.5,1.2,.2,.04,[.8,.6,1],[1,.9,.5],1,0,1)}
  /* people nearby react */
  const L=REACT[k];if(L)for(const a of actors){if(a.dead||a.kind!=='npc'||a.guard||Math.hypot(a.x-PL.x,a.z-PL.z)>9)continue;if(Math.random()<.7)setTimeout(()=>{try{saySomething(a,L[Math.floor(Math.random()*L.length)],2.5);a.rot=Math.atan2(PL.x-a.x,PL.z-a.z);if(a.h&&a.h.sk&&(k==='dans'||k==='zwaai')){a.h.onceName=k==='dans'?'Dance_Loop':'Interact';a.h.onceT=k==='dans'?4:1.5}}catch(x){}},300+Math.random()*900)}
  close()}
let menu=null;
function open(){if(!menu){menu=document.createElement('div');menu.className='panel';menu.style.cssText='position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:25;padding:8px;display:none;flex-wrap:wrap;gap:6px;justify-content:center;width:min(560px,94vw)';
    EM.forEach(([k,ic,n])=>{const b=document.createElement('button');b.className='btn';b.innerHTML='<span style="font-size:20px">'+ic+'</span> '+n;b.onclick=()=>play(k);menu.appendChild(b)});menu.addEventListener('mousedown',e=>e.stopPropagation());document.body.appendChild(menu)}
  const show=menu.style.display!=='flex';menu.style.display=show?'flex':'none';if(show)try{document.exitPointerLock()}catch(e){}}
function close(){if(menu)menu.style.display='none'}
addEventListener('keydown',e=>{if(!started||(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')))return;if(e.code==='Escape')close();if(e.code!=='KeyN')return;if(typeof placing!=='undefined'&&placing)return;if(typeof anyModal==='function'&&anyModal())return;e.preventDefault();open()});
function btn(){const q=$('qbar');if(!q||$('qb_emote'))return;const b=document.createElement('button');b.id='qb_emote';b.innerHTML='Emotes<kbd>N</kbd>';b.onclick=open;q.appendChild(b)}
addEventListener('load',btn);setTimeout(btn,3000);WD.emote={play,open,EM};
})();
