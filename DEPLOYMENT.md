# Production Deployment Guide — Render Web Service

This guide provides instructions for deploying the **AI-Powered Machine Health Monitoring System** as a unified single-service web application on **Render**.

---

## 🏗️ Architecture Summary

The production application runs as a **single Render Web Service**:
- **Backend API**: Python + FastAPI + Uvicorn + Scikit-Learn ML Engine.
- **Frontend Dashboard**: Served directly by FastAPI at the root URL (`/`) with static assets mounted at `/src`.
- **Single Public Domain**: Both frontend dashboard and `/api` routes are served from the same domain (`https://<YOUR-RENDER-APP>.onrender.com`), eliminating CORS issues and cross-domain dependencies.
- **Zero Build Dependencies**: No Node.js, npm, Vite, or Webpack required.

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: GitHub Preparation
1. Ensure all project files are committed to your GitHub repository:
   ```bash
   git add .
   git commit -m "Prepare production deployment configuration"
   git push origin main
   ```

---

### Step 2: Create Render Web Service
1. Log in to [Render Console](https://dashboard.render.com/).
2. Click **New +** ➔ Select **Web Service**.
3. Connect your GitHub repository containing `Machine_health`.

---

### Step 3: Configure Render Settings

Use the following settings in the Render creation form:

| Setting | Recommended Value | Notes |
| :--- | :--- | :--- |
| **Name** | `machina-ai-monitoring` | Or your preferred project name |
| **Region** | Oregon (US West) or closest region | Select region nearest to your target users |
| **Branch** | `main` | Production deployment branch |
| **Root Directory** | `.` | **Must be root `.`** so FastAPI can access both `backend/` and `frontend/` directories |
| **Runtime** | `Python 3` | Python 3.10+ runtime |
| **Build Command** | `pip install -r backend/requirements.txt` | Installs FastAPI, Uvicorn, Scikit-Learn, NumPy, etc. |
| **Start Command** | `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT` | Starts FastAPI on Render's dynamic `$PORT` |

---

### Step 4: Environment Variables (Optional)

Render automatically provides the `$PORT` environment variable. You can optionally add custom variables:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `DEMO_MODE` | `true` | Enables automatic physics noise simulation when no live sensor data is arriving |
| `SIMULATION_INTERVAL_SEC` | `2.0` | Telemetry tick update frequency |

---

### Step 5: Deploy & Obtain Public URL
1. Click **Create Web Service**.
2. Render will run the build command and launch the FastAPI server.
3. Once deployment completes (`Live`), copy your public URL from the top of the Render dashboard:
   ```text
   https://machina-ai-monitoring.onrender.com
   ```

---

### Step 6: Test Deployed Dashboard
Open your browser and navigate to your Render URL:
```text
https://machina-ai-monitoring.onrender.com
```

**Verification Checklist**:
- [x] Dashboard loads displaying **MachinaAI** title and machine selector.
- [x] Header displays 🟡 **DEMO MODE** badge.
- [x] Circular Health Gauge, failure risk %, and telemetry cards update dynamically every 2 seconds.
- [x] All 7 navigation tabs operate smoothly (Dashboard, Analytics, AI Prediction, Alerts, Maintenance, Machine Specs, Settings).

---

### Step 7: Test Hardware Ingestion API

To test sending real hardware sensor telemetry from cURL or Postman:

```bash
curl -X POST https://machina-ai-monitoring.onrender.com/api/sensors/cnc-01/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 82.5,
    "vibration": 5.8,
    "sound": 76.0,
    "current": 12.4
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Real sensor data ingested for machine 'cnc-01'",
  "is_live": true,
  "reading": {
    "temperature": 82.5,
    "vibration": 5.8,
    "sound": 76.0,
    "current": 12.4,
    "timestamp": "13:48:51",
    "is_live": true
  }
}
```

Upon receiving this payload, the dashboard status badge will instantly transition to 🟢 **LIVE DATA**. If no new payload arrives for 15 seconds, it automatically falls back to 🟡 **DEMO MODE**.

---

### Step 8: Configure ESP32 Microcontroller Firmware

Once your Render public URL is known, update the ESP32 firmware sketch (`esp32_firmware/machine_health_sensor.ino`):

1. Open `esp32_firmware/machine_health_sensor.ino` in Arduino IDE.
2. Update the `serverUrl` string constant with your actual Render URL:
   ```cpp
   // Replace with your actual Render public domain
   const char* serverUrl = "https://machina-ai-monitoring.onrender.com/api/sensors/cnc-01/ingest";
   ```
3. Upload the sketch to your ESP32 board.
