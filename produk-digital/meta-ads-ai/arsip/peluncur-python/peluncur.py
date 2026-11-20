#!/usr/bin/env python3
"""Bot Peluncur Iklan Meta.

Membuat kampanye, set iklan, materi, dan iklan di akun Meta Ads Anda dari satu
berkas brief (brief.json), lewat Marketing API resmi. SEMUA objek dibuat dalam
keadaan JEDA; tidak ada uang keluar sampai Anda menjalankan `aktifkan`.

Perintah:
  cek        periksa token, akun iklan, Halaman, Instagram, pixel, dan brief
  rencana    tampilkan apa yang AKAN dibuat (tanpa membuat apa pun)
  luncurkan  buat semuanya dalam keadaan JEDA
  aktifkan   nyalakan semua (minta ketik AKTIFKAN)
  jeda       jeda semua yang dibuat bot ini
  status     tampilkan status terkini

Hanya memakai pustaka bawaan Python 3.11+. Token dibaca dari .env, tidak pernah
dicetak, dan hanya dikirim ke graph.facebook.com.
"""
from __future__ import annotations

import argparse
import json
import math
import mimetypes
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime
from pathlib import Path

FOLDER = Path(__file__).resolve().parent
VERSI_API = "v23.0"
BASE_URL = "https://graph.facebook.com"
BERKAS_HASIL = "hasil-peluncuran.json"

TUJUAN = {"traffic": "OUTCOME_TRAFFIC", "leads": "OUTCOME_LEADS"}
OPTIMASI = {"LANDING_PAGE_VIEWS", "LINK_CLICKS", "OFFSITE_CONVERSIONS", "IMPRESSIONS", "REACH"}
TOMBOL = {"LEARN_MORE", "SIGN_UP", "CONTACT_US", "SHOP_NOW", "APPLY_NOW", "GET_QUOTE", "BOOK_TRAVEL", "WHATSAPP_MESSAGE"}


class Galat(Exception):
    """Kesalahan yang pesannya aman ditampilkan ke pengguna."""


# --------------------------------------------------------------------------
# Konfigurasi dan brief
# --------------------------------------------------------------------------
def muat_env(folder: Path = FOLDER) -> dict:
    env = {}
    berkas = folder / ".env"
    if berkas.exists():
        for baris in berkas.read_text(encoding="utf-8").splitlines():
            baris = baris.strip()
            if not baris or baris.startswith("#") or "=" not in baris:
                continue
            k, _, v = baris.partition("=")
            env[k.strip()] = v.strip().strip("'\"")
    return env


def muat_brief(jalur: Path) -> dict:
    if not jalur.exists():
        raise Galat(f"Berkas brief tidak ditemukan: {jalur}. Salin brief.contoh.json menjadi brief.json dan isi.")
    try:
        return json.loads(jalur.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise Galat(f"brief.json bukan JSON yang valid (baris {e.lineno}, kolom {e.colno}): {e.msg}") from e


def _tanggal(teks: str) -> datetime:
    return datetime.fromisoformat(teks)


def jumlah_hari(mulai: str, selesai: str) -> int:
    selisih = (_tanggal(selesai) - _tanggal(mulai)).total_seconds() / 86400
    return max(1, math.ceil(selisih))


def validasi_brief(b: dict, folder: Path = FOLDER) -> list[str]:
    """Kembalikan daftar masalah (kosong = aman dijalankan)."""
    m: list[str] = []
    for k in ("akun_iklan_id", "page_id", "link_tujuan"):
        if not str(b.get(k, "")).strip():
            m.append(f"Kolom '{k}' wajib diisi.")
    if b.get("kategori_khusus"):
        m.append("Kategori khusus (perumahan, kredit, pekerjaan, isu sosial/politik) tidak didukung bot ini. Gunakan Ads Manager.")
    k = b.get("kampanye") or {}
    if not k.get("nama"):
        m.append("kampanye.nama wajib diisi.")
    if k.get("tujuan") not in TUJUAN:
        m.append("kampanye.tujuan harus 'traffic' atau 'leads'.")
    if not isinstance(k.get("batas_belanja_total"), (int, float)) or k.get("batas_belanja_total", 0) <= 0:
        m.append("kampanye.batas_belanja_total wajib berupa angka lebih dari 0 (pengaman belanja).")
    if not str(b.get("link_tujuan", "")).startswith("https://"):
        m.append("link_tujuan harus diawali https://")

    sets = b.get("set_iklan") or []
    iklan = b.get("iklan") or []
    if not sets:
        m.append("Minimal satu set_iklan.")
    if not iklan:
        m.append("Minimal satu iklan.")

    total = 0.0
    for i, s in enumerate(sets, 1):
        pre = f"set_iklan[{i}]"
        for kolom in ("nama", "anggaran_harian", "mulai", "selesai"):
            if not s.get(kolom):
                m.append(f"{pre}.{kolom} wajib diisi.")
        if s.get("optimasi") not in OPTIMASI:
            m.append(f"{pre}.optimasi harus salah satu dari: {', '.join(sorted(OPTIMASI))}.")
        if s.get("optimasi") == "OFFSITE_CONVERSIONS" and not (b.get("pixel_id") and s.get("peristiwa")):
            m.append(f"{pre}: optimasi OFFSITE_CONVERSIONS membutuhkan pixel_id di brief dan 'peristiwa' (mis. LEAD, CONTENT_VIEW).")
        if not s.get("lokasi"):
            m.append(f"{pre}.lokasi wajib diisi (negara atau titik + radius_km).")
        try:
            if s.get("mulai") and s.get("selesai"):
                if _tanggal(s["selesai"]) <= _tanggal(s["mulai"]):
                    m.append(f"{pre}: tanggal selesai harus setelah mulai.")
                else:
                    total += float(s["anggaran_harian"]) * jumlah_hari(s["mulai"], s["selesai"])
        except (ValueError, TypeError):
            m.append(f"{pre}: format tanggal harus seperti 2026-12-01T06:00:00+07:00 dan anggaran berupa angka.")
    batas = k.get("batas_belanja_total")
    if isinstance(batas, (int, float)) and total > batas:
        m.append(
            f"Perkiraan belanja maksimum (anggaran harian x hari) Rp{total:,.0f} melebihi batas belanja total Rp{batas:,.0f}. "
            "Naikkan batas atau turunkan anggaran/jadwal."
        )

    for i, a in enumerate(iklan, 1):
        pre = f"iklan[{i}]"
        for kolom in ("nama", "file", "teks_utama", "judul"):
            if not a.get(kolom):
                m.append(f"{pre}.{kolom} wajib diisi.")
        if a.get("jenis", "gambar") not in ("gambar", "video"):
            m.append(f"{pre}.jenis harus 'gambar' atau 'video'.")
        if a.get("tombol", "LEARN_MORE") not in TOMBOL:
            m.append(f"{pre}.tombol harus salah satu dari: {', '.join(sorted(TOMBOL))}.")
        for kolom in ("file", "gambar_sampul"):
            if a.get(kolom) and not (folder / a[kolom]).exists():
                m.append(f"{pre}.{kolom}: berkas tidak ditemukan ({a[kolom]}).")
        if a.get("jenis") == "video" and not a.get("gambar_sampul"):
            m.append(f"{pre}: video wajib punya gambar_sampul (gambar mini).")
    return m


# --------------------------------------------------------------------------
# Membangun muatan (murni, tanpa jaringan: mudah diuji)
# --------------------------------------------------------------------------
def slug(teks: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", str(teks).lower()).strip("_") or "x"


def link_utm(b: dict, nama_iklan: str) -> str:
    link = b["link_tujuan"]
    if not b.get("pakai_utm", True):
        return link
    q = urllib.parse.urlencode({
        "utm_source": "meta",
        "utm_medium": "paid",
        "utm_campaign": slug(b["kampanye"]["nama"]),
        "utm_content": slug(nama_iklan),
    })
    return link + ("&" if "?" in link else "?") + q


def muatan_kampanye(b: dict) -> dict:
    k = b["kampanye"]
    sat = b.get("satuan_terkecil", 1)
    return {
        "name": k["nama"],
        "objective": TUJUAN[k["tujuan"]],
        "status": "PAUSED",
        "special_ad_categories": [],
        "buying_type": "AUCTION",
        "spend_cap": int(k["batas_belanja_total"] * sat),
        "is_adset_budget_sharing_enabled": False,
    }


def muatan_set_iklan(b: dict, s: dict, id_kampanye: str) -> dict:
    sat = b.get("satuan_terkecil", 1)
    lok = s["lokasi"]
    if "radius_km" in lok:
        geo = {
            "custom_locations": [{
                "latitude": lok["lat"], "longitude": lok["lng"],
                "radius": lok["radius_km"], "distance_unit": "kilometer",
            }],
            "location_types": ["home", "recent"],
        }
    else:
        geo = {"countries": lok.get("negara", ["ID"])}
    target = {"geo_locations": geo}
    umin, umaks = s.get("usia_min"), s.get("usia_maks")
    if s.get("usia_keras"):
        # Batas keras: Advantage+ audience dimatikan agar usia benar-benar dibatasi.
        target["targeting_automation"] = {"advantage_audience": 0}
        if umin:
            target["age_min"] = umin
        if umaks:
            target["age_max"] = umaks
    else:
        # Usia hanya SARAN (Advantage+ audience aktif); age_min keras maksimal 25.
        target["targeting_automation"] = {"advantage_audience": 1}
        target["age_min"] = min(umin or 18, 25)
        if umin and umaks:
            target["age_range"] = [umin, umaks]
    p = {
        "name": s["nama"],
        "campaign_id": id_kampanye,
        "status": "PAUSED",
        "daily_budget": int(float(s["anggaran_harian"]) * sat),
        "billing_event": "IMPRESSIONS",
        "optimization_goal": s["optimasi"],
        "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
        "destination_type": "WEBSITE",
        "start_time": s["mulai"],
        "end_time": s["selesai"],
        "targeting": target,
    }
    if b.get("pixel_id") and s.get("peristiwa"):
        p["promoted_object"] = {"pixel_id": str(b["pixel_id"]), "custom_event_type": s["peristiwa"]}
    return p


def muatan_materi(b: dict, a: dict, hash_gambar: str | None, id_video: str | None, hash_sampul: str | None) -> dict:
    link = link_utm(b, a["nama"])
    cta = {"type": a.get("tombol", "LEARN_MORE"), "value": {"link": link}}
    spec: dict = {"page_id": str(b["page_id"])}
    if b.get("instagram_id"):
        spec["instagram_user_id"] = str(b["instagram_id"])
    if a.get("jenis", "gambar") == "video":
        spec["video_data"] = {
            "video_id": id_video, "image_hash": hash_sampul, "message": a["teks_utama"],
            "title": a["judul"], "call_to_action": cta,
        }
        if a.get("deskripsi"):
            spec["video_data"]["link_description"] = a["deskripsi"]
    else:
        spec["link_data"] = {
            "image_hash": hash_gambar, "link": link, "message": a["teks_utama"],
            "name": a["judul"], "call_to_action": cta,
        }
        if a.get("deskripsi"):
            spec["link_data"]["description"] = a["deskripsi"]
    return {"name": f"{a['nama']}_materi", "object_story_spec": spec}


def rencana_teks(b: dict) -> str:
    k = b["kampanye"]
    sat = b.get("satuan_terkecil", 1)
    baris = [
        "RENCANA (belum ada yang dibuat):",
        f"  Kampanye : {k['nama']}  [{k['tujuan']}]  batas belanja Rp{k['batas_belanja_total']:,.0f}  (dikirim sebagai {int(k['batas_belanja_total'] * sat)})",
    ]
    total = 0.0
    for s in b["set_iklan"]:
        hari = jumlah_hari(s["mulai"], s["selesai"])
        total += float(s["anggaran_harian"]) * hari
        baris.append(
            f"  Set iklan: {s['nama']}  Rp{float(s['anggaran_harian']):,.0f}/hari x {hari} hari  "
            f"optimasi {s['optimasi']}{' / ' + s['peristiwa'] if s.get('peristiwa') else ''}"
        )
        for a in b["iklan"]:
            baris.append(f"      Iklan : {a['nama']} ({a.get('jenis', 'gambar')}, tombol {a.get('tombol', 'LEARN_MORE')})")
    baris.append(f"  Perkiraan belanja maksimum: Rp{total:,.0f}  (batas Rp{k['batas_belanja_total']:,.0f})")
    baris.append("  Semua objek dibuat dalam keadaan JEDA.")
    return "\n".join(baris)


# --------------------------------------------------------------------------
# Klien Graph API
# --------------------------------------------------------------------------
def _nilai(v) -> str:
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (dict, list)):
        return json.dumps(v, ensure_ascii=False)
    return str(v)


class Meta:
    def __init__(self, token: str, versi: str = VERSI_API, base: str = BASE_URL):
        self.token = token
        self.url = f"{base.rstrip('/')}/{versi}"

    def _kirim(self, req: urllib.request.Request) -> dict:
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode("utf-8") or "{}")
        except urllib.error.HTTPError as e:
            try:
                err = json.loads(e.read().decode("utf-8")).get("error", {})
            except Exception:
                err = {}
            pesan = err.get("error_user_msg") or err.get("message") or f"HTTP {e.code}"
            raise Galat(f"Meta menolak: {pesan} (kode {err.get('code', e.code)}/{err.get('error_subcode', '-')})") from None
        except urllib.error.URLError as e:
            raise Galat(f"Tidak bisa menghubungi Meta: {e.reason}") from None

    def get(self, jalur: str, **param) -> dict:
        q = urllib.parse.urlencode({**{k: _nilai(v) for k, v in param.items()}, "access_token": self.token})
        return self._kirim(urllib.request.Request(f"{self.url}/{jalur}?{q}"))

    def post(self, jalur: str, data: dict, berkas: dict | None = None) -> dict:
        data = {**{k: _nilai(v) for k, v in data.items()}, "access_token": self.token}
        if not berkas:
            body = urllib.parse.urlencode(data).encode()
            req = urllib.request.Request(f"{self.url}/{jalur}", data=body)
            return self._kirim(req)
        batas = uuid.uuid4().hex
        bagian = []
        for k, v in data.items():
            bagian.append(f'--{batas}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
        for k, p in berkas.items():
            tipe = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
            kepala = f'--{batas}\r\nContent-Disposition: form-data; name="{k}"; filename="{p.name}"\r\nContent-Type: {tipe}\r\n\r\n'
            bagian += [kepala.encode(), p.read_bytes(), b"\r\n"]
        bagian.append(f"--{batas}--\r\n".encode())
        req = urllib.request.Request(f"{self.url}/{jalur}", data=b"".join(bagian))
        req.add_header("Content-Type", f"multipart/form-data; boundary={batas}")
        return self._kirim(req)


# --------------------------------------------------------------------------
# Perintah
# --------------------------------------------------------------------------
def cetak(ikon: str, teks: str) -> None:
    print(f"  {ikon} {teks}")


def perintah_cek(meta: Meta, b: dict, folder: Path) -> bool:
    ok = True
    print("Memeriksa koneksi dan akun...")
    try:
        me = meta.get("me", fields="id,name")
        cetak("[OK]", f"Token valid, masuk sebagai: {me.get('name', me.get('id'))}")
    except Galat as e:
        cetak("[GAGAL]", f"Token: {e}")
        return False

    akun = "act_" + str(b.get("akun_iklan_id", "")).replace("act_", "")
    try:
        a = meta.get(akun, fields="name,account_status,currency,timezone_name")
        status_ok = a.get("account_status") == 1
        cetak("[OK]" if status_ok else "[GAGAL]",
              f"Akun iklan '{a.get('name')}' ({a.get('currency')}, {a.get('timezone_name')}), "
              f"status {'AKTIF' if status_ok else a.get('account_status')}")
        ok &= status_ok
        if a.get("currency") not in ("IDR", None):
            cetak("[!]", f"Mata uang akun {a.get('currency')}. Periksa 'satuan_terkecil' di brief (IDR = 1, USD = 100).")
    except Galat as e:
        cetak("[GAGAL]", f"Akun iklan: {e}. Pastikan token punya akses ke akun ini (Bab 11).")
        return False

    try:
        pg = meta.get(str(b["page_id"]), fields="name")
        cetak("[OK]", f"Halaman: {pg.get('name')}")
    except Galat as e:
        cetak("[GAGAL]", f"Halaman: {e}. Tetapkan Halaman ke pengguna sistem (Bab 11).")
        ok = False

    if b.get("instagram_id"):
        try:
            ig = meta.get(f"{akun}/instagram_accounts", fields="id,username").get("data", [])
            cocok = [x for x in ig if str(x.get("id")) == str(b["instagram_id"])]
            cetak("[OK]" if cocok else "[GAGAL]",
                  f"Instagram: {cocok[0].get('username')}" if cocok else "Instagram tidak terhubung ke akun iklan ini (Bab 2).")
            ok &= bool(cocok)
        except Galat as e:
            cetak("[GAGAL]", f"Instagram: {e}")
            ok = False
    else:
        cetak("[!]", "instagram_id kosong: iklan hanya tayang di Facebook.")

    if b.get("pixel_id"):
        try:
            px = meta.get(f"{akun}/adspixels", fields="id,name").get("data", [])
            cocok = [x for x in px if str(x.get("id")) == str(b["pixel_id"])]
            cetak("[OK]" if cocok else "[GAGAL]",
                  f"Pixel: {cocok[0].get('name')}" if cocok else "Pixel tidak terhubung ke akun iklan ini (Bab 3).")
            ok &= bool(cocok)
        except Galat as e:
            cetak("[GAGAL]", f"Pixel: {e}")
            ok = False
    else:
        cetak("[!]", "pixel_id kosong: tidak ada pelacakan konversi.")

    masalah = validasi_brief(b, folder)
    for x in masalah:
        cetak("[GAGAL]", x)
    ok &= not masalah
    if not masalah:
        cetak("[OK]", "Brief lengkap dan batas belanja aman.")
    print("\nHASIL: " + ("SIAP diluncurkan." if ok else "Belum siap. Perbaiki baris [GAGAL] lebih dulu."))
    return ok


def simpan_hasil(folder: Path, hasil: dict) -> None:
    (folder / BERKAS_HASIL).write_text(json.dumps(hasil, indent=2, ensure_ascii=False), encoding="utf-8")


def muat_hasil(folder: Path) -> dict:
    p = folder / BERKAS_HASIL
    if not p.exists():
        raise Galat(f"Belum ada {BERKAS_HASIL}. Jalankan 'luncurkan' dulu.")
    return json.loads(p.read_text(encoding="utf-8"))


def perintah_luncurkan(meta: Meta, b: dict, folder: Path) -> dict:
    masalah = validasi_brief(b, folder)
    if masalah:
        raise Galat("Brief belum benar:\n  - " + "\n  - ".join(masalah))
    akun = "act_" + str(b["akun_iklan_id"]).replace("act_", "")
    hasil = {"akun": akun, "kampanye": None, "set_iklan": [], "iklan": []}

    print("1/4 Membuat kampanye (JEDA)...")
    hasil["kampanye"] = meta.post(f"{akun}/campaigns", muatan_kampanye(b))["id"]
    simpan_hasil(folder, hasil)

    print("2/4 Mengunggah materi...")
    media = {}
    for a in b["iklan"]:
        if a.get("jenis", "gambar") == "video":
            v = meta.post(f"{akun}/advideos", {"name": a["nama"]}, {"source": folder / a["file"]})
            id_video = v["id"]
            for _ in range(120):
                st = meta.get(id_video, fields="status").get("status", {}).get("video_status")
                if st == "ready":
                    break
                if st == "error":
                    raise Galat(f"Video '{a['nama']}' gagal diproses oleh Meta.")
                time.sleep(5)
            else:
                raise Galat(f"Video '{a['nama']}' belum siap setelah 10 menit. Coba lagi nanti.")
            sampul = meta.post(f"{akun}/adimages", {}, {"filename": folder / a["gambar_sampul"]})
            media[a["nama"]] = (None, id_video, list(sampul["images"].values())[0]["hash"])
        else:
            g = meta.post(f"{akun}/adimages", {}, {"filename": folder / a["file"]})
            media[a["nama"]] = (list(g["images"].values())[0]["hash"], None, None)
        print(f"    - {a['nama']} terunggah")

    print("3/4 Membuat materi iklan...")
    kreatif = {}
    for a in b["iklan"]:
        h, v, s = media[a["nama"]]
        kreatif[a["nama"]] = meta.post(f"{akun}/adcreatives", muatan_materi(b, a, h, v, s))["id"]

    print("4/4 Membuat set iklan dan iklan (JEDA)...")
    for s in b["set_iklan"]:
        id_set = meta.post(f"{akun}/adsets", muatan_set_iklan(b, s, hasil["kampanye"]))["id"]
        hasil["set_iklan"].append(id_set)
        simpan_hasil(folder, hasil)
        for a in b["iklan"]:
            id_iklan = meta.post(f"{akun}/ads", {
                "name": f"{a['nama']}__{s['nama']}", "adset_id": id_set,
                "creative": {"creative_id": kreatif[a["nama"]]}, "status": "PAUSED",
            })["id"]
            hasil["iklan"].append(id_iklan)
            simpan_hasil(folder, hasil)

    print(f"\nSELESAI. {len(hasil['set_iklan'])} set iklan dan {len(hasil['iklan'])} iklan dibuat, semuanya JEDA.")
    print("Periksa di Ads Manager (Pratinjau tiap iklan), lalu jalankan: aktifkan")
    print("Tautan: https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=" + akun.replace("act_", ""))
    return hasil


def _semua_id(hasil: dict, urutan_naik: bool) -> list[str]:
    ids = [hasil["kampanye"]] + hasil["set_iklan"] + hasil["iklan"]
    return ids if urutan_naik else list(reversed(ids))


def perintah_aktifkan(meta: Meta, folder: Path, yakin: bool) -> None:
    hasil = muat_hasil(folder)
    if not yakin:
        print("Ini akan MENYALAKAN kampanye, set iklan, dan iklan. Uang mulai terpakai setelah iklan lolos tinjauan.")
        if input("Ketik AKTIFKAN untuk melanjutkan: ").strip() != "AKTIFKAN":
            print("Dibatalkan. Tidak ada yang diubah.")
            return
    for i in _semua_id(hasil, True):
        meta.post(i, {"status": "ACTIVE"})
        print(f"  aktif: {i}")
    print("Selesai. Status 'Dalam proses' di awal adalah normal (tinjauan iklan). Cek lagi nanti dengan: status")


def perintah_jeda(meta: Meta, folder: Path) -> None:
    hasil = muat_hasil(folder)
    for i in _semua_id(hasil, False):
        meta.post(i, {"status": "PAUSED"})
        print(f"  jeda: {i}")
    print("Semua objek bot ini dijeda.")


def perintah_status(meta: Meta, folder: Path) -> None:
    hasil = muat_hasil(folder)
    for i in _semua_id(hasil, True):
        d = meta.get(i, fields="name,status,effective_status")
        print(f"  {d.get('name', i)}: {d.get('status')} / {d.get('effective_status')}")


# --------------------------------------------------------------------------
# Titik masuk
# --------------------------------------------------------------------------
def main(argv: list[str] | None = None) -> int:
    for aliran in (sys.stdout, sys.stderr):
        try:
            aliran.reconfigure(encoding="utf-8")
        except Exception:
            pass
    ap = argparse.ArgumentParser(description="Bot Peluncur Iklan Meta")
    ap.add_argument("perintah", choices=["cek", "rencana", "luncurkan", "aktifkan", "jeda", "status"])
    ap.add_argument("--brief", default="brief.json", help="berkas brief (default: brief.json)")
    ap.add_argument("--folder", default=str(FOLDER), help="folder kerja (berisi .env, brief, materi)")
    ap.add_argument("--ya", action="store_true", help="lewati pertanyaan konfirmasi")
    arg = ap.parse_args(argv)
    folder = Path(arg.folder)

    try:
        env = muat_env(folder)
        token = env.get("META_TOKEN", "")
        if arg.perintah != "rencana" and not token:
            raise Galat("META_TOKEN belum diisi di .env (lihat Bab 11).")
        meta = Meta(token, env.get("META_API_VERSION", VERSI_API), env.get("META_BASE_URL", BASE_URL))

        if arg.perintah in ("jeda", "status", "aktifkan"):
            if arg.perintah == "jeda":
                perintah_jeda(meta, folder)
            elif arg.perintah == "status":
                perintah_status(meta, folder)
            else:
                perintah_aktifkan(meta, folder, arg.ya)
            return 0

        b = muat_brief(folder / arg.brief)
        if arg.perintah == "rencana":
            masalah = validasi_brief(b, folder)
            if masalah:
                raise Galat("Brief belum benar:\n  - " + "\n  - ".join(masalah))
            print(rencana_teks(b))
            return 0
        if arg.perintah == "cek":
            return 0 if perintah_cek(meta, b, folder) else 1
        # luncurkan
        print(rencana_teks(b))
        if not arg.ya and input("\nBuat semuanya (JEDA) sekarang? Ketik YA: ").strip().upper() != "YA":
            print("Dibatalkan. Tidak ada yang dibuat.")
            return 0
        perintah_luncurkan(meta, b, folder)
        return 0
    except Galat as e:
        print(f"\n[GAGAL] {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
