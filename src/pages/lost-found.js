import { apiCall } from '../utils/api.js';
import { getUser } from '../utils/auth.js';

export const render = `
<div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
        <div>
            <h1 style="margin-bottom: 0.25rem;">Lost & Found</h1>
            <p style="color: var(--text-secondary);">Report lost items or check for found ones.</p>
        </div>
        <button id="toggle-report-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Report Item
        </button>
    </div>

    <div id="report-form-container" class="card" style="display: none; margin-bottom: 2rem; border: 1px solid var(--primary-color);">
        <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">Report an Item</h3>
        <form id="lost-item-form">
            <!-- Report Type Toggle -->
            <div style="margin-bottom: 1.5rem; display: flex; gap: 1rem; padding: 0.5rem; background: #f8fafc; border-radius: 8px; width: fit-content;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <input type="radio" name="reportType" value="Lost" checked style="accent-color: var(--danger-color);">
                    <span style="font-weight: 500;">I Lost something</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <input type="radio" name="reportType" value="Found" style="accent-color: var(--success-color);">
                    <span style="font-weight: 500;">I Found something</span>
                </label>
            </div>

            <div class="grid grid-2">
                <div class="form-group">
                    <label>Item Name <span style="color: var(--danger-color)">*</span></label>
                    <input type="text" id="lost-item" class="form-input" placeholder="e.g. Blue Wallet" required>
                </div>
                 <div class="form-group">
                    <label id="date-label">Date Lost</label>
                    <input type="date" id="lost-date" class="form-input">
                </div>
            </div>
            
            <div class="form-group">
                <label id="location-label">Last Seen Location</label>
                <input type="text" id="lost-location" class="form-input" placeholder="e.g. Library, Block 13...">
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea id="lost-desc" class="form-input" rows="3" placeholder="Provide more details..." required></textarea>
            </div>
            
            <div class="form-group">
                <label>Attach Picture (Optional)</label>
                <div style="border: 2px dashed var(--border-color); padding: 1.5rem; border-radius: 8px; text-align: center; background: #f8fafc; cursor: pointer;" onclick="document.getElementById('lost-image').click()">
                    <input type="file" id="lost-image" accept="image/*" style="display: none;">
                    <div id="upload-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.5rem;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Click to upload an image</p>
                    </div>
                     <div id="image-preview" style="display: none; margin-top: 1rem;">
                        <img src="" style="max-height: 200px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <p style="font-size: 0.8rem; color: var(--success-color); margin-top: 0.5rem;">Image selected</p>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button type="button" class="btn btn-outline" id="cancel-report">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Report</button>
            </div>
        </form>
    </div>

    <div id="lost-items-list" class="grid grid-2">
        <p>Loading items...</p>
    </div>
</div>
`;

export const init = async () => {
  // initData() is not defined in the provided context, assuming it's a placeholder or defined elsewhere.
  // await initData(); 
  const user = getUser();
  const reportBtn = document.getElementById('toggle-report-btn');
  const cancelBtn = document.getElementById('cancel-report');
  const formContainer = document.getElementById('report-form-container');
  const form = document.getElementById('lost-item-form');
  const listContainer = document.getElementById('lost-items-list');

  // Toggle Form
  const toggleForm = (show) => {
    formContainer.style.display = show ? 'block' : 'none';
    reportBtn.style.display = show ? 'none' : 'flex';
    if (!show && form) {
      form.reset();
      // Reset to default state
      const radios = form.querySelectorAll('input[name="reportType"]');
      if (radios.length) radios[0].checked = true;
      document.getElementById('date-label').innerText = 'Date Lost';
      document.getElementById('location-label').innerText = 'Last Seen Location';

      const preview = document.getElementById('image-preview');
      const placeholder = document.getElementById('upload-placeholder');
      if (preview) preview.style.display = 'none';
      if (placeholder) placeholder.style.display = 'block';
    }
  };

  if (reportBtn) reportBtn.addEventListener('click', () => toggleForm(true));
  if (cancelBtn) cancelBtn.addEventListener('click', () => toggleForm(false));

  // Handle Report Type Toggle
  const reportTypeRadios = document.querySelectorAll('input[name="reportType"]');
  reportTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isFound = e.target.value === 'Found';
      document.getElementById('date-label').innerText = isFound ? 'Date Found' : 'Date Lost';
      document.getElementById('location-label').innerText = isFound ? 'Found Location' : 'Last Seen Location';
    });
  });

  // Image Preview Logic
  const fileInput = document.getElementById('lost-image');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById('image-preview');
      const placeholder = document.getElementById('upload-placeholder');
      const img = preview.querySelector('img');

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
          preview.style.display = 'block';
          placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Load Items
  const loadItems = async () => {
    if (!listContainer) return;
    try {
      const items = await apiCall('/api/lost-items');
      if (items.length === 0) {
        listContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No items reported yet.</div>';
        return;
      }

      listContainer.innerHTML = items.map(item => `
                <div class="card" style="display: flex; gap: 1rem; margin: 0;">
                    <div style="width: 100px; height: 100px; border-radius: 8px; background: #f1f5f9; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        ${item.image
          ? `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open(this.src)">`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/></svg>`
        }
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                            <div>
                                <strong style="font-size: 1.1rem; display: block;">${item.itemName}</strong>
                                <span style="font-size: 0.75rem; color: var(--text-secondary);">${item.User ? item.User.name : 'Unknown User'}</span>
                            </div>
                            <span class="badge ${item.status === 'Lost' ? 'badge-danger' : (item.status === 'Found' ? 'badge-success' : 'badge-info')}">${item.status}</span>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; line-height: 1.4;">${item.description}</p>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; gap: 1rem;">
                            <span>📍 ${item.location || 'Unknown location'}</span>
                            <span>📅 ${item.dateLost ? new Date(item.dateLost).toLocaleDateString() : 'Unknown date'}</span>
                        </div>
                    </div>
                     ${user && user.id === item.studentId && item.status === 'Lost' ? `
                         <div style="align-self: center;">
                            <button class="btn btn-outline" style="font-size: 0.8rem;" onclick="alert('Please contact admin to mark as found.')">Found?</button>
                         </div>
                    ` : ''}
                </div>
            `).join('');
    } catch (error) {
      console.error(error);
      listContainer.innerHTML = '<p style="color: red;">Failed to load items.</p>';
    }
  };

  await loadItems();

  // Form Submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!user) return alert('Please login to report items.');

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Submitting...';
      submitBtn.disabled = true;

      try {
        // Get Type
        const reportType = document.querySelector('input[name="reportType"]:checked').value; // 'Lost' or 'Found'

        // Read File
        let imageBase64 = null;
        const file = document.getElementById('lost-image').files[0];
        if (file) {
          imageBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        }

        await apiCall('/api/lost-items', 'POST', {
          studentId: user.id,
          itemName: document.getElementById('lost-item').value,
          description: document.getElementById('lost-desc').value,
          location: document.getElementById('lost-location').value,
          dateLost: document.getElementById('lost-date').value,
          status: reportType,
          image: imageBase64
        });

        alert('Item reported successfully!');
        toggleForm(false);
        await loadItems();
      } catch (error) {
        alert(error.message);
      } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
      }
    });
  }
};
