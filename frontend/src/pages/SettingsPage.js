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
      {/* Header */}
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
        {/* Sensor Thresholds Grid */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Sensor Anomaly Thresholds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Temperature */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>🌡️ Temperature (°C)</span>
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Warning Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  name="temp_warning"
                  value={formData.temp_warning}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Critical Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  name="temp_critical"
                  value={formData.temp_critical}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-red-400 font-mono"
                />
              </div>
            </div>

            {/* Vibration */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>📳 Vibration (mm/s)</span>
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Warning Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  name="vibration_warning"
                  value={formData.vibration_warning}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Critical Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  name="vibration_critical"
                  value={formData.vibration_critical}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-red-400 font-mono"
                />
              </div>
            </div>

            {/* Sound */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>🔊 Sound Level (dB)</span>
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Warning Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  name="sound_warning"
                  value={formData.sound_warning}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Critical Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  name="sound_critical"
                  value={formData.sound_critical}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-red-400 font-mono"
                />
              </div>
            </div>

            {/* Current */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>⚡ Current (A)</span>
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Warning Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  name="current_warning"
                  value={formData.current_warning}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Critical Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  name="current_critical"
                  value={formData.current_critical}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-red-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Engine Controls */}
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

        {/* Save Button */}
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
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
