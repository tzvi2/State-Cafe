import React, { useEffect, useState, useRef, useCallback } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import Menuitem from "./Menuitem";
import CategoryBar from "./CategoryBar";
import Shimmer from "./Shimmer";
import styles from '../styles/food menu styles/Menu.module.css';
import { getESTDate, formatDateToYYYYMMDD, formatDateToMDYYYY, YMDtoDMY } from '../../utils/dateUtilities';
import { getActiveMenuItems } from "../../api/menuRequests";
import { getStockForDate } from '../../api/stockRequests';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { availableSlotsRemain } from '../../api/timeslotRequests';

const categories = ["breakfast", "pasta", "sushi", "sandwiches", "baked goods", "soup", "coffee"];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [stock, setStock] = useState({})
  const [isLoading, setIsLoading] = useState(true);
  const [showDateButtons, setShowDateButtons] = useState(false);
  const [areAvailableSlots, setAreAvailableSlots] = useState(true)
  const { deliveryDate, setDeliveryDate } = useDeliveryDetails();



  const todayEST = getESTDate();
  const tomorrowEST = new Date(todayEST);
  tomorrowEST.setDate(tomorrowEST.getDate() + 1);

  const todayFormatted = formatDateToYYYYMMDD(todayEST);
  const tomorrowFormatted = formatDateToYYYYMMDD(tomorrowEST);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const activeItems = await getActiveMenuItems(); // Fetch active menu items
        setMenuItems(activeItems); // Set menu items in state
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, [])

  useEffect(() => {
    const fetchStockForSelectedDate = async () => {
      if (deliveryDate) {
        try {
          console.log('Fetching stock for delivery date:', deliveryDate); // Log the delivery date
          const stockData = await getStockForDate(deliveryDate);
          console.log('Stock data returned from API for', deliveryDate, ':', stockData); // Log stock data
          setStock(stockData);
        } catch (error) {
          console.error('Error fetching stock data for', deliveryDate, error);
        }
      }
    };

    fetchStockForSelectedDate();
  }, [deliveryDate]);


  useEffect(() => {
    // Set the default delivery date to today if no date is selected
    if (!deliveryDate) {
      setDeliveryDate(todayFormatted);
    }
  }, [deliveryDate, todayFormatted, setDeliveryDate]);



  useEffect(() => {
    console.log('menu items', menuItems);
  }, [menuItems]);

  useEffect(() => {
    console.log('stock updated ', stock)
  }, [stock])



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

        {isLoading && <p className={styles.loadingMessage}>Loading, please wait...</p>}
        <div className={styles.menu}>
          {isLoading ? (
            Array(10).fill(0).map((_, index) => (
              <Shimmer key={index} />
            ))
          ) : (
            menuItems.map((item) => (
              <Menuitem
                key={item.id}
                item={item}
                stock={stock[item.id]?.quantity} // Pass the stock for each item
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
