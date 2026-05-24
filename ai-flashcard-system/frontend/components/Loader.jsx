"use client";

import { Loader2 } from "lucide-react";

export default function Loader({ label = "Loading…", size = "md", inline = false }) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };
  const dimension = sizeMap[size] ?? sizeMap.md;

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2 text-slate-600">
        <Loader2 className={`${dimension} animate-spin text-brand-600`} />
        <span className="text-sm font-medium">{label}</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <Loader2 className={`${dimension} animate-spin text-brand-600`} />
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
