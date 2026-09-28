from fastapi import APIRouter, HTTPException
from typing import Optional
from app.config import config
from app.models.schemas import SettingsModel, AnomalyInjectRequest
from app.services.data_provider import sensor_provider, resolve_machine_id

router = APIRouter(prefix="/settings", tags=["settings"])

VALID_SENSORS = {"temperature", "vibration", "sound", "current", "all"}
VALID_SEVERITIES = {"warning", "critical"}

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
def inject_anomaly(body: Optional[AnomalyInjectRequest] = None):
    """Inject an artificial sensor anomaly for demo presentation purposes."""
    try:
        if body is None:
            body = AnomalyInjectRequest()
        raw_machine_id = (body.machine_id or "cnc-01").strip()
        m_id = resolve_machine_id(raw_machine_id)
        if not m_id:
            raise HTTPException(
                status_code=404,
                detail=f"Machine '{raw_machine_id}' not found. Valid machines: {list(config.MACHINES.keys())}"
            )

        sensor = (body.sensor or "vibration").lower().strip()
        if sensor not in VALID_SENSORS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid sensor '{body.sensor}'. Valid sensors: {sorted(list(VALID_SENSORS))}"
            )

        severity = (body.severity or "critical").lower().strip()
        if severity not in VALID_SEVERITIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid severity '{body.severity}'. Valid severities: {sorted(list(VALID_SEVERITIES))}"
            )

        sensor_provider.inject_anomaly(m_id, sensor, severity)
        return {
            "success": True,
            "message": f"Injected {severity} anomaly into {sensor} for machine {m_id}",
            "machine_id": m_id,
            "sensor": sensor,
            "severity": severity
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error in inject_anomaly: {str(e)}")

@router.post("/clear-anomalies/{machine_id}")
def clear_anomalies(machine_id: str):
    """Reset machine anomalies back to healthy baseline."""
    m_id = resolve_machine_id(machine_id)
    if not m_id:
        raise HTTPException(
            status_code=404,
            detail=f"Machine '{machine_id}' not found. Valid machines: {list(config.MACHINES.keys())}"
        )
    sensor_provider.clear_anomalies(m_id)
    return {"message": f"Cleared all anomalies for machine {m_id}"}

