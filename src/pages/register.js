import { apiCall } from '../utils/api.js';
import { showToast } from '../components/Toast.js';

export const render = `
<div style="display: flex; min-height: 100vh; background: var(--background-color);">
    <!-- Right Side - Registration Form -->
    <div class="registration-container" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
        <div class="card registration-card" style="width: 100%; max-width: 540px; padding: 2.5rem; border-radius: 24px; box-shadow: var(--shadow-xl);">
            
            <div style="text-align: center; margin-bottom: 2rem;">
                <a href="#/" style="display: inline-block; margin-bottom: 1rem;">
                    <img src="/amu-logo.png" alt="AMU Logo" style="width: 60px; height: 60px; object-fit: contain;">
                </a>
                <h1 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.8rem; letter-spacing: -0.03em; font-weight: 800;">Join AMU Housing</h1>
                <p style="color: var(--text-secondary); font-size: 0.95rem;">Create your student profile today</p>
            </div>
            
            <form id="register-form">
                <div class="reg-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Student ID</label>
                        <input type="text" id="reg-id" required placeholder="NSR/1234/15" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Full Name</label>
                        <input type="text" id="reg-name" required placeholder="John Doe" style="width: 100%;">
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 1.25rem;">
                    <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Department</label>
                    <select id="reg-dept" required style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--border-color); background: #fff;">
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
                    <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Official Email</label>
                    <input type="email" id="reg-email" required placeholder="student@amu.edu.et" style="width: 100%;">
                </div>

                <div class="form-group" style="margin-bottom: 2rem;">
                    <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Password</label>
                    <input type="password" id="reg-password" required placeholder="••••••••" style="width: 100%;">
                </div>

                <button type="submit" id="btn-submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1rem; border-radius: 12px; font-weight: 700; background: var(--primary-color);">Complete Registration</button>
            </form>
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    Already have an account? <a href="#/login" style="color: var(--primary-color); font-weight: 700; text-decoration: none;">Sign In</a>
                </p>
            </div>
        </div>
    </div>

    <!-- Left Side - Info Overlay for Desktop -->
    <div style="flex: 1.2; position: relative; overflow: hidden; display: none;" class="desktop-only text-reveal">
        <div style="position: absolute; inset: 0; background: linear-gradient(rgba(13, 148, 136, 0.8), rgba(13, 148, 136, 0.9)), url('https://images.unsplash.com/photo-1541339907198-e08756ebafe1?q=80&w=2070&auto=format&fit=crop'); background-size: cover; background-position: center;"></div>
        <div style="position: relative; height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 5rem; color: white;">
            <h2 style="font-size: 3.5rem; margin-bottom: 2rem; color: white; letter-spacing: -0.04em; font-weight: 800; line-height: 1.1;">Secure Your <br>Placement.</h2>
            <div style="display: grid; gap: 2rem; max-width: 400px;">
                <div style="display: flex; gap: 1.25rem; align-items: start;">
                    <div style="font-size: 1.5rem; background: rgba(255,255,255,0.2); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">🏛️</div>
                    <div>
                        <h4 style="color: white; margin-bottom: 0.25rem; font-size: 1.1rem;">Official Registry</h4>
                        <p style="opacity: 0.8; font-size: 0.9rem; line-height: 1.5;">Register once to manage your entire housing journey at AMU.</p>
                    </div>
                </div>
                <div style="display: flex; gap: 1.25rem; align-items: start;">
                    <div style="font-size: 1.5rem; background: rgba(255,255,255,0.2); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">🛡️</div>
                    <div>
                        <h4 style="color: white; margin-bottom: 0.25rem; font-size: 1.1rem;">Safe & Secure</h4>
                        <p style="opacity: 0.8; font-size: 0.9rem; line-height: 1.5;">Your data is protected by industry-standard encryption protocols.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<style>
    @media (min-width: 1024px) {
        .desktop-only { display: block !important; }
        .registration-container { flex: 0.8 !important; }
    }
    @media (max-width: 600px) {
        .registration-card { padding: 1.5rem !important; }
        .reg-grid { grid-template-columns: 1fr !important; gap: 0.75rem !important; }
        h1 { font-size: 1.5rem !important; }
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
