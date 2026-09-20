/* ===========================================================================
 *  analytics.js — Meta Pixel + PostHog
 *
 *  KENAPA FILE TERPISAH, BUKAN INLINE DI index.html?
 *  Selama ada <script> inline di halaman, CSP harus memuat 'unsafe-inline'
 *  pada script-src — dan itu mematikan sebagian besar manfaat CSP, karena
 *  skrip apa pun yang berhasil disuntikkan ke HTML akan tetap dijalankan
 *  browser. Dengan semua skrip dipindah ke file ber-origin sendiri,
 *  script-src cukup 'self' + daftar domain, dan skrip suntikan ditolak.
 *
 *  ATURAN: jangan pernah menambah <script> inline baru di index.html.
 *  Kalau perlu skrip lain, tambahkan di file ini atau buat file .js baru.
 *
 *  Meta Pixel ID TIDAK ditulis di sini. Nilainya diambil dari atribut
 *  data-pixel-id pada tag <script> yang memuat file ini, yang diisi CRA saat
 *  build dari frontend/.env (REACT_APP_META_PIXEL_ID). File di folder public/
 *  disalin apa adanya tanpa substitusi, jadi atribut itulah jembatannya —
 *  satu tempat pengaturan tetap di .env, seperti sebelumnya.
 * ======================================================================== */

(function () {
  "use strict";

  // document.currentScript hanya valid selama skrip ini dieksekusi, jadi
  // dibaca lebih dulu sebelum apa pun yang asinkron.
  var self = document.currentScript;

  /* ---------------------------------------------------------------------
   * 1. Peredam DataCloneError
   *    PostHog session recording kadang mencoba menyalin objek
   *    PerformanceServerTiming yang tidak bisa di-clone. Error itu tidak
   *    berpengaruh apa pun ke halaman, tapi mengotori console dan memicu
   *    error reporting. Didaftarkan paling awal supaya sudah aktif sebelum
   *    PostHog dimuat.
   * ------------------------------------------------------------------- */
  window.addEventListener(
    "error",
    function (e) {
      if (
        e.error instanceof DOMException &&
        e.error.name === "DataCloneError" &&
        e.message &&
        e.message.includes("PerformanceServerTiming")
      ) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true,
  );

  /* ---------------------------------------------------------------------
   * 2. Meta Pixel
   * ------------------------------------------------------------------- */
  var pixelId = (self && self.getAttribute("data-pixel-id")) || "";
  window.META_PIXEL_ID = pixelId;

  // Kalau env belum diisi, placeholder-nya tidak tergantikan saat build.
  if (!/^[0-9]+$/.test(pixelId)) {
    console.warn(
      "[Meta Pixel] REACT_APP_META_PIXEL_ID belum diisi — pixel tidak dijalankan.",
    );
  } else if (!window.__metaPixelLoaded) {
    // Jaga-jaga kalau file ini ikut termuat dua kali:
    // init + PageView hanya boleh sekali per pemuatan halaman.
    window.__metaPixelLoaded = true;

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js",
    );

    fbq("init", pixelId);
    fbq("track", "PageView");
  }

  /* ---------------------------------------------------------------------
   * 3. PostHog
   *    Kunci phc_... adalah project API key publik — memang dirancang untuk
   *    dikirim ke browser, bukan rahasia.
   * ------------------------------------------------------------------- */
  !(function (t, e) {
    var o, n, p, r;
    e.__SV ||
      ((window.posthog = e),
      (e._i = []),
      (e.init = function (i, s, a) {
        function g(t, e) {
          var o = e.split(".");
          2 == o.length && ((t = t[o[0]]), (e = o[1])),
            (t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            });
        }
        ((p = t.createElement("script")).type = "text/javascript"),
          (p.crossOrigin = "anonymous"),
          (p.async = !0),
          (p.src =
            s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") +
            "/static/array.js"),
          (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(
            p,
            r,
          );
        var u = e;
        for (
          void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
            u.people = u.people || [],
            u.toString = function (t) {
              var e = "posthog";
              return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
            },
            u.people.toString = function () {
              return u.toString(1) + ".people (stub)";
            },
            o =
              "init me ws ys ps bs capture je Di ks register register_once register_for_session unregister unregister_for_session Ps getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Es $s createPersonProfile Is opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing Ss debug xs getPageViewId captureTraceFeedback captureTraceMetric".split(
                " ",
              ),
            n = 0;
          n < o.length;
          n++
        )
          g(u, o[n]);
        e._i.push([i, s, a]);
      }),
      (e.__SV = 1));
  })(document, window.posthog || []);

  posthog.init("phc_xAvL2Iq4tFmANRE7kzbKwaSqp1HJjN7x48s3vr0CMjs", {
    api_host: "https://us.i.posthog.com",
    person_profiles: "identified_only",
    session_recording: {
      // Dimatikan (dulu true). Opsi ini membuat PostHog ikut merekam ISI
      // iframe dari domain lain. Situs ini tidak punya iframe lintas-domain
      // (game di /projects/ same-origin), jadi opsi ini tidak memberi manfaat
      // apa pun — yang tersisa hanya risikonya: begitu suatu hari ada widget
      // pihak ketiga yang di-embed, isinya ikut terekam tanpa disadari.
      recordCrossOriginIframes: false,
      capturePerformance: false,
      // Jangan pernah kirim isi input ke PostHog. Halaman /contact punya field
      // nama/email/pesan; maskAllInputs memastikan yang terekam hanya bentuk
      // halamannya, bukan yang diketik.
      maskAllInputs: true,
    },
  });
})();
