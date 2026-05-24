"use client";

import { CheckCircle2, XCircle, RefreshCcw, Trophy, Target, Sparkles, History, FileText, ListChecks } from "lucide-react";
import Link from "next/link";
import { formatPercent, similarityTone } from "@/utils/formatText";
import { formatAttemptDate } from "@/utils/history";

function CircularScore({ percentage }) {
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percentage / 100) * circumference;

  return (
    <div className="relative grid place-items-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(226 232 240)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold text-slate-900">
          {percentage.toFixed(0)}%
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Accuracy
        </span>
      </div>
    </div>
  );
}

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

export default function ResultSummary({ results, onRestart, meta }) {
  if (!results?.length) return null;

  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const wrong = total - correct;
  const percentage = (correct / total) * 100;
  const avgSimilarity =
    results.reduce((acc, r) => acc + (r.similarity || 0), 0) / total;

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="card relative overflow-hidden p-6 sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gradient opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-fuchsia-300 opacity-20 blur-3xl" />
        <div className="relative grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <CircularScore percentage={percentage} />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
              {meta?.isPast ? "Past Attempt" : "Quiz Complete"}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              You scored {correct} of {total}
            </h1>
            <p className="mt-2 max-w-xl text-slate-600">
              Average similarity {formatPercent(avgSimilarity)}. Review the breakdown below
              and try again to improve your recall.
            </p>
            {(meta?.fileName || meta?.date) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {meta.fileName && (
                  <span className="chip bg-slate-100 text-slate-600">
                    <FileText className="h-3.5 w-3.5" />
                    {meta.fileName}
                  </span>
                )}
                {meta.date && (
                  <span className="chip bg-brand-50 text-brand-700">
                    <History className="h-3.5 w-3.5" />
                    {formatAttemptDate(meta.date)}
                  </span>
                )}
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={onRestart} className="btn-primary">
                <RefreshCcw className="h-4 w-4" />
                {meta?.isPast ? "Upload New Quiz" : "Restart Quiz"}
              </button>
              <Link href="/history" className="btn-secondary">
                <ListChecks className="h-4 w-4" />
                All Results
              </Link>
              <Link href="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Trophy} label="Total" value={total} tone="brand" />
        <StatCard icon={CheckCircle2} label="Correct" value={correct} tone="emerald" />
        <StatCard icon={XCircle} label="Wrong" value={wrong} tone="rose" />
        <StatCard
          icon={Target}
          label="Avg. similarity"
          value={formatPercent(avgSimilarity, 0)}
          tone="slate"
        />
      </section>

      <section className="card p-6 sm:p-8">
        <header className="mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Detailed breakdown</h2>
        </header>
        <ul className="space-y-3">
          {results.map((r, idx) => {
            const tone = r.correct ? "emerald" : similarityTone(r.similarity);
            const palette = {
              emerald: "border-emerald-200 bg-emerald-50/60",
              amber: "border-amber-200 bg-amber-50/60",
              rose: "border-rose-200 bg-rose-50/60",
            }[tone];
            const Icon = r.correct ? CheckCircle2 : XCircle;
            const iconTone = r.correct ? "text-emerald-600" : "text-rose-600";
            return (
              <li
                key={idx}
                className={`rounded-2xl border ${palette} p-4 transition hover:shadow-md`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconTone}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {idx + 1}. {r.question}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        <span className="font-semibold">Your answer:</span>{" "}
                        {r.user_answer || <em className="text-slate-400">empty</em>}
                      </p>
                      {!r.correct && (
                        <p className="mt-0.5 text-xs text-emerald-700">
                          <span className="font-semibold">Correct:</span> {r.correct_answer}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`chip ${
                      r.correct
                        ? "bg-emerald-100 text-emerald-700"
                        : tone === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {formatPercent(r.similarity)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
