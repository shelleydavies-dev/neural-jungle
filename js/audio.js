/* ============================================
   THE NEURAL JUNGLE — Audio Layer
   ============================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'neural-jungle-audio';
  var audioCtx = null;
  var currentSource = null;
  var gainNode = null;
  var isMuted = true;
  var isPlaying = false;
  var terrain = '';
  var toggleBtn = null;

  function init() {
    terrain = document.body.dataset.terrain || '';
    if (terrain === 'landing') return; // No audio on landing page

    toggleBtn = document.querySelector('.audio-toggle');
    if (!toggleBtn) return;

    restoreMutePreference();
    updateToggleUI();

    toggleBtn.addEventListener('click', function () {
      toggleMute();
    });

    if (!isMuted && terrain) {
      document.addEventListener('click', startOnInteraction, { once: true });
      document.addEventListener('keydown', startOnInteraction, { once: true });
    }
  }

  function startOnInteraction() {
    if (!isMuted && !isPlaying) {
      startAudio();
    }
  }

  /* --- Audio Context Setup --- */
  function getAudioContext() {
    if (!audioCtx) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      audioCtx = new AudioContext();
      gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);
      gainNode.gain.value = isMuted ? 0 : 0.3;
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /* --- Start Audio --- */
  function startAudio() {
    if (!terrain) return;

    var ctx = getAudioContext();
    if (!ctx) return;

    generateAmbientTone(ctx);
    isPlaying = true;
  }

  /* --- Generate Ambient Tone (placeholder) --- */
  function generateAmbientTone(ctx) {
    var toneConfigs = {
      grief: { freq: 110, detune: -5, type: 'sine' },
      numbness: { freq: 80, detune: 0, type: 'sine' },
      addictions: { freq: 130, detune: 10, type: 'triangle' },
      depression: { freq: 90, detune: -10, type: 'sine' }
    };

    var config = toneConfigs[terrain] || { freq: 100, detune: 0, type: 'sine' };

    var osc1 = ctx.createOscillator();
    osc1.type = config.type;
    osc1.frequency.value = config.freq;
    osc1.detune.value = config.detune;

    var osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = config.freq * 1.5;
    osc2.detune.value = config.detune + 3;

    var oscGain1 = ctx.createGain();
    oscGain1.gain.value = 0.04;
    var oscGain2 = ctx.createGain();
    oscGain2.gain.value = 0.015;

    osc1.connect(oscGain1);
    osc2.connect(oscGain2);
    oscGain1.connect(gainNode);
    oscGain2.connect(gainNode);

    osc1.start();
    osc2.start();

    currentSource = { osc1: osc1, osc2: osc2, gain1: oscGain1, gain2: oscGain2 };
  }

  /* --- Stop Audio --- */
  function stopAudio() {
    if (currentSource) {
      try {
        currentSource.osc1.stop();
        currentSource.osc2.stop();
      } catch (e) { }
      currentSource = null;
    }
    isPlaying = false;
  }

  /* --- Mute Toggle --- */
  function toggleMute() {
    isMuted = !isMuted;
    saveMutePreference();
    updateToggleUI();

    if (isMuted) {
      fadeOut();
    } else {
      if (!isPlaying) {
        startAudio();
      }
      fadeIn();
    }
  }

  function fadeIn() {
    if (!gainNode) return;
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1);
  }

  function fadeOut() {
    if (!gainNode || !audioCtx) return;
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
  }

  /* --- UI --- */
  function updateToggleUI() {
    if (!toggleBtn) return;
    toggleBtn.classList.toggle('muted', isMuted);
    toggleBtn.setAttribute('aria-label', isMuted ? 'Unmute ambient sound' : 'Mute ambient sound');
    toggleBtn.innerHTML = isMuted ? getSpeakerMutedSVG() : getSpeakerSVG();
  }

  function getSpeakerSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
      '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>' +
      '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
      '</svg>';
  }

  function getSpeakerMutedSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
      '<line x1="23" y1="9" x2="17" y2="15"></line>' +
      '<line x1="17" y1="9" x2="23" y2="15"></line>' +
      '</svg>';
  }

  /* --- Persistence --- */
  function saveMutePreference() {
    try {
      localStorage.setItem(STORAGE_KEY, isMuted ? 'muted' : 'unmuted');
    } catch (e) { }
  }

  function restoreMutePreference() {
    try {
      var pref = localStorage.getItem(STORAGE_KEY);
      isMuted = pref !== 'unmuted';
    } catch (e) {
      isMuted = true;
    }
  }

  /* --- Init --- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
