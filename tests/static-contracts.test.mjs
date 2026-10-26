import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import test from 'node:test';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const script=await readFile(new URL('../v2.js',import.meta.url),'utf8');
const css=await readFile(new URL('../v2.css',import.meta.url),'utf8');
const preflightScript=await readFile(new URL('../preflight.js',import.meta.url),'utf8');
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

test('un bouton après l’export présente le projet dans une infobulle accessible',()=>{
  assert.doesNotMatch(html,/class="brandVersionTip"/);
  assert.match(html,/id="exportBtn"[\s\S]*id="projectInfoBtn"[^>]*aria-expanded="false"[^>]*aria-controls="projectInfoTooltip"/);
  assert.match(html,/id="projectInfoTooltip" role="tooltip" hidden/);
  assert.match(html,/thèmes prédéfinis[\s\S]*fonds[\s\S]*transparence[\s\S]*mode Random[\s\S]*exportez le résultat en PNG/);
  assert.match(script,/projectInfoBtn:\$\('projectInfoBtn'\)/);
  assert.match(script,/els\.projectInfoBtn\.addEventListener\('click'/);
  assert.match(script,/event\.key==='Escape'[\s\S]*closeProjectInfo/);
});

test('un bouton Reset compact réutilise la réinitialisation existante depuis la barre supérieure',()=>{
  assert.match(html,/id="projectInfoBtn"[\s\S]*?<\/div>\s*<button class="btn topResetBtn" id="topResetBtn"[^>]*>Reset<\/button>/);
  assert.match(script,/topReset:\$\('topResetBtn'\)/);
  assert.match(script,/\[els\.resetPlanning,els\.topReset\]\.forEach\(button=>button\.addEventListener\('click',resetPlanning\)\)/);
  assert.match(css,/\.topResetBtn\{/);
});

test('les vingt-quatre modèles de l’interface possèdent un style V2',()=>{
  const templates=[...html.matchAll(/data-template="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(templates.length,24);
  templates.forEach(name=>assert.match(script,new RegExp(`${name}:\\{bg:`)));
});

test('la bibliothèque de modèles reste simple avec des cartes compactes',()=>{
  assert.doesNotMatch(html,/id="templateSearch"|id="templateCategory"|id="templateFilterStatus"/);
  assert.doesNotMatch(script,/filterTemplateCards|normalizeTemplateSearch/);
  assert.match(css,/\.templateCard\{[^}]*min-height:82px/);
  assert.match(css,/\.templatePreview\{[^}]*height:47px/);
});

test('l’onglet actif est restauré après actualisation',()=>{
  assert.match(script,/const ACTIVE_PANEL_KEY = 'planninggpt_v2_active_panel'/);
  assert.match(script,/function activatePanel\(panel,/);
  assert.match(script,/localStorage\.setItem\(ACTIVE_PANEL_KEY,panel\)/);
  assert.match(script,/activatePanel\(localStorage\.getItem\(ACTIVE_PANEL_KEY\)\|\|'planning',false\)/);
});

test('Esport arena réunit plusieurs disciplines dans une identité compétitive originale',()=>{
  assert.match(html,/value="esport">Esport arena<\/option>/);
  assert.match(html,/data-template="esport"[^>]*data-category="gaming"[\s\S]*<strong>Esport arena<\/strong>/);
  assert.match(script,/esport:\{bg:/);
  assert.match(script,/if\(style==='esport'\)/);
  assert.match(script,/if\(name==='esport'\)/);
  assert.match(script,/function esportArena\(\)/);
  for(const label of ['ARÈNE ESPORT','MOBA','FPS','MMORPG','VERSUS','RACING','DANCE','BATTLE ROYAL'])assert.match(script,new RegExp(label));
  assert.doesNotMatch(script,/CAR BALL|BATTLE ROYALE/);
  assert.match(script,/const ESPORT_DISCIPLINES = \['MOBA','FPS','MMORPG','VERSUS','RACING','DANCE','BATTLE ROYAL'\]/);
  assert.match(script,/label\.role=`esportDiscipline\$\{index\+1\}`/);
  assert.match(script,/refreshEsport=project\.template==='esport'&&previousRevision<21/);
  for(const token of ['tp-esport','template-esport','variant-esport'])assert.match(css,new RegExp(`\\.${token}`));
  assert.doesNotMatch(script,/League of Legends|Rocket League|Fortnite/);
});

test('Carnet des saisons fournit une composition originale utilisable toute l’année',()=>{
  assert.match(html,/value="seasonboard">Carnet des saisons<\/option>/);
  assert.match(html,/data-template="seasonboard"[\s\S]*<strong>Carnet des saisons<\/strong>/);
  assert.match(script,/seasonboard:\{bg:/);
  assert.match(script,/if\(style==='seasonboard'\)/);
  assert.match(script,/if\(name==='seasonboard'\)/);
  assert.match(script,/function seasonWheel\(\)/);
  assert.match(script,/function seasonGarden\(\)/);
  for(const token of ['tp-seasonboard','template-seasonboard','variant-seasonboard'])assert.match(css,new RegExp(`\\.${token}`));
  assert.doesNotMatch(script,/seasonboard[^\n]*(portrait|photo|citrouille|pumpkin)/i);
});

test('Rituel d’acier fournit un rituel morbide avec grimoire, dagues, chaînes et crâne',()=>{
  assert.match(html,/value="metalcore">Rituel d’acier<\/option>/);
  assert.match(html,/data-template="metalcore"[\s\S]*<strong>Rituel d’acier<\/strong>/);
  assert.match(script,/metalcore:\{bg:/);
  assert.match(script,/if\(style==='metalcore'\)/);
  assert.match(script,/if\(name==='metalcore'\)/);
  assert.match(script,/function occultRelics\(\)/);
  for(const relic of ['Grimoire obscur','Crâne rituel','Dagues croisées','Chaînes du rituel'])assert.match(script,new RegExp(relic));
  assert.doesNotMatch(script,/metalSigil|ironCathedral|Cathédrale d’acier/);
  assert.match(script,/refreshMetalcore=project\.template==='metalcore'&&previousRevision<19/);
  for(const token of ['tp-metalcore','template-metalcore','variant-metalcore'])assert.match(css,new RegExp(`\\.${token}`));
  assert.match(css,/\.variant-metalcore \.elDay__name\{[^}]*max-width:100%[^}]*white-space:normal[^}]*overflow:visible[^}]*text-overflow:clip/);
  assert.doesNotMatch(css,/\.variant-metalcore \.elDay__name::before\{content:"☠"/);
});

test('les SVG intégrés conservent leurs caractères UTF-8',()=>{
  const source=script.match(/function svgDataUrl\(svg\)\{[^}]+\}/)?.[0];
  assert.ok(source,'svgDataUrl doit exister');
  const svgDataUrl=Function(`return (${source})`)();
  const svg='<svg xmlns="http://www.w3.org/2000/svg"><title>Crâne et Chaînes</title></svg>';
  const url=svgDataUrl(svg);
  assert.match(url,/^data:image\/svg\+xml;charset=utf-8,/);
  assert.equal(decodeURIComponent(url.slice(url.indexOf(',')+1)),svg);
});

test('Affiche crée un événement centré sur une seule journée',()=>{
  assert.match(html,/value="eventposter">Affiche<\/option>/);
  assert.match(html,/data-template="eventposter"[\s\S]*<strong>Affiche<\/strong>/);
  assert.match(script,/eventposter:\{bg:/);
  assert.match(script,/FOCUS_TEMPLATES = new Set\(\['eventposter'\]\)/);
  assert.match(script,/if\(name==='eventposter'\)[\s\S]*day\.visible=index===focus/);
  assert.match(script,/project\.template==='eventposter'[\s\S]*day\.visible=dayIndex===selectedDay/);
  assert.match(script,/programTitle:'AU PROGRAMME'/);
  assert.match(script,/footer:'BONNE HUMEUR GARANTIE/);
  for(const token of ['tp-eventposter','variant-eventposter','variant-eventpostersquare'])assert.match(css,new RegExp(`\\.${token}`));
  assert.match(css,/\.variant-eventposter \.elDay__note[\s\S]*display:none/);
  assert.match(script,/async function renderArtboardToCanvas\(\)/);
});

test('Affiche propose un éditeur de contenu événementiel complet',()=>{
  for(const id of ['posterEditor','posterEyebrow','posterHero','posterPlatform','posterProgramTitle','posterSlot1Time','posterSlot1Title','posterSlot1Details','posterSlot2Time','posterSlot2Title','posterSlot2Details','posterSlot3Time','posterSlot3Title','posterSlot3Details','posterCallout','posterFooter'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(script,/const DEFAULT_POSTER =/);
  assert.match(script,/poster\.slots\.forEach/);
  assert.match(script,/refreshEventPoster=project\.template==='eventposter'[\s\S]*element\.role==='posterHero'/);
  for(const role of ['posterEyebrow','posterHero','posterPlatform','posterProgramTitle','posterCallout','posterFooter'])assert.match(script,new RegExp(`['"]${role}['"]`));
  assert.match(script,/`posterSlot\$\{index\+1\}Time`/);
  assert.match(script,/`posterSlot\$\{index\+1\}Content`/);
  assert.match(css,/\.posterEditor\{/);
  const quickTemplateMarkup=html.match(/<select id="quickTemplateSelect"[\s\S]*?<\/select>/)?.[0]||'';
  const quickTemplates=[...quickTemplateMarkup.matchAll(/<option value="([^"]+)"/g)].map(match=>match[1]);
  const templateCards=[...html.matchAll(/data-template="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(quickTemplates.at(-1),'eventposter');
  assert.equal(templateCards.at(-1),'eventposter');
  const inspectorIndex=html.indexOf('<aside class="inspector"');
  const posterEditorIndex=html.indexOf('id="posterEditor"');
  const layerManagerIndex=html.indexOf('class="layerManager"');
  assert.ok(posterEditorIndex>inspectorIndex && posterEditorIndex<layerManagerIndex);
  assert.doesNotMatch(html,/<details class="posterEditor"[^>]*\bopen\b/);
});

test('Duo Néon et Duo astral proposent deux compositions illustrées distinctes',()=>{
  assert.match(html,/data-template="neonduel"[\s\S]*<strong>Duo Néon<\/strong>/);
  assert.match(html,/value="neonduel">Duo Néon<\/option>/);
  assert.match(html,/data-template="astralduo"[\s\S]*<strong>Duo astral<\/strong>/);
  for(const token of ['tp-neonduel','tp-astralduo','variant-neonblue','variant-neonred','variant-astralblue','variant-astralrose'])assert.match(css,new RegExp(`\\.${token}`));
  assert.match(script,/function featureDuoCardLayout\(width,height\)/);
  assert.match(script,/function neonDuelCardLayout\(width,height\)/);
  assert.match(script,/DUO_TEMPLATES = new Set\(\['spotlight','neonduel','astralduo'\]\)/);
  assert.match(script,/day\.visible=index===1\|\|index===5/);
  assert.match(script,/els\.artboard\.className=`artboard template-\$\{project\.template\} format-\$\{project\.format\} modifier-\$\{project\.modifier\|\|'none'\}[^`]*`/);
  assert.match(script,/const keepImageFrame=element\.variant==='neonblue'\|\|element\.variant==='neonred'/);
  assert.match(css,/\.artboard\.template-neonduel::before/);
  assert.match(css,/\.variant-neonblue::before/);
  assert.doesNotMatch(script,/const versus=textElement\('VS'/);
  assert.match(script,/const sigil=textElement\('✦'/);
  assert.match(script,/function astralConstellation\(\)/);
  assert.match(script,/Carte des constellations/);
  assert.match(script,/refreshAstralDuo=project\.template==='astralduo'&&previousRevision<20/);
});

test('Aventure possède un portail interdimensionnel original et exportable',async()=>{
  assert.match(html,/value="adventure">Aventure<\/option>/);
  assert.match(html,/data-template="adventure"[\s\S]*<strong>Aventure<\/strong>/);
  assert.match(script,/adventure:\{bg:\['#030b12','#0b2a38'\]/);
  assert.match(script,/if\(style==='adventure'\)/);
  assert.match(script,/assets\/adventure-portal-v1\.png/);
  assert.match(script,/PASSAGE INTERDIMENSIONNEL/);
  assert.match(script,/CHOISIS TA DESTINATION/);
  assert.match(script,/refreshAdventure=project\.template==='adventure'&&previousRevision<14/);
  assert.match(css,/\.artboard\.template-adventure::after/);
  assert.match(css,/\.variant-adventure/);
  assert.match(css,/\.variant-adventure \.elDay__image\{border-radius:16px;clip-path:inset\(0 round 16px\)\}/);
  assert.match(css,/\.detachedDayText--adventure/);
  await access(new URL('../assets/adventure-portal-v1.png',import.meta.url));
});

test('Aventure 2 répartit sept portails égaux sur la forêt sans portail central',async()=>{
  assert.match(html,/value="adventure2">Aventure 2<\/option>/);
  assert.match(html,/data-template="adventure2"[\s\S]*<strong>Aventure 2<\/strong>/);
  assert.match(script,/adventure2:\{bg:\['#020b10','#0b3027'\]/);
  assert.match(script,/if\(style==='adventure2'\)/);
  assert.match(script,/assets\/adventure-forest-v2\.png/);
  assert.match(script,/assets\/adventure-portal-joint-v8\.png/);
  assert.match(script,/SEPT PASSAGES  •  SEPT DESTINATIONS/);
  assert.match(script,/element\.variant==='adventure2'/);
  assert.match(script,/class="elDay__portalRing" src="assets\/adventure-portal-joint-v8\.png"/);
  assert.match(css,/\.artboard\.template-adventure2::after/);
  assert.match(css,/\.variant-adventure2::before/);
  assert.match(css,/\.variant-adventure2 \.elDay__portalRing/);
  assert.match(css,/\.variant-adventure2,\.variant-adventure2\.hasImage,\.variant-adventure2\.isStar\{background:transparent!important;box-shadow:none!important\}/);
  assert.match(css,/\.variant-adventure2::after\{display:none\}/);
  assert.match(css,/\.variant-adventure2 \.elDay__image\{inset:13px;[\s\S]*clip-path:ellipse\(50% 50% at 50% 50%\)/);
  assert.match(css,/\.detachedDayText--adventure2/);
  await access(new URL('../assets/adventure-forest-v2.png',import.meta.url));
  assert.match(css,/\.variant-adventure2 \.elDay__image\{inset:24%;border:0/);
  assert.match(css,/\.variant-adventure2 \.elDay__name\{top:30%;width:44%;max-width:44%;border:0;background:transparent;box-shadow:none/);
  assert.match(css,/\.variant-adventure2 \.elDay__portalRing\{inset:0;width:100%;height:100%;opacity:\.72;filter:saturate\(1\.02\) brightness\(1\.04\);-webkit-mask-image:radial-gradient/);
  assert.match(css,/rgba\(0,0,0,\.62\) 43%,rgba\(0,0,0,\.22\) 48%,rgba\(0,0,0,\.06\) 52%,transparent 56%/);
  assert.match(css,/-webkit-mask-image:radial-gradient\(ellipse at center,#000 0 82%,rgba\(0,0,0,\.86\) 90%,rgba\(0,0,0,\.35\) 96%,transparent 100%\)/);
  await access(new URL('../assets/adventure-portal-joint-v8.png',import.meta.url));
});

test('Cozy desk adopte une ambiance chaleureuse complète',()=>{
  assert.match(script,/cozy:\{bg:\['#3a241f','#a96650'\]/);
  assert.match(script,/UNE SEMAINE AU CHAUD/);
  assert.match(script,/refreshCozy=project\.template==='cozy'&&previousRevision<13/);
  assert.match(css,/\.artboard\.template-cozy::before/);
  assert.match(css,/\.variant-cozy::before/);
  assert.match(css,/\.detachedDayText--cozy/);
});

test('les textes libérés des deux modèles duo conservent leurs accents',()=>{
  assert.match(script,/detachedDayText--\$\{card\.variant\}/);
  assert.match(script,/detachedDayText--\$\{element\.dayField\}/);
  for(const variant of ['neonblue','neonred','astralblue','astralrose'])assert.match(css,new RegExp(`detachedDayText--${variant}`));
  assert.match(css,/\.detachedDayText--neonblue\.detachedDayText--title[\s\S]*text-shadow:0 0 12px/);
  assert.match(css,/\.detachedDayText--astralblue\.detachedDayText--title[\s\S]*border-radius:999px/);
});

test('Arcade night est remplacé par un modèle RPG Zelda distinct',()=>{
  assert.match(html,/data-template="arcade"[\s\S]*<strong>RPG<\/strong>/);
  assert.doesNotMatch(html,/Arcade night/i);
  assert.match(script,/if\(style==='arcade'\)/);
  assert.match(script,/function questCrestWatermark\(\)/);
  assert.match(script,/JOURNAL DES QUÊTES/);
  assert.match(css,/\.variant-arcade::before/);
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

test('Violon v2 est retiré et ses anciens projets migrent vers la partition originale',()=>{
  assert.match(html,/data-template="violin"[\s\S]*<strong>Partition de violon<\/strong>/);
  assert.doesNotMatch(html,/data-template="violin2"|<strong>Violon v2<\/strong>/);
  assert.match(script,/if\(raw\.template==='violin2'\)raw\.template='violin'/);
  assert.match(script,/removedViolin2=parsed\.template==='violin2'/);
  assert.match(script,/if\(normalized\.variant==='violin2'\)normalized\.variant='violin'/);
  assert.doesNotMatch(css,/\.tp-violin2|\.variant-violin2/);
});

test('le fond du planning peut être uni ou dégradé depuis le panneau Design',()=>{
  const templatesPanel=html.match(/data-panel-content="templates"[\s\S]*?<\/section>/)?.[0]||'';
  const designPanel=html.match(/data-panel-content="design"[\s\S]*?<\/section>/)?.[0]||'';
  for(const id of ['backgroundColorPreview','backgroundColorPrimary','backgroundColorPrimaryValue','backgroundColorSecondary','backgroundColorSecondaryValue','backgroundAngle','backgroundAngleValue','resetBackgroundColorsBtn'])assert.match(designPanel,new RegExp(`id="${id}"`));
  assert.match(designPanel,/data-background-mode="solid"[\s\S]*Fond normal/);
  assert.match(designPanel,/data-background-mode="gradient"[\s\S]*Dégradé/);
  assert.doesNotMatch(templatesPanel,/backgroundColorDisclosure|Couleurs du fond/);
  assert.match(script,/background:\{mode:'gradient'/);
  assert.match(script,/raw\.background\.mode=raw\.background\.mode==='solid'\?'solid':'gradient'/);
  assert.match(script,/function backgroundCss\(bg=project\.background\)/);
  assert.match(script,/els\.backgroundColorPrimary\.addEventListener\('input'/);
  assert.match(script,/els\.backgroundColorSecondary\.addEventListener\('input'/);
  assert.match(script,/els\.backgroundAngle\.addEventListener\('input'/);
  assert.match(css,/\.backgroundModeSwitch/);
  assert.match(css,/\.backgroundColorEditor\.isSolid/);
  const disclosure=designPanel.match(/<details class="backgroundColorDisclosure"([^>]*)>/);
  assert.ok(disclosure);
  assert.doesNotMatch(disclosure[1],/\bopen\b/);
  assert.ok(designPanel.indexOf('Personnaliser le modèle')<designPanel.indexOf('class="backgroundColorDisclosure"'));
  assert.ok(designPanel.indexOf('class="backgroundColorDisclosure"')<designPanel.indexOf('Arrière-plan du planning'));
});

test('le planning rapide guide, valide et génère la semaine sans service distant',()=>{
  for(const id of ['quickPlanningPanel','detailedPlanningPanel','quickPlanningInput','quickPlanningFeedback','quickTemplateSelect','quickTemplatePreview','quickPlanningCreateBtn'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/Catégorie - Titre - Jour - Heure/);
  assert.match(html,/Wuthering Waves - Découverte de la mise à jour - Mardi - 20h30/);
  assert.match(script,/function parseQuickPlanning\(value\)/);
  assert.match(script,/function updateQuickPlanningFeedback\(\)/);
  assert.match(script,/async function generateQuickPlanning\(\)/);
  assert.match(script,/QUICK_DAY_ALIASES/);
  assert.match(script,/Les jours non indiqués seront masqués|day\.visible=false/);
  assert.match(script,/CATEGORY_LIBRARY_KEY/);
  assert.match(script,/function rememberCategoryImage/);
  assert.match(script,/function applyTemplateChoice\(name/);
  assert.match(script,/quickTemplateSelect\.addEventListener\('change'/);
  assert.match(css,/\.planningModeSwitch/);
  assert.match(css,/\.quickPlanningExample/);
  assert.match(css,/\.quickTemplatePicker/);
});

test('le titre et le sous-titre sont communs aux modes rapide et détaillé',()=>{
  const titleIndex=html.indexOf('id="planningTitle"');
  const subtitleIndex=html.indexOf('id="planningSubtitle"');
  const modeIndex=html.indexOf('class="planningModeSwitch"');
  const detailedIndex=html.indexOf('id="detailedPlanningPanel"');
  assert.ok(titleIndex>0 && subtitleIndex>titleIndex);
  assert.ok(subtitleIndex<modeIndex && modeIndex<detailedIndex);
  assert.match(html,/class="sharedPlanningFields" aria-label="Informations communes au planning"/);
  assert.match(css,/\.sharedPlanningFields/);
});

test('les dispositions affiche montrent la catégorie et le titre du planning rapide',()=>{
  assert.match(script,/title:entry\.off\?entry\.title:entry\.category/);
  assert.match(script,/note:entry\.off\?'':entry\.title/);
  assert.match(css,/\.dayLayout-poster \.elDay__title\{[^}]*bottom:43px/);
  assert.match(css,/\.dayLayout-poster \.elDay__note\{display:block;[^}]*bottom:15px/);
  assert.match(css,/\.dayLayout-poster \.elDay__note\{[^}]*text-overflow:ellipsis;white-space:nowrap/);
});

test('la seconde portée de violon et ses trois cartes sont décalées ensemble',()=>{
  assert.match(script,/y:row\?\(square\?700:630\)/);
  assert.match(script,/h:row\?\(square\?235:195\)/);
  assert.match(script,/secondStaffTop=width===height\?650:590/);
  assert.match(script,/secondStaffTop-35/);
  assert.match(script,/secondStaffTop-27/);
  assert.match(script,/function migrateViolinSecondScore\(\)/);
  assert.match(script,/if\(previousRevision<5\)migrateViolinSecondScore\(\)/);
  assert.match(script,/unlockDefaultLayers=previousRevision<4/);
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
  assert.match(script,/refreshReplacedModel=previousRevision<3&&project\.template==='rpg'/);
});

test('aucun calque de modèle n’est verrouillé par défaut',()=>{
  assert.match(script,/const MODEL_REVISION = 21;/);
  assert.match(script,/modelRevision:MODEL_REVISION/);
  assert.match(script,/elements\.forEach\(element=>\{element\.builtIn=true;element\.locked=false;\}\)/);
  assert.match(script,/unlockDefaultLayers=previousRevision<4/);
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

test('les aperçus de modèles utilisent le format compact demandé',()=>{
  assert.match(css,/\.templatePreview\{[^}]*height:47px/);
  assert.match(css,/\.templateCard\{[^}]*min-height:82px/);
});

test('colonnes, grille pop et horreur ont des structures visuelles propres',()=>{
  assert.match(script,/if\(name==='columns'\)[\s\S]*PLAYER SELECT/);
  assert.match(script,/7 JOURS  •  7 UNIVERS  •  1 AVENTURE/);
  assert.match(script,/const fills=\['#2a1258','#083e68','#551738'/);
  assert.match(script,/if\(name==='bubblegrid'\)[\s\S]*POP!  PLAY!  REPEAT!/);
  assert.match(script,/const fills=\['#14e6ff','#ff3bbb','#fff23d','#8d5cff','#58f77b','#ff8a2a','#4c7dff'\]/);
  assert.match(script,/if\(style==='bubblegrid'\)[\s\S]*topCount=4,bottomCount=3/);
  assert.match(script,/if\(name==='horror'\)[\s\S]*REC  00:13:37/);
  assert.match(script,/normalized\.variant==='candy'/);
  assert.match(css,/\.variant-bubblegrid::before[\s\S]*radial-gradient/);
  assert.match(css,/\.variant-bubblegrid \.elDay__name[\s\S]*box-shadow:4px 4px 0/);
  assert.match(css,/\.variant-bubblegrid\.hasImage \.elDay__name\{color:#17052e\}/);
  assert.match(css,/\.detachedDayText--bubblegrid\.detachedDayText--name\{color:#17052e!important\}/);
  assert.match(css,/\.variant-horror::before/);
});

test('grille pop et agenda gardent leurs textes lisibles dans leurs zones',()=>{
  assert.match(script,/if\(name==='agenda'\)[\s\S]*w:width===height\?width-140:1050[\s\S]*h:width===height\?92:112/);
  assert.match(script,/Object\.assign\(subtitle,\{align:'left',x:72,y:width===height\?148:158/);
  assert.match(script,/field==='name'&&element\.variant==='bubblegrid'\?Math\.min\(element\.w,Math\.max\(128,\(Number\(element\.fontSize\)\|\|22\)\*6\.2\)\):1/);
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
  assert.match(script,/els\.artboard\.className=`artboard template-\$\{project\.template\} format-\$\{project\.format\} modifier-\$\{project\.modifier\|\|'none'\}[^`]*`/);
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
  assert.match(css,/\.sideTabs\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css,/\.tabBtn\{[^}]*min-width:0;[^}]*flex-direction:column/);
  assert.doesNotMatch(html,/id="resetBtn"|↺ Réinitialiser/);
  assert.match(script,/function resetPlanning\(\)/);
  assert.match(script,/\[els\.resetPlanning,els\.topReset\]\.forEach\(button=>button\.addEventListener\('click',resetPlanning\)\)/);
  assert.doesNotMatch(html,/dayMovePanel|data-move-day|data-arrange/);
  assert.match(html,/data-panel="design"[^>]*>[\s\S]*?<span>3<\/span>Design<\/button>/);
  assert.match(html,/data-panel="planning"[^>]*>[\s\S]*?<span>1<\/span>Contenu<\/button>/);
  assert.match(html,/<div class="panelTitle"><h2>Modèles<\/h2>[\s\S]*id="randomizeDesignBtn"[\s\S]*Random<\/button>/);
  assert.doesNotMatch(html,/Choisis une ambiance|Modèle actuel/);
  assert.match(script,/card\.classList\.toggle\('isActive',active\)/);
  assert.match(css,/\.randomMixBtn\{/);
  assert.match(html,/data-panel-content="design"[\s\S]*Personnaliser le modèle[\s\S]*Couleurs du fond[\s\S]*Arrière-plan du planning/);
  const templatesPanel=html.match(/data-panel-content="templates"[\s\S]*?<\/section>/)?.[0]||'';
  assert.doesNotMatch(templatesPanel,/Personnaliser le modèle|Couleurs du fond|Arrière-plan du planning/);
  assert.doesNotMatch(html,/QR Code<\/strong><small>|Jour star<\/strong><small>/);
  assert.match(script,/els\.artboard\.addEventListener\('pointerdown',event=>\{\s*event\.stopPropagation\(\)/);
  assert.match(script,/els\.viewport\.addEventListener\('pointerdown',event=>\{[\s\S]*event\.target\.closest\('\.artboard'\)[\s\S]*selectElement\(''\)/);
});

test('Random compose un modèle hybride sans perdre le contenu utilisateur',()=>{
  assert.match(script,/const RANDOM_LAYOUTS = Object\.keys\(TEMPLATE_STYLE\)/);
  assert.match(script,/function randomizePlanningDesign\(\)/);
  assert.match(script,/project\.background\.colors=\[\.\.\.palette\.bg\]/);
  assert.match(script,/variant:skin\.card,fill:skinColors\.fill,color:skinColors\.color/);
  assert.match(script,/function applyRandomRecipe\(recipe/);
  assert.match(script,/els\.randomizeDesign\.addEventListener\('click',randomizePlanningDesign\)/);
});

test('Random expose cinq verrous et trois tirages récents',()=>{
  for(const id of ['randomSettingsBtn','randomControls','randomRecent'])assert.match(html,new RegExp(`id="${id}"`));
  for(const lock of ['layout','cards','palette','effects','typography'])assert.match(html,new RegExp(`data-random-lock="${lock}"`));
  assert.match(html,/randomizer\.js[\s\S]*preflight\.js[\s\S]*v2\.js/);
  assert.match(script,/PlanningRandomizer\.createRecipe/);
  assert.match(script,/PlanningRandomizer\.rememberRecipe/);
  assert.match(script,/data-random-recent/);
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

test('la bibliothèque contient trente-neuf emojis sans illustrations intégrées',()=>{
  const emojiBlock=script.match(/const EMOJIS = \[([^\]]+)\]/)?.[1]||'';
  assert.equal([...emojiBlock.matchAll(/'[^']+'/g)].length,39);
  assert.match(emojiBlock,/^'🗡️','💚','❤️'/);
  for(const emoji of ['☁️','🎧','🕹️','🐉','🏆','🍄','🌈','🦇','🪄','🎲'])assert.match(script,new RegExp(emoji));
  for(const emoji of ['🎤','🎻','🎼','🎵','💀','📼'])assert.match(script,new RegExp(emoji));
  for(const emoji of ['⚔️','🗡️','🪽','🌌','⚡','🧪','🏙️','🐺'])assert.match(script,new RegExp(emoji));
  assert.match(emojiBlock,/👾/);
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

test('la séparation conserve exactement la boîte du texte et ses alignements',()=>{
  assert.match(html,/id="propVAlign"/);
  assert.match(html,/Position verticale/);
  assert.match(script,/verticalAlign:'top'/);
  assert.match(script,/justify-content:\$\{verticalAlignment\(element\.verticalAlign\)\}/);
  assert.match(script,/els\.propVAlign\.value=element\.verticalAlign\|\|\(element\.type==='day'\?'theme':'top'\)/);
  assert.match(script,/element\.verticalAlign=els\.propVAlign\.value/);
  assert.match(script,/w:Math\.max\(20,rect\.width\/scale\),h:Math\.max\(20,rect\.height\/scale\)/);
  assert.doesNotMatch(script,/rect\.width\/scale\+8|rect\.height\/scale\+8/);
});

test('les textes intégrés se déplacent dans leur carte avec une sélection secondaire bornée',()=>{
  assert.match(script,/let selectedDayPart = null/);
  assert.match(script,/data-day-part="\$\{field\}"/);
  assert.match(script,/function beginDayPartInteraction/);
  assert.match(script,/mode:'dayPartDrag'/);
  assert.match(script,/function constrainDayPartPlacement/);
  assert.match(script,/Math\.max\(0,element\.w-placement\.w\)/);
  assert.match(script,/Math\.max\(0,element\.h-placement\.h\)/);
  assert.match(script,/selectedDayPart=null/);
  assert.match(css,/\.dayPart\.isDayPartSelected/);
  assert.match(css,/--day-part-selection/);
  assert.match(css,/\.dayPart\.hasCustomPosition/);
  assert.match(css,/Carte · clique un texte/);
  assert.match(css,/Texte · reste dans la carte/);
});

test('alignements effets et compositions utilisateur priment sur les vingt-quatre modèles',()=>{
  const horizontal=html.indexOf('id="propAlign"'),vertical=html.indexOf('id="propVAlign"'),textCase=html.indexOf('id="propTransform"');
  assert.ok(horizontal>0&&vertical>horizontal&&textCase>vertical,'les deux positions doivent être voisines avant la casse');
  assert.match(html,/id="propVAlign"[\s\S]*?<option value="theme">Selon le modèle<\/option>/);
  assert.match(script,/dayAlign-\$\{element\.align\|\|'left'\}/);
  assert.match(script,/dayVAlign-\$\{element\.verticalAlign\|\|'theme'\}/);
  assert.match(script,/element\.effectOverride\?' hasEffectOverride':''/);
  assert.match(script,/element\.layoutOverride\?' hasLayoutOverride':''/);
  assert.match(script,/if\(event\?\.target===els\.propTextEffect\)element\.effectOverride=true/);
  assert.match(script,/if\(event\?\.target===els\.propDayLayout\)element\.layoutOverride=true/);
  assert.match(script,/if\(\(element\.effectOverride\|\|element\.effect!==element\.dayVisualEffect\)/);
  for(const selector of ['dayAlign-left','dayAlign-center','dayAlign-right','dayVAlign-top','dayVAlign-center','dayVAlign-bottom','hasEffectOverride','hasLayoutOverride'])assert.match(css,new RegExp(selector));
  for(const layout of ['poster','feature','image'])assert.match(css,new RegExp(`hasLayoutOverride\\.dayLayout-${layout}`));
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
  for(const id of ['transparentBackground','layerTransparentBackground','backgroundImageInput','backgroundImageFit','backgroundImageOpacity','backgroundImageOpacityValue','cropBackgroundImageBtn','removeBackgroundImageBtn'])assert.match(html,new RegExp(`id="${id}"`));
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

test('le fond utilisateur remplace aussi les décors plein écran d’Aventure',()=>{
  assert.match(script,/hasUserBackground/);
  assert.match(script,/hasTransparentBackground/);
  assert.match(script,/veil\.role='templateBackgroundOverlay'/);
  assert.match(script,/\['adventure','adventure2'\]\.includes\(raw\.template\)[\s\S]*element\.role='templateBackgroundOverlay'/);
  assert.match(css,/\.artboard\.hasUserBackground \.role-templateBackground/);
  assert.match(css,/\.artboard\.hasTransparentBackground \.role-templateBackground/);
  assert.match(css,/\.artboard\.hasTransparentBackground \.role-templateBackgroundOverlay/);
  assert.match(css,/\.cropDialog\{width:min\(980px,calc\(100vw - 32px\)\)/);
  assert.match(css,/\.cropStage\{[^}]*min-width:0/);
  assert.match(css,/\.cropControls\{[^}]*min-width:0/);
});

test('Tous les calques propose un raccourci synchronisé vers le fond transparent',()=>{
  const manager=html.match(/<details class="layerManager">[\s\S]*?<div class="layerList" id="layerList"><\/div>/)?.[0]||'';
  assert.match(manager,/id="layerTransparentBackground"/);
  assert.ok(manager.indexOf('id="layerTransparentBackground"')<manager.indexOf('id="layerList"'));
  assert.match(script,/els\.transparentBackground\.checked=!!bg\.transparent;els\.layerTransparentBackground\.checked=!!bg\.transparent/);
  assert.match(script,/function setTransparentBackground\(enabled\)/);
  assert.match(script,/els\.transparentBackground\.addEventListener\('change',\(\)=>setTransparentBackground\(els\.transparentBackground\.checked\)\)/);
  assert.match(script,/els\.layerTransparentBackground\.addEventListener\('change',\(\)=>setTransparentBackground\(els\.layerTransparentBackground\.checked\)\)/);
  assert.match(css,/\.layerTransparencyToggle/);
});

test('le PNG sérialise le vrai DOM sans remplacer l’aperçu par un raster',()=>{
  assert.doesNotMatch(html,/html2canvas|renderSurface/);
  assert.match(script,/function renderArtboardToCanvas\(\)/);
  assert.match(script,/function inlineStyle\(source,target,pseudo=''\)/);
  assert.match(script,/function exportClone\(\)/);
  assert.match(script,/async function portableImageSrc\(image\)/);
  assert.match(script,/target\.setAttribute\('src',await portableImageSrc\(source\)\)/);
  assert.match(script,/copy=await exportClone\(\)/);
  assert.match(script,/new XMLSerializer\(\)\.serializeToString\(copy\)/);
  assert.match(script,/<foreignObject x=/);
  assert.match(script,/encodeURIComponent\(svg\)/);
  assert.match(script,/const canvas=await renderArtboardToCanvas\(\)/);
  assert.doesNotMatch(script,/window\.html2canvas|prepareExportDom|renderSurface/);
  assert.equal([...script.matchAll(/style='[^']*\$\{typographyStyle\(element\)\}/g)].length,2);
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
  assert.match(preflightScript,/Élément hors du planning/);
  assert.match(preflightScript,/Texte potentiellement coupé/);
});

test('le diagnostic détaillé ouvre des alertes qui sélectionnent leur calque',()=>{
  for(const id of ['preflightStatus','preflightPanel','preflightIssues'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/<button[^>]+id="preflightStatus"/);
  assert.match(script,/PlanningPreflight\.inspectProject/);
  assert.match(script,/data-preflight-id/);
  assert.match(script,/selectElement\(issueButton\.dataset\.preflightId\)/);
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
  assert.match(script,/const VERSION = '2\.3\.2'/);
  assert.equal(packageJson.version,'2.3.2');
  assert.match(readme,/PlanningGPT V2\.3\.2/);
});

test('les textes libérés conservent les styles calculés des cartes',()=>{
  assert.match(script,/function dayVisualSnapshot\(computed\)/);
  assert.match(script,/function dayVisualCss\(visual,element\)/);
  assert.match(script,/dayVisual:placement\.visual\|\|null/);
  assert.match(script,/dayVisualEffect:card\.variant==='bubblegrid'\?'none':card\.effect/);
  for(const property of ['background-color','border-bottom','border-radius','box-shadow','text-shadow','-webkit-text-stroke-width'])assert.match(script,new RegExp(property));
  for(const variant of ['bubblegrid','columns','arcade','twitch','violin','neonblue','astralblue'])assert.match(css,new RegExp(`detachedDayText--legacy\\.detachedDayText--${variant}`));
  assert.match(css,/\.variant-bubblegrid::after\{display:none\}/);
  assert.match(css,/\.variant-bubblegrid\.textEffect-hard\{text-shadow:none\}/);
});

test('le stockage est chargé avant le studio',()=>{
  assert.ok(html.indexOf('storage.js')<html.indexOf('v2.js'));
});
