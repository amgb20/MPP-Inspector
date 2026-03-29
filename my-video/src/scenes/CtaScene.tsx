import React from "react";
import {
  AbsoluteFill,
  Img,
  spring,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { monoFont, sansFont, COLORS } from "../constants/theme";

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const githubSpring = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 15, stiffness: 80 },
  });

  const starSpring = spring({
    frame,
    fps,
    delay: 10,
    config: { damping: 200 },
  });

  const urlSpring = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });

  const badgeSpring = spring({
    frame,
    fps,
    delay: 30,
    config: { damping: 200 },
  });

  const npmSpring = spring({
    frame,
    fps,
    delay: 40,
    config: { damping: 200 },
  });

  const githubScale = interpolate(githubSpring, [0, 1], [0.3, 1]);
  const githubRotation = interpolate(githubSpring, [0, 1], [-180, 0]);

  const starPulse = interpolate(
    frame % 60,
    [0, 15, 30, 45, 60],
    [1, 1.15, 1, 1.15, 1],
  );

  const starScale = interpolate(starSpring, [0, 1], [0.5, 1]);

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
      {/* GitHub logo with spin-in animation */}
      <Img
        src={staticFile("github.svg")}
        style={{
          width: 90,
          height: 90,
          opacity: githubSpring,
          transform: `scale(${githubScale}) rotate(${githubRotation}deg)`,
          filter: "invert(1)",
        }}
      />

      {/* Star us on GitHub */}
      <div
        style={{
          fontFamily: sansFont,
          fontSize: 36,
          fontWeight: 700,
          color: COLORS.white,
          opacity: starSpring,
          transform: `scale(${starScale})`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 12,
        }}
      >
        <span
          style={{
            color: COLORS.yellow,
            fontSize: 40,
            display: "inline-block",
            transform: `scale(${starPulse})`,
          }}
        >
          ★
        </span>
        Star us on GitHub
      </div>

      {/* GitHub URL */}
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.cyan,
          opacity: urlSpring,
          marginTop: 8,
        }}
      >
        github.com/amgb20/MPP-Inspector
      </div>

      {/* Open source badge */}
      <div
        style={{
          fontFamily: sansFont,
          fontSize: 18,
          color: COLORS.textMuted,
          opacity: badgeSpring,
          marginTop: 4,
        }}
      >
        100% Open Source | MIT License
      </div>

      {/* npm install */}
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 18,
          color: COLORS.cyan,
          opacity: npmSpring,
          marginTop: 16,
          backgroundColor: "rgba(0, 229, 255, 0.08)",
          padding: "10px 24px",
          borderRadius: 6,
          border: `1px solid ${COLORS.cyan}33`,
        }}
      >
        npm install -g mpp-inspector
      </div>
    </AbsoluteFill>
  );
};
