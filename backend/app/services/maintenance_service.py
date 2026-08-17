import uuid
from typing import List, Dict, Any
from datetime import datetime
from app.config import config

class MaintenanceService:
    """
    Generates actionable condition-based predictive maintenance recommendations.
    """
    @staticmethod
    def get_recommendations(machine_id: str, readings: Dict[str, float], ml_prediction: Dict[str, Any]) -> List[Dict[str, Any]]:
        m_info = config.MACHINES.get(machine_id, config.MACHINES["cnc-01"])
        m_name = m_info["name"]
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

        temp = readings.get("temperature", 60.0)
        vib = readings.get("vibration", 2.0)
        snd = readings.get("sound", 50.0)
        curr = readings.get("current", 4.5)

        recs = []

        # Temperature logic
        if temp >= config.THRESHOLDS["temperature"]["critical"]:
            recs.append({
                "id": f"maint-{str(uuid.uuid4())[:6]}",
                "machine_id": machine_id,
                "machine_name": m_name,
                "sensor": "Temperature",
                "finding": f"Critical thermal escalation detected ({temp} °C). High risk of stator/winding burn.",
                "recommendation": "Emergency inspection of coolant circulation pump, thermal paste, and heat exchanger fins.",
                "priority": "High",
                "timestamp": now_str,
                "disclaimer": "AI demo recommendation — verify with certified electrical engineer before servicing."
            })
        elif temp >= config.THRESHOLDS["temperature"]["warning"]:
            recs.append({
                "id": f"maint-{str(uuid.uuid4())[:6]}",
                "machine_id": machine_id,
                "machine_name": m_name,
                "sensor": "Temperature",
                "finding": f"Temperature is above normal operating envelope ({temp} °C).",
                "recommendation": "Inspect cooling air filters, check lubricant viscosity, and clear dust accumulation.",
                "priority": "Medium",
                "timestamp": now_str,
                "disclaimer": "AI demo recommendation — verify with certified electrical engineer before servicing."
            })

        # Vibration logic
        if vib >= config.THRESHOLDS["vibration"]["critical"]:
            recs.append({
                "id": f"maint-{str(uuid.uuid4())[:6]}",
                "machine_id": machine_id,
                "machine_name": m_name,
                "sensor": "Vibration",
                "finding": f"Severe mechanical vibration ({vib} mm/s). Imminent risk of bearing breakdown or shaft misalignment.",
                "recommendation": "Perform laser shaft alignment, replace worn ball bearings, and torque foundation anchor bolts.",
                "priority": "High",
                "timestamp": now_str,
                "disclaimer": "AI demo recommendation — verify with mechanical specialist before servicing."
            })
        elif vib >= config.THRESHOLDS["vibration"]["warning"]:
            recs.append({
                "id": f"maint-{str(uuid.uuid4())[:6]}",
                "machine_id": machine_id,
                "machine_name": m_name,
                "sensor": "Vibration",
                "finding": f"Vibration level is elevated ({vib} mm/s). Baseline noise drift observed.",
                "recommendation": "Apply high-temperature grease to bearing housings and inspect drive belt tension.",
                "priority": "Medium",
                "timestamp": now_str,
                "disclaimer": "AI demo recommendation — verify with mechanical specialist before servicing."
            })

        # Current logic
        if curr >= config.THRESHOLDS["current"]["critical"]:
            recs.append({
                "id": f"maint-{str(uuid.uuid4())[:6]}",
                "machine_id": machine_id,
                "machine_name": m_name,
                "sensor": "Current",
                "finding": f"Electrical current spikes detected ({curr} A). Motor operates under heavy electrical overload.",
                "recommendation": "Check phase balance, measure insulation resistance (Megger test), and clear mechanical jam.",
                "priority": "High",
                "timestamp": now_str,
                "disclaimer": "AI demo recommendation — verify with certified electrician before servicing."
            })

        # Default preventive recommendation if operation is healthy
        if not recs:
            recs.append({
                "id": f"maint-{str(uuid.uuid4())[:6]}",
                "machine_id": machine_id,
                "machine_name": m_name,
                "sensor": "Routine",
                "finding": f"All telemetry metrics ({temp}°C, {vib}mm/s, {snd}dB, {curr}A) are within normal operating bounds.",
                "recommendation": "Maintain standard 500-hour routine inspection schedule. Next service recommended in 30 days.",
                "priority": "Low",
                "timestamp": now_str,
                "disclaimer": "AI demo recommendation — routine operational status."
            })

        return recs

maintenance_service = MaintenanceService()
