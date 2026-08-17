const AlertsPage = ({ alerts, onResolveAlert }) => {
  const [filterSeverity, setFilterSeverity] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredAlerts = alerts.filter(alt => {
    const matchesSev = filterSeverity === "all" || alt.severity.toLowerCase() === filterSeverity.toLowerCase() || (filterSeverity === "resolved" && alt.status === "RESOLVED");
    const matchesSearch = !searchQuery || alt.message.toLowerCase().includes(searchQuery.toLowerCase()) || alt.machine_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>🚨 System Anomaly Alert Log</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time threshold breach events and anomaly notifications timeline</p>
        </div>

        {/* Severity Filter Tabs */}
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
                filterSeverity === f.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search alert messages, machines, or sensors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
      </div>

      {/* Alert Timeline List */}
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
