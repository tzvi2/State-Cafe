// MenuSlide.jsx
import React, { useState, useRef, useEffect } from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import { MenuSquare } from 'lucide-react';
import ToggleImage from './ToggleImage';
import styles from '../styles/home page slides styles/MenuSlide.module.css';

function MenuSlide() {

  const {ref} = useRef()
  const [activeImageId, setActiveImageId] = useState(null);

  const images = [
    { 
			id: 'breakfast', 
			src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Fgreen_table_70.webp?alt=media&token=3474212a-40e8-482e-93bf-02c4468d0a05', 
			alt: 'breakfast table', 
			overlayText: 'We offer a number of delicious breakfast options to get your day started right. Eggs, pancakes, paninis... Find something delicious now.',
      category: "Breakfast"
		},
    { 
			id: 'pasta', 
			src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Fbowl_of_pasta_70.webp?alt=media&token=11287db0-511b-4ade-9e46-f21770fb0f1a', 
			alt: 'Pasta', 
			overlayText: 'All of our pasta is homemade and fresh because you deserve the best. Guaranteed to feel and taste the difference.' ,
      category: "Pasta"
		},
    { 
			id: 'coffee', 
			src: 'https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/featured%2Flatte_70.webp?alt=media&token=ac1a89ea-4e9c-4087-b254-a374422ee7a3', 
			alt: 'lattes', 
			overlayText: 'Our coffee drinks are made from whole coffee beans and are freshly ground for your drink. Try one of our homemade lattes today.',
      category: "Coffee"
		}
  ];

  const handleToggle = (id) => {
    setActiveImageId(activeImageId === id ? null : id);
  };

  
  return (
    <div className={styles.slide_centered}>
			{/* <h2>Discover our Food</h2> */}
      <div className={styles.featured_images}>
        {images.map((image) => (
          <ToggleImage
            key={image.id}
            src={image.src}
            alt={image.alt}
            overlayText={image.overlayText}
            onClick={() => handleToggle(image.id)}
            isToggled={activeImageId === image.id}
            category={image.category}
          />
        ))}
      </div>
      <Link className={styles.button_full} to='menu'>Full Menu <MenuSquare /></Link>
    </div>
  );
}

export default MenuSlide;
