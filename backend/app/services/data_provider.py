import random
import time
import math
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from app.config import config

class SensorDataProvider(ABC):
    """
    Abstract Sensor Data Provider Interface.
    Allows seamlessly swapping between SimulatedSensorDataProvider and MqttSensorDataProvider / Real Ingest.
    """
    @abstractmethod
    def get_current_reading(self, machine_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_history(self, machine_id: str, limit: int = 60) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def inject_anomaly(self, machine_id: str, sensor: str, severity: str = "critical") -> None:
        pass

    @abstractmethod
    def update_tick(self) -> None:
        pass

    @abstractmethod
    def ingest_real_reading(self, machine_id: str, reading_data: Dict[str, float]) -> Dict[str, Any]:
        pass

MACHINE_ALIASES = {
    "1": "cnc-01",
    "01": "cnc-01",
    "cnc1": "cnc-01",
    "cnc-1": "cnc-01",
    "2": "motor-02",
    "02": "motor-02",
    "motor2": "motor-02",
    "motor-2": "motor-02",
    "3": "compressor-03",
    "03": "compressor-03",
    "compressor3": "compressor-03",
    "compressor-3": "compressor-03",
}

def resolve_machine_id(machine_id: str) -> Optional[str]:
    """Resolves machine ID or alias to canonical ID, or returns None if invalid."""
    if not machine_id:
        return None
    m_clean = str(machine_id).strip().lower()
    if m_clean in config.MACHINES:
        return m_clean
    if m_clean in MACHINE_ALIASES:
        return MACHINE_ALIASES[m_clean]
    return None

class SimulatedSensorDataProvider(SensorDataProvider):
    """
    Simulated Sensor Data Provider with realistic physics drift, subtle noise,
    and automatic 15-second Fallback between Live ESP32 Ingestion and Demo Simulation.
    """
    def __init__(self):
        self.history: Dict[str, List[Dict[str, Any]]] = {}
        self.current_state: Dict[str, Dict[str, float]] = {}
        self.last_real_data_timestamp: Dict[str, float] = {}
        self.anomalies: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self.step_counts: Dict[str, int] = {}
        
        # Initialize machine states
        for m_id, m_info in config.MACHINES.items():
            baseline = m_info["baseline"].copy()
            self.current_state[m_id] = baseline
            self.history[m_id] = []
            self.anomalies[m_id] = {}
            self.last_real_data_timestamp[m_id] = 0.0  # Epoch zero
            self.step_counts[m_id] = random.randint(0, 100)
            
            # Pre-populate history with 30 realistic baseline data points
            now_ts = time.time()
            for i in range(30, 0, -1):
                t_offset = now_ts - (i * 2)
                dt_str = datetime.fromtimestamp(t_offset).strftime("%H:%M:%S")
                point = {
                    "temperature": round(baseline["temperature"] + (random.uniform(-0.5, 0.5)), 2),
                    "vibration": round(baseline["vibration"] + (random.uniform(-0.1, 0.1)), 2),
                    "sound": round(baseline["sound"] + (random.uniform(-0.8, 0.8)), 1),
                    "current": round(baseline["current"] + (random.uniform(-0.2, 0.2)), 2),
                    "timestamp": dt_str,
                    "epoch": t_offset,
                    "is_live": False
                }
                self.history[m_id].append(point)

    def is_live_data(self, machine_id: str) -> bool:
        """Returns True if real hardware sensor data arrived within the last 15 seconds."""
        if machine_id not in self.last_real_data_timestamp:
            return False
        elapsed = time.time() - self.last_real_data_timestamp[machine_id]
        return elapsed <= 15.0

    def ingest_real_reading(self, machine_id: str, reading_data: Dict[str, float]) -> Dict[str, Any]:
        """Ingests a real hardware reading from ESP32 POST /api/sensors/{machine_id}/ingest."""
        now_ts = time.time()
        dt_str = datetime.fromtimestamp(now_ts).strftime("%H:%M:%S")

        # Normalize machine ID
        if machine_id not in config.MACHINES and machine_id in ["1", "01"]:
            machine_id = "cnc-01"

        if machine_id not in self.current_state:
            machine_id = "cnc-01"

        # Update last real timestamp
        self.last_real_data_timestamp[machine_id] = now_ts

        # Store ingested real values
        new_reading = {
            "temperature": round(float(reading_data.get("temperature", 60.0)), 2),
            "vibration": round(float(reading_data.get("vibration", 2.0)), 2),
            "sound": round(float(reading_data.get("sound", 50.0)), 1),
            "current": round(float(reading_data.get("current", 4.5)), 2),
            "timestamp": dt_str,
            "epoch": now_ts,
            "is_live": True
        }

        self.current_state[machine_id] = {
            "temperature": new_reading["temperature"],
            "vibration": new_reading["vibration"],
            "sound": new_reading["sound"],
            "current": new_reading["current"]
        }

        # Push to history
        self.history[machine_id].append(new_reading)
        if len(self.history[machine_id]) > config.MAX_HISTORY_POINTS:
            self.history[machine_id].pop(0)

        return new_reading

    def update_tick(self) -> None:
        """Called every simulation tick. Updates simulated values if no real data is live."""
        now_ts = time.time()
        dt_str = datetime.fromtimestamp(now_ts, tz=timezone.utc).isoformat()

        for m_id, m_info in config.MACHINES.items():
            # If real hardware telemetry is currently live (<15s ago), skip simulated tick
            if self.is_live_data(m_id):
                continue

            self.step_counts[m_id] += 1
            step = self.step_counts[m_id]
            curr = self.current_state[m_id]
            base = m_info["baseline"]

            # Smooth sine-based thermal drift + noise
            target_temp = base["temperature"] + 1.2 * math.sin(step * 0.05)
            target_vib = base["vibration"] + 0.15 * math.sin(step * 0.08)
            target_sound = base["sound"] + 1.0 * math.cos(step * 0.06)
            target_curr = base["current"] + 0.2 * math.sin(step * 0.04)

            # Apply active anomaly offsets if injected
            temp_offset = 0.0
            vib_offset = 0.0
            sound_offset = 0.0
            curr_offset = 0.0

            active_anom = self.anomalies[m_id]
            if "temperature" in active_anom:
                sev = active_anom["temperature"]["severity"]
                temp_offset = 24.0 if sev == "critical" else 14.0
            if "vibration" in active_anom:
                sev = active_anom["vibration"]["severity"]
                vib_offset = 5.2 if sev == "critical" else 2.8
            if "sound" in active_anom:
                sev = active_anom["sound"]["severity"]
                sound_offset = 32.0 if sev == "critical" else 18.0
            if "current" in active_anom:
                sev = active_anom["current"]["severity"]
                curr_offset = 11.0 if sev == "critical" else 6.0

            # Dynamic update with inertia
            curr["temperature"] = round(curr["temperature"] * 0.7 + (target_temp + temp_offset + random.uniform(-0.3, 0.3)) * 0.3, 2)
            curr["vibration"] = round(curr["vibration"] * 0.7 + (target_vib + vib_offset + random.uniform(-0.08, 0.08)) * 0.3, 2)
            curr["sound"] = round(curr["sound"] * 0.7 + (target_sound + sound_offset + random.uniform(-0.5, 0.5)) * 0.3, 1)
            curr["current"] = round(curr["current"] * 0.7 + (target_curr + curr_offset + random.uniform(-0.1, 0.1)) * 0.3, 2)

            point = {
                "temperature": curr["temperature"],
                "vibration": curr["vibration"],
                "sound": curr["sound"],
                "current": curr["current"],
                "timestamp": dt_str,
                "epoch": now_ts,
                "is_live": False
            }
            self.history[m_id].append(point)
            if len(self.history[m_id]) > config.MAX_HISTORY_POINTS:
                self.history[m_id].pop(0)

    def get_current_reading(self, machine_id: str) -> Dict[str, Any]:
        m_id = resolve_machine_id(machine_id) or "cnc-01"

        now_ts = time.time()
        dt_str = datetime.fromtimestamp(now_ts, tz=timezone.utc).isoformat()
        if m_id not in self.current_state:
            baseline = config.MACHINES.get("cnc-01", {}).get("baseline", {"temperature": 62.4, "vibration": 2.3, "sound": 48.0, "current": 4.8})
            self.current_state[m_id] = baseline.copy()

        st = self.current_state[m_id]
        is_live = self.is_live_data(m_id)

        return {
            "temperature": st["temperature"],
            "vibration": st["vibration"],
            "sound": st["sound"],
            "current": st["current"],
            "timestamp": dt_str,
            "is_live": is_live,
            "last_seen_sec_ago": round(now_ts - self.last_real_data_timestamp.get(m_id, 0.0), 1)
        }

    def get_history(self, machine_id: str, limit: int = 60) -> List[Dict[str, Any]]:
        m_id = resolve_machine_id(machine_id) or "cnc-01"
        if m_id not in self.history:
            return []
        return self.history[m_id][-limit:]

    def inject_anomaly(self, machine_id: str, sensor: str, severity: str = "critical") -> None:
        m_id = resolve_machine_id(machine_id)
        if not m_id:
            raise ValueError(f"Unknown machine: {machine_id}")
        if sensor not in {"temperature", "vibration", "sound", "current", "all"}:
            raise ValueError(f"Unknown sensor: {sensor}")
        if severity not in {"warning", "critical"}:
            raise ValueError(f"Unknown severity: {severity}")
        if m_id not in self.anomalies:
            self.anomalies[m_id] = {}

        anomaly_targets = {
            "temperature": 88.5 if severity == "critical" else 77.5,
            "vibration": 7.8 if severity == "critical" else 5.2,
            "sound": 88.0 if severity == "critical" else 74.0,
            "current": 16.5 if severity == "critical" else 11.2
        }

        if sensor == "all":
            for s in ["temperature", "vibration", "sound", "current"]:
                self.anomalies[m_id][s] = {"severity": severity, "time": time.time()}
                self.current_state[m_id][s] = anomaly_targets[s]
        else:
            self.anomalies[m_id][sensor] = {"severity": severity, "time": time.time()}
            self.current_state[m_id][sensor] = anomaly_targets[sensor]

        # Trigger immediate anomaly evaluation and force alert logging
        from app.services.anomaly_detector import anomaly_detector
        from app.services.alert_service import alert_service
        eval_res = anomaly_detector.evaluate_readings(self.get_current_reading(m_id))
        if eval_res.get("anomalies"):
            alert_service.process_anomalies(m_id, eval_res["anomalies"], force_log=True)

    def clear_anomalies(self, machine_id: str) -> None:
        m_id = resolve_machine_id(machine_id) or "cnc-01"
        if m_id in self.anomalies:
            self.anomalies[m_id].clear()
            m_info = config.MACHINES.get(m_id)
            if m_info:
                self.current_state[m_id] = m_info["baseline"].copy()

# Global Provider Instance
sensor_provider = SimulatedSensorDataProvider()
