import React, {useRef, useEffect} from 'react';
import styles from '../styles/home page slides styles/FeaturedCarousel.module.css';

const CarouselItem = ({ item, isActive }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.playbackRate = 0.45;
      //videoRef.current.play(); 
    }
  }, [item]);

  return (
    <div className={`${styles.carouselItem} ${isActive ? styles.active : ''}`}>

      <p className={styles.itemTitle}>{(item.title)}</p>

      {item.type === 'image' && <img src={item.src} alt={item.alt} />}

      {item.type === 'video' && 
      <video 
        className={styles.video}
        src={item.src} 
        alt={item.alt} 
        autoPlay
        loop
        muted
        playsInline 
      />}
       
    </div>
  );
};

export default CarouselItem;
