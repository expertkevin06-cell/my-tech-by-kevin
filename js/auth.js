"use strict";
/* Sécurité : UN SEUL mot de passe admin valide = CONFIG.DEFAULT_ADMIN.pass (Kevin83600).
   Aucun setup, aucun changement de mot de passe : toute autre valeur est refusée.
   Les tiers n'ont JAMAIS accès au mot de passe admin : ils font une demande d'accès. */
const Auth = (() => {
  const K_REM="mtk_remember_v1", K_TIERS="dtc_tiers_v1", K_REQ="mtk_access_requests_v1";
  const read=(k,d)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } };
  const write=(k,v)=>localStorage.setItem(k, JSON.stringify(v));
  let ADMIN_HASH=null;

  async function sha(t){
    try{ const b=await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
         return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join(""); }
    catch(e){ let h=5381; for(let i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return "fnv_"+(h>>>0).toString(16); }
  }
  async function init(){ if(!ADMIN_HASH) ADMIN_HASH = await sha(CONFIG.DEFAULT_ADMIN.pass); }
  async function verifyAdmin(pass){ if(!ADMIN_HASH) await init(); return (await sha(String(pass))) === ADMIN_HASH; }

  async function loginAdmin(user, pass, remember){
    if (!(await verifyAdmin(pass))) return false;             /* seul Kevin83600 passe */
    Session.set({ role:"admin", user: CONFIG.DEFAULT_ADMIN.user });
    if (remember) write(K_REM, { hash: ADMIN_HASH });
    Store.audit("LOGIN_ADMIN", CONFIG.DEFAULT_ADMIN.user);
    return true;
  }
  async function autoLogin(){
    const r=read(K_REM,null); if(!r) return false;
    await init(); if(r.hash!==ADMIN_HASH){ localStorage.removeItem(K_REM); return false; }
    Session.set({ role:"admin", user: CONFIG.DEFAULT_ADMIN.user });
    return true;
  }
  function forgetDevice(){ localStorage.removeItem(K_REM); }

  /* ---- tiers ---- */
  function tiers(){ return read(K_TIERS, []); }
  function saveTiers(l){ write(K_TIERS, l); }
  function addTier(name, expires){
    const code="TIER-"+Math.random().toString(36).slice(2,8).toUpperCase();
    const l=tiers(); l.unshift({ code, name, expires, active:true, created:new Date().toISOString() });
    saveTiers(l); Store.audit("CREER_TIER", code); return code;
  }
  function toggleTier(c){ const l=tiers(); const t=l.find(x=>x.code===c); if(t){ t.active=!t.active; saveTiers(l); Store.audit("TOGGLE_TIER",c); } }
  function removeTier(c){ saveTiers(tiers().filter(x=>x.code!==c)); Store.audit("SUPPR_TIER",c); }
  function loginTier(code){
    code=(code||"").trim().toUpperCase();
    const t=tiers().find(x=>x.code===code);
    if(!t||!t.active) return false;
    if(t.expires && new Date(t.expires)<new Date()) return false;
    Session.set({ role:"tier", user:t.name }); Store.audit("LOGIN_TIER", code); return true;
  }

  /* ---- demandes d'accès tiers (le tiers ne connaît pas le mdp admin) ---- */
  function requests(){ return read(K_REQ, []); }
  function addRequest(r){
    const ref="REQ-"+Math.random().toString(36).slice(2,8).toUpperCase();
    const l=requests(); l.unshift(Object.assign({ ref, date:new Date().toISOString() }, r));
    write(K_REQ, l.slice(0,100)); Store.audit("DEMANDE_ACCES", ref);
    return ref;
  }

  return { init, verifyAdmin, loginAdmin, autoLogin, forgetDevice,
           tiers, saveTiers, addTier, toggleTier, removeTier, loginTier,
           requests, addRequest };
})();
