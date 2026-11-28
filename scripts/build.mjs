import {readFileSync, writeFileSync} from 'node:fs';
const root = new URL('../', import.meta.url);
const numbers = JSON.parse(readFileSync(new URL('numbers.json', root), 'utf8'));
const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let group = '', rows = '<div class="list" id="list">';
for (const x of numbers) {
  if (!/^\d{3,15}$/.test(x.d) || !x.s.startsWith('https://')) throw Error('Invalid number/source');
  if (group !== x.g) { group = x.g; rows += `<div class="group">${esc(group)}</div>`; }
  rows += `<div class="row" data-search="${esc(x.n+' '+x.d+' '+x.k)}"><div class="name"><span>${esc(x.n)}</span><small><a href="${esc(x.s)}" target="_blank" rel="noopener noreferrer">المصدر</a>${x.w ? ` · <a href="https://wa.me/2${esc(x.w)}" target="_blank" rel="noopener noreferrer">واتساب ${esc(x.w)}</a>` : ''}</small></div><a class="n" href="tel:${x.d}" aria-label="اتصل: ${esc(x.n)} ${x.d}">${x.d}</a><button hidden type="button" data-d="${x.d}" aria-label="انسخ رقم ${esc(x.n)}">نسخ</button></div>`;
}
rows += '</div>';
const index = new URL('index.html', root);
writeFileSync(index, readFileSync(index, 'utf8').replace(/<!-- DIRECTORY_START -->[\s\S]*?<!-- DIRECTORY_END -->/, `<!-- DIRECTORY_START -->\n${rows}\n<!-- DIRECTORY_END -->`));
writeFileSync(new URL('sources.html', root), `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>مصادر الأرقام · طوارئ مصر</title><style>body{font:18px/1.7 system-ui,Tahoma,sans-serif;max-width:720px;margin:auto;padding:20px;color:#1c1515;background:#f6f3f2}a{display:inline-block;padding:10px 0;color:#9e1116;overflow-wrap:anywhere}li{margin-bottom:16px}</style><main><a href="./">رجوع للأرقام</a><h1>مصادر أرقام طوارئ مصر</h1><p><strong>مبادرة شخصية مستقلة من إسلام أسامة. لا نمثّل أي جهة حكومية.</strong></p><p>راجعنا المنشورات الرسمية يوم 28 نوفمبر 2026. لم نجرِ مكالمات اختبار لأرقام الطوارئ. وجود رقم في مصدر رسمي لا يضمن توافره في كل الأوقات.</p><ul>${numbers.map(x=>`<li><strong>${esc(x.n)} — <bdi>${x.d}</bdi></strong><br><a href="${esc(x.s)}" rel="noopener noreferrer" target="_blank">${esc(x.s)}</a></li>`).join('\n')}</ul><p>مصادر الحوادث وتاريخ كل تصريح موجودة بجانب معلومات الحادث.</p><a href="privacy.html">سياسة الخصوصية</a></main></html>`);
console.log(`Generated ${numbers.length} static directory entries and sources page.`);
