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
