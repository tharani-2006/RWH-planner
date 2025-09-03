#!/bin/bash

echo "🚀 Starting RWH-Erode Development Environment"
echo ""

echo "📦 Installing dependencies..."
echo ""

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Installing ML dependencies..."
cd ml_training
pip install -r requirements.txt
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""

echo "🧠 Training ML models (if not already trained)..."
cd ml_training
if [ ! -f "models/metadata.json" ]; then
    echo "Training models for the first time..."
    python simple_ml_trainer.py
else
    echo "Models already trained, skipping..."
fi
cd ..

echo ""
echo "🎯 Starting all services..."
echo ""

echo "Starting ML API on port 5001..."
cd ml_training
python quick_api.py &
ML_PID=$!
cd ..

sleep 3

echo "Starting Backend API on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting Frontend on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 All services started!"
echo ""
echo "📍 Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001/api/health"
echo "  ML API:   http://localhost:5001/health"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped!"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for user input
wait
