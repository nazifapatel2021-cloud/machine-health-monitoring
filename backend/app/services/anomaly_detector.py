from typing import Dict, List, Any, Tuple
from app.config import config

class AnomalyDetector:
    """
    Evaluates sensor readings against configurable thresholds to detect anomalies,
    assign machine health condition ratings (GOOD, WARNING, CRITICAL), and compute condition score.
    """
    @staticmethod
    def evaluate_readings(readings: Dict[str, float], custom_thresholds: Dict[str, Dict[str, float]] = None) -> Dict[str, Any]:
        thresholds = custom_thresholds if custom_thresholds else config.THRESHOLDS

        sensor_statuses = {}
        anomalies_detected = []
        worst_severity = "GOOD" # GOOD -> WARNING -> CRITICAL

        for sensor_name in ["temperature", "vibration", "sound", "current"]:
            val = float(readings.get(sensor_name, 0.0))
            cfg = thresholds.get(sensor_name, config.THRESHOLDS[sensor_name])
            warn_val = cfg["warning"]
            crit_val = cfg["critical"]
            unit = cfg.get("unit", "")

            if val >= crit_val:
                status = "CRITICAL"
                worst_severity = "CRITICAL"
                anomalies_detected.append({
                    "sensor": sensor_name,
                    "severity": "CRITICAL",
                    "value": val,
                    "threshold": crit_val,
                    "unit": unit,
                    "message": f"Critical threshold exceeded for {sensor_name.capitalize()} ({val} {unit} >= {crit_val} {unit})"
                })
            elif val >= warn_val:
                status = "WARNING"
                if worst_severity != "CRITICAL":
                    worst_severity = "WARNING"
                anomalies_detected.append({
                    "sensor": sensor_name,
                    "severity": "WARNING",
                    "value": val,
                    "threshold": warn_val,
                    "unit": unit,
                    "message": f"Warning threshold reached for {sensor_name.capitalize()} ({val} {unit} >= {warn_val} {unit})"
                })
            else:
                status = "NORMAL"

            sensor_statuses[sensor_name] = {
                "val": val,
                "status": status,
                "unit": unit,
                "warning_threshold": warn_val,
                "critical_threshold": crit_val
            }

        condition = worst_severity if worst_severity in ["WARNING", "CRITICAL"] else "GOOD"

        return {
            "condition": condition,
            "sensor_statuses": sensor_statuses,
            "anomalies": anomalies_detected
        }

anomaly_detector = AnomalyDetector()
