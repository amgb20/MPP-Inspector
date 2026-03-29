import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { monoFont, COLORS } from "../constants/theme";

type CaptionProps = {
  text: string;
  fontSize?: number;
  color?: string;
  delayFrames?: number;
};

export const Caption: React.FC<CaptionProps> = ({
  text,
  fontSize = 26,
  color = COLORS.white,
  delayFrames = 30,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame - delayFrames,
    [0, 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const translateY = interpolate(
    frame - delayFrames,
    [0, 15],
    [-10, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        fontFamily: monoFont,
        fontSize,
        fontWeight: 600,
        color,
        opacity,
        transform: `translateY(${translateY}px)`,
        marginBottom: 24,
      }}
    >
      {text}
    </div>
  );
};
