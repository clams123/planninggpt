# PlanningGPT V2.0.2

PlanningGPT V2 est un studio créatif local spécialisé dans les plannings Twitch. Il associe les données structurées de la semaine à un éditeur visuel inspiré des outils de composition libre.

## Ce que permet la V2

- Modifier le contenu des sept jours indépendamment de la composition graphique.
- Afficher ou masquer chaque jour directement depuis la rangée hebdomadaire, sans supprimer son contenu, avec des raccourcis pour tout afficher ou masquer les jours de repos.
- Associer une image à chaque jour : elle remplit automatiquement toute la carte et suit directement sa taille et sa forme, tout en restant ajustable sans modifier le fichier original.
- Régler indépendamment l’opacité de l’image de chaque jour sans atténuer les textes, la bordure ou la carte.
- Utiliser le dégradé du modèle, importer une image comme fond global, la déplacer, la zoomer et l’étirer dans le même éditeur non destructif que les images de jour, ou exporter le planning sur un fond entièrement transparent.
- Régler l’opacité de l’image de fond globale indépendamment du reste du planning.
- Choisir parmi dix-huit modèles structurellement différents, dont Twitch Live, Résonance WuWa, Duo et +, Duel néon, Duo astral, Horreur VHS, Partition de violon et Fantasy VII.
- Composer librement Duo et + avec deux à sept jours choisis dans la semaine ; les cartes sont automatiquement recentrées et redimensionnées quand leur nombre change.
- Le modèle Partition de violon compose les sept jours comme des mesures réparties en deux mouvements, avec portées, clés de sol, cadre gravé, ornements et filigrane vectoriel original.
- Le modèle Fantasy VII propose une direction fantasy industrielle originale : énergie verte, acier sombre, cartes asymétriques, réacteur et épée monumentale vectorielle, sans image distante.
- Le modèle Twitch Live reprend les codes de la plateforme avec son logo, une identité intégralement violette, des tuiles de diffusion et des bulles de discussion, sans compteur ni métrique anxiogène.
- Le modèle Résonance WuWa remplace entièrement Constellation par une composition claire, aérienne et techno-organique, faite d’ondes, d’anneaux et de cartes indépendantes.
- Recomposer chaque carte en mode classique, affiche illustrée, jour en vedette ou image seule, puis afficher ou masquer séparément le jour, l’horaire, le titre et la note. Une composition peut être appliquée à toutes les cartes en un clic.
- Transformer n’importe quel modèle avec onze modificateurs accessibles directement sous les modèles : affiche, ticket, restaurant, RPG, journal de bord, anime, marathon, sortie de jeu, subathon, découverte indé et challenge.
- Désigner un jour star, mis en avant visuellement et interprété par le modificateur actif.
- Ajouter du texte, des formes et trente-six emojis, avec notamment de nouveaux symboles fantasy, célestes et urbains.
- Importer ses propres images.
- Recadrer chaque image sans modifier le fichier d’origine : remplissage ou image entière, zoom de 10 à 300 %, déplacement libre et étirement horizontal ou vertical.
- Remplacer une image tout en conservant son calque et ses dimensions.
- Ajouter un QR Code local, déplaçable, redimensionnable et recolorable, inclus dans l’export PNG.
- Déplacer et redimensionner les éléments directement sur le canvas.
- Régler position, taille, rotation, opacité et couleurs.
- Composer une typographie complète : neuf familles locales, graisse, italique, casse, alignement et cinq effets de texte.
- Appliquer globalement six familles réellement distinctes : Moderne, Élégante, Machine, Manuscrite, Bande dessinée et Condensée. Les réglages fins restent disponibles élément par élément.
- Choisir un jour et sélectionner immédiatement sa carte, puis la déplacer directement sur le planning ou au clavier.
- Séparer en un clic le nom du jour, l’horaire, le titre et la note en calques indépendants : chaque texte reste lié aux données du jour mais peut être placé librement, y compris hors de sa carte, puis regroupé à tout moment.
- Afficher les nouvelles images de jour entièrement et sans découpe par défaut, avec les modes remplissage et étirement toujours disponibles.
- Réinitialiser la disposition du modèle sans supprimer les éléments ajoutés par l’utilisateur.
- Choisir le calque actif en haut de l’inspecteur, puis modifier immédiatement son contenu et sa typographie.
- Réordonner les calques par glisser-déposer, puis les verrouiller, dupliquer ou supprimer.
- Commencer avec tous les calques déverrouillés, y compris les décors intégrés aux modèles, puis verrouiller manuellement uniquement ceux qui doivent rester fixes.
- Changer de modèle sans perdre les calques ajoutés personnellement.
- Repérer avant l’export les éléments hors cadre, images manquantes, QR invalides et textes potentiellement coupés.
- Travailler aux formats 16:9 ou carré.
- Utiliser une grille magnétique et un zoom de 20 à 120 %.
- Annuler et rétablir les modifications.
- Réinitialiser entièrement le planning avec le bouton placé directement sous « Jour star », après confirmation explicite.
- Retrouver automatiquement son projet grâce à la sauvegarde locale.
- Nettoyer automatiquement les anciennes images devenues inutiles lors du prochain démarrage.
- Importer automatiquement le contenu textuel d’une ancienne sauvegarde V1.
- Conserver en permanence le véritable aperçu HTML/CSS éditable, puis exporter ce même DOM en PNG avec ses styles calculés, formes, images, transformations et pseudo-éléments matérialisés.

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
