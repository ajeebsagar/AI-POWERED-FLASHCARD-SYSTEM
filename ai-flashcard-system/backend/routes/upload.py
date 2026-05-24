"""POST /upload-csv — parse a flashcard CSV and return the parsed cards."""

from fastapi import APIRouter, File, UploadFile

from models.response_models import UploadResponse
from services.csv_service import parse_csv_bytes
from utils.validators import enforce_size, validate_csv

router = APIRouter()


@router.post("/upload-csv", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)) -> UploadResponse:
    validate_csv(file)
    raw = await file.read()
    enforce_size(len(raw), kind="file")

    flashcards = parse_csv_bytes(raw)

    return UploadResponse(
        success=True,
        message=f"Parsed {len(flashcards)} flashcards from '{file.filename}'.",
        total_cards=len(flashcards),
        flashcards=flashcards,
    )
