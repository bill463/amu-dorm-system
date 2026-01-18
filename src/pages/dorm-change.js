import { apiCall } from '../utils/api.js';
import { getUser } from '../utils/auth.js';
import { showToast } from '../utils/data.js';

let activeSubTab = 'standard'; // 'standard' or 'swap'

export const render = `
<div class="container" style="max-width: 800px; margin: 0 auto;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <h2 style="margin: 0;">🔄 Dormitory Changes</h2>
        <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: 8px;">
            <button id="tab-standard" class="sub-tab active">Standard Request</button>
            <button id="tab-swap" class="sub-tab">Roommate Swap</button>
        </div>
    </div>

    <!-- Standard Request View -->
    <div id="view-standard" class="change-view">
        <div class="card" style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem;">Request New Room</h3>
            <form id="change-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div>
                    <label class="form-label">Preferred Room/Block</label>
                    <input type="text" id="preferredDorm" class="form-input" required placeholder="e.g. B1-104">
                </div>
                <div>
                    <label class="form-label">Reason for Change</label>
                    <textarea id="reason" class="form-input" rows="3" required placeholder="Describe why you want to move..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit Request</button>
            </form>
        </div>

        <div class="card">
            <h3 style="margin-bottom: 1.5rem;">Request History</h3>
            <div id="request-list">
                <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Loading history...</p>
            </div>
        </div>
    </div>

    <!-- Swap View -->
    <div id="view-swap" class="change-view" style="display: none;">
        <div class="card" style="margin-bottom: 2rem; border: 2px dashed var(--primary-color); background: #f0f7ff;">
            <h3 style="margin-bottom: 0.5rem; color: var(--primary-color);">🤝 Peer-to-Peer Swap</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
                Found someone to trade rooms with? Enter their Student ID below to send a swap proposal.
            </p>
            <form id="swap-form" style="display: flex; gap: 1rem;">
                <input type="text" id="target-student-id" class="form-input" required placeholder="Enter Roommate's ID (e.g. NSR/123/16)" style="flex: 1; background: white;">
                <button type="submit" class="btn btn-primary" style="white-space: nowrap;">Send Invite</button>
            </form>
        </div>

        <div class="card">
            <h3 style="margin-bottom: 1.5rem;">Active Swap Proposals</h3>
            <div id="swap-list">
                <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Looking for proposals...</p>
            </div>
        </div>
    </div>
</div>

<style>
    .sub-tab { border: none; background: transparent; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); transition: all 0.2s; }
    .sub-tab.active { background: white; color: var(--primary-color); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .proposal-item { padding: 1rem; border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 1rem; }
    .proposal-badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
</style>
`;

export const init = async () => {
  const user = getUser();
  if (!user) return;

  // Tab switching logic
  const tabs = { standard: document.getElementById('tab-standard'), swap: document.getElementById('tab-swap') };
  const views = { standard: document.getElementById('view-standard'), swap: document.getElementById('view-swap') };

  const switchSubTab = (tab) => {
    activeSubTab = tab;
    Object.keys(tabs).forEach(k => {
      tabs[k].classList.toggle('active', k === tab);
      views[k].style.display = k === tab ? 'block' : 'none';
    });
    if (tab === 'standard') fetchRequests();
    else fetchSwaps();
  };

  tabs.standard.onclick = () => switchSubTab('standard');
  tabs.swap.onclick = () => switchSubTab('swap');

  // STANDARD REQUEST LOGIC
  const fetchRequests = async () => {
    const list = document.getElementById('request-list');
    try {
      const requests = await apiCall(`/api/dorm-change?studentId=${user.id}`);
      if (!requests.length) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No previous requests.</p>';
        return;
      }
      list.innerHTML = requests.map(req => `
                <div style="border-bottom: 1px solid var(--border-color); padding: 1rem 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                         <span style="font-weight: 600;">Status: 
                            <span style="color: ${getStatusColor(req.status)}">${req.status}</span>
                        </span>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p><strong>Preferred:</strong> ${req.preferredDorm}</p>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.95rem;">${req.reason}</p>
                    ${req.adminComment ? `<div style="margin-top: 0.75rem; padding: 0.75rem; background: #fffbeb; border-radius: 8px; font-size: 0.85rem; color: #92400e;"><strong>Admin:</strong> ${req.adminComment}</div>` : ''}
                </div>
            `).join('');
    } catch (e) { list.innerHTML = 'Error loading history.'; }
  };

  document.getElementById('change-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/api/dorm-change', 'POST', {
        studentId: user.id,
        currentRoomId: user.roomId,
        preferredDorm: document.getElementById('preferredDorm').value,
        reason: document.getElementById('reason').value
      });
      showToast('Request submitted successfully!', 'success');
      e.target.reset();
      fetchRequests();
    } catch (e) { showToast(e.message, 'error'); }
  };

  // SWAP LOGIC
  const fetchSwaps = async () => {
    const list = document.getElementById('swap-list');
    try {
      const swaps = await apiCall(`/api/swaps?userId=${user.id}`);
      if (!swaps.length) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No active swaps.</p>';
        return;
      }
      list.innerHTML = swaps.map(s => {
        const isReceiver = s.receiverId === user.id;
        const otherUser = isReceiver ? s.Sender : s.Receiver;
        return `
                <div class="proposal-item">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <div style="font-weight: 700;">${otherUser.name}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${otherUser.id}</div>
                        </div>
                        <span class="proposal-badge" style="background: ${getStatusColor(s.status)}20; color: ${getStatusColor(s.status)}">${s.status}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">${isReceiver ? 'Invited you to swap' : 'You invited them'}</span>
                        ${isReceiver && s.status === 'Pending' ? `
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-sm btn-success accept-swap" data-id="${s.id}" style="padding: 4px 12px; font-size: 0.8rem;">Accept</button>
                                <button class="btn btn-sm btn-danger deny-swap" data-id="${s.id}" style="padding: 4px 12px; font-size: 0.8rem;">Decline</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
      }).join('');

      // Add event listeners to buttons
      document.querySelectorAll('.accept-swap').forEach(btn => {
        btn.onclick = async () => {
          if (confirm('Accept this swap proposal? It will be sent to Admin for final approval.')) {
            await apiCall(`/api/swaps/${btn.dataset.id}`, 'PATCH', { status: 'Accepted' });
            showToast('Proposal accepted!', 'success');
            fetchSwaps();
          }
        };
      });
      document.querySelectorAll('.deny-swap').forEach(btn => {
        btn.onclick = async () => {
          await apiCall(`/api/swaps/${btn.dataset.id}`, 'PATCH', { status: 'Rejected' });
          showToast('Proposal declined.', 'info');
          fetchSwaps();
        };
      });

    } catch (e) { list.innerHTML = 'Error loading swaps.'; }
  };

  document.getElementById('swap-form').onsubmit = async (e) => {
    e.preventDefault();
    const targetId = document.getElementById('target-student-id').value;
    try {
      await apiCall('/api/swaps', 'POST', { senderId: user.id, receiverId: targetId });
      showToast('Swap invitation sent!', 'success');
      e.target.reset();
      fetchSwaps();
    } catch (e) { showToast(e.message, 'error'); }
  };

  fetchRequests();
};

function getStatusColor(status) {
  switch (status) {
    case 'Approved': case 'Accepted': return '#10b981';
    case 'Rejected': case 'Cancelled': return '#ef4444';
    case 'Pending': return '#f59e0b';
    default: return '#64748b';
  }
}
