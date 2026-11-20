(function () {
  'use strict';
  var D = window.DICT;
  var app = document.getElementById('app');
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (IOS) document.documentElement.classList.add('ios');
  var K = function (k) { return app.querySelector('[data-k="' + k + '"]'); };
  var EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
  var OUT = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

  // remember starting inline styles so "back to the envelope" can reset
  var initial = new Map();
  app.querySelectorAll('[data-k]').forEach(function (el) { initial.set(el, el.getAttribute('style') || ''); });
  function reset() {
    initial.forEach(function (st, el) {
      el.getAnimations && el.getAnimations().forEach(function (a) { a.cancel(); });
      el.setAttribute('style', st);
    });
  }
  function anim(el, frames, opts) {
    if (!el) return null;
    opts = Object.assign({ fill: 'forwards', easing: EASE }, opts);
    if (reduce) { opts.duration = 1; opts.delay = 0; }
    return el.animate(frames, opts);
  }

  /* ---------------- language ---------------- */
  var lang = 'en';
  try { lang = localStorage.getItem('ca-lang') || 'en'; } catch (e) {}
  if (!D[lang]) lang = 'en';
  var hintKey = 'tap';
  function apply(l) {
    var t = D[l];
    app.querySelectorAll('[data-t]').forEach(function (el) {
      var k = el.getAttribute('data-t');
      if (k === 'tap' || k === 'yourInvite') k = hintKey;
      if (t[k] != null) el.textContent = t[k];
    });
    app.setAttribute('lang', l);
    document.documentElement.lang = l;
    app.querySelectorAll('[data-dev]').forEach(function (el) { el.style.display = l === 'en' ? '' : 'none'; });
    app.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.dataset.lang === l;
      b.style.background = on ? '#D4B679' : 'transparent';
      b.style.color = on ? '#2A0910' : '#F1EADC';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  // text length changes with the language, so every scroll scene re-measures itself right away
  function relayout() { requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); window.dispatchEvent(new Event('scroll')); }); }
  function setLang(l, e) {
    if (e) e.stopPropagation();
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem('ca-lang', l); } catch (err) {}
    if (reduce || !body.classList.contains('opened')) { apply(l); relayout(); return; }
    app.classList.add('swap');
    setTimeout(function () { apply(l); app.classList.remove('swap'); onScroll(); relayout(); }, 190);
  }
  app.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function (e) { setLang(b.dataset.lang, e); });
  });
  apply(lang);

  /* ---------------- gold dust ---------------- */
  function dust(host, n) {
    if (reduce || !host) return;
    var box = document.createElement('div'); box.className = 'dust'; box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i'), s = 2 + Math.random() * 2.5;
      d.style.width = d.style.height = s + 'px';
      d.style.left = (Math.random() * 100) + '%';
      d.style.setProperty('--dx', ((Math.random() - 0.5) * 60) + 'px');
      d.style.animationDuration = (7 + Math.random() * 8) + 's';
      d.style.animationDelay = (-Math.random() * 14) + 's';
      box.appendChild(d);
    }
    host.insertBefore(box, host.firstChild);
  }
  dust(K('loader'), 16);
  dust(K('env'), 14);
  var g = K('ld-g'); if (g && g.firstElementChild) g.firstElementChild.classList.add('halo');

  /* ---------------- Ganesh loader ---------------- */
  var ld = 0, lt = [], linesAt = 0;
  function linesDone() { return ld >= 3 && Date.now() - linesAt > (reduce ? 0 : 500); }
  function stage(s) {
    ld = s;
    if (s === 1) { var e = K('ld-g'); e.style.opacity = 1; e.style.transform = 'scale(1)'; var en0 = K('env-enter'); en0.style.transform = 'translateY(0)'; en0.style.opacity = 1; }
    if (s === 2) K('ld-l0').style.opacity = 1;
    if (s === 3) { K('ld-l1').style.opacity = 1; K('ld-l2').style.opacity = 1; linesAt = Date.now(); }
    if (s === 4) K('ld-dia').style.opacity = 1;
    if (s === 5) {
      K('loader').style.transform = 'translateY(-105%)';
      K('loader').style.pointerEvents = 'none';
      K('env-top').style.transform = 'translateY(0)';
      var en = K('env-enter'); en.style.transform = 'translateY(0)'; en.style.opacity = 1;
    }
    if (s === 6) K('loader').style.display = 'none';
  }
  function startLoader() {
    lt.forEach(clearTimeout);
    var plan = reduce ? [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 50]] : [[1, 150], [2, 700], [3, 900], [4, 1300], [5, 1500], [6, 1600]];
    lt = plan.map(function (p) { return setTimeout(function () { stage(p[0]); }, p[1]); });
  }
  K('loader').addEventListener('click', function () {
    if (ld >= 5 || !linesDone()) return;
    lt.forEach(clearTimeout);
    stage(1); stage(2); stage(3); stage(4); stage(5);
    lt = [setTimeout(function () { stage(6); }, 1200)];
  });
  startLoader();

  /* ---------------- envelope opening (GPU-only, no re-rendering) ---------------- */
  var opened = false, busy = false, ot = [];
  function later(fn, ms) { ot.push(setTimeout(fn, reduce ? 0 : ms)); }
  function open() {
    if (busy || ld < 5) return;
    busy = true;
    hintKey = 'yourInvite';
    var env = K('env'), flap = K('env-flap');
    // stop the idle bob so the opening reads cleanly
    var bob = K('env-bob'); if (bob) bob.style.animation = 'none';
    anim(K('env-hint'), [{ opacity: 1 }, { opacity: 0 }], { duration: 350 });
    anim(K('env-seal'), [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 420, easing: OUT });
    anim(K('env-prog-in'), [{ width: '0%' }, { width: '100%' }], { duration: 4000, easing: 'linear' });
    anim(flap, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(180deg)' }], { duration: 1300, delay: 320 });
    later(function () { body.classList.add('opening'); }, 450);
    later(function () { flap.style.zIndex = 1; }, 970);
    // Ganesh ji blesses the opening, then rises and fades away as the flap lifts
    var eg = document.querySelector('.eg');
    if (eg) anim(eg, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-24px) scale(.94)' }], { duration: 700, delay: 250, easing: OUT });
    [K('env-lang'), K('env-prog')].forEach(function (el) {
      anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 1600 });
    });
    anim(K('env-shift'), [{ transform: 'translateY(0)' }, { transform: 'translateY(20%)' }], { duration: 1500, delay: 1850 });
    var ia = document.querySelector('.inv-above'); if (ia) anim(ia, [{ transform: 'none' }, { transform: 'translateY(-138px) scale(1.12)' }], { duration: 1400, delay: 1500, easing: OUT });
    anim(K('env-letter'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-38%)' }], { duration: 1500, delay: 1850 });
    // dive in: the envelope rushes past the camera and the Two homes scene settles into view, layer by layer
    later(function () {
      var SOFT = 'cubic-bezier(.45,0,.2,1)', OUT2 = 'cubic-bezier(.2,.8,.2,1)';
      body.classList.add('diving');
      window.scrollTo(0, 0);
      var stick = document.querySelector('.th-stick'), names = [].slice.call(document.querySelectorAll('.th-names > *'));
      var bank = document.querySelector('.th-bank'), lv = document.querySelectorAll('.th-leaf'), ttl = document.querySelector('.th-title');
      anim(env, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 1, offset: 0.55 }, { transform: 'scale(3.4)', opacity: 0 }], { duration: 1500, easing: SOFT });
      if (stick) anim(stick, [{ transform: 'scale(1.7)', filter: 'brightness(1.2)' }, { transform: 'scale(1)', filter: 'brightness(1)' }], { duration: 2600, easing: OUT2, fill: 'none' });
      if (bank) anim(bank, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 1400, delay: 1100, easing: OUT2 });
      if (lv[0]) anim(lv[0], [{ transform: 'translate(-60%,-60%) rotate(-20deg)' }, { transform: 'none' }], { duration: 1500, delay: 1000, easing: OUT2 });
      if (lv[1]) anim(lv[1], [{ transform: 'scaleX(-1) translate(-60%,-60%) rotate(-20deg)' }, { transform: 'scaleX(-1)' }], { duration: 1500, delay: 1000, easing: OUT2 });
      later(function () {
        K('envsec').style.display = 'none'; env.style.pointerEvents = 'none';
        K('invite').style.transform = 'none';
        K('nav').style.transform = 'translateY(0)';
        body.classList.remove('locked', 'opening', 'diving'); body.classList.add('opened');
        if (ttl) anim(ttl, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 1000, easing: OUT2, fill: 'none' });
        names.forEach(function (n, i) { anim(n, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: 600 + i * 220, easing: OUT2, fill: 'backwards' }); });
        petals();
        opened = true; busy = false; onScroll();
      }, 1450);
    }, 3200);
  }
  K('env').addEventListener('click', open);

  /* open on scroll / swipe / arrow keys as well as tap */
  var cool = 0, ty = null;
  function nudge() {
    if (opened || busy) return;
    var now = Date.now(); if (now < cool) return;
    if (ld < 5) { if (!linesDone()) return; lt.forEach(clearTimeout); stage(4); stage(5); stage(6); }
    open();
  }
  window.addEventListener('wheel', function (e) { if (!opened && e.deltaY > 6) nudge(); }, { passive: true });
  window.addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (ty != null && !opened && ty - e.touches[0].clientY > 28) { ty = null; nudge(); } }, { passive: true });
  window.addEventListener('keydown', function (e) { if (!opened && (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ')) { e.preventDefault(); nudge(); } });
  K('env').setAttribute('tabindex', '0');
  K('env').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });

  var rp = K('replay');
  if (rp) rp.addEventListener('click', function () {
    ot.forEach(clearTimeout); ot = []; lt.forEach(clearTimeout);
    window.scrollTo({ top: 0, behavior: 'instant' });
    var eg0 = document.querySelector('.eg'); if (eg0 && eg0.getAnimations) eg0.getAnimations().forEach(function (a) { a.cancel(); });
    reset(); hintKey = 'tap'; apply(lang);
    body.classList.add('locked'); body.classList.remove('opened');
    opened = false; busy = false; ld = 0;
    startLoader();
  });

  /* ---------------- Two homes: callouts pop in one by one ---------------- */
  (function () {
    var art = document.querySelector('.th-art'); if (!art) return;
    var keys = ['pich', 'pait', 'house', 'fort', 'samai'], done = false;
    function pop(k, d) {
      setTimeout(function () {
        art.querySelectorAll('[data-i="' + k + '"]').forEach(function (el) {
          if (el.classList.contains('th-dot')) el.classList.add('on');
        });
        setTimeout(function () { var a = art.querySelector('.th-arrow[data-i="' + k + '"]'); if (a) a.classList.add('on'); }, 250);
        setTimeout(function () { var l = art.querySelector('.th-lab[data-i="' + k + '"]'); if (l) l.classList.add('on'); }, 700);
      }, reduce ? 0 : d);
    }
    function play() { if (done) return; done = true; keys.forEach(function (k, i) { pop(k, i * 700); }); }
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { play(); o.disconnect(); } }, { threshold: 0.35 });
      o.observe(art);
    } else play();
    /* scroll-driven: callouts give way to family photos */
    var sec = document.getElementById('homes');
    var pols = [].slice.call(art.querySelectorAll('.th-pol')), tags = [].slice.call(art.querySelectorAll('.th-tag'));
    var calls = [].slice.call(art.querySelectorAll('.th-dot,.th-lab,.th-arrow'));
    var cols = [].slice.call(art.querySelectorAll('.th-col')), one = art.querySelector('.th-one');
    var rots = { bride: [-6, 4, -3], groom: [5, -4, 3] };
    function c01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function eo(x) { return 1 - Math.pow(1 - x, 3); }
    var tk = false;
    var TCH = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if (TCH || IOS) { TCH = true; sec.classList.add('touch'); pols.forEach(function (el) { el.style.setProperty('--r', rots[el.dataset.s][+el.dataset.n] + 'deg'); }); }
    if (IOS) {   // iPhone: nothing pinned or tied to scrolling; the families arrive on a timer once the scene is on screen
      var played = false;
      var go = function () {
        if (played) return; played = true;
        tags.forEach(function (t) { t.classList.add('in'); });
        pols.forEach(function (el) { var d = (el.dataset.s === 'bride' ? 0 : 900) + (+el.dataset.n) * 220; setTimeout(function () { el.classList.add('in'); }, 300 + d); });
        setTimeout(function () { sec.classList.add('joined'); tags.forEach(function (t) { t.classList.remove('in'); }); }, 3300);
      };
      if ('IntersectionObserver' in window) { var io2 = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { go(); io2.disconnect(); } }, { threshold: 0.55 }); io2.observe(art); } else go();
    }
    function upd() {
      tk = false;
      if (IOS) return;
      var r = sec.getBoundingClientRect(), span = sec.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      var p = c01(-r.top / span);
      if (TCH) {
        if (p < 0.03) { pols.forEach(function (el) { el.classList.remove('in'); }); tags.forEach(function (t) { t.classList.remove('in'); }); sec.classList.remove('joined'); return; }
        pols.forEach(function (el) { var k = el.dataset.s === 'bride' ? 0 : 0.24; if (p > 0.1 + k + (+el.dataset.n) * 0.06) el.classList.add('in'); });
        if (p > 0.7) sec.classList.add('joined'); else if (p < 0.6) sec.classList.remove('joined');
        var j = sec.classList.contains('joined');
        tags.forEach(function (t, i) { if (j) t.classList.remove('in'); else if (p > 0.1 + i * 0.22) t.classList.add('in'); });
        return;
      }
      var fade = c01((p - 0.28) / 0.12);
      calls.forEach(function (el) { el.style.opacity = el.classList.contains('on') ? String(1 - fade) : ''; });
      // 1) each side arrives on its own: bride's family from the left, then the groom's from the right
      // 2) then both families drift to the centre and meet as one
      var join = reduce ? 1 : eo(c01((p - 0.66) / 0.22));
      tags.forEach(function (t, i) { t.style.opacity = (c01((p - 0.1 - i * 0.22) / 0.08) * c01(1 - join * 3)).toFixed(3); });
      cols.forEach(function (c, i) { var d = i === 0 ? 1 : -1; c.style.transform = 'translateX(' + (d * 26 * join).toFixed(2) + '%) scale(' + (1 - 0.1 * join).toFixed(3) + ')'; });
      if (one) { one.style.opacity = join.toFixed(3); one.style.transform = 'translateY(' + (14 * (1 - join)).toFixed(1) + 'px)'; }
      pols.forEach(function (el) {
        var side = el.dataset.s, n = +el.dataset.n, k = side === 'bride' ? 0 : 0.24;
        var t = reduce ? 1 : eo(c01((p - 0.12 - k - n * 0.06) / 0.14));
        var dir = side === 'bride' ? -1 : 1;
        el.style.opacity = t.toFixed(3);
        var rot = rots[side][n] * (1 - 0.6 * join) + dir * 8 * (1 - t);
        el.style.transform = 'translate(' + (dir * 55 * (1 - t)).toFixed(1) + '%,' + (40 * (1 - t)).toFixed(1) + 'px) scale(' + (0.9 + 0.1 * t).toFixed(3) + ') rotate(' + rot.toFixed(2) + 'deg)';
      });
    }
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener('resize', upd); upd();
    art.querySelectorAll('.th-dot').forEach(function (d) {
      d.addEventListener('click', function () {
        var l = art.querySelector('.th-lab[data-i="' + d.dataset.i + '"]');
        l.classList.remove('on'); void l.offsetWidth; l.classList.add('on');
      });
    });
  })();

  /* ---------------- scroll flow: things grow in as they arrive, shrink away as they leave ---------------- */
  (function () {
    if (reduce || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) return;   // touch screens: skip, it shakes on iPhone
    var sels = ['#top > div:first-child', '#events > .diyas', '#events > div:nth-child(2) > div:first-child', '#venue > div', 'footer > div:nth-child(2)'];
    var els = [];
    sels.forEach(function (q) { document.querySelectorAll(q).forEach(function (el) { if (els.indexOf(el) < 0) { el.setAttribute('data-flow', ''); els.push(el); } }); });
    var stick = document.querySelector('.th-stick'), art = document.querySelector('.th-art'), sec = document.getElementById('homes');
    function c01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    var tk = false;
    function flow() {
      tk = false;
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var enter = c01((vh - r.top) / (vh * 0.85));
        var exit = c01((vh * 0.35 - r.bottom) / (vh * 0.35));
        var s = (0.94 + 0.06 * enter) * (1 - 0.05 * exit);
        el.style.transform = 'scale(' + s.toFixed(4) + ')';
        el.style.opacity = (Math.min(0.55 + 0.45 * enter, 1 - 0.4 * exit)).toFixed(3);
      });
      if (art && sec) {
        var rs = sec.getBoundingClientRect(), span = sec.offsetHeight - vh;
        var p = span > 0 ? c01(-rs.top / span) : 0;
        var inn = c01((vh - rs.top) / vh);              // arriving: big -> settled
        var out = c01((p - 0.82) / 0.18);               // leaving: settles small
        art.style.transform = 'scale(' + ((1.06 - 0.06 * inn) * (1 - 0.06 * out)).toFixed(4) + ')';
      }
    }
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(flow); } }, { passive: true });
    window.addEventListener('resize', flow); flow();
  })();

  /* ---------------- Our Story: the path from colleagues to forever draws as you scroll ---------------- */
  (function () {
    var path = document.querySelector('.st-path'); if (!path) return;
    var line = path.querySelector('.st-line'), steps = [].slice.call(path.querySelectorAll('.st-step'));
    var tk = false;
    function upd() {
      tk = false;
      var r = path.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.45)));
      line.style.setProperty('--p', p.toFixed(3));
      steps.forEach(function (s, i) { s.classList.toggle('on', p >= i / 3 - 0.001); });
    }
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  })();

  /* ---------------- Celebrations: diyas light up when they come into view ---------------- */
  (function () {
    var row = document.querySelector('.diyas'); if (!row) return;
    if (!('IntersectionObserver' in window)) { row.classList.add('lit'); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { row.classList.add('lit'); o.disconnect(); } }, { threshold: 0.6 });
    o.observe(row);
  })();

  /* ---------------- Our Story photo booth: scroll picks the photo, CSS transitions do the moving (smooth on phones) ---------------- */
  (function () {
    var wrap = document.querySelector('.b-wrap'); if (!wrap) return;
    var st = wrap.querySelector('.bx-strip'), mono = st.querySelector('.bx-mono'), bx = wrap.querySelector('.bx');
    var figs = [].slice.call(wrap.querySelectorAll('.bx-f')).sort(function (a, b) { return a.dataset.i - b.dataset.i; });
    var caps = [].slice.call(document.querySelectorAll('.b-c'));
    var big = wrap.querySelector('.bx-big'), bigImg = big.querySelector('img'), full = wrap.querySelector('.bx-full');
    var N = figs.length, tShow = 0;
    function c01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function park(i) {
      // put the big print exactly over its frame on the strip (no transition), so it can grow out of it
      var f = figs[i]; if (!f) return;
      var fr = f.getBoundingClientRect(), br = bx.getBoundingClientRect(), bw = big.offsetWidth || 1;
      big.style.setProperty('--tx', ((fr.left + fr.width / 2) - (br.left + br.width / 2)).toFixed(1) + 'px');
      big.style.setProperty('--ty', ((fr.top + fr.height / 2) - (br.top + br.height * 0.42)).toFixed(1) + 'px');
      big.style.setProperty('--s0', (fr.width / (bw * 0.93)).toFixed(3));
    }
    function apply(k) {
      var shown = Math.max(0, Math.min(N, k + 1));
      var fh = figs[0].offsetHeight, gap = 4, H = st.offsetHeight;
      var y = shown * (fh + gap) + (k >= N ? mono.offsetHeight + gap : 0) - H;
      st.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      figs.forEach(function (f, i) { f.classList.toggle('dev', i < shown); });
      caps.forEach(function (c, i) { c.classList.toggle('on', i === Math.min(k, N - 1) && k >= 0); });
      full.classList.toggle('on', k >= N);
      // big print: tuck the current one back, then lift the new one once the strip has fed
      clearTimeout(tShow);
      if (big.classList.contains('on')) big.classList.remove('on');
      if (k >= 0 && k < N) {
        tShow = setTimeout(function () {
          bigImg.src = figs[k].querySelector('img').getAttribute('src');
          big.classList.add('snap'); park(k); void big.offsetWidth; big.classList.remove('snap');
          requestAnimationFrame(function () { big.classList.add('on'); });
        }, reduce ? 0 : 750);
      }
    }
    // one swipe = one photo: the page snaps to a stop for each photo and waits for the next swipe
    var cur = -2, tk = false;
    function upd() {
      tk = false;
      var r = wrap.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var k = Math.max(0, Math.min(N, Math.round(-r.top / vh)));
      if (r.top > vh * 0.5) k = -1;
      if (k !== cur) { cur = k; apply(k); }
    }
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true });
    var bw0 = window.innerWidth;
    window.addEventListener('resize', function () { if (window.innerWidth !== bw0) { bw0 = window.innerWidth; cur = -2; } upd(); });
    upd();
    apply(-1);
  })();

  /* ---------------- Our Story picture book: swipe, arrows and dots ---------------- */
  (function () {
    var tr = document.querySelector('.pb-track'); if (!tr) return;
    var pgs = [].slice.call(tr.querySelectorAll('.pb-pg')), dots = [].slice.call(document.querySelectorAll('.pb-dots i'));
    var arrs = [].slice.call(document.querySelectorAll('.pb-arr')), cur = -1, tk = false, opened = false, book = document.querySelector('.pb');
    // split each line into words so it can be "written" onto the page like a storybook
    function split(p) {
      var sp = p.querySelector('figcaption span'); if (!sp) return;
      var words = sp.textContent.trim().split(/\s+/);
      sp.innerHTML = words.map(function (w, i) { return '<i class="w" style="font-style:inherit;transition-delay:' + (0.25 + i * 0.12).toFixed(2) + 's">' + w + '</i>'; }).join(' ');
    }
    function tell(p) { if (!p || p.classList.contains('told')) return; split(p); void p.offsetWidth; p.classList.add('told'); }
    // language changes rewrite the captions; re-split whatever is already told
    function retell() { pgs.forEach(function (p) { if (p.classList.contains('told')) { p.classList.remove('told'); tell(p); } }); }
    new MutationObserver(function () { setTimeout(retell, 30); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    // the cover opens by itself when the book comes into view, then the first page tells its line
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; io.disconnect();
        setTimeout(function () { book.classList.add('open'); setTimeout(function () { opened = true; tell(pgs[Math.max(0, cur)]); }, reduce ? 0 : 1100); }, reduce ? 0 : 350);
      }, { threshold: 0.55 });
      io.observe(book);
    } else { book.classList.add('open'); opened = true; }
    function mark() {
      tk = false;
      var mid = tr.scrollLeft + tr.clientWidth / 2, best = 0, bd = 1e9;
      pgs.forEach(function (p, i) { var d = Math.abs(p.offsetLeft + p.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
      if (best === cur) return; cur = best;
      pgs.forEach(function (p, i) { p.classList.toggle('on', i === cur); });
      if (opened) tell(pgs[cur]);
      dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
      arrs[0].disabled = cur === 0; arrs[1].disabled = cur === pgs.length - 1;
    }
    function go(i) { i = Math.max(0, Math.min(pgs.length - 1, i)); var p = pgs[i]; tr.scrollTo({ left: p.offsetLeft - (tr.clientWidth - p.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); }
    tr.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(mark); } }, { passive: true });
    arrs.forEach(function (a) { a.addEventListener('click', function () { go(cur + (+a.dataset.d)); }); });
    tr.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });
    window.addEventListener('resize', function () { cur = -1; mark(); });
    mark();
  })();

  /* ---------------- marigold garlands carry you from Our Story into the celebrations ---------------- */
  (function () {
    var sec = document.querySelector('.mg'); if (!sec) return;
    var box = sec.querySelector('.mg-str'), bg = sec.querySelector('.mg-bg'), stick = sec.querySelector('.mg-stick'), story = document.getElementById('story');
    var NS = 'http://www.w3.org/2000/svg';
    // one ruffled marigold, built once as a symbol and reused
    var defs = document.createElementNS(NS, 'svg'); defs.setAttribute('width', 0); defs.setAttribute('height', 0); defs.style.position = 'absolute';
    var rings = [[46, 20, '#E8740C', '#C2500A'], [38, 18, '#F38B14', '#D9620B'], [29, 16, '#F9A51E', '#E57F10'], [19, 13, '#FFBE3A', '#F29A18'], [10, 10, '#FFD266', '#F6AE2A']];
    var g = '<defs>';
    rings.forEach(function (r, i) { g += '<radialGradient id="mgg' + i + '" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="' + r[2] + '"/><stop offset="1" stop-color="' + r[3] + '"/></radialGradient>'; });
    g += '</defs><symbol id="mgf" viewBox="-50 -50 100 100">';
    rings.forEach(function (r, i) {
      var cnt = r[1];
      for (var k = 0; k < cnt; k++) {
        var a = (360 / cnt) * k + i * 9 + (k % 2) * 4, len = r[0] * (0.9 + ((k * 7 + i * 3) % 5) * 0.03);
        g += '<path fill="url(#mgg' + i + ')" stroke="rgba(150,60,0,.35)" stroke-width=".6" transform="rotate(' + a.toFixed(1) + ')" d="M0 0 C' + (len * 0.18).toFixed(1) + ' ' + (-len * 0.35).toFixed(1) + ' ' + (len * 0.2).toFixed(1) + ' ' + (-len * 0.8).toFixed(1) + ' 0 ' + (-len).toFixed(1) + ' C' + (-len * 0.2).toFixed(1) + ' ' + (-len * 0.8).toFixed(1) + ' ' + (-len * 0.18).toFixed(1) + ' ' + (-len * 0.35).toFixed(1) + ' 0 0Z"/>';
      }
    });
    g += '<circle r="5" fill="#C9700C"/></symbol>';
    defs.innerHTML = g; document.body.appendChild(defs);
    var strands = [], flower = null;
    // draw the marigold once into a bitmap, then paint each garland as ONE pre-rendered image (no per-flower DOM)
    (function () {
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="-50 -50 100 100">' + defs.innerHTML.replace('<symbol id="mgf" viewBox="-50 -50 100 100">', '<g>').replace('</symbol>', '</g>') + '</svg>';
      var im = new Image();
      im.onload = function () { flower = im; build(); };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    })();
    function tile(fs, seed) {
      var dpr = Math.min(2, window.devicePixelRatio || 1), step = fs * 0.62, n = 9, w = Math.ceil(fs * 1.1), h = Math.ceil(step * n);
      var cv = document.createElement('canvas'); cv.width = w * dpr; cv.height = h * dpr;
      var x = cv.getContext('2d'); x.scale(dpr, dpr);
      x.strokeStyle = 'rgba(120,70,20,.5)'; x.lineWidth = 1; x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke();
      x.shadowColor = 'rgba(60,20,0,.35)'; x.shadowBlur = 4; x.shadowOffsetY = 3;
      for (var k = -1; k <= n; k++) {
        var cy = k * step + step / 2, sc = 0.92 + ((k + seed + 9) % 3) * 0.05, s = fs * sc;
        x.save(); x.translate(w / 2, cy); x.rotate(((k * 47 + seed * 23) % 360) * Math.PI / 180);
        x.drawImage(flower, -s / 2, -s / 2, s, s); x.restore();
        var q = ((k + 9) + seed * 3) % 9;
        if (q === 4) { var g = x.createRadialGradient(w / 2 - 2, cy + step / 2 - 2, 1, w / 2, cy + step / 2, fs * 0.13); g.addColorStop(0, '#FFD9DF'); g.addColorStop(0.6, '#C2183A'); g.addColorStop(1, '#7A0A20'); x.fillStyle = g; x.beginPath(); x.arc(w / 2, cy + step / 2, fs * 0.12, 0, 7); x.fill(); }
        else if (q === 8) { x.fillStyle = '#4E7A2C'; x.beginPath(); x.ellipse(w / 2 + fs * 0.12, cy + step / 2, fs * 0.24, fs * 0.09, -0.5, 0, 7); x.fill(); }
      }
      return { url: cv.toDataURL('image/png'), w: w, h: h };
    }
    var secTop = 0, secH = 1, storyBot = 0;
    function measure() { var sy = window.scrollY; secTop = sec.getBoundingClientRect().top + sy; secH = sec.offsetHeight; storyBot = story.getBoundingClientRect().bottom + sy; }
    window.addEventListener('load', function () { measure(); upd(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); });
    var near = false;
    window.addEventListener('resize', function () { measure(); upd(); });
    function build() {
      if (!flower) return;
      measure();
      box.innerHTML = ''; strands = [];
      var W = box.clientWidth, H = box.clientHeight;
      var cols = W < 600 ? 9 : 15, w = W / cols, fs = w * 1.25;
      var tiles = [tile(fs, 0), tile(fs, 1), tile(fs, 2)];
      for (var c = 0; c < cols; c++) {
        var t = tiles[c % 3], s = document.createElement('div'); s.className = 'mg-s';
        s.style.left = (c * w + w / 2 - t.w / 2).toFixed(1) + 'px'; s.style.width = t.w + 'px'; s.style.height = (H + 80) + 'px';
        s.style.backgroundImage = 'url(' + t.url + ')'; s.style.backgroundSize = t.w + 'px ' + t.h + 'px';
        s.style.backgroundPosition = '0 ' + (-((c * 37) % 60)) + 'px';
        box.appendChild(s);
        var mid = (c + 0.5) / cols - 0.5, dd = Math.abs(mid);
        s.style.setProperty('--d', ((0.5 - dd) * 0.9).toFixed(2) + 's');
        s.style.setProperty('--x', ((mid < 0 ? -1 : 1) * (60 + dd * 90)).toFixed(1) + 'vw');
        strands.push({ el: s, c: c, mid: mid, d: dd });
      }
      upd();
    }
    function c01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function eo(x) { return 1 - Math.pow(1 - x, 3); }
    function eio(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    // garlands are a fixed overlay that plays a short CSS sweep when the haldi scene arrives (no sticky maths, no scroll-scrubbing)
    var hal = document.querySelector('[data-haldi]'), busyG = false, lastY = window.scrollY;
    function play() {
      if (busyG) return; busyG = true;
      sec.classList.remove('open'); sec.classList.add('on');
      requestAnimationFrame(function () { requestAnimationFrame(function () { sec.classList.add('fall'); }); });
      setTimeout(function () { sec.classList.add('open'); }, reduce ? 0 : 1900);
      setTimeout(function () { sec.classList.remove('on', 'fall', 'open'); busyG = false; }, reduce ? 50 : 3600);
    }
    function upd() {}
    if (hal && 'IntersectionObserver' in window) {
      var armed = true;
      window.addEventListener('scroll', function () { lastY = window.scrollY; }, { passive: true });
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var goingDown = e.boundingClientRect.top > 0;   // haldi entering from below
          if (e.isIntersecting && armed && goingDown) { armed = false; play(); }
          if (!e.isIntersecting && e.boundingClientRect.top > 0) armed = true;   // scrolled back above it: allow again
        });
      }, { threshold: 0.12 }).observe(hal);
    }
    var rt, lw = window.innerWidth; window.addEventListener('resize', function () { if (window.innerWidth === lw) return; lw = window.innerWidth; clearTimeout(rt); rt = setTimeout(build, 200); });
  })();

  /* ---------------- soft background music: starts with the first tap, fades in quietly, toggle in the top bar ---------------- */
  (function () {
    var au = document.getElementById('bgm'), btn = document.querySelector('.bgm-btn'); if (!au || !btn) return;
    var MAX = 0.1, want = true, fadeT = 0;
    try { au.preload = 'auto'; au.load(); } catch (e) {}
    try { if (localStorage.getItem('ca-music') === 'off') want = false; } catch (e) {}
    au.addEventListener('error', function () { btn.classList.add('nofile'); });   // no music file uploaded yet: hide the button
    function fade(to, ms, done) {
      clearInterval(fadeT); var from = au.volume, t0 = Date.now();
      fadeT = setInterval(function () { var k = Math.min(1, (Date.now() - t0) / ms); au.volume = from + (to - from) * k; if (k >= 1) { clearInterval(fadeT); done && done(); } }, 50);
    }
    function on() { au.volume = 0; var p = au.play(); if (p && p.then) p.then(function () { fade(MAX, 2500); btn.setAttribute('aria-pressed', 'true'); }).catch(function () {}); else { fade(MAX, 2500); btn.setAttribute('aria-pressed', 'true'); } }
    function off() { fade(0, 600, function () { au.pause(); }); btn.setAttribute('aria-pressed', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (au.paused) { want = true; on(); } else { want = false; off(); }
      try { localStorage.setItem('ca-music', want ? 'on' : 'off'); } catch (err) {}
    });
    // browsers only allow sound after a tap or click: start on the first one (e.g. tapping the envelope)
    var hint = document.querySelector('.bgm-hint');
    function hideHint() { if (hint) { hint.classList.remove('show'); setTimeout(function () { hint.hidden = true; }, 500); } }
    au.addEventListener('playing', hideHint);
    // if the envelope was opened with a swipe (no tap), sound is still blocked: show a small "tap for music" pill
    var hintT = setInterval(function () {
      if (!document.body.classList.contains('opened')) return;
      clearInterval(hintT);
      if (hint && want && au.paused && !btn.classList.contains('nofile')) {
        hint.hidden = false; requestAnimationFrame(function () { hint.classList.add('show'); });
        setTimeout(hideHint, 9000);
      }
    }, 400);
    if (hint) hint.addEventListener('click', function (e) { e.stopPropagation(); want = true; on(); hideHint(); });
    function first() { if (want && au.paused) on(); ['click', 'touchend', 'keydown'].forEach(function (ev) { window.removeEventListener(ev, first, true); }); }
    ['click', 'touchend', 'keydown'].forEach(function (ev) { window.addEventListener(ev, first, true); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && !au.paused) au.pause(); else if (!document.hidden && want && au.paused && btn.getAttribute('aria-pressed') === 'true') au.play().catch(function () {}); });
  })();

  /* ---------------- scroll test meter: only when the address ends with ?perf (guests never see it) ---------------- */
  (function () {
    if (!/[?&]perf/.test(location.search)) return;
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;background:rgba(0,0,0,.82);color:#fff;font:12px/1.35 monospace;padding:6px 8px;border-radius:6px;pointer-events:none;white-space:pre';
    document.body.appendChild(box);
    var secs = [['two homes', '#homes'], ['card', '#top'], ['haldi', '[data-haldi]'], ['wedding', '[data-wedding]'], ['venue', '#venue']];
    var stats = {}, last = 0, lastY = window.scrollY, frames = 0, slow = 0, t0 = performance.now();
    function where() {
      var name = 'top', vh = window.innerHeight;
      secs.forEach(function (s) { var e = document.querySelector(s[1]); if (e && e.getBoundingClientRect().top < vh * 0.5) name = s[0]; });
      return name;
    }
    function tick(t) {
      if (last) {
        var dt = t - last, moving = window.scrollY !== lastY;
        if (moving) {
          var w = where(); var s = stats[w] || (stats[w] = { f: 0, slow: 0, worst: 0 });
          s.f++; if (dt > 34) s.slow++; if (dt > s.worst) s.worst = dt;
          frames++; if (dt > 34) slow++;
        }
      }
      last = t; lastY = window.scrollY;
      if (t - t0 > 400) {
        t0 = t;
        var lines = ['SCROLL TEST  (slow = frame over 34ms)'];
        Object.keys(stats).forEach(function (k) { var s = stats[k]; lines.push(k + ': ' + s.slow + ' slow / ' + s.f + ' (' + Math.round(100 * s.slow / Math.max(1, s.f)) + '%) worst ' + Math.round(s.worst) + 'ms'); });
        lines.push('TOTAL: ' + slow + ' slow / ' + frames);
        box.textContent = lines.join('\n');
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------------- petals ---------------- */
  var box = document.getElementById('petals');
  var colors = [['#FFB347','#E8731A'], ['#FFD25C','#F2A019'], ['#F28C28','#C8571B'], ['#E2557F','#A61E4D'], ['#FFFFFF','#EADBC8'], ['#F7A8C0','#D96A92']];
  function petals() {
    if (reduce) return;
    var n = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ? (IOS ? 8 : 12) : (window.innerWidth < 640 ? 30 : 44);
    for (var i = 0; i < n; i++) {
      var p = document.createElement('span'); p.className = 'petal';
      var b = document.createElement('b'), depth = Math.random(), sz = 9 + depth * 14;
      var col = colors[i % colors.length];
      b.style.width = sz + 'px'; b.style.height = (sz * (0.75 + Math.random() * 0.35)) + 'px';
      b.style.setProperty('--c1', col[0]); b.style.setProperty('--c2', col[1]);
      b.style.animationDuration = (0.9 + Math.random() * 1.3) + 's';
      b.style.animationDelay = (-Math.random() * 2) + 's';
      b.appendChild(document.createElement('i'));
      p.style.left = (Math.random() * 100) + '%';
      p.style.opacity = (0.55 + depth * 0.45).toFixed(2);
      if (depth < 0.25) p.style.filter = 'blur(1.2px)';
      p.style.setProperty('--dx', ((Math.random() - 0.5) * 220) + 'px');
      p.style.setProperty('--rot', ((Math.random() - 0.5) * 540) + 'deg');
      p.style.animationDuration = (6 + (1 - depth) * 4 + Math.random() * 2) + 's';
      p.style.animationDelay = (Math.random() * 2.4) + 's';
      p.appendChild(b); box.appendChild(p);
    }
    // a few soft pink lotus blossoms drifting through the petals
    var L = '<svg viewBox="0 0 100 70" width="100%" height="100%"><defs><linearGradient id="lp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3EC"/><stop offset=".55" stop-color="#F7A6C1"/><stop offset="1" stop-color="#D9567F"/></linearGradient><linearGradient id="lq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4F7"/><stop offset="1" stop-color="#F4B6CA"/></linearGradient></defs>' +
      '<path d="M50 62 C20 62 4 50 2 36 C18 40 32 48 50 62Z" fill="url(#lp)"/><path d="M50 62 C80 62 96 50 98 36 C82 40 68 48 50 62Z" fill="url(#lp)"/>' +
      '<path d="M50 62 C28 56 16 36 18 18 C32 28 44 44 50 62Z" fill="url(#lp)"/><path d="M50 62 C72 56 84 36 82 18 C68 28 56 44 50 62Z" fill="url(#lp)"/>' +
      '<path d="M50 62 C38 48 38 22 50 4 C62 22 62 48 50 62Z" fill="url(#lq)"/><ellipse cx="50" cy="60" rx="14" ry="4" fill="#E9C77B" opacity=".9"/></svg>';
    var nl = window.innerWidth < 640 ? 5 : 8;
    for (var j = 0; j < nl; j++) {
      var q = document.createElement('span'); q.className = 'petal lotus';
      var w = 34 + Math.random() * 26;
      q.innerHTML = '<b style="width:' + w + 'px;height:' + (w * 0.7) + 'px">' + L + '</b>';
      q.style.left = (5 + Math.random() * 85) + '%';
      q.style.setProperty('--dx', ((Math.random() - 0.5) * 140) + 'px');
      q.style.setProperty('--rot', ((Math.random() - 0.5) * 120) + 'deg');
      q.style.animationDuration = (9 + Math.random() * 4) + 's';
      q.style.animationDelay = (0.4 + Math.random() * 3) + 's';
      box.appendChild(q);
    }
    setTimeout(function () { box.innerHTML = ''; }, 15000);
  }

  /* ---------------- scroll scenes (one rAF-throttled handler) ---------------- */
  var TOUCH = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var ease3 = function (x) { return 1 - Math.pow(1 - x, 3); };
  var scenes = [].slice.call(app.querySelectorAll('[data-scene]'));
  var homes = app.querySelector('[data-homes]');
  var slides = homes ? [].slice.call(homes.querySelectorAll('[data-slide]')) : [];
  var medal = homes ? homes.querySelector('[data-medal]') : null;
  var haldi = app.querySelector('[data-haldi]'), wed = app.querySelector('[data-wedding]');
  var nav = K('nav');
  var thread = document.createElement('div'); thread.className = 'thread'; nav.appendChild(thread);
  var links = [].slice.call(nav.querySelectorAll('a[href^="#"]')).filter(function (a) { return a.getAttribute('href').length > 1 && a.getAttribute('href') !== '#top'; });
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function prog(sec) {
    var r = sec.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - window.innerHeight));
  }
  function stickyScene(sec, imgSel, txtAttr) {
    if (!sec || IOS) return;
    var r = sec.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < -50 || r.top > vh + 50) return;
    var p = prog(sec);
    var img = sec.querySelector(imgSel);
    if (TOUCH) {   // phones: no per-frame motion inside pinned scenes (it shakes on iPhone); text fades in with CSS instead
      var back = r.top > vh * 0.4;
      // phones: the photo zooms out once as the scene settles (a smooth CSS move, not tied to every scroll step)
      if (back) sec.classList.remove('zin'); else if (r.top < vh * 0.3) sec.classList.add('zin');
      sec.querySelectorAll('[' + txtAttr + ']').forEach(function (el) {
        if (back) el.classList.remove('t-in'); else if (reduce || p >= parseFloat(el.getAttribute(txtAttr))) el.classList.add('t-in');
      });
      return;
    }
    if (img) img.style.transform = 'scale(' + (1.28 - 0.28 * p).toFixed(4) + ')';
    sec.querySelectorAll('[' + txtAttr + ']').forEach(function (el) {
      var t = reduce ? 1 : clamp((p - parseFloat(el.getAttribute(txtAttr))) / 0.1);
      el.style.opacity = t.toFixed(3);
      el.style.transform = 'translateY(' + (18 * (1 - t)).toFixed(1) + 'px)';
    });
  }
  function onScroll() {
    ticking = false;
    var vh = window.innerHeight;
    if (!reduce && !TOUCH) scenes.forEach(function (sc) {
      var r = sc.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var off = r.top + r.height / 2 - vh / 2;
      sc.querySelectorAll('[data-depth]').forEach(function (l) {
        var d = parseFloat(l.dataset.depth) || 0;
        l.style.transform = 'translate3d(' + (off * d * 0.04).toFixed(1) + 'px,' + (off * d * 0.3).toFixed(1) + 'px,0)';
      });
    });
    if (homes) {
      var p = prog(homes);
      var rots = { L: [-4, 3, -2], R: [4, -3, 2] };
      slides.forEach(function (el) {
        var side = el.dataset.slide[0], k = +el.dataset.slide[1];
        var t = reduce ? 1 : ease3(clamp((p - (0.04 + k * 0.24)) / 0.22));
        var dir = side === 'L' ? -1 : 1;
        el.style.opacity = t.toFixed(3);
        el.style.transform = 'translateX(' + (dir * 130 * (1 - t)).toFixed(1) + '%) rotate(' + (rots[side][k] * t + dir * 12 * (1 - t)).toFixed(2) + 'deg)';
      });
      if (medal) medal.style.transform = 'rotate(' + (Math.sin(p * Math.PI * 2) * 14).toFixed(1) + 'deg)';
    }
    stickyScene(haldi, '[data-hz]', 'data-ht');
    stickyScene(wed, '[data-wz]', 'data-wt');
    var h = document.documentElement.scrollHeight - vh;
    if (!TOUCH) thread.style.transform = 'scaleX(' + (h > 0 ? clamp(window.scrollY / h) : 0).toFixed(4) + ')';
    var cur = -1;
    targets.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * 0.4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
  }
  var ticking = false;
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  onScroll();

  /* ---------------- reveal on scroll ---------------- */
  var rev = app.querySelectorAll('[data-reveal]');
  var io = null;
  if ('IntersectionObserver' in window && !reduce) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    rev.forEach(function (el) {
      var d = (el.dataset.reveal || 0) + 'ms';
      el.style.opacity = '0';
      el.style.transform = el.dataset.from === 'L' ? 'translateX(-70px) rotate(-2deg)' : el.dataset.from === 'R' ? 'translateX(70px) rotate(2deg)' : 'translateY(28px)';
      el.style.transition = 'opacity 1.1s ease ' + d + ', transform 0.9s ' + OUT + ' ' + d;
      io.observe(el);
    });
  }

  /* ---------------- see more / show less (families) ---------------- */
  app.querySelectorAll('[data-toggle]').forEach(function (btn) {
    var fold = app.querySelector('[data-fold="' + btn.dataset.toggle + '"]');
    var lab = btn.querySelector('[data-t="more"],[data-t="less"]');
    btn.addEventListener('click', function () {
      var open = !fold.classList.contains('open');
      fold.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lab) { lab.setAttribute('data-t', open ? 'less' : 'more'); lab.textContent = D[lang][open ? 'less' : 'more']; }
      if (open && io) fold.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
      req();
    });
  });

  /* ---------------- small touches ---------------- */
  var dir = app.querySelector('a[href*="maps.app.goo.gl"]'); if (dir) dir.classList.add('sheen');
})();

/* ---------------- Our Story as a book on phones: cover opens, one page turns per scroll step ---------------- */
(function () {
  if (!(window.matchMedia && matchMedia('(pointer: coarse)').matches)) return;
  var list = document.querySelector('.sp-list'); if (!list) return;
  var figs = [].slice.call(list.querySelectorAll('.sp-pol')); if (!figs.length) return;
  var wrap = document.createElement('div'); wrap.className = 'sb-wrap';
  var stick = document.createElement('div'); stick.className = 'sb-stick';
  var book = document.createElement('div'); book.className = 'sb-book';
  var leaves = [];
  function leaf(frontHTML, frontCls) {
    var l = document.createElement('div'); l.className = 'sb-leaf';
    l.innerHTML = '<div class="sb-face sb-front ' + frontCls + '">' + frontHTML + '</div><div class="sb-face sb-back"></div>';
    book.appendChild(l); leaves.push(l); return l;
  }
  leaf('<div class="sb-cv-in"><img src="assets/logo.png" alt=""><p class="sb-cv-t"><span data-t="storyTitle">Our Story</span></p><p class="sb-cv-h"><span data-t="sbHint">scroll to open</span> &darr;</p></div>', 'sb-cover');
  figs.forEach(function (f) { leaf(f.innerHTML, 'sp-pol'); });
  var n = leaves.length;
  leaves.forEach(function (l, i) { l.style.zIndex = n - i; });
  stick.appendChild(book); wrap.appendChild(stick);
  list.parentNode.insertBefore(wrap, list);
  var T = (window.DICT || {})[document.documentElement.lang] || {};
  book.querySelectorAll('[data-t]').forEach(function (el) { var k = el.getAttribute('data-t'); if (T[k] != null) el.textContent = T[k]; });
  document.documentElement.classList.add('has-book');
  var steps = n - 1, cur = -1, ticking = false;
  function upd() {
    ticking = false;
    var vh = window.innerHeight, top = wrap.getBoundingClientRect().top;
    var s = Math.floor((-top) / (vh * 0.55) + 0.35);
    s = Math.max(0, Math.min(steps, s));
    if (s === cur) return; cur = s;
    leaves.forEach(function (l, i) { l.classList.toggle('turned', i < s); });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }
  wrap.style.height = 'calc(100vh + ' + (steps * 55 + 25) + 'vh)';
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  upd();
})();

/* iPhone: haldi and wedding animate once as they come on screen (timed, not pinned or tied to the scroll) */
(function () {
  if (!document.documentElement.classList.contains('ios')) return;
  [['[data-haldi]', 'data-ht'], ['[data-wedding]', 'data-wt']].forEach(function (pair) {
    var sec = document.querySelector(pair[0]); if (!sec) return;
    sec.querySelectorAll('[' + pair[1] + ']').forEach(function (el) { el.style.setProperty('--d', (0.35 + parseFloat(el.getAttribute(pair[1])) * 3.2).toFixed(2) + 's'); });
    if (!('IntersectionObserver' in window)) { sec.classList.add('ios-in'); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) sec.classList.add('ios-in');
        else if (e.boundingClientRect.top > window.innerHeight) sec.classList.remove('ios-in');   // replay only when coming back down to it
      });
    }, { threshold: 0.3 }).observe(sec);
  });
})();
