import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, sansFont } from "../constants/theme";

type LinkedInLayoutProps = {
  children: React.ReactNode;
};

export const LinkedInLayout: React.FC<LinkedInLayoutProps> = ({
  children,
}) => {
  const containerWidth = 1080;
  const scale = containerWidth / 1280;
  const scaledHeight = 720 * scale;

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
          position: "absolute",
          top: 30,
          fontFamily: sansFont,
          fontSize: 18,
          fontWeight: 600,
          color: COLORS.textMuted,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        MPP Inspector
      </div>

      <div
        style={{
          width: containerWidth,
          height: scaledHeight,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 1280,
            height: 720,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
