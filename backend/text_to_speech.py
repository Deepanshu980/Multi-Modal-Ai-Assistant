import asyncio
import edge_tts
import os
from datetime import datetime

VOICE = "en-IN-NeerjaNeural"
AUDIO_DIR = "audio_responses"

# Ensure audio directory exists
os.makedirs(AUDIO_DIR, exist_ok=True)

async def _speak(text):
    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE
    )
    await communicate.save("response.mp3")

def speak(text):
    asyncio.run(_speak(text))
    os.system("start response.mp3")

async def generate_speech_file(text: str) -> str:
    """
    Generate speech from text and save to file without playing it.
    Returns the file path.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
    filename = f"speech_{timestamp}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)
    
    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE
    )
    await communicate.save(filepath)
    return filepath