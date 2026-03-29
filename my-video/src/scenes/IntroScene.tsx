import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { monoFont, COLORS } from "../constants/theme";

const ASCII_HTML = `
<div><span style="color: ${COLORS.cyan}">&nbsp;███╗&nbsp;&nbsp;&nbsp;███╗&nbsp;██████╗&nbsp;██████╗&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
<div><span style="color: ${COLORS.cyan}">&nbsp;████╗&nbsp;████║&nbsp;██╔══██╗██╔══██╗&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
<div><span style="color: ${COLORS.cyan}">&nbsp;██╔████╔██║&nbsp;██████╔╝██████╔╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
<div><span style="color: ${COLORS.cyan}">&nbsp;██║╚██╔╝██║&nbsp;██╔═══╝&nbsp;██╔═══╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
<div><span style="color: ${COLORS.cyan}">&nbsp;██║&nbsp;╚═╝&nbsp;██║&nbsp;██║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: ${COLORS.textPrimary}">██╗███╗&nbsp;&nbsp;&nbsp;██╗███████╗██████╗&nbsp;███████╗&nbsp;██████╗████████╗&nbsp;██████╗&nbsp;██████╗&nbsp;</span></div>
<div><span style="color: ${COLORS.cyan}">&nbsp;╚═╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚═╝&nbsp;╚═╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚═╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: ${COLORS.textPrimary}">██║████╗&nbsp;&nbsp;██║██╔════╝██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗</span></div>
<div><span style="color: ${COLORS.cyan}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: ${COLORS.textPrimary}">██║██╔██╗&nbsp;██║███████╗██████╔╝█████╗&nbsp;&nbsp;██║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║&nbsp;&nbsp;&nbsp;██║&nbsp;&nbsp;&nbsp;██║██████╔╝</span></div>
<div><span style="color: ${COLORS.cyan}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: ${COLORS.textPrimary}">██║██║╚██╗██║╚════██║██╔═══╝&nbsp;██╔══╝&nbsp;&nbsp;██║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║&nbsp;&nbsp;&nbsp;██║&nbsp;&nbsp;&nbsp;██║██╔══██╗</span></div>
<div><span style="color: ${COLORS.cyan}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: ${COLORS.textPrimary}">██║██║&nbsp;╚████║███████║██║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;███████╗╚██████╗&nbsp;&nbsp;&nbsp;██║&nbsp;&nbsp;&nbsp;╚██████╔╝██║&nbsp;&nbsp;██║</span></div>
<div><span style="color: ${COLORS.cyan}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: ${COLORS.textPrimary}">╚═╝╚═╝&nbsp;&nbsp;╚═══╝╚══════╝╚═╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚══════╝&nbsp;╚═════╝&nbsp;&nbsp;&nbsp;╚═╝&nbsp;&nbsp;&nbsp;&nbsp;╚═════╝&nbsp;╚═╝&nbsp;&nbsp;╚═╝</span></div>
`;

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const taglineDelay = 10;
  const taglineOpacity = interpolate(
    frame - taglineDelay,
    [0, 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const taglineY = interpolate(
    frame - taglineDelay,
    [0, 20],
    [15, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const logoSpring = spring({
    frame,
    fps,
    delay: 30,
    config: { damping: 200 },
  });
  const logoScale = interpolate(logoSpring, [0, 1], [1.5, 1.6]);
  const logoTranslateY = interpolate(logoSpring, [0, 1], [30, 0]);

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
      <div
        style={{
          marginBottom: 60,
          fontFamily: monoFont,
          fontSize: 36,
          fontWeight: 700,
          color: COLORS.cyan,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        Postman for HTTP 402
      </div>

      <div
        style={{
          fontFamily: '"Consolas", "Menlo", "Courier New", monospace', // Use system monospace to ensure box-drawing characters match space width
          fontSize: 11,
          lineHeight: "13px",
          margin: 0,
          opacity: logoSpring,
          transform: `scale(${logoScale}) translateY(${logoTranslateY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          whiteSpace: "nowrap",
        }}
        dangerouslySetInnerHTML={{ __html: ASCII_HTML }}
      />
    </AbsoluteFill>
  );
};
