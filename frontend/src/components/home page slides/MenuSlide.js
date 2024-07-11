import React, { useState, useRef } from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import { MenuSquare } from 'lucide-react';
import ToggleImage from './ToggleImage';
import styles from '../styles/home page slides styles/MenuSlide.module.css';

function MenuSlide() {
  const { ref } = useRef();
  const [activeImageId, setActiveImageId] = useState(null);

  const items = [
    {
      id: 'breakfast',
      type: 'image',
      src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Fgreen_table_70.webp?alt=media&token=3474212a-40e8-482e-93bf-02c4468d0a05',
      alt: 'breakfast table',
      overlayText: 'We offer a number of delicious breakfast options to get your day started right. Eggs, pancakes, paninis... Find something delicious now.',
      category: 'Breakfast'
    },
    {
      id: 'pasta',
      type: 'image',
      src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Fbowl_of_pasta_70.webp?alt=media&token=11287db0-511b-4ade-9e46-f21770fb0f1a',
      alt: 'Pasta',
      overlayText: 'All of our pasta is homemade and fresh because you deserve the best. Guaranteed to feel and taste the difference.',
      category: 'Pasta'
    },
    {
      id: 'coffee',
      type: 'video',
      src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Fmoving%20latte.mp4?alt=media&token=de788bcb-6385-4f9a-8fb0-66e4d0ccc355',
      alt: 'lattes',
      overlayText: 'Our coffee drinks are made from whole coffee beans and are freshly ground for your drink. Try one of our homemade lattes today.',
      category: 'Coffee'
    }
  ];

  const handleToggle = (id) => {
    setActiveImageId(activeImageId === id ? null : id);
  };

  return (
    <div className={styles.slide_centered}>
      <div className={styles.featured_images}>
        {items.map((item) => (
          <ToggleImage
            key={item.id}
            type={item.type}
            src={item.src}
            alt={item.alt}
            overlayText={item.overlayText}
            onClick={() => handleToggle(item.id)}
            isToggled={activeImageId === item.id}
            category={item.category}
          />
        ))}
      </div>
      <Link className={styles.button_full} to="menu">
        Full Menu <MenuSquare />
      </Link>
    </div>
  );
}

export default MenuSlide;
