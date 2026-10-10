import { isLive, kindLabel } from '../../utils/format.js';

export default function KindBadge({ style }) {
  return (
    <span className="kind-badge">
      {isLive(style) && <i aria-hidden="true" />}
      {kindLabel(style)}
    </span>
  );
}
