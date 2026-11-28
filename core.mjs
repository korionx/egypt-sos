// Pure functions shared by the page and its dependency-free regression tests.
export const FRESH_MS = 6 * 60 * 60 * 1000;
export function normalize(value) {
  return String(value).toLowerCase().normalize('NFKC').replace(/[\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776)).trim();
}
export function isFresh(iso, now = Date.now()) {
  const age = now - Date.parse(iso);
  return Number.isFinite(age) && age >= 0 && age <= FRESH_MS;
}
export function safeUrl(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
}
export function validIncident(d) {
  return !!d && d.schema === 1 && typeof d.active === 'boolean' &&
    (!d.active || (typeof d.title === 'string' && d.title.length <= 300 &&
    Number.isFinite(Date.parse(d.updated_at)) && Array.isArray(d.items) && d.items.length <= 20 &&
    d.items.every(i => i && typeof i.text === 'string' && i.text.length <= 2000 && safeUrl(i.source_url))));
}
export function validPosition(p, now = Date.now()) {
  const c = p?.coords;
  return !!c && Number.isFinite(c.latitude) && Math.abs(c.latitude) <= 90 &&
    Number.isFinite(c.longitude) && Math.abs(c.longitude) <= 180 &&
    Number.isFinite(c.accuracy) && c.accuracy >= 0 &&
    Number.isFinite(p.timestamp) && now - p.timestamp >= 0 && now - p.timestamp < 30000;
}
export function message(kind, place = '', position = null) {
  let text = kind === 'safe' ? 'أنا بخير الحمد لله، ما تقلقوش.' : 'محتاج مساعدة دلوقتي. كلموني حالاً.';
  if (place.trim()) text += ' أنا في: ' + place.trim().slice(0, 300) + '.';
  if (validPosition(position)) {
    const c = position.coords;
    text += ' موقعي وقت كتابة الرسالة (دقة تقريبية ' + Math.ceil(c.accuracy) + ' متر): https://maps.google.com/?q=' + c.latitude.toFixed(6) + ',' + c.longitude.toFixed(6);
  }
  return 'https://wa.me/?text=' + encodeURIComponent(text);
}
// Own deadline also covers a permission prompt left unanswered. Late callbacks are ignored.
export function locate(geolocation, ms = 4000) {
  let finish;
  const promise = new Promise(resolve => {
    let settled = false;
    let timer;
    finish = p => { if (!settled) { settled = true; clearTimeout(timer); resolve(validPosition(p) ? p : null); } };
    timer = setTimeout(() => finish(null), ms);
    try { geolocation.getCurrentPosition(finish, () => finish(null), {enableHighAccuracy: true, maximumAge: 0, timeout: ms}); }
    catch { finish(null); }
  });
  return {promise, cancel: () => finish(null)};
}
