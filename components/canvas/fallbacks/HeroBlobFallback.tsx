/**
 * Vector SVG Fibonacci constellation fallback rendered whenever reduced-motion,
 * low-tier GPU, or before WebGL mounts.
 */
export function HeroBlobFallback({
  className,
  label = "Particle constellation sphere illustration",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 52% 48%, rgba(77, 168, 255, 0.16) 0%, rgba(179, 136, 245, 0.1) 36%, rgba(0, 0, 0, 0) 68%)",
      }}
    >
      <svg
        viewBox="0 0 420 420"
        style={{ width: "min(76%, 440px)", height: "auto" }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="s1FallbackGlow" cx="48%" cy="46%" r="54%">
            <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#B388F5" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#B388F5" stopOpacity="0.06" />
          </radialGradient>
        </defs>
        <circle
          cx="210"
          cy="210"
          r="156"
          fill="none"
          stroke="url(#s1FallbackGlow)"
          strokeWidth="1.25"
          strokeDasharray="2 7"
        />
        <circle
          cx="210"
          cy="210"
          r="128"
          fill="none"
          stroke="#4DA8FF"
          strokeOpacity="0.65"
          strokeWidth="1.2"
          strokeDasharray="1.5 6"
        />
        <circle
          cx="210"
          cy="210"
          r="96"
          fill="none"
          stroke="#B388F5"
          strokeOpacity="0.6"
          strokeWidth="1.15"
          strokeDasharray="1.5 5.5"
        />
        <circle
          cx="210"
          cy="210"
          r="62"
          fill="none"
          stroke="#F3F5F9"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeDasharray="1 5"
        />
        <path
          d="M66 196 Q 152 132 222 188 T 356 220"
          fill="none"
          stroke="#4DA8FF"
          strokeOpacity="0.65"
          strokeWidth="1.2"
          strokeDasharray="2 5"
        />
        <path
          d="M84 244 Q 178 186 248 232 T 340 184"
          fill="none"
          stroke="#B388F5"
          strokeOpacity="0.65"
          strokeWidth="1.2"
          strokeDasharray="2 5"
        />
      </svg>
    </div>
  );
}
