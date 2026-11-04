/* ================= Sterrenmaterie =================
   The rarest stuff in the world: matter from a fallen star. Every smith sells it, for 100.000 gold. With one piece a smith
   forges the strongest gear in the game: the Sterrenzwaard (a sword) or the Sterrenharnas (armour). */
(function(){
Object.assign(ITEMS,{
  sterrenmaterie:{n:'Sterrenmaterie',g:'mat',price:100000,ico:'🌠',rar:'m',desc:'Materie van een gevallen ster. Een smid kan er het sterkste zwaard of harnas van de wereld mee smeden.'},
  sterrenzwaard:{n:'Sterrenzwaard',g:'weapon',kind:'sword',dmg:160,spd:.5,rng:3.4,price:150000,ico:'⚔',col:0x9ad8ff,rar:'m'},
  sterrenharnas:{n:'Sterrenharnas',g:'armor',def:40,tunic:0x2a3a9a,pants:0x1a2050,armor:1,fx:{hp:150,regen:3},price:150000,ico:'🛡',rar:'m'}});
const card=(t,x,b,s)=>{try{WD.kingdom.card(t,x,b,s)}catch(e){addLog(t+': '+x)}};
function forge(id){if(!hasItem('sterrenmaterie')){addLog('Je hebt eerst Sterrenmaterie nodig.','#e5766a');return}takeItem('sterrenmaterie',1);giveItem(id,1,true);sfx('level');closeModals();
  card('🌠 '+ITEMS[id].n+'!','De smid hamert de hele nacht. Vonken als sterren vliegen door de smidse... en dan glanst het: het '+ITEMS[id].n+', het sterkste '+(id==='sterrenzwaard'?'zwaard':'harnas')+' van de wereld! Trek het aan in je uitrusting.',null,10);try{WD.chron.add('Liet een '+ITEMS[id].n+' smeden.')}catch(e){}}
const _dmT=dlgMain;dlgMain=function(a,text){_dmT(a,text);try{if(a.job!=='smith')return;const box=document.querySelector('#dlg #dopts');if(!box)return;const add=(l,f)=>{const b=document.createElement('button');b.className='btn pri';b.textContent=l;b.onclick=f;box.insertBefore(b,box.firstChild)};
  if(hasItem('sterrenmaterie')){add('🛡 Smeed een Sterrenharnas (1 Sterrenmaterie)',()=>forge('sterrenharnas'));add('⚔ Smeed een Sterrenzwaard (1 Sterrenmaterie)',()=>forge('sterrenzwaard'))}
  add('🌠 Koop Sterrenmaterie (100.000 goud)',()=>{if(PL.gold<100000){addLog('Sterrenmaterie kost 100.000 goud. Versla de Yeti voor een berg goud!','#e5766a');return}PL.gold-=100000;giveItem('sterrenmaterie',1,true);sfx('coin');closeModals();card('🌠 Sterrenmaterie','De smid legt een gloeiende brok sterrenmaterie in je handen. Praat nog eens met een smid om er het sterkste zwaard of harnas van te laten smeden.',null,9)})}catch(e){console.warn('sterren',e)}};
})();
