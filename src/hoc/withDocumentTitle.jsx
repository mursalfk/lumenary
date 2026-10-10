import useDocumentTitle from '../hooks/useDocumentTitle.js';

// withDocumentTitle(props => 'Title')(Component)
export default function withDocumentTitle(getTitle) {
  return function wrap(Component) {
    function WithDocumentTitle(props) {
      useDocumentTitle(getTitle(props));
      return <Component {...props} />;
    }
    WithDocumentTitle.displayName = `withDocumentTitle(${Component.displayName || Component.name})`;
    return WithDocumentTitle;
  };
}
