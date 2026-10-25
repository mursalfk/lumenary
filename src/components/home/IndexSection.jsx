// src/components/home/IndexSection.jsx
import { useState } from 'react';
import { SECTION_LIST, STYLES } from '../../engine/styles/index.js';
import { numberWords, capitalise } from '../../utils/words.js';
import SectionHead from './SectionHead.jsx';
import SectionJump from './SectionJump.jsx';
import IndexGroup from './IndexGroup.jsx';
import FloatingPreview from './FloatingPreview.jsx';

export default function IndexSection() {
  const [active, setActive] = useState(null);
  const off = () => setActive(null);
  return (
    <section id="index" className="index-section">
      <SectionHead
        title={`${capitalise(numberWords(STYLES.length))} treatments`}
        text="Live ones move and answer your cursor. Still ones are drawn once and saved at up to three times the size."
      />
      <SectionJump sections={SECTION_LIST} />
      {SECTION_LIST.map((s) => <IndexGroup key={s.id} section={s} onActivate={setActive} onDeactivate={off} />)}
      <FloatingPreview style={active} />
    </section>
  );
}
