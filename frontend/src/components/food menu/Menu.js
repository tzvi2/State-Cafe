import React, { useEffect, useState, useRef, useCallback } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import Menuitem from "./Menuitem";
import CategoryBar from "./CategoryBar";
import Shimmer from "./Shimmer";
import styles from '../styles/food menu styles/Menu.module.css';
import { getMenuAndStockForDate } from "../../api/menuRequests";
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { availableSlotsRemain } from '../../api/timeslotRequests';

const categories = ["breakfast", "pasta", "sushi", "sandwiches", "baked goods", "soup", "coffee"];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [showDateButtons, setShowDateButtons] = useState(false);
  const [areAvailableSlots, setAreAvailableSlots] = useState(true)
  const categoryRefs = useRef({});
  const categoryBarRef = useRef(null);
  const { deliveryDate, setDeliveryDate } = useDeliveryDetails();
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

  const YMDtoDMY = (str) => {
    const [year, month, day] = str.split('-');

    const monthNumber = parseInt(month, 10);
    const dayNumber = parseInt(day, 10);

    return `${monthNumber}-${dayNumber}-${year}`;
  }
  const todayEST = getESTDate();
  const tomorrowEST = new Date(todayEST);
  tomorrowEST.setDate(tomorrowEST.getDate() + 1);

  const todayFormatted = formatDateToYYYYMMDD(todayEST);
  const tomorrowFormatted = formatDateToYYYYMMDD(tomorrowEST);

  useEffect(() => {
    const checkIfSlotsRemain = async () => {
      const res = await availableSlotsRemain()
      console.log('res ', res)
      setAreAvailableSlots(res)
    }
    checkIfSlotsRemain()
  })

  useEffect(() => {
    console.log('delivery date', deliveryDate);
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
    const extraOffset = 120;
    const categoryElement = categoryRefs.current[category];
    const elementPosition = categoryElement.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - categoryBarHeight - extraOffset;

    window.scrollTo({
      top: offsetPosition,
      left: 0,
      behavior: 'smooth'
    });

    setActiveCategory(category);
  };

  useEffect(() => {
    console.log('menu items', menuItems);
  }, [menuItems]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  const isDaySelected = (dateStr) => deliveryDate === dateStr;

  const toggleDateButtons = () => {
    setShowDateButtons(!showDateButtons);
  };

  return (
    <>
      <div className={styles.deliveryDateSelection}>
        {!deliveryDate || showDateButtons ? (
          <>
            <h2 className={styles.offering}>Select Delivery Date</h2>
            <div className={`${styles.flexRow} ${styles.dateButtons}`}>
              <button className={`${styles.day} ${isDaySelected(todayFormatted) ? styles.selected : ''}`} onClick={() => { setDeliveryDate(todayFormatted); setShowDateButtons(false); }}>
                <span>Today</span> <span>{formatDateToMDYYYY(todayEST)}</span>
              </button>
              <button className={`${styles.day} ${isDaySelected(tomorrowFormatted) ? styles.selected : ''}`} onClick={() => { setDeliveryDate(tomorrowFormatted); setShowDateButtons(false); }}>
                <span>Tomorrow</span> <span>{formatDateToMDYYYY(tomorrowEST)}</span>
              </button>
            </div>
          </>
        ) : (
          <button className={styles.minimizedButton} onClick={toggleDateButtons}>
            Delivery Date: {YMDtoDMY(deliveryDate)} &#x25BC;
          </button>
        )}
      </div>

      <div className={styles.menuContainer}>
        {!areAvailableSlots && !isLoading && <p className={styles.ordersMessage}>We are not accepting orders for the selected date.</p>}

        {/* Show "Loading, please wait" when data is loading */}
        {isLoading && <p className={styles.loadingMessage}>Loading, please wait...</p>}

        {categories.map((category) => (
          <div
            key={category}
            id={category}
            ref={(el) => categoryRefs.current[category] = el}
            className={styles.categoryContainer}>
            <div className={styles.menu}>
              {isLoading ?
                Array(10).fill(0).map((_, index) => (
                  <Shimmer key={index} />
                )) :
                menuItems.filter(item => item.category === category).map((item) => (
                  <Menuitem key={item.id} item={item} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
