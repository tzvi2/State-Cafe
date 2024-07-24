import React, { useState, useRef, useEffect } from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import { MenuSquare } from 'lucide-react';
import styles from '../styles/home page slides styles/FeaturedSlide.module.css';
import FeaturedCarousel from './FeaturedCarousel';


function FeaturedSlide() {
	const [isVisible, setIsVisible] = useState(false);
	const featuredRef = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		if (featuredRef.current) {
			observer.observe(featuredRef.current);
		}

		return () => {
      if (featuredRef.current) {
          observer.unobserve(featuredRef.current);
      }
    };
	}, []);

	return (
		<div className={`${styles.featured} ${isVisible ? styles.visible : ''}`} ref={featuredRef}>
			<div className={styles.slide_centered}>
				<h3 className={styles.header}>Our Menu</h3>
        <p className={styles.serving}>Our menu changes with time. Explore some of our current offerings below.</p>
        <FeaturedCarousel />
        <Link className={styles.button_full} to="menu">
          Menu <MenuSquare />
        </Link>
      </div>
		</div>
	);
}

export default FeaturedSlide;
