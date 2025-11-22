@echo off
echo Starting Multilingual Translator...

start cmd /k "cd backend && ..\venv\Scripts\uvicorn main:app --reload"
start cmd /k "cd frontend && npm run dev"

echo Backend running on http://localhost:8000
echo Frontend running on http://localhost:5173
