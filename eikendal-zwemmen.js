/* ================= People swim =================
   People, knights and animals used to stop at the edge of deep water and stand there stuck. Now, when where they are
   going lies across the water (or they are already in it), they wade in and swim, a little slower, with their head
   above the water and the swimming animation, and climb out on the other side. They never swim out to sea for nothing. */
(function(){
const DEEP=-.7,SWIM_Y=-1.2;
const _stZ=stepTo;stepTo=function(a,dt,tx,tz,speed,stop){if(!a||a.cave||a.boatM||a.flyM||a.kind==='pet')return _stZ(a,dt,tx,tz,speed,stop);
  const inW=groundH(a.x,a.z)<DEEP,goal=groundH(tx,tz)>DEEP;
  /* only into the water when the goal is dry land across it, or to get out again */
  if(!inW&&!goal)return _stZ(a,dt,tx,tz,speed,stop);
  const sw=a.swim;a.swim=true;let r;try{r=_stZ(a,dt,tx,tz,inW?speed*.6:speed,stop)}finally{a.swim=sw}
  const now=groundH(a.x,a.z)<DEEP;a.swim=now;if(now){a.aq=Math.max(groundH(a.x,a.z),SWIM_Y);a.stuck=0}else if(a.aq!==undefined&&!a.boatM)a.aq=undefined;return r};
/* swimmers use the swimming animation */
const _ahZ=animHuman;animHuman=function(h,dt,sp,o){const a=h&&h.actor;if(a&&a.swim&&a!==PL&&!(o&&o.sit))o=Object.assign({},o,{swim:true});return _ahZ(h,dt,sp,o)};
})();
