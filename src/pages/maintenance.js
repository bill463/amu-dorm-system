import { getUser } from '../utils/auth.js';
import { createRequest, getRequests } from '../utils/data.js';

export const render = `
<div class="container">
    <h1 style="margin-bottom: 1.5rem;">Maintenance Requests</h1>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
        <!-- New Request Form -->
        <div class="card">
            <h3 style="margin-bottom: 1rem;">Report an Issue</h3>
            <form id="maintenance-form">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Issue Category</label>
                    <select id="maint-category" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: var(--border-radius); background: white;">
                        <option value="">Select Category</option>
                        <option value="Electrical">Electrical (Lights, Sockets)</option>
                        <option value="Plumbing">Plumbing (Water, Leakage)</option>
                        <option value="Furniture">Furniture (Bed, Locker, Table)</option>
                        <option value="Cleaning">Cleaning / Hygiene</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description</label>
                    <textarea id="maint-desc" required rows="4" 
                        style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: var(--border-radius); font-family: inherit;"
                        placeholder="Describe the issue in detail..."></textarea>
                </div>

                <div id="maint-success" style="color: var(--success-color); margin-bottom: 1rem; display: none;">Request submitted successfully!</div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Request</button>
            </form>
        </div>

        <!-- History List -->
        <div>
            <h3 style="margin-bottom: 1rem;">My Requests</h3>
            <div id="request-history">
                <!-- Items will be injected here -->
                <p>Loading...</p>
            </div>
        </div>
    </div>
</div>
`;

export const init = async () => {
    const user = getUser();
    const form = document.getElementById('maintenance-form');
    const historyContainer = document.getElementById('request-history');

    const renderHistory = async () => {
        try {
            const requests = await getRequests(user.id);
            const sortedRequests = requests.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (sortedRequests.length === 0) {
                historyContainer.innerHTML = '<p style="color: var(--text-secondary);">No previous requests found.</p>';
                return;
            }

            historyContainer.innerHTML = sortedRequests.map(req => `
            <div class="card" style="margin-bottom: 1rem; padding: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="font-weight: bold; color: var(--primary-color);">${req.category}</span>
                    <span style="font-size: 0.8rem; background: ${req.status === 'Pending' ? '#fff3e0' : '#e8f5e9'}; color: ${req.status === 'Pending' ? '#f57c00' : '#2e7d32'}; padding: 2px 8px; border-radius: 4px;">
                        ${req.status}
                    </span>
                </div>
                <p style="margin-bottom: 0.5rem;">${req.description}</p>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">
                    ${new Date(req.date).toLocaleDateString()}
                </div>
            </div>
        `).join('');
        } catch (e) {
            historyContainer.innerHTML = '<p style="color: red;">Failed to load history.</p>';
        }
    };

    await renderHistory();

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const category = document.getElementById('maint-category').value;
            const desc = document.getElementById('maint-desc').value;

            await createRequest(user.id, category, desc);

            const successDiv = document.getElementById('maint-success');
            successDiv.style.display = 'block';
            form.reset();

            await renderHistory();

            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        });
    }
};
