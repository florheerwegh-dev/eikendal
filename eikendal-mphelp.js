/* ================= Multiplayer step-by-step guide =================
   An in-game list of the steps for playing together with Visual Studio Code and Live Server next to the
   multiplayer server (serve.py). The commands can be copied; the friends' address appears once the server runs. */
(function(){
const st=document.createElement('style');st.textContent=`
#mphelp{position:fixed;inset:0;z-index:130;display:none;place-items:center;background:rgba(6,5,3,.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);font-family:var(--f-ui);color:#e8d8b0}
#mphelp.on{display:grid}
#mphelp .bx{position:relative;width:min(660px,94vw);max-height:92vh;overflow:auto;box-sizing:border-box;background:linear-gradient(rgba(32,24,13,.97),rgba(14,11,7,.98));border:1px solid #8a7648;border-radius:10px;box-shadow:0 20px 60px #000,inset 0 0 0 1px rgba(255,230,160,.07);padding:22px 24px 18px}
#mphelp h2{font-family:var(--f-display);font-weight:400;font-size:clamp(26px,4vw,34px);margin:0 36px 14px 0;color:#f6dc9c;letter-spacing:.03em;line-height:1.1}
#mphelp .x{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;border:1px solid #8a7648;background:#1c150b;color:#f3e2b8;font-size:18px;cursor:pointer;line-height:1}
#mphelp .x:hover{border-color:#e0b04a;color:#fff}
#mphelp ol{list-style:none;margin:0;padding:0}
#mphelp li{display:grid;grid-template-columns:32px 1fr;gap:12px;padding:11px 10px;border-radius:8px;margin-bottom:6px;background:rgba(255,230,160,.03)}
#mphelp .n{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-family:var(--f-display);font-size:17px;border:1.5px solid #e0b04a;color:#f6dc9c}
#mphelp .t{font-size:16px;color:#f3e2b8;font-weight:600;line-height:1.3}
#mphelp .d{font-size:13.5px;line-height:1.55;color:#d8c8a0;margin-top:3px}
#mphelp .d b{color:#f3e2b8}
#mphelp .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:6px}
#mphelp .os{font-size:12px;color:#a8977a;min-width:56px}
#mphelp code{font:13px ui-monospace,Menlo,Consolas,monospace;font-variant-ligatures:none;background:#0d0a06;border:1px solid #4a3d26;border-radius:5px;padding:4px 8px;color:#ffe9a0;user-select:all;-webkit-user-select:all;word-break:break-all}
#mphelp .cp{font:12.5px var(--f-ui);padding:4px 10px;border-radius:5px;border:1px solid #8a7648;background:#2a2114;color:#f3e2b8;cursor:pointer}
#mphelp .cp:hover{border-color:#e0b04a;color:#fff}
.mphb{display:inline-block;margin-top:8px;font:13px var(--f-ui);padding:6px 14px;border-radius:5px;border:1px solid #8a7648;background:rgba(24,18,10,.85);color:#f3e2b8;cursor:pointer}
.mphb:hover{border-color:#e0b04a;color:#fff}
@media (max-width:520px){#mphelp .bx{padding:18px 14px 14px}#mphelp li{grid-template-columns:28px 1fr;gap:9px;padding:9px 6px}}`;
document.head.appendChild(st);
const el=document.createElement('div');el.id='mphelp';el.setAttribute('role','dialog');el.setAttribute('aria-label','Stappenplan multiplayer');
el.innerHTML=`<div class="bx"><button class="x" type="button" aria-label="Sluiten">✕</button><h2>Samen spelen met VS Code</h2><ol id="mphsteps"></ol></div>`;
document.body.appendChild(el);
const $h=id=>document.getElementById(id);
const win=/Win/i.test(navigator.platform||navigator.userAgent);
const isIP=h=>/^\d+\.\d+\.\d+\.\d+$/.test(h)&&h!=='127.0.0.1';
const H=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const code=(t,os)=>`<div class="row">${os?`<span class="os">${os}</span>`:''}<code>${H(t)}</code><button class="cp" type="button" data-copy="${H(t)}">Kopieer</button></div>`;
/* the steps for playing together with Visual Studio Code and Live Server */
function steps(){const found=MP.via==='lan',lan=found?MP.lan||'':'',here=location.origin+location.pathname.replace(/index\.html$/,'');
  const addr=[lan&&code(lan),isIP(location.hostname)&&location.origin!==lan?code(here):''].filter(Boolean).join('')||'<div class="d">Dat adres staat in de terminal van stap 4, bijvoorbeeld <b>http://192.168.0.12:8000</b>.</div>';
  return[
    {t:'Zet de game op je computer',d:'Pak de zip <b>Eikendal Open Wereld</b> uit in een map, bijvoorbeeld in Documenten.'},
    {t:'Open de map in VS Code',d:'Start Visual Studio Code, kies <b>File → Open Folder…</b> en kies de map waar <b>index.html</b> in staat.'},
    {t:'Open het spel met Live Server',d:'Klik rechtsonder in VS Code op <b>Go Live</b>, of rechtsklik <b>index.html</b> → <b>Open with Live Server</b>.'},
    {t:'Start de multiplayer-server',d:'Kies in VS Code <b>Terminal → Run Task… → Eikendal multiplayer-server</b>. Of open <b>Terminal → New Terminal</b> en typ:'+
      (win?code('python serve.py --no-browser','Windows')+code('python3 serve.py --no-browser','Mac'):code('python3 serve.py --no-browser','Mac')+code('python serve.py --no-browser','Windows'))+'<div class="d">Laat die terminal open staan zolang jullie spelen.</div>'},
    {t:'Kies Multiplayer en een servernaam',d:'Kies op het titelscherm <b>Multiplayer</b> en een servernaam, bijvoorbeeld <b>eikendal-1</b>.'},
    {t:'Laat je vrienden meedoen',d:'Vrienden op hetzelfde wifi openen dit adres in hun browser en kiezen dezelfde servernaam:'+addr}]}
let last='',tick=null;
function render(){const html=steps().map((s,i)=>`<li><div class="n">${i+1}</div><div><div class="t">${s.t}</div><div class="d">${s.d}</div></div></li>`).join('');
  if(html===last)return;last=html;$h('mphsteps').innerHTML=html}
function copy(t,b){const ok=()=>{b.textContent='Gekopieerd ✓';setTimeout(()=>{b.textContent='Kopieer'},1600)};
  const fb=()=>{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok()}catch(e){}ta.remove()};
  try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e){fb()}}
el.addEventListener('click',e=>{e.stopPropagation();const c=e.target.closest('[data-copy]');if(c)return copy(c.dataset.copy,c);
  if(e.target.closest('.x')||e.target===el)close()});
function open(){if(el.classList.contains('on'))return;try{document.exitPointerLock()}catch(e){}last='';render();el.classList.add('on');tick=setInterval(render,700)}
function close(){el.classList.remove('on');clearInterval(tick);tick=null;if(started&&!PL.dead&&!anyModal()&&typeof lock==='function')try{lock()}catch(e){}}
addEventListener('keydown',e=>{if(!el.classList.contains('on'))return;if(e.key==='Escape'){close()}e.stopImmediatePropagation()},true);
window.mpHelp=open;
/* while the guide is open the game waits, like with any other window */
const _amH=anyModal;anyModal=function(){return el.classList.contains('on')||_amH()};
/* ways in: the title screen, the multiplayer status, the pause menu */
const btn=(txt)=>{const b=document.createElement('button');b.type='button';b.className='mphb';b.textContent=txt;b.onclick=e=>{e.stopPropagation();open()};return b};
{const box=document.getElementById('mpbox');if(box){const w=document.createElement('div');w.appendChild(btn('📋 Stappenplan: multiplayer met VS Code'));box.appendChild(w);
  let shown=false;box.addEventListener('click',e=>{if(!e.target.closest('[data-m="multi"]'))return;setTimeout(()=>{if(!shown&&MP.via==='none'&&MP.mode==='multi'){shown=true;open()}},700)},true)}}
const _msH=mpStatus;mpStatus=function(){_msH();const m=document.getElementById('mpstat');if(m&&MP.via==='none'&&!m.querySelector('.mphl')){const a=document.createElement('a');a.href='#';a.className='mphl';a.textContent=' Bekijk het stappenplan.';a.style.color='#ffe9a0';a.onclick=e=>{e.preventDefault();e.stopPropagation();open()};m.appendChild(a)}};
try{mpStatus()}catch(e){}
const _rpH=renderPause;renderPause=function(){_rpH();const c=document.getElementById('pset');if(c)c.appendChild(btn('📋 Stappenplan: multiplayer met VS Code'))};
})();
