"use strict";
/* =====================================================================
   ÉNERGIE / CARBURANT par motorisation — base du filtrage des pannes.
   Électrique ≠ Diesel ≠ Essence ≠ Hybride ≠ GPL.
   ===================================================================== */
function energyLabel(e){
  const s = String(e).toLowerCase();
  if (/hybrid|hybride/.test(s)) return "Hybride";
  if (/électrique|electrique|electric|e-?tech|ev\b|bev\b|ze\b/.test(s)) return "Électrique";
  if (/dci|hdi|bluehdi|tdi|d-4d|skyactiv-d|multijet|diesel|cdi|\b\d+d\b|td\b/.test(s)) return "Diesel";
  if (/gpl|lpg/.test(s)) return "GPL";
  return "Essence";
}

/* ---- Catalogue DTC par énergie (correctement identifiés) ---- */
const DTC = {
  thermal_common: [
    ["P0101","Débitmètre d'air — plage/performance"],
    ["P0102","Débitmètre d'air — signal bas"],
    ["P0113","Température d'air admission — signal haut"],
    ["P0118","Température liquide refroidissement — signal haut"],
    ["P0128","Thermostat — température sous régulation"],
    ["P0217","Surchauffe moteur"],
    ["P0505","Régulation ralenti — défaillance"],
    ["P0562","Tension système basse (12V)"],
    ["P0606","Calculateur moteur — défaillance interne"],
    ["P0700","Boîte de vitesses — demande voyant"],
    ["P0741","Convertisseur de couple — performance/bloqué"]
  ],
  essence: [
    ["P0171","Mélange trop pauvre (banc 1)"],
    ["P0172","Mélange trop riche (banc 1)"],
    ["P0300","Ratés d'allumage aléatoires"],
    ["P0301","Ratés d'allumage cylindre 1"],
    ["P0351","Bobine d'allumage A — circuit"],
    ["P0420","Catalyseur — rendement sous seuil (banc 1)"],
    ["P0442","Evaporatif — petite fuite"],
    ["P0340","Capteur arbre à cames — circuit"],
    ["P0016","Vilebrequin/arbres à cames — corrélation"]
  ],
  diesel: [
    ["P0087","Rampe carburant — pression basse"],
    ["P0201","Injecteur cylindre 1 — circuit"],
    ["P0202","Injecteur cylindre 2 — circuit"],
    ["P2463","FAP — suie accumulée"],
    ["P2002","FAP — rendement sous seuil"],
    ["P2047","Injecteur AdBlue — circuit"],
    ["P204C","AdBlue — pression pompe"],
    ["P20EE","AdBlue — rendement NOx"],
    ["P0380","Bougies de préchauffage — circuit"],
    ["P0016","Vilebrequin/arbres à cames — corrélation"]
  ],
  hybrid: [
    ["P0A0F","Démarrage impossible — batterie HV faible"],
    ["P0A80","Batterie HV — remplacement requis"],
    ["P0A7E","Batterie HV — surchauffe cellules"],
    ["P1A00","Batterie HV — équilibrage cellules"],
    ["P0A1D","Module contrôle HV — défaillance"]
  ],
  electric: [
    ["P0A0F","Impossibilité démarrage — batterie HV"],
    ["P0A80","Batterie HV — remplacement requis"],
    ["P0A7E","Batterie HV — surchauffe cellules"],
    ["P0AA6","Isolation batterie HV — défaillance"],
    ["P0C00","Chargeur AC — performance"],
    ["P0C29","Charge — interruption/communication"],
    ["P0C4A","Charge — temps anormal"],
    ["P1A00","BMS — équilibrage cellules"],
    ["P1A15","BMS — calibration SOC"],
    ["U0110","Perte communication onduleur/moteur"],
    ["U0111","Perte communication batterie HV"],
    ["U0112","Perte communication BMS"],
    ["P0562","Tension 12V basse"],
    ["P0A1D","Module contrôle HV — défaillance"],
    ["P0C1F","Charge — verrouillage connecteur"],
    ["P0C24","Charge — température batterie"]
  ]
};

/* ---- Pannes système par énergie ---- */
const SYS = {
  thermal: [
    {comp:"Système d'injection", fault:"Pression/qualité de carburation hors plage", symptoms:["Ratés","Perte puissance","Voyant moteur"], causes:["Injecteurs encrassés","Pompe HP fatiguée","Capteur pression HS"], fixes:["Nettoyage/remplacement injecteurs","Contrôle pompe HP","Lecture DTC"], dtcs:["P0201","P0087"], sev:3},
    {comp:"Distribution (chaîne/courroie)", fault:"Usure/élongation distribution", symptoms:["Claquement à froid","Voyant"], causes:["Tendeur fatigué","Lubrification insuffisante"], fixes:["Kit distribution complet","Contrôle lubrification"], dtcs:["P0016","P0340"], sev:4},
    {comp:"Lubrification", fault:"Pression d'huile insuffisante", symptoms:["Voyant huile","Bruits"], causes:["Pompe à huile usée","Crépine colmatée","Niveau bas"], fixes:["Contrôle pression","Remplacement pompe/crépine","Vidange"], dtcs:["P0520","P0524"], sev:4},
    {comp:"Refroidissement", fault:"Température hors régulation", symptoms:["Surchauffe","Voyant"], causes:["Pompe à eau HS","Thermostat bloqué","Fuite LDR"], fixes:["Remplacement pompe/thermostat","Contrôle étanchéité"], dtcs:["P0128","P0217"], sev:3},
    {comp:"Admission / turbo", fault:"Suralimentation/air hors plage", symptoms:["Perte puissance","Fumée","Sifflement"], causes:["Turbo fatigué","Fuite admission","EGR encrassée"], fixes:["Contrôle turbo","Nettoyage EGR","Étanchéité admission"], dtcs:["P0299","P0401"], sev:3},
    {comp:"Boîte / transmission", fault:"Passages/anomalie transmission", symptoms:["À-coups","Vibrations","Voyant boîte"], causes:["Mécatronique usée","Huile dégradée","Capteur vitesse HS"], fixes:["Vidange boîte/MAJ","Contrôle mécatronique"], dtcs:["P0700","P0741"], sev:3}
  ],
  diesel_extra: [
    {comp:"FAP / dépollution", fault:"Encrassement/restriction FAP", symptoms:["Voyant FAP","Perte puissance","Régénérations fréquentes"], causes:["Cycles courts","Sonde différentielle HS","Injecteurs fatigués"], fixes:["Régénération forcée","Nettoyage/remplacement FAP","Contrôle injecteurs"], dtcs:["P2463","P2002"], sev:3},
    {comp:"AdBlue / SCR", fault:"Dépollution NOx hors plage", symptoms:["Voyant dépollution","Message AdBlue","Bridage"], causes:["Pompe AdBlue HS","Cristallisation","Capteur NOx HS"], fixes:["Remplacement pompe/injecteur AdBlue","Nettoyage ligne","Capteur NOx"], dtcs:["P204C","P20EE"], sev:3},
    {comp:"Injection haute pression", fault:"Pression rampe hors plage", symptoms:["Démarrage difficile","Perte puissance"], causes:["Pompe HP usée","Régulateur HS","Fuite rampe"], fixes:["Contrôle pression rampe","Remplacement pompe/régulateur"], dtcs:["P0087","P0088"], sev:4},
    {comp:"Préchauffage", fault:"Bougies de préchauffage HS", symptoms:["Démarrage difficile à froid","Voyant"], causes:["Bougies usées","Relais HS"], fixes:["Remplacement bougies/relais"], dtcs:["P0380","P0671"], sev:2}
  ],
  essence_extra: [
    {comp:"Allumage", fault:"Ratés d'allumage / bobines", symptoms:["Ratés","Vibrations","Voyant"], causes:["Bobines HS","Bougies usées","Faisceau"], fixes:["Remplacement bobines/bougies"], dtcs:["P0300","P0351"], sev:3},
    {comp:"Mélange / carburation", fault:"Mélange pauvre/riche", symptoms:["Ratés","Consommation","Voyant"], causes:["Fuite admission","Sonde lambda HS","Injecteurs"], fixes:["Contrôle étanchéité","Sonde lambda","Nettoyage injecteurs"], dtcs:["P0171","P0172"], sev:2},
    {comp:"Catalyseur", fault:"Rendement catalyseur sous seuil", symptoms:["Voyant","Consommation"], causes:["Catalyseur usé","Sonde lambda HS"], fixes:["Contrôle catalyseur","Sonde lambda"], dtcs:["P0420","P0430"], sev:2}
  ],
  hybrid_extra: [
    {comp:"Batterie HV / hybride", fault:"Capacité/équilibrage batterie HV", symptoms:["Perte hybride","Voyant"], causes:["Cellules fatiguées","Ventilation obstruée"], fixes:["Équilibrage/remplacement modules","Nettoyage ventilation"], dtcs:["P0A80","P0A7E"], sev:3},
    {comp:"Onduleur / conversion", fault:"Conversion HV/AC hors plage", symptoms:["Perte propulsion","Voyant"], causes:["Onduleur HS","Refroidissement"], fixes:["Contrôle onduleur/refroidissement"], dtcs:["P0A1D","P1A00"], sev:3}
  ],
  electric: [
    {comp:"Batterie haute tension", fault:"Capacité/équilibrage/isolation batterie HV", symptoms:["Autonomie réduite","Voyant HV","Bridage"], causes:["Cellules fatiguées","Isolation dégradée","Refroidissement"], fixes:["Diagnostic capacité/isolation","Équilibrage modules","Contrôle refroidissement"], dtcs:["P0A80","P0AA6","P1A00"], sev:4},
    {comp:"BMS / gestion batterie", fault:"Calibration SOC / communication BMS", symptoms:["Autonomie erratique","Voyant"], causes:["Calibration SOC","Communication"], fixes:["Recalibration SOC/MAJ BMS"], dtcs:["P1A15","U0112"], sev:3},
    {comp:"Chargeur embarqué (AC)", fault:"Charge AC interrompue/lente", symptoms:["Charge impossible","Charge lente"], causes:["Chargeur HS","Refroidissement","Communication borne"], fixes:["Contrôle chargeur/MAJ","Contrôle refroidissement"], dtcs:["P0C00","P0C29"], sev:3},
    {comp:"Onduleur / moteur électrique", fault:"Conversion/moteur hors plage", symptoms:["Perte propulsion","Vibrations","Voyant"], causes:["Onduleur HS","Roulements moteur"], fixes:["Contrôle onduleur/moteur"], dtcs:["P0A1D","U0110"], sev:4},
    {comp:"Réducteur / transmission EV", fault:"Bruit/fuite réducteur", symptoms:["Bruit","Fuite"], causes:["Huile dégradée","Roulements"], fixes:["Vidange réducteur","Contrôle roulements"], dtcs:["P0A3F","P0A41"], sev:2},
    {comp:"Gestion thermique batterie", fault:"Refroidissement/chauffage batterie hors plage", symptoms:["Bridage charge","Voyant température"], causes:["Pompe thermique HS","Valve","Fuite"], fixes:["Contrôle pompe/valve","Étanchéité circuit"], dtcs:["P0C24","P0A7E"], sev:3},
    {comp:"Batterie 12V / DC-DC", fault:"Tension 12V basse / DC-DC", symptoms:["Démarrage impossible","Voyant 12V"], causes:["Batterie 12V fatiguée","DC-DC HS"], fixes:["Remplacement 12V","Contrôle DC-DC"], dtcs:["P0562","P0A1D"], sev:3},
    {comp:"Connecteur / verrou de charge", fault:"Verrouillage/connecteur charge", symptoms:["Charge interrompue","Verrou bloqué"], causes:["Verrou HS","Broches"], fixes:["Contrôle verrou/broches"], dtcs:["P0C1F","P0C29"], sev:2}
  ]
};

const DT = (() => {
  const SEVL = ["Mineure","Modérée","Sérieuse","Critique"];

  function energyOf(e){ return energyLabel(e); }
  function fuelOf(e){ return energyLabel(e); }

  function faultsForVehicle(brand, modelKey, engine){
    const en = energyLabel(engine);
    let pool;
    if (en === "Électrique") pool = DTC.electric;
    else if (en === "Hybride") pool = DTC.hybrid.concat(DTC.thermal_common, DTC.essence.slice(0,4));
    else if (en === "Diesel") pool = DTC.diesel.concat(DTC.thermal_common);
    else pool = DTC.essence.concat(DTC.thermal_common);
    const faults = pool.map(p => ({ key:p[0], code:p[0], title:p[1], sev:3, sevLabel:SEVL[2], brands:[brand], motors:[engine], years:"2017-2026", generic:false, brand:brand,
      symptoms:["Voyant moteur/propulsion"], causes:["Voir pannes système"], solutions:["Lecture DTC + diagnostic système"] }));
    return { fuel: en, faults };
  }

  function systemFaultsFor(brand, modelKey, engine){
    const en = energyLabel(engine);
    let list;
    if (en === "Électrique") list = SYS.electric;
    else if (en === "Hybride") list = SYS.thermal.concat(SYS.essence_extra, SYS.hybrid_extra);
    else if (en === "Diesel") list = SYS.thermal.concat(SYS.diesel_extra);
    else list = SYS.thermal.concat(SYS.essence_extra);
    return list.map(x => Object.assign({}, x, { sevLabel: SEVL[x.sev-1] }));
  }

  /* ---- 21 000 fiches génériques (recherche texte) ---- */
  function codeFromIndex(i){
    const L = ["P","B","C","U"][Math.floor(i/4000)%4];
    return L + String(i%4000).padStart(4,"0");
  }
  function genericTitle(code){
    const L = code[0], n = +code.slice(1);
    if (L==="P"){
      if (n<100) return "Powertrain — défaut générique capteur/débit";
      if (n<200) return "Powertrain — mélange/carburation";
      if (n<300) return "Powertrain — injection/allumage";
      if (n<400) return "Powertrain — dépollution auxiliaire";
      if (n<500) return "Powertrain — vitesse/ralenti";
      if (n<700) return "Powertrain — calculateur/ECU";
      if (n<800) return "Powertrain — transmission";
      if (n<3000) return "Powertrain — hybride/HV";
      return "Powertrain — constructeur (diesel/électrique)";
    }
    if (L==="B") return "Carrosserie — confort/habitacle";
    if (L==="C") return "Châssis — freinage/tenue de route";
    return "Réseau — communication calculateurs";
  }
  function ficheAt(i){
    const code = codeFromIndex(i);
    const t = genericTitle(code);
    return { key:code, code, title:t, desc:t + " — fiche générique OBD-II (diagnostic complet selon véhicule/motorisation).",
      sev:2, sevLabel:SEVL[1], brands:["Toutes marques"], motors:["Essence","Diesel","Hybride","Électrique"], years:"2017-2026",
      generic:true, brand:"", symptoms:["Voyant"], causes:["Selon système"], solutions:["Lecture DTC + diagnostic système"] };
  }
  function findByCode(code){
    code = code.toUpperCase();
    const out = [];
    for (let i = 0; i < CONFIG.TOTAL_FICHES; i++){ if (codeFromIndex(i) === code) out.push({ key:code }); }
    return out;
  }
  return { energyOf, fuelOf, faultsForVehicle, systemFaultsFor, codeFromIndex, ficheAt, findByCode };
})();

/* alias global pour app.js */
function systemFaultsFor(brand, modelKey, engine){ return DT.systemFaultsFor(brand, modelKey, engine); }
