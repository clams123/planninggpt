# Rapport de vérification — PlanningGPT V30.31

## Objectif

Corriger les écarts restants à l’export PNG des modificateurs de thème, sans revenir aux solutions non compatibles GitHub Pages.

## Problèmes ciblés

- Les surcouches manuelles ajoutées au moteur d’export en V30.30 fonçaient certains thèmes, surtout sur les côtés.
- Les pseudo-éléments des cartes étaient appliqués comme des calques plein cadre au lieu de respecter leur géométrie CSS, ce qui pouvait créer des chevauchements.
- Les arrondis asymétriques de certains modes, notamment `Sortie jeu`, n’étaient pas correctement repris à l’export.

## Modifications appliquées

Fichier modifié : `libs/html2canvas.local.js`.

- Suppression des surcouches globales forcées des modificateurs.
- Suppression des surcouches forcées sur les cartes.
- Conservation du rendu des fonds CSS calculés via `getComputedStyle()`.
- Conservation des découpes spécifiques du mode `Ticket de cinéma`.
- Ajout d’une gestion des quatre rayons de bordure séparés : haut-gauche, haut-droite, bas-droite, bas-gauche.
- Application des rayons asymétriques aux clips, bordures, outlines, images et textes.
- Suppression du rendu plein cadre de `dayCard::after`, responsable d’écarts visuels avec certains modificateurs.

## Vérification 1 — structure

- `index.html` : OK
- `style.css` : OK
- `script.js` : OK
- `libs/html2canvas.local.js` : OK
- `libs/qrcode.local.js` : OK
- Dossier `libs/` conservé : OK
- Aucun `.bat` / `.ps1` : OK
- Aucun serveur/API : OK
- Aucun `getDisplayMedia` : OK
- Aucun `foreignObject` : OK

## Vérification 2 — cohérence technique

- Syntaxe `script.js` : OK
- Syntaxe `libs/html2canvas.local.js` : OK
- Syntaxe `libs/qrcode.local.js` : OK
- IDs HTML utilisés par `script.js` : OK
- Thèmes JS présents dans le CSS : OK
- Modes spéciaux présents dans le CSS : OK
- Export PNG local conservé : OK
- Compatible GitHub Pages : OK

## Tests recommandés

- Sakura Dream + Ticket de cinéma
- Sakura Dream + Sortie jeu
- Horreur VHS + Ticket de cinéma
- Horreur VHS + Découverte indé
- Fantasy Ciel Étoilé + Challenge
- Deep Sea + Découverte indé
- Découverte indé + Masquer les textes du modificateur
