import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cadence — Le coaching sportif, repensé pour ici.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#0A0A0B",
          position: "relative",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background:
              "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255, 107, 74, 0.25), transparent)",
            filter: "blur(60px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              marginBottom: "32px",
            }}
          >
            CADENCE
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "64px",
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.1,
              }}
            >
              Le coaching sportif,
            </span>
            <span
              style={{
                fontSize: "64px",
                fontWeight: 800,
                background: "linear-gradient(90deg, #FF6B4A, #FF8F6B)",
                backgroundClip: "text",
                color: "transparent",
                lineHeight: 1.1,
              }}
            >
              repensé pour ici.
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "40px",
              padding: "12px 24px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "999px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <span style={{ fontSize: "24px" }}>🇨🇦</span>
            <span
              style={{
                fontSize: "20px",
                color: "#A1A1AA",
              }}
            >
              Conçue au Québec, en français
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
