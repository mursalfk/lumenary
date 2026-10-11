import { useState } from 'react';
import SectionHead from './SectionHead.jsx';
import IndexList from './IndexList.jsx';
import FloatingPreview from './FloatingPreview.jsx';

export default function IndexSection() {
  const [active, setActive] = useState(null);
  return (
    <section id="index" className="index-section">
      <SectionHead title="Twenty treatments" text="Live ones move and answer your cursor. Still ones are drawn once and saved at up to three times the size." />
      <IndexList onActivate={setActive} onDeactivate={() => setActive(null)} />
      <FloatingPreview style={active} />
    </section>
  );
}
