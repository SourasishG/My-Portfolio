import { ImageResponse } from "next/og";

export const alt = "Sourasish Ghosh — Full-Stack Developer | SIGNAL";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#07080B",
          color: "#F3F5F9",
          border: "1px solid rgba(255,255,255,0.14)",
          fontFamily: "sans-serif",
          backgroundImage:
            "radial-gradient(circle at 84% 28%, rgba(77, 168, 255, 0.22), transparent 44%), radial-gradient(circle at 72% 74%, rgba(179, 136, 245, 0.16), transparent 42%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontSize: 20,
            letterSpacing: "0.14em",
            color: "#4DA8FF",
          }}
        >
          <span>[ SG ] // SIGNAL PORTFOLIO</span>
          <span style={{ color: "#8A90A0" }}>KOLKATA, INDIA · 22.57° N</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "880px",
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              color: "#F3F5F9",
            }}
          >
            Sourasish Ghosh
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: "#8A90A0",
              lineHeight: 1.3,
            }}
          >
            Full-Stack Developer — B.Tech CSE (2023–2027)
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#F3F5F9",
              opacity: 0.9,
            }}
          >
            I design, develop, and build digital experiences.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.16)",
            fontSize: 20,
            color: "#8A90A0",
          }}
        >
          <span>MUZO · OFFICE AID · AWS DEVOPS TRAINING</span>
          <span style={{ color: "#FF5B1F" }}>REACT · NODE.JS · POSTGRESQL · MONGODB</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
