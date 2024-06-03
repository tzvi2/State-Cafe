import React, { useState, useEffect } from 'react';
import styles from '../styles/dashboard/Dashboard.module.css';
import { getOpenHours, addTimeSlot, removeTimeSlot } from '../../api/timeslotRequests';
import { setAllStockToZero, getStockForDate, updateQuantityRemaining } from '../../api/stockRequests';
import { getMenuItems } from '../../api/menuRequests';

const Dashboard = () => {
  const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [openHours, setOpenHours] = useState([]);
  const [showNewRange, setShowNewRange] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [stock, setStock] = useState({});
  const [stockInitialized, setStockInitialized] = useState(false);

  const fetchOpenHours = async () => {
    try {
      const openHours = await getOpenHours(selectedDate);
      setOpenHours(openHours);
      console.log("Open Hours: ", openHours);
    } catch (error) {
      console.error("Error fetching open hours:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchStock = async () => {
    try {
      const stockData = await getStockForDate(selectedDate);
      setStock(stockData);
      setStockInitialized(true);
    } catch (error) {
      if (error.message === 'No data found for the given date' || error.message.includes('Network response was not ok')) {
        setStock({});
        setStockInitialized(false);
      } else {
        console.error("Error fetching stock data:", error);
      }
    }
  };

  useEffect(() => {
    setOpenHours([]);
    fetchOpenHours();
    fetchMenuItems();
    fetchStock();
  }, [selectedDate]);

  const handleSaveRange = async () => {
    try {
      console.log("start", startTime, "end", endTime);
      await addTimeSlot(selectedDate, startTime, endTime);
      const openHours = await getOpenHours(selectedDate);
      setOpenHours(openHours);
      setStartTime('');
      setEndTime('');
      setShowNewRange(false);
    } catch (error) {
      console.error("Error saving time slot:", error);
    }
  };

  const handleDeleteRange = async (start, end) => {
    try {
      await removeTimeSlot(selectedDate, start, end);
      const openHours = await getOpenHours(selectedDate);
      setOpenHours(openHours);
    } catch (error) {
      console.error("Error deleting time slot:", error);
    }
  };

  const initializeMenuItems = async (dateString) => {
    try {
      await setAllStockToZero(dateString);
      await fetchStock(); // Re-fetch stock data after initialization
    } catch (error) {
      console.log(error);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    setStock(prevStock => ({
      ...prevStock,
      [itemId]: {
        ...prevStock[itemId],
        quantity: newQuantity
      }
    }));
  };

  const saveQuantityChange = async (itemId) => {
    try {
      const newQuantity = stock[itemId]?.quantity || 0;
      await updateQuantityRemaining(selectedDate, itemId, newQuantity);
      // Optionally, refetch stock to ensure state is in sync with the backend
      await fetchStock();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  return (
    <>
      <input type='date' value={selectedDate} onChange={e => setSelectedDate(e.target.value)}></input>
      
      {openHours.length > 0 ? (
          openHours.map((range, index) => (
            <div key={index} className={styles.range}>
              <span>{range.start} - {range.end}</span>
              <input className={styles.delete_range} type='button' value={"delete"} onClick={() => handleDeleteRange(range.start, range.end)} />
            </div>
          ))
        ) : (
          <p>No open times</p>
        )}

      {showNewRange && <div className={styles.range}>
        <input type='time' value={startTime} onChange={e => setStartTime(e.target.value)}></input>
        <input type='time' value={endTime} onChange={e => setEndTime(e.target.value)}></input>
        <input className={styles.save_range} type='button' value={"save"} onClick={() => handleSaveRange()}></input>
        <input className={styles.delete_range} type='button' value={"delete"} onClick={() => setShowNewRange(false)}></input>
      </div>}
      <input type='button' value={"add range"} onClick={() => setShowNewRange(!showNewRange)}></input>
      <input type='button' value={"Initialize Menu Items"} onClick={() => initializeMenuItems(selectedDate)}></input>
      
      <h2>Menu Items and Quantities</h2>
      {stockInitialized ? (
        menuItems.length > 0 ? (
          menuItems.map(item => (
            <div key={item.itemId} className={styles.menuItem}>
              <span>{item.title}</span>
              <input 
                type="number" 
                value={stock[item.itemId]?.quantity || 0} 
                onChange={e => handleQuantityChange(item.itemId, parseInt(e.target.value))}
              />
              <input 
                type="button" 
                value="Save" 
                onClick={() => saveQuantityChange(item.itemId)}
              />
            </div>
          ))
        ) : (
          <p>No menu items available</p>
        )
      ) : (
        <p>Items not initialized for selected date</p>
      )}
    </>
  );
}

export default Dashboard;
