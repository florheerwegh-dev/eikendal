/* ================= The pirate ship =================
   De Zwarte Haai sails round and round off the coast, with black sails and a skull. Come near (in a rowing boat, or
   swimming) and her cannons fire at you. Get alongside and board her: she drops anchor, the pirates come at you over
   the deck, and Kapitein Haaientand himself fights at the helm. Beat them all and open the captain's chest: gold, his
   compass, and two treasure maps. Half an hour later a new crew sails her again. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}},chron=t=>{try{WD.chron.add(t)}catch(e){}},FX=()=>{PL.fx=PL.fx||{};return PL.fx};
ITEMS.piratenkompas={n:'Kompas van Kapitein Haaientand',g:'amulet',fx:{spd:.1,gold:.2,dmg:4},col:0xe0b04a,price:3000,ico:'🧭',rar:'l',desc:'Het wijst altijd naar goud... zegt men.'};
const SH={x:0,z:0,rot:0,a:0,c:null,R:0,y:0,anchor:false,crew:[],cap:null,chest:false,won:false,again:0,cd:4,g:null,col:[]};WD.pirates=SH;
const LEN=24,WID=7.5,DECK=3.1;
/* the deck: a rotated rectangle, a floor while she lies at anchor */
function local(x,z){const dx=x-SH.x,dz=z-SH.z,c=Math.cos(-SH.rot),s=Math.sin(-SH.rot);return{u:dx*c+dz*s,v:-dx*s+dz*c}}
function onDeck(x,z){const p=local(x,z);return Math.abs(p.u)<WID/2-.3&&Math.abs(p.v)<LEN/2-1.2}
const _gP=groundH;groundH=function(x,z){if(SH.anchor&&Math.abs(x-SH.x)<16&&Math.abs(z-SH.z)<16&&onDeck(x,z))return SH.y+DECK;return _gP(x,z)};
/* where she sails: a circle of deep water */
function route(){const C=[[-760,1930],[600,1900],[-1400,1500],[1500,1500],[-300,2050],[1000,2150],[-1700,700]];for(const [cx,cz] of C)for(const R of[220,180,140]){let ok=true;for(let i=0;i<32&&ok;i++){const a=i/32*6.283;if(terrainH(cx+Math.cos(a)*R,cz+Math.sin(a)*R)>-4)ok=false}if(ok)return{c:{x:cx,z:cz},R}}return null}
function ship(){const g=new T.Group(),hull=new T.MeshStandardMaterial({color:0x3a2618,roughness:.9}),deck=MAT.wood,black=new T.MeshStandardMaterial({color:0x151515,side:T.DoubleSide,roughness:1}),gold=new T.MeshStandardMaterial({color:0xc8a040,metalness:.5,roughness:.4});
  const sh=new T.Shape();sh.moveTo(-WID/2,DECK);sh.lineTo(-WID/2+.6,-.6);sh.quadraticCurveTo(0,-2.2,WID/2-.6,-.6);sh.lineTo(WID/2,DECK);sh.lineTo(-WID/2,DECK);
  const hg=new T.ExtrudeGeometry(sh,{depth:LEN-4,bevelEnabled:false});hg.translate(0,0,-(LEN-4)/2);g.add(new T.Mesh(hg,hull));
  const bow=new T.Mesh(new T.ConeGeometry(WID/2,5,4,1),hull);bow.rotation.x=Math.PI/2;bow.rotation.y=Math.PI/4;bow.scale.set(1,1,.55);bow.position.set(0,1.6,LEN/2-.2);g.add(bow);
  g.add(mesh(new T.BoxGeometry(WID-.2,.2,LEN-3),deck,0,DECK,0));g.add(mesh(new T.BoxGeometry(WID,2.6,4.5),hull,0,DECK+1.3,-LEN/2+3));
  for(const s of[-1,1]){g.add(mesh(new T.BoxGeometry(.2,.9,LEN-4),hull,s*(WID/2-.1),DECK+.45,0));for(let i=0;i<5;i++){const c=mesh(new T.CylinderGeometry(.22,.26,1.4,8),black,s*(WID/2+.3),DECK-.6,-6+i*3);c.rotation.z=Math.PI/2;g.add(c)}}
  const cv=document.createElement('canvas');cv.width=cv.height=128;const q=cv.getContext('2d');q.fillStyle='#151515';q.fillRect(0,0,128,128);q.fillStyle='#e8e0d0';q.beginPath();q.arc(64,54,22,0,6.283);q.fill();q.fillRect(50,70,28,14);q.fillStyle='#151515';q.beginPath();q.arc(55,52,6,0,6.283);q.arc(73,52,6,0,6.283);q.fill();q.strokeStyle='#e8e0d0';q.lineWidth=7;q.beginPath();q.moveTo(30,92);q.lineTo(98,118);q.moveTo(98,92);q.lineTo(30,118);q.stroke();
  const sail=new T.MeshStandardMaterial({map:new T.CanvasTexture(cv),side:T.DoubleSide,roughness:1});const sails=[];
  for(const [z,h] of[[5,15],[-2,17],[-8,12]]){g.add(mesh(new T.CylinderGeometry(.18,.24,h,8),deck,0,DECK+h/2,z));for(const k of[.45,.75]){const s=mesh(new T.PlaneGeometry(5.6*(1.1-k*.3),h*.26),sail,0,DECK+h*k,z+.15,false);g.add(s);sails.push(s)}g.add(mesh(new T.BoxGeometry(6.4,.14,.14),deck,0,DECK+h*.6,z))}
  g.add(mesh(new T.CylinderGeometry(.8,.7,.6,10),deck,0,DECK+17.3,-2));const fl=mesh(new T.PlaneGeometry(1.6,1),black,.8,DECK+17.6+1,-2,false);g.add(fl);
  g.add(mesh(new T.CylinderGeometry(.5,.5,.2,10),gold,0,DECK+1.4,-LEN/2+5.4));scene.add(g);SH.sails=sails;SH.flag=fl;return g}
/* the crew walking on deck while she sails (just figures), and the real fighters when you board */
function figures(){SH.figs=[];for(let i=0;i<5;i++){const h=makeHuman({tunic:pick([0x7a1a1a,0x1a1a1a,0xe8e0d0]),pants:0x2a2018,hat:pick(['scarf','hood',null]),hatc:0x8a1a1a,scale:1});SH.g.add(h.g);h.g.position.set(rr(2),DECK,rr(8));SH.figs.push(h)}}
function board(){if(SH.anchor||SH.won)return;SH.anchor=true;SH.y=0;const p=deckPt(0,4);if(PL.mounted)try{dismount()}catch(e){}PL.x=p.x;PL.z=p.z;PL.y=DECK+.2;PL.vy=0;for(const f of SH.figs)f.g.visible=false;
  for(let i=0;i<24;i++){const a=i/24*6.283,q=deckPt(Math.cos(a)*(WID/2),Math.sin(a)*(LEN/2-.6));SH.col.push(addCircle(q.x,q.z,.7))}
  const lv=1+Math.max(0,PL.lvl-5)*.06;SH.crew=[];for(let i=0;i<7;i++){const q=deckPt(rr(2.5),-7+i*2.2);try{const a=spawnEnemy('bandit',q.x,q.z,{name:pick(['Piraat Bram Botsoep','Piraat Ooglap','Piraat Hakkebeen','Piraat Rumneus','Piraat Zoutvis','Piraat Kielhaal']),hp:Math.round(160*lv),hpMax:Math.round(160*lv),dmg:Math.round(16*lv),xp:90,respawn:1e12,provoked:true});SH.crew.push(a)}catch(e){}}
  const q=deckPt(0,-LEN/2+6);try{SH.cap=spawnEnemy('bandit',q.x,q.z,{name:'Kapitein Haaientand',hp:Math.round(1600*lv),hpMax:Math.round(1600*lv),dmg:Math.round(32*lv),xp:1800,boss:'haaientand',respawn:1e12,provoked:true});try{SH.cap.root.scale.setScalar(1.25)}catch(e){}}catch(e){}
  sfx('quest');card('🏴‍☠️ Enteren!','Je klimt aan een touw aan boord van De Zwarte Haai. "Grijp die landrot!" brult Kapitein Haaientand. Versla de piraten en hun kapitein!',null,8)}
function deckPt(u,v){const c=Math.cos(SH.rot),s=Math.sin(SH.rot);return{x:SH.x+u*c+v*s,z:SH.z-u*s+v*c}}
function leave(){SH.anchor=false;for(const c of SH.col)c.r=0;SH.col=[];for(const a of SH.crew.concat(SH.cap?[SH.cap]:[])){if(!a.dead){a.dead=true;a.gone=true}if(a.root)scene.remove(a.root);const i=actors.indexOf(a);if(i>=0)actors.splice(i,1)}SH.crew=[];SH.cap=null;for(const f of SH.figs)f.g.visible=!SH.won}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!SH.g)return;const t=PL.t,near=Math.hypot(PL.x-SH.x,PL.z-SH.z);
  if(!SH.anchor){if(SH.won){SH.again-=dt;if(SH.again<=0){SH.won=false;SH.chest=false;for(const f of SH.figs)f.g.visible=true;SH.flagM&&(SH.flag.material=SH.flagM)}}
    /* her place on the circle follows the clock, so she is in the same spot on every player's screen */SH.a=(Date.now()/1000*2.2/SH.R)%6.283;SH.x=SH.c.x+Math.cos(SH.a)*SH.R;SH.z=SH.c.z+Math.sin(SH.a)*SH.R;SH.rot=Math.atan2(-Math.sin(SH.a),Math.cos(SH.a));
    /* cannons at you when you are close and she is still a pirate ship */
    if(!SH.won&&near<75&&!PL.dead&&!PL.inCave){SH.cd-=dt;if(SH.cd<=0){SH.cd=4.5+Math.random()*2;const s=Math.sign(local(PL.x,PL.z).u)||1,p=deckPt(s*(WID/2+.6),rr(6)),tx=PL.x+rr(4),tz=PL.z+rr(4);
      const ball=new T.Mesh(new T.SphereGeometry(.28,8,6),new T.MeshStandardMaterial({color:0x1a1a1a}));scene.add(ball);let k=0;const a={x:p.x,y:SH.y+DECK-.4,z:p.z},d=Math.hypot(tx-a.x,tz-a.z);try{sfx('thunder')}catch(e){}
      if(window.PW&&PW.ps)for(let i=0;i<16;i++)pwEm(PW.ps,a.x,a.y,a.z,rr(2)+s*2,rr(1)+1,rr(2),1.2,.6,.2,[.7,.7,.7],[.3,.3,.3],1,0,1);
      const f=()=>{k+=1/60/(d/30);const tt=Math.min(1,k);ball.position.set(a.x+(tx-a.x)*tt,a.y+(PL.y+.5-a.y)*tt+Math.sin(tt*Math.PI)*d*.15,a.z+(tz-a.z)*tt);if(tt<1)requestAnimationFrame(f);else{scene.remove(ball);if(Math.hypot(PL.x-tx,PL.z-tz)<3.2)damagePlayer(22,null);if(window.PW&&PW.ps)for(let i=0;i<20;i++)pwEm(PW.ps,tx,.2,tz,rr(2),3+Math.random()*4,rr(2),1,.3,.1,[.85,.92,1],[.6,.75,.9],1,-9,1)}};f()}}}
  else{const left=SH.crew.every(a=>a.dead)&&(!SH.cap||SH.cap.dead);if(left&&!SH.won){SH.won=true;SH.again=1800;SH.flagM=SH.flag.material;SH.flag.material=new T.MeshStandardMaterial({color:0xf4f0e8,side:T.DoubleSide});sfx('level');giveXp(1500);
      card('🏴‍☠️ Het schip is van jou!','Kapitein Haaientand en zijn bende zijn verslagen. Achter het roer staat de kist van de kapitein...',null,9);chron('Versloeg Kapitein Haaientand en zijn piraten.')}
    if(near>40&&!PL.dead)leave()}
  SH.g.position.set(SH.x,SH.y+Math.sin(t*.8)*.12-.3,SH.z);SH.g.rotation.set(Math.sin(t*.6)*.025,SH.rot,Math.sin(t*.9)*.03);for(const s of SH.sails)s.scale.x=1+Math.sin(t*1.3)*.04;SH.flag.rotation.y=Math.sin(t*3)*.3;
  /* in a rowing boat you cannot press E for the ship, so she asks you */
  if(!SH.anchor&&!SH.won&&PL.mounted&&PL.mounted.boatM&&near<10&&!SH.asked){SH.asked=true;card('🏴‍☠️ Langszij De Zwarte Haai!','Je roeit vlak naast het piratenschip. Durf je aan boord te klimmen?',[['Enteren!',board],['Wegroeien',()=>{}]])}if(near>22)SH.asked=false;
  SH.it.x=SH.x;SH.it.z=SH.z;SH.ch.x=deckPt(0,-LEN/2+5.4).x;SH.ch.z=deckPt(0,-LEN/2+5.4).z});
function chest(){if(!SH.won||SH.chest)return;SH.chest=true;PL.gold+=2000;giveItem('piratenkompas',1,true);if(ITEMS.schatkaart)giveItem('schatkaart',2,true);if(ITEMS.gem)giveItem('gem',3,true);sfx('level');
  card('💰 De kist van de kapitein','2000 goud, drie edelstenen, het Kompas van Kapitein Haaientand en twee oude schatkaarten! Spring overboord als je weer naar huis wilt.',null,11)}
const _bfP=buildFantasy;buildFantasy=function(){_bfP();try{const r=route();if(!r)return;SH.c=r.c;SH.R=r.R;SH.a=Math.random()*6.283;SH.g=ship();figures();
  SH.it={x:0,z:0,r:12,txt:()=>!SH.anchor&&!SH.won&&!PL.inCave&&Math.hypot(PL.x-SH.x,PL.z-SH.z)<12?'🏴‍☠️ Enter het piratenschip!':'',fn:board};INTER.push(SH.it);
  SH.ch={x:0,z:0,r:2.4,txt:()=>SH.anchor&&SH.won&&!SH.chest?'Open de kist van de kapitein':'',fn:chest};INTER.push(SH.ch);
  RUMORS.push({t:'Vissers zien soms een schip met zwarte zeilen en een doodshoofd voor de kust. De Zwarte Haai van Kapitein Haaientand! Wie durft er aan boord?'})}catch(e){console.warn('piraten',e)}};
})();
