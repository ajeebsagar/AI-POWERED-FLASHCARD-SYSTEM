"""Grade a user's answer against the ground truth using fuzzy matching."""

import os

from models.response_models import CheckAnswerResponse
from utils.similarity import score

DEFAULT_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "95"))


def _feedback(similarity: float, correct: bool) -> str:
    if correct and similarity == 100.0:
        return "Perfect answer!"
    if correct:
        return "Correct — close enough match."
    if similarity >= 60:
        return "Almost — your answer was close but not close enough."
    if similarity >= 30:
        return "Not quite right."
    return "Incorrect."


def grade(user_answer: str, correct_answer: str, threshold: float = DEFAULT_THRESHOLD) -> CheckAnswerResponse:
    user_answer = (user_answer or "").strip()
    similarity = score(user_answer, correct_answer)
    correct = similarity >= threshold and bool(user_answer)
    return CheckAnswerResponse(
        success=True,
        correct=correct,
        similarity=round(similarity, 2),
        threshold=threshold,
        user_answer=user_answer,
        correct_answer=correct_answer,
        feedback=_feedback(similarity, correct),
    )
