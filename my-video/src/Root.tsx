import "./index.css";
import { Composition, Folder } from "remotion";
import { MppInspectorVideo } from "./MppInspectorVideo";
import { MppInspectorLinkedInVideo } from "./MppInspectorLinkedInVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="MppInspector">
      <Composition
        id="MppInspectorX"
        component={MppInspectorVideo}
        durationInFrames={1269}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="MppInspectorLinkedIn"
        component={MppInspectorLinkedInVideo}
        durationInFrames={1269}
        fps={30}
        width={1080}
        height={1080}
      />
    </Folder>
  );
};
