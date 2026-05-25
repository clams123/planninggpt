# •PlanningGPT• — V30.12 audit clean

Version nettoyée après audit des fichiers sources mis à jour.

## Lancer le projet

Ouvrir simplement `index.html` dans le navigateur.

Structure attendue :

```text
index.html
style.css
script.js
libs/
  html2canvas.local.js
  qrcode.local.js
README_PlanningGPT.md
RAPPORT_VERIFICATION.md
```

## Fonctions conservées

- Fonctionnement local / hors ligne avec les librairies dans `libs/`.
- Export PNG classique et export PNG transparent.
- Correction des angles transparents à l’export.
- Compression automatique des images importées.
- Recadrage manuel grille / liste, zoom, déplacement et étirement ciblé.
- Mise en avant visuelle avec image et recadrage conservé.
- Mode `Découverte indé` corrigé, badge `Prototype` non rogné.
- Galerie miniature des thèmes et favoris de thèmes.
- Couleur d’écriture personnalisée par jour avec reset lors du changement de thème.
- QR code Twitch local.
- Annuler / Rétablir, sauvegarde locale et modale de réinitialisation.

## Nettoyage effectué

- Remise en place de la vraie structure `libs/`, car `index.html` charge `libs/html2canvas.local.js` et `libs/qrcode.local.js`.
- Suppression des restes CSS liés aux modes retirés en V30.7 : `charity`, `tournament`, `collab`, `birthday`, `seasonal`.
- Suppression d’un ancien bloc CSS V30.3 devenu redondant avec la reprise propre V30.7.
- README remis à jour : l’ancien titre indiquait encore V29.4 alors que la base actuelle va jusqu’à V30.12.

## Modes spéciaux actifs

- Affiche d’événement
- Ticket de cinéma
- Menu de restaurant
- Quête RPG
- Journal de bord
- Épisodes d’anime
- Marathon
- Sortie jeu
- Subathon
- Découverte indé
- Challenge

## Notes

Aucun fichier runtime n’a été supprimé. Les deux fichiers du dossier `libs/` sont nécessaires pour conserver l’export PNG et le QR code local.
