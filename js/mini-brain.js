/* ============================================
   THE NEURAL JUNGLE — Mini Brain Component
   Reusable particle-brain canvas for terrain
   pages: corner indicator + before/after viz
   ============================================ */

(function () {
  'use strict';

  var brainOutline = [
    [0.28,0.62],[0.22,0.52],[0.18,0.42],[0.17,0.32],
    [0.20,0.22],[0.28,0.14],[0.38,0.08],
    [0.48,0.05],[0.55,0.06],
    [0.65,0.10],[0.73,0.18],[0.78,0.28],
    [0.80,0.40],[0.78,0.52],[0.73,0.60],
    [0.70,0.65],[0.74,0.70],[0.76,0.78],[0.72,0.84],[0.64,0.87],
    [0.56,0.84],[0.52,0.90],[0.48,0.92],[0.46,0.88],[0.44,0.82],
    [0.40,0.76],[0.35,0.70],[0.30,0.66]
  ];

  var fissures = [
    [[0.52,0.10],[0.50,0.22],[0.48,0.35],[0.50,0.48]],
    [[0.38,0.48],[0.48,0.50],[0.58,0.52],[0.66,0.56]],
    [[0.25,0.30],[0.32,0.28],[0.40,0.26],[0.45,0.20]],
    [[0.58,0.15],[0.62,0.22],[0.68,0.30],[0.72,0.38]]
  ];

  var regionDefs = {
    depression:  { cx: 0.24, cy: 0.30, r: 0.10 },
    grief:       { cx: 0.42, cy: 0.60, r: 0.09 },
    addictions:  { cx: 0.35, cy: 0.45, r: 0.09 },
    numbness:    { cx: 0.66, cy: 0.80, r: 0.09 }
  };

  var accentColors = {
    depression: [155, 126, 203],
    grief:      [91, 168, 200],
    addictions: [232, 164, 74],
    numbness:   [122, 154, 138]
  };

  /* --- Extra regions that light up to show connectivity changes --- */
  var connectivityRegions = {
    grief:      [{ cx: 0.35, cy: 0.45, r: 0.06 }, { cx: 0.50, cy: 0.25, r: 0.07 }],
    numbness:   [{ cx: 0.42, cy: 0.55, r: 0.06 }, { cx: 0.30, cy: 0.40, r: 0.06 }],
    addictions: [{ cx: 0.24, cy: 0.30, r: 0.07 }, { cx: 0.50, cy: 0.25, r: 0.06 }],
    depression: [{ cx: 0.50, cy: 0.48, r: 0.07 }, { cx: 0.42, cy: 0.60, r: 0.06 }]
  };

  function pointInBrain(px, py) {
    var inside = false;
    for (var i = 0, j = brainOutline.length - 1; i < brainOutline.length; j = i++) {
      var xi = brainOutline[i][0], yi = brainOutline[i][1];
      var xj = brainOutline[j][0], yj = brainOutline[j][1];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi))
        inside = !inside;
    }
    return inside;
  }

  function distToRegion(nx, ny, region) {
    var dx = nx - region.cx, dy = ny - region.cy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* ============================================
     MiniBrain class
     ============================================ */
  window.MiniBrain = function (canvasEl, opts) {
    opts = opts || {};
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.terrain = opts.terrain || 'grief';
    this.size = opts.size || 140;
    this.particleCount = opts.particleCount || 180;
    this.highlightRegion = opts.highlight !== false;
    this.showConnectivity = opts.showConnectivity || false;
    this.psilocybinMode = opts.psilocybinMode || false;
    this.particles = [];
    this.connections = [];
    this.dpr = window.devicePixelRatio || 1;
    this.time = 0;
    this.animating = false;

    this._init();
  };

  MiniBrain.prototype._init = function () {
    var s = this.size;
    this.canvas.width = s * this.dpr;
    this.canvas.height = s * this.dpr;
    this.canvas.style.width = s + 'px';
    this.canvas.style.height = s + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this._generateParticles();
    this._buildConnections();
    this.draw();
  };

  MiniBrain.prototype._toCanvas = function (nx, ny) {
    var pad = this.size * 0.08;
    var scale = this.size * 0.84;
    return [pad + nx * scale, pad + ny * scale];
  };

  MiniBrain.prototype._generateParticles = function () {
    this.particles = [];
    var count = this.particleCount;

    // Outline (25%)
    for (var i = 0; i < count * 0.25; i++) {
      var idx = Math.floor(Math.random() * brainOutline.length);
      var next = (idx + 1) % brainOutline.length;
      var t = Math.random();
      var nx = brainOutline[idx][0] + (brainOutline[next][0] - brainOutline[idx][0]) * t + (Math.random() - 0.5) * 0.02;
      var ny = brainOutline[idx][1] + (brainOutline[next][1] - brainOutline[idx][1]) * t + (Math.random() - 0.5) * 0.02;
      var c = this._toCanvas(nx, ny);
      this.particles.push({ x: c[0], y: c[1], bx: c[0], by: c[1], nx: nx, ny: ny, s: 0.4 + Math.random() * 0.4, o: 0.15 + Math.random() * 0.25, ph: Math.random() * 6.28, sp: 0.2 + Math.random() * 0.4 });
    }

    // Fissure (10%)
    for (var i = 0; i < count * 0.1; i++) {
      var f = fissures[Math.floor(Math.random() * fissures.length)];
      var fi = Math.floor(Math.random() * (f.length - 1));
      var t = Math.random();
      var nx = f[fi][0] + (f[fi+1][0] - f[fi][0]) * t + (Math.random() - 0.5) * 0.015;
      var ny = f[fi][1] + (f[fi+1][1] - f[fi][1]) * t + (Math.random() - 0.5) * 0.015;
      var c = this._toCanvas(nx, ny);
      this.particles.push({ x: c[0], y: c[1], bx: c[0], by: c[1], nx: nx, ny: ny, s: 0.3 + Math.random() * 0.4, o: 0.15 + Math.random() * 0.3, ph: Math.random() * 6.28, sp: 0.2 + Math.random() * 0.3 });
    }

    // Interior (65%)
    var placed = 0, attempts = 0;
    while (placed < count * 0.65 && attempts < count * 20) {
      attempts++;
      var nx = 0.15 + Math.random() * 0.68;
      var ny = 0.03 + Math.random() * 0.92;
      if (pointInBrain(nx, ny)) {
        var c = this._toCanvas(nx, ny);
        this.particles.push({ x: c[0], y: c[1], bx: c[0], by: c[1], nx: nx, ny: ny, s: 0.3 + Math.random() * 0.8, o: 0.08 + Math.random() * 0.35, ph: Math.random() * 6.28, sp: 0.15 + Math.random() * 0.3 });
        placed++;
      }
    }
  };

  MiniBrain.prototype._buildConnections = function () {
    this.connections = [];
    var dist = this.size * 0.12;
    for (var i = 0; i < this.particles.length; i++) {
      var found = 0;
      for (var j = i + 1; j < this.particles.length && found < 2; j++) {
        var dx = this.particles[i].bx - this.particles[j].bx;
        var dy = this.particles[i].by - this.particles[j].by;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < dist && d > 2 && Math.random() < 0.25) {
          this.connections.push({ a: i, b: j, o: 0.03 + (1 - d / dist) * 0.05 });
          found++;
        }
      }
    }
  };

  MiniBrain.prototype.draw = function () {
    var ctx = this.ctx;
    var s = this.size;
    var terrain = this.terrain;
    var accent = accentColors[terrain] || [255, 255, 255];
    var region = regionDefs[terrain];
    var highlight = this.highlightRegion;
    var psi = this.psilocybinMode;
    var connectivity = this.showConnectivity ? (connectivityRegions[terrain] || []) : [];

    ctx.clearRect(0, 0, s, s);
    this.time += 0.016;

    // Connections
    for (var c = 0; c < this.connections.length; c++) {
      var conn = this.connections[c];
      var a = this.particles[conn.a], b = this.particles[conn.b];

      var inRegionA = highlight && region && distToRegion(a.nx, a.ny, region) < region.r;
      var inRegionB = highlight && region && distToRegion(b.nx, b.ny, region) < region.r;
      var inConn = false;

      if (psi) {
        for (var ci = 0; ci < connectivity.length; ci++) {
          if (distToRegion(a.nx, a.ny, connectivity[ci]) < connectivity[ci].r ||
              distToRegion(b.nx, b.ny, connectivity[ci]) < connectivity[ci].r) {
            inConn = true; break;
          }
        }
      }

      if ((inRegionA || inRegionB) && highlight) {
        ctx.globalAlpha = psi ? 0.03 : conn.o * 2.5;
        ctx.strokeStyle = 'rgb(' + accent.join(',') + ')';
      } else if (inConn && psi) {
        ctx.globalAlpha = conn.o * 3;
        ctx.strokeStyle = 'rgba(' + accent.join(',') + ',0.8)';
      } else {
        ctx.globalAlpha = conn.o;
        ctx.strokeStyle = '#8a886a';
      }

      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Particles
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      var inRegion = highlight && region && distToRegion(p.nx, p.ny, region) < region.r;
      var inConn = false;

      if (psi) {
        for (var ci = 0; ci < connectivity.length; ci++) {
          if (distToRegion(p.nx, p.ny, connectivity[ci]) < connectivity[ci].r) {
            inConn = true; break;
          }
        }
      }

      // Drift
      p.x = p.bx + Math.cos(this.time * p.sp + p.ph) * 0.8;
      p.y = p.by + Math.sin(this.time * p.sp * 0.7 + p.ph) * 0.8;

      var twinkle = 0.5 + 0.5 * Math.sin(this.time * p.sp * 2 + p.ph);
      ctx.globalAlpha = p.o * (0.5 + twinkle * 0.5);

      if (inRegion && highlight) {
        ctx.fillStyle = psi ? 'rgba(' + accent.join(',') + ',0.3)' : 'rgb(' + accent.join(',') + ')';
        ctx.globalAlpha = psi ? p.o * 0.6 : Math.min(1, ctx.globalAlpha * 2.5);
      } else if (inConn && psi) {
        ctx.fillStyle = 'rgb(' + accent.join(',') + ')';
        ctx.globalAlpha = Math.min(1, ctx.globalAlpha * 2);
      } else {
        ctx.fillStyle = '#c8c0a0';
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, inRegion && highlight && !psi ? p.s * 1.4 : p.s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Region glow
    if (highlight && region && !psi) {
      var c = this._toCanvas(region.cx, region.cy);
      var gr = region.r * this.size * 0.84;
      var pulse = 0.5 + 0.5 * Math.sin(this.time * 1.5);
      ctx.globalAlpha = 0.06 + pulse * 0.04;
      ctx.fillStyle = 'rgb(' + accent.join(',') + ')';
      ctx.beginPath();
      ctx.arc(c[0], c[1], gr * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Psilocybin: extra cross-brain connection lines
    if (psi && connectivity.length >= 2) {
      var c1 = this._toCanvas(connectivity[0].cx, connectivity[0].cy);
      var c2 = this._toCanvas(connectivity[1].cx, connectivity[1].cy);
      var pulse = 0.5 + 0.5 * Math.sin(this.time * 2);
      ctx.globalAlpha = 0.08 + pulse * 0.06;
      ctx.strokeStyle = 'rgb(' + accent.join(',') + ')';
      ctx.lineWidth = 0.6;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(c1[0], c1[1]);
      ctx.lineTo(c2[0], c2[1]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Glow on connectivity regions
      for (var ci = 0; ci < connectivity.length; ci++) {
        var cc = this._toCanvas(connectivity[ci].cx, connectivity[ci].cy);
        var cr = connectivity[ci].r * this.size * 0.84;
        ctx.globalAlpha = 0.04 + pulse * 0.03;
        ctx.fillStyle = 'rgb(' + accent.join(',') + ')';
        ctx.beginPath();
        ctx.arc(cc[0], cc[1], cr * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  MiniBrain.prototype.startAnimation = function () {
    if (this.animating) return;
    this.animating = true;
    var self = this;
    function loop() {
      if (!self.animating) return;
      self.draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  };

  MiniBrain.prototype.stopAnimation = function () {
    this.animating = false;
  };

  MiniBrain.prototype.setPsilocybinMode = function (on) {
    this.psilocybinMode = on;
  };
})();
