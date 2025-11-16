document.addEventListener('DOMContentLoaded', () => {

  // Create message container
  const msgContainer = document.createElement('div');
  msgContainer.id = 'msg-container';
  msgContainer.style.position = 'fixed';
  msgContainer.style.top = '20px';
  msgContainer.style.right = '20px';
  msgContainer.style.zIndex = 9999;
  document.body.appendChild(msgContainer);

  function showMessage(text, type = 'info') {
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.background = type === 'error' ? '#ff4d4f' : '#00b4d8';
    msg.style.color = '#fff';
    msg.style.padding = '10px 16px';
    msg.style.marginTop = '8px';
    msg.style.borderRadius = '6px';
    msg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    msg.style.fontWeight = '500';
    msg.style.transition = 'all 0.3s ease';
    msgContainer.appendChild(msg);
    setTimeout(() => {
      msg.style.opacity = '0';
      msg.style.transform = 'translateX(20px)';
      setTimeout(() => msg.remove(), 300);
    }, 3000);
  }

  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify({ admin: { password: 'password' } }));
  }

  const form = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      return showMessage('Please enter both username and password.', 'error');
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[username] && users[username].password === password) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('loggedUser', username);
      window.location.href = 'tracker.html';
    } else {
      showMessage('Invalid username or password.', 'error');
    }
  });
});
