/* ================= Iconen: every item its own picture =================
   The game draws each item's icon from its 3D model. But many items had no model of their own and all showed the same
   little bag, and items that differ only in their magic (frost boots, magma boots, storm boots) looked the same.
   Now every item has its own icon:
   - magic gear and weapons keep their 3D model, coloured in their own colour (ice blue, magma red, storm purple...)
     with a small sign in the corner (❄, 🔥, ⚡...);
   - fish, trade goods, trophies, hearts, eggs and other things get their own picture on a coloured coin;
   - potions are bottles in the colour of what they do, and seals are wax seals with the letter of their realm;
   - anything new that would still share an icon gets its own coin with its own colour and first letter. */
(function(){
const EF='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
/* 3D model, tinted: [model of another item to use (or ''), colour, corner sign] */
const V={sword_frost:['',0x9ad8ff,'❄'],sword_obsidian:['',0x2a1a22,'🌑'],shield_buckler:['',0x8a929c,'✴️'],
  storm_boots:['',0x7a6ad8,'⚡'],boots_frost:['',0xbfe8ff,'❄'],boots_magma:['',0xff5a1a,'🔥'],stoomlaarzen:['',0xb08a4a,'💨'],raketlaarzen:['',0xd03a2a,'🚀'],
  helm_fourhands:['',0xc0200a,'🖐'],rime_crown:['',0xbfe8ff,'👑'],storm_hood:['',0x6a5ab8,'⚡'],helm_frost:['',0x9ad8ff,'❄'],helm_magma:['',0xff5a1a,'🔥'],
  ring_fourhands:['',0xc0200a,'🖐'],ring_ember:['',0xff7a2a,'🔥'],ring_spider:['',0x7a3a9a,'🕷'],ring_frost:['',0xbfe8ff,'❄'],
  cloak_fourhands:['',0xc0200a,'🔥'],storm_cloak:['',0x6a5ab8,'⚡'],cloak_frost:['',0xe8eef4,'🐺'],cloak_yeti:['',0xf4f4f4,'❄'],
  amu_wind:['',0x9fe8c8,'🌀'],amu_fourhands:['',0xff5a1a,'🖐'],amu_glacius:['',0x7ad8ff,'🐉'],amu_fireheart:['',0xff7a2a,'❤️'],amu_powerswap:['',0x9a5ad8,'🔄'],klokhart:['',0xd8a83a,'⚙️'],amu_trex:['',0xe8dcc0,'🦖'],amu_scarab:['',0xd8a83a,'🪲'],amu_kraken:['',0x2a9a9a,'🐙'],amu_yeti:['',0xe8f4ff,'❄'],
  axe_grukk:['axe_war',0x7a9a6a,'👺'],club_snotgrom:['club_troll',0x6a8a3a,'👺'],blade_fourhands:['sword_knight',0xff6a2a,'🔥'],axe_fourhands:['axe_war',0xff3a1a,'🖐'],axe_frost:['axe_war',0xbfe8ff,'❄'],axe_obsidian:['axe_war',0x3a1a14,'🌋'],
  hemelzwaard:['sword_knight',0xcfe8ff,'☁️'],spookzwaard:['sword_knight',0x9ad8ff,'👻'],dwergenbijl:['axe_war',0xb8c0c8,'⛏'],sterrenzwaard:['sword_knight',0x3a3aa0,'⭐'],sterrenschild:['shield_knight',0x3a3aa0,'⭐'],oer_klauw:['sword_knight',0x8a2a10,'🦖'],zuurzwaard:['sword_knight',0x7aff2a,'💚'],gifschild:['shield_knight',0x4a8a1a,'💚'],gifpantser:['',0x3a5a1a,'💚'],amu_virulax:['',0x8aff3a,'💚'],moederhart:['',0x3ac8a0,'🐉'],oer_schild:['shield_knight',0x6a2a10,'🦖'],oer_pantser:['',0x6a3a1a,'🦖'],oer_kroon:['',0x8a3a1a,'🦖'],oer_hart:['',0xff4a1a,'🦖'],club_yeti:['club_troll',0xe8f4ff,'❄']};
/* a picture on a coloured coin: [picture, colour, corner sign] */
const E={gifmasker:['😷',0x6a9a3a],tegengif:['🧪',0x8ad83a],gifkristal:['💚',0x2a6a1a],feather:['🪶',0xc04a3a],shark_tooth:['🦈',0x3a6a8a],salmon:['🐟',0xf08a6a],catfish:['🐡',0x7a8a5a],trout:['🐠',0x6aa0c0],glowfish:['🐟',0x3ae0d0,'✨'],
  lava_scale:['🌋',0xa03a1a],queen_eye:['👁️',0x6a2a8a],dragon_heart:['🫀',0xb02a1a,'🐉'],frost_heart:['💙',0x7ac0e8],fenrik_fang:['🦷',0x9aa8c0,'🐺'],
  spice:['🌶️',0xc06a2a],silk:['🧵',0xd88ab8],wine:['🍷',0x7a1a3a],honing:['🍯',0xe0a030],cider:['🍏',0x8ac04a],bont:['🧶',0x8a6a4a],olijfolie:['🫒',0x7a8a3a],koper:['🪙',0xc0703a],rozenwater:['🌹',0xe07090],dadels:['🌴',0xc09a5a],tapijt:['🧿',0x3a5ac0],drakenstaal:['🔩',0x5a4a5a,'🐉'],zeezout:['🧂',0x9ac0d8],
  kompas:['🧭',0xb08a4a],klokuil:['🦉',0xb08a4a,'⚙️'],fossiel:['🐚',0x9a8a6a,'🦕'],barnsteen:['🟠',0xd89020,'🦟'],dino_ei:['🥚',0x7ab05a,'🦖'],raptorklauw:['🦴',0x8a7a5a,'🦖'],trex_tand:['🦷',0xb0a080,'🦖'],kampioensbeker:['🏆',0xd8a83a],drakenei:['🥚',0xb03a2a,'🐉'],weerwolfvacht:['🐺',0x5a4a3a,'🌕'],kevershild:['🪲',0x3a7a5a],
  bloemen:['💐',0xe0a0c0],feesttaart:['🎂',0xe8c0d0],erepenning:['🏅',0xd8a83a],zonneharp:['🎼',0xf0c040,'☀️'],schatkaart:['📜',0xc0a070,'❌'],zielesteen:['🔮',0x6a4ac0],pompoen:['🎃',0xe08a2a],ei:['🥚',0xe8dcc0],melk:['🥛',0xc8d8e8],sterrenmaterie:['🌠',0x2a2a6a],
  seal_sea:['🐚',0x2a7a9a,'🌊'],seal_wolf:['📯',0x6a7a8a,'🐺'],seal_dead:['💀',0x3a3a3a],yeti_fang:['🦷',0xbfe8ff,'❄'],star_shard:['💫',0x3a3a8a],treasure_map:['🗺️',0xc0a070],slime_gel:['🫧',0x6ac04a],wisp_dust:['✨',0x5a8ad8],crab_claw:['🦀',0xd05a3a],
  gouden_blad:['🍂',0xe0b04a,'🌳'],wolkenveer:['🪶',0xbfe0ff,'☁️'],zegelring:['💍',0x8a6a2a,'👑'],piratenkompas:['🧭',0x2a2a2a,'☠️'],elfenmantel:['🍃',0x3f8a6a,'🧝'],
  crown_eik:['👑',0x3a7a3a,'E'],crown_zib:['📿',0x9aa0a8,'Z'],crown_zh:['💠',0x2a6aa0,'ZH'],crown_ysd:['👑',0x7ab0d8,'Y']};
/* potions: [colour of the drink, corner sign] */
const P={reuzendrank:[0xe0502a,'⬆️'],krimpdrank:[0xe070c0,'⬇️'],veerdrank:[0x8ad0ff,'🪶'],schimdrank:[0xa0a0c0,'👻'],drakendrank:[0xff7a1a,'🔥'],kikkerdrank:[0x5ac04a,'🐸']};
/* wax seals: [colour, letter] */
const S={seal_eik:[0x2f7a3a,'E'],seal_zib:[0x8a9098,'Z'],seal_zh:[0x2a5a9a,'ZH'],seal_ysd:[0x6aa8d8,'Y'],seal_aur:[0x6a2a8a,'A'],seal_drk:[0x8a1a1a,'D'],seal_qad:[0xc0802a,'Q'],seal_hgm:[0x8a5a2a,'H'],seal_val:[0x2a8a8a,'V'],seal_roz:[0xd05a7a,'R']};
const css=(c,k=1)=>{const o=new T.Color(c);return'rgb('+Math.min(255,Math.round(o.r*255*k))+','+Math.min(255,Math.round(o.g*255*k))+','+Math.min(255,Math.round(o.b*255*k))+')'};
function cv(){const c=document.createElement('canvas');c.width=c.height=128;return{c,g:c.getContext('2d')}}
function badge(g,b){if(!b)return;g.save();g.beginPath();g.arc(101,101,22,0,7);g.fillStyle='rgba(20,14,6,.88)';g.fill();g.lineWidth=3;g.strokeStyle='#e0b04a';g.stroke();g.textAlign='center';g.textBaseline='middle';
  if(/^[A-Z]+$/.test(b)){g.font='bold '+(b.length>1?17:22)+'px Georgia,serif';g.fillStyle='#ffd27a'}else{g.font='25px '+EF;g.fillStyle='#fff'}g.fillText(b,101,103);g.restore()}
function coin(pic,col,b){const{c,g}=cv(),gr=g.createRadialGradient(50,44,6,64,64,58);gr.addColorStop(0,css(col,1.45));gr.addColorStop(1,css(col,.7));g.fillStyle=gr;g.beginPath();g.arc(64,64,54,0,7);g.fill();g.lineWidth=4;g.strokeStyle=css(col,.4);g.stroke();
  g.lineWidth=2;g.strokeStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(64,64,47,3.6,5.4);g.stroke();
  g.textAlign='center';g.textBaseline='middle';g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=6;g.shadowOffsetY=2;
  if(/^[A-Z?]$/.test(pic)){g.font='bold 58px Georgia,serif';g.fillStyle='#fff'}else{g.font='64px '+EF;g.fillStyle='#fff'}g.fillText(pic,64,69);g.shadowBlur=0;g.shadowOffsetY=0;badge(g,b);return c.toDataURL('image/png')}
function potion(col,b){const{c,g}=cv();g.save();g.beginPath();g.arc(64,82,36,0,7);g.rect(53,28,22,30);g.closePath();g.fillStyle='rgba(210,235,255,.22)';g.fill();g.clip();
  const lg=g.createLinearGradient(0,64,0,118);lg.addColorStop(0,css(col,1.25));lg.addColorStop(1,css(col,.6));g.fillStyle=lg;g.fillRect(20,66,90,60);g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(64,67,34,5,0,0,7);g.fill();
  for(let i=0;i<5;i++){g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(46+i*9,80+(i%3)*9,2+(i%2),0,7);g.fill()}g.restore();
  g.lineWidth=3.5;g.strokeStyle='rgba(235,245,255,.85)';g.beginPath();g.arc(64,82,36,-1.25,4.39);g.lineTo(53,28);g.moveTo(75,28);g.lineTo(75,49);g.stroke();
  g.fillStyle='#8a5a2a';g.fillRect(50,14,28,16);g.fillStyle='#6a4220';g.fillRect(50,26,28,4);g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=4;g.beginPath();g.arc(64,82,26,3.5,4.3);g.stroke();badge(g,b);return c.toDataURL('image/png')}
function seal(col,L){const{c,g}=cv();g.fillStyle=css(col,.55);for(const s of[-1,1]){g.beginPath();g.moveTo(64+s*8,80);g.lineTo(64+s*30,124);g.lineTo(64+s*20,116);g.lineTo(64+s*12,126);g.lineTo(64+s*2,84);g.fill()}
  g.beginPath();for(let i=0;i<=120;i++){const a=i/120*6.283,r=48+3*Math.sin(a*14);i?g.lineTo(64+Math.cos(a)*r,58+Math.sin(a)*r):g.moveTo(64+Math.cos(a)*r,58+Math.sin(a)*r)}
  const gr=g.createRadialGradient(54,48,4,64,58,52);gr.addColorStop(0,css(col,1.5));gr.addColorStop(1,css(col,.75));g.fillStyle=gr;g.fill();g.lineWidth=3;g.strokeStyle=css(col,.45);g.beginPath();g.arc(64,58,35,0,7);g.stroke();
  g.textAlign='center';g.textBaseline='middle';g.font='bold '+(L.length>1?34:44)+'px Georgia,serif';g.fillStyle=css(col,.35);g.fillText(L,65,61);g.fillStyle=css(col,1.7);g.fillText(L,63,59);
  g.font='16px '+EF;g.fillStyle='#ffd27a';g.fillText('⚜',64,30);return c.toDataURL('image/png')}
function tinted(id,base,tint,b){if(!IM.rend)try{_iu('sword')}catch(e){}if(!IM.rend)return null;const m=itemModel3D(base||id,1);if(!m)return null;const tc=new T.Color(tint),mats=[],hot=/🔥|🌋|❤|🖐|⭐|✨/.test(b||'');
  m.traverse(o=>{if(!o.isMesh)return;const cl=x=>{const q=x.clone();mats.push(q);if(q.color)q.color.lerp(tc,.62);if(hot&&q.emissive)q.emissive=tc.clone().multiplyScalar(.3);return q};o.material=Array.isArray(o.material)?o.material.map(cl):cl(o.material)});
  const t=m.userData.tilt||0,s=m.userData.spin||0;m.rotation.set(0,-.6+s,-t);const bb=new T.Box3().setFromObject(m),sz=bb.getSize(new T.Vector3()),f=Math.min(1,1.05/Math.max(sz.x,sz.y,sz.z));m.scale.multiplyScalar(f);m.position.sub(new T.Box3().setFromObject(m).getCenter(new T.Vector3()));
  IM.scene.add(m);IM.rend.render(IM.scene,IM.cam);const{c,g}=cv();g.drawImage(IM.rend.domElement,0,0,128,128);IM.scene.remove(m);m.traverse(o=>{if(o.geometry)o.geometry.dispose()});for(const q of mats)q.dispose();badge(g,b);return c.toDataURL('image/png')}
function custom(id){let v;if((v=V[id]))return tinted(id,v[0],v[1],v[2]);if((v=E[id]))return coin(v[0],v[1],v[2]);if((v=P[id]))return potion(v[0],v[1]);if((v=S[id]))return seal(v[0],v[1]);return null}
const hashCol=id=>{let h=0;for(const ch of id)h=(h*31+ch.charCodeAt(0))|0;return new T.Color().setHSL(((h>>>0)%360)/360,.45,.42).getHex()};
const _iu=itemIconUrl,seen=new Map();
itemIconUrl=function(id){if(IM.url[id])return IM.url[id];let u=null;try{u=custom(id)}catch(e){console.warn('icoon',id,e)}if(u)return IM.url[id]=u;
  u=_iu(id);if(!u)return u;const o=seen.get(u);if(o&&o!==id){try{const it=ITEMS[id],ico=String(it._ico||'');const pic=/\p{Extended_Pictographic}/u.test(ico)?ico:((it.n||'?')[0]||'?').toUpperCase();HC[id]=pic;return IM.url[id]=coin(pic,hashCol(id),null)}catch(e){}}seen.set(u,id);return u};
/* the shape alone (no coin behind it), for things you have not found yet: shown in black, so you see their form */
const BARE={},HC={};
function bare(id){if(BARE[id]!==undefined)return BARE[id];let pic=null;if(E[id])pic=E[id][0];else if(HC[id])pic=HC[id];if(!pic)return BARE[id]=null;
  const{c,g}=cv();g.textAlign='center';g.textBaseline='middle';if(/^[A-Z?]$/.test(pic)){g.font='bold 92px Georgia,serif'}else{g.font='96px '+EF}g.fillStyle='#fff';g.fillText(pic,64,70);return BARE[id]=c.toDataURL('image/png')}
WD.iconen={V,E,P,S,custom,coin,bare};
})();
