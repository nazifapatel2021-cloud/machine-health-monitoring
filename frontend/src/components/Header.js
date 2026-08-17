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
      {/* Left: Branding & Machine Dropdown */}
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

        {/* Machine Selector Dropdown */}
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

      {/* Right Controls & Status Indicator */}
      <div className="flex items-center space-x-3">
        {/* Status Badge: LIVE DATA vs DEMO MODE */}
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

        {/* Anomaly Injector Trigger Buttons */}
        <div className="hidden sm:flex items-center space-x-1.5">
          <button
            onClick={() => onInjectAnomaly(selectedMachineId, "vibration", "critical")}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center space-x-1 transition shadow-sm"
            title="Inject simulated vibration spike to demonstrate WARNING/CRITICAL alert triggering"
          >
            <span>⚠️ Inject Anomaly</span>
          </button>
          <button
            onClick={() => onClearAnomalies(selectedMachineId)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition"
            title="Reset machine state to baseline healthy parameters"
          >
            <span>🔄 Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
