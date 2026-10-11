// Gives a 3D-transformed child a perspective frame: withPerspective(Component, 1100)
export default function withPerspective(Component, perspective = 1000) {
  function WithPerspective(props) {
    return (
      <div className="perspective" style={{ perspective }}>
        <Component {...props} />
      </div>
    );
  }
  WithPerspective.displayName = `withPerspective(${Component.displayName || Component.name})`;
  return WithPerspective;
}
