/* ================= Noordheim: a second, snowbound world =================
   Beyond the mountains of Eikendal lies Noordheim: a land of snow and ice as
   large as Eikendal, with snowy pine forests, a frozen lake, the Nordic village of Ysdal, the northern lights at night
   and falling snow. Five places each hold a boss:
     De IJsburcht      - IJsreus Hrimtor, a frost giant whose slam freezes you (drops the Frost Heart and the Ice Shield)
     Het Wolvenhol     - Wolvenkoning Fenrik, a giant white wolf who calls his pack
     De Runenkring     - De Rijpkoning, a skeleton king who raises the dead
     De Gletsjertop    - IJsdraak Glacius, an ice dragon (fights like Vyrnax)
     De Stormvlakte    - Zefyr de Stormloper, faster than the wind; he drops the four pieces of the Stormloper set,
                         and wearing all four makes you super fast.
   You get there on foot: the Noordpas, a path at the foot of the mountains, climbs through a narrow gorge into a
   snowstorm, and on the other side of the storm a second gorge leads down into Noordheim. The world lies at x -40000;
   in the middle of the storm both gorges look exactly the same, so you walk from one into the other without noticing.
   It is built when you first come near the pass. */
(function(){
const X2=-40000,Z2=0,RW=880,NH=50,rr=(a=1)=>(Math.random()*2-1)*a,inN=x=>x<-30000;
const busy=t=>{let d=$('exload');if(!d){d=document.createElement('div');d.id='exload';document.body.appendChild(d)}if(t===false){d.style.display='none';return}d.textContent=t;d.style.display='grid'};
const N={blds:[],built:false,g:null,trees:[],tv:[],last:{x:1e9,z:1e9},flakes:null,aur:[],was:false,hidden:[]};WD.north=N;
const W=(lx,lz)=>[X2+lx,Z2+lz];
const P={gate:{x:0,z:690,r:26,h:9,n:'De Noordpas'},ysdal:{x:-120,z:250,r:62,h:7,n:'Ysdal'},castle:{x:430,z:280,r:64,h:26,n:'De IJsburcht'},
  runes:{x:-420,z:-300,r:38,h:11,n:'De Runenkring'},den:{x:-560,z:150,r:32,h:10,n:'Het Wolvenhol'},glacier:{x:300,z:-540,r:52,h:38,n:'De Gletsjertop'},storm:{x:-170,z:-540,r:64,h:6,n:'De Stormvlakte'}};
const LK={x:80,z:-60,r:140};
const CF=(()=>{const l=Math.hypot(P.castle.x,P.castle.z);return{x:-P.castle.x/l,z:-P.castle.z/l}})();   /* the castle gate looks towards the middle of Noordheim */
/* ---------- De Noordpas: two gorges that meet in the middle of a snowstorm ----------
   Each gorge has its own frame: o is the middle of the storm, u points towards Noordheim, n across the path.
   s runs along the path (0 = middle of the storm), w across it. */
const PW_=16,PZ=30,PLN=140,PASS={L:150,h0:10,hv:59,ok:false};let PH=80;
const frame=(ox,oz,ux,uz)=>({ox,oz,ux,uz,nx:uz,nz:-ux,th:Math.atan2(ux,uz)});
const FN=frame(X2,Z2+830,0,-1);let FM=null;
const loc=(F,x,z)=>{const dx=x-F.ox,dz=z-F.oz;return[dx*F.ux+dz*F.uz,dx*F.nx+dz*F.nz]};
const wld=(F,s,w)=>[F.ox+F.ux*s+F.nx*w,F.oz+F.uz*s+F.nz*w];
const fM=s=>{if(s>=-PZ)return PH;const t=Math.max(0,(s+PASS.L)/(PASS.L-PZ));return lerp(PASS.h0,PH,t*t*(3-2*t)*.3+t*.7)};   /* Eikendal: up from the foot of the mountains */
const fN=s=>s<=PZ?PH:lerp(PH,PASS.hv,smooth(PZ,PLN,s));          /* Noordheim: down into the valley */
/* a flat floor with walls of rock beside it; an open end fades into the land, a closed end becomes rock */
function carve(h,s,w,f,s0,s1,openStart,openEnd){let k=1,end=0;
  if(s<s0){if(openStart)k=1-smooth(0,26,s0-s);else end=s0-s}
  if(s>s1){if(openEnd)k=1-smooth(0,26,s-s1);else end=s-s1}
  if(k<=0)return h;const lat=Math.max(0,Math.abs(w)-PW_/2-2.5)+end*1.4,up=wallUp(lat);
  const c=lat<=0?f:h>f?smin(h,f+up,7):Math.max(h,f-lat*1.2);return lerp(h,c,k)}
/* the shape of the gorge walls: a gentle foot, then steep rock; and its inverse (how far out the wall is at a height) */
const wallUp=lat=>lat<4?lat*lat*.25:4+(lat-4)*1.8,wallOut=y=>y<=0?0:y<4?2*Math.sqrt(y):4+(y-4)/1.8;
const smin=(a,b,k)=>{const q=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-q*q*k*.25};
function carveM(x,z,h){if(!FM)return h;const [s,w]=loc(FM,x,z);if(s<-PASS.L-40||s>PZ+40||Math.abs(w)>95)return h;return carve(h,s,w,fM(Math.max(-PASS.L,Math.min(PZ,s))),-PASS.L,PZ,true,false)}
function carveN(x,z,h){const [s,w]=loc(FN,x,z);if(s<-PZ-40||s>PLN+40||Math.abs(w)>95)return h;return carve(h,s,w,fN(Math.max(-PZ,Math.min(PLN,s))),-PZ,PLN,false,true)}
const inGorge=(F,x,z,s0,s1,ww)=>{if(!F)return false;const [s,w]=loc(F,x,z);return s>s0&&s<s1&&Math.abs(w)<ww};
/* ---------- the land ---------- */
function H2(x,z){return carveN(x,z,H2raw(x,z))}
function H2raw(x,z){const u=x-X2,v=z-Z2,r=Math.hypot(u,v);
  let h=16*fbm(u*.0035+50,v*.0035+50,4)+7*fbm(u*.011+9,v*.011-3,3)-6;
  const mr=RW-130+60*(fbm(u*.004+3,v*.004+8,2)-.5);h+=smooth(mr,mr+150,r)*(130+90*fbm(u*.009+3,v*.009+7,3));
  for(const k in P){const s=P[k],d=Math.hypot(u-s.x,v-s.z),R=s.r*(k==='glacier'?2.1:1.8);if(d<R)h=lerp(h,s.h,1-smooth(s.r*.85,R,d))}
  const dl=Math.hypot(u-LK.x,v-LK.z);if(dl<LK.r+40)h=lerp(h,-3,1-smooth(LK.r-15,LK.r+40,dl));
  {const cu=u-P.castle.x,cv=v-P.castle.z,d=Math.hypot(cu,cv);if(d>44&&d<60&&!(cu*CF.x+cv*CF.z>0&&Math.abs(cu*CF.z-cv*CF.x)<6))h-=4.5*(1-smooth(2.6,4.6,Math.abs(d-51.5)))}
  return h+NH}
const onIce=(x,z)=>Math.hypot(x-X2-LK.x,z-Z2-LK.z)<LK.r-10;
const _thN=terrainH;terrainH=function(x,z){return inN(x)?H2(x,z):carveM(x,z,_thN(x,z))};
const _ghN=groundH;groundH=function(x,z){if(!inN(x))return _ghN(x,z);let h=H2(x,z);if(onIce(x,z))h=Math.max(h,NH+.06);for(const b of bridges)if(Math.abs(x-b.x)<b.hx&&Math.abs(z-b.z)<b.hz)h=Math.max(h,b.y);
  for(const b of N.blds){const c=Math.cos(b.th),sn=Math.sin(b.th),dx=x-b.x,dz=z-b.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;if(Math.abs(lx)<b.w/2+.05&&Math.abs(lz)<b.d/2+.05)h=Math.max(h,b.fy)}return h};
/* stay inside the ring of mountains */
const _gcN=gtClamp;gtClamp=function(P0){if(inN(P0.x)){if(inGorge(FN,P0.x,P0.z,-PZ-12,PLN+30,PW_/2+4))return;const dx=P0.x-X2,dz=P0.z-Z2,d=Math.hypot(dx,dz);if(d>RW-70){P0.x=X2+dx/d*(RW-70);P0.z=Z2+dz/d*(RW-70)}return}return _gcN(P0)};
/* daylight, sky and sun like the world above (not a dark cave), with a snowy haze */
const _ueN=updateEnv,C_DAY=new T.Color(0xe2e8ee),C_NIGHT=new T.Color(0x2c3648),C_W=new T.Color();
updateEnv=function(dt,pp){const me=pp&&pp===PL;
  if(me&&inN(PL.x)){const q=Object.create(PL,{inCave:{value:false,writable:true}});_ueN(dt,q);
    const n=ENV.night||0;scene.fog.color.lerp(new T.Color(n>.5?0x1a2438:0xdde6ee),.6);scene.fog.density=Math.max(scene.fog.density,.001)}
  else _ueN(dt,pp);
  if(!me)return;const tk=tunK();if(tk>.001){scene.fog.color.lerp(new T.Color(0x14181e),tk);scene.fog.density+=(.03-scene.fog.density)*tk*.6;sun.intensity*=1-.92*tk;moon.intensity*=1-.9*tk;hemi.intensity*=1-.72*tk}
  const k=stormK()*(tk>.001?0:1);if(k<=.001)return;
  /* the snowstorm in the pass: everything goes white, the sun fades */
  C_W.copy(C_DAY).lerp(C_NIGHT,ENV.night||0);scene.fog.color.lerp(C_W,k);scene.fog.density+=(.085-scene.fog.density)*k;
  skyMat.uniforms.top.value.lerp(C_W,k*.97);skyMat.uniforms.hor.value.lerp(C_W,k);if(skyMat.uniforms.sunCol)skyMat.uniforms.sunCol.value.multiplyScalar(1-k);const su=skyMat.uniforms;if(su.uDens)su.uDens.value*=1-k;if(su.uCloudCol&&su.uCloudCol.value.lerp)su.uCloudCol.value.lerp(C_W,k);
  sun.intensity*=1-.9*k;moon.intensity*=1-.85*k;try{stars.material.opacity*=1-k;for(const c of clouds)c.material.opacity*=1-k}catch(e){}};
function stormK(){if(!FM)return 0;const n=inN(PL.x),F=n?FN:FM,[s,w]=loc(F,PL.x,PL.z);if(Math.abs(w)>PW_/2+30)return 0;
  if(n?(s<-PZ-14||s>PLN+20):(s<-PASS.L-20||s>PZ+14))return 0;return 1-smooth(14,95,Math.abs(s))}
/* where the pass starts in Eikendal: at the foot of the mountains, pointing into them, away from towns, rivers and the waterfall */
/* the nearest point on a road of Eikendal */
function roadPt(x,z){let best=null,bd=1e9;for(const r of ROADS){const p=r.pts;for(let i=0;i<p.length-1;i++){const ax=p[i][0],az=p[i][1],dx=p[i+1][0]-ax,dz=p[i+1][1]-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1))),qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(x-qx,z-qz);if(d<bd){bd=d;best=[qx,qz]}}}return best&&{p:best,d:bd}}
function findPass(strict,ph){const sites=SITES.filter(q=>q.id!=='bridge'),wf=WD.wf;let best=null,bs=-1e9;
  for(let a=0;a<6.283;a+=.03){const ux=Math.cos(a),uz=Math.sin(a);let foot=null;
    for(let r=300;r<1000;r+=4){if(_thN(ux*r,uz*r)>34){const fr=r-14;foot={x:ux*fr,z:uz*fr,h:_thN(ux*fr,uz*fr)};break}}
    if(!foot||foot.h<1.5||foot.h>18||(WD.inSea&&WD.inSea(foot.x,foot.z)))continue;let ok=true,mount=0;
    const L=Math.max(150,Math.min(300,(ph-foot.h)/.3+PZ));
    for(let s=-24;s<=L+PZ+30&&ok;s+=8){const x=foot.x+ux*s,z=foot.z+uz*s;if(Math.abs(x)>1050||Math.abs(z)>1050){ok=false;break}
      for(const q of sites)if(Math.hypot(q.x-x,q.z-z)<q.r+30){ok=false;break}
      if(wf&&wf.x!==undefined&&Math.hypot(wf.x-x,wf.z-z)<160)ok=false;
      if(typeof riverX==='function'&&z>-818&&Math.abs(riverX(z)-x)<45)ok=false;
      for(const hd of HIDDEN)if(Math.hypot(hd.x-x,hd.z-z)<40)ok=false;
      if(s>L*.6){const m=Math.min(_thN(x-uz*24,z+ux*24),_thN(x+uz*24,z-ux*24));mount+=m;if(strict&&s>L-30&&s<L+30&&m<ph+12)ok=false}}
    if(!ok)continue;const rp=roadPt(foot.x,foot.z),sc=(ux*-.7+uz*-.7)*60+mount*.05/Math.max(1,L/150)-(rp?rp.d:600)*.09;if(sc>bs){bs=sc;best={foot,ux,uz,L,ph}}}
  return best}
try{let g=null;for(const ph of[85,78,70,62])if(g=findPass(true,ph))break;if(!g)g=findPass(false,70);
  if(g){PH=g.ph;PASS.L=g.L;FM=frame(g.foot.x+g.ux*g.L,g.foot.z+g.uz*g.L,g.ux,g.uz);PASS.h0=g.foot.h;PASS.foot=g.foot;PASS.ok=true}}catch(e){console.warn('noordpas',e)}
PASS.hv=P.gate.h+NH;WD.pass={PASS,FM,FN,loc,wld,PH:()=>PH};
if(FM){try{const [sx,sz]=wld(FM,-PASS.L-10,0),rp=roadPt(sx,sz);if(rp&&rp.d>8){const [ax,az]=rp.p,[bx,bz]=wld(FM,-PASS.L-28,0),d=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(d/45)),pts=[[ax,az]];
  for(let i=1;i<n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(!(WD.inSea&&WD.inSea(x,z)))pts.push([x,z])}
  if(d>20)pts.push([bx,bz]);pts.push([sx,sz]);ROADS.push({w:2.2,pts});PASS.road=pts}}catch(e){console.warn('noordpas road',e)}}
if(typeof roadDist==='function'){const _rdN=roadDist;roadDist=function(x,z){if(FM){const [s,w]=loc(FM,x,z);if(s>-PASS.L-14&&s<PZ+30){const aw=Math.abs(w);if(aw<PW_/2+1)return 0;if(s>-PASS.L+25&&aw<PW_/2+46)return Math.min(3.5,_rdN(x,z))}}return _rdN(x,z)}}

/* ---------- textures ---------- */
const flakeTex=()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),gr=g.createRadialGradient(16,16,1,16,16,15);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(255,255,255,.8)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return new T.CanvasTexture(c)};
const snowTex=()=>canvasTex(256,256,(c,w,h)=>{c.fillStyle='#eef3f8';c.fillRect(0,0,w,h);for(let i=0;i<2600;i++){c.fillStyle=Math.random()<.6?`rgba(170,185,205,${.05+Math.random()*.12})`:`rgba(255,255,255,${.3+Math.random()*.4})`;c.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*2)}},240,240);
const iceTex=()=>canvasTex(512,512,(c,w,h)=>{c.fillStyle='#b4dcf2';c.fillRect(0,0,w,h);for(let i=0;i<40;i++){c.fillStyle='rgba(255,255,255,'+(.04+Math.random()*.08)+')';c.beginPath();c.arc(Math.random()*w,Math.random()*h,10+Math.random()*50,0,6.283);c.fill()}c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=1;for(let i=0;i<60;i++){let x=Math.random()*w,y=Math.random()*h;c.beginPath();c.moveTo(x,y);for(let k=0;k<5;k++){x+=rr(30);y+=rr(30);c.lineTo(x,y)}c.stroke()}},12,12);

/* snow on the pines: mix the colour towards white, and light back faces like front faces (no black leaves) */
function frost(m,k){m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.9,.94,1.),'+k.toFixed(2)+');')
  .replace('( gl_FrontFacing ) ? vLightFront : vLightBack','vLightFront').replace('( gl_FrontFacing ) ? vIndirectFront : vIndirectBack','vIndirectFront')};m.customProgramCacheKey=()=>'nfrost'+k;return m}
/* ---------- building the world ---------- */
function build(){if(N.built)return;N.built=true;const G=new T.Group();N.g=G;scene.add(G);const add=o=>{G.add(o);return o};
  /* terrain: snow, rock on the steep slopes */
  {const S=1960,seg=392,g=new T.PlaneGeometry(S,S,seg,seg);g.rotateX(-Math.PI/2);const p=g.attributes.position,col=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const x=p.getX(i)+X2,z=p.getZ(i)+Z2,h=H2(x,z);p.setXYZ(i,x,h,z)}g.computeVertexNormals();const nr=g.attributes.normal;
    for(let i=0;i<p.count;i++){const ny=nr.getY(i),h=p.getY(i),rock=smooth(.86,.7,ny)+smooth(150+NH,190+NH,h)*.5,n=fbm(p.getX(i)*.05,p.getZ(i)*.05,2)*.05;const s=[.45+n,.47+n,.51+n],r=[.22,.22,.25],k=Math.min(1,rock);col.set([s[0]+(r[0]-s[0])*k,s[1]+(r[1]-s[1])*k,s[2]+(r[2]-s[2])*k],i*3)}
    g.setAttribute('color',new T.BufferAttribute(col,3));const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,map:snowTex(),roughness:.92}));m.receiveShadow=true;add(m)}
  /* the frozen lake: an uneven shore, pale ice with dark clear patches, cracks, trapped bubbles and drifts of snow,
     snow piled along the edge, pressure ridges, fishing holes and frozen reeds */
  {const lr=a=>LK.r-6+5*Math.sin(a*3+1)+3*Math.sin(a*7+2)+2*Math.sin(a*13);
    const tex=canvasTex(1024,1024,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#a7c0cd');g.addColorStop(.5,'#bccfd9');g.addColorStop(1,'#aac3cf');c.fillStyle=g;c.fillRect(0,0,w,h);
      const blob=(x,y,r,col)=>{const q=c.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,col);q.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=q;c.fillRect(x-r,y-r,r*2,r*2)};
      for(let i=0;i<34;i++)blob(Math.random()*w,Math.random()*h,50+Math.random()*170,'rgba(38,68,92,'+(.25+Math.random()*.3)+')');
      for(let i=0;i<50;i++)blob(Math.random()*w,Math.random()*h,30+Math.random()*120,'rgba(240,246,250,'+(.2+Math.random()*.3)+')');
      for(let i=0;i<500;i++){const x=Math.random()*w,y=Math.random()*h;c.fillStyle='rgba(255,255,255,'+(.15+Math.random()*.35)+')';c.beginPath();c.arc(x,y,.6+Math.random()*2.2,0,6.283);c.fill()}
      const crack=(x,y,a,n,wd)=>{c.lineCap='round';for(let i=0;i<n;i++){const nx=x+Math.cos(a)*(6+Math.random()*12),ny=y+Math.sin(a)*(6+Math.random()*12);
        c.strokeStyle='rgba(20,40,55,.5)';c.lineWidth=wd+.8;c.beginPath();c.moveTo(x,y+1);c.lineTo(nx,ny+1);c.stroke();c.strokeStyle='rgba(250,253,255,.75)';c.lineWidth=wd;c.beginPath();c.moveTo(x,y);c.lineTo(nx,ny);c.stroke();
        x=nx;y=ny;a+=(Math.random()-.5)*.8;if(Math.random()<.08&&wd>.6)crack(x,y,a+(Math.random()<.5?1:-1)*(.6+Math.random()*.6),Math.floor(n*.4),wd*.6)}};
      for(let i=0;i<20;i++)crack(Math.random()*w,Math.random()*h,Math.random()*6.283,25+Math.random()*45,1+Math.random()*1.2)},2.2);
    const N=180,shape=new T.Shape();for(let i=0;i<=N;i++){const a=i/N*6.283,r=lr(a);i?shape.lineTo(Math.cos(a)*r,Math.sin(a)*r):shape.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
    const ig=new T.ShapeGeometry(shape,4),up=ig.attributes.position,uv=ig.attributes.uv;for(let i=0;i<up.count;i++)uv.setXY(i,up.getX(i)/120,up.getY(i)/120);
    const ice=new T.Mesh(ig,new T.MeshStandardMaterial({map:tex,color:0xe8f2f8,roughness:.16,metalness:.08}));ice.rotation.x=-Math.PI/2;ice.position.set(X2+LK.x,NH+.06,Z2+LK.z);ice.receiveShadow=true;add(ice);
    const soft=canvasTex(256,256,(c,w,h)=>{const q=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.55,'rgba(255,255,255,.75)');q.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=q;c.fillRect(0,0,w,h)});
    const snowM=new T.MeshStandardMaterial({color:0xf2f6fa,roughness:.95,transparent:true,alphaMap:soft,map:soft,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    for(let i=0;i<28;i++){const a=Math.random()*6.283,r=Math.random()*(LK.r-30),d=new T.Mesh(new T.CircleGeometry(1,24),snowM);d.rotation.set(-Math.PI/2,0,Math.random()*3);d.scale.set(6+Math.random()*16,3+Math.random()*7,1);d.position.set(X2+LK.x+Math.cos(a)*r,NH+.08,Z2+LK.z+Math.sin(a)*r);add(d)}
    {const rimTex=canvasTex(512,512,(c,w,h)=>{const q=c.createRadialGradient(w/2,h/2,w*.39,w/2,h/2,w/2);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.55,'rgba(255,255,255,.85)');q.addColorStop(1,'rgba(255,255,255,1)');c.fillStyle=q;c.fillRect(0,0,w,h)});
      const ro=LK.r+4,rg=new T.RingGeometry(LK.r-26,ro,180,3),rp=rg.attributes.position,ru=rg.attributes.uv;for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),a=Math.atan2(y,x),r=Math.hypot(x,y),k=lr(a)/(LK.r-6);rp.setXY(i,x*k,y*k);ru.setXY(i,(x/ro)*.5+.5,(y/ro)*.5+.5);void r}
      const rim=new T.Mesh(rg,new T.MeshStandardMaterial({color:0xf0f4f8,roughness:.95,transparent:true,alphaMap:rimTex,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));rim.rotation.x=-Math.PI/2;rim.position.set(X2+LK.x,NH+.1,Z2+LK.z);add(rim)}
    const shardM=new T.MeshStandardMaterial({color:0xcfe6f2,roughness:.12,metalness:.1,transparent:true,opacity:.92});
    for(let k=0;k<2;k++){let x=rr(LK.r*.5),z=rr(LK.r*.5),a=Math.random()*6.283;for(let i=0;i<70;i++){x+=Math.cos(a)*1.3;z+=Math.sin(a)*1.3;a+=(Math.random()-.5)*.25;if(Math.hypot(x,z)>LK.r-20)break;
      const b=new T.Mesh(new T.BoxGeometry(.9+Math.random()*1.2,.12,.5+Math.random()*.8),shardM);b.position.set(X2+LK.x+x,NH+.12+Math.random()*.15,Z2+LK.z+z);b.rotation.set((Math.random()-.5)*.9,a+Math.random(),(Math.random()-.5)*.9);add(b)}}
    for(let i=0;i<6;i++){const a=Math.random()*6.283,r=20+Math.random()*(LK.r-50),x=X2+LK.x+Math.cos(a)*r,z=Z2+LK.z+Math.sin(a)*r;const h=new T.Mesh(new T.CircleGeometry(.55,18),new T.MeshBasicMaterial({color:0x0c2232}));h.rotation.x=-Math.PI/2;h.position.set(x,NH+.09,z);add(h);
      for(let j=0;j<6;j++){const b=new T.Mesh(new T.BoxGeometry(.35,.12,.25),shardM);const ja=Math.random()*6.283;b.position.set(x+Math.cos(ja)*(.8+Math.random()*.5),NH+.12,z+Math.sin(ja)*(.8+Math.random()*.5));b.rotation.y=Math.random()*3;add(b)}}
    const reedM=new T.MeshStandardMaterial({color:0x8a7a52,roughness:.9});for(let i=0;i<26;i++){const a=Math.random()*6.283,r=lr(a)-2-Math.random()*4,x=X2+LK.x+Math.cos(a)*r,z=Z2+LK.z+Math.sin(a)*r;
      for(let j=0;j<7;j++){const L=.8+Math.random()*1.1,c=new T.Mesh(new T.CylinderGeometry(.015,.025,L,4),reedM);c.position.set(x+rr(.7),NH+L/2,z+rr(.7));c.rotation.set(rr(.25),0,rr(.25));add(c)}}}
  {    const [hx,hz]=W(LK.x+60,LK.z+30);const hut=new T.Group();hut.position.set(hx,NH+.06,hz);hut.add(mesh(new T.BoxGeometry(2.6,2,2.6),MAT.wood,0,1,0));const rf=mesh(new T.ConeGeometry(2.3,1.2,4),MAT.wood,0,2.6,0);rf.rotation.y=Math.PI/4;hut.add(rf);add(hut);
    const hole=new T.Mesh(new T.CircleGeometry(.5,16),new T.MeshBasicMaterial({color:0x103040}));hole.rotation.x=-Math.PI/2;hole.position.set(hx+2.6,NH+.08,hz+1);add(hole)}
  /* snowy pines, drawn near the player only */
  {const V=[1,2,3,4,5].map(i=>AS.lib&&AS.lib['Pine_'+i]).filter(Boolean),dm=new T.Object3D();
    for(let i=0;i<9000&&N.trees.length<4200;i++){const u=rr(RW-150),v=rr(RW-150),r=Math.hypot(u,v);if(r>RW-150)continue;const x=X2+u,z=Z2+v;if(Object.values(P).some(s=>Math.hypot(u-s.x,v-s.z)<s.r*1.25)||Math.hypot(u-LK.x,v-LK.z)<LK.r+10||inGorge(FN,x,z,-PZ-30,PLN+16,PW_/2+16))continue;
      const f=fbm(u*.006+20,v*.006+40,3)+(u<-280?.12:0);if(f<.5)continue;const h=H2(x,z);if(h>110+NH||slopeAt(x,z)>.55)continue;N.trees.push({x,z,y:h,r:Math.random()*6,s:.9+Math.random()*.8,v:i%Math.max(1,V.length)});addCircle(x,z,.6)}
    V.forEach((src,vi)=>{src.updateMatrixWorld(true);const inv=new T.Matrix4().copy(src.matrixWorld).invert();const parts=[];src.traverse(o=>{if(!o.isMesh)return;const m=(Array.isArray(o.material)?o.material:[o.material]).map(mt=>frost(mt.clone(),mt.alphaTest>0?.4:.25));
      const im=new T.InstancedMesh(o.geometry,m.length>1?m:m[0],N.trees.filter(t=>t.v===vi).length+1);im.frustumCulled=false;im.castShadow=true;im.count=0;add(im);parts.push({im,local:new T.Matrix4().multiplyMatrices(inv,o.matrixWorld)})});N.tv.push(parts)});
    if(!V.length){const cone=new T.ConeGeometry(2.2,6,7),tm=mm(0x2a4a3a),im=new T.InstancedMesh(cone,tm,N.trees.length);N.trees.forEach((t,k)=>{dm.position.set(t.x,t.y+3*t.s,t.z);dm.scale.setScalar(t.s);dm.updateMatrix();im.setMatrixAt(k,dm.matrix)});im.frustumCulled=false;add(im)}}
  /* rocks */
  {const R=[1,2,3].map(i=>AS.lib&&AS.lib['Rock_Medium_'+i]).filter(Boolean),dm=new T.Object3D();if(R.length)R.forEach((src,ri)=>{const list=[];for(let i=0;i<120;i++){const u=rr(RW-120),v=rr(RW-120);if(Math.hypot(u,v)>RW-120||Math.hypot(u-LK.x,v-LK.z)<LK.r)continue;if(Object.values(P).some(s=>Math.hypot(u-s.x,v-s.z)<s.r)||inGorge(FN,X2+u,Z2+v,-PZ-30,PLN+16,PW_/2+16))continue;list.push([X2+u,Z2+v])}
    src.traverse(o=>{if(!o.isMesh)return;const mt=frost(o.material.clone(),.38);const im=new T.InstancedMesh(o.geometry,mt,list.length);list.forEach(([x,z],k)=>{dm.position.set(x,H2(x,z)-.3,z);dm.rotation.set(0,Math.random()*6,0);dm.scale.setScalar(1.5+Math.random()*2.5);dm.updateMatrix();im.setMatrixAt(k,dm.matrix);addCircle(x,z,1.6)});im.frustumCulled=false;im.castShadow=true;add(im)})})}
  /* the northern lights */
  {const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false,uniforms:{t:{value:0},k:{value:0}},
      vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float t,k;varying vec2 vU;void main(){float w=sin(vU.x*18.+t*.6)*.5+.5,b=smoothstep(0.,.35,vU.y)*smoothstep(1.,.45,vU.y);float s=sin(vU.x*60.+t*1.4+sin(vU.x*9.)*3.)*.5+.5;vec3 c=mix(vec3(.2,1.,.55),vec3(.55,.3,1.),vU.y+w*.3);gl_FragColor=vec4(c,b*(.35+.65*s)*(.6+.4*w)*k*.8);}'});
    for(let i=0;i<3;i++){const g=new T.PlaneGeometry(1500,240,90,1),p=g.attributes.position;for(let j=0;j<p.count;j++){const x=p.getX(j);p.setZ(j,Math.sin(x*.004+i)*160)}const a=new T.Mesh(g,mat);a.position.set(X2+(i-1)*260,NH+420+i*40,Z2-420-i*120);a.rotation.x=-.25;a.userData.dyn=true;add(a);N.aur.push(a)}N.aurM=mat}
  buildPlaces(add);
  G.traverse(o=>{if(!o.userData.dyn&&o!==N.flakes){o.updateMatrix();o.updateMatrixWorld(true);o.matrixAutoUpdate=false}});
  populate();G.visible=inN(PL.x);try{WD.flatOverlays&&WD.flatOverlays(G)}catch(e){}}

/* ---------- places ---------- */
function buildPlaces(add){
  const at=k=>W(P[k].x,P[k].z),y=k=>H2(...at(k));
  for(const k in P)if(k!=='gate'){const [x,z]=at(k);SITES.push(SITE['n_'+k]={id:'n_'+k,name:P[k].n,x,z,r:P[k].r,h:P[k].h+NH})}
  SITES.push(SITE.n_lake={id:'n_lake',name:'Het Bevroren Meer',x:X2+LK.x,z:Z2+LK.z,r:LK.r});
  /* Ysdal: a Nordic village with a mead hall */
  {const [cx,cz]=at('ysdal'),spots=[[-30,-22,0],[-34,8,1],[-20,32,1],[18,36,2],[34,10,3],[30,-26,3],[0,-40,0]];N.houses=[];
    const FR=new Map(),house=o=>{const L0=LAMPS.length;let b=null;try{b=makeHouse(o)}catch(e){console.warn('ysdal house',e)}if(!b||!b.group)return b;
      const dy=H2(b.x,b.z)-b.y;b.group.position.y+=dy;b.y+=dy;if(b.fy!==undefined)b.fy+=dy;if(b.chim)b.chim[1]+=dy;
      for(let i=L0;i<LAMPS.length;i++){const l=LAMPS[i];l.y+=dy;const lg=l.flame&&l.flame.parent;if(lg&&lg!==b.group&&lg.parent===scene)lg.position.y+=dy}
      if(b.roof)b.roof.traverse(m=>{if(!m.isMesh||!m.material||Array.isArray(m.material))return;let f=FR.get(m.material);if(!f){f=frost(m.material.clone(),.5);FR.set(m.material,f)}m.material=f});
      N.blds.push(b);return b};
    for(const [dx,dz,rot] of spots)N.houses.push(house({x:cx+dx,z:cz+dz,w:7,d:6,rot,style:'wood',roof:'thatch',name:'Huis in Ysdal',kind:'home',h:3.2}));
    N.hall=house({x:cx,z:cz+2,w:15,d:9,rot:0,style:'wood',roof:'thatch',name:'Mededrinkhal van Ysdal',kind:'inn',h:5.5});
    const fx=cx+10,fz=cz-14;for(let i=0;i<8;i++){const a=i/8*6.283;add(mesh(new T.DodecahedronGeometry(.3,0),MAT.rock,fx+Math.cos(a)*1.1,y('ysdal')+.2,fz+Math.sin(a)*1.1))}const fl=mesh(new T.ConeGeometry(.6,1.8,7),new T.MeshBasicMaterial({color:0xff8a2a}),fx,y('ysdal')+1,fz,false);fl.userData.dyn=true;add(fl);LAMPS.push({x:fx,y:y('ysdal')+1.6,z:fz,flame:fl,fire:true});addCircle(fx,fz,1.2);
    for(const [dx,dz] of[[-50,0],[50,0],[0,-55],[0,55]]){const x=cx+dx,z=cz+dz,yy=H2(x,z);add(mesh(new T.CylinderGeometry(.35,.45,5,6),MAT.bark,x,yy+2.5,z));add(mesh(new T.BoxGeometry(1.6,.5,.5),MAT.bark,x,yy+4.4,z))}
    try{if(WD.banner){WD.banner(cx-6,cz+9,'#2f4a8a','tower',0);WD.banner(cx+6,cz+9,'#2f4a8a','tower',0)}}catch(e){}}
  /* De IJsburcht: a fortress of ice on a hill */
  buildIceCastle(add);
  /* De Runenkring: standing stones with glowing runes */
  {const [cx,cz]=at('runes'),yy=y('runes'),rm=new T.MeshBasicMaterial({map:WD.tx('rune_magic.png'),color:0x7ac8ff,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
    for(let i=0;i<12;i++){const a=i/12*6.283,x=cx+Math.cos(a)*17,z=cz+Math.sin(a)*17,h=5+Math.random()*2.5,s=mesh(new T.BoxGeometry(1.6,h,1),MAT.stone,x,yy+h/2-.3,z);s.rotation.y=-a;add(s);const r=new T.Mesh(new T.PlaneGeometry(1.2,1.2),rm);r.position.set(x-Math.cos(a)*.52,yy+h*.6,z-Math.sin(a)*.52);r.rotation.y=-a+Math.PI/2;add(r);addCircle(x,z,1)}
    add(mesh(new T.BoxGeometry(5,1.1,2.4),MAT.stone,cx,yy+.55,cz-7));add(mesh(new T.BoxGeometry(5.6,.25,3),MAT.stone,cx,yy+1.2,cz-7));addCircle(cx-1.6,cz-7,1.3);addCircle(cx+1.6,cz-7,1.3);const dc=new T.Mesh(new T.CircleGeometry(8,40),new T.MeshBasicMaterial({map:WD.tx('rune_magic.png'),color:0x6ab8ff,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false}));dc.rotation.x=-Math.PI/2;dc.position.set(cx,yy+.1,cz);dc.userData.dyn=true;add(dc);N.runeDisc=dc;
    for(let i=0;i<6;i++){const a=Math.random()*6.283,r=26+Math.random()*10;try{WD.humanBones&&WD.humanBones(cx+Math.cos(a)*r*.5,cz+Math.sin(a)*r*.5,Math.random()*6,{helmet:i%2===0})}catch(e){}}}
  /* Het Wolvenhol: a den under a rock arch */
  {const [cx,cz]=at('den'),yy=y('den'),R=[1,2,3].map(i=>AS.lib&&AS.lib['Rock_Medium_'+i]).filter(Boolean),RM=new Map();
    const rock=(x,z,s,ry,lift=0)=>{if(R.length){const r=R[Math.floor(Math.random()*R.length)].clone();r.traverse(o=>{if(!o.isMesh)return;let f=RM.get(o.material);if(!f){f=frost(o.material.clone(),.38);RM.set(o.material,f)}o.material=f;o.castShadow=true});r.scale.setScalar(s);r.position.set(x,H2(x,z)-.5+lift,z);r.rotation.y=ry;add(r)}
      else add(mesh(new T.DodecahedronGeometry(s*.7,0),mm(0x7a7e86,{flatShading:true}),x,H2(x,z)+s*.25+lift,z))};
    for(let i=0;i<16;i++){const a=Math.PI*(.22+i/15*1.56),r=13+Math.random()*1.2,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,s=1.5+Math.random()*.8;rock(x,z,s,Math.random()*6);addCircle(x,z,s*1.3);if(i%2===0)rock(x+rr(.6),z+rr(.6),s*.7,Math.random()*6,s*1.2)}
    const pit=new T.Mesh(new T.CircleGeometry(5,24),new T.MeshBasicMaterial({color:0x14161c,transparent:true,opacity:.85,depthWrite:false}));pit.rotation.x=-Math.PI/2;pit.position.set(cx-8,yy+.06,cz);add(pit);
    for(let i=0;i<6;i++){const a=Math.random()*6.283;try{WD.humanBones&&WD.humanBones(cx+Math.cos(a)*8,cz+Math.sin(a)*8,Math.random()*6,{sword:false})}catch(e){}}}
  /* De Gletsjertop: towering ice crystals */
  {const [cx,cz]=at('glacier'),yy=y('glacier');for(let i=0;i<16;i++){const a=i/16*6.283+rr(.15),r=30+Math.random()*16,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,c=mesh(new T.OctahedronGeometry(1,0),new T.MeshStandardMaterial({color:0xaee4ff,emissive:0x2a7ad0,emissiveIntensity:.5,roughness:.1,transparent:true,opacity:.8}),x,H2(x,z)+5,z);c.scale.set(2.2,8+Math.random()*7,2.2);c.rotation.set(rr(.2),Math.random()*6,rr(.2));add(c);addCircle(x,z,2)}}
  /* De Stormvlakte: wind-carved pillars */
  {const [cx,cz]=at('storm');for(let i=0;i<10;i++){const a=i/10*6.283+rr(.3),r=40+Math.random()*20,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,h=8+Math.random()*10,p=mesh(new T.CylinderGeometry(1.2,2.4,h,6),mm(0x8a8e96,{flatShading:true}),x,H2(x,z)+h/2,z);p.rotation.z=rr(.15);add(p);addCircle(x,z,2)}N.storm=[cx,cz]}
  /* the gorge up to the pass and back to Eikendal */
  buildPassNorth(add)}
/* ---------- De IJsburcht: a fortress of ice ----------
   On a hill ringed by a frozen moat: an eight-sided curtain wall with battlements, icicles and blue banners, a tower
   with an ice spire on every corner, a gatehouse with a pointed arch and a glowing snowflake, and in the courtyard
   the throne of the frost giant, blue fire bowls and rune pillars. Behind it rises the keep: three tiers, turrets,
   flying buttresses and glowing windows, with a floating crystal on top that casts a beam of light into the sky.
   Everything is built in the castle's own frame (z points out of the gate) and merged into a few meshes. */
const CTH=Math.atan2(CF.x,CF.z),CR=44;
const CW=(lx,lz)=>{const c=Math.cos(CTH),s=Math.sin(CTH);return[X2+P.castle.x+lx*c+lz*s,Z2+P.castle.z-lx*s+lz*c]};
let icetT=null;const iceTexC=()=>icetT||(icetT=canvasTex(256,256,(c,w,h)=>{c.fillStyle='#bcdcf0';c.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=4){c.fillStyle=`rgba(${150+Math.random()*60|0},${200+Math.random()*40|0},255,${.08+Math.random()*.12})`;c.fillRect(0,y,w,2+Math.random()*4)}
  c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1;for(let i=0;i<30;i++){let x=Math.random()*w,y=Math.random()*h;c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=rr(26);y+=rr(26);c.lineTo(x,y)}c.stroke()}
  for(let i=0;i<120;i++){c.fillStyle=`rgba(255,255,255,${.3+Math.random()*.6})`;c.fillRect(Math.random()*w,Math.random()*h,1,1)}}));
/* ice that lights up blue at its edges */
function iceM(col,rim=.7,e=0x0a2440,rough=.2){const m=new T.MeshStandardMaterial({color:col,map:iceTexC(),roughness:rough,metalness:.1,emissive:e});
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n float iceFr=pow(1.-abs(dot(normalize(vViewPosition),normal)),2.4);totalEmissiveRadiance+=vec3(.35,.65,1.)*iceFr*'+rim.toFixed(2)+';')};
  m.customProgramCacheKey=()=>'icerim'+rim;return m}
const MX=(x,y,z,ry=0,sx=1,sy=1,sz=1,rx=0,rz=0)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
const suv=(g,su,sv)=>{const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*su,uv.getY(i)*sv);return g};
/* collects pieces per material and merges them into one mesh each */
function bag(){const L=new Map();return{add(geo,mat,m){let g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);
    if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));g.clearGroups();if(!L.has(mat))L.set(mat,[]);L.get(mat).push(g)},
  build(parent){for(const [mat,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils&&T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}
    for(const g of mg?[mg]:gs){const me=new T.Mesh(g,mat);me.castShadow=me.receiveShadow=true;parent.add(me)}}}}}
function archShape(w,h,ow,oh){const s=new T.Shape();s.moveTo(-ow/2,0);s.lineTo(ow/2,0);s.lineTo(ow/2,oh);s.lineTo(-ow/2,oh);s.lineTo(-ow/2,0);
  const a=new T.Path();a.moveTo(-w/2,0);a.lineTo(-w/2,h*.62);a.quadraticCurveTo(-w/2,h*.9,0,h);a.quadraticCurveTo(w/2,h*.9,w/2,h*.62);a.lineTo(w/2,0);a.lineTo(-w/2,0);s.holes.push(a);return s}
function archHole(w,h){const a=new T.Shape();a.moveTo(-w/2,0);a.lineTo(-w/2,h*.62);a.quadraticCurveTo(-w/2,h*.9,0,h);a.quadraticCurveTo(w/2,h*.9,w/2,h*.62);a.lineTo(w/2,0);a.lineTo(-w/2,0);return a}
let flakeEm=null;const snowflakeTex=()=>flakeEm||(flakeEm=canvasTex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.translate(128,128);c.strokeStyle='#bfe6ff';c.lineCap='round';c.shadowColor='#6ac8ff';c.shadowBlur=14;
  for(let i=0;i<6;i++){c.save();c.rotate(i/6*6.283);c.lineWidth=10;c.beginPath();c.moveTo(0,0);c.lineTo(0,-110);c.stroke();c.lineWidth=7;for(const d of[40,72]){c.beginPath();c.moveTo(0,-d);c.lineTo(22,-d-24);c.moveTo(0,-d);c.lineTo(-22,-d-24);c.stroke()}c.restore()}
  c.lineWidth=6;c.beginPath();c.arc(0,0,26,0,6.283);c.stroke()}));
let bannerT=null;const bannerTex=()=>bannerT||(bannerT=canvasTex(128,384,(c,w,h)=>{c.fillStyle='#1b3768';c.fillRect(0,0,w,h);c.fillStyle='#cfe4f4';c.fillRect(0,0,w,10);c.fillRect(0,0,8,h);c.fillRect(w-8,0,8,h);
  c.beginPath();c.moveTo(0,h-60);c.lineTo(w/2,h);c.lineTo(w,h-60);c.lineTo(w,h);c.lineTo(0,h);c.fill();c.translate(w/2,150);c.strokeStyle='#e4f2ff';c.lineCap='round';
  for(let i=0;i<6;i++){c.save();c.rotate(i/6*6.283);c.lineWidth=7;c.beginPath();c.moveTo(0,0);c.lineTo(0,-44);c.stroke();c.lineWidth=4;c.beginPath();c.moveTo(0,-24);c.lineTo(10,-34);c.moveTo(0,-24);c.lineTo(-10,-34);c.stroke();c.restore()}}));
function buildIceCastle(add){const yy=H2(...CW(0,0)),g=new T.Group(),[ox,oz]=CW(0,0);g.position.set(ox,yy,oz);g.rotation.y=CTH;add(g);
  const ice=iceM(0x9cc6e2,.75),deep=iceM(0x5f8fc0,.9,0x0c2a52),pale=iceM(0xd8ecf8,.5,0x10304a),floorM=iceM(0xb4d4ea,.3,0x081c30,.06),
    stone=new T.MeshStandardMaterial({map:TEX.stone,color:0x9aa6b4,roughness:.9}),
    win=new T.MeshStandardMaterial({color:0x2a6ab0,emissive:0x5ab8ff,emissiveIntensity:1}),cry=new T.MeshStandardMaterial({color:0xaee4ff,emissive:0x3a9aff,emissiveIntensity:1.1,roughness:.1,metalness:.1}),
    dark=new T.MeshBasicMaterial({color:0x0a1830}),B=bag(),ICI=[],CRY=[],col=[],FX=N.castleFX={flames:[],win,cry};
  const circ=(lx,lz,r)=>col.push([lx,lz,r]);
  /* a round tower with a corbelled crown, battlements, glowing windows and an ice spire; returns its top */
  function tower(x,z,r,h,o={}){const y0=o.y0||0,sp=o.sp||r*3.4;
    B.add(new T.CylinderGeometry(r*1.25,r*1.35,2.4,20),y0?pale:stone,MX(x,y0+1.2,z));
    B.add(suv(new T.CylinderGeometry(r*.92,r*1.06,h,20,1,true),2*Math.PI*r/7,h/7),ice,MX(x,y0+h/2,z));
    B.add(new T.CylinderGeometry(r+1.1,r*.92,1.8,20),pale,MX(x,y0+h+.9,z));
    B.add(suv(new T.CylinderGeometry(r+1.1,r+1.1,3.2,20),2*Math.PI*r/7,.5),ice,MX(x,y0+h+3.4,z));
    const nm=Math.max(8,Math.round(r*2.4));for(let i=0;i<nm;i++){const a=i/nm*6.283;B.add(boxGeo(1.3,1.7,.9),ice,MX(x+Math.sin(a)*(r+.75),y0+h+5.85,z+Math.cos(a)*(r+.75),a))}
    B.add(suv(new T.ConeGeometry(r+.6,sp,16,1,true),2*Math.PI*r/7,sp/7),deep,MX(x,y0+h+5+sp/2,z));
    B.add(new T.OctahedronGeometry(1,0),cry,MX(x,y0+h+5+sp+1.2,z,0,.45*r/4+.3,1.8*r/4+.8,.45*r/4+.3));
    for(let k=0;k<(o.lv||3);k++)for(let i=0;i<4;i++){const a=i/4*6.283+(k%2)*.785+(o.wa||0),wy=y0+h*(.3+k*.22);if(wy>y0+h-2)continue;B.add(boxGeo(.55,2.4,.4),win,MX(x+Math.sin(a)*r*.98,wy,z+Math.cos(a)*r*.98,a))}
    for(let i=0;i<Math.round(r*3);i++){const a=i/Math.round(r*3)*6.283+.2;ICI.push([x+Math.sin(a)*(r+.9),y0+h,z+Math.cos(a)*(r+.9),.7+Math.random()*1.6])}
    return y0+h+5+sp}
  /* a straight stretch of curtain wall with a walk, battlements, a ledge with icicles and a banner */
  function wall(ax,az,bx,bz,wh,banner){const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx),mx=(ax+bx)/2,mz=(az+bz)/2,ml=Math.hypot(mx,mz),nx=mx/ml,nz=mz/ml;
    B.add(boxGeo(L,3,4.6,6),stone,MX(mx,1.5,mz,ry));B.add(boxGeo(L,wh,3.2,6),ice,MX(mx,wh/2,mz,ry));B.add(boxGeo(L,.5,3.8,6),pale,MX(mx,wh+.25,mz,ry));
    B.add(boxGeo(L,.4,.7,6),pale,MX(mx+nx*1.85,wh-.3,mz+nz*1.85,ry));
    const n=Math.floor(L/2.4);for(let i=0;i<n;i++){const t=(i+.5)/n-.5,x=mx+dx*t+nx*1.4,z=mz+dz*t+nz*1.4;B.add(boxGeo(1.4,1.8,.8),ice,MX(x,wh+1.4,z,ry))}
    for(let t=-.48;t<=.48;t+=1.5/L)ICI.push([mx+dx*t+nx*2.05,wh-.5,mz+dz*t+nz*2.05,.6+Math.random()*1.8]);
    for(let t=-.5;t<=.5;t+=1.8/L)circ(mx+dx*t,mz+dz*t,2.1);
    if(banner){const b=new T.Mesh(new T.PlaneGeometry(2.6,8),new T.MeshStandardMaterial({map:bannerTex(),side:T.DoubleSide,roughness:.8}));b.position.set(mx+nx*1.7,wh-4.6,mz+nz*1.7);b.rotation.y=Math.atan2(nx,nz);g.add(b)}}
  /* the curtain wall: eight sides, towers on the corners, the gate in front */
  const V8=[];for(let i=0;i<8;i++){const a=(i+.5)*Math.PI/4;V8.push([Math.sin(a)*CR,Math.cos(a)*CR])}
  for(let i=0;i<8;i++){if(i===7)continue;const [ax,az]=V8[i],[bx,bz]=V8[(i+1)%8];wall(ax,az,bx,bz,14,i%2===0)}
  for(const [x,z] of V8){tower(x,z,5,24,{sp:17});circ(x,z,5.6)}
  /* the gatehouse */
  const z0=CR*Math.cos(Math.PI/8);
  {const ag=new T.ExtrudeGeometry(archShape(7.6,13,15,21),{depth:6,bevelEnabled:false});ag.translate(0,0,-3);suv(ag,1/6,1/6);B.add(ag,ice,MX(0,0,z0));
    for(let i=0;i<6;i++)B.add(boxGeo(1.4,1.8,.9),ice,MX(-6.25+i*2.5,21.9,z0+2.6));B.add(boxGeo(15.6,.5,6.6),pale,MX(0,21.2,z0));
    for(let x=-3.4;x<=3.4;x+=.7){const yh=Math.abs(x)<3.8*.62?13-Math.pow(Math.abs(x)/3.8,2)*13*.38:8;ICI.push([x,yh-.2,z0+2.9,1+Math.random()*1.2]);ICI.push([x,yh-.2,z0-2.9,.8+Math.random()*1])}
    const em=new T.Mesh(new T.PlaneGeometry(6,6),new T.MeshBasicMaterial({map:snowflakeTex(),transparent:true,blending:T.AdditiveBlending,depthWrite:false}));em.position.set(0,16.6,z0+3.05);g.add(em);
    for(const sd of[-1,1]){tower(sd*10,z0,5.6,27,{sp:20,lv:4});circ(sd*10,z0,6);for(let x=4.6;x<=7.4;x+=1.2)circ(sd*x,z0,1.5)}
    /* the causeway over the moat, with fire posts */
    B.add(boxGeo(9,.25,20,4),stone,MX(0,.06,z0+12.5));
    for(const sd of[-1,1]){B.add(boxGeo(.8,1,20,4),stone,MX(sd*4.9,.5,z0+12.5));for(let z=z0+4;z<=z0+21;z+=1.8)circ(sd*4.9,z,.6);
      for(const zz of[z0+6,z0+19]){B.add(new T.CylinderGeometry(.35,.45,3.4,8),stone,MX(sd*4.9,1.7,zz));FX.flames.push([sd*4.9,3.7,zz,.7])}}}
  /* the keep: three tiers, turrets, flying buttresses, a great door and windows */
  const kz=-15;
  B.add(boxGeo(32,2.6,24,6),stone,MX(0,1.3,kz));B.add(boxGeo(30,16,22,6),ice,MX(0,8,kz));B.add(boxGeo(30.8,.6,22.8,6),pale,MX(0,16.3,kz));
  {const per=[[-15,-4,15,-4],[15,-4,15,-26],[15,-26,-15,-26],[-15,-26,-15,-4]];for(const [ax,az,bx,bz] of per){const L=Math.hypot(bx-ax,bz-az),n=Math.floor(L/2.4);for(let i=0;i<n;i++){const t=(i+.5)/n;B.add(boxGeo(1.3,1.6,1.3),ice,MX(ax+(bx-ax)*t,17.4,az+(bz-az)*t))}
    for(let t=0;t<=1;t+=1.4/L)ICI.push([ax+(bx-ax)*t,15.9,az+(bz-az)*t+(az===bz?(az>kz?.7:-.7):0),.6+Math.random()*1.5])}}
  for(let x=-12;x<=12;x+=4)for(const wy of[6,11.5])if(Math.abs(x)>4||wy>10)B.add(boxGeo(1,3,.4),win,MX(x,wy,kz+11.05));
  B.add(boxGeo(20,14,15,6),ice,MX(0,23,kz-1));B.add(boxGeo(20.8,.6,15.8,6),pale,MX(0,30.3,kz-1));
  for(let x=-8;x<=8;x+=2.6)B.add(boxGeo(1.2,1.5,1.2),ice,MX(x,31.3,kz+6.5));
  {const rw=new T.Mesh(new T.CircleGeometry(3.2,32),new T.MeshBasicMaterial({map:snowflakeTex(),color:0x9ad8ff,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));rw.position.set(0,24,kz+6.56);g.add(rw);
    B.add(new T.TorusGeometry(3.3,.35,8,32),pale,MX(0,24,kz+6.6))}
  {const dg=new T.ExtrudeGeometry(archShape(5.6,10,9,13),{depth:1.4,bevelEnabled:false});suv(dg,1/6,1/6);B.add(dg,pale,MX(0,0,kz+11));
    const dh=new T.Mesh(new T.ShapeGeometry(archHole(5.6,10)),new T.MeshStandardMaterial({color:0x061224,emissive:0x1a4a8a,emissiveIntensity:.8}));dh.position.set(0,0,kz+11.05);g.add(dh);
    for(let k=0;k<5;k++)B.add(boxGeo(11-k*.6,.45,1.3),stone,MX(0,.22+k*.45,kz+16.4-k*1.25))}
  const top=tower(0,kz-1,6.8,32,{y0:30,sp:28,lv:4,wa:.4});
  for(const [x,z] of[[-15,-4],[15,-4],[-15,-26],[15,-26]]){tower(x,kz+(z+15),3.4,22,{sp:11,lv:2});circ(x,kz+(z+15),3.8)}
  for(const [x,z] of[[-10,-8.5],[10,-8.5],[-10,-23.5],[10,-23.5]])tower(x,kz+(z+15)-1,2.5,20,{y0:16,sp:9,lv:2});
  /* flying buttresses from the corner turrets to the great tower */
  for(const [x,z] of[[-15,-4],[15,-4],[-15,-26],[15,-26]]){const a=new T.Vector3(x,24,kz+z+15),b=new T.Vector3(x*.42,46,kz-1+(z+15)*.42),d=b.clone().sub(a),L=d.length();
    const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize()),m=new T.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),q,new T.Vector3(1,1,1));B.add(boxGeo(1.1,L,1.8,4),pale,m)}
  for(let x=-15;x<=15;x+=2.5)for(let z=kz-11;z<=kz+11;z+=2.5)circ(x,z,1.9);for(let x=-5;x<=5;x+=2.5)circ(x,kz+13,1.6);
  /* the crystal on top, with shards around it and a beam into the sky */
  {const c=new T.Mesh(new T.OctahedronGeometry(2.6,0),cry);c.scale.set(1,2.2,1);c.position.set(0,top+5,kz-1);c.userData.dyn=true;g.add(c);FX.crystal=c;FX.cy=top+5;
    FX.shards=[];for(let i=0;i<5;i++){const s=new T.Mesh(new T.OctahedronGeometry(.7,0),cry);s.scale.set(1,2,1);s.userData.dyn=true;g.add(s);FX.shards.push(s)}
    const bm=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{t:{value:0},k:{value:1}},
      vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float t,k;varying vec2 vU;void main(){float a=(1.-vU.y)*(1.-vU.y)*(.55+.45*sin(vU.y*40.-t*3.));gl_FragColor=vec4(vec3(.45,.75,1.)*a*k*.55,1.);}'});
    const beam=new T.Mesh(new T.CylinderGeometry(.6,1.6,320,16,1,true),bm);beam.position.set(0,top+5+160,kz-1);beam.userData.dyn=true;g.add(beam);FX.beam=bm}
  /* the frozen moat (open in front, where the causeway runs) */
  {const gap=.3,mg=new T.RingGeometry(48.2,54.8,72,1,1.5*Math.PI+gap/2,2*Math.PI-gap),m=new T.Mesh(mg,new T.MeshStandardMaterial({map:iceTex(),color:0x8fb8d0,roughness:.06,metalness:.2}));
    m.rotation.x=-Math.PI/2;m.position.y=-4.42;m.receiveShadow=true;g.add(m)}
  /* the courtyard: a polished floor, the throne, fire bowls, rune pillars */
  {const fl=new T.Mesh(new T.CircleGeometry(CR-4,48),floorM);fl.rotation.x=-Math.PI/2;fl.position.y=.05;fl.receiveShadow=true;g.add(fl)}
  B.add(boxGeo(7,1,5),stone,MX(0,.5,4));B.add(boxGeo(5,2,3.6),ice,MX(0,2,4));B.add(boxGeo(5.4,8,1.2),ice,MX(0,5,2.4));B.add(boxGeo(1,2.6,3.6),pale,MX(-2.8,2.3,4));B.add(boxGeo(1,2.6,3.6),pale,MX(2.8,2.3,4));
  for(let i=0;i<7;i++){const a=(i/6-.5)*1.8;B.add(new T.OctahedronGeometry(1,0),cry,MX(Math.sin(a)*3.4,8.6+Math.cos(a)*2.4,2.2,0,.5,2.2-Math.abs(i-3)*.3,.5,0,-a))}circ(0,4,3.4);
  for(let i=0;i<6;i++){const a=(i/6)*6.283+.52,x=Math.sin(a)*27,z=Math.cos(a)*27;if(z<kz+12&&Math.abs(x)<17)continue;B.add(new T.CylinderGeometry(.8,1.1,2.4,10),stone,MX(x,1.2,z));B.add(new T.CylinderGeometry(1.5,.7,.9,14),pale,MX(x,2.85,z));FX.flames.push([x,3.4,z,1.2]);circ(x,z,1.3)}
  for(const [x,z] of[[-7,19],[7,19],[-7,31],[7,31]]){B.add(new T.CylinderGeometry(.55,1.25,9,4),deep,MX(x,4.5,z,.785));B.add(new T.OctahedronGeometry(.8,0),cry,MX(x,9.8,z,0,1,1.6,1));circ(x,z,1.3);
    for(let k=0;k<4;k++){const r=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:WD.tx('rune_magic.png'),color:0x8ad0ff,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));const a=k*Math.PI/2+.785;r.position.set(x+Math.sin(a)*.62,5.5,z+Math.cos(a)*.62);r.rotation.y=a;g.add(r)}}
  /* crystals growing on the hill and along the walls */
  for(let i=0;i<70;i++){const a=Math.random()*6.283,out=i<40,r=out?CR+14+Math.random()*10:CR-7+Math.random()*2.5,x=Math.sin(a)*r,z=Math.cos(a)*r;if(Math.abs(x)<7&&z>0)continue;if(!out&&z<kz+13&&Math.abs(x)<18)continue;
    const [wx,wz]=CW(x,z);CRY.push([x,H2(wx,wz)-yy-.4,z,.7+Math.random()*1.4,2+Math.random()*4.5,Math.random()*6,rr(.35),rr(.35)])}
  B.build(g);
  /* icicles and crystals as instances */
  {const ig=new T.ConeGeometry(.22,1,5);ig.rotateX(Math.PI);ig.translate(0,-.5,0);const im=new T.InstancedMesh(ig,pale,ICI.length),d=new T.Object3D();
    ICI.forEach(([x,y,z,l],k)=>{d.position.set(x,y,z);d.rotation.set(0,Math.random()*6,0);d.scale.set(.8+l*.25,l,.8+l*.25);d.updateMatrix();im.setMatrixAt(k,d.matrix)});g.add(im)}
  {const cg=new T.OctahedronGeometry(1,0),im=new T.InstancedMesh(cg,cry,CRY.length),d=new T.Object3D();
    CRY.forEach(([x,y,z,s,h,ry,tx,tz],k)=>{d.position.set(x,y+h*.5,z);d.rotation.set(tx,ry,tz);d.scale.set(s*.5,h,s*.5);d.updateMatrix();im.setMatrixAt(k,d.matrix)});im.castShadow=true;g.add(im)}
  /* blue flames */
  const fm=new T.MeshBasicMaterial({color:0x6ac8ff,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}),fm2=new T.MeshBasicMaterial({color:0xdff4ff,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false});
  FX.fl=FX.flames.map(([x,y,z,s])=>{const o=new T.Group();o.position.set(x,y,z);o.scale.setScalar(s);o.add(new T.Mesh(new T.ConeGeometry(.55,1.9,8),fm));const i2=new T.Mesh(new T.ConeGeometry(.28,1.1,8),fm2);i2.position.y=-.3;o.add(i2);o.userData.dyn=true;g.add(o);return o});
  for(const [x,z,r] of col){const [wx,wz]=CW(x,z);addCircle(wx,wz,r)}}
ANIMS.push(dt=>{const F=N.castleFX;if(!F||!N.built||!inN(PL.x))return;const t=PL.t,n=ENV.night||0;
  F.win.emissiveIntensity=.7+n*1.8;F.cry.emissiveIntensity=1+n*.8+Math.sin(t*1.7)*.25;
  if(F.crystal){F.crystal.rotation.y+=dt*.5;F.crystal.position.y=F.cy+Math.sin(t*.8)*.8;F.shards.forEach((s,i)=>{const a=t*.6+i/5*6.283;s.position.set(Math.cos(a)*6.5,F.cy+Math.sin(t*1.3+i)*1.6,F.crystal.position.z+Math.sin(a)*6.5);s.rotation.y+=dt})}
  if(F.beam){F.beam.uniforms.t.value+=dt;F.beam.uniforms.k.value=.45+n*.9}
  for(const o of F.fl||[]){const k=1+Math.sin(t*13+o.position.x)*.12+Math.sin(t*7.3+o.position.z)*.08;o.scale.y=o.scale.x*k}});
/* ---------- people and bosses ---------- */
LINES.north=['Brr, koud vandaag... zoals altijd.','De IJsreus in de burcht laat ons niet met rust.','Bij de Runenkring dwalen de doden van de Rijpkoning.','Pas op in het westen: daar jaagt de Wolvenkoning.','Op de Stormvlakte rent iets dat sneller is dan de wind.','Zie je het noorderlicht vannacht? Dan zijn de goden blij.','Boven op de gletsjer woont een draak van ijs.'];
Object.assign(ITEMS,{frost_heart:{n:'IJshart van Hrimtor',g:'mat',price:1600,ico:'❄',rar:'l'},fenrik_fang:{n:'Slagtand van Fenrik',g:'mat',price:900,ico:'▲',rar:'l'},rime_crown:{n:'Kroon van de Rijpkoning',g:'head',def:9,fx:{hp:60,dmg:.12},price:2600,ico:'♛',rar:'l'},
  storm_hood:{n:'Kap van de Stormloper',g:'head',def:8,hat:'hood',fx:{spd:.15,dmg:.1,hp:30},price:5800,ico:'▲',rar:'m'},storm_vest:{n:'Vest van de Stormloper',g:'armor',def:20,tunic:0x4a7ac8,pants:0x2a3a5a,fx:{spd:.15,hp:70,regen:1},price:7400,ico:'▣',rar:'m'},
  storm_cloak:{n:'Mantel van de Stormloper',g:'cloak',def:9,col:0x6a9ad8,fx:{spd:.15,stam:90,dmg:.06},price:6200,ico:'▤',rar:'m'},storm_boots:{n:'Laarzen van de Stormloper (L = Stormsprong)',g:'boots',def:8,fx:{spd:.25,jump:.5},price:6900,ico:'▼',rar:'m'}});
Object.assign(MON,{frostgiant:{n:'IJsreus Hrimtor',hp:2200,dmg:46,speed:4.2,aggro:36,range:5.5,xp:1800,loot:'frostgiant',rad:2.6,hh:7.5,boss:'hrimtor',respawn:3600},
  wolfking:{n:'Wolvenkoning Fenrik',hp:1300,dmg:34,speed:9.5,aggro:34,range:2.8,xp:1100,loot:'wolfking',rad:1.4,hh:2.6,boss:'fenrik',respawn:3000},
  stormrunner:{n:'Zefyr de Stormloper',hp:4800,dmg:46,speed:14,aggro:40,range:2.4,xp:1600,loot:'stormrunner',rad:.6,hh:2,boss:'zefyr',respawn:3600}});
/* the gear of the north: from the bosses and from the chests hidden at their lairs */
Object.assign(ITEMS,{
  axe_frost:{n:'IJsbijl van Hrimtor',g:'weapon',kind:'axe',dmg:122,spd:.62,rng:3.2,price:9000,ico:'⛏',col:0xbfe8ff,rar:'l'},
  sword_frost:{n:'Vorstzwaard',g:'weapon',kind:'sword',dmg:98,spd:.45,rng:3,price:6400,ico:'⚔',col:0x9ad8ff,rar:'e'},
  armor_frost:{n:'IJsharnas',g:'armor',def:21,tunic:0xbfe0f0,pants:0x5a7a98,fx:{hp:40},price:7200,ico:'▣',rar:'e'},
  helm_frost:{n:'Vorsthelm',g:'head',def:8,hat:'helm',fx:{hp:25},price:3800,ico:'♔',rar:'e'},
  boots_frost:{n:'Sneeuwlaarzen',g:'boots',def:5,fx:{spd:.07},price:2600,ico:'▼',rar:'r'},
  cloak_frost:{n:'Wolfspelsmantel van Fenrik',g:'cloak',def:7,col:0xe8eef4,fx:{hp:30,stam:30},price:5200,ico:'▤',rar:'l'},
  ring_frost:{n:'Rijpring',g:'ring',fx:{dmg:.1,hp:20},price:4200,ico:'○',rar:'e'},
  amu_glacius:{n:'Drakenijs-amulet',g:'amulet',fx:{hp:60,regen:1},price:8800,ico:'◈',rar:'l'}});
const roll=(p,id,n=1)=>Math.random()<p?[[id,n]]:[];
LOOTX.frostgiant=()=>({gold:1000,items:[['frost_heart',1],['gem',5],['elixir',2],...roll(.6,'shield_frost'),...roll(.6,'axe_frost'),...roll(.4,'armor_frost')]});
LOOTX.wolfking=()=>({gold:500,items:[['fenrik_fang',1],['fur',6],['gem',3],['cloak_frost',1],...roll(.5,'boots_frost')]});
LOOTX.rimeking=()=>({gold:700,items:[['rime_crown',1],['relic',2],['gem',4],...roll(.5,'sword_frost'),...roll(.4,'ring_frost')]});
LOOTX.stormrunner=()=>({gold:800,items:[['storm_hood',1],['storm_vest',1],['storm_cloak',1],['storm_boots',1]]});
function cxBoss(type,k,x,z,opt){const d=MON[type];let m=null;try{m=EX.makeCX(k,opt)}catch(e){}if(!m)return spawnMonster(k==='wolf'?'shadowwolf':'troll',x,z,{cave:true,name:d.n,hp:d.hp,hpMax:d.hp,boss:d.boss,loot:d.loot});
  const a=baseActor({kind:'enemy',type,name:d.n,model:m,root:m.g,x,z,hp:d.hp,hpMax:d.hp,dmg:d.dmg,speed:d.speed,aggro:d.aggro,range:d.range,rad:d.rad,hh:d.hh,xp:d.xp,loot:d.loot,boss:d.boss,respawn:d.respawn,cave:true});scene.add(a.root);placeActor(a);return a}
function humanBoss(type,x,z,look,o){const h=makeHuman(look);const a=baseActor({kind:'enemy',type,h,root:h.g,x,z,cave:true,...o});a.hpMax=a.hp;scene.add(a.root);placeActor(a);return a}
function populate(){const at=k=>W(P[k].x,P[k].z);
  /* Ysdal folk */
  const [vx,vz]=at('ysdal');try{spawnNPC('lord',vx,vz-2,{name:'Jarl Sigrun',ai:'stay',cave:true,line:'north'});spawnNPC('merchant',vx+14,vz-6,{name:'Bontkoopman Ulf',ai:'stay',cave:true,shop:['fur','bear_pelt','leatherm','arrow','potion','bread','shield_buckler','shield_tower'],line:'north'});
    spawnNPC('innkeeper',vx-4,vz+4,{name:'Herbergierster Freya',ai:'stay',cave:true,shop:FOOD,line:'north'});
    for(let i=0;i<7;i++){const a=Math.random()*6.283,r=10+Math.random()*30;spawnNPC('villager',vx+Math.cos(a)*r,vz+Math.sin(a)*r,{cave:true,roam:{x:vx,z:vz},radius:34})}
    for(let i=0;i<3;i++)spawnNPC('guard',vx+rr(20),vz+rr(20),{name:'Wacht van Ysdal',ai:'guard',cave:true,patrol:[[vx-40,vz],[vx+40,vz],[vx,vz-45],[vx,vz+45]],livery:0x2a4a8a})}catch(e){console.warn('ysdal',e)}
  /* wilds */
  for(let i=0;i<10;i++){const u=rr(RW-220),v=rr(RW-220);if(Math.hypot(u-P.ysdal.x,v-P.ysdal.z)<120)continue;spawnEnemy('wolf',X2+u,Z2+v,{cave:true});spawnEnemy('wolf',X2+u+3,Z2+v+2,{cave:true})}
  for(let i=0;i<5;i++){const [x,z]=at('den');spawnEnemy('wolf',x+rr(10),z+rr(10),{cave:true})}
  for(let i=0;i<4;i++){const [x,z]=CW(rr(14),14+rr(10));spawnMonster('troll',x,z,{cave:true})}
  for(let i=0;i<5;i++){const [x,z]=at('runes');spawnEnemy('skeleton',x+rr(12),z+rr(12),{cave:true})}
  /* treasure chests at the lairs */
  try{const C=(k,dx,dz,loot,name)=>{const [x,z]=W(P[k].x+dx,P[k].z+dz);makeChest(x,z,loot,Math.random()*6,name)};
    {const [x,z]=CW(0,-34);makeChest(x,z,'nh_castle',CTH,'Schatkist van de IJsburcht')}
    C('den',-8,4,'nh_den','Kist vol botten');C('runes',0,-10,'nh_runes','Runenkist');C('glacier',8,-12,'nh_glacier','Bevroren kist');C('storm',-14,10,'nh_storm','Stormkist');
    {const [x,z]=W(LK.x+64,LK.z+34);makeChest(x,z,'nh_lake',0,'Kist van de ijsvisser')}}catch(e){console.warn('nh chests',e)}
  /* the bosses */
  {const [x,z]=CW(0,12);N.giant=cxBoss('frostgiant','orc1',x,z,{h:7.5,tint:0xa8dcff})}
  {const [x,z]=at('den');N.wolf=cxBoss('wolfking','wolf',x,z-3,{h:2.6,tint:0xf4f8ff,eyes:0x6ad8ff})}
  {const [x,z]=at('runes');N.king=humanBoss('skeleton',x,z,{skin:0xdcd6c2,tunic:0x9ab8d8,pants:0xbab49f,hair:0xdcd6c2,skull:1,hat:'crown',hatc:0xbfe8ff,scale:1.6},{name:'De Rijpkoning',hp:1300,dmg:32,speed:3.8,aggro:30,range:2.6,xp:1300,loot:'rimeking',boss:'rijpkoning',respawn:3600,hh:3});try{setHeld(N.king.h,'sword_knight','shield_iron')}catch(e){}}
  {const [x,z]=at('glacier'),md=makeDragon;makeDragon=()=>md(0x2a6aaa,0x1a3a6a);try{N.dragon=spawnMonster('dragon',x,z,{cave:true,ice:true,name:'IJsdraak Glacius',sub:'Wachter van de Gletsjer',boss:'glacius',hp:2400,hpMax:2400,dmg:36,xp:2400})}finally{makeDragon=md}}
  {const [x,z]=at('storm');N.zefyr=humanBoss('stormrunner',x,z,{fem:false,skin:0xe8e0f0,tunic:0x4a7ac8,pants:0x2a3a5a,hair:0xf0f4ff,hairStyle:'parted',hat:'hood',hatc:0x2a4a8a,cape:0x6a9ad8,scale:1.05},{name:'Zefyr de Stormloper',hp:4800,dmg:46,speed:14,aggro:40,range:2.4,xp:4200,loot:'stormrunner',boss:'zefyr',respawn:3600,hh:2});try{setHeld(N.zefyr.h,'dagger')}catch(e){}}}

{const _kaN=killActor;killActor=function(a,by){const was=!a.dead;_kaN(a,by);if(was&&a.ice&&a.type==='dragon'&&by)dropLoot(a.x,a.z+2,{gold:400,items:[['amu_glacius',1],...roll(.5,'ring_frost'),...roll(.5,'helm_frost')]})}}
Object.assign(CHEST_LOOT,{nh_castle:{gold:900,items:[['armor_frost',1],['gem',4],['elixir',2]]},nh_den:{gold:300,items:[['boots_frost',1],['fur',4]]},nh_runes:{gold:400,items:[['helm_frost',1],['relic',1]]},
  nh_glacier:{gold:600,items:[['ring_frost',1],['gem',3]]},nh_storm:{gold:500,items:[['sword_frost',1],['potion',3]]},nh_lake:{gold:150,items:[['golden_fish',1],['bread',3]]}});
/* ---------- boss abilities ---------- */
const FX=(x,y,z,n,c1,c2,sp=5)=>{if(window.PW&&PW.ps)pwBurst(PW.ps,x,y,z,n,sp,1,.5,.08,c1,c2,2,3,1,1)};
ANIMS.push(dt=>{if(!N.built||!inN(PL.x))return;const t=PL.t;
  /* IJsreus: a freezing slam */
  const G=N.giant;if(G&&!G.dead&&G.state==='chase'){G.slCd=(G.slCd??5)-dt;const d=Math.hypot(PL.x-G.x,PL.z-G.z);if(G.slCd<=0&&d<10){G.slCd=G.hp<G.hpMax*.4?4.5:7;FX(G.x,G.y+.5,G.z,90,[.8,.95,1],[.4,.7,1],9);if(window.PW)PW.shake=Math.max(PW.shake||0,.6);try{WD.roar(.9)}catch(e){}
    if(d<9){damagePlayer(30,G);PL.frostT=3;addLog('De IJsreus slaat de grond: je bevriest!','#9ad8ff')}}}
  if(PL.frostT>0){PL.frostT-=dt;PL.slow=.45;PL.frozen=1}else if(PL.frozen){PL.frozen=0;PL.slow=1}
  /* Fenrik calls his pack */
  const F=N.wolf;if(F&&!F.dead){for(const [k,f] of[['h1',.7],['h2',.35]])if(!F[k]&&F.hp<F.hpMax*f){F[k]=1;addLog('Fenrik huilt. Zijn roedel komt eraan!','#cfe8ff');try{WD.roar(.6)}catch(e){}for(let i=0;i<3;i++)spawnEnemy('wolf',F.x+rr(6),F.z+rr(6),{cave:true,provoked:true,respawn:1e9})}}
  /* the Rime King raises the dead */
  const K=N.king;if(K&&!K.dead){for(const [k,f] of[['r1',.66],['r2',.33]])if(!K[k]&&K.hp<K.hpMax*f){K[k]=1;addLog('De Rijpkoning roept de doden op!','#9ad8ff');FX(K.x,K.y+1,K.z,60,[.6,.8,1],[.2,.4,1]);for(let i=0;i<3;i++)spawnEnemy('skeleton',K.x+rr(5),K.z+rr(5),{cave:true,provoked:true,respawn:1e9})}}
  if(N.runeDisc)N.runeDisc.rotation.z+=dt*.15;
  /* Zefyr: dashes like the wind, strikes and is gone again */
  const Z=N.zefyr;if(Z&&!Z.dead&&Z.state==='chase'){Z.dsCd=(Z.dsCd??2)-dt;const d=Math.hypot(PL.x-Z.x,PL.z-Z.z);
    if(window.PW&&PW.ps&&Math.random()<dt*20)pwEm(PW.ps,Z.x+rr(.3),Z.y+1,Z.z+rr(.3),rr(.5),.3,rr(.5),.5,.25,.05,[.7,.9,1],[.4,.6,1],.8,0,1);
    if(Z.dsCd<=0){Z.dsCd=Z.hp<Z.hpMax*.5?1.6:2.6;const a=Math.random()*6.283,r=d<4?9:2.5,tx=PL.x+Math.cos(a)*r,tz=PL.z+Math.sin(a)*r;for(let i=0;i<10;i++){const k=i/10;if(window.PW&&PW.ps)pwEm(PW.ps,Z.x+(tx-Z.x)*k,Z.y+1,Z.z+(tz-Z.z)*k,0,.2,0,.6,.5,.1,[.8,.95,1],[.5,.7,1],.9,0,1)}Z.x=tx;Z.z=tz;placeActor(Z);try{sfx('swing')}catch(e){}}}});
/* Zefyr is hard to hit: he slips away from a third of your blows (almost half once he is in a storm rage) */
{const _haZ=hitActor;hitActor=function(a,dmg,byPlayer,dir){if(a===N.zefyr&&!a.dead&&byPlayer&&Math.random()<(a.rage?.45:.33)){floatText(a.x,a.y+2.4,a.z,'Ontweken!','#9ad8ff');
  const s=Math.random()<.5?-1:1,fx=Math.sin(PL.rot),fz=Math.cos(PL.rot),q={x:a.x+fz*s*5,z:a.z-fx*s*5};if(!collide(q,.5)){a.x=q.x;a.z=q.z;placeActor(a)}if(window.PW&&PW.ps)pwBurst(PW.ps,a.x,a.y+1,a.z,24,4,.6,.5,.06,[.8,.95,1],[.4,.6,1],2,2,1,1);a.provoked=true;return}return _haZ(a,dmg,byPlayer,dir)}}
const BLADES=[],bladeM=new T.MeshBasicMaterial({color:0xcfefff,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
ANIMS.push(dt=>{const Z=N.zefyr;if(Z&&!Z.dead&&Z.state==='chase'&&inN(PL.x)){if(!Z.rage&&Z.hp<Z.hpMax*.5){Z.rage=1;Z.speed*=1.3;addLog('Zefyr wordt een storm! Hij is nu nog sneller.','#9ad8ff');try{WD.roar(.6)}catch(e){}}
    Z.blCd=(Z.blCd??3)-dt;const d=Math.hypot(PL.x-Z.x,PL.z-Z.z);if(Z.blCd<=0&&d>5&&d<28){Z.blCd=Z.rage?2.6:4.2;for(const off of Z.rage?[-.25,0,.25]:[0]){const a=Math.atan2(PL.x-Z.x,PL.z-Z.z)+off,m=new T.Mesh(new T.TorusGeometry(.9,.12,4,16,Math.PI),bladeM);
      m.position.set(Z.x,Z.y+1.2,Z.z);m.rotation.set(Math.PI/2,0,-a);scene.add(m);BLADES.push({m,dx:Math.sin(a),dz:Math.cos(a),t:0})}try{sfx('swing')}catch(e){}}}
  for(let i=BLADES.length-1;i>=0;i--){const b=BLADES[i];b.t+=dt;b.m.position.x+=b.dx*30*dt;b.m.position.z+=b.dz*30*dt;b.m.rotation.z+=dt*14;
    if(Math.hypot(PL.x-b.m.position.x,PL.z-b.m.position.z)<1.5&&Math.abs(PL.y+1-b.m.position.y)<1.6){damagePlayer(32,N.zefyr||{});PL.x+=b.dx*2;PL.z+=b.dz*2;b.t=9}
    if(b.t>1.2){scene.remove(b.m);BLADES.splice(i,1)}}});
/* the Stormloper set: all four pieces make you super fast */
const STORMSET=['storm_hood','storm_vest','storm_cloak','storm_boots'];let setWas=false;
const full=()=>PL.eq&&PL.eq.head==='storm_hood'&&PL.eq.armor==='storm_vest'&&PL.eq.cloak==='storm_cloak'&&PL.eq.boots==='storm_boots';
const _gsN=gearSpd;gearSpd=function(){return _gsN()*(full()?2.4:1)};
ANIMS.push(dt=>{const f=full();if(f&&!setWas)addLog('Stormloper-set compleet: je bent supersnel!','#9ad8ff');setWas=f;if(f&&PL.speed>3&&window.PW&&PW.ps&&Math.random()<dt*25)pwEm(PW.ps,PL.x+rr(.3),PL.y+.6+Math.random(),PL.z+rr(.3),rr(.3),.2,rr(.3),.45,.3,.04,[.75,.92,1],[.4,.6,1],.7,0,1)});

/* ---------- each frame: trees near you, snow, the lights in the sky, showing only the world you are in ---------- */
function treesUpdate(force){if(!N.tv.length)return;if(!force&&Math.hypot(PL.x-N.last.x,PL.z-N.last.z)<30)return;N.last.x=PL.x;N.last.z=PL.z;const M=new T.Matrix4(),tm=new T.Matrix4(),q=new T.Quaternion(),Y=new T.Vector3(0,1,0),cnt=N.tv.map(()=>0);
  for(const parts of N.tv)for(const p of parts)p.im.count=0;
  for(const t of N.trees){if(Math.abs(t.x-PL.x)>380||Math.abs(t.z-PL.z)>380)continue;const parts=N.tv[t.v];if(!parts)continue;q.setFromAxisAngle(Y,t.r);tm.compose(new T.Vector3(t.x,t.y-.2,t.z),q,new T.Vector3(t.s,t.s,t.s));const k=cnt[t.v]++;for(const p of parts){M.multiplyMatrices(tm,p.local);p.im.setMatrixAt(k,M);p.im.count=k+1}}
  for(const parts of N.tv)for(const p of parts)p.im.instanceMatrix.needsUpdate=true}
function hideMain(h){if(h){N.hidden=[];for(const o of scene.children)if(o!==N.g&&o.isInstancedMesh&&o.frustumCulled===false&&o.visible){o.visible=false;N.hidden.push(o)}}
  else{for(const o of N.hidden)o.visible=true;N.hidden=[]}}
ANIMS.push(dt=>{const now=inN(PL.x);if(now&&!N.built){busy('Noordheim wordt opgebouwd...');try{build()}finally{busy(false)}}
  const hide=now||stormK()>.55;if(hide!==!!N.hm){N.hm=hide;hideMain(hide);if(typeof rain!=='undefined')rain.visible=!hide}
  if(now!==N.was){N.was=now;if(N.g)N.g.visible=now;if(now)treesUpdate(true)}if(!now)return;
  treesUpdate(false);if(N.aurM){N.aurM.uniforms.t.value+=dt;N.aurM.uniforms.k.value=Math.max(0,(ENV.night-.3)/.7)}});
/* snow around the camera: always in Noordheim, and thick and windy in the storm of the pass.
   It turns with the path, so it looks the same on both sides of the storm. */
const FLK=(()=>{const n=2600,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=rr(30);pos[i*3+1]=Math.random()*40;pos[i*3+2]=rr(30)}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
  const f=new T.Points(g,new T.PointsMaterial({color:0xffffff,size:.13,map:flakeTex(),alphaTest:.3,transparent:true,opacity:.9,depthWrite:false}));f.frustumCulled=false;f.visible=false;scene.add(f);return f})();
ANIMS.push(dt=>{const n=inN(PL.x),k=tunK()>.02?0:stormK(),on=(n||k>.02)&&tunK()<.05;FLK.visible=on;if(!on)return;FLK.material.opacity=Math.min(1,(n?.85:0)+k);FLK.material.size=.13+k*.08;
  FLK.position.set(camera.position.x,camera.position.y-20,camera.position.z);FLK.rotation.y=(n?FN:FM||FN).th;
  const p=FLK.geometry.attributes.position,sp=2+k*5,wx=k*7;for(let i=0;i<p.count;i++){let y=p.getY(i)-dt*(sp+(i%5)*.4),x=p.getX(i)+(Math.sin(PL.t*.7+i)*.4+wx)*dt;if(y<0)y+=40;if(x>30)x-=60;p.setY(i,y);p.setX(i,x)}p.needsUpdate=true});
/* buildings: the game hides all of them in caves, and Noordheim counts as one; here they show like in Eikendal */
const _ucN=updateCulling;updateCulling=function(dt){if(!inN(PL.x))return _ucN(dt);cullT-=dt;if(cullT>0)return;cullT=.5;for(const b of BUILDINGS)b.group.visible=Math.hypot(b.x-PL.x,b.z-PL.z)<340};
/* a small map of Noordheim in the corner */
const _dmN=drawMini;drawMini=function(){if(!inN(PL.x)||!N.built)return _dmN();const c=$('mini'),g=c.getContext('2d'),S=150,k=S/(RW*2.2);g.fillStyle='#dfe8f0';g.fillRect(0,0,S,S);
  const X=x=>S/2+(x-X2)*k,Z=z=>S/2+(z-Z2)*k;g.strokeStyle='#7a8494';g.lineWidth=10;g.beginPath();g.arc(S/2,S/2,RW*k,0,6.283);g.stroke();
  g.fillStyle='#9ac8e8';g.beginPath();g.arc(X(X2+LK.x),Z(Z2+LK.z),LK.r*k,0,6.283);g.fill();
  {const a=wld(FN,-PZ,0),b=wld(FN,PLN,0);g.strokeStyle='#8a6a4a';g.lineWidth=2;g.setLineDash([3,2]);g.beginPath();g.moveTo(X(a[0]),Z(a[1]));g.lineTo(X(b[0]),Z(b[1]));g.stroke();g.setLineDash([])}
  g.font='bold 8px sans-serif';g.textAlign='center';for(const key in P){const s=P[key];g.fillStyle=key==='ysdal'?'#7a4a2a':'#2a4a8a';g.beginPath();g.arc(X(X2+s.x),Z(Z2+s.z),3,0,6.283);g.fill();g.fillText(s.n.replace(/^(De|Het) /,''),X(X2+s.x),Z(Z2+s.z)-5)}
  g.save();g.translate(X(PL.x),Z(PL.z));g.rotate(-PL.rot+Math.PI);g.fillStyle='#e0402a';g.beginPath();g.moveTo(0,-6);g.lineTo(4,4);g.lineTo(-4,4);g.closePath();g.fill();g.restore()};

/* the big map (M) in Noordheim: snow, rock, forests, the frozen lake, the gorge and the places you found */
let NMAP=null;
/* the big map of Noordheim, drawn like a real map: shaded relief, snowy mountains, pine forests drawn as little
   trees, the lake with its cracks, the glacier, the places you found (with a little drawing of each), paths,
   a compass rose, a title and a scale bar */
const sr=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const lakeR=a=>LK.r-6+5*Math.sin(a*3+1)+3*Math.sin(a*7+2)+2*Math.sin(a*13);
function northMapBase(){if(NMAP)return NMAP;const n=440,E=960,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d'),im=g.createImageData(n,n),H=new Float32Array(n*n),wx=i=>X2-E+(i+.5)/n*2*E,wz=j=>Z2-E+(j+.5)/n*2*E;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++)H[j*n+i]=H2(wx(i),wz(j));
  const gl=P.glacier;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const h=H[j*n+i]-NH,hx=H[j*n+Math.min(n-1,i+1)]-H[j*n+Math.max(0,i-1)],hz=H[Math.min(n-1,j+1)*n+i]-H[Math.max(0,j-1)*n+i],x=wx(i),z=wz(j),u=x-X2,v=z-Z2,r=Math.hypot(u,v);
    const sh=Math.max(-1,Math.min(1,(-hx*.7-hz*.7)*.05)),slope=Math.min(1,Math.hypot(hx,hz)/26),nn=fbm(u*.02,v*.02,2);
    let R=240,G=241,B=236;
    const rock=Math.max(slope*.9,smooth(55,95,h)*.7);R=lerp(R,124,rock);G=lerp(G,132,rock);B=lerp(B,146,rock);
    const cap=smooth(110,150,h)*(1-slope*.6);R=lerp(R,250,cap);G=lerp(G,252,cap);B=lerp(B,255,cap);
    const dg=Math.hypot(u-gl.x,v-gl.z);if(dg<gl.r*2.2){const k=1-smooth(gl.r*1.2,gl.r*2.2,dg);R=lerp(R,214,k*.7);G=lerp(G,232,k*.7);B=lerp(B,246,k*.7)}
    const la=Math.atan2(v-LK.z,u-LK.x),ld=Math.hypot(u-LK.x,v-LK.z),lr=lakeR(la);if(ld<lr){const e=smooth(lr-10,lr,ld);R=lerp(176,128,e);G=lerp(206,170,e);B=lerp(222,198,e);R+=nn*14;G+=nn*12;B+=nn*8}
    if(r>RW-40){const k=smooth(RW-40,RW+60,r);R=lerp(R,206,k);G=lerp(G,190,k);B=lerp(B,154,k)}
    R+=(nn-.5)*10;G+=(nn-.5)*10;B+=(nn-.5)*8;const f=1+sh*.42,o=(j*n+i)*4;im.data[o]=R*f;im.data[o+1]=G*f;im.data[o+2]=B*f;im.data[o+3]=255}
  g.putImageData(im,0,0);
  /* forests: count the pines in cells; dense cells get a drawn tree */
  const cell=26,cnt=new Map();for(const t of N.trees){const k=Math.floor((t.x-X2+E)/cell)+','+Math.floor((t.z-Z2+E)/cell);cnt.set(k,(cnt.get(k)||0)+1)}
  const forest=[];let i0=0;for(const [k,v] of cnt){if(v<3)continue;const [ci,cj]=k.split(',').map(Number);for(let q=0;q<Math.min(3,Math.floor(v/3));q++){i0++;forest.push([X2-E+(ci+sr(i0))*cell,Z2-E+(cj+sr(i0+.5))*cell,.8+sr(i0+.3)*.5])}}
  forest.sort((a,b)=>a[1]-b[1]);c.forest=forest;return NMAP=c}
function pine(g,x,y,s){g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x+s*.25,y+s*.15,s*.5,s*.18,0,0,7);g.fill();
  g.fillStyle='#4a3424';g.fillRect(x-s*.08,y-s*.25,s*.16,s*.3);g.fillStyle='#2f5444';
  g.beginPath();g.moveTo(x,y-s*1.5);g.lineTo(x+s*.55,y-s*.25);g.lineTo(x-s*.55,y-s*.25);g.closePath();g.fill();
  g.fillStyle='#eef4f6';g.beginPath();g.moveTo(x,y-s*1.5);g.lineTo(x+s*.2,y-s*1.05);g.lineTo(x-s*.2,y-s*1.05);g.closePath();g.fill()}
function house(g,x,y,s){g.fillStyle='#7a5434';g.fillRect(x-s*.5,y-s*.45,s,s*.45);g.fillStyle='#e8eef2';g.beginPath();g.moveTo(x-s*.65,y-s*.4);g.lineTo(x,y-s*.95);g.lineTo(x+s*.65,y-s*.4);g.closePath();g.fill();g.strokeStyle='#3a2a1a';g.lineWidth=1;g.stroke()}
const NICON={gate:'⛰',ysdal:'🏠',castle:'🏰',runes:'💀',den:'🐺',glacier:'🐉',storm:'🌪'};
const _dbN=drawBigMap;drawBigMap=function(){const h=document.querySelector('#mapw h2');if(!inN(PL.x)||!N.built){if(h)h.textContent='Kaart van Eikendal';return _dbN.apply(this,arguments)}
  if(h)h.textContent='Kaart van Noordheim';const c=$('bigmap'),g=c.getContext('2d'),S=c.width,E=960,X=x=>(x-X2+E)/(2*E)*S,Z=z=>(z-Z2+E)/(2*E)*S,k=S/900;
  const base=northMapBase();g.imageSmoothingEnabled=true;g.drawImage(base,0,0,S,S);
  /* the edge of the world fades into old parchment */
  {const q=g.createRadialGradient(S/2,S/2,S*.38,S/2,S/2,S*.72);q.addColorStop(0,'rgba(60,40,20,0)');q.addColorStop(1,'rgba(60,40,20,.55)');g.fillStyle=q;g.fillRect(0,0,S,S)}
  /* the lake: shore line and cracks */
  {g.strokeStyle='rgba(70,110,140,.9)';g.lineWidth=2*k;g.beginPath();for(let i=0;i<=120;i++){const a=i/120*6.283,r=lakeR(a),x=X(X2+LK.x+Math.cos(a)*r),y=Z(Z2+LK.z+Math.sin(a)*r);i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
    g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1*k;for(let q=0;q<9;q++){let x=LK.x+(sr(q)-.5)*LK.r,z=LK.z+(sr(q+9)-.5)*LK.r,a=sr(q+19)*6.283;g.beginPath();g.moveTo(X(X2+x),Z(Z2+z));for(let t=0;t<9;t++){x+=Math.cos(a)*8;z+=Math.sin(a)*8;a+=(sr(q*31+t)-.5)*.9;if(Math.hypot(x-LK.x,z-LK.z)>LK.r-12)break;g.lineTo(X(X2+x),Z(Z2+z))}g.stroke()}}
  /* glacier crevasses */
  {const gl=P.glacier;g.strokeStyle='rgba(80,130,170,.55)';g.lineWidth=1.4*k;for(let q=0;q<14;q++){const a=sr(q+40)*6.283,r=gl.r*(.4+sr(q+50)*1.3),x=gl.x+Math.cos(a)*r,z=gl.z+Math.sin(a)*r,L=10+sr(q+60)*14;g.beginPath();g.moveTo(X(X2+x-L),Z(Z2+z));g.quadraticCurveTo(X(X2+x),Z(Z2+z+5),X(X2+x+L),Z(Z2+z));g.stroke()}}
  /* forests */
  for(const [x,z,sz] of base.forest)pine(g,X(x),Z(z),7*k*sz);
  /* the pass and paths from the pass to the places you know */
  {const a=wld(FN,-PZ-20,0),b=wld(FN,PLN+20,0);g.strokeStyle='#6a4a2a';g.lineWidth=3.5*k;g.setLineDash([10*k,7*k]);g.beginPath();g.moveTo(X(a[0]),Z(a[1]));g.lineTo(X(b[0]),Z(b[1]));g.stroke();
    g.strokeStyle='rgba(106,74,42,.7)';g.lineWidth=2.2*k;for(const kk of['ysdal','castle','runes','den','storm','glacier'])if(PL.discovered['n_'+kk]){const t=P[kk];g.beginPath();g.moveTo(X(b[0]),Z(b[1]));const mx=(b[0]+X2+t.x)/2+(sr(kk.length)-.5)*120,mz=(b[1]+Z2+t.z)/2+(sr(kk.length+3)-.5)*120;g.quadraticCurveTo(X(mx),Z(mz),X(X2+t.x),Z(Z2+t.z));g.stroke()}g.setLineDash([])}
  /* little drawings of the places you found */
  const D=PL.discovered;
  if(D.n_ysdal){const t=P.ysdal;for(let q=0;q<7;q++){const a=q/7*6.283,r=q?22:0;house(g,X(X2+t.x+Math.cos(a)*r),Z(Z2+t.z+Math.sin(a)*r),11*k)}}
  if(D.n_castle){const t=P.castle,cx=X(X2+t.x),cy=Z(Z2+t.z),R=44/(2*E)*S;g.fillStyle='rgba(200,225,240,.85)';g.strokeStyle='#4a6a8a';g.lineWidth=2.5*k;g.beginPath();for(let q=0;q<=8;q++){const a=q/8*6.283+.39;q?g.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R):g.moveTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R)}g.fill();g.stroke();
    for(let q=0;q<8;q++){const a=q/8*6.283+.39;g.fillStyle='#9ac0dc';g.beginPath();g.arc(cx+Math.cos(a)*R,cy+Math.sin(a)*R,3.5*k,0,7);g.fill();g.stroke()}g.fillStyle='#bfe0f4';g.fillRect(cx-6*k,cy-6*k,12*k,12*k);g.strokeRect(cx-6*k,cy-6*k,12*k,12*k)}
  if(D.n_runes){const t=P.runes;g.fillStyle='#6a6a70';for(let q=0;q<10;q++){const a=q/10*6.283;g.fillRect(X(X2+t.x+Math.cos(a)*18)-2*k,Z(Z2+t.z+Math.sin(a)*18)-4*k,4*k,8*k)}}
  if(D.n_den){const t=P.den;g.fillStyle='#2a2a30';g.beginPath();g.ellipse(X(X2+t.x),Z(Z2+t.z),9*k,6*k,0,Math.PI,0);g.fill()}
  if(D.n_storm){const t=P.storm;g.strokeStyle='rgba(120,150,190,.8)';g.lineWidth=1.6*k;for(let q=0;q<3;q++){g.beginPath();g.arc(X(X2+t.x),Z(Z2+t.z),(10+q*9)*k,q,q+4.2);g.stroke()}}
  const sym=(x,z,ico,n)=>{const px=X(x),py=Z(z);g.fillStyle='rgba(20,30,44,.85)';g.strokeStyle='#9ad8ff';g.lineWidth=2;g.beginPath();g.arc(px,py,12,0,7);g.fill();g.stroke();g.font='15px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(ico,px,py+1);
    g.textBaseline='alphabetic';g.font='bold 15px "IM Fell English",serif';g.strokeStyle='#1b2433';g.lineWidth=3;g.strokeText(n,px,py-18);g.fillStyle='#fff';g.fillText(n,px,py-18)};
  for(const kk in P)if(kk==='gate'||D['n_'+kk])sym(X2+P[kk].x,Z2+P[kk].z,NICON[kk]||'📍',P[kk].n);
  if(D.n_lake)sym(X2+LK.x,Z2+LK.z,'❄','Het Bevroren Meer');
  try{const Y=WD.yeti&&WD.yeti.A;if(Y&&Y.L>0&&D.n_yeti)sym(Y.ox+Y.ux*12,Y.oz+Y.uz*12,'🕳','Het Yetihol')}catch(e){}
  g.font='italic 14px "IM Fell English",serif';g.textAlign='center';g.fillStyle='rgba(60,40,20,.9)';g.fillText('naar Eikendal',X(wld(FN,-PZ-20,0)[0]),Z(wld(FN,-PZ-20,0)[1])+22);
  /* compass rose, title and scale */
  {const cx=S-62*k,cy=62*k,R=34*k;g.save();g.translate(cx,cy);g.fillStyle='rgba(240,232,210,.85)';g.beginPath();g.arc(0,0,R+8*k,0,7);g.fill();g.strokeStyle='#5a4028';g.lineWidth=1.5;g.stroke();
    for(let q=0;q<4;q++){g.rotate(Math.PI/2);g.fillStyle=q%2?'#5a4028':'#a8885a';g.beginPath();g.moveTo(0,-R);g.lineTo(6*k,0);g.lineTo(-6*k,0);g.closePath();g.fill()}
    g.fillStyle='#3a2a1a';g.font='bold '+Math.round(13*k)+'px serif';g.textAlign='center';g.fillText('N',0,-R-1*k);g.restore()}
  {g.font='bold '+Math.round(30*k)+'px "IM Fell English",serif';g.textAlign='left';g.fillStyle='rgba(240,232,210,.85)';g.fillRect(18*k,S-70*k,210*k,52*k);g.strokeStyle='#5a4028';g.strokeRect(18*k,S-70*k,210*k,52*k);g.fillStyle='#3a2a1a';g.fillText('Noordheim',32*k,S-35*k);
    const m200=200/(2*E)*S;g.fillStyle='#3a2a1a';g.fillRect(S-40*k-m200,S-30*k,m200,4*k);g.font=Math.round(12*k)+'px serif';g.textAlign='center';g.fillText('200 m',S-40*k-m200/2,S-36*k)}
  arrow(g,X(PL.x),Z(PL.z),PL.yaw,10)};
/* ---------- the Noordpas in both worlds ---------- */
/* the middle of the storm looks exactly the same on both sides: the same rock walls and the same snowy floor */
let SEAMG=null;
function seamGeo(){if(SEAMG)return SEAMG;const L0=-PZ-8,L1=PZ+8,NS=44,NY=10,walls=[];
  for(const side of[-1,1]){const pos=[],idx=[];
    for(let i=0;i<=NS;i++){const s=L0+(L1-L0)*i/NS;for(let j=0;j<=NY;j++){const t=j/NY,y=-1.5+t*20,nz=Math.sin(s*.37+side*1.7)*.7+Math.sin(s*.91+y*.45)*.4+Math.sin(y*1.3+s*.13)*.45;
      pos.push(side*(PW_/2+1+wallOut(y)+nz*(.25+t*.5)),y,s)}}
    for(let i=0;i<NS;i++)for(let j=0;j<NY;j++){const a=i*(NY+1)+j,b=a+NY+1;if(side>0)idx.push(a,b,a+1,b,b+1,a+1);else idx.push(a,a+1,b,b,a+1,b+1)}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    const nr=g.attributes.normal,col=[];for(let k=0;k<nr.count;k++){const c=Math.min(1,smooth(.15,.55,nr.getY(k))+smooth(15,18.5,pos[k*3+1])*.8),v=.3+.05*Math.sin(k*1.7);col.push(v+(.8-v)*c,v+(.84-v)*c,v+.03+(.9-v-.03)*c)}
    g.setAttribute('color',new T.Float32BufferAttribute(col,3));walls.push(g)}
  const fl=new T.PlaneGeometry(PW_+5,L1-L0,10,40);fl.rotateX(-Math.PI/2);return SEAMG={walls,fl}}
function seamGroup(F){const G0=seamGeo(),g=new T.Group(),t=snowTex();t.repeat.set(2,12);
  const wm=new T.MeshStandardMaterial({vertexColors:true,roughness:.95,side:T.DoubleSide}),fm=new T.MeshStandardMaterial({map:t,color:0x9aa2ac,roughness:.95,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4});
  for(const w of G0.walls){const m=new T.Mesh(w,wm);m.receiveShadow=true;g.add(m)}const f=new T.Mesh(G0.fl,fm);f.position.y=.05;f.receiveShadow=true;g.add(f);
  g.position.set(F.ox,PH,F.oz);g.rotation.y=F.th;return g}
/* a trodden path draped over the ground, soft at the edges */
let edgeT=null;const EDGE=()=>{if(edgeT)return edgeT;const c=document.createElement('canvas');c.width=64;c.height=4;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,64,0);gr.addColorStop(0,'#000');gr.addColorStop(.22,'#fff');gr.addColorStop(.78,'#fff');gr.addColorStop(1,'#000');g.fillStyle=gr;g.fillRect(0,0,64,4);return edgeT=new T.CanvasTexture(c)};
function ribbon(F,s0,s1,colAt,add){const NS=Math.ceil((s1-s0)/2),NW=6,pos=[],col=[],uv=[],idx=[];
  for(let i=0;i<=NS;i++){const s=s0+(s1-s0)*i/NS,c=colAt(s);for(let j=0;j<=NW;j++){const w=(j/NW-.5)*(PW_-2),[x,z]=wld(F,s,w);pos.push(x,groundH(x,z)+.07,z);col.push(c[0],c[1],c[2]);uv.push(j/NW,i/NS)}}
  for(let i=0;i<NS;i++)for(let j=0;j<NW;j++){const a=i*(NW+1)+j,b=a+NW+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.95,transparent:true,alphaMap:EDGE(),depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-6}));m.receiveShadow=true;add(m);return m}
function cairn(x,z,add){const g=new T.Group();g.position.set(x,groundH(x,z),z);[[.55,.35],[.42,.95],[.3,1.42],[.2,1.75]].forEach(([r,h],i)=>{const m=mesh(new T.DodecahedronGeometry(r,0),MAT.rock,Math.sin(i*2.1)*.06,h-r*.4,Math.cos(i*1.7)*.06);m.rotation.set(i,i*1.3,i*.7);g.add(m)});add(g);addCircle(x,z,.6)}
function signpost(x,z,rot,l1,l2,add){const g=new T.Group();g.position.set(x,groundH(x,z),z);g.rotation.y=rot;g.add(mesh(new T.CylinderGeometry(.09,.11,2.7,6),MAT.wood,0,1.35,0));
  const t=canvasTex(256,96,(c,w,h)=>{c.fillStyle='#6a4a2a';c.fillRect(0,0,w,h);c.strokeStyle='#3a2614';c.lineWidth=6;c.strokeRect(3,3,w-6,h-6);c.fillStyle='#f4e6c0';c.textAlign='center';c.font='bold 30px Georgia,serif';c.fillText(l1,w/2,42);c.font='22px Georgia,serif';c.fillText(l2,w/2,76)}),tm=new T.MeshStandardMaterial({map:t,roughness:.8});
  g.add(mesh(new T.BoxGeometry(1.6,.6,.07),[MAT.wood,MAT.wood,MAT.wood,MAT.wood,tm,tm],0,2.25,0));add(g);addCircle(x,z,.4)}
/* rock walls you cannot climb, where the gorge is deep, and a closed end behind the storm */
function gorgeWalls(F,s0,s1,cap,floor,raw){for(let s=s0;s<=s1;s+=1.6)for(const sd of[-1,1]){const [x,z]=wld(F,s,sd*(PW_/2+.9)),[x2,z2]=wld(F,s,sd*(PW_/2+12));if(raw(x2,z2)>floor(s)+3)addCircle(x,z,.9)}
  for(let w=-PW_/2;w<=PW_/2;w+=1.4){const [x,z]=wld(F,cap,w);addCircle(x,z,.9)}}
function clearMainGorge(){const ok=(x,z)=>inGorge(FM,x,z,-PASS.L-18,PZ+14,PW_/2+(loc(FM,x,z)[0]>-80?24:10));
  for(const t of TREES.oak.concat(TREES.pine))if(!t.cut&&ok(t.x,t.z)){t.cut=true;t.gone=true;if(t.col)t.col.off=true;try{if(t.lodM)asLow(t,false);else setInst(t.ii||[],false,[])}catch(e){}}
  for(const q of ROCKS)if(!q.cut&&ok(q.x,q.z)){q.cut=true;if(q.col)q.col.off=true;try{q.inst.setMatrixAt(q.i,new T.Matrix4().makeScale(0,0,0));q.inst.instanceMatrix.needsUpdate=true}catch(e){}}
  try{asTreesUpdate(true)}catch(e){}}
function buildPassMain(){if(!FM)return;const add=o=>{scene.add(o);return o},L=PASS.L;clearMainGorge();
  add(seamGroup(FM));
  ribbon(FM,-L-10,-PZ-8,s=>{const k=smooth(PH-48,PH-18,fM(s));return[.42+(.68-.42)*k,.35+(.72-.35)*k,.25+(.78-.25)*k]},add);
  let sd=1;for(let s=-L+10;s<-PZ-10;s+=22){const [x,z]=wld(FM,s,sd*(PW_/2-1.3));cairn(x,z,add);sd=-sd}
  {const [x,z]=wld(FM,-L-8,PW_/2+2.2);signpost(x,z,FM.th,'Noordheim','De Noordpas ↑',add)}
  gorgeWalls(FM,-L+14,PZ+6,PZ+6,fM,_thN);tunnelEnds();buildTunnel(FM,TUN.m0,PZ+8,fM,add,true);
  try{coverTunnel(FM,TUN.m0+1.2,PZ+40,s=>fM(Math.max(-PASS.L,Math.min(PZ,s))),_thN,terrainH,true,add)}catch(e){console.warn('tunnel cover',e)}
  const [hx,hz]=wld(FM,-L,0);HIDDEN.push({id:'n_pass',name:'De Noordpas',x:hx,z:hz,found:false});MAPICON.n_pass='⛰';
  RUMORS.push({t:'Aan de voet van de bergen begint een smal bergpad: de Noordpas. Een lange tunnel loopt dwars door de bergen naar Noordheim, een land van sneeuw en ijs met vijf geduchte bazen.',h:'n_pass'})}
function buildPassNorth(add){tunnelEnds();add(seamGroup(FN));
  ribbon(FN,PZ+8,PLN+26,s=>[.46,.49,.54],add);
  let sd=1;for(let s=PZ+14;s<PLN-4;s+=22){const [x,z]=wld(FN,s,sd*(PW_/2-1.3));cairn(x,z,add);sd=-sd}
  {const [x,z]=wld(FN,PLN+8,PW_/2+2.2);signpost(x,z,FN.th,'Eikendal','De Noordpas ↑',add)}
  gorgeWalls(FN,-PZ-6,PLN-14,-PZ-6,fN,H2raw);buildTunnel(FN,-PZ-8,TUN.n1,fN,add,false);
  try{coverTunnel(FN,-PZ-40,TUN.n1-1.2,s=>fN(Math.max(-PZ,Math.min(PLN,s))),H2raw,H2,false,add)}catch(e){console.warn('tunnel cover',e)}}
/* ---------- the Noordpas is a tunnel through the mountains ----------
   Where the gorge has cut deep enough into the mountain, a stone portal opens and a rock vault closes over the path.
   Lanterns hang along the walls; in the middle it is pitch dark, and there you walk from one world into the other. */
const TUN={m0:null,n1:null};
function tunnelEnds(){if(TUN.m0!==null)return;const deep=(F,s,f,raw)=>{let lo=1e9;for(const sd of[-1,1]){const [x,z]=wld(F,s,sd*(PW_/2+9));lo=Math.min(lo,raw(x,z))}return lo-f(s)};
  TUN.m0=-PZ-30;for(let q=-PASS.L+20;q<-PZ-30;q+=2)if(deep(FM,q,fM,_thN)>14){TUN.m0=q;break}
  TUN.n1=PZ+30;for(let q=PLN-6;q>PZ+30;q-=2)if(deep(FN,q,fN,H2raw)>14){TUN.n1=q;break}}
function buildTunnel(F,s0,s1,floor,add,portalAtStart){const NW=26,ds=2,rows=Math.ceil((s1-s0)/ds)+1,pi=[],po=[],ci=[],co=[],idx=[];
  const prof=j=>{const t=j/(NW-1);if(t<.12){const k=t/.12;return[-11.2,-.8+k*4.8,-1,0]}if(t>.88){const k=(t-.88)/.12;return[11.2,4-k*4.8,1,0]}const a=Math.PI*(1-(t-.12)/.76);return[11.2*Math.cos(a),4+8.6*Math.sin(a),Math.cos(a),Math.sin(a)]};
  for(let i=0;i<rows;i++){const sv=Math.min(s1,s0+i*ds),f=floor(sv);for(let j=0;j<NW;j++){const [w,y,nx,ny]=prof(j),n=.45*Math.sin(sv*.41+j*1.7)+.3*Math.sin(sv*.13+j*.6)+.25*Math.sin(j*2.9+sv*.9);
    const wi=w-nx*n*.8,yi=y-ny*n*.8,[x,z]=wld(F,sv,wi);pi.push(x,f+yi,z);const [x2,z2]=wld(F,sv,w+nx*(.6+n*.3));po.push(x2,f+y+ny*(.6+n*.3),z2);
    const v=.13+.06*(n*.5+.5);ci.push(v,v*1.06,v*1.18);const snow=smooth(.55,.85,ny+n*.1);const r=.36+.08*n;co.push(r+(.92-r)*snow,r+(.94-r)*snow,r+.03+(.97-r-.03)*snow)}}
  for(let i=0;i<rows-1;i++)for(let j=0;j<NW-1;j++){const a=i*NW+j,b=a+NW;idx.push(a,b,a+1,b,b+1,a+1)}
  const mk=(pos,col)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g};
  const tx=snowTex?snowTex():null;
  add(new T.Mesh(mk(pi,ci),new T.MeshStandardMaterial({vertexColors:true,roughness:.95,side:T.DoubleSide})));
  const outer=new T.Mesh(mk(po,co),new T.MeshStandardMaterial({vertexColors:true,roughness:.95,side:T.DoubleSide}));outer.castShadow=true;add(outer);
  /* lanterns on the walls */
  const lm=new T.MeshStandardMaterial({color:0xffc070,emissive:0xffa040,emissiveIntensity:2}),im=new T.MeshStandardMaterial({color:0x2a2a2e,roughness:.6,metalness:.5});
  let sd=1;for(let q=s0+6;q<s1-4;q+=13){const f=floor(q),[x,z]=wld(F,q,sd*10.2);const g=new T.Group();g.position.set(x,f+3.3,z);
    g.add(mesh(new T.BoxGeometry(.32,.42,.32),lm,0,0,0,false));g.add(mesh(new T.BoxGeometry(.42,.06,.42),im,0,.24,0,false));g.add(mesh(new T.BoxGeometry(.06,.06,.7),im,0,.3,sd*-.0,false));
    const gl=new T.Sprite(new T.SpriteMaterial({map:WD.tx?WD.tx('glare.png'):null,color:0xffb060,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false}));gl.scale.set(3.4,3.4,1);g.add(gl);add(g);sd=-sd}
  /* timber frames near the portal and the stone portal itself */
  const ps=portalAtStart?s0:s1,dir=portalAtStart?1:-1;
  for(let q=0;q<4;q++){const sv=ps+dir*(3+q*8),f=floor(sv);for(const w of[-9.6,9.6]){const [x,z]=wld(F,sv,w);const post=mesh(new T.BoxGeometry(.45,6.5,.45),MAT.wood,x,f+3.25,z);post.rotation.y=F.th;add(post)}
    const [bx,bz]=wld(F,sv,0),beam=mesh(new T.BoxGeometry(19.6,.5,.5),MAT.wood,bx,f+6.6,bz);beam.rotation.y=F.th;add(beam)}
  {const f=floor(ps),stone=new T.MeshStandardMaterial({color:0x8a8680,roughness:.9,map:TEX&&TEX.stone||null});
    for(let j=0;j<=16;j++){const t=j/16,a=Math.PI*(1-t),w=12.2*Math.cos(a),y=4+9.4*Math.sin(a),[x,z]=wld(F,ps,w);const b=mesh(new T.BoxGeometry(1.5,1.3,2),stone,x,f+y,z);b.rotation.y=F.th;b.rotation.z=0;b.lookAt(wld(F,ps,0)[0],f+4,wld(F,ps,0)[1]);add(b)}
    for(const sdd of[-1,1]){const [x,z]=wld(F,ps,sdd*12.2),pl=mesh(new T.BoxGeometry(1.8,5,2.2),stone,x,f+2,z);pl.rotation.y=F.th;add(pl);
      const [tx2,tz2]=wld(F,ps-dir*1.4,sdd*10.6);const fl=new T.Sprite(new T.SpriteMaterial({map:WD.tx?WD.tx('glare.png'):null,color:0xffa040,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false}));fl.scale.set(2.4,2.4,1);fl.position.set(tx2,f+3.2,tz2);add(fl);
      add(mesh(new T.CylinderGeometry(.07,.09,1.3,6),MAT.wood,tx2,f+2.4,tz2))}
    const [kx,kz]=wld(F,ps-dir*.2,0);const c=document.createElement('canvas');c.width=512;c.height=96;const g2=c.getContext('2d');g2.fillStyle='#5a4a3a';g2.fillRect(0,0,512,96);g2.fillStyle='#f0e0c0';g2.font='bold 44px serif';g2.textAlign='center';g2.fillText(portalAtStart?'NOORDPAS  ·  NOORDHEIM':'NOORDPAS  ·  EIKENDAL',256,62);
    const board=new T.Mesh(new T.PlaneGeometry(9,1.7),new T.MeshLambertMaterial({map:new T.CanvasTexture(c),side:T.DoubleSide}));board.position.set(kx,f+14.6,kz);board.rotation.y=F.th+(portalAtStart?Math.PI:0);add(board)}}

/* the mountain closes over the tunnel: a rock roof that follows the old shape of the mountain, and a rock face around
   the stone portal, so from outside you only see an opening in the mountainside (not a tube lying in a ditch) */
function coverTunnel(F,s0,s1,floor,raw,cut,portalAtStart,add){const mat=(WD.chunks&&WD.chunks[0]&&WD.chunks[0].m.material)||MAT.rock,NWc=31,ds=2.5,rows=Math.ceil((s1-s0)/ds)+1;
  const pos=[],col=[],uv=[],idx=[],ps=portalAtStart?s0:s1,dir=portalAtStart?1:-1,roof=f=>f+14.6;
  const rock=(x,z,y)=>{const n=fbm(x*.05,z*.05,2),snow=smooth(110,150,y+n*20);return[.40+.1*n+(.92-.40)*snow,.38+.1*n+(.94-.38)*snow,.35+.08*n+(.97-.35)*snow]};
  const width=s=>{let wm=PW_/2+4;for(let w=PW_/2+2;w<95;w+=1.5){let d=1e9;for(const sd of[-1,1]){const [x,z]=wld(F,s,sd*w);d=Math.min(d,raw(x,z)-cut(x,z))}wm=w;if(d<.25)break}return wm+2};
  const topH=(s,w,j)=>{const [x,z]=wld(F,s,w),f=floor(s);if(j===0||j===NWc-1)return cut(x,z)-.5;return Math.max(raw(x,z)+.25,roof(f)+Math.max(0,1-Math.abs(w)/22)*2)};
  for(let i=0;i<rows;i++){const sv=Math.min(s1,s0+i*ds),wm=width(sv);for(let j=0;j<NWc;j++){const w=-wm+2*wm*j/(NWc-1),[x,z]=wld(F,sv,w),y=topH(sv,w,j);pos.push(x,y,z);col.push(...rock(x,z,y));uv.push(x/9,z/9)}}
  for(let i=0;i<rows-1;i++)for(let j=0;j<NWc-1;j++){const a=i*NWc+j,b=a+NWc;idx.push(a,a+1,b,b,a+1,b+1)}
  const mk=(P,C,U,I,want)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();
    const n=g.attributes.normal;let sx=0,sy=0,sz=0;for(let k=0;k<n.count;k++){sx+=n.getX(k);sy+=n.getY(k);sz+=n.getZ(k)}if(sx*want[0]+sy*want[1]+sz*want[2]<0){for(let k=0;k<I.length;k+=3){const t=I[k+1];I[k+1]=I[k+2];I[k+2]=t}g.setIndex(I);g.computeVertexNormals()}
    g.computeBoundingSphere();const m=new T.Mesh(g,mat);m.receiveShadow=true;m.castShadow=true;return m};
  add(mk(pos,col,uv,idx,[0,1,0]));
  /* the rock face over the portal: from the stone arch (or the gorge wall) up to the roof */
  const fp=[],fc=[],fu=[],fi=[],wm=width(ps),f=floor(ps),NF=41;
  for(let j=0;j<NF;j++){const w=-wm+2*wm*j/(NF-1),[x,z]=wld(F,ps-dir*.4,w);const bot=Math.abs(w)<12.9?f+4+9.6*Math.sqrt(Math.max(0,1-(w/12.9)**2))+.5:cut(x,z)-.6,top=Math.max(bot+.2,topH(ps,w,j===0||j===NF-1?0:1)+.1);
    for(const y of[bot,top]){fp.push(x,y,z);fc.push(...rock(x,z,y));fu.push((x+z)/9,y/9)}}
  for(let j=0;j<NF-1;j++){const a=j*2,b=a+2;fi.push(a,b,a+1,a+1,b,b+1)}
  add(mk(fp,fc,fu,fi,[-F.ux*dir,0,-F.uz*dir]))}
/* ---------- the first time you come out of the tunnel: a flight over Noordheim, like the one over Eikendal (no names) ---------- */
function northFlyover(){if(typeof cinematic!=='function'||(window.CIN&&CIN.on))return;const V=(x,y,z)=>new T.Vector3(x,y,z),g=(lx,lz,dy)=>H2(X2+lx,Z2+lz)+dy,Pp=V(PL.x,PL.y+1.6,PL.z),C=P.castle,Y=P.ysdal,G=P.glacier;
  const K=[[V(PL.x+30,PL.y+45,PL.z+40),V(X2+LK.x,NH,Z2+LK.z),2.4],
    [V(X2+C.x+95,g(C.x+95,C.z+70,48),Z2+C.z+70),V(X2+C.x,g(C.x,C.z,16),Z2+C.z),3.4],
    [V(X2+LK.x-70,NH+28,Z2+LK.z+95),V(X2+LK.x,NH,Z2+LK.z),3.0],
    [V(X2+Y.x+65,g(Y.x+65,Y.z-55,30),Z2+Y.z-55),V(X2+Y.x,g(Y.x,Y.z,4),Z2+Y.z),3.0],
    [V(X2+G.x-130,g(G.x-130,G.z+90,75),Z2+G.z+90),V(X2+G.x,g(G.x,G.z,20),Z2+G.z),3.2],
    [V(X2+20,NH+900,Z2+160),V(X2,NH,Z2+40),3.0],
    [V(PL.x+40,PL.y+70,PL.z+90),V(PL.x,PL.y+2,PL.z),1.8],
    [V(PL.x+3,PL.y+3.4,PL.z+8),Pp,0]];
  const T0=[0];for(let i=0;i<K.length-1;i++)T0.push(T0[i]+K[i][2]);const D=T0[T0.length-1];
  WD.fly={pos:new T.CatmullRomCurve3(K.map(k=>k[0]),false,'centripetal'),look:new T.CatmullRomCurve3(K.map(k=>k[1]),false,'centripetal'),D,T0,n:K.length,lab:K.map(()=>''),top:[-1,-1],last:null};
  cinematic([{from:camera.position.clone(),to:camera.position.clone(),lf:Pp,lt:Pp,d:D}],'','',()=>{WD.fly=null;camera.fov=SET.fov;camera.updateProjectionMatrix()})}
ANIMS.push(()=>{if(!started||PL.dead||!N.built||!inN(PL.x)||(PL.fx&&PL.fx.seenNorth)||(window.CIN&&CIN.on)||anyModal())return;if(tunK()>.01||stormK()>.01)return;PL.fx.seenNorth=1;setTimeout(()=>{try{northFlyover()}catch(e){console.warn('north flyover',e)}},600)});
/* how far into a tunnel you are: 0 outside, 1 deep inside */
function tunK(){if(!FM||TUN.m0===null)return 0;const n=inN(PL.x),F=n?FN:FM,[s,w]=loc(F,PL.x,PL.z);if(Math.abs(w)>13)return 0;
  if(n)return s>-PZ-8&&s<TUN.n1?smooth(0,30,TUN.n1-s):0;return s>TUN.m0&&s<PZ+8?smooth(0,30,s-TUN.m0):0}
{const dk=document.createElement('div');dk.style.cssText='position:fixed;inset:0;z-index:5;pointer-events:none;background:#000;opacity:0';document.body.appendChild(dk);
  ANIMS.push(()=>{dk.style.opacity=started&&!PL.dead?smooth(.55,1,stormK()).toFixed(3):0})}
/* walking through the storm: in the middle you go on in the other gorge, at the same spot and facing the same way */
function cross(A,B,s,w){const toN=B===FN;if(toN&&!N.built){busy('Noordheim wordt opgebouwd...');try{build()}finally{busy(false)}}
  const [x,z]=wld(B,s,w),dth=B.th-A.th,dy=PL.y-groundH(PL.x,PL.z);PL.x=x;PL.z=z;PL.y=groundH(x,z)+dy;PL.rot+=dth;PL.yaw+=dth;
  const m=PL.mounted;if(m&&m.x!==undefined){m.x=x;m.z=z;if(m.rot!==undefined)m.rot+=dth;if(m.y!==undefined)m.y=PL.y;m.cave=toN||undefined;try{if(m.root)m.root.position.set(m.x,m.y,m.z)}catch(e){}}
  try{const pet=WD.pet&&WD.pet();if(pet&&pet!==m){const [ps,pw]=loc(A,pet.x,pet.z),[px,pz]=wld(B,ps,pw);pet.x=px;pet.z=pz;if(pet.rot!==undefined)pet.rot+=dth;if(pet.root)pet.root.position.set(px,pet.y,pz)}}catch(e){}
  try{updateCamera(0)}catch(e){}addLog(toN?'Aan het eind van de donkere tunnel kom je in Noordheim.':'Je loopt de tunnel uit. Je bent terug in Eikendal.',toN?'#cfe8ff':'#9cc552')}
ANIMS.push(dt=>{if(!FM||!started||PL.dead)return;const n=inN(PL.x),[s,w]=loc(n?FN:FM,PL.x,PL.z);
  if(!n&&!N.built&&s>-PASS.L-70&&s<PZ+14&&Math.abs(w)<70){busy('Noordheim wordt opgebouwd...');try{build()}finally{busy(false)}}
  if(Math.abs(w)>PW_/2+2)return;if(!n&&s>=0&&s<PZ+8)cross(FM,FN,s,w);else if(n&&s<-1&&s>-PZ-8)cross(FN,FM,s,w)});
/* for testing: jump to the bottom of either gorge */
function travel(toNorth){if(toNorth){if(!N.built){busy('Noordheim wordt opgebouwd...');try{build()}finally{busy(false)}}const [x,z]=wld(FN,PLN-6,0);PL.x=x;PL.z=z;PL.yaw=PL.rot=FN.th}
  else if(FM){const [x,z]=wld(FM,-PASS.L-10,0);PL.x=x;PL.z=z;PL.yaw=PL.rot=FM.th+Math.PI}PL.y=groundH(PL.x,PL.z);PL.vy=0;if(PL.mounted&&!PL.mounted.boatM)PL.mounted=null}
WD.northTravel=travel;
const _bfN=buildFantasy;buildFantasy=function(){_bfN();try{buildPassMain()}catch(e){console.warn('noordpas',e)}};
/* a saved game in Noordheim: build it before you appear there */
const _sgN=startGame;startGame=function(...a){_sgN(...a);if(inN(PL.x)&&!N.built){try{build()}catch(e){console.warn('north',e)}PL.y=groundH(PL.x,PL.z)}};
})();
