"use client";

import { useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import useSpeechRecorder from "@/hooks/useSpeechRecorder";
import { transcribeAudio } from "@/services/api";

function pad(n) {
  return n.toString().padStart(2, "0");
}

export default function VoiceRecorder({ onTranscript, disabled, transcribing, setTranscribing }) {
  const { isSupported, isRecording, elapsed, error, start, stop } = useSpeechRecorder();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleClick = async () => {
    if (disabled || transcribing) return;

    if (!isSupported) {
      toast.error("Your browser does not support voice recording.");
      return;
    }

    if (!isRecording) {
      try {
        await start();
      } catch {
        // toast already shown in useEffect via error state
      }
      return;
    }

    try {
      const blob = await stop();
      if (!blob || blob.size === 0) {
        toast.error("No audio captured — please try again.");
        return;
      }
      setTranscribing(true);
      const data = await transcribeAudio(blob);
      onTranscript(data.transcript);
      toast.success("Transcribed!");
    } catch (err) {
      toast.error(err.message || "Transcription failed.");
    } finally {
      setTranscribing(false);
    }
  };

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || transcribing}
        aria-pressed={isRecording}
        className={`relative grid h-20 w-20 place-items-center rounded-full text-white shadow-glow transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
          isRecording
            ? "bg-gradient-to-br from-rose-500 to-pink-600 recording-ring"
            : "bg-brand-gradient"
        }`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {transcribing ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : isRecording ? (
          <Square className="h-7 w-7 fill-current" />
        ) : (
          <Mic className="h-8 w-8" />
        )}
      </button>

      <div className="text-center">
        {transcribing ? (
          <p className="text-sm font-medium text-slate-600">Transcribing with Whisper…</p>
        ) : isRecording ? (
          <p className="text-sm font-medium text-rose-600">
            <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-rose-500" />
            Recording {pad(minutes)}:{pad(seconds)}
          </p>
        ) : (
          <p className="text-sm font-medium text-slate-600">Tap mic to speak your answer</p>
        )}
        {!isSupported && (
          <p className="mt-1 text-xs text-rose-600">
            Mic recording is not supported in this browser.
          </p>
        )}
      </div>
    </div>
  );
}
