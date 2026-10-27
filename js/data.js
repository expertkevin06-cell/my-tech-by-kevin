"use strict";
const CATS = { FR:"Françaises", EU:"Européennes", US:"Américaines", AS:"Asiatiques" };

const BRANDS = [
{n:"Renault",o:"FR",pool:["1.0 TCe 90","1.0 TCe 100","1.2 TCe 130","1.3 TCe 140","1.3 TCe 160","1.5 Blue dCi 95","1.5 Blue dCi 115","1.6 E-TECH 145","1.8 E-Tech 160","2.0 Blue dCi 180","Électrique 135","Électrique 150","Électrique 218","1.6 Hybrid 140","Électrique 95","Électrique 120","Électrique 170","E-TECH 200","2.0 dCi 150","2.0 dCi 170","2.3 dCi 150","2.3 dCi 180","1.0 SCe 65","Électrique 82"],models:[
["Clio V|2019",[0,1,5,6,7]],["Clio VI|2025",[0,1,8]],["Captur II|2020",[1,3,4,6,7]],["Mégane IV|2017",[2,3,5,6,7]],["Mégane E-Tech|2022",[11,12]],["R5 E-Tech|2024",[14,15,11]],["R4 E-Tech|2024",[15,11]],["Scénic E-Tech|2024",[16,12]],["Arkana|2021",[3,4,7]],["Austral|2022",[3,7]],["Espace VI|2023",[7,17]],["Symbioz|2024",[1,7]],["Zoé|2017",[10,11]],["Twingo III|2017",[22,23]],["Kangoo III|2021",[1,5,6]],["Trafic|2017",[18,19]],["Master|2017",[20,21]]]},
{n:"Peugeot",o:"FR",pool:["1.2 PureTech 75","1.2 PureTech 100","1.2 PureTech 130","1.2 Hybrid 136","1.5 BlueHDi 100","1.5 BlueHDi 130","2.0 BlueHDi 150","2.0 BlueHDi 180","HYBRID 225","HYBRID4 300","Électrique 136","Électrique 156","Électrique 210","Électrique 230","Électrique 320","2.2 BlueHDi 165"],models:[
["208 II|2019",[0,1,2,4,10]],["308 III|2021",[1,2,3,4,5,8]],["3008 II|2017",[2,4,5,6,7,8,9]],["3008 III|2024",[3,12,13,14]],["5008 II|2017",[2,4,5,6,7,8,9]],["5008 III|2024",[3,5,12,13,14]],["508 II|2018",[2,5,7,8,9]],["2008 II|2020",[0,1,2,4,10,11]],["408|2022",[2,3,5,8]],["Rifter|2018",[1,4,5]],["Expert|2017",[5,6,7]],["Boxer|2017",[15]]]},
{n:"Citroën",o:"FR",pool:["1.2 PureTech 82","1.2 PureTech 110","1.2 PureTech 130","1.2 Hybrid 100","1.2 Hybrid 136","1.5 BlueHDi 100","1.5 BlueHDi 130","HYBRID 225","Électrique 113","Électrique 136","Électrique 156","E-TENSE 360","Électrique 8"],models:[
["C3 III|2024",[3,4,8]],["C3 Aircross II|2024",[3,4,8,9]],["C4 III|2020",[1,2,5,6,9,10]],["C4 X|2022",[1,2,5,6,9]],["C5 Aircross|2019",[1,2,5,6,7]],["C5 X|2022",[2,6,7,11]],["Berlingo|2018",[1,5,6,9]],["Jumpy|2017",[5,6]],["Ami|2020",[12]]]},
{n:"DS",o:"FR",pool:["1.2 PureTech 130","1.5 BlueHDi 130","E-TENSE 225","E-TENSE 300","E-TENSE 360","Électrique 156"],models:[["DS 3|2019",[0,1,5]],["DS 4 II|2021",[0,1,2,3]],["DS 7|2017",[0,1,2,3,4]],["DS 9|2021",[2,3,4]]]},
{n:"Dacia",o:"FR",pool:["1.0 SCe 65","1.0 TCe 90","1.0 TCe 100","1.0 ECO-G 100","1.2 TCe 130","1.2 TCe 140","1.3 TCe 150","1.5 Blue dCi 95","1.5 Blue dCi 115","Hybrid 140","Hybrid 155","Électrique 65","Électrique 70","Électrique 109"],models:[
["Sandero III|2020",[0,1,3]],["Logan III|2020",[1,3]],["Duster III|2024",[3,4,9]],["Bigster|2025",[4,5,10]],["Jogger|2021",[1,3,6,9]],["Spring II|2024",[11,12]],["Spring|2021",[13,11]]]},
{n:"Alpine",o:"FR",pool:["1.8 TCe 252","1.8 TCe 300","1.8 TCe 340","Électrique 180","Électrique 220","Électrique 400","Électrique 470"],models:[["A110|2017",[0,1,2]],["A290|2024",[3,4]],["A390|2025",[5,6]]]},
{n:"Bugatti",o:"FR",pool:["8.0 W16 1500","8.0 W16 1600"],models:[["Chiron|2017",[0,1]]]},
{n:"Volkswagen",o:"EU",pool:["1.0 TSI 95","1.0 TSI 110","1.5 TSI 130","1.5 TSI 150","2.0 TSI 204","2.0 TSI 265","2.0 TSI 300","1.6 TDI 95","2.0 TDI 115","2.0 TDI 150","2.0 TDI 193","2.0 TDI 200","eHybrid 204","eHybrid 272","Électrique 170","Électrique 204","Électrique 286","Électrique 340","3.0 TSI 340","3.0 TDI 286","1.0 60","1.0 75"],models:[
["Polo VI|2017",[0,1,2,8]],["Golf VII|2017",[0,2,8,9]],["Golf VIII|2020",[1,2,3,4,9,12]],["Passat IX|2024",[2,4,5,9,10,12,13]],["Tiguan II|2017",[2,3,8,9,11]],["Tiguan III|2024",[2,3,4,5,9,10,12,13]],["T-Roc|2017",[0,1,2,3,8,9]],["T-Cross|2019",[0,1,2,8]],["Taigo|2021",[0,1,2,8]],["Touareg III|2018",[18,19,12]],["Arteon|2017",[2,4,9,10]],["ID.3|2020",[14,15,16]],["ID.4|2021",[15,16,17]],["ID.5|2022",[16,17]],["ID.7|2023",[16,17]],["ID.Buzz|2022",[15,16,17]],["up!|2017",[20,21]]]},
{n:"Audi",o:"EU",pool:["1.5 TFSI 150","2.0 TFSI 204","2.0 TFSI 265","3.0 TFSI 340","2.0 TDI 163","2.0 TDI 204","3.0 TDI 286","3.0 TDI 340","Électrique 286","Électrique 388","Électrique 490","Électrique 646"],models:[
["A3 IV|2020",[0,1,4,5]],["A4 B9|2017",[0,1,2,4,5,6]],["A5 III|2024",[0,1,2,4,5]],["A6 C8|2018",[1,2,3,5,6,7]],["Q3 II|2018",[0,1,4,5]],["Q4 e-tron|2021",[8,9]],["Q5 II|2017",[1,2,4,5,6]],["Q6 e-tron|2024",[8,9,10]],["Q7 II|2017",[3,6,7]],["e-tron GT|2021",[10,11]],["TT III|2017",[1,2]]]},
{n:"Seat",o:"EU",pool:["1.0 TSI 95","1.0 TSI 110","1.5 TSI 130","1.5 TSI 150","2.0 TSI 190","2.0 TSI 245","1.6 TDI 115","2.0 TDI 150","eHybrid 204","Électrique 83"],models:[["Ibiza V|2017",[0,1,2,6]],["Leon IV|2020",[1,2,3,6,7,8]],["Arona|2017",[0,1,2,6]],["Ateca|2017",[2,3,6,7]],["Tarraco|2018",[2,3,7,8]]]},
{n:"Cupra",o:"EU",pool:["1.5 eTSI 150","2.0 TSI 245","2.0 TSI 310","2.0 TSI 333","e-Hybrid 204","e-Hybrid 272","Électrique 204","Électrique 231","Électrique 286","Électrique 340"],models:[["Formentor|2020",[0,1,2,3,4,5]],["Born|2021",[6,7,8]],["Tavascan|2024",[8,9]],["Terramar|2024",[0,1,4,5]],["Ateca|2018",[1,2]]]},
{n:"Skoda",o:"EU",pool:["1.0 TSI 95","1.0 TSI 110","1.5 TSI 130","1.5 TSI 150","2.0 TSI 190","2.0 TSI 245","2.0 TDI 115","2.0 TDI 150","2.0 TDI 200","Électrique 170","Électrique 204","Électrique 286","e-Hybrid 204"],models:[
["Fabia IV|2021",[0,1,2]],["Scala|2019",[0,1,2]],["Octavia IV|2020",[1,2,3,6,7,8]],["Kamiq|2019",[0,1,2,6]],["Karoq|2017",[1,2,6,7]],["Kodiaq II|2024",[2,3,7,8,12]],["Superb IV|2024",[2,3,7,8,12]],["Enyaq|2021",[9,10,11]],["Elroq|2024",[9,10,11]]]},
{n:"BMW",o:"EU",pool:["116i 122","118i 156","120i 170","128ti 265","116d 116","118d 150","120d 190","M340i 374","Électrique 340","Électrique 544","20i 190","20d 197","30e 299","M50 398","520i 208","530e 299","i5 eDrive40 340","i5 M60 601","520d 197","iX1 313","30d 286","M60i 530","iX M60 619"],models:[
["Série 1 F40|2019",[0,1,2,3,4,5,6]],["Série 3 G20|2019",[2,6,7,11,12]],["Série 5 G60|2023",[14,15,16,17,18]],["X1 U11|2022",[1,2,5,6,19]],["X3 G45|2024",[10,11,12,13]],["X5 G05|2018",[7,20,21]],["i4|2021",[8,9]],["iX|2021",[9,22]],["Z4 G29|2018",[2,7]]]},
{n:"Mini",o:"EU",pool:["Cooper 136","Cooper S 192","JCW 231","Cooper D 116","Electric 184","Electric 218","SE 313"],models:[["Cooper III|2017",[0,1,2,3]],["Cooper IV|2024",[0,1,4,5]],["Countryman|2017",[0,1,2,3]],["Countryman II|2024",[1,2,5,6]],["Clubman|2017",[0,1,2,3]]]},
{n:"Mercedes",o:"EU",pool:["A 180 136","A 200 163","A 250 224","A 180 d 116","A 220 d 190","C 200 204","C 300 258","C 220 d 197","C 300 e 313","E 200 204","E 300 e 313","E 220 d 197","E 450 381","EQE 350 292","EQS 450+ 360","AMG 43 421","AMG 53 435","GLC 300 e 313","EQE SUV 350 292","G 400 d 330","G 500 421","G 63 585"],models:[
["Classe A W177|2018",[0,1,2,3,4]],["Classe C W206|2021",[5,6,7,8]],["Classe E W214|2023",[9,10,11,12]],["CLA C118|2019",[0,1,3,4]],["GLC X254|2022",[5,7,17]],["GLE V167|2019",[7,12,16]],["EQE|2022",[13]],["EQS|2021",[14]],["EQE SUV|2023",[18]],["Classe G|2018",[19,20,21]]]},
{n:"Smart",o:"EU",pool:["Électrique 82","Électrique 272","Électrique 428","Électrique 646"],models:[["#1|2022",[1,2]],["#3|2023",[1,2]],["#5|2024",[2,3]],["fortwo|2017",[0]]]},
{n:"Opel",o:"EU",pool:["1.2 Turbo 100","1.2 Turbo 130","1.2 Hybrid 136","1.2 Hybrid 145","1.5 Diesel 130","Électrique 136","Électrique 156","Électrique 210","Électrique 113"],models:[["Corsa F|2019",[0,1,4,5]],["Astra L|2021",[1,2,4,5,6]],["Mokka II|2021",[0,1,5,6]],["Grandland II|2024",[2,3,4,7]],["Frontera|2024",[0,2,8]],["Crossland|2017",[0,1,4]]]},
{n:"Volvo",o:"EU",pool:["T2 129","T3 163","T4 197","T5 250","T6 Recharge 350","T8 Recharge 455","D3 150","D4 197","Single 231","Twin 408","Twin 517","Single 272","Twin 428"],models:[["XC40|2017",[1,2,3,6,7,4]],["XC60 II|2017",[2,3,4,5,7]],["XC90 II|2017",[3,5,7]],["S60 III|2019",[1,2,3,4,6]],["V60 II|2018",[2,3,4,5,7]],["C40|2021",[8,9]],["EX30|2023",[11,12]],["EX90|2024",[10]]]},
{n:"Polestar",o:"EU",pool:["Single 272","Dual 408","Dual 517","Dual 544","Dual 476"],models:[["2|2020",[0,1,2]],["3|2024",[2,4]],["4|2024",[0,3]]]},
{n:"Fiat",o:"EU",pool:["1.2 69","1.0 Hybrid 70","1.2 Turbo 100","1.2 Hybrid 100","1.5 Hybrid 136","1.3 Multijet 95","1.4 T-Jet 140","Électrique 113","Électrique 118","Électrique 156","1.6 Multijet 130","2.2 Multijet 140","2.2 Multijet 180"],models:[["500 (312)|2017",[0,1]],["500e|2020",[8]],["Panda III|2017",[0,1]],["Tipo|2017",[0,5,10]],["Grande Panda|2024",[2,3,7]],["600|2023",[3,4,9]],["500X|2017",[0,5,10]],["Ducato|2017",[11,12]]]},
{n:"Abarth",o:"EU",pool:["1.4 T-Jet 145","1.4 T-Jet 165","1.4 T-Jet 180","Électrique 155"],models:[["595|2017",[0,1]],["695|2017",[2]],["500e|2022",[3]]]},
{n:"Alfa Romeo",o:"EU",pool:["2.0 Turbo 200","2.0 Turbo 280","2.2 JTd 190","2.2 JTd 210","2.9 V6 510","2.9 V6 540","Hybrid 130","Hybrid 160","PHEV 280","Électrique 156","Électrique 240","Électrique 280"],models:[["Giulia|2017",[0,1,2,3,4]],["Stelvio|2017",[0,1,2,3,5]],["Tonale|2022",[6,7,8]],["Junior|2024",[9,10,11]]]},
{n:"Lancia",o:"EU",pool:["1.2 69","1.0 Hybrid 70","Électrique 156"],models:[["Ypsilon|2017",[0,1]],["Ypsilon IV|2024",[1,2]]]},
{n:"Maserati",o:"EU",pool:["3.0 V6 350","3.0 V6 430","3.8 V8 580","Nettuno 630","Hybrid 330","Folgore 610","Folgore 830","3.0 Diesel 275"],models:[["Ghibli|2017",[0,1,7]],["Levante|2017",[0,1,2,7]],["Quattroporte|2017",[0,1,7]],["MC20|2020",[3]],["Grecale|2022",[1,4,5]],["GranTurismo|2023",[3,6]]]},
{n:"Ferrari",o:"EU",pool:["3.9 V8 620","3.9 V8 720","3.9 V8 780","6.5 V12 830","Hybride 663","Hybride 1000","Hybride 1030"],models:[["488|2017",[0]],["F8|2019",[1]],["Roma|2020",[0]],["Portofino M|2020",[2]],["SF90|2019",[5]],["296 GTB|2022",[4]],["Purosangue|2022",[3]],["812|2017",[3]],["12Cilindri|2024",[3]]]},
{n:"Lamborghini",o:"EU",pool:["5.2 V10 640","4.0 V8 650","Hybride V12 1015","Hybride V8 920"],models:[["Huracán|2017",[0]],["Urus|2018",[1]],["Revuelto|2023",[2]],["Temerario|2025",[3]]]},
{n:"Porsche",o:"EU",pool:["2.0 300","2.5 S 350","3.0 380","3.0 S 450","4.0 GTS 480","4.0 Turbo 650","E-Hybrid 462","E-Hybrid 680","Électrique 408","Électrique 530","Électrique 625","Électrique 761","Électrique 360","Électrique 639"],models:[["911 (992)|2019",[2,3,4,5]],["718|2017",[0,1,4]],["Panamera III|2024",[3,6,7]],["Taycan|2019",[8,9,10,11]],["Macan II|2024",[12,13]],["Cayenne III|2018",[3,5,6,7]]]},
{n:"Aston Martin",o:"EU",pool:["4.0 V8 510","4.0 V8 535","5.2 V12 630","5.2 V12 715","4.0 V8 680","4.0 V8 665","4.0 V8 707"],models:[["DB11|2017",[0,2]],["Vantage|2018",[0,5]],["DBS|2018",[3]],["DBX|2020",[0,6]],["DB12|2023",[4]]]},
{n:"Bentley",o:"EU",pool:["4.0 V8 550","6.0 W12 635","Hybrid 462"],models:[["Continental GT|2018",[0,1,2]],["Bentayga|2017",[0,1,2]],["Flying Spur|2019",[0,1,2]]]},
{n:"Rolls-Royce",o:"EU",pool:["6.75 V12 571","6.75 V12 600","Électrique 585"],models:[["Ghost|2020",[0]],["Phantom VIII|2017",[1]],["Cullinan|2018",[1]],["Spectre|2023",[2]]]},
{n:"McLaren",o:"EU",pool:["3.8 V8 570","4.0 V8 720","4.0 V8 750","Hybride V6 680","4.0 V8 620"],models:[["570S|2017",[0]],["720S|2017",[1]],["750S|2023",[2]],["Artura|2021",[3]],["GT|2019",[4]]]},
{n:"Ford",o:"US",pool:["1.0 EcoBoost 100","1.0 EcoBoost 125","1.0 EcoBoost 155","1.5 EcoBoost 182","2.3 EcoBoost 280","1.5 EcoBlue 120","2.0 EcoBlue 150","2.0 EcoBlue 190","PHEV 225","Électrique 156","Électrique 170","Électrique 286","Électrique 340","Électrique 487"],models:[["Fiesta VII|2017",[0,1,5]],["Focus IV|2018",[0,1,2,5,6]],["Puma|2020",[0,1,2,5]],["Puma Gen-E|2025",[9]],["Kuga III|2020",[2,5,6,8]],["Explorer EV|2024",[10,11]],["Capri EV|2024",[11,12]],["Mustang Mach-E|2021",[11,12,13]],["Ranger|2017",[6,7]],["Transit Custom|2017",[6,7]]]},
{n:"Jeep",o:"US",pool:["1.0 Turbo 120","1.2 Turbo 100","1.2 Hybrid 136","1.3 Turbo 180","4xe 190","4xe 240","4xe 380","2.0 Multijet 140","Électrique 156","3.6 V6 293","3.6 V6 284"],models:[["Renegade|2017",[0,3,4,7]],["Compass|2017",[0,3,4,5,7]],["Wrangler JL|2018",[3,5,6]],["Grand Cherokee|2022",[6,9]],["Avenger|2023",[1,2,8]],["Gladiator|2020",[10]]]},
{n:"Tesla",o:"US",pool:["Électrique 283","Électrique 351","Électrique 460","Électrique 534","Électrique 639","Électrique 845","Électrique 1020"],models:[["Model 3|2017",[0,1,2]],["Model Y|2021",[0,1,2,3]],["Model S|2017",[3,6]],["Model X|2017",[3,6]],["Cybertruck|2024",[4,5,6]]]},
{n:"Toyota",o:"AS",pool:["1.0 VVT-i 72","1.5 VVT-i 125","1.8 Hybrid 122","1.8 Hybrid 140","2.0 Hybrid 184","2.0 Hybrid 196","2.5 Hybrid 218","2.5 Hybrid 222","PHEV 223","PHEV 306","2.8 D-4D 204","Électrique 204","2.0 Hybrid 193"],models:[["Yaris IV|2020",[0,1,3]],["Yaris Cross|2021",[1,3,5]],["Corolla XII|2019",[1,3,4,5]],["C-HR II|2023",[3,5,8]],["Prius V|2023",[12,8]],["RAV4 V|2019",[5,6,9]],["Highlander|2021",[7]],["Land Cruiser 250|2024",[10]],["Hilux|2017",[10]],["bZ4X|2022",[11]]]},
{n:"Lexus",o:"AS",pool:["1.5 Hybrid 136","2.0 Hybrid 196","2.5 Hybrid 243","2.5 Hybrid 250","3.5 V6 371","Électrique 204","Électrique 313","450h+ 309"],models:[["LBX|2023",[0]],["UX|2019",[1,5]],["NX II|2021",[2,3,7]],["RX V|2022",[3,4]],["RZ|2023",[5,6]]]},
{n:"Honda",o:"AS",pool:["1.0 VTEC Turbo 126","1.5 VTEC Turbo 182","2.0 i-MMD 184","2.0 i-MMD 204","Électrique 204","Électrique 154"],models:[["Civic XI|2022",[1,2]],["HR-V III|2021",[2]],["ZR-V|2023",[2,3]],["CR-V VI|2023",[2,3]],["e:Ny1|2024",[4]],["Jazz|2017",[0,2]],["CR-V V|2017",[1,3]]]},
{n:"Nissan",o:"AS",pool:["1.0 DIG-T 92","1.0 DIG-T 114","1.3 DIG-T 140","1.3 DIG-T 158","1.5 dCi 110","e-POWER 190","e-POWER 204","e-POWER 213","Électrique 150","Électrique 218","Électrique 242","2.3 dCi 163","2.3 dCi 190"],models:[["Micra V|2017",[0,1,4]],["Juke II|2019",[0,1,2,5]],["Qashqai III|2021",[2,3,5,6,7]],["X-Trail IV|2022",[6,7]],["Leaf II|2018",[8,9]],["Ariya|2022",[9,10]],["Navara|2017",[11,12]]]},
{n:"Mazda",o:"AS",pool:["1.5 Skyactiv-G 90","2.0 Skyactiv-G 122","2.0 e-Skyactiv G 150","2.5 Skyactiv-G 192","1.8 Skyactiv-D 115","2.2 Skyactiv-D 150","2.2 Skyactiv-D 184","3.3 e-Skyactiv D 254","2.5 PHEV 327","Électrique 145","3.3 e-Skyactiv D 200"],models:[["Mazda2|2017",[0,1]],["Mazda3 IV|2019",[1,2,4,5]],["CX-30|2019",[1,2,4,5,9]],["CX-5 II|2017",[2,3,5,6]],["CX-60|2022",[7,8,10]],["CX-80|2024",[7,8]],["MX-5 ND|2017",[1,2]]]},
{n:"Subaru",o:"AS",pool:["2.0 Boxer 150","2.5 Boxer 169","e-Boxer 150","e-Boxer 167","Électrique 218"],models:[["Impreza|2017",[0,2]],["XV|2017",[0,2]],["Forester V|2018",[2,3]],["Outback VI|2021",[1,3]],["Solterra|2022",[4]]]},
{n:"Suzuki",o:"AS",pool:["1.2 Dualjet 90","1.2 Hybrid 102","1.4 Boosterjet 129","1.5 Hybrid 115","PHEV 185","1.0 Boosterjet 111","1.8 Hybrid 122"],models:[["Swift VI|2024",[1]],["Swift V|2017",[0,5,2]],["Ignis|2017",[0,5]],["Jimny IV|2018",[3]],["Vitara|2017",[5,2,3]],["S-Cross|2021",[2,3,4]],["Swace|2020",[6]]]},
{n:"Mitsubishi",o:"AS",pool:["1.2 MIVEC 80","1.5 Turbo 163","2.2 DI-D 150","2.4 DI-D 181","PHEV 200","PHEV 306"],models:[["Space Star|2017",[0]],["ASX|2017",[0,1]],["Eclipse Cross|2018",[1,4]],["Outlander IV|2021",[5]],["L200|2017",[2,3]]]},
{n:"Hyundai",o:"AS",pool:["1.0 T-GDi 100","1.0 T-GDi 120","1.6 T-GDi 180","1.6 T-GDi 198","1.6 CRDi 136","2.2 CRDi 202","Hybrid 141","Hybrid 215","Hybrid 252","Électrique 97","Électrique 115","Électrique 156","Électrique 218","Électrique 325"],models:[["i10|2020",[0]],["i20|2020",[0,1]],["i30 III|2017",[0,1,4]],["Bayon|2021",[0,1,6]],["Kona II|2023",[1,3,6,11,12]],["Tucson IV|2021",[1,2,4,6,7]],["Santa Fe V|2024",[7,8]],["Inster|2024",[9,10]],["Ioniq 5|2021",[12,13]],["Ioniq 6|2022",[12,13]]]},
{n:"Kia",o:"AS",pool:["1.0 T-GDi 100","1.0 T-GDi 120","1.6 T-GDi 180","1.6 CRDi 136","Hybrid 141","Hybrid 215","PHEV 265","Électrique 204","Électrique 229","Électrique 325","Électrique 385","Électrique 585"],models:[["Picanto|2017",[0]],["Rio|2017",[0,1]],["Ceed III|2018",[0,1,2,3,4]],["Niro II|2022",[4,5,6,7]],["Sportage V|2022",[1,2,3,4,5,6]],["Sorento IV|2020",[3,5,6]],["EV3|2024",[7]],["EV6|2021",[8,9,11]],["EV9|2023",[7,10]]]},
{n:"Genesis",o:"AS",pool:["2.0 T-GDi 245","2.5 T-GDi 304","3.5 T-GDi 380","Électrique 318","Électrique 435","Électrique 490"],models:[["G70|2017",[0,1]],["G80|2020",[1,2,3]],["GV60|2021",[3,4,5]],["GV70|2021",[0,1,3]]]},
{n:"MG",o:"AS",pool:["1.5 VTi 106","1.5 T-GDi 162","Hybrid+ 194","Électrique 156","Électrique 170","Électrique 204","Électrique 245","Électrique 510","Électrique 544"],models:[["MG3|2024",[2]],["MG4|2022",[3,4,5]],["ZS|2017",[0,1,4]],["HS|2019",[1,2]],["Cyberster|2024",[7,8]],["Marvel R|2021",[5,6]]]},
{n:"BYD",o:"AS",pool:["Électrique 150","Électrique 204","Électrique 218","Électrique 313","Électrique 530","Hybride 218"],models:[["Atto 3|2022",[1]],["Dolphin|2023",[0,1]],["Seal|2023",[2,3,4]],["Seal U|2024",[1,2,5]],["Han|2022",[3,4]],["Tang|2022",[4]]]},
{n:"Lynk & Co",o:"AS",pool:["PHEV 261","Hybride 245"],models:[["01|2021",[0]],["02|2024",[1,0]]]}
];

function brandModels(b){ return b.models.map(m => { const p=m[0].split("|"); return { name:p[0], y0:+(p[1]||2017), engines:m[1].map(i=>b.pool[i]) }; }); }
function findBrand(n){ return BRANDS.find(b=>b.n===n) || null; }
function findModel(b,name){ return brandModels(b).find(m=>m.name===name) || null; }

/* ===== ÉNERGIE par motorisation ===== */
function energyLabel(e){
  const s = String(e).toLowerCase();
  if (/hybrid|hybride/.test(s)) return "Hybride";
  if (/électrique|electrique|electric|\bev\b|\bbev\b|\bze\b/.test(s)) return "Électrique";
  if (/e-?tech/.test(s)) return "Hybride";
  if (/dci|hdi|bluehdi|tdi|d-4d|skyactiv-d|multijet|diesel|cdi|\b\d+d\b|td\b/.test(s)) return "Diesel";
  if (/gpl|lpg/.test(s)) return "GPL";
  return "Essence";
}

const DTC = {
  thermal_common:[["P0101","Débitmètre d'air — plage/performance"],["P0102","Débitmètre d'air — signal bas"],["P0113","Température air admission — signal haut"],["P0118","Température LDR — signal haut"],["P0128","Thermostat — sous régulation"],["P0217","Surchauffe moteur"],["P0505","Régulation ralenti"],["P0562","Tension système basse (12V)"],["P0606","Calculateur — défaillance interne"],["P0700","Boîte — demande voyant"],["P0741","Convertisseur de couple — performance"]],
  essence:[["P0171","Mélange trop pauvre"],["P0172","Mélange trop riche"],["P0300","Ratés d'allumage aléatoires"],["P0301","Ratés cylindre 1"],["P0351","Bobine d'allumage A"],["P0420","Catalyseur — rendement sous seuil"],["P0442","Evaporatif — petite fuite"],["P0340","Capteur AAC — circuit"],["P0016","Vilebrequin/AAC — corrélation"]],
  diesel:[["P0087","Rampe carburant — pression basse"],["P0201","Injecteur cyl 1 — circuit"],["P0202","Injecteur cyl 2 — circuit"],["P2463","FAP — suie accumulée"],["P2002","FAP — rendement sous seuil"],["P2047","Injecteur AdBlue — circuit"],["P204C","AdBlue — pression pompe"],["P20EE","AdBlue — rendement NOx"],["P0380","Préchauffage — circuit"],["P0016","Vilebrequin/AAC — corrélation"]],
  hybrid:[["P0A0F","Démarrage impossible — HV faible"],["P0A80","Batterie HV — remplacement"],["P0A7E","Batterie HV — surchauffe"],["P1A00","Batterie HV — équilibrage"],["P0A1D","Module contrôle HV"]],
  electric:[["P0A0F","Impossibilité démarrage — HV"],["P0A80","Batterie HV — remplacement"],["P0A7E","Batterie HV — surchauffe"],["P0AA6","Isolation HV — défaillance"],["P0C00","Chargeur AC — performance"],["P0C29","Charge — interruption"],["P0C4A","Charge — temps anormal"],["P1A00","BMS — équilibrage"],["P1A15","BMS — calibration SOC"],["U0110","Perte comm onduleur"],["U0111","Perte comm batterie HV"],["U0112","Perte comm BMS"],["P0562","Tension 12V basse"],["P0A1D","Module contrôle HV"],["P0C1F","Charge — verrou connecteur"],["P0C24","Charge — température batterie"]]
};

const SYS = {
  thermal:[
    {comp:"Système d'injection",fault:"Pression/qualité carburation hors plage",symptoms:["Ratés","Perte puissance","Voyant moteur"],causes:["Injecteurs encrassés","Pompe HP fatiguée","Capteur pression HS"],fixes:["Nettoyage/remplacement injecteurs","Contrôle pompe HP"],dtcs:["P0201","P0087"],sev:3},
    {comp:"Distribution (chaîne/courroie)",fault:"Usure/élongation distribution",symptoms:["Claquement à froid","Voyant"],causes:["Tendeur fatigué","Lubrification insuffisante"],fixes:["Kit distribution","Contrôle lubrification"],dtcs:["P0016","P0340"],sev:4},
    {comp:"Lubrification",fault:"Pression d'huile insuffisante",symptoms:["Voyant huile","Bruits"],causes:["Pompe à huile usée","Crépine colmatée"],fixes:["Contrôle pression","Remplacement pompe/crépine"],dtcs:["P0520","P0524"],sev:4},
    {comp:"Refroidissement",fault:"Température hors régulation",symptoms:["Surchauffe","Voyant"],causes:["Pompe à eau HS","Thermostat bloqué"],fixes:["Remplacement pompe/thermostat"],dtcs:["P0128","P0217"],sev:3},
    {comp:"Admission / turbo",fault:"Suralimentation hors plage",symptoms:["Perte puissance","Fumée"],causes:["Turbo fatigué","EGR encrassée"],fixes:["Contrôle turbo","Nettoyage EGR"],dtcs:["P0299","P0401"],sev:3},
    {comp:"Boîte / transmission",fault:"Anomalie transmission",symptoms:["À-coups","Voyant boîte"],causes:["Mécatronique usée","Huile dégradée"],fixes:["Vidange boîte/MAJ"],dtcs:["P0700","P0741"],sev:3}],
  diesel_extra:[
    {comp:"FAP / dépollution",fault:"Encrassement/restriction FAP",symptoms:["Voyant FAP","Régénérations fréquentes"],causes:["Cycles courts","Sonde différentielle HS"],fixes:["Régénération forcée","Nettoyage FAP"],dtcs:["P2463","P2002"],sev:3},
    {comp:"AdBlue / SCR",fault:"Dépollution NOx hors plage",symptoms:["Message AdBlue","Bridage"],causes:["Pompe AdBlue HS","Cristallisation"],fixes:["Remplacement pompe AdBlue"],dtcs:["P204C","P20EE"],sev:3},
    {comp:"Injection haute pression",fault:"Pression rampe hors plage",symptoms:["Démarrage difficile"],causes:["Pompe HP usée","Régulateur HS"],fixes:["Contrôle pression rampe"],dtcs:["P0087","P0088"],sev:4},
    {comp:"Préchauffage",fault:"Bougies de préchauffage HS",symptoms:["Démarrage difficile à froid"],causes:["Bougies usées","Relais HS"],fixes:["Remplacement bougies"],dtcs:["P0380","P0671"],sev:2}],
  essence_extra:[
    {comp:"Allumage",fault:"Ratés / bobines",symptoms:["Ratés","Vibrations"],causes:["Bobines HS","Bougies usées"],fixes:["Remplacement bobines/bougies"],dtcs:["P0300","P0351"],sev:3},
    {comp:"Mélange / carburation",fault:"Mélange pauvre/riche",symptoms:["Consommation","Voyant"],causes:["Fuite admission","Sonde lambda HS"],fixes:["Contrôle étanchéité","Sonde lambda"],dtcs:["P0171","P0172"],sev:2},
    {comp:"Catalyseur",fault:"Rendement catalyseur sous seuil",symptoms:["Voyant"],causes:["Catalyseur usé"],fixes:["Contrôle catalyseur"],dtcs:["P0420","P0430"],sev:2}],
  hybrid_extra:[
    {comp:"Batterie HV / hybride",fault:"Capacité/équilibrage HV",symptoms:["Perte hybride","Voyant"],causes:["Cellules fatiguées"],fixes:["Équilibrage modules"],dtcs:["P0A80","P0A7E"],sev:3},
    {comp:"Onduleur / conversion",fault:"Conversion HV hors plage",symptoms:["Perte propulsion"],causes:["Onduleur HS"],fixes:["Contrôle onduleur"],dtcs:["P0A1D","P1A00"],sev:3}],
  electric:[
    {comp:"Batterie haute tension",fault:"Capacité/isolation HV",symptoms:["Autonomie réduite","Voyant HV","Bridage"],causes:["Cellules fatiguées","Isolation dégradée"],fixes:["Diagnostic capacité/isolation"],dtcs:["P0A80","P0AA6","P1A00"],sev:4},
    {comp:"BMS / gestion batterie",fault:"Calibration SOC / comm BMS",symptoms:["Autonomie erratique"],causes:["Calibration SOC"],fixes:["Recalibration SOC/MAJ"],dtcs:["P1A15","U0112"],sev:3},
    {comp:"Chargeur embarqué (AC)",fault:"Charge AC interrompue/lente",symptoms:["Charge impossible"],causes:["Chargeur HS"],fixes:["Contrôle chargeur/MAJ"],dtcs:["P0C00","P0C29"],sev:3},
    {comp:"Onduleur / moteur électrique",fault:"Conversion/moteur hors plage",symptoms:["Perte propulsion"],causes:["Onduleur HS"],fixes:["Contrôle onduleur"],dtcs:["P0A1D","U0110"],sev:4},
    {comp:"Gestion thermique batterie",fault:"Refroidissement HV hors plage",symptoms:["Bridage charge"],causes:["Pompe thermique HS"],fixes:["Contrôle pompe/valve"],dtcs:["P0C24","P0A7E"],sev:3},
    {comp:"Batterie 12V / DC-DC",fault:"Tension 12V basse",symptoms:["Démarrage impossible"],causes:["12V fatiguée","DC-DC HS"],fixes:["Remplacement 12V"],dtcs:["P0562"],sev:3},
    {comp:"Connecteur / verrou de charge",fault:"Verrouillage charge",symptoms:["Charge interrompue"],causes:["Verrou HS"],fixes:["Contrôle verrou"],dtcs:["P0C1F"],sev:2}]
};

const DT = (() => {
  const SEVL = ["Mineure","Modérée","Sérieuse","Critique"];
  const energyOf = e => energyLabel(e);
  const fuelOf = e => energyLabel(e);

  function faultsForVehicle(brand, modelKey, engine){
    const en = energyLabel(engine);
    let pool;
    if (en==="Électrique") pool = DTC.electric;
    else if (en==="Hybride") pool = DTC.hybrid.concat(DTC.thermal_common, DTC.essence.slice(0,4));
    else if (en==="Diesel") pool = DTC.diesel.concat(DTC.thermal_common);
    else pool = DTC.essence.concat(DTC.thermal_common);
    return { fuel: en, faults: pool.map(p => ({ key:p[0], code:p[0], title:p[1], sev:3, sevLabel:SEVL[2],
      brands:[brand], motors:[engine], years:"2017-2026", generic:false, brand:brand,
      symptoms:["Voyant moteur/propulsion"], causes:["Voir pannes système"], solutions:["Lecture DTC + diagnostic"] })) };
  }
  function systemFaultsFor(brand, modelKey, engine){
    const en = energyLabel(engine);
    let list;
    if (en==="Électrique") list = SYS.electric;
    else if (en==="Hybride") list = SYS.thermal.concat(SYS.essence_extra, SYS.hybrid_extra);
    else if (en==="Diesel") list = SYS.thermal.concat(SYS.diesel_extra);
    else list = SYS.thermal.concat(SYS.essence_extra);
    return list.map(x => Object.assign({}, x, { sevLabel: SEVL[x.sev-1] }));
  }

  function codeFromIndex(i){ const L=["P","B","C","U"][Math.floor(i/4000)%4]; return L + String(i%4000).padStart(4,"0"); }
  function genericTitle(code){
    const L=code[0], n=+code.slice(1);
    if(L==="P"){ if(n<100)return "Powertrain — capteur/débit"; if(n<200)return "Powertrain — mélange/carburation"; if(n<300)return "Powertrain — injection/allumage"; if(n<400)return "Powertrain — dépollution"; if(n<500)return "Powertrain — vitesse/ralenti"; if(n<700)return "Powertrain — calculateur"; if(n<800)return "Powertrain — transmission"; if(n<3000)return "Powertrain — hybride/HV"; return "Powertrain — constructeur"; }
    if(L==="B")return "Carrosserie — habitacle"; if(L==="C")return "Châssis — freinage/tenue"; return "Réseau — communication";
  }
  function ficheAt(i){ const code=codeFromIndex(i); const t=genericTitle(code);
    return { key:code, code, title:t, desc:t+" — fiche générique OBD-II.", sev:2, sevLabel:SEVL[1], brands:["Toutes marques"], motors:["Essence","Diesel","Hybride","Électrique"], years:"2017-2026", generic:true, brand:"", symptoms:["Voyant"], causes:["Selon système"], solutions:["Lecture DTC"] }; }
  function ficheFromCode(code){
    if(!/^[PBCU]\d{4}$/.test(code)) return null;
    const li=["P","B","C","U"].indexOf(code[0]); const num=+code.slice(1);
    if(num>=4000) return null;
    return ficheAt(li*4000+num);
  }
  function findByCode(code){ code=code.toUpperCase(); const f=ficheFromCode(code); return f?[{key:code}]:[]; }
  return { energyOf, fuelOf, faultsForVehicle, systemFaultsFor, codeFromIndex, ficheAt, ficheFromCode, findByCode };
})();
function systemFaultsFor(b,m,e){ return DT.systemFaultsFor(b,m,e); }

function resolveFiche(key){
  if (Store.isDeleted(key)) return null;
  const ov = Store.getOverride(key); if (ov) return ov;
  const cu = Store.customs().find(c=>c.key===key); if (cu) return cu;
  if (key.includes("@")){ const [code,brand]=key.split("@"); const base=DT.ficheFromCode(code); if(!base) return null;
    return Object.assign({}, base, { key, brand, brands:[brand], title:"["+brand+"] "+base.title }); }
  return DT.ficheFromCode(key);
}
