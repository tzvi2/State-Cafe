import React from 'react';
import styles from '../styles/food menu styles/CategoryBar.module.css';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const CategoryBar = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className={styles.categoryBar}>
      {categories.map(category => (
        <button
          key={category}
          className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
          onClick={() => setActiveCategory(category)}
        >
          {capitalizeFirstLetter(category)}
        </button>
      ))}
    </div>
  );
}

export default CategoryBar;
