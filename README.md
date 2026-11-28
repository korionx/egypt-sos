# طوارئ مصر السريع · Egypt SOS

[افتح الصفحة / Live](https://www.eslamosama.com/sos/) · [Sources](https://www.eslamosama.com/sos/sources.html) · [Privacy](https://www.eslamosama.com/sos/privacy.html)

صفحة عربية خفيفة: أرقام اتصال كبيرة، رسائل واتساب للأهل، ودليل أرقام يعمل حتى بدون JavaScript. مبادرة شخصية مستقلة من إسلام أسامة؛ لا تمثّل الحكومة أو خدمات الطوارئ.

- Calls open the dialer immediately. All 24 directory numbers are present in HTML.
- Family buttons open a WhatsApp draft. Location is optional/off by default, with a four-second maximum wait, skip and cancel. Opening the link transmits its text to WhatsApp before sending to a recipient.
- Search normalizes Arabic spelling, diacritics and Arabic/Persian numerals.
- After the first successful load, numbers remain available offline. Calls still need telephone service; WhatsApp needs internet.
- Incident facts have sources and dates. Old/offline information is explicitly historical, with a separately dated blood statement. No live-status claim is embedded in HTML.

## Maintain and test

Edit `numbers.json`, then run:

```sh
node scripts/build.mjs
node --test tests/*.test.mjs
```

Serve these static files at `/sos/`; GPS/service workers require HTTPS (localhost works for development). No package install is required for the SOS app or its tests. The deployed copy is in the private site repository's `public/sos/`. Keep `index.html`, `app.mjs`, `core.mjs`, `install.js`, `sw.js`, `manifest.webmanifest`, `privacy.html`, `sources.html`, and `icons/` identical. Bump the service-worker version for releases.

## Incident updates

`incident.json` is fetched from this public repository's main branch. This is independently live: merging a data change affects the site without rebuilding it.

- Every fact requires an official source or a major outlet quoting a named official. No unsourced social-media claims.
- Keep publication dates in the text. `updated_at` records editorial review; it does not make an old statement new.
- `help.checked_at` must reflect an actual review of that blood statement. Do not refresh it when changing other items.
- `blood_needed` is true only for an official donor request, false only for an official statement of no need, and null when unknown. `where` may only contain locations named by the request.
- The six-hour UI freshness limit is an engineering safeguard, not a promise of monitoring or a guarantee of current conditions.
- Set `active:false` when a source-based editorial decision retires the incident. No incident appears if no valid data is available.
- Use reviewable PRs with evidence and preserve source history. User-authorized maintainer publishing does not waive evidence requirements.

## Android and research

The Android TWA wraps the live site: [Android files](android/README.md). Signing keys and passwords must never enter this repository.

[Research, decisions and verification](docs/research-and-release-2026-11-28.md). The site uses cookieless Vercel aggregate visit analytics; no call-tap or message-content analytics. See the bilingual privacy policy for provider processing and retention.

MIT license.
