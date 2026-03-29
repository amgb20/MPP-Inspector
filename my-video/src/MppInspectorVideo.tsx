import React from "react";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { interpolate } from "remotion";

import { COLORS, FADE_DURATION } from "./constants/theme";
import { IntroScene } from "./scenes/IntroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { InstallFlash } from "./scenes/InstallFlash";
import { InspectDemo } from "./scenes/InspectDemo";
import { MockServerScene } from "./scenes/MockServerScene";
import { ScanDemo } from "./scenes/ScanDemo";
import { CompareDemo } from "./scenes/CompareDemo";
import { BenchmarkDemo } from "./scenes/BenchmarkDemo";
import { FlowDemo } from "./scenes/FlowDemo";
import { ClaudeCodeScene } from "./scenes/ClaudeCodeScene";
import { CtaScene } from "./scenes/CtaScene";

const FADE_TIMING = linearTiming({ durationInFrames: FADE_DURATION });

const SCENE_DURATIONS = {
  intro: 150, // 5s
  problem: 120, // 4s
  install: 75, // 2.5s
  inspect: 150, // 5s
  mockServer: 90, // 3s
  scan: 120, // 4s
  compare: 120, // 4s
  benchmark: 120, // 4s
  flow: 150, // 5s
  claudeCode: 180, // 6s
  cta: 150, // 5s
};

export const MppInspectorVideo: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.intro}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.problem}>
          <ProblemScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.install}>
          <InstallFlash />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.inspect}>
          <InspectDemo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.mockServer}>
          <MockServerScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scan}>
          <ScanDemo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.compare}>
          <CompareDemo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.benchmark}
        >
          <BenchmarkDemo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.flow}>
          <FlowDemo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.claudeCode}
        >
          <ClaudeCodeScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={FADE_TIMING}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.cta}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio
        src={staticFile("headphonk.mp3")}
        playbackRate={0.8}
        volume={(f) => {
          const fadeInEnd = 30;
          const fadeOutStart = durationInFrames - 60;
          const maxVol = 0.4;
          const fadeIn = interpolate(f, [0, fadeInEnd], [0, maxVol], {
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [fadeOutStart, durationInFrames],
            [maxVol, 0],
            { extrapolateLeft: "clamp" },
          );
          return Math.min(fadeIn, fadeOut);
        }}
      />
    </AbsoluteFill>
  );
};
