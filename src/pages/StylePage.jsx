import { compose } from '../utils/compose.js';
import withStyleRoute from '../hoc/withStyleRoute.jsx';
import withDocumentTitle from '../hoc/withDocumentTitle.jsx';
import Studio from '../components/studio/Studio.jsx';

// Route -> style lookup -> document title -> workspace.
export default compose(
  withStyleRoute,
  withDocumentTitle(({ style }) => `${style.name} — Lumenary`)
)(Studio);
