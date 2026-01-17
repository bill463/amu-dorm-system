import { io } from 'socket.io-client';
import { getUser } from './auth.js';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket;

export const initSocket = () => {
  const user = getUser();
  if (!user) return null;

  if (!socket) {
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join_user', user.id);
    });

    socket.on('new_notification', (data) => {
      showBrowserNotification(data.title, data.content);
      // Also refresh the nav badge if we are on a page where it exists
      const { updateNavBadge } = import('../components/navbar.js');
      updateNavBadge();
    });
  }

  return socket;
};

export const getSocket = () => socket;

function showBrowserNotification(title, content) {
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    alert(`${title}: ${content}`);
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body: content, icon: '/amu-logo.png' });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body: content, icon: '/amu-logo.png' });
      }
    });
  }
}
