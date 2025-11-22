import google.generativeai as genai
import os
from dotenv import load_dotenv
from gtts import gTTS
import io
import PIL.Image
import base64

import pathlib
env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def translate_text(text: str, target_language: str):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Handle romanized versions
        romanized_map = {
            'hinglish': 'Hindi',
            'romanized marathi': 'Marathi',
            'romanized bengali': 'Bengali',
            'romanized tamil': 'Tamil',
            'romanized telugu': 'Telugu',
            'romanized gujarati': 'Gujarati',
            'romanized kannada': 'Kannada',
            'romanized malayalam': 'Malayalam',
            'romanized punjabi': 'Punjabi',
            'romanized urdu': 'Urdu',
            'romanized odia': 'Odia',
            'romanized assamese': 'Assamese',
            'romanized japanese': 'Japanese'
        }
        
        target_lower = target_language.lower()
        if target_lower in romanized_map:
            base_lang = romanized_map[target_lower]
            prompt = f"Translate the following text to {base_lang} but write it using English letters (romanized {base_lang}). Return only the translated text.\n\nText: {text}"
        else:
            prompt = f"Translate the following text to {target_language}. Return only the translated text.\n\nText: {text}"
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error translating text: {e}")
        return None

def transcribe_audio(audio_file_path: str):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        # Upload the file to Gemini
        audio_file = genai.upload_file(path=audio_file_path)
        
        # Generate content using the audio file
        response = model.generate_content([
            "Transcribe the following audio file exactly as spoken.",
            audio_file
        ])
        
        # Clean up the file from Gemini storage (optional but good practice)
        # audio_file.delete() # Not strictly necessary for free tier immediately, but good practice. 
        # However, the python SDK might not have delete() on the file object directly in all versions, 
        # usually it's genai.delete_file(audio_file.name).
        
        return response.text.strip()
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return None

def analyze_image(image_data: str):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = PIL.Image.open(io.BytesIO(image_bytes))
        
        response = model.generate_content([
            "Extract all text from this image and translate it to English. If there is no text, describe the image.",
            image
        ])
        return response.text.strip()
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return None

def text_to_speech(text: str, language: str = 'en'):
    try:
        # Map full language names to codes
        lang_map = {
            'Hindi': 'hi',
            'Spanish': 'es',
            'French': 'fr',
            'German': 'de',
            'Japanese': 'ja',
            'Tamil': 'ta',
            'Telugu': 'te',
            'English': 'en',
            'Marathi': 'mr',
            'Bengali': 'bn',
            'Gujarati': 'gu',
            'Kannada': 'kn',
            'Malayalam': 'ml',
            'Punjabi': 'pa',
            'Urdu': 'ur',
            'Odia': 'or',
            'Assamese': 'as'
        }
        
        # Default to 'en' if not found, or use the code if it's already a code
        lang_code = lang_map.get(language, language if len(language) == 2 else 'en')
        
        print(f"DEBUG TTS: Generating speech for language: {language} -> {lang_code}")
        
        # gTTS generates speech
        tts = gTTS(text=text, lang=lang_code)
        
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        audio_data = fp.read()
        
        print(f"DEBUG TTS: Generated {len(audio_data)} bytes of audio")
        return audio_data
    except Exception as e:
        print(f"Error generating speech: {e}")
        return None
