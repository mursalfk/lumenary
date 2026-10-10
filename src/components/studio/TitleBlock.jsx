import Eyebrow from '../ui/Eyebrow.jsx';
import { pad } from '../../utils/format.js';
import './TitleBlock.scss';

export default function TitleBlock({ style, total }) {
  return (
    <div className="title-block">
      <Eyebrow>{pad(style.number)} / {total}</Eyebrow>
      <h1>{style.name}</h1>
    </div>
  );
}
