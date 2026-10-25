// src/components/about/ProjectList.jsx
import ProjectRow from './ProjectRow.jsx';

export default function ProjectList({ items }) {
  return (
    <ul className="project-list" aria-label="Projects">
      {items.map((p) => <ProjectRow key={p.title} {...p} />)}
    </ul>
  );
}
