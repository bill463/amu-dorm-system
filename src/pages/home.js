import { getUser } from '../utils/auth.js';
import { apiCall } from '../utils/api.js';

export const init = async () => {
    const user = getUser();
    if (user) {
        if (user.role === 'admin') {
            window.location.hash = '#/admin';
        } else {
            window.location.hash = '#/dashboard';
        }
    }

    // Fetch Stats
    try {
        const stats = await apiCall('/api/public/stats');
        const studentsEl = document.getElementById('stat-students');
        const roomsEl = document.getElementById('stat-rooms');
        if (studentsEl) studentsEl.textContent = stats.students.toLocaleString() + '+';
        if (roomsEl) roomsEl.textContent = stats.rooms.toLocaleString();
    } catch (e) {
        console.error('Failed to load stats', e);
    }
};

export const render = `
<div style="position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #000; margin-top: -80px;">
    <!-- Background Image with Overlay -->
    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url('/landing-bg.jpg'); background-size: cover; background-position: center; z-index: 1;"></div>
    
    <div class="container" style="position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; padding: 2rem;">
        <div style="max-width: 900px; width: 100%; text-align: center; animation: zoomIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);">
            
            <!-- Glass Card -->
            <div style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; padding: 4rem 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                
                <div style="display: inline-flex; align-items: center; gap: 0.75rem; background: rgba(20, 184, 166, 0.2); color: #14b8a6; padding: 0.6rem 1.5rem; border-radius: 100px; font-weight: 700; font-size: 0.85rem; margin-bottom: 2.5rem; border: 1px solid rgba(20, 184, 166, 0.3); text-transform: uppercase; letter-spacing: 0.1em;">
                    <span style="animation: pulse 2s infinite;">●</span> System Online
                </div>
                
                <h1 style="font-size: clamp(2.5rem, 10vw, 5.5rem); line-height: 0.95; color: white; margin-bottom: 2rem; letter-spacing: -0.05em; font-weight: 900;">
                    Your <span style="background: linear-gradient(135deg, #14b8a6, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Campus Home</span>, <br>Simplified.
                </h1>
                
                <p style="font-size: clamp(1.1rem, 2vw, 1.35rem); color: rgba(255,255,255,0.8); margin-bottom: 3.5rem; max-width: 650px; margin-left: auto; margin-right: auto; line-height: 1.6; font-weight: 400;">
                    Experience the next generation of residence management at Arba Minch University. Secure, intelligent, and designed for students.
                </p>
                
                <div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
                    <a href="#/login" class="btn" style="background: #14b8a6; color: white; padding: 1.25rem 3.5rem; font-size: 1.2rem; font-weight: 700; border-radius: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; transform: perspective(1px) translateZ(0);">
                        Login to Portal
                    </a>
                    <a href="#/register" class="btn" style="background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); color: white; border: 1px solid rgba(255,255,255,0.15); padding: 1.25rem 3.5rem; font-size: 1.2rem; font-weight: 700; border-radius: 16px; transition: all 0.3s ease;">
                        Self-Registration
                    </a>
                </div>

                <div style="margin-top: 5rem; display: flex; gap: 4rem; align-items: center; justify-content: center; flex-wrap: wrap; opacity: 0.8;">
                    <div style="text-align: center;">
                        <div id="stat-students" style="font-size: 2.5rem; font-weight: 900; color: white; line-height: 1;">...</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 0.5rem;">Active Students</div>
                    </div>
                    <div style="width: 1px; height: 50px; background: rgba(255,255,255,0.1);" class="desktop-only"></div>
                    <div style="text-align: center;">
                        <div id="stat-rooms" style="font-size: 2.5rem; font-weight: 900; color: white; line-height: 1;">...</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 0.5rem;">Available Rooms</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@keyframes zoomIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
}
@media (max-width: 768px) {
    .desktop-only { display: none !important; }
    h1 { font-size: 3rem !important; }
    div[style*="padding: 4rem 2rem"] { padding: 3rem 1.5rem !important; }
}
</style>
`;
