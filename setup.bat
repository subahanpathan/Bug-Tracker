@echo off
REM Bug Tracker - Quick Start Setup Script for Windows

echo ================================
echo Bug Tracker - MERN Setup
echo ================================
echo.

REM Step 1: Check Node.js
echo 1️⃣  Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js v16+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Step 2: Install Backend Dependencies
echo 2️⃣  Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install backend dependencies
    cd ..
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..
echo.

REM Step 3: Install Frontend Dependencies
echo 3️⃣  Installing Frontend Dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    exit /b 1
)
echo ✅ Frontend dependencies installed
cd ..
echo.

REM Step 4: Check for .env files
echo 4️⃣  Checking Environment Configuration...
if not exist "backend\.env" (
    echo ⚠️  backend\.env not found
    echo    Creating from template...
    copy backend\.env.example backend\.env
    echo    ℹ️  Please edit backend\.env with your Supabase credentials
)

if not exist "frontend\.env" (
    echo ⚠️  frontend\.env not found
    echo    Creating from template...
    copy frontend\.env.example frontend\.env
    echo    ℹ️  Please edit frontend\.env with your API URL
)
echo.

REM Step 5: Summary
echo ================================
echo ✅ Setup Complete!
echo ================================
echo.
echo 📋 NEXT STEPS:
echo.
echo 1. Configure Environment Variables:
echo    - Edit backend\.env with Supabase credentials
echo    - Edit frontend\.env with API URL
echo.
echo 2. Setup Supabase Database:
echo    - Go to https://supabase.com
echo    - Create a new project
echo    - Run SQL from database/schema.sql
echo    - Copy API keys to .env files
echo.
echo 3. Start Development Servers:
echo.
echo    Command Prompt 1 (Backend):
echo    ^> cd backend
echo    ^> npm run dev
echo.
echo    Command Prompt 2 (Frontend):
echo    ^> cd frontend
echo    ^> npm run dev
echo.
echo 4. Access Application:
echo    - Frontend: http://localhost:3000
echo    - Backend: http://localhost:5000/api
echo.
echo ================================
echo.
pause
