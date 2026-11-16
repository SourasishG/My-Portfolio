/**
 * Crisp SVG topographic sphere fallback for low-tier devices,
 * prefers-reduced-motion, or initial render before WebGL mounts.
 */
export function ContourSphereFallback({
  className,
  split = false,
  label = "Static topographic contour sphere illustration",
}: {
  className?: string;
  split?: boolean;
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
      }}
    >
      <svg
        viewBox="0 0 420 420"
        style={{ width: "min(72%, 420px)", height: "auto" }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="s2UpperClip">
            <polygon points="0,0 420,0 420,175 0,255" />
          </clipPath>
          <clipPath id="s2LowerClip">
            <polygon points="0,255 420,175 420,420 0,420" />
          </clipPath>
        </defs>

        <g
          clipPath="url(#s2UpperClip)"
          transform={split ? "translate(-10,-16)" : undefined}
        >
          <circle
            cx="210"
            cy="210"
            r="148"
            fill="#07080B"
            stroke="#F3F5F9"
            strokeWidth="1.2"
          />
          <ellipse
            cx="210"
            cy="186"
            rx="136"
            ry="52"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.85"
            strokeWidth="1.15"
          />
          <ellipse
            cx="210"
            cy="156"
            rx="116"
            ry="38"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.72"
            strokeWidth="1.1"
          />
          <ellipse
            cx="210"
            cy="128"
            rx="88"
            ry="26"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.62"
            strokeWidth="1.05"
          />
          <ellipse
            cx="210"
            cy="102"
            rx="54"
            ry="15"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <path
            d="M68 205 C 128 164, 240 240, 352 192"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.8"
            strokeWidth="1.2"
          />
          <path
            d="M88 150 C 165 112, 260 176, 336 140"
            fill="none"
            stroke="#FF5B1F"
            strokeOpacity={split ? "0.78" : "0.28"}
            strokeWidth="1.2"
          />
        </g>

        <g
          clipPath="url(#s2LowerClip)"
          transform={split ? "translate(10,16)" : undefined}
        >
          <circle
            cx="210"
            cy="210"
            r="148"
            fill="#07080B"
            stroke="#F3F5F9"
            strokeWidth="1.2"
          />
          <ellipse
            cx="210"
            cy="236"
            rx="138"
            ry="52"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.85"
            strokeWidth="1.15"
          />
          <ellipse
            cx="210"
            cy="268"
            rx="112"
            ry="36"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.72"
            strokeWidth="1.1"
          />
          <ellipse
            cx="210"
            cy="296"
            rx="82"
            ry="23"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.62"
            strokeWidth="1.05"
          />
          <ellipse
            cx="210"
            cy="322"
            rx="46"
            ry="13"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <path
            d="M74 238 C 154 275, 258 196, 348 242"
            fill="none"
            stroke="#FF5B1F"
            strokeOpacity={split ? "0.85" : "0.28"}
            strokeWidth="1.2"
          />
        </g>
      </svg>
    </div>
  );
}
