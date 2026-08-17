import os
import sys

# Ensure backend directory is in python search path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import uvicorn
from app.config import config

if __name__ == "__main__":
    host = os.getenv("HOST", config.HOST)
    port = int(os.getenv("PORT", config.PORT))
    print(f"Starting Machine Health Monitoring System on {host}:{port}...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
