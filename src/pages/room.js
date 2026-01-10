import { getUser } from '../utils/auth.js';
import { getStudentRoom } from '../utils/data.js';

export const render = `
<div class="container">
    <div id="room-content">Loading...</div>
</div>
`;

export const init = async () => {
    const user = getUser();
    const room = await getStudentRoom(user.id);
    const container = document.getElementById('room-content');

    if (!container) return;

    if (!room) {
        container.innerHTML = `
            <div class="card" style="text-align: center; margin-top: 2rem;">
                <h2>No Room Assigned</h2>
                <p>You have not been assigned a dormitory room yet.</p>
                <a href="#/dashboard" class="btn btn-primary" style="margin-top: 1rem;">Back to Dashboard</a>
            </div>
        `;
        return;
    }

    // room.occupants is now an array of User objects (populated from backend)
    const occupants = room.occupants || [];

    const roommatesHtml = occupants.map(profile => {
        // profile is the user object directly
        const name = profile.name || `Student ${profile.id}`;
        const initial = name.charAt(0).toUpperCase();
        // Backend returns profilePicture (if exists)
        const avatarStyle = profile.profilePicture
            ? `background-image: url(${profile.profilePicture}); background-size: cover; background-position: center;`
            : `background: #ddd;`;
        const avatarContent = profile.profilePicture ? '' : initial;

        // Store data in data attributes for modal
        const safeBio = (profile.bio || '').replace(/"/g, '&quot;');
        const safeDept = (profile.department || '').replace(/"/g, '&quot;');
        // Note: encoding for HTML attributes

        return `
            <div class="card roommate-card" 
                 data-id="${profile.id}"
                 data-name="${name}"
                 data-dept="${safeDept}"
                 data-bio="${safeBio}"
                 data-email="${profile.email || ''}"
                 data-phone="${profile.phone || ''}"
                 data-pic="${profile.profilePicture || ''}"
                 style="padding: 1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: transform 0.2s; border: 1px solid transparent;">
                <div style="width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; background-color: var(--surface-hover); border: 2px solid var(--border-color); ${avatarStyle}">
                    ${avatarContent}
                </div>
                <div>
                    <div style="font-weight: bold; color: var(--primary-color);">${name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${profile.id === user.id ? '(You)' : profile.id}</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <h1 style="margin-bottom: 1.5rem;">Room Details</h1>
        
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 1rem;">
                <div>
                    <h2 style="color: var(--primary-color);">${room.block} - Room ${room.number}</h2>
                    <p style="color: var(--text-secondary);">standard student dormitory</p>
                </div>
                <div style="background: #e8f5e9; color: var(--success-color); padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold;">
                    Occupied: ${occupants.length} / ${room.capacity}
                </div>
            </div>

            <h3>Amenities</h3>
            <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0; list-style: none;">
                <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--success-color);">✓</span> 6 Beds (Bunk)</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--success-color);">✓</span> 1 Locker (6 Sections)</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--success-color);">✓</span> Study Table</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--success-color);">✓</span> Ceiling Fan</li>
            </ul>
        </div>

        <h3 style="margin-bottom: 1rem;">Roommates</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            ${roommatesHtml}
        </div>
        
        <div style="margin-top: 2rem;">
            <a href="#/dashboard" class="btn" style="border: 1px solid #ccc;">&larr; Back to Dashboard</a>
        </div>

        <!-- Profile Modal -->
        <div id="roommate-modal" style="
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 2000;
            justify-content: center; align-items: center;
        ">
            <div class="card" style="width: 90%; max-width: 400px; position: relative; animation: slideUp 0.3s ease;">
                <button id="close-modal" style="
                    position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);
                ">&times;</button>
                
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div id="modal-avatar" style="
                        width: 100px; height: 100px; margin: 0 auto 1rem;
                        border-radius: 50%; background: #eee;
                        background-size: cover; background-position: center;
                        border: 3px solid var(--primary-color);
                    "></div>
                    <h2 id="modal-name" style="margin-bottom: 0.25rem;"></h2>
                    <p id="modal-id" style="color: var(--text-secondary); font-size: 0.9rem;"></p>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="padding: 0.75rem; background: var(--surface-hover); border-radius: 8px;">
                        <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Department</span>
                        <div id="modal-dept" style="font-weight: 500;"></div>
                    </div>
                    <div style="padding: 0.75rem; background: var(--surface-hover); border-radius: 8px;">
                        <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Bio</span>
                        <div id="modal-bio" style="font-size: 0.95rem; line-height: 1.5; color: var(--text-primary);"></div>
                    </div>
                     <div style="padding: 0.75rem; background: var(--surface-hover); border-radius: 8px;">
                        <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Contact</span>
                        <div id="modal-contact" style="font-size: 0.95rem; color: var(--primary-color);"></div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .roommate-card:hover { transform: translateY(-3px); border-color: var(--primary-color) !important; box-shadow: var(--shadow-md); }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        </style>
    `;

    // Modal Interaction Logic
    const modal = document.getElementById('roommate-modal');
    const closeBtn = document.getElementById('close-modal');

    if (modal && closeBtn) {
        const closeModal = () => { modal.style.display = 'none'; };
        closeBtn.onclick = closeModal;
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        document.querySelectorAll('.roommate-card').forEach(card => {
            card.addEventListener('click', () => {
                const ds = card.dataset;

                document.getElementById('modal-name').textContent = ds.name;
                document.getElementById('modal-id').textContent = ds.id;
                document.getElementById('modal-dept').textContent = ds.dept || 'Not specified';
                document.getElementById('modal-bio').textContent = ds.bio || 'No bio available.';
                document.getElementById('modal-contact').textContent = `${ds.email || 'No Email'} • ${ds.phone || 'No Phone'}`;

                const avatar = document.getElementById('modal-avatar');
                if (ds.pic) {
                    avatar.style.backgroundImage = `url(${ds.pic})`;
                    avatar.textContent = '';
                } else {
                    avatar.style.backgroundImage = 'none';
                    avatar.textContent = '';
                    avatar.style.backgroundColor = '#ddd';
                }

                modal.style.display = 'flex';
            });
        });
    }
};
