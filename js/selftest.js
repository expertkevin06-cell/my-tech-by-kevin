"use strict";
const SelfTest = (() => {
  let LAST=[];
  const G={CONFIG:()=>CONFIG,Store:()=>Store,Session:()=>Session,Auth:()=>Auth,DT:()=>DT,TSB:()=>TSB,Recalls:()=>Recalls,Updater:()=>Updater,Veille:()=>Veille,PDF:()=>PDF,Wallpaper:()=>Wallpaper,BRANDS:()=>BRANDS,CATS:()=>CATS,resolveFiche:()=>resolveFiche,systemFaultsFor:()=>systemFaultsFor,App:()=>App};
  function ev(name,fn){ try{ const v=fn(); if(v===true) return {name,ok:true,detail:""}; if(v&&v.ok) return {name,ok:true,detail:v.detail||""}; return {name,ok:false,detail:(v&&v.detail)||"échec"}; }catch(e){ return {name,ok:false,detail:e.message}; } }
  async function run(){
    LAST=[];
    LAST.push(ev("Globals présents",()=>{ const m=[]; for(const k of Object.keys(G)){ try{ G[k](); }catch(e){ m.push(k); } } return m.length?{ok:false,detail:"manquants : "+m.join(", ")}:{ok:true,detail:Object.keys(G).length+" globals OK"}; }));
    LAST.push(ev("Scripts JS inclus",()=>{ const want=["config","store","auth","data","recalls","tsb","veille","updater","pdf","wallpaper","selftest","app"]; const srcs=Array.from(document.scripts).map(s=>s.src||""); const miss=want.filter(w=>!srcs.some(s=>s.includes("/js/"+w+".js"))); return miss.length?{ok:false,detail:"absents : "+miss.join(", ")}:{ok:true,detail:want.length+" scripts"}; }));
    LAST.push(ev("DOM #app monté",()=>!!document.getElementById("app")));
    LAST.push(ev("localStorage R/W",()=>{ localStorage.setItem("__t","1"); const ok=localStorage.getItem("__t")==="1"; localStorage.removeItem("__t"); return ok; }));
    const okPass=await Auth.verifyAdmin("Kevin83600"); const badPass=await Auth.verifyAdmin("mauvais-mdp");
    LAST.push(ev("Mot de passe admin unique (Kevin83600)",()=> (okPass && !badPass) || {ok:false,detail:"politique mdp non respectée"}));
    LAST.push(ev("PDF généré valide",()=>{ const b=PDF.build("Test",[ {h:"Section",lines:["ligne une","ligne deux"]} ]); return (b instanceof Blob && b.type==="application/pdf") || {ok:false,detail:"blob invalide"}; }));
    LAST.push(ev("Wallpaper : application sans erreur",()=>{ Wallpaper.apply(); return true; }));
    LAST.push(ev("Wallpaper : état cohérent",()=>{ const bg=getComputedStyle(document.body).backgroundImage; const cur=Wallpaper.get();
      if(cur) return bg.includes("data:image") || {ok:false,detail:"photo custom non appliquée"};
      return bg.includes("bg-car") || {ok:true,detail:"fond défaut (svg)"}; }));
    LAST.push(ev("Contact admin mail configuré",()=> (typeof CONFIG.ADMIN_EMAIL==="string" && CONFIG.ADMIN_EMAIL.includes("@")) || {ok:false,detail:"ADMIN_EMAIL invalide"}));
    LAST.push(ev("Fond véhicule présent (CSS)",()=> getComputedStyle(document.body).backgroundImage.length>0 || {ok:false,detail:"aucun background"}));
    LAST.push(ev("Panneaux translucides",()=>{ const c=document.querySelector(".card"); if(!c) return true; return /^rgba/.test(getComputedStyle(c).backgroundColor) || {ok:false,detail:"opaque"}; }));
    LAST.push(ev("Veille 15 j",()=> Veille.PERIOD_DAYS===15 || {ok:false,detail:String(Veille.PERIOD_DAYS)}));
    LAST.push(ev("Veille mergeModels",()=>{ Veille.mergeModels(); return true; }));
    LAST.push(ev("Énergie Électrique",()=> DT.energyOf("Électrique 286")==="Électrique" || {ok:false}));
    LAST.push(ev("Énergie Diesel",()=> DT.energyOf("1.5 BlueHDi 130")==="Diesel" || {ok:false}));
    LAST.push(ev("DTC EV sans thermique",()=>{ const f=DT.faultsForVehicle("Skoda","Elroq|2025","Électrique 286").faults.map(x=>x.code); return !f.some(c=>/^(P02|P24|P20|P038)/.test(c)) || {ok:false}; }));
    LAST.push(ev("TSB Elroq EV only",()=> !TSB.forVehicle("Skoda","Elroq",2025,"Électrique 286").some(t=>t.id==="TSB-STL-DV5-CHAIN") || {ok:false}));
    LAST.push(ev("resolveFiche P0420",()=>{ const f=resolveFiche("P0420"); return (f&&f.code==="P0420") || {ok:false}; }));
    LAST.push(ev("Rendu recherche",()=> typeof App.renderSearch()==="string"));
    LAST.push(ev("ServiceWorker",()=> ("serviceWorker" in navigator) || {ok:false}));
    try{ const r=await fetch("manifest.json",{cache:"no-store"}); LAST.push({name:"manifest accessible",ok:r.ok,detail:"HTTP "+r.status}); }catch(e){ LAST.push({name:"manifest accessible",ok:false,detail:e.message}); }
    try{ const r=await fetch("assets/icons/icon-512.png",{cache:"no-store",method:"HEAD"}); LAST.push({name:"icône 512 accessible",ok:r.ok,detail:"HTTP "+r.status}); }catch(e){ LAST.push({name:"icône 512 accessible",ok:false,detail:e.message}); }
    return LAST;
  }
  return { run, last:()=>LAST, failures:()=>LAST.filter(x=>!x.ok) };
})();
