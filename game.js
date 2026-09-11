'use strict';
/* ========== утилиты ========== */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const irnd=n=>Math.floor(Math.random()*n);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const fmt=n=>Math.round(n).toLocaleString('ru-RU').replace(/\u00A0/g,' ');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},
             set(k,v){try{localStorage.setItem(k,v)}catch(e){}},
             del(k){try{localStorage.removeItem(k)}catch(e){}}};

const ROWS=8, COLS=8, TYPES=6, MOVES_PER_LEVEL=20, POP_MS=300;
const TIME_START=60, TIME_CAP=90;
const HINT_COST=300, HINT_COST_TIME=4, BOOST_MAX=5;
const RUSH_TIME=20;
const HAM_FIRST=20000, HAM_STEP=20000, FRZ_FIRST=45000, FRZ_STEP=45000;
const SAVE_KEY='sv-save-v12';
const THEMES=['Лазурный штрек','Изумрудный грот','Аметистовая пещера','Рубиновый штрек','Золотая галерея'];
const COLORS=[
  {main:'#ff4d6d',shape:'hex',name:'Рубин'},
  {main:'#ffc53d',shape:'tri',name:'Топаз'},
  {main:'#2ee6a8',shape:'oct',name:'Изумруд'},
  {main:'#3aa0ff',shape:'round',name:'Сапфир'},
  {main:'#b06bff',shape:'penta',name:'Аметист'},
  {main:'#37e0e8',shape:'diamond',name:'Аквамарин'},
];
const key=(r,c)=>r+','+c;

/* ========== облако Firebase (фоном) ========== */
const FB_CFG={apiKey:"AIzaSyAys9JCOo8kH1pgCs_ws_t80Yle6-2cds",authDomain:"samotsvety-92711.firebaseapp.com",projectId:"samotsvety-92711",storageBucket:"samotsvety-92711.firebasestorage.app",messagingSenderId:"533420958666",appId:"1:533420958666:web:4c8c186e75411694bb2533"};
let DB=null;
(function loadFirebase(){
  const s1=document.createElement('script');
  s1.src='https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js';
  s1.onload=()=>{const s2=document.createElement('script');
    s2.src='https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js';
    s2.onload=()=>{try{firebase.initializeApp(FB_CFG);DB=firebase.firestore();
      if(!$('#lbOv').classList.contains('hidden'))renderLb();}catch(e){}};
    s2.onerror=()=>{};document.head.appendChild(s2);};
  s1.onerror=()=>{};document.head.appendChild(s1);
})();
function playerId(){let p=store.get('sv-pid','');if(!p){p='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);store.set('sv-pid',p);}return p;}
function playerName(){return (store.get('sv-name','')||'Старатель').slice(0,14);}
function lbLocalPush(m,s){try{const a=JSON.parse(store.get('sv-lb','[]'));
  a.push({n:playerName(),m,s,d:Date.now()});a.sort((x,y)=>y.s-x.s);
  store.set('sv-lb',JSON.stringify(a.slice(0,30)));}catch(e){}}
function lbLocal(m){try{return JSON.parse(store.get('sv-lb','[]')).filter(r=>r.m===m).slice(0,10);}catch(e){return[];}}
async function lbSubmit(m,s){if(!DB||s<=0)return false;try{
  const ref=DB.collection(m==='time'?'lb_time':'lb_classic').doc(playerId());
  const snap=await ref.get();const old=snap.exists?snap.data():null;
  await ref.set({name:playerName(),best:Math.max(s,old?old.best:0),runs:(old?old.runs:0)+1,at:Date.now()});
  return true;}catch(e){return false;}}
function lbQueuePush(m,s){try{const a=JSON.parse(store.get('sv-lbq','[]'));
  a.push({m,s});store.set('sv-lbq',JSON.stringify(a.slice(-20)));}catch(e){}}
async function lbFlush(){if(!DB)return;let a;
  try{a=JSON.parse(store.get('sv-lbq','[]'));}catch(e){a=[];}
  if(!a.length)return;const left=[];
  for(const it of a){const ok=await lbSubmit(it.m,it.s);if(!ok)left.push(it);}
  store.set('sv-lbq',JSON.stringify(left));}
async function lbTop(m){if(!DB)return null;try{
  const snap=await DB.collection(m==='time'?'lb_time':'lb_classic').orderBy('best','desc').limit(10).get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));}catch(e){return null;}}
let lbMode='classic';
async function renderLb(){
  const list=$('#lbList');list.innerHTML='<li><span class="nm">Загрузка…</span></li>';
  $('#lbTabC').classList.toggle('active',lbMode==='classic');
  $('#lbTabT').classList.toggle('active',lbMode==='time');
  let my=0;try{const la=JSON.parse(store.get('sv-lb','[]')).filter(r=>r.m===lbMode);
    if(la.length)my=Math.max(...la.map(r=>r.s));}catch(e){}
  let ql=0;try{ql=JSON.parse(store.get('sv-lbq','[]')).length;}catch(e){}
  const cloud=await lbTop(lbMode);
  let rows,note;
  if(cloud){rows=cloud.map(r=>({n:r.name,s:r.best,me:r.id===playerId()}));
    if(my>0){const i=rows.findIndex(r=>r.me);
      if(i>=0){if(my>rows[i].s)rows[i].s=my;}
      else rows.push({n:playerName(),s:my,me:true});
      rows.sort((a,b)=>b.s-a.s);rows=rows.slice(0,10);}
    note='Онлайн-таблица: результаты всех игроков по ссылке.';
    if(ql>0)note='Онлайн-таблица: офлайн-результаты ещё доотправляются…';
    if(!navigator.onLine)note='Нет сети: видны ваши результаты с устройства — они доотправятся автоматически.';}
  else{rows=lbLocal(lbMode).map(r=>({n:r.n,s:r.s,me:true}));
    note='Нет сети: показаны результаты этого устройства — они доотправятся в облако автоматически.';}
  if(!rows.length)list.innerHTML='<li><span class="nm">Пока пусто — станьте первым!</span></li>';
  else list.innerHTML=rows.map((r,i)=>'<li class="'+(r.me?'me':'')+'"><span class="pos">'+(i+1)+'</span><span class="nm">'+esc(r.n)+'</span><span class="sc">'+fmt(r.s)+'</span></li>').join('');
  $('#lbNote').textContent=note;}
function openLb(m){lbMode=m||lbMode;$('#lbOv').classList.remove('hidden');renderLb();
  lbFlush().then(()=>renderLb());}

/* ========== звук: стеклянные колокола ========== */
const Snd={ctx:null,on:store.get('sv-snd','1')==='1',
  init(){if(!this.ctx){try{this.ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
    if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();},
  bell(f,d,v){if(!this.on||!this.ctx)return;const t=this.ctx.currentTime;
    const mk=(fr,gv)=>{const o=this.ctx.createOscillator(),gn=this.ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(fr,t);
      gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(gv,t+.004);
      gn.gain.exponentialRampToValueAtTime(.0001,t+d);
      o.connect(gn).connect(this.ctx.destination);o.start(t);o.stop(t+d+.02);};
    mk(f,v);mk(f*2.01,v*.35);mk(f*2.76,v*.12);},
  glass(d,v,fc){if(!this.on||!this.ctx)return;const t=this.ctx.currentTime,
    n=Math.floor(this.ctx.sampleRate*d),
    b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),ch=b.getChannelData(0);
    for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);
    const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),gn=this.ctx.createGain();
    s.buffer=b;f.type='highpass';f.frequency.value=fc;gn.gain.value=v;
    s.connect(f).connect(gn).connect(this.ctx.destination);s.start(t);},
  noise(d,v,fc){if(!this.on||!this.ctx)return;const t=this.ctx.currentTime,
    n=Math.floor(this.ctx.sampleRate*d),
    b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),ch=b.getChannelData(0);
    for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);
    const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),gn=this.ctx.createGain();
    s.buffer=b;f.type='lowpass';f.frequency.value=fc;gn.gain.value=v;
    s.connect(f).connect(gn).connect(this.ctx.destination);s.start(t);},
  pop(c){const scale=[0,2,4,7,9,12,14,16,19,21,24];
    const f=392*Math.pow(2,scale[Math.min(c-1,scale.length-1)]/12);
    this.bell(f,.22,.22);this.glass(.05,.10,5200);},
  swap(){this.glass(.09,.08,1800);this.bell(300,.09,.08);},
  tick(){this.bell(880,.07,.07);},
  tickLow(){this.bell(520,.09,.09);},
  bad(){this.bell(140,.2,.14);this.glass(.06,.06,900);},
  boom(){this.noise(.32,.3,900);this.bell(90,.35,.3);},
  mega(){this.noise(.5,.35,1200);this.bell(70,.5,.3);
    [0,4,7,12].forEach((s,i)=>setTimeout(()=>this.bell(392*Math.pow(2,s/12),.18,.12),i*60));},
  rush(){[0,4,7,9,12,16,19,24].forEach((s,i)=>setTimeout(()=>this.bell(523*Math.pow(2,s/12),.14,.1),i*55));},
  spawn(){this.bell(980,.12,.1);},
  prism(){[0,5,7,12,17].forEach((s,i)=>setTimeout(()=>this.bell(440*Math.pow(2,s/12),.16,.12),i*55));},
  levelup(){[0,4,7,12,16,19,24].forEach((s,i)=>setTimeout(()=>this.bell(523*Math.pow(2,s/12),.2,.14),i*90));},
  shuffleS(){this.glass(.25,.1,1200);this.bell(240,.25,.1);},
  overS(){[0,-3,-5,-8].forEach((s,i)=>setTimeout(()=>this.bell(392*Math.pow(2,s/12),.25,.14),i*140));},
  iceCrack(){this.glass(.08,.16,4200);this.bell(1500,.1,.08);},
  iceBreak(){this.glass(.16,.22,3600);this.bell(1800,.18,.12);this.bell(2400,.14,.08);},
  rockHit(){this.noise(.09,.22,700);this.bell(160,.1,.1);},
  rockBreak(){this.noise(.26,.3,1000);this.bell(120,.3,.2);this.glass(.1,.12,2500);},
};

/* ========== спрайты ========== */
const canvas=$('#board'), ctx=canvas.getContext('2d');
let boardPx=0, cell=0, dpr=1;
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16&255,g=n>>8&255,b=n&255;
  if(amt>=0){r+=(255-r)*amt;g+=(255-g)*amt;b+=(255-b)*amt}else{r*=1+amt;g*=1+amt;b*=1+amt}
  return `rgb(${r|0},${g|0},${b|0})`;}
function polyPts(n,R,a0){const a=[];for(let i=0;i<n;i++){const t=(a0+i*360/n)*Math.PI/180;
  a.push([Math.cos(t)*R,Math.sin(t)*R])}return a;}
function shapePts(kind,R){switch(kind){
  case 'hex':return polyPts(6,R,-90);
  case 'tri':return polyPts(3,R*1.08,-90);
  case 'penta':return polyPts(5,R,-90);
  case 'oct':{const a=R*.98,b=R*.42;return[[-b,-a],[b,-a],[a,-b],[a,b],[b,a],[-b,a],[-a,b],[-a,-b]];}
  case 'diamond':return[[0,-R*1.06],[R*.74,0],[0,R*1.06],[-R*.74,0]];
  default:return null;}}
function pathShape(x,pts,R){x.beginPath();
  if(!pts){x.arc(0,0,R,0,Math.PI*2);return}
  x.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]);x.closePath();}
const SPR=[], SPR_S=192;
function makeGem(t){
  const S=SPR_S,cv=document.createElement('canvas');cv.width=cv.height=S;
  const x=cv.getContext('2d'),col=COLORS[t].main,R=S*.385,pts=shapePts(COLORS[t].shape,R);
  x.translate(S/2,S/2);x.lineJoin='round';
  const P=sc=>pathShape(x,pts?pts.map(p=>[p[0]*sc,p[1]*sc]):null,R*sc);
  x.save();x.shadowColor=col;x.shadowBlur=S*.10;
  P(1);x.fillStyle=shade(col,-.55);x.fill();x.restore();
  let g=x.createRadialGradient(-R*.38,-R*.48,R*.08,0,R*.1,R*1.5);
  g.addColorStop(0,shade(col,.72));g.addColorStop(.28,shade(col,.28));
  g.addColorStop(.62,col);g.addColorStop(1,shade(col,-.62));
  P(1);x.fillStyle=g;x.fill();
  if(pts){
    const n=pts.length, inner=pts.map(p=>[p[0]*.52,p[1]*.52]);
    for(let i=0;i<n;i++){
      const p1=pts[i],p2=pts[(i+1)%n],i1=inner[i],i2=inner[(i+1)%n];
      const ma=Math.atan2((p1[1]+p2[1])/2,(p1[0]+p2[0])/2);
      let b=(Math.cos(ma+Math.PI*.75)+1)/2;
      x.beginPath();x.moveTo(p1[0],p1[1]);x.lineTo(p2[0],p2[1]);
      x.lineTo(i2[0],i2[1]);x.lineTo(i1[0],i1[1]);x.closePath();
      x.fillStyle=b>.5?`rgba(255,255,255,${(b-.5)*.5})`:`rgba(4,10,20,${(.5-b)*.55})`;
      x.fill();}
    x.beginPath();x.moveTo(inner[0][0],inner[0][1]);
    for(const p of inner)x.lineTo(p[0],p[1]);x.closePath();
    const tg=x.createLinearGradient(-R*.5,-R*.5,R*.5,R*.5);
    tg.addColorStop(0,shade(col,.85));tg.addColorStop(.5,shade(col,.35));tg.addColorStop(1,shade(col,-.25));
    x.fillStyle=tg;x.fill();
    x.lineWidth=S*.008;x.strokeStyle='rgba(255,255,255,.35)';x.stroke();
    x.lineWidth=S*.006;x.strokeStyle='rgba(255,255,255,.15)';x.beginPath();
    for(let i=0;i<n;i++){x.moveTo(pts[i][0],pts[i][1]);x.lineTo(inner[i][0],inner[i][1])}x.stroke();
  }else{
    const sg=x.createRadialGradient(-R*.35,-R*.4,R*.05,0,0,R*1.05);
    sg.addColorStop(0,'rgba(255,255,255,.55)');sg.addColorStop(.35,'rgba(255,255,255,.06)');
    sg.addColorStop(.72,'rgba(0,0,0,.18)');sg.addColorStop(1,'rgba(0,0,0,.5)');
    x.beginPath();x.arc(0,0,R,0,7);x.fillStyle=sg;x.fill();
    x.strokeStyle='rgba(255,255,255,.16)';x.lineWidth=S*.007;x.beginPath();
    for(let i=0;i<6;i++){const a=i*Math.PI/3;
      x.moveTo(Math.cos(a)*R*.28,Math.sin(a)*R*.28);x.lineTo(Math.cos(a)*R*.95,Math.sin(a)*R*.95)}x.stroke();
    x.beginPath();x.arc(0,0,R*.28,0,7);x.strokeStyle='rgba(255,255,255,.25)';x.stroke();}
  const vg=x.createRadialGradient(0,-R*.2,R*.2,0,R*.15,R*1.25);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(2,8,16,.45)');
  P(1);x.fillStyle=vg;x.fill();
  const eg=x.createLinearGradient(-R,-R,R,R);
  eg.addColorStop(0,'rgba(255,255,255,.75)');eg.addColorStop(.45,'rgba(255,255,255,.15)');
  eg.addColorStop(.6,'rgba(0,0,0,.25)');eg.addColorStop(1,'rgba(0,0,0,.5)');
  P(1);x.lineWidth=S*.03;x.strokeStyle=eg;x.stroke();
  P(1.02);x.lineWidth=S*.014;x.strokeStyle='rgba(5,10,20,.55)';x.stroke();
  x.save();x.translate(-R*.34,-R*.46);x.rotate(-.6);x.scale(1,.48);
  x.shadowColor='rgba(255,255,255,.95)';x.shadowBlur=S*.05;
  x.fillStyle='rgba(255,255,255,.85)';
  x.beginPath();x.ellipse(0,0,R*.3,R*.16,0,0,7);x.fill();x.restore();
  x.fillStyle='rgba(255,255,255,.95)';
  x.beginPath();x.arc(-R*.14,-R*.64,R*.045,0,7);x.fill();
  x.save();x.globalAlpha=.35;x.fillStyle=shade(col,.55);
  x.beginPath();x.ellipse(R*.14,R*.72,R*.3,R*.1,0,0,7);x.fill();x.restore();
  return cv;}
function buildSprites(){for(let t=0;t<TYPES;t++)SPR[t]=makeGem(t);}
let PRISM=null;
function buildPrism(){
  const S=SPR_S,cv=document.createElement('canvas');cv.width=cv.height=S;
  const x=cv.getContext('2d'),R=S*.4;x.translate(S/2,S/2);
  const g=x.createRadialGradient(-R*.3,-R*.4,R*.05,0,0,R*1.2);
  g.addColorStop(0,'#5a7ba6');g.addColorStop(.5,'#20344f');g.addColorStop(1,'#0a1424');
  x.beginPath();x.arc(0,0,R,0,7);x.fillStyle=g;x.fill();
  for(let i=0;i<12;i++){const a0=i*Math.PI/6,a1=a0+Math.PI/6+.03,hue=i*30;
    x.beginPath();x.arc(0,0,R*.82,a0,a1);x.lineWidth=S*.045;
    x.strokeStyle=`hsla(${hue},95%,65%,.9)`;x.shadowColor=`hsl(${hue},95%,60%)`;x.shadowBlur=9;x.stroke();}
  x.shadowBlur=0;
  for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/2;
    x.fillStyle=COLORS[i].main;x.shadowColor=COLORS[i].main;x.shadowBlur=10;
    x.beginPath();x.arc(Math.cos(a)*R*.45,Math.sin(a)*R*.45,R*.13,0,7);x.fill();}
  x.shadowColor='#fff';x.shadowBlur=16;
  const c=x.createRadialGradient(0,0,0,0,0,R*.45);
  c.addColorStop(0,'#fff');c.addColorStop(.4,'rgba(255,255,255,.7)');c.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=c;x.beginPath();x.arc(0,0,R*.45,0,7);x.fill();
  x.shadowBlur=0;x.fillStyle='rgba(255,255,255,.9)';
  x.beginPath();x.ellipse(-R*.35,-R*.45,R*.18,R*.09,-.6,0,7);x.fill();
  x.strokeStyle='rgba(5,10,20,.6)';x.lineWidth=S*.022;
  x.beginPath();x.arc(0,0,R,0,7);x.stroke();
  PRISM=cv;}
let MEGA=null;
function buildMega(){
  const S=SPR_S,cv=document.createElement('canvas');cv.width=cv.height=S;
  const x=cv.getContext('2d'),R=S*.4;x.translate(S/2,S/2);
  const g=x.createRadialGradient(-R*.3,-R*.35,R*.05,0,0,R*1.15);
  g.addColorStop(0,'#7d8fa0');g.addColorStop(.45,'#2c3a46');g.addColorStop(1,'#0a121c');
  x.beginPath();x.arc(0,0,R,0,7);x.fillStyle=g;x.fill();
  x.lineWidth=S*.03;x.strokeStyle='rgba(5,10,18,.85)';x.stroke();
  x.fillStyle='#48596a';
  for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;
    x.beginPath();x.arc(Math.cos(a)*R*.8,Math.sin(a)*R*.8,R*.09,0,7);x.fill();}
  const c=x.createRadialGradient(0,0,0,0,0,R*.55);
  c.addColorStop(0,'#fff6d8');c.addColorStop(.35,'#ffd66b');c.addColorStop(.75,'#ff7a1a');c.addColorStop(1,'rgba(255,90,20,0)');
  x.shadowColor='#ff8c2e';x.shadowBlur=18;x.fillStyle=c;
  x.beginPath();x.arc(0,0,R*.55,0,7);x.fill();x.shadowBlur=0;
  x.strokeStyle='rgba(255,190,90,.8)';x.lineWidth=S*.014;x.beginPath();
  for(let i=0;i<6;i++){const a=i*Math.PI/3+.4;
    x.moveTo(Math.cos(a)*R*.5,Math.sin(a)*R*.5);x.lineTo(Math.cos(a)*R*.86,Math.sin(a)*R*.86);}
  x.stroke();
  x.fillStyle='rgba(255,255,255,.5)';
  x.beginPath();x.ellipse(-R*.35,-R*.45,R*.2,R*.1,-.6,0,7);x.fill();
  MEGA=cv;}
const ROCK_SPR={};
function makeRock(cracked){
  const S=SPR_S,cv=document.createElement('canvas');cv.width=cv.height=S;
  const x=cv.getContext('2d');x.translate(S/2,S/2);x.lineJoin='round';
  const R=S*.42;
  const pts=[[-.95,-.35],[-.55,-.85],[.15,-1],[.8,-.6],[1,-.05],[.65,.7],[0,1],[-.7,.75],[-1,.25]]
    .map(p=>[p[0]*R,p[1]*R]);
  x.beginPath();x.moveTo(pts[0][0],pts[0][1]);
  for(const p of pts)x.lineTo(p[0],p[1]);x.closePath();
  const g=x.createLinearGradient(-R,-R,R*.6,R);
  g.addColorStop(0,'#93a7b8');g.addColorStop(.45,'#5c6f80');g.addColorStop(1,'#2b3947');
  x.fillStyle=g;x.fill();
  x.lineWidth=S*.035;x.strokeStyle='rgba(8,14,22,.8)';x.stroke();
  x.fillStyle='rgba(255,255,255,.15)';
  x.beginPath();x.moveTo(pts[1][0],pts[1][1]);x.lineTo(pts[2][0],pts[2][1]);x.lineTo(0,-R*.15);x.closePath();x.fill();
  x.fillStyle='rgba(0,0,0,.24)';
  x.beginPath();x.moveTo(pts[5][0],pts[5][1]);x.lineTo(pts[6][0],pts[6][1]);x.lineTo(pts[7][0],pts[7][1]);x.lineTo(0,R*.1);x.closePath();x.fill();
  x.fillStyle='rgba(255,255,255,.08)';
  x.beginPath();x.moveTo(pts[8][0],pts[8][1]);x.lineTo(pts[0][0],pts[0][1]);x.lineTo(-R*.2,0);x.closePath();x.fill();
  x.fillStyle='rgba(255,255,255,.18)';
  for(let i=0;i<7;i++){const a=i*2.3;x.beginPath();
    x.arc(Math.cos(a*1.7)*R*.5,Math.sin(a)*R*.45,S*.012,0,7);x.fill();}
  x.save();x.translate(-R*.3,-R*.5);x.rotate(-.5);x.scale(1,.45);
  x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(0,0,R*.28,0,7);x.fill();x.restore();
  if(cracked){x.strokeStyle='rgba(8,14,22,.8)';x.lineWidth=S*.022;x.beginPath();
    x.moveTo(-R*.5,-R*.6);x.lineTo(-R*.15,-R*.2);x.lineTo(-R*.4,R*.15);x.lineTo(-R*.05,R*.55);
    x.moveTo(R*.45,-R*.5);x.lineTo(R*.15,-R*.1);x.lineTo(R*.4,R*.3);x.stroke();}
  return cv;}
function buildRocks(){ROCK_SPR[1]=makeRock(true);ROCK_SPR[2]=makeRock(false);}
let golemAngry=false;
function paintGolem(){
  const cv=$('#golemIco'),x=cv.getContext('2d');x.clearRect(0,0,48,48);
  x.save();x.translate(24,26);x.lineJoin='round';
  const R=19;
  const pts=[[-.9,-.2],[-.6,-.85],[0,-1],[.6,-.85],[.9,-.2],[.65,.7],[0,1],[-.65,.7]].map(p=>[p[0]*R,p[1]*R]);
  x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(const p of pts)x.lineTo(p[0],p[1]);x.closePath();
  const g=x.createLinearGradient(-R,-R,R*.7,R);
  g.addColorStop(0,'#8f7bb8');g.addColorStop(.5,'#4a3a68');g.addColorStop(1,'#241a38');
  x.fillStyle=g;x.fill();x.lineWidth=2.5;x.strokeStyle='rgba(10,6,20,.85)';x.stroke();
  x.fillStyle='#b06bff';x.shadowColor='#b06bff';x.shadowBlur=8;
  x.beginPath();x.moveTo(-R*.45,-R*.8);x.lineTo(-R*.25,-R*1.35);x.lineTo(-R*.05,-R*.85);x.closePath();x.fill();
  x.beginPath();x.moveTo(R*.05,-R*.9);x.lineTo(R*.3,-R*1.45);x.lineTo(R*.5,-R*.8);x.closePath();x.fill();
  x.shadowBlur=0;
  const ec=golemAngry?'#ff5d5d':'#5ff2d6';
  x.fillStyle=ec;x.shadowColor=ec;x.shadowBlur=10;
  x.beginPath();x.moveTo(-R*.55,-R*.15);x.lineTo(-R*.2,-R*.3);x.lineTo(-R*.25,-R*.02);x.closePath();x.fill();
  x.beginPath();x.moveTo(R*.55,-R*.15);x.lineTo(R*.2,-R*.3);x.lineTo(R*.25,-R*.02);x.closePath();x.fill();
  x.shadowBlur=0;
  x.strokeStyle='rgba(10,6,20,.8)';x.lineWidth=2;x.beginPath();
  x.moveTo(-R*.35,R*.45);x.lineTo(-R*.12,R*.35);x.lineTo(R*.1,R*.5);x.lineTo(R*.35,R*.38);x.stroke();
  x.strokeStyle='rgba(255,255,255,.14)';x.lineWidth=1.4;x.beginPath();
  x.moveTo(pts[1][0],pts[1][1]);x.lineTo(-R*.2,-R*.3);x.moveTo(pts[3][0],pts[3][1]);x.lineTo(R*.2,-R*.3);
  x.moveTo(0,R*.1);x.lineTo(0,R*.35);x.stroke();
  x.restore();}
function fitCanvas(){
  const r=canvas.getBoundingClientRect();if(r.width<10)return;
  dpr=window.devicePixelRatio||1;
  canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  boardPx=r.width;cell=boardPx/COLS;
  for(const row of grid)for(const g of row)if(g){const p=cellXY(g.r,g.c);
    if(!g.falling){g.x=p.x;g.y=p.y}}}
function cellXY(r,c){return{x:c*cell+cell/2,y:r*cell+cell/2}}

/* ========== состояние ========== */
let grid=[], ICE=[], ROCK=[], goal=null,
    mode='classic', score=0, dispScore=0, lastShown=-1,
    level=1, moves=MOVES_PER_LEVEL, levelStartScore=0, timeLeft=TIME_START,
    ham=0, frz=0, nextBonusAt=3000, nextHamAt=HAM_FIRST, nextFrzAt=FRZ_FIRST, hammerAim=false,
    rushT=0, rushPartT=0, rushUsed=false, movesInLevel=0, gateWarned=false,
    bestC=+store.get('sv-best-classic','0')||0, bestT=+store.get('sv-best-time','0')||0,
    busy=true, started=false, over=false, runId=0, maxCombo=1, lastTick=99,
    seenIce=false, seenRock=false, seenCham=false,
    selected=null, hintPair=null, dragStart=null,
    shakeT=0, shakeMag=0, fallRes=null, plateRes=null;
const tweens=[], particles=[], popups=[], fxBeams=[], fxRings=[], glints=[];
let glintT=0;
/* очки: линейный рост с потолком 18000 — поздние уровни достижимы */
const targetFor=l=>Math.min(18000,Math.round((6000+1500*(l-1))/100)*100);
const getBest=m=>m==='time'?bestT:bestC;
const zeroMat=()=>Array.from({length:ROWS},()=>Array(COLS).fill(0));
const rushOn=()=>rushT>0;
function addScore(base){const g=Math.round(base*(rushOn()?2:1));score+=g;
  if(started&&!over){
    while(score>=nextHamAt){nextHamAt+=HAM_STEP;
      if(ham<BOOST_MAX){ham++;showToast('⛏ Молот +1');Snd.spawn();updateBoosterUI();}}
    while(score>=nextFrzAt){nextFrzAt+=FRZ_STEP;
      if(frz<BOOST_MAX){frz++;showToast('⏳ Часики +1');Snd.spawn();updateBoosterUI();}}}
  return g;}
function newGem(t,r,c){const p=cellXY(r,c);
  return{t,r,c,x:p.x,y:p.y,vy:0,falling:false,bounced:false,scale:1,pop:-1,popDelay:0,burst:false,special:null,iceT:0,cham:false};}

/* ========== цели и типы уровней ========== */
function levelKind(l){
  if(l<=2)return'score';
  if(l%10===0)return'boss';
  if(l%3===0||l===5)return'clean';
  if(l%3===1)return'color';
  return'score';}
function sumIceLayers(){let s=0;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)s+=ICE[r][c];return s;}
function rockCount(){let n=0;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(ROCK[r][c]>0)n++;return n;}
function obstaclesClear(){return sumIceLayers()===0&&rockCount()===0;}
function makeGoal(l){
  if(mode!=='classic')return null;
  const k=levelKind(l);
  if(k==='boss')return{type:'boss',need:60+l*4,done:0,counted:false};
  if(k==='clean')return{type:'clean',need:sumIceLayers()+rockCount(),done:0};
  if(k==='color')return{type:'color',color:irnd(TYPES),need:10+2*l,done:0};
  return{type:'score',need:targetFor(l),done:0};}
function mainMet(){if(!goal)return false;
  if(goal.type==='boss')return goal.done>=goal.need;
  if(goal.type==='score')return score-levelStartScore>=goal.need;
  if(goal.type==='color')return goal.done>=goal.need;
  return true;}
function goalMet(){if(!goal)return false;
  if(goal.type==='boss')return goal.done>=goal.need;
  return mainMet()&&obstaclesClear();}
function goalLine(){
  if(!goal)return'';
  if(goal.type==='boss')return'Цель: повергнуть голема ('+goal.need+' урона).';
  if(goal.type==='clean')return'Цель: очисти поле от ВСЕХ льдин и валунов.';
  if(goal.type==='color')return'Цель: собери '+goal.need+' кристаллов нужного цвета и очисти поле от валунов.';
  return'Цель: '+fmt(goal.need)+' очков и очисти поле от валунов.';}
function applyTheme(){document.body.dataset.theme=String(Math.floor((level-1)/5)%THEMES.length);}
function updateBossUI(){
  const active=mode==='classic'&&goal&&goal.type==='boss';
  $('#bossbar').hidden=!active;
  if(el.goalBox)el.goalBox.hidden=active;
  if(!active)return;
  const rem=Math.max(0,goal.need-goal.done);
  $('#bhp').textContent=rem+' / '+goal.need;
  $('#bossFill').style.width=clamp(goal.done/goal.need*100,0,100)+'%';
  const low=rem<=goal.need*.25;
  $('#bossbar').classList.toggle('low',low);
  if(low!==golemAngry){golemAngry=low;paintGolem();}}
function hitGolem(n){
  if(!goal||goal.type!=='boss'||goal.done>=goal.need)return;
  goal.done=Math.min(goal.need,goal.done+n);
  updateBossUI();
  const ic=$('#golemIco');ic.classList.remove('gshake');void ic.offsetWidth;ic.classList.add('gshake');
  if(goal.done>=goal.need&&!goal.counted){goal.counted=true;
    const bonus=addScore(2000+level*100);
    showToast('💥 Голем повержен! +'+fmt(bonus));
    Snd.mega();Snd.levelup();confetti();shake(14);buzz([40,60,40]);}}
function golemFreeze(){
  let iceCnt=0;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(ICE[r][c]>0)iceCnt++;
  if(iceCnt>=8)return;
  const cand=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r][c];
    if(g&&ICE[r][c]===0&&!g.special)cand.push([r,c]);}
  if(!cand.length)return;
  const[r,c]=cand[irnd(cand.length)];ICE[r][c]=1;
  const g=grid[r][c];if(g)g.iceT=.5;
  const p=cellXY(r,c);popup(p.x,p.y,'❄ голем морозит!',false,'#bfe9ff');
  Snd.iceCrack();updateHUD();}

/* ========== хамелеон ========== */
function chamCount(){let n=0;for(const row of grid)for(const g of row)if(g&&g.cham)n++;return n;}
function chamAllowed(){
  if(mode==='time')return started&&timeLeft<=TIME_START-30;
  return level>=12&&levelKind(level)!=='boss';}
function seedChams(){
  if(!chamAllowed())return;
  const cand=[];
  for(const row of grid)for(const g of row)
    if(g&&!g.cham&&!g.special&&ICE[g.r][g.c]===0)cand.push(g);
  for(let i=cand.length-1;i>0;i--){const j=irnd(i+1);[cand[i],cand[j]]=[cand[j],cand[i]];}
  let need=Math.max(0,2-chamCount());
  for(const g of cand){if(need<=0)break;g.cham=true;need--;}}
function createsRunAt(r,c){
  const t=grid[r][c].t;let n=1;
  for(let cc=c-1;cc>=0&&grid[r][cc]&&grid[r][cc].t===t&&ICE[r][cc]===0;cc--)n++;
  for(let cc=c+1;cc<COLS&&grid[r][cc]&&grid[r][cc].t===t&&ICE[r][cc]===0;cc++)n++;
  if(n>=3)return true;
  n=1;
  for(let rr=r-1;rr>=0&&grid[rr][c]&&grid[rr][c].t===t&&ICE[rr][c]===0;rr--)n++;
  for(let rr=r+1;rr<ROWS&&grid[rr][c]&&grid[rr][c].t===t&&ICE[rr][c]===0;rr++)n++;
  return n>=3;}
function recolorChams(){
  for(const row of grid)for(const g of row)if(g&&g.cham){
    const old=g.t,order=[0,1,2,3,4,5].filter(t=>t!==old);
    for(let i=order.length-1;i>0;i--){const j=irnd(i+1);[order[i],order[j]]=[order[j],order[i]];}
    for(const nt of order){g.t=nt;if(!createsRunAt(g.r,g.c))break;g.t=old;}
    if(g.t!==old){const p=cellXY(g.r,g.c);
      glints.push({x:p.x,y:p.y-cell*.1,t:0,ttl:.4,s:cell*.5,rot:rnd(Math.PI)});}}}

/* ========== золотая лихорадка ========== */
function startRush(){if(rushUsed||rushT>0)return;
  rushUsed=true;rushT=RUSH_TIME;rushPartT=0;
  document.querySelector('.board-frame').classList.add('rush');
  showBanner('ЗОЛОТАЯ ЛИХОРАДКА ×2');Snd.rush();buzz(20);}
function endRush(){rushT=0;
  document.querySelector('.board-frame').classList.remove('rush');}
function maybeRush(combo){if(!rushUsed&&rushT<=0&&combo>=4)startRush();}

/* ========== плашка ========== */
function showPlate(ico,title,text){return new Promise(res=>{plateRes=res;
  $('#plateIco').textContent=ico;$('#plateTitle').textContent=title;$('#plateText').textContent=text;
  const p=$('#plate');p.hidden=false;p.classList.remove('on');void p.offsetWidth;p.classList.add('on');});}
function hidePlate(){const p=$('#plate');if(p.hidden)return;
  p.hidden=true;p.classList.remove('on');
  const r=plateRes;plateRes=null;if(r)r();}
function levelInfo(l,added){
  const th=THEMES[Math.floor((l-1)/5)%THEMES.length];
  if(goal&&goal.type==='boss')return{ico:'🗿',title:'Уровень '+l+' · Голем Глубин',
    text:'Босс-уровень! Наноси урон голему: каждый кристалл = 1, спецкамень = +5, каждый шаг каскада = +10. Каждым 4-м ходом голем замораживает случайный камень. Повержи голема, пока не кончились ходы!'};
  let ico='',text=goalLine();
  if(l>=12&&!seenCham){seenCham=true;ico='🦎';
    text='Новое: ХАМЕЛЕОН. Камень с радужным кольцом меняет цвет после каждого хода — лови удачный момент или используй его как джокера. '+text;}
  if(added.ice&&!seenIce){seenIce=true;ico='❄';
    text='Новое: ЛЁД. Замороженный камень нельзя двигать и совпадать. Собирай комбинации рядом со льдом (или бей молнией/бомбой), чтобы скалывать корку. Уровень не проходится, пока поле не очищено. '+text;}
  else if(added.rock&&!seenRock){seenRock=true;ico='⛰';
    text='Новое: ВАЛУНЫ. Они занимают ячейки и блокируют падение. Собирай комбинации рядом с ними или бей спецкамнями, чтобы разбить породу. '+text;}
  else if(added.ice&&added.rock&&!ico)ico='❄';
  return{ico,title:'Уровень '+l+' · '+th,text};}

/* ========== совпадения ========== */
function findMatchRuns(){
  const runs=[];
  const blocked=(r,c)=>!grid[r][c]||ICE[r][c]>0;
  for(let r=0;r<ROWS;r++){let c=0;while(c<COLS){
    if(blocked(r,c)){c++;continue}const t=grid[r][c].t;let e=c+1;
    while(e<COLS&&!blocked(r,e)&&grid[r][e].t===t)e++;
    if(e-c>=3){const cells=[];for(let i=c;i<e;i++)cells.push(key(r,i));runs.push({dir:'h',cells})}
    c=e;}}
  for(let c=0;c<COLS;c++){let r=0;while(r<ROWS){
    if(blocked(r,c)){r++;continue}const t=grid[r][c].t;let e=r+1;
    while(e<ROWS&&!blocked(e,c)&&grid[e][c].t===t)e++;
    if(e-r>=3){const cells=[];for(let i=r;i<e;i++)cells.push(key(i,c));runs.push({dir:'v',cells})}
    r=e;}}
  return runs;}
function findMatchGroups(){
  const runs=findMatchRuns();if(!runs.length)return[];
  const gs=runs.map(r=>({cells:new Set(r.cells),dirs:new Set([r.dir])}));
  let merged=true;
  while(merged){merged=false;
    for(let i=0;i<gs.length;i++)for(let j=i+1;j<gs.length;j++){
      let hit=false;for(const k of gs[j].cells){if(gs[i].cells.has(k)){hit=true;break}}
      if(hit){gs[j].cells.forEach(k=>gs[i].cells.add(k));
        gs[j].dirs.forEach(d=>gs[i].dirs.add(d));gs.splice(j,1);merged=true;j--;}}}
  return gs;}
function groupSpecial(g){
  if(g.dirs.has('h')&&g.dirs.has('v'))return'bomb';
  if(g.cells.size>=6)return'mega';
  if(g.cells.size>=5)return'prism';
  if(g.cells.size===4)return g.dirs.has('h')?'line-v':'line-h';
  return null;}
function spawnCell(g,prefers){
  if(prefers)for(const p of prefers)if(g.cells.has(key(p.r,p.c)))return p;
  const arr=[...g.cells].map(k=>k.split(',').map(Number));
  const m=arr[Math.floor(arr.length/2)];return{r:m[0],c:m[1]};}
function findHintPair(){
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)
    for(const[dr,dc]of[[0,1],[1,0]]){
      const r2=r+dr,c2=c+dc;if(r2>=ROWS||c2>=COLS)continue;
      const a=grid[r][c],b=grid[r2][c2];if(!a||!b)continue;
      if(ICE[r][c]>0||ICE[r2][c2]>0)continue;
      grid[r][c]=b;grid[r2][c2]=a;
      const ok=findMatchRuns().length>0;
      grid[r][c]=a;grid[r2][c2]=b;
      if(ok)return[{r,c},{r:r2,c:c2}];}
  return null;}
function genTypes(){
  grid=[];
  for(let r=0;r<ROWS;r++){const row=[];grid.push(row);
    for(let c=0;c<COLS;c++){let t;
      do{t=irnd(TYPES)}while(
        (c>=2&&row[c-1].t===t&&row[c-2].t===t)||
        (r>=2&&grid[r-1][c].t===t&&grid[r-2][c].t===t));
      row.push(newGem(t,r,c));}}}
function genBoard(){ICE=zeroMat();ROCK=zeroMat();
  let g=0;do{genTypes()}while(!findHintPair()&&g++<60);}

/* ========== препятствия ========== */
function iceBurst(x,y,full){const cols=['#dff4ff','#9fd8ff','#ffffff'];
  for(let i=0;i<(full?14:8);i++){const a=rnd(Math.PI*2),sp=rnd(1.5,4)*cell;
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-cell*.5,gr:cell*8,
      t:0,ttl:rnd(.35,.7),col:cols[irnd(3)],sz:rnd(.05,.11)*cell,spark:false});}}
function rockBurst(x,y,full){const cols=['#93a7b8','#5c6f80','#3c4a58'];
  for(let i=0;i<(full?14:8);i++){const a=rnd(Math.PI*2),sp=rnd(1.2,3.4)*cell;
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-cell*.4,gr:cell*10,
      t:0,ttl:rnd(.35,.7),col:cols[irnd(3)],sz:rnd(.06,.13)*cell,spark:false});}}
function damageObstacles(set,direct){
  const hi=new Set(),hr=new Set();
  const cons=(r,c)=>{if(r<0||c<0||r>=ROWS||c>=COLS)return;
    if(ICE[r][c]>0)hi.add(key(r,c));else if(ROCK[r][c]>0)hr.add(key(r,c));};
  direct.forEach(k=>{const[r,c]=k.split(',').map(Number);cons(r,c);});
  set.forEach(k=>{const[r,c]=k.split(',').map(Number);
    cons(r-1,c);cons(r+1,c);cons(r,c-1);cons(r,c+1);});
  hi.forEach(k=>{const[r,c]=k.split(',').map(Number);
    ICE[r][c]--;const p=cellXY(r,c);iceBurst(p.x,p.y,ICE[r][c]===0);
    const g=grid[r][c];if(g)g.iceT=.4;
    if(ICE[r][c]===0){Snd.iceBreak();const gn=addScore(100);popup(p.x,p.y,'+'+fmt(gn),false,'#bfe9ff');}
    else Snd.iceCrack();});
  hr.forEach(k=>{const[r,c]=k.split(',').map(Number);
    ROCK[r][c]--;const p=cellXY(r,c);rockBurst(p.x,p.y,ROCK[r][c]===0);
    if(ROCK[r][c]===0){Snd.rockBreak();const gn=addScore(150);popup(p.x,p.y,'+'+fmt(gn),false,'#ffd9a8');}
    else Snd.rockHit();});
  if(hi.size||hr.size)updateHUD();}
function placeObstacles(l){
  if(mode!=='classic'||l%10===0)return{ice:0,rock:0};
  const k=levelKind(l);
  const iceN=k==='clean'?Math.min(4+(l-3)*2,14):0;
  let rockN=l>=4?Math.min(2+(l-4),8):0;rockN-=rockN%2;
  const doubleP=l>=6?.5:(l>=4?.25:0), rockHp2=l>=8?.6:(l>=7?.3:0);
  for(let attempt=0;attempt<25;attempt++){
    const half=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS/2;c++)half.push([r,c]);
    for(let i=half.length-1;i>0;i--){const j=irnd(i+1);[half[i],half[j]]=[half[j],half[i]];}
    const freeIce=(r,c)=>grid[r][c]&&!grid[r][c].special&&ICE[r][c]===0&&ROCK[r][c]===0;
    const freeRock=(r,c)=>grid[r][c]&&ICE[r][c]===0&&ROCK[r][c]===0&&r>=2;
    const pi=[],pr=[];let hi2=0;
    for(let n=0;n<iceN/2&&hi2<half.length;){const[r,c]=half[hi2++];
      if(!freeIce(r,c)||!freeIce(r,COLS-1-c))continue;
      const lay=Math.random()<doubleP?2:1;
      ICE[r][c]=lay;ICE[r][COLS-1-c]=lay;pi.push([r,c]);n++;}
    let hr2=0;
    for(let n=0;n<rockN/2&&hr2<half.length;){const[r,c]=half[hr2++];
      if(!freeRock(r,c)||!freeRock(r,COLS-1-c))continue;
      if(ICE[r][c]>0||ICE[r][COLS-1-c]>0)continue;
      const hp=Math.random()<rockHp2?2:1;
      ROCK[r][c]=hp;ROCK[r][COLS-1-c]=hp;
      grid[r][c]=null;grid[r][COLS-1-c]=null;pr.push([r,c]);n++;}
    if(findHintPair())return{ice:pi.length*2,rock:pr.length*2};
    for(const[r,c]of pi){ICE[r][c]=0;ICE[r][COLS-1-c]=0;}
    for(const[r,c]of pr){ROCK[r][c]=0;ROCK[r][COLS-1-c]=0;
      grid[r][c]=newGem(irnd(TYPES),r,c);grid[r][COLS-1-c]=newGem(irnd(TYPES),r,COLS-1-c);}
  }
  return{ice:0,rock:0};}

/* ========== эффекты ========== */
function addTween(dur,ease,fn,done){tweens.push({t:0,dur,ease,fn,done})}
const easeInOutQuad=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
const easeOutBack=k=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(k-1,3)+c1*Math.pow(k-1,2)};
function shake(m){shakeMag=Math.max(shakeMag,m);shakeT=.3}
function burst(x,y,col,n=10){
  for(let i=0;i<n;i++){const a=rnd(Math.PI*2),sp=rnd(1.4,4.6)*cell;
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-cell,gr:cell*9,
      t:0,ttl:rnd(.4,.8),col,sz:rnd(.06,.13)*cell,spark:i<3});}
  for(let i=0;i<4;i++){const a=rnd(Math.PI*2),sp=rnd(3,6)*cell;
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,gr:cell*4,
      t:0,ttl:rnd(.3,.55),col:'#ffffff',sz:rnd(.03,.06)*cell,spark:true});}}
function confetti(){for(let i=0;i<70;i++)
  particles.push({x:rnd(boardPx),y:rnd(-boardPx*.3,0),vx:rnd(-cell,cell),vy:rnd(0,cell*3),
    gr:cell*7,t:0,ttl:rnd(1.2,2.1),col:COLORS[irnd(TYPES)].main,sz:rnd(.08,.16)*cell,spark:false});}
function popup(x,y,txt,big=false,col){popups.push({x,y,txt,t:0,ttl:.95,big,col:col||(rushOn()?'#ffe89a':'#ffd66b')})}
function showBanner(txt,cls=''){const b=$('#banner');b.textContent=txt;
  b.className='banner '+cls;void b.offsetWidth;b.classList.add('show');}
function showToast(txt){const t=$('#toast');t.textContent=txt;
  t.className='toast';void t.offsetWidth;t.classList.add('show');}

/* ========== гравитация ========== */
function applyGravity(){
  for(let c=0;c<COLS;c++){
    let r=ROWS-1;
    while(r>=0){
      if(ROCK[r][c]>0||ICE[r][c]>0){r--;continue;}
      let bottom=r,top=r;
      while(top-1>=0&&ROCK[top-1][c]===0&&ICE[top-1][c]===0)top--;
      let w=bottom;
      for(let rr2=bottom;rr2>=top;rr2--){const g=grid[rr2][c];
        if(g){if(w!==rr2){grid[w][c]=g;grid[rr2][c]=null;g.r=w;}w--;}}
      const touchesTop=top===0;
      for(let rr2=w;rr2>=top;rr2--){
        const g=newGem(irnd(TYPES),rr2,c);
        if(chamAllowed()&&chamCount()<3&&Math.random()<0.02)g.cham=true;
        if(touchesTop){g.y=(rr2-(w+1))*cell-rnd(0,cell*.4);}
        else{g.scale=0;addTween(260,easeOutBack,k=>g.scale=k,null);
          const p=cellXY(rr2,c);fxRings.push({x:p.x,y:p.y,t:0,teal:true});}
        grid[rr2][c]=g;}
      r=top-1;}}
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r][c];if(!g)continue;
    const p=cellXY(g.r,g.c);g.x=p.x;
    if(g.y<p.y-.5){g.falling=true;g.bounced=false}else if(!g.falling){g.y=p.y;g.vy=0}}}
function allSettled(){for(const row of grid)for(const g of row)if(g&&g.falling)return false;return true}
function waitFall(id){return new Promise(res=>{fallRes={res,id}})}
function expandWithSpecials(set,direct){
  let triggered=0;const processed=new Set(),q=[...set];
  while(q.length){
    const k=q.pop();if(processed.has(k))continue;processed.add(k);
    const[r,c]=k.split(',').map(Number);const g=grid[r]&&grid[r][c];
    if(!g||!g.special)continue;
    triggered++;
    const add=(rr,cc)=>{if(rr<0||cc<0||rr>=ROWS||cc>=COLS)return;
      const kk=key(rr,cc);
      if(ROCK[rr][cc]>0||ICE[rr][cc]>0){direct.add(kk);return;}
      if(!set.has(kk)){set.add(kk);q.push(kk)}};
    if(g.special==='line-h'){fxBeams.push({r,c,dir:'h',t:0});for(let i=0;i<COLS;i++)add(r,i);}
    else if(g.special==='line-v'){fxBeams.push({r,c,dir:'v',t:0});for(let i=0;i<ROWS;i++)add(i,c);}
    else if(g.special==='bomb'){const p=cellXY(r,c);fxRings.push({x:p.x,y:p.y,t:0});
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)add(r+dr,c+dc);}
    else if(g.special==='mega'){const p=cellXY(r,c);fxRings.push({x:p.x,y:p.y,t:0,mega:true});
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)add(r+dr,c+dc);
      for(let i=0;i<2;i++){const cr=irnd(ROWS),cc=irnd(COLS);
        const q2=cellXY(cr,cc);fxRings.push({x:q2.x,y:q2.y,t:0,mega:true});
        for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)add(cr+dr,cc+dc);}}
    else if(g.special==='prism'){const cnt={};
      for(let rr=0;rr<ROWS;rr++)for(let cc=0;cc<COLS;cc++){const gg=grid[rr][cc];
        if(gg&&ICE[rr][cc]===0)cnt[gg.t]=(cnt[gg.t]||0)+1;}
      let bt=0;for(const t in cnt)if(cnt[t]>cnt[bt])bt=+t;
      const p=cellXY(r,c);fxRings.push({x:p.x,y:p.y,t:0});
      for(let rr=0;rr<ROWS;rr++)for(let cc=0;cc<COLS;cc++)
        if(grid[rr][cc]&&grid[rr][cc].t===bt)add(rr,cc);}}
  return triggered;}
function countColorGoal(set){
  if(!goal||goal.type!=='color')return;
  let n=0;set.forEach(k=>{const[r,c]=k.split(',').map(Number);
    const g=grid[r][c];if(g&&g.t===goal.color)n++;});
  if(n)goal.done+=n;}
async function destroySet(set,id,spawns=[]){
  const spawnKeys=new Set(spawns.map(s=>key(s.r,s.c)));
  set.forEach(k=>{const[r,c]=k.split(',').map(Number);const g=grid[r][c];
    if(g){g.pop=.0001;g.popDelay=rnd(0,90);}});
  await wait(POP_MS+40);if(id!==runId)return;
  set.forEach(k=>{const[r,c]=k.split(',').map(Number);
    if(!spawnKeys.has(key(r,c)))grid[r][c]=null;});
  for(const s of spawns){const g=newGem(s.t,s.r,s.c);g.special=s.special;g.scale=0;
    grid[s.r][s.c]=g;addTween(280,easeOutBack,k=>g.scale=k,null);}
  if(spawns.length)Snd.spawn();
  applyGravity();await waitFall(id);}

/* ========== каскады и комбо-взрывы ========== */
async function resolve(groups,prefers,id){
  let combo=0;
  while(groups.length){
    if(id!==runId||over)return;combo++;
    maxCombo=Math.max(maxCombo,combo);maybeRush(combo);
    const specs=[];
    for(const g of groups)for(const k of g.cells){const[r,c]=k.split(',').map(Number);const gg=grid[r][c];
      if(gg&&(gg.special==='line-h'||gg.special==='line-v'||gg.special==='prism'))specs.push(gg);}
    const prisms=specs.filter(g=>g.special==='prism');
    const lines=specs.filter(g=>g.special!=='prism');
    if(prisms.length>=2){
      const cr=Math.round((prisms[0].r+prisms[1].r)/2),cc=Math.round((prisms[0].c+prisms[1].c)/2);
      await superNovaBlast(cr,cc,id);
      if(id!==runId||over)return;
      groups=findMatchGroups();continue;}
    if(lines.length>=2){
      const orient=lines.every(g=>g.special===lines[0].special)?(lines[0].special==='line-h'?'h':'v'):'cross';
      const cr=Math.round((lines[0].r+lines[1].r)/2),cc=Math.round((lines[0].c+lines[1].c)/2);
      const extra=new Set();groups.forEach(g=>g.cells.forEach(k=>extra.add(k)));
      await lineComboBlast(cr,cc,orient,id,extra);
      if(id!==runId||over)return;
      groups=findMatchGroups();continue;}
    const spawns=[];
    for(const g of groups){const sp=groupSpecial(g);
      if(sp){const cp=spawnCell(g,prefers);spawns.push({r:cp.r,c:cp.c,special:sp,t:irnd(TYPES)});}}
    for(const s of spawns)if(s.special==='mega'){const p=cellXY(s.r,s.c);
      popup(p.x,p.y,'МЕГА-БОМБА!',true,'#ffb066');}
    const set=new Set();groups.forEach(gr=>gr.cells.forEach(k=>set.add(k)));
    const direct=new Set();
    const triggered=expandWithSpecials(set,direct);
    damageObstacles(set,direct);
    countColorGoal(set);
    if(goal&&goal.type==='boss')hitGolem(set.size+triggered*5+(combo-1)*10);
    if(triggered)addScore(triggered*200);
    if(mode==='time'){while(score>=nextBonusAt){nextBonusAt+=3000;
      if(ham<BOOST_MAX){ham++;showToast('⛏ Молот +1');updateBoosterUI();}
      if(frz<BOOST_MAX){frz++;showToast('⏳ Часики +1');updateBoosterUI();}}
    for(const gr of groups){let sx=0,sy=0;
      gr.cells.forEach(k=>{const[r,c]=k.split(',').map(Number);const p=cellXY(r,c);sx+=p.x;sy+=p.y});
      const gn=addScore(gr.cells.size*60*combo);
      popup(sx/gr.cells.size,sy/gr.cells.size,'+'+fmt(gn),combo>=3);}
    if(mode==='time'){
      const bonus=Math.min(5,set.size*.3)+triggered*2;
      timeLeft=Math.min(TIME_CAP,timeLeft+bonus);
      let sx=0,sy=0,n=0;
      set.forEach(k=>{const[r,c]=k.split(',').map(Number);const p=cellXY(r,c);sx+=p.x;sy+=p.y;n++});
      popup(sx/n,sy/n+cell*.5,'+'+bonus.toFixed(1)+' с',false,'#5ff2d6');}
    if(triggered){shake(9);Snd.boom();buzz(35)}else{shake(Math.min(2+combo,6));buzz(12)}
    Snd.pop(combo);
    if(combo>=2)showBanner('КОМБО ×'+combo,'teal');
    updateHUD();
    await destroySet(set,id,spawns);if(id!==runId)return;
    prefers=null;groups=findMatchGroups();}}
async function lineComboBlast(cr,cc,orient,id,extra){
  const set=new Set(),direct=new Set();
  const addCell=(rr,ccc)=>{if(rr<0||ccc<0||rr>=ROWS||ccc>=COLS)return;const kk=key(rr,ccc);
    if(ROCK[rr][ccc]>0||ICE[rr][ccc]>0){direct.add(kk);return;}
    if(grid[rr][ccc])set.add(kk);};
  if(extra)extra.forEach(k=>{const[r,c]=k.split(',').map(Number);
    if(ROCK[r][c]>0||ICE[r][c]>0)direct.add(k);else if(grid[r][c])set.add(k);});
  if(orient!=='v'){for(let dr=-1;dr<=1;dr++){const rr=cr+dr;if(rr<0||rr>=ROWS)continue;
    for(let c=0;c<COLS;c++)addCell(rr,c);}}
  if(orient!=='h'){for(let dc=-1;dc<=1;dc++){const cc2=cc+dc;if(cc2<0||cc2>=COLS)continue;
    for(let r=0;r<ROWS;r++)addCell(r,cc2);}}
  Snd.mega();shake(orient==='cross'?12:9);buzz([25,35,25]);
  showBanner(orient==='cross'?'КРЕСТ 3×3!':'ТРОЙНАЯ ПОЛОСА!');
  const triggered=expandWithSpecials(set,direct);
  damageObstacles(set,direct);countColorGoal(set);
  if(goal&&goal.type==='boss')hitGolem(set.size+triggered*5+10);
  const gn=addScore(set.size*60+triggered*200+400);
  maxCombo=Math.max(maxCombo,2);
  const p=cellXY(cr,cc);popup(p.x,p.y,'+'+fmt(gn),true,'#ffe89a');
  updateHUD();
  await destroySet(set,id,[]);
  let g2=findMatchGroups();if(g2.length)await resolve(g2,null,id);}
async function superNovaBlast(cr,cc,id){
  const set=new Set(),direct=new Set();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(ROCK[r][c]>0||ICE[r][c]>0)direct.add(key(r,c));
    else if(grid[r][c])set.add(key(r,c));}
  Snd.mega();Snd.prism();shake(16);buzz([40,60,40]);
  showBanner('СУПЕРНОВА!');
  const triggered=expandWithSpecials(set,direct);
  damageObstacles(set,direct);countColorGoal(set);
  if(goal&&goal.type==='boss')hitGolem(set.size+triggered*5+20);
  const gn=addScore(set.size*60+triggered*200+1500);
  maxCombo=Math.max(maxCombo,3);
  const p=cellXY(cr,cc);popup(p.x,p.y,'+'+fmt(gn),true,'#ffe89a');
  updateHUD();
  await destroySet(set,id,[]);
  let g2=findMatchGroups();if(g2.length)await resolve(g2,null,id);}
async function prismSwap(ga,gb,id){
  const set=new Set([key(ga.r,ga.c),key(gb.r,gb.c)]);
  const both=ga.special==='prism'&&gb.special==='prism';
  if(both){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)set.add(key(r,c));}
  else{const other=ga.special==='prism'?gb:ga;
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)
      if(grid[r][c]&&grid[r][c].t===other.t)set.add(key(r,c));}
  Snd.prism();fxRings.push({x:ga.x,y:ga.y,t:0});
  const direct=new Set();
  const triggered=expandWithSpecials(set,direct);
  damageObstacles(set,direct);countColorGoal(set);
  if(goal&&goal.type==='boss')hitGolem(set.size+triggered*5+10);
  const gn=addScore(set.size*60+triggered*200+300);
  maxCombo=Math.max(maxCombo,2);
  if(mode==='time'){const bonus=Math.min(8,set.size*.35+2);
    timeLeft=Math.min(TIME_CAP,timeLeft+bonus);
    popup(ga.x,ga.y+cell*.5,'+'+bonus.toFixed(1)+' с',false,'#5ff2d6');}
  popup(ga.x,ga.y,'ПРИЗМА! +'+fmt(gn),true,'#5ff2d6');
  showBanner('ПРИЗМА!','teal');shake(10);buzz(40);updateHUD();
  await destroySet(set,id,[]);}
async function megaSwap(ga,gb,id){
  const m=ga.special==='mega'?ga:gb;
  startRush();
  const set=new Set(),direct=new Set();
  const addCell=(rr,cc)=>{if(rr<0||cc<0||rr>=ROWS||cc>=COLS)return;const kk=key(rr,cc);
    if(ROCK[rr][cc]>0||ICE[rr][cc]>0){direct.add(kk);return;}
    if(grid[rr][cc])set.add(kk);};
  const area=(cr,cc)=>{for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)addCell(cr+dr,cc+dc);
    const p=cellXY(cr,cc);fxRings.push({x:p.x,y:p.y,t:0,mega:true});};
  area(m.r,m.c);
  for(let i=0;i<3;i++)area(irnd(ROWS),irnd(COLS));
  set.add(key(ga.r,ga.c));set.add(key(gb.r,gb.c));
  Snd.mega();shake(13);buzz([30,40,30]);
  showBanner('МЕГА-БОМБА!','bad');
  const triggered=expandWithSpecials(set,direct);
  damageObstacles(set,direct);countColorGoal(set);
  if(goal&&goal.type==='boss')hitGolem(set.size+triggered*5+10);
  const gn=addScore(set.size*60+triggered*200+500);
  maxCombo=Math.max(maxCombo,2);
  popup(m.x,m.y,'+'+fmt(gn),true,'#ffb066');
  if(mode==='time'){const bonus=Math.min(10,set.size*.4+3);
    timeLeft=Math.min(TIME_CAP,timeLeft+bonus);
    popup(m.x,m.y+cell*.5,'+'+bonus.toFixed(1)+' с',false,'#5ff2d6');}
  updateHUD();
  await destroySet(set,id,[]);
  let g2=findMatchGroups();if(g2.length)await resolve(g2,null,id);}

/* ========== ходы ========== */
function animSwap(ga,gb,ax,ay,bx,by){return new Promise(res=>{
  const ta=cellXY(ga.r,ga.c),tb=cellXY(gb.r,gb.c);
  addTween(160,easeInOutQuad,k=>{
    ga.x=ax+(ta.x-ax)*k;ga.y=ay+(ta.y-ay)*k;
    gb.x=bx+(tb.x-bx)*k;gb.y=by+(tb.y-by)*k;},res);});}
async function doSwap(ra,ca,rb,cb){
  const id=runId;busy=true;selected=null;hintPair=null;
  const ga=grid[ra][ca],gb=grid[rb][cb];
  if(!ga||!gb){busy=false;return}
  if(ICE[ra][ca]>0||ICE[rb][cb]>0){
    if(ga)ga.iceT=.4;if(gb)gb.iceT=.4;Snd.iceCrack();shake(3);busy=false;return;}
  Snd.swap();
  grid[ra][ca]=gb;grid[rb][cb]=ga;ga.r=rb;ga.c=cb;gb.r=ra;gb.c=ca;
  const ax=ga.x,ay=ga.y,bx=gb.x,by=gb.y;
  await animSwap(ga,gb,ax,ay,bx,by);if(id!==runId)return;
  const isLine=x=>x.special==='line-h'||x.special==='line-v';
  const isMega=ga.special==='mega'||gb.special==='mega';
  const isPrism=!isMega&&(ga.special==='prism'||gb.special==='prism');
  const lineCombo=!isMega&&!isPrism&&isLine(ga)&&isLine(gb);
  const orient=lineCombo?(ga.special===gb.special?(ga.special==='line-h'?'h':'v'):'cross'):null;
  const groups=(isMega||isPrism||lineCombo)?[]:findMatchGroups();
  if(!isMega&&!isPrism&&!lineCombo&&!groups.length){
    Snd.bad();shake(4);buzz(20);
    grid[ra][ca]=ga;grid[rb][cb]=gb;ga.r=ra;ga.c=ca;gb.r=rb;gb.c=cb;
    await animSwap(ga,gb,ga.x,ga.y,gb.x,gb.y);if(id!==runId)return;
    busy=false;return;}
  if(mode==='classic'){moves--;bump(el.moves);}
  if(lineCombo){await lineComboBlast(rb,cb,orient,id,null)}
  else if(isMega){await megaSwap(ga,gb,id)}
  else if(isPrism){await prismSwap(ga,gb,id)}
  else{await resolve(groups,[{r:rb,c:cb},{r:ra,c:ca}],id)}
  if(id!==runId||over)return;
  await afterMove(id);}
async function afterMove(id){
  if(over)return;
  if(mode==='classic'&&goalMet()){await levelUp(id);if(id!==runId||over)return;}
  else if(mode==='classic'&&moves<=0){gameOver();return;}
  if(mode==='classic'&&!over){
    if(goal&&goal.type==='boss'&&goal.done<goal.need){
      movesInLevel++;if(movesInLevel%4===0)golemFreeze();}
    if(mainMet()&&!obstaclesClear()&&!gateWarned){gateWarned=true;
      showToast('⛏ Очисти поле от льда и валунов!');}}
  recolorChams();
  if(!findHintPair()){await shuffleBoard(id);if(id!==runId)return;}
  busy=false;hintPair=null;saveGame();}
async function levelUp(id){
  saveBest();
  confetti();Snd.levelup();buzz([20,40,20]);
  showToast('🎉 Уровень '+level+' пройден!');
  await wait(1250);if(id!==runId)return;
  level++;moves=levelKind(level)==='clean'?25:MOVES_PER_LEVEL;
  levelStartScore=score;movesInLevel=0;gateWarned=false;
  const added=placeObstacles(level);
  goal=makeGoal(level);
  if(goal&&goal.type==='boss'){golemAngry=false;paintGolem();}
  seedChams();
  applyTheme();updateHUD();updateBoosterUI();saveGame();
  const info=levelInfo(level,added);
  await showPlate(info.ico,info.title,info.text);
  if(id!==runId)return;}
async function shuffleBoard(id){
  showBanner('НЕТ ХОДОВ','bad');Snd.shuffleS();
  await wait(700);if(id!==runId)return;
  const cells=[],gems=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)
    if(grid[r][c]&&ICE[r][c]===0){cells.push([r,c]);gems.push(grid[r][c]);}
  let ok=false;
  for(let tries=0;tries<80&&!ok;tries++){
    for(let i=gems.length-1;i>0;i--){const j=irnd(i+1);[gems[i],gems[j]]=[gems[j],gems[i]];}
    cells.forEach(([r,c],i)=>{grid[r][c]=gems[i];gems[i].r=r;gems[i].c=c;});
    if(!findMatchRuns().length&&findHintPair())ok=true;}
  if(!ok)for(const g of gems){g.t=irnd(TYPES);g.special=null;}
  showBanner('ПЕРЕМЕШИВАЕМ!','teal');
  const from=gems.map(g=>({g,x:g.x,y:g.y}));
  await new Promise(res=>addTween(400,easeInOutQuad,k=>{
    for(const f of from){const t=cellXY(f.g.r,f.g.c);
      f.g.x=f.x+(t.x-f.x)*k;f.g.y=f.y+(t.y-f.y)*k;}},res));}

/* ========== бустеры ========== */
function updateBoosterUI(){
  $('#hamN').textContent=ham;$('#frzN').textContent=frz;
  $('#btnHam').classList.toggle('off',ham<=0);
  $('#btnFrz').classList.toggle('off',frz<=0);
  $('#btnHam').classList.toggle('active',hammerAim);}
async function hammerStrike(r,c){
  const id=runId;busy=true;hammerAim=false;ham--;updateBoosterUI();
  const p=cellXY(r,c);shake(6);buzz(25);
  if(ROCK[r][c]>0){rockBurst(p.x,p.y,true);ROCK[r][c]=0;Snd.rockBreak();
    const gn=addScore(150);popup(p.x,p.y,'+'+fmt(gn),false,'#ffd9a8');
    applyGravity();await waitFall(id);}
  else if(ICE[r][c]>0){const layers=ICE[r][c];iceBurst(p.x,p.y,true);ICE[r][c]=0;
    if(goal&&goal.type==='ice')goal.done=Math.min(goal.need,goal.done+layers);
    const g=grid[r][c];if(g)g.iceT=.4;Snd.iceBreak();
    const gn=addScore(100);popup(p.x,p.y,'+'+fmt(gn),false,'#bfe9ff');
    applyGravity();await waitFall(id);}
  else if(grid[r][c]){const set=new Set([key(r,c)]);
    countColorGoal(set);if(goal&&goal.type==='boss')hitGolem(1);
    const gn=addScore(60);Snd.pop(1);
    popup(p.x,p.y,'+'+fmt(gn),false);
    await destroySet(set,id,[]);}
  else{ham++;updateBoosterUI();busy=false;return;}
  if(id!==runId)return;
  updateHUD();
  const groups=findMatchGroups();
  if(groups.length)await resolve(groups,null,id);
  if(id!==runId||over)return;
  if(mode==='classic'&&goalMet()){await levelUp(id);if(id!==runId||over)return;}
  if(!findHintPair()){await shuffleBoard(id);if(id!==runId)return;}
  recolorChams();
  busy=false;saveGame();}
function useFreeze(){
  frz--;
  if(mode==='classic'){moves+=3;popup(boardPx/2,boardPx/2,'+3 хода',true,'#5ff2d6');bump(el.moves);}
  else{timeLeft=Math.min(TIME_CAP,timeLeft+5);popup(boardPx/2,boardPx/2,'+5 с',true,'#5ff2d6');}
  Snd.spawn();updateHUD();updateBoosterUI();saveGame();}

/* ========== рекорды / сохранения ========== */
function saveBest(){
  if(mode==='classic'){if(score>bestC){bestC=score;store.set('sv-best-classic',bestC);return true}}
  else{if(score>bestT){bestT=score;store.set('sv-best-time',bestT);return true}}
  return false;}
function saveGame(){
  if(!started||over)return;
  try{store.set(SAVE_KEY,JSON.stringify({mode,score,level,moves,levelStartScore,timeLeft,goal,ham,frz,nextBonusAt,
    nha:nextHamAt,nfa:nextFrzAt,mvl:movesInLevel,
    board:grid.map(row=>row.map(g=>g?[g.t,g.special||null,g.cham?1:0]:null)),ice:ICE,rock:ROCK}))}catch(e){}}
function loadSave(){try{const d=JSON.parse(store.get(SAVE_KEY,'null'));
  return d&&Array.isArray(d.board)&&d.board.length===ROWS?d:null}catch(e){return null}}
function clearSave(){store.del(SAVE_KEY)}
function restoreGame(d){
  mode=d.mode==='time'?'time':'classic';
  score=d.score||0;dispScore=score;lastShown=-1;
  level=Math.max(1,d.level||1);moves=d.moves??MOVES_PER_LEVEL;
  levelStartScore=d.levelStartScore||0;
  timeLeft=clamp(d.timeLeft??TIME_START,1,TIME_CAP);
  ham=clamp(d.ham??0,0,BOOST_MAX);frz=clamp(d.frz??0,0,BOOST_MAX);
  nextBonusAt=d.nextBonusAt||3000;nextHamAt=d.nha||HAM_FIRST;nextFrzAt=d.nfa||FRZ_FIRST;
  movesInLevel=d.mvl||0;gateWarned=false;
  grid=d.board.map((row,r)=>row.map((cd,c)=>{
    const g=newGem(cd[0]||0,r,c);g.special=cd[1]||null;g.cham=!!cd[2];return g;}));
  ICE=(d.ice&&d.ice.length===ROWS)?d.ice.map(r=>r.slice()):zeroMat();
  ROCK=(d.rock&&d.rock.length===ROWS)?d.rock.map(r=>r.slice()):zeroMat();
  goal=d.goal||{type:'score',need:targetFor(level),done:0};
  seenIce=ICE.some(r=>r.some(v=>v>0));seenRock=ROCK.some(r=>r.some(v=>v>0));
  if(goal.type==='boss'){golemAngry=false;paintGolem();}
  if(grid.some(row=>row.length!==COLS))genBoard();}
function fitNum(e){const len=e.textContent.length;
  e.classList.toggle('n6',len>=6&&len<8);
  e.classList.toggle('n8',len>=8);}
function gameOver(){
  if(over)return;over=true;busy=true;clearSave();
  if(rushT>0)endRush();
  const rec=saveBest();
  lbLocalPush(mode,score);
  lbSubmit(mode,score).then(ok=>{if(!ok)lbQueuePush(mode,score);});
  Snd.overS();
  $('#ovTitle').textContent=mode==='time'?'Время вышло!':'Ходы закончились';
  $('#ovScore').textContent=fmt(score);fitNum($('#ovScore'));
  $('#ovLblMid').textContent=mode==='time'?'Макс. комбо':'Уровень';
  $('#ovMid').textContent=mode==='time'?'×'+Math.max(1,maxCombo):level;
  $('#ovBest').textContent=fmt(getBest(mode));fitNum($('#ovBest'));
  $('#recBadge').classList.toggle('on',rec&&score>0);
  $('#overOv').classList.remove('hidden');updateHUD();}
function introFall(){
  for(const row of grid)for(const g of row){const p=cellXY(g.r,g.c);
    g.y=p.y-boardPx*1.15-(g.c*.45+g.r*.2)*cell-rnd(0,cell);g.falling=true;g.vy=0;}}
function beginRun(fresh,m,data){
  runId++;over=false;started=true;busy=true;selected=null;hintPair=null;dragStart=null;
  hammerAim=false;hidePlate();
  rushT=0;rushUsed=false;movesInLevel=0;gateWarned=false;
  document.querySelector('.board-frame').classList.remove('rush');
  tweens.length=0;particles.length=0;popups.length=0;fxBeams.length=0;fxRings.length=0;
  glints.length=0;fallRes=null;maxCombo=1;lastTick=99;seenIce=false;seenRock=false;seenCham=false;
  if(fresh){mode=m;score=0;dispScore=0;lastShown=-1;level=1;moves=MOVES_PER_LEVEL;
    levelStartScore=0;timeLeft=TIME_START;ham=0;frz=0;nextBonusAt=3000;
    nextHamAt=HAM_FIRST;nextFrzAt=FRZ_FIRST;
    genBoard();goal=makeGoal(1);}
  else restoreGame(data);
  if(goal&&goal.type==='boss')paintGolem();
  applyModeUI();applyTheme();updateHUD();updateBoosterUI();updateBossUI();
  $('#startOv').classList.add('hidden');$('#overOv').classList.add('hidden');
  Snd.init();
  if(fresh)introFall();
  if(allSettled())busy=false;else fallRes={res:()=>{busy=false}};}
function toMenu(){
  if(started&&!over)saveGame();
  runId++;hidePlate();
  started=false;over=false;busy=true;hammerAim=false;
  if(rushT>0)endRush();
  updateBoosterUI();
  $('#overOv').classList.add('hidden');
  $('#startOv').classList.remove('hidden');
  refreshStartUI();}
function refreshStartUI(){
  const d=loadSave(),bc=$('#btnContinue');
  if(d){bc.hidden=false;
    $('#contInfo').textContent=d.mode==='time'
      ?`на время · ${fmt(d.score||0)} очков`
      :`уровень ${d.level||1} · ${fmt(d.score||0)} очков`;}
  else bc.hidden=true;}
