import { getUser } from './auth.js';
import { renderNavbar, updateNavBadge } from '../components/navbar.js';

// Simple hash router
const routes = {
  '/': () => import('../pages/home.js'),
  '/login': () => import('../pages/login.js'),
  '/dashboard': () => import('../pages/student-dashboard.js'),
  '/room': () => import('../pages/room.js'),
  '/maintenance': () => import('../pages/maintenance.js'),
  '/profile': () => import('../pages/profile.js'),
  '/search': () => import('../pages/search.js'),
  '/admin': () => import('../pages/admin-dashboard.js'),
  '/clearance': () => import('../pages/clearance.js'),
  '/lost-found': () => import('../pages/lost-found.js'),
  '/dorm-change': () => import('../pages/dorm-change.js'),
  '/add-student': () => import('../pages/add-student.js'),
  '/messages': () => import('../pages/messages.js'),
  '/register': () => import('../pages/register.js'),
};

export const initRouter = () => {
  window.addEventListener('hashchange', router);
  window.addEventListener('load', router);
};

async function router() {
  const fullHash = window.location.hash.slice(1) || '/';
  const hash = fullHash.split('?')[0]; // Ignore query params for routing
  const contentDiv = document.getElementById('main-content');
  const navbarContainer = document.getElementById('navbar-container');

  // Update Navbar
  navbarContainer.innerHTML = renderNavbar();
  updateNavBadge(); // Refresh alerts

  // Basic Access Control
  const user = getUser();
  let protectedRoute = false;

  if (hash.startsWith('/dashboard') || hash.startsWith('/admin')) {
    protectedRoute = true;
  }

  if (protectedRoute && !user) {
    window.location.hash = '/login';
    return;
  }

  // Render Route
  // Render Route
  // contentDiv.innerHTML = '<div style="text-align:center; padding: 2rem;">Loading...</div>'; // Removed to prevent flicker


  try {
    const routeLoader = routes[hash];
    if (routeLoader) {
      // Small fade out effect
      contentDiv.style.opacity = '0';
      contentDiv.style.transform = 'translateY(10px)';

      const module = await routeLoader();

      setTimeout(() => {
        contentDiv.innerHTML = module.render;
        contentDiv.style.opacity = '1';
        contentDiv.style.transform = 'translateY(0)';

        if (module.init) {
          module.init();
        }
      }, 50);

    } else {
      contentDiv.innerHTML = '<h1>404 - Page Not Found</h1>';
    }
  } catch (error) {
    console.error('Routing Error:', error);
    contentDiv.innerHTML = '<h1>Error loading page</h1>';
  }
}
