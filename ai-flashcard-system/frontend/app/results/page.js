"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/Loader";
import ResultSummary from "@/components/ResultSummary";
import { STORAGE_KEYS } from "@/utils/constants";
import { getAttempt } from "@/utils/history";

function ResultsView() {
  const router = useRouter();
  const params = useSearchParams();
  const attemptId = params.get("id");
  const [results, setResults] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    try {
      if (attemptId) {
        // Reopen a past attempt from history.
        const past = getAttempt(Number(attemptId));
        if (!past) {
          router.replace("/");
          return;
        }
        setResults(past.results);
        setMeta({ fileName: past.fileName, date: past.date, isPast: true });
        return;
      }

      // Default — show the freshly-completed quiz.
      const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
      if (!raw) {
        router.replace("/");
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        router.replace("/");
        return;
      }
      setResults(parsed);
      setMeta({
        fileName: localStorage.getItem(STORAGE_KEYS.FILE_NAME) || "",
        date: null,
        isPast: false,
      });
    } catch {
      router.replace("/");
    }
  }, [attemptId, router]);

  const restart = () => {
    if (meta?.isPast) {
      router.push("/");
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.RESULTS);
    router.push("/quiz");
  };

  if (!results) {
    return <Loader label="Crunching your results…" size="lg" />;
  }

  return <ResultSummary results={results} meta={meta} onRestart={restart} />;
}

export default function ResultsPage() {
  // useSearchParams must be wrapped in Suspense in the App Router.
  return (
    <Suspense fallback={<Loader label="Loading results…" size="lg" />}>
      <ResultsView />
    </Suspense>
  );
}
