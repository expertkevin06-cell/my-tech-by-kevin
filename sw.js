const CACHE = "ma-tech-by-kevin-v8";
const ASSETS = [
  "./", "./index.html", "./offline.html", "./manifest.json",
  "css/style.css",
  "js/config.js", "js/store.js", "js/auth.js",
  "js/data.js", "js/recalls.js", "js/tsb.js", "js/updater.js", "js/app.js",
  "assets/img/bg-car.svg",
  "assets/icons/icon.svg",
  "assets/icons/favicon-32.png", "assets/icons/apple-touch-180.png",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/icon-maskable-512.png"
];
const ICONS = {
  "icon-192.png": [192, false], "icon-512.png": [512, false], "icon-maskable-512.png": [512, true],
  "favicon-32.png": [32, false], "apple-touch-180.png": [180, false]
};
function iconSpec(p){ for (const k of Object.keys(ICONS)) if (p.endsWith(k)) return ICONS[k]; return null; }
async function generateIconResponse(size, mask){
  if (typeof OffscreenCanvas === "undefined") return null;
  const c = new OffscreenCanvas(size, size), ctx = c.getContext("2d");
  ctx.fillStyle = "#0b0f1a"; ctx.fillRect(0,0,size,size);
  const k = mask ? 0.62 : 1;
  ctx.save(); ctx.translate(size/2,size/2); ctx.scale(k,k); ctx.translate(-size/2,-size/2);
  ctx.strokeStyle = "#2e8fff"; ctx.lineWidth = size*0.058;
  ctx.beginPath(); ctx.arc(size/2, size*0.46, size*0.29, 0, 7); ctx.stroke();
  ctx.strokeStyle = "#f39c12"; ctx.lineWidth = size*0.05; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(size*0.27,size*0.46); ctx.lineTo(size*0.38,size*0.46); ctx.lineTo(size*0.44,size*0.34);
  ctx.lineTo(size*0.51,size*0.58); ctx.lineTo(size*0.57,size*0.46); ctx.lineTo(size*0.68,size*0.46);
  ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "bold " + (size*0.14) + "px Arial"; ctx.textAlign = "center";
  ctx.fillText("MTK", size/2, size*0.88); ctx.restore();
  const blob = await c.convertToBlob({ type: "image/png" });
  return new Response(blob, { status:200, headers:{ "Content-Type":"image/png", "Cache-Control":"public, max-age=86400" } });
}
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(async u => {
      try { const r = await fetch(u, { cache:"no-cache" }); if (r && r.ok) await cache.put(u, r); } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.pathname.endsWith("update.json") || u.pathname.includes("/data/")){
    e.respondWith(fetch(e.request, { cache:"no-store" }).catch(() => caches.match(e.request).then(h => h || Response.error())));
    return;
  }
  e.respondWith((async () => {
    const spec = iconSpec(u.pathname);
    try{
      const res = await fetch(e.request);
      if (res.ok && u.origin === location.origin){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      if (!res.ok && spec){ const g = await generateIconResponse(spec[0], spec[1]); if (g){ caches.open(CACHE).then(c => c.put(e.request, g.clone())); return g; } }
      return res;
    }catch(_){
      const hit = await caches.match(e.request, { ignoreSearch:true });
      if (hit) return hit;
      if (spec){ const g = await generateIconResponse(spec[0], spec[1]); if (g){ caches.open(CACHE).then(c => c.put(e.request, g.clone())); return g; } }
      if (e.request.mode === "navigate"){ const off = await caches.match("./offline.html"); if (off) return off; }
      return Response.error();
    }
  })());
});
