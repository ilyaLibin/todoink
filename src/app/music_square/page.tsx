"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function MusicSquare() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Music Square</h1>

      <div className={styles.content}>
        <p>Ready to build something cool!</p>
      </div>
    </main>
  );
}
