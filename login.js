// Wrap everything in DOMContentLoaded to ensure elements exist
document.addEventListener('DOMContentLoaded', () => {

  // Prepopulate admin user for first-time use
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
      return alert('Please enter both username and password.');
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[username] && users[username].password === password) {
      // Successful login
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('loggedUser', username);

      // Redirect to tracker page
      window.location.href = 'tracker.html';
    } else {
      alert('Invalid username or password.');
    }
  });
});
