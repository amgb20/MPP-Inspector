import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../constants/theme";
import { SCAN_COMMAND, SCAN_OUTPUT } from "../constants/terminal-data";
import { TerminalWindow } from "../components/TerminalWindow";
import { TerminalOutput } from "../components/TerminalOutput";
import { InstantCommand } from "../components/TypewriterCommand";
import { Caption } from "../components/Caption";

export const ScanDemo: React.FC = () => {
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
      <Caption text="Discover every paid endpoint on a domain" delayFrames={30} />
      <TerminalWindow>
        <InstantCommand command={SCAN_COMMAND} />
        <Sequence from={10} layout="none">
          <TerminalOutput
            lines={SCAN_OUTPUT}
            startFrame={0}
            framesPerLine={2}
            containerHeight={460}
          />
        </Sequence>
      </TerminalWindow>
    </AbsoluteFill>
  );
};
