# Aria — Context-Aware Multimodal Voice Agent Frontend

A premium, production-ready React frontend for a voice-powered AI assistant. Built with Vite, Tailwind CSS, and Axios — featuring a dark glassmorphism UI, real-time voice recording, markdown rendering, and full chat history persistence.

---

## ✨ Features

- **Voice Interaction** — Record audio via browser microphone, auto-transcribe via backend, get AI response
- **Text Chat** — Full markdown + code syntax highlighting support
- **Glassmorphism UI** — Dark theme with aurora gradient accents
- **Chat History** — Persisted in `localStorage`, grouped by date
- **AI Message Actions** — Copy, regenerate, text-to-speech per message
- **Typing Indicator** — Animated while awaiting AI response
- **Waveform Visualizer** — Live audio level bars during recording
- **Responsive** — Mobile sidebar drawer + desktop persistent layout
- **Suggestion Chips** — Clickable prompt starters on empty chat
- **Download Chat** — Export any conversation as `.txt`
- **Error Handling** — Toast banners with dismiss, graceful fallbacks

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Left nav: chat history, new chat, settings
│   ├── Navbar.jsx           # Top bar: logo, hamburger, status
│   ├── ChatWindow.jsx       # Message list + welcome screen
│   ├── MessageBubble.jsx    # User/AI bubble with markdown & actions
│   ├── VoiceRecorder.jsx    # Mic button + waveform + timer
│   └── TypingIndicator.jsx  # Animated dots while AI responds
├── pages/
│   └── Home.jsx             # Root layout + all state & logic
├── services/
│   └── api.js               # Axios instance + sendMessage / uploadAudio / getResponse
├── hooks/
│   └── useVoiceRecorder.js  # MediaRecorder + AudioContext hook
├── App.jsx
├── main.jsx
└── index.css                # Tailwind + custom CSS (glass, aurora, animations)
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your backend URL:
# VITE_API_URL=http://localhost:8000
```

### 3. Run dev server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
npm run preview
```

---

## 🔌 Backend API Contract

The frontend expects these endpoints at `VITE_API_URL`:

### `POST /chat`
Send a text message and receive an AI response.

**Request:**
```json
{
  "message": "string",
  "history": [{ "role": "user|assistant", "content": "string" }],
  "session_id": "string (optional)"
}
```

**Response:**
```json
{
  "response": "string",
  "session_id": "string (optional)"
}
```

---

### `POST /transcribe`
Upload audio for speech-to-text transcription.

**Request:** `multipart/form-data` with field `audio` (WebM/Ogg blob)

**Response:**
```json
{
  "text": "transcribed text here",
  "language": "en (optional)",
  "duration": 3.2
}
```

---

### `GET /health` *(optional)*
Health check. Returns `200 OK`.

---

## 🎨 Design System

| Token | Value |
|---|---|
| `surface-900` | `#0a0b0f` — page background |
| `surface-800` | `#11131a` — sidebar |
| `surface-700` | `#181b24` — cards |
| `surface-600` | `#1e222e` — active items |
| `accent-500` | `#6366f1` — indigo primary |
| `aurora-cyan` | `#22d3ee` — gradient accent |
| `aurora-purple` | `#a78bfa` — gradient accent |

Custom CSS utilities: `.glass`, `.glass-lighter`, `.aurora-border`, `.gradient-text`, `.message-user`, `.message-ai`

---

## 🧩 Key Components

### `useVoiceRecorder` hook
```js
const {
  isRecording,       // boolean
  formattedDuration, // "01:23"
  audioLevel,        // 0–1 float (live volume)
  error,             // string | null
  audioBlob,         // Blob when stopped
  startRecording,
  stopRecording,
  cancelRecording,
} = useVoiceRecorder({ onComplete: (blob) => ..., maxDuration: 120 })
```

### `api.js` service layer
```js
import { sendMessage, uploadAudio, getResponse } from './services/api'

// Text chat
const data = await sendMessage(text, history, sessionId)

// Voice transcription
const { text } = await uploadAudio(audioBlob)

// Regenerate last AI response
const data = await getResponse(userMessage, history)
```

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `axios` | HTTP client with interceptors |
| `react-icons` | Icon library (Feather icons) |
| `react-markdown` | Markdown rendering in AI messages |
| `remark-gfm` | GitHub Flavored Markdown plugin |
| `react-syntax-highlighter` | Code block highlighting |
| `uuid` | Unique IDs for chats and messages |

---

## 🔐 Permissions

The app requests **microphone access** via `getUserMedia`. Users must allow this in their browser for voice features to work. On HTTPS hosts this is handled automatically; on `localhost` it works without SSL.

---

## 🌐 Deployment

### Vercel / Netlify
1. Set `VITE_API_URL` as an environment variable in the dashboard
2. Build command: `npm run build`
3. Output directory: `dist`

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 🛣 Roadmap / Future Integrations

- [ ] Streaming SSE responses (token-by-token)
- [ ] Voice Agent WebSocket endpoint
- [ ] Multi-modal image upload
- [ ] User auth + cloud sync
- [ ] Custom persona / system prompt editor
- [ ] Mobile PWA with offline support
