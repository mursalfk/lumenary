import Section from '../ui/Section.jsx';
import LinkButton from '../ui/LinkButton.jsx';
import ControlList from '../controls/ControlList.jsx';

export default function TreatmentSection({ defs, values, onChange, onReset }) {
  return (
    <Section title="Treatment" action={<LinkButton onClick={onReset}>Reset</LinkButton>}>
      <ControlList defs={defs} values={values} onChange={onChange} />
    </Section>
  );
}
