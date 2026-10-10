import './AboutColumn.scss';

export default function AboutColumn({ title, text }) {
  return (
    <div className="about-column">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
