import React from "react";
import styles from "../app/page.module.css";

export const Legend: React.FC = () => {
  return (
    <div className={styles.legend}>
      <h2 className={styles.legendTitle}>How to Use</h2>
      <ul className={styles.legendList}>
        <li className={styles.legendItem}>
          <div className={styles.legendIcon + " " + styles.side} />
          <span>
            <span className={styles.legendAction}>Hold and speak</span> to add
            or edit an item
          </span>
        </li>
        <li className={styles.legendItem}>
          <div className={styles.legendIcon + " " + styles.side} />
          <span>
            <span className={styles.legendAction}>Double click</span> to delete
            an item
          </span>
        </li>
        <li className={styles.legendItem}>
          <div className={styles.legendIcon + " " + styles.side} />
          <span>
            <span className={styles.legendAction}>Single click</span> to
            check/uncheck
          </span>
        </li>
        <li className={styles.legendItem}>
          <div className={styles.legendIcon + " " + styles.bottom} />
          <span>
            <span className={styles.legendAction}>Hold and speak</span> to
            rename list
          </span>
        </li>
        <li className={styles.legendItem}>
          <div className={styles.legendIcon + " " + styles.bottom} />
          <span>
            <span className={styles.legendAction}>Click</span> to switch lists
          </span>
        </li>
      </ul>
    </div>
  );
};
