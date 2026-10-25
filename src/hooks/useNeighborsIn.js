// src/hooks/useNeighborsIn.js
// Previous and next item of a list, by id (wraps around). Works for styles, sections and theory groups.
export default function useNeighborsIn(items, id) {
  const i = Math.max(0, items.findIndex((x) => x.id === id));
  return {
    prev: items[(i + items.length - 1) % items.length],
    next: items[(i + 1) % items.length],
  };
}
