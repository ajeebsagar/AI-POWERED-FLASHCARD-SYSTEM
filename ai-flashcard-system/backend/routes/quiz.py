"""POST /check-answer — grade a user's response with fuzzy matching."""

from fastapi import APIRouter

from models.request_models import CheckAnswerRequest
from models.response_models import CheckAnswerResponse
from services.grading_service import grade

router = APIRouter()


@router.post("/check-answer", response_model=CheckAnswerResponse)
async def check_answer(payload: CheckAnswerRequest) -> CheckAnswerResponse:
    return grade(user_answer=payload.user_answer, correct_answer=payload.correct_answer)
