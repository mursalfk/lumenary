import { useThumb } from '../thumbs.js';

// Injects a `thumb` data-URL prop for props.style.
export default function withThumb(Component) {
  function WithThumb(props) {
    const thumb = useThumb(props.style.id);
    return <Component {...props} thumb={thumb} />;
  }
  WithThumb.displayName = `withThumb(${Component.displayName || Component.name})`;
  return WithThumb;
}
