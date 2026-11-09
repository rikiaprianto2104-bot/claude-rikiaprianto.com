"""
API pendaftar Kelas Explorer (Future Makers).

Layanan kecil berdiri sendiri: hanya memakai pustaka standar Python (tanpa pip)
dan SQLite sebagai database. Dijalankan di belakang nginx pada 127.0.0.1 dan
hanya melayani Kelas Explorer, tidak ada hubungannya dengan kelas lain.

Titik akhir (semua di bawah /api/explorer):
  GET  /health                     cek hidup (publik)
  POST /admin/masuk                login admin: {pengguna, sandi} -> cookie sesi
  POST /admin/keluar               hapus cookie sesi
  GET  /admin/sesi                 cek login + jumlah kursi terisi (admin)
  POST /admin/pendaftar            simpan pendaftar baru (admin)
  GET  /admin/pendaftar            daftar pendaftar, terbaru dulu (admin)
  GET  /pendaftar/<kode>           data invoice/verifikasi (publik, kode rahasia)

"Admin" = cookie sesi yang diterbitkan POST /admin/masuk (HttpOnly, SameSite=
Strict, kedaluwarsa 12 jam, ditandatangani HMAC). Jawaban 401 sengaja TANPA
header WWW-Authenticate supaya peramban tidak memunculkan kotak login bawaan;
formulir login ada di halaman. HTTP Basic tetap diterima untuk curl/skrip.
Kata sandinya TIDAK ada di kode: hanya hash PBKDF2 di berkas lingkungan layanan
(FMVD_ADMIN_USER dan FMVD_ADMIN_HASH). Hash dibuat dengan
`python buat_sandi_admin.py`. Mengganti sandi otomatis mematikan semua sesi.

Pendaftar baru dianggap "terbukti masuk database" hanya setelah ditulis, di-
commit, lalu dibaca ulang dari database; yang dikembalikan ke pemanggil adalah
hasil bacaan ulang itu, bukan data kiriman mentah.

Variabel lingkungan:
  FMVD_DB          lokasi berkas SQLite   (bawaan /var/lib/fmvd-explorer/pendaftar.db)
  FMVD_HOST        alamat dengar          (bawaan 127.0.0.1)
  FMVD_PORT        port dengar            (bawaan 8787)
  FMVD_ADMIN_USER  nama pengguna admin
  FMVD_ADMIN_HASH  hash sandi admin (pbkdf2_sha256$iterasi$garam$hash)
"""

import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import sys
import threading
import time
import uuid
from contextlib import contextmanager
from datetime import date, datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

KELAS = "explorer"
KUOTA = 10
USIA_MIN, USIA_MAX = 7, 15
HARGA_MIN, HARGA_MAKS = 1_000, 50_000_000
MAKS_BODY = 8 * 1024

# Tanpa huruf/angka yang mudah tertukar (0/O, 1/I/L).
ALFABET_KODE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
POLA_KODE = re.compile(r"^EXP-[A-HJKMNP-Z2-9]{8}$")
POLA_IDEM = re.compile(r"^[A-Za-z0-9_-]{8,64}$")
POLA_WA = re.compile(r"^[0-9+\-\s()]{0,24}$")

SKEMA = """
CREATE TABLE IF NOT EXISTS pendaftar (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  kode          TEXT NOT NULL UNIQUE,
  nomor_invoice TEXT NOT NULL UNIQUE,
  idem          TEXT UNIQUE,
  tanggal       TEXT NOT NULL,
  nama_anak     TEXT NOT NULL,
  usia_anak     INTEGER NOT NULL,
  nama_ortu     TEXT NOT NULL,
  wa            TEXT NOT NULL DEFAULT '',
  kelas         TEXT NOT NULL DEFAULT 'explorer',
  harga         INTEGER NOT NULL,
  dibayar       INTEGER NOT NULL,
  metode        TEXT NOT NULL DEFAULT 'lunas',
  status        TEXT NOT NULL DEFAULT 'lunas',
  catatan       TEXT NOT NULL DEFAULT '',
  dibuat_pada   TEXT NOT NULL
);
"""


class GalatInput(Exception):
    """Isian tidak valid. `pesan` aman ditampilkan ke pengguna."""

    def __init__(self, pesan, status=400, kode="input_salah"):
        super().__init__(pesan)
        self.pesan, self.status, self.kode = pesan, status, kode


# --------------------------------------------------------------------------
# Kata sandi admin
# --------------------------------------------------------------------------
def buat_hash(sandi, iterasi=240_000):
    garam = secrets.token_bytes(16)
    h = hashlib.pbkdf2_hmac("sha256", sandi.encode("utf-8"), garam, iterasi)
    b64 = lambda b: base64.b64encode(b).decode("ascii")  # noqa: E731
    return f"pbkdf2_sha256${iterasi}${b64(garam)}${b64(h)}"


def cocok_hash(sandi, tersimpan):
    try:
        skema, iterasi, garam_b64, hash_b64 = tersimpan.split("$")
        if skema != "pbkdf2_sha256":
            return False
        garam = base64.b64decode(garam_b64)
        harapan = base64.b64decode(hash_b64)
        h = hashlib.pbkdf2_hmac("sha256", sandi.encode("utf-8"), garam, int(iterasi))
        return hmac.compare_digest(h, harapan)
    except Exception:
        return False


# --------------------------------------------------------------------------
# Sesi login (cookie bertanda tangan, tanpa penyimpanan di server)
# --------------------------------------------------------------------------
NAMA_COOKIE = "fmvd_sesi"
DURASI_SESI = 12 * 3600


def rahasia_sesi(admin_hash):
    # Diturunkan dari hash sandi: ganti sandi = semua sesi lama otomatis tidak sah.
    return hashlib.sha256(("sesi-v1:" + admin_hash).encode("utf-8")).digest()


def buat_token_sesi(rahasia, pengguna, kedaluwarsa):
    isi = f"{pengguna}|{int(kedaluwarsa)}".encode("utf-8")
    tanda = hmac.new(rahasia, isi, hashlib.sha256).hexdigest()
    return base64.urlsafe_b64encode(isi).decode("ascii").rstrip("=") + "." + tanda


def token_sesi_sah(rahasia, token, pengguna_benar, sekarang=None):
    try:
        b64, _, tanda = token.partition(".")
        isi = base64.urlsafe_b64decode(b64 + "=" * (-len(b64) % 4))
        harapan = hmac.new(rahasia, isi, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(tanda, harapan):
            return False
        pengguna, _, kedaluwarsa = isi.decode("utf-8").rpartition("|")
        if not hmac.compare_digest(pengguna.encode("utf-8"), pengguna_benar.encode("utf-8")):
            return False
        return int(kedaluwarsa) > (sekarang if sekarang is not None else time.time())
    except Exception:
        return False


# --------------------------------------------------------------------------
# Database
# --------------------------------------------------------------------------
class Basisdata:
    def __init__(self, jalur):
        self.jalur = jalur
        os.makedirs(os.path.dirname(os.path.abspath(jalur)), exist_ok=True)
        self._kunci = threading.Lock()
        with self._koneksi() as c:
            c.executescript(SKEMA)

    @contextmanager
    def _koneksi(self):
        """Koneksi yang pasti ditutup (context manager bawaan sqlite3 hanya commit)."""
        c = self._sambung()
        try:
            yield c
        finally:
            c.close()

    def _sambung(self):
        c = sqlite3.connect(self.jalur, timeout=10, isolation_level=None)
        c.row_factory = sqlite3.Row
        c.execute("PRAGMA journal_mode=WAL")
        c.execute("PRAGMA synchronous=FULL")
        c.execute("PRAGMA foreign_keys=ON")
        return c

    def hitung(self):
        with self._koneksi() as c:
            return c.execute(
                "SELECT COUNT(*) FROM pendaftar WHERE kelas = ?", (KELAS,)
            ).fetchone()[0]

    def baca(self, kode):
        with self._koneksi() as c:
            r = c.execute("SELECT * FROM pendaftar WHERE kode = ?", (kode,)).fetchone()
        return dict(r) if r else None

    def daftar(self, batas=200):
        with self._koneksi() as c:
            baris = c.execute(
                "SELECT * FROM pendaftar WHERE kelas = ? ORDER BY id DESC LIMIT ?",
                (KELAS, batas),
            ).fetchall()
        return [dict(r) for r in baris]

    def simpan(self, d, izinkan_lebih=False):
        """
        Simpan satu pendaftar lalu baca ulang dari database.
        Mengembalikan (record, baru): baru=False bila kiriman yang sama
        (idem sama) sudah pernah tersimpan, jadi klik ganda tidak menggandakan.
        """
        with self._kunci:
            c = self._sambung()
            try:
                c.execute("BEGIN IMMEDIATE")
                if d["idem"]:
                    ada = c.execute(
                        "SELECT * FROM pendaftar WHERE idem = ?", (d["idem"],)
                    ).fetchone()
                    if ada:
                        c.execute("ROLLBACK")
                        return dict(ada), False

                terisi = c.execute(
                    "SELECT COUNT(*) FROM pendaftar WHERE kelas = ?", (KELAS,)
                ).fetchone()[0]
                if terisi >= KUOTA and not izinkan_lebih:
                    c.execute("ROLLBACK")
                    raise GalatInput(
                        f"Kuota {KUOTA} anak sudah terisi.", 409, "kuota_penuh"
                    )

                tahun, bulan = d["tanggal"][:4], d["tanggal"][5:7]
                awalan = f"FM-EX/{tahun}/{bulan}/"
                urut = c.execute(
                    "SELECT COUNT(*) FROM pendaftar WHERE nomor_invoice LIKE ?",
                    (awalan + "%",),
                ).fetchone()[0]

                kode = None
                for _ in range(20):
                    calon = "EXP-" + "".join(
                        secrets.choice(ALFABET_KODE) for _ in range(8)
                    )
                    if not c.execute(
                        "SELECT 1 FROM pendaftar WHERE kode = ?", (calon,)
                    ).fetchone():
                        kode = calon
                        break
                if kode is None:
                    raise RuntimeError("tidak bisa membuat kode unik")

                nomor = None
                while nomor is None:
                    urut += 1
                    calon = f"{awalan}{urut:03d}"
                    if not c.execute(
                        "SELECT 1 FROM pendaftar WHERE nomor_invoice = ?", (calon,)
                    ).fetchone():
                        nomor = calon

                sekarang = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                c.execute(
                    """INSERT INTO pendaftar
                       (kode, nomor_invoice, idem, tanggal, nama_anak, usia_anak,
                        nama_ortu, wa, kelas, harga, dibayar, metode, status,
                        catatan, dibuat_pada)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        kode, nomor, d["idem"] or None, d["tanggal"],
                        d["nama_anak"], d["usia_anak"], d["nama_ortu"], d["wa"],
                        KELAS, d["harga"], d["harga"], "lunas", "lunas",
                        d["catatan"], sekarang,
                    ),
                )
                c.execute("COMMIT")
            except Exception:
                try:
                    c.execute("ROLLBACK")
                except sqlite3.Error:
                    pass
                raise
            finally:
                c.close()

        # Bukti masuk database: baca ulang lewat koneksi baru.
        tersimpan = self.baca(kode)
        if not tersimpan:
            raise RuntimeError("data tidak ditemukan setelah commit")
        return tersimpan, True


# --------------------------------------------------------------------------
# Validasi & bentuk data
# --------------------------------------------------------------------------
def _bersih(teks, maks):
    teks = re.sub(r"[\x00-\x1f\x7f]", " ", str(teks or ""))
    return re.sub(r"\s+", " ", teks).strip()[:maks]


def validasi(body):
    if not isinstance(body, dict):
        raise GalatInput("Format data tidak dikenali.")

    nama_anak = _bersih(body.get("nama_anak"), 80)
    nama_ortu = _bersih(body.get("nama_ortu"), 80)
    if len(nama_anak) < 2:
        raise GalatInput("Nama anak belum diisi.")
    if len(nama_ortu) < 2:
        raise GalatInput("Nama orang tua/wali belum diisi.")

    try:
        usia = int(body.get("usia_anak"))
    except (TypeError, ValueError):
        raise GalatInput("Usia anak belum diisi.")
    if not USIA_MIN <= usia <= USIA_MAX:
        raise GalatInput(f"Usia anak harus {USIA_MIN}–{USIA_MAX} tahun.")

    try:
        harga = int(body.get("harga"))
    except (TypeError, ValueError):
        raise GalatInput("Harga belum diisi.")
    if not HARGA_MIN <= harga <= HARGA_MAKS:
        raise GalatInput("Harga tidak masuk akal.")

    wa = _bersih(body.get("wa"), 24)
    if not POLA_WA.match(wa):
        raise GalatInput("Nomor WhatsApp hanya boleh angka, spasi, +, - dan tanda kurung.")

    try:
        tanggal = date.fromisoformat(str(body.get("tanggal") or ""))
    except ValueError:
        raise GalatInput("Tanggal invoice tidak valid.")
    if abs((tanggal - date.today()).days) > 3650:
        raise GalatInput("Tanggal invoice terlalu jauh dari hari ini.")

    idem = str(body.get("idem") or "")
    if idem and not POLA_IDEM.match(idem):
        raise GalatInput("Penanda kiriman tidak valid.")

    return {
        "nama_anak": nama_anak,
        "usia_anak": usia,
        "nama_ortu": nama_ortu,
        "wa": wa,
        "harga": harga,
        "tanggal": tanggal.isoformat(),
        "catatan": _bersih(body.get("catatan"), 200),
        "idem": idem,
    }


def samarkan_wa(wa):
    digit = re.sub(r"\s", "", wa or "")
    if len(digit) < 8:
        return "•" * len(digit)
    return digit[:4] + "•" * (len(digit) - 7) + digit[-3:]


def bentuk(r, publik):
    if r is None:
        return None
    return {
        "kode": r["kode"],
        "nomor": r["nomor_invoice"],
        "tanggal": r["tanggal"],
        "nama_anak": r["nama_anak"],
        "usia_anak": r["usia_anak"],
        "nama_ortu": r["nama_ortu"],
        "wa": samarkan_wa(r["wa"]) if publik else r["wa"],
        "kelas": r["kelas"],
        "harga": r["harga"],
        "dibayar": r["dibayar"],
        "metode": r["metode"],
        "status": r["status"],
        "catatan": r["catatan"],
        "dibuat_pada": r["dibuat_pada"],
    }


# --------------------------------------------------------------------------
# Pembatas laju sederhana (per alamat IP, di memori)
# --------------------------------------------------------------------------
class PembatasLaju:
    def __init__(self, maks, jendela):
        self.maks, self.jendela = maks, jendela
        self._catatan = {}
        self._kunci = threading.Lock()

    def _bersihkan(self, ip, sekarang):
        waktu = [t for t in self._catatan.get(ip, []) if sekarang - t < self.jendela]
        self._catatan[ip] = waktu
        return waktu

    def penuh(self, ip):
        with self._kunci:
            return len(self._bersihkan(ip, time.time())) >= self.maks

    def catat(self, ip):
        with self._kunci:
            sekarang = time.time()
            self._bersihkan(ip, sekarang).append(sekarang)

    def reset(self, ip):
        with self._kunci:
            self._catatan.pop(ip, None)


# --------------------------------------------------------------------------
# HTTP
# --------------------------------------------------------------------------
AWAL = "/api/explorer"


def buat_penangan(db, admin_user, admin_hash):
    gagal_login = PembatasLaju(maks=8, jendela=600)
    rahasia = rahasia_sesi(admin_hash or "")
    baca_publik = PembatasLaju(maks=60, jendela=60)

    class Penangan(BaseHTTPRequestHandler):
        server_version = "FMVDExplorer/1.0"
        sys_version = ""

        def log_message(self, fmt, *args):
            sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), fmt % args))

        # -- util --
        def _ip(self):
            asal = self.client_address[0]
            if asal in ("127.0.0.1", "::1"):
                kirim = self.headers.get("X-Real-IP") or self.headers.get(
                    "X-Forwarded-For", ""
                )
                if kirim:
                    return kirim.split(",")[0].strip()[:45]
            return asal

        def _kirim(self, status, isi, tambahan=None):
            badan = json.dumps(isi, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(badan)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Referrer-Policy", "no-referrer")
            for k, v in (tambahan or {}).items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(badan)

        def _galat(self, status, pesan, kode="galat", tambahan=None):
            self._kirim(status, {"ok": False, "kode": kode, "pesan": pesan}, tambahan)

        def _cookie(self, nama):
            for bagian in self.headers.get("Cookie", "").split(";"):
                k, _, v = bagian.strip().partition("=")
                if k == nama:
                    return v
            return ""

        def _asal_sah(self):
            """Tolak POST lintas-situs: bila ada header Origin, hostnya harus host kita."""
            asal = self.headers.get("Origin")
            if not asal:
                return True
            return urlsplit(asal).netloc == self.headers.get("Host", "")

        def _cookie_sesi(self, token, umur):
            aman = "; Secure" if self.headers.get("X-Forwarded-Proto") == "https" else ""
            return {
                "Set-Cookie": (
                    f"{NAMA_COOKIE}={token}; Path={AWAL}; Max-Age={umur}; "
                    f"HttpOnly; SameSite=Strict{aman}"
                )
            }

        def _admin(self):
            """True bila sesi/Basic sah. Bila tidak, jawaban 401/429 sudah terkirim (tanpa
            WWW-Authenticate, supaya peramban tidak memunculkan kotak login bawaan)."""
            ip = self._ip()
            if gagal_login.penuh(ip):
                self._galat(429, "Terlalu banyak percobaan login. Coba lagi nanti.", "terlalu_sering")
                return False
            if not admin_user or not admin_hash:
                self._galat(503, "Login admin belum disetel di server.", "belum_disetel")
                return False
            token = self._cookie(NAMA_COOKIE)
            if token and token_sesi_sah(rahasia, token, admin_user):
                return True
            kepala = self.headers.get("Authorization", "")
            if kepala.startswith("Basic "):
                try:
                    pengguna, _, sandi = (
                        base64.b64decode(kepala[6:]).decode("utf-8").partition(":")
                    )
                except Exception:
                    pengguna, sandi = "", ""
                if self._cocok_login(pengguna, sandi):
                    gagal_login.reset(ip)
                    return True
                gagal_login.catat(ip)
            self._galat(401, "Perlu login admin.", "perlu_login")
            return False

        def _cocok_login(self, pengguna, sandi):
            benar_user = hmac.compare_digest(
                str(pengguna).encode("utf-8"), admin_user.encode("utf-8")
            )
            # cocok_hash selalu dihitung supaya waktu jawab tidak membocorkan nama pengguna.
            benar_sandi = cocok_hash(str(sandi), admin_hash)
            return benar_user and benar_sandi

        def _masuk(self):
            ip = self._ip()
            if gagal_login.penuh(ip):
                return self._galat(429, "Terlalu banyak percobaan login. Coba lagi nanti.", "terlalu_sering")
            if not admin_user or not admin_hash:
                return self._galat(503, "Login admin belum disetel di server.", "belum_disetel")
            body = self._baca_json()
            if not isinstance(body, dict) or not self._cocok_login(
                body.get("pengguna", ""), body.get("sandi", "")
            ):
                gagal_login.catat(ip)
                return self._galat(401, "Nama pengguna atau kata sandi salah.", "login_salah")
            gagal_login.reset(ip)
            token = buat_token_sesi(rahasia, admin_user, time.time() + DURASI_SESI)
            return self._kirim(200, {"ok": True}, self._cookie_sesi(token, DURASI_SESI))

        def _baca_json(self):
            try:
                panjang = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                raise GalatInput("Panjang data tidak valid.", 411)
            if panjang <= 0 or panjang > MAKS_BODY:
                raise GalatInput("Ukuran data tidak valid.", 413)
            try:
                return json.loads(self.rfile.read(panjang).decode("utf-8"))
            except (ValueError, UnicodeDecodeError):
                raise GalatInput("Data bukan JSON yang valid.")

        def _rute(self):
            return urlsplit(self.path).path.rstrip("/") or "/"

        # -- metode --
        def do_GET(self):
            try:
                rute = self._rute()
                if rute == f"{AWAL}/health":
                    return self._kirim(200, {"ok": True})
                if rute == f"{AWAL}/admin/sesi":
                    if not self._admin():
                        return
                    return self._kirim(200, {"ok": True, "terisi": db.hitung(), "kuota": KUOTA})
                if rute == f"{AWAL}/admin/pendaftar":
                    if not self._admin():
                        return
                    daftar = [bentuk(r, False) for r in db.daftar()]
                    return self._kirim(
                        200, {"ok": True, "terisi": db.hitung(), "kuota": KUOTA, "daftar": daftar}
                    )
                if rute.startswith(f"{AWAL}/pendaftar/"):
                    ip = self._ip()
                    if baca_publik.penuh(ip):
                        return self._galat(429, "Terlalu sering. Coba lagi sebentar.", "terlalu_sering")
                    baca_publik.catat(ip)
                    kode = rute.rsplit("/", 1)[1].upper()
                    if not POLA_KODE.match(kode):
                        return self._galat(404, "Pendaftaran tidak ditemukan.", "tidak_ada")
                    r = db.baca(kode)
                    if not r or r["kelas"] != KELAS:
                        return self._galat(404, "Pendaftaran tidak ditemukan.", "tidak_ada")
                    return self._kirim(200, {"ok": True, "pendaftar": bentuk(r, True)})
                return self._galat(404, "Tidak ditemukan.", "tidak_ada")
            except Exception as e:  # noqa: BLE001
                sys.stderr.write(f"GALAT GET {self.path}: {e!r}\n")
                return self._galat(500, "Terjadi kesalahan di server.", "galat_server")

        def do_POST(self):
            try:
                rute = self._rute()
                if rute not in (
                    f"{AWAL}/admin/pendaftar",
                    f"{AWAL}/admin/masuk",
                    f"{AWAL}/admin/keluar",
                ):
                    return self._galat(404, "Tidak ditemukan.", "tidak_ada")
                if not self._asal_sah():
                    return self._galat(403, "Permintaan ditolak (asal tidak cocok).", "asal_salah")
                if rute == f"{AWAL}/admin/masuk":
                    return self._masuk()
                if rute == f"{AWAL}/admin/keluar":
                    return self._kirim(200, {"ok": True}, self._cookie_sesi("", 0))
                if not self._admin():
                    return
                body = self._baca_json()
                izinkan = bool(isinstance(body, dict) and body.get("izinkan_lebih"))
                data = validasi(body)
                r, baru = db.simpan(data, izinkan_lebih=izinkan)
                return self._kirim(
                    201 if baru else 200,
                    {
                        "ok": True,
                        "baru": baru,
                        "tersimpan_di_database": True,
                        "pendaftar": bentuk(r, False),
                        "terisi": db.hitung(),
                        "kuota": KUOTA,
                    },
                )
            except GalatInput as e:
                return self._galat(e.status, e.pesan, e.kode)
            except Exception as e:  # noqa: BLE001
                sys.stderr.write(f"GALAT POST {self.path}: {e!r}\n")
                return self._galat(500, "Gagal menyimpan ke database.", "galat_server")

    return Penangan


def buat_server(jalur_db, host, port, admin_user, admin_hash):
    db = Basisdata(jalur_db)
    server = ThreadingHTTPServer((host, port), buat_penangan(db, admin_user, admin_hash))
    server.daemon_threads = True
    return server, db


def main():
    jalur = os.environ.get("FMVD_DB", "/var/lib/fmvd-explorer/pendaftar.db")
    host = os.environ.get("FMVD_HOST", "127.0.0.1")
    port = int(os.environ.get("FMVD_PORT", "8787"))
    user = os.environ.get("FMVD_ADMIN_USER", "")
    hash_ = os.environ.get("FMVD_ADMIN_HASH", "")
    if not user or not hash_:
        sys.stderr.write("PERINGATAN: FMVD_ADMIN_USER/FMVD_ADMIN_HASH belum disetel; login admin ditolak.\n")
    server, _ = buat_server(jalur, host, port, user, hash_)
    sys.stderr.write(f"API Explorer siap di http://{host}:{port} (db: {jalur})\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
