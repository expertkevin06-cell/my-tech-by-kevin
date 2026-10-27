"use strict";
const SelfTest = (() => {
  let LAST = [];
  const G = { CONFIG:()=>CONFIG, Store:()=>Store, Session:()=>Session, Auth:()=>Auth, DT:()=>DT, TSB:()=>TSB,
              Recalls:()=>Recalls, Updater:()=>Updater, Veille:()=>Veille, BRANDS:()=>BRANDS, CATS:()=>CATS,
              resolveFiche:()=>resolveFiche, systemFaultsFor:()=>systemFaultsFor, App:()=>App };
  function ev(name, fn){ try{ const v=fn(); if(v===true) return {name,ok:true,detail:""}; if(v&&v.ok) return {name,ok:true,detail:v.detail||""}; return {name,ok:false,detail:(v&&v.detail)||"échec"}; }catch(e){ return {name,ok:false,detail:e.message}; } }
  async function run(){
    LAST=[];
    LAST.push(ev("Globals présents", () => { const m=[]; for(const k of Object.keys(G)){ try{ G[k](); }catch(e){ m.push(k); } } return m.length?{ok:false,detail:"manquants : "+m.join(", ")}:{ok:true,detail:Object.keys(G).length+" globals OK"}; }));
    LAST.push(ev("Scripts JS inclus", () => { const want=["config","store","auth","data","recalls","tsb","veille","updater","selftest","app"]; const srcs=Array.from(document.scripts).map(s=>s.src||""); const miss=want.filter(w=>!srcs.some(s=>s.includes("/js/"+w+".js"))); return miss.length?{ok:false,detail:"absents : "+miss.join(", ")}:{ok:true,detail:want.length+" scripts"}; }));
    LAST.push(ev("DOM #app monté", () => !!document.getElementById("app")));
    LAST.push(ev("localStorage R/W", () => { localStorage.setItem("__t","1"); const ok=localStorage.getItem("__t")==="1"; localStorage.removeItem("__t"); return ok; }));
    LAST.push(ev("Fond d'écran véhicule actif", () => getComputedStyle(document.body).backgroundImage.includes("bg-car") || {ok:false,detail:"background absent"}));
    LAST.push(ev("Panneaux translucides (fond visible)", () => { const c=document.querySelector(".card"); if(!c) return true; const bg=getComputedStyle(c).backgroundColor; return /^rgba/.test(bg) || {ok:false,detail:bg}; }));
    LAST.push(ev("Veille : période 15 j", () => Veille.PERIOD_DAYS===15 || {ok:false,detail:String(Veille.PERIOD_DAYS)}));
    LAST.push(ev("Veille : mergeModels sans erreur", () => { Veille.mergeModels(); return true; }));
    LAST.push(ev("Énergie : Électrique", () => DT.energyOf("Électrique 286")==="Électrique" || {ok:false,detail:DT.energyOf("Électrique 286")}));
    LAST.push(ev("Énergie : Diesel", () => DT.energyOf("1.5 BlueHDi 130")==="Diesel" || {ok:false,detail:DT.energyOf("1.5 BlueHDi 130")}));
    LAST.push(ev("Énergie : Hybride", () => DT.energyOf("E-TECH 145")==="Hybride" || {ok:false,detail:DT.energyOf("E-TECH 145")}));
    LAST.push(ev("DTC EV sans codes thermiques", () => { const f=DT.faultsForVehicle("Skoda","Elroq|2025","Électrique 286").faults.map(x=>x.code); return !f.some(c=>/^(P02|P24|P20|P038)/.test(c)) || {ok:false,detail:"code thermique présent"}; }));
    LAST.push(ev("DTC Diesel contient FAP", () => DT.faultsForVehicle("Peugeot","308 III|2021","1.5 BlueHDi 130").faults.some(x=>x.code.startsWith("P24")) || {ok:false,detail:"aucun FAP"}));
    LAST.push(ev("TSB Elroq = EV only", () => { const ids=TSB.forVehicle("Skoda","Elroq",2025,"Électrique 286").map(t=>t.id); return (!ids.includes("TSB-STL-DV5-CHAIN")) || {ok:false,detail:"TSB thermique sur EV"}; }));
    LAST.push(ev("resolveFiche P0420", () => { const f=resolveFiche("P0420"); return (f&&f.code==="P0420") || {ok:false,detail:"nulle"}; }));
    LAST.push(ev("Rendu recherche OK", () => typeof App.renderSearch()==="string"));
    LAST.push(ev("ServiceWorker dispo", () => ("serviceWorker" in navigator) || {ok:false,detail:"SW non supporté"}));
    try{ const r=await fetch("manifest.json",{cache:"no-store"}); LAST.push({name:"manifest.json accessible",ok:r.ok,detail:"HTTP "+r.status}); }catch(e){ LAST.push({name:"manifest.json accessible",ok:false,detail:e.message}); }
    try{ const r=await fetch("assets/icons/icon-512.png",{cache:"no-store",method:"HEAD"}); LAST.push({name:"icône 512 accessible",ok:r.ok,detail:"HTTP "+r.status}); }catch(e){ LAST.push({name:"icône 512 accessible",ok:false,detail:e.message}); }
    return LAST;
  }
  return { run, last:()=>LAST, failures:()=>LAST.filter(x=>!x.ok) };
})();
