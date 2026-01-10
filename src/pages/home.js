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
<div style="position: relative; overflow: hidden; border-radius: 0 0 32px 32px; margin-bottom: 4rem;">
    <!-- Hero Background -->
    <div style="
        height: 500px;
        background-image: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url('/dorm-bg.jpg');
        background-size: cover;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;
        padding: 2rem;
    ">
        <div style="max-width: 800px; animation: fadeIn 0.8s ease-out;">
            <img src="/amu-logo.png" style="height: 100px; margin-bottom: 1.5rem; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
            <h1 style="font-size: 3.5rem; margin-bottom: 1rem; color: white;">Arba Minch University</h1>
            <h2 style="font-size: 2rem; font-weight: 400; opacity: 0.9; margin-bottom: 2rem; color: #e2e8f0;">Dormitory Management System</h2>
            <a href="#/login" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">Portal Login</a>
        </div>
    </div>
</div>

<div class="container">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 4rem;">
        <div class="card" style="text-align: center; border: none; box-shadow: var(--shadow-lg);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🏠</div>
            <h3>Room Assignment</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">Efficiently managed room allocations for all students.</p>
        </div>
        <div class="card" style="text-align: center; border: none; box-shadow: var(--shadow-lg);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔧</div>
            <h3>Maintenance</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">Quick reporting and resolution of dormitory facility issues.</p>
        </div>
        <div class="card" style="text-align: center; border: none; box-shadow: var(--shadow-lg);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🛡️</div>
            <h3>Student Safety</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">Secure and monitored environment for your academic success.</p>
        </div>
    </div>
</div>
`;
