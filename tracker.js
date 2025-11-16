// --- Redirect to login if not logged in ---
if (localStorage.getItem('loggedIn') !== 'true') {
  // you can still use alert here because we're leaving the page immediately
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

  const historyBody = document.getElementById('history-body');
  const historyEmpty = document.getElementById('history-empty');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const favoriteCurrentBtn = document.getElementById('favorite-current-btn');

  const messageBox = document.getElementById('message');

  // --- Simple message helper ---
  function showMessage(text, type = 'info', timeout = 4000) {
    if (!messageBox) return;

    messageBox.textContent = text;

    // reset classes
    messageBox.className = 'message';
    if (type === 'success') {
      messageBox.classList.add('message--success');
    } else if (type === 'error') {
      messageBox.classList.add('message--error');
    } else {
      messageBox.classList.add('message--info');
    }

    if (timeout) {
      setTimeout(() => {
        messageBox.classList.add('message--hidden');
      }, timeout);
    }
  }

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
    // Preserve existing favorite flag if the same IP/query already exists
    const existing = history.find(
      (item) => item.ip === entry.ip || item.query === entry.query
    );
    if (existing) {
      entry.favorite = existing.favorite || false;
    } else if (typeof entry.favorite === 'undefined') {
      entry.favorite = false;
    }

    // Remove previous occurrences
    history = history.filter(
      (item) => item.ip !== entry.ip && item.query !== entry.query
    );

    // Add newest at the top
    history.unshift(entry);

    // Limit history size
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
        const starClass = item.favorite ? 'fav-btn is-fav' : 'fav-btn';
        const starSymbol = item.favorite ? '★' : '☆';

        return `
          <tr data-index="${index}">
            <td>${item.query}</td>
            <td>${item.locationText}</td>
            <td>${item.timezone}</td>
            <td>${item.isp}</td>
            <td>${dateStr}</td>
            <td>
              <button class="${starClass}" data-index="${index}" title="Toggle favorite">
                ${starSymbol}
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // --- Clicks inside the history table ---
  if (historyBody) {
    historyBody.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.fav-btn');
      if (favBtn) {
        // Toggle favorite
        const index = favBtn.dataset.index;
        const item = history[index];
        if (!item) return;

        item.favorite = !item.favorite;
        saveHistory();
        renderHistory();
        showMessage(
          item.favorite
            ? `Added ${item.query} to favorites.`
            : `Removed ${item.query} from favorites.`,
          'success'
        );
        return; // don't also trigger row click
      }

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

      showMessage(`Loaded ${item.query} from history.`, 'info');
    });
  }

  // Clear history button
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (!history.length) {
        showMessage('History is already empty.', 'info');
        return;
      }
      const ok = confirm('Clear search history?');
      if (!ok) return;
      history = [];
      saveHistory();
      renderHistory();
      showMessage('History cleared.', 'success');
    });
  }

  // --- Add current IP/domain to favorites button ---
  if (favoriteCurrentBtn) {
    favoriteCurrentBtn.addEventListener('click', () => {
      const ip = ipDisplay.textContent.trim();
      const locationText = locationDisplay.textContent.trim();
      const timezoneText = timezoneDisplay.textContent.trim();
      const ispText = ispDisplay.textContent.trim();

      if (!ip || ip === '-') {
        showMessage('No IP loaded yet to add to favorites.', 'error');
        return;
      }

      // Find existing entry for this IP
      const existing = history.find((item) => item.ip === ip);
      if (!existing) {
        showMessage(
          'This IP is not in history yet. Perform a search first.',
          'error'
        );
        return;
      }

      existing.favorite = !existing.favorite;
      saveHistory();
      renderHistory();

      showMessage(
        existing.favorite
          ? `Marked ${existing.query} as favorite.`
          : `Removed ${existing.query} from favorites.`,
        'success'
      );
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
        showMessage(
          `Error: ${data.messages || 'Invalid IP or domain'}`,
          'error'
        );
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
        timestamp: Date.now(),
        favorite: false
      };

      addToHistory(entry);
      showMessage(
        query
          ? `Loaded data for ${query}.`
          : 'Loaded data for your current IP.',
        'success'
      );
    } catch (err) {
      console.error(err);
      showMessage(
        'Failed to fetch data. Please check your API key or network.',
        'error'
      );
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
      showMessage('Please enter a valid IP address or domain.', 'error');
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
