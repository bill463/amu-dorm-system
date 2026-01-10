import { login } from '../utils/auth.js';

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
                    <input type="text" id="login-id" required placeholder="e.g. RAM/1234 or admin" 
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
                
                <div id="login-error" style="
                    color: var(--danger-color); 
                    background: #fef2f2; 
                    padding: 0.75rem; 
                    border-radius: 8px; 
                    margin-bottom: 1.5rem; 
                    text-align: center; 
                    font-size: 0.9rem;
                    display: none;
                    border: 1px solid #fee2e2;
                "></div>

                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Sign In</button>
            </form>
            
            <div style="text-align: center; margin-top: 2rem;">
                <p style="color: var(--text-secondary); font-size: 0.95rem;">
                    Having trouble? Contact the System Administrator.
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
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('login-id').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');

            errorDiv.style.opacity = '0';

            const result = await login(id, password);
            if (result.success) {
                const user = JSON.parse(localStorage.getItem('amu_dorm_user'));
                if (user.role === 'admin') {
                    window.location.hash = '#/admin';
                } else {
                    window.location.hash = '#/dashboard';
                }
            } else {
                errorDiv.textContent = result.message;
                errorDiv.style.display = 'block';
                void errorDiv.offsetWidth;
                errorDiv.style.opacity = '1';
            }
        });
    }
};
