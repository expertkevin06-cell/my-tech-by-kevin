"use strict";
const Store = {
  read(k, fb){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }catch(e){ return fb; } },
  write(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  audit(action, detail){
    const log = Store.read(CONFIG.K.audit, []);
    log.unshift({ d: new Date().toISOString(), u: Session.user() || "?", action, detail: detail || "" });
    Store.write(CONFIG.K.audit, log.slice(0, 500));
  },
  getOverride(key){ return Store.read(CONFIG.K.overrides, {})[key] || null; },
  setOverride(key, fiche){
    const o = Store.read(CONFIG.K.overrides, {}); o[key] = fiche; Store.write(CONFIG.K.overrides, o);
    Store.audit("MODIF_FICHE", key);
  },
  delOverride(key){
    const o = Store.read(CONFIG.K.overrides, {}); delete o[key]; Store.write(CONFIG.K.overrides, o);
  },
  customs(){ return Store.read(CONFIG.K.customs, []); },
  addCustom(f){ const c = Store.customs(); c.unshift(f); Store.write(CONFIG.K.customs, c); Store.audit("CREATION_FICHE", f.code); },
  updateCustom(i, f){ const c = Store.customs(); c[i] = f; Store.write(CONFIG.K.customs, c); Store.audit("MODIF_FICHE", f.code); },
  removeCustom(i){ const c = Store.customs(); Store.audit("SUPPR_FICHE", c[i].code); c.splice(i,1); Store.write(CONFIG.K.customs, c); },
  isDeleted(key){ return Store.read(CONFIG.K.deleted, []).includes(key); },
  setDeleted(key, del){
    let d = Store.read(CONFIG.K.deleted, []);
    if (del && !d.includes(key)) d.push(key);
    if (!del) d = d.filter(x => x !== key);
    Store.write(CONFIG.K.deleted, d);
    Store.audit(del ? "SUPPR_FICHE" : "RESTAUR_FICHE", key);
  }
};
const Session = {
  set(s){ sessionStorage.setItem(CONFIG.K.session, JSON.stringify(s)); },
  get(){ return JSON.parse(sessionStorage.getItem(CONFIG.K.session) || "null"); },
  user(){ const s = Session.get(); return s ? s.name : null; },
  role(){ const s = Session.get(); return s ? s.role : null; },
  clear(){ sessionStorage.removeItem(CONFIG.K.session); }
};
