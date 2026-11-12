@echo off
title Stop Recycling App Servers
color 0C
echo Stopping Recycling project backend and frontend processes...
taskkill /f /im python.exe /fi "WINDOWTITLE eq Recycling Backend*" 2>nul
taskkill /f /im node.exe /fi "WINDOWTITLE eq Recycling Frontend*" 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul
echo Done! Servers stopped.
timeout /t 3

