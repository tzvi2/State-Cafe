import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { useCart } from '../../hooks/useCart';
import { filterTimeSlots } from '../../utils/timeSlotUtilities';
import styles from '../styles/checkout process styles/DeliveryPage.module.css';
import Tooltip from './Tooltip';
import apiUrl from '../../config'

function DeliveryPage() {
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const { cart } = useCart();
  const { setDeliverySlot, setUnitNumber, unitNumber, deliverySlot, deliveryDate, phoneNumber, setPhoneNumber } = useDeliveryDetails();
  const [apartmentNumberError, setApartmentNumberError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const navigate = useNavigate();

  const timeFormatter = new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const fetchTimeSlots = useCallback(async () => {
    const url = `${apiUrl}/timeslots/available-timeslots?date=${deliveryDate}&totalCookTime=${cart.totalCookTime}`;
    console.log(`Fetching time slots from: ${url}, total cook time: ${cart.totalCookTime}`);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');

      const { availableTimeSlots } = await response.json();
      //console.log('Available timeslots fetched:', availableTimeSlots);

      let fetchedSlots = availableTimeSlots.map(slot => ({
        time: slot,
        displayTime: timeFormatter.format(new Date(slot))
      }));

      fetchedSlots = filterTimeSlots(fetchedSlots);

      setAvailableTimeSlots(fetchedSlots);
      setDeliveryAvailable(fetchedSlots.length > 0);
    } catch (error) {
      setAvailableTimeSlots([]);
      setDeliveryAvailable(false);
      console.error('There was a problem with the fetch operation:', error);
    }
  }, [deliveryDate]);

  useEffect(() => {
    
    if (deliveryDate !== "" && cart.totalCookTime > 0) {
      fetchTimeSlots();
    }
  }, [deliveryDate, cart.totalCookTime, fetchTimeSlots]);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSlotSelection = (e) => {
    setDeliverySlot(e.target.value);
  };

  const handleApartmentNumberChange = (e) => {
    setUnitNumber(e.target.value);
  };

  const handleSubmit = async () => {
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
          required

        />
      </div>

      {deliveryDate !== "" && (
        <>
          {deliveryAvailable ? (
            <select className={styles.wideBtn} value={deliverySlot} onChange={handleSlotSelection}>
              <option value="">Select a delivery time</option>
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
            <div style={{textAlign: "center"}}>Not available for selected date</div>
          )}

          <button className={styles.wideBtn} onClick={handleSubmit} disabled={!deliveryAvailable}>Proceed to Checkout</button>
        </>
      )}
    </div>
  );
}

export default DeliveryPage;
