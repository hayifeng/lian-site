#!/bin/bash

# Photo Sharing Site - Development Startup Script

set -e

echo "📷 Photo Sharing Site - Starting..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Install dependencies if needed
if [ ! -d "$PROJECT_ROOT/app/node_modules" ]; then
    echo "Installing root dependencies..."
    cd "$PROJECT_ROOT/app"
    npm install
fi

if [ ! -d "$PROJECT_ROOT/app/frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$PROJECT_ROOT/app/frontend"
    npm install
fi

if [ ! -d "$PROJECT_ROOT/app/backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd "$PROJECT_ROOT/app/backend"
    npm install
fi

# Check database
if [ ! -f "$PROJECT_ROOT/app/database/dev.db" ]; then
    print_warning "Database not found. Running migrations..."
    cd "$PROJECT_ROOT/app/database"
    npx prisma migrate dev --name init
    print_status "Database migrations completed"
fi

print_status "All dependencies installed"

# Start backend
echo ""
echo "Starting backend server (port 3001)..."
cd "$PROJECT_ROOT/app/backend"
npm run dev &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        print_status "Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Backend failed to start. Check logs."
        exit 1
    fi
    sleep 1
done

# Start frontend
echo ""
echo "Starting frontend server (port 5173)..."
cd "$PROJECT_ROOT/app/frontend"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend
echo "Waiting for frontend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_status "Frontend is ready!"
        break
    fi
    sleep 1
done

echo ""
echo "============================================"
echo -e "${GREEN}🎉 Photo Sharing Site is running!${NC}"
echo "============================================"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo "  API Docs: http://localhost:3001/api/docs"
echo ""
echo "  Demo Account:"
echo "    Email:    demo@example.com"
echo "    Password: demo123"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "============================================"

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    print_status "Servers stopped"
}

trap cleanup EXIT

# Wait for any process to exit
wait
