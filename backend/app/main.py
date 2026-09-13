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
        response = FileResponse(index_file_path)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response
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

@app.get("/api/telemetry/{machine_id}")
def get_unified_telemetry(machine_id: str):
    from app.services.ml_model import ml_model
    from datetime import datetime
    
    m_list = [
        {
            "id": m_id,
            "name": m_data["name"],
            "type": m_data["type"],
            "location": m_data["location"],
            "status": "ONLINE",
            "operating_hours": m_data["operating_hours"]
        } for m_id, m_data in config.MACHINES.items()
    ]
    m_detail = config.MACHINES.get(machine_id, list(config.MACHINES.values())[0])
    readings = sensor_provider.get_current_reading(machine_id)
    eval_res = anomaly_detector.evaluate_readings(readings)
    h_score = anomaly_detector.calculate_health_score(eval_res["evaluations"])
    p_data = ml_model.predict(
        readings["temperature"],
        readings["vibration"],
        readings["sound"],
        readings["current"]
    )
    alerts_list = alert_service.get_alerts(machine_id=machine_id)
    history_data = sensor_provider.get_history(machine_id, limit=60)
    maint_recs = [
        {
            "id": f"maint-{machine_id}",
            "machine_id": machine_id,
            "machine_name": m_detail["name"],
            "sensor": "Vibration" if eval_res["evaluations"]["vibration"]["status"] != "NORMAL" else "Temperature",
            "finding": f"Condition evaluated as {eval_res['overall_condition']}.",
            "recommendation": p_data["recommended_action"],
            "priority": "High" if eval_res["overall_condition"] == "CRITICAL" else "Medium" if eval_res["overall_condition"] == "WARNING" else "Low",
            "timestamp": datetime.now().strftime("%Y-%m-%d"),
            "disclaimer": "AI recommendation — verify with engineering team."
        }
    ]
    
    return {
        "machines": m_list,
        "current_machine": {
            "id": machine_id,
            **m_detail,
            "sensor_status_matrix": eval_res["evaluations"]
        },
        "sensors": {
            "machine_id": machine_id,
            "readings": readings,
            "is_live": sensor_provider.is_live(machine_id),
            "evaluations": eval_res["evaluations"],
            "condition": eval_res["overall_condition"],
            "anomalies": eval_res["anomalies"]
        },
        "health": {
            "machine_id": machine_id,
            "health_score": h_score,
            "condition": eval_res["overall_condition"]
        },
        "prediction": {
            "machine_id": machine_id,
            **p_data
        },
        "alerts": alerts_list,
        "analytics": {
            "machine_id": machine_id,
            "count": len(history_data),
            "history": history_data
        },
        "maintenance": {
            "machine_id": machine_id,
            "recommendations": maint_recs,
            "count": len(maint_recs)
        }
    }

# Mount static src directory
if os.path.exists(frontend_src_path):
    app.mount("/src", StaticFiles(directory=frontend_src_path), name="frontend_src")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", config.HOST)
    port = int(os.getenv("PORT", config.PORT))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
