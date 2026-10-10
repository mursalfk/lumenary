import './DisplayTitle.scss';

export default function DisplayTitle({ lead, italic, tail, className }) {
  return (
    <h1 className={['display-title', className].filter(Boolean).join(' ')}>
      <span className="lead">{lead}</span>
      <span className="italic">{italic}</span>
      <span className="tail">{tail}</span>
    </h1>
  );
}
