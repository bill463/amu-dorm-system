import { login } from '../utils/auth.js';
import { showToast } from '../components/Toast.js';

export const render = `
<div style="display: flex; min-height: 100vh; background: var(--background-color);">
    <!-- Left Side - Visual Content -->
    <div style="flex: 1.2; position: relative; overflow: hidden; display: none;" class="desktop-only">
        <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(13, 148, 136, 0.95), rgba(15, 118, 110, 0.8)), url('/dorm-bg.jpg'); background-size: cover; background-position: center;"></div>
        <div style="position: relative; height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 5rem; color: white;">
            <div style="max-width: 600px;">
                <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 100px; font-weight: 700; font-size: 0.85rem; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.3);">
                    SECURE ACCESS
                </div>
                <h1 style="color: white; font-size: 4rem; margin-bottom: 1.5rem; letter-spacing: -0.04em; line-height: 1.1;">Connected Campus Life at <span style="color: #5eead4;">AMIT.</span></h1>
                <p style="font-size: 1.25rem; opacity: 0.9; line-height: 1.6; margin-bottom: 3rem;">Focus on your studies while we handle your dormitory logistics. Secure, efficient, and student-powered.</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 800;">Real-time</div>
                        <div style="opacity: 0.7; font-size: 0.9rem;">Automated Allocations</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 800;">24/7</div>
                        <div style="opacity: 0.7; font-size: 0.9rem;">Admin Support Line</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Right Side - Login Form -->
    <div style="flex: 0.8; display: flex; align-items: center; justify-content: center; padding: 2rem;">
        <div class="card" style="width: 100%; max-width: 480px; padding: 3rem; box-shadow: var(--shadow-xl); border-radius: 24px;">
            
            <div style="text-align: center; margin-bottom: 3rem;">
                <a href="#/" style="display: inline-block; margin-bottom: 1.5rem;">
                    <img src="/amu-logo.png" alt="AMU Logo" style="width: 80px; height: 80px; object-fit: contain;">
                </a>
                <h1 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 2.25rem; letter-spacing: -0.03em;">Welcome Back</h1>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">Sign in to the student portal</p>
            </div>
            
            <form id="login-form">
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.75rem; font-weight: 700; font-size: 0.9rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em;">User ID</label>
                    <input type="text" id="login-id" required placeholder="Student ID (NSR/NCSR...)" 
                        style="padding: 1rem 1.25rem; font-size: 1rem;">
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em;">Password</label>
                    </div>
                    <input type="password" id="login-password" required placeholder="••••••••"
                        style="padding: 1rem 1.25rem; font-size: 1rem;">
                </div>
                
                <button type="submit" id="login-submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 12px;">Sign In to Dashboard</button>
            </form>
            
            <div style="text-align: center; margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Don't have an account yet?</p>
                <a href="#/register" class="btn btn-outline" style="width: 100%; border-radius: 12px; font-weight: 700;">Create Student Account</a>
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
    const user = JSON.parse(localStorage.getItem('amu_dorm_user'));
    if (user) {
        window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
        return;
    }

    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('login-id').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('login-submit');

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="skeleton" style="width: 20px; height: 20px; border-radius: 50%; display: inline-block;"></span> Validating...';

            const result = await login(id, password);

            if (result.success) {
                showToast('Welcome back, ' + result.user.name, 'success');
                setTimeout(() => {
                    window.location.hash = result.user.role === 'admin' ? '#/admin' : '#/dashboard';
                }, 1000);
            } else {
                showToast(result.message || 'Authentication failed', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
};
