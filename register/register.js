document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('r-username').value.trim();
  const password = document.getElementById('r-password').value.trim();

  if (!username || !password) {
    return alert('Please fill in both fields');
  }

  // Load existing users
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[username]) {
    return alert('Username already exists');
  }

  // Save new user
  users[username] = { password };
  localStorage.setItem('users', JSON.stringify(users));

  alert('Registration successful! You can now login.');
  window.location.href = 'login.html';
});
