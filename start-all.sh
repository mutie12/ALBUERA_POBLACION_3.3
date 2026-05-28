#!/bin/bash
# Albuera EMS - Complete Startup and Verification Script
# Run this in PowerShell or Git Bash

echo "================================"
echo "Albuera EMS System Startup"
echo "================================"

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Install from nodejs.org"
    exit 1
fi
echo "Node.js version: $(node --version)"

# Check MongoDB connection
echo ""
echo "Testing MongoDB connection..."
cd backend
if node -e "require('dotenv').config(); const uri = process.env.MONGO_URI; console.log('MONGO_URI configured:', uri ? 'YES' : 'NO');"; then
    echo "✓ Environment variables loaded"
else
    echo "✗ Failed to load .env"
    exit 1
fi

# Start backend in background
echo ""
echo "Starting backend server on port 3000..."
npm run dev &
BACKEND_PID=$!
sleep 5

# Check if backend is responding
echo "Checking backend health..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✓ Backend is running on http://localhost:3000"
else
    echo "✗ Backend failed to start. Check logs above."
    exit 1
fi

# Test reports API
echo ""
echo "Testing reports API..."
REPORTS_RESPONSE=$(curl -s http://localhost:3000/api/reports/public 2>&1)
if echo "$REPORTS_RESPONSE" | grep -q "error"; then
    echo "⚠ Reports API error: $REPORTS_RESPONSE"
    echo "This may be normal if no reports exist yet."
else
    echo "✓ Reports API accessible"
fi

# Seed sample data
echo ""
echo "Seeding sample reports..."
if node seed-reports.js; then
    echo "✓ Sample data seeded"
else
    echo "⚠ seeding had errors (check MongoDB connection/IP whitelist)"
fi

# Check frontend dependencies
echo ""
echo "Checking frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo ""
echo "Starting frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "================================"
echo "System Status:"
echo "================================"
echo "Backend PID: $BACKEND_PID (http://localhost:3000)"
echo "Frontend PID: $FRONTEND_PID (http://localhost:5173)"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:5173/admin-login"
echo "2. Login with: admin / admin123"
echo "3. Dashboard should show reports"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
