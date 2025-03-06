import React from "react";
import styles from "../app/page.module.css";

export const MobileSplash: React.FC = () => {
  return (
    <div className={styles.mobileSplash}>
      <div className={styles.mobileSplashContent}>
        <svg
          className={styles.deviceIcon}
          width="120"
          height="160"
          viewBox="0 0 120 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main device frame */}
          <rect
            x="10"
            y="10"
            width="100"
            height="140"
            rx="8"
            stroke="white"
            strokeWidth="3"
            fill="none"
          />

          {/* Screen area */}
          <rect
            x="20"
            y="20"
            width="80"
            height="100"
            rx="2"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />

          {/* Title text */}
          <text x="30" y="35" fill="white" fontSize="8" fontFamily="monospace">
            Todo List
          </text>
          <line
            x1="25"
            y1="40"
            x2="95"
            y2="40"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* Todo items with checkboxes */}
          {/* Item 1 - unchecked */}
          <rect
            x="30"
            y="50"
            width="6"
            height="6"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
          <text x="40" y="55" fill="white" fontSize="6" fontFamily="monospace">
            Buy groceries
          </text>

          {/* Item 2 - checked */}
          <rect
            x="30"
            y="65"
            width="6"
            height="6"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
          <line
            x1="31"
            y1="68"
            x2="35"
            y2="68"
            stroke="white"
            strokeWidth="1"
          />
          <line
            x1="31"
            y1="68"
            x2="33"
            y2="70"
            stroke="white"
            strokeWidth="1"
          />
          <line
            x1="33"
            y1="70"
            x2="35"
            y2="66"
            stroke="white"
            strokeWidth="1"
          />
          <text
            x="40"
            y="70"
            fill="white"
            fontSize="6"
            fontFamily="monospace"
            opacity="0.7"
            textDecoration="line-through"
          >
            Call mom
          </text>

          {/* Item 3 - unchecked */}
          <rect
            x="30"
            y="80"
            width="6"
            height="6"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
          <text x="40" y="85" fill="white" fontSize="6" fontFamily="monospace">
            Fix sink
          </text>

          {/* Side buttons */}
          <rect
            x="5"
            y="30"
            width="5"
            height="10"
            rx="1"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="5"
            y="50"
            width="5"
            height="10"
            rx="1"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="5"
            y="70"
            width="5"
            height="10"
            rx="1"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />

          {/* Bottom buttons */}
          <circle
            cx="40"
            cy="135"
            r="5"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="60"
            cy="135"
            r="5"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="80"
            cy="135"
            r="5"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        <h1>Mobile Devices Not Supported</h1>
        <p>
          This e-ink todo list prototype is designed for larger screens. Please
          use a desktop for the best experience.
        </p>
      </div>
    </div>
  );
};
