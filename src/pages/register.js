import { apiCall } from '../utils/api.js';
import { showToast } from '../components/Toast.js';

export const render = `
<div style="display: flex; min-height: 100vh; background: var(--background-color);">
    <!-- Right Side - Registration Form -->
    <div style="flex: 0.8; display: flex; align-items: center; justify-content: center; padding: 2rem;">
        <div class="card" style="width: 100%; max-width: 540px; padding: 3rem; border-radius: 24px;">
            
            <div style="text-align: center; margin-bottom: 2.5rem;">
                <a href="#/" style="display: inline-block; margin-bottom: 1rem;">
                    <img src="/amu-logo.png" alt="AMU Logo" style="width: 64px; height: 64px; object-fit: contain;">
                </a>
                <h1 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 2rem; letter-spacing: -0.03em;">Create Student Account</h1>
                <p style="color: var(--text-secondary); font-size: 1rem;">Register to access the dormitory portal</p>
            </div>
            
            <form id="register-form">
                <div class="grid grid-2" style="margin-bottom: 1.25rem;">
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Student ID</label>
                        <input type="text" id="reg-id" required placeholder="NSR/1234/15">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Full Name</label>
                        <input type="text" id="reg-name" required placeholder="Abebe Kebede">
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 1.25rem;">
                    <label style="font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Department</label>
                    <select id="reg-dept" required>
                        <option value="">Select Department</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Surveying Engineering">Surveying Engineering</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electrical & Computer Engineering">Electrical & Computer Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                </div>

                <div class="form-group" style="margin-bottom: 1.25rem;">
                    <label style="font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Official AMU Email</label>
                    <input type="email" id="reg-email" required placeholder="student_id@amu.edu.et">
                </div>

                <div class="form-group" style="margin-bottom: 2rem;">
                    <label style="font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Set Password</label>
                    <input type="password" id="reg-password" required placeholder="••••••••">
                </div>

                <button type="submit" id="btn-submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 12px;">Complete Registration</button>
            </form>
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                <p style="color: var(--text-secondary);">
                    Already registered? <a href="#/login" style="color: var(--primary-color); font-weight: 700;">Sign In Instead</a>
                </p>
            </div>
        </div>
    </div>

    <!-- Left Side - Info -->
    <div style="flex: 1.2; position: relative; overflow: hidden; display: none;" class="desktop-only">
        <div style="position: absolute; inset: 0; background: linear-gradient(225deg, rgba(13, 148, 136, 0.9), rgba(15, 118, 110, 1)), url('/dorm-bg.jpg'); background-size: cover; background-position: center;"></div>
        <div style="position: relative; height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 5rem; color: white;">
            <h2 style="font-size: 3rem; margin-bottom: 2rem; color: white; letter-spacing: -0.03em;">Digital Residence Management.</h2>
            <div style="display: grid; gap: 2rem;">
                <div style="display: flex; gap: 1rem; align-items: start;">
                    <div style="font-size: 1.5rem;">🏛️</div>
                    <div>
                        <h4 style="color: white; margin-bottom: 0.25rem;">Official Portal</h4>
                        <p style="opacity: 0.8;">The only official way to manage your dormitory stay and requests.</p>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: start;">
                    <div style="font-size: 1.5rem;">🛡️</div>
                    <div>
                        <h4 style="color: white; margin-bottom: 0.25rem;">Discipline & Security</h4>
                        <p style="opacity: 0.8;">Integrated reporting system for a safer campus environment.</p>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: start;">
                    <div style="font-size: 1.5rem;">⚡</div>
                    <div>
                        <h4 style="color: white; margin-bottom: 0.25rem;">Instant Notifications</h4>
                        <p style="opacity: 0.8;">Get informed about your requests and announcements in real-time.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<style>
    @media (min-width: 1024px) {
        .desktop-only { display: block !important; }
    }
</style>
`;

export const init = () => {
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit');
            const originalText = btn.innerText;

            const id = document.getElementById('reg-id').value.trim();
            const name = document.getElementById('reg-name').value.trim();
            const dept = document.getElementById('reg-dept').value;
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;

            btn.disabled = true;
            btn.innerHTML = 'Creating Account...';

            try {
                const result = await apiCall('/auth/register', 'POST', { id, name, department: dept, email, password });
                if (result.success) {
                    showToast('Registration Successful! Redirecting...', 'success');
                    setTimeout(() => window.location.hash = '#/login', 1500);
                } else {
                    showToast(result.message || 'Registration failed', 'error');
                    btn.disabled = false;
                    btn.innerText = originalText;
                }
            } catch (error) {
                showToast('Registration Error: ' + error.message, 'error');
                btn.disabled = false;
                btn.innerText = originalText;
            }
        });
    }
};
