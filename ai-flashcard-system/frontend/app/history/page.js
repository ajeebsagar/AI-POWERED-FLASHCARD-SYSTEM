"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Target,
  ListChecks,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import HistoryList from "@/components/HistoryList";
import { getHistory } from "@/utils/history";

function StatCard({ icon: Icon, label, value, tone = "brand" }) {
  const tones = {
    brand: "from-brand-500 to-fuchsia-500",
    emerald: "from-emerald-500 to-teal-500",
    rose: "from-rose-500 to-pink-500",
    slate: "from-slate-500 to-slate-700",
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-glow`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const stats = useMemo(() => {
    if (!items || items.length === 0) return null;
    const totalQuizzes = items.length;
    const totalQuestions = items.reduce((acc, a) => acc + a.total, 0);
    const totalCorrect = items.reduce((acc, a) => acc + a.correct, 0);
    const totalWrong = totalQuestions - totalCorrect;
    const avgAccuracy =
      items.reduce((acc, a) => acc + a.percentage, 0) / totalQuizzes;
    return { totalQuizzes, totalQuestions, totalCorrect, totalWrong, avgAccuracy };
  }, [items]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <section className="card relative overflow-hidden p-6 sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gradient opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-fuchsia-300 opacity-20 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
            All Results
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Every quiz you've taken
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Each CSV you upload becomes its own attempt, saved here in your
            browser. Click any attempt to review the questions and your answers.
          </p>
        </div>
      </section>

      {stats ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ListChecks} label="Quizzes taken" value={stats.totalQuizzes} tone="brand" />
            <StatCard icon={Trophy} label="Questions answered" value={stats.totalQuestions} tone="slate" />
            <StatCard icon={CheckCircle2} label="Total correct" value={stats.totalCorrect} tone="emerald" />
            <StatCard
              icon={Target}
              label="Avg. accuracy"
              value={`${stats.avgAccuracy.toFixed(0)}%`}
              tone="rose"
            />
          </section>
          <HistoryList />
        </>
      ) : items === null ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <section className="card flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">No results yet</h2>
          <p className="max-w-md text-sm text-slate-600">
            Upload a CSV and complete a quiz — your results will be stored here
            automatically so you can compare attempts from different files.
          </p>
          <Link href="/" className="btn-primary mt-2">
            Upload a CSV
          </Link>
        </section>
      )}
    </div>
  );
}
