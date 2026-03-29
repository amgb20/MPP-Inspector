import React from "react";
import {
  AbsoluteFill,
  spring,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { monoFont, sansFont, COLORS } from "../constants/theme";

export const InstallFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const scale = interpolate(scaleSpring, [0, 1], [0.8, 1]);
  const opacity = scaleSpring;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: sansFont,
          fontSize: 18,
          color: COLORS.textMuted,
          fontWeight: 600,
          opacity,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Get started in seconds
      </div>
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 28,
          color: COLORS.cyan,
          fontWeight: 700,
          opacity,
          transform: `scale(${scale})`,
          backgroundColor: "rgba(0, 229, 255, 0.08)",
          padding: "16px 32px",
          borderRadius: 8,
          border: `1px solid ${COLORS.cyan}33`,
        }}
      >
        npm install -g mpp-inspector
      </div>
    </AbsoluteFill>
  );
};
