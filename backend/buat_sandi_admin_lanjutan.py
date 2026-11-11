"""
Membuat hash kata sandi admin untuk API Kelas Lanjutan.

Pemakaian:
    python3 buat_sandi_admin_lanjutan.py            sandi acak dibuat otomatis
    python3 buat_sandi_admin_lanjutan.py --stdin    sandi dibaca dari stdin

Sandi sengaja TIDAK diterima sebagai argumen baris perintah: argumen terbaca
oleh pengguna lain di server lewat daftar proses (ps). Lewat stdin tidak.

Yang dicetak hanya baris untuk berkas lingkungan layanan. Sandinya sendiri
tidak pernah disimpan di server, hanya hash-nya.
"""
import secrets
import sys

from lanjutan_api import buat_hash

if "--stdin" in sys.argv[1:]:
    sandi = sys.stdin.read().strip()
    if not sandi:
        sys.stderr.write("ERROR: sandi kosong dari stdin.\n")
        raise SystemExit(1)
    buatan_sendiri = False
else:
    sandi = secrets.token_urlsafe(12)
    buatan_sendiri = True

# Hanya dicetak kalau memang dibuatkan di sini; sandi yang dikirim lewat stdin
# sudah dipegang pemanggilnya, tidak perlu dikembalikan ke layar.
if buatan_sendiri:
    print(f"SANDI={sandi}")
print(f"FMVD_ADMIN_HASH={buat_hash(sandi)}")
