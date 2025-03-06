import React from "react";
import styles from "../app/page.module.css";

export const Logo: React.FC = () => {
  return (
    <div className={styles.logoContainer}>
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
  );
};
