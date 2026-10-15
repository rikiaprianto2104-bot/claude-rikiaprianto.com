/* Kelas AI Jogja — skrip kecil: menu ponsel, animasi muncul, filter karya, formulir WhatsApp. */
(function () {
  'use strict';

  var WA_NUMBER = '6288809234347';

  // Bar atas & menu besar
  var bar = document.getElementById('bar'), menu = document.getElementById('menu'), mbtn = document.querySelector('.bar-menu');
  var filmEl = document.getElementById('film');
  function barState() {
    if (!bar) return;
    var open = menu && menu.classList.contains('open');
    var solid = !filmEl || filmEl.getBoundingClientRect().bottom < 90;
    bar.classList.toggle('solid', solid && !open);
    document.body.classList.toggle('past-film', solid);
  }
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    mbtn.setAttribute('aria-expanded', String(open));
    mbtn.querySelector('.bm-text').textContent = open ? 'TUTUP' : 'MENU';
    document.body.classList.toggle('menu-open', open);
    menu.querySelectorAll('a').forEach(function (a) { a.tabIndex = open ? 0 : -1; });
    barState();
    if (open) { var first = menu.querySelector('a'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 450); } else mbtn.focus({ preventScroll: true });
  }
  if (bar && menu && mbtn) {
    mbtn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
    menu.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a && a.getAttribute('href').indexOf('#') === 0) setMenu(false); });
    window.addEventListener('scroll', barState, { passive: true });
    window.addEventListener('resize', barState);
    barState();
  }

  // Menu ponsel (lama)
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Kartu miring 3D mengikuti kursor (hanya perangkat dengan kursor dan tanpa permintaan gerak minimal)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.work, .class-card, .post-card').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-py * 6).toFixed(2) + 'deg) rotateY(' + (px * 8).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  // Animasi muncul saat di-scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Filter galeri karya
  var filters = document.querySelectorAll('.filter');
  var works = document.querySelectorAll('.work[data-cat]');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      works.forEach(function (w) {
        w.hidden = !(cat === 'semua' || w.getAttribute('data-cat') === cat);
      });
    });
  });

  // Formulir kontak: menyusun pesan lalu membuka WhatsApp (tanpa server, tanpa data tersimpan)
  var form = document.getElementById('wa-form');
  if (form) {
    var pre = new URLSearchParams(location.search).get('kelas');
    var sel = form.elements['kelas'];
    if (pre && sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value.toLowerCase().indexOf(pre.toLowerCase()) === 0) {
          sel.selectedIndex = i;
          break;
        }
      }
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var lines = [
        'Halo Kak Riki, saya ingin bertanya/mendaftar kelas Future Makers.',
        '',
        'Pilihan kelas: ' + f['kelas'].value,
        'Nama orang tua: ' + f['ortu'].value.trim(),
        'Nama anak: ' + f['anak'].value.trim(),
        'Usia anak: ' + f['usia'].value.trim(),
        'Domisili: ' + f['domisili'].value.trim()
      ];
      var pesan = f['pesan'].value.trim();
      if (pesan) lines.push('', 'Pesan: ' + pesan);
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();
