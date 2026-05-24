"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSpeechRecorder — wraps the browser MediaRecorder API.
 *
 * Returns:
 *   - isSupported / isRecording / error
 *   - elapsed (seconds while recording)
 *   - start() / stop() / reset()
 *
 * stop() resolves with a Blob containing the recorded audio (webm/opus on
 * Chromium, audio/mp4 fallback on Safari).
 */
export default function useSpeechRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const stopPromiseRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== "undefined";

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const pickMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    return candidates.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";
  };

  const start = useCallback(async () => {
    setError(null);
    if (!isSupported) {
      const msg = "Your browser does not support audio recording.";
      setError(msg);
      throw new Error(msg);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        cleanup();
        setIsRecording(false);
        setElapsed(0);
        stopPromiseRef.current?.resolve(blob);
        stopPromiseRef.current = null;
      };

      recorder.onerror = (e) => {
        setError(e.error?.message || "Recording failed.");
        cleanup();
        setIsRecording(false);
        stopPromiseRef.current?.reject(new Error("Recording failed."));
        stopPromiseRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (err) {
      cleanup();
      setIsRecording(false);
      const msg =
        err.name === "NotAllowedError"
          ? "Microphone access was denied. Please enable it in your browser settings."
          : err.name === "NotFoundError"
          ? "No microphone detected on this device."
          : err.message || "Could not start recording.";
      setError(msg);
      throw new Error(msg);
    }
  }, [cleanup, isSupported]);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return Promise.resolve(null);
    }
    return new Promise((resolve, reject) => {
      stopPromiseRef.current = { resolve, reject };
      recorder.stop();
    });
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setElapsed(0);
    setError(null);
  }, [cleanup]);

  return { isSupported, isRecording, elapsed, error, start, stop, reset };
}
