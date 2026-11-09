#!/usr/bin/env bash
# ============================================================================
#  deploy.sh — build frontend React lalu unggah SELURUH isi frontend/build/
#              ke VPS Hostinger (nginx, /var/www/rikiaprianto/public_html)
#              lewat SSH.
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
# Login: SFTP_KEY (path private key, disarankan) ATAU SFTP_PASSWORD.
if [[ -z "${SFTP_KEY:-}" ]]; then
  : "${SFTP_PASSWORD:?isi SFTP_KEY (path private key) atau SFTP_PASSWORD di .env}"
fi
# Opsional: SFTP_REMOTE_OWNER (mis. www-data:www-data) = pemilik file hasil unggah.
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
# Folder /projects/ punya CSP sendiri yang lebih longgar (halaman game memakai
# skrip inline). Tanpa file ini, ke-22 game mewarisi CSP ketat dari root dan
# semuanya berhenti jalan.
if [[ -f "$FRONTEND_DIR/public/projects/.htaccess" ]]; then
  mkdir -p "$BUILD_DIR/projects"
  cp -f "$FRONTEND_DIR/public/projects/.htaccess" "$BUILD_DIR/projects/.htaccess"
fi
# Folder /pixi/ juga punya .htaccess sendiri: membuka mikrofon (dimatikan untuk
# seluruh situs oleh Permissions-Policy root) dan mengizinkan skrip inline.
# Tanpa file ini, tombol "Tahan & bicara" mati dan halaman Pixi tidak jalan.
if [[ -f "$FRONTEND_DIR/public/pixi/.htaccess" ]]; then
  mkdir -p "$BUILD_DIR/pixi"
  cp -f "$FRONTEND_DIR/public/pixi/.htaccess" "$BUILD_DIR/pixi/.htaccess"
fi

if [[ ! -f "$BUILD_DIR/index.html" ]]; then
  echo "ERROR: build gagal — $BUILD_DIR/index.html tidak ada." >&2
  exit 1
fi
FILE_COUNT="$(find "$BUILD_DIR" -type f | wc -l | tr -d ' ')"
echo "    build OK — $FILE_COUNT file di $BUILD_DIR"

# ---------------------------------------------------------------------------
# 2. Autentikasi SSH: pakai kunci (SFTP_KEY) kalau ada, kalau tidak password
#    tanpa prompt (SSH_ASKPASS)
# ---------------------------------------------------------------------------
if [[ -n "${SFTP_KEY:-}" ]]; then
  [[ -f "$SFTP_KEY" ]] || { echo "ERROR: SFTP_KEY tidak ditemukan: $SFTP_KEY" >&2; exit 1; }
  SSH=(ssh
    -p "$SFTP_PORT"
    -i "$SFTP_KEY"
    -o IdentitiesOnly=yes
    -o BatchMode=yes
    -o StrictHostKeyChecking=accept-new
    -o ConnectTimeout=20
  )
else
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
fi

REMOTE="$SFTP_USER@$SFTP_HOST"
# Bila login memakai pengguna non-root (root SSH dimatikan di server), perintah
# yang menyentuh docroot dijalankan lewat sudo.
RSUDO=""
[[ "${SFTP_SUDO:-0}" == "1" ]] && RSUDO="sudo "

# ---------------------------------------------------------------------------
# 3. Unggah: stream tar dari build/ dan ekstrak di server
# ---------------------------------------------------------------------------
echo "==> [2/3] Cek koneksi ke $REMOTE:$SFTP_PORT…"
"${SSH[@]}" "$REMOTE" "echo connected as \$(whoami) && (test -d '$SFTP_REMOTE_PATH' || ${RSUDO}mkdir -p '$SFTP_REMOTE_PATH')"

if [[ "$DEPLOY_CLEAN" == "1" ]]; then
  echo "    DEPLOY_CLEAN=1 — mengosongkan $SFTP_REMOTE_PATH lebih dulu"
  "${SSH[@]}" "$REMOTE" "${RSUDO}find '$SFTP_REMOTE_PATH' -mindepth 1 -maxdepth 1 -exec rm -rf {} +"
fi

echo "==> [3/3] Mengunggah $BUILD_DIR  ->  $REMOTE:$SFTP_REMOTE_PATH"
tar -C "$BUILD_DIR" -czf - . \
  | "${SSH[@]}" "$REMOTE" "${RSUDO}mkdir -p '$SFTP_REMOTE_PATH' && ${RSUDO}tar -C '$SFTP_REMOTE_PATH' -xzf - && echo '    ekstrak selesai'"

# tar dari Windows membawa nomor pemilik file yang asing di server. Rapikan
# hanya entri milik build (folder lain di docroot, mis. fmvd-media, tidak disentuh).
if [[ -n "${SFTP_REMOTE_OWNER:-}" ]]; then
  ITEMS="$(cd "$BUILD_DIR" && ls -A | tr '\n' ' ')"
  "${SSH[@]}" "$REMOTE" "cd '$SFTP_REMOTE_PATH' && ${RSUDO}chown '$SFTP_REMOTE_OWNER' . && ${RSUDO}chown -R '$SFTP_REMOTE_OWNER' $ITEMS && echo '    pemilik file dirapikan ($SFTP_REMOTE_OWNER)'"
fi

echo
echo "==> SELESAI. Cek: https://rikiaprianto.com/"
