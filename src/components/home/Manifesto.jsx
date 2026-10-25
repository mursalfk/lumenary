// src/components/home/Manifesto.jsx
import ScrollWords from './ScrollWords.jsx';
import { STYLES } from '../../engine/styles/index.js';
import { manifesto } from '../../data/copy.js';
import { numberWords, capitalise } from '../../utils/words.js';

export default function Manifesto() {
  return (
    <section className="manifesto">
      <ScrollWords text={manifesto(capitalise(numberWords(STYLES.length)))} />
    </section>
  );
}
