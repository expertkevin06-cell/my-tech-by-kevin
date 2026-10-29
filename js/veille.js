"use strict";
const Veille = (() => {
  const PERIOD_DAYS=15; const MS=PERIOD_DAYS*24*3600*1000;
  const K_LAST="mtk_veille_last_v1", K_VER="mtk_veille_ver_v1", K_CAND="mtk_veille_cand_v1",
        K_MODELS="mtk_models_extra_v1", K_DONE="mtk_veille_done_v1", K_CATVER="mtk_catalog_ver_v1";
  const read=(k,d)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } };
  const write=(k,v)=>localStorage.setItem(k, JSON.stringify(v));

  /* ===== GLOSSAIRE TECHNIQUE → traduction FR obligatoire des sources étrangères ===== */
  const PHRASES = [
    ["high voltage battery","batterie haute tension"],["fuel pump","pompe à carburant"],["seat belts","ceintures de sécurité"],["seat belt","ceinture de sécurité"],
    ["service brakes","freinage de service"],["parking brake","frein de stationnement"],["power train","groupe motopropulseur"],["drivetrain","transmission"],
    ["wiring harness","faisceau électrique"],["electrical system","système électrique"],["update the software","mettre à jour le logiciel"],["loss of motive power","perte de propulsion"],
    ["risk of fire","risque d'incendie"],["may cause","peut provoquer"],["can cause","peut provoquer"],["air bag","airbag"],["windshield","pare-brise"],
    ["coolant","liquide de refroidissement"],["short circuit","court-circuit"],["overheating","surchauffe"],["stalling","calage"],["dealer","concession"],
    ["transmission","boîte de vitesses"],["suspension","suspension"],["steering","direction"],["engine","moteur"],["battery","batterie"],["brakes","freins"],
    ["tires","pneumatiques"],["tire","pneumatique"],["wheels","roues"],["wheel","roue"],["camera","caméra"],["sensor","capteur"],["module","module"],
    ["inverter","onduleur"],["charger","chargeur"],["charging","charge"],["software","logiciel"],["leak","fuite"],["corrosion","corrosion"],
    ["fracture","rupture"],["crash","collision"],["injury","blessure"],["fire","incendie"],["replace","remplacer"],["inspect","contrôler"],
    ["remedy","solution"],["consequence","conséquence"],["component","composant"],["summary","résumé"],["visibility","visibilité"],["latches","verrous"]
  ];
  function translateFr(s){
    if(!s) return s;
    let t=String(s);
    PHRASES.forEach(p=>{ t=t.replace(new RegExp(p[0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"), p[1]); });
    return t;
  }
  function tradItem(it){
    if(!it) return it;
    ["comp","prob","risk","fix","sym"].forEach(f=>{
      if(Array.isArray(it[f])) it[f]=it[f].map(translateFr);
      else if(typeof it[f]==="string") it[f]=translateFr(it[f]);
    });
    it.trad=true; return it;
  }

  function due(){ return Date.now()-read(K_LAST,0)>=MS; }
  function daysLeft(){ return Math.max(0, Math.ceil((MS-(Date.now()-read(K_LAST,0)))/86400000)); }
  async function fetchJSON(u){ const r=await fetch(u+(u.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"}); if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }
  function candidates(){ return read(K_CAND,[]); }
  function saveCandidates(l){ write(K_CAND,l); }
  function modelsExtra(){ return read(K_MODELS,[]); }
  function saveModelsExtra(l){ write(K_MODELS,l); }
  function mergeModels(){
    modelsExtra().forEach(x=>{ const b=findBrand(x.brand); if(!b) return;
      if(b.models.some(m=>m[0].split("|")[0]===x.model)) return;
      const idx=(x.engines||[]).map(e=>{ let i=b.pool.indexOf(e); if(i<0){ b.pool.push(e); i=b.pool.length-1; } return i; });
      if(idx.length) b.models.push([x.model+"|"+(x.y0||2025), idx]); });
  }
  function mergeCandidates(items){
    const cur=candidates(); const done=new Set(read(K_DONE,[])); let added=0;
    (items||[]).forEach(it=>{ it=tradItem(it); if(!it||!it.id||done.has(it.id)||cur.some(c=>c.id===it.id)) return; cur.unshift(it); added++; });
    saveCandidates(cur.slice(0,400)); return added;
  }
  async function check(force){
    const now=Date.now();
    if(!force && now-read(K_LAST,0)<MS) return {ok:false,reason:"période 15 j non atteinte ("+daysLeft()+" j)"};
    write(K_LAST,now);
    let man; try{ man=await fetchJSON("veille.json"); }catch(e){ return {ok:false,reason:"veille.json inaccessible"}; }
    if(!man||!man.version) return {ok:false,reason:"manifeste invalide"};
    if(man.version<=read(K_VER,0)) return {ok:false,reason:"veille déjà récupérée",version:man.version};
    let pack; try{ pack=await fetchJSON(man.file||"data/veille-pack.json"); }catch(e){ return {ok:false,reason:"pack inaccessible"}; }
    write(K_VER,man.version);
    const added=mergeCandidates(pack.items||[]);
    Store.audit("VEILLE_RECUE","v"+man.version+" +"+added);
    return {ok:true,version:man.version,count:added};
  }
  /* Import du pack catalogue (marques/modèles/motorisations 2023-2027) */
  async function fetchCatalog(force){
    let pack; try{ pack=await fetchJSON("data/catalog-pack.json"); }catch(e){ return {ok:false,reason:"catalog-pack inaccessible",count:0}; }
    if(!pack||!pack.version) return {ok:false,reason:"pack catalogue invalide",count:0};
    if(!force && pack.version<=read(K_CATVER,0)) return {ok:false,reason:"catalogue déjà importé",count:0};
    write(K_CATVER,pack.version);
    write("mtk_catalog_pack_v1", pack);
    const added=mergeCatalog(pack.items||[]);
    Store.audit("CATALOGUE_IMPORT","v"+pack.version+" +"+added);
    return {ok:true,version:pack.version,count:added};
  }
  function approve(ids){
    const cur=candidates(); const done=read(K_DONE,[]);
    const sel=cur.filter(c=>ids.includes(c.id));
    sel.forEach(c=>{
      if(c.type==="recall"){ const l=Recalls.customs(); l.unshift({id:"RAP-VEILLE-"+String(c.id).replace(/\W/g,"").slice(0,10), brands:[c.brand], models:c.model?[c.model]:[], fuels:c.fuels||[], y0:c.y0||2017, y1:c.y1||2027, comp:c.comp||"Composant", risk:c.risk||c.prob||"Risque", fix:c.fix||"Voir concession", dtcs:c.dtcs||[], status:"open", date:c.date||new Date().toISOString().slice(0,7)}); Recalls.saveCustoms(l); }
      else if(c.type==="tsb"){ const l=TSB.customs(); l.unshift({id:"TSB-VEILLE-"+String(c.id).replace(/\W/g,"").slice(0,10), src:"TSB", ref:c.ref||"veille", brands:[c.brand], models:c.model?[c.model]:[], eng:c.eng||[], en:c.en||[], y0:c.y0||2017, y1:c.y1||2027, comp:c.comp||"Composant", prob:c.prob||c.risk||"", sym:c.sym||[], fix:c.fix||"", dtc:c.dtcs||[], sev:c.sev||3}); TSB.saveCustoms(l); }
      else if(c.type==="fault"){ Store.addCustom({key:c.code, code:c.code, brand:c.brand||"", title:c.title||c.comp||"Panne", desc:c.prob||"", sev:c.sev||2, sevLabel:["Mineure","Modérée","Sérieuse","Critique"][(c.sev||2)-1], symptoms:c.sym||[], causes:c.causes||[], solutions:c.fix?[c.fix]:[], brands:c.brand?[c.brand]:["Toutes marques"], motors:c.eng||["Essence"], years:YR}); }
      else if(c.type==="model"||c.type==="engine"){ const l=modelsExtra(); if(!l.some(m=>m.brand===c.brand&&m.model===c.model)) l.push({brand:c.brand,model:c.model,y0:c.y0||2025,engines:c.engines||[]}); saveModelsExtra(l); }
      done.push(c.id);
    });
    write(K_DONE,done); saveCandidates(cur.filter(c=>!ids.includes(c.id))); mergeModels();
    Store.audit("VEILLE_APPROUVEE", sel.length+" élément(s)"); return sel.length;
  }
  async function nhtsa(make,model,year){
    const url="https://api.nhtsa.gov/recalls/recallsByVehicle?make="+encodeURIComponent(make)+"&model="+encodeURIComponent(model)+"&modelYear="+year;
    const r=await fetch(url); if(!r.ok) throw new Error("HTTP "+r.status);
    const j=await r.json();
    return (j.results||[]).map(x=>tradItem({ id:"NHTSA-"+(x.NHTSACampaignNumber||Math.random().toString(36).slice(2,8)), type:"recall",
      brand:make.charAt(0).toUpperCase()+make.slice(1).toLowerCase(), model:model.charAt(0).toUpperCase()+model.slice(1).toLowerCase(),
      y0:+year, y1:+year, comp:x.Component||"Composant", risk:x.Consequence||"", fix:x.Remedy||"", src:"NHTSA", ref:x.NHTSACampaignNumber||"", date:(x.ReportReceivedDate||"").slice(0,10), dtcs:[], sev:3 }));
  }
  const importNhtsa=list=>mergeCandidates(list);

  /* ===== TOUCHE DE RELANCE MANUELLE : veille + catalogue 2023-2027 + MAJ ===== */
  async function relaunch(){
    const a=await check(true).catch(e=>({ok:false,reason:e.message,count:0}));
    const c=await fetchCatalog(true).catch(e=>({ok:false,reason:e.message,count:0}));
    mergeModels();
    const u=await Updater.checkAndApply().catch(e=>({ok:false,reason:e.message}));
    Store.audit("RELANCE_MANUELLE", "veille+"+(a.count||0)+" catalogue+"+(c.count||0));
    return { a, c, u };
  }

  return { PERIOD_DAYS, due, daysLeft, check, fetchCatalog, candidates, approve, modelsExtra, saveModelsExtra,
           mergeModels, nhtsa, importNhtsa, translateFr, tradItem, relaunch };
})();
