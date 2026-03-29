import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../constants/theme";
import { BENCHMARK_COMMAND, BENCHMARK_OUTPUT } from "../constants/terminal-data";
import { TerminalWindow } from "../components/TerminalWindow";
import { TerminalOutput } from "../components/TerminalOutput";
import { InstantCommand } from "../components/TypewriterCommand";
import { Caption } from "../components/Caption";

export const BenchmarkDemo: React.FC = () => {
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
      <Caption
        text="Load-test with p50/p95/p99 latency stats"
        delayFrames={30}
      />
      <TerminalWindow>
        <InstantCommand command={BENCHMARK_COMMAND} />
        <Sequence from={10} layout="none">
          <TerminalOutput
            lines={BENCHMARK_OUTPUT}
            startFrame={0}
            framesPerLine={2}
            containerHeight={460}
          />
        </Sequence>
      </TerminalWindow>
    </AbsoluteFill>
  );
};
