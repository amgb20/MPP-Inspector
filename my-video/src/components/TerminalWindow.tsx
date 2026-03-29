import React from "react";
import { COLORS, monoFont } from "../constants/theme";

type TerminalWindowProps = {
  title?: string;
  children: React.ReactNode;
  width?: number;
  height?: number;
};

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  title = "mpp-inspector — bash",
  children,
  width = 1100,
  height = 520,
}) => {
  const headerHeight = 36;
  const dotSize = 12;
  const dotGap = 8;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: headerHeight,
          backgroundColor: COLORS.terminalHeader,
          display: "flex",
          alignItems: "center",
          paddingLeft: 14,
          paddingRight: 14,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: dotGap }}>
          {[COLORS.red, COLORS.yellow, COLORS.green].map((color) => (
            <div
              key={color}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            color: COLORS.textMuted,
            fontSize: 13,
            fontFamily: monoFont,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: COLORS.terminalBody,
          padding: 16,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};
