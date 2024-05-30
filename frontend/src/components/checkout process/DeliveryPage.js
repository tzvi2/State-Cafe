import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { useCart } from '../../hooks/useCart';
import { formatIsoToTime, formatTimeTo12Hour } from '../../utils/timeUtilities';
import { filterTimeSlots } from '../../utils/timeSlotUtilities';
import styles from '../styles/checkout process styles/DeliveryPage.module.css';
import { bookTimeSlot } from '../../api/timeslotRequests';

function DeliveryPage() {
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const { cart } = useCart();
  const { setDeliverySlot, setUnitNumber, unitNumber, deliverySlot, setDeliveryDate, deliveryDate, phoneNumber, setPhoneNumber } = useDeliveryDetails();
  const [apartmentNumberError, setApartmentNumberError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
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
    if (deliveryDate !== "" && cart.totalCookTime > 0) {
      fetchTimeSlots(deliveryDate);
    }
  }, [deliveryDate, cart.totalCookTime]);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(`https://state-cafe.vercel.app/timeslots/available-timeslots?date=${deliveryDate}&totalCookTime=${cart.totalCookTime}`);
      if (!response.ok) throw new Error('Network response was not ok');

      const { availableTimeSlots } = await response.json();

      console.log('available timeslots: ', availableTimeSlots);

      // Map to create objects with both `time` and `displayTime`
      let fetchedSlots = availableTimeSlots.map(slot => ({
        time: slot,
        displayTime: timeFormatter.format(new Date(slot))
      }));

      // Apply the filterTimeSlots function to narrow down to 5-minute intervals
      fetchedSlots = filterTimeSlots(fetchedSlots);

      setAvailableTimeSlots(fetchedSlots);
      setDeliveryAvailable(fetchedSlots.length > 0);
    } catch (error) {
      setAvailableTimeSlots([]);
      setDeliveryAvailable(false);
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleSlotSelection = (e) => {
    setDeliverySlot(e.target.value);
  };

  const handleApartmentNumberChange = (e) => {
    setUnitNumber(e.target.value);
  };

  const handleSubmit = () => {
    let isValid = true;

    if (!unitNumber || unitNumber.length !== 3 || unitNumber < 201 || unitNumber > 558) {
      setApartmentNumberError('Apartment number should be 3 digits long.');
      isValid = false;
    } else {
      setApartmentNumberError('');
    }

    const phonePattern = /^(\d{3}[-\s]?){2}\d{4}$/;
    if (!phoneNumber || !phonePattern.test(phoneNumber)) {
      setPhoneNumberError('Phone number should contain 10 digits.');
      isValid = false;
    } else {
      setPhoneNumberError('');
    }

    if (isValid && unitNumber && deliverySlot && deliveryDate) {
      navigate('/payment');
    }
  };

  const isDaySelected = (dateStr) => deliveryDate === dateStr;

  return (
    <div className={styles.deliveryPage}>
      <h2>Delivery</h2>

      <div className={styles.errorRow}>
        {apartmentNumberError && <p className={styles.error}>{apartmentNumberError}</p>}
      </div>

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

      <div className={styles.errorRow}>
        {phoneNumberError && <p className={styles.error}>{phoneNumberError}</p>}
      </div>

      <div className={styles.flexRow}>
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="123-456-7890"
          pattern="^(\d{3}[-\s]?){2}\d{4}$"
          required
        />
      </div>

      <div className={styles.flexRow}>
        <button className={`${styles.day} ${isDaySelected(todayFormatted) ? styles.selected : ''}`} onClick={() => setDeliveryDate(todayFormatted)}>
          <span>Today</span> <span>{formatDateToMDYYYY(todayEST)}</span>
        </button>
        <button className={`${styles.day} ${isDaySelected(tomorrowFormatted) ? styles.selected : ''}`} onClick={() => setDeliveryDate(tomorrowFormatted)}>
          <span>Tomorrow</span> <span>{formatDateToMDYYYY(tomorrowEST)}</span>
        </button>
      </div>

      {deliveryDate !== "" && (
        <>
          {deliveryAvailable ? (
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
          ) : (
            <div style={{textAlign: "center"}}>Delivery not Available</div>
          )}

          <button className={styles.wideBtn} onClick={handleSubmit} disabled={!deliveryAvailable}>Proceed to Checkout</button>
        </>
      )}
    </div>
  );
}

export default DeliveryPage;
