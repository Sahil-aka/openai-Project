from http.server import BaseHTTPRequestHandler
import json
import traceback
import sys
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        status = {}
        
        # Debug FastAPI Initialization
        try:
            from fastapi import FastAPI
            status["import_fastapi"] = "Success"
            
            try:
                app = FastAPI()
                status["init_fastapi"] = "Success"
            except Exception as init_err:
                status["init_fastapi"] = f"Failed: {str(init_err)}"
                status["init_traceback"] = traceback.format_exc()
                
        except Exception as import_err:
            status["import_fastapi"] = f"Failed: {str(import_err)}"
            status["import_traceback"] = traceback.format_exc()

        # Debug Backend Import
        backend_path = os.path.join(os.getcwd(), "backend")
        sys.path.append(backend_path)
        
        try:
            import main
            status["import_backend_main"] = "Success"
        except Exception as backend_err:
            status["import_backend_main"] = f"Failed: {str(backend_err)}"
            status["backend_traceback"] = traceback.format_exc()

        response = {
            "status": "debug_mode",
            "checks": status,
            "sys_path": sys.path,
            "cwd": os.getcwd()
        }
        self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
        return
