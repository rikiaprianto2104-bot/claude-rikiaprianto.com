#!/usr/bin/env bash
# ============================================================================
#  pasang-api-explorer.sh — memasang/memperbarui API pendaftar Kelas Explorer
#                           di VPS lewat SSH (kredensial dari .env, sama seperti
#                           deploy.sh; pengguna non-root memakai sudo).
#
#  Jalankan dari folder app-main:   bash backend/deploy/pasang-api-explorer.sh
#
#  Yang dilakukan (aman diulang):
#    1. membuat pengguna sistem fmvd-explorer + folder database /var/lib/fmvd-explorer
#    2. menyalin explorer_api.py ke /opt/fmvd-explorer
#    3. membuat /etc/fmvd-explorer.env HANYA bila belum ada (nama pengguna admin +
#       hash sandi). Sandi baru disimpan ke .login-admin-explorer.txt di komputer
#       ini (diabaikan git) dan TIDAK dicetak ke layar; di server hanya ada hash.
#    4. memasang & menyalakan layanan systemd fmvd-explorer
#
#  TIDAK dilakukan otomatis: mengedit konfigurasi nginx. Sisipkan isi
#  backend/deploy/nginx-explorer-api.conf ke blok server situs, lalu
#  `nginx -t && systemctl reload nginx`.
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
ADMIN_USER="${EXPLORER_ADMIN_USER:-admin}"
BERKAS_LOGIN="$ROOT/.login-admin-explorer.txt"

echo "==> [1/4] Menyiapkan pengguna dan folder"
"${SSH[@]}" "$REMOTE" "
  id fmvd-explorer >/dev/null 2>&1 || ${RSUDO}useradd --system --home /var/lib/fmvd-explorer --shell /usr/sbin/nologin fmvd-explorer
  ${RSUDO}install -d -o fmvd-explorer -g fmvd-explorer -m 750 /var/lib/fmvd-explorer
  ${RSUDO}install -d -o root -g root -m 755 /opt/fmvd-explorer
"

echo "==> [2/4] Menyalin kode API"
"${SSH[@]}" "$REMOTE" 'rm -rf /tmp/fmvd-explorer-upload && mkdir -m 700 /tmp/fmvd-explorer-upload'
tar -C backend -cf - explorer_api.py buat_sandi_admin.py | "${SSH[@]}" "$REMOTE" 'tar -C /tmp/fmvd-explorer-upload -xf -'
"${SSH[@]}" "$REMOTE" "${RSUDO}install -o root -g root -m 644 /tmp/fmvd-explorer-upload/*.py /opt/fmvd-explorer/ && rm -rf /tmp/fmvd-explorer-upload"

echo "==> [3/4] Berkas lingkungan (login admin)"
if "${SSH[@]}" "$REMOTE" "${RSUDO}test -f /etc/fmvd-explorer.env"; then
  echo "    sudah ada, tidak diubah (hapus berkasnya di server untuk membuat sandi baru)"
else
  KELUARAN="$("${SSH[@]}" "$REMOTE" "cd /opt/fmvd-explorer && python3 buat_sandi_admin.py")"
  HASH_LINE="$(printf '%s\n' "$KELUARAN" | grep '^FMVD_ADMIN_HASH=')"
  SANDI_BARU="$(printf '%s\n' "$KELUARAN" | grep '^SANDI=' | cut -d= -f2-)"
  [[ -n "$HASH_LINE" && -n "$SANDI_BARU" ]] || { echo "ERROR: gagal membuat sandi admin" >&2; exit 1; }
  printf 'FMVD_ADMIN_USER=%s\n%s\nFMVD_DB=/var/lib/fmvd-explorer/pendaftar.db\nFMVD_HOST=127.0.0.1\nFMVD_PORT=8787\n' \
    "$ADMIN_USER" "$HASH_LINE" \
    | "${SSH[@]}" "$REMOTE" "umask 077 && cat > /tmp/fmvd-explorer.env && ${RSUDO}install -o root -g root -m 600 /tmp/fmvd-explorer.env /etc/fmvd-explorer.env && rm -f /tmp/fmvd-explorer.env"
  (umask 077; printf 'Login admin invoice Kelas Explorer (halaman /buat-invoice-explorer)\npengguna: %s\nsandi   : %s\n' "$ADMIN_USER" "$SANDI_BARU" > "$BERKAS_LOGIN")
  echo "    login admin dibuat; disimpan di: $BERKAS_LOGIN"
fi

echo "==> [4/4] Layanan systemd"
"${SSH[@]}" "$REMOTE" "cat > /tmp/fmvd-explorer.service && ${RSUDO}install -o root -g root -m 644 /tmp/fmvd-explorer.service /etc/systemd/system/fmvd-explorer.service && rm -f /tmp/fmvd-explorer.service" < backend/deploy/fmvd-explorer.service
"${SSH[@]}" "$REMOTE" "${RSUDO}systemctl daemon-reload && ${RSUDO}systemctl enable fmvd-explorer >/dev/null 2>&1 && ${RSUDO}systemctl restart fmvd-explorer && sleep 1 && ${RSUDO}systemctl is-active fmvd-explorer && curl -s http://127.0.0.1:8787/api/explorer/health"
echo
echo "SELESAI. Langkah berikutnya: pasang lokasi nginx (backend/deploy/nginx-explorer-api.conf) lalu deploy web (bash deploy.sh)."
