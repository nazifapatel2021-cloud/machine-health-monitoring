from fastapi import APIRouter
from app.config import config
from app.models.schemas import SettingsModel, AnomalyInjectRequest
from app.services.data_provider import sensor_provider

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("", response_model=SettingsModel)
def get_settings():
    """Get current threshold settings and simulation mode parameters."""
    t = config.THRESHOLDS
    return SettingsModel(
        temp_warning=t["temperature"]["warning"],
        temp_critical=t["temperature"]["critical"],
        vibration_warning=t["vibration"]["warning"],
        vibration_critical=t["vibration"]["critical"],
        sound_warning=t["sound"]["warning"],
        sound_critical=t["sound"]["critical"],
        current_warning=t["current"]["warning"],
        current_critical=t["current"]["critical"],
        simulation_speed=config.SIMULATION_INTERVAL_SEC,
        demo_mode=config.DEMO_MODE
    )

@router.post("")
def update_settings(settings: SettingsModel):
    """Update active thresholds and configuration."""
    t = config.THRESHOLDS
    t["temperature"]["warning"] = settings.temp_warning
    t["temperature"]["critical"] = settings.temp_critical
    t["vibration"]["warning"] = settings.vibration_warning
    t["vibration"]["critical"] = settings.vibration_critical
    t["sound"]["warning"] = settings.sound_warning
    t["sound"]["critical"] = settings.sound_critical
    t["current"]["warning"] = settings.current_warning
    t["current"]["critical"] = settings.current_critical
    config.SIMULATION_INTERVAL_SEC = settings.simulation_speed
    config.DEMO_MODE = settings.demo_mode
    return {"message": "Settings updated successfully", "settings": settings}

@router.post("/inject-anomaly")
def inject_anomaly(body: AnomalyInjectRequest):
    """Inject a artificial sensor anomaly for demo presentation purposes."""
    sensor_provider.inject_anomaly(body.machine_id, body.sensor, body.severity)
    return {"message": f"Injected {body.severity} anomaly into {body.sensor} for machine {body.machine_id}"}

@router.post("/clear-anomalies/{machine_id}")
def clear_anomalies(machine_id: str):
    """Reset machine anomalies back to healthy baseline."""
    sensor_provider.clear_anomalies(machine_id)
    return {"message": f"Cleared all anomalies for machine {machine_id}"}
