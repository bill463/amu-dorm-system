import './style.css';
import { initRouter } from './utils/router.js';
import { initAuth } from './utils/auth.js';
import { initGlobalSearch } from './utils/search.js';

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

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
