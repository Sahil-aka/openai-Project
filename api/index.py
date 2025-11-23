import sys
import os

# Add backend directory to sys.path so that 'import main' works
# and main.py can import its own dependencies (models, database, etc.)
backend_path = os.path.join(os.getcwd(), 'backend')
sys.path.append(backend_path)

from main import app

# Vercel entry point
handler = app
