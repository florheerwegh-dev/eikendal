/* ================= Account-code =================
   Your whole game in one code: in the pause menu (H) press "Account-code" and copy it. On another computer, open the
   game, go to the save slots and press "Code plakken": paste it and your hero, gold, realms and everything else are
   loaded into a save slot. The code IS the save (compressed), it lives nowhere else: it does not change when you play
   on, so make a new code when you want to take your newer game along. */
(function(){
const PRE='EIK1-';
function encode(obj){const json=JSON.stringify(obj);let bin;if(window.fflate){const z=fflate.deflateSync(fflate.strToU8(json),{level:9});bin='';for(let i=0;i<z.length;i+=8192)bin+=String.fromCharCode.apply(null,z.subarray(i,i+8192));return PRE+btoa(bin)}
  return 'EIK0-'+btoa(unescape(encodeURIComponent(json)))}
function decode(code){code=String(code||'').replace(/\s+/g,'');let json;
  if(code.startsWith(PRE)){const bin=atob(code.slice(PRE.length)),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);json=fflate.strFromU8(fflate.inflateSync(u))}
  else if(code.startsWith('EIK0-'))json=decodeURIComponent(escape(atob(code.slice(5))));else throw new Error('geen Eikendal-code');
  const o=JSON.parse(json);if(!o||!o.PL||!o.look)throw new Error('code is niet compleet');return o}
const esc2=s=>String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
function modal(html){let ov=document.getElementById('acode');if(ov)ov.remove();ov=document.createElement('div');ov.id='acode';ov.style.cssText='position:fixed;inset:0;z-index:70;display:grid;place-items:center;background:rgba(8,6,4,.75)';
  const b=document.createElement('div');b.className='panel';b.style.cssText='width:min(560px,94vw);max-height:90vh;overflow:auto;padding:16px 18px';b.innerHTML=html;ov.appendChild(b);document.body.appendChild(ov);
  ov.addEventListener('mousedown',e=>e.stopPropagation());ov.addEventListener('keydown',e=>e.stopPropagation());try{document.exitPointerLock()}catch(e){}return{ov,b}}
/* making the code (from the game you are playing now) */
function exportCode(){try{saveGame(false)}catch(e){}const sv=readSlot(SAVES.active);if(!sv){addLog('Er is nog niets opgeslagen.','#e5766a');return}let code;try{code=encode(sv)}catch(e){addLog('De code kon niet gemaakt worden.','#e5766a');return}
  const {ov,b}=modal('<h2 style="margin:0 0 6px">🔑 Je account-code</h2><p style="margin:0 0 8px;color:var(--mute);font-size:14px">In deze code zit je hele spel: '+esc2((sv.look&&sv.look.name)||'je held')+', niveau '+(sv.PL.lvl||1)+', '+Math.round(sv.PL.gold||0)+' goud, je rijken en alles. Plak hem op een andere computer bij <b>Code plakken</b> (bij de opslagplaatsen). De code verandert niet als je verder speelt: maak later een nieuwe.</p>'+
    '<textarea readonly style="width:100%;height:150px;font:12px monospace;word-break:break-all"></textarea><div style="margin-top:8px;display:flex;gap:8px"><button class="btn pri" data-k="copy">📋 Kopieer</button><button class="btn" data-k="x">Sluiten</button><small style="align-self:center;color:var(--mute)" data-k="msg">'+code.length+' tekens</small></div>');
  const ta=b.querySelector('textarea');ta.value=code;b.querySelector('[data-k=x]').onclick=()=>ov.remove();
  b.querySelector('[data-k=copy]').onclick=async()=>{let ok=false;try{await navigator.clipboard.writeText(code);ok=true}catch(e){}if(!ok){ta.focus();ta.select();try{ok=document.execCommand('copy')}catch(e){}}b.querySelector('[data-k=msg]').textContent=ok?'Gekopieerd!':'Selecteer de tekst en druk Ctrl+C (of Cmd+C).'}}
/* pasting a code (on the save slot screen) */
function importCode(){const {ov,b}=modal('<h2 style="margin:0 0 6px">🔑 Code plakken</h2><p style="margin:0 0 8px;color:var(--mute);font-size:14px">Plak hier de account-code van je spel.</p><textarea style="width:100%;height:150px;font:12px monospace;word-break:break-all" placeholder="EIK1-..."></textarea><div data-k="out" style="margin-top:8px"></div><div style="margin-top:8px;display:flex;gap:8px"><button class="btn pri" data-k="go">Laden</button><button class="btn" data-k="x">Sluiten</button></div>');
  const ta=b.querySelector('textarea'),out=b.querySelector('[data-k=out]');b.querySelector('[data-k=x]').onclick=()=>ov.remove();setTimeout(()=>ta.focus(),50);
  b.querySelector('[data-k=go]').onclick=()=>{let sv;try{sv=decode(ta.value)}catch(e){out.innerHTML='<span style="color:#e5766a">Deze code klopt niet ('+esc2(e.message)+').</span>';return}
    const put=i=>{try{localStorage.setItem(slotKey(i),JSON.stringify(sv));localStorage.setItem('eikendal_slot_active',String(i));SAVES.active=i}catch(e){out.innerHTML='<span style="color:#e5766a">Opslaan lukt niet in deze weergave.</span>';return}ov.remove();try{openSlots()}catch(e){}try{addLog('Je spel is geladen in plaats '+i+'.','#9cc552')}catch(e){}};
    let h='<b>'+esc2(sv.look.name||'Reiziger')+'</b> · niveau '+(sv.PL.lvl||1)+' · '+Math.round(sv.PL.gold||0)+' goud. In welke plaats?<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">';
    for(let i=1;i<=SAVES.n;i++){const o=readSlot(i);h+='<button class="btn'+(o?'':' pri')+'" data-slot="'+i+'">Plaats '+i+(o?' (overschrijft '+esc2((o.look&&o.look.name)||'?')+')':' (leeg)')+'</button>'}
    out.innerHTML=h+'</div>';out.querySelectorAll('[data-slot]').forEach(x=>x.onclick=()=>{const i=+x.dataset.slot;if(readSlot(i)&&x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Zeker overschrijven?';return}put(i)})}}
/* the buttons: in the pause menu, and under the save slots */
function pauseBtn(){const s=document.getElementById('psave');if(!s||document.getElementById('pcode'))return;const b=document.createElement('button');b.className='btn';b.id='pcode';b.textContent='🔑 Account-code';b.onclick=exportCode;s.after(b)}
addEventListener('load',pauseBtn);setTimeout(pauseBtn,2000);
/* the save slot screen is made fresh each time (the Play button holds the old function), so watch for it to appear */
function slotFooter(ov){if(!ov||ov.querySelector('#slotcode'))return;const f=document.createElement('div');f.id='slotcode';f.className='panel';f.style.cssText='width:min(560px,94vw);padding:10px 18px;margin-top:8px;display:flex;gap:10px;align-items:center;flex-wrap:wrap';
  f.innerHTML='<button class="btn pri">🔑 Code plakken</button><small style="color:var(--mute)">Speel verder met je spel van een andere computer.</small>';f.querySelector('button').onclick=importCode;ov.style.alignContent='center';ov.appendChild(f)}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.id==='slots')slotFooter(n)}).observe(document.documentElement,{childList:true,subtree:true});
window.EIK_CODE={encode,decode,exportCode,importCode};
})();
