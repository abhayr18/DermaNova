@echo off
title DermaNova AI - Local Development Launcher
color 0A

echo =======================================================================
echo          DermaNova Clinical AI - Local Presentation Runner
echo =======================================================================
echo.
echo [1/3] Verifying Python and Node.js environments...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in PATH. Please ensure Python is installed.
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH. Please ensure Node.js is installed.
    pause
    exit /b 1
)

echo [OK] Python and Node.js detected.
echo.
echo [2/3] Starting Local FastAPI Backend on http://127.0.0.1:8000 ...
start "DermaNova Backend (FastAPI :8000)" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Starting Local Next.js Frontend on http://localhost:3000 ...
start "DermaNova Frontend (Next.js :3000)" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================================
echo  DermaNova AI is launching locally!
echo.
echo  - Backend API:  http://127.0.0.1:8000/api/v1/health
echo  - Swagger Docs: http://127.0.0.1:8000/docs
echo  - Frontend Web: http://localhost:3000
echo.
echo  Opening browser in 4 seconds...
echo =======================================================================
timeout /t 4 /nobreak >nul
start http://localhost:3000
