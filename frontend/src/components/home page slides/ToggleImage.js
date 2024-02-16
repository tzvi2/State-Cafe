import React, { useState, } from 'react';
import styles from '../styles/home page slides styles/ToggleImage.module.css';

function ToggleImage({ src, alt, overlayText, category }) {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleClick = () => {
    setShowOverlay(!showOverlay); 
  };

  return (
    <div>
      <h2 className={styles.category}>{category}</h2>
      <div className={styles.imageCard} onClick={handleClick}>
        <img src={src} alt={alt}/>
        <div className={`${styles.overlay} ${showOverlay ? styles.show : styles.hide}`}>
          <span>{overlayText}</span>
        </div>
      </div>
    </div>
  );
}

export default ToggleImage;
