const Sidebar = ({ activeTab, onTabChange, isCollapsed, onToggleCollapse }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "prediction", label: "AI Prediction", icon: "🤖" },
    { id: "alerts", label: "Alerts", icon: "🚨" },
    { id: "maintenance", label: "Maintenance", icon: "🔧" },
    { id: "details", label: "Machine Specs", icon: "🏭" },
    { id: "settings", label: "Settings", icon: "🛠️" },
  ];

  return (
    <aside className={`bg-[#0B0F17] border-r border-slate-800 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16' : 'w-60'} min-h-full`}>
      {/* Sidebar Header Toggle */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed && <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</span>}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition mx-auto"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* Menu List */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive 
                  ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer info badge */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono text-center">
          <div className="text-slate-400 font-medium">Machine Health Platform</div>
          <div className="text-cyan-400/80">Predictive Maintenance</div>
        </div>
      )}
    </aside>
  );
};
