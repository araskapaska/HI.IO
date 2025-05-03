import { db } from './firebase-config.js';
import { ref, get, set, push } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

// Обработчик регистрации
document.getElementById('register-btn').addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const age = document.getElementById('reg-age').value;
  const gender = document.getElementById('reg-gender').value;

  if (!username || !password || !age || !gender) {
    alert("Пожалуйста, заполните все поля.");
    return;
  }

  const usersRef = ref(db, 'users');
  const newUserRef = push(usersRef);
  await set(newUserRef, {
    username: username,
    password: password,
    age: age,
    gender: gender,
    successfulChats: 0,
    complaints: 0,
    banned: false
  });

  alert("Регистрация успешна!");
  // После регистрации, например, автоматически вход
  window.location.href = 'chat.html';
});
