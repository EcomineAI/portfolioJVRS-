import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import { CASE_STUDY_SLUG } from './data/projects.js';
import { useKonami } from './hooks/useKonami.js';
import About from './pages/About.jsx';
import CaseStudy from './pages/CaseStudy.jsx';
import Contact from './pages/Contact.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Projects from './pages/Projects.jsx';

export default function App() {
  useKonami();

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
