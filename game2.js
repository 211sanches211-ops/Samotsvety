/* ========== отрисовка: вспомогательные ========== */
function rr(x,px,py,w,h,r){x.beginPath();
  if(x.roundRect){x.roundRect(px,py,w,h,r);return}
  x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);
  x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath();}
function drawSpecialOverlay(g,s,t){
  const sp=g.special;if(!sp||sp==='prism')return;
  if(sp==='line-h'||sp==='line-v'){
    ctx.save();if(sp==='line-v')ctx.rotate(Math.PI/2);
    const a=.75+.25*Math.sin(t*8),w=s*.86,h=s*.2;
    const gr=ctx.createLinearGradient(0,-h/2,0,h/2);
    gr.addColorStop(0,'rgba(255,255,255,.97)');gr.addColorStop(.5,`rgba(255,230,150,${a})`);
    gr.addColorStop(1,'rgba(255,190,60,.92)');
    ctx.shadowColor='#ffd66b';ctx.shadowBlur=12;ctx.fillStyle=gr;
    rr(ctx,-w/2,-h/2,w,h,h/2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.95)';
    ctx.beginPath();ctx.moveTo(-w/2-s*.09,0);ctx.lineTo(-w/2+s*.05,-h*.8);ctx.lineTo(-w/2+s*.05,h*.8);ctx.closePath();
    ctx.moveTo(w/2+s*.09,0);ctx.lineTo(w/2-s*.05,-h*.8);ctx.lineTo(w/2-s*.05,h*.8);ctx.closePath();ctx.fill();
    ctx.restore();}
  else if(sp==='bomb'){
    const p=.5+.5*Math.sin(t*7);
    ctx.strokeStyle=`rgba(255,170,60,${.55+p*.45})`;ctx.lineWidth=s*.07;
    ctx.shadowColor='#ff9d2e';ctx.shadowBlur=14;
    ctx.beginPath();ctx.arc(0,0,s*.5,0,7);ctx.stroke();
    ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,240,200,.55)';ctx.lineWidth=s*.025;
    ctx.beginPath();ctx.arc(0,0,s*.5,0,7);ctx.stroke();
    ctx.fillStyle='rgba(255,220,140,.9)';
    for(let i=0;i<4;i++){const a=t*3+i*Math.PI/2;
      ctx.beginPath();ctx.arc(Math.cos(a)*s*.5,Math.sin(a)*s*.5,s*.045,0,7);ctx.fill();}}
  else if(sp==='mega'){
    const p=.5+.5*Math.sin(t*9);
    ctx.strokeStyle=`rgba(255,140,40,${.6+p*.4})`;ctx.lineWidth=s*.08;
    ctx.shadowColor='#ff7a1a';ctx.shadowBlur=16;
    ctx.beginPath();ctx.arc(0,0,s*.52+p*s*.04,0,7);ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,220,140,.95)';
    for(let i=0;i<6;i++){const a=t*4+i*Math.PI/3;
      ctx.beginPath();ctx.arc(Math.cos(a)*s*.52,Math.sin(a)*s*.52,s*.05,0,7);ctx.fill();}}}
function drawChamOverlay(s,t){
  ctx.save();ctx.rotate(t*1.2);
  ctx.lineWidth=s*.07;ctx.globalAlpha=.85;
  for(let i=0;i<6;i++){const a0=i*Math.PI/3,a1=a0+Math.PI/3;
    ctx.strokeStyle=COLORS[i].main;
    ctx.beginPath();ctx.arc(0,0,s*.5,a0+.08,a1-.08);ctx.stroke();}
  ctx.restore();ctx.globalAlpha=1;}
function drawIceOverlay(s,layers,t){
  const w=s*.98;
  ctx.save();ctx.globalAlpha=.82+.1*Math.sin(t*3);
  const g=ctx.createLinearGradient(-w/2,-w/2,w/2,w/2);
  g.addColorStop(0,'rgba(235,250,255,.92)');g.addColorStop(.45,'rgba(160,220,255,.5)');
  g.addColorStop(1,'rgba(205,240,255,.82)');
  rr(ctx,-w/2,-w/2,w,w,w*.2);ctx.fillStyle=g;ctx.fill();
  ctx.lineWidth=s*.03;ctx.strokeStyle='rgba(255,255,255,.85)';ctx.stroke();
  ctx.save();rr(ctx,-w/2,-w/2,w,w,w*.2);ctx.clip();
  ctx.rotate(-.7);ctx.fillStyle='rgba(255,255,255,.35)';
  ctx.fillRect(-w,-w*.06,w*2,w*.1);ctx.fillRect(-w,w*.2,w*2,w*.05);
  ctx.restore();
  if(layers===1){ctx.strokeStyle='rgba(30,80,130,.65)';ctx.lineWidth=s*.025;ctx.beginPath();
    ctx.moveTo(-w*.3,-w*.4);ctx.lineTo(-w*.1,-w*.12);ctx.lineTo(-w*.28,w*.1);ctx.lineTo(-w*.05,w*.4);
    ctx.moveTo(w*.25,-w*.42);ctx.lineTo(w*.12,-w*.15);ctx.lineTo(w*.32,w*.12);ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,.75)';
  for(const[sx,sy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){
    ctx.beginPath();ctx.moveTo(sx*w/2,sy*w/2);
    ctx.lineTo(sx*w/2-sx*w*.16,sy*w/2);ctx.lineTo(sx*w/2,sy*w/2-sy*w*.16);
    ctx.closePath();ctx.fill();}
  ctx.restore();}
function drawStar(c,x0,y0,s,rot,alpha){
  c.save();c.translate(x0,y0);c.rotate(rot);c.globalAlpha=alpha;
  c.fillStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s;
  c.beginPath();
  c.moveTo(0,-s);c.quadraticCurveTo(s*.12,-s*.12,s,0);
  c.quadraticCurveTo(s*.12,s*.12,0,s);
  c.quadraticCurveTo(-s*.12,s*.12,-s,0);
  c.quadraticCurveTo(-s*.12,-s*.12,0,-s);c.fill();c.restore();}
const spCv=$('#splashCv'),spx=spCv.getContext('2d');
const mgCv=$('#menuGems'),mgx=mgCv.getContext('2d');
const ggCv=$('#goalGem'),ggx=ggCv.getContext('2d');
(function(){const d=Math.max(1,window.devicePixelRatio||1);
  spCv.width=360*d;spCv.height=360*d;spx.setTransform(d,0,0,d,0,0);
  mgCv.width=300*d;mgCv.height=64*d;mgx.setTransform(d,0,0,d,0,0);
  ggCv.width=30*d;ggCv.height=30*d;ggx.setTransform(d,0,0,d,0,0);})();
let splashOn=true;
function drawSplash(t){const W=360;spx.clearRect(0,0,W,W);
  const D=0.95,idx=Math.floor(t/D),ph=t-idx*D;
  let gi=idx%6,sx=1,rot=0,flash=0;
  if(ph<0.45){gi=idx%6;if(ph>0.18&&ph<0.36)flash=1-Math.abs((ph-0.27)/0.09);}
  else if(ph<0.60){const k=(ph-0.45)/0.15;gi=idx%6;sx=Math.max(0.03,1-k);rot=k*0.9;}
  else if(ph<0.75){const k=(ph-0.60)/0.15;gi=(idx+1)%6;sx=Math.max(0.03,k);rot=(1-k)*0.9;
    flash=k<0.35?1-k/0.35:0;}
  else gi=(idx+1)%6;
  const s=W*0.62;
  spx.fillStyle='rgba(3,10,16,.4)';
  spx.beginPath();spx.ellipse(W/2,W*0.84,s*0.34*sx,s*0.09,0,0,7);spx.fill();
  spx.save();spx.translate(W/2,W/2);spx.rotate(rot*0.35);spx.scale(sx,1);
  spx.drawImage(SPR[gi],-s/2,-s/2,s,s);spx.restore();
  if(flash>0)drawStar(spx,W/2,W/2-s*0.36,10+20*flash,0,flash);}
setTimeout(()=>{const so=$('#splashOv');so.classList.add('fade');
  setTimeout(()=>{so.classList.add('hidden');splashOn=false;maybeNick();},450);},2400);
function drawMenuGems(t){const W=300,H=64;mgx.clearRect(0,0,W,H);
  const n=6,step=W/n,s=Math.min(step*.82,H*.8);
  for(let i=0;i<n;i++){const x=step*(i+.5),y=H/2+Math.sin(t*2+i*.9)*3;
    mgx.drawImage(SPR[i],x-s/2,y-s/2,s,s);}
  const gi=Math.floor(t*1.5)%n,gx=step*(gi+.5),gy=H/2+Math.sin(t*2+gi*.9)*3-s*.4;
  drawStar(mgx,gx,gy,6+3*Math.sin(t*7),t,.9);}
function drawGoalGem(){
  if(!goal||goal.type!=='color'){ggCv.hidden=true;return;}
  ggCv.hidden=false;
  ggx.clearRect(0,0,30,30);
  ggx.drawImage(SPR[goal.color],0,0,30,30);}
function render(t){
  ctx.clearRect(0,0,boardPx,boardPx);
  ctx.save();
  if(shakeT>0){const k=shakeT/.3;
    ctx.translate(rnd(-1,1)*shakeMag*k,rnd(-1,1)*shakeMag*k);}
  ctx.fillStyle='rgba(7,20,32,.6)';rr(ctx,0,0,boardPx,boardPx,14);ctx.fill();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    ctx.fillStyle=(r+c)%2?'rgba(120,190,255,.05)':'rgba(120,190,255,.022)';
    rr(ctx,c*cell+1,r*cell+1,cell-2,cell-2,cell*.14);ctx.fill();
    if(ROCK[r][c]>0){ctx.fillStyle='rgba(0,0,0,.28)';
      rr(ctx,c*cell+1,r*cell+1,cell-2,cell-2,cell*.14);ctx.fill();}}
  ctx.strokeStyle='rgba(150,220,255,.09)';ctx.lineWidth=1.5;
  rr(ctx,1,1,boardPx-2,boardPx-2,13);ctx.stroke();
  ctx.save();rr(ctx,0,0,boardPx,boardPx,14);ctx.clip();
  if(hintPair)for(const h of hintPair){const p=cellXY(h.r,h.c);
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,cell*.8);
    g.addColorStop(0,'rgba(255,214,107,.28)');g.addColorStop(1,'rgba(255,214,107,0)');
    ctx.fillStyle=g;ctx.fillRect(p.x-cell,p.y-cell,cell*2,cell*2);}
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const p=cellXY(r,c);
    if(ROCK[r][c]>0){const s=cell*.96;
      ctx.fillStyle='rgba(3,10,16,.35)';
      ctx.beginPath();ctx.ellipse(p.x,(r+1)*cell-cell*.1,cell*.3,cell*.1,0,0,Math.PI*2);ctx.fill();
      ctx.drawImage(ROCK_SPR[ROCK[r][c]],p.x-s/2,p.y-s/2,s,s);continue;}
    const g=grid[r][c];if(!g||g.scale<=0)continue;
    const s=cell*.92*g.scale;
    let ox=0;
    if(g.iceT>0)ox+=Math.sin(g.iceT*45)*cell*.06*(g.iceT/.4);
    if(hintPair&&hintPair.some(h=>h.r===r&&h.c===c))ox+=Math.sin(t*9)*cell*.07;
    const bob=(!g.falling&&g.pop<0)?Math.sin(t*2.2+(r*5+c)*.9)*cell*.012:0;
    if(g.pop<0){ctx.fillStyle='rgba(3,10,16,.35)';
      ctx.beginPath();ctx.ellipse(g.x+ox,(r+1)*cell-cell*.1,cell*.28*g.scale,cell*.09*g.scale,0,0,Math.PI*2);ctx.fill();}
    ctx.save();ctx.translate(g.x+ox,g.y+bob);
    if(g.pop>=0)ctx.globalAlpha=g.scale<.4?g.scale/.4:1;
    if(g.special==='prism'){ctx.save();ctx.rotate(t*.9);
      ctx.drawImage(PRISM,-s/2,-s/2,s,s);ctx.restore();
      const a=t*2.4;ctx.fillStyle='rgba(255,255,255,.9)';
      for(let i=0;i<3;i++){const aa=a+i*Math.PI*2/3;
        ctx.beginPath();ctx.arc(Math.cos(aa)*s*.4,Math.sin(aa)*s*.4,s*.05,0,7);ctx.fill();}}
    else{const spr=g.special==='mega'?MEGA:SPR[g.t];
      ctx.drawImage(spr,-s/2,-s/2,s,s);drawSpecialOverlay(g,s,t);}
    if(g.cham)drawChamOverlay(s,t);
    if(ICE[r][c]>0)drawIceOverlay(s,ICE[r][c],t);
    ctx.restore();}
  for(const gl of glints){const k=gl.t/gl.ttl;
    drawStar(ctx,gl.x,gl.y,gl.s*(0.6+k*.6),gl.rot,Math.sin(Math.PI*k)*.9);}
  for(const b of fxBeams){const p=b.t/.32,a=1-p,{x,y}=cellXY(b.r,b.c);
    ctx.save();ctx.globalAlpha=a;ctx.shadowColor='#ffd66b';ctx.shadowBlur=22;
    ctx.fillStyle='rgba(255,242,196,.95)';
    const w=cell*.34*(1-p*.5);
    if(b.dir==='h')ctx.fillRect(0,y-w/2,boardPx,w);else ctx.fillRect(x-w/2,0,w,boardPx);
    ctx.restore();}
  for(const r of fxRings){const p=r.t/.42;
    const col=r.teal?'120,240,220':(r.mega?'255,140,40':'255,190,80');
    ctx.strokeStyle=`rgba(${col},${1-p})`;
    ctx.lineWidth=(r.mega?cell*.2:cell*.12)*(1-p)+2;
    ctx.shadowColor=r.mega?'#ff7a1a':(r.teal?'#5ff2d6':'#ffb02e');ctx.shadowBlur=16;
    ctx.beginPath();ctx.arc(r.x,r.y,cell*(.4+p*(r.mega?2.2:1.7)),0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  for(const p of particles){const a=1-p.t/p.ttl;
    ctx.globalAlpha=a;ctx.fillStyle=p.col;
    if(p.spark){ctx.beginPath();ctx.arc(p.x,p.y,p.sz*.7,0,Math.PI*2);ctx.fill();}
    else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.t*7);
      ctx.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz);ctx.restore();}}
  ctx.globalAlpha=1;
  if(rushT>0){ctx.strokeStyle='rgba(255,214,107,.28)';ctx.lineWidth=2;
    rr(ctx,2,2,boardPx-4,boardPx-4,12);ctx.stroke();}
  for(const p of popups){const k=p.t/p.ttl,a=k<.75?1:1-(k-.75)/.25;
    const sc=Math.min(1,p.t*7);
    ctx.save();ctx.translate(p.x,p.y-34*k);ctx.scale(sc,sc);ctx.globalAlpha=a;
    ctx.font=`800 ${Math.round(p.big?cell*.36:cell*.28)}px Unbounded, Nunito, sans-serif`;
    ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='rgba(8,16,26,.85)';
    ctx.strokeText(p.txt,0,0);ctx.fillStyle=p.col;ctx.fillText(p.txt,0,0);ctx.restore();}
  if(selected){const p=cellXY(selected.r,selected.c);
    const rr2=cell*.46+Math.sin(t*7)*cell*.02;
    ctx.strokeStyle=`rgba(255,214,107,${.7+.3*Math.sin(t*7)})`;
    ctx.lineWidth=3;ctx.shadowColor='#ffd66b';ctx.shadowBlur=14;
    rr(ctx,p.x-rr2,p.y-rr2,rr2*2,rr2*2,cell*.18);ctx.stroke();ctx.shadowBlur=0;}
  if(hammerAim){ctx.strokeStyle=`rgba(255,140,80,${.5+.3*Math.sin(t*6)})`;
    ctx.lineWidth=3;ctx.setLineDash([cell*.16,cell*.12]);
    rr(ctx,2,2,boardPx-4,boardPx-4,12);ctx.stroke();ctx.setLineDash([]);}
  ctx.restore();
  ctx.restore();}
const el={score:$('#score'),mid:$('#mid'),moves:$('#moves'),midStat:$('#midStat'),
  movesStat:$('#movesStat'),lblMid:$('#lblMid'),lblRight:$('#lblRight'),
  goalLbl:$('#goalLbl'),goalNum:$('#goalNum'),bar:$('#barFill'),best:$('#best'),
  goalBox:$('#goalBox'),chipIce:$('#chipIce'),chipIceN:$('#chipIceN'),
  chipRock:$('#chipRock'),chipRockN:$('#chipRockN'),
  chipCham:$('#chipCham'),chipChamN:$('#chipChamN'),
  chipRush:$('#chipRush'),chipRushN:$('#chipRushN')};
function bump(e){e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump');}
function applyModeUI(){const time=mode==='time';
  el.lblMid.textContent=time?'Время, с':'Уровень';
  el.lblRight.textContent=time?'Рекорд':'Ходы';
  $('#hintCost').textContent=time?('−'+HINT_COST_TIME+' с'):('−'+HINT_COST);}
function updateHUD(){
  if(mode==='time'){
    el.moves.textContent=fmt(bestT);fitNum(el.moves);el.movesStat.classList.remove('low');
    el.chipIce.hidden=true;el.chipRock.hidden=true;el.chipCham.hidden=true;}
  else{
    el.mid.textContent=level;el.midStat.classList.remove('low');
    el.moves.textContent=moves;fitNum(el.moves);
    el.movesStat.classList.toggle('low',moves<=5&&!over);
    let ni=0,nr=0,nc=0;
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      if(ICE[r]&&ICE[r][c]>0)ni++;if(ROCK[r]&&ROCK[r][c]>0)nr++;
      if(grid[r]&&grid[r][c]&&grid[r][c].cham)nc++;}
    el.chipIce.hidden=ni===0;el.chipIceN.textContent=ni;
    el.chipRock.hidden=nr===0;el.chipRockN.textContent=nr;
    el.chipCham.hidden=nc===0;el.chipChamN.textContent=nc;}
  el.best.textContent=fmt(getBest(mode));fitNum(el.best);
  drawGoalGem();
  updateBossUI();}
function hudFrame(){
  const s=Math.round(dispScore);
  if(s!==lastShown){el.score.textContent=fmt(s);fitNum(el.score);lastShown=s;}
  if(rushT>0){el.chipRush.hidden=false;el.chipRushN.textContent=Math.ceil(rushT)+'с';}
  else el.chipRush.hidden=true;
  if(mode==='time'){
    const tl=Math.max(0,timeLeft);
    el.mid.textContent=tl<10?tl.toFixed(1):Math.ceil(tl);
    el.midStat.classList.toggle('low',tl<=10&&!over);
    el.goalNum.textContent=Math.ceil(tl)+' с';
    el.goalLbl.textContent='Осталось';
    el.bar.style.width=clamp(tl/TIME_START*100,0,100)+'%';
    el.bar.classList.toggle('danger',tl<=10);}
  else if(goal&&goal.type!=='boss'){
    el.bar.classList.remove('danger');
    if(goal.type==='score'){const ls=score-levelStartScore;
      el.goalLbl.textContent='Цель уровня';
      el.goalNum.textContent=fmt(Math.min(ls,goal.need))+' / '+fmt(goal.need);
      el.bar.style.width=clamp(ls/goal.need*100,0,100)+'%';}
    else if(goal.type==='color'){
      el.goalLbl.textContent='Собери кристаллы';
      el.goalNum.textContent=goal.done+' / '+goal.need;
      el.bar.style.width=clamp(goal.done/goal.need*100,0,100)+'%';}
    else{
      const left=sumIceLayers()+rockCount();
      const done=Math.max(0,goal.need-left);
      el.goalLbl.textContent='Очисти поле';
      el.goalNum.textContent='❄ '+sumIceLayers()+' · ⛰ '+rockCount();
      el.bar.style.width=clamp(done/Math.max(1,goal.need)*100,0,100)+'%';}}}
/* ========== ввод ========== */
function pick(e){const r=canvas.getBoundingClientRect(),cs=r.width/COLS;
  const c=Math.floor((e.clientX-r.left)/cs),row=Math.floor((e.clientY-r.top)/cs);
  if(c<0||row<0||c>=COLS||row>=ROWS)return null;return{r:row,c};}
const isAdj=(a,b)=>Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1;
canvas.addEventListener('pointerdown',e=>{
  if(!started||busy||over)return;Snd.init();
  const pos=pick(e);if(!pos)return;
  hintPair=null;
  if(hammerAim){hammerStrike(pos.r,pos.c);return;}
  const g=grid[pos.r][pos.c];
  if(!g){Snd.rockHit();shake(2);return;}
  if(ICE[pos.r][pos.c]>0){g.iceT=.4;Snd.iceCrack();shake(2);return;}
  if(selected&&isAdj(selected,pos)){const s=selected;selected=null;dragStart=null;
    doSwap(s.r,s.c,pos.r,pos.c);return;}
  if(selected&&selected.r===pos.r&&selected.c===pos.c){selected=null;return;}
  selected=pos;Snd.tick();
  dragStart={x:e.clientX,y:e.clientY,r:pos.r,c:pos.c};
  try{canvas.setPointerCapture(e.pointerId)}catch(err){}});
canvas.addEventListener('pointermove',e=>{
  if(!dragStart||busy||over||!started||hammerAim)return;
  const r=canvas.getBoundingClientRect(),cs=r.width/COLS;
  const dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;
  if(Math.hypot(dx,dy)<cs*.38)return;
  let dr=0,dc=0;
  if(Math.abs(dx)>Math.abs(dy))dc=dx>0?1:-1;else dr=dy>0?1:-1;
  const a={r:dragStart.r,c:dragStart.c},r2=a.r+dr,c2=a.c+dc;
  dragStart=null;selected=null;
  if(r2<0||c2<0||r2>=ROWS||c2>=COLS)return;
  doSwap(a.r,a.c,r2,c2);});
canvas.addEventListener('pointerup',()=>dragStart=null);
canvas.addEventListener('pointercancel',()=>dragStart=null);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
$('#plate').addEventListener('pointerdown',e=>{e.stopPropagation();Snd.tick();hidePlate();});
/* ========== кнопки ========== */
document.querySelectorAll('#startOv .modepick .btn').forEach(b=>
  b.addEventListener('click',()=>{Snd.init();beginRun(true,b.dataset.mode);}));
$('#btnContinue').addEventListener('click',()=>{
  Snd.init();const d=loadSave();
  if(d)beginRun(false,null,d);else beginRun(true,'classic');});
$('#btnAgain').addEventListener('click',()=>beginRun(true,mode));
$('#btnToMenu').addEventListener('click',toMenu);
$('#btnMenu').addEventListener('click',()=>{if(started)toMenu();});
$('#btnRestart').addEventListener('click',()=>{if(started){Snd.init();beginRun(true,mode);}});
$('#btnHint').addEventListener('click',()=>{
  if(!started||busy||over)return;Snd.init();
  const pair=findHintPair();if(!pair){Snd.bad();return;}
  if(mode==='classic'){
    if(score<HINT_COST){Snd.bad();popup(boardPx/2,boardPx/2,'Нужно '+HINT_COST+' очков',false,'#ff8b8b');return;}
    score-=HINT_COST;popup(boardPx/2,boardPx/2,'−'+HINT_COST,true,'#ff8b8b');}
  else{
    if(timeLeft<=HINT_COST_TIME+2){Snd.bad();popup(boardPx/2,boardPx/2,'Мало времени',false,'#ff8b8b');return;}
    timeLeft-=HINT_COST_TIME;popup(boardPx/2,boardPx/2,'−'+HINT_COST_TIME+' с',true,'#ff8b8b');}
  hintPair=pair;Snd.tick();updateHUD();});
$('#btnHam').addEventListener('click',()=>{
  if(!started||over||busy)return;Snd.init();
  if(ham<=0){Snd.bad();return;}
  hammerAim=!hammerAim;updateBoosterUI();
  if(hammerAim){Snd.tick();popup(boardPx/2,boardPx*.5,'Тапни по цели',false,'#ffd66b');}});
$('#btnFrz').addEventListener('click',()=>{
  if(!started||over)return;Snd.init();
  if(frz<=0){Snd.bad();return;}
  useFreeze();});
$('#btnLb').addEventListener('click',()=>openLb('classic'));
$('#btnLb2').addEventListener('click',()=>openLb(mode));
$('#btnLbClose').addEventListener('click',()=>$('#lbOv').classList.add('hidden'));
$('#btnLbRefresh').addEventListener('click',()=>renderLb());
$('#lbTabC').addEventListener('click',()=>{lbMode='classic';renderLb();});
$('#lbTabT').addEventListener('click',()=>{lbMode='time';renderLb();});
$('#btnHow').addEventListener('click',()=>$('#howOv').classList.remove('hidden'));
$('#btnHowClose').addEventListener('click',()=>$('#howOv').classList.add('hidden'));
$('#btnSettings').addEventListener('click',()=>$('#setOv').classList.remove('hidden'));
$('#btnSetClose').addEventListener('click',()=>$('#setOv').classList.add('hidden'));
$('#btnAbout').addEventListener('click',()=>$('#aboutOv').classList.remove('hidden'));
$('#btnAboutClose').addEventListener('click',()=>$('#aboutOv').classList.add('hidden'));
const ni=$('#nameInput');ni.value=store.get('sv-name','');
ni.addEventListener('input',()=>store.set('sv-name',ni.value.slice(0,14)));
const btnSound=$('#btnSound');
function paintSound(){const t=Snd.on?'🔊':'';
  const a=$('#btnSound'),b=$('#btnSoundSet');if(a)a.textContent=t;if(b)b.textContent=t;}
function toggleSound(){Snd.on=!Snd.on;store.set('sv-snd',Snd.on?'1':'0');
  paintSound();if(Snd.on){Snd.init();Snd.tick();}}
btnSound.addEventListener('click',toggleSound);
$('#btnSoundSet').addEventListener('click',toggleSound);
document.addEventListener('pointerdown',e=>{
  const b=e.target.closest?e.target.closest('.btn'):null;
  if(!b)return;
  b.classList.add('pressed');
  const off=()=>b.classList.remove('pressed');
  b.addEventListener('pointerup',off,{once:true});
  b.addEventListener('pointercancel',off,{once:true});
  b.addEventListener('pointerleave',off,{once:true});
},{passive:true});
/* ========== никнейм ========== */
function maybeNick(){if(store.get('sv-nick-done'))return;
  if(!$('#nickOv').classList.contains('hidden'))return;
  $('#nickOv').classList.remove('hidden');}
function saveNick(){const v=$('#nickInput').value.trim().slice(0,14);
  if(v){store.set('sv-name',v);ni.value=v;}
  store.set('sv-nick-done','1');
  $('#nickOv').classList.add('hidden');Snd.init();Snd.tick();}
$('#btnNickSave').addEventListener('click',saveNick);
$('#btnNickSkip').addEventListener('click',()=>{store.set('sv-nick-done','1');
  $('#nickOv').classList.add('hidden');});
$('#nickInput').addEventListener('keydown',e=>{if(e.key==='Enter')saveNick();});
/* ========== автосохранение и доотправка топа ========== */
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame();});
window.addEventListener('beforeunload',()=>saveGame());
window.addEventListener('pagehide',()=>saveGame());
window.addEventListener('online',()=>{lbFlush().then(()=>{
  if(!$('#lbOv').classList.contains('hidden'))renderLb();});});
/* ========== пыль ========== */
(function dust(){const d=$('#dust'),cols=['#ffd66b','#5ff2d6','#bfe6ff','#ffffff'];
  for(let i=0;i<26;i++){const s=document.createElement('span'),sz=rnd(2,4.5);
    s.style.cssText=`left:${rnd(100)}%;width:${sz}px;height:${sz}px;
      background:${cols[irnd(cols.length)]};opacity:${rnd(.15,.5)};
      animation-duration:${rnd(9,22)}s;animation-delay:-${rnd(0,20)}s;
      box-shadow:0 0 ${sz*2.5}px currentColor`;
    d.appendChild(s);}})();
/* ========== PWA ========== */
if('serviceWorker'in navigator&&location.protocol.startsWith('http')){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});}
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();deferredPrompt=e;$('#installRow').hidden=false;});
$('#btnInstall').addEventListener('click',async()=>{
  if(!deferredPrompt)return;deferredPrompt.prompt();
  try{await deferredPrompt.userChoice}catch(e){}
  deferredPrompt=null;$('#installRow').hidden=true;});
/* ========== главный цикл ========== */
let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  update(dt);render(now/1000);
  if(splashOn)drawSplash(now/1000);
  if(!$('#startOv').classList.contains('hidden'))drawMenuGems(now/1000);
  requestAnimationFrame(frame);}
function update(dt){
  for(let i=tweens.length-1;i>=0;i--){const tw=tweens[i];tw.t+=dt*1000;
    tw.fn(tw.ease(Math.min(1,tw.t/tw.dur)));
    if(tw.t>=tw.dur){tweens.splice(i,1);tw.done&&tw.done();}}
  const GRAV=cell*52,MAXV=cell*34;
  for(const row of grid)for(const g of row){if(!g)continue;
    if(g.iceT>0)g.iceT-=dt;
    if(g.falling){const ty=cellXY(g.r,g.c).y;
      g.vy=Math.min(MAXV,g.vy+GRAV*dt);g.y+=g.vy*dt;
      if(g.y>=ty){if(g.vy>cell*15&&!g.bounced){g.y=ty;g.vy*=-.22;g.bounced=true;}
        else{g.y=ty;g.vy=0;g.falling=false;}}}
    if(g.pop>=0){
      if(g.popDelay>0)g.popDelay-=dt*1000;
      else{if(!g.burst){g.burst=true;burst(g.x,g.y,COLORS[g.t].main);}
        g.pop+=dt/(POP_MS/1000);
        g.scale=g.pop<.3?1+(g.pop/.3)*.3:Math.max(0,1.3*(1-(g.pop-.3)/.7));}}}
  if(fallRes&&allSettled()){const f=fallRes;fallRes=null;f.res();}
  if(mode==='time'&&started&&!over){
    timeLeft-=dt;
    const sec=Math.ceil(timeLeft);
    if(sec<=10&&sec!==lastTick&&sec>0){lastTick=sec;Snd.tickLow();buzz(15);}
    if(timeLeft<=0){timeLeft=0;gameOver();}}
  if(rushT>0&&started&&!over){rushT-=dt;
    rushPartT-=dt;
    if(rushPartT<=0){rushPartT=.16;
      particles.push({x:rnd(boardPx),y:-cell*.2,vx:rnd(-cell*.25,cell*.25),vy:rnd(cell*.7,cell*1.5),
        gr:0,t:0,ttl:rnd(1.4,2.4),col:Math.random()<.6?'#ffd66b':'#fff3c4',sz:rnd(.03,.07)*cell,spark:true});}
    if(rushT<=0)endRush();}
  glintT-=dt;
  if(glintT<=0&&started&&!over){glintT=rnd(.45,1.3);
    const g=grid[irnd(ROWS)]?.[irnd(COLS)];
    if(g&&!g.falling&&g.pop<0&&ICE[g.r][g.c]===0)
      glints.push({x:g.x,y:g.y-cell*.12,t:0,ttl:.55,s:cell*rnd(.4,.75),rot:rnd(Math.PI)});}
  for(let i=glints.length-1;i>=0;i--){glints[i].t+=dt;if(glints[i].t>glints[i].ttl)glints.splice(i,1);}
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];
    p.vy+=p.gr*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.t+=dt;
    if(p.t>p.ttl)particles.splice(i,1);}
  for(let i=popups.length-1;i>=0;i--){popups[i].t+=dt;if(popups[i].t>popups[i].ttl)popups.splice(i,1);}
  for(let i=fxBeams.length-1;i>=0;i--){fxBeams[i].t+=dt;if(fxBeams[i].t>.32)fxBeams.splice(i,1);}
  for(let i=fxRings.length-1;i>=0;i--){fxRings[i].t+=dt;if(fxRings[i].t>.42)fxRings.splice(i,1);}
  if(shakeT>0)shakeT-=dt;else shakeMag=0;
  dispScore+=(score-dispScore)*Math.min(1,dt*7);
  hudFrame();}
/* ========== старт ========== */
new ResizeObserver(fitCanvas).observe(document.querySelector('.board-frame'));
buildSprites();buildPrism();buildMega();buildRocks();
ICE=zeroMat();ROCK=zeroMat();goal=makeGoal(1);
fitCanvas();genBoard();goal=makeGoal(1);introFall();
paintGolem();
paintSound();applyModeUI();applyTheme();updateHUD();updateBoosterUI();updateBossUI();refreshStartUI();
lbFlush();
requestAnimationFrame(frame);
