import os
import time
import logging
import logging.handlers

from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import create_db_and_tables
from routers import auth_router, events, tasks, admin, chat

load_dotenv()

# ── Logging setup ─────────────────────────────────────────
os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(),
        logging.handlers.RotatingFileHandler(
            "logs/app.log",
            maxBytes=5 * 1024 * 1024,  # 5 MB
            backupCount=3,
            encoding="utf-8",
        ),
    ],
)

logger = logging.getLogger("euslugi")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    logger.info("━━━ еУслуги API starting up ━━━")
    create_db_and_tables()
    logger.info("Database tables verified/created.")
    yield
    logger.info("━━━ еУслуги API shutting down ━━━")


app = FastAPI(
    title="еУслуги — Life Event Assistant API",
    description="Backend API за AI-Powered Life Event Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Request timing & logging middleware ───────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = None
    try:
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s → %d (%.1f ms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response
    except Exception as exc:
        duration_ms = (time.perf_counter() - start) * 1000
        logger.error(
            "%s %s → 500 (%.1f ms) | Exception: %s",
            request.method,
            request.url.path,
            duration_ms,
            str(exc),
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Внатрешна грешка на серверот"},
        )

# ── CORS ─────────────────────────────────────────────────
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(events.router)
app.include_router(tasks.router)
app.include_router(admin.router)
app.include_router(chat.router)


# ── Health check ─────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "message": "еУслуги API работи", "version": "1.0.0"}
