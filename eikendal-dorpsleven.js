/* ================= Dorpsleven: houses that look lived in =================
   Every house in the world gets small things around it, so villages and towns look cosy and lived in:
   flower beds along the front wall (left and right of the door), round bushes at the corners, a path of flat stones
   from the door, barrels and crates against a side wall, a woodpile at the back, and sometimes a bench by the door.
   It is all drawn in a few big batches per part of the world, so it costs almost nothing. In winter the flowers are
   gone (only the green stays). */
(function(){
const R=(a,b)=>a+Math.random()*(b-a),CELL=700;
const FLC=[0xe0405a,0xf0c040,0xffffff,0xc070e0,0xff8a3a,0x6a8aff,0xff70b0];
function dress(){const T0=performance.now();const cells=new Map();
  const put=(type,x,y,z,ry=0,s=1,sy=s,col=null,rx=0,rz=0)=>{const k=Math.floor(x/CELL)+','+Math.floor(z/CELL);let c=cells.get(k);if(!c){c={cx:(Math.floor(x/CELL)+.5)*CELL,cz:(Math.floor(z/CELL)+.5)*CELL,t:{}};cells.set(k,c)}(c.t[type]=c.t[type]||[]).push([x,y,z,ry,s,sy,col,rx,rz])};
  const gy=(x,z)=>{try{return terrainH(x,z)}catch(e){return 0}};
  for(const b of BUILDINGS){if(!b||b.x<-2000||b.x>30000||!b.w||!b.d)continue;const w=b.w,d=b.d,dx=b.doorX||0,W=(lx,lz)=>l2w(b,lx,lz);
    const ok=(x,z)=>{const h=gy(x,z);if(h<.6)return false;try{if(roadDist(x,z)<2.2)return false}catch(e){}return true};
    /* flower beds along the front, both sides of the door */
    const fz=d/2+.5;for(const [a,c] of[[-w/2+.6,dx-1.1],[dx+1.1,w/2-.6]]){if(c-a<.8)continue;for(let lx=a;lx<=c;lx+=.42){const [x,z]=W(lx,fz+R(-.08,.08));if(!ok(x,z))continue;const y=gy(x,z);
      put('flower',x,y+R(.28,.38),z,R(0,6),R(.8,1.15),1,FLC[Math.floor(Math.random()*FLC.length)]);if(Math.round(lx/.42)%2===0)put('leaf',x,y+.12,z,R(0,6),R(.8,1.1),.55)}}
    /* bushes at the front corners */for(const sx of[-1,1])if(Math.random()<.7){const [x,z]=W(sx*(w/2+.45),d/2+.35);if(ok(x,z))put('bush',x,gy(x,z)+.45,z,R(0,6),R(.75,1.05),R(.75,.95))}
    /* a path of flat stones from the door */for(let i=0;i<6;i++){const [x,z]=W(dx+R(-.15,.15),d/2+1.1+i*.75);if(!ok(x,z))break;put('stone',x,gy(x,z)+.03,z,R(0,6),R(.85,1.1),1)}
    /* barrels and a crate against a side wall */{const sx=Math.random()<.5?-1:1,lz=R(-d/2+1,d/2-1.2);const [x,z]=W(sx*(w/2+.55),lz);if(ok(x,z)){put('barrel',x,gy(x,z)+.5,z,R(0,6),1);if(Math.random()<.6){const [x2,z2]=W(sx*(w/2+.55),lz+.9);if(ok(x2,z2))put('barrel',x2,gy(x2,z2)+.5,z2,R(0,6),.92)}
      const [x3,z3]=W(sx*(w/2+.5),lz-.95);if(ok(x3,z3))put('crate',x3,gy(x3,z3)+.35,z3,R(-.3,.3),1)}}
    /* a woodpile behind the house */if(Math.random()<.45){const lx=R(-w/2+1.5,w/2-1.5),[x,z]=W(lx,-d/2-.55);if(ok(x,z)){const y=gy(x,z),ry=b.th||0;for(let r=0;r<3;r++)for(let i=0;i<4-r;i++){const off=(i-(3-r)/2)*.32;put('log',x+Math.cos(ry)*off,y+.16+r*.28,z-Math.sin(ry)*off,ry,1,1,null,Math.PI/2)}}}
    /* a bench by the door */if(Math.random()<.3){const lx=dx+(Math.random()<.5?-1.9:1.9);if(Math.abs(lx)<w/2-.6){const [x,z]=W(lx,d/2+.55);if(ok(x,z))put('bench',x,gy(x,z)+.42,z,b.th||0,1)}}}
  /* the shapes, each drawn once per part of the world */
  const GEO={flower:new T.ConeGeometry(.11,.2,5),leaf:new T.IcosahedronGeometry(.22,0),bush:new T.IcosahedronGeometry(.75,1),stone:new T.CylinderGeometry(.36,.4,.07,7),barrel:new T.CylinderGeometry(.36,.32,1,10),crate:new T.BoxGeometry(.7,.7,.7),log:new T.CylinderGeometry(.14,.14,1.6,7),bench:new T.BoxGeometry(1.5,.12,.45)};
  GEO.flower.rotateX(Math.PI);
  const MATS={flower:new T.MeshStandardMaterial({color:0xffffff,roughness:.8}),leaf:new T.MeshStandardMaterial({color:0x3f7a2f,roughness:.95,flatShading:true}),bush:new T.MeshStandardMaterial({color:0x3a6a2a,roughness:.95,flatShading:true}),
    stone:new T.MeshStandardMaterial({color:0x8a857a,roughness:.95}),barrel:MAT.wood||new T.MeshStandardMaterial({color:0x7a5434}),crate:new T.MeshStandardMaterial({color:0x9a7448,roughness:.9}),log:new T.MeshStandardMaterial({color:0x6a4a2a,roughness:.95}),bench:MAT.wood||new T.MeshStandardMaterial({color:0x7a5434})};
  MATS.leaf.name='Leaves';MATS.bush.name='Leaves';
  const m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),s=new T.Vector3(),col=new T.Color();let n=0;
  for(const c of cells.values())for(const [type,L] of Object.entries(c.t)){const g=GEO[type].clone();g.boundingSphere=new T.Sphere(new T.Vector3(0,0,0),CELL*.75);
    const im=new T.InstancedMesh(g,MATS[type],L.length);im.position.set(c.cx,0,c.cz);im.castShadow=type!=='stone'&&type!=='flower';im.receiveShadow=true;
    L.forEach(([x,y,z,ry,sc,sy,cl,rx,rz],i)=>{e.set(rx||0,ry,rz||0);q.setFromEuler(e);v.set(x-c.cx,y,z-c.cz);s.set(sc,sy,sc);m4.compose(v,q,s);im.setMatrixAt(i,m4);if(type==='flower'){col.setHex(cl||0xffffff);im.setColorAt(i,col)}});
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.userData.dlType=type;scene.add(im);DL.push(im);n+=L.length}
  console.log('dorpsleven: '+n+' dingen bij '+BUILDINGS.length+' huizen in '+Math.round(performance.now()-T0)+' ms')}
const DL=[];
const _bfD=buildFantasy;buildFantasy=function(){_bfD();try{dress()}catch(e){console.warn('dorpsleven',e)}};
/* no flowers in winter */
let wt=0;ANIMS.push(dt=>{wt-=(typeof dt==='number'?dt:.016);if(wt>0)return;wt=4;let win=false;try{win=WD.season&&WD.season().k==='winter'}catch(e){}for(const m of DL)if(m.userData.dlType==='flower')m.visible=!win});
WD.dorpsleven={DL};
})();
