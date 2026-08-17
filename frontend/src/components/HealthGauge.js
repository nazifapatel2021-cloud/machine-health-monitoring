const HealthGauge = ({ score = 94, condition = "GOOD" }) => {
  // SVG Circle Calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#10B981"; // Emerald green
  let glowClass = "glow-green";
  let conditionText = "GOOD CONDITION";
  let badgeBg = "bg-emerald-950/60 text-emerald-400 border-emerald-500/40";

  if (score < 50 || condition === "CRITICAL") {
    strokeColor = "#EF4444"; // Ruby red
    glowClass = "glow-red";
    conditionText = "CRITICAL RISK";
    badgeBg = "bg-red-950/60 text-red-400 border-red-500/40";
  } else if (score < 80 || condition === "WARNING") {
    strokeColor = "#F59E0B"; // Amber yellow
    glowClass = "glow-amber";
    conditionText = "WARNING STATE";
    badgeBg = "bg-amber-950/60 text-amber-400 border-amber-500/40";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-slate-800 text-center relative overflow-hidden">
      {/* Radial Background Accent */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${strokeColor} 0%, transparent 70%)`
        }}
      />

      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
        Overall Machine Health Score
      </h3>

      {/* SVG Radial Circular Gauge */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Track Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1F2937"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
            {score.toFixed(0)}<span className="text-xl text-slate-400">%</span>
          </span>
          <span className={`mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
            {conditionText}
          </span>
        </div>
      </div>

      {/* Configurable Threshold Reference Scale */}
      <div className="mt-5 grid grid-cols-3 gap-2 w-full text-[11px] border-t border-slate-800/80 pt-3">
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mb-1"></div>
          <span className="text-slate-400">80–100%</span>
          <span className="text-emerald-400 font-semibold">GOOD</span>
        </div>
        <div className="flex flex-col items-center border-x border-slate-800">
          <div className="w-2 h-2 rounded-full bg-amber-500 mb-1"></div>
          <span className="text-slate-400">50–79%</span>
          <span className="text-amber-400 font-semibold">WARN</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mb-1"></div>
          <span className="text-slate-400">0–49%</span>
          <span className="text-red-400 font-semibold">CRIT</span>
        </div>
      </div>
    </div>
  );
};
