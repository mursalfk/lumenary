import { Navigate, useParams } from 'react-router-dom';
import { getStyle } from '../engine/styles/index.js';

// Resolves :slug to a style and passes it as the `style` prop; unknown slugs go home.
export default function withStyleRoute(Component) {
  function WithStyleRoute() {
    const { slug } = useParams();
    const style = getStyle(slug);
    if (!style) return <Navigate to="/" replace />;
    return <Component key={style.id} style={style} />;
  }
  WithStyleRoute.displayName = `withStyleRoute(${Component.displayName || Component.name})`;
  return WithStyleRoute;
}
