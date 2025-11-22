from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import models, database, auth
from services import openai_service, gemini_service
import google.generativeai as genai
import os

# Select AI Provider
AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()
if AI_PROVIDER == "openai":
    ai_service = openai_service
else:
    ai_service = gemini_service
from database import engine, get_db
import base64
import shutil
import os
import PIL.Image
import io

# Initialize FastAPI app
app = FastAPI(title="Live Multimodal Translation API", version="1.0.0")

# Configure CORS for production and development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://openai-project-weaz.vercel.app",
        "https://openai-project-2xblxtsnh-sahil-akas-projects.vercel.app",
        "https://openai-project-git-main-sahil-akas-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
models.Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except auth.JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/users", response_model=dict)
def create_user(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Using OAuth2PasswordRequestForm for simplicity, treating username as email
    db_user = db.query(models.User).filter(models.User.email == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created successfully"}

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/translate/text")
def translate_text_endpoint(
    text: str = Form(...),
    target_language: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    translated = ai_service.translate_text(text, target_language)
    if not translated:
        raise HTTPException(status_code=500, detail="Translation failed")
    
    # Save to history
    history = models.TranslationHistory(
        user_id=current_user.id,
        input_type="text",
        source_language="auto",
        target_language=target_language,
        original_content=text,
        translated_content=translated
    )
    db.add(history)
    db.commit()
    
    return {"translated_text": translated}

@app.post("/translate/voice")
async def translate_voice_endpoint(
    file: UploadFile = File(...),
    target_language: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save temp file
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # with open(temp_filename, "rb") as audio_file:
        transcript = ai_service.transcribe_audio(temp_filename)
        
        if not transcript:
             raise HTTPException(status_code=500, detail="Transcription failed")
             
        translated = ai_service.translate_text(transcript, target_language)
        
        # Save to history
        history = models.TranslationHistory(
            user_id=current_user.id,
            input_type="voice",
            source_language="auto",
            target_language=target_language,
            original_content=transcript,
            translated_content=translated
        )
        db.add(history)
        db.commit()
        
        return {"transcript": transcript, "translated_text": translated}
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.post("/translate/image")
async def translate_image_endpoint(
    file: UploadFile = File(...),
    target_language: str = Form(default="English"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    base64_image = base64.b64encode(contents).decode('utf-8')
    
    # Call analyze_image with target language
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        image_bytes = base64.b64decode(base64_image)
        image = PIL.Image.open(io.BytesIO(image_bytes))
        
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
            prompt = f"Extract all text from this image. If there is text, translate it to {base_lang} but write it using English letters (romanized {base_lang}). If there is no text, describe the image in romanized {base_lang} (using English letters)."
        else:
            prompt = f"Extract all text from this image and translate it to {target_language}. If there is no text, describe the image in {target_language}."
        
        response = model.generate_content([prompt, image])
        analysis = response.text.strip()
    except Exception as e:
        print(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail="Image analysis failed")
        
    # Save to history
    history = models.TranslationHistory(
        user_id=current_user.id,
        input_type="image",
        source_language="auto",
        target_language=target_language,
        original_content="[Image Upload]",
        translated_content=analysis
    )
    db.add(history)
    db.commit()
    
    return {"analysis": analysis}

@app.post("/tts")
def tts_endpoint(
    text: str = Form(...),
    language: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"TTS Request: text='{text[:50]}...', language='{language}'")
    audio_content = ai_service.text_to_speech(text, language)
    if not audio_content:
        raise HTTPException(status_code=500, detail="TTS generation failed")
    
    print(f"TTS Response: {len(audio_content)} bytes")
    from fastapi.responses import Response
    return Response(content=audio_content, media_type="audio/mpeg")

@app.post("/detect-language")
def detect_language_endpoint(
    text: str = Form(...),
    current_user: models.User = Depends(get_current_user)
):
    """Detect the language of input text"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"Detect the language of this text and return ONLY the language name (e.g., 'Hindi', 'English', 'Spanish'). Text: {text}"
        response = model.generate_content(prompt)
        detected_lang = response.text.strip()
        return {"detected_language": detected_lang}
    except Exception as e:
        print(f"Error detecting language: {e}")
        raise HTTPException(status_code=500, detail="Language detection failed")

@app.post("/pronunciation")
def pronunciation_endpoint(
    text: str = Form(...),
    target_language: str = Form(...),
    current_user: models.User = Depends(get_current_user)
):
    """Get romanized pronunciation guide"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"Provide a romanized pronunciation guide for this {target_language} text. Show how to pronounce it using English letters. Text: {text}"
        response = model.generate_content(prompt)
        return {"pronunciation": response.text.strip()}
    except Exception as e:
        print(f"Error generating pronunciation: {e}")
        raise HTTPException(status_code=500, detail="Pronunciation generation failed")

@app.get("/history")
def get_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.TranslationHistory).filter(models.TranslationHistory.user_id == current_user.id).order_by(models.TranslationHistory.timestamp.desc()).all()

