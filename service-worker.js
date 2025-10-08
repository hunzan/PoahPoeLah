// --- Poa̍h-poe--lah! Service Worker -----------------------------
// 改這行版本字串就能觸發所有用戶的更新 🚀（每次發版改一下）
const SW_VERSION = 'pp-v7';

// Cache 名稱
const CACHE_STATIC  = `static-${SW_VERSION}`;
const RUNTIME_IMG   = `img-${SW_VERSION}`;
const RUNTIME_MEDIA = `media-${SW_VERSION}`;

// 殼層核心：可離線顯示的最低需求（依你的專案路徑調整）
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
  // SFX（可留可移到 runtime；若安裝階段常失敗，建議移到 runtime）
  './assets/sounds/toss.ogg',
  './assets/sounds/ok.ogg',
  './assets/sounds/bad.ogg',
  './assets/sounds/meh.ogg',
  './assets/sounds/select.ogg',
  './assets/sounds/bg_01.ogg',
  './assets/sounds/bg_02.ogg',
  './assets/sounds/bg_03.ogg',
  './assets/sounds/bg_04.ogg',
];

// Helper：同來源？
const sameOrigin = (url) => self.location.origin === new URL(url, self.location.href).origin;

// ✅ 安全預快取：單檔失敗不會讓整個安裝失敗
async function safePrecacheAll(cacheName, urls) {
  const cache = await caches.open(cacheName);
  await Promise.all(urls.map(async (u) => {
    try {
      const req = new Request(u, { cache: 'no-cache' }); // 抓新版本
      const res = await fetch(req);
      if (res && res.ok) await cache.put(req, res.clone());
      else console.warn('[SW] precache skip (bad response):', u, res && res.status);
    } catch (err) {
      console.warn('[SW] precache failed:', u, err);
    }
  }));
}

// 安裝：預快取核心資產
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      // 啟用 Navigation Preload（網路 & Cache 互不阻礙），部分瀏覽器支援
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    } catch {}
    await safePrecacheAll(CACHE_STATIC, CORE_ASSETS);
  })());

  // 下載完就進入 waiting，待前端叫 SKIP_WAITING 或重新整理即可生效
  self.skipWaiting();
});

// 啟用：清舊版 cache、接管頁面
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((key) => {
        if (![CACHE_STATIC, RUNTIME_IMG, RUNTIME_MEDIA].includes(key)) {
          return caches.delete(key);
        }
      })
    );
    await self.clients.claim();
    console.log('[SW] activated', SW_VERSION);
  })());
});

// 取用策略：
// 1) 導覽/HTML：network-first（離線 fallback 到 cache；用 navigationPreload 加速）
// 2) JS/CSS：cache-first
// 3) 圖片(svg/webp/png/jpg)：stale-while-revalidate（runtime cache）
// 4) 聲音/影片(ogg/mp3/mp4/webm)：stale-while-revalidate（runtime cache）
// 5) 其他同來源 GET：cache-first（離線可用）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!sameOrigin(request.url)) return;

  const url = new URL(request.url);
  const isHTML = request.mode === 'navigate'
              || request.headers.get('accept')?.includes('text/html')
              || url.pathname.endsWith('.html');
  const isJS   = url.pathname.endsWith('.js');
  const isCSS  = url.pathname.endsWith('.css');
  const isImage = /\.(?:png|jpg|jpeg|webp|gif|svg)$/i.test(url.pathname);
  const isMedia = /\.(?:ogg|mp3|mp4|webm|wav|m4a)$/i.test(url.pathname);

  if (isHTML) {
    event.respondWith(networkFirstNav(event));
    return;
  }
  if (isJS || isCSS) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }
  if (isImage) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_IMG));
    return;
  }
  if (isMedia) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_MEDIA));
    return;
  }
  event.respondWith(cacheFirst(request, CACHE_STATIC));
});

// ---------------- 策略實作 ----------------

// 導覽最佳化：先吃 navigation preload，其次網路，最後快取與 index.html fallback
async function networkFirstNav(event) {
  const request = event.request;
  const cache = await caches.open(CACHE_STATIC);

  try {
    // 若有 navigation preload，先用（避免等 SW 啟動延遲）
    const preload = 'preloadResponse' in event ? await event.preloadResponse : null;
    if (preload) {
      cache.put(request, preload.clone()).catch(()=>{});
      return preload;
    }
  } catch {}

  try {
    const res = await fetch(request);
    cache.put(request, res.clone()).catch(()=>{});
    return res;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
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
