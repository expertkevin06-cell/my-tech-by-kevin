import fs from "node:fs";
/* Veille 15 j renforcée : NHTSA (2025 & 2026) + nouveaux modèles/motorisations + nouveaux TSB/pannes connues */
const COMBOS = [
  ["SKODA","ELROQ",2026],["SKODA","ELROQ",2025],["SKODA","ENYAQ",2026],["RENAULT","R5",2026],["RENAULT","R5",2025],
  ["RENAULT","CLIO",2026],["PEUGEOT","3008",2026],["PEUGEOT","208",2026],["CITROEN","C3",2026],["DACIA","BIGSTER",2026],
  ["DACIA","BIGSTER",2025],["DACIA","DUSTER",2026],["VOLKSWAGEN","ID.4",2026],["VOLKSWAGEN","GOLF",2026],["TOYOTA","YARIS",2026],
  ["TESLA","MODEL 3",2026],["FORD","PUMA",2026],["BMW","X3",2026],["MERCEDES-BENZ","C-CLASS",2026],["AUDI","Q4",2026],
  ["SEAT","LEON",2026],["KIA","EV3",2026],["HYUNDAI","TUCSON",2026],["HONDA","CIVIC",2026],["NISSAN","QASHQAI",2026],
  ["MAZDA","CX-5",2026],["VOLVO","EX30",2026],["OPEL","CORSA",2026],["FIAT","500",2026],["JEEP","AVENGER",2026]
];
const NEW_MODELS = [
  { type:"model", id:"MOD-REN-TWINGO-2026", brand:"Renault", model:"Twingo E-Tech", y0:2026, engines:["Électrique 95","Électrique 130"] },
  { type:"model", id:"MOD-VW-ID2-2026", brand:"Volkswagen", model:"ID.2", y0:2026, engines:["Électrique 170","Électrique 204","Électrique 226"] },
  { type:"model", id:"MOD-SKO-EPIQ-2026", brand:"Skoda", model:"Epiq", y0:2026, engines:["Électrique 170","Électrique 204"] },
  { type:"model", id:"MOD-PEU-208III-2026", brand:"Peugeot", model:"208 III", y0:2026, engines:["1.2 Hybrid 110","1.2 Hybrid 145","Électrique 156"] },
  { type:"engine", id:"ENG-REN-AUSTRAL-2026", brand:"Renault", model:"Austral", y0:2026, engines:["1.3 TCe 160"] }
];
const NEW_TSB = [
  { type:"tsb", id:"TSB-STL-DV5-CHAIN-EXT", src:"TSB", ref:"Stellantis B24-0210 (DV5 étendu)", brand:"Peugeot", model:"", eng:["1.5 hdi","1.5 bluehdi"], en:["Diesel"], y0:2022, y1:2024, comp:"Chaîne de distribution 8 mm (contrôle)", prob:"Contrôle chaîne 8 mm après extension garantie", sym:["Claquement"], fix:"Contrôle/remplacement chaîne 8 mm", dtcs:["P0016"], sev:3 },
  { type:"tsb", id:"TSB-REN-R5-12V-2026", src:"TSB", ref:"Renault B26-0014", brand:"Renault", model:"R5", eng:["électrique"], en:["Électrique"], y0:2025, y1:2026, comp:"Batterie 12V AGM", prob:"Décharge 12V prématurée", sym:["Démarrage impossible"], fix:"Remplacement 12V + MAJ gestion veille", dtcs:["P0562"], sev:3 },
  { type:"tsb", id:"TSB-VW-MEB-BMS2-2026", src:"TSB", ref:"VW B26-0033 (MEB)", brand:"Volkswagen", model:"ID.4", eng:["électrique"], en:["Électrique"], y0:2024, y1:2026, comp:"BMS calibration SOC v2", prob:"SOC erratique après charge rapide", sym:["Autonomie erratique"], fix:"MAJ BMS v2", dtcs:["P1A15"], sev:2 },
  { type:"tsb", id:"TSB-DAC-BIGSTER-RESS-2", src:"TSB", ref:"Dacia B26-0007", brand:"Dacia", model:"Bigster", eng:[], en:[], y0:2025, y1:2026, comp:"Ressorts arrière (lot 2)", prob:"Casse ressorts lot 2", sym:["Claquement arrière"], fix:"Ressorts diamètre majoré", dtcs:[], sev:3 }
];
async function nhtsa(make,model,year){
  try{ const r=await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`);
    if(!r.ok) return []; const j=await r.json();
    return (j.results||[]).map(x=>({ id:"NHTSA-"+x.NHTSACampaignNumber, type:"recall", brand:make.charAt(0)+make.slice(1).toLowerCase(), model:model.charAt(0)+model.slice(1).toLowerCase(), y0:year, y1:year, comp:x.Component||"", risk:x.Consequence||"", fix:x.Remedy||"", src:"NHTSA", ref:x.NHTSACampaignNumber||"", date:(x.ReportReceivedDate||"").slice(0,10), dtcs:[], sev:3 }));
  }catch(e){ return []; }
}
let items=[...NEW_MODELS, ...NEW_TSB];
for (const [m,mo,y] of COMBOS){ items=items.concat(await nhtsa(m,mo,y)); await new Promise(r=>setTimeout(r,250)); }
const seen=new Set(); items=items.filter(i=>{ if(seen.has(i.id)) return false; seen.add(i.id); return true; });
const version=Date.now();
fs.mkdirSync("data",{recursive:true});
fs.writeFileSync("data/veille-pack.json", JSON.stringify({app:"Ma Tech by Kevin",version,date:new Date().toISOString(),items},null,2));
fs.writeFileSync("veille.json", JSON.stringify({version,date:new Date().toISOString(),file:"data/veille-pack.json"},null,2));
console.log("veille OK :", items.length, "éléments");
