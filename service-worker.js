// --- Poa̍h-poe--lah! Service Worker -----------------------------
// 改這行版本字串就能觸發所有用戶的更新 🚀
const SW_VERSION = 'pp-v6';

// Cache 名稱
const CACHE_STATIC = `static-${SW_VERSION}`;
const RUNTIME_IMG  = `img-${SW_VERSION}`;
const RUNTIME_MEDIA = `media-${SW_VERSION}`;

// 殼層核心：可離線顯示的最低需求（請依你的專案路徑調整）
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  // Icons / PWA
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  // 背景
  './assets/images/bg.webp',
  // JS（杯清單與工具）
  './js/cups/registry.js',
  './js/cups/manifest.js',
  './js/cups/image.js',
  // SFX（若不想預載可移除，改由 runtime cache）
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

// Helper：同來源？
const sameOrigin = (url) => self.location.origin === new URL(url, self.location.href).origin;

// 安裝：預快取核心資產
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting(); // 立即進入 waiting 狀態
});

// 啟用：清舊版 cache、接管頁面
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (![CACHE_STATIC, RUNTIME_IMG, RUNTIME_MEDIA].includes(key)) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// 取用策略：
// 1) 導覽/HTML：network-first（離線 fallback 到 cache）
// 2) JS/CSS：cache-first
// 3) 圖片(svg/webp/png/jpg)：stale-while-revalidate（runtime cache）
// 4) 聲音/影片(ogg/mp3/mp4/webm)：stale-while-revalidate（runtime cache）
// 5) 其他同來源 GET：cache-first（離線可用）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 只處理同來源（GitHub Pages 子路徑 OK）
  if (!sameOrigin(request.url)) return;

  const isHTML = request.mode === 'navigate' ||
                 request.headers.get('accept')?.includes('text/html') ||
                 url.pathname.endsWith('.html');

  const isJS   = url.pathname.endsWith('.js');
  const isCSS  = url.pathname.endsWith('.css');

  const isImage = /\.(?:png|jpg|jpeg|webp|gif|svg)$/i.test(url.pathname);
  const isMedia = /\.(?:ogg|mp3|mp4|webm|wav|m4a)$/i.test(url.pathname);

  // HTML / 導覽：network-first
  if (isHTML) {
    event.respondWith(networkFirst(request));
    return;
  }

  // JS/CSS：cache-first
  if (isJS || isCSS) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // 圖片：SWR + runtime cache
  if (isImage) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_IMG));
    return;
  }

  // 聲音/影片：SWR + runtime cache
  if (isMedia) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_MEDIA));
    return;
  }

  // 其他同來源 GET：cache-first（避免離線炸裂）
  event.respondWith(cacheFirst(request, CACHE_STATIC));
});

// ---------------- 策略實作 ----------------

async function networkFirst(request) {
  const cache = await caches.open(CACHE_STATIC);
  try {
    const res = await fetch(request);
    // 成功就更新 cache
    cache.put(request, res.clone()).catch(()=>{});
    return res;
  } catch {
    // 離線：回快取
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
    // 最後手段：回 index（SPA 可路由）
    return cache.match('./index.html');
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: false });
  if (cached) return cached;
  const res = await fetch(request);
  cache.put(request, res.clone()).catch(()=>{});
  return res;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: false });
  const fetchPromise = fetch(request)
    .then((res) => {
      cache.put(request, res.clone()).catch(()=>{});
      return res;
    })
    .catch(() => null);
  return cached || fetchPromise || fetch(request).catch(() => cached);
}

// 讓前端可主動請 SW 立刻接管（可選）
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
