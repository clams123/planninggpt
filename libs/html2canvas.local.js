/*
  PlanningGPT - moteur d'export PNG local hors ligne.
  Version corrigée : rendu canvas natif, sans rendu SVG externe.
  Objectif : éviter les canvas "tainted" et conserver un export PNG lisible par getImageData/toBlob.
*/
(function(){
  'use strict';

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
  function num(value, fallback){
    var n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  function relRect(el, rootRect){
    var r = el.getBoundingClientRect();
    return {x:r.left - rootRect.left, y:r.top - rootRect.top, w:r.width, h:r.height};
  }
  function css(el){ return getComputedStyle(el); }
  function textOf(el){ return (el && el.textContent ? el.textContent : '').trim(); }
  function applyTextTransform(text, styles){
    var t = styles.textTransform;
    if (t === 'uppercase') return text.toUpperCase();
    if (t === 'lowercase') return text.toLowerCase();
    return text;
  }
  function px(v, fallback){ return num(v, fallback || 0); }
  function safeColor(value, fallback){
    value = String(value || '').trim();
    if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') return fallback || 'rgba(0,0,0,0)';
    return value;
  }
  function getCssVar(el, name){
    return css(el).getPropertyValue(name).trim();
  }
  function extractColors(input){
    input = String(input || '');
    var matches = input.match(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}/g);
    return matches && matches.length ? matches : [];
  }
  function fillLinear(ctx, x, y, w, h, colors){
    var fill = ctx.createLinearGradient(x, y, x + w, y + h);
    colors.forEach(function(item){ fill.addColorStop(item[0], item[1]); });
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  function fillRadial(ctx, cx, cy, r, colors){
    var fill = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    colors.forEach(function(item){ fill.addColorStop(item[0], item[1]); });
    ctx.fillStyle = fill;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  function drawPlanningThemeBackground(ctx, el, x, y, w, h){
    if (!el || !el.classList || !el.classList.contains('planningCanvas')) return false;

    if (el.classList.contains('theme-crystalfantasy')) {
      fillLinear(ctx, x, y, w, h, [
        [0, '#06101f'],
        [0.48, '#102b52'],
        [1, '#070a1f']
      ]);
      ctx.save();
      ctx.globalAlpha = 0.72;
      fillRadial(ctx, x + w * 0.16, y + h * 0.02, Math.max(w, h) * 0.34, [[0, 'rgba(147,197,253,.34)'], [1, 'rgba(147,197,253,0)']]);
      fillRadial(ctx, x + w * 0.83, y + h * 0.12, Math.max(w, h) * 0.38, [[0, 'rgba(196,181,253,.28)'], [1, 'rgba(196,181,253,0)']]);
      fillRadial(ctx, x + w * 0.55, y + h * 1.05, Math.max(w, h) * 0.28, [[0, 'rgba(56,189,248,.18)'], [1, 'rgba(56,189,248,0)']]);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.86;
      ctx.fillStyle = 'rgba(255,255,255,.90)';
      var stars = [[.08,.18,1.4],[.20,.72,1.2],[.43,.24,1.1],[.65,.78,1.4],[.82,.34,1.2],[.33,.52,.9],[.91,.68,.9]];
      stars.forEach(function(star){
        ctx.beginPath();
        ctx.arc(x + w * star[0], y + h * star[1], Math.max(0.8, star[2] * (w / 1600)), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      return true;
    }

    if (el.classList.contains('theme-horrorvhs')) {
      fillLinear(ctx, x, y, w, h, [
        [0, '#030303'],
        [0.48, '#170507'],
        [1, '#070707']
      ]);
      ctx.save();
      ctx.globalAlpha = 0.7;
      fillRadial(ctx, x + w * 0.5, y - h * 0.15, Math.max(w, h) * 0.46, [[0, 'rgba(190,18,60,.22)'], [1, 'rgba(190,18,60,0)']]);
      fillRadial(ctx, x + w * 0.12, y + h * 0.88, Math.max(w, h) * 0.28, [[0, 'rgba(34,211,238,.08)'], [1, 'rgba(34,211,238,0)']]);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#ffffff';
      var step = Math.max(3, Math.round(h / 180));
      for (var yy = y; yy < y + h; yy += step * 5) ctx.fillRect(x, yy, w, 1);
      ctx.restore();
      return true;
    }

    return false;
  }

  function drawCssBackground(ctx, el, x, y, w, h){
    if (drawPlanningThemeBackground(ctx, el, x, y, w, h)) return;
    var styles = css(el);
    var bgImage = styles.backgroundImage || '';
    var bgColor = safeColor(styles.backgroundColor, 'rgba(0,0,0,0)');
    var colors = extractColors(bgImage);

    if (colors.length >= 2 && bgImage !== 'none') {
      var fill;
      if (bgImage.indexOf('radial-gradient') !== -1) {
        fill = ctx.createRadialGradient(x + w * 0.5, y, 0, x + w * 0.5, y + h * 0.35, Math.max(w, h) * 0.75);
      } else {
        fill = ctx.createLinearGradient(x, y, x + w, y + h);
      }
      colors.forEach(function(color, index){
        fill.addColorStop(colors.length === 1 ? 0 : index / (colors.length - 1), color);
      });
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
      return;
    }

    if (bgColor !== 'rgba(0,0,0,0)') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, h);
    }
  }
  function roundedPath(ctx, x, y, w, h, r){
    r = clamp(r || 0, 0, Math.min(w, h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function drawRoundedBox(ctx, x, y, w, h, r, fill, stroke, lineWidth){
    roundedPath(ctx, x, y, w, h, r);
    if (fill && fill !== 'rgba(0,0,0,0)' && fill !== 'transparent') {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke && stroke !== 'rgba(0,0,0,0)' && stroke !== 'transparent') {
      ctx.lineWidth = lineWidth || 1;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }
  function fontFrom(styles){
    var weight = styles.fontWeight || '700';
    var size = px(styles.fontSize, 16);
    var family = styles.fontFamily || 'Arial, sans-serif';
    return weight + ' ' + size + 'px ' + family;
  }
  function isRenderable(el){
    if (!el || !el.isConnected) return false;
    var styles = css(el);
    if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function normalizeTextAlign(value){
    value = String(value || '').trim();
    if (value === 'start') return 'left';
    if (value === 'end') return 'right';
    if (value !== 'left' && value !== 'center' && value !== 'right') return 'left';
    return value;
  }
  function textMetrics(ctx, size){
    var sample = ctx.measureText('Mg');
    var ascent = sample.actualBoundingBoxAscent || size * 0.78;
    var descent = sample.actualBoundingBoxDescent || size * 0.22;
    return {ascent:ascent, descent:descent, height:ascent + descent};
  }
  function drawTextBlock(ctx, el, rootRect, options){
    if (!isRenderable(el)) return;
    options = options || {};
    var styles = css(el);
    var rect = relRect(el, rootRect);
    var text = applyTextTransform(textOf(el), styles);
    if (!text) return;

    var size = px(styles.fontSize, 16);
    var lineHeight = px(styles.lineHeight, size * 1.15);
    if (!Number.isFinite(lineHeight) || lineHeight <= 0) lineHeight = size * 1.15;
    var align = normalizeTextAlign(options.align || styles.textAlign || 'left');
    var maxWidth = Math.max(4, options.maxWidth || rect.w);
    var x = rect.x;
    if (align === 'center') x = rect.x + rect.w / 2;
    if (align === 'right') x = rect.x + rect.w;

    ctx.save();
    ctx.font = fontFrom(styles);
    ctx.fillStyle = safeColor(styles.color, '#ffffff');
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';

    var lines = [];
    if (options.singleLine) {
      lines = [text];
    } else {
      String(text).split(/\r?\n/).forEach(function(paragraph){
        var words = paragraph.split(/\s+/).filter(Boolean);
        var current = '';
        if (!words.length) {
          lines.push('');
          return;
        }
        words.forEach(function(word){
          var test = current ? current + ' ' + word : word;
          if (ctx.measureText(test).width <= maxWidth || !current) {
            current = test;
          } else {
            lines.push(current);
            current = word;
          }
        });
        if (current) lines.push(current);
      });
    }

    var maxLines = options.maxLines || Math.max(1, Math.floor((rect.h + 1) / lineHeight));
    lines = lines.slice(0, maxLines);

    var metrics = textMetrics(ctx, size);
    var totalLineBox = options.singleLine ? Math.min(lineHeight, rect.h || lineHeight) : lineHeight;
    var startY = rect.y;

    // Le canvas ne place pas les polices exactement comme le navigateur.
    // On recentre les glyphes dans leur boîte CSS pour que les heures, labels
    // et titres exportés retombent au même niveau que dans l'aperçu.
    if (options.verticalCenter || options.singleLine) {
      startY = rect.y + Math.max(0, (rect.h - totalLineBox) / 2);
    }

    lines.forEach(function(line, index){
      var lineTop = startY + index * lineHeight;
      var baseline = lineTop + Math.max(metrics.ascent, (totalLineBox - metrics.height) / 2 + metrics.ascent);
      ctx.fillText(line, x, baseline, maxWidth);
    });
    ctx.restore();
  }
  function drawPillText(ctx, el, rootRect){
    if (!isRenderable(el)) return;
    var styles = css(el);
    var r = relRect(el, rootRect);
    var radius = px(styles.borderRadius, r.h / 2);
    drawRoundedBox(ctx, r.x, r.y, r.w, r.h, radius, safeColor(styles.backgroundColor, 'rgba(255,255,255,.12)'), safeColor(styles.borderTopColor, 'rgba(255,255,255,.22)'), px(styles.borderTopWidth, 1));
    drawTextBlock(ctx, el, rootRect, {align:'center', singleLine:true, verticalCenter:true, maxWidth:Math.max(4, r.w - 8)});
  }
  function extractUrl(value){
    value = String(value || '').trim();
    if (!value || value === 'none') return '';
    var start = value.indexOf('url(');
    if (start === -1) return '';
    var inner = value.slice(start + 4, value.lastIndexOf(')')).trim();
    if ((inner[0] === '"' && inner[inner.length - 1] === '"') || (inner[0] === "'" && inner[inner.length - 1] === "'")) {
      inner = inner.slice(1, -1);
    }
    return inner;
  }
  function loadImage(src){
    return new Promise(function(resolve){
      if (!src || /^data:image\/svg\+xml/i.test(src)) return resolve(null);
      var img = new Image();
      img.onload = function(){ resolve(img); };
      img.onerror = function(){ resolve(null); };
      img.src = src;
    });
  }
  function cropFromCard(card){
    return {
      zoom:clamp(num(getCssVar(card, '--imageCropZoom'), 1), 0.1, 3),
      x:clamp(num(getCssVar(card, '--imageCropX'), 0), -100, 100),
      y:clamp(num(getCssVar(card, '--imageCropY'), 0), -100, 100),
      stretchX:clamp(num(getCssVar(card, '--imageCropStretchX'), 1), 0.5, 3),
      stretchY:clamp(num(getCssVar(card, '--imageCropStretchY'), 1), 0.5, 3)
    };
  }
  function drawImageFit(ctx, img, x, y, w, h, fit, position, crop){
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    crop = crop || {zoom:1, x:0, y:0};
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var baseScale = fit === 'contain' ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih);
    var finalScale = baseScale * clamp(num(crop.zoom, 1), 0.1, 3);
    var stretchX = clamp(num(crop.stretchX, 1), 0.5, 3);
    var stretchY = clamp(num(crop.stretchY, 1), 0.5, 3);
    var dw = iw * finalScale * stretchX, dh = ih * finalScale * stretchY;
    var px = 0.5, py = 0.5;
    position = String(position || 'center center');
    if (position.indexOf('left') !== -1) px = 0;
    if (position.indexOf('right') !== -1) px = 1;
    if (position.indexOf('top') !== -1) py = 0;
    if (position.indexOf('bottom') !== -1) py = 1;
    var dx = x + (w - dw) * px + (clamp(num(crop.x, 0), -100, 100) / 100) * w;
    var dy = y + (h - dh) * py + (clamp(num(crop.y, 0), -100, 100) / 100) * h;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }
  function drawCard(ctx, card, rootRect){
    var styles = css(card);
    var r = relRect(card, rootRect);
    var radius = px(styles.borderTopLeftRadius, 16);
    var stroke = safeColor(styles.borderTopColor, 'rgba(255,255,255,.2)');
    var lineWidth = px(styles.borderTopWidth, 1);

    if (card.classList.contains('isHighlighted')) {
      ctx.save();
      ctx.globalAlpha = 0.32;
      drawRoundedBox(ctx, r.x - 10, r.y - 10, r.w + 20, r.h + 20, radius + 10, null, stroke, Math.max(4, lineWidth * 3));
      ctx.globalAlpha = 0.18;
      drawRoundedBox(ctx, r.x - 22, r.y - 22, r.w + 44, r.h + 44, radius + 22, null, stroke, Math.max(8, lineWidth * 5));
      ctx.restore();
    }

    ctx.save();
    roundedPath(ctx, r.x, r.y, r.w, r.h, radius);
    ctx.clip();

    drawCssBackground(ctx, card, r.x, r.y, r.w, r.h);

    var bg = extractUrl(getCssVar(card, '--exportDayImage') || getCssVar(card, '--dayImage') || styles.backgroundImage);
    var fit = getCssVar(card, '--imageFit') || styles.backgroundSize || 'cover';
    var pos = getCssVar(card, '--imagePosition') || styles.backgroundPosition || 'center center';
    if (bg) {
      // Le dessin d'image est asynchrone dans la fonction principale.
      // Ici, l'image est dessinée plus tard via la promesse attachée au canvas.
    }
    ctx.restore();

    drawRoundedBox(ctx, r.x, r.y, r.w, r.h, radius, null, stroke, lineWidth);

    if (card.classList.contains('isToday')) {
      ctx.save();
      ctx.lineWidth = Math.max(2, Math.round(Math.min(r.w, r.h) * 0.016));
      ctx.strokeStyle = 'rgba(56,189,248,.72)';
      drawRoundedBox(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, Math.max(2, radius - 4), null, ctx.strokeStyle, ctx.lineWidth);
      ctx.restore();
    }

    if (card.classList.contains('isStar')) {
      ctx.save();
      ctx.lineWidth = Math.max(2, Math.round(Math.min(r.w, r.h) * 0.018));
      ctx.strokeStyle = 'rgba(250,204,21,.48)';
      drawRoundedBox(ctx, r.x + 6, r.y + 6, r.w - 12, r.h - 12, Math.max(2, radius - 6), null, ctx.strokeStyle, ctx.lineWidth);
      ctx.restore();
    }
  }
  function drawCardTexts(ctx, card, rootRect){
    if (!card) return;
    var cs = css(card);
    var cr = relRect(card, rootRect);
    ctx.save();
    roundedPath(ctx, cr.x, cr.y, cr.w, cr.h, px(cs.borderTopLeftRadius, 16));
    ctx.clip();

    var dayName = card.querySelector('.dayName span') || card.querySelector('.dayName');
    drawTextBlock(ctx, dayName, rootRect, {align:css(card.querySelector('.dayName') || card).textAlign || 'center', singleLine:true, verticalCenter:true});
    drawPillText(ctx, card.querySelector('.dayStatus'), rootRect);
    drawPillText(ctx, card.querySelector('.starBadge'), rootRect);
    drawPillText(ctx, card.querySelector('.highlightBadge'), rootRect);
    drawPillText(ctx, card.querySelector('.specialLabel'), rootRect);
    drawTextBlock(ctx, card.querySelector('.streamTime'), rootRect, {singleLine:true, verticalCenter:true});
    drawTextBlock(ctx, card.querySelector('.streamTitle'), rootRect, {maxLines:2});
    drawTextBlock(ctx, card.querySelector('.streamNote'), rootRect, {maxLines:3});

    ctx.restore();
  }
  function drawEventBanner(ctx, banner, rootRect){
    if (!banner || !banner.classList.contains('isVisible') || !textOf(banner)) return;
    var styles = css(banner);
    var r = relRect(banner, rootRect);
    if (r.w <= 0 || r.h <= 0) return;
    drawRoundedBox(ctx, r.x, r.y, r.w, r.h, px(styles.borderRadius, r.h / 2), safeColor(styles.backgroundColor, 'rgba(255,255,255,.14)'), safeColor(styles.borderTopColor, 'rgba(255,255,255,.28)'), px(styles.borderTopWidth, 1));
    drawTextBlock(ctx, banner, rootRect, {align:'center', singleLine:true, maxWidth:Math.max(4, r.w - 12)});
  }

  function drawQr(ctx, qrBox, rootRect){
    if (!qrBox || !qrBox.classList.contains('isVisible')) return;
    var styles = css(qrBox);
    var r = relRect(qrBox, rootRect);
    drawRoundedBox(ctx, r.x, r.y, r.w, r.h, px(styles.borderRadius, 12), safeColor(styles.backgroundColor, '#ffffff'), safeColor(styles.borderTopColor, 'rgba(0,0,0,.2)'), px(styles.borderTopWidth, 1));

    var svg = qrBox.querySelector('svg');
    if (svg) {
      var vb = (svg.getAttribute('viewBox') || '0 0 100 100').split(/\s+/).map(Number);
      var vbW = vb[2] || 100;
      var vbH = vb[3] || 100;
      var codeRect = qrBox.querySelector('.qrBox__code') ? relRect(qrBox.querySelector('.qrBox__code'), rootRect) : {x:r.x + 6, y:r.y + 6, w:r.h - 12, h:r.h - 12};
      ctx.fillStyle = '#fff';
      ctx.fillRect(codeRect.x, codeRect.y, codeRect.w, codeRect.h);
      var path = svg.querySelector('path');
      var d = path ? path.getAttribute('d') || '' : '';
      var cellRe = /M([\d.]+)\s+([\d.]+)h([\d.]+)v([\d.]+)h-[\d.]+z/g;
      var m;
      ctx.fillStyle = '#111827';
      while ((m = cellRe.exec(d))) {
        var x = Number(m[1]) / vbW;
        var y = Number(m[2]) / vbH;
        var w = Number(m[3]) / vbW;
        var h = Number(m[4]) / vbH;
        ctx.fillRect(codeRect.x + x * codeRect.w, codeRect.y + y * codeRect.h, Math.ceil(w * codeRect.w), Math.ceil(h * codeRect.h));
      }
    }
    drawTextBlock(ctx, qrBox.querySelector('span'), rootRect, {align:'center', singleLine:true});
  }
  async function renderPlanningCanvas(node, options){
    options = options || {};
    var rect = node.getBoundingClientRect();
    var width = Math.max(1, Math.ceil(rect.width));
    var height = Math.max(1, Math.ceil(rect.height));
    var scale = Number(options.scale || 1);
    if (!Number.isFinite(scale) || scale <= 0) scale = 1;

    var canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    drawCssBackground(ctx, node, 0, 0, width, height);

    var cards = Array.prototype.slice.call(node.querySelectorAll('.dayCard'));
    cards.sort(function(a, b){
      return (a.classList.contains('isHighlighted') ? 1 : 0) - (b.classList.contains('isHighlighted') ? 1 : 0);
    });
    cards.forEach(function(card){ drawCard(ctx, card, rect); });

    // Images des cartes : chargées avant les textes pour garder la lisibilité des libellés.
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var cr = relRect(card, rect);
      var cs = css(card);
      var src = extractUrl(getCssVar(card, '--exportDayImage') || getCssVar(card, '--dayImage') || cs.backgroundImage);
      if (!src) continue;
      var img = await loadImage(src);
      if (!img) continue;
      ctx.save();
      roundedPath(ctx, cr.x, cr.y, cr.w, cr.h, px(cs.borderTopLeftRadius, 16));
      ctx.clip();
      drawImageFit(ctx, img, cr.x, cr.y, cr.w, cr.h, getCssVar(card, '--imageFit') || cs.backgroundSize, getCssVar(card, '--imagePosition') || cs.backgroundPosition, cropFromCard(card));
      // Léger voile pour préserver la lisibilité, similaire aux rendus CSS existants.
      ctx.fillStyle = card.classList.contains('isTransparent') ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.16)';
      ctx.fillRect(cr.x, cr.y, cr.w, cr.h);
      ctx.restore();
    }

    // On redessine les contours après les images pour éviter qu'elles masquent les bordures.
    cards.forEach(function(card){
      var cs = css(card);
      var cr = relRect(card, rect);
      drawRoundedBox(ctx, cr.x, cr.y, cr.w, cr.h, px(cs.borderTopLeftRadius, 16), null, safeColor(cs.borderTopColor, 'rgba(255,255,255,.2)'), px(cs.borderTopWidth, 1));
    });

    // Hero au-dessus du fond.
    drawTextBlock(ctx, node.querySelector('.canvasHero span'), rect, {singleLine:true});
    drawTextBlock(ctx, node.querySelector('.canvasHero h2'), rect, {maxLines:2});
    drawTextBlock(ctx, node.querySelector('.canvasHero p'), rect, {singleLine:true});
    drawEventBanner(ctx, node.querySelector('.eventBanner'), rect);

    cards.forEach(function(card){ drawCardTexts(ctx, card, rect); });
    drawQr(ctx, node.querySelector('.qrBox'), rect);

    return canvas;
  }

  window.html2canvas = function(node, options){
    return new Promise(function(resolve, reject){
      try{
        if (!node) throw new Error('Aucun élément à exporter.');
        renderPlanningCanvas(node, options || {}).then(resolve).catch(reject);
      }catch(err){
        reject(err);
      }
    });
  };
})();
