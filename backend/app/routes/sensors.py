from fastapi import APIRouter, Body
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.services.data_provider import sensor_provider
from app.services.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/sensors", tags=["sensors"])

class HardwareIngestPayload(BaseModel):
    temperature: float = Field(..., description="Temperature in °C")
    vibration: float = Field(..., description="Vibration in mm/s")
    sound: float = Field(..., description="Sound level in dB")
    current: float = Field(..., description="Current consumption in A")

@router.get("/{machine_id}")
def get_sensor_readings(machine_id: str):
    """Get live sensor readings, live vs demo fallback state, and threshold status for a machine."""
    readings = sensor_provider.get_current_reading(machine_id)
    eval_res = anomaly_detector.evaluate_readings(readings)
    is_live = sensor_provider.is_live_data(machine_id)
    
    return {
        "machine_id": machine_id,
        "readings": readings,
        "is_live": is_live,
        "evaluations": eval_res["sensor_statuses"],
        "condition": eval_res["condition"],
        "anomalies": eval_res["anomalies"]
    }

@router.post("/{machine_id}/ingest")
def ingest_hardware_sensor_data(machine_id: str, payload: HardwareIngestPayload):
    """
    Endpoint for hardware devices (ESP32) to POST real sensor readings.
    Updates the machine state and sets the LIVE DATA window for 15 seconds.
    """
    res = sensor_provider.ingest_real_reading(machine_id, payload.model_dump())
    return {
        "status": "success",
        "message": f"Real sensor data ingested for machine '{machine_id}'",
        "is_live": True,
        "reading": res
    }
