import React, { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import Menuitem from "./Menuitem";
import Shimmer from "./Shimmer";
import styles from '../styles/food menu styles/Menu.module.css';
import { getESTDate, formatDateToYYYYMMDD, formatDateToMDYYYY, YMDtoDMY } from '../../utils/dateUtilities';
import { getActiveMenuItems } from "../../api/menuRequests";
import { getStockForDate } from '../../api/stockRequests';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { useOrderContext } from '../../contexts/OrderContext';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [stock, setStock] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showDateButtons, setShowDateButtons] = useState(false);
  const { acceptingOrders } = useOrderContext();
  const { deliveryDate, setDeliveryDate } = useDeliveryDetails();

  const todayEST = getESTDate();
  const tomorrowEST = new Date(todayEST);
  tomorrowEST.setDate(tomorrowEST.getDate() + 1);

  const todayFormatted = formatDateToYYYYMMDD(todayEST);
  const tomorrowFormatted = formatDateToYYYYMMDD(tomorrowEST);

  // Set delivery date to today's date if it's not already set
  useEffect(() => {
    if (!deliveryDate || new Date(deliveryDate) < new Date(todayFormatted)) {
      setDeliveryDate(todayFormatted);
    }
  }, [deliveryDate, setDeliveryDate, todayFormatted]);


  // Fetch menu items on mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const activeItems = await getActiveMenuItems();
        setMenuItems(activeItems);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  // Fetch stock for the selected delivery date
  useEffect(() => {
    const fetchStockForSelectedDate = async () => {
      if (deliveryDate) {
        try {
          const stockData = await getStockForDate(deliveryDate);
          setStock(stockData);
        } catch (error) {
          console.error('Error fetching stock data:', error);
        }
      }
    };

    fetchStockForSelectedDate();
  }, [deliveryDate]);

  const isDaySelected = (dateStr) => deliveryDate === dateStr;

  const toggleDateButtons = () => {
    setShowDateButtons(!showDateButtons);
  };

  return (
    <>

      <div className={styles.deliveryDateSelection} onClick={toggleDateButtons}>

        <span className={styles.minimizedButton}>
          Delivery:{" "}
          {deliveryDate === todayFormatted
            ? "Today"
            : deliveryDate === tomorrowFormatted
              ? "Tomorrow"
              : YMDtoDMY(deliveryDate)}
          {" "}
          {showDateButtons ? "▲" : "▼"}
        </span>

        {showDateButtons && (
          <div className={`${styles.flexRow} ${styles.dateButtons}`}>
            <button
              className={`${styles.day} ${isDaySelected(todayFormatted) ? styles.selected : ""
                }`}
              onClick={() => {
                setDeliveryDate(todayFormatted);
                setShowDateButtons(false);
              }}
            >
              <span>Today</span> <span>{formatDateToMDYYYY(todayEST)}</span>
            </button>
            <button
              className={`${styles.day} ${isDaySelected(tomorrowFormatted) ? styles.selected : ""
                }`}
              onClick={() => {
                setDeliveryDate(tomorrowFormatted);
                setShowDateButtons(false);
              }}
            >
              <span>Tomorrow</span> <span>{formatDateToMDYYYY(tomorrowEST)}</span>
            </button>
          </div>
        )}
      </div>





      <div className={styles.menuContainer}>
        {!acceptingOrders && !isLoading && (
          <p className={styles.ordersMessage}>
            We are not accepting orders for the selected date.
          </p>
        )}

        {isLoading && <p className={styles.loadingMessage}>Loading, please wait...</p>}
        <div className={styles.menu}>
          {isLoading ? (
            Array(10).fill(0).map((_, index) => <Shimmer key={index} />)
          ) : (
            menuItems.map((item) => (
              <Menuitem
                key={item.id}
                item={item}
                stock={stock[item.id]?.quantity || 0}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
