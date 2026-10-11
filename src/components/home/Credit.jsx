// "Created with 💓 by Mursal", the name linking to the portfolio.
export default function Credit({ name, href }) {
  return (
    <p className="credit">
      Created with <span role="img" aria-label="love">💓</span> by{' '}
      <a href={href} target="_blank" rel="noopener noreferrer">{name}</a>
    </p>
  );
}
