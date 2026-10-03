export function AnimatedLenses() {
  return (
    <div className="lenses" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} style={{ animationDelay: `-${i * 6}s` }} />
      ))}
    </div>
  );
}
