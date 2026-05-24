"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Flashcard from "@/components/Flashcard";
import ProgressBar from "@/components/ProgressBar";
import Loader from "@/components/Loader";
import { STORAGE_KEYS } from "@/utils/constants";
import { saveAttempt } from "@/utils/history";

export default function QuizPage() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [fileName, setFileName] = useState("");
  const [resumed, setResumed] = useState(false);

  // Restore quiz + any in-progress state on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
      const name = localStorage.getItem(STORAGE_KEYS.FILE_NAME) || "";
      // Stable ID dedupes the toast across React Strict Mode's double-effect.
      const NO_DECK_TOAST = { id: "no-deck" };
      if (!stored) {
        toast.error("Please upload a CSV file to start a quiz.", NO_DECK_TOAST);
        router.replace("/");
        return;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.error("Please upload a CSV file to start a quiz.", NO_DECK_TOAST);
        router.replace("/");
        return;
      }
      setFlashcards(parsed);
      setFileName(name);

      // Resume in-progress quiz — only valid for the same flashcard set.
      const rawProgress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (rawProgress) {
        const progress = JSON.parse(rawProgress);
        const sameDeck = progress?.total === parsed.length && progress?.fileName === name;
        const partial =
          sameDeck &&
          Array.isArray(progress.results) &&
          progress.results.length > 0 &&
          progress.results.length < parsed.length;

        if (partial) {
          setResults(progress.results);
          setIndex(progress.results.length);
          setResumed(true);
          toast.success(
            `Resuming from question ${progress.results.length + 1} of ${parsed.length}`
          );
        } else if (!sameDeck) {
          localStorage.removeItem(STORAGE_KEYS.PROGRESS);
        }
      }
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleComplete = (entry) => {
    const next = [...results, entry];
    setResults(next);

    if (index + 1 >= flashcards.length) {
      // Quiz fully done — persist final results, save to history, and clear the
      // active deck so opening /quiz again forces a new CSV upload.
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(next));
      saveAttempt({ fileName, results: next });
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.FLASHCARDS);
      localStorage.removeItem(STORAGE_KEYS.FILE_NAME);
      router.push("/results");
      return;
    }

    // Mid-quiz — save progress so the user can leave and return.
    try {
      localStorage.setItem(
        STORAGE_KEYS.PROGRESS,
        JSON.stringify({
          fileName,
          total: flashcards.length,
          results: next,
          savedAt: Date.now(),
        })
      );
    } catch {
      // Storage quota — non-fatal, continue without resume support.
    }

    setIndex(index + 1);
  };

  const handleStartOver = () => {
    if (results.length === 0) return;
    if (!confirm("Start the quiz over? Your current progress will be lost.")) return;
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    setResults([]);
    setIndex(0);
    setResumed(false);
    toast.success("Quiz reset");
  };

  if (!flashcards) {
    return <Loader label="Loading your flashcards…" size="lg" />;
  }

  const card = flashcards[index];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to upload
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {fileName && (
            <span className="chip bg-slate-100 text-slate-600">
              <span className="font-medium">File:</span>&nbsp;
              <span className="truncate max-w-[180px]">{fileName}</span>
            </span>
          )}
          {results.length > 0 && (
            <button
              type="button"
              onClick={handleStartOver}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </button>
          )}
        </div>
      </div>

      {resumed && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-sm text-brand-800 animate-fade-in">
          Welcome back — picking up right where you left off.
        </div>
      )}

      <div className="card p-5">
        <ProgressBar current={index + 1} total={flashcards.length} />
      </div>

      <Flashcard
        key={index}
        card={card}
        index={index}
        total={flashcards.length}
        onComplete={handleComplete}
      />
    </div>
  );
}
