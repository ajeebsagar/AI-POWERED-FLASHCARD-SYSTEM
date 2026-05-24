"""POST /speech-to-text — transcribe an uploaded audio blob with local Whisper."""

import asyncio
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from models.response_models import TranscriptionResponse
from services.whisper_service import whisper_service
from utils.validators import enforce_size, validate_audio

router = APIRouter()

AUDIO_DIR = Path(__file__).resolve().parent.parent / "audio"
AUDIO_DIR.mkdir(exist_ok=True)


@router.post("/speech-to-text", response_model=TranscriptionResponse)
async def speech_to_text(file: UploadFile = File(...)) -> TranscriptionResponse:
    validate_audio(file)

    raw = await file.read()
    enforce_size(len(raw), kind="audio")
    if not raw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is empty — please record again.",
        )

    suffix = os.path.splitext(file.filename)[1].lower() or ".webm"
    tmp_path = AUDIO_DIR / f"rec_{uuid.uuid4().hex}{suffix}"
    tmp_path.write_bytes(raw)

    try:
        # Whisper is CPU-heavy and can block the event loop, so run it in a thread to keep the API responsive.
        result = await asyncio.to_thread(whisper_service.transcribe, tmp_path)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except OSError:
            pass  # Best-effort cleanup; not fatal.

    transcript = str(result.get("transcript", "")).strip()
    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No speech detected — try speaking more clearly or closer to the mic.",
        )

    return TranscriptionResponse(
        success=True,
        transcript=transcript,
        language=result.get("language"),
        duration=result.get("duration"),
    )
