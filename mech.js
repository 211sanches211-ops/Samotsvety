(function(){
const CUR_VER='0.6beta';
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},
             set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

// 1. ОКНО "ЧТО НОВОГО"
if(store.get('sv-seen-ver','')!==CUR_VER){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,10,16,.85);backdrop-filter:blur(6px);';
  ov.innerHTML='<div style="background:linear-gradient(170deg,#13314a,#0b1e2e);border-radius:26px;padding:30px;max-width:min(94vw,430px);text-align:center;box-shadow:0 34px 90px rgba(0,0,0,.65);">'+
    '<h2 style="font-family:Unbounded,sans-serif;font-weight:900;font-size:clamp(20px,5vw,28px);color:#ffd66b;margin:0 0 20px 0;text-shadow:0 1px 0 #e0a800,0 2px 0 #c79400,0 3px 0 #a67c00,0 4px 0 #8a6d00;">🆕 Что нового</h2>'+
    '<p style="font-size:16px;color:#bfe6ff;font-weight:700;line-height:1.6;margin:0 0 25px 0;">Добавлены новые уровни сложности с огнем и цепями!</p>'+
    '<button id="btnWn" style="font-family:Nunito,sans-serif;font-weight:900;font-size:19px;padding:16px 40px;border-radius:18px;border:none;color:#06202c;background:linear-gradient(#ffd66b,#ffb02e);box-shadow:0 4px 0 #9c6a00,0 12px 20px rgba(0,0,0,.35);cursor:pointer;">Понятно, играть!</button>'+
    '</div>';
  document.body.appendChild(ov);
  setTimeout(()=>{ov.style.opacity='1';},10);
  document.getElementById('btnWn').addEventListener('click',()=>{
    store.set('sv-seen-ver',CUR_VER);
    ov.style.opacity='0';ov.style.transition='opacity .4s';
    setTimeout(()=>ov.remove(),400);
  });
}

// 2. СУНДУКИ И СКИНЫ
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

function saveInv(){
  store.set('sv-chests',JSON.stringify(CHESTS));
  store.set('sv-skins',JSON.stringify(SKINS));
  store.set('sv-coins',String(COINS));
}

function updateInvBadge(){
  const btn=document.getElementById('btnInv');
  if(!btn)return;
  const count=CHESTS.filter(c=>!c.opened).length;
  let badge=btn.querySelector('#invBadge');
  if(count>0){
    if(!badge){
      badge=document.createElement('span');
      badge.id='invBadge';
      badge.style.cssText='position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;padding:0 5px;border-radius:99px;background:linear-gradient(#ffd66b,#ffb02e);color:#3a2400;font-family:Unbounded,sans-serif;font-size:11px;font-weight:700;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.45);';
      btn.appendChild(badge);
    }
    badge.textContent=count;
  }else if(badge){
    badge.remove();
  }
}

function generateChest(lvl){
  // === ВРЕМЕННАЯ ПРОВЕРКА: 100% шанс на 1 уровне ===
  if(lvl === 1) {
    CHESTS.push({type:'silver', opened:false, id:Date.now()});
    saveInv();
    updateInvBadge();
    return 'silver';
  }
  
  // Обычная логика (с 6 уровня)
  if(lvl < 6) return null;
  const roll = Math.random();
  let type = null;
  if(roll < 0.05) type = 'gold';
  else if(roll < 0.15) type = 'silver';
  else if(roll < 0.40) type = 'bronze';
  
  if(!type) return null;
  CHESTS.push({type:type, opened:false, id:Date.now()});
  saveInv();
  updateInvBadge();
  return type;
}

function openChest(chestId){
  const chest=CHESTS.find(c=>c.id===chestId);
  if(!chest||chest.opened)return null;
  chest.opened=true;
  let rewards=[];
  if(chest.type==='bronze'){
    const coins=Math.floor(Math.random()*1500)+2000;
    COINS+=coins; rewards.push({type:'coins',amount:coins});
  }else if(chest.type==='silver'){
    const coins=Math.floor(Math.random()*2000)+3000;
    COINS+=coins; rewards.push({type:'coins',amount:coins});
  }else if(chest.type==='gold'){
    const coins=Math.floor(Math.random()*3000)+5000;
    COINS+=coins; rewards.push({type:'coins',amount:coins});
    const newSkins=Object.keys(SKIN_DATA).filter(s=>!SKINS.includes(s));
    if(newSkins.length>0){
      const skin=newSkins[Math.floor(Math.random()*newSkins.length)];
      SKINS.push(skin); rewards.push({type:'skin',skin:skin});
    }
  }
  saveInv();
  updateInvBadge();
  return rewards;
}

function showChestReward(chestType,rewards){
  try{
    const ov=document.createElement('div');
    ov.className='overlay';
    const icon=chestType==='gold'?'🥇':chestType==='silver'?'🥈':'🥉';
    let html='<div class="plate-card" style="max-width:min(88vw,400px);text-align:center">'+
      '<div class="plate-ico">'+icon+'</div>'+
      '<h3 style="font-family:Unbounded,sans-serif;font-weight:700;font-size:clamp(15px,3.6vw,20px);color:#ffd66b;margin-bottom:16px;text-shadow:0 2px 0 #7a4c00,0 4px 10px rgba(0,0,0,.4);">Сундук открыт!</h3>'+
      '<div id="chestRewards" style="margin-bottom:20px"></div>'+
      '<button id="btnChestClose" class="btn" style="width:100%;font-size:15px;padding:14px 20px;">Забрать</button></div>';
    ov.innerHTML=html;
    document.body.appendChild(ov);
    setTimeout(()=>{ov.classList.add('on');},10);
    const rDiv=ov.querySelector('#chestRewards');
    rewards.forEach(r=>{
      if(r.type==='coins') rDiv.innerHTML+='<div style="font-size:16px;color:#ffd66b;font-weight:700;margin-bottom:8px;">💰 +'+r.amount.toLocaleString('ru-RU')+' монет</div>';
      else if(r.type==='skin') rDiv.innerHTML+='<div style="font-size:16px;color:#b06bff;font-weight:700;margin-bottom:8px;">✨ Новый скин: '+SKIN_DATA[r.skin].name+'!</div>';
    });
    ov.querySelector('#btnChestClose').addEventListener('click',()=>{ov.classList.remove('on');setTimeout(()=>ov.remove(),300);});
  }catch(e){console.error('Chest error',e);alert('Ошибка сундука: '+e.message);}
}

function showInventory(){
  try{
    const ov=document.createElement('div');
    ov.className='overlay';
    let cHtml=CHESTS.filter(c=>!c.opened).map(c=>{
      const icon=c.type==='gold'?'🥇':c.type==='silver'?'':'🥉';
      return '<div class="chest-item" data-id="'+c.id+'" style="background:rgba(8,22,34,.6);border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;text-align:center;font-size:14px;color:#bfe6ff;font-weight:700;">'+icon+' '+c.type+' сундук</div>';
    }).join('');
    if(!cHtml)cHtml='<div style="text-align:center;color:#7fa5bd;padding:20px;">Нет закрытых сундуков</div>';
    
    let sHtml=SKINS.map(s=>{
      const skin=SKIN_DATA[s], isActive=ACTIVE_SKIN===s;
      return '<div class="skin-item" data-skin="'+s+'" style="background:'+(isActive?'rgba(255,214,107,.15)':'rgba(8,22,34,.6)')+';border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;text-align:center;font-size:14px;color:'+(isActive?'#ffd66b':'#bfe6ff')+';font-weight:700;border:'+(isActive?'2px solid #ffd66b':'1px solid rgba(140,220,255,.1)')+'">'+skin.name+(isActive?' ✓':'')+'</div>';
    }).join('');

    ov.innerHTML='<div class="plate-card" style="max-width:min(88vw,420px);max-height:80vh;overflow-y:auto">'+
      '<h3 style="font-family:Unbounded,sans-serif;font-weight:700;font-size:clamp(18px,4vw,24px);color:#ffd66b;margin-bottom:16px;text-shadow:0 2px 0 #7a4c00,0 4px 10px rgba(0,0,0,.4);">💰 Монеты: '+COINS.toLocaleString('ru-RU')+'</h3>'+
      '<h4 style="font-family:Unbounded,sans-serif;font-weight:700;font-size:16px;color:#bfe6ff;margin-bottom:12px;">📦 Сундуки</h4><div id="chestsList">'+cHtml+'</div>'+
      '<h4 style="font-family:Unbounded,sans-serif;font-weight:700;font-size:16px;color:#bfe6ff;margin:20px 0 12px 0;">🎨 Скины</h4><div id="skinsList">'+sHtml+'</div>'+
      '<button id="btnInvClose" class="btn ghost" style="width:100%;font-size:15px;padding:14px 20px;margin-top:16px;">Закрыть</button></div>';
    document.body.appendChild(ov);
    setTimeout(()=>{ov.classList.add('on');},10);
    
    ov.querySelectorAll('.chest-item').forEach(el=>{
      el.addEventListener('click',()=>{
        const rewards=openChest(parseInt(el.dataset.id));
        if(rewards){ov.remove();showChestReward(CHESTS.find(c=>c.id===parseInt(el.dataset.id)).type,rewards);}
      });
    });
    ov.querySelectorAll('.skin-item').forEach(el=>{
      el.addEventListener('click',()=>{applySkin(el.dataset.skin);ov.remove();showInventory();});
    });
    ov.querySelector('#btnInvClose').addEventListener('click',()=>{ov.classList.remove('on');setTimeout(()=>ov.remove(),300);});
    ov.addEventListener('click',e=>{if(e.target===ov){ov.classList.remove('on');setTimeout(()=>ov.remove(),300);}});
  }catch(e){console.error('Inv error',e);alert('Ошибка инвентаря: '+e.message);}
}

// 3. ИНИЦИАЛИЗАЦИЯ КНОПКИ
setTimeout(()=>{
  const btn=document.getElementById('btnInv');
  if(btn){
    btn.addEventListener('click',()=>{
      console.log('Кнопка инвентаря нажата');
      showInventory();
    });
    updateInvBadge();
  }
}, 1000);

applySkin(ACTIVE_SKIN);

// 4. ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЯ УРОВНЯ
let lastLevel = 1;
let chestGivenForLevel = 0;

setInterval(() => {
  try {
    const currentLevel = typeof level !== 'undefined' ? level : 1;
    if (currentLevel > lastLevel && currentLevel > chestGivenForLevel) {
      // Уровень увеличился — выдаём сундук за предыдущий уровень
      const completedLevel = currentLevel - 1;
      chestGivenForLevel = currentLevel;
      
      const chestType = generateChest(completedLevel);
      if (chestType) {
        setTimeout(() => {
          const coins = chestType === 'bronze' ? Math.floor(Math.random() * 1500) + 2000 : 
                        chestType === 'silver' ? Math.floor(Math.random() * 2000) + 3000 : 
                        Math.floor(Math.random() * 3000) + 5000;
          COINS += coins; 
          saveInv(); 
          updateInvBadge();
          showChestReward(chestType, [{type: 'coins', amount: coins}]);
        }, 1500);
      }
    }
    lastLevel = currentLevel;
  } catch(e) {
    console.error('Level check error', e);
  }
}, 1000);

})();
