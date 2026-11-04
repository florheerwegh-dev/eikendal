/* ================= Models by Kenney (www.kenney.nl, CC0): rowing boats and the beacon tower =================
   From the Watercraft Kit and the Castle Kit. They load after the world is built:
   - the rowing boats get a real wooden rowboat; its paddles sweep while you row;
   - a sailing boat and a fishing boat lie at anchor off Westkaap;
   - the beacon tower of Westkaap is rebuilt from castle pieces: a square keep with a door, windows, battlements and
     long banners, with the fire basket on top. */
(function(){
const KN={lib:{},done:false};WD.kenney=KN;
async function load(dir,name){try{const buf=await asFetchBin('assets/kenney/'+dir+'/'+name+'.glb');
    return await new Promise((res,rej)=>new T.GLTFLoader().parse(buf,'assets/kenney/'+dir+'/',g=>res(g.scene),rej))}catch(e){console.warn('kenney',name,e);return null}}
const prep=o=>{o.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;const t=m.material&&m.material.map;if(t){t.generateMipmaps=false;t.minFilter=T.NearestFilter;t.magFilter=T.NearestFilter;t.needsUpdate=true}});return o};
/* Kenney's models are coloured by a small palette. To fit the rest of Eikendal they get the game's own stone and
   wood textures (projected along the faces), and the palette only tints them a little, so doors, windows and trim
   stay visible. */
const palCache=new Map();
function palette(img){if(palCache.has(img))return palCache.get(img);const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const d={w:c.width,h:c.height,px:g.getImageData(0,0,c.width,c.height).data};palCache.set(img,d);return d}
function restyle(obj,map,uvScale,sat,colMul){const mat=new T.MeshStandardMaterial({map,vertexColors:true,roughness:.85,color:colMul||0xffffff,side:T.DoubleSide});
  obj.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,old=m.material,img=old&&old.map&&old.map.image;if(!img||g.userData.restyled){m.material=mat;return}g.userData.restyled=1;
    const P=palette(img),uv=g.attributes.uv,pos=g.attributes.position,nor=g.attributes.normal,n=pos.count,col=new Float32Array(n*3),nu=new Float32Array(n*2);
    for(let i=0;i<n;i++){const px=Math.min(P.w-1,Math.max(0,Math.floor(uv.getX(i)*P.w))),py=Math.min(P.h-1,Math.max(0,Math.floor(uv.getY(i)*P.h))),o=(py*P.w+px)*4;
      const r=Math.pow(P.px[o]/255,2.2),gg=Math.pow(P.px[o+1]/255,2.2),b=Math.pow(P.px[o+2]/255,2.2),L=.2126*r+.7152*gg+.0722*b;
      col[i*3]=Math.min(1.25,(L+(r-L)*sat)/.42);col[i*3+1]=Math.min(1.25,(L+(gg-L)*sat)/.42);col[i*3+2]=Math.min(1.25,(L+(b-L)*sat)/.42);
      const ax=Math.abs(nor.getX(i)),ay=Math.abs(nor.getY(i)),az=Math.abs(nor.getZ(i)),x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      if(ay>=ax&&ay>=az){nu[i*2]=x*uvScale;nu[i*2+1]=z*uvScale}else if(ax>=az){nu[i*2]=z*uvScale;nu[i*2+1]=y*uvScale}else{nu[i*2]=x*uvScale;nu[i*2+1]=y*uvScale}}
    g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('uv',new T.BufferAttribute(nu,2));m.material=mat});return obj}
async function loadAll(){const want=[['boats','boat-row-small'],['boats','boat-sail-a'],['boats','boat-fishing-small'],['castle','tower-square-base'],['castle','tower-square-mid-windows'],['castle','tower-square-mid-door'],['castle','tower-square-top'],['castle','flag-banner-long']];
  const r=await Promise.all(want.map(([d,n])=>load(d,n)));want.forEach(([d,n],i)=>{if(r[i])KN.lib[n]=prep(r[i])});
  const L=KN.lib;try{for(const n of['boat-row-small','boat-sail-a','boat-fishing-small'])if(L[n])restyle(L[n],TEX.wood,n==='boat-row-small'?1.2:1.6,.18,0xd8b088);
    for(const n of['tower-square-base','tower-square-mid-windows','tower-square-mid-door','tower-square-top'])if(L[n])restyle(L[n],TEX.stone,2.2,.12,0xe8e4dc);
    if(L['flag-banner-long'])L['flag-banner-long'].traverse(m=>{if(m.isMesh&&m.material&&m.material.map){const t=m.material.map;t.minFilter=t.magFilter=T.NearestFilter}})}catch(e){console.warn('kenney restyle',e)}}

/* ---------- rowing boats ---------- */
function dressBoats(){const src=KN.lib['boat-row-small'];if(!src||!WD.boats)return;
  for(const B of WD.boats){const g=B.M&&B.M.g;if(!g||g.userData.kenney)continue;g.userData.kenney=1;
    for(const c of g.children)c.visible=false;                 /* the old hand-made hull, oars and lantern */
    const k=src.clone(true);k.scale.setScalar(1.75);k.position.y=-.42;g.add(k);B.kpad=k.getObjectByName('paddles')}}
ANIMS.push(()=>{if(!KN.done||!WD.boats)return;for(const B of WD.boats){const p=B.kpad;if(!p)continue;if(B.rider&&PL.speed>.3){p.rotation.x=Math.sin(B.row||0)*.45;p.position.y=.056+Math.max(0,Math.cos(B.row||0))*.05}else p.rotation.x*=.9}});

/* ---------- boats at anchor off Westkaap ---------- */
const MOORED=[];
function mooredBoats(){const S=SITE.harbor;if(!S)return;const kinds=['boat-sail-a','boat-fishing-small','boat-fishing-small'];let n=0;
  for(let a=0;a<6.283&&n<kinds.length;a+=.21)for(const r of[55,70,85]){const x=S.x+Math.cos(a)*r,z=S.z+Math.sin(a)*r;if(terrainH(x,z)>-2.2||MOORED.some(m=>Math.hypot(m.x-x,m.z-z)<22))continue;
    const src=KN.lib[kinds[n]];if(!src)break;const k=src.clone(true);k.scale.setScalar(kinds[n]==='boat-sail-a'?2.6:2.1);k.position.set(x,-.45,z);k.rotation.y=Math.random()*6.283;scene.add(k);MOORED.push({k,x,z,ph:Math.random()*6,ry:k.rotation.y});n++;break}}
ANIMS.push(()=>{if(!MOORED.length)return;const t=PL.t;for(const m of MOORED){m.k.position.y=-.45+Math.sin(t*.9+m.ph)*.12;m.k.rotation.set(Math.sin(t*.7+m.ph)*.03,m.ry,Math.sin(t*.8+m.ph)*.04)}});

/* ---------- the beacon tower of Westkaap ---------- */
function rebuildBeacon(){const L=WD.light;if(!L||!KN.lib['tower-square-base'])return;const y0=terrainH(L.x,L.z);
  const g=scene.children.find(o=>o.isGroup&&Math.abs(o.position.x-L.x)<.01&&Math.abs(o.position.z-L.z)<.01);if(!g)return;
  const S=6,H=1.01*S,top0=18.2,top=4*H,dy=top-top0;
  for(const c of g.children){if(c.isGroup&&Math.hypot(c.position.x,c.position.z)>4)continue;if(Math.hypot(c.position.x,c.position.z)>4.2)continue;
    if(c.position.y>top0+1)c.position.y+=dy;else c.visible=false}
  for(const l of LAMPS||[])if(Math.abs(l.x-L.x)<.1&&Math.abs(l.z-L.z)<.1&&l.y>y0+top0){l.y+=dy;const p=l.flame&&l.flame.parent;if(p&&p!==scene)p.position.y+=dy}
  const t=new T.Group();g.add(t);const put=(n,yy,ry=0)=>{const s=KN.lib[n];if(!s)return;const k=s.clone(true);k.scale.setScalar(S);k.position.set(0,yy,0);k.rotation.y=ry;t.add(k)};
  put('tower-square-base',0);put('tower-square-mid-door',H,Math.PI);put('tower-square-mid-windows',2*H);put('tower-square-mid-windows',3*H,Math.PI/2);put('tower-square-top',4*H);
  const fb=KN.lib['flag-banner-long'];if(fb)for(const [x,z,ry] of[[S*.5+.05,0,0],[-S*.5-.05,0,Math.PI]]){const k=fb.clone(true);k.scale.setScalar(2.2);k.position.set(x,2.15*H,z);k.rotation.y=ry;t.add(k)}
  for(const [a,b] of[[2.6,2.6],[-2.6,2.6],[2.6,-2.6],[-2.6,-2.6]])addCircle(L.x+a,L.z+b,1)}

/* ---------- load once the world stands ---------- */
let started0=false;
ANIMS.push(()=>{if(started0||typeof worldReady==='undefined'||!worldReady||!AS||!AS.ok||!T.GLTFLoader)return;started0=true;
  loadAll().then(()=>{try{dressBoats()}catch(e){console.warn('kenney boats',e)}try{mooredBoats()}catch(e){console.warn('kenney moored',e)}try{rebuildBeacon()}catch(e){console.warn('kenney beacon',e)}KN.done=true})});
})();
