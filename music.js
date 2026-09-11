(function(){
  const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},
               set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  let on=store.get('sv-music','1')==='1';
  let ctx=null,timer=null,step=0,wasMenu=true;
  const seq=[0,4,7,9,7,4,0,4,7,12,9,7,4,7,9,12,9,7,0,7,4,0];
  function ac(){if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
    if(ctx&&ctx.state==='suspended')ctx.resume();return ctx;}
  function bell(f,d,v){const c=ac();if(!c||!on)return;const t=c.currentTime;
    const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);
    g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+.02);
    const o2=c.createOscillator(),g2=c.createGain();o2.type='sine';o2.frequency.setValueAtTime(f*2.01,t);
    g2.gain.setValueAtTime(0,t);g2.gain.linearRampToValueAtTime(v*.3,t+.01);
    g2.gain.exponentialRampToValueAtTime(.0001,t+d);
    o2.connect(g2).connect(c.destination);o2.start(t);o2.stop(t+d+.02);}
  function tick(){const semi=seq[step%seq.length];const f=261.63*Math.pow(2,semi/12);
    bell(f,1.2,.045);if(step%4===0)bell(f/2,1.8,.035);step++;}
  function startLoop(){if(timer||!on)return;timer=setInterval(tick,430);}
  function stopLoop(){if(timer){clearInterval(timer);timer=null;}}
  function inMenu(){const s=document.querySelector('#startOv');return s&&!s.classList.contains('hidden');}
  function whoosh(){const c=ac();if(!c||!on)return;const t=c.currentTime;
    const n=Math.floor(c.sampleRate*.5),b=c.createBuffer(1,n,c.sampleRate),ch=b.getChannelData(0);
    for(let j=0;j<n;j++)ch[j]=(Math.random()*2-1)*(1-j/n);
    const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
    src.buffer=b;f.type='bandpass';f.frequency.setValueAtTime(600,t);
    f.frequency.exponentialRampToValueAtTime(2600,t+.4);g.gain.value=.06;
    src.connect(f).connect(g).connect(c.destination);src.start(t);}
  function pour(){whoosh();
    for(let i=0;i<16;i++){setTimeout(()=>{if(!on)return;
      const c=ac();if(!c)return;const t=c.currentTime;
      const n=Math.floor(c.sampleRate*.04),b=c.createBuffer(1,n,c.sampleRate),ch=b.getChannelData(0);
      for(let j=0;j<n;j++)ch[j]=(Math.random()*2-1)*(1-j/n);
      const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
      src.buffer=b;f.type='highpass';f.frequency.value=2500+i*120;g.gain.value=.05;
      src.connect(f).connect(g).connect(c.destination);src.start(t);
      bell(420+i*55,.14,.05);},i*55);}}
  setInterval(()=>{const m=inMenu();
    if(m&&!wasMenu){startLoop();}
    if(!m&&wasMenu){stopLoop();pour();}
    wasMenu=m;},300);
  document.addEventListener('pointerdown',function once(){ac();if(inMenu())startLoop();},{once:true});
  (function injectMusicRow(){
    const card=document.querySelector('#setOv .card');if(!card)return;
    const row=document.createElement('div');row.className='setrow';
    row.innerHTML='<span>Музыка</span><button class="btn ghost icon" id="btnMusicSet">🎵</button>';
    const rows=card.querySelectorAll('.setrow');
    if(rows[1])rows[1].insertAdjacentElement('afterend',row);else card.appendChild(row);
    const btn=row.querySelector('#btnMusicSet');
    function paint(){btn.textContent=on?'🎵':'';}
    paint();
    btn.addEventListener('click',()=>{on=!on;store.set('sv-music',on?'1':'0');paint();
      if(!on)stopLoop();else{ac();if(inMenu())startLoop();}});
  })();
})();
