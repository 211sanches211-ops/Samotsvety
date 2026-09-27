const CACHE='samotsvety-v19';
self.addEventListener('install',()=>{self.skipWaiting();});
self.addEventListener('activate',e=>{
e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
.then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
const url=new URL(e.request.url);
if(url.origin!==self.location.origin)return;
e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(m=>{
const upd=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r;}).catch(()=>m);
return m||upd;})));
});
