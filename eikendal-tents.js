/* ================= Medieval pavilions =================
   Every tent in the game is now a real medieval pavilion, as in old paintings and in reenactment camps: round, with a
   steep conical roof on one centre pole, walls and roof of striped cloth, a scalloped valance hanging from the roof
   edge, an open doorway with its flaps tied back, a golden finial with a pennant that flutters in the wind, and guy
   ropes with pegs. medTent(x, z, options) builds one; the options choose size, colours, door direction, an oval shape,
   no walls (a canopy, as on the carousel) or a tent built at the origin for a group (local). */
(function(){
const MATS=new Map();const cm=(c,o={})=>{const k=c+':'+(o.e||0);if(!MATS.has(k))MATS.set(k,new T.MeshStandardMaterial({color:c,roughness:.92,side:T.DoubleSide,...(o.e?{emissive:c,emissiveIntensity:o.e}:{})}));return MATS.get(k)};
const GOLD=()=>MAT.gold||cm(0xd8a83a),UP=new T.Vector3(0,1,0);
const PAL=[[0xf2ece0,0xb02a22,0xe0b04a],[0xf2ece0,0x2f5a9a,0xe0b04a],[0xe0b04a,0xb02a22,0x2f5a9a],[0xf2ece0,0x3a7a3a,0xb02a22],[0x2f5a9a,0xe0b04a,0xf2ece0],[0x6a2a5a,0xe0b04a,0xf2ece0]];
const PENN=[];
function medTent(x,z,o={}){const p=o.pal||pick(PAL),r=o.r||3,walls=o.walls!==false,hw=o.hw||Math.max(1.5,r*.62),hr=o.hr||r*1.15,n=o.n||(r>2.4?16:12),c1=o.c1??p[0],c2=o.c2??p[1],val=o.val??p[2],local=!!o.local,dth=6.283/n;
  const y=local?0:groundH(x,z),g=new T.Group();g.position.set(x,y,z);g.rotation.y=o.ry||0;if(o.oval)g.scale.set(o.oval,1,1);
  const L=new Map(),put=(geo,m,mtx)=>{let q=geo.index?geo.toNonIndexed():geo.clone();if(mtx)q.applyMatrix4(mtx);for(const k of Object.keys(q.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')q.deleteAttribute(k);q.clearGroups();if(!L.has(m))L.set(m,[]);L.get(m).push(q)};
  const MX=(px,py,pz,ry=0,sx=1,sy=1,sz=1)=>new T.Matrix4().compose(new T.Vector3(px,py,pz),new T.Quaternion().setFromEuler(new T.Euler(0,ry,0)),new T.Vector3(sx,sy,sz));
  const M1=cm(c1),M2=cm(c2),MV=cm(val),MG=GOLD(),MW=MAT.wood,MR=cm(0xcfc4a2);
  /* walls of striped cloth, with an open doorway facing +z */
  if(walls){for(let i=1;i<n;i++)put(new T.CylinderGeometry(r,r*1.03,hw,2,1,true,i*dth-dth/2,dth),i%2?M1:M2,MX(0,hw/2,0));
    for(const s of[-1,1]){const a=s*dth*.5,fl=new T.PlaneGeometry(.75,hw*.96);fl.translate(.375*s,0,0);put(fl,s>0?M1:M2,new T.Matrix4().compose(new T.Vector3(Math.sin(a)*r*1.01,hw/2,Math.cos(a)*r*1.01),new T.Quaternion().setFromEuler(new T.Euler(0,a+s*1.2,0)),new T.Vector3(1,1,1)))}
    put(new T.CircleGeometry(r*.96,n),cm(0x6a4a2a),new T.Matrix4().makeRotationX(-Math.PI/2).setPosition(0,.03,0))}
  /* the steep roof, striped like the walls */
  const base=walls?hw:(o.lift||3);
  for(let i=0;i<n;i++)put(new T.ConeGeometry(r*1.07,hr,2,1,true,i*dth-dth/2,dth),i%2?M2:M1,MX(0,base+hr/2,0));
  /* the scalloped valance and the band it hangs from */
  put(new T.CylinderGeometry(r*1.072,r*1.072,.26,n*2,1,true),MV,MX(0,base+.08,0));const m=Math.round(6.283*r/.5);
  for(let k=0;k<m;k++){const a=k/m*6.283;put(new T.CircleGeometry(.23,8,Math.PI,Math.PI),k%2?MV:MG,MX(Math.sin(a)*r*1.075,base-.04,Math.cos(a)*r*1.075,a))}
  /* centre pole, golden finial and a pennant */
  const top=base+hr;put(new T.CylinderGeometry(.07,.09,top+1.3,6),MW,MX(0,(top+1.3)/2,0));put(new T.SphereGeometry(.17,10,8),MG,MX(0,top+1.38,0));
  if(!walls)for(let k=0;k<6;k++){const a=k/6*6.283;put(new T.CylinderGeometry(.06,.07,base,6),MW,MX(Math.sin(a)*r*.98,base/2,Math.cos(a)*r*.98))}
  /* guy ropes with pegs (not in front of the door) */
  if(walls&&o.ropes!==false&&!local&&r>1.8){for(let k=0;k<8;k++){const a=k/8*6.283+.39;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.6)continue;const A=new T.Vector3(Math.sin(a)*r*1.06,base+.1,Math.cos(a)*r*1.06),B=new T.Vector3(Math.sin(a)*(r+2.2),.05,Math.cos(a)*(r+2.2)),d=B.clone().sub(A),len=d.length();
    put(new T.CylinderGeometry(.018,.018,len,4),MR,new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(UP,d.normalize()),new T.Vector3(1,1,1)));put(new T.BoxGeometry(.08,.3,.08),MW,MX(B.x,.1,B.z))}}
  for(const [mt,gs] of L){let mg=null;try{mg=T.BufferGeometryUtils.mergeBufferGeometries(gs)}catch(e){}for(const q of mg?[mg]:gs){const me=new T.Mesh(q,mt);me.castShadow=true;me.receiveShadow=true;g.add(me)}}
  {const s=new T.Shape();s.moveTo(0,0);s.lineTo(1.7,.22);s.lineTo(0,.46);s.lineTo(0,0);const pm=new T.Mesh(new T.ShapeGeometry(s),cm(o.flag??c2));pm.position.set(0,top+1.0,0);pm.material.side=T.DoubleSide;g.add(pm);PENN.push({m:pm,ph:Math.random()*6})}
  if(o.lamp){const l=new T.Mesh(new T.SphereGeometry(.13,8,6),new T.MeshBasicMaterial({color:0xffc070}));l.position.set(.9,hw*.8,r*1.03);g.add(l)}
  if(!local){scene.add(g);/* walls stop you, the doorway lets you in */if(walls){for(let k=1;k<Math.round(6.283*r/1.1);k++){const a=k/Math.round(6.283*r/1.1)*6.283;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.5)continue;const wa=a+(o.ry||0);addCircle(x+Math.sin(wa)*r*(o.oval&&Math.abs(Math.sin(a))>.7?o.oval:1),z+Math.cos(wa)*r,.45)}}else addCircle(x,z,.4)}
  return g}
/* WD only exists once eikendal-world.js has run, so the palettes are handed over when the page has loaded */
window.medTent=medTent;window.TENT_PAL=PAL;addEventListener('load',()=>{if(window.WD)WD.tentPalettes=PAL});
/* pennants flutter */
ANIMS.push(()=>{const t=performance.now()*.001;for(const p of PENN){const o=p.m;if(!o.parent||!o.parent.visible)continue;o.rotation.y=Math.sin(t*.4+p.ph)*.5+.8;o.rotation.x=Math.sin(t*5+p.ph)*.12}});
})();
