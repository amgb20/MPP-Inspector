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
import { TerminalWindow } from "../components/TerminalWindow";

export const ClaudeCodeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftSpring = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 200 },
  });

  const rightSpring = spring({
    frame,
    fps,
    delay: 15,
    config: { damping: 200 },
  });

  const cmdSpring = spring({
    frame,
    fps,
    delay: 50,
    config: { damping: 200 },
  });

  const textSpring = spring({
    frame,
    fps,
    delay: 65,
    config: { damping: 200 },
  });

  const leftScale = interpolate(leftSpring, [0, 1], [0.9, 1]);
  const rightTranslateX = interpolate(rightSpring, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          opacity: Math.max(leftSpring, rightSpring),
        }}
      >
        {/* Left: Claude Code terminal */}
        <div
          style={{
            opacity: leftSpring,
            transform: `scale(${leftScale})`,
          }}
        >
          <TerminalWindow title="claude" width={560} height={320}>
            <div
              style={{
                border: `1px solid ${COLORS.textMuted}44`,
                borderRadius: 6,
                padding: 20,
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 20,
              }}
            >
              <Img
                src={staticFile("Claude_AI_symbol.svg")}
                style={{ width: 52, height: 52 }}
              />
              <div>
                <div
                  style={{
                    fontFamily: monoFont,
                    fontSize: 16,
                    fontWeight: 700,
                    color: COLORS.textPrimary,
                  }}
                >
                  * Welcome to Claude Code!
                </div>
                <div
                  style={{
                    fontFamily: monoFont,
                    fontSize: 14,
                    color: COLORS.textMuted,
                    marginTop: 4,
                  }}
                >
                  cwd: ~/mpp-inspector
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: `1px solid ${COLORS.textMuted}33`,
                paddingTop: 12,
                marginTop: "auto",
              }}
            >
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: 14,
                  color: COLORS.textPrimary,
                }}
              >
                <span style={{ color: COLORS.textMuted }}>&gt; </span>
                <span style={{ color: COLORS.cyan }}>
                  /mpp-inspector inspect https://mpp.dev/api/ping/paid
                </span>
              </div>
            </div>
          </TerminalWindow>
        </div>

        {/* Right: Claude Code branding */}
        <div
          style={{
            opacity: rightSpring,
            transform: `translateX(${rightTranslateX}px)`,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: sansFont,
              fontSize: 44,
              fontWeight: 700,
              color: COLORS.white,
              lineHeight: 1.1,
            }}
          >
            Claude Code
          </div>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 40,
              fontWeight: 700,
              fontStyle: "italic",
              color: COLORS.cyan,
              lineHeight: 1.1,
            }}
          >
            /mpp-inspector
          </div>
        </div>
      </div>

      {/* Plugin command */}
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 16,
          color: COLORS.cyan,
          opacity: cmdSpring,
          backgroundColor: "rgba(0, 229, 255, 0.06)",
          padding: "10px 20px",
          borderRadius: 6,
          border: `1px solid ${COLORS.cyan}22`,
        }}
      >
        <span style={{ color: COLORS.green }}>$ </span>
        claude plugin add amgb20/mpp-inspector-marketplace
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: sansFont,
          fontSize: 18,
          fontWeight: 600,
          color: COLORS.textMuted,
          opacity: textSpring,
        }}
      >
        Available as a Claude Code plugin & MCP server
      </div>
    </AbsoluteFill>
  );
};
