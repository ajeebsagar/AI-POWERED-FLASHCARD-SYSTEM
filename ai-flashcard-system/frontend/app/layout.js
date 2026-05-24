import Navbar from "@/components/Navbar";
import SessionGate from "@/components/SessionGate";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

export const metadata = {
  title: "FlashAI — Smart Flashcard Quizzes",
  description:
    "Upload a CSV, take an AI-graded flashcard quiz with voice answers powered by local Whisper.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-800 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <SessionGate>{children}</SessionGate>
        </main>
        <ToastProvider />
      </body>
    </html>
  );
}
