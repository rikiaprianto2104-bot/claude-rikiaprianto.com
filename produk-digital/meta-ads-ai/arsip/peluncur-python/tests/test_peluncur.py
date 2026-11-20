"""Uji Bot Peluncur terhadap server Graph API palsu (tanpa jaringan ke Meta).

Jalankan dari folder peluncur:  python -m unittest discover -s tests -v
"""
import io
import json
import re
import sys
import tempfile
import threading
import unittest
from contextlib import redirect_stderr, redirect_stdout
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import peluncur  # noqa: E402

PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 64


def brief_contoh(**ubah):
    b = {
        "akun_iklan_id": "123",
        "page_id": "555",
        "instagram_id": "ig1",
        "pixel_id": "px1",
        "link_tujuan": "https://contoh.com/kelas",
        "kampanye": {"nama": "Uji Kampanye", "tujuan": "traffic", "batas_belanja_total": 1000000},
        "set_iklan": [{
            "nama": "A", "anggaran_harian": 80000,
            "mulai": "2026-12-01T06:00:00+07:00", "selesai": "2026-12-10T23:45:00+07:00",
            "lokasi": {"lat": -7.8, "lng": 110.4, "radius_km": 25},
            "usia_min": 28, "usia_maks": 48, "optimasi": "OFFSITE_CONVERSIONS", "peristiwa": "CONTENT_VIEW",
        }],
        "iklan": [
            {"nama": "G1", "jenis": "gambar", "file": "g1.png", "teks_utama": "Teks", "judul": "Judul", "tombol": "LEARN_MORE"},
            {"nama": "V1", "jenis": "video", "file": "v1.mp4", "gambar_sampul": "s1.png", "teks_utama": "Teks V", "judul": "Judul V", "tombol": "SIGN_UP"},
        ],
    }
    b.update(ubah)
    return b


class Graf(BaseHTTPRequestHandler):
    catatan: list = []
    gagalkan: str | None = None

    def log_message(self, *a):
        pass

    def _balas(self, kode, isi):
        data = json.dumps(isi).encode()
        self.send_response(kode)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _kunci(self, jalur):
        return re.sub(r"^/v[\d.]+/", "", jalur)

    def do_GET(self):
        u = urlparse(self.path)
        k = self._kunci(u.path)
        Graf.catatan.append(("GET", k, parse_qs(u.query)))
        if k == "me":
            return self._balas(200, {"id": "1", "name": "Pengguna Uji"})
        if k == "act_123":
            return self._balas(200, {"name": "Akun Uji", "account_status": 1, "currency": "IDR", "timezone_name": "Asia/Jakarta"})
        if k == "555":
            return self._balas(200, {"name": "Halaman Uji"})
        if k == "act_123/instagram_accounts":
            return self._balas(200, {"data": [{"id": "ig1", "username": "uji"}]})
        if k == "act_123/adspixels":
            return self._balas(200, {"data": [{"id": "px1", "name": "Pixel Uji"}]})
        if k.startswith("vid"):
            return self._balas(200, {"status": {"video_status": "ready"}})
        return self._balas(200, {"name": k, "status": "PAUSED", "effective_status": "PAUSED"})

    def do_POST(self):
        u = urlparse(self.path)
        k = self._kunci(u.path)
        n = int(self.headers.get("Content-Length", 0))
        isi = self.rfile.read(n)
        tipe = self.headers.get("Content-Type", "")
        if tipe.startswith("multipart/form-data"):
            kolom = {"_berkas": re.findall(rb'filename="([^"]+)"', isi)[0].decode()}
            for nama, nilai in re.findall(rb'name="([^"]+)"\r\n\r\n([^\r]*)\r\n', isi):
                kolom[nama.decode()] = nilai.decode()
        else:
            kolom = {a: b[0] for a, b in parse_qs(isi.decode()).items()}
        Graf.catatan.append(("POST", k, kolom))
        if Graf.gagalkan and k.endswith(Graf.gagalkan):
            return self._balas(400, {"error": {"message": "x", "error_user_msg": "Lokasi tidak valid", "code": 100, "error_subcode": 1234}})
        if k.endswith("campaigns"):
            return self._balas(200, {"id": "camp1"})
        if k.endswith("adsets"):
            return self._balas(200, {"id": f"set{sum(1 for c in Graf.catatan if c[0] == 'POST' and c[1].endswith('adsets'))}"})
        if k.endswith("adimages"):
            return self._balas(200, {"images": {"x": {"hash": "hash_" + kolom["_berkas"]}}})
        if k.endswith("advideos"):
            return self._balas(200, {"id": "vid1"})
        if k.endswith("adcreatives"):
            return self._balas(200, {"id": f"kre{sum(1 for c in Graf.catatan if c[0] == 'POST' and c[1].endswith('adcreatives'))}"})
        if k.endswith("/ads"):
            return self._balas(200, {"id": f"ad{sum(1 for c in Graf.catatan if c[0] == 'POST' and c[1].endswith('/ads'))}"})
        return self._balas(200, {"success": True})


class UjiPeluncur(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.srv = ThreadingHTTPServer(("127.0.0.1", 0), Graf)
        cls.base = f"http://127.0.0.1:{cls.srv.server_address[1]}"
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()

    def setUp(self):
        Graf.catatan = []
        Graf.gagalkan = None
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        for n in ("g1.png", "s1.png"):
            (self.dir / n).write_bytes(PNG)
        (self.dir / "v1.mp4").write_bytes(b"\x00\x00\x00\x18ftypmp42" + b"0" * 64)
        (self.dir / ".env").write_text(f"META_TOKEN=tokenrahasia123\nMETA_BASE_URL={self.base}\n", encoding="utf-8")
        self.meta = peluncur.Meta("tokenrahasia123", "v23.0", self.base)

    def tearDown(self):
        self.tmp.cleanup()

    def jalan(self, *arg):
        out, err = io.StringIO(), io.StringIO()
        with redirect_stdout(out), redirect_stderr(err):
            kode = peluncur.main([*arg, "--folder", str(self.dir), "--ya"])
        return kode, out.getvalue(), err.getvalue()

    def tulis_brief(self, b):
        (self.dir / "brief.json").write_text(json.dumps(b), encoding="utf-8")

    # ---- validasi -------------------------------------------------------
    def test_brief_sah_tanpa_masalah(self):
        self.assertEqual(peluncur.validasi_brief(brief_contoh(), self.dir), [])

    def test_anggaran_melebihi_batas_ditolak(self):
        b = brief_contoh()
        b["kampanye"]["batas_belanja_total"] = 500000  # 80rb x 10 hari = 800rb
        m = peluncur.validasi_brief(b, self.dir)
        self.assertTrue(any("melebihi batas belanja" in x for x in m))

    def test_batas_belanja_wajib(self):
        b = brief_contoh()
        del b["kampanye"]["batas_belanja_total"]
        self.assertTrue(any("batas_belanja_total" in x for x in peluncur.validasi_brief(b, self.dir)))

    def test_kategori_khusus_ditolak(self):
        m = peluncur.validasi_brief(brief_contoh(kategori_khusus=["HOUSING"]), self.dir)
        self.assertTrue(any("tidak didukung" in x for x in m))

    def test_video_butuh_sampul_dan_berkas_harus_ada(self):
        b = brief_contoh()
        del b["iklan"][1]["gambar_sampul"]
        b["iklan"][0]["file"] = "tidak-ada.png"
        m = " ".join(peluncur.validasi_brief(b, self.dir))
        self.assertIn("gambar_sampul", m)
        self.assertIn("tidak ditemukan", m)

    def test_optimasi_konversi_butuh_pixel_dan_peristiwa(self):
        b = brief_contoh()
        b["set_iklan"][0].pop("peristiwa")
        self.assertTrue(any("OFFSITE_CONVERSIONS" in x for x in peluncur.validasi_brief(b, self.dir)))

    def test_link_harus_https(self):
        m = peluncur.validasi_brief(brief_contoh(link_tujuan="http://contoh.com"), self.dir)
        self.assertTrue(any("https" in x for x in m))

    # ---- muatan ---------------------------------------------------------
    def test_muatan_kampanye_jeda_dan_batas(self):
        p = peluncur.muatan_kampanye(brief_contoh())
        self.assertEqual(p["status"], "PAUSED")
        self.assertEqual(p["objective"], "OUTCOME_TRAFFIC")
        self.assertEqual(p["spend_cap"], 1000000)

    def test_satuan_terkecil_usd(self):
        p = peluncur.muatan_kampanye(brief_contoh(satuan_terkecil=100))
        self.assertEqual(p["spend_cap"], 100000000)

    def test_usia_saran_memakai_advantage_dan_age_range(self):
        s = brief_contoh()["set_iklan"][0]
        t = peluncur.muatan_set_iklan(brief_contoh(), s, "c1")["targeting"]
        self.assertEqual(t["targeting_automation"], {"advantage_audience": 1})
        self.assertEqual(t["age_range"], [28, 48])
        self.assertLessEqual(t["age_min"], 25)
        self.assertNotIn("age_max", t)

    def test_usia_keras_mematikan_advantage(self):
        s = {**brief_contoh()["set_iklan"][0], "usia_keras": True}
        t = peluncur.muatan_set_iklan(brief_contoh(), s, "c1")["targeting"]
        self.assertEqual(t["targeting_automation"], {"advantage_audience": 0})
        self.assertEqual((t["age_min"], t["age_max"]), (28, 48))

    def test_set_iklan_jeda_dan_pixel(self):
        p = peluncur.muatan_set_iklan(brief_contoh(), brief_contoh()["set_iklan"][0], "c1")
        self.assertEqual(p["status"], "PAUSED")
        self.assertEqual(p["promoted_object"], {"pixel_id": "px1", "custom_event_type": "CONTENT_VIEW"})
        self.assertEqual(p["daily_budget"], 80000)

    def test_link_utm_memakai_tanda_tanya_atau_dan(self):
        b = brief_contoh()
        self.assertIn("?utm_source=meta", peluncur.link_utm(b, "Iklan A"))
        self.assertIn("utm_content=iklan_a", peluncur.link_utm(b, "Iklan A"))
        b["link_tujuan"] = "https://contoh.com/x?a=1"
        self.assertIn("a=1&utm_source", peluncur.link_utm(b, "z"))

    # ---- alur lengkap terhadap server palsu --------------------------------
    def test_cek_semua_hijau(self):
        self.tulis_brief(brief_contoh())
        kode, out, _ = self.jalan("cek")
        self.assertEqual(kode, 0, out)
        self.assertIn("SIAP diluncurkan", out)
        self.assertNotIn("tokenrahasia123", out)

    def test_cek_gagal_bila_pixel_tidak_terhubung(self):
        self.tulis_brief(brief_contoh(pixel_id="salah"))
        kode, out, _ = self.jalan("cek")
        self.assertEqual(kode, 1)
        self.assertIn("Pixel tidak terhubung", out)

    def test_luncurkan_membuat_semua_dalam_keadaan_jeda(self):
        self.tulis_brief(brief_contoh())
        kode, out, err = self.jalan("luncurkan")
        self.assertEqual(kode, 0, out + err)
        posts = [c for c in Graf.catatan if c[0] == "POST"]
        statuses = [c[2].get("status") for c in posts if c[2].get("status")]
        self.assertTrue(statuses and all(s == "PAUSED" for s in statuses), statuses)
        self.assertNotIn("ACTIVE", statuses)
        n = lambda akhiran: sum(1 for c in posts if c[1].endswith(akhiran))
        self.assertEqual((n("campaigns"), n("adsets"), n("/ads")), (1, 1, 2))
        self.assertEqual((n("adimages"), n("advideos"), n("adcreatives")), (2, 1, 2))
        hasil = json.loads((self.dir / peluncur.BERKAS_HASIL).read_text(encoding="utf-8"))
        self.assertEqual(hasil["kampanye"], "camp1")
        self.assertEqual(len(hasil["iklan"]), 2)

    def test_materi_gambar_dan_video_terbentuk_benar(self):
        self.tulis_brief(brief_contoh())
        self.jalan("luncurkan")
        kre = [c[2] for c in Graf.catatan if c[0] == "POST" and c[1].endswith("adcreatives")]
        gambar = json.loads(kre[0]["object_story_spec"])
        video = json.loads(kre[1]["object_story_spec"])
        self.assertEqual(gambar["page_id"], "555")
        self.assertEqual(gambar["instagram_user_id"], "ig1")
        self.assertEqual(gambar["link_data"]["image_hash"], "hash_g1.png")
        self.assertIn("utm_content=g1", gambar["link_data"]["link"])
        self.assertEqual(video["video_data"]["video_id"], "vid1")
        self.assertEqual(video["video_data"]["image_hash"], "hash_s1.png")
        self.assertEqual(video["video_data"]["call_to_action"]["type"], "SIGN_UP")

    def test_error_meta_dijelaskan_tanpa_membocorkan_token(self):
        self.tulis_brief(brief_contoh())
        Graf.gagalkan = "adsets"
        kode, out, err = self.jalan("luncurkan")
        self.assertEqual(kode, 1)
        self.assertIn("Lokasi tidak valid", err)
        self.assertNotIn("tokenrahasia123", out + err)

    def test_luncurkan_berhenti_bila_brief_tidak_sah(self):
        b = brief_contoh()
        b["kampanye"]["batas_belanja_total"] = 1
        self.tulis_brief(b)
        kode, _, err = self.jalan("luncurkan")
        self.assertEqual(kode, 1)
        self.assertFalse([c for c in Graf.catatan if c[0] == "POST"])
        self.assertIn("melebihi batas belanja", err)

    def test_aktifkan_urut_atas_ke_bawah_dan_jeda_urut_sebaliknya(self):
        self.tulis_brief(brief_contoh())
        self.jalan("luncurkan")
        Graf.catatan = []
        self.jalan("aktifkan")
        urut = [c[1] for c in Graf.catatan if c[0] == "POST"]
        self.assertEqual(urut[0], "camp1")
        self.assertTrue(all(c[2]["status"] == "ACTIVE" for c in Graf.catatan if c[0] == "POST"))
        Graf.catatan = []
        self.jalan("jeda")
        urut = [c[1] for c in Graf.catatan if c[0] == "POST"]
        self.assertEqual(urut[-1], "camp1")
        self.assertTrue(all(c[2]["status"] == "PAUSED" for c in Graf.catatan if c[0] == "POST"))

    def test_aktifkan_butuh_konfirmasi_tanpa_flag_ya(self):
        self.tulis_brief(brief_contoh())
        self.jalan("luncurkan")
        Graf.catatan = []
        import builtins
        asli = builtins.input
        builtins.input = lambda *_: "tidak"
        try:
            peluncur.perintah_aktifkan(self.meta, self.dir, False)
        finally:
            builtins.input = asli
        self.assertFalse([c for c in Graf.catatan if c[0] == "POST"])

    def test_rencana_tanpa_token_tidak_menghubungi_jaringan(self):
        (self.dir / ".env").write_text("", encoding="utf-8")
        self.tulis_brief(brief_contoh())
        kode, out, _ = self.jalan("rencana")
        self.assertEqual(kode, 0)
        self.assertIn("RENCANA", out)
        self.assertEqual(Graf.catatan, [])

    def test_token_kosong_ditolak_untuk_cek(self):
        (self.dir / ".env").write_text("", encoding="utf-8")
        self.tulis_brief(brief_contoh())
        kode, _, err = self.jalan("cek")
        self.assertEqual(kode, 1)
        self.assertIn("META_TOKEN", err)


if __name__ == "__main__":
    unittest.main()
