"use strict";
const Updater = {
  K_APPLIED:"dtc_update_applied_v1", K_META:"dtc_update_meta_v1",
  applied(){ return Store.read(this.K_APPLIED,0); },
  meta(){ return Store.read(this.K_META,null); },
  async fetchJSON(u){ const r=await fetch(u+(u.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"}); if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); },
  async serverManifest(){ try{ return await this.fetchJSON("update.json"); }catch(e){ return null; } },
  async checkAndApply(){
    const man=await this.serverManifest(); if(!man||!man.version) return {ok:false,reason:"aucun manifeste"};
    if(man.version<=this.applied()) return {ok:false,reason:"à jour",version:man.version};
    const pack=await this.fetchJSON(man.file||"data/update-pack.json");
    this.applyPack(pack);
    Store.write(this.K_APPLIED,man.version);
    Store.write(this.K_META,{version:man.version,date:man.date,notes:man.notes||"",appliedAt:new Date().toISOString()});
    Store.audit("MAJ_APPLIQUEE","v"+man.version);
    return {ok:true,version:man.version,notes:man.notes||""};
  },
  applyPack(p){
    if(p.overrides){ const o=Store.read(CONFIG.K.overrides,{}); Object.assign(o,p.overrides); Store.write(CONFIG.K.overrides,o); }
    if(p.customs){ const c=Store.customs(); p.customs.forEach(f=>{ const i=c.findIndex(x=>x.key===f.key); if(i>=0)c[i]=f; else c.push(f); }); Store.write(CONFIG.K.customs,c); }
    if(p.deleted){ let d=Store.read(CONFIG.K.deleted,[]); p.deleted.forEach(k=>{ if(!d.includes(k))d.push(k); }); Store.write(CONFIG.K.deleted,d); }
    if(p.recalls){ const r=Recalls.customs(); p.recalls.forEach(x=>{ const i=r.findIndex(y=>y.id===x.id); if(i>=0)r[i]=x; else r.push(x); }); Recalls.saveCustoms(r); }
    if(p.tsb){ const t=TSB.customs(); p.tsb.forEach(x=>{ const i=t.findIndex(y=>y.id===x.id); if(i>=0)t[i]=x; else t.push(x); }); TSB.saveCustoms(t); }
    if(p.tiers){ const t=Auth.tiers(); p.tiers.forEach(x=>{ const i=t.findIndex(y=>y.code===x.code); if(i>=0)t[i]=x; else t.push(x); }); Auth.saveTiers(t); }
    if(p.modelsExtra){ const m=Veille.modelsExtra(); p.modelsExtra.forEach(x=>{ if(!m.some(y=>y.brand===x.brand&&y.model===x.model)) m.push(x); }); Veille.saveModelsExtra(m); Veille.mergeModels(); }
    if(p.wallpaper !== undefined){ if(p.wallpaper) Wallpaper.set(p.wallpaper); else Wallpaper.reset(); }
  },
  buildPack(version, notes){
    return { app:CONFIG.APP_NAME, version:+version, date:new Date().toISOString(), notes:notes||"",
      overrides:Store.read(CONFIG.K.overrides,{}), customs:Store.customs(), deleted:Store.read(CONFIG.K.deleted,[]),
      recalls:Recalls.customs(), tsb:TSB.customs(), tiers:Auth.tiers(), modelsExtra:Veille.modelsExtra(),
      wallpaper:Wallpaper.get() };
  },
  manifestFor(version, notes){ return { version:+version, date:new Date().toISOString(), file:"data/update-pack.json", notes:notes||"" }; },
  download(name,obj){ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:"application/json"})); a.download=name; a.click(); },
  detectRepo(){ try{ if(location.hostname.endsWith("github.io")) return {owner:location.hostname.split(".")[0], repo:location.pathname.split("/")[1]}; }catch(e){} return {owner:"",repo:""}; },
  async ghPut(path,content,token,owner,repo){
    const url="https://api.github.com/repos/"+owner+"/"+repo+"/contents/"+path;
    const headers={Authorization:"Bearer "+token,Accept:"application/vnd.github+json"};
    let sha; try{ const g=await fetch(url,{headers}); if(g.ok) sha=(await g.json()).sha; }catch(e){}
    const r=await fetch(url,{method:"PUT",headers:Object.assign({"Content-Type":"application/json"},headers),body:JSON.stringify({message:"Ma Tech by Kevin — "+path,content:btoa(unescape(encodeURIComponent(content))),sha})});
    if(!r.ok) throw new Error("GitHub HTTP "+r.status);
    return await r.json();
  }
};
