export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0 md:h-10 md:w-10" aria-hidden>
        <circle cx="32" cy="32" r="30" fill="#b85c38" />
        <path d="M14 42c6-10 10-14 14-14s6 6 10 6 8-8 12-14" stroke="#f8f2e7" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="44" cy="20" r="4" fill="#e0b56a" />
      </svg>
      <span className="leading-none">
        <span className={`block font-display text-xl font-semibold md:text-2xl ${light ? 'text-cream' : 'text-earth'}`}>Wildbeat</span>
        <span className={`block text-[10px] font-semibold tracking-[0.25em] uppercase ${light ? 'text-sand-light' : 'text-olive'}`}>
          Rwanda Tours
        </span>
      </span>
    </span>
  )
}
