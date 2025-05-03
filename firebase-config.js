// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyCha0f3X7fcU44F3GnNluEcdvHSKV9kbcA",
  authDomain: "hiio-80577.firebaseapp.com",
  databaseURL: "https://hiio-80577-default-rtdb.firebaseio.com",
  projectId: "hiio-80577",
  storageBucket: "hiio-80577.appspot.com",
  messagingSenderId: "837168042630",
  appId: "1:837168042630:web:dd73b45a995f768d2e3707",
  measurementId: "G-QDCHPCLMQM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

export { auth, db };
