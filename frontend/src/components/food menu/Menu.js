import React, { useEffect, useState, useRef, useCallback } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import Menuitem from "./Menuitem";
import CategoryBar from "./CategoryBar";
import Shimmer from "./Shimmer";
import styles from '../styles/food menu styles/Menu.module.css';
import { getMenuAndStockForDate } from "../../api/menuRequests";
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';

const categories = ["breakfast", "pasta", "sushi", "sandwiches", "baked goods", "soup", "coffee"];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const categoryRefs = useRef({});
  const categoryBarRef = useRef(null);
  const { deliveryDate, setDeliveryDate } = useDeliveryDetails(); // Use context for delivery date
  const timeFormatter = new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const getESTDate = useCallback(() => {
    const now = new Date();
    const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const estDate = new Date(utcDate.getTime() - (5 * 60 * 60 * 1000));
    return estDate;
  }, []);

  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateToMDYYYY = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}-${day}-${year}`;
  };

  const todayEST = getESTDate();
  const tomorrowEST = new Date(todayEST);
  tomorrowEST.setDate(tomorrowEST.getDate() + 1);

  const todayFormatted = formatDateToYYYYMMDD(todayEST);
  const tomorrowFormatted = formatDateToYYYYMMDD(tomorrowEST);

  useEffect(() => {
    const getStockData = async () => {
      setIsLoading(true);
      const data = await getMenuAndStockForDate(deliveryDate);
      setMenuItems(data);
      setIsLoading(false);
    };
    if (deliveryDate) {
      getStockData();
    }
  }, [deliveryDate]);


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
    console.log('menu items ', menuItems)
  }, [menuItems])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  const isDaySelected = (dateStr) => deliveryDate === dateStr;

  return (
    <>
      <h2 className={styles.offering}>Select Delivery Date</h2>
  
      
      <div className={`${styles.flexRow} ${styles.dateButtons}`}>
        <button className={`${styles.day} ${isDaySelected(todayFormatted) ? styles.selected : ''}`} onClick={() => setDeliveryDate(todayFormatted)}>
          <span>Today</span> <span>{formatDateToMDYYYY(todayEST)}</span>
        </button>
        <button className={`${styles.day} ${isDaySelected(tomorrowFormatted) ? styles.selected : ''}`} onClick={() => setDeliveryDate(tomorrowFormatted)}>
          <span>Tomorrow</span> <span>{formatDateToMDYYYY(tomorrowEST)}</span>
        </button>
      </div>

      <div className={styles.menuContainer}>
        {categories.map((category) => (
          <div
            key={category}
            id={category}
            ref={(el) => categoryRefs.current[category] = el}
            className={styles.categoryContainer}>
            <div className={styles.menu}>
              {isLoading ?
                Array(menuItems.length).fill(0).map((_, index) => (
                  <Shimmer key={index} />
                )) :
                menuItems.filter(item => item.category === category).map((item) => (
                  <Menuitem key={item.title} item={item} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
