// src/components/theory/TheoryTips.jsx
import ButtonLink from '../ui/ButtonLink.jsx';
import { presetToSearch } from '../../utils/presets.js';

// Things to try. A tip with a `set` opens the treatment with those dials already turned.
export default function TheoryTips({ styleId, tips }) {
  return (
    <ul className="theory-tips">
      {tips.map((tip, i) => (
        <li key={i}>
          <p>{tip.text}</p>
          {tip.set && (
            <ButtonLink to={`/style/${styleId}${presetToSearch(tip.set)}`} variant="ghost">
              See it
            </ButtonLink>
          )}
        </li>
      ))}
    </ul>
  );
}
