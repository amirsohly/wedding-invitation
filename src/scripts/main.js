/* =====================================================================
   Digital engagement invitation — behaviour (vanilla JS, no dependencies)
   Sections: helpers · data binding · countdown · route-map viewer ·
             music · opening sound · scroll reveal · envelope
   ===================================================================== */
(function () {
  'use strict';

  var D = window.weddingData || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  function toDigits(v) {
    var s = String(v);
    return D.persianDigits === false ? s : s.replace(/\d/g, function (d) { return FA_DIGITS[d]; });
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function get(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, D);
  }
  function store(key, val) {
    try { if (val === null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, val); } catch (e) { /* private mode */ }
  }
  function read(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
  // Scroll lock that keeps the scroll position (works on iOS too).
  var lockedScrollY = 0;
  function lock(on) {
    var html = document.documentElement, body = document.body;
    if (on) {
      lockedScrollY = window.pageYOffset || html.scrollTop || 0;
      body.style.top = -lockedScrollY + 'px';
      html.classList.add('is-locked');
      body.classList.add('is-locked');
    } else {
      html.classList.remove('is-locked');
      body.classList.remove('is-locked');
      body.style.top = '';
      var prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, lockedScrollY);
      html.style.scrollBehavior = prev;
    }
  }

  /* ---------- date & time (automatic Persian calendar) ---------- */
  var target = new Date(D.countdownDate || '');
  var validDate = !isNaN(target.getTime());
  var tz = D.timeZone || 'Asia/Tehran';
  var numbering = D.persianDigits === false ? 'latn' : 'arabext';

  function formatDate() {
    if (D.date) return D.date;
    if (!validDate) return '';
    try {
      // "دوشنبه ۲۰ مهر ۱۴۰۵" — assembled from parts so no locale punctuation sneaks in
      var parts = {};
      new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-' + numbering, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz
      }).formatToParts(target).forEach(function (p) { parts[p.type] = p.value; });
      return [parts.weekday, parts.day, parts.month, parts.year].filter(Boolean).join(' ');
    } catch (e) {
      return toDigits(target.toLocaleDateString('fa-IR'));
    }
  }
  function formatTime() {
    if (D.time) return D.time;
    if (!validDate) return '';
    try {
      var t = new Intl.DateTimeFormat('fa-IR-u-nu-' + numbering, {
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz
      }).format(target);
      return D.timeSuffix ? t + ' ' + D.timeSuffix : t;
    } catch (e) {
      return toDigits(pad2(target.getHours()) + ':' + pad2(target.getMinutes()));
    }
  }

  /* ---------- data binding ---------- */
  var computed = { dateDisplay: formatDate(), timeDisplay: formatTime() };

  $$('[data-bind]').forEach(function (el) {
    var key = el.getAttribute('data-bind');
    var val = Object.prototype.hasOwnProperty.call(computed, key) ? computed[key] : get(key);
    if (Array.isArray(val)) {
      el.textContent = '';
      val.forEach(function (line) {
        var p = document.createElement('p');
        p.textContent = line;
        el.appendChild(p);
      });
    } else {
      el.textContent = val == null ? '' : String(val);
    }
  });

  // links: hide the button when its URL is empty
  $$('[data-href]').forEach(function (el) {
    var url = get(el.getAttribute('data-href'));
    if (url) el.setAttribute('href', url); else el.hidden = true;
  });

  // Latin names (optional)
  var latinEl = $('#namesLatin');
  if (latinEl && (D.brideNameLatin || D.groomNameLatin)) {
    var parts = [D.brideNameLatin, D.groomNameLatin].filter(Boolean);
    parts.forEach(function (name, i) {
      if (i > 0) {
        var amp = document.createElement('span');
        amp.className = 'amp';
        amp.textContent = ' & ';
        latinEl.appendChild(amp);
      }
      latinEl.appendChild(document.createTextNode(name));
    });
    latinEl.hidden = false;
  }

  // couple photo
  var photo = $('#couplePhoto');
  if (photo) {
    if (D.couplePhoto) { photo.src = D.couplePhoto; photo.alt = D.couplePhotoAlt || ''; }
    else { photo.closest('.photo-ring').hidden = true; }
  }

  // the «مکان» row only exists when a hall name is configured
  var venueRow = $('#venueRow');
  if (venueRow && !D.venue) venueRow.hidden = true;

  // page title
  document.title = D.pageTitle || ((D.brideName || '') + ' و ' + (D.groomName || '') + ' · دعوت‌نامه جشن عقد');

  /* ---------- countdown ---------- */
  var cdBox = $('#countdown');
  var cdDone = $('#countdownDone');
  var cdEls = { d: $('#cdDays'), h: $('#cdHours'), m: $('#cdMinutes'), s: $('#cdSeconds') };
  var cdTimer = null;

  function setText(el, v) {
    var t = toDigits(v);
    if (el.textContent !== t) el.textContent = t;
  }
  function tick() {
    var diff = target.getTime() - Date.now();
    if (diff <= 0) {
      cdBox.hidden = true;
      cdDone.hidden = false;
      stopCountdown();
      return;
    }
    var s = Math.floor(diff / 1000);
    setText(cdEls.d, Math.floor(s / 86400));
    setText(cdEls.h, pad2(Math.floor((s % 86400) / 3600)));
    setText(cdEls.m, pad2(Math.floor((s % 3600) / 60)));
    setText(cdEls.s, pad2(s % 60));
  }
  function startCountdown() { stopCountdown(); tick(); if (!cdBox.hidden) cdTimer = setInterval(tick, 1000); }
  function stopCountdown() { if (cdTimer) { clearInterval(cdTimer); cdTimer = null; } }

  if (validDate) {
    startCountdown();
    // don't burn CPU while the tab is hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopCountdown(); else startCountdown();
    });
  } else {
    cdBox.closest('section').hidden = true;
  }

  /* ---------- route map viewer (full screen, pinch / double-tap zoom) ---------- */
  var routeBtn = $('#routeMapBtn');
  var viewer = $('#mapViewer');

  if (routeBtn && viewer && D.routeMapImage) {
    var vImg = $('#viewerImg');
    var vStage = $('#viewerStage');
    var vHint = $('#viewerHint');
    var vOpen = false;
    var vLoaded = false;
    var lastFocus = null;

    // pan / zoom state
    var scale = 1, tx = 0, ty = 0;
    var MIN = 1, MAX = 4;
    var pointers = {};           // active touches
    var startDist = 0, startScale = 1, startMid = null;
    var panning = false, panX = 0, panY = 0, startTx = 0, startTy = 0;
    var lastTap = 0;
    var rot = 0;                 // 0 or 90 — rotating fills a portrait screen with a wide map
    var rotateBtn = $('#viewerRotate');

    routeBtn.hidden = false;
    vImg.alt = D.routeMapAlt || '';

    // translate(-50%,-50%) keeps it centred; pan/zoom/rotation compose after it
    function transformString(s) {
      return 'translate(-50%,-50%) translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + s + ')' +
        (rot ? ' rotate(' + rot + 'deg)' : '');
    }
    function applyTransform(animate) {
      vImg.style.transition = (animate && !reduceMotion) ? 'transform .28s cubic-bezier(.22,.7,.25,1)' : 'none';
      vImg.style.transform = transformString(scale);
    }
    // keep the image from being dragged off screen (width/height swap when rotated)
    function clamp() {
      var s = vStage.getBoundingClientRect();
      var iw = rot ? vImg.clientHeight : vImg.clientWidth;
      var ih = rot ? vImg.clientWidth : vImg.clientHeight;
      var w = iw * scale, h = ih * scale;
      var maxX = Math.max(0, (w - s.width) / 2);
      var maxY = Math.max(0, (h - s.height) / 2);
      tx = Math.min(maxX, Math.max(-maxX, tx));
      ty = Math.min(maxY, Math.max(-maxY, ty));
    }
    function reset(animate) { scale = 1; tx = 0; ty = 0; applyTransform(animate); }

    function zoomTo(newScale, cx, cy) {
      var s = vStage.getBoundingClientRect();
      var ox = cx - s.left - s.width / 2;
      var oy = cy - s.top - s.height / 2;
      var ratio = newScale / scale;
      tx = ox - (ox - tx) * ratio;
      ty = oy - (oy - ty) * ratio;
      scale = newScale;
      clamp();
    }

    // Size the rotated image so it fits the stage once turned 90°, uncropped.
    function sizeRotated() {
      if (!rot || !vImg.naturalWidth) { vImg.style.removeProperty('--rot-w'); return; }
      var s = vStage.getBoundingClientRect();
      var ratio = vImg.naturalWidth / vImg.naturalHeight;
      vImg.style.setProperty('--rot-w', Math.round(Math.min(s.height, s.width * ratio)) + 'px');
    }
    function setRotation(next) {
      rot = next ? 90 : 0;
      vImg.classList.toggle('is-rotated', !!rot);
      sizeRotated();
      if (rotateBtn) rotateBtn.setAttribute('aria-pressed', rot ? 'true' : 'false');
      reset(true);
    }
    // offer rotation only when it actually buys space: wide image, tall screen
    function updateRotateBtn() {
      if (!rotateBtn) return;
      var s = vStage.getBoundingClientRect();
      var wide = vImg.naturalWidth > vImg.naturalHeight * 1.2;
      rotateBtn.hidden = !(wide && s.height > s.width * 1.1);
      if (rotateBtn.hidden && rot) setRotation(false);
    }
    if (rotateBtn) rotateBtn.addEventListener('click', function () { setRotation(!rot); });
    vImg.addEventListener('load', function () { updateRotateBtn(); sizeRotated(); });
    window.addEventListener('resize', function () {
      if (!vOpen) return;
      updateRotateBtn();
      sizeRotated();
      clamp();
      applyTransform(false);
    });

    function openViewer() {
      if (!vLoaded) { vImg.src = D.routeMapImage; vLoaded = true; }
      lastFocus = document.activeElement;
      vOpen = true;
      viewer.hidden = false;
      lock(true);
      scale = 1; tx = 0; ty = 0;
      vImg.style.transition = 'none';
      vImg.style.transform = transformString(reduceMotion ? 1 : 0.97);
      if (vHint) vHint.hidden = false;
      requestAnimationFrame(function () {
        viewer.classList.add('is-open');
        updateRotateBtn();
        sizeRotated();
        applyTransform(true);          // 0.97 → 1
      });
      $('#viewerClose').focus({ preventScroll: true });
    }
    function closeViewer() {
      if (!vOpen) return;
      vOpen = false;
      viewer.classList.remove('is-open');
      if (!reduceMotion) {
        vImg.style.transition = 'transform .24s ease-in';
        vImg.style.transform = transformString(scale * 0.97);
      }
      lock(false);
      setTimeout(function () { viewer.hidden = true; setRotation(false); }, reduceMotion ? 0 : 240);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    routeBtn.addEventListener('click', openViewer);
    $('#viewerClose').addEventListener('click', closeViewer);
    $('#viewerBackdrop').addEventListener('click', closeViewer);
    document.addEventListener('keydown', function (e) {
      if (!vOpen) return;
      if (e.key === 'Escape') closeViewer();
      else if (e.key === '+' || e.key === '=') { zoomTo(Math.min(MAX, scale * 1.4), innerWidth / 2, innerHeight / 2); applyTransform(true); }
      else if (e.key === '-') { zoomTo(Math.max(MIN, scale / 1.4), innerWidth / 2, innerHeight / 2); applyTransform(true); }
    });

    // --- double tap / double click: toggle 2.4× at the tapped point ---
    function toggleZoom(cx, cy) {
      if (scale > 1.05) { reset(true); }
      else { zoomTo(2.4, cx, cy); applyTransform(true); if (vHint) vHint.hidden = true; }
    }
    vStage.addEventListener('dblclick', function (e) { toggleZoom(e.clientX, e.clientY); });

    // --- touch: pinch to zoom, drag to pan ---
    if (window.PointerEvent) {
      vStage.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        var ids = Object.keys(pointers);
        if (ids.length === 1) {
          var now = Date.now();
          if (e.pointerType === 'touch' && now - lastTap < 300) { toggleZoom(e.clientX, e.clientY); lastTap = 0; return; }
          lastTap = now;
          panning = scale > 1.01;
          panX = e.clientX; panY = e.clientY; startTx = tx; startTy = ty;
        } else if (ids.length === 2) {
          panning = false;
          var a = pointers[ids[0]], b = pointers[ids[1]];
          startDist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
          startScale = scale;
          startMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          if (vHint) vHint.hidden = true;
        }
        try { vStage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });

      vStage.addEventListener('pointermove', function (e) {
        if (!pointers[e.pointerId]) return;
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        var ids = Object.keys(pointers);
        if (ids.length >= 2) {
          var a = pointers[ids[0]], b = pointers[ids[1]];
          var dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
          var next = Math.min(MAX, Math.max(MIN, startScale * (dist / startDist)));
          zoomTo(next, startMid.x, startMid.y);
          applyTransform(false);
          e.preventDefault();
        } else if (panning) {
          tx = startTx + (e.clientX - panX);
          ty = startTy + (e.clientY - panY);
          clamp();
          applyTransform(false);
          e.preventDefault();
        }
      });

      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) {
        vStage.addEventListener(type, function (e) {
          delete pointers[e.pointerId];
          if (!Object.keys(pointers).length) {
            panning = false;
            if (scale <= 1.02) reset(true); else { clamp(); applyTransform(true); }
          }
        });
      });
    }
  } else if (routeBtn) {
    routeBtn.hidden = true;
  }

  /* ---------- music ---------- */
  var audio = $('#bgm');
  var musicBtn = $('#musicToggle');
  var hasMusic = !!D.musicUrl;
  var musicWanted = hasMusic && read('wedding-music') !== 'off';

  function setMusicUI(on) {
    musicBtn.classList.toggle('is-playing', on);
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', on ? 'توقف موسیقی' : 'پخش موسیقی');
  }
  function playMusic() {
    if (!hasMusic) return;
    if (!audio.getAttribute('src')) audio.src = D.musicUrl;
    var p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(function () { setMusicUI(false); });
  }
  if (hasMusic) {
    musicBtn.hidden = false;
    audio.addEventListener('play', function () { setMusicUI(true); });
    audio.addEventListener('pause', function () { setMusicUI(false); });
    musicBtn.addEventListener('click', function () {
      if (audio.paused) { store('wedding-music', 'on'); playMusic(); }
      else { store('wedding-music', 'off'); audio.pause(); }
    });
  }

  /* ---------- opening sound (tiny procedural paper swish, no audio file) ---------- */
  function playOpeningSound() {
    if (D.openingSound === false) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      var sr = ctx.sampleRate;
      var noise = ctx.createBuffer(1, Math.floor(sr * 1.6), sr);
      var data = noise.getChannelData(0);
      for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      // one filtered noise burst = one paper movement
      function swish(at, dur, f0, f1, vol) {
        var src = ctx.createBufferSource();
        src.buffer = noise;
        var band = ctx.createBiquadFilter();
        band.type = 'bandpass';
        band.Q.value = 0.9;
        band.frequency.setValueAtTime(f0, at);
        band.frequency.exponentialRampToValueAtTime(f1, at + dur * 0.7);
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(vol, at + dur * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        src.connect(band); band.connect(gain); gain.connect(ctx.destination);
        src.start(at);
        src.stop(at + dur);
      }
      var t = ctx.currentTime;
      swish(t + 0.14, 0.62, 700, 2400, 0.085);  // flap lifting
      swish(t + 0.52, 1.10, 1500, 480, 0.065);  // card sliding out of the pocket
      swish(t + 1.62, 0.28, 900, 300, 0.035);   // card settling
      setTimeout(function () { if (ctx.close) ctx.close(); }, 2400);
    } catch (e) { /* audio is optional */ }
  }

  /* ---------- scroll reveal ---------- */
  function startReveal() {
    var els = $$('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- envelope ---------- */
  var env = $('#envelope');
  var seal = $('#seal');
  var main = $('#invitation');
  var opened = false;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  function openEnvelope() {
    if (opened) return;
    opened = true;
    // must happen inside the user gesture so mobile browsers allow audio
    playOpeningSound();
    if (musicWanted) playMusic();

    env.classList.add('is-opening');
    var revealAt = reduceMotion ? 60 : 1850;
    var doneAt = reduceMotion ? 480 : 2500;

    setTimeout(function () {
      env.classList.add('is-revealing');
      main.removeAttribute('inert');
      lockedScrollY = 0;
      lock(false);
      document.body.classList.add('is-open');
      startReveal();
    }, revealAt);

    setTimeout(function () {
      if (env.parentNode) env.parentNode.removeChild(env);
    }, doneAt);
  }

  seal.addEventListener('click', function (e) { e.stopPropagation(); openEnvelope(); });
  env.addEventListener('click', openEnvelope);
})();
