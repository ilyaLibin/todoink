import React from "react";
import styles from "../app/page.module.css";

interface RecordingLightProps {
  recording: boolean;
  isBlinking: boolean;
}

export const RecordingLight: React.FC<RecordingLightProps> = ({
  recording,
  isBlinking,
}) => {
  return (
    <div
      className={`${styles.recordingLight} ${
        recording ? styles.recording : ""
      } ${isBlinking ? styles.blink : ""}`}
    />
  );
};
