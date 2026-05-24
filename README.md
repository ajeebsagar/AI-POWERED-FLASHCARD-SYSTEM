# FlashAI — AI-Powered Flashcard Quiz System

> Upload a CSV. Take an AI-graded flashcard quiz. Answer by typing or by **speaking**. Everything runs **100% locally** — no cloud APIs, no OpenAI key, no internet roundtrips for inference.

A full-stack project that pairs a modern Next.js 15 frontend with a Python FastAPI backend powered by **local Whisper** for speech-to-text and **RapidFuzz** for smart, fuzzy-matched grading.

---

## Features

- **CSV Upload** — drag & drop a `Question, Answer` CSV
- **Interactive Quiz** — beautifully animated flashcards
- **Type or Speak** — answer with the keyboard or your microphone
- **Local Whisper STT** — speech transcribed entirely on your machine
- **Fuzzy Grading** — RapidFuzz scores partial / near-matches (configurable threshold)
- **Detailed Results** — per-question similarity, accuracy %, restart flow
- **Premium UI** — Tailwind, glassmorphism, gradient accents, micro-interactions
- **Toast Notifications** — feedback for every action via `react-hot-toast`
- **Error Handling** — friendly messages for every CSV / mic / API edge case
- **Mobile Responsive** — works on phones, tablets and desktops

---

## Tech Stack

**Frontend**
- Next.js 15 (App Router, React 19)
- Tailwind CSS 3.4
- Axios
- Lucide React Icons
- react-hot-toast

**Backend**
- Python FastAPI
- Local `openai-whisper` (no API calls)
- PyTorch (CPU or CUDA)
- RapidFuzz (similarity scoring)
- Pandas (CSV parsing)
- python-multipart (file uploads)

---

## Project Structure

```
ai-flashcard-system/
├── frontend/
│   ├── app/
│   │   ├── page.js              # Upload landing page
│   │   ├── quiz/page.js         # Quiz flow
│   │   ├── results/page.js      # Results & analytics
│   │   ├── layout.js
│   │   └── globals.css
│   ├── components/
│   │   ├── FileUpload.jsx
│   │   ├── Flashcard.jsx
│   │   ├── VoiceRecorder.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── FeedbackCard.jsx
│   │   ├── ResultSummary.jsx
│   │   ├── Loader.jsx
│   │   └── Navbar.jsx
│   ├── services/api.js
│   ├── hooks/useSpeechRecorder.js
│   ├── utils/{formatText.js,constants.js}
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── next.config.js
│   └── .env.local
├── backend/
│   ├── main.py
│   ├── routes/{upload.py,quiz.py,speech.py}
│   ├── services/{csv_service.py,grading_service.py,whisper_service.py}
│   ├── utils/{text_cleaner.py,similarity.py,validators.py}
│   ├── models/{request_models.py,response_models.py}
│   ├── uploads/   (runtime)
│   ├── audio/     (runtime)
│   ├── requirements.txt
│   └── .env
├── sample.csv
├── README.md
└── .gitignore
```

---

## Prerequisites

- **Node.js** 18.18+ (20 LTS recommended)
- **Python** 3.10 – 3.12
- **FFmpeg** (required by Whisper for decoding audio)
- A working **microphone** in your browser (for voice answers)

---

## 1. Backend Setup

```bash
cd ai-flashcard-system/backend
```

### Create & activate a virtual environment

**Windows (PowerShell):**
```powershell
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Python dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs FastAPI, Uvicorn, Pandas, RapidFuzz, `openai-whisper`, and PyTorch (CPU build).
If you have a CUDA-capable GPU, install the matching Torch build from <https://pytorch.org/get-started/locally/> instead.

### Install FFmpeg

Whisper shells out to FFmpeg to decode audio — it **must** be on your PATH.

**Windows (choose one):**
- Chocolatey: `choco install ffmpeg`
- Scoop: `scoop install ffmpeg`
- Winget: `winget install Gyan.FFmpeg`
- Or download from <https://www.gyan.dev/ffmpeg/builds/>, unzip, and add the `bin/` folder to your `PATH`.

**macOS:** `brew install ffmpeg`

**Linux (Debian/Ubuntu):** `sudo apt update && sudo apt install ffmpeg`

Verify: `ffmpeg -version`

### Run the API

```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server starts on <http://localhost:8000>. The first run downloads the Whisper `base` model (~140 MB) — give it a minute.

API docs at <http://localhost:8000/docs>.

---

## 2. Frontend Setup

In a **new terminal**:

```bash
cd ai-flashcard-system/frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

The frontend talks to the backend at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000` — see `.env.local`).

---

## API Endpoints

| Method | Endpoint           | Purpose                                    |
| ------ | ------------------ | ------------------------------------------ |
| `GET`  | `/`                | Service banner                             |
| `GET`  | `/health`          | Health + Whisper model status              |
| `POST` | `/upload-csv`      | Parse a flashcard CSV                      |
| `POST` | `/check-answer`    | Fuzzy-grade a user answer                  |
| `POST` | `/speech-to-text`  | Transcribe an audio blob via local Whisper |

### `POST /upload-csv`
- `multipart/form-data`, field `file` = the CSV
- Returns: `{ success, message, total_cards, flashcards: [{ question, answer }] }`

### `POST /check-answer`
```json
{
  "question": "What is AI?",
  "user_answer": "Artificial intelligence",
  "correct_answer": "Artificial Intelligence"
}
```
Returns similarity %, a `correct` flag, the threshold used, and a feedback message.

### `POST /speech-to-text`
- `multipart/form-data`, field `file` = audio blob (`webm`/`wav`/`mp3`/`m4a`/`ogg`)
- Returns `{ success, transcript, language, duration }`

---

## Configuration

### Backend (`backend/.env`)
```env
APP_HOST=0.0.0.0
APP_PORT=8000
WHISPER_MODEL=base          # tiny | base | small | medium | large
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SIMILARITY_THRESHOLD=85
MAX_UPLOAD_MB=10
MAX_AUDIO_MB=25
```

Bigger Whisper models = better accuracy, slower transcription. `base` is the sweet spot for CPU.

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## How Grading Works

1. Both the user's answer and the ground truth are normalized: lowercase, accents stripped, punctuation removed, whitespace collapsed.
2. We compute four RapidFuzz scores: `ratio`, `partial_ratio`, `token_sort_ratio`, `token_set_ratio`.
3. We take the **best** of the four. This handles word-order changes, extra filler words from speech, and substring matches.
4. If score ≥ `SIMILARITY_THRESHOLD` (default 85), the answer is marked correct.

---

## How Voice Capture Works

1. `useSpeechRecorder` opens the mic via `getUserMedia` and records with `MediaRecorder` (preferring `audio/webm;codecs=opus`).
2. On stop, the blob is sent to `/speech-to-text`.
3. The backend saves the blob to `backend/audio/`, runs Whisper in a thread (off the event loop), deletes the temp file, and returns the transcript.
4. The transcript is dropped into the answer field — the user can edit before submitting.

---

## Troubleshooting

**"Could not reach the backend"**
The frontend can't see the API. Make sure `uvicorn` is running and `NEXT_PUBLIC_API_URL` matches.

**"FFmpeg may not be installed"**
Install FFmpeg (see above) and **restart the terminal** so the new PATH is picked up.

**Whisper download is slow / fails**
On first transcription Whisper downloads model weights to `~/.cache/whisper/`. Re-run when you're on a better connection.

**Microphone access denied**
Open your browser's site permissions for `http://localhost:3000` and allow microphone access. Chrome/Edge require HTTPS in production — `localhost` is exempt.

**"No speech detected"**
The recording was silent. Speak closer to the mic and try again.

**Torch wheel won't install on Python 3.13**
Use Python 3.10–3.12. Torch wheels lag the latest Python release by a few months.

**CORS errors**
Add your frontend origin to `CORS_ORIGINS` in `backend/.env` and restart the backend.

---

## Screenshots

> _Add screenshots to `frontend/public/screenshots/` and reference them here._

- `screenshots/upload.png` — Upload page
- `screenshots/quiz.png` — Flashcard quiz
- `screenshots/results.png` — Results dashboard

---

## License

MIT — use it, fork it, ship it.
