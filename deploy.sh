#!/usr/bin/env bash
# ============================================================================
#  deploy.sh — build frontend React lalu unggah SELURUH isi frontend/build/
#              ke Hostinger (public_html) lewat SSH/SFTP.
#
#  Jalankan dari folder mana pun:   bash deploy.sh
#  Kredensial dibaca dari file .env di folder yang sama (JANGAN di-commit).
#
#  Butuh: bash, node/npm, ssh, tar, gzip  (semuanya sudah ada di Git Bash).
# ============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# 0. Lokasi & konfigurasi
# ---------------------------------------------------------------------------
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "ERROR: file .env tidak ditemukan di $ROOT" >&2
  exit 1
fi
set -a; . ./.env; set +a

: "${SFTP_HOST:?SFTP_HOST belum diisi di .env}"
: "${SFTP_PORT:?SFTP_PORT belum diisi di .env}"
: "${SFTP_USER:?SFTP_USER belum diisi di .env}"
: "${SFTP_PASSWORD:?SFTP_PASSWORD belum diisi di .env}"
: "${SFTP_REMOTE_PATH:?SFTP_REMOTE_PATH belum diisi di .env}"

FRONTEND_DIR="$ROOT/frontend"
BUILD_DIR="$FRONTEND_DIR/build"
# Set DEPLOY_CLEAN=1 untuk MENGHAPUS dulu semua isi folder remote sebelum unggah.
DEPLOY_CLEAN="${DEPLOY_CLEAN:-0}"

# ---------------------------------------------------------------------------
# 1. Build React (frontend/ -> frontend/build/)
# ---------------------------------------------------------------------------
echo "==> [1/3] Build frontend (npm run build)…"
( cd "$FRONTEND_DIR" && CI=false GENERATE_SOURCEMAP=false npm run build )

# Pastikan .htaccess ikut (CRA meng-copy public/ ke build/, ini hanya pengaman)
if [[ -f "$FRONTEND_DIR/public/.htaccess" ]]; then
  cp -f "$FRONTEND_DIR/public/.htaccess" "$BUILD_DIR/.htaccess"
fi

if [[ ! -f "$BUILD_DIR/index.html" ]]; then
  echo "ERROR: build gagal — $BUILD_DIR/index.html tidak ada." >&2
  exit 1
fi
FILE_COUNT="$(find "$BUILD_DIR" -type f | wc -l | tr -d ' ')"
echo "    build OK — $FILE_COUNT file di $BUILD_DIR"

# ---------------------------------------------------------------------------
# 2. Autentikasi SSH pakai password tanpa prompt (SSH_ASKPASS)
# ---------------------------------------------------------------------------
ASKPASS="$(mktemp)"
printf '#!/usr/bin/env bash\nprintf "%%s\\n" "$SFTP_PASSWORD"\n' > "$ASKPASS"
chmod +x "$ASKPASS"
trap 'rm -f "$ASKPASS"' EXIT

export SFTP_PASSWORD
export SSH_ASKPASS="$ASKPASS"
export SSH_ASKPASS_REQUIRE=force      # OpenSSH >= 8.4: selalu pakai askpass
export DISPLAY="${DISPLAY:-:0}"

SSH=(ssh
  -p "$SFTP_PORT"
  -o StrictHostKeyChecking=accept-new
  -o PubkeyAuthentication=no
  -o PreferredAuthentications=password
  -o NumberOfPasswordPrompts=1
  -o ConnectTimeout=20
)
REMOTE="$SFTP_USER@$SFTP_HOST"

# ---------------------------------------------------------------------------
# 3. Unggah: stream tar dari build/ dan ekstrak di server
# ---------------------------------------------------------------------------
echo "==> [2/3] Cek koneksi ke $REMOTE:$SFTP_PORT…"
"${SSH[@]}" "$REMOTE" "echo connected as \$(whoami) && test -d '$SFTP_REMOTE_PATH' || mkdir -p '$SFTP_REMOTE_PATH'"

if [[ "$DEPLOY_CLEAN" == "1" ]]; then
  echo "    DEPLOY_CLEAN=1 — mengosongkan $SFTP_REMOTE_PATH lebih dulu"
  "${SSH[@]}" "$REMOTE" "find '$SFTP_REMOTE_PATH' -mindepth 1 -maxdepth 1 -exec rm -rf {} +"
fi

echo "==> [3/3] Mengunggah $BUILD_DIR  ->  $REMOTE:$SFTP_REMOTE_PATH"
tar -C "$BUILD_DIR" -czf - . \
  | "${SSH[@]}" "$REMOTE" "mkdir -p '$SFTP_REMOTE_PATH' && tar -C '$SFTP_REMOTE_PATH' -xzf - && echo '    ekstrak selesai'"

echo
echo "==> SELESAI. Live: https://$SFTP_HOST/  (atau domain yang mengarah ke public_html)"
