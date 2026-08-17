const MaintenancePage = ({ maintenanceData, machine }) => {
  const recs = maintenanceData?.recommendations || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>🔧 Predictive Maintenance Recommendations</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated condition-based maintenance actions derived from real-time telemetry and ML anomaly scoring
        </p>
      </div>

      {/* Recommendations Cards */}
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

                <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-800/50 space-y-1">
                  <span className="text-blue-400 font-semibold uppercase tracking-wider block">Recommended Service Action</span>
                  <p className="text-slate-100 leading-relaxed font-medium">{rec.recommendation}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono pt-1">
                <span>⚠️ {rec.disclaimer || "AI demo recommendation — verify with certified engineering team."}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
