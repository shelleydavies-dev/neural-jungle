/* ============================================
   THE NEURAL JUNGLE — Scene Canvas v2
   Vivid psychedelic animated backgrounds
   ============================================ */

(function() {
  'use strict';

  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Vivid Color Palette --- */
  var P = {
    // Dark backgrounds (color-tinted)
    bgBlack:     [8, 6, 15],
    bgDeepBlue:  [10, 12, 30],
    bgDeepPurple:[18, 8, 28],
    bgDeepGreen: [8, 18, 12],
    bgDeepWarm:  [22, 12, 8],
    bgMid:       [15, 14, 22],
    // Vivid accents
    hotPink:     [255, 50, 120],
    magenta:     [220, 50, 200],
    purple:      [160, 60, 240],
    deepPurple:  [100, 40, 180],
    electricBlue:[50, 130, 255],
    cyan:        [50, 210, 220],
    teal:        [40, 190, 160],
    vivGreen:    [50, 220, 100],
    limeGreen:   [160, 240, 50],
    gold:        [255, 200, 50],
    amber:       [255, 160, 30],
    orange:      [255, 120, 40],
    coral:       [255, 90, 70],
    cream:       [240, 230, 200],
    white:       [255, 255, 255],
    // Dim versions
    dimViolet:   [60, 30, 90],
    dimBlue:     [30, 40, 80],
    dimTeal:     [20, 60, 55],
    dimGreen:    [25, 55, 30],
    dimAmber:    [80, 55, 20],
    dimPink:     [80, 25, 50]
  };

  function rgba(c, a) {
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }

  function hsla(h, s, l, a) {
    return 'hsla(' + (((h % 360) + 360) % 360) + ',' + s + '%,' + l + '%,' + a + ')';
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ============================================
     RENDERING PRIMITIVES
     ============================================ */

  function gradientBackground(ctx, w, h, time, cfg) {
    var grd;
    if (cfg.type === 'radial') {
      var cx = (cfg.cx || 0.5) * w, cy = (cfg.cy || 0.5) * h;
      var r = (cfg.r || 0.7) * Math.max(w, h);
      grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    } else {
      var angle = (cfg.angle || 0) * Math.PI / 180;
      var dx = Math.cos(angle) * w, dy = Math.sin(angle) * h;
      grd = ctx.createLinearGradient(
        w / 2 - dx / 2, h / 2 - dy / 2,
        w / 2 + dx / 2, h / 2 + dy / 2
      );
    }
    for (var i = 0; i < cfg.stops.length; i++) {
      var s = cfg.stops[i];
      grd.addColorStop(s[0], rgba(s[1], s[1][3] !== undefined ? s[1][3] : 1));
    }
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  }

  /* Particles with optional rainbow HSL cycling */
  function particles(ctx, w, h, time, cfg, data) {
    var pts = data.particles;
    if (!pts) return;
    var rainbow = cfg.rainbow;
    ctx.save();
    if (cfg.blend) ctx.globalCompositeOperation = cfg.blend;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var drift = cfg.drift || 20;
      var x = p.x * w + Math.sin(time * p.speedX + p.phaseX) * drift;
      var y = p.y * h + Math.cos(time * p.speedY + p.phaseY) * drift;
      var twinkle = 0.5 + 0.5 * Math.sin(time * (cfg.twinkleSpeed || 1.5) + p.twinklePhase);
      var r = lerp(cfg.minR || 1, cfg.maxR || 3, p.size);
      var alpha = (cfg.opacity || 0.6) * twinkle;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (rainbow) {
        var hue = ((p.x + p.y) * 180 + time * (cfg.hueSpeed || 12) + p.twinklePhase * 57) % 360;
        ctx.fillStyle = hsla(hue, cfg.saturation || 85, cfg.lightness || 60, alpha);
      } else {
        var color = cfg.colors ? cfg.colors[p.colorIndex % cfg.colors.length] : (cfg.color || P.cream);
        ctx.fillStyle = rgba(color, alpha);
      }
      ctx.fill();
    }
    ctx.restore();
  }

  /* Connections with optional rainbow coloring (psilocybin brain style) */
  function connections(ctx, w, h, time, cfg, data) {
    var pts = data.particles;
    if (!pts || pts.length < 2) return;
    var maxDist = (cfg.maxDist || 0.08) * Math.max(w, h);
    var maxDistSq = maxDist * maxDist;
    var drift = cfg.drift || 20;
    var rainbow = cfg.rainbow;

    ctx.save();
    ctx.lineWidth = cfg.width || 0.8;
    if (cfg.blend) ctx.globalCompositeOperation = cfg.blend;

    var len = pts.length;
    var posX = new Float32Array(len);
    var posY = new Float32Array(len);
    for (var i = 0; i < len; i++) {
      posX[i] = pts[i].x * w + Math.sin(time * pts[i].speedX + pts[i].phaseX) * drift;
      posY[i] = pts[i].y * h + Math.cos(time * pts[i].speedY + pts[i].phaseY) * drift;
    }
    var color = cfg.color || P.cream;
    for (var i = 0; i < len; i++) {
      var px = posX[i], py = posY[i];
      for (var j = i + 1; j < len; j++) {
        var dx = px - posX[j], dy = py - posY[j];
        var distSq = dx * dx + dy * dy;
        if (distSq < maxDistSq) {
          var alpha = (cfg.opacity || 0.2) * (1 - Math.sqrt(distSq) / maxDist);
          ctx.beginPath();
          var mx = (px + posX[j]) / 2 + Math.sin(time * 0.3 + i) * 8;
          var my = (py + posY[j]) / 2 + Math.cos(time * 0.3 + j) * 8;
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo(mx, my, posX[j], posY[j]);
          if (rainbow) {
            var avgX = (pts[i].x + pts[j].x) / 2;
            var avgY = (pts[i].y + pts[j].y) / 2;
            var hue = ((avgX + avgY) * 180 + time * (cfg.hueSpeed || 12)) % 360;
            ctx.strokeStyle = hsla(hue, cfg.saturation || 85, cfg.lightness || 55, alpha);
          } else {
            ctx.strokeStyle = rgba(color, alpha);
          }
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function lightRays(ctx, w, h, time, cfg) {
    var cx = (cfg.x || 0.5) * w;
    var cy = (cfg.y || 0) * h;
    var count = cfg.count || 5;
    var length = (cfg.length || 0.8) * Math.max(w, h);
    var spread = cfg.spread || 0.6;
    var color = cfg.color || P.gold;
    var baseAngle = Math.PI / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < count; i++) {
      var t = count > 1 ? (i / (count - 1) - 0.5) : 0;
      var angle = baseAngle + t * spread + Math.sin(time * 0.2 + i * 1.5) * 0.05;
      var rayW = lerp(cfg.minWidth || 20, cfg.maxWidth || 60, (i * 0.618) % 1);
      var sway = Math.sin(time * 0.15 + i * 2.1) * 15;
      var endX = cx + Math.cos(angle) * length + sway;
      var endY = cy + Math.sin(angle) * length;
      var grd = ctx.createLinearGradient(cx + sway, cy, endX, endY);
      var rayColor = cfg.rainbow
        ? cfg.colors ? cfg.colors[i % cfg.colors.length] : color
        : color;
      grd.addColorStop(0, rgba(rayColor, cfg.opacity || 0.15));
      grd.addColorStop(0.4, rgba(rayColor, (cfg.opacity || 0.15) * 0.4));
      grd.addColorStop(1, rgba(rayColor, 0));
      ctx.beginPath();
      ctx.moveTo(cx + sway, cy);
      ctx.lineTo(endX - rayW / 2, endY);
      ctx.lineTo(endX + rayW / 2, endY);
      ctx.closePath();
      ctx.fillStyle = grd;
      ctx.fill();
    }
    ctx.restore();
  }

  function fog(ctx, w, h, time, cfg, data) {
    var bands = data.fogBands;
    if (!bands) return;
    var color = cfg.color || P.bgMid;
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i];
      var y = b.y * h + Math.sin(time * (cfg.speed || 0.1) + b.phase) * b.amplitude * h;
      var bandH = b.height * h;
      var grd = ctx.createLinearGradient(0, y - bandH / 2, 0, y + bandH / 2);
      grd.addColorStop(0, rgba(color, 0));
      grd.addColorStop(0.5, rgba(color, (cfg.opacity || 0.15) * b.opacity));
      grd.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = grd;
      ctx.fillRect(-50 + Math.sin(time * 0.05 + b.phase) * 50, y - bandH / 2, w + 100, bandH);
    }
  }

  function organicLines(ctx, w, h, time, cfg, data) {
    var lines = data.organicLines;
    if (!lines) return;
    ctx.save();
    ctx.lineWidth = cfg.width || 1.5;
    ctx.lineCap = 'round';
    if (cfg.blend) ctx.globalCompositeOperation = cfg.blend;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var color;
      if (cfg.rainbow) {
        var hue = (i / lines.length * 360 + time * (cfg.hueSpeed || 10)) % 360;
        color = null; // use hsla below
      } else {
        color = cfg.colors ? cfg.colors[i % cfg.colors.length] : (cfg.color || P.dimViolet);
      }
      ctx.beginPath();
      var sx = line.x * w, sy = line.y * h;
      ctx.moveTo(sx, sy);
      var cx = sx, cy = sy;
      for (var s = 0; s < line.segments.length; s++) {
        var seg = line.segments[s];
        var swayX = Math.sin(time * seg.swaySpeed + seg.phase) * seg.swayAmount * w;
        var swayY = Math.cos(time * seg.swaySpeed * 0.7 + seg.phase) * seg.swayAmount * h * 0.3;
        var ex = cx + seg.dx * w + swayX;
        var ey = cy + seg.dy * h + swayY;
        var cpx = (cx + ex) / 2 + seg.curvature * w;
        var cpy = (cy + ey) / 2 + seg.curvature * h * 0.5;
        ctx.quadraticCurveTo(cpx, cpy, ex, ey);
        cx = ex; cy = ey;
      }
      if (cfg.rainbow) {
        var hue = (i / lines.length * 360 + time * (cfg.hueSpeed || 10)) % 360;
        ctx.strokeStyle = hsla(hue, cfg.saturation || 70, cfg.lightness || 45, cfg.opacity || 0.4);
      } else {
        ctx.strokeStyle = rgba(color, cfg.opacity || 0.3);
      }
      ctx.stroke();
      if (line.branches) {
        for (var b = 0; b < line.branches.length; b++) {
          var br = line.branches[b];
          ctx.beginPath();
          var bx = sx + br.startDx * w;
          var by = sy + br.startDy * h;
          ctx.moveTo(bx, by);
          var bSwayX = Math.sin(time * br.swaySpeed + br.phase) * br.swayAmount * w;
          var bex = bx + br.dx * w + bSwayX;
          var bey = by + br.dy * h;
          ctx.quadraticCurveTo((bx + bex) / 2 + br.curve * w, (by + bey) / 2, bex, bey);
          if (cfg.rainbow) {
            var bHue = (i / lines.length * 360 + 30 + time * (cfg.hueSpeed || 10)) % 360;
            ctx.strokeStyle = hsla(bHue, cfg.saturation || 70, cfg.lightness || 45, (cfg.opacity || 0.4) * 0.5);
          } else {
            ctx.strokeStyle = rgba(color, (cfg.opacity || 0.3) * 0.5);
          }
          ctx.lineWidth = (cfg.width || 1.5) * 0.6;
          ctx.stroke();
        }
        ctx.lineWidth = cfg.width || 1.5;
      }
    }
    ctx.restore();
  }

  /* Glow spots with additive blending for luminous overlap */
  function glowSpots(ctx, w, h, time, cfg, data) {
    var spots = data.glowSpots;
    if (!spots) return;
    ctx.save();
    ctx.globalCompositeOperation = cfg.blend || 'lighter';
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      var pulse = 0.6 + 0.4 * Math.sin(time * (cfg.pulseSpeed || 0.8) + s.phase);
      var r = lerp(cfg.minR || 30, cfg.maxR || 80, s.size) * pulse;
      var x = s.x * w, y = s.y * h;
      var color = cfg.colors ? cfg.colors[s.colorIndex % cfg.colors.length] : (cfg.color || P.gold);
      var grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, rgba(color, (cfg.opacity || 0.25) * pulse));
      grd.addColorStop(0.4, rgba(color, (cfg.opacity || 0.25) * pulse * 0.4));
      grd.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = grd;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  function vignette(ctx, w, h, time, cfg) {
    var intensity = cfg.intensity || 0.5;
    var color = cfg.color || [0, 0, 0];
    var grd = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.3,
      w / 2, h / 2, Math.max(w, h) * 0.7
    );
    grd.addColorStop(0, rgba(color, 0));
    grd.addColorStop(1, rgba(color, intensity));
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  }

  /* NEW: Spiral arms — fractal flower pattern with rainbow color */
  function spirals(ctx, w, h, time, cfg) {
    var cx = (cfg.cx || 0.5) * w;
    var cy = (cfg.cy || 0.5) * h;
    var arms = cfg.arms || 5;
    var turns = cfg.turns || 3;
    var maxR = (cfg.radius || 0.45) * Math.min(w, h);
    var rotation = time * (cfg.speed || 0.1);
    var segments = cfg.segments || 14;
    var ptsPerSeg = 12;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = cfg.width || 2;
    ctx.lineCap = 'round';

    for (var a = 0; a < arms; a++) {
      var baseAngle = (a / arms) * Math.PI * 2 + rotation;
      var hueOffset = (a / arms) * 360;
      for (var seg = 0; seg < segments; seg++) {
        var t0 = seg / segments;
        var t1 = (seg + 1) / segments;
        var hue = (hueOffset + t0 * 120 + time * (cfg.hueSpeed || 15)) % 360;
        var alpha = (cfg.opacity || 0.25) * (0.15 + 0.85 * t0);
        ctx.beginPath();
        for (var p = 0; p <= ptsPerSeg; p++) {
          var t = lerp(t0, t1, p / ptsPerSeg);
          var angle = baseAngle + t * turns * Math.PI * 2;
          var r = t * maxR;
          var x = cx + Math.cos(angle) * r;
          var y = cy + Math.sin(angle) * r;
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = hsla(hue, cfg.saturation || 80, cfg.lightness || 55, alpha);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  var PRIMITIVES = {
    gradientBackground: gradientBackground,
    particles: particles,
    connections: connections,
    lightRays: lightRays,
    fog: fog,
    organicLines: organicLines,
    glowSpots: glowSpots,
    vignette: vignette,
    spirals: spirals
  };

  /* ============================================
     SCENE CONFIGURATIONS — VIVID
     ============================================ */

  var SCENES = {

    /* --- DARK (3) — moody but with deep color --- */

    'depression-dark-forest': {
      generate: { particles: 65, fogBands: 4, organicLines: 8, glowSpots: 4 },
      layers: [
        { primitive: 'gradientBackground', type: 'radial', cx: 0.5, cy: 0.4, r: 0.6,
          stops: [[0, [18,10,28,1]], [1, [8,6,15,1]]] },
        { primitive: 'organicLines', colors: [P.dimViolet, P.dimBlue, P.dimPink], opacity: 0.35, width: 2 },
        { primitive: 'fog', color: [20,12,35], opacity: 0.2, speed: 0.06 },
        { primitive: 'particles', colors: [P.deepPurple, P.dimViolet, [80,60,120]], minR: 0.5, maxR: 2.5,
          drift: 8, twinkleSpeed: 0.6, opacity: 0.35 },
        { primitive: 'connections', color: P.deepPurple, opacity: 0.1, maxDist: 0.06, drift: 8 },
        { primitive: 'glowSpots', colors: [P.deepPurple, P.dimPink, P.dimBlue], minR: 30, maxR: 70,
          pulseSpeed: 0.3, opacity: 0.12 },
        { primitive: 'vignette', intensity: 0.7, color: [5,3,10] }
      ]
    },

    'overgrown-trail': {
      generate: { particles: 55, fogBands: 3, organicLines: 12, glowSpots: 4 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 90,
          stops: [[0, [8,15,10,1]], [0.5, [12,20,15,1]], [1, [6,12,8,1]]] },
        { primitive: 'organicLines', colors: [P.dimGreen, P.dimTeal, [30,60,40]], opacity: 0.45, width: 2.5 },
        { primitive: 'particles', colors: [P.teal, P.vivGreen, P.dimGreen], minR: 0.5, maxR: 2,
          drift: 6, twinkleSpeed: 0.7, opacity: 0.3 },
        { primitive: 'connections', color: P.dimTeal, opacity: 0.1, maxDist: 0.05, drift: 6 },
        { primitive: 'fog', color: [10,25,18], opacity: 0.2, speed: 0.05 },
        { primitive: 'glowSpots', colors: [P.teal, P.vivGreen], minR: 20, maxR: 50,
          pulseSpeed: 0.4, opacity: 0.1 },
        { primitive: 'vignette', intensity: 0.6, color: [3,8,5] }
      ]
    },

    'looking-down': {
      generate: { particles: 50, fogBands: 2, organicLines: 10, glowSpots: 3 },
      layers: [
        { primitive: 'gradientBackground', type: 'radial', cx: 0.5, cy: 0.5, r: 0.5,
          stops: [[0, [20,15,10,1]], [1, [8,6,12,1]]] },
        { primitive: 'organicLines', colors: [P.dimAmber, [50,35,20], P.dimViolet], opacity: 0.45, width: 2 },
        { primitive: 'particles', colors: [P.amber, P.dimAmber, P.coral], minR: 0.5, maxR: 1.5,
          drift: 5, twinkleSpeed: 0.5, opacity: 0.25 },
        { primitive: 'connections', color: P.dimAmber, opacity: 0.08, maxDist: 0.04, drift: 5 },
        { primitive: 'glowSpots', colors: [P.amber, P.dimPink], minR: 20, maxR: 50,
          pulseSpeed: 0.3, opacity: 0.08 },
        { primitive: 'vignette', intensity: 0.75 }
      ]
    },

    /* --- LIGHT (5) — vivid, hopeful, colorful --- */

    'clearing-light': {
      generate: { particles: 100, fogBands: 3, organicLines: 4, glowSpots: 7 },
      layers: [
        { primitive: 'gradientBackground', type: 'radial', cx: 0.5, cy: 0.3, r: 0.8,
          stops: [[0, [40,30,15,1]], [0.4, [18,12,25,1]], [1, [8,6,15,1]]] },
        { primitive: 'spirals', cx: 0.5, cy: 0.35, arms: 6, turns: 2.5, radius: 0.4,
          speed: 0.08, hueSpeed: 12, opacity: 0.18, width: 1.5, saturation: 80, lightness: 55 },
        { primitive: 'lightRays', x: 0.5, y: 0, count: 7, length: 0.95, spread: 0.5,
          color: P.gold, opacity: 0.15, minWidth: 30, maxWidth: 90, rainbow: true,
          colors: [P.gold, P.amber, P.hotPink, P.gold, P.cyan, P.gold, P.amber] },
        { primitive: 'particles', rainbow: true, hueSpeed: 15, saturation: 85, lightness: 62,
          minR: 1.5, maxR: 4, drift: 18, twinkleSpeed: 2, opacity: 0.65, blend: 'lighter' },
        { primitive: 'connections', rainbow: true, hueSpeed: 15, saturation: 80, lightness: 55,
          opacity: 0.2, maxDist: 0.08, drift: 18, width: 0.8, blend: 'lighter' },
        { primitive: 'glowSpots', colors: [P.gold, P.hotPink, P.cyan, P.vivGreen, P.purple, P.amber, P.magenta],
          minR: 50, maxR: 130, pulseSpeed: 0.6, opacity: 0.2 },
        { primitive: 'fog', color: [30,20,10], opacity: 0.08, speed: 0.08 },
        { primitive: 'vignette', intensity: 0.4, color: [5,3,12] }
      ]
    },

    'clearing-path': {
      generate: { particles: 80, fogBands: 3, organicLines: 5, glowSpots: 5 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 90,
          stops: [[0, [12,8,22,1]], [0.4, [18,14,28,1]], [1, [35,25,15,1]]] },
        { primitive: 'lightRays', x: 0.6, y: 0, count: 6, length: 0.9, spread: 0.4,
          color: P.gold, opacity: 0.12, minWidth: 25, maxWidth: 70 },
        { primitive: 'organicLines', colors: [P.dimViolet, P.dimTeal, P.dimGreen], opacity: 0.3, width: 1.5 },
        { primitive: 'particles', colors: [P.gold, P.vivGreen, P.cyan, P.amber], minR: 1, maxR: 3.5,
          drift: 14, twinkleSpeed: 1.8, opacity: 0.55, blend: 'lighter' },
        { primitive: 'connections', colors: [P.gold, P.vivGreen], color: P.gold,
          opacity: 0.12, maxDist: 0.07, drift: 14 },
        { primitive: 'glowSpots', colors: [P.gold, P.vivGreen, P.cyan, P.amber, P.hotPink],
          minR: 35, maxR: 90, pulseSpeed: 0.7, opacity: 0.18 },
        { primitive: 'fog', color: [25,18,10], opacity: 0.1, speed: 0.07 },
        { primitive: 'vignette', intensity: 0.4, color: [8,5,15] }
      ]
    },

    'canopy-light': {
      generate: { particles: 85, fogBands: 2, organicLines: 6, glowSpots: 8 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 90,
          stops: [[0, [30,22,12,1]], [0.5, [15,12,22,1]], [1, [20,18,12,1]]] },
        { primitive: 'organicLines', colors: [P.dimGreen, P.dimTeal, P.dimAmber], opacity: 0.25, width: 1.5 },
        { primitive: 'lightRays', x: 0.4, y: 0, count: 8, length: 1, spread: 0.7,
          color: P.gold, opacity: 0.12, minWidth: 20, maxWidth: 60, rainbow: true,
          colors: [P.gold, P.amber, P.gold, P.hotPink, P.gold, P.amber, P.gold, P.cyan] },
        { primitive: 'particles', colors: [P.gold, P.amber, P.vivGreen, P.hotPink, P.cyan],
          minR: 1, maxR: 3.5, drift: 14, twinkleSpeed: 2.2, opacity: 0.6, blend: 'lighter' },
        { primitive: 'connections', color: P.gold, opacity: 0.1, maxDist: 0.06, drift: 14 },
        { primitive: 'glowSpots', colors: [P.gold, P.hotPink, P.cyan, P.vivGreen, P.amber, P.magenta, P.purple, P.teal],
          minR: 30, maxR: 80, pulseSpeed: 0.9, opacity: 0.2 },
        { primitive: 'vignette', intensity: 0.35, color: [8,5,12] }
      ]
    },

    'setting-clearing': {
      generate: { particles: 70, fogBands: 3, organicLines: 3, glowSpots: 6 },
      layers: [
        { primitive: 'gradientBackground', type: 'radial', cx: 0.5, cy: 0.5, r: 0.7,
          stops: [[0, [35,25,18,1]], [1, [15,12,20,1]]] },
        { primitive: 'fog', color: [28,20,12], opacity: 0.12, speed: 0.06 },
        { primitive: 'organicLines', color: P.dimAmber, opacity: 0.15, width: 1 },
        { primitive: 'lightRays', x: 0.5, y: 0.1, count: 4, length: 0.7, spread: 0.3,
          color: P.amber, opacity: 0.1, minWidth: 25, maxWidth: 60 },
        { primitive: 'particles', colors: [P.gold, P.amber, P.coral, P.vivGreen],
          minR: 1, maxR: 3, drift: 12, twinkleSpeed: 1.5, opacity: 0.5, blend: 'lighter' },
        { primitive: 'glowSpots', colors: [P.gold, P.coral, P.amber, P.vivGreen, P.hotPink, P.teal],
          minR: 40, maxR: 100, pulseSpeed: 0.5, opacity: 0.15 },
        { primitive: 'vignette', intensity: 0.35, color: [10,6,12] }
      ]
    },

    'morning-forest': {
      generate: { particles: 75, fogBands: 4, organicLines: 4, glowSpots: 5 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 70,
          stops: [[0, [15,10,22,1]], [0.5, [30,20,15,1]], [1, [40,28,18,1]]] },
        { primitive: 'fog', color: [35,25,15], opacity: 0.15, speed: 0.08 },
        { primitive: 'lightRays', x: 0.3, y: 0, count: 5, length: 0.9, spread: 0.3,
          color: P.amber, opacity: 0.1, minWidth: 20, maxWidth: 55 },
        { primitive: 'organicLines', colors: [P.dimAmber, P.dimGreen], opacity: 0.2, width: 1.2 },
        { primitive: 'particles', colors: [P.gold, P.amber, P.coral, P.hotPink],
          minR: 1, maxR: 3, drift: 12, twinkleSpeed: 2, opacity: 0.5, blend: 'lighter' },
        { primitive: 'connections', color: P.amber, opacity: 0.08, maxDist: 0.06, drift: 12 },
        { primitive: 'glowSpots', colors: [P.amber, P.coral, P.gold, P.hotPink, P.vivGreen],
          minR: 30, maxR: 70, pulseSpeed: 0.6, opacity: 0.15 },
        { primitive: 'vignette', intensity: 0.4, color: [10,6,15] }
      ]
    },

    /* --- DENSE (3) — rich, multi-colored, maximum vibrancy --- */

    'hero-rainforest': {
      generate: { particles: 140, fogBands: 3, organicLines: 10, glowSpots: 10 },
      layers: [
        { primitive: 'gradientBackground', type: 'radial', cx: 0.5, cy: 0.4, r: 0.8,
          stops: [[0, [20,15,30,1]], [0.5, [12,10,20,1]], [1, [6,5,12,1]]] },
        { primitive: 'spirals', cx: 0.5, cy: 0.4, arms: 7, turns: 3, radius: 0.5,
          speed: 0.06, hueSpeed: 10, opacity: 0.15, width: 1.5, saturation: 75, lightness: 50 },
        { primitive: 'organicLines', rainbow: true, hueSpeed: 8, opacity: 0.35, width: 2,
          saturation: 65, lightness: 40 },
        { primitive: 'fog', color: [15,10,25], opacity: 0.1, speed: 0.07 },
        { primitive: 'particles', rainbow: true, hueSpeed: 10, saturation: 85, lightness: 62,
          minR: 1, maxR: 3.5, drift: 16, twinkleSpeed: 2.2, opacity: 0.6, blend: 'lighter' },
        { primitive: 'connections', rainbow: true, hueSpeed: 10, saturation: 80, lightness: 55,
          opacity: 0.18, maxDist: 0.065, drift: 16, width: 0.8, blend: 'lighter' },
        { primitive: 'glowSpots', colors: [P.hotPink, P.cyan, P.gold, P.vivGreen, P.purple, P.amber, P.magenta, P.electricBlue, P.coral, P.teal],
          minR: 35, maxR: 100, pulseSpeed: 0.7, opacity: 0.2 },
        { primitive: 'lightRays', x: 0.4, y: 0, count: 5, length: 0.7, spread: 0.4,
          color: P.gold, opacity: 0.08, minWidth: 20, maxWidth: 50 },
        { primitive: 'vignette', intensity: 0.45, color: [4,3,10] }
      ]
    },

    'jungle-neurons': {
      generate: { particles: 120, fogBands: 2, organicLines: 8, glowSpots: 8 },
      layers: [
        { primitive: 'gradientBackground', type: 'radial', cx: 0.5, cy: 0.5, r: 0.7,
          stops: [[0, [15,12,25,1]], [1, [6,5,12,1]]] },
        { primitive: 'organicLines', rainbow: true, hueSpeed: 12, opacity: 0.3, width: 2,
          saturation: 60, lightness: 35 },
        { primitive: 'particles', rainbow: true, hueSpeed: 12, saturation: 90, lightness: 62,
          minR: 1.5, maxR: 4, drift: 14, twinkleSpeed: 2.5, opacity: 0.65, blend: 'lighter' },
        { primitive: 'connections', rainbow: true, hueSpeed: 12, saturation: 85, lightness: 55,
          opacity: 0.22, maxDist: 0.09, drift: 14, width: 0.9, blend: 'lighter' },
        { primitive: 'glowSpots', colors: [P.hotPink, P.electricBlue, P.vivGreen, P.gold, P.purple, P.cyan, P.magenta, P.amber],
          minR: 30, maxR: 75, pulseSpeed: 0.9, opacity: 0.2 },
        { primitive: 'fog', color: [12,8,20], opacity: 0.06, speed: 0.06 },
        { primitive: 'vignette', intensity: 0.4, color: [4,3,10] }
      ]
    },

    'field-guide-plants': {
      generate: { particles: 90, fogBands: 2, organicLines: 7, glowSpots: 10 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 90,
          stops: [[0, [8,12,6,1]], [0.5, [12,10,18,1]], [1, [6,10,8,1]]] },
        { primitive: 'organicLines', colors: [P.dimGreen, P.dimTeal, P.dimViolet, [40,55,25], P.dimBlue, P.dimPink, [25,50,40]],
          opacity: 0.35, width: 1.8 },
        { primitive: 'particles', colors: [P.vivGreen, P.purple, P.electricBlue, P.gold, P.hotPink, P.teal, P.limeGreen],
          minR: 1, maxR: 3.5, drift: 12, twinkleSpeed: 2, opacity: 0.55, blend: 'lighter' },
        { primitive: 'connections', color: P.teal, opacity: 0.1, maxDist: 0.06, drift: 12 },
        { primitive: 'glowSpots', colors: [P.vivGreen, P.purple, P.electricBlue, P.gold, P.hotPink, P.teal, P.magenta, P.cyan, P.limeGreen, P.coral],
          minR: 25, maxR: 65, pulseSpeed: 1, opacity: 0.18 },
        { primitive: 'vignette', intensity: 0.4, color: [4,6,5] }
      ]
    },

    /* --- ATMOSPHERIC (2) — colored mist and mystery --- */

    'fog-forest': {
      generate: { particles: 55, fogBands: 7, organicLines: 5, glowSpots: 4 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 90,
          stops: [[0, [10,14,22,1]], [1, [15,18,28,1]]] },
        { primitive: 'organicLines', colors: [P.dimBlue, P.dimTeal, P.dimViolet], opacity: 0.2, width: 1.5 },
        { primitive: 'fog', color: [20,25,40], opacity: 0.25, speed: 0.1 },
        { primitive: 'particles', colors: [P.cyan, P.teal, P.electricBlue, P.purple],
          minR: 0.5, maxR: 2.5, drift: 10, twinkleSpeed: 0.9, opacity: 0.3, blend: 'lighter' },
        { primitive: 'connections', color: P.dimBlue, opacity: 0.06, maxDist: 0.05, drift: 10 },
        { primitive: 'glowSpots', colors: [P.cyan, P.purple, P.teal, P.electricBlue],
          minR: 50, maxR: 120, pulseSpeed: 0.3, opacity: 0.1 },
        { primitive: 'fog', color: [18,22,35], opacity: 0.2, speed: 0.06 },
        { primitive: 'vignette', intensity: 0.5, color: [5,7,15] }
      ]
    },

    'set-explorer': {
      generate: { particles: 60, fogBands: 5, organicLines: 4, glowSpots: 4 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 90,
          stops: [[0, [8,6,18,1]], [0.7, [14,12,25,1]], [1, [18,16,30,1]]] },
        { primitive: 'fog', color: [18,15,30], opacity: 0.22, speed: 0.08 },
        { primitive: 'organicLines', colors: [P.dimViolet, P.dimBlue], opacity: 0.25, width: 2 },
        { primitive: 'particles', colors: [P.purple, P.cyan, P.hotPink, P.electricBlue],
          minR: 0.5, maxR: 2.5, drift: 8, twinkleSpeed: 0.8, opacity: 0.3, blend: 'lighter' },
        { primitive: 'glowSpots', colors: [P.purple, P.cyan, P.hotPink, P.electricBlue],
          minR: 35, maxR: 80, pulseSpeed: 0.4, opacity: 0.12 },
        { primitive: 'fog', color: [12,10,22], opacity: 0.18, speed: 0.05 },
        { primitive: 'vignette', intensity: 0.55, color: [4,3,10] }
      ]
    },

    /* --- STRUCTURAL (4) — bold, purposeful colors --- */

    'rugged-terrain': {
      generate: { particles: 65, fogBands: 2, organicLines: 9, glowSpots: 5 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 110,
          stops: [[0, [15,8,6,1]], [0.5, [20,12,10,1]], [1, [10,6,8,1]]] },
        { primitive: 'organicLines', colors: [P.dimAmber, [60,30,15], P.dimPink, [50,25,20]],
          opacity: 0.4, width: 2.5 },
        { primitive: 'particles', colors: [P.amber, P.orange, P.coral, P.gold],
          minR: 0.5, maxR: 3, drift: 10, twinkleSpeed: 1.2, opacity: 0.4, blend: 'lighter' },
        { primitive: 'connections', color: P.orange, opacity: 0.1, maxDist: 0.05, drift: 10 },
        { primitive: 'glowSpots', colors: [P.amber, P.coral, P.orange, [200,60,30], P.gold],
          minR: 25, maxR: 65, pulseSpeed: 0.5, opacity: 0.15 },
        { primitive: 'vignette', intensity: 0.6, color: [8,4,4] }
      ]
    },

    'maintained-trail': {
      generate: { particles: 70, fogBands: 2, organicLines: 5, glowSpots: 6 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 90,
          stops: [[0, [10,15,8,1]], [0.5, [18,22,14,1]], [1, [10,14,10,1]]] },
        { primitive: 'organicLines', colors: [P.dimGreen, P.dimTeal], opacity: 0.25, width: 1.5 },
        { primitive: 'lightRays', x: 0.5, y: 0, count: 4, length: 0.7, spread: 0.25,
          color: P.gold, opacity: 0.1, minWidth: 25, maxWidth: 55 },
        { primitive: 'particles', colors: [P.vivGreen, P.gold, P.teal, P.amber],
          minR: 1, maxR: 3, drift: 12, twinkleSpeed: 1.8, opacity: 0.5, blend: 'lighter' },
        { primitive: 'connections', color: P.vivGreen, opacity: 0.1, maxDist: 0.06, drift: 12 },
        { primitive: 'glowSpots', colors: [P.vivGreen, P.gold, P.teal, P.amber, P.cyan, P.limeGreen],
          minR: 30, maxR: 70, pulseSpeed: 0.6, opacity: 0.15 },
        { primitive: 'vignette', intensity: 0.4, color: [4,6,4] }
      ]
    },

    'expedition': {
      generate: { particles: 90, fogBands: 2, organicLines: 7, glowSpots: 6 },
      layers: [
        { primitive: 'gradientBackground', type: 'linear', angle: 80,
          stops: [[0, [8,10,6,1]], [0.5, [14,12,20,1]], [1, [18,15,10,1]]] },
        { primitive: 'organicLines', colors: [P.dimGreen, P.dimAmber, P.dimTeal], opacity: 0.35, width: 2.2 },
        { primitive: 'particles', colors: [P.gold, P.vivGreen, P.amber, P.orange, P.cyan],
          minR: 1, maxR: 3.5, drift: 16, twinkleSpeed: 2.2, opacity: 0.55, blend: 'lighter' },
        { primitive: 'connections', rainbow: true, hueSpeed: 8, saturation: 75, lightness: 50,
          opacity: 0.15, maxDist: 0.07, drift: 16, width: 0.7, blend: 'lighter' },
        { primitive: 'glowSpots', colors: [P.gold, P.vivGreen, P.orange, P.cyan, P.amber, P.hotPink],
          minR: 30, maxR: 75, pulseSpeed: 0.8, opacity: 0.18 },
        { primitive: 'fog', color: [12,10,18], opacity: 0.08, speed: 0.07 },
        { primitive: 'vignette', intensity: 0.45, color: [5,5,8] }
      ]
    },

    'tending': {
      generate: { particles: 60, fogBands: 2, organicLines: 4, glowSpots: 7 },
      layers: [
        { primitive: 'gradientBackground', type: 'radial', cx: 0.5, cy: 0.5, r: 0.6,
          stops: [[0, [18,22,15,1]], [1, [10,12,18,1]]] },
        { primitive: 'organicLines', colors: [P.dimGreen, P.dimTeal], opacity: 0.2, width: 1 },
        { primitive: 'particles', colors: [P.vivGreen, P.teal, P.cyan, P.limeGreen],
          minR: 0.5, maxR: 2.5, drift: 10, twinkleSpeed: 1.8, opacity: 0.4, blend: 'lighter' },
        { primitive: 'connections', color: P.teal, opacity: 0.08, maxDist: 0.05, drift: 10 },
        { primitive: 'glowSpots', colors: [P.vivGreen, P.teal, P.cyan, P.gold, P.limeGreen, P.electricBlue, P.hotPink],
          minR: 18, maxR: 50, pulseSpeed: 0.7, opacity: 0.15 },
        { primitive: 'fog', color: [12,16,12], opacity: 0.08, speed: 0.05 },
        { primitive: 'vignette', intensity: 0.35, color: [5,6,8] }
      ]
    },

    /* --- PERSPECTIVE (2) — expansive, radiating --- */

    'looking-up': {
      generate: { particles: 85, fogBands: 2, organicLines: 6, glowSpots: 6 },
      layers: [
        { primitive: 'gradientBackground', type: 'radial', cx: 0.5, cy: 0.3, r: 0.7,
          stops: [[0, [40,35,25,1]], [0.5, [15,12,22,1]], [1, [6,5,12,1]]] },
        { primitive: 'spirals', cx: 0.5, cy: 0.3, arms: 8, turns: 2, radius: 0.35,
          speed: 0.05, hueSpeed: 18, opacity: 0.15, width: 1.5, saturation: 75, lightness: 55 },
        { primitive: 'organicLines', rainbow: true, hueSpeed: 15, opacity: 0.25, width: 2,
          saturation: 60, lightness: 40 },
        { primitive: 'lightRays', x: 0.5, y: 0, count: 8, length: 0.85, spread: 0.9,
          color: P.cream, opacity: 0.08, minWidth: 15, maxWidth: 45 },
        { primitive: 'particles', rainbow: true, hueSpeed: 18, saturation: 85, lightness: 65,
          minR: 1, maxR: 4, drift: 14, twinkleSpeed: 2.2, opacity: 0.55, blend: 'lighter' },
        { primitive: 'connections', rainbow: true, hueSpeed: 18, saturation: 80, lightness: 55,
          opacity: 0.15, maxDist: 0.06, drift: 14, blend: 'lighter' },
        { primitive: 'glowSpots', colors: [P.gold, P.cyan, P.hotPink, P.vivGreen, P.purple, P.amber],
          minR: 35, maxR: 90, pulseSpeed: 0.7, opacity: 0.15 },
        { primitive: 'vignette', intensity: 0.5, color: [4,3,10] }
      ]
    },

    'aerial-forest': {
      generate: { particles: 130, fogBands: 2, organicLines: 6, glowSpots: 8 },
      layers: [
        { primitive: 'gradientBackground', type: 'radial', cx: 0.5, cy: 0.5, r: 0.8,
          stops: [[0, [15,22,10,1]], [0.5, [10,14,18,1]], [1, [6,5,12,1]]] },
        { primitive: 'organicLines', rainbow: true, hueSpeed: 8, opacity: 0.2, width: 1.5,
          saturation: 55, lightness: 35 },
        { primitive: 'particles', rainbow: true, hueSpeed: 10, saturation: 85, lightness: 60,
          minR: 0.5, maxR: 2.5, drift: 10, twinkleSpeed: 1.8, opacity: 0.5, blend: 'lighter' },
        { primitive: 'connections', rainbow: true, hueSpeed: 10, saturation: 80, lightness: 50,
          opacity: 0.15, maxDist: 0.045, drift: 10, width: 0.6, blend: 'lighter' },
        { primitive: 'glowSpots', colors: [P.vivGreen, P.gold, P.cyan, P.hotPink, P.teal, P.purple, P.amber, P.electricBlue],
          minR: 22, maxR: 55, pulseSpeed: 0.6, opacity: 0.14 },
        { primitive: 'fog', color: [15,20,12], opacity: 0.08, speed: 0.06 },
        { primitive: 'vignette', intensity: 0.4, color: [4,4,8] }
      ]
    }
  };

  /* ============================================
     DATA GENERATION
     ============================================ */

  function generateParticles(count) {
    var pts = [];
    for (var i = 0; i < count; i++) {
      pts.push({
        x: Math.random(), y: Math.random(), size: Math.random(),
        speedX: 0.1 + Math.random() * 0.3, speedY: 0.1 + Math.random() * 0.3,
        phaseX: Math.random() * Math.PI * 2, phaseY: Math.random() * Math.PI * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        colorIndex: Math.floor(Math.random() * 10)
      });
    }
    return pts;
  }

  function generateFogBands(count) {
    var bands = [];
    for (var i = 0; i < count; i++) {
      bands.push({
        y: 0.15 + Math.random() * 0.7, height: 0.05 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2, amplitude: 0.02 + Math.random() * 0.04,
        opacity: 0.5 + Math.random() * 0.5
      });
    }
    return bands;
  }

  function generateOrganicLines(count) {
    var lines = [];
    for (var i = 0; i < count; i++) {
      var segCount = 3 + Math.floor(Math.random() * 4);
      var segments = [];
      for (var s = 0; s < segCount; s++) {
        segments.push({
          dx: (Math.random() - 0.5) * 0.15, dy: 0.05 + Math.random() * 0.1,
          curvature: (Math.random() - 0.5) * 0.08,
          swaySpeed: 0.1 + Math.random() * 0.2, swayAmount: 0.005 + Math.random() * 0.01,
          phase: Math.random() * Math.PI * 2
        });
      }
      var branches = [];
      var branchCount = Math.floor(Math.random() * 3);
      for (var b = 0; b < branchCount; b++) {
        var bSeg = Math.floor(Math.random() * segCount);
        var dxSum = 0, dySum = 0;
        for (var k = 0; k <= bSeg; k++) { dxSum += segments[k].dx; dySum += segments[k].dy; }
        branches.push({
          startDx: dxSum, startDy: dySum,
          dx: (Math.random() - 0.5) * 0.1, dy: 0.03 + Math.random() * 0.06,
          curve: (Math.random() - 0.5) * 0.05,
          swaySpeed: 0.1 + Math.random() * 0.15, swayAmount: 0.003 + Math.random() * 0.007,
          phase: Math.random() * Math.PI * 2
        });
      }
      lines.push({ x: Math.random(), y: -0.05 + Math.random() * 0.3, segments: segments, branches: branches });
    }
    return lines;
  }

  function generateGlowSpots(count) {
    var spots = [];
    for (var i = 0; i < count; i++) {
      spots.push({
        x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8,
        size: Math.random(), phase: Math.random() * Math.PI * 2,
        colorIndex: Math.floor(Math.random() * 10)
      });
    }
    return spots;
  }

  /* ============================================
     SCENECANVAS CLASS
     ============================================ */

  function SceneCanvas(canvas, sceneName) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sceneName = sceneName;
    this.config = SCENES[sceneName];
    if (!this.config) {
      console.warn('SceneCanvas: unknown scene "' + sceneName + '"');
      return;
    }
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.running = false;
    this.rafId = null;
    this.time = 0;
    this.w = 0;
    this.h = 0;
    this.data = {};
    this._generate();
    this._resize();
    var self = this;
    this._boundResize = function() { self._resize(); };
    window.addEventListener('resize', this._boundResize);
    this._setupObserver();
    this._drawFrame(0);
  }

  SceneCanvas.prototype._generate = function() {
    var gen = this.config.generate || {};
    if (gen.particles) this.data.particles = generateParticles(gen.particles);
    if (gen.fogBands) this.data.fogBands = generateFogBands(gen.fogBands);
    if (gen.organicLines) this.data.organicLines = generateOrganicLines(gen.organicLines);
    if (gen.glowSpots) this.data.glowSpots = generateGlowSpots(gen.glowSpots);
  };

  SceneCanvas.prototype._resize = function() {
    var parent = this.canvas.parentElement;
    var rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    var w = rect.width, h = rect.height;
    if (w === 0 || h === 0) return;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.w = w;
    this.h = h;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!this.running) this._drawFrame(this.time);
  };

  SceneCanvas.prototype._drawFrame = function(time) {
    var ctx = this.ctx, w = this.w, h = this.h;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    var layers = this.config.layers;
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var fn = PRIMITIVES[layer.primitive];
      if (fn) fn(ctx, w, h, time, layer, this.data);
    }
  };

  SceneCanvas.prototype._setupObserver = function() {
    if (typeof IntersectionObserver === 'undefined') { this.start(); return; }
    var self = this;
    this._observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) self.start(); else self.stop();
    }, { threshold: 0 });
    this._observer.observe(this.canvas);
  };

  SceneCanvas.prototype.start = function() {
    if (this.running || REDUCED_MOTION) return;
    this.running = true;
    var self = this;
    var startTime = performance.now() - this.time * 1000;
    function tick(now) {
      if (!self.running) return;
      self.time = (now - startTime) / 1000;
      self._drawFrame(self.time);
      self.rafId = requestAnimationFrame(tick);
    }
    this.rafId = requestAnimationFrame(tick);
  };

  SceneCanvas.prototype.stop = function() {
    this.running = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  };

  SceneCanvas.prototype.destroy = function() {
    this.stop();
    window.removeEventListener('resize', this._boundResize);
    if (this._observer) { this._observer.disconnect(); this._observer = null; }
  };

  /* ============================================
     AUTO-INIT
     ============================================ */

  function init() {
    var canvases = document.querySelectorAll('canvas[data-scene]');
    for (var i = 0; i < canvases.length; i++) {
      var el = canvases[i];
      var sceneName = el.getAttribute('data-scene');
      if (sceneName) new SceneCanvas(el, sceneName);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SceneCanvas = SceneCanvas;

})();
