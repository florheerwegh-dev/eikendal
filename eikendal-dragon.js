/* ================= The dragon's nest, the glowing egg and Vonk the baby dragon =================
   The nest of Vyrnax is a great bowl of woven logs on a bed of straw, with embers, shell shards and three eggs.
   One egg glows. You pick it up with both hands (the people's own pick-up and carry animations) and carry it;
   while you carry it you walk slower and cannot fight. A few minutes later it shakes, cracks and a baby dragon
   hatches: Vonk. Vonk follows you everywhere, and you can climb on its back and fly:
   WASD to fly, Space to climb, C to descend, Shift for speed, E to land and climb off. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,HATCH=180;
const EGG={state:'nest',m:null,t0:0,x:0,z:0,it:null,glow:null,mat:null,warn:0};WD.egg=EGG;
let PET=null;WD.pet=()=>PET;WD.spawnPet=(x,z)=>spawnPet(x,z,false);WD.mountPet=()=>mountPet();
function eggTex(base,line){return canvasTex(256,256,(c,w,h)=>{c.fillStyle=base;c.fillRect(0,0,w,h);for(let y=0;y<h;y+=18)for(let x=(y/18%2)*11;x<w;x+=22){c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.arc(x,y,10,0,Math.PI);c.fill();c.strokeStyle=line;c.lineWidth=1.5;c.beginPath();c.arc(x,y,10,0,Math.PI);c.stroke()}})}
function crackTex(){return canvasTex(256,256,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);c.strokeStyle='#ffb040';c.lineWidth=3;for(let i=0;i<7;i++){let x=Math.random()*w,y=Math.random()*h;c.beginPath();c.moveTo(x,y);for(let k=0;k<7;k++){x+=rr(26);y+=rr(26);c.lineTo(x,y)}c.stroke()}})}
const eggGeo=()=>{const g=new T.SphereGeometry(.55,20,16),p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setY(i,y*1.32);const k=1-Math.max(0,y)*.25;p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k)}g.computeVertexNormals();g.translate(0,.72,0);return g};

/* ---------- the nest ---------- */
function buildNest(){const D=SITE.dragon,cx=D.x,cz=D.z,y=groundH(cx,cz);
  /* a bowl of woven logs: one instanced mesh */
  const bk=MAT.bark.clone();bk.color=new T.Color(0x6a4c38);const N=140,im=new T.InstancedMesh(new T.CylinderGeometry(.2,.26,5.6,6),bk,N),M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),S=new T.Vector3(1,1,1);
  for(let i=0;i<N;i++){const a=i/N*6.283*3+rr(.08),ring=i%4,r=5.6+ring*.55+rr(.3),h=.3+ring*.45+rr(.2);E.set(Math.PI/2+rr(.25),-a,rr(.35),'YXZ');Q.setFromEuler(E);V.set(cx+Math.cos(a)*r,y+h,cz+Math.sin(a)*r);M.compose(V,Q,S);im.setMatrixAt(i,M)}
  im.castShadow=true;im.receiveShadow=true;scene.add(im);addCircle(cx,cz,0);
  const straw=canvasTex(256,256,(c,w,h)=>{c.fillStyle='#7a6434';c.fillRect(0,0,w,h);for(let i=0;i<900;i++){const x=Math.random()*w,y=Math.random()*h,a=Math.random()*3.14;c.strokeStyle=Math.random()<.5?'rgba(190,160,90,.6)':'rgba(70,52,24,.5)';c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*14,y+Math.sin(a)*14);c.stroke()}},3,3);
  const bed=new T.Mesh(new T.CircleGeometry(5.6,32),new T.MeshStandardMaterial({map:straw,roughness:1}));bed.rotation.x=-Math.PI/2;bed.position.set(cx,y+.32,cz);bed.receiveShadow=true;scene.add(bed);
  const shell=new T.MeshStandardMaterial({color:0xe8dcc4,roughness:.6,side:T.DoubleSide});for(let i=0;i<9;i++){const a=Math.random()*6.283,r=1+Math.random()*3.5,s=mesh(new T.SphereGeometry(.4,8,6,0,2,0,1.2),shell,cx+Math.cos(a)*r,y+.42,cz+Math.sin(a)*r,false);s.rotation.set(Math.random()*3,Math.random()*6,0);scene.add(s)}
  /* two cold stone eggs and the glowing one */
  const cold=new T.MeshStandardMaterial({map:eggTex('#5a4038','rgba(20,10,8,.6)'),roughness:.8});for(const [dx,dz,ry] of[[-1.4,.8,.4],[1.3,1.1,-.3]]){const e=new T.Mesh(eggGeo(),cold);e.position.set(cx+dx,y+.25,cz+dz);e.rotation.set(rr(.15),ry,rr(.15));e.castShadow=true;scene.add(e)}
  EGG.mat=new T.MeshStandardMaterial({map:eggTex('#d06a2a','rgba(255,200,90,.7)'),emissive:0xff6a1a,emissiveMap:crackTex(),emissiveIntensity:.9,roughness:.35,metalness:.15});
  const g=new T.Group(),e=new T.Mesh(eggGeo(),EGG.mat);e.castShadow=true;g.add(e);
  const gl=new T.Sprite(new T.SpriteMaterial({map:WD.tx('glare.png'),color:0xff9a3a,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false}));gl.scale.set(3.2,3.2,1);gl.position.y=.75;g.add(gl);EGG.glow=gl;
  g.userData.dyn=true;g.position.set(cx,y+.25,cz-.6);scene.add(g);EGG.m=g;EGG.x=cx;EGG.z=cz-.6;EGG.home={x:cx,z:cz-.6,y:y+.25};
  EGG.it={x:EGG.x,z:EGG.z,r:2.8,txt:()=>EGG.state==='hatched'?'':'Neem het gloeiende drakenei',fn:()=>pickUp()};INTER.push(EGG.it);
  HIDDEN.push({id:'dragonegg',name:'Het gloeiende drakenei',x:cx,z:cz,found:false})}
ANIMS.push(dt=>{const D=SITE.dragon;if(Math.abs(PL.x-D.x)>160||Math.abs(PL.z-D.z)>160)return;if(window.PW&&PW.ps&&Math.random()<dt*5)pwEm(PW.ps,D.x+rr(5),groundH(D.x,D.z)+.5,D.z+rr(5),rr(.3),1.2+Math.random(),rr(.3),1.6,.12,.03,[1,.6,.2],[.8,.2,0],1,-.3,.4)});

/* ---------- carrying ---------- */
const carrying=()=>EGG.state==='carried';
function pickUp(){if(EGG.state==='hatched'||carrying())return;if(PL.mounted){addLog('Stijg eerst af.');return}
  const first=EGG.state==='nest';EGG.state='carried';if(first){EGG.t0=PL.t;EGG.warn=0;addLog('Je tilt het gloeiende ei op. Het is warm... en het beweegt!','#ffb060');
    const v=actors.find(a=>a.type==='dragon'&&!a.dead&&Math.hypot(a.x-PL.x,a.z-PL.z)<90);if(v){v.provoked=true;addLog(v.name+' ziet je met haar ei!','#ff7a5a')}}
  try{skOnce(pm,'PickUp_Table',.9)}catch(e){}sfx('pickup')}
function putDown(){if(!carrying())return;const x=PL.x+Math.sin(PL.rot)*1.3,z=PL.z+Math.cos(PL.rot)*1.3;EGG.state='ground';EGG.x=x;EGG.z=z;scene.add(EGG.m);EGG.m.position.set(x,groundH(x,z),z);EGG.m.rotation.set(0,0,0);EGG.m.scale.setScalar(1);
  EGG.it.x=x;EGG.it.z=z;try{if(pm.upName==='Walk_Carry_Loop'){pm.upOnce=false;skUpperStop(pm,.25)}}catch(e){}addLog('Je zet het ei voorzichtig neer.','#ffb060')}
/* while you carry the egg: slower, no fighting, E puts it down */
const _gsD=gearSpd;gearSpd=function(){return _gsD()*(carrying()?.72:1)};
const _paD=playerAtk;playerAtk=function(...a){if(carrying()){addLog('Je hebt je handen vol met het ei. Zet het eerst neer (E).');return}return _paD(...a)};
const _fiD=findInteract;findInteract=function(){if(carrying())return{txt:'Zet het ei neer',fn:putDown};const P=PL.mounted;if(P&&P.flyM){const lo=F.alt-trueGround(PL.x,PL.z)<1.6;return{txt:lo?'Stijg af van '+P.name:'Land eerst (Shift om te dalen)',fn:()=>{if(lo)landOff();else addLog('Daal eerst (Shift) tot je bijna de grond raakt.')}}}return _fiD()};
ANIMS.push(dt=>{if(!carrying()||typeof pm==='undefined'||!pm)return;const e=EGG.m;if(e.parent!==pm.g){pm.g.add(e)}e.position.set(0,.62,.46);e.scale.setScalar(.66);
  if(pm.sk&&!pm.onceName){if(pm.upName!=='Walk_Carry_Loop')skUpper(pm,'Walk_Carry_Loop',false,1,.2);pm.upOnce=true;pm.upT=1e9}});

/* ---------- hatching ---------- */
ANIMS.push(dt=>{if(EGG.state!=='carried'&&EGG.state!=='ground')return;const el=PL.t-EGG.t0,left=HATCH-el,t=PL.t;
  EGG.mat.emissiveIntensity=.9+Math.max(0,1-left/60)*2.6+Math.sin(t*4)*.15;if(EGG.glow)EGG.glow.material.opacity=.5+Math.max(0,1-left/60)*.5;
  if(left<30){const k=(30-left)/30,j=.06+k*.22;EGG.m.children[0].rotation.set(Math.sin(t*31)*j,0,Math.cos(t*27)*j)}
  if(left<60&&EGG.warn<1){EGG.warn=1;addLog('Het ei wordt heet en begint te bewegen...','#ffb060')}
  if(left<15&&EGG.warn<2){EGG.warn=2;addLog('Er verschijnen gloeiende barsten in het ei!','#ff9a3a');sfx('hit')}
  if(left<=0)hatch()});
function hatch(){if(carrying())putDown();EGG.state='hatched';const x=EGG.x,z=EGG.z,y=groundH(x,z);EGG.m.visible=false;
  const shell=new T.MeshStandardMaterial({map:eggTex('#d06a2a','rgba(255,200,90,.7)'),roughness:.4,side:T.DoubleSide}),bits=[];
  for(let i=0;i<9;i++){const b=mesh(new T.SphereGeometry(.4,8,6,0,1.6,0,1.3),shell,x,y+.8,z,false);b.userData.dyn=true;scene.add(b);bits.push({b,v:new T.Vector3(rr(3),3+Math.random()*3,rr(3)),r:new T.Vector3(rr(6),rr(6),rr(6))})}
  if(window.PW&&PW.ps){pwBurst(PW.ps,x,y+.9,z,90,6,1.2,.5,.06,[1,.85,.4],[1,.4,.1],3,2,1,1);pwBurst(PW.ps,x,y+.9,z,40,2,2,1.2,.2,[1,.95,.8],[1,.7,.4],1.5,0,.8,1)}
  sfx('level');try{WD.roar&&WD.roar(.35)}catch(e){}
  PL.fx.babyDragon={name:'Vonk'};spawnPet(x,z,true);
  let bt=0;const step=dt=>{bt+=dt;for(const o of bits){if(bt>3){o.b.visible=false;continue}o.v.y-=12*dt;o.b.position.addScaledVector(o.v,dt);if(o.b.position.y<y+.1){o.b.position.y=y+.1;o.v.set(0,0,0)}o.b.rotation.x+=o.r.x*dt;o.b.rotation.y+=o.r.y*dt}};
  ANIMS.push(step);
  addLog('Het ei breekt open... een babydraak! Je noemt haar Vonk.','#ffd27a');
  if(window.cinematic&&!CIN.on){const V=(a,b,c)=>new T.Vector3(a,b,c);cinematic([{d:4.5,from:V(x+5,y+2.6,z+5),to:V(x-4,y+1.8,z+4),lf:V(x,y+1,z),lt:V(x,y+1.5,z)}],'Een babydraak!','Haar naam is Vonk',()=>{});
    if(window.CIN)CIN.tick=(CIN.tick||[]).concat([dt=>{step(dt);petStep(dt)}])}}

/* ---------- Vonk ---------- */
function spawnPet(x,z,newborn){if(PET)return PET;const m=makeDragon();const s=.3;m.g.scale.setScalar(newborn?.04:s);m.g.userData.dyn=true;scene.add(m.g);
  PET={x,z,y:groundH(x,z)+1,rot:0,root:m.g,model:m,name:'Vonk',flyM:true,mult:2.3,rider:false,vel:0,s,grow:newborn?0:1,fireT:6};
  PET.it={x,z,r:3.4,txt:()=>PET.rider?'':PET.sleep>0?'Maak '+PET.name+' wakker':'Stijg op '+PET.name+' ('+(WD.petStage?WD.petStage():'babydraak')+')',fn:()=>PET.sleep>0?wakePet(true):mountPet()};INTER.push(PET.it);return PET}
function petStep(dt){const P=PET;if(!P||P.rider)return;const t=PL.t;
  if(P.grow<1){P.grow=Math.min(1,P.grow+dt/3);const k=.04+(P.s-.04)*(1-Math.pow(1-P.grow,3));P.root.scale.setScalar(k)}
  /* now and then she gets tired and sleeps for a while, on the ground, wherever she is */
  P.awake=(P.awake??(200+Math.random()*120))-dt;
  if(P.sleep>0){P.sleep-=dt;if(P.sleep<=0||Math.hypot(PL.x-P.x,PL.z-P.z)>70){wakePet(false)}else{const g=trueGround(P.x,P.z);P.y+=(g+.02-P.y)*Math.min(1,dt*2);P.root.position.set(P.x,P.y,P.z);P.root.rotation.set(0,P.rot,0);
    animHorse(P.model,dt,0);P.zT=(P.zT||0)-dt;if(P.zT<=0){P.zT=1.3;try{floatText(P.x+rr(.3),P.y+1.4,P.z+rr(.3),'z','#cfe8ff')}catch(e){}}P.it.x=P.x;P.it.z=P.z;return}}
  /* she helps you fight: the nearest enemy that comes for you gets a breath of fire */
  let foe=null;if(P.grow>=1){let bd=16;for(const a of actors){if(a.dead||a.kind!=='enemy'||!a.root||!a.root.visible||!!a.cave!==!!PL.inCave)continue;const dd=Math.hypot(a.x-PL.x,a.z-PL.z);if(dd<bd&&(a.state==='chase'||a.provoked)){bd=dd;foe=a}}}
  if(!foe&&P.awake<=0&&P.grow>=1){P.sleep=35+Math.random()*25;addLog('Vonk is moe en valt in slaap. Laat haar even rusten.','#ffd27a')}
  P.atkCd=(P.atkCd||0)-dt;let off=P.grow<1?0:Math.max(1,P.s/.3),tx=PL.x-Math.sin(PL.rot)*3*off+Math.cos(PL.rot)*2.2*off,tz=PL.z-Math.cos(PL.rot)*3*off-Math.sin(PL.rot)*2.2*off;
  if(foe){const fd=Math.hypot(foe.x-P.x,foe.z-P.z)||1,r=(foe.rad||1)+3.2;tx=foe.x+(P.x-foe.x)/fd*r;tz=foe.z+(P.z-foe.z)/fd*r;
    if(P.atkCd<=0&&fd<r+2.5){P.atkCd=2.6;P.rot=Math.atan2(foe.x-P.x,foe.z-P.z);const dmg=Math.round((12+(PL.lvl||1)*1.6)*(WD.petPow?WD.petPow():1));try{hitActor(foe,dmg,true,{x:(foe.x-P.x)/fd,z:(foe.z-P.z)/fd})}catch(e){}
      if(window.PW&&PW.ps){const fx=P.x+Math.sin(P.rot)*1.1,fz=P.z+Math.cos(P.rot)*1.1;for(let i=0;i<26;i++)pwEm(PW.ps,fx,P.y+.9,fz,Math.sin(P.rot)*7+rr(1),rr(.6)-.4,Math.cos(P.rot)*7+rr(1),.55,.35,.07,[1,.85,.3],[1,.3,.05],1,-.5,1.5)}try{sfx('swing')}catch(e){}}}
  const dx=tx-P.x,dz=tz-P.z,d=Math.hypot(dx,dz);if(d>80){P.x=tx;P.z=tz}else if(P.grow>=1){const sp=Math.min(d*1.6,16);if(d>.3){P.x+=dx/d*sp*dt;P.z+=dz/d*sp*dt;P.rot+=angDiff(P.rot,Math.atan2(dx,dz))*Math.min(1,dt*4)}else P.rot+=angDiff(P.rot,PL.rot)*Math.min(1,dt*2)}
  const g=trueGround(P.x,P.z),hy=g+(P.grow<1?.1:1.6+Math.sin(t*1.6)*.35);P.y+=(hy-P.y)*Math.min(1,dt*3);
  P.root.position.set(P.x,P.y,P.z);P.root.rotation.set(0,P.rot,Math.sin(t*1.1)*.06);P.vel=d>.3?Math.min(d*1.6,16):0;
  animHorse(P.model,dt,P.vel);P.it.x=P.x;P.it.z=P.z;
  P.fireT-=dt;if(P.fireT<=0&&P.grow>=1){P.fireT=7+Math.random()*9;if(window.PW&&PW.ps){const fx=P.x+Math.sin(P.rot)*1.1,fz=P.z+Math.cos(P.rot)*1.1;for(let i=0;i<18;i++)pwEm(PW.ps,fx,P.y+.9,fz,Math.sin(P.rot)*4+rr(.6),rr(.5)+.3,Math.cos(P.rot)*4+rr(.6),.6,.25,.05,[1,.8,.3],[1,.3,.05],1,-.5,1.5)}}}
ANIMS.push(dt=>petStep(dt));
function wakePet(byYou){const P=PET;if(!P)return;P.sleep=0;P.awake=240+Math.random()*150;addLog(byYou?'Je kriebelt Vonk achter haar oor. Ze snuift een rookwolkje en is klaarwakker.':'Vonk geeuwt, rekt zich uit en is weer wakker.','#ffd27a')}

/* ---------- flying ---------- */
const F={alt:0,vy:0,acc:.12};
/* the seat: on her back between the wings, fixed to a bone of the spine so you move along when she flies */
const SEATV=new T.Vector3();
function seatPos(h){const m=h.model;if(m.seatB===undefined){m.seatB=null;m.g.traverse(o=>{if(o.isBone&&o.name==='Bone002')m.seatB=o})}h.root.updateMatrixWorld(true);
  if(m.seatB){m.seatB.getWorldPosition(SEATV);SEATV.y+=.62*h.root.scale.y;return SEATV}return SEATV.set(h.root.position.x,h.root.position.y+3.3*h.root.scale.y,h.root.position.z)}
const trueGround=(x,z)=>groundH(x,z);
function mountPet(){const P=PET;if(!P||P.grow<1||carrying())return;if(P.sleep>0){addLog('Vonk slaapt. Maak haar eerst wakker.');return}if((PL.inCave&&PL.x>-9000)||(WD.spider&&WD.spider.inside&&WD.spider.inside())){addLog('Hier is te weinig ruimte om te vliegen.');return}
  if(PL.mounted)dismount();PL.mounted=P;P.rider=true;F.alt=Math.max(P.y-.6,trueGround(P.x,P.z));F.vy=0;PL.x=P.x;PL.z=P.z;PL.rot=P.rot;
  F.acc=.12;addLog('Je klimt op Vonk. WASD = vliegen (ze trekt rustig op en gaat steeds sneller), Spatie = stijgen, Shift = dalen, F = landen en afstijgen.','#ffd27a');sfx('level')}
function landOff(){const P=PL.mounted;if(!P||!P.flyM)return;PL.mounted=null;P.rider=false;PL.y=trueGround(PL.x,PL.z);PL.vy=0;P.x=PL.x+Math.cos(PL.rot)*2;P.z=PL.z-Math.sin(PL.rot)*2;addLog('Je springt van Vonk af.')}
const _dmD=dismount;dismount=function(){const h=PL.mounted;if(h&&h.flyM){landOff();return}return _dmD()};
const _ahD2=animHorse;animHorse=function(h,dt,sp){return _ahD2(h,dt,sp)};
let lastRot=0;
const _upD=updatePlayer;updatePlayer=function(dt){const h=PL.mounted;if(!h||!h.flyM)return _upD(dt);
  const G=groundH,C=collide,g0=G(PL.x,PL.z);let up=0;const free=!anyModal();if(free){if(KEYS.Space)up+=1;if(KEYS.ShiftLeft||KEYS.ShiftRight)up-=1}
  F.vy+=(up*12-F.vy)*Math.min(1,dt*1.3);F.alt=Math.min(320,Math.max(g0,F.alt+F.vy*dt));
  /* she starts slowly and speeds up the longer you keep flying (up to well beyond a gallop); stopping slows her down */
  const moving=free&&(KEYS.KeyW||KEYS.KeyA||KEYS.KeyS||KEYS.KeyD);
  F.acc+=moving?((WD.petTop?WD.petTop():1.6)-F.acc)*Math.min(1,dt*.32):(.12-F.acc)*Math.min(1,dt*2.5);
  const high=F.alt-g0>3.5,jump=KEYS.Space,sl=KEYS.ShiftLeft,sr=KEYS.ShiftRight,x0=PL.x,z0=PL.z;KEYS.Space=false;KEYS.ShiftLeft=KEYS.ShiftRight=false;groundH=(x,z)=>Math.max(G(x,z),F.alt);if(high)collide=()=>{};
  let err=null;try{_upD(dt)}catch(e){err=e}groundH=G;collide=C;KEYS.Space=jump;KEYS.ShiftLeft=sl;KEYS.ShiftRight=sr;if(err)throw err;if(PL.mounted!==h)return;
  {const k=high?F.acc:Math.min(1,F.acc);PL.x=x0+(PL.x-x0)*k;PL.z=z0+(PL.z-z0)*k;PL.speed*=k}
  F.alt=Math.max(F.alt,G(PL.x,PL.z));PL.y=F.alt;PL.vy=0;PL.onGround=true;PL.swim=false;h.x=PL.x;h.z=PL.z;h.y=PL.y;h.it.x=PL.x;h.it.z=PL.z;
  const turn=angDiff(lastRot,h.rot)/Math.max(dt,1e-3);lastRot=h.rot;const lift=F.alt-G(PL.x,PL.z)>.8?1:0;
  h.root.position.set(PL.x,PL.y+.15+lift*.25,PL.z);h.root.rotation.set(-F.vy*.035-Math.min(.25,PL.speed*.008)*lift,h.rot,Math.max(-.5,Math.min(.5,-turn*.12))*lift);
  {const sp=seatPos(h);pm.g.position.set(sp.x,sp.y-(pm.sk?.5:1.1)+(pm.sk?0:.2),sp.z);if(pm.sk)pm.rig.position.y=0}pm.g.rotation.set(h.root.rotation.x*.6,h.rot,h.root.rotation.z*.6);
  if(lift&&window.PW&&PW.ps&&Math.random()<dt*6)pwEm(PW.ps,PL.x+rr(.6),PL.y+.6,PL.z+rr(.6),rr(.4),-.4,rr(.4),.6,.12,.02,[1,.7,.3],[1,.3,0],.6,0,1)};

/* ---------- Vyrnax: a real boss ----------
   Bigger and stronger, glowing eyes, smoke and embers. Fire breath that sweeps the ground, a tail swipe when you
   stand behind it, a dive from the sky that explodes where it lands. Below half its life it is enraged and the
   ground burns where it breathes; below a fifth it calls a rain of fire from the sky. */
Object.assign(MON.dragon,{n:'Vyrnax de Asvorst',hp:2600,dmg:38,speed:5.4,aggro:52,range:6.5,xp:2600,rad:3.2,hh:8});
ITEMS.dragon_heart={n:'Drakenhart van Vyrnax',g:'mat',price:1800,ico:'❤',rar:'l'};
const FIRES=[],METEORS=[],frostM=new T.MeshBasicMaterial({color:0x7ac8ff,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false}),warnI=new T.MeshBasicMaterial({color:0x4aa8ff,transparent:true,opacity:.45,depthWrite:false,side:T.DoubleSide}),FC=[[1,.85,.3],[1,.25,0]],IC=[[.85,.97,1],[.35,.65,1]],fireM=new T.MeshBasicMaterial({color:0xff6a1a,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false}),warnM=new T.MeshBasicMaterial({color:0xff2a10,transparent:true,opacity:.45,depthWrite:false,side:T.DoubleSide});
const _smV=spawnMonster;spawnMonster=function(type,x,z,o={}){const a=_smV(type,x,z,o);if(type==='dragon'&&a&&a.model){a.model.g.scale.setScalar(1.35);
  a.model.g.traverse(m=>{if(m.isMesh&&m.name==='Eye'){const gl=new T.Sprite(new T.SpriteMaterial({map:WD.tx('glare.png'),color:a.ice?0x8ad8ff:0xffa020,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false}));gl.scale.set(60,60,1);m.add(gl);(a.eyes=a.eyes||[]).push(gl)}})}return a};
function burn(x,z,life=8,ice){const y=groundH(x,z),m=new T.Mesh(new T.CircleGeometry(2.2,16),ice?frostM:fireM);m.rotation.x=-Math.PI/2;m.position.set(x,y+.08,z);m.userData.dyn=true;scene.add(m);FIRES.push({m,x,z,t:life,tick:0,ice})}
function head(a){const f=1.35,fx=Math.sin(a.rot),fz=Math.cos(a.rot);return{x:a.x+fx*5.2*f,y:a.y+3.4*f,z:a.z+fz*5.2*f,fx,fz}}
function bossTick(a,dt){const d=Math.hypot(PL.x-a.x,PL.z-a.z),t=PL.t,rage=a.hp<a.hpMax*.5;
  if(window.PW&&PW.ps&&Math.random()<dt*(rage?14:6)){const h=head(a);pwEm(PW.ps,h.x+rr(.4),h.y,h.z+rr(.4),rr(.3),1+Math.random(),rr(.3),1.4,.35,.6,[.3,.28,.26],[.1,.1,.1],.5,-.2,.5);pwEm(PW.ps,a.x+rr(3),a.y+1+Math.random()*3,a.z+rr(3),rr(.4),1.5,rr(.4),1.2,.12,.02,[1,.6,.2],[1,.2,0],1,-.3,.4)}
  if(a.eyes)for(const e of a.eyes)e.material.opacity=(rage?1:.7)+Math.sin(t*6)*.15;
  if(a.state!=='chase'||PL.dead)return;
  if(!a.met){a.met=1;try{WD.roar(1.3)}catch(e){}if(window.PW)PW.shake=Math.max(PW.shake||0,.7);addLog(a.name+' brult. De grond trilt!','#ff7a5a');
    const sk='seen_'+(a.boss||'vyrnax');if(!PL.fx[sk]&&window.cinematic&&!CIN.on){PL.fx[sk]=1;const h=head(a),V=(x,y,z)=>new T.Vector3(x,y,z);cinematic([{d:3.2,from:V(h.x+h.fx*9+h.fz*4,h.y-1,h.z+h.fz*9-h.fx*4),to:V(h.x+h.fx*6-h.fz*3,h.y+.5,h.z+h.fz*6+h.fx*3),lf:V(h.x,h.y,h.z),lt:V(h.x,h.y+1,h.z)}],a.name,a.sub||'Heer van het Drakennest',()=>{})}}
  if(!a.rage&&rage){a.rage=1;a.speed*=1.25;a.dmg*=1.15;try{WD.roar(1.5)}catch(e){}addLog(a.name+(a.ice?' wordt razend. Zijn adem bevriest de grond!':' wordt razend. Zijn adem zet de grond in brand!'),a.ice?'#9ad8ff':'#ff5a3a')}
  if(!a.rain&&a.hp<a.hpMax*.2){a.rain=1;addLog(a.ice?'De lucht wordt wit: '+a.name+' laat ijs regenen!':'De lucht kleurt rood: '+a.name+' laat vuur regenen!',a.ice?'#9ad8ff':'#ff3a1a')}
  /* fire breath */
  a.brCd=(a.brCd??5)-dt;if(a.brT>0){a.brT-=dt;a.rot+=angDiff(a.rot,Math.atan2(PL.x-a.x,PL.z-a.z))*Math.min(1,dt*1.6);a.vel=0;const h=head(a);
    if(window.PW&&PW.ps)for(let i=0;i<9;i++){const sp=16+Math.random()*8;pwEm(PW.ps,h.x,h.y,h.z,h.fx*sp+rr(3),-3+rr(2),h.fz*sp+rr(3),.9,.7,1.6,...(a.ice?IC:FC),1,-2,.2)}
    const dx=PL.x-h.x,dz=PL.z-h.z,dd=Math.hypot(dx,dz),ang=Math.acos(Math.max(-1,Math.min(1,(dx*h.fx+dz*h.fz)/(dd||1))));a.brTick=(a.brTick||0)-dt;
    if(dd<17&&ang<.45&&a.brTick<=0){a.brTick=.3;damagePlayer(9,a);if(a.ice)PL.frostT=Math.max(PL.frostT||0,1.2);floatText(PL.x,PL.y+2,PL.z,a.ice?'IJs!':'Vuur!',a.ice?'#9ad8ff':'#ff8a2a')}
    if(rage&&Math.random()<dt*3){const r=6+Math.random()*10;burn(h.x+h.fx*r+rr(2),h.z+h.fz*r+rr(2),8,a.ice)}return}
  if(a.brCd<=0&&d<18&&!a.dive){a.brCd=rage?5:8;a.brT=2.4;try{sfx('thunder')}catch(e){}addLog(a.name+' haalt diep adem...','#ffb070')}
  /* tail swipe when you stand behind it */
  a.tlCd=(a.tlCd??2)-dt;{const ba=Math.abs(angDiff(a.rot,Math.atan2(PL.x-a.x,PL.z-a.z)));if(a.tlCd<=0&&d<9&&ba>2.2){a.tlCd=3;damagePlayer(26,a);const k=3/(d||1);PL.x+=(PL.x-a.x)*k;PL.z+=(PL.z-a.z)*k;if(window.PW)PW.shake=Math.max(PW.shake||0,.4);addLog('Een staartzwiep slaat je weg!','#ff7a5a')}}
  /* dive from the sky */
  a.dvCd=(a.dvCd??14)-dt;if(!a.dive&&a.dvCd<=0&&d>9&&d<45){a.dvCd=rage?12:17;a.dive={t:0,x0:a.x,z0:a.z};addLog(a.name+' stijgt op...','#ffb070')}
  if(a.dive){const D=a.dive;D.t+=dt;const g=groundH(a.x,a.z);
    if(D.t<1.6){a.aq=g+D.t/1.6*24;a.vel=0}else if(D.t<2.4){a.aq=g+24;a.x+=(PL.x-a.x)*Math.min(1,dt*2);a.z+=(PL.z-a.z)*Math.min(1,dt*2);D.tx=PL.x;D.tz=PL.z;if(!D.w){D.w=new T.Mesh(new T.RingGeometry(5,7,32),a.ice?warnI:warnM);D.w.rotation.x=-Math.PI/2;scene.add(D.w)}D.w.position.set(PL.x,groundH(PL.x,PL.z)+.1,PL.z)}
    else if(D.t<2.9){const k=(D.t-2.4)/.5;a.x+=(D.tx-a.x)*k;a.z+=(D.tz-a.z)*k;a.aq=g+24*(1-k)}
    else{a.aq=undefined;a.dive=null;if(D.w)scene.remove(D.w);if(window.PW){PW.shake=Math.max(PW.shake||0,.9);if(PW.ps)pwBurst(PW.ps,a.x,g+.5,a.z,120,10,1.2,.9,.2,...(a.ice?IC:[[1,.8,.3],[1,.2,0]]),4,4,1,1)}try{WD.roar(.8)}catch(e){}
      for(let i=0;i<8;i++){const an=i/8*6.283;burn(a.x+Math.cos(an)*5,a.z+Math.sin(an)*5,6,a.ice)}if(Math.hypot(PL.x-a.x,PL.z-a.z)<7.5){damagePlayer(48,a);addLog(a.name+' slaat neer naast je!','#ff5a3a')}}}
  /* rain of fire */
  if(a.rain){a.rnCd=(a.rnCd??1)-dt;if(a.rnCd<=0){a.rnCd=1.1;const x=PL.x+rr(9),z=PL.z+rr(9),y=groundH(x,z),w=new T.Mesh(new T.CircleGeometry(2.8,24),a.ice?warnI:warnM);w.rotation.x=-Math.PI/2;w.position.set(x,y+.1,z);scene.add(w);
    const m=new T.Mesh(new T.SphereGeometry(.9,10,8),new T.MeshBasicMaterial({color:a.ice?0xcff0ff:0xffa030}));m.position.set(x+rr(6),y+40,z+rr(6));scene.add(m);METEORS.push({m,w,x,y,z,t:0,ice:a.ice})}}}
ANIMS.push(dt=>{for(const a of actors)if(a.type==='dragon'&&!a.dead&&Math.abs(a.x-PL.x)+Math.abs(a.z-PL.z)<150)bossTick(a,dt);
  for(let i=FIRES.length-1;i>=0;i--){const f=FIRES[i];f.t-=dt;f.m.material.opacity=.75*Math.min(1,f.t/2);f.m.scale.setScalar(1+Math.sin(PL.t*9+f.x)*.06);
    if(window.PW&&PW.ps&&Math.random()<dt*5)pwEm(PW.ps,f.x+rr(1.5),f.m.position.y,f.z+rr(1.5),0,2+Math.random()*2,0,.7,.4,.05,...(f.ice?IC:[[1,.7,.2],[1,.2,0]]),1,-.5,.5);
    f.tick-=dt;if(f.tick<=0&&Math.hypot(PL.x-f.x,PL.z-f.z)<2.3&&PL.y<f.m.position.y+1.5){f.tick=.5;damagePlayer(6,{type:f.ice?'frost':'fire'});if(f.ice)PL.frostT=Math.max(PL.frostT||0,1);floatText(PL.x,PL.y+2,PL.z,f.ice?'Bevroren!':'Brand!',f.ice?'#9ad8ff':'#ff8a2a')}
    if(f.t<=0){scene.remove(f.m);FIRES.splice(i,1)}}
  for(let i=METEORS.length-1;i>=0;i--){const M=METEORS[i];M.t+=dt;const k=Math.min(1,M.t/1.1);M.m.position.lerp(new T.Vector3(M.x,M.y,M.z),k*.25+.02);M.w.material.opacity=.3+.3*Math.sin(M.t*20);
    if(k>=1||M.m.position.y<M.y+.6){scene.remove(M.m);scene.remove(M.w);METEORS.splice(i,1);if(window.PW&&PW.ps)pwBurst(PW.ps,M.x,M.y+.4,M.z,40,6,.8,.6,.1,...(M.ice?IC:[[1,.8,.3],[1,.2,0]]),3,4,1,1);burn(M.x,M.z,5,M.ice);if(Math.hypot(PL.x-M.x,PL.z-M.z)<3.2)damagePlayer(22,{type:'fire'})}}});
const _kaV=killActor;killActor=function(a,by){const was=!a.dead;_kaV(a,by);if(was&&a.type==='dragon'&&by){dropLoot(a.x,a.z,{gold:600,items:[['dragon_heart',1],['dragon_scale',3]]});addLog(a.name+' is verslagen! Zijn hart gloeit nog na.','#ffd27a');for(const f of FIRES)f.t=Math.min(f.t,1)}};

/* ---------- hooks ---------- */
const _bfD=buildFantasy;buildFantasy=function(){_bfD();try{buildNest()}catch(e){console.warn('dragon nest',e)}};
const _sgD=startGame;startGame=function(...a){_sgD(...a);try{if(PL.fx&&PL.fx.babyDragon){if(EGG.m)EGG.m.visible=false;EGG.state='hatched';if(!PET)spawnPet(PL.x+2,PL.z+2,false);PET.name=PL.fx.babyDragon.name||'Vonk'}}catch(e){console.warn('pet',e)}};
})();
