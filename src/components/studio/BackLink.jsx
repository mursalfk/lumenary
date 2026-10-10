import { Link } from 'react-router-dom';

export default function BackLink({ to = '/', children }) {
  return <Link to={to} className="back-link"><span aria-hidden="true">←</span> {children}</Link>;
}
