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

test('les quinze modèles de l’interface possèdent un style V2',()=>{
  const templates=[...html.matchAll(/data-template="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(templates.length,15);
  templates.forEach(name=>assert.match(script,new RegExp(`${name}:\\{bg:`)));
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
  assert.match(script,/element\.variant==='violin'/);
});

test('les modèles inspirés des références ont une composition dédiée',()=>{
  for(const name of ['spotlight','columns','bubblegrid','horror']){
    assert.match(script,new RegExp(`style==='${name}'|name==='${name}'`));
    assert.match(css,new RegExp(`variant-${name}`));
  }
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
  for(const name of ['agenda','polaroid','roadmap','constellation']){
    assert.match(script,new RegExp(`style==='${name}'|name==='${name}'`));
    assert.match(css,new RegExp(`variant-${name}`));
  }
});

test('changer de modèle conserve les calques personnels',()=>{
  assert.match(script,/const custom=project\.elements\.filter\(element=>!element\.builtIn\)\.map\(clone\);buildTemplate/);
  assert.match(script,/project\.elements\.push\(\.\.\.custom\)/);
});

test('les formes décoratives fines conservent leur taille dans l’inspecteur',()=>{
  assert.match(script,/function minimumElementSize\(element\)\{return element\?\.type==='shape'\?1:20;\}/);
  assert.match(script,/const minimum=minimumElementSize\(element\);element\.x=/);
  assert.match(script,/const minimum=minimumElementSize\(element\),normalized=/);
});

test('les douze modificateurs historiques sont disponibles',()=>{
  const block=html.match(/id="modifierSelect"[\s\S]*?<\/select>/)?.[0]||'';
  const modifiers=[...block.matchAll(/option value="([^"]*)"/g)].map(match=>match[1]);
  assert.deepEqual(modifiers,['none','poster','ticket','restaurant','rpg','logbook','anime','marathon','release','subathon','indie','challenge']);
  modifiers.forEach(name=>assert.match(script,new RegExp(`['"]${name}['"]`)));
});

test('les effets des modificateurs essentiels existent aussi dans le PNG',()=>{
  for(const token of ["project.modifier==='anime'","['release','challenge'].includes(project.modifier)","project.modifier==='marathon'||project.modifier==='subathon'","element.variant==='rpg'||project.modifier==='rpg'"])assert.match(script,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('anime et subathon évitent le faux texte doublé avec le style du modèle',()=>{
  assert.match(script,/project\.modifier==='anime'\)Object\.assign\(element,\{effect:'none',fontStyle:'italic'\}/);
  assert.match(script,/project\.modifier==='subathon'\)Object\.assign\(element,\{effect:'none',fontStyle:'normal'\}/);
  assert.match(script,/\['anime','subathon'\]\.includes\(raw\.modifier\)/);
  assert.match(css,/modifier-anime \.role-title \.elText\{text-shadow:0 4px 14px/);
});

test('le jour star est conservé dans le projet et dans le PNG',()=>{
  assert.match(html,/id="dayStar"/);
  assert.match(script,/★ JOUR STAR/);
  assert.match(script,/star:\s*!!day\?\.star/);
});

test('les styles typographiques avancés sont raccordés',()=>{
  for(const id of ['propFont','propWeight','propFontStyle','propTransform','propAlign','propLetterSpacing','propTextEffect'])assert.match(html,new RegExp(`id="${id}"`));
  for(const preset of ['modern','elegant','typewriter','hand','comic','condensed'])assert.match(script,new RegExp(`${preset}:\\{font:`));
  assert.match(script,/configureCanvasText/);
  assert.match(script,/applyTypePresetToPlanning/);
  assert.match(html,/id="typePresetSelect"/);
  assert.match(html,/id="propLetterSpacingValue"/);
  assert.match(script,/propLetterSpacingValue\.textContent/);
});

test('les contrôles ergonomiques essentiels restent à portée',()=>{
  assert.match(html,/id="layerSelect"/);
  assert.ok(html.indexOf('id="layerSelect"')<html.indexOf('id="propertyPanel"'));
  assert.match(html,/id="resetLayoutBtn"/);
  assert.doesNotMatch(html,/dayMovePanel|data-move-day|data-arrange/);
});

test('les options de modèle sont repliées par défaut',()=>{
  const details=[...html.matchAll(/<details class="modelOptions[^"]*"([^>]*)>/g)];
  assert.equal(details.length,2);
  details.forEach(match=>assert.doesNotMatch(match[1],/\bopen\b/));
});

test('le contenu de chaque carte peut être recomposé ou masqué',()=>{
  for(const id of ['dayCardProperties','propDayLayout','propShowDayName','propShowDayTime','propShowDayTitle','propShowDayNote','propDayOverlay','applyDayStyleAllBtn'])assert.match(html,new RegExp(`id="${id}"`));
  for(const layout of ['standard','poster','feature','image'])assert.match(html,new RegExp(`option value="${layout}"`));
  assert.match(script,/contentLayout/);
  assert.match(script,/showDayName/);
  assert.match(script,/imageOverlay/);
  assert.match(script,/Composition appliquée à toutes les cartes/);
});

test('la bibliothèque contient vingt-huit emojis sans illustrations intégrées',()=>{
  const emojiBlock=script.match(/const EMOJIS = \[([^\]]+)\]/)?.[1]||'';
  assert.equal([...emojiBlock.matchAll(/'[^']+'/g)].length,28);
  for(const emoji of ['☁️','🎧','🕹️','🐉','🏆','🍄','🌈','🦇','🪄','🎲'])assert.match(script,new RegExp(emoji));
  for(const emoji of ['🎤','🎻','🎼','🎵','💀','📼'])assert.match(script,new RegExp(emoji));
  assert.doesNotMatch(script,/STICKERS|stickerElement|assets\/stickers/);
  assert.doesNotMatch(html,/stickerGrid|Illustrations originales|LIVE SCHEDULE/);
});

test('le QR Code est généré localement et raccordé au PNG',async()=>{
  await access(new URL('../libs/qrcode.local.js',import.meta.url));
  assert.match(html,/id="showQr"/);
  assert.match(html,/id="qrUrl"/);
  assert.ok(html.indexOf('libs/qrcode.local.js')<html.indexOf('v2.js'));
  assert.match(script,/function makeQr\(\)/);
  assert.match(script,/function drawQr\(ctx,element\)/);
  assert.match(script,/if\(element\.type==='qr'\)drawQr/);
});

test('la gestion d’image permet un recadrage non destructif fidèle au PNG',()=>{
  for(const id of ['imageProperties','propImageFit','cropImageBtn','replaceImageInput','cropModal','cropStage','cropZoom','cropStretchX','cropStretchY','cropApplyBtn'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/function normalizeImageCrop/);
  assert.match(script,/function imageCropStyle/);
  assert.match(script,/function drawCroppedImage/);
  assert.match(script,/drawCroppedImage\(ctx,await loadImage/);
  assert.match(css,/\.cropOverlay\.isVisible/);
});

test('chaque jour peut recevoir une image recadrée et exportée',()=>{
  for(const id of ['dayImageInput','dayImageFit','cropDayImageBtn','removeDayImageBtn'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/imageAssetId/);
  assert.match(script,/async function importDayImage/);
  assert.match(script,/drawDay\(ctx,element,dayImage\)/);
  assert.match(css,/\.elDay__image\{position:absolute;inset:0/);
  assert.match(script,/const area=\{w:element\.w,h:element\.h,fit:day\.imageFit/);
});

test('choisir un jour sélectionne directement sa carte',()=>{
  assert.match(script,/function selectDayForEditing/);
  assert.match(script,/selectedId=card\?\.id\|\|''/);
  assert.match(script,/if\(element\?\.type==='day'\)\{selectedDay=element\.dayIndex;renderDays\(\);\}/);
  assert.doesNotMatch(html,/selectDayCardBtn/);
});

test('le planning accepte une image de fond ou un PNG transparent',()=>{
  for(const id of ['transparentBackground','backgroundImageInput','backgroundImageFit','removeBackgroundImageBtn'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/async function importBackgroundImage/);
  assert.match(script,/if\(!project\.background\.transparent\)/);
  assert.match(script,/project\.background\.imageAssetId/);
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
  assert.match(script,/const VERSION = '2\.0\.0'/);
  assert.equal(packageJson.version,'2.0.0');
  assert.match(readme,/PlanningGPT V2\.0\.0/);
});

test('le stockage est chargé avant le studio',()=>{
  assert.ok(html.indexOf('storage.js')<html.indexOf('v2.js'));
});
