from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def get_ai_response(prompt: str):

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text

def get_ai_response_with_history(history: list) -> str:
    """
    Generates content using the Gemini client with the full conversation history.
    Maps frontend roles ('user', 'assistant') to Gemini roles ('user', 'model').
    """
    contents = []
    for msg in history:
        role = "model" if msg.get("role") == "assistant" else "user"
        contents.append({
            "role": role,
            "parts": [{"text": msg.get("content")}]
        })
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents
    )
    return response.text