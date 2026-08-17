const ArchitecturePage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>⚙️ System Architecture & Data Flow Pipeline</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          End-to-end hardware-software integration topology for industrial predictive maintenance
        </p>
      </div>

      {/* Scope Legend Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/40 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">
            🔌
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">HARDWARE LAYER</h4>
            <p className="text-xs text-slate-300">Handled separately by Electrical & IoT Engineering Team</p>
          </div>
        </div>

        <div className="bg-cyan-950/40 p-4 rounded-xl border border-cyan-500/40 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xl">
            💻
          </div>
          <div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">SOFTWARE LAYER</h4>
            <p className="text-xs text-slate-300">Computer Engineering / Software System (Implemented in this project)</p>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Diagram Grid */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Data Streaming & AI Processing Pipeline Flow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1: Physical Sensors */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-amber-500/40 relative space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                1. HARDWARE
              </span>
              <span className="text-xs font-mono text-slate-400">IoT Sensing</span>
            </div>
            <div className="text-3xl">🌡️ 📳 🔊 ⚡</div>
            <h4 className="text-sm font-bold text-white">IoT Sensor Array</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Industrial sensors measuring temperature, mechanical vibration, acoustics, and electrical current consumption on machine housings.
            </p>
          </div>

          {/* Step 2: ESP32 Microcontroller */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-amber-500/40 relative space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                2. HARDWARE
              </span>
              <span className="text-xs font-mono text-slate-400">Edge MCU</span>
            </div>
            <div className="text-3xl">📟</div>
            <h4 className="text-sm font-bold text-white">Microcontroller Edge Node</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ESP32 microcontroller reading analog/digital signals, filtering noise, and packaging JSON telemetry streams.
            </p>
          </div>

          {/* Step 3: Wireless IoT Communication */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/40 relative space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                3. SOFTWARE / IOT
              </span>
              <span className="text-xs font-mono text-slate-400">Network Transport</span>
            </div>
            <div className="text-3xl">📡</div>
            <h4 className="text-sm font-bold text-white">Wireless IoT Network</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Wi-Fi / HTTP / MQTT protocol transmitting telemetry packages from edge sensor nodes to the central backend server.
            </p>
          </div>

          {/* Step 4: Backend Data Processing */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/40 relative space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                4. SOFTWARE
              </span>
              <span className="text-xs font-mono text-slate-400">Core Engine</span>
            </div>
            <div className="text-3xl">⚡</div>
            <h4 className="text-sm font-bold text-white">Backend Data Processing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Central server managing telemetry streams, threshold evaluations, history logging, and fallback execution.
            </p>
          </div>

          {/* Step 5: AI Prediction Engine */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-purple-500/40 relative space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                5. AI ENGINE
              </span>
              <span className="text-xs font-mono text-slate-400">Risk Analytics</span>
            </div>
            <div className="text-3xl">🤖</div>
            <h4 className="text-sm font-bold text-white">AI Prediction Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Machine learning models evaluating sensor telemetry patterns to calculate failure probabilities, health scores, and risk levels.
            </p>
          </div>

          {/* Step 6: Industrial Monitoring Dashboard */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/40 relative space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                6. USER INTERFACE
              </span>
              <span className="text-xs font-mono text-slate-400">Web Interface</span>
            </div>
            <div className="text-3xl">🖥️</div>
            <h4 className="text-sm font-bold text-white">Industrial Monitoring Dashboard</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time visualization, circular health gauge, anomaly alert timeline, predictive maintenance actions, and analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
