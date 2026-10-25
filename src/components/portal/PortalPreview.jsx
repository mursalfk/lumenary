// src/components/portal/PortalPreview.jsx
import { useThumb } from '../../thumbs.js';

// One small preview picture of a treatment (blank until its thumbnail is ready).
export default function PortalPreview({ id }) {
  const src = useThumb(id);
  return <span className="preview">{src && <img src={src} alt="" />}</span>;
}
