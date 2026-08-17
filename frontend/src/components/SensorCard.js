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

  // Calculate percentage fill relative to critical threshold
  const maxRef = criticalThreshold ? criticalThreshold * 1.2 : value * 1.5;
  const pctFill = Math.min(100, Math.max(5, (value / maxRef) * 100));

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
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

        {/* Small trend badge */}
        <div className="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
          {trend === "up" ? "↗ +0.3" : trend === "down" ? "↘ -0.2" : "→ stable"}
        </div>
      </div>

      {/* Main Metric Display */}
      <div className="my-4">
        <div className="text-3xl font-extrabold font-mono text-white tracking-tight flex items-baseline space-x-1.5">
          <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
          <span className="text-lg font-normal text-slate-400 font-sans">{unit}</span>
        </div>
      </div>

      {/* Threshold Visual Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>0 {unit}</span>
          <span>Warn: {warningThreshold || "--"}</span>
          <span>Crit: {criticalThreshold || "--"}</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pctFill}%` }}
          />
        </div>
      </div>
    </div>
  );
};
