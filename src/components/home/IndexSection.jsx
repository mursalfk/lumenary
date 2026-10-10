import { useState } from 'react';
import SectionHead from './SectionHead.jsx';
import IndexList from './IndexList.jsx';
import FloatingPreview from './FloatingPreview.jsx';

export default function IndexSection() {
  const [active, setActive] = useState(null);
  return (
    <section id="index" className="index-section">
      <SectionHead title="The index" text="Twenty treatments. Live ones move and respond to your cursor; still ones render once." />
      <IndexList onActivate={setActive} onDeactivate={() => setActive(null)} />
      <FloatingPreview style={active} />
    </section>
  );
}
