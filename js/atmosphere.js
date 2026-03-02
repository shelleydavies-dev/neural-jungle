/* ============================================
   THE NEURAL JUNGLE — Atmosphere & Sphere
   Handles: sphere dots, neural pulse, portal
   hover effects, slow rotation drift
   ============================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var terrain = '';
  var isLanding = false;

  function init() {
    terrain = document.body.dataset.terrain || 'landing';
    isLanding = terrain === 'landing';

    if (isLanding) {
      initSphere();
    }
  }

  /* ============================================
     LANDING PAGE — Sphere Effects
     ============================================ */

  function initSphere() {
    generateScatteredDots();
    if (!prefersReducedMotion) {
      animateSphereRotation();
      animateNeuralPulse();
    }
    initPortalHovers();
  }

  /* --- Scattered Colored Dots on Sphere --- */
  function generateScatteredDots() {
    var container = document.getElementById('sphere-dots');
    if (!container) return;

    var terrains = ['grief', 'numbness', 'addictions', 'depression'];
    var colors = {
      grief: '#5ba8c8',
      numbness: '#7a9a8a',
      addictions: '#e8a44a',
      depression: '#9b7ecb'
    };

    var dotCount = 40;

    for (var i = 0; i < dotCount; i++) {
      var dot = document.createElement('div');
      dot.className = 'sphere-dot';
      var t = terrains[Math.floor(Math.random() * terrains.length)];
      dot.dataset.terrain = t;

      // Position within sphere bounds (using polar-ish coordinates)
      var angle = Math.random() * Math.PI * 2;
      var radius = 0.15 + Math.random() * 0.35; // Stay within the sphere
      var cx = 50 + Math.cos(angle) * radius * 100;
      var cy = 50 + Math.sin(angle) * radius * 100;

      var size = 2 + Math.random() * 3;

      dot.style.cssText = [
        'position: absolute',
        'width: ' + size + 'px',
        'height: ' + size + 'px',
        'left: ' + cx + '%',
        'top: ' + cy + '%',
        'background: ' + colors[t],
        'border-radius: 50%',
        'opacity: ' + (0.2 + Math.random() * 0.5),
        'pointer-events: none',
        'transform: translate(-50%, -50%)'
      ].join(';');

      if (!prefersReducedMotion) {
        var duration = 4 + Math.random() * 6;
        var delay = Math.random() * duration;
        var drift = 3 + Math.random() * 5;
        dot.style.animation = 'dot-float ' + duration + 's ease-in-out ' + delay + 's infinite';
        dot.style.setProperty('--drift-x', (Math.random() > 0.5 ? drift : -drift) + 'px');
        dot.style.setProperty('--drift-y', (Math.random() > 0.5 ? drift : -drift) + 'px');
      }

      container.appendChild(dot);
    }

    // Inject dot animation keyframes
    if (!document.getElementById('dot-keyframes')) {
      var style = document.createElement('style');
      style.id = 'dot-keyframes';
      style.textContent = [
        '@keyframes dot-float {',
        '  0%, 100% { transform: translate(-50%, -50%) translate(0, 0); }',
        '  50% { transform: translate(-50%, -50%) translate(var(--drift-x, 3px), var(--drift-y, -3px)); }',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    }
  }

  /* --- Slow Sphere Rotation Drift --- */
  function animateSphereRotation() {
    var sphere = document.querySelector('.sphere');
    if (!sphere) return;

    var angle = 0;
    var speed = 0.008; // degrees per frame

    function rotate() {
      angle += speed;
      sphere.style.transform = 'rotate(' + angle + 'deg)';
      requestAnimationFrame(rotate);
    }

    requestAnimationFrame(rotate);
  }

  /* --- Neural Network Pulse Animation --- */
  function animateNeuralPulse() {
    var neuralSvg = document.querySelector('.sphere-neural svg');
    if (!neuralSvg) return;

    var nodes = neuralSvg.querySelectorAll('g:nth-child(2) circle');
    if (!nodes.length) return;

    function pulseRandomNode() {
      var node = nodes[Math.floor(Math.random() * nodes.length)];
      var originalR = parseFloat(node.getAttribute('r')) || 2;
      var originalOpacity = node.style.opacity || '1';

      // Brief pulse
      node.setAttribute('r', originalR * 2.5);
      node.style.opacity = '0.6';
      node.style.fill = 'rgba(255,255,255,0.5)';

      setTimeout(function () {
        node.setAttribute('r', originalR);
        node.style.opacity = '';
        node.style.fill = '';
      }, 600);

      // Next pulse
      setTimeout(pulseRandomNode, 800 + Math.random() * 2000);
    }

    setTimeout(pulseRandomNode, 1000);
  }

  /* --- Portal Hover Effects --- */
  function initPortalHovers() {
    var portals = document.querySelectorAll('.portal');

    portals.forEach(function (portal) {
      portal.addEventListener('mouseenter', function () {
        // Brighten associated dots
        var terrainType = '';
        if (portal.classList.contains('portal--grief')) terrainType = 'grief';
        else if (portal.classList.contains('portal--numbness')) terrainType = 'numbness';
        else if (portal.classList.contains('portal--addictions')) terrainType = 'addictions';
        else if (portal.classList.contains('portal--depression')) terrainType = 'depression';

        if (terrainType) {
          var dots = document.querySelectorAll('.sphere-dot[data-terrain="' + terrainType + '"]');
          dots.forEach(function (dot) {
            dot.style.opacity = '0.9';
            dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
          });
        }
      });

      portal.addEventListener('mouseleave', function () {
        var dots = document.querySelectorAll('.sphere-dot');
        dots.forEach(function (dot) {
          dot.style.opacity = '';
          dot.style.transform = '';
        });
      });
    });
  }

  /* --- Init --- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
