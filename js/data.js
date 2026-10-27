"use strict";
/* =====================================================================
   BASE VÉHICULES v6 — marques classées par origine, motorisations et
   puissances RÉELLES identifiées par modèle (2017 → 2026).
   Encodage : pool = motorisations de la marque ; modèles = [ "Nom|année", [index pool] ]
   ===================================================================== */
const CATS = { FR:"Françaises", EU:"Européennes", US:"Américaines", AS:"Asiatiques" };

const BRANDS = [
{n:"Renault",o:"FR",pool:["1.0 TCe 90","1.0 TCe 100","1.2 TCe 130","1.3 TCe 140","1.3 TCe 160","1.5 Blue dCi 95","1.5 Blue dCi 115","1.6 E-TECH 145","1.8 E-Tech 160","2.0 Blue dCi 180","Électrique 135","Électrique 150","Électrique 218","1.6 Hybrid 140","Électrique 95","Électrique 120","Électrique 170","E-TECH 200","2.0 dCi 150","2.0 dCi 170","2.3 dCi 150","2.3 dCi 180","1.0 SCe 65","Électrique 82"],models:[
["Clio V|2019",[0,1,5,6,7]],["Clio VI|2025",[0,1,8]],["Captur II|2020",[1,3,4,6,7]],["Mégane IV|2017",[2,3,5,6,7]],["Mégane E-Tech|2022",[11,12]],["R5 E-Tech|2024",[14,15,11]],["R4 E-Tech|2024",[15,11]],["Scénic E-Tech|2024",[16,12]],["Arkana|2021",[3,4,7]],["Austral|2022",[3,7]],["Espace VI|2023",[7,17]],["Symbioz|2024",[1,7]],["Zoé|2017",[10,11]],["Twingo III|2017",[22,23]],["Kangoo III|2021",[1,5,6]],["Trafic|2017",[18,19]],["Master|2017",[20,21]]]},
{n:"Peugeot",o:"FR",pool:["1.2 PureTech 75","1.2 PureTech 100","1.2 PureTech 130","1.2 Hybrid 136","1.5 BlueHDi 100","1.5 BlueHDi 130","2.0 BlueHDi 150","2.0 BlueHDi 180","HYBRID 225","HYBRID4 300","Électrique 136","Électrique 156","Électrique 210","Électrique 230","Électrique 320","2.2 BlueHDi 165"],models:[
["208 II|2019",[0,1,2,4,10]],["308 III|2021",[1,2,3,4,5,8]],["3008 II|2017",[2,4,5,6,7,8,9]],["3008 III|2024",[3,12,13,14]],["5008 II|2017",[2,4,5,6,7,8,9]],["5008 III|2024",[3,5,12,13,14]],["508 II|2018",[2,5,7,8,9]],["2008 II|2020",[0,1,2,4,10,11]],["408|2022",[2,3,5,8]],["Rifter|2018",[1,4,5]],["Expert|2017",[5,6,7]],["Boxer|2017",[15]]]},
{n:"Citroën",o:"FR",pool:["1.2 PureTech 82","1.2 PureTech 110","1.2 PureTech 130","1.2 Hybrid 100","1.2 Hybrid 136","1.5 BlueHDi 100","1.5 BlueHDi 130","HYBRID 225","Électrique 113","Électrique 136","Électrique 156","E-TENSE 360","Électrique 8"],models:[
["C3 III|2024",[3,4,8]],["C3 Aircross II|2024",[3,4,8,9]],["C4 III|2020",[1,2,5,6,9,10]],["C4 X|2022",[1,2,5,6,9]],["C5 Aircross|2019",[1,2,5,6,7]],["C5 X|2022",[2,6,7,11]],["Berlingo|2018",[1,5,6,9]],["Jumpy|2017",[5,6]],["Ami|2020",[12]]]},
{n:"DS",o:"FR",pool:["1.2 PureTech 130","1.5 BlueHDi 130","E-TENSE 225","E-TENSE 300","E-TENSE 360","Électrique 156"],models:[
["DS 3|2019",[0,1,5]],["DS 4 II|2021",[0,1,2,3]],["DS 7|2017",[0,1,2,3,4]],["DS 9|2021",[2,3,4]]]},
{n:"Dacia",o:"FR",pool:["1.0 SCe 65","1.0 TCe 90","1.0 TCe 100","1.0 ECO-G 100","1.2 TCe 130","1.2 TCe 140","1.3 TCe 150","1.5 Blue dCi 95","1.5 Blue dCi 115","Hybrid 140","Hybrid 155","Électrique 65","Électrique 70","Électrique 109"],models:[
["Sandero III|2020",[0,1,3]],["Logan III|2020",[1,3]],["Duster III|2024",[3,4,9]],["Bigster|2025",[4,5,10]],["Jogger|2021",[1,3,6,9]],["Spring II|2024",[11,12]],["Spring|2021",[13,11]]]},
{n:"Alpine",o:"FR",pool:["1.8 TCe 252","1.8 TCe 300","1.8 TCe 340","Électrique 180","Électrique 220","Électrique 400","Électrique 470"],models:[
["A110|2017",[0,1,2]],["A290|2024",[3,4]],["A390|2025",[5,6]]]},
{n:"Bugatti",o:"FR",pool:["8.0 W16 1500","8.0 W16 1600"],models:[["Chiron|2017",[0,1]]]},
{n:"Volkswagen",o:"EU",pool:["1.0 TSI 95","1.0 TSI 110","1.5 TSI 130","1.5 TSI 150","2.0 TSI 204","2.0 TSI 265","2.0 TSI 300","1.6 TDI 95","2.0 TDI 115","2.0 TDI 150","2.0 TDI 193","2.0 TDI 200","eHybrid 204","eHybrid 272","Électrique 170","Électrique 204","Électrique 286","Électrique 340","3.0 TSI 340","3.0 TDI 286","1.0 60","1.0 75"],models:[
["Polo VI|2017",[0,1,2,8]],["Golf VII|2017",[0,2,8,9]],["Golf VIII|2020",[1,2,3,4,9,12]],["Passat IX|2024",[2,4,5,9,10,12,13]],["Tiguan II|2017",[2,3,8,9,11]],["Tiguan III|2024",[2,3,4,5,9,10,12,13]],["T-Roc|2017",[0,1,2,3,8,9]],["T-Cross|2019",[0,1,2,8]],["Taigo|2021",[0,1,2,8]],["Touareg III|2018",[18,19,12]],["Arteon|2017",[2,4,9,10]],["ID.3|2020",[14,15,16]],["ID.4|2021",[15,16,17]],["ID.5|2022",[16,17]],["ID.7|2023",[16,17]],["ID.Buzz|2022",[15,16,17]],["up!|2017",[20,21]]]},
{n:"Audi",o:"EU",pool:["1.5 TFSI 150","2.0 TFSI 204","2.0 TFSI 265","3.0 TFSI 340","2.0 TDI 163","2.0 TDI 204","3.0 TDI 286","3.0 TDI 340","Électrique 286","Électrique 388","Électrique 490","Électrique 646"],models:[
["A3 IV|2020",[0,1,4,5]],["A4 B9|2017",[0,1,2,4,5,6]],["A5 III|2024",[0,1,2,4,5]],["A6 C8|2018",[1,2,3,5,6,7]],["Q3 II|2018",[0,1,4,5]],["Q4 e-tron|2021",[8,9]],["Q5 II|2017",[1,2,4,5,6]],["Q6 e-tron|2024",[8,9,10]],["Q7 II|2017",[3,6,7]],["e-tron GT|2021",[10,11]],["TT III|2017",[1,2]]]},
{n:"Seat",o:"EU",pool:["1.0 TSI 95","1.0 TSI 110","1.5 TSI 130","1.5 TSI 150","2.0 TSI 190","2.0 TSI 245","1.6 TDI 115","2.0 TDI 150","eHybrid 204","Électrique 83"],models:[
["Ibiza V|2017",[0,1,2,6]],["Leon IV|2020",[1,2,3,6,7,8]],["Arona|2017",[0,1,2,6]],["Ateca|2017",[2,3,6,7]],["Tarraco|2018",[2,3,7,8]]]},
{n:"Cupra",o:"EU",pool:["1.5 eTSI 150","2.0 TSI 245","2.0 TSI 310","2.0 TSI 333","e-Hybrid 204","e-Hybrid 272","Électrique 204","Électrique 231","Électrique 286","Électrique 340"],models:[
["Formentor|2020",[0,1,2,3,4,5]],["Born|2021",[6,7,8]],["Tavascan|2024",[8,9]],["Terramar|2024",[0,1,4,5]],["Ateca|2018",[1,2]]]},
{n:"Skoda",o:"EU",pool:["1.0 TSI 95","1.0 TSI 110","1.5 TSI 130","1.5 TSI 150","2.0 TSI 190","2.0 TSI 245","2.0 TDI 115","2.0 TDI 150","2.0 TDI 200","Électrique 170","Électrique 204","Électrique 286","e-Hybrid 204"],models:[
["Fabia IV|2021",[0,1,2]],["Scala|2019",[0,1,2]],["Octavia IV|2020",[1,2,3,6,7,8]],["Kamiq|2019",[0,1,2,6]],["Karoq|2017",[1,2,6,7]],["Kodiaq II|2024",[2,3,7,8,12]],["Superb IV|2024",[2,3,7,8,12]],["Enyaq|2021",[9,10,11]],["Elroq|2024",[9,10,11]]]},
{n:"BMW",o:"EU",pool:["116i 122","118i 156","120i 170","128ti 265","116d 116","118d 150","120d 190","M340i 374","Électrique 340","Électrique 544","20i 190","20d 197","30e 299","M50 398","520i 208","530e 299","i5 eDrive40 340","i5 M60 601","520d 197","iX1 313","30d 286","M60i 530","iX M60 619"],models:[
["Série 1 F40|2019",[0,1,2,3,4,5,6]],["Série 3 G20|2019",[2,6,7,11,12]],["Série 5 G60|2023",[14,15,16,17,18]],["X1 U11|2022",[1,2,5,6,19]],["X3 G45|2024",[10,11,12,13]],["X5 G05|2018",[7,20,21]],["i4|2021",[8,9]],["iX|2021",[9,22]],["Z4 G29|2018",[2,7]]]},
{n:"Mini",o:"EU",pool:["Cooper 136","Cooper S 192","JCW 231","Cooper D 116","Electric 184","Electric 218","SE 313"],models:[
["Cooper III|2017",[0,1,2,3]],["Cooper IV|2024",[0,1,4,5]],["Countryman|2017",[0,1,2,3]],["Countryman II|2024",[1,2,5,6]],["Clubman|2017",[0,1,2,3]]]},
{n:"Mercedes",o:"EU",pool:["A 180 136","A 200 163","A 250 224","A 180 d 116","A 220 d 190","C 200 204","C 300 258","C 220 d 197","C 300 e 313","E 200 204","E 300 e 313","E 220 d 197","E 450 381","EQE 350 292","EQS 450+ 360","AMG 43 421","AMG 53 435","GLC 300 e 313","EQE SUV 350 292","G 400 d 330","G 500 421","G 63 585"],models:[
["Classe A W177|2018",[0,1,2,3,4]],["Classe C W206|2021",[5,6,7,8]],["Classe E W214|2023",[9,10,11,12]],["CLA C118|2019",[0,1,3,4]],["GLC X254|2022",[5,7,17]],["GLE V167|2019",[7,12,16]],["EQE|2022",[13]],["EQS|2021",[14]],["EQE SUV|2023",[18]],["Classe G|2018",[19,20,21]]]},
{n:"Smart",o:"EU",pool:["Électrique 82","Électrique 272","Électrique 428","Électrique 646"],models:[
["#1|2022",[1,2]],["#3|2023",[1,2]],["#5|2024",[2,3]],["fortwo|2017",[0]]]},
{n:"Opel",o:"EU",pool:["1.2 Turbo 100","1.2 Turbo 130","1.2 Hybrid 136","1.2 Hybrid 145","1.5 Diesel 130","Électrique 136","Électrique 156","Électrique 210","Électrique 113"],models:[
["Corsa F|2019",[0,1,4,5]],["Astra L|2021",[1,2,4,5,6]],["Mokka II|2021",[0,1,5,6]],["Grandland II|2024",[2,3,4,7]],["Frontera|2024",[0,2,8]],["Crossland|2017",[0,1,4]]]},
{n:"Volvo",o:"EU",pool:["T2 129","T3 163","T4 197","T5 250","T6 Recharge 350","T8 Recharge 455","D3 150","D4 197","Single 231","Twin 408","Twin 517","Single 272","Twin 428"],models:[
["XC40|2017",[1,2,3,6,7,4]],["XC60 II|2017",[2,3,4,5,7]],["XC90 II|2017",[3,5,7]],["S60 III|2019",[1,2,3,4,6]],["V60 II|2018",[2,3,4,5,7]],["C40|2021",[8,9]],["EX30|2023",[11,12]],["EX90|2024",[10]]]},
{n:"Polestar",o:"EU",pool:["Single 272","Dual 408","Dual 517","Dual 544","Dual 476"],models:[["2|2020",[0,1,2]],["3|2024",[2,4]],["4|2024",[0,3]]]},
{n:"Fiat",o:"EU",pool:["1.2 69","1.0 Hybrid 70","1.2 Turbo 100","1.2 Hybrid 100","1.5 Hybrid 136","1.3 Multijet 95","1.4 T-Jet 140","Électrique 113","Électrique 118","Électrique 156","1.6 Multijet 130","2.2 Multijet 140","2.2 Multijet 180"],models:[
["500 (312)|2017",[0,1]],["500e|2020",[8]],["Panda III|2017",[0,1]],["Tipo|2017",[0,5,10]],["Grande Panda|2024",[2,3,7]],["600|2023",[3,4,9]],["500X|2017",[0,5,10]],["Ducato|2017",[11,12]]]},
{n:"Abarth",o:"EU",pool:["1.4 T-Jet 145","1.4 T-Jet 165","1.4 T-Jet 180","Électrique 155"],models:[["595|2017",[0,1]],["695|2017",[2]],["500e|2022",[3]]]},
{n:"Alfa Romeo",o:"EU",pool:["2.0 Turbo 200","2.0 Turbo 280","2.2 JTd 190","2.2 JTd 210","2.9 V6 510","2.9 V6 540","Hybrid 130","Hybrid 160","PHEV 280","Électrique 156","Électrique 240","Électrique 280"],models:[
["Giulia|2017",[0,1,2,3,4]],["Stelvio|2017",[0,1,2,3,5]],["Tonale|2022",[6,7,8]],["Junior|2024",[9,10,11]]]},
{n:"Lancia",o:"EU",pool:["1.2 69","1.0 Hybrid 70","Électrique 156"],models:[["Ypsilon|2017",[0,1]],["Ypsilon IV|2024",[1,2]]]},
{n:"Maserati",o:"EU",pool:["3.0 V6 350","3.0 V6 430","3.8 V8 580","Nettuno 630","Hybrid 330","Folgore 610","Folgore 830","3.0 Diesel 275"],models:[
["Ghibli|2017",[0,1,7]],["Levante|2017",[0,1,2,7]],["Quattroporte|2017",[0,1,7]],["MC20|2020",[3]],["Grecale|2022",[1,4,5]],["GranTurismo|2023",[3,6]]]},
{n:"Ferrari",o:"EU",pool:["3.9 V8 620","3.9 V8 720","3.9 V8 780","6.5 V12 830","Hybride 663","Hybride 1000","Hybride 1030"],models:[
["488|2017",[0]],["F8|2019",[1]],["Roma|2020",[0]],["Portofino M|2020",[2]],["SF90|2019",[5]],["296 GTB|2022",[4]],["Purosangue|2022",[3]],["812|2017",[3]],["12Cilindri|2024",[3]]]},
{n:"Lamborghini",o:"EU",pool:["5.2 V10 640","4.0 V8 650","Hybride V12 1015","Hybride V8 920"],models:[
["Huracán|2017",[0]],["Urus|2018",[1]],["Revuelto|2023",[2]],["Temerario|2025",[3]]]},
{n:"Porsche",o:"EU",pool:["2.0 300","2.5 S 350","3.0 380","3.0 S 450","4.0 GTS 480","4.0 Turbo 650","E-Hybrid 462","E-Hybrid 680","Électrique 408","Électrique 530","Électrique 625","Électrique 761","Électrique 360","Électrique 639"],models:[
["911 (992)|2019",[2,3,4,5]],["718|2017",[0,1,4]],["Panamera III|2024",[3,6,7]],["Taycan|2019",[8,9,10,11]],["Macan II|2024",[12,13]],["Cayenne III|2018",[3,5,6,7]]]},
{n:"Aston Martin",o:"EU",pool:["4.0 V8 510","4.0 V8 535","5.2 V12 630","5.2 V12 715","4.0 V8 680","4.0 V8 665","4.0 V8 707"],models:[
["DB11|2017",[0,2]],["Vantage|2018",[0,5]],["DBS|2018",[3]],["DBX|2020",[0,6]],["DB12|2023",[4]]]},
{n:"Bentley",o:"EU",pool:["4.0 V8 550","6.0 W12 635","Hybrid 462"],models:[["Continental GT|2018",[0,1,2]],["Bentayga|2017",[0,1,2]],["Flying Spur|2019",[0,1,2]]]},
{n:"Rolls-Royce",o:"EU",pool:["6.75 V12 571","6.75 V12 600","Électrique 585"],models:[["Ghost|2020",[0]],["Phantom VIII|2017",[1]],["Cullinan|2018",[1]],["Spectre|2023",[2]]]},
{n:"McLaren",o:"EU",pool:["3.8 V8 570","4.0 V8 720","4.0 V8 750","Hybride V6 680","4.0 V8 620"],models:[["570S|2017",[0]],["720S|2017",[1]],["750S|2023",[2]],["Artura|2021",[3]],["GT|2019",[4]]]},
{n:"Ford",o:"US",pool:["1.0 EcoBoost 100","1.0 EcoBoost 125","1.0 EcoBoost 155","1.5 EcoBoost 182","2.3 EcoBoost 280","1.5 EcoBlue 120","2.0 EcoBlue 150","2.0 EcoBlue 190","PHEV 225","Électrique 156","Électrique 170","Électrique 286","Électrique 340","Électrique 487"],models:[
["Fiesta VII|2017",[0,1,5]],["Focus IV|2018",[0,1,2,5,6]],["Puma|2020",[0,1,2,5]],["Puma Gen-E|2025",[9]],["Kuga III|2020",[2,5,6,8]],["Explorer EV|2024",[10,11]],["Capri EV|2024",[11,12]],["Mustang Mach-E|2021",[11,12,13]],["Ranger|2017",[6,7]],["Transit Custom|2017",[6,7]]]},
{n:"Jeep",o:"US",pool:["1.0 Turbo 120","1.2 Turbo 100","1.2 Hybrid 136","1.3 Turbo 180","4xe 190","4xe 240","4xe 380","2.0 Multijet 140","Électrique 156","3.6 V6 293","3.6 V6 284"],models:[
["Renegade|2017",[0,3,4,7]],["Compass|2017",[0,3,4,5,7]],["Wrangler JL|2018",[3,5,6]],["Grand Cherokee|2022",[6,9]],["Avenger|2023",[1,2,8]],["Gladiator|2020",[10]]]},
{n:"Tesla",o:"US",pool:["Électrique 283","Électrique 351","Électrique 460","Électrique 534","Électrique 639","Électrique 845","Électrique 1020"],models:[
["Model 3|2017",[0,1,2]],["Model Y|2021",[0,1,2,3]],["Model S|2017",[3,6]],["Model X|2017",[3,6]],["Cybertruck|2024",[4,5,6]]]},
{n:"Toyota",o:"AS",pool:["1.0 VVT-i 72","1.5 VVT-i 125","1.8 Hybrid 122","1.8 Hybrid 140","2.0 Hybrid 184","2.0 Hybrid 196","2.5 Hybrid 218","2.5 Hybrid 222","PHEV 223","PHEV 306","2.8 D-4D 204","Électrique 204","2.0 Hybrid 193"],models:[
["Yaris IV|2020",[0,1,3]],["Yaris Cross|2021",[1,3,5]],["Corolla XII|2019",[1,3,4,5]],["C-HR II|2023",[3,5,8]],["Prius V|2023",[12,8]],["RAV4 V|2019",[5,6,9]],["Highlander|2021",[7]],["Land Cruiser 250|2024",[10]],["Hilux|2017",[10]],["bZ4X|2022",[11]]]},
{n:"Lexus",o:"AS",pool:["1.5 Hybrid 136","2.0 Hybrid 196","2.5 Hybrid 243","2.5 Hybrid 250","3.5 V6 371","Électrique 204","Électrique 313","450h+ 309"],models:[
["LBX|2023",[0]],["UX|2019",[1,5]],["NX II|2021",[2,3,7]],["RX V|2022",[3,4]],["RZ|2023",[5,6]]]},
{n:"Honda",o:"AS",pool:["1.0 VTEC Turbo 126","1.5 VTEC Turbo 182","2.0 i-MMD 184","2.0 i-MMD 204","Électrique 204","Électrique 154"],models:[
["Civic XI|2022",[1,2]],["HR-V III|2021",[2]],["ZR-V|2023",[2,3]],["CR-V VI|2023",[2,3]],["e:Ny1|2024",[4]],["Jazz|2017",[0,2]],["CR-V V|2017",[1,3]]]},
{n:"Nissan",o:"AS",pool:["1.0 DIG-T 92","1.0 DIG-T 114","1.3 DIG-T 140","1.3 DIG-T 158","1.5 dCi 110","e-POWER 190","e-POWER 204","e-POWER 213","Électrique 150","Électrique 218","Électrique 242","2.3 dCi 163","2.3 dCi 190"],models:[
["Micra V|2017",[0,1,4]],["Juke II|2019",[0,1,2,5]],["Qashqai III|2021",[2,3,5,6,7]],["X-Trail IV|2022",[6,7]],["Leaf II|2018",[8,9]],["Ariya|2022",[9,10]],["Navara|2017",[11,12]]]},
{n:"Mazda",o:"AS",pool:["1.5 Skyactiv-G 90","2.0 Skyactiv-G 122","2.0 e-Skyactiv G 150","2.5 Skyactiv-G 192","1.8 Skyactiv-D 115","2.2 Skyactiv-D 150","2.2 Skyactiv-D 184","3.3 e-Skyactiv D 254","2.5 PHEV 327","Électrique 145","3.3 e-Skyactiv D 200"],models:[
["Mazda2|2017",[0,1]],["Mazda3 IV|2019",[1,2,4,5]],["CX-30|2019",[1,2,4,5,9]],["CX-5 II|2017",[2,3,5,6]],["CX-60|2022",[7,8,10]],["CX-80|2024",[7,8]],["MX-5 ND|2017",[1,2]]]},
{n:"Subaru",o:"AS",pool:["2.0 Boxer 150","2.5 Boxer 169","e-Boxer 150","e-Boxer 167","Électrique 218"],models:[
["Impreza|2017",[0,2]],["XV|2017",[0,2]],["Forester V|2018",[2,3]],["Outback VI|2021",[1,3]],["Solterra|2022",[4]]]},
{n:"Suzuki",o:"AS",pool:["1.2 Dualjet 90","1.2 Hybrid 102","1.4 Boosterjet 129","1.5 Hybrid 115","PHEV 185","1.0 Boosterjet 111","1.8 Hybrid 122"],models:[
["Swift VI|2024",[1]],["Swift V|2017",[0,5,2]],["Ignis|2017",[0,5]],["Jimny IV|2018",[3]],["Vitara|2017",[5,2,3]],["S-Cross|2021",[2,3,4]],["Swace|2020",[6]]]},
{n:"Mitsubishi",o:"AS",pool:["1.2 MIVEC 80","1.5 Turbo 163","2.2 DI-D 150","2.4 DI-D 181","PHEV 200","PHEV 306"],models:[
["Space Star|2017",[0]],["ASX|2017",[0,1]],["Eclipse Cross|2018",[1,4]],["Outlander IV|2021",[5]],["L200|2017",[2,3]]]},
{n:"Hyundai",o:"AS",pool:["1.0 T-GDi 100","1.0 T-GDi 120","1.6 T-GDi 180","1.6 T-GDi 198","1.6 CRDi 136","2.2 CRDi 202","Hybrid 141","Hybrid 215","Hybrid 252","Électrique 97","Électrique 115","Électrique 156","Électrique 218","Électrique 325"],models:[
["i10|2020",[0]],["i20|2020",[0,1]],["i30 III|2017",[0,1,4]],["Bayon|2021",[0,1,6]],["Kona II|2023",[1,3,6,11,12]],["Tucson IV|2021",[1,2,4,6,7]],["Santa Fe V|2024",[7,8]],["Inster|2024",[9,10]],["Ioniq 5|2021",[12,13]],["Ioniq 6|2022",[12,13]]]},
{n:"Kia",o:"AS",pool:["1.0 T-GDi 100","1.0 T-GDi 120","1.6 T-GDi 180","1.6 CRDi 136","Hybrid 141","Hybrid 215","PHEV 265","Électrique 204","Électrique 229","Électrique 325","Électrique 385","Électrique 585"],models:[
["Picanto|2017",[0]],["Rio|2017",[0,1]],["Ceed III|2018",[0,1,2,3,4]],["Niro II|2022",[4,5,6,7]],["Sportage V|2022",[1,2,3,4,5,6]],["Sorento IV|2020",[3,5,6]],["EV3|2024",[7]],["EV6|2021",[8,9,11]],["EV9|2023",[7,10]]]},
{n:"Genesis",o:"AS",pool:["2.0 T-GDi 245","2.5 T-GDi 304","3.5 T-GDi 380","Électrique 318","Électrique 435","Électrique 490"],models:[
["G70|2017",[0,1]],["G80|2020",[1,2,3]],["GV60|2021",[3,4,5]],["GV70|2021",[0,1,3]]]},
{n:"MG",o:"AS",pool:["1.5 VTi 106","1.5 T-GDi 162","Hybrid+ 194","Électrique 156","Électrique 170","Électrique 204","Électrique 245","Électrique 510","Électrique 544"],models:[
["MG3|2024",[2]],["MG4|2022",[3,4,5]],["ZS|2017",[0,1,4]],["HS|2019",[1,2]],["Cyberster|2024",[7,8]],["Marvel R|2021",[5,6]]]},
{n:"BYD",o:"AS",pool:["Électrique 150","Électrique 204","Électrique 218","Électrique 313","Électrique 530","Hybride 218"],models:[
["Atto 3|2022",[1]],["Dolphin|2023",[0,1]],["Seal|2023",[2,3,4]],["Seal U|2024",[1,2,5]],["Han|2022",[3,4]],["Tang|2022",[4]]]},
{n:"Lynk & Co",o:"AS",pool:["PHEV 261","Hybride 245"],models:[["01|2021",[0]],["02|2024",[1,0]]]}
];

/* ---------- accès normalisés ---------- */
function brandModels(b){ return b.models.map(m => { const p = m[0].split("|"); return { name:p[0], y0:+(p[1]||2017), engines:m[1].map(i => b.pool[i]) }; }); }
function findBrand(n){ return BRANDS.find(b => b.n === n) || null; }
function findModel(b, name){ return brandModels(b).find(m => m.name === name) || null; }

/* ===== MOTEUR DTC (21 000 fiches) ===== */
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
        famName = "Système constructeur — " + fam[0]; comp = pick(r, fam[1]);
      } else { const fam = FAM_P[code[2]] || FAM_P["0"]; famName = fam[0]; comp = pick(r, fam[1]); }
    } else if (L === "B"){ famName = FAM_B[0]; comp = pick(r, FAM_B[1]); }
    else if (L === "C"){ famName = FAM_C[0]; comp = pick(r, FAM_C[1]); }
    else { famName = FAM_U[0]; comp = pick(r, FAM_U[1]); }
    const fault = pick(r, FAULTS);
    const sev = 1 + Math.floor(r()*4);
    const generic = !brand && (code[1] === "0" || code[1] === "2");
    let brands;
    if (brand) brands = [brand];
    else if (generic) brands = ["Toutes marques"];
    else brands = pickN(r, BRANDS.map(b=>b.n), 4 + Math.floor(r()*8));
    const fuels = ["Essence","Diesel","Hybride","Électrique","GPL"];
    return { key, code, brand: brand || null,
      title: (brand ? "[" + brand + "] " : "") + famName + " — " + comp + " : " + fault,
      desc: "Défaut détecté par le calculateur sur « " + comp + " » (" + fault + "). Contrôle actif " +
            pick(r,["en permanence","au démarrage","après stabilisation du moteur","sur 2 cycles de conduite"]) +
            ". Le MIL est " + pick(r,["allumé immédiatement","allumé après 2 cycles","demandé selon conditions"]) + ".",
      sev, sevLabel: SEV[sev-1],
      symptoms: pickN(r, SYMPTOMS, 2 + Math.floor(r()*3)),
      causes: pickN(r, CAUSES, 3 + Math.floor(r()*3)),
      solutions: pickN(r, SOLUTIONS, 3 + Math.floor(r()*3)),
      brands, motors: pickN(r, fuels, 2 + Math.floor(r()*3)),
      years: "2017-2026", generic };
  }
  function codeFromIndex(i){
    const L = LETTERS[Math.floor(i/4000)], rem = i % 4000;
    return L + Math.floor(rem/1000) + pad3(rem % 1000);
  }
  function ficheAt(i){
    if (i < 16000) return makeFiche(codeFromIndex(i), null);
    const j = i - 16000;
    return makeFiche("P1" + pad3((j*7) % 1000), BRANDS[j % BRANDS.length].n);
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
        if ("P1" + pad3((j*7) % 1000) === code) res.push({ key: code + "@" + b.n, brand: b.n });
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
    const bi = BRANDS.findIndex(b => b.n === brand);
    if (bi >= 0){
      const n = BRANDS.length, per = Math.ceil(5000/n);
      const kCount = 6 + Math.floor(r()*6), used = new Set();
      for (let t = 0; t < kCount; t++){
        const k = Math.floor(r()*per);
        if (used.has(k)) continue; used.add(k);
        const j = k*n + bi;
        if (j >= 5000) continue;
        keys.push({ key: "P1" + pad3((j*7) % 1000) + "@" + brand, code: "P1" + pad3((j*7) % 1000), brand });
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

/* ===== PANNES DÉTAILLÉES PAR SYSTÈME (complément DTC, avec symptômes) ===== */
const SYS = [
 { name:"Moteur & injection", hv:false,
   c:["injecteurs","pompe haute pression","turbo","vanne EGR","sonde lambda","débitmètre","calculateur moteur","circuit carburant"],
   f:["perte de puissance progressive","ratés à chaud","fumée noire au démarrage","sifflement turbo","consommation anormale","INCENDIE MÉCANIQUE : fuite carburant/huile sur ligne d'échappement"],
   s:["voyant moteur","perte de puissance","fumée anormale","ralenti instable","trous à l'accélération","odeur de carburant / fumée compartiment"],
   k:["encrassement","capteur fatigué","fuite d'air ou de carburant","logiciel obsolète","usure mécanique","joint / durite poreuse"],
   x:["diagnostic valise + mesures","nettoyage/remplacement composant","mise à jour calculateur","contrôle étanchéité circuit"],
   d:["P0300","P0299","P0171","P0420","P0087","P2002"] },
 { name:"Carrosserie", hv:false,
   c:["verrouillage centralisé","hayon motorisé","lève-vitre","éclairage LED/matrice","étanchéité pare-brise","rétroviseurs rabattables"],
   f:["verrouillage aléatoire","hayon bloqué","lève-vitre désynchronisé","condensation dans optiques","infiltration d'eau habitacle"],
   s:["voyant porte ouverte","bruits anormales","eau dans habitacle","éclairage partiel","réinitialisation impossible"],
   k:["micro-switch HS","moteur fatigué","joint poreux","infiltration connecteur"],
   x:["remplacement micro-switch","réapprentissage module","reprise étanchéité","séchage + graissage connecteurs"],
   d:["B1000","B1010","B1230","B2000"] },
 { name:"ADAS", hv:false,
   c:["radar ACC","caméra pare-brise","capteurs ultrasons","module fusion ADAS","capteur angle mort"],
   f:["déréglage après remplacement pare-brise","fausses alertes de freinage","régulateur adaptatif inactif","parking assist indisponible"],
   s:["message capteur sale","freinages intempestifs","fonctions grisées au combiné","alarmes sonores répétées"],
   k:["calibration perdue","caméra désalignée","radar encrassé","faisceau endommagé"],
   x:["recalibration en concession","nettoyage/contrôle supports","mise à jour module ADAS","contrôle faisceau"],
   d:["U0121","U0100","C1A00","C1B00"] },
 { name:"Train roulant", hv:false,
   c:["roulements de roue","cardans","silentblocs","amortisseurs","direction","capteurs ABS"],
   f:["roulement bruyant","cardan qui claque","usure irrégulière des pneus","vibrations à haute vitesse","pédale de frein spongieuse"],
   s:["bruit de roulement croissant","clacs en braquant","vibrations volant","tirage au volant","distance de freinage allongée"],
   k:["usure normale","choc nid-de-poule","géométrie déréglée","capteur ABS encrassé"],
   x:["remplacement roulement/cardan","géométrie complète","contrôle disques/plaquettes","nettoyage capteur ABS"],
   d:["C0035","C0040","C0110","C0121"] },
 { name:"Transmission", hv:false,
   c:["embrayage","volant moteur","boîte auto/EDC","mécanisme de boîte","transmission 4x4"],
   f:["broutage embrayage","à-coups en boîte automatique","rapports qui sautent","bruit de différentiel"],
   s:["patinage","à-coups en accélération","voyant boîte","bruit en décélération","rapport impossible à passer"],
   k:["usure embrayage","mécatronique fatiguée","huile dégradée","logiciel boîte obsolète"],
   x:["remplacement kit embrayage","vidange boîte + adaptations","reprogrammation mécatronique","contrôle transfert 4x4"],
   d:["P0700","P0715","P0730","P0741","P0750"] },
 { name:"Retenue (ceintures / airbags)", hv:false,
   c:["prétensionneurs","capteurs de choc","module airbag","boucles de ceinture","contacteurs d'occupation"],
   f:["prétensionneur condamné après choc","voyant airbag allumé","boucle non détectée","connecteur sous siège oxydé"],
   s:["voyant airbag fixe","ceinture bloquée","alarme boucle non clipée","défaut apparu après intervention"],
   k:["pyrotechnie déclenchée","connecteur oxydé","nappe coupée","module HS"],
   x:["remplacement prétensionneur","nettoyage connecteur","remplacement module airbag","contrôle nappe de siège"],
   d:["B0001","B0002","B0050","B0081"] },
 { name:"Électronique & énergie (thermique)", hv:false,
   c:["tablette/multimédia","combiné numérique","module ABS/ESP","batterie 12V","alternateur","faisceau moteur"],
   f:["écran figé / redémarrages","perte de fonctionnalités","court-circuit faisceau","décharge batterie 12V","INCENDIE ÉLECTRIQUE : échauffement faisceau"],
   s:["redémarrages tablette","voyants multiples","odeur de chaud / plastique fondu","démarrage difficile"],
   k:["logiciel multimédia","masse défaillante","faisceau rongé/usé","alternateur fatigué"],
   x:["mise à jour logicielle","reprise masses","remplacement tronçon faisceau","contrôle alternateur/12V"],
   d:["U0155","U0100","P0562","P0601"] },
 { name:"Électronique & énergie (HV / électrifié)", hv:true,
   c:["batterie haute tension","chargeur embarqué","câblage HV","onduleur","DC-DC","connecteur de charge"],
   f:["perte d'autonomie anormale","défaut de charge AC/DC","court-circuit cellule","échauffement pack (risque INCENDIE)","défaut d'isolement HV"],
   s:["autonomie en baisse rapide","charge qui s'interrompt","message défaut batterie","odeur chaude / alarme pack","puissance bridée"],
   k:["cellules déséquilibrées","connecteur de charge usé","isolant HV dégradé","DC-DC défaillant","logiciel BMS"],
   x:["équilibrage / remplacement modules","remplacement connecteur","contrôle isolement HV","mise à jour BMS","remplacement DC-DC"],
   d:["P0A80","P0AA6","P0C29","P0562","P0A1F"] }
];

function systemFaultsFor(brand, model, engine){
  const fuel = DT.fuelOf(engine);
  const elec = (fuel === "Hybride" || fuel === "Électrique");
  const out = [];
  SYS.forEach(sys => {
    if (sys.hv && !elec) return;
    if (!sys.hv && sys.name.startsWith("Électronique") && elec && sys.hv === false && sys.name.includes("(thermique)")) { /* keep both elec variants? thermique aussi pertinent partiellement */ }
    const r = (function(){ let h=1779033703; const s="sys|"+brand+"|"+model+"|"+engine+"|"+sys.name; for(let i=0;i<s.length;i++){ h=Math.imul(h^s.charCodeAt(i),3432918353); h=h<<13|h>>>19; } let a=h>>>0; return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })();
    const n = 2 + Math.floor(r()*2);
    for (let i = 0; i < n; i++){
      out.push({
        sys: sys.name,
        comp: sys.c[Math.floor(r()*sys.c.length)],
        fault: sys.f[Math.floor(r()*sys.f.length)],
        symptoms: (function(){ const c=[...sys.s], o=[]; const k=2+Math.floor(r()*3); while(o.length<k&&c.length) o.push(c.splice(Math.floor(r()*c.length),1)[0]); return o; })(),
        causes: (function(){ const c=[...sys.k], o=[]; const k=2+Math.floor(r()*2); while(o.length<k&&c.length) o.push(c.splice(Math.floor(r()*c.length),1)[0]); return o; })(),
        fixes: (function(){ const c=[...sys.x], o=[]; const k=1+Math.floor(r()*2); while(o.length<k&&c.length) o.push(c.splice(Math.floor(r()*c.length),1)[0]); return o; })(),
        dtcs: (function(){ const c=[...sys.d], o=[]; const k=1+Math.floor(r()*3); while(o.length<k&&c.length) o.push(c.splice(Math.floor(r()*c.length),1)[0]); return o; })(),
        sev: 1 + Math.floor(r()*4),
        sevLabel: ["Mineure","Modérée","Sérieuse","Critique"][Math.floor(r()*4)]
      });
    }
  });
  return out;
}

/* Résolution fiche DTC */
function resolveFiche(key){
  if (Store.isDeleted(key)) return null;
  const ov = Store.getOverride(key);
  if (ov) return ov;
  const cu = Store.customs().find(c => c.key === key);
  if (cu) return cu;
  if (/^[PBCU][0-3][0-9A-F]{3}$/.test(key.slice(0,5)) && !key.includes("@")) return DT.makeFiche(key.slice(0,5), null);
  if (key.includes("@")){ const p = key.split("@"); return DT.makeFiche(p[0], p[1]); }
  return null;
}
