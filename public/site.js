(function () {
  'use strict';
  var D = window.DICT;
  var app = document.getElementById('app');
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  function setLang(l, e) {
    if (e) e.stopPropagation();
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem('ca-lang', l); } catch (err) {}
    if (reduce || !body.classList.contains('opened')) { apply(l); return; }
    app.classList.add('swap');
    setTimeout(function () { apply(l); app.classList.remove('swap'); onScroll(); }, 190);
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
  var ld = 0, lt = [];
  function stage(s) {
    ld = s;
    var up = { opacity: 1, transform: 'translateY(0)' };
    if (s === 1) { var e = K('ld-g'); e.style.opacity = 1; e.style.transform = 'scale(1)'; }
    if (s === 2) Object.assign(K('ld-l0').style, up);
    if (s === 3) Object.assign(K('ld-l1').style, up);
    if (s === 4) { Object.assign(K('ld-l2').style, up); K('ld-dia').style.opacity = 1; }
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
    var plan = reduce ? [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 50]] : [[1, 150], [2, 1300], [3, 2100], [4, 2900], [5, 4600], [6, 5800]];
    lt = plan.map(function (p) { return setTimeout(function () { stage(p[0]); }, p[1]); });
  }
  K('loader').addEventListener('click', function () {
    if (ld >= 5) return;
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
    later(function () { flap.style.zIndex = 1; }, 970);
    [K('env-top'), K('env-lang'), K('env-prog')].forEach(function (el) {
      anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 1600 });
    });
    anim(K('env-shift'), [{ transform: 'translateY(0)' }, { transform: 'translateY(20%)' }], { duration: 1500, delay: 1850 });
    anim(K('env-letter'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-58%)' }], { duration: 1500, delay: 1850 });
    anim(env, [{ transform: 'translateY(0)' }, { transform: 'translateY(-104%)' }], { duration: 1300, delay: 3800 });
    anim(K('invite'), [{ transform: 'translateY(40px) scale(0.94)' }, { transform: 'translateY(0) scale(1)' }], { duration: 1300, delay: 3800, easing: OUT });
    later(function () { env.style.pointerEvents = 'none'; petals(); }, 3900);
    later(function () {
      K('envsec').style.display = 'none';
      K('nav').style.transform = 'translateY(0)';
      body.classList.remove('locked'); body.classList.add('opened');
      opened = true; busy = false; onScroll();
    }, 5150);
  }
  K('env').addEventListener('click', open);
  K('env').setAttribute('tabindex', '0');
  K('env').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });

  var rp = K('replay');
  if (rp) rp.addEventListener('click', function () {
    ot.forEach(clearTimeout); ot = []; lt.forEach(clearTimeout);
    window.scrollTo({ top: 0, behavior: 'instant' });
    reset(); hintKey = 'tap'; apply(lang);
    body.classList.add('locked'); body.classList.remove('opened');
    opened = false; busy = false; ld = 0;
    startLoader();
  });

  /* ---------------- petals ---------------- */
  var box = document.getElementById('petals');
  var colors = ['#F28C28', '#F6B73C', '#E8871E', '#C92A5E', '#FFF6E8', '#F4A3BD'];
  function petals() {
    if (reduce) return;
    var n = window.innerWidth < 640 ? 24 : 34;
    for (var i = 0; i < n; i++) {
      var p = document.createElement('span'); p.className = 'petal';
      var b = document.createElement('b'), sz = 8 + Math.random() * 10;
      b.style.width = sz + 'px'; b.style.height = (sz * 0.8) + 'px';
      b.style.background = colors[i % colors.length];
      b.style.animationDuration = (1.2 + Math.random() * 1.4) + 's';
      p.style.left = (Math.random() * 100) + '%';
      p.style.setProperty('--dx', ((Math.random() - 0.5) * 160) + 'px');
      p.style.setProperty('--rot', ((Math.random() - 0.5) * 720) + 'deg');
      p.style.animationDuration = (4.5 + Math.random() * 3.5) + 's';
      p.style.animationDelay = (Math.random() * 1.8) + 's';
      p.appendChild(b); box.appendChild(p);
    }
    setTimeout(function () { box.innerHTML = ''; }, 10500);
  }

  /* ---------------- scroll scenes (one rAF-throttled handler) ---------------- */
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
    if (!sec) return;
    var r = sec.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < -50 || r.top > vh + 50) return;
    var p = prog(sec);
    var img = sec.querySelector(imgSel);
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
    if (!reduce) scenes.forEach(function (sc) {
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
    thread.style.transform = 'scaleX(' + (h > 0 ? clamp(window.scrollY / h) : 0).toFixed(4) + ')';
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
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    rev.forEach(function (el) {
      var d = (el.dataset.reveal || 0) + 'ms';
      el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.9s ease ' + d + ', transform 0.9s ' + OUT + ' ' + d;
      io.observe(el);
    });
  }

  /* ---------------- small touches ---------------- */
  var dir = app.querySelector('a[href*="maps.app.goo.gl"]'); if (dir) dir.classList.add('sheen');
})();
