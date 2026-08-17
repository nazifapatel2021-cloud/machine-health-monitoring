from fastapi import APIRouter
from app.services.data_provider import sensor_provider
from app.services.ml_model import ml_model
from app.services.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/{machine_id}")
def get_machine_health(machine_id: str):
    """Get dynamically calculated Machine Health Score & Condition."""
    readings = sensor_provider.get_current_reading(machine_id)
    eval_res = anomaly_detector.evaluate_readings(readings)
    ml_res = ml_model.predict(readings["temperature"], readings["vibration"], readings["sound"], readings["current"])
    
    return {
        "machine_id": machine_id,
        "health_score": ml_res["health_score"],
        "condition": eval_res["condition"],
        "threshold_evaluations": eval_res["sensor_statuses"]
    }
