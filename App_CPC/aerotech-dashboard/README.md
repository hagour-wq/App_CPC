# AéroTech Maroc

SPA React 19 / TypeScript strict / Vite 6 / Tailwind CSS 4. Reporting CGNC en MAD depuis les valeurs enregistrées dans Excel, sans serveur ni transmission du fichier lié.

## Installation

Node.js 22 ou supérieur.

```bash
npm install
npm run dev
```

Ouvrir l’URL affichée par Vite, avec le chemin `/aerotech-dashboard/`. Le classeur fourni est chargé en démonstration au démarrage.

```bash
npm test
npm run lint
npm run build
npm run preview
```

## Mise en ligne

Créer un dépôt GitHub nommé `aerotech-dashboard`. Depuis le dossier du projet :

```bash
git init -b main
git add .
git commit -m "Dashboard financier AéroTech"
git remote add origin https://github.com/UTILISATEUR/aerotech-dashboard.git
git push -u origin main
```

Dans Settings → Pages → Source, choisir **GitHub Actions**. Le workflow fourni teste, vérifie et construit le projet, puis publie `dist`. L’adresse sera `https://UTILISATEUR.github.io/aerotech-dashboard/`. Aucun dépôt distant n’est créé automatiquement par cette livraison.

Le classeur de démonstration fourni contient des données fictives et sera public avec le dépôt et le site. Les fichiers liés ensuite restent locaux à chaque utilisateur. Ne pas remplacer le fichier de démonstration public par des données confidentielles.

## Synchronisation Excel

1. Ouvrir le site dans Chrome ou Edge desktop (HTTPS, ou localhost).
2. Cliquer sur **Lier mon fichier Excel**, sélectionner un `.xlsx` ou `.xlsm`.
3. Laisser **Synchronisation Excel** activée.
4. Modifier le fichier dans Excel, puis enregistrer avec Ctrl+S.

Le handle est mémorisé dans IndexedDB. Une vérification des métadonnées a lieu toutes les 1 000 ms. Après un changement, un délai de 400 ms permet à Excel de terminer son écriture. La lecture et le parsing dans un Worker remplacent les données en une seule opération. Trois reprises espacées de 300 / 600 / 1 200 ms sont prévues en cas d’échec. Les macros ne sont jamais exécutées.

En pause, la boucle est arrêtée et aucun nouvel accès au fichier n’est lancé. Une opération déjà lancée peut se terminer, mais son résultat est ignoré. Après rechargement, un clic sur **Reconnecter le fichier** réautorise la lecture si le navigateur le demande, sans réimportation.

**Délai visé : moins de deux secondes** après la fin de l’enregistrement, sur le classeur fourni et une page active. Ce délai n’est pas une garantie : verrouillage Excel, réécriture atomique, charge système, gros fichier et suspension des onglets peuvent le dépasser. Si Excel ou un outil de synchronisation remplace le fichier et invalide le handle, utiliser **Changer de fichier** pour le relier. Aucun navigateur ne permet de garantir un délai maximal sur une page suspendue.

Firefox et Safari proposent un import manuel ; ils n’offrent pas cette liaison locale automatique. Chaque visiteur lie son propre fichier. Le lien GitHub Pages ne partage pas les mises à jour de votre fichier local avec d’autres utilisateurs.

Excel doit être en calcul **Automatique**. Recalculer et enregistrer le classeur avant sa lecture. L’application utilise les caches de formules, sans recalculer les valeurs comptables. Un cache manquant est signalé. Les variations d’affichage mensuelles et positions graphiques sont calculées à partir de ces caches.

## Lecture et ajout d’indicateurs

Les en-têtes et libellés sont normalisés (accents, apostrophes, tirets et espaces). Les mois et l’année sont trouvés par leur libellé. Les sections 1 à 4 structurent le Reporting. Ajouter un KPI dans la section voulue avec son libellé en A, unité en B, repère en C et valeurs dans les colonnes mensuelles et annuelle : il apparaît automatiquement après enregistrement. Les quatre libellés du menu sont ceux demandés dans les consignes ; les contenus sont construits à partir du classeur.

Tous les onglets sont consultables dans **Consulter les onglets sources**. Les données de Balance, CPC, ESG et DASHBOARD sont également exposées dans `FinanceModel`. Les absences de feuilles, de caches et les écarts Reporting/CPC supérieurs à 1 MAD sont signalés. Les repères sont des objectifs du classeur, pas des obligations fiscales ou des références sectorielles vérifiées. Les repères affichés suivent Excel ; leur copie initiale documentée se trouve dans `src/config/thresholds.ts`.

Le waterfall inclut la marge brute commerciale. L’ajustement entre EBE et REX inclut les autres produits/charges et les reprises, en plus des dotations : afficher uniquement les dotations ne permettrait pas de retrouver le REX de ce classeur.

## Interface

Douze mois et Année. Toutes les cartes de la section active. Une jauge mensuelle, deux en annuel sauf section 1. Quatre tendances et un waterfall uniquement en annuel, chargés à la demande. Raccourcis : 1–4, haut/bas pour les sections ; gauche/droite pour les périodes ; A pour Année. Les raccourcis ne détournent pas les touches des contrôles actifs.

Fond blanc, bleu `#001152`, verre, lentilles animées, chiffres immobiles au survol, mouvement réduit respecté. Le menu devient un rail sur tablette et un tiroir sur téléphone. Les polices système évitent une dépendance réseau.

## Architecture

- `src/lib/parse` : extraction des valeurs Excel et rapprochements.
- `src/workers` : SheetJS isolé du thread principal.
- `src/lib/sync` : persistance du handle, surveillance et reprises.
- `src/hooks` : cycle de vie, sélection et interaction.
- `src/store` : store Zustand unique.
- `src/components` : mise en page, cartes, jauges, graphiques différés.
- `src/__tests__` : valeurs du classeur, insertion de ligne, erreurs et surveillance.
- `.github/workflows/deploy.yml` : déploiement GitHub Pages.

## Sources techniques

- https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
- https://docs.sheetjs.com/docs/csf/cell/
- https://docs.sheetjs.com/docs/demos/bigdata/worker/
- https://v6.vite.dev/guide/static-deploy

Les objectifs Lighthouse ≥95 et interactions <100 ms doivent être mesurés sur le site déployé et le matériel cible. La validation automatisée de la surveillance utilise des handles simulés ; un essai réel Excel Ctrl+S sur Windows reste nécessaire pour vérifier le comportement du système de fichiers de l’utilisateur.
