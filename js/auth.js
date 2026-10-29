"use strict";
const Auth = (() => {
  const K_REM="mtk_remember_v1", K_TIERS="dtc_tiers_v1", K_REQ="mtk_access_requests_v1",
        K_REV="mtk_revoked_v1", K_MYCODE="mtk_my_tier_code_v1", K_PEND="mtk_pending_ref_v1";
  const read=(k,d)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } };
  const write=(k,v)=>localStorage.setItem(k, JSON.stringify(v));
  let ADMIN_HASH=null;
  async function sha(t){ try{ const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)); return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join(""); }catch(e){ let h=5381; for(let i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return "fnv_"+(h>>>0).toString(16); } }
  async function init(){ if(!ADMIN_HASH) ADMIN_HASH=await sha(CONFIG.DEFAULT_ADMIN.pass); }
  async function verifyAdmin(p){ if(!ADMIN_HASH) await init(); return (await sha(String(p)))===ADMIN_HASH; }
  async function loginAdmin(u,p,rem){ if(!(await verifyAdmin(p))) return false; Session.set({role:"admin",user:CONFIG.DEFAULT_ADMIN.user}); if(rem) write(K_REM,{hash:ADMIN_HASH}); Store.audit("LOGIN_ADMIN",CONFIG.DEFAULT_ADMIN.user); return true; }
  async function autoLogin(){ const r=read(K_REM,null); if(!r) return false; await init(); if(r.hash!==ADMIN_HASH){ localStorage.removeItem(K_REM); return false; } Session.set({role:"admin",user:CONFIG.DEFAULT_ADMIN.user}); return true; }
  function forgetDevice(){ localStorage.removeItem(K_REM); }

  /* ---- codes tiers ---- */
  function tiers(){ return read(K_TIERS,[]); }
  function saveTiers(l){ write(K_TIERS,l); }
  function revoked(){ return read(K_REV,[]); }
  function myCode(){ return read(K_MYCODE,null); }
  function setMyCode(c){ write(K_MYCODE,c); }
  function clearMyCode(){ localStorage.removeItem(K_MYCODE); }
  function pendingRef(){ return read(K_PEND,null); }
  function setPendingRef(r){ write(K_PEND,r); }

  function loginTier(code){
    code=(code||"").trim().toUpperCase();
    if (revoked().includes(code)) return false;
    const mine = myCode();
    const inList = tiers().find(x => x.code===code && x.active && (!x.expires || new Date(x.expires)>=new Date()));
    if (code !== mine && !inList) return false;
    Session.set({ role:"tier", user: inList ? inList.name : "Tiers "+code });
    Store.audit("LOGIN_TIER", code); return true;
  }

  /* ---- décisions admin (publiées sur le bus) ---- */
  function grantTier(name, ref){
    const code="TIER-"+Math.random().toString(36).slice(2,8).toUpperCase();
    const l=tiers(); l.unshift({ code, name, ref, active:true, created:new Date().toISOString() });
    saveTiers(l);
    Bus.publish({ type:"dec", ref, status:"approved", code, name });
    Store.audit("ACCES_ACCORDE", ref+" -> "+code);
    return code;
  }
  function denyTier(ref, name){ Bus.publish({ type:"dec", ref, status:"denied", name }); Store.audit("ACCES_REFUSE", ref); }
  function revokeTier(code){
    const l=tiers(); const t=l.find(x=>x.code===code);
    if(t){ t.active=false; saveTiers(l); }
    Bus.publish({ type:"dec", ref:(t&&t.ref)||code, status:"revoked", code });
    Store.audit("ACCES_REVOQUE", code);
  }
  function addTier(name, expires){
    const code="TIER-"+Math.random().toString(36).slice(2,8).toUpperCase();
    const l=tiers(); l.unshift({ code, name, expires, active:true, created:new Date().toISOString() });
    saveTiers(l); Store.audit("CREER_TIER", code); return code;
  }
  function toggleTier(c){ const l=tiers(); const t=l.find(x=>x.code===c); if(t){ t.active=!t.active; saveTiers(l); } }
  function removeTier(c){ saveTiers(tiers().filter(x=>x.code!==c)); }

  /* ---- demandes locales (historique) ---- */
  function requests(){ return read(K_REQ,[]); }
  function addRequest(r){ const ref="REQ-"+Math.random().toString(36).slice(2,8).toUpperCase(); const l=requests(); l.unshift(Object.assign({ref,date:new Date().toISOString()},r)); write(K_REQ,l.slice(0,200)); return ref; }

  return { init, verifyAdmin, loginAdmin, autoLogin, forgetDevice,
           tiers, saveTiers, addTier, toggleTier, removeTier, loginTier,
           grantTier, denyTier, revokeTier, revoked, myCode, setMyCode, clearMyCode,
           pendingRef, setPendingRef, requests, addRequest };
})();
