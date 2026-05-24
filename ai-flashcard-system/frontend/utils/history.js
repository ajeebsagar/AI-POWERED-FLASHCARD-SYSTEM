// Persists completed quiz attempts to localStorage so users can revisit them.
// Each attempt is self-contained: it carries its own results array, so loading
// a past attempt does not require the original CSV.

import { HISTORY_LIMIT, STORAGE_KEYS } from "./constants";

function readRaw() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getHistory() {
  return readRaw();
}

export function getAttempt(id) {
  return readRaw().find((a) => a.id === id) || null;
}

export function saveAttempt({ fileName, results }) {
  if (typeof window === "undefined") return null;
  if (!Array.isArray(results) || results.length === 0) return null;

  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const percentage = (correct / total) * 100;
  const avgSimilarity =
    results.reduce((acc, r) => acc + (r.similarity || 0), 0) / total;

  const attempt = {
    id: Date.now(),
    date: new Date().toISOString(),
    fileName: fileName || "Untitled",
    total,
    correct,
    wrong: total - correct,
    percentage: Number(percentage.toFixed(2)),
    avgSimilarity: Number(avgSimilarity.toFixed(2)),
    results,
  };

  const existing = readRaw();
  const next = [attempt, ...existing].slice(0, HISTORY_LIMIT);
  try {
    window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(next));
  } catch {
    // Storage quota exceeded or disabled — fail silently, the in-memory result still works.
  }
  return attempt;
}

export function deleteAttempt(id) {
  if (typeof window === "undefined") return;
  const next = readRaw().filter((a) => a.id !== id);
  window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(next));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function formatAttemptDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
