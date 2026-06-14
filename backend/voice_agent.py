import sounddevice as sd
from scipy.io.wavfile import write
from faster_whisper import WhisperModel

from llm import get_ai_response
from text_to_speech import speak

# Whisper Model
model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)

DURATION = 5
SAMPLE_RATE = 16000

while True:

    print("\n🎤 Speak now... (say 'exit' to quit)")

    audio = sd.rec(
        int(DURATION * SAMPLE_RATE),
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype="int16"
    )

    sd.wait()

    write("recording.wav", SAMPLE_RATE, audio)

    print("📝 Transcribing...")

    segments, _ = model.transcribe("recording.wav")

    text = ""

    for segment in segments:
        text += segment.text

    text = text.strip()

    print("\n🗣 You Said:")
    print(text)

    if not text:
        print("❌ No speech detected")
        continue

    if text.lower() in ["exit", "quit", "bye"]:
        speak("Goodbye")
        break

    print("\n🤖 Thinking...")

    try:
        response = get_ai_response(text)

        print("\n🤖 AI Response:")
        print(response)

        print("\n🔊 Speaking...")
        speak(response)

    except Exception as e:
        print("Error:", e)