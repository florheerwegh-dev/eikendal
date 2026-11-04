/* Eikendal: the Demon Realm made cinematic. Flowing lava, rivers with obsidian bridges, erupting volcanoes that hurl
   lava bombs, glowing obsidian, floating rocks, stone demon statues, falling ash, red lightning,
   an entry flyover with a title card and an introduction for the four-handed giant. */
(function(){
'use strict';
const LV={rivers:[],bombs:[],volc:[],float:[],t:0,erT:12,ltT:8,built:false};window.LV=LV;
const U={t:{value:0},fogC:{value:new T.Color(0x3a1008)},fogD:{value:.0034}};
/* flowing lava: domain-warped noise, dark crust, bright cracks */
const lavaMat=new T.ShaderMaterial({uniforms:U,
  vertexShader:'varying vec3 vW;varying float vZ;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;vZ=-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader:`uniform float t;uniform vec3 fogC;uniform float fogD;varying vec3 vW;varying float vZ;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
  void main(){vec2 p=vW.xz*.09;vec2 q=vec2(fb(p+vec2(t*.06,t*.03)),fb(p+vec2(5.2,1.3)-t*.04));float f=fb(p*1.6+q*2.2+vec2(0.,t*.05));
    float cr=smoothstep(.42,.5,f)-smoothstep(.5,.62,f);float hot=smoothstep(.25,.75,fb(p*3.+q+t*.1));
    vec3 col=mix(vec3(.18,.03,.01),vec3(.9,.22,.02),hot);col=mix(col,vec3(1.,.78,.25),cr*1.2);col+=vec3(1.,.5,.1)*pow(max(0.,1.-f),3.)*.6;
    col*=.85+.25*sin(t*1.7+vW.x*.05+vW.z*.04);
    float fg=1.-exp(-fogD*fogD*vZ*vZ*.6);gl_FragColor=vec4(mix(col,fogC*1.6,fg*.7),1.);}`});
/* obsidian with glowing cracks */
let crackMat=null;function crackM(){if(crackMat)return crackMat;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,256);g.strokeStyle='#ff6a1a';g.shadowColor='#ff3a0a';g.shadowBlur=6;
  for(let i=0;i<22;i++){g.lineWidth=Math.random()*2+.6;g.beginPath();let x=Math.random()*256,y=Math.random()*256;g.moveTo(x,y);for(let k=0;k<8;k++){x+=(Math.random()-.5)*50;y+=Math.random()*40-10;g.lineTo(x,y)}g.stroke()}
  const em=new T.CanvasTexture(c);em.wrapS=em.wrapT=T.RepeatWrapping;em.repeat.set(1,2);
  return crackMat=new T.MeshStandardMaterial({color:0x1a1416,roughness:.35,metalness:.3,emissive:0xff5a1a,emissiveMap:em,emissiveIntensity:1.6,flatShading:true})}
const X=()=>DW.X,Z=()=>DW.Z;

/* ================= build ================= */
const _bdr=buildDemonRealm;
buildDemonRealm=function(){_bdr();try{upgrade()}catch(e){console.warn('lava world',e)}};
function upgrade(){
  const x0=X(),z0=Z(),R=DW.R;
  /* pools and spires get their new materials */
  scene.traverse(m=>{if(!m.isMesh||!m.material||m.position.x>-11000)return;const mt=m.material;
    if(mt.map===DW.lavaT)m.material=lavaMat;
    else if(mt.color&&mt.color.getHex()===0x241a1c&&(m.geometry.type==='ConeGeometry'||m.geometry.type==='CylinderGeometry'))m.material=crackM()});
  /* lava rivers crossing the realm, with obsidian bridges on the main road */
  const river=(pts,w)=>{const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(x0+p[0],.07,z0+p[1]))),N=80,pos=[],idx=[];
    for(let i=0;i<=N;i++){const p=curve.getPoint(i/N),tg=curve.getTangent(i/N),nx=-tg.z,nz=tg.x,l=Math.hypot(nx,nz)||1,ww=w*(.8+.35*Math.sin(i*.7));pos.push(p.x+nx/l*ww,.075,p.z+nz/l*ww,p.x-nx/l*ww,.075,p.z-nz/l*ww);if(i<N){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,lavaMat);scene.add(m);
    const seg=[];for(let i=0;i<=40;i++){const p=curve.getPoint(i/40);seg.push([p.x,p.z])}LV.rivers.push({seg,w});return curve};
  river([[-R,140],[-180,110],[-90,130],[0,118],[90,104],[200,128],[R,150]],5.5);
  river([[-R,-40],[-200,-60],[-100,-30],[0,-52],[110,-70],[220,-40],[R,-20]],6.5);
  river([[-260,240],[-200,180],[-150,140]],4);river([[150,-130],[200,-200],[240,-260]],4.5);
  const bridge=(bz)=>{const g=new T.Group();g.position.set(x0,0,z0+bz);const ob=crackM();
    const deck=new T.Mesh(new T.BoxGeometry(9,.8,22),new T.MeshStandardMaterial({color:0x221a1c,roughness:.6,metalness:.2,flatShading:true}));deck.position.y=.55;g.add(deck);
    for(const s of[-1,1])for(const k of[-1,0,1]){const pl=new T.Mesh(new T.CylinderGeometry(.35,.5,2.4,6),ob);pl.position.set(s*4.2,1.6,k*9);g.add(pl);const fl=new T.Mesh(new T.SphereGeometry(.35,8,6),new T.MeshBasicMaterial({color:0xff7a2a}));fl.position.set(s*4.2,3,k*9);g.add(fl)}
    scene.add(g);LV.bridges=(LV.bridges||[]).concat([{x:x0,z:z0+bz,w:5,l:12}])};
  bridge(118);bridge(-52);
  /* volcanoes on the horizon */
  const vm=new T.MeshStandardMaterial({color:0x1c1414,roughness:.95,flatShading:true});
  [[-.6,460,170],[.35,520,200],[2.6,480,150],[4.1,440,120]].forEach(([a,d,h])=>{const vx=x0+Math.cos(a)*d,vz=z0+Math.sin(a)*d,cg=new T.CylinderGeometry(h*.11,h*.95,h,30,12,true),cp=cg.attributes.position;
    for(let i=0;i<cp.count;i++){const x=cp.getX(i),y=cp.getY(i),z=cp.getZ(i),an=Math.atan2(z,x),t=(y+h/2)/h,k=1+.09*Math.sin(an*7+y*.08)+.06*Math.sin(an*13-y*.15)+.05*Math.sin(an*3+t*9);cp.setX(i,x*k);cp.setZ(i,z*k);cp.setY(i,y+(t>.97?-h*.03:0))}
    cg.computeVertexNormals();const cone=new T.Mesh(cg,vm);cone.position.set(vx,h/2-6,vz);scene.add(cone);
    const crater=new T.Mesh(new T.CircleGeometry(h*.12,20),lavaMat);crater.rotation.x=-Math.PI/2;crater.position.set(vx,h-6-h*.06,vz);scene.add(crater);
    const glow=new T.Mesh(new T.SphereGeometry(h*.085,16,10),new T.MeshBasicMaterial({color:0xff3a0a,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false}));glow.position.set(vx,h-7,vz);scene.add(glow);
    for(let k=0;k<5;k++){const st=new T.Mesh(new T.BoxGeometry(2.4,h*.55,.4),new T.MeshBasicMaterial({color:0xff6a1a}));st.position.set(vx+Math.cos(k*1.3)*h*.32,h*.45,vz+Math.sin(k*1.3)*h*.32);st.lookAt(vx,h*.45,vz);st.rotation.x=.55;scene.add(st)}
    LV.volc.push({x:vx,z:vz,h,glow})});
  /* floating rock islands */
  const fm=new T.MeshStandardMaterial({color:0x2a2022,roughness:.9,flatShading:true});
  for(let i=0;i<9;i++){const a=i/9*6.283+.3,d=rnd(140,300),g=new T.Group(),s=rnd(5,13);const top=new T.Mesh(new T.DodecahedronGeometry(s,1),fm);top.scale.set(1,.45,1);g.add(top);const bot=new T.Mesh(new T.ConeGeometry(s*.8,s*1.8,7),crackM());bot.rotation.x=Math.PI;bot.position.y=-s*1.05;g.add(bot);
    g.position.set(x0+Math.cos(a)*d,rnd(40,85),z0+Math.sin(a)*d);scene.add(g);LV.float.push({g,y:g.position.y,p:rnd(6)})}
  /* basalt boulders and bones */
  {const geo=new T.DodecahedronGeometry(1,0),inst=new T.InstancedMesh(geo,new T.MeshStandardMaterial({color:0x221c1c,roughness:.9,flatShading:true}),160),M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),S=new T.Vector3();let n=0;
    for(let t=0;t<2000&&n<160;t++){const a=rnd(6.283),r=rnd(30,R-10),x=x0+Math.cos(a)*r,z=z0+Math.sin(a)*r;if(Math.abs(x-x0)<10&&z>z0-230)continue;if(DW.pools.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+3))continue;if(onRiver(x,z,2))continue;
      const s=rnd(.6,2.4);E.set(rnd(3),rnd(3),rnd(3));Q.setFromEuler(E);V.set(x,s*.3,z);S.set(s,s*rnd(.5,1),s);M.compose(V,Q,S);inst.setMatrixAt(n++,M);if(s>1.4)addCircle(x,z,s*.8)}inst.count=n;scene.add(inst)}
  /* the road to the arena: braziers and stone demon statues */
  for(let i=0;i<7;i++){const z=z0+200-i*42;if(Math.abs(z-z0-118)<16||Math.abs(z-z0+52)<16)continue;for(const s of[-1,1]){const bx=x0+s*9;const b=new T.Mesh(new T.CylinderGeometry(.6,.9,1.6,8),crackM());b.position.set(bx,.8,z);scene.add(b);
    const f=mesh(new T.ConeGeometry(.55,1.3,7),new T.MeshBasicMaterial({color:0xff8a2a}),bx,2.2,z,false);f.userData.dyn=true;scene.add(f);LAMPS.push({x:bx,y:2,z,flame:f,fire:true});addCircle(bx,z,1)}}
  try{statues(x0,z0)}catch(e){console.warn('statues',e)}
  LV.built=true}
function statues(x0,z0){if(!window.EX||!EX.makeBeastH||!EX.bx||!EX.bx.imp||!EX.bx.imp.ok)return;const B=EX.bx.imp,stone=new T.MeshStandardMaterial({color:0x6a5e5a,roughness:.95,flatShading:true,emissive:0xff3a10,emissiveMap:B.T.em,emissiveIntensity:3,skinning:true});
  const clip=AS.clips.imp&&(AS.clips.imp.Sword_Idle||AS.clips.imp.Idle_FoldArms_Loop);
  [[-16,150],[16,150],[-16,40],[16,40],[-20,-100],[20,-100]].forEach(([dx,dz],i)=>{const h=EX.makeBeastH('imp',{v:3,h:11});h.model.traverse(m=>{if(m.isMesh)m.material=stone});
    if(clip){const mx=new T.AnimationMixer(h.model);mx.clipAction(clip).play();mx.setTime(.3+i*.2)}else h.mixer.update(.1);
    const ped=new T.Mesh(new T.BoxGeometry(5,2,5),crackM());ped.position.set(x0+dx,1,z0+dz);scene.add(ped);h.g.position.set(x0+dx,2,z0+dz);h.g.rotation.y=dx<0?Math.PI/2:-Math.PI/2;scene.add(h.g);addCircle(x0+dx,z0+dz,3)})}
function onRiver(x,z,pad=0){for(const r of LV.rivers){for(let i=0;i<r.seg.length-1;i++){const [ax,az]=r.seg[i],[bx,bz]=r.seg[i+1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;let t=l2?((x-ax)*dx+(z-az)*dz)/l2:0;t=t<0?0:t>1?1:t;if(Math.hypot(x-ax-dx*t,z-az-dz*t)<r.w+pad)return true}}return false}
const onBridge=(x,z)=>(LV.bridges||[]).some(b=>Math.abs(x-b.x)<b.w&&Math.abs(z-b.z)<b.l);

/* ================= every frame ================= */
let hurtR=0;
/* the lava takes its fog from the scene every frame, also while paused or during a cinematic */
const _ueL=updateEnv;updateEnv=function(dt,pp){_ueL(dt,pp);if(scene.fog){U.fogC.value.copy(scene.fog.color);U.fogD.value=scene.fog.density||.003}};
ANIMS.push(dt=>{U.t.value+=dt;if(!LV.built)return;const inDW=PL.x<-9000&&PL.x>-30000;
  if(!inDW)return;LV.t+=dt;
  for(const f of LV.float){f.g.position.y=f.y+Math.sin(LV.t*.3+f.p)*1.6;f.g.rotation.y+=dt*.02;if(window.PW&&PW.ps&&Math.random()<dt*2)pwEm(PW.ps,f.g.position.x+rnd(-2,2),f.g.position.y-8,f.g.position.z+rnd(-2,2),0,-6,0,2.2,.5,.3,PC.fire[0],PC.fire[2],1,6,0)}
  for(const v of LV.volc){v.glow.material.opacity=.42+Math.sin(LV.t*2+v.x)*.1;if(window.PW&&PW.smoke&&Math.random()<dt*3)pwEm(PW.smoke,v.x+rnd(-6,6),v.h-2,v.z+rnd(-6,6),rnd(-1,1),rnd(5,9),rnd(-1,1),9,8,26,[.25,.2,.2],[.08,.06,.06],.55,-.3,.1)}
  /* ash falling, embers rising */
  if(window.PW&&PW.smoke&&Math.random()<dt*14)pwEm(PW.smoke,PL.x+rnd(-30,30),PL.y+rnd(10,22),PL.z+rnd(-30,30),rnd(-.5,.5),-rnd(.8,1.6),rnd(-.5,.5),9,.14,.12,[.55,.5,.48],[.3,.28,.26],.8,0,0);
  /* eruptions: rumble, glow, lava bombs with warning rings */
  LV.erT-=dt;if(LV.erT<=0){LV.erT=rnd(14,28);erupt(pick(LV.volc))}
  for(let i=LV.bombs.length-1;i>=0;i--){const b=LV.bombs[i];b.t+=dt;const k=Math.min(1,b.t/b.T),x=b.sx+(b.tx-b.sx)*k,z=b.sz+(b.tz-b.sz)*k,y=b.sy+(0-b.sy)*k+Math.sin(k*Math.PI)*b.arc;b.m.position.set(x,y,z);
    if(window.PW&&PW.ps)pwEm(PW.ps,x,y,z,0,0,0,.6,1.4,.3,PC.fire[0],PC.fire[2],1,0,0);
    if(k>=1){scene.remove(b.m);if(b.ring)b.ring.kill();LV.bombs.splice(i,1);try{pwBurst(PW.ps,x,.6,z,40,8,.8,1,.2,PC.fire[0],PC.fire[1],2,3,1,1.2);pwBurst(PW.smoke,x,.8,z,12,4,1.6,2,4,[.3,.25,.22],[.1,.08,.07],.8,-.3,.6,1.2);sfx('hit')}catch(e){}
      const d=Math.hypot(PL.x-x,PL.z-z);if(d<6&&!PL.dead&&PL.x<-9000){damagePlayer(30*(1-d/7),{x,z});floatText(PL.x,PL.y+1.5,PL.z,'Lavabom!','#ff7a2a')}if(d<40&&window.PW)PW.shake=Math.max(PW.shake,1.2-d/40)}}
  /* red lightning in the ash clouds */
  LV.ltT-=dt;if(LV.ltT<=0){LV.ltT=rnd(9,22);try{pwFlash('#ff5a2a',.22,.7);setTimeout(()=>sfx('thunder'),400)}catch(e){}if(typeof hemi!=='undefined'&&hemi){const h0=hemi.intensity;hemi.intensity=h0*2.2;setTimeout(()=>hemi.intensity=h0,140)}}
  /* rivers burn, bridges are safe */
  hurtR-=dt;if(hurtR<=0&&!PL.dead&&PL.y<1&&onRiver(PL.x,PL.z)&&!onBridge(PL.x,PL.z)){hurtR=.4;damagePlayer(11,{});floatText(PL.x,PL.y+1,PL.z,'Lava!','#ff7a2a')}});
function erupt(v){if(!v)return;const near=Math.hypot(PL.x-v.x,PL.z-v.z);try{sfx('thunder');if(window.PW)PW.shake=Math.max(PW.shake,.5);for(let k=0;k<60;k++)pwEm(PW.ps,v.x+rnd(-5,5),v.h-4,v.z+rnd(-5,5),rnd(-14,14),rnd(25,50),rnd(-14,14),rnd(2,4),rnd(2,5),.5,PC.fire[0],PC.fire[2],1,14,.05)}catch(e){}
  addLog(pick(['De grond beeft. Een vulkaan barst uit!','Een vulkaan spuwt lava de lucht in!','Lavabommen! Kijk uit voor de rode cirkels.']),'#ff8a4a');
  const n=4+Math.floor(Math.random()*4);for(let i=0;i<n;i++){const tgt=Math.random()<.5?[PL.x+rnd(-18,18),PL.z+rnd(-18,18)]:[X()+rnd(-DW.R*.8,DW.R*.8),Z()+rnd(-DW.R*.8,DW.R*.8)];
    const m=new T.Mesh(new T.SphereGeometry(1.4,10,8),new T.MeshBasicMaterial({color:0xffa040}));scene.add(m);const T0=rnd(3.2,4.6);
    let ring=null;try{ring=pwRingMesh(tgt[0],tgt[1],5.5,new T.Color(1,.3,.1),.85,true);ring.g.position.y=.2}catch(e){}
    LV.bombs.push({m,t:-i*.35,T:T0,sx:v.x,sy:v.h-4,sz:v.z,tx:tgt[0],tz:tgt[1],arc:rnd(60,110),ring})}}

/* ================= cinematics ================= */
const CIN={on:false};window.CIN=CIN;window.cinematic=(...a)=>cinematic(...a);window.endCine=()=>endCine();
{const s=document.createElement('style');s.textContent='#cinebars:before,#cinebars:after{content:"";position:fixed;left:0;right:0;height:12vh;background:#000;z-index:40;transition:transform .9s cubic-bezier(.2,.8,.2,1);pointer-events:none}#cinebars:before{top:0;transform:translateY(-100%)}#cinebars:after{bottom:0;transform:translateY(100%)}body.cine #cinebars:before,body.cine #cinebars:after{transform:none}body.cine .hud,body.cine #qbar,body.cine #pwbar,body.cine #bossbar,body.cine #gbar{opacity:0!important}#cinet{position:fixed;left:0;right:0;top:40%;z-index:41;text-align:center;pointer-events:none;opacity:0;transition:opacity 1.2s}#cinet h1{font-family:var(--f-display);font-weight:400;font-size:clamp(40px,8vw,96px);margin:0;color:#ffcf8a;letter-spacing:.12em;text-shadow:0 0 30px rgba(255,90,30,.8),0 4px 20px #000}#cinet p{font-size:clamp(14px,2vw,20px);letter-spacing:.35em;text-transform:uppercase;color:#f0c8a0;margin:8px 0 0;text-shadow:0 2px 8px #000}#cineskip{position:fixed;right:16px;bottom:calc(12vh + 10px);z-index:41;color:rgba(255,255,255,.65);font-size:13px;display:none}body.cine #cineskip{display:block}';document.head.appendChild(s);
  const b=document.createElement('div');b.id='cinebars';document.body.appendChild(b);const t=document.createElement('div');t.id='cinet';document.body.appendChild(t);const k=document.createElement('div');k.id='cineskip';k.textContent='Spatie = overslaan';document.body.appendChild(k)}
const _amC=anyModal;anyModal=function(){return CIN.on||_amC()};
function cinematic(shots,title,sub,onEnd){if(CIN.on)return;CIN.on=true;CIN.t=0;const cid=CIN.id=(CIN.id||0)+1;setTimeout(()=>{if(CIN.on&&CIN.id===cid)endCine()},(shots.reduce((s,x)=>s+x.d,0)+4)*1000);CIN.shots=shots;CIN.end=onEnd;CIN.total=shots.reduce((s,x)=>s+x.d,0);document.body.classList.add('cine');try{document.exitPointerLock()}catch(e){}
  const tt=document.getElementById('cinet');tt.innerHTML='<h1>'+esc(title)+'</h1><p>'+esc(sub)+'</p>';setTimeout(()=>{if(CIN.on)tt.style.opacity=1},900);setTimeout(()=>tt.style.opacity=0,Math.max(2500,CIN.total*1000-1600));
  let last=performance.now();const step=now=>{if(!CIN.on)return;const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=Math.max(last,now);CIN.t+=dt;U.t.value+=dt;LV.t+=dt;try{if(window.PW){if(PW.ps)pwPSUpdate(PW.ps,dt);if(PW.smoke)pwPSUpdate(PW.smoke,dt)}for(const f of LV.float)f.g.position.y=f.y+Math.sin(LV.t*.3+f.p)*1.6;for(const fn of CIN.tick||[])fn(dt)}catch(e){}
    if(CIN.t>=CIN.total)endCine();else requestAnimationFrame(step)};requestAnimationFrame(step)}
function endCine(){if(!CIN.on)return;CIN.on=false;document.body.classList.remove('cine');document.getElementById('cinet').style.opacity=0;CIN.tick=null;const f=CIN.end;CIN.end=null;if(f)f();if(started&&!PL.dead)lock()}
addEventListener('keydown',e=>{if(CIN.on&&(e.code==='Space'||e.code==='Escape'||e.code==='Enter')){e.preventDefault();e.stopImmediatePropagation();endCine()}},true);
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const _ucC=updateCamera;updateCamera=function(dt){_ucC(dt);if(!CIN.on)return;let t=CIN.t;for(const s of CIN.shots){if(t<=s.d){const k=ease(Math.min(1,t/s.d)),p=s.from.clone().lerp(s.to,k),l=s.lf.clone().lerp(s.lt,k);camera.position.copy(p);camera.lookAt(l);return}t-=s.d}};
const V3=(x,y,z)=>new T.Vector3(x,y,z);
/* entering the realm */
let wasIn=false;
ANIMS.push(()=>{const inDW=PL.x<-9000&&PL.x>-30000;if(inDW&&!wasIn&&LV.built&&!(PL.fx&&PL.fx.seenDW)){PL.fx=PL.fx||{};PL.fx.seenDW=1;const x0=X(),z0=Z(),v=LV.volc[1]||{x:x0,z:z0-400,h:150};
    setTimeout(()=>erupt(v),2600);
    cinematic([{d:4.2,from:V3(x0+160,95,z0+330),to:V3(x0+60,55,z0+120),lf:V3(v.x,v.h*.7,v.z),lt:V3(x0,6,z0-200)},
      {d:3.6,from:V3(x0+60,55,z0+120),to:V3(x0+14,14,z0-120),lf:V3(x0,6,z0-200),lt:V3(x0,18,z0-210)},
      {d:2.6,from:V3(x0+18,30,z0+275),to:V3(PL.x+3,PL.y+3.2,PL.z+7),lf:V3(x0,4,z0+150),lt:V3(PL.x,PL.y+1.5,PL.z-10)}],'Het Demonenrijk','Waar de Reuzen-Vierhand heerst')}
  wasIn=inDW});
/* meeting the giant */
ANIMS.push(()=>{if(CIN.on||!started||PL.x>-9000||PL.x<-30000||(PL.fx&&PL.fx.seenGiant))return;const g=actors.find(a=>a.type==='fourhands'&&!a.dead);if(!g)return;const d=Math.hypot(g.x-PL.x,g.z-PL.z);if(d>115)return;
  PL.fx=PL.fx||{};PL.fx.seenGiant=1;const gx=g.x,gz=g.z,hh=g.hh||26;try{sfx('thunder');setTimeout(()=>{sfx('thunder');if(window.PW)PW.shake=2},2600)}catch(e){}
  cinematic([{d:3,from:V3(gx+30,4,gz+55),to:V3(gx+16,8,gz+34),lf:V3(gx,hh*.4,gz),lt:V3(gx,hh*.8,gz)},
    {d:3,from:V3(gx-26,hh*1.2,gz+30),to:V3(gx-10,hh*.9,gz+22),lf:V3(gx,hh*.85,gz),lt:V3(gx,hh*.9,gz)},
    {d:1.8,from:V3(PL.x-(gx-PL.x)*.08,PL.y+4,PL.z-(gz-PL.z)*.08),to:V3(PL.x-(gx-PL.x)*.04,PL.y+2.6,PL.z-(gz-PL.z)*.04),lf:V3(gx,hh*.6,gz),lt:V3(gx,hh*.5,gz)}],'Reuzen-Vierhand','Heerser van het Demonenrijk',()=>{addLog('De Reuzen-Vierhand heeft je gezien!','#e5766a')})});
})();
