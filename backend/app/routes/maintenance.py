from fastapi import APIRouter
from app.services.data_provider import sensor_provider
from app.services.ml_model import ml_model
from app.services.maintenance_service import maintenance_service

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.get("/{machine_id}")
def get_maintenance_recommendations(machine_id: str):
    """Get targeted maintenance action items based on current machine state."""
    readings = sensor_provider.get_current_reading(machine_id)
    ml_res = ml_model.predict(readings["temperature"], readings["vibration"], readings["sound"], readings["current"])
    recs = maintenance_service.get_recommendations(machine_id, readings, ml_res)
    return {
        "machine_id": machine_id,
        "recommendations": recs,
        "count": len(recs)
    }
