// ============================================================================
//  跋桮啦！(Poa̍h-poe--lah)  Service Worker 最終版
//  功能：快取核心資產、支援離線、可自動更新
// ============================================================================
const CACHE_NAME = 'poahpoe-cache-v1';
const ASSETS = [
  // --- 主頁與核心 JS ---
  './',
  './index.html',
  './manifest.webmanifest',
  './js/cups/image.js',
  './js/cups/manifest.js',
  './js/cups/registry.js',

  // --- 背景圖 ---
  './assets/images/bg.webp',

  // --- 桮圖（12 款 × 陰陽各一）---
  './assets/images/cups/cup01_yin.webp',
  './assets/images/cups/cup01_yang.webp',
  './assets/images/cups/cup02_yin.webp',
  './assets/images/cups/cup02_yang.webp',
  './assets/images/cups/cup03_yin.webp',
  './assets/images/cups/cup03_yang.webp',
  './assets/images/cups/cup04_yin.webp',
  './assets/images/cups/cup04_yang.webp',
  './assets/images/cups/cup05_yin.webp',
  './assets/images/cups/cup05_yang.webp',
  './assets/images/cups/cup06_yin.webp',
  './assets/images/cups/cup06_yang.webp',
  './assets/images/cups/cup07_yin.webp',
  './assets/images/cups/cup07_yang.webp',
  './assets/images/cups/cup08_yin.webp',
  './assets/images/cups/cup08_yang.webp',
  './assets/images/cups/cup09_yin.webp',
  './assets/images/cups/cup09_yang.webp',
  './assets/images/cups/cup10_yin.webp',
  './assets/images/cups/cup10_yang.webp',
  './assets/images/cups/cup11_yin.webp',
  './assets/images/cups/cup11_yang.webp',
  './assets/images/cups/cup12_yin.webp',
  './assets/images/cups/cup12_yang.webp',

  // --- 音效（投擲、結果、選擇、背景等）---
  './assets/sounds/toss.ogg',
  './assets/sounds/ok.ogg',
  './assets/sounds/bad.ogg',
  './assets/sounds/meh.ogg',
  './assets/sounds/select.ogg',
  './assets/sounds/bg_01.ogg',
  './assets/sounds/bg_02.ogg',
  './assets/sounds/bg_03.ogg',
  './assets/sounds/bg_04.ogg',

  // --- icon 供 PWA 使用 ---
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// === 安裝階段：快取所有核心資產 ===
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// === 啟用階段：清理舊版快取 ===
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// === 取得階段：HTML 採 network-first，其餘採 cache-first ===
self.addEventListener('fetch', event => {
  const req = event.request;

  // HTML：先抓網路，失敗才用快取
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('./index.html');
        return cached || Response.error();
      }
    })());
    return;
  }

  // 其他靜態資產：cache-first
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh.ok) cache.put(req, fresh.clone());
      return fresh;
    } catch {
      return cached || Response.error();
    }
  })());
});