/* ================= Horses stay out of deep water; rowing boats instead =================
   A horse will not wade deeper than its belly, so riding across the sea or a lake is no longer possible.
   Instead rowing boats lie by the water: along the harbour pier of Westkaap, at the lake of the Wise Old Tree,
   on the river near the village and wherever there is water close to the town and the castle.
   Step in with E, row with WASD (Shift rows harder) and step out with E at the shore. */
(function(){
const rr=(a=1)=>(Math.random()*2-1)*a,WL=-.05,DEEP=-.45,HORSE_MAX=-.7;
const BOATS=[];WD.boats=BOATS;
let horseMsg=0;

/* ---------- the boat ---------- */
function hullGeo(L,W){const ow=W/2,iw=ow-.07,top=.22,H=.32,n=12,sh=new T.Shape();
  sh.moveTo(-ow,top);sh.lineTo(-ow,0);for(let i=1;i<n;i++){const a=Math.PI*(1+i/n);sh.lineTo(Math.cos(a)*ow,Math.sin(a)*H)}sh.lineTo(ow,0);sh.lineTo(ow,top);
  sh.lineTo(iw,top);sh.lineTo(iw,0);for(let i=n-1;i>0;i--){const a=Math.PI*(1+i/n);sh.lineTo(Math.cos(a)*iw,Math.sin(a)*(H-.07))}sh.lineTo(-iw,0);sh.lineTo(-iw,top);
  const g=new T.ExtrudeGeometry(sh,{depth:L,steps:18,bevelEnabled:false});g.translate(0,0,-L/2);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const z=p.getZ(i),t=Math.min(1,Math.abs(z)/(L/2)),k=1-Math.pow(t,2.4)*.94;let y=p.getY(i);if(y<0)y*=1-.5*t*t;p.setXYZ(i,p.getX(i)*k,y+.2*Math.pow(t,2.5),z)}
  g.computeVertexNormals();return g}
const HW=t=>1-Math.pow(Math.min(1,t),2.4)*.94;
function makeBoat(col){const g=new T.Group(),L=4.2,W=1.5,hm=MAT.wood.clone();hm.color=new T.Color(col);hm.side=T.DoubleSide;
  const hull=new T.Mesh(hullGeo(L,W),hm);hull.castShadow=true;hull.receiveShadow=true;g.add(hull);
  const dk=MAT.wood;g.add(mesh(new T.BoxGeometry(.9,.04,3),dk,0,-.2,0));
  for(const z of[-.75,.55])g.add(mesh(new T.BoxGeometry(W*HW(Math.abs(z)/2.1)-.12,.06,.32),dk,0,.12,z));
  g.add(mesh(new T.BoxGeometry(.9,.06,.4),dk,0,.12,-1.45));
  /* oars in their oarlocks */
  const oars=[];for(const sx of[-1,1]){const piv=new T.Group();piv.position.set(sx*(W/2*HW(.05/2.1)),.26,-.05);g.add(piv);
    const sh=new T.Mesh(new T.CylinderGeometry(.025,.03,2.5,6),dk);sh.rotation.z=Math.PI/2;sh.position.x=sx*.75;piv.add(sh);
    const bl=new T.Mesh(new T.BoxGeometry(.5,.02,.16),dk);bl.position.x=sx*1.85;piv.add(bl);g.add(mesh(new T.CylinderGeometry(.03,.03,.12,6),MAT.iron,piv.position.x,.22,-.05,false));oars.push({piv,sx})}
  /* a lantern on the bow and a coil of rope at the stern */
  g.add(mesh(new T.CylinderGeometry(.03,.035,.6,6),MAT.dark,0,.62,1.85));const lm=new T.MeshStandardMaterial({color:0xffd27a,emissive:0xffa23a,emissiveIntensity:0});
  const lan=mesh(new T.BoxGeometry(.13,.17,.13),lm,0,.98,1.85,false);g.add(lan);g.add(mesh(new T.ConeGeometry(.11,.1,4),MAT.dark,0,1.11,1.85,false));
  const glow=new T.Sprite(new T.SpriteMaterial({map:WD.tx('glare.png'),color:0xffb050,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));glow.scale.set(1.6,1.6,1);glow.position.set(0,.98,1.85);g.add(glow);
  const rope=mesh(new T.TorusGeometry(.14,.035,6,14),MAT.rope,.25,-.14,-1.55);rope.rotation.x=Math.PI/2;g.add(rope);
  g.userData.dyn=true;return{g,oars,lm,glow}}
function addBoat(x,z,rot,col){const m=makeBoat(col),B={x,z,rot,y:WL+.06,aq:WL+.06,root:m.g,model:{boatM:true,phase:0},boatM:true,name:'Roeiboot',mult:.75,rider:false,vel:0,M:m,row:0,i:BOATS.length,home:{x,z,rot}};
  scene.add(m.g);placeActor(B);B.it={x,z,r:3.4,txt:'Stap in de roeiboot',fn:()=>board(B)};INTER.push(B.it);BOATS.push(B);return B}

/* ---------- small wooden docks ---------- */
function dock(x0,z0,x1,z1){const y=WL+.5,cx=(x0+x1)/2,cz=(z0+z1)/2,lx=Math.abs(x1-x0)||1.8,lz=Math.abs(z1-z0)||1.8;
  bridges.push({x:cx,z:cz,hx:lx/2,hz:lz/2,y});scene.add(mesh(new T.BoxGeometry(lx,.14,lz),MAT.wood,cx,y-.07,cz));
  const n=Math.max(2,Math.round(Math.max(lx,lz)/2.2));for(let i=0;i<=n;i++){const t=i/n,px=x0+(x1-x0)*t,pz=z0+(z1-z0)*t;for(const s of[-1,1]){const ox=lx>lz?0:s*.8,oz=lx>lz?s*.8:0,bx=px+ox,bz=pz+oz,bed=terrainH(bx,bz);if(bed>y-.2)continue;scene.add(mesh(new T.CylinderGeometry(.09,.11,y-bed+.4,6),MAT.bark,bx,(y+bed)/2+.15,bz))}}}
/* the nearest spot near (tx,tz) where deep water lies a few metres from dry land along one of the axes */
function findDock(tx,tz,R=140){
  for(let r=0;r<=R;r+=4){const n=Math.max(1,Math.round(r*6.283/4));for(let i=0;i<n;i++){const a=i/n*6.283,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r,g=terrainH(x,z);if(g>-.95||g<-4||(WD.inSea&&WD.inSea(x,z)))continue;
    for(const [dx,dz] of[[1,0],[-1,0],[0,1],[0,-1]]){for(let d=3;d<=9;d++){const lx=x+dx*d,lz=z+dz*d,lg=terrainH(lx,lz);if(lg<DEEP)continue;if(lg<.25)break;
      if(terrainH(x-dz*1.3,z+dx*1.3)<-.7&&terrainH(x+dz*1.3,z-dx*1.3)<-.7&&terrainH(x-dx*2.4,z-dz*2.4)<-.7){const p={x:lx,z:lz};collide(p,.5);if(Math.hypot(p.x-lx,p.z-lz)<.1)return{x,z,lx,lz,dx,dz,d}}break}}}}
  return null}
function buildBoats(){
  /* Westkaap: a boat alongside the pier, where the water is deep enough */
  const HB=WD.harbor;if(HB&&HB.shore){const x0=HB.shore+7,deco=[x0-12,x0-29];for(let x=HB.shore-4;x>HB.pierEnd+4;x-=1)if(!deco.some(d=>Math.abs(d-x)<5.5)&&terrainH(x,HB.z-3.8)<-.85&&terrainH(x-2.5,HB.z-3.8)<-.85&&terrainH(x+2.5,HB.z-3.8)<-.85){addBoat(x-1,HB.z-3.8,-Math.PI/2,0xb86a5a);break}}
  const L=WD.lake,tg=[];if(L)tg.push([L.x+L.r*.55,L.z-L.r*.85]);
  tg.push([riverX(40)-14,40],[riverX(-260)-10,-260],[300,-215],[-330,240],[640,-640]);
  for(const [tx,tz] of tg){try{const s=findDock(tx,tz);if(!s||BOATS.some(B=>Math.hypot(B.x-s.x,B.z-s.z)<90))continue;
    if(s.d>=4.5){const e=2.8;dock(s.lx+s.dx*1.2,s.lz+s.dz*1.2,s.x+s.dx*e,s.z+s.dz*e)}
    addBoat(s.x,s.z,Math.atan2(-s.dx,-s.dz),[0x8aa0c8,0x7ab07a,0xc8a060,0xa080c0][BOATS.length%4])}catch(e){console.warn('boat',e)}}
  RUMORS.push({t:'Paarden gaan niet diep het water in. Wie over het water wil, neemt een roeiboot: er liggen er bij de haven van Westkaap, bij het meer en aan de rivier.',h:'harbor'})}
const _bfB=buildFantasy;buildFantasy=function(){_bfB();try{buildBoats()}catch(e){console.warn('boats',e)}};

/* ---------- getting in and out ---------- */
function landSpot(B){let best=null,bd=1e9;for(let k=0;k<16;k++){const a=k/16*6.283;for(let r=1.6;r<=5;r+=.6){const x=B.x+Math.sin(a)*r,z=B.z+Math.cos(a)*r,g=groundH(x,z);if(g>-.3){const p={x,z};collide(p,.4);if(Math.hypot(p.x-x,p.z-z)<.3&&r<bd){bd=r;best={x,z}}break}}}return best}
function board(B){if(PL.mounted){if(PL.mounted.boatM)return;dismount()}PL.mounted=B;B.rider=true;PL.x=B.x;PL.z=B.z;PL.rot=B.rot;PL.vy=0;PL.y=WL+.12;PL.swim=false;
  addLog('Je stapt in de roeiboot. WASD = roeien, Shift = harder roeien, E = uitstappen aan de kant.','#9fd0ff');try{sfx('splash')}catch(e){}}
function leaveBoat(B,force){const p=landSpot(B);if(!p&&!force){addLog('Roei eerst naar de kant om uit te stappen.','#9fd0ff');return}
  PL.mounted=null;B.rider=false;B.vel=0;if(p){PL.x=p.x;PL.z=p.z}else{PL.x=B.x+Math.cos(B.rot)*1.6;PL.z=B.z-Math.sin(B.rot)*1.6}PL.y=groundH(PL.x,PL.z);PL.vy=0;B.it.x=B.x;B.it.z=B.z;if(p)addLog('Je stapt uit de boot.')}
const _dmB=dismount;dismount=function(){const h=PL.mounted;if(h&&h.boatM){leaveBoat(h,true);return}return _dmB()};
let lsT=0,lsV=null;
const _fiB=findInteract;findInteract=function(){const r=_fiB(),B=PL.mounted;if(!B||!B.boatM)return r;
  if(PL.t>lsT){lsT=PL.t+.3;lsV=landSpot(B)}return{txt:lsV?'Stap uit de boot':'Roei naar de kant om uit te stappen',fn:()=>leaveBoat(B)}};
const _ahB=animHorse;animHorse=function(h,dt,sp){if(h&&h.boatM)return;return _ahB(h,dt,sp)};

/* ---------- moving: the horse stops at belly depth, the boat stays on water ---------- */
const ghOrig=groundH,ghBoat=(x,z)=>x<-2000?ghOrig(x,z):terrainH(x,z)<DEEP?WL+.12:ghOrig(x,z);
const _upB=updatePlayer;updatePlayer=function(dt){
  const h=PL.mounted,ox=PL.x,oz=PL.z;
  if(!h||!h.boatM){const g0=groundH(ox,oz);_upB(dt);const H=PL.mounted;
    if(H&&!H.boatM&&!PL.inCave){const g1=groundH(PL.x,PL.z);if(g1<HORSE_MAX&&g1<g0-1e-4){PL.x=ox;PL.z=oz;PL.y=groundH(ox,oz);H.x=ox;H.z=oz;H.vel=0;PL.speed=0;placeActor(H);H.root.position.y=PL.y;pm.g.position.set(PL.x,PL.y+1.12,PL.z);
      if(PL.t>horseMsg){horseMsg=PL.t+5;addLog('Je paard wil niet dieper het water in. Neem een roeiboot!','#9fd0ff')}}}
    return}
  /* in the boat: the water is the floor, the shore stops the bow */
  const jump=KEYS.Space;KEYS.Space=false;groundH=ghBoat;let err=null;try{_upB(dt)}catch(e){err=e}groundH=ghOrig;KEYS.Space=jump;if(err)throw err;
  if(PL.mounted!==h)return;
  const fx=Math.sin(h.rot),fz=Math.cos(h.rot);if(terrainH(PL.x,PL.z)>DEEP||terrainH(PL.x+fx*1.9,PL.z+fz*1.9)>DEEP+.2||terrainH(PL.x-fx*1.9,PL.z-fz*1.9)>DEEP+.2){if(Math.hypot(PL.x-ox,PL.z-oz)>1e-4){PL.x=ox;PL.z=oz;PL.speed=0}}
  PL.y=WL+.12;PL.onGround=true;PL.vy=0;h.x=PL.x;h.z=PL.z;h.vel=PL.speed;h.it.x=h.x;h.it.z=h.z;
  const t=PL.t,bob=Math.sin(t*1.4)*.04;h.root.position.set(h.x,WL+.06+bob,h.z);h.root.rotation.set(Math.sin(t*1.1)*.02-Math.min(.06,PL.speed*.006),h.rot,Math.sin(t*.9)*.03);
  pm.g.position.set(PL.x,PL.y-.57+bob,PL.z);pm.g.rotation.y=h.rot;
  /* rowing: the oars sweep and dip, water splashes at every stroke */
  const sp=PL.speed;if(sp>.3){const was=Math.sin(h.row);h.row+=dt*(1.6+sp*.32);if(was<0&&Math.sin(h.row)>=0){try{sfx('splash')}catch(e){}if(window.PW&&PW.ps)for(const O of h.M.oars){const ex=h.x+Math.cos(h.rot)*O.sx*-1.9,ez=h.z-Math.sin(h.rot)*O.sx*-1.9;pwBurst(PW.ps,ex,WL+.05,ez,8,1.4,.5,.18,.05,[.9,.97,1],[.7,.85,.95],1.2,4,.8,.8)}}}
  for(const O of h.M.oars){const c=Math.cos(h.row),s=Math.sin(h.row);O.piv.rotation.y=O.sx*(sp>.3?s*.55:0);O.piv.rotation.z=O.sx*(sp>.3?(c>0?-.05:-.32):-.22)}};
ANIMS.push(dt=>{const n=ENV.night||0;for(const B of BOATS){if(Math.abs(B.x-PL.x)>220||Math.abs(B.z-PL.z)>220)continue;B.M.lm.emissiveIntensity=n*1.6;B.M.glow.material.opacity=n*.7;if(B.rider)continue;
  const t=PL.t+B.i*1.7;B.root.position.y=WL+.06+Math.sin(t*1.3)*.05;B.root.rotation.set(Math.sin(t*.9)*.02,B.rot,Math.sin(t*1.1)*.035);for(const O of B.M.oars){O.piv.rotation.y=O.sx*.5;O.piv.rotation.z=-O.sx*.18}}});
})();
