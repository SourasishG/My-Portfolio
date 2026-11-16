/**
 * Monochrome crisp SVG chrome arch composition rendered whenever reduced-motion,
 * low GPU tier, or before WebGL mounts.
 */
export function ChromeArchesFallback() {
  return (
    <svg
      viewBox="0 0 640 480"
      width="100%"
      height="100%"
      fill="none"
      role="img"
      aria-label="Monochrome sculpted chrome arch illustration"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <radialGradient id="s5-bg-glow" cx="50%" cy="48%" r="58%">
          <stop offset="0%" stopColor="#1B2232" stopOpacity="0.65" />
          <stop offset="65%" stopColor="#0D1017" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#07080B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="s5-chrome-primary" x1="0%" y1="15%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#3B4252" />
          <stop offset="28%" stopColor="#E8EDF5" />
          <stop offset="48%" stopColor="#FFFFFF" />
          <stop offset="72%" stopColor="#8A90A0" />
          <stop offset="100%" stopColor="#1A1F2B" />
        </linearGradient>
        <linearGradient id="s5-chrome-secondary" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E2433" />
          <stop offset="35%" stopColor="#C8D2E3" />
          <stop offset="52%" stopColor="#4DA8FF" stopOpacity="0.82" />
          <stop offset="80%" stopColor="#E8EDF5" />
          <stop offset="100%" stopColor="#141821" />
        </linearGradient>
        <linearGradient id="s5-chrome-rim" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#8A90A0" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#F3F5F9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <rect width="640" height="480" fill="url(#s5-bg-glow)" />

      {/* Subtle architectural reference crosshair */}
      <line x1="64" y1="240" x2="576" y2="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1="320" y1="48" x2="320" y2="432" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Counter-Catenary Arch */}
      <path
        d="M 110 152 C 205 390, 445 384, 534 166"
        stroke="url(#s5-chrome-secondary)"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M 110 152 C 205 390, 445 384, 534 166"
        stroke="#FFFFFF"
        strokeOpacity="0.32"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Horizon Halo Loop */}
      <ellipse
        cx="320"
        cy="264"
        rx="222"
        ry="58"
        transform="rotate(-11 320 264)"
        stroke="url(#s5-chrome-rim)"
        strokeWidth="7"
        opacity="0.7"
      />

      {/* Primary Vault Arch */}
      <path
        d="M 78 342 C 154 78, 486 78, 562 342"
        stroke="url(#s5-chrome-primary)"
        strokeWidth="30"
        strokeLinecap="round"
      />
      <path
        d="M 78 342 C 154 78, 486 78, 562 342"
        stroke="#FFFFFF"
        strokeOpacity="0.55"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Crown Cantilever Arc */}
      <path
        d="M 176 286 C 232 142, 412 138, 474 280"
        stroke="url(#s5-chrome-primary)"
        strokeWidth="15"
        strokeLinecap="round"
        opacity="0.92"
      />
    </svg>
  );
}
