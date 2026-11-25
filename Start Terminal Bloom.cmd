@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js from https://nodejs.org then run this launcher again.
  pause
  exit /b 1
)
echo Open http://localhost:8787 in your browser once the server is ready.
node server.cjs
pause
