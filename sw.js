const CACHE='samotsvety-v13';
const SHELL=['./','./index.html','./game.js','./game2.js','./manifest.webmanifest','./icon.svg','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);
  await Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})));self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())
  if(k!==CACHE)await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;
  if(req.mode==='navigate'){e.respondWith((async()=>{try{const res=await fetch(req);
    const c=await caches.open(CACHE);c.put('./index.html',res.clone());return res;}
    catch(err){return (await caches.match('./index.html'))||(await caches.match('./'));}})());return;}
  e.respondWith((async()=>{const hit=await caches.match(req);if(hit)return hit;
    try{const res=await fetch(req);if(res.ok||res.type==='opaque'){const c=await caches.open(CACHE);
      c.put(req,res.clone());}return res;}catch(err){return new Response('',{status:503});}})());});
