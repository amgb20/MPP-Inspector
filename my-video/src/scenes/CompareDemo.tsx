import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../constants/theme";
import { COMPARE_OUTPUT } from "../constants/terminal-data";
import { TerminalWindow } from "../components/TerminalWindow";
import { TerminalOutput } from "../components/TerminalOutput";
import { InstantCommand } from "../components/TypewriterCommand";
import { Caption } from "../components/Caption";

const SHORT_COMMAND =
  "mpp-inspector compare localhost:3402/v1/query .../v1/search .../v1/premium";

export const CompareDemo: React.FC = () => {
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
      <Caption text="Compare pricing across MPP services" delayFrames={30} />
      <TerminalWindow>
        <InstantCommand command={SHORT_COMMAND} />
        <Sequence from={10} layout="none">
          <TerminalOutput
            lines={COMPARE_OUTPUT}
            startFrame={0}
            framesPerLine={2}
            containerHeight={460}
          />
        </Sequence>
      </TerminalWindow>
    </AbsoluteFill>
  );
};
