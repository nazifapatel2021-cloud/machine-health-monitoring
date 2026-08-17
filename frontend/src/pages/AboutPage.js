const AboutPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>ℹ️ About Project — Computer Engineering Senior Design</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          AI-Powered Machine Health Monitoring and Predictive Maintenance System
        </p>
      </div>

      {/* Abstract */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">1. System Overview</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Industrial equipment downtime costs manufacturing facilities millions in unplanned maintenance and lost production. 
          This project presents an intelligent industrial IoT monitoring platform designed to analyze physical telemetry 
          (Temperature, Vibration, Sound level, and Electrical Current consumption) using machine learning algorithms. 
          By detecting subtle mechanical and electrical anomalies in real time, the platform predicts machine health conditions 
          and provides targeted maintenance recommendations prior to catastrophic breakdowns.
        </p>
      </div>

      {/* Objectives */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">2. Key Engineering Objectives</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">📡 Real-Time Telemetry</span>
            <p className="text-slate-400">Continuous monitoring of multi-sensor telemetry channels with low-latency updates.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">⚠️ Early Fault Detection</span>
            <p className="text-slate-400">Rule-based and statistical anomaly detection catching baseline parameter drift.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">🤖 ML Risk Scoring</span>
            <p className="text-slate-400">Random Forest Ensemble model inferring failure probabilities & health scores.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">🔧 Predictive Servicing</span>
            <p className="text-slate-400">Actionable maintenance guidance prioritizing severe thermal/vibrational findings.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">⏱️ Downtime Reduction</span>
            <p className="text-slate-400">Maximizing Mean Time Between Failures (MTBF) through proactive intervention.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">🧩 Modular Hardware Layer</span>
            <p className="text-slate-400">Clean `SensorDataProvider` abstraction supporting future ESP32 MQTT integration.</p>
          </div>
        </div>
      </div>

      {/* Implemented vs Planned Technologies Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
          3. Technology Stack & Implementation Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 px-3">Technology Component</th>
                <th className="pb-3 px-3">Role / Purpose</th>
                <th className="pb-3 px-3">Implementation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-3 px-3 font-bold text-white">Python 3.14 + FastAPI</td>
                <td className="py-3 px-3 text-slate-300">Backend REST API & Telemetry Engine</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">✅ IMPLEMENTED</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Scikit-learn (Random Forest)</td>
                <td className="py-3 px-3 text-slate-300">Machine Health & Failure Risk ML Model</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">✅ IMPLEMENTED</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">React 18 + Tailwind CSS</td>
                <td className="py-3 px-3 text-slate-300">Industrial Monitoring Web Interface</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">✅ IMPLEMENTED</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Simulated Telemetry Provider</td>
                <td className="py-3 px-3 text-slate-300">Physics-based drift & anomaly simulator</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">✅ IMPLEMENTED</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-amber-300">ESP32 Microcontroller & Sensors</td>
                <td className="py-3 px-3 text-slate-400">Physical hardware telemetry sampling</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">🔌 HARDWARE TEAM</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-amber-300">MQTT Protocol Broker</td>
                <td className="py-3 px-3 text-slate-400">Real-time IoT wireless telemetry transport</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold">🔄 FUTURE INTEGRATION</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Disclaimer */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2 font-mono">
        <h4 className="font-bold text-white text-sm">📜 Academic Honesty Statement</h4>
        <p className="leading-relaxed">
          This system was developed as a college Computer Engineering software demonstration. 
          Currently, sensor values are provided by `SimulatedSensorDataProvider` to enable interactive evaluation without requiring physical hardware. 
          The backend API architecture allows replacing `SimulatedSensorDataProvider` with `MqttSensorDataProvider` once physical hardware and real industrial datasets are available.
        </p>
      </div>
    </div>
  );
};
