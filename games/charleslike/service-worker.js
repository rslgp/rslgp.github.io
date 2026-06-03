// service-worker.js
// Minimal cache-first SW so SOLONE survives flaky networks AND becomes
// installable as a PWA on Android Chrome (which requires a registered SW).
// Versioned cache name — AUTO-BUMPED by scripts/bump_version.sh on every
// version change. DO NOT edit the version string manually — the next
// bump_version run will rewrite this line via sed. Editing the prefix
// `solone-v` is fine; just keep the X.Y.Z numeric tail intact so the
// regex match in bump_version.sh keeps working.

const CACHE = 'solone-v2.10.339';

// Core shell — cached at install. Game's actual binary is added on first fetch.
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for same-origin GETs; network passthrough for everything else
// (telemetry POSTs, leaderboard fetches go straight to the network).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
