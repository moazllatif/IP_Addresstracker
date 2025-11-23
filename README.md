# 📍 IP Address Tracker

A modern, full-featured IP Tracking Dashboard with authentication, IP lookup, weather integration, map visualization, search history, favorites, and custom IP naming — all in a beautifully animated UI.

---

## 🏆 Features

### 🔐 Authentication
- Register new users  
- Login system using LocalStorage  
- Protected tracker page  
- Logout that clears session  

### 📡 IP Geolocation Lookup
- Powered by **ipapi.co (free, no key needed)**  
- Displays:
  - IP Address  
  - Country + Flag  
  - Region  
  - City  
  - Timezone  
  - ISP  
  - Lat/Lon coordinates  

### 🌦 Weather Integration
- Powered by **OpenWeatherMap**  
- Shows:
  - Temperature  
  - Weather Icon  
  - Description  
  - Wind Speed  

### ⭐ Favorites System
- Star any IP  
- Saves full IP metadata  
- Persistent across sessions  
- Click to reload favorite IP  

### 🕘 Search History
- Saves last 50 searches  
- Clickable reload  
- Clear history button  

### ✎ Rename IP Addresses
Assign custom names to any IP:
```
85.238.76.171 → VPN Server  
1.1.1.1 → Cloudflare DNS
```
Names appear in:
- IP panel  
- Favorites  
- History  
- Replay mode  

### 🗺 Live Map
- Leaflet.js map  
- Smooth fly animation  
- Pulsing marker  
- Auto-center  

### 🌓 Dark/Light Theme
- Switch themes with toggle  
- Saves preference  

### ❤️ Heartbeat System
Every 30 seconds:
```
POST http://localhost:5000/api/heartbeat
```
Sends:
- deviceId  
- deviceName  
- IP  
- deviceType  

---

## 🧱 Project Structure

```
/login
   ├── login.html
   ├── login.css
   └── login.js

/register
   ├── register.html
   ├── register.css
   └── register.js

/tracker
   ├── tracker.html
   ├── tracker.css
   └── tracker.js

/logout
   ├── logout.html
   └── logout.css
```

---

## ⚙️ Tech Stack

**Frontend**
- HTML5  
- CSS3 (Glassmorphism + animations)  
- JavaScript (ES6)  
- Leaflet.js (Map)  
- ipapi.co API (IP lookup)  
- OpenWeather API (weather)  
- Google Fonts (Inter)

**LocalStorage**
- Users  
- Login sessions  
- Search history  
- Favorites  
- IP name assignments  
- Theme mode  

**Optional Backend**
- Heartbeat endpoint (Node.js / Express compatible)

---

## 🚀 Setup Instructions

### 1️⃣ Clone the project
```bash
git clone <your-repo-url>
```

### 2️⃣ Open the Login Page
You can use a local server (recommended) or open:

```
/login/login.html
```

### 3️⃣ Create an account → Login

### 4️⃣ Use the Tracker
Try searching:

```
1.1.1.1
8.8.8.8
85.238.76.171
```

### 5️⃣ Use all features
- Rename IP  
- Add to favorites  
- Clear history  
- Switch theme  
- Replay history  
- Logout  

---

## 🎯 Environment Variables (Optional Backend)

```
WEATHER_API_KEY=your_openweather_key
BACKEND_URL=http://localhost:5000
```

---

## 🔮 Future Improvements

- Cloud sync for favorites/history  
- User accounts on backend  
- UI transitions with GSAP  
- Export / import saved IPs  
- Mobile PWA version  

---

## ❤️ Credits

A fully custom, polished UI and feature-rich dashboard created by **YOU**, with real APIs, animations, and clean UX.

