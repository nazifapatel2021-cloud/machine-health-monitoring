# AI-Powered Machine Health Monitoring and Predictive Maintenance System

A complete Computer Engineering senior project web application for real-time industrial machine health monitoring, IoT sensor telemetry analysis, Scikit-Learn Random Forest failure prediction, threshold anomaly detection, and predictive maintenance scheduling.

---

## 🚀 Quick Start Guide

### 1. Launch the Application Server
Run the python backend server from the project directory:
```bash
python backend/run.py
```

### 2. Open in Your Web Browser
Open your browser and navigate to:
```
http://127.0.0.1:8000
```

> **Why navigate to `http://127.0.0.1:8000` instead of double-clicking `index.html`?**
> Modern web browsers block modular JavaScript files when opened directly via local `file://` paths due to security/CORS browser policies. Navigating to `http://127.0.0.1:8000` loads the web app via the FastAPI web server, giving you full access to live real-time telemetry streams, Scikit-Learn AI predictions, and full interactive controls!

---

## 📡 Hardware Ingest API Contract (ESP32 Integration)

To connect physical IoT sensors or ESP32 microcontrollers, send HTTP `POST` requests to:

```
POST /api/sensors/{machine_id}/ingest
```

### JSON Request Payload Schema:
```json
{
  "temperature": 62.4,
  "vibration": 2.3,
  "sound": 48.0,
  "current": 4.8
}
```

### Response Payload:
```json
{
  "status": "success",
  "message": "Real sensor data ingested for machine 'cnc-01'",
  "is_live": true,
  "reading": {
    "temperature": 62.4,
    "vibration": 2.3,
    "sound": 48.0,
    "current": 4.8,
    "timestamp": "15:05:00",
    "is_live": true
  }
}
```

### Automatic 15-Second Fallback Behavior:
- **🟢 LIVE DATA**: Active whenever real hardware sensor data arrives within the last 15 seconds.
- **🟡 DEMO MODE**: Automatically engages if no real hardware payload is received for >15 seconds.

---

## 🛠️ System Features & Pages

- 🏠 **Dashboard**: Primary monitoring view displaying active Machine Overview, circular Health Gauge, live sensor cards (Temperature `°C`, Vibration `mm/s`, Sound `dB`, Current `A`), quick AI risk summary, and recent alerts feed.
- 📊 **Analytics**: Time-series historical charts for all 4 telemetry channels + Health Score trend over time, range selector, and Min/Avg/Max stats.
- 🤖 **AI Prediction**: ML Failure Risk %, Health Score %, Risk Level badge, Scikit-learn RF feature importance bars, recommended action, and explainable ML rationale.
- 🚨 **Alerts**: Event log timeline with severity filters (`ALL`, `CRITICAL`, `WARNING`, `INFO`, `RESOLVED`), search bar, severity badges, and "Resolve" action button.
- 🔧 **Maintenance**: Actionable maintenance recommendations with priority tags (`High`, `Medium`, `Low`), sensor findings, recommended servicing action, and AI demo disclaimer.
- 🏭 **Machine Specs**: Detailed machine metadata (CNC Machine 01, Motor Unit 02, Compressor 03) + Live Sensor Status Matrix table.
- ⚙️ **Architecture**: Interactive step-by-step pipeline diagram: `Sensors -> ESP32 -> Wi-Fi -> MQTT -> FastAPI Backend -> Database -> ML Prediction Model -> Web Dashboard -> Alerts`, with visual tags for **IoT/Electrical Team** vs **Computer Engineering/Software**.
- ℹ️ **About Project**: Project summary, Key Objectives, Tech Stack Matrix (Implemented vs Future), Academic Honesty disclaimer.
- ⚙️ **Settings**: Central threshold controls (Temp, Vibration, Sound, Current), Simulation speed control, Demo mode toggle, clear anomalies button.
- 🔐 **Demo Login**: Credentials: `admin` / `admin123`.

---

## 🏗️ Project Architecture & Tech Stack

```
Machine_health/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI web server & static mounting
│   │   ├── config.py              # Central machine baselines & threshold defaults
│   │   ├── models/schemas.py      # Pydantic data schemas
│   │   ├── services/
│   │   │   ├── data_provider.py   # SensorDataProvider (Simulated & MQTT placeholder)
│   │   │   ├── ml_model.py        # Scikit-learn Random Forest model
│   │   │   ├── anomaly_detector.py# Rule-based threshold evaluator
│   │   │   ├── alert_service.py   # Anomaly alert timeline logger
│   │   │   └── maintenance_service.py # Predictive maintenance generator
│   │   └── routes/                # FastAPI API endpoints
│   ├── requirements.txt
│   └── run.py
└── frontend/
    ├── index.html                 # Master HTML container
    └── src/
        ├── app.js                 # React root component & polling router
        ├── services/api.js        # API service with client simulation fallback
        ├── components/            # Header, Sidebar, HealthGauge, SensorCard, Login Modal
        -[# pages/                 # All 9 view pages
```
