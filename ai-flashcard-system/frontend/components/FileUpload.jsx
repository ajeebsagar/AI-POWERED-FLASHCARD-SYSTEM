"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { uploadCSV } from "@/services/api";
import { formatBytes } from "@/utils/formatText";
import { MAX_CSV_BYTES, STORAGE_KEYS } from "@/utils/constants";
import Loader from "./Loader";

export default function FileUpload({ onReady }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const validate = (candidate) => {
    if (!candidate) return "Please choose a file.";
    if (!candidate.name.toLowerCase().endsWith(".csv"))
      return "Only .csv files are supported.";
    if (candidate.size === 0) return "This file is empty.";
    if (candidate.size > MAX_CSV_BYTES)
      return `File is larger than ${formatBytes(MAX_CSV_BYTES)}.`;
    return null;
  };

  const setSafeFile = useCallback((candidate) => {
    const validation = validate(candidate);
    setParsed(null);
    if (validation) {
      setErrorMsg(validation);
      setFile(null);
      toast.error(validation);
      return;
    }
    setErrorMsg(null);
    setFile(candidate);
  }, []);

  const handleDrag = (e, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  };

  const handleDrop = (e) => {
    handleDrag(e, false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) setSafeFile(dropped);
  };

  const handleChange = (e) => {
    const chosen = e.target.files?.[0];
    if (chosen) setSafeFile(chosen);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const data = await uploadCSV(file);
      if (!data?.flashcards?.length) {
        throw new Error("No flashcards parsed from this file.");
      }
      // Persist for the quiz page.
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(data.flashcards));
      localStorage.setItem(STORAGE_KEYS.FILE_NAME, file.name);
      localStorage.removeItem(STORAGE_KEYS.RESULTS);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      setParsed(data);
      toast.success(`Loaded ${data.total_cards} flashcards`);
      onReady?.(data);
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsed(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      <label
        onDragEnter={(e) => handleDrag(e, true)}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
        htmlFor="csv-input"
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-all duration-300 ${
          dragActive
            ? "border-brand-500 bg-brand-50/80 scale-[1.01]"
            : "border-slate-300 bg-white/60 hover:border-brand-400 hover:bg-white/80"
        }`}
      >
        <input
          ref={inputRef}
          id="csv-input"
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={handleChange}
          disabled={uploading}
        />
        <span
          className={`grid h-16 w-16 place-items-center rounded-2xl shadow-glow transition-transform duration-300 group-hover:scale-110 ${
            dragActive ? "bg-brand-gradient" : "bg-gradient-to-br from-brand-500 to-fuchsia-500"
          }`}
        >
          <UploadCloud className="h-8 w-8 text-white" strokeWidth={2.2} />
        </span>
        <p className="mt-5 text-lg font-semibold text-slate-800">
          {dragActive ? "Drop your CSV here" : "Drag & drop your CSV"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          or <span className="font-semibold text-brand-700">browse from your device</span>
        </p>
        <p className="mt-4 text-xs text-slate-400">
          Required columns: <span className="font-mono">Question, Answer</span> · up to{" "}
          {formatBytes(MAX_CSV_BYTES)}
        </p>
      </label>

      {file && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm animate-slide-up">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={uploading}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {parsed && (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 animate-fade-in">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Successfully parsed <strong>{parsed.total_cards}</strong> flashcards. You're ready to
            start the quiz.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary flex-1"
        >
          {uploading ? (
            <Loader inline size="sm" label="Uploading…" />
          ) : (
            <>
              <UploadCloud className="h-5 w-5" />
              Upload & Parse CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
}
