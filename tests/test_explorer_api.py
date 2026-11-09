"""Tes API pendaftar Kelas Explorer. Jalankan: python -m unittest tests.test_explorer_api -v"""
import base64
import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.parse
import urllib.request
from datetime import date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
import explorer_api as api  # noqa: E402

SANDI = "sandi-uji-123"


def minta(port, metode, jalur, isi=None, auth=None, header=None):
    h = {"Content-Type": "application/json"}
    if auth is not None:
        h["Authorization"] = "Basic " + base64.b64encode(f"{auth[0]}:{auth[1]}".encode()).decode()
    h.update(header or {})
    data = json.dumps(isi).encode() if isi is not None else None
    req = urllib.request.Request(f"http://127.0.0.1:{port}{jalur}", data=data, method=metode, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read().decode()), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode()), dict(e.headers)


def contoh(**ubah):
    d = {
        "nama_anak": "Aisyah Putri",
        "usia_anak": 9,
        "nama_ortu": "Budi Santoso",
        "wa": "0812 3456 7890",
        "harga": 599000,
        "tanggal": date.today().isoformat(),
        "catatan": "",
        "idem": "idem-0000-0001",
    }
    d.update(ubah)
    return d


class TesApi(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.hash = api.buat_hash(SANDI, 1000)
        self.server, self.db = api.buat_server(
            os.path.join(self.tmp.name, "uji.db"), "127.0.0.1", 0, "admin", self.hash
        )
        self.port = self.server.server_address[1]
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.admin = ("admin", SANDI)

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.tmp.cleanup()

    def kirim(self, **ubah):
        return minta(self.port, "POST", "/api/explorer/admin/pendaftar", contoh(**ubah), self.admin)

    # -- login --
    def test_tanpa_login_ditolak(self):
        s, b, h = minta(self.port, "POST", "/api/explorer/admin/pendaftar", contoh())
        self.assertEqual(s, 401)
        # Tanpa tantangan Basic, peramban tidak memunculkan kotak login bawaan.
        self.assertNotIn("WWW-Authenticate", h)
        self.assertEqual(self.db.hitung(), 0)

    def test_sandi_salah_ditolak(self):
        s, _, _ = minta(self.port, "GET", "/api/explorer/admin/sesi", auth=("admin", "salah"))
        self.assertEqual(s, 401)

    def test_login_benar(self):
        s, b, _ = minta(self.port, "GET", "/api/explorer/admin/sesi", auth=self.admin)
        self.assertEqual((s, b["terisi"], b["kuota"]), (200, 0, 10))

    def test_terlalu_banyak_login_salah_diblokir(self):
        for _ in range(8):
            minta(self.port, "GET", "/api/explorer/admin/sesi", auth=("admin", "salah"))
        s, _, _ = minta(self.port, "GET", "/api/explorer/admin/sesi", auth=self.admin)
        self.assertEqual(s, 429)

    # -- simpan --
    def test_simpan_dan_baca_ulang_dari_database(self):
        s, b, _ = self.kirim()
        self.assertEqual(s, 201)
        self.assertTrue(b["tersimpan_di_database"])
        p = b["pendaftar"]
        self.assertRegex(p["kode"], r"^EXP-[A-Z2-9]{8}$")
        self.assertRegex(p["nomor"], r"^FM-EX/\d{4}/\d{2}/001$")
        self.assertEqual((p["status"], p["metode"], p["dibayar"], p["harga"]), ("lunas", "lunas", 599000, 599000))
        langsung = self.db.baca(p["kode"])
        self.assertEqual(langsung["nama_anak"], "Aisyah Putri")
        self.assertEqual(b["terisi"], 1)

    def test_nomor_invoice_berurutan(self):
        a = self.kirim(idem="idem-0000-000a")[1]["pendaftar"]["nomor"]
        b = self.kirim(idem="idem-0000-000b")[1]["pendaftar"]["nomor"]
        self.assertTrue(a.endswith("/001") and b.endswith("/002"))

    def test_kiriman_ganda_tidak_menggandakan(self):
        s1, b1, _ = self.kirim()
        s2, b2, _ = self.kirim()
        self.assertEqual((s1, s2), (201, 200))
        self.assertFalse(b2["baru"])
        self.assertEqual(b1["pendaftar"]["kode"], b2["pendaftar"]["kode"])
        self.assertEqual(self.db.hitung(), 1)

    def test_validasi(self):
        for ubah, kata in [
            ({"nama_anak": " "}, "Nama anak"),
            ({"nama_ortu": ""}, "orang tua"),
            ({"usia_anak": 6}, "7"),
            ({"usia_anak": 16}, "15"),
            ({"usia_anak": "abc"}, "Usia"),
            ({"harga": 0}, "Harga"),
            ({"wa": "abc"}, "WhatsApp"),
            ({"tanggal": "bukan-tanggal"}, "Tanggal"),
            ({"idem": "x"}, "Penanda"),
        ]:
            with self.subTest(ubah=ubah):
                s, b, _ = self.kirim(**ubah)
                self.assertEqual(s, 400, b)
                self.assertIn(kata, b["pesan"])
        self.assertEqual(self.db.hitung(), 0)

    def test_kuota_penuh_lalu_diizinkan(self):
        for i in range(10):
            self.assertEqual(self.kirim(idem=f"idem-aaaa-{i:04d}")[0], 201)
        s, b, _ = self.kirim(idem="idem-aaaa-9999")
        self.assertEqual((s, b["kode"]), (409, "kuota_penuh"))
        s, b, _ = minta(
            self.port, "POST", "/api/explorer/admin/pendaftar",
            contoh(idem="idem-aaaa-9999", izinkan_lebih=True), self.admin,
        )
        self.assertEqual(s, 201)
        self.assertEqual(self.db.hitung(), 11)

    def test_data_tidak_valid_json(self):
        req = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/api/explorer/admin/pendaftar", data=b"{rusak", method="POST",
            headers={
                "Authorization": "Basic " + base64.b64encode(f"admin:{SANDI}".encode()).decode(),
                "Content-Type": "application/json",
            },
        )
        with self.assertRaises(urllib.error.HTTPError) as k:
            urllib.request.urlopen(req)
        self.assertEqual(k.exception.code, 400)

    # -- baca publik --
    def test_baca_publik_menyamarkan_wa(self):
        kode = self.kirim()[1]["pendaftar"]["kode"]
        s, b, _ = minta(self.port, "GET", f"/api/explorer/pendaftar/{kode}")
        self.assertEqual(s, 200)
        p = b["pendaftar"]
        self.assertEqual(p["nama_anak"], "Aisyah Putri")
        self.assertNotIn("34567", p["wa"])
        self.assertTrue(p["wa"].startswith("0812") and p["wa"].endswith("890"))

    def test_kode_huruf_kecil_tetap_terbaca(self):
        kode = self.kirim()[1]["pendaftar"]["kode"]
        self.assertEqual(minta(self.port, "GET", f"/api/explorer/pendaftar/{kode.lower()}")[0], 200)

    def test_kode_salah_atau_tidak_ada(self):
        for kode in ["EXP-AAAAAAAA", "EXP-1", "abc", "EXP-AAAAAAAA' OR 1=1--"]:
            with self.subTest(kode=kode):
                self.assertEqual(minta(self.port, "GET", f"/api/explorer/pendaftar/{urllib.parse.quote(kode)}")[0], 404)

    def test_daftar_hanya_untuk_admin(self):
        self.kirim()
        self.assertEqual(minta(self.port, "GET", "/api/explorer/admin/pendaftar")[0], 401)
        s, b, _ = minta(self.port, "GET", "/api/explorer/admin/pendaftar", auth=self.admin)
        self.assertEqual((s, len(b["daftar"]), b["daftar"][0]["wa"]), (200, 1, "0812 3456 7890"))


    # -- login lewat cookie sesi --
    def masuk(self, pengguna="admin", sandi=SANDI, header=None):
        return minta(self.port, "POST", "/api/explorer/admin/masuk", {"pengguna": pengguna, "sandi": sandi}, header=header)

    def cookie_dari(self, h):
        return h["Set-Cookie"].split(";")[0]

    def test_masuk_benar_memberi_cookie_aman(self):
        s, b, h = self.masuk()
        self.assertEqual((s, b["ok"]), (200, True))
        sc = h["Set-Cookie"]
        self.assertTrue(sc.startswith("fmvd_sesi="))
        for harus in ("HttpOnly", "SameSite=Strict", "Path=/api/explorer", "Max-Age=43200"):
            self.assertIn(harus, sc)
        self.assertNotIn("Secure", sc)

    def test_cookie_secure_di_belakang_https(self):
        _, _, h = self.masuk(header={"X-Forwarded-Proto": "https"})
        self.assertIn("Secure", h["Set-Cookie"])

    def test_cookie_membuka_akses_admin(self):
        _, _, h = self.masuk()
        c = {"Cookie": self.cookie_dari(h)}
        s, b, _ = minta(self.port, "GET", "/api/explorer/admin/sesi", header=c)
        self.assertEqual((s, b["kuota"]), (200, 10))
        s, b, _ = minta(self.port, "POST", "/api/explorer/admin/pendaftar", contoh(), header=c)
        self.assertEqual(s, 201)

    def test_masuk_salah_tanpa_cookie(self):
        for pengguna, sandi in [("admin", "salah"), ("bukan-admin", SANDI), ("", "")]:
            with self.subTest(pengguna=pengguna):
                s, b, h = self.masuk(pengguna, sandi)
                self.assertEqual((s, b["kode"]), (401, "login_salah"))
                self.assertNotIn("Set-Cookie", h)
                self.assertNotIn("WWW-Authenticate", h)

    def test_cookie_palsu_ditolak(self):
        for nilai in ["fmvd_sesi=abc", "fmvd_sesi=", "fmvd_sesi=YWRtaW58OTk5OTk5OTk5OQ.0000", "lain=1"]:
            with self.subTest(nilai=nilai):
                s, _, _ = minta(self.port, "GET", "/api/explorer/admin/sesi", header={"Cookie": nilai})
                self.assertEqual(s, 401)

    def test_cookie_kedaluwarsa_atau_pengguna_lain_ditolak(self):
        rahasia = api.rahasia_sesi(self.hash)
        lama = api.buat_token_sesi(rahasia, "admin", 1000)
        lain = api.buat_token_sesi(rahasia, "orang-lain", 9999999999)
        asing = api.buat_token_sesi(api.rahasia_sesi("hash-lain"), "admin", 9999999999)
        for token in (lama, lain, asing):
            with self.subTest(token=token[:12]):
                s, _, _ = minta(self.port, "GET", "/api/explorer/admin/sesi", header={"Cookie": f"fmvd_sesi={token}"})
                self.assertEqual(s, 401)
        sah = api.buat_token_sesi(rahasia, "admin", 9999999999)
        self.assertEqual(minta(self.port, "GET", "/api/explorer/admin/sesi", header={"Cookie": f"fmvd_sesi={sah}"})[0], 200)

    def test_keluar_menghapus_cookie(self):
        s, b, h = minta(self.port, "POST", "/api/explorer/admin/keluar", {})
        self.assertEqual(s, 200)
        self.assertIn("Max-Age=0", h["Set-Cookie"])

    def test_post_lintas_situs_ditolak(self):
        s, b, _ = self.masuk(header={"Origin": "https://jahat.example"})
        self.assertEqual((s, b["kode"]), (403, "asal_salah"))
        _, _, h = self.masuk()
        c = {"Cookie": self.cookie_dari(h), "Origin": "https://jahat.example"}
        s, _, _ = minta(self.port, "POST", "/api/explorer/admin/pendaftar", contoh(), header=c)
        self.assertEqual(s, 403)
        self.assertEqual(self.db.hitung(), 0)

    def test_origin_sama_diterima(self):
        s, _, _ = self.masuk(header={"Origin": f"http://127.0.0.1:{self.port}"})
        self.assertEqual(s, 200)

    def test_login_salah_berulang_diblokir(self):
        for _ in range(8):
            self.masuk("admin", "salah")
        s, b, _ = self.masuk()
        self.assertEqual((s, b["kode"]), (429, "terlalu_sering"))

    def test_mengganti_sandi_mematikan_sesi_lama(self):
        _, _, h = self.masuk()
        c = {"Cookie": self.cookie_dari(h)}
        s2, _ = api.buat_server(os.path.join(self.tmp.name, "c.db"), "127.0.0.1", 0, "admin", api.buat_hash("sandi-baru", 1000))
        threading.Thread(target=s2.serve_forever, daemon=True).start()
        try:
            s, _, _ = minta(s2.server_address[1], "GET", "/api/explorer/admin/sesi", header=c)
            self.assertEqual(s, 401)
        finally:
            s2.shutdown()
            s2.server_close()

    def test_hash_sandi(self):
        h = api.buat_hash("rahasia", 1000)
        self.assertTrue(api.cocok_hash("rahasia", h))
        self.assertFalse(api.cocok_hash("salah", h))
        self.assertFalse(api.cocok_hash("rahasia", "rusak"))

    def test_login_admin_belum_disetel(self):
        s2, _ = api.buat_server(os.path.join(self.tmp.name, "b.db"), "127.0.0.1", 0, "", "")
        threading.Thread(target=s2.serve_forever, daemon=True).start()
        try:
            s, _, _ = minta(s2.server_address[1], "GET", "/api/explorer/admin/sesi", auth=self.admin)
            self.assertEqual(s, 503)
        finally:
            s2.shutdown()
            s2.server_close()


if __name__ == "__main__":
    unittest.main()
