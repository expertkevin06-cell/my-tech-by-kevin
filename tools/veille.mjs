import fs from "node:fs";
/* Veille 15 j multi-sources (NHTSA + Safety Gate + RappelConso + sites spécialisés)
   avec TRADUCTION FRANÇAISE obligatoire, + génération du pack catalogue 2023-2027. */
const GLOSSARY = [
  ["high voltage battery","batterie haute tension"],["fuel pump","pompe à carburant"],["seat belts","ceintures de sécurité"],["seat belt","ceinture de sécurité"],
  ["service brakes","freinage de service"],["parking brake","frein de stationnement"],["power train","groupe motopropulseur"],["wiring harness","faisceau électrique"],
  ["electrical system","système électrique"],["update the software","mettre à jour le logiciel"],["loss of motive power","perte de propulsion"],["risk of fire","risque d'incendie"],
  ["may cause","peut provoquer"],["can cause","peut provoquer"],["air bag","airbag"],["windshield","pare-brise"],["coolant","liquide de refroidissement"],
  ["short circuit","court-circuit"],["overheating","surchauffe"],["stalling","calage"],["dealer","concession"],["transmission","boîte de vitesses"],["suspension","suspension"],
  ["steering","direction"],["engine","moteur"],["battery","batterie"],["brakes","freins"],["tires","pneumatiques"],["tire","pneumatique"],["wheels","roues"],["wheel","roue"],
  ["camera","caméra"],["sensor","capteur"],["module","module"],["inverter","onduleur"],["charger","chargeur"],["charging","charge"],["software","logiciel"],["leak","fuite"],
  ["corrosion","corrosion"],["fracture","rupture"],["crash","collision"],["injury","blessure"],["fire","incendie"],["replace","remplacer"],["inspect","contrôler"],
  ["remedy","solution"],["consequence","conséquence"],["component","composant"],["summary","résumé"],["visibility","visibilité"],["latches","verrous"]
];
const tr = s => { if(!s) return s; let t=String(s); GLOSSARY.forEach(p=>{ t=t.replace(new RegExp(p[0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"), p[1]); }); return t; };

const COMBOS = [
  ["SKODA","ELROQ",2026],["SKODA","ELROQ",2025],["SKODA","ENYAQ",2026],["RENAULT","R5",2026],["RENAULT","CLIO",2026],
  ["PEUGEOT","3008",2026],["PEUGEOT","208",2026],["CITROEN","C3",2026],["DACIA","BIGSTER",2026],["DACIA","DUSTER",2026],
  ["VOLKSWAGEN","ID.4",2026],["VOLKSWAGEN","GOLF",2026],["TOYOTA","YARIS",2026],["TESLA","MODEL 3",2026],["FORD","PUMA",2026],
  ["BMW","X3",2026],["MERCEDES-BENZ","C-CLASS",2026],["AUDI","Q4",2026],["SEAT","LEON",2026],["KIA","EV3",2026],
  ["HYUNDAI","TUCSON",2026],["HONDA","CIVIC",2026],["NISSAN","QASHQAI",2026],["MAZDA","CX-5",2026],["VOLVO","EX30",2026],
  ["OPEL","CORSA",2026],["FIAT","500",2026],["JEEP","AVENGER",2026],["XIAOMI","SU7",2026],["RIVIAN","R1S",2026]
];
const NEW_TSB = [
  { type:"tsb", id:"TSB-STL-DV5-CHAIN-EXT", src:"TSB", ref:"Stellantis B24-0210", brand:"Peugeot", eng:["1.5 hdi"], en:["Diesel"], y0:2022, y1:2024, comp:"Chaîne de distribution 8 mm (contrôle)", prob:"Contrôle chaîne 8 mm après extension garantie", sym:["Claquement"], fix:"Contrôle/remplacement chaîne 8 mm", dtcs:["P0016"], sev:3 },
  { type:"tsb", id:"TSB-REN-R5-12V-2026", src:"TSB", ref:"Renault B26-0014", brand:"Renault", model:"R5", eng:["électrique"], en:["Électrique"], y0:2025, y1:2027, comp:"Batterie 12V AGM", prob:"Décharge 12V prématurée", sym:["Démarrage impossible"], fix:"Remplacement 12V + MAJ gestion veille", dtcs:["P0562"], sev:3 },
  { type:"tsb", id:"TSB-VW-MEB-BMS2-2026", src:"TSB", ref:"VW B26-0033", brand:"Volkswagen", model:"ID.4", eng:["électrique"], en:["Électrique"], y0:2024, y1:2027, comp:"BMS calibration SOC v2", prob:"SOC erratique après charge rapide", sym:["Autonomie erratique"], fix:"MAJ BMS v2", dtcs:["P1A15"], sev:2 },
  { type:"tsb", id:"TSB-DAC-BIGSTER-RESS2", src:"TSB", ref:"Dacia B26-0007", brand:"Dacia", model:"Bigster", en:[], y0:2025, y1:2027, comp:"Ressorts arrière (lot 2)", prob:"Casse ressorts lot 2", sym:["Claquement arrière"], fix:"Ressorts diamètre majoré", dtcs:[], sev:3 }
];
const CATALOG = JSON.parse(fs.existsSync("data/catalog-curated.json") ? fs.readFileSync("data/catalog-curated.json","utf8") : "null") || [
  {brand:"Xiaomi",o:"AS",models:[{model:"SU7",y0:2024,engines:["Électrique 299","Électrique 495","Électrique 673"]},{model:"YU7",y0:2025,engines:["Électrique 320","Électrique 500"]}]},
  {brand:"Lucid",o:"US",models:[{model:"Air",y0:2023,engines:["Électrique 480","Électrique 850"]},{model:"Gravity",y0:2025,engines:["Électrique 800","Électrique 900"]}]},
  {brand:"Rivian",o:"US",models:[{model:"R2",y0:2026,engines:["Électrique 300","Électrique 420"]}]},
  {brand:"VinFast",o:"AS",models:[{model:"VF 8",y0:2023,engines:["Électrique 402"]},{model:"VF 6",y0:2024,engines:["Électrique 201"]}]},
  {brand:"Zeekr",o:"AS",models:[{model:"007",y0:2024,engines:["Électrique 310","Électrique 475"]}]},
  {brand:"Renault",o:"FR",models:[{model:"Twingo E-Tech",y0:2026,engines:["Électrique 95","Électrique 130"]},{model:"R5 Turbo 3E",y0:2027,engines:["Électrique 540"]}]},
  {brand:"Peugeot",o:"FR",models:[{model:"208 III",y0:2026,engines:["1.2 Hybrid 110","1.2 Hybrid 145","Électrique 156"]}]},
  {brand:"Volkswagen",o:"EU",models:[{model:"ID.2",y0:2026,engines:["Électrique 170","Électrique 204","Électrique 226"]},{model:"Golf IX",y0:2027,engines:["1.5 TSI 130","2.0 TSI 204","eHybrid 272"]}]},
  {brand:"Skoda",o:"EU",models:[{model:"Epiq",y0:2026,engines:["Électrique 170","Électrique 204"]},{model:"Octavia V",y0:2027,engines:["1.5 TSI 130","2.0 TDI 150","eHybrid 204"]}]},
  {brand:"Toyota",o:"AS",models:[{model:"Urban Cruiser",y0:2025,engines:["Électrique 184","Électrique 231"]},{model:"RAV4 VI",y0:2026,engines:["2.5 Hybrid 222","PHEV 306"]}]},
  {brand:"Tesla",o:"US",models:[{model:"Model 2",y0:2026,engines:["Électrique 204","Électrique 283"]},{model:"Cybercab",y0:2027,engines:["Électrique 204"]}]},
  {brand:"BMW",o:"EU",models:[{model:"iX3 (Neue Klasse)",y0:2026,engines:["Électrique 340","Électrique 470"]}]},
  {brand:"Mercedes",o:"EU",models:[{model:"CLA EV (MMA)",y0:2025,engines:["Électrique 272","Électrique 354"]},{model:"GLC EV",y0:2026,engines:["Électrique 388","Électrique 490"]}]},
  {brand:"Kia",o:"AS",models:[{model:"EV4",y0:2025,engines:["Électrique 204"]},{model:"EV5",y0:2025,engines:["Électrique 218","Électrique 325"]},{model:"EV2",y0:2026,engines:["Électrique 136","Électrique 204"]}]},
  {brand:"Hyundai",o:"AS",models:[{model:"Ioniq 7",y0:2025,engines:["Électrique 218","Électrique 325"]}]},
  {brand:"BYD",o:"AS",models:[{model:"Sealion 7",y0:2025,engines:["Électrique 313","Électrique 530"]}]},
  {brand:"Volvo",o:"EU",models:[{model:"EX60",y0:2026,engines:["Électrique 374","Électrique 517"]},{model:"ES90",y0:2025,engines:["Électrique 333","Électrique 670"]}]},
  {brand:"Polestar",o:"EU",models:[{model:"5",y0:2026,engines:["Électrique 544","Électrique 884"]}]},
  {brand:"Jeep",o:"US",models:[{model:"Wagoneer S",y0:2025,engines:["Électrique 600"]},{model:"Recon",y0:2026,engines:["Électrique 500"]}]},
  {brand:"Nissan",o:"AS",models:[{model:"Leaf III",y0:2025,engines:["Électrique 214"]},{model:"Micra EV",y0:2026,engines:["Électrique 122","Électrique 150"]}]},
  {brand:"Mazda",o:"AS",models:[{model:"6e",y0:2025,engines:["Électrique 258"]}]},
  {brand:"Suzuki",o:"AS",models:[{model:"e-Vitara",y0:2025,engines:["Électrique 144","Électrique 184"]}]},
  {brand:"Mini",o:"EU",models:[{model:"Aceman",y0:2024,engines:["Électrique 184","Électrique 218"]}]},
  {brand:"Fiat",o:"EU",models:[{model:"Panda IV",y0:2026,engines:["1.0 Hybrid 70","Électrique 118"]}]}
];

async function nhtsa(make,model,year){
  try{ const r=await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`);
    if(!r.ok) return []; const j=await r.json();
    return (j.results||[]).map(x=>({ id:"NHTSA-"+x.NHTSACampaignNumber, type:"recall", brand:make.charAt(0)+make.slice(1).toLowerCase(), model:model.charAt(0)+model.slice(1).toLowerCase(),
      y0:year, y1:year, comp:tr(x.Component||""), risk:tr(x.Consequence||""), fix:tr(x.Remedy||""), src:"NHTSA", ref:x.NHTSACampaignNumber||"", date:(x.ReportReceivedDate||"").slice(0,10), dtcs:[], sev:3 }));
  }catch(e){ return []; }
}
async function safetyGate(){
  try{ const r=await fetch("https://webgate.ec.europa.eu/safety-gate-alerts/screen/webReport/alertList?pageSize=50");
    if(!r.ok) return []; const j=await r.json();
    return (j.content||j||[]).slice(0,50).map((x,i)=>({ id:"SG-"+(x.reference||i), type:"recall", brand:(x.brandName||x.company||"Marque").split(" ")[0], model:"", y0:2017, y1:2027,
      comp:tr(x.category||"Produit"), risk:tr(x.description||x.risk||""), fix:tr(x.measures||"Voir concession"), src:"SG", ref:x.reference||"", date:(x.publicationDate||"").slice(0,10), dtcs:[], sev:3 }));
  }catch(e){ return []; }
}
async function rappelConso(){
  try{ const r=await fetch("https://rappel.conso.gouv.fr/api/alerts?limit=50");
    if(!r.ok) return []; const j=await r.json();
    return (j.results||j||[]).slice(0,50).map((x,i)=>({ id:"RC-"+(x.id||i), type:"recall", brand:(x.marque||x.brand||"Marque"), model:(x.modele||x.model||""), y0:2017, y1:2027,
      comp:tr(x.categorie||x.component||"Composant"), risk:tr(x.risque||x.description||""), fix:tr(x.solution||x.remedy||"Voir concession"), src:"RC", ref:x.id||"", date:(x.date||"").slice(0,10), dtcs:[], sev:3 }));
  }catch(e){ return []; }
}

let items=[...NEW_TSB];
items=items.concat(await safetyGate(), await rappelConso());
for (const [m,mo,y] of COMBOS){ items=items.concat(await nhtsa(m,mo,y)); await new Promise(r=>setTimeout(r,250)); }
const seen=new Set(); items=items.filter(i=>{ if(seen.has(i.id)) return false; seen.add(i.id); return true; });
const version=Date.now();
fs.mkdirSync("data",{recursive:true});
fs.writeFileSync("data/veille-pack.json", JSON.stringify({app:"Ma Tech by Kevin",version,date:new Date().toISOString(),items},null,2));
fs.writeFileSync("veille.json", JSON.stringify({version,date:new Date().toISOString(),file:"data/veille-pack.json"},null,2));
fs.writeFileSync("data/catalog-pack.json", JSON.stringify({app:"Ma Tech by Kevin",version,date:new Date().toISOString(),items:CATALOG},null,2));
console.log("veille OK :", items.length, "éléments • catalogue :", CATALOG.length, "entrées");
