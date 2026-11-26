# طوارئ مصر السريع · Egypt SOS

صفحة واحدة بالعربي لأوقات الطوارئ في مصر. شغالة على أي موبايل من غير تنزيل تطبيق.

- أزرار اتصال كبيرة: الإسعاف 123، المطافي 180، النجدة 122، شرطة السياحة 126.
- «أنا بخير» و«محتاج مساعدة»: بتفتح واتساب برسالة جاهزة فيها موقعك على Google Maps.
- كارت «حدث جاري» بيتحمّل من `incident.json` (مستشفيات، هل محتاجين تبرع بالدم ولا لأ، طرق)، وكل سطر جنبه مصدره.
- «عايز تساعد؟»: نصايح ثابتة (ما تزحمش المستشفيات، ما تبعتش فلوس لأفراد، اتأكد من أي طلب دم).
- دليل أرقام فيه بحث.

Live: https://eslamosama.com/sos

## Why

Most emergency-number apps in Egypt are directories that nobody installs before they need them. This is a link you can share in a Facebook comment or WhatsApp group the minute something happens.

## Numbers

`123`, `180`, `122`, `126` are confirmed from the UK FCDO Egypt travel advice (Nov 2026). Numbers marked **قيد المراجعة** in the page are not yet confirmed from an official source. Corrections with a source link are very welcome: open an issue or a pull request.

## Live incident card (`incident.json`)

The page fetches `incident.json` from this repo's `main` branch (raw.githubusercontent.com, about 5 minutes of CDN caching). Offline, the service worker serves the last copy it saved; with none saved, the page shows the card built into the HTML.

Rules for every change to `incident.json`:

- Facts come only from official sources (Ministry of Health, the governorate, Egyptian Red Crescent, civil protection) or major outlets quoting them by name. Every fact has a `source_url`; plain safety advice may leave it empty.
- `help.blood_needed` is `true` only when an official body asks for donors, `false` when an official says there is no need, and `null` when nobody official has said anything. Never a guess.
- `where` lists blood banks or hospitals only if the official request names them.
- Set `"active": false` to hide the card when the incident is over.
- Every change is a pull request that a person approves before it goes live.

## Run it

Static files only. Serve the folder at `/sos/` on any static host (the service worker and manifest use `/sos/` paths). GPS needs HTTPS.

## Privacy

No cookies, no accounts, no server of our own. The live site counts anonymous visits with Vercel Web Analytics (cookieless). The incident card is fetched from GitHub, which sees your IP address. Your location goes only into the WhatsApp message you choose to send. See `privacy.html`.

## Android

The Play Store app wraps this page. See [`android/`](android/README.md).
Privacy policy: [`privacy.html`](privacy.html) (live at https://www.eslamosama.com/sos/privacy.html).

## License

MIT
