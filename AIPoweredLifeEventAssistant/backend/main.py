import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables
from routers import auth_router, events, tasks, admin, chat

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    create_db_and_tables()
    yield


app = FastAPI(
    title="еУслуги — Life Event Assistant API",
    description="Backend API за AI-Powered Life Event Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
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
    return {"status": "ok", "message": "еУслуги API работи"}
