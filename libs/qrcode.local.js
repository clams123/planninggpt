/*
  PlanningGPT - générateur QR local minimal compatible qrcode-generator.
  Support : mode Byte UTF-8, niveaux L/M/Q/H, versions 1 à 6.
*/
(function(){
  'use strict';

  var EC_INFO = {
    L:{bits:1, versions:[null,{blocks:[19], ec:7},{blocks:[34], ec:10},{blocks:[55], ec:15},{blocks:[80], ec:20},{blocks:[108], ec:26},{blocks:[136], ec:18}]},
    M:{bits:0, versions:[null,{blocks:[16], ec:10},{blocks:[28], ec:16},{blocks:[44], ec:26},{blocks:[32,32], ec:18},{blocks:[43,43], ec:24},{blocks:[27,27,27,27], ec:16}]},
    Q:{bits:3, versions:[null,{blocks:[13], ec:13},{blocks:[22], ec:22},{blocks:[17,17], ec:18},{blocks:[24,24], ec:26},{blocks:[15,15,16,16], ec:18},{blocks:[19,19,19,19], ec:24}]},
    H:{bits:2, versions:[null,{blocks:[9], ec:17},{blocks:[16], ec:28},{blocks:[13,13], ec:22},{blocks:[9,9,9,9], ec:16},{blocks:[11,11,12,12], ec:22},{blocks:[15,15,15,15], ec:28}]}
  };
  var ALIGN = [null, [], [6,18], [6,22], [6,26], [6,30], [6,34]];

  function utf8Bytes(str){
    var out = [];
    for (var i = 0; i < str.length; i++){
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
      else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < str.length) {
        var c2 = str.charCodeAt(++i);
        var cp = 0x10000 + (((c & 0x3FF) << 10) | (c2 & 0x3FF));
        out.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F));
      } else out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
    }
    return out;
  }

  function totalData(info){ return info.blocks.reduce(function(a,b){ return a + b; }, 0); }
  function chooseVersion(bytes, level){
    var table = EC_INFO[level] || EC_INFO.M;
    for (var v = 1; v <= 6; v++){
      var cap = totalData(table.versions[v]);
      if (bytes.length + 2 <= cap) return v;
    }
    throw new Error('Texte trop long pour le QR code local.');
  }

  function BitBuffer(){ this.bits = []; }
  BitBuffer.prototype.put = function(value, length){
    for (var i = length - 1; i >= 0; i--) this.bits.push(((value >>> i) & 1) === 1);
  };
  BitBuffer.prototype.toBytes = function(capacity){
    var maxBits = capacity * 8;
    var terminator = Math.min(4, maxBits - this.bits.length);
    for (var i = 0; i < terminator; i++) this.bits.push(false);
    while (this.bits.length % 8 !== 0) this.bits.push(false);
    var bytes = [];
    for (var b = 0; b < this.bits.length; b += 8){
      var n = 0;
      for (var j = 0; j < 8; j++) n = (n << 1) | (this.bits[b + j] ? 1 : 0);
      bytes.push(n);
    }
    var pads = [0xEC, 0x11];
    var p = 0;
    while (bytes.length < capacity) bytes.push(pads[(p++) % 2]);
    return bytes;
  };

  var EXP = new Array(512), LOG = new Array(256);
  (function(){
    var x = 1;
    for (var i = 0; i < 255; i++){
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11D;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();
  function gmul(a,b){ return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function rsGenerator(degree){
    var poly = [1];
    for (var i = 0; i < degree; i++){
      var next = new Array(poly.length + 1).fill(0);
      for (var j = 0; j < poly.length; j++){
        next[j] ^= poly[j];
        next[j + 1] ^= gmul(poly[j], EXP[i]);
      }
      poly = next;
    }
    return poly;
  }
  function rsEncode(data, degree){
    var gen = rsGenerator(degree);
    var buffer = data.slice();
    for (var pad = 0; pad < degree; pad++) buffer.push(0);
    for (var i = 0; i < data.length; i++){
      var factor = buffer[i];
      if (!factor) continue;
      for (var j = 0; j < gen.length; j++){
        buffer[i + j] ^= gmul(gen[j], factor);
      }
    }
    return buffer.slice(buffer.length - degree);
  }

  function makeMatrix(size){
    return {modules:Array.from({length:size}, function(){ return new Array(size).fill(false); }), reserved:Array.from({length:size}, function(){ return new Array(size).fill(false); })};
  }
  function setModule(m, x, y, dark, reserved){
    if (x < 0 || y < 0 || y >= m.modules.length || x >= m.modules.length) return;
    m.modules[y][x] = !!dark;
    if (reserved) m.reserved[y][x] = true;
  }
  function finder(m, x, y){
    for (var dy = -1; dy <= 7; dy++) for (var dx = -1; dx <= 7; dx++){
      var xx = x + dx, yy = y + dy;
      var dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      setModule(m, xx, yy, dark, true);
    }
  }
  function alignment(m, cx, cy){
    for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++){
      var d = Math.max(Math.abs(dx), Math.abs(dy));
      setModule(m, cx + dx, cy + dy, d !== 1, true);
    }
  }
  function setupPatterns(m, version){
    var size = m.modules.length;
    finder(m, 0, 0); finder(m, size - 7, 0); finder(m, 0, size - 7);
    for (var i = 8; i < size - 8; i++){
      setModule(m, i, 6, i % 2 === 0, true);
      setModule(m, 6, i, i % 2 === 0, true);
    }
    if (version > 1){
      var coords = ALIGN[version];
      for (var a = 0; a < coords.length; a++) for (var b = 0; b < coords.length; b++){
        var x = coords[a], y = coords[b];
        if (m.reserved[y][x]) continue;
        alignment(m, x, y);
      }
    }
    setModule(m, 8, size - 8, true, true);
    for (var j = 0; j < 9; j++){
      if (j !== 6) { setModule(m, 8, j, false, true); setModule(m, j, 8, false, true); }
    }
    for (var k = 0; k < 8; k++){
      setModule(m, size - 1 - k, 8, false, true);
      setModule(m, 8, size - 1 - k, false, true);
    }
  }
  function mask(maskId, x, y){
    switch(maskId){
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      default: return (x + y) % 2 === 0;
    }
  }
  function placeData(m, bits, maskId){
    var size = m.modules.length;
    var bit = 0, dir = -1;
    for (var x = size - 1; x > 0; x -= 2){
      if (x === 6) x--;
      for (var yy = 0; yy < size; yy++){
        var y = dir === -1 ? size - 1 - yy : yy;
        for (var dx = 0; dx < 2; dx++){
          var xx = x - dx;
          if (m.reserved[y][xx]) continue;
          var dark = bit < bits.length ? bits[bit++] : false;
          if (mask(maskId, xx, y)) dark = !dark;
          setModule(m, xx, y, dark, false);
        }
      }
      dir *= -1;
    }
  }
  function bchFormat(value){
    var data = value << 10;
    var poly = 0x537;
    while (degree(data) - degree(poly) >= 0) data ^= poly << (degree(data) - degree(poly));
    return ((value << 10) | data) ^ 0x5412;
  }
  function degree(value){
    var d = -1;
    while (value){ value >>>= 1; d++; }
    return d;
  }
  function format(m, levelBits, maskId){
    var size = m.modules.length;
    var bits = bchFormat((levelBits << 3) | maskId);
    function bit(i){ return ((bits >> i) & 1) === 1; }
    for (var i = 0; i <= 5; i++) setModule(m, 8, i, bit(i), true);
    setModule(m, 8, 7, bit(6), true);
    setModule(m, 8, 8, bit(7), true);
    setModule(m, 7, 8, bit(8), true);
    for (var j = 9; j < 15; j++) setModule(m, 14 - j, 8, bit(j), true);
    for (var k = 0; k < 8; k++) setModule(m, size - 1 - k, 8, bit(k), true);
    for (var l = 8; l < 15; l++) setModule(m, 8, size - 15 + l, bit(l), true);
  }

  function build(data, level){
    var bytes = utf8Bytes(data);
    var version = chooseVersion(bytes, level);
    var table = EC_INFO[level] || EC_INFO.M;
    var info = table.versions[version];
    var buffer = new BitBuffer();
    buffer.put(0x4, 4);
    buffer.put(bytes.length, 8);
    bytes.forEach(function(b){ buffer.put(b, 8); });
    var dataBytes = buffer.toBytes(totalData(info));

    var blocks = [];
    var offset = 0;
    info.blocks.forEach(function(length){
      var chunk = dataBytes.slice(offset, offset + length);
      offset += length;
      blocks.push({data:chunk, ecc:rsEncode(chunk, info.ec)});
    });

    var codewords = [];
    var maxData = Math.max.apply(null, info.blocks);
    for (var i = 0; i < maxData; i++) blocks.forEach(function(block){ if (i < block.data.length) codewords.push(block.data[i]); });
    for (var e = 0; e < info.ec; e++) blocks.forEach(function(block){ codewords.push(block.ecc[e]); });

    var allBits = [];
    codewords.forEach(function(c){ for (var b = 7; b >= 0; b--) allBits.push(((c >> b) & 1) === 1); });

    var size = 21 + 4 * (version - 1);
    var m = makeMatrix(size);
    setupPatterns(m, version);
    var maskId = 0;
    placeData(m, allBits, maskId);
    format(m, table.bits, maskId);
    return m.modules;
  }

  window.qrcode = function(typeNumber, errorCorrectionLevel){
    var level = String(errorCorrectionLevel || 'M').toUpperCase();
    if (!EC_INFO[level]) level = 'M';
    var text = '';
    var modules = null;
    return {
      addData:function(value){ text += String(value || ''); },
      make:function(){ modules = build(text, level); },
      getModuleCount:function(){ return modules ? modules.length : 0; },
      isDark:function(row, col){ return !!(modules && modules[row] && modules[row][col]); },
      createSvgTag:function(cellSize, margin){
        if (!modules) this.make();
        cellSize = Number(cellSize || 4);
        margin = Number(margin || 1);
        var count = modules.length;
        var size = (count + margin * 2) * cellSize;
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" shape-rendering="crispEdges">';
        svg += '<rect width="100%" height="100%" fill="#fff"/>';
        svg += '<path fill="#111827" d="';
        for (var y = 0; y < count; y++) for (var x = 0; x < count; x++) if (modules[y][x]){
          svg += 'M' + ((x + margin) * cellSize) + ' ' + ((y + margin) * cellSize) + 'h' + cellSize + 'v' + cellSize + 'h-' + cellSize + 'z';
        }
        svg += '"/></svg>';
        return svg;
      }
    };
  };
})();
