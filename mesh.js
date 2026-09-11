/* ========== ОГОНЬ + ЦЕПИ + ЧТО НОВОГО ========== */
(function(){
const CUR_VER='0.6beta';
let FIRE={}, CHAINS=[], chainSeq=1, moveCount=0;
const FIRE_START=13, CHAIN_START=8;
function key2(r,c){return r+','+c;}
function chainEnds(id){const out=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  const g=grid[r]&&grid[r][c];if(g&&g.chainId===id)out.push({r,c});}return out;}
function breakChain(id){CHAINS=CHAINS.filter(c=>c.id!==id);
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];
    if(g&&g.chainId===id){g.chainId=undefined;const p=cellXY(r,c);
      for(let i=0;i<8;i++){const a=rnd(Math.PI*2),sp=rnd(1,3)*cell;
        particles.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,gr:cell*6,
          t:0,ttl:rnd(.3,.6),col:'#ffe89a',sz:rnd(.05,.1)*cell,spark:true});}}
  Snd.bell(1200,.2,.15);Snd.bell(1600,.15,.1);}
function fireCount(l){return l>=FIRE_START?Math.min(1+Math.floor((l-FIRE_START)/4),3):0;}
function chainCount(l){return l>=CHAIN_START?Math.min(1+Math.floor((l-CHAIN_START)/3),3):0;}
function freeCell(){const cand=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  const g=grid[r]&&grid[r][c];if(g&&!g.special&&!g.chainId&&ICE[r][c]===0&&ROCK[r][c]===0&&!FIRE[key2(r,c)])cand.push([r,c]);}
  if(!cand.length)return null;return cand[irnd(cand.length)];}
function spawnMech(){
  FIRE={};CHAINS=[];chainSeq=1;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g)g.chainId=undefined;}
  const nf=fireCount(level);
  for(let i=0;i<nf;i++){const cellpos=freeCell();if(cellpos)FIRE[key2(cellpos[0],cellpos[1])]=3;}
  const nc=chainCount(level);
  for(let i=0;i<nc;i++){
    const byColor={};for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      const g=grid[r]&&grid[r][c];if(g&&!g.special&&!g.chainId&&ICE[r][c]===0&&ROCK[r][c]===0&&!FIRE[key2(r,c)]){(byColor[g.t]=byColor[g.t]||[]).push([r,c]);}}
    const pools=Object.values(byColor).filter(a=>a.length>=2);
    if(!pools.length)continue;
    const pool=pools[irnd(pools.length)];
    const a=pool[irnd(pool.length)];let b=pool[irnd(pool.length)];
    let guard=0;while((b[0]===a[0]&&b[1]===a[1])&&guard++<20)b=pool[irnd(pool.length)];
    if(b[0]===a[0]&&b[1]===a[1])continue;
    const id=chainSeq++;
    grid[a[0]][a[1]].chainId=id;grid[b[0]][b[1]].chainId=id;
    CHAINS.push({id:id,hp:2});}
}
function spreadFire(fk){
  const[fr,fc]=fk.split(',').map(Number);
  const nb=[[fr-1,fc],[fr+1,fc],[fr,fc-1],[fr,fc+1]].filter(([r,c])=>{
    if(r<0||c<0||r>=ROWS||c>=COLS)return false;
    const g=grid[r]&&grid[r][c];return g&&!g.chainId&&ICE[r][c]===0&&ROCK[r][c]===0&&!FIRE[key2(r,c)];});
  if(!nb.length)return;
  const t=nb[irnd(nb.length)];FIRE[key2(t[0],t[1])]=3;
  const p=cellXY(t[0],t[1]);showToast('🔥 Огонь расползается!');}
function explodeFire(fk,id){
  const[fr,fc]=fk.split(',').map(Number);
  const gems=new Set(),direct=new Set();
  const cells=[[fr,fc],[fr-1,fc],[fr+1,fc],[fr,fc-1],[fr,fc+1]];
  for(const[r,c]of cells){if(r<0||c<0||r>=ROWS||c>=COLS)continue;
    if(ROCK[r][c]>0||ICE[r][c]>0)direct.add(key2(r,c));
    else if(grid[r]&&grid[r][c])gems.add(key2(r,c));}
  const p=cellXY(fr,fc);showBanner('ВСПЫШКА!','bad');Snd.boom();shake(12);buzz([30,50,30]);
  for(let i=0;i<20;i++){const a=rnd(Math.PI*2),sp=rnd(1,4)*cell;
    particles.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,gr:cell*7,
      t:0,ttl:rnd(.4,.8),col:i%2?'#ff7a1a':'#ffd66b',sz:rnd(.06,.12)*cell,spark:true});}
  damageObstacles(gems,direct);
  return _destroySet(gems,id,[]);}
function extinguishFx(fr,fc){const p=cellXY(fr,fc);
  for(let i=0;i<12;i++){const a=rnd(Math.PI*2),sp=rnd(1,3)*cell;
    particles.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-cell,gr:cell*5,
      t:0,ttl:rnd(.3,.6),col:'#bfe9ff',sz:rnd(.05,.1)*cell,spark:true});}
  Snd.iceCrack();showToast('💧 Огонь потушен!');}

/* --- перехват spawn уровня --- */
const _placeObstacles=placeObstacles;
placeObstacles=function(l){const res=_placeObstacles(l);spawnMech();return res;};
const _beginRun=beginRun;
beginRun=async function(f,m,d){FIRE={};CHAINS=[];moveCount=0;return _beginRun(f,m,d);};

/* --- перехват уничтожения: цепи + огонь --- */
const _destroySet=destroySet;
destroySet=async function(set,id,spawns){
  for(const ch of CHAINS.slice()){
    const ends=chainEnds(ch.id);if(ends.length<2)continue;
    const ka=key2(ends[0].r,ends[0].c),kb=key2(ends[1].r,ends[1].c);
    const hasA=set.has(ka),hasB=set.has(kb);
    if(hasA&&hasB){breakChain(ch.id);}
    else if(hasA||hasB){const k=hasA?ka:kb;set.delete(k);ch.hp--;
      const p=cellXY(ends[0].r,ends[0].c);Snd.bell(900,.12,.12);
      if(ch.hp<=0)breakChain(ch.id);}
  }
  for(const fk of Object.keys(FIRE)){
    if(set.has(fk)){set.delete(fk);}
    else{const[fr,fc]=fk.split(',').map(Number);
      const nb=[[fr-1,fc],[fr+1,fc],[fr,fc-1],[fr,fc+1]];
      if(nb.some(([r,c])=>set.has(key2(r,c)))){delete FIRE[fk];extinguishFx(fr,fc);}}
  }
  return _destroySet(set,id,spawns);};

/* --- огонь не свапается и не совпадает --- */
const _doSwap=doSwap;
doSwap=async function(ra,ca,rb,cb){
  if(FIRE[key2(ra,ca)]||FIRE[key2(rb,cb)]){Snd.bad();shake(3);
    const p=cellXY(ra,ca);popup(p.x,p.y,'🔥 горячо!',false,'#ff8b5d');return;}
  return _doSwap(ra,ca,rb,cb);};
const _fmr=findMatchRuns;
findMatchRuns=function(){return _fmr().filter(run=>!run.cells.some(k=>FIRE[k]));};

/* --- ход: таймер огня + расползание --- */
const _afterMove=afterMove;
afterMove=async function(id){
  if(over||id!==runId)return _afterMove(id);
  moveCount++;
  const boom=[];
  for(const fk of Object.keys(FIRE)){FIRE[fk]--;if(FIRE[fk]<=0)boom.push(fk);}
  if(moveCount%3===0){for(const fk of Object.keys(FIRE))spreadFire(fk);}
  for(const fk of boom){delete FIRE[fk];await explodeFire(fk,id);}
  if(id!==runId||over)return;
  return _afterMove(id);};

/* --- отрисовка огня и цепей --- */
const _render=render;
render=function(t){_render(t);
  for(const fk of Object.keys(FIRE)){const[fr,fc]=fk.split(',').map(Number);
    const p=cellXY(fr,fc),s=cell*.9;
    const fl=.7+.3*Math.sin(t*10+fr+fc);
    ctx.save();ctx.translate(p.x,p.y);
    const g=ctx.createRadialGradient(0,s*.1,s*.05,0,0,s*.6);
    g.addColorStop(0,'rgba(255,240,180,.95)');g.addColorStop(.4,'rgba(255,140,40,.8)');
    g.addColorStop(1,'rgba(255,80,20,0)');
    ctx.fillStyle=g;ctx.globalAlpha=.85*fl;
    ctx.beginPath();ctx.moveTo(0,-s*.5*fl);ctx.quadraticCurveTo(s*.4,-s*.1,s*.3,s*.25);
    ctx.quadraticCurveTo(0,s*.5,-s*.3,s*.25);ctx.quadraticCurveTo(-s*.4,-s*.1,0,-s*.5*fl);ctx.fill();
    ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='700 '+Math.round(cell*.3)+'px Nunito,sans-serif';
    ctx.textAlign='center';ctx.fillText(String(FIRE[fk]),0,cell*.05);
    ctx.restore();}
  for(const ch of CHAINS){const e=chainEnds(ch.id);if(e.length<2)continue;
    const a=cellXY(e[0].r,e[0].c),b=cellXY(e[1].r,e[1].c);
    ctx.save();ctx.strokeStyle=ch.hp===2?'rgba(255,232,154,.8)':'rgba(255,140,80,.9)';
    ctx.lineWidth=cell*.06;ctx.setLineDash([cell*.14,cell*.1]);
    ctx.shadowColor='#ffd66b';ctx.shadowBlur=8;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.setLineDash([]);ctx.shadowBlur=0;
    for(const e2 of [a,b]){ctx.fillStyle=ch.hp===2?'#ffe89a':'#ff8c50';
      ctx.beginPath();ctx.arc(e2.x,e2.y,cell*.12,0,7);ctx.fill();}
    ctx.restore();}};

/* --- ЧТО НОВОГО (по версии) --- */
(function whatsnew(){
  if(store.get('sv-seen-ver','')===CUR_VER)return;
  const ov=document.createElement('div');ov.className='overlay hidden';ov.id='wnOv';
  ov.innerHTML='<div class="card"><h2 class="card-title" style="font-size:clamp(20px,5vw,28px)">🆕 Что нового</h2>'+
   '<ul class="rules"><li>◆ <b>🔥 Огонь</b> и <b>🔗 цепи</b>: гаси огонь рядом, рви цепи совпадениями</li>'+
   '<li>◆ <b>🎵 Музыка</b> меню + звук высыпания камней</li>'+
   '<li>◆ <b>🏆 Рейтинг</b>, цели с иконкой камня, бустеры за очки</li></ul>'+
   '<div class="ovbtns"><button class="btn big" id="btnWn">Понятно, играть!</button></div></div>';
  document.body.appendChild(ov);
  setTimeout(()=>{ov.classList.remove('hidden');},2600);
  ov.querySelector('#btnWn').addEventListener('click',()=>{
    store.set('sv-seen-ver',CUR_VER);ov.classList.add('hidden');
    setTimeout(()=>ov.remove(),400);});
})();
})();
