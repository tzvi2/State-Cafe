import React, { useState } from 'react';
import styles from '../styles/food menu styles/CategoryBar.module.css';
import CategoryBarLink from './CategoryBarLink'; // Ensure this path is correct

function CategoryBar({categories, activeCategory, setActiveCategory}) {


  return (
    <div className={styles.categoryBar}>
      {categories.map(category => (
        <CategoryBarLink
          key={category}
          to={category}
          active={activeCategory === category}
          onClick={() => setActiveCategory(category)}
        />
      ))}
    </div>
  );
}

export default CategoryBar;
