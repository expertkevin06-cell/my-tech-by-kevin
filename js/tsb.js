"use strict";
/* =====================================================================
   PANNES CONNUES & BULLETINS TECHNIQUES — sources : TSB constructeur,
   RappelConso, NHTSA, Safety Gate, bulletins, presse/sites spécialisés.
   Matching : marque + modèle + motorisation + années + carburant.
   ===================================================================== */
const TSB = (() => {
  const SRC = { RC:"RappelConso", NHTSA:"NHTSA", SG:"Safety Gate", TSB:"TSB constructeur", BUL:"Bulletin technique", WEB:"Presse / site spécialisé" };

  const DB = [
    { id:"TSB-STL-DV5-CHAIN", src:"TSB", ref:"Stellantis B23-0147 (DV5)", brands:["Peugeot","Citroën","DS","Opel"], models:[], eng:["1.5 hdi","1.5 bluehdi"], fuels:[], y0:2017, y1:2021,
      comp:"Chaîne de distribution (largeur 7 mm)", prob:"Usure/élongation prématurée de la chaîne 7 mm ; risque de rupture et casse moteur",
      sym:["Claquement à froid","Voyant moteur","Ralenti irrégulier"], fix:"Remplacement par chaîne renforcée 8 mm + galets + pompe à huile (bulletin atelier)", dtc:["P0016","P0017","P0340"], sev:4 },
    { id:"BUL-STL-DV5-REGEN", src:"BUL", ref:"Stellantis N02-2019", brands:["Peugeot","Citroën","DS","Opel"], models:[], eng:["1.5 hdi","1.5 bluehdi"], fuels:["Diesel"], y0:2017, y1:2022,
      comp:"FAP / stratégie de régénération", prob:"Régénérations excessives (cycles rapprochés) → dilution d'huile, usure prématurée",
      sym:["Régénérations fréquentes","Niveau d'huile qui monte","Odeur de carburant"], fix:"MAJ calculateur + vidange rapprochée + contrôle FAP", dtc:["P2463","P242F"], sev:3 },
    { id:"BUL-STL-DV5-ADB", src:"BUL", ref:"Stellantis N11-2020", brands:["Peugeot","Citroën","DS","Opel"], models:[], eng:["1.5 bluehdi","1.5 hdi"], fuels:["Diesel"], y0:2017, y1:2023,
      comp:"Système AdBlue (pompe / injecteur)", prob:"Cristallisation AdBlue → pompe HS, perte dépollution, puissance bridée",
      sym:["Voyant dépollution","Message niveau AdBlue","Perte de puissance"], fix:"Remplacement pompe + injecteur AdBlue + nettoyage ligne + MAJ", dtc:["P2047","P20EE","P204C"], sev:3 },
    { id:"TSB-DAC-BIGSTER-RESS", src:"TSB", ref:"Dacia B25-0031", brands:["Dacia"], models:["Bigster"], eng:[], fuels:[], y0:2025, y1:2026,
      comp:"Ressorts de suspension arrière", prob:"Casse prématurée des ressorts arrière (lot) ; rupture et assiette penchée",
      sym:["Claquement arrière","Assiette penchée","Bruit de ressort cassé"], fix:"Remplacement par ressorts de diamètre majoré (campagne atelier)", dtc:[], sev:3 },
    { id:"TSB-DAC-DUSTER-RESS", src:"TSB", ref:"Dacia B24-0118", brands:["Dacia"], models:["Duster"], eng:[], fuels:[], y0:2024, y1:2026,
      comp:"Ressorts de suspension arrière", prob:"Rupture prématurée ressorts arrière ; remplacement par diamètre majoré",
      sym:["Claquement arrière","Assiette penchée"], fix:"Remplacement ressorts diamètre majoré", dtc:[], sev:3 },
    { id:"RC-PSA-COURROIE", src:"RC", ref:"RappelConso 2019-11-PSA", brands:["Peugeot","Citroën","DS","Opel"], models:[], eng:["1.2 puretech"], fuels:["Essence"], y0:2017, y1:2023,
      comp:"Courroie de distribution humide", prob:"Dégradation courroie → colmatage pompe à vide → assistance freinage réduite",
      sym:["Pédale de frein dure","Voyant","Bruit courroie"], fix:"Kit courroie + pompe à vide + crépine", dtc:["P0505","P0087"], sev:4 },
    { id:"TSB-PSA-EB2-OILPUMP", src:"TSB", ref:"PSA B21-0062", brands:["Peugeot","Citroën","Opel"], models:[], eng:["1.2 puretech"], fuels:["Essence"], y0:2017, y1:2022,
      comp:"Crépine / pompe à huile", prob:"Colmatage crépine (débris courroie) → pression d'huile insuffisante",
      sym:["Voyant huile","Bruits moteur"], fix:"Crépine + pompe + kit courroie", dtc:["P0520"], sev:4 },
    { id:"TSB-PSA-THP", src:"TSB", ref:"PSA B15-089", brands:["Peugeot","Citroën","DS","BMW","Mini"], models:[], eng:["1.6 thp"], fuels:["Essence"], y0:2017, y1:2019,
      comp:"Tendeur de chaîne THP/Prince", prob:"Usure tendeur → claquement, risque de saut de dent",
      sym:["Claquement à froid"], fix:"Kit tendeur + chaîne", dtc:["P0016"], sev:4 },
    { id:"BUL-PSA-20B-ADB", src:"BUL", ref:"PSA N04-2021", brands:["Peugeot","Citroën","DS","Opel"], models:[], eng:["2.0 bluehdi"], fuels:["Diesel"], y0:2017, y1:2022,
      comp:"Pompe AdBlue", prob:"Panne pompe AdBlue → bridage puissance", sym:["Message AdBlue","Perte puissance"], fix:"Remplacement pompe + MAJ", dtc:["P204C"], sev:3 },
    { id:"RC-REN-13TCE", src:"RC", ref:"RappelConso 2020-02-Renault", brands:["Renault","Dacia"], models:[], eng:["1.3 tce"], fuels:["Essence"], y0:2019, y1:2021,
      comp:"Pompe basse pression carburant", prob:"Calage à basse vitesse", sym:["Calage","Trous à l'accélération"], fix:"Remplacement pompe", dtc:["P0087"], sev:3 },
    { id:"TSB-REN-K9K-INJ", src:"TSB", ref:"Renault B17-045", brands:["Renault","Dacia","Nissan"], models:[], eng:["1.5 dci"], fuels:["Diesel"], y0:2017, y1:2020,
      comp:"Injecteurs / pompe Delphi K9K", prob:"Usure pompe → limailles, injecteurs HS", sym:["Perte puissance","Ratés","Voyant"], fix:"Kit injecteurs + pompe + nettoyage circuit", dtc:["P0087","P0200"], sev:4 },
    { id:"TSB-REN-EDC", src:"TSB", ref:"Renault B18-021", brands:["Renault","Dacia"], models:[], eng:["1.5 dci"], fuels:["Diesel"], y0:2017, y1:2021,
      comp:"Actionneur embrayage EDC6", prob:"Usure actionneur → à-coups, voyant boîte", sym:["À-coups","Voyant boîte"], fix:"Remplacement actionneur / kit", dtc:["P0741"], sev:3 },
    { id:"RC-DAC-SPRING-BATT", src:"RC", ref:"RappelConso 2022-06-Dacia", brands:["Dacia"], models:["Spring"], eng:["électrique"], fuels:["Électrique"], y0:2021, y1:2024,
      comp:"Batterie HT (étanchéité)", prob:"Infiltration → défaut d'isolement", sym:["Défaut batterie","Puissance bridée"], fix:"Contrôle / remplacement pack", dtc:["P0AA6"], sev:3 },
    { id:"NHTSA-FORD-PS", src:"NHTSA", ref:"NHTSA EA16-001", brands:["Ford"], models:["Focus","Fiesta"], eng:[], fuels:[], y0:2017, y1:2019,
      comp:"Boîte PowerShift DPS6", prob:"À-coups, patinage, usure embrayage (shudder)", sym:["À-coups basse vitesse","Vibrations","Message boîte"], fix:"Remplacement embrayage + MAJ TCM (programme garantie)", dtc:["P0741","P0750"], sev:3 },
    { id:"NHTSA-FORD-ECO-COOL", src:"NHTSA", ref:"NHTSA 18V-xxx", brands:["Ford"], models:[], eng:["1.0 ecoboost"], fuels:["Essence"], y0:2017, y1:2019,
      comp:"Culasse / refroidissement 1.0 EcoBoost", prob:"Fuite LDR → surchauffe", sym:["Surchauffe","Niveau LDR bas"], fix:"Culasse / durites (garantie étendue)", dtc:["P0217","P0128"], sev:3 },
    { id:"NHTSA-HONDA-DIL", src:"NHTSA", ref:"NHTSA EA18-002", brands:["Honda"], models:[], eng:["1.5 vtec turbo"], fuels:["Essence"], y0:2017, y1:2020,
      comp:"Moteur 1.5 Turbo (dilution huile)", prob:"Dilution d'huile par carburant en usage urbain froid", sym:["Niveau d'huile qui monte","Odeur essence","Voyant"], fix:"MAJ ECU + vidange rapprochée", dtc:["P0171","P0300"], sev:2 },
    { id:"NHTSA-NIS-CVT", src:"NHTSA", ref:"NHTSA EA20-001", brands:["Nissan"], models:["Rogue","Sentra","Altima"], eng:[], fuels:[], y0:2017, y1:2021,
      comp:"CVT Jatco", prob:"Surchauffe / panne CVT", sym:["Perte propulsion","Vibrations"], fix:"Remplacement CVT (extension garantie)", dtc:["P0741","P0745"], sev:4 },
    { id:"NHTSA-TESLA-EMMC", src:"NHTSA", ref:"NHTSA 21V-063", brands:["Tesla"], models:["Model S","Model X"], eng:[], fuels:["Électrique"], y0:2017, y1:2021,
      comp:"Mémoire eMMC MCU", prob:"Usure eMMC → écran noir, perte fonctions", sym:["Écran figé/noir","Redémarrages"], fix:"Remplacement module MCU (extension garantie)", dtc:["U0155"], sev:3 },
    { id:"NHTSA-TES-CAM", src:"NHTSA", ref:"NHTSA 22V-xxx", brands:["Tesla"], models:["Model 3","Model Y"], eng:[], fuels:["Électrique"], y0:2020, y1:2023,
      comp:"Caméra habitacle / MCU", prob:"Défaillance caméra", sym:["Caméra indisponible"], fix:"Remplacement", dtc:["U0155"], sev:2 },
    { id:"NHTSA-GM-8L", src:"NHTSA", ref:"NHTSA EA19-001", brands:["Chevrolet"], models:["Silverado","Tahoe","Camaro"], eng:[], fuels:[], y0:2017, y1:2019,
      comp:"BVA 8 rapports 8L45/8L90", prob:"Broutements / shudder, usure convertisseur", sym:["Vibrations 40-80 km/h","À-coups"], fix:"Vidange fluide spécifique + MAJ + convertisseur si besoin", dtc:["P0741"], sev:3 },
    { id:"SG-VW-DSG", src:"SG", ref:"Safety Gate 2018-DE-042", brands:["Volkswagen","Audi","Seat","Skoda"], models:[], eng:[], fuels:[], y0:2017, y1:2020,
      comp:"Mécatronique DSG DQ200", prob:"Défaillance mécatronique → perte propulsion", sym:["À-coups","Voyant boîte","Mode sécurité"], fix:"Remplacement mécatronique / MAJ", dtc:["P0700","P0715"], sev:4 },
    { id:"TSB-VW-EA888", src:"TSB", ref:"VW 2025-17", brands:["Volkswagen","Audi"], models:[], eng:["2.0 tsi"], fuels:["Essence"], y0:2017, y1:2019,
      comp:"Tendeur de chaîne EA888 gen2", prob:"Saut de dent / usure tendeur", sym:["Claquement démarrage","Voyant"], fix:"Kit tendeur + chaîne", dtc:["P0016"], sev:4 },
    { id:"TSB-VW-EA211", src:"TSB", ref:"VW 2020-08", brands:["Volkswagen","Skoda","Seat"], models:[], eng:["1.0 tsi","1.5 tsi"], fuels:["Essence"], y0:2017, y1:2021,
      comp:"Chaîne / tendeur EA211", prob:"Usure tendeur chaîne", sym:["Claquement"], fix:"Kit chaîne", dtc:["P0016"], sev:3 },
    { id:"TSB-BMW-B47", src:"TSB", ref:"BMW SIB 11-09-19", brands:["BMW"], models:[], eng:["20d","2.0 d"], fuels:["Diesel"], y0:2017, y1:2021,
      comp:"Chaîne de distribution B47", prob:"Usure tendeur/chaîne → claquement, rupture", sym:["Claquement chaîne","Voyant"], fix:"Kit chaîne + tendeur", dtc:["P0016"], sev:4 },
    { id:"TSB-MB-OM651", src:"TSB", ref:"Mercedes LI20.10-P-056", brands:["Mercedes"], models:[], eng:["220 d","2.2 d"], fuels:["Diesel"], y0:2017, y1:2019,
      comp:"Injecteurs / joint d'injecteur OM651", prob:"Fuite de compression / calamine", sym:["Claquement","Fumée","Odeur"], fix:"Remplacement joints/injecteurs + MAJ", dtc:["P0200"], sev:3 },
    { id:"WEB-MER-EQC", src:"WEB", ref:"Presse spécialisée 2022", brands:["Mercedes"], models:["EQC"], eng:["électrique"], fuels:["Électrique"], y0:2019, y1:2023,
      comp:"Batterie HT (étanchéité)", prob:"Infiltration → défaut d'isolement", sym:["Défaut HV"], fix:"Contrôle pack", dtc:["P0AA6"], sev:3 },
    { id:"TSB-TOY-D4D", src:"TSB", ref:"Toyota T-SB-0034-18", brands:["Toyota"], models:[], eng:["2.2 d-4d","2.8 d-4d"], fuels:["Diesel"], y0:2017, y1:2020,
      comp:"Injecteurs D-4D", prob:"Usure injecteurs → calamine, fumée", sym:["Fumée noire","Claquement"], fix:"Remplacement injecteurs + MAJ", dtc:["P0200"], sev:3 },
    { id:"WEB-TOY-HYB", src:"WEB", ref:"Sites spécialisés hybride", brands:["Toyota","Lexus"], models:[], eng:["hybrid"], fuels:["Hybride"], y0:2017, y1:2022,
      comp:"Batterie NiMH (ventilation)", prob:"Usure batterie hybride", sym:["Perte hybride","Voyant"], fix:"Remplacement / équilibrage modules", dtc:["P0A80"], sev:2 },
    { id:"WEB-MZ-22D", src:"WEB", ref:"Forums/spécialisés DPF", brands:["Mazda"], models:[], eng:["2.2 skyactiv-d"], fuels:["Diesel"], y0:2017, y1:2021,
      comp:"FAP / calamine 2.2 D", prob:"Encrassement FAP & soupapes (dilution)", sym:["Voyant FAP","Perte puissance"], fix:"Nettoyage / MAJ + entretien", dtc:["P2463"], sev:3 },
    { id:"WEB-SUB-CVT", src:"WEB", ref:"Sites spécialisés CVT", brands:["Subaru"], models:[], eng:[], fuels:[], y0:2017, y1:2021,
      comp:"CVT (chaîne / valve body)", prob:"Broutements CVT", sym:["Vibrations","À-coups"], fix:"Vidange CVT / valve body", dtc:["P0741"], sev:3 },
    { id:"WEB-KIA-DCT", src:"WEB", ref:"Sites spécialisés DCT", brands:["Hyundai","Kia"], models:[], eng:["1.6 t-gdi"], fuels:["Essence"], y0:2017, y1:2021,
      comp:"DCT 7 rapports", prob:"À-coups embrayage DCT", sym:["À-coups départ"], fix:"MAJ TCU + embrayage si usé", dtc:["P0741"], sev:2 },
    { id:"WEB-MG-ZS-CHG", src:"WEB", ref:"Forums MG EV", brands:["MG"], models:["ZS"], eng:["électrique"], fuels:["Électrique"], y0:2020, y1:2024,
      comp:"Chargeur embarqué", prob:"Charge AC lente / interrompue", sym:["Charge interrompue"], fix:"MAJ / remplacement chargeur", dtc:["P0C29"], sev:2 },
    { id:"WEB-BYD-LFP", src:"WEB", ref:"Presse EV 2023", brands:["BYD"], models:[], eng:["électrique"], fuels:["Électrique"], y0:2022, y1:2026,
      comp:"Batterie LFP (calibration SOC)", prob:"Écart SOC → coupure", sym:["Autonomie erratique","Coupure"], fix:"MAJ BMS", dtc:["P0A80"], sev:2 },
    { id:"WEB-REN-ZOE-CHG", src:"WEB", ref:"Forums Zoé", brands:["Renault"], models:["Zoé"], eng:["électrique"], fuels:["Électrique"], y0:2017, y1:2021,
      comp:"Chargeur Caméléon", prob:"Panne chargeur AC", sym:["Charge impossible"], fix:"Remplacement chargeur", dtc:["P0C29"], sev:3 },
    { id:"TSB-JLR-ING", src:"TSB", ref:"JLR SSM-50112", brands:["Land Rover","Jaguar"], models:[], eng:["2.0 d"], fuels:["Diesel"], y0:2017, y1:2021,
      comp:"Courroie accessoire Ingenium D", prob:"Usure courroie → perte alternateur", sym:["Sifflement","Voyant batterie"], fix:"Kit courroie + galets", dtc:[], sev:3 },
    { id:"TSB-VOLVO-VEA", src:"TSB", ref:"Volvo TJ-20-05", brands:["Volvo"], models:[], eng:["d3","d4"], fuels:["Diesel"], y0:2017, y1:2020,
      comp:"Injecteurs VEA D", prob:"Usure injecteurs", sym:["Claquement","Fumée"], fix:"Remplacement injecteurs", dtc:["P0200"], sev:3 },
    { id:"WEB-FCA-20MJ", src:"WEB", ref:"Forums FCA diesel", brands:["Jeep","Fiat"], models:[], eng:["2.0 multijet"], fuels:["Diesel"], y0:2017, y1:2021,
      comp:"EGR / FAP 2.0 MJT", prob:"Encrassement EGR/FAP", sym:["Voyant","Perte puissance"], fix:"Nettoyage / remplacement EGR + MAJ", dtc:["P0401"], sev:2 },
    { id:"TSB-OPE-12T", src:"TSB", ref:"Opel TSB-2021-04", brands:["Opel"], models:[], eng:["1.2 turbo"], fuels:["Essence"], y0:2017, y1:2021,
      comp:"Chaîne 1.2 Turbo", prob:"Usure chaîne / tendeur", sym:["Claquement"], fix:"Kit chaîne", dtc:["P0016"], sev:3 },
    { id:"SG-TAKATA", src:"SG", ref:"Safety Gate 2017-2020", brands:["Honda","Nissan","Toyota","Mazda","Subaru","Mitsubishi","BMW","Mercedes","Fiat","Alfa Romeo"], models:[], eng:[], fuels:[], y0:2017, y1:2020,
      comp:"Générateur d'airbag Takata", prob:"Rupture anormale du générateur", sym:["Voyant airbag"], fix:"Remplacement gratuit en concession", dtc:["B0001","B0002"], sev:4 }
  ];

  const K_CUSTOM = "mtk_tsb_custom_v1";
  const read = (k,d) => { try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } };
  function customs(){ return read(K_CUSTOM, []); }
  function saveCustoms(l){ localStorage.setItem(K_CUSTOM, JSON.stringify(l)); }

  function normEng(s){
    return String(s).toLowerCase()
      .replace(/blue\s?hdi/g,"hdi").replace(/blue\s?dci/g,"dci")
      .replace(/e-?tech/g,"etech").replace(/e-?tense/g,"etense").replace(/e-?power/g,"epower")
      .replace(/e-?hybrid/g,"hybrid").replace(/[^a-z0-9.]/g,"");
  }
  function engMatch(pat, engineNorm){ return engineNorm.includes(normEng(pat)); }

  function all(){ return customs().concat(DB); }

  function forVehicle(brand, modelName, mYear, engine){
    const e = normEng(engine);
    const fuel = DT.fuelOf(engine);
    return all().filter(t => {
      if (!t.brands.includes(brand)) return false;
      if (t.models && t.models.length && !t.models.some(m => modelName.toLowerCase().includes(m.toLowerCase()))) return false;
      if (t.eng && t.eng.length && !t.eng.some(p => engMatch(p, e))) return false;
      if (t.fuels && t.fuels.length && !t.fuels.includes(fuel)) return false;
      return !(mYear > t.y1 || 2026 < t.y0);
    });
  }

  function search(q){
    q = q.toLowerCase();
    return all().filter(t => (t.id+" "+t.ref+" "+t.brands.join(" ")+" "+(t.models||[]).join(" ")+" "+(t.eng||[]).join(" ")+" "+t.comp+" "+t.prob+" "+t.sym.join(" ")).toLowerCase().includes(q)).slice(0, 60);
  }
  function byId(id){ return all().find(t => t.id === id) || null; }

  return { SRC, all, forVehicle, search, byId, customs, saveCustoms };
})();
