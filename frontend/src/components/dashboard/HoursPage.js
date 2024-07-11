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
        //console.log("Open Hours: ", openHours);
      } catch (error) {
        console.error("Error fetching open hours:", error);
      }
    };

    fetchOpenHours();
  }, [selectedDate]);

  const handleSaveRange = async () => {
    try {
      //console.log("start", startTime, "end", endTime);
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

  return (
    <div className={styles.hours}>
      {openHours.length > 0 ? (
        openHours.map((range, index) => (
          <div key={index} className={styles.range}>
            <p className={styles.rangeHours}>{range.start} - {range.end}</p>
            <input className={styles.delete_range} type='button' value={"delete"} onClick={() => handleDeleteRange(range.start, range.end)} />
          </div>
        ))
      ) : (
        <p>No open times</p>
      )}

      {showNewRange && <div className={styles.newRange}>
        <div className={styles.times}>
          <input type='time' value={startTime} onChange={e => setStartTime(e.target.value)}></input>
          <input type='time' value={endTime} onChange={e => setEndTime(e.target.value)}></input>
        </div>
        <input className={styles.save_range} type='button' value={"save"} onClick={() => handleSaveRange()}></input>
        <input className={styles.cancel_range} type='button' value={"cancel"} onClick={() => setShowNewRange(false)}></input>
      </div>}
      {!showNewRange && <input className={styles.add_range} type='button' value={"add range"} onClick={() => setShowNewRange(!showNewRange)}></input>}
    </div>
  );
}

export default HoursPage;
