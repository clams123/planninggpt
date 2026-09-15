# Historique des versions

## 2.0.7 — Lisibilité pop et fidélité des textes séparés

- « Grille pop » utilise une typographie plus nette dans les cartes ; les ombres épaisses, le contour des horaires et les traits qui traversaient les textes sont supprimés, y compris sur les plannings déjà enregistrés.
- Lorsqu’un texte de jour est séparé, son fond, ses bordures, arrondis, espacements, ombres et autres attributs visuels sont copiés depuis la carte puis conservés dans le projet et le PNG.
- Les anciens calques déjà séparés retrouvent les principaux accents visuels de « RPG », « Colonnes gaming », « Grille pop », « Twitch Live », « Duel néon », « Duo astral » et « Partition de violon ».

## 2.0.6 — Partition de violon mieux espacée

- La seconde portée, sa clé, ses notes et son intitulé « II. ANDANTE » sont abaissés pour ne plus empiéter sur la première rangée.
- Les cartes Vendredi, Samedi et Dimanche suivent ce décalage ; en 16:9, leur hauteur est légèrement réduite pour garder le bas de page lisible.
- Les projets « Partition de violon » déjà enregistrés migrent uniquement leurs calques intégrés restés à leurs positions d’origine ; les déplacements personnels et les verrouillages manuels sont préservés.

## 2.0.5 — Emojis fantasy accessibles dans Éléments

- L’épée et les cœurs vert et rouge sont disponibles côte à côte en tête de la bibliothèque « Éléments ».
- La bibliothèque passe de 37 à 39 emojis ; l’épée déjà présente a été déplacée pour être plus facile à trouver, sans créer de doublon.

## 2.0.4 — RPG et textes de duo indépendants

- « Arcade night » est remplacé par « RPG », inspiré de Zelda : palette forêt et or, cartes de journal de quête, emblème triangulaire, épée, cœurs et composition en deux rangées.
- Les textes séparés des cartes « Duel néon » et « Duo astral » conservent leurs plaques, halos et accents visuels après « Séparer les textes de ce jour ».
- La clé interne du modèle remplacé reste compatible avec les projets enregistrés ; la nouvelle composition apparaît lors de la sélection du modèle.

## 2.0.3 — Grille pop et Colonnes gaming nouvelle génération

- Refonte complète du modèle « Grille pop » autour d’une direction pop-culture et gaming beaucoup plus spectaculaire.
- Nouvelle palette électrique mêlant violet profond, bleu arcade, cyan, rose, jaune, vert et orange.
- Nouvelle composition en deux rangées de quatre puis trois cartes, adaptée séparément aux formats 16:9 et carré.
- Cartes façon cases de comic avec rotations légères, bordures blanches, ombres franches, trames halftone et badges arrondis.
- Titre transformé en véritable logo d’affiche avec capitales, contraste jaune, ombre dure et sous-titre cyan.
- Ajout de rails néon, pixels colorés, pastilles, barres inclinées et slogans « POP! PLAY! REPEAT! » et « PRESS START ».
- Ajout d’ornements gaming et pop avec manette, alien pixelisé et éclair.
- Nouvel aperçu de modèle cohérent avec cette identité visuelle.
- Ajout de l’alien de Space Invaders à la bibliothèque des emojis disponibles.
- Refonte de « Colonnes gaming » en écran de sélection de joueurs coloré, avec sept cartes-univers, accents individuels, halos, badges, reliefs arcade et hauteurs rythmées.
- Nouveau titre « PLAYER SELECT », signature « 7 JOURS • 7 UNIVERS • 1 AVENTURE » et décorations manette, trophée, alien et traînées colorées.

## 2.0.2 — Refonte complète de PlanningGPT

PlanningGPT 2.0.2 transforme l’ancien générateur de planning en un studio créatif local à calques. Cette entrée regroupe la refonte et toutes les améliorations intégrées depuis son lancement. L’historique des versions antérieures à la V2 a été retiré.

### Nouveau studio créatif

- Nouvelle interface organisée autour de trois zones : outils à gauche, canvas central et inspecteur contextuel à droite.
- Quatre panneaux spécialisés : « Planning », « Modèles », « Design » et « Éléments ».
- Déplacement et redimensionnement directs des éléments sur le canvas, avec navigation au clavier.
- Formats 16:9 et carré, zoom de 20 à 120 % et grille magnétique facultative.
- Historique Annuler/Rétablir et sauvegarde locale automatique du projet.
- Sélecteur du calque actif placé en haut de l’inspecteur pour accéder rapidement à un élément.
- Gestion de l’ordre des calques par glisser-déposer, sans pavés de flèches redondants.
- Duplication, suppression et verrouillage manuel des éléments.
- Tous les calques des modèles sont déverrouillés par défaut, y compris leurs décorations.
- Les anciens projets V2 sont migrés automatiquement pour déverrouiller leurs calques intégrés sans modifier les calques personnels.
- Les éléments personnels sont conservés lors d’un changement de modèle.
- Remise à zéro de la disposition d’un modèle sans supprimer les éléments ajoutés par l’utilisateur.
- Réinitialisation complète du planning avec confirmation, depuis un bouton sans icône placé en bas du panneau Planning.

### Ergonomie du panneau Planning

- Sélection d’un jour depuis une rangée hebdomadaire compacte ; sa carte est immédiatement sélectionnée sur le canvas.
- Affichage ou masquage individuel de chaque jour sans supprimer son contenu ni sa position.
- Compteur des jours visibles et raccourcis « Tout afficher » et « Masquer les repos ».
- Le modèle « Duo et + » accepte librement de deux à sept jours et réorganise automatiquement les cartes.
- Le passage d’un modèle Duo à un autre modèle réaffiche automatiquement toute la semaine.
- « QR Code » et « Jour star » sont regroupés côte à côte au-dessus de la réinitialisation.
- Les descriptions superflues de « QR Code » et « Jour star » ont été retirées.
- Le champ du lien QR apparaît uniquement lorsque la fonction est activée.
- « Personnaliser le modèle » et « Arrière-plan du planning » ont été déplacés dans le panneau Design afin d’éviter un défilement excessif.
- Ces deux sections sont repliées par défaut.
- Retrait des commandes de déplacement par flèches et des explications devenues inutiles.

### Jours, cartes et composition libre

- Modification indépendante du nom, de l’horaire, du statut, du jeu ou de la catégorie et de la note de chaque jour.
- Couleur de fond personnalisable séparément pour chaque carte.
- Quatre compositions de carte : classique, affiche illustrée, jour en vedette et image seule.
- Affichage indépendant du nom du jour, de l’horaire, du titre et de la note.
- Application d’une composition à toutes les cartes en un clic.
- Séparation du nom, de l’horaire, du titre et de la note en véritables calques déplaçables indépendamment de la carte.
- Les textes séparés restent synchronisés avec les données du jour et conservent la typographie calculée du modèle.
- Possibilité de regrouper à nouveau les textes dans leur carte.
- Activation de la composition libre pour un seul jour ou pour tous les jours visibles.
- Le « Jour star » met la carte choisie en avant dans l’éditeur et dans le PNG, avec une interprétation adaptée aux modificateurs.

### Images de jour et arrière-plan

- Chaque jour peut recevoir sa propre image, utilisée comme véritable fond et automatiquement adaptée à la taille et à la forme de la carte.
- L’opacité de chaque image de jour est réglable de 0 à 100 % sans modifier les textes, la bordure ou le fond de la carte.
- À 0 %, l’image et son voile de lisibilité disparaissent entièrement ; la carte retrouve exactement l’apparence et les couleurs prévues par le modèle.
- Les nouvelles images de jour sont affichées entièrement, sans découpe, par défaut.
- Trois adaptations disponibles : remplir le cadre, afficher toute l’image ou l’étirer sans zone vide.
- Éditeur de cadrage non destructif commun aux images de jour, aux images personnelles et au fond du planning.
- Déplacement libre, zoom de 10 à 300 % et étirement horizontal ou vertical sans modifier le fichier original.
- Remplacement d’une image en conservant le calque, ses dimensions et son cadrage.
- Possibilité de retirer une image ou de réinitialiser son cadrage.
- Image de fond globale réglable avec les mêmes outils que les cartes.
- Opacité de l’image de fond globale réglable de 0 à 100 % sans atténuer les autres éléments du planning.
- Mode fond transparent, conservé dans le PNG final.
- Explication des zones quadrillées visibles lorsque les proportions de l’image et du cadre diffèrent.
- Stockage des images dans IndexedDB afin d’éviter la limite de `localStorage`.
- Migration automatique des anciennes images intégrées aux sauvegardes.
- Détection des images manquantes et nettoyage automatique des ressources devenues orphelines.
- Refus explicite d’un import lorsque l’image ne peut pas être stockée durablement sur l’appareil.

### Modèles

- Dix-huit modèles complets et structurellement différents :
  - Cloud gaming ;
  - Cyber HUD ;
  - Twitch Live ;
  - Manga pop ;
  - Cozy desk ;
  - Arcade night ;
  - Agenda éditorial ;
  - Mur Polaroid ;
  - Parcours live ;
  - Résonance WuWa ;
  - Duo et + ;
  - Colonnes gaming ;
  - Grille pop ;
  - Horreur VHS ;
  - Partition de violon ;
  - Fantasy VII ;
  - Duel néon ;
  - Duo astral.
- Réduction de 5 % de la hauteur des aperçus dans la galerie des modèles.
- Recomposition de Cloud gaming, Cyber HUD, Cozy desk et Mur Polaroid avec des formes et emojis locaux.
- Suppression du libellé décoratif « LIVE SCHEDULE » de Cyber HUD.
- Correction des lignes décoratives fines de Cyber HUD qui grossissaient lors d’un changement d’opacité.
- Refonte de Twitch Live avec logo Twitch vectoriel, identité violette et suppression du rouge, des compteurs de spectateurs et des métriques anxiogènes.
- Remplacement de Constellation par Résonance WuWa, une composition claire et techno-organique faite d’ondes, d’anneaux et de panneaux indépendants.
- Refonte structurelle de Colonnes gaming et Grille pop afin de leur donner une composition propre.
- Remplacement de Collage pastel par Horreur VHS avec scanlines, repères REC et cartes asymétriques.
- Enrichissement de Partition de violon : papier ivoire, double cadre gravé, deux mouvements, portées, barres de mesure, mesures romaines, notes, clés musicales, cartouches, archet et violon vectoriel en filigrane.
- Ajout de Fantasy VII avec une direction fantasy industrielle originale, énergie verte, panneaux asymétriques, réacteur et épée vectorielle monumentale.
- Ajout de Duel néon pour les plannings à deux jours, avec opposition bleu/rouge, cadres technologiques lumineux et séparation VS.
- Ajout de Duo astral pour les plannings à deux jours, avec univers magique bleu/rose, anneaux, astres, papillons et ornement central.

### Personnalisation des modèles

- Douze états de modificateur : original, affiche événement, ticket cinéma, menu restaurant, quête RPG, journal de bord, saison anime, marathon, sortie de jeu, subathon, découverte indépendante et challenge.
- Bandeau spécial personnalisable et libellés contextuels masquables.
- Alignement des effets des modificateurs entre l’aperçu et le PNG.
- Correction des textes doublés avec Saison anime et Subathon lorsque la typographie globale utilise le style du modèle.
- Six typographies globales distinctes : Moderne, Élégante, Machine, Manuscrite, Bande dessinée et Condensée.
- Neuf familles locales disponibles pour les calques texte, avec graisse, italique, casse et alignement.
- Cinq effets typographiques : aucun, ombre douce, ombre franche, néon et contour.
- Les réglages typographiques globaux s’appliquent explicitement à tout le planning tout en laissant les calques modifiables individuellement.
- Retrait des options inopérantes « Espacement des lettres » et « Assombrir l’image » de l’interface.
- Les contrôles sans effet pour le type de calque sélectionné sont masqués dans l’inspecteur.

### Éléments et QR Code

- Ajout libre de textes, rectangles, cercles, emojis et images personnelles.
- Bibliothèque de 36 emojis couvrant notamment le streaming, le jeu vidéo, la musique, la fantasy, l’horreur et les univers célestes.
- Suppression complète des trois illustrations bitmap d’origine et de leurs références inutilisées.
- QR Code généré entièrement en local, sans service distant.
- QR Code déplaçable, redimensionnable, recolorable et présent dans le PNG.
- Validation visible du lien avant export.

### Export PNG fidèle à l’éditeur

- Le seul format d’export proposé est le PNG.
- Remplacement de l’ancien moteur raster par la sérialisation du véritable DOM affiché dans l’éditeur.
- Clonage du canvas, intégration des styles calculés et matérialisation des pseudo-éléments avant rasterisation locale.
- Conservation des textes, polices, formes, images, recadrages, transformations, opacités, QR Code et décorations des modèles.
- Synchronisation du cadrage des images entre l’aperçu et l’export.
- Correction des familles typographiques contenant des guillemets qui produisaient un HTML invalide pendant l’export.
- Compatibilité avec une ouverture locale en `file://` grâce à un SVG autonome encodé en `data:`.
- Suppression de la dépendance à html2canvas et du canvas raster qui recouvrait auparavant l’éditeur.
- Contrôle pré-export signalant les éléments hors du planning, les textes potentiellement coupés, les images manquantes et les QR invalides.
- Blocage de l’export uniquement lorsque les erreurs critiques empêchent de produire un PNG fiable.

### Fiabilité, compatibilité et performances

- Application entièrement locale et compatible avec une publication statique sur GitHub Pages.
- Aucune ressource distante nécessaire au fonctionnement, aux modèles, aux polices ou au QR Code.
- Contenu textuel du projet conservé dans `localStorage` et ressources graphiques dans IndexedDB.
- Migration du contenu textuel des anciennes sauvegardes V1 vers le projet V2.
- Optimisation du déplacement et du redimensionnement : le canvas n’est plus entièrement reconstruit à chaque mouvement.
- Taille minimale spécifique aux formes fines afin de préserver les lignes et ornements des modèles.
- Navigation clavier, états accessibles et messages de validation améliorés.
- Versionnement du fichier CSS afin d’éviter qu’un ancien style conservé en cache casse la disposition de l’interface après une mise à jour.
- Suite de tests statiques couvrant la syntaxe, les identifiants HTML, les 18 modèles, les 36 emojis, les modificateurs, les images, le stockage, les calques, le QR Code et l’unicité du moteur PNG.
