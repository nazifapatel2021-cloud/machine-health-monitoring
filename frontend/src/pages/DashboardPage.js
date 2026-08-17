const DashboardPage = ({ machine, health, sensors, prediction, alerts, onInjectAnomaly, onNavigate }) => {
  if (!machine || !sensors) {
    return <div className="p-8 text-center text-slate-400">Loading machine telemetry...</div>;
  }

  const readings = sensors.readings || {};
  const evals = sensors.evaluations || {};

  return (
    <div className="space-y-6">
      {/* Top Banner: Active Machine Overview */}
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

        {/* Action Panel */}
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

      {/* Main Grid: Circular Health Score + AI Risk Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Visual Health Score Gauge */}
        <div className="lg:col-span-1">
          <HealthGauge score={health.health_score} condition={health.condition} />
        </div>

        {/* AI Failure Risk Analysis Card */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <span>🤖 AI FAILURE RISK ANALYSIS</span>
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                prediction.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-500' :
                prediction.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-500' :
                prediction.risk_level === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border-amber-500' :
                'bg-emerald-950 text-emerald-400 border-emerald-500'
              }`}>
                RISK: {prediction.risk_level || "LOW"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Failure Probability</span>
                <span className="text-2xl font-bold font-mono text-white">{prediction.failure_probability}%</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Estimated Health</span>
                <span className="text-2xl font-bold font-mono text-white">{prediction.health_score}%</span>
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
              <p className="leading-relaxed">{prediction.recommended_action}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Machine Condition: <strong className="text-slate-300">{health.condition}</strong></span>
            <button onClick={() => onNavigate("prediction")} className="text-cyan-400 hover:underline">
              Detailed AI Health Report →
            </button>
          </div>
        </div>
      </div>

      {/* Sensor Telemetry Grid */}
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

      {/* Recent Alerts Feed */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <span>🚨 Recent Anomaly Alerts</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {alerts.length} Total
            </span>
          </h3>
          <button onClick={() => onNavigate("alerts")} className="text-xs text-cyan-400 hover:underline">
            View All Alert Logs →
          </button>
        </div>

        {alerts.length === 0 ? (
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
