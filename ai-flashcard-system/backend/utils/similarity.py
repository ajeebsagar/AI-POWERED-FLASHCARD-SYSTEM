"""Similarity scoring backed by RapidFuzz.

We deliberately use STRICT scorers only:

    * ratio             — full-string Levenshtein (catches typos)
    * token_sort_ratio  — same content, words possibly reordered

We intentionally do NOT use:

    * partial_ratio     — would score "Paris" inside "Paris is great" as 100%
    * token_set_ratio   — ignores duplicates / extra words, inflates scores

The displayed percentage therefore reflects how close the user's answer
actually is to the answer recorded in the CSV.
"""

from rapidfuzz import fuzz

from utils.text_cleaner import normalize


def score(user_answer: str, correct_answer: str) -> float:
    """Return a similarity score in the 0-100 range."""
    a = normalize(user_answer)
    b = normalize(correct_answer)

    if not a or not b:
        return 0.0
    if a == b:
        return 100.0

    return float(max(fuzz.ratio(a, b), fuzz.token_sort_ratio(a, b)))
