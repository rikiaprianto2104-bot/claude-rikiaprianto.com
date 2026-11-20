#!/usr/bin/env python3
"""Membuat paket untuk pembeli: dist/Paket-Sistem-Iklan-Meta-AI.zip

Isi zip:
  1-PANDUAN-PASANG.html          (Produk 1, gambar sudah tersemat)
  2-SISTEM-IKLAN/CLAUDE.md       (Produk 2, dimasukkan ke folder kerja pembeli)
  2-SISTEM-IKLAN/materi/BACA-INI.txt

Jalankan setelah produk-1-panduan/bangun_panduan.py. Zip tidak memuat apa pun dari arsip/,
token, atau berkas pribadi.
"""
import subprocess
import sys
import zipfile
from pathlib import Path

DIR = Path(__file__).resolve().parent
KELUAR = DIR / "dist" / "Paket-Sistem-Iklan-Meta-AI.zip"


def main() -> int:
    subprocess.run([sys.executable, str(DIR / "produk-1-panduan" / "bangun_panduan.py")], check=True)
    panduan = DIR / "produk-1-panduan" / "panduan-pasang.html"
    isi = {
        "1-PANDUAN-PASANG.html": panduan,
        "2-SISTEM-IKLAN/CLAUDE.md": DIR / "produk-2-sistem-iklan" / "CLAUDE.md",
        "2-SISTEM-IKLAN/materi/BACA-INI.txt": DIR / "produk-2-sistem-iklan" / "materi" / "BACA-INI.txt",
    }
    for nama, p in isi.items():
        if not p.exists():
            print(f"GAGAL: {p} tidak ada")
            return 1
    if "TANGKAPAN LAYAR BELUM ADA" in panduan.read_text(encoding="utf-8"):
        print("PERINGATAN: panduan masih punya gambar yang belum ada (kotak kuning). Lengkapi dulu sebelum dijual.")
    KELUAR.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(KELUAR, "w", zipfile.ZIP_DEFLATED) as z:
        for nama, p in isi.items():
            z.write(p, nama)
    print(f"OK: {KELUAR} ({KELUAR.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
