"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Trash2, ChevronRight, FileText, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import {
  clearHistory,
  deleteAttempt,
  formatAttemptDate,
  getHistory,
} from "@/utils/history";

function toneFor(pct) {
  if (pct >= 80) return "from-emerald-500 to-teal-500";
  if (pct >= 50) return "from-amber-500 to-orange-500";
  return "from-rose-500 to-pink-500";
}

export default function HistoryList() {
  const [items, setItems] = useState(null); // null = not loaded yet

  useEffect(() => {
    setItems(getHistory());
  }, []);

  if (items === null || items.length === 0) return null;

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    deleteAttempt(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
    toast.success("Attempt removed");
  };

  const handleClearAll = () => {
    if (!confirm("Clear all saved quiz attempts? This can't be undone.")) return;
    clearHistory();
    setItems([]);
    toast.success("History cleared");
  };

  return (
    <section className="card p-6 sm:p-8 animate-fade-in">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <History className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your past attempts</h2>
            <p className="text-xs text-slate-500">
              Saved to your browser — click any attempt to review it.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </button>
      </header>

      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id}>
            <Link
              href={`/results?id=${a.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${toneFor(
                  a.percentage
                )} text-white shadow-glow`}
              >
                <Trophy className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    <FileText className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                    {a.fileName}
                  </p>
                  <span className="chip bg-brand-50 text-brand-700">
                    {a.percentage.toFixed(0)}%
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {a.correct}/{a.total} correct · avg similarity{" "}
                  {a.avgSimilarity.toFixed(0)}% · {formatAttemptDate(a.date)}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => handleDelete(e, a.id)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Delete attempt"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-500" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
