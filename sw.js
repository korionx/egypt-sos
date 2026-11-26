// Offline support for طوارئ مصر السريع.
// Pages: network first (so the live incident card is fresh), cached copy when offline.
// Live incident card (incident.json on GitHub): network first, last saved copy when offline.
// Static files and Google Fonts: cache first, refreshed in the background.
const VERSION = "sos-v5";
const INCIDENT = "https://raw.githubusercontent.com/korionx/egypt-sos/main/incident.json";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./privacy.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE).then(() => c.add(INCIDENT).catch(() => {}))).then(() => self.skipWaiting()));
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
    // One cache entry per page, query ignored: /sos/ and /sos/?source=app (the installed app) share a copy.
    const key = url.origin + url.pathname;
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(key, copy)); }
        return res;
      }).catch(() => caches.match(key).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  if (url.origin + url.pathname === INCIDENT) {
    e.respondWith(
      fetch(req.url, { cache: "no-store", mode: "cors" }).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(INCIDENT, copy)); }
        return res;
      }).catch(() => caches.match(INCIDENT).then(r => r || Response.error()))
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
