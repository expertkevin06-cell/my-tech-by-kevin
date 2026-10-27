"use strict";
/* Auto-vérification : chaque brique critique est testée au démarrage et à la demande. */
const SelfTest = (() => {
  let LAST = [];
  const ev = (name, fn) => { try { const v = fn(); if (v === true) return {name, ok:true, detail:""}; if (v && v.ok) return {name, ok:true, detail:v.detail||""}; return {name, ok:false, detail:(v&&v.detail)||"échec"}; } catch(e){ return {name, ok:false, detail:e.message}; } };

  async function run(){
    LAST = [];
    LAST.push(ev("Globals présents", () => ["CONFIG","Store","Session","Auth","DT","TSB","Recalls","Updater","BRANDS","CATS","resolveFiche","systemFaultsFor"].every(g => typeof window[g] !== "undefined") || {ok:false,detail:"global manquant"}));
    LAST.push(ev("DOM #app monté", () => !!document.getElementById("app")));
    LAST.push(ev("localStorage R/W", () => { localStorage.setItem("__t","1"); const ok = localStorage.getItem("__t")==="1"; localStorage.removeItem("__t"); return ok; }));
    LAST.push(ev("Énergie : Électrique", () => DT.energyOf("Électrique 286")==="Électrique" || {ok:false,detail:DT.energyOf("Électrique 286")}));
    LAST.push(ev("Énergie : Diesel", () => DT.energyOf("1.5 BlueHDi 130")==="Diesel" || {ok:false,detail:DT.energyOf("1.5 BlueHDi 130")}));
    LAST.push(ev("Énergie : Essence", () => DT.energyOf("1.0 TCe 90")==="Essence" || {ok:false,detail:DT.energyOf("1.0 TCe 90")}));
    LAST.push(ev("Énergie : Hybride (E-Tech)", () => DT.energyOf("E-TECH 145")==="Hybride" || {ok:false,detail:DT.energyOf("E-TECH 145")}));
    LAST.push(ev("DTC EV sans codes diesel", () => { const f=DT.faultsForVehicle("Skoda","Elroq|2025","Électrique 286").faults.map(x=>x.code); return !f.some(c=>/^(P02|P24|P20|P038)/.test(c)) || {ok:false,detail:"code thermique présent"}; }));
    LAST.push(ev("DTC EV contient HV", () => DT.faultsForVehicle("Skoda","Elroq|2025","Électrique 286").faults.some(x=>x.code.startsWith("P0A")) || {ok:false,detail:"aucun code HV"}));
    LAST.push(ev("DTC Diesel contient FAP", () => DT.faultsForVehicle("Peugeot","308 III|2021","1.5 BlueHDi 130").faults.some(x=>x.code.startsWith("P24")) || {ok:false,detail:"aucun code FAP"}));
    LAST.push(ev("Système EV sans AdBlue", () => !DT.systemFaultsFor("Skoda","Elroq|2025","Électrique 286").some(x=>/AdBlue/.test(x.comp)) || {ok:false,detail:"AdBlue sur EV"}));
    LAST.push(ev("Système Diesel avec AdBlue", () => DT.systemFaultsFor("Peugeot","308 III|2021","1.5 BlueHDi 130").some(x=>/AdBlue/.test(x.comp)) || {ok:false,detail:"AdBlue absent"}));
    LAST.push(ev("TSB Elroq = EV only", () => { const ids=TSB.forVehicle("Skoda","Elroq",2025,"Électrique 286").map(t=>t.id); return (!ids.includes("TSB-STL-DV5-CHAIN") && !ids.includes("BUL-STL-DV5-ADB")) || {ok:false,detail:"TSB thermique sur EV"}; }));
    LAST.push(ev("TSB 308 diesel = chaîne DV5", () => TSB.forVehicle("Peugeot","308 III",2021,"1.5 BlueHDi 130").some(t=>t.id==="TSB-STL-DV5-CHAIN") || {ok:false,detail:"TSB chaîne absent"}));
    LAST.push(ev("Rappel Elroq ≠ courroie PSA", () => !Recalls.forVehicle("Skoda","Elroq|2025","Électrique 286").some(r=>r.id==="RAP-PSA-2019-COURROIE") || {ok:false,detail:"rappel essence sur EV"}));
    LAST.push(ev("resolveFiche P0420", () => { const f=resolveFiche("P0420"); return (f && f.code==="P0420") || {ok:false,detail:"fiche nulle"}; }));
    LAST.push(ev("resolveFiche code@marque", () => { const f=resolveFiche("P0420@Renault"); return (f && f.brand==="Renault") || {ok:false,detail:"marque absente"}; }));
    LAST.push(ev("Rendu recherche OK", () => typeof App.renderSearch()==="string" && App.renderSearch().includes("Recherche")));
    LAST.push(ev("ServiceWorker dispo", () => ("serviceWorker" in navigator) || {ok:false,detail:"SW non supporté"}));
    try { const r = await fetch("manifest.json", {cache:"no-store"}); LAST.push({name:"manifest.json accessible", ok:r.ok, detail:"HTTP "+r.status}); }
    catch(e){ LAST.push({name:"manifest.json accessible", ok:false, detail:e.message}); }
    try { const r = await fetch("assets/icons/icon-512.png", {cache:"no-store", method:"HEAD"}); LAST.push({name:"icône 512 accessible", ok:r.ok, detail:"HTTP "+r.status}); }
    catch(e){ LAST.push({name:"icône 512 accessible", ok:false, detail:e.message}); }
    return LAST;
  }
  const last = () => LAST;
  const failures = () => LAST.filter(x=>!x.ok);
  return { run, last, failures };
})();
