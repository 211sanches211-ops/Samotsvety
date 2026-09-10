/* Service Worker игры «Самоцветы» — офлайн-режим и обновления */
const CACHE = 'samotsvety-v16';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-512.png'
];

/* Установка: сразу кэшируем оболочку приложения */
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

/* Активация: удаляем все старые кэши, забираем управление */
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

/* Запросы: навигация — сеть с откатом в кэш; остальное — кэш с докэшированием */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Переходы по ссылкам (открытие игры): сначала сеть, офлайн — из кэша */
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const c = await caches.open(CACHE);
        c.put('./index.html', res.clone());
        return res;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  /* Всё остальное (скрипты, стили, шрифты, иконки): сначала кэш, потом сеть */
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: url.origin === location.origin });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') {
        const c = await caches.open(CACHE);
        c.put(req, res.clone());
      }
      return res;
    } catch (err) {
      return new Response('', { status: 503, statusText: 'Offline' });
    }
  })());
});

