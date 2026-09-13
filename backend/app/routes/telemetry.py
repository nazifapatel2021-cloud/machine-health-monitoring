from fastapi import APIRouter
from datetime import datetime
from app.config import config
from app.services.data_provider import sensor_provider
from app.services.anomaly_detector import anomaly_detector
from app.services.alert_service import alert_service
from app.services.ml_model import ml_model

router = APIRouter(prefix="/telemetry", tags=["telemetry"])

@router.get("/{machine_id}")
def get_unified_telemetry(machine_id: str):
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
