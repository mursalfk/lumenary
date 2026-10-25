// src/components/theory/StyleTheory.jsx
import TheoryBlock from './TheoryBlock.jsx';
import TheorySection from './TheorySection.jsx';
import TheoryFacts from './TheoryFacts.jsx';
import TheorySteps from './TheorySteps.jsx';
import TheoryList from './TheoryList.jsx';
import TheoryTips from './TheoryTips.jsx';
import TheoryTerms from './TheoryTerms.jsx';
import TheoryRelated from './TheoryRelated.jsx';
import KindBadge from '../ui/KindBadge.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import { THEORY } from '../../data/theory.js';
import { pad } from '../../utils/format.js';

const Paragraph = ({ text }) => <p className="plain">{text}</p>;

// The theory block for one style: why it looks the way it does, how it works, the mathematics, a little
// history, where it is used, things to try, a glossary and its neighbours, with a link to open it.
export default function StyleTheory({ style }) {
  const t = THEORY[style.id];
  const rich = Boolean(t.why);
  const top = rich && (
    <>
      <TheoryFacts facts={t.facts} />
      <TheorySection title="Why it looks this way"><Paragraph text={t.why} /></TheorySection>
      <TheorySection title="How it works"><TheorySteps steps={t.how} /></TheorySection>
    </>
  );
  const bottom = rich && (
    <>
      <div className="theory-pair">
        <TheorySection title="A short history"><Paragraph text={t.history} /></TheorySection>
        <TheorySection title="Where it is used"><TheoryList items={t.uses} /></TheorySection>
      </div>
      <TheorySection title="Try it"><TheoryTips styleId={style.id} tips={t.tips} /></TheorySection>
      <TheorySection title="Words worth knowing"><TheoryTerms terms={t.terms} /></TheorySection>
      <TheorySection title="See also"><TheoryRelated ids={t.related} /></TheorySection>
    </>
  );
  return (
    <TheoryBlock
      id={style.id}
      number={pad(style.number)}
      title={style.name}
      badge={<KindBadge style={style} />}
      top={top}
      mathHeading={rich ? 'The mathematics' : undefined}
      paragraphs={t.paragraphs}
      equations={t.equations}
      bottom={bottom}
      footer={<ButtonLink to={`/style/${style.id}`} variant="text">Open {style.name}</ButtonLink>}
    />
  );
}
