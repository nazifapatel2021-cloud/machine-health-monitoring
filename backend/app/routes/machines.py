from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.config import config
from app.services.data_provider import sensor_provider
from app.services.ml_model import ml_model
from app.services.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/machines", tags=["machines"])

@router.get("", response_model=List[Dict[str, Any]])
def get_all_machines():
    """Get list of all monitored machines with real-time health overview."""
    results = []
    for m_id, m_info in config.MACHINES.items():
        readings = sensor_provider.get_current_reading(m_id)
        eval_res = anomaly_detector.evaluate_readings(readings)
        ml_res = ml_model.predict(readings["temperature"], readings["vibration"], readings["sound"], readings["current"])
        
        m_copy = m_info.copy()
        m_copy["health_score"] = ml_res["health_score"]
        m_copy["condition"] = eval_res["condition"]
        m_copy["current_readings"] = readings
        results.append(m_copy)
    return results

@router.get("/{machine_id}")
def get_machine_by_id(machine_id: str):
    """Get detailed machine overview for specified machine_id."""
    if machine_id not in config.MACHINES:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    m_info = config.MACHINES[machine_id].copy()
    readings = sensor_provider.get_current_reading(machine_id)
    eval_res = anomaly_detector.evaluate_readings(readings)
    ml_res = ml_model.predict(readings["temperature"], readings["vibration"], readings["sound"], readings["current"])
    
    m_info["health_score"] = ml_res["health_score"]
    m_info["condition"] = eval_res["condition"]
    m_info["current_readings"] = readings
    m_info["sensor_status_matrix"] = eval_res["sensor_statuses"]
    return m_info
