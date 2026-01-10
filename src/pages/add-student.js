import { apiCall } from '../utils/api.js';

export const render = `
<div class="container" style="max-width: 800px;">
    <div style="margin-bottom: 2rem;">
        <a href="#/admin" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Dashboard
        </a>
        <h1>Add New Student</h1>
        <p style="color: var(--text-secondary);">Register a new student and assign them a room.</p>
    </div>

    <div class="card">
        <form id="add-student-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Student Details Section -->
            <div>
                <h3 style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">Personal Information</h3>
                <div class="grid grid-2">
                    <div class="form-group">
                        <label>Student ID <span style="color: var(--danger-color)">*</span></label>
                        <input type="text" id="new-id" class="form-input" placeholder="e.g. NSR/1234/16" required>
                    </div>
                    <div class="form-group">
                        <label>Full Name <span style="color: var(--danger-color)">*</span></label>
                        <input type="text" id="new-name" class="form-input" placeholder="e.g. Abebe Kebede" required>
                    </div>
                </div>
                <div class="grid grid-2">
                     <div class="form-group">
                        <label>Department <span style="color: var(--danger-color)">*</span></label>
                        <select id="new-dept" class="form-input" required>
                            <option value="">Select Department</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Initial Password <span style="color: var(--danger-color)">*</span></label>
                        <input type="password" id="new-password" class="form-input" placeholder="Create a password" required>
                    </div>
                </div>
            </div>

            <!-- Room Assignment Section -->
            <div>
                 <h3 style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">Room Assignment</h3>
                 <div class="form-group">
                    <label>Assign Room (Optional)</label>
                    <div style="margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Select a room to automatically assign this student immediately. Validated for capacity.</div>
                    <select id="new-room" class="form-input">
                        <option value="">-- Do not assign room yet --</option>
                        <option disabled>Loading rooms...</option>
                    </select>
                </div>
            </div>

            <div style="padding-top: 1rem; display: flex; justify-content: flex-end; gap: 1rem;">
                <button type="button" class="btn btn-outline" onclick="window.history.back()">Cancel</button>
                <button type="submit" class="btn btn-primary" style="min-width: 150px;">Register Student</button>
            </div>
        </form>
    </div>
</div>
`;

export const init = async () => {
  const roomSelect = document.getElementById('new-room');

  // Fetch rooms to populate dropdown
  try {
    const rooms = await apiCall('/api/rooms');

    // Group rooms by block
    const blocks = {};
    rooms.forEach(r => {
      if (!blocks[r.block]) blocks[r.block] = [];
      blocks[r.block].push(r);
    });

    // Build dropdown options
    let options = '<option value="">-- Do not assign room yet --</option>';

    // Sort blocks
    Object.keys(blocks).sort().forEach(block => {
      options += `<optgroup label="Block ${block}">`;

      // Sort rooms in block
      blocks[block].sort((a, b) => a.number.localeCompare(b.number)).forEach(r => {
        const occupants = r.occupants ? r.occupants.length : 0;
        const isFull = occupants >= r.capacity;
        const disabled = isFull ? 'disabled' : '';
        const fullText = isFull ? '(FULL)' : `(${occupants}/${r.capacity})`;

        options += `<option value="${r.id}" ${disabled}>Room ${r.number} - ${fullText}</option>`;
      });

      options += `</optgroup>`;
    });

    roomSelect.innerHTML = options;
  } catch (e) {
    console.error('Failed to load rooms', e);
    roomSelect.innerHTML = '<option value="">Error loading rooms</option>';
  }

  // Handle form submit
  const form = document.getElementById('add-student-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Creating...';
      submitBtn.disabled = true;

      try {
        const data = {
          id: document.getElementById('new-id').value,
          name: document.getElementById('new-name').value,
          department: document.getElementById('new-dept').value,
          password: document.getElementById('new-password').value,
          roomId: document.getElementById('new-room').value || null
        };

        await apiCall('/api/students', 'POST', data);

        alert('Student registered successfully!');
        window.location.hash = '#/admin';
      } catch (error) {
        alert(error.message);
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
      }
    });
  }
};
