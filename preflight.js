(function(root){
  'use strict';

  function channel(value){value/=255;return value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4);}
  function luminance(color){
    const match=String(color||'').trim().match(/^#([0-9a-f]{6})$/i);if(!match)return null;
    const value=parseInt(match[1],16);return .2126*channel(value>>16)+.7152*channel((value>>8)&255)+.0722*channel(value&255);
  }
  function contrast(first,second){
    const a=luminance(first),b=luminance(second);if(a===null||b===null)return null;
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  }
  function visible(element){return element&&element.opacity!==0&&!element.hidden;}
  function intersectionRatio(a,b){
    const width=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)),height=Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    const overlap=width*height,smallest=Math.min(Math.max(1,a.w*a.h),Math.max(1,b.w*b.h));return overlap/smallest;
  }
  function inspectProject(project,context={}){
    const issues=[],elements=(project?.elements||[]).filter(visible),width=Number(project?.width)||0,height=Number(project?.height)||0;
    const issue=(code,label,elementId='',extra={})=>issues.push({code,label,elementId,...extra});
    for(const id of context.missingImageIds||[])issue('missing-image','Image introuvable',id);
    if(project?.showQr&&context.qrValid===false)issue('invalid-qr','Lien du QR Code invalide','');
    for(const element of elements){
      if(element.type!=='shape'&&(element.x<0||element.y<0||element.x+element.w>width||element.y+element.h>height))issue('outside','Élément hors du planning',element.id);
    }
    for(const id of context.overflowIds||[])issue('overflow','Texte potentiellement coupé',id);
    for(const element of elements){
      if(element.type==='text'&&!element.builtIn&&Number(element.fontSize)<16)issue('small-text','Texte très petit à l’export',element.id);
    }
    for(const element of elements){
      if(element.type!=='day')continue;const ratio=contrast(element.color,element.fill);
      if(ratio!==null&&ratio<3)issue('low-contrast','Contraste faible',element.id);
    }
    const custom=elements.filter(element=>!element.builtIn&&['text','image','emoji'].includes(element.type));
    for(let index=0;index<custom.length;index++)for(let other=0;other<index;other++)if(intersectionRatio(custom[index],custom[other])>=.6){issue('overlap','Éléments personnalisés fortement superposés',custom[index].id,{relatedElementId:custom[other].id});break;}
    return issues;
  }

  root.PlanningPreflight={inspectProject,contrast};
})(typeof window==='undefined'?globalThis:window);
