@echo off
title Recycling Route Optimizer Launcher
color 0A
echo =======================================================
echo   Starting Recycling Center Route Optimizer Servers...
echo =======================================================
echo.

:: 1. Start Backend in separate window
echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Recycling Backend (FastAPI)" /min cmd /c "cd /d d:\Recycling project\backend && C:\Users\DELL\anaconda3\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: 2. Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

:: 3. Start Frontend in separate window
echo [2/3] Starting React Frontend on http://localhost:5173 ...
start "Recycling Frontend (Vite)" /min cmd /c "cd /d d:\Recycling project\frontend && npm run dev -- --host 0.0.0.0 --port 5173"

:: 4. Wait 3 seconds for Vite to compile
timeout /t 3 /nobreak >nul

:: 5. Open browser automatically
echo [3/3] Opening application in your web browser...
start http://localhost:5173

echo.
echo =======================================================
echo   Application is now running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://127.0.0.1:8000/docs
echo =======================================================
echo (You can close this window now. The servers remain active in background.)
timeout /t 5

