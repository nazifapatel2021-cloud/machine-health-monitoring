const PredictionPage = ({ prediction, machine }) => {
  if (!prediction) {
    return <div className="p-8 text-center text-slate-400">Loading AI Health Prediction...</div>;
  }

  const riskColors = {
    LOW: { bg: "bg-emerald-950/60", text: "text-emerald-400", border: "border-emerald-500/50" },
    MEDIUM: { bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-500/50" },
    HIGH: { bg: "bg-orange-950/60", text: "text-orange-400", border: "border-orange-500/50" },
    CRITICAL: { bg: "bg-red-950/60", text: "text-red-400", border: "border-red-500/50" },
  };
  const rCfg = riskColors[prediction.risk_level] || riskColors.LOW;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>🤖 Machine Health & Failure Risk Analysis</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated predictive risk assessment and decision-support summary
        </p>
      </div>

      {/* Main Score & Risk Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Health Index</span>
          <div className="text-4xl font-extrabold font-mono text-white my-2">
            {prediction.health_score}<span className="text-lg text-slate-400">%</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Current Overall Score</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Failure Probability</span>
          <div className="text-4xl font-extrabold font-mono text-red-400 my-2">
            {prediction.failure_probability}<span className="text-lg text-slate-400">%</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Estimated Failure Likelihood</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Evaluated Risk Level</span>
          <div className={`my-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xl font-bold font-mono ${rCfg.bg} ${rCfg.text} ${rCfg.border}`}>
            <span>{prediction.risk_level}</span>
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

      {/* Recommended Maintenance Action Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
          <span>💡 Recommended Maintenance Action</span>
        </h3>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-sm font-medium text-slate-200 leading-relaxed">
          {prediction.recommended_action}
        </div>
      </div>

      {/* Subtle Professional Notice */}
      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-500 font-mono text-center">
        Demo Mode uses simulated sensor data for demonstration. AI predictions can be connected to real trained industrial data when available.
      </div>
    </div>
  );
};
