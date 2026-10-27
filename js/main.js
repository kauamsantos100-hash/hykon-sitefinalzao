/* ==========================================================
   HYKON — main.js  (sem dependências)
   ========================================================== */
(function () {
  'use strict';

  /* ---------- Configuração ---------- */
  // Para receber mensagens do formulário direto no seu e-mail, crie um endpoint
  // (ex.: Formspree: https://formspree.io/f/SEU_ID) e cole abaixo.
  // Vazio = abre o aplicativo de e-mail do visitante já preenchido (mailto).
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'contato@hykon.com.br';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ano no rodapé ---------- */
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Header: estado de rolagem ---------- */
  var header = $('#site-header');
  function onScrollHeader() { header.classList.toggle('scrolled', window.scrollY > 12); }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Menu mobile ---------- */
  var toggle = $('#menu-toggle'), nav = $('#main-nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function () { setMenu(false); });

  /* ---------- Link ativo conforme a seção ---------- */
  var links = $$('.nav-link');
  var map = {};
  links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (l) { l.classList.remove('active'); l.removeAttribute('aria-current'); });
          map[en.target.id].classList.add('active');
          map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---------- Entrada suave durante a rolagem ---------- */
  var revealEls = $$('[data-reveal]');
  // escalonamento dentro de grupos irmãos
  revealEls.forEach(function (el) {
    var sibs = $$('[data-reveal]', el.parentElement).filter(function (x) { return x.parentElement === el.parentElement; });
    var i = sibs.indexOf(el);
    if (i > 0 && !reduceMotion) el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Carregamento de imagens + alternativa visual ---------- */
  function wireImage(img) {
    var holder = img.closest('.media') || img.closest('.project-thumb');
    function ok() { img.classList.add('loaded'); if (holder) holder.classList.add('loaded'); }
    function fail() {
      if (holder) holder.classList.add('failed');
      img.style.display = 'none';
      img.removeAttribute('srcset');
    }
    if (img.complete) { img.naturalWidth > 0 ? ok() : fail(); }
    else { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', fail, { once: true }); }
  }
  $$('.media img, .project-thumb img.photo').forEach(wireImage);

  /* ---------- Parallax moderado no hero ---------- */
  var hero = $('#hero'), heroImg = $('[data-parallax] img');
  if (hero && heroImg && !reduceMotion) {
    var ticking = false, heroVisible = true;
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe(hero);
    window.addEventListener('scroll', function () {
      if (ticking || !heroVisible) return;
      ticking = true;
      requestAnimationFrame(function () {
        heroImg.style.transform = 'translate3d(0,' + (window.scrollY * 0.18).toFixed(1) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Canvas: trilhas de circuito (leve e pausável) ---------- */
  var canvas = $('#circuit-canvas');
  if (canvas && !reduceMotion && canvas.getContext) {
    var ctx = canvas.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var paths = [], pulses = [], running = false, raf = 0, GRID = 36;
    function build() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paths = []; pulses = [];
      var n = Math.max(10, Math.min(28, Math.round(W / 60)));
      for (var i = 0; i < n; i++) {
        var x = Math.round((Math.random() * W) / GRID) * GRID, y = Math.round((Math.random() * H) / GRID) * GRID;
        var pts = [[x, y]], horiz = Math.random() > .5, segs = 3 + Math.floor(Math.random() * 3);
        for (var k = 0; k < segs; k++) {
          var len = (1 + Math.floor(Math.random() * 4)) * GRID * (Math.random() > .5 ? 1 : -1);
          if (horiz) x += len; else y += len;
          pts.push([x, y]); horiz = !horiz;
        }
        var total = 0, lens = [];
        for (var j = 1; j < pts.length; j++) { var d = Math.abs(pts[j][0] - pts[j - 1][0]) + Math.abs(pts[j][1] - pts[j - 1][1]); lens.push(d); total += d; }
        paths.push({ pts: pts, lens: lens, total: total });
        pulses.push({ p: i, t: Math.random(), v: 0.0012 + Math.random() * 0.002 });
      }
    }
    function at(path, t) {
      var d = t * path.total, i = 0;
      while (i < path.lens.length - 1 && d > path.lens[i]) { d -= path.lens[i]; i++; }
      var a = path.pts[i], b = path.pts[i + 1], f = path.lens[i] ? d / path.lens[i] : 0;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(53,231,199,.22)'; ctx.lineWidth = 1; ctx.beginPath();
      paths.forEach(function (p) { ctx.moveTo(p.pts[0][0], p.pts[0][1]); for (var i = 1; i < p.pts.length; i++) ctx.lineTo(p.pts[i][0], p.pts[i][1]); });
      ctx.stroke();
      ctx.fillStyle = 'rgba(53,231,199,.9)';
      pulses.forEach(function (u) {
        u.t += u.v; if (u.t > 1) u.t = 0;
        var pt = at(paths[u.p], u.t);
        ctx.beginPath(); ctx.arc(pt[0], pt[1], 2.2, 0, 6.283); ctx.fill();
      });
      if (running) raf = requestAnimationFrame(frame);
    }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    build();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); }, 200); });
    new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(hero);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }

  /* ---------- Efeito ripple nos botões ---------- */
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn'); if (!b || reduceMotion) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    var el = document.createElement('span');
    el.className = 'ripple';
    el.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(el); setTimeout(function () { el.remove(); }, 650);
  });

  /* ---------- Carrossel ---------- */
  var track = $('#car-track'), prev = $('#car-prev'), next = $('#car-next');
  if (track) {
    var step = function () { var s = $('.slide', track); return s ? s.getBoundingClientRect().width + 20 : 300; };
    var upd = function () {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    window.addEventListener('resize', upd); upd();
  }

  /* ---------- Lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  var slides = $$('.slide'), cur = 0, opener = null, touchX = null;
  function show(i) {
    cur = (i + slides.length) % slides.length;
    var s = slides[cur], thumb = $('img', s);
    lbImg.classList.remove('loaded');
    lbImg.src = s.dataset.full;
    lbImg.alt = thumb ? thumb.alt : '';
    lbCap.textContent = s.dataset.caption || '';
    // pré-carrega vizinhas
    [cur + 1, cur - 1].forEach(function (n) { var x = slides[(n + slides.length) % slides.length]; if (x) { var p = new Image(); p.src = x.dataset.full; } });
  }
  function open(i, from) {
    opener = from; show(i);
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
    $('#lb-close').focus();
  }
  function close() {
    lb.classList.remove('open'); document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  lbImg.addEventListener('error', function () { lbImg.alt = 'Não foi possível carregar a imagem ampliada.'; });
  slides.forEach(function (s, i) { s.addEventListener('click', function () { open(i, s); }); });
  $('#lb-close').addEventListener('click', close);
  $('#lb-prev').addEventListener('click', function () { show(cur - 1); });
  $('#lb-next').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'Tab') { // mantém o foco dentro do diálogo
      var f = $$('button', lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- Formulário de contato ---------- */
  var form = $('#contact-form'), status = $('#form-status');
  if (form) {
    var rules = {
      nome: function (v) { return v.trim().length >= 2 || 'Informe seu nome.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Informe um e-mail válido.'; },
      assunto: function (v) { return v.trim().length >= 3 || 'Informe o assunto.'; },
      mensagem: function (v) { return v.trim().length >= 10 || 'Escreva ao menos 10 caracteres.'; }
    };
    function setErr(input, msg) {
      var row = input.closest('.form-row'), old = $('.field-error', row);
      if (old) old.remove();
      row.classList.toggle('invalid', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) {
        var s = document.createElement('span'); s.className = 'field-error'; s.id = input.id + '-err'; s.textContent = msg;
        row.appendChild(s); input.setAttribute('aria-describedby', s.id);
      } else input.removeAttribute('aria-describedby');
    }
    function check(input) {
      var r = rules[input.name]; if (!r) return true;
      var res = r(input.value); setErr(input, res === true ? '' : res); return res === true;
    }
    $$('input,textarea', form).forEach(function (i) {
      i.addEventListener('blur', function () { check(i); });
      i.addEventListener('input', function () { if (i.closest('.form-row').classList.contains('invalid')) check(i); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = $$('input,textarea', form).filter(function (i) { return !check(i); });
      status.className = 'form-status';
      if (bad.length) { bad[0].focus(); status.textContent = 'Revise os campos destacados.'; status.classList.add('err'); return; }
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      var btn = $('button[type=submit]', form);
      if (!FORM_ENDPOINT) {
        var body = 'Nome: ' + data.nome + '\nE-mail: ' + data.email + '\nTelefone: ' + (data.telefone || '-') + '\n\n' + data.mensagem;
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(data.assunto) + '&body=' + encodeURIComponent(body);
        status.textContent = 'Abrimos seu aplicativo de e-mail com a mensagem pronta. Se nada abriu, escreva para ' + CONTACT_EMAIL + '.';
        status.classList.add('ok'); return;
      }
      btn.classList.add('loading'); btn.setAttribute('aria-busy', 'true');
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(); form.reset(); status.textContent = 'Mensagem enviada! Retornamos em até 1 dia útil.'; status.classList.add('ok'); })
        .catch(function () { status.textContent = 'Não foi possível enviar agora. Tente de novo ou escreva para ' + CONTACT_EMAIL + '.'; status.classList.add('err'); })
        .finally(function () { btn.classList.remove('loading'); btn.removeAttribute('aria-busy'); });
    });
  }
})();
