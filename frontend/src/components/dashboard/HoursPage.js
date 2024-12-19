import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from '../styles/dashboard/HoursPage.module.css';
import {
  getOpenHours,
  addTimeSlot,
  removeTimeSlot,
  getOrderingWindow,
  addOrderingWindow,
  removeOrderingWindow,
} from '../../api/timeslotRequests';

const HoursPage = () => {
  const [selectedDate] = useOutletContext();
  const [openHours, setOpenHours] = useState([]);
  const [orderingWindow, setOrderingWindow] = useState([]);
  const [showNewOpenRange, setShowNewOpenRange] = useState(false);
  const [showNewOrderingRange, setShowNewOrderingRange] = useState(false);
  const [startOpenTime, setStartOpenTime] = useState('');
  const [endOpenTime, setEndOpenTime] = useState('');
  const [startOrderingTime, setStartOrderingTime] = useState('');
  const [endOrderingTime, setEndOrderingTime] = useState('');
  const [orderingDate, setOrderingDate] = useState('');

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const openHours = await getOpenHours(selectedDate);
        const orderingWindow = await getOrderingWindow(selectedDate);
        setOpenHours(openHours);
        setOrderingWindow(orderingWindow);
      } catch (error) {
        console.error('Error fetching hours:', error);
      }
    };

    fetchHours();
  }, [selectedDate]);

  const handleSaveOpenRange = async () => {
    try {
      await addTimeSlot(selectedDate, startOpenTime, endOpenTime);
      const openHours = await getOpenHours(selectedDate);
      setOpenHours(openHours);
      setStartOpenTime('');
      setEndOpenTime('');
      setShowNewOpenRange(false);
    } catch (error) {
      console.error('Error saving open range:', error);
    }
  };

  const handleSaveOrderingRange = async () => {
    try {
      await addOrderingWindow(selectedDate, startOrderingTime, endOrderingTime, orderingDate);
      const orderingWindow = await getOrderingWindow(selectedDate);
      setOrderingWindow(orderingWindow);
      setOrderingDate('');
      setStartOrderingTime('');
      setEndOrderingTime('');
      setShowNewOrderingRange(false);
    } catch (error) {
      console.error('Error saving ordering range:', error);
    }
  };

  const handleDeleteOpenRange = async (start, end) => {
    try {
      await removeTimeSlot(selectedDate, start, end);
      const openHours = await getOpenHours(selectedDate);
      setOpenHours(openHours);
    } catch (error) {
      console.error('Error deleting open range:', error);
    }
  };

  const handleDeleteOrderingRange = async (start, end, date) => {
    try {
      await removeOrderingWindow(selectedDate, start, end, date);
      const orderingWindow = await getOrderingWindow(selectedDate);
      setOrderingWindow(orderingWindow);
    } catch (error) {
      console.error('Error deleting ordering range:', error);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hoursInt = parseInt(hours, 10);
    const amPm = hoursInt >= 12 ? 'pm' : 'am';
    const formattedHours = hoursInt % 12 || 12; // Convert 0 to 12 for midnight
    return `${formattedHours}:${minutes}${amPm}`;
  };

  return (
    <div className={styles.hours}>
      <h2>Open Hours</h2>
      {openHours.length > 0 ? (
        openHours.map((range, index) => (
          <div key={index} className={styles.range}>
            <p className={styles.rangeHours}>
              {formatTime(range.start)} - {formatTime(range.end)}
            </p>
            <input
              className={styles.delete_range}
              type="button"
              value="delete"
              onClick={() => handleDeleteOpenRange(range.start, range.end)}
            />
          </div>
        ))
      ) : (
        <p>No open times</p>
      )}

      {showNewOpenRange && (
        <div className={styles.newRange}>
          <div className={styles.times}>
            <input type="time" value={startOpenTime} onChange={(e) => setStartOpenTime(e.target.value)} />
            <input type="time" value={endOpenTime} onChange={(e) => setEndOpenTime(e.target.value)} />
          </div>
          <input className={styles.save_range} type="button" value="save" onClick={handleSaveOpenRange} />
          <input className={styles.cancel_range} type="button" value="cancel" onClick={() => setShowNewOpenRange(false)} />
        </div>
      )}
      {!showNewOpenRange && (
        <input
          className={styles.add_range}
          type="button"
          value="add open range"
          onClick={() => setShowNewOpenRange(true)}
        />
      )}

      <h2>Ordering Window</h2>
      {orderingWindow.length > 0 ? (
        orderingWindow.map((range, index) => (
          <div key={index} className={styles.range}>
            <p className={styles.rangeHours}>
              {range.date} | {formatTime(range.start)} - {formatTime(range.end)}
            </p>
            <input
              className={styles.delete_range}
              type="button"
              value="delete"
              onClick={() => handleDeleteOrderingRange(range.start, range.end, range.date)}
            />
          </div>
        ))
      ) : (
        <p>No ordering times</p>
      )}

      {showNewOrderingRange && (
        <div className={styles.newRange}>
          <div className={styles.times}>
            <input type="date" value={orderingDate} onChange={(e) => setOrderingDate(e.target.value)} />
            <input type="time" value={startOrderingTime} onChange={(e) => setStartOrderingTime(e.target.value)} />
            <input type="time" value={endOrderingTime} onChange={(e) => setEndOrderingTime(e.target.value)} />
          </div>
          <input className={styles.save_range} type="button" value="save" onClick={handleSaveOrderingRange} />
          <input className={styles.cancel_range} type="button" value="cancel" onClick={() => setShowNewOrderingRange(false)} />
        </div>
      )}
      {!showNewOrderingRange && (
        <input
          className={styles.add_range}
          type="button"
          value="add ordering range"
          onClick={() => setShowNewOrderingRange(true)}
        />
      )}
    </div>
  );
};

export default HoursPage;
