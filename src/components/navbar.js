import { getUser, logout } from '../utils/auth.js';
import { apiCall } from '../utils/api.js';

export const renderNavbar = () => {
    const user = getUser();

    let mainLinks = '';
    let rightSection = '';

    const currentTheme = localStorage.getItem('amu-theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = currentTheme === 'dark' ? '☀️' : '🌙';

    if (user) {
        if (user.role === 'admin') {
            mainLinks = `<a href="#/admin" class="nav-link">Dashboard</a>
                   <a href="#/search" class="nav-link">Search</a>`;
        } else {
            mainLinks = `<a href="#/dashboard" class="nav-link">Dashboard</a>
                   <a href="#/search" class="nav-link">Search</a>
                   <a href="#/messages" class="nav-link" style="position: relative;">
                        Messages
                        <span id="nav-unread-badge" style="display: none; position: absolute; top: -5px; right: -5px; background: var(--danger-color); color: white; border-radius: 50%; width: 16px; height: 16px; font-size: 0.65rem; align-items: center; justify-content: center; border: 1px solid white;"></span>
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
        background-image: ${user.profilePicture ? `url(${user.profilePicture})` : 'none'};
        background-size: cover;
        background-position: center;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; color: var(--primary-color);
        border: 2px solid var(--primary-color);
        flex-shrink: 0;
    `;

        rightSection = `
        <div class="profile-container" style="display: flex; align-items: center; gap: 1rem;">
            <button id="theme-toggle" class="theme-toggle" title="Toggle Dark/Light Mode">${themeIcon}</button>
            <a href="#/profile" class="profile-link" style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-primary);">
                <div style="${avatarStyle}">
                    ${user.profilePicture ? '' : user.name.charAt(0).toUpperCase()}
                </div>
                <div style="display: flex; flex-direction: column; line-height: 1.1;">
                    <span style="font-weight: 600; font-size: 0.85rem; white-space: nowrap;">${user.name}</span>
                    <span style="font-size: 0.7rem; color: var(--text-secondary); white-space: nowrap;">${user.department}</span>
                </div>
            </a>
            <button id="logout-btn" class="btn btn-outline" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;">Logout</button>
        </div>
    `;
    } else {
        rightSection = `
        <div class="profile-container" style="border: none; display: flex; align-items: center; gap: 1rem;">
            <button id="theme-toggle" class="theme-toggle" title="Toggle Dark/Light Mode">${themeIcon}</button>
            <a href="#/login" class="nav-link">Login</a>
            <a href="#/register" class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Sign Up</a>
        </div>
    `;
    }

    return `
    <nav class="navbar">
        <div class="container nav-container" style="display: flex; align-items: center; justify-content: space-between;">
            <div class="nav-header" style="display: flex; align-items: center; gap: 2rem;">
                <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">
                    ☰
                </button>
                <a href="${user ? (user.role === 'admin' ? '#/admin' : '#/dashboard') : '#/'}" class="nav-logo" style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="/amu-logo.png" alt="AMU Logo" style="height: 32px;">
                    <span style="font-weight: 800; font-size: 1.1rem; letter-spacing: -0.5px;">AMIT DORM</span>
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
            font-weight: 600;
            color: var(--text-secondary);
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            transition: var(--transition);
            font-size: 0.9rem;
        }
        .nav-link:hover {
            color: var(--primary-color);
            background: var(--surface-hover);
        }
        .nav-menu { display: flex; gap: 0.5rem; }
        @media (max-width: 992px) {
            .nav-menu { display: none; }
            .nav-menu.active { display: flex; position: absolute; top: 100%; left: 0; right: 0; background: var(--surface-color); flex-direction: column; padding: 1rem; border-bottom: 1px solid var(--border-color); }
        }
        .theme-toggle {
            background: var(--surface-hover);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            cursor: pointer;
            width: 36px; height: 36px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.1rem;
            transition: var(--transition);
        }
        .theme-toggle:hover {
            transform: rotate(15deg) scale(1.1);
            background: var(--border-color);
        }
    </style>
    `;
};

document.addEventListener('click', (e) => {
    if (e.target.id === 'logout-btn') {
        logout();
    }

    if (e.target.id === 'theme-toggle' || e.target.closest('#theme-toggle')) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('amu-theme', newTheme);

        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    if (e.target.closest('#nav-toggle')) {
        const menu = document.getElementById('nav-menu');
        menu.classList.toggle('active');
    } else if (!e.target.closest('#nav-menu')) {
        const menu = document.getElementById('nav-menu');
        if (menu) menu.classList.remove('active');
    }
});

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
