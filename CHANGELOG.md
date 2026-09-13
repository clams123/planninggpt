# Historique des versions

## 2.0.0

### Compléments de la refonte

- L’image de fond dispose désormais du même éditeur non destructif que les cartes : déplacement libre, zoom, étirement horizontal et vertical, avec un rendu DOM identique dans l’aperçu et le PNG.
- L’éditeur de cadrage permet désormais de choisir directement entre remplir le cadre, afficher toute l’image ou l’étirer sans zone vide. Les bandes quadrillées du mode image entière sont expliquées et ce choix est conservé dans le planning comme dans le PNG.
- Chaque jour possède maintenant une couleur de carte indépendante dans le panneau Planning. Un raccourci de composition libre sépare ou regroupe en une fois les textes de tous les jours visibles afin de déplacer séparément cartes, noms, horaires, titres et notes.
- Ajout de deux modèles conçus pour les plannings illustrés à deux jours : « Duel néon », technologique bleu/rouge avec cadres lumineux et séparation VS, et « Duo astral », magique bleu/rose avec anneaux, astres, papillons et ornement central. Ils reprennent les deux jours déjà choisis ou proposent mardi et samedi par défaut.
- Ajout des textes de jour détachables : nom, horaire, titre et note deviennent des calques indépendants, librement déplaçables tout en restant synchronisés avec les données du jour. Un second clic les regroupe dans la carte.
- Les nouvelles images de jour utilisent désormais « Afficher l’image entière sans découpe » par défaut afin d’éviter les cadrages incomplets ; les autres adaptations restent disponibles.
- Tous les calques des modèles sont désormais déverrouillés par défaut. Les anciennes sauvegardes V2 sont migrées automatiquement, sans modifier le verrouillage des calques personnels.
- Retrait du canvas raster qui recouvrait l’éditeur et défigurait les modèles avec de grands aplats rectangulaires : l’aperçu redevient le véritable rendu HTML/CSS interactif.
- Nouveau moteur PNG auto-contenu : clonage du DOM, intégration des styles calculés et des pseudo-éléments, puis rasterisation d’un SVG encodé en `data:` pour rester compatible avec une ouverture locale.
- Correction des attributs typographiques contenant des familles entre guillemets, qui produisaient un HTML invalide et empêchaient la sérialisation fidèle de certaines polices.
- Suppression des réglages « Espacement des lettres » et « Assombrir l’image » de l’inspecteur. Les espacements propres aux modèles restent intégrés à leur direction artistique.
- Refonte de « Twitch Live » avec logo Twitch vectoriel, identité intégralement violette et suppression du rouge, du compteur de spectateurs et du nombre de chaînes.
- Remplacement complet de « Constellation » par « Résonance WuWa » : ambiance claire techno-organique, ondes, anneaux, panneaux indépendants et suppression de la toile d’étoiles.
- Réduction de 5 % de la hauteur des aperçus de modèles dans le menu.
- Correction de la sortie de « Duo et + » : sélectionner un autre modèle réaffiche automatiquement les sept jours de la semaine.
- Ajout du modèle « Fantasy VII » avec direction fantasy industrielle originale, énergie verte, panneaux asymétriques, réacteur et épée vectorielle monumentale.
- Refonte de Constellation autour d’un tracé réel de la Grande Ourse : sept étoiles identifiées et liaisons exportées dans le PNG.
- Ajout de huit emojis : épées, aile, ciel étoilé, éclair, potion, ville et loup.
- Transformation d’Affiche duo en « Duo et + » : choix libre de deux à sept jours, réorganisation automatique et migration des anciennes compositions à deux cartes.
- Simplification de l’affichage des jours : commande visible sous chaque jour, compteur hebdomadaire, « Tout afficher » et « Masquer les repos », sans suppression des données ni de la position des cartes.
- Placement de « Réinitialiser le planning » directement sous « Jour star », sans icône ni doublon dans la barre supérieure.
- Ajout de six emojis : microphone, violon, partition, note musicale, crâne et cassette VHS.
- Correction du faux effet de texte doublé avec Saison anime et Subathon lorsque la typographie globale reste sur « Style du modèle », y compris pour les projets déjà sauvegardés.
- Ajout du modèle « Partition de violon » avec papier ivoire, portées, barres de mesure, notes, clé musicale, violon et typographie classique.
- Enrichissement de Partition de violon : double cadre gravé, mouvements Allegro et Andante, mesures romaines, filigrane vectoriel de violon, archet et cartouches façon feuille de concert.
- Refonte structurelle de Colonnes gaming et Grille pop, et remplacement de Collage pastel par Horreur VHS avec scanlines, repères REC et composition asymétrique.
- Ajout de quatre dispositions de contenu par carte et de la visibilité indépendante des textes.
- Fermeture par défaut des panneaux « Personnaliser le modèle » et « Arrière-plan du planning ».
- Simplification de l’édition des jours : le choix d’un jour sélectionne désormais immédiatement sa carte sur le planning.
- Transformation des images de jour en véritables fonds de carte, automatiquement découpés selon la taille et la forme de chaque modèle.
- Ajout d’une image de fond globale avec adaptation au planning et d’un mode fond transparent conservé dans l’export PNG.
- Conservation des images, textes, formes et emojis personnels lors d’un changement de modèle.
- Alignement du rendu PNG des modificateurs Anime, Marathon, Sortie de jeu, Subathon, Challenge, Ticket et RPG avec l’aperçu.
- Sécurisation du stockage des images, migration des anciennes images intégrées, signalement des fichiers manquants et nettoyage des ressources orphelines.
- Retour des images liées aux jours avec adaptation au cadre, remplacement, suppression et recadrage non destructif.
- Ajout d’un contrôle pré-export pour les débordements, images manquantes, QR invalides et textes potentiellement coupés.
- Réorganisation des calques par glisser-déposer et navigation clavier améliorée.
- Inspecteur contextuel : les couleurs sans effet sont désormais masquées selon le type de calque.
- Optimisation du déplacement et du redimensionnement sans reconstruction complète du canvas à chaque mouvement.
- Ajout de dix emojis supplémentaires et retrait complet des trois illustrations bitmap d’origine.
- Recomposition des modèles Cloud gaming, Cyber HUD, Quête fantasy, Cozy desk et Mur Polaroid avec des emojis et formes intégrés.
- Suppression du libellé décoratif « LIVE SCHEDULE » du modèle Cyber HUD.
- Retour du QR Code sous forme de calque local, déplaçable, redimensionnable, recolorable et exporté dans le PNG.
- Retour du recadrage non destructif des images avec zoom, déplacement, étirement, choix d’adaptation au cadre et remplacement du fichier.
- Synchronisation du cadrage entre l’éditeur et l’export PNG.
- Correction des lignes décoratives fines qui grossissaient lors d’un changement d’opacité, notamment dans Cyber HUD.
- Regroupement des modificateurs et de la typographie globale sous les modèles via deux menus déroulants.
- Remplacement des presets Pop, Pixel et Cinéma trop proches par Moderne, Machine, BD et Condensée, basés sur des familles système nettement distinctes.
- Ajout du déplacement direct des jours, d’une remise à zéro de la mise en page et d’un sélecteur de calque fixe en haut de l’inspecteur.
- Retrait des deux pavés de flèches redondants pour alléger les panneaux Planning et Calque.
- Correction du masque arrondi qui coupait les noms des jours du modèle Constellation.
- Passage de six à dix modèles avec Agenda éditorial, Mur Polaroid, Parcours live et Constellation.
- Les presets typographiques s’appliquent désormais explicitement à l’ensemble du planning et affichent leur état actif.
- Correction de la graisse typographique des cartes et harmonisation du rendu éditeur/PNG.
- Retour des onze modificateurs de thème de l’ancien PlanningGPT, utilisables sur les dix modèles V2.
- Retour du jour star avec mise en avant dans l’éditeur et le PNG.
- Ajout d’un bandeau spécial et de libellés contextuels masquables.
- Extension de l’outil texte avec neuf familles, graisse, italique, casse, alignement, effets et six presets.
- Migration des modificateurs et jours star depuis les anciennes sauvegardes.

### Socle initial

- Refonte complète en studio créatif à trois zones.
- Nouveau canvas à calques avec déplacement, redimensionnement et navigation clavier.
- Six modèles dont la composition, les cartes et les décorations sont différentes.
- Bibliothèque de texte, formes et emojis.
- Import d’images personnelles avec stockage IndexedDB.
- Inspecteur de position, taille, rotation, opacité, couleur et typographie.
- Verrouillage, ordre, duplication et suppression des calques.
- Formats 16:9 et carré, zoom et grille magnétique.
- Migration du contenu textuel des sauvegardes V1.
- Export PNG unique pour cette première version.

Les anciennes versions numérotées 26 à 31 correspondent désormais à la génération V1 historique.

## 31.0.0

- Images déplacées vers IndexedDB pour éviter la limite de `localStorage`.
- Historique Annuler/Rétablir allégé : les données d’image ne sont plus copiées dans chaque état.
- Migration automatique des anciennes sauvegardes contenant des images.
- Export et import d’un projet complet au format JSON.
- Champ Twitch du QR séparé du sous-titre, avec validation visible.
- Navigation clavier du recadrage et valeurs accessibles des curseurs.
- Focus contenu dans les fenêtres modales et arrière-plan rendu inerte.
- Libellé accessible dynamique du planning.
- Métadonnées, favicon local et politique de sécurité ajoutés.
- Double gestionnaire de redimensionnement supprimé.
- Tests statiques de cohérence ajoutés.

## 30.x

- Galerie de thèmes, nouveaux modificateurs, couleur de texte par jour.
- Correctifs successifs de fidélité entre aperçu et export PNG.
- Correctifs du halo, des libellés spéciaux, du QR et des cartes mises en avant.

## 29.x

- Recadrage indépendant pour les vues grille et liste.
- Zoom, déplacement et étirement non destructifs des images.

## 28.x

- Nouveaux thèmes, avertissements de débordement et aperçu responsive.
- Améliorations de l’export PNG et du QR local.

## 26–27

- Base hors ligne, compression des images, favoris, historique et modes spéciaux.
