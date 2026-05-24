"use client";

export default function ProgressBar({ current, total }) {
  const safeTotal = Math.max(total || 0, 1);
  const pct = Math.min(100, Math.max(0, (current / safeTotal) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>
          Question{" "}
          <span className="font-semibold text-slate-800">{Math.min(current, total)}</span> of{" "}
          <span className="font-semibold text-slate-800">{total}</span>
        </span>
        <span className="font-semibold text-brand-700">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
        <div
          className="h-full rounded-full bg-brand-gradient transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
