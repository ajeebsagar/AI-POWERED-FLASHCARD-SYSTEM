"use client";

import { ToastBar, toast } from "react-hot-toast";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";

/**
 * ToastShell — custom render passed to <Toaster>{...}</Toaster>.
 *
 * Visual goals:
 *   - feel like a small dialog, not a thin strip
 *   - match the dashboard's indigo→fuchsia palette
 *   - have an obvious × close affordance in the corner
 *   - animate in with a subtle scale-and-fade, not a bar slide
 */

const VARIANTS = {
  success: {
    title: "Success",
    accent: "from-emerald-500 to-teal-500",
    surface: "from-white via-white to-emerald-50/70",
    ring: "ring-emerald-200/70",
    glow: "shadow-[0_30px_60px_-20px_rgba(16,185,129,0.35)]",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    Icon: CheckCircle2,
  },
  error: {
    title: "Heads up",
    accent: "from-rose-500 via-pink-500 to-fuchsia-500",
    surface: "from-white via-white to-rose-50/70",
    ring: "ring-rose-200/70",
    glow: "shadow-[0_30px_60px_-20px_rgba(244,63,94,0.35)]",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
    Icon: AlertTriangle,
  },
  loading: {
    title: "Working…",
    accent: "from-brand-500 via-fuchsia-500 to-pink-500",
    surface: "from-white via-white to-brand-50/70",
    ring: "ring-brand-200/70",
    glow: "shadow-glow-lg",
    iconBg: "bg-gradient-to-br from-brand-500 via-fuchsia-500 to-pink-500",
    Icon: Loader2,
  },
  blank: {
    title: "FlashAI",
    accent: "from-brand-500 via-fuchsia-500 to-pink-500",
    surface: "from-white via-white to-brand-50/70",
    ring: "ring-brand-200/70",
    glow: "shadow-glow-lg",
    iconBg: "bg-gradient-to-br from-brand-500 via-fuchsia-500 to-pink-500",
    Icon: Info,
  },
};

export default function ToastShell({ t }) {
  const variant = VARIANTS[t.type] || VARIANTS.blank;
  const { Icon } = variant;
  const isLoading = t.type === "loading";

  return (
    <ToastBar
      toast={t}
      style={{
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        margin: 0,
        maxWidth: "none",
      }}
    >
      {({ message }) => (
        <div
          role="status"
          className={`pointer-events-auto relative w-[min(440px,92vw)] overflow-hidden rounded-3xl bg-gradient-to-br ${variant.surface} ring-1 ${variant.ring} ${variant.glow} backdrop-blur-xl transition-all duration-300 ${
            t.visible
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 -translate-y-2"
          }`}
        >
          {/* top accent strip */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${variant.accent}`} />

          {/* soft ambient glow behind the icon */}
          <div
            className={`pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${variant.accent} opacity-20 blur-3xl`}
          />

          <div className="relative flex items-start gap-4 px-6 py-5 pr-14">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${variant.iconBg} text-white shadow-lg ring-4 ring-white/70`}
            >
              <Icon
                className={`h-6 w-6 ${isLoading ? "animate-spin" : ""}`}
                strokeWidth={2.4}
              />
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {variant.title}
              </p>
              <div className="mt-0.5 text-[15px] font-semibold leading-snug text-slate-900">
                {message}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            aria-label="Dismiss"
            className="group absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-slate-500 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-white hover:text-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>
      )}
    </ToastBar>
  );
}
