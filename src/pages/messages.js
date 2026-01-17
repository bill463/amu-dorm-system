import { apiCall } from '../utils/api.js';
import { getUser } from '../utils/auth.js';
import { updateNavBadge } from '../components/navbar.js';

export const render = `
<div class="container" style="padding-bottom: 4rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
        <div>
            <h1 style="margin: 0; font-size: 2.5rem; letter-spacing: -0.02em;">Inbox</h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">Official communications from the administration.</p>
        </div>
    </div>

    <div id="messages-list" class="grid" style="gap: 1rem;">
        <!-- Skeletons -->
        <div class="skeleton" style="height: 120px;"></div>
        <div class="skeleton" style="height: 120px;"></div>
        <div class="skeleton" style="height: 120px;"></div>
    </div>
</div>
`;

export const init = async () => {
  const user = getUser();
  if (!user) return;

  const list = document.getElementById('messages-list');
  if (!list) return;

  const markAsRead = async (id, element) => {
    try {
      await apiCall(`/api/messages/${id}/read`, 'PATCH');
      element.style.background = 'var(--surface-color)';
      element.style.borderColor = 'var(--border-color)';
      const dot = element.querySelector('.status-dot');
      if (dot) dot.remove();
      updateNavBadge();
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async () => {
    try {
      const messages = await apiCall(`/api/messages?userId=${user.id}`);

      if (messages.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 5rem 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1.5rem;">✉️</div>
                <h3 style="margin: 0;">Inbox is Empty</h3>
                <p style="color: var(--text-muted); font-size: 1.1rem;">No official messages yet.</p>
            </div>`;
        return;
      }

      list.innerHTML = messages.map(msg => `
                <div class="card message-item" 
                     data-id="${msg.id}" 
                     data-unread="${!msg.isRead}"
                     style="padding: 1.5rem; cursor: pointer; position: relative; transition: var(--transition); 
                            ${!msg.isRead ? 'background: var(--primary-light); border-color: var(--primary-color);' : ''}">
                    
                    ${!msg.isRead ? '<div class="status-dot" style="width: 10px; height: 10px; background: var(--primary-color); border-radius: 50%; position: absolute; top: 1.5rem; right: 1.5rem; box-shadow: 0 0 10px var(--primary-color);"></div>' : ''}
                    
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary-color); border: 1px solid var(--border-color);">
                                ${(msg.Sender ? msg.Sender.name.charAt(0) : 'S')}
                            </div>
                            <div>
                                <div style="font-weight: 700; color: var(--text-primary);">${msg.Sender ? msg.Sender.name : 'System Admin'}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">OFFICIAL BROADCAST</div>
                            </div>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
                            ${new Date(msg.createdAt).toLocaleDateString()} at ${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    
                    <div style="padding-left: 3rem;">
                        ${msg.title ? `<h4 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">${msg.title}</h4>` : ''}
                        <p style="margin: 0; color: var(--text-secondary); line-height: 1.6; font-size: 1rem;">
                            ${msg.content}
                        </p>
                    </div>
                </div>
            `).join('');

      // Add click listeners
      document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', () => {
          if (item.dataset.unread === 'true') {
            markAsRead(item.dataset.id, item);
            item.dataset.unread = 'false';
          }
        });
      });

    } catch (error) {
      list.innerHTML = '<p style="color: var(--danger-color); text-align: center;">Failed to load messages.</p>';
    }
  };

  await loadMessages();
};
