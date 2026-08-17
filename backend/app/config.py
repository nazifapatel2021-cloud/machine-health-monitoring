import os
from typing import Dict, Any

class Config:
    PROJECT_NAME: str = "AI-Powered Machine Health Monitoring System"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Environment & Server Config
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Default Simulation Settings
    SIMULATION_INTERVAL_SEC: float = 2.0
    DEMO_MODE: bool = True
    MAX_HISTORY_POINTS: int = 500

    # Sensor Baseline Config & Thresholds
    THRESHOLDS: Dict[str, Dict[str, float]] = {
        "temperature": {
            "warning": 75.0,
            "critical": 85.0,
            "normal_avg": 62.0,
            "unit": "°C"
        },
        "vibration": {
            "warning": 4.5,
            "critical": 7.0,
            "normal_avg": 2.2,
            "unit": "mm/s"
        },
        "sound": {
            "warning": 70.0,
            "critical": 85.0,
            "normal_avg": 52.0,
            "unit": "dB"
        },
        "current": {
            "warning": 10.0,
            "critical": 15.0,
            "normal_avg": 4.8,
            "unit": "A"
        }
    }

    # Pre-defined Monitored Machines
    MACHINES: Dict[str, Dict[str, Any]] = {
        "cnc-01": {
            "id": "cnc-01",
            "name": "CNC Machine 01",
            "type": "Vertical Machining Center",
            "location": "Building A - Bay 1",
            "status": "ONLINE",
            "operating_hours": 4280,
            "last_maintenance": "2026-07-15",
            "next_maintenance": "2026-09-15",
            "baseline": {"temperature": 62.4, "vibration": 2.3, "sound": 48.0, "current": 4.8}
        },
        "motor-02": {
            "id": "motor-02",
            "name": "Motor Unit 02",
            "type": "3-Phase Induction Motor",
            "location": "Building A - Bay 3",
            "status": "ONLINE",
            "operating_hours": 6150,
            "last_maintenance": "2026-06-10",
            "next_maintenance": "2026-08-30",
            "baseline": {"temperature": 68.1, "vibration": 3.1, "sound": 58.5, "current": 7.2}
        },
        "compressor-03": {
            "id": "compressor-03",
            "name": "Compressor 03",
            "type": "Rotary Screw Air Compressor",
            "location": "Building B - Utility Room",
            "status": "ONLINE",
            "operating_hours": 2890,
            "last_maintenance": "2026-08-01",
            "next_maintenance": "2026-10-01",
            "baseline": {"temperature": 55.3, "vibration": 1.8, "sound": 62.0, "current": 3.9}
        }
    }

config = Config()
