/* ================= De draagstoel =================
   Popes and great lords of the middle ages were carried in a chair on poles (the papal "sedia gestatoria"), borne by
   the sediari: a proud confraternity of chair-bearers, not slaves. So here you hire four bearers of the Dragersgilde,
   in their own livery, for a fee and a wage. Hire them from an innkeeper or a ruler. You sit in the chair and steer as
   on a horse (a steady pace, no galloping or jumping); step out with the usual key and step back in when you stand
   next to it. Every five minutes they get their wage; if you cannot pay, they go home. */
(function(){
const COST=200,WAGE=40,WAGE_T=300,CH={a:null};WD.chair=CH;
function chairModel(col){const g=new T.Group(),wood=MAT.wood,cl=new T.MeshStandardMaterial({color:col,roughness:.85,side:T.DoubleSide}),gold=MAT.gold||new T.MeshStandardMaterial({color:0xd8a83a,metalness:.7,roughness:.3});
  const B=(w,h,d,m,x,y,z)=>{const o=mesh(new T.BoxGeometry(w,h,d),m,x,y,z);g.add(o);return o};
  B(1.2,.12,1.4,wood,0,1.06,0);B(1.2,1.62,.08,cl,0,1.93,-.66);B(.95,.45,.55,cl,0,1.33,-.36);
  for(const s of[-1,1]){B(.08,1.62,.5,cl,s*.58,1.93,-.42);B(.08,.55,.9,cl,s*.58,1.4,.24);for(const t of[-1,1])B(.09,1.66,.09,gold,s*.58,1.95,t*.66)}
  B(1.42,.14,1.62,cl,0,2.8,0);B(1.16,.1,1.36,gold,0,2.9,0);g.add(mesh(new T.SphereGeometry(.18,10,8),gold,0,3.05,0));
  for(const s of[-1,1]){const p=mesh(new T.CylinderGeometry(.05,.05,5,8),wood,s*.68,1.42,0);p.rotation.x=Math.PI/2;g.add(p);const c=mesh(new T.PlaneGeometry(.34,1.2),cl,s*.42,2.1,.68,false);g.add(c)}
  const bearers=[];for(const [x,z] of[[-.68,2.15],[.68,2.15],[-.68,-2.15],[.68,-2.15]]){let h=null;try{h=makeHuman({...randomLook(false),tunic:col,pants:0x2a2420,hat:'cap',hatc:col,scale:1,build:1.1})}catch(e){}if(!h)continue;h.g.position.set(x,0,z);g.add(h.g);bearers.push(h)}
  return{g,bearers,chairM:true}}
function spawnChair(x,z){const col=pick([0x7a1f2a,0x2f4a7a,0x3a6a3a,0x6a3a7a]),m=chairModel(col);
  const a=baseActor({kind:'horse',name:'Draagstoel',model:m,root:m.g,x,z,hp:500,hpMax:500,rad:1.3,speed:5,rider:null,chair:true,mult:.85});a.t=1e9;a.wp=null;a.home={x,z};scene.add(a.root);placeActor(a);return a}
function hire(){if(CH.a){addLog('Je dragers staan al klaar.');return}if(PL.gold<COST){addLog('Een draagstoel met vier dragers kost '+COST+' goud.','#e5766a');return}
  PL.gold-=COST;sfx('coin');const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot);CH.a=spawnChair(PL.x+fz*3,PL.z-fx*3);PL.fx=PL.fx||{};PL.fx.chair={paid:PL.t};closeModals();
  try{WD.kingdom.card('🪑 Je draagstoel','Vier dragers van het Dragersgilde dragen je waar je maar wilt, zoals de sediari ooit de paus droegen. Het zijn trotse vakmensen in livrei: ze krijgen '+WAGE+' goud per vijf minuten. Ga naast de draagstoel staan en stap in; stap uit met dezelfde knop. Naar huis sturen kan bij een herbergier of heerser.',null,12)}catch(e){}
  setTimeout(()=>{if(CH.a&&!PL.mounted){try{mount(CH.a)}catch(e){}}},400)}
function release(why){const a=CH.a;if(!a)return;if(PL.mounted===a)dismount();a.dead=true;a.gone=true;a.respawn=1e12;a.deadT=1e9;scene.remove(a.root);const i=actors.indexOf(a);if(i>=0)actors.splice(i,1);CH.a=null;if(PL.fx)PL.fx.chair=null;addLog(why||'Je dragers gaan naar huis. Bedankt voor de reis!','#e0b04a')}
CH.hire=hire;CH.release=release;
/* the bearers walk; the chair sways a little */
const _aH=animHorse;animHorse=function(m,dt,sp){if(m&&m.chairM){const v=sp>.2?Math.min(sp,4.6):0;for(const b of m.bearers)try{animHuman(b,dt,v,{})}catch(e){}m.ph=(m.ph||0)+dt*(v?6:0);m.g.children[0]&&(m.g.rotation.z=Math.sin(m.ph)*.012*(v?1:0));return}return _aH(m,dt,sp)};
/* in the chair you sit (not ride), and the bearers do not gallop or jump */
const _ahP=animHuman;animHuman=function(h,dt,sp,o){if(h===pm&&PL.mounted&&PL.mounted.chair){const m=PL.mounted;PL.mounted=null;try{return _ahP(h,dt,0,{sit:true})}finally{PL.mounted=m}}return _ahP(h,dt,sp,o)};
const _upC=updatePlayer;updatePlayer=function(dt){if(!(PL.mounted&&PL.mounted.chair))return _upC(dt);const k={};for(const n of['ShiftLeft','ShiftRight','Space']){k[n]=KEYS[n];KEYS[n]=false}try{_upC(dt)}finally{Object.assign(KEYS,k)}};
const _mt=mount;mount=function(h){if(!h||!h.chair)return _mt(h);PL.mounted=h;h.rider=true;h.wp=null;PL.vy=0;addLog('Je stapt in de draagstoel. Je dragers brengen je waar je wilt.','#9cc552')};
/* wages, and after loading a game the bearers come back */
ANIMS.push(()=>{if(!started||PL.dead)return;PL.fx=PL.fx||{};const c=PL.fx.chair;
  if(c&&!CH.a){const fx=Math.sin(PL.rot),fz=Math.cos(PL.rot);CH.a=spawnChair(PL.x+fz*3,PL.z-fx*3)}
  if(CH.a&&!CH.a.rider){CH.a.t=1e9;CH.a.wp=null}
  if(c&&PL.t-c.paid>WAGE_T){if(PL.gold>=WAGE){PL.gold-=WAGE;c.paid=PL.t;addLog('Je dragers krijgen hun loon: '+WAGE+' goud.','#e0b04a')}else release('Je kon je dragers niet betalen, dus zijn ze naar huis gegaan.')}});
/* hire them from an innkeeper or a ruler */
const _dmC=dlgMain;dlgMain=function(a,text){_dmC(a,text);try{if(!(a.job==='innkeeper'||a.job==='lord'))return;const box=document.querySelector('#dlg #dopts');if(!box)return;const b=document.createElement('button');b.className='btn';
  if(CH.a){b.textContent='🪑 Stuur mijn dragers naar huis';b.onclick=()=>{closeModals();release()}}else{b.textContent='🪑 Huur een draagstoel met vier dragers ('+COST+' goud, '+WAGE+' per 5 min.)';b.onclick=()=>hire()}box.appendChild(b)}catch(e){console.warn('chair',e)}};
})();
