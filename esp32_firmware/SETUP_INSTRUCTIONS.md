# ESP32 Hardware Setup Instructions

This guide is written for anyone with **no programming experience**. Follow these step-by-step instructions to upload the firmware code to an ESP32 microcontroller and connect your physical sensors.

---

## 📋 Required Software & Libraries

1. **Arduino IDE**: Download and install the free [Arduino IDE](https://www.arduino.cc/en/software).
2. **ArduinoJson Library**:
   - Open Arduino IDE.
   - Go to menu: **Tools** ➔ **Manage Libraries...** (or press `Ctrl + Shift + I`).
   - In the search bar at the top, type `ArduinoJson`.
   - Find **ArduinoJson by Benoit Blanchon** and click **Install**.

---

## ⚡ Step-by-Step Setup Guide

### Step 1: Install ESP32 Board Support in Arduino IDE
1. Open Arduino IDE.
2. Go to **File** ➔ **Preferences**.
3. In the field labeled **Additional Boards Manager URLs**, paste this link:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
4. Click **OK**.
5. Go to **Tools** ➔ **Board** ➔ **Boards Manager...**.
6. Search for `esp32` by Expressif Systems and click **Install**.

### Step 2: Open the Firmware File
1. Double-click to open `esp32_firmware/machine_health_sensor.ino` in Arduino IDE.

### Step 3: Edit Your Wi-Fi & Server Information
Look at lines 20–22 at the top of the file:

```cpp
const char* WIFI_SSID     = "YOUR_WIFI_NAME_HERE";       // Replace with your 2.4GHz Wi-Fi Name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD_HERE";   // Replace with your Wi-Fi Password
const char* SERVER_URL    = "http://192.168.1.100:8000/api/sensors/cnc-01/ingest"; 
```

1. Replace `"YOUR_WIFI_NAME_HERE"` with your Wi-Fi router name (keep the quotation marks!).
2. Replace `"YOUR_WIFI_PASSWORD_HERE"` with your Wi-Fi password.
3. Replace `192.168.1.100` with the local IP address of the computer running your python server.

### Step 4: Connect ESP32 via USB
1. Plug your ESP32 board into your computer using a USB data cable.
2. In Arduino IDE, go to **Tools** ➔ **Board** ➔ **ESP32 Arduino** ➔ Select **ESP32 Dev Module**.
3. Go to **Tools** ➔ **Port** ➔ Select the `COM` port assigned to your ESP32 (e.g. `COM3` or `COM4`).

### Step 5: Upload Code to ESP32
1. Click the **Upload** arrow button in the top-left corner of Arduino IDE (or press `Ctrl + U`).
2. Wait for compilation to complete.
3. *(If you see "Connecting......" in the bottom log, press and hold the **BOOT** button on your ESP32 board for 2 seconds until uploading starts).*

### Step 6: Verify Telemetry Connection
1. Open the **Serial Monitor** in Arduino IDE by clicking the magnifying glass icon in the top right corner (or press `Ctrl + Shift + M`).
2. Set the baud speed in the bottom right of the Serial Monitor window to **115200 baud**.
3. You will see text output:
   - `✅ Wi-Fi Connected Successfully!`
   - `🚀 Transmitting JSON Payload to Server: {"temperature":62.4, ...}`
   - `✅ Server Response Code: 200`
4. Look at your Web Dashboard header at `http://127.0.0.1:8000`: the badge will automatically switch from 🟡 **DEMO MODE** to 🟢 **LIVE DATA**!

---

## 🛠️ Hardware Wiring Reference

| Sensor Type | Sensor Module Model | ESP32 Pin Assignment | Pin Function |
| :--- | :--- | :--- | :--- |
| **Temperature** | DHT22 / DS18B20 | GPIO 4 | Data Signal Pin (with 10k resistor) |
| **Vibration** | SW-420 Motion Module | GPIO 34 | Digital Signal Pin |
| **Sound Level** | Analog Sound Sensor | GPIO 35 | Analog Input Pin (ADC1) |
| **Current** | ACS712 (5A / 20A) | GPIO 32 | Analog Input Pin (ADC1) |

---

## ❓ Troubleshooting Guide

1. **Error: "A fatal error occurred: Failed to connect to ESP32"**:
   - **Fix**: When you see `Connecting........` in the bottom output log during upload, press and hold the physical **BOOT** button on your ESP32 board for 2 seconds, then release it.
2. **Serial Monitor shows "Wi-Fi Connection Failed"**:
   - **Fix**: Double check that your Wi-Fi network is **2.4 GHz** (ESP32 does not support 5 GHz Wi-Fi) and check for typos in `WIFI_SSID` or `WIFI_PASSWORD`.
3. **Server Response Code is -1 or Connection Refused**:
   - **Fix**: Make sure your computer running the FastAPI server (`python backend/run.py`) is connected to the *same Wi-Fi network* as the ESP32, and ensure Windows Firewall is allowing port `8000`.
