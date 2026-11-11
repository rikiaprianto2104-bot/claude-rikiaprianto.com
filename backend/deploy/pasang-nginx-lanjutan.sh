#!/usr/bin/env bash
# ============================================================================
#  pasang-nginx-lanjutan.sh — menyisipkan lokasi /api/lanjutan/ ke konfigurasi
#                             nginx situs, lalu menguji dan memuat ulang nginx.
#
#  Jalankan dari folder app-main:  bash backend/deploy/pasang-nginx-lanjutan.sh
#
#  Aman diulang: kalau lokasinya sudah ada, skrip berhenti tanpa mengubah apa
#  pun. Konfigurasi lama selalu dicadangkan lebih dulu, dan kalau `nginx -t`
#  menolak hasil suntingannya, cadangan itu dikembalikan sebelum nginx sempat
#  dimuat ulang — jadi situs tidak pernah ditinggalkan dengan konfigurasi rusak.
#
#  Blok lokasi /api/explorer/ dipakai sebagai penanda tempat menyisipkan,
#  karena ia sudah pasti berada di dalam blok server situs yang benar.
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
[[ -f .env ]] || { echo "ERROR: .env tidak ditemukan di $ROOT" >&2; exit 1; }
set -a; . ./.env; set +a
: "${SFTP_HOST:?}" "${SFTP_PORT:?}" "${SFTP_USER:?}" "${SFTP_KEY:?}"

SSH=(ssh -p "$SFTP_PORT" -i "$SFTP_KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=20)
REMOTE="$SFTP_USER@$SFTP_HOST"
RSUDO=""
[[ "${SFTP_SUDO:-0}" == "1" ]] && RSUDO="sudo "

echo "==> Mengirim blok lokasi dan menyisipkannya di server"
"${SSH[@]}" "$REMOTE" "cat > /tmp/nginx-lanjutan-api.conf" < backend/deploy/nginx-lanjutan-api.conf

"${SSH[@]}" "$REMOTE" "
set -eu

BERKAS=\$(${RSUDO}grep -rl 'location ^~ /api/explorer/' /etc/nginx/sites-available /etc/nginx/conf.d 2>/dev/null | head -1)
if [ -z \"\$BERKAS\" ]; then
  echo 'ERROR: tidak menemukan blok /api/explorer/ di konfigurasi nginx.' >&2
  echo 'Sisipkan isi backend/deploy/nginx-lanjutan-api.conf secara manual.' >&2
  exit 1
fi
echo \"    berkas konfigurasi: \$BERKAS\"

if ${RSUDO}grep -q 'location ^~ /api/lanjutan/' \"\$BERKAS\"; then
  echo '    lokasi /api/lanjutan/ sudah ada, tidak diubah.'
  exit 0
fi

CADANGAN=\"\$BERKAS.bak-\$(date +%Y%m%d%H%M%S)\"
${RSUDO}cp -p \"\$BERKAS\" \"\$CADANGAN\"
echo \"    cadangan: \$CADANGAN\"

# Sisipkan tepat sebelum baris penanda. Urutan antar-lokasi tidak penting bagi
# nginx, yang penting berada di dalam blok server yang sama.
BARIS=\$(${RSUDO}grep -n 'location ^~ /api/explorer/' \"\$BERKAS\" | head -1 | cut -d: -f1)
${RSUDO}awk -v baris=\"\$BARIS\" -v sisipan=/tmp/nginx-lanjutan-api.conf '
  NR == baris { while ((getline baris_baru < sisipan) > 0) print baris_baru; print \"\" }
  { print }
' \"\$CADANGAN\" > /tmp/nginx-situs-baru.conf
${RSUDO}install -o root -g root -m 644 /tmp/nginx-situs-baru.conf \"\$BERKAS\"
rm -f /tmp/nginx-situs-baru.conf /tmp/nginx-lanjutan-api.conf

if ${RSUDO}nginx -t; then
  ${RSUDO}systemctl reload nginx
  echo '    nginx diuji dan dimuat ulang.'
else
  echo 'ERROR: nginx menolak konfigurasi baru. Mengembalikan cadangan.' >&2
  ${RSUDO}cp -p \"\$CADANGAN\" \"\$BERKAS\"
  exit 1
fi
"

echo
echo "SELESAI. Uji dari luar:  curl -s https://rikiaprianto.com/api/lanjutan/kursi"
