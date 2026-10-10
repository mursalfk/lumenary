import { jumpTo } from '../../utils/jumpTo.js';

export default function Cta({ href, children }) {
  return <a className="cta" href={href} onClick={jumpTo}>{children} <span aria-hidden="true">↓</span></a>;
}
