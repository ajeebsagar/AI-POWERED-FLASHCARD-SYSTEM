"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchServerSession } from "@/services/api";
import { SESSION_SCOPED_KEYS, STORAGE_KEYS } from "@/utils/constants";

/**
 * SessionGate
 * -----------
 * Blocks the app on first paint just long enough to confirm the backend's
 * server-session ID. Behaviour:
 *
 *   - First-ever load           → store the ID, render.
 *   - Same ID as stored         → render (no wipe).
 *   - Different ID              → wipe every session-scoped key, then render.
 *   - Backend unreachable / slow → render after a short timeout, keep data
 *                                  (data only gets cleared when we can prove
 *                                  the server actually restarted).
 *
 * This is the mechanism that makes localStorage "live only as long as the
 * server process lives" — restarting `python main.py` mints a new ID,
 * triggering the wipe branch on the next page load.
 */

function wipeSessionScopedData() {
  if (typeof window === "undefined") return;
  for (const key of SESSION_SCOPED_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export default function SessionGate({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { session_id: serverId } = await fetchServerSession({ timeout: 4000 });
        if (cancelled) return;
        if (!serverId) {
          setReady(true);
          return;
        }
        const storedId = window.localStorage.getItem(STORAGE_KEYS.SERVER_SESSION);
        if (storedId !== serverId) {
          wipeSessionScopedData();
          window.localStorage.setItem(STORAGE_KEYS.SERVER_SESSION, serverId);
        }
      } catch {
        // Backend offline / slow — preserve existing data, let the UI render.
        // The next successful /session call (after a refresh) will reconcile.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
          <p className="text-sm font-medium">Preparing your session…</p>
        </div>
      </div>
    );
  }

  return children;
}
