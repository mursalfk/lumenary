import { scrollToId } from './scroller.js';

// Click handler for in-page anchors; works under both BrowserRouter and MemoryRouter.
export const jumpTo = (e) => {
  const id = e.currentTarget.getAttribute('href').replace('#', '');
  if (scrollToId(id)) e.preventDefault();
};
