from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sys
import os

# Minimal test - just return a working API
app = FastAPI()

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Minimal handler working"}

@app.post("/api/users")
def create_user():
    return {"status": "error", "message": "Backend import disabled for debugging"}

@app.post("/api/token")  
def login():
    return {"status": "error", "message": "Backend import disabled for debugging"}

@app.api_route("/api/{path:path}", methods=["GET", "POST"])
async def catch_all(path: str):
    return JSONResponse(
        status_code=200,
        content={
            "status": "debug",
            "message": "Minimal handler active",
            "path": path,
            "cwd": os.getcwd(),
            "sys_path": sys.path[:5]
        }
    )

handler = app
