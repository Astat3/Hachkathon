#!/bin/bash

# ProspectAI - Quick Start Script
# This script helps you set up the project quickly

echo "🚀 ProspectAI - Quick Start Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. You'll need a PostgreSQL database."
    echo "   Options:"
    echo "   - Install locally: https://www.postgresql.org/download/"
    echo "   - Use hosted: Supabase, Neon, or Railway"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your API keys:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - NEXTAUTH_SECRET (run: openssl rand -base64 32)"
    echo "   - OPENAI_API_KEY (from https://platform.openai.com/api-keys)"
    echo "   - ELEVENLABS_API_KEY (from https://elevenlabs.io/)"
    echo "   - TWILIO credentials (optional - has simulation mode)"
    echo ""
    echo "Press Enter after you've updated .env file..."
    read
else
    echo "✅ .env file already exists"
    echo ""
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"
echo ""

# Ask if user wants to run migrations
echo "Would you like to run database migrations now? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🗄️  Running database migrations..."
    npx prisma migrate dev --name init
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to run migrations"
        echo "   Make sure your DATABASE_URL is correct in .env"
        exit 1
    fi
    
    echo "✅ Database migrations complete"
    echo ""
fi

# Success message
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "3. Register a new account and start using ProspectAI!"
echo ""
echo "📚 Documentation:"
echo "   - SETUP_GUIDE.md - Complete setup instructions"
echo "   - README.md - Project overview"
echo "   - BLACKBOX.md - Full project context"
echo ""
echo "Happy prospecting! 📞"
