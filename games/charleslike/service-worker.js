// service-worker.js
// HYBRID strategy (id 545): OFFLINE-FIRST for the engine bundle, NETWORK-FIRST
// for the HTML shell. Goal: after a single online load, the app boots and
// plays without any network at all; whenever the user IS online, version
// updates land automatically on the next page load.
//
// Strategy split:
//   - NAVIGATION (index.html / "/"): NETWORK-FIRST. Online → always the
//     freshest HTML, which drives version updates via the bumped CACHE name +
//     the page-side controllerchange-reload listener. Offline → falls back to
//     the cached HTML shell so the app still launches.
//   - ENGINE + ASSETS (.wasm, .js, .arc{,d,i}, .dmanifest, .json, .png,
//     manifest.webmanifest, etc.): STALE-WHILE-REVALIDATE. Cached copy served
//     IMMEDIATELY (instant offline + zero-latency online), with a background
//     refetch that refreshes the cache for the NEXT page load. Asset URLs are
//     stable per Defold build, so SWR converges to fresh within one extra
//     online load.
//
// Pre-cache (install): the full engine + archive pieces are added to the
// versioned cache up-front, so a user who installs the SW + closes the tab
// mid-load STILL has everything cached for the next offline boot. A new SW
// only installs while the user is online (the browser cannot discover a new
// /service-worker.js source offline), so the pre-cache step is guaranteed to
// run against a reachable network → the new cache is fully populated BEFORE
// activate deletes the previous cache → no offline-broken window during
// version bumps.
//
// History:
//   - Pre-id-543 SW: CACHE-FIRST. Trapped returning users on stale bundles;
//     symptom on file: "a new deploy doesn't show up; only an incognito
//     window works." Wholly replaced.
//   - id 543 SW: NETWORK-FIRST for everything. Fixed the trap, but offline-
//     after-first-load was fragile because: (a) the engine assets were only
//     cached opportunistically on first fetch (a user who closed the tab
//     mid-load had no cache), and (b) every page load went network-first even
//     for assets, making boot slow online and offline-fragile if any single
//     asset's network fetch hung instead of erroring promptly.
//   - id 544 SW (preserved here): added client.navigate force-reload in
//     activate to rescue users on cached old HTML lacking the
//     controllerchange-reload listener (back-compat for pre-pwa-lite users).
//   - id 545 (this edit): pre-cache the full bundle at install + switch
//     asset strategy to stale-while-revalidate. The "play offline after one
//     load AND update version when one is available" property is now an
//     explicit lifecycle guarantee, not an emergent behavior.
//
// Two existing footguns stay closed:
//   1. The navigation fallback to './index.html' is scoped to navigation
//      requests only; an asset fetch failure never returns HTML (which would
//      brick the Defold engine loader if it expected a binary).
//   2. cache:'no-cache' on the navigation fetch forces a conditional GET so a
//      still-fresh HTTP-cache entry (GitHub Pages max-age=600) can't mask a
//      just-deployed index.html.
//
// Versioned cache name — AUTO-BUMPED by scripts/bump_version.{sh,bat} on every
// version change. DO NOT edit the version string manually — keep the literal
// `solone-v` prefix + the X.Y.Z numeric tail intact so the bump regex matches.

const CACHE = 'solone-v3.10.347';

// Core shell — pre-cached at install. Minimal app surface.
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './fav.ico',
  './cover.png',
];

// Engine bootstrap (Defold writes these with the game.project title — SOLONE).
// Pre-cached at install best-effort: a future Defold rename would silently
// 404 here and the runtime cache-on-fetch (the SWR put) backfills on first
// successful network request. install never rejects on a per-file 404.
const ENGINE_BOOTSTRAP = [
  './dmloader.js',
  './SOLONE_wasm.js',
  './SOLONE.wasm',
];

// Archive manifest. Defold lists its archive pieces here (game0.arcd, .arci,
// .dmanifest, .projectc). precacheArchives() reads this JSON at install and
// adds each named piece to the cache. These pieces are ~95% of the bundle by
// size and are the practical guarantor of an offline boot.
const ARCHIVE_MANIFEST = './archive/archive_files.json';

// Per-entry cache.add wrapped in a catch so one 404 cannot sink the whole
// install. Each Request uses `cache: 'reload'` to bypass the browser HTTP
// cache and pull fresh from the server at install time.
function precache(cache, urls) {
  return Promise.all(urls.map(function (url) {
    return cache.add(new Request(url, { cache: 'reload' })).catch(function () { return null; });
  }));
}

// Fetch archive_files.json, parse it, and pre-cache the listed pieces under
// ./archive/. Best-effort: missing JSON / malformed JSON / 404'd pieces all
// fall through silently, leaving the runtime SWR handler to backfill on first
// real fetch. Without this step, a user who installs the SW but never lets
// the page reach the engine's archive-load phase would have no cached
// archive pieces → an offline boot would fail at the engine load step even
// though the WASM is cached.
function precacheArchives(cache) {
  return fetch(ARCHIVE_MANIFEST, { cache: 'reload' })
    .then(function (res) { return res && res.ok ? res.json() : null; })
    .then(function (manifest) {
      if (!manifest) return null;
      // Defold's archive_files.json schema: { content: [ { name, size, pieces: [ { name, offset } ] }, ... ] }
      // The "pieces" are the on-disk files we need to cache.
      var pieceNames = [];
      var content = manifest.content;
      if (Array.isArray(content)) {
        for (var i = 0; i < content.length; i++) {
          var pieces = content[i] && content[i].pieces;
          if (Array.isArray(pieces)) {
            for (var j = 0; j < pieces.length; j++) {
              if (pieces[j] && pieces[j].name) pieceNames.push(pieces[j].name);
            }
          }
        }
      }
      var urls = [ARCHIVE_MANIFEST].concat(pieceNames.map(function (n) { return './archive/' + n; }));
      return precache(cache, urls);
    })
    .catch(function () { return null; });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return precache(cache, CORE.concat(ENGINE_BOOTSTRAP))
        .then(function () { return precacheArchives(cache); })
        .catch(function () { return null; });
    })
  );
  // Take over immediately instead of waiting for every old tab to close, so a
  // freshly deployed SW starts controlling pages now (pairs with clients.claim
  // below + the page-side auto-reload-on-update in html5_template.html).
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
      // id 546 PWA BACK-COMPAT — multi-mechanism force-reload rescue.
      //
      // Trapped-user class: a user who installed the OLD cache-first SW (any
      // bundle in the 2.10.338..2.10.342 window) is currently rendering OLD
      // HTML from the old cache. We now control them via clients.claim(), but
      // the page's JS doesn't know to reload. We fire MULTIPLE rescue signals
      // in parallel — at least one must work to rescue the page:
      //
      //   1. client.navigate(client.url) — id 544 original mechanism. Spec-
      //      compliant force-navigation. Works on modern Chrome/Edge/Android
      //      Chrome. Has historically been buggy or silently no-op on iOS
      //      Safari standalone webclips.
      //   2. client.postMessage({type:'SW_VERSION_BUMP', ...}) — for clients
      //      whose page-side JS listens on navigator.serviceWorker.onmessage
      //      (added to html5_template.html at id 546). Old HTML lacks the
      //      listener, but pages from id 546+ HTML reload immediately on
      //      receipt regardless of controllerchange firing.
      //   3. BroadcastChannel('solone-sw') — for any client in the same
      //      origin scope (across all tabs). Same payload as the postMessage;
      //      listener in html5_template.html consumes either channel.
      //
      // Failure of any single mechanism does NOT block the others. The whole
      // activation completes even if every reload attempt fails silently —
      // the SW is still active and the user can recover by manually closing
      // and reopening the tab/PWA.
      .then(() => {
        // 2 + 3: BroadcastChannel post — fire once, any open tab listens.
        try {
          if (typeof BroadcastChannel === 'function') {
            var bc = new BroadcastChannel('solone-sw');
            bc.postMessage({ type: 'SW_VERSION_BUMP', cache: CACHE, ts: Date.now() });
            // Close the channel after a tick so the message flushes; otherwise
            // an unclosed channel can keep the SW alive longer than needed.
            setTimeout(function () { try { bc.close(); } catch (e) {} }, 0);
          }
        } catch (e) {}

        // 1 + 2: per-client navigate + postMessage.
        return self.clients.matchAll({ type: 'window' }).then((clients) =>
          Promise.all(clients.map((client) => {
            try {
              if (client.frameType && client.frameType !== 'top-level') return null;
              // postMessage first (cheap, non-disruptive — page can choose how
              // to react). Most modern handlers will issue location.reload(),
              // which makes the subsequent client.navigate a no-op race winner.
              try {
                client.postMessage({ type: 'SW_VERSION_BUMP', cache: CACHE, ts: Date.now() });
              } catch (e) {}
              // Then client.navigate as the spec-mandated authoritative reload.
              var navP = client.navigate(client.url);
              return navP && navP.catch ? navP.catch(() => null) : null;
            } catch (e) { return null; }
          }))
        ).catch(() => null);
      })
  );
});

// id 546 PWA BACK-COMPAT — URL-flag manual escape hatches.
//
// Two query-string commands the SW responds to on navigation. These exist
// because the automated rescue mechanisms (client.navigate / postMessage /
// BroadcastChannel) can ALL fail silently in some browser × install-state
// combinations; the user (or support docs) needs a deterministic last-resort.
//
//   ?sw_reset=1   — NUCLEAR. Delete every Cache, unregister THIS service
//                   worker, then return an HTML page that immediately
//                   navigates to the clean URL (?sw_reset stripped). Next
//                   load has no SW intercepting → direct network fetch →
//                   fresh HTML → new SW re-registers from the new template.
//                   Use this when the user is stuck on an old bundle that
//                   no other mechanism can budge.
//
//   ?sw_refresh=1 — SOFT. Delete caches for this SW (keeping it registered)
//                   then return an HTML page that navigates to the clean
//                   URL. Next load goes through THIS (new) SW with an empty
//                   cache → network-first navigation + asset SWR populates
//                   from scratch → user is on the freshest bundle. Use this
//                   when the SW is already current but the cached payload
//                   is suspected stale.
//
// Both responses bypass any cache lookup; both rebuild state from network
// on the next navigation.

function rescueResponse(targetUrl, kind) {
  // Minimal HTML the user sees for ~300ms while the redirect fires. Matches
  // the bundle's dark theme so it doesn't read as a "page error".
  var label = kind === 'reset' ? 'Resetting SOLONE...' : 'Refreshing SOLONE...';
  var body = '<!doctype html><html><head>'
    + '<meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="theme-color" content="#0d0d0d">'
    + '<title>' + label + '</title>'
    + '<style>html,body{margin:0;height:100%;background:#0d0d0d;color:#d1dbeb;font-family:sans-serif;display:flex;align-items:center;justify-content:center}p{opacity:.7}</style>'
    + '</head><body><p>' + label + '</p>'
    + '<script>setTimeout(function(){location.replace(' + JSON.stringify(targetUrl) + ');},300);</script>'
    + '</body></html>';
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function stripFlag(url, flag) {
  url.searchParams.delete(flag);
  return url.toString();
}

// FETCH handler — strategy depends on whether the request is a top-level
// navigation (network-first for version updates) or an asset (stale-while-
// revalidate for offline + auto-update on next load).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // POSTs (telemetry/leaderboard) pass through
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // cross-origin -> browser default

  // Top-level navigations ONLY. `req.mode === 'navigate'` is authoritative;
  // `destination === 'document'` is the safe back-compat widener. We deliberately
  // do NOT sniff the Accept header — an asset whose Accept merely contains
  // text/html would be misclassified as a navigation and take the index.html
  // offline fallback below, re-opening the exact engine-bricking footgun the
  // file header warns about.
  const isNavigation = req.mode === 'navigate' || req.destination === 'document';

  // id 546: URL-flag escape hatches. Only honored on navigation requests so
  // a stray asset URL bearing the flag doesn't accidentally tear down the SW.
  if (isNavigation && url.searchParams.has('sw_reset')) {
    const target = stripFlag(url, 'sw_reset');
    event.respondWith(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister().catch(() => null))
        .then(() => rescueResponse(target, 'reset'))
        .catch(() => rescueResponse(target, 'reset'))
    );
    return;
  }
  if (isNavigation && url.searchParams.has('sw_refresh')) {
    const target = stripFlag(url, 'sw_refresh');
    event.respondWith(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => rescueResponse(target, 'refresh'))
        .catch(() => rescueResponse(target, 'refresh'))
    );
    return;
  }

  if (isNavigation) {
    // NETWORK-FIRST. cache:'no-cache' forces a conditional GET so a still-fresh
    // browser HTTP-cache entry can't mask a just-deployed index.html. On
    // success the response is cached for offline fallback. On failure (offline
    // or server error) the previously cached shell is served so the app still
    // launches without network.
    event.respondWith(
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          // ignoreSearch so a cache-busted nav URL still matches the canonical
          // cached entry (e.g. /index.html?ref=foo → /index.html).
          caches.match(req, { ignoreSearch: true })
            .then((hit) => hit || caches.match('./index.html'))
        )
    );
    return;
  }

  // ASSETS: STALE-WHILE-REVALIDATE.
  //
  //   1. Look up the cached copy.
  //   2. Fire a background fetch in parallel.
  //   3. Return the cached copy immediately if present (instant + offline-
  //      capable). The background fetch's resolved response is written back
  //      to the cache on success — so the NEXT page load picks up the new
  //      version automatically, no manual cache wipe required.
  //   4. If there is NO cached copy, await the background fetch and serve
  //      its result (also caches it). If the fetch itself rejects, return a
  //      Response.error() so the engine surfaces a clean load failure rather
  //      than a hung promise.
  //
  // Important: the background fetch is fire-and-forget — we don't await it
  // when a cached copy is available, so the SWR response is genuinely instant
  // even on slow networks.
  // ignoreSearch on the lookup: dmloader.js or downstream code that appends a
  // cache-buster query string (?_=ts) still matches the canonical pre-cached
  // entry instead of triggering a needless network round-trip. The PUT below
  // stores under the request's full URL — slight duplication risk on the
  // first such request, but the cache gets wiped on the next version bump
  // (versioned CACHE name) so unbounded growth is impossible.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const networkFetch = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => null);
      return cached || networkFetch.then((res) => res || Response.error());
    })
  );
});
