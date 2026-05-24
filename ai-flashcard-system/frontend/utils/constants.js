// Single source of truth for shared client-side constants.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const SIMILARITY_THRESHOLD = 95; // mirrors backend default

export const STORAGE_KEYS = {
  FLASHCARDS: "flashai:flashcards",
  RESULTS: "flashai:results",
  FILE_NAME: "flashai:filename",
  HISTORY: "flashai:history",
  PROGRESS: "flashai:progress",
  // Server session ID — when this changes (i.e. backend restarted), all the
  // keys above get wiped on app load.
  SERVER_SESSION: "flashai:server-session",
};

// All localStorage keys that represent server-session-scoped data. Anything
// listed here is cleared when the backend reports a new session ID.
export const SESSION_SCOPED_KEYS = [
  "flashai:flashcards",
  "flashai:results",
  "flashai:filename",
  "flashai:history",
  "flashai:progress",
];

export const HISTORY_LIMIT = 20; // keep at most 20 past attempts in localStorage

export const MAX_CSV_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB
