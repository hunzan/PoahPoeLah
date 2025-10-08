// ============================================================================
//  跋桮啦！(Poa̍h-poe--lah)  Service Worker（杯圖採執行期快取）
// ============================================================================
const CACHE_NAME = 'poahpoe-cache-v3';

// --- 首次離線啟動所需的核心資產（不含杯圖；杯圖改為執行期快取）---
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './js/cups/image.js',
  './js/cups/manifest.js',
  './js/cups/registry.js',
  './assets/images/bg.webp',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  // 音效：若檔名都存在就保留，之後有新增也可加
  './assets/sounds/toss.ogg',
  './assets/sounds/ok.ogg',
  './assets/sounds/bad.ogg',
  './assets/sounds/meh.ogg',
  './assets/sounds/select.ogg',
  './assets/sounds/bg_01.ogg',
  './assets/sounds/bg_02.ogg',
  './assets/sounds/bg_03.ogg',
  './assets/sounds/bg_04.ogg'
];

// === 安裝：逐檔嘗試（有檔才加），避免 addAll 因單一 404 失敗 ===
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(ASSETS.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) await cache.put(url, res.clone());
        else console.warn('[SW] skip (non-200):', url, res.status);
      } catch (err) {
        console.warn('[SW] skip (fetch error):', url, err);
      }
    }));
    await self.skipWaiting();
  })());
});

// === 啟用：清除舊版快取 ===
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 小工具：判斷是否為「杯圖」或「音效」→ 執行期 cache-first
function isCupImage(url) {
  return url.origin === location.origin && url.pathname.startsWith('/assets/images/cups/');
}
function isSound(url) {
  return url.origin === location.origin && url.pathname.startsWith('/assets/sounds/');
}

// === 取得：HTML 採 network-first；杯圖/音效採 cache-first；其他一般 cache-first ===
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) HTML 導航：network-first（離線再回快取）
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', fresh.clone()); // 只更新 index.html
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('./index.html');
        return cached || Response.error();
      }
    })());
    return;
  }

  // 2) 杯圖/音效：runtime cache-first（支援 ?v=...）
  if (isCupImage(url) || isSound(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        if (fresh.ok) await cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })());
    return;
  }

  // 3) 其他靜態資產：一般 cache-first
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req, { cache: 'no-store' });
      if (fresh.ok && url.origin === location.origin) await cache.put(req, fresh.clone());
      return fresh;
    } catch {
      return cached || Response.error();
    }
  })());
});
