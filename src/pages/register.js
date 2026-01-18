import { apiCall } from '../utils/api.js';
import { showToast } from '../components/Toast.js';

export const render = `
<div style="display: flex; min-height: 100vh; background: #ffffff;">
    <!-- Left Side - Portal Features -->
    <div class="desktop-only" style="flex: 1.25; position: relative; overflow: hidden; background: #000;">
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%), url('/dorm-bg.jpg'); background-size: cover; background-position: center;"></div>
        
        <div style="position: relative; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; padding: 2.5rem 2rem; z-index: 2; color: white;">
            <!-- Main Content Lowered Even More -->
            <div style="width: 100%; animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);">
                <!-- University Badge -->
                <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 0.4rem 0.9rem; border-radius: 100px; display: inline-flex; align-items: center; gap: 0.5rem; border: 1px solid rgba(255,255,255,0.2); margin-bottom: 2rem;">
                    <img src="/amu-logo.png" style="width: 16px; height: 16px;">
                    <span style="font-weight: 700; font-size: 0.65rem; letter-spacing: 0.05em; text-transform: uppercase;">Arba Minch University</span>
                </div>

                <h2 style="font-size: 3rem; font-weight: 900; line-height: 1.1; letter-spacing: -0.04em; margin-bottom: 2rem;">
                    Digitalize<br>Your <span style="color: #14b8a6;">Residence</span>.
                </h2>
                
                <!-- Functionalities as Inline Cards at the very Bottom -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 1rem;">
                    <div style="background: rgba(255,255,255,0.06); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1rem; transition: all 0.3s ease;">
                        <div style="color: #14b8a6; font-size: 1.1rem; margin-bottom: 0.5rem;">✓</div>
                        <h4 style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.25rem; color: white; line-height: 1.3;">Allocation Status</h4>
                        <p style="font-size: 0.75rem; opacity: 0.7; line-height: 1.4; margin: 0;">Real-time room status updates.</p>
                    </div>

                    <div style="background: rgba(255,255,255,0.06); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1rem; transition: all 0.3s ease;">
                        <div style="color: #14b8a6; font-size: 1.1rem; margin-bottom: 0.5rem;">✓</div>
                        <h4 style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.25rem; color: white; line-height: 1.3;">Maintenance</h4>
                        <p style="font-size: 0.75rem; opacity: 0.7; line-height: 1.4; margin: 0;">Track requests instantly.</p>
                    </div>

                    <div style="background: rgba(255,255,255,0.06); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1rem; transition: all 0.3s ease;">
                        <div style="color: #14b8a6; font-size: 1.1rem; margin-bottom: 0.5rem;">✓</div>
                        <h4 style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.25rem; color: white; line-height: 1.3;">Direct Comms</h4>
                        <p style="font-size: 0.75rem; opacity: 0.7; line-height: 1.4; margin: 0;">Instant admin messaging.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Right Side - Registration Form -->
    <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #fefefe;">
        <div style="width: 100%; max-width: 440px; animation: fadeIn 0.8s ease-out;">
            <div style="margin-bottom: 2.5rem; text-align: center;">
                <h1 style="font-size: 2.25rem; font-weight: 900; color: #0f172a; letter-spacing: -0.04em; margin-bottom: 0.5rem;">Create Account</h1>
                <p style="color: #64748b; font-size: 1.1rem; font-weight: 500;">Fill in your details to get started.</p>
            </div>

            <form id="register-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.025em;">Student ID</label>
                        <input type="text" id="reg-id" required placeholder="NSR/..." 
                            style="width: 100%; padding: 0.75rem 1rem; border-radius: 12px; border: 2px solid #f1f5f9; font-weight: 500; transition: all 0.2s; background: #f8fafc;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.025em;">Full Name</label>
                        <input type="text" id="reg-name" required placeholder="Name" 
                            style="width: 100%; padding: 0.75rem 1rem; border-radius: 12px; border: 2px solid #f1f5f9; font-weight: 500; transition: all 0.2s; background: #f8fafc;">
                    </div>
                </div>

                <div>
                    <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.025em;">Department</label>
                    <select id="reg-dept" required style="width: 100%; padding: 0.75rem 1rem; border-radius: 12px; border: 2px solid #f1f5f9; font-weight: 500; background: #f8fafc; cursor: pointer;">
                        <option value="">Select Department</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical & Computer Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                </div>

                <div>
                    <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.025em;">Official Email</label>
                    <input type="email" id="reg-email" required placeholder="student@amu.edu.et" 
                        style="width: 100%; padding: 0.75rem 1rem; border-radius: 12px; border: 2px solid #f1f5f9; font-weight: 500; background: #f8fafc;">
                </div>

                <div>
                    <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.025em;">Password</label>
                    <input type="password" id="reg-password" required placeholder="••••••••" 
                        style="width: 100%; padding: 0.75rem 1rem; border-radius: 12px; border: 2px solid #f1f5f9; font-weight: 500; background: #f8fafc;">
                </div>

                <button type="submit" id="btn-submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 12px; font-weight: 800; background: #14b8a6; color: white; margin-top: 1rem; box-shadow: 0 10px 15px -3px rgba(20, 184, 166, 0.4);">
                    Complete Registration
                </button>
            </form>

            <div style="text-align: center; margin-top: 2rem;">
                <p style="color: #64748b; font-size: 1rem; font-weight: 500;">
                    Have an account? <a href="#/login" style="color: #14b8a6; font-weight: 800; text-decoration: none;">Sign in →</a>
                </p>
            </div>
        </div>
    </div>
</div>

<style>
    @media (max-width: 1024px) { .desktop-only { display: none !important; } }
    input:focus, select:focus { border-color: #f1f5f9 !important; background: white !important; outline: none; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
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
            btn.innerHTML = '<span style="display: inline-flex; align-items: center; gap: 0.5rem;"><svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg> Initializing...</span>';

            try {
                const result = await apiCall('/auth/register', 'POST', { id, name, department: dept, email, password });
                if (result.success) {
                    showToast('Welcome aboard! Redirecting...', 'success');
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

