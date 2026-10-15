/* Model Pixi 3D (pixi-v2.glb) dengan wajah yang bisa berkedip, melirik, dan membuka mulut.
   Satu bentuk utuh: tangan dan kaki ditekuk lewat shader, wajah dari stiker (decal).
   Memakai three.js r128 (skrip biasa, bukan modul).

   Pemakaian:
     PixiModel.env(renderer)            -> tekstur lingkungan studio untuk scene.environment
     PixiModel.load(function (px) {...}) -> px.root (THREE.Group), px.apply({...})
   px.apply menerima: armL, armR, legL, legR (radian), eyeY (skala tinggi mata), lookX, lookY, mouth (skala tinggi mulut)
   Kaki model berada di y = -1.32 pada px.root, tinggi sekitar 3.2 satuan. */
(function () {
  'use strict';
  if (!window.THREE || !THREE.GLTFLoader) return;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  function env(renderer) {
    var es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: 0x5a4fc8, side: THREE.BackSide })));
    var kotak = function (x, y, z, w, h, s) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(s, s, s), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m);
    };
    kotak(-8, 9, 9, 7, 5, 4); kotak(9, 4, 6, 3, 6, 2.2); kotak(0, 6, -10, 10, 3, 2);
    var pm = new THREE.PMREMGenerator(renderer);
    var tex = pm.fromScene(es, 0.03).texture;
    pm.dispose();
    return tex;
  }

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
  // Letak wajah (diukur dari modelnya), dalam satuan model sebelum diskalakan
  var WAJAH = {
    z: 0.645, cx: 0.013, mataX: 0.16, mataY: 0.034, mataL: 0.22, mataT: 0.30,
    mulutY: -0.222, mulutL: 0.20, mulutT: 0.12,
    tambalMataL: 0.31, tambalMataT: 0.40, tambalMulutL: 0.33, tambalMulutT: 0.21
  };
  var BOBOT_DALAM = 0.58, BOBOT_LUAR = 0.88;   // batas tekukan tangan
  var KAKI_ATAS = -0.62, KAKI_BAWAH = -0.92;   // batas tekukan kaki

  function load(url, cb) {
    new THREE.GLTFLoader().load(url, function (gltf) {
      var m = gltf.scene, mesh = null, i;
      m.traverse(function (o) { if (o.isMesh && !mesh) mesh = o; });
      if (!mesh) return;
      var geo = mesh.geometry, pos = geo.attributes.position;
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

      m.updateMatrixWorld(true);
      var kotak = new THREE.Box3().setFromObject(m);
      var ukuran = kotak.getSize(new THREE.Vector3()), tengah = kotak.getCenter(new THREE.Vector3());
      var sk2 = 3.2 / ukuran.y;
      m.scale.setScalar(sk2);
      m.position.set(-tengah.x * sk2, -1.6 - kotak.min.y * sk2, -tengah.z * sk2);
      m.traverse(function (o) { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && o.material.map) o.material.envMapIntensity = 0.3; });

      var inner = new THREE.Group(); inner.position.y = 0.28; inner.add(m);
      var root = new THREE.Group(); root.add(inner);
      var dasar = { L: [WAJAH.cx - WAJAH.mataX, WAJAH.mataY], R: [WAJAH.cx + WAJAH.mataX, WAJAH.mataY] };

      cb({
        root: root, feetY: -1.32, height: 3.2,
        apply: function (a) {
          seragam.uKiri.value = a.armL || 0; seragam.uKanan.value = a.armR || 0;
          seragam.uKakiKiri.value = a.legL || 0; seragam.uKakiKanan.value = a.legR || 0;
          if (mataKiri) {
            var ey = Math.max(0.06, a.eyeY === undefined ? 1 : a.eyeY);
            [[mataKiri, dasar.L], [mataKanan, dasar.R]].forEach(function (pr) {
              pr[0].position.x = pr[1][0] + (a.lookX || 0) * 0.07;
              pr[0].position.y = pr[1][1] + (a.lookY || 0) * 0.06;
              pr[0].scale.y = ey;
              pr[0].scale.x = 1 + (Math.min(1, ey) - 1) * 0.3;
            });
            mulutM.scale.y = (a.mouth === undefined ? 0.8 : a.mouth) / 0.8;
          }
        }
      });
    });
  }

  window.PixiModel = { load: function (cb) { load('assets/pixi-v2.glb', cb); }, env: env };
})();
