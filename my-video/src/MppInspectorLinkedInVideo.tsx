import React from "react";
import { Sequence } from "remotion";
import { LinkedInLayout } from "./components/LinkedInLayout";
import { MppInspectorVideo } from "./MppInspectorVideo";

export const MppInspectorLinkedInVideo: React.FC = () => {
  return (
    <LinkedInLayout>
      <Sequence width={1280} height={720}>
        <MppInspectorVideo />
      </Sequence>
    </LinkedInLayout>
  );
};
