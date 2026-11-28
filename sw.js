// Only SOS-owned caches are removed. Navigations fall back within 1.5 seconds.
const VERSION = 'sos-v7';
const INCIDENT = 'https://raw.githubusercontent.com/korionx/egypt-sos/main/incident.json';
const SCOPE = new URL('./', self.location).href;
const CORE = ['./', './index.html', './app.mjs', './core.mjs', './install.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './privacy.html', './sources.html'];
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /^sos-v\d+$/.test(k) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
async function incidentValid(r) {
  try { const d = await r.clone().json(); return d?.schema === 1 && typeof d.active === 'boolean' && (!d.active || (typeof d.title === 'string' && Number.isFinite(Date.parse(d.updated_at)) && Array.isArray(d.items) && d.items.every(i => typeof i?.text === 'string' && /^https:\/\//.test(i.source_url)))); }
  catch { return false; }
}
async function cachedIncident(r) {
  const headers = new Headers(r.headers); headers.set('X-SOS-Cached', '1');
  return new Response(await r.arrayBuffer(), {status:r.status,headers});
}
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), incident = url.href === INCIDENT;
  if (!incident && !url.href.startsWith(SCOPE)) return;
  const key = incident ? INCIDENT : url.origin + url.pathname;
  if (incident || req.mode === 'navigate') {
    const network = (async () => {
      const r = await fetch(req); if (!r.ok || (incident && !await incidentValid(r))) throw Error('Bad response');
      const c = await caches.open(VERSION); await c.put(key, r.clone()); return r;
    })();
    e.waitUntil(network.catch(() => {}));
    e.respondWith((async () => {
      const cache = await caches.open(VERSION), hit = await cache.match(key);
      let timer;
      try { return await Promise.race([network, new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Slow network')), incident ? 3000 : 1500); })]); }
      catch {
        if (hit) return incident ? cachedIncident(hit) : hit;
        if (!incident && (url.pathname === new URL(SCOPE).pathname || url.pathname.endsWith('/index.html'))) {
          const home = await cache.match(new URL('./index.html', SCOPE).href); if (home) return home;
        }
        return Response.error();
      } finally { clearTimeout(timer); }
    })());
    return;
  }
  const network = fetch(req).then(async r => { if (r.ok) { const c = await caches.open(VERSION); await c.put(key, r.clone()); } return r; });
  e.waitUntil(network.catch(() => {}));
  e.respondWith(caches.open(VERSION).then(async c => (await c.match(key)) || network).catch(() => Response.error()));
});
