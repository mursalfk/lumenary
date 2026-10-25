// src/hoc/withRouteLookup.jsx
import { Navigate, useParams } from 'react-router-dom';

// Resolves a route parameter to an object and passes it down under `prop`; unknown values go home.
//   withRouteLookup({ param: 'id', find: getSection, prop: 'section' })(Page)
export default function withRouteLookup({ param, find, prop }) {
  return function wrap(Component) {
    function WithRouteLookup() {
      const value = find(useParams()[param]);
      if (!value) return <Navigate to="/" replace />;
      return <Component key={value.id} {...{ [prop]: value }} />;
    }
    WithRouteLookup.displayName = `withRouteLookup(${Component.displayName || Component.name})`;
    return WithRouteLookup;
  };
}
