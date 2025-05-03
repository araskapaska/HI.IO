// chat.js
import { db } from './firebase-config.js';
import {
  ref,
  get,
  set,
  push,
  update,
  onValue
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

let currentUser = null;
let currentChatId = null;
let chatStartTime = null;

const localUser = JSON.parse(localStorage.getItem('hiio-user'));
if (!localUser) window.location.href = 'index.html';

(async () => {
  const snapshot = await get(ref(db, 'users/' + localUser.uid));
  const data = snapshot.val();
  if (!data || data.password !== localUser.password) return (window.location.href = 'index.html');
  if (data.banned) return alert('Вы забанены');
  currentUser = { ...data, uid: localUser.uid };
  document.getElementById('user-info').innerText = `Вы: ${data.username}`;
})();

document.getElementById('logout').onclick = () => {
  localStorage.removeItem('hiio-user');
  window.location.href = 'index.html';
};

document.getElementById('toggle-theme').onclick = () => {
  document.body.classList.toggle('dark');
};

document.getElementById('start-search').onclick = async () => {
  const myGender = currentUser.gender;
  const myAge = currentUser.age;
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
    const chatSnap = await get(ref(db, `chats/${currentChatId}/users`));
    const userData = chatSnap.val();
    const uid1 = userData[0];
    const uid2 = userData[1];
    const other = uid1 === currentUser.uid ? uid2 : uid1;
    const ref1 = ref(db, `users/${currentUser.uid}/successfulChats`);
    const ref2 = ref(db, `users/${other}/successfulChats`);
    await set(ref1, (await get(ref1)).val() + 1 || 1);
    await set(ref2, (await get(ref2)).val() + 1 || 1);
  }
  currentChatId = null;
  alert('Чат завершен');
};

document.getElementById('report').onclick = async () => {
  if (!currentChatId) return;
  const chatSnap = await get(ref(db, `chats/${currentChatId}/users`));
  const userData = chatSnap.val();
  const uid1 = userData[0];
  const uid2 = userData[1];
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
