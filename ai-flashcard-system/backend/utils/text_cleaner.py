"""Text normalization used before similarity scoring.

Both the user's answer and the ground truth go through the same pipeline so that
trivial differences (case, punctuation, whitespace) don't affect the score.
"""

import re
import string
import unicodedata

_WHITESPACE_RE = re.compile(r"\s+")
_PUNCT_TABLE = str.maketrans({c: " " for c in string.punctuation})


def normalize(text: str) -> str:
    """Lowercase, strip accents, drop punctuation, collapse whitespace."""
    if text is None:
        return ""
    # NFKD splits accented chars into base + combining marks; we drop the marks.
    text = unicodedata.normalize("NFKD", str(text))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower().translate(_PUNCT_TABLE)
    text = _WHITESPACE_RE.sub(" ", text).strip()
    return text
