import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../constants/theme";
import { INSPECT_COMMAND, INSPECT_OUTPUT } from "../constants/terminal-data";
import { TerminalWindow } from "../components/TerminalWindow";
import { TerminalOutput } from "../components/TerminalOutput";
import { TypewriterCommand } from "../components/TypewriterCommand";
import { Caption } from "../components/Caption";

const COMMAND_FRAMES = Math.ceil(INSPECT_COMMAND.length * 1) + 10;

export const InspectDemo: React.FC = () => {
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
      <Caption text="Dissect any 402 payment challenge" delayFrames={COMMAND_FRAMES + 20} />
      <TerminalWindow>
        <Sequence from={0} durationInFrames={COMMAND_FRAMES} layout="none">
          <TypewriterCommand command={INSPECT_COMMAND} charFrames={1} />
        </Sequence>
        <Sequence from={COMMAND_FRAMES} layout="none">
          <TerminalOutput
            lines={INSPECT_OUTPUT}
            commandLine={INSPECT_COMMAND}
            startFrame={0}
            framesPerLine={2}
            containerHeight={460}
          />
        </Sequence>
      </TerminalWindow>
    </AbsoluteFill>
  );
};
