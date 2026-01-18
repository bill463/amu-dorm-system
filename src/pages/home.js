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
        if (studentsEl) studentsEl.textContent = stats.students.toLocaleString();
        if (roomsEl) roomsEl.textContent = stats.rooms.toLocaleString();
    } catch (e) {
        console.error('Failed to load stats', e);
    }
};

export const render = `
<!-- Hero Section -->
<div style="position: relative; min-height: 100vh; display: flex; align-items: center; overflow: hidden; background: #0a0a0a; margin-top: -80px;">
    <!-- Animated Background -->
    <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(0,0,0,0.9) 100%), url('/landing-bg.jpg'); background-size: cover; background-position: center; z-index: 1;"></div>
    <div class="gradient-orb" style="position: absolute; top: -20%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(20, 184, 166, 0.15), transparent 70%); border-radius: 50%; filter: blur(80px); animation: float 8s ease-in-out infinite; z-index: 2;"></div>
    <div class="gradient-orb" style="position: absolute; bottom: -20%; left: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(45, 212, 191, 0.1), transparent 70%); border-radius: 50%; filter: blur(80px); animation: float 10s ease-in-out infinite reverse; z-index: 2;"></div>
    
    <div class="container" style="position: relative; z-index: 3; padding: 4rem 2rem;">
        <div style="max-width: 1200px; margin: 0 auto;">
            <!-- Hero Content -->
            <div style="text-align: center; margin-bottom: 5rem; animation: fadeInUp 1s ease-out;">
                <div style="display: inline-flex; align-items: center; gap: 0.75rem; background: rgba(20, 184, 166, 0.15); backdrop-filter: blur(10px); color: #14b8a6; padding: 0.6rem 1.5rem; border-radius: 100px; font-weight: 700; font-size: 0.85rem; margin-bottom: 2rem; border: 1px solid rgba(20, 184, 166, 0.3); text-transform: uppercase; letter-spacing: 0.1em;">
                    <span style="width: 8px; height: 8px; background: #14b8a6; border-radius: 50%; animation: pulse 2s infinite;"></span>
                    Arba Minch University Portal
                </div>
                
                <h1 style="font-size: clamp(3rem, 8vw, 6.5rem); line-height: 1.05; color: white; margin-bottom: 1.5rem; letter-spacing: -0.04em; font-weight: 900;">
                    Modern Living.<br>
                    <span style="background: linear-gradient(135deg, #14b8a6 0%, #2dd4bf 50%, #5eead4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Simplified Management.</span>
                </h1>
                
                <p style="font-size: clamp(1.1rem, 2vw, 1.4rem); color: rgba(255,255,255,0.7); margin-bottom: 3rem; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.7; font-weight: 400;">
                    Your all-in-one residence portal. Request rooms, report issues, and manage your campus life—all from one secure platform.
                </p>
                
                <div style="display: flex; gap: 1.25rem; justify-content: center; flex-wrap: wrap; margin-bottom: 4rem;">
                    <a href="#/login" class="cta-btn" style="background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 1.25rem 3rem; font-size: 1.15rem; font-weight: 700; border-radius: 14px; border: none; box-shadow: 0 20px 40px -10px rgba(20, 184, 166, 0.4); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: inline-flex; align-items: center; gap: 0.75rem; text-decoration: none;">
                        <span>Access Portal</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                    <a href="#/register" class="cta-btn-outline" style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); color: white; border: 2px solid rgba(255,255,255,0.2); padding: 1.25rem 3rem; font-size: 1.15rem; font-weight: 700; border-radius: 14px; transition: all 0.3s ease; text-decoration: none; display: inline-block;">
                        New Student? Register
                    </a>
                </div>
            </div>

            <!-- Feature Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-bottom: 5rem; animation: fadeInUp 1s ease-out 0.2s backwards;">
                <div class="feature-card" style="background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 2.5rem; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05)); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 1.75rem;">🏠</div>
                    <h3 style="color: white; font-size: 1.4rem; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.02em;">Smart Allocation</h3>
                    <p style="color: rgba(255,255,255,0.6); line-height: 1.7; font-size: 1rem;">Automated room assignment based on department, year, and preferences.</p>
                </div>

                <div class="feature-card" style="background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 2.5rem; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05)); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 1.75rem;">⚡</div>
                    <h3 style="color: white; font-size: 1.4rem; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.02em;">Instant Support</h3>
                    <p style="color: rgba(255,255,255,0.6); line-height: 1.7; font-size: 1rem;">Report maintenance issues and track resolution in real-time.</p>
                </div>

                <div class="feature-card" style="background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 2.5rem; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05)); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 1.75rem;">🔒</div>
                    <h3 style="color: white; font-size: 1.4rem; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.02em;">Secure Access</h3>
                    <p style="color: rgba(255,255,255,0.6); line-height: 1.7; font-size: 1rem;">Your data protected with enterprise-grade encryption and security.</p>
                </div>
            </div>

            <!-- Stats Section -->
            <div style="background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 32px; padding: 3rem 2rem; animation: fadeInUp 1s ease-out 0.4s backwards;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; text-align: center;">
                    <div>
                        <div id="stat-students" style="font-size: 3.5rem; font-weight: 900; background: linear-gradient(135deg, #14b8a6, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 0.5rem;">...</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.9rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Registered Students</div>
                    </div>
                    <div style="width: 1px; background: rgba(255,255,255,0.1);" class="desktop-divider"></div>
                    <div>
                        <div id="stat-rooms" style="font-size: 3.5rem; font-weight: 900; background: linear-gradient(135deg, #14b8a6, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 0.5rem;">...</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.9rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Total Rooms</div>
                    </div>
                    <div style="width: 1px; background: rgba(255,255,255,0.1);" class="desktop-divider"></div>
                    <div>
                        <div style="font-size: 3.5rem; font-weight: 900; background: linear-gradient(135deg, #14b8a6, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 0.5rem;">24/7</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.9rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Support Available</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -30px) scale(1.1); }
}
@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.95); }
}
.cta-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 25px 50px -10px rgba(20, 184, 166, 0.5);
}
.cta-btn-outline:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.3);
    transform: translateY(-2px);
}
.feature-card:hover {
    transform: translateY(-8px);
    background: rgba(255,255,255,0.05);
    border-color: rgba(20, 184, 166, 0.3);
}
@media (max-width: 768px) {
    .desktop-divider { display: none !important; }
    .gradient-orb { width: 300px !important; height: 300px !important; }
}
</style>
`;
