# PlanningGPT V2.0.0

PlanningGPT V2 est un studio créatif local spécialisé dans les plannings Twitch. Il associe les données structurées de la semaine à un éditeur visuel inspiré des outils de composition libre.

## Ce que permet la V2

- Modifier le contenu des sept jours indépendamment de la composition graphique.
- Associer une image à chaque jour : elle remplit automatiquement toute la carte et suit directement sa taille et sa forme, tout en restant ajustable sans modifier le fichier original.
- Utiliser le dégradé du modèle, importer une image comme fond global ou exporter le planning sur un fond entièrement transparent.
- Choisir parmi quinze modèles structurellement différents, dont Affiche duo, Colonnes gaming, Grille pop, Horreur VHS et Partition de violon.
- Le modèle Partition de violon compose les sept jours comme des mesures réparties en deux mouvements, avec portées, clés de sol, cadre gravé, ornements et filigrane vectoriel original.
- Recomposer chaque carte en mode classique, affiche illustrée, jour en vedette ou image seule, puis afficher ou masquer séparément le jour, l’horaire, le titre et la note. Une composition peut être appliquée à toutes les cartes en un clic.
- Transformer n’importe quel modèle avec onze modificateurs accessibles directement sous les modèles : affiche, ticket, restaurant, RPG, journal de bord, anime, marathon, sortie de jeu, subathon, découverte indé et challenge.
- Désigner un jour star, mis en avant visuellement et interprété par le modificateur actif.
- Ajouter du texte, des formes et vingt-huit emojis, avec notamment de nouveaux symboles musicaux et VHS.
- Importer ses propres images.
- Recadrer chaque image sans modifier le fichier d’origine : remplissage ou image entière, zoom de 10 à 300 %, déplacement libre et étirement horizontal ou vertical.
- Remplacer une image tout en conservant son calque et ses dimensions.
- Ajouter un QR Code local, déplaçable, redimensionnable et recolorable, inclus dans l’export PNG.
- Déplacer et redimensionner les éléments directement sur le canvas.
- Régler position, taille, rotation, opacité et couleurs.
- Composer une typographie complète : neuf familles locales, graisse, italique, casse, alignement, espacement et cinq effets de texte.
- Appliquer globalement six familles réellement distinctes : Moderne, Élégante, Machine, Manuscrite, Bande dessinée et Condensée. Les réglages fins restent disponibles élément par élément.
- Choisir un jour et sélectionner immédiatement sa carte, puis la déplacer directement sur le planning ou au clavier.
- Réinitialiser la disposition du modèle sans supprimer les éléments ajoutés par l’utilisateur.
- Choisir le calque actif en haut de l’inspecteur, puis modifier immédiatement son contenu et sa typographie.
- Réordonner les calques par glisser-déposer, puis les verrouiller, dupliquer ou supprimer.
- Changer de modèle sans perdre les calques ajoutés personnellement.
- Repérer avant l’export les éléments hors cadre, images manquantes, QR invalides et textes potentiellement coupés.
- Travailler aux formats 16:9 ou carré.
- Utiliser une grille magnétique et un zoom de 20 à 120 %.
- Annuler et rétablir les modifications.
- Réinitialiser entièrement le planning avec le bouton placé directement sous « Jour star », après confirmation explicite.
- Retrouver automatiquement son projet grâce à la sauvegarde locale.
- Nettoyer automatiquement les anciennes images devenues inutiles lors du prochain démarrage.
- Importer automatiquement le contenu textuel d’une ancienne sauvegarde V1.
- Exporter le résultat en PNG.

## Fonctionnement local

Ouvre `index.html` dans un navigateur récent. Aucun serveur et aucune connexion ne sont nécessaires. Les données du projet restent dans `localStorage` et les images personnelles dans IndexedDB.

## Vérification

Avec Node.js :

```bash
npm test
```

Les contrôles vérifient la syntaxe, la cohérence HTML/JavaScript, les modèles, les compositions de carte, les emojis, le QR local, les ressources locales et l’unicité de l’export PNG.

## Structure

- `index.html` : interface du studio.
- `v2.css` : disposition, canvas, éléments et responsive.
- `v2.js` : modèles, calques, manipulation, sauvegarde et export PNG.
- `storage.js` : stockage IndexedDB des images personnelles.
- `libs/qrcode.local.js` : génération locale du QR Code, sans service distant.
- `tests/` : contrats automatiques sans dépendance externe.
- `CHANGELOG.md` : historique synthétique.
