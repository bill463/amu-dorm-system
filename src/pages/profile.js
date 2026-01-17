import { getUser, updateUser } from '../utils/auth.js';
import { getUserById } from '../utils/data.js';
import { apiCall } from '../utils/api.js';
import { renderNavbar, updateNavBadge } from '../components/navbar.js';

export const render = `
<div class="container" style="max-width: 800px; margin: 0 auto;">
    <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
            <h1 style="margin: 0; font-size: 2rem;" id="profile-title">My Profile</h1>
            <button id="toggle-edit-btn" class="btn btn-outline">Edit Profile</button>
        </div>

        <div id="profile-view">
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 2rem;">
                <div id="view-avatar" style="
                    width: 150px; height: 150px; 
                    border-radius: 50%; 
                    background-color: var(--surface-hover);
                    background-size: cover;
                    background-position: center;
                    margin-bottom: 1rem;
                    border: 4px solid var(--primary-color);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 3rem; color: var(--primary-color);
                ">
                    <!-- Icon injected if no image -->
                </div>
                <h2 id="view-name" style="margin-bottom: 0.5rem;"></h2>
                <p id="view-id" style="color: var(--text-secondary);"></p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Department</h4>
                    <p id="view-dept" style="font-weight: 500; font-size: 1.1rem;"></p>
                </div>
                <div>
                    <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Phone</h4>
                    <p id="view-phone" style="font-weight: 500; font-size: 1.1rem;"></p>
                </div>
                <div>
                    <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Email</h4>
                    <p id="view-email" style="font-weight: 500; font-size: 1.1rem;"></p>
                </div>
                <div style="grid-column: span 2;">
                    <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Bio</h4>
                    <p id="view-bio" style="font-weight: 500; font-size: 1.1rem; line-height: 1.6;"></p>
                </div>
            </div>
        </div>

        <form id="profile-edit" style="display: none;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <label for="edit-avatar-input" style="cursor: pointer; display: inline-block; position: relative;">
                     <div id="edit-avatar-preview" style="
                        width: 150px; height: 150px; 
                        border-radius: 50%; 
                        background-color: var(--surface-hover);
                        background-size: cover;
                        background-position: center;
                        border: 4px solid var(--primary-color);
                        display: flex; align-items: center; justify-content: center;
                        font-size: 3rem; color: var(--text-secondary);
                    ">📷</div>
                    <div style="
                        position: absolute; bottom: 0; right: 0; 
                        background: var(--primary-color); color: white; 
                        width: 40px; height: 40px; border-radius: 50%; 
                        display: flex; align-items: center; justify-content: center;
                        border: 2px solid white;
                    ">✏️</div>
                </label>
                <input type="file" id="edit-avatar-input" accept="image/*" style="display: none;">
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">Max size 500KB</p>
                <p id="avatar-error" style="color: var(--danger-color); font-size: 0.9rem; display: none;"></p>
            </div>

            <div style="display: grid; gap: 1.5rem;">
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Phone Number</label>
                    <input type="tel" id="edit-phone" placeholder="+251...">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Email</label>
                    <input type="email" id="edit-email" placeholder="student@amu.edu.et">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Bio</label>
                    <textarea id="edit-bio" rows="4" style="resize: vertical;" placeholder="Tell us about yourself..."></textarea>
                </div>
                
                <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1rem 0;">
                
                <div style="background: var(--surface-hover); padding: 1rem; border-radius: 8px;">
                    <h4 style="margin-top: 0; margin-bottom: 1rem;">Change Password</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem;">Current Password</label>
                            <input type="password" id="current-password" class="form-input">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem;">New Password</label>
                            <input type="password" id="new-password" class="form-input">
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                    <button type="button" id="cancel-edit-btn" class="btn btn-outline">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </div>
        </form>
    </div>
</div>
`;

export const init = async () => {
  const currentUser = getUser();

  // Get ID from URL query params
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const viewId = urlParams.get('id');

  let profileUser = currentUser;
  let isReadOnly = false;

  if (viewId && viewId !== currentUser.id) {
    try {
      const foundUser = await getUserById(viewId);
      if (foundUser) {
        profileUser = foundUser;
        isReadOnly = true;
      }
    } catch (e) {
      console.error("Failed to fetch user profile", e);
    }
  }

  if (!profileUser) return;

  const viewMode = document.getElementById('profile-view');
  const editMode = document.getElementById('profile-edit');
  const toggleBtn = document.getElementById('toggle-edit-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const avatarInput = document.getElementById('edit-avatar-input');
  const profileTitle = document.getElementById('profile-title');

  if (isReadOnly) {
    if (toggleBtn) toggleBtn.style.display = 'none';
    if (profileTitle) profileTitle.textContent = `${profileUser.name}'s Profile`;
  } else {
    if (profileTitle) profileTitle.textContent = 'My Profile';
  }

  let tempAvatar = profileUser.profilePicture || null; // Use profilePicture from DB

  const renderData = () => {
    // View Mode
    document.getElementById('view-name').textContent = profileUser.name;
    document.getElementById('view-id').textContent = profileUser.id;
    document.getElementById('view-dept').textContent = profileUser.department;
    document.getElementById('view-phone').textContent = profileUser.phone || 'Not set';
    document.getElementById('view-email').textContent = profileUser.email || 'Not set';
    document.getElementById('view-bio').textContent = profileUser.bio || 'No bio yet.';

    const viewAvatar = document.getElementById('view-avatar');
    if (profileUser.profilePicture) {
      viewAvatar.style.backgroundImage = `url(${profileUser.profilePicture})`;
      viewAvatar.textContent = '';
    } else {
      viewAvatar.style.backgroundImage = 'none';
      viewAvatar.textContent = profileUser.name.charAt(0).toUpperCase();
    }

    if (!isReadOnly) {
      // Edit Mode Pre-fill
      document.getElementById('edit-phone').value = profileUser.phone || '';
      document.getElementById('edit-email').value = profileUser.email || '';
      document.getElementById('edit-bio').value = profileUser.bio || '';

      const editAvatarPreview = document.getElementById('edit-avatar-preview');
      if (profileUser.profilePicture) {
        editAvatarPreview.style.backgroundImage = `url(${profileUser.profilePicture})`;
        editAvatarPreview.textContent = '';
      } else {
        editAvatarPreview.style.backgroundImage = 'none';
        editAvatarPreview.textContent = '📷';
      }
    }
  };

  renderData();

  if (!isReadOnly) {
    // Toggle Modes
    toggleBtn.addEventListener('click', () => {
      viewMode.style.display = 'none';
      editMode.style.display = 'block';
      toggleBtn.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
      viewMode.style.display = 'block';
      editMode.style.display = 'none';
      toggleBtn.style.display = 'block';
      // Reset temp state
      tempAvatar = profileUser.profilePicture;
      renderData();
    });

    // Image Upload
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const errorMsg = document.getElementById('avatar-error');
      errorMsg.style.display = 'none';

      if (file) {
        if (file.size > 500 * 1024) { // 500KB limit
          errorMsg.textContent = 'Image size too large. Max 500KB.';
          errorMsg.style.display = 'block';
          return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
          tempAvatar = ev.target.result;
          const editAvatarPreview = document.getElementById('edit-avatar-preview');
          editAvatarPreview.style.backgroundImage = `url(${tempAvatar})`;
          editAvatarPreview.textContent = '';
        };
        reader.readAsDataURL(file);
      }
    });

    // Save
    editMode.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append('id', profileUser.id);
      formData.append('phone', document.getElementById('edit-phone').value);
      formData.append('email', document.getElementById('edit-email').value);
      formData.append('bio', document.getElementById('edit-bio').value);

      // Handle Image: Check if a new file was selected
      const fileInput = document.getElementById('edit-avatar-input');
      if (fileInput.files.length > 0) {
        formData.append('profilePicture', fileInput.files[0]);
      }

      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;

      if (currentPassword && newPassword) {
        // ... (password logic remains disjoint for now, or could be merged but keeping safe)
        try {
          await apiCall('/auth/change-password', 'PATCH', {
            id: profileUser.id,
            currentPassword,
            newPassword
          });
          alert('Password updated successfully!');
        } catch (error) {
          alert(`Failed to update password: ${error.message}`);
          return;
        }
      }

      // Send FormData using updateUser
      const result = await updateUser(formData); // updateUser needs to detect FormData

      if (result.success) {
        // Refresh user data from storage
        profileUser = getUser();
        renderData();

        // REFRESH NAVBAR
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
          navbarContainer.innerHTML = renderNavbar();
          updateNavBadge();
        }

        // Switch back to view
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
        toggleBtn.style.display = 'block';

        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';

      } else {
        alert('Error updating profile: ' + (result.message || 'Unknown error'));
      }
    });
  }
};
