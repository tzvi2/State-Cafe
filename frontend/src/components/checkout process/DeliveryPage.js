import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { useCart } from '../../hooks/useCart';
import { formatIsoToTime, formatTimeTo12Hour } from '../../utils/timeUtilities';
import { filterTimeSlots } from '../../utils/timeSlotUtilities';
import styles from '../styles/checkout process styles/DeliveryPage.module.css'

function DeliveryPage() {
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const {cart} = useCart()
    const { setDeliverySlot, setUnitNumber, unitNumber, deliverySlot, setDeliveryDate, deliveryDate } = useDeliveryDetails();
    const navigate = useNavigate();

    const timeFormatter = new Intl.DateTimeFormat([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // date objects which get formatted and sent to endpoint
    function getESTDate() {
        const now = new Date();
        // Convert current date to UTC
        const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        // Convert UTC date to EST (UTC-5) -- Note: This does not handle daylight saving automatically
        const estDate = new Date(utcDate.getTime() - (5 * 60 * 60 * 1000));
        return estDate;
    }
    
    function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    
    function formatDateToMDYYYY(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // No padding, to avoid leading zeros
        const day = date.getDate(); // No padding, to avoid leading zeros
        return `${month}-${day}-${year}`;
    }
    
    // Calculate today and tomorrow in EST
    const todayEST = getESTDate();
    const tomorrowEST = new Date(todayEST);
    tomorrowEST.setDate(tomorrowEST.getDate() + 1);
    
    // Format dates
    const todayFormatted = formatDateToYYYYMMDD(todayEST);
    const tomorrowFormatted = formatDateToYYYYMMDD(tomorrowEST);

    useEffect(() => {
        console.log('delivery date: ', deliveryDate)
        if (deliveryDate !== "" && cart.totalCookTime > 0) {
            fetchTimeSlots(deliveryDate);
        }
        
    }, [deliveryDate, cart.totalCookTime]); // Dependency array includes selectedDate to re-fetch when it changes. // Do not Re-fetch when totalCookTime changes, because any time this page reloads (which would have to happen for there to be a new totalCookTime), this useEffect runs again.

  
    const fetchTimeSlots = async () => {
        try {
            const response = await fetch(`https://state-cafe.vercel.app/timeslots/available-timeslots?date=${deliveryDate}&totalCookTime=${cart.totalCookTime}`);
            if (!response.ok) throw new Error('Network response was not ok');
    
            const { availableTimeSlots } = await response.json();
    
            // Map to create objects with both `time` and `displayTime`
            let fetchedSlots = availableTimeSlots.map(slot => ({
                time: slot,
                displayTime: timeFormatter.format(new Date(slot))
            }));
    
            // Apply the filterTimeSlots function to narrow down to 5-minute intervals
            fetchedSlots = filterTimeSlots(fetchedSlots);
    
            setAvailableTimeSlots(fetchedSlots);
        } catch (error) {
            setAvailableTimeSlots([])
            console.error('There was a problem with the fetch operation:', error);
        }
    };
    

    const handleSlotSelection = (e) => {
        // The value is the ISO time string for accurate timestamp selection
        setDeliverySlot(e.target.value);
    };

    const handleApartmentNumberChange = (e) => {
        setUnitNumber(e.target.value);
    };

    
    

    const handleSubmit = () => {
        if (unitNumber && deliverySlot && deliveryDate) {
            navigate('/payment');
        } else {
            alert('Please select both your apartment number and a delivery slot.');
        }
    };

    const isDaySelected = (dateStr) => deliveryDate === dateStr;

    return (
        <div className={styles.deliveryPage}>
            <h2>Delivery</h2>

            <div className={styles.flexRow}>
                <label htmlFor="apartmentNumber">Apartment:</label>
                <input
                    type="number"
                    pattern="[0-9]*"
                    id="apartmentNumber"
                    value={unitNumber}
                    min={200}
                    max={599}
                    onChange={handleApartmentNumberChange}
                />
            </div>

            <div className={styles.flexRow}>
                <button className={`${styles.day} ${isDaySelected(todayFormatted) ? styles.selected : ''}`} onClick={() => setDeliveryDate(todayFormatted)}>
                    <span>Today</span> {formatDateToMDYYYY(todayEST)}
                </button>
                <button className={`${styles.day} ${isDaySelected(tomorrowFormatted) ? styles.selected : ''}`} onClick={() => setDeliveryDate(tomorrowFormatted)}>
                    <span>Tomorrow</span> {formatDateToMDYYYY(tomorrowEST)}
                </button>
            </div>

            {deliveryDate !== "" && (
                <>
                    <select className={styles.wideBtn} value={deliverySlot} onChange={handleSlotSelection}>
                        <option value="">Select a time</option>
                        {availableTimeSlots.map(slot => (
                            <option 
                                key={slot.time} 
                                value={slot.time}
                                className={slot.displayTime.endsWith('AM') ? styles.morningHours : styles.eveningHours}
                            >
                            {slot.displayTime}
                            </option>
                        ))}
                    </select>

                    <button className={styles.wideBtn} onClick={handleSubmit}>Proceed to Checkout</button>
                </>
            )}
        </div>
    );
}

export default DeliveryPage;
