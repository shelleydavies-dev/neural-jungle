/* ============================================
   THE NEURAL JUNGLE — Main JS
   GSAP ScrollTrigger + Lenis smooth scroll
   Page transitions, scroll animations
   ============================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'neural-jungle-last-terrain';
  var isLanding = document.body.dataset.terrain === 'landing';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    initPageTransitions();
    saveLastVisited();

    if (isLanding) {
      // Landing page — animate sphere elements on load
      animateLandingEntrance();
    } else {
      // Terrain pages — init scroll system
      initLenis();
      initScrollAnimations();
    }
  }

  /* ============================================
     LENIS SMOOTH SCROLL (terrain pages only)
     ============================================ */

  function initLenis() {
    if (prefersReducedMotion) return;
    if (typeof Lenis === 'undefined') return;

    var lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ============================================
     GSAP SCROLL ANIMATIONS (terrain pages)
     ============================================ */

  function initScrollAnimations() {
    if (prefersReducedMotion) {
      // Show everything immediately
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Fallback: use IntersectionObserver
      initFallbackScrollReveal();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // --- Fade-in + slide-up on text sections ---
    gsap.utils.toArray('.text-section.reveal').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'top 50%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // --- Parallax on full-bleed images ---
    gsap.utils.toArray('.full-bleed.reveal').forEach(function (el) {
      var img = el.querySelector('img');
      if (!img) return;

      // Subtle parallax: image moves slower than scroll
      gsap.fromTo(img,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );

      // Fade-in the container
      gsap.fromTo(el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // --- Blockquote scale/fade reveals ---
    gsap.utils.toArray('blockquote').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // --- Next terrain link fade ---
    gsap.utils.toArray('.next-terrain.reveal').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  /* --- Fallback: IntersectionObserver for scroll reveals --- */
  function initFallbackScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ============================================
     LANDING PAGE ENTRANCE ANIMATION
     ============================================ */

  function animateLandingEntrance() {
    if (prefersReducedMotion) return;

    // Animate elements in sequence
    var header = document.querySelector('.site-header');
    var sphere = document.querySelector('.sphere-container');
    var landingText = document.querySelector('.landing-text');
    var bottomNav = document.querySelector('.bottom-nav');
    var portals = document.querySelectorAll('.portal');

    // Set initial states
    if (header) { header.style.opacity = '0'; header.style.transform = 'translateY(-10px)'; }
    if (sphere) { sphere.style.opacity = '0'; sphere.style.transform = 'translateY(-50%) scale(0.95)'; }
    if (landingText) { landingText.style.opacity = '0'; landingText.style.transform = 'translateY(20px)'; }
    if (bottomNav) { bottomNav.style.opacity = '0'; bottomNav.style.transform = 'translateY(10px)'; }
    portals.forEach(function (p) { p.style.opacity = '0'; p.style.transform = 'scale(0.8)'; });

    // Animate in sequence
    setTimeout(function () {
      if (header) {
        header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
      }
    }, 200);

    setTimeout(function () {
      if (sphere) {
        sphere.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
        sphere.style.opacity = '1';
        sphere.style.transform = 'translateY(-50%) scale(1)';
      }
    }, 400);

    setTimeout(function () {
      portals.forEach(function (p, i) {
        setTimeout(function () {
          p.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          p.style.opacity = '1';
          p.style.transform = 'scale(1)';
        }, i * 120);
      });
    }, 800);

    setTimeout(function () {
      if (landingText) {
        landingText.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        landingText.style.opacity = '1';
        landingText.style.transform = 'translateY(0)';
      }
    }, 1000);

    setTimeout(function () {
      if (bottomNav) {
        bottomNav.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        bottomNav.style.opacity = '1';
        bottomNav.style.transform = 'translateY(0)';
      }
    }, 1200);
  }

  /* ============================================
     PAGE TRANSITIONS
     ============================================ */

  function initPageTransitions() {
    // Fade in on page load
    window.addEventListener('load', function () {
      var overlay = document.querySelector('.page-transition');
      if (overlay) {
        overlay.classList.add('active');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            overlay.classList.remove('active');
          });
        });
      }
    });

    // Intercept transition links
    document.addEventListener('click', function (e) {
      var link = e.target.closest('[data-transition]');
      if (link && link.href) {
        e.preventDefault();
        var overlay = document.querySelector('.page-transition');
        if (!overlay) {
          window.location.href = link.href;
          return;
        }
        overlay.classList.add('active');
        setTimeout(function () {
          window.location.href = link.href;
        }, 500);
      }
    });
  }

  /* ============================================
     LAST VISITED TERRAIN (localStorage)
     ============================================ */

  function saveLastVisited() {
    var terrain = document.body.dataset.terrain;
    if (terrain && terrain !== 'landing') {
      try {
        localStorage.setItem(STORAGE_KEY, terrain);
      } catch (e) { }
    }
  }

  /* ============================================
     MODE TOGGLE (Poetic / Explain)
     ============================================ */

  function initModeToggle() {
    var toggle = document.querySelector('.mode-toggle');
    if (!toggle) return;

    var buttons = toggle.querySelectorAll('button');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.dataset.mode;
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        if (mode === 'explain') {
          document.body.classList.add('mode-explain');
        } else {
          document.body.classList.remove('mode-explain');
        }

        // Save preference
        try { localStorage.setItem('neural-jungle-mode', mode); } catch (e) {}
      });
    });

    // Restore preference
    try {
      var saved = localStorage.getItem('neural-jungle-mode');
      if (saved === 'explain') {
        document.body.classList.add('mode-explain');
        buttons.forEach(function (b) {
          b.classList.toggle('active', b.dataset.mode === 'explain');
        });
      }
    } catch (e) {}
  }

  /* --- Init --- */
  function fullInit() {
    init();
    initModeToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fullInit);
  } else {
    fullInit();
  }
})();
