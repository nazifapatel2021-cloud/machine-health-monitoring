from fastapi import APIRouter
from app.services.data_provider import sensor_provider
from app.services.ml_model import ml_model

router = APIRouter(prefix="/prediction", tags=["prediction"])

@router.get("/{machine_id}")
def get_ai_prediction(machine_id: str):
    """Get AI/ML failure prediction, risk assessment, and explainable recommendations."""
    readings = sensor_provider.get_current_reading(machine_id)
    ml_res = ml_model.predict(
        readings["temperature"],
        readings["vibration"],
        readings["sound"],
        readings["current"]
    )
    ml_res["machine_id"] = machine_id
    ml_res["readings"] = readings
    ml_res["disclaimer"] = "Scikit-Learn Random Forest model prediction generated from simulated sensor telemetry baseline."
    return ml_res
