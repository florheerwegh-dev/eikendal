/* ================= Height matters =================
   Many checks only looked at where you are on the map, not how high you are. Flying over a house on your dragon
   made the game think you were inside it (the roof vanished, the rain stopped, the doors creaked), the camera bumped
   into walls far below you, and monsters on the ground still hit you up in the air. Now:
   - you are only "inside" a building when you are really between its floor and its roof;
   - while you fly high the camera ignores the walls, trees and fences below;
   - creatures on the ground cannot hit you with their claws or swords when you are far above them. */
(function(){
const high=()=>{const m=PL.mounted;return!!(m&&m.flyM)&&PL.y-groundH(PL.x,PL.z)>3.5};
const _up=updatePlayer;updatePlayer=function(dt){_up(dt);const b=PL.inside;if(b&&b.y!==undefined&&PL.y>b.y+(b.h||4)+.6)PL.inside=null};
const _uc=updateCamera;updateCamera=function(dt){if(!high())return _uc(dt);const c=collide;collide=()=>false;try{_uc(dt)}finally{collide=c}};
const _dp=damagePlayer;damagePlayer=function(d,src){if(src&&src.kind==='enemy'&&!src.ranged&&!src.flyM&&src.type!=='dragon'&&!src.titan&&PL.y-(src.y||0)>(src.hh||2)+3.5)return;return _dp(d,src)};
/* safety net: an invalid field of view draws a black screen; put it right at once */
ANIMS.push(()=>{if(!(camera.fov>1&&camera.fov<170)){camera.fov=65;camera.updateProjectionMatrix()}});
})();
