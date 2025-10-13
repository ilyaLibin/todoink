"use client";

import React, { useEffect, useState } from "react";
import styles from "../app/page.module.css";

export const GitHubStars: React.FC = () => {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/ilyaLibin/todoink")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch GitHub stars:", error);
      });
  }, []);

  if (stars === null) {
    return null;
  }

  return (
    <a
      href="https://github.com/ilyaLibin/todoink"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.githubStars}
      aria-label={`${stars} stars on GitHub`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
      </svg>
      <span className={styles.starCount}>{stars}</span>
    </a>
  );
};
