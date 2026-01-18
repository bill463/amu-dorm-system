import { getUser, logout } from '../utils/auth.js';
import { apiCall } from '../utils/api.js';

export const renderNavbar = () => {
    const user = getUser();

    let mainLinks = '';
    let rightSection = '';

    // No theme toggle needed, default to light
    document.documentElement.setAttribute('data-theme', 'light');

    if (user) {
        if (user.role === 'admin') {
            mainLinks = `
                <a href="#/search" class="nav-link" title="Search">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <span class="nav-text">Search</span>
                </a>`;
        } else {
            mainLinks = `
                <a href="#/search" class="nav-link" title="Search">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <span class="nav-text">Search</span>
                </a>
                <a href="#/messages" class="nav-link" title="Messages" style="position: relative;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <span class="nav-text">Messages</span>
                    <span id="nav-unread-badge" style="display: none; position: absolute; top: 0; right: 0; background: var(--danger-color); color: white; border-radius: 50%; width: 14px; height: 14px; font-size: 0.6rem; align-items: center; justify-content: center; border: 1.5px solid var(--surface-color);"></span>
                </a>
                <a href="#/room" class="nav-link" title="My Room">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg>
                    <span class="nav-text">My Room</span>
                </a>
                <a href="#/lost-found" class="nav-link" title="Lost & Found">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
                    <span class="nav-text">Lost & Found</span>
                </a>
                <a href="#/clearance" class="nav-link" title="Clearance">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span class="nav-text">Clearance</span>
                </a>
                <a href="#/dorm-change" class="nav-link" title="Change Dorm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line></svg>
                    <span class="nav-text">Change Dorm</span>
                </a>`;
        }

        const avatarStyle = `
        width: 32px; height: 32px; 
        border-radius: 50%; 
        background-color: var(--surface-hover);
        background-image: ${user.profilePicture ? `url(${user.profilePicture})` : 'none'};
        background-size: cover;
        background-position: center;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; color: var(--primary-color);
        border: 2px solid var(--primary-color);
        flex-shrink: 0;
    `;

        rightSection = `
        <div class="profile-container" style="display: flex; align-items: center; gap: 0.75rem;">
            <a href="#/profile" class="profile-link" style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                <div style="${avatarStyle}">
                    ${user.profilePicture ? '' : user.name.charAt(0).toUpperCase()}
                </div>
                <div style="display: flex; flex-direction: column; line-height: 1.1;" class="nav-text">
                    <span style="font-weight: 600; font-size: 0.8rem; white-space: nowrap;">${user.name.split(' ')[0]}</span>
                    <span style="font-size: 0.65rem; color: var(--text-secondary); white-space: nowrap;">${user.id}</span>
                </div>
            </a>
            <button id="logout-btn" class="btn btn-outline" style="padding: 0.35rem; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;" title="Logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
        </div>
    `;
    } else {
        rightSection = `
        <div class="profile-container" style="border: none; display: flex; align-items: center; gap: 1rem;">
            <a href="#/login" class="nav-link">Login</a>
            <a href="#/register" class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Sign Up</a>
        </div>
    `;
    }

    return `
    <nav class="navbar">
        <div class="container nav-container" style="display: flex; align-items: center; justify-content: space-between;">
            <div class="nav-header" style="display: flex; align-items: center; gap: 1.5rem;">
                <a href="${user ? (user.role === 'admin' ? '#/admin' : '#/dashboard') : '#/'}" class="nav-logo" style="display: flex; align-items: center; gap: 0.5rem;">
                    <img src="/amu-logo.png" alt="AMU Logo" style="height: 28px;">
                    <span style="font-weight: 800; font-size: 1rem; letter-spacing: -0.5px;" class="hide-mobile">AMIT DORM</span>
                </a>
                <div class="nav-menu" id="nav-menu">
                    ${mainLinks}
                </div>
            </div>

            <div class="nav-right">
                ${rightSection}
            </div>
        </div>
    </nav>
    <style>
        .nav-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: var(--text-secondary);
            padding: 0.6rem;
            border-radius: 10px;
            transition: var(--transition);
            font-size: 0.9rem;
        }
        .nav-link:hover {
            color: var(--primary-color);
            background: var(--surface-hover);
        }
        .nav-menu { display: flex; gap: 0.25rem; }
        
        @media (max-width: 1024px) {
            .nav-text { display: none !important; }
            .hide-mobile { display: none !important; }
            .nav-header { gap: 0.5rem !important; }
            .nav-link { padding: 0.5rem; }
        }
    </style>
    `;
};

document.addEventListener('click', (e) => {
    if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
        logout();
    }
});

export const updateNavBadge = async () => {
    const user = getUser();
    if (!user || user.role !== 'student') return;

    try {
        const { count } = await apiCall(\`/api/messages/unread-count?userId=\${user.id}\`);
        const badge = document.getElementById('nav-unread-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (e) { console.error('Failed to fetch unread count', e); }
};
