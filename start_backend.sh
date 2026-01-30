#!/bin/bash
pkill -f "uvicorn app.main:app"
export PYTHONPATH=$PYTHONPATH:/Users/lucas/Antigravity_Unify/backend
cd /Users/lucas/Antigravity_Unify/backend
/Users/lucas/Antigravity_Unify/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --env-file .env
