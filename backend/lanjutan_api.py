"""
API invoice & kursi Kelas Lanjutan (Future Makers).

Layanan kecil berdiri sendiri: hanya pustaka standar Python (tanpa pip) dan
SQLite. Dijalankan di belakang nginx pada 127.0.0.1, menggantikan Google Apps
Script + Spreadsheet Drive yang dipakai sebelumnya.

Kenapa terpisah dari explorer_api.py, bukan satu layanan yang melayani
keduanya: API Explorer sedang melayani trafik iklan yang berjalan. Menyatukan
keduanya berarti mengubah kode yang sedang dipakai, dan satu kesalahan di sana
mematikan pendaftaran yang sudah dibayar iklannya. Layanan ini sengaja berdiri
sendiri dengan port, pengguna sistem, dan databasenya sendiri, sehingga apa pun
yang terjadi di sini tidak bisa menjatuhkan Kelas Explorer.

Bedanya dengan Explorer, dan kenapa datanya dua tabel: satu invoice Kelas
Lanjutan bisa memuat sampai 4 anak sekaligus, masing-masing dengan kelas dan
harganya sendiri (kakak Champions, adik Creator). Jadi `invoice` menyimpan
tagihannya dan `peserta` menyimpan anak-anaknya.

Titik akhir (semua di bawah /api/lanjutan):
  GET  /health                 cek hidup (publik)
  GET  /kursi                  sisa kursi tiap kelas (publik, TANPA data pribadi)
  POST /admin/masuk            login admin: {pengguna, sandi} -> cookie sesi
  POST /admin/keluar           hapus cookie sesi
  GET  /admin/sesi             cek login + sisa kursi (admin)
  POST /admin/invoice          terbitkan invoice baru (admin)
  GET  /admin/invoice          daftar invoice, terbaru dulu (admin)
  GET  /invoice/<kode>         isi invoice (publik, kodenya rahasia)

/kursi sengaja hanya mengembalikan angka kuota, terisi, dan sisa. Landing page
yang memanggilnya adalah halaman iklan yang terbuka untuk umum, jadi tidak
boleh ada nama anak atau nomor telepon yang bisa terbaca dari sana.

"Admin" = cookie sesi dari POST /admin/masuk (HttpOnly, SameSite=Strict,
kedaluwarsa 12 jam, ditandatangani HMAC). Jawaban 401 sengaja TANPA header
WWW-Authenticate supaya peramban tidak memunculkan kotak login bawaan.
Kata sandinya TIDAK ada di kode: hanya hash PBKDF2 di berkas lingkungan layanan
(FMVD_ADMIN_USER dan FMVD_ADMIN_HASH), dibuat dengan `buat_sandi_admin.py`.

Variabel lingkungan:
  FMVD_DB          lokasi berkas SQLite  (bawaan /var/lib/fmvd-lanjutan/invoice.db)
  FMVD_HOST        alamat dengar         (bawaan 127.0.0.1)
  FMVD_PORT        port dengar           (bawaan 8788)
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
from contextlib import contextmanager
from datetime import date, datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

# Kuota kursi tiap kelas. Harus sama dengan yang tertulis di
# frontend/src/data/kelasLanjutan.js — kalau beda, angka di landing page dan
# penolakan di sini tidak akan cocok.
KUOTA = {"creator": 8, "champions": 6, "private": 3}
KELAS_SAH = tuple(KUOTA)

# Kode kelas pada nomor invoice: FM-CR/2026/11/001.
#   FM   penerbitnya (Future Makers)
#   CR   kelasnya
#   2026 tahun terbit, 11 bulan terbit
#   001  nomor urut, dihitung per kode kelas per bulan
# Kelas Explorer memakai EX lewat layanannya sendiri.
KODE_KELAS = {"creator": "CR", "champions": "CH", "private": "PR"}

MAKS_PESERTA = 4
HARGA_MIN, HARGA_MAKS = 1_000, 50_000_000
TOTAL_MAKS = 200_000_000
MAKS_BODY = 16 * 1024

JALUR_SAH = ("umum", "alumni")
METODE_SAH = ("lunas", "cicilan")
# Status pembayaran yang boleh dipakai. "batal" tidak ikut menghitung kursi.
POLA_STATUS = re.compile(r"^(lunas|dp|belum|batal|cicilan-[1-5])$")

# Tanpa huruf/angka yang mudah tertukar (0/O, 1/I/L).
ALFABET_KODE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
POLA_KODE = re.compile(r"^LJT-[A-HJKMNP-Z2-9]{8}$")
POLA_IDEM = re.compile(r"^[A-Za-z0-9_-]{8,64}$")
POLA_WA = re.compile(r"^[0-9+\-\s()]{0,24}$")
POLA_REFERRAL = re.compile(r"^[A-Za-z0-9 _-]{0,32}$")

SKEMA = """
CREATE TABLE IF NOT EXISTS invoice (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  kode          TEXT NOT NULL UNIQUE,
  nomor_invoice TEXT NOT NULL UNIQUE,
  idem          TEXT UNIQUE,
  tanggal       TEXT NOT NULL,
  nama_ortu     TEXT NOT NULL,
  wa            TEXT NOT NULL DEFAULT '',
  jalur         TEXT NOT NULL DEFAULT 'umum',
  referral      TEXT NOT NULL DEFAULT '',
  metode        TEXT NOT NULL DEFAULT 'lunas',
  status        TEXT NOT NULL DEFAULT 'lunas',
  total         INTEGER NOT NULL,
  dibayar       INTEGER NOT NULL,
  catatan       TEXT NOT NULL DEFAULT '',
  dibuat_pada   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS peserta (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
  urut       INTEGER NOT NULL,
  nama       TEXT NOT NULL,
  kelas      TEXT NOT NULL,
  harga      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_peserta_invoice ON peserta(invoice_id);
CREATE INDEX IF NOT EXISTS idx_peserta_kelas   ON peserta(kelas);
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
NAMA_COOKIE = "fmvd_lanjutan_sesi"
DURASI_SESI = 12 * 3600


def rahasia_sesi(admin_hash):
    # Diturunkan dari hash sandi: ganti sandi = semua sesi lama otomatis mati.
    return hashlib.sha256(("sesi-lanjutan-v1:" + admin_hash).encode("utf-8")).digest()


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
        if not hmac.compare_digest(
            pengguna.encode("utf-8"), pengguna_benar.encode("utf-8")
        ):
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

    @staticmethod
    def _terisi(c):
        """Jumlah kursi terpakai per kelas. Invoice batal tidak dihitung."""
        hasil = {k: 0 for k in KUOTA}
        for baris in c.execute(
            """SELECT p.kelas AS kelas, COUNT(*) AS n
                 FROM peserta p JOIN invoice i ON i.id = p.invoice_id
                WHERE i.status <> 'batal'
                GROUP BY p.kelas"""
        ):
            if baris["kelas"] in hasil:
                hasil[baris["kelas"]] = baris["n"]
        return hasil

    def kursi(self):
        with self._koneksi() as c:
            terisi = self._terisi(c)
        return {
            k: {"kuota": KUOTA[k], "terisi": terisi[k], "sisa": max(0, KUOTA[k] - terisi[k])}
            for k in KUOTA
        }

    def _peserta(self, c, invoice_id):
        return [
            dict(r)
            for r in c.execute(
                "SELECT urut, nama, kelas, harga FROM peserta "
                "WHERE invoice_id = ? ORDER BY urut",
                (invoice_id,),
            )
        ]

    def baca(self, kode):
        with self._koneksi() as c:
            r = c.execute("SELECT * FROM invoice WHERE kode = ?", (kode,)).fetchone()
            if not r:
                return None
            d = dict(r)
            d["peserta"] = self._peserta(c, r["id"])
        return d

    def daftar(self, batas=200):
        with self._koneksi() as c:
            baris = c.execute(
                "SELECT * FROM invoice ORDER BY id DESC LIMIT ?", (batas,)
            ).fetchall()
            hasil = []
            for r in baris:
                d = dict(r)
                d["peserta"] = self._peserta(c, r["id"])
                hasil.append(d)
        return hasil

    def simpan(self, d, izinkan_lebih=False):
        """
        Simpan satu invoice beserta pesertanya, lalu baca ulang dari database.
        Mengembalikan (record, baru): baru=False bila kiriman dengan idem yang
        sama sudah pernah tersimpan, jadi klik ganda tidak menggandakan.
        """
        with self._kunci:
            c = self._sambung()
            try:
                c.execute("BEGIN IMMEDIATE")

                if d["idem"]:
                    ada = c.execute(
                        "SELECT kode FROM invoice WHERE idem = ?", (d["idem"],)
                    ).fetchone()
                    if ada:
                        c.execute("ROLLBACK")
                        return self.baca(ada["kode"]), False

                # Kuota diperiksa di dalam transaksi, bukan sebelumnya, supaya
                # dua invoice yang dikirim bersamaan tidak sama-sama lolos.
                if not izinkan_lebih and d["status"] != "batal":
                    terisi = self._terisi(c)
                    tambahan = {}
                    for p in d["peserta"]:
                        tambahan[p["kelas"]] = tambahan.get(p["kelas"], 0) + 1
                    for kelas, n in tambahan.items():
                        if terisi[kelas] + n > KUOTA[kelas]:
                            sisa = max(0, KUOTA[kelas] - terisi[kelas])
                            c.execute("ROLLBACK")
                            raise GalatInput(
                                f"Kursi {kelas} tinggal {sisa}, tidak cukup untuk {n} anak.",
                                409,
                                "kuota_penuh",
                            )

                tahun, bulan = d["tanggal"][:4], d["tanggal"][5:7]
                # Satu invoice bisa memuat beberapa anak di kelas berbeda
                # (kakak Champions, adik Creator). Nomornya mengikuti kelas
                # anak pertama supaya tetap memakai salah satu kode yang sudah
                # ditetapkan, bukan kode campuran yang tidak dikenal.
                awalan = f"FM-{KODE_KELAS[d['peserta'][0]['kelas']]}/{tahun}/{bulan}/"
                urut = c.execute(
                    "SELECT COUNT(*) FROM invoice WHERE nomor_invoice LIKE ?",
                    (awalan + "%",),
                ).fetchone()[0]

                kode = None
                for _ in range(20):
                    calon = "LJT-" + "".join(
                        secrets.choice(ALFABET_KODE) for _ in range(8)
                    )
                    if not c.execute(
                        "SELECT 1 FROM invoice WHERE kode = ?", (calon,)
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
                        "SELECT 1 FROM invoice WHERE nomor_invoice = ?", (calon,)
                    ).fetchone():
                        nomor = calon

                sekarang = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                cur = c.execute(
                    """INSERT INTO invoice
                       (kode, nomor_invoice, idem, tanggal, nama_ortu, wa, jalur,
                        referral, metode, status, total, dibayar, catatan, dibuat_pada)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        kode, nomor, d["idem"] or None, d["tanggal"], d["nama_ortu"],
                        d["wa"], d["jalur"], d["referral"], d["metode"], d["status"],
                        d["total"], d["dibayar"], d["catatan"], sekarang,
                    ),
                )
                invoice_id = cur.lastrowid
                for i, p in enumerate(d["peserta"], start=1):
                    c.execute(
                        "INSERT INTO peserta (invoice_id, urut, nama, kelas, harga) "
                        "VALUES (?,?,?,?,?)",
                        (invoice_id, i, p["nama"], p["kelas"], p["harga"]),
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


def _angka(nilai, nama, minimum, maksimum):
    try:
        n = int(nilai)
    except (TypeError, ValueError):
        raise GalatInput(f"{nama} belum diisi dengan benar.")
    if not minimum <= n <= maksimum:
        raise GalatInput(f"{nama} di luar batas yang masuk akal.")
    return n


def validasi(body):
    if not isinstance(body, dict):
        raise GalatInput("Format data tidak dikenali.")

    nama_ortu = _bersih(body.get("nama_ortu"), 80)
    if len(nama_ortu) < 2:
        raise GalatInput("Nama orang tua/wali belum diisi.")

    wa = _bersih(body.get("wa"), 24)
    if not POLA_WA.match(wa):
        raise GalatInput("Nomor WhatsApp hanya boleh angka, spasi, +, - dan tanda kurung.")

    referral = _bersih(body.get("referral"), 32)
    if not POLA_REFERRAL.match(referral):
        raise GalatInput("Kode referral mengandung karakter yang tidak diizinkan.")

    try:
        tanggal = date.fromisoformat(str(body.get("tanggal") or ""))
    except ValueError:
        raise GalatInput("Tanggal invoice tidak valid.")
    if abs((tanggal - date.today()).days) > 3650:
        raise GalatInput("Tanggal invoice terlalu jauh dari hari ini.")

    jalur = str(body.get("jalur") or "umum")
    if jalur not in JALUR_SAH:
        raise GalatInput("Jalur harga tidak dikenali.")

    metode = str(body.get("metode") or "lunas")
    if metode not in METODE_SAH:
        raise GalatInput("Metode pembayaran tidak dikenali.")

    status = str(body.get("status") or "lunas")
    if not POLA_STATUS.match(status):
        raise GalatInput("Status pembayaran tidak dikenali.")

    peserta_masuk = body.get("peserta")
    if not isinstance(peserta_masuk, list) or not peserta_masuk:
        raise GalatInput("Data peserta belum diisi.")
    if len(peserta_masuk) > MAKS_PESERTA:
        raise GalatInput(f"Maksimal {MAKS_PESERTA} anak dalam satu invoice.")

    peserta = []
    for i, p in enumerate(peserta_masuk, start=1):
        if not isinstance(p, dict):
            raise GalatInput(f"Data anak ke-{i} tidak dikenali.")
        nama = _bersih(p.get("nama"), 80)
        if len(nama) < 2:
            raise GalatInput(f"Nama anak ke-{i} belum diisi.")
        kelas = str(p.get("kelas") or "")
        if kelas not in KELAS_SAH:
            raise GalatInput(f"Kelas anak ke-{i} tidak dikenali.")
        peserta.append(
            {
                "nama": nama,
                "kelas": kelas,
                "harga": _angka(p.get("harga"), f"Harga anak ke-{i}", HARGA_MIN, HARGA_MAKS),
            }
        )

    total = _angka(body.get("total"), "Total biaya", HARGA_MIN, TOTAL_MAKS)
    dibayar = _angka(body.get("dibayar"), "Nominal yang sudah dibayar", 0, TOTAL_MAKS)
    if dibayar > total:
        raise GalatInput("Nominal yang dibayar melebihi total biaya.")
    jumlah_harga = sum(p["harga"] for p in peserta)
    if total != jumlah_harga:
        raise GalatInput(
            f"Total biaya ({total}) tidak sama dengan jumlah harga peserta ({jumlah_harga})."
        )

    idem = str(body.get("idem") or "")
    if idem and not POLA_IDEM.match(idem):
        raise GalatInput("Penanda kiriman tidak valid.")

    return {
        "nama_ortu": nama_ortu,
        "wa": wa,
        "jalur": jalur,
        "referral": referral,
        "metode": metode,
        "status": status,
        "tanggal": tanggal.isoformat(),
        "total": total,
        "dibayar": dibayar,
        "catatan": _bersih(body.get("catatan"), 200),
        "idem": idem,
        "peserta": peserta,
    }


def samarkan_wa(wa):
    digit = re.sub(r"\s", "", wa or "")
    if len(digit) < 8:
        return "•" * len(digit)
    return digit[:4] + "•" * (len(digit) - 7) + digit[-3:]


def bentuk(r, publik):
    """
    Bentuk jawaban JSON untuk satu invoice.

    `publik` dipakai untuk halaman invoice dan verifikasi yang dibuka orang tua
    lewat tautan/QR: nomor WhatsApp disamarkan di sana, sedangkan daftar admin
    melihat nomor utuhnya.
    """
    if r is None:
        return None
    return {
        "kode": r["kode"],
        "nomor": r["nomor_invoice"],
        "tanggal": r["tanggal"],
        "nama_ortu": r["nama_ortu"],
        "wa": samarkan_wa(r["wa"]) if publik else r["wa"],
        "jalur": r["jalur"],
        "referral": r["referral"],
        "metode": r["metode"],
        "status": r["status"],
        "total": r["total"],
        "dibayar": r["dibayar"],
        "catatan": r["catatan"],
        "dibuat_pada": r["dibuat_pada"],
        "peserta": [
            {"nama": p["nama"], "kelas": p["kelas"], "harga": p["harga"]}
            for p in r.get("peserta", [])
        ],
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
AWAL = "/api/lanjutan"


def buat_penangan(db, admin_user, admin_hash):
    gagal_login = PembatasLaju(maks=8, jendela=600)
    rahasia = rahasia_sesi(admin_hash or "")
    # Landing page memanggil /kursi sekali tiap kali dibuka, jadi batasnya
    # lebih longgar daripada pembacaan invoice per kode.
    baca_kursi = PembatasLaju(maks=120, jendela=60)
    baca_invoice = PembatasLaju(maks=60, jendela=60)

    class Penangan(BaseHTTPRequestHandler):
        server_version = "FMVDLanjutan/1.0"
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
            """True bila sesi/Basic sah. Bila tidak, jawaban 401/429 sudah terkirim."""
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
            # cocok_hash selalu dihitung supaya waktu jawab tidak membocorkan
            # nama pengguna yang benar.
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

                if rute == f"{AWAL}/kursi":
                    ip = self._ip()
                    if baca_kursi.penuh(ip):
                        return self._galat(429, "Terlalu sering. Coba lagi sebentar.", "terlalu_sering")
                    baca_kursi.catat(ip)
                    # Hanya angka: tidak ada nama anak maupun nomor telepon.
                    return self._kirim(200, {"ok": True, "kursi": db.kursi()})

                if rute == f"{AWAL}/admin/sesi":
                    if not self._admin():
                        return
                    return self._kirim(200, {"ok": True, "kursi": db.kursi()})

                if rute == f"{AWAL}/admin/invoice":
                    if not self._admin():
                        return
                    daftar = [bentuk(r, False) for r in db.daftar()]
                    return self._kirim(
                        200, {"ok": True, "kursi": db.kursi(), "daftar": daftar}
                    )

                if rute.startswith(f"{AWAL}/invoice/"):
                    ip = self._ip()
                    if baca_invoice.penuh(ip):
                        return self._galat(429, "Terlalu sering. Coba lagi sebentar.", "terlalu_sering")
                    baca_invoice.catat(ip)
                    kode = rute.rsplit("/", 1)[1].upper()
                    if not POLA_KODE.match(kode):
                        return self._galat(404, "Invoice tidak ditemukan.", "tidak_ada")
                    r = db.baca(kode)
                    if not r:
                        return self._galat(404, "Invoice tidak ditemukan.", "tidak_ada")
                    return self._kirim(200, {"ok": True, "invoice": bentuk(r, True)})

                return self._galat(404, "Tidak ditemukan.", "tidak_ada")
            except Exception as e:  # noqa: BLE001
                sys.stderr.write(f"GALAT GET {self.path}: {e!r}\n")
                return self._galat(500, "Terjadi kesalahan di server.", "galat_server")

        def do_POST(self):
            try:
                rute = self._rute()
                if rute not in (
                    f"{AWAL}/admin/invoice",
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
                        "invoice": bentuk(r, False),
                        "kursi": db.kursi(),
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
    jalur = os.environ.get("FMVD_DB", "/var/lib/fmvd-lanjutan/invoice.db")
    host = os.environ.get("FMVD_HOST", "127.0.0.1")
    port = int(os.environ.get("FMVD_PORT", "8788"))
    user = os.environ.get("FMVD_ADMIN_USER", "")
    hash_ = os.environ.get("FMVD_ADMIN_HASH", "")
    if not user or not hash_:
        sys.stderr.write(
            "PERINGATAN: FMVD_ADMIN_USER/FMVD_ADMIN_HASH belum disetel; login admin ditolak.\n"
        )
    server, _ = buat_server(jalur, host, port, user, hash_)
    sys.stderr.write(f"API Kelas Lanjutan siap di http://{host}:{port} (db: {jalur})\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
