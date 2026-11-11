#!/usr/bin/env bash
# ============================================================================
#  pasang-api-lanjutan.sh — memasang/memperbarui API pendaftar Kelas Lanjutan
#                           di VPS lewat SSH (kredensial dari .env, sama seperti
#                           deploy.sh; pengguna non-root memakai sudo).
#
#  Jalankan dari folder app-main:   bash backend/deploy/pasang-api-lanjutan.sh
#
#  Yang dilakukan (aman diulang):
#    1. membuat pengguna sistem fmvd-lanjutan + folder database /var/lib/fmvd-lanjutan
#    2. menyalin lanjutan_api.py ke /opt/fmvd-lanjutan
#    3. membuat /etc/fmvd-lanjutan.env HANYA bila belum ada (nama pengguna admin +
#       hash sandi). Sandi baru disimpan ke .login-admin-lanjutan.txt di komputer
#       ini (diabaikan git) dan TIDAK dicetak ke layar; di server hanya ada hash.
#    4. memasang & menyalakan layanan systemd fmvd-lanjutan
#
#  TIDAK dilakukan otomatis: mengedit konfigurasi nginx. Sisipkan isi
#  backend/deploy/nginx-lanjutan-api.conf ke blok server situs, lalu
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
ADMIN_USER="${LANJUTAN_ADMIN_USER:-admin}"
BERKAS_LOGIN="$ROOT/.login-admin-lanjutan.txt"

echo "==> [1/4] Menyiapkan pengguna dan folder"
"${SSH[@]}" "$REMOTE" "
  id fmvd-lanjutan >/dev/null 2>&1 || ${RSUDO}useradd --system --home /var/lib/fmvd-lanjutan --shell /usr/sbin/nologin fmvd-lanjutan
  ${RSUDO}install -d -o fmvd-lanjutan -g fmvd-lanjutan -m 750 /var/lib/fmvd-lanjutan
  ${RSUDO}install -d -o root -g root -m 755 /opt/fmvd-lanjutan
"

echo "==> [2/4] Menyalin kode API"
"${SSH[@]}" "$REMOTE" 'rm -rf /tmp/fmvd-lanjutan-upload && mkdir -m 700 /tmp/fmvd-lanjutan-upload'
tar -C backend -cf - lanjutan_api.py buat_sandi_admin_lanjutan.py | "${SSH[@]}" "$REMOTE" 'tar -C /tmp/fmvd-lanjutan-upload -xf -'
"${SSH[@]}" "$REMOTE" "${RSUDO}install -o root -g root -m 644 /tmp/fmvd-lanjutan-upload/*.py /opt/fmvd-lanjutan/ && rm -rf /tmp/fmvd-lanjutan-upload"

echo "==> [3/4] Berkas lingkungan (login admin)"
if "${SSH[@]}" "$REMOTE" "${RSUDO}test -f /etc/fmvd-lanjutan.env"; then
  echo "    sudah ada, tidak diubah (hapus berkasnya di server untuk membuat sandi baru)"
else
  # Sandi boleh ditentukan sendiri lewat LANJUTAN_ADMIN_SANDI di .env. Kalau
  # kosong, server membuatkan sandi acak. Sandinya dikirim lewat stdin, bukan
  # sebagai argumen, supaya tidak terbaca pengguna lain di daftar proses server.
  if [[ -n "${LANJUTAN_ADMIN_SANDI:-}" ]]; then
    KIRIM_SANDI="cd /opt/fmvd-lanjutan && python3 buat_sandi_admin_lanjutan.py --stdin"
    HASH_LINE="$(printf %s "$LANJUTAN_ADMIN_SANDI" | "${SSH[@]}" "$REMOTE" "$KIRIM_SANDI" | grep '^FMVD_ADMIN_HASH=')"
    SANDI_BARU="(sandi yang Anda tentukan sendiri di .env)"
  else
    KELUARAN="$("${SSH[@]}" "$REMOTE" "cd /opt/fmvd-lanjutan && python3 buat_sandi_admin_lanjutan.py")"
    HASH_LINE="$(grep '^FMVD_ADMIN_HASH=' <<< "$KELUARAN")"
    SANDI_BARU="$(grep '^SANDI=' <<< "$KELUARAN" | cut -d= -f2-)"
  fi
  [[ -n "$HASH_LINE" && -n "$SANDI_BARU" ]] || { echo "ERROR: gagal membuat sandi admin" >&2; exit 1; }
  printf 'FMVD_ADMIN_USER=%s\n%s\nFMVD_DB=/var/lib/fmvd-lanjutan/invoice.db\nFMVD_HOST=127.0.0.1\nFMVD_PORT=8788\n' \
    "$ADMIN_USER" "$HASH_LINE" \
    | "${SSH[@]}" "$REMOTE" "umask 077 && cat > /tmp/fmvd-lanjutan.env && ${RSUDO}install -o root -g root -m 600 /tmp/fmvd-lanjutan.env /etc/fmvd-lanjutan.env && rm -f /tmp/fmvd-lanjutan.env"
  (umask 077; printf 'Login admin invoice Kelas Lanjutan (halaman /buat-invoice)\npengguna: %s\nsandi   : %s\n' "$ADMIN_USER" "$SANDI_BARU" > "$BERKAS_LOGIN")
  echo "    login admin dibuat; disimpan di: $BERKAS_LOGIN"
fi

echo "==> [4/4] Layanan systemd"
"${SSH[@]}" "$REMOTE" "cat > /tmp/fmvd-lanjutan.service && ${RSUDO}install -o root -g root -m 644 /tmp/fmvd-lanjutan.service /etc/systemd/system/fmvd-lanjutan.service && rm -f /tmp/fmvd-lanjutan.service" < backend/deploy/fmvd-lanjutan.service
"${SSH[@]}" "$REMOTE" "${RSUDO}systemctl daemon-reload && ${RSUDO}systemctl enable fmvd-lanjutan >/dev/null 2>&1 && ${RSUDO}systemctl restart fmvd-lanjutan && sleep 1 && ${RSUDO}systemctl is-active fmvd-lanjutan && curl -s http://127.0.0.1:8788/api/lanjutan/health"
echo
echo "SELESAI. Langkah berikutnya: pasang lokasi nginx (backend/deploy/nginx-lanjutan-api.conf) lalu deploy web (bash deploy.sh)."
