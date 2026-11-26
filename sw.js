// Offline support for طوارئ مصر السريع.
// Pages: network first (so the live incident card is fresh), cached copy when offline.
// Static files and Google Fonts: cache first, refreshed in the background.
const VERSION = "sos-v3";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./privacy.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(url.origin + url.pathname, copy)); // each page under its own address, query ignored
        return res;
      }).catch(() => caches.match(url.origin + url.pathname).then(r => r || caches.match("./")).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  const sameScope = url.origin === location.origin && url.pathname.startsWith(new URL("./", location).pathname);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameScope && !isFont) return;

  e.respondWith(
    caches.open(VERSION).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }))
  );
});
