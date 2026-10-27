const CACHE = "ma-tech-by-kevin-v5";
const ASSETS = [
  "./", "./index.html", "./offline.html", "./manifest.json",
  "css/style.css",
  "js/config.js", "js/store.js", "js/auth.js",
  "js/data.js", "js/recalls.js", "js/updater.js", "js/app.js",
  "assets/icons/icon.svg",
  "assets/icons/favicon-32.png", "assets/icons/apple-touch-180.png",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/icon-maskable-512.png"
];
/* Installation robuste : chaque fichier est mis en cache individuellement (aucun échec bloquant) */
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(async u => {
      try { const r = await fetch(u, { cache: "no-cache" }); if (r && r.ok) await cache.put(u, r); } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  /* Fichiers de mise à jour : toujours réseau, jamais de cache */
  if (u.pathname.endsWith("update.json") || u.pathname.includes("/data/")){
    e.respondWith(fetch(e.request, { cache: "no-store" })
      .catch(() => caches.match(e.request).then(h => h || Response.error())));
    return;
  }
  /* Le reste : réseau d'abord (4G/5G/Wi-Fi), cache en secours (hors ligne) */
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      if (res.ok && u.origin === location.origin)
        caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() =>
      caches.match(e.request, { ignoreSearch: true })
        .then(hit => hit || caches.match("./offline.html"))
    )
  );
});
