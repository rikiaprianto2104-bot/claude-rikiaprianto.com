from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import time
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Konfigurasi
# ---------------------------------------------------------------------------
# ENVIRONMENT=production akan: menyembunyikan /docs & /redoc, menolak CORS "*",
# dan menyembunyikan detail error dari respons.
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development').lower()
IS_PRODUCTION = ENVIRONMENT == 'production'

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Dokumentasi otomatis FastAPI membocorkan seluruh peta endpoint & skema data.
# Berguna saat development, tidak perlu dibuka ke publik.
app = FastAPI(
    title="rikiaprianto.com API",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    # extra="forbid": tolak field yang tidak dikenal, jangan diam-diam diabaikan.
    # max_length: tanpa batas, satu request bisa menulis megabyte ke database.
    model_config = ConfigDict(extra="forbid")

    client_name: str = Field(min_length=1, max_length=120)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

# Include the router in the main app
app.include_router(api_router)


# ---------------------------------------------------------------------------
# Middleware keamanan
# ---------------------------------------------------------------------------
# Catatan: middleware Starlette dijalankan dalam urutan TERBALIK dari urutan
# penambahan — yang ditambahkan terakhir berjalan paling luar (paling dulu).

# 1. Header keamanan pada setiap respons API.
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    # Respons API tidak pernah perlu dieksekusi sebagai halaman.
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    response.headers["Cache-Control"] = "no-store"
    return response


# 2. Rate limit sederhana per alamat IP.
#    /api/status adalah endpoint TULIS tanpa autentikasi: siapa pun bisa
#    mengirim POST berulang-ulang sampai database penuh. Batas ini menahan
#    penyalahgunaan dasar. Untuk perlindungan sungguhan di produksi, pakai
#    reverse proxy (nginx limit_req / Cloudflare) atau slowapi + Redis, karena
#    hitungan in-memory ini hilang saat restart dan tidak dibagi antar worker.
RATE_LIMIT_MAX_REQUESTS = int(os.environ.get('RATE_LIMIT_MAX_REQUESTS', '60'))
RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get('RATE_LIMIT_WINDOW_SECONDS', '60'))
_rate_buckets = {}


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    if not request.url.path.startswith("/api"):
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    window_start = now - RATE_LIMIT_WINDOW_SECONDS

    hits = [t for t in _rate_buckets.get(client_ip, []) if t > window_start]

    if len(hits) >= RATE_LIMIT_MAX_REQUESTS:
        _rate_buckets[client_ip] = hits
        logger.warning("Rate limit terlampaui untuk %s pada %s", client_ip, request.url.path)
        return JSONResponse(
            status_code=429,
            content={"detail": "Terlalu banyak permintaan. Coba lagi sebentar lagi."},
            headers={"Retry-After": str(RATE_LIMIT_WINDOW_SECONDS)},
        )

    hits.append(now)
    _rate_buckets[client_ip] = hits

    # Buang IP yang sudah tidak aktif supaya dict tidak tumbuh tanpa batas
    # (kalau dibiarkan, ini sendiri jadi celah kehabisan memori).
    if len(_rate_buckets) > 10_000:
        stale = [ip for ip, ts in _rate_buckets.items() if not ts or max(ts) <= window_start]
        for ip in stale:
            _rate_buckets.pop(ip, None)

    return await call_next(request)


# 3. CORS.
#    SEBELUMNYA: allow_origins=["*"] + allow_credentials=True. Kombinasi itu
#    dilarang spesifikasi CORS, dan maksudnya: situs mana pun boleh memanggil
#    API ini sambil membawa cookie pengguna.
#    SEKARANG: daftar origin harus disebut eksplisit lewat CORS_ORIGINS.
_raw_origins = os.environ.get('CORS_ORIGINS', '')
allowed_origins = [o.strip() for o in _raw_origins.split(',') if o.strip() and o.strip() != '*']

if not allowed_origins:
    if IS_PRODUCTION:
        raise RuntimeError(
            'CORS_ORIGINS wajib diisi daftar domain eksplisit saat ENVIRONMENT=production, '
            'contoh: CORS_ORIGINS="https://rikiaprianto.com,https://www.rikiaprianto.com"'
        )
    allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    logger.warning("CORS_ORIGINS kosong — memakai default development: %s", allowed_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,
)

# 4. Tolak request dengan Host header asing (anti Host-header poisoning /
#    cache poisoning). ALLOWED_HOSTS dipisah koma; kosong = tidak diaktifkan.
_allowed_hosts = [h.strip() for h in os.environ.get('ALLOWED_HOSTS', '').split(',') if h.strip()]
if _allowed_hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=_allowed_hosts)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Jangan kirim stack trace / pesan exception ke klien: itu membocorkan
    # path file, versi library, dan struktur internal. Catat di log saja.
    logger.exception("Unhandled error pada %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
