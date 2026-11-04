/* ================= Finding the way =================
   Everyone who walks (villagers, guards and knights, monsters, animals) used to walk straight at their goal and got
   stuck against walls, houses and fences. Now, as soon as someone gets stuck, they work out a route around the
   obstacles (a search over a grid of 1.5 m squares that knows the walls, trees, water and steep slopes), smooth it
   into a few straight stretches and follow it. Only a few routes are worked out per frame, so the game stays fast. */
(function(){
const NAV={budget:3,found:0,failed:0};WD.nav=NAV;
const C=1.5,MAXN=4000;
const skip=x=>x<-2000&&x>-30000;              /* caves and the Demon Realm have their own walls */
function free(x,z,r,swim){const p={x,z};if(collide(p,r))return false;const h=groundH(x,z);if(!swim&&h<-.7)return false;if(swim&&h>-.6)return false;return true}
function los(ax,az,bx,bz,r,swim){const d=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(d/.7));let hp=groundH(ax,az);
  for(let i=1;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(!free(x,z,r,swim))return false;const h=groundH(x,z);if(!swim&&Math.abs(h-hp)>1.1)return false;hp=h}return true}
/* a small binary heap for the search */
function heap(){const a=[];return{a,push(n){a.push(n);let i=a.length-1;while(i>0){const p=(i-1)>>1;if(a[p].f<=a[i].f)break;[a[p],a[i]]=[a[i],a[p]];i=p}},
  pop(){const top=a[0],l=a.pop();if(a.length){a[0]=l;let i=0;for(;;){const L=2*i+1,R=L+1;let m=i;if(L<a.length&&a[L].f<a[m].f)m=L;if(R<a.length&&a[R].f<a[m].f)m=R;if(m===i)break;[a[m],a[i]]=[a[i],a[m]];i=m}}return top}}}
function findPath(a,tx,tz){const r=Math.min(.9,(a.rad||.42)+.08),swim=!!a.swim,ox=a.x,oz=a.z,N=Math.ceil(Math.min(90,Math.hypot(tx-ox,tz-oz)+24)/C);
  const cache=new Map(),key=(i,j)=>(i+512)*1024+(j+512),cx=i=>ox+i*C,cz=j=>oz+j*C;
  const ok=(i,j)=>{if(Math.abs(i)>N||Math.abs(j)>N)return false;const k=key(i,j);let v=cache.get(k);if(v===undefined){v=free(cx(i),cz(j),r,swim);cache.set(k,v)}return v};
  let gi=Math.round((tx-ox)/C),gj=Math.round((tz-oz)/C);gi=Math.max(-N,Math.min(N,gi));gj=Math.max(-N,Math.min(N,gj));
  if(!ok(gi,gj)){let best=null;for(let rr=1;rr<5&&!best;rr++)for(let di=-rr;di<=rr&&!best;di++)for(let dj=-rr;dj<=rr;dj++)if(ok(gi+di,gj+dj)){best=[gi+di,gj+dj];break}if(!best)return null;[gi,gj]=best}
  const H=(i,j)=>{const dx=Math.abs(i-gi),dz=Math.abs(j-gj);return(dx+dz)+(1.414-2)*Math.min(dx,dz)};
  const open=heap(),g=new Map(),from=new Map(),closed=new Set();const k0=key(0,0);g.set(k0,0);open.push({i:0,j:0,f:H(0,0)});let it=0,end=null;
  while(open.a.length&&it++<MAXN){const c=open.pop(),kc=key(c.i,c.j);if(closed.has(kc))continue;closed.add(kc);if(c.i===gi&&c.j===gj){end=c;break}
    const hc=swim?0:groundH(cx(c.i),cz(c.j));
    for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){if(!di&&!dj)continue;const ni=c.i+di,nj=c.j+dj;if(!ok(ni,nj))continue;if(di&&dj&&(!ok(c.i+di,c.j)||!ok(c.i,c.j+dj)))continue;
      if(!swim){const hn=groundH(cx(ni),cz(nj));if(Math.abs(hn-hc)>C*1.05)continue}
      const kn=key(ni,nj);if(closed.has(kn))continue;const ng=g.get(kc)+(di&&dj?1.414:1);if(ng<(g.get(kn)??1e9)){g.set(kn,ng);from.set(kn,kc);open.push({i:ni,j:nj,f:ng+H(ni,nj)})}}}
  if(!end)return null;
  const pts=[];let k=key(end.i,end.j);while(k!==undefined&&k!==k0){const i=Math.floor(k/1024)-512,j=k%1024-512;pts.push([cx(i),cz(j)]);k=from.get(k)}pts.reverse();
  if(Math.hypot(tx-pts[pts.length-1][0],tz-pts[pts.length-1][1])<C*1.5)pts[pts.length-1]=[tx,tz];
  /* pull the string: keep only the corners we cannot see past */
  const out=[];let ax=a.x,az=a.z,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!los(ax,az,pts[j][0],pts[j][1],r,swim))j--;out.push(pts[j]);ax=pts[j][0];az=pts[j][1];i=j+1}
  return out}
NAV.findPath=findPath;
/* guards and knights were far too slow: they now move 1.75 times as fast, other townsfolk 1.25 times */
const _st=stepTo;stepTo=function(a,dt,tx,tz,speed,stop=.5){
  if(a&&a.kind==='npc')speed*=a.guard?1.75:1.25;
  if(!a||a.flyM||skip(a.x))return _st(a,dt,tx,tz,speed,stop);
  const P=a.nav;
  if(P&&Math.hypot(P.tx-tx,P.tz-tz)<3&&P.i<P.pts.length){const p=P.pts[P.i],last=P.i===P.pts.length-1;
    const arrived=_st(a,dt,p[0],p[1],speed,last?stop:.7);
    if(arrived){if(last){a.nav=null;return true}P.i++;a.vel=speed*.8;return false}
    if(a.stuck>1.6||PL.t-P.t0>40){a.nav=null;a.navCd=PL.t+2;a.stuck=0}return false}
  if(P)a.nav=null;
  const r=_st(a,dt,tx,tz,speed,stop);
  if(!r&&a.stuck>.55&&NAV.budget>0&&PL.t>(a.navCd||0)&&Math.hypot(tx-a.x,tz-a.z)>2){NAV.budget--;a.navCd=PL.t+1.2;
    let pts=null;try{pts=findPath(a,tx,tz)}catch(e){}
    if(pts&&pts.length){a.nav={tx,tz,pts,i:0,t0:PL.t};a.stuck=0;NAV.found++}else{a.navCd=PL.t+3;NAV.failed++}}
  return r};
ANIMS.push(()=>{NAV.budget=3});
})();
