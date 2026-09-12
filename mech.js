(function(){
console.log('mech.js загружен');

const store={
  get:function(k,d){try{var v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}
};

let CHESTS=JSON.parse(store.get('sv-chests','[]'))||[];
let COINS=parseInt(store.get('sv-coins','0'))||0;

function saveInv(){
  store.set('sv-chests',JSON.stringify(CHESTS));
  store.set('sv-coins',String(COINS));
}

function showChestReward(){
  var chestType='silver';
  var coins=3000;
  COINS+=coins;
  CHESTS.push({type:'silver',opened:false,id:Date.now()});
  saveInv();
  
  var ov=document.createElement('div');
  ov.className='overlay';
  ov.innerHTML='<div class="plate-card" style="max-width:350px;text-align:center"><div class="plate-ico">🥈</div><h3 style="color:#ffd66b;margin-bottom:16px">Сундук открыт!</h3><div style="font-size:16px;color:#ffd66b;margin-bottom:20px">💰 +'+coins+' монет</div><button id="btnClose" class="btn" style="width:100%">Забрать</button></div>';
  document.body.appendChild(ov);
  setTimeout(function(){ov.classList.add('on');},10);
  document.getElementById('btnClose').onclick=function(){ov.classList.remove('on');setTimeout(function(){ov.remove();},300);};
}

function showInventory(){
  var ov=document.createElement('div');
  ov.className='overlay';
  ov.innerHTML='<div class="plate-card" style="max-width:350px"><h3 style="color:#ffd66b">💰 Монеты: '+COINS+'</h3><p style="color:#bfe6ff">Сундуков: '+CHESTS.length+'</p><button id="btnClose2" class="btn ghost" style="width:100%;margin-top:16px">Закрыть</button></div>';
  document.body.appendChild(ov);
  setTimeout(function(){ov.classList.add('on');},10);
  document.getElementById('btnClose2').onclick=function(){ov.classList.remove('on');setTimeout(function(){ov.remove();},300);};
}

setTimeout(function(){
  var testBtn=document.getElementById('btnTestChest');
  var invBtn=document.getElementById('btnInvMenu');
  
  console.log('Кнопка теста:',testBtn);
  console.log('Кнопка инвентаря:',invBtn);
  
  if(testBtn){
    testBtn.onclick=function(){
      console.log('Тест нажат!');
      showChestReward();
    };
  }
  
  if(invBtn){
    invBtn.onclick=function(){
      console.log('Инвентарь нажат!');
      showInventory();
    };
  }
},1000);

})();
