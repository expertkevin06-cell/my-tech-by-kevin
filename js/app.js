"use strict";
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const isAdmin = () => Session.role() === "admin";
function toast(msg){ const t=document.createElement("div"); t.className="toast"; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.classList.add("show"),10); setTimeout(()=>{t.classList.remove("show"); setTimeout(()=>t.remove(),300);},3800); }
function navigate(h){ if (location.hash===h) App.route(); else location.hash=h; }

const App = {
  deferredPrompt:null,
  state:{ view:"search", page:0, list:null, filterLetter:"", filterBrand:"",
          vehBrand:"", vehModel:"", vehEngine:"", vehCat:"", recBrand:"", recYear:"" },

  async start(){
    await Auth.init();
    if (!Session.get() && await Auth.autoLogin()) {}
    window.addEventListener("hashchange", () => App.route());
    window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); App.deferredPrompt = e; });
    window.addEventListener("online", () => { App.updateNet(); toast("🌐 Connexion rétablie"); });
    window.addEventListener("offline", () => { App.updateNet(); toast("⛔ Hors ligne — mode local actif"); });
    Updater.checkAndApply().then(r => { if (r.ok) toast("✅ Mise à jour v"+r.version+" appliquée"); }).catch(()=>{});
    App.route();
  },
  updateNet(){ const on=navigator.onLine; $$("[id^=netbadge]").forEach(el=>{ el.textContent=on?"🌐 connecté":"⛔ hors ligne"; el.className="tag "+(on?"on":"off"); }); },
  async doShare(){ const url=location.origin+location.pathname; try{ if(navigator.share){ await navigator.share({title:"Ma Tech by Kevin",url}); toast("✅ Lien partagé"); } else { await navigator.clipboard.writeText(url); toast("🔗 Lien copié"); } }catch(e){ toast("Partage annulé"); } },
  async doInstall(){ if(App.deferredPrompt){ App.deferredPrompt.prompt(); const r=await App.deferredPrompt.userChoice; toast(r.outcome==="accepted"?"📥 Installation lancée":"Annulé"); App.deferredPrompt=null; } else toast("ℹ️ Menu navigateur → Installer"); },

  route(){
    try{
      if (!Session.get()) return App.renderLogin();
      const h = location.hash.replace(/^#\//,"") || "search";
      const [view, arg] = h.split("/");
      if (view==="admin" && !isAdmin()){ if(location.hash!=="#/search") location.hash="#/search"; return; }
      App.state.view = view;
      if (view==="fiche" && arg) return App.renderShell(App.renderFiche(decodeURIComponent(arg)));
      if (view==="rappel" && arg) return App.renderShell(App.renderRappel(decodeURIComponent(arg)));
      const V = { search:App.renderSearch, codes:App.renderCodes, veh:App.renderVeh, recalls:App.renderRecalls, admin:App.renderAdmin };
      App.renderShell((V[view]||App.renderSearch)());
      window.scrollTo(0,0);
    }catch(err){ console.error(err); $("#app").innerHTML = `<div class="card"><h1>⚠️ Erreur</h1><p class="muted">${esc(err.message)}</p><button class="btn" onclick="location.reload()">Recharger</button></div>`; }
  },

  renderShell(body){
    const role = Session.role();
    $("#app").innerHTML = `
    <div class="topbar"><div class="logo">⚙️ Ma Tech <span>by Kevin</span></div>
      <span class="badge ${role==='admin'?'b-admin':'b-tier'}">${role==='admin'?'ADMIN':'TIERS'}</span>
      <span class="tag" id="netbadge"></span><div class="spacer"></div>
      <button class="btn sec small" data-act="share">🔗</button>
      <button class="btn sec small" data-act="install">📥</button>
      <button class="btn sec small" data-act="logout">Déconnexion</button></div>
    <nav class="tabs" style="padding:.4rem 1rem;background:var(--panel);border-bottom:1px solid var(--bd);display:flex">
      <button type="button" data-act="nav" data-view="search" class="${App.state.view==='search'?'active':''}">🔍 Recherche</button>
      <button type="button" data-act="nav" data-view="codes" class="${App.state.view==='codes'?'active':''}">📟 Codes DTC</button>
      <button type="button" data-act="nav" data-view="veh" class="${App.state.view==='veh'?'active':''}">🚗 Véhicules</button>
      <button type="button" data-act="nav" data-view="recalls" class="${App.state.view==='recalls'||App.state.view==='rappel'?'active':''}">📢 Rappels</button>
      ${isAdmin()?'<button type="button" data-act="nav" data-view="admin" class="'+(App.state.view==='admin'?'active':'')+'">🛠️ Admin</button>':''}
    </nav>
    <main>${body}</main>
    <div class="footer">Ma Tech by Kevin v${CONFIG.VERSION} — pack v${Updater.applied()} — pannes filtrées par énergie (thermique/électrique/hybride) — 2017 → 2026</div>`;
    App.updateNet(); App.bindView();
  },

  renderLogin(){
    const setup = !Auth.hasAdmin();
    $("#app").innerHTML = `<div class="login-wrap"><div class="card login-box">
      <div class="logo" style="font-size:1.4rem">⚙️ Ma Tech <span>by Kevin</span></div>
      ${setup?`<h3 style="margin-top:.8rem">🔐 Première utilisation — définir le mot de passe admin</h3>
        <label>Identifiant</label><input id="s-user" placeholder="admin">
        <label>Mot de passe (6 min)</label><input id="s-pass" type="password">
        <label>Confirmation</label><input id="s-conf" type="password">
        <button class="btn" id="s-go" style="width:100%;margin-top:.8rem">Créer et ouvrir</button><div class="err-msg" id="s-err"></div>`
      :`<label style="margin-top:.8rem">Identifiant</label><input id="l-user">
        <label>Mot de passe</label><input id="l-pass" type="password">
        <label class="row" style="font-size:.82rem"><input type="checkbox" id="l-rem" style="width:auto"> Se souvenir sur cet appareil</label>
        <button class="btn" id="l-admin" style="width:100%;margin-top:.8rem">Connexion</button><div class="err-msg" id="l-err"></div>`}
      <hr style="border-color:var(--bd);margin:1rem 0">
      <label>Code tiers</label><input id="l-code" placeholder="TIER-XXXXXX" style="text-transform:uppercase">
      <button class="btn sec" id="l-tier" style="width:100%;margin-top:.6rem">Accès tiers</button><div class="err-msg" id="l-err2"></div>
    </div></div>`;
    if (setup) $("#s-go").onclick = async () => { const p=$("#s-pass").value,c=$("#s-conf").value; if(p.length<6) return $("#s-err").textContent="6 min."; if(p!==c) return $("#s-err").textContent="Différent."; await Auth.setupAdmin($("#s-user").value.trim()||"admin",p); location.hash="#/search"; App.route(); };
    else $("#l-admin").onclick = async () => { const ok=await Auth.loginAdmin($("#l-user").value.trim(),$("#l-pass").value,$("#l-rem").checked); if(ok){location.hash="#/search";App.route();} else $("#l-err").textContent="Incorrect."; };
    $("#l-tier").onclick = () => { if(Auth.loginTier($("#l-code").value)){location.hash="#/search";App.route();} else $("#l-err2").textContent="Code invalide."; };
  },

  renderSearch(){
    return `<div class="card"><h1>Recherche pannes + rappels + bulletins</h1>
      <div class="row" style="margin-top:.6rem"><input id="q" placeholder="P0420, chaîne 1.5 HDI, AdBlue, ressorts Bigster, batterie Elroq…" style="flex:1"><button class="btn" data-act="search-go">Rechercher</button></div></div>
      <div id="tsb-results"></div><div id="results"></div><div id="recall-results"></div>`;
  },
  doSearch(){
    const q=$("#q").value.trim(); if(!q) return;
    const tsbs = TSB.search(q);
    $("#tsb-results").innerHTML = tsbs.length?`<div class="card"><h3>📚 Pannes connues & bulletins (${tsbs.length})</h3>
      <table><thead><tr><th>Source</th><th>Réf.</th><th>Marques</th><th>Composant / problème</th><th>Énergie</th><th>Sév.</th></tr></thead><tbody>
      ${tsbs.map(t=>`<tr data-act="open-tsb" data-id="${esc(t.id)}" style="cursor:pointer"><td><span class="tag b">${esc(TSB.SRC[t.src]||t.src)}</span></td><td class="muted">${esc(t.ref)}</td><td>${esc(t.brands.slice(0,3).join(", "))}</td><td><b>${esc(t.comp)}</b></td><td class="muted">${(t.en&&t.en.length)?esc(t.en.join("/")):"toutes"}</td><td><span class="sev s${t.sev}"></span></td></tr>`).join("")}
      </tbody></table></div>`:"";
    let keys=[];
    if (/^[pbcu][0-3]/i.test(q)) keys = DT.findByCode(q).map(e=>e.key);
    else { const n=q.toLowerCase(); for(let i=0;i<CONFIG.TOTAL_FICHES && keys.length<300;i++){ const f=DT.ficheAt(i); if(f.title.toLowerCase().includes(n)) keys.push(f.key); } }
    App.state.list=keys.slice(0,500); App.state.page=0;
    $("#results").innerHTML = App.listHTML(App.state.list,"fiche(s)");
    const recs = Recalls.search(q.toLowerCase());
    $("#recall-results").innerHTML = recs.length?`<div class="card"><h3>📢 Rappels (${recs.length})</h3>
      <table><tbody>${recs.map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer"><td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td><td class="muted">${(r.fuels&&r.fuels.length)?esc(r.fuels.join("/")):"toutes"}</td></tr>`).join("")}</tbody></table></div>`:"";
  },

  renderCodes(){
    return `<div class="card"><h1>Tous les codes DTC</h1>
      <div class="row" style="margin-top:.5rem"><select id="f-letter"><option value="">Tous</option>${["P","B","C","U"].map(l=>`<option ${App.state.filterLetter===l?'selected':''}>${l}</option>`).join("")}</select>
      <button class="btn" data-act="codes-go">Filtrer</button></div></div><div id="results"></div><div id="pager" class="pager"></div>`;
  },
  applyCodesFilter(){
    const L=$("#f-letter")?$("#f-letter").value:"";
    App.state.filterLetter=L;
    const keys=[]; const start=L?["P","B","C","U"].indexOf(L)*4000:0, end=L?start+4000:16000;
    for(let i=start;i<end;i++) keys.push(DT.codeFromIndex(i));
    App.state.list=keys; App.state.page=0; App.renderPage();
  },
  renderPage(){
    const keys=App.state.list||[]; const pages=Math.max(1,Math.ceil(keys.length/CONFIG.PAGE_SIZE));
    App.state.page=Math.min(Math.max(0,App.state.page),pages-1);
    $("#results").innerHTML=App.listHTML(keys.slice(App.state.page*CONFIG.PAGE_SIZE,App.state.page*CONFIG.PAGE_SIZE+CONFIG.PAGE_SIZE), keys.length+" fiche(s)");
    $("#pager").innerHTML=pages>1?`<button class="btn sec small" data-act="page-prev" ${App.state.page===0?'disabled':''}>◀</button><span class="muted">${App.state.page+1}/${pages}</span><button class="btn sec small" data-act="page-next" ${App.state.page>=pages-1?'disabled':''}>▶</button>`:"";
  },
  listHTML(keys,label){
    if(!keys||!keys.length) return `<div class="card muted">Aucun résultat.</div>`;
    return `<div class="card"><div class="muted">${esc(label)}</div><table><thead><tr><th>Code</th><th>Description</th></tr></thead><tbody>
      ${keys.map(k=>{const f=resolveFiche(k); return f?`<tr data-act="open-fiche" data-key="${esc(k)}" style="cursor:pointer"><td class="code">${esc(f.code)}</td><td>${esc(f.title.slice(0,90))}</td></tr>`:"";}).join("")}
      </tbody></table></div>`;
  },

  renderVeh(){
    const S=App.state;
    const b=S.vehBrand?findBrand(S.vehBrand):null;
    if(!b){
      const list=BRANDS.filter(x=>!S.vehCat||x.o===S.vehCat);
      return `<div class="card"><h1>Marques 2017-2026</h1>
        <div class="row" style="margin-top:.5rem">${[["","Toutes"],["FR","Françaises"],["EU","Européennes"],["US","Américaines"],["AS","Asiatiques"]].map(c=>`<button class="btn ${S.vehCat===c[0]?'':'sec'} small" data-act="veh-cat" data-cat="${c[0]}">${c[1]}</button>`).join("")}</div></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${list.map(x=>`<div class="card" style="cursor:pointer;margin:0" data-act="veh-brand" data-brand="${esc(x.n)}"><h3>${esc(x.n)}</h3><div class="muted">${x.models.length} modèles</div></div>`).join("")}</div>`;
    }
    const models=brandModels(b); const model=S.vehModel?models.find(m=>m.name===S.vehModel):null;
    if(!model){
      return `<div class="card"><div class="row"><h1>${esc(b.n)} — modèles</h1><div class="spacer"></div><button class="btn sec small" data-act="veh-reset" data-level="brands">←</button></div></div>
        <div class="card"><table><tbody>${models.map(m=>`<tr data-act="veh-model" data-model="${esc(m.name)}" style="cursor:pointer"><td><b>${esc(m.name)}</b></td><td class="muted">${m.y0} → 2026</td></tr>`).join("")}</tbody></table></div>`;
    }
    if(!S.vehEngine){
      return `<div class="card"><div class="row"><h1>${esc(b.n)} ${esc(model.name)}</h1><div class="spacer"></div><button class="btn sec small" data-act="veh-reset" data-level="models">←</button></div></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${model.engines.map(e=>`<div class="card" style="cursor:pointer;margin:0" data-act="veh-engine" data-engine="${esc(e)}"><h3>⚙️ ${esc(e)}</h3><span class="tag b">${esc(DT.energyOf(e))}</span></div>`).join("")}</div>`;
    }
    const energy = DT.energyOf(S.vehEngine);
    const modelKey = model.name+"|"+model.y0;
    const res = DT.faultsForVehicle(b.n, modelKey, S.vehEngine);
    const sysF = DT.systemFaultsFor(b.n, modelKey, S.vehEngine);
    const recs = Recalls.forVehicle(b.n, modelKey, S.vehEngine);
    const tsbs = TSB.forVehicle(b.n, model.name, model.y0, S.vehEngine);
    return `
    <div class="card"><div class="row" style="flex-wrap:wrap"><h1>${esc(b.n)} ${esc(model.name)}</h1>
      <span class="tag b">⚙️ ${esc(S.vehEngine)}</span><span class="tag">⚡ ${esc(energy)}</span>
      <span class="tag">${Recalls.powerOf(S.vehEngine)||"—"} ch</span><span class="tag">${model.y0} → 2026</span>
      <div class="spacer"></div><button class="btn sec small" data-act="veh-reset" data-level="engines">←</button></div>
      <p class="muted" style="margin-top:.4rem">Propulsion <b>${esc(energy)}</b> : pannes DTC, système, TSB et rappels <b>filtrés par énergie</b> — ${res.faults.length} DTC • ${sysF.length} système • ${tsbs.length} TSB • ${recs.length} rappels.</p></div>
    ${tsbs.length?`<div class="card"><h3>📚 Pannes connues & bulletins (TSB/NHTSA/Safety Gate/RappelConso)</h3>
      <table><thead><tr><th>Source</th><th>Composant / problème</th><th>Symptômes</th><th>Solution</th><th>Sév.</th></tr></thead><tbody>
      ${tsbs.map(t=>`<tr data-act="open-tsb" data-id="${esc(t.id)}" style="cursor:pointer"><td><span class="tag b">${esc(TSB.SRC[t.src]||t.src)}</span></td><td><b>${esc(t.comp)}</b><div class="muted">${esc(t.prob.slice(0,60))}</div></td><td class="muted">${esc(t.sym.slice(0,2).join(" • "))}</td><td class="muted">${esc(t.fix.slice(0,50))}</td><td><span class="sev s${t.sev}"></span></td></tr>`).join("")}
      </tbody></table></div>`:`<div class="card muted">Aucune panne connue/TSB pour cette propulsion.</div>`}
    ${recs.length?`<div class="card"><h3>📢 Rappels applicables</h3><table><tbody>${recs.map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer"><td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td><td>${r.status==='open'?'<span style="color:var(--warn)">ouverte</span>':'clôturée'}</td></tr>`).join("")}</tbody></table></div>`:`<div class="card muted">Aucun rappel pour cette configuration.</div>`}
    ${sysF.map(f=>`<div class="card"><h3>🧰 ${esc(f.comp)}</h3>
      <p class="muted"><b>Panne :</b> ${esc(f.fault)}</p>
      <p class="muted"><b>Symptômes :</b> ${esc(f.symptoms.join(" • "))}</p>
      <p class="muted"><b>Causes :</b> ${esc(f.causes.join(" • "))}</p>
      <p class="muted"><b>Solutions :</b> ${esc(f.fixes.join(" • "))}</p>
      <div>${f.dtcs.map(c=>`<button class="btn sec small" data-act="open-fiche" data-key="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>`).join("")}
    ${App.listHTML(res.faults.map(f=>f.key), "Codes DTC — "+esc(energy))}`;
  },

  renderRecalls(){
    const S=App.state; let list=Recalls.all();
    if(S.recBrand) list=list.filter(r=>r.brands.includes(S.recBrand));
    if(S.recYear) list=list.filter(r=>!(+S.recYear>r.y1||+S.recYear<r.y0));
    return `<div class="card"><h1>📢 Rappels (${list.length})</h1>
      <div class="row"><select id="r-brand"><option value="">Toutes</option>${BRANDS.map(b=>`<option ${S.recBrand===b.n?'selected':''}>${esc(b.n)}</option>`).join("")}</select>
      <select id="r-year"><option value="">Toutes années</option>${CONFIG.YEARS.map(y=>`<option ${S.recYear==y?'selected':''}>${y}</option>`).join("")}</select>
      <button class="btn" data-act="recalls-go">Filtrer</button></div></div>
      <div class="card"><table><tbody>${list.slice(0,300).map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer"><td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td><td class="muted">${(r.fuels&&r.fuels.length)?esc(r.fuels.join("/")):"toutes"}</td></tr>`).join("")}</tbody></table></div>`;
  },
  renderRappel(id){ const r=Recalls.byId(id); if(!r) return `<div class="card">Introuvable.</div>`;
    return `<div class="card"><div class="row"><span class="code">${esc(r.id)}</span><span class="tag">${(r.fuels&&r.fuels.length)?esc(r.fuels.join("/")):"toutes énergies"}</span><div class="spacer"></div><button class="btn sec small" data-act="back">←</button></div>
      <h2 style="margin-top:.6rem">${esc(r.comp)}</h2><p><b>Risque :</b> ${esc(r.risk)}</p><p><b>Solution :</b> ${esc(r.fix)}</p></div>`; },
  renderFiche(key){ const f=resolveFiche(key); if(!f) return `<div class="card">Introuvable.</div>`;
    return `<div class="card"><div class="row"><span class="code">${esc(f.code)}</span><span class="tag"><span class="sev s${f.sev}"></span>${esc(f.sevLabel)}</span><div class="spacer"></div><button class="btn sec small" data-act="back">←</button></div>
      <h2 style="margin-top:.6rem">${esc(f.title)}</h2><p>${esc(f.desc)}</p></div>`; },

  renderAdmin(){ return `<div class="card"><h3>Administration</h3><p class="muted">Fonctions conservées : fiches personnalisées, TSB, rappels, mises à jour, tiers, audit, sécurité (voir versions précédentes).</p></div>`; },
  bindView(){ const v=App.state.view; if(v==="search"){const q=$("#q"); if(q) q.onkeydown=e=>{if(e.key==="Enter")App.doSearch();};} if(v==="codes") App.applyCodesFilter(); },

  openTsb(id){ const t=TSB.byId(id); if(!t) return;
    const bg=document.createElement("div"); bg.className="modal-bg";
    bg.innerHTML=`<div class="modal"><div class="row"><span class="tag b">${esc(TSB.SRC[t.src]||t.src)}</span><span class="code">${esc(t.id)}</span><span class="tag">Énergie : ${(t.en&&t.en.length)?esc(t.en.join("/")):"toutes"}</span><div class="spacer"></div><button class="btn sec small" data-act="modal-close">Fermer</button></div>
      <h2 style="margin-top:.6rem">${esc(t.comp)}</h2><p><b>Problème :</b> ${esc(t.prob)}</p><p><b>Symptômes :</b> ${esc(t.sym.join(" • "))}</p><p><b>Solution :</b> ${esc(t.fix)}</p></div>`;
    document.body.appendChild(bg); }
};

document.addEventListener("click", e => {
  const el=e.target.closest("[data-act]"); if(!el) return; const S=App.state;
  switch(el.dataset.act){
    case "nav": navigate("#/"+el.dataset.view); break;
    case "logout": Auth.forgetDevice(); Session.clear(); location.hash=""; App.renderLogin(); break;
    case "share": App.doShare(); break;
    case "install": App.doInstall(); break;
    case "search-go": App.doSearch(); break;
    case "codes-go": App.applyCodesFilter(); break;
    case "recalls-go": S.recBrand=$("#r-brand").value; S.recYear=$("#r-year").value; App.route(); break;
    case "page-prev": S.page--; App.renderPage(); break;
    case "page-next": S.page++; App.renderPage(); break;
    case "open-fiche": navigate("#/fiche/"+encodeURIComponent(el.dataset.key)); break;
    case "open-rappel": navigate("#/rappel/"+encodeURIComponent(el.dataset.id)); break;
    case "open-tsb": App.openTsb(el.dataset.id); break;
    case "back": history.back(); break;
    case "veh-cat": S.vehCat=el.dataset.cat; S.vehBrand=""; S.vehModel=""; S.vehEngine=""; App.route(); break;
    case "veh-brand": S.vehBrand=el.dataset.brand; S.vehModel=""; S.vehEngine=""; App.route(); break;
    case "veh-model": S.vehModel=el.dataset.model; S.vehEngine=""; App.route(); break;
    case "veh-engine": S.vehEngine=el.dataset.engine; App.route(); break;
    case "veh-reset": if(el.dataset.level==="brands"){S.vehBrand="";S.vehModel="";S.vehEngine="";} if(el.dataset.level==="models"){S.vehModel="";S.vehEngine="";} if(el.dataset.level==="engines"){S.vehEngine="";} App.route(); break;
    case "modal-close": el.closest(".modal-bg").remove(); break;
  }
});
App.start();
