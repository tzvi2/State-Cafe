import React, { useEffect, useState, useRef } from 'react';
import Menuitem from "./Menuitem";
import CategoryBar from "./CategoryBar";
import Shimmer from "./Shimmer";
import styles from '../styles/food menu styles/Menu.module.css';
import { getQuickViewMenu } from "../../api/menuRequests";
import { getStockForDate } from "../../api/stockRequests";

const categories = ["breakfast", "pasta", "sushi", "sandwiches", "baked goods", "soup", "coffee"];

const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const categoryRefs = useRef({});
  const categoryBarRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
  
    const fetchQuickView = async () => {
      try {
        const [items, stockData] = await Promise.all([
          getQuickViewMenu(),
          getStockForDate(getLocalDate())
        ]);

        const itemsWithStock = items.map(item => {
          if (item.soldByWeight === true) {
            return {
              ...item,
              weightOptions: stockData[item.itemId] || []
            };
          } else {
            //console.log(stockData[item.itemId].quantity)
            return {
              ...item,
              quantity: stockData[item.itemId]?.quantity || 0
            };
          }
        });
  
        setMenuItems(itemsWithStock);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchQuickView();
  }, []);

  useEffect(() => {
    console.log('menu items: ', menuItems);
  }, [menuItems]);

  const handleScroll = () => {
    const categoryBarHeight = categoryBarRef.current ? categoryBarRef.current.offsetHeight : 0;
    const scrollTop = window.scrollY;
    const highlightPosition = scrollTop + categoryBarHeight + 130;

    let newActiveCategory = null;

    categories.forEach(category => {
      const el = categoryRefs.current[category];
      if (el) {
        const { offsetTop } = el;
        if (offsetTop <= highlightPosition) {
          newActiveCategory = category;
        }
      }
    });

    if (newActiveCategory && newActiveCategory !== activeCategory) {
      setActiveCategory(newActiveCategory);
    }
  };

  const handleCategoryClick = (category) => {
    const categoryBarHeight = categoryBarRef.current ? categoryBarRef.current.offsetHeight : 0;
    const extraOffset = 120; // Additional margin for better visibility
    const categoryElement = categoryRefs.current[category];
    const elementPosition = categoryElement.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - categoryBarHeight - extraOffset;

    window.scrollTo({
      top: offsetPosition,
      left: 0,
      behavior: 'smooth'
    });

    // Set active category immediately on click
    setActiveCategory(category);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  return (
    <>
      <CategoryBar 
        categories={categories} 
        activeCategory={activeCategory} 
        setActiveCategory={handleCategoryClick} 
        ref={categoryBarRef}
      />
      <div className={styles.menuContainer}>
        {categories.map((category) => (
          <div
            key={category}
            id={category}
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
