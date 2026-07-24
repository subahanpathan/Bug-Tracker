#!/bin/bash
# Bug Tracker - Quick Start Setup Script

echo "================================"
echo "Bug Tracker - MERN Setup"
echo "================================"
echo ""

# Step 1: Check Node.js
echo "1️⃣  Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v16+"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"
echo ""

# Step 2: Install Backend Dependencies
echo "2️⃣  Installing Backend Dependencies..."
cd backend
if npm install; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..
echo ""

# Step 3: Install Frontend Dependencies
echo "3️⃣  Installing Frontend Dependencies..."
cd frontend
if npm install; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..
echo ""

# Step 4: Check for .env files
echo "4️⃣  Checking Environment Configuration..."
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env not found"
    echo "   Creating from template..."
    cp backend/.env.example backend/.env
    echo "   ℹ️  Please edit backend/.env with your Supabase credentials"
fi

if [ ! -f frontend/.env ]; then
    echo "⚠️  frontend/.env not found"
    echo "   Creating from template..."
    cp frontend/.env.example frontend/.env
    echo "   ℹ️  Please edit frontend/.env with your API URL"
fi
echo ""

# Step 5: Summary
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Configure Environment Variables:"
echo "   - Edit backend/.env with Supabase credentials"
echo "   - Edit frontend/.env with API URL"
echo ""
echo "2. Setup Supabase Database:"
echo "   - Go to https://supabase.com"
echo "   - Create a new project"
echo "   - Run SQL from database/schema.sql"
echo "   - Copy API keys to .env files"
echo ""
echo "3. Start Development Servers:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ cd frontend"
echo "   $ npm run dev"
echo ""
echo "4. Access Application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000/api"
echo ""
echo "================================"
