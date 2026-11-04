/* ================= Music for the cinematics =================
   Music starts whenever a cinematic runs (the page body gets the class 'cine') and fades out when it ends.
   A track listed in MUSIC is streamed from assets/music. Without one, an epic score is played live with WebAudio:
   a low drone, string chords and a choir in D minor, war drums and a horn melody. Short cinematics get a short sting. */
(function(){
const MUSIC={intro:null,boss:null,other:null}; // e.g. intro:'assets/music/intro.mp3'
const CH=[[50,53,57,62],[46,50,53,58],[53,57,60,65],[48,52,55,60],[50,53,57,62],[43,46,50,55],[46,50,53,58],[45,49,52,57]]; // Dm Bb F C Dm Gm Bb A (midi)
const MEL=[[62,0,1],[65,1.5,.5],[69,2,2],[70,4,1.5],[69,5.5,.5],[65,6,2],[69,8,1],[72,9.5,.5],[69,10,2],[67,12,1.5],[64,13.5,.5],[62,14,2],
  [62,16,1],[65,17.5,.5],[69,18,2],[67,20,1],[70,21.5,.5],[74,22,2],[72,24,1.5],[70,25.5,.5],[69,26,1],[67,27,1],[69,28,4]];
const hz=m=>440*Math.pow(2,(m-69)/12);
let M=null,playing=false,file=null,timer=null;
function setup(){if(M)return M;try{sfx('_')}catch(e){}if(typeof AC==='undefined'||!AC)return null;
  const out=AC.createGain();out.gain.value=0;out.connect(MASTER);
  const rv=AC.createConvolver(),len=AC.sampleRate*3.2,ir=AC.createBuffer(2,len,AC.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}rv.buffer=ir;
  const wet=AC.createGain();wet.gain.value=.55;rv.connect(wet);wet.connect(out);const dry=AC.createGain();dry.gain.value=.75;dry.connect(out);
  M={out,rv,dry};return M}
function bus(g){g.connect(M.dry);g.connect(M.rv)}
function env(g,t,a,s,r,v){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+a+s);g.gain.linearRampToValueAtTime(0,t+a+s+r)}
function strings(m,t,dur,v){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(700,t);f.frequency.linearRampToValueAtTime(1500,t+dur*.6);f.Q.value=.7;const g=AC.createGain();env(g,t,.6,dur-.6,.9,v);f.connect(g);bus(g);
  for(const dt of[-8,0,7]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=hz(m);o.detune.value=dt;o.connect(f);o.start(t);o.stop(t+dur+1)}}
function choir(m,t,dur,v){const src=AC.createGain();src.gain.value=1;const g=AC.createGain();env(g,t,1.1,dur-1.1,1.2,v);
  for(const [fq,q,gn] of[[750,9,1],[1150,10,.6],[2600,12,.25]]){const b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=fq;b.Q.value=q;const bg=AC.createGain();bg.gain.value=gn;src.connect(b);b.connect(bg);bg.connect(g)}bus(g);
  for(const dt of[-12,0,11]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=hz(m);o.detune.value=dt;const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=4.6+Math.random();lg.gain.value=4;l.connect(lg);lg.connect(o.detune);o.connect(src);o.start(t);l.start(t);o.stop(t+dur+1.3);l.stop(t+dur+1.3)}}
function drone(t,dur,v){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=260;const g=AC.createGain();env(g,t,1.5,dur-1.5,1.5,v);f.connect(g);bus(g);for(const [m,ty] of[[38,'sawtooth'],[26,'sine'],[45,'sawtooth']]){const o=AC.createOscillator();o.type=ty;o.frequency.value=hz(m);o.connect(f);o.start(t);o.stop(t+dur+1.6)}}
function drum(t,v,low=1){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(120*low,t);o.frequency.exponentialRampToValueAtTime(42*low,t+.32);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.6);o.connect(g);bus(g);o.start(t);o.stop(t+.65);
  if(noiseBuf){const n=AC.createBufferSource();n.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const ng=AC.createGain();ng.gain.setValueAtTime(v*.5,t);ng.gain.exponentialRampToValueAtTime(.001,t+.18);n.connect(f);f.connect(ng);bus(ng);n.start(t);n.stop(t+.2)}}
function horn(m,t,dur,v){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(500,t);f.frequency.linearRampToValueAtTime(1600,t+.12);f.frequency.linearRampToValueAtTime(1100,t+dur);const g=AC.createGain();env(g,t,.09,dur-.09,.35,v);f.connect(g);bus(g);
  for(const [ty,dt] of[['sawtooth',-5],['sawtooth',5],['square',0]]){const o=AC.createOscillator();o.type=ty;o.frequency.value=hz(m);o.detune.value=dt;const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(7,t+dur);l.connect(lg);lg.connect(o.detune);o.connect(f);o.start(t);l.start(t);o.stop(t+dur+.4);l.stop(t+dur+.4)}}
function swell(t,dur,v){if(!noiseBuf)return;const n=AC.createBufferSource();n.buffer=noiseBuf;n.loop=true;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=4500;const g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+.25);n.connect(f);f.connect(g);bus(g);n.start(t);n.stop(t+dur+.3)}
/* the live score: bars are scheduled a little ahead of time while a cinematic plays */
let S=null;
function score(mode){const beat=mode==='boss'?.5:.62,bar=beat*4;S={t0:AC.currentTime+.08,bar:0,beat,barT:bar,mode};drone(S.t0,600,.12);swell(S.t0,bar*1.8,.06);drum(S.t0,.5,.8);
  timer=setInterval(()=>{if(!playing)return;while(S.t0+S.bar*S.barT<AC.currentTime+1.2)playBar(S.bar++)},150)}
function playBar(i){const t=S.t0+i*S.barT,b=S.beat,c=CH[i%CH.length],boss=S.mode==='boss';
  strings(c[0]-12,t,S.barT,.035);for(const m of c.slice(1))strings(m,t,S.barT,.022);
  if(i>=1)for(const m of[c[1]+12,c[2]+12])choir(m,t,S.barT,.05);
  const hits=boss?[0,1,1.5,2,3,3.5]:i<2?[0,2]:[0,1.5,2,3];for(const k of hits)drum(t+k*b,k===0?.55:.32,k===0?.8:1);
  if((i%4===3)||boss&&i%2===1)for(let k=0;k<6;k++)drum(t+3*b+k*b/6,.12+k*.05,1.2);
  if(i>=2){const off=((i-2)%8)*4;for(const [m,st,du] of MEL)if(st>=off&&st<off+4)horn(m,t+(st-off)*b,du*b,.045)}}
function sting(){const t=AC.currentTime+.05;swell(t,.9,.08);drum(t+.9,.6,.7);for(const m of[50,57,62,65])strings(m,t+.9,1.6,.03);choir(74,t+.9,1.6,.05);choir(69,t+.9,1.6,.05)}
function modeNow(){const h=(document.querySelector('#cinet h1')||{}).textContent||'';return /Kraak|Reus|reus|baas|Draak/.test(h)?'boss':'intro'}
function start(){if(playing)return;const total=(window.CIN&&CIN.total)||8,mode=modeNow(),src=MUSIC[mode]||MUSIC.other;
  if(src){playing=true;file=new Audio(src);file.loop=true;file.volume=0;file.play().catch(()=>{});const v=(typeof SET!=='undefined'?SET.vol:.8)*.8;let k=0;const fi=setInterval(()=>{k=Math.min(1,k+.05);if(file)file.volume=v*k;if(k>=1)clearInterval(fi)},60);return}
  if(!setup())return;try{if(AC.state==='suspended')AC.resume()}catch(e){}
  playing=true;const now=AC.currentTime;M.out.gain.cancelScheduledValues(now);M.out.gain.setValueAtTime(M.out.gain.value,now);M.out.gain.linearRampToValueAtTime(1,now+1.2);
  if(total<3.2){sting();setTimeout(stop,2200);return}score(mode)}
function stop(){if(!playing)return;playing=false;if(timer){clearInterval(timer);timer=null}
  if(file){const f=file;file=null;let v=f.volume;const fo=setInterval(()=>{v=Math.max(0,v-.04);f.volume=v;if(v<=0){clearInterval(fo);f.pause()}},60);return}
  if(M){const now=AC.currentTime;M.out.gain.cancelScheduledValues(now);M.out.gain.setValueAtTime(M.out.gain.value,now);M.out.gain.linearRampToValueAtTime(0,now+2.2);
    const old=M;M=null;setTimeout(()=>{try{old.out.disconnect()}catch(e){}},3200)}}
new MutationObserver(()=>{const on=document.body.classList.contains('cine');if(on&&!playing)setTimeout(()=>{if(document.body.classList.contains('cine'))start()},60);else if(!on&&playing)stop()}).observe(document.body,{attributes:true,attributeFilter:['class']});
window.EMUSIC={start,stop,MUSIC};
})();
