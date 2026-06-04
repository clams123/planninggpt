/*
  PlanningGPT - moteur d'export PNG local hors ligne.
  Version V30.33 : rendu canvas natif, correction Fantasy Ciel Étoilé à l’export.
  Objectif : éviter les canvas "tainted", conserver l’export PNG local et rapprocher les modificateurs de l’aperçu sans foncer le thème de base.
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
  function cssPseudoContent(el, pseudo){
    if (!el) return '';
    var raw = '';
    try { raw = getComputedStyle(el, pseudo).content || ''; } catch(e) { return ''; }
    raw = String(raw).trim();
    if (!raw || raw === 'none' || raw === 'normal' || raw === 'initial' || raw === 'inherit' || raw === '""' || raw === "''") return '';

    if ((raw[0] === '"' && raw[raw.length - 1] === '"') || (raw[0] === "'" && raw[raw.length - 1] === "'")) {
      raw = raw.slice(1, -1);
    }

    return raw
      .replace(/\\A/g, '\n')
      .replace(/\\a/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\');
  }
  function textOf(el){
    if (!el) return '';
    return (cssPseudoContent(el, '::before') + (el.textContent || '') + cssPseudoContent(el, '::after')).trim();
  }
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
    return normalizeCanvasColor(value, fallback);
  }
  function getCssVar(el, name){
    return css(el).getPropertyValue(name).trim();
  }
  function resolveCssVars(el, value){
    value = String(value || '');
    for (var i = 0; i < 6 && value.indexOf('var(') !== -1; i++) {
      value = value.replace(/var\((--[A-Za-z0-9_-]+)(?:,[^)]+)?\)/g, function(_, name){
        return getCssVar(el, name) || 'transparent';
      });
    }
    return value;
  }
  function extractColors(input){
    input = String(input || '');
    var matches = input.match(/color\([^)]*\)|rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}|transparent/g);
    return matches && matches.length ? matches : [];
  }
  function normalizeCanvasColor(value, fallback){
    value = String(value || '').trim();
    if (!value || value === 'none') return fallback || 'rgba(0,0,0,0)';
    if (value === 'transparent') return 'rgba(0,0,0,0)';

    // Chrome peut retourner les couleurs calculées des color-mix() sous la forme
    // color(srgb r g b / a). Le canvas accepte mal cette syntaxe selon les
    // versions : on la convertit en rgba() pour que les modificateurs gardent
    // leurs bandes, contours et halos à l'export.
    var srgb = value.match(/^color\(\s*srgb\s+([^\s]+)\s+([^\s]+)\s+([^\s\/]+)(?:\s*\/\s*([^\)]+))?\s*\)$/i);
    if (srgb) {
      var r = Math.round(clamp(parseFloat(srgb[1]), 0, 1) * 255);
      var g = Math.round(clamp(parseFloat(srgb[2]), 0, 1) * 255);
      var b = Math.round(clamp(parseFloat(srgb[3]), 0, 1) * 255);
      var aRaw = srgb[4] == null ? 1 : String(srgb[4]).trim();
      var a = aRaw.indexOf('%') !== -1 ? parseFloat(aRaw) / 100 : parseFloat(aRaw);
      if (!Number.isFinite(a)) a = 1;
      return 'rgba(' + r + ',' + g + ',' + b + ',' + clamp(a, 0, 1) + ')';
    }

    // Les exports anciens ou certains navigateurs peuvent garder rgb() séparé
    // par espaces : rgb(255 255 255 / .5). On normalise aussi ce cas.
    var spaceRgb = value.match(/^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([^\)]+))?\s*\)$/i);
    if (spaceRgb) {
      var rr = Math.round(clamp(parseFloat(spaceRgb[1]), 0, 255));
      var gg = Math.round(clamp(parseFloat(spaceRgb[2]), 0, 255));
      var bb = Math.round(clamp(parseFloat(spaceRgb[3]), 0, 255));
      var aaRaw = spaceRgb[4] == null ? 1 : String(spaceRgb[4]).trim();
      var aa = aaRaw.indexOf('%') !== -1 ? parseFloat(aaRaw) / 100 : parseFloat(aaRaw);
      if (!Number.isFinite(aa)) aa = 1;
      return 'rgba(' + rr + ',' + gg + ',' + bb + ',' + clamp(aa, 0, 1) + ')';
    }

    return value;
  }
  function alphaColor(color, alpha){
    color = String(color || '').trim();
    alpha = clamp(Number(alpha), 0, 1);
    if (!color || color === 'transparent') return 'rgba(0,0,0,0)';
    var hex = color.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (hex) {
      var h = hex[1];
      if (h.length === 3) h = h.split('').map(function(c){ return c + c; }).join('');
      var r = parseInt(h.slice(0,2), 16);
      var g = parseInt(h.slice(2,4), 16);
      var b = parseInt(h.slice(4,6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }
    var rgb = color.match(/^rgba?\(([^)]+)\)$/);
    if (rgb) {
      var parts = rgb[1].split(',').map(function(v){ return parseFloat(v); });
      if (parts.length >= 3) return 'rgba(' + parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + alpha + ')';
    }
    return color;
  }
  function colorFromStopPart(part){
    part = String(part || '').trim();
    var mix = part.match(/color-mix\(\s*in\s+srgb\s*,\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|color\([^)]*\))\s+(-?\d+(?:\.\d+)?)%\s*,\s*transparent\s*\)/i);
    if (mix) return alphaColor(mix[1], parseFloat(mix[2]) / 100);
    mix = part.match(/color-mix\(\s*in\s+srgb\s*,\s*transparent\s*,\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|color\([^)]*\))\s+(-?\d+(?:\.\d+)?)%\s*\)/i);
    if (mix) return alphaColor(mix[1], parseFloat(mix[2]) / 100);
    var colors = extractColors(part);
    return colors[0] || 'rgba(0,0,0,0)';
  }
  function splitTopLevel(value, separator){
    value = String(value || '');
    separator = separator || ',';
    var parts = [];
    var current = '';
    var depth = 0;
    var quote = '';
    for (var i = 0; i < value.length; i++){
      var ch = value[i];
      if (quote) {
        current += ch;
        if (ch === quote && value[i - 1] !== '\\') quote = '';
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; current += ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') depth = Math.max(0, depth - 1);
      if (ch === separator && depth === 0) {
        if (current.trim()) parts.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }
  function gradientBody(layer){
    var start = layer.indexOf('(');
    var end = layer.lastIndexOf(')');
    return start >= 0 && end > start ? layer.slice(start + 1, end) : '';
  }
  function parseStop(part, fallbackIndex, fallbackCount){
    part = String(part || '').trim();
    var color = colorFromStopPart(part);
    var rest = part;
    if (/color-mix\(/i.test(rest)) rest = rest.slice(rest.lastIndexOf(')') + 1);
    else rest = rest.replace(color, '');
    rest = rest.trim();
    var pctMatches = rest.match(/(-?\d+(?:\.\d+)?)%/g);
    var fallback = fallbackCount <= 1 ? 0 : fallbackIndex / (fallbackCount - 1);
    var normalizedColor = normalizeCanvasColor(color);

    // Les modificateurs utilisent souvent des arrêts CSS doubles :
    // ex. transparent 12% 88%. Canvas a besoin des deux arrêts pour garder
    // les bandes nettes du mode Ticket / Subathon / Challenge.
    if (pctMatches && pctMatches.length >= 2) {
      var first = clamp(parseFloat(pctMatches[0]) / 100, 0, 1);
      var second = clamp(parseFloat(pctMatches[pctMatches.length - 1]) / 100, 0, 1);
      return [
        {color:normalizedColor, stop:first},
        {color:normalizedColor, stop:Math.max(first, second)}
      ];
    }

    var pct = pctMatches && pctMatches.length ? parseFloat(pctMatches[0]) / 100 : fallback;
    if (!Number.isFinite(pct)) pct = fallback;
    return [{color:normalizedColor, stop:clamp(pct, 0, 1)}];
  }
  function normalizeStops(parts, startIndex){
    var raw = parts.slice(startIndex || 0).filter(function(part){ return extractColors(part).length; });
    if (!raw.length) return [];
    var stops = [];
    raw.forEach(function(part, index){
      parseStop(part, index, raw.length).forEach(function(stop){ stops.push(stop); });
    });
    // Les stops CSS peuvent être omis ou répétés. On force seulement la progression,
    // sans supprimer les doublons indispensables aux transitions franches.
    for (var i = 1; i < stops.length; i++){
      if (stops[i].stop < stops[i - 1].stop) stops[i].stop = stops[i - 1].stop;
    }
    if (stops[0].stop > 0.001) stops.unshift({color:stops[0].color, stop:0});
    var last = stops[stops.length - 1];
    if (last.stop < 0.999) stops.push({color:last.color, stop:1});
    return stops;
  }
  function angleFromLinearHeader(header){
    header = String(header || '').trim().toLowerCase();
    var m = header.match(/(-?\d+(?:\.\d+)?)deg/);
    if (m) return parseFloat(m[1]);
    if (header.indexOf('to right') !== -1) return 90;
    if (header.indexOf('to left') !== -1) return 270;
    if (header.indexOf('to top') !== -1) return 0;
    if (header.indexOf('to bottom') !== -1) return 180;
    return 180;
  }
  function linearGradientCoords(x, y, w, h, angleDeg){
    // Approximation stable de l'angle CSS : suffisante pour que l'export suive les thèmes.
    var rad = (angleDeg - 90) * Math.PI / 180;
    var dx = Math.cos(rad);
    var dy = Math.sin(rad);
    var len = Math.abs(w * dx) + Math.abs(h * dy);
    var cx = x + w / 2;
    var cy = y + h / 2;
    return {x0:cx - dx * len / 2, y0:cy - dy * len / 2, x1:cx + dx * len / 2, y1:cy + dy * len / 2};
  }
  function applyStops(fill, stops){
    if (!stops.length) return false;
    stops.forEach(function(stop){
      try { fill.addColorStop(clamp(stop.stop, 0, 1), stop.color); } catch(e) {}
    });
    return true;
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
  function drawLinearLayer(ctx, layer, x, y, w, h){
    var body = gradientBody(layer);
    var parts = splitTopLevel(body);
    if (!parts.length) return false;
    var header = parts[0];
    var firstHasColor = extractColors(header).length > 0;
    var angle = firstHasColor ? 180 : angleFromLinearHeader(header);
    var stops = normalizeStops(parts, firstHasColor ? 0 : 1);
    if (stops.length < 2) return false;
    var c = linearGradientCoords(x, y, w, h, angle);
    var fill = ctx.createLinearGradient(c.x0, c.y0, c.x1, c.y1);
    applyStops(fill, stops);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    return true;
  }
  function drawRadialLayer(ctx, layer, x, y, w, h){
    var body = gradientBody(layer);
    var parts = splitTopLevel(body);
    if (!parts.length) return false;
    var header = parts[0];
    var firstHasColor = extractColors(header).length > 0;
    var start = firstHasColor ? 0 : 1;
    var cx = x + w * 0.5;
    var cy = y + h * 0.5;
    if (!firstHasColor && header.indexOf('at') !== -1) {
      var afterAt = header.split('at').pop();
      var nums = afterAt.match(/-?\d+(?:\.\d+)?%/g);
      if (nums && nums.length >= 2) {
        cx = x + w * (parseFloat(nums[0]) / 100);
        cy = y + h * (parseFloat(nums[1]) / 100);
      }
    }
    var stops = normalizeStops(parts, start);
    if (stops.length < 2) return false;
    var radius = Math.max(w, h) * 0.75;
    var fill = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    applyStops(fill, stops);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    return true;
  }
  function drawRepeatingLinearLayer(ctx, layer, x, y, w, h){
    var body = gradientBody(layer);
    var parts = splitTopLevel(body);
    if (!parts.length) return false;
    var angle = extractColors(parts[0]).length ? 180 : angleFromLinearHeader(parts[0]);
    var color = extractColors(body)[0] || 'rgba(255,255,255,.08)';
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = normalizeCanvasColor(color);
    var step = Math.max(4, Math.min(w, h) / 120);
    var thick = Math.max(1, step * 0.18);
    if (Math.abs(angle % 180) < 1) {
      for (var yy = y; yy <= y + h; yy += step) ctx.fillRect(x, yy, w, thick);
    } else if (Math.abs((angle - 90) % 180) < 1) {
      for (var xx = x; xx <= x + w; xx += step) ctx.fillRect(xx, y, thick, h);
    } else {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((angle - 90) * Math.PI / 180);
      for (var i = -w - h; i <= w + h; i += step) ctx.fillRect(i, -h - w, thick, h * 2 + w * 2);
    }
    ctx.restore();
    return true;
  }
  function drawCssBackgroundLayers(ctx, bgImage, bgColor, x, y, w, h){
    var drew = false;
    if (bgColor && bgColor !== 'rgba(0,0,0,0)' && bgColor !== 'transparent') {
      ctx.fillStyle = normalizeCanvasColor(bgColor);
      ctx.fillRect(x, y, w, h);
      drew = true;
    }
    var layers = splitTopLevel(bgImage || '');
    if (!layers.length || bgImage === 'none') return drew;
    // CSS dessine la première couche au-dessus. Canvas doit donc partir de la dernière.
    layers.reverse().forEach(function(layer){
      layer = layer.trim();
      if (!layer || layer === 'none' || layer.indexOf('var(--dayImage)') !== -1) return;
      if (layer.indexOf('repeating-linear-gradient') === 0) { drew = drawRepeatingLinearLayer(ctx, layer, x, y, w, h) || drew; return; }
      if (layer.indexOf('linear-gradient') === 0) { drew = drawLinearLayer(ctx, layer, x, y, w, h) || drew; return; }
      if (layer.indexOf('radial-gradient') === 0) { drew = drawRadialLayer(ctx, layer, x, y, w, h) || drew; return; }
    });
    return drew;
  }
  function drawEllipseRadialGlow(ctx, x, y, w, h, cxPct, cyPct, rxCqw, ryCqw, stops){
    var cqw = Math.max(1, w / 100);
    var rx = Math.max(1, rxCqw * cqw);
    var ry = Math.max(1, ryCqw * cqw);
    var cx = x + w * cxPct;
    var cy = y + h * cyPct;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.scale(rx, ry);
    var fill = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    stops.forEach(function(stop){
      try { fill.addColorStop(clamp(stop[0], 0, 1), stop[1]); } catch(e) {}
    });
    ctx.fillStyle = fill;
    ctx.fillRect((x - cx) / rx, (y - cy) / ry, w / rx, h / ry);
    ctx.restore();
  }

  function drawCrystalFantasyBase(ctx, x, y, w, h){
    // V30.33 : correction ciblée Fantasy Ciel Étoilé.
    // Les radial-gradient CSS en cqw + les mini étoiles du ::before étaient
    // interprétés comme d'énormes halos blancs par le moteur canvas.
    // On redessine donc le fond du thème avec des ellipses bornées, ce qui
    // garde le rendu sombre/bleuté visible dans l'aperçu.
    var linear = ctx.createLinearGradient(x, y, x + w, y + h);
    linear.addColorStop(0, '#06101f');
    linear.addColorStop(0.48, '#102b52');
    linear.addColorStop(1, '#070a1f');
    ctx.fillStyle = linear;
    ctx.fillRect(x, y, w, h);

    drawEllipseRadialGlow(ctx, x, y, w, h, 0.16, 0.02, 34, 25, [
      [0, 'rgba(147,197,253,.34)'],
      [0.70, 'rgba(147,197,253,0)'],
      [1, 'rgba(147,197,253,0)']
    ]);
    drawEllipseRadialGlow(ctx, x, y, w, h, 0.83, 0.12, 40, 30, [
      [0, 'rgba(196,181,253,.28)'],
      [0.73, 'rgba(196,181,253,0)'],
      [1, 'rgba(196,181,253,0)']
    ]);
    drawEllipseRadialGlow(ctx, x, y, w, h, 0.55, 1.05, 32, 22, [
      [0, 'rgba(56,189,248,.18)'],
      [0.70, 'rgba(56,189,248,0)'],
      [1, 'rgba(56,189,248,0)']
    ]);
  }

  function drawCrystalFantasyStars(ctx, x, y, w, h){
    var cqw = Math.max(1, w / 100);
    ctx.save();
    ctx.globalAlpha *= 0.9;

    var overlay = ctx.createLinearGradient(x, y, x + w, y + h);
    overlay.addColorStop(0, 'rgba(255,255,255,.08)');
    overlay.addColorStop(0.42, 'rgba(255,255,255,0)');
    overlay.addColorStop(1, 'rgba(125,211,252,.06)');
    ctx.fillStyle = overlay;
    ctx.fillRect(x, y, w, h);

    var stars = [
      [0.08,0.18,0.07,'rgba(255,255,255,.95)'],
      [0.20,0.72,0.06,'rgba(186,230,253,.95)'],
      [0.43,0.24,0.055,'rgba(255,255,255,.85)'],
      [0.65,0.78,0.07,'rgba(196,181,253,.90)'],
      [0.82,0.34,0.06,'rgba(255,255,255,.92)']
    ];
    stars.forEach(function(star){
      var r = Math.max(0.75, star[2] * cqw);
      var sx = x + w * star[0];
      var sy = y + h * star[1];
      var fill = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 1.45);
      fill.addColorStop(0, star[3]);
      fill.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 1.45, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawPlanningThemeBackground(ctx, el, x, y, w, h){
    if (!el || !el.classList || !el.classList.contains('planningCanvas')) return false;
    // Le moteur sait maintenant lire les fonds CSS en couches. Certains thèmes
    // très complexes gardent une correction ciblée quand le CSS contient des
    // unités/pseudo-éléments que le canvas ne peut pas reproduire directement.
    if (el.classList.contains('theme-crystalfantasy')) {
      drawCrystalFantasyBase(ctx, x, y, w, h);
      return true;
    }

    var styles = css(el);
    var drew = drawCssBackgroundLayers(ctx, styles.backgroundImage || getCssVar(el, '--canvasBg'), safeColor(styles.backgroundColor, 'rgba(0,0,0,0)'), x, y, w, h);

    if (el.classList.contains('theme-horrorvhs')) {
      ctx.save();
      ctx.globalAlpha = 0.23;
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      var step = Math.max(4, h / 190);
      for (var yy = y; yy < y + h; yy += step) ctx.fillRect(x, yy, w, 1);
      ctx.restore();
      return true;
    }

    return drew;
  }

  function drawCssBackground(ctx, el, x, y, w, h){
    if (drawPlanningThemeBackground(ctx, el, x, y, w, h)) return;
    var styles = css(el);
    var bgImage = resolveCssVars(el, styles.backgroundImage || '');
    var bgColor = safeColor(resolveCssVars(el, styles.backgroundColor || ''), 'rgba(0,0,0,0)');
    if (drawCssBackgroundLayers(ctx, bgImage, bgColor, x, y, w, h)) return;
  }
  function drawPseudoBackground(ctx, el, pseudo, x, y, w, h){
    if (!el) return;
    var styles;
    try { styles = getComputedStyle(el, pseudo); } catch(e) { return; }
    if (!styles || styles.content === 'none' || styles.content === 'normal') return;

    if (pseudo === '::before' && el.classList && el.classList.contains('theme-crystalfantasy')) {
      var fantasyOpacity = num(styles.opacity, 1);
      ctx.save();
      ctx.globalAlpha *= clamp(fantasyOpacity, 0, 1);
      drawCrystalFantasyStars(ctx, x, y, w, h);
      ctx.restore();
      return;
    }

    var opacity = num(styles.opacity, 1);
    ctx.save();
    ctx.globalAlpha *= clamp(opacity, 0, 1);
    drawCssBackgroundLayers(ctx, resolveCssVars(el, styles.backgroundImage || ''), safeColor(resolveCssVars(el, styles.backgroundColor || ''), 'rgba(0,0,0,0)'), x, y, w, h);
    ctx.restore();
  }
  function normalizeRadii(r, w, h){
    var max = Math.min(w, h) / 2;
    if (r && typeof r === 'object') {
      return {
        tl:clamp(num(r.tl, 0), 0, max),
        tr:clamp(num(r.tr, 0), 0, max),
        br:clamp(num(r.br, 0), 0, max),
        bl:clamp(num(r.bl, 0), 0, max)
      };
    }
    var v = clamp(r || 0, 0, max);
    return {tl:v, tr:v, br:v, bl:v};
  }
  function adjustRadii(r, delta){
    if (r && typeof r === 'object') {
      return {
        tl:Math.max(0, num(r.tl, 0) + delta),
        tr:Math.max(0, num(r.tr, 0) + delta),
        br:Math.max(0, num(r.br, 0) + delta),
        bl:Math.max(0, num(r.bl, 0) + delta)
      };
    }
    return Math.max(0, num(r, 0) + delta);
  }
  function radiiFromStyles(styles, fallback){
    fallback = fallback || 0;
    return {
      tl:px(styles.borderTopLeftRadius, fallback),
      tr:px(styles.borderTopRightRadius, fallback),
      br:px(styles.borderBottomRightRadius, fallback),
      bl:px(styles.borderBottomLeftRadius, fallback)
    };
  }
  function roundedPath(ctx, x, y, w, h, r){
    var rr = normalizeRadii(r, w, h);
    ctx.beginPath();
    ctx.moveTo(x + rr.tl, y);
    ctx.lineTo(x + w - rr.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr.tr);
    ctx.lineTo(x + w, y + h - rr.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr.br, y + h);
    ctx.lineTo(x + rr.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr.bl);
    ctx.lineTo(x, y + rr.tl);
    ctx.quadraticCurveTo(x, y, x + rr.tl, y);
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
  function drawStyledRoundedBorder(ctx, x, y, w, h, r, color, lineWidth, style){
    if (!color || color === 'rgba(0,0,0,0)' || color === 'transparent') return;
    lineWidth = Math.max(1, lineWidth || 1);
    style = String(style || 'solid').toLowerCase();

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (style === 'dashed') ctx.setLineDash([Math.max(6, lineWidth * 5), Math.max(4, lineWidth * 3)]);
    if (style === 'dotted') ctx.setLineDash([Math.max(1, lineWidth * 1.2), Math.max(3, lineWidth * 3)]);

    if (style === 'double' && Math.min(w, h) > lineWidth * 8) {
      ctx.setLineDash([]);
      roundedPath(ctx, x + lineWidth * 0.6, y + lineWidth * 0.6, w - lineWidth * 1.2, h - lineWidth * 1.2, adjustRadii(r, -lineWidth * 0.6));
      ctx.stroke();
      roundedPath(ctx, x + lineWidth * 2.4, y + lineWidth * 2.4, w - lineWidth * 4.8, h - lineWidth * 4.8, adjustRadii(r, -lineWidth * 2.4));
      ctx.stroke();
    } else {
      roundedPath(ctx, x, y, w, h, r);
      ctx.stroke();
    }
    ctx.restore();
  }
  function applyElementRotation(ctx, el, rect){
    var styles = css(el);
    var transform = styles.transform || '';
    if (!transform || transform === 'none') return false;
    var match = transform.match(/matrix\(([^)]+)\)/);
    if (!match) return false;
    var values = match[1].split(',').map(function(v){ return parseFloat(v); });
    if (values.length < 2 || !Number.isFinite(values[0]) || !Number.isFinite(values[1])) return false;
    var angle = Math.atan2(values[1], values[0]);
    if (Math.abs(angle) < 0.001) return false;
    ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.rotate(angle);
    ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    return true;
  }
  function parseFirstShadowColor(value){
    var colors = extractColors(value);
    return colors.length ? normalizeCanvasColor(colors[0]) : '';
  }
  function drawElementBoxShadow(ctx, el, rootRect, rect, radius){
    var styles = css(el);
    var shadow = styles.boxShadow || '';
    if (!shadow || shadow === 'none') return;
    var color = parseFirstShadowColor(shadow);
    if (!color || color === 'transparent' || color === 'rgba(0,0,0,0)') return;

    var root = el.closest ? el.closest('.planningCanvas') : null;
    var inset = shadow.indexOf('inset') !== -1;
    var blurMatch = shadow.match(/(-?\d+(?:\.\d+)?)px/g);
    var blur = 16;
    if (blurMatch && blurMatch.length >= 3) blur = Math.abs(parseFloat(blurMatch[2]));

    ctx.save();
    if (inset) {
      ctx.globalAlpha = 0.9;
      drawStyledRoundedBorder(ctx, rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8, adjustRadii(radius, -4), color, Math.max(2, Math.min(8, blur / 5)), 'solid');
    } else {
      ctx.globalAlpha = root && root.classList.contains('mode-challenge') ? 0.75 : 0.42;
      ctx.shadowColor = color;
      ctx.shadowBlur = Math.max(6, Math.min(44, blur));
      ctx.fillStyle = color;
      roundedPath(ctx, rect.x, rect.y, rect.w, rect.h, radius);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, Math.min(5, (px(styles.borderTopWidth, 1) || 1)));
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawElementOutline(ctx, el, rect, radius){
    var styles = css(el);
    var outlineStyle = String(styles.outlineStyle || 'none').toLowerCase();
    var outlineWidth = px(styles.outlineWidth, 0);
    if (!outlineWidth || outlineStyle === 'none' || outlineStyle === 'hidden') return;
    var color = safeColor(styles.outlineColor, 'rgba(255,255,255,.35)');
    var offset = px(styles.outlineOffset, 0);
    drawStyledRoundedBorder(ctx, rect.x - offset, rect.y - offset, rect.w + offset * 2, rect.h + offset * 2, adjustRadii(radius, offset), color, outlineWidth, outlineStyle);
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
    var textShadow = styles.textShadow || '';
    if (textShadow && textShadow !== 'none') {
      var shadowColor = parseFirstShadowColor(textShadow);
      if (shadowColor) {
        ctx.shadowColor = shadowColor;
        var nums = textShadow.match(/(-?\d+(?:\.\d+)?)px/g);
        ctx.shadowOffsetX = nums && nums[0] ? parseFloat(nums[0]) : 0;
        ctx.shadowOffsetY = nums && nums[1] ? parseFloat(nums[1]) : 0;
        ctx.shadowBlur = nums && nums[2] ? Math.min(24, Math.abs(parseFloat(nums[2]))) : 0;
      }
    }
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
    ctx.save();
    applyElementRotation(ctx, el, r);
    drawRoundedBox(ctx, r.x, r.y, r.w, r.h, radius, safeColor(styles.backgroundColor, 'rgba(255,255,255,.12)'), null, 0);
    drawStyledRoundedBorder(ctx, r.x, r.y, r.w, r.h, radius, safeColor(styles.borderTopColor, 'rgba(255,255,255,.22)'), px(styles.borderTopWidth, 1), styles.borderTopStyle || styles.borderStyle);
    drawTextBlock(ctx, el, rootRect, {align:'center', singleLine:true, verticalCenter:true, maxWidth:Math.max(4, r.w - 8)});
    ctx.restore();
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
  function drawHighlightHalo(ctx, x, y, w, h, r, color, lineWidth){
    // V30.14 : le halo de la mise en avant visuelle ne doit pas devenir
    // un double contour massif à l'export. On le rend en ombre douce,
    // proche du box-shadow CSS de l'aperçu, sans grands cadres opaques.
    if (!color || color === 'transparent' || color === 'rgba(0,0,0,0)') return;

    var glow = Math.max(12, Math.min(34, Math.min(w, h) * 0.07));
    var spread = Math.max(2, Math.min(6, Math.min(w, h) * 0.014));

    ctx.save();
    ctx.globalAlpha = 0.40;
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
    ctx.lineWidth = Math.max(2, lineWidth + spread);
    ctx.strokeStyle = color;
    roundedPath(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.20;
    ctx.shadowColor = color;
    ctx.shadowBlur = glow * 1.45;
    ctx.lineWidth = Math.max(1.5, lineWidth);
    ctx.strokeStyle = color;
    roundedPath(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();
  }

  function rootMode(root){
    if (!root || !root.classList) return '';
    var modes = ['poster','ticket','restaurant','rpg','logbook','anime','marathon','release','subathon','indie','challenge'];
    for (var i = 0; i < modes.length; i++) if (root.classList.contains('mode-' + modes[i])) return modes[i];
    return '';
  }
  function cssVarColor(el, name, fallback){
    return safeColor(resolveCssVars(el, 'var(' + name + ')'), fallback || 'rgba(255,255,255,.35)');
  }
  function drawDiagonalStripes(ctx, x, y, w, h, color, alpha, gap, thickness, angleDeg){
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.globalAlpha *= clamp(alpha, 0, 1);
    ctx.strokeStyle = normalizeCanvasColor(color, 'rgba(255,255,255,.25)');
    ctx.lineWidth = Math.max(1, thickness || 2);
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((angleDeg || -35) * Math.PI / 180);
    var extent = Math.max(w, h) * 2;
    gap = Math.max(6, gap || Math.min(w, h) / 10);
    for (var pos = -extent; pos <= extent; pos += gap) {
      ctx.beginPath();
      ctx.moveTo(pos, -extent);
      ctx.lineTo(pos, extent);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawHorizontalScan(ctx, x, y, w, h, color, alpha, gap, thickness){
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.globalAlpha *= clamp(alpha, 0, 1);
    ctx.fillStyle = normalizeCanvasColor(color, 'rgba(255,255,255,.22)');
    gap = Math.max(5, gap || h / 28);
    thickness = Math.max(1, thickness || 1);
    for (var yy = y; yy <= y + h; yy += gap) ctx.fillRect(x, yy, w, thickness);
    ctx.restore();
  }
  function drawModeCanvasOverlay(ctx, root, x, y, w, h){
    // V30.31 : on ne force plus de calque décoratif global.
    // Les modificateurs sont déjà présents dans le background CSS calculé
    // de .planningCanvas. Les surcouches V30.30 fonçaient le thème, surtout
    // sur les côtés, et créaient un rendu différent de l’aperçu.
    return;
  }
  function drawModeCardOverlay(ctx, card, root, r, radius){
    // V30.31 : pas de surcouche manuelle sur les cartes.
    // Les fonds de cartes des modes spéciaux sont lus depuis
    // getComputedStyle(card).backgroundImage par drawCssBackground().
    // Cela évite de doubler les bandes/gradients et de créer des chevauchements.
    return;
  }
  function drawModeCardFrame(ctx, card, root, r, radius){
    // V30.31 : les contours spéciaux (dashed, outline, double, arrondis)
    // sont désormais rendus par drawStyledRoundedBorder() et drawElementOutline()
    // à partir des styles CSS calculés. On évite donc un deuxième contour forcé.
    return;
  }

  function drawTicketCutouts(ctx, card, rootRect, r, radius){
    var root = card.closest ? card.closest('.planningCanvas') : null;
    if (!root || !root.classList.contains('mode-ticket')) return;
    var styles = css(card);
    var stroke = safeColor(styles.borderTopColor, 'rgba(255,255,255,.2)');

    // V30.32 : les découpes de Ticket doivent respecter la vraie géométrie CSS.
    // En CSS, ::before / ::after appartiennent à la carte et sont donc coupés
    // par overflow:hidden + border-radius. Les versions précédentes dessinaient
    // des cercles complets hors de la carte, ce qui créait des superpositions
    // entre deux jours voisins, surtout sur Sakura Dream.
    var cqw = Math.max(1, rootRect.width / 100);
    var isList = root.classList.contains('view-list');
    var size = (isList ? 1.35 : 1.9) * cqw;
    var offset = 1 * cqw;
    var cy = r.y + r.h * 0.50;
    var centers = [
      r.x - offset + size / 2,
      r.x + r.w + offset - size / 2
    ];

    centers.forEach(function(cx){
      // Fond de découpe : limité à la surface réelle de la carte.
      ctx.save();
      roundedPath(ctx, r.x, r.y, r.w, r.h, radius);
      ctx.clip();
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.clip();
      drawCssBackground(ctx, root, 0, 0, rootRect.width, rootRect.height);
      ctx.restore();

      // Bord du trou : lui aussi clipsé dans la carte pour ne pas mordre le voisin.
      ctx.save();
      roundedPath(ctx, r.x, r.y, r.w, r.h, radius);
      ctx.clip();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, px(styles.borderTopWidth, 1));
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }
  function drawCard(ctx, card, rootRect){
    var styles = css(card);
    var r = relRect(card, rootRect);
    var radius = radiiFromStyles(styles, 16);
    var stroke = safeColor(styles.borderTopColor, 'rgba(255,255,255,.2)');
    var lineWidth = px(styles.borderTopWidth, 1);

    drawElementBoxShadow(ctx, card, rootRect, r, radius);
    drawElementOutline(ctx, card, r, radius);

    if (card.classList.contains('isHighlighted')) {
      drawHighlightHalo(ctx, r.x, r.y, r.w, r.h, radius, stroke, lineWidth);
    }

    ctx.save();
    roundedPath(ctx, r.x, r.y, r.w, r.h, radius);
    ctx.clip();

    drawCssBackground(ctx, card, r.x, r.y, r.w, r.h);
    drawModeCardOverlay(ctx, card, card.closest ? card.closest('.planningCanvas') : null, r, radius);

    var bg = extractUrl(getCssVar(card, '--exportDayImage') || getCssVar(card, '--dayImage') || styles.backgroundImage);
    var fit = getCssVar(card, '--imageFit') || styles.backgroundSize || 'cover';
    var pos = getCssVar(card, '--imagePosition') || styles.backgroundPosition || 'center center';
    if (bg) {
      // Le dessin d'image est asynchrone dans la fonction principale.
      // Ici, l'image est dessinée plus tard via la promesse attachée au canvas.
    }
    ctx.restore();

    // V30.32 : le contour et les découpes Ticket sont dessinés une seule fois
    // dans la passe finale, après les images. Les dessiner ici puis les refaire
    // plus bas épaississait les pointillés et les cercles du mode Ticket.

    if (card.classList.contains('isToday')) {
      ctx.save();
      ctx.lineWidth = Math.max(2, Math.round(Math.min(r.w, r.h) * 0.016));
      ctx.strokeStyle = 'rgba(56,189,248,.72)';
      drawRoundedBox(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, adjustRadii(radius, -4), null, ctx.strokeStyle, ctx.lineWidth);
      ctx.restore();
    }

    if (card.classList.contains('isStar')) {
      ctx.save();
      ctx.lineWidth = Math.max(2, Math.round(Math.min(r.w, r.h) * 0.018));
      ctx.strokeStyle = 'rgba(250,204,21,.48)';
      drawRoundedBox(ctx, r.x + 6, r.y + 6, r.w - 12, r.h - 12, adjustRadii(radius, -6), null, ctx.strokeStyle, ctx.lineWidth);
      ctx.restore();
    }
  }
  function drawCardTexts(ctx, card, rootRect){
    if (!card) return;
    var cs = css(card);
    var cr = relRect(card, rootRect);
    ctx.save();
    roundedPath(ctx, cr.x, cr.y, cr.w, cr.h, radiiFromStyles(cs, 16));
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
    drawModeCanvasOverlay(ctx, node, 0, 0, width, height);
    drawPseudoBackground(ctx, node, '::before', 0, 0, width, height);

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
      roundedPath(ctx, cr.x, cr.y, cr.w, cr.h, radiiFromStyles(cs, 16));
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
      drawStyledRoundedBorder(ctx, cr.x, cr.y, cr.w, cr.h, radiiFromStyles(cs, 16), safeColor(cs.borderTopColor, 'rgba(255,255,255,.2)'), px(cs.borderTopWidth, 1), cs.borderTopStyle || cs.borderStyle);
      drawTicketCutouts(ctx, card, rect, cr, radiiFromStyles(cs, 16));
      drawElementOutline(ctx, card, cr, radiiFromStyles(cs, 16));
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
