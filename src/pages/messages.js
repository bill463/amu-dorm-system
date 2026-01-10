import { apiCall } from '../utils/api.js';
import { getUser } from '../utils/auth.js';

export const render = `
<div class="container">
    <h2 class="section-title">Messages</h2>
    <div class="card">
        <div id="messages-list">
            <p>Loading messages...</p>
        </div>
    </div>
</div>
`;

export const init = async () => {
  const user = getUser();
  if (!user) return;

  const list = document.getElementById('messages-list');

  const markAsRead = async (id, element) => {
    try {
      await apiCall(`/api/messages/${id}/read`, 'PATCH');
      element.classList.remove('unread');
      element.querySelector('.status-dot').remove();
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async () => {
    try {
      const messages = await apiCall(`/api/messages?userId=${user.id}`);

      if (messages.length === 0) {
        list.innerHTML = '<p class="text-secondary" style="text-align: center; padding: 2rem;">No messages.</p>';
        return;
      }

      list.innerHTML = messages.map(msg => `
                <div class="message-item ${msg.isRead ? '' : 'unread'}" data-id="${msg.id}" style="padding: 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer; position: relative;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong style="color: var(--primary-color);">${msg.Sender ? msg.Sender.name : 'System'} (Admin)</strong>
                        <small style="color: var(--text-secondary);">${new Date(msg.createdAt).toLocaleDateString()} ${new Date(msg.createdAt).toLocaleTimeString()}</small>
                    </div>
                    <p style="margin: 0; color: var(--text-primary); line-height: 1.5;">${msg.content}</p>
                    ${!msg.isRead ? '<div class="status-dot" style="width: 8px; height: 8px; background: var(--danger-color); border-radius: 50%; position: absolute; top: 1.5rem; left: 0;"></div>' : ''}
                </div>
            `).join('');

      // Add click listeners to mark as read
      document.querySelectorAll('.message-item.unread').forEach(item => {
        item.addEventListener('click', () => markAsRead(item.dataset.id, item));
      });

    } catch (error) {
      list.innerHTML = '<p class="error">Failed to load messages.</p>';
    }
  };

  await loadMessages();
};
