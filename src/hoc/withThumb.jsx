import { useEffect } from 'react';
import { requestThumb, useThumb } from '../thumbs.js';

// Injects a `thumb` data-URL prop for props.style, and asks for that preview to be made if it is not ready.
export default function withThumb(Component) {
  function WithThumb(props) {
    const { style } = props;
    const thumb = useThumb(style.id);
    useEffect(() => { requestThumb(style); }, [style]);
    return <Component {...props} thumb={thumb} />;
  }
  WithThumb.displayName = `withThumb(${Component.displayName || Component.name})`;
  return WithThumb;
}
