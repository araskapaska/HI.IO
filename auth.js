// auth.js
import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import { ref, set } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

document.getElementById('register').onclick = async () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    await set(ref(db, 'users/' + user.uid), {
      username: email.split('@')[0],
      gender: 'other',
      age: 18,
      successfulChats: 0,
      complaints: 0,
      banned: false
    });

    window.location.href = 'chat.html';
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
};

document.getElementById('login').onclick = async () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    window.location.href = 'chat.html';
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
};
