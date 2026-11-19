// Centralized lazy route loaders and idle/interaction prefetch helpers.
export const loadAbout = () => import('./pages/About.jsx');
export const loadProjects = () => import('./pages/Projects.jsx');
export const loadProjectDetail = () => import('./pages/ProjectDetail.jsx');
export const loadCaseStudy = () => import('./pages/CaseStudy.jsx');
export const loadContact = () => import('./pages/Contact.jsx');
export const loadNotFound = () => import('./pages/NotFound.jsx');

const ROUTE_PREFETCHERS = {
  '/about': loadAbout,
  '/projects': loadProjects,
  '/case-study': loadCaseStudy,
  '/contact': loadContact,
};

const prefetched = new Set();

function runLoader(key, loader) {
  if (!loader || prefetched.has(key)) return;
  prefetched.add(key);
  loader().catch(() => prefetched.delete(key));
}

export function prefetchRoute(path) {
  if (!path) return;
  if (path.startsWith('/projects/')) {
    runLoader('/projects/:slug', loadProjectDetail);
    return;
  }
  runLoader(path, ROUTE_PREFETCHERS[path]);
}

export function prefetchAllRoutes() {
  if (typeof navigator !== 'undefined' && navigator.connection?.saveData) {
    return () => {};
  }

  const preload = () => {
    Object.entries(ROUTE_PREFETCHERS).forEach(([path, loader]) => runLoader(path, loader));
    runLoader('/projects/:slug', loadProjectDetail);
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const id = window.requestIdleCallback(preload, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }

  const timer = setTimeout(preload, 600);
  return () => clearTimeout(timer);
}
