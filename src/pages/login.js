import { login } from '../utils/auth.js';
import { showToast } from '../components/Toast.js';

export const render = `
<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 2rem; position: relative; overflow: hidden;">
    <!-- Decorative background elements -->
    <div style="position: absolute; top: -10%; right: -5%; width: 40%; height: 60%; background: radial-gradient(circle, rgba(20, 184, 166, 0.05) 0%, transparent 70%);"></div>
    <div style="position: absolute; bottom: -10%; left: -5%; width: 40%; height: 60%; background: radial-gradient(circle, rgba(20, 184, 166, 0.05) 0%, transparent 70%);"></div>

    <div style="width: 100%; max-width: 440px; position: relative; z-index: 2; animation: fadeIn 0.6s ease-out;">
        <div style="text-align: center; margin-bottom: 3rem;">
            <a href="#/" style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: white; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); margin-bottom: 2rem; border: 1px solid #f1f5f9; transition: all 0.3s ease;" class="logo-hover">
                <img src="/amu-logo.png" alt="AMU Logo" style="width: 50px; height: 50px; object-fit: contain;">
            </a>
            <h1 style="color: #0f172a; font-size: 2.5rem; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 0.5rem;">Welcome Back</h1>
            <p style="color: #64748b; font-size: 1.1rem; font-weight: 500;">Secure access to your residence portal</p>
        </div>

        <div style="background: white; padding: 2.5rem; border-radius: 32px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);">
            <form id="login-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.6rem; font-weight: 700; font-size: 0.85rem; color: #334155; text-transform: uppercase; letter-spacing: 0.025em;">User ID</label>
                    <input type="text" id="login-id" required placeholder="Student ID or 'admin'" 
                        style="width: 100%; padding: 0.9rem 1.25rem; border-radius: 14px; border: 2px solid #f1f5f9; font-size: 1rem; font-weight: 500; transition: all 0.2s; background: #f8fafc;">
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.6rem;">
                        <label style="font-weight: 700; font-size: 0.85rem; color: #334155; text-transform: uppercase; letter-spacing: 0.025em;">Password</label>
                        <a href="#/register" style="color: #14b8a6; font-size: 0.85rem; font-weight: 700; text-decoration: none;">Forgot?</a>
                    </div>
                    <input type="password" id="login-password" required placeholder="••••••••"
                        style="width: 100%; padding: 0.9rem 1.25rem; border-radius: 14px; border: 2px solid #f1f5f9; font-size: 1rem; font-weight: 500; transition: all 0.2s; background: #f8fafc;">
                </div>
                
                <button type="submit" id="login-submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 14px; background: #14b8a6; font-weight: 800; color: white; margin-top: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 15px -3px rgba(20, 184, 166, 0.3); border: none;">
                    Sign In
                </button>
            </form>
            
            <div style="text-align: center; margin-top: 2rem; border-top: 1px solid #f1f5f9; padding-top: 1.5rem;">
                <p style="color: #64748b; font-size: 1rem; font-weight: 500;">
                    New student? <a href="#/register" style="color: #14b8a6; font-weight: 800; text-decoration: none;">Create Account</a>
                </p>
            </div>
        </div>
    </div>
</div>

<style>
    input:focus { border-color: #f1f5f9 !important; background: white !important; outline: none; }
    .logo-hover:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
            submitBtn.innerHTML = '<span style="display: inline-flex; align-items: center; gap: 0.5rem;"><svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg> Authenticating...</span>';

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

