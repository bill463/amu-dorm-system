import { getUser, logout } from '../utils/auth.js';
import { apiCall } from '../utils/api.js';

export const renderNavbar = () => {
    const user = getUser();

    let mainLinks = '';
    let rightSection = '';

    if (user) {
        if (user.role === 'admin') {
            mainLinks = `<a href="#/admin" class="nav-link">Dashboard</a>
                   <a href="#/search" class="nav-link">Search</a>`;
        } else {
            mainLinks = `<a href="#/dashboard" class="nav-link">Dashboard</a>
                   <a href="#/search" class="nav-link">Search</a>
                   <a href="#/messages" class="nav-link" style="position: relative;">
                        Messages
                        <span id="nav-unread-badge" style="display: none; position: absolute; top: 0; right: -5px; background: var(--danger-color); color: white; border-radius: 50%; width: 16px; height: 16px; font-size: 0.65rem; align-items: center; justify-content: center; border: 1px solid white;"></span>
                   </a>
                   <a href="#/room" class="nav-link">My Room</a>
                   <a href="#/lost-found" class="nav-link">Lost & Found</a>
                   <a href="#/clearance" class="nav-link">Clearance</a>
                   <a href="#/dorm-change" class="nav-link">Change Dorm</a>`;
        }

        const avatarStyle = `
        width: 32px; height: 32px; 
        border-radius: 50%; 
        background-color: var(--surface-hover);
        background-image: ${user.profilePic ? `url(${user.profilePic})` : 'none'};
        background-size: cover;
        background-position: center;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.9rem; color: var(--primary-color);
        border: 2px solid var(--primary-color);
        flex-shrink: 0;
    `;

        rightSection = `
        <div class="profile-container">
            <a href="#/profile" class="profile-link" style="display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--text-primary);">
                <div style="${avatarStyle}">
                    ${user.profilePic ? '' : user.name.charAt(0).toUpperCase()}
                </div>
                <div style="display: flex; flex-direction: column; line-height: 1.2;">
                    <span style="font-weight: 600; font-size: 0.85rem;">${user.name}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">${user.department}</span>
                </div>
            </a>
            <button id="logout-btn" class="btn btn-outline" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;">Logout</button>
        </div>
    `;
    } else {
        rightSection = `
        <div class="profile-container" style="border: none;">
            <a href="#/login" class="nav-link">Login</a>
        </div>
    `;
    }

    return `
    <nav class="navbar">
        <div class="container nav-container">
            <div class="nav-header">
                <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">
                    <i class="fas fa-bars"></i> ☰
                </button>
                <a href="${user ? (user.role === 'admin' ? '#/admin' : '#/dashboard') : '#/'}" class="nav-logo">
                    <img src="/amu-logo.png" alt="AMU Logo">
                    <span><span>AMIT</span> <span>Dormitory</span></span>
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
            font-weight: 500;
            color: var(--text-secondary);
            padding: 0.5rem 0.75rem;
            border-radius: var(--border-radius);
            transition: var(--transition);
            white-space: nowrap;
        }
        .nav-link:hover {
            color: var(--primary-color);
            background: var(--surface-hover);
        }
        .profile-link:hover {
            opacity: 0.8;
        }
    </style>
    `;
};

// Handle mobile menu toggle and logout
document.addEventListener('click', (e) => {
    if (e.target.id === 'logout-btn') {
        logout();
    }

    if (e.target.closest('#nav-toggle')) {
        const menu = document.getElementById('nav-menu');
        menu.classList.toggle('active');
    } else if (!e.target.closest('#nav-menu')) {
        // Close menu when clicking outside
        const menu = document.getElementById('nav-menu');
        if (menu) menu.classList.remove('active');
    }
});

// Update unread badge count
export const updateNavBadge = async () => {
    const user = getUser();
    if (!user || user.role !== 'student') return;

    try {
        const { count } = await apiCall(`/api/messages/unread-count?userId=${user.id}`);
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
