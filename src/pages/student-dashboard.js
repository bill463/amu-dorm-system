import { getUser } from '../utils/auth.js';
import { getStudentRoom, getRequests, initData } from '../utils/data.js';
import { apiCall } from '../utils/api.js';

export const render = `
<div class="container" style="padding-bottom: 4rem; max-width: 1200px; margin: 0 auto;">
    <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; gap: 1rem; flex-wrap: wrap;">
        <div class="welcome-section" style="flex: 1; min-width: 200px;">
            <h1 id="welcome-title" style="margin-bottom: 0.25rem; font-size: 2.5rem; letter-spacing: -0.02em;">Welcome, Student</h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">Manage your dormitory life with ease.</p>
        </div>
        <div class="header-date" style="text-align: right; min-width: 120px;">
            <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary); line-height: 1;">
                ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
        </div>
    </div>
    <style>
        @media (max-width: 768px) {
            .dashboard-header {
                flex-direction: column-reverse !important;
                align-items: flex-start !important;
                gap: 1rem !important;
                margin-bottom: 2rem !important;
            }
            .header-date {
                text-align: left !important;
                margin-bottom: 0.5rem !important;
            }
            .welcome-section h1 {
                font-size: 2rem !important;
            }
        }
    </style>
    
    <div id="student-content">
        <!-- Skeleton Loaders -->
        <div style="margin-bottom: 2rem; height: 100px; border-radius: var(--border-radius);" class="skeleton"></div>
        <div class="grid grid-2" style="margin-bottom: 2.5rem;">
            <div style="height: 350px; border-radius: var(--border-radius);" class="skeleton"></div>
            <div style="height: 350px; border-radius: var(--border-radius);" class="skeleton"></div>
        </div>
        <div class="grid grid-3">
            <div style="height: 120px; border-radius: var(--border-radius);" class="skeleton"></div>
            <div style="height: 120px; border-radius: var(--border-radius);" class="skeleton"></div>
            <div style="height: 120px; border-radius: var(--border-radius);" class="skeleton"></div>
        </div>
    </div>
</div>
`;

export const init = async () => {
    const user = getUser();
    if (!user) return;

    // Personalize title
    const welcomeTitle = document.getElementById('welcome-title');
    if (welcomeTitle) {
        const firstName = user.name.split(' ')[0];
        const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        welcomeTitle.textContent = `Welcome, ${capitalized}`;
    }

    try {
        await initData();

        // Fetch room, requests, and latest message
        const [room, requests, messagesRes] = await Promise.all([
            getStudentRoom(user.id),
            getRequests(user.id),
            apiCall(`/api/messages?userId=${user.id}`).catch(() => [])
        ]);

        const latestMessage = messagesRes[0];
        const unreadCount = messagesRes.filter(m => !m.isRead).length;
        const container = document.getElementById('student-content');

        if (!container) return;

        const pendingCount = requests.filter(r => r.status === 'Pending').length;
        const completedCount = requests.filter(r => r.status === 'Completed').length;

        container.innerHTML = `
            <!-- Broadcast Banner -->
            ${latestMessage ? `
                <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); border: none; color: white; display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 1.5rem; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);">
                    <div style="font-size: 1.5rem;">${(latestMessage.title || '').includes('Swap') ? '🤝' : '📢'}</div>
                    <div style="flex: 1; line-height: 1.6;">
                        <p style="margin: 0; font-size: 1.1rem; font-weight: 600;">${latestMessage.title || 'Notification'}</p>
                        <p style="margin: 0; font-size: 1rem; font-weight: 400; opacity: 0.9;">${latestMessage.content}</p>
                    </div>
                    <a href="#/messages" class="btn btn-outline" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; font-size: 0.8rem; padding: 0.5rem 0.75rem;">Open Inbox</a>
                </div>
            ` : ''}

            <div class="grid grid-2" style="margin-bottom: 2.5rem;">
                <!-- My Room Card -->
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem;">
                            <h3 style="margin: 0; font-size: 1.5rem;">Dormitory Assignment</h3>
                            <div style="padding: 0.5rem; background: var(--primary-light); border-radius: 12px; color: var(--primary-dark);">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            </div>
                        </div>
                        
                        ${room ? `
                            <div style="display: flex; align-items: center; gap: 2rem;">
                                <div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Room Number</div>
                                    <div style="font-size: 3.5rem; font-weight: 800; color: var(--primary-color); line-height: 1;">${room.number}</div>
                                </div>
                                <div style="height: 50px; width: 2px; background: var(--border-color);"></div>
                                <div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Location</div>
                                    <div style="font-size: 1.5rem; font-weight: 700;">Block ${room.block.replace(/Block\s+/gi, '')}</div>
                                </div>
                            </div>
                            
                            <div style="margin-top: 2rem; padding: 1rem; background: var(--surface-hover); border-radius: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: var(--text-secondary); font-weight: 500;">Room Status</span>
                                    <span class="badge badge-success">Active</span>
                                </div>
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 2rem 0;">
                                <p style="font-weight: 700; color: var(--text-secondary);">Unallocated</p>
                            </div>
                        `}
                    </div>
                    
                    <a href="#/room" class="btn btn-primary" style="margin-top: 2rem; width: 100%;">View Room Details</a>
                </div>

                <!-- Maintenance Card -->
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem;">
                            <h3 style="margin: 0; font-size: 1.5rem;">Maintenance</h3>
                            <div style="padding: 0.5rem; background: #fef3c7; border-radius: 12px; color: #d97706;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div style="background: var(--surface-hover); padding: 1.25rem; border-radius: 12px; text-align: center;">
                                <div style="font-size: 2.25rem; font-weight: 800; color: var(--accent-color); line-height: 1;">${pendingCount}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; font-weight: 600;">Pending</div>
                            </div>
                            <div style="background: var(--surface-hover); padding: 1.25rem; border-radius: 12px; text-align: center;">
                                <div style="font-size: 2.25rem; font-weight: 800; color: var(--success-color); line-height: 1;">${completedCount}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; font-weight: 600;">Resolved</div>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem;">
                        <a href="#/maintenance" class="btn btn-outline" style="font-size: 0.9rem;">Report Issue</a>
                        <a href="#/lost-found" class="btn btn-outline" style="font-size: 0.9rem;">Lost Items</a>
                    </div>
                </div>
            </div>

            <!-- Quick Access Services -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                <h3 style="margin: 0;">Online Services</h3>
            </div>

            <div class="grid grid-3">
                <a href="#/messages" class="card" style="padding: 1.5rem; position: relative;">
                    ${unreadCount > 0 ? `
                        <div style="position: absolute; top: -8px; right: -8px; background: var(--danger-color); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; border: 3px solid var(--surface-color);">
                            ${unreadCount}
                        </div>
                    ` : ''}
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 44px; height: 44px; background: #e0e7ff; color: #4338ca; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </div>
                        <div>
                            <div style="font-weight: 700; font-size: 1.1rem;">Messages</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">Inbox & Notifications</div>
                        </div>
                    </div>
                </a>

                <a href="#/dorm-change" class="card" style="padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 44px; height: 44px; background: #f0fdf4; color: #15803d; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                        </div>
                        <div>
                            <div style="font-weight: 700; font-size: 1.1rem;">Dorm Swap</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">Request room change</div>
                        </div>
                    </div>
                </a>

                <a href="#/clearance" class="card" style="padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 44px; height: 44px; background: #fee2e2; color: #dc2626; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div>
                            <div style="font-weight: 700; font-size: 1.1rem;">Clearance</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">End of Semester checkout</div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    } catch (err) {
        console.error("Dashboard Load Error:", err);
        const container = document.getElementById('student-content');
        if (container) container.innerHTML = '<div class="card" style="text-align:center; color: var(--danger-color);">Failed to load dashboard data. Please try again.</div>';
    }
};
