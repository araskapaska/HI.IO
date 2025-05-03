// chat.js
import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  ref,
  get,
  set,
  push,
  update,
  onValue,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

let currentUser;
let currentChatId = null;
let chatStartTime = null;

onAuthStateChanged(auth, async user => {
  if (!user) return (window.location.href = 'index.html');
  currentUser = user;

  const snapshot = await get(ref(db, 'users/' + user.uid));
  const data = snapshot.val();
  if (data.banned) {
    alert('Вы забанены');
    return signOut(auth);
  }
  document.getElementById('user-info').innerText = `Вы: ${data.username}`;
});

document.getElementById('logout').onclick = () => {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
};

document.getElementById('toggle-theme').onclick = () => {
  document.body.classList.toggle('dark');
};

document.getElementById('start-search').onclick = async () => {
  const myGender = document.getElementById('gender').value;
  const myAge = parseInt(document.getElementById('age').value);
  const targetGender = document.getElementById('search-gender').value;
  const targetAge = parseInt(document.getElementById('search-age').value);

  const usersSnap = await get(ref(db, 'users'));
  const users = usersSnap.val();

  for (const uid in users) {
    const user = users[uid];
    if (
      uid !== currentUser.uid &&
      user.gender === targetGender &&
      user.age <= targetAge &&
      !user.banned
    ) {
      // создаем чат
      const chatRef = push(ref(db, 'chats'));
      await set(chatRef, {
        users: { 0: currentUser.uid, 1: uid },
        createdAt: Date.now()
      });
      currentChatId = chatRef.key;
      chatStartTime = Date.now();
      listenToMessages();
      return;
    }
  }
  alert('Нет подходящих собеседников');
};

function listenToMessages() {
  onValue(ref(db, `chats/${currentChatId}/messages`), snapshot => {
    const messages = snapshot.val();
    const chatBox = document.getElementById('chat-window');
    chatBox.innerHTML = '';
    for (const msgId in messages) {
      const msg = messages[msgId];
      const div = document.createElement('div');
      div.textContent = msg.text;
      chatBox.appendChild(div);
    }
  });
}

document.getElementById('send').onclick = async () => {
  if (!currentChatId) return;
  const text = document.getElementById('message').value;
  if (!text.trim()) return;
  await push(ref(db, `chats/${currentChatId}/messages`), {
    sender: currentUser.uid,
    text: text,
    timestamp: Date.now()
  });
  document.getElementById('message').value = '';
};

document.getElementById('end').onclick = async () => {
  if (!currentChatId) return;
  const duration = (Date.now() - chatStartTime) / 60000;
  if (duration >= 3) {
    // успешный чат
    const chatSnap = await get(ref(db, `chats/${currentChatId}/users`));
    const [uid1, uid2] = [chatSnap.val()[0], chatSnap.val()[1]];
    const other = uid1 === currentUser.uid ? uid2 : uid1;
    const ref1 = ref(db, `users/${currentUser.uid}/successfulChats`);
    const ref2 = ref(db, `users/${other}/successfulChats`);

    update(ref1, { '.sv': 'increment' });
    update(ref2, { '.sv': 'increment' });
  }
  currentChatId = null;
  alert('Чат завершен');
};

document.getElementById('report').onclick = async () => {
  if (!currentChatId) return;
  const chatSnap = await get(ref(db, `chats/${currentChatId}/users`));
  const [uid1, uid2] = [chatSnap.val()[0], chatSnap.val()[1]];
  const other = uid1 === currentUser.uid ? uid2 : uid1;
  const complaintRef = ref(db, `users/${other}/complaints`);
  const complaintSnap = await get(complaintRef);
  const newCount = (complaintSnap.val() || 0) + 1;
  await set(complaintRef, newCount);
  if (newCount >= 10) {
    await set(ref(db, `users/${other}/banned`), true);
  }
  alert('Жалоба отправлена');
};
