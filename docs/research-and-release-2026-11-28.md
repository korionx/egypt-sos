# Egypt SOS: research and release, 28 November 2026

## Evidence and decisions

- [W3C cognitive accessibility: short critical paths](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p02-short-paths/): keep calls as native HTML links; move installation below useful content. Location is optional and off by default so WhatsApp opens immediately. No extra call confirmations.
- [WCAG enhanced target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): directory call/copy/source controls have at least 44px height. Four main call tiles remain substantially larger.
- [web.dev font guidance](https://web.dev/articles/font-best-practices): use system fonts, eliminating remote font CSS and font requests from the critical path. Static HTML contains all 24 numbers, not an empty JavaScript-populated list.
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition): maximumAge=0, validate timestamp and coordinate bounds. An independent four-second deadline covers an unanswered permission prompt; skip/cancel ignore late callbacks. Four seconds is an engineering tradeoff, not a clinically validated threshold.
- Incident freshness: six-hour warning threshold is an engineering policy (four-hour source check cadence plus grace), not proof that younger information is current. Independent blood timestamp, explicit historical wording, source dates and offline markers prevent renewed unrelated content from refreshing blood claims. No unsourced incident facts accepted. No background location collection.
- Every number was checked against its linked official publication/site on 28 November; no test calls were placed. See [generated sources](../sources.html) and [source data](../numbers.json). 105's displayed claim was narrowed to what the linked Ministry statement supports. EDA source replaces a secondary source for 15301; ministry page replaces the old telecom PDF for 155.
- New Warraq family contact: [MENA quoting Cabinet spokesperson Mohamed Adel, 26 November](https://mena.org.eg/ar/news/مجلس-الوزراء-منظومه-الشكاوي-الحكوميه-c0fd1e46-f7c5-44b1-a502-f66faf05bc65), 16528 for treatment locations and compensation procedures. Historical hospital and blood review timestamps are not presented as new statements.
- [Vercel Analytics privacy](https://vercel.com/docs/analytics/privacy-policy): aggregate visit information includes coarse geography and hashed session identifier; no emergency action or message tracking was added. Privacy wording now discloses that a wa.me URL transmits its content to WhatsApp on opening, before recipient submission.
- [Play Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469): declarations must cover controlled web content and third-party processing. User-initiated sharing exceptions do not mean no data collection. Review saved declarations against current behavior before resubmitting.
- Play's actual rejection on 27 November is missing government information source links in the listing. Prominent independent status and direct official source URLs are required. This is separate from the historical health-category issue.

## Scope and validation

No backend, accounts, tracking events, external font dependencies or new Android permissions. TWA uses the same live site. Public PR 1 contains Android assets missing from main; preserve it. PR 4 synchronizes the already-live page; preserve its ancestry.

Run `node scripts/build.mjs` after editing numbers, then `node --test tests/*.test.mjs`. Browser verification covers mobile layout, actual search filtering, generated WhatsApp link without personal coordinates, and source/privacy navigation. Do not dial emergency services or send messages as a test.

Deploy the identical app files to private `public/sos/`; `incident.json` remains served from this public repository. Use `SKIP_OG=1` for the archive build. Git author must use `korionx@yahoo.com`. Do not publish private handoff documents to this public repository.

## Operating boundaries

User authorized research-led implementation and publishing on 28 November 2026. Source verification remains mandatory. Do not silently refresh incident/blood dates or turn social-media requests into verified facts. Do not promise continuous monitoring unless a real scheduled job is confirmed. Google review and genuine closed-test participation remain external dependencies.
