import React, { useState, useEffect } from 'react';
import styles from '../styles/dashboard/Dashboard.module.css'
import { getOpenHours, addTimeSlot, removeTimeSlot } from '../../api/timeslotRequests';

const Dashboard = () => {

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [openHours, setOpenHours] = useState([])
  const [showNewRange, setShowNewRange] = useState(false)
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  

  useEffect(() => {
    //console.log('selected date', selectedDate)
    
    const fetchOpenHours = async () => {
      try {
        const openHours = await getOpenHours(selectedDate)
        setOpenHours(openHours)
        console.log("Open Hours: ", openHours)
      } catch (error) {
        console.error("Error fetching open hours:", error);
      }
    }
    setOpenHours([])
    fetchOpenHours()
  }, [selectedDate])

  const handleSaveRange = async () => {
    try {
      console.log("start", startTime, "end", endTime)
      await addTimeSlot(selectedDate, startTime, endTime);
      const openHours = await getOpenHours(selectedDate);
      setOpenHours(openHours);
      setStartTime('');
      setEndTime('');
      setShowNewRange(false)
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
      <input className={styles.delete_range} type='button' value={"delete"}></input>
    </div>}
    <input type='button' value={"add range"} onClick={() => setShowNewRange(!showNewRange)}></input>
    </> 
  )
}

export default Dashboard