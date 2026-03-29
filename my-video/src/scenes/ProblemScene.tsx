import React from "react";
import {
  AbsoluteFill,
  spring,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { monoFont, sansFont, COLORS } from "../constants/theme";
import { TerminalWindow } from "../components/TerminalWindow";

const CURL_LINES = [
  { text: "$ curl -sI https://api.example.com/v1/data", color: COLORS.green },
  { text: "", color: COLORS.textPrimary },
  { text: "HTTP/1.1 402 Payment Required", color: COLORS.red },
  { text: "Content-Type: application/json", color: COLORS.textMuted },
  { text: 'WWW-Authenticate: Payment id="qB3wErTyU7iOp', color: COLORS.yellow },
  { text: '  AsD9fGhJk", realm="mpp.dev", method="tempo",', color: COLORS.yellow },
  { text: '  intent="charge", expires="2025-01-15T12:05:', color: COLORS.yellow },
  { text: '  00Z", request="eyJhbW91bnQiOiIxMDAwIiwiY3Vy', color: COLORS.yellow },
  { text: '  cmVuY3kiOiJ1c2QiLCJyZWNpcGllbnQiOiIweGYz', color: COLORS.yellow },
  { text: '  OUZkNmU1MWFhZDg4RjZGNGNlNmFCODgyNzI3MDlj', color: COLORS.yellow },
  { text: '  ZmZGYjkyMjY2IiwiY2hhaW5JZCI6NDI0MzF9"', color: COLORS.yellow },
];

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const terminalSpring = spring({
    frame,
    fps,
    delay: 5,
    config: { damping: 200 },
  });

  const questionSpring = spring({
    frame,
    fps,
    delay: 40,
    config: { damping: 200 },
  });

  const terminalScale = interpolate(terminalSpring, [0, 1], [0.95, 1]);
  const questionOpacity = interpolate(questionSpring, [0, 1], [0, 1]);
  const questionY = interpolate(questionSpring, [0, 1], [10, 0]);

  const visibleLines = Math.min(
    CURL_LINES.length,
    Math.floor(interpolate(frame, [10, 50], [0, CURL_LINES.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <div
        style={{
          opacity: terminalSpring,
          transform: `scale(${terminalScale})`,
        }}
      >
        <TerminalWindow title="bash — curl" width={900} height={320}>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 13,
              lineHeight: "20px",
              whiteSpace: "pre",
            }}
          >
            {CURL_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} style={{ color: line.color }}>{line.text}</div>
            ))}
          </div>
        </TerminalWindow>
      </div>

      <div
        style={{
          fontFamily: sansFont,
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.textMuted,
          opacity: questionOpacity,
          transform: `translateY(${questionY}px)`,
          textAlign: "center",
        }}
      >
        What does this mean? <span style={{ color: COLORS.cyan }}>Good luck parsing that.</span>
      </div>
    </AbsoluteFill>
  );
};
