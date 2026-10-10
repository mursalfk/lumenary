import { cx } from '../../utils/cx.js';

// Label (+ optional value readout) with its control. `inline` puts the control beside the label.
export default function Field({ label, htmlFor, labelId, aside, inline = false, children }) {
  const Label = htmlFor ? 'label' : 'span';
  return (
    <div className={cx('field', inline && 'inline')}>
      <Label className="name" htmlFor={htmlFor} id={labelId}>{label}</Label>
      {aside != null && <span className="aside">{aside}</span>}
      <div className="control">{children}</div>
    </div>
  );
}
