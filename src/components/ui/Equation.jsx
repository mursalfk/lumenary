import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// A typeset equation. The strings come from our own data files, never from visitors.
export default function Equation({ tex, display = true, note }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore' }),
    [tex, display]
  );
  const Tag = display ? 'figure' : 'span';
  return (
    <Tag className="equation">
      <span className="math" dangerouslySetInnerHTML={{ __html: html }} />
      {note && <figcaption>{note}</figcaption>}
    </Tag>
  );
}
