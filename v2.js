(function(){
  'use strict';

  const VERSION = '2.0.0';
  const MODEL_REVISION = 4;
  const STORAGE_KEY = 'planninggpt_v2_project';
  const DAY_SHORT = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const DEFAULT_DAYS = [
    {name:'Lundi',time:'20h30',title:'Just Chatting',note:'On commence la semaine ensemble',status:'live'},
    {name:'Mardi',time:'Repos',title:'Soirée libre',note:'',status:'off'},
    {name:'Mercredi',time:'21h',title:'Jeu découverte',note:'Une nouvelle aventure',status:'live'},
    {name:'Jeudi',time:'21h',title:'RPG / Aventure',note:'Suite de la quête',status:'live'},
    {name:'Vendredi',time:'21h',title:'Horreur',note:'Plaid et sursauts',status:'live'},
    {name:'Samedi',time:'20h',title:'Avec la commu',note:'Viewers games',status:'live'},
    {name:'Dimanche',time:'14h30',title:'Stream chill',note:'Dimanche détente',status:'live'}
  ];
  const EMOJIS = ['✨','🎮','🌙','⭐','💜','🔥','👻','🌸','🧙','☕','💎','🚀','☁️','🎧','🕹️','🐉','🏆','🍄','🌈','🦇','🪄','🎲','🎤','🎻','🎼','🎵','💀','📼','⚔️','🗡️','🪽','🌌','⚡','🧪','🏙️','🐺'];
  const FONT_MAP = {
    rounded:'"Trebuchet MS",ui-rounded,sans-serif',
    sans:'"Segoe UI",Arial,sans-serif',
    display:'Impact,"Arial Black",sans-serif',
    condensed:'"Bahnschrift Condensed","Arial Narrow",sans-serif',
    serif:'Georgia,serif',
    hand:'"Segoe Print","Bradley Hand",cursive',
    comic:'"Comic Sans MS","Segoe Print",cursive',
    typewriter:'Consolas,"Lucida Console",monospace',
    mono:'"Courier New",monospace'
  };
  const TEMPLATE_STYLE = {
    cloud:{bg:['#f7b7df','#8399f5'],angle:135,card:'cloud',text:'#ffffff',accent:'#292b63'},
    cyber:{bg:['#05050d','#103d55'],angle:120,card:'cyber',text:'#e7fdff',accent:'#22d3ee'},
    rpg:{bg:['#120b1d','#6f2dc5'],angle:145,card:'twitch',text:'#ffffff',accent:'#bf94ff'},
    manga:{bg:['#fff8ff','#d8c9ff'],angle:125,card:'manga',text:'#17121f',accent:'#a855f7'},
    cozy:{bg:['#e9aa83','#7da890'],angle:135,card:'cozy',text:'#fff8eb',accent:'#5c4033'},
    arcade:{bg:['#140832','#c21870'],angle:135,card:'arcade',text:'#ffffff',accent:'#00f5ff'},
    agenda:{bg:['#f7f2e8','#c8d8e8'],angle:140,card:'agenda',text:'#18324a',accent:'#d25b47'},
    polaroid:{bg:['#f6a88d','#7d9fd3'],angle:130,card:'polaroid',text:'#fffdf8',accent:'#ffe16b'},
    roadmap:{bg:['#071b20','#1a6359'],angle:120,card:'roadmap',text:'#f0fffb',accent:'#54f2c2'},
    constellation:{bg:['#eef7f5','#7ba6ad'],angle:145,card:'wuwa',text:'#10363c',accent:'#167a82'},
    spotlight:{bg:['#111111','#3f3f46'],angle:120,card:'spotlight',text:'#ffffff',accent:'#ffffff'},
    columns:{bg:['#91a7d8','#38566a'],angle:135,card:'columns',text:'#ffffff',accent:'#9ecb91'},
    bubblegrid:{bg:['#73e6f2','#ffc8df'],angle:145,card:'bubblegrid',text:'#087f8c',accent:'#f05bce'},
    horror:{bg:['#050506','#4b0710'],angle:135,card:'horror',text:'#f8fafc',accent:'#ff334d'},
    violin:{bg:['#fffaf0','#dcc8a7'],angle:135,card:'violin',text:'#3e291c',accent:'#70482d'},
    fantasy7:{bg:['#020707','#183b32'],angle:138,card:'fantasy7',text:'#effff7',accent:'#5df2ae'},
    neonduel:{bg:['#020b1d','#25030c'],angle:90,card:'neonblue',text:'#ffffff',accent:'#6dc8ff'},
    astralduo:{bg:['#071633','#310922'],angle:90,card:'astralblue',text:'#ffffff',accent:'#a9dcff'}
  };
  const DUO_TEMPLATES = new Set(['spotlight','neonduel','astralduo']);
  const MODIFIERS = ['none','poster','ticket','restaurant','rpg','logbook','anime','marathon','release','subathon','indie','challenge'];
  const TYPE_PRESETS = {
    modern:{font:'sans',weight:700,fontStyle:'normal',transform:'none',letterSpacing:0,effect:'none'},
    elegant:{font:'serif',weight:700,fontStyle:'italic',transform:'none',letterSpacing:1,effect:'soft'},
    typewriter:{font:'typewriter',weight:400,fontStyle:'normal',transform:'none',letterSpacing:1,effect:'none'},
    hand:{font:'hand',weight:700,fontStyle:'normal',transform:'none',letterSpacing:0,effect:'soft'},
    comic:{font:'comic',weight:700,fontStyle:'normal',transform:'none',letterSpacing:0,effect:'hard'},
    condensed:{font:'condensed',weight:900,fontStyle:'normal',transform:'uppercase',letterSpacing:2,effect:'none'}
  };
  const TYPE_PRESET_ALIASES = {pop:'comic',pixel:'typewriter',cinema:'condensed',cyber:'typewriter'};

  const $ = id => document.getElementById(id);
  const els = {
    app:$('appRoot'),
    projectName:$('projectName'), undo:$('undoBtn'), redo:$('redoBtn'), resetPlanning:$('resetPlanningBtn'), export:$('exportBtn'), saveStatus:$('saveStatus'),
    title:$('planningTitle'), subtitle:$('planningSubtitle'), showQr:$('showQr'), qrUrl:$('qrUrl'), qrUrlField:$('qrUrlField'), qrStatus:$('qrStatus'), dayStrip:$('dayStrip'), visibleDaysStatus:$('visibleDaysStatus'), showAllDays:$('showAllDaysBtn'), hideOffDays:$('hideOffDaysBtn'), dayName:$('dayName'), dayTime:$('dayTime'), dayStatus:$('dayStatus'), dayTitle:$('dayTitle'), dayNote:$('dayNote'), dayCardColor:$('dayCardColor'), dayTextLayers:$('dayTextLayersBtn'), allDayTextLayers:$('allDayTextLayersBtn'), dayTextLayersStatus:$('dayTextLayersStatus'), dayStar:$('dayStar'), dayImageInput:$('dayImageInput'), dayImageStatus:$('dayImageStatus'), dayImageFit:$('dayImageFit'), cropDayImage:$('cropDayImageBtn'), removeDayImage:$('removeDayImageBtn'),
    artboard:$('artboard'), viewport:$('canvasViewport'), sizer:$('canvasSizer'), canvasLabel:$('canvasLabel'), preflightStatus:$('preflightStatus'), zoom:$('zoomInput'), zoomValue:$('zoomValue'), zoomOut:$('zoomOutBtn'), zoomIn:$('zoomInBtn'), grid:$('toggleGridBtn'),
    inspector:$('inspector'), closeInspector:$('closeInspectorBtn'), emptyInspector:$('emptyInspector'), propertyPanel:$('propertyPanel'), layerList:$('layerList'), layerSelect:$('layerSelect'),
    propX:$('propX'), propY:$('propY'), propW:$('propW'), propH:$('propH'), propRotation:$('propRotation'), propText:$('propText'), propFontSize:$('propFontSize'), propFont:$('propFont'), propWeight:$('propWeight'), propFontStyle:$('propFontStyle'), propTransform:$('propTransform'), propAlign:$('propAlign'), propTextEffect:$('propTextEffect'), propColor:$('propColor'), propFill:$('propFill'), propColorField:$('propColorField'), propFillField:$('propFillField'), propOpacity:$('propOpacity'), textProperties:$('textProperties'), textContentField:$('textContentField'), imageProperties:$('imageProperties'), propImageFit:$('propImageFit'), cropImage:$('cropImageBtn'), replaceImage:$('replaceImageInput'), dayCardProperties:$('dayCardProperties'), propDayLayout:$('propDayLayout'), propShowDayName:$('propShowDayName'), propShowDayTime:$('propShowDayTime'), propShowDayTitle:$('propShowDayTitle'), propShowDayNote:$('propShowDayNote'), applyDayStyleAll:$('applyDayStyleAllBtn'), duplicate:$('duplicateElementBtn'), remove:$('deleteElementBtn'),
    modifierSelect:$('modifierSelect'), typePresetSelect:$('typePresetSelect'), eventBanner:$('eventBanner'), hideModifierLabels:$('hideModifierLabels'), resetLayout:$('resetLayoutBtn'), transparentBackground:$('transparentBackground'), backgroundImageInput:$('backgroundImageInput'), backgroundImageStatus:$('backgroundImageStatus'), backgroundImageFit:$('backgroundImageFit'), cropBackgroundImage:$('cropBackgroundImageBtn'), removeBackgroundImage:$('removeBackgroundImageBtn'),
    emojiGrid:$('emojiGrid'), imageInput:$('imageInput'), toast:$('toastRegion'), cropModal:$('cropModal'), cropTitle:$('cropTitle'), cropClose:$('cropCloseBtn'), cropStage:$('cropStage'), cropPreview:$('cropPreview'), cropFit:$('cropFit'), cropFitHint:$('cropFitHint'), cropZoom:$('cropZoom'), cropZoomValue:$('cropZoomValue'), cropStretchX:$('cropStretchX'), cropStretchXValue:$('cropStretchXValue'), cropStretchY:$('cropStretchY'), cropStretchYValue:$('cropStretchYValue'), cropPosition:$('cropPosition'), cropReset:$('cropResetBtn'), cropCancel:$('cropCancelBtn'), cropApply:$('cropApplyBtn')
  };

  let selectedDay = 0;
  let selectedId = '';
  let zoom = 60;
  let gridEnabled = false;
  let interaction = null;
  let history = [];
  let historyIndex = -1;
  let saveTimer = null;
  let historyTimer = null;
  let suppressHistory = false;
  let missingImageCount = 0;
  let cropDraft = null;
  let cropDrag = null;
  let draggedLayerId = '';

  function uid(prefix='el'){
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  }
  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function clamp(value,min,max){ return Math.max(min,Math.min(max,Number(value)||0)); }
  function snap(value){ return gridEnabled ? Math.round(value/10)*10 : Math.round(value); }
  function escapeHtml(value){ return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); }
  function color(value,fallback='#ffffff'){ return /^#[0-9a-f]{6}$/i.test(String(value||'')) ? value : fallback; }
  function computedColor(value,fallback='#ffffff'){
    const match=String(value||'').match(/^rgba?\(\s*(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/i);
    if(!match)return color(value,fallback);
    return `#${match.slice(1,4).map(part=>clamp(Math.round(Number(part)),0,255).toString(16).padStart(2,'0')).join('')}`;
  }
  function computedFontKey(value,fallback='sans'){
    const family=String(value||'').toLowerCase();
    const hints=[['comic sans','comic'],['segoe print','hand'],['bradley hand','hand'],['bahnschrift condensed','condensed'],['arial narrow','condensed'],['arial black','display'],['impact','display'],['consolas','typewriter'],['lucida console','typewriter'],['courier new','mono'],['georgia','serif'],['trebuchet','rounded'],['segoe ui','sans'],['arial','sans']];
    return hints.find(([hint])=>family.includes(hint))?.[1]||fallback;
  }
  function elementBase(type,x,y,w,h){ return {id:uid(type),type,x,y,w,h,rotation:0,opacity:1,locked:false}; }
  function minimumElementSize(element){return element?.type==='shape'?1:20;}

  function defaultProject(){
    return {version:VERSION,modelRevision:MODEL_REVISION,name:'Mon planning Twitch',format:'wide',width:1600,height:900,template:'cloud',spotlightInitialized:false,modifier:'none',typePreset:'',hideModifierLabels:false,eventBanner:'',showQr:false,qrUrl:'https://twitch.tv/ton_lien',title:'Planning de la semaine',subtitle:'twitch.tv/ton_lien',background:{colors:['#f7b7df','#8399f5'],angle:135,transparent:false,imageSrc:'',imageAssetId:'',imageName:'',imageFit:'cover',...normalizeImageCrop()},days:clone(DEFAULT_DAYS).map(day=>({...day,visible:true,star:false,imageSrc:'',imageAssetId:'',imageName:'',imageFit:'cover',...normalizeImageCrop()})),elements:[]};
  }
  let project = defaultProject();

  function validateProject(raw){
    if(!raw||typeof raw!=='object'||!Array.isArray(raw.days)||raw.days.length!==7||!Array.isArray(raw.elements))throw new Error('Projet V2 invalide');
    if(!['wide','square'].includes(raw.format)||(raw.format==='wide'&&(Number(raw.width)!==1600||Number(raw.height)!==900))||(raw.format==='square'&&(Number(raw.width)!==1080||Number(raw.height)!==1080)))throw new Error('Format V2 invalide');
    if(raw.template==='candy')raw.template='horror';if(!TEMPLATE_STYLE[raw.template])raw.template='cloud';
    raw.modifier=MODIFIERS.includes(raw.modifier)?raw.modifier:'none';raw.typePreset=TYPE_PRESET_ALIASES[raw.typePreset]||raw.typePreset;raw.typePreset=TYPE_PRESETS[raw.typePreset]?raw.typePreset:'';raw.hideModifierLabels=!!raw.hideModifierLabels;raw.eventBanner=String(raw.eventBanner||'');raw.showQr=!!raw.showQr;raw.qrUrl=String(raw.qrUrl||raw.subtitle||'https://twitch.tv/ton_lien');
    raw.name=String(raw.name||'Mon planning Twitch');raw.title=String(raw.title||'Planning de la semaine');raw.subtitle=String(raw.subtitle||'');raw.spotlightInitialized=!!raw.spotlightInitialized;raw.modelRevision=Math.max(0,Number(raw.modelRevision)||0);raw.version=VERSION;
    raw.background=raw.background&&Array.isArray(raw.background.colors)&&raw.background.colors.length===2?raw.background:clone(TEMPLATE_STYLE[raw.template].bg);
    if(Array.isArray(raw.background))raw.background={colors:raw.background,angle:135};
    raw.background.colors=[color(raw.background.colors[0],TEMPLATE_STYLE[raw.template].bg[0]),color(raw.background.colors[1],TEMPLATE_STYLE[raw.template].bg[1])];raw.background.angle=Number(raw.background.angle)||135;raw.background.transparent=!!raw.background.transparent;raw.background.imageSrc=String(raw.background.imageSrc||'');raw.background.imageAssetId=String(raw.background.imageAssetId||'');raw.background.imageName=String(raw.background.imageName||'');raw.background.imageFit=['cover','contain','fill'].includes(raw.background.imageFit)?raw.background.imageFit:'cover';Object.assign(raw.background,normalizeImageCrop(raw.background));
    raw.days=raw.days.map((day,index)=>({name:String(day?.name||DEFAULT_DAYS[index].name),time:String(day?.time||''),title:String(day?.title||''),note:String(day?.note||''),status:day?.status==='off'?'off':'live',visible:day?.visible!==false,star:!!day?.star,imageSrc:String(day?.imageSrc||''),imageAssetId:String(day?.imageAssetId||''),imageName:String(day?.imageName||''),imageFit:['cover','contain','fill'].includes(day?.imageFit)?day.imageFit:'cover',...normalizeImageCrop(day)}));
    raw.elements=raw.elements.filter(element=>element&&typeof element==='object'&&['text','emoji','shape','image','day','qr'].includes(element.type)&&typeof element.id==='string').map(element=>{
      const dayField=['name','time','title','note'].includes(element.dayField)?element.dayField:'',minimum=minimumElementSize(element),normalized={...element,x:Number(element.x)||0,y:Number(element.y)||0,w:Math.max(minimum,Number(element.w)||100),h:Math.max(minimum,Number(element.h)||100),rotation:Number(element.rotation)||0,opacity:clamp(element.opacity??1,0,1),dayIndex:element.type==='day'||dayField?clamp(element.dayIndex,0,6):element.dayIndex};if(dayField)normalized.dayField=dayField;else delete normalized.dayField;if(normalized.variant==='candy')normalized.variant='horror';
      if(element.type==='image')Object.assign(normalized,normalizeImageCrop(element),{fit:['cover','contain','fill'].includes(element.fit)?element.fit:'cover'});
      if(element.type==='day')Object.assign(normalized,{contentLayout:['standard','poster','feature','image'].includes(element.contentLayout)?element.contentLayout:'standard',showDayName:element.showDayName!==false,showDayTime:element.showDayTime!==false,showDayTitle:element.showDayTitle!==false,showDayNote:element.showDayNote!==false});
      if(!raw.typePreset&&normalized.builtIn&&['text','day'].includes(normalized.type)&&['anime','subathon'].includes(raw.modifier)){normalized.effect='none';normalized.fontStyle=raw.modifier==='anime'?'italic':'normal';}
      return normalized;
    });
    const legacyTitle=raw.elements.find(element=>element.type==='text'&&element.builtIn&&element.y<140&&Number(element.fontSize)>50);if(legacyTitle&&!legacyTitle.role)legacyTitle.role='title';
    const legacySubtitle=raw.elements.find(element=>element.type==='text'&&element.builtIn&&element.y>=120&&element.y<220);if(legacySubtitle&&!legacySubtitle.role)legacySubtitle.role='subtitle';
    return raw;
  }

  function textElement(text,x,y,w,h,size,fill,font='rounded',weight=800,align='left'){
    return {...elementBase('text',x,y,w,h),text,fontSize:size,color:fill,fill:'#ffffff',font,weight,align,fontStyle:'normal',transform:'none',letterSpacing:0,effect:'none'};
  }
  const DAY_TEXT_FIELDS = {
    name:{selector:'.elDay__name',property:'name',label:'Jour'},
    time:{selector:'.elDay__time',property:'time',label:'Horaire'},
    title:{selector:'.elDay__title',property:'title',label:'Titre'},
    note:{selector:'.elDay__note',property:'note',label:'Note'}
  };
  function dayTextValue(element,raw=false){const field=DAY_TEXT_FIELDS[element.dayField],day=project.days[element.dayIndex];if(!field||!day)return element.text||'';return !raw&&element.dayField==='time'&&day.status==='off'?'REPOS':String(day[field.property]||'');}
  function linkedDayTexts(dayIndex){return project.elements.filter(element=>element.type==='text'&&element.dayField&&element.dayIndex===dayIndex);}
  function isHiddenWithDay(element){return (element.type==='day'||element.dayField)&&project.days[element.dayIndex]?.visible===false;}
  function shapeElement(shape,x,y,w,h,fill,radius=20){
    return {...elementBase('shape',x,y,w,h),shape,fill,color:'#ffffff',radius,borderColor:'',borderWidth:0};
  }
  function dayElement(index,x,y,w,h,variant){
    return {...elementBase('day',x,y,w,h),dayIndex:index,variant,fill:defaultCardColors(variant).fill,color:defaultCardColors(variant).color,radius:24,font:'rounded',weight:900,fontStyle:'normal',transform:'none',letterSpacing:0,effect:'none',align:'left',fontSize:22,contentLayout:'standard',showDayName:true,showDayTime:true,showDayTitle:true,showDayNote:true};
  }
  function emojiElement(value,x,y,size=100){ return {...elementBase('emoji',x,y,size,size),text:value,fontSize:size*.82,color:'#ffffff',fill:'#ffffff'}; }
  function qrElement(width,height){const size=width===height?150:135;return {...elementBase('qr',width-size-38,height-size-38,size,size),name:'QR Code',builtIn:true,color:'#111827',fill:'#ffffff'};}
  function svgImageElement(svg,x,y,w,h,name){return {...elementBase('image',x,y,w,h),src:`data:image/svg+xml;base64,${btoa(svg)}`,assetId:'',name,fit:'contain',...normalizeImageCrop(),color:'#ffffff',fill:'#ffffff'};}
  function violinWatermark(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 600"><g fill="none" stroke="#70482d" stroke-linecap="round" stroke-linejoin="round"><path fill="#70482d" fill-opacity=".16" stroke-width="7" d="M120 586C54 570 42 510 70 454c17-34 8-68-24-96-42-37-25-112 32-132 27-10 35-38 25-76h34c-10 38-2 66 25 76 57 20 74 95 32 132-32 28-41 62-24 96 28 56 16 116-50 132Z"/><path stroke-width="12" d="M120 230V72M105 75h30l12-34-27-24-27 24 12 34Z"/><path stroke-width="6" d="M92 157h56M83 252c-34 35-31 72-4 99M157 252c34 35 31 72 4 99M78 466c25 27 59 27 84 0"/><path stroke-width="3" d="M114 77v447M120 77v447M126 77v447"/><path stroke-width="8" d="M91 405h58M98 418h44"/><path stroke-width="7" d="M84 286c-18 9-20 31-7 45M156 286c18 9 20 31 7 45"/></g></svg>`;}
  function fantasySwordWatermark(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 720"><defs><linearGradient id="b" x1="0" x2="1"><stop stop-color="#253a39"/><stop offset=".5" stop-color="#d6fff0"/><stop offset="1" stop-color="#142625"/></linearGradient></defs><g stroke="#5df2ae" stroke-linejoin="round"><path fill="url(#b)" stroke-width="5" d="M78 545 91 80l20-65 20 65 12 465-32 76Z"/><path fill="#152725" stroke-width="7" d="m32 536 158 0-18 35H50Z"/><path fill="#10201e" stroke-width="6" d="M94 568h34v105H94z"/><path fill="#5df2ae" stroke-width="4" d="m72 687 39-22 39 22-39 18Z"/><circle cx="111" cy="553" r="15" fill="#07110f" stroke-width="6"/><path fill="none" stroke-width="3" opacity=".7" d="M111 90v425M98 118h26M96 165h30"/></g></svg>`;}
  function resonanceWatermark(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 260"><g fill="none" stroke="#167a82" stroke-linecap="round"><path stroke-width="5" d="M8 144c62-112 105 92 170-8s112 77 176-11 110 79 174-4 107 48 184-69"/><path stroke-width="2" opacity=".55" d="M5 174c71-67 118 48 187-12s112 45 180-9 111 41 177-10 101 24 168-37"/><circle cx="548" cy="91" r="65" stroke-width="3"/><circle cx="548" cy="91" r="41" stroke-width="2"/><circle cx="548" cy="91" r="13" fill="#167a82" stroke="none"/><path stroke-width="3" d="M548 8v22M548 152v22M465 91h22M609 91h22"/></g></svg>`;}
  function twitchLogoMark(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260"><path fill="#fff" d="M16 8h208v162l-57 57h-47l-48 33v-33H16Z"/><path fill="#9147ff" d="M32 24h176v139l-48 48h-48l-24 18v-18H32Z"/><path fill="#fff" d="M62 50h116v83l-33 33h-39l-27 21v-21H62Z"/><path fill="#9147ff" d="M95 72h20v55H95zm43 0h20v55h-20z"/></svg>`;}
  function normalizeImageCrop(element={}){return {cropZoom:clamp(element.cropZoom??1,.1,3),cropX:clamp(element.cropX??0,-200,200),cropY:clamp(element.cropY??0,-200,200),stretchX:clamp(element.stretchX??1,.5,3),stretchY:clamp(element.stretchY??1,.5,3)};}
  function imageCropStyle(element){const crop=normalizeImageCrop(element);return `object-fit:${element.fit||'cover'};left:calc(50% + ${crop.cropX}%);top:calc(50% + ${crop.cropY}%);transform:translate(-50%,-50%) scale(${crop.cropZoom}) scaleX(${crop.stretchX}) scaleY(${crop.stretchY})`;}
  function defaultCardColors(variant){
    return {
      cloud:{fill:'#f7f1ff',color:'#292b63'},cyber:{fill:'#071321',color:'#d9faff'},rpg:{fill:'#e9d2a2',color:'#3f2b1d'},twitch:{fill:'#181022',color:'#ffffff'},manga:{fill:'#ffffff',color:'#17121f'},cozy:{fill:'#fff7e7',color:'#4b3a31'},arcade:{fill:'#160f35',color:'#ffffff'},agenda:{fill:'#fffdf8',color:'#18324a'},polaroid:{fill:'#fffdf8',color:'#24364b'},roadmap:{fill:'#0b2c30',color:'#effff9'},constellation:{fill:'#111536',color:'#f5f3ff'},wuwa:{fill:'#f4faf9',color:'#153f45'},spotlight:{fill:'#171717',color:'#ffffff'},columns:{fill:'#172033',color:'#ffffff'},bubblegrid:{fill:'#68d6e1',color:'#087f8c'},horror:{fill:'#10090b',color:'#ffffff'},violin:{fill:'#fffaf0',color:'#3e291c'},fantasy7:{fill:'#051011',color:'#effff7'},neonblue:{fill:'#040a15',color:'#ffffff'},neonred:{fill:'#130409',color:'#ffffff'},astralblue:{fill:'#07152e',color:'#ffffff'},astralrose:{fill:'#2a071d',color:'#ffffff'}
    }[variant] || {fill:'#ffffff',color:'#111827'};
  }

  function spotlightPositions(width,height,count){
    const square=width===height,gap=square?18:28,margin=square?55:105;
    if(count<=4){const cardW=Math.min(square?300:430,(width-margin*2-gap*Math.max(0,count-1))/Math.max(1,count)),cardH=square?590:535,rowWidth=count*cardW+Math.max(0,count-1)*gap;return Array.from({length:count},(_,index)=>({x:(width-rowWidth)/2+index*(cardW+gap),y:square?300:255,w:cardW,h:cardH}));}
    const columns=count===7?4:3,cardH=square?285:255,top=square?300:285,positions=[];
    for(let row=0;row<2;row++){const rowCount=Math.min(columns,count-row*columns);if(rowCount<=0)continue;const cardW=Math.min(square?245:330,(width-margin*2-gap*(rowCount-1))/rowCount),rowWidth=rowCount*cardW+(rowCount-1)*gap;for(let column=0;column<rowCount;column++)positions.push({x:(width-rowWidth)/2+column*(cardW+gap),y:top+row*(cardH+gap),w:cardW,h:cardH});}
    return positions;
  }
  function spotlightCardLayout(width,height){const visibleIndexes=project.days.map((day,index)=>day.visible!==false?index:-1).filter(index=>index>=0),positions=spotlightPositions(width,height,visibleIndexes.length),byDay=new Map(visibleIndexes.map((dayIndex,index)=>[dayIndex,positions[index]])),fallback={x:width/2-150,y:height/2-120,w:300,h:240};return project.days.map((day,dayIndex)=>({dayIndex,...(byDay.get(dayIndex)||fallback)}));}
  function featureDuoCardLayout(width,height){const square=width===height,visibleIndexes=project.days.map((day,index)=>day.visible!==false?index:-1).filter(index=>index>=0),gap=square?32:54,margin=square?54:74,cardW=(width-margin*2-gap)/2,cardH=square?610:570,top=square?285:220,featured=visibleIndexes.length===2?[{x:margin,y:top,w:cardW,h:cardH},{x:margin+cardW+gap,y:top,w:cardW,h:cardH}]:spotlightPositions(width,height,visibleIndexes.length),byDay=new Map(visibleIndexes.map((dayIndex,index)=>[dayIndex,featured[index]])),fallback={x:width/2-150,y:height/2-120,w:300,h:240};return project.days.map((day,dayIndex)=>({dayIndex,...(byDay.get(dayIndex)||fallback)}));}
  function reflowSpotlightCards(){if(project.template!=='spotlight')return;const layouts=spotlightCardLayout(project.width,project.height);layouts.forEach(layout=>{const card=project.elements.find(element=>element.type==='day'&&element.dayIndex===layout.dayIndex);if(card)Object.assign(card,{x:layout.x,y:layout.y,w:layout.w,h:layout.h});});}
  function reflowDuoFeatureCards(){if(!['neonduel','astralduo'].includes(project.template))return;featureDuoCardLayout(project.width,project.height).forEach(layout=>{const card=project.elements.find(element=>element.type==='day'&&element.dayIndex===layout.dayIndex);if(card)Object.assign(card,{x:layout.x,y:layout.y,w:layout.w,h:layout.h});});}
  function ensureSpotlightCards(){if(project.template!=='spotlight')return;const existing=project.elements.filter(element=>element.type==='day');if(!project.spotlightInitialized){const used=new Set(existing.map(element=>element.dayIndex));project.days.forEach((day,index)=>{day.visible=used.size?used.has(index):index===1||index===4;});project.spotlightInitialized=true;}if(project.days.filter(day=>day.visible!==false).length<2)project.days.filter(day=>day.visible===false).slice(0,2-project.days.filter(day=>day.visible!==false).length).forEach(day=>{day.visible=true;});spotlightCardLayout(project.width,project.height).forEach(layout=>{if(existing.some(card=>card.dayIndex===layout.dayIndex))return;const card=dayElement(layout.dayIndex,layout.x,layout.y,layout.w,layout.h,'spotlight');Object.assign(card,{contentLayout:'feature',align:'center',font:'condensed',fontSize:30,builtIn:true});project.elements.push(card);});reflowSpotlightCards();}

  function cardLayout(style,width,height){
    const square = width===height;
    if(style==='spotlight')return spotlightCardLayout(width,height);
    if(['neonduel','astralduo'].includes(style))return featureDuoCardLayout(width,height);
    if(style==='columns'&&!square){const gap=18,margin=45,cardW=(width-margin*2-gap*6)/7;return Array.from({length:7},(_,i)=>({x:margin+i*(cardW+gap),y:285,w:cardW,h:490}));}
    if(style==='bubblegrid'&&!square){const gap=10,margin=34,cardW=(width-margin*2-gap*6)/7;return Array.from({length:7},(_,i)=>({x:margin+i*(cardW+gap),y:220,w:cardW,h:610}));}
    if(style==='horror'&&!square){const spots=[[70,250],[440,225],[810,260],[1180,230],[255,555],[650,530],[1045,565]];return spots.map(([x,y])=>({x,y,w:300,h:245}));}
    if(style==='rpg'&&!square){const topGap=24,topW=430,topStart=(width-topW*3-topGap*2)/2,bottomGap=22,bottomW=322,bottomStart=(width-bottomW*4-bottomGap*3)/2;return Array.from({length:7},(_,index)=>index<3?{x:topStart+index*(topW+topGap),y:250,w:topW,h:260}:{x:bottomStart+(index-3)*(bottomW+bottomGap),y:548,w:bottomW,h:225});}
    if(style==='violin'){const gap=square?18:22,margin=square?140:150,cardW=(width-margin*2-gap*3)/4,cardH=square?235:225;return Array.from({length:7},(_,i)=>{const row=i<4?0:1,index=row?i-4:i,count=row?3:4,rowWidth=count*cardW+(count-1)*gap;return {x:(width-rowWidth)/2+index*(cardW+gap),y:row?(square?625:565):(square?300:285),w:cardW,h:cardH};});}
    if(style==='fantasy7'&&!square){const gap=16,margin=46,cardW=(width-margin*2-gap*6)/7,tops=[300,266,314,250,302,274,320],bottom=820;return tops.map((y,index)=>({x:margin+index*(cardW+gap),y,w:cardW,h:bottom-y}));}
    if(style==='agenda'){
      const gap=18,top=225,margin=55,cardW=(width-margin*2-gap)/2,cardH=(height-top-45-gap*3)/4;
      return Array.from({length:7},(_,i)=>{const column=i<4?0:1,row=i<4?i:i-4;return {x:margin+column*(cardW+gap),y:top+row*(cardH+gap)+(column?cardH*.42:0),w:cardW,h:cardH};});
    }
    if(style==='roadmap'&&!square){const gap=18,margin=54,cardW=(width-margin*2-gap*6)/7;return Array.from({length:7},(_,i)=>({x:margin+i*(cardW+gap),y:i%2?475:245,w:cardW,h:300}));}
    if(style==='constellation'&&!square){const gap=24,topW=338,topStart=(width-topW*4-gap*3)/2,bottomW=390,bottomStart=(width-bottomW*3-gap*2)/2;return Array.from({length:7},(_,index)=>index<4?{x:topStart+index*(topW+gap),y:286+(index%2)*12,w:topW,h:218}:{x:bottomStart+(index-4)*(bottomW+gap),y:548+(index%2)*10,w:bottomW,h:230});}
    if (square || style==='cozy' || style==='rpg' || style==='polaroid') {
      const cols=4,gap=24,cardW=(width-100-gap*3)/4,cardH=square?300:250;
      return Array.from({length:7},(_,i)=>{
        const row=i<4?0:1, index=row===0?i:i-4, count=row===0?4:3;
        const rowWidth=count*cardW+(count-1)*gap;
        return {x:(width-rowWidth)/2+index*(cardW+gap),y:(square?285:245)+row*(cardH+28),w:cardW,h:cardH};
      });
    }
    const gap=18,margin=54,cardW=(width-margin*2-gap*6)/7;
    return Array.from({length:7},(_,i)=>({x:margin+i*(cardW+gap),y:style==='cyber'?230+(i%2)*38:245,w:cardW,h:style==='manga'?500-(i%3)*22:520}));
  }

  function buildTemplate(name){
    const previousTemplate=project.template;
    if(DUO_TEMPLATES.has(previousTemplate)&&!DUO_TEMPLATES.has(name))project.days.forEach(day=>{day.visible=true;});
    const style=TEMPLATE_STYLE[name]||TEMPLATE_STYLE.cloud;
    const {width,height}=project;
    if(name==='spotlight'&&!project.spotlightInitialized){project.days.forEach((day,index)=>{day.visible=index===1||index===4;});project.spotlightInitialized=true;}
    if(['neonduel','astralduo'].includes(name)&&project.days.filter(day=>day.visible!==false).length!==2)project.days.forEach((day,index)=>{day.visible=index===1||index===5;});
    const elements=[];
    const dark=name==='manga' ? '#17121f' : style.text;
    const heading=textElement(project.title,70,45,width-140,105,width===height?64:76,dark,'rounded',900,'center');heading.role='title';elements.push(heading);
    const subtitle=textElement(project.subtitle,250,150,width-500,42,27,name==='manga'?'#6b21a8':style.text,'sans',800,'center');subtitle.role='subtitle';elements.push(subtitle);
    if(name==='spotlight'){Object.assign(heading,{font:'display',fontSize:68,transform:'uppercase',letterSpacing:3});Object.assign(subtitle,{font:'sans',fontStyle:'italic'});}
    if(name==='rpg'){Object.assign(heading,{align:'left',x:55,w:1030,font:'sans',fontSize:76,color:'#ffffff',weight:900,letterSpacing:-2});Object.assign(subtitle,{align:'left',x:58,w:720,y:150,font:'sans',fontSize:25,color:'#d9c2ff',weight:700});}
    if(name==='columns'){Object.assign(heading,{align:'left',x:45,w:720,font:'condensed',fontSize:82,transform:'uppercase'});Object.assign(subtitle,{align:'right',x:800,w:750,y:160});}
    if(name==='bubblegrid'){Object.assign(heading,{font:'hand',color:'#087f8c',fontSize:70});Object.assign(subtitle,{font:'comic',color:'#087f8c'});}
    if(name==='horror'){Object.assign(heading,{align:'left',x:70,w:1050,font:'display',fontSize:86,color:'#f8fafc',transform:'uppercase',letterSpacing:4,effect:'hard'});Object.assign(subtitle,{align:'right',x:850,w:670,y:155,font:'typewriter',fontSize:24,color:'#ff334d',transform:'uppercase',letterSpacing:3});}
    if(name==='violin'){Object.assign(heading,{font:'serif',fontStyle:'italic',fontSize:70,color:style.text,letterSpacing:2});Object.assign(subtitle,{font:'serif',fontStyle:'italic',fontSize:25,color:style.accent});}
    if(name==='constellation'){Object.assign(heading,{align:'left',x:58,w:940,font:'sans',fontSize:68,transform:'none',letterSpacing:0,color:'#10363c'});Object.assign(subtitle,{align:'left',x:62,w:620,y:148,font:'mono',fontSize:20,color:style.accent,letterSpacing:4});}
    if(name==='fantasy7'){Object.assign(heading,{align:'left',x:55,w:1030,font:'condensed',fontSize:86,color:style.text,transform:'uppercase',letterSpacing:6,effect:'hard'});Object.assign(subtitle,{align:'right',x:930,w:600,y:155,font:'mono',fontSize:23,color:style.accent,transform:'uppercase',letterSpacing:3});}
    if(name==='neonduel'){Object.assign(heading,{x:project.width/2-240,y:22,w:480,h:90,font:'condensed',fontSize:38,color:'#ffffff',transform:'uppercase',letterSpacing:7,effect:'neon'});Object.assign(subtitle,{x:project.width/2-300,y:91,w:600,h:32,font:'mono',fontSize:16,color:'#bddfff',transform:'uppercase',letterSpacing:4});}
    if(name==='astralduo'){Object.assign(heading,{x:project.width/2-360,y:34,w:720,h:70,font:'serif',fontStyle:'italic',fontSize:52,color:'#ffffff',letterSpacing:3,effect:'soft'});Object.assign(subtitle,{x:project.width/2-280,y:108,w:560,h:30,font:'sans',fontSize:16,color:'#f7d7f0',transform:'uppercase',letterSpacing:5});}
    if(name==='agenda'){Object.assign(heading,{align:'left',font:'serif',x:70,w:720,color:style.text});Object.assign(subtitle,{align:'left',x:72,w:650,color:style.accent});elements.unshift(shapeElement('rect',42,42,10,height-84,style.accent,5));}
    if(name==='roadmap'){elements.unshift(shapeElement('rect',65,438,width-130,10,style.accent,5));elements.push(emojiElement('🚀',width-125,390,82));}
    if(name==='rpg'){
      const topRail=shapeElement('rect',34,210,width-68,6,'#9147ff',3);topRail.locked=true;elements.unshift(topRail);
      const logo=svgImageElement(twitchLogoMark(),width-245,24,175,185,'Logo Twitch');logo.locked=true;elements.push(logo);
      const livePill=shapeElement('rect',width-505,82,220,48,'#772ce8',14);livePill.locked=true;elements.unshift(livePill);
      const live=textElement('EN LIVE',width-485,93,180,30,22,'#ffffff','sans',900,'center');live.letterSpacing=3;live.locked=true;elements.push(live);
    }
    if(name==='constellation'){
      const resonance=svgImageElement(resonanceWatermark(),width-790,18,730,250,'Onde de résonance');resonance.opacity=.58;resonance.locked=true;elements.unshift(resonance);
      [[width-250,48,166],[width-215,83,96],[32,height-205,150]].forEach(([x,y,size],index)=>{const ring=shapeElement('circle',x,y,size,size,index===1?'#4ed6d5':'#e8f5f3',size/2);ring.borderColor='#167a82';ring.borderWidth=index===1?4:2;ring.opacity=index===1 ? .24 : .42;ring.locked=true;elements.unshift(ring);});
      const resonanceLabel=textElement('RESONANCE // WEEK 07',62,210,430,28,16,'#167a82','mono',900,'left');resonanceLabel.letterSpacing=4;resonanceLabel.locked=true;elements.push(resonanceLabel);
    }
    const layouts=cardLayout(name,width,height);
    layouts.forEach((layout,index)=>{
      const card=dayElement(layout.dayIndex??index,layout.x,layout.y,layout.w,layout.h,style.card);
      const visibleSide=project.days.map((day,dayIndex)=>day.visible!==false?dayIndex:-1).filter(dayIndex=>dayIndex>=0).indexOf(layout.dayIndex??index);
      if(name==='manga') card.rotation=[-2,1,-1,2,-1,1,-2][index];
      if(name==='polaroid') card.rotation=[-3,2,-1,3,-2,1,-3][index];
      if(name==='rpg')Object.assign(card,{contentLayout:'poster',align:'center',font:'sans',fontSize:index<3?24:21});
      if(name==='constellation')Object.assign(card,{contentLayout:'standard',align:'left',font:'condensed',fontSize:22});
      if(name==='spotlight')Object.assign(card,{contentLayout:'feature',align:'center',font:'condensed',fontSize:30});
      if(name==='columns'){Object.assign(card,{contentLayout:'poster',align:'center',font:'typewriter',fontSize:22});card.y+=[0,26,-8,18,-12,24,2][index];card.h-=[0,26,-8,18,-12,24,2][index];}
      if(name==='bubblegrid'){Object.assign(card,{contentLayout:'standard',align:'center',font:'hand',fontSize:22,fill:index%2?'#5cd2df':'#acdfe7'});}
      if(name==='horror'){Object.assign(card,{contentLayout:'poster',align:'center',font:'condensed',fontSize:23,fill:index%2?'#17090c':'#0d0d0f'});card.rotation=[-2,2,-1,2,1,-2,2][index];}
      if(name==='violin')Object.assign(card,{contentLayout:'standard',font:'serif',fontStyle:'italic',fontSize:24});
      if(name==='fantasy7')Object.assign(card,{contentLayout:'poster',align:'center',font:'condensed',fontSize:22});
      if(name==='neonduel'){Object.assign(card,{variant:visibleSide===1?'neonred':'neonblue',fill:visibleSide===1?'#130409':'#040a15',contentLayout:'feature',align:'center',font:'condensed',fontSize:34,showDayNote:false});}
      if(name==='astralduo'){Object.assign(card,{variant:visibleSide===1?'astralrose':'astralblue',fill:visibleSide===1?'#2a071d':'#07152e',contentLayout:'feature',align:'center',font:'serif',fontSize:32,showDayNote:false});}
      elements.push(card);
    });
    if(name==='cloud'){
      elements.push(emojiElement('☁️',-15,5,150));elements.push(emojiElement('☁️',width-165,55,130));
      elements.push(emojiElement('✨',width-125,15,84));
      elements.push(emojiElement('🌙',width/2-36,188,72));
    }
    if(name==='cyber'){
      elements.push(shapeElement('rect',35,205,width-70,8,'#22d3ee',0));
      elements.push(emojiElement('🕹️',40,height-120,82));elements.push(emojiElement('🎧',width-115,height-118,78));
    }
    if(name==='rpg'){
      const community=textElement('ON SE RETROUVE EN LIVE  •  À TRÈS VITE',55,height-55,760,28,17,'#d9c2ff','sans',700,'left');community.letterSpacing=2;community.locked=true;elements.push(community);
      [[width-360,height-170,270],[width-330,height-124,215],[width-285,height-82,170]].forEach(([x,y,w],index)=>{const bubble=shapeElement('rect',x,y,w,24,index===0?'#9147ff':'#d9c2ff',12);bubble.opacity=index===0 ? .72 : .42;bubble.locked=true;elements.push(bubble);});
      elements.push(emojiElement('💜',width-105,38,66));elements.push(emojiElement('🎮',38,height-115,76));
    }
    if(name==='constellation'){
      const footer=textElement('WAVES  /  ECHOES  /  LIVE',width-540,height-57,480,28,16,'#10363c','mono',900,'right');footer.letterSpacing=5;footer.locked=true;elements.push(footer);
      [55,94,133].forEach((y,index)=>{const pulse=shapeElement('rect',width-540,y,220-index*42,3,'#167a82',2);pulse.opacity=.42; pulse.locked=true;elements.unshift(pulse);});
      elements.push(emojiElement('🌊',38,height-112,76));elements.push(emojiElement('🪽',width-120,height-122,82));
    }
    if(name==='manga'){
      elements.push(textElement('WEEK!',width-235,32,190,85,58,'#db2777','sans',950,'center'));
      elements.push(emojiElement('💥',18,height-145,120));
    }
    if(name==='cozy'){
      elements.push(emojiElement('🎧',width-175,height-165,125));elements.push(emojiElement('🎮',width-285,height-125,92));
      elements.push(emojiElement('☕',52,height-150,105));elements.push(emojiElement('🍄',155,height-105,66));
    }
    if(name==='arcade'){
      elements.push(textElement('INSERT COIN',width-330,height-70,280,40,28,'#00f5ff','mono',900,'right'));
      elements.push(emojiElement('🕹️',35,45,100));
    }
    if(name==='agenda'){elements.push(textElement('SEMAINE 01',width-340,65,270,48,28,style.accent,'condensed',900,'right'));}
    if(name==='polaroid'){elements.push(emojiElement('🌈',width-185,height-155,125));elements.push(emojiElement('🎧',width-275,height-105,78));elements.push(emojiElement('📌',35,45,76));}
    if(name==='bubblegrid'){elements.push(emojiElement('🫧',10,20,115));elements.push(emojiElement('🎮',width-130,45,96));elements.push(emojiElement('⭐',width/2-45,height-105,90));}
    if(name==='columns'){
      const base=shapeElement('rect',45,805,width-90,7,'#9ecb91',3);elements.unshift(base);
      [45,width*.2,width*.4,width*.6,width*.8,width-55].forEach((x,index)=>{const point=shapeElement('circle',x,794,index%2?18:24,index%2?18:24,index%2?'#dbeafe':'#9ecb91',20);elements.push(point);});
      const stream=textElement('STREAM',48,128,520,88,78,'#9ecb91','condensed',900,'left');stream.letterSpacing=7;elements.push(stream);
      elements.push(emojiElement('🎮',width-130,height-120,86));
    }
    if(name==='bubblegrid'){
      const header=shapeElement('rect',28,195,width-56,32,'#f05bce',14);header.opacity=.55;elements.unshift(header);
      [[55,90,70,'#ffffff'],[245,40,42,'#ffffff'],[width-210,105,58,'#f05bce'],[width-85,180,44,'#ffffff'],[100,height-105,74,'#f05bce']].forEach(([x,y,size,fill])=>{const bubble=shapeElement('circle',x,y,size,size,fill,size/2);bubble.opacity=.28;elements.unshift(bubble);});
    }
    if(name==='horror'){
      for(let y=215;y<height-35;y+=34){const scan=shapeElement('rect',35,y,width-70,2,y%68?'#5f101a':'#a7192d',0);scan.opacity=.34;elements.unshift(scan);}
      const leftBar=shapeElement('rect',38,205,10,height-250,'#ff334d',0);const rightBar=shapeElement('rect',width-48,205,10,height-250,'#ff334d',0);elements.unshift(leftBar,rightBar);
      const rec=textElement('● REC  00:13:37',width-410,45,350,45,28,'#ff334d','typewriter',900,'right');rec.letterSpacing=2;elements.push(rec);
      const play=textElement('PLAY ▶  VHS',55,height-72,300,42,24,'#e5e7eb','typewriter',700,'left');elements.push(play);
      elements.push(emojiElement('🦇',width-145,height-145,105));elements.push(emojiElement('👻',25,55,92));
    }
    if(name==='violin'){
      const frameColor='#70482d';
      [[24,24,width-48,3],[24,height-27,width-48,3],[24,24,3,height-48],[width-27,24,3,height-48],[34,34,width-68,1],[34,height-35,width-68,1],[34,34,1,height-68],[width-35,34,1,height-68]].forEach(([x,y,w,h])=>{const frame=shapeElement('rect',x,y,w,h,frameColor,0);frame.locked=true;elements.unshift(frame);});
      [252,270,288,306,324,532,550,568,586,604].forEach(y=>{const staff=shapeElement('rect',70,y,width-140,2,'#76543b',0);staff.opacity=.72;staff.locked=true;elements.unshift(staff);});
      [width*.27,width*.51,width*.75].forEach(x=>{const bar=shapeElement('rect',x,250,3,76,'#76543b',0);bar.opacity=.72;bar.locked=true;elements.unshift(bar);});
      [width*.35,width*.55,width*.75].forEach(x=>{const bar=shapeElement('rect',x,530,3,76,'#76543b',0);bar.opacity=.72;bar.locked=true;elements.unshift(bar);});
      const watermark=svgImageElement(violinWatermark(),width-355,155,285,660,'Violon en filigrane');watermark.opacity=.34;watermark.locked=true;elements.unshift(watermark);
      const bow=shapeElement('rect',width-430,170,380,5,frameColor,3);bow.rotation=64;bow.opacity=.38;bow.locked=true;elements.unshift(bow);
      const clefs=[[42,225],[42,505]];clefs.forEach(([x,y])=>{const clef=textElement('𝄞',x,y,100,125,105,frameColor,'serif',400,'center');clef.locked=true;elements.push(clef);});
      [['I.  ALLEGRO',75,218],['II.  ANDANTE',75,498]].forEach(([label,x,y])=>{const movement=textElement(label,x,y,300,32,18,frameColor,'serif',700,'left');movement.letterSpacing=4;movement.locked=true;elements.push(movement);});
      const romans=['I','II','III','IV','V','VI','VII'];layouts.forEach((layout,index)=>{const measure=textElement(romans[index],layout.x,layout.y-29,layout.w,24,15,frameColor,'serif',700,'center');measure.letterSpacing=2;measure.locked=true;elements.push(measure);});
      const notes=[['♪',width*.17,230,44],['♫',width*.45,225,50],['♩',width*.69,236,42],['♪',width*.89,218,46],['♫',width*.22,510,48],['♩',width*.49,518,42],['♪',width*.72,505,46],['♫',width*.88,515,50]];notes.forEach(([note,x,y,size])=>{const item=textElement(note,x,y,64,64,size,frameColor,'serif',900,'center');item.locked=true;elements.push(item);});
      const ornament=textElement('❦',width/2-70,174,140,60,48,frameColor,'serif',400,'center');ornament.locked=true;elements.push(ornament);
      const opus=textElement('Op. 7  •  Moderato',55,height-65,320,30,17,frameColor,'serif',700,'left');opus.fontStyle='italic';opus.locked=true;elements.push(opus);
      elements.push(emojiElement('🎻',42,42,88));elements.push(emojiElement('🎼',width-125,48,72));
    }
    if(name==='fantasy7'){
      const roman=textElement('VII',width-520,18,430,260,240,'#5df2ae','display',900,'right');roman.opacity=.12;roman.letterSpacing=-12;roman.locked=true;elements.unshift(roman);
      const sword=svgImageElement(fantasySwordWatermark(),width-330,105,255,720,'Épée fantasy industrielle');sword.opacity=.3;sword.rotation=7;sword.locked=true;elements.unshift(sword);
      [[55,height-250,220],[85,height-220,160],[115,height-190,100]].forEach(([x,y,size],index)=>{const reactor=shapeElement('circle',x,y,size,size,index===2?'#5df2ae':'#071b18',size/2);reactor.borderColor='#5df2ae';reactor.borderWidth=index===2?5:3;reactor.opacity=index===2 ? .32 : .22;reactor.locked=true;elements.unshift(reactor);});
      [[32,225,width-64,5],[32,842,width-64,5],[width*.38,205,6,655]].forEach(([x,y,w,h])=>{const rail=shapeElement('rect',x,y,w,h,'#5df2ae',0);rail.opacity=.32;rail.locked=true;elements.unshift(rail);});
      const sector=textElement('SECTOR 07  //  MAKO WEEK',52,213,560,34,19,'#76ffc0','mono',900,'left');sector.letterSpacing=4;sector.locked=true;elements.push(sector);
      elements.push(emojiElement('⚔️',width-145,height-140,92));elements.push(emojiElement('⚡',42,48,76));
    }
    if(name==='neonduel'){
      const middle=shapeElement('rect',width/2-2,135,4,height-170,'#dbeafe',0);middle.opacity=.7;elements.unshift(middle);
      [[28,145,width/2-52,4,'#38bdf8'],[width/2+24,145,width/2-52,4,'#fb4b69'],[28,height-34,width/2-52,4,'#38bdf8'],[width/2+24,height-34,width/2-52,4,'#fb4b69']].forEach(([x,y,w,h,fill])=>{const rail=shapeElement('rect',x,y,w,h,fill,0);rail.opacity=.7;elements.unshift(rail);});
      const versus=textElement('VS',width/2-55,height/2-45,110,90,70,'#ffffff','display',900,'center');versus.effect='neon';elements.push(versus);
      [['BLUE SIDE',42,160,'#7dd3fc'],['RED SIDE',width-282,160,'#fda4af']].forEach(([label,x,y,fill])=>{const side=textElement(label,x,y,240,28,17,fill,'mono',900,x<width/2?'left':'right');side.letterSpacing=4;elements.push(side);});
    }
    if(name==='astralduo'){
      [[65,height/2-245,490,'#2494ff'],[width-555,height/2-245,490,'#f43f8f']].forEach(([x,y,size,fill])=>{[0,34,68].forEach((inset,index)=>{const ring=shapeElement('circle',x+inset,y+inset,size-inset*2,size-inset*2,'transparent',(size-inset*2)/2);ring.fill='#071125';ring.borderColor=fill;ring.borderWidth=index===0?4:2;ring.opacity=.22+index*.12;elements.unshift(ring);});});
      [180,260,340,420,500,580,660].forEach((y,index)=>{const diamond=shapeElement('rect',width/2-10,y,20,20,index%2?'#ff8dcc':'#91d7ff',3);diamond.rotation=45;diamond.opacity=.75;elements.push(diamond);});
      const sigil=textElement('✦',width/2-52,height/2-58,104,104,82,'#ffffff','serif',400,'center');sigil.effect='neon';elements.push(sigil);
      [['✦',70,155,42],['✧',width-118,172,50],['🦋',30,height-115,74],['🦋',width-105,height-120,78],['🌙',width/2-44,132,70]].forEach(([symbol,x,y,size])=>elements.push(emojiElement(symbol,x,y,size)));
    }
    if(project.showQr)elements.push(qrElement(width,height));
    elements.forEach(element=>{element.builtIn=true;element.locked=false;});
    project.template=name;
    project.modelRevision=MODEL_REVISION;
    project.background={...project.background,colors:style.bg,angle:style.angle};
    project.elements=elements;
    if(project.typePreset&&TYPE_PRESETS[project.typePreset])project.elements.filter(element=>['text','day'].includes(element.type)).forEach(element=>Object.assign(element,TYPE_PRESETS[project.typePreset]));
    else if(project.modifier!=='none')applyModifierTypography();
  }

  function persistable(source=project){
    const data=clone(source);
    data.elements.forEach(element=>{ if(element.type==='image'&&element.assetId) element.src=''; });
    data.days.forEach(day=>{if(day.imageAssetId)day.imageSrc='';});
    if(data.background.imageAssetId)data.background.imageSrc='';
    return data;
  }
  async function hydrateImages(target){
    if(!window.PlanningAssetStore)return;
    let missing=0;
    for(const element of target.elements){
      if(element.type==='image'&&element.assetId&&!element.src){
        try{element.src=await window.PlanningAssetStore.get(element.assetId);if(!element.src)missing++;}catch{missing++;}
      }
    }
    for(const day of target.days){if(day.imageAssetId&&!day.imageSrc){try{day.imageSrc=await window.PlanningAssetStore.get(day.imageAssetId);if(!day.imageSrc)missing++;}catch{missing++;}}}
    if(target.background.imageAssetId&&!target.background.imageSrc){try{target.background.imageSrc=await window.PlanningAssetStore.get(target.background.imageAssetId);if(!target.background.imageSrc)missing++;}catch{missing++;}}
    return missing;
  }
  async function externalizeInlineImages(){
    if(!window.PlanningAssetStore)return;
    const targets=[...project.elements.filter(element=>element.type==='image'&&element.src&&!element.assetId&&!element.builtIn).map(element=>({item:element,srcKey:'src',idKey:'assetId'})),...project.days.filter(day=>day.imageSrc&&!day.imageAssetId).map(day=>({item:day,srcKey:'imageSrc',idKey:'imageAssetId'})),...(project.background.imageSrc&&!project.background.imageAssetId?[{item:project.background,srcKey:'imageSrc',idKey:'imageAssetId'}]:[])];
    for(const target of targets){const assetId=uid('asset');try{await window.PlanningAssetStore.put(assetId,target.item[target.srcKey]);target.item[target.idKey]=assetId;}catch{}}
  }
  function writeSave(){
    clearTimeout(saveTimer);saveTimer=null;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(persistable()));els.saveStatus.textContent='Sauvegardé';return true;}
    catch{els.saveStatus.textContent='Non sauvegardé';toast('Sauvegarde locale impossible.');return false;}
  }
  function save(){clearTimeout(saveTimer);els.saveStatus.textContent='Sauvegarde…';saveTimer=setTimeout(writeSave,180);}
  function queueHistory(){
    if(suppressHistory)return;
    clearTimeout(historyTimer);
    historyTimer=setTimeout(pushHistory,160);
  }
  function pushHistory(){
    if(suppressHistory)return;
    const snapshot=JSON.stringify(persistable());
    if(history[historyIndex]===snapshot)return updateHistoryButtons();
    history=history.slice(0,historyIndex+1);
    history.push(snapshot);
    if(history.length>60)history.shift();
    historyIndex=history.length-1;
    updateHistoryButtons();
  }
  function flushHistory(){clearTimeout(historyTimer);pushHistory();}
  function commit(){ queueHistory();save(); }
  async function restoreHistory(index){
    if(index<0||index>=history.length)return;
    suppressHistory=true;
    project=JSON.parse(history[index]);
    await hydrateImages(project);
    historyIndex=index;selectedId='';renderAll();save();suppressHistory=false;updateHistoryButtons();
  }
  function updateHistoryButtons(){els.undo.disabled=historyIndex<=0;els.redo.disabled=historyIndex>=history.length-1;}

  function migrateV1(){
    try{
      const raw=localStorage.getItem('planninggpt_clean_v25');
      if(!raw)return null;
      const old=JSON.parse(raw),fresh=defaultProject();
      fresh.title=String(old.title||fresh.title);fresh.subtitle=String(old.subtitle||fresh.subtitle);
      fresh.modifier=MODIFIERS.includes(old.specialMode)?old.specialMode:'none';fresh.hideModifierLabels=!!old.hideSpecialLabels;fresh.eventBanner=String(old.eventBanner||'');fresh.showQr=!!old.showQr;fresh.qrUrl=fresh.subtitle;
      if(Array.isArray(old.days))fresh.days=DEFAULT_DAYS.map((fallback,index)=>{
        const day=old.days[index]||{};
        const legacyCrop=day.imageCropGrid||{};return {name:fallback.name,time:String(day.time||fallback.time),title:String(day.category||fallback.title),note:String(day.note||''),status:String(day.time||'').toUpperCase()==='OFF'?'off':'live',visible:true,star:!!day.star,imageSrc:String(day.image||''),imageAssetId:'',imageName:String(day.imageName||''),imageFit:['cover','contain','fill'].includes(day.imageFit)?day.imageFit:'cover',cropZoom:Number(legacyCrop.zoom)||1,cropX:Number(legacyCrop.x)||0,cropY:Number(legacyCrop.y)||0,stretchX:Number(legacyCrop.stretchX)||1,stretchY:Number(legacyCrop.stretchY)||1};
      });
      project=fresh;buildTemplate('cloud');applyModifierTypography();return project;
    }catch{return null;}
  }
  async function load(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){project=validateProject(JSON.parse(raw));missingImageCount=await hydrateImages(project)||0;const refreshReplacedModel=project.modelRevision<3&&project.template==='rpg',unlockDefaultLayers=project.modelRevision<MODEL_REVISION;project.modelRevision=MODEL_REVISION;if(refreshReplacedModel){const custom=project.elements.filter(element=>!element.builtIn).map(clone),template=project.template;buildTemplate(template);project.elements.push(...custom);}else if(unlockDefaultLayers)project.elements.filter(element=>element.builtIn).forEach(element=>{element.locked=false;});return;}
    }catch{}
    if(!migrateV1()){project=defaultProject();buildTemplate('cloud');}
  }

  function gradientCss(){const bg=project.background;return `linear-gradient(${bg.angle}deg,${bg.colors[0]},${bg.colors[1]})`;}
  function renderAll(){
    els.projectName.value=project.name;els.title.value=project.title;els.subtitle.value=project.subtitle;els.showQr.checked=!!project.showQr;els.qrUrl.value=project.qrUrl||'';renderQrControls();
    renderDays();renderModifierControls();renderTypePresetControls();renderBackgroundControls();renderCanvas();renderInspector();renderLayers();updateZoom();updateHistoryButtons();
  }
  function renderDays(){
    els.dayStrip.innerHTML=DAY_SHORT.map((name,index)=>{const day=project.days[index],visible=day.visible!==false,action=visible?'Masquer':'Afficher';return `<div class="dayPickWrap${index===selectedDay?' isActive':''}${visible?'':' isHidden'}"><button class="dayPick" data-day="${index}" type="button">${day.star?'★ ':''}${name}</button><button class="dayToggle" data-toggle-day="${index}" type="button" aria-pressed="${visible}" title="${action} ${escapeHtml(day.name)}" aria-label="${action} ${escapeHtml(day.name)}">${visible?'●':'○'}</button></div>`;}).join('');
    const visibleCount=project.days.filter(day=>day.visible!==false).length;els.visibleDaysStatus.textContent=`${visibleCount} jour${visibleCount>1?'s':''} affiché${visibleCount>1?'s':''} sur 7`;
    const day=project.days[selectedDay],card=project.elements.find(element=>element.type==='day'&&element.dayIndex===selectedDay),separated=linkedDayTexts(selectedDay).length>0,visibleCards=project.elements.filter(element=>element.type==='day'&&project.days[element.dayIndex]?.visible!==false),allSeparated=visibleCards.length>0&&visibleCards.every(element=>linkedDayTexts(element.dayIndex).length>0);els.dayName.value=day.name;els.dayTime.value=day.time;els.dayTitle.value=day.title;els.dayNote.value=day.note;els.dayStatus.value=day.status;els.dayStar.checked=!!day.star;els.dayCardColor.value=color(card?.fill,'#111827');els.dayCardColor.disabled=!card;els.dayTextLayers.textContent=separated?'Regrouper les textes de ce jour':'Séparer les textes de ce jour';els.allDayTextLayers.textContent=allSeparated?'Regrouper les textes de tous les jours':'Libérer les textes de tous les jours';els.dayTextLayersStatus.textContent=separated?'Les textes restent liés à ce jour mais se déplacent maintenant séparément.':'La carte et chacun de ses textes pourront être déplacés séparément.';els.dayImageStatus.textContent=day.imageSrc?(day.imageName||'Image ajoutée'):'Aucune image';els.dayImageFit.value=day.imageFit||'contain';els.dayImageFit.disabled=!day.imageSrc;els.cropDayImage.disabled=!day.imageSrc;els.removeDayImage.disabled=!day.imageSrc;
  }
  function selectDayForEditing(index){selectedDay=clamp(index,0,6);const card=project.days[selectedDay].visible===false?null:project.elements.find(element=>element.type==='day'&&element.dayIndex===selectedDay);selectedId=card?.id||'';renderDays();renderCanvas();renderInspector();renderLayers();}
  function setDayVisibility(index,visible){const day=project.days[clamp(index,0,6)];if(DUO_TEMPLATES.has(project.template)&&!visible&&project.days.filter(item=>item.visible!==false).length<=2)return toast(project.template==='spotlight'?'Duo et + conserve au moins deux jours affichés.':'Ce modèle conserve au moins deux jours affichés.');day.visible=visible;if(!visible&&isHiddenWithDay(selectedElement()))selectedId='';reflowSpotlightCards();reflowDuoFeatureCards();renderAll();pushHistory();save();toast(`${day.name} ${visible?'affiché':'masqué'} sans supprimer ses données.`);}
  function renderModifierControls(){
    els.modifierSelect.value=project.modifier;els.eventBanner.value=project.eventBanner||'';els.hideModifierLabels.checked=!!project.hideModifierLabels;
  }
  function renderTypePresetControls(){els.typePresetSelect.value=project.typePreset||'';}
  function renderBackgroundControls(){
    const bg=project.background;els.transparentBackground.checked=!!bg.transparent;els.backgroundImageStatus.textContent=bg.transparent?(bg.imageSrc?'Image masquée':'PNG transparent'):bg.imageSrc?(bg.imageName||'Image ajoutée'):'Dégradé du modèle';els.backgroundImageFit.value=bg.imageFit||'cover';els.backgroundImageFit.disabled=!bg.imageSrc||bg.transparent;els.cropBackgroundImage.disabled=!bg.imageSrc||bg.transparent;els.removeBackgroundImage.disabled=!bg.imageSrc;
  }
  function elementStyle(element){
    return `left:${element.x}px;top:${element.y}px;width:${element.w}px;height:${element.h}px;transform:rotate(${element.rotation||0}deg);opacity:${element.opacity??1};z-index:${project.elements.indexOf(element)+1}`;
  }
  function transformedText(value,transform){const text=String(value??'');return transform==='uppercase'?text.toUpperCase():transform==='lowercase'?text.toLowerCase():text;}
  function typographyStyle(element){
    return `font-family:${FONT_MAP[element.font]||FONT_MAP.sans};font-style:${element.fontStyle||'normal'};font-weight:${element.weight||800};text-transform:${element.transform||'none'};letter-spacing:${Number(element.letterSpacing)||0}px;text-align:${element.align||'left'}`;
  }
  function specialLabel(day,index){
    if(project.hideModifierLabels||project.modifier==='none')return '';
    if(project.modifier==='ticket')return '🎟 Ticket stream';
    if(project.modifier==='restaurant')return day.status==='off'?'🍽 Cuisine fermée':['Entrée','Plat du jour','Suggestion','Spécialité','Menu du soir','Service commu','Dessert'][index];
    if(project.modifier==='rpg')return day.status==='off'?'🏕 Repos à l’auberge':day.star?'👑 Quête principale':'⚔ Quête secondaire';
    if(project.modifier==='logbook')return `▣ Journal ${String(index+1).padStart(2,'0')}`;
    if(project.modifier==='anime')return `EP.${String(index+1).padStart(2,'0')}`;
    if(project.modifier==='poster')return day.star?'★ Événement principal':'Programme';
    if(project.modifier==='marathon')return day.star?'🏁 Grand final':`Étape ${index+1}`;
    if(project.modifier==='release')return day.star?'🚀 Lancement':'Nouveau chapitre';
    if(project.modifier==='subathon')return day.star?'🎯 Palier bonus':`Objectif ${index+1}`;
    if(project.modifier==='indie')return day.star?'💎 Coup de cœur':`Prototype ${String(index+1).padStart(2,'0')}`;
    if(project.modifier==='challenge')return day.star?'☠ Défi boss':'Défi du jour';
    return '';
  }
  function getQrUrl(){
    const value=String(project.qrUrl||project.subtitle||'').trim();if(!value)return 'https://twitch.tv/ton_lien';if(/^https?:\/\//i.test(value))return value;if(/^twitch\.tv\//i.test(value))return `https://${value}`;if(/^[a-z0-9_]{3,25}$/i.test(value))return `https://twitch.tv/${value}`;return value.includes('.')?`https://${value}`:'https://twitch.tv/ton_lien';
  }
  function makeQr(){
    if(typeof window.qrcode!=='function')return null;
    try{const qr=window.qrcode(0,'M');qr.addData(getQrUrl());qr.make();return qr;}catch{return null;}
  }
  function renderQrControls(){
    els.qrUrlField.hidden=!project.showQr;if(!project.showQr){els.qrStatus.textContent='';return;}
    const valid=!!makeQr();els.qrStatus.textContent=valid?'QR Code prêt':'Lien trop long ou invalide';els.qrStatus.className=`fieldStatus ${valid?'isValid':'isInvalid'}`;
  }
  function qrSvg(element){try{return (makeQr()?.createSvgTag(5,2)||'<span>QR indisponible</span>').replace('#fff',color(element?.fill,'#ffffff')).replace('#111827',color(element?.color,'#111827'));}catch{return '<span>QR indisponible</span>';}}
  function renderElement(element){
    if(isHiddenWithDay(element))return '';
    const selected=element.id===selectedId?' isSelected':'';const locked=element.locked?' isLocked':'';
    let content='';
    if(element.type==='text')content=`<div class="elText textEffect-${element.effect||'none'}" style='width:100%;height:100%;font-size:${element.fontSize||32}px;line-height:1.08;color:${color(element.color)};${typographyStyle(element)}'>${escapeHtml(element.dayField?dayTextValue(element):element.text)}</div>`;
    if(element.type==='emoji')content=`<div class="elEmoji" style="width:100%;height:100%;font-size:${element.fontSize||80}px">${escapeHtml(element.text)}</div>`;
    if(element.type==='shape')content=`<div class="elShape" style="background:${color(element.fill)};border-radius:${element.shape==='circle'?'50%':`${element.radius||0}px`};border:${element.borderWidth||0}px solid ${color(element.borderColor,'#000000')}"></div>`;
    if(element.type==='image')content=element.src?`<div class="elImage"><img src="${escapeHtml(element.src)}" alt="" style="${imageCropStyle(element)}"></div>`:'<div class="elImageMissing">Image introuvable<br>Utilise « Remplacer »</div>';
    if(element.type==='qr')content=`<div class="elQr">${qrSvg(element)}</div>`;
    if(element.type==='day'){
      const day=project.days[element.dayIndex],off=day.status==='off';
      const label=specialLabel(day,element.dayIndex);
      const size=Number(element.fontSize)||22;
      const dayImage=day.imageSrc?`<div class="elDay__image"><img src="${escapeHtml(day.imageSrc)}" alt="" style="${imageCropStyle({...day,fit:day.imageFit})}"></div>`:'';
      const layout=element.contentLayout||'standard',visible=layout!=='image',timeSize=layout==='feature'?size*2:size*1.2,detached=new Set(linkedDayTexts(element.dayIndex).map(item=>item.dayField));
      content=`<div class="elDay variant-${element.variant} dayLayout-${layout}${day.star?' isStar':''}${day.imageSrc?' hasImage':''} textEffect-${element.effect||'none'}" style='background:${color(element.fill)};color:${color(element.color)};font-size:${size}px;--day-overlay:.55;${typographyStyle(element)}'>${dayImage}${visible&&element.showDayName!==false&&!detached.has('name')?`<div class="elDay__name" style="font-size:${size}px">${escapeHtml(day.name)}</div>`:''}${visible&&label?`<div class="specialLabel">${escapeHtml(label)}</div>`:''}${day.star?'<div class="starBadge">★ Jour star</div>':''}${visible&&element.showDayTime!==false&&!detached.has('time')?`<div class="elDay__time" style="font-size:${timeSize}px">${escapeHtml(off?'REPOS':day.time)}</div>`:''}${visible&&element.showDayTitle!==false&&!detached.has('title')?`<div class="elDay__title" style="font-size:${size*.84}px">${escapeHtml(day.title)}</div>`:''}${visible&&element.showDayNote!==false&&!detached.has('note')&&day.note?`<div class="elDay__note" style="font-size:${Math.max(10,size*.56)}px">${escapeHtml(day.note)}</div>`:''}</div>`;
    }
    return `<div class="canvasElement${selected}${locked}${element.role?` role-${element.role}`:''}" data-id="${element.id}" data-type="${element.type}" style="${elementStyle(element)}">${content}<span class="resizeHandle" data-resize="true"></span></div>`;
  }
  function renderCanvas(){
    els.artboard.style.width=`${project.width}px`;els.artboard.style.height=`${project.height}px`;
    els.artboard.className=`artboard modifier-${project.modifier||'none'}`;
    const bg=project.background,layers=[],sizes=[],positions=[],repeats=[];
    if(bg.transparent){layers.push('linear-gradient(45deg,#d8dde7 25%,transparent 25%,transparent 75%,#d8dde7 75%)','linear-gradient(45deg,#d8dde7 25%,#f5f7fb 25%,#f5f7fb 75%,#d8dde7 75%)');sizes.push('24px 24px','24px 24px');positions.push('0 0','12px 12px');repeats.push('repeat','repeat');}
    else{layers.push(gradientCss());sizes.push('100% 100%');positions.push('center');repeats.push('no-repeat');}
    els.artboard.style.backgroundImage=layers.join(',');els.artboard.style.backgroundSize=sizes.join(',');els.artboard.style.backgroundPosition=positions.join(',');els.artboard.style.backgroundRepeat=repeats.join(',');
    els.artboard.classList.toggle('showGrid',gridEnabled);
    const banner=String(project.eventBanner||'').trim();
    const backgroundImage=!bg.transparent&&bg.imageSrc?`<div class="artboardBackground"><img src="${escapeHtml(bg.imageSrc)}" alt="" style="${imageCropStyle({...bg,fit:bg.imageFit})}"></div>`:'';
    els.artboard.innerHTML=`${backgroundImage}${gridEnabled?'<div class="artboardGrid"></div>':''}${banner?`<div class="eventBannerCanvas">${escapeHtml(banner)}</div>`:''}${project.elements.map(renderElement).join('')}`;
    els.canvasLabel.textContent=`Planning ${project.format==='square'?'carré':'16:9'}`;
    document.querySelectorAll('[data-format]').forEach(button=>button.classList.toggle('isActive',button.dataset.format===project.format));
    renderPreflightStatus();
  }
  function renderPreflightStatus(){
    const warnings=[];
    if(project.elements.some(element=>element.opacity>0&&!isHiddenWithDay(element)&&(element.x<0||element.y<0||element.x+element.w>project.width||element.y+element.h>project.height)))warnings.push('élément hors du planning');
    if(project.elements.some(element=>element.type==='image'&&!element.src)||project.days.some(day=>day.visible!==false&&day.imageAssetId&&!day.imageSrc)||(project.background.imageAssetId&&!project.background.imageSrc))warnings.push('image introuvable');
    if(project.showQr&&!makeQr())warnings.push('QR invalide');
    const overflow=[...els.artboard.querySelectorAll('.elText,.elDay')].some(node=>node.scrollHeight>node.clientHeight+2||node.scrollWidth>node.clientWidth+2);if(overflow)warnings.push('texte potentiellement coupé');
    els.preflightStatus.textContent=warnings.length?`${warnings.length} point${warnings.length>1?'s':''} à vérifier`:'Prêt à exporter';els.preflightStatus.title=warnings.join(' · ');els.preflightStatus.classList.toggle('hasWarnings',!!warnings.length);
  }
  function updateZoom(){
    zoom=clamp(zoom,20,120);els.zoom.value=String(zoom);els.zoomValue.textContent=`${zoom}%`;
    const scale=zoom/100;els.artboard.style.transform=`scale(${scale})`;els.sizer.style.width=`${project.width*scale}px`;els.sizer.style.height=`${project.height*scale}px`;
  }
  function selectedElement(){return project.elements.find(element=>element.id===selectedId);}
  function renderInspector(){
    const element=selectedElement();els.emptyInspector.hidden=!!element;els.propertyPanel.hidden=!element;
    if(!element)return;
    const minimum=minimumElementSize(element);els.inspector.classList.add('isOpen');els.propX.value=Math.round(element.x);els.propY.value=Math.round(element.y);els.propW.min=String(minimum);els.propH.min=String(minimum);els.propW.value=Math.round(element.w);els.propH.value=Math.round(element.h);els.propRotation.value=element.rotation||0;els.propOpacity.value=Math.round((element.opacity??1)*100);
    els.textProperties.hidden=!['text','emoji','day'].includes(element.type);els.textContentField.hidden=element.type==='day';
    els.imageProperties.hidden=element.type!=='image';els.propImageFit.value=element.fit||'cover';
    els.dayCardProperties.hidden=element.type!=='day';if(element.type==='day'){els.propDayLayout.value=element.contentLayout||'standard';els.propShowDayName.checked=element.showDayName!==false;els.propShowDayTime.checked=element.showDayTime!==false;els.propShowDayTitle.checked=element.showDayTitle!==false;els.propShowDayNote.checked=element.showDayNote!==false;}
    els.propColorField.hidden=!['text','day','qr'].includes(element.type);els.propFillField.hidden=!['shape','day','qr'].includes(element.type);
    els.propText.value=element.dayField?dayTextValue(element,true):element.text||'';els.propFontSize.value=Math.round(element.fontSize||32);els.propFont.value=element.font||'sans';els.propWeight.value=String([400,700,900].includes(Number(element.weight))?element.weight:900);els.propFontStyle.value=element.fontStyle||'normal';els.propTransform.value=element.transform||'none';els.propAlign.value=element.align||'left';els.propTextEffect.value=element.effect||'none';els.propColor.value=color(element.color);els.propFill.value=color(element.fill);
  }
  function layerName(element){
    if(element.type==='day')return project.days[element.dayIndex].name;
    if(element.type==='text'&&element.dayField)return `${project.days[element.dayIndex]?.name||'Jour'} · ${DAY_TEXT_FIELDS[element.dayField]?.label||'Texte'}`;
    if(element.type==='text')return element.text.slice(0,28)||'Texte';
    if(element.type==='emoji')return `Emoji ${element.text}`;
    return element.name||({shape:'Forme',image:'Image',qr:'QR Code'}[element.type]||'Élément');
  }
  function renderLayers(){
    const ordered=project.elements.filter(element=>!isHiddenWithDay(element)).reverse();
    els.layerSelect.innerHTML=`<option value="">Choisir un calque…</option>${ordered.map(element=>`<option value="${element.id}">${escapeHtml(layerName(element))}${element.locked?' · verrouillé':''}</option>`).join('')}`;els.layerSelect.value=selectedId;
    els.layerList.innerHTML=ordered.map(element=>`<div class="layerItem${element.id===selectedId?' isActive':''}" data-layer="${element.id}" tabindex="0" role="button" draggable="${!element.locked}"><b>${element.type==='text'?'T':element.type==='day'?'▦':element.type==='shape'?'◆':element.type==='emoji'?'☺':'▧'}</b><span>${escapeHtml(layerName(element))}</span><button data-lock="${element.id}" title="${element.locked?'Déverrouiller':'Verrouiller'}" aria-label="${element.locked?'Déverrouiller':'Verrouiller'} ${escapeHtml(layerName(element))}">${element.locked?'🔒':'○'}</button></div>`).join('');
  }
  function selectElement(id){selectedId=id||'';const element=selectedElement();if(element?.type==='day'||element?.dayField){selectedDay=element.dayIndex;renderDays();}renderCanvas();renderInspector();renderLayers();if(selectedId)els.artboard.focus({preventScroll:true});}
  function updateSelectedFromProperties(){
    const element=selectedElement();if(!element)return;
    const minimum=minimumElementSize(element);element.x=snap(els.propX.value);element.y=snap(els.propY.value);element.w=Math.max(minimum,snap(els.propW.value));element.h=Math.max(minimum,snap(els.propH.value));element.rotation=Number(els.propRotation.value)||0;element.opacity=clamp(els.propOpacity.value,0,100)/100;
    if(['text','emoji','day'].includes(element.type)){if(element.type!=='day'){if(element.dayField){const field=DAY_TEXT_FIELDS[element.dayField],day=project.days[element.dayIndex];if(field&&day)day[field.property]=els.propText.value;}else element.text=els.propText.value;}element.fontSize=clamp(els.propFontSize.value,8,240);element.font=els.propFont.value;element.weight=Number(els.propWeight.value)||800;element.fontStyle=els.propFontStyle.value;element.transform=els.propTransform.value;element.align=els.propAlign.value;element.effect=els.propTextEffect.value;element.color=els.propColor.value;}
    if(element.type==='qr')element.color=els.propColor.value;
    if(element.type==='image')element.fit=els.propImageFit.value;
    if(element.type==='day'){element.contentLayout=els.propDayLayout.value;element.showDayName=els.propShowDayName.checked;element.showDayTime=els.propShowDayTime.checked;element.showDayTitle=els.propShowDayTitle.checked;element.showDayNote=els.propShowDayNote.checked;}
    if(['shape','day','qr'].includes(element.type))element.fill=els.propFill.value;
    if(element.dayField)renderDays();
    renderCanvas();renderInspector();renderLayers();commit();
  }
  function addElement(kind,value){
    let element;
    if(kind==='text')element=textElement('Ton texte',project.width/2-180,project.height/2-45,360,90,52,'#ffffff','rounded',900,'center');
    if(kind==='rect')element=shapeElement('rect',project.width/2-120,project.height/2-70,240,140,'#8b5cf6',24);
    if(kind==='circle')element=shapeElement('circle',project.width/2-80,project.height/2-80,160,160,'#ec4899',80);
    if(kind==='emoji')element=emojiElement(value,project.width/2-55,project.height/2-55,110);
    if(!element)return;project.elements.push(element);selectElement(element.id);pushHistory();save();
  }
  function changeFormat(format){
    if(format===project.format)return;const oldW=project.width,oldH=project.height;
    const custom=project.elements.filter(element=>!element.builtIn).map(element=>clone(element));
    project.format=format;project.width=format==='square'?1080:1600;project.height=format==='square'?1080:900;
    const sx=project.width/oldW,sy=project.height/oldH;
    custom.forEach(element=>{element.x*=sx;element.y*=sy;element.w*=sx;element.h*=sy;});
    buildTemplate(project.template);project.elements.push(...custom);
    renderAll();pushHistory();save();
  }
  function resetTemplateLayout(){
    const custom=project.elements.filter(element=>!element.builtIn).map(clone),template=project.template;
    buildTemplate(template);project.elements.push(...custom);selectedId='';renderAll();pushHistory();save();toast('Mise en page du modèle réinitialisée.');
  }
  function resetPlanning(){
    if(!window.confirm('Réinitialiser entièrement le planning ? Le contenu, les images, les calques et la mise en page actuels seront remplacés.'))return;
    project=defaultProject();buildTemplate('cloud');selectedId='';selectedDay=0;renderAll();pushHistory();save();toast('Planning réinitialisé : tu peux repartir de zéro.');
  }

  function bindPointer(){
    els.artboard.addEventListener('pointerdown',event=>{
      const node=event.target.closest('.canvasElement');if(!node){selectElement('');return;}
      const element=project.elements.find(item=>item.id===node.dataset.id);if(!element)return;selectElement(element.id);if(element.locked)return;
      event.preventDefault();
      interaction={mode:event.target.dataset.resize?'resize':'drag',id:element.id,startX:event.clientX,startY:event.clientY,x:element.x,y:element.y,w:element.w,h:element.h,node:[...els.artboard.querySelectorAll('.canvasElement')].find(item=>item.dataset.id===element.id)};
    });
    window.addEventListener('pointermove',event=>{
      if(!interaction)return;const element=project.elements.find(item=>item.id===interaction.id);if(!element)return;const scale=zoom/100,dx=(event.clientX-interaction.startX)/scale,dy=(event.clientY-interaction.startY)/scale;
      if(interaction.mode==='drag'){element.x=snap(interaction.x+dx);element.y=snap(interaction.y+dy);}else{const minimum=minimumElementSize(element);element.w=Math.max(minimum,snap(interaction.w+dx));element.h=Math.max(minimum,snap(interaction.h+dy));}
      if(interaction.node)interaction.node.setAttribute('style',elementStyle(element));renderInspector();
    });
    window.addEventListener('pointerup',()=>{if(!interaction)return;interaction=null;renderPreflightStatus();pushHistory();save();});
  }

  function applyTypePreset(name,target=selectedElement(),silent=false){
    const preset=TYPE_PRESETS[name];
    if(!preset||!target||!['text','day'].includes(target.type)){if(!silent)toast('Sélectionne d’abord un texte ou une carte.');return false;}
    Object.assign(target,preset);
    if(!silent){renderCanvas();renderInspector();renderLayers();pushHistory();save();toast('Style d’écriture appliqué.');}
    return true;
  }
  function applyTypePresetToPlanning(name){
    const preset=TYPE_PRESETS[name];if(!preset)return;
    project.typePreset=name;project.elements.filter(element=>['text','day'].includes(element.type)).forEach(element=>Object.assign(element,preset));
    renderAll();pushHistory();save();toast('Style appliqué à tout le planning.');
  }
  function baseTypography(element){return element.type==='day'?{font:'rounded',weight:900,fontStyle:'normal',transform:'none',letterSpacing:0,effect:'none'}:element.role==='title'?{font:'rounded',weight:900,fontStyle:'normal',transform:'none',letterSpacing:0,effect:'none'}:{font:'sans',weight:800,fontStyle:'normal',transform:'none',letterSpacing:0,effect:'none'};}
  function resetGlobalTypography(){
    project.typePreset='';project.elements.filter(element=>['text','day'].includes(element.type)).forEach(element=>Object.assign(element,baseTypography(element)));
    if(project.modifier!=='none')applyModifierTypography();renderAll();pushHistory();save();toast('Typographie du modèle restaurée.');
  }
  function applyModifierTypography(){
    const presetByModifier={poster:'condensed',ticket:'typewriter',restaurant:'elegant',rpg:'elegant',logbook:'typewriter',anime:'comic',marathon:'condensed',release:'modern',subathon:'comic',indie:'hand',challenge:'condensed'};
    project.elements.filter(element=>element.builtIn&&['text','day'].includes(element.type)).forEach(element=>{
      if(project.modifier==='none'){
        Object.assign(element,baseTypography(element));
      }else{applyTypePreset(presetByModifier[project.modifier],element,true);if(project.modifier==='anime')Object.assign(element,{effect:'none',fontStyle:'italic'});if(project.modifier==='subathon')Object.assign(element,{effect:'none',fontStyle:'normal'});}
    });
  }

  function updateDay(){
    const day=project.days[selectedDay];day.name=els.dayName.value;day.time=els.dayTime.value;day.title=els.dayTitle.value;day.note=els.dayNote.value;day.status=els.dayStatus.value;
    if(els.dayStar.checked)project.days.forEach((item,index)=>{item.star=index===selectedDay;});else day.star=false;
    renderCanvas();renderInspector();renderLayers();commit();
  }
  function dayTextPlacement(card,field){
    const fallback={name:{x:card.x+18,y:card.y+18,w:card.w-36,h:34,size:card.fontSize||22},time:{x:card.x+18,y:card.y+card.h-118,w:card.w-36,h:42,size:(card.fontSize||22)*1.2},title:{x:card.x+18,y:card.y+card.h-72,w:card.w-36,h:34,size:(card.fontSize||22)*.84},note:{x:card.x+18,y:card.y+card.h-38,w:card.w-36,h:28,size:Math.max(10,(card.fontSize||22)*.56)}}[field];
    const cardNode=[...els.artboard.querySelectorAll('.canvasElement')].find(node=>node.dataset.id===card.id),node=cardNode?.querySelector(DAY_TEXT_FIELDS[field].selector);if(!node)return fallback;
    const boardRect=els.artboard.getBoundingClientRect(),rect=node.getBoundingClientRect(),scale=boardRect.width/project.width||zoom/100,computed=getComputedStyle(node);
    return {x:(rect.left-boardRect.left)/scale,y:(rect.top-boardRect.top)/scale,w:Math.max(60,rect.width/scale+8),h:Math.max(24,rect.height/scale+8),size:parseFloat(computed.fontSize)||fallback.size,align:computed.textAlign||card.align,font:computedFontKey(computed.fontFamily,card.font),weight:Number(computed.fontWeight)||card.weight,fontStyle:computed.fontStyle||card.fontStyle,transform:computed.textTransform||card.transform,letterSpacing:parseFloat(computed.letterSpacing)||0,color:computedColor(computed.color,project.days[card.dayIndex]?.imageSrc?'#ffffff':card.color)};
  }
  function separateDayTextLayers(dayIndex){
    if(linkedDayTexts(dayIndex).length)return [];
    const card=project.elements.find(element=>element.type==='day'&&element.dayIndex===dayIndex);if(!card)return [];
    const visibility={name:'showDayName',time:'showDayTime',title:'showDayTitle',note:'showDayNote'},created=[];
    Object.keys(DAY_TEXT_FIELDS).forEach(field=>{if(card[visibility[field]]===false)return;const placement=dayTextPlacement(card,field),element=textElement(dayTextValue({dayIndex,dayField:field},true),placement.x,placement.y,placement.w,placement.h,placement.size,placement.color,placement.font,placement.weight,placement.align||card.align);Object.assign(element,{dayIndex,dayField:field,fontStyle:placement.fontStyle,transform:placement.transform,letterSpacing:placement.letterSpacing,effect:card.effect,builtIn:false});created.push(element);});
    project.elements.push(...created);return created;
  }
  function toggleDayTextLayers(){
    const existing=linkedDayTexts(selectedDay);
    if(existing.length){project.elements=project.elements.filter(element=>!(element.type==='text'&&element.dayField&&element.dayIndex===selectedDay));const card=project.elements.find(element=>element.type==='day'&&element.dayIndex===selectedDay);selectedId=card?.id||'';renderAll();pushHistory();save();toast('Textes regroupés dans la carte.');return;}
    const created=separateDayTextLayers(selectedDay);if(!created.length)return toast('Affiche d’abord une carte contenant du texte.');selectedId=created[0].id;renderAll();pushHistory();save();toast('Textes séparés : déplace chaque calque librement.');
  }
  function toggleAllDayTextLayers(){
    const indices=project.elements.filter(element=>element.type==='day'&&project.days[element.dayIndex]?.visible!==false).map(element=>element.dayIndex),allSeparated=indices.length>0&&indices.every(index=>linkedDayTexts(index).length>0);
    if(!indices.length)return toast('Affiche au moins une carte de jour.');
    if(allSeparated){const indexSet=new Set(indices);project.elements=project.elements.filter(element=>!(element.type==='text'&&element.dayField&&indexSet.has(element.dayIndex)));selectedId=project.elements.find(element=>element.type==='day'&&element.dayIndex===selectedDay)?.id||'';renderAll();pushHistory();save();toast('Tous les textes sont regroupés dans leurs cartes.');return;}
    const created=indices.flatMap(separateDayTextLayers);if(!created.length)return toast('Les textes visibles sont déjà séparés.');selectedId=created[0].id;renderAll();pushHistory();save();toast('Composition libre activée : tous les textes visibles sont indépendants.');
  }
  function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;});}
  async function waitForRenderedAssets(){
    if(document.fonts?.ready)await document.fonts.ready;await Promise.all([...els.artboard.querySelectorAll('img')].map(image=>image.complete?(image.decode?.().catch(()=>{})||Promise.resolve()):new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});})));
  }
  function inlineStyle(source,target,pseudo=''){
    const computed=getComputedStyle(source,pseudo);for(const property of computed)target.style.setProperty(property,computed.getPropertyValue(property),computed.getPropertyPriority(property));target.style.setProperty('animation','none');target.style.setProperty('transition','none');return computed;
  }
  function pseudoText(content){if(!content||content==='none'||content==='normal')return null;if(content==='""'||content==="''")return '';return content.replace(/^(["'])(.*)\1$/,'$2').replace(/\\(["'\\])/g,'$1');}
  function exportClone(){
    const copy=els.artboard.cloneNode(true),sources=[els.artboard,...els.artboard.querySelectorAll('*')],targets=[copy,...copy.querySelectorAll('*')],pairs=sources.map((source,index)=>[source,targets[index]]);copy.removeAttribute('tabindex');copy.setAttribute('xmlns','http://www.w3.org/1999/xhtml');copy.querySelectorAll('.resizeHandle').forEach(handle=>handle.remove());
    for(const [source,target] of pairs){inlineStyle(source,target);if(source instanceof HTMLImageElement)target.setAttribute('src',source.currentSrc||source.src);for(const pseudo of ['::before','::after']){const styles=getComputedStyle(source,pseudo),text=pseudoText(styles.content);if(text===null||styles.display==='none')continue;const materialized=document.createElement('span');materialized.setAttribute('aria-hidden','true');materialized.textContent=text;inlineStyle(source,materialized,pseudo);materialized.style.removeProperty('content');if(pseudo==='::before')target.prepend(materialized);else target.append(materialized);}}
    return copy;
  }
  async function renderArtboardToCanvas(){
    await waitForRenderedAssets();const previous={transform:els.artboard.style.transform,boxShadow:els.artboard.style.boxShadow,backgroundImage:els.artboard.style.backgroundImage,backgroundColor:els.artboard.style.backgroundColor};els.artboard.style.transform='none';els.artboard.style.boxShadow='none';if(project.background.transparent){els.artboard.style.backgroundImage='none';els.artboard.style.backgroundColor='transparent';}
    let copy;try{copy=exportClone();}finally{Object.assign(els.artboard.style,previous);}const markup=new XMLSerializer().serializeToString(copy),svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${project.width}" height="${project.height}" viewBox="0 0 ${project.width} ${project.height}"><foreignObject x="0" y="0" width="100%" height="100%">${markup}</foreignObject></svg>`,parseError=new DOMParser().parseFromString(svg,'image/svg+xml').querySelector('parsererror');if(parseError)throw new Error('Le rendu du planning contient un style invalide.');const image=await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`),canvas=document.createElement('canvas');canvas.width=project.width;canvas.height=project.height;canvas.getContext('2d').drawImage(image,0,0);return canvas;
  }
  async function exportPng(){
    if(project.showQr&&!makeQr())return toast('Corrige le lien du QR Code avant l’export.');
    if(project.elements.some(element=>element.type==='image'&&!element.src)||project.days.some(day=>day.visible!==false&&day.imageAssetId&&!day.imageSrc)||(project.background.imageAssetId&&!project.background.imageSrc))return toast('Remplace les images introuvables avant l’export.');
    const old=els.export.textContent,previousSelected=selectedId,previousGrid=gridEnabled;els.export.disabled=true;els.export.textContent='Création…';selectedId='';gridEnabled=false;renderCanvas();
    try{
      const canvas=await renderArtboardToCanvas();
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG indisponible');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${project.name.trim().replace(/[^a-z0-9_-]+/gi,'_').toLowerCase()||'planning'}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1200);toast('PNG exporté.');
    }catch(error){console.error('Export PNG impossible',error);toast(`Export PNG impossible${error?.name?` (${error.name})`:''}.`);}finally{selectedId=previousSelected;gridEnabled=previousGrid;renderCanvas();els.export.disabled=false;els.export.textContent=old;}
  }

  async function storeImageFile(file){
    if(!file||!file.type.startsWith('image/'))return;if(file.size>20*1024*1024)return toast('L’image dépasse 20 Mo.');
    const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);});
    const assetId=uid('asset');try{if(!window.PlanningAssetStore)throw new Error('Stockage indisponible');await window.PlanningAssetStore.put(assetId,src);}catch{return toast('Impossible de stocker cette image sur cet appareil.');}
    return {src,assetId,name:file.name};
  }
  async function importImage(file,target=null){
    const stored=await storeImageFile(file);if(!stored)return;const {src,assetId,name}=stored;
    if(target?.type==='image'){
      Object.assign(target,{src,assetId,name,...normalizeImageCrop()});selectElement(target.id);toast('Image remplacée.');
    }else{
      const element={...elementBase('image',project.width/2-180,project.height/2-130,360,260),src,assetId,name,fit:'cover',...normalizeImageCrop(),color:'#ffffff',fill:'#ffffff'};project.elements.push(element);selectElement(element.id);
    }
    pushHistory();save();
  }
  async function importDayImage(file){const stored=await storeImageFile(file);if(!stored)return;Object.assign(project.days[selectedDay],{imageSrc:stored.src,imageAssetId:stored.assetId,imageName:stored.name,imageFit:'contain',...normalizeImageCrop()});renderAll();pushHistory();save();toast('Image entière ajoutée au jour.');}
  async function importBackgroundImage(file){const stored=await storeImageFile(file);if(!stored)return;Object.assign(project.background,{imageSrc:stored.src,imageAssetId:stored.assetId,imageName:stored.name,imageFit:'cover',transparent:false,...normalizeImageCrop()});renderAll();pushHistory();save();toast('Image de fond ajoutée.');}

  function renderCropEditor(){
    if(!cropDraft)return;
    els.cropPreview.src=cropDraft.src;els.cropPreview.style.cssText=imageCropStyle(cropDraft);
    els.cropFit.value=cropDraft.fit;els.cropFitHint.textContent=cropDraft.fit==='contain'?'Toute l’image est visible. Les zones quadrillées viennent seulement de la différence de proportions avec le cadre.':cropDraft.fit==='fill'?'L’image occupe tout le cadre sans découpe ni zone vide, mais ses proportions peuvent être modifiées.':'Le cadre entier est rempli. Une partie des bords de l’image peut être coupée.';
    els.cropZoom.value=String(cropDraft.cropZoom);els.cropStretchX.value=String(cropDraft.stretchX);els.cropStretchY.value=String(cropDraft.stretchY);
    els.cropZoomValue.textContent=`${Math.round(cropDraft.cropZoom*100)} %`;els.cropStretchXValue.textContent=`${Math.round(cropDraft.stretchX*100)} %`;els.cropStretchYValue.textContent=`${Math.round(cropDraft.stretchY*100)} %`;
    els.cropPosition.textContent=`Position : ${Math.round(cropDraft.cropX)} / ${Math.round(cropDraft.cropY)}`;
  }
  function openCropEditor(target=null){
    const isBackground=target==='background',isDay=Number.isInteger(target),element=isBackground?project.background:isDay?project.days[target]:selectedElement();if((isBackground||isDay)&&!element?.imageSrc)return toast(`Ajoute d’abord une image ${isBackground?'de fond':'à ce jour'}.`);if(!isBackground&&!isDay&&element?.type!=='image')return toast('Sélectionne une image à recadrer.');
    const card=isDay?project.elements.find(item=>item.type==='day'&&item.dayIndex===target):element,kind=isBackground?'background':isDay?'day':'element';cropDraft={kind,id:isDay?target:element.id,src:isBackground?element.imageSrc:isDay?element.imageSrc:element.src,fit:isBackground?element.imageFit||'cover':isDay?element.imageFit||'cover':element.fit||'cover',...normalizeImageCrop(element)};cropDrag=null;
    els.cropTitle.textContent=isBackground?'Ajuster l’image de fond':'Recadrer l’image';els.cropStage.style.aspectRatio=isBackground?`${project.width} / ${project.height}`:isDay?`${Math.max(1,card?.w||300)} / ${Math.max(1,card?.h||400)}`:`${Math.max(1,element.w)} / ${Math.max(1,element.h)}`;els.app.inert=true;els.cropModal.classList.add('isVisible');els.cropModal.setAttribute('aria-hidden','false');renderCropEditor();els.cropApply.focus();
  }
  function closeCropEditor(){const kind=cropDraft?.kind;cropDraft=null;cropDrag=null;els.app.inert=false;els.cropModal.classList.remove('isVisible');els.cropModal.setAttribute('aria-hidden','true');(kind==='background'?els.cropBackgroundImage:kind==='day'?els.cropDayImage:els.cropImage).focus();}
  function resetCropEditor(){if(!cropDraft)return;Object.assign(cropDraft,normalizeImageCrop());renderCropEditor();}
  function applyCropEditor(){
    if(!cropDraft)return;const element=cropDraft.kind==='background'?project.background:cropDraft.kind==='day'?project.days[cropDraft.id]:project.elements.find(item=>item.id===cropDraft.id);if(!element)return closeCropEditor();
    Object.assign(element,normalizeImageCrop(cropDraft));if(cropDraft.kind==='background'||cropDraft.kind==='day')element.imageFit=cropDraft.fit;else element.fit=cropDraft.fit;closeCropEditor();renderAll();pushHistory();save();toast('Cadrage et adaptation appliqués.');
  }
  function updateCropRange(){if(!cropDraft)return;cropDraft.cropZoom=Number(els.cropZoom.value);cropDraft.stretchX=Number(els.cropStretchX.value);cropDraft.stretchY=Number(els.cropStretchY.value);renderCropEditor();}

  function bind(){
    document.querySelectorAll('.tabBtn').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.tabBtn').forEach(item=>item.classList.toggle('isActive',item===button));document.querySelectorAll('.sidePanel').forEach(panel=>panel.classList.toggle('isActive',panel.dataset.panelContent===button.dataset.panel));}));
    document.querySelectorAll('.templateCard').forEach(button=>button.addEventListener('click',()=>{const custom=project.elements.filter(element=>!element.builtIn).map(clone);buildTemplate(button.dataset.template);project.elements.push(...custom);selectedId='';renderAll();pushHistory();save();toast('Modèle appliqué sans supprimer tes calques.');}));
    els.emojiGrid.innerHTML=EMOJIS.map(emoji=>`<button class="assetBtn" data-emoji="${emoji}" type="button">${emoji}</button>`).join('');
    document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>addElement(button.dataset.add)));
    els.emojiGrid.addEventListener('click',event=>{const button=event.target.closest('[data-emoji]');if(button)addElement('emoji',button.dataset.emoji);});
    els.imageInput.addEventListener('change',()=>{importImage(els.imageInput.files?.[0]).catch(()=>toast('Image illisible.'));els.imageInput.value='';});
    els.dayImageInput.addEventListener('change',()=>{importDayImage(els.dayImageInput.files?.[0]).catch(()=>toast('Image illisible.'));els.dayImageInput.value='';});
    els.dayTextLayers.addEventListener('click',toggleDayTextLayers);
    els.allDayTextLayers.addEventListener('click',toggleAllDayTextLayers);
    els.dayCardColor.addEventListener('input',()=>{const card=project.elements.find(element=>element.type==='day'&&element.dayIndex===selectedDay);if(!card)return;card.fill=els.dayCardColor.value;renderCanvas();renderInspector();commit();});
    els.dayImageFit.addEventListener('change',()=>{project.days[selectedDay].imageFit=els.dayImageFit.value;renderCanvas();commit();});
    els.cropDayImage.addEventListener('click',()=>openCropEditor(selectedDay));els.removeDayImage.addEventListener('click',()=>{const day=project.days[selectedDay];Object.assign(day,{imageSrc:'',imageAssetId:'',imageName:'',imageFit:'cover',...normalizeImageCrop()});renderAll();pushHistory();save();toast('Image du jour retirée.');});
    els.backgroundImageInput.addEventListener('change',()=>{importBackgroundImage(els.backgroundImageInput.files?.[0]).catch(()=>toast('Image illisible.'));els.backgroundImageInput.value='';});
    els.backgroundImageFit.addEventListener('change',()=>{project.background.imageFit=els.backgroundImageFit.value;renderCanvas();commit();});
    els.cropBackgroundImage.addEventListener('click',()=>openCropEditor('background'));
    els.transparentBackground.addEventListener('change',()=>{project.background.transparent=els.transparentBackground.checked;renderBackgroundControls();renderCanvas();commit();toast(project.background.transparent?'Fond transparent activé.':'Fond du planning réactivé.');});
    els.removeBackgroundImage.addEventListener('click',()=>{Object.assign(project.background,{imageSrc:'',imageAssetId:'',imageName:'',imageFit:'cover',...normalizeImageCrop()});renderAll();pushHistory();save();toast('Image de fond retirée.');});
    els.replaceImage.addEventListener('change',()=>{const target=selectedElement();importImage(els.replaceImage.files?.[0],target).catch(()=>toast('Image illisible.'));els.replaceImage.value='';});
    els.cropImage.addEventListener('click',openCropEditor);els.cropClose.addEventListener('click',closeCropEditor);els.cropCancel.addEventListener('click',closeCropEditor);els.cropApply.addEventListener('click',applyCropEditor);els.cropReset.addEventListener('click',resetCropEditor);
    els.cropFit.addEventListener('change',()=>{if(!cropDraft)return;cropDraft.fit=els.cropFit.value;renderCropEditor();});
    [els.cropZoom,els.cropStretchX,els.cropStretchY].forEach(input=>input.addEventListener('input',updateCropRange));
    els.cropStage.addEventListener('pointerdown',event=>{if(!cropDraft)return;event.preventDefault();cropDrag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:cropDraft.cropX,y:cropDraft.cropY,width:els.cropStage.clientWidth,height:els.cropStage.clientHeight};els.cropStage.setPointerCapture(event.pointerId);});
    els.cropStage.addEventListener('pointermove',event=>{if(!cropDrag||event.pointerId!==cropDrag.pointerId||!cropDraft)return;cropDraft.cropX=clamp(cropDrag.x+(event.clientX-cropDrag.startX)/cropDrag.width*100,-200,200);cropDraft.cropY=clamp(cropDrag.y+(event.clientY-cropDrag.startY)/cropDrag.height*100,-200,200);renderCropEditor();});
    els.cropStage.addEventListener('pointerup',event=>{if(cropDrag?.pointerId===event.pointerId)cropDrag=null;});
    els.cropStage.addEventListener('pointercancel',()=>{cropDrag=null;});
    els.cropStage.addEventListener('wheel',event=>{if(!cropDraft)return;event.preventDefault();cropDraft.cropZoom=clamp(cropDraft.cropZoom+(event.deltaY<0 ? .05 : -.05),.1,3);renderCropEditor();},{passive:false});
    els.showQr.addEventListener('change',()=>{project.showQr=els.showQr.checked;if(project.showQr){let qr=project.elements.find(element=>element.type==='qr');if(!qr){qr=qrElement(project.width,project.height);project.elements.push(qr);}selectedId=qr.id;}else{const removedSelected=selectedElement()?.type==='qr';project.elements=project.elements.filter(element=>element.type!=='qr');if(removedSelected)selectedId='';}renderAll();pushHistory();save();});
    els.qrUrl.addEventListener('input',()=>{project.qrUrl=els.qrUrl.value;renderQrControls();renderCanvas();commit();});
    els.dayStrip.addEventListener('click',event=>{const toggle=event.target.closest('[data-toggle-day]');if(toggle){setDayVisibility(Number(toggle.dataset.toggleDay),toggle.getAttribute('aria-pressed')!=='true');return;}const button=event.target.closest('[data-day]');if(button)selectDayForEditing(Number(button.dataset.day));});
    els.showAllDays.addEventListener('click',()=>{project.days.forEach(day=>{day.visible=true;});reflowSpotlightCards();renderAll();pushHistory();save();toast('Tous les jours sont affichés.');});
    els.hideOffDays.addEventListener('click',()=>{let offDays=project.days.filter(day=>day.status==='off'&&day.visible!==false);if(project.template==='spotlight')offDays=offDays.slice(0,Math.max(0,project.days.filter(day=>day.visible!==false).length-2));if(!offDays.length)return toast(project.template==='spotlight'?'Duo et + doit conserver au moins deux jours.':'Aucun jour de repos à masquer.');offDays.forEach(day=>{day.visible=false;});if(selectedElement()?.type==='day'&&project.days[selectedElement().dayIndex].visible===false)selectedId='';reflowSpotlightCards();renderAll();pushHistory();save();toast(`${offDays.length} jour${offDays.length>1?'s':''} de repos masqué${offDays.length>1?'s':''}.`);});
    [els.dayName,els.dayTime,els.dayTitle,els.dayNote].forEach(input=>input.addEventListener('input',updateDay));els.dayStatus.addEventListener('change',updateDay);els.dayStar.addEventListener('change',()=>{updateDay();renderDays();});
    els.title.addEventListener('input',()=>{project.title=els.title.value;const title=project.elements.find(element=>element.role==='title')||project.elements.find(element=>element.type==='text'&&element.y<140&&element.fontSize>50);if(title)title.text=project.title;renderCanvas();commit();});
    els.subtitle.addEventListener('input',()=>{project.subtitle=els.subtitle.value;const subtitle=project.elements.find(element=>element.role==='subtitle')||project.elements.find(element=>element.type==='text'&&element.y>=120&&element.y<220);if(subtitle)subtitle.text=project.subtitle;renderCanvas();commit();});
    els.projectName.addEventListener('input',()=>{project.name=els.projectName.value;save();});
    [els.propX,els.propY,els.propW,els.propH,els.propRotation,els.propText,els.propFontSize,els.propFont,els.propWeight,els.propFontStyle,els.propTransform,els.propAlign,els.propTextEffect,els.propColor,els.propFill,els.propOpacity,els.propImageFit,els.propDayLayout,els.propShowDayName,els.propShowDayTime,els.propShowDayTitle,els.propShowDayNote].forEach(input=>{input.addEventListener(input.tagName==='SELECT'||input.type==='checkbox'?'change':'input',updateSelectedFromProperties);});
    els.typePresetSelect.addEventListener('change',()=>{if(els.typePresetSelect.value)applyTypePresetToPlanning(els.typePresetSelect.value);else resetGlobalTypography();});
    els.modifierSelect.addEventListener('change',()=>{project.modifier=els.modifierSelect.value;project.typePreset='';applyModifierTypography();renderAll();pushHistory();save();toast('Modificateur appliqué.');});
    els.eventBanner.addEventListener('input',()=>{project.eventBanner=els.eventBanner.value;renderCanvas();commit();});
    els.hideModifierLabels.addEventListener('change',()=>{project.hideModifierLabels=els.hideModifierLabels.checked;renderCanvas();commit();});
    els.resetLayout.addEventListener('click',resetTemplateLayout);
    els.applyDayStyleAll.addEventListener('click',()=>{const source=selectedElement();if(source?.type!=='day')return;const keys=['contentLayout','showDayName','showDayTime','showDayTitle','showDayNote'];project.elements.filter(element=>element.type==='day').forEach(element=>keys.forEach(key=>{element[key]=source[key];}));renderAll();pushHistory();save();toast('Composition appliquée à toutes les cartes.');});
    els.duplicate.addEventListener('click',()=>{const source=selectedElement();if(!source)return;const copy=clone(source);copy.id=uid(source.type);copy.builtIn=false;copy.x+=24;copy.y+=24;project.elements.push(copy);selectElement(copy.id);pushHistory();save();});
    els.remove.addEventListener('click',()=>{const index=project.elements.findIndex(element=>element.id===selectedId);if(index<0)return;if(project.elements[index].type==='qr')project.showQr=false;project.elements.splice(index,1);selectElement('');renderAll();pushHistory();save();});
    els.layerList.addEventListener('click',event=>{const lock=event.target.closest('[data-lock]');if(lock){const element=project.elements.find(item=>item.id===lock.dataset.lock);if(element){element.locked=!element.locked;renderAll();commit();}return;}const layer=event.target.closest('[data-layer]');if(layer)selectElement(layer.dataset.layer);});
    els.layerList.addEventListener('keydown',event=>{if(!['Enter',' '].includes(event.key)||event.target.closest('button'))return;const layer=event.target.closest('[data-layer]');if(layer){event.preventDefault();selectElement(layer.dataset.layer);}});
    els.layerList.addEventListener('dragstart',event=>{const layer=event.target.closest('[data-layer]');if(!layer)return;draggedLayerId=layer.dataset.layer;layer.classList.add('isDragging');event.dataTransfer.effectAllowed='move';});
    els.layerList.addEventListener('dragover',event=>{const layer=event.target.closest('[data-layer]');if(!layer||layer.dataset.layer===draggedLayerId)return;event.preventDefault();els.layerList.querySelectorAll('.isDropTarget').forEach(item=>item.classList.remove('isDropTarget'));layer.classList.add('isDropTarget');});
    els.layerList.addEventListener('drop',event=>{const target=event.target.closest('[data-layer]');if(!target||!draggedLayerId||target.dataset.layer===draggedLayerId)return;event.preventDefault();const from=project.elements.findIndex(element=>element.id===draggedLayerId);if(from<0)return;const [element]=project.elements.splice(from,1);const targetIndex=project.elements.findIndex(item=>item.id===target.dataset.layer);project.elements.splice(targetIndex+1,0,element);draggedLayerId='';renderCanvas();renderLayers();pushHistory();save();});
    els.layerList.addEventListener('dragend',()=>{draggedLayerId='';els.layerList.querySelectorAll('.isDragging,.isDropTarget').forEach(item=>item.classList.remove('isDragging','isDropTarget'));});
    els.layerSelect.addEventListener('change',()=>selectElement(els.layerSelect.value));
    els.undo.addEventListener('click',()=>{flushHistory();restoreHistory(historyIndex-1);});els.redo.addEventListener('click',()=>restoreHistory(historyIndex+1));
    els.resetPlanning.addEventListener('click',resetPlanning);
    els.export.addEventListener('click',exportPng);
    document.querySelectorAll('[data-format]').forEach(button=>button.addEventListener('click',()=>changeFormat(button.dataset.format)));
    els.zoom.addEventListener('input',()=>{zoom=Number(els.zoom.value);updateZoom();});els.zoomOut.addEventListener('click',()=>{zoom-=10;updateZoom();});els.zoomIn.addEventListener('click',()=>{zoom+=10;updateZoom();});
    els.grid.addEventListener('click',()=>{gridEnabled=!gridEnabled;els.grid.classList.toggle('isActive',gridEnabled);renderCanvas();});els.closeInspector.addEventListener('click',()=>els.inspector.classList.remove('isOpen'));
    els.artboard.addEventListener('keydown',event=>{const element=selectedElement();if(!element||element.locked||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Delete'].includes(event.key))return;event.preventDefault();if(event.key==='Delete'){els.remove.click();return;}const step=event.shiftKey?10:1;if(event.key==='ArrowLeft')element.x-=step;if(event.key==='ArrowRight')element.x+=step;if(event.key==='ArrowUp')element.y-=step;if(event.key==='ArrowDown')element.y+=step;renderCanvas();renderInspector();commit();});
    document.addEventListener('keydown',event=>{if(!cropDraft)return;if(event.key==='Escape')closeCropEditor();if(event.key==='Tab'){const focusable=[...els.cropModal.querySelectorAll('button,input,select')].filter(item=>!item.disabled);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
    window.addEventListener('beforeunload',()=>{if(saveTimer)writeSave();});
    bindPointer();window.addEventListener('resize',fitZoom);
  }
  function fitZoom(){const available=Math.max(320,els.viewport.clientWidth-80);zoom=clamp(Math.floor(available/project.width*100),20,100);updateZoom();}
  function toast(message){const node=document.createElement('div');node.className='toast';node.textContent=message;els.toast.replaceChildren(node);setTimeout(()=>node.remove(),2400);}

  async function start(){await load();ensureSpotlightCards();await externalizeInlineImages();if(project.showQr&&!project.elements.some(element=>element.type==='qr'))project.elements.push(qrElement(project.width,project.height));bind();history=[JSON.stringify(persistable())];historyIndex=0;renderAll();requestAnimationFrame(fitZoom);save();if(window.PlanningAssetStore){const used=[...project.elements.filter(element=>element.type==='image'&&element.assetId).map(element=>element.assetId),...project.days.map(day=>day.imageAssetId).filter(Boolean),project.background.imageAssetId].filter(Boolean);window.PlanningAssetStore.keepOnly(used).catch(()=>{});}if(missingImageCount)toast(`${missingImageCount} image${missingImageCount>1?'s':''} à remplacer.`);}
  start().catch(error=>{console.error(error);toast('PlanningGPT V2 n’a pas pu démarrer.');});
})();
