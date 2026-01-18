import './style.css';
import { initRouter } from './utils/router.js';
import { initAuth } from './utils/auth.js';
import { initGlobalSearch } from './utils/search.js';
import { initSocket } from './utils/socket.js';

document.querySelector('#app').innerHTML = `
  <div id="navbar-container"></div>
  <main id="main-content" class="container" style="flex: 1; padding-top: 2rem;"></main>
  <footer style="text-align: center; padding: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
    &copy; ${new Date().getFullYear()} Arba Minch University Dormitory Management System
  </footer>
`;

// Initialize App
initAuth();
initRouter();
initGlobalSearch();
initSocket();


