"use strict";
/* ===== VÉHICULES : marques, modèles (année de lancement), motorisations 2017-2026 ===== */
const BRANDS = [
["Renault",["Clio IV|2017","Clio V|2019","Captur I|2017","Captur II|2020","Mégane IV|2017","Scénic IV|2017","Talisman|2017","Espace V|2017","Kadjar|2017","Arkana|2021","Austral|2022","Symbioz|2024","Zoé|2017","Twingo III|2017","Kangoo III|2021","Trafic|2017","Master|2017","Koleos|2017"],["0.9 TCe 90","1.0 SCe 65","1.0 TCe 90","1.0 TCe 100","1.2 TCe 130","1.3 TCe 140","1.3 TCe 160","1.5 dCi 90","1.5 Blue dCi 95","1.5 Blue dCi 115","1.6 dCi 130","1.6 dCi 160","2.0 Blue dCi 180","2.0 Blue dCi 200","E-TECH 145","E-TECH 200","Électrique 135","Électrique 218"]],
["Peugeot",["108|2017","208 I|2017","208 II|2019","e-208|2019","308 II|2017","308 III|2021","3008 II|2017","3008 III|2024","5008 I|2017","5008 II|2024","508 I|2017","508 II|2018","2008 I|2017","2008 II|2020","Rifter|2018","Partner|2018","Expert|2017","Boxer|2017"],["1.2 PureTech 75","1.2 PureTech 100","1.2 PureTech 130","1.5 BlueHDi 100","1.5 BlueHDi 130","1.6 BlueHDi 120","2.0 BlueHDi 150","2.0 BlueHDi 180","1.6 THP 180","HYBRID 225","HYBRID4 300","HYBRID4 360","Électrique 136","Électrique 156"]],
["Citroën",["C1|2017","C3 II|2017","C3 III|2024","C3 Aircross|2017","C4 Cactus|2017","C4 III|2020","ë-C4|2020","C5 Aircross|2019","C5 X|2022","Ami|2020","Berlingo|2018","Jumpy|2017","Jumper|2017"],["1.2 PureTech 82","1.2 PureTech 110","1.2 PureTech 130","1.5 BlueHDi 100","1.5 BlueHDi 130","1.6 BlueHDi 120","HYBRID 225","Électrique 136","Électrique 156"]],
["DS",["DS 3 Crossback|2019","DS 4 II|2021","DS 7 Crossback|2017","DS 9|2021"],["1.2 PureTech 130","1.2 PureTech 155","1.5 BlueHDi 130","E-TENSE 225","E-TENSE 300","E-TENSE 360"]],
["Dacia",["Sandero II|2017","Sandero III|2020","Logan II|2017","Logan III|2020","Duster II|2018","Duster III|2024","Jogger|2021","Spring|2021","Lodgy|2017","Dokker|2017"],["1.0 SCe 65","1.0 SCe 75","1.0 TCe 90","1.0 TCe 100","1.0 ECO-G 100","1.3 TCe 150","1.5 dCi 90","1.5 Blue dCi 95","1.5 Blue dCi 115","HYBRID 140","Électrique 65","Électrique 109"]],
["Alpine",["A110|2017"],["1.8 TCe 252","1.8 TCe 300","1.8 TCe 340"]],
["Volkswagen",["Polo VI|2017","Golf VII|2017","Golf VIII|2020","Passat VIII|2017","Tiguan II|2017","T-Roc|2017","T-Cross|2019","Taigo|2021","Touareg III|2018","Arteon|2017","up!|2017","ID.3|2020","ID.4|2021","ID.5|2022","ID.7|2023","ID.Buzz|2022","Caddy V|2020","Transporter T6.1|2019","Amarok|2017"],["1.0 TSI 95","1.0 TSI 110","1.5 TSI 130","1.5 TSI 150","2.0 TSI 190","2.0 TSI 245","2.0 TSI 300","1.6 TDI 95","1.6 TDI 115","2.0 TDI 115","2.0 TDI 150","2.0 TDI 200","eHybrid 204","eHybrid 245","Électrique 150","Électrique 204","Électrique 299"]],
["Audi",["A1 II|2018","A3 III|2017","A3 IV|2020","A4 B9|2017","A5 II|2017","A6 C8|2018","A7 II|2018","A8 D5|2017","Q2|2017","Q3 II|2018","Q4 e-tron|2021","Q5 II|2017","Q7 II|2017","Q8|2018","e-tron GT|2021","TT III|2017"],["1.0 TFSI 110","1.5 TFSI 150","2.0 TFSI 190","2.0 TFSI 245","2.0 TFSI 265","3.0 TFSI 340","2.0 TDI 136","2.0 TDI 163","2.0 TDI 204","3.0 TDI 286","3.0 TDI 340"]],
["Seat",["Ibiza V|2017","Leon III|2017","Leon IV|2020","Arona|2017","Ateca|2017","Tarraco|2018","Mii electric|2019"],["1.0 TSI 95","1.0 TSI 110","1.5 TSI 130","1.5 TSI 150","2.0 TSI 190","2.0 TSI 245","1.6 TDI 115","2.0 TDI 150","eHybrid 204","Électrique 83"]],
["Cupra",["Formentor|2020","Born|2021","Ateca|2018","Tavascan|2024"],["1.5 eTSI 150","2.0 TSI 245","2.0 TSI 310","2.0 TSI 333","Électrique 204","Électrique 231","Électrique 340"]],
["Skoda",["Fabia IV|2021","Scala|2019","Octavia IV|2020","Kamiq|2019","Karoq|2017","Kodiaq I|2017","Kodiaq II|2024","Superb III|2017","Superb IV|2024","Enyaq|2021"],["1.0 TSI 95","1.0 TSI 110","1.5 TSI 130","1.5 TSI 150","2.0 TSI 190","2.0 TSI 245","1.6 TDI 115","2.0 TDI 150","2.0 TDI 200","Électrique 179","Électrique 204","Électrique 299"]],
["BMW",["Série 1 F40|2019","Série 2 F44|2021","Série 3 G20|2019","Série 4 G22|2020","Série 5 G30|2017","Série 5 G60|2023","Série 7 G11|2017","Série 7 G70|2022","X1 U11|2022","X2 U10|2023","X3 G01|2017","X4 G02|2018","X5 G05|2018","X6 G06|2019","X7 G07|2019","iX|2021","i4|2021","i3|2017","Z4 G29|2018","M2 G87|2022","M3 G80|2020","M4 G22|2020"],["116i","118i","120i","128ti","220i","320i","330i","M340i","530i","740i","116d","118d","120d","318d","320d","330d","M340d","520d","530d","xDrive40e","Électrique 340","Électrique 544"]],
["Mini",["Cooper|2017","Countryman|2017","Clubman|2017","Cabrio|2017","Electric|2020"],["One 75","Cooper 136","Cooper S 192","John Cooper Works 231","Cooper D 116","Electric 184"]],
["Mercedes",["Classe A W177|2018","Classe B W247|2018","Classe C W205|2017","Classe C W206|2021","Classe E W213|2017","Classe S W222|2017","Classe S W223|2020","CLA C118|2019","CLS C257|2018","GLA H247|2020","GLB X247|2019","GLC X253|2017","GLC X254|2022","GLE V167|2019","GLS X167|2019","EQA|2021","EQB|2021","EQC|2019","EQE|2022","EQS|2021","Classe G|2018","Sprinter|2018","Vito|2017"],["A 160","A 180","A 200","A 250","C 200","C 300","E 200","E 300","E 450","S 450","S 500","A 180 d","C 220 d","C 300 d","E 220 d","E 400 d","GLC 300 e","350 e","EQE 350","EQS 450+","AMG 43","AMG 53","AMG 63"]],
["Smart",["fortwo|2017","forfour|2017","#1|2022","#3|2023"],["Électrique 60","Électrique 82","Électrique 272"]],
["Opel",["Corsa F|2019","Astra L|2021","Mokka|2021","Grandland|2017","Crossland|2017","Insignia B|2017","Combo|2018","Vivaro|2019","Movano|2021"],["1.2 Turbo 75","1.2 Turbo 100","1.2 Turbo 130","1.5 Diesel 100","1.5 Diesel 130","1.6 Turbo 180","HYBRID 225","Électrique 136","Électrique 156"]],
["Ford",["Fiesta VII|2017","Focus IV|2018","Puma|2020","Kuga III|2020","EcoSport|2017","Mondeo V|2017","S-Max II|2017","Galaxy II|2017","Explorer|2019","Mustang VI|2017","Mustang Mach-E|2021","Transit Custom|2017","Transit|2017","Ranger|2017","Tourneo Custom|2017"],["1.0 EcoBoost 100","1.0 EcoBoost 125","1.0 EcoBoost 140","1.0 EcoBoost 155","1.5 EcoBoost 150","1.5 EcoBoost 182","2.3 EcoBoost 280","2.3 EcoBoost 350","1.5 EcoBlue 95","1.5 EcoBlue 120","2.0 EcoBlue 150","2.0 EcoBlue 190","PHEV 225","Électrique 269","Électrique 487"]],
["Toyota",["Aygo|2017","Aygo X|2022","Yaris IV|2020","Yaris Cross|2021","Corolla XII|2019","Camry VIII|2018","Prius IV|2017","Prius V|2023","C-HR I|2017","C-HR II|2023","RAV4 V|2019","Highlander|2021","Land Cruiser|2017","Hilux|2017","Proace|2017","bZ4X|2022"],["1.0 VVT-i 72","1.5 VVT-i 125","1.8 Hybrid 122","1.8 Hybrid 140","2.0 Hybrid 184","2.0 Hybrid 196","2.5 Hybrid 218","2.5 Hybrid 222","PHEV 306","2.4 D-4D 150","2.8 D-4D 204","Électrique 204"]],
["Lexus",["UX|2019","NX I|2017","NX II|2021","RX IV|2017","RX V|2022","ES VII|2018","LS V|2017","LC|2017","LBX|2023","RZ|2023"],["250h 218","300h 196","350h 243","450h+ 309","500h 371","Électrique 313"]],
["Honda",["Jazz|2017","Civic X|2017","Civic XI|2022","HR-V III|2021","ZR-V|2023","CR-V V|2017","CR-V VI|2023","e|2020"],["1.0 VTEC Turbo 126","1.5 VTEC Turbo 182","2.0 i-MMD 184","2.0 i-MMD 204","1.6 i-DTEC 120","Électrique 154"]],
["Nissan",["Micra V|2017","Juke II|2019","Qashqai III|2021","X-Trail IV|2022","Ariya|2022","Leaf II|2018","Navara|2017","GT-R|2017"],["1.0 DIG-T 92","1.0 DIG-T 100","1.0 DIG-T 114","1.3 DIG-T 140","1.3 DIG-T 158","1.5 dCi 110","1.5 Blue dCi 115","1.7 dCi 150","e-POWER 190","e-POWER 204","e-POWER 213","Électrique 150","Électrique 214","Électrique 218","Électrique 242"]],
["Mazda",["Mazda2|2017","Mazda3 IV|2019","Mazda6 III|2017","CX-3|2017","CX-30|2019","CX-5 II|2017","CX-60|2022","MX-5 ND|2017","MX-30|2020"],["1.5 Skyactiv-G 90","2.0 Skyactiv-G 122","2.0 Skyactiv-G 150","2.0 e-Skyactiv G 150","2.5 Skyactiv-G 192","1.8 Skyactiv-D 115","2.2 Skyactiv-D 150","2.2 Skyactiv-D 184","PHEV 327","Électrique 145"]],
["Subaru",["Impreza|2017","XV|2017","Forester V|2018","Outback VI|2021","BRZ|2021","Solterra|2022"],["2.0 Boxer 150","2.5 Boxer 169","2.4 Turbo Boxer 260","e-Boxer 150","e-Boxer 167","Électrique 218"]],
["Suzuki",["Swift V|2017","Swift VI|2024","Ignis|2017","Baleno|2017","Jimny IV|2018","Vitara|2017","S-Cross|2021","Across|2020","Swace|2020"],["1.0 Boosterjet 111","1.2 Dualjet 90","1.2 Dualjet Hybrid 90","1.4 Boosterjet 129","1.4 Boosterjet Hybrid 129","1.5 Hybrid 115","PHEV 185"]],
["Mitsubishi",["Space Star|2017","ASX|2017","Eclipse Cross|2018","Outlander III|2017","Outlander IV|2021","L200|2017"],["1.0 MIVEC 71","1.2 MIVEC 80","1.5 Turbo 163","2.2 DI-D 150","2.4 DI-D 150","2.4 DI-D 181","PHEV 200","PHEV 306"]],
["Hyundai",["i10|2020","i20|2020","i30 III|2017","Bayon|2021","Kona I|2017","Kona II|2023","Tucson IV|2021","Santa Fe|2018","Ioniq|2017","Ioniq 5|2021","Ioniq 6|2022","Nexo|2018","Staria|2021"],["1.0 T-GDi 100","1.0 T-GDi 120","1.5 T-GDi 160","1.6 T-GDi 180","1.6 T-GDi 230","N 2.0 T-GDi 280","1.6 CRDi 136","2.2 CRDi 202","Hybrid 215","Hybrid 230","PHEV 265","Électrique 136","Électrique 218","Électrique 325"]],
["Kia",["Picanto|2017","Rio|2017","Ceed III|2018","Stonic|2017","Niro I|2017","Niro II|2022","Sportage V|2022","Sorento IV|2020","EV6|2021","EV9|2023","Stinger|2017","Proceed|2019"],["1.0 T-GDi 100","1.0 T-GDi 120","1.5 T-GDi 160","1.6 T-GDi 180","GT 1.6 T-GDi 204","1.6 CRDi 136","2.2 CRDi 202","Hybrid 141","Hybrid 215","Hybrid 230","PHEV 265","Électrique 204","Électrique 229","Électrique 325","Électrique 585"]],
["Genesis",["G70|2017","G80|2020","GV60|2021","GV70|2021","GV80|2020"],["2.0 T-GDi 245","2.5 T-GDi 304","3.5 T-GDi 380","2.2 Diesel 210","Électrique 318","Électrique 435","Électrique 490"]],
["Volvo",["XC40 I|2017","XC40 II|2024","XC60 II|2017","XC90 II|2017","S60 III|2019","S90 II|2017","V60 II|2018","V90 II|2017","C40|2021","EX30|2023","EX90|2024"],["T2 129","T3 163","T4 197","T5 250","T6 Recharge 350","T8 Recharge 455","D3 150","D4 197","D5 235","Single 231","Twin 408","Twin 517"]],
["Polestar",["2|2020","3|2024","4|2024"],["Standard 272","Long range 299","Dual motor 408","Performance 476","BST 517"]],
["Jeep",["Renegade|2017","Compass|2017","Cherokee|2017","Wrangler JL|2018","Gladiator|2020","Grand Cherokee|2022","Avenger|2023"],["1.0 Turbo 120","1.3 Turbo 130","1.3 Turbo 180","4xe 190","4xe 240","4xe 380","1.6 Multijet 130","2.0 Multijet 140","2.0 Multijet 170","Électrique 156"]],
["Fiat",["500 (312)|2017","500e|2020","Panda III|2017","Tipo|2017","500X|2017","Doblo|2017","Ducato|2017","124 Spider|2017"],["1.2 69","0.9 TwinAir 85","1.0 Hybrid 70","1.4 T-Jet 140","1.3 Multijet 95","1.6 Multijet 120","1.6 Multijet 130","Électrique 118"]],
["Abarth",["595|2017","695|2017","500e|2022"],["1.4 T-Jet 145","1.4 T-Jet 165","1.4 T-Jet 180","Électrique 155"]],
["Alfa Romeo",["Giulia|2017","Stelvio|2017","Tonale|2022","Junior|2024"],["1.4 TB 150","2.0 Turbo 200","2.0 Turbo 280","2.2 JTd 190","2.2 JTd 210","2.9 V6 Biturbo 510","2.9 V6 Biturbo 540","Hybrid 130","Hybrid 160","PHEV Q4 280","Électrique 156","Électrique 240","Électrique 280"]],
["Lancia",["Ypsilon|2017"],["1.2 69","1.0 Hybrid 70","Électrique 156"]],
["Maserati",["Ghibli|2017","Quattroporte|2017","Levante|2017","MC20|2020","Grecale|2022","GranTurismo|2023"],["3.0 V6 350","3.0 V6 430","3.8 V8 530","3.8 V8 580","3.0 Diesel 275","Nettuno 630","Hybrid 300","Hybrid 330","Folgore 610","Folgore 830"]],
["Ferrari",["488 GTB|2017","F8 Tributo|2019","Roma|2020","Portofino|2018","SF90 Stradale|2019","296 GTB|2022","Purosangue|2022","812 Superfast|2017"],["3.9 V8 620","3.9 V8 720","3.9 V8 780","6.5 V12 800","6.5 V12 830","Hybride 663","Hybride 1000","Hybride 1030"]],
["Lamborghini",["Huracán|2017","Urus|2018","Revuelto|2023"],["5.2 V10 640","4.0 V8 650","Hybride V12 1015"]],
["Porsche",["911 (991.2)|2017","911 (992)|2019","718 Cayman|2017","718 Boxster|2017","Panamera II|2017","Taycan|2019","Macan I|2017","Macan II|2024","Cayenne III|2018"],["2.0 300","2.5 S 350","3.0 S 450","4.0 GTS 480","4.0 Turbo 650","3.0 Diesel 262","E-Hybrid 462","E-Hybrid 680","Électrique 408","Électrique 530","Électrique 625","Électrique 761"]],
["Aston Martin",["DB11|2017","Vantage|2018","DBS|2018","DBX|2020","DB12|2023"],["4.0 V8 Biturbo 510","4.0 V8 Biturbo 535","5.2 V12 630","5.2 V12 715"]],
["Bentley",["Continental GT|2018","Flying Spur|2019","Bentayga|2017"],["4.0 V8 550","6.0 W12 635","Hybrid 462"]],
["Rolls-Royce",["Ghost|2020","Phantom VIII|2017","Cullinan|2018","Spectre|2023"],["6.75 V12 571","6.75 V12 600","Électrique 585"]],
["McLaren",["570S|2017","720S|2017","GT|2019","Artura|2021","750S|2023"],["3.8 V8 570","4.0 V8 720","4.0 V8 750","Hybride V6 680"]],
["Bugatti",["Chiron|2017"],["8.0 W16 Quadri-turbo 1500","8.0 W16 1600"]],
["Tesla",["Model 3|2017","Model Y|2021","Model S|2017","Model X|2017","Cybertruck|2024"],["Électrique 283","Électrique 351","Électrique 460","Électrique 534","Électrique 639","Électrique 1020"]],
["MG",["MG3|2024","MG4|2022","ZS|2017","HS|2019","Marvel R|2021","Cyberster|2024"],["1.5 VTi 106","1.5 T-GDi 162","Hybrid+ 194","Électrique 156","Électrique 170","Électrique 204","Électrique 245","Électrique 510"]],
["BYD",["Atto 3|2022","Dolphin|2023","Seal|2023","Seal U|2024","Han|2022","Tang|2022"],["Électrique 150","Électrique 204","Électrique 218","Électrique 313","Électrique 530"]],
["Lynk & Co",["01|2021","02|2024"],["PHEV 261","Hybride 245"]],
["Land Rover",["Defender|2020","Discovery V|2017","Discovery Sport|2017","Range Rover|2022","Range Rover Sport|2022","Range Rover Velar|2017","Range Rover Evoque II|2019"],["2.0 P200 200","2.0 P250 249","2.0 P300 300","3.0 P360 360","3.0 P400 400","2.0 D165 163","2.0 D200 200","2.0 D240 240","3.0 D300 300","3.0 D350 350","P400e 404","P440e 440","P550e 550","5.0 V8 525","5.0 V8 575"]],
["Jaguar",["F-Pace|2017","E-Pace|2017","I-Pace|2018","F-Type|2017","XF|2017","XE|2017"],["2.0 200","2.0 250","2.0 300","3.0 400","5.0 V8 450","5.0 V8 575","2.0 D 163","2.0 D 204","3.0 D 300","Électrique 400"]]
];

/* ===== MOTEUR DE FICHES DTC (21 000) ===== */
const DT = (() => {
  function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function seedOf(s){ let h=1779033703; for(let i=0;i<s.length;i++){ h=Math.imul(h^s.charCodeAt(i),3432918353); h=h<<13|h>>>19; } return h>>>0; }
  const R = s => mulberry32(seedOf(s));
  const pick = (r,a) => a[Math.floor(r()*a.length)];
  const pickN = (r,a,n) => { const c=[...a], o=[]; while(o.length<n && c.length) o.push(c.splice(Math.floor(r()*c.length),1)[0]); return o; };
  const pad3 = n => String(n).padStart(3,"0");
  const LETTERS = ["P","B","C","U"];

  const FAM_P = {
    "0":["Contrôle des émissions auxiliaires",["vanne EGR","actuateur de turbo (wastegate)","capteur NOx","capteur température gaz d'échappement","filtre à particules","volet d'admission"]],
    "1":["Mélange air/carburant",["débitmètre (MAF)","capteur pression collecteur (MAP)","sonde à oxygène amont","sonde à oxygène aval","capteur température d'air","capteur position papillon","capteur pression rampe"]],
    "2":["Circuit des injecteurs",["injecteur cylindre 1","injecteur cylindre 2","injecteur cylindre 3","injecteur cylindre 4","commande d'injecteur","pompe haute pression"]],
    "3":["Allumage / ratés",["bobine d'allumage","bougie","capteur vilebrequin","capteur arbre à cames","capteur de cliquetis","circuit d'allumage"]],
    "4":["Système antipollution",["catalyseur","canister EVAP","pompe à air secondaire","capteur température catalyseur","vanne de purge","ligne d'échappement"]],
    "5":["Ralenti / vitesse",["capteur de vitesse véhicule","régulateur de ralenti","boîtier papillon","interrupteur de stop","capteur position pédale"]],
    "6":["Calculateur / sorties",["calculateur moteur (ECU)","alimentation ECU","relais principal","bus de communication interne","module de préchauffage"]],
    "7":["Transmission",["capteur vitesse d'entrée","capteur vitesse de sortie","électrovanne de rapport","convertisseur de couple","capteur température huile BVA"]],
    "8":["Transmission (commande)",["électrovanne de pression","capteur position levier","actionneur d'embrayage","calculateur boîte (TCU)"]],
    "9":["Transmission (divers)",["capteur de régime interne","actionneur de fourchette","module de transfert de couple"]]
  };
  const FAM_B = ["Électronique de carrosserie",["module airbag","prétensionneur","capteur de choc","BCM (boîtier servitude)","commande d'éclairage","lève-vitre","verrouillage centralisé","capteur d'occupation siège"]];
  const FAM_C = ["Châssis / freinage",["capteur vitesse roue ABS","bloc hydraulique ABS/ESP","capteur angle volant","capteur lacet","suspension pilotée","frein de stationnement électrique"]];
  const FAM_U = ["Réseau multiplexé",["bus CAN motopropulseur","bus CAN carrosserie","passerelle (gateway)","module ABS","combiné","calculateur de transmission","module télématique"]];
  const FAULTS = ["signal trop élevé","signal trop faible","circuit intermittent","plage/performance incorrect","circuit ouvert","court-circuit à la masse","court-circuit au +12V","absence de réponse","calibration requise","corrélation incorrecte entre capteurs"];
  const SYMPTOMS = ["Voyant moteur allumé","Perte de puissance","Ralenti irrégulier","Surconsommation","Démarrage difficile","À-coups à l'accélération","Fumée anormale","Mode dégradé","Passage en sécurité de la boîte","Témoin antipollution","Odeur d'échappement","Vibrations moteur","Extinction du moteur en roulant"];
  const CAUSES = ["Capteur défectueux","Faisceau endommagé ou oxydé","Connecteur mal enfiché","Masse défectueuse","Encrassement du composant","Fuite d'air / de dépression","Calibration perdue après intervention","Logiciel calculateur obsolète","Composant mécanique usé","Infiltration d'eau dans le connecteur"];
  const SOLUTIONS = ["Lire les codes et données en temps réel à la valise","Contrôler le faisceau et les connecteurs","Mesurer la tension/résistance du capteur","Nettoyer ou remplacer le composant","Vérifier l'étanchéité du circuit concerné","Mettre à jour le logiciel du calculateur","Effacer les codes et faire un essai routier","Contrôler les masses et l'alimentation 12V","Vérifier les bulletins de service constructeur"];
  const SEV = ["Mineure","Modérée","Sérieuse","Critique"];

  function fuelOf(e){
    const s = e.toLowerCase();
    if (/électrique|electric/.test(s)) return "Électrique";
    if (/hybrid|hybride|e-tech|e-tense|e-power|phev|4xe|recharge|i-mmd|e-boxer|e-hybrid/.test(s)) return "Hybride";
    if (/eco-g|gpl|lpg/.test(s)) return "GPL";
    if (/dci|tdi|hdi|crdi|diesel|ecoblue|multijet|d-4d|di-d|skyactiv-d|bluehdi|jtdm|cdti|i-dtec|\bd\b|\bd\d{1,3}\b|\d+d\b|\d+ d\b/.test(s)) return "Diesel";
    return "Essence";
  }

  function makeFiche(code, brand){
    const key = brand ? code + "@" + brand : code;
    const r = R(key);
    const L = code[0];
    let famName, comp;
    if (L === "P"){
      if (code[1] === "1" || code[1] === "3"){
        const fam = FAM_P[String(Math.floor(r()*10))] || FAM_P["0"];
        famName = "Système constructeur — " + fam[0];
        comp = pick(r, fam[1]);
      } else {
        const fam = FAM_P[code[2]] || FAM_P["0"];
        famName = fam[0]; comp = pick(r, fam[1]);
      }
    } else if (L === "B"){ famName = FAM_B[0]; comp = pick(r, FAM_B[1]); }
    else if (L === "C"){ famName = FAM_C[0]; comp = pick(r, FAM_C[1]); }
    else { famName = FAM_U[0]; comp = pick(r, FAM_U[1]); }
    const fault = pick(r, FAULTS);
    const sev = 1 + Math.floor(r()*4);
    const generic = !brand && (code[1] === "0" || code[1] === "2");
    let brands;
    if (brand) brands = [brand];
    else if (generic) brands = ["Toutes marques"];
    else brands = pickN(r, BRANDS.map(b=>b[0]), 4 + Math.floor(r()*8));
    const fuels = ["Essence","Diesel","Hybride","Électrique","GPL"];
    return {
      key, code, brand: brand || null,
      title: (brand ? "[" + brand + "] " : "") + famName + " — " + comp + " : " + fault,
      desc: "Défaut détecté par le calculateur sur « " + comp + " » (" + fault + "). Contrôle actif " +
            pick(r,["en permanence","au démarrage","après stabilisation du moteur","sur 2 cycles de conduite"]) +
            ". Le MIL est " + pick(r,["allumé immédiatement","allumé après 2 cycles","demandé selon conditions"]) + ".",
      sev, sevLabel: SEV[sev-1],
      symptoms: pickN(r, SYMPTOMS, 2 + Math.floor(r()*3)),
      causes: pickN(r, CAUSES, 3 + Math.floor(r()*3)),
      solutions: pickN(r, SOLUTIONS, 3 + Math.floor(r()*3)),
      brands, motors: pickN(r, fuels, 2 + Math.floor(r()*3)),
      years: "2017-2026", generic
    };
  }

  function codeFromIndex(i){
    const L = LETTERS[Math.floor(i/4000)], rem = i % 4000;
    return L + Math.floor(rem/1000) + pad3(rem % 1000);
  }
  function ficheAt(i){
    if (i < 16000) return makeFiche(codeFromIndex(i), null);
    const j = i - 16000;
    const brand = BRANDS[j % BRANDS.length][0];
    return makeFiche("P1" + pad3((j*7) % 1000), brand);
  }
  function findByCode(code){
    code = code.trim().toUpperCase();
    if (!/^[PBCU][0-3][0-9A-F]{3}$/.test(code)) return [];
    const res = [];
    const idx = LETTERS.indexOf(code[0]);
    if (idx >= 0){
      const n = parseInt(code.slice(2), 10);
      if (!isNaN(n) && n < 1000) res.push({ key: code, brand: null });
    }
    BRANDS.forEach((b, bIdx) => {
      const n = BRANDS.length, per = Math.ceil(5000/n);
      for (let k = 0; k < per; k++){
        const j = k*n + bIdx;
        if (j >= 5000) break;
        if ("P1" + pad3((j*7) % 1000) === code) res.push({ key: code + "@" + b[0], brand: b[0] });
      }
    });
    return res;
  }

  const COMMON_BY_FUEL = {
    "Essence": ["P0300","P0301","P0302","P0303","P0304","P0171","P0172","P0420","P0430","P0128","P0442","P0455","P0101","P0102","P0115","P0340","P0335","P0505","P0125","P0135"],
    "Diesel":  ["P0299","P2002","P2453","P0401","P0403","P0087","P0191","P0251","P0671","P0672","P0673","P0674","P2047","P20EE","P0234","P0101","P0420"],
    "Hybride": ["P0A80","P0AA6","P0C71","P0A7A","P0C29","P0562","P0561","P0300","P0420","P0128"],
    "Électrique": ["P0AA6","P0A80","P0A1F","P0AF0","P0C71","P0562","P0C29","P0561"],
    "GPL": ["P0171","P0174","P0175","P0300","P0420","P0128","P0442","P0101"]
  };
  function faultsForVehicle(brand, model, engine){
    const fuel = fuelOf(engine);
    const r = R("veh|" + brand + "|" + model + "|" + engine);
    const keys = [];
    (COMMON_BY_FUEL[fuel] || COMMON_BY_FUEL["Essence"]).forEach(c => keys.push({ key: c, code: c, brand: null }));
    const bi = BRANDS.findIndex(b => b[0] === brand);
    if (bi >= 0){
      const n = BRANDS.length, per = Math.ceil(5000/n);
      const kCount = 6 + Math.floor(r()*6), used = new Set();
      for (let t = 0; t < kCount; t++){
        const k = Math.floor(r()*per);
        if (used.has(k)) continue; used.add(k);
        const j = k*n + bi;
        if (j >= 5000) continue;
        const code = "P1" + pad3((j*7) % 1000);
        keys.push({ key: code + "@" + brand, code, brand });
      }
    }
    const gCount = 4 + Math.floor(r()*5);
    for (let t = 0; t < gCount; t++) keys.push({ key: codeFromIndex(Math.floor(r()*16000)), brand: null });
    keys.forEach(k => { if (!k.code) k.code = k.key.split("@")[0]; });
    const seen = new Set(), out = [];
    keys.forEach(k => { if (!seen.has(k.key)){ seen.add(k.key); out.push(k); } });
    out.sort((a,b) => a.code < b.code ? -1 : 1);
    return { fuel, faults: out };
  }

  return { ficheAt, findByCode, makeFiche, faultsForVehicle, fuelOf, codeFromIndex };
})();

/* Résolution d'une fiche : surcharges admin, fiches personnalisées, générées (hex inclus) */
function resolveFiche(key){
  if (Store.isDeleted(key)) return null;
  const ov = Store.getOverride(key);
  if (ov) return ov;
  const cu = Store.customs().find(c => c.key === key);
  if (cu) return cu;
  if (/^[PBCU][0-3][0-9A-F]{3}$/.test(key.slice(0,5)) && !key.includes("@")) return DT.makeFiche(key.slice(0,5), null);
  if (key.includes("@")){
    const p = key.split("@");
    return DT.makeFiche(p[0], p[1]);
  }
  return null;
}
