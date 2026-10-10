import './SectionHead.scss';

export default function SectionHead({ title, text }) {
  return (
    <header className="section-head">
      <h2>{title}</h2>
      <p>{text}</p>
    </header>
  );
}
