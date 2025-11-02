// --- Redirect to login if not logged in ---
if (localStorage.getItem('loggedIn') !== 'true') {
  alert('Please login first!');
  window.location.href = 'login.html';
}

console.log("Tracker JS loaded");

// --- Wait for DOM to be ready ---
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const ipInput = document.getElementById('ip-input');
  const ipDisplay = document.getElementById('ip');
  const locationDisplay = document.getElementById('location');
  const timezoneDisplay = document.getElementById('timezone');
  const ispDisplay = document.getElementById('isp');
  const logoutBtn = document.getElementById('logout-btn');

  // --- Initialize Leaflet map ---
  const map = L.map('map').setView([20, 0], 2);
  const marker = L.marker([20, 0]).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // --- API Setup ---
  const API_KEY = 'at_5sdJ7ABtaFVcX9n0Mk8hkva46iqiZ'; // replace with your actual API key
  const API_URL = 'https://geo.ipify.org/api/v2/country,city';

  // --- Fetch IP or domain data ---
  async function fetchIPData(query = '') {
    try {
      const url = `${API_URL}?apiKey=${API_KEY}${query ? `&ipAddress=${query}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code) {
        alert(`Error: ${data.messages || 'Invalid IP or domain'}`);
        return;
      }

      const { ip, isp, location } = data;
      const { city, region, country, timezone, lat, lng } = location;

      // --- Update UI ---
      ipDisplay.textContent = ip || '-';
      locationDisplay.textContent = `${city || ''}, ${region || ''}, ${country || ''}`;
      timezoneDisplay.textContent = `UTC ${timezone || ''}`;
      ispDisplay.textContent = isp || '-';

      // --- Update map position ---
      map.setView([lat, lng], 13);
      marker.setLatLng([lat, lng]);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch data. Please check your API key or network.');
    }
  }

  // --- Load user's IP on start ---
  fetchIPData();

  // --- Handle search form submit ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = ipInput.value.trim();
    if (query) {
      fetchIPData(query);
      ipInput.value = '';
    } else {
      alert('Please enter a valid IP address or domain.');
    }
  });

  // --- Logout button ---
  logoutBtn.addEventListener('click', () => {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      localStorage.removeItem('loggedIn');
      window.location.href = 'logout.html';
    }
  });
});
