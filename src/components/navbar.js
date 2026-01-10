import { getUser, logout } from '../utils/auth.js';

export const renderNavbar = () => {
    const user = getUser();

    let mainLinks = '';
    let rightSection = '';

    if (user) {
        // Left side links
        if (user.role === 'admin') {
            mainLinks = `<a href="#/admin" class="nav-link">Dashboard</a>
                   <a href="#/search" class="nav-link">Search</a>`;
        } else {
            mainLinks = `<a href="#/dashboard" class="nav-link">Dashboard</a>
                   <a href="#/search" class="nav-link">Search</a>
                   <a href="#/room" class="nav-link">My Room</a>
                   <a href="#/lost-found" class="nav-link">Lost & Found</a>
                   <a href="#/clearance" class="nav-link">Clearance</a>
                   <a href="#/dorm-change" class="nav-link">Change Dorm</a>`;
        }

        // Right side Profile Section
        const avatarStyle = `
        width: 36px; height: 36px; 
        border-radius: 50%; 
        background-color: var(--surface-hover);
        background-image: ${user.profilePic ? `url(${user.profilePic})` : 'none'};
        background-size: cover;
        background-position: center;
        display: flex; align-items: center; justify-content: center;
        font-size: 1rem; color: var(--primary-color);
        border: 2px solid var(--primary-color);
    `;

        rightSection = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-left: 1rem; padding-left: 1rem; border-left: 1px solid var(--border-color);">
            <a href="#/profile" class="profile-link" style="display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--text-primary);">
                <div style="${avatarStyle}">
                    ${user.profilePic ? '' : user.name.charAt(0).toUpperCase()}
                </div>
                <div style="display: flex; flex-direction: column; line-height: 1.2;">
                    <span style="font-weight: 600; font-size: 0.9rem;">${user.name}</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">${user.department}</span>
                </div>
            </a>
            <button id="logout-btn" class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Logout</button>
        </div>
    `;
    } else {
        rightSection = `
        <div style="display: flex; gap: 1rem;">
            <a href="#/login" class="nav-link">Login</a>
        </div>
    `;
    }

    return `
    <nav style="
        background: #ffffff;
        border-bottom: 1px solid var(--border-color);
        position: sticky;
        top: 0;
        z-index: 1000;
        padding: 0.75rem 0;
    ">
        <div class="container" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 2rem;">
                <a href="${user ? (user.role === 'admin' ? '#/admin' : '#/dashboard') : '#/'}" style="
                    font-size: 1.25rem; 
                    font-weight: 700; 
                    color: var(--primary-color);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    white-space: nowrap;
                ">
                    <img src="/amu-logo.png" alt="AMU Logo" style="height: 40px; width: auto;">
                    <span><span style="color: var(--text-primary);">AMIT</span> <span style="color: var(--primary-color);">Dormitory</span></span>
                </a>
                
                <div style="display: flex; align-items: center; gap: 0.25rem;">
                    ${mainLinks}
                </div>
            </div>

            <div style="display: flex; align-items: center;">
                ${rightSection}
            </div>
        </div>
    </nav>
    <style>
        .nav-link {
            font-weight: 500;
            color: var(--text-secondary);
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            transition: var(--transition);
            white-space: nowrap; /* Prevent wrapping */
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

// Global event delegation for logout (simplest for vanilla JS without framework)
document.addEventListener('click', (e) => {
    if (e.target.id === 'logout-btn') {
        logout();
    }
});
