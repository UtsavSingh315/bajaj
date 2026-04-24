#!/bin/bash
# Quick deployment script for Vercel

echo "🚀 BFHL Deployment Script"
echo "========================="

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Check if node_modules exist
if [ ! -d backend/node_modules ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d frontend/node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "✅ Dependencies installed"
echo ""
echo "Choose your deployment method:"
echo ""
echo "1. Vercel CLI (requires 'vercel' globally installed)"
echo "   npm install -g vercel"
echo "   vercel --prod"
echo ""
echo "2. GitHub + Vercel Web UI (Recommended)"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push"
echo "   Then go to vercel.com and import repo"
echo ""
echo "For local testing:"
echo "   Terminal 1: cd backend && node server.js"
echo "   Terminal 2: cd frontend && npm start"
echo ""
echo "Visit http://localhost:3000"
