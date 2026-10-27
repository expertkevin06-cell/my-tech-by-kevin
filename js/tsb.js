"use strict";
/* PANNES CONNUES & BULLETINS — filtrés par ÉNERGIE (en) en plus de marque/modèle/motorisation.
   en: [] = toutes énergies ; ["Essence","Diesel","Hybride"] = thermique ; ["Électrique"] = EV. */
const TSB = (() => {
  const SRC = { RC:"RappelConso", NHTSA:"NHTSA", SG:"Safety Gate", TSB:"TSB constructeur", BUL:"Bulletin technique", WEB:"Presse / site spécialisé" };
  const TH = ["Essence","Diesel","Hybride"];

  const DB = [
    { id:"TSB-STL-DV5-CHAIN", src:"TSB", ref:"Stellantis B23-0147 (DV5)", brands:["Peugeot","Citroën","DS","Opel"], models:[], eng:["1.5 hdi","1.5 bluehdi"], en:["Diesel"], y0:2017, y1:2021,
      comp:"Chaîne de distribution (7 mm)", prob:"Usure/élongation chaîne 7 mm ; risque rupture", sym:["Claquement à froid","Voyant moteur"], fix:"Chaîne renforcée 8 mm + galets + pompe", dtc:["P0016","P0340"], sev:4 },
    { id:"BUL-STL-DV5-REGEN", src:"BUL", ref:"Stellantis N02-2019", brands:["Peugeot","Citroën","DS","Opel"], models:[], eng:["1.5 hdi","1.5 bluehdi"], en:["Diesel"], y0:2017, y1:2022,
      comp:"FAP / régénérations", prob:"Régénérations excessives → dilution huile", sym:["Régénérations fréquentes","Niveau huile monte"], fix:"MAJ calculateur + vidange rapprochée", dtc:["P2463","P242F"], sev:3 },
    { id:"BUL-STL-DV5-ADB", src:"BUL", ref:"Stellantis N11-2020", brands:["Peugeot","Citroën","DS","Opel"], models:[], eng:["1.5 bluehdi","1.5 hdi"], en:["Diesel"], y0:2017, y1:2023,
      comp:"Système AdBlue", prob:"Cristallisation → pompe HS, bridage", sym:["Voyant dépollution","Message AdBlue"], fix:"Pompe + injecteur AdBlue + nettoyage", dtc:["P2047","P204C"], sev:3 },
    { id:"RC-PSA-COURROIE", src:"RC", ref:"RappelConso 2019-11-PSA", brands:["Peugeot","Citroën","DS","Opel"], models:[], eng:["1.2 puretech"], en:["Essence"], y0:2017, y1:2023,
      comp:"Courroie de distribution humide", prob:"Dégradation courroie → pompe à vide → freinage", sym:["Pédale dure","Voyant"], fix:"Kit courroie + pompe à vide", dtc:["P0505"], sev:4 },
    { id:"TSB-PSA-EB2-OIL", src:"TSB", ref:"PSA B21-0062", brands:["Peugeot","Citroën","Opel"], models:[], eng:["1.2 puretech"], en:["Essence"], y0:2017, y1:2022,
      comp:"Crépine / pompe à huile", prob:"Colmatage crépine → pression huile", sym:["Voyant huile"], fix:"Crépine + pompe + courroie", dtc:["P0520"], sev:4 },
    { id:"TSB-PSA-THP", src:"TSB", ref:"PSA B15-089", brands:["Peugeot","Citroën","DS","BMW","Mini"], models:[], eng:["1.6 thp"], en:["Essence"], y0:2017, y1:2019,
      comp:"Tendeur de chaîne THP", prob:"Usure tendeur → claquement", sym:["Claquement à froid"], fix:"Kit tendeur + chaîne", dtc:["P0016"], sev:4 },
    { id:"RC-REN-13TCE", src:"RC", ref:"RappelConso 2020-02-Renault", brands:["Renault","Dacia"], models:[], eng:["1.3 tce"], en:["Essence"], y0:2019, y1:2021,
      comp:"Pompe basse pression", prob:"Calage basse vitesse", sym:["Calage"], fix:"Remplacement pompe", dtc:["P0087"], sev:3 },
    { id:"TSB-REN-K9K-INJ", src:"TSB", ref:"Renault B17-045", brands:["Renault","Dacia","Nissan"], models:[], eng:["1.5 dci"], en:["Diesel"], y0:2017, y1:2020,
      comp:"Injecteurs / pompe K9K", prob:"Limailles pompe → injecteurs HS", sym:["Perte puissance","Ratés"], fix:"Kit injecteurs + pompe", dtc:["P0087","P0201"], sev:4 },
    { id:"TSB-REN-EDC", src:"TSB", ref:"Renault B18-021", brands:["Renault","Dacia"], models:[], eng:["1.5 dci"], en:["Diesel"], y0:2017, y1:2021,
      comp:"Actionneur embrayage EDC", prob:"Usure actionneur → à-coups", sym:["À-coups","Voyant boîte"], fix:"Remplacement actionneur", dtc:["P0741"], sev:3 },
    { id:"TSB-DAC-BIGSTER-RESS", src:"TSB", ref:"Dacia B25-0031", brands:["Dacia"], models:["Bigster"], eng:[], en:[], y0:2025, y1:2026,
      comp:"Ressorts suspension arrière", prob:"Casse prématurée ressorts", sym:["Claquement arrière","Assiette penchée"], fix:"Ressorts diamètre majoré", dtc:[], sev:3 },
    { id:"TSB-DAC-DUSTER-RESS", src:"TSB", ref:"Dacia B24-0118", brands:["Dacia"], models:["Duster"], eng:[], en:[], y0:2024, y1:2026,
      comp:"Ressorts suspension arrière", prob:"Rupture prématurée", sym:["Claquement arrière"], fix:"Ressorts diamètre majoré", dtc:[], sev:3 },
    { id:"NHTSA-FORD-PS", src:"NHTSA", ref:"NHTSA EA16-001", brands:["Ford"], models:["Focus","Fiesta"], eng:[], en:TH, y0:2017, y1:2019,
      comp:"Boîte PowerShift DPS6", prob:"À-coups/patinage embrayage", sym:["À-coups","Vibrations"], fix:"Embrayage + MAJ TCM", dtc:["P0741"], sev:3 },
    { id:"NHTSA-HONDA-DIL", src:"NHTSA", ref:"NHTSA EA18-002", brands:["Honda"], models:[], eng:["1.5 vtec turbo"], en:["Essence"], y0:2017, y1:2020,
      comp:"Dilution huile 1.5 Turbo", prob:"Dilution par carburant", sym:["Niveau huile monte"], fix:"MAJ ECU + vidange", dtc:["P0171"], sev:2 },
    { id:"NHTSA-NIS-CVT", src:"NHTSA", ref:"NHTSA EA20-001", brands:["Nissan"], models:["Rogue","Sentra","Altima"], eng:[], en:TH, y0:2017, y1:2021,
      comp:"CVT Jatco", prob:"Surchauffe/panne CVT", sym:["Perte propulsion"], fix:"Remplacement CVT", dtc:["P0741"], sev:4 },
    { id:"SG-VW-DSG", src:"SG", ref:"Safety Gate 2018-DE-042", brands:["Volkswagen","Audi","Seat","Skoda"], models:[], eng:[], en:TH, y0:2017, y1:2020,
      comp:"Mécatronique DSG DQ200", prob:"Défaillance mécatronique", sym:["À-coups","Mode sécurité"], fix:"Remplacement mécatronique", dtc:["P0700"], sev:4 },
    { id:"TSB-VW-EA888", src:"TSB", ref:"VW 2025-17", brands:["Volkswagen","Audi"], models:[], eng:["2.0 tsi"], en:["Essence"], y0:2017, y1:2019,
      comp:"Tendeur chaîne EA888", prob:"Saut de dent", sym:["Claquement démarrage"], fix:"Kit tendeur + chaîne", dtc:["P0016"], sev:4 },
    { id:"TSB-SKO-ELROQ-BATT", src:"TSB", ref:"Skoda B25-0107 (MEB)", brands:["Skoda"], models:["Elroq","Enyaq"], eng:["électrique"], en:["Électrique"], y0:2025, y1:2026,
      comp:"Refroidissement batterie HV", prob:"Pompe thermique HV hors plage → bridage charge", sym:["Bridage charge","Voyant température"], fix:"Contrôle/remplacement pompe thermique + MAJ", dtc:["P0C24","P0A7E"], sev:3 },
    { id:"TSB-VW-MEB-BMS", src:"TSB", ref:"VW/Skoda B22-0031 (MEB)", brands:["Volkswagen","Skoda"], models:["ID.3","ID.4","Elroq","Enyaq"], eng:["électrique"], en:["Électrique"], y0:2021, y1:2026,
      comp:"BMS / calibration SOC", prob:"SOC erratique → autonomie fausse", sym:["Autonomie erratique"], fix:"Recalibration SOC / MAJ BMS", dtc:["P1A15","U0112"], sev:3 },
    { id:"TSB-REN-R5-CHGPORT", src:"TSB", ref:"Renault B24-0210 (R5)", brands:["Renault"], models:["R5","R4"], eng:["électrique","e-tech"], en:["Électrique"], y0:2024, y1:2026,
      comp:"Verrou / connecteur de charge", prob:"Verrouillage charge défaillant → interruptions", sym:["Charge interrompue","Verrou bloqué"], fix:"Contrôle/remplacement verrou + MAJ", dtc:["P0C1F","P0C29"], sev:3 },
    { id:"TSB-REN-ETECH-12V", src:"TSB", ref:"Renault B22-0145 (E-Tech EV)", brands:["Renault"], models:["Megane","R5","Scenic","Zoé"], eng:["électrique","e-tech"], en:["Électrique"], y0:2022, y1:2026,
      comp:"Batterie 12V / DC-DC", prob:"Décharge 12V → impossibilité démarrage", sym:["Démarrage impossible","Voyant 12V"], fix:"Remplacement 12V + contrôle DC-DC", dtc:["P0562"], sev:3 },
    { id:"NHTSA-TESLA-EMMC", src:"NHTSA", ref:"NHTSA 21V-063", brands:["Tesla"], models:["Model S","Model X"], eng:[], en:["Électrique"], y0:2017, y1:2021,
      comp:"Mémoire eMMC MCU", prob:"Usure eMMC → écran noir", sym:["Écran figé"], fix:"Remplacement MCU", dtc:["U0155"], sev:3 },
    { id:"NHTSA-GM-8L", src:"NHTSA", ref:"NHTSA EA19-001", brands:["Chevrolet"], models:["Silverado","Tahoe"], eng:[], en:TH, y0:2017, y1:2019,
      comp:"BVA 8 rapports", prob:"Shudder convertisseur", sym:["Vibrations 40-80 km/h"], fix:"Fluide spécifique + MAJ", dtc:["P0741"], sev:3 },
    { id:"TSB-BMW-B47", src:"TSB", ref:"BMW SIB 11-09-19", brands:["BMW"], models:[], eng:["20d","2.0 d"], en:["Diesel"], y0:2017, y1:2021,
      comp:"Chaîne B47", prob:"Usure tendeur/chaîne", sym:["Claquement chaîne"], fix:"Kit chaîne + tendeur", dtc:["P0016"], sev:4 },
    { id:"TSB-MB-OM651", src:"TSB", ref:"Mercedes LI20.10-P-056", brands:["Mercedes"], models:[], eng:["220 d","2.2 d"], en:["Diesel"], y0:2017, y1:2019,
      comp:"Injecteurs OM651", prob:"Fuite compression/calamine", sym:["Claquement","Fumée"], fix:"Joints/injecteurs + MAJ", dtc:["P0201"], sev:3 },
    { id:"TSB-TOY-D4D", src:"TSB", ref:"Toyota T-SB-0034-18", brands:["Toyota"], models:[], eng:["2.2 d-4d","2.8 d-4d"], en:["Diesel"], y0:2017, y1:2020,
      comp:"Injecteurs D-4D", prob:"Usure injecteurs", sym:["Fumée noire"], fix:"Remplacement injecteurs", dtc:["P0201"], sev:3 },
    { id:"WEB-TOY-HYB", src:"WEB", ref:"Sites spécialisés hybride", brands:["Toyota","Lexus"], models:[], eng:["hybrid"], en:["Hybride"], y0:2017, y1:2022,
      comp:"Batterie NiMH", prob:"Usure batterie hybride", sym:["Perte hybride"], fix:"Remplacement modules", dtc:["P0A80"], sev:2 },
    { id:"WEB-MZ-22D", src:"WEB", ref:"Forums DPF", brands:["Mazda"], models:[], eng:["2.2 skyactiv-d"], en:["Diesel"], y0:2017, y1:2021,
      comp:"FAP 2.2 D", prob:"Encrassement FAP", sym:["Voyant FAP"], fix:"Nettoyage/MAJ", dtc:["P2463"], sev:3 },
    { id:"SG-TAKATA", src:"SG", ref:"Safety Gate 2017-2020", brands:["Honda","Nissan","Toyota","Mazda","Subaru","Mitsubishi","BMW","Mercedes","Fiat","Alfa Romeo"], models:[], eng:[], en:[], y0:2017, y1:2020,
      comp:"Airbag Takata", prob:"Rupture générateur", sym:["Voyant airbag"], fix:"Remplacement gratuit", dtc:["B0001"], sev:4 }
  ];

  const K_CUSTOM = "mtk_tsb_custom_v1";
  const read = (k,d) => { try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } };
  function customs(){ return read(K_CUSTOM, []); }
  function saveCustoms(l){ localStorage.setItem(K_CUSTOM, JSON.stringify(l)); }
  function normEng(s){ return String(s).toLowerCase().replace(/blue\s?hdi/g,"hdi").replace(/blue\s?dci/g,"dci").replace(/e-?tech/g,"etech").replace(/[^a-z0-9.]/g,""); }
  function all(){ return customs().concat(DB); }

  function forVehicle(brand, modelName, mYear, engine){
    const energy = DT.energyOf(engine);
    const e = normEng(engine);
    return all().filter(t => {
      if (!t.brands.includes(brand)) return false;
      if (t.models && t.models.length && !t.models.some(m => modelName.toLowerCase().includes(m.toLowerCase()))) return false;
      if (t.en && t.en.length && !t.en.includes(energy)) return false;      /* ← FILTRE ÉNERGIE */
      if (t.eng && t.eng.length && !t.eng.some(p => e.includes(normEng(p)))) return false;
      return !(mYear > t.y1 || 2026 < t.y0);
    });
  }
  function search(q){
    q = q.toLowerCase();
    return all().filter(t => (t.id+" "+t.ref+" "+t.brands.join(" ")+" "+(t.models||[]).join(" ")+" "+(t.eng||[]).join(" ")+" "+t.comp+" "+t.prob).toLowerCase().includes(q)).slice(0,60);
  }
  function byId(id){ return all().find(t => t.id === id) || null; }
  return { SRC, all, forVehicle, search, byId, customs, saveCustoms };
})();
