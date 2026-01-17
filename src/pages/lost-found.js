import { apiCall } from '../utils/api.js';
import { getUser } from '../utils/auth.js';

export const render = `
<div class="container" style="padding-bottom: 4rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
        <div>
            <h1 style="margin-bottom: 0.25rem; font-size: 2.5rem; letter-spacing: -0.02em;">Lost & Found</h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">Digital lost property office for AMIT students.</p>
        </div>
        <button id="toggle-report-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem; padding: 1rem 1.5rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Report an Item
        </button>
    </div>

    <div id="report-form-container" class="card" style="display: none; margin-bottom: 3rem; border: 2px solid var(--primary-color); animation: fadeIn 0.4s ease-out;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h3 style="margin: 0; color: var(--primary-color);">Submit a Report</h3>
            <button type="button" class="btn btn-outline" id="cancel-report" style="padding: 0.5rem 1rem;">Cancel</button>
        </div>

        <form id="lost-item-form">
            <div style="margin-bottom: 2rem; display: flex; gap: 1rem; padding: 0.75rem; background: var(--surface-hover); border-radius: 12px; width: fit-content;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: var(--transition);" id="lost-radio-label">
                    <input type="radio" name="reportType" value="Lost" checked style="width: auto;">
                    <span style="font-weight: 600;">I Lost something</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: var(--transition);" id="found-radio-label">
                    <input type="radio" name="reportType" value="Found" style="width: auto;">
                    <span style="font-weight: 600;">I Found something</span>
                </label>
            </div>

            <div class="grid grid-2">
                <div class="form-group">
                    <label>What is the item?</label>
                    <input type="text" id="lost-item" placeholder="e.g. HP Laptop, Black Wallet" required>
                </div>
                <div class="form-group">
                    <label id="date-label">When did it happen?</label>
                    <input type="date" id="lost-date" required>
                </div>
            </div>
            
            <div class="form-group">
                <label id="location-label">Where was it last seen?</label>
                <input type="text" id="lost-location" placeholder="e.g. Library 2nd Floor, Block 10 Café..." required>
            </div>

            <div class="form-group">
                <label>Visual Description</label>
                <textarea id="lost-desc" rows="3" placeholder="Describe unique markings, brand, color, contents..." required></textarea>
            </div>
            
            <div class="form-group">
                <label>Attach Evidence / Proof</label>
                <div style="border: 2px dashed var(--border-color); padding: 2.5rem; border-radius: var(--border-radius); text-align: center; background: var(--surface-color); cursor: pointer;" id="drag-drop-area">
                    <input type="file" id="lost-image" accept="image/*" style="display: none;">
                    <div id="upload-placeholder">
                        <div style="width: 56px; height: 56px; background: var(--primary-light); color: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                        <p style="font-weight: 600; margin-bottom: 0.25rem;">Click to upload an image</p>
                        <p style="color: var(--text-muted); font-size: 0.85rem;">Support JPG, PNG (Max 5MB)</p>
                    </div>
                    <div id="image-preview" style="display: none; position: relative;">
                        <img src="" style="max-height: 250px; border-radius: 12px; box-shadow: var(--shadow-md);">
                        <button type="button" id="remove-img" style="position: absolute; top: -10px; right: -10px; background: var(--danger-color); color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">✕</button>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
                <button type="submit" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem;">Post Report</button>
            </div>
        </form>
    </div>

    <div id="lost-items-list" class="grid grid-2">
        <div class="skeleton" style="height: 200px;"></div>
        <div class="skeleton" style="height: 200px;"></div>
    </div>
</div>
`;

export const init = async () => {
  const user = getUser();
  const reportBtn = document.getElementById('toggle-report-btn');
  const cancelBtn = document.getElementById('cancel-report');
  const formContainer = document.getElementById('report-form-container');
  const form = document.getElementById('lost-item-form');
  const listContainer = document.getElementById('lost-items-list');

  const toggleForm = (show) => {
    if (!formContainer) return;
    formContainer.style.display = show ? 'block' : 'none';
    reportBtn.style.display = show ? 'none' : 'flex';
    if (!show && form) {
      form.reset();
      const preview = document.getElementById('image-preview');
      const placeholder = document.getElementById('upload-placeholder');
      preview.style.display = 'none';
      placeholder.style.display = 'block';
    }
  };

  if (reportBtn) reportBtn.addEventListener('click', () => toggleForm(true));
  if (cancelBtn) cancelBtn.addEventListener('click', () => toggleForm(false));

  // Handle Image Preview
  const fileInput = document.getElementById('lost-image');
  const dragDropArea = document.getElementById('drag-drop-area');
  const preview = document.getElementById('image-preview');
  const placeholder = document.getElementById('upload-placeholder');
  const previewImg = preview?.querySelector('img');

  if (dragDropArea) dragDropArea.addEventListener('click', () => fileInput.click());

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (previewImg) previewImg.src = ev.target.result;
          if (preview) preview.style.display = 'block';
          if (placeholder) placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const removeImgBtn = document.getElementById('remove-img');
  if (removeImgBtn) {
    removeImgBtn.onclick = (e) => {
      e.stopPropagation();
      if (fileInput) fileInput.value = '';
      if (preview) preview.style.display = 'none';
      if (placeholder) placeholder.style.display = 'block';
    };
  }

  const loadItems = async () => {
    try {
      const items = await apiCall('/api/lost-items');
      if (!listContainer) return;

      if (items.length === 0) {
        listContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 5rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1.5rem;">🔍</div>
                    <h3 style="margin: 0;">No items found</h3>
                    <p style="color: var(--text-muted); font-size: 1.1rem;">Everything seems to be in its place... for now.</p>
                </div>`;
        return;
      }

      listContainer.innerHTML = items.map(item => `
                <div class="card" style="display: flex; gap: 1.5rem; align-items: stretch; animation: fadeIn 0.4s ease-out;">
                    <div style="width: 140px; border-radius: 12px; background: var(--surface-hover); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--border-color);">
                        ${item.image
          ? `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">`
          : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/></svg>`
        }
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                <div>
                                    <span class="badge ${item.status === 'Lost' ? 'badge-danger' : 'badge-success'}" style="margin-bottom: 0.5rem;">${item.status.toUpperCase()}</span>
                                    <h4 style="margin: 0; font-size: 1.25rem;">${item.itemName}</h4>
                                </div>
                                ${user && user.id === item.studentId ? '<span style="font-size: 0.75rem; font-weight: 700; color: var(--primary-color);">MY POST</span>' : ''}
                            </div>
                            <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${item.description}
                            </p>
                        </div>
                        <div style="display: flex; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
                            <div style="display: flex; align-items: center; gap: 0.4rem;">
                                📍 <span style="color: var(--text-secondary);">${item.location}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.4rem;">
                                📅 <span style="color: var(--text-secondary);">${new Date(item.dateLost).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
    } catch (e) {
      console.error(e);
      if (listContainer) listContainer.innerHTML = '<p style="color: var(--danger-color); text-align: center;">Failed to load items.</p>';
    }
  };

  await loadItems();

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading to Cloud...';
      }

      const formData = new FormData();
      formData.append('studentId', user.id);
      formData.append('itemName', document.getElementById('lost-item').value);
      formData.append('description', document.getElementById('lost-desc').value);
      formData.append('location', document.getElementById('lost-location').value);
      formData.append('dateLost', document.getElementById('lost-date').value);
      formData.append('status', form.elements['reportType'].value);

      const file = fileInput?.files[0];
      if (file) {
        formData.append('image', file);
      }

      try {
        await apiCall('/api/lost-items', 'POST', formData);
        alert('Your report has been published successfully!');
        toggleForm(false);
        await loadItems();
      } catch (err) {
        alert('Upload failed: ' + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Post Report';
        }
      }
    };
  }
};
