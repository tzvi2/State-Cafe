import React from 'react';
import styles from '../styles/food menu styles/Shimmer.module.css';

export default function Shimmer() {
  return (
    <div className={styles.shimmerWrapper}>
      <div className={styles.shimmer}></div>
      {/* <div className={styles.shimmerText}></div>
      <div className={styles.shimmerText}></div> */}
    </div>
  );
}
