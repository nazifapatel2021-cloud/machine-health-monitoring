from fastapi import APIRouter, Query
from app.services.data_provider import sensor_provider
from app.services.ml_model import ml_model

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/{machine_id}")
def get_analytics_history(machine_id: str, limit: int = Query(60, ge=10, le=500)):
    """Get time-series history for all sensors and health trends."""
    raw_history = sensor_provider.get_history(machine_id, limit=limit)
    
    formatted = []
    for point in raw_history:
        ml_res = ml_model.predict(point["temperature"], point["vibration"], point["sound"], point["current"])
        formatted.append({
            "timestamp": point["timestamp"],
            "temperature": point["temperature"],
            "vibration": point["vibration"],
            "sound": point["sound"],
            "current": point["current"],
            "health_score": ml_res["health_score"]
        })
        
    return {
        "machine_id": machine_id,
        "count": len(formatted),
        "history": formatted
    }
