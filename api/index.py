from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sys
import os
import traceback

# Create a fallback app instance
app = FastAPI()

# Add backend directory to sys.path
backend_path = os.path.join(os.getcwd(), 'backend')
sys.path.append(backend_path)

try:
    # Attempt to import the actual backend app
    from main import app as backend_app
    handler = backend_app
except Exception as e:
    # If import fails, use the fallback app to serve the error
    error_msg = str(e)
    tb = traceback.format_exc()
    print(f"CRITICAL STARTUP ERROR: {error_msg}")
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def catch_all(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Backend failed to start",
                "detail": error_msg,
                "traceback": tb.splitlines()
            }
        )
    handler = app
