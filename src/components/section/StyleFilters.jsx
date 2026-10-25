// src/components/section/StyleFilters.jsx
import Segmented from '../ui/Segmented.jsx';
import TextInput from '../ui/TextInput.jsx';

const KINDS = [['all', 'All'], ['still', 'Still'], ['live', 'Live']];

// The bar above a list of names: a kind switch (only when the section has both kinds), a name search (only
// when the section is long) and a count. Each part appears only when it has something to do.
export default function StyleFilters({ kind, onKind, query, onQuery, shown, total, withKind, withSearch }) {
  return (
    <div className="style-filters">
      <p className="count" aria-live="polite">{shown === total ? `${total} treatments` : `${shown} of ${total} treatments`}</p>
      <div className="controls">
        {withKind && <span id="kind-label" className="sr-only">Show</span>}
        {withSearch && (
          <label className="find">
            <span className="sr-only">Find a treatment</span>
            <TextInput value={query} onChange={onQuery} placeholder="Find a treatment" />
          </label>
        )}
        {withKind && <Segmented options={KINDS} value={kind} onChange={onKind} labelledBy="kind-label" />}
      </div>
    </div>
  );
}
