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
        if (studentsEl) studentsEl.textContent = stats.students.toLocaleString() + ' + students';
        if (roomsEl) roomsEl.textContent = stats.rooms.toLocaleString();
    } catch (e) {
        console.error('Failed to load stats', e);
    }

};

export const render = `
<div style="position: relative; min-height: 100vh; display: flex; align-items: center; overflow: hidden; background: #000; margin-top: -80px;">
    <!-- Background Image -->
    <div style="position: absolute; inset: 0; background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('/dorm-bg.jpg'); background-size: cover; background-position: center; z-index: 1;"></div>
    
    <div class="container" style="position: relative; z-index: 2; padding: 2rem; max-width: 1100px; margin: 0 auto;">
        <div style="text-align: center; animation: fadeIn 0.8s ease-out;">
            
            <!-- Badge -->
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); color: rgba(255,255,255,0.9); padding: 0.5rem 1.25rem; border-radius: 100px; font-weight: 600; font-size: 0.75rem; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.1); text-transform: uppercase; letter-spacing: 0.05em;">
                <span style="width: 6px; height: 6px; background: #14b8a6; border-radius: 50%;"></span>
                Arba Minch University
            </div>
            
            <!-- Main Heading -->
            <h1 style="font-size: clamp(2rem, 5vw, 3.25rem); line-height: 1.2; color: white; margin-bottom: 1.25rem; letter-spacing: -0.02em; font-weight: 800;">
                Student Residence Portal
            </h1>
            
            <!-- Subheading -->
            <p style="font-size: 1.05rem; color: rgba(255,255,255,0.7); margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6;">
                The official Arba Minch University housing management system. Manage your stay, requests, and campus life in one place.
            </p>
            
            <!-- CTA Buttons -->
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 4rem;">
                <a href="#/login" class="landing-btn landing-btn-primary">
                    Login to Portal
                </a>
                <a href="#/register" class="landing-btn landing-btn-outline">
                    Register Now
                </a>
            </div>

            <!-- Stats -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 2rem; max-width: 600px; margin: 0 auto;">
                <div style="background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 1.5rem;">
                    <div id="stat-students" style="font-size: 2rem; font-weight: 800; color: #14b8a6; margin-bottom: 0.25rem;">...</div>
                    <div style="color: rgba(255,255,255,0.8); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Students</div>
                </div>
                <div style="background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 1.5rem;">
                    <div id="stat-rooms" style="font-size: 2rem; font-weight: 800; color: #14b8a6; margin-bottom: 0.25rem;">...</div>
                    <div style="color: rgba(255,255,255,0.8); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Rooms</div>
                </div>
                <div style="background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 1.5rem;">
                    <div style="font-size: 2rem; font-weight: 800; color: #14b8a6; margin-bottom: 0.25rem;">24/7</div>
                    <div style="color: rgba(255,255,255,0.8); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Support</div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.landing-btn {
    padding: 0.85rem 2.25rem;
    font-size: 0.95rem;
    font-weight: 700;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 180px;
}
.landing-btn-primary {
    background: #14b8a6;
    color: white;
    border: none;
}
.landing-btn-primary:hover {
    background: #0d9488;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(20, 184, 166, 0.4);
}
.landing-btn-outline {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    color: white;
    border: 1px solid rgba(255,255,255,0.2);
}
.landing-btn-outline:hover {
    background: rgba(255,255,255,0.2);
    border-color: rgba(255,255,255,0.4);
    transform: translateY(-2px);
}
@media (max-width: 768px) {
    h1 { font-size: 1.8rem !important; }
    p { font-size: 0.95rem !important; max-width: 100% !important; }
    .landing-btn { min-width: 100%; }
    div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
}
</style>
`;
