from openai import OpenAI
import os
from dotenv import load_dotenv
import base64

import pathlib
env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

def translate_text(text: str, target_language: str):
    if not client:
        print("OpenAI API key not found.")
        return None
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"You are a helpful translator. Translate the following text to {target_language}. Return only the translated text."},
                {"role": "user", "content": text}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error translating text: {e}")
        return None

def transcribe_audio(audio_file_path):
    if not client:
        print("OpenAI API key not found.")
        return None
    try:
        with open(audio_file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        return transcript.text
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return None

def analyze_image(image_data: str):
    if not client:
        print("OpenAI API key not found.")
        return None
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract all text from this image and translate it to English. If there is no text, describe the image."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            },
                        },
                    ],
                }
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return None

def text_to_speech(text: str, language: str = 'en'):
    if not client:
        print("OpenAI API key not found.")
        return None
    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text
        )
        return response.content
    except Exception as e:
        print(f"Error generating speech: {e}")
        return None
