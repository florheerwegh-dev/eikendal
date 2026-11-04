/* ================= Light version for iPad and phone =================
   An iPad or a phone has far less graphics memory than a computer. The game's big pictures (the textures of the
   ground, trees, houses and people) did not all fit, and what does not fit is drawn black. On these devices (or when
   "Lichte versie" is switched on in the pause menu) every picture is made smaller as it is loaded (at most 1024 pixels,
   512 on a phone), the screen is drawn at a lower resolution and the game draws less far, so it runs smoothly too.
   This file is loaded right after three.js, before anything else makes a texture. */
(function(){
let forced=null;try{forced=localStorage.getItem('eikendal_licht')}catch(e){}
const ua=navigator.userAgent||'',touchMac=navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1,
  phone=/iPhone|iPod|Android.+Mobile/i.test(ua),tablet=/iPad|Android/i.test(ua)||touchMac;
const ON=forced==='1'||(forced!=='0'&&(phone||tablet));
window.EIK_LIGHT={on:ON,phone,tablet,auto:forced===null};
if(!ON||!window.THREE)return;
const MAX=phone||(navigator.deviceMemory&&navigator.deviceMemory<=2)?512:1024;
/* shrink a loaded picture to fit; canvases the game draws on itself are left alone, they may change later */
function shrink(img){try{if(!img)return img;const isImg=(typeof HTMLImageElement!=='undefined'&&img instanceof HTMLImageElement&&img.complete&&img.naturalWidth),isBmp=(typeof ImageBitmap!=='undefined'&&img instanceof ImageBitmap);
  if(!isImg&&!isBmp)return img;const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;if(w<=MAX&&h<=MAX)return img;
  const k=MAX/Math.max(w,h),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  if(isBmp&&img.close)try{img.close()}catch(e){}return c}catch(e){return img}}
Object.defineProperty(THREE.Texture.prototype,'image',{configurable:true,get(){return this.__img},set(v){this.__img=shrink(v)}});
/* once the game has started up: lower resolution, no shadows, draw less far */
addEventListener('load',()=>{try{SET.pr=Math.min(SET.pr||1,phone?.6:.7);SET.shadows=false;applySettings()}catch(e){}
  const t=setInterval(()=>{if(window.WD&&WD.soepel){WD.soepel.D=Math.min(WD.soepel.D,170);clearInterval(t)}},1000)});
})();
