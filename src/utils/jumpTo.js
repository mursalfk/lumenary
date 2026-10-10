// Click handler for in-page anchors; works under both BrowserRouter and HashRouter.
export const jumpTo = (e) => {
  const id = e.currentTarget.getAttribute('href').replace('#', '');
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: 'smooth' });
};
