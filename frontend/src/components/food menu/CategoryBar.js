import React, { forwardRef } from 'react';
import styles from '../styles/food menu styles/CategoryBar.module.css';
import {capitalizeFirstLetters} from '../../utils/stringUtilities'

const CategoryBar = forwardRef(({ categories, activeCategory, setActiveCategory }, ref) => {
  return (
    <div ref={ref} className={styles.categoryBar}>
      {categories.map((category) => (
        <button
          key={category}
          className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
          onClick={() => setActiveCategory(category)}
        >
          {capitalizeFirstLetters(category)}
        </button>
      ))}
    </div>
  );
});

export default CategoryBar;
