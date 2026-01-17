import { getUser } from '../utils/auth.js';

export const init = () => {
    const user = getUser();
    if (user) {
        if (user.role === 'admin') {
            window.location.hash = '#/admin';
        } else {
            window.location.hash = '#/dashboard';
        }
    }
};

export const render = `
<div style="background: radial-gradient(circle at top right, var(--primary-light), var(--background-color)); min-height: calc(100vh - 80px); display: flex; flex-direction: column;">
    <div class="container" style="flex: 1; display: flex; align-items: center; padding-top: 4rem; padding-bottom: 4rem;">
        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 4rem; align-items: center;">
            <div style="animation: slideInLeft 0.8s ease-out;">
                <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: var(--primary-light); color: var(--primary-dark); padding: 0.5rem 1rem; border-radius: 100px; font-weight: 700; font-size: 0.85rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    <span>✨</span> Arba Minch Institute of Technology
                </div>
                <h1 style="font-size: 4.5rem; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.04em;">
                    Smart Living for <span style="color: var(--primary-color);">Next-Gen</span> Engineers.
                </h1>
                <p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2.5rem; max-width: 600px; line-height: 1.6;">
                    Digitalizing Arba Minch University's dormitory experience. Seamless room allocations, instant maintenance reports, and student-first services.
                </p>
                <div style="display: flex; gap: 1rem;">
                    <a href="#/login" class="btn btn-primary" style="padding: 1rem 2.5rem; font-size: 1.1rem;">Access Portal</a>
                    <a href="#/register" class="btn btn-outline" style="padding: 1rem 2.5rem; font-size: 1.1rem;">New Student Registry</a>
                </div>
                
                <div style="margin-top: 4rem; display: flex; gap: 3rem; align-items: center;">
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 800;">10,000+</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">ACTIVE STUDENTS</div>
                    </div>
                    <div style="width: 1px; height: 30px; background: var(--border-color);"></div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 800;">400+</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">SECURE ROOMS</div>
                    </div>
                    <div style="width: 1px; height: 30px; background: var(--border-color);"></div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 800;">24/7</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">SUPPORT</div>
                    </div>
                </div>
            </div>
            
            <div style="position: relative; animation: fadeIn 1.2s ease-out;">
                <div style="position: absolute; top: -20px; left: -20px; width: 100%; height: 100%; background: var(--primary-color); border-radius: 24px; opacity: 0.05; transform: rotate(-3deg);"></div>
                <div style="background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 24px; padding: 2.5rem; box-shadow: var(--shadow-xl); position: relative;">
                    <img src="/amu-logo.png" style="height: 80px; margin-bottom: 2rem; display: block; margin-left: auto; margin-right: auto;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h3 style="margin: 0; font-size: 1.5rem;">Digital Portal</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">Sign in to manage your residency</p>
                    </div>
                    <div style="display: grid; gap: 1rem;">
                        <div style="padding: 1rem; background: var(--surface-hover); border-radius: 12px; display: flex; align-items: center; gap: 1rem;">
                             <div style="width: 36px; height: 36px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">🔒</div>
                             <span style="font-weight: 600; font-size: 0.9rem;">Secure Authentication</span>
                        </div>
                        <div style="padding: 1rem; background: var(--surface-hover); border-radius: 12px; display: flex; align-items: center; gap: 1rem;">
                             <div style="width: 36px; height: 36px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">⚡</div>
                             <span style="font-weight: 600; font-size: 0.9rem;">Instant Request System</span>
                        </div>
                        <div style="padding: 1rem; background: var(--surface-hover); border-radius: 12px; display: flex; align-items: center; gap: 1rem;">
                             <div style="width: 36px; height: 36px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">📊</div>
                             <span style="font-weight: 600; font-size: 0.9rem;">Real-time Assignments</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@keyframes slideInLeft {
    from { transform: translateX(-40px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
@media (max-width: 992px) {
    div[style*="grid-template-columns: 1.2fr 0.8fr"] {
        grid-template-columns: 1fr !important;
        text-align: center;
    }
    h1 { font-size: 3rem !important; }
    div[style*="margin-top: 4rem"] { justify-content: center; gap: 1.5rem !important; }
    p { margin-left: auto; margin-right: auto; }
}
</style>
`;
