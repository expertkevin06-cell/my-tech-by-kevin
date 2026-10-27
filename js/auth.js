"use strict";
/* Sécurité admin : mot de passe défini au premier lancement (SHA-256 + sel).
   Aucun identifiant/mot de passe pré-enregistré n'est affiché ou stocké en clair.
   Option "se souvenir sur cet appareil" = jeton local comparé au hash. */
const Auth = (() => {
  const K_HASH  = "mtk_admin_hash_v1";
  const K_REM   = "mtk_remember_v1";
  const K_TIERS = "dtc_tiers_v1";

  async function sha(txt){
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,"0")).join("");
  }
  const read = (k, d) => { try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  function rec(){ return read(K_HASH, null); }
  function hasAdmin(){ return !!rec(); }

  async function setupAdmin(user, pass){
    const salt = crypto.getRandomValues(new Uint8Array(8)).join("-");
    const hash = await sha(salt + "|" + pass);
    write(K_HASH, { user: user || "admin", salt, hash });
    Session.set({ role:"admin", user: user || "admin" });
    Store.audit("SETUP_ADMIN", user || "admin");
    return true;
  }

  async function loginAdmin(user, pass, remember){
    const r = rec(); if (!r) return false;
    const hash = await sha(r.salt + "|" + pass);
    if (hash !== r.hash) return false;
    if (user && user.trim() && user.trim() !== r.user) return false;
    Session.set({ role:"admin", user:r.user });
    if (remember) write(K_REM, { token: Date.now().toString(36), hash: r.hash });
    Store.audit("LOGIN_ADMIN", r.user);
    return true;
  }

  async function autoLogin(){
    const rem = read(K_REM, null); if (!rem) return false;
    const r = rec(); if (!r || rem.hash !== r.hash) { localStorage.removeItem(K_REM); return false; }
    Session.set({ role:"admin", user:r.user });
    return true;
  }
  function forgetDevice(){ localStorage.removeItem(K_REM); }

  async function changePassword(cur, nw){
    const r = rec(); if (!r) return false;
    if (await sha(r.salt + "|" + cur) !== r.hash) return false;
    const salt = crypto.getRandomValues(new Uint8Array(8)).join("-");
    const hash = await sha(salt + "|" + nw);
    write(K_HASH, { user:r.user, salt, hash });
    localStorage.removeItem(K_REM);
    Store.audit("PASS_CHANGE", r.user);
    return true;
  }

  /* ---- accès tiers ---- */
  function tiers(){ return read(K_TIERS, []); }
  function saveTiers(list){ write(K_TIERS, list); }
  function addTier(name, expires){
    const code = "TIER-" + Math.random().toString(36).slice(2,8).toUpperCase();
    const l = tiers(); l.unshift({ code, name, expires, active:true, created:new Date().toISOString() });
    saveTiers(l); Store.audit("CREER_TIER", code); return code;
  }
  function toggleTier(code){ const l = tiers(); const t = l.find(x => x.code === code); if (t){ t.active = !t.active; saveTiers(l); Store.audit("TOGGLE_TIER", code); } }
  function removeTier(code){ saveTiers(tiers().filter(x => x.code !== code)); Store.audit("SUPPR_TIER", code); }
  function loginTier(code){
    code = (code || "").trim().toUpperCase();
    const t = tiers().find(x => x.code === code);
    if (!t || !t.active) return false;
    if (t.expires && new Date(t.expires) < new Date()) return false;
    Session.set({ role:"tier", user:t.name });
    Store.audit("LOGIN_TIER", code);
    return true;
  }

  async function init(){ /* rien à pré-charger : aucun compte par défaut */ }

  return { init, hasAdmin, setupAdmin, loginAdmin, autoLogin, forgetDevice, changePassword,
           tiers, saveTiers, addTier, toggleTier, removeTier, loginTier };
})();
