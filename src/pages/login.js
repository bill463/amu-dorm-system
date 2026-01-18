import { login } from '../utils/auth.js';
import { showToast } from '../components/Toast.js';

export const render = `
<div style="display: flex; min-height: 100vh; background: #f9fafb; align-items: center; justify-content: center; padding: 2rem;">
    <div style="width: 100%; max-width: 440px; text-align: center;">
        <!-- Logo -->
        <div style="margin-bottom: 2.5rem;">
            <img src="/amu-logo.png" alt="AMU Logo" style="width: 120px; height: 120px; object-fit: contain;">
        </div>

        <!-- Title -->
        <h1 style="color: #1f2937; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.02em;">Welcome Back</h1>
        <p style="color: #6b7280; font-size: 1.1rem; margin-bottom: 3rem;">Sign in to your account</p>

        <!-- Form Card -->
        <div class="card" style="padding: 0; background: transparent; border: none; box-shadow: none; text-align: left;">
            <form id="login-form">
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.95rem; color: #374151;">User ID</label>
                    <input type="text" id="login-id" required placeholder="e.g. RAM/1234 or admin" 
                        style="padding: 0.85rem 1rem; font-size: 1rem; border-radius: 10px; border: 1px solid #e5e7eb; background: white;">
                </div>
                
                <div style="margin-bottom: 2.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <label style="font-weight: 600; font-size: 0.95rem; color: #374151;">Password</label>
                        <a href="#" style="color: #0d9488; font-size: 0.9rem; font-weight: 500;">Forgot?</a>
                    </div>
                    <input type="password" id="login-password" required placeholder="Enter your password"
                        style="padding: 0.85rem 1rem; font-size: 1rem; border-radius: 10px; border: 1px solid #e5e7eb; background: white;">
                </div>
                
                <button type="submit" id="login-submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-size: 1.1rem; border-radius: 10px; background: #0d9488; font-weight: 600;">Sign In</button>
            </form>
        </div>
    </div>
</div>
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
            submitBtn.innerHTML = 'Signing in...';

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
