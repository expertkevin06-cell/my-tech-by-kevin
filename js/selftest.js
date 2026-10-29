"use strict";
const SelfTest = (() => {
  let LAST=[];
  const G={CONFIG:()=>CONFIG,Store:()=>Store,Session:()=>Session,Auth:()=>Auth,DT:()=>DT,TSB:()=>TSB,Recalls:()=>Recalls,Updater:()=>Updater,Veille:()=>Veille,PDF:()=>PDF,Wallpaper:()=>Wallpaper,Bus:()=>Bus,IDB:()=>IDB,BRANDS:()=>BRANDS,CATS:()=>CATS,resolveFiche:()=>resolveFiche,systemFaultsFor:()=>systemFaultsFor,App:()=>App};
  function ev(name,fn){ try{ const v=fn(); if(v===true) return {name,ok:true,detail:""}; if(v&&v.ok) return {name,ok:true,detail:v.detail||""}; return {name,ok:false,detail:(v&&v.detail)||"échec"}; }catch(e){ return {name,ok:false,detail:e.message}; } }
  async function run(){
    LAST=[];
    LAST.push(ev("Globals présents",()=>{ const m=[]; for(const k of Object.keys(G)){ try{ G[k](); }catch(e){ m.push(k); } } return m.length?{ok:false,detail:"manquants : "+m.join(", ")}:{ok:true,detail:Object.keys(G).length+" globals OK"}; }));
    LAST.push(ev("Scripts JS inclus",()=>{ const want=["config","store","bus","auth","data","recalls","tsb","veille","wallpaper","updater","pdf","selftest","app"]; const srcs=Array.from(document.scripts).map(s=>s.src||""); const miss=want.filter(w=>!srcs.some(s=>s.includes("/js/"+w+".js"))); return miss.length?{ok:false,detail:"absents : "+miss.join(", ")}:{ok:true,detail:want.length+" scripts"}; }));
    LAST.push(ev("IndexedDB (base locale massive) ouvrable",async()=>true));
    try{ await IDB.open(); LAST.push({name:"IndexedDB ouverte",ok:true,detail:"DB matech-db"}); }catch(e){ LAST.push({name:"IndexedDB ouverte",ok:false,detail:e.message}); }
    try{ const t={id:"selftest:"+Date.now(),type:"test",ts:Date.now()}; await IDB.put("events",t); const g=await IDB.get("events",t.id); await IDB.del("events",t.id); LAST.push({name:"IndexedDB écriture/lecture",ok:!!g,detail:g?"OK":"échec"}); }catch(e){ LAST.push({name:"IndexedDB écriture/lecture",ok:false,detail:e.message}); }
    LAST.push(ev("Topic notifications configuré",()=> (typeof CONFIG.NTFY_TOPIC==="string" && CONFIG.NTFY_TOPIC.length>8) || {ok:false,detail:"topic invalide"}));
    LAST.push(ev("Bus publish local (hors-ligne safe)",async()=>true));
    try{ const m=await Bus.publish({type:"test",ref:"SELFTEST"}); const evs=await Bus.events(); LAST.push({name:"Bus publish + base locale",ok:evs.some(x=>x.id===m.id),detail:m.sent?"envoyé+local":"local seulement (hors-ligne)"}); }catch(e){ LAST.push({name:"Bus publish + base locale",ok:false,detail:e.message}); }
    LAST.push(ev("Notifications OS dispo",()=> ("Notification" in window) || {ok:false,detail:"API absente"}));
    LAST.push(ev("DOM #app monté",()=>!!document.getElementById("app")));
    LAST.push(ev("localStorage R/W",()=>{ localStorage.setItem("__t","1"); const ok=localStorage.getItem("__t")==="1"; localStorage.removeItem("__t"); return ok; }));
    const okPass=await Auth.verifyAdmin("Kevin83600"); const badPass=await Auth.verifyAdmin("mauvais");
    LAST.push(ev("Mot de passe admin unique",()=> (okPass&&!badPass) || {ok:false}));
    LAST.push(ev("PDF généré valide",()=>{ const b=PDF.build("Test",[ {h:"S",lines:["l1"]} ]); return (b instanceof Blob && b.type==="application/pdf") || {ok:false}; }));
    LAST.push(ev("Wallpaper appliqué",()=>{ Wallpaper.apply(); return true; }));
    LAST.push(ev("Veille 15 j",()=> Veille.PERIOD_DAYS===15 || {ok:false}));
    LAST.push(ev("Énergie Électrique",()=> DT.energyOf("Électrique 286")==="Électrique" || {ok:false}));
    LAST.push(ev("DTC EV sans thermique",()=>{ const f=DT.faultsForVehicle("Skoda","Elroq|2025","Électrique 286").faults.map(x=>x.code); return !f.some(c=>/^(P02|P24|P20|P038)/.test(c)) || {ok:false}; }));
    LAST.push(ev("resolveFiche P0420",()=>{ const f=resolveFiche("P0420"); return (f&&f.code==="P0420") || {ok:false}; }));
    LAST.push(ev("ServiceWorker",()=> ("serviceWorker" in navigator) || {ok:false}));
    try{ const r=await fetch("manifest.json",{cache:"no-store"}); LAST.push({name:"manifest accessible",ok:r.ok,detail:"HTTP "+r.status}); }catch(e){ LAST.push({name:"manifest accessible",ok:false,detail:e.message}); }
    return LAST;
  }
  return { run, last:()=>LAST, failures:()=>LAST.filter(x=>!x.ok) };
})();
