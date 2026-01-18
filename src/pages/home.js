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
<div style="position: relative; min-height: calc(100vh - 80px); display: flex; align-items: center; overflow: hidden; background: #000;">
    <!-- Background Image with Overlay -->
    <div style="position: absolute; inset: 0; background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1555854817-5b27a8a25597?q=80&w=2070&auto=format&fit=crop'); background-size: cover; background-position: center; z-index: 1;"></div>
    
    <div class="container" style="position: relative; z-index: 2; padding-top: 4rem; padding-bottom: 4rem;">
        <div style="max-width: 800px; animation: fadeInUp 1s ease-out;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); color: #fff; padding: 0.5rem 1.25rem; border-radius: 100px; font-weight: 600; font-size: 0.9rem; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.2);">
                <span>🏫</span> Arba Minch Institute of Technology
            </div>
            
            <h1 style="font-size: clamp(3rem, 8vw, 5rem); line-height: 1; color: white; margin-bottom: 2rem; letter-spacing: -0.04em; font-weight: 800;">
                Revolutionizing <br><span style="color: #0d9488;">Dormitory</span> Life.
            </h1>
            
            <p style="font-size: clamp(1.1rem, 2vw, 1.4rem); color: rgba(255,255,255,0.8); margin-bottom: 3rem; max-width: 600px; line-height: 1.6;">
                The official Arba Minch University residence management portal. Secure access, automated allocations, and seamless student support.
            </p>
            
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
                <a href="#/login" class="btn" style="background: #0d9488; color: white; padding: 1.25rem 3rem; font-size: 1.2rem; font-weight: 700; border-radius: 12px; box-shadow: 0 20px 40px rgba(13, 148, 136, 0.3); transition: all 0.3s ease;">
                    Access Portal
                </a>
                <a href="#/register" class="btn" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 1.25rem 3rem; font-size: 1.2rem; font-weight: 600; border-radius: 12px; transition: all 0.3s ease;">
                    Student Registry
                </a>
            </div>

            <div style="margin-top: 5rem; display: flex; gap: 4rem; align-items: center; flex-wrap: wrap;">
                <div>
                    <div style="font-size: 2rem; font-weight: 800; color: white;">12,000+</div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Students</div>
                </div>
                <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.2);" class="desktop-only"></div>
                <div>
                    <div style="font-size: 2rem; font-weight: 800; color: white;">500+</div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Daily Requests</div>
                </div>
                <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.2);" class="desktop-only"></div>
                <div>
                    <div style="font-size: 2rem; font-weight: 800; color: white;">99.9%</div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Uptime</div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@keyframes fadeInUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
@media (max-width: 768px) {
    .desktop-only { display: none !important; }
    .container { text-align: center; }
    div[style*="justify-content: flex-start"] { justify-content: center !important; }
    div[style*="display: flex; gap: 4rem"] { justify-content: center; gap: 2rem !important; }
    div[style*="display: flex; gap: 1.5rem"] { justify-content: center; }
}
</style>
`;
