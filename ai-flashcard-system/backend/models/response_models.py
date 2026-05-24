"""Pydantic response models — describe the shape the frontend can rely on."""

from typing import List, Optional

from pydantic import BaseModel, Field


class Flashcard(BaseModel):
    question: str
    answer: str


class UploadResponse(BaseModel):
    success: bool
    message: str
    total_cards: int
    flashcards: List[Flashcard]


class CheckAnswerResponse(BaseModel):
    success: bool
    correct: bool
    similarity: float = Field(..., description="Similarity percentage 0-100.")
    threshold: float
    user_answer: str
    correct_answer: str
    feedback: str


class TranscriptionResponse(BaseModel):
    success: bool
    transcript: str
    language: Optional[str] = None
    duration: Optional[float] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
