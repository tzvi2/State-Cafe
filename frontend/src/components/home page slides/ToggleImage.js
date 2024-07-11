import React, { useState, useRef, useEffect} from 'react';
import styles from '../styles/home page slides styles/ToggleImage.module.css';

function ToggleImage({ type, src, alt, overlayText, category }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const videoRef = useRef(null);

  const handleClick = () => {
    setShowOverlay(!showOverlay); 
  };

  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      videoRef.current.playbackRate = .5; // Adjust this value to control the playback speed
    }
  }, [type]);

  return (
    <div>
      <h2 className={styles.category}>{category}</h2>
      <div className={styles.imageCard} onClick={handleClick}>
        {type === 'image' ? (
          <img loading="lazy" src={src} alt={alt} />
        ) : (
          <video ref={videoRef} className={styles.video} src={src} alt={alt} autoPlay loop muted />
        )}
        <div className={`${styles.overlay} ${showOverlay ? styles.show : styles.hide}`}>
          <span>{overlayText}</span>
        </div>
      </div>
    </div>
  );
}

export default ToggleImage;
