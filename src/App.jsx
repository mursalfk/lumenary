import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import SmoothScroll from './components/SmoothScroll.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import StylePage from './pages/StylePage.jsx';
import SectionPage from './pages/SectionPage.jsx';

// The reading pages carry a lot of text and mathematics, so they load when someone visits them.
const TheoryPage = lazy(() => import('./pages/TheoryPage.jsx'));
const TheoryGroupPage = lazy(() => import('./pages/TheoryGroupPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));

// A calm blank page while a reading page arrives. Tall enough that the footer does not jump.
const Waiting = () => <div className="route-wait" role="status" aria-label="Loading" />;

export default function App() {
  return (
    <>
      <SmoothScroll />
      <ScrollToTop />
      {/* Page views only, no cookies. Left out of the single-file build, which runs from disk. */}
      {!import.meta.env.VITE_SINGLE && <Analytics />}
      <Suspense fallback={<Waiting />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/section/:id" element={<SectionPage />} />
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="/theory/:id" element={<TheoryGroupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/style/:slug" element={<StylePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
