import TheoryBlock from './TheoryBlock.jsx';
import KindBadge from '../ui/KindBadge.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import { THEORY } from '../../data/theory.js';
import { pad } from '../../utils/format.js';

// The theory block for one style, with a link to try it.
export default function StyleTheory({ style }) {
  const t = THEORY[style.id];
  return (
    <TheoryBlock
      id={style.id}
      number={pad(style.number)}
      title={style.name}
      badge={<KindBadge style={style} />}
      paragraphs={t.paragraphs}
      equations={t.equations}
      footer={<ButtonLink to={`/style/${style.id}`} variant="text">Open {style.name}</ButtonLink>}
    />
  );
}
