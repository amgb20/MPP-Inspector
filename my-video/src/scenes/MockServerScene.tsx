import React from "react";
import {
  AbsoluteFill,
  spring,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sansFont, COLORS } from "../constants/theme";

export const MockServerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textSpring = spring({
    frame,
    fps,
    delay: 10,
    config: { damping: 200 },
  });

  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);
  const textY = interpolate(textSpring, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: sansFont,
          fontSize: 42,
          fontWeight: 700,
          color: COLORS.white,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        Includes a <span style={{ color: COLORS.cyan }}>local mock server</span>
        <br />
        for testing without spending crypto
        <br />
        and other payment methods.
      </div>
    </AbsoluteFill>
  );
};
