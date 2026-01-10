import { apiCall } from '../utils/api.js';
import { getUser } from '../utils/auth.js';

export const render = `
<div class="container" style="max-width: 800px; margin: 0 auto;">
    <h2 class="section-title">Clearance Requests</h2>
    
    <div class="card mb-2">
        <h3>Request Clearance</h3>
        <form id="clearance-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
                <label for="reason">Reason for Clearance</label>
                <textarea id="reason" class="form-input" rows="3" required placeholder="e.g. Graduating, Withdrawing, etc."></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit Request</button>
        </form>
    </div>

    <div class="card mb-2">
        <h3>Active Requests</h3>
        <div id="active-list">
            <p>Loading...</p>
        </div>
    </div>

    <div class="card">
        <h3>Request History</h3>
        <div id="history-list">
            <p>Loading...</p>
        </div>
    </div>
</div>
`;

export const init = async () => {
  const user = getUser();
  if (!user) return;

  const form = document.getElementById('clearance-form');
  const activeList = document.getElementById('active-list');
  const historyList = document.getElementById('history-list');

  // Fetch existing requests
  const fetchRequests = async () => {
    try {
      const requests = await apiCall(`/api/clearance?studentId=${user.id}`);

      const activeRequests = requests.filter(req => req.status === 'Pending');
      const historyRequests = requests.filter(req => req.status !== 'Pending');

      // Render Active
      if (activeRequests.length === 0) {
        activeList.innerHTML = '<p class="text-secondary">No active requests.</p>';
      } else {
        activeList.innerHTML = activeRequests.map(req => renderRequest(req)).join('');
      }

      // Render History
      if (historyRequests.length === 0) {
        historyList.innerHTML = '<p class="text-secondary">No history.</p>';
      } else {
        historyList.innerHTML = historyRequests.map(req => renderRequest(req)).join('');
      }

    } catch (error) {
      activeList.innerHTML = '<p class="error">Failed to load requests.</p>';
      historyList.innerHTML = '';
    }
  };

  // Helper to render individual request card
  const renderRequest = (req) => `
        <div style="border-bottom: 1px solid var(--border-color); padding: 1rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-weight: 600;">Status: 
                    <span style="color: ${getStatusColor(req.status)}">${req.status}</span>
                </span>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(req.createdAt).toLocaleDateString()}</span>
            </div>
            <p style="margin: 0; color: var(--text-primary);">${req.reason}</p>
            ${req.adminComment ? `<p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);"><strong>Admin Comment:</strong> ${req.adminComment}</p>` : ''}
        </div>
    `;

  // Handle form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const reason = document.getElementById('reason').value;

    try {
      await apiCall('/api/clearance', 'POST', {
        studentId: user.id,
        reason
      });
      alert('Clearance request submitted successfully!');
      form.reset();
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  });

  fetchRequests();
};

function getStatusColor(status) {
  switch (status) {
    case 'Approved': return 'var(--success-color, green)';
    case 'Rejected': return 'var(--error-color, red)';
    default: return 'var(--warning-color, orange)';
  }
}
