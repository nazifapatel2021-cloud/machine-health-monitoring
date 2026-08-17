import asyncio
import os
import sys
import threading
import time
from contextlib import asynccontextmanager

# Add parent directory of 'app' to sys.path for reliable module imports in production
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import config
from app.services.data_provider import sensor_provider
from app.services.anomaly_detector import anomaly_detector
from app.services.alert_service import alert_service

# Import Routers
from app.routes import machines, sensors, health, prediction, alerts, analytics, maintenance, settings

simulation_running = True

def background_simulation_loop():
    """Threaded background simulation loop advancing telemetry and checking anomalies."""
    global simulation_running
    while simulation_running:
        try:
            # Advance simulation tick for all machines
            sensor_provider.update_tick()

            # Process anomaly checks and auto-generate alerts
            for m_id in config.MACHINES.keys():
                readings = sensor_provider.get_current_reading(m_id)
                eval_res = anomaly_detector.evaluate_readings(readings)
                if eval_res["anomalies"]:
                    alert_service.process_anomalies(m_id, eval_res["anomalies"])

        except Exception as e:
            print(f"[Simulation Error]: {e}")
        
        time.sleep(config.SIMULATION_INTERVAL_SEC)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch background simulation thread
    global simulation_running
    simulation_running = True
    sim_thread = threading.Thread(target=background_simulation_loop, daemon=True)
    sim_thread.start()
    print("[SERVER]: Background telemetry simulator started.")
    yield
    # Shutdown
    simulation_running = False
    print("[SERVER]: Background simulator stopped.")

app = FastAPI(
    title=config.PROJECT_NAME,
    version=config.VERSION,
    lifespan=lifespan
)

# Enable CORS for local and production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router Modules
app.include_router(machines.router, prefix=config.API_PREFIX)
app.include_router(sensors.router, prefix=config.API_PREFIX)
app.include_router(health.router, prefix=config.API_PREFIX)
app.include_router(prediction.router, prefix=config.API_PREFIX)
app.include_router(alerts.router, prefix=config.API_PREFIX)
app.include_router(analytics.router, prefix=config.API_PREFIX)
app.include_router(maintenance.router, prefix=config.API_PREFIX)
app.include_router(settings.router, prefix=config.API_PREFIX)

# Reliable Frontend Directory Resolution
def get_frontend_dir():
    # Primary: relative to main.py (__file__)
    primary_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
    if os.path.exists(primary_dir):
        return primary_dir
    # Fallback: relative to CWD
    cwd_dir = os.path.abspath(os.path.join(os.getcwd(), "frontend"))
    if os.path.exists(cwd_dir):
        return cwd_dir
    return primary_dir

frontend_dir = get_frontend_dir()
index_file_path = os.path.join(frontend_dir, "index.html")
frontend_src_path = os.path.join(frontend_dir, "src")

@app.api_route("/", methods=["GET", "HEAD"])
def serve_index():
    if os.path.exists(index_file_path):
        return FileResponse(index_file_path)
    return {"status": "online", "message": "Backend API running. Frontend index.html missing.", "searched_path": index_file_path}

@app.get("/api")
def api_root():
    return {
        "status": "online",
        "project": config.PROJECT_NAME,
        "version": config.VERSION,
        "demo_mode": config.DEMO_MODE,
        "machines": list(config.MACHINES.keys())
    }

# Mount static src directory
if os.path.exists(frontend_src_path):
    app.mount("/src", StaticFiles(directory=frontend_src_path), name="frontend_src")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", config.HOST)
    port = int(os.getenv("PORT", config.PORT))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
