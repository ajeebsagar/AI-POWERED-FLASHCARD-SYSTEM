"""Parse uploaded CSV files into flashcard records.

The expected schema is exactly two columns: ``Question`` and ``Answer``. We
accept any case for the header so users don't have to fight with capitalization.
"""

import io
from typing import List

import pandas as pd
from fastapi import HTTPException, status

from models.response_models import Flashcard

REQUIRED_COLUMNS = {"question", "answer"}


def parse_csv_bytes(raw: bytes) -> List[Flashcard]:
    if not raw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded CSV is empty.",
        )

    try:
        # utf-8-sig handles BOM that Excel often inserts on Windows.
        df = pd.read_csv(io.BytesIO(raw), encoding="utf-8-sig", dtype=str, keep_default_na=False)
    except UnicodeDecodeError:
        try:
            df = pd.read_csv(io.BytesIO(raw), encoding="latin-1", dtype=str, keep_default_na=False)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not decode CSV: {exc}",
            ) from exc
    except pd.errors.EmptyDataError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV has no rows.",
        ) from exc
    except pd.errors.ParserError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed CSV: {exc}",
        ) from exc

    df.columns = [c.strip().lower() for c in df.columns]
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV is missing required columns: {sorted(missing)}. Expected 'Question,Answer'.",
        )

    df = df[["question", "answer"]].applymap(lambda v: str(v).strip() if v is not None else "")
    df = df[(df["question"] != "") & (df["answer"] != "")]

    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid rows found — every row must have both a question and an answer.",
        )

    return [Flashcard(question=row["question"], answer=row["answer"]) for _, row in df.iterrows()]
