// Art deco sunrise: a half sun with fanned rays and stepped horizon bands.
export function Sunburst({ className = "", bg = "#0a2329" }: { className?: string; bg?: string }) {
  const rays = Array.from({ length: 17 }, (_, i) => -90 + (i * 180) / 16);
  return (
    <svg viewBox="0 0 400 210" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3a5b6" />
          <stop offset="1" stopColor="#d6b25e" />
        </linearGradient>
      </defs>
      <g stroke="#d6b25e" strokeWidth="1.2" opacity="0.75">
        {rays.map((a) => {
          const r = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={200 + Math.sin(r) * 92}
              y1={200 - Math.cos(r) * 92}
              x2={200 + Math.sin(r) * 196}
              y2={200 - Math.cos(r) * 196}
            />
          );
        })}
      </g>
      <circle cx="200" cy="200" r="84" fill="url(#sun)" />
      <g fill={bg}>
        <rect x="100" y="150" width="200" height="6" />
        <rect x="100" y="166" width="200" height="7" />
        <rect x="100" y="182" width="200" height="9" />
      </g>
      <rect x="0" y="198" width="400" height="12" fill={bg} />
    </svg>
  );
}

export function SunMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 22" className={className} aria-hidden="true">
      <g stroke="#d6b25e" strokeWidth="1.4">
        <line x1="20" y1="20" x2="20" y2="1" />
        <line x1="20" y1="20" x2="7" y2="5" />
        <line x1="20" y1="20" x2="33" y2="5" />
        <line x1="20" y1="20" x2="1" y2="14" />
        <line x1="20" y1="20" x2="39" y2="14" />
      </g>
      <path d="M11 20a9 9 0 0 1 18 0z" fill="#f3a5b6" />
    </svg>
  );
}
