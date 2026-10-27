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

const App = {
  deferredPrompt: null,
  state: { view:"search", page:0, list:null, filterLetter:"", filterBrand:"",
           vehBrand:"", vehModel:"", vehEngine:"", recBrand:"", recYear:"" },

  async start(){
    await Auth.init();
    /* Installation PWA (téléchargeable) */
    window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); App.deferredPrompt = e; });
    /* Connexion permanente : indicateur en ligne / hors ligne */
    window.addEventListener("online", () => { App.updateNet(); toast("🌐 Connexion rétablie (4G/5G/Wi‑Fi)"); });
    window.addEventListener("offline", () => { App.updateNet(); toast("⛔ Hors ligne — mode local actif (sauvegarde incluse)"); });
    /* Mise à jour auto du pack de données */
    Updater.checkAndApply()
      .then(r => { if (r.ok) toast("✅ Mise à jour v" + r.version + " appliquée automatiquement"); })
      .catch(() => {});
    App.route();
  },

  updateNet(){
    const on = navigator.onLine;
    $$("[id^=netbadge]").forEach(el => {
      el.textContent = on ? "🌐 connecté" : "⛔ hors ligne";
      el.className = "tag " + (on ? "on" : "off");
    });
  },

  async doShare(){
    const url = location.origin + location.pathname;
    const data = { title: "Ma Tech by Kevin", text: "Ma Tech by Kevin — 21 000 fiches DTC, pannes & rappels 2017-2026 (fonctionne hors ligne)", url };
    try{
      if (navigator.share){ await navigator.share(data); toast("✅ Lien partagé"); }
      else { await navigator.clipboard.writeText(url); toast("🔗 Lien copié : " + url); }
    }catch(e){ toast("Partage annulé"); }
  },

  async doInstall(){
    if (App.deferredPrompt){
      App.deferredPrompt.prompt();
      const r = await App.deferredPrompt.userChoice;
      toast(r.outcome === "accepted" ? "📥 Installation lancée" : "Installation annulée");
      App.deferredPrompt = null;
    } else {
      toast("ℹ️ Menu du navigateur → « Installer l'application » / « Ajouter à l'écran d'accueil »");
    }
  },

  route(){
    if (!Session.get()) return App.renderLogin();
    const h = location.hash.replace(/^#\//,"") || "search";
    const [view, arg] = h.split("/");
    if (view === "admin" && !isAdmin()){ location.hash = "#/search"; return; }
    App.state.view = view;
    if (view === "fiche" && arg) return App.renderShell(App.renderFiche(decodeURIComponent(arg)));
    if (view === "rappel" && arg) return App.renderShell(App.renderRappel(decodeURIComponent(arg)));
    const V = { search: App.renderSearch, codes: App.renderCodes, veh: App.renderVeh, recalls: App.renderRecalls, admin: App.renderAdmin };
    App.renderShell((V[view] || App.renderSearch)());
  },

  renderShell(body){
    const role = Session.role();
    $("#app").innerHTML = `
    <div class="topbar">
      <div class="logo">⚙️ Ma Tech <span>by Kevin</span></div>
      <span class="badge ${role==='admin'?'b-admin':'b-tier'}">${role==='admin'?'ADMIN':'ACCÈS TIERS'}</span>
      <span class="tag" id="netbadge"></span>
      <div class="spacer"></div>
      <button class="btn sec small" data-act="share" title="Partager l'application">🔗</button>
      <button class="btn sec small" data-act="install" title="Installer / télécharger">📥</button>
      <button class="btn sec small" data-act="logout">Déconnexion</button>
    </div>
    <nav class="tabs" style="padding:.4rem 1rem;background:var(--panel);border-bottom:1px solid var(--bd);display:flex">
      <button data-act="nav" data-view="search" class="${App.state.view==='search'?'active':''}">🔍 Recherche</button>
      <button data-act="nav" data-view="codes" class="${App.state.view==='codes'?'active':''}">📟 Codes DTC</button>
      <button data-act="nav" data-view="veh" class="${App.state.view==='veh'?'active':''}">🚗 Véhicules</button>
      <button data-act="nav" data-view="recalls" class="${App.state.view==='recalls'||App.state.view==='rappel'?'active':''}">📢 Rappels</button>
      ${isAdmin()?'<button data-act="nav" data-view="admin" class="'+(App.state.view==='admin'?'active':'')+'">🛠️ Administration</button>':''}
    </nav>
    ${role==='tier'?'<div style="background:#102a3a;color:#5ec1ff;text-align:center;padding:.35rem;font-size:.8rem">Mode accès tiers — consultation seule • mises à jour reçues automatiquement</div>':''}
    <main>${body}</main>
    <div class="footer">Ma Tech by Kevin v${CONFIG.VERSION} — pack données v${Updater.applied()} — 21 000 fiches DTC + rappels constructeurs — toutes marques, modèles, motorisations et puissances 2017 → 2026 — en ligne & hors ligne</div>`;
    App.updateNet();
    App.bindView();
  },

  renderLogin(){
    $("#app").innerHTML = `
    <div class="login-wrap"><div class="card login-box">
      <div class="logo" style="font-size:1.4rem;margin-bottom:.3rem">⚙️ Ma Tech <span>by Kevin</span></div>
      <p class="muted" style="margin-bottom:1rem">21 000 fiches + campagnes de rappels • 2017-2026 • hors ligne</p>
      <label>Identifiant (administrateur)</label>
      <input id="l-user" autocomplete="username">
      <label>Mot de passe</label>
      <input id="l-pass" type="password" autocomplete="current-password">
      <div style="margin-top:.8rem"><button class="btn" id="l-admin" style="width:100%">Connexion administrateur</button></div>
      <div class="err-msg" id="l-err"></div>
      <hr style="border-color:var(--bd);margin:1rem 0">
      <label>Code d'accès tiers (lecture seule)</label>
      <input id="l-code" placeholder="TIER-XXXXXX" style="text-transform:uppercase">
      <div style="margin-top:.8rem"><button class="btn sec" id="l-tier" style="width:100%">Accéder en mode tiers</button></div>
      <div class="err-msg" id="l-err2"></div>
      <div class="row" style="margin-top:1rem;justify-content:center">
        <span class="tag" id="netbadge"></span>
        <button class="btn sec small" data-act="share">🔗 Partager</button>
        <button class="btn sec small" data-act="install">📥 Installer</button>
      </div>
    </div></div>`;
    App.updateNet();
    $("#l-admin").onclick = async () => {
      if (await Auth.loginAdmin($("#l-user").value, $("#l-pass").value)) App.route();
      else $("#l-err").textContent = "Identifiants administrateur incorrects.";
    };
    $("#l-tier").onclick = () => {
      if (Auth.loginTier($("#l-code").value)) App.route();
      else $("#l-err2").textContent = "Code tiers invalide, inactif ou expiré.";
    };
  },

  renderSearch(){
    return `
    <div class="card"><h1>Recherche automatique pannes + rappels</h1>
      <p class="muted">Code DTC (P0300, P0A80…), texte libre (injecteur, Takata, courroie…), marque, modèle ou motorisation.</p>
      <div class="row" style="margin-top:.7rem">
        <input id="q" placeholder="P0420, airbag, 1.2 PureTech, Renault Clio V…" style="flex:1;min-width:200px">
        <button class="btn" data-act="search-go">Rechercher</button>
      </div>
    </div>
    <div class="card"><h3>📶 Connexion, partage & sauvegarde locale</h3>
      <div class="row">
        <span class="tag" id="netbadge2"></span>
        <button class="btn sec small" data-act="share">🔗 Partager l'appli</button>
        <button class="btn sec small" data-act="install">📥 Installer / télécharger</button>
      </div>
      <p class="muted" style="margin-top:.5rem">Utilisable en 4G/5G/Wi‑Fi et <b>hors ligne</b> : les 21 000 fiches, les rappels et vos modifications sont enregistrés localement sur l'appareil (sauvegarde automatique).</p>
    </div>
    <div class="grid g4">
      <div class="card stat"><b>21 000</b>fiches DTC</div>
      <div class="card stat"><b>${Recalls.all().length}</b>campagnes de rappels</div>
      <div class="card stat"><b>${BRANDS.length}</b>marques</div>
      <div class="card stat"><b>2017-2026</b>toutes puissances</div>
    </div>
    <div id="results"></div><div id="recall-results"></div>`;
  },

  doSearch(){
    const q = $("#q").value.trim();
    if (!q) return;
    let keys = [];
    if (/^[pbcu][0-3]/i.test(q)){
      keys = DT.findByCode(q).map(e => e.key);
      if (!keys.length && /^[pbcu][0-3][0-9a-f]{3}$/i.test(q)) keys = [q.toUpperCase()];
    } else {
      const needle = q.toLowerCase();
      const vehBrands = new Set();
      BRANDS.forEach(b => {
        if (b[0].toLowerCase().includes(needle) || b[1].some(m=>m.toLowerCase().includes(needle)) || b[2].some(e=>e.toLowerCase().includes(needle)))
          vehBrands.add(b[0]);
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
    const recs = Recalls.search(q.toLowerCase());
    $("#recall-results").innerHTML = recs.length ? `
      <div class="card"><h3>📢 Campagnes de rappels correspondantes (${recs.length})</h3>
      <table><thead><tr><th>Référence</th><th>Marques</th><th>Composant</th><th>Période</th><th>Statut</th></tr></thead><tbody>
      ${recs.map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer">
        <td class="code">${esc(r.id)}</td><td>${esc(r.brands.slice(0,3).join(", "))}${r.brands.length>3?'…':''}</td>
        <td>${esc(r.comp)}</td><td class="muted">${r.y0}-${r.y1}</td>
        <td>${r.status==='open'?'<span style="color:var(--warn)">ouverte</span>':'<span class="muted">clôturée</span>'}</td></tr>`).join("")}
      </tbody></table></div>` : "";
  },

  renderCodes(){
    return `
    <div class="card"><h1>Tous les codes DTC</h1>
      <div class="row" style="margin-top:.5rem">
        <select id="f-letter" style="max-width:160px"><option value="">Tous systèmes</option>
          ${["P","B","C","U"].map(l=>`<option ${App.state.filterLetter===l?'selected':''}>${l}</option>`).join("")}</select>
        <select id="f-brand" style="max-width:200px"><option value="">Génériques (toutes marques)</option>
          ${BRANDS.map(b=>`<option ${App.state.filterBrand===b[0]?'selected':''}>${b[0]}</option>`).join("")}</select>
        <button class="btn" data-act="codes-go">Filtrer</button>
      </div>
    </div>
    <div id="results"></div><div id="pager" class="pager"></div>`;
  },

  applyCodesFilter(){
    const L = $("#f-letter") ? $("#f-letter").value : "";
    const B = $("#f-brand") ? $("#f-brand").value : "";
    App.state.filterLetter = L; App.state.filterBrand = B;
    const keys = [];
    if (B){
      const bi = BRANDS.findIndex(b => b[0] === B), n = BRANDS.length, per = Math.ceil(5000/n);
      for (let k = 0; k < per; k++){
        const j = k*n + bi; if (j >= 5000) break;
        keys.push("P1" + String((j*7)%1000).padStart(3,"0") + "@" + B);
      }
    } else {
      const li = L ? ["P","B","C","U"].indexOf(L) : -1;
      const start = li >= 0 ? li*4000 : 0, end = li >= 0 ? start+4000 : 16000;
      for (let i = start; i < end; i++) keys.push(DT.codeFromIndex(i));
    }
    App.state.list = keys; App.state.page = 0;
    App.renderPage();
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
        <td class="code">${esc(f.code)}</td>
        <td>${esc(f.title.slice(0,90))}${f.title.length>90?'…':''}</td>
        <td><span class="sev s${f.sev}"></span>${esc(f.sevLabel)}</td>
        <td class="muted">${esc(f.brands.slice(0,2).join(", "))}${f.brands.length>2?'…':''}</td></tr>`);
    });
    return `<div class="card"><div class="muted" style="margin-bottom:.5rem">${esc(label)}</div>
    <table><thead><tr><th>Code</th><th>Description</th><th>Sév.</th><th>Marques</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  },

  renderVeh(){
    const S = App.state;
    const b = S.vehBrand ? BRANDS.find(x => x[0] === S.vehBrand) : null;
    if (!b){
      return `<div class="card"><h1>Toutes les marques 2017-2026</h1>
        <p class="muted">Marque → modèle → motorisation : pannes connues + campagnes de rappels appliquées automatiquement (puissance comprise).</p></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">
        ${BRANDS.map(x=>`<div class="card" style="cursor:pointer;margin:0" data-act="veh-brand" data-brand="${esc(x[0])}">
          <h3>${esc(x[0])}</h3><div class="muted">${x[1].length} modèles • ${x[2].length} motorisations</div></div>`).join("")}
        </div>`;
    }
    const model = S.vehModel ? b[1].find(m => m.split("|")[0] === S.vehModel) : null;
    if (!model){
      return `<div class="card"><div class="row"><h1>🚗 ${esc(b[0])} — modèles</h1><div class="spacer"></div>
        <button class="btn sec small" data-act="veh-reset" data-level="brands">← Marques</button></div></div>
        <div class="card"><table><thead><tr><th>Modèle</th><th>Millésimes</th></tr></thead><tbody>
        ${b[1].map(m=>{ const [n,y]=m.split("|"); return `<tr data-act="veh-model" data-model="${esc(n)}" style="cursor:pointer"><td><b>${esc(n)}</b></td><td class="muted">${y||2017} → 2026</td></tr>`; }).join("")}
        </tbody></table></div>`;
    }
    const [mName, mYear] = model.split("|");
    if (!S.vehEngine){
      return `<div class="card"><div class="row"><h1>${esc(b[0])} ${esc(mName)}</h1><div class="spacer"></div>
        <button class="btn sec small" data-act="veh-reset" data-level="models">← Modèles</button></div>
        <p class="muted">Millésimes ${mYear||2017} → 2026 — choisissez une motorisation (puissance incluse) :</p></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">
        ${b[2].map(e=>`<div class="card" style="cursor:pointer;margin:0" data-act="veh-engine" data-engine="${esc(e)}">
          <h3>⚙️ ${esc(e)}</h3><span class="tag b">${esc(DT.fuelOf(e))}</span> <span class="tag">${Recalls.powerOf(e)||"—"} ch</span></div>`).join("")}
        </div>`;
    }
    const res = DT.faultsForVehicle(b[0], model, S.vehEngine);
    const recs = Recalls.forVehicle(b[0], model, S.vehEngine);
    return `<div class="card"><div class="row" style="flex-wrap:wrap">
        <h1>${esc(b[0])} ${esc(mName)}</h1>
        <span class="tag b">${esc(S.vehEngine)}</span>
        <span class="tag">${esc(res.fuel)}</span>
        <span class="tag">${Recalls.powerOf(S.vehEngine)||"—"} ch</span>
        <span class="tag">${mYear||2017} → 2026</span>
        <div class="spacer"></div>
        <button class="btn sec small" data-act="veh-reset" data-level="engines">← Motorisations</button>
      </div>
      <p class="muted" style="margin-top:.4rem"><b>${res.faults.length}</b> pannes connues • <b>${recs.length}</b> campagne(s) de rappel pour cette configuration exacte.</p></div>
    ${recs.length ? `<div class="card"><h3>📢 Campagnes de rappels applicables</h3>
      <table><thead><tr><th>Référence</th><th>Composant</th><th>Risque</th><th>Période</th><th>Statut</th></tr></thead><tbody>
      ${recs.map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer">
        <td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td><td>${esc(r.risk.slice(0,60))}</td>
        <td class="muted">${r.y0}-${r.y1}</td>
        <td>${r.status==='open'?'<span style="color:var(--warn)">ouverte</span>':'<span class="muted">clôturée</span>'}</td></tr>`).join("")}
      </tbody></table></div>` : `<div class="card muted">Aucune campagne de rappel connue pour cette configuration.</div>`}
    ${App.listHTML(res.faults.map(f=>f.key), "Pannes connues — " + esc(b[0]) + " " + esc(mName) + " " + esc(S.vehEngine))}`;
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
          ${BRANDS.map(b=>`<option ${S.recBrand===b[0]?'selected':''}>${b[0]}</option>`).join("")}</select>
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
    <div class="card">
      <div class="row"><span class="code" style="font-size:1.2rem">${esc(r.id)}</span>
        <span class="tag">${r.status==='open'?'⚠️ ouverte':'clôturée'}</span>
        <span class="tag">${r.y0}-${r.y1}</span><span class="tag">publiée ${esc(r.date)}</span>
        <div class="spacer"></div><button class="btn sec small" data-act="back">← Retour</button></div>
      <h2 style="margin-top:.6rem">${esc(r.comp)}</h2>
      <p style="margin-top:.4rem"><b>Risque :</b> ${esc(r.risk)}</p>
      <p><b>Solution constructeur :</b> ${esc(r.fix)}</p>
    </div>
    <div class="grid g2">
      <div class="card"><h3>Marques concernées</h3><div style="margin-top:.4rem">${r.brands.map(x=>`<span class="tag b">${esc(x)}</span>`).join("")}</div>
        <h3 style="margin-top:.8rem">Modèles</h3><div style="margin-top:.4rem">${(r.models&&r.models.length)?r.models.map(x=>`<span class="tag">${esc(x)}</span>`).join(""):'<span class="muted">Tous modèles de la marque</span>'}</div>
        <h3 style="margin-top:.8rem">Motorisations / puissances</h3><div style="margin-top:.4rem">
          ${(r.fuels&&r.fuels.length)?r.fuels.map(x=>`<span class="tag">⚡ ${esc(x)}</span>`).join(""):'<span class="muted">Toutes motorisations</span>'}
          ${r.pw?`<span class="tag b">${r.pw[0]} → ${r.pw[1]} ch</span>`:''}</div></div>
      <div class="card"><h3>Codes DTC associés</h3><div style="margin-top:.4rem">
        ${r.dtcs.map(c=>`<button class="btn sec small" style="margin:.15rem" data-act="open-fiche" data-key="${esc(c)}">${esc(c)}</button>`).join("")}</div>
        <p class="muted" style="margin-top:.8rem">Vérification véhicule : 🚗 Véhicules → marque → modèle → motorisation.</p></div>
    </div>`;
  },

  renderFiche(key){
    const f = resolveFiche(key);
    if (!f) return `<div class="card">Fiche supprimée ou introuvable. <a href="#/codes">Retour aux codes</a></div>`;
    const edited = Store.getOverride(key) || Store.customs().some(c => c.key === key);
    return `
    <div class="card">
      <div class="row"><span class="code" style="font-size:1.3rem">${esc(f.code)}</span>
        ${f.brand?`<span class="tag b">${esc(f.brand)}</span>`:`<span class="tag">${f.generic?'Générique OBD-II':'Spécifique constructeur'}</span>`}
        <span class="tag"><span class="sev s${f.sev}"></span>${esc(f.sevLabel)}</span>
        <span class="tag">Millésimes ${esc(f.years)}</span>
        <div class="spacer"></div>
        <button class="btn sec small" data-act="back">← Retour</button>
        ${isAdmin()?`<button class="btn small" data-act="fiche-edit" data-key="${esc(key)}">✏️ Modifier</button><button class="btn danger small" data-act="fiche-del" data-key="${esc(key)}">🗑️ Supprimer</button>`:''}
      </div>
      <h2 style="margin-top:.6rem">${esc(f.title)}</h2>
      <p style="margin-top:.4rem">${esc(f.desc)}</p>
      ${edited?'<div class="ok-msg">✓ Fiche modifiée/personnalisée par l\'administrateur</div>':''}
    </div>
    <div class="grid g2">
      <div class="card"><h3>🩺 Symptômes</h3><ul style="padding-left:1.2rem;margin-top:.4rem">${f.symptoms.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>
      <div class="card"><h3>🔧 Causes probables</h3><ul style="padding-left:1.2rem;margin-top:.4rem">${f.causes.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>
    </div>
    <div class="card"><h3>✅ Solutions / contrôles</h3><ol style="padding-left:1.4rem;margin-top:.4rem">${f.solutions.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div>
    <div class="card"><h3>🚗 Véhicules concernés (2017-2026)</h3>
      <div style="margin-top:.4rem">${f.brands.map(x=>`<span class="tag b">${esc(x)}</span>`).join("")}</div>
      <div style="margin-top:.4rem">${f.motors.map(m=>`<span class="tag">⚡ ${esc(m)}</span>`).join("")}</div>
    </div>`;
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
        </tbody></table>`:'<p class="muted">Aucune fiche personnalisée.</p>'}</div>
      <div class="card"><h3>Fiches standard modifiées (${ovs.length})</h3>
        ${ovs.length?ovs.map(k=>`<span class="tag b">${esc(k)}</span>`).join(""):'<p class="muted">Aucune surcharge.</p>'}</div>`;
      B.querySelectorAll("[data-ce]").forEach(b => b.onclick = () => App.openEditor(Store.customs()[+b.dataset.ce]));
      B.querySelectorAll("[data-cd]").forEach(b => b.onclick = () => { if (confirm("Supprimer ?")){ Store.removeCustom(+b.dataset.cd); App.adminTab("customs"); }});
    }
    if (t === "recalls"){
      const list = Recalls.customs();
      B.innerHTML = `<div class="card"><h3>Ajouter une campagne de rappel</h3>
        <div class="grid g2">
          <div><label>Marque</label><select id="rc-brand">${BRANDS.map(b=>`<option>${esc(b[0])}</option>`).join("")}</select></div>
          <div><label>Modèles (virgule, vide = tous)</label><input id="rc-models"></div>
          <div><label>Motorisations (virgule : Essence,Diesel,Hybride,Électrique,GPL — vide = toutes)</label><input id="rc-fuels"></div>
          <div><label>Puissance mini-maxi ch (ex : 100-160, vide = toutes)</label><input id="rc-pw"></div>
          <div><label>Année début</label><input id="rc-y0" type="number" value="2017" min="2017" max="2026"></div>
          <div><label>Année fin</label><input id="rc-y1" type="number" value="2026" min="2017" max="2026"></div>
        </div>
        <label>Composant concerné</label><input id="rc-comp" placeholder="ex : pompe à carburant">
        <label>Risque</label><input id="rc-risk" placeholder="ex : risque de calage en roulant">
        <label>Solution constructeur</label><input id="rc-fix" placeholder="ex : remplacement en concession">
        <label>Codes DTC associés (virgule)</label><input id="rc-dtcs" placeholder="P0087, P0191">
        <button class="btn" id="rc-add" style="margin-top:.7rem">Ajouter la campagne</button>
        <div id="rc-msg"></div></div>
      <div class="card"><h3>Campagnes personnalisées (${list.length})</h3>
        ${list.length?`<table><thead><tr><th>Référence</th><th>Composant</th><th></th></tr></thead><tbody>
        ${list.map((r,i)=>`<tr><td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td>
          <td><button class="btn small danger" data-rd="${i}">🗑️</button></td></tr>`).join("")}</tbody></table>`:'<p class="muted">Aucune.</p>'}</div>`;
      $("#rc-add").onclick = () => {
        const pw = $("#rc-pw").value.trim();
        const r = {
          id: "RAP-CUST-" + Date.now().toString(36).toUpperCase(),
          brands: [$("#rc-brand").value],
          models: $("#rc-models").value.split(",").map(x=>x.trim()).filter(Boolean),
          fuels: $("#rc-fuels").value.split(",").map(x=>x.trim()).filter(Boolean),
          pw: pw ? pw.split("-").map(Number) : null,
          y0: +$("#rc-y0").value, y1: +$("#rc-y1").value,
          comp: $("#rc-comp").value.trim() || "Composant non précisé",
          risk: $("#rc-risk").value.trim() || "Risque non précisé",
          fix: $("#rc-fix").value.trim() || "Voir concession",
          dtcs: $("#rc-dtcs").value.split(",").map(x=>x.trim().toUpperCase()).filter(Boolean),
          status: "open", date: new Date().toISOString().slice(0,7)
        };
        const l = Recalls.customs(); l.unshift(r); Recalls.saveCustoms(l);
        Store.audit("CREER_RAPPEL", r.id);
        $("#rc-msg").innerHTML = '<div class="ok-msg">Campagne ajoutée (pensez à publier la mise à jour).</div>';
        setTimeout(() => App.adminTab("recalls"), 1200);
      };
      B.querySelectorAll("[data-rd]").forEach(b => b.onclick = () => {
        if (confirm("Supprimer cette campagne ?")){ const l = Recalls.customs(); l.splice(+b.dataset.rd,1); Recalls.saveCustoms(l); App.adminTab("recalls"); }
      });
    }
    if (t === "update"){
      const meta = Updater.meta();
      B.innerHTML = `<div class="card"><h3>📦 Mise à jour manuelle (réservée à l'admin)</h3>
        <p class="muted">Version appliquée ici : <b>v${Updater.applied()}</b>${meta?` — dernière : v${meta.version} (${esc(meta.date||"")})`:''}</p>
        <p class="muted">Version serveur : <span id="u-srv">vérification…</span></p>
        <div class="grid g2">
          <div><label>Nouvelle version (nombre)</label><input id="u-ver" type="number" value="${Updater.applied()+1}" min="1"></div>
          <div><label>Notes de version</label><input id="u-notes" placeholder="ex : ajout rappels constructeurs"></div>
        </div>
        <div class="row" style="margin-top:.8rem">
          <button class="btn" id="u-dl">⬇️ Préparer le pack (2 fichiers)</button>
          <button class="btn sec" id="u-check">🔄 Vérifier maintenant</button>
        </div>
        <hr style="border-color:var(--bd);margin:1rem 0">
        <h3>Publication directe GitHub (optionnel)</h3>
        <div class="grid g2">
          <div><label>Jeton GitHub (scope repo / contents:write)</label><input id="u-token" type="password" placeholder="ghp_…"></div>
          <div><label>Propriétaire / dépôt</label><div class="row"><input id="u-owner" placeholder="owner"><input id="u-repo" placeholder="repo"></div></div>
        </div>
        <button class="btn" id="u-gh" style="margin-top:.7rem">🚀 Publier sur GitHub</button>
        <div id="u-msg"></div>
        <p class="muted" style="margin-top:.8rem">Après publication, <b>tous les utilisateurs (tiers compris)</b> reçoivent et appliquent la mise à jour automatiquement au prochain lancement, en ligne comme hors ligne après synchronisation.</p></div>`;
      const d = Updater.detectRepo();
      $("#u-owner").value = d.owner; $("#u-repo").value = d.repo;
      Updater.serverManifest().then(m => { $("#u-srv").textContent = m ? "v" + m.version : "aucune (première publication)"; if (m) $("#u-ver").value = m.version + 1; });
      $("#u-check").onclick = async () => {
        const r = await Updater.checkAndApply();
        toast(r.ok ? "✅ Mise à jour v" + r.version + " appliquée" : "ℹ️ " + r.reason);
        App.adminTab("update");
      };
      $("#u-dl").onclick = () => {
        const v = +$("#u-ver").value, n = $("#u-notes").value;
        Updater.download("update-pack.json", Updater.buildPack(v, n));
        setTimeout(() => Updater.download("update.json", Updater.manifestFor(v, n)), 500);
        $("#u-msg").innerHTML = '<div class="ok-msg">2 fichiers téléchargés : <b>update.json</b> à la racine, <b>update-pack.json</b> dans <b>data/</b> (GitHub → Add file → Upload).</div>';
      };
      $("#u-gh").onclick = async () => {
        const token = $("#u-token").value.trim(), owner = $("#u-owner").value.trim(), repo = $("#u-repo").value.trim();
        if (!token || !owner || !repo) return $("#u-msg").innerHTML = '<div class="err-msg">Jeton, propriétaire et dépôt requis.</div>';
        const v = +$("#u-ver").value, n = $("#u-notes").value;
        try{
          await Updater.ghPut("data/update-pack.json", JSON.stringify(Updater.buildPack(v, n), null, 2), token, owner, repo);
          await Updater.ghPut("update.json", JSON.stringify(Updater.manifestFor(v, n), null, 2), token, owner, repo);
          $("#u-msg").innerHTML = '<div class="ok-msg">✅ Publiée (v' + v + '). Application automatique chez tous les utilisateurs.</div>';
          Store.audit("MAJ_PUBLIEE", "v" + v);
        }catch(err){ $("#u-msg").innerHTML = '<div class="err-msg">Échec : ' + esc(err.message) + '</div>'; }
      };
    }
    if (t === "tiers"){
      const tiers = Auth.tiers();
      B.innerHTML = `<div class="card"><h3>Créer un accès tiers</h3>
        <div class="grid g2"><div><label>Nom / bénéficiaire</label><input id="t-name"></div>
        <div><label>Expiration (optionnel)</label><input id="t-exp" type="date"></div></div>
        <button class="btn" id="t-add" style="margin-top:.6rem">Générer le code</button>
        <div id="t-new"></div></div>
      <div class="card"><h3>Codes (${tiers.length})</h3>
        <table><thead><tr><th>Code</th><th>Nom</th><th>Expire</th><th>Statut</th><th></th></tr></thead><tbody>
        ${tiers.map(x=>`<tr><td class="code">${esc(x.code)}</td><td>${esc(x.name)}</td>
          <td>${x.expires?esc(x.expires):"∞"}</td>
          <td>${x.active?'<span style="color:var(--ok)">actif</span>':'<span style="color:var(--err)">inactif</span>'}</td>
          <td><button class="btn small sec" data-tt="${esc(x.code)}">${x.active?"Désactiver":"Activer"}</button>
              <button class="btn small danger" data-td="${esc(x.code)}">🗑️</button></td></tr>`).join("")}
        </tbody></table></div>`;
      $("#t-add").onclick = () => {
        const code = Auth.addTier($("#t-name").value || "Accès tiers", $("#t-exp").value || null);
        $("#t-new").innerHTML = `<div class="ok-msg">Code créé : <b class="code">${code}</b> (diffusé via la prochaine mise à jour)</div>`;
        setTimeout(() => App.adminTab("tiers"), 1500);
      };
      B.querySelectorAll("[data-tt]").forEach(b => b.onclick = () => { Auth.toggleTier(b.dataset.tt); App.adminTab("tiers"); });
      B.querySelectorAll("[data-td]").forEach(b => b.onclick = () => { if (confirm("Supprimer ce code ?")){ Auth.removeTier(b.dataset.td); App.adminTab("tiers"); }});
    }
    if (t === "audit"){
      const log = Store.read(CONFIG.K.audit, []);
      B.innerHTML = `<div class="card"><h3>Journal d'audit (${log.length})</h3>
        <table><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détail</th></tr></thead><tbody>
        ${log.slice(0,200).map(l=>`<tr><td class="muted">${esc(l.d.replace("T"," ").slice(0,16))}</td><td>${esc(l.u)}</td><td>${esc(l.action)}</td><td class="muted">${esc(l.detail)}</td></tr>`).join("")}
        </tbody></table></div>`;
    }
    if (t === "secu"){
      B.innerHTML = `<div class="card" style="max-width:440px"><h3>Changer le mot de passe administrateur</h3>
        <label>Mot de passe actuel</label><input type="password" id="s-cur">
        <label>Nouveau mot de passe</label><input type="password" id="s-new">
        <label>Confirmation</label><input type="password" id="s-conf">
        <button class="btn" id="s-go" style="margin-top:.7rem">Changer</button>
        <div id="s-msg"></div></div>`;
      $("#s-go").onclick = async () => {
        if ($("#s-new").value !== $("#s-conf").value) return $("#s-msg").innerHTML = '<div class="err-msg">Confirmation différente.</div>';
        if ($("#s-new").value.length < 6) return $("#s-msg").innerHTML = '<div class="err-msg">6 caractères minimum.</div>';
        const ok = await Auth.changePassword($("#s-cur").value, $("#s-new").value);
        $("#s-msg").innerHTML = ok ? '<div class="ok-msg">Mot de passe modifié.</div>' : '<div class="err-msg">Mot de passe actuel incorrect.</div>';
      };
    }
  },

  bindAdmin(){
    $("#a-tab").onchange = e => App.adminTab(e.target.value);
    $("#a-new").onclick = () => App.openEditor(null);
    $("#a-export").onclick = () => {
      const data = {
        version: CONFIG.VERSION, exported: new Date().toISOString(),
        overrides: JSON.parse(localStorage.getItem(CONFIG.K.overrides) || "{}"),
        customs: Store.customs(), deleted: Store.read(CONFIG.K.deleted, []),
        recalls: Recalls.customs(), tiers: Auth.tiers()
      };
      Updater.download("ma-tech-by-kevin-sauvegarde-" + Date.now() + ".json", data);
      Store.audit("EXPORT", "sauvegarde JSON");
    };
    $("#a-import").onchange = e => {
      const fr = new FileReader();
      fr.onload = () => {
        try{
          const d = JSON.parse(fr.result);
          if (d.overrides) localStorage.setItem(CONFIG.K.overrides, JSON.stringify(d.overrides));
          if (d.customs) localStorage.setItem(CONFIG.K.customs, JSON.stringify(d.customs));
          if (d.deleted) localStorage.setItem(CONFIG.K.deleted, JSON.stringify(d.deleted));
          if (d.recalls) Recalls.saveCustoms(d.recalls);
          if (d.tiers) Auth.saveTiers(d.tiers);
          Store.audit("IMPORT", "import JSON");
          alert("Import réussi."); App.route();
        }catch(err){ alert("Fichier JSON invalide."); }
      };
      fr.readAsText(e.target.files[0]);
    };
    App.adminTab("customs");
  },

  openEditor(f){
    const isNew = !f;
    if (isNew) f = { key:"", code:"", brand:"", title:"", desc:"", sev:2, symptoms:[], causes:[], solutions:[], motors:["Essence"] };
    const bg = document.createElement("div");
    bg.className = "modal-bg";
    bg.innerHTML = `<div class="modal"><h2>${isNew?"➕ Nouvelle fiche":"✏️ Modifier " + esc(f.code)}</h2>
      <div class="grid g2">
        <div><label>Code DTC</label><input id="e-code" value="${esc(f.code)}" ${isNew?"":"disabled"} placeholder="P0300"></div>
        <div><label>Marque (optionnel)</label><input id="e-brand" value="${esc(f.brand||"")}" ${isNew?"":"disabled"} placeholder="vide = générique"></div>
      </div>
      <label>Titre</label><input id="e-title" value="${esc(f.title)}">
      <label>Description</label><textarea id="e-desc" rows="3">${esc(f.desc)}</textarea>
      <label>Sévérité</label><select id="e-sev"><option value="1" ${f.sev==1?"selected":""}>1 — Mineure</option><option value="2" ${f.sev==2?"selected":""}>2 — Modérée</option><option value="3" ${f.sev==3?"selected":""}>3 — Sérieuse</option><option value="4" ${f.sev==4?"selected":""}>4 — Critique</option></select>
      <label>Symptômes (un par ligne)</label><textarea id="e-sym" rows="3">${esc(f.symptoms.join("\n"))}</textarea>
      <label>Causes (une par ligne)</label><textarea id="e-cause" rows="3">${esc(f.causes.join("\n"))}</textarea>
      <label>Solutions (une par ligne)</label><textarea id="e-sol" rows="3">${esc(f.solutions.join("\n"))}</textarea>
      <div class="row" style="margin-top:1rem;justify-content:flex-end">
        <button class="btn sec" data-act="modal-close">Annuler</button>
        <button class="btn" id="e-save">Enregistrer</button>
      </div><div class="err-msg" id="e-err"></div></div>`;
    document.body.appendChild(bg);
    bg.querySelector("#e-save").onclick = () => {
      const lines = t => t.split("\n").map(x=>x.trim()).filter(Boolean);
      const nf = {
        code: bg.querySelector("#e-code").value.trim().toUpperCase(),
        brand: bg.querySelector("#e-brand").value.trim(),
        title: bg.querySelector("#e-title").value.trim(),
        desc: bg.querySelector("#e-desc").value.trim(),
        sev: +bg.querySelector("#e-sev").value,
        symptoms: lines(bg.querySelector("#e-sym").value),
        causes: lines(bg.querySelector("#e-cause").value),
        solutions: lines(bg.querySelector("#e-sol").value)
      };
      if (!nf.code || !nf.title) return bg.querySelector("#e-err").textContent = "Code et titre obligatoires.";
      nf.sevLabel = ["Mineure","Modérée","Sérieuse","Critique"][nf.sev-1];
      nf.key = nf.brand ? nf.code + "@" + nf.brand : nf.code;
      nf.brands = nf.brand ? [nf.brand] : ["Toutes marques"];
      nf.motors = f.motors || ["Essence"];
      nf.years = "2017-2026";
      if (isNew){
        if (!/^[PBCU][0-3][0-9A-F]{3}$/.test(nf.code)) return bg.querySelector("#e-err").textContent = "Format de code invalide (ex : P0300, P0A80).";
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
    if (v === "search"){
      const q = $("#q");
      if (q) q.onkeydown = e => { if (e.key === "Enter") App.doSearch(); };
      App.updateNet();
    }
    if (v === "codes") App.applyCodesFilter();
    if (v === "admin") App.bindAdmin();
  }
};

/* ===== clics centralisés (fiables mobile / APK) ===== */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const S = App.state;
  switch (el.dataset.act){
    case "nav": location.hash = "#/" + el.dataset.view; break;
    case "logout": Auth.logout(); location.hash = ""; App.renderLogin(); break;
    case "share": App.doShare(); break;
    case "install": App.doInstall(); break;
    case "search-go": App.doSearch(); break;
    case "codes-go": App.applyCodesFilter(); break;
    case "recalls-go": S.recBrand = $("#r-brand").value; S.recYear = $("#r-year").value; App.route(); break;
    case "page-prev": S.page--; App.renderPage(); break;
    case "page-next": S.page++; App.renderPage(); break;
    case "open-fiche": location.hash = "#/fiche/" + encodeURIComponent(el.dataset.key); break;
    case "open-rappel": location.hash = "#/rappel/" + encodeURIComponent(el.dataset.id); break;
    case "back": history.back(); break;
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
        location.hash = "#/codes";
      }
      break;
    case "modal-close": el.closest(".modal-bg").remove(); break;
  }
});

App.start();
