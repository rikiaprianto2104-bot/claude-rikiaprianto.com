"""
Membuat hash kata sandi admin untuk API Kelas Explorer.

Pemakaian:
    python buat_sandi_admin.py              (sandi acak dibuat otomatis)
    python buat_sandi_admin.py "sandiAnda"  (pakai sandi sendiri)

Yang dicetak adalah baris untuk berkas lingkungan layanan. Sandinya sendiri
tidak disimpan di server, hanya hash-nya.
"""
import secrets
import sys

from explorer_api import buat_hash

sandi = sys.argv[1] if len(sys.argv) > 1 else secrets.token_urlsafe(12)
print(f"SANDI={sandi}")
print(f"FMVD_ADMIN_HASH={buat_hash(sandi)}")
