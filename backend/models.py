from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    history = relationship("TranslationHistory", back_populates="owner")

class TranslationHistory(Base):
    __tablename__ = "translation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    input_type = Column(String) # text, voice, image
    source_language = Column(String)
    target_language = Column(String)
    original_content = Column(String)
    translated_content = Column(String)
    
    owner = relationship("User", back_populates="history")
