@echo off
echo ========================================
echo   LinguaFlow - Mobile Access Setup
echo ========================================
echo.
echo Your IP Address: 100.100.9.216
echo.
echo Starting servers...
echo.

REM Start backend on all network interfaces
echo [1/2] Starting Backend...
start "LinguaFlow Backend" cmd /k "cd /d %~dp0 && .\venv\Scripts\python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

REM Start frontend with network access
echo [2/2] Starting Frontend...
start "LinguaFlow Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev -- --host"

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Access from your phone:
echo   http://100.100.9.216:5173
echo.
echo Make sure your phone is on the same WiFi!
echo.
echo Press any key to stop servers...
pause > nul
