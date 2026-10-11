import { Routes, Route, Navigate } from 'react-router-dom';
import SmoothScroll from './components/SmoothScroll.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import StylePage from './pages/StylePage.jsx';
import TheoryPage from './pages/TheoryPage.jsx';

export default function App() {
  return (
    <>
      <SmoothScroll />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/theory" element={<TheoryPage />} />
        <Route path="/style/:slug" element={<StylePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
