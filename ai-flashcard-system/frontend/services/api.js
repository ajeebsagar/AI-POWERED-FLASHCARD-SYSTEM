// Centralized Axios client. Every component talks to the backend through here so
// error handling, base URL, and timeouts live in one place.

import axios from "axios";
import { API_URL } from "@/utils/constants";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // Whisper on CPU can take a while on first call.
});

function describeError(error) {
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    return typeof detail === "string" ? detail : JSON.stringify(detail);
  }
  if (error.response?.data?.error) return error.response.data.error;
  if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
  if (error.message === "Network Error")
    return "Could not reach the backend. Is it running on " + API_URL + "?";
  return error.message || "Unexpected error.";
}

export async function uploadCSV(file) {
  const form = new FormData();
  form.append("file", file);
  try {
    const { data } = await api.post("/upload-csv", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw new Error(describeError(error));
  }
}

export async function checkAnswer({ question, userAnswer, correctAnswer }) {
  try {
    const { data } = await api.post("/check-answer", {
      question,
      user_answer: userAnswer,
      correct_answer: correctAnswer,
    });
    return data;
  } catch (error) {
    throw new Error(describeError(error));
  }
}

export async function transcribeAudio(blob, filename = "recording.webm") {
  const form = new FormData();
  form.append("file", blob, filename);
  try {
    const { data } = await api.post("/speech-to-text", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw new Error(describeError(error));
  }
}

export async function checkHealth() {
  try {
    const { data } = await api.get("/health");
    return data;
  } catch (error) {
    throw new Error(describeError(error));
  }
}

// Lightweight, short-timeout call used by the session gate on every app load.
// We don't want a stalled backend to block the UI forever, so we time out
// quickly and let the gate fall through (data is preserved on offline backend).
export async function fetchServerSession({ timeout = 4000 } = {}) {
  const { data } = await api.get("/session", { timeout });
  return data; // { session_id, started_at }
}

export default api;
