"""Pydantic request models — validate inbound payloads at the API boundary."""

from pydantic import BaseModel, Field


class CheckAnswerRequest(BaseModel):
    """Payload for POST /check-answer."""

    question: str = Field(..., min_length=1, description="The original question text.")
    user_answer: str = Field(..., description="What the user typed or said.")
    correct_answer: str = Field(..., min_length=1, description="Ground-truth answer from the CSV.")
