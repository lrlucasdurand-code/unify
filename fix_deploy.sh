#!/bin/bash

# Fix & Upgrade Script
# --------------------
# This script handles:
# 1. Cleaning up corrupted Docker state
# 2. Resetting the database to ensure passwords match
# 3. Rebuilding the application fresh
# 4. Upgrading the user to Premium

echo "🛑 Stopping all containers..."
docker compose down

echo "🧹 Cleaning up volumes (Fixes DB password issues)..."
docker compose down -v

echo "🛁 Cleaning Docker Builder Cache (Fixes 'snapshot does not exist' error)..."
docker builder prune -f

echo "🏗 Rebuilding containers from scratch..."
docker compose build --no-cache

echo "🚀 Starting services..."
docker compose up -d

echo "⏳ Waiting 30 seconds for Database & Backend to initialize..."
sleep 30

# Verify backend is running
if [ -z "$(docker compose ps -q backend)" ]; then
    echo "❌ Error: Backend container failed to start."
    echo "Logs:"
    docker compose logs --tail=20 backend
    exit 1
fi

echo "✅ Backend is UP!"

# Ask for email to upgrade
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your email as an argument."
    echo "Usage: ./fix_deploy.sh your_email@gmail.com"
    exit 1
fi

EMAIL=$1

echo "👑 Upgrading user $EMAIL to Starter Plan..."

# Try to run the upgrade script
# We start by copying it just in case
docker cp backend/upgrade_user.py $(docker compose ps -q backend):/app/upgrade_user.py

# Execute the upgrade
docker compose exec backend python upgrade_user.py "$EMAIL"

echo "---------------------------------------------------"
echo "🎉 Operation Complete!"
echo "👉 Go to https://useunify.io and Log In."
echo "   If you haven't signed up yet, Sign Up with $EMAIL now."
echo "   (The plan will apply automatically when the user is created)"
echo "---------------------------------------------------"
