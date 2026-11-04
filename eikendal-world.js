/* ================= Eikenland: a kingdom between the mountains and the sea =================
   Reshapes the land (snowy mountains in the north and east, a coast with beaches, cliffs and islands
   in the south and west), moves a few places to better spots, and adds the things that make it feel
   like a medieval world: a waterfall, a lighthouse, windmills, watchtowers, banners, fields of wheat,
   fireflies and short cinematic shots. Also builds the new portal to the Demonenrijk. */
(function(){
const WD=window.WD={};
const D2R=Math.PI/180;
/* ---------- the shape of the land ----------
   a = compass angle in degrees: 0 east, 90 south, 180 west, 270 north (z points south) */
const COAST=[3000,1150,1080,1040,990,865,880,900,790,1060,975,865,850,1000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000];
const MFRONT=[830,880,1100,2400,2400,2400,2400,2400,2400,2400,2400,2400,2400,1000,990,1040,900,850,800,800,840,885,880,860];
const CLIFF=[0,.6,1,.5,0,0,0,.3,0,1,.2,0,0,.8,1,1,1,1,1,1,1,1,1,1];
function ring(arr,a){a=((a%360)+360)%360;const f=a/15,i=Math.floor(f)%24,j=(i+1)%24,t=f-Math.floor(f),k=(1-Math.cos(t*Math.PI))/2;return arr[i]+(arr[j]-arr[i])*k}
const angOf=(x,z)=>Math.atan2(z,x)/D2R;
/* far from the middle the borders between sea and mountains wander a little, so they never run in straight lines */
const angWarp=(x,z,r)=>r<1000?0:(fbm(x*.0024+7,z*.0024-3,3)-.5)*64*smooth(1000,1450,r);
WD.coastR=(x,z)=>{const a=angOf(x,z)+angWarp(x,z,Math.hypot(x,z)),c=Math.cos(a*D2R),s=Math.sin(a*D2R);return ring(COAST,a)+(fbm(c*2.2+17,s*2.2+5,3)-.5)*110+(fbm(x*.012+3,z*.012-8,2)-.5)*36};
const frontR=(x,z,a)=>{const c=Math.cos(a*D2R),s=Math.sin(a*D2R);return ring(MFRONT,a)+(fbm(c*2.6-9,s*2.6+4,3)-.5)*150};
/* the lake of the Wise Old Tree, small islands, and the cliff of the waterfall */
const LAKE={x:-135,z:345,r:76,isl:33,top:15};WD.lake=LAKE;
const ISLES=[{x:-1000,z:250,r:46,h:11,id:'light'},{x:380,z:960,r:30,h:7},{x:-600,z:905,r:26,h:6},{x:-930,z:520,r:18,h:5}];WD.isles=ISLES;
const WF={z:-818};WF.x=riverX(WF.z);WD.wf=WF;
const _orig=(x,z)=>{let h=(fbm(x*.0035,z*.0035,5)-.5)*46+7;h+=Math.pow(Math.max(0,fbm(x*.0022+40,z*.0022-17,4)-.52)*3.2,2.2)*140;return h};
baseH=function(x,z){
  let h=_orig(x,z);const r=Math.hypot(x,z),a=angOf(x,z)+angWarp(x,z,r);
  /* mountains */
  const fr=frontR(x,z,a),mw=smooth(fr,fr+170,r);
  if(mw>0){const rg=1-Math.abs(fbm(x*.0042+11,z*.0042-7,5)*2-1);h+=mw*(115+175*rg*rg+90*fbm(x*.0013+3,z*.0013+9,3))}
  /* the cliff behind the waterfall, with the river's spring on top */
  {const dx=Math.abs(x-WF.x),dz=z-WF.z;if(dz<-8&&dx<120){const w=smooth(-14,-46,dz)*(1-smooth(55,120,dx));h+=w*Math.max(0,58-h*.25)}}
  /* sharper ridges and crags high up (as the Nature kit mountains) */
  if(h>26){const m=smooth(26,95,h),rr=1-Math.abs(fbm(x*.011+31,z*.011-17,4)*2-1);h+=m*(rr*rr*48-11)+m*(fbm(x*.05+3,z*.05-8,2)-.5)*8}
  /* the coast: beaches that run into the sea, cliffs where the land is rough */
  const rc=WD.coastR(x,z),u=r-rc;
  if(u>-175){const cl=ring(CLIFF,a);
    let hb=lerp(h,1.3+Math.max(0,h-1.3)*.1,smooth(-170,-28,u));hb=lerp(hb,-2.6,smooth(-28,34,u));hb=lerp(hb,-18,smooth(30,230,u));
    if(cl>0){const top=Math.max(h,9+fbm(x*.03,z*.03,2)*10);const hc=u<-7?lerp(h,top,smooth(-60,-7,u)):lerp(top,-15,smooth(-7,12,u));hb=lerp(hb,hc,cl)}
    h=hb}
  /* islands out at sea */
  for(const I of ISLES){const d=Math.hypot(x-I.x,z-I.z);if(d<I.r*1.6){const k=1-smooth(I.r*.3,I.r,d+(fbm(x*.05,z*.05,2)-.5)*10);if(k>0)h=Math.max(h,lerp(-6,I.h+fbm(x*.04+2,z*.04,2)*3,k))}}
  /* the lake with the island of the Wise Old Tree */
  {const d=Math.hypot(x-LAKE.x,z-LAKE.z);if(d<LAKE.r+40){const dn=d+(fbm(x*.05+7,z*.05,2)-.5)*12;
    h=lerp(h,Math.min(h,2.2+(dn-LAKE.r)*.2),smooth(LAKE.r+40,LAKE.r+6,dn));h=lerp(h,-3.4,1-smooth(LAKE.r-14,LAKE.r+2,dn));
    /* the island: a flat top where the tree stands, then a gentle slope down to a little beach */
    if(d<LAKE.isl+5){const di=d+(fbm(x*.07+3,z*.07-5,2)-.5)*5,hi=lerp(6.4,1.5,smooth(LAKE.top,LAKE.isl,di))+(fbm(x*.09,z*.09,2)-.5)*.6*smooth(LAKE.top-4,LAKE.top+4,di);h=lerp(h,hi,1-smooth(LAKE.isl-2,LAKE.isl+5,di))}}}
  return h};
terrainH=function(x,z){
  let h=baseH(x,z);
  for(const s of SITES){const d=Math.hypot(x-s.x,z-s.z),t=1-smooth(s.r,s.r*(s.blend||1.5),d);if(t>0)h=lerp(h,s.h,t)}
  /* the river starts at the waterfall pool below the cliff */
  const src=smooth(WF.z-30,WF.z+6,z),c=(1-smooth(5,13,Math.abs(x-riverX(z))))*src;if(c>0)h=lerp(h,-3.2,c);
  const dp=Math.hypot(x-WF.x,z-(WF.z+4));if(dp<34)h=lerp(h,-3.6,1-smooth(15,32,dp));
  return h};
/* ---------- places that moved to a better spot ---------- */
SITE.dragon.x=640;SITE.dragon.z=-640;SITE.dragon.h=42;SITE.dragon.blend=2.6;
ROADS[9].pts=[[300,-220],[420,-300],[530,-430],[600,-540],[630,-605]];
ROADS.push({w:1.6,pts:[[-44,318],[-48,336],[LAKE.x+LAKE.r+4,LAKE.z]]});
/* a wooden causeway across the lake to the island (it runs a few metres onto both shores so you can step on and off) */
{const x0=LAKE.x+LAKE.isl-4,x1=LAKE.x+LAKE.r+5;bridges.push({x:(x0+x1)/2,z:LAKE.z,hx:(x1-x0)/2,hz:1.7,y:2.35})}
WD.inSea=(x,z)=>{const r=Math.hypot(x,z);return r>WD.coastR(x,z)+260&&r>500};

/* ---------- Portal pack: meshes and textures ---------- */
const TL=new T.TextureLoader(),TX={},GC={};
function tx(n,rep){if(TX[n])return TX[n];const t=TL.load('assets/portal/'+n);t.anisotropy=4;if(rep)t.wrapS=t.wrapT=T.RepeatWrapping;return TX[n]=t}
WD.tx=tx;
WD.load=async function(){if(WD.M)return;try{const buf=await asFetchBin('assets/portal/meshes.json');WD.M=JSON.parse(new TextDecoder().decode(new Uint8Array(buf)))}catch(e){console.warn('portal meshes',e);WD.M={}}};
function geo(n){if(GC[n])return GC[n];const d=WD.M&&WD.M[n];if(!d)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(d.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(d.n,3));if(d.uv)g.setAttribute('uv',new T.Float32BufferAttribute(d.uv,2));g.setIndex(d.i);g.computeBoundingSphere();return GC[n]=g}
WD.geo=geo;
const addM=(map,col=0xffffff,op=1)=>new T.MeshBasicMaterial({map,color:col,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});WD.addM=addM;
function fogShader(frag,uni,o={}){const m=new T.ShaderMaterial({uniforms:T.UniformsUtils.merge([T.UniformsLib.fog]),fog:true,transparent:o.transparent!==false,depthWrite:!!o.depthWrite,side:T.DoubleSide,blending:o.blending||T.NormalBlending,
  vertexShader:'#include <fog_pars_vertex>\nvarying vec2 vU;void main(){vU=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
  fragmentShader:'#include <fog_pars_fragment>\nvarying vec2 vU;'+frag});Object.assign(m.uniforms,uni);return m}
const U={t:{value:0}};WD.U=U;
const _btW=buildTerrain;buildTerrain=async function(){await WD.load();return _btW.apply(this,arguments)};
/* particles for the world (mist, smoke, fireflies, embers) */
let PSN=null,PSA=null;function ps(){if(!PSN){PSN=pwMakePS(700,false);PSA=pwMakePS(500,true)}}
const rr=(a=1)=>(Math.random()*2-1)*a;
/* a small seeded random so every player gets the same fields and towers */
let seed=1234567;const srnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
function spotOK(x,z,clear){const h=terrainH(x,z);if(h<1.6||h>70)return false;if(roadDist(x,z)<clear+2.5||Math.abs(x-riverX(z))<16)return false;
  for(const [dx,dz] of[[clear,0],[-clear,0],[0,clear],[0,-clear]]){const h2=terrainH(x+dx,z+dz);if(Math.abs(h2-h)>clear*.28||h2<1.2)return false}
  if(typeof inBuilding==='function'&&inBuilding(x,z,clear+1))return false;const q={x,z};if(collide(q,clear))return false;return true}
function findSpot(cx,cz,r0,r1,clear,tries=60){for(let i=0;i<tries;i++){const a=srnd()*6.283,r=r0+srnd()*(r1-r0),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(spotOK(x,z,clear))return[x,z]}return null}

/* ---------- the portal to the Demonenrijk ---------- */
function archMaterial(){return fogShader('uniform float t;uniform sampler2D map;void main(){vec2 u=vU;u.x+=sin(u.y*18.+t*2.3)*.006+sin(u.y*5.-t)*.004;u.y+=sin(u.x*14.-t*1.7)*.008;vec3 c=texture2D(map,u).rgb;float g=.8+.2*sin(t*3.1+u.y*9.)+.12*sin(t*7.+u.x*20.);gl_FragColor=vec4(c*vec3(1.25,1.,.9)*g+vec3(.25,.08,0.)*(.5+.5*sin(t*2.)),1.);\n#include <fog_fragment>\n}',{t:{value:0},map:{value:tx('arch_flame.jpg')}},{transparent:false,depthWrite:true})}
WD.portals=[];
WD.portalFX=function(S,o={}){
  if(!geo('Portal_Archway'))return false;
  const small=!!o.small,y=o.y!==undefined?o.y:groundH(S.x,S.z),g=new T.Group();g.position.set(S.x,y,S.z);g.userData.dyn=true;scene.add(g);
  const s=small?.42:.55,R=19*s;
  const pt=tx('plat_sun.jpg'),pm=new T.MeshStandardMaterial({map:pt,color:0xffb8a0,emissive:0xff4a10,emissiveMap:pt,emissiveIntensity:.5,roughness:.85});
  const plat=new T.Mesh(geo('Portal_StonePlatform'),pm);plat.scale.set(s,.5,s);plat.receiveShadow=plat.castShadow=true;g.add(plat);
  const ins=new T.Mesh(geo('Portal_StonePlatform-Inscryption'),addM(tx('ins_sun.png'),0xff8a3a,1));ins.scale.set(s,.5,s);ins.position.y=.03;g.add(ins);
  const as=small?1.12:1.5,fm=new T.MeshStandardMaterial({map:tx('archway_dark.jpg'),color:0x5a3430,metalness:.6,roughness:.4,emissive:0x3a0a00});
  const fr=new T.Mesh(geo('Portal_Archway'),fm);fr.scale.setScalar(as);fr.position.y=.36;fr.castShadow=true;g.add(fr);
  const am=WD.archMat||(WD.archMat=archMaterial());const sf=new T.Mesh(geo('Portal_Door_Arch'),am);sf.scale.setScalar(as);sf.position.y=.36;g.add(sf);
  const pk=R*1.02/6.53,pf=tx('pillar_red.png',true),pf2=tx('pillar_orange.png',true);
  const pil=new T.Mesh(geo('Portal_Pillar'),addM(pf,0xffffff,.8));pil.scale.set(pk,small?.26:.34,pk);pil.position.y=.2;g.add(pil);
  const pil2=new T.Mesh(geo('Portal_Pillar'),addM(pf2,0xffffff,.5));pil2.scale.set(pk*.93,small?.18:.24,pk*.93);pil2.position.y=.2;pil2.rotation.y=1;g.add(pil2);
  const rings=[];for(const [hy,rad,tn,sp] of(small?[[3,5,'circle_red.png',.5],[7,4,'circle_orange.png',-.7]]:[[3.5,7.5,'circle_red.png',.4],[8,6.4,'circle_orange.png',-.6],[12.8,5,'circle_red.png',.9]])){
    const m=new T.Mesh(new T.PlaneGeometry(rad*2,rad*2),addM(tx(tn),0xffffff,.9));m.rotation.x=-Math.PI/2;m.position.y=hy;m.userData.sp=sp;g.add(m);rings.push(m)}
  const gr=new T.Mesh(new T.PlaneGeometry(R*2.9,R*2.9),addM(tx('ring_red.png'),0xff7a3a,.75));gr.rotation.x=-Math.PI/2;gr.position.y=.12;gr.userData.sp=-.12;g.add(gr);rings.push(gr);
  const shafts=[];const rise=tx('rise_white.png');for(let i=0;i<(small?4:6);i++){const a=i/(small?4:6)*6.283+.3,sp=new T.Sprite(new T.SpriteMaterial({map:rise,color:0xff6a2a,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false}));
    sp.scale.set(5,small?11:17,1);sp.position.set(Math.cos(a)*(R+1.5),(small?11:17)/2,Math.sin(a)*(R+1.5));g.add(sp);shafts.push(sp)}
  const light=new T.PointLight(0xff6a2a,2.4,small?28:46,1.6);light.position.y=6;g.add(light);
  addCircle(S.x,S.z,R*.97);
  if(!small){const ob=mm(0x241a1c,{roughness:.6}),gl=new T.MeshBasicMaterial({color:0xff5a1a});
    for(let i=0;i<10;i++){const an=i/10*6.283,r=R+5+(i%3)*3,x=S.x+Math.cos(an)*r,z=S.z+Math.sin(an)*r,yy=groundH(x,z),hh=5+hash2(i,31)*7;
      const sp=mesh(new T.ConeGeometry(1.3,hh,5),ob,x,yy+hh/2-.3,z);sp.rotation.y=an;scene.add(sp);addCircle(x,z,1.2);scene.add(mesh(new T.SphereGeometry(.38,6,5),gl,x,yy+hh-.1,z,false))}
    const ct=dwCanvas('rock');ct.repeat.set(5,5);const fade=canvasTex(128,128,(c,w,h)=>{const gr=c.createRadialGradient(64,64,20,64,64,63);gr.addColorStop(0,'#fff');gr.addColorStop(.7,'#bbb');gr.addColorStop(1,'#000');c.fillStyle=gr;c.fillRect(0,0,w,h)});fade.wrapS=fade.wrapT=T.ClampToEdgeWrapping;
    const cd=new T.Mesh(new T.CircleGeometry(40,48),new T.MeshStandardMaterial({map:ct,emissiveMap:ct,emissive:0xff6a2a,emissiveIntensity:.5,roughness:.95,transparent:true,alphaMap:fade,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}));
    cd.rotation.x=-Math.PI/2;cd.position.set(S.x,y+.06,S.z);cd.receiveShadow=true;scene.add(cd)}
  WD.portals.push({g,ins,pil,pil2,rings,light,shafts,small,x:S.x,z:S.z,y});return g};
WD.enterPortal=function(go){const P=DW.portal;if(!P||typeof cinematic!=='function'){go();return}
  const y=groundH(P[0],P[1]),tgt=new T.Vector3(P[0],y+6.5,P[1]),c=camera.position.clone(),f1=new T.Vector3(P[0],y+6,P[1]+16),f2=new T.Vector3(P[0],y+6.6,P[1]+1.2);
  try{sfx('thunder')}catch(e){}cinematic([{from:c,to:f1,lf:tgt.clone(),lt:tgt.clone(),d:1.4},{from:f1,to:f2,lf:tgt.clone(),lt:new T.Vector3(P[0],y+6.6,P[1]-12),d:1.1}],'','',go);
  setTimeout(()=>{try{pwFlash('#ff5a1a',.95,1.6)}catch(e){}},2150)};
ANIMS.push(dt=>{for(const p of WD.portals){const d=Math.hypot(p.x-PL.x,p.z-PL.z),near=d<(p.small?160:420);p.g.visible=d<900;if(!near)continue;
  p.ins.rotation.y+=dt*.12;for(const r of p.rings)r.rotation.z+=dt*r.userData.sp;p.pil.material.map.offset.x+=dt*.04;p.pil2.material.map.offset.x-=dt*.06;
  p.light.intensity=2.2+Math.sin(PL.t*7)*.35+Math.sin(PL.t*13.3)*.25;for(let i=0;i<p.shafts.length;i++)p.shafts[i].material.opacity=.4+.2*Math.sin(PL.t*1.3+i*1.7);
  if(!p.small&&d<420){ps();if(Math.random()<dt*14)pwEm(PSN,p.x+rr(4),p.y+14+rr(2),p.z+rr(4),rr(.6)+.4,3+Math.random()*2,rr(.6),7,1.6,7,[.18,.12,.1],[.06,.05,.05],.55,-.15,.05)}}});

/* ---------- the waterfall (Zilverval) ---------- */
function buildFalls(){
  const x=WF.x;let lipZ=WF.z-46,lipH=0;for(let dz=-10;dz>=-70;dz-=1){const h=terrainH(x,WF.z+dz);if(h>lipH){lipH=h;lipZ=WF.z+dz}if(h>42&&dz<-40)break}
  const pts=[];for(let z=lipZ;z<=WF.z+2;z+=1.2){const h=Math.max(terrainH(x,z),terrainH(x-6,z),terrainH(x+6,z));pts.push([z,Math.max(.1,h+.9)])}
  const pos=[],uv=[],idx=[],W=13,n=pts.length;let acc=0;for(let i=0;i<n;i++){if(i)acc+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);for(const s of[0,1]){pos.push(x+(s?W/2:-W/2),pts[i][1],pts[i][0]+.8);uv.push(s,acc/28)}if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);
  /* two sheets of falling water: streaks that speed up as they fall, frayed edges, white foam where it tips over */
  const NZ='float wh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float wn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(wh(i),wh(i+vec2(1,0)),f.x),mix(wh(i+vec2(0,1)),wh(i+vec2(1,1)),f.x),f.y);}';
  const sheet=(o,al)=>fogShader('uniform float t;'+NZ+'void main(){float x=vU.x,y=vU.y,sp=1.1+y*1.1;'+
    'float st=wn(vec2(x*34.+'+o+',y*2.-t*sp*2.4))*.6+wn(vec2(x*88.+'+o+'*3.,y*4.6-t*sp*3.9))*.4;float foam=smoothstep(.42,.86,st);'+
    'float edge=smoothstep(0.,.2,x)*smoothstep(1.,.8,x);float fray=wn(vec2(x*18.,y*3.-t*3.2+'+o+'));float a=clamp(edge*1.25-fray*(1.-edge)*1.6,0.,1.)*(.5+.5*st);'+
    'vec3 deep=vec3(.30,.47,.55),white=vec3(.95,.98,1.);vec3 c=mix(deep,white,clamp(foam*1.15+.22+y*.12,0.,1.));c=mix(c,white,smoothstep(.07,0.,y)*.8);'+
    'gl_FragColor=vec4(c,a*'+al+');\n#include <fog_fragment>\n}',{t:U.t});
  const fall=new T.Mesh(g,sheet('0.',.9));fall.userData.dyn=true;fall.renderOrder=3;scene.add(fall);
  const fall2=new T.Mesh(g,sheet('5.3',.6));fall2.position.set(0,.05,.55);fall2.userData.dyn=true;fall2.renderOrder=4;scene.add(fall2);
  /* churning foam in the pool below */
  const pool=new T.Mesh(new T.CircleGeometry(17,48),fogShader('uniform float t;'+NZ+'void main(){vec2 q=vU-.5;float r=length(q)*2.,an=atan(q.y,q.x);'+
    'float f=wn(vec2(an*5.,r*7.-t*1.3))*.6+wn(vec2(an*11.+t*.2,r*15.-t*2.2))*.4;float k=smoothstep(.35,.8,f)*(1.-smoothstep(.25,1.,r));'+
    'gl_FragColor=vec4(vec3(.93,.97,1.),k*.85);\n#include <fog_fragment>\n}',{t:U.t}));
  pool.rotation.x=-Math.PI/2;pool.position.set(x,.03,WF.z+6);pool.userData.dyn=true;pool.renderOrder=2;scene.add(pool);
  /* clouds of mist rising from the pool */
  const mist=[];for(let i=0;i<12;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:tx('mist.png'),color:0xeef6ff,transparent:true,opacity:0,depthWrite:false}));sp.userData={ph:i/12,ox:rr(7),oz:rr(4)};sp.userData.dyn=true;scene.add(sp);mist.push(sp)}
  const rb=new T.Sprite(new T.SpriteMaterial({map:tx('glare_rainbow.png'),transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false}));rb.scale.set(26,26,1);rb.position.set(x+4,9,WF.z+10);rb.userData.dyn=true;scene.add(rb);
  const rocks=mm(0x45423e,{flatShading:true,roughness:.32,metalness:.1});for(let i=0;i<9;i++){const a=i/9*6.283,r=16+hash2(i,9)*6,s=1.2+hash2(i,8)*2.2,m2=mesh(new T.DodecahedronGeometry(s,0),rocks,x+Math.cos(a)*r,s*.3,WF.z+4+Math.sin(a)*r*.7);m2.rotation.set(i,i*2,0);scene.add(m2)}
  WD.falls={x,z:WF.z,rb,lipH,mist};HIDDEN.push({id:'falls',name:'Zilverval',x,z:WF.z+8,found:false});MAPICON.falls='💦'}
let wfGain=null;
ANIMS.push(dt=>{U.t.value+=dt;const F=WD.falls;if(!F)return;const d=Math.hypot(PL.x-F.x,PL.z-F.z);
  F.rb.material.opacity=.38*(1-ENV.night)*(1-ENV.rain*.7);
  if(F.mist&&d<220)for(const m of F.mist){const u=m.userData;u.ph=(u.ph+dt*.07)%1;const k=u.ph;m.position.set(F.x+u.ox*(1+k),.8+k*14,F.z+6+u.oz+k*4);const sc=6+k*16;m.scale.set(sc,sc,1);m.material.opacity=Math.sin(k*Math.PI)*.32*(1-ENV.night*.5)}
  if(d<160&&!PL.inCave){ps();if(Math.random()<dt*22)pwEm(PSN,F.x+rr(6),1+Math.random()*2,F.z+5+rr(3),rr(1.6),1.2+Math.random()*1.6,1+Math.random()*1.5,3.2,1.4,4.2,[.92,.96,1],[.85,.9,.95],.38,0,.3)}
  try{if(AC&&AC.state==='running'){if(!wfGain){const b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),dd=b.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1;const s=AC.createBufferSource();s.buffer=b;s.loop=true;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=900;wfGain=AC.createGain();wfGain.gain.value=0;s.connect(f);f.connect(wfGain);wfGain.connect(MASTER);s.start()}
    const tg=PL.inCave||!started||paused?0:Math.max(0,1-d/170)*.22;wfGain.gain.value+=(tg-wfGain.gain.value)*Math.min(1,dt*2)}}catch(e){}});

/* ---------- lighthouse on the western island ---------- */
/* a medieval beacon tower on the island: a round stone keep with battlements, a fire basket on top and a guard house */
function buildLighthouse(){const I=ISLES[0],x=I.x+3,z=I.z-2,y=terrainH(x,z),g=new T.Group();g.position.set(x,y,z);scene.add(g);
  const st=MAT.stone,dark=mm(0x2a2420),H=17;
  g.add(mesh(new T.CylinderGeometry(3.4,4,1.2,16),st,0,.6,0));g.add(mesh(new T.CylinderGeometry(2.8,3.3,H,16),st,0,1.2+H/2,0));
  const top=1.2+H;g.add(mesh(new T.CylinderGeometry(3.5,3.1,.8,16),st,0,top+.4,0));
  for(let i=0;i<12;i++){const a=i/12*6.283;if(i%2)continue;g.add(mesh(new T.BoxGeometry(1.1,1.1,.7),st,Math.cos(a)*3.15,top+1.35,Math.sin(a)*3.15)).rotation.y=-a}
  for(let i=0;i<4;i++){const a=i/4*6.283+.4,sl=mesh(new T.BoxGeometry(.35,1.4,.2),new T.MeshBasicMaterial({color:0x0c0a08}),Math.cos(a)*2.95,5+i*3.2,Math.sin(a)*2.95,false);sl.rotation.y=-a+Math.PI/2;g.add(sl)}
  const door=mesh(new T.BoxGeometry(1.6,2.6,.3),MAT.wood,0,2.5,3.15);g.add(door);
  /* the beacon: an iron fire basket with a big flame */
  g.add(mesh(new T.CylinderGeometry(.18,.24,2,8),MAT.iron,0,top+1.8,0));const bk=mesh(new T.CylinderGeometry(1.3,.7,1,10,1,true),MAT.iron,0,top+3.2,0);bk.material=MAT.iron.clone();bk.material.side=T.DoubleSide;g.add(bk);
  const fl=mesh(new T.ConeGeometry(1,2.6,8),new T.MeshBasicMaterial({color:0xff8a2a}),0,top+4.5,0,false);fl.userData.dyn=true;g.add(fl);const fl2=mesh(new T.ConeGeometry(.6,1.8,7),new T.MeshBasicMaterial({color:0xffe08a}),0,top+4.2,0,false);fl2.userData.dyn=true;g.add(fl2);
  lamp(x,y+top+4,z,true);
  /* a small guard house with a thatched roof and two banners */
  const hut=new T.Group();hut.position.set(6.2,0,3.4);hut.add(mesh(new T.BoxGeometry(4.4,2.8,3.6),st,0,1.4,0));const rf=mesh(new T.ConeGeometry(3.5,2,4),MAT.thatch,0,3.8,0);rf.rotation.y=Math.PI/4;hut.add(rf);hut.add(mesh(new T.BoxGeometry(1,1.9,.15),MAT.wood,0,.95,1.85));g.add(hut);
  try{banner(x-4.5,z+3.5,'#2f5a7a','tower',Math.PI/2);banner(x+2,z+6,'#2f5a7a','tower',0)}catch(e){}
  const glow=new T.Sprite(new T.SpriteMaterial({map:tx('glare.png'),color:0xffa040,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));glow.scale.set(16,16,1);glow.position.y=top+4.3;glow.userData.dyn=true;g.add(glow);
  addCircle(x,z,3.6);addCircle(x+6.2,z+3.4,2.6);WD.light={glow,fl,fl2,x,z};HIDDEN.push({id:'light',name:'Bakentoren van Westkaap',x,z,found:false});MAPICON.light='🏰'}
ANIMS.push(dt=>{const L=WD.light;if(!L||Math.abs(PL.x-L.x)>900||Math.abs(PL.z-L.z)>900)return;const t=PL.t,k=Math.max(ENV.night,ENV.rain*.6,ENV.fogx||0);L.glow.material.opacity=.95*Math.max(.12,k);
  L.fl.scale.set(1+Math.sin(t*13)*.1,1+Math.sin(t*9.3)*.18,1+Math.cos(t*11)*.1);L.fl2.scale.set(1+Math.sin(t*15)*.12,1+Math.sin(t*7.7)*.2,1)});

/* ---------- windmills ---------- */
WD.mills=[];
function sailTex(){return canvasTex(64,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(232,222,196,.95)';g.fillRect(6,6,w-12,h-12);g.strokeStyle='#5a4028';g.lineWidth=4;for(let i=0;i<=6;i++){g.beginPath();g.moveTo(6,6+i*(h-12)/6);g.lineTo(w-6,6+i*(h-12)/6);g.stroke()}g.beginPath();g.moveTo(w/2,6);g.lineTo(w/2,h-6);g.stroke()})}
function windmill(x,z,rot){const y=groundH(x,z),g=new T.Group();g.position.set(x,y-.3,z);g.rotation.y=rot;scene.add(g);
  g.add(mesh(new T.CylinderGeometry(2.3,3.1,9.5,8),MAT.plaster,0,4.75,0));g.add(mesh(new T.CylinderGeometry(3.2,3.3,.6,8),MAT.stone,0,.3,0));
  g.add(mesh(new T.BoxGeometry(1.2,2,.3),MAT.dark,0,1,3.05));for(const [wy,wx] of[[5,.9],[7.4,-.6]])g.add(mesh(new T.BoxGeometry(.6,.8,.2),MAT.window,wx,wy,2.75,false));
  g.add(mesh(new T.ConeGeometry(3,3.6,8),MAT.thatch,0,11.3,0));
  const hub=new T.Group();hub.position.set(0,9.6,2.8);hub.userData.dyn=true;g.add(hub);hub.add(mesh(new T.CylinderGeometry(.35,.35,.8,8),MAT.wood,0,0,0).rotateX(Math.PI/2));
  const st=WD.sailT||(WD.sailT=sailTex()),sm=new T.MeshStandardMaterial({map:st,transparent:true,alphaTest:.3,side:T.DoubleSide,roughness:.9});
  for(let i=0;i<4;i++){const arm=new T.Group();arm.rotation.z=i*Math.PI/2;hub.add(arm);arm.add(mesh(new T.BoxGeometry(.22,8.2,.16),MAT.wood,0,4.2,.3));const sl=mesh(new T.PlaneGeometry(1.7,6.4),sm,.95,4.9,.32,false);arm.add(sl)}
  addCircle(x,z,3.3);WD.mills.push(hub)}
ANIMS.push(dt=>{const w=.55+ENV.rain*.5+(ENV.weather==='storm'?.6:0);for(const h of WD.mills)if(Math.abs(h.parent.position.x-PL.x)<400&&Math.abs(h.parent.position.z-PL.z)<400)h.rotation.z+=dt*w});

/* ---------- banners that wave in the wind ---------- */
function bannerTex(col,emb){return canvasTex(128,256,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,0,w,14);g.fillStyle='#e0b04a';g.fillRect(0,h-22,w,6);
  g.beginPath();g.moveTo(0,h-14);for(let i=0;i<=8;i++)g.lineTo(i*w/8,h-(i%2?0:14));g.lineTo(w,h-14);g.fill();g.save();g.translate(w/2,h*.42);g.fillStyle='#f3d27a';g.strokeStyle='#5a3a10';g.lineWidth=3;
  if(emb==='oak'){g.beginPath();g.ellipse(0,-6,22,30,0,0,6.283);g.fill();g.stroke();g.fillRect(-4,20,8,20);g.strokeRect(-4,20,8,20)}
  else if(emb==='falcon'){g.beginPath();g.moveTo(0,-34);g.lineTo(10,-10);g.lineTo(40,-18);g.lineTo(14,6);g.lineTo(8,34);g.lineTo(0,18);g.lineTo(-8,34);g.lineTo(-14,6);g.lineTo(-40,-18);g.lineTo(-10,-10);g.closePath();g.fill();g.stroke()}
  else{g.fillStyle='#e8eef4';g.fillRect(-16,-24,32,50);g.strokeRect(-16,-24,32,50);for(let i=0;i<3;i++){g.fillRect(-20+i*16,-34,9,12);g.strokeRect(-20+i*16,-34,9,12)}g.fillStyle='#2a3440';g.fillRect(-5,8,10,18)}
  g.restore()})}
function wavyMat(map){const m=new T.MeshStandardMaterial({map,side:T.DoubleSide,roughness:.9});m.onBeforeCompile=sh=>{sh.uniforms.uTime=WIND;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat k=clamp(.5-position.y/3.4,0.,1.);transformed.z+=sin(uTime*3.1+position.y*2.2+position.x*1.3)*.22*k+sin(uTime*5.3+position.y*4.)*.06*k;')};m.customProgramCacheKey=()=>'wavy';return m}
const BMAT={};
WD.banner=(...a)=>banner(...a);
function banner(x,z,col,emb,rot=0){const y=groundH(x,z),k=col+emb,mt=BMAT[k]||(BMAT[k]=wavyMat(bannerTex(col,emb)));
  scene.add(mesh(new T.CylinderGeometry(.08,.11,6.6,6),MAT.wood,x,y+3.3,z));const cb=mesh(new T.BoxGeometry(1.6,.1,.1),MAT.wood,x,y+6.3,z);cb.rotation.y=rot;scene.add(cb);
  scene.add(mesh(new T.SphereGeometry(.14,8,6),MAT.gold,x,y+6.7,z,false));
  const cl=new T.Mesh(new T.PlaneGeometry(1.4,3.4,6,14),mt);cl.position.set(x,y+4.55,z);cl.rotation.y=rot;cl.castShadow=true;cl.userData.dyn=true;scene.add(cl);addCircle(x,z,.18)}
function gateBanners(site,col,emb){const s=SITE[site];if(!s)return;
  for(const r of ROADS){for(const end of[0,1]){const p=end?r.pts[r.pts.length-1]:r.pts[0],q=end?r.pts[r.pts.length-2]:r.pts[1];if(Math.hypot(p[0]-s.x,p[1]-s.z)>s.r*.9)continue;
    const dx=q[0]-p[0],dz=q[1]-p[1],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L;let bx=p[0],bz=p[1];for(let t=0;t<L;t+=2){bx=p[0]+ux*t;bz=p[1]+uz*t;if(Math.hypot(bx-s.x,bz-s.z)>s.r*.82)break}
    const rot=Math.atan2(ux,uz);for(const sd of[-1,1]){const wx=bx-uz*sd*(r.w+2.6),wz=bz+ux*sd*(r.w+2.6);const q2={x:wx,z:wz};if(!collide(q2,.4)&&terrainH(wx,wz)>.8)banner(wx,wz,col,emb,rot)}}}}

/* ---------- watchtowers along the roads ---------- */
function watchtower(x,z){const y=groundH(x,z);tower(x,z,2.3,10.5,true,MAT.stone);const L=lamp(x+2.9,y+7.5,z,true);
  const pole=mesh(new T.CylinderGeometry(.06,.06,3.2,5),MAT.wood,x,y+15.2,z);scene.add(pole);
  const fl=new T.Mesh(new T.PlaneGeometry(1.5,.9,8,4),BMAT.flag||(BMAT.flag=wavyFlag()));fl.position.set(x+.78,y+16.3,z);fl.userData.dyn=true;scene.add(fl)}
function wavyFlag(){const m=new T.MeshStandardMaterial({map:canvasTex(64,40,(g,w,h)=>{g.fillStyle='#9a1f1f';g.fillRect(0,0,w,h);g.fillStyle='#e0b04a';g.fillRect(0,h/2-4,w,8);g.fillRect(w/3-4,0,8,h)}),side:T.DoubleSide});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=WIND;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat k=clamp(position.x/1.5+.5,0.,1.);transformed.z+=sin(uTime*6.+position.x*4.)*.18*k;')};m.customProgramCacheKey=()=>'flag';return m}

/* ---------- fields of wheat ---------- */
function wheatGeo(){const a=new T.PlaneGeometry(.55,1.15),b=a.clone();a.translate(0,.57,0);b.translate(0,.57,0);b.rotateY(Math.PI/2);
  const g=new T.BufferGeometry(),pa=Array.from(a.attributes.position.array).concat(Array.from(b.attributes.position.array));g.setAttribute('position',new T.Float32BufferAttribute(pa,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(Array.from(a.attributes.uv.array).concat(Array.from(b.attributes.uv.array)),2));g.setAttribute('normal',new T.Float32BufferAttribute(new Array(24).fill(0).map((_,i)=>i%3===1?1:0),3));
  g.setIndex(Array.from(a.index.array).concat(Array.from(a.index.array,i=>i+4)));return g}
function wheatTex(){const t=canvasTex(64,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<16;i++){const x=3+i*3.8+Math.random()*2,t=14+Math.random()*20;g.strokeStyle=['#b89a42','#c9a94e','#a88a3a'][i%3];g.lineWidth=3.6;g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+rr(4),h*.5,x+rr(3),t+10);g.stroke();
  g.fillStyle=['#e8c860','#d9b450','#f0d478'][i%3];g.beginPath();g.ellipse(x+rr(2),t,4.6,12,rr(.2),0,6.283);g.fill()}});
  /* see-through pixels get the colour of the wheat, so far away the ears never get dark edges */
  const c=t.image,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,w=c.width,h=c.height,o=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=((h-1-y)*w+x)*4,j=(y*w+x)*4,a=d[i+3];if(a<40){o[j]=196;o[j+1]=166;o[j+2]=84;o[j+3]=a}else{o[j]=d[i];o[j+1]=d[i+1];o[j+2]=d[i+2];o[j+3]=a}}
  const dt=new T.DataTexture(o,w,h,T.RGBAFormat);dt.magFilter=T.LinearFilter;dt.minFilter=T.LinearMipmapLinearFilter;dt.generateMipmaps=true;dt.needsUpdate=true;return dt}
function fields(){const list=[];
  for(const [id,n] of[['farm',5],['hamlet',4],['village',4],['town',2]]){const s=SITE[id];if(!s)continue;let made=0;
    for(let k=0;k<70&&made<n;k++){const a=srnd()*6.283,r=s.r+16+srnd()*46,cx=s.x+Math.cos(a)*r,cz=s.z+Math.sin(a)*r,w=16+srnd()*12,d=11+srnd()*8,rot=srnd()*Math.PI;
      if(list.some(f=>Math.hypot(f.x-cx,f.z-cz)<(f.w+w)*.62))continue;let ok=true;const c=Math.cos(rot),sn=Math.sin(rot);
      for(const [u,v] of[[0,0],[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5],[0,.5],[0,-.5],[.5,0],[-.5,0]]){const x=cx+u*w*c-v*d*sn,z=cz+u*w*sn+v*d*c;if(!spotOK(x,z,2.2)||forestDensity(x,z)>.05){ok=false;break}}
      if(!ok)continue;list.push({x:cx,z:cz,w,d,rot});made++}}
  if(!list.length)return;let N=0;for(const f of list)N+=(Math.ceil(f.w/.5)+1)*(Math.ceil(f.d/.5)+1);
  const m=new T.MeshLambertMaterial({map:wheatTex(),alphaTest:.45,side:T.DoubleSide});addWind(m,.05);
  const im=new T.InstancedMesh(wheatGeo(),m,N),dm=new T.Object3D(),col=new T.Color(),posts=[],rails=[];let k=0;im.frustumCulled=false;
  for(const f of list){const c=Math.cos(f.rot),sn=Math.sin(f.rot);for(let u=-f.w/2;u<f.w/2;u+=.5)for(let v=-f.d/2;v<f.d/2;v+=.5){const x=f.x+u*c-v*sn+rr(.18),z=f.z+u*sn+v*c+rr(.18);
      dm.position.set(x,groundH(x,z)-.05,z);dm.rotation.set(0,srnd()*6.283,0);const s=.85+srnd()*.4;dm.scale.set(s,s*(.9+srnd()*.3),s);dm.updateMatrix();im.setMatrixAt(k,dm.matrix);col.setHSL(.12+srnd()*.03,.55,.55+srnd()*.15);im.setColorAt(k,col);k++}
    /* a low fence around each field (posts and rails go into one instanced mesh each) */
    for(const [ax,az,bx,bz] of[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]]){const P=(u,v)=>[f.x+u*f.w/2*c-v*f.d/2*sn,f.z+u*f.w/2*sn+v*f.d/2*c],A=P(ax,az),B=P(bx,bz),L=Math.hypot(B[0]-A[0],B[1]-A[1]),ry=-Math.atan2(B[1]-A[1],B[0]-A[0]);
      for(let t=0;t<=L;t+=2.4){const x=A[0]+(B[0]-A[0])*t/L,z=A[1]+(B[1]-A[1])*t/L;posts.push([x,groundH(x,z)+.45,z])}
      for(let t=0;t<L;t+=2.4){const t2=Math.min(L,t+2.4),x=A[0]+(B[0]-A[0])*(t+t2)/2/L,z=A[1]+(B[1]-A[1])*(t+t2)/2/L;rails.push([x,groundH(x,z)+.75,z,ry,t2-t])}}}
  im.count=k;im.frustumCulled=false;im.receiveShadow=true;scene.add(im);WD.fields=list;
  const pi=new T.InstancedMesh(new T.BoxGeometry(.12,.9,.12),MAT.wood,posts.length),ri=new T.InstancedMesh(new T.BoxGeometry(1,.08,.06),MAT.wood,rails.length);
  posts.forEach(([x,y,z],i)=>{dm.position.set(x,y,z);dm.rotation.set(0,0,0);dm.scale.set(1,1,1);dm.updateMatrix();pi.setMatrixAt(i,dm.matrix)});
  rails.forEach(([x,y,z,ry,l],i)=>{dm.position.set(x,y,z);dm.rotation.set(0,ry,0);dm.scale.set(l,1,1);dm.updateMatrix();ri.setMatrixAt(i,dm.matrix)});
  for(const m of[pi,ri]){m.castShadow=m.receiveShadow=true;scene.add(m)}}

/* ---------- a sailing ship along the coast ---------- */
function buildShip(){const g=new T.Group();g.userData.dyn=true;scene.add(g);const wd=mm(0x5a3a22),dk=mm(0x3a2414);
  const hull=new T.BoxGeometry(3.4,1.8,12,2,1,6),p=hull.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i),y=p.getY(i);let k=1;if(z>2)k=1-(z-2)/4*.9;if(z<-4)k=1-(-4-z)/2*.25;p.setX(i,p.getX(i)*k*(y<0?.75:1));if(z>4)p.setY(i,y+(z-4)*.25)}hull.computeVertexNormals();
  g.add(mesh(hull,wd,0,.4,0));g.add(mesh(new T.BoxGeometry(3,.12,9),dk,0,1.25,-.5));g.add(mesh(new T.BoxGeometry(2.8,1.4,2.4),wd,0,2,-4.6));
  for(const [mz,mh] of[[1.2,11],[-2.6,8]]){g.add(mesh(new T.CylinderGeometry(.14,.18,mh,6),dk,0,1+mh/2,mz));
    const sl=new T.Mesh(new T.PlaneGeometry(4.6,mh*.55,4,4),new T.MeshStandardMaterial({map:canvasTex(64,64,(c,w,h)=>{c.fillStyle='#ece2c8';c.fillRect(0,0,w,h);c.fillStyle='#9a1f1f';c.fillRect(w/2-6,0,12,h);c.fillRect(0,h/2-6,w,12)}),side:T.DoubleSide,roughness:.9}));
    const ps2=sl.geometry.attributes.position;for(let i=0;i<ps2.count;i++)ps2.setZ(i,(1-Math.pow(ps2.getX(i)/2.3,2))*.7);sl.geometry.computeVertexNormals();sl.position.set(0,2.2+mh*.5,mz+.3);g.add(sl)}
  WD.ship={g,a:120,dir:1}}
ANIMS.push(dt=>{const S=WD.ship;if(!S)return;S.a+=dt*.32*S.dir;if(S.a>176)S.dir=-1;if(S.a<96)S.dir=1;const a=S.a*D2R,c=Math.cos(a),s=Math.sin(a),r=ring(COAST,S.a)+240,x=c*r,z=s*r;
  S.g.position.set(x,-.2+Math.sin(PL.t*.9)*.15,z);S.g.rotation.y=Math.atan2(-s*S.dir,c*S.dir);S.g.rotation.z=Math.sin(PL.t*.7)*.05;S.g.rotation.x=Math.sin(PL.t*.53)*.03});

/* ---------- the lake of the Wise Old Tree: a wooden causeway and a rowing boat ---------- */
function buildCauseway(){
  /* the island belongs to the Wise Old Tree alone: no forest on it or in the lake */
  for(const t of TREES.oak.concat(TREES.pine)){if(t.cut)continue;const d=Math.hypot(t.x-LAKE.x,t.z-LAKE.z);if(d<LAKE.isl+3||(d<LAKE.r+3&&terrainH(t.x,t.z)<1.2)){t.cut=true;t.gone=true;if(t.col)t.col.off=true;setInst(t.ii||[],false,[])}}
  for(const q of ROCKS){if(q.cut||Math.hypot(q.x-LAKE.x,q.z-LAKE.z)>LAKE.isl+3)continue;q.cut=true;if(q.col)q.col.off=true;if(q.inst){q.inst.setMatrixAt(q.i,new T.Matrix4().makeScale(0,0,0));q.inst.instanceMatrix.needsUpdate=true}}
  const b=bridges[bridges.length-1],y=b.y,x0=b.x-b.hx,x1=b.x+b.hx,z=b.z;
  scene.add(mesh(new T.BoxGeometry(x1-x0,.22,3.1),MAT.wood,b.x,y-.12,z));for(let x=x0+1;x<x1;x+=1.1)scene.add(mesh(new T.BoxGeometry(.08,.05,3.1),MAT.dark,x,y,z,false));
  for(let x=x0+1;x<=x1-1;x+=4)for(const s of[-1,1]){scene.add(mesh(new T.CylinderGeometry(.13,.15,y+3.6,6),MAT.wood,x,(y-3.6)/2+.3,z+s*1.45));scene.add(mesh(new T.CylinderGeometry(.06,.06,.9,5),MAT.wood,x,y+.45,z+s*1.45))}
  for(const s of[-1,1]){const rl=mesh(new T.BoxGeometry(x1-x0-1,.08,.08),MAT.wood,b.x,y+.85,z+s*1.45);scene.add(rl);addBox(x0+.6,z+s*1.45-.1,x1-.6,z+s*1.45+.1)}
  lamp(x1-.5,y+1.4,z+1.6);lamp(x0+.5,y+1.4,z-1.6);
  const bt=new T.Group(),hb=new T.BoxGeometry(1.3,.5,3.6,1,1,4),p=hb.attributes.position;for(let i=0;i<p.count;i++){const zz=p.getZ(i);if(Math.abs(zz)>1)p.setX(i,p.getX(i)*(1-(Math.abs(zz)-1)/1.8*.85))}hb.computeVertexNormals();
  bt.add(mesh(hb,mm(0x6a4a2a),0,0,0));bt.position.set(LAKE.x+LAKE.r-8,.05,LAKE.z+16);bt.rotation.y=.6;bt.userData.dyn=true;scene.add(bt);WD.boat=bt}
ANIMS.push(()=>{if(WD.boat)WD.boat.position.y=.02+Math.sin(PL.t*1.1)*.05});

/* ---------- waystones stand on rune platforms and shine when they are active ---------- */
WD.ways=[];
const _bwsW=buildWaystones;buildWaystones=function(){_bwsW();if(!geo('Portal_StonePlatform'))return;
  const pt=tx('plat_blue.jpg'),pm=new T.MeshStandardMaterial({map:pt,emissiveMap:pt,emissive:0x4aa0ff,emissiveIntensity:.25,roughness:.85});
  for(const w of WAYS){const y=groundH(w.x,w.z),pl=new T.Mesh(geo('Portal_StonePlatform'),pm);pl.scale.set(.2,.22,.2);pl.position.set(w.x,y-.52,w.z);pl.receiveShadow=true;scene.add(pl);
    const ru=new T.Mesh(new T.PlaneGeometry(7.4,7.4),addM(tx('rune_magic.png'),0x74c0ff,.25));ru.rotation.x=-Math.PI/2;ru.position.set(w.x,y+.12,w.z);ru.userData.dyn=true;scene.add(ru);
    const bm=new T.Sprite(new T.SpriteMaterial({map:tx('rise_blue.png'),transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));bm.scale.set(4.5,16,1);bm.position.set(w.x,y+8,w.z);bm.userData.dyn=true;scene.add(bm);
    WD.ways.push({w,ru,bm})}};
ANIMS.push(dt=>{for(const q of WD.ways){if(Math.abs(q.w.x-PL.x)>260||Math.abs(q.w.z-PL.z)>260)continue;q.ru.rotation.z+=dt*(q.w.on?.35:.05);q.ru.material.opacity=q.w.on?.85+Math.sin(PL.t*2)*.12:.22;q.bm.material.opacity=q.w.on?.55+Math.sin(PL.t*1.4)*.15:0}});

/* ---------- fireflies at night, sparks over the lake ---------- */
ANIMS.push(dt=>{if(!started||PL.inCave||ENV.night<.45||ENV.rain>.5)return;ps();const n=dt*14*ENV.night;for(let i=0;i<n;i++){const a=Math.random()*6.283,r=6+Math.random()*34,x=PL.x+Math.cos(a)*r,z=PL.z+Math.sin(a)*r,h=terrainH(x,z);if(h<.6||h>60)continue;
  const c=Math.random()<.5?[.85,1,.35]:[1,.9,.4];pwEm(PSA,x,h+.4+Math.random()*2,z,rr(.5),rr(.25),rr(.5),3+Math.random()*3,.1,.06,c,c,1,0,.1)}});
ANIMS.push(dt=>{if(PSN){pwPSUpdate(PSN,dt);pwPSUpdate(PSA,dt)}});

/* ---------- build everything with the rest of the fantasy world ---------- */
const _bfW=buildFantasy;buildFantasy=function(){_bfW();
  for(const [n,f] of[['waterval',buildFalls],['bakentoren',buildLighthouse],['dijk naar de Wijze Boom',buildCauseway],['schip',buildShip],['velden',fields]]){try{f()}catch(e){console.warn('world '+n,e)}}
  try{const mk=(id,a0,a1,r0,r1,rot)=>{const s=SITE[id];if(!s)return;const p=findSpot(s.x,s.z,s.r+r0,s.r+r1,4);if(p)windmill(p[0],p[1],rot)};mk('farm',0,6.28,8,40,1.2);mk('hamlet',0,6.28,6,36,-.6);mk('village',0,6.28,12,45,2.4)}catch(e){console.warn('windmills',e)}
  try{for(const [ri,f] of[[0,.42],[1,.55],[9,.5],[15,.5],[2,.6],[20,.5]]){const r=ROADS[ri];if(!r)continue;const P=r.pts,i=Math.min(P.length-2,Math.floor(f*(P.length-1))),t=f*(P.length-1)-i,x=P[i][0]+(P[i+1][0]-P[i][0])*t,z=P[i][1]+(P[i+1][1]-P[i][1])*t;
      const dx=P[i+1][0]-P[i][0],dz=P[i+1][1]-P[i][1],L=Math.hypot(dx,dz)||1;for(const sd of[1,-1]){const tx2=x-dz/L*sd*(r.w+9),tz=z+dx/L*sd*(r.w+9);if(spotOK(tx2,tz,3.4)){watchtower(tx2,tz);break}}}}catch(e){console.warn('towers',e)}
  try{gateBanners('village','#2f6a3a','oak');gateBanners('castle','#8a1f2a','falcon');gateBanners('town','#2f4a7a','tower')}catch(e){console.warn('banners',e)}};

/* ---------- cinematic shots ---------- */
const V=(x,y,z)=>new T.Vector3(x,y,z);
function showAll(){for(const b of BUILDINGS)b.group.visible=true}
/* the spawn flyover: three beautiful places (without names on screen), then the whole land from above, then down to you */
const capEl=document.createElement('div');capEl.id='wdcap';capEl.style.cssText='position:fixed;left:6vw;bottom:calc(12vh + 22px);z-index:41;pointer-events:none;font-family:var(--f-display);font-size:clamp(22px,3.4vw,42px);color:#ffe6b0;letter-spacing:.08em;text-shadow:0 0 18px rgba(0,0,0,.9),0 3px 12px #000;opacity:0;transition:opacity .35s,transform .35s;transform:translateX(-14px)';document.body.appendChild(capEl);
let capNow='';function capt(s){if(s===capNow)return;capNow=s;if(s){capEl.textContent=s;capEl.style.opacity=1;capEl.style.transform='none'}else{capEl.style.opacity=0;capEl.style.transform='translateX(-14px)'}}
WD.flyover=function(){if(typeof cinematic!=='function'||CIN.on||PL.inCave||PL.x<-2000)return;showAll();
  const P=V(PL.x,PL.y+1.6,PL.z),g=(x,z,dy)=>Math.max(0,terrainH(x,z))+dy,L=LAKE,F=WD.falls||{x:WF.x,z:WF.z,lipH:90},G=SITE.giant;
  /* [camera point, what it looks at, name on screen, seconds to the next point] */
  const K=[
    [V(PL.x+40,38,PL.z+70),V(L.x,10,L.z),'',2.2],
    [V(L.x+72,22,L.z-28),V(L.x,g(L.x,L.z,9),L.z),'',3.2],
    [V(G.x-32,g(G.x-32,G.z-72,24),G.z-72),V(G.x,g(G.x,G.z,8),G.z),'',3.6],
    [V(F.x+45,g(F.x+45,F.z+120,40),F.z+120),V(F.x,F.lipH*.55,F.z-20),'',3.2],
    [V(20,1500,190),V(10,0,80),'',2.8],
    [V(0,1440,110),V(0,0,20),'',2.4],
    [V(PL.x+50,PL.y+80,PL.z+110),V(PL.x,PL.y+2,PL.z),'',1.7],
    [V(PL.x+3,PL.y+3.4,PL.z+8),P,'',0]];
  const T0=[0];for(let i=0;i<K.length-1;i++)T0.push(T0[i]+K[i][3]);
  const pos=new T.CatmullRomCurve3(K.map(k=>k[0]),false,'centripetal'),look=new T.CatmullRomCurve3(K.map(k=>k[1]),false,'centripetal'),D=T0[T0.length-1];
  WD.fly={pos,look,D,T0,n:K.length,lab:K.map(k=>k[2]),top:[T0[4]-.6,T0[5]+1.6],last:null};
  try{sfx('swing')}catch(e){}
  cinematic([{from:camera.position.clone(),to:camera.position.clone(),lf:P,lt:P,d:D}],'','',()=>{WD.fly=null;camera.fov=SET.fov;camera.updateProjectionMatrix();capt('');const t=document.getElementById('cinet');if(t)t.style.opacity=0})};
WD.intro=WD.flyover;
function flyCam(dt){const F=WD.fly,tm=Math.max(0,Math.min(CIN.t||0,F.D-1e-4));let i=0;while(i<F.n-2&&tm>=F.T0[i+1])i++;
  const s=(tm-F.T0[i])/Math.max(.01,F.T0[i+1]-F.T0[i]),e=s*.45+s*s*(3-2*s)*.55,t=Math.min(1,Math.max(0,(i+e)/(F.n-1))),p=F.pos.getPoint(t),l=F.look.getPoint(t);
  const floor=(p.x<-2000?0:Math.max(0,terrainH(p.x,p.z)))+(t>.97?1.2:7);if(p.y<floor)p.y=floor;camera.position.copy(p);camera.lookAt(l);
  /* far up the haze would hide the land: thin it out with the height */
  if(scene.fog&&scene.fog.density)scene.fog.density*=Math.max(.05,1-Math.max(0,p.y-120)/420);
  const sp=F.last?F.last.distanceTo(p)/Math.max(.001,dt):0;F.last=p.clone();camera.fov+=((SET.fov+Math.min(18,sp*.05))-camera.fov)*Math.min(1,dt*3);camera.updateProjectionMatrix();
  let lb='';for(let k=1;k<4;k++)if(F.lab[k]&&tm>F.T0[k]-1.1&&tm<F.T0[k]+1.2)lb=F.lab[k];capt(lb);
  const ct=document.getElementById('cinet'),onTop=tm>F.top[0]&&tm<F.top[1];if(ct){if(onTop&&!F.titled){F.titled=1;ct.innerHTML='<h1>Eikenland</h1><p>Een koninkrijk tussen de bergen en de zee</p>'}ct.style.opacity=onTop?1:0}}
const FLAV={town:'De rijke handelsstad aan de rivier',castle:'Zetel van Heer Valkenhorst',ruins:'Hier woont de Skeletkoning',camp:'Hier hoort niemand je roepen',hamlet:'Een rustig gehucht tussen de velden',farm:'Waar de molens draaien',dragon:'Onder de eeuwige sneeuw slaapt de Draakmoeder',elf:'Het bos dat zingt',life:'Water dat geneest',swamp:'Hier wonen trollen en een heks',stones:'Ze dromen. Maak ze niet wakker.',treants:'De bomen lopen hier',crystal:'Een kloof vol licht',giant:'De poort naar het Demonenrijk',depths:'Wie afdaalt, keert zelden terug',cave:'Iets ademt in het donker'};
const FLAVH={tree:'Hij weet alles wat de wind hem vertelt',falls:'Waar de rivier uit de bergen springt',light:'Het licht dat de schepen thuisbrengt',wreck:'Het schip dat nooit meer zal varen',ribs:'Een reus die hier ooit stierf',unicorn:'Wie stil is, ziet ze grazen',fairy:'Dans hier bij maanlicht',well:'Een wens kost vijfentwintig goud',witch:'Klop maar aan, als je durft',mushroom:'Paddenstoelen zo groot als huizen',hermit:'Een man die liever alleen is'};
function shot(x,y,z,h,name,sub){if(typeof cinematic!=='function'||CIN.on)return;showAll();const a=Math.atan2(PL.z-z,PL.x-x),R=h+26;
  cinematic([{from:V(x+Math.cos(a)*R,y+h*.55+9,z+Math.sin(a)*R),to:V(x+Math.cos(a+.75)*R*.82,y+h*.45+6,z+Math.sin(a+.75)*R*.82),lf:V(x,y+h*.25+2,z),lt:V(x,y+h*.25+2,z),d:3.6}],name,sub||'')}
WD.seen=null;let seenT=0;
ANIMS.push(dt=>{if(!started||PL.dead||PL.inCave||(window.CIN&&CIN.on))return;seenT-=dt;if(seenT>0)return;seenT=.5;
  if(!WD.seen){WD.seen=new Set([...Object.keys(PL.discovered).filter(k=>PL.discovered[k]),...HIDDEN.filter(h=>h.found).map(h=>'h:'+h.id)]);return}
  const busy=actors.some(a=>a.kind==='enemy'&&!a.dead&&a.state==='chase'&&Math.hypot(a.x-PL.x,a.z-PL.z)<45);
  for(const s of SITES){if(!PL.discovered[s.id]||WD.seen.has(s.id))continue;WD.seen.add(s.id);if(busy||!FLAV[s.id])continue;shot(s.x,s.h,s.z,s.r*.5+10,s.name,FLAV[s.id]);return}
  for(const h of HIDDEN){if(!h.found||WD.seen.has('h:'+h.id))continue;WD.seen.add('h:'+h.id);if(busy)continue;shot(h.x,terrainH(h.x,h.z),h.z,h.id==='light'?22:h.id==='falls'?40:14,h.name,FLAVH[h.id]);return}});
/* during a shot the sky follows the camera, not the player */
/* ...and characters near the camera are shown and keep moving, even when they are far from the player (like the Reuzen-Vierhand in the flyover) */
const _ucW=updateCamera;updateCamera=function(dt){_ucW(dt);if(!(window.CIN&&CIN.on))return;if(WD.fly)flyCam(dt);const cx=camera.position.x,cz=camera.position.z;skyDome.position.set(cx,0,cz);stars.position.set(cx,0,cz);
  for(const a of actors){if(a.dead||!a.root||a.inHome)continue;if(Math.abs(a.x-cx)>340||Math.abs(a.z-cz)>340)continue;a.root.visible=true;const m=a.model||a.h;if(m&&m.mixer&&dt>0)m.mixer.update(dt)}};
/* the flyover only plays when you start a new game, not when you continue a saved one */
const _sgW=startGame;startGame=function(cls,save){_sgW(cls,save);WD.seen=null;PL.fx=PL.fx||{};if(save&&save.PL)return;PL.fx.seenIntro=1;let n=0;const go=()=>{const r=document.getElementById('pwroll');if(!started||(r&&r.offsetParent)||(window.CIN&&CIN.on)){if(++n<300)setTimeout(go,300);return}try{WD.flyover()}catch(e){console.warn(e)}};setTimeout(go,900)};

/* ---------- the sea is too wild far from the coast ---------- */
let seaMsg=0;const _upW=updatePlayer;updatePlayer=function(dt){_upW(dt);if(PL.inCave||PL.dead)return;seaMsg-=dt;
  if(WD.inSea(PL.x,PL.z)&&!ISLES.some(I=>Math.hypot(PL.x-I.x,PL.z-I.z)<I.r+60)){const r=Math.hypot(PL.x,PL.z)||1;PL.x-=PL.x/r*6*dt;PL.z-=PL.z/r*6*dt;if(seaMsg<=0){seaMsg=6;addLog('De golven zijn hier te woest. De zee duwt je terug naar de kust.','#9fd0ff')}}};

/* ---------- a soft cinematic vignette over the screen ---------- */
{const v=document.createElement('div');v.id='wdvig';v.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 58%,rgba(10,6,2,.38) 100%)';document.body.appendChild(v)}
})();
