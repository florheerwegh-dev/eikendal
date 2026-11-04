/* ================= War: field battles, sieges and your castle =================
   - Veldslagen: while you are at war, a herald now and then brings news that the enemy army stands in the field.
     Two armies face each other under their banners; you command yours with the buttons at the bottom:
     Linie (hold the line), Aanvallen (charge), Boogschutters vuren (a volley), Terugtrekken. Win, and the enemy flees.
   - Belegeringen: at war with a walled capital, go to its south gate and start a siege (500 gold): two catapults throw
     boulders at the closed gate, a battering ram rams it, and archers on the walls shoot at you. When the gate breaks
     you storm the city. And an enemy can besiege your own walled capital: sabotage its catapult and beat its soldiers.
   - Je kasteel: at the throne of your own realm you build towers (your knights get more life), an armoury (they hit
     harder), stables (a warhorse), a treasury (gold every minute), banners (a happy people) and stronger walls. */
(function(){
const KG=WD.kingdom,GL=WD.great||{},rr=(a=1)=>(Math.random()*2-1)*a,card=(t,x,b,s)=>{try{KG.card(t,x,b,s)}catch(e){addLog(t+': '+x)}},chron=t=>{try{WD.chron.add(t)}catch(e){}};
const me=()=>(PL.look&&PL.look.name)||'de held';
/* flying things: arrows and boulders on an arc */
const FLY=[];
function lob(x,y,z,tx,ty,tz,dur,mesh,onLand){scene.add(mesh);FLY.push({m:mesh,a:new T.Vector3(x,y,z),b:new T.Vector3(tx,ty,tz),t:0,d:dur,h:Math.hypot(tx-x,tz-z)*.25,onLand})}
const arrowGeo=new T.CylinderGeometry(.025,.025,1,4).rotateX(Math.PI/2),arrowMat=new T.MeshBasicMaterial({color:0x3a2a1a}),stoneGeo=new T.DodecahedronGeometry(.7,0),stoneMat=new T.MeshStandardMaterial({color:0x7a7468,roughness:1});
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;for(let i=FLY.length-1;i>=0;i--){const f=FLY[i];f.t+=dt/f.d;const t=Math.min(1,f.t),p=f.a.clone().lerp(f.b,t);p.y+=Math.sin(t*Math.PI)*f.h;f.m.lookAt(p);f.m.position.copy(p);
  if(t>=1){scene.remove(f.m);FLY.splice(i,1);try{f.onLand&&f.onLand(p)}catch(e){}if(window.PW&&PW.ps&&f.m.geometry===stoneGeo)for(let k=0;k<14;k++)pwEm(PW.ps,p.x,p.y,p.z,rr(3),2+Math.random()*3,rr(3),.9,.4,.1,[.6,.55,.5],[.4,.38,.34],1,-6,1)}}});
const arrow=(a,b,dmgFn)=>lob(a.x,(a.y||0)+1.5,a.z,b.x,(b.y||0)+1.1,b.z,.55,new T.Mesh(arrowGeo,arrowMat),dmgFn);
/* ---------- soldiers of a battle (both armies) ---------- */
function soldier(side,x,z,o){const a=spawnNPC('guard',x,z,{name:o.name,ai:'stay',livery:o.col});a.bt={side,archer:!!o.archer,home:{x,z},cd:Math.random()*2};a.hp=a.hpMax=o.hp;a.dmg=o.dmg;a.speed=4;a.realm=null;a.guard=false;a.respawn=1e12;a.type='soldaat';a.loot='bandit';a.xp=45;
  try{setHeld(a.h,o.archer?'bow':'sword_knight')}catch(e){}return a}
function foeOf(a,list){let b=null,bd=1e9;for(const e of list){if(e.dead)continue;const d=Math.hypot(e.x-a.x,e.z-a.z);if(d<bd){bd=d;b=e}}return[b,bd]}
const BT={on:false,A:[],B:[],cmd:'line',R:null,C:null,ax:null,flags:[],bar:null,t:0,herald:420};
const _uNO=updateNPC;updateNPC=function(a,dt){const b=a&&a.bt;if(!b)return _uNO(a,dt);if(a.dead)return;if(a.sayT>0){a.sayT-=dt;if(a.sayT<=0)a.say=''}b.cd-=dt;
  const mine=b.side===0,list=mine?BT.B:BT.A.concat(PL.dead?[]:[{x:PL.x,z:PL.z,y:PL.y,isPL:true,dead:false}]);let [t,d]=foeOf(a,mine?BT.B:list);
  const hit=dmg=>{if(!t)return;if(t.isPL)damagePlayer(dmg,a);else hitActor(t,dmg,false,{x:(t.x-a.x)/(d||1),z:(t.z-a.z)/(d||1)})};
  let o={};
  if(mine&&BT.cmd==='retreat'){stepTo(a,dt,b.home.x-BT.ax.x*25,b.home.z-BT.ax.z*25,4.4,1)}
  else if(b.archer){if(t&&d<55){a.vel=0;a.rot+=angDiff(a.rot,Math.atan2(t.x-a.x,t.z-a.z))*Math.min(1,dt*6);const fire=mine&&BT.cmd==='volley'?.7:2.6;if(b.cd<=0){b.cd=fire+Math.random()*.6;const tt=t;arrow(a,tt,()=>{if(Math.random()<.65&&!tt.dead)tt.isPL?damagePlayer(a.dmg*.6,a):hitActor(tt,a.dmg*.6,false)})}}else stepTo(a,dt,b.home.x,b.home.z,3,1)}
  else if(mine&&BT.cmd==='line'&&(!t||d>9)){if(stepTo(a,dt,b.home.x,b.home.z,3.4,.8))a.rot+=angDiff(a.rot,Math.atan2(BT.ax.x,BT.ax.z))*Math.min(1,dt*4)}
  else if(!mine&&(!t||d>28)&&BT.t<6){a.vel=0}
  else if(t)meleeAI(a,dt,t.x,t.z,d,()=>hit(a.dmg*(.85+Math.random()*.3)));
  if(a.h)animHuman(a.h,dt,a.vel,o)};
/* a hit from you on an enemy soldier is war, not a crime */
const _hO=hitActor;hitActor=function(a,dmg,by,dir){if(!(a&&a.bt))return _hO(a,dmg,by,dir);if(by&&a.bt.side===0)return;const k=a.kind;if(a.bt.side===1)a.kind='enemy';try{_hO(a,dmg,by,dir)}finally{if(!a.dead)a.kind=k}};
function flag(x,z,col){const g=new T.Group(),y=groundH(x,z);g.position.set(x,y,z);g.add(mesh(new T.CylinderGeometry(.08,.1,7,6),MAT.wood,0,3.5,0));const c=mesh(new T.PlaneGeometry(2.2,1.4),new T.MeshStandardMaterial({color:col,side:T.DoubleSide}),1.15,6.1,0,false);g.add(c);scene.add(g);BT.flags.push({g,c})}
function openField(px,pz,dirx,dirz){for(let i=0;i<40;i++){const r=45+i*3,x=px+dirx*r+rr(i*2),z=pz+dirz*r+rr(i*2);let ok=Math.abs(x)<HALF-120&&Math.abs(z)<HALF-120&&x>-1900;
  for(let k=0;k<9&&ok;k++){const qx=x+rr(30),qz=z+rr(30),h=terrainH(qx,qz);if(h<1.6||h>45||inBuilding(qx,qz,2)||siteAt(qx,qz)||forestDensity(qx,qz)>.35||slopeAt(qx,qz)>.45)ok=false}if(ok)return{x,z}}return null}
function battle(R){if(BT.on)return;const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot),C=openField(PL.x,PL.z,fx,fz)||openField(PL.x,PL.z,-fx,-fz);if(!C){addLog('Er is hier geen open veld voor een veldslag.');return}
  BT.on=true;BT.R=R;BT.C=C;BT.t=0;BT.cmd='line';const ax={x:C.x-PL.x,z:C.z-PL.z},l=Math.hypot(ax.x,ax.z)||1;ax.x/=l;ax.z/=l;BT.ax=ax;const px=-ax.z,pz=ax.x,lv=1+Math.max(0,PL.lvl-5)*.05;
  const G=GL.realms&&GL.realms.find(g=>g.id===R.id),eh=Math.round((G?G.sHp:220)*lv),ed=Math.round((G?G.sDmg:22)*lv),ecol=R.col||(G&&G.col)||0x8a2a2a;
  const line=(side,dist,n,arch)=>{for(let i=0;i<n;i++){const off=(i-(n-1)/2)*2.4,x=C.x+ax.x*dist*(side?1:-1)+px*off,z=C.z+ax.z*dist*(side?1:-1)+pz*off;
    const a=side?soldier(1,x,z,{name:(G?G.sName:'Soldaat')+' van '+R.name,col:ecol,hp:eh,dmg:ed,archer:arch}):soldier(0,x,z,{name:(arch?'Boogschutter':'Soldaat')+' van '+me(),col:0x2f5a9a,hp:Math.round(260*lv),dmg:Math.round(26*lv),archer:arch});a.rot=Math.atan2(ax.x*(side?-1:1),ax.z*(side?-1:1));(side?BT.B:BT.A).push(a)}};
  line(0,14,10,false);line(0,22,5,true);line(1,16,12,false);line(1,24,5,true);
  flag(C.x-ax.x*28,C.z-ax.z*28,0x2f5a9a);flag(C.x+ax.x*30,C.z+ax.z*30,ecol);
  try{WD.homecoming.fanfare()}catch(e){}sfx('quest');bar(true);
  card('⚔ Veldslag tegen '+R.name+'!','Twee legers staan tegenover elkaar. Geef je leger bevelen met de knoppen onderaan: Linie, Aanvallen, Boogschutters vuren of Terugtrekken. Vecht zelf mee!',null,9)}
function bar(on){if(!BT.bar){const d=document.createElement('div');d.id='btbar';d.style.cssText='position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:none;gap:6px;z-index:8';
    [['line','🛡 Linie'],['charge','⚔ Aanvallen'],['volley','🏹 Boogschutters vuren'],['retreat','↩ Terugtrekken']].forEach(([k,l])=>{const b=document.createElement('button');b.className='btn';b.textContent=l;b.dataset.k=k;b.onclick=()=>order(k);d.appendChild(b)});document.body.appendChild(d);BT.bar=d}
  BT.bar.style.display=on?'flex':'none';if(on)order(BT.cmd)}
function order(k){BT.cmd=k;if(k==='volley')setTimeout(()=>{if(BT.cmd==='volley')order('charge')},6000);if(BT.bar)BT.bar.querySelectorAll('button').forEach(b=>b.classList.toggle('pri',b.dataset.k===k));
  const w={line:'Vorm een linie!',charge:'Ten aanval!',volley:'Boogschutters, vuur!',retreat:'Terugtrekken!'}[k];for(const a of BT.A)if(!a.dead&&Math.random()<.3)saySomething(a,w,2)}
function endBattle(won){bar(false);const R=BT.R;BT.on=false;if(won){const g=400+PL.lvl*20;PL.gold+=g;giveXp(1200);giveRep(5,'een gewonnen veldslag');try{KG.addRel(R.id,8)}catch(e){}chron('Won een veldslag tegen '+R.name+'.');
    card('🏆 Overwinning!','Het leger van '+R.name+' slaat op de vlucht! Je soldaten juichen. Je krijgt '+g+' goud.',null,9)}else{card('Verloren...','Je leger is verslagen of je bent gevallen. Het leger van '+R.name+' trekt zich terug om zijn wonden te likken.',null,8)}
  setTimeout(()=>{for(const a of BT.A.concat(BT.B)){a.dead=true;a.gone=true;a.respawn=1e12;if(a.root)scene.remove(a.root);const i=actors.indexOf(a);if(i>=0)actors.splice(i,1)}BT.A=[];BT.B=[];for(const f of BT.flags)scene.remove(f.g);BT.flags=[]},won?15000:4000)}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;for(const f of BT.flags)f.c.rotation.y=Math.sin(PL.t*2+f.g.position.x)*.25;if(!BT.on){
    /* the herald, now and then, while you are at war */
    if(!started||PL.dead||PL.inCave||CIN.on||ES.on||SG.on)return;BT.herald-=dt;if(BT.herald>0)return;BT.herald=480+Math.random()*300;const foes=(KG.realms||[]).filter(R=>R.throne&&!R.cave&&KG.atWar(R.id));if(!foes.length)return;const R=pick(foes);
    card('📯 Een heraut!','"Het leger van '+R.name+' staat in het veld, niet ver van hier! Trek je ten strijde?"',[['⚔ Ten strijde!',()=>battle(R)],['Nu niet',()=>{}]]);return}
  BT.t+=dt;if(PL.dead||Math.hypot(PL.x-BT.C.x,PL.z-BT.C.z)>140){endBattle(false);return}
  if(!BT.B.some(a=>!a.dead))endBattle(true);else if(!BT.A.some(a=>!a.dead)&&BT.t>5)endBattle(false);else if(BT.cmd==='retreat'&&BT.t>3){const R=BT.R;BT.cmd='line';endBattle(false)}});
/* ---------- sieges ---------- */
const SG={on:null,catas:[],ram:null,door:null,col:null,hp:1,archers:[],t:0};
function gateOf(R){const G=GL.realms&&GL.realms.find(g=>g.id===R.id);if(!G)return null;const S=SITE[G.site];return S?{x:S.x,z:S.z+G.hw,G,S}:null}
function catapult(x,z,ry){const g=new T.Group(),y=groundH(x,z);g.position.set(x,y,z);g.rotation.y=ry;const w=MAT.wood;g.add(mesh(new T.BoxGeometry(2.4,.4,3.6),w,0,.8,0));for(const s of[-1,1]){for(const q of[-1,1]){const wh=mesh(new T.CylinderGeometry(.55,.55,.25,12),w,s*1.3,.55,q*1.2);wh.rotation.z=Math.PI/2;g.add(wh)}g.add(mesh(new T.BoxGeometry(.25,2.2,.25),w,s*.9,2,0))}
  const arm=new T.Group();arm.position.set(0,2.6,0);arm.add(mesh(new T.BoxGeometry(.25,.25,4.2),w,0,0,-1.2));arm.add(mesh(new T.BoxGeometry(.7,.3,.7),w,0,.15,-3.2));g.add(arm);scene.add(g);return{g,arm,t:Math.random()*2,x,z,y}}
function ramModel(x,z,ry){const g=new T.Group();g.position.set(x,groundH(x,z),z);g.rotation.y=ry;g.add(mesh(new T.BoxGeometry(2.2,2.2,5),new T.MeshStandardMaterial({color:0x5a4030,roughness:1}),0,2.2,0));const log=mesh(new T.CylinderGeometry(.35,.4,6.4,10),MAT.wood,0,1.5,.6);log.rotation.x=Math.PI/2;g.add(log);
  for(const s of[-1,1])for(const q of[-1,1]){const wh=mesh(new T.CylinderGeometry(.5,.5,.25,12),MAT.wood,s*1.2,.5,q*1.6);wh.rotation.z=Math.PI/2;g.add(wh)}scene.add(g);return{g,log,x,z}}
function startSiege(R){const gt=gateOf(R);if(!gt||SG.on)return;if(PL.gold<500){addLog('Belegeringswerktuigen kosten 500 goud.','#e5766a');return}PL.gold-=500;closeModals();SG.on=R;SG.hp=1;SG.t=0;SG.gt=gt;
  SG.door=new T.Mesh(new T.BoxGeometry(8,9,.8),new T.MeshStandardMaterial({color:0x4a3220,roughness:.9}));SG.door.position.set(gt.x,groundH(gt.x,gt.z)+4.5,gt.z);scene.add(SG.door);SG.col=addBox(gt.x-4,gt.z-.6,gt.x+4,gt.z+.6);
  SG.catas=[catapult(gt.x-14,gt.z+46,Math.PI),catapult(gt.x+14,gt.z+46,Math.PI)];SG.ram=ramModel(gt.x,gt.z+34,Math.PI);
  const wh=(gt.G.wallH||10)+.4;SG.archers=[];for(let i=0;i<6;i++){const h=makeHuman({tunic:gt.G.col||0x8a2a2a,armor:1,hat:'helm',scale:1});try{setHeld(h,'bow')}catch(e){}const x=gt.x+(i-2.5)*7;h.g.position.set(x,groundH(x,gt.z-1)+wh,gt.z-1.2);scene.add(h.g);SG.archers.push({h,cd:Math.random()*3})}
  try{WD.homecoming.fanfare()}catch(e){}card('🏰 De belegering van '+R.name+'!','Je katapulten gooien rotsblokken naar de poort, je stormram rolt erheen. Pas op voor de boogschutters op de muren!',null,9);chron('Belegerde '+R.name+'.')}
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!SG.on)return;const gt=SG.gt;SG.t+=dt;
  if(Math.hypot(PL.x-gt.x,PL.z-gt.z)>220){endSiege(false);return}
  for(const c of SG.catas){c.t-=dt;c.arm.rotation.x+=((c.t>3.3?-1.4:0)-c.arm.rotation.x)*Math.min(1,dt*8);if(c.t<=0){c.t=4+Math.random();const s=new T.Mesh(stoneGeo,stoneMat);lob(c.x,c.y+4,c.z,gt.x+rr(3),groundH(gt.x,gt.z)+5,gt.z+.5,2.2,s,()=>{SG.hp-=.05;try{sfx('thunder')}catch(e){}})}}
  const r=SG.ram;if(r){const d=Math.hypot(r.x-gt.x,r.z-(gt.z+3.6));if(d>.5){const k=Math.min(1,1.2*dt/d);r.x+=(gt.x-r.x)*k;r.z+=((gt.z+3.6)-r.z)*k;r.g.position.set(r.x,groundH(r.x,r.z),r.z)}else{r.log.position.z=.6-Math.max(0,Math.sin(SG.t*2.4))*1.2;if(Math.sin(SG.t*2.4)>.97&&!r.hitT){r.hitT=1;SG.hp-=.035;try{sfx('hit')}catch(e){}}if(Math.sin(SG.t*2.4)<.5)r.hitT=0}}
  for(const a of SG.archers){a.cd-=dt;a.h.g.rotation.y=Math.atan2(PL.x-a.h.g.position.x,PL.z-a.h.g.position.z);if(a.cd<=0&&Math.hypot(PL.x-gt.x,PL.z-gt.z)<70&&!PL.dead){a.cd=2.5+Math.random()*2;const p=a.h.g.position;arrow({x:p.x,y:p.y-1,z:p.z},{x:PL.x,y:PL.y,z:PL.z},()=>{if(Math.random()<.35)damagePlayer(8+PL.lvl*.6,null)})}}
  if(SG.hp<=0){const R=SG.on;endSiege(true);card('💥 De poort is gebroken!','Met een donderende klap valt de poort van '+R.name+'. Je kunt de stad bestormen! De wachters stormen naar buiten.',null,9);giveXp(1500);chron('Brak de poort van '+R.name+'.');
    for(const g of(KG.knights(R.id)||[]))if(!g.dead&&Math.hypot(g.x-gt.x,g.z-gt.z)<120){g.angry=true;g.angryT=90}}});
function endSiege(won){const gt=SG.gt;if(SG.door){if(won){const d=SG.door;let t=0;const f=()=>{t+=.03;d.rotation.x=-Math.min(1.5,t*1.5);d.position.y-=.05;if(t<1)requestAnimationFrame(f);else scene.remove(d)};f()}else scene.remove(SG.door)}
  if(SG.col)SG.col.off=true;for(const c of SG.catas)scene.remove(c.g);if(SG.ram)scene.remove(SG.ram.g);for(const a of SG.archers)scene.remove(a.h.g);SG.catas=[];SG.ram=null;SG.archers=[];SG.door=null;SG.on=null}
/* the siege can be started at the south gate of a walled capital you are at war with */
function siegeInter(){for(const G of GL.realms||[]){const S=SITE[G.site];if(!S)continue;INTER.push({x:S.x,z:S.z+G.hw+16,r:9,txt:()=>{const R=KG.realm(G.id);return R&&KG.atWar(G.id)&&!SG.on?'🏰 Begin de belegering van '+G.name+' (500 goud)':''},fn:()=>startSiege(KG.realm(G.id))})}}
/* an enemy besieges your own walled capital now and then */
const ES={t:900,on:null,cata:null,foes:[],it:null};
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;if(!started||PL.dead||BT.on)return;
  if(ES.on){const c=ES.cata;if(c){c.t-=dt;c.arm.rotation.x+=((c.t>3.3?-1.4:0)-c.arm.rotation.x)*Math.min(1,dt*8);if(c.t<=0){c.t=5+Math.random()*2;const tx=ES.gt.x+rr(25),tz=ES.gt.z-15-Math.random()*40,ty=groundH(tx,tz);
      lob(c.x,c.y+4,c.z,tx,ty,tz,2.6,new T.Mesh(stoneGeo,stoneMat),p=>{if(Math.hypot(PL.x-p.x,PL.z-p.z)<4)damagePlayer(ES.weak?12:24,null);for(const k of(KG.knights(ES.on.id)||[]))if(!k.dead&&Math.hypot(k.x-p.x,k.z-p.z)<4)hitActor(k,ES.weak?20:40,false)})}}
    if(!c&&!ES.foes.some(a=>!a.dead)){const R=ES.on;ES.on=null;card('🛡 De belegering is afgeslagen!','Je hebt de katapult vernietigd en de aanvallers verslagen. '+R.name+' is gered!',null,9);PL.gold+=300;giveXp(1000);chron('Sloeg een belegering van '+R.name+' af.');setTimeout(()=>{for(const a of ES.foes){if(a.root)scene.remove(a.root);const i=actors.indexOf(a);if(i>=0)actors.splice(i,1)}ES.foes=[];BT.B=[]},12000)}return}
  ES.t-=dt;if(ES.t>0)return;ES.t=900+Math.random()*600;const own=(GL.realms||[]).map(G=>KG.realm(G.id)).filter(R=>R&&KG.isMine(R.id));const foes=(KG.realms||[]).filter(R=>R.throne&&!R.cave&&KG.atWar(R.id));if(!own.length||!foes.length)return;
  const R=pick(own),E=pick(foes),gt=gateOf(R);if(!gt)return;ES.on=R;ES.gt=gt;ES.weak=!!(KG.state(R.id).up&&KG.state(R.id).up.muren);const cx=gt.x,cz=gt.z+60;ES.cata=catapult(cx,cz,Math.PI);
  ES.it={x:cx,z:cz,r:4.5,txt:()=>ES.cata?'🔥 Saboteer de katapult':'',fn:()=>{if(!ES.cata)return;scene.remove(ES.cata.g);ES.cata=null;sfx('hit');addLog('Je saboteert de katapult! Hij valt in stukken.','#9cc552')}};INTER.push(ES.it);
  ES.foes=[];BT.B=ES.foes;BT.A=[];const G=GL.realms.find(g=>g.id===E.id);for(let i=0;i<(ES.weak?5:9);i++){const a=soldier(1,cx+rr(10),cz-6+rr(6),{name:(G?G.sName:'Soldaat')+' van '+E.name,col:E.col||0x8a2a2a,hp:G?G.sHp:220,dmg:G?G.sDmg:22,archer:i<2});ES.foes.push(a)}
  card('🏰 '+R.name+' wordt belegerd!','Het leger van '+E.name+' staat voor de poort van '+R.name+' met een katapult! Ga erheen, saboteer de katapult en versla de aanvallers.',null,12)});
/* ---------- your castle ---------- */
const UP=[{k:'torens',n:'Wachttorens',c:1500,d:'Je ridders in dit rijk krijgen 25% meer leven.'},{k:'wapen',n:'Wapenkamer',c:1200,d:'Je ridders slaan 30% harder.'},{k:'stal',n:'Stallen',c:800,d:'Een sterk strijdros staat altijd voor je klaar.'},
  {k:'schat',n:'Schatkamer',c:2500,d:'Elke minuut 25 goud zolang dit rijk van jou is.'},{k:'banier',n:'Banieren',c:300,d:'Vlaggen in jouw kleuren: het volk is trots.'},{k:'muren',n:'Versterkte muren',c:2200,d:'Belegeringen van dit rijk zijn veel zwakker.'}];
const VIS={};
function castleMenu(R){const st=KG.state(R.id);st.up=st.up||{};const left=UP.filter(u=>!st.up[u.k]);
  card('🏰 Het kasteel van '+R.name,(Object.keys(st.up).length?'Gebouwd: '+UP.filter(u=>st.up[u.k]).map(u=>u.n).join(', ')+'. ':'')+(left.length?'Wat wil je bouwen?':'Je kasteel is helemaal uitgebouwd!'),left.slice(0,4).map(u=>[u.n+' ('+u.c+' goud): '+u.d,()=>buy(R,u)]).concat([['Sluiten',()=>{}]]))}
function buy(R,u){if(PL.gold<u.c){addLog(u.n+' kost '+u.c+' goud.','#e5766a');return}PL.gold-=u.c;const st=KG.state(R.id);st.up=st.up||{};st.up[u.k]=1;sfx('level');if(u.k==='banier')st.joy=Math.min(100,(st.joy||50)+10);
  addLog(u.n+' gebouwd in '+R.name+'!','#9cc552');chron('Bouwde '+u.n.toLowerCase()+' in '+R.name+'.');visuals(R)}
function spot(cx,cz,r0,r1){for(let i=0;i<80;i++){const a=Math.random()*6.283,d=r0+Math.random()*(r1-r0),x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,p={x,z};if(!collide(p,3)&&!inBuilding(x,z,4)&&terrainH(x,z)>1)return{x,z}}return null}
function visuals(R){const st=KG.state(R.id),u=st.up||{},V=VIS[R.id]=VIS[R.id]||{};const t=R.throne;if(!t||R.cave)return;
  if(u.torens&&!V.torens){V.torens=1;for(let i=0;i<2;i++){const p=spot(t.x,t.z,25,55);if(!p)continue;const y=groundH(p.x,p.z),g=new T.Group();g.position.set(p.x,y,p.z);const st2=MAT.stone||new T.MeshStandardMaterial({color:0x8a8478});g.add(mesh(new T.CylinderGeometry(2.6,3,12,12),st2,0,6,0));
    for(let k=0;k<8;k++){const a=k/8*6.283;g.add(mesh(new T.BoxGeometry(.8,1,.8),st2,Math.cos(a)*2.5,12.5,Math.sin(a)*2.5))}g.add(mesh(new T.ConeGeometry(.0001,.0001,3),st2,0,0,0));scene.add(g);addCircle(p.x,p.z,3)}}
  if(u.banier&&!V.banier){V.banier=1;for(let i=0;i<4;i++){const p=spot(t.x,t.z,8,30);if(!p)continue;const g=new T.Group(),y=groundH(p.x,p.z);g.position.set(p.x,y,p.z);g.add(mesh(new T.CylinderGeometry(.07,.09,6,6),MAT.wood,0,3,0));g.add(mesh(new T.PlaneGeometry(1.4,2.2),new T.MeshStandardMaterial({color:0x2f5a9a,side:T.DoubleSide}),.75,4.6,0,false));scene.add(g);addCircle(p.x,p.z,.3)}}
  if(u.stal&&!V.stal){V.stal=1;const p=spot(t.x,t.z,20,50);if(p){const y=groundH(p.x,p.z),g=new T.Group();g.position.set(p.x,y,p.z);g.add(mesh(new T.BoxGeometry(8,3.2,4),MAT.wood,0,1.6,-1));const rf=mesh(new T.BoxGeometry(8.6,.3,5.2),new T.MeshStandardMaterial({color:0x7a3a2a}),0,3.5,-1);rf.rotation.x=-.15;g.add(rf);scene.add(g);addBox(p.x-4,p.z-3,p.x+4,p.z+1);V.stalP={x:p.x,z:p.z+4}}}}
setInterval(()=>{if(!started||!KG||!KG.ready)return;for(const R of KG.realms||[]){if(!R.throne||!KG.isMine(R.id))continue;const u=KG.state(R.id).up;if(!u)continue;visuals(R);
  for(const k of KG.knights(R.id)||[]){if(k.dead)continue;if(u.torens&&!k._tw){k._tw=1;k.hpMax=Math.round(k.hpMax*1.25);k.hp=Math.min(k.hpMax,k.hp*1.25)}if(u.wapen&&!k._wp){k._wp=1;k.dmg=Math.round((k.dmg||20)*1.3)}}
  const V=VIS[R.id];if(u.stal&&V&&V.stalP&&(!V.horse||V.horse.dead)){V.horse=spawnHorse(V.stalP.x,V.stalP.z,0x2a2020);V.horse.name='Strijdros';V.horse.mult=1.35}}},5000);
setInterval(()=>{if(!started||!KG||!KG.ready)return;let g=0;for(const R of KG.realms||[])if(R.throne&&KG.isMine(R.id)&&KG.state(R.id).up&&KG.state(R.id).up.schat)g+=25;if(g){PL.gold+=g}},60000);
let TH=[];setInterval(()=>{if(!KG||!KG.ready)return;for(const R of KG.realms||[]){if(!R.throne||TH.includes(R.id))continue;TH.push(R.id);const it={x:R.throne.x,z:R.throne.z,r:2.2,txt:()=>KG.isMine(R.id)?'🏰 Bekijk en bouw je kasteel uit':'',fn:()=>castleMenu(R)};if(R.cave)it.cave=true;INTER.push(it)}},3000);
const _bfO=buildFantasy;buildFantasy=function(){_bfO();try{siegeInter()}catch(e){console.warn('siege inter',e)}};
WD.war={battle,startSiege,castleMenu,BT,SG,ES};
})();
