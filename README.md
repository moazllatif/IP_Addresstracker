📍 IP Address Tracker
<p align="center"> <img src="/mnt/data/e4059d8f-d40c-45fc-ab1b-9efab7a1cae1.png" width="850"> </p>

A modern, full-featured IP Address Tracking Platform with:

🔐 User Authentication (Login + Register)

📡 IP Geolocation Lookup

🌦 Weather Integration

⭐ Favorites System

🕘 Search History

✎ Custom IP Naming

🗺 Live Map (Leaflet.js)

📱 Fully Responsive UI

🌓 Light & Dark Themes

❤️ Heartbeat Tracking for devices

🚪 Logout System

This project provides a polished frontend IP tracking dashboard with animated UI, smooth UX, and persistent data storage.

🏆 Features
🔑 Authentication System

User registration

Login with LocalStorage auth

Protected tracker page

Logout screen clearing session

📡 IP Geolocation Lookup

Powered by ipapi.co (free, no key)
Fetches:
✔ IP
✔ ISP
✔ City
✔ Region
✔ Country
✔ Timezone
✔ Latitude / Longitude

🌦 Real-Time Weather

Powered by OpenWeatherMap API

Displays:
✔ Temperature
✔ Weather icon
✔ Wind speed
✔ Weather description

⭐ Favorites

Save IP addresses with one click

Remove favorites

Persistent across sessions

Fast switching between saved IPs

🕘 Search History

Stores last 50 searches

Click to load previous results

Clear history with confirmation

✎ Rename Any IP

You can assign labels:

85.238.76.171 → "VPN Server"
1.1.1.1       → "Cloudflare DNS"


Labels appear in:
✔ IP Panel
✔ Favorites
✔ Search History
✔ Replay Mode

🗺 Live Map

Leaflet.js interactive map

Smooth fly animations

Pulsing marker

Auto-center button

🌓 Theme Support

Light mode

Dark mode

Saves preference

❤️ Heartbeat System

Sends device data every 30 seconds:

POST http://localhost:5000/api/heartbeat


Includes:

deviceId

deviceName

IP

deviceType

📸 Screenshots
🔍 Search, Weather & Map
<p align="center"> <img src="/mnt/data/e4059d8f-d40c-45fc-ab1b-9efab7a1cae1.png" width="850"> </p>
🌍 Default View (Waiting for IP Data)
<p align="center"> <img src="/mnt/data/8155f0a5-0011-41a7-af83-f0ef5e848739.png" width="850"> </p>
🧩 Layout Testing / Early Build
<p align="center"> <img src="/mnt/data/02823dc6-0d01-4395-96f2-041788fbe29d.png" width="850"> </p>
🧱 Project Structure
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

⚙️ Technologies Used
Frontend

HTML5

CSS3

JavaScript (ES6+)

Leaflet.js

OpenWeatherMap API

ipapi.co API

Google Fonts — Inter

LocalStorage

Used for:

Login sessions

Registered users

Search history

Favorites

Renamed IPs

Theme selection

Backend (optional)

Heartbeat endpoint expects:

POST /api/heartbeat

🚀 Setup Instructions
1. Clone the repo
git clone <your-repo-url>

2. Open the project

You can run with Live Server or simply open:

/login/login.html

3. Create an account → login → go to tracker page
4. Start searching IPs

Try:

1.1.1.1
8.8.8.8
85.238.76.171

5. Save favorites, rename IPs, replay history, switch theme, etc.
