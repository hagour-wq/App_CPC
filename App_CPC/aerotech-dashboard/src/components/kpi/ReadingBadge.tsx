export function ReadingBadge({ text }: { text: string }) {
  const status = /Levier fort|résiste|progresse/.test(text)
    ? 'good'
    : /Proportionnel/.test(text)
      ? 'blue'
      : /érodée/.test(text)
        ? 'watch'
        : /Sens contraire|chute plus vite/.test(text)
          ? 'bad'
          : 'neutral';
  return (
    <span
      className={'badge ' + status}
      title={
        text === 'n.s.'
          ? 'Variation du CA trop faible ou REX précédent non positif.'
          : text === '–'
            ? 'Comparaison non disponible sur cette période.'
            : text
      }
    >
      {text}
    </span>
  );
}
