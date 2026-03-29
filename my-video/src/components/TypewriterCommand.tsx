import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { monoFont, COLORS } from "../constants/theme";

type TypewriterCommandProps = {
  command: string;
  charFrames?: number;
  fontSize?: number;
  promptColor?: string;
};

const CURSOR_BLINK_FRAMES = 16;

export const TypewriterCommand: React.FC<TypewriterCommandProps> = ({
  command,
  charFrames = 1,
  fontSize = 14,
  promptColor = COLORS.green,
}) => {
  const frame = useCurrentFrame();

  const typedChars = Math.min(
    command.length,
    Math.floor(frame / charFrames),
  );

  const typedText = command.slice(0, typedChars);
  const isComplete = typedChars >= command.length;

  const cursorOpacity = isComplete
    ? interpolate(
        frame % CURSOR_BLINK_FRAMES,
        [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
        [1, 0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;

  return (
    <div
      style={{
        fontFamily: monoFont,
        fontSize,
        lineHeight: "22px",
        whiteSpace: "pre",
      }}
    >
      <span style={{ color: promptColor }}>$ </span>
      <span style={{ color: COLORS.textPrimary }}>{typedText}</span>
      <span
        style={{
          color: COLORS.textPrimary,
          opacity: cursorOpacity,
        }}
      >
        {"\u258C"}
      </span>
    </div>
  );
};

type InstantCommandProps = {
  command: string;
  fontSize?: number;
  promptColor?: string;
};

export const InstantCommand: React.FC<InstantCommandProps> = ({
  command,
  fontSize = 14,
  promptColor = COLORS.green,
}) => {
  return (
    <div
      style={{
        fontFamily: monoFont,
        fontSize,
        lineHeight: "22px",
        whiteSpace: "pre",
      }}
    >
      <span style={{ color: promptColor }}>$ </span>
      <span style={{ color: COLORS.textPrimary }}>{command}</span>
    </div>
  );
};
