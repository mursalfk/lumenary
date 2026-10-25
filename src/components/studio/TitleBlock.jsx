// src/components/studio/TitleBlock.jsx
import Eyebrow from '../ui/Eyebrow.jsx';
import { pad } from '../../utils/format.js';

export default function TitleBlock({ style, total }) {
  return (
    <div className="title-block">
      <Eyebrow>{pad(style.number)} of {total}</Eyebrow>
      <h1>{style.name}</h1>
    </div>
  );
}
