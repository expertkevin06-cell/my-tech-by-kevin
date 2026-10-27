const CACHE = "ma-tech-by-kevin-v11";
const ASSETS = ["./","./index.html","./offline.html","./manifest.json","css/style.css",
  "js/config.js","js/store.js","js/auth.js","js/data.js","js/recalls.js","js/tsb.js","js/veille.js","js/updater.js","js/selftest.js","js/app.js",
  "assets/img/bg-car.svg","assets/icons/icon.svg","assets/icons/favicon-32.png","assets/icons/apple-touch-180.png",
  "assets/icons/icon-192.png","assets/icons/icon-512.png","assets/icons/icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil((async()=>{ const c=await caches.open(CACHE);
  await Promise.allSettled(ASSETS.map(async u=>{ try{ const r=await fetch(u,{cache:"no-cache"}); if(r&&r.ok) await c.put(u,r); }catch(_){} }));
  await self.skipWaiting(); })()); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method!=="GET") return;
  const u=new URL(e.request.url);
  if (u.pathname.endsWith("update.json") || u.pathname.endsWith("veille.json") || u.pathname.includes("/data/")){
    e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match(e.request).then(h=>h||Response.error()))); return; }
  e.respondWith((async()=>{ try{ const res=await fetch(e.request); if(res.ok&&u.origin===location.origin){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); } return res; }
    catch(_){ const hit=await caches.match(e.request,{ignoreSearch:true}); if(hit) return hit;
      if(e.request.mode==="navigate"){ const off=await caches.match("./offline.html"); if(off) return off; } return Response.error(); } })());
});
