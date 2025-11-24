// tracker.js - IP tracker + heartbeat with immediate public IP detection
document.addEventListener('DOMContentLoaded', () => {

  // ---------- MESSAGE SYSTEM ----------
  const msgContainer = document.createElement('div');
  msgContainer.id = 'msg-container';
  msgContainer.style.position = 'fixed';
  msgContainer.style.top = '20px';
  msgContainer.style.right = '20px';
  msgContainer.style.zIndex = 9999;
  document.body.appendChild(msgContainer);

  function showMessage(text, type='info') {
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.background = type==='error' ? '#ff4d4f' : '#00b4d8';
    msg.style.color = '#fff';
    msg.style.padding = '10px 16px';
    msg.style.marginTop = '8px';
    msg.style.borderRadius = '6px';
    msg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    msg.style.fontWeight = '500';
    msg.style.transition = 'all 0.3s ease';
    msgContainer.appendChild(msg);
    setTimeout(() => {
      msg.style.opacity='0';
      msg.style.transform='translateX(20px)';
      setTimeout(()=>msg.remove(),300);
    }, 3000);
  }

  const IP_API_KEY = 'at_gAHU1anZtCFmfDZNTh456qQ3cBa22';
  const IP_API_URL = 'https://geo.ipify.org/api/v2/country,city';
  const WEATHER_API_KEY = 'ff2a59cfddbd50729a132539ee246f42';
  const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';

  const form = document.getElementById('search-form');
  const ipInput = document.getElementById('ip-input');
  const ipDisplay = document.getElementById('ip');
  const locationDisplay = document.getElementById('location');
  const timezoneDisplay = document.getElementById('timezone');
  const ispDisplay = document.getElementById('isp');
  const flagImg = document.getElementById('flag');

  const weatherPanel = document.getElementById('weather');
  const weatherSkel = document.getElementById('weather-skel');
  const weatherDesc = document.getElementById('weather-desc');
  const tempDisplay = document.getElementById('temp');
  const weatherIcon = document.getElementById('weather-icon');
  const windDisplay = document.getElementById('wind');

  const historyPanel = document.getElementById('history-panel');
  const historyList = document.getElementById('history-list');
  const historyToggle = document.getElementById('history-toggle');
  const clearHistoryBtn = document.getElementById('clear-history');

  const centerBtn = document.getElementById('center-btn');
  const replayBtn = document.getElementById('replay-btn');
  const logoutBtn = document.getElementById('logout-btn');

  const renameIpBtn = document.getElementById("rename-ip-btn");
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');



  // ---------- RENAME BUTTON POPUP ----------
renameIpBtn?.addEventListener("click", () => {
  const rawIP = extractRawIP(ipDisplay.textContent);
  if (!rawIP || rawIP === "Loading…" || rawIP === "—") return;

  const currentName = getIPName(rawIP);

  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "#132029";
  popup.style.padding = "20px 25px";
  popup.style.borderRadius = "12px";
  popup.style.color = "white";
  popup.style.zIndex = 99999;
  popup.style.textAlign = "center";

  popup.innerHTML = `
      <div style="margin-bottom:12px;font-weight:600;">Rename IP Address</div>
      <input id="rename-ip-input"
             value="${currentName}"
             style="padding:8px;width:220px;border-radius:6px;border:none;margin-bottom:12px;background:#0d1a22;color:white;">
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="rename-save" style="padding:6px 14px;background:#00b4d8;border:none;border-radius:6px;color:white;">Save</button>
        <button id="rename-cancel" style="padding:6px 14px;background:#e74c3c;border:none;border-radius:6px;color:white;">Cancel</button>
      </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("rename-save").addEventListener("click", () => {
    const newName = document.getElementById("rename-ip-input").value.trim();
    const names = loadIPNames();
    names[rawIP] = newName;
    saveIPNames(names);
    ipDisplay.textContent = formatIP(rawIP);
    renderHistory?.();
    renderFavorites?.();
    popup.remove();
    showMessage("IP renamed!");
  });

  document.getElementById("rename-cancel").addEventListener("click", () => popup.remove());
});






  // ---------- AUTH CHECK ----------
  const loggedUser = localStorage.getItem('loggedUser');
  if (!loggedUser || localStorage.getItem('loggedIn') !== 'true') {
    showMessage('Please login first!', 'error');
    setTimeout(() => window.location.href = '../login/login.html', 1500);
    return;
  }

  // ---------- THEME ----------
  function applyTheme(themeName) {
    if (themeName === 'light') {
      document.documentElement.classList.add('light');
      themeIcon.textContent = '☀️';
    } else {
      document.documentElement.classList.remove('light');
      themeIcon.textContent = '🌙';
    }
    localStorage.setItem('theme', themeName);
  }
  applyTheme(localStorage.getItem('theme') || 'dark');
  themeToggle.addEventListener('click', () => {
    applyTheme(document.documentElement.classList.contains('light') ? 'dark' : 'light');
  });

  // ---------- MAP ----------
  const map = L.map('map', { zoomControl: true }).setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  function createPulseIcon() {
    const html = `<div class="pulse"><div class="dot"></div></div>`;
    return L.divIcon({ className: 'pulse', html, iconSize: [32,32], iconAnchor:[16,16] });
  }
  let marker = L.marker([20,0], { icon: createPulseIcon() }).addTo(map);

  // ---------- UTIL ----------
  function setLoadingUI(isLoading = true) {
    if (isLoading) {
      ipDisplay.textContent = 'Loading…';
      locationDisplay.textContent = 'Loading…';
      timezoneDisplay.textContent = 'Loading…';
      ispDisplay.textContent = 'Loading…';
      weatherSkel.style.display = '';
      weatherPanel.style.display = 'none';
    } else {
      weatherSkel.style.display = 'none';
      weatherPanel.style.display = '';
    }
  }

  function showError(msg) { showMessage(msg, 'error'); }


  // ---------- RENAME IP SYSTEM ----------
  function loadIPNames() {
    return JSON.parse(localStorage.getItem("ipNames") || "{}");
  }

  function saveIPNames(obj) {
    localStorage.setItem("ipNames", JSON.stringify(obj));
  }

  function getIPName(ip) {
    const names = loadIPNames();
    return names[ip] || "";
  }

  function formatIP(ip) {
    const name = getIPName(ip);
    return name ? `${ip} (${name})` : ip;
  }

  function extractRawIP(displayText) {
    if (!displayText) return "";
    return displayText.split(" ")[0]; 
  }



  // ---------- HISTORY ----------
  function loadHistory() { return JSON.parse(localStorage.getItem('ipHistory') || '[]'); }
  function saveHistory(arr) { localStorage.setItem('ipHistory', JSON.stringify(arr)); }
  function addToHistory(item) {
    const arr = loadHistory();
    if (arr.length && arr[arr.length-1].ip === item.ip) arr[arr.length-1] = item;
    else arr.push(item);
    if (arr.length > 50) arr.splice(0, arr.length-50);
    saveHistory(arr);
    renderHistory();
  }

  function renderHistory() {
    const arr = loadHistory();
    historyList.innerHTML = '';
    if (!arr.length) {
      historyList.innerHTML = '<li class="meta">No history yet — search an IP to populate it.</li>';
      return;
    }
    arr.slice().reverse().forEach(h => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.innerHTML = `<div><div style="font-weight:700;">${h.ip}</div><div class="meta">${h.city ? h.city+', ' : ''}${h.region ? h.region+', ' : ''}${h.country||''} • ${h.isp||''}</div></div><div style="text-align:right;"><div class="meta">${new Date(h.ts).toLocaleString()}</div></div>`;
      li.addEventListener('click', () => fetchIPData(h.ip));
      historyList.appendChild(li);
    });
  }
  renderHistory();

  historyToggle.addEventListener('click', () => {
    if (historyPanel.style.display === 'none' || getComputedStyle(historyPanel).display === 'none') {
      historyPanel.style.display = 'flex';
      historyToggle.textContent = 'History ▾';
    } else {
      historyPanel.style.display = 'none';
      historyToggle.textContent = 'History ▸';
    }
  });

  clearHistoryBtn?.addEventListener('click', () => {
  // Create confirmation popup
  const confirmClear = document.createElement('div');
  confirmClear.style.position = 'fixed';
  confirmClear.style.top = '50%';
  confirmClear.style.left = '50%';
  confirmClear.style.transform = 'translate(-50%,-50%)';
  confirmClear.style.background = '#132029';
  confirmClear.style.color = '#fff';
  confirmClear.style.padding = '20px 25px';
  confirmClear.style.borderRadius = '12px';
  confirmClear.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
  confirmClear.style.zIndex = 10000;
  confirmClear.style.textAlign = 'center';
  confirmClear.innerHTML = `
    <div style="margin-bottom:12px;font-weight:600;">Clear all saved history?</div>
    <div style="display:flex;gap:12px;justify-content:center;">
      <button id="clear-yes" style="padding:6px 14px;border:none;border-radius:6px;background:#00b4d8;color:#fff;font-weight:500;cursor:pointer;">Yes</button>
      <button id="clear-no" style="padding:6px 14px;border:none;border-radius:6px;background:#ff4d4f;color:#fff;font-weight:500;cursor:pointer;">No</button>
    </div>
  `;
  document.body.appendChild(confirmClear);

  document.getElementById('clear-yes').addEventListener('click', () => {
    localStorage.removeItem('ipHistory');
    renderHistory();
    confirmClear.remove();
    showMessage('History cleared successfully.', 'success');
  });

  document.getElementById('clear-no').addEventListener('click', () => {
    confirmClear.remove();
  });
});


  // ---------- WEATHER ----------
  async function fetchWeather(lat, lon) {
    if (!WEATHER_API_KEY) { weatherSkel.style.display = 'none'; weatherPanel.style.display = 'none'; return null; }
    try {
      const url = `${WEATHER_BASE}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
      const res = await fetch(url); if (!res.ok) throw new Error('Weather API error');
      const w = await res.json();
      const icon = w.weather?.[0]?.icon;
      weatherIcon.src = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';
      tempDisplay.textContent = `${Math.round(w.main.temp)}°C`;
      weatherDesc.textContent = w.weather?.[0]?.description?.replace(/\b\w/g,c=>c.toUpperCase())||'—';
      windDisplay.textContent = `Wind: ${Math.round(w.wind.speed)} m/s`;
      weatherSkel.style.display = 'none';
      weatherPanel.style.display = '';
      return w;
    } catch(err){ console.error(err); weatherSkel.textContent='Weather unavailable'; return null; }
  }

  // ---------- FLAG ----------
  function setFlag(countryCode) {
    if (!countryCode) { flagImg.src=''; flagImg.classList.add('hidden'); return; }
    flagImg.src = `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
    flagImg.alt = countryCode;
    flagImg.classList.remove('hidden');
  }

  // ---------- FETCH IP DATA ----------
  async function fetchIPData(query='') {
    setLoadingUI(true);
    try {
      const url = `${IP_API_URL}?apiKey=${IP_API_KEY}${query ? `&ipAddress=${encodeURIComponent(query)}` : ''}`;
      const res = await fetch(url); const data = await res.json();
      if (data?.code) { showError('Invalid IP or domain'); setLoadingUI(false); return; }

      const { ip, isp, location } = data;
      const { city, region, country, timezone, lat, lng } = location || {};

      ipDisplay.textContent = formatIP(ip || '-');
      locationDisplay.textContent = `${city||''}${city&&region?', ':''}${region||''}${(city||region)&&country?', ':''}${country||''}`;
      timezoneDisplay.textContent = timezone ? `UTC ${timezone}` : '-';
      ispDisplay.textContent = isp || '-';

      setFlag(country);

      if (lat && lng) { map.flyTo([lat,lng],13,{duration:1.2}); marker.setLatLng([lat,lng]); }
      await fetchWeather(lat,lng);

      addToHistory({ ip:ip||query||'', city, region, country, isp, lat, lng, ts:Date.now() });
      setLoadingUI(false);
    } catch(err){ console.error(err); showError('Failed to fetch data.'); setLoadingUI(false); }
  }

  // ---------- INITIAL PUBLIC IP FETCH ----------
  async function fetchInitialIP() {
    try {
      const url = `${IP_API_URL}?apiKey=${IP_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.ip) {
        ipDisplay.textContent = data.ip;
        fetchIPData(data.ip);
      }
    } catch(err){ console.warn('Could not fetch initial IP:', err); }
  }

  fetchInitialIP();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = ipInput.value.trim(); 
    if(!q){ showMessage('Please enter a valid IP or domain.', 'error'); return; }
    fetchIPData(q); ipInput.value='';
  });

  centerBtn.addEventListener('click', ()=>{ const pos=marker.getLatLng(); if(pos) map.flyTo(pos,Math.max(map.getZoom(),8),{duration:0.9}); });

  replayBtn.addEventListener('click', async () => {
  const arr = loadHistory();
  if(!arr.length){
    showMessage('No history to replay.', 'error');
    return;
  }

  // Create confirmation popup
  const confirmReplay = document.createElement('div');
  confirmReplay.style.position = 'fixed';
  confirmReplay.style.top = '50%';
  confirmReplay.style.left = '50%';
  confirmReplay.style.transform = 'translate(-50%,-50%)';
  confirmReplay.style.background = '#132029';
  confirmReplay.style.color = '#fff';
  confirmReplay.style.padding = '20px 25px';
  confirmReplay.style.borderRadius = '12px';
  confirmReplay.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
  confirmReplay.style.zIndex = 10000;
  confirmReplay.style.textAlign = 'center';
  confirmReplay.innerHTML = `
    <div style="margin-bottom:12px;font-weight:600;">Replay history animation?</div>
    <div style="display:flex;gap:12px;justify-content:center;">
      <button id="replay-yes" style="padding:6px 14px;border:none;border-radius:6px;background:#00b4d8;color:#fff;font-weight:500;cursor:pointer;">Yes</button>
      <button id="replay-no" style="padding:6px 14px;border:none;border-radius:6px;background:#ff4d4f;color:#fff;font-weight:500;cursor:pointer;">No</button>
    </div>
  `;
  document.body.appendChild(confirmReplay);

  document.getElementById('replay-yes').addEventListener('click', async () => {
    confirmReplay.remove();
    const play = arr.slice(-8);
    for(const h of play){
      if(!h.lat||!h.lng) continue;
      map.flyTo([h.lat,h.lng],6,{duration:1.0}); 
      marker.setLatLng([h.lat,h.lng]);
      ipDisplay.textContent=h.ip;
      locationDisplay.textContent=`${h.city||''}${h.city&&h.region?', ':''}${h.region||''}${h.country?', '+h.country:''}`;
      ispDisplay.textContent=h.isp;
      setFlag(h.country);
      if(h.lat&&h.lng) fetchWeather(h.lat,h.lng);
      await new Promise(r=>setTimeout(r,1400));
    }
  });

  document.getElementById('replay-no').addEventListener('click', () => {
    confirmReplay.remove();
  });
});


  logoutBtn.addEventListener('click', () => {
  const confirmLogout = document.createElement('div');
  confirmLogout.style.position = 'fixed';
  confirmLogout.style.top = '50%';
  confirmLogout.style.left = '50%';
  confirmLogout.style.transform = 'translate(-50%,-50%)';
  confirmLogout.style.background = '#132029';
  confirmLogout.style.color = '#fff';
  confirmLogout.style.padding = '20px 25px';
  confirmLogout.style.borderRadius = '12px';
  confirmLogout.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
  confirmLogout.style.zIndex = 10000;
  confirmLogout.style.textAlign = 'center';
  confirmLogout.innerHTML = `
    <div style="margin-bottom:12px;font-weight:600;">Are you sure you want to log out?</div>
    <div style="display:flex;gap:12px;justify-content:center;">
      <button id="logout-yes" style="padding:6px 14px;border:none;border-radius:6px;background:#00b4d8;color:#fff;font-weight:500;cursor:pointer;">Yes</button>
      <button id="logout-no" style="padding:6px 14px;border:none;border-radius:6px;background:#ff4d4f;color:#fff;font-weight:500;cursor:pointer;">No</button>
    </div>
  `;
  document.body.appendChild(confirmLogout);

  document.getElementById('logout-yes').addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loggedUser');
    window.location.href = '../logout/logout.html';
  });

  document.getElementById('logout-no').addEventListener('click', () => {
    confirmLogout.remove();
  });
});


  if(window.innerWidth<1100) historyPanel.style.display='none';
    // ---------- FAVORITES SYSTEM ----------
  const favoriteStar = document.getElementById('favorite-star');
  const favoritesPanel = document.getElementById('favorites-panel');
  const favoritesList = document.getElementById('favorites-list');
  const favoritesToggle = document.getElementById('favorites-toggle');

  function loadFavorites() { 
    return JSON.parse(localStorage.getItem('ipFavorites') || '[]'); 
  }
  function saveFavorites(arr) { 
    localStorage.setItem('ipFavorites', JSON.stringify(arr)); 
  }

  function isFavorite(ip) { 
    return loadFavorites().some(f => f.ip === ip); 
  }

  function toggleFavorite(ipObj) {
    if (!ipObj || !ipObj.ip) return;
    let arr = loadFavorites();
    const existsIndex = arr.findIndex(f => f.ip === ipObj.ip);
    if (existsIndex > -1) arr.splice(existsIndex, 1); // remove
    else arr.push(ipObj); // add full object
    saveFavorites(arr);
    updateFavoriteStar(ipObj.ip);
    renderFavorites();
  }

  function updateFavoriteStar(ip) {
    if (!ip) return;
    favoriteStar.textContent = isFavorite(ip) ? '★' : '☆';
  }

  function renderFavorites() {
    let arr = loadFavorites();
    // remove invalid entries
    arr = arr.filter(f => f && f.ip);
    saveFavorites(arr); // optional: remove bad entries from storage
    favoritesList.innerHTML = '';
    
    if (!arr.length) {
      favoritesList.innerHTML = '<li class="meta">No favorites yet.</li>';
      return;
    }
    
    arr.forEach(fav => {
      const li = document.createElement('li');
      li.className = 'favorites-item';
      li.innerHTML = `
        <div class="fav-top">
          <img src="${fav.country ? `https://flagcdn.com/w20/${fav.country.toLowerCase()}.png` : ''}" class="fav-flag" />
          <div class="fav-ip">${fav.ip}</div>
          <span class="remove-fav" title="Remove from favorites">★</span>
        </div>
        <div class="fav-location">${fav.city ? fav.city+', ' : ''}${fav.region ? fav.region+', ' : ''}${fav.country || ''}</div>
        <div class="fav-isp">${fav.isp || ''}</div>
        <div class="fav-meta">Added: ${fav.ts ? new Date(fav.ts).toLocaleDateString() : 'Unknown'}</div>
      `;
      li.querySelector('.remove-fav').addEventListener('click', e => {
        e.stopPropagation();
        toggleFavorite(fav);
      });
      li.addEventListener('click', () => fetchIPData(fav.ip));
      favoritesList.appendChild(li);
    });
  }


  // toggle favorites panel with animation
  favoritesToggle?.addEventListener('click', () => {
    if (favoritesPanel.style.display === 'none' || getComputedStyle(favoritesPanel).display === 'none') {
      favoritesPanel.style.display = 'flex';
      setTimeout(()=>favoritesPanel.classList.add('open'),50);
      favoritesToggle.textContent = 'Favorites ▾';
    } else {
      favoritesPanel.classList.remove('open');
      setTimeout(()=>favoritesPanel.style.display='none',350);
      favoritesToggle.textContent = 'Favorites ▸';
    }
  });

  // toggle favorite star
  favoriteStar?.addEventListener('click', () => {
    const ip = ipDisplay.textContent;
    if (!ip || ip === 'Loading…') return;
    
    const current = {
      ip,
      city: locationDisplay.textContent.split(' • ')[0] || '',
      region: '', // optional
      country: '', // optional
      isp: ispDisplay.textContent || '',
      ts: Date.now()
    };
    toggleFavorite(current);
  });

  // call renderFavorites on page load
  renderFavorites();




  // ---------- HEARTBEAT ----------
  async function sendHeartbeat() {
    try {
      await fetch('http://localhost:5000/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: loggedUser,
          ip: ipDisplay.textContent || '',
          deviceType: 'browser'
        })
      });
    } catch(err) { console.error('Heartbeat failed', err); }
  }
  sendHeartbeat(); // initial heartbeat
  setInterval(sendHeartbeat, 30000); // every 30s
});







// ---------- RENAME IP SYSTEM ----------
function loadIPNames() {
  return JSON.parse(localStorage.getItem("ipNames") || "{}");
}

function saveIPNames(obj) {
  localStorage.setItem("ipNames", JSON.stringify(obj));
}

function getIPName(ip) {
  const names = loadIPNames();
  return names[ip] || "";
}

function formatIP(ip) {
  const name = getIPName(ip);
  return name ? `${ip} (${name})` : ip;
}

function extractRawIP(displayText) {
  if (!displayText) return "";
  return displayText.split(" ")[0]; 
}
