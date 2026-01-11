import { getUser } from '../utils/auth.js';
import { getStudentRoom, getRequests, autoAssignDemo, initData } from '../utils/data.js';

export const render = `
<div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
            <h1 id="welcome-title" style="margin-bottom: 0.5rem;">Welcome, Student</h1>
            <p style="color: var(--text-secondary);">Welcome back to AMIT Dormitory Portal</p>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-secondary);">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>
    
    <div id="student-content">
        <div class="grid grid-2" style="margin-bottom: 2rem;">
            <div class="card skeleton" style="height: 300px; margin: 0;"></div>
            <div class="card skeleton" style="height: 300px; margin: 0;"></div>
        </div>
        <div class="skeleton" style="height: 100px; margin-bottom: 1rem;"></div>
        <div class="grid grid-3">
            <div class="card skeleton" style="height: 100px; margin: 0;"></div>
            <div class="card skeleton" style="height: 100px; margin: 0;"></div>
            <div class="card skeleton" style="height: 100px; margin: 0;"></div>
        </div>
    </div>
</div>
`;

export const init = async () => {
    await initData();
    const user = getUser();
    if (!user) return;

    // Personalize title
    const welcomeTitle = document.getElementById('welcome-title');
    if (welcomeTitle) {
        welcomeTitle.textContent = `Welcome, ${user.name}`;
    }

    // Auto-assign room for demo
    await autoAssignDemo(user.id);

    // Fetch room, requests, and unread messages count
    const [room, requests, unreadRes] = await Promise.all([
        getStudentRoom(user.id),
        getRequests(user.id),
        apiCall(`/api/messages/unread-count?userId=${user.id}`).catch(() => ({ count: 0 }))
    ]);

    const unreadCount = unreadRes?.count || 0;
    const container = document.getElementById('student-content');

    if (!container) return;

    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    const completedCount = requests.filter(r => r.status === 'Completed').length;

    container.innerHTML = `
        <div class="grid grid-2" style="margin-bottom: 2rem;">
            <!-- My Room Card -->
            <div class="card" style="margin: 0; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; right: 0; padding: 1.5rem; opacity: 0.1;">
                     <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                
                <h3 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    My Room
                </h3>
                
                ${room ? `
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                         <div style="font-size: 4rem; font-weight: 800; color: var(--primary-color); line-height: 1;">${room.number}</div>
                         <div style="font-size: 1.25rem; font-weight: 500; color: var(--text-secondary);">Block ${room.block}</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: var(--background-color); padding: 0.75rem; border-radius: 8px; text-align: center;">
                            <span style="display: block; font-size: 0.8rem; color: var(--text-secondary);">Capacity</span>
                            <span style="font-weight: 600;">${room.capacity} Students</span>
                        </div>
                        <div style="background: var(--background-color); padding: 0.75rem; border-radius: 8px; text-align: center;">
                             <span style="display: block; font-size: 0.8rem; color: var(--text-secondary);">Assigned</span>
                            <span style="font-weight: 600;">Since Jan 2025</span>
                        </div>
                    </div>

                    <a href="#/room" class="btn btn-outline" style="width: 100%; justify-content: center;">View Roommates & Details</a>
                ` : `
                    <div style="text-align: center; padding: 2rem 0;">
                        <div style="background: #f1f5f9; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        </div>
                        <p style="font-weight: 500; margin-bottom: 0.5rem;">No Room Assigned</p>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">Please contact specific admin for allocation.</p>
                    </div>
                `}
            </div>

            <!-- Maintenance Status Card -->
            <div class="card" style="margin: 0;">
                <h3 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    Maintenance Overview
                </h3>

                <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                     <div style="flex: 1; background: #fffbeb; padding: 1.5rem; border-radius: 12px; border: 1px solid #fcd34d;">
                        <div style="font-size: 2.5rem; font-weight: 700; color: #b45309; line-height: 1;">${pendingCount}</div>
                        <div style="font-weight: 500; color: #b45309;">Pending Active Requests</div>
                    </div>
                    <div style="flex: 1; background: #f0fdf4; padding: 1.5rem; border-radius: 12px; border: 1px solid #86efac;">
                        <div style="font-size: 2.5rem; font-weight: 700; color: #15803d; line-height: 1;">${completedCount}</div>
                        <div style="font-weight: 500; color: #15803d;">Completed Repairs</div>
                    </div>
                </div>

                <h4 style="margin-bottom: 1rem;">Quick Actions</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <a href="#/maintenance" class="btn btn-primary" style="justify-content: center;">Report Issue</a>
                    <a href="#/lost-found" class="btn btn-outline" style="justify-content: center;">Report Lost Item</a>
                </div>
            </div>
        </div>

        <!-- Secondary Services -->
        <h3 style="margin-bottom: 1rem;">Services</h3>
        <div class="grid grid-3">
             <a href="#/clearance" class="card" style="margin: 0; text-decoration: none; transition: transform 0.2s; display: block;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <div style="padding: 0.5rem; background: #fee2e2; border-radius: 8px; color: #ef4444;">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    </div>
                    <strong>Request Clearance</strong>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">End of semester checkout process.</p>
            </a>

            <a href="#/dorm-change" class="card" style="margin: 0; text-decoration: none; transition: transform 0.2s; display: block;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                     <div style="padding: 0.5rem; background: #e0f2fe; border-radius: 8px; color: #3b82f6;">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </div>
                    <strong>Change Dorm</strong>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Apply to move to a different room.</p>
            </a>

            <a href="#/lost-found" class="card" style="margin: 0; text-decoration: none; transition: transform 0.2s; display: block;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                 <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                     <div style="padding: 0.5rem; background: #fef3c7; border-radius: 8px; color: #d97706;">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <strong>Lost & Found</strong>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">View and report lost items.</p>
            </a>

            <!-- Messages -->
             <a href="#/messages" class="card" style="margin: 0; text-decoration: none; transition: transform 0.2s; display: block; position: relative;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                ${unreadCount > 0 ? `
                    <div style="position: absolute; top: -10px; right: -10px; background: var(--danger-color); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${unreadCount}
                    </div>
                ` : ''}
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <div style="padding: 0.5rem; background: #eef2ff; border-radius: 8px; color: #4f46e5;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <strong>Messages</strong>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Inbox from Admin.</p>
            </a>
        </div>
    `;
};
