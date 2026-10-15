export default function LoginIllustration({ className }) {
  return (
    <svg
      viewBox="0 0 500 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden="true"
    >
      {/* Formes de fond */}
      <ellipse cx="250" cy="360" rx="200" ry="20" fill="currentColor" opacity="0.08" />
      <circle cx="120" cy="100" r="60" fill="currentColor" opacity="0.06" />
      <circle cx="400" cy="80" r="40" fill="currentColor" opacity="0.08" />
      <circle cx="380" cy="320" r="30" fill="currentColor" opacity="0.06" />

      {/* Étagère / structure */}
      <rect x="100" y="200" width="300" height="8" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="100" y="290" width="300" height="8" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="100" y="200" width="6" height="98" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="394" y="200" width="6" height="98" rx="2" fill="currentColor" opacity="0.25" />

      {/* Boîtes — étage haut */}
      <rect x="120" y="150" width="55" height="50" rx="4" fill="currentColor" opacity="0.5" />
      <rect x="185" y="160" width="45" height="40" rx="4" fill="currentColor" opacity="0.35" />
      <rect x="240" y="140" width="60" height="60" rx="4" fill="currentColor" opacity="0.65" />
      <rect x="310" y="165" width="50" height="35" rx="4" fill="currentColor" opacity="0.4" />

      {/* Boîtes — étage bas */}
      <rect x="120" y="240" width="65" height="50" rx="4" fill="currentColor" opacity="0.55" />
      <rect x="195" y="250" width="50" height="40" rx="4" fill="currentColor" opacity="0.4" />
      <rect x="255" y="235" width="55" height="55" rx="4" fill="currentColor" opacity="0.7" />
      <rect x="320" y="250" width="60" height="40" rx="4" fill="currentColor" opacity="0.45" />

      {/* Lignes de "scotch" sur les boîtes */}
      <line x1="145" y1="150" x2="145" y2="200" stroke="white" strokeWidth="2" opacity="0.4" />
      <line x1="270" y1="140" x2="270" y2="200" stroke="white" strokeWidth="2" opacity="0.5" />
      <line x1="145" y1="240" x2="145" y2="290" stroke="white" strokeWidth="2" opacity="0.4" />
      <line x1="282" y1="235" x2="282" y2="290" stroke="white" strokeWidth="2" opacity="0.5" />

      {/* Chariot */}
      <g transform="translate(60 280)">
        <rect x="0" y="0" width="45" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.7" />
        <line x1="0" y1="0" x2="-8" y2="-30" stroke="currentColor" strokeWidth="3" opacity="0.7" strokeLinecap="round" />
        <line x1="-8" y1="-30" x2="10" y2="-30" stroke="currentColor" strokeWidth="3" opacity="0.7" strokeLinecap="round" />
        <circle cx="10" cy="32" r="5" fill="currentColor" opacity="0.7" />
        <circle cx="35" cy="32" r="5" fill="currentColor" opacity="0.7" />
      </g>

      {/* Petite plante */}
      <g transform="translate(420 300)">
        <rect x="-8" y="20" width="16" height="14" rx="2" fill="currentColor" opacity="0.5" />
        <path d="M0 20 C -8 0, 8 0, 0 20 Z" fill="currentColor" opacity="0.7" />
        <path d="M0 20 C -15 5, -20 15, 0 20 Z" fill="currentColor" opacity="0.4" />
        <path d="M0 20 C 15 5, 20 15, 0 20 Z" fill="currentColor" opacity="0.5" />
      </g>
    </svg>
  )
}