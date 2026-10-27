"use strict";
const Auth = {
  async hash(str){
    try{
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
    }catch(e){
      let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
      return "fnv_" + (h >>> 0).toString(16);
    }
  },
  settings(){
    let s = Store.read(CONFIG.K.settings, null);
    if (!s || s.authVersion !== CONFIG.AUTH_VERSION){
      s = { adminUser: CONFIG.DEFAULT_ADMIN.user, adminHash: null, authVersion: CONFIG.AUTH_VERSION, created: Date.now() };
      Store.write(CONFIG.K.settings, s);
    }
    return s;
  },
  async init(){
    const s = Auth.settings();
    if (!s.adminHash){
      s.adminHash = await Auth.hash(CONFIG.DEFAULT_ADMIN.pass);
      Store.write(CONFIG.K.settings, s);
    }
    const tiers = Store.read(CONFIG.K.tiers, []);
    if (!tiers.some(t => t.code === CONFIG.DEFAULT_TIER.code)){
      tiers.push({ code: CONFIG.DEFAULT_TIER.code, name: CONFIG.DEFAULT_TIER.name, active: true, expires: null, created: Date.now() });
      Store.write(CONFIG.K.tiers, tiers);
    }
  },
  async loginAdmin(user, pass){
    const s = Auth.settings();
    if (user.trim() === s.adminUser && (await Auth.hash(pass)) === s.adminHash){
      Session.set({ role: "admin", name: s.adminUser });
      Store.audit("CONNEXION", "admin");
      return true;
    }
    return false;
  },
  loginTier(code){
    const c = code.trim().toUpperCase();
    const t = Store.read(CONFIG.K.tiers, []).find(x => x.code.toUpperCase() === c);
    if (!t || !t.active) return false;
    if (t.expires && new Date(t.expires) < new Date()) return false;
    Session.set({ role: "tier", name: t.name || t.code });
    Store.audit("CONNEXION", "tiers: " + t.code);
    return true;
  },
  logout(){ Store.audit("DECONNEXION", ""); Session.clear(); },
  async changePassword(current, next){
    const s = Auth.settings();
    if ((await Auth.hash(current)) !== s.adminHash) return false;
    s.adminHash = await Auth.hash(next);
    Store.write(CONFIG.K.settings, s);
    Store.audit("MDP_ADMIN", "modifié");
    return true;
  },
  tiers(){ return Store.read(CONFIG.K.tiers, []); },
  saveTiers(list){ Store.write(CONFIG.K.tiers, list); },
  addTier(name, expires){
    const list = Auth.tiers();
    const code = "TIER-" + Math.random().toString(36).slice(2,8).toUpperCase();
    list.push({ code, name, active: true, expires: expires || null, created: Date.now() });
    Auth.saveTiers(list); Store.audit("CREER_TIER", code);
    return code;
  },
  toggleTier(code){
    const list = Auth.tiers(); const t = list.find(x => x.code === code);
    if (t){ t.active = !t.active; Auth.saveTiers(list); Store.audit("TIER_STATUT", code + "=" + t.active); }
  },
  removeTier(code){
    Auth.saveTiers(Auth.tiers().filter(x => x.code !== code));
    Store.audit("SUPPR_TIER", code);
  }
};
