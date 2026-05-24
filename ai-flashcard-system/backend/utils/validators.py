"""Validators for incoming files."""

import os
from typing import Iterable

from fastapi import HTTPException, UploadFile, status

CSV_EXTENSIONS = {".csv"}
AUDIO_EXTENSIONS = {".webm", ".wav", ".mp3", ".m4a", ".ogg", ".flac", ".mp4"}

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "10"))
MAX_AUDIO_MB = int(os.getenv("MAX_AUDIO_MB", "25"))


def _extension(filename: str) -> str:
    return os.path.splitext(filename or "")[1].lower()


def _require_extension(filename: str, allowed: Iterable[str], kind: str) -> None:
    if _extension(filename) not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported {kind} type. Allowed: {sorted(allowed)}",
        )


def validate_csv(file: UploadFile) -> None:
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No CSV file was uploaded.",
        )
    _require_extension(file.filename, CSV_EXTENSIONS, "CSV file")


def validate_audio(file: UploadFile) -> None:
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file was uploaded.",
        )
    _require_extension(file.filename, AUDIO_EXTENSIONS, "audio file")


def enforce_size(bytes_read: int, kind: str = "file") -> None:
    limit_mb = MAX_AUDIO_MB if kind == "audio" else MAX_UPLOAD_MB
    if bytes_read > limit_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"{kind.capitalize()} exceeds the {limit_mb} MB limit.",
        )
