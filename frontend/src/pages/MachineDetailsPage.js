const MachineDetailsPage = ({ machine, sensors }) => {
  if (!machine) {
    return <div className="p-8 text-center text-slate-400">Loading Machine Specs...</div>;
  }

  const matrix = machine.sensor_status_matrix || {};
  const readings = sensors?.readings || machine.current_readings || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>🏭 Machine Specifications & Sensor Health Matrix</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed operational parameters, physical location, and sensor channel telemetry status
        </p>
      </div>

      {/* Machine Profile Grid */}
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
            <span className="text-sm font-bold text-blue-400">{machine.type}</span>
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

      {/* Sensor Status Table */}
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
