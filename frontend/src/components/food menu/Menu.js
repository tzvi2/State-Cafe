import React, { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import Menuitem from "./Menuitem";
import Shimmer from "./Shimmer";
import styles from '../styles/food menu styles/Menu.module.css';
import { getESTDate, formatDateToYYYYMMDD, formatDateToMDYYYY, YMDtoDMY } from '../../utils/dateUtilities';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { useOrderContext } from '../../contexts/OrderContext';
import { useMenu } from '../../contexts/MenuContext';

export default function Menu() {
  const { menuItems, fetchMenuItems, stock, fetchStock, isLoading, error } = useMenu();

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

  // Fetch menu items if not already fetched
  useEffect(() => {
    if (menuItems.length === 0) {
      console.log('fetching')
      fetchMenuItems();
    }
  }, []);

  // Fetch stock for the selected delivery date
  useEffect(() => {
    fetchStock(deliveryDate);
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
        {/* Display error message if there is an error */}
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.ordersMessage}>{error}</p>
            {/* <button className={styles.retryButton} onClick={() => fetchMenuItems()}>
              Try Again
            </button> */}
          </div>
        )}

        {/* Display a message if not accepting orders and there is no error */}
        {!acceptingOrders && !isLoading && !error && (
          <p className={styles.ordersMessage}>
            We are not accepting orders for the selected date.
          </p>
        )}

        {/* Display loading message only if there is no error */}
        {isLoading && !error && (
          <p className={styles.loadingMessage}>Loading, please wait...</p>
        )}

        {/* Render menu items if not loading and there is no error */}
        <div className={styles.menu}>
          {!isLoading && !error ? (
            menuItems.map((item) => (
              <Menuitem
                key={item.id}
                item={item}
                stock={stock[item.id]?.quantity || 0}
              />
            ))
          ) : (
            isLoading && Array(10).fill(0).map((_, index) => <Shimmer key={index} />)
          )}
        </div>
      </div>


    </>
  );
}
