import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { monoFont, COLORS } from "../constants/theme";
import type { TerminalLine } from "../constants/terminal-data";

type TerminalOutputProps = {
  lines: TerminalLine[];
  commandLine?: string;
  startFrame?: number;
  framesPerLine?: number;
  lineHeight?: number;
  fontSize?: number;
  containerHeight?: number;
};

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  lines,
  commandLine,
  startFrame = 0,
  framesPerLine = 2,
  lineHeight = 22,
  fontSize = 14,
  containerHeight = 460,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const visibleLineCount = Math.min(
    lines.length,
    Math.floor(localFrame / framesPerLine) + 1,
  );

  const commandHeight = commandLine ? lineHeight : 0;
  const totalContentHeight = lines.length * lineHeight + commandHeight;
  const needsScroll = totalContentHeight > containerHeight;

  let scrollY = 0;
  if (needsScroll && visibleLineCount > 0) {
    const visibleContentHeight = visibleLineCount * lineHeight + commandHeight;
    if (visibleContentHeight > containerHeight) {
      const maxScroll = totalContentHeight - containerHeight;
      const scrollProgress =
        (visibleContentHeight - containerHeight) /
        (totalContentHeight - containerHeight);
      scrollY = interpolate(scrollProgress, [0, 1], [0, maxScroll], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }
  }

  return (
    <div
      style={{
        fontFamily: monoFont,
        fontSize,
        lineHeight: `${lineHeight}px`,
        whiteSpace: "pre",
        transform: `translateY(-${scrollY}px)`,
      }}
    >
      {commandLine && (
        <div style={{ height: lineHeight }}>
          <span style={{ color: COLORS.green }}>$ </span>
          <span style={{ color: COLORS.textPrimary }}>{commandLine}</span>
        </div>
      )}
      {lines.slice(0, visibleLineCount).map((line, i) => {
        const lineOpacity = interpolate(
          localFrame - i * framesPerLine,
          [0, 3],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div
            key={`line-${i}`}
            style={{
              color: line.color ?? COLORS.textPrimary,
              opacity: lineOpacity,
              height: lineHeight,
              paddingLeft: line.indent ? line.indent * 16 : 0,
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
};
