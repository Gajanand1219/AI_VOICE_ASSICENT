# realtime_voice_assistant/main.py

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from openai import AzureOpenAI
from dotenv import load_dotenv
import os
import requests
import io
from typing import Generator
import aiohttp

# Load environment variables
load_dotenv()

# === FastAPI Setup ===
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Azure GPT-4o Setup ===
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_API_BASE"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION")
)
DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME")

# === Azure TTS Setup ===
AZURE_TTS_API_KEY = os.getenv("AZURE_TTS_API_KEY")
AZURE_TTS_REGION = os.getenv("AZURE_TTS_REGION", "swedencentral")
AZURE_TTS_VOICE = os.getenv("AZURE_TTS_VOICE", "en-IN-PrabhatNeural")

# === Chat History ===
chat_history = []

class Prompt(BaseModel):
    text: str


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    api_key = os.getenv("DEEPGRAM_API_KEY")
    audio = await file.read()
    url = "https://api.deepgram.com/v1/listen"
    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": "audio/webm"
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, data=audio) as response:
            if response.status != 200:
                return {"error": f"Deepgram error {response.status}", "details": await response.text()}
            data = await response.json()
            transcript = data["results"]["channels"][0]["alternatives"][0]["transcript"]
            return {"transcript": transcript}


@app.post("/chat-stream")
def chat_stream(prompt: Prompt):
    user_input = prompt.text.strip()

    messages = [
        {"role": "system", "content": "You are a helpful voice assistant. Keep responses short and clean."}
    ]
    for entry in chat_history:
        messages.append({"role": "user", "content": entry["user"]})
        messages.append({"role": "assistant", "content": entry["assistant"]})
    messages.append({"role": "user", "content": user_input})

    def generate() -> Generator[str, None, None]:
        res = client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=messages,
            stream=True
        )
        full_reply = ""
        for chunk in res:
            # ✅ Defensive check
            if not chunk.choices or not chunk.choices[0].delta:
                continue
            delta = chunk.choices[0].delta
            if hasattr(delta, "content") and delta.content:
                full_reply += delta.content
                yield delta.content
        chat_history.append({"user": user_input, "assistant": full_reply})

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/speak")
def speak(prompt: Prompt):
    url = f"https://{AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_TTS_API_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
    }
    ssml = f"""
    <speak version='1.0' xml:lang='en-US'>
        <voice name='{AZURE_TTS_VOICE}'>{prompt.text}</voice>
    </speak>
    """
    response = requests.post(url, headers=headers, data=ssml.encode("utf-8"))
    if response.status_code != 200:
        return {"error": "TTS failed", "details": response.text}
    return StreamingResponse(io.BytesIO(response.content), media_type="audio/mpeg")


@app.get("/history")
def get_history():
    return {"history": chat_history}

@app.delete("/history")
def clear_history():
    chat_history.clear()
    return {"message": "Chat history cleared"}


