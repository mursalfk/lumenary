// src/components/home/IndexSection.jsx
import { SECTION_LIST, STYLES } from '../../engine/styles/index.js';
import { numberWords, capitalise } from '../../utils/words.js';
import SectionHead from './SectionHead.jsx';
import PortalList from '../portal/PortalList.jsx';
import PortalRow from '../portal/PortalRow.jsx';

// The homepage index: one row per section. Each row opens that section's page of treatments.
export default function IndexSection() {
  return (
    <section id="index" className="index-section">
      <SectionHead
        title={`${capitalise(numberWords(STYLES.length))} treatments`}
        text="Choose a section to see its treatments. Live ones move and answer your cursor; still ones are drawn once and saved at up to three times the size."
      />
      <PortalList label="Sections">
        {SECTION_LIST.map((sec) => (
          <PortalRow
            key={sec.id}
            to={`/section/${sec.id}`}
            letter={sec.letter}
            title={sec.title}
            blurb={sec.blurb}
            meta={`${sec.styles.length} treatments`}
            previews={sec.styles.slice(0, 4).map((s) => s.id)}
          />
        ))}
      </PortalList>
    </section>
  );
}
