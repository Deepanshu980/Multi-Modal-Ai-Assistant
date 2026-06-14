# 🎙️ Context-Aware Voice Agent

<p align="center">
  <strong>AI-Powered Voice Assistant with Context Awareness, Real-Time Speech Processing, and Natural Conversations</strong>
</p>

<p align="center">
  <img src="assets/demo.gif" alt="Context Aware Voice Agent Demo" width="900">
</p>

---

## 🚀 Overview

Context-Aware Voice Agent is an intelligent conversational AI assistant capable of understanding user speech, maintaining conversational context, and generating natural voice responses in real time.

Unlike traditional voice assistants that process each query independently, this agent remembers previous interactions within a conversation, enabling more meaningful and human-like discussions.

The system combines Speech-to-Text (STT), Large Language Models (LLMs), and Text-to-Speech (TTS) technologies to deliver a seamless voice-first experience.

---

## 🎥 Demo

![Context Aware Voice Agent Demo](assets/demo.gif)

## ✨ Features

### 🎤 Real-Time Voice Interaction
- Continuous voice input from the user
- Instant speech recognition
- Low-latency responses

### 🧠 Context Awareness
- Maintains conversation history
- Understands follow-up questions
- Generates contextually relevant responses

### 🔊 Natural Voice Responses
- Converts AI-generated text into speech
- Human-like voice synthesis
- Supports multiple voices

### 🌍 Multilingual Support
- Understands multiple languages
- Generates responses in the user's language
- Cross-language conversation support

### ⚡ Fast AI Responses
- Powered by modern Large Language Models
- Optimized for real-time interactions

### 📱 Responsive User Interface
- Clean and modern frontend
- Mobile-friendly design
- Interactive conversation experience

---

## 🏗️ Architecture

```text
User Voice
     │
     ▼
Speech-to-Text (STT)
     │
     ▼
Context Manager
     │
     ▼
Large Language Model (LLM)
     │
     ▼
Text-to-Speech (TTS)
     │
     ▼
Voice Response
```

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- JavaScript

### Backend
- Python
- FastAPI
- WebSockets

### AI Technologies
- OpenAI GPT Models
- Context Management
- Prompt Engineering

### Speech Technologies
- Deepgram / Whisper (Speech-to-Text)
- Edge-TTS / Azure Speech Services (Text-to-Speech)

---

## 📂 Project Structure

```bash
context-aware-voice-agent/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── voice_agent.py
│   ├── api.py
│   ├── config.py
│   └── requirements.txt
│
├── assets/
│   └── demo.gif
│
├── .env
├── README.md
└── LICENSE
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/context-aware-voice-agent.git
cd context-aware-voice-agent
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key
DEEPGRAM_API_KEY=your_api_key
AZURE_SPEECH_KEY=your_api_key
AZURE_REGION=your_region
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd backend
uv run python voice_agent.py
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 How It Works

1. User speaks through the microphone.
2. Speech is converted into text using Speech-to-Text.
3. Previous conversation history is retrieved.
4. Context and user query are sent to the LLM.
5. AI generates an intelligent response.
6. Response is converted into speech.
7. Audio is played back to the user.
8. Conversation continues naturally.

---

## 💡 Use Cases

- Personal AI Assistant
- Customer Support Automation
- AI Tutor & Education
- Accessibility Applications
- Smart Home Integrations
- Enterprise Voice Agents

---

## 🔮 Future Enhancements

- Long-Term Memory
- Emotion Detection
- Voice Cloning
- Personalized User Profiles
- Mobile Application
- Multi-Agent Collaboration
- Meeting Summarization
- Voice Command Automation

---

## 🤝 Contributing

Contributions are welcome!

```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

Then create a Pull Request.

---

## ⭐ Support

If you found this project useful:

- ⭐ Star the repository
- 🍴 Fork the project
- 🛠️ Contribute improvements

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

### Deepanshu Thakur

AI/ML Engineer | Full-Stack Developer

Passionate about building AI-powered products, intelligent voice assistants, machine learning systems, and scalable full-stack applications.

- GitHub: https://github.com/Deepanshu980
- LinkedIn: Add your LinkedIn profile here
