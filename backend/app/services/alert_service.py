import time
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.config import config

class AlertService:
    """
    Manages in-memory system alerts, timeline logging, and status resolution.
    """
    def __init__(self):
        self.alerts: List[Dict[str, Any]] = []
        self.last_alert_times: Dict[str, float] = {} # De-duplication map

    def process_anomalies(self, machine_id: str, anomalies: List[Dict[str, Any]], force_log: bool = False) -> None:
        """Adds new anomaly alerts while preventing spamming (15s throttle per sensor unless forced)."""
        now = time.time()
        m_name = config.MACHINES.get(machine_id, {}).get("name", machine_id)

        for anom in anomalies:
            sensor = anom["sensor"]
            dedup_key = f"{machine_id}_{sensor}"
            
            # Throttle same anomaly log every 15s unless forced by explicit user action
            if not force_log and dedup_key in self.last_alert_times:
                if (now - self.last_alert_times[dedup_key]) < 15.0:
                    continue

            self.last_alert_times[dedup_key] = now
            alert_item = {
                "id": str(uuid.uuid4())[:8],
                "severity": anom["severity"],
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "machine_id": machine_id,
                "machine_name": m_name,
                "sensor": sensor.capitalize(),
                "message": anom["message"],
                "status": "ACTIVE",
                "value": anom["value"],
                "threshold": anom["threshold"]
            }
            # Prepend to keep newest first
            self.alerts.insert(0, alert_item)
            if len(self.alerts) > 200:
                self.alerts.pop()

    def get_alerts(self, machine_id: Optional[str] = None, severity: Optional[str] = None) -> List[Dict[str, Any]]:
        filtered = self.alerts
        if machine_id and machine_id != "all":
            filtered = [a for a in filtered if a["machine_id"] == machine_id]
        if severity and severity != "all":
            filtered = [a for a in filtered if a["severity"].upper() == severity.upper()]
        return filtered

    def resolve_alert(self, alert_id: str) -> bool:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                alert["status"] = "RESOLVED"
                # Automatically reset machine sensor state to normal baseline in demo mode
                from app.services.data_provider import sensor_provider
                sensor_provider.clear_anomalies(alert["machine_id"])
                return True
        return False

alert_service = AlertService()
