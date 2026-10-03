# Vérifications de livraison

- `npm install` : réussi, verrou de dépendances fourni.
- TypeScript strict (`tsc --noEmit`) et `npm run build` : réussis.
- ESLint : réussi.
- Six tests Vitest : réussis.
- Valeurs du classeur : CA 87 975 000 MAD, RN 8 410 200 MAD, marge REX/CA 12,6081 %.
- Insertion d’une ligne et ajout d’un KPI : réussis.
- Feuille manquante et divergence CPC : correctement signalées.
- Synchronisation simulée : actualisation après changement, arrêt des lectures en pause, reprise après verrouillage.
- Classeur livré : identique octet pour octet à la pièce jointe.
- Recharts : séparé dans un chunk annuel chargé à la demande.

## Vérifications restant sur le poste cible

La tentative de contrôle visuel Playwright n’a pas pu démarrer : Chromium absent et téléchargement du navigateur invalide dans cet environnement. Aucun contrôle visuel réel des 52 combinaisons, des largeurs 1 280 / 1 440 / 1 920 px, tablette et mobile, ni score Lighthouse n’est donc revendiqué.

Le test réel avec Excel Windows, enregistrement Ctrl+S, reconnect après rechargement et permissions du navigateur doit être effectué dans Chrome ou Edge. La surveillance a été vérifiée avec des handles simulés. Le délai maximal de deux secondes ne peut pas être garanti en présence d’un fichier verrouillé ou d’un onglet suspendu.

Aucun dépôt GitHub distant ni site public n’a été créé. Le workflow fourni publiera le site après push et activation de GitHub Pages.
