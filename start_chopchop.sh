#!/bin/bash

# ChopChop Full-Stack Startup Script

echo "🚀 Starting ChopChop Full-Stack Application..."

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  Virtual environment not activated. Activating..."
    source venv/bin/activate
fi

# Start Python backend
echo "🐍 Starting Python backend server..."
cd backend
python nova_backend_simplified.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start Next.js frontend
echo "⚛️  Starting Next.js frontend..."
cd nova-chat-frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Both servers are starting!"
echo ""
echo "📡 Backend API: http://localhost:8000"
echo "🌐 Frontend UI: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
