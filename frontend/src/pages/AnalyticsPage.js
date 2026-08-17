const AnalyticsPage = ({ machineId, analyticsData }) => {
  const [activeMetric, setActiveMetric] = React.useState("temperature");
  const [rangeLimit, setRangeLimit] = React.useState(30);

  const history = analyticsData?.history || [];
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || history.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 260;

    ctx.clearRect(0, 0, width, height);

    // Padding
    const pLeft = 45;
    const pRight = 20;
    const pTop = 30;
    const pBottom = 35;
    const graphW = width - pLeft - pRight;
    const graphH = height - pTop - pBottom;

    // Data values for active metric
    const values = history.map(point => point[activeMetric] || 0);
    const minVal = Math.floor(Math.min(...values) * 0.9);
    const maxVal = Math.ceil(Math.max(...values) * 1.1) || 1;

    // Draw Grid Lines & Y Labels
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px JetBrains Mono';

    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = pTop + (graphH / gridRows) * i;
      const val = maxVal - ((maxVal - minVal) / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(pLeft, y);
      ctx.lineTo(width - pRight, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(1), 10, y + 4);
    }

    // Draw X Axis Labels (timestamps)
    const stepX = graphW / (values.length - 1 || 1);
    const labelStep = Math.max(1, Math.floor(values.length / 5));

    for (let i = 0; i < values.length; i += labelStep) {
      const x = pLeft + i * stepX;
      const ts = history[i].timestamp || "";
      ctx.fillText(ts, x - 15, height - 10);
    }

    // Colors per metric
    const colors = {
      temperature: '#EF4444',
      vibration: '#F59E0B',
      sound: '#3B82F6',
      current: '#10B981',
      health_score: '#8B5CF6'
    };
    const activeColor = colors[activeMetric] || '#06B6D4';

    // Plot Line
    ctx.beginPath();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 2.5;

    values.forEach((val, i) => {
      const x = pLeft + i * stepX;
      const y = pTop + graphH - ((val - minVal) / (maxVal - minVal)) * graphH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Area Fill Gradient
    const gradient = ctx.createLinearGradient(0, pTop, 0, height - pBottom);
    gradient.addColorStop(0, `${activeColor}33`);
    gradient.addColorStop(1, `${activeColor}00`);

    ctx.lineTo(pLeft + (values.length - 1) * stepX, height - pBottom);
    ctx.lineTo(pLeft, height - pBottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Highlight newest last data point
    if (values.length > 0) {
      const lastIdx = values.length - 1;
      const lastX = pLeft + lastIdx * stepX;
      const lastY = pTop + graphH - ((values[lastIdx] - minVal) / (maxVal - minVal)) * graphH;

      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = activeColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

  }, [history, activeMetric]);

  // Calculate statistics
  const currentValues = history.map(p => p[activeMetric] || 0);
  const minVal = currentValues.length ? Math.min(...currentValues).toFixed(1) : 0;
  const maxVal = currentValues.length ? Math.max(...currentValues).toFixed(1) : 0;
  const avgVal = currentValues.length ? (currentValues.reduce((a,b)=>a+b,0)/currentValues.length).toFixed(1) : 0;

  const metricUnits = {
    temperature: "°C", vibration: "mm/s", sound: "dB", current: "A", health_score: "%"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>📊 Telemetry Time Series Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Historical data stream & trend visualization</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 font-mono">Range:</span>
          {[
            { label: "30 Readings", val: 30 },
            { label: "60 Readings", val: 60 },
            { label: "120 Readings", val: 120 }
          ].map(r => (
            <button
              key={r.val}
              onClick={() => setRangeLimit(r.val)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                rangeLimit === r.val ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: "temperature", label: "Temperature", icon: "🌡️", unit: "°C" },
          { id: "vibration", label: "Vibration", icon: "📳", unit: "mm/s" },
          { id: "sound", label: "Sound Level", icon: "🔊", unit: "dB" },
          { id: "current", label: "Current", icon: "⚡", unit: "A" },
          { id: "health_score", label: "Health Score", icon: "💚", unit: "%" },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setActiveMetric(m.id)}
            className={`p-3.5 rounded-xl border transition text-left flex flex-col justify-between ${
              activeMetric === m.id
                ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                : 'glass-card border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{m.icon} {m.label}</span>
              <span className="font-mono text-[11px] text-slate-500">{m.unit}</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white">
              {history.length ? history[history.length - 1][m.id] : 0} <span className="text-xs text-slate-400">{m.unit}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Chart Container */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <span>{activeMetric.toUpperCase()} TREND OVER TIME</span>
            <span className="text-xs font-mono text-slate-400 font-normal">({metricUnits[activeMetric]})</span>
          </h3>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-slate-400">Min: <strong className="text-white">{minVal}</strong></span>
            <span className="text-slate-400">Avg: <strong className="text-cyan-400">{avgVal}</strong></span>
            <span className="text-slate-400">Max: <strong className="text-white">{maxVal}</strong></span>
          </div>
        </div>

        {/* Canvas Rendered Line Graph */}
        <div className="w-full relative min-h-[260px] bg-slate-950/60 rounded-xl p-2 border border-slate-800">
          <canvas ref={canvasRef} className="w-full h-[260px] block" />
        </div>
      </div>

      {/* Analytics Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Signal Quality</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">High Precision / Low Noise</span>
          <p className="text-xs text-slate-500 mt-1">Sensor data streams are filtered within normal operating envelopes.</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Update Frequency</span>
          <span className="text-lg font-bold text-cyan-400 font-mono">2.0 Seconds</span>
          <p className="text-xs text-slate-500 mt-1">Real-time telemetry sample intervals.</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">History Window</span>
          <span className="text-lg font-bold text-purple-400 font-mono">Last {history.length} Readings</span>
          <p className="text-xs text-slate-500 mt-1">Historical telemetry buffer retained for trend analysis.</p>
        </div>
      </div>
    </div>
  );
};
