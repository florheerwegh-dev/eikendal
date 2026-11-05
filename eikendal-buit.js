/* ================= Buit: when a boss falls, you see clearly what it dropped and where =================
   - A tall golden beam of light stands on every thing a boss drops, with a glowing ring on the ground; you can see it
     from far away. The things themselves are bigger and do not disappear until you pick them up.
   - A golden star on the small map shows where each one lies, and an arrow at the top of the screen points to the
     nearest one, with how far it is.
   - A card shows what the boss dropped, each with its own icon: what lies on the ground and what went straight into
     your backpack. */
(function(){
const isBoss=a=>!!(a&&a.kind==='enemy'&&(a.boss||(typeof MON!=='undefined'&&MON[a.type]&&MON[a.type].boss)||a.titan||a.isBoss||(a.hpMax||0)>=1200));
const esc2=s=>String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
let CAP=null;const LOOT=[];
const _gi=giveItem;giveItem=function(id,n=1){if(CAP)CAP.items.push([id,n]);return _gi.apply(this,arguments)};
const _mp=makePickup;makePickup=function(){const p=_mp.apply(this,arguments);if(CAP&&p)CAP.picks.push(p);return p};
const _ka=killActor;killActor=function(a){const was=!a||a.dead;if(was||!isBoss(a))return _ka.apply(this,arguments);
  const cap={name:a.name||(MON[a.type]&&MON[a.type].n)||'de eindbaas',x:a.x,z:a.z,items:[],picks:[],g0:PL.gold,gold:0,by:arguments[1]},prev=CAP;CAP=cap;let r;
  try{r=_ka.apply(this,arguments)}finally{cap.gold=Math.max(0,Math.round(PL.gold-cap.g0))}
  setTimeout(()=>{if(CAP===cap)CAP=prev;try{finish(cap)}catch(e){console.warn('buit',e)}},2500);return r};
/* the beam of light */
const beamTex=(()=>{const c=document.createElement('canvas');c.width=4;c.height=128;const g=c.getContext('2d'),gr=g.createLinearGradient(0,128,0,0);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,4,128);return new T.CanvasTexture(c)})();
function beam(p,col){const g=new T.Group();g.userData.dyn=true;const m=new T.MeshBasicMaterial({map:beamTex,color:new T.Color(col).multiplyScalar(.75),transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false});
  const b=new T.Mesh(new T.CylinderGeometry(.4,.6,70,16,1,true),m);b.position.y=35;g.add(b);const b2=new T.Mesh(new T.CylinderGeometry(.2,.3,70,10,1,true),m);b2.position.y=35;g.add(b2);
  const ring=new T.Mesh(new T.RingGeometry(.9,1.25,32),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.08;g.add(ring);
  g.position.set(p.x,(p.y!==undefined?p.y:groundH(p.x,p.z)),p.z);scene.add(g);return{g,ring}}
function finish(cap){const near=cap.by||Math.hypot(PL.x-cap.x,PL.z-cap.z)<90;const picks=cap.picks.filter(p=>p&&Math.hypot(p.x-cap.x,p.z-cap.z)<40);
  for(const p of picks){if(!pickups.includes(p))continue;p.life=1e9;p.bossLoot=true;try{p.m.scale.multiplyScalar(1.6)}catch(e){}const col=p.kind==='gold'?0xffd24a:(ITEMS[p.id]&&ITEMS[p.id].rar==='l'?0xffa020:ITEMS[p.id]&&ITEMS[p.id].rar==='e'?0xc78aff:0xffe08a);LOOT.push({p,name:cap.name,...beam(p,col)})}
  if(!near&&!picks.length)return;
  /* what went straight into the backpack (not the things picked up from the ground in the meantime) */
  const pickIds=new Set(picks.map(p=>p.id));const direct=new Map();for(const [id,n] of cap.items){if(pickIds.has(id)||!ITEMS[id])continue;direct.set(id,(direct.get(id)||0)+n)}
  let gG=0;const ground=new Map();for(const p of picks){if(p.kind==='gold')gG+=p.n||0;else if(p.id&&ITEMS[p.id])ground.set(p.id,(ground.get(p.id)||0)+(p.n||1))}
  if(!ground.size&&!direct.size&&!gG&&!cap.gold)return;showCard(cap.name,ground,gG,direct,cap.gold)}
function row(id,n){return'<div class="lc-i"><span class="lcic">'+itemIconHtml(id)+'</span><span>'+esc2(ITEMS[id].n)+(n>1?' <b>×'+n+'</b>':'')+'</span></div>'}
const coinRow=n=>'<div class="lc-i"><span class="lcic" style="font-size:30px">🪙</span><span><b>'+n+'</b> goud</span></div>';
let cardEl=null,cardT=0;
function showCard(name,ground,gG,direct,dg){if(!cardEl){cardEl=document.createElement('div');cardEl.id='lootcard';cardEl.className='panel';document.body.appendChild(cardEl)}
  let h='<div class="lc-t">🏆 Buit van '+esc2(name)+'!</div>';
  if(ground.size||gG){h+='<div class="lc-s">✨ Op de grond, bij de gouden lichtstralen:</div><div class="lc-g">'+(gG?coinRow(gG):'')+[...ground].map(([id,n])=>row(id,n)).join('')+'</div>'}
  if(direct.size||dg){h+='<div class="lc-s">🎒 Al in je rugzak:</div><div class="lc-g">'+(dg?coinRow(dg):'')+[...direct].map(([id,n])=>row(id,n)).join('')+'</div>'}
  if(ground.size||gG)h+='<div class="lc-n">Volg de pijl bovenaan en de gouden ster op je kaart!</div>';
  h+='<div style="text-align:center;margin-top:8px"><button class="btn pri" id="lcok">OK</button></div>';cardEl.innerHTML=h;cardEl.style.display='block';cardEl.querySelector('#lcok').onclick=()=>cardEl.style.display='none';
  try{sfx('level')}catch(e){}clearTimeout(cardT);cardT=setTimeout(()=>{if(cardEl)cardEl.style.display='none'},14000)}
/* the arrow at the top of the screen */
const AR=document.createElement('div');AR.id='lootarrow';AR.innerHTML='<div class="la-a">➤</div><div class="la-t"></div>';document.body.appendChild(AR);
{const st=document.createElement('style');st.textContent=`#lootcard{position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:31;width:min(460px,92vw);padding:14px 18px;display:none;border-color:#e0b04a!important;box-shadow:0 0 30px rgba(255,200,80,.35)}
#lootcard .lc-t{font-family:var(--f-display);font-size:26px;color:#ffd27a;text-align:center;margin-bottom:6px}#lootcard .lc-s{color:var(--mute);font-size:13px;margin:8px 0 4px}#lootcard .lc-g{display:grid;grid-template-columns:1fr 1fr;gap:5px}
#lootcard .lc-i{display:flex;align-items:center;gap:8px;background:rgba(40,32,20,.8);border:1px solid #5a4b30;border-radius:6px;padding:4px 8px;font-size:14px;color:var(--parch)}#lootcard .lc-i .lcic{width:40px;height:40px;flex:none;display:flex;align-items:center;justify-content:center;font-size:26px}#lootcard .lc-i .lcic img{width:100%;height:100%;object-fit:contain}
#lootcard .lc-n{margin-top:8px;text-align:center;color:#ffe9a8;font-size:14px}
#lootarrow{position:fixed;left:50%;top:86px;transform:translateX(-50%);z-index:12;display:none;flex-direction:column;align-items:center;pointer-events:none;text-shadow:0 2px 4px #000}
#lootarrow .la-a{font-size:40px;color:#ffd24a;line-height:1;filter:drop-shadow(0 0 8px rgba(255,200,60,.8))}#lootarrow .la-t{font-size:13px;color:#ffe9a8;background:rgba(20,14,6,.7);border-radius:10px;padding:1px 8px;margin-top:2px}
@media(max-width:600px){#lootcard .lc-g{grid-template-columns:1fr}}`;document.head.appendChild(st)}
const V3=new T.Vector3();let bt=0;
ANIMS.push(dt=>{dt=typeof dt==='number'?dt:.016;bt+=dt;
  for(let i=LOOT.length-1;i>=0;i--){const L=LOOT[i];if(!pickups.includes(L.p)){scene.remove(L.g);L.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});LOOT.splice(i,1);continue}
    const s=1+Math.sin(bt*3+i)*.18;L.ring.scale.set(s,s,1);L.ring.material.opacity=.55+Math.sin(bt*3+i)*.3;L.g.children[0].rotation.y+=dt*.6}
  /* point to the nearest */
  let best=null,bd=1e9;for(const L of LOOT){const d=Math.hypot(L.p.x-PL.x,L.p.z-PL.z);if(d<bd){bd=d;best=L}}
  if(!best||bd<3.5||!started||PL.dead){AR.style.display='none';return}AR.style.display='flex';
  V3.set(best.p.x,(best.p.y||0)+1,best.p.z).project(camera);let x=V3.x,y=V3.y;if(V3.z>1){x=-x;y=-y}const ang=Math.atan2(x,y);
  AR.firstChild.style.transform='rotate('+(ang-Math.PI/2)+'rad)';AR.lastChild.textContent='Buit van '+best.name+' · '+Math.round(bd)+' m'});
/* a golden star on the small map */
function star(g,x,y,r){g.save();g.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283-Math.PI/2,rr=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.fillStyle='#ffd24a';g.strokeStyle='#3a2408';g.lineWidth=1.5;g.fill();g.stroke();g.restore()}
const _dmB=drawMini;drawMini=function(){_dmB.apply(this,arguments);if(!LOOT.length||!started)return;try{const c=$('mini'),g=c.getContext('2d'),S=c.width||150,span=(WD.kaart&&WD.kaart.span)?WD.kaart.span():210,k=S/span,m=S/2-8;
  for(const L of LOOT){let dx=(L.p.x-PL.x)*k,dz=(L.p.z-PL.z)*k;const d=Math.hypot(dx,dz);if(d>m){dx*=m/d;dz*=m/d}star(g,S/2+dx,S/2+dz,7+Math.sin(bt*4)*1.2)}}catch(e){}};
WD.buit={LOOT,isBoss,showCard};
})();
