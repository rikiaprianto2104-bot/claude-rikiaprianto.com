/* Pixi 3D untuk beranda — memakai model dan tampilan yang sama dengan rikiaprianto.com/pixi
   (pixi-v2.glb: satu bentuk utuh, tangan dan kaki ditekuk lewat shader, wajah dari stiker
   yang bisa berkedip, melirik, dan membuka mulut).
   Dua mode memakai model yang sama:
     "hero"  : #pixi-stage, interaktif. Mata mengikuti kursor, klik = lompat kegirangan, geser = memutar.
     "story" : #story-stage, digerakkan oleh scroll mengikuti 4 pertemuan kelas.
   Sudut putar dibatasi (±70°) karena punggung model polos; sisi depannya yang bagus. */
(function () {
  'use strict';
  if (!window.THREE || !THREE.GLTFLoader) return; // gagal memuat three.js: gambar Pixi statis tetap tampil

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  var heroRoot = document.getElementById('pixi-stage');
  var storyRoot = document.getElementById('story-stage');
  if (heroRoot) createStage(heroRoot, 'hero');
  if (storyRoot && !reduced) createStage(storyRoot, 'story');

  function createStage(root, mode) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    var canvas = renderer.domElement;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', mode === 'hero'
      ? 'Pixi, maskot 3D Future Makers. Klik untuk membuatnya melompat, geser untuk memutarnya.'
      : 'Pixi, maskot 3D Future Makers, bergerak mengikuti urutan pertemuan saat halaman digulir.');
    root.appendChild(canvas);

    var scene = new THREE.Scene();

    // Lingkungan studio mini (softbox) supaya permukaan Pixi punya kilau lembut seperti mainan
    (function () {
      var es = new THREE.Scene();
      es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: 0x5a4fc8, side: THREE.BackSide })));
      var kotak = function (x, y, z, w, h, s) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(s, s, s), side: THREE.DoubleSide }));
        m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m);
      };
      kotak(-8, 9, 9, 7, 5, 4); kotak(9, 4, 6, 3, 6, 2.2); kotak(0, 6, -10, 10, 3, 2);
      var pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromScene(es, 0.03).texture;
      pm.dispose();
    })();

    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9aeff, 0.75));
    var kunci = new THREE.DirectionalLight(0xffffff, 0.55); kunci.position.set(3, 5, 6); scene.add(kunci);
    var isi = new THREE.DirectionalLight(0xe2dcff, 0.3); isi.position.set(-3, -2, 4); scene.add(isi);
    var tepi = new THREE.DirectionalLight(0xc8bfff, 0.6); tepi.position.set(-4, 3, -3); scene.add(tepi);

    var pixi = new THREE.Group(); scene.add(pixi);

    // Bayangan lembut di lantai
    var cv = document.createElement('canvas'); cv.width = cv.height = 128;
    var cx = cv.getContext('2d'); var gr = cx.createRadialGradient(64, 64, 4, 64, 64, 64);
    var dark = mode === 'story';
    gr.addColorStop(0, dark ? 'rgba(10,5,60,.55)' : 'rgba(80,62,200,.34)');
    gr.addColorStop(0.55, dark ? 'rgba(10,5,60,.2)' : 'rgba(80,62,200,.12)');
    gr.addColorStop(1, 'rgba(80,62,200,0)');
    cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128);
    var bayangan = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    bayangan.rotation.x = -Math.PI / 2; bayangan.position.y = -1.32; scene.add(bayangan);

    // ---- Model GLB: satu bentuk utuh; tangan & kaki ditekuk lewat shader ----
    var glbG = null, P = null;
    var kanvas = function (w, h, gambar) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; gambar(c.getContext('2d'), w, h);
      var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
    };
    var bahanStiker = function (map, urutan) {
      return new THREE.MeshStandardMaterial({
        map: map, transparent: true, roughness: 0.55, metalness: 0, envMapIntensity: 0.3,
        depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 - urutan * 2, polygonOffsetUnits: -4 - urutan * 2
      });
    };
    var tambalPutih = function () {
      return kanvas(128, 128, function (x, w, h) {
        var g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, 'rgb(250,249,252)'); g.addColorStop(0.7, 'rgb(250,249,252)'); g.addColorStop(1, 'rgba(250,249,252,0)');
        x.fillStyle = g; x.fillRect(0, 0, w, h);
      });
    };
    var teksMata = function () {
      return kanvas(96, 136, function (x, w, h) {
        var g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1d1655'); g.addColorStop(1, '#0a0726');
        x.fillStyle = g; x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.44, h * 0.44, 0, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#fff'; x.beginPath(); x.ellipse(w * 0.62, h * 0.3, w * 0.15, h * 0.11, -0.3, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.ellipse(w * 0.36, h * 0.68, w * 0.06, h * 0.045, 0, 0, Math.PI * 2); x.fill();
      });
    };
    var teksMulut = function () {
      return kanvas(160, 90, function (x, w, h) {
        x.save(); x.beginPath(); x.moveTo(w * 0.12, h * 0.28); x.lineTo(w * 0.88, h * 0.28);
        x.bezierCurveTo(w * 0.88, h * 0.96, w * 0.12, h * 0.96, w * 0.12, h * 0.28); x.closePath(); x.clip();
        x.fillStyle = '#7d1a3a'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#ff7d95'; x.beginPath(); x.ellipse(w * 0.5, h * 0.84, w * 0.19, h * 0.16, 0, 0, Math.PI * 2); x.fill(); x.restore();
      });
    };
    // Letak wajah pada model ini (diukur dari modelnya), dalam satuan model sebelum diskalakan
    var WAJAH = {
      z: 0.645, cx: 0.013, mataX: 0.16, mataY: 0.034, mataL: 0.22, mataT: 0.30,
      mulutY: -0.222, mulutL: 0.20, mulutT: 0.12,
      tambalMataL: 0.31, tambalMataT: 0.40, tambalMulutL: 0.33, tambalMulutT: 0.21
    };
    var BOBOT_DALAM = 0.58, BOBOT_LUAR = 0.88;   // batas tekukan tangan
    var KAKI_ATAS = -0.62, KAKI_BAWAH = -0.92;   // batas tekukan kaki

    new THREE.GLTFLoader().load('assets/pixi-v2.glb', function (gltf) {
      var m = gltf.scene, mesh = null;
      m.traverse(function (o) { if (o.isMesh && !mesh) mesh = o; });
      if (!mesh) return;

      var geo = mesh.geometry, pos = geo.attributes.position, i;
      var bobot = new Float32Array(pos.count), jumlahY = [0, 0], cacah = [0, 0];
      for (i = 0; i < pos.count; i++) {
        var x = pos.getX(i), t = clamp((Math.abs(x) - BOBOT_DALAM) / (BOBOT_LUAR - BOBOT_DALAM), 0, 1);
        bobot[i] = t * t * (3 - 2 * t);
        if (bobot[i] > 0) { var s = x < 0 ? 0 : 1; jumlahY[s] += pos.getY(i); cacah[s]++; }
      }
      geo.setAttribute('aBobot', new THREE.BufferAttribute(bobot, 1));
      var bobotKaki = new Float32Array(pos.count), jumlahX = [0, 0], cacahK = [0, 0];
      for (i = 0; i < pos.count; i++) {
        var y = pos.getY(i), tk = clamp((KAKI_ATAS - y) / (KAKI_ATAS - KAKI_BAWAH), 0, 1);
        bobotKaki[i] = tk * tk * (3 - 2 * tk);
        if (bobotKaki[i] > 0) { var sk = pos.getX(i) < 0 ? 0 : 1; jumlahX[sk] += pos.getX(i); cacahK[sk]++; }
      }
      geo.setAttribute('aBobotKaki', new THREE.BufferAttribute(bobotKaki, 1));

      var seragam = {
        uKiri: { value: 0 }, uKanan: { value: 0 },
        uBahuKiri: { value: new THREE.Vector3(-BOBOT_DALAM, cacah[0] ? jumlahY[0] / cacah[0] : 0, 0) },
        uBahuKanan: { value: new THREE.Vector3(BOBOT_DALAM, cacah[1] ? jumlahY[1] / cacah[1] : 0, 0) },
        uKakiKiri: { value: 0 }, uKakiKanan: { value: 0 },
        uPinggulKiri: { value: new THREE.Vector3(cacahK[0] ? jumlahX[0] / cacahK[0] : -0.22, KAKI_ATAS, 0) },
        uPinggulKanan: { value: new THREE.Vector3(cacahK[1] ? jumlahX[1] / cacahK[1] : 0.22, KAKI_ATAS, 0) }
      };
      mesh.material.onBeforeCompile = function (shader) {
        Object.assign(shader.uniforms, seragam);
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', [
            '#include <common>',
            'attribute float aBobot; attribute float aBobotKaki;',
            'uniform float uKiri; uniform float uKanan;',
            'uniform vec3 uBahuKiri; uniform vec3 uBahuKanan;',
            'uniform float uKakiKiri; uniform float uKakiKanan;',
            'uniform vec3 uPinggulKiri; uniform vec3 uPinggulKanan;',
            'vec3 ayunZ(vec3 p, vec3 pv, float a){ vec3 d = p - pv; float c = cos(a), s = sin(a);',
            '  return vec3(d.x*c - d.y*s, d.x*s + d.y*c, d.z) + pv; }',
            'vec3 ayunX(vec3 p, vec3 pv, float a){ vec3 d = p - pv; float c = cos(a), s = sin(a);',
            '  return vec3(d.x, d.y*c - d.z*s, d.y*s + d.z*c) + pv; }'
          ].join('\n'))
          .replace('#include <beginnormal_vertex>', [
            '#include <beginnormal_vertex>',
            '{ float at = (position.x < 0.0 ? uKiri : uKanan) * aBobot;',
            '  float ak = (position.x < 0.0 ? uKakiKiri : uKakiKanan) * aBobotKaki;',
            '  objectNormal = ayunZ(objectNormal, vec3(0.0), at);',
            '  objectNormal = ayunX(objectNormal, vec3(0.0), ak); }'
          ].join('\n'))
          .replace('#include <begin_vertex>', [
            '#include <begin_vertex>',
            '{ float at = (position.x < 0.0 ? uKiri : uKanan) * aBobot;',
            '  float ak = (position.x < 0.0 ? uKakiKiri : uKakiKanan) * aBobotKaki;',
            '  transformed = ayunZ(transformed, position.x < 0.0 ? uBahuKiri : uBahuKanan, at);',
            '  transformed = ayunX(transformed, position.x < 0.0 ? uPinggulKiri : uPinggulKanan, ak); }'
          ].join('\n'));
      };
      mesh.material.customProgramCacheKey = function () { return 'pixi-lentur'; };
      mesh.material.needsUpdate = true;
      var lentur = function (tKiri, tKanan, kKiri, kKanan) {
        seragam.uKiri.value = tKiri; seragam.uKanan.value = tKanan;
        seragam.uKakiKiri.value = kKiri || 0; seragam.uKakiKanan.value = kKanan || 0;
      };

      // Wajah: tambalan putih menutup wajah bawaan, lalu mata & mulut yang bisa bergerak
      var mataKiri = null, mataKanan = null, mulutM = null;
      if (THREE.DecalGeometry) {
        var stiker = function (cx2, cy2, w, h, tekstur, urutan) {
          var g = new THREE.DecalGeometry(mesh, new THREE.Vector3(cx2, cy2, WAJAH.z), new THREE.Euler(0, 0, 0), new THREE.Vector3(w, h, 0.6));
          g.translate(-cx2, -cy2, -WAJAH.z);
          var me = new THREE.Mesh(g, bahanStiker(tekstur, urutan));
          me.position.set(cx2, cy2, WAJAH.z); me.renderOrder = urutan; m.add(me); return me;
        };
        var kiriX = WAJAH.cx - WAJAH.mataX, kananX = WAJAH.cx + WAJAH.mataX, tp = tambalPutih();
        stiker(kiriX, WAJAH.mataY, WAJAH.tambalMataL, WAJAH.tambalMataT, tp, 1);
        stiker(kananX, WAJAH.mataY, WAJAH.tambalMataL, WAJAH.tambalMataT, tp, 1);
        stiker(WAJAH.cx, WAJAH.mulutY, WAJAH.tambalMulutL, WAJAH.tambalMulutT, tp, 1);
        var tm = teksMata();
        mataKiri = stiker(kiriX, WAJAH.mataY, WAJAH.mataL, WAJAH.mataT, tm, 2);
        mataKanan = stiker(kananX, WAJAH.mataY, WAJAH.mataL, WAJAH.mataT, tm, 2);
        mulutM = stiker(WAJAH.cx, WAJAH.mulutY, WAJAH.mulutL, WAJAH.mulutT, teksMulut(), 2);
      }

      // Skala & letak
      m.updateMatrixWorld(true);
      var kotak = new THREE.Box3().setFromObject(m);
      var ukuran = kotak.getSize(new THREE.Vector3()), tengah = kotak.getCenter(new THREE.Vector3());
      var sk2 = 3.2 / ukuran.y;
      m.scale.setScalar(sk2);
      m.position.set(-tengah.x * sk2, -1.6 - kotak.min.y * sk2, -tengah.z * sk2);
      m.traverse(function (o) { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && o.material.map) o.material.envMapIntensity = 0.3; });

      glbG = new THREE.Group(); glbG.position.y = 0.28; glbG.add(m);
      P = { lentur: lentur, mataL: mataKiri, mataR: mataKanan, mulutM: mulutM, dasar: { L: [WAJAH.cx - WAJAH.mataX, WAJAH.mataY], R: [WAJAH.cx + WAJAH.mataX, WAJAH.mataY] } };
      pixi.add(glbG);
      root.classList.add('live');
      resize();
      if (mode === 'hero') { keadaan = 'wave'; mulaiKeadaan = 0; waveSampai = 2.4; say(lines[0]); }
      start();
    });

    // ---- Keadaan animasi ----
    var keadaan = 'idle', mulaiKeadaan = 0, waveSampai = 0;
    var kursor = { x: 0, y: 0 }, kedipBerikut = 2, kedipMulai = -1, lastPtr = -1e9;
    var v = { naik: 0, miring: 0, condong: 0, tanganA: 0, tanganB: 0, mataY: 1, lirikX: 0, lirikY: 0, putarBadan: 0, mulutS: 0.8 };
    var halus = function (k, target, laju, dt) { v[k] += (target - v[k]) * (1 - Math.exp(-dt * laju)); };
    var BATAS_PUTAR = 1.22, BATAS_TENGOK = 0.32;
    var seret = null, ekstra = 0, tengok = 0;
    var st = { p: 0, step: -1 };

    var bubble = mode === 'hero' ? document.getElementById('pixi-bubble') : null;
    var sapaBtn = mode === 'hero' ? document.getElementById('pixi-sapa') : null;
    var lines = ['Halo! Aku Pixi.', 'Yuk bikin game bareng!', 'Klik aku lagi, aku bisa lompat.', 'Geser aku untuk berputar.', 'Siapa mau jadi Future Maker?'];
    var lineIdx = 0;
    function say(text) {
      if (!bubble) return;
      bubble.textContent = text; bubble.classList.add('pop');
      setTimeout(function () { bubble.classList.remove('pop'); }, 220);
    }
    function setKeadaan(k) { keadaan = k; mulaiKeadaan = clockT; }
    function jump() {
      if (keadaan === 'happy' && clockT - mulaiKeadaan < 2) return;
      lineIdx = (lineIdx + 1) % lines.length; say(lines[lineIdx]); setKeadaan('happy');
    }
    function greet() { setKeadaan('wave'); waveSampai = clockT + 2.2; say(lines[0]); }

    if (mode === 'hero') {
      window.addEventListener('pointermove', function (e) {
        if (reduced) return;
        lastPtr = performance.now();
        kursor.x = e.clientX / innerWidth * 2 - 1; kursor.y = e.clientY / innerHeight * 2 - 1;
        if (!seret) return;
        var dx = e.clientX - seret.x, dy = e.clientY - seret.y;
        seret.jauh = Math.max(seret.jauh, Math.abs(dx) + Math.abs(dy));
        ekstra = clamp(seret.e0 + dx * 0.012, -BATAS_PUTAR, BATAS_PUTAR);
        tengok = clamp(seret.t0 + dy * 0.006, -BATAS_TENGOK, BATAS_TENGOK);
      }, { passive: true });
      canvas.style.touchAction = 'pan-y';
      canvas.addEventListener('pointerdown', function (e) {
        seret = { x: e.clientX, y: e.clientY, e0: ekstra, t0: tengok, jauh: 0, mulai: performance.now() };
        canvas.setPointerCapture(e.pointerId);
      });
      var lepas = function () {
        if (seret && seret.jauh < 8 && performance.now() - seret.mulai < 500) jump();
        seret = null;
      };
      canvas.addEventListener('pointerup', lepas);
      canvas.addEventListener('pointercancel', lepas);
      if (sapaBtn) sapaBtn.addEventListener('click', greet);
    } else {
      var section = root.closest('.story'), track = root.closest('.story-track');
      var copyEls = section.querySelectorAll('.story-step'), dots = section.querySelectorAll('.story-dots button');
      var onScroll = function () {
        var r = track.getBoundingClientRect(), total = r.height - innerHeight;
        st.p = clamp(-r.top / total, 0, 1);
        var step = Math.min(3, Math.floor(st.p * 4 * 0.9999));
        if (step !== st.step) {
          st.step = step; section.dataset.step = String(step);
          copyEls.forEach(function (el, k) { el.classList.toggle('on', k === step); });
          dots.forEach(function (d, k) { d.setAttribute('aria-current', k === step ? 'true' : 'false'); });
        }
        section.style.setProperty('--p', st.p.toFixed(4));
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
      dots.forEach(function (d, k) {
        d.addEventListener('click', function () {
          var r = track.getBoundingClientRect(), total = r.height - innerHeight;
          window.scrollTo({ top: window.scrollY + r.top + total * ((k + 0.5) / 4), behavior: 'smooth' });
        });
      });
      section.classList.add('is-live');
    }

    // ---- Ukuran: Pixi pas di dalam kotaknya, dengan ruang untuk lompatan ----
    function resize() {
      var w = Math.max(1, root.clientWidth), h = Math.max(1, root.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      var jarakTinggi = (4.5 / 2) / t, jarakLebar = (3.9 / 2) / (t * camera.aspect);
      camera.position.set(0, 0.5, Math.max(jarakTinggi, jarakLebar));
      camera.lookAt(0, 0.5, 0);
      camera.updateProjectionMatrix();
      if (glbG && !rafId) { pose(0, 0.016); renderer.render(scene, camera); }
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(root);
    window.addEventListener('resize', resize);

    // ---- Pose per frame ----
    var clockT = 0, rafId = 0, lastNow = 0;
    function pose(t, dt) {
      var stt = t - mulaiKeadaan;
      var naik = Math.sin(t * 2) * 0.04, miring = 0, condong = 0, tA = 0, tB = 0, mataY = 1, lx = 0, ly = 0;
      var putarT = 0, mulutT = 0.8, tgk = 0;

      if (mode === 'hero') {
        if (keadaan === 'wave' && t > waveSampai) setKeadaan('idle');
        if (keadaan === 'happy' && stt > 2.1) setKeadaan('idle');
        if (!reduced && keadaan === 'idle' && t > nextWave) { greet(); nextWave = t + 10 + Math.random() * 4; }
        if (keadaan === 'wave') { tA = 2.7 + Math.sin(stt * 10) * 0.35; miring = 0.06; }
        else if (keadaan === 'happy') { naik = Math.abs(Math.sin(stt * 7)) * 0.55 * Math.max(0, 1 - stt / 2); tA = 2.9; tB = -2.9; mataY = 0.55; mulutT = 1.2; }
        // kursor diam atau layar sentuh: mata melirik pelan-pelan sendiri
        if (!reduced && performance.now() - lastPtr > 3000) { kursor.x = Math.sin(t * 0.45) * 0.5; kursor.y = Math.sin(t * 0.3) * 0.2; }
        putarT = kursor.x * 0.3 + Math.sin(t * 0.7) * 0.1;
      } else {
        // ---- mode story: pose per pertemuan, dihaluskan ----
        var s = clamp(st.p, 0, 0.9999) * 4, i = Math.floor(s), f = s - i;
        if (i === 0) { tA = 2.7 + Math.sin(t * 10) * 0.35; miring = 0.06; putarT = -0.35 + f * 0.2; lx = -0.4; }
        else if (i === 1) { naik = Math.abs(Math.sin(f * Math.PI * 2)) * 0.45; tA = 2.9; tB = -2.9; mataY = 0.7; mulutT = 1.1; putarT = Math.sin(f * Math.PI * 2) * 0.95; }
        else if (i === 2) { tA = 1.6 + Math.sin(t * 4) * 0.06; putarT = 0.8; lx = 0.7; condong = 0.05; }
        else { naik = Math.abs(Math.sin(t * 6.5)) * 0.4; tA = 2.9; tB = -2.9; mataY = 0.55; mulutT = 1.2; putarT = Math.sin(t * 1.4) * 0.3; }
      }

      halus('naik', naik, 14, dt); halus('miring', miring, 8, dt); halus('condong', condong, 8, dt);
      halus('tanganA', tA, 10, dt); halus('tanganB', tB, 10, dt); halus('mataY', mataY, 14, dt);
      halus('lirikX', lx, 8, dt); halus('lirikY', ly, 8, dt); halus('putarBadan', putarT, mode === 'story' ? 6 : 4, dt);
      halus('mulutS', mulutT, 22, dt);
      if (!seret) { ekstra += (0 - ekstra) * (1 - Math.exp(-dt * 1.6)); tengok += (0 - tengok) * (1 - Math.exp(-dt * 1.6)); }

      pixi.position.y = v.naik;
      pixi.scale.set(1 + Math.sin(t * 2) * 0.01, 1 - Math.sin(t * 2) * 0.012, 1 + Math.sin(t * 2) * 0.01);
      bayangan.scale.setScalar(1 - v.naik * 0.35);

      if (glbG) {
        var ky = mode === 'hero' ? kursor.y * 0.12 : 0;
        glbG.rotation.set(ky + v.condong + tengok, clamp(v.putarBadan + ekstra, -BATAS_PUTAR, BATAS_PUTAR), v.miring);
        if (P) {
          var ayunLebar = 0.1, ayunCepat = 1.3, langkahLebar = 0.07, langkahCepat = 1.5;
          if (keadaan === 'happy' && mode === 'hero') { ayunLebar = 0.25; ayunCepat = 6.5; langkahLebar = 0.3; langkahCepat = 7; }
          else if (keadaan === 'wave' && mode === 'hero') { ayunLebar = 0.12; ayunCepat = 5; langkahLebar = 0.18; langkahCepat = 4; }
          else if (mode === 'story' && st.step >= 1 && st.step !== 2) { ayunLebar = 0.22; ayunCepat = 6; langkahLebar = 0.25; langkahCepat = 6.5; }
          if (reduced) { ayunLebar = 0; langkahLebar = 0; }
          var ayun = Math.sin(t * ayunCepat) * ayunLebar;
          var tKanan = v.tanganA + ayun, tKiri = v.tanganB - ayun;
          var langkah = Math.sin(t * langkahCepat) * langkahLebar;
          P.lentur(tKiri, tKanan, -langkah, langkah);

          if (!reduced && t > kedipBerikut) { kedipMulai = t; kedipBerikut = t + 2.5 + Math.random() * 3; }
          var k = (t - kedipMulai) / 0.16;
          var kedip = (k >= 0 && k < 1) ? 1 - 0.92 * Math.sin(k * Math.PI) : 1;
          if (P.mataL) {
            [['mataL', 'L'], ['mataR', 'R']].forEach(function (pr) {
              var e = P[pr[0]], d = P.dasar[pr[1]];
              e.position.x = d[0] + kursor.x * 0.004 * (mode === 'hero' ? 1 : 0) + v.lirikX * 0.07;
              e.position.y = d[1] - kursor.y * 0.003 * (mode === 'hero' ? 1 : 0) + v.lirikY * 0.06;
              e.scale.y = Math.max(0.06, v.mataY * kedip);
              e.scale.x = 1 + (v.mataY - 1) * 0.3;
            });
            P.mulutM.scale.y = v.mulutS / 0.8;
          }
        }
      }
    }
    var nextWave = 9;

    function frame(now) {
      rafId = requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - lastNow) / 1000 || 0.016);
      lastNow = now; clockT += dt;
      pose(clockT, dt);
      renderer.render(scene, camera);
    }
    function start() { if (rafId) return; lastNow = performance.now(); rafId = requestAnimationFrame(frame); }
    function stop() { cancelAnimationFrame(rafId); rafId = 0; }

    // hemat baterai: berhenti saat tersembunyi atau di luar layar
    var visible = true;
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (!glbG) return;
      if (visible && !document.hidden) start(); else stop();
    }, { rootMargin: '120px' }).observe(root);
    document.addEventListener('visibilitychange', function () {
      if (!glbG) return;
      if (document.hidden) stop(); else if (visible) start();
    });

    // untuk pengujian: tambahkan #debug di URL
    if (location.hash === '#debug') {
      (window.__pixi = window.__pixi || {})[mode] = {
        jump: jump, greet: greet, stop: stop, start: start, st: st,
        still: function (state) {
          stop(); keadaan = state || 'wave'; mulaiKeadaan = 0; waveSampai = 999; kursor.x = kursor.y = 0; lastPtr = performance.now() + 1e9;
          for (var i = 0; i < 60; i++) pose(0.5 + i * 0.016, 0.016);
          renderer.render(scene, camera);
        },
        size: function (w, h) { renderer.setPixelRatio(1); renderer.setSize(w, h, false); camera.aspect = w / h; var t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); camera.position.set(0, 0.5, Math.max((4.5 / 2) / t, (3.9 / 2) / (t * camera.aspect))); camera.updateProjectionMatrix(); },
        snap: function (type, q) { return canvas.toDataURL(type || 'image/webp', q || 0.9); },
        canvas: canvas,
        arms: function (a, b) { stop(); P.lentur(a, b, 0, 0); renderer.render(scene, camera); }
      };
    }
  }
})();
