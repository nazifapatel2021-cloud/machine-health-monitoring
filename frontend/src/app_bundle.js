// Consolidated MachinaAI Application Bundle for Babel Standalone
// Ensures 100% guaranteed sequential execution without async script race conditions

// --- 1. API Service ---
const API_BASE = window.ENV_API_BASE || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : `${window.location.origin}/api`
);

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
      disclaimer: "Machine health risk prediction."
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
          disclaimer: "AI recommendation — verify with engineering team."
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

// --- 2. Header Component ---
const Header = ({ 
  machines, 
  selectedMachineId, 
  onSelectMachine, 
  onInjectAnomaly, 
  onClearAnomalies,
  isLiveData 
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shadow-md shadow-cyan-500/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>MachinaAI</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">Machine Health & Predictive Maintenance Platform</p>
          </div>
        </div>

        <div className="relative pl-3 border-l border-slate-800">
          <select 
            value={selectedMachineId}
            onChange={(e) => onSelectMachine(e.target.value)}
            className="bg-slate-900 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer hover:border-slate-600 transition"
          >
            {machines.map(m => (
              <option key={m.id} value={m.id}>
                🏭 {m.name} ({m.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-mono font-bold shadow-sm ${
          isLiveData 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
            : 'bg-amber-950/80 text-amber-300 border-amber-500/60'
        }`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveData ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLiveData ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span>{isLiveData ? "🟢 LIVE DATA" : "🟡 DEMO MODE"}</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5">
          <button
            onClick={() => onInjectAnomaly(selectedMachineId, "vibration", "critical")}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center space-x-1 transition shadow-sm"
            title="Inject simulated vibration spike"
          >
            <span>⚠️ Inject Anomaly</span>
          </button>
          <button
            onClick={() => onClearAnomalies(selectedMachineId)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition"
            title="Reset machine parameters"
          >
            <span>🔄 Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// --- 3. Sidebar Component ---
const Sidebar = ({ activeTab, onTabChange, isCollapsed, onToggleCollapse }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "prediction", label: "AI Prediction", icon: "🤖" },
    { id: "alerts", label: "Alerts", icon: "🚨" },
    { id: "maintenance", label: "Maintenance", icon: "🔧" },
    { id: "details", label: "Machine Specs", icon: "🏭" },
    { id: "settings", label: "Settings", icon: "🛠️" },
  ];

  return (
    <aside className={`bg-[#0B0F17] border-r border-slate-800 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16' : 'w-60'} min-h-full`}>
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed && <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</span>}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition mx-auto"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive 
                  ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono text-center">
          <div className="text-slate-400 font-medium">Machine Health Platform</div>
          <div className="text-cyan-400/80">Predictive Maintenance</div>
        </div>
      )}
    </aside>
  );
};

// --- 4. HealthGauge Component ---
const HealthGauge = ({ score = 94, condition = "GOOD" }) => {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#10B981";
  let conditionText = "GOOD CONDITION";
  let badgeBg = "bg-emerald-950/60 text-emerald-400 border-emerald-500/40";

  if (score < 50 || condition === "CRITICAL") {
    strokeColor = "#EF4444";
    conditionText = "CRITICAL RISK";
    badgeBg = "bg-red-950/60 text-red-400 border-red-500/40";
  } else if (score < 80 || condition === "WARNING") {
    strokeColor = "#F59E0B";
    conditionText = "WARNING STATE";
    badgeBg = "bg-amber-950/60 text-amber-400 border-amber-500/40";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-slate-800 text-center relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${strokeColor} 0%, transparent 70%)`
        }}
      />

      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
        Overall Machine Health Score
      </h3>

      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} stroke="#1F2937" strokeWidth="12" fill="transparent" />
          <circle
            cx="80" cy="80" r={radius} stroke={strokeColor} strokeWidth="12"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" fill="transparent" className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
            {score.toFixed(0)}<span className="text-xl text-slate-400">%</span>
          </span>
          <span className={`mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
            {conditionText}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 w-full text-[11px] border-t border-slate-800/80 pt-3">
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mb-1"></div>
          <span className="text-slate-400">80–100%</span>
          <span className="text-emerald-400 font-semibold">GOOD</span>
        </div>
        <div className="flex flex-col items-center border-x border-slate-800">
          <div className="w-2 h-2 rounded-full bg-amber-500 mb-1"></div>
          <span className="text-slate-400">50–79%</span>
          <span className="text-amber-400 font-semibold">WARN</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mb-1"></div>
          <span className="text-slate-400">0–49%</span>
          <span className="text-red-400 font-semibold">CRIT</span>
        </div>
      </div>
    </div>
  );
};

// --- 5. SensorCard Component ---
const SensorCard = ({ title, value, unit, status = "NORMAL", warningThreshold, criticalThreshold, icon, trend = "flat" }) => {
  let statusBg = "bg-emerald-950/40 text-emerald-400 border-emerald-500/30";
  let barColor = "bg-emerald-500";
  let pulseDot = "bg-emerald-500";

  if (status === "CRITICAL") {
    statusBg = "bg-red-950/60 text-red-400 border-red-500/50 glow-red";
    barColor = "bg-red-500";
    pulseDot = "bg-red-500";
  } else if (status === "WARNING") {
    statusBg = "bg-amber-950/60 text-amber-400 border-amber-500/50 glow-amber";
    barColor = "bg-amber-500";
    pulseDot = "bg-amber-500";
  }

  const maxRef = criticalThreshold ? criticalThreshold * 1.2 : value * 1.5;
  const pctFill = Math.min(100, Math.max(5, (value / maxRef) * 100));

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-xl shadow-inner">
            {icon || "⚡"}
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h4>
            <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 mt-1 rounded-full border text-[10px] font-bold ${statusBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pulseDot}`}></span>
              <span>{status}</span>
            </span>
          </div>
        </div>

        <div className="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
          {trend === "up" ? "↗ +0.3" : trend === "down" ? "↘ -0.2" : "→ stable"}
        </div>
      </div>

      <div className="my-4">
        <div className="text-3xl font-extrabold font-mono text-white tracking-tight flex items-baseline space-x-1.5">
          <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
          <span className="text-lg font-normal text-slate-400 font-sans">{unit}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>0 {unit}</span>
          <span>Warn: {warningThreshold || "--"}</span>
          <span>Crit: {criticalThreshold || "--"}</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pctFill}%` }} />
        </div>
      </div>
    </div>
  );
};

// --- 6. DashboardPage Component ---
const DashboardPage = ({ machine, health, sensors, prediction, alerts, onInjectAnomaly, onNavigate }) => {
  if (!machine || !sensors) {
    return <div className="p-8 text-center text-slate-400">Loading machine telemetry...</div>;
  }

  const readings = sensors.readings || {};
  const evals = sensors.evaluations || {};
  const pred = prediction || { failure_probability: 6, health_score: 94, risk_level: "LOW", recommended_action: "Continue normal operation." };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-lg">
            🏭
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{machine.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{machine.status}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              ID: <span className="text-slate-200">{machine.id}</span> | Type: <span className="text-slate-200">{machine.type}</span> | Location: <span className="text-slate-200">{machine.location}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => onNavigate("prediction")}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 flex items-center space-x-2 transition"
          >
            <span>🤖 View AI Health Risk Analysis</span>
          </button>
          <button 
            onClick={() => onNavigate("analytics")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition"
          >
            <span>📊 Time Series Analytics</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HealthGauge score={health ? health.health_score : 94} condition={health ? health.condition : "GOOD"} />
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <span>🤖 AI FAILURE RISK ANALYSIS</span>
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                pred.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-500' :
                pred.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-500' :
                pred.risk_level === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border-amber-500' :
                'bg-emerald-950 text-emerald-400 border-emerald-500'
              }`}>
                RISK: {pred.risk_level || "LOW"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Failure Probability</span>
                <span className="text-2xl font-bold font-mono text-white">{pred.failure_probability}%</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Estimated Health</span>
                <span className="text-2xl font-bold font-mono text-white">{pred.health_score}%</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 col-span-2 md:col-span-1">
                <span className="text-xs text-slate-400 block mb-1">Operating Hours</span>
                <span className="text-2xl font-bold font-mono text-white">{machine.operating_hours} hrs</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs text-slate-300">
              <div className="font-semibold text-cyan-400 mb-1 flex items-center space-x-1">
                <span>💡 Recommended Maintenance Action:</span>
              </div>
              <p className="leading-relaxed">{pred.recommended_action}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Machine Condition: <strong className="text-slate-300">{health ? health.condition : "GOOD"}</strong></span>
            <button onClick={() => onNavigate("prediction")} className="text-cyan-400 hover:underline">
              Detailed AI Health Report →
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 pt-2">
        Live IoT Sensor Telemetry
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SensorCard 
          title="Temperature"
          value={readings.temperature || 0}
          unit="°C"
          status={evals.temperature?.status || "NORMAL"}
          warningThreshold={evals.temperature?.warning_threshold || 75}
          criticalThreshold={evals.temperature?.critical_threshold || 85}
          icon="🌡️"
        />

        <SensorCard 
          title="Vibration"
          value={readings.vibration || 0}
          unit="mm/s"
          status={evals.vibration?.status || "NORMAL"}
          warningThreshold={evals.vibration?.warning_threshold || 4.5}
          criticalThreshold={evals.vibration?.critical_threshold || 7.0}
          icon="📳"
        />

        <SensorCard 
          title="Sound Level"
          value={readings.sound || 0}
          unit="dB"
          status={evals.sound?.status || "NORMAL"}
          warningThreshold={evals.sound?.warning_threshold || 70}
          criticalThreshold={evals.sound?.critical_threshold || 85}
          icon="🔊"
        />

        <SensorCard 
          title="Current"
          value={readings.current || 0}
          unit="A"
          status={evals.current?.status || "NORMAL"}
          warningThreshold={evals.current?.warning_threshold || 10}
          criticalThreshold={evals.current?.critical_threshold || 15}
          icon="⚡"
        />
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <span>🚨 Recent Anomaly Alerts</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {alerts ? alerts.length : 0} Total
            </span>
          </h3>
          <button onClick={() => onNavigate("alerts")} className="text-xs text-cyan-400 hover:underline">
            View All Alert Logs →
          </button>
        </div>

        {(!alerts || alerts.length === 0) ? (
          <div className="p-4 text-center text-xs text-slate-500 font-mono">
            No active anomaly alerts detected. Machine operating within normal parameters.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alt) => (
              <div key={alt.id} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono ${
                    alt.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-700' :
                    alt.severity === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-700' :
                    'bg-blue-950 text-blue-400 border border-blue-700'
                  }`}>
                    {alt.severity}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white block">{alt.message}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {alt.machine_name} • Sensor: {alt.sensor} • {alt.timestamp}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">{alt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- 7. AnalyticsPage Component ---
const AnalyticsPage = ({ machineId, analyticsData }) => {
  const [activeMetric, setActiveMetric] = React.useState("temperature");
  const [rangeLimit, setRangeLimit] = React.useState(30);

  const history = analyticsData?.history || [];
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || history.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 260;

    ctx.clearRect(0, 0, width, height);

    const pLeft = 45;
    const pRight = 20;
    const pTop = 30;
    const pBottom = 35;
    const graphW = width - pLeft - pRight;
    const graphH = height - pTop - pBottom;

    const values = history.map(point => point[activeMetric] || 0);
    const minVal = Math.floor(Math.min(...values) * 0.9);
    const maxVal = Math.ceil(Math.max(...values) * 1.1) || 1;

    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px JetBrains Mono';

    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = pTop + (graphH / gridRows) * i;
      const val = maxVal - ((maxVal - minVal) / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(pLeft, y);
      ctx.lineTo(width - pRight, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(1), 10, y + 4);
    }

    const stepX = graphW / (values.length - 1 || 1);
    const labelStep = Math.max(1, Math.floor(values.length / 5));

    for (let i = 0; i < values.length; i += labelStep) {
      const x = pLeft + i * stepX;
      const ts = history[i].timestamp || "";
      ctx.fillText(ts, x - 15, height - 10);
    }

    const colors = {
      temperature: '#EF4444',
      vibration: '#F59E0B',
      sound: '#3B82F6',
      current: '#10B981',
      health_score: '#8B5CF6'
    };
    const activeColor = colors[activeMetric] || '#06B6D4';

    ctx.beginPath();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 2.5;

    values.forEach((val, i) => {
      const x = pLeft + i * stepX;
      const y = pTop + graphH - ((val - minVal) / (maxVal - minVal)) * graphH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, pTop, 0, height - pBottom);
    gradient.addColorStop(0, `${activeColor}33`);
    gradient.addColorStop(1, `${activeColor}00`);

    ctx.lineTo(pLeft + (values.length - 1) * stepX, height - pBottom);
    ctx.lineTo(pLeft, height - pBottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    if (values.length > 0) {
      const lastIdx = values.length - 1;
      const lastX = pLeft + lastIdx * stepX;
      const lastY = pTop + graphH - ((values[lastIdx] - minVal) / (maxVal - minVal)) * graphH;

      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = activeColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

  }, [history, activeMetric]);

  const currentValues = history.map(p => p[activeMetric] || 0);
  const minVal = currentValues.length ? Math.min(...currentValues).toFixed(1) : 0;
  const maxVal = currentValues.length ? Math.max(...currentValues).toFixed(1) : 0;
  const avgVal = currentValues.length ? (currentValues.reduce((a,b)=>a+b,0)/currentValues.length).toFixed(1) : 0;

  const metricUnits = {
    temperature: "°C", vibration: "mm/s", sound: "dB", current: "A", health_score: "%"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>📊 Telemetry Time Series Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Historical data stream & trend visualization</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 font-mono">Range:</span>
          {[
            { label: "30 Readings", val: 30 },
            { label: "60 Readings", val: 60 },
            { label: "120 Readings", val: 120 }
          ].map(r => (
            <button
              key={r.val}
              onClick={() => setRangeLimit(r.val)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                rangeLimit === r.val ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: "temperature", label: "Temperature", icon: "🌡️", unit: "°C" },
          { id: "vibration", label: "Vibration", icon: "📳", unit: "mm/s" },
          { id: "sound", label: "Sound Level", icon: "🔊", unit: "dB" },
          { id: "current", label: "Current", icon: "⚡", unit: "A" },
          { id: "health_score", label: "Health Score", icon: "💚", unit: "%" },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setActiveMetric(m.id)}
            className={`p-3.5 rounded-xl border transition text-left flex flex-col justify-between ${
              activeMetric === m.id
                ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                : 'glass-card border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{m.icon} {m.label}</span>
              <span className="font-mono text-[11px] text-slate-500">{m.unit}</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white">
              {history.length ? history[history.length - 1][m.id] : 0} <span className="text-xs text-slate-400">{m.unit}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <span>{activeMetric.toUpperCase()} TREND OVER TIME</span>
            <span className="text-xs font-mono text-slate-400 font-normal">({metricUnits[activeMetric]})</span>
          </h3>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-slate-400">Min: <strong className="text-white">{minVal}</strong></span>
            <span className="text-slate-400">Avg: <strong className="text-cyan-400">{avgVal}</strong></span>
            <span className="text-slate-400">Max: <strong className="text-white">{maxVal}</strong></span>
          </div>
        </div>

        <div className="w-full relative min-h-[260px] bg-slate-950/60 rounded-xl p-2 border border-slate-800">
          <canvas ref={canvasRef} className="w-full h-[260px] block" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Signal Quality</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">High Precision / Low Noise</span>
          <p className="text-xs text-slate-500 mt-1">Sensor data streams are filtered within normal operating envelopes.</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Update Frequency</span>
          <span className="text-lg font-bold text-cyan-400 font-mono">2.0 Seconds</span>
          <p className="text-xs text-slate-500 mt-1">Real-time telemetry sample intervals.</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">History Window</span>
          <span className="text-lg font-bold text-purple-400 font-mono">Last {history.length} Readings</span>
          <p className="text-xs text-slate-500 mt-1">Historical telemetry buffer retained for trend analysis.</p>
        </div>
      </div>
    </div>
  );
};

// --- 8. PredictionPage Component ---
const PredictionPage = ({ prediction, machine }) => {
  const pred = prediction || { health_score: 94, failure_probability: 6, risk_level: "LOW", recommended_action: "Continue normal operation and maintain regular scheduled inspection." };

  const riskColors = {
    LOW: { bg: "bg-emerald-950/60", text: "text-emerald-400", border: "border-emerald-500/50" },
    MEDIUM: { bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-500/50" },
    HIGH: { bg: "bg-orange-950/60", text: "text-orange-400", border: "border-orange-500/50" },
    CRITICAL: { bg: "bg-red-950/60", text: "text-red-400", border: "border-red-500/50" },
  };
  const rCfg = riskColors[pred.risk_level] || riskColors.LOW;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>🤖 Machine Health & Failure Risk Analysis</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated predictive risk assessment and decision-support summary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Health Index</span>
          <div className="text-4xl font-extrabold font-mono text-white my-2">
            {pred.health_score}<span className="text-lg text-slate-400">%</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Current Overall Score</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Failure Probability</span>
          <div className="text-4xl font-extrabold font-mono text-red-400 my-2">
            {pred.failure_probability}<span className="text-lg text-slate-400">%</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Estimated Failure Likelihood</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Evaluated Risk Level</span>
          <div className={`my-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xl font-bold font-mono ${rCfg.bg} ${rCfg.text} ${rCfg.border}`}>
            <span>{pred.risk_level}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Risk Status</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Machine Status</span>
          <div className="text-sm font-bold text-cyan-400 my-2">
            {machine?.name || "Equipment Monitored"}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Operating Hours: {machine?.operating_hours || 0} hrs</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
          <span>💡 Recommended Maintenance Action</span>
        </h3>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-sm font-medium text-slate-200 leading-relaxed">
          {pred.recommended_action}
        </div>
      </div>

      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-500 font-mono text-center">
        Demo Mode uses simulated sensor data for demonstration. AI predictions can be connected to real trained industrial data when available.
      </div>
    </div>
  );
};

// --- 9. AlertsPage Component ---
const AlertsPage = ({ alerts, onResolveAlert }) => {
  const [filterSeverity, setFilterSeverity] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const alertList = alerts || [];
  const filteredAlerts = alertList.filter(alt => {
    const matchesSev = filterSeverity === "all" || alt.severity.toLowerCase() === filterSeverity.toLowerCase() || (filterSeverity === "resolved" && alt.status === "RESOLVED");
    const matchesSearch = !searchQuery || alt.message.toLowerCase().includes(searchQuery.toLowerCase()) || alt.machine_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>🚨 System Anomaly Alert Log</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time threshold breach events and anomaly notifications timeline</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: "all", label: "All Alerts" },
            { id: "critical", label: "Critical" },
            { id: "warning", label: "Warning" },
            { id: "info", label: "Info" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterSeverity(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterSeverity === f.id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search alert messages, machines, or sensors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
        />
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            No alert logs match the current filter selection.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map(alt => {
              let sevClass = "bg-blue-950 text-blue-400 border-blue-700";
              if (alt.severity === "CRITICAL") sevClass = "bg-red-950 text-red-400 border-red-700 glow-red";
              else if (alt.severity === "WARNING") sevClass = "bg-amber-950 text-amber-400 border-amber-700 glow-amber";

              return (
                <div key={alt.id} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition hover:border-slate-700">
                  <div className="flex items-start space-x-3">
                    <span className={`mt-0.5 px-2.5 py-1 rounded text-[11px] font-bold font-mono border ${sevClass}`}>
                      {alt.severity}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{alt.message}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                        <span>🏭 {alt.machine_name}</span>
                        <span>• Sensor: <strong className="text-slate-200">{alt.sensor}</strong></span>
                        <span>• Value: <strong className="text-slate-200">{alt.value}</strong></span>
                        <span>• Threshold: <strong className="text-slate-200">{alt.threshold}</strong></span>
                        <span>• Time: {alt.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    {alt.status === "ACTIVE" ? (
                      <button
                        onClick={() => onResolveAlert(alt.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 text-xs font-medium transition"
                      >
                        ✓ Mark Resolved
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono px-2 py-1 bg-slate-950 rounded border border-slate-800">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// --- 10. MaintenancePage Component ---
const MaintenancePage = ({ maintenanceData, machine }) => {
  const recs = maintenanceData?.recommendations || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>🔧 Predictive Maintenance Recommendations</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated condition-based maintenance actions derived from real-time telemetry and anomaly scoring
        </p>
      </div>

      <div className="space-y-4">
        {recs.map((rec, idx) => {
          let prioColor = "bg-blue-950 text-blue-400 border-blue-700";
          if (rec.priority === "High") prioColor = "bg-red-950 text-red-400 border-red-700 glow-red";
          else if (rec.priority === "Medium") prioColor = "bg-amber-950 text-amber-400 border-amber-700 glow-amber";

          return (
            <div key={rec.id || idx} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-xl">
                    🔧
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Action Item #{idx + 1}: {rec.sensor} Maintenance</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Target Machine: {rec.machine_name || machine?.name}</span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${prioColor}`}>
                  Priority: {rec.priority}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">Telemetry Finding</span>
                  <p className="text-slate-200 leading-relaxed font-mono">{rec.finding}</p>
                </div>

                <div className="bg-cyan-950/30 p-4 rounded-xl border border-cyan-800/50 space-y-1">
                  <span className="text-cyan-400 font-semibold uppercase tracking-wider block">Recommended Service Action</span>
                  <p className="text-slate-100 leading-relaxed font-medium">{rec.recommendation}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono pt-1">
                <span>⚠️ {rec.disclaimer || "AI recommendation — verify with engineering team."}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 11. MachineDetailsPage Component ---
const MachineDetailsPage = ({ machine, sensors }) => {
  if (!machine) {
    return <div className="p-8 text-center text-slate-400">Loading Machine Specs...</div>;
  }

  const matrix = machine.sensor_status_matrix || {};
  const readings = sensors?.readings || machine.current_readings || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>🏭 Machine Specifications & Sensor Health Matrix</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed operational parameters, physical location, and sensor channel telemetry status
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Physical Equipment Profile</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Machine ID</span>
            <span className="text-sm font-bold text-white">{machine.id}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Equipment Name</span>
            <span className="text-sm font-bold text-white">{machine.name}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Machine Classification</span>
            <span className="text-sm font-bold text-cyan-400">{machine.type}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Factory Location</span>
            <span className="text-sm font-bold text-white">{machine.location}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Total Operating Hours</span>
            <span className="text-sm font-bold text-emerald-400">{machine.operating_hours} hrs</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Last Serviced Date</span>
            <span className="text-sm font-bold text-white">{machine.last_maintenance}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Next Scheduled Service</span>
            <span className="text-sm font-bold text-amber-400">{machine.next_maintenance}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Operating Condition</span>
            <span className="text-sm font-bold text-emerald-400">{machine.condition}</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Live Sensor Telemetry Matrix</span>
          <span className="text-[11px] font-mono text-emerald-400">4 Active Channels</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-3">Sensor Channel</th>
                <th className="pb-3 px-3">Live Value</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Warn Limit</th>
                <th className="pb-3 px-3">Crit Limit</th>
                <th className="pb-3 px-3">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[
                { name: "Temperature", val: readings.temperature, unit: "°C", warn: 75, crit: 85, st: matrix.temperature?.status || "NORMAL" },
                { name: "Vibration", val: readings.vibration, unit: "mm/s", warn: 4.5, crit: 7.0, st: matrix.vibration?.status || "NORMAL" },
                { name: "Sound Level", val: readings.sound, unit: "dB", warn: 70, crit: 85, st: matrix.sound?.status || "NORMAL" },
                { name: "Current", val: readings.current, unit: "A", warn: 10, crit: 15, st: matrix.current?.status || "NORMAL" },
              ].map(s => (
                <tr key={s.name} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-3 font-bold text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{s.name}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-100 font-bold text-sm">
                    {s.val} <span className="text-slate-400 text-xs font-normal">{s.unit}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.st === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      s.st === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {s.st}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{s.warn} {s.unit}</td>
                  <td className="py-3.5 px-3 text-slate-400">{s.crit} {s.unit}</td>
                  <td className="py-3.5 px-3 text-slate-500">{readings.timestamp || "Just now"} (2s ago)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 12. SettingsPage Component ---
const SettingsPage = ({ settings, onSaveSettings, onInjectAnomaly, onClearAnomalies, selectedMachineId }) => {
  const [formData, setFormData] = React.useState({
    temp_warning: 75.0,
    temp_critical: 85.0,
    vibration_warning: 4.5,
    vibration_critical: 7.0,
    sound_warning: 70.0,
    sound_critical: 85.0,
    current_warning: 10.0,
    current_critical: 15.0,
    simulation_speed: 2.0,
    demo_mode: true
  });

  const [statusMsg, setStatusMsg] = React.useState("");

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setStatusMsg("✅ Settings updated successfully!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>⚙️ System Configuration & Threshold Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Adjust central threshold rules, anomaly boundaries, and simulation engine parameters
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-400 text-xs font-mono font-bold">
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Sensor Anomaly Thresholds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>🌡️ Temperature (°C)</span>
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Warning Threshold</label>
                <input
                  type="number" step="0.1" name="temp_warning"
                  value={formData.temp_warning} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Critical Threshold</label>
                <input
                  type="number" step="0.1" name="temp_critical"
                  value={formData.temp_critical} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-red-400 font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>📳 Vibration (mm/s)</span>
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Warning Threshold</label>
                <input
                  type="number" step="0.1" name="vibration_warning"
                  value={formData.vibration_warning} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Critical Threshold</label>
                <input
                  type="number" step="0.1" name="vibration_critical"
                  value={formData.vibration_critical} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-red-400 font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>🔊 Sound Level (dB)</span>
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Warning Threshold</label>
                <input
                  type="number" step="0.1" name="sound_warning"
                  value={formData.sound_warning} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Critical Threshold</label>
                <input
                  type="number" step="0.1" name="sound_critical"
                  value={formData.sound_critical} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-red-400 font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>⚡ Current (A)</span>
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Warning Threshold</label>
                <input
                  type="number" step="0.1" name="current_warning"
                  value={formData.current_warning} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Critical Threshold</label>
                <input
                  type="number" step="0.1" name="current_critical"
                  value={formData.current_critical} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-red-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Engine & Simulation Controls
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Simulation Speed (Seconds per tick)</label>
              <select
                name="simulation_speed"
                value={formData.simulation_speed}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
              >
                <option value={1.0}>1.0s (Fast Stream)</option>
                <option value={2.0}>2.0s (Standard Stream)</option>
                <option value={5.0}>5.0s (Slow Stream)</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <input
                type="checkbox"
                id="demo_mode"
                name="demo_mode"
                checked={formData.demo_mode}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
              />
              <label htmlFor="demo_mode" className="text-slate-200 font-medium cursor-pointer">
                Enable Simulated Demo Mode (Simulate physics noise & drift)
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onInjectAnomaly(selectedMachineId, "vibration", "critical")}
              className="px-3 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-semibold"
            >
              ⚠️ Trigger Demo Anomaly
            </button>
            <button
              type="button"
              onClick={() => onClearAnomalies(selectedMachineId)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              🔄 Reset Baseline
            </button>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};

// --- 13. Main App Component ---
const App = () => {
  const [machines, setMachines] = React.useState([
    { id: "cnc-01", name: "CNC Machine 01", type: "Vertical Machining Center", location: "Building A - Bay 1", status: "ONLINE", operating_hours: 4280 },
    { id: "motor-02", name: "Motor Unit 02", type: "3-Phase Induction Motor", location: "Building A - Bay 3", status: "ONLINE", operating_hours: 6150 },
    { id: "compressor-03", name: "Compressor 03", type: "Rotary Screw Air Compressor", location: "Building B - Utility Room", status: "ONLINE", operating_hours: 2890 }
  ]);

  const [selectedMachineId, setSelectedMachineId] = React.useState("cnc-01");
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const [currentMachine, setCurrentMachine] = React.useState(null);
  const [healthData, setHealthData] = React.useState({ health_score: 94, condition: "GOOD" });
  const [sensorsData, setSensorsData] = React.useState(null);
  const [predictionData, setPredictionData] = React.useState(null);
  const [alertsData, setAlertsData] = React.useState([]);
  const [analyticsData, setAnalyticsData] = React.useState(null);
  const [maintenanceData, setMaintenanceData] = React.useState(null);
  const [settingsData, setSettingsData] = React.useState(null);

  const fetchTelemetry = React.useCallback(async () => {
    try {
      const [mList, mDetail, sData, hData, pData, aData, chartData, maintData] = await Promise.all([
        window.ApiService.getMachines(),
        window.ApiService.getMachine(selectedMachineId),
        window.ApiService.getSensors(selectedMachineId),
        window.ApiService.getHealth(selectedMachineId),
        window.ApiService.getPrediction(selectedMachineId),
        window.ApiService.getAlerts(selectedMachineId),
        window.ApiService.getAnalytics(selectedMachineId, 60),
        window.ApiService.getMaintenance(selectedMachineId)
      ]);

      if (mList && mList.length) setMachines(mList);
      if (mDetail) setCurrentMachine(mDetail);
      if (sData) setSensorsData(sData);
      if (hData) setHealthData(hData);
      if (pData) setPredictionData(pData);
      if (aData) setAlertsData(aData);
      if (chartData) setAnalyticsData(chartData);
      if (maintData) setMaintenanceData(maintData);
    } catch (err) {
      console.error("Telemetry fetch error:", err);
    }
  }, [selectedMachineId]);

  React.useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  React.useEffect(() => {
    window.ApiService.getSettings().then(cfg => {
      if (cfg) setSettingsData(cfg);
    });
  }, []);

  const handleInjectAnomaly = async (mId, sensor, severity) => {
    await window.ApiService.injectAnomaly(mId, sensor, severity);
    fetchTelemetry();
  };

  const handleClearAnomalies = async (mId) => {
    await window.ApiService.clearAnomalies(mId);
    fetchTelemetry();
  };

  const handleResolveAlert = async (alertId) => {
    await window.ApiService.resolveAlert(alertId);
    fetchTelemetry();
  };

  const handleSaveSettings = async (newCfg) => {
    await window.ApiService.updateSettings(newCfg);
    setSettingsData(newCfg);
    fetchTelemetry();
  };

  const renderPage = () => {
    const activeM = currentMachine || machines.find(m => m.id === selectedMachineId) || machines[0];

    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardPage 
            machine={activeM}
            health={healthData}
            sensors={sensorsData}
            prediction={predictionData || { failure_probability: 6, health_score: 94, risk_level: "LOW", recommended_action: "Continue normal operation." }}
            alerts={alertsData}
            onInjectAnomaly={handleInjectAnomaly}
            onNavigate={setActiveTab}
          />
        );
      case "analytics":
        return <AnalyticsPage machineId={selectedMachineId} analyticsData={analyticsData} />;
      case "prediction":
        return <PredictionPage prediction={predictionData} machine={activeM} />;
      case "alerts":
        return <AlertsPage alerts={alertsData} onResolveAlert={handleResolveAlert} />;
      case "maintenance":
        return <MaintenancePage maintenanceData={maintenanceData} machine={activeM} />;
      case "details":
        return <MachineDetailsPage machine={activeM} sensors={sensorsData} />;
      case "settings":
        return (
          <SettingsPage 
            settings={settingsData} 
            onSaveSettings={handleSaveSettings}
            onInjectAnomaly={handleInjectAnomaly}
            onClearAnomalies={handleClearAnomalies}
            selectedMachineId={selectedMachineId}
          />
        );
      default:
        return <DashboardPage machine={activeM} health={healthData} sensors={sensorsData} prediction={predictionData} alerts={alertsData} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#07090E] text-slate-100">
      <Header 
        machines={machines}
        selectedMachineId={selectedMachineId}
        onSelectMachine={setSelectedMachineId}
        onInjectAnomaly={handleInjectAnomaly}
        onClearAnomalies={handleClearAnomalies}
        isFallback={window.ApiService.isUsingFallback}
        isLiveData={window.ApiService.isLiveData}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

// Mount Application to Root DOM Container
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
