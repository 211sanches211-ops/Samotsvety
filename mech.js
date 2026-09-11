(function(){
  alert('mech.js работает! Версия: 0.7beta');
  
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,10,16,.85);backdrop-filter:blur(6px);';
  ov.innerHTML='<div style="background:linear-gradient(170deg,#13314a,#0b1e2e);border-radius:26px;padding:30px;max-width:min(94vw,430px);text-align:center;box-shadow:0 34px 90px rgba(0,0,0,.65);">'+
    '<h2 style="font-family:Unbounded,sans-serif;font-weight:900;font-size:clamp(20px,5vw,28px);color:#ffd66b;margin:0 0 20px 0;text-shadow:0 1px 0 #e0a800,0 2px 0 #c79400,0 3px 0 #a67c00,0 4px 0 #8a6d00;">🆕 Что нового</h2>'+
    '<ul style="list-style:none;margin:0 0 20px 0;padding:0;text-align:left;">'+
    '<li style="font-size:14px;color:#9cc2d8;font-weight:700;padding:10px 14px;border-radius:12px;background:rgba(8,22,34,.6);margin-bottom:8px;">◆ <b style="color:#ffd66b">🔥 Огонь</b>: туши совпадениями рядом, иначе взорвётся</li>'+
    '<li style="font-size:14px;color:#9cc2d8;font-weight:700;padding:10px 14px;border-radius:12px;background:rgba(8,22,34,.6);margin-bottom:8px;">◆ <b style="color:#ffd66b"> Цепи</b>: рви двумя совпадениями концов или молотом</li>'+
    '<li style="font-size:14px;color:#9cc2d8;font-weight:700;padding:10px 14px;border-radius:12px;background:rgba(8,22,34,.6);">◆ <b style="color:#ffd66b">🎵 Музыка</b> меню + звук высыпания камней</li>'+
    '</ul>'+
    '<button id="btnWn" style="font-family:Nunito,sans-serif;font-weight:900;font-size:19px;padding:16px 40px;border-radius:18px;border:none;color:#06202c;background:linear-gradient(#ffd66b,#ffb02e);box-shadow:0 4px 0 #9c6a00,0 12px 20px rgba(0,0,0,.35);cursor:pointer;">Понятно, играть!</button>'+
    '</div>';
  document.body.appendChild(ov);
  alert('Окошко создано!');
  document.getElementById('btnWn').addEventListener('click',function(){
    ov.style.opacity='0';
    ov.style.transition='opacity .4s';
    setTimeout(function(){ov.remove();},400);
  });
})();
