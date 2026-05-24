"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient shadow-glow transition-transform duration-300 group-hover:scale-105">
            <Brain className="h-5 w-5 text-white" strokeWidth={2.4} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-slate-900">
              FlashAI
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Smart Flashcard Quizzes
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 sm:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
          >
            Upload
          </Link>
          <Link
            href="/quiz"
            className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
          >
            Quiz
          </Link>
          <Link
            href="/results"
            className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
          >
            Results
          </Link>
          <Link
            href="/history"
            className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
          >
            All Results
          </Link>
        </nav>

      </div>
    </header>
  );
}
