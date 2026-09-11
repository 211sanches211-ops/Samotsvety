(function(){
const CUR_VER='0.6beta';
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},
             set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

if(store.get('sv-seen-ver','')!==CUR_VER){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,10,16,.85);backdrop-filter:blur(6px);';
  ov.innerHTML='<div style="background:linear-gradient(170deg,#13314a,#0b1e2e);border-radius:26px;padding:30px;max-width:min(94vw,430px);text-align:center;box-shadow:0 34px 90px rgba(0,0,0,.65);">'+
    '<h2 style="font-family:Unbounded,sans-serif;font-weight:900;font-size:clamp(20px,5vw,28px);color:#ffd66b;margin:0 0 20px 0;text-shadow:0 1px 0 #e0a800,0 2px 0 #c79400,0 3px 0 #a67c00,0 4px 0 #8a6d00;">🆕 Что нового</h2>'+
    '<p style="font-size:16px;color:#bfe6ff;font-weight:700;line-height:1.6;margin:0 0 25px 0;">Добавлены новые уровни сложности с огнем и цепями!</p>'+
    '<button id="btnWn" style="font-family:Nunito,sans-serif;font-weight:900;font-size:19px;padding:16px 40px;border-radius:18px;border:none;color:#06202c;background:linear-gradient(#ffd66b,#ffb02e);box-shadow:0 4px 0 #9c6a00,0 12px 20px rgba(0,0,0,.35);cursor:pointer;">Понятно, играть!</button>'+
    '</div>';
  document.body.appendChild(ov);
  setTimeout(function(){ov.style.opacity='1';},10);
  document.getElementById('btnWn').addEventListener('click',function(){
    store.set('sv-seen-ver',CUR_VER);
    ov.style.opacity='0';ov.style.transition='opacity .4s';
    setTimeout(function(){ov.remove();},400);
  });
}

let CHESTS=JSON.parse(store.get('sv-chests','[]'))||[];
let SKINS=JSON.parse(store.get('sv-skins','["classic"]'))||['classic'];
let COINS=parseInt(store.get('sv-coins','0'))||0;
let ACTIVE_SKIN=store.get('sv-active-skin','classic');

const SKIN_DATA={
  classic:{name:'Классический',frameA:'#143249',frameB:'#0b1d2c',glowA:'rgba(56,224,200,.10)',glowB:'rgba(255,176,46,.10)'},
  emerald:{name:'Изумрудный',frameA:'#1a4a3a',frameB:'#0d2c22',glowA:'rgba(46,230,168,.25)',glowB:'rgba(120,255,180,.15)'},
  ruby:{name:'Рубиновый',frameA:'#4a1a2a',frameB:'#2c0d1a',glowA:'rgba(255,77,109,.25)',glowB:'rgba(255,150,170,.15)'},
  amethyst:{name:'Аметистовый',frameA:'#3a1a4a',frameB:'#1f0d2c',glowA:'rgba(176,107,255,.25)',glowB:'rgba(200,150,255,.15)'}
};

function applySkin(skinId){
  const skin=SKIN_DATA[skinId]||SKIN_DATA.classic;
  document.body.style.setProperty('--frameA',skin.frameA);
  document.body.style.setProperty('--frameB',skin.frameB);
  document.body.style.setProperty('--glowA',skin.glowA);
  document.body.style.setProperty('--glowB',skin.glowB);
  ACTIVE_SKIN=skinId;
  store.set('sv-active-skin',skinId);
}

function saveInventory(){
  store.set('sv-chests',JSON.stringify(CHESTS));
  store.set('sv-skins',JSON.stringify(SKINS));
  store.set('sv-coins',String(COINS));
}

function generateChest(level){
  if(level<6)return null;
  const roll=Math.random();
  let type=null;
  if(roll<0.02)type='gold';
  else if(roll<0.12)type='silver';
  else if(roll<0.37)type='bronze';
  if(!type)return null;
  const chest={type:type,opened:false,id:Date.now()};
  CHESTS.push(chest);
  saveInventory();
  updateInvBadge();
  return chest;
}

function openChest(chestId){
  const chest=CHESTS.find(c=>c.id===chestId);
  if(!chest||chest.opened)return null;
  chest.opened=true;
  let rewards=[];
  if(chest.type==='bronze'){
    const coins=Math.floor(Math.random()*1500)+2000;
    COINS+=coins;
    rewards.push({type:'coins',amount:coins});
  }else if(chest.type==='silver'){
    const coins=Math.floor(Math.random()*2000)+3000;
    COINS+=coins;
    rewards.push({type:'coins',amount:coins});
  }else if(chest.type==='gold'){
    const coins=Math.floor(Math.random()*3000)+5000;
    COINS+=coins;
    rewards.push({type:'coins',amount:coins});
    const allSkins=Object.keys(SKIN_DATA);
    const newSkins=allSkins.filter(s=>!SKINS.includes(s));
    if(newSkins.length>0){
      const skin=newSkins[Math.floor(Math.random()*newSkins.length)];
      SKINS.push(skin);
      rewards.push({type:'skin',skin:skin});
    }
  }
  saveInventory();
  updateInvBadge();
  return rewards;
}

function showChestReward(chest,rewards){
  const ov=document.createElement('div');
  ov.className='overlay';
  ov.innerHTML='<div class="plate-card" style="max-width:min(88vw,400px);text-align:center">'+
    '<div class="plate-ico">'+(chest.type==='gold'?'🥇':chest.type==='silver'?'🥈':'🥉')+'</div>'+
    '<h3 style="font-family:Unbounded,sans-serif;font-weight:700;font-size:clamp(15px,3.6vw,20px);color:#ffd66b;margin-bottom:16px;text-shadow:0 2px 0 #7a4c00,0 4px 10px rgba(0,0,0,.4);">Сундук открыт!</h3>'+
    '<div id="chestRewards" style="margin-bottom:20px"></div>'+
    '<button id="btnChestClose" class="btn" style="width:100%;font-size:15px;padding:14px 20px;">Забрать</button>'+
    '</div>';
  document.body.appendChild(ov);
  setTimeout(()=>{ov.classList.add('on');},10);
  const rewardsDiv=ov.querySelector('#chestRewards');
  rewards.forEach(r=>{
    if(r.type==='coins'){
      rewardsDiv.innerHTML+='<div style="font-size:16px;color:#ffd66b;font-weight:700;margin-bottom:8px;">💰 +'+r.amount.toLocaleString('ru-RU')+' монет</div>';
    }else if(r.type==='skin'){
      const skinName=SKIN_DATA[r.skin].name;
      rewardsDiv.innerHTML+='<div style="font-size:16px;color:#b06bff;font-weight:700;margin-bottom:8px;">✨ Новый скин: '+skinName+'!</div>';
    }
  });
  ov.querySelector('#btnChestClose').addEventListener('click',()=>{
    ov.classList.remove('on');
    setTimeout(()=>ov.remove(),300);
  });
}

function updateInvBadge(){
  const btn=document.getElementById('btnInv');
  if(!btn)return;
  const unopenedCount=CHESTS.filter(c=>!c.opened).length;
  let badge=btn.querySelector('#invBadge');
  if(unopenedCount>0){
    if(!badge){
      badge=document.createElement('span');
      badge.id='invBadge';
      badge.style.cssText='position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;padding:0 5px;border-radius:99px;background:linear-gradient(#ffd66b,#ffb02e);color:#3a2400;font-family:Unbounded,sans-serif;font-size:11px;font-weight:700;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.45);';
      btn.appendChild(badge);
    }
    badge.textContent=unopenedCount;
  }else if(badge){
    badge.remove();
  }
}

function showInventory(){
  const ov=document.createElement('div');
  ov.className='overlay';
  let chestsHtml='';
  CHESTS.filter(c=>!c.opened).forEach(c=>{
    const icon=c.type==='gold'?'🥇':c.type==='silver'?'🥈':'🥉';
    chestsHtml+='<div class="chest-item" data-id="'+c.id+'" style="background:rgba(8,22,34,.6);border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;text-align:center;font-size:14px;color:#bfe6ff;font-weight:700;">'+icon+' '+c.type+' сундук</div>';
  });
  if(!chestsHtml)chestsHtml='<div style="text-align:center;color:#7fa5bd;padding:20px;">Нет закрытых сундуков</div>';
  let skinsHtml='';
  SKINS.forEach(s=>{
    const skin=SKIN_DATA[s];
    const isActive=ACTIVE_SKIN===s;
    skinsHtml+='<div class="skin-item" data-skin="'+s+'" style="background:'+(isActive?'rgba(255,214,107,.15)':'rgba(8,22,34,.6)')+';border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;text-align:center;font-size:14px;color:'+(isActive?'#ffd66b':'#bfe6ff')+';font-weight:700;border:'+(isActive?'2px solid #ffd66b':'1px solid rgba(140,220,255,.1)')+'">'+skin.name+(isActive?' ✓':'')+'</div>';
  });
  ov.innerHTML='<div class="plate-card" style="max-width:min(88vw,420px);max-height:80vh;overflow-y:auto">'+
    '<h3 style="font-family:Unbounded,sans-serif;font-weight:700;font-size:clamp(18px,4vw,24px);color:#ffd66b;margin-bottom:16px;text-shadow:0 2px 0 #7a4c00,0 4px 10px rgba(0,0,0,.4);">💰 Монеты: '+COINS.toLocaleString('ru-RU')+'</h3>'+
    '<h4 style="font-family:Unbounded,sans-serif;font-weight:700;font-size:16px;color:#bfe6ff;margin-bottom:12px;">📦 Сундуки</h4>'+
    '<div id="chestsList">'+chestsHtml+'</div>'+
    '<h4 style="font-family:Unbounded,sans-serif;font-weight:700;font-size:16px;color:#bfe6ff;margin:20px 0 12px 0;">🎨 Скины</h4>'+
    '<div id="skinsList">'+skinsHtml+'</div>'+
    '<button id="btnInvClose" class="btn ghost" style="width:100%;font-size:15px;padding:14px 20px;margin-top:16px;">Закрыть</button>'+
    '</div>';
  document.body.appendChild(ov);
  setTimeout(()=>{ov.classList.add('on');},10);
  ov.querySelectorAll('.chest-item').forEach(el=>{
    el.addEventListener('click',()=>{
      const chestId=parseInt(el.dataset.id);
      const chest=CHESTS.find(c=>c.id===chestId);
      if(chest&&!chest.opened){
        const rewards=openChest(chestId);
        if(rewards){ov.remove();showChestReward(chest,rewards);}
      }
    });
  });
  ov.querySelectorAll('.skin-item').forEach(el=>{
    el.addEventListener('click',()=>{
      applySkin(el.dataset.skin);
      ov.remove();
      showInventory();
    });
  });
  ov.querySelector('#btnInvClose').addEventListener('click',()=>{
    ov.classList.remove('on');
    setTimeout(()=>ov.remove(),300);
  });
  ov.addEventListener('click',(e)=>{if(e.target===ov){ov.classList.remove('on');setTimeout(()=>ov.remove(),300);}});
}

function createInvButton(){
  const btn=document.createElement('button');
  btn.className='btn ghost icon';
  btn.id='btnInv';
  btn.title='Инвентарь';
  btn.innerHTML='📦';
  btn.style.cssText='position:relative;';
  btn.addEventListener('click',showInventory);
  const controls=document.querySelector('.controls');
  if(controls){
    const menuBtn=document.querySelector('#btnMenu');
    if(menuBtn){controls.insertBefore(btn,menuBtn);}
    else{controls.appendChild(btn);}
  }
  updateInvBadge();
}

setTimeout(createInvButton,500);
applySkin(ACTIVE_SKIN);

const _levelUp=window.levelUp;
window.levelUp=async function(id){
  await _levelUp(id);
  const chest=generateChest(level);
  if(chest){
    setTimeout(()=>{
      const coins=Math.floor(Math.random()*1500)+2000;
      COINS+=coins;saveInventory();updateInvBadge();
      showChestReward(chest,[{type:'coins',amount:coins}]);
    },1500);
  }
};

let FIRE={},CHAINS=[],chainSeq=1,moveCount=0;
const FIRE_START=13,CHAIN_START=8;
function key2(r,c){return r+','+c;}
function chainEnds(id){const out=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g&&g.chainId===id)out.push({r,c});}return out;}
function breakChain(id){CHAINS=CHAINS.filter(c=>c.id!==id);for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g&&g.chainId===id){g.chainId=undefined;const p=cellXY(r,c);for(let i=0;i<8;i++){const a=rnd(Math.PI*2),sp=rnd(1,3)*cell;particles.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,gr:cell*6,t:0,ttl:rnd(.3,.6),col:'#ffe89a',sz:rnd(.05,.1)*cell,spark:true});}}Snd.bell(1200,.2,.15);Snd.bell(1600,.15,.1);}
function fireCount(l){return l>=FIRE_START?Math.min(1+Math.floor((l-FIRE_START)/4),3):0;}
function chainCount(l){return l>=CHAIN_START?Math.min(1+Math.floor((l-CHAIN_START)/3),3):0;}
function freeCell(){const cand=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g&&!g.special&&!g.chainId&&ICE[r][c]===0&&ROCK[r][c]===0&&!FIRE[key2(r,c)])cand.push([r,c]);}if(!cand.length)return null;return cand[irnd(cand.length)];}
function spawnMech(){FIRE={};CHAINS=[];chainSeq=1;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g)g.chainId=undefined;}const nf=fireCount(level);for(let i=0;i<nf;i++){const cp=freeCell();if(cp)FIRE[key2(cp[0],cp[1])]=3;}const nc=chainCount(level);for(let i=0;i<nc;i++){const byColor={};for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g&&!g.special&&!g.chainId&&ICE[r][c]===0&&ROCK[r][c]===0&&!FIRE[key2(r,c)]){(byColor[g.t]=byColor[g.t]||[]).push([r,c]);}}const pools=Object.values(byColor).filter(a=>a.length>=2);if(!pools.length)continue;const pool=pools[irnd(pools.length)];const a=pool[irnd(pool.length)];let b=pool[irnd(pool.length)];let guard=0;while((b[0]===a[0]&&b[1]===a[1])&&guard++<20)b=pool[irnd(pool.length)];if(b[0]===a[0]&&b[1]===a[1])continue;const id=chainSeq++;grid[a[0]][a[1]].chainId=id;grid[b[0]][b[1]].chainId=id;CHAINS.push({id:id,hp:2});}}
function spreadFire(fk){const[fr,fc]=fk.split(',').map(Number);const nb=[[fr-1,fc],[fr+1,fc],[fr,fc-1],[fr,fc+1]].filter(([r,c])=>{if(r<0||c<0||r>=ROWS||c>=COLS)return false;const g=grid[r]&&grid[r][c];return g&&!g.chainId&&ICE[r][c]===0&&ROCK[r][c]===0&&!FIRE[key2(r,c)];});if(!nb.length)return;const t=nb[irnd(nb.length)];FIRE[key2(t[0],t[1])]=3;showToast(' Огонь расползается!');}
function explodeFire(fk,id){const[fr,fc]=fk.split(',').map(Number);const gems=new Set(),direct=new Set();const cells=[[fr,fc],[fr-1,fc],[fr+1,fc],[fr,fc-1],[fr,fc+1]];for(const[r,c]of cells){if(r<0||c<0||r>=ROWS||c>=COLS)continue;if(ROCK[r][c]>0||ICE[r][c]>0)direct.add(key2(r,c));else if(grid[r]&&grid[r][c])gems.add(key2(r,c));}const p=cellXY(fr,fc);showBanner('ВСПЫШКА!','bad');Snd.boom();shake(12);buzz([30,50,30]);for(let i=0;i<20;i++){const a=rnd(Math.PI*2),sp=rnd(1,4)*cell;particles.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,gr:cell*7,t:0,ttl:rnd(.4,.8),col:i%2?'#ff7a1a':'#ffd66b',sz:rnd(.06,.12)*cell,spark:true});}damageObstacles(gems,direct);return _destroySet(gems,id,[]);}
function extinguishFx(fr,fc){const p=cellXY(fr,fc);for(let i=0;i<12;i++){const a=rnd(Math.PI*2),sp=rnd(1,3)*cell;particles.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-cell,gr:cell*5,t:0,ttl:rnd(.3,.6),col:'#bfe9ff',sz:rnd(.05,.1)*cell,spark:true});}Snd.iceCrack();}
const _placeObstacles=placeObstacles;placeObstacles=function(l){const res=_placeObstacles(l);spawnMech();return res;};
const _beginRun=beginRun;beginRun=async function(f,m,d){FIRE={};CHAINS=[];moveCount=0;return _beginRun(f,m,d);};
const _destroySet=destroySet;destroySet=async function(set,id,spawns){for(const ch of CHAINS.slice()){const ends=chainEnds(ch.id);if(ends.length<2)continue;const ka=key2(ends[0].r,ends[0].c),kb=key2(ends[1].r,ends[1].c);const hasA=set.has(ka),hasB=set.has(kb);if(hasA&&hasB){breakChain(ch.id);}else if(hasA||hasB){const k=hasA?ka:kb;set.delete(k);ch.hp--;Snd.bell(900,.12,.12);if(ch.hp<=0)breakChain(ch.id);}}for(const fk of Object.keys(FIRE)){if(set.has(fk)){set.delete(fk);}else{const[fr,fc]=fk.split(',').map(Number);const nb=[[fr-1,fc],[fr+1,fc],[fr,fc-1],[fr,fc+1]];if(nb.some(([r,c])=>set.has(key2(r,c)))){delete FIRE[fk];extinguishFx(fr,fc);}}}return _destroySet(set,id,spawns);};
const _doSwap=doSwap;doSwap=async function(ra,ca,rb,cb){if(FIRE[key2(ra,ca)]||FIRE[key2(rb,cb)]){Snd.bad();shake(3);const p=cellXY(ra,ca);popup(p.x,p.y,' горячо!',false,'#ff8b5d');return;}return _doSwap(ra,ca,rb,cb);};
const _fmr=findMatchRuns;findMatchRuns=function(){return _fmr().filter(run=>!run.cells.some(k=>FIRE[k]));};
const _afterMove=afterMove;afterMove=async function(id){if(over||id!==runId)return _afterMove(id);moveCount++;const boom=[];for(const fk of Object.keys(FIRE)){FIRE[fk]--;if(FIRE[fk]<=0)boom.push(fk);}if(moveCount%3===0){for(const fk of Object.keys(FIRE))spreadFire(fk);}for(const fk of boom){delete FIRE[fk];await explodeFire(fk,id);}if(id!==runId||over)return;return _afterMove(id);};
const _render=render;render=function(t){_render(t);for(const fk of Object.keys(FIRE)){const[fr,fc]=fk.split(',').map(Number);const p=cellXY(fr,fc),s=cell*.9;const fl=.7+.3*Math.sin(t*10+fr+fc);ctx.save();ctx.translate(p.x,p.y);const g=ctx.createRadialGradient(0,s*.1,s*.05,0,0,s*.6);g.addColorStop(0,'rgba(255,240,180,.95)');g.addColorStop(.4,'rgba(255,140,40,.8)');g.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=g;ctx.globalAlpha=.85*fl;ctx.beginPath();ctx.moveTo(0,-s*.5*fl);ctx.quadraticCurveTo(s*.4,-s*.1,s*.3,s*.25);ctx.quadraticCurveTo(0,s*.5,-s*.3,s*.25);ctx.quadraticCurveTo(-s*.4,-s*.1,0,-s*.5*fl);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='700 '+Math.round(cell*.3)+'px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText(String(FIRE[fk]),0,cell*.05);ctx.restore();}for(const ch of CHAINS){const e=chainEnds(ch.id);if(e.length<2)continue;const a=cellXY(e[0].r,e[0].c),b=cellXY(e[1].r,e[1].c);ctx.save();ctx.strokeStyle=ch.hp===2?'rgba(255,232,154,.8)':'rgba(255,140,80,.9)';ctx.lineWidth=cell*.06;ctx.setLineDash([cell*.14,cell*.1]);ctx.shadowColor='#ffd66b';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);ctx.shadowBlur=0;for(const e2 of [a,b]){ctx.fillStyle=ch.hp===2?'#ffe89a':'#ff8c50';ctx.beginPath();ctx.arc(e2.x,e2.y,cell*.12,0,7);ctx.fill();}ctx.restore();}};
})();
