/* ================= De Sterrenkist en de Stormsprong =================
   On the small island in the south-east stands the Sterrenkist, a chest of stars on a circle of runes. Opening it
   starts a cinematic: the lid bursts open, a beam of light shoots into the sky and the Krachtwisselaar rises out of
   it, an amulet that can change your superpower. Afterwards you choose: change your power now, or keep the amulet
   and use it later from your bag.
   The boots of Zefyr the Stormrunner give the Stormsprong: press L to teleport about 18 metres ahead (every 15 s). */
(function(){
const LG={opened:false,ui:null,tpT:0};WD.legend=LG;
ITEMS.amu_powerswap={n:'Krachtwisselaar',g:'amulet',fx:{mp:20},price:20000,ico:'✦',rar:'m'};
const _amL=anyModal;anyModal=function(){return !!LG.ui||_amL()};

/* ---------- the chest ---------- */
function buildStarChest(){const I=(WD.isles||[])[1]||{x:380,z:960};const x=I.x,z=I.z,y=groundH(x,z),g=new T.Group();g.position.set(x,y,z);g.rotation.y=Math.atan2(-x,-z);scene.add(g);
  const wood=new T.MeshStandardMaterial({color:0x2a1a3a,roughness:.6}),gold=MAT.gold,gl=new T.MeshStandardMaterial({color:0x8a5aff,emissive:0x6a3aff,emissiveIntensity:1.2});
  g.add(mesh(new T.BoxGeometry(1.5,.8,.95),wood,0,.4,0));for(const s of[-1,1])g.add(mesh(new T.BoxGeometry(.1,.84,1),gold,s*.55,.4,0));g.add(mesh(new T.BoxGeometry(1.54,.12,.99),gold,0,.12,0));
  const lid=new T.Group();lid.position.set(0,.8,-.47);g.add(lid);const lm=mesh(new T.CylinderGeometry(.47,.47,1.5,16,1,false,0,Math.PI),wood,0,0,.47);lm.rotation.set(0,0,Math.PI/2);lm.rotation.order='ZYX';lid.add(lm);
  const st=mesh(new T.OctahedronGeometry(.16,0),gl,0,.48,.47);lid.add(st);g.add(mesh(new T.BoxGeometry(.2,.26,.06),gold,0,.72,.5));
  const ring=new T.Mesh(new T.CircleGeometry(4.5,48),new T.MeshBasicMaterial({map:WD.tx('rune_magic.png'),color:0xb08aff,transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.06;ring.userData.dyn=true;g.add(ring);
  const crys=[];for(let i=0;i<4;i++){const c=mesh(new T.OctahedronGeometry(.32,0),gl,0,1.8,0,false);c.scale.y=1.8;c.userData.dyn=true;g.add(c);crys.push(c)}
  const bm=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{t:{value:0},k:{value:0}},vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float t,k;varying vec2 vU;void main(){float a=(1.-vU.y)*(.6+.4*sin(vU.y*50.-t*6.)+.25*sin(vU.x*30.+t*3.));gl_FragColor=vec4(mix(vec3(.6,.4,1.),vec3(1.,.95,1.),1.-vU.y)*a*k,1.);}'});
  const beam=new T.Mesh(new T.CylinderGeometry(.5,1.4,120,20,1,true),bm);beam.position.y=60;beam.visible=false;beam.userData.dyn=true;g.add(beam);
  const amu=new T.Group();amu.add(mesh(new T.TorusGeometry(.32,.06,8,28),gold,0,0,0,false));const gem=mesh(new T.OctahedronGeometry(.2,0),gl,0,0,0,false);gem.scale.set(1,1.4,.6);amu.add(gem);amu.position.y=.6;amu.visible=false;amu.userData.dyn=true;g.add(amu);
  const sw=new T.Mesh(new T.RingGeometry(.9,1.4,48),new T.MeshBasicMaterial({color:0xd8c0ff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));sw.rotation.x=-Math.PI/2;sw.position.y=.2;sw.userData.dyn=true;g.add(sw);
  addCircle(x,z,1.1);Object.assign(LG,{x,y,z,g,lid,ring,crys,beam,bm,amu,sw});
  INTER.push({x,z,r:3.4,txt:()=>LG.opened?'':'Open de Sterrenkist',fn:openStarChest});
  HIDDEN.push({id:'starchest',name:'De Sterrenkist',x,z,found:false});MAPICON.starchest='✦';
  RUMORS.push({t:'Op het eilandje in het zuidoosten staat een kist die bij nacht glinstert als de sterren. Niemand durfde hem ooit te openen.',h:'starchest'})}
ANIMS.push(dt=>{if(!LG.g)return;const t=PL.t;LG.ring.rotation.z+=dt*.2;LG.crys.forEach((c,i)=>{const a=t*.7+i*1.571;c.position.set(Math.cos(a)*2.2,1.6+Math.sin(t*1.3+i)*.3,Math.sin(a)*2.2);c.rotation.y+=dt*2});LG.bm.uniforms.t.value+=dt});

/* ---------- the cinematic ---------- */
function openStarChest(){if(LG.opened||PL.dead)return;LG.opened=true;PL.fx=PL.fx||{};PL.fx.starChest=1;{const h=HIDDEN.find(q=>q.id==='starchest');if(h)h.found=true;try{if(WD.seen)WD.seen.add('h:starchest')}catch(e){}}if(CIN.on)endCine();const {x,y,z}=LG,V=(a,b,c)=>new T.Vector3(a,b,c),fw=LG.g.rotation.y,fx=Math.sin(fw),fz=Math.cos(fw),P=(f,s,h)=>V(x+fx*f+fz*s,y+h,z+fz*f-fx*s);
  cinematic([{d:2.6,from:P(16,-8,6),to:P(8,-4,3),lf:V(x,y+1,z),lt:V(x,y+1,z)},{d:2.4,from:P(4.5,3,1.7),to:P(3,-3.5,1.3),lf:V(x,y+.8,z),lt:V(x,y+1,z)},
    {d:2.6,from:P(4,2,.6),to:P(2.6,1.2,1),lf:V(x,y+2,z),lt:V(x,y+16,z)},{d:3.4,from:P(2.6,1.8,2.7),to:P(2.2,-1.8,2.9),lf:V(x,y+2.7,z),lt:V(x,y+2.7,z)}],
    'De Krachtwisselaar','Een amulet dat je superkracht kan veranderen',()=>{LG.amu.visible=false;LG.bm.uniforms.k.value=.35;giveItem('amu_powerswap',1);addLog('Je hebt de Krachtwisselaar gevonden!','#d8c0ff');showChoice()});
  let T0=0,boom=false;const tick=dt=>{T0+=dt;const t=T0;
    if(t>2.1&&t<2.7)LG.lid.rotation.x=-1.95*Math.min(1,(t-2.1)/.35);
    if(t>2.2&&!boom){boom=true;try{sfx('thunder')}catch(e){}try{pwFlash('#e8d8ff',.7,.6)}catch(e){}if(window.PW){PW.shake=Math.max(PW.shake||0,.7);if(PW.ps)pwBurst(PW.ps,x,y+1,z,160,9,1.4,1,.12,[.9,.8,1],[.5,.3,1],4,4,1,1)}LG.beam.visible=true}
    if(t>2.2){LG.bm.uniforms.k.value=Math.min(1,(t-2.2)*1.5);LG.beam.scale.set(1+Math.sin(t*8)*.08,Math.min(1,(t-2.2)*2),1);LG.beam.position.y=60*LG.beam.scale.y;
      if(window.PW&&PW.ps&&Math.random()<dt*60){const a=Math.random()*6.283,r=1.5+Math.random()*2.5;pwEm(PW.ps,x+Math.cos(a)*r,y+.3,z+Math.sin(a)*r,-Math.cos(a)*1.5,3+Math.random()*4,-Math.sin(a)*1.5,1.4,.22,.05,[.85,.75,1],[.5,.4,1],1,0,1)}}
    if(t>4.6){LG.amu.visible=true;const k=Math.min(1,(t-4.6)/1.6);LG.amu.position.y=.6+k*2.1;LG.amu.rotation.y+=dt*3;LG.amu.scale.setScalar(1+k*.6+Math.sin(t*6)*.05)}
    if(t>7.6){const k=(t-7.6)/1.6;LG.sw.material.opacity=Math.max(0,.8-k*.8);LG.sw.scale.setScalar(1+k*14);if(k<.1&&!LG.sw2){LG.sw2=1;try{sfx('level')}catch(e){}try{pwFlash('#ffffff',.5,.4)}catch(e){}}}};
  CIN.tick=(CIN.tick||[]).concat([tick])}

/* ---------- choose: change now, or keep the amulet ---------- */
function panel(html){closeUI();try{document.exitPointerLock()}catch(e){}const d=document.createElement('div');d.className='panel';
  d.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:70;max-width:min(680px,94vw);max-height:88vh;overflow:auto;padding:18px 20px;text-align:center';d.innerHTML=html;document.body.appendChild(d);LG.ui=d;return d}
function closeUI(){if(LG.ui){LG.ui.remove();LG.ui=null}}
function showChoice(){const d=panel('<h2 style="margin:0 0 6px">✦ De Krachtwisselaar</h2><p style="margin:0 0 14px">Het amulet gloeit in je hand. Hiermee kun je één keer van superkracht wisselen.</p>'+
  '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn pri" data-a="now">Wissel nu van kracht</button><button class="btn" data-a="later">Bewaar de amulet voor later</button></div>');
  d.querySelector('[data-a=now]').onclick=()=>chooser();d.querySelector('[data-a=later]').onclick=()=>{closeUI();addLog('De Krachtwisselaar zit in je rugzak. Klik er later op om van kracht te wisselen.','#d8c0ff');try{lock()}catch(e){}}}
function chooser(){if(!hasItem('amu_powerswap')){addLog('Je hebt geen Krachtwisselaar.');return}
  const cards=Object.entries(PWR).map(([id,p])=>'<button class="btn" data-id="'+id+'" style="display:block;width:100%;text-align:left;margin:6px 0;border-color:'+p.col+(id===PL.power?';opacity:.5':'')+'"><b style="color:'+p.col+'">'+(p.ic||'✦')+' '+p.n+'</b>'+(id===PL.power?' (je huidige kracht)':'')+'<br><small>'+(p.d||'')+'</small></button>').join('');
  const d=panel('<h2 style="margin:0 0 6px">Kies je nieuwe kracht</h2><p style="margin:0 0 8px">De Krachtwisselaar verdwijnt als je kiest.</p>'+cards+'<button class="btn" data-a="cancel" style="margin-top:8px">Toch niet</button>');
  d.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const id=b.dataset.id;if(id===PL.power)return;takeItem('amu_powerswap');PL.power=id;try{pwInit(true)}catch(e){console.warn(e)}closeUI();
    try{pwFlash(PWR[id].col,.6,.7)}catch(e){}try{sfx('level')}catch(e){}addLog('De Krachtwisselaar verbrokkelt tot sterrenstof. Je nieuwe kracht: '+PWR[id].n+'!','#d8c0ff');try{lock()}catch(e){}});
  d.querySelector('[data-a=cancel]').onclick=()=>{closeUI();try{lock()}catch(e){}}}
const _uiL=useItem;useItem=function(id){if(id==='amu_powerswap'){chooser();return}return _uiL(id)};
addEventListener('keydown',e=>{if(LG.ui&&e.code==='Escape'){closeUI();try{lock()}catch(e2){}}},true);

/* ---------- Stormsprong: the boots of the Stormrunner ---------- */
function stormJump(){const now=PL.t;if(LG.tpT>now){addLog('Stormsprong laadt nog op ('+Math.ceil(LG.tpT-now)+' s).','#9ad8ff');return}
  const fx=Math.sin(PL.yaw),fz=Math.cos(PL.yaw),y0=PL.y;let tx=0,tz=0,ok=false;
  for(let d=18;d>=3;d-=1){tx=PL.x+fx*d;tz=PL.z+fz*d;const q={x:tx,z:tz},g=groundH(tx,tz);if(collide(q,.45)||Math.abs(g-y0)>4)continue;if(WD.inferno&&WD.inferno.inSea&&WD.inferno.inSea(tx,tz))continue;ok=true;break}
  if(!ok){addLog('Daar kun je niet naartoe springen.','#9ad8ff');return}
  if(window.PW&&PW.ps)for(let i=0;i<18;i++){const k=i/18;pwEm(PW.ps,PL.x+(tx-PL.x)*k,y0+1,PL.z+(tz-PL.z)*k,0,.4,0,.5,.6,.1,[.85,.95,1],[.4,.6,1],.9,0,1)}
  PL.x=tx;PL.z=tz;PL.y=groundH(tx,tz);PL.vy=0;LG.tpT=now+15;try{pwFlash('#bfe8ff',.25,.3)}catch(e){}try{sfx('swing')}catch(e){}if(window.PW&&PW.ps)pwBurst(PW.ps,PL.x,PL.y+1,PL.z,30,5,.6,.5,.06,[.85,.95,1],[.4,.6,1],2,2,1,1)}
addEventListener('keydown',e=>{if(e.code!=='KeyL'||e.repeat)return;if(typeof started==='undefined'||!started||PL.dead||anyModal()||PL.mounted)return;
  if(!PL.eq||PL.eq.boots!=='storm_boots'){addLog('Alleen de Laarzen van de Stormloper geven de Stormsprong.','#9ad8ff');return}stormJump()});

const _bfL=buildFantasy;buildFantasy=function(){_bfL();try{buildStarChest()}catch(e){console.warn('sterrenkist',e)}};
const _sgL=startGame;startGame=function(...a){_sgL(...a);try{if(PL.fx&&PL.fx.starChest&&LG.g&&!LG.opened){LG.opened=true;LG.lid.rotation.x=-1.95}}catch(e){}};
})();
