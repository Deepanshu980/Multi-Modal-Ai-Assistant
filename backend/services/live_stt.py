from faster_whisper import WhisperModel
import os

# Initialize Whisper model once on startup
# Using "tiny", cpu device, and int8 quantization as in voice_agent.py
print("Loading Whisper model...")
model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)
print("Whisper model loaded successfully.")

def transcribe_audio(file_path: str) -> str:
    """
    Transcribes the audio file at the given path using the Faster-Whisper model.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    segments, info = model.transcribe(file_path)
    
    text = ""
    for segment in segments:
        text += segment.text
        
    return text.strip()
