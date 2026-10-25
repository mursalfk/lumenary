// src/components/section/StyleIndex.jsx
import { useEffect, useMemo, useState } from 'react';
import { requestThumbs } from '../../thumbs.js';
import { isLive } from '../../utils/format.js';
import StyleFilters from './StyleFilters.jsx';
import StyleRow from './StyleRow.jsx';
import FloatingPreview from './FloatingPreview.jsx';

const SEARCH_FROM = 12; // sections shorter than this do not need a search box

// A section's treatments as a list of names that can be narrowed by kind or by name. Hovering a name shows its preview.
export default function StyleIndex({ styles }) {
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);
  useEffect(() => { requestThumbs(styles, { first: true }); }, [styles]);

  const hasLive = styles.some(isLive);
  const hasStill = styles.some((s) => !isLive(s));
  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () => styles.filter((s) => (kind === 'all' || (kind === 'live') === isLive(s)) && (!q || s.name.toLowerCase().includes(q))),
    [styles, kind, q]
  );

  return (
    <section className="style-index">
      <StyleFilters
        kind={kind}
        onKind={setKind}
        query={query}
        onQuery={setQuery}
        shown={shown.length}
        total={styles.length}
        withKind={hasLive && hasStill}
        withSearch={styles.length >= SEARCH_FROM}
      />
      {shown.length > 0 ? (
        <ol className="style-list" style={{ '--rows': Math.ceil(shown.length / 2) }} onMouseLeave={() => setActive(null)}>
          {shown.map((s) => <StyleRow key={s.id} style={s} onActivate={setActive} onDeactivate={() => setActive(null)} />)}
        </ol>
      ) : (
        <p className="style-empty">Nothing here is called “{query.trim()}”. Try a shorter word, or clear the filters.</p>
      )}
      <FloatingPreview style={active} />
    </section>
  );
}
