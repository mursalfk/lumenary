// src/components/portal/PortalList.jsx
// A list of PortalRow items. Hovering one row dims the others.
export default function PortalList({ children, label }) {
  return <ol className="portal-list" aria-label={label}>{children}</ol>;
}
