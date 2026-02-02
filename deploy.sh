#!/bin/bash

# Deployment Script for Antigravity Unify

echo "🚀 Starting Deployment..."

# Check for required env vars
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL missing in .env"
  exit 1
fi


# 1. Pull latest code
echo "📥 Pulling latest changes from git..."
git pull origin main

# 2. Build and restart containers using the existing docker-compose.yml
#    --build forces a rebuild (crucial for Next.js frontend if code changed)
#    -d runs in detached mode
echo "🛠 Building and Restarting containers..."

# Ensure backend has the .env file
if [ -f .env ]; then
    cp .env backend/.env
fi

# Force full rebuild to ensure ARGs are picked up
docker compose build --no-cache frontend
docker compose up --build -d

# 3. Cleanup unused images (optional, keeps disk clean)
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment Complete! Applications is running."
