import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Ilya Libin - Projects",
  description: "Personal projects by Ilya Libin - Interactive web experiments and tools",
};

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.greeting}>Hi, I&apos;m Ilya</h1>

        <p className={styles.description}>
          I build things
        </p>

        <div className={styles.projects}>
          <Link href="/todoink" className={styles.projectCard}>
            <svg className={styles.projectIcon} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="2" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="none"></rect>
              <rect x="7" y="5" width="18" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"></rect>
              <rect x="2" y="8" width="2" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"></rect>
              <rect x="2" y="14" width="2" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"></rect>
              <rect x="2" y="20" width="2" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"></rect>
              <rect x="10" y="10" width="3" height="3" stroke="currentColor" strokeWidth="1" fill="none"></rect>
              <path d="M10 10 L13 13 M10 13 L13 10" stroke="currentColor" strokeWidth="1"></path>
              <circle cx="12" cy="26" r="1.5" stroke="currentColor" strokeWidth="1" fill="none"></circle>
              <circle cx="16" cy="26" r="1.5" stroke="currentColor" strokeWidth="1" fill="none"></circle>
              <circle cx="20" cy="26" r="1.5" stroke="currentColor" strokeWidth="1" fill="none"></circle>
            </svg>
            <span className={styles.projectTitle}>TodoInk</span>
          </Link>

          <Link href="/music_square" className={styles.projectCard}>
            <span className={styles.projectIcon}>🎵</span>
            <span className={styles.projectTitle}>Music Square</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
