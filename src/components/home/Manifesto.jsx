import ScrollWords from './ScrollWords.jsx';
import { MANIFESTO } from '../../data/copy.js';

export default function Manifesto() {
  return (
    <section className="manifesto">
      <ScrollWords text={MANIFESTO} />
    </section>
  );
}
