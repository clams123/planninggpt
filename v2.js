(function(){
  'use strict';

  const VERSION = '2.0.0';
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
  const EMOJIS = ['✨','🎮','🌙','⭐','💜','🔥','👻','🌸','🧙','☕','💎','🚀','☁️','🎧','🕹️','🐉','🏆','🍄','🌈','🦇','🪄','🎲','🎤','🎻','🎼','🎵','💀','📼'];
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
    rpg:{bg:['#3a281b','#ad7c43'],angle:150,card:'rpg',text:'#fff3d5',accent:'#f4d598'},
    manga:{bg:['#fff8ff','#d8c9ff'],angle:125,card:'manga',text:'#17121f',accent:'#a855f7'},
    cozy:{bg:['#e9aa83','#7da890'],angle:135,card:'cozy',text:'#fff8eb',accent:'#5c4033'},
    arcade:{bg:['#140832','#c21870'],angle:135,card:'arcade',text:'#ffffff',accent:'#00f5ff'},
    agenda:{bg:['#f7f2e8','#c8d8e8'],angle:140,card:'agenda',text:'#18324a',accent:'#d25b47'},
    polaroid:{bg:['#f6a88d','#7d9fd3'],angle:130,card:'polaroid',text:'#fffdf8',accent:'#ffe16b'},
    roadmap:{bg:['#071b20','#1a6359'],angle:120,card:'roadmap',text:'#f0fffb',accent:'#54f2c2'},
    constellation:{bg:['#05071a','#34255e'],angle:145,card:'constellation',text:'#f8f7ff',accent:'#b9a7ff'},
    spotlight:{bg:['#111111','#3f3f46'],angle:120,card:'spotlight',text:'#ffffff',accent:'#ffffff'},
    columns:{bg:['#91a7d8','#38566a'],angle:135,card:'columns',text:'#ffffff',accent:'#9ecb91'},
    bubblegrid:{bg:['#73e6f2','#ffc8df'],angle:145,card:'bubblegrid',text:'#087f8c',accent:'#f05bce'},
    horror:{bg:['#050506','#4b0710'],angle:135,card:'horror',text:'#f8fafc',accent:'#ff334d'},
    violin:{bg:['#fffaf0','#dcc8a7'],angle:135,card:'violin',text:'#3e291c',accent:'#70482d'}
  };
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
    title:$('planningTitle'), subtitle:$('planningSubtitle'), showQr:$('showQr'), qrUrl:$('qrUrl'), qrUrlField:$('qrUrlField'), qrStatus:$('qrStatus'), dayStrip:$('dayStrip'), dayName:$('dayName'), dayTime:$('dayTime'), dayStatus:$('dayStatus'), dayTitle:$('dayTitle'), dayNote:$('dayNote'), dayStar:$('dayStar'), dayImageInput:$('dayImageInput'), dayImageStatus:$('dayImageStatus'), dayImageFit:$('dayImageFit'), cropDayImage:$('cropDayImageBtn'), removeDayImage:$('removeDayImageBtn'),
    artboard:$('artboard'), viewport:$('canvasViewport'), sizer:$('canvasSizer'), canvasLabel:$('canvasLabel'), preflightStatus:$('preflightStatus'), zoom:$('zoomInput'), zoomValue:$('zoomValue'), zoomOut:$('zoomOutBtn'), zoomIn:$('zoomInBtn'), grid:$('toggleGridBtn'),
    inspector:$('inspector'), closeInspector:$('closeInspectorBtn'), emptyInspector:$('emptyInspector'), propertyPanel:$('propertyPanel'), layerList:$('layerList'), layerSelect:$('layerSelect'),
    propX:$('propX'), propY:$('propY'), propW:$('propW'), propH:$('propH'), propRotation:$('propRotation'), propText:$('propText'), propFontSize:$('propFontSize'), propFont:$('propFont'), propWeight:$('propWeight'), propFontStyle:$('propFontStyle'), propTransform:$('propTransform'), propAlign:$('propAlign'), propLetterSpacing:$('propLetterSpacing'), propLetterSpacingValue:$('propLetterSpacingValue'), propTextEffect:$('propTextEffect'), propColor:$('propColor'), propFill:$('propFill'), propColorField:$('propColorField'), propFillField:$('propFillField'), propOpacity:$('propOpacity'), textProperties:$('textProperties'), textContentField:$('textContentField'), imageProperties:$('imageProperties'), propImageFit:$('propImageFit'), cropImage:$('cropImageBtn'), replaceImage:$('replaceImageInput'), dayCardProperties:$('dayCardProperties'), propDayLayout:$('propDayLayout'), propShowDayName:$('propShowDayName'), propShowDayTime:$('propShowDayTime'), propShowDayTitle:$('propShowDayTitle'), propShowDayNote:$('propShowDayNote'), propDayOverlay:$('propDayOverlay'), propDayOverlayValue:$('propDayOverlayValue'), applyDayStyleAll:$('applyDayStyleAllBtn'), duplicate:$('duplicateElementBtn'), remove:$('deleteElementBtn'),
    modifierSelect:$('modifierSelect'), typePresetSelect:$('typePresetSelect'), eventBanner:$('eventBanner'), hideModifierLabels:$('hideModifierLabels'), resetLayout:$('resetLayoutBtn'), transparentBackground:$('transparentBackground'), backgroundImageInput:$('backgroundImageInput'), backgroundImageStatus:$('backgroundImageStatus'), backgroundImageFit:$('backgroundImageFit'), removeBackgroundImage:$('removeBackgroundImageBtn'),
    emojiGrid:$('emojiGrid'), imageInput:$('imageInput'), toast:$('toastRegion'), cropModal:$('cropModal'), cropClose:$('cropCloseBtn'), cropStage:$('cropStage'), cropPreview:$('cropPreview'), cropZoom:$('cropZoom'), cropZoomValue:$('cropZoomValue'), cropStretchX:$('cropStretchX'), cropStretchXValue:$('cropStretchXValue'), cropStretchY:$('cropStretchY'), cropStretchYValue:$('cropStretchYValue'), cropPosition:$('cropPosition'), cropReset:$('cropResetBtn'), cropCancel:$('cropCancelBtn'), cropApply:$('cropApplyBtn')
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
  function elementBase(type,x,y,w,h){ return {id:uid(type),type,x,y,w,h,rotation:0,opacity:1,locked:false}; }
  function minimumElementSize(element){return element?.type==='shape'?1:20;}

  function defaultProject(){
    return {version:VERSION,name:'Mon planning Twitch',format:'wide',width:1600,height:900,template:'cloud',modifier:'none',typePreset:'',hideModifierLabels:false,eventBanner:'',showQr:false,qrUrl:'https://twitch.tv/ton_lien',title:'Planning de la semaine',subtitle:'twitch.tv/ton_lien',background:{colors:['#f7b7df','#8399f5'],angle:135,transparent:false,imageSrc:'',imageAssetId:'',imageName:'',imageFit:'cover',...normalizeImageCrop()},days:clone(DEFAULT_DAYS).map(day=>({...day,star:false,imageSrc:'',imageAssetId:'',imageName:'',imageFit:'cover',...normalizeImageCrop()})),elements:[]};
  }
  let project = defaultProject();

  function validateProject(raw){
    if(!raw||typeof raw!=='object'||!Array.isArray(raw.days)||raw.days.length!==7||!Array.isArray(raw.elements))throw new Error('Projet V2 invalide');
    if(!['wide','square'].includes(raw.format)||(raw.format==='wide'&&(Number(raw.width)!==1600||Number(raw.height)!==900))||(raw.format==='square'&&(Number(raw.width)!==1080||Number(raw.height)!==1080)))throw new Error('Format V2 invalide');
    if(raw.template==='candy')raw.template='horror';if(!TEMPLATE_STYLE[raw.template])raw.template='cloud';
    raw.modifier=MODIFIERS.includes(raw.modifier)?raw.modifier:'none';raw.typePreset=TYPE_PRESET_ALIASES[raw.typePreset]||raw.typePreset;raw.typePreset=TYPE_PRESETS[raw.typePreset]?raw.typePreset:'';raw.hideModifierLabels=!!raw.hideModifierLabels;raw.eventBanner=String(raw.eventBanner||'');raw.showQr=!!raw.showQr;raw.qrUrl=String(raw.qrUrl||raw.subtitle||'https://twitch.tv/ton_lien');
    raw.name=String(raw.name||'Mon planning Twitch');raw.title=String(raw.title||'Planning de la semaine');raw.subtitle=String(raw.subtitle||'');raw.version=VERSION;
    raw.background=raw.background&&Array.isArray(raw.background.colors)&&raw.background.colors.length===2?raw.background:clone(TEMPLATE_STYLE[raw.template].bg);
    if(Array.isArray(raw.background))raw.background={colors:raw.background,angle:135};
    raw.background.colors=[color(raw.background.colors[0],TEMPLATE_STYLE[raw.template].bg[0]),color(raw.background.colors[1],TEMPLATE_STYLE[raw.template].bg[1])];raw.background.angle=Number(raw.background.angle)||135;raw.background.transparent=!!raw.background.transparent;raw.background.imageSrc=String(raw.background.imageSrc||'');raw.background.imageAssetId=String(raw.background.imageAssetId||'');raw.background.imageName=String(raw.background.imageName||'');raw.background.imageFit=['cover','contain','fill'].includes(raw.background.imageFit)?raw.background.imageFit:'cover';Object.assign(raw.background,normalizeImageCrop(raw.background));
    raw.days=raw.days.map((day,index)=>({name:String(day?.name||DEFAULT_DAYS[index].name),time:String(day?.time||''),title:String(day?.title||''),note:String(day?.note||''),status:day?.status==='off'?'off':'live',star:!!day?.star,imageSrc:String(day?.imageSrc||''),imageAssetId:String(day?.imageAssetId||''),imageName:String(day?.imageName||''),imageFit:['cover','contain','fill'].includes(day?.imageFit)?day.imageFit:'cover',...normalizeImageCrop(day)}));
    raw.elements=raw.elements.filter(element=>element&&typeof element==='object'&&['text','emoji','shape','image','day','qr'].includes(element.type)&&typeof element.id==='string').map(element=>{
      const minimum=minimumElementSize(element),normalized={...element,x:Number(element.x)||0,y:Number(element.y)||0,w:Math.max(minimum,Number(element.w)||100),h:Math.max(minimum,Number(element.h)||100),rotation:Number(element.rotation)||0,opacity:clamp(element.opacity??1,0,1),dayIndex:element.type==='day'?clamp(element.dayIndex,0,6):element.dayIndex};if(normalized.variant==='candy')normalized.variant='horror';
      if(element.type==='image')Object.assign(normalized,normalizeImageCrop(element),{fit:['cover','contain','fill'].includes(element.fit)?element.fit:'cover'});
      if(element.type==='day')Object.assign(normalized,{contentLayout:['standard','poster','feature','image'].includes(element.contentLayout)?element.contentLayout:'standard',showDayName:element.showDayName!==false,showDayTime:element.showDayTime!==false,showDayTitle:element.showDayTitle!==false,showDayNote:element.showDayNote!==false,imageOverlay:clamp(element.imageOverlay??55,0,90)});
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
  function shapeElement(shape,x,y,w,h,fill,radius=20){
    return {...elementBase('shape',x,y,w,h),shape,fill,color:'#ffffff',radius,borderColor:'',borderWidth:0};
  }
  function dayElement(index,x,y,w,h,variant){
    return {...elementBase('day',x,y,w,h),dayIndex:index,variant,fill:defaultCardColors(variant).fill,color:defaultCardColors(variant).color,radius:24,font:'rounded',weight:900,fontStyle:'normal',transform:'none',letterSpacing:0,effect:'none',align:'left',fontSize:22,contentLayout:'standard',showDayName:true,showDayTime:true,showDayTitle:true,showDayNote:true,imageOverlay:55};
  }
  function emojiElement(value,x,y,size=100){ return {...elementBase('emoji',x,y,size,size),text:value,fontSize:size*.82,color:'#ffffff',fill:'#ffffff'}; }
  function qrElement(width,height){const size=width===height?150:135;return {...elementBase('qr',width-size-38,height-size-38,size,size),name:'QR Code',builtIn:true,color:'#111827',fill:'#ffffff'};}
  function svgImageElement(svg,x,y,w,h,name){return {...elementBase('image',x,y,w,h),src:`data:image/svg+xml;base64,${btoa(svg)}`,assetId:'',name,fit:'contain',...normalizeImageCrop(),color:'#ffffff',fill:'#ffffff'};}
  function violinWatermark(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 600"><g fill="none" stroke="#70482d" stroke-linecap="round" stroke-linejoin="round"><path fill="#70482d" fill-opacity=".16" stroke-width="7" d="M120 586C54 570 42 510 70 454c17-34 8-68-24-96-42-37-25-112 32-132 27-10 35-38 25-76h34c-10 38-2 66 25 76 57 20 74 95 32 132-32 28-41 62-24 96 28 56 16 116-50 132Z"/><path stroke-width="12" d="M120 230V72M105 75h30l12-34-27-24-27 24 12 34Z"/><path stroke-width="6" d="M92 157h56M83 252c-34 35-31 72-4 99M157 252c34 35 31 72 4 99M78 466c25 27 59 27 84 0"/><path stroke-width="3" d="M114 77v447M120 77v447M126 77v447"/><path stroke-width="8" d="M91 405h58M98 418h44"/><path stroke-width="7" d="M84 286c-18 9-20 31-7 45M156 286c18 9 20 31 7 45"/></g></svg>`;}
  function normalizeImageCrop(element={}){return {cropZoom:clamp(element.cropZoom??1,.1,3),cropX:clamp(element.cropX??0,-200,200),cropY:clamp(element.cropY??0,-200,200),stretchX:clamp(element.stretchX??1,.5,3),stretchY:clamp(element.stretchY??1,.5,3)};}
  function imageCropStyle(element){const crop=normalizeImageCrop(element);return `object-fit:${element.fit||'cover'};left:calc(50% + ${crop.cropX}%);top:calc(50% + ${crop.cropY}%);transform:translate(-50%,-50%) scale(${crop.cropZoom}) scaleX(${crop.stretchX}) scaleY(${crop.stretchY})`;}
  function defaultCardColors(variant){
    return {
      cloud:{fill:'#f7f1ff',color:'#292b63'},cyber:{fill:'#071321',color:'#d9faff'},rpg:{fill:'#e9d2a2',color:'#3f2b1d'},manga:{fill:'#ffffff',color:'#17121f'},cozy:{fill:'#fff7e7',color:'#4b3a31'},arcade:{fill:'#160f35',color:'#ffffff'},agenda:{fill:'#fffdf8',color:'#18324a'},polaroid:{fill:'#fffdf8',color:'#24364b'},roadmap:{fill:'#0b2c30',color:'#effff9'},constellation:{fill:'#111536',color:'#f5f3ff'},spotlight:{fill:'#171717',color:'#ffffff'},columns:{fill:'#172033',color:'#ffffff'},bubblegrid:{fill:'#68d6e1',color:'#087f8c'},horror:{fill:'#10090b',color:'#ffffff'},violin:{fill:'#fffaf0',color:'#3e291c'}
    }[variant] || {fill:'#ffffff',color:'#111827'};
  }

  function cardLayout(style,width,height){
    const square = width===height;
    if(style==='spotlight'&&!square)return [{dayIndex:1,x:260,y:245,w:430,h:570},{dayIndex:4,x:910,y:245,w:430,h:570}];
    if(style==='columns'&&!square){const gap=18,margin=45,cardW=(width-margin*2-gap*6)/7;return Array.from({length:7},(_,i)=>({x:margin+i*(cardW+gap),y:285,w:cardW,h:490}));}
    if(style==='bubblegrid'&&!square){const gap=10,margin=34,cardW=(width-margin*2-gap*6)/7;return Array.from({length:7},(_,i)=>({x:margin+i*(cardW+gap),y:220,w:cardW,h:610}));}
    if(style==='horror'&&!square){const spots=[[70,250],[440,225],[810,260],[1180,230],[255,555],[650,530],[1045,565]];return spots.map(([x,y])=>({x,y,w:300,h:245}));}
    if(style==='violin'){const gap=square?18:22,margin=square?140:150,cardW=(width-margin*2-gap*3)/4,cardH=square?235:225;return Array.from({length:7},(_,i)=>{const row=i<4?0:1,index=row?i-4:i,count=row?3:4,rowWidth=count*cardW+(count-1)*gap;return {x:(width-rowWidth)/2+index*(cardW+gap),y:row?(square?625:565):(square?300:285),w:cardW,h:cardH};});}
    if(style==='agenda'){
      const gap=18,top=225,margin=55,cardW=(width-margin*2-gap)/2,cardH=(height-top-45-gap*3)/4;
      return Array.from({length:7},(_,i)=>{const column=i<4?0:1,row=i<4?i:i-4;return {x:margin+column*(cardW+gap),y:top+row*(cardH+gap)+(column?cardH*.42:0),w:cardW,h:cardH};});
    }
    if(style==='roadmap'&&!square){const gap=18,margin=54,cardW=(width-margin*2-gap*6)/7;return Array.from({length:7},(_,i)=>({x:margin+i*(cardW+gap),y:i%2?475:245,w:cardW,h:300}));}
    if(style==='constellation'&&!square){const spots=[[70,250],[430,220],[790,265],[1150,225],[245,555],[650,525],[1055,555]];return spots.map(([x,y])=>({x,y,w:300,h:220}));}
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
    const style=TEMPLATE_STYLE[name]||TEMPLATE_STYLE.cloud;
    const {width,height}=project;
    const elements=[];
    const dark=name==='manga' ? '#17121f' : style.text;
    const heading=textElement(project.title,70,45,width-140,105,width===height?64:76,dark,'rounded',900,'center');heading.role='title';elements.push(heading);
    const subtitle=textElement(project.subtitle,250,150,width-500,42,27,name==='manga'?'#6b21a8':style.text,'sans',800,'center');subtitle.role='subtitle';elements.push(subtitle);
    if(name==='spotlight'){Object.assign(heading,{font:'display',fontSize:68,transform:'uppercase',letterSpacing:3});Object.assign(subtitle,{font:'sans',fontStyle:'italic'});}
    if(name==='columns'){Object.assign(heading,{align:'left',x:45,w:720,font:'condensed',fontSize:82,transform:'uppercase'});Object.assign(subtitle,{align:'right',x:800,w:750,y:160});}
    if(name==='bubblegrid'){Object.assign(heading,{font:'hand',color:'#087f8c',fontSize:70});Object.assign(subtitle,{font:'comic',color:'#087f8c'});}
    if(name==='horror'){Object.assign(heading,{align:'left',x:70,w:1050,font:'display',fontSize:86,color:'#f8fafc',transform:'uppercase',letterSpacing:4,effect:'hard'});Object.assign(subtitle,{align:'right',x:850,w:670,y:155,font:'typewriter',fontSize:24,color:'#ff334d',transform:'uppercase',letterSpacing:3});}
    if(name==='violin'){Object.assign(heading,{font:'serif',fontStyle:'italic',fontSize:70,color:style.text,letterSpacing:2});Object.assign(subtitle,{font:'serif',fontStyle:'italic',fontSize:25,color:style.accent});}
    if(name==='agenda'){Object.assign(heading,{align:'left',font:'serif',x:70,w:720,color:style.text});Object.assign(subtitle,{align:'left',x:72,w:650,color:style.accent});elements.unshift(shapeElement('rect',42,42,10,height-84,style.accent,5));}
    if(name==='roadmap'){elements.unshift(shapeElement('rect',65,438,width-130,10,style.accent,5));elements.push(emojiElement('🚀',width-125,390,82));}
    if(name==='constellation'){[[250,445,300,-8],[575,430,300,7],[910,440,300,-6]].forEach(([x,y,w,rotation])=>{const line=shapeElement('rect',x,y,w,4,'#8175c9',2);line.rotation=rotation;elements.unshift(line);});elements.push(emojiElement('✦',45,60,70));elements.push(emojiElement('🌙',width-125,55,78));}
    const layouts=cardLayout(name,width,height);
    layouts.forEach((layout,index)=>{
      const card=dayElement(layout.dayIndex??index,layout.x,layout.y,layout.w,layout.h,style.card);
      if(name==='manga') card.rotation=[-2,1,-1,2,-1,1,-2][index];
      if(name==='polaroid') card.rotation=[-3,2,-1,3,-2,1,-3][index];
      if(name==='constellation') card.rotation=[-2,1,-1,2,1,-2,2][index];
      if(name==='spotlight')Object.assign(card,{contentLayout:'feature',align:'center',font:'condensed',fontSize:30,imageOverlay:48});
      if(name==='columns'){Object.assign(card,{contentLayout:'poster',align:'center',font:'typewriter',fontSize:22,imageOverlay:50});card.y+=[0,26,-8,18,-12,24,2][index];card.h-=[0,26,-8,18,-12,24,2][index];}
      if(name==='bubblegrid'){Object.assign(card,{contentLayout:'standard',align:'center',font:'hand',fontSize:22,imageOverlay:30,fill:index%2?'#5cd2df':'#acdfe7'});}
      if(name==='horror'){Object.assign(card,{contentLayout:'poster',align:'center',font:'condensed',fontSize:23,imageOverlay:68,fill:index%2?'#17090c':'#0d0d0f'});card.rotation=[-2,2,-1,2,1,-2,2][index];}
      if(name==='violin')Object.assign(card,{contentLayout:'standard',font:'serif',fontStyle:'italic',fontSize:24,imageOverlay:42});
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
      elements.push(emojiElement('🐉',width-155,height-165,130));elements.push(emojiElement('💎',width-255,height-105,74));
      elements.push(emojiElement('🪄',45,55,90));
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
    if(project.showQr)elements.push(qrElement(width,height));
    elements.forEach(element=>{element.builtIn=true;});
    project.template=name;
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
        const legacyCrop=day.imageCropGrid||{};return {name:fallback.name,time:String(day.time||fallback.time),title:String(day.category||fallback.title),note:String(day.note||''),status:String(day.time||'').toUpperCase()==='OFF'?'off':'live',star:!!day.star,imageSrc:String(day.image||''),imageAssetId:'',imageName:String(day.imageName||''),imageFit:['cover','contain','fill'].includes(day.imageFit)?day.imageFit:'cover',cropZoom:Number(legacyCrop.zoom)||1,cropX:Number(legacyCrop.x)||0,cropY:Number(legacyCrop.y)||0,stretchX:Number(legacyCrop.stretchX)||1,stretchY:Number(legacyCrop.stretchY)||1};
      });
      project=fresh;buildTemplate('cloud');applyModifierTypography();return project;
    }catch{return null;}
  }
  async function load(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){project=validateProject(JSON.parse(raw));missingImageCount=await hydrateImages(project)||0;return;}
    }catch{}
    if(!migrateV1()){project=defaultProject();buildTemplate('cloud');}
  }

  function gradientCss(){const bg=project.background;return `linear-gradient(${bg.angle}deg,${bg.colors[0]},${bg.colors[1]})`;}
  function renderAll(){
    els.projectName.value=project.name;els.title.value=project.title;els.subtitle.value=project.subtitle;els.showQr.checked=!!project.showQr;els.qrUrl.value=project.qrUrl||'';renderQrControls();
    renderDays();renderModifierControls();renderTypePresetControls();renderBackgroundControls();renderCanvas();renderInspector();renderLayers();updateZoom();updateHistoryButtons();
  }
  function renderDays(){
    els.dayStrip.innerHTML=DAY_SHORT.map((name,index)=>`<button class="dayPick${index===selectedDay?' isActive':''}" data-day="${index}" type="button">${project.days[index].star?'★ ':''}${name}</button>`).join('');
    const day=project.days[selectedDay];els.dayName.value=day.name;els.dayTime.value=day.time;els.dayTitle.value=day.title;els.dayNote.value=day.note;els.dayStatus.value=day.status;els.dayStar.checked=!!day.star;els.dayImageStatus.textContent=day.imageSrc?(day.imageName||'Image ajoutée'):'Aucune image';els.dayImageFit.value=day.imageFit||'cover';els.dayImageFit.disabled=!day.imageSrc;els.cropDayImage.disabled=!day.imageSrc;els.removeDayImage.disabled=!day.imageSrc;
  }
  function selectDayForEditing(index){selectedDay=clamp(index,0,6);const card=project.elements.find(element=>element.type==='day'&&element.dayIndex===selectedDay);selectedId=card?.id||'';renderDays();renderCanvas();renderInspector();renderLayers();}
  function renderModifierControls(){
    els.modifierSelect.value=project.modifier;els.eventBanner.value=project.eventBanner||'';els.hideModifierLabels.checked=!!project.hideModifierLabels;
  }
  function renderTypePresetControls(){els.typePresetSelect.value=project.typePreset||'';}
  function renderBackgroundControls(){
    const bg=project.background;els.transparentBackground.checked=!!bg.transparent;els.backgroundImageStatus.textContent=bg.transparent?(bg.imageSrc?'Image masquée':'PNG transparent'):bg.imageSrc?(bg.imageName||'Image ajoutée'):'Dégradé du modèle';els.backgroundImageFit.value=bg.imageFit||'cover';els.backgroundImageFit.disabled=!bg.imageSrc||bg.transparent;els.removeBackgroundImage.disabled=!bg.imageSrc;
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
    const selected=element.id===selectedId?' isSelected':'';const locked=element.locked?' isLocked':'';
    let content='';
    if(element.type==='text')content=`<div class="elText textEffect-${element.effect||'none'}" style="width:100%;height:100%;font-size:${element.fontSize||32}px;line-height:1.08;color:${color(element.color)};${typographyStyle(element)}">${escapeHtml(element.text)}</div>`;
    if(element.type==='emoji')content=`<div class="elEmoji" style="width:100%;height:100%;font-size:${element.fontSize||80}px">${escapeHtml(element.text)}</div>`;
    if(element.type==='shape')content=`<div class="elShape" style="background:${color(element.fill)};border-radius:${element.shape==='circle'?'50%':`${element.radius||0}px`};border:${element.borderWidth||0}px solid ${color(element.borderColor,'#000000')}"></div>`;
    if(element.type==='image')content=element.src?`<div class="elImage"><img src="${escapeHtml(element.src)}" alt="" style="${imageCropStyle(element)}"></div>`:'<div class="elImageMissing">Image introuvable<br>Utilise « Remplacer »</div>';
    if(element.type==='qr')content=`<div class="elQr">${qrSvg(element)}</div>`;
    if(element.type==='day'){
      const day=project.days[element.dayIndex],off=day.status==='off';
      const label=specialLabel(day,element.dayIndex);
      const size=Number(element.fontSize)||22;
      const dayImage=day.imageSrc?`<div class="elDay__image"><img src="${escapeHtml(day.imageSrc)}" alt="" style="${imageCropStyle({...day,fit:day.imageFit})}"></div>`:'';
      const layout=element.contentLayout||'standard',visible=layout!=='image',timeSize=layout==='feature'?size*2:size*1.2;
      content=`<div class="elDay variant-${element.variant} dayLayout-${layout}${day.star?' isStar':''}${day.imageSrc?' hasImage':''} textEffect-${element.effect||'none'}" style="background:${color(element.fill)};color:${color(element.color)};font-size:${size}px;--day-overlay:${clamp(element.imageOverlay??55,0,90)/100};${typographyStyle(element)}">${dayImage}${visible&&element.showDayName!==false?`<div class="elDay__name" style="font-size:${size}px">${escapeHtml(day.name)}</div>`:''}${visible&&label?`<div class="specialLabel">${escapeHtml(label)}</div>`:''}${day.star?'<div class="starBadge">★ Jour star</div>':''}${visible&&element.showDayTime!==false?`<div class="elDay__time" style="font-size:${timeSize}px">${escapeHtml(off?'REPOS':day.time)}</div>`:''}${visible&&element.showDayTitle!==false?`<div class="elDay__title" style="font-size:${size*.84}px">${escapeHtml(day.title)}</div>`:''}${visible&&element.showDayNote!==false&&day.note?`<div class="elDay__note" style="font-size:${Math.max(10,size*.56)}px">${escapeHtml(day.note)}</div>`:''}</div>`;
    }
    return `<div class="canvasElement${selected}${locked}${element.role?` role-${element.role}`:''}" data-id="${element.id}" data-type="${element.type}" style="${elementStyle(element)}">${content}<span class="resizeHandle" data-resize="true"></span></div>`;
  }
  function renderCanvas(){
    els.artboard.style.width=`${project.width}px`;els.artboard.style.height=`${project.height}px`;
    els.artboard.className=`artboard modifier-${project.modifier||'none'}`;
    const bg=project.background,layers=[],sizes=[],positions=[],repeats=[];
    if(gridEnabled){layers.push('linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px)','linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)');sizes.push('10px 10px','10px 10px');positions.push('0 0','0 0');repeats.push('repeat','repeat');}
    if(bg.transparent){layers.push('linear-gradient(45deg,#d8dde7 25%,transparent 25%,transparent 75%,#d8dde7 75%)','linear-gradient(45deg,#d8dde7 25%,#f5f7fb 25%,#f5f7fb 75%,#d8dde7 75%)');sizes.push('24px 24px','24px 24px');positions.push('0 0','12px 12px');repeats.push('repeat','repeat');}
    else{if(bg.imageSrc){layers.push(`url("${bg.imageSrc}")`);sizes.push(bg.imageFit==='fill'?'100% 100%':bg.imageFit||'cover');positions.push('center');repeats.push('no-repeat');}layers.push(gradientCss());sizes.push('100% 100%');positions.push('center');repeats.push('no-repeat');}
    els.artboard.style.backgroundImage=layers.join(',');els.artboard.style.backgroundSize=sizes.join(',');els.artboard.style.backgroundPosition=positions.join(',');els.artboard.style.backgroundRepeat=repeats.join(',');
    els.artboard.classList.toggle('showGrid',gridEnabled);
    const banner=String(project.eventBanner||'').trim();
    els.artboard.innerHTML=`${banner?`<div class="eventBannerCanvas">${escapeHtml(banner)}</div>`:''}${project.elements.map(renderElement).join('')}`;
    els.canvasLabel.textContent=`Planning ${project.format==='square'?'carré':'16:9'}`;
    document.querySelectorAll('[data-format]').forEach(button=>button.classList.toggle('isActive',button.dataset.format===project.format));
    renderPreflightStatus();
  }
  function renderPreflightStatus(){
    const warnings=[];
    if(project.elements.some(element=>element.opacity>0&&(element.x<0||element.y<0||element.x+element.w>project.width||element.y+element.h>project.height)))warnings.push('élément hors du planning');
    if(project.elements.some(element=>element.type==='image'&&!element.src)||project.days.some(day=>day.imageAssetId&&!day.imageSrc)||(project.background.imageAssetId&&!project.background.imageSrc))warnings.push('image introuvable');
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
    els.dayCardProperties.hidden=element.type!=='day';if(element.type==='day'){els.propDayLayout.value=element.contentLayout||'standard';els.propShowDayName.checked=element.showDayName!==false;els.propShowDayTime.checked=element.showDayTime!==false;els.propShowDayTitle.checked=element.showDayTitle!==false;els.propShowDayNote.checked=element.showDayNote!==false;els.propDayOverlay.value=String(clamp(element.imageOverlay??55,0,90));els.propDayOverlayValue.textContent=`${Math.round(element.imageOverlay??55)} %`;}
    els.propColorField.hidden=!['text','day','qr'].includes(element.type);els.propFillField.hidden=!['shape','day','qr'].includes(element.type);
    els.propText.value=element.text||'';els.propFontSize.value=Math.round(element.fontSize||32);els.propFont.value=element.font||'sans';els.propWeight.value=String([400,700,900].includes(Number(element.weight))?element.weight:900);els.propFontStyle.value=element.fontStyle||'normal';els.propTransform.value=element.transform||'none';els.propAlign.value=element.align||'left';els.propLetterSpacing.value=Number(element.letterSpacing)||0;els.propLetterSpacingValue.textContent=`${Number(element.letterSpacing)||0} px`;els.propTextEffect.value=element.effect||'none';els.propColor.value=color(element.color);els.propFill.value=color(element.fill);
  }
  function layerName(element){
    if(element.type==='day')return project.days[element.dayIndex].name;
    if(element.type==='text')return element.text.slice(0,28)||'Texte';
    if(element.type==='emoji')return `Emoji ${element.text}`;
    return element.name||({shape:'Forme',image:'Image',qr:'QR Code'}[element.type]||'Élément');
  }
  function renderLayers(){
    const ordered=[...project.elements].reverse();
    els.layerSelect.innerHTML=`<option value="">Choisir un calque…</option>${ordered.map(element=>`<option value="${element.id}">${escapeHtml(layerName(element))}${element.locked?' · verrouillé':''}</option>`).join('')}`;els.layerSelect.value=selectedId;
    els.layerList.innerHTML=ordered.map(element=>`<div class="layerItem${element.id===selectedId?' isActive':''}" data-layer="${element.id}" tabindex="0" role="button" draggable="${!element.locked}"><b>${element.type==='text'?'T':element.type==='day'?'▦':element.type==='shape'?'◆':element.type==='emoji'?'☺':'▧'}</b><span>${escapeHtml(layerName(element))}</span><button data-lock="${element.id}" title="${element.locked?'Déverrouiller':'Verrouiller'}" aria-label="${element.locked?'Déverrouiller':'Verrouiller'} ${escapeHtml(layerName(element))}">${element.locked?'🔒':'○'}</button></div>`).join('');
  }
  function selectElement(id){selectedId=id||'';const element=selectedElement();if(element?.type==='day'){selectedDay=element.dayIndex;renderDays();}renderCanvas();renderInspector();renderLayers();if(selectedId)els.artboard.focus({preventScroll:true});}
  function updateSelectedFromProperties(){
    const element=selectedElement();if(!element)return;
    const minimum=minimumElementSize(element);element.x=snap(els.propX.value);element.y=snap(els.propY.value);element.w=Math.max(minimum,snap(els.propW.value));element.h=Math.max(minimum,snap(els.propH.value));element.rotation=Number(els.propRotation.value)||0;element.opacity=clamp(els.propOpacity.value,0,100)/100;
    if(['text','emoji','day'].includes(element.type)){if(element.type!=='day')element.text=els.propText.value;element.fontSize=clamp(els.propFontSize.value,8,240);element.font=els.propFont.value;element.weight=Number(els.propWeight.value)||800;element.fontStyle=els.propFontStyle.value;element.transform=els.propTransform.value;element.align=els.propAlign.value;element.letterSpacing=Number(els.propLetterSpacing.value)||0;els.propLetterSpacingValue.textContent=`${element.letterSpacing} px`;element.effect=els.propTextEffect.value;element.color=els.propColor.value;}
    if(element.type==='qr')element.color=els.propColor.value;
    if(element.type==='image')element.fit=els.propImageFit.value;
    if(element.type==='day'){element.contentLayout=els.propDayLayout.value;element.showDayName=els.propShowDayName.checked;element.showDayTime=els.propShowDayTime.checked;element.showDayTitle=els.propShowDayTitle.checked;element.showDayNote=els.propShowDayNote.checked;element.imageOverlay=clamp(els.propDayOverlay.value,0,90);els.propDayOverlayValue.textContent=`${Math.round(element.imageOverlay)} %`;}
    if(['shape','day','qr'].includes(element.type))element.fill=els.propFill.value;
    renderCanvas();renderLayers();commit();
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
    renderCanvas();renderLayers();commit();
  }
  function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;});}
  function roundRect(ctx,x,y,w,h,r){const radius=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
  function wrapText(ctx,text,maxWidth,maxLines=4){
    const words=String(text||'').split(/\s+/),lines=[];let line='';
    words.forEach(word=>{const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;});if(line)lines.push(line);return lines.slice(0,maxLines);
  }
  function configureCanvasText(ctx,element,size){
    ctx.font=`${element.fontStyle||'normal'} ${element.weight||800} ${size}px ${FONT_MAP[element.font]||FONT_MAP.sans}`;
    if('letterSpacing' in ctx)ctx.letterSpacing=`${Number(element.letterSpacing)||0}px`;
    const effect=element.effect||'none';ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
    if(effect==='soft'){ctx.shadowColor='rgba(0,0,0,.42)';ctx.shadowBlur=12;ctx.shadowOffsetY=5;}
    if(effect==='hard'){ctx.shadowColor='rgba(0,0,0,.72)';ctx.shadowBlur=0;ctx.shadowOffsetX=5;ctx.shadowOffsetY=5;}
    if(effect==='neon'){ctx.shadowColor=color(element.color,'#22d3ee');ctx.shadowBlur=18;}
  }
  function paintCanvasText(ctx,text,x,y,maxWidth,element){if(element.effect==='outline'){ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.82)';ctx.lineJoin='round';ctx.strokeText(text,x,y,maxWidth);}ctx.fillText(text,x,y,maxWidth);}
  function drawText(ctx,element){
    ctx.fillStyle=color(element.color);configureCanvasText(ctx,element,element.fontSize||32);ctx.textAlign=element.align||'left';ctx.textBaseline='top';
    const x=element.align==='center'?element.w/2:element.align==='right'?element.w:0;const lines=wrapText(ctx,transformedText(element.text,element.transform),element.w,6);const lineHeight=(element.fontSize||32)*1.08;lines.forEach((line,index)=>paintCanvasText(ctx,line,x,index*lineHeight,element.w,element));
  }
  function dayPalette(element){return {fill:color(element.fill,defaultCardColors(element.variant).fill),color:color(element.color,defaultCardColors(element.variant).color),border:{cloud:'#ffffff',cyber:'#22d3ee',rpg:'#74512d',manga:'#17121f',cozy:'#b98062',arcade:'#ff00ee',agenda:'#d25b47',polaroid:'#fffdf8',roadmap:'#54f2c2',constellation:'#9a8be8',spotlight:'#f4f4f5',columns:'#dbeafe',bubblegrid:'#ffffff',horror:'#b91c2d',violin:'#70482d'}[element.variant]||'#ffffff'};}
  function dayCardPath(ctx,element,inset=0){
    const x=inset,y=inset,w=element.w-inset*2,h=element.h-inset*2;
    if(element.variant==='cyber'){
      const cut=Math.min(24,w*.12,h*.12);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w-cut,y);ctx.lineTo(x+w,y+cut);ctx.lineTo(x+w,y+h);ctx.lineTo(x+cut,y+h);ctx.lineTo(x,y+h-cut);ctx.closePath();return;
    }
    const radius=project.modifier==='ticket'?9:element.variant==='cloud'||element.variant==='constellation'?[50,50,22,22]:element.variant==='manga'||element.variant==='arcade'||element.variant==='polaroid'||element.variant==='horror'?2:element.variant==='rpg'||element.variant==='agenda'?8:element.variant==='roadmap'?[16,16,42,16]:element.variant==='spotlight'?38:element.variant==='columns'?[32,32,10,10]:element.variant==='bubblegrid'?5:element.variant==='violin'?[7,18,18,7]:18;
    ctx.beginPath();ctx.roundRect(x,y,w,h,radius);
  }
  function drawDay(ctx,element,dayImage=null){
    const day=project.days[element.dayIndex],palette=dayPalette(element);
    ctx.save();if(project.modifier==='anime'){ctx.translate(element.w/2,element.h/2);ctx.transform(1,Math.tan(-Math.PI/180),0,1,0,0);ctx.translate(-element.w/2,-element.h/2);}
    if(element.variant==='manga'){ctx.save();ctx.translate(7,7);ctx.fillStyle='#17121f';dayCardPath(ctx,element);ctx.fill();ctx.restore();}
    if(element.variant==='cozy'){ctx.save();ctx.translate(0,8);ctx.fillStyle='rgba(80,55,38,.18)';dayCardPath(ctx,element);ctx.fill();ctx.restore();}
    if(element.variant==='roadmap'||element.variant==='constellation'){ctx.save();ctx.shadowColor=element.variant==='roadmap'?'rgba(84,242,194,.4)':'rgba(185,167,255,.46)';ctx.shadowBlur=24;ctx.fillStyle=palette.fill;dayCardPath(ctx,element);ctx.fill();ctx.restore();}
    if(day.star){ctx.save();ctx.shadowColor='rgba(250,204,21,.85)';ctx.shadowBlur=28;ctx.strokeStyle='#facc15';ctx.lineWidth=9;dayCardPath(ctx,element,3);ctx.stroke();ctx.restore();}
    if(['release','challenge'].includes(project.modifier)){ctx.save();ctx.shadowColor=project.modifier==='release'?'rgba(96,165,250,.72)':'rgba(239,68,68,.55)';ctx.shadowBlur=22;ctx.fillStyle=palette.fill;dayCardPath(ctx,element);ctx.fill();ctx.restore();}
    ctx.fillStyle=palette.fill;ctx.strokeStyle=project.modifier==='challenge'?'#ef4444':palette.border;ctx.lineWidth=element.variant==='polaroid'?12:project.modifier==='rpg'?6:element.variant==='rpg'||element.variant==='manga'||element.variant==='arcade'||element.variant==='roadmap'||project.modifier==='poster'?4:2;
    if(project.modifier==='ticket')ctx.setLineDash([12,8]);if(project.modifier==='indie')ctx.setLineDash([3,8]);
    if(element.variant==='arcade'){ctx.save();ctx.shadowColor='#00ffff';ctx.shadowBlur=15;dayCardPath(ctx,element);ctx.stroke();ctx.restore();}
    dayCardPath(ctx,element);ctx.fill();ctx.stroke();
    ctx.setLineDash([]);
    if(dayImage){const area={w:element.w,h:element.h,fit:day.imageFit||'cover',...normalizeImageCrop(day)},overlay=clamp(element.imageOverlay??55,0,90)/100;ctx.save();dayCardPath(ctx,element);ctx.clip();drawCroppedImage(ctx,dayImage,area);const fade=ctx.createLinearGradient(0,0,0,element.h);fade.addColorStop(0,'rgba(0,0,0,.12)');fade.addColorStop(.38,'rgba(0,0,0,.06)');fade.addColorStop(1,`rgba(0,0,0,${overlay})`);ctx.fillStyle=fade;ctx.fillRect(0,0,element.w,element.h);ctx.restore();ctx.save();ctx.strokeStyle=project.modifier==='challenge'?'#ef4444':palette.border;ctx.lineWidth=element.variant==='polaroid'?12:project.modifier==='rpg'?6:element.variant==='rpg'||element.variant==='manga'||element.variant==='arcade'||element.variant==='roadmap'||project.modifier==='poster'?4:2;dayCardPath(ctx,element);ctx.stroke();ctx.restore();}
    if(element.variant==='rpg'||project.modifier==='rpg'){ctx.save();ctx.lineWidth=2;dayCardPath(ctx,element,8);ctx.stroke();ctx.restore();}
    if(element.variant==='agenda'){ctx.save();ctx.strokeStyle='#d25b47';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(5,7);ctx.lineTo(5,element.h-7);ctx.stroke();ctx.restore();}
    if(element.variant==='violin'){ctx.save();ctx.strokeStyle='#70482d';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(4,8);ctx.lineTo(4,element.h-8);ctx.stroke();ctx.globalAlpha*=.38;ctx.lineWidth=1;dayCardPath(ctx,element,8);ctx.stroke();ctx.beginPath();ctx.moveTo(18,element.h-132);ctx.lineTo(element.w-18,element.h-132);ctx.stroke();ctx.restore();}
    if(element.variant==='columns'){ctx.save();ctx.strokeStyle='#9ecb91';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(8,5);ctx.lineTo(element.w-8,5);ctx.stroke();ctx.restore();}
    if(element.variant==='bubblegrid'){ctx.save();ctx.strokeStyle='rgba(255,255,255,.88)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(2,element.h*.51);ctx.lineTo(element.w-2,element.h*.51);ctx.stroke();ctx.restore();}
    if(element.variant==='horror'){ctx.save();ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=2;for(let y=7;y<element.h;y+=7){ctx.beginPath();ctx.moveTo(2,y);ctx.lineTo(element.w-2,y);ctx.stroke();}ctx.restore();}
    if(element.variant==='polaroid'){ctx.save();ctx.fillStyle='#fffdf8';ctx.fillRect(6,element.h-38,element.w-12,32);ctx.restore();}
    if(project.modifier==='logbook'){ctx.save();ctx.strokeStyle='rgba(0,0,0,.10)';ctx.lineWidth=1;for(let y=70;y<element.h-20;y+=25){ctx.beginPath();ctx.moveTo(12,y);ctx.lineTo(element.w-12,y);ctx.stroke();}ctx.restore();}
    if(project.modifier==='marathon'||project.modifier==='subathon'){ctx.save();ctx.strokeStyle=palette.border;ctx.lineWidth=9;ctx.beginPath();const y=project.modifier==='marathon'?5:element.h-5;ctx.moveTo(7,y);ctx.lineTo(element.w-7,y);ctx.stroke();ctx.restore();}
    const layout=element.contentLayout||'standard',visible=layout!=='image',alignment=element.align||'left',x=alignment==='center'?element.w/2:alignment==='right'?element.w-18:18,maxWidth=element.w-36,base=Math.max(17,Number(element.fontSize)||element.w*.105);
    const textColor=dayImage?'#ffffff':palette.color;ctx.fillStyle=textColor;ctx.textAlign=alignment;ctx.textBaseline='top';
    const nameY=layout==='poster'?element.h-100:18,timeY=layout==='poster'?12:layout==='feature'?58:element.h-125,titleY=layout==='poster'?element.h-48:element.h-83,noteY=element.h-28;
    if(visible&&element.showDayName!==false){configureCanvasText(ctx,element,base);paintCanvasText(ctx,transformedText(day.name,element.transform),x,nameY,maxWidth,element);}
    const label=specialLabel(day,element.dayIndex);if(visible&&label){ctx.save();ctx.shadowColor='transparent';ctx.font=`900 ${Math.max(9,base*.45)}px Arial,sans-serif`;ctx.fillStyle=textColor;ctx.fillText(label,x,layout==='poster'?52:48,maxWidth);ctx.restore();}
    if(visible&&element.showDayTime!==false){if(layout==='poster'){ctx.save();ctx.fillStyle=element.variant==='columns'?'#9ecb91':'rgba(0,0,0,.5)';ctx.beginPath();ctx.roundRect(12,8,element.w-24,Math.max(34,base*1.55),18);ctx.fill();ctx.restore();}ctx.fillStyle=element.variant==='columns'?'#142018':element.variant==='horror'?'#ff334d':textColor;configureCanvasText(ctx,element,layout==='feature'?base*2:base*1.2);paintCanvasText(ctx,transformedText(day.status==='off'?'REPOS':day.time,element.transform),x,timeY,maxWidth,element);ctx.fillStyle=textColor;}
    if(visible&&element.showDayTitle!==false){configureCanvasText(ctx,element,base*.84);wrapText(ctx,transformedText(day.title,element.transform),maxWidth,2).forEach((line,i)=>paintCanvasText(ctx,line,x,titleY+i*22,maxWidth,element));}
    if(visible&&element.showDayNote!==false&&day.note){ctx.save();ctx.globalAlpha*=.7;configureCanvasText(ctx,element,Math.max(10,base*.56));paintCanvasText(ctx,transformedText(day.note,element.transform),x,noteY,maxWidth,element);ctx.restore();}
    if(day.star){ctx.save();ctx.shadowColor='transparent';ctx.fillStyle='#facc15';ctx.beginPath();ctx.roundRect(element.w-103,10,93,25,12);ctx.fill();ctx.fillStyle='#251800';ctx.font='900 10px Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★ JOUR STAR',element.w-56.5,22.5,83);ctx.restore();}ctx.restore();
  }
  function drawQr(ctx,element){
    const qr=makeQr();if(!qr)return;const count=qr.getModuleCount(),side=Math.min(element.w,element.h),pad=Math.max(6,side*.08),cell=(side-pad*2)/count,x=(element.w-side)/2,y=(element.h-side)/2;
    ctx.fillStyle=color(element.fill,'#ffffff');ctx.beginPath();ctx.roundRect(x,y,side,side,Math.max(5,side*.05));ctx.fill();ctx.fillStyle=color(element.color,'#111827');for(let row=0;row<count;row++)for(let column=0;column<count;column++)if(qr.isDark(row,column))ctx.fillRect(x+pad+column*cell,y+pad+row*cell,Math.ceil(cell),Math.ceil(cell));
  }
  function drawCroppedImage(ctx,image,element){
    const crop=normalizeImageCrop(element),iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;
    let w=element.w,h=element.h;
    if(element.fit!=='fill'){const ratio=(element.fit==='contain'?Math.min:Math.max)(element.w/iw,element.h/ih);w=iw*ratio;h=ih*ratio;}
    w*=crop.cropZoom*crop.stretchX;h*=crop.cropZoom*crop.stretchY;
    const x=(element.w-w)/2+element.w*crop.cropX/100,y=(element.h-h)/2+element.h*crop.cropY/100;
    ctx.save();ctx.beginPath();ctx.rect(0,0,element.w,element.h);ctx.clip();ctx.drawImage(image,x,y,w,h);ctx.restore();
  }
  async function exportPng(){
    if(project.showQr&&!makeQr())return toast('Corrige le lien du QR Code avant l’export.');
    if(project.elements.some(element=>element.type==='image'&&!element.src)||project.days.some(day=>day.imageAssetId&&!day.imageSrc)||(project.background.imageAssetId&&!project.background.imageSrc))return toast('Remplace les images introuvables avant l’export.');
    const old=els.export.textContent;els.export.disabled=true;els.export.textContent='Création…';
    try{
      const canvas=document.createElement('canvas');canvas.width=project.width;canvas.height=project.height;const ctx=canvas.getContext('2d');
      if(!project.background.transparent){const radians=((project.background.angle||135)-90)*Math.PI/180,cx=project.width/2,cy=project.height/2,length=Math.abs(project.width*Math.cos(radians))+Math.abs(project.height*Math.sin(radians));const gradient=ctx.createLinearGradient(cx-Math.cos(radians)*length/2,cy-Math.sin(radians)*length/2,cx+Math.cos(radians)*length/2,cy+Math.sin(radians)*length/2);gradient.addColorStop(0,project.background.colors[0]);gradient.addColorStop(1,project.background.colors[1]);ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);if(project.background.imageSrc)try{drawCroppedImage(ctx,await loadImage(project.background.imageSrc),{w:canvas.width,h:canvas.height,fit:project.background.imageFit||'cover',...normalizeImageCrop(project.background)});}catch{}}
      for(const element of project.elements){
        ctx.save();ctx.globalAlpha=element.opacity??1;ctx.translate(element.x+element.w/2,element.y+element.h/2);ctx.rotate((element.rotation||0)*Math.PI/180);ctx.translate(-element.w/2,-element.h/2);
        if(element.type==='text')drawText(ctx,element);
        if(element.type==='emoji'){ctx.font=`${element.fontSize||80}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(element.text,element.w/2,element.h/2);}
        if(element.type==='shape'){ctx.fillStyle=color(element.fill);if(element.shape==='circle'){ctx.beginPath();ctx.ellipse(element.w/2,element.h/2,element.w/2,element.h/2,0,0,Math.PI*2);}else roundRect(ctx,0,0,element.w,element.h,element.radius||0);ctx.fill();}
        if(element.type==='day'){let dayImage=null;const day=project.days[element.dayIndex];if(day.imageSrc)try{dayImage=await loadImage(day.imageSrc);}catch{}drawDay(ctx,element,dayImage);}
        if(element.type==='qr')drawQr(ctx,element);
        if(element.type==='image'&&element.src){try{drawCroppedImage(ctx,await loadImage(element.src),element);}catch{}}
        ctx.restore();
      }
      const banner=String(project.eventBanner||'').trim();if(banner){const x=project.width*.14,w=project.width*.72,y=190,h=40;ctx.fillStyle='rgba(7,10,18,.78)';ctx.strokeStyle='rgba(255,255,255,.72)';ctx.lineWidth=2;roundRect(ctx,x,y,w,h,20);ctx.fill();ctx.stroke();ctx.fillStyle='#ffffff';ctx.font='900 18px Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(banner.toUpperCase(),project.width/2,y+h/2,w-32);}
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG indisponible');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${project.name.trim().replace(/[^a-z0-9_-]+/gi,'_').toLowerCase()||'planning'}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1200);toast('PNG exporté.');
    }catch(error){console.error(error);toast('Export PNG impossible.');}finally{els.export.disabled=false;els.export.textContent=old;}
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
  async function importDayImage(file){const stored=await storeImageFile(file);if(!stored)return;Object.assign(project.days[selectedDay],{imageSrc:stored.src,imageAssetId:stored.assetId,imageName:stored.name,imageFit:'cover',...normalizeImageCrop()});renderAll();pushHistory();save();toast('Image ajoutée au jour.');}
  async function importBackgroundImage(file){const stored=await storeImageFile(file);if(!stored)return;Object.assign(project.background,{imageSrc:stored.src,imageAssetId:stored.assetId,imageName:stored.name,imageFit:'cover',transparent:false,...normalizeImageCrop()});renderAll();pushHistory();save();toast('Image de fond ajoutée.');}

  function renderCropEditor(){
    if(!cropDraft)return;
    els.cropPreview.src=cropDraft.src;els.cropPreview.style.cssText=imageCropStyle(cropDraft);
    els.cropZoom.value=String(cropDraft.cropZoom);els.cropStretchX.value=String(cropDraft.stretchX);els.cropStretchY.value=String(cropDraft.stretchY);
    els.cropZoomValue.textContent=`${Math.round(cropDraft.cropZoom*100)} %`;els.cropStretchXValue.textContent=`${Math.round(cropDraft.stretchX*100)} %`;els.cropStretchYValue.textContent=`${Math.round(cropDraft.stretchY*100)} %`;
    els.cropPosition.textContent=`Position : ${Math.round(cropDraft.cropX)} / ${Math.round(cropDraft.cropY)}`;
  }
  function openCropEditor(dayIndex=null){
    const isDay=Number.isInteger(dayIndex),element=isDay?project.days[dayIndex]:selectedElement();if(isDay&&!element?.imageSrc)return toast('Ajoute d’abord une image à ce jour.');if(!isDay&&element?.type!=='image')return toast('Sélectionne une image à recadrer.');
    const card=isDay?project.elements.find(item=>item.type==='day'&&item.dayIndex===dayIndex):element;cropDraft={kind:isDay?'day':'element',id:isDay?dayIndex:element.id,src:isDay?element.imageSrc:element.src,fit:isDay?element.imageFit||'cover':element.fit||'cover',...normalizeImageCrop(element)};cropDrag=null;
    els.cropStage.style.aspectRatio=isDay?`${Math.max(1,card?.w||300)} / ${Math.max(1,card?.h||400)}`:`${Math.max(1,element.w)} / ${Math.max(1,element.h)}`;els.app.inert=true;els.cropModal.classList.add('isVisible');els.cropModal.setAttribute('aria-hidden','false');renderCropEditor();els.cropApply.focus();
  }
  function closeCropEditor(){const wasDay=cropDraft?.kind==='day';cropDraft=null;cropDrag=null;els.app.inert=false;els.cropModal.classList.remove('isVisible');els.cropModal.setAttribute('aria-hidden','true');(wasDay?els.cropDayImage:els.cropImage).focus();}
  function resetCropEditor(){if(!cropDraft)return;Object.assign(cropDraft,normalizeImageCrop());renderCropEditor();}
  function applyCropEditor(){
    if(!cropDraft)return;const element=cropDraft.kind==='day'?project.days[cropDraft.id]:project.elements.find(item=>item.id===cropDraft.id);if(!element)return closeCropEditor();
    Object.assign(element,normalizeImageCrop(cropDraft));closeCropEditor();renderAll();pushHistory();save();toast('Recadrage appliqué.');
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
    els.dayImageFit.addEventListener('change',()=>{project.days[selectedDay].imageFit=els.dayImageFit.value;renderCanvas();commit();});
    els.cropDayImage.addEventListener('click',()=>openCropEditor(selectedDay));els.removeDayImage.addEventListener('click',()=>{const day=project.days[selectedDay];Object.assign(day,{imageSrc:'',imageAssetId:'',imageName:'',imageFit:'cover',...normalizeImageCrop()});renderAll();pushHistory();save();toast('Image du jour retirée.');});
    els.backgroundImageInput.addEventListener('change',()=>{importBackgroundImage(els.backgroundImageInput.files?.[0]).catch(()=>toast('Image illisible.'));els.backgroundImageInput.value='';});
    els.backgroundImageFit.addEventListener('change',()=>{project.background.imageFit=els.backgroundImageFit.value;renderCanvas();commit();});
    els.transparentBackground.addEventListener('change',()=>{project.background.transparent=els.transparentBackground.checked;renderBackgroundControls();renderCanvas();commit();toast(project.background.transparent?'Fond transparent activé.':'Fond du planning réactivé.');});
    els.removeBackgroundImage.addEventListener('click',()=>{Object.assign(project.background,{imageSrc:'',imageAssetId:'',imageName:'',imageFit:'cover',...normalizeImageCrop()});renderAll();pushHistory();save();toast('Image de fond retirée.');});
    els.replaceImage.addEventListener('change',()=>{const target=selectedElement();importImage(els.replaceImage.files?.[0],target).catch(()=>toast('Image illisible.'));els.replaceImage.value='';});
    els.cropImage.addEventListener('click',openCropEditor);els.cropClose.addEventListener('click',closeCropEditor);els.cropCancel.addEventListener('click',closeCropEditor);els.cropApply.addEventListener('click',applyCropEditor);els.cropReset.addEventListener('click',resetCropEditor);
    [els.cropZoom,els.cropStretchX,els.cropStretchY].forEach(input=>input.addEventListener('input',updateCropRange));
    els.cropStage.addEventListener('pointerdown',event=>{if(!cropDraft)return;event.preventDefault();cropDrag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:cropDraft.cropX,y:cropDraft.cropY,width:els.cropStage.clientWidth,height:els.cropStage.clientHeight};els.cropStage.setPointerCapture(event.pointerId);});
    els.cropStage.addEventListener('pointermove',event=>{if(!cropDrag||event.pointerId!==cropDrag.pointerId||!cropDraft)return;cropDraft.cropX=clamp(cropDrag.x+(event.clientX-cropDrag.startX)/cropDrag.width*100,-200,200);cropDraft.cropY=clamp(cropDrag.y+(event.clientY-cropDrag.startY)/cropDrag.height*100,-200,200);renderCropEditor();});
    els.cropStage.addEventListener('pointerup',event=>{if(cropDrag?.pointerId===event.pointerId)cropDrag=null;});
    els.cropStage.addEventListener('pointercancel',()=>{cropDrag=null;});
    els.cropStage.addEventListener('wheel',event=>{if(!cropDraft)return;event.preventDefault();cropDraft.cropZoom=clamp(cropDraft.cropZoom+(event.deltaY<0 ? .05 : -.05),.1,3);renderCropEditor();},{passive:false});
    els.showQr.addEventListener('change',()=>{project.showQr=els.showQr.checked;if(project.showQr){let qr=project.elements.find(element=>element.type==='qr');if(!qr){qr=qrElement(project.width,project.height);project.elements.push(qr);}selectedId=qr.id;}else{const removedSelected=selectedElement()?.type==='qr';project.elements=project.elements.filter(element=>element.type!=='qr');if(removedSelected)selectedId='';}renderAll();pushHistory();save();});
    els.qrUrl.addEventListener('input',()=>{project.qrUrl=els.qrUrl.value;renderQrControls();renderCanvas();commit();});
    els.dayStrip.addEventListener('click',event=>{const button=event.target.closest('[data-day]');if(!button)return;selectDayForEditing(Number(button.dataset.day));});
    [els.dayName,els.dayTime,els.dayTitle,els.dayNote].forEach(input=>input.addEventListener('input',updateDay));els.dayStatus.addEventListener('change',updateDay);els.dayStar.addEventListener('change',()=>{updateDay();renderDays();});
    els.title.addEventListener('input',()=>{project.title=els.title.value;const title=project.elements.find(element=>element.role==='title')||project.elements.find(element=>element.type==='text'&&element.y<140&&element.fontSize>50);if(title)title.text=project.title;renderCanvas();commit();});
    els.subtitle.addEventListener('input',()=>{project.subtitle=els.subtitle.value;const subtitle=project.elements.find(element=>element.role==='subtitle')||project.elements.find(element=>element.type==='text'&&element.y>=120&&element.y<220);if(subtitle)subtitle.text=project.subtitle;renderCanvas();commit();});
    els.projectName.addEventListener('input',()=>{project.name=els.projectName.value;save();});
    [els.propX,els.propY,els.propW,els.propH,els.propRotation,els.propText,els.propFontSize,els.propFont,els.propWeight,els.propFontStyle,els.propTransform,els.propAlign,els.propLetterSpacing,els.propTextEffect,els.propColor,els.propFill,els.propOpacity,els.propImageFit,els.propDayLayout,els.propShowDayName,els.propShowDayTime,els.propShowDayTitle,els.propShowDayNote,els.propDayOverlay].forEach(input=>{input.addEventListener(input.tagName==='SELECT'||input.type==='checkbox'?'change':'input',updateSelectedFromProperties);});
    els.typePresetSelect.addEventListener('change',()=>{if(els.typePresetSelect.value)applyTypePresetToPlanning(els.typePresetSelect.value);else resetGlobalTypography();});
    els.modifierSelect.addEventListener('change',()=>{project.modifier=els.modifierSelect.value;project.typePreset='';applyModifierTypography();renderAll();pushHistory();save();toast('Modificateur appliqué.');});
    els.eventBanner.addEventListener('input',()=>{project.eventBanner=els.eventBanner.value;renderCanvas();commit();});
    els.hideModifierLabels.addEventListener('change',()=>{project.hideModifierLabels=els.hideModifierLabels.checked;renderCanvas();commit();});
    els.resetLayout.addEventListener('click',resetTemplateLayout);
    els.applyDayStyleAll.addEventListener('click',()=>{const source=selectedElement();if(source?.type!=='day')return;const keys=['contentLayout','showDayName','showDayTime','showDayTitle','showDayNote','imageOverlay'];project.elements.filter(element=>element.type==='day').forEach(element=>keys.forEach(key=>{element[key]=source[key];}));renderAll();pushHistory();save();toast('Composition appliquée à toutes les cartes.');});
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

  async function start(){await load();await externalizeInlineImages();if(project.showQr&&!project.elements.some(element=>element.type==='qr'))project.elements.push(qrElement(project.width,project.height));bind();history=[JSON.stringify(persistable())];historyIndex=0;renderAll();requestAnimationFrame(fitZoom);save();if(window.PlanningAssetStore){const used=[...project.elements.filter(element=>element.type==='image'&&element.assetId).map(element=>element.assetId),...project.days.map(day=>day.imageAssetId).filter(Boolean),project.background.imageAssetId].filter(Boolean);window.PlanningAssetStore.keepOnly(used).catch(()=>{});}if(missingImageCount)toast(`${missingImageCount} image${missingImageCount>1?'s':''} à remplacer.`);}
  start().catch(error=>{console.error(error);toast('PlanningGPT V2 n’a pas pu démarrer.');});
})();
