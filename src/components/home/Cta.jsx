import './Cta.scss';

export default function Cta({ href, children }) {
  return <a className="cta" href={href}>{children} <span aria-hidden="true">↓</span></a>;
}
