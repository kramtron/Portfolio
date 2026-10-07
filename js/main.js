(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* almacenamiento bloqueado: se ignora */ }
  }
  function $(s, ctx) { return (ctx || document).querySelector(s); }
  function $$(s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); }

  /* ---------- Idioma ---------- */
  function applyLang(lang) {
    root.lang = lang;
    var title = $('title'), desc = $('meta[name="description"]');
    if (title && title.dataset[lang]) title.textContent = title.dataset[lang];
    if (desc && desc.dataset[lang]) desc.setAttribute('content', desc.dataset[lang]);
  }
  applyLang(root.lang);
  var langBtn = $('#lang-toggle');
  if (langBtn) langBtn.addEventListener('click', function () {
    var next = root.lang === 'es' ? 'en' : 'es';
    applyLang(next); store('lang', next);
  });

  /* ---------- Tema (claro/oscuro) ---------- */
  var themeMeta = $('meta[name="theme-color"]');
  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute('content', getComputedStyle(document.body).backgroundColor);
  }
  applyTheme(root.dataset.theme);
  var themeBtn = $('#theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next); store('theme', next);
  });

  /* ---------- Menú móvil ---------- */
  var burger = $('#burger'), nav = $('#nav');
  function setMenu(open) {
    if (!burger || !nav) return;
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Galerías de capturas: pase automático, miniaturas y visor ---------- */
  var lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  var lbState = null;   // { shots: [src], name, i }
  function lbShow(i) {
    var n = lbState.shots.length;
    lbState.i = (i + n) % n;
    lbImg.src = lbState.shots[lbState.i];
    lbImg.alt = lbState.name + ' — ' + (lbState.i + 1) + '/' + n;
    lbCap.textContent = lbState.name + '  ·  ' + (lbState.i + 1) + ' / ' + n;
  }
  function lbOpen(shots, name, i) {
    if (!lb || typeof lb.showModal !== 'function') return;
    lbState = { shots: shots, name: name, i: i };
    lbShow(i);
    lb.showModal();
  }
  if (lb) {
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    $('.lb-prev', lb).addEventListener('click', function () { lbShow(lbState.i - 1); });
    $('.lb-next', lb).addEventListener('click', function () { lbShow(lbState.i + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') lbShow(lbState.i - 1);
      if (e.key === 'ArrowRight') lbShow(lbState.i + 1);
    });
  }

  $$('[data-gallery]').forEach(function (media) {
    var base = media.dataset.gallery, n = parseInt(media.dataset.n, 10), name = media.dataset.name;
    var portrait = media.classList.contains('portrait');
    var frame = $('.frame', media), thumbs = $('.thumbs', media);
    var first = $('.shot', frame), badges = $('.badges', frame);
    var imgs = [first], btns = [], shots = [], cur = 0, hover = false, visible = false, timer = 0;

    for (var k = 1; k <= n; k++) {
      (function (k) {
        var src = base + '/' + k + '.jpg';
        shots.push(src);
        if (k > 1) {
          var im = new Image();
          im.className = 'shot'; im.loading = 'lazy';
          im.width = portrait ? 720 : 1280; im.height = portrait ? 1280 : 720;
          im.alt = name + ' — ' + k + '/' + n; im.src = src;
          frame.insertBefore(im, badges); imgs.push(im);
        }
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', name + ' ' + k + '/' + n);
        var t = new Image(); t.src = src; t.alt = ''; t.loading = 'lazy';
        b.appendChild(t);
        b.addEventListener('click', function () { show(k - 1); restart(); });
        thumbs.appendChild(b); btns.push(b);
      })(k);
    }
    function show(i) {
      cur = (i + n) % n;
      imgs.forEach(function (im, j) { im.classList.toggle('on', j === cur); });
      btns.forEach(function (b, j) { b.setAttribute('aria-current', String(j === cur)); });
      var cap = btns[cur];
      if (cap && thumbs.scrollWidth > thumbs.clientWidth) thumbs.scrollTo({ left: cap.offsetLeft - 12, behavior: reduce ? 'auto' : 'smooth' });
    }
    function stop() { clearInterval(timer); timer = 0; }
    function restart() {
      stop();
      if (!reduce && visible && !hover && n > 1) timer = setInterval(function () { show(cur + 1); }, 4800);
    }
    show(0);

    // Ampliar al pulsar la captura
    frame.dataset.zoomable = '';
    var hint = document.createElement('span');
    hint.className = 'zoom-hint'; hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '<span lang="es">Ampliar ⤢</span><span lang="en">Enlarge ⤢</span>';
    frame.appendChild(hint);
    frame.tabIndex = 0;
    frame.addEventListener('click', function () { lbOpen(shots, name, cur); });
    frame.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lbOpen(shots, name, cur); }
    });

    frame.addEventListener('pointerenter', function () { hover = true; stop(); });
    frame.addEventListener('pointerleave', function () { hover = false; restart(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; restart(); }, { threshold: 0.35 }).observe(frame);
    }
  });

  /* ---------- Rotador de palabras del hero ---------- */
  var rot = $('#rot');
  if (rot && !reduce) {
    var words = $$('span', rot), idx = 0;
    setInterval(function () {
      var cur = words[idx];
      idx = (idx + 1) % words.length;
      var nxt = words[idx];
      cur.classList.remove('on'); cur.classList.add('out');
      nxt.classList.remove('out'); nxt.classList.add('on');
      setTimeout(function () { cur.classList.remove('out'); }, 650);
    }, 2600);
  }

  /* ---------- Contadores ---------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var end = parseInt(el.dataset.count, 10), start = performance.now(), dur = 1100;
    if (reduce) { el.textContent = end; return; }
    (function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ---------- Aparición al hacer scroll + contadores ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });

    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target); cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* ---------- Sección activa: pestañas de la cabecera y puntos laterales ---------- */
  var games = $$('.game');
  var dots = $('#dots'), dotLinks = $$('a', dots);
  var navLinks = $$('.nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        dotLinks.forEach(function (a) { a.classList.toggle('active', a.dataset.for === entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    games.forEach(function (g) { gio.observe(g); });

    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target.id === 'juegos' && dots) dots.classList.toggle('show', entry.isIntersecting);
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['juegos', 'sobre-mi', 'contacto'].forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  }

  /* ---------- Barra de progreso de lectura ---------- */
  var progress = $('.progress'), ticking = false;
  function onScroll() {
    ticking = false;
    var max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Copiar correo ---------- */
  var copyBtn = $('#copy-email');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var text = copyBtn.dataset.copy;
    function done() {
      copyBtn.classList.add('copied');
      setTimeout(function () { copyBtn.classList.remove('copied'); }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { window.location.href = 'mailto:' + text; });
    } else { window.location.href = 'mailto:' + text; }
  });

  /* ---------- Año del pie ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
