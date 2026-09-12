console.log('mech.js loaded');

var store={
  get:function(k,d){
    try{
      var v=localStorage.getItem(k);
      return v===null?d:v;
    }catch(e){
      return d;
    }
  },
  set:function(k,v){
    try{
      localStorage.setItem(k,v);
    }catch(e){}
  }
};

var CHESTS=JSON.parse(store.get('sv-chests','[]'))||[];
var COINS=parseInt(store.get('sv-coins','0'))||0;

function saveInv(){
  store.set('sv-chests',JSON.stringify(CHESTS));
  store.set('sv-coins',String(COINS));
}

function showInv(){
  var ov=document.createElement('div');
  ov.className='overlay';
  ov.innerHTML='<div class="plate-card" style="text-align:center;padding:20px"><h3 style="color:#ffd66b">Coins: '+COINS+'</h3><p style="color:#bfe6ff">Chests: '+CHESTS.length+'</p><button id="btnC" class="btn ghost" style="width:100%;margin-top:10px">Close</button></div>';
  document.body.appendChild(ov);
  setTimeout(function(){
    ov.classList.add('on');
  },10);
  document.getElementById('btnC').onclick=function(){
    ov.remove();
  };
}

function showChest(){
  var ov=document.createElement('div');
  ov.className='overlay';
  var coins=3000;
  COINS+=coins;
  CHESTS.push({type:'silver',opened:false,id:Date.now()});
  saveInv();
  ov.innerHTML='<div class="plate-card" style="text-align:center;padding:20px"><div class="plate-ico">🥈</div><h3 style="color:#ffd66b">Chest!</h3><p style="color:#ffd66b">+'+coins+' coins</p><button id="btnX" class="btn" style="width:100%">OK</button></div>';
  document.body.appendChild(ov);
  setTimeout(function(){
    ov.classList.add('on');
  },10);
  document.getElementById('btnX').onclick=function(){
    ov.remove();
  };
}

setTimeout(function(){
  var t=document.getElementById('btnTestChest');
  var i=document.getElementById('btnInvMenu');
  if(t){
    t.onclick=showChest;
  }
  if(i){
    i.onclick=showInv;
  }
  console.log('Buttons bound:',t,i);
},1000);
