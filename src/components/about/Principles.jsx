// src/components/about/Principles.jsx
import AboutColumn from '../home/AboutColumn.jsx';

// The same small column used on the home page, in a grid of two.
export default function Principles({ items }) {
  return (
    <div className="principles">
      {items.map((item) => <AboutColumn key={item.title} {...item} />)}
    </div>
  );
}
