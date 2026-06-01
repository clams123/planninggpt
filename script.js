const STORAGE_KEY = 'planninggpt_clean_v25';
const DAY_NAMES = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const DAY_SHORT = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const THEMES = ['midnight','clean','neon','galaxy','twilight','lavenderline','moonspell','roseglass','cybermint','goldenhour','abyssblue','candypop','ocean','forest','sunset','noir','pastel','arcade','horror','horrorvhs','cozy','royal','crystalfantasy','manga','synthwave','emerald','velvet','aurora','obsidian','sakura','volcanic','pixelnight','witchcore','cloudnine','toxiclime','deepsea','copperpunk'];
const THEME_LABELS = {
  midnight:'Midnight Stream', clean:'Minimal clair', neon:'Néon violet', galaxy:'Galaxy violet', twilight:'Twilight Violet', lavenderline:'Lavender Line', moonspell:'Moonspell', roseglass:'Rose Glass', cybermint:'Cyber Mint', goldenhour:'Golden Hour', abyssblue:'Abyss Blue', candypop:'Candy Pop', ocean:'Ocean bleu', forest:'Forêt émeraude', sunset:'Sunset chaud', noir:'Noir & Or', pastel:'Pastel doux', arcade:'Arcade Pixel', horror:'Horror Night', horrorvhs:'Horreur VHS', cozy:'Cozy Café', royal:'Royal Blue', crystalfantasy:'Fantasy Ciel Étoilé', manga:'Manga Pop', synthwave:'Synthwave Sunset', emerald:'Emerald Glass', velvet:'Red Velvet', aurora:'Aurora Stream', obsidian:'Obsidian Gold', sakura:'Sakura Dream', volcanic:'Volcanic Raid', pixelnight:'Pixel Night', witchcore:'Witchcore', cloudnine:'Cloud Nine', toxiclime:'Toxic Lime', deepsea:'Deep Sea', copperpunk:'Copper Punk'
};

const DAY_TEXT_COLOR_PRESETS = ['#ffffff','#f8fafc','#fde68a','#fca5a5','#f9a8d4','#c4b5fd','#93c5fd','#67e8f9','#86efac','#111827'];
let dayColorPanelOpen = false;

const $ = (id) => document.getElementById(id);
const els = {
  title: $('titleInput'), subtitle: $('subtitleInput'), dayTabs: $('dayTabs'), currentDayLabel: $('currentDayLabel'),
  dayColorPanel: $('dayColorPanel'), dayColorSwatches: $('dayColorSwatches'), dayTextColor: $('dayTextColorInput'), dayTextColorReset: $('dayTextColorResetBtn'), dayColorStatus: $('dayColorStatus'),
  visible: $('dayVisibleInput'), time: $('timeInput'), category: $('categoryInput'), note: $('noteInput'),
  align: $('textAlignInput'), valign: $('textVAlignInput'), dayHighlight: $('dayHighlightInput'),
  off: $('offBtn'), clearDay: $('clearDayBtn'), duplicate: $('duplicateBtn'),
  imageInput: $('imageInput'), chooseImage: $('chooseImageBtn'), removeImage: $('removeImageBtn'), cropImage: $('cropImageBtn'), imageName: $('imageName'),
  imageFit: $('imageFitInput'), imagePosition: $('imagePositionInput'), dayTransparent: $('dayTransparentInput'),
  theme: $('themeInput'), themeGallery: $('themeGallery'), favoriteThemeList: $('favoriteThemeList'), toggleThemeFavorite: $('toggleThemeFavoriteBtn'), specialMode: $('specialModeInput'), hideSpecialLabels: $('hideSpecialLabelsInput'), eventBanner: $('eventBannerInput'), starDay: $('starDayInput'), qr: $('qrInput'),
  transparentPng: $('transparentPngInput'), checker: $('checkerInput'),
  previewFrame: $('previewFrame'), canvas: $('planningCanvas'), weekGrid: $('weekGrid'), qrBox: $('qrBox'), previewTitle: $('previewTitle'), previewSubtitle: $('previewSubtitle'), previewEventBanner: $('previewEventBanner'), overflowStatus: $('overflowStatus'),
  saveStatus: $('saveStatus'), viewStatus: $('viewStatus'), exportPng: $('exportPngBtn'), save: $('saveBtn'), undo: $('undoBtn'), redo: $('redoBtn'), reset: $('resetBtn'),
  duplicateModal: $('duplicateModal'), duplicateChoices: $('duplicateChoices'), duplicateCancel: $('duplicateCancelBtn'), duplicateModalText: $('duplicateModalText'),
  resetModal: $('resetModal'), resetCancel: $('resetCancelBtn'), resetKeep: $('resetKeepBtn'), resetConfirm: $('resetConfirmBtn'),
  cropModal: $('cropModal'), cropCancel: $('cropCancelBtn'), cropKeep: $('cropKeepBtn'), cropApply: $('cropApplyBtn'), cropModalText: $('cropModalText'),
  cropGridStage: $('cropGridStage'), cropListStage: $('cropListStage'), cropGridImg: $('cropGridImg'), cropListImg: $('cropListImg'),
  cropGridZoom: $('cropGridZoomInput'), cropListZoom: $('cropListZoomInput'), cropGridZoomValue: $('cropGridZoomValue'), cropListZoomValue: $('cropListZoomValue'),
  cropGridStretchY: $('cropGridStretchYInput'), cropListStretchX: $('cropListStretchXInput'), cropGridStretchYValue: $('cropGridStretchYValue'), cropListStretchXValue: $('cropListStretchXValue'),
  cropGridReset: $('cropGridResetBtn'), cropListReset: $('cropListResetBtn'), cropCopyGridToList: $('cropCopyGridToListBtn'), cropCopyListToGrid: $('cropCopyListToGridBtn'),
  toast: $('toastContainer')
};

let selectedDay = 0;
let saveTimer = null;
let historyTimer = null;
let undoStack = [];
let redoStack = [];
let isRestoringHistory = false;
const MAX_HISTORY = 60;

// V26 : compression automatique des images importées.
// Objectif : préserver la qualité visuelle tout en évitant de saturer le stockage local.
const IMAGE_MAX_SIDE = 1920;
const IMAGE_QUALITY = 0.90;
const IMAGE_SMALL_FILE_LIMIT = 450 * 1024;
const IMAGE_KEEP_ORIGINAL_RATIO = 0.94;
const IMAGE_TYPES_NOT_COMPRESSED = ['image/svg+xml', 'image/gif'];

// V29 : recadrage manuel non destructif pour la grille et la liste.
const DEFAULT_IMAGE_CROP = {zoom:1, x:0, y:0, stretchX:1, stretchY:1};
const IMAGE_CROP_MIN_ZOOM = 0.1;
const IMAGE_CROP_MAX_ZOOM = 3;
const IMAGE_CROP_MIN_OFFSET = -100;
const IMAGE_CROP_MAX_OFFSET = 100;
const IMAGE_CROP_MIN_STRETCH = 0.5;
const IMAGE_CROP_MAX_STRETCH = 3;

const DEFAULT_STATE = {
  title:'Planning de la semaine',
  subtitle:'twitch.tv/ton_lien',
  theme:'midnight',
  view:'grid',
  format:'wide',
  specialMode:'none',
  hideSpecialLabels:false,
  eventBanner:'',
  showQr:false,
  transparentPng:false,
  checker:false,
  favoriteThemes:[],
  days:[
    {time:'20h30',category:'Just Chatting',note:'On démarre la semaine tranquillement',visible:true,image:'',imageName:'',imageFit:'cover',imagePosition:'center center',transparent:false,highlighted:false,textAlign:'left',textVAlign:'bottom',star:false,imageCropGrid:{zoom:1,x:0,y:0},imageCropList:{zoom:1,x:0,y:0}},
    {time:'OFF',category:'Repos',note:'',visible:true,image:'',imageName:'',imageFit:'cover',imagePosition:'center center',transparent:false,highlighted:false,textAlign:'left',textVAlign:'bottom',star:false,imageCropGrid:{zoom:1,x:0,y:0},imageCropList:{zoom:1,x:0,y:0}},
    {time:'21h',category:'Jeu découverte',note:'Une soirée découverte sans pression',visible:true,image:'',imageName:'',imageFit:'cover',imagePosition:'center center',transparent:false,highlighted:false,textAlign:'left',textVAlign:'bottom',star:false,imageCropGrid:{zoom:1,x:0,y:0},imageCropList:{zoom:1,x:0,y:0}},
    {time:'21h',category:'RPG / Aventure',note:'Suite de l’aventure',visible:true,image:'',imageName:'',imageFit:'cover',imagePosition:'center center',transparent:false,highlighted:false,textAlign:'left',textVAlign:'bottom',star:false,imageCropGrid:{zoom:1,x:0,y:0},imageCropList:{zoom:1,x:0,y:0}},
    {time:'21h',category:'Horreur',note:'Ambiance canapé, plaid et sursauts',visible:true,image:'',imageName:'',imageFit:'cover',imagePosition:'center center',transparent:false,highlighted:false,textAlign:'left',textVAlign:'bottom',star:false,imageCropGrid:{zoom:1,x:0,y:0},imageCropList:{zoom:1,x:0,y:0}},
    {time:'20h',category:'Viewers games',note:'Soirée avec la commu',visible:true,image:'',imageName:'',imageFit:'cover',imagePosition:'center center',transparent:false,highlighted:false,textAlign:'left',textVAlign:'bottom',star:false,imageCropGrid:{zoom:1,x:0,y:0},imageCropList:{zoom:1,x:0,y:0}},
    {time:'14h30',category:'Stream chill',note:'Dimanche détente',visible:true,image:'',imageName:'',imageFit:'cover',imagePosition:'center center',transparent:false,highlighted:false,textAlign:'left',textVAlign:'bottom',star:false,imageCropGrid:{zoom:1,x:0,y:0},imageCropList:{zoom:1,x:0,y:0}}
  ]
};
let state = clone(DEFAULT_STATE);

function clone(v){ return JSON.parse(JSON.stringify(v)); }
function esc(v){ return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function oneOf(v, list, fallback){ return list.includes(v) ? v : fallback; }
function clampNumber(value, min, max, fallback){
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function normalizeImageCrop(value, mode){
  const crop = value && typeof value === 'object' ? value : {};
  const normalized = {
    zoom:clampNumber(crop.zoom, IMAGE_CROP_MIN_ZOOM, IMAGE_CROP_MAX_ZOOM, DEFAULT_IMAGE_CROP.zoom),
    x:clampNumber(crop.x, IMAGE_CROP_MIN_OFFSET, IMAGE_CROP_MAX_OFFSET, DEFAULT_IMAGE_CROP.x),
    y:clampNumber(crop.y, IMAGE_CROP_MIN_OFFSET, IMAGE_CROP_MAX_OFFSET, DEFAULT_IMAGE_CROP.y),
    stretchX:clampNumber(crop.stretchX, IMAGE_CROP_MIN_STRETCH, IMAGE_CROP_MAX_STRETCH, DEFAULT_IMAGE_CROP.stretchX),
    stretchY:clampNumber(crop.stretchY, IMAGE_CROP_MIN_STRETCH, IMAGE_CROP_MAX_STRETCH, DEFAULT_IMAGE_CROP.stretchY)
  };

  // La V29.5 garde deux usages volontairement simples :
  // - Grille : étirement vertical uniquement.
  // - Liste : étirement horizontal uniquement.
  // L'axe non utilisé reste à 100% pour éviter les déformations cachées.
  if (mode === 'grid') normalized.stretchX = 1;
  if (mode === 'list') normalized.stretchY = 1;

  return normalized;
}
function getDayImageCrop(day, mode){
  return normalizeImageCrop(mode === 'list' ? day.imageCropList : day.imageCropGrid, mode);
}
function normalizeTextColor(value){
  const raw = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw.toLowerCase() : '';
}
function hasCustomTextColors(){
  return state.days.some(day => normalizeTextColor(day.textColor));
}
function clearCustomTextColorsForThemeChange(){
  if (!hasCustomTextColors()) return false;
  state.days.forEach(day => { day.textColor = ''; });
  toast('Changement de thème : couleurs d’écriture personnalisées réinitialisées.');
  return true;
}
function setThemeAndResetTextColors(theme){
  if (!THEMES.includes(theme)) return;
  if (state.theme !== theme) clearCustomTextColorsForThemeChange();
  state.theme = theme;
}
function normalizeDay(day, index){
  const d = day && typeof day === 'object' ? day : {};
  return {
    time:String(d.time ?? ''),
    category:String(d.category ?? ''),
    note:String(d.note ?? ''),
    visible:typeof d.visible === 'boolean' ? d.visible : true,
    image:String(d.image ?? '').startsWith('data:image/') ? String(d.image) : '',
    imageName:String(d.imageName ?? ''),
    imageFit:oneOf(d.imageFit, ['cover','contain'], 'cover'),
    imagePosition:oneOf(d.imagePosition, ['center center','center top','center bottom','left center','right center'], 'center center'),
    transparent:!!d.transparent,
    highlighted:!!d.highlighted,
    star:!!d.star,
    textColor:normalizeTextColor(d.textColor),
    imageCropGrid:normalizeImageCrop(d.imageCropGrid, 'grid'),
    imageCropList:normalizeImageCrop(d.imageCropList, 'list'),
    textAlign:oneOf(d.textAlign, ['left','center','right'], 'left'),
    textVAlign:oneOf(d.textVAlign, ['top','center','bottom'], 'bottom')
  };
}
function normalizeState(raw){
  const base = clone(DEFAULT_STATE);
  const input = raw && typeof raw === 'object' ? raw : {};
  base.title = String(input.title ?? base.title);
  base.subtitle = String(input.subtitle ?? base.subtitle);
  base.theme = oneOf(input.theme, THEMES, 'midnight');
  base.view = oneOf(input.view, ['grid','list'], 'grid');
  base.format = oneOf(input.format, ['wide','square'], 'wide');
  base.specialMode = oneOf(input.specialMode, ['none','poster','ticket','restaurant','rpg','logbook','anime','marathon','release','subathon','indie','challenge'], 'none');
  base.hideSpecialLabels = !!input.hideSpecialLabels;
  base.eventBanner = String(input.eventBanner ?? '');
  base.showQr = !!input.showQr;
  base.transparentPng = !!input.transparentPng;
  base.checker = !!input.checker;
  base.favoriteThemes = Array.isArray(input.favoriteThemes) ? input.favoriteThemes.filter(theme => THEMES.includes(theme)).filter((theme, index, list) => list.indexOf(theme) === index) : [];
  if (Array.isArray(input.days) && input.days.length === 7) base.days = input.days.map(normalizeDay);
  return base;
}

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = normalizeState(JSON.parse(raw));
  }catch{
    state = clone(DEFAULT_STATE);
    toast('Sauvegarde locale illisible : base propre chargée.');
  }
}
function save(silent=true){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    els.saveStatus.textContent = 'Sauvegardé';
    if (!silent) toast('Sauvegarde locale effectuée.');
  }catch{
    els.saveStatus.textContent = 'Non sauvegardé';
    toast('Sauvegarde locale impossible : image trop lourde ou stockage plein.');
  }
}
function scheduleSave(){
  els.saveStatus.textContent = 'Sauvegarde...';
  queueHistorySnapshot();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => save(true), 200);
}
function toast(message){
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  els.toast.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function snapshotState(){
  return JSON.stringify(state);
}
function initHistory(){
  undoStack = [snapshotState()];
  redoStack = [];
  updateHistoryButtons();
}
function updateHistoryButtons(){
  if (els.undo) els.undo.disabled = undoStack.length <= 1;
  if (els.redo) els.redo.disabled = redoStack.length === 0;
}
function pushHistorySnapshot(){
  if (isRestoringHistory) return;
  const snap = snapshotState();
  if (undoStack[undoStack.length - 1] === snap) {
    updateHistoryButtons();
    return;
  }
  undoStack.push(snap);
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack = [];
  updateHistoryButtons();
}
function queueHistorySnapshot(){
  if (isRestoringHistory) return;
  clearTimeout(historyTimer);
  historyTimer = setTimeout(pushHistorySnapshot, 180);
}
function flushHistorySnapshot(){
  clearTimeout(historyTimer);
  pushHistorySnapshot();
}
function restoreHistorySnapshot(snap){
  try{
    isRestoringHistory = true;
    state = normalizeState(JSON.parse(snap));
    selectedDay = Math.max(0, Math.min(selectedDay, 6));
    renderAll();
    save(true);
  }catch{
    toast('Historique illisible : action annulée.');
  }finally{
    isRestoringHistory = false;
    updateHistoryButtons();
  }
}
function undoChange(){
  flushHistorySnapshot();
  if (undoStack.length <= 1) return;
  const current = undoStack.pop();
  redoStack.push(current);
  restoreHistorySnapshot(undoStack[undoStack.length - 1]);
}
function redoChange(){
  if (!redoStack.length) return;
  const snap = redoStack.pop();
  undoStack.push(snap);
  restoreHistorySnapshot(snap);
}

function renderAll(){
  renderControls();
  renderTabs();
  renderEditor();
  renderPreview();
}
function renderControls(){
  els.title.value = state.title;
  els.subtitle.value = state.subtitle;
  els.theme.value = state.theme;
  els.specialMode.value = state.specialMode;
  if (els.hideSpecialLabels) els.hideSpecialLabels.checked = !!state.hideSpecialLabels;
  if (els.eventBanner) els.eventBanner.value = state.eventBanner || '';
  els.qr.checked = state.showQr;
  els.transparentPng.checked = state.transparentPng;
  els.checker.checked = state.checker;
  document.querySelectorAll('.segBtn').forEach(btn => {
    btn.classList.toggle('isActive', state[btn.dataset.option] === btn.dataset.value);
  });
  els.viewStatus.textContent = state.view === 'grid' ? 'Grille' : 'Liste';
  renderFavoriteThemes();
  renderThemeGallery();
  updateHistoryButtons();
}
function renderFavoriteThemes(){
  if (!els.favoriteThemeList || !els.toggleThemeFavorite) return;
  const currentIsFavorite = state.favoriteThemes.includes(state.theme);
  els.toggleThemeFavorite.textContent = currentIsFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
  els.toggleThemeFavorite.classList.toggle('isFavorite', currentIsFavorite);

  if (!state.favoriteThemes.length) {
    els.favoriteThemeList.innerHTML = '<span class="favoriteThemeEmpty">Aucun favori pour le moment.</span>';
    return;
  }

  els.favoriteThemeList.innerHTML = state.favoriteThemes.map(theme => {
    const active = theme === state.theme ? ' isActive' : '';
    return `<button class="favoriteThemeChip${active}" type="button" data-favorite-theme="${theme}">★ ${esc(THEME_LABELS[theme] || theme)}</button>`;
  }).join('');
}

function renderThemeGallery(){
  if (!els.themeGallery) return;
  const priority = [...state.favoriteThemes, state.theme, 'midnight','horrorvhs','crystalfantasy','cozy','sakura','obsidian','neon','clean']
    .filter((theme, index, list) => THEMES.includes(theme) && list.indexOf(theme) === index)
    .slice(0, 10);
  els.themeGallery.innerHTML = priority.map(theme => {
    const active = theme === state.theme ? ' isActive' : '';
    const fav = state.favoriteThemes.includes(theme) ? ' ★' : '';
    return `<button class="themeCardMini theme-${theme}${active}" type="button" data-theme-mini="${theme}" title="${esc(THEME_LABELS[theme] || theme)}">
      <span class="themeCardMini__preview"><i></i><i></i><i></i></span>
      <strong>${esc(THEME_LABELS[theme] || theme)}${fav}</strong>
    </button>`;
  }).join('');
}

function toggleCurrentThemeFavorite(){
  const theme = state.theme;
  if (!THEMES.includes(theme)) return;
  const index = state.favoriteThemes.indexOf(theme);
  if (index >= 0) {
    state.favoriteThemes.splice(index, 1);
    toast(`${THEME_LABELS[theme] || theme} retiré des favoris.`);
  } else {
    state.favoriteThemes.push(theme);
    toast(`${THEME_LABELS[theme] || theme} ajouté aux favoris.`);
  }
  renderControls();
  scheduleSave();
}

function renderTabs(){
  const tabs = DAY_SHORT.map((label, index) => {
    const active = index === selectedDay ? ' isActive' : '';
    const hidden = state.days[index].visible ? '' : ' isHidden';
    const hasColor = normalizeTextColor(state.days[index].textColor) ? ' hasCustomTextColor' : '';
    return `<button class="dayTab${active}${hidden}${hasColor}" type="button" data-day="${index}">${label}</button>`;
  }).join('');
  const colorActive = normalizeTextColor(state.days[selectedDay].textColor) ? ' hasCustomTextColor' : '';
  const panelActive = dayColorPanelOpen ? ' isActive' : '';
  els.dayTabs.innerHTML = `${tabs}<button class="dayColorToggle${colorActive}${panelActive}" type="button" data-day-color-toggle="true" title="Changer la couleur d’écriture du jour">🎨</button>`;
}
function renderDayColorPanel(){
  if (!els.dayColorPanel || !els.dayColorSwatches || !els.dayTextColor) return;
  const d = state.days[selectedDay];
  const current = normalizeTextColor(d.textColor);
  els.dayColorPanel.hidden = !dayColorPanelOpen;
  els.dayTextColor.value = current || '#ffffff';
  if (els.dayColorStatus) els.dayColorStatus.textContent = current ? current.toUpperCase() : 'Couleur du thème';
  if (els.dayTextColorReset) els.dayTextColorReset.disabled = !current;
  els.dayColorSwatches.innerHTML = DAY_TEXT_COLOR_PRESETS.map(color => {
    const active = current === color.toLowerCase() ? ' isActive' : '';
    return `<button class="dayColorSwatch${active}" type="button" data-day-text-color="${color}" style="--swatch:${color}" title="${color}"></button>`;
  }).join('');
}
function setSelectedDayTextColor(color){
  const valid = normalizeTextColor(color);
  if (!valid) return;
  state.days[selectedDay].textColor = valid;
  renderTabs();
  renderDayColorPanel();
  renderPreview();
  scheduleSave();
}
function resetSelectedDayTextColor(){
  state.days[selectedDay].textColor = '';
  renderTabs();
  renderDayColorPanel();
  renderPreview();
  scheduleSave();
}
function renderEditor(){
  const d = state.days[selectedDay];
  els.currentDayLabel.textContent = DAY_NAMES[selectedDay];
  els.visible.checked = d.visible;
  els.time.value = d.time;
  els.category.value = d.category;
  els.note.value = d.note;
  els.align.value = d.textAlign;
  els.valign.value = d.textVAlign;
  els.imageFit.value = d.imageFit;
  els.imagePosition.value = d.imagePosition;
  els.dayTransparent.checked = d.transparent;
  els.dayHighlight.checked = !!d.highlighted;
  els.starDay.checked = !!d.star;
  els.imageName.textContent = d.imageName ? `Image : ${d.imageName}` : 'Aucune image choisie';
  renderDayColorPanel();
  if (els.cropImage) els.cropImage.disabled = !d.image;
}
function verticalToCss(value){
  if (value === 'top') return 'start';
  if (value === 'bottom') return 'end';
  return 'center';
}
function renderEventBanner(){
  if (!els.previewEventBanner) return;
  const text = String(state.eventBanner || '').trim();
  els.previewEventBanner.textContent = text;
  els.previewEventBanner.classList.toggle('isVisible', !!text);
  els.previewEventBanner.setAttribute('aria-hidden', text ? 'false' : 'true');
}

const LIST_THEMES_WITH_HIDDEN_NOTES = ['twilight','lavenderline','moonspell','roseglass','cybermint','goldenhour','abyssblue','candypop'];
const SPECIAL_MODES_WITH_LABEL = ['poster','ticket','restaurant','rpg','logbook','anime','marathon','release','subathon','indie','challenge'];

function getLongestWordLength(value){
  return String(value || '').split(/\s+/).reduce((max, word) => Math.max(max, word.length), 0);
}
function getManualLineCount(value){
  const text = String(value || '').trim();
  if (!text) return 0;
  return text.split(/\r?\n/).length;
}
function getOverflowThresholds(){
  const listMode = state.view === 'list';
  const squareMode = state.format === 'square';
  const specialMode = SPECIAL_MODES_WITH_LABEL.includes(state.specialMode);
  const notesHiddenInList = listMode && LIST_THEMES_WITH_HIDDEN_NOTES.includes(state.theme);

  if (listMode) {
    return {
      label:'liste',
      notesHidden:notesHiddenInList,
      time:18,
      category:78,
      note:notesHiddenInList ? 9999 : 220,
      noteLines:notesHiddenInList ? 9999 : 7,
      word:36
    };
  }

  if (squareMode) {
    return {
      label:'carré',
      notesHidden:false,
      time:7,
      category:specialMode ? 20 : 22,
      note:specialMode ? 48 : 54,
      noteLines:2,
      word:specialMode ? 16 : 17
    };
  }

  if (specialMode) {
    return {
      label:'grille + mode spécial',
      notesHidden:false,
      time:8,
      category:25,
      note:74,
      noteLines:3,
      word:18
    };
  }

  return {
    label:'grille',
    notesHidden:false,
    time:8,
    category:32,
    note:92,
    noteLines:3,
    word:20
  };
}
function findOverflowWarnings(){
  const thresholds = getOverflowThresholds();
  const warnings = [];

  state.days.forEach((day, index) => {
    if (!day.visible) return;
    const time = String(day.time || '').trim();
    const category = String(day.category || '').trim();
    const note = thresholds.notesHidden ? '' : String(day.note || '').trim();
    const tooLong =
      time.length > thresholds.time ||
      category.length > thresholds.category ||
      note.length > thresholds.note ||
      getManualLineCount(note) > thresholds.noteLines ||
      getLongestWordLength(category) > thresholds.word ||
      getLongestWordLength(note) > thresholds.word;
    if (tooLong) warnings.push(DAY_SHORT[index]);
  });
  return warnings;
}
function updateOverflowStatus(){
  if (!els.overflowStatus) return;
  const thresholds = getOverflowThresholds();
  const warnings = findOverflowWarnings();
  if (!warnings.length) {
    els.overflowStatus.hidden = true;
    els.overflowStatus.textContent = '';
    els.overflowStatus.title = '';
    return;
  }
  els.overflowStatus.hidden = false;
  els.overflowStatus.textContent = `Texte à vérifier (${thresholds.label}) : ${warnings.join(', ')}`;
  els.overflowStatus.title = `Certains textes peuvent être coupés dans l’export. Les seuils sont plus larges en mode liste.`;
}

function clearPreviewFit(){
  if (!els.canvas) return;
  els.canvas.style.removeProperty('width');
  els.canvas.style.removeProperty('height');
  els.canvas.style.removeProperty('max-width');
  els.canvas.style.removeProperty('max-height');
  els.canvas.style.removeProperty('zoom');
}

function fitPreviewCanvas(){
  if (!els.previewFrame || !els.canvas) return;

  const frameRect = els.previewFrame.getBoundingClientRect();
  if (!frameRect.width || !frameRect.height) return;

  // Mode liste : on part de la même largeur de référence que l'export PNG,
  // puis on réduit uniquement l'aperçu à l'écran avec zoom. Cela évite le
  // scroll interne tout en gardant une mise en page fidèle à l'export.
  if (state.view === 'list') {
    const frameStyles = getComputedStyle(els.previewFrame);
    const paddingX = (parseFloat(frameStyles.paddingLeft) || 0) + (parseFloat(frameStyles.paddingRight) || 0);
    const paddingY = (parseFloat(frameStyles.paddingTop) || 0) + (parseFloat(frameStyles.paddingBottom) || 0);
    const availableWidth = Math.max(1, frameRect.width - paddingX);
    const availableHeight = Math.max(1, frameRect.height - paddingY);

    els.canvas.style.width = '1600px';
    els.canvas.style.height = 'auto';
    els.canvas.style.maxWidth = 'none';
    els.canvas.style.maxHeight = 'none';
    els.canvas.style.zoom = '1';

    const naturalWidth = Math.max(1, els.canvas.offsetWidth);
    const naturalHeight = Math.max(1, els.canvas.scrollHeight || els.canvas.offsetHeight);
    const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight, 1);
    els.canvas.style.zoom = String(Math.max(0.1, Math.min(scale, 1)));
    requestAnimationFrame(applyPreviewImageCrops);
    return;
  }

  // Mode grille : conserve le comportement V28.6.
  clearPreviewFit();
  const ratio = state.format === 'square' ? 1 : 16 / 9;
  const maxWidth = Math.max(260, frameRect.width - 2);
  const maxHeight = Math.max(260, frameRect.height - 2);

  let width = maxWidth;
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  els.canvas.style.width = `${Math.floor(width)}px`;
  els.canvas.style.height = `${Math.floor(height)}px`;
  requestAnimationFrame(applyPreviewImageCrops);
}

function renderPreview(){
  els.previewTitle.textContent = state.title || 'Planning de la semaine';
  els.previewSubtitle.textContent = state.subtitle || '';
  renderEventBanner();
  updateOverflowStatus();
  els.previewFrame.classList.toggle('isChecker', state.checker || state.transparentPng);
  els.canvas.className = [
    'planningCanvas',
    `theme-${state.theme}`,
    `view-${state.view}`,
    `format-${state.format}`,
    `mode-${state.specialMode}`,
    state.hideSpecialLabels ? 'hideSpecialLabels' : '',
    state.showQr ? 'hasQr' : '',
    String(state.eventBanner || '').trim() ? 'hasEventBanner' : '',
    state.transparentPng ? 'canvasTransparent' : ''
  ].filter(Boolean).join(' ');

  const visible = state.days.map((d,i) => ({...d,index:i})).filter(d => d.visible);
  els.weekGrid.innerHTML = visible.map(day => {
    const isOff = day.time.trim().toUpperCase() === 'OFF';
    const hasImage = !!day.image;
    const crop = getDayImageCrop(day, state.view === 'list' ? 'list' : 'grid');
    const style = [
      `--textAlign:${day.textAlign}`,
      `--verticalAlign:${verticalToCss(day.textVAlign)}`,
      hasImage ? `--dayImage:none` : '',
      hasImage ? `--exportDayImage:url('${day.image}')` : '',
      `--imageFit:${day.imageFit}`,
      `--imagePosition:${day.imagePosition}`,
      `--imageCropZoom:${crop.zoom}`,
      `--imageCropX:${crop.x}`,
      `--imageCropY:${crop.y}`,
      `--imageCropStretchX:${crop.stretchX}`,
      `--imageCropStretchY:${crop.stretchY}`,
      normalizeTextColor(day.textColor) ? `--dayCustomText:${normalizeTextColor(day.textColor)}` : ''
    ].filter(Boolean).join(';');
    const classes = ['dayCard', `align-${day.textAlign}`, `v-${day.textVAlign}`, isOff ? 'isOff' : '', hasImage ? 'hasImage' : '', day.transparent ? 'isTransparent' : '', day.highlighted ? 'isHighlighted' : '', normalizeTextColor(day.textColor) ? 'hasCustomTextColor' : '', day.star ? 'isStar' : ''].filter(Boolean).join(' ');
    const status = isOff ? 'Pause' : (day.time || 'À définir');
    const category = day.category || (isOff ? 'Repos' : 'Programme à définir');
    const note = day.note ? `<p class="streamNote">${esc(day.note)}</p>` : '';
    const special = state.hideSpecialLabels ? '' : specialLabel(day, isOff);
    const specialHtml = special ? `<div class="specialLabel">${esc(special)}</div>` : '';
    const starHtml = day.star ? '<div class="starBadge">Stream spécial</div>' : '';
    const highlightHtml = day.highlighted ? '<div class="highlightBadge">À ne pas manquer</div>' : '';
    const imageHtml = hasImage ? `<img class="dayImageLayer" src="${esc(day.image)}" alt="" aria-hidden="true" draggable="false"><div class="dayImageOverlay" aria-hidden="true"></div>` : '';
    return `<article class="${classes}" data-day-index="${day.index}" style="${style}">
      ${imageHtml}
      <div class="dayHeader">
        <div class="dayName"><span>${DAY_NAMES[day.index]}</span></div>
        <div class="dayStatus">${esc(status)}</div>
        ${starHtml}
        ${highlightHtml}
      </div>
      <div class="dayContent">
        ${specialHtml}
        <div class="streamTime">${esc(day.time || 'À définir')}</div>
        <div class="streamTitle">${esc(category)}</div>
        ${note}
      </div>
    </article>`;
  }).join('') || '<article class="dayCard isOff"><div class="dayContent"><div class="streamTime">Aucun jour</div><div class="streamTitle">Active au moins un jour</div></div></article>';
  renderQr();
  requestAnimationFrame(() => {
    fitPreviewCanvas();
    requestAnimationFrame(applyPreviewImageCrops);
  });
}
function specialLabel(day, isOff){
  if (state.specialMode === 'ticket') return '🎟 Ticket stream';
  if (state.specialMode === 'restaurant') return isOff ? '🍽 Cuisine fermée' : ['Entrée','Plat du jour','Suggestion','Spécialité','Menu du soir','Service commu','Dessert'][day.index] || 'Menu';
  if (state.specialMode === 'rpg') return isOff ? '🏕 Repos à l’auberge' : (day.star ? '👑 Quête principale' : '⚔ Quête secondaire');
  if (state.specialMode === 'logbook') return `▣ Journal ${String(day.index + 1).padStart(2,'0')}`;
  if (state.specialMode === 'anime') return `EP.${String(day.index + 1).padStart(2,'0')}`;
  if (state.specialMode === 'poster') return day.star ? '★ Événement principal' : 'Programme';
  if (state.specialMode === 'marathon') return day.star ? '🏁 Grand final' : `Étape ${day.index + 1}`;
  if (state.specialMode === 'release') return day.star ? '🚀 Lancement' : 'Nouveau chapitre';
  if (state.specialMode === 'subathon') return day.star ? '🎯 Palier bonus' : `Objectif ${day.index + 1}`;
  if (state.specialMode === 'indie') return day.star ? '💎 Coup de cœur' : `Prototype ${String(day.index + 1).padStart(2,'0')}`;
  if (state.specialMode === 'challenge') return day.star ? '☠ Défi boss' : 'Défi du jour';
  return '';
}
function getQrUrl(){
  const value = String(state.subtitle || '').trim();
  if (!value) return 'https://twitch.tv/ton_lien';
  if (/^https?:\/\//i.test(value)) return value;
  if (/^twitch\.tv\//i.test(value)) return `https://${value}`;
  if (/^[a-z0-9_]{3,25}$/i.test(value)) return `https://twitch.tv/${value}`;
  return value.includes('.') ? `https://${value}` : `https://twitch.tv/ton_lien`;
}
function renderQr(){
  if (!els.qrBox) return;
  els.qrBox.innerHTML = '';
  els.qrBox.classList.toggle('isVisible', !!state.showQr);
  if (!state.showQr) return;
  const url = getQrUrl();
  try{
    if (typeof qrcode === 'function') {
      const qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      els.qrBox.innerHTML = `<div class="qrBox__code">${qr.createSvgTag(4, 1)}</div><span>Scan Twitch</span>`;
    } else {
      els.qrBox.innerHTML = `<div class="qrBox__fallback">QR</div><span>QR indisponible</span>`;
    }
  }catch{
    els.qrBox.innerHTML = `<div class="qrBox__fallback">QR</div><span>QR indisponible</span>`;
  }
}
function duplicateDay(target){
  if (!Number.isInteger(target) || target < 0 || target > 6 || target === selectedDay) return toast('Jour cible invalide.');
  const sourceDay = DAY_NAMES[selectedDay];
  const targetDay = DAY_NAMES[target];
  state.days[target] = clone(state.days[selectedDay]);
  closeDuplicateModal();
  renderAll();
  scheduleSave();
  toast(`${sourceDay} dupliqué vers ${targetDay}.`);
}
function openDuplicateModal(){
  if (!els.duplicateModal || !els.duplicateChoices) return;
  els.duplicateModalText.textContent = `Dupliquer ${DAY_NAMES[selectedDay]} vers :`;
  els.duplicateChoices.innerHTML = DAY_NAMES.map((name, index) => {
    const disabled = index === selectedDay ? ' disabled aria-disabled="true"' : '';
    const helper = index === selectedDay ? '<small>Jour actuel</small>' : '<small>Remplacer ce jour</small>';
    return `<button class="duplicateChoice" type="button" data-duplicate-target="${index}"${disabled}>
      <strong>${esc(name)}</strong>
      ${helper}
    </button>`;
  }).join('');
  els.duplicateModal.classList.add('isVisible');
  els.duplicateModal.setAttribute('aria-hidden', 'false');
  const firstAvailable = els.duplicateChoices.querySelector('button:not([disabled])');
  if (firstAvailable) firstAvailable.focus();
}
function closeDuplicateModal(){
  if (!els.duplicateModal) return;
  els.duplicateModal.classList.remove('isVisible');
  els.duplicateModal.setAttribute('aria-hidden', 'true');
  if (els.duplicate) els.duplicate.focus();
}
function openResetModal(){
  if (!els.resetModal) return;
  els.resetModal.classList.add('isVisible');
  els.resetModal.setAttribute('aria-hidden', 'false');
  if (els.resetConfirm) els.resetConfirm.focus();
}
function closeResetModal(){
  if (!els.resetModal) return;
  els.resetModal.classList.remove('isVisible');
  els.resetModal.setAttribute('aria-hidden', 'true');
  if (els.reset) els.reset.focus();
}
function confirmResetProject(){
  flushHistorySnapshot();
  closeResetModal();
  localStorage.removeItem(STORAGE_KEY);
  state = clone(DEFAULT_STATE);
  selectedDay = 0;
  renderAll();
  save(true);
  pushHistorySnapshot();
  toast('Planning réinitialisé.');
}

let cropDraft = null;
let cropOriginal = null;
let cropDrag = null;

function imagePositionToPivot(position){
  const raw = String(position || 'center center');
  let px = 0.5;
  let py = 0.5;
  if (raw.includes('left')) px = 0;
  if (raw.includes('right')) px = 1;
  if (raw.includes('top')) py = 0;
  if (raw.includes('bottom')) py = 1;
  return {px, py};
}
function computeManualImageCropLayout(container, img, crop, fit, position){
  const c = normalizeImageCrop(crop);
  const cw = container.clientWidth || container.offsetWidth || 1;
  const ch = container.clientHeight || container.offsetHeight || 1;
  const iw = img.naturalWidth || img.width || 1;
  const ih = img.naturalHeight || img.height || 1;
  const baseScale = fit === 'contain' ? Math.min(cw / iw, ch / ih) : Math.max(cw / iw, ch / ih);
  const finalScale = baseScale * c.zoom;
  const stretchX = clampNumber(c.stretchX, IMAGE_CROP_MIN_STRETCH, IMAGE_CROP_MAX_STRETCH, DEFAULT_IMAGE_CROP.stretchX);
  const stretchY = clampNumber(c.stretchY, IMAGE_CROP_MIN_STRETCH, IMAGE_CROP_MAX_STRETCH, DEFAULT_IMAGE_CROP.stretchY);
  const width = iw * finalScale * stretchX;
  const height = ih * finalScale * stretchY;
  const pivot = imagePositionToPivot(position);
  return {
    width,
    height,
    left:(cw - width) * pivot.px + (c.x / 100) * cw,
    top:(ch - height) * pivot.py + (c.y / 100) * ch
  };
}
function applyManualImageCropToImage(img, crop, fit, position){
  if (!img) return;
  const container = img.parentElement;
  if (!container) return;

  const apply = () => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const layout = computeManualImageCropLayout(container, img, crop, fit, position);
    img.style.width = `${layout.width}px`;
    img.style.height = `${layout.height}px`;
    img.style.left = `${layout.left}px`;
    img.style.top = `${layout.top}px`;
    img.style.right = 'auto';
    img.style.bottom = 'auto';
    img.style.transform = 'none';
    img.style.objectFit = 'fill';
    img.style.objectPosition = 'center center';
  };

  if (img.complete && img.naturalWidth) {
    apply();
  } else {
    img.addEventListener('load', apply, {once:true});
  }
}
function applyPreviewImageCrops(){
  if (!els.weekGrid) return;
  els.weekGrid.querySelectorAll('.dayImageLayer').forEach(img => {
    const card = img.closest('.dayCard');
    if (!card) return;
    const styles = getComputedStyle(card);
    const crop = {
      zoom:styles.getPropertyValue('--imageCropZoom').trim() || 1,
      x:styles.getPropertyValue('--imageCropX').trim() || 0,
      y:styles.getPropertyValue('--imageCropY').trim() || 0,
      stretchX:styles.getPropertyValue('--imageCropStretchX').trim() || 1,
      stretchY:styles.getPropertyValue('--imageCropStretchY').trim() || 1
    };
    applyManualImageCropToImage(
      img,
      crop,
      styles.getPropertyValue('--imageFit').trim() || 'cover',
      styles.getPropertyValue('--imagePosition').trim() || 'center center'
    );
  });
}

function configureCropMeasureClone(cloneNode, mode){
  cloneNode.classList.remove('exportClone', 'view-grid', 'view-list');
  cloneNode.classList.add(`view-${mode}`);
  cloneNode.style.position = 'fixed';
  cloneNode.style.left = '-12000px';
  cloneNode.style.top = '0';
  cloneNode.style.visibility = 'hidden';
  cloneNode.style.pointerEvents = 'none';
  cloneNode.style.margin = '0';
  cloneNode.style.zoom = '1';
  cloneNode.style.removeProperty('max-width');
  cloneNode.style.removeProperty('max-height');
  cloneNode.style.removeProperty('transform');
  cloneNode.style.removeProperty('transform-origin');

  if (mode === 'list') {
    cloneNode.style.width = '1600px';
    cloneNode.style.height = 'auto';
  } else if (state.format === 'square') {
    cloneNode.style.width = '1600px';
    cloneNode.style.height = '1600px';
  } else {
    cloneNode.style.width = '1920px';
    cloneNode.style.height = '1080px';
  }
}

function measureCropFrameRatio(mode){
  if (!els.canvas) return null;
  const cloneNode = els.canvas.cloneNode(true);
  configureCropMeasureClone(cloneNode, mode);
  document.body.appendChild(cloneNode);

  try{
    const selectedCard = cloneNode.querySelector(`.dayCard[data-day-index="${selectedDay}"]`);
    const fallbackCard = cloneNode.querySelector('.dayCard');
    const card = selectedCard || fallbackCard;
    if (!card) return null;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return Math.max(0.12, Math.min(30, rect.width / rect.height));
  }finally{
    cloneNode.remove();
  }
}

function setCropStageGeometry(stage, ratio, mode){
  if (!stage || !ratio) return;
  const pane = stage.closest('.cropPane') || stage.parentElement;
  const paneRect = pane ? pane.getBoundingClientRect() : null;
  const dialog = stage.closest('.cropDialog');
  const dialogRect = dialog ? dialog.getBoundingClientRect() : null;
  const viewportHeight = Math.max(420, window.innerHeight || 720);
  const availableWidth = Math.max(150, Math.floor((paneRect && paneRect.width ? paneRect.width : 360) - 22));

  // V30.11 : la modale doit rester lisible sans forcer un scroll inutile.
  // On réserve davantage de hauteur pour les titres, sliders et boutons, puis
  // on réduit légèrement le cadre grille sur les écrans autour de 720px de haut.
  const dialogHeight = dialogRect && dialogRect.height ? dialogRect.height : viewportHeight;
  const reservedHeight = mode === 'grid' ? 305 : 250;
  const availableHeight = Math.max(70, Math.floor(dialogHeight - reservedHeight));

  let maxWidth = availableWidth;
  let maxHeight;

  if (mode === 'grid') {
    const squareLike = state.format === 'square';
    maxWidth = Math.min(availableWidth, squareLike ? 340 : 250);
    maxHeight = Math.max(170, Math.min(availableHeight, squareLike ? 280 : Math.floor(viewportHeight * 0.42), 315));
  } else {
    maxHeight = Math.max(52, Math.min(availableHeight, Math.floor(viewportHeight * 0.13), 96));
  }

  let width = maxWidth;
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  stage.style.aspectRatio = String(ratio);
  stage.style.width = `${Math.max(80, Math.floor(width))}px`;
  stage.style.height = `${Math.max(52, Math.floor(height))}px`;
}


function updateCropStageRatios(){
  const gridRatio = measureCropFrameRatio('grid');
  const listRatio = measureCropFrameRatio('list');
  setCropStageGeometry(els.cropGridStage, gridRatio, 'grid');
  setCropStageGeometry(els.cropListStage, listRatio, 'list');
}

function applyCropDraftToVisiblePreview(mode){
  if (!cropDraft || state.view !== mode || !els.weekGrid) return;
  const card = els.weekGrid.querySelector(`.dayCard[data-day-index="${selectedDay}"]`);
  if (!card) return;
  const crop = normalizeImageCrop(cropDraft[mode], mode);
  card.style.setProperty('--imageCropZoom', String(crop.zoom));
  card.style.setProperty('--imageCropX', String(crop.x));
  card.style.setProperty('--imageCropY', String(crop.y));
  card.style.setProperty('--imageCropStretchX', String(crop.stretchX));
  card.style.setProperty('--imageCropStretchY', String(crop.stretchY));
  const img = card.querySelector('.dayImageLayer');
  if (!img) return;
  const styles = getComputedStyle(card);
  applyManualImageCropToImage(
    img,
    crop,
    styles.getPropertyValue('--imageFit').trim() || 'cover',
    styles.getPropertyValue('--imagePosition').trim() || 'center center'
  );
}
function updateCropPreview(mode){
  if (!cropDraft) return;
  const isList = mode === 'list';
  const crop = normalizeImageCrop(cropDraft[mode], mode);
  cropDraft[mode] = crop;
  const img = isList ? els.cropListImg : els.cropGridImg;
  const zoomInput = isList ? els.cropListZoom : els.cropGridZoom;
  const zoomValue = isList ? els.cropListZoomValue : els.cropGridZoomValue;
  const stretchInput = isList ? els.cropListStretchX : els.cropGridStretchY;
  const stretchValue = isList ? els.cropListStretchXValue : els.cropGridStretchYValue;
  const currentDay = state.days[selectedDay];
  if (!img || !zoomInput || !zoomValue || !currentDay) return;
  if (img.src !== currentDay.image) img.src = currentDay.image || '';
  applyManualImageCropToImage(img, crop, currentDay.imageFit || 'cover', currentDay.imagePosition || 'center center');
  zoomInput.value = String(crop.zoom);
  zoomValue.textContent = `${Math.round(crop.zoom * 100)}%`;
  if (stretchInput && stretchValue) {
    const stretch = isList ? crop.stretchX : crop.stretchY;
    stretchInput.value = String(stretch);
    stretchValue.textContent = `${Math.round(stretch * 100)}%`;
  }
  applyCropDraftToVisiblePreview(mode);
}
function updateAllCropPreviews(){
  updateCropPreview('grid');
  updateCropPreview('list');
}
function syncCropModalSize(){
  if (!els.cropModal) return;
  const dialog = els.cropModal.querySelector('.cropDialog');
  if (!dialog) return;
  const previewRect = els.previewFrame ? els.previewFrame.getBoundingClientRect() : null;
  const maxViewportWidth = Math.max(320, window.innerWidth - 24);
  const maxViewportHeight = Math.max(320, window.innerHeight - 24);
  const previewWidth = previewRect && previewRect.width ? previewRect.width : maxViewportWidth;
  const previewHeight = previewRect && previewRect.height ? previewRect.height : maxViewportHeight;

  // La fenêtre suit l'aperçu, mais on limite sa taille pour éviter l'effet "popup géant".
  const width = Math.min(previewWidth, maxViewportWidth, 1120);
  const height = Math.min(previewHeight, maxViewportHeight, 720);

  dialog.style.setProperty('--crop-dialog-width', `${Math.max(320, Math.floor(width))}px`);
  dialog.style.setProperty('--crop-dialog-max-height', `${Math.max(360, Math.floor(height))}px`);
  els.cropModal.classList.toggle('isCompactCrop', width < 960);
}


function openCropModal(){
  const currentDay = state.days[selectedDay];
  if (!currentDay || !currentDay.image) return toast('Ajoute une image avant de la recadrer.');
  cropDraft = {
    grid:normalizeImageCrop(currentDay.imageCropGrid, 'grid'),
    list:normalizeImageCrop(currentDay.imageCropList, 'list')
  };
  cropOriginal = clone(cropDraft);
  if (els.cropModalText) els.cropModalText.textContent = `Recadrage de ${DAY_NAMES[selectedDay]} : déplace, zoome et ajuste l’étirement grille/liste séparément.`;
  syncCropModalSize();
  if (els.cropModal) {
    els.cropModal.classList.add('isVisible');
    els.cropModal.classList.toggle('isSquareFormat', state.format === 'square');
    els.cropModal.setAttribute('aria-hidden', 'false');
  }
  requestAnimationFrame(() => {
    updateCropStageRatios();
    updateAllCropPreviews();
  });
  if (els.cropApply) els.cropApply.focus();
}
function closeCropModal(){
  const hadCropDraft = !!cropDraft;
  cropDraft = null;
  cropOriginal = null;
  cropDrag = null;
  if (!els.cropModal) return;
  els.cropModal.classList.remove('isVisible');
  els.cropModal.setAttribute('aria-hidden', 'true');
  if (hadCropDraft) renderPreview();
  if (els.cropImage) els.cropImage.focus();
}
function applyCropModal(){
  if (!cropDraft) return closeCropModal();
  const currentDay = state.days[selectedDay];
  currentDay.imageCropGrid = normalizeImageCrop(cropDraft.grid, 'grid');
  currentDay.imageCropList = normalizeImageCrop(cropDraft.list, 'list');
  closeCropModal();
  scheduleSave();
  toast('Recadrage image appliqué.');
}
function resetCropMode(mode){
  if (!cropDraft) return;
  cropDraft[mode] = clone(DEFAULT_IMAGE_CROP);
  updateCropPreview(mode);
}
function copyCropMode(from, to){
  if (!cropDraft) return;
  const source = normalizeImageCrop(cropDraft[from], from);
  const target = normalizeImageCrop(cropDraft[to], to);
  cropDraft[to] = normalizeImageCrop({
    zoom:source.zoom,
    x:source.x,
    y:source.y,
    stretchX:target.stretchX,
    stretchY:target.stretchY
  }, to);
  updateCropPreview(to);
}
function setCropZoom(mode, value){
  if (!cropDraft) return;
  const crop = normalizeImageCrop(cropDraft[mode], mode);
  crop.zoom = clampNumber(value, IMAGE_CROP_MIN_ZOOM, IMAGE_CROP_MAX_ZOOM, DEFAULT_IMAGE_CROP.zoom);
  cropDraft[mode] = normalizeImageCrop(crop, mode);
  updateCropPreview(mode);
}
function setCropStretch(mode, value){
  if (!cropDraft) return;
  const crop = normalizeImageCrop(cropDraft[mode], mode);
  if (mode === 'list') {
    crop.stretchX = clampNumber(value, IMAGE_CROP_MIN_STRETCH, IMAGE_CROP_MAX_STRETCH, DEFAULT_IMAGE_CROP.stretchX);
  } else {
    crop.stretchY = clampNumber(value, IMAGE_CROP_MIN_STRETCH, IMAGE_CROP_MAX_STRETCH, DEFAULT_IMAGE_CROP.stretchY);
  }
  cropDraft[mode] = normalizeImageCrop(crop, mode);
  updateCropPreview(mode);
}
function startCropDrag(mode, event){
  if (!cropDraft) return;
  const stage = mode === 'list' ? els.cropListStage : els.cropGridStage;
  if (!stage) return;
  event.preventDefault();
  stage.classList.add('isDragging');
  stage.setPointerCapture?.(event.pointerId);
  const crop = normalizeImageCrop(cropDraft[mode], mode);
  cropDrag = {
    mode,
    pointerId:event.pointerId,
    startX:event.clientX,
    startY:event.clientY,
    baseX:crop.x,
    baseY:crop.y,
    width:Math.max(1, stage.clientWidth),
    height:Math.max(1, stage.clientHeight)
  };
}
function moveCropDrag(event){
  if (!cropDrag || !cropDraft || event.pointerId !== cropDrag.pointerId) return;
  const dx = ((event.clientX - cropDrag.startX) / cropDrag.width) * 100;
  const dy = ((event.clientY - cropDrag.startY) / cropDrag.height) * 100;
  const crop = normalizeImageCrop(cropDraft[cropDrag.mode], cropDrag.mode);
  crop.x = clampNumber(cropDrag.baseX + dx, IMAGE_CROP_MIN_OFFSET, IMAGE_CROP_MAX_OFFSET, 0);
  crop.y = clampNumber(cropDrag.baseY + dy, IMAGE_CROP_MIN_OFFSET, IMAGE_CROP_MAX_OFFSET, 0);
  cropDraft[cropDrag.mode] = crop;
  updateCropPreview(cropDrag.mode);
}
function endCropDrag(event){
  if (!cropDrag || event.pointerId !== cropDrag.pointerId) return;
  const stage = cropDrag.mode === 'list' ? els.cropListStage : els.cropGridStage;
  if (stage) stage.classList.remove('isDragging');
  cropDrag = null;
}
function wheelCropZoom(mode, event){
  if (!cropDraft) return;
  event.preventDefault();
  const crop = normalizeImageCrop(cropDraft[mode], mode);
  const delta = event.deltaY < 0 ? 0.06 : -0.06;
  crop.zoom = clampNumber(crop.zoom + delta, IMAGE_CROP_MIN_ZOOM, IMAGE_CROP_MAX_ZOOM, DEFAULT_IMAGE_CROP.zoom);
  cropDraft[mode] = normalizeImageCrop(crop, mode);
  updateCropPreview(mode);
}

function updateCurrentDay(){
  const d = state.days[selectedDay];
  d.visible = els.visible.checked;
  d.time = els.time.value;
  d.category = els.category.value;
  d.note = els.note.value;
  d.textAlign = els.align.value;
  d.textVAlign = els.valign.value;
  d.imageFit = els.imageFit.value;
  d.imagePosition = els.imagePosition.value;
  d.transparent = els.dayTransparent.checked;
  d.highlighted = els.dayHighlight.checked;
  d.star = els.starDay.checked;
  renderTabs();
  renderPreview();
  scheduleSave();
}

function bind(){
  els.title.addEventListener('input', () => { state.title = els.title.value; renderPreview(); scheduleSave(); });
  els.subtitle.addEventListener('input', () => { state.subtitle = els.subtitle.value; renderPreview(); scheduleSave(); });
  [els.visible, els.time, els.category, els.note, els.align, els.valign, els.imageFit, els.imagePosition, els.dayTransparent, els.dayHighlight, els.starDay]
    .forEach(input => { input.addEventListener('input', updateCurrentDay); input.addEventListener('change', updateCurrentDay); });

  els.dayTabs.addEventListener('click', (e) => {
    const colorBtn = e.target.closest('[data-day-color-toggle]');
    if (colorBtn) {
      dayColorPanelOpen = !dayColorPanelOpen;
      renderTabs();
      renderDayColorPanel();
      return;
    }
    const btn = e.target.closest('[data-day]');
    if (!btn) return;
    selectedDay = Number(btn.dataset.day);
    renderTabs();
    renderEditor();
  });
  if (els.dayColorSwatches) els.dayColorSwatches.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-day-text-color]');
    if (!btn) return;
    setSelectedDayTextColor(btn.dataset.dayTextColor);
  });
  if (els.dayTextColor) els.dayTextColor.addEventListener('input', () => setSelectedDayTextColor(els.dayTextColor.value));
  if (els.dayTextColorReset) els.dayTextColorReset.addEventListener('click', resetSelectedDayTextColor);
  els.off.addEventListener('click', () => {
    Object.assign(state.days[selectedDay], {time:'OFF',category:'Repos',note:''});
    renderEditor(); renderPreview(); scheduleSave();
  });
  els.clearDay.addEventListener('click', () => {
    state.days[selectedDay] = normalizeDay({visible:true}, selectedDay);
    renderEditor(); renderPreview(); scheduleSave();
  });
  els.duplicate.addEventListener('click', openDuplicateModal);
  els.duplicateChoices.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-duplicate-target]');
    if (!btn || btn.disabled) return;
    duplicateDay(Number(btn.dataset.duplicateTarget));
  });
  els.duplicateCancel.addEventListener('click', closeDuplicateModal);
  els.duplicateModal.addEventListener('click', (e) => {
    if (e.target === els.duplicateModal) closeDuplicateModal();
  });
  els.resetCancel.addEventListener('click', closeResetModal);
  els.resetKeep.addEventListener('click', closeResetModal);
  els.resetConfirm.addEventListener('click', confirmResetProject);
  els.resetModal.addEventListener('click', (e) => {
    if (e.target === els.resetModal) closeResetModal();
  });
  if (els.cropImage) els.cropImage.addEventListener('click', openCropModal);
  if (els.cropCancel) els.cropCancel.addEventListener('click', closeCropModal);
  if (els.cropKeep) els.cropKeep.addEventListener('click', closeCropModal);
  if (els.cropApply) els.cropApply.addEventListener('click', applyCropModal);
  if (els.cropModal) els.cropModal.addEventListener('click', (e) => {
    if (e.target === els.cropModal) closeCropModal();
  });
  if (els.cropGridReset) els.cropGridReset.addEventListener('click', () => resetCropMode('grid'));
  if (els.cropListReset) els.cropListReset.addEventListener('click', () => resetCropMode('list'));
  if (els.cropCopyGridToList) els.cropCopyGridToList.addEventListener('click', () => copyCropMode('grid', 'list'));
  if (els.cropCopyListToGrid) els.cropCopyListToGrid.addEventListener('click', () => copyCropMode('list', 'grid'));
  if (els.cropGridZoom) els.cropGridZoom.addEventListener('input', () => setCropZoom('grid', els.cropGridZoom.value));
  if (els.cropListZoom) els.cropListZoom.addEventListener('input', () => setCropZoom('list', els.cropListZoom.value));
  if (els.cropGridStretchY) els.cropGridStretchY.addEventListener('input', () => setCropStretch('grid', els.cropGridStretchY.value));
  if (els.cropListStretchX) els.cropListStretchX.addEventListener('input', () => setCropStretch('list', els.cropListStretchX.value));
  if (els.cropGridStage) {
    els.cropGridStage.addEventListener('pointerdown', (e) => startCropDrag('grid', e));
    els.cropGridStage.addEventListener('pointermove', moveCropDrag);
    els.cropGridStage.addEventListener('pointerup', endCropDrag);
    els.cropGridStage.addEventListener('pointercancel', endCropDrag);
    els.cropGridStage.addEventListener('wheel', (e) => wheelCropZoom('grid', e), {passive:false});
  }
  if (els.cropListStage) {
    els.cropListStage.addEventListener('pointerdown', (e) => startCropDrag('list', e));
    els.cropListStage.addEventListener('pointermove', moveCropDrag);
    els.cropListStage.addEventListener('pointerup', endCropDrag);
    els.cropListStage.addEventListener('pointercancel', endCropDrag);
    els.cropListStage.addEventListener('wheel', (e) => wheelCropZoom('list', e), {passive:false});
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (els.duplicateModal && els.duplicateModal.classList.contains('isVisible')) closeDuplicateModal();
    if (els.resetModal && els.resetModal.classList.contains('isVisible')) closeResetModal();
    if (els.cropModal && els.cropModal.classList.contains('isVisible')) closeCropModal();
  });
  els.chooseImage.addEventListener('click', () => { els.imageInput.value = ''; els.imageInput.click(); });
  els.imageInput.addEventListener('change', async () => {
    const file = els.imageInput.files && els.imageInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Le fichier choisi n’est pas une image.');

    els.chooseImage.disabled = true;
    const oldChooseText = els.chooseImage.textContent;
    els.chooseImage.textContent = 'Optimisation...';

    try{
      const optimized = await optimizeImageFile(file);
      const d = state.days[selectedDay];
      d.image = optimized.dataUrl;
      d.imageName = optimized.label;
      d.imageCropGrid = clone(DEFAULT_IMAGE_CROP);
      d.imageCropList = clone(DEFAULT_IMAGE_CROP);
      renderEditor();
      renderPreview();
      scheduleSave();
      toast(optimized.message);
    }catch(err){
      console.error(err);
      toast('Image non importée : impossible de la lire ou de l’optimiser.');
    }finally{
      els.chooseImage.disabled = false;
      els.chooseImage.textContent = oldChooseText;
    }
  });
  els.removeImage.addEventListener('click', () => {
    const d = state.days[selectedDay];
    d.image = ''; d.imageName = ''; d.imageCropGrid = clone(DEFAULT_IMAGE_CROP); d.imageCropList = clone(DEFAULT_IMAGE_CROP);
    renderEditor(); renderPreview(); scheduleSave();
  });
  if (els.themeGallery) els.themeGallery.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-mini]');
    if (!btn) return;
    setThemeAndResetTextColors(btn.dataset.themeMini);
    renderControls();
    renderEditor();
    renderPreview();
    scheduleSave();
  });
  els.theme.addEventListener('change', () => { setThemeAndResetTextColors(els.theme.value); renderControls(); renderEditor(); renderPreview(); scheduleSave(); });
  els.toggleThemeFavorite.addEventListener('click', toggleCurrentThemeFavorite);
  els.favoriteThemeList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-favorite-theme]');
    if (!btn) return;
    setThemeAndResetTextColors(btn.dataset.favoriteTheme);
    renderControls();
    renderEditor();
    renderPreview();
    scheduleSave();
  });
  els.transparentPng.addEventListener('change', () => { state.transparentPng = els.transparentPng.checked; renderPreview(); scheduleSave(); });
  els.checker.addEventListener('change', () => { state.checker = els.checker.checked; renderPreview(); scheduleSave(); });
  els.specialMode.addEventListener('change', () => { state.specialMode = els.specialMode.value; renderControls(); renderPreview(); scheduleSave(); });
  if (els.hideSpecialLabels) els.hideSpecialLabels.addEventListener('change', () => { state.hideSpecialLabels = els.hideSpecialLabels.checked; renderControls(); renderPreview(); scheduleSave(); });
  els.eventBanner.addEventListener('input', () => { state.eventBanner = els.eventBanner.value; renderPreview(); scheduleSave(); });
  els.qr.addEventListener('change', () => { state.showQr = els.qr.checked; renderPreview(); scheduleSave(); });
  document.querySelectorAll('.segBtn').forEach(btn => {
    btn.addEventListener('click', () => { state[btn.dataset.option] = btn.dataset.value; renderControls(); renderPreview(); scheduleSave(); });
  });
  els.save.addEventListener('click', () => { flushHistorySnapshot(); save(false); });
  els.undo.addEventListener('click', undoChange);
  els.redo.addEventListener('click', redoChange);
  els.reset.addEventListener('click', openResetModal);
  els.exportPng.addEventListener('click', exportPng);
  window.addEventListener('resize', () => {
    fitPreviewCanvas();
    if (els.cropModal && els.cropModal.classList.contains('isVisible')) {
      syncCropModalSize();
      requestAnimationFrame(() => { updateCropStageRatios(); updateAllCropPreviews(); });
    }
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPreviewCanvas).catch(() => {});
}
function formatFileSize(bytes){
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} o`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} Ko`;
  return `${(value / (1024 * 1024)).toFixed(value >= 10 * 1024 * 1024 ? 1 : 2)} Mo`;
}

function getFileBaseName(name){
  return String(name || 'image').replace(/\.[^/.]+$/, '') || 'image';
}

function readFile(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => resolve(String(r.result || ''));
    r.readAsDataURL(file);
  });
}

function loadImageFromFile(file){
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image illisible.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality){
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function blobToDataUrl(blob){
  return readFile(blob);
}

async function optimizeImageFile(file){
  const originalSize = file.size || 0;

  // Les SVG et GIF sont conservés tels quels pour éviter de casser leur rendu.
  if (IMAGE_TYPES_NOT_COMPRESSED.includes(file.type)) {
    return {
      dataUrl: await readFile(file),
      label: `${file.name} (${formatFileSize(originalSize)})`,
      message: 'Image ajoutée sans compression pour préserver son format.'
    };
  }

  const img = await loadImageFromFile(file);
  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;

  if (!sourceWidth || !sourceHeight) {
    return {
      dataUrl: await readFile(file),
      label: `${file.name} (${formatFileSize(originalSize)})`,
      message: 'Image ajoutée sans compression.'
    };
  }

  const largestSide = Math.max(sourceWidth, sourceHeight);
  const scale = largestSide > IMAGE_MAX_SIDE ? IMAGE_MAX_SIDE / largestSide : 1;
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

  // Si l'image est déjà petite, on évite une recompression inutile.
  if (scale === 1 && originalSize <= IMAGE_SMALL_FILE_LIMIT) {
    return {
      dataUrl: await readFile(file),
      label: `${file.name} (${formatFileSize(originalSize)})`,
      message: 'Image légère ajoutée sans compression.'
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  let blob = await canvasToBlob(canvas, 'image/webp', IMAGE_QUALITY);
  let extension = 'webp';

  // Fallback pour les vieux navigateurs qui ne savent pas générer de WebP.
  if (!blob || !blob.size) {
    blob = await canvasToBlob(canvas, 'image/jpeg', IMAGE_QUALITY);
    extension = 'jpg';
  }

  if (!blob || !blob.size) {
    return {
      dataUrl: await readFile(file),
      label: `${file.name} (${formatFileSize(originalSize)})`,
      message: 'Image ajoutée sans compression : optimisation indisponible.'
    };
  }

  // Si la compression n'apporte presque rien, on conserve l'image originale.
  if (scale === 1 && blob.size >= originalSize * IMAGE_KEEP_ORIGINAL_RATIO) {
    return {
      dataUrl: await readFile(file),
      label: `${file.name} (${formatFileSize(originalSize)})`,
      message: 'Image ajoutée sans compression : elle était déjà bien optimisée.'
    };
  }

  const optimizedName = `${getFileBaseName(file.name)}.${extension}`;
  const resizedText = scale < 1 ? `, redimensionnée en ${targetWidth}×${targetHeight}px` : '';

  return {
    dataUrl: await blobToDataUrl(blob),
    label: `${optimizedName} (${formatFileSize(originalSize)} → ${formatFileSize(blob.size)})`,
    message: `Image optimisée : ${formatFileSize(originalSize)} → ${formatFileSize(blob.size)}${resizedText}.`
  };
}

function getCanvasCornerRadius(node, renderedCanvas){
  const rect = node.getBoundingClientRect();
  const ratio = rect.width ? (renderedCanvas.width / rect.width) : 1;
  const styles = getComputedStyle(node);
  const rawRadius = parseFloat(styles.borderTopLeftRadius) || 0;

  /*
    Sécurité volontaire :
    - html2canvas peut laisser des pixels blancs dans les angles arrondis.
    - On prend le rayon CSS réel, puis on ajoute une petite marge.
    - Cette marge évite les restes blancs liés à l'antialiasing.
  */
  return Math.ceil(rawRadius * ratio) + 8;
}

function createRoundedCanvas(sourceCanvas, radius){
  const output = document.createElement('canvas');
  output.width = sourceCanvas.width;
  output.height = sourceCanvas.height;

  const ctx = output.getContext('2d');
  const w = output.width;
  const h = output.height;
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));

  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.restore();

  return output;
}

function forceTransparentRoundedCorners(canvas, radius){
  const ctx = canvas.getContext('2d', { willReadFrequently:true });
  const w = canvas.width;
  const h = canvas.height;
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));

  if (!r) return canvas;

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  function clearPixel(x, y){
    const index = (y * w + x) * 4;
    data[index] = 0;
    data[index + 1] = 0;
    data[index + 2] = 0;
    data[index + 3] = 0;
  }

  /*
    Deuxième sécurité :
    même si le clip arrondi fonctionne, on supprime pixel par pixel tout ce qui
    est en dehors de l'arrondi. Cela empêche définitivement les angles blancs.
  */
  for (let y = 0; y < r; y++){
    for (let x = 0; x < r; x++){
      const dx = r - x;
      const dy = r - y;
      if ((dx * dx + dy * dy) > (r * r)) clearPixel(x, y);
    }

    for (let x = w - r; x < w; x++){
      const dx = x - (w - r);
      const dy = r - y;
      if ((dx * dx + dy * dy) > (r * r)) clearPixel(x, y);
    }
  }

  for (let y = h - r; y < h; y++){
    for (let x = 0; x < r; x++){
      const dx = r - x;
      const dy = y - (h - r);
      if ((dx * dx + dy * dy) > (r * r)) clearPixel(x, y);
    }

    for (let x = w - r; x < w; x++){
      const dx = x - (w - r);
      const dy = y - (h - r);
      if ((dx * dx + dy * dy) > (r * r)) clearPixel(x, y);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function configureExportClone(cloneNode){
  cloneNode.classList.add('exportClone');
  cloneNode.style.removeProperty('zoom');
  cloneNode.style.removeProperty('max-width');
  cloneNode.style.removeProperty('max-height');
  cloneNode.style.removeProperty('transform');
  cloneNode.style.removeProperty('transform-origin');

  if (state.format === 'square') {
    cloneNode.style.width = '1600px';
    cloneNode.style.height = '1600px';
  } else if (state.view === 'list') {
    cloneNode.style.width = '1600px';
    cloneNode.style.height = 'auto';
  } else {
    cloneNode.style.width = '1920px';
    cloneNode.style.height = '1080px';
  }
}

function downloadCanvasAsPng(canvas, filename){
  canvas.toBlob((blob) => {
    if (!blob) {
      const fallback = document.createElement('a');
      fallback.href = canvas.toDataURL('image/png');
      fallback.download = filename;
      fallback.click();
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

async function exportPlanningImage(button){
  if (typeof html2canvas === 'undefined') return toast('Export impossible : html2canvas n’est pas chargé.');

  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = 'Export...';

  const cloneNode = els.canvas.cloneNode(true);
  configureExportClone(cloneNode);
  document.body.appendChild(cloneNode);

  try{
    const renderedCanvas = await html2canvas(cloneNode, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false
    });

    const radius = getCanvasCornerRadius(cloneNode, renderedCanvas);
    const roundedCanvas = createRoundedCanvas(renderedCanvas, radius);
    const finalCanvas = forceTransparentRoundedCorners(roundedCanvas, radius);
    const filename = `planning_twitch_${state.format}_${state.view}${state.transparentPng ? '_transparent' : ''}.png`;

    downloadCanvasAsPng(finalCanvas, filename);

  }catch(err){
    console.error(err);
    toast('Erreur pendant l’export PNG.');
  }finally{
    cloneNode.remove();
    button.disabled = false;
    button.textContent = oldText;
  }
}

async function exportPng(){
  return exportPlanningImage(els.exportPng);
}

load();
initHistory();
bind();
window.addEventListener('resize', () => requestAnimationFrame(() => {
  fitPreviewCanvas();
  if (els.cropModal && els.cropModal.classList.contains('isVisible')) {
    syncCropModalSize();
    requestAnimationFrame(() => { updateCropStageRatios(); updateAllCropPreviews(); });
  }
}));
renderAll();
save(true);
