"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Send, Eraser } from "lucide-react";
import toast from "react-hot-toast";
import { checkAnswer } from "@/services/api";
import VoiceRecorder from "./VoiceRecorder";
import FeedbackCard from "./FeedbackCard";
import Loader from "./Loader";

export default function Flashcard({ card, index, total, onComplete }) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  // Reset state whenever we move to a new card.
  useEffect(() => {
    setAnswer("");
    setResult(null);
    setSubmitting(false);
    setTranscribing(false);
    inputRef.current?.focus();
  }, [card?.question, index]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (submitting || result || !card) return;
    const trimmed = answer.trim();
    if (!trimmed) {
      toast.error("Please type or speak an answer first.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await checkAnswer({
        question: card.question,
        userAnswer: trimmed,
        correctAnswer: card.answer,
      });
      setResult(data);
    } catch (err) {
      toast.error(err.message || "Could not grade answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!result) return;
    onComplete({
      question: card.question,
      correct_answer: card.answer,
      user_answer: result.user_answer,
      similarity: result.similarity,
      correct: result.correct,
      feedback: result.feedback,
    });
  };

  const isLast = index === total - 1;

  return (
    <article className="card p-6 sm:p-8 animate-slide-up">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <span className="chip bg-brand-100 text-brand-700">
          Question {index + 1} / {total}
        </span>
        <span className="chip bg-slate-100 text-slate-600">Flashcard</span>
      </div>

      <h2 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
        {card.question}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitting || transcribing || !!result}
            placeholder="Type your answer, or use the mic below…"
            className="input-field pr-12"
            autoComplete="off"
          />
          {answer && !result && (
            <button
              type="button"
              onClick={() => setAnswer("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear answer"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid items-center gap-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 sm:grid-cols-[1fr_auto_1fr]">
          <p className="hidden text-right text-sm text-slate-500 sm:block">
            Prefer to speak?<br />
            <span className="text-xs text-slate-400">Whisper transcribes locally.</span>
          </p>
          <div className="flex justify-center sm:px-4">
            <VoiceRecorder
              onTranscript={(t) => setAnswer(t)}
              disabled={submitting || !!result}
              transcribing={transcribing}
              setTranscribing={setTranscribing}
            />
          </div>
          <p className="hidden text-left text-sm text-slate-500 sm:block">
            We'll transcribe and<br />
            <span className="text-xs text-slate-400">drop the text into the field.</span>
          </p>
        </div>

        {!result ? (
          <button
            type="submit"
            disabled={submitting || transcribing || !answer.trim()}
            className="btn-primary w-full"
          >
            {submitting ? (
              <Loader inline size="sm" label="Grading…" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Answer
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary w-full"
            autoFocus
          >
            {isLast ? "See Results" : "Next Question"}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </form>

      {result && (
        <div className="mt-6">
          <FeedbackCard result={result} />
        </div>
      )}
    </article>
  );
}
