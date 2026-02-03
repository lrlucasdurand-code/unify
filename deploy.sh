#!/bin/bash

# Deployment Script for Antigravity Unify
# Stops on first error
set -e

echo "🚀 Starting Deployment..."

# 0. Check and Add Swap (Crucial for Small VPS)
if [ ! -f /swapfile ]; then
    echo "💾 Creating 2GB Swap for smoother builds..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap created."
else
    echo "✅ Swap already exists."
fi

# Check for required env vars
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL missing in .env"
  exit 1
fi


# 1. Pull latest code
echo "📥 Pulling latest changes from git..."
git pull origin main

# 2. Build and restart containers
echo "🛠 Building and Restarting containers..."

# Ensure backend has the .env file
if [ -f .env ]; then
    cp .env backend/.env
fi

# Force full rebuild to ensure ARGs are picked up
# We use export to ensure variables are passed if not in .env (redundancy)
export $(grep -v '^#' .env | xargs)

# Prune builder cache to free space before build
docker builder prune -f

docker compose build --no-cache frontend
docker compose up --build -d --remove-orphans

# 3. Cleanup unused images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment Complete! Applications is running."
