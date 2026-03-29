import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../constants/theme";
import { FLOW_COMMAND, FLOW_OUTPUT } from "../constants/terminal-data";
import { TerminalWindow } from "../components/TerminalWindow";
import { TerminalOutput } from "../components/TerminalOutput";
import { InstantCommand } from "../components/TypewriterCommand";
import { Caption } from "../components/Caption";

export const FlowDemo: React.FC = () => {
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
      <Caption text="Execute the full payment lifecycle" delayFrames={30} />
      <TerminalWindow>
        <InstantCommand command={FLOW_COMMAND} />
        <Sequence from={10} layout="none">
          <TerminalOutput
            lines={FLOW_OUTPUT}
            startFrame={0}
            framesPerLine={10}
            containerHeight={460}
          />
        </Sequence>
      </TerminalWindow>
    </AbsoluteFill>
  );
};
