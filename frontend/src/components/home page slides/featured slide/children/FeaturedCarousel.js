import React, { useRef, useEffect, useState } from 'react';
import styles from '../../../styles/home page slides styles/FeaturedCarousel.module.css';
import CarouselItem from './CarouselItem';

const FeaturedCarousel = () => {
  const items = [
    {
      id: 'breakfast',
			title: 'Breakfast',
      type: 'image',
      src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Fbreakfast.jpg?alt=media&token=910b6162-79dd-494c-9e10-775099ffcf94',
      alt: 'breakfast table',
    },
    {
      id: 'sushi',
			title: 'Sushi',
      type: 'image',
      src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Fsushi.jpg?alt=media&token=f7645479-1a3f-4802-89a6-0c4138452a85',
      alt: 'sushi on a plate',
    },
    {
      id: 'pasta',
			title: 'Pasta',
      type: 'image',
      src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Fpasta.jpg?alt=media&token=4f6580a0-5b6d-45bb-8659-9026e0716da7',
      alt: 'Pasta',
    },
    {
      id: 'coffee',
			title: 'Coffee',
      type: 'video',
      src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Fmoving%20latte.mp4?alt=media&token=de788bcb-6385-4f9a-8fb0-66e4d0ccc355',
      alt: 'lattes',
    }
  ];

  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const carousel = carouselRef.current;
      const items = carousel.children;
      const carouselRect = carousel.getBoundingClientRect();
      const center = carouselRect.left + carouselRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      Array.from(items).forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(center - itemCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      handleScroll(); 
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className={styles.carousel} ref={carouselRef}>
      {items.map((item, index) => (
        <CarouselItem key={index} item={item} isActive={index === activeIndex} />
      ))}
    </div>
  );
};

export default FeaturedCarousel;
