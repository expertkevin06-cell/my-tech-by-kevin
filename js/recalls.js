"use strict";
/* ===== Campagnes de rappels : réelles + générées, filtrées marque/modèle/motorisation/puissance/année ===== */
const Recalls = (() => {
  function powerOf(e){ const m = String(e).trim().match(/(\d{2,4})\s*$/); return m ? +m[1] : 0; }

  const CURATED = [
    { id:"RAP-TAKATA-2017", brands:["Honda","Nissan","Toyota","Mazda","Subaru","Mitsubishi","Lexus","BMW","Mercedes","Fiat","Alfa Romeo"], models:[], fuels:[], pw:null, y0:2017, y1:2020,
      comp:"Générateur d'airbag Takata (conducteur/passager)", risk:"Rupture anormale du générateur (propulseur dégradé par l'humidité) — projection de fragments métalliques", fix:"Remplacement gratuit du générateur d'airbag en concession", dtcs:["B0001","B0002"], status:"open", date:"2017-06" },
    { id:"RAP-BMW-EGR-2018", brands:["BMW"], models:[], fuels:["Diesel"], pw:null, y0:2017, y1:2019,
      comp:"Refroidisseur de vanne EGR", risk:"Fuite de glycol → dépôts chauds → risque d'incendie", fix:"Remplacement du refroidisseur EGR + contrôle admission + mise à jour logicielle", dtcs:["P0401","P0403","P2002"], status:"open", date:"2018-08" },
    { id:"RAP-PSA-PURETECH-2019", brands:["Peugeot","Citroën","DS","Opel"], models:[], fuels:["Essence"], pw:[75,135], y0:2017, y1:2023,
      comp:"Courroie de distribution humide (1.2 PureTech)", risk:"Usure prématurée de la courroie → colmatage pompe à vide → perte d'assistance de freinage", fix:"Remplacement courroie + galets + pompe à vide + crépine (prise en charge étendue)", dtcs:["P0087","P0505"], status:"open", date:"2019-11" },
    { id:"RAP-TOYOTA-DENSO-2019", brands:["Toyota","Lexus","Mitsubishi","Mazda","Subaru"], models:[], fuels:["Essence","Hybride"], pw:null, y0:2017, y1:2020,
      comp:"Pompe à carburant Denso (turbine)", risk:"Calage moteur en roulant, redémarrage impossible", fix:"Remplacement du module pompe à carburant", dtcs:["P0087","P0191"], status:"closed", date:"2019-09" },
    { id:"RAP-HYUNDAI-THETA-2018", brands:["Hyundai","Kia"], models:[], fuels:["Essence"], pw:[180,340], y0:2017, y1:2020,
      comp:"Coussinets de bielle moteur (Theta II / GDI)", risk:"Serrage moteur → calage ou risque d'incendie", fix:"Inspection, remplacement moteur si nécessaire + logiciel KSDS", dtcs:["P0299","P0300"], status:"open", date:"2018-05" },
    { id:"RAP-HYUNDAI-HECU-2021", brands:["Hyundai","Kia"], models:[], fuels:[], pw:null, y0:2017, y1:2021,
      comp:"Bloc hydraulique ABS/HECU", risk:"Court-circuit interne → risque d'incendie moteur", fix:"Remplacement du fusible HECU / du bloc ABS", dtcs:["C0110","C0121"], status:"open", date:"2021-03" },
    { id:"RAP-VW-EA189-2017", brands:["Volkswagen","Audi","Seat","Skoda"], models:[], fuels:["Diesel"], pw:null, y0:2017, y1:2018,
      comp:"Logiciel de gestion moteur (EA189)", risk:"Non-conformité des émissions NOx en usage réel", fix:"Mise à jour du calculateur + éventuel volet d'admission", dtcs:["P0401","P2002"], status:"closed", date:"2017-02" },
    { id:"RAP-FORD-ECOBOOST-2018", brands:["Ford"], models:["Fiesta VII","Focus IV","EcoSport"], fuels:["Essence"], pw:[100,140], y0:2017, y1:2019,
      comp:"Culasse / circuit de refroidissement (1.0 EcoBoost)", risk:"Fuite de liquide de refroidissement → surchauffe", fix:"Remplacement culasse / durites sous garantie étendue", dtcs:["P0217","P0128"], status:"closed", date:"2018-04" },
    { id:"RAP-RENAULT-TCe-2020", brands:["Renault","Dacia"], models:[], fuels:["Essence"], pw:[130,160], y0:2019, y1:2021,
      comp:"Pompe à carburant basse pression (1.3 TCe)", risk:"Calage moteur à basse vitesse", fix:"Remplacement du module pompe basse pression", dtcs:["P0087","P0191"], status:"closed", date:"2020-02" },
    { id:"RAP-PSA-ADBLUE-2018", brands:["Peugeot","Citroën","DS","Opel"], models:[], fuels:["Diesel"], pw:[100,180], y0:2017, y1:2020,
      comp:"Pompe / injecteur AdBlue (SCR)", risk:"Cristallisation → panne du système de dépollution", fix:"Remplacement pompe et injecteur AdBlue + nettoyage ligne", dtcs:["P2047","P20EE"], status:"open", date:"2018-10" },
    { id:"RAP-TESLA-ECALL-2021", brands:["Tesla"], models:["Model 3","Model Y"], fuels:["Électrique"], pw:null, y0:2020, y1:2021,
      comp:"Logiciel eCall / écran central", risk:"Perte d'affichage ou eCall inopérant", fix:"Mise à jour logicielle OTA", dtcs:["U0155","U0100"], status:"closed", date:"2021-02" },
    { id:"RAP-GM-BOLT-2020", brands:["Chevrolet"], models:["Bolt"], fuels:["Électrique"], pw:null, y0:2017, y1:2022,
      comp:"Batterie haute tension (cellules LG)", risk:"Risque d'incendie en charge", fix:"Remplacement des modules batterie / logiciel de charge 90 %", dtcs:["P0AA6","P0A80"], status:"open", date:"2020-11" },
    { id:"RAP-VOLVO-ECU-2019", brands:["Volvo"], models:[], fuels:["Diesel"], pw:null, y0:2017, y1:2019,
      comp:"Logiciel calculateur moteur", risk:"Calage moteur à l'arrêt ou en roulage", fix:"Reprogrammation du calculateur (ECU)", dtcs:["P0601","P0300"], status:"closed", date:"2019-05" },
    { id:"RAP-JEEP-SOFT-2020", brands:["Jeep","Fiat","Alfa Romeo"], models:[], fuels:[], pw:null, y0:2017, y1:2020,
      comp:"Logiciel module de freinage / ESC", risk:"Perte temporaire d'assistance au freinage", fix:"Mise à jour logicielle du module ESC", dtcs:["C0110","U0121"], status:"closed", date:"2020-07" },
    { id:"RAP-VW-ID-SW-2021", brands:["Volkswagen"], models:["ID.3","ID.4"], fuels:["Électrique"], pw:null, y0:2020, y1:2021,
      comp:"Logiciel gestion batterie / charge", risk:"Coupures de charge et erreurs BMS", fix:"Mise à jour logicielle en concession / OTA", dtcs:["P0A80","P0C29"], status:"closed", date:"2021-06" }
  ];

  const COMP = {
    "Essence":["pompe à carburant","chaîne de distribution","injecteurs","boîtier papillon","sonde lambda amont","faisceau d'injection"],
    "Diesel":["vanne EGR","filtre à particules","pompe haute pression","injecteurs","système SCR / AdBlue","durites de carburant"],
    "Hybride":["batterie haute tension","onduleur / convertisseur","câblage haute tension","logiciel de gestion hybride"],
    "Électrique":["batterie haute tension","connecteur de charge","logiciel BMS","câblage haute tension"],
    "GPL":["détendeur GPL","injecteurs GPL","électrovanne de réservoir GPL"]
  };
  const RISKS = ["risque de calage moteur en roulant","risque d'incendie","risque de perte de puissance","non-conformité émissions","perte d'assistance frein/direction","risque de blessure (composant sous pression)","perte soudaine de propulsion"];
  const FIXES = ["Remplacement du composant en concession (prise en charge constructeur)","Mise à jour du calculateur (reprogrammation)","Contrôle du lot + remplacement si nécessaire","Inspection et remplacement des connecteurs/faisceaux"];
  const FUELCODES = {
    "Essence":["P0300","P0171","P0420","P0128","P0442","P0101"],
    "Diesel":["P0299","P2002","P0401","P0087","P2047","P0671"],
    "Hybride":["P0A80","P0AA6","P0C71","P0562","P0300"],
    "Électrique":["P0AA6","P0A80","P0A1F","P0562","P0C29"],
    "GPL":["P0171","P0174","P0300","P0420"]
  };

  function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function seedOf(s){ let h=1779033703; for(let i=0;i<s.length;i++){ h=Math.imul(h^s.charCodeAt(i),3432918353); h=h<<13|h>>>19; } return h>>>0; }
  const pick = (r,a) => a[Math.floor(r()*a.length)];
  const pickN = (r,a,n) => { const c=[...a], o=[]; while(o.length<n && c.length) o.push(c.splice(Math.floor(r()*c.length),1)[0]); return o; };

  let GEN_CACHE = null;
  function generated(){
    if (GEN_CACHE) return GEN_CACHE;
    const out = [];
    BRANDS.forEach((b, bi) => {
      const count = 2 + (bi % 3);
      for (let t = 0; t < count; t++){
        const r = mulberry32(seedOf("recall|" + b[0] + "|" + t));
        const fuels = pickN(r, Object.keys(COMP), 1 + Math.floor(r()*2));
        const y0 = 2017 + Math.floor(r()*8);
        const y1 = Math.min(2026, y0 + 2 + Math.floor(r()*4));
        const models = r() < 0.6 ? pickN(r, b[1].map(m=>m.split("|")[0]), 1 + Math.floor(r()*4)) : [];
        let pw = null;
        if (r() < 0.35){ const p0 = 70 + Math.floor(r()*180); pw = [p0, p0 + 50 + Math.floor(r()*80)]; }
        const fuel0 = fuels[0];
        const tag = (b[0].slice(0,3).toUpperCase().replace(/[^A-Z0-9]/g,"")) || "MAR";
        out.push({
          id: "RAP-" + tag + "-" + y0 + "-" + (t+1),
          brands: [b[0]], models, fuels, pw, y0, y1,
          comp: pick(r, COMP[fuel0]),
          risk: pick(r, RISKS),
          fix: pick(r, FIXES),
          dtcs: pickN(r, FUELCODES[fuel0] || ["P0300"], 2 + Math.floor(r()*2)),
          status: r() < 0.5 ? "open" : "closed",
          date: y0 + "-" + String(1 + Math.floor(r()*12)).padStart(2,"0")
        });
      }
    });
    GEN_CACHE = out;
    return out;
  }

  const K_CUSTOM = "dtc_recalls_custom_v1";
  function customs(){ return Store.read(K_CUSTOM, []); }
  function saveCustoms(list){ Store.write(K_CUSTOM, list); }
  function all(){ return customs().concat(CURATED, generated()); }
  function byId(id){ return all().find(r => r.id === id) || null; }

  function matches(r, brand, modelName, mYear, fuel, pw){
    if (!r.brands.includes(brand)) return false;
    if (r.models && r.models.length && !r.models.includes(modelName)) return false;
    if (r.fuels && r.fuels.length && !r.fuels.includes(fuel)) return false;
    if (r.pw && r.pw[0] && (!pw || pw < r.pw[0] || pw > r.pw[1])) return false;
    return !(mYear > r.y1 || 2026 < r.y0);
  }
  function forVehicle(brand, model, engine){
    const p = model.split("|");
    const name = p[0], y = +(p[1] || 2017);
    return all().filter(r => matches(r, brand, name, y, DT.fuelOf(engine), powerOf(engine)));
  }
  function search(q){
    q = q.toLowerCase();
    return all().filter(r => (r.id + " " + r.brands.join(" ") + " " + r.comp + " " + r.risk + " " + (r.models||[]).join(" ")).toLowerCase().includes(q)).slice(0, 60);
  }

  return { powerOf, all, byId, forVehicle, search, customs, saveCustoms };
})();
