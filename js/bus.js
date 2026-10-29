"use strict";
/* =====================================================================
   BUS DE NOTIFICATIONS + BASE LOCALE MASSIVE (IndexedDB).
   - publish() : écrit sur le topic ntfy (réseau 4G/5G/WiFi) ET en local.
   - poll()    : récupère les messages nouveaux, les persiste en IndexedDB.
   - L'historique local survit à l'expiration des messages ntfy.
   ===================================================================== */
const IDB = (() => {
  let dbp = null;
  function open(){
    return new Promise((res, rej) => {
      if (dbp) return res(dbp);
      if (!("indexedDB" in window)) return rej(new Error("IndexedDB non supporté"));
      const rq = indexedDB.open("matech-db", 1);
      rq.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("events")) db.createObjectStore("events", { keyPath:"id" });
        if (!db.objectStoreNames.contains("kv"))     db.createObjectStore("kv",     { keyPath:"k" });
      };
      rq.onsuccess = e => { dbp = e.target.result; res(dbp); };
      rq.onerror   = e => rej(e.target.error);
    });
  }
  function tx(store, mode, fn){
    return open().then(db => new Promise((res, rej) => {
      const t = db.transaction(store, mode);
      const out = fn(t.objectStore(store));
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
      t.onerror = e => rej(e.target.error);
    }));
  }
  return {
    open,
    put: (store, val) => tx(store, "readwrite", os => os.put(val)),
    get: (store, key) => tx(store, "readonly", os => os.get(key)),
    all: (store)     => tx(store, "readonly", os => os.getAll()),
    del: (store, key)=> tx(store, "readwrite", os => os.delete(key)),
    count:(store)    => tx(store, "readonly", os => os.count())
  };
})();

const Bus = (() => {
  const K_CUR = "mtk_bus_cursor_v1";
  const url = () => CONFIG.NTFY_BASE + "/" + CONFIG.NTFY_TOPIC;

  async function publish(msg){
    msg = Object.assign({ v:1, app:"matech", ts:Date.now(), device:(navigator.userAgent||"").slice(0,60) }, msg);
    msg.id = (msg.ref||"R") + ":" + msg.type + ":" + msg.ts;
    try{
      await fetch(url(), { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(msg) });
      msg.sent = true;
    }catch(e){ msg.sent = false; }           // hors-ligne : reste en base locale
    try{ await IDB.put("events", msg); }catch(e){}
    return msg;
  }

  async function poll(){
    const since = localStorage.getItem(K_CUR) || String(Math.floor(Date.now()/1000) - 600);
    let txt = "";
    try{
      const r = await fetch(url() + "/json?poll=1&since=" + encodeURIComponent(since), { cache:"no-store" });
      if (!r.ok) return [];
      txt = await r.text();
    }catch(e){ return []; }
    const out = [];
    txt.split("\n").filter(Boolean).forEach(line => {
      try{
        const env = JSON.parse(line);
        if (env.event === "message" && env.message){
          let m; try{ m = JSON.parse(env.message); }catch(_){ return; }
          if (m && m.app === "matech"){ m.id = m.id || ((m.ref||"R")+":"+m.type+":"+(env.time||Date.now())); out.push(m); }
        }
      }catch(_){}
    });
    for (const m of out){ try{ await IDB.put("events", m); }catch(e){} }
    if (out.length) localStorage.setItem(K_CUR, String(Math.floor(Date.now()/1000)));
    return out;
  }

  const events    = () => IDB.all("events").catch(()=>[]);
  const requests  = () => events().then(l => l.filter(x => x.type === "req"));
  const decisions = () => events().then(l => l.filter(x => x.type === "dec"));
  return { publish, poll, events, requests, decisions };
})();
