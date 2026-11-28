import {normalize, isFresh, validIncident, safeUrl, message, locate} from './core.mjs';
const $ = id => document.getElementById(id);
const rows = [...document.querySelectorAll('.row[data-search]')];
const query = $('q'); query.hidden = false;
query.addEventListener('input', () => {
  const terms = normalize(query.value).split(/\s+/);
  for (const row of rows) row.hidden = !terms.every(t => normalize(row.dataset.search).includes(t));
  for (const group of document.querySelectorAll('.group')) {
    let next = group.nextElementSibling, visible = false;
    while (next && !next.classList.contains('group')) { visible ||= !next.hidden; next = next.nextElementSibling; }
    group.hidden = !visible;
  }
  $('empty').hidden = rows.some(r => !r.hidden);
});
document.querySelectorAll('button[data-d]').forEach(b => {
  b.hidden = false;
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.d); b.textContent = 'اتنسخ'; }
    catch { b.textContent = b.dataset.d; }
    setTimeout(() => b.textContent = 'نسخ', 1800);
  });
});
const where = $('where');
const buttons = ['safe', 'help'].map(kind => ({kind, element: $('btn-'+kind)}));
function refreshLinks() { for (const {kind, element} of buttons) element.href = message(kind, where.value); }
where.addEventListener('input', refreshLinks); refreshLinks();
const canGps = !!navigator.geolocation && window.isSecureContext && window.top === window;
$('gps-option').hidden = !canGps;
let pending = null;
function resetGps() { $('gps-wait').hidden = true; for (const {element} of buttons) element.removeAttribute('aria-busy'); }
function cancelGps() { const old = pending; pending = null; old?.request.cancel(); resetGps(); }
$('cancel-gps').addEventListener('click', cancelGps);
$('skip-gps').addEventListener('click', () => pending?.request.cancel());
window.addEventListener('pagehide', cancelGps);
for (const {kind, element} of buttons) element.addEventListener('click', async e => {
  if (!canGps || !$('include-location').checked) { cancelGps(); refreshLinks(); return; }
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); cancelGps();
  const current = {request: locate(navigator.geolocation), kind, place: where.value};
  pending = current; $('gps-wait').hidden = false; element.setAttribute('aria-busy', 'true');
  const position = await current.request.promise;
  if (pending !== current) return;
  pending = null; resetGps();
  location.assign(message(current.kind, current.place, position));
});
const INCIDENT = 'https://raw.githubusercontent.com/korionx/egypt-sos/main/incident.json';
let last = null, fromCache = false, inFlight = false, wasStale = null;
const fmt = iso => new Intl.DateTimeFormat('ar-EG-u-nu-latn', {day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',timeZone:'Africa/Cairo'}).format(new Date(iso));
const link = (url, title) => { const a = document.createElement('a'); a.href = url; a.textContent = title; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };
function renderIncident() {
  if (!last || !last.active) { $('incident').hidden = true; return; }
  const stale = fromCache || !navigator.onLine || !isFresh(last.updated_at);
  $('incident').hidden = false; $('h-inc').textContent = last.title;
  $('inc-tag').textContent = stale ? 'معلومات سابقة — مش تحديث مباشر' : 'معلومات من مصادر منشورة';
  $('inc-time').textContent = 'آخر مراجعة: ' + fmt(last.updated_at) + ' بتوقيت القاهرة.' + (stale ? ' ممكن الوضع يكون اتغير. راجع المصدر قبل التحرك.' : ' راجع تاريخ كل تصريح.');
  if (stale && wasStale !== true) $('inc-details').open = false;
  wasStale = stale;
  const ul = $('inc-items'); ul.replaceChildren();
  for (const item of last.items) {
    const li = document.createElement('li'); li.textContent = item.text + ' '; li.append(link(item.source_url, 'المصدر'));
    if (/^\d{3,15}$/.test(item.phone || '')) { const a = document.createElement('a'); a.href = 'tel:'+item.phone; a.textContent = ' · اتصال '+item.phone; li.append(a); }
    ul.append(li);
  }
  const h = last.help;
  const validHelp = h && typeof h.statement === 'string' && safeUrl(h.source_url) && Number.isFinite(Date.parse(h.checked_at));
  $('inc-blood').hidden = !validHelp; $('bl-where').replaceChildren();
  if (validHelp) {
    const fresh = !fromCache && navigator.onLine && isFresh(h.checked_at);
    $('bl-head').textContent = fresh ? 'آخر تصريح منشور عن التبرع بالدم' : 'تصريح سابق عن الدم — لا يحدد الاحتياج الحالي';
    $('bl-statement').textContent = (fresh ? '' : 'التصريح وقتها: ') + h.statement;
    $('bl-src').replaceChildren(document.createTextNode((h.said_by || '')+' · مراجعة '+fmt(h.checked_at)+' · '), link(h.source_url, 'المصدر'));
    if (fresh && h.blood_needed === true && Array.isArray(h.where)) for (const w of h.where) {
      if (!w || typeof w.name !== 'string') continue;
      const li = document.createElement('li'); li.textContent = w.name + (typeof w.address === 'string' ? '، '+w.address : '');
      if (/^\d{3,15}$/.test(w.phone || '')) { const a = document.createElement('a'); a.href = 'tel:'+w.phone; a.textContent = ' '+w.phone; li.append(a); }
      $('bl-where').append(li);
    }
  }
}
async function loadIncident() {
  if (inFlight) return;
  inFlight = true;
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const r = await fetch(INCIDENT, {cache:'no-store',signal:controller.signal});
    if (!r.ok) throw Error('Unavailable');
    const d = await r.json(); if (!validIncident(d)) throw Error('Invalid incident');
    last = d; fromCache = r.headers.get('X-SOS-Cached') === '1';
  } catch { fromCache = true; }
  finally { clearTimeout(timer); inFlight = false; renderIncident(); }
}
loadIncident(); setInterval(renderIncident, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderIncident(); loadIncident(); } });
window.addEventListener('online', loadIncident); window.addEventListener('offline', renderIncident);
if ('serviceWorker' in navigator && window.isSecureContext) window.addEventListener('load', () => {
  navigator.serviceWorker.register('/sos/sw.js', {scope:'/sos/'}).catch(() => {});
});
