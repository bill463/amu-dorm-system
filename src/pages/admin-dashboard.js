import { getAllRooms, getAllStudents, getRequests, updateRequestStatus, assignRoom } from '../utils/data.js';
import { apiCall } from '../utils/api.js';
import { getUser } from '../utils/auth.js';

export const render = `
<div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
            <h1 style="margin-bottom: 0.5rem;">Admin Dashboard</h1>
            <p style="color: var(--text-secondary);">Manage students, rooms, and requests</p>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-secondary);">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>
    
    <div id="admin-stats" class="grid grid-3" style="margin-bottom: 2rem;">
        <div class="card skeleton" style="height: 100px; margin: 0;"></div>
        <div class="card skeleton" style="height: 100px; margin: 0;"></div>
        <div class="card skeleton" style="height: 100px; margin: 0;"></div>
    </div>

    <div class="card" style="padding: 0; overflow: hidden; border: none; box-shadow: var(--shadow-md);">
        <div style="display: flex; border-bottom: 1px solid var(--border-color); background: #ffffff; padding: 0 1rem; overflow-x: auto;">
            <button class="tab-btn active" onclick="switchTab('rooms')">Rooms</button>
            <button class="tab-btn" onclick="switchTab('students')">Students</button>
            <button class="tab-btn" onclick="switchTab('maintenance')">Maintenance</button>
            <button class="tab-btn" onclick="switchTab('clearance')">Clearance</button>
            <button class="tab-btn" onclick="switchTab('lostItems')">Lost & Found</button>
            <button class="tab-btn" onclick="switchTab('dormChange')">Dorm Change</button>
        </div>
        
        <div id="tab-content" style="padding: 2rem; background: #fcfcfc; min-height: 400px;">
            <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="height: 200px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="height: 100px;"></div>
        </div>
    </div>
</div>
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
            <a href="#/add-student" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Student
            </a>
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
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <p>No maintenance requests found.</p>
            </div>`;
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    sortedRequests.forEach(req => {
        const statusBadge = req.status === 'Pending'
            ? `<span class="badge badge-warning">Pending</span>`
            : `<span class="badge badge-success">Completed</span>`;

        html += `
            <div class="card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0;">
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                    <div style="background: #f1f5f9; padding: 0.75rem; border-radius: 8px; color: var(--text-secondary);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.25rem;">${req.category}</div>
                        <div style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.5rem;">${req.description}</div>
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

const renderDormChangeTab = (container, requests) => {
    if (requests.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center p-4">No dorm change requests.</p>';
        return;
    }
    container.innerHTML = requests.map(req => `
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
    `).join('');
};

const renderRegisterTab = (container) => {
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <button class="btn btn-outline" onclick="switchTab('students')" style="display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Students
            </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; align-items: start;">
            <div>
                <h3 style="margin-bottom: 0.5rem;">Register New Student</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Manually add a new student to the system. They will be able to log in immediately.</p>
                
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1.5rem; border-radius: 12px; color: #15803d;">
                    <h4 style="color: #15803d; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                        Tip
                    </h4>
                    <p style="font-size: 0.9rem;">Default passwords should be changed by the student upon first login.</p>
                </div>
            </div>

            <div class="card">
                <form id="admin-register-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div class="form-group">
                        <label>Student ID (e.g. NSR/1234/16)</label>
                        <input type="text" id="new-id" class="form-input" placeholder="Enter student ID" required>
                    </div>
                    <div class="grid grid-2">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Full Name</label>
                            <input type="text" id="new-name" class="form-input" placeholder="Enter full name" required>
                        </div>
                         <div class="form-group" style="margin-bottom: 0;">
                            <label>Department</label>
                            <input type="text" id="new-dept" class="form-input" placeholder="e.g. Software Engineering" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Initial Password</label>
                        <input type="password" id="new-password" class="form-input" placeholder="Create a strong password" required>
                    </div>
                    
                    <div style="padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
                        <button type="submit" class="btn btn-primary">Create Account</button>
                    </div>
                </form>
            </div>
        </div>
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
                        password: document.getElementById('new-password').value
                    });
                    alert('Student registered successfully!');
                    form.reset();
                    // Optional: Switch back to students list
                    // switchTab('students');
                } catch (error) {
                    alert(error.message);
                }
            });
        }
    }, 0);
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

        if (currentTab === 'register') {
            renderRegisterTab(container);
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
            updateTabContent();
        }
    };

    window.updateClearance = async (id, status) => {
        if (!confirm(`Are you sure you want to ${status} this request?`)) return;
        try {
            await apiCall(`/api/clearance/${id}`, 'PATCH', { status });
            updateTabContent();
        } catch (e) { alert(e.message); }
    };

    window.updateLostItem = async (id, status) => {
        try {
            await apiCall(`/api/lost-items/${id}`, 'PATCH', { status });
            updateTabContent();
        } catch (e) { alert(e.message); }
    };

    window.updateDormChange = async (id, status) => {
        if (!confirm(`Are you sure you want to ${status} this request?`)) return;
        try {
            await apiCall(`/api/dorm-change/${id}`, 'PATCH', { status });
            updateTabContent();
        } catch (e) { alert(e.message); }
    };
};
