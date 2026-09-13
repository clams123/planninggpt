import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import test from 'node:test';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const script=await readFile(new URL('../v2.js',import.meta.url),'utf8');
const css=await readFile(new URL('../v2.css',import.meta.url),'utf8');
const packageJson=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const readme=await readFile(new URL('../README_PlanningGPT.md',import.meta.url),'utf8');

test('tous les identifiants utilisés par V2 existent',()=>{
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
  const references=[...script.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]);
  assert.deepEqual(references.filter(id=>!ids.has(id)),[]);
});

test('les identifiants HTML sont uniques',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length);
});

test('les dix-huit modèles de l’interface possèdent un style V2',()=>{
  const templates=[...html.matchAll(/data-template="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(templates.length,18);
  templates.forEach(name=>assert.match(script,new RegExp(`${name}:\\{bg:`)));
});

test('Duel néon et Duo astral proposent deux compositions illustrées distinctes',()=>{
  assert.match(html,/data-template="neonduel"[\s\S]*<strong>Duel néon<\/strong>/);
  assert.match(html,/data-template="astralduo"[\s\S]*<strong>Duo astral<\/strong>/);
  for(const token of ['tp-neonduel','tp-astralduo','variant-neonblue','variant-neonred','variant-astralblue','variant-astralrose'])assert.match(css,new RegExp(`\\.${token}`));
  assert.match(script,/function featureDuoCardLayout\(width,height\)/);
  assert.match(script,/DUO_TEMPLATES = new Set\(\['spotlight','neonduel','astralduo'\]\)/);
  assert.match(script,/day\.visible=index===1\|\|index===5/);
  assert.match(script,/const versus=textElement\('VS'/);
  assert.match(script,/const sigil=textElement\('✦'/);
});

test('le modèle partition de violon possède ses ornements et son rendu PNG',()=>{
  assert.match(html,/data-template="violin"/);
  assert.match(css,/\.variant-violin/);
  assert.match(script,/violin:\{bg:/);
  assert.match(script,/emojiElement\('🎻'/);
  assert.match(script,/emojiElement\('🎼'/);
  assert.match(script,/function violinWatermark/);
  assert.match(script,/svgImageElement\(violinWatermark\(\)/);
  assert.match(script,/I\.  ALLEGRO/);
  assert.match(script,/II\.  ANDANTE/);
  assert.match(script,/Op\. 7  •  Moderato/);
  assert.match(script,/const romans=\['I','II','III','IV','V','VI','VII'\]/);
  assert.match(css,/\.variant-violin::before/);
  assert.match(script,/function exportClone\(\)/);
});

test('les modèles inspirés des références ont une composition dédiée',()=>{
  for(const name of ['spotlight','columns','bubblegrid','horror']){
    assert.match(script,new RegExp(`style==='${name}'|name==='${name}'`));
    assert.match(css,new RegExp(`variant-${name}`));
  }
});

test('Duo et plus accepte de deux à sept jours et se réorganise',()=>{
  assert.match(html,/data-template="spotlight"[\s\S]*<strong>Duo et \+<\/strong>/);
  assert.match(script,/function spotlightPositions\(width,height,count\)/);
  assert.match(script,/function spotlightCardLayout\(width,height\)/);
  assert.match(script,/function reflowSpotlightCards\(\)/);
  assert.match(script,/function ensureSpotlightCards\(\)/);
  assert.match(script,/Duo et \+ conserve au moins deux jours affichés/);
  assert.match(script,/await load\(\);ensureSpotlightCards\(\)/);
  assert.match(script,/DUO_TEMPLATES\.has\(previousTemplate\)&&!DUO_TEMPLATES\.has\(name\)[\s\S]*day\.visible=true/);
});

test('Fantasy VII possède une composition industrielle dédiée et fidèle au PNG',()=>{
  assert.match(html,/data-template="fantasy7"/);
  assert.match(css,/\.variant-fantasy7/);
  assert.match(script,/fantasy7:\{bg:/);
  assert.match(script,/style==='fantasy7'/);
  assert.match(script,/function fantasySwordWatermark/);
  assert.match(script,/svgImageElement\(fantasySwordWatermark\(\)/);
  assert.match(script,/SECTOR 07  \/\/  MAKO WEEK/);
  assert.match(css,/\.variant-fantasy7/);
  assert.match(script,/function exportClone\(\)/);
});

test('Twitch Live remplace Quête fantasy avec une composition de diffusion dédiée',()=>{
  assert.match(html,/data-template="rpg"[\s\S]*<strong>Twitch Live<\/strong>/);
  assert.match(script,/rpg:\{bg:\['#120b1d','#6f2dc5'\][\s\S]*card:'twitch'/);
  assert.match(script,/style==='rpg'[\s\S]*topW=430/);
  assert.match(script,/function twitchLogoMark/);
  assert.match(script,/svgImageElement\(twitchLogoMark\(\)/);
  assert.match(script,/Logo Twitch/);
  assert.match(script,/ON SE RETROUVE EN LIVE  •  À TRÈS VITE/);
  assert.match(css,/\.variant-twitch/);
  assert.doesNotMatch(script,/spectateurs|chaînes programmées|#eb0400/);
  assert.doesNotMatch(css,/#eb0400/);
  assert.match(script,/refreshReplacedModel=project\.modelRevision<3&&project\.template==='rpg'/);
});

test('aucun calque de modèle n’est verrouillé par défaut',()=>{
  assert.match(script,/const MODEL_REVISION = 4;/);
  assert.match(script,/modelRevision:MODEL_REVISION/);
  assert.match(script,/elements\.forEach\(element=>\{element\.builtIn=true;element\.locked=false;\}\)/);
  assert.match(script,/unlockDefaultLayers=project\.modelRevision<MODEL_REVISION/);
  assert.match(script,/project\.elements\.filter\(element=>element\.builtIn\)\.forEach\(element=>\{element\.locked=false;\}\)/);
});

test('Résonance WuWa remplace entièrement l’ancienne Constellation',()=>{
  assert.match(html,/data-template="constellation"[\s\S]*<strong>Résonance WuWa<\/strong>/);
  assert.match(script,/constellation:\{bg:\['#eef7f5','#7ba6ad'\][\s\S]*card:'wuwa'/);
  assert.match(script,/function resonanceWatermark/);
  assert.match(script,/svgImageElement\(resonanceWatermark\(\)/);
  assert.match(script,/RESONANCE \/\/ WEEK 07/);
  assert.match(css,/\.variant-wuwa/);
  assert.doesNotMatch(script,/lineElementBetween|URSA MAJOR|GRANDE OURSE|starNames/);
});

test('les aperçus de modèles sont réduits de cinq pour cent en hauteur',()=>{
  assert.match(css,/\.templatePreview\{[^}]*height:60px/);
  assert.match(css,/\.templateCard\{[^}]*min-height:101px/);
});

test('colonnes, grille pop et horreur ont des structures visuelles propres',()=>{
  assert.match(script,/if\(name==='columns'\)[\s\S]*STREAM/);
  assert.match(script,/if\(name==='bubblegrid'\)[\s\S]*const header=/);
  assert.match(script,/if\(name==='horror'\)[\s\S]*REC  00:13:37/);
  assert.match(script,/normalized\.variant==='candy'/);
  assert.match(css,/\.variant-bubblegrid::before/);
  assert.match(css,/\.variant-horror::before/);
});

test('les quatre nouveaux modèles possèdent des compositions dédiées',()=>{
  for(const name of ['agenda','polaroid','roadmap']){
    assert.match(script,new RegExp(`style==='${name}'|name==='${name}'`));
    assert.match(css,new RegExp(`variant-${name}`));
  }
  assert.match(script,/style==='constellation'/);
  assert.match(css,/variant-wuwa/);
});

test('changer de modèle conserve les calques personnels',()=>{
  assert.match(script,/const custom=project\.elements\.filter\(element=>!element\.builtIn\)\.map\(clone\);buildTemplate/);
  assert.match(script,/project\.elements\.push\(\.\.\.custom\)/);
});

test('les formes décoratives fines conservent leur taille dans l’inspecteur',()=>{
  assert.match(script,/function minimumElementSize\(element\)\{return element\?\.type==='shape'\?1:20;\}/);
  assert.match(script,/const minimum=minimumElementSize\(element\);element\.x=/);
  assert.match(script,/minimum=minimumElementSize\(element\),normalized=/);
});

test('les douze modificateurs historiques sont disponibles',()=>{
  const block=html.match(/id="modifierSelect"[\s\S]*?<\/select>/)?.[0]||'';
  const modifiers=[...block.matchAll(/option value="([^"]*)"/g)].map(match=>match[1]);
  assert.deepEqual(modifiers,['none','poster','ticket','restaurant','rpg','logbook','anime','marathon','release','subathon','indie','challenge']);
  modifiers.forEach(name=>assert.match(script,new RegExp(`['"]${name}['"]`)));
});

test('les effets des modificateurs essentiels existent aussi dans le PNG',()=>{
  for(const modifier of ['anime','release','challenge','marathon','subathon','rpg'])assert.match(css,new RegExp(`modifier-${modifier}`));
  assert.match(script,/els\.artboard\.className=`artboard modifier-\$\{project\.modifier\|\|'none'\}`/);
  assert.match(script,/function exportClone\(\)/);
});

test('anime et subathon évitent le faux texte doublé avec le style du modèle',()=>{
  assert.match(script,/project\.modifier==='anime'\)Object\.assign\(element,\{effect:'none',fontStyle:'italic'\}/);
  assert.match(script,/project\.modifier==='subathon'\)Object\.assign\(element,\{effect:'none',fontStyle:'normal'\}/);
  assert.match(script,/\['anime','subathon'\]\.includes\(raw\.modifier\)/);
  assert.match(css,/modifier-anime \.role-title \.elText\{text-shadow:0 4px 14px/);
});

test('le jour star est conservé dans le projet et dans le PNG',()=>{
  assert.match(html,/id="dayStar"/);
  assert.match(script,/starBadge">★ Jour star/);
  assert.match(css,/\.elDay\.isStar/);
  assert.match(script,/star:\s*!!day\?\.star/);
  assert.match(script,/function exportClone\(\)/);
});

test('les styles typographiques avancés sont raccordés',()=>{
  for(const id of ['propFont','propWeight','propFontStyle','propTransform','propAlign','propTextEffect'])assert.match(html,new RegExp(`id="${id}"`));
  for(const preset of ['modern','elegant','typewriter','hand','comic','condensed'])assert.match(script,new RegExp(`${preset}:\\{font:`));
  assert.match(script,/function typographyStyle/);
  assert.match(script,/applyTypePresetToPlanning/);
  assert.match(html,/id="typePresetSelect"/);
  assert.doesNotMatch(html,/propLetterSpacing|Espacement des lettres/);
  assert.doesNotMatch(script,/propLetterSpacing/);
});

test('les contrôles ergonomiques essentiels restent à portée',()=>{
  assert.match(html,/id="layerSelect"/);
  assert.ok(html.indexOf('id="layerSelect"')<html.indexOf('id="propertyPanel"'));
  assert.match(html,/id="resetLayoutBtn"/);
  assert.match(html,/id="dayStar"[\s\S]*id="resetPlanningBtn"[^>]*>Réinitialiser le planning</);
  assert.match(html,/class="quickToggleRow"[\s\S]*id="showQr"[\s\S]*id="dayStar"[\s\S]*id="qrUrlField"[\s\S]*id="resetPlanningBtn"/);
  assert.match(css,/\.quickToggleRow\{display:grid;grid-template-columns:1fr 1fr/);
  assert.doesNotMatch(html,/id="resetBtn"|↺ Réinitialiser/);
  assert.match(script,/function resetPlanning\(\)/);
  assert.match(script,/els\.resetPlanning\.addEventListener\('click',resetPlanning\)/);
  assert.doesNotMatch(html,/dayMovePanel|data-move-day|data-arrange/);
  assert.match(html,/data-panel="design"[^>]*>Design</);
  assert.match(html,/data-panel-content="design"[\s\S]*Personnaliser le modèle[\s\S]*Arrière-plan du planning/);
  const templatesPanel=html.match(/data-panel-content="templates"[\s\S]*?<\/section>/)?.[0]||'';
  assert.doesNotMatch(templatesPanel,/Personnaliser le modèle|Arrière-plan du planning/);
  assert.doesNotMatch(html,/QR Code<\/strong><small>|Jour star<\/strong><small>/);
});

test('les options de modèle sont repliées par défaut',()=>{
  const details=[...html.matchAll(/<details class="modelOptions[^"]*"([^>]*)>/g)];
  assert.equal(details.length,2);
  details.forEach(match=>assert.doesNotMatch(match[1],/\bopen\b/));
});

test('le contenu de chaque carte peut être recomposé ou masqué',()=>{
  for(const id of ['dayCardProperties','propDayLayout','propShowDayName','propShowDayTime','propShowDayTitle','propShowDayNote','applyDayStyleAllBtn'])assert.match(html,new RegExp(`id="${id}"`));
  for(const layout of ['standard','poster','feature','image'])assert.match(html,new RegExp(`option value="${layout}"`));
  assert.match(script,/contentLayout/);
  assert.match(script,/showDayName/);
  assert.doesNotMatch(html,/propDayOverlay|Assombrir l.image/);
  assert.doesNotMatch(script,/propDayOverlay|imageOverlay/);
  assert.match(script,/Composition appliquée à toutes les cartes/);
});

test('la bibliothèque contient trente-six emojis sans illustrations intégrées',()=>{
  const emojiBlock=script.match(/const EMOJIS = \[([^\]]+)\]/)?.[1]||'';
  assert.equal([...emojiBlock.matchAll(/'[^']+'/g)].length,36);
  for(const emoji of ['☁️','🎧','🕹️','🐉','🏆','🍄','🌈','🦇','🪄','🎲'])assert.match(script,new RegExp(emoji));
  for(const emoji of ['🎤','🎻','🎼','🎵','💀','📼'])assert.match(script,new RegExp(emoji));
  for(const emoji of ['⚔️','🗡️','🪽','🌌','⚡','🧪','🏙️','🐺'])assert.match(script,new RegExp(emoji));
  assert.doesNotMatch(script,/STICKERS|stickerElement|assets\/stickers/);
  assert.doesNotMatch(html,/stickerGrid|Illustrations originales|LIVE SCHEDULE/);
});

test('le QR Code est généré localement et présent dans le rendu exporté',async()=>{
  await access(new URL('../libs/qrcode.local.js',import.meta.url));
  assert.match(html,/id="showQr"/);
  assert.match(html,/id="qrUrl"/);
  assert.ok(html.indexOf('libs/qrcode.local.js')<html.indexOf('v2.js'));
  assert.match(script,/function makeQr\(\)/);
  assert.match(script,/function qrSvg\(element\)/);
  assert.match(script,/if\(element\.type==='qr'\)content=`<div class="elQr">\$\{qrSvg\(element\)\}<\/div>`/);
  assert.match(script,/function exportClone\(\)/);
});

test('la gestion d’image permet un recadrage non destructif repris directement dans le PNG',()=>{
  for(const id of ['imageProperties','propImageFit','cropImageBtn','replaceImageInput','cropModal','cropStage','cropZoom','cropStretchX','cropStretchY','cropApplyBtn'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/function normalizeImageCrop/);
  assert.match(script,/function imageCropStyle/);
  assert.match(script,/function exportClone\(\)/);
  assert.doesNotMatch(script,/function drawCroppedImage/);
  assert.match(css,/\.cropOverlay\.isVisible/);
});

test('chaque jour peut recevoir une image recadrée, transparente et exportée',()=>{
  for(const id of ['dayImageInput','dayImageFit','dayImageOpacity','dayImageOpacityValue','cropDayImageBtn','removeDayImageBtn'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/imageAssetId/);
  assert.match(script,/async function importDayImage/);
  assert.match(css,/\.elDay__image\{position:absolute;inset:0/);
  assert.match(script,/imageCropStyle\(\{\.\.\.day,fit:day\.imageFit\}\)/);
  assert.match(script,/imageOpacity:normalizeImageOpacity\(day\?\.imageOpacity\)/);
  assert.match(script,/dayImageOpacity=normalizeImageOpacity\(day\.imageOpacity\),hasVisibleDayImage=!!day\.imageSrc&&dayImageOpacity>0/);
  assert.match(script,/class="elDay__image" style="opacity:\$\{dayImageOpacity\}"/);
  assert.match(script,/\$\{hasVisibleDayImage\?' hasImage':''\}/);
  assert.match(script,/els\.dayImageOpacity\.addEventListener\('input'/);
  assert.match(script,/function exportClone\(\)/);
});

test('choisir un jour sélectionne directement sa carte',()=>{
  assert.match(script,/function selectDayForEditing/);
  assert.match(script,/selectedId=card\?\.id\|\|''/);
  assert.match(script,/if\(element\?\.type==='day'\|\|element\?\.dayField\)\{selectedDay=element\.dayIndex;renderDays\(\);\}/);
  assert.doesNotMatch(html,/selectDayCardBtn/);
});

test('les jours se masquent depuis la semaine sans supprimer leurs données',()=>{
  for(const id of ['visibleDaysStatus','showAllDaysBtn','hideOffDaysBtn'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/visible:day\?\.visible!==false/);
  assert.match(script,/function setDayVisibility/);
  assert.match(script,/data-toggle-day/);
  assert.match(script,/sans supprimer ses données/);
  assert.match(script,/if\(isHiddenWithDay\(element\)\)return ''/);
  assert.match(html,/Masquer les repos/);
});

test('les textes d’un jour peuvent devenir des calques liés et indépendants',()=>{
  for(const id of ['dayTextLayersBtn','allDayTextLayersBtn','dayTextLayersStatus','dayCardColor'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/const DAY_TEXT_FIELDS =/);
  assert.match(script,/function separateDayTextLayers\(dayIndex\)/);
  assert.match(script,/function toggleDayTextLayers\(\)/);
  assert.match(script,/function toggleAllDayTextLayers\(\)/);
  assert.match(script,/dayField:field/);
  assert.match(script,/element\.dayField\?dayTextValue\(element\):element\.text/);
  assert.match(script,/Regrouper les textes de ce jour/);
  assert.match(script,/Composition libre activée/);
  assert.match(script,/card\.fill=els\.dayCardColor\.value/);
  assert.match(script,/Textes séparés : déplace chaque calque librement/);
  assert.match(script,/font:computedFontKey\(computed\.fontFamily,card\.font\)/);
  assert.match(script,/weight:Number\(computed\.fontWeight\)\|\|card\.weight/);
  assert.match(script,/color:computedColor\(computed\.color/);
  assert.match(script,/fontStyle:placement\.fontStyle,transform:placement\.transform,letterSpacing:placement\.letterSpacing/);
});

test('une nouvelle image de jour est affichée entièrement par défaut',()=>{
  assert.match(html,/Afficher l’image entière sans découpe/);
  assert.match(script,/async function importDayImage[\s\S]*imageFit:'contain'/);
  for(const id of ['cropFit','cropFitHint'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/Étirer sans zone vide/);
  assert.match(script,/element\.imageFit=cropDraft\.fit/);
  assert.match(script,/element\.fit=cropDraft\.fit/);
  assert.match(script,/Les zones quadrillées viennent seulement de la différence de proportions/);
});

test('le planning accepte une image de fond ajustable, transparente ou un PNG transparent',()=>{
  for(const id of ['transparentBackground','backgroundImageInput','backgroundImageFit','backgroundImageOpacity','backgroundImageOpacityValue','cropBackgroundImageBtn','removeBackgroundImageBtn'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/async function importBackgroundImage/);
  assert.match(script,/openCropEditor\('background'\)/);
  assert.match(script,/cropDraft\.kind==='background'\?project\.background/);
  assert.match(script,/class="artboardBackground"/);
  assert.match(script,/imageCropStyle\(\{\.\.\.bg,fit:bg\.imageFit\}\)/);
  assert.match(script,/raw\.background\.imageOpacity=normalizeImageOpacity\(raw\.background\.imageOpacity\)/);
  assert.match(script,/opacity:\$\{normalizeImageOpacity\(bg\.imageOpacity\)\}/);
  assert.match(script,/els\.backgroundImageOpacity\.addEventListener\('input'/);
  assert.match(css,/\.artboardBackground img/);
  assert.match(script,/if\(project\.background\.transparent\)\{els\.artboard\.style\.backgroundImage='none'/);
  assert.match(script,/project\.background\.imageAssetId/);
});

test('le PNG sérialise le vrai DOM sans remplacer l’aperçu par un raster',()=>{
  assert.doesNotMatch(html,/html2canvas|renderSurface/);
  assert.match(script,/function renderArtboardToCanvas\(\)/);
  assert.match(script,/function inlineStyle\(source,target,pseudo=''\)/);
  assert.match(script,/function exportClone\(\)/);
  assert.match(script,/new XMLSerializer\(\)\.serializeToString\(copy\)/);
  assert.match(script,/<foreignObject x=/);
  assert.match(script,/encodeURIComponent\(svg\)/);
  assert.match(script,/const canvas=await renderArtboardToCanvas\(\)/);
  assert.doesNotMatch(script,/window\.html2canvas|prepareExportDom|renderSurface/);
  assert.equal([...script.matchAll(/style='[^']*\$\{typographyStyle\(element\)\}'/g)].length,2);
  assert.doesNotMatch(script,/function (drawDay|drawText|drawQr|drawCroppedImage)\(/);
});

test('le stockage refuse un import non persistant et nettoie les ressources orphelines',()=>{
  assert.match(script,/Impossible de stocker cette image sur cet appareil/);
  assert.match(script,/PlanningAssetStore\.keepOnly\(used\)/);
  assert.match(script,/beforeunload/);
});

test('les contrôles avancés restent contextuels et le canvas signale les risques',()=>{
  for(const id of ['propColorField','propFillField','preflightStatus'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/function renderPreflightStatus/);
  assert.match(script,/élément hors du planning/);
  assert.match(script,/texte potentiellement coupé/);
});

test('les calques sont réordonnables sans réintroduire les flèches',()=>{
  assert.match(script,/addEventListener\('dragstart'/);
  assert.match(script,/addEventListener\('drop'/);
  assert.doesNotMatch(html,/data-arrange/);
});

test('la page ne charge aucune ressource distante',()=>{
  assert.deepEqual([...html.matchAll(/(?:src|href)="https?:\/\//g)],[]);
});

test('le seul export proposé est le PNG',()=>{
  assert.match(html,/Exporter PNG/);
  assert.doesNotMatch(html,/Exporter (?:PDF|SVG|JPG|JSON)/i);
  assert.equal([...script.matchAll(/toBlob\([^\n]+['"]image\/png['"]/g)].length,1);
});

test('la version V2 correspond au paquet et à la documentation',()=>{
  assert.match(script,/const VERSION = '2\.0\.2'/);
  assert.equal(packageJson.version,'2.0.2');
  assert.match(readme,/PlanningGPT V2\.0\.2/);
});

test('le stockage est chargé avant le studio',()=>{
  assert.ok(html.indexOf('storage.js')<html.indexOf('v2.js'));
});
