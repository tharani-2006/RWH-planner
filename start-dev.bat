@echo off
echo 🚀 Starting RWH-Erode Development Environment
echo.

echo 📦 Installing dependencies...
echo.

echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo Installing frontend dependencies...
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
call npm install
cd ..

echo Installing ML dependencies...
cd ml_training
pip install -r requirements.txt
cd ..

echo.
echo ✅ Dependencies installed!
echo.

echo 🧠 Training ML models (if not already trained)...
cd ml_training
if not exist "models\metadata.json" (
    echo Training models for the first time...
    python simple_ml_trainer.py
) else (
    echo Models already trained, skipping...
)
cd ..

echo.
echo 🎯 Starting all services...
echo.

echo Starting ML API on port 5001...
start "ML API" cmd /k "cd ml_training && python quick_api.py"

timeout /t 3 /nobreak > nul

echo Starting Backend API on port 3001...
start "Backend API" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend on port 3000...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo 🎉 All services starting!
echo.
echo 📍 Access points:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001/api/health
echo   ML API:   http://localhost:5001/health
echo.
echo Press any key to exit...
pause > nul
