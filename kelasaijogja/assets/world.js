/* Dunia Pixi — film scroll 3D untuk beranda.
   Satu layar penuh WebGL. Gulir halaman = memutar film: kamera bergerak melewati dunia Pixi
   (latar.webp), menembus pintu cahaya, lalu enam adegan mengikuti 4 pertemuan kelas.
   Pixi 3D selalu ada di depan kamera; latar, awan, bola cahaya, dan properti ada di dunia.
   Tambahkan #debug di URL untuk memakai window.__film.show(u) saat pengujian (u = 0..6). */
(function () {
  'use strict';
  var film = document.getElementById('film');
  if (!film) return;
  var fail = function () { document.documentElement.classList.add('film-fail'); };
  if (!window.THREE || !window.PixiModel) { fail(); return; }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // tampil sebagai halaman statis

  var track = film.querySelector('.film-track');
  var stage = film.querySelector('.film-stage');
  var N = 6;
  var VQ = window.__V ? '?v=' + window.__V : '';   // versi build: mencegah CSS/JS lama bertemu HTML baru dari cache
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { fail(); return; }
  var dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.25);
  renderer.setPixelRatio(dpr);
  renderer.outputEncoding = THREE.sRGBEncoding;
  var canvas = renderer.domElement;
  canvas.className = 'film-gl';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Dunia Pixi: animasi 3D yang bergerak saat halaman digulir, menampilkan Pixi dan empat pertemuan kelas.');
  stage.insertBefore(canvas, stage.firstChild);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(41.11, 16 / 9, 0.1, 80);
  scene.add(camera);
  scene.environment = PixiModel.env(renderer);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9aeff, 0.8));
  var kunci = new THREE.DirectionalLight(0xffffff, 0.6); kunci.position.set(3, 5, 6); scene.add(kunci);
  var tepi = new THREE.DirectionalLight(0xc8bfff, 0.6); tepi.position.set(-4, 3, -3); scene.add(tepi);

  var PW = 13.34, PH = 7.5, PZ = -10;   // bidang latar: 16:9 pada jarak 10
  var aspect = 16 / 9, visH = PH;

  /* ---------- tekstur ---------- */
  var loader = new THREE.TextureLoader();
  var tex = function (url) {
    var t = loader.load(url); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  };
  var canvasTex = function (c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; };
  var mk = function (w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function roundRect(x, X, y, w, h, r) {
    x.beginPath(); x.moveTo(X + r, y); x.arcTo(X + w, y, X + w, y + h, r); x.arcTo(X + w, y + h, X, y + h, r); x.arcTo(X, y + h, X, y, r); x.arcTo(X, y, X + w, y, r); x.closePath();
  }
  function wrap(x, text, maxW) {
    var words = text.split(' '), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }

  /* ---------- latar dunia ---------- */
  var back = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex('assets/latar.webp' + VQ), depthWrite: false }));
  back.position.z = PZ; back.renderOrder = -10; scene.add(back);
  var latarMap = back.material.map;

  /* ---------- klip video (opsional) ----------
     Taruh hasil video Google Flow sebagai urutan gambar di assets/film/<nama>/ dan daftarkan di
     assets/film/manifest.json (skrip tools/kelasaijogja/video-to-frames.py melakukannya otomatis).
     Selama klip aktif, latar dunia diganti frame video yang diputar mengikuti scroll. */
  var texA = new THREE.Texture(), texB = new THREE.Texture();
  [texA, texB].forEach(function (t) { t.encoding = THREE.sRGBEncoding; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; });
  var back2 = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: texB, transparent: true, opacity: 0, depthWrite: false }));
  back2.position.z = PZ + 0.001; back2.renderOrder = -9; back2.visible = false; scene.add(back2);
  var clips = [], inflight = 0;
  var hemat = innerWidth < 700 || (navigator.connection && navigator.connection.saveData);   // ponsel: hanya frame genap
  var MAXF = hemat ? 3 : 5;
  fetch('assets/film/manifest.json' + VQ, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
    if (!m || !m.clips || !m.clips.length) return;
    var first = m.clips.reduce(function (a, c) { return c.from < a.from ? c : a; }, m.clips[0]);
    m.clips.forEach(function (c) {
      var o = { from: c.from, to: c.to, count: c.count, imgs: new Array(c.count), hold: c === first, started: c === first, queue: [], c: c };
      // urutan muat: frame awal dan akhir, lalu setiap ke-8, ke-4, ke-2, sisanya, supaya scrub bisa jalan sebelum semua frame tiba
      var seen = {}, add = function (k) { if (k >= 0 && k < c.count && !seen[k] && !(hemat && k % 2 === 1 && k !== c.count - 1)) { seen[k] = 1; o.queue.push(k); } };
      add(0); add(c.count - 1);
      [8, 4, 2, 1].forEach(function (st) { for (var k = 0; k < c.count; k += st) add(k); });
      clips.push(o);
    });
    pumpClips(0);
  }).catch(function () {});
  function pumpClips(u) {
    if (!clips.length) return;
    for (var i = 0; i < clips.length; i++) if (!clips[i].started && u >= clips[i].from - 1.3) clips[i].started = true;
    while (inflight < MAXF) {
      var o = null, j;
      for (j = 0; j < clips.length; j++) if (clips[j].started && clips[j].queue.length) { o = clips[j]; break; }
      if (!o) return;
      var k = o.queue.shift(), c = o.c, im = new Image(), t = String(k + 1);
      while (t.length < (c.digits || 4)) t = '0' + t;
      inflight++;
      im.decoding = 'async';
      im.onload = (function (o, k, im) { return function () { o.imgs[k] = im; inflight--; pumpClips(U); }; })(o, k, im);
      im.onerror = function () { inflight--; pumpClips(U); };
      im.src = c.dir + t + '.' + (c.ext || 'webp') + VQ;
    }
  }
  function nearest(c, k) {
    var d, im = null;
    for (d = 0; d < c.count && !im; d++) im = c.imgs[k - d] || c.imgs[k + d] || null;
    return im;
  }
  // klip yang aktif pada adegan u: dua frame bertetangga dan pecahan antara keduanya
  function activeClip(u) {
    for (var i = 0; i < clips.length; i++) {
      var c = clips[i];
      var inside = u >= c.from && u <= c.to, before = c.hold && u < c.from;
      if (inside || before) {
        var p = before ? 0 : (u - c.from) / Math.max(0.0001, c.to - c.from), kf = p * (c.count - 1), k0 = Math.floor(kf), k1 = Math.min(c.count - 1, k0 + 1);
        var a = nearest(c, k0), b = nearest(c, k1);
        if (a) return { a: a, b: b || a, frac: b ? kf - k0 : 0 };
      }
    }
    return null;
  }

  /* ---------- awan ---------- */
  var cloudMap = (function () {
    var c = mk(256, 160), x = c.getContext('2d'), i;
    for (i = 0; i < 11; i++) {
      var cx = 40 + Math.random() * 176, cy = 60 + Math.random() * 50, r = 28 + Math.random() * 34;
      var g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.55, 'rgba(250,248,255,0.55)'); g.addColorStop(1, 'rgba(240,235,255,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    }
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  })();
  var clouds = [];
  (function () {
    var i, sp;
    for (i = 0; i < 40; i++) {
      var far = i < 28;
      sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudMap, transparent: true, opacity: far ? rnd(0.45, 0.85) : rnd(0.25, 0.45), depthWrite: false, color: i % 5 === 0 ? 0xf3e9ff : 0xffffff }));
      var s = far ? rnd(2.2, 5.2) : rnd(5, 9);
      sp.scale.set(s * 1.7, s, 1);
      sp.position.set(rnd(-12, 12), rnd(-1.5, 8), far ? rnd(-9.2, -5.7) : rnd(-4.6, -1.2));
      sp.userData.v = rnd(0.03, 0.12); sp.userData.fg = !far; sp.userData.o = sp.material.opacity;
      scene.add(sp); clouds.push(sp);
    }
  })();

  /* ---------- bintang, kilau & konfeti (menempel pada kamera) ---------- */
  var dotMap = (function () {
    var c = mk(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  function makePoints(n, size, colors, zNear, zFar, spread) {
    var geo = new THREE.BufferGeometry(), p = new Float32Array(n * 3), col = new Float32Array(n * 3), i, c = new THREE.Color();
    for (i = 0; i < n; i++) {
      p[i * 3] = rnd(-spread, spread); p[i * 3 + 1] = rnd(-spread * 0.6, spread * 0.6); p[i * 3 + 2] = rnd(zFar, zNear);
      c.set(colors[i % colors.length]); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var m = new THREE.Points(geo, new THREE.PointsMaterial({ size: size, map: dotMap, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.frustumCulled = false; m.userData = { n: n, zNear: zNear, zFar: zFar, spread: spread };
    camera.add(m); return m;
  }
  var stars = makePoints(520, 0.09, [0xffffff, 0xffd86b, 0xcfc8ff, 0xff9fbf], -0.5, -22, 10);
  var confetti = makePoints(360, 0.16, [0xffc83d, 0xff7fa6, 0xffffff, 0x8a7df2, 0x6cd6ff], -2, -14, 7);

  /* ---------- Pixi dan panggungnya ---------- */
  var rig = new THREE.Group(); camera.add(rig);
  var px = null;                       // model
  var stageProps = new THREE.Group(); rig.add(stageProps);

  var ringDisc, ringLine;              // alas bercahaya (hanya adegan dalam)
  (function () {
    var c = mk(256, 256), x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, 'rgba(160,140,255,0.85)'); g.addColorStop(0.55, 'rgba(108,92,231,0.4)'); g.addColorStop(1, 'rgba(108,92,231,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    ringDisc = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    ringDisc.rotation.x = -Math.PI / 2;
    ringLine = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.34, 72), new THREE.MeshBasicMaterial({ color: 0xffd86b, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    ringLine.rotation.x = -Math.PI / 2;
  })();
  var shadow = (function () {
    var c = mk(128, 128), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(60,45,170,0.42)'); g.addColorStop(0.55, 'rgba(60,45,170,0.14)'); g.addColorStop(1, 'rgba(60,45,170,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; return m;
  })();

  /* wordmark raksasa di belakang Pixi */
  var wordmark = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 3.15), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  wordmark.position.set(0, 1.55, -7.6); wordmark.renderOrder = -5; camera.add(wordmark);
  function drawWordmark() {
    var c = mk(2048, 512), x = c.getContext('2d');
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '900 250px "Unbounded", "Baloo 2", sans-serif';
    var g = x.createLinearGradient(0, 40, 0, 470);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#f2eeff'); g.addColorStop(1, '#cfc8ff');
    x.shadowColor = 'rgba(63,51,168,0.55)'; x.shadowBlur = 38; x.shadowOffsetY = 14;
    x.fillStyle = g;
    x.fillText('FUTURE', 1024, 150);
    x.fillText('MAKERS', 1024, 370);
    var t = canvasTex(c); wordmark.material.map = t; wordmark.material.needsUpdate = true;
  }
  var title1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  title1.position.set(0, 0.5, -6.6); title1.renderOrder = -4; camera.add(title1);
  function drawTitle1() {
    var c = mk(2048, 1146), x = c.getContext('2d');
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 262px "Unbounded", "Baloo 2", sans-serif';
    var g = x.createLinearGradient(0, 80, 0, 1070); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e5dfff');
    x.shadowColor = 'rgba(63,51,168,0.85)'; x.shadowBlur = 44; x.shadowOffsetY = 16; x.fillStyle = g;
    ['ANAK BUKAN', 'PENONTON.', 'MEREKA', 'PEMBUAT.'].forEach(function (l, i) { x.fillText(l, 1024, 150 + i * 282); });
    title1.material.map = canvasTex(c); title1.material.needsUpdate = true;
  }
  var drawAll = function () { drawWordmark(); drawTitle1(); };
  if (document.fonts && document.fonts.load) document.fonts.load('900 120px "Unbounded"').then(drawAll, drawAll); else drawAll();

  /* ---------- properti adegan 2: gelembung obrolan ---------- */
  function bubbleTex(text, kind) {
    var c = mk(640, 260), x = c.getContext('2d');
    x.font = '700 40px "Nunito", sans-serif';
    var lines = wrap(x, text, 540), h = 70 + lines.length * 52;
    c.height = h; x = c.getContext('2d'); x.font = '700 40px "Nunito", sans-serif';
    roundRect(x, 12, 12, 616, h - 24, 40);
    x.fillStyle = kind === 'user' ? '#6c5ce7' : '#ffffff'; x.shadowColor = 'rgba(30,20,100,0.35)'; x.shadowBlur = 24; x.shadowOffsetY = 10; x.fill();
    x.shadowColor = 'transparent'; x.fillStyle = kind === 'user' ? '#ffffff' : '#2a2270'; x.textBaseline = 'top';
    lines.forEach(function (l, i) { x.fillText(l, 50, 38 + i * 52); });
    var t = canvasTex(c); t.userData = { ar: 640 / h }; return t;
  }
  var bubbles = [];
  [['Buatkan cerita tentang kucing yang terbang ke bulan.', 'user', -1.9, 1.7, 0.3],
   ['Pada suatu malam, Mimi si kucing menemukan roket dari kardus di halaman belakang…', 'ai', 1.75, 0.5, 0.9],
   ['Tambahkan teman robot yang suka menyanyi!', 'user', -1.9, -0.75, 1.5]].forEach(function (d) {
    var t = bubbleTex(d[0], d[1]), w = 3.0;
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / t.userData.ar), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0 }));
    m.userData = { x: d[2], y: d[3], z: -0.4, at: d[4] }; m.position.set(d[2], d[3], 0); stageProps.add(m); bubbles.push(m);
  });

  /* ---------- properti adegan 3: karusel game ---------- */
  var GAMES = ['petualangan-pixi-moko', 'bloops-adventure', 'dinos-lost-world-adventure', 'robot-chef-magic-kitchen', 'labirin-harta-karun', 'save-the-rainbow-forest', 'eco-detective-mission', 'jelajah-indonesia-quiz', 'neon-breakout', 'snake-klasik', 'sky-hopper', 'serbuan-galaksi', 'space-explorer-challenge'];
  var gameImgs = [];
  var roundAlpha = (function () {
    var c = mk(256, 160), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 256, 160); x.fillStyle = '#fff'; roundRect(x, 0, 0, 256, 160, 26); x.fill();
    return new THREE.CanvasTexture(c);
  })();
  var games = [];
  GAMES.forEach(function (name, i) {
    var t = tex('assets/karya/' + name + '.webp' + VQ);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.19), new THREE.MeshBasicMaterial({ map: t, alphaMap: roundAlpha, transparent: true, depthWrite: false, opacity: 0 }));
    m.userData.i = i; stageProps.add(m); games.push(m);
    var img = new Image(); img.src = 'assets/karya/' + name + '.webp' + VQ; gameImgs.push(img);
  });

  /* ---------- properti adegan 4: jendela peramban yang dibangun ---------- */
  var bc = mk(768, 480), bx = bc.getContext('2d'), bTex = canvasTex(bc), bLast = -1;
  var browser = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.625), new THREE.MeshBasicMaterial({ map: bTex, transparent: true, depthWrite: false, opacity: 0 }));
  browser.userData = { x: 2.2, y: 0.5 }; stageProps.add(browser);
  function drawBrowser(p) {
    if (Math.abs(p - bLast) < 0.004) return; bLast = p;
    var x = bx; x.clearRect(0, 0, 768, 480);
    roundRect(x, 14, 14, 740, 452, 30); x.fillStyle = '#fff'; x.shadowColor = 'rgba(30,20,100,0.4)'; x.shadowBlur = 30; x.shadowOffsetY = 12; x.fill(); x.shadowColor = 'transparent';
    roundRect(x, 14, 14, 740, 64, 30); x.fillStyle = '#f1eeff'; x.fill(); x.fillRect(14, 50, 740, 28);
    ['#ff7fa6', '#ffc83d', '#52d68a'].forEach(function (c, i) { x.fillStyle = c; x.beginPath(); x.arc(52 + i * 28, 46, 9, 0, 7); x.fill(); });
    roundRect(x, 170, 28, 420, 36, 18); x.fillStyle = '#fff'; x.fill();
    x.fillStyle = '#6a63a8'; x.font = '700 22px "Nunito", sans-serif'; x.textBaseline = 'middle'; x.fillText('portofolio-saya.web', 196, 47);
    var a = smooth(p / 0.18);
    x.globalAlpha = a; roundRect(x, 44, 100, 680, 110, 24);
    var g = x.createLinearGradient(44, 0, 724, 0); g.addColorStop(0, '#6c5ce7'); g.addColorStop(1, '#a08cff'); x.fillStyle = g; x.fill();
    x.fillStyle = '#fff'; x.font = '800 40px "Baloo 2","Nunito",sans-serif'; x.fillText('Karya Buatan Saya', 72, 140);
    x.font = '700 22px "Nunito", sans-serif'; x.fillStyle = '#e6e0ff'; x.fillText('Game dan website pertamaku, dibantu AI', 72, 182);
    x.globalAlpha = 1;
    for (var i = 0; i < 3; i++) {
      var ap = smooth((p - 0.2 - i * 0.16) / 0.16); if (ap <= 0) continue;
      var cx0 = 44 + i * 232, cy0 = 232 + (1 - ap) * 30;
      x.globalAlpha = ap; roundRect(x, cx0, cy0, 216, 150, 22); x.save(); x.clip();
      var im = gameImgs[(i * 3) % gameImgs.length]; if (im && im.complete && im.naturalWidth) x.drawImage(im, cx0, cy0, 216, 150); else { x.fillStyle = '#ddd6ff'; x.fillRect(cx0, cy0, 216, 150); }
      x.restore(); x.globalAlpha = 1;
    }
    var bp = smooth((p - 0.72) / 0.28);
    roundRect(x, 44, 410, 680, 24, 12); x.fillStyle = '#ece8ff'; x.fill();
    if (bp > 0) { roundRect(x, 44, 410, Math.max(24, 680 * bp), 24, 12); x.fillStyle = '#ffc83d'; x.fill(); }
    x.fillStyle = '#4a3fc0'; x.font = '800 18px "Nunito", sans-serif'; x.fillText(bp >= 1 ? 'Terbit!' : 'Menerbitkan…', 56, 423);
    bTex.needsUpdate = true;
  }

  /* ---------- properti adegan 6: sertifikat & sorot lampu ---------- */
  var cert = (function () {
    var c = mk(640, 440), x = c.getContext('2d');
    roundRect(x, 16, 16, 608, 408, 34); x.fillStyle = '#fff'; x.shadowColor = 'rgba(30,20,100,0.4)'; x.shadowBlur = 30; x.shadowOffsetY = 12; x.fill(); x.shadowColor = 'transparent';
    roundRect(x, 40, 40, 560, 360, 22); x.lineWidth = 6; x.strokeStyle = '#6c5ce7'; x.stroke();
    x.textAlign = 'center'; x.fillStyle = '#6c5ce7'; x.font = '800 30px "Unbounded", sans-serif'; x.fillText('SERTIFIKAT', 320, 120);
    x.fillStyle = '#2a2270'; x.font = '800 54px "Baloo 2", "Nunito", sans-serif'; x.fillText('Future Maker', 320, 200);
    x.fillStyle = '#5a5488'; x.font = '700 26px "Nunito", sans-serif'; x.fillText('Selesai 4 pertemuan dan tampil di Demo Day', 320, 262);
    x.fillStyle = '#ffc83d'; x.beginPath();
    for (var i = 0; i < 10; i++) { var r = i % 2 ? 16 : 38, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(320 + Math.cos(a) * r, 340 + Math.sin(a) * r); }
    x.closePath(); x.fill();
    var m = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.0), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, opacity: 0 }));
    m.userData = { x: -3.2, y: 0.9 }; stageProps.add(m); return m;
  })();
  var beams = [];
  [-1, 1].forEach(function (s) {
    var m = new THREE.Mesh(new THREE.ConeGeometry(2.2, 11, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.position.set(s * 3.6, 4.2, -9); m.rotation.z = s * 0.32; m.renderOrder = -4; scene.add(m); beams.push(m);
  });

  /* ---------- Pixi: muat model ---------- */
  var pose = { armL: 0, armR: 0, naik: 0, yaw: 0, eyeY: 1, mouth: 0.8, lookX: 0, lookY: 0, condong: 0, miring: 0, sc: 0.58, x: 0, y: -0.28, z: -5, legAmp: 0.07, armAmp: 0.1, speed: 1.3, jump: 0 };
  var loaded = false;
  PixiModel.load(function (m) {
    px = m; px.root.add(shadow); shadow.position.y = px.feetY + 0.01;
    px.root.add(ringDisc); px.root.add(ringLine); ringDisc.position.y = ringLine.position.y = px.feetY + 0.02;
    rig.add(px.root); loaded = true; film.classList.add('is-live'); resize(); update(0.016, true);
    if (debug) window.__film = api;
  });

  /* ---------- properti 3D (model Meshy) ----------
     Tiap benda memakai jendela adegan sendiri. Muncul dengan membesar, melayang, berputar. */
  var propsGroup = new THREE.Group(); camera.add(propsGroup);
  var propModels = {};
  var PROP_FILES = ['bintang', 'koin', 'laptop', 'medali', 'pengendali', 'piala', 'roket'];
  (function () {
    if (!window.MeshoptDecoder) return;
    var ld = new THREE.GLTFLoader(); ld.setMeshoptDecoder(MeshoptDecoder);
    PROP_FILES.forEach(function (n) {
      ld.load('assets/props/' + n + '.glb' + VQ, function (g) {
        g.scene.traverse(function (o) { if (o.isMesh) { o.material.envMapIntensity = 0.9; o.frustumCulled = false; } });
        propModels[n] = g.scene;
        rebuildProps();
      });
    });
  })();
  // daftar benda: nama model, jumlah salinan, ukuran, jendela u, dan fungsi posisi
  var PROP_DEFS = [
    { n: 'bintang', copies: 6, size: 0.5, win: function (u) { return u < 1 ? 1 - smooth((u - 0.5) / 0.4) : (u >= 5.55 ? smooth((u - 5.55) / 0.3) : 0); },
      pos: function (i, t) { var a = i * Math.PI / 3 + t * 0.45; return [Math.cos(a) * 2.3, 0.25 + Math.sin(a) * 1.2, -4.6 + Math.sin(a) * 0.8, 0.7 + (i % 3) * 0.2]; } },
    { n: 'roket', copies: 1, size: 1.0, win: function (u) { return smooth((u - 2.1) / 0.14) * (1 - smooth((u - 2.88) / 0.1)); },
      pos: function (i, t) { return [1.95, 0.95 + Math.sin(t * 1.1) * 0.12, -4.2, 0.9]; }, tilt: -0.5 },
    { n: 'pengendali', copies: 1, size: 1.05, win: function (u) { return smooth((u - 3.1) / 0.14) * (1 - smooth((u - 3.9) / 0.1)); },
      pos: function (i, t) { return [2.0, 1.0 + Math.sin(t * 1.3) * 0.1, -4.0, 0.95]; }, tilt: 0.25 },
    { n: 'koin', copies: 4, size: 0.4, win: function (u) { return smooth((u - 3.14) / 0.14) * (1 - smooth((u - 3.9) / 0.1)); },
      pos: function (i, t) { var a = i * Math.PI / 2 + t * 0.9; return [Math.cos(a) * 1.8, 0.05 + Math.sin(a) * 0.5, -4.8 + Math.sin(a) * 0.9, 1]; }, spin: 3 },
    { n: 'laptop', copies: 1, size: 1.1, win: function (u) { return smooth((u - 4.12) / 0.14) * (1 - smooth((u - 4.9) / 0.1)); },
      pos: function (i, t) { return [2.0, -0.6 + Math.sin(t * 1.2) * 0.08, -4.1, 0.95]; }, tilt: 0.0, yaw: -0.5 },
    { n: 'piala', copies: 1, size: 0.95, win: function (u) { return smooth((u - 5.55) / 0.2); },
      pos: function (i, t) { return [2.05, -0.35 + Math.sin(t * 1.4) * 0.08, -4.4, 0.9]; } },
    { n: 'medali', copies: 1, size: 0.8, win: function (u) { return smooth((u - 5.65) / 0.2); },
      pos: function (i, t) { return [-2.15, -0.5 + Math.sin(t * 1.1 + 1) * 0.1, -4.4, 0.9]; }, tilt: 0.15 }
  ];
  var propItems = [];
  function rebuildProps() {
    propItems.forEach(function (it) { propsGroup.remove(it.obj); });
    propItems = [];
    PROP_DEFS.forEach(function (d) {
      var base = propModels[d.n]; if (!base) return;
      for (var i = 0; i < d.copies; i++) {
        var o = base.clone(true); o.visible = false; propsGroup.add(o);
        propItems.push({ def: d, i: i, obj: o });
      }
    });
  }
  function updateProps(U, t, ph) {
    for (var k = 0; k < propItems.length; k++) {
      var it = propItems[k], d = it.def, a = d.win(U);
      if (a < 0.01) { it.obj.visible = false; continue; }
      var p = d.pos(it.i, t), sz = d.size * (p[3] || 1) * a / 1.9;     // model berukuran sekitar 1.9 satuan
      it.obj.visible = true;
      it.obj.position.set(p[0] * ph, p[1], p[2]);
      it.obj.scale.setScalar(sz * lerp(0.7, 1, (ph - 0.3) / 0.7));
      it.obj.rotation.set(d.tilt || 0, (d.yaw || 0) + t * (d.spin !== undefined ? d.spin : 0.7) + it.i * 1.3, (d.n === 'bintang' ? Math.sin(t + it.i) * 0.25 : 0));
    }
  }

  /* ---------- lini waktu ---------- */
  function flashAt(u) {
    if (u < 1.78) return 0;
    if (u < 2) return smooth((u - 1.78) / 0.22);
    if (u < 2.14) return 1 - smooth((u - 2) / 0.14);
    if (u < 4.78) return 0;
    if (u < 5) return smooth((u - 4.78) / 0.22);
    if (u < 5.18) return 1 - smooth((u - 5) / 0.18);
    return 0;
  }
  // kamera luar ruangan: s = zoom, (cx, cy) = titik yang dilihat pada bidang latar
  function cameraAt(u) {
    var s = 1, cx = 0, cy = 0, k, q;
    if (u < 1) { s = 1 + 0.1 * smooth(u); }
    else if (u < 2) {
      k = u - 1;
      if (k < 0.55) { q = smooth(k / 0.55); s = 1.1 + 0.7 * q; cx = 0.6 * q; cy = 1.4 * q; }
      else { q = smooth((k - 0.55) / 0.45); s = 1.8 + 1.8 * q; cx = lerp(0.6, -4.5, q); cy = lerp(1.4, 0.65, q); }
    } else if (u >= 5) {
      q = smooth((u - 5.1) / 0.8); s = lerp(3.6, 1.05, q); cx = lerp(-4.5, 0, q); cy = lerp(0.65, 0, q);
    }
    return { s: s, cx: cx, cy: cy };
  }

  var par = { x: 0, y: 0, tx: 0, ty: 0 }, lastPtr = -1e9;
  var U = 0, Us = 0, uTarget = 0, t = 0, kedipNext = 2, kedipStart = -1, hop = -1, hover = false;
  var V = {};   // nilai pose yang dihaluskan
  var lastFlash = '', lastDive = '';
  var tgt = {};

  function setTargets(u, video) {
    var i = Math.min(N - 1, Math.floor(u)), f = u - i;
    var hx = clamp((aspect - 0.5) / (1.78 - 0.5), 0, 1);
    var T = { armL: 0, armR: 0, naik: 0, yaw: 0, eyeY: 1, mouth: 0.8, lookX: par.x * 0.6, lookY: par.y * 0.3, condong: 0, miring: 0, sc: 0.58, x: 0, y: -0.28, z: -5, legAmp: 0.07, armAmp: 0.1, speed: 1.3 };
    T.yaw = par.x * 0.28;
    if (i === 0) {
      var w = 1 - smooth((f - 0.3) / 0.25);                       // melambai di awal
      T.armR = (2.7 + Math.sin(t * 10) * 0.35) * w; T.armAmp = 0.12 * w + 0.06; T.miring = 0.05 * w;
    } else if (i === 1) {
      var up = smooth(f / 0.5), dive = smooth((f - 0.55) / 0.45);
      T.y = lerp(-0.28, 0.12, up); T.sc = lerp(0.58, 0.6, up);
      T.armR = 1.1 * up; T.armL = -1.1 * up;                       // sayap terbentang
      T.condong = 0.12 * up + 0.4 * dive; T.naik = 0.12 * up; T.eyeY = 1.08;
      T.y = lerp(T.y, 0.35, dive); T.sc = lerp(T.sc, 0.4, dive); T.z = lerp(-5, -6, dive);
      T.legAmp = 0.2; T.speed = 3;
    } else if (i === 2) {
      T.y = -0.15; T.sc = 0.6; T.yaw = Math.sin(f * 3) * 0.4 + 0.25; T.lookX = 0.5 * Math.sin(f * 3);
      T.armR = (f < 0.5 ? 1.2 + Math.sin(t * 3) * 0.1 : 2.4 + Math.sin(t * 9) * 0.3); T.mouth = 0.9 + Math.abs(Math.sin(t * 7)) * 0.25 * (f > 0.15 ? 1 : 0);
    } else if (i === 3) {
      T.y = -0.15; T.sc = 0.6; T.armR = 2.9; T.armL = -2.9; T.eyeY = 0.7; T.mouth = 1.1;
      T.naik = Math.abs(Math.sin(t * 5.5)) * 0.32; T.yaw = Math.sin(f * Math.PI * 2) * 0.85; T.legAmp = 0.28; T.speed = 6; T.armAmp = 0.2;
    } else if (i === 4) {
      T.y = -0.15; T.sc = 0.6; T.yaw = 0.7; T.lookX = 0.8; T.armR = 1.6 + Math.sin(t * 3.5) * 0.08; T.condong = 0.05;
    } else {
      var fall = smooth((f - 0.1) / 0.8);
      T.y = -0.28; T.sc = 0.58; T.armR = 2.9; T.armL = -2.9; T.eyeY = 0.55; T.mouth = 1.2;
      T.naik = Math.abs(Math.sin(t * 6.5)) * 0.4 * smooth((f - 0.35) / 0.3); T.legAmp = 0.3; T.speed = 7; T.armAmp = 0.22; T.yaw = par.x * 0.25;
      T.sc = lerp(0.4, 0.58, fall); T.z = lerp(-6, -5, fall); T.y = lerp(0.2, -0.28, fall);
    }
    if (video) {
      // Pixi berdiri di podium ruang dalam; di adegan terakhir ia ikut keluar dan mendarat di podium plaza
      if (i >= 2 && i <= 4) { T.y = 0.28; T.sc = 0.6; }
      if (i === 5) {
        var land = smooth((f - 0.3) / 0.4);
        T.y = lerp(0.28, -0.28, land); T.sc = lerp(0.6, 0.58, land); T.z = -5;
        T.naik = Math.abs(Math.sin(t * 6.5)) * 0.4 * smooth((f - 0.72) / 0.2);
        T.armR = lerp(1.1, 2.9, smooth((f - 0.2) / 0.5)); T.armL = lerp(-1.1, -2.9, smooth((f - 0.2) / 0.5));
        T.condong = 0.1 * (1 - land);
      }
      if (i === 1) { T.z = lerp(-5, -5.6, smooth((f - 0.55) / 0.45)); T.sc = lerp(T.sc, 0.5, smooth((f - 0.55) / 0.45)); }
    }
    if (i >= 2 && i <= 4) { T.x = (i === 4 ? 0.9 : 1.35) * hx; T.y += 0.5 * (1 - hx); }
    T.sc *= lerp(0.78, 1, hx);
    if (i < 2 || i === 5) T.y += 0.42 * (1 - hx);
    return T;
  }

  function update(dt, snap) {
    var i, k;
    // progres film dengan kelembaman, supaya gerak kamera terasa seperti video
    if (snap) Us = uTarget; else Us += (uTarget - Us) * (1 - Math.exp(-dt * 5.5));
    U = clamp(Us, 0, N - 0.0001);
    t += dt;

    par.x += (par.tx - par.x) * (1 - Math.exp(-dt * 4)); par.y += (par.ty - par.y) * (1 - Math.exp(-dt * 4));
    if (performance.now() - lastPtr > 3500) { par.tx = Math.sin(t * 0.4) * 0.35; par.ty = Math.sin(t * 0.27) * 0.15; }

    var sc = Math.floor(U), f = U - sc;
    pumpClips(U);
    var ac = activeClip(U), videoOn = !!ac;
    var outdoor = videoOn ? true : (U < 2 || U >= 5);
    // kamera & latar
    var cm = cameraAt(U);
    if (videoOn) {
      cm = { s: 1.05, cx: 0, cy: 0 };
      if (texA.image !== ac.a) { texA.image = ac.a; texA.needsUpdate = true; }
      if (texB.image !== ac.b) { texB.image = ac.b; texB.needsUpdate = true; }
      if (back.material.map !== texA) { back.material.map = texA; back.material.needsUpdate = true; }
      back2.material.opacity = ac.frac; back2.visible = ac.frac > 0.01;
    } else {
      back2.visible = false;
      if (back.material.map !== latarMap) { back.material.map = latarMap; back.material.needsUpdate = true; }
    }
    var visHs = visH / cm.s, visWs = visHs * aspect;
    var maxX = Math.max(0, PW / 2 - visWs / 2), maxY = Math.max(0, PH / 2 - visHs / 2);
    var cx = clamp(cm.cx, -maxX, maxX), cy = clamp(cm.cy, -maxY, maxY);
    if (videoOn) { cx = clamp(par.x * 0.3, -maxX, maxX); cy = clamp(par.y * 0.16, -maxY, maxY); }
    camera.position.set(cx + par.x * 0.18 * (outdoor ? 1 : 3), cy + par.y * 0.1 * (outdoor ? 1 : 2) + (outdoor ? 0 : Math.sin(t * 0.3) * 0.05), PZ + 10 / cm.s);
    camera.rotation.set(0, outdoor ? -par.x * 0.012 : -par.x * 0.05 + Math.sin(U * 2.2) * 0.04, 0);
    back.visible = outdoor;
    var inn = outdoor ? '0' : '1', vid = videoOn ? '1' : '0';
    if (film.dataset.inner !== inn) film.dataset.inner = inn;
    if (film.dataset.video !== vid) film.dataset.video = vid;

    // awan melayang, dan awan depan menyapu layar saat kamera naik
    for (i = 0; i < clouds.length; i++) {
      var c = clouds[i]; c.position.x += c.userData.v * dt; if (c.position.x > 13) c.position.x = -13;
      c.visible = outdoor && !videoOn;
      if (c.userData.fg) { c.material.opacity = c.userData.o * smooth((U - 1.0) / 0.2) * (1 - smooth((U - 1.7) / 0.25)); if (c.material.opacity < 0.01) c.visible = false; }
    }
    // bintang & konfeti
    stars.material.opacity = videoOn ? 0 : (outdoor ? (U >= 1.45 && U < 2 ? smooth((U - 1.45) / 0.4) * 0.9 : 0) : 0.9);
    stars.material.size = 0.09;
    confetti.material.opacity = videoOn ? (U >= 5.72 ? 0.55 * smooth((U - 5.72) / 0.25) : 0) : ((U >= 4.9) ? smooth((U - 5) / 0.4) : 0);
    var sp = stars.geometry.attributes.position, cp = confetti.geometry.attributes.position, d;
    var fastStars = (U >= 1.45 && U < 2) ? 14 : 1.2;
    if (stars.material.opacity > 0.01) {
      for (i = 0; i < sp.count; i++) {
        var z = sp.getZ(i) + fastStars * dt * (0.4 + (i % 7) * 0.12);
        if (z > -0.5) { z = -22; sp.setX(i, rnd(-10, 10)); sp.setY(i, rnd(-6, 6)); }
        sp.setZ(i, z);
      }
      sp.needsUpdate = true;
    }
    if (confetti.material.opacity > 0.01) {
      for (i = 0; i < cp.count; i++) {
        var yy = cp.getY(i) - dt * (1.2 + (i % 5) * 0.35);
        if (yy < -5.5) { yy = 5.5; cp.setX(i, rnd(-7, 7)); }
        cp.setY(i, yy); cp.setX(i, cp.getX(i) + Math.sin(t * 2 + i) * dt * 0.6);
      }
      cp.needsUpdate = true;
    }

    // wordmark
    wordmark.material.opacity = (U < 1.0) ? 1 - smooth((U - 0.55) / 0.45) : 0;
    wordmark.visible = wordmark.material.opacity > 0.01;
    var wk = Math.min(1, (2 * 7.6 * Math.tan(camera.fov * Math.PI / 360) * aspect * 0.94) / 12.6); wordmark.scale.set(wk, wk, 1); wordmark.position.y = lerp(1.55, 1.75, 1 - clamp((aspect - 0.5) / 1.28, 0, 1));
    var ta = (U >= 1.0 && U < 2) ? smooth((U - 1.04) / 0.2) * (1 - smooth((U - 1.62) / 0.16)) : 0;
    title1.material.opacity = ta; title1.visible = ta > 0.01;
    var tk = Math.min(1, (2 * 6.6 * Math.tan(camera.fov * Math.PI / 360) * aspect * 0.9) / 10); title1.scale.set(tk, tk, 1);
    title1.position.y = lerp(0.5, 1.3, 1 - clamp((aspect - 0.5) / 1.28, 0, 1));
    // sorot lampu
    beams.forEach(function (b, j) { b.material.opacity = (!videoOn && U >= 5.1) ? 0.1 * smooth((U - 5.2) / 0.5) * (0.8 + 0.2 * Math.sin(t * 2 + j)) : 0; });

    // ---- properti dalam ruangan ----
    var inS2 = sc === 2, inS3 = sc === 3, inS4 = sc === 4, inRoom = !outdoor;
    var ph = lerp(0.42, 1, clamp((aspect - 0.5) / (1.78 - 0.5), 0, 1));
    updateProps(U, t, lerp(0.3, 1, clamp((aspect - 0.5) / (1.78 - 0.5), 0, 1)));
    ringDisc.visible = ringLine.visible = inRoom && !videoOn;
    ringLine.rotation.z = t * 0.4; ringDisc.material.opacity = 1;
    shadow.visible = true; shadow.material.opacity = outdoor ? 0.7 : 0.25;

    bubbles.forEach(function (m, j) {
      var a = inS2 ? smooth((f - m.userData.at * 0.28) / 0.12) * (1 - smooth((f - 0.93) / 0.07)) : 0;
      m.material.opacity = a; m.visible = a > 0.01;
      m.position.set(m.userData.x * ph, m.userData.y + Math.sin(t * 1.2 + j * 2) * 0.1, -0.2 - j * 0.3);
      m.scale.setScalar((0.85 + 0.15 * a) * lerp(0.62, 1, (ph - 0.42) / 0.58));
    });
    games.forEach(function (m, j) {
      var vis = inS3 ? 1 : 0;
      var ang = (j / games.length) * Math.PI * 2 + f * Math.PI * 2 * 0.9 + (inS3 ? 0 : 0);
      var R = 2.9 * ph, depth = Math.cos(ang);
      var a = vis * smooth(f / 0.12) * (1 - smooth((f - 0.92) / 0.08)) * (depth > 0.3 ? 0.5 : 0.95);
      m.material.opacity = a; m.visible = a > 0.01;
      m.position.set(Math.sin(ang) * R, 0.55 - depth * 0.8 + Math.sin(ang * 2 + t) * 0.08, -depth * 1.6 - 0.1);
      var s = 0.62 + 0.5 * (depth * 0.5 + 0.5); m.scale.set(s, s, 1); m.renderOrder = depth > 0 ? 2 : -1;
    });
    var ba = inS4 ? smooth(f / 0.12) * (1 - smooth((f - 0.93) / 0.07)) : 0;
    browser.material.opacity = ba; browser.visible = ba > 0.01;
    browser.position.set(browser.userData.x * ph, browser.userData.y + Math.sin(t) * 0.07 + (ph < 0.8 ? 1.6 : 0), -0.2);
    browser.rotation.y = -0.28; browser.scale.setScalar((0.74 + 0.1 * ba) * (ph < 0.8 ? 0.8 : 1));
    if (inS4) drawBrowser(smooth((f - 0.12) / 0.7));
    var ca = (sc === 5) ? smooth((f - 0.45) / 0.15) : 0;
    cert.material.opacity = ca; cert.visible = ca > 0.01;
    cert.position.set(cert.userData.x * ph, cert.userData.y + Math.sin(t * 1.3) * 0.08 + (ph < 0.8 ? 1.3 : 0), -0.3); cert.rotation.z = 0.06 * Math.sin(t);

    // ---- Pixi ----
    if (px) {
      var T = setTargets(U, videoOn), kk = 1 - Math.exp(-dt * 8);
      for (var key in T) { if (V[key] === undefined) V[key] = T[key]; V[key] += (T[key] - V[key]) * (snap ? 1 : kk); }
      // lompatan karena diklik
      var jy = 0, jarm = 0;
      if (hop >= 0) {
        hop += dt;
        if (hop < 1.1) { var u2 = hop / 1.1; jy = Math.sin(u2 * Math.PI) * 0.7; jarm = Math.sin(u2 * Math.PI); } else hop = -1;
      }
      var ay = V.armAmp * Math.sin(t * V.speed * 1.6), lg = V.legAmp * Math.sin(t * V.speed * 2);
      var armR = V.armR + jarm * (2.9 - V.armR) + ay, armL = V.armL - jarm * (2.9 + V.armL) - ay;
      px.apply({ armL: armL, armR: armR, legL: -lg - jarm * 0.4, legR: lg - jarm * 0.4, eyeY: jarm > 0.1 ? Math.min(V.eyeY, 0.6) : V.eyeY * blink(), lookX: V.lookX, lookY: V.lookY, mouth: jarm > 0.1 ? 1.2 : V.mouth });
      var unit = Math.tan(camera.fov * Math.PI / 360) * 5 / 1.875;       // menyesuaikan perubahan fov
      var s2 = V.sc * unit;
      rig.position.set(V.x, (V.y + V.naik + jy) * unit, V.z);
      rig.scale.setScalar(s2);
      px.root.rotation.set(V.condong + par.y * 0.08, V.yaw + (U < 2 || U >= 5 ? 0 : 0), V.miring);
      shadow.scale.setScalar(1 - clamp((V.naik + jy) / 0.8, 0, 1) * 0.4);
    }
    stageProps.position.y = px ? 0 : 0;

    // ---- sinkron DOM ----
    var fl = videoOn ? '0' : flashAt(U).toFixed(2);
    if (fl !== lastFlash) { lastFlash = fl; film.style.setProperty('--flash', fl); }
    var dive = (!videoOn && U >= 1.55 && U < 2) ? smooth((U - 1.55) / 0.45) : 0;
    var dv = dive.toFixed(2);
    if (dv !== lastDive) { lastDive = dv; film.style.setProperty('--dive', dv); }
    if (film.dataset.scene !== String(sc)) {
      film.dataset.scene = String(sc);
      var tx = film.querySelectorAll('.t'); for (i = 0; i < tx.length; i++) tx[i].classList.toggle('on', Number(tx[i].dataset.s) === sc);
      var dots = film.querySelectorAll('.film-dots button'); for (i = 0; i < dots.length; i++) dots[i].setAttribute('aria-current', i === sc ? 'true' : 'false');
      var ctr = film.querySelector('.film-count b'); if (ctr) ctr.textContent = '0' + (sc + 1);
    }
  }

  function blink() {
    if (t > kedipNext) { kedipStart = t; kedipNext = t + 2.5 + Math.random() * 3; }
    var k = (t - kedipStart) / 0.16;
    return (k >= 0 && k < 1) ? 1 - 0.92 * Math.sin(k * Math.PI) : 1;
  }

  /* ---------- ukuran, scroll, pointer ---------- */
  function resize() {
    var w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    aspect = w / h;
    visH = Math.min(PH, PW / aspect);
    camera.fov = 2 * Math.atan(visH / 2 / 10) * 180 / Math.PI;
    camera.aspect = aspect; camera.updateProjectionMatrix();
  }
  function onScroll() {
    var r = track.getBoundingClientRect(), total = r.height - innerHeight;
    uTarget = clamp(-r.top / total, 0, 1) * N;
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { resize(); onScroll(); });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);

  addEventListener('pointermove', function (e) {
    lastPtr = performance.now();
    par.tx = clamp(e.clientX / innerWidth * 2 - 1, -1, 1); par.ty = clamp(-(e.clientY / innerHeight * 2 - 1), -1, 1);
    hover = overPixi(e.clientX, e.clientY); canvas.style.cursor = hover ? 'pointer' : '';
  }, { passive: true });
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), sphere = new THREE.Sphere(), hit = new THREE.Vector3();
  function overPixi(cx, cy) {
    if (!px) return false;
    var r = canvas.getBoundingClientRect();
    ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height * 2 - 1));
    ray.setFromCamera(ndc, camera);
    px.root.getWorldPosition(sphere.center); sphere.radius = 1.4 * rig.scale.x * 1.0 + 0.2;
    sphere.center.y += 0.15 * rig.scale.x;
    return ray.ray.intersectSphere(sphere, hit) !== null;
  }
  canvas.addEventListener('pointerdown', function (e) { if (overPixi(e.clientX, e.clientY) && hop < 0) hop = 0; });

  /* ---------- loop ---------- */
  var perfSum = 0, perfN = 0;
  var raf = 0, last = 0, visible = true, debug = location.hash === '#debug';
  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    update(dt, false);
    renderer.render(scene, camera);
    // jika perangkat terasa berat, turunkan resolusi render bertahap
    perfSum += dt; perfN++;
    if (perfN >= 40) {
      if (perfSum / perfN > 0.032 && dpr > 0.8) { dpr = Math.max(0.75, dpr - 0.25); renderer.setPixelRatio(dpr); resize(); }
      perfSum = 0; perfN = 0;
    }
  }
  function start() { if (raf || !loaded) return; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !document.hidden) start(); else stop(); }, { rootMargin: '200px' }).observe(film);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) start(); });
  resize(); onScroll();
  var wait = setInterval(function () { if (loaded) { clearInterval(wait); start(); } }, 100);

  // titik adegan: klik untuk melompat ke adegan itu
  film.querySelectorAll('.film-dots button').forEach(function (b, i) {
    b.addEventListener('click', function () {
      var r = track.getBoundingClientRect(), total = r.height - innerHeight;
      scrollTo({ top: scrollY + r.top + total * ((i + 0.5) / N), behavior: 'smooth' });
    });
  });

  var api = {
    show: function (u) { stop(); uTarget = u; for (var i = 0; i < 40; i++) update(0.016, true); update(0.016, true); renderer.render(scene, camera); },
    dbg: function () { return { U: U, ta: title1.material.opacity, tv: title1.visible, wv: wordmark.visible, wo: wordmark.material.opacity }; },
    stop: stop, start: start, snap: function (type, q) { return canvas.toDataURL(type || 'image/webp', q || 0.9); }
  };
})();
