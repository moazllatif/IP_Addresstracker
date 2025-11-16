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

  // History DOM elements
  const historyBody = document.getElementById('history-body');
  const historyEmpty = document.getElementById('history-empty');
  const clearHistoryBtn = document.getElementById('clear-history-btn');

  // --- Initialize Leaflet map ---
  const map = L.map('map').setView([20, 0], 2);
  const marker = L.marker([20, 0]).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // --- API Setup ---
  const API_KEY = 'at_5sdJ7ABtaFVcX9n0Mk8hkva46iqiZ'; // replace with your actual API key
  const API_URL = 'https://geo.ipify.org/api/v2/country,city';

  // --- History data ---
  let history = [];

  function loadHistory() {
    try {
      history = JSON.parse(localStorage.getItem('ipHistory') || '[]');
      if (!Array.isArray(history)) history = [];
    } catch (e) {
      history = [];
    }
    renderHistory();
  }

  function saveHistory() {
    localStorage.setItem('ipHistory', JSON.stringify(history));
  }

  function addToHistory(entry) {
    // Remove any existing entry with the same IP or query to avoid big duplicates
    history = history.filter(
      (item) => item.ip !== entry.ip && item.query !== entry.query
    );

    // Add newest at the top
    history.unshift(entry);

    // Optional: limit history size
    if (history.length > 20) {
      history = history.slice(0, 20);
    }

    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (!historyBody) return;

    if (!history.length) {
      historyBody.innerHTML = '';
      if (historyEmpty) historyEmpty.style.display = 'block';
      return;
    }

    if (historyEmpty) historyEmpty.style.display = 'none';

    historyBody.innerHTML = history
      .map((item, index) => {
        const dateStr = new Date(item.timestamp).toLocaleString();
        return `
          <tr data-index="${index}">
            <td>${item.query}</td>
            <td>${item.locationText}</td>
            <td>${item.timezone}</td>
            <td>${item.isp}</td>
            <td>${dateStr}</td>
          </tr>
        `;
      })
      .join('');
  }

  // Click on a history row to focus that IP on the map and in the info box
  if (historyBody) {
    historyBody.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      if (!row) return;
      const index = row.dataset.index;
      const item = history[index];
      if (!item) return;

      ipDisplay.textContent = item.ip || '-';
      locationDisplay.textContent = item.locationText || '-';
      timezoneDisplay.textContent = item.timezone || '-';
      ispDisplay.textContent = item.isp || '-';

      if (typeof item.lat === 'number' && typeof item.lng === 'number') {
        map.setView([item.lat, item.lng], 13);
        marker.setLatLng([item.lat, item.lng]);
      }
    });
  }

  // Clear history button
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      const ok = confirm('Clear search history?');
      if (!ok) return;
      history = [];
      saveHistory();
      renderHistory();
    });
  }

  // --- Fetch IP or domain data ---
  async function fetchIPData(query = '') {
    try {
      const url = `${API_URL}?apiKey=${API_KEY}${
        query ? `&ipAddress=${encodeURIComponent(query)}` : ''
      }`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.code) {
        alert(`Error: ${data.messages || 'Invalid IP or domain'}`);
        return;
      }

      const { ip, isp, location } = data;
      const { city, region, country, timezone, lat, lng } = location;

      const locationText = `${city || ''}${city && region ? ', ' : ''}${
        region || ''
      }${(city || region) && country ? ', ' : ''}${country || ''}`;

      // --- Update UI ---
      ipDisplay.textContent = ip || '-';
      locationDisplay.textContent = locationText || '-';
      timezoneDisplay.textContent = `UTC ${timezone || ''}`;
      ispDisplay.textContent = isp || '-';

      // --- Update map position ---
      map.setView([lat, lng], 13);
      marker.setLatLng([lat, lng]);

      // --- Update history ---
      const entry = {
        query: query || ip || 'My IP',
        ip: ip || query,
        locationText: locationText || '-',
        timezone: `UTC ${timezone || ''}`,
        isp: isp || '-',
        lat,
        lng,
        timestamp: Date.now()
      };

      addToHistory(entry);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch data. Please check your API key or network.');
    }
  }

  // --- Load history from previous sessions ---
  loadHistory();

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
