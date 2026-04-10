# UWSD Launch Guide 🚀

To fire up the entire AI platform, you'll need to open **5 separate terminal tabs/windows** and run one piece of the system in each. 

Here is your exact launch sequence:

### Terminal 1: Real-Time Socket Server (The Core Router)
This server brokers the events from your AI directly to the frontend dashboards.
```bash
cd realtime
node server.js
```
*(You should see: `🔥 Realtime server running on http://localhost:4000`)*

### Terminal 2: The Next.js Web Dashboard
This hosts your clean React monitoring UI.
```bash
cd dashboard
npm run dev
```
*(Once it compiles, open **http://localhost:3000** in your web browser)*

### Terminal 3: The FastAPI Backend
This runs your core endpoints, database hookups, checkouts, and OCR routers. Make sure your `delhack` conda environment is active!
```bash
conda activate delhack
uvicorn app.main:app --reload
```
*(You should see: `INFO: Uvicorn running on http://127.0.0.1:8000`)*

### Terminal 4: The Mobile Expo App (Optional, but highly recommended)
**Pre-requisite:** Before running this, make sure to open `mobile/app/(tabs)/index.tsx` and replace the `YOUR_IP` string on line 6 with your Mac's actual local WiFi IP address (e.g., `192.168.1.15`). Find it using the command `ipconfig getifaddr en0`.
```bash
cd mobile
npx expo start
```
*(This will generate a QR code in your terminal. You can scan it using the "Expo Go" app on your iOS or Android phone to view live alerts dynamically!)*

### Terminal 5: The AI Vision Camera Loop
Once all the servers above are happily humming along, you'll launch the actual eye of the system:
```bash
conda activate delhack
python camera_stream.py
```

---

## 🎬 The Pitch Demo Flow

1. Have the Dashboard (**Terminal 2**, Web Browser) open on half your monitor. 
2. Have the Camera Stream (`UWSD Multi-Face Tracking` window) open on the other half.
3. Bring your registered face into the camera constraint (`GREEN` box) → Watch the dashboard instantly update!
4. Show an unregistered face / picture (`RED` box + Sosumi alert sound) → Watch the UI immediately flag an intrusion and see the Gmail integration send an alert to your inbox!
