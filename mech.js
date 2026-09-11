(function(){
const CUR_VER='0.6beta';
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},
             set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ========== ЧТО НОВОГО ========== */
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

/* ========== СУНДУКИ И СКИНЫ ========== */
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
  return rewards;
}

function showChestReward(chest,rewards){
  const ov=document.createElement('div');
  ov.className='overlay';
  ov.innerHTML='<div class="plate-card" style="max-width:min(88vw,400px);text-align:center">'+
    '<div class="plate-ico">'+(chest.type==='gold'?'🥇':chest.type==='silver'?'🥈':'')+'</div>'+
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
      rewardsDiv.innerHTML+='<div style="font-size:16px;color:#b06bff;font-weight:700;margin-bottom:8px;"> Новый скин: '+skinName+'!</div>';
    }
  });
  
  ov.querySelector('#btnChestClose').addEventListener('click',()=>{
    ov.classList.remove('on');
    setTimeout(()=>ov.remove(),300);
  });
}

function showInventory(){
  const ov=document.createElement('div');
  ov.className='overlay';
  let chestsHtml='';
  CHESTS.filter(c=>!c.opened).forEach(c=>{
    const icon=c.type==='gold'?'':c.type==='silver'?'🥈':'🥉';
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
    '<h4 style="font-family:Unbounded,sans-serif;font-weight:700;font-size:16px;color:#bfe6ff;margin-bottom:12px;"> Сундуки</h4>'+
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
        if(rewards){
          ov.remove();
          showChestReward(chest,rewards);
        }
      }
    });
  });
  
  ov.querySelectorAll('.skin-item').forEach(el=>{
    el.addEventListener('click',()=>{
      const skinId=el.dataset.skin;
      applySkin(skinId);
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

function addInventoryButton(){
  const btn=document.createElement('button');
  btn.className='btn ghost icon';
  btn.innerHTML='📦';
  btn.title='Инвентарь';
  btn.style.cssText='position:relative;';
  const unopenedCount=CHESTS.filter(c=>!c.opened).length;
  if(unopenedCount>0){
    const badge=document.createElement('span');
    badge.style.cssText='position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;padding:0 5px;border-radius:99px;background:linear-gradient(#ffd66b,#ffb02e);color:#3a2400;font-family:Unbounded,sans-serif;font-size:11px;font-weight:700;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.45);';
    badge.textContent=unopenedCount;
    btn.appendChild(badge);
  }
  btn.addEventListener('click',showInventory);
  const controls=document.querySelector('.controls');
  if(controls){
    const menuBtn=document.querySelector('#btnMenu');
    if(menuBtn){controls.insertBefore(btn,menuBtn);}
    else{controls.appendChild(btn);}
  }
}

/* ========== ИНТЕГРАЦИЯ С ИГРОЙ ========== */
const _levelUp=window.levelUp;
window.levelUp=async function(id){
  await _levelUp(id);
  const chest=generateChest(level);
  if(chest){
    setTimeout(()=>{
      showChestReward(chest,[{type:'coins',amount:0}]);
    },1500);
  }
};

applySkin(ACTIVE_SKIN);
setTimeout(addInventoryButton,100);

/* ========== ОГОНЬ + ЦЕПИ ========== */
let FIRE={},CHAINS=[],chainSeq=1,moveCount=0;
const FIRE_START=13,CHAIN_START=8;
function key2(r,c){return r+','+c;}
function chainEnds(id){const out=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g&&g.chainId===id)out.push({r,c});}return out;}
function breakChain(id){CHAINS=CHAINS.filter(c=>c.id!==id);for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g&&g.chainId===id){g.chainId=undefined;const p=cellXY(r,c);for(let i=0;i<8;i++){const a=rnd(Math.PI*2),sp=rnd(1,3)*cell;particles.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,gr:cell*6,t:0,ttl:rnd(.3,.6),col:'#ffe89a',sz:rnd(.05,.1)*cell,spark:true});}}Snd.bell(1200,.2,.15);Snd.bell(1600,.15,.1);}
function fireCount(l){return l>=FIRE_START?Math.min(1+Math.floor((l-FIRE_START)/4),3):0;}
function chainCount(l){return l>=CHAIN_START?Math.min(1+Math.floor((l-CHAIN_START)/3),3):0;}
function freeCell(){const cand=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g&&!g.special&&!g.chainId&&ICE[r][c]===0&&ROCK[r][c]===0&&!FIRE[key2(r,c)])cand.push([r,c]);}if(!cand.length)return null;return cand[irnd(cand.length)];}
function spawnMech(){FIRE={};CHAINS=[];chainSeq=1;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g)g.chainId=undefined;}const nf=fireCount(level);for(let i=0;i<nf;i++){const cp=freeCell();if(cp)FIRE[key2(cp[0],cp[1])]=3;}const nc=chainCount(level);for(let i=0;i<nc;i++){const byColor={};for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const g=grid[r]&&grid[r][c];if(g&&!g.special&&!g.chainId&&ICE[r][c]===0&&ROCK[r][c]===0&&!FIRE[key2(r,c)]){(byColor[g.t]=byColor[g.t]||[]).push([r,c]);}}const pools=Object.values(byColor).filter(a=>a.length>=2);if(!pools.length)continue;const pool=pools[irnd(pools.length)];const a=pool[irnd(pool.length)];let b=pool[irnd(pool.length)];let guard=0;while((b[0]===a[0]&&b[1]===a[1])&&guard++<20)b=pool[irnd(pool.length)];if(b[0]===a[0]&&b[1]===a[1])continue;const id=chainSeq++;grid[a[0]][a[1]].chainId=id;grid[b[0]][b[1]].chainId=id;CHAINS.push({id:id,hp:2});}}
function spreadFire(fk){const[fr,fc]=fk.split(',').map(Number);const nb=[[fr-1,fc],[fr+1,fc],[fr,fc-1],[fr,fc+1]].filter(([r,c])=>{if(r<0||c<0||r>=ROWS||c>=COLS)return false;const g=grid[r]&&grid[r][c];return g&&!g.chainId&&ICE[r][c]===0&&ROCK[r][c]===0&&!FIRE[key2
