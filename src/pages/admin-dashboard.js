import { getAllRooms, getAllStudents, getRequests, updateRequestStatus, assignRoom } from '../utils/data.js';
import { apiCall } from '../utils/api.js';
import { getUser } from '../utils/auth.js';
import { showToast } from '../components/Toast.js';

export const render = `
<div class="container">
    <div class="admin-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
            <h1 style="margin-bottom: 0.5rem;">Admin Dashboard</h1>
            <p style="color: var(--text-secondary);">Manage students, rooms, and requests</p>
        </div>
        <div class="admin-date" style="font-size: 0.9rem; color: var(--text-secondary);">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>
    
    <div id="admin-stats" class="grid grid-3" style="margin-bottom: 2rem;">
        <div class="card skeleton" style="height: 100px; margin: 0;"></div>
        <div class="card skeleton" style="height: 100px; margin: 0;"></div>
        <div class="card skeleton" style="height: 100px; margin: 0;"></div>
    </div>

    <div class="card" style="padding: 0; overflow: hidden; border: none; box-shadow: var(--shadow-md);">
        <div class="admin-tabs-container" style="display: flex; border-bottom: 1px solid var(--border-color); background: #ffffff; padding: 0 1rem; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch;">
            <button class="tab-btn active" onclick="switchTab('rooms')" style="flex: 0 0 auto;">Rooms</button>
            <button class="tab-btn" onclick="switchTab('students')" style="flex: 0 0 auto;">Students</button>
            <button class="tab-btn" onclick="switchTab('maintenance')" style="flex: 0 0 auto;">Maintenance</button>
            <button class="tab-btn" onclick="switchTab('clearance')" style="flex: 0 0 auto;">Clearance</button>
            <button class="tab-btn" onclick="switchTab('lostItems')" style="flex: 0 0 auto;">Lost & Found</button>
            <button class="tab-btn" onclick="switchTab('dormChange')" style="flex: 0 0 auto;">Dorm Change</button>
            <button class="tab-btn" onclick="switchTab('allocate')" style="flex: 0 0 auto; color: var(--primary-color); font-weight: 600;">⚡ Smart Allocate</button>
            <button class="tab-btn" onclick="switchTab('broadcast')" style="flex: 0 0 auto;">📢 Broadcast</button>
            <button class="tab-btn" onclick="switchTab('analytics')" style="flex: 0 0 auto;">📈 Analytics</button>
            <button class="tab-btn" onclick="switchTab('audit')" style="flex: 0 0 auto;">📜 Audit Logs</button>
            <button class="tab-btn" onclick="switchTab('register')" style="flex: 0 0 auto;">Register</button>
        </div>
        
        <div id="tab-content" style="padding: 2rem; background: #fcfcfc; min-height: 400px; overflow-x: auto;">
            <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="height: 200px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="height: 100px;"></div>
        </div>
    </div>
</div>
<style>
    .admin-tabs-container::-webkit-scrollbar {
        height: 4px;
    }
    .admin-tabs-container::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 4px;
    }
    
    /* Mobile-friendly tables */
    @media (max-width: 768px) {
        #tab-content {
            padding: 1rem !important;
        }
        .card {
            padding: 1.25rem !important;
        }
        
        /* Hide date on very small screens */
        .admin-date {
            display: none !important;
        }
        
        /* Make header full width */
        .admin-header {
            flex-direction: column;
            align-items: flex-start !important;
        }
        
        /* Hide table on mobile, show card layout instead */
        table {
            display: none;
        }
        .mobile-card-list {
            display: block !important;
        }
    }
    
    @media (min-width: 769px) {
        .mobile-card-list {
            display: none !important;
        }
    }
</style>
`;

let currentTab = 'rooms';

const renderStats = (rooms, students, requests) => {
    const pendingRequests = requests.filter(r => r.status === 'Pending').length;
    const occupiedRooms = rooms.filter(r => (r.occupants || []).length > 0).length;
    const occupancyRate = Math.round((occupiedRooms / rooms.length) * 100) || 0;

    const statsHtml = `
        <div class="card" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0;">
            <div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;">Total Students</p>
                <p style="font-size: 2rem; font-weight: 700; color: var(--text-primary); line-height: 1.2;">${students.length}</p>
            </div>
            <div style="background: #e0f2fe; padding: 1rem; border-radius: 50%; color: #0284c7;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
        </div>
        <div class="card" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0;">
            <div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;">Occupancy Rate</p>
                <p style="font-size: 2rem; font-weight: 700; color: var(--text-primary); line-height: 1.2;">${occupancyRate}%</p>
                <span style="font-size: 0.8rem; color: var(--text-secondary);">${occupiedRooms} of ${rooms.length} rooms</span>
            </div>
            <div style="background: #dcfce7; padding: 1rem; border-radius: 50%; color: #16a34a;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
        </div>
        <div class="card" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0;">
            <div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;">Pending Requests</p>
                <p style="font-size: 2rem; font-weight: 700; color: ${pendingRequests > 0 ? 'var(--warning-color)' : 'var(--success-color)'}; line-height: 1.2;">${pendingRequests}</p>
                <span style="font-size: 0.8rem; color: var(--text-secondary);">Maintenance tasks</span>
            </div>
            <div style="background: #fef9c3; padding: 1rem; border-radius: 50%; color: #ca8a04;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            </div>
        </div>
    `;

    const statsContainer = document.getElementById('admin-stats');
    if (statsContainer) statsContainer.innerHTML = statsHtml;
};

const renderRoomsTab = (container, rooms) => {
    // Group by Block
    const blocks = {};
    rooms.forEach(r => {
        if (!blocks[r.block]) blocks[r.block] = [];
        blocks[r.block].push(r);
    });

    let html = '';
    for (const [block, blockRooms] of Object.entries(blocks)) {
        html += `
            <div style="margin-bottom: 2rem;">
                <h3 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    Block ${block}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;">
        `;
        blockRooms.forEach(r => {
            const occCount = (r.occupants || []).length;
            const isFull = occCount >= r.capacity;
            const color = isFull ? '#fff1f2' : '#f0fdf4';
            const borderColor = isFull ? '#fda4af' : '#86efac';
            const statusColor = isFull ? 'var(--danger-color)' : 'var(--success-color)';

            html += `
                <div style="background: ${color}; border: 1px solid ${borderColor}; padding: 1rem; border-radius: 8px; text-align: center; transition: transform 0.2s;">
                    <div style="font-weight: 700; font-size: 1.25rem; margin-bottom: 0.25rem;">${r.number}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Capacity: ${r.capacity}</div>
                    <div style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 99px; background: white; font-size: 0.75rem; font-weight: 600; color: ${statusColor}; border: 1px solid ${borderColor};">
                        ${occCount} / ${r.capacity}
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    }
    container.innerHTML = html;
};

const renderStudentsTab = (container, students) => {
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0;">Registered Students</h3>
            <div style="display: flex; gap: 0.75rem;">
                <button class="btn btn-outline" onclick="window.exportStudentsCSV()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export CSV
                </button>
                <button class="btn btn-primary" onclick="switchTab('register')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Student
                </button>
            </div>
        </div>
    `;

    if (students.length === 0) {
        html += `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <p>No students registered yet.</p>
            </div>`;
        container.innerHTML = html;
        return;
    }

    // Desktop table view
    html += `
    <div style="background: white; border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8fafc; text-align: left;">
                    <th style="padding: 1rem; border-bottom: 1px solid var(--border-color);">Student ID</th>
                    <th style="padding: 1rem; border-bottom: 1px solid var(--border-color);">Full Name</th>
                    <th style="padding: 1rem; border-bottom: 1px solid var(--border-color);">Department</th>
                    <th style="padding: 1rem; border-bottom: 1px solid var(--border-color);">Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    students.forEach(s => {
        html += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-family: monospace; font-weight: 500;">${s.id}</td>
                <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 32px; height: 32px; background: var(--primary-color); border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">
                            ${s.name.charAt(0).toUpperCase()}
                        </div>
                        ${s.name}
                    </div>
                </td>
                <td style="padding: 1rem; color: var(--text-secondary);">${s.department}</td>
                <td style="padding: 1rem;">
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="window.sendMessage('${s.id}', '${s.name}')">Message</button>
                        <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Remove</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';

    // Mobile card view
    html += '<div class="mobile-card-list" style="display: none;">';
    students.forEach(s => {
        html += `
            <div class="card" style="margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="width: 48px; height: 48px; background: var(--primary-color); border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold; flex-shrink: 0;">
                        ${s.name.charAt(0).toUpperCase()}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">${s.name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); font-family: monospace;">${s.id}</div>
                    </div>
                </div>
                <div style="padding: 0.75rem; background: var(--background-color); border-radius: 6px; margin-bottom: 1rem;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Department</div>
                    <div style="font-weight: 500;">${s.department}</div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" style="flex: 1; justify-content: center;" onclick="window.sendMessage('${s.id}', '${s.name}')">Message</button>
                    <button class="btn btn-danger" style="flex: 1; justify-content: center;">Remove</button>
                </div>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;

    // Expose sendMessage globally for the onclick handler
    window.sendMessage = async (studentId, studentName) => {
        const user = getUser();
        if (!user) {
            alert('You must be logged in to send messages.');
            return;
        }

        const message = prompt(`Send message to ${studentName}:`);
        if (message && message.trim()) {
            try {
                await apiCall('/api/messages', 'POST', {
                    senderId: user.id,
                    receiverId: studentId,
                    content: message
                });
                alert('Message sent successfully!');
            } catch (error) {
                alert('Failed to send message: ' + error.message);
            }
        }
    };
};

const renderMaintenanceTab = (container, requests) => {
    const sortedRequests = [...requests].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortedRequests.length === 0) {
        container.innerHTML = `<p class="text-secondary text-center p-4">No maintenance requests.</p>`;
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    sortedRequests.forEach(req => {
        const statusBadge = req.status === 'Pending'
            ? `<span class="badge badge-warning">Pending</span>`
            : `<span class="badge badge-success">Completed</span>`;

        html += `
            <div class="card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: start; margin-bottom: 0;">
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                    <div style="background: #f1f5f9; padding: 0.75rem; border-radius: 8px; color: var(--primary-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.25rem;">${req.category}</div>
                        <div style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.5rem;">${req.description}</div>
                        
                        ${req.image ? `
                            <div style="margin-bottom: 1rem; cursor: pointer;" onclick="window.open('${req.image}')">
                                <img src="${req.image}" style="max-width: 150px; border-radius: 8px; border: 1px solid var(--border-color);">
                            </div>
                        ` : ''}

                        <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary);">
                            <span>ID: ${req.studentId}</span>
                            <span>Requested: ${new Date(req.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="margin-bottom: 0.5rem;">${statusBadge}</div>
                    ${req.status === 'Pending'
                ? `<button class="btn btn-primary" onclick="window.resolveRequest('${req.id}')" style="font-size: 0.85rem;">Mark Resolved</button>`
                : ''
            }
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
};

const renderClearanceTab = (container, requests) => {
    if (requests.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center p-4">No clearance requests pending.</p>';
        return;
    }
    container.innerHTML = '<div class="grid grid-2">' + requests.map(req => `
        <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column;">
             <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <div>
                    <strong style="display: block; font-size: 1.1rem;">${req.User ? req.User.name : req.studentId}</strong>
                    <span style="font-size: 0.9rem; color: var(--text-secondary);">${req.User ? req.User.department : 'Unknown Dept'}</span>
                </div>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(req.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; flex: 1;">
                <p style="font-size: 0.95rem; color: var(--text-secondary);">Reason for clearance:</p>
                <p style="font-weight: 500;">${req.reason}</p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                <span class="badge ${req.status === 'Pending' ? 'badge-warning' : (req.status === 'Approved' ? 'badge-success' : 'badge-danger')}">${req.status}</span>
                
                ${req.status === 'Pending' ? `
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-success" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="window.updateClearance('${req.id}', 'Approved')">Approve</button>
                    <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="window.updateClearance('${req.id}', 'Rejected')">Reject</button>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('') + '</div>';
};

const renderLostItemsTab = (container, items) => {
    if (items.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center p-4">No lost items reported.</p>';
        return;
    }
    container.innerHTML = '<div class="grid grid-2">' + items.map(item => `
        <div class="card" style="margin-bottom: 0;">
            <div style="display: flex; gap: 1rem;">
                ${item.image
            ? `<img src="${item.image}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">`
            : '<div style="width: 100px; height: 100px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/></svg></div>'
        }
                <div style="flex: 1;">
                     <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong style="font-size: 1.1rem;">${item.itemName}</strong>
                        <span class="badge ${item.status === 'Lost' ? 'badge-danger' : (item.status === 'Found' ? 'badge-success' : 'badge-info')}">${item.status}</span>
                    </div>
                    <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${item.description}</p>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        <span style="display: inline-block; margin-right: 1rem;">📍 ${item.location}</span>
                        <span>📅 ${item.dateLost}</span>
                    </div>
                    
                    ${item.status === 'Lost' ? `
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.85rem;" onclick="window.updateLostItem('${item.id}', 'Found')">Mark Found</button>
                        <button class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.85rem;" onclick="window.updateLostItem('${item.id}', 'Claimed')">Mark Claimed</button>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('') + '</div>';
};

const renderDormChangeTab = async (container, requests) => {
    // Fetch swaps separately
    const swaps = await apiCall('/api/swaps?isAdmin=true').catch(() => []);

    container.innerHTML = `
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; background: #f1f5f9; padding: 4px; border-radius: 10px; width: fit-content;">
            <button class="sub-tab active" id="btn-show-standard">🔄 Room Requests (${requests.length})</button>
            <button class="sub-tab" id="btn-show-swaps">🤝 Roommate Swaps (${swaps.length})</button>
        </div>
        
        <div id="standard-requests-view">
            ${requests.length === 0 ? '<p class="text-secondary text-center p-4">No standard requests.</p>' : requests.map(req => `
                <div class="card" style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                         <div>
                            <strong style="font-size: 1.1rem; display: block;">${req.User ? req.User.name : req.studentId}</strong>
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">From: ${req.Room ? `${req.Room.block} ${req.Room.number}` : 'N/A'}</span>
                         </div>
                         <span class="badge ${req.status === 'Pending' ? 'badge-warning' : (req.status === 'Approved' ? 'badge-success' : 'badge-danger')}">${req.status}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: #ffffff; border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px;">
                            <span style="display: block; font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Preferred Dorm</span>
                            <span style="font-weight: 600; font-size: 1.1rem;">${req.preferredDorm}</span>
                        </div>
                        <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 1rem; border-radius: 8px;">
                            <span style="display: block; font-size: 0.85rem; color: #9a3412; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Reason</span>
                            <span style="color: #9a3412;">${req.reason}</span>
                        </div>
                    </div>

                     ${req.status === 'Pending' ? `
                        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button class="btn btn-success" onclick="window.updateDormChange('${req.id}', 'Approved')">Approve Request</button>
                            <button class="btn btn-danger" onclick="window.updateDormChange('${req.id}', 'Rejected')">Reject</button>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        <div id="swap-requests-view" style="display: none;">
            ${swaps.length === 0 ? '<p class="text-secondary text-center p-4">No swap proposals.</p>' : swaps.map(s => `
                <div class="card" style="margin-bottom: 1rem; border-left: 4px solid var(--primary-color);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div style="display: flex; items: center; gap: 2rem;">
                            <div>
                                <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">From</span>
                                <div style="font-weight: 700;">${s.Sender?.name}</div>
                                <div style="font-size: 0.8rem; font-family: monospace;">Room: ${s.Sender?.roomId}</div>
                            </div>
                            <div style="display: flex; align-items: center; color: var(--primary-color); font-weight: 800; font-size: 1.5rem;">↔</div>
                            <div>
                                <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">To</span>
                                <div style="font-weight: 700;">${s.Receiver?.name}</div>
                                <div style="font-size: 0.8rem; font-family: monospace;">Room: ${s.Receiver?.roomId}</div>
                            </div>
                        </div>
                        <span class="badge ${s.status === 'Accepted' ? 'badge-success' : s.status === 'Approved' ? 'badge-info' : 'badge-warning'}">${s.status}</span>
                    </div>
                    ${s.status === 'Accepted' ? `
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                            <button class="btn btn-primary" onclick="window.approveSwap('${s.id}')">Finalize Swap</button>
                            <button class="btn btn-outline" onclick="window.updateSwapStatus('${s.id}', 'Rejected')">Deny</button>
                        </div>
                    ` : s.status === 'Pending' ? `<p style="font-size: 0.85rem; color: var(--text-secondary); text-align: right;">Waiting for students to agree...</p>` : ''}
                </div>
            `).join('')}
        </div>

        <style>
            .sub-tab { border: none; background: transparent; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); transition: all 0.2s; }
            .sub-tab.active { background: white; color: var(--primary-color); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        </style>
    `;

    // Add Tab switching logic
    const btnStd = document.getElementById('btn-show-standard');
    const btnSwp = document.getElementById('btn-show-swaps');
    const viewStd = document.getElementById('standard-requests-view');
    const viewSwp = document.getElementById('swap-requests-view');

    if (btnStd) {
        btnStd.onclick = () => {
            btnStd.classList.add('active'); btnSwp.classList.remove('active');
            viewStd.style.display = 'block'; viewSwp.style.display = 'none';
        };
        btnSwp.onclick = () => {
            btnSwp.classList.add('active'); btnStd.classList.remove('active');
            viewStd.style.display = 'none'; viewSwp.style.display = 'block';
        };
    }
};

const renderRegisterTab = (container, rooms) => {
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <button class="btn btn-outline" onclick="switchTab('students')" style="display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Students
            </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; align-items: start;" class="register-grid">
            <div>
                <h3 style="margin-bottom: 0.5rem;">Register New Student</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Add a new student and assign them a room immediately.</p>
                
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1.5rem; border-radius: 12px; color: #15803d;">
                    <h4 style="color: #15803d; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                        Tip
                    </h4>
                    <p style="font-size: 0.9rem;">Assigning a room during registration speeds up the student onboarding process.</p>
                </div>
            </div>

            <div class="card">
                <form id="admin-register-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div class="form-group">
                        <label>Student ID (e.g. NSR/1234/16)</label>
                        <input type="text" id="new-id" class="form-input" placeholder="Enter student ID" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="mobile-stack">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Full Name</label>
                            <input type="text" id="new-name" class="form-input" placeholder="Enter full name" required>
                        </div>
                         <div class="form-group" style="margin-bottom: 0;">
                            <label>Department</label>
                            <input type="text" id="new-dept" class="form-input" placeholder="e.g. Software Engineering" required>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="mobile-stack">
                         <div class="form-group" style="margin-bottom: 0;">
                            <label>Assign Room</label>
                            <select id="new-room" class="form-input" style="background: white;">
                                <option value="">-- No Room Assigned --</option>
                                ${Array.isArray(rooms) && rooms.length > 0 ? rooms.map(r => {
        const occCount = (r.occupants || []).length;
        const isFull = occCount >= r.capacity;
        return `<option value="${r.id}" ${isFull ? 'disabled' : ''}>
                                        Blk ${r.block} - Rm ${r.number} (${occCount}/${r.capacity})
                                    </option>`;
    }).join('') : '<option disabled>No rooms available</option>'}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Initial Password</label>
                            <input type="password" id="new-password" class="form-input" placeholder="Create a password" required>
                        </div>
                    </div>
                    
                    <div style="padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Register & Assign Room</button>
                    </div>
                </form>
            </div>
        </div>
        <style>
            @media (max-width: 900px) {
                .register-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
                .mobile-stack { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
            }
        </style>
    `;

    setTimeout(() => {
        const form = document.getElementById('admin-register-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await apiCall('/api/students', 'POST', {
                        id: document.getElementById('new-id').value,
                        name: document.getElementById('new-name').value,
                        department: document.getElementById('new-dept').value,
                        password: document.getElementById('new-password').value,
                        roomId: document.getElementById('new-room').value || null
                    });
                    showToast('Student registered successfully!', 'success');
                    form.reset();
                } catch (error) {
                    showToast(error.message, 'error');
                }
            });
        }
    }, 0);
};

const renderAllocateTab = (container, rooms, students) => {
    const unallocated = students.filter(s => !s.roomId && s.role !== 'admin');
    const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity - (r.occupants || []).length), 0);

    let selectedStrategies = [];

    const updateUI = () => {
        const orderDisplay = document.getElementById('priority-display');
        const runBtn = document.getElementById('run-allocation-btn');

        if (selectedStrategies.length > 0) {
            orderDisplay.innerHTML = `<strong>Priority:</strong> ${selectedStrategies.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' > ')}`;
            orderDisplay.style.display = 'block';
            runBtn.disabled = false;
        } else {
            orderDisplay.style.display = 'none';
            runBtn.disabled = true;
        }
    };

    container.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 2.5rem;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #f0fdf4; color: var(--primary-color); border-radius: 50%; margin-bottom: 1rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                </div>
                <h2>Advanced Room Allocation</h2>
                <p style="color: var(--text-secondary);">Combine multiple criteria to define the perfect allocation hierarchy.</p>
            </div>

            <div class="grid grid-2" style="margin-bottom: 2rem;">
                <div class="card" style="text-align: center; background: #f8fafc; margin: 0;">
                    <span style="display: block; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: 0.5rem;">Unallocated Students</span>
                    <span style="font-size: 2rem; font-weight: 700; color: ${unallocated.length > 0 ? 'var(--warning-color)' : 'var(--success-color)'};">${unallocated.length}</span>
                </div>
                <div class="card" style="text-align: center; background: #f8fafc; margin: 0;">
                    <span style="display: block; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: 0.5rem;">Available Slots</span>
                    <span style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${totalCapacity}</span>
                </div>
            </div>

            <div class="card" style="margin: 0;">
                <h3 style="margin-bottom: 0.5rem;">Select Criteria</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Click in the order you want them prioritized (e.g. Dept first, then Year).</p>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <label class="strategy-option" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 2px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                        <input type="checkbox" value="department" class="strat-check" style="width: 20px; height: 20px;">
                        <div>
                            <div style="font-weight: 600;">Department Grouping</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Students from different departments will not mix in rooms.</div>
                        </div>
                    </label>

                    <label class="strategy-option" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 2px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                        <input type="checkbox" value="year" class="strat-check" style="width: 20px; height: 20px;">
                        <div>
                            <div style="font-weight: 600;">Batch / Year</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Keep students of the same entry year together.</div>
                        </div>
                    </label>

                    <label class="strategy-option" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 2px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                        <input type="checkbox" value="alphabetical" class="strat-check" style="width: 20px; height: 20px;">
                        <div>
                            <div style="font-weight: 600;">Alphabetical Name</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Sort students by name within their groups.</div>
                        </div>
                    </label>
                </div>

                <div id="priority-display" style="margin-top: 1.5rem; padding: 0.75rem; background: var(--surface-hover); border-radius: 8px; font-size: 0.9rem; color: var(--primary-color); display: none;">
                    Priority: 
                </div>

                <div style="margin-top: 2rem;">
                    <button id="run-allocation-btn" class="btn btn-primary" style="width: 100%; height: 50px; font-size: 1.1rem; justify-content: center;" disabled>
                        Run Smart Allocation
                    </button>
                    ${unallocated.length === 0 ? '<p style="color: var(--success-color); text-align: center; margin-top: 1rem; font-size: 0.9rem;">✓ All students are currently allocated.</p>' : ''}
                </div>
            </div>
        </div>
        <style>
            .strategy-option:has(input:checked) { border-color: var(--primary-color) !important; background: #f0fdf4; }
            .strat-check { cursor: pointer; }
        </style>
    `;

    // Handle check logic
    document.querySelectorAll('.strat-check').forEach(check => {
        check.addEventListener('change', (e) => {
            const val = e.target.value;
            if (e.target.checked) {
                selectedStrategies.push(val);
            } else {
                selectedStrategies = selectedStrategies.filter(s => s !== val);
            }
            updateUI();
        });
    });

    document.getElementById('run-allocation-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('run-allocation-btn');

        if (!confirm(`Are you sure you want to allocate students using strictly: ${selectedStrategies.join(' > ')}?`)) return;

        try {
            btn.disabled = true;
            btn.textContent = 'Allocating...';

            const res = await apiCall('/api/students/auto-allocate', 'POST', { strategies: selectedStrategies });
            showToast(res.message, 'success');

            await updateTabContent();
        } catch (e) {
            showToast(e.message, 'error');
            btn.disabled = false;
            btn.textContent = 'Run Smart Allocation';
        }
    });
};

const renderBroadcastTab = (container, rooms, students) => {
    const departments = [...new Set(students.map(s => s.department).filter(Boolean))];
    const blocks = [...new Set(rooms.map(r => r.block).filter(Boolean))];

    container.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 style="margin-bottom: 0.5rem;">📢 Broadcast Announcement</h2>
                <p style="color: var(--text-secondary);">Send a message to a specific group or all students.</p>
            </div>

            <div class="card" style="margin: 0;">
                <form id="broadcast-form">
                    <div style="margin-bottom: 1.5rem;">
                        <label class="form-label">Title</label>
                        <input type="text" id="broadcast-title" class="form-input" placeholder="e.g. Water Shortage Alert" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <label class="form-label">Send To</label>
                            <select id="broadcast-target-type" class="form-input">
                                <option value="all">All Students</option>
                                <option value="block">Specific Block</option>
                                <option value="department">Specific Department</option>
                            </select>
                        </div>
                        <div id="target-value-container" style="display: none;">
                            <label class="form-label" id="target-value-label">Select Block</label>
                            <select id="broadcast-target-value" class="form-input"></select>
                        </div>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <label class="form-label">Message Content</label>
                        <textarea id="broadcast-content" class="form-input" style="min-height: 120px;" placeholder="Type your message here..." required></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; height: 45px;">
                        Send Broadcast
                    </button>
                </form>
            </div>
        </div>
    `;

    const targetType = document.getElementById('broadcast-target-type');
    const targetValContainer = document.getElementById('target-value-container');
    const targetValSelect = document.getElementById('broadcast-target-value');
    const targetValLabel = document.getElementById('target-value-label');

    targetType.addEventListener('change', () => {
        const type = targetType.value;
        if (type === 'all') {
            targetValContainer.style.display = 'none';
        } else {
            targetValContainer.style.display = 'block';
            targetValSelect.innerHTML = '';
            if (type === 'block') {
                targetValLabel.textContent = 'Select Block';
                blocks.forEach(b => {
                    const opt = document.createElement('option');
                    opt.value = b;
                    opt.textContent = `Block ${b}`;
                    targetValSelect.appendChild(opt);
                });
            } else if (type === 'department') {
                targetValLabel.textContent = 'Select Department';
                departments.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d;
                    opt.textContent = d;
                    targetValSelect.appendChild(opt);
                });
            }
        }
    });

    document.getElementById('broadcast-form').onsubmit = async (e) => {
        e.preventDefault();
        const user = getUser();
        const data = {
            senderId: user.id,
            targetType: targetType.value,
            targetValue: targetValSelect.value,
            title: document.getElementById('broadcast-title').value,
            content: document.getElementById('broadcast-content').value
        };

        if (!confirm(`Are you sure you want to send this broadcast to targeting "${data.targetType}: ${data.targetValue || 'All'}"?`)) return;

        try {
            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Sending...';

            const res = await apiCall('/api/messages/broadcast', 'POST', data);
            showToast(res.message, 'success');

            // Reset form
            e.target.reset();
            targetValContainer.style.display = 'none';
            btn.disabled = false;
            btn.textContent = 'Send Broadcast';
        } catch (err) {
            showToast(err.message, 'error');
            const btn = e.target.querySelector('button');
            btn.disabled = false;
            btn.textContent = 'Send Broadcast';
        }
    };
};

const renderAnalyticsTab = (container, rooms, students, requests) => {
    // 1. Occupancy by Block
    const blocks = [...new Set(rooms.map(r => r.block))].sort();
    const occupancyData = blocks.map(b => {
        const blockRooms = rooms.filter(r => r.block === b);
        const totalCap = blockRooms.reduce((acc, r) => acc + r.capacity, 0);
        const totalOcc = blockRooms.reduce((acc, r) => acc + (r.occupants?.length || 0), 0);
        return { block: b, rate: Math.round((totalOcc / totalCap) * 100) || 0 };
    });

    // 2. Request Distribution
    const pending = requests.filter(r => r.status === 'Pending').length;
    const completed = requests.filter(r => r.status === 'Completed').length;

    container.innerHTML = `
        <div class="grid grid-2" style="gap: 2rem;">
            <div class="card">
                <h3 style="margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                    Occupancy by Block
                </h3>
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    ${occupancyData.map(d => `
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                <span style="font-weight: 600;">Block ${d.block}</span>
                                <span style="color: var(--text-secondary);">${d.rate}%</span>
                            </div>
                            <div style="height: 10px; background: #eee; border-radius: 5px; overflow: hidden;">
                                <div style="height: 100%; width: ${d.rate}%; background: ${d.rate > 90 ? '#ef4444' : 'var(--primary-color)'}; transition: width 1s ease;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card" style="display: flex; flex-direction: column;">
                <h3 style="margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    Maintenance Overview
                </h3>
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1rem;">
                    <div style="font-size: 3rem; font-weight: 800; color: var(--primary-color);">${pending}</div>
                    <div style="color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; font-size: 0.8rem;">Active Issues</div>
                    <div style="width: 100%; max-width: 200px; height: 1px; background: #eee;"></div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--success-color);">${completed}</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">Resolved this Month</div>
                </div>
            </div>
        </div>
    `;
};

const renderAuditTab = (container, logs) => {
    container.innerHTML = `
        <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <h2>System Audit Logs</h2>
            <div style="background: var(--surface-hover); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; color: var(--text-secondary);">
                Total Events: ${logs.length}
            </div>
        </div>
        <div class="card" style="padding: 0; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
                    <tr>
                        <th style="padding: 1rem; text-align: left;">Action</th>
                        <th style="padding: 1rem; text-align: left;">Admin</th>
                        <th style="padding: 1rem; text-align: left;">Details</th>
                        <th style="padding: 1rem; text-align: left;">Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.length > 0 ? logs.map(l => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 1rem;">
                                <span class="badge" style="background: #eef2ff; color: #4f46e5;">${l.action}</span>
                            </td>
                            <td style="padding: 1rem; font-weight: 500;">${l.Admin?.name || l.adminId}</td>
                            <td style="padding: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                                ${typeof l.details === 'string' ? l.details : JSON.stringify(l.details)}
                            </td>
                            <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                                ${new Date(l.createdAt).toLocaleString()}
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--text-secondary);">No logs found.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
};

const updateTabContent = async () => {
    const container = document.getElementById('tab-content');
    if (!container) return;

    // Update active tab styling
    document.querySelectorAll('.tab-btn').forEach(btn => {
        // Special case for 'register' sub-view: highlight 'students' tab
        const tabToHighlight = currentTab === 'register' ? 'students' : currentTab;

        if (btn.getAttribute('onclick').includes(tabToHighlight)) {
            btn.classList.add('active');
            btn.style.borderBottom = '3px solid var(--primary-color)';
        } else {
            btn.classList.remove('active');
            btn.style.borderBottom = '3px solid transparent';
        }
    });

    try {
        const [rooms, students, requests] = await Promise.all([
            getAllRooms(),
            getAllStudents(),
            getRequests()
        ]);

        if (currentTab === 'rooms') renderRoomsTab(container, rooms);
        if (currentTab === 'students') renderStudentsTab(container, students);
        if (currentTab === 'maintenance') renderMaintenanceTab(container, requests);

        if (currentTab === 'clearance') {
            const data = await apiCall('/api/clearance');
            renderClearanceTab(container, data);
        }
        if (currentTab === 'lostItems') {
            const data = await apiCall('/api/lost-items');
            renderLostItemsTab(container, data);
        }
        if (currentTab === 'dormChange') {
            const data = await apiCall('/api/dorm-change');
            renderDormChangeTab(container, data);
        }
        if (currentTab === 'allocate') {
            renderAllocateTab(container, rooms, students);
        }
        if (currentTab === 'broadcast') {
            renderBroadcastTab(container, rooms, students);
        }
        if (currentTab === 'analytics') {
            renderAnalyticsTab(container, rooms, students, requests);
        }
        if (currentTab === 'audit') {
            const logs = await apiCall('/api/audit').catch(() => []);
            renderAuditTab(container, logs);
        }

        if (currentTab === 'register') {
            renderRegisterTab(container, rooms);
            return;
        }

        renderStats(rooms, students, requests);
    } catch (error) {
        console.error('Failed to load dashboard data', error);
        container.innerHTML = `<p style="color: red">Error loading data: ${error.message}</p>`;
    }
};

export const init = async () => {
    await updateTabContent();

    window.switchTab = (tab) => {
        currentTab = tab;
        updateTabContent();
    };

    window.resolveRequest = async (reqId) => {
        if (confirm('Mark this request as completed?')) {
            await updateRequestStatus(reqId, 'Completed');
            showToast('Maintenance issue resolved.', 'success');
            updateTabContent();
        }
    };

    window.approveSwap = async (id) => {
        if (!confirm('Finalize this room swap? Both students will be moved immediately.')) return;
        try {
            await apiCall(`/api/swaps/${id}`, 'PATCH', { status: 'Approved' });
            showToast('Swap finalized successfully!', 'success');
            updateTabContent();
        } catch (e) { showToast(e.message, 'error'); }
    };

    window.updateSwapStatus = async (id, status) => {
        if (!confirm(`Are you sure you want to ${status} this swap?`)) return;
        try {
            await apiCall(`/api/swaps/${id}`, 'PATCH', { status });
            updateTabContent();
        } catch (e) { showToast(e.message, 'error'); }
    };

    window.updateClearance = async (id, status) => {
        if (!confirm(`Are you sure you want to ${status} this request?`)) return;
        try {
            await apiCall(`/api/clearance/${id}`, 'PATCH', { status });
            updateTabContent();
        } catch (e) { showToast(e.message, 'error'); }
    };

    window.updateLostItem = async (id, status) => {
        try {
            await apiCall(`/api/lost-items/${id}`, 'PATCH', { status });
            updateTabContent();
        } catch (e) { showToast(e.message, 'error'); }
    };

    window.updateDormChange = async (id, status) => {
        if (!confirm(`Are you sure you want to ${status} this request?`)) return;
        try {
            await apiCall(`/api/dorm-change/${id}`, 'PATCH', { status });
            updateTabContent();
        } catch (e) { showToast(e.message, 'error'); }
    };

    window.exportStudentsCSV = async () => {
        try {
            const students = await getAllStudents();
            const headers = ['ID', 'Name', 'Department', 'Year', 'RoomID'];
            const rows = students.map(s => [s.id, s.name, s.department, s.year, s.roomId].join(','));
            const csvContent = [headers.join(','), ...rows].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `AMU_Students_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('CSV exported successfully!', 'success');
        } catch (e) { showToast('Export failed', 'error'); }
    };
};
