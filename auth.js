// auth.js
import { db } from './firebase-config.js';
import {
  ref,
  get,
  set,
  child
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

document.getElementById('register-btn').onclick = async () => {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const age = parseInt(document.getElementById('reg-age').value);
  const gender = document.getElementById('reg-gender').value;

  if (!username || !password || isNaN(age) || age < 13 || age > 120) return alert('Неверные данные');

  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  const users = snapshot.val() || {};

  for (const uid in users) {
    if (users[uid].username === username) return alert('Имя занято');
  }

  const uid = crypto.randomUUID();
  await set(child(usersRef, uid), {
    username,
    password,
    age,
    gender,
    successfulChats: 0,
    complaints: 0,
    banned: false
  });
  localStorage.setItem('hiio-user', JSON.stringify({ uid, password }));
  window.location.href = 'chat.html';
};

document.getElementById('login-btn').onclick = async () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  const users = snapshot.val() || {};

  for (const uid in users) {
    const user = users[uid];
    if (user.username === username && user.password === password) {
      if (user.banned) return alert('Вы забанены');
      localStorage.setItem('hiio-user', JSON.stringify({ uid, password }));
      return (window.location.href = 'chat.html');
    }
  }
  alert('Неверный логин или пароль');
};
