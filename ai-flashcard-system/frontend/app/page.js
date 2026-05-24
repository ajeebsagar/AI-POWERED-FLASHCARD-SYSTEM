"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Mic, Sparkles, Gauge, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import FileUpload from "@/components/FileUpload";
import HistoryList from "@/components/HistoryList";
import { STORAGE_KEYS } from "@/utils/constants";

export default function HomePage() {
  const router = useRouter();

  // Click handler for "Already uploaded? Start Quiz".
  // Only allowed if a deck is still loaded (i.e. the previous quiz wasn't
  // fully completed). Once completed, the deck is cleared and the user must
  // upload a new CSV.
  const handleStartExisting = () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    let hasDeck = false;
    try {
      const parsed = JSON.parse(stored || "null");
      hasDeck = Array.isArray(parsed) && parsed.length > 0;
    } catch {
      hasDeck = false;
    }
    if (!hasDeck) {
      toast.error("Please upload a CSV file to start a new quiz.", { id: "no-deck" });
      return;
    }
    router.push("/quiz");
  };

  const features = [
    {
      icon: Mic,
      title: "Voice or Text",
      description:
        "Type your answer or simply speak it out loud — whichever feels easier in the moment.",
    },
    {
      icon: Sparkles,
      title: "Smart Grading",
      description:
        "Small typos and slightly different wording still count. You don't need a word-perfect match.",
    },
    {
      icon: Gauge,
      title: "Instant Feedback",
      description:
        "See if you got it right the moment you answer, and review every question at the end.",
    },
    {
      icon: ShieldCheck,
      title: "Private by Default",
      description:
        "Your files and your voice stay on your own device — nothing is uploaded to the internet.",
    },
  ];

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Turn any CSV into an{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">
              AI-graded flashcard quiz
            </span>
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            Upload a CSV of questions and answers. Take the quiz by typing — or
            speaking — and get smart, fuzzy-matched grading instantly. Runs
            entirely on your machine.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleStartExisting} className="btn-secondary">
              Already uploaded? Start Quiz
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="card p-6 sm:p-8 animate-slide-up">
          <h2 className="mb-1 text-xl font-bold text-slate-900">Upload your flashcards</h2>
          <p className="mb-5 text-sm text-slate-500">
            Two columns: <span className="font-mono">Question, Answer</span>
          </p>
          <FileUpload onReady={() => router.push("/quiz")} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="card group p-5 transition hover:-translate-y-1 hover:shadow-glow"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
        ))}
      </section>

      <HistoryList />
    </div>
  );
}
