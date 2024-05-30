import React, { useEffect, useState, useRef } from 'react';
import Menuitem from "./Menuitem";
import CategoryBar from "./CategoryBar";
import Shimmer from "./Shimmer"; // Import the Shimmer component
import styles from '../styles/food menu styles/Menu.module.css';
import { getQuickViewMenu } from "../../api/menuRequests";

const categories = ["breakfast", "pasta", "sushi", "sandwiches", "baked goods", "soup", "coffee"];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const categoryRefs = useRef({});

  useEffect(() => {
    setIsLoading(true);
    const fetchQuickView = async () => {
      const items = await getQuickViewMenu();
      setMenuItems(items);
      setIsLoading(false);
    };

    fetchQuickView();
  }, []);

  const handleScroll = () => {
    const halfwayPoint = window.innerHeight / 2 + window.scrollY;
    let newActiveCategory = null;

    // Determine which category is at the halfway point
    categories.forEach(category => {
      const el = categoryRefs.current[category];
      if (el) {
        const { offsetTop, clientHeight } = el;
        if (offsetTop <= halfwayPoint && (offsetTop + clientHeight) >= halfwayPoint) {
          newActiveCategory = category;
        }
      }
    });

    if (newActiveCategory && newActiveCategory !== activeCategory) {
      setActiveCategory(newActiveCategory);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  return (
    <>
      <CategoryBar categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <div className={styles.menuContainer}>
        {categories.map((category) => (
          <div
            key={category}
            id={category} // Ensure this id matches the `to` prop being passed to CategoryBarLink
            ref={(el) => categoryRefs.current[category] = el}
            className={styles.categoryContainer}>
            <div className={styles.menu}>
              {isLoading ?
                Array(3).fill(0).map((_, index) => (
                  <Shimmer key={index} />
                )) :
                menuItems.filter(item => item.category === category).map((item, index) => (
                  <Menuitem key={index} item={item} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
