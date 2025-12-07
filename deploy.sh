#!/bin/bash

# Quick Deploy Script for One Learn
# This script helps you deploy to Vercel quickly

echo "🚀 One Learn - Vercel Deployment Helper"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✓ Vercel CLI is ready"
echo ""

# Check if user is logged in
echo "📝 Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel:"
    vercel login
fi

echo "✓ Logged in to Vercel"
echo ""

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✓ Frontend built successfully"
echo ""

# Deploy
echo "🚀 Deploying to Vercel..."
echo ""
echo "IMPORTANT: Make sure you have set up:"
echo "  1. Supabase database (see DEPLOYMENT.md)"
echo "  2. Environment variables in Vercel dashboard"
echo ""
read -p "Press Enter to continue with deployment..."

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Configure custom domain in Vercel dashboard"
echo "  2. Update DNS records for onelearn.theoneatom.com"
echo "  3. Test your deployment"
echo ""
echo "See DEPLOYMENT.md for detailed instructions"
