import { login } from '../utils/auth.js';
import { showToast } from '../components/Toast.js';

export const render = `
<div style="display: flex; min-height: 100vh;">
    <!-- Left Side - Image/Brand -->
    <div style="
        flex: 1; 
        background-image: linear-gradient(rgba(13, 148, 136, 0.8), rgba(13, 148, 136, 0.6)), url('/dorm-bg.jpg'); 
        background-size: cover; 
        background-position: center; 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        padding: 4rem; 
        color: white;
        display: none; /* Hidden on mobile by default */
    " class="desktop-only">
        <h1 style="color: white; font-size: 3.5rem; margin-bottom: 1rem;">Arba Minch University</h1>
        <p style="font-size: 1.5rem; opacity: 0.9;">Excellence in Education. <br>Manage your dormitory life with ease.</p>
    </div>

    <!-- Right Side - Login Form -->
    <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: var(--background-color); padding: 2rem;">
        <div class="card" style="width: 100%; max-width: 440px; padding: 3rem; border: none; box-shadow: none; background: transparent;">
            
            <div style="text-align: center; margin-bottom: 2rem;">
                <img src="/amu-logo.png" alt="AMU Logo" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 1rem;">
                <h1 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 2rem;">Welcome Back</h1>
                <p style="color: var(--text-secondary);">Sign in to your account</p>
            </div>
            
            <form id="login-form">
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">User ID</label>
                    <input type="text" id="login-id" required placeholder="NSR, NSRT or NCSR" 
                        style="background: white; border-color: #e2e8f0;">
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <label style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">Password</label>
                        <a href="#" style="font-size: 0.85rem; color: var(--primary-color);">Forgot?</a>
                    </div>
                    <input type="password" id="login-password" required placeholder="Enter your password"
                        style="background: white; border-color: #e2e8f0;">
                </div>
                
                <button type="submit" id="login-submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Sign In</button>
            </form>
            
            <div style="text-align: center; margin-top: 2rem;">
                <p style="color: var(--text-secondary); font-size: 0.95rem;">
                    Having trouble? Contact the System Administrator.
                </p>
                <p style="margin-top: 1rem;">
                    <a href="#/register" style="color: var(--primary-color); font-weight: 500;">First time? Register here</a>
                </p>
            </div>
        </div>
    </div>
</div>
<style>
    @media (min-width: 768px) {
        .desktop-only { display: flex !important; }
    }
</style>
`;

export const init = () => {
    // Redirect if already logged in
    const user = JSON.parse(localStorage.getItem('amu_dorm_user'));
    if (user) {
        if (user.role === 'admin') {
            window.location.hash = '#/admin';
        } else {
            window.location.hash = '#/dashboard';
        }
        return;
    }

    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('login-id').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('login-submit');

            // Loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

            const result = await login(id, password);

            if (result.success) {
                showToast('Successfully logged in!', 'success');
                const user = JSON.parse(localStorage.getItem('amu_dorm_user'));

                setTimeout(() => {
                    if (user.role === 'admin') {
                        window.location.hash = '#/admin';
                    } else {
                        window.location.hash = '#/dashboard';
                    }
                }, 800);
            } else {
                showToast(result.message || 'Invalid credentials', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
};
