import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalize,isFresh,FRESH_MS,validIncident,validPosition,message,locate} from '../core.mjs';
test('Arabic variants and both numeral sets match', () => {
  assert.equal(normalize('إِسْعاف ١٢٣'),normalize('اسعاف ۱۲۳'));
  assert.equal(normalize('كَهْرَبَاء'), 'كهرباء');
});
test('stale, invalid and future timestamps cannot look fresh', () => {
  const now = Date.now();
  assert.equal(isFresh(new Date(now-1000).toISOString(), now), true);
  for (const t of [now-FRESH_MS-1,now+1000]) assert.equal(isFresh(new Date(t).toISOString(),now),false);
  assert.equal(isFresh('no-date',now),false);
});
test('incident input rejects unsourced claims and executable URLs', () => {
  const base = {schema:1,active:true,title:'test',updated_at:new Date().toISOString(),items:[{text:'statement',source_url:'https://example.org'}]};
  assert.equal(validIncident(base),true);
  for (const source_url of ['', 'javascript:alert(1)', 'https://user:pass@example.org']) assert.equal(validIncident({...base,items:[{text:'claim',source_url}]}),false);
  assert.equal(validIncident({schema:1,active:false}),true);
});
test('location rejects stale, impossible and invalid readings', () => {
  const now=Date.now(), p={timestamp:now,coords:{latitude:30,longitude:31,accuracy:40}};
  assert.equal(validPosition(p,now),true);
  assert.equal(validPosition({...p,timestamp:now-60000},now),false);
  assert.equal(validPosition({...p,coords:{...p.coords,latitude:91}},now),false);
  assert.equal(validPosition({...p,coords:{...p.coords,accuracy:NaN}},now),false);
  assert.match(decodeURIComponent(message('help','Test',p)),/maps.google.com/);
  assert.doesNotMatch(decodeURIComponent(message('help','Test',{...p,timestamp:now-60000})),/maps.google.com/);
});
test('permission prompt deadline and skip both settle, ignoring late callbacks', async () => {
  let callback;
  const g={getCurrentPosition(success){callback=success;}};
  assert.equal(await locate(g,10).promise,null);
  const r=locate(g,1000); r.cancel(); assert.equal(await r.promise,null);
  callback({timestamp:Date.now(),coords:{latitude:30,longitude:31,accuracy:20}});
  assert.equal(await r.promise,null);
});
test('denied permission and unsupported geolocation fall back', async () => {
  assert.equal(await locate({getCurrentPosition(_,fail){fail();}},20).promise,null);
  assert.equal(await locate(null,20).promise,null);
});
test('all numbers work in HTML without scripts or fonts', () => {
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const numbers=JSON.parse(readFileSync(new URL('../numbers.json',import.meta.url),'utf8'));
  assert.equal(numbers.length,24);
  for (const x of numbers) assert.ok(html.includes('href="tel:'+x.d+'"'),x.d);
  assert.doesNotMatch(html,/fonts.googleapis.com|مش محتاجين دلوقتي|href="#"/);
  assert.match(html,/id="btn-safe" href="https:\/\/wa.me/);
});
