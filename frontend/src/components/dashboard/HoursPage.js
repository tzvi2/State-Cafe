import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from '../styles/dashboard/HoursPage.module.css';
import { getOpenHours, addTimeSlot, removeTimeSlot } from '../../api/timeslotRequests';

const HoursPage = () => {
  const [selectedDate] = useOutletContext();
  const [openHours, setOpenHours] = useState([]);
  const [showNewRange, setShowNewRange] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchOpenHours = async () => {
      try {
        const openHours = await getOpenHours(selectedDate);
        setOpenHours(openHours);
      } catch (error) {
        console.error("Error fetching open hours:", error);
      }
    };

    fetchOpenHours();
  }, [selectedDate]);

  const handleSaveRange = async () => {
    try {
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

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hoursInt = parseInt(hours, 10);
    const amPm = hoursInt >= 12 ? 'pm' : 'am';
    const formattedHours = hoursInt % 12 || 12; // Convert 0 to 12 for midnight
    return `${formattedHours}:${minutes}${amPm}`;
  };

  return (
    <div className={styles.hours}>
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
              onClick={() => handleDeleteRange(range.start, range.end)}
            />
          </div>
        ))
      ) : (
        <p>No open times</p>
      )}

      {showNewRange && (
        <div className={styles.newRange}>
          <div className={styles.times}>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <input className={styles.save_range} type="button" value="save" onClick={() => handleSaveRange()} />
          <input className={styles.cancel_range} type="button" value="cancel" onClick={() => setShowNewRange(false)} />
        </div>
      )}
      {!showNewRange && (
        <input
          className={styles.add_range}
          type="button"
          value="add range"
          onClick={() => setShowNewRange(!showNewRange)}
        />
      )}
    </div>
  );
};

export default HoursPage;
