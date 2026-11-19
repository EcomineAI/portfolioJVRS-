import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import { CASE_STUDY_SLUG } from './data/projects.js';
import { useKonami } from './hooks/useKonami.js';
import Home from './pages/Home.jsx';

const loadAbout = () => import('./pages/About.jsx');
const loadProjects = () => import('./pages/Projects.jsx');
const loadProjectDetail = () => import('./pages/ProjectDetail.jsx');
const loadCaseStudy = () => import('./pages/CaseStudy.jsx');
const loadContact = () => import('./pages/Contact.jsx');
const loadNotFound = () => import('./pages/NotFound.jsx');

const About = lazy(loadAbout);
const Projects = lazy(loadProjects);
const ProjectDetail = lazy(loadProjectDetail);
const CaseStudy = lazy(loadCaseStudy);
const Contact = lazy(loadContact);
const NotFound = lazy(loadNotFound);

const ROUTE_PREFETCHERS = {
  '/about': loadAbout,
  '/projects': loadProjects,
  '/case-study': loadCaseStudy,
  '/contact': loadContact,
};

const prefetched = new Set();
export function prefetchRoute(path) {
  const loader = ROUTE_PREFETCHERS[path];
  if (!loader || prefetched.has(path)) return;
  prefetched.add(path);
  loader().catch(() => prefetched.delete(path));
}

export default function App() {
  useKonami();

  return (
    <Suspense fallback={<div className="container section" aria-busy="true" style={{ minHeight: '60vh' }} />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="projects" element={<Projects />} />
          {/* The featured SE project lives at /case-study; its project slug redirects there. */}
          <Route path={`projects/${CASE_STUDY_SLUG}`} element={<Navigate to="/case-study" replace />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="case-study" element={<CaseStudy />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
