import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

document.getElementById("register").onclick = async () => {
  const email = emailEl().value;
  const password = passEl().value;
  const { uid } = await createUserWithEmailAndPassword(auth, email, password).then(res => res.user);
  await set(ref(db, "users/" + uid), {
    username: email.split('@')[0],
    gender: "other",
    age: 18,
    successfulChats: 0,
    complaints: 0,
    banned: false
  });
  window.location.href = "chat.html";
};

document.getElementById("login").onclick = async () => {
  await signInWithEmailAndPassword(auth, emailEl().value, passEl().value);
  window.location.href = "chat.html";
};

const emailEl = () => document.getElementById("email");
const passEl = () => document.getElementById("password");
