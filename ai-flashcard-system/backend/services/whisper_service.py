"""Wrapper around the local Whisper model.

Loads the model lazily (and only once) so we don't pay the 1-3s load cost on
every transcription request. The whole module is intentionally synchronous —
the route handler runs it in a thread pool so the event loop stays free.
"""

import logging
import os
import threading
from pathlib import Path
from typing import Dict, Optional

import whisper

logger = logging.getLogger("whisper-service")


class WhisperService:
    def __init__(self, model_name: str = "base") -> None:
        self.model_name = model_name
        self._model: Optional[whisper.Whisper] = None
        self._lock = threading.Lock()

    def get_model(self) -> whisper.Whisper:
        if self._model is None:
            with self._lock:
                if self._model is None:
                    logger.info("Loading local Whisper model '%s'...", self.model_name)
                    self._model = whisper.load_model(self.model_name)
                    logger.info("Whisper model '%s' loaded.", self.model_name)
        return self._model

    def is_loaded(self) -> bool:
        return self._model is not None

    def transcribe(self, audio_path: Path) -> Dict[str, object]:
        """Run transcription on a local audio file.

        Raises RuntimeError with a human-friendly message on failure so the
        route can map it to a clean HTTP response.
        """
        if not audio_path.exists():
            raise RuntimeError(f"Audio file not found: {audio_path}")

        model = self.get_model()

        try:
            # fp16 only helps on CUDA — keep it False so CPU users don't see warnings.
            result = model.transcribe(str(audio_path), fp16=False)
        except FileNotFoundError as exc:
            # Typically raised when FFmpeg isn't installed or on PATH.
            raise RuntimeError(
                "Transcription failed — FFmpeg may not be installed or available on PATH. "
                "Install it and restart the backend."
            ) from exc
        except Exception as exc:  # noqa: BLE001
            raise RuntimeError(f"Whisper transcription failed: {exc}") from exc

        transcript = str(result.get("text", "")).strip()
        return {
            "transcript": transcript,
            "language": result.get("language"),
            "duration": result.get("duration"),
        }


whisper_service = WhisperService(model_name=os.getenv("WHISPER_MODEL", "base"))
