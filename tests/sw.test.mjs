import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const script=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
function setup(fetcher, initial={}) {
 const handlers={}, deleted=[], entries=new Map(Object.entries(initial));
 const cache={match:async k=>entries.get(typeof k==='string'?k:k.url)?.clone(),put:async(k,r)=>entries.set(k,r.clone()),addAll:async()=>{}};
 const ctx={URL,Response,Headers,fetch:fetcher,clearTimeout,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,20)),self:{location:'https://example.org/sos/sw.js',addEventListener:(n,f)=>handlers[n]=f,clients:{claim:async()=>{}},skipWaiting:async()=>{}},caches:{open:async()=>cache,keys:async()=>['archive-v1','sos-v6','sos-v7'],delete:async k=>deleted.push(k)}};
 vm.runInNewContext(script,ctx);
 return {handlers,deleted,entries,request:async(url,mode='navigate')=>{let result;const pending=[];handlers.fetch({request:{url,method:'GET',mode},respondWith:p=>result=p,waitUntil:p=>pending.push(p)});return {response:await result,pending};}};
}
test('activation preserves unrelated archive caches',async()=>{
 const s=setup();let pending;s.handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(s.deleted,['sos-v6']);
});
test('slow navigation returns normalized cached app without waiting for network',async()=>{
 const s=setup(()=>new Promise(()=>{}),{'https://example.org/sos/':new Response('offline page')});
 const {response}=await s.request('https://example.org/sos/?source=app');assert.equal(await response.text(),'offline page');
});
test('HTTP error uses cached page; unknown route does not return homepage',async()=>{
 const s=setup(async()=>new Response('error',{status:503}),{'https://example.org/sos/':new Response('cached'),'https://example.org/sos/index.html':new Response('home')});
 assert.equal(await(await s.request('https://example.org/sos/')).response.text(),'cached');
 assert.equal((await s.request('https://example.org/sos/missing.html')).response.type,'error');
});
test('invalid incident cannot replace valid cache; fallback is explicitly marked',async()=>{
 const url='https://raw.githubusercontent.com/korionx/egypt-sos/main/incident.json';
 const s=setup(async()=>new Response('{bad'),{[url]:new Response(JSON.stringify({schema:1,active:false}))});
 const {response,pending}=await s.request(url,'cors');await Promise.all(pending);
 assert.equal(response.headers.get('X-SOS-Cached'),'1');assert.equal((await response.json()).active,false);
 assert.equal((await s.entries.get(url).clone().json()).active,false);
});
