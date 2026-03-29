import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const { fontFamily: monoFont } = loadJetBrainsMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const { fontFamily: sansFont } = loadInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

export const COLORS = {
  bg: "#0d1117",
  accent: "#00e5ff",
  terminalHeader: "#1e1e1e",
  terminalBody: "#0d1117",
  textPrimary: "#e6edf3",
  textMuted: "#8b949e",
  green: "#27c93f",
  red: "#ff5f56",
  yellow: "#ffbd2e",
  cyan: "#00e5ff",
  white: "#ffffff",
} as const;

export const FPS = 30;
export const TOTAL_FRAMES = 1350;

export const SCENE_FRAMES = {
  intro: 150,
  install: 60,
  inspect: 270,
  scan: 180,
  compare: 180,
  benchmark: 150,
  claudeCode: 120,
  cta: 240,
} as const;

export const FADE_DURATION = 9;
