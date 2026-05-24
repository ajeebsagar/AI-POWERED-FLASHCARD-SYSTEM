"use client";

import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { formatPercent, similarityTone } from "@/utils/formatText";

const TONES = {
  emerald: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    chip: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  amber: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
    chip: "bg-amber-100 text-amber-700",
    icon: Sparkles,
  },
  rose: {
    border: "border-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-700",
    chip: "bg-rose-100 text-rose-700",
    icon: XCircle,
  },
};

export default function FeedbackCard({ result }) {
  if (!result) return null;
  const tone = result.correct ? "emerald" : similarityTone(result.similarity);
  const t = TONES[tone];
  const Icon = result.correct ? CheckCircle2 : t.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${t.border} ${t.bg} p-5 animate-slide-up`}
    >
      <div className="flex items-start gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-sm ${t.text}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-base font-semibold ${t.text}`}>
              {result.correct ? "Correct!" : "Not quite"}
            </p>
            <span className={`chip ${t.chip}`}>{formatPercent(result.similarity)} similarity</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{result.feedback}</p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Your answer
              </dt>
              <dd className="mt-0.5 text-slate-800">
                {result.user_answer || <em className="text-slate-400">empty</em>}
              </dd>
            </div>
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Correct answer
              </dt>
              <dd className="mt-0.5 text-slate-800">{result.correct_answer}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
