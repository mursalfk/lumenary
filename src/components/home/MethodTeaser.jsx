import Equation from '../ui/Equation.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import { METHOD } from '../../data/copy.js';

export default function MethodTeaser() {
  return (
    <section className="method-teaser">
      <div className="text">
        <h2>{METHOD.title}</h2>
        <p>{METHOD.text}</p>
        <ButtonLink to="/theory" variant="ghost">Read the theory</ButtonLink>
      </div>
      <Equation tex={METHOD.tex} note={METHOD.note} />
    </section>
  );
}
