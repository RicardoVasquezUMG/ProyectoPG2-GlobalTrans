@echo off
title ProyectoPG2 - GlobalTrans

echo [1/2] Iniciando Backend (FastAPI)...
start "Backend - FastAPI" cmd /k "cd /d "%~dp0backend" && call .venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Iniciando Frontend (React + Vite)...
start "Frontend - React Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"
