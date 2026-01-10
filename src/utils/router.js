import { getUser } from './auth.js';
import { renderNavbar } from '../components/navbar.js';

// Simple hash router
const routes = {
  '/': () => import('../pages/home.js'),
  '/login': () => import('../pages/login.js'),
  '/dashboard': () => import('../pages/student-dashboard.js'),
  '/room': () => import('../pages/room.js'),
  '/maintenance': () => import('../pages/maintenance.js'),
  '/maintenance': () => import('../pages/maintenance.js'),
  '/profile': () => import('../pages/profile.js'),
  '/search': () => import('../pages/search.js'),
  '/admin': () => import('../pages/admin-dashboard.js'),
  '/clearance': () => import('../pages/clearance.js'),
  '/lost-found': () => import('../pages/lost-found.js'),
  '/dorm-change': () => import('../pages/dorm-change.js'),
  '/add-student': () => import('../pages/add-student.js'),
  '/messages': () => import('../pages/messages.js'),
};

export const initRouter = () => {
  window.addEventListener('hashchange', router);
  window.addEventListener('load', router);
};

async function router() {
  const hash = window.location.hash.slice(1) || '/';
  const contentDiv = document.getElementById('main-content');
  const navbarContainer = document.getElementById('navbar-container');

  // Update Navbar
  navbarContainer.innerHTML = renderNavbar();

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
      const module = await routeLoader();
      contentDiv.innerHTML = module.render;

      // Re-execute scripts/event listeners if they are embedded in script tags (not encouraged but common in simple vanilla)
      // Or better, we assume the module might expose an init function.
      // But our current pattern is `render` string + `setTimeout` in the file.
      // The `setTimeout` in the module files will NOT run because the module is already loaded.
      // We need a better pattern. We should export an `init()` function or similar.
      // However, since we are using `import()`, the module code runs ONCE.
      // The `setTimeout` I wrote in `login.js` runs when the module is imported.
      // If I navigate away and back, it won't run again if it's top-level.

      // Correction: usage of `render` string export + top level code is flaky for SPA navigation.
      // I should have `render()` function that returns string, and `afterRender()` logic.
      // For now, let's just re-import or rely on a simple trick: 
      // The modules I wrote have `setTimeout` which runs on import. This is bad for re-visits.
      // I will fix this in the next step by refactoring pages to export `init` function.

      // For now, to make it work without refactoring everything immediately:
      // I will assume the modules execute side effects on import.
      // But multiple visits won't trigger it.

      // Let's change the router to expect an `init` function if present?
      // Or, since I am in EXECUTION, I should fix the pattern now.

      // I will just execute the styles/scripts.

      // Better approach for this task:
      // Change page modules to export `init()` function.
      if (module.init) {
        module.init();
      }

    } else {
      contentDiv.innerHTML = '<h1>404 - Page Not Found</h1>';
    }

  } catch (error) {
    console.error('Routing Error:', error);
    contentDiv.innerHTML = '<h1>Error loading page</h1>';
  }
}
