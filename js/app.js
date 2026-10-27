"use strict";
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const isAdmin = () => Session.role() === "admin";
function toast(msg){
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 3800);
}
function navigate(h){ if (location.hash === h) App.route(); else location.hash = h; }

const App = {
  deferredPrompt: null,
  state: { view:"search", page:0, list:null, filterLetter:"", filterBrand:"",
           vehBrand:"", vehModel:"", vehEngine:"", vehCat:"", recBrand:"", recYear:"" },

  async start(){
    await Auth.init();
    if (!Session.get() && await Auth.autoLogin()) { /* souvenir appareil */ }
    window.addEventListener("hashchange", () => App.route());
    window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); App.deferredPrompt = e; });
    window.addEventListener("online", () => { App.updateNet(); toast("🌐 Connexion rétablie (4G/5G/Wi‑Fi)"); });
    window.addEventListener("offline", () => { App.updateNet(); toast("⛔ Hors ligne — mode local actif (sauvegarde incluse)"); });
    Updater.checkAndApply().then(r => { if (r.ok) toast("✅ Mise à jour v" + r.version + " appliquée automatiquement"); }).catch(() => {});
    App.route();
  },

  updateNet(){
    const on = navigator.onLine;
    $$("[id^=netbadge]").forEach(el => { el.textContent = on ? "🌐 connecté" : "⛔ hors ligne"; el.className = "tag " + (on ? "on" : "off"); });
  },
  async doShare(){
    const url = location.origin + location.pathname;
    const data = { title:"Ma Tech by Kevin", text:"Ma Tech by Kevin — 21 000 fiches DTC, pannes connues/TSB & rappels 2017-2026 (hors ligne inclus)", url };
    try{
      if (navigator.share){ await navigator.share(data); toast("✅ Lien partagé"); }
      else { await navigator.clipboard.writeText(url); toast("🔗 Lien copié : " + url); }
    }catch(e){ toast("Partage annulé"); }
  },
  async doInstall(){
    if (App.deferredPrompt){ App.deferredPrompt.prompt(); const r = await App.deferredPrompt.userChoice; toast(r.outcome === "accepted" ? "📥 Installation lancée" : "Installation annulée"); App.deferredPrompt = null; }
    else toast("ℹ️ Menu navigateur → « Installer l'application » / « Ajouter à l'écran d'accueil »");
  },

  route(){
    try{
      if (!Session.get()) return App.renderLogin();
      const h = location.hash.replace(/^#\//,"") || "search";
      const [view, arg] = h.split("/");
      if (view === "admin" && !isAdmin()){ if (location.hash !== "#/search") location.hash = "#/search"; return; }
      App.state.view = view;
      if (view === "fiche" && arg) return App.renderShell(App.renderFiche(decodeURIComponent(arg)));
      if (view === "rappel" && arg) return App.renderShell(App.renderRappel(decodeURIComponent(arg)));
      const V = { search: App.renderSearch, codes: App.renderCodes, veh: App.renderVeh, recalls: App.renderRecalls, admin: App.renderAdmin };
      App.renderShell((V[view] || App.renderSearch)());
      window.scrollTo(0, 0);
    }catch(err){
      console.error(err);
      $("#app").innerHTML = `<div class="card"><h1>⚠️ Erreur d'affichage</h1><p class="muted">${esc(err.message)}</p>
        <button class="btn" onclick="location.hash='#/search';location.reload()">Recharger l'application</button></div>`;
    }
  },

  renderShell(body){
    const role = Session.role();
    $("#app").innerHTML = `
    <div class="topbar">
      <div class="logo">⚙️ Ma Tech <span>by Kevin</span></div>
      <span class="badge ${role==='admin'?'b-admin':'b-tier'}">${role==='admin'?'ADMIN':'ACCÈS TIERS'}</span>
      <span class="tag" id="netbadge"></span>
      <div class="spacer"></div>
      <button class="btn sec small" data-act="share" title="Partager">🔗</button>
      <button class="btn sec small" data-act="install" title="Installer">📥</button>
      <button class="btn sec small" data-act="logout">Déconnexion</button>
    </div>
    <nav class="tabs" style="padding:.4rem 1rem;background:var(--panel);border-bottom:1px solid var(--bd);display:flex">
      <button type="button" data-act="nav" data-view="search" class="${App.state.view==='search'?'active':''}">🔍 Recherche</button>
      <button type="button" data-act="nav" data-view="codes" class="${App.state.view==='codes'?'active':''}">📟 Codes DTC</button>
      <button type="button" data-act="nav" data-view="veh" class="${App.state.view==='veh'?'active':''}">🚗 Véhicules</button>
      <button type="button" data-act="nav" data-view="recalls" class="${App.state.view==='recalls'||App.state.view==='rappel'?'active':''}">📢 Rappels</button>
      ${isAdmin()?'<button type="button" data-act="nav" data-view="admin" class="'+(App.state.view==='admin'?'active':'')+'">🛠️ Administration</button>':''}
    </nav>
    ${role==='tier'?'<div style="background:#102a3a;color:#5ec1ff;text-align:center;padding:.35rem;font-size:.8rem">Mode accès tiers — consultation seule • mises à jour reçues automatiquement</div>':''}
    <main>${body}</main>
    <div class="footer">Ma Tech by Kevin v${CONFIG.VERSION} — pack v${Updater.applied()} — 21 000 fiches DTC + pannes connues/TSB + rappels — motorisations & puissances réelles 2017 → 2026</div>`;
    App.updateNet();
    App.bindView();
  },

  /* ---- LOGIN : aucun mot de passe pré-enregistré visible ---- */
  renderLogin(){
    const setup = !Auth.hasAdmin();
    $("#app").innerHTML = `
    <div class="login-wrap"><div class="card login-box">
      <div class="logo" style="font-size:1.4rem;margin-bottom:.3rem">⚙️ Ma Tech <span>by Kevin</span></div>
      <p class="muted" style="margin-bottom:1rem">21 000 fiches + pannes connues/TSB + rappels • 2017-2026 • hors ligne</p>
      ${setup ? `
        <h3>🔐 Première utilisation — définir le mot de passe administrateur</h3>
        <label>Identifiant administrateur</label><input id="s-user" autocomplete="username" placeholder="admin">
        <label>Mot de passe (6 caractères min)</label><input id="s-pass" type="password" autocomplete="new-password">
        <label>Confirmation</label><input id="s-conf" type="password" autocomplete="new-password">
        <div style="margin-top:.8rem"><button class="btn" id="s-go" style="width:100%">Créer et ouvrir la session</button></div>
        <div class="err-msg" id="s-err"></div>
        <p class="muted" style="margin-top:.6rem">Aucun mot de passe n'est pré-enregistré : il sera demandé à chaque utilisation, ou mémorisable sur cet appareil.</p>`
      : `
        <label>Identifiant administrateur</label><input id="l-user" autocomplete="username">
        <label>Mot de passe</label><input id="l-pass" type="password" autocomplete="current-password">
        <label class="row" style="margin-top:.5rem;font-size:.82rem;color:var(--txt)"><input type="checkbox" id="l-rem" style="width:auto"> Se souvenir sur cet appareil (PC / téléphone)</label>
        <div style="margin-top:.8rem"><button class="btn" id="l-admin" style="width:100%">Connexion administrateur</button></div>
        <div class="err-msg" id="l-err"></div>`}
      <hr style="border-color:var(--bd);margin:1rem 0">
      <label>Code d'accès tiers (lecture seule)</label><input id="l-code" placeholder="TIER-XXXXXX" style="text-transform:uppercase">
      <div style="margin-top:.8rem"><button class="btn sec" id="l-tier" style="width:100%">Accéder en mode tiers</button></div>
      <div class="err-msg" id="l-err2"></div>
      <div class="row" style="margin-top:1rem;justify-content:center">
        <span class="tag" id="netbadge"></span>
        <button class="btn sec small" data-act="share">🔗 Partager</button>
        <button class="btn sec small" data-act="install">📥 Installer</button>
      </div>
    </div></div>`;
    App.updateNet();
    if (setup){
      $("#s-go").onclick = async () => {
        const p = $("#s-pass").value, c = $("#s-conf").value;
        if (p.length < 6) return $("#s-err").textContent = "6 caractères minimum.";
        if (p !== c) return $("#s-err").textContent = "Confirmation différente.";
        await Auth.setupAdmin($("#s-user").value.trim() || "admin", p);
        location.hash = "#/search"; App.route();
      };
    } else {
      $("#l-admin").onclick = async () => {
        const ok = await Auth.loginAdmin($("#l-user").value.trim(), $("#l-pass").value, $("#l-rem").checked);
        if (ok){ location.hash = "#/search"; App.route(); }
        else $("#l-err").textContent = "Identifiants incorrects.";
      };
    }
    $("#l-tier").onclick = () => {
      if (Auth.loginTier($("#l-code").value)){ location.hash = "#/search"; App.route(); }
      else $("#l-err2").textContent = "Code tiers invalide, inactif ou expiré.";
    };
  },

  renderSearch(){
    return `
    <div class="card"><h1>Recherche automatique pannes + rappels + bulletins</h1>
      <p class="muted">Code DTC, texte libre, marque, modèle, motorisation ou symptôme (chaîne, AdBlue, ressorts…).</p>
      <div class="row" style="margin-top:.7rem">
        <input id="q" placeholder="P0420, chaîne 1.5 HDI, AdBlue, ressorts Bigster…" style="flex:1;min-width:200px">
        <button class="btn" data-act="search-go">Rechercher</button>
      </div></div>
    <div class="card"><h3>📶 Connexion, partage & sauvegarde locale</h3>
      <div class="row"><span class="tag" id="netbadge2"></span>
        <button class="btn sec small" data-act="share">🔗 Partager l'appli</button>
        <button class="btn sec small" data-act="install">📥 Installer / télécharger</button></div>
      <p class="muted" style="margin-top:.5rem">4G/5G/Wi‑Fi et <b>hors ligne</b> : base et modifications enregistrées localement.</p></div>
    <div class="grid g4">
      <div class="card stat"><b>21 000</b>fiches DTC</div>
      <div class="card stat"><b>${TSB.all().length}</b>pannes connues/TSB</div>
      <div class="card stat"><b>${Recalls.all().length}</b>rappels</div>
      <div class="card stat"><b>${BRANDS.length}</b>marques classées</div>
    </div>
    <div id="tsb-results"></div><div id="results"></div><div id="recall-results"></div>`;
  },

  doSearch(){
    const q = $("#q").value.trim();
    if (!q) return;
    /* 1) bulletins / pannes connues */
    const tsbs = TSB.search(q);
    $("#tsb-results").innerHTML = tsbs.length ? `
      <div class="card"><h3>📚 Pannes connues & bulletins (${tsbs.length})</h3>
      <table><thead><tr><th>Source</th><th>Réf.</th><th>Marques</th><th>Composant / problème</th><th>Sév.</th></tr></thead><tbody>
      ${tsbs.map(t=>`<tr data-act="open-tsb" data-id="${esc(t.id)}" style="cursor:pointer">
        <td><span class="tag b">${esc(TSB.SRC[t.src]||t.src)}</span></td><td class="muted">${esc(t.ref)}</td>
        <td>${esc(t.brands.slice(0,3).join(", "))}</td><td><b>${esc(t.comp)}</b> — ${esc(t.prob.slice(0,60))}</td>
        <td><span class="sev s${t.sev}"></span></td></tr>`).join("")}
      </tbody></table></div>` : "";
    /* 2) codes DTC */
    let keys = [];
    if (/^[pbcu][0-3]/i.test(q)){
      keys = DT.findByCode(q).map(e => e.key);
      if (!keys.length && /^[pbcu][0-3][0-9a-f]{3}$/i.test(q)) keys = [q.toUpperCase()];
    } else {
      const needle = q.toLowerCase();
      const vehBrands = new Set();
      BRANDS.forEach(b => {
        if (b.n.toLowerCase().includes(needle) || b.models.some(m=>m[0].toLowerCase().includes(needle)) || b.pool.some(e=>e.toLowerCase().includes(needle)))
          vehBrands.add(b.n);
      });
      for (let i = 0; i < CONFIG.TOTAL_FICHES && keys.length < 300; i++){
        const f = DT.ficheAt(i);
        if (f.title.toLowerCase().includes(needle) ||
            (vehBrands.size && ((f.brand && vehBrands.has(f.brand)) || f.brands.some(x => vehBrands.has(x)))))
          keys.push(f.key);
      }
    }
    App.state.list = keys.slice(0, 500); App.state.page = 0;
    $("#results").innerHTML = App.listHTML(App.state.list, "fiche(s) panne — 500 max");
    /* 3) rappels */
    const recs = Recalls.search(q.toLowerCase());
    $("#recall-results").innerHTML = recs.length ? `
      <div class="card"><h3>📢 Rappels correspondants (${recs.length})</h3>
      <table><thead><tr><th>Référence</th><th>Marques</th><th>Composant</th><th>Période</th><th>Statut</th></tr></thead><tbody>
      ${recs.map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer">
        <td class="code">${esc(r.id)}</td><td>${esc(r.brands.slice(0,3).join(", "))}${r.brands.length>3?'…':''}</td>
        <td>${esc(r.comp)}</td><td class="muted">${r.y0}-${r.y1}</td>
        <td>${r.status==='open'?'<span style="color:var(--warn)">ouverte</span>':'<span class="muted">clôturée</span>'}</td></tr>`).join("")}
      </tbody></table></div>` : "";
  },

  openTsb(id){
    const t = TSB.byId(id); if (!t) return;
    const bg = document.createElement("div"); bg.className = "modal-bg";
    bg.innerHTML = `<div class="modal"><div class="row"><span class="tag b">${esc(TSB.SRC[t.src]||t.src)}</span>
      <span class="code">${esc(t.id)}</span><span class="muted">${esc(t.ref)}</span>
      <span class="tag"><span class="sev s${t.sev}"></span>${["Mineure","Modérée","Sérieuse","Critique"][t.sev-1]}</span>
      <div class="spacer"></div><button class="btn sec small" data-act="modal-close">Fermer</button></div>
      <h2 style="margin-top:.6rem">${esc(t.comp)}</h2>
      <p style="margin-top:.4rem"><b>Problème connu :</b> ${esc(t.prob)}</p>
      <p><b>Symptômes :</b> ${esc(t.sym.join(" • "))}</p>
      <p><b>Solution / bulletin :</b> ${esc(t.fix)}</p>
      <div class="grid g2" style="margin-top:.8rem">
        <div><h3>Marques / modèles</h3><div style="margin-top:.3rem">${t.brands.map(x=>`<span class="tag b">${esc(x)}</span>`).join("")}
          ${(t.models&&t.models.length)?t.models.map(x=>`<span class="tag">${esc(x)}</span>`).join(""):'<span class="muted">tous modèles</span>'}</div></div>
        <div><h3>Motorisations / années</h3><div style="margin-top:.3rem">${(t.eng&&t.eng.length)?t.eng.map(x=>`<span class="tag">⚙️ ${esc(x)}</span>`).join(""):'<span class="muted">toutes</span>'}
          <span class="tag">${t.y0} → ${t.y1}</span></div></div></div>
      ${t.dtc.length?`<div style="margin-top:.8rem"><h3>Codes DTC associés</h3><div style="margin-top:.3rem">${t.dtc.map(c=>`<button class="btn sec small" style="margin:.1rem" data-act="open-fiche" data-key="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>`:''}
    </div>`;
    document.body.appendChild(bg);
  },

  renderCodes(){
    return `
    <div class="card"><h1>Tous les codes DTC</h1>
      <div class="row" style="margin-top:.5rem">
        <select id="f-letter" style="max-width:160px"><option value="">Tous systèmes</option>
          ${["P","B","C","U"].map(l=>`<option ${App.state.filterLetter===l?'selected':''}>${l}</option>`).join("")}</select>
        <select id="f-brand" style="max-width:200px"><option value="">Génériques (toutes marques)</option>
          ${BRANDS.map(b=>`<option ${App.state.filterBrand===b.n?'selected':''}>${b.n}</option>`).join("")}</select>
        <button class="btn" data-act="codes-go">Filtrer</button>
      </div></div>
    <div id="results"></div><div id="pager" class="pager"></div>`;
  },
  applyCodesFilter(){
    const L = $("#f-letter") ? $("#f-letter").value : "";
    const B = $("#f-brand") ? $("#f-brand").value : "";
    App.state.filterLetter = L; App.state.filterBrand = B;
    const keys = [];
    if (B){
      const bi = BRANDS.findIndex(b => b.n === B), n = BRANDS.length, per = Math.ceil(5000/n);
      for (let k = 0; k < per; k++){ const j = k*n + bi; if (j >= 5000) break; keys.push("P1" + String((j*7)%1000).padStart(3,"0") + "@" + B); }
    } else {
      const li = L ? ["P","B","C","U"].indexOf(L) : -1;
      const start = li >= 0 ? li*4000 : 0, end = li >= 0 ? start+4000 : 16000;
      for (let i = start; i < end; i++) keys.push(DT.codeFromIndex(i));
    }
    App.state.list = keys; App.state.page = 0; App.renderPage();
  },
  renderPage(){
    const keys = App.state.list || [];
    const pages = Math.max(1, Math.ceil(keys.length / CONFIG.PAGE_SIZE));
    App.state.page = Math.min(Math.max(0, App.state.page), pages-1);
    const slice = keys.slice(App.state.page*CONFIG.PAGE_SIZE, App.state.page*CONFIG.PAGE_SIZE + CONFIG.PAGE_SIZE);
    $("#results").innerHTML = App.listHTML(slice, keys.length + " fiche(s)");
    $("#pager").innerHTML = pages > 1 ? `
      <button class="btn sec small" data-act="page-prev" ${App.state.page===0?'disabled':''}>◀ Préc.</button>
      <span class="muted">Page ${App.state.page+1} / ${pages}</span>
      <button class="btn sec small" data-act="page-next" ${App.state.page>=pages-1?'disabled':''}>Suiv. ▶</button>` : "";
  },
  listHTML(keys, label){
    if (!keys || !keys.length) return `<div class="card muted">Aucun résultat.</div>`;
    const rows = [];
    keys.forEach(k => {
      const f = resolveFiche(k);
      if (!f) return;
      rows.push(`<tr data-act="open-fiche" data-key="${esc(k)}" style="cursor:pointer">
        <td class="code">${esc(f.code)}</td><td>${esc(f.title.slice(0,90))}${f.title.length>90?'…':''}</td>
        <td><span class="sev s${f.sev}"></span>${esc(f.sevLabel)}</td>
        <td class="muted">${esc(f.brands.slice(0,2).join(", "))}${f.brands.length>2?'…':''}</td></tr>`);
    });
    return `<div class="card"><div class="muted" style="margin-bottom:.5rem">${esc(label)}</div>
    <table><thead><tr><th>Code</th><th>Description</th><th>Sév.</th><th>Marques</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  },

  renderVeh(){
    const S = App.state;
    const cats = [["","Toutes"],["FR","Françaises"],["EU","Européennes"],["US","Américaines"],["AS","Asiatiques"]];
    const b = S.vehBrand ? findBrand(S.vehBrand) : null;
    if (!b){
      const list = BRANDS.filter(x => !S.vehCat || x.o === S.vehCat);
      return `<div class="card"><h1>Toutes les marques 2017-2026</h1>
        <div class="row" style="margin-top:.5rem">${cats.map(c=>`<button class="btn ${S.vehCat===c[0]?'':'sec'} small" data-act="veh-cat" data-cat="${c[0]}">${c[1]}</button>`).join("")}</div>
        <p class="muted" style="margin-top:.5rem">Marque → modèle → motorisation : DTC + pannes connues/TSB + rappels appliqués automatiquement.</p></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">
        ${list.map(x=>`<div class="card" style="cursor:pointer;margin:0" data-act="veh-brand" data-brand="${esc(x.n)}">
          <h3>${esc(x.n)}</h3><div class="muted">${CATS[x.o]} • ${x.models.length} modèles</div></div>`).join("")}
        </div>`;
    }
    const models = brandModels(b);
    const model = S.vehModel ? models.find(m => m.name === S.vehModel) : null;
    if (!model){
      return `<div class="card"><div class="row"><h1>🚗 ${esc(b.n)} — modèles (${CATS[b.o]})</h1><div class="spacer"></div>
        <button class="btn sec small" data-act="veh-reset" data-level="brands">← Marques</button></div></div>
        <div class="card"><table><thead><tr><th>Modèle</th><th>Millésimes</th><th>Motorisations</th></tr></thead><tbody>
        ${models.map(m=>`<tr data-act="veh-model" data-model="${esc(m.name)}" style="cursor:pointer"><td><b>${esc(m.name)}</b></td><td class="muted">${m.y0} → 2026</td><td class="muted">${m.engines.length} réelles</td></tr>`).join("")}
        </tbody></table></div>`;
    }
    if (!S.vehEngine){
      return `<div class="card"><div class="row"><h1>${esc(b.n)} ${esc(model.name)}</h1><div class="spacer"></div>
        <button class="btn sec small" data-act="veh-reset" data-level="models">← Modèles</button></div>
        <p class="muted">Millésimes ${model.y0} → 2026 — motorisations & puissances réelles :</p></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">
        ${model.engines.map(e=>`<div class="card" style="cursor:pointer;margin:0" data-act="veh-engine" data-engine="${esc(e)}">
          <h3>⚙️ ${esc(e)}</h3><span class="tag b">${esc(DT.fuelOf(e))}</span> <span class="tag">${Recalls.powerOf(e)||"—"} ch</span></div>`).join("")}
        </div>`;
    }
    const modelKey = model.name + "|" + model.y0;
    const res = DT.faultsForVehicle(b.n, modelKey, S.vehEngine);
    const recs = Recalls.forVehicle(b.n, modelKey, S.vehEngine);
    const tsbs = TSB.forVehicle(b.n, model.name, model.y0, S.vehEngine);
    const sysF = systemFaultsFor(b.n, modelKey, S.vehEngine);
    const groups = {};
    sysF.forEach(f => { (groups[f.sys] = groups[f.sys] || []).push(f); });
    return `
    <div class="card"><div class="row" style="flex-wrap:wrap">
      <h1>${esc(b.n)} ${esc(model.name)}</h1>
      <span class="tag b">${esc(S.vehEngine)}</span><span class="tag">${esc(res.fuel)}</span>
      <span class="tag">${Recalls.powerOf(S.vehEngine)||"—"} ch</span><span class="tag">${model.y0} → 2026</span>
      <div class="spacer"></div><button class="btn sec small" data-act="veh-reset" data-level="engines">← Motorisations</button>
    </div>
    <p class="muted" style="margin-top:.4rem"><b>${res.faults.length}</b> DTC • <b>${tsbs.length}</b> panne(s) connue(s)/TSB • <b>${sysF.length}</b> pannes système • <b>${recs.length}</b> rappel(s).</p></div>
    ${tsbs.length ? `<div class="card"><h3>📚 Pannes connues & bulletins techniques (TSB / NHTSA / Safety Gate / RappelConso)</h3>
      <table><thead><tr><th>Source</th><th>Réf.</th><th>Composant / problème</th><th>Symptômes</th><th>Solution</th><th>Sév.</th></tr></thead><tbody>
      ${tsbs.map(t=>`<tr data-act="open-tsb" data-id="${esc(t.id)}" style="cursor:pointer">
        <td><span class="tag b">${esc(TSB.SRC[t.src]||t.src)}</span></td><td class="muted">${esc(t.ref)}</td>
        <td><b>${esc(t.comp)}</b><div class="muted">${esc(t.prob.slice(0,70))}</div></td>
        <td class="muted">${esc(t.sym.slice(0,2).join(" • "))}</td><td class="muted">${esc(t.fix.slice(0,60))}</td>
        <td><span class="sev s${t.sev}"></span></td></tr>`).join("")}
      </tbody></table></div>` : `<div class="card muted">Aucune panne connue/TSB référencée pour cette configuration.</div>`}
    ${recs.length ? `<div class="card"><h3>📢 Campagnes de rappels applicables</h3>
      <table><thead><tr><th>Référence</th><th>Composant</th><th>Risque</th><th>Période</th><th>Statut</th></tr></thead><tbody>
      ${recs.map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer">
        <td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td><td>${esc(r.risk.slice(0,60))}</td>
        <td class="muted">${r.y0}-${r.y1}</td>
        <td>${r.status==='open'?'<span style="color:var(--warn)">ouverte</span>':'<span class="muted">clôturée</span>'}</td></tr>`).join("")}
      </tbody></table></div>` : `<div class="card muted">Aucune campagne de rappel connue pour cette configuration.</div>`}
    ${Object.keys(groups).map(g=>`<div class="card"><h3>🧰 ${esc(g)}</h3>
      ${groups[g].map(f=>`<div class="sysfault">
        <div class="row"><b>${esc(f.comp)}</b><span class="muted">— ${esc(f.fault)}</span>
          <span class="tag"><span class="sev s${f.sev}"></span>${esc(f.sevLabel)}</span></div>
        <p class="muted" style="margin:.3rem 0"><b>Symptômes :</b> ${esc(f.symptoms.join(" • "))}</p>
        <p class="muted"><b>Causes :</b> ${esc(f.causes.join(" • "))}</p>
        <p class="muted"><b>Solutions :</b> ${esc(f.fixes.join(" • "))}</p>
        <div>${f.dtcs.map(c=>`<button class="btn sec small" style="margin:.1rem" data-act="open-fiche" data-key="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      </div>`).join("")}</div>`).join("")}
    ${App.listHTML(res.faults.map(f=>f.key), "Codes DTC connus — " + esc(b.n) + " " + esc(model.name) + " " + esc(S.vehEngine))}`;
  },

  renderRecalls(){
    const S = App.state;
    let list = Recalls.all();
    if (S.recBrand) list = list.filter(r => r.brands.includes(S.recBrand));
    if (S.recYear) list = list.filter(r => !(+S.recYear > r.y1 || +S.recYear < r.y0));
    return `
    <div class="card"><h1>📢 Campagnes de rappels (${list.length})</h1>
      <div class="row" style="margin-top:.5rem">
        <select id="r-brand" style="max-width:200px"><option value="">Toutes marques</option>
          ${BRANDS.map(b=>`<option ${S.recBrand===b.n?'selected':''}>${b.n}</option>`).join("")}</select>
        <select id="r-year" style="max-width:140px"><option value="">Toutes années</option>
          ${CONFIG.YEARS.map(y=>`<option ${S.recYear==y?'selected':''}>${y}</option>`).join("")}</select>
        <button class="btn" data-act="recalls-go">Filtrer</button>
      </div></div>
    <div class="card"><table><thead><tr><th>Référence</th><th>Marques</th><th>Composant</th><th>Période</th><th>Statut</th></tr></thead><tbody>
    ${list.slice(0,300).map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer">
      <td class="code">${esc(r.id)}</td><td>${esc(r.brands.slice(0,3).join(", "))}${r.brands.length>3?'…':''}</td>
      <td>${esc(r.comp)}</td><td class="muted">${r.y0}-${r.y1}</td>
      <td>${r.status==='open'?'<span style="color:var(--warn)">ouverte</span>':'<span class="muted">clôturée</span>'}</td></tr>`).join("")}
    </tbody></table></div>`;
  },

  renderRappel(id){
    const r = Recalls.byId(id);
    if (!r) return `<div class="card">Campagne introuvable. <a href="#/recalls">Retour</a></div>`;
    return `
    <div class="card"><div class="row"><span class="code" style="font-size:1.2rem">${esc(r.id)}</span>
      <span class="tag">${r.status==='open'?'⚠️ ouverte':'clôturée'}</span>
      <span class="tag">${r.y0}-${r.y1}</span><span class="tag">publiée ${esc(r.date)}</span>
      <div class="spacer"></div><button class="btn sec small" data-act="back">← Retour</button></div>
      <h2 style="margin-top:.6rem">${esc(r.comp)}</h2>
      <p style="margin-top:.4rem"><b>Risque :</b> ${esc(r.risk)}</p>
      <p><b>Solution constructeur :</b> ${esc(r.fix)}</p></div>
    <div class="grid g2">
      <div class="card"><h3>Marques</h3><div style="margin-top:.4rem">${r.brands.map(x=>`<span class="tag b">${esc(x)}</span>`).join("")}</div>
        <h3 style="margin-top:.8rem">Modèles</h3><div style="margin-top:.4rem">${(r.models&&r.models.length)?r.models.map(x=>`<span class="tag">${esc(x)}</span>`).join(""):'<span class="muted">Tous modèles</span>'}</div>
        <h3 style="margin-top:.8rem">Motorisations / puissances</h3><div style="margin-top:.4rem">
          ${(r.fuels&&r.fuels.length)?r.fuels.map(x=>`<span class="tag">⚡ ${esc(x)}</span>`).join(""):'<span class="muted">Toutes</span>'}
          ${r.pw?`<span class="tag b">${r.pw[0]} → ${r.pw[1]} ch</span>`:''}</div></div>
      <div class="card"><h3>Codes DTC associés</h3><div style="margin-top:.4rem">
        ${r.dtcs.map(c=>`<button class="btn sec small" style="margin:.15rem" data-act="open-fiche" data-key="${esc(c)}">${esc(c)}</button>`).join("")}</div>
        <p class="muted" style="margin-top:.8rem">Vérification : 🚗 Véhicules → marque → modèle → motorisation.</p></div>
    </div>`;
  },

  renderFiche(key){
    const f = resolveFiche(key);
    if (!f) return `<div class="card">Fiche supprimée ou introuvable. <a href="#/codes">Retour aux codes</a></div>`;
    const edited = Store.getOverride(key) || Store.customs().some(c => c.key === key);
    return `
    <div class="card"><div class="row"><span class="code" style="font-size:1.3rem">${esc(f.code)}</span>
      ${f.brand?`<span class="tag b">${esc(f.brand)}</span>`:`<span class="tag">${f.generic?'Générique OBD-II':'Spécifique constructeur'}</span>`}
      <span class="tag"><span class="sev s${f.sev}"></span>${esc(f.sevLabel)}</span>
      <span class="tag">Millésimes ${esc(f.years)}</span>
      <div class="spacer"></div><button class="btn sec small" data-act="back">← Retour</button>
      ${isAdmin()?`<button class="btn small" data-act="fiche-edit" data-key="${esc(key)}">✏️ Modifier</button><button class="btn danger small" data-act="fiche-del" data-key="${esc(key)}">🗑️ Supprimer</button>`:''}
    </div>
    <h2 style="margin-top:.6rem">${esc(f.title)}</h2>
    <p style="margin-top:.4rem">${esc(f.desc)}</p>
    ${edited?'<div class="ok-msg">✓ Fiche modifiée/personnalisée par l\'administrateur</div>':''}</div>
    <div class="grid g2">
      <div class="card"><h3>🩺 Symptômes</h3><ul style="padding-left:1.2rem;margin-top:.4rem">${f.symptoms.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>
      <div class="card"><h3>🔧 Causes probables</h3><ul style="padding-left:1.2rem;margin-top:.4rem">${f.causes.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>
    </div>
    <div class="card"><h3>✅ Solutions / contrôles</h3><ol style="padding-left:1.4rem;margin-top:.4rem">${f.solutions.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div>
    <div class="card"><h3>🚗 Véhicules concernés (2017-2026)</h3>
      <div style="margin-top:.4rem">${f.brands.map(x=>`<span class="tag b">${esc(x)}</span>`).join("")}</div>
      <div style="margin-top:.4rem">${f.motors.map(m=>`<span class="tag">⚡ ${esc(m)}</span>`).join("")}</div></div>`;
  },

  renderAdmin(){
    return `
    <div class="row" style="margin-bottom:1rem">
      <button class="btn small" id="a-new">➕ Nouvelle fiche</button>
      <button class="btn sec small" id="a-export">⬇️ Export / sauvegarde</button>
      <label class="btn sec small" style="cursor:pointer">⬆️ Import<input type="file" id="a-import" accept=".json" hidden></label>
      <div class="spacer"></div>
      <select id="a-tab" style="max-width:240px">
        <option value="customs">Fiches personnalisées</option>
        <option value="tsb">📚 Pannes connues / TSB</option>
        <option value="recalls">Rappels personnalisés</option>
        <option value="update">📦 Mise à jour APK</option>
        <option value="tiers">Accès tiers</option>
        <option value="audit">Journal d'audit</option>
        <option value="secu">Sécurité</option>
      </select>
    </div><div id="a-body"></div>`;
  },
  adminTab(t){
    const B = $("#a-body");
    if (t === "customs"){
      const customs = Store.customs();
      const ovs = Object.keys(JSON.parse(localStorage.getItem(CONFIG.K.overrides) || "{}"));
      B.innerHTML = `<div class="card"><h3>Fiches personnalisées (${customs.length})</h3>
        ${customs.length?`<table><thead><tr><th>Code</th><th>Titre</th><th></th></tr></thead><tbody>
        ${customs.map((c,i)=>`<tr><td class="code">${esc(c.code)}${c.brand?"@"+esc(c.brand):""}</td><td>${esc(c.title.slice(0,60))}</td>
          <td><button class="btn small sec" data-ce="${i}">✏️</button> <button class="btn small danger" data-cd="${i}">🗑️</button></td></tr>`).join("")}
        </tbody></table>`:'<p class="muted">Aucune.</p>'}</div>
      <div class="card"><h3>Fiches standard modifiées (${ovs.length})</h3>
        ${ovs.length?ovs.map(k=>`<span class="tag b">${esc(k)}</span>`).join(""):'<p class="muted">Aucune surcharge.</p>'}</div>`;
      B.querySelectorAll("[data-ce]").forEach(b => b.onclick = () => App.openEditor(Store.customs()[+b.dataset.ce]));
      B.querySelectorAll("[data-cd]").forEach(b => b.onclick = () => { if (confirm("Supprimer ?")){ Store.removeCustom(+b.dataset.cd); App.adminTab("customs"); }});
    }
    if (t === "tsb"){
      const list = TSB.customs();
      B.innerHTML = `<div class="card"><h3>Ajouter une panne connue / bulletin</h3>
        <div class="grid g2">
          <div><label>Source</label><select id="tb-src">${Object.keys(TSB.SRC).map(k=>`<option value="${k}">${TSB.SRC[k]}</option>`).join("")}</select></div>
          <div><label>Référence</label><input id="tb-ref"></div>
          <div><label>Marque</label><select id="tb-brand">${BRANDS.map(b=>`<option>${esc(b.n)}</option>`).join("")}</select></div>
          <div><label>Modèles (virgule, vide = tous)</label><input id="tb-models"></div>
          <div><label>Motorisations (virgule : 1.5 hdi, 1.2 puretech…)</label><input id="tb-eng"></div>
          <div><label>Années</label><div class="row"><input id="tb-y0" type="number" value="2017"><input id="tb-y1" type="number" value="2026"></div></div>
        </div>
        <label>Composant</label><input id="tb-comp"><label>Problème connu</label><textarea id="tb-prob" rows="2"></textarea>
        <label>Symptômes (virgule)</label><input id="tb-sym"><label>Solution / bulletin</label><input id="tb-fix">
        <label>Codes DTC (virgule)</label><input id="tb-dtc">
        <button class="btn" id="tb-add" style="margin-top:.7rem">Ajouter</button><div id="tb-msg"></div></div>
      <div class="card"><h3>Entrées personnalisées (${list.length})</h3>
        ${list.length?`<table><tbody>${list.map((x,i)=>`<tr><td class="code">${esc(x.id)}</td><td>${esc(x.comp)}</td>
          <td><button class="btn small danger" data-td="${i}">🗑️</button></td></tr>`).join("")}</tbody></table>`:'<p class="muted">Aucune.</p>'}</div>`;
      $("#tb-add").onclick = () => {
        const e = { id:"TSB-CUST-" + Date.now().toString(36).toUpperCase(), src:$("#tb-src").value, ref:$("#tb-ref").value.trim()||"réf. perso",
          brands:[$("#tb-brand").value], models:$("#tb-models").value.split(",").map(x=>x.trim()).filter(Boolean),
          eng:$("#tb-eng").value.split(",").map(x=>x.trim()).filter(Boolean), fuels:[],
          y0:+$("#tb-y0").value, y1:+$("#tb-y1").value, comp:$("#tb-comp").value.trim()||"Composant",
          prob:$("#tb-prob").value.trim()||"Problème connu", sym:$("#tb-sym").value.split(",").map(x=>x.trim()).filter(Boolean),
          fix:$("#tb-fix").value.trim()||"Voir bulletin", dtc:$("#tb-dtc").value.split(",").map(x=>x.trim().toUpperCase()).filter(Boolean), sev:3 };
        const l = TSB.customs(); l.unshift(e); TSB.saveCustoms(l);
        Store.audit("CREER_TSB", e.id);
        $("#tb-msg").innerHTML = '<div class="ok-msg">Ajoutée (publiez la mise à jour pour diffusion).</div>';
        setTimeout(() => App.adminTab("tsb"), 1200);
      };
      B.querySelectorAll("[data-td]").forEach(b => b.onclick = () => { if (confirm("Supprimer ?")){ const l = TSB.customs(); l.splice(+b.dataset.td,1); TSB.saveCustoms(l); App.adminTab("tsb"); }});
    }
    if (t === "recalls"){
      const list = Recalls.customs();
      B.innerHTML = `<div class="card"><h3>Ajouter une campagne</h3>
        <div class="grid g2">
          <div><label>Marque</label><select id="rc-brand">${BRANDS.map(b=>`<option>${esc(b.n)}</option>`).join("")}</select></div>
          <div><label>Modèles (virgule, vide = tous)</label><input id="rc-models"></div>
          <div><label>Motorisations (Essence,Diesel,Hybride,Électrique,GPL — vide = toutes)</label><input id="rc-fuels"></div>
          <div><label>Puissance mini-maxi ch (ex : 100-160)</label><input id="rc-pw"></div>
          <div><label>Année début</label><input id="rc-y0" type="number" value="2017" min="2017" max="2026"></div>
          <div><label>Année fin</label><input id="rc-y1" type="number" value="2026" min="2017" max="2026"></div>
        </div>
        <label>Composant</label><input id="rc-comp"><label>Risque</label><input id="rc-risk">
        <label>Solution</label><input id="rc-fix"><label>Codes DTC (virgule)</label><input id="rc-dtcs">
        <button class="btn" id="rc-add" style="margin-top:.7rem">Ajouter</button><div id="rc-msg"></div></div>
      <div class="card"><h3>Campagnes personnalisées (${list.length})</h3>
        ${list.length?`<table><tbody>${list.map((r,i)=>`<tr><td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td>
          <td><button class="btn small danger" data-rd="${i}">🗑️</button></td></tr>`).join("")}</tbody></table>`:'<p class="muted">Aucune.</p>'}</div>`;
      $("#rc-add").onclick = () => {
        const pw = $("#rc-pw").value.trim();
        const r = { id:"RAP-CUST-" + Date.now().toString(36).toUpperCase(), brands:[$("#rc-brand").value],
          models:$("#rc-models").value.split(",").map(x=>x.trim()).filter(Boolean),
          fuels:$("#rc-fuels").value.split(",").map(x=>x.trim()).filter(Boolean),
          pw: pw ? pw.split("-").map(Number) : null, y0:+$("#rc-y0").value, y1:+$("#rc-y1").value,
          comp:$("#rc-comp").value.trim()||"Composant non précisé", risk:$("#rc-risk").value.trim()||"Risque non précisé",
          fix:$("#rc-fix").value.trim()||"Voir concession",
          dtcs:$("#rc-dtcs").value.split(",").map(x=>x.trim().toUpperCase()).filter(Boolean),
          status:"open", date:new Date().toISOString().slice(0,7) };
        const l = Recalls.customs(); l.unshift(r); Recalls.saveCustoms(l);
        Store.audit("CREER_RAPPEL", r.id);
        $("#rc-msg").innerHTML = '<div class="ok-msg">Ajoutée (publiez la mise à jour pour diffusion).</div>';
        setTimeout(() => App.adminTab("recalls"), 1200);
      };
      B.querySelectorAll("[data-rd]").forEach(b => b.onclick = () => { if (confirm("Supprimer ?")){ const l = Recalls.customs(); l.splice(+b.dataset.rd,1); Recalls.saveCustoms(l); App.adminTab("recalls"); }});
    }
    if (t === "update"){
      const meta = Updater.meta();
      B.innerHTML = `<div class="card"><h3>📦 Mise à jour manuelle (admin)</h3>
        <p class="muted">Appliquée ici : <b>v${Updater.applied()}</b>${meta?` — dernière : v${meta.version}`:''} • Serveur : <span id="u-srv">…</span></p>
        <div class="grid g2">
          <div><label>Nouvelle version</label><input id="u-ver" type="number" value="${Updater.applied()+1}" min="1"></div>
          <div><label>Notes</label><input id="u-notes"></div></div>
        <div class="row" style="margin-top:.8rem">
          <button class="btn" id="u-dl">⬇️ Préparer le pack</button>
          <button class="btn sec" id="u-check">🔄 Vérifier</button></div>
        <hr style="border-color:var(--bd);margin:1rem 0"><h3>Publication GitHub directe</h3>
        <div class="grid g2">
          <div><label>Jeton GitHub</label><input id="u-token" type="password"></div>
          <div><label>Owner / repo</label><div class="row"><input id="u-owner"><input id="u-repo"></div></div></div>
        <button class="btn" id="u-gh" style="margin-top:.7rem">🚀 Publier</button><div id="u-msg"></div>
        <p class="muted" style="margin-top:.8rem">Diffusion automatique à tous les utilisateurs (tiers compris) au prochain lancement.</p></div>`;
      const d = Updater.detectRepo();
      $("#u-owner").value = d.owner; $("#u-repo").value = d.repo;
      Updater.serverManifest().then(m => { $("#u-srv").textContent = m ? "v" + m.version : "aucune"; if (m) $("#u-ver").value = m.version + 1; });
      $("#u-check").onclick = async () => { const r = await Updater.checkAndApply(); toast(r.ok ? "✅ v" + r.version + " appliquée" : "ℹ️ " + r.reason); App.adminTab("update"); };
      $("#u-dl").onclick = () => { const v = +$("#u-ver").value, n = $("#u-notes").value;
        Updater.download("update-pack.json", Updater.buildPack(v, n));
        setTimeout(() => Updater.download("update.json", Updater.manifestFor(v, n)), 500);
        $("#u-msg").innerHTML = '<div class="ok-msg">2 fichiers : update.json (racine) + update-pack.json (data/).</div>'; };
      $("#u-gh").onclick = async () => {
        const token = $("#u-token").value.trim(), owner = $("#u-owner").value.trim(), repo = $("#u-repo").value.trim();
        if (!token || !owner || !repo) return $("#u-msg").innerHTML = '<div class="err-msg">Jeton/owner/repo requis.</div>';
        const v = +$("#u-ver").value, n = $("#u-notes").value;
        try{
          await Updater.ghPut("data/update-pack.json", JSON.stringify(Updater.buildPack(v, n), null, 2), token, owner, repo);
          await Updater.ghPut("update.json", JSON.stringify(Updater.manifestFor(v, n), null, 2), token, owner, repo);
          $("#u-msg").innerHTML = '<div class="ok-msg">✅ Publiée v' + v + '.</div>'; Store.audit("MAJ_PUBLIEE", "v" + v);
        }catch(err){ $("#u-msg").innerHTML = '<div class="err-msg">Échec : ' + esc(err.message) + '</div>'; }
      };
    }
    if (t === "tiers"){
      const tiers = Auth.tiers();
      B.innerHTML = `<div class="card"><h3>Créer un accès tiers</h3>
        <div class="grid g2"><div><label>Nom</label><input id="t-name"></div><div><label>Expiration</label><input id="t-exp" type="date"></div></div>
        <button class="btn" id="t-add" style="margin-top:.6rem">Générer</button><div id="t-new"></div></div>
      <div class="card"><h3>Codes (${tiers.length})</h3>
        <table><thead><tr><th>Code</th><th>Nom</th><th>Expire</th><th>Statut</th><th></th></tr></thead><tbody>
        ${tiers.map(x=>`<tr><td class="code">${esc(x.code)}</td><td>${esc(x.name)}</td><td>${x.expires?esc(x.expires):"∞"}</td>
          <td>${x.active?'<span style="color:var(--ok)">actif</span>':'<span style="color:var(--err)">inactif</span>'}</td>
          <td><button class="btn small sec" data-tt="${esc(x.code)}">${x.active?"Désactiver":"Activer"}</button>
          <button class="btn small danger" data-td2="${esc(x.code)}">🗑️</button></td></tr>`).join("")}</tbody></table></div>`;
      $("#t-add").onclick = () => { const code = Auth.addTier($("#t-name").value || "Accès tiers", $("#t-exp").value || null);
        $("#t-new").innerHTML = `<div class="ok-msg">Code : <b class="code">${code}</b></div>`; setTimeout(() => App.adminTab("tiers"), 1500); };
      B.querySelectorAll("[data-tt]").forEach(b => b.onclick = () => { Auth.toggleTier(b.dataset.tt); App.adminTab("tiers"); });
      B.querySelectorAll("[data-td2]").forEach(b => b.onclick = () => { if (confirm("Supprimer ?")){ Auth.removeTier(b.dataset.td2); App.adminTab("tiers"); }});
    }
    if (t === "audit"){
      const log = Store.read(CONFIG.K.audit, []);
      B.innerHTML = `<div class="card"><h3>Journal (${log.length})</h3>
        <table><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détail</th></tr></thead><tbody>
        ${log.slice(0,200).map(l=>`<tr><td class="muted">${esc(l.d.replace("T"," ").slice(0,16))}</td><td>${esc(l.u)}</td><td>${esc(l.action)}</td><td class="muted">${esc(l.detail)}</td></tr>`).join("")}
        </tbody></table></div>`;
    }
    if (t === "secu"){
      B.innerHTML = `<div class="card" style="max-width:440px"><h3>Changer le mot de passe admin</h3>
        <label>Actuel</label><input type="password" id="s-cur"><label>Nouveau</label><input type="password" id="s-new">
        <label>Confirmation</label><input type="password" id="s-conf">
        <button class="btn" id="s-go" style="margin-top:.7rem">Changer</button>
        <button class="btn sec" id="s-forget" style="margin-top:.7rem">Oublier cet appareil</button>
        <div id="s-msg"></div></div>`;
      $("#s-go").onclick = async () => {
        if ($("#s-new").value !== $("#s-conf").value) return $("#s-msg").innerHTML = '<div class="err-msg">Confirmation différente.</div>';
        if ($("#s-new").value.length < 6) return $("#s-msg").innerHTML = '<div class="err-msg">6 caractères min.</div>';
        const ok = await Auth.changePassword($("#s-cur").value, $("#s-new").value);
        $("#s-msg").innerHTML = ok ? '<div class="ok-msg">Modifié.</div>' : '<div class="err-msg">Actuel incorrect.</div>';
      };
      $("#s-forget").onclick = () => { Auth.forgetDevice(); $("#s-msg").innerHTML = '<div class="ok-msg">Mémorisation supprimée.</div>'; };
    }
  },
  bindAdmin(){
    $("#a-tab").onchange = e => App.adminTab(e.target.value);
    $("#a-new").onclick = () => App.openEditor(null);
    $("#a-export").onclick = () => {
      const data = { version: CONFIG.VERSION, exported: new Date().toISOString(),
        overrides: JSON.parse(localStorage.getItem(CONFIG.K.overrides) || "{}"),
        customs: Store.customs(), deleted: Store.read(CONFIG.K.deleted, []),
        recalls: Recalls.customs(), tsb: TSB.customs(), tiers: Auth.tiers() };
      Updater.download("ma-tech-by-kevin-sauvegarde-" + Date.now() + ".json", data);
      Store.audit("EXPORT", "sauvegarde");
    };
    $("#a-import").onchange = e => {
      const fr = new FileReader();
      fr.onload = () => { try{ const d = JSON.parse(fr.result);
        if (d.overrides) localStorage.setItem(CONFIG.K.overrides, JSON.stringify(d.overrides));
        if (d.customs) localStorage.setItem(CONFIG.K.customs, JSON.stringify(d.customs));
        if (d.deleted) localStorage.setItem(CONFIG.K.deleted, JSON.stringify(d.deleted));
        if (d.recalls) Recalls.saveCustoms(d.recalls);
        if (d.tsb) TSB.saveCustoms(d.tsb);
        if (d.tiers) Auth.saveTiers(d.tiers);
        Store.audit("IMPORT", "import"); alert("Import réussi."); App.route();
      }catch(err){ alert("JSON invalide."); } };
      fr.readAsText(e.target.files[0]);
    };
    App.adminTab("customs");
  },

  openEditor(f){
    const isNew = !f;
    if (isNew) f = { key:"", code:"", brand:"", title:"", desc:"", sev:2, symptoms:[], causes:[], solutions:[], motors:["Essence"] };
    const bg = document.createElement("div"); bg.className = "modal-bg";
    bg.innerHTML = `<div class="modal"><h2>${isNew?"➕ Nouvelle fiche":"✏️ Modifier " + esc(f.code)}</h2>
      <div class="grid g2">
        <div><label>Code DTC</label><input id="e-code" value="${esc(f.code)}" ${isNew?"":"disabled"}></div>
        <div><label>Marque (optionnel)</label><input id="e-brand" value="${esc(f.brand||"")}" ${isNew?"":"disabled"}></div></div>
      <label>Titre</label><input id="e-title" value="${esc(f.title)}">
      <label>Description</label><textarea id="e-desc" rows="3">${esc(f.desc)}</textarea>
      <label>Sévérité</label><select id="e-sev"><option value="1" ${f.sev==1?"selected":""}>1</option><option value="2" ${f.sev==2?"selected":""}>2</option><option value="3" ${f.sev==3?"selected":""}>3</option><option value="4" ${f.sev==4?"selected":""}>4</option></select>
      <label>Symptômes (1/ligne)</label><textarea id="e-sym" rows="3">${esc(f.symptoms.join("\n"))}</textarea>
      <label>Causes (1/ligne)</label><textarea id="e-cause" rows="3">${esc(f.causes.join("\n"))}</textarea>
      <label>Solutions (1/ligne)</label><textarea id="e-sol" rows="3">${esc(f.solutions.join("\n"))}</textarea>
      <div class="row" style="margin-top:1rem;justify-content:flex-end">
        <button class="btn sec" data-act="modal-close">Annuler</button><button class="btn" id="e-save">Enregistrer</button>
      </div><div class="err-msg" id="e-err"></div></div>`;
    document.body.appendChild(bg);
    bg.querySelector("#e-save").onclick = () => {
      const lines = t => t.split("\n").map(x=>x.trim()).filter(Boolean);
      const nf = { code:bg.querySelector("#e-code").value.trim().toUpperCase(), brand:bg.querySelector("#e-brand").value.trim(),
        title:bg.querySelector("#e-title").value.trim(), desc:bg.querySelector("#e-desc").value.trim(),
        sev:+bg.querySelector("#e-sev").value, symptoms:lines(bg.querySelector("#e-sym").value),
        causes:lines(bg.querySelector("#e-cause").value), solutions:lines(bg.querySelector("#e-sol").value) };
      if (!nf.code || !nf.title) return bg.querySelector("#e-err").textContent = "Code et titre obligatoires.";
      nf.sevLabel = ["Mineure","Modérée","Sérieuse","Critique"][nf.sev-1];
      nf.key = nf.brand ? nf.code + "@" + nf.brand : nf.code;
      nf.brands = nf.brand ? [nf.brand] : ["Toutes marques"];
      nf.motors = f.motors || ["Essence"]; nf.years = "2017-2026";
      if (isNew){
        if (!/^[PBCU][0-3][0-9A-F]{3}$/.test(nf.code)) return bg.querySelector("#e-err").textContent = "Format invalide.";
        Store.addCustom(nf);
      } else {
        const ci = Store.customs().findIndex(c => c.key === f.key);
        if (ci >= 0) Store.updateCustom(ci, nf); else Store.setOverride(nf.key, nf);
      }
      bg.remove(); App.route();
    };
  },
  bindView(){
    const v = App.state.view;
    if (v === "search"){ const q = $("#q"); if (q) q.onkeydown = e => { if (e.key === "Enter") App.doSearch(); }; App.updateNet(); }
    if (v === "codes") App.applyCodesFilter();
    if (v === "admin") App.bindAdmin();
  }
};

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const S = App.state;
  switch (el.dataset.act){
    case "nav": navigate("#/" + el.dataset.view); break;
    case "logout": Auth.forgetDevice(); Auth.logout ? Auth.logout() : Session.clear(); location.hash = ""; App.renderLogin(); break;
    case "share": App.doShare(); break;
    case "install": App.doInstall(); break;
    case "search-go": App.doSearch(); break;
    case "codes-go": App.applyCodesFilter(); break;
    case "recalls-go": S.recBrand = $("#r-brand").value; S.recYear = $("#r-year").value; App.route(); break;
    case "page-prev": S.page--; App.renderPage(); break;
    case "page-next": S.page++; App.renderPage(); break;
    case "open-fiche": navigate("#/fiche/" + encodeURIComponent(el.dataset.key)); break;
    case "open-rappel": navigate("#/rappel/" + encodeURIComponent(el.dataset.id)); break;
    case "open-tsb": App.openTsb(el.dataset.id); break;
    case "back": history.back(); break;
    case "veh-cat": S.vehCat = el.dataset.cat; S.vehBrand = ""; S.vehModel = ""; S.vehEngine = ""; App.route(); break;
    case "veh-brand": S.vehBrand = el.dataset.brand; S.vehModel = ""; S.vehEngine = ""; App.route(); break;
    case "veh-model": S.vehModel = el.dataset.model; S.vehEngine = ""; App.route(); break;
    case "veh-engine": S.vehEngine = el.dataset.engine; App.route(); break;
    case "veh-reset":
      if (el.dataset.level === "brands"){ S.vehBrand = ""; S.vehModel = ""; S.vehEngine = ""; }
      if (el.dataset.level === "models"){ S.vehModel = ""; S.vehEngine = ""; }
      if (el.dataset.level === "engines"){ S.vehEngine = ""; }
      App.route(); break;
    case "fiche-edit": App.openEditor(resolveFiche(el.dataset.key)); break;
    case "fiche-del":
      if (confirm("Supprimer cette fiche ?")){
        Store.setDeleted(el.dataset.key, true);
        const ci = Store.customs().findIndex(c => c.key === el.dataset.key);
        if (ci >= 0) Store.removeCustom(ci);
        navigate("#/codes");
      } break;
    case "modal-close": el.closest(".modal-bg").remove(); break;
  }
});

App.start();
