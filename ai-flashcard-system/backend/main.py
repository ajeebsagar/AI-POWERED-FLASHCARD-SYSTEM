"""
FastAPI entrypoint for the AI Flashcard System.

- Wires together the upload / quiz / speech routers.
- Loads the local Whisper model once at startup so the first request is fast.
- Configures CORS for the Next.js frontend.
"""

import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes import quiz, speech, upload
from services.whisper_service import whisper_service

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("flashcard-api")

BASE_DIR = Path(__file__).resolve().parent
(BASE_DIR / "uploads").mkdir(exist_ok=True)
(BASE_DIR / "audio").mkdir(exist_ok=True)

# A new ID is generated every time the process starts. The frontend stores the
# last-seen ID and wipes its localStorage when this changes, so a server
# restart effectively resets the user's data — matching the requested
# "data lives only as long as the server is alive" behaviour.
SERVER_SESSION_ID = uuid.uuid4().hex
SERVER_STARTED_AT = datetime.now(timezone.utc).isoformat()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Warm up Whisper so the first /speech-to-text call is not 10s slower than the rest.
    logger.info("Pre-loading local Whisper model...")
    try:
        whisper_service.get_model()
        logger.info("Whisper model ready.")
    except Exception as exc:  # noqa: BLE001 — log + continue, /speech will surface error
        logger.warning("Whisper pre-load failed (will retry on first request): %s", exc)
    yield


app = FastAPI(
    title="AI Flashcard System",
    description="Local-first flashcard quiz API with Whisper STT + RapidFuzz grading.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — the Next.js dev server runs on http://localhost:3000 by default.
cors_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    # Convert any uncaught error into a clean JSON shape — keeps the frontend simple.
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error", "detail": str(exc)},
    )


app.include_router(upload.router, tags=["Upload"])
app.include_router(quiz.router, tags=["Quiz"])
app.include_router(speech.router, tags=["Speech"])


@app.get("/")
async def root():
    return {
        "name": "AI Flashcard System API",
        "status": "ok",
        "endpoints": [
            "/upload-csv",
            "/check-answer",
            "/speech-to-text",
            "/health",
            "/session",
        ],
    }


@app.get("/session")
async def session():
    """Returns the current server-session ID.

    The frontend compares this with the value it has cached in localStorage; a
    mismatch means the backend was restarted, so the frontend wipes its data.
    """
    return {"session_id": SERVER_SESSION_ID, "started_at": SERVER_STARTED_AT}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "whisper_loaded": whisper_service.is_loaded(),
        "whisper_model": whisper_service.model_name,
        "session_id": SERVER_SESSION_ID,
        "started_at": SERVER_STARTED_AT,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("APP_HOST", "0.0.0.0"),
        port=int(os.getenv("APP_PORT", "8000")),
        reload=True,
    )
