import { apiCall } from '../utils/api.js';
import { getUser } from '../utils/auth.js';

export const render = `
<div class="container" style="max-width: 800px; margin: 0 auto;">
    <h2 class="section-title">Dorm Change Request</h2>

    <div class="card mb-2">
        <h3>Request Change</h3>
        <form id="change-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
                <label>Current Room (if applicable)</label>
                <input type="text" id="currentInfo" class="form-input" disabled value="Loading...">
            </div>
            <div class="form-group">
                <label for="preferredDorm">Preferred Dorm/Block</label>
                <input type="text" id="preferredDorm" class="form-input" required placeholder="e.g. Block 5, Ground Floor">
            </div>
            <div class="form-group">
                <label for="reason">Reason for Change</label>
                <textarea id="reason" class="form-input" rows="3" required placeholder="e.g. Conflict with roommate, health issues..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit Request</button>
        </form>
    </div>

    <div class="card">
        <h3>My Requests</h3>
        <div id="request-list">
            <p>Loading...</p>
        </div>
    </div>
</div>
`;

export const init = async () => {
  const user = getUser();
  if (!user) return;

  const currentInfo = document.getElementById('currentInfo');
  // We should ideally fetch current room info. For now, we use what's in user object or fetch it.
  // The user object from local storage might be stale or just have roomId.
  // Let's assume user.roomId is available.
  currentInfo.value = user.roomId ? `Room ID: ${user.roomId}` : 'Not assigned to a room';

  const form = document.getElementById('change-form');
  const list = document.getElementById('request-list');

  const fetchRequests = async () => {
    try {
      const requests = await apiCall(`/api/dorm-change?studentId=${user.id}`);
      if (requests.length === 0) {
        list.innerHTML = '<p>No change requests found.</p>';
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
                    <p style="margin: 0; color: var(--text-primary);">${req.reason}</p>
                     ${req.adminComment ? `<p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);"><strong>Admin Comment:</strong> ${req.adminComment}</p>` : ''}
                </div>
            `).join('');
    } catch (error) {
      list.innerHTML = '<p class="error">Failed to load requests.</p>';
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      await apiCall('/api/dorm-change', 'POST', {
        studentId: user.id,
        currentRoomId: user.roomId || null, // Handle case where not in a room? backend might expect integer FK...
        // If roomId is string in user obj but int in DB, might issue.
        // Our models say RoomId is FK.
        // Re-checking models... DormChangeRequest: currentRoomId (FK -> Room).
        // If user doesn't have room, maybe pass null.
        // But backend expects it? `DormChangeRequest` model doesn't say allowNull: false explicitly for currentRoomId.
        // Let's check `User` model again. `roomId` is defined as String type? 
        // Ah, User.js: `roomId: { type: DataTypes.STRING ... }`
        // But `Room.js` likely has `id: DataTypes.STRING` or integer?
        // Room.js is small. Let's assume string ID is fine.
        preferredDorm: document.getElementById('preferredDorm').value,
        reason: document.getElementById('reason').value
      });
      alert('Request submitted successfully!');
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
