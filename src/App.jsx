import { lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import { CASE_STUDY_SLUG } from './data/projects.js';
import { useKonami } from './hooks/useKonami.js';
import Home from './pages/Home.jsx';
import {
  loadAbout,
  loadCaseStudy,
  loadContact,
  loadNotFound,
  loadProjectDetail,
  loadProjects,
  prefetchAllRoutes,
} from './routes.js';

const About = lazy(loadAbout);
const Projects = lazy(loadProjects);
const ProjectDetail = lazy(loadProjectDetail);
const CaseStudy = lazy(loadCaseStudy);
const Contact = lazy(loadContact);
const NotFound = lazy(loadNotFound);

export default function App() {
  useKonami();

  useEffect(() => prefetchAllRoutes(), []);

  return (
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
  );
}
