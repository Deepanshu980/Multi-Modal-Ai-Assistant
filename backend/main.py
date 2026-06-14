from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from services.live_stt import transcribe_audio
from llm import get_ai_response_with_history
from text_to_speech import generate_speech_file
import shutil
import os

app = FastAPI()

# Add CORS Middleware to connect with the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    message: str
    history: List[ChatMessage]
    session_id: Optional[str] = None
    regenerate: Optional[bool] = False

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat(payload: ChatPayload):
    try:
        # Map conversation history
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]
        
        # Generate response using Gemini
        response_text = get_ai_response_with_history(history_dicts)
        
        return {
            "response": response_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(None), file: UploadFile = File(None)):
    upload_file = audio or file
    if not upload_file:
        raise HTTPException(status_code=400, detail="No audio file uploaded. Please upload a file under the 'audio' or 'file' key.")

    file_path = os.path.join(UPLOAD_DIR, upload_file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    text = transcribe_audio(file_path)

    return {
        "filename": upload_file.filename,
        "text": text,
        "transcript": text,
        "transcription": text
    }

@app.post("/voice/chat")
async def voice_chat(audio: UploadFile = File(None), file: UploadFile = File(None)):
    """
    Voice-to-voice chat endpoint.
    Takes audio input, transcribes it, generates AI response, and returns speech audio.
    """
    upload_file = audio or file
    if not upload_file:
        raise HTTPException(status_code=400, detail="No audio file uploaded. Please upload a file under the 'audio' or 'file' key.")

    try:
        # Save uploaded audio file
        file_path = os.path.join(UPLOAD_DIR, upload_file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        # Step 1: Transcribe audio to text
        user_text = transcribe_audio(file_path)
        if not user_text.strip():
            raise HTTPException(status_code=400, detail="No speech detected in audio")
        
        # Step 2: Get AI response
        response_text = get_ai_response_with_history([
            {"role": "user", "content": user_text}
        ])
        
        # Step 3: Convert response to speech
        audio_file_path = await generate_speech_file(response_text)
        
        # Step 4: Return audio file
        return FileResponse(
            path=audio_file_path,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=response.mp3"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))