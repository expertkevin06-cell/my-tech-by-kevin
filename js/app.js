"use strict";
const $=s=>document.querySelector(s); const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const isAdmin=()=>Session.role()==="admin";
function toast(msg){ const t=document.createElement("div"); t.className="toast"; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.classList.add("show"),10); setTimeout(()=>{t.classList.remove("show"); setTimeout(()=>t.remove(),300);},3800); }
function navigate(h){ if(location.hash===h) App.route(); else location.hash=h; }
function fatal(err){ console.error(err); const b=document.getElementById("boot-error"); if(b){ b.style.display="block"; const m=b.querySelector("#be-msg"); if(m) m.textContent=(err&&err.message)||String(err); } }
window.addEventListener("error", e=>fatal(e.error||e.message));
window.addEventListener("unhandledrejection", e=>fatal(e.reason));

const App = {
  deferredPrompt:null,
  state:{ view:"search", page:0, list:null, filterLetter:"", filterBrand:"", vehBrand:"", vehModel:"", vehEngine:"", vehCat:"", recBrand:"", recYear:"" },
  async start(){
    try{
      await Auth.init();
      Veille.mergeModels();
      if(!Session.get() && await Auth.autoLogin()){}
      window.addEventListener("hashchange", ()=>App.route());
      window.addEventListener("beforeinstallprompt", e=>{ e.preventDefault(); App.deferredPrompt=e; });
      window.addEventListener("online", ()=>{ App.updateNet(); toast("🌐 Connexion rétablie"); });
      window.addEventListener("offline", ()=>{ App.updateNet(); toast("⛔ Hors ligne — mode local"); });
      Updater.checkAndApply().then(r=>{ if(r.ok) toast("✅ MAJ v"+r.version+" appliquée"); }).catch(()=>{});
      /* Veille 15 j automatique (candidats en attente ; approbation admin seule) */
      if (Veille.due()) Veille.check().then(r=>{ if(r.ok && r.count && isAdmin()) toast("🛰️ Veille 15 j : "+r.count+" nouveauté(s) à approuver"); }).catch(()=>{});
      App.route();
      const st=await SelfTest.run(); const bad=SelfTest.failures();
      if(bad.length) toast("⚠️ Autocontrôle : "+bad.length+" anomalie(s) — ouvrez 🩺");
      else toast("✅ Autocontrôle OK — application vérifiée sans bug");
    }catch(err){ fatal(err); }
  },
  updateNet(){ const on=navigator.onLine; $$("[id^=netbadge]").forEach(el=>{ el.textContent=on?"🌐 connecté":"⛔ hors ligne"; el.className="tag "+(on?"on":"off"); }); },
  async doShare(){ const url=location.origin+location.pathname; try{ if(navigator.share){ await navigator.share({title:"Ma Tech by Kevin",url}); toast("✅ Lien partagé"); } else { await navigator.clipboard.writeText(url); toast("🔗 Lien copié"); } }catch(e){ toast("Partage annulé"); } },
  async doInstall(){ if(App.deferredPrompt){ App.deferredPrompt.prompt(); const r=await App.deferredPrompt.userChoice; toast(r.outcome==="accepted"?"📥 Installation lancée":"Annulé"); App.deferredPrompt=null; } else toast("ℹ️ Menu navigateur → Installer"); },
  route(){
    try{
      if(!Session.get()) return App.renderLogin();
      const h=location.hash.replace(/^#\//,"")||"search"; const [view,arg]=h.split("/");
      if(view==="admin"&&!isAdmin()){ if(location.hash!=="#/search") location.hash="#/search"; return; }
      App.state.view=view;
      if(view==="fiche"&&arg) return App.renderShell(App.renderFiche(decodeURIComponent(arg)));
      if(view==="rappel"&&arg) return App.renderShell(App.renderRappel(decodeURIComponent(arg)));
      const V={search:App.renderSearch,codes:App.renderCodes,veh:App.renderVeh,recalls:App.renderRecalls,admin:App.renderAdmin,diag:App.renderDiag};
      App.renderShell((V[view]||App.renderSearch)()); window.scrollTo(0,0);
    }catch(err){ fatal(err); }
  },
  renderShell(body){
    const role=Session.role(); const pend=isAdmin()?Veille.candidates().length:0;
    $("#app").innerHTML=`
    <div class="topbar"><div class="logo">⚙️ Ma Tech <span>by Kevin</span></div>
      <span class="badge ${role==='admin'?'b-admin':'b-tier'}">${role==='admin'?'ADMIN':'TIERS'}</span>
      <span class="tag" id="netbadge"></span><div class="spacer"></div>
      <button class="btn sec small" data-act="nav" data-view="diag">🩺</button>
      <button class="btn sec small" data-act="share">🔗</button><button class="btn sec small" data-act="install">📥</button>
      <button class="btn sec small" data-act="logout">Déconnexion</button></div>
    <nav class="tabs" style="padding:.4rem 1rem;background:rgba(19,26,42,.8);backdrop-filter:blur(8px);border-bottom:1px solid var(--bd);display:flex">
      <button type="button" data-act="nav" data-view="search" class="${App.state.view==='search'?'active':''}">🔍 Recherche</button>
      <button type="button" data-act="nav" data-view="codes" class="${App.state.view==='codes'?'active':''}">📟 Codes DTC</button>
      <button type="button" data-act="nav" data-view="veh" class="${App.state.view==='veh'?'active':''}">🚗 Véhicules</button>
      <button type="button" data-act="nav" data-view="recalls" class="${App.state.view==='recalls'||App.state.view==='rappel'?'active':''}">📢 Rappels</button>
      ${isAdmin()?'<button type="button" data-act="nav" data-view="admin" class="'+(App.state.view==='admin'?'active':'')+'">🛠️ Admin'+(pend?' ('+pend+')':'')+'</button>':''}
    </nav>
    <main>${body}</main>
    <div class="footer">Ma Tech by Kevin v${CONFIG.VERSION} — pack v${Updater.applied()} — veille 15 j (approbation admin) — fond véhicule permanent — 2017 → 2026</div>`;
    App.updateNet(); App.bindView();
  },
  renderLogin(){ const setup=!Auth.hasAdmin();
    $("#app").innerHTML=`<div class="login-wrap"><div class="card login-box">
      <div class="logo" style="font-size:1.4rem">⚙️ Ma Tech <span>by Kevin</span></div>
      ${setup?`<h3 style="margin-top:.8rem">🔐 Première utilisation — définir le mot de passe admin</h3><label>Identifiant</label><input id="s-user" placeholder="admin"><label>Mot de passe (6 min)</label><input id="s-pass" type="password"><label>Confirmation</label><input id="s-conf" type="password"><button class="btn" id="s-go" style="width:100%;margin-top:.8rem">Créer et ouvrir</button><div class="err-msg" id="s-err"></div>`
      :`<label style="margin-top:.8rem">Identifiant</label><input id="l-user"><label>Mot de passe</label><input id="l-pass" type="password"><label class="row" style="font-size:.82rem"><input type="checkbox" id="l-rem" style="width:auto"> Se souvenir sur cet appareil</label><button class="btn" id="l-admin" style="width:100%;margin-top:.8rem">Connexion</button><div class="err-msg" id="l-err"></div>`}
      <hr style="border-color:var(--bd);margin:1rem 0"><label>Code tiers</label><input id="l-code" placeholder="TIER-XXXXXX" style="text-transform:uppercase"><button class="btn sec" id="l-tier" style="width:100%;margin-top:.6rem">Accès tiers</button><div class="err-msg" id="l-err2"></div>
    </div></div>`;
    if(setup) $("#s-go").onclick=async()=>{const p=$("#s-pass").value,c=$("#s-conf").value; if(p.length<6)return $("#s-err").textContent="6 min."; if(p!==c)return $("#s-err").textContent="Différent."; await Auth.setupAdmin($("#s-user").value.trim()||"admin",p); location.hash="#/search"; App.route();};
    else $("#l-admin").onclick=async()=>{const ok=await Auth.loginAdmin($("#l-user").value.trim(),$("#l-pass").value,$("#l-rem").checked); if(ok){location.hash="#/search";App.route();} else $("#l-err").textContent="Incorrect.";};
    $("#l-tier").onclick=()=>{ if(Auth.loginTier($("#l-code").value)){location.hash="#/search";App.route();} else $("#l-err2").textContent="Code invalide."; };
  },
  renderDiag(){ const rows=SelfTest.last().map(r=>`<tr><td>${r.ok?"✅":"❌"}</td><td>${esc(r.name)}</td><td class="muted">${esc(r.detail||"")}</td></tr>`).join("");
    return `<div class="card"><h1>🩺 Autocontrôle</h1><div class="row"><button class="btn" data-act="diag-run">Relancer</button><button class="btn sec" data-act="diag-clearsw">Vider cache SW</button></div>
      <table style="margin-top:.8rem"><thead><tr><th>État</th><th>Test</th><th>Détail</th></tr></thead><tbody>${rows||'<tr><td colspan=3>Lancez les tests.</td></tr>'}</tbody></table></div>`; },
  renderSearch(){ return `<div class="card"><h1>Recherche pannes + rappels + bulletins</h1><div class="row" style="margin-top:.6rem"><input id="q" placeholder="P0420, chaîne 1.5 HDI, AdBlue, ressorts Bigster, batterie Elroq…" style="flex:1"><button class="btn" data-act="search-go">Rechercher</button></div></div><div id="tsb-results"></div><div id="results"></div><div id="recall-results"></div>`; },
  doSearch(){ const q=$("#q").value.trim(); if(!q)return;
    const tsbs=TSB.search(q); $("#tsb-results").innerHTML=tsbs.length?`<div class="card"><h3>📚 Pannes connues & bulletins (${tsbs.length})</h3><table><tbody>${tsbs.map(t=>`<tr data-act="open-tsb" data-id="${esc(t.id)}" style="cursor:pointer"><td><span class="tag b">${esc(TSB.SRC[t.src]||t.src)}</span></td><td><b>${esc(t.comp)}</b></td><td class="muted">${(t.en&&t.en.length)?esc(t.en.join("/")):"toutes"}</td></tr>`).join("")}</tbody></table></div>`:"";
    let keys=[]; if(/^[pbcu][0-3]/i.test(q)) keys=DT.findByCode(q).map(e=>e.key); else { const n=q.toLowerCase(); for(let i=0;i<CONFIG.TOTAL_FICHES&&keys.length<300;i++){ const f=DT.ficheAt(i); if(f.title.toLowerCase().includes(n)) keys.push(f.key); } }
    App.state.list=keys.slice(0,500); App.state.page=0; $("#results").innerHTML=App.listHTML(App.state.list,"fiche(s)");
    const recs=Recalls.search(q.toLowerCase()); $("#recall-results").innerHTML=recs.length?`<div class="card"><h3>📢 Rappels (${recs.length})</h3><table><tbody>${recs.map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer"><td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td></tr>`).join("")}</tbody></table></div>`:""; },
  renderCodes(){ return `<div class="card"><h1>Tous les codes DTC</h1><div class="row" style="margin-top:.5rem"><select id="f-letter"><option value="">Tous</option>${["P","B","C","U"].map(l=>`<option ${App.state.filterLetter===l?'selected':''}>${l}</option>`).join("")}</select><select id="f-brand"><option value="">Toutes marques</option>${BRANDS.map(b=>`<option ${App.state.filterBrand===b.n?'selected':''}>${esc(b.n)}</option>`).join("")}</select><button class="btn" data-act="codes-go">Filtrer</button></div></div><div id="results"></div><div id="pager" class="pager"></div>`; },
  applyCodesFilter(){ const L=$("#f-letter")?$("#f-letter").value:""; const B=$("#f-brand")?$("#f-brand").value:""; App.state.filterLetter=L; App.state.filterBrand=B; const keys=[];
    if(B){ const bi=BRANDS.findIndex(b=>b.n===B), n=BRANDS.length, per=Math.ceil(5000/n); for(let k=0;k<per;k++){ const j=k*n+bi; if(j>=5000)break; keys.push("P1"+String((j*7)%1000).padStart(3,"0")+"@"+B); } }
    else { const li=L?["P","B","C","U"].indexOf(L):-1; const s=li>=0?li*4000:0,e=li>=0?s+4000:16000; for(let i=s;i<e;i++) keys.push(DT.codeFromIndex(i)); }
    App.state.list=keys; App.state.page=0; App.renderPage(); },
  renderPage(){ const keys=App.state.list||[]; const pages=Math.max(1,Math.ceil(keys.length/CONFIG.PAGE_SIZE)); App.state.page=Math.min(Math.max(0,App.state.page),pages-1);
    $("#results").innerHTML=App.listHTML(keys.slice(App.state.page*CONFIG.PAGE_SIZE,App.state.page*CONFIG.PAGE_SIZE+CONFIG.PAGE_SIZE), keys.length+" fiche(s)");
    $("#pager").innerHTML=pages>1?`<button class="btn sec small" data-act="page-prev" ${App.state.page===0?'disabled':''}>◀</button><span class="muted">${App.state.page+1}/${pages}</span><button class="btn sec small" data-act="page-next" ${App.state.page>=pages-1?'disabled':''}>▶</button>`:""; },
  listHTML(keys,label){ if(!keys||!keys.length) return `<div class="card muted">Aucun résultat.</div>`;
    return `<div class="card"><div class="muted">${esc(label)}</div><table><thead><tr><th>Code</th><th>Description</th><th>Sév.</th></tr></thead><tbody>${keys.map(k=>{const f=resolveFiche(k); return f?`<tr data-act="open-fiche" data-key="${esc(k)}" style="cursor:pointer"><td class="code">${esc(f.code)}</td><td>${esc(f.title.slice(0,80))}</td><td><span class="sev s${f.sev}"></span></td></tr>`:"";}).join("")}</tbody></table></div>`; },
  renderVeh(){ const S=App.state; const b=S.vehBrand?findBrand(S.vehBrand):null;
    if(!b){ const list=BRANDS.filter(x=>!S.vehCat||x.o===S.vehCat);
      return `<div class="card"><h1>Marques 2017-2026</h1><div class="row" style="margin-top:.5rem">${[["","Toutes"],["FR","Françaises"],["EU","Européennes"],["US","Américaines"],["AS","Asiatiques"]].map(c=>`<button class="btn ${S.vehCat===c[0]?'':'sec'} small" data-act="veh-cat" data-cat="${c[0]}">${c[1]}</button>`).join("")}</div></div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${list.map(x=>`<div class="card" style="cursor:pointer;margin:0" data-act="veh-brand" data-brand="${esc(x.n)}"><h3>${esc(x.n)}</h3><div class="muted">${CATS[x.o]} • ${x.models.length} modèles</div></div>`).join("")}</div>`; }
    const models=brandModels(b); const model=S.vehModel?models.find(m=>m.name===S.vehModel):null;
    if(!model){ return `<div class="card"><div class="row"><h1>${esc(b.n)} — modèles</h1><div class="spacer"></div><button class="btn sec small" data-act="veh-reset" data-level="brands">←</button></div></div><div class="card"><table><tbody>${models.map(m=>`<tr data-act="veh-model" data-model="${esc(m.name)}" style="cursor:pointer"><td><b>${esc(m.name)}</b></td><td class="muted">${m.y0} → 2026</td></tr>`).join("")}</tbody></table></div>`; }
    if(!S.vehEngine){ return `<div class="card"><div class="row"><h1>${esc(b.n)} ${esc(model.name)}</h1><div class="spacer"></div><button class="btn sec small" data-act="veh-reset" data-level="models">←</button></div></div><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${model.engines.map(e=>`<div class="card" style="cursor:pointer;margin:0" data-act="veh-engine" data-engine="${esc(e)}"><h3>⚙️ ${esc(e)}</h3><span class="tag b">${esc(DT.energyOf(e))}</span></div>`).join("")}</div>`; }
    const energy=DT.energyOf(S.vehEngine); const modelKey=model.name+"|"+model.y0;
    const res=DT.faultsForVehicle(b.n,modelKey,S.vehEngine); const sysF=DT.systemFaultsFor(b.n,modelKey,S.vehEngine);
    const recs=Recalls.forVehicle(b.n,modelKey,S.vehEngine); const tsbs=TSB.forVehicle(b.n,model.name,model.y0,S.vehEngine);
    return `<div class="card"><div class="row" style="flex-wrap:wrap"><h1>${esc(b.n)} ${esc(model.name)}</h1><span class="tag b">⚙️ ${esc(S.vehEngine)}</span><span class="tag">⚡ ${esc(energy)}</span><span class="tag">${Recalls.powerOf(S.vehEngine)||"—"} ch</span><div class="spacer"></div><button class="btn sec small" data-act="veh-reset" data-level="engines">←</button></div>
      <p class="muted" style="margin-top:.4rem">Propulsion <b>${esc(energy)}</b> — ${res.faults.length} DTC • ${sysF.length} système • ${tsbs.length} TSB • ${recs.length} rappels.</p></div>
      ${tsbs.length?`<div class="card"><h3>📚 Pannes connues & bulletins</h3><table><tbody>${tsbs.map(t=>`<tr data-act="open-tsb" data-id="${esc(t.id)}" style="cursor:pointer"><td><span class="tag b">${esc(TSB.SRC[t.src]||t.src)}</span></td><td><b>${esc(t.comp)}</b></td><td class="muted">${esc(t.sym.slice(0,2).join(" • "))}</td></tr>`).join("")}</tbody></table></div>`:`<div class="card muted">Aucune panne connue/TSB pour cette propulsion.</div>`}
      ${recs.length?`<div class="card"><h3>📢 Rappels applicables</h3><table><tbody>${recs.map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer"><td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="card muted">Aucun rappel.</div>`}
      ${sysF.map(f=>`<div class="card"><h3>🧰 ${esc(f.comp)}</h3><p class="muted"><b>Panne :</b> ${esc(f.fault)}</p><p class="muted"><b>Symptômes :</b> ${esc(f.symptoms.join(" • "))}</p><p class="muted"><b>Solutions :</b> ${esc(f.fixes.join(" • "))}</p><div>${f.dtcs.map(c=>`<button class="btn sec small" data-act="open-fiche" data-key="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>`).join("")}
      ${App.listHTML(res.faults.map(f=>f.key),"Codes DTC — "+esc(energy))}`; },
  renderRecalls(){ const S=App.state; let list=Recalls.all(); if(S.recBrand) list=list.filter(r=>r.brands.includes(S.recBrand)); if(S.recYear) list=list.filter(r=>!(+S.recYear>r.y1||+S.recYear<r.y0));
    return `<div class="card"><h1>📢 Rappels (${list.length})</h1><div class="row"><select id="r-brand"><option value="">Toutes</option>${BRANDS.map(b=>`<option ${S.recBrand===b.n?'selected':''}>${esc(b.n)}</option>`).join("")}</select><select id="r-year"><option value="">Toutes années</option>${CONFIG.YEARS.map(y=>`<option ${S.recYear==y?'selected':''}>${y}</option>`).join("")}</select><button class="btn" data-act="recalls-go">Filtrer</button></div></div>
    <div class="card"><table><tbody>${list.slice(0,300).map(r=>`<tr data-act="open-rappel" data-id="${esc(r.id)}" style="cursor:pointer"><td class="code">${esc(r.id)}</td><td>${esc(r.comp)}</td><td class="muted">${(r.fuels&&r.fuels.length)?esc(r.fuels.join("/")):"toutes"}</td></tr>`).join("")}</tbody></table></div>`; },
  renderRappel(id){ const r=Recalls.byId(id); if(!r) return `<div class="card">Introuvable.</div>`;
    return `<div class="card"><div class="row"><span class="code">${esc(r.id)}</span><span class="tag">${(r.fuels&&r.fuels.length)?esc(r.fuels.join("/")):"toutes énergies"}</span><div class="spacer"></div><button class="btn sec small" data-act="back">←</button></div><h2 style="margin-top:.6rem">${esc(r.comp)}</h2><p><b>Risque :</b> ${esc(r.risk)}</p><p><b>Solution :</b> ${esc(r.fix)}</p></div>`; },
  renderFiche(key){ const f=resolveFiche(key); if(!f) return `<div class="card">Introuvable.</div>`;
    return `<div class="card"><div class="row"><span class="code">${esc(f.code)}</span><span class="tag"><span class="sev s${f.sev}"></span>${esc(f.sevLabel)}</span><div class="spacer"></div><button class="btn sec small" data-act="back">←</button>${isAdmin()?`<button class="btn small" data-act="fiche-edit" data-key="${esc(key)}">✏️</button>`:''}</div><h2 style="margin-top:.6rem">${esc(f.title)}</h2><p>${esc(f.desc)}</p></div>`; },
  renderAdmin(){ return `<div class="row" style="margin-bottom:1rem"><button class="btn small" id="a-new">➕ Fiche</button><button class="btn sec small" id="a-export">⬇️ Export</button><button class="btn sec small" data-act="nav" data-view="diag">🩺 Autocontrôle</button><div class="spacer"></div>
    <select id="a-tab" style="max-width:220px"><option value="veille">🛰️ Veille 15 j</option><option value="customs">Fiches perso</option><option value="tsb">📚 TSB perso</option><option value="recalls">Rappels perso</option><option value="update">📦 MAJ APK</option><option value="tiers">Tiers</option><option value="audit">Audit</option><option value="secu">Sécurité</option></select></div><div id="a-body"></div>`; },
  adminTab(t){ const B=$("#a-body");
    if(t==="veille"){ const c=Veille.candidates();
      B.innerHTML=`<div class="card"><h3>🛰️ Veille automatique (tous les ${Veille.PERIOD_DAYS} jours)</h3>
        <p class="muted">Prochaine vérif auto dans <b>${Veille.daysLeft()} j</b> • En attente d'approbation : <b>${c.length}</b> • Seul l'admin diffuse aux tiers.</p>
        <div class="row" style="margin-top:.6rem"><button class="btn" id="v-check">🔄 Vérifier maintenant</button><button class="btn sec" id="v-all">✅ Tout approuver</button></div>
        <hr style="border-color:var(--bd);margin:1rem 0"><h3>🌐 Recherche NHTSA en direct</h3>
        <div class="grid g2"><div><label>Marque</label><input id="v-make" placeholder="Skoda"></div><div><label>Modèle</label><input id="v-model" placeholder="Elroq"></div><div><label>Année</label><input id="v-year" type="number" value="2026"></div></div>
        <button class="btn sec" id="v-nhtsa" style="margin-top:.6rem">Interroger NHTSA</button><div id="v-msg"></div></div>
        <div class="card"><h3>Candidats (${c.length})</h3>${c.length?`<table><thead><tr><th></th><th>Type</th><th>Marque/Modèle</th><th>Objet</th><th></th></tr></thead><tbody>
        ${c.map(x=>`<tr><td><input type="checkbox" class="v-sel" data-vid="${esc(x.id)}" style="width:auto"></td><td><span class="tag b">${esc(x.type)}</span></td><td>${esc(x.brand||"")} ${esc(x.model||"")}</td><td>${esc((x.comp||x.title||"").slice(0,60))}</td><td><button class="btn small" data-va="${esc(x.id)}">Approuver</button></td></tr>`).join("")}
        </tbody></table>`:'<p class="muted">Aucun candidat en attente.</p>'}</div>`;
      $("#v-check").onclick=async()=>{ const r=await Veille.check(true); toast(r.ok?("🛰️ +"+r.count+" candidat(s)"):"ℹ️ "+r.reason); App.adminTab("veille"); };
      $("#v-all").onclick=()=>{ if(c.length&&confirm("Approuver tous les candidats ?")){ Veille.approve(c.map(x=>x.id)); toast("✅ Approuvés — publiez la MAJ pour diffusion"); App.adminTab("veille"); } };
      $("#v-nhtsa").onclick=async()=>{ try{ const l=await Veille.nhtsa($("#v-make").value.trim(),$("#v-model").value.trim(),+$("#v-year").value); const n=Veille.importNhtsa(l); $("#v-msg").innerHTML=`<div class="ok-msg">${n} résultat(s) ajouté(s) aux candidats.</div>`; setTimeout(()=>App.adminTab("veille"),1200); }catch(e){ $("#v-msg").innerHTML=`<div class="err-msg">NHTSA injoignable : ${esc(e.message)}</div>`; } };
      B.querySelectorAll("[data-va]").forEach(b=>b.onclick=()=>{ Veille.approve([b.dataset.va]); toast("✅ Approuvé"); App.adminTab("veille"); });
      return; }
    if(t==="customs"){ const c=Store.customs(); B.innerHTML=`<div class="card"><h3>Fiches perso (${c.length})</h3>${c.length?`<table><tbody>${c.map((x,i)=>`<tr><td class="code">${esc(x.code)}</td><td>${esc(x.title.slice(0,50))}</td><td><button class="btn small sec" data-ce="${i}">✏️</button> <button class="btn small danger" data-cd="${i}">🗑️</button></td></tr>`).join("")}</tbody></table>`:'<p class="muted">Aucune.</p>'}</div>`;
      B.querySelectorAll("[data-ce]").forEach(b=>b.onclick=()=>App.openEditor(Store.customs()[+b.dataset.ce]));
      B.querySelectorAll("[data-cd]").forEach(b=>b.onclick=()=>{ if(confirm("Supprimer ?")){ Store.removeCustom(+b.dataset.cd); App.adminTab("customs"); }}); return; }
    if(t==="tsb"){ const l=TSB.customs(); B.innerHTML=`<div class="card"><h3>TSB perso (${l.length})</h3>${l.length?`<table><tbody>${l.map((x,i)=>`<tr><td class="code">${esc(x.id)}</td><td>${esc(x.comp)}</td><td><button class="btn small danger" data-td="${i}">🗑️</button></td></tr>`).join("")}</tbody></table>`:'<p class="muted">Aucun.</p>'}</div>`;
      B.querySelectorAll("[data-td]").forEach(b=>b.onclick=()=>{ if(confirm("Supprimer ?")){ const x=TSB.customs(); x.splice(+b.dataset.td,1); TSB.saveCustoms(x); App.adminTab("tsb"); }}); return; }
    if(t==="recalls"){ const l=Recalls.customs(); B.innerHTML=`<div class="card"><h3>Rappels perso (${l.length})</h3>${l.length?`<table><tbody>${l.map((x,i)=>`<tr><td class="code">${esc(x.id)}</td><td>${esc(x.comp)}</td><td><button class="btn small danger" data-rd="${i}">🗑️</button></td></tr>`).join("")}</tbody></table>`:'<p class="muted">Aucun.</p>'}</div>`;
      B.querySelectorAll("[data-rd]").forEach(b=>b.onclick=()=>{ if(confirm("Supprimer ?")){ const x=Recalls.customs(); x.splice(+b.dataset.rd,1); Recalls.saveCustoms(x); App.adminTab("recalls"); }}); return; }
    if(t==="update"){ const meta=Updater.meta();
      B.innerHTML=`<div class="card"><h3>📦 MAJ (admin) — diffusion aux tiers</h3><p class="muted">Appliquée v${Updater.applied()} • Serveur <span id="u-srv">…</span></p>
        <div class="grid g2"><div><label>Version</label><input id="u-ver" type="number" value="${Updater.applied()+1}"></div><div><label>Notes</label><input id="u-notes"></div></div>
        <div class="row" style="margin-top:.6rem"><button class="btn" id="u-dl">⬇️ Pack</button><button class="btn sec" id="u-check">🔄 Vérifier</button></div>
        <hr style="border-color:var(--bd)"><div class="grid g2"><div><label>Jeton GitHub</label><input id="u-token" type="password"></div><div><label>Owner/repo</label><div class="row"><input id="u-owner"><input id="u-repo"></div></div></div>
        <button class="btn" id="u-gh" style="margin-top:.6rem">🚀 Publier (diffusion tiers)</button><div id="u-msg"></div>
        <p class="muted" style="margin-top:.6rem">Inclut fiches, TSB, rappels, codes tiers et modèles/motorisations approuvés via la veille.</p></div>`;
      const d=Updater.detectRepo(); $("#u-owner").value=d.owner; $("#u-repo").value=d.repo;
      Updater.serverManifest().then(m=>{ $("#u-srv").textContent=m?"v"+m.version:"aucune"; if(m)$("#u-ver").value=m.version+1; });
      $("#u-check").onclick=async()=>{ const r=await Updater.checkAndApply(); toast(r.ok?"✅ v"+r.version:"ℹ️ "+r.reason); App.adminTab("update"); };
      $("#u-dl").onclick=()=>{ const v=+$("#u-ver").value,n=$("#u-notes").value; Updater.download("update-pack.json",Updater.buildPack(v,n)); setTimeout(()=>Updater.download("update.json",Updater.manifestFor(v,n)),500); };
      $("#u-gh").onclick=async()=>{ const tk=$("#u-token").value.trim(),ow=$("#u-owner").value.trim(),rp=$("#u-repo").value.trim(); if(!tk||!ow||!rp) return $("#u-msg").innerHTML='<div class="err-msg">Champs requis.</div>';
        const v=+$("#u-ver").value,n=$("#u-notes").value;
        try{ await Updater.ghPut("data/update-pack.json",JSON.stringify(Updater.buildPack(v,n),null,2),tk,ow,rp); await Updater.ghPut("update.json",JSON.stringify(Updater.manifestFor(v,n),null,2),tk,ow,rp); $("#u-msg").innerHTML='<div class="ok-msg">✅ Publiée v'+v+' — diffusion auto tiers.</div>'; }catch(e){ $("#u-msg").innerHTML='<div class="err-msg">'+esc(e.message)+'</div>'; } };
      return; }
    if(t==="tiers"){ const l=Auth.tiers(); B.innerHTML=`<div class="card"><h3>Créer un tiers</h3><div class="grid g2"><div><label>Nom</label><input id="t-name"></div><div><label>Expiration</label><input id="t-exp" type="date"></div></div><button class="btn" id="t-add" style="margin-top:.6rem">Générer</button><div id="t-new"></div></div>
      <div class="card"><h3>Codes (${l.length})</h3><table><tbody>${l.map(x=>`<tr><td class="code">${esc(x.code)}</td><td>${esc(x.name)}</td><td>${x.active?'actif':'inactif'}</td><td><button class="btn small sec" data-tt="${esc(x.code)}">${x.active?"Désactiver":"Activer"}</button> <button class="btn small danger" data-tx="${esc(x.code)}">🗑️</button></td></tr>`).join("")}</tbody></table></div>`;
      $("#t-add").onclick=()=>{ const c=Auth.addTier($("#t-name").value||"Accès tiers",$("#t-exp").value||null); $("#t-new").innerHTML=`<div class="ok-msg">Code : <b class="code">${c}</b></div>`; setTimeout(()=>App.adminTab("tiers"),1200); };
      B.querySelectorAll("[data-tt]").forEach(b=>b.onclick=()=>{ Auth.toggleTier(b.dataset.tt); App.adminTab("tiers"); });
      B.querySelectorAll("[data-tx]").forEach(b=>b.onclick=()=>{ if(confirm("Supprimer ?")){ Auth.removeTier(b.dataset.tx); App.adminTab("tiers"); }}); return; }
    if(t==="audit"){ const l=Store.read(CONFIG.K.audit,[]); B.innerHTML=`<div class="card"><h3>Journal (${l.length})</h3><table><tbody>${l.slice(0,200).map(x=>`<tr><td class="muted">${esc(x.d.replace("T"," ").slice(0,16))}</td><td>${esc(x.u)}</td><td>${esc(x.action)}</td></tr>`).join("")}</tbody></table></div>`; return; }
    if(t==="secu"){ B.innerHTML=`<div class="card" style="max-width:420px"><h3>Mot de passe admin</h3><label>Actuel</label><input type="password" id="s-cur"><label>Nouveau</label><input type="password" id="s-new"><label>Confirmation</label><input type="password" id="s-conf"><button class="btn" id="s-go" style="margin-top:.6rem">Changer</button><button class="btn sec" id="s-forget" style="margin-top:.6rem">Oublier appareil</button><div id="s-msg"></div></div>`;
      $("#s-go").onclick=async()=>{ if($("#s-new").value!==$("#s-conf").value) return $("#s-msg").innerHTML='<div class="err-msg">Différent.</div>'; if($("#s-new").value.length<6) return $("#s-msg").innerHTML='<div class="err-msg">6 min.</div>'; const ok=await Auth.changePassword($("#s-cur").value,$("#s-new").value); $("#s-msg").innerHTML=ok?'<div class="ok-msg">Modifié.</div>':'<div class="err-msg">Actuel incorrect.</div>'; };
      $("#s-forget").onclick=()=>{ Auth.forgetDevice(); $("#s-msg").innerHTML='<div class="ok-msg">Mémorisation supprimée.</div>'; }; return; }
  },
  bindAdmin(){ $("#a-tab").onchange=e=>App.adminTab(e.target.value); $("#a-new").onclick=()=>App.openEditor(null);
    $("#a-export").onclick=()=>{ Updater.download("sauvegarde-"+Date.now()+".json",{overrides:JSON.parse(localStorage.getItem(CONFIG.K.overrides)||"{}"),customs:Store.customs(),recalls:Recalls.customs(),tsb:TSB.customs(),tiers:Auth.tiers(),modelsExtra:Veille.modelsExtra()}); };
    App.adminTab("veille"); },
  openEditor(f){ const isNew=!f; if(isNew) f={key:"",code:"",brand:"",title:"",desc:"",sev:2,symptoms:[],causes:[],solutions:[]};
    const bg=document.createElement("div"); bg.className="modal-bg";
    bg.innerHTML=`<div class="modal"><h2>${isNew?"➕ Nouvelle fiche":"✏️ "+esc(f.code)}</h2><label>Code</label><input id="e-code" value="${esc(f.code)}" ${isNew?"":"disabled"}><label>Titre</label><input id="e-title" value="${esc(f.title)}"><label>Symptômes (1/ligne)</label><textarea id="e-sym" rows="2">${esc(f.symptoms.join("\n"))}</textarea><label>Solutions (1/ligne)</label><textarea id="e-sol" rows="2">${esc(f.solutions.join("\n"))}</textarea><div class="row" style="justify-content:flex-end"><button class="btn sec" data-act="modal-close">Annuler</button><button class="btn" id="e-save">Enregistrer</button></div><div class="err-msg" id="e-err"></div></div>`;
    document.body.appendChild(bg);
    bg.querySelector("#e-save").onclick=()=>{ const nf={code:bg.querySelector("#e-code").value.trim().toUpperCase(),brand:f.brand||"",title:bg.querySelector("#e-title").value.trim(),desc:f.desc||"",sev:f.sev||2,symptoms:bg.querySelector("#e-sym").value.split("\n").map(x=>x.trim()).filter(Boolean),causes:f.causes||[],solutions:bg.querySelector("#e-sol").value.split("\n").map(x=>x.trim()).filter(Boolean)};
      if(!nf.code||!nf.title) return bg.querySelector("#e-err").textContent="Code+titre requis.";
      nf.sevLabel=["Mineure","Modérée","Sérieuse","Critique"][nf.sev-1]; nf.key=nf.code; nf.brands=nf.brand?[nf.brand]:["Toutes marques"]; nf.motors=["Essence"]; nf.years="2017-2026";
      if(isNew){ if(!/^[PBCU][0-3][0-9A-F]{3}$/.test(nf.code)) return bg.querySelector("#e-err").textContent="Format invalide."; Store.addCustom(nf); } else { const ci=Store.customs().findIndex(c=>c.key===f.key); if(ci>=0) Store.updateCustom(ci,nf); else Store.setOverride(nf.key,nf); }
      bg.remove(); App.route(); }; },
  bindView(){ const v=App.state.view; if(v==="search"){const q=$("#q"); if(q) q.onkeydown=e=>{if(e.key==="Enter")App.doSearch();};} if(v==="codes") App.applyCodesFilter(); if(v==="admin") App.bindAdmin(); },
  openTsb(id){ const t=TSB.byId(id); if(!t) return; const bg=document.createElement("div"); bg.className="modal-bg";
    bg.innerHTML=`<div class="modal"><div class="row"><span class="tag b">${esc(TSB.SRC[t.src]||t.src)}</span><span class="code">${esc(t.id)}</span><div class="spacer"></div><button class="btn sec small" data-act="modal-close">Fermer</button></div><h2 style="margin-top:.6rem">${esc(t.comp)}</h2><p><b>Problème :</b> ${esc(t.prob)}</p><p><b>Symptômes :</b> ${esc(t.sym.join(" • "))}</p><p><b>Solution :</b> ${esc(t.fix)}</p></div>`;
    document.body.appendChild(bg); }
};

document.addEventListener("click", async e => {
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
    case "diag-run": await SelfTest.run(); App.route(); break;
    case "diag-clearsw": if("caches" in window) caches.keys().then(ks=>ks.forEach(k=>caches.delete(k))); if(navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())); toast("Cache vidé — rechargez"); break;
    case "veh-cat": S.vehCat=el.dataset.cat; S.vehBrand=""; S.vehModel=""; S.vehEngine=""; App.route(); break;
    case "veh-brand": S.vehBrand=el.dataset.brand; S.vehModel=""; S.vehEngine=""; App.route(); break;
    case "veh-model": S.vehModel=el.dataset.model; S.vehEngine=""; App.route(); break;
    case "veh-engine": S.vehEngine=el.dataset.engine; App.route(); break;
    case "veh-reset": if(el.dataset.level==="brands"){S.vehBrand="";S.vehModel="";S.vehEngine="";} if(el.dataset.level==="models"){S.vehModel="";S.vehEngine="";} if(el.dataset.level==="engines"){S.vehEngine="";} App.route(); break;
    case "fiche-edit": App.openEditor(resolveFiche(el.dataset.key)); break;
    case "modal-close": el.closest(".modal-bg").remove(); break;
  }
});
App.start();
