const App = () => {
  const [machines, setMachines] = React.useState([
    { id: "cnc-01", name: "CNC Machine 01", type: "Vertical Machining Center", location: "Building A - Bay 1", status: "ONLINE", operating_hours: 4280 },
    { id: "motor-02", name: "Motor Unit 02", type: "3-Phase Induction Motor", location: "Building A - Bay 3", status: "ONLINE", operating_hours: 6150 },
    { id: "compressor-03", name: "Compressor 03", type: "Rotary Screw Air Compressor", location: "Building B - Utility Room", status: "ONLINE", operating_hours: 2890 }
  ]);

  const [selectedMachineId, setSelectedMachineId] = React.useState("cnc-01");
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Telemetry state
  const [currentMachine, setCurrentMachine] = React.useState(null);
  const [healthData, setHealthData] = React.useState({ health_score: 94, condition: "GOOD" });
  const [sensorsData, setSensorsData] = React.useState(null);
  const [predictionData, setPredictionData] = React.useState(null);
  const [alertsData, setAlertsData] = React.useState([]);
  const [analyticsData, setAnalyticsData] = React.useState(null);
  const [maintenanceData, setMaintenanceData] = React.useState(null);
  const [settingsData, setSettingsData] = React.useState(null);

  // Poll telemetry every 2 seconds
  const fetchTelemetry = React.useCallback(async () => {
    try {
      const [mList, mDetail, sData, hData, pData, aData, chartData, maintData] = await Promise.all([
        window.ApiService.getMachines(),
        window.ApiService.getMachine(selectedMachineId),
        window.ApiService.getSensors(selectedMachineId),
        window.ApiService.getHealth(selectedMachineId),
        window.ApiService.getPrediction(selectedMachineId),
        window.ApiService.getAlerts(selectedMachineId),
        window.ApiService.getAnalytics(selectedMachineId, 60),
        window.ApiService.getMaintenance(selectedMachineId)
      ]);

      if (mList && mList.length) setMachines(mList);
      if (mDetail) setCurrentMachine(mDetail);
      if (sData) setSensorsData(sData);
      if (hData) setHealthData(hData);
      if (pData) setPredictionData(pData);
      if (aData) setAlertsData(aData);
      if (chartData) setAnalyticsData(chartData);
      if (maintData) setMaintenanceData(maintData);
    } catch (err) {
      console.error("Telemetry fetch error:", err);
    }
  }, [selectedMachineId]);

  // Initial & interval polling effect
  React.useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Initial settings fetch
  React.useEffect(() => {
    window.ApiService.getSettings().then(cfg => {
      if (cfg) setSettingsData(cfg);
    });
  }, []);

  // Anomaly Injection Handler
  const handleInjectAnomaly = async (mId, sensor, severity) => {
    await window.ApiService.injectAnomaly(mId, sensor, severity);
    fetchTelemetry();
  };

  // Clear Anomalies Handler
  const handleClearAnomalies = async (mId) => {
    await window.ApiService.clearAnomalies(mId);
    fetchTelemetry();
  };

  // Resolve Alert Handler
  const handleResolveAlert = async (alertId) => {
    await window.ApiService.resolveAlert(alertId);
    fetchTelemetry();
  };

  // Save Settings Handler
  const handleSaveSettings = async (newCfg) => {
    await window.ApiService.updateSettings(newCfg);
    setSettingsData(newCfg);
    fetchTelemetry();
  };

  // Render active tab page
  const renderPage = () => {
    const activeM = currentMachine || machines.find(m => m.id === selectedMachineId) || machines[0];

    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardPage 
            machine={activeM}
            health={healthData}
            sensors={sensorsData}
            prediction={predictionData || { failure_probability: 6, health_score: 94, risk_level: "LOW", recommended_action: "Continue normal operation." }}
            alerts={alertsData}
            onInjectAnomaly={handleInjectAnomaly}
            onNavigate={setActiveTab}
          />
        );
      case "analytics":
        return <AnalyticsPage machineId={selectedMachineId} analyticsData={analyticsData} />;
      case "prediction":
        return <PredictionPage prediction={predictionData} machine={activeM} />;
      case "alerts":
        return <AlertsPage alerts={alertsData} onResolveAlert={handleResolveAlert} />;
      case "maintenance":
        return <MaintenancePage maintenanceData={maintenanceData} machine={activeM} />;
      case "details":
        return <MachineDetailsPage machine={activeM} sensors={sensorsData} />;
      case "settings":
        return (
          <SettingsPage 
            settings={settingsData} 
            onSaveSettings={handleSaveSettings}
            onInjectAnomaly={handleInjectAnomaly}
            onClearAnomalies={handleClearAnomalies}
            selectedMachineId={selectedMachineId}
          />
        );
      default:
        return <DashboardPage machine={activeM} health={healthData} sensors={sensorsData} prediction={predictionData} alerts={alertsData} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#07090E] text-slate-100">
      {/* Top Header */}
      <Header 
        machines={machines}
        selectedMachineId={selectedMachineId}
        onSelectMachine={setSelectedMachineId}
        onInjectAnomaly={handleInjectAnomaly}
        onClearAnomalies={handleClearAnomalies}
        isFallback={window.ApiService.isUsingFallback}
        isLiveData={window.ApiService.isLiveData}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Content Workspace */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

// Mount Application to Root DOM Container
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
