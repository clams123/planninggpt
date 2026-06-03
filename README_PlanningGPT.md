# •PlanningGPT• — V29.4 correction recadrage grille/liste

Version basée sur la V26.2 stable et les ajouts validés de la V27.

## Conservé depuis V26.2

- Outil utilisable hors ligne grâce au dossier `libs/`.
- Export PNG classique conservé.
- Export PNG transparent conservé avec correction des angles blancs.
- Compression automatique des images importées.
- Favoris de thèmes.
- Boutons `Annuler` et `Rétablir` à côté de `Sauvegarder`.
- Modale de réinitialisation intégrée.
- QR code Twitch local.
- Modes spéciaux existants.

## Ajustement V27.2

- Retrait de `Export Vertical`.
- Retrait de `Export txt Discord`.
- Retrait de l’option automatique `Mettre aujourd’hui en avant`.
- Conservation du champ `Bandeau semaine spéciale`.
- Restauration de `Jour star` dans les modes spéciaux, sans changement de rôle.
- Ajout d’une option séparée dans les paramètres du jour : `Mise en avant visuelle`.

## Différence importante

- `Jour star` reste lié aux modes spéciaux : affiche événement, quête RPG, anime, etc.
- `Mise en avant visuelle` est indépendante : elle peut être activée sur un ou plusieurs jours pour les rendre plus visibles dans le planning classique.

## Effet de la mise en avant visuelle

- Le jour est légèrement agrandi.
- Une aura lumineuse est ajoutée.
- La couleur de l’aura s’adapte au thème grâce aux variables visuelles du thème actif.
- Un badge `À ne pas manquer` apparaît sur le jour concerné.

## Fichiers

- `index.html`
- `style.css`
- `script.js`
- `libs/html2canvas.local.js`
- `libs/qrcode.local.js`
- `README_PlanningGPT.md`
- `RAPPORT_VERIFICATION.md`


## V27.3 — Correction alignement bas

- Correction de l'alignement vertical bas en mode grille lorsque la description contient 2 ou 3 lignes.
- Le contenu du jour est maintenant aligné à l'intérieur d'une zone dédiée sous l'en-tête, ce qui évite les chevauchements visuels.
- Les titres sont limités proprement à 2 lignes et les notes à 3 lignes en mode grille.


## V27.4 — Correction alignement bas stable

- Correction de l’alignement bas en mode grille.
- Les heures restent alignées sur la même ligne même si les notes font 0, 1, 2 ou 3 lignes.
- Le jour OFF utilise la même zone de contenu que les autres jours.
- Conservation de Jour star, Mise en avant visuelle, bandeau semaine spéciale et export PNG.


## V27.5 — Ajustement alignement bas

- Conservation de l’alignement commun entre tous les jours.
- Descente visuelle du bloc heure / catégorie / note en mode grille.
- `OFF` reste aligné sur les autres jours.
- Correction limitée au CSS pour ne pas toucher au moteur d’export, à la transparence ou à la compression d’images.


## V27.6 — Alignement bas légèrement descendu

- Ajustement CSS léger de la zone de contenu en mode grille.
- Les heures restent alignées entre tous les jours.
- Le bloc texte est placé un peu plus bas que dans la V27.5.
- Aucun changement sur l'export PNG, la compression images ou le moteur local.


## V28 — Correction anime, alertes texte et thèmes

- Correction du bug visuel en mode spécial `Épisodes d'anime` lorsque la position verticale du texte est réglée sur `Bas`.
- Ajout d'une alerte discrète `Texte à vérifier` dans l'aperçu lorsque certains textes risquent d'être coupés.
- Les seuils d'alerte sont plus tolérants en mode liste, car le texte dispose naturellement de plus de largeur.
- Ajout du thème `Horreur VHS`.
- Ajout du thème `Fantasy Cristal`, inspiration JRPG / Final Fantasy sans logo ni élément officiel.
- Conservation de l'export PNG, de la transparence, de la compression images et du moteur local.

## V28.1 — Correction modes spéciaux en grille

- Correction du texte coupé dans les modes spéciaux en alignement bas.
- Les modes corrigés sont : Affiche événement, Ticket de cinéma, Menu restaurant, Quête RPG, Journal de bord et Épisodes d'anime.
- Le jour OFF utilise désormais la même zone fixe que les autres jours dans ces modes.
- La correction est limitée au CSS : pas de modification de l'export PNG, de la compression images ou du moteur local.

## V28.3 — Correction effective du QR code +20%

- Correction appliquée réellement dans le CSS.
- Les dimensions du QR code passent de `3.4cqw` à `4.08cqw`.
- Cela concerne le SVG du QR, son conteneur et le fallback.
- Aucun changement sur `script.js`, l'export PNG, la compression d'images ou le moteur local.

## V28.4 — QR code agrandi et repositionné

- Agrandissement du QR code de 35% par rapport à la taille V28.3.
- Nouvelle taille appliquée : `5.51cqw`.
- Position du bloc QR mise à jour : `right:6.15cqw;` et `top:6.15cqw;`.
- Correction limitée au CSS.
- Aucun changement sur `script.js`, l’export PNG, la compression images ou le moteur local.


## V28.5 — Thèmes streamer et alertes ajustées

- Renommage du thème `Fantasy Cristal` en `Fantasy Ciel Étoilé`.
- Amélioration du thème `Horreur VHS` : scanlines, ambiance cassette, rouge sombre et léger effet glitch.
- Amélioration du thème `Fantasy Ciel Étoilé` : ciel nocturne, étoiles, reflets cristal et ambiance JRPG / fantasy sans élément officiel.
- Ajustement des alertes anti-débordement : seuils différents pour grille, carré, liste et modes spéciaux.
- En mode liste, les seuils sont volontairement plus larges et les notes ne déclenchent pas d’alerte sur les thèmes liste qui les masquent.
- Conservation de la V28.4 : QR code à `5.51cqw`, `right:6.15cqw`, `top:6.15cqw`.
- Aucun changement sur l’export PNG, la compression images ou le moteur local.

## V28.6 — Aperçu responsive sans scroll global

- L'application prend maintenant toute la hauteur disponible de l'écran.
- L'aperçu en mode grille 16:9 se redimensionne automatiquement selon l'espace disponible.
- Le format carré se redimensionne aussi automatiquement dans l'aperçu.
- Le scroll global de la page est supprimé sur desktop : le panneau de gauche possède son propre défilement si nécessaire.
- Le mode liste conserve un comportement plus souple, car son contenu est naturellement plus long.
- L'export PNG conserve ses dimensions fixes et n'est pas modifié par le redimensionnement de l'aperçu.


## V28.7 — Correction vue liste responsive et export

- Correction de l’aperçu en mode liste : les 7 jours restent visibles à l’écran sans scroll interne.
- L’aperçu liste utilise désormais la même largeur de référence que l’export PNG, puis est réduit visuellement à l’écran.
- Le zoom d’aperçu est nettoyé avant l’export pour ne pas modifier le PNG final.
- Conservation des thèmes V28.5, des alertes anti-débordement et du QR code V28.4.
- Ajustement léger du moteur local pour mieux respecter les thèmes Fantasy Ciel Étoilé et Horreur VHS à l’export.

## V28.8 — Correction défilement des menus

- Correction du comportement des panneaux de gauche lorsque plusieurs menus sont ouverts ou qu'un menu contient beaucoup de champs.
- Les panneaux ne se compressent plus visuellement les uns sur les autres.
- La colonne de menus peut maintenant défiler correctement quand la hauteur disponible est insuffisante.
- Correction limitée au CSS.
- Aucun changement sur `script.js`, l'export PNG, la compression images ou le moteur local.

## V28.9 — Scrollbars stylisées adaptatives

- Remplacement visuel des scrollbars système par des barres fines et arrondies.
- La scrollbar du menu gauche et de l’aperçu s’adapte à la couleur du thème actif.
- Fallback prévu pour Firefox via `scrollbar-color`.
- Correction limitée au CSS.
- Aucun changement sur `script.js`, l’export PNG, le moteur local, les thèmes ou le QR code.

## V28.10 — Correction alignement export

- Correction du rendu export PNG pour les textes importants : heures, labels de mode spécial (`Programme`, `Épisode 01`, etc.), titres et notes.
- Le moteur local recentre maintenant les textes dans leurs boîtes CSS afin de mieux correspondre à l’aperçu navigateur.
- Les textes des cartes sont maintenant dessinés à l’intérieur du masque arrondi de la carte, pour éviter les décalages ou débordements visuels.
- Les éléments masqués en CSS ne sont plus dessinés par le moteur d’export.
- Conservation de la vue liste responsive, des scrollbars V28.9, des thèmes V28.5 et du QR code V28.4.


## V29.0 — Recadrage manuel des images grille / liste

- Ajout d’un bouton `Recadrer image` dans le panneau `Image du jour / Transparence`.
- Ouverture d’une modale unique scindée en deux zones : `Mode grille` et `Mode liste`.
- Le cadrage se règle séparément pour la grille et pour la liste.
- Déplacement manuel de l’image par maintien du clic / déplacement dans le cadre.
- Zoom indépendant pour chaque mode via slider ou molette souris.
- Boutons de réinitialisation séparés : grille et liste.
- Boutons de copie rapide : grille vers liste et liste vers grille.
- Recadrage non destructif : l’image importée n’est pas modifiée, seuls les paramètres d’affichage sont sauvegardés.
- L’aperçu navigateur et l’export PNG utilisent les mêmes valeurs de zoom et de décalage.
- Le moteur d’export local a été adapté pour respecter le recadrage manuel et utiliser un rendu image haute qualité.
- Conservation des corrections V28.10 : alignement export, vue liste responsive, scrollbars adaptatives, QR code V28.4 et thèmes V28.5.


## V29.1 — Recadrage responsive + dézoom

- La fenêtre de recadrage n'est plus imposée en très grand format : elle se cale sur une taille proche de l'aperçu disponible.
- La modale reste responsive et bascule proprement en affichage vertical sur les écrans plus étroits.
- Le zoom manuel accepte maintenant une plage de 10% à 300%.
- Le dézoom est donc possible sous 100%, sans modifier l'image source.
- Le moteur d'export local applique la même plage 10% / 300% pour garder l'export PNG synchronisé avec l'aperçu.


## V29.2 — Correction recadrage images larges

- Correction du recadrage manuel : l’image n’est plus pré-découpée par `object-fit` dans la fenêtre de recadrage.
- Le déplacement agit maintenant sur l’image complète, comme dans le moteur d’export PNG.
- Le zoom descend maintenant jusqu’à 10% pour permettre de voir davantage l’image dans les cadres très contraints, notamment le mode grille vertical.
- Le rendu aperçu et le rendu export utilisent la même logique de positionnement : taille calculée, position X/Y et zoom appliqués sans dégradation du fichier source.
- Conservation de la modale responsive V29.1 et des exports V28.10.


## V29.4 — Correction fidélité recadrage liste

- Correction du cadre de recadrage `Mode liste` : il reprend maintenant le vrai ratio de la carte du jour mesuré depuis le rendu PlanningGPT.
- Le cadrage de la modale liste ne repose plus sur un ratio approximatif fixe.
- Le mode grille bénéficie aussi d'une mesure dynamique du cadre pour rester plus proche du rendu réel.
- Ajout d'un aperçu vivant : quand le planning est déjà en mode liste ou grille, le déplacement dans la modale met aussi à jour l'image visible derrière la fenêtre avant validation.
- Si l'utilisateur annule, le rendu visible revient au cadrage sauvegardé.
- Conservation du zoom 10% à 300%, de la modale responsive et de l'export PNG synchronisé.


## V29.4 — Correction cadre grille du recadrage

- Correction du cadre de recadrage en mode grille.
- Le cadre grille utilise maintenant une largeur et une hauteur calculées ensemble pour conserver exactement le ratio réel de la carte.
- Suppression du comportement où `max-height` pouvait écraser la hauteur du cadre et désynchroniser la modale avec l’aperçu.
- Le mode liste, le dézoom 10% / 300%, le déplacement manuel et l’export PNG synchronisé sont conservés.

## V29.5 — Recadrage responsive et étirement ciblé

- Correction de la modale de recadrage : la fenêtre ne déborde plus et le contenu interne peut défiler proprement sans casser les boutons de validation.
- La modale reste limitée à une taille proche de l’aperçu, avec une largeur maximale pour éviter l’effet popup géant.
- Les cadres de recadrage restent mesurés dynamiquement depuis le vrai rendu du planning.
- Ajout d’un réglage `Étirer hauteur` pour le mode grille.
- Ajout d’un réglage `Étirer largeur` pour le mode liste.
- Les étirements sont non destructifs : ils ne modifient pas l’image source, seulement son rendu dans le planning.
- L’aperçu navigateur et l’export PNG utilisent les mêmes variables de recadrage : zoom, X, Y, étirement horizontal et étirement vertical.
- Le zoom 10% à 300%, le déplacement manuel, la copie grille/liste et les corrections V29.4 sont conservés.


## V30.3 — Correctif thèmes, QR et modes stream spécial

- Ajout d'une galerie miniature des thèmes, en complément de la liste existante.
- Ajout des modes spéciaux : Marathon, Sortie jeu, Subathon, Event caritatif, Tournoi, Découverte indé, Collaboration, Challenge, Stream anniversaire, Saison.
- Correction de livraison : les fichiers locaux `libs/html2canvas.local.js` et `libs/qrcode.local.js` sont bien inclus dans le dossier `libs/`.
- Les modes spéciaux historiques utilisent davantage les variables du thème actif au lieu de couleurs trop fixes.


## V30.7 — Reprise propre depuis V30.4

- Base utilisée : V30.4.
- Conservation du menu `Apparence & Export`, de la galerie de miniatures de thèmes et des options export.
- Suppression des modes : Stream anniversaire, Halloween/Noël/été, Tournoi, Collaboration et Event caritatif.
- Modes conservés : Marathon, Sortie jeu, Subathon, Découverte indé et Challenge.
- Correction visuelle du mode Découverte indé pour éviter l’effet de label coincé / trop compressé.
- Export PNG, QR local, recadrage et sauvegarde locale conservés.


## V30.8 — Correction damier menu Apparence & Export

- Correction du bug où l'ouverture du menu `Apparence & Export` appliquait un effet de damier / scanlines sur toute l'interface.
- Cause corrigée : les miniatures de thèmes utilisaient des classes `.theme-*` et récupéraient des pseudo-éléments prévus uniquement pour le canvas du planning.
- Les pseudo-éléments décoratifs sont maintenant limités à `.planningCanvas.theme-*`.
- Les miniatures restent fonctionnelles.
- Export PNG, QR, recadrage et modes spéciaux non modifiés.

## V30.9 — Correction label Découverte indé

- Correction du libellé `Prototype 01 / 02 / ...` en mode `Découverte indé`.
- Le coin haut droit du badge n’est plus rogné en vue grille.
- Conservation du style visuel du mode indé, des miniatures de thèmes, du QR local et de l’export PNG.

## V30.10 — Correction mise en avant visuelle avec image

- Correction du bug visuel quand `Mise en avant visuelle` est activé sur un jour ayant une image.
- Les calques image restent maintenant en position absolue derrière le texte.
- Conservation de la correction V30.9 du badge `Découverte indé`.
- Aucun changement sur le QR code, le recadrage ou l'export PNG.


## V30.11 — Correction mise en avant visuelle + recadrage

- Correction de la mise en avant visuelle avec image : le recadrage manuel reste maintenant appliqué.
- Le calque image reste absolu, mais ses positions `left/top/width/height` posées par le script ne sont plus écrasées.
- La modale de recadrage est plus compacte pour éviter le scroll inutile sur les écrans classiques.
- Conservation de la correction du badge Découverte indé, des miniatures de thèmes, du QR local et de l’export PNG.


## V30.12 — Couleur d’écriture par jour

- Ajout d’un bouton palette dans `Jour à modifier`.
- La couleur s’applique uniquement au jour sélectionné.
- Les miniatures de thème et favoris réinitialisent les couleurs personnalisées lors d’un changement de thème.
- L’export PNG utilise les couleurs visibles dans l’aperçu.
- Corrections V30.9 à V30.11 conservées.

## V30.13 — Correction export des libellés CSS

- Correction du moteur d’export PNG local : il lit maintenant le texte ajouté par les pseudo-éléments CSS `::before` et `::after`.
- Le mode `Découverte indé` exporte désormais bien le préfixe `Indie corner •` visible dans l’aperçu.
- Les autres libellés ajoutés par CSS dans les modes spéciaux restent synchronisés avec l’aperçu.
- Aucun changement sur l’interface, le recadrage, le QR code, la sauvegarde locale ou la compression d’images.

## V30.14 — Correction halo export

- Correction du rendu export PNG de la mise en avant visuelle.
- Le halo exporté n'est plus dessiné comme deux gros contours arrondis opaques autour des cartes.
- Le moteur local utilise maintenant une ombre douce plus proche de l'aperçu navigateur.
- Correction limitée à `libs/html2canvas.local.js`.
- Export PNG transparent, recadrage image, QR code, couleurs par jour et modes spéciaux conservés.

## V30.15 — Option masquer les textes du modificateur

- Ajout d’une option dans `Modificateur de thème` : `Masquer les textes du modificateur`.
- Cette option cache les libellés automatiques des modes spéciaux : `Journal 01`, `Étape 1`, `Prototype 01`, `Défi du jour`, etc.
- Les préfixes automatiques ajoutés devant le surtitre du planning par certains modes sont également masqués.
- L’aperçu et l’export PNG restent synchronisés.
- Correction V30.14 du halo export conservée.
