import React from "react";
import styles from "./components.module.css";
import { GitHubStars } from "./GitHubStars";

export const Logo: React.FC = () => {
  return (
    <div className={styles.logoContainer}>
      <div className={styles.logoLeft}>
        <svg
          className={styles.logo}
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified device outline */}
          <rect
            x="4"
            y="2"
            width="24"
            height="28"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />

          {/* Screen */}
          <rect
            x="7"
            y="5"
            width="18"
            height="18"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Side buttons - three of them */}
          <rect
            x="2"
            y="8"
            width="2"
            height="3"
            rx="0.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <rect
            x="2"
            y="14"
            width="2"
            height="3"
            rx="0.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <rect
            x="2"
            y="20"
            width="2"
            height="3"
            rx="0.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />

          {/* Checkbox */}
          <rect
            x="10"
            y="10"
            width="3"
            height="3"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M10 10 L13 13 M10 13 L13 10"
            stroke="currentColor"
            strokeWidth="1"
          />

          {/* Bottom buttons - three of them */}
          <circle
            cx="12"
            cy="26"
            r="1.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="16"
            cy="26"
            r="1.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="20"
            cy="26"
            r="1.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <span className={styles.logoText}>todoink</span>
      </div>
      <div className={styles.logoRight}>
        <a
          href="https://github.com/ilyaLibin/todoink"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
          aria-label="View source on GitHub"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
        <GitHubStars />
      </div>
    </div>
  );
};
