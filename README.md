# Ma Tech by Kevin — PWA / APK diagnostic OBD

21 000 fiches DTC • pannes connues par marque/modèle/motorisation/puissance • campagnes de rappels 2017-2026 • mode admin • accès tiers • mise à jour à distance • 100 % hors ligne avec sauvegarde locale.

## Identifiants
- Admin : `admin` / `Kevin83600`
- Tiers démo : `TIERS-DEMO-2026`

## Images & icônes (obligatoire avant PWABuilder)
1. Ouvrir `tools/generate-icons.html` dans un navigateur : les 6 fichiers se téléchargent.
2. Ranger : 5 PNG dans `assets/icons/`, la capture dans `assets/screenshots/`.

## Déploiement GitHub
1. Uploader tous les fichiers à la racine du dépôt (ex. `ma-tech-by-kevin`).
2. Settings → Pages → branch `main` / `(root)` → Save.
3. URL : `https://<user>.github.io/<repo>/`

## Génération de l'APK « ma-tech-by-kevin »
1. pwabuilder.com → coller l'URL → Package For Stores → Android.
2. App name : `Ma Tech by Kevin` • Package ID : `com.kevin.matech` • version `5.0.0`.
3. Generate → APK/AAB + assetlinks (à mettre dans `.well-known/` avec l'empreinte SHA-256).
4. L'APK installé pointe vers le site : chaque redéploiement met à jour l'appli.

## Connexion & hors ligne
- Service worker « réseau d'abord » : 4G/5G/Wi‑Fi = données fraîches ; sans réseau = cache complet (base embarquée).
- Toutes les modifications (fiches, rappels, codes tiers) sont en sauvegarde locale (localStorage) + export JSON.
- Boutons 🔗 Partager (Web Share / copie du lien) et 📥 Installer (PWA) intégrés.

## Mise à jour des données (admin)
Administration → 📦 Mise à jour APK : pack téléchargé ou publication GitHub directe (jeton).
Application automatique chez tous les utilisateurs (tiers compris) au lancement.
