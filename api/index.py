from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import subprocess

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        status = {}
        
        # Check FastAPI import
        try:
            import fastapi
            status["fastapi"] = f"Installed: {fastapi.__version__}"
        except ImportError as e:
            status["fastapi"] = f"Missing: {str(e)}"
            
        # Check other deps
        deps = ["sqlalchemy", "jose", "passlib", "multipart", "google.generativeai", "gtts", "dotenv", "PIL", "httpx", "requests", "openai"]
        for dep in deps:
            try:
                __import__(dep)
                status[dep] = "Installed"
            except ImportError as e:
                status[dep] = f"Missing: {str(e)}"

        # List installed packages via pip
        try:
            installed = subprocess.check_output([sys.executable, "-m", "pip", "freeze"]).decode("utf-8").splitlines()
        except Exception as e:
            installed = [f"Error running pip freeze: {str(e)}"]

        response = {
            "status": "ok",
            "message": "Dependency Check",
            "imports": status,
            "sys_path": sys.path,
            "cwd": os.getcwd(),
            "files_in_root": os.listdir("."),
            "pip_freeze": installed[:20] # First 20 packages
        }
        self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
        return
