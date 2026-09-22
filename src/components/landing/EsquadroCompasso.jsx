export default function EsquadroCompasso({ className = "h-16 w-16" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} role="img" aria-label="Esquadro e compasso">
      <circle cx="50" cy="14" r="4" />
      <path d="M47 19 20 79m33-60 27 60M24 69l-6 13m58-13 6 13" />
      <path d="m17 52 33 34 33-34M29 52l21 22 21-22" />
    </svg>
  );
}