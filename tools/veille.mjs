import fs from "node:fs";
/* Veille 15 j : interrogation API NHTSA + nouveaux modèles/motorisations 2025-2026 */
const COMBOS = [
  ["SKODA","ELROQ",2026],["SKODA","ENYAQ",2026],["RENAULT","R5",2026],["RENAULT","CLIO",2026],
  ["PEUGEOT","3008",2026],["PEUGEOT","208",2026],["CITROEN","C3",2026],["DACIA","BIGSTER",2026],
  ["DACIA","DUSTER",2026],["VOLKSWAGEN","ID.4",2026],["VOLKSWAGEN","GOLF",2026],["TOYOTA","YARIS",2026],
  ["TESLA","MODEL 3",2026],["FORD","PUMA",2026],["BMW","X3",2026],["MERCEDES-BENZ","C-CLASS",2026],
  ["AUDI","Q4",2026],["SEAT","LEON",2026],["KIA","EV3",2026],["HYUNDAI","TUCSON",2026]
];
const NEW_MODELS = [
  { type:"model", id:"MOD-REN-TWINGO-2026", brand:"Renault", model:"Twingo E-Tech", y0:2026, engines:["Électrique 95","Électrique 130"] },
  { type:"model", id:"MOD-VW-ID2-2026", brand:"Volkswagen", model:"ID.2", y0:2026, engines:["Électrique 170","Électrique 204","Électrique 226"] },
  { type:"model", id:"MOD-SKO-EPIQ-2026", brand:"Skoda", model:"Epiq", y0:2026, engines:["Électrique 170","Électrique 204"] },
  { type:"model", id:"MOD-PEU-208III-2026", brand:"Peugeot", model:"208 III", y0:2026, engines:["1.2 Hybrid 110","1.2 Hybrid 145","Électrique 156"] },
  { type:"engine", id:"ENG-REN-AUSTRAL-2026", brand:"Renault", model:"Austral", y0:2026, engines:["1.3 TCe 160"] }
];
async function nhtsa(make, model, year){
  try{
    const r = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`);
    if (!r.ok) return [];
    const j = await r.json();
    return (j.results||[]).map(x => ({ id:"NHTSA-"+x.NHTSACampaignNumber, type:"recall",
      brand: make.charAt(0)+make.slice(1).toLowerCase(), model: model.charAt(0)+model.slice(1).toLowerCase(),
      y0:year, y1:year, comp:x.Component||"Composant", risk:x.Consequence||"", fix:x.Remedy||"",
      src:"NHTSA", ref:x.NHTSACampaignNumber||"", date:(x.ReportReceivedDate||"").slice(0,10), dtcs:[], sev:3 }));
  }catch(e){ return []; }
}
let items = [...NEW_MODELS];
for (const [m, mo, y] of COMBOS){ items = items.concat(await nhtsa(m, mo, y)); await new Promise(r=>setTimeout(r,300)); }
const seen = new Set(); items = items.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; });
const version = Date.now();
fs.mkdirSync("data", { recursive:true });
fs.writeFileSync("data/veille-pack.json", JSON.stringify({ app:"Ma Tech by Kevin", version, date:new Date().toISOString(), items }, null, 2));
fs.writeFileSync("veille.json", JSON.stringify({ version, date:new Date().toISOString(), file:"data/veille-pack.json" }, null, 2));
console.log("veille OK :", items.length, "éléments");
