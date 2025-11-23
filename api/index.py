from fastapi import FastAPI
import sys
import os
import traceback

app = FastAPI()

# Add backend to sys.path explicitly using cwd
backend_path = os.path.join(os.getcwd(), "backend")
sys.path.append(backend_path)

try:
    # Try to import the main app
    from main import app as backend_app
    handler = backend_app
except Exception as e:
    error_msg = str(e)
    tb = traceback.format_exc()
    print(f"Import Error: {error_msg}")
    
    @app.get("/{path:path}")
    def catch_all(path: str):
        backend_files = "backend dir not found"
        if os.path.exists(backend_path):
            try:
                backend_files = os.listdir(backend_path)
            except Exception as ls_err:
                backend_files = f"Error listing backend: {ls_err}"

        return {
            "status": "error",
            "message": "Failed to import backend application",
            "error": error_msg,
            "traceback": tb.splitlines(),
            "cwd": os.getcwd(),
            "sys_path": sys.path,
            "backend_path": backend_path,
            "backend_files": backend_files
        }
    handler = app
