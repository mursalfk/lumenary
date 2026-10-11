import { cx } from '../../utils/cx.js';
import { scrollToId } from '../../utils/scroller.js';

// Sticky table of contents. Each group is { title, items: [{ id, label, number? }] }.
export default function TheoryNav({ groups, active }) {
  const go = (id) => (e) => { if (scrollToId(id)) e.preventDefault(); };
  return (
    <nav className="theory-nav" aria-label="On this page">
      {groups.map((g) => (
        <div className="group" key={g.title}>
          <h2>{g.title}</h2>
          <ul>
            {g.items.map((it) => (
              <li key={it.id}>
                <a href={`#${it.id}`} onClick={go(it.id)} className={cx(active === it.id && 'on')}>
                  {it.number && <span className="num">{it.number}</span>}
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
