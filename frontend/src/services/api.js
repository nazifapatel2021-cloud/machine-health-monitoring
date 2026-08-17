// API Service layer with configurable API Base + Automatic 15s Live Data vs Demo Fallback

const API_BASE = window.ENV_API_BASE || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : `${window.location.origin}/api`
);

// Fallback client-side simulated state if backend server is unreachable
const fallbackState = {
  machines: [
    {
      id: "cnc-01",
      name: "CNC Machine 01",
      type: "Vertical Machining Center",
      location: "Building A - Bay 1",
      status: "ONLINE",
      operating_hours: 4280,
      last_maintenance: "2026-07-15",
      next_maintenance: "2026-09-15",
      health_score: 94.0,
      condition: "GOOD",
      current_readings: { temperature: 62.4, vibration: 2.3, sound: 48.0, current: 4.8, timestamp: "12:00:00" }
    },
    {
      id: "motor-02",
      name: "Motor Unit 02",
      type: "3-Phase Induction Motor",
      location: "Building A - Bay 3",
      status: "ONLINE",
      operating_hours: 6150,
      last_maintenance: "2026-06-10",
      next_maintenance: "2026-08-30",
      health_score: 91.5,
      condition: "GOOD",
      current_readings: { temperature: 68.1, vibration: 3.1, sound: 58.5, current: 7.2, timestamp: "12:00:00" }
    },
    {
      id: "compressor-03",
      name: "Compressor 03",
      type: "Rotary Screw Air Compressor",
      location: "Building B - Utility Room",
      status: "ONLINE",
      operating_hours: 2890,
      last_maintenance: "2026-08-01",
      next_maintenance: "2026-10-01",
      health_score: 89.0,
      condition: "GOOD",
      current_readings: { temperature: 55.3, vibration: 1.8, sound: 62.0, current: 3.9, timestamp: "12:00:00" }
    }
  ]
};

window.ApiService = {
  isUsingFallback: false,
  isLiveData: false,

  async fetchWithFallback(url, options = {}) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      window.ApiService.isUsingFallback = false;
      return data;
    } catch (err) {
      console.warn(`[Backend Offline Fallback]: Using client simulation engine: ${err.message}`);
      window.ApiService.isUsingFallback = true;
      window.ApiService.isLiveData = false;
      return null;
    }
  },

  async getMachines() {
    const data = await this.fetchWithFallback(`${API_BASE}/machines`);
    if (data) return data;
    return fallbackState.machines;
  },

  async getMachine(machineId) {
    const data = await this.fetchWithFallback(`${API_BASE}/machines/${machineId}`);
    if (data) return data;
    const m = fallbackState.machines.find(x => x.id === machineId) || fallbackState.machines[0];
    return {
      ...m,
      sensor_status_matrix: {
        temperature: { val: m.current_readings.temperature, status: "NORMAL", unit: "°C", warning_threshold: 75, critical_threshold: 85 },
        vibration: { val: m.current_readings.vibration, status: "NORMAL", unit: "mm/s", warning_threshold: 4.5, critical_threshold: 7.0 },
        sound: { val: m.current_readings.sound, status: "NORMAL", unit: "dB", warning_threshold: 70, critical_threshold: 85 },
        current: { val: m.current_readings.current, status: "NORMAL", unit: "A", warning_threshold: 10, critical_threshold: 15 }
      }
    };
  },

  async getSensors(machineId) {
    const data = await this.fetchWithFallback(`${API_BASE}/sensors/${machineId}`);
    if (data) {
      window.ApiService.isLiveData = !!data.is_live;
      return data;
    }
    const m = fallbackState.machines.find(x => x.id === machineId) || fallbackState.machines[0];
    return {
      machine_id: machineId,
      readings: m.current_readings,
      is_live: false,
      evaluations: {
        temperature: { val: m.current_readings.temperature, status: "NORMAL", unit: "°C" },
        vibration: { val: m.current_readings.vibration, status: "NORMAL", unit: "mm/s" },
        sound: { val: m.current_readings.sound, status: "NORMAL", unit: "dB" },
        current: { val: m.current_readings.current, status: "NORMAL", unit: "A" }
      },
      condition: m.condition,
      anomalies: []
    };
  },

  async getHealth(machineId) {
    const data = await this.fetchWithFallback(`${API_BASE}/health/${machineId}`);
    if (data) return data;
    const m = fallbackState.machines.find(x => x.id === machineId) || fallbackState.machines[0];
    return { machine_id: machineId, health_score: m.health_score, condition: m.condition };
  },

  async getPrediction(machineId) {
    const data = await this.fetchWithFallback(`${API_BASE}/prediction/${machineId}`);
    if (data) return data;
    const m = fallbackState.machines.find(x => x.id === machineId) || fallbackState.machines[0];
    return {
      machine_id: machineId,
      health_score: m.health_score,
      failure_probability: roundVal(100 - m.health_score, 1),
      risk_level: m.health_score > 80 ? "LOW" : m.health_score > 50 ? "MEDIUM" : "HIGH",
      recommended_action: "Continue normal operation and maintain regular scheduled inspection.",
      feature_importance: { temperature: 35.0, vibration: 40.0, sound: 15.0, current: 10.0 },
      is_demo_model: true,
      disclaimer: "Scikit-Learn Random Forest model prediction (Simulated fallback data)."
    };
  },

  async getAlerts(machineId = "all", severity = "all") {
    const query = [];
    if (machineId && machineId !== "all") query.push(`machine_id=${machineId}`);
    if (severity && severity !== "all") query.push(`severity=${severity}`);
    const qStr = query.length ? `?${query.join("&")}` : "";

    const data = await this.fetchWithFallback(`${API_BASE}/alerts${qStr}`);
    if (data) return data;
    return [
      {
        id: "alt-01",
        severity: "WARNING",
        timestamp: "10:35 AM",
        machine_id: "motor-02",
        machine_name: "Motor Unit 02",
        sensor: "Temperature",
        message: "Temperature approaching warning threshold (74.2 °C)",
        status: "RESOLVED",
        value: 74.2,
        threshold: 75.0
      }
    ];
  },

  async getAnalytics(machineId, limit = 60) {
    const data = await this.fetchWithFallback(`${API_BASE}/analytics/${machineId}?limit=${limit}`);
    if (data) return data;
    
    const history = [];
    const now = Date.now();
    for (let i = limit; i > 0; i--) {
      const ts = new Date(now - i * 2000).toLocaleTimeString();
      history.push({
        timestamp: ts,
        temperature: roundVal(62 + Math.sin(i * 0.1) * 1.5 + (Math.random() - 0.5), 1),
        vibration: roundVal(2.2 + Math.cos(i * 0.1) * 0.2 + (Math.random() - 0.5) * 0.1, 2),
        sound: roundVal(50 + Math.sin(i * 0.15) * 2 + (Math.random() - 0.5), 1),
        current: roundVal(4.8 + Math.sin(i * 0.08) * 0.3 + (Math.random() - 0.5) * 0.1, 2),
        health_score: roundVal(94 + Math.sin(i * 0.05) * 2, 1)
      });
    }
    return { machine_id: machineId, count: history.length, history };
  },

  async getMaintenance(machineId) {
    const data = await this.fetchWithFallback(`${API_BASE}/maintenance/${machineId}`);
    if (data) return data;
    return {
      machine_id: machineId,
      recommendations: [
        {
          id: "maint-1",
          machine_id: machineId,
          machine_name: "CNC Machine 01",
          sensor: "Vibration",
          finding: "Vibration level has slight drift over last 24h.",
          recommendation: "Inspect bearings, lubricate drive shaft, and check mounting torque.",
          priority: "Medium",
          timestamp: new Date().toLocaleDateString(),
          disclaimer: "AI demo recommendation — verify with mechanical engineer before servicing."
        }
      ],
      count: 1
    };
  },

  async getSettings() {
    const data = await this.fetchWithFallback(`${API_BASE}/settings`);
    if (data) return data;
    return {
      temp_warning: 75.0, temp_critical: 85.0,
      vibration_warning: 4.5, vibration_critical: 7.0,
      sound_warning: 70.0, sound_critical: 85.0,
      current_warning: 10.0, current_critical: 15.0,
      simulation_speed: 2.0, demo_mode: true
    };
  },

  async updateSettings(cfg) {
    const data = await this.fetchWithFallback(`${API_BASE}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg)
    });
    return data || { message: "Settings updated locally" };
  },

  async injectAnomaly(machineId, sensor, severity = "critical") {
    const data = await this.fetchWithFallback(`${API_BASE}/settings/inject-anomaly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ machine_id: machineId, sensor, severity })
    });
    return data || { message: `Injected ${severity} anomaly into ${sensor}` };
  },

  async clearAnomalies(machineId) {
    const data = await this.fetchWithFallback(`${API_BASE}/settings/clear-anomalies/${machineId}`, {
      method: "POST"
    });
    return data || { message: "Cleared anomalies" };
  },

  async resolveAlert(alertId) {
    const data = await this.fetchWithFallback(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: "POST"
    });
    return data || { success: true, alert_id: alertId };
  }
};

function roundVal(val, decimals = 1) {
  return Number(Math.round(val + "e" + decimals) + "e-" + decimals);
}
